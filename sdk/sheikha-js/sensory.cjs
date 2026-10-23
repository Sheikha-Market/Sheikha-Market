'use strict';

const { createHash } = require('node:crypto');
const { SensoryHub, validateConfig, narrative } = require('../../core/sensors/sheikha-sensory-hub-v1');
const config = validateConfig(require('../../config/sheikha-sensory-hub.v1.json'));
const FIELDS = ['sourceId', 'sequence', 'observedAt', 'value', 'unit', 'quality', 'calibration', 'uncertainty'];
const TEXT_FIELDS = ['sourceId', 'observedAt', 'unit', 'quality', 'calibration'];
const MAX_BYTES = 512 * 1024;
const reject = () => { throw new Error('SENSORY_ARGUMENTS_DENIED'); };

// SDK callers may supply objects directly; reject accessors before serializing anything.
function record(value, fields) {
  if (!value || typeof value !== 'object' ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) reject();
  const keys = Reflect.ownKeys(value);
  if (keys.length !== fields.length || keys.some(key => !fields.includes(key))) reject();
  const copy = {};
  for (const key of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) reject();
    copy[key] = descriptor.value;
  }
  return copy;
}

function inputCopy(input) {
  const args = record(input, ['batch', 'language']);
  if (!['ar', 'en'].includes(args.language)) reject();
  const batch = record(args.batch, ['schemaVersion', 'tenantId', 'observations']);
  if (batch.schemaVersion !== 1 || batch.tenantId !== config.tenantId) reject();
  const items = batch.observations;
  if (!Array.isArray(items) || items.length < 1 || items.length > 500 ||
      Reflect.ownKeys(items).length !== items.length + 1) reject();
  const observations = [];
  for (let index = 0; index < items.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(items, String(index));
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) reject();
    const item = record(descriptor.value, FIELDS);
    if (TEXT_FIELDS.some(key => typeof item[key] !== 'string' || item[key].length > 64) ||
        !Number.isFinite(item.sequence) || !Number.isFinite(item.value) ||
        !(item.uncertainty === null || Number.isFinite(item.uncertainty))) reject();
    observations.push(item);
  }
  return { batch: { schemaVersion: 1, tenantId: config.tenantId, observations }, language: args.language };
}

function getSensoryInputSchema() {
  return {
    type: 'object', additionalProperties: false, required: ['batch', 'language'],
    properties: {
      language: { type: 'string', enum: ['ar', 'en'] },
      batch: {
        type: 'object', additionalProperties: false,
        required: ['schemaVersion', 'tenantId', 'observations'],
        properties: {
          schemaVersion: { type: 'integer', const: 1 },
          tenantId: { type: 'string', const: config.tenantId },
          observations: {
            type: 'array', minItems: 1, maxItems: 500,
            items: {
              type: 'object', additionalProperties: false, required: [...FIELDS],
              properties: {
                sourceId: { type: 'string', enum: config.sources.map(source => source.id) },
                sequence: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER },
                observedAt: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$', minLength: 24, maxLength: 24 },
                value: { type: 'number', minimum: -1e12, maximum: 1e12 },
                unit: { type: 'string', enum: ['Cel', 'K', '[degF]', '%RH', 'Pa', 'kPa', 'bar', 'W', 'kW', 'W/m2'] },
                quality: { type: 'string', enum: ['VALID', 'SUSPECT', 'INVALID'] },
                calibration: { type: 'string', enum: ['CURRENT', 'EXPIRED', 'UNKNOWN'] },
                uncertainty: { anyOf: [{ type: 'null' }, { type: 'number', minimum: 0, maximum: 1e12 }] }
              }
            }
          }
        }
      }
    }
  };
}

function interpretSensorBatch(input) {
  const args = inputCopy(input);
  const serialized = JSON.stringify(args);
  if (Buffer.byteLength(serialized, 'utf8') > MAX_BYTES) reject();
  const hub = new SensoryHub(config, { tenantId: config.tenantId, origin: 'IMPORTED_UNVERIFIED' });
  const snapshot = hub.ingest(args.batch);
  return {
    schema: 'SHEIKHA_SENSORY_SDK_V1',
    mode: 'CALLER_SUPPLIED_READ_ONLY_INTERPRETATION',
    language: args.language,
    snapshot,
    explanations: snapshot.sources.map(source => ({ sourceId: source.id, text: narrative(source, args.language) })),
    provenance: {
      normalizedArgumentsSha256: createHash('sha256').update(serialized).digest('hex'),
      digestPurpose: 'CONTENT_INTEGRITY_NOT_SOURCE_AUTHENTICATION',
      evaluatedClock: 'LOCAL_PROCESS_WALL_CLOCK_NOT_INDEPENDENTLY_VERIFIED',
      callerSource: 'UNVERIFIED',
      replayProtectionScope: 'WITHIN_THIS_REQUEST_ONLY'
    },
    boundaries: {
      networkAccessPerformed: false, persistentStateWritten: false,
      physicalCommandSent: false, modelInferencePerformed: false,
      liveSensorVerified: false, productionReady: false,
      crossRequestReplayProtection: false
    }
  };
}

module.exports = { interpretSensorBatch, getSensoryInputSchema };
