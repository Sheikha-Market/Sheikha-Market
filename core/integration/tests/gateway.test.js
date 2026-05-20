'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { IntegrationGateway } = require('../gateway');
const { IntegrationRegistry } = require('../registry/registry');
const { IndustrialSafeAdapter } = require('../adapters/industrial-safe-adapter');
const { TelemetryCapture } = require('../../telemetry/capture');
const { RollbackSnapshot } = require('../../rollback/snapshot');

test('gateway executes adapter through governance, policy, telemetry, and snapshot hooks', async () => {
  const telemetrySink = [];
  const telemetry = new TelemetryCapture({ sink: telemetrySink });
  const rollback = new RollbackSnapshot();

  const registry = new IntegrationRegistry();
  registry.register('industrial', new IndustrialSafeAdapter());

  const gateway = new IntegrationGateway({
    registry,
    telemetry,
    governance: { validate: async () => true },
    policy: { validate: async () => true }
  });

  const result = await gateway.execute(
    'industrial',
    { command: 'simulate-line' },
    {
      snapshot: () => rollback.create('industrial'),
      rollback: (snapshot) => rollback.rollback(snapshot)
    }
  );

  assert.equal(result.status, 'accepted');
  assert.equal(telemetrySink.length, 1);
  assert.equal(telemetrySink[0].provider, 'industrial');
  assert.equal(telemetrySink[0].status, 'success');
  assert.equal(rollback.list().length, 1);
});
