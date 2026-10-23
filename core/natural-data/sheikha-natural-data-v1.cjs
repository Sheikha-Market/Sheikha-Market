'use strict';

const { createHash } = require('node:crypto');

const LIMITS = Object.freeze({ sources: 16, observations: 256 });
const DOMAINS = ['solar', 'lunar', 'planetary', 'earth', 'atmosphere'];
const KINDS = ['synthetic', 'model_output', 'observation_import'];
const METRICS = {
  solar_irradiance: { domain: 'solar', unit: 'W/m2', min: 0, max: 1e9, units: { 'W/m2': [1, 0], 'kW/m2': [1000, 0] } },
  lunar_illuminated_fraction: { domain: 'lunar', unit: 'fraction', min: 0, max: 1, units: { fraction: [1, 0], '%': [0.01, 0] } },
  planetary_distance: { domain: 'planetary', unit: 'm', min: 0, max: 1e18, units: { m: [1, 0], km: [1000, 0] } },
  earth_elevation: { domain: 'earth', unit: 'm', min: -1e6, max: 1e6, units: { m: [1, 0], km: [1000, 0] } },
  air_temperature: { domain: 'atmosphere', unit: 'K', min: 0, max: 1e6, units: { K: [1, 0], degC: [1, 273.15] } },
  air_pressure: { domain: 'atmosphere', unit: 'Pa', min: 0, max: 1e9, units: { Pa: [1, 0], hPa: [100, 0] } }
};

const ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,63}$/;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SOURCE_KEYS = ['id', 'domain', 'kind', 'referenceId', 'contextId'];
const OBSERVATION_KEYS = ['sourceId', 'metric', 'observedAt', 'value', 'unit'];

function reject(code) {
  throw new Error(`NATURAL_DATA_${code}`);
}

// Accept JSON-shaped data only; do not invoke getters or custom serialization.
function record(value, keys) {
  if (!value || typeof value !== 'object' ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) reject('INVALID_OBJECT');
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.length !== keys.length || ownKeys.some(key => !keys.includes(key))) reject('INVALID_FIELDS');
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) reject('INVALID_FIELDS');
  }
}

function boundedArray(value, max) {
  if (!Array.isArray(value) || value.length < 1 || value.length > max) reject('INVALID_BATCH_SIZE');
  if (Reflect.ownKeys(value).length !== value.length + 1) reject('INVALID_ARRAY');
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) reject('INVALID_ARRAY');
  }
}

function identifier(value) {
  if (typeof value !== 'string' || !ID.test(value)) reject('INVALID_IDENTIFIER');
  return value;
}

function utcMillis(value) {
  if (typeof value !== 'string' || !UTC.test(value)) reject('INVALID_TIME');
  const ms = Date.parse(value);
  if (!Number.isFinite(ms) || new Date(ms).toISOString() !== value) reject('INVALID_TIME');
  return ms;
}

function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function getNaturalDataInputSchema() {
  const id = { type: 'string', pattern: ID.source, minLength: 1, maxLength: 64 };
  const time = { type: 'string', pattern: UTC.source, minLength: 24, maxLength: 24 };
  return {
    type: 'object', additionalProperties: false,
    required: ['schemaVersion', 'asOf', 'sources', 'observations'],
    properties: {
      schemaVersion: { type: 'integer', const: 1 },
      asOf: time,
      sources: {
        type: 'array', minItems: 1, maxItems: LIMITS.sources,
        items: {
          type: 'object', additionalProperties: false, required: [...SOURCE_KEYS],
          properties: {
            id, domain: { type: 'string', enum: [...DOMAINS] },
            kind: { type: 'string', enum: [...KINDS] }, referenceId: id, contextId: id
          }
        }
      },
      observations: {
        type: 'array', minItems: 1, maxItems: LIMITS.observations,
        items: {
          type: 'object', additionalProperties: false, required: [...OBSERVATION_KEYS],
          properties: {
            sourceId: id, metric: { type: 'string', enum: Object.keys(METRICS) },
            observedAt: time, value: { type: 'number' },
            unit: { type: 'string', enum: [...new Set(Object.values(METRICS).flatMap(metric => Object.keys(metric.units)))] }
          }
        }
      }
    }
  };
}

function processNaturalData(input) {
  record(input, ['schemaVersion', 'asOf', 'sources', 'observations']);
  if (input.schemaVersion !== 1) reject('UNSUPPORTED_VERSION');
  const asOfMs = utcMillis(input.asOf);
  boundedArray(input.sources, LIMITS.sources);
  boundedArray(input.observations, LIMITS.observations);

  const sourceMap = new Map();
  const sources = input.sources.map(source => {
    record(source, SOURCE_KEYS);
    const id = identifier(source.id);
    if (sourceMap.has(id)) reject('DUPLICATE_SOURCE');
    if (!DOMAINS.includes(source.domain) || !KINDS.includes(source.kind)) reject('INVALID_SOURCE');
    const declaration = {
      id, domain: source.domain, kind: source.kind,
      referenceId: identifier(source.referenceId), contextId: identifier(source.contextId)
    };
    sourceMap.set(id, declaration);
    return declaration;
  });

  const unique = new Map();
  const validatedObservations = [];
  input.observations.forEach((observation, inputIndex) => {
    record(observation, OBSERVATION_KEYS);
    const sourceId = identifier(observation.sourceId);
    const source = sourceMap.get(sourceId);
    if (!source) reject('UNKNOWN_SOURCE');
    if (typeof observation.metric !== 'string' || !Object.hasOwn(METRICS, observation.metric)) reject('UNKNOWN_METRIC');
    const metric = METRICS[observation.metric];
    if (metric.domain !== source.domain) reject('DOMAIN_MISMATCH');
    if (typeof observation.unit !== 'string' || !Object.hasOwn(metric.units, observation.unit)) reject('UNIT_MISMATCH');
    if (typeof observation.value !== 'number' || !Number.isFinite(observation.value)) reject('INVALID_VALUE');
    const observedMs = utcMillis(observation.observedAt);
    if (observedMs > asOfMs) reject('FUTURE_OBSERVATION');
    const [scale, offset] = metric.units[observation.unit];
    const converted = observation.value * scale + offset;
    if (!Number.isFinite(converted) || converted < metric.min || converted > metric.max) reject('VALUE_OUT_OF_RANGE');
    const value = Object.is(converted, -0) ? 0 : converted;
    validatedObservations.push({
      sourceId, metric: observation.metric, observedAt: observation.observedAt,
      value: observation.value, unit: observation.unit
    });
    const key = JSON.stringify([sourceId, observation.metric, observation.observedAt]);
    const previous = unique.get(key);
    if (previous) {
      if (previous.value !== value) reject('CONFLICTING_DUPLICATE');
      previous.inputIndexes.push(inputIndex);
      return;
    }
    unique.set(key, {
      sourceId, metric: observation.metric, observedAt: observation.observedAt,
      value, unit: metric.unit, ageSeconds: (asOfMs - observedMs) / 1000,
      inputIndexes: [inputIndex]
    });
  });

  const readings = [...unique.values()];
  const groups = new Map();
  for (const reading of readings) {
    const key = JSON.stringify([reading.sourceId, reading.metric]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(reading);
  }
  // Never combine different sources/contexts or treat a sample mean as an integral.
  const summaries = [...groups.values()].map(group => {
    const values = group.map(reading => reading.value);
    const times = group.map(reading => reading.observedAt).sort();
    return {
      sourceId: group[0].sourceId, metric: group[0].metric, unit: group[0].unit,
      count: group.length, min: Math.min(...values), max: Math.max(...values),
      sampleMean: values.reduce((sum, value) => sum + value, 0) / group.length,
      firstObservedAt: times[0], lastObservedAt: times[times.length - 1]
    };
  });
  const validatedInput = { schemaVersion: 1, asOf: input.asOf, sources, observations: validatedObservations };
  return {
    system: 'SHEIKHA_NATURAL_DATA_V1',
    mode: 'LOCAL_IMPORT_PROCESSING_ONLY',
    status: 'LOCAL_BATCH_PROCESSED',
    asOf: input.asOf,
    sources: sources.map(source => ({
      ...source, authenticity: 'UNVERIFIED', calibration: 'NOT_VERIFIED',
      connection: 'NOT_CONFIGURED',
      hasReadings: readings.some(reading => reading.sourceId === source.id)
    })),
    readings, summaries,
    counts: { submitted: input.observations.length, unique: readings.length, duplicates: input.observations.length - readings.length },
    provenance: {
      declarations: 'CALLER_SUPPLIED_NOT_AUTHENTICATED',
      asOfClock: 'CALLER_SUPPLIED_NOT_TRUSTED',
      digestPurpose: 'CONTENT_INTEGRITY_NOT_SOURCE_AUTHENTICATION',
      validatedInputSha256: digest(validatedInput),
      normalizedContentSha256: digest({ schemaVersion: 1, asOf: input.asOf, sources, readings, summaries })
    },
    boundaries: {
      networkAccessPerformed: false, persistentStateWritten: false,
      physicalCommandSent: false, modelInferencePerformed: false,
      liveSensorVerified: false, productionReady: false,
      astronomyCalculated: false, allSourcesConnected: false
    }
  };
}

module.exports = { processNaturalData, getNaturalDataInputSchema };
