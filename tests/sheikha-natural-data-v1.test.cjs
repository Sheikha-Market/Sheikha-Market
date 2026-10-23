'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const { processNaturalData, getNaturalDataInputSchema } = require('../core/natural-data/sheikha-natural-data-v1.cjs');
const { createSheikhaClient } = require('../sdk/sheikha-js');
const example = require('../docs/examples/sheikha-natural-data.synthetic.json');
const batch = () => structuredClone(example);

function invalid(change, code) {
  const input = batch();
  change(input);
  assert.throws(() => processNaturalData(input), { message: `NATURAL_DATA_${code}` });
}

test('SDK processes all five domains and six metrics with explicit unverified provenance', () => {
  const result = createSheikhaClient().processNaturalData(batch());
  assert.equal(result.status, 'LOCAL_BATCH_PROCESSED');
  assert.equal(result.mode, 'LOCAL_IMPORT_PROCESSING_ONLY');
  assert.equal(result.sources.length, 5);
  assert.equal(result.summaries.length, 6);
  assert.deepEqual(result.counts, { submitted: 7, unique: 7, duplicates: 0 });
  assert.ok(result.sources.every(source => source.kind === 'synthetic' && source.authenticity === 'UNVERIFIED' && source.connection === 'NOT_CONFIGURED'));
  assert.ok(Object.values(result.boundaries).every(value => value === false));
  assert.equal(result.provenance.declarations, 'CALLER_SUPPLIED_NOT_AUTHENTICATED');
  assert.equal(result.provenance.asOfClock, 'CALLER_SUPPLIED_NOT_TRUSTED');
});

test('unit conversion preserves physical quantities and calculates a sample mean only', () => {
  const result = processNaturalData(batch());
  assert.deepEqual(result.readings.map(reading => reading.value), [500, 700, 0.5, 75000000000, 25, 298.15, 101325]);
  assert.deepEqual(result.readings.map(reading => reading.unit), ['W/m2', 'W/m2', 'fraction', 'm', 'm', 'K', 'Pa']);
  assert.deepEqual(result.summaries[0], {
    sourceId: 'demo-solar', metric: 'solar_irradiance', unit: 'W/m2', count: 2,
    min: 500, max: 700, sampleMean: 600,
    firstObservedAt: '2026-10-18T11:00:00.000Z', lastObservedAt: '2026-10-18T11:30:00.000Z'
  });
  assert.equal(result.readings[0].ageSeconds, 3600);
});

test('sources, contexts and data kinds never get blended into one statistic', () => {
  const input = batch();
  input.sources.push({ ...input.sources[0], id: 'second-solar', kind: 'observation_import', contextId: 'another-plane' });
  input.observations.push({ ...input.observations[0], sourceId: 'second-solar', value: 1 });
  const result = processNaturalData(input);
  assert.equal(result.summaries.length, 7);
  assert.equal(result.summaries.find(group => group.sourceId === 'second-solar').sampleMean, 1000);
  assert.equal(result.summaries[0].sampleMean, 600);
  assert.equal(result.sources.at(-1).authenticity, 'UNVERIFIED');
  input.sources.at(-1).kind = 'model_output';
  assert.equal(processNaturalData(input).boundaries.modelInferencePerformed, false);
});

test('exact normalized duplicates retain input lineage without double counting', () => {
  const input = batch();
  input.observations.push({ ...input.observations[0], value: 500, unit: 'W/m2' });
  const result = processNaturalData(input);
  assert.deepEqual(result.counts, { submitted: 8, unique: 7, duplicates: 1 });
  assert.deepEqual(result.readings[0].inputIndexes, [0, 7]);
  assert.equal(result.summaries[0].sampleMean, 600);
  input.observations.at(-1).value = 501;
  assert.throws(() => processNaturalData(input), { message: 'NATURAL_DATA_CONFLICTING_DUPLICATE' });
});

test('reordered observations preserve chronological summary limits', () => {
  const input = batch();
  input.observations.reverse();
  const summary = processNaturalData(input).summaries.find(group => group.metric === 'solar_irradiance');
  assert.equal(summary.firstObservedAt, example.observations[0].observedAt);
  assert.equal(summary.lastObservedAt, example.observations[1].observedAt);
});

test('all invalid timestamps and future observations are rejected', () => {
  for (const observedAt of ['2026-02-30T00:00:00.000Z', '2026-10-18', '2026-10-18T11:00:00+03:00', '2026-10-18T11:00:60.000Z', null, 0]) {
    invalid(input => { input.observations[0].observedAt = observedAt; }, 'INVALID_TIME');
  }
  invalid(input => { input.asOf = 'not-a-time'; }, 'INVALID_TIME');
  invalid(input => { input.observations[0].observedAt = '2026-10-18T12:00:00.001Z'; }, 'FUTURE_OBSERVATION');
});

test('historical data remain historical, without a fabricated freshness guarantee', () => {
  const input = batch();
  input.observations[0].observedAt = '2025-10-18T11:00:00.000Z';
  const result = processNaturalData(input);
  assert.ok(result.readings[0].ageSeconds > 86400);
  assert.equal(result.provenance.asOfClock, 'CALLER_SUPPLIED_NOT_TRUSTED');
  assert.equal(result.boundaries.liveSensorVerified, false);
});

test('source identity, metric-domain binding and unit dimensions are checked', () => {
  invalid(input => { input.observations[0].sourceId = 'missing'; }, 'UNKNOWN_SOURCE');
  invalid(input => { input.sources.push(input.sources[0]); }, 'DUPLICATE_SOURCE');
  invalid(input => { input.sources[0].domain = 'planetary'; }, 'DOMAIN_MISMATCH');
  invalid(input => { input.sources[0].kind = 'verified'; }, 'INVALID_SOURCE');
  invalid(input => { input.sources[0].domain = 'all'; }, 'INVALID_SOURCE');
  for (const metric of ['toString', '__proto__', 'unknown']) {
    invalid(input => { input.observations[0].metric = metric; }, 'UNKNOWN_METRIC');
  }
  for (const unit of ['kWh/m2', 'degC', 'toString', '__proto__']) {
    invalid(input => { input.observations[0].unit = unit; }, 'UNIT_MISMATCH');
  }
});

test('non-finite, coerced, out-of-range and overflowing values are rejected', () => {
  for (const value of [NaN, Infinity, -Infinity, '500', null, true]) {
    invalid(input => { input.observations[0].value = value; }, 'INVALID_VALUE');
  }
  for (const value of [-1, Number.MAX_VALUE]) {
    invalid(input => { input.observations[0].value = value; }, 'VALUE_OUT_OF_RANGE');
  }
  invalid(input => { input.observations[2].value = 101; }, 'VALUE_OUT_OF_RANGE');
  invalid(input => { input.observations[5].value = -273.16; }, 'VALUE_OUT_OF_RANGE');
  const input = batch();
  input.observations[5].value = -273.15;
  assert.equal(processNaturalData(input).readings[5].value, 0);
});

test('batches are bounded and cannot be empty, sparse or have array side channels', () => {
  for (const field of ['sources', 'observations']) {
    for (const value of [[], null, {}, new Array(2)]) {
      invalid(input => { input[field] = value; }, Array.isArray(value) && value.length ? 'INVALID_ARRAY' : 'INVALID_BATCH_SIZE');
    }
    invalid(input => { input[field].token = 'secret'; }, 'INVALID_ARRAY');
  }
  invalid(input => { input.sources = Array(17).fill(input.sources[0]); }, 'INVALID_BATCH_SIZE');
  invalid(input => { input.observations = Array(257).fill(input.observations[0]); }, 'INVALID_BATCH_SIZE');
  const input = batch();
  input.observations = Array.from({ length: 256 }, () => ({ ...input.observations[0] }));
  assert.equal(processNaturalData(input).counts.duplicates, 255);
});

test('unknown fields, credentials, URLs, permissions and custom prototypes cannot expand scope', () => {
  for (const extra of ['url', 'filePath', 'token', 'authorityGranted', 'productionEnabled', 'religion']) {
    invalid(input => { input[extra] = 'do-not-echo'; }, 'INVALID_FIELDS');
    invalid(input => { input.sources[0][extra] = 'do-not-echo'; }, 'INVALID_FIELDS');
    invalid(input => { input.observations[0][extra] = 'do-not-echo'; }, 'INVALID_FIELDS');
  }
  for (const id of ['', 'https://example.invalid', '/etc/passwd', 'a'.repeat(65), 'abc\n']) {
    invalid(input => { input.sources[0].referenceId = id; }, 'INVALID_IDENTIFIER');
  }
  for (const input of [undefined, null, [], true, new Date(), Object.create(example)]) {
    assert.throws(() => processNaturalData(input), { message: 'NATURAL_DATA_INVALID_OBJECT' });
  }
  invalid(input => { input.schemaVersion = 2; }, 'UNSUPPORTED_VERSION');
  invalid(input => { input[Symbol('secret')] = 1; }, 'INVALID_FIELDS');
});

test('getters and custom serialization are rejected before execution', () => {
  let invoked = false;
  const input = batch();
  Object.defineProperty(input.observations[0], 'value', { enumerable: true, get() { invoked = true; return 500; } });
  assert.throws(() => processNaturalData(input), { message: 'NATURAL_DATA_INVALID_FIELDS' });
  assert.equal(invoked, false);
  const input2 = batch();
  input2.toJSON = () => { invoked = true; return example; };
  assert.throws(() => processNaturalData(input2), { message: 'NATURAL_DATA_INVALID_FIELDS' });
  assert.equal(invoked, false);
});

test('content digests are reproducible, sensitive to provenance, and not authentication', () => {
  const input = batch();
  const before = JSON.stringify(input);
  const first = processNaturalData(input);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(first, processNaturalData(input));
  assert.match(first.provenance.validatedInputSha256, /^[a-f0-9]{64}$/);
  assert.equal(first.provenance.validatedInputSha256, createHash('sha256').update(JSON.stringify(input)).digest('hex'));
  input.sources[0].contextId = 'another-context';
  const changed = processNaturalData(input);
  assert.notEqual(first.provenance.validatedInputSha256, changed.provenance.validatedInputSha256);
  assert.notEqual(first.provenance.normalizedContentSha256, changed.provenance.normalizedContentSha256);
  assert.equal(changed.provenance.digestPurpose, 'CONTENT_INTEGRITY_NOT_SOURCE_AUTHENTICATION');
});

test('result and schema mutation cannot affect later calls', () => {
  const expected = processNaturalData(batch());
  const result = processNaturalData(batch());
  result.sources[0].domain = 'all';
  result.readings[0].value = 0;
  result.boundaries.productionReady = true;
  const schema = getNaturalDataInputSchema();
  schema.properties.sources.items.required.push('token');
  schema.properties.observations.items.properties.metric.enum.push('custom');
  assert.deepEqual(processNaturalData(batch()), expected);
  assert.equal(getNaturalDataInputSchema().properties.sources.items.required.includes('token'), false);
  assert.equal(getNaturalDataInputSchema().properties.observations.items.properties.metric.enum.includes('custom'), false);
});

test('schema exposes closed bounded contracts while unused sources remain unconnected', () => {
  const schema = getNaturalDataInputSchema();
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.sources.maxItems, 16);
  assert.equal(schema.properties.observations.maxItems, 256);
  assert.equal(schema.properties.sources.items.additionalProperties, false);
  assert.equal(schema.properties.observations.items.additionalProperties, false);
  const input = batch();
  input.sources.push({ ...input.sources[0], id: 'unused' });
  const result = processNaturalData(input);
  assert.equal(result.sources.at(-1).hasReadings, false);
  assert.equal(result.sources.at(-1).connection, 'NOT_CONFIGURED');
});

test('processing runs with crypto only and without filesystem, network, process or clock access', () => {
  const module = { exports: {} };
  const context = vm.createContext({
    module, inputJson: JSON.stringify(example),
    require(name) {
      assert.equal(name, 'node:crypto');
      return { createHash };
    }
  });
  const source = fs.readFileSync(path.resolve(__dirname, '../core/natural-data/sheikha-natural-data-v1.cjs'), 'utf8');
  vm.runInContext('Date.now = () => { throw new Error("Clock access denied"); };', context);
  vm.runInContext(source, context, { timeout: 1000 });
  const result = vm.runInContext('module.exports.processNaturalData(JSON.parse(inputJson))', context, { timeout: 1000 });
  assert.equal(result.status, 'LOCAL_BATCH_PROCESSED');
  assert.equal(result.boundaries.networkAccessPerformed, false);
});
