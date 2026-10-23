'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { SensoryHub, narrative } = require('../core/sensors/sheikha-sensory-hub-v1');
const { interpretSensorBatch, getSensoryInputSchema } = require('../sdk/sheikha-js/sensory.cjs');
const { createSheikhaClient } = require('../sdk/sheikha-js');
const config = require('../config/sheikha-sensory-hub.v1.json');
const NOW = Date.parse('2026-10-19T12:00:00.000Z');
const clone = value => JSON.parse(JSON.stringify(value));
function input(extra = {}) {
  return {
    language: 'ar',
    batch: {
      schemaVersion: 1, tenantId: config.tenantId,
      observations: [{ sourceId: 'ENV-TEMP-01', sequence: 1, observedAt: '2020-01-01T00:00:00.000Z',
        value: 77, unit: '[degF]', quality: 'VALID', calibration: 'CURRENT', uncertainty: 0.18 }]
    },
    ...extra
  };
}

test('SDK entrypoint uses exactly the observatory core and produces both languages', t => {
  t.mock.method(Date, 'now', () => NOW);
  for (const language of ['ar', 'en']) {
    const args = input({ language });
    const result = createSheikhaClient().interpretSensorBatch(args);
    const expected = new SensoryHub(config, { tenantId: config.tenantId, origin: 'IMPORTED_UNVERIFIED' }).ingest(args.batch, NOW);
    assert.deepEqual(result.snapshot, expected);
    assert.deepEqual(result.explanations, expected.sources.map(source => ({ sourceId: source.id, text: narrative(source, language) })));
    assert.equal(result.snapshot.sources[0].status, 'STALE');
    assert.equal(result.snapshot.sources[5].status, 'MISSING');
    assert.equal(result.snapshot.productionApproved, false);
    assert.equal(result.snapshot.authenticatedDevice, false);
    assert.ok(Object.values(result.boundaries).every(value => value === false));
    assert.match(result.provenance.normalizedArgumentsSha256, /^[a-f0-9]{64}$/);
  }
});

test('SDK denies authority, URLs, file paths, secrets, origin and caller clock overrides', () => {
  for (const value of [null, undefined, [], false, 'batch', {}, input({ language: 'fr' }),
    input({ token: 'SECRET_SENTINEL' }), input({ endpoint: 'https://example.invalid' }),
    input({ path: '/etc/passwd' }), input({ productionReady: true }),
    input({ origin: 'LIVE_VERIFIED' }), input({ asOf: new Date(NOW).toISOString() })]) {
    assert.throws(() => interpretSensorBatch(value), /^Error: SENSORY_ARGUMENTS_DENIED$/);
  }
});

test('direct SDK objects cannot invoke getters or serialization hooks', () => {
  let invoked = 0;
  const getter = () => { invoked += 1; throw Error('MUST_NOT_CALL'); };
  const accessor = input();
  Object.defineProperty(accessor, 'batch', { enumerable: true, get: getter });
  const nested = input();
  Object.defineProperty(nested.batch.observations[0], 'value', { enumerable: true, get: getter });
  const arrayAccessor = input();
  Object.defineProperty(arrayAccessor.batch.observations, '0', { enumerable: true, get: getter });
  const customUnit = input(); customUnit.batch.observations[0].unit = { toJSON: getter };
  const symbol = input(); symbol[Symbol('authority')] = true;
  const nonEnumerable = input(); Object.defineProperty(nonEnumerable, 'token', { value: 'SECRET_SENTINEL' });
  for (const args of [accessor, nested, arrayAccessor, customUnit, symbol, nonEnumerable, input({ toJSON: getter })]) {
    assert.throws(() => interpretSensorBatch(args), /SENSORY_ARGUMENTS_DENIED/);
  }
  assert.equal(invoked, 0);
});

test('bounds arrays and validates source, tenant, sequence, units and time through the core', () => {
  const invalid = [];
  const batch = mutate => { const args = input(); mutate(args.batch); invalid.push(args); };
  batch(b => { b.tenantId = 'another'; });
  batch(b => { b.observations = []; });
  batch(b => { b.observations = Array(501).fill(b.observations[0]); });
  batch(b => { b.observations = Array(1); });
  batch(b => { b.observations.extra = true; });
  for (const update of [{ sourceId: 'UNKNOWN' }, { unit: ['Cel'] }, { unit: 'bar' },
    { sequence: -1 }, { value: Infinity }, { value: '25' }, { uncertainty: -1 },
    { observedAt: '9999-01-01T00:00:00.000Z' }, { observedAt: '2026-02-30T00:00:00.000Z' },
    { command: 'OPEN_VALVE' }, { quality: 'SAFE' }]) {
    batch(b => Object.assign(b.observations[0], update));
  }
  batch(b => { b.observations.push(clone(b.observations[0])); });
  for (const args of invalid) assert.throws(() => interpretSensorBatch(args));
});

test('quality and unknown uncertainty cannot become a normal reference assessment', t => {
  t.mock.method(Date, 'now', () => NOW);
  for (const update of [{ quality: 'INVALID' }, { quality: 'SUSPECT' }, { calibration: 'EXPIRED' }, { uncertainty: null }]) {
    const args = input(); Object.assign(args.batch.observations[0], { observedAt: new Date(NOW).toISOString() }, update);
    const result = interpretSensorBatch(args);
    assert.equal(result.snapshot.sources[0].comparison, null);
    assert.notEqual(result.snapshot.sources[0].status, 'WITHIN');
  }
});

test('requests are stateless, defensively copied and disclose replay boundary', t => {
  t.mock.method(Date, 'now', () => NOW);
  const args = input(), before = clone(args), expected = interpretSensorBatch(args);
  const changed = interpretSensorBatch(args);
  changed.snapshot.sources[0].latest.value = 999;
  changed.snapshot.origin = 'LIVE_VERIFIED';
  assert.deepEqual(args, before);
  assert.deepEqual(interpretSensorBatch(args), expected);
  assert.equal(expected.provenance.replayProtectionScope, 'WITHIN_THIS_REQUEST_ONLY');
  assert.equal(expected.boundaries.crossRequestReplayProtection, false);
  const bad = input(); bad.batch.observations.push(clone(bad.batch.observations[0]));
  assert.throws(() => interpretSensorBatch(bad), /REPLAY_OR_REORDER_DENIED/);
  assert.deepEqual(interpretSensorBatch(args), expected);
});

test('input schema is bounded and detached; metadata cannot enable network or actuation', () => {
  const schema = getSensoryInputSchema(), original = clone(schema);
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.batch.additionalProperties, false);
  assert.equal(schema.properties.batch.properties.observations.items.additionalProperties, false);
  assert.equal(schema.properties.batch.properties.observations.maxItems, 500);
  schema.properties.batch.properties.observations.items.properties.sourceId.enum.push('INJECTED');
  assert.deepEqual(getSensoryInputSchema(), original);
});

test('interpretation performs no file, process or network I/O after module initialization', t => {
  const modules = [
    [fs, ['readFileSync', 'writeFileSync', 'openSync', 'appendFileSync']],
    [require('node:http'), ['get', 'request']], [require('node:https'), ['get', 'request']],
    [require('node:net'), ['connect', 'createConnection']],
    [require('node:child_process'), ['spawn', 'exec', 'execSync']]
  ];
  for (const [module, names] of modules) for (const name of names) t.mock.method(module, name, () => { throw Error('UNEXPECTED_IO'); });
  assert.equal(interpretSensorBatch(input()).snapshot.realTransportConfigured, false);
});

test('real local MCP handshake, tool call, Arabic/English parity and denials', { timeout: 20000 }, async () => {
  const root = path.resolve(__dirname, '..');
  const client = new Client({ name: 'sheikha-sensory-local-test', version: '1.0.0' }, { capabilities: {} });
  const transport = new StdioClientTransport({ command: process.execPath,
    args: [path.join(root, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')], cwd: root, stderr: 'pipe' });
  transport.stderr?.resume();
  try {
    await client.connect(transport, { timeout: 5000 });
    const catalog = await client.listTools({}, { timeout: 5000 });
    const tool = catalog.tools.find(item => item.name === 'sheikha_sensory_interpret');
    assert.ok(tool);
    assert.deepEqual(tool.inputSchema, getSensoryInputSchema());
    assert.deepEqual(tool.annotations, { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false });
    const call = args => client.callTool({ name: tool.name, arguments: args }, undefined, { timeout: 5000 });
    for (const language of ['ar', 'en']) {
      const args = input({ language });
      const response = await call(args);
      assert.notEqual(response.isError, true);
      const result = JSON.parse(response.content[0].text);
      const now = Date.parse(result.snapshot.evaluatedAt);
      const expected = new SensoryHub(config, { tenantId: config.tenantId, origin: 'IMPORTED_UNVERIFIED' }).ingest(args.batch, now);
      assert.deepEqual(result.snapshot, expected);
      assert.deepEqual(result.explanations, interpretSensorBatch(args).explanations);
      assert.equal(result.boundaries.liveSensorVerified, false);
      assert.equal(result.boundaries.productionReady, false);
    }
    const repeated = input(); repeated.batch.observations.push(clone(repeated.batch.observations[0]));
    for (const args of [{}, input({ token: 'SECRET_SENTINEL' }), input({ url: 'https://example.invalid/SECRET_SENTINEL' }),
      input({ productionEnabled: true }), repeated, input({ batch: { ...input().batch, tenantId: 'SECRET_SENTINEL' } })]) {
      const response = await call(args);
      assert.equal(response.isError, true);
      assert.equal(JSON.stringify(response).includes('SECRET_SENTINEL'), false);
    }
    assert.equal((await client.callTool({ name: tool.name }, undefined, { timeout: 5000 })).isError, true);
    assert.notEqual((await call(input())).isError, true);
    const denied = await client.callTool({ name: 'sheikha_physical_start', arguments: {} }, undefined, { timeout: 5000 });
    assert.equal(denied.isError, true);
    assert.equal(denied.content[0].text, 'TOOL_NOT_ADMITTED');
    assert.equal((await client.listResources({}, { timeout: 5000 })).resources.length, 4);
  } finally {
    await client.close();
    await transport.close();
  }
});
