'use strict';

const {
  SheikhaIDEConnectionOrchestrator,
  CONNECTION_TARGETS,
  CONNECTION_STAGES
} = require('../runtime/sheikha-ide/connection/sheikha-ide-connection-orchestrator');

test('activates governed Sheikha IDE connection orchestrator', () => {
  const orchestrator = new SheikhaIDEConnectionOrchestrator();
  const status = orchestrator.getStatus();

  expect(status.status).toBe('ACTIVE_IDE_CONNECTION_ORCHESTRATOR');
  expect(status.layerRank).toBe('ABOVE_WORKSPACE_MANAGER');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.targets).toEqual(CONNECTION_TARGETS);
  expect(status.stages).toEqual(CONNECTION_STAGES);
  expect(status.coverage.score).toBe(100);

  expect(status.connections).toHaveLength(CONNECTION_TARGETS.length);
  expect(status.connections.every((x) => x.status === 'CONNECTED_AND_GOVERNED')).toBe(true);
  expect(status.connections.every((x) => x.bindings.registry)).toBe(true);
  expect(status.connections.every((x) => x.bindings.masterLog)).toBe(true);
  expect(status.connections.every((x) => x.bindings.inspector)).toBe(true);

  expect(status.boundaries.allConnectionsGoverned).toBe(true);
  expect(status.boundaries.noSecretMutation).toBe(true);
  expect(status.boundaries.inspectorRequired).toBe(true);
});

test('rejects unsupported IDE connection target', () => {
  const orchestrator = new SheikhaIDEConnectionOrchestrator();

  expect(() => orchestrator.connectTarget('unknown-target'))
    .toThrow('Unsupported Sheikha IDE connection target');
});
