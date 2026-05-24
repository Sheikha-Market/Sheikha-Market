'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { IntegrationRegistry } = require('../registry/registry');
const { IndustrialSafeAdapter } = require('../adapters/industrial-safe-adapter');

test('integration registry registers and lists adapters', () => {
  const registry = new IntegrationRegistry();

  registry.register('industrial', new IndustrialSafeAdapter());

  assert.equal(registry.has('industrial'), true);
  assert.deepEqual(registry.list(), ['industrial']);
  assert.equal(typeof registry.get('industrial').execute, 'function');
});

test('industrial adapter blocks live execution unless explicitly allowed', async () => {
  const adapter = new IndustrialSafeAdapter({ mode: 'live' });

  await assert.rejects(
    () => adapter.execute({ command: 'open-valve' }, {}),
    /blocked by governance policy/
  );
});

test('industrial adapter accepts dry-run governed execution', async () => {
  const adapter = new IndustrialSafeAdapter();

  const result = await adapter.execute({ command: 'simulate' }, {});

  assert.equal(result.status, 'accepted');
  assert.equal(result.data.governed, true);
  assert.equal(result.data.industrialSafe, true);
  assert.equal(result.data.liveExecution, false);
});
