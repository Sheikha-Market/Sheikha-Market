'use strict';

const {
  SheikhaSupremeComputeAIFederationFabric,
  SUPERCOMPUTE_LAYERS,
  AI_PRODUCTION_LAYERS
} = require('../runtime/sheikha-supreme-compute-ai-federation/sheikha-supreme-compute-ai-federation-fabric');

test('activates supreme compute and AI federation for every governed OS', () => {
  const fabric = new SheikhaSupremeComputeAIFederationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_SUPREME_COMPUTE_AI_GOVERNING');
  expect(status.layerRank).toBe('ABOVE_SHEIKHA_OS_ENTERPRISE_FEDERATION');
  expect(status.productionReady).toBe(true);
  expect(status.inspectorOnly).toBe(false);

  expect(status.governedSystems.length).toBeGreaterThanOrEqual(6);
  expect(status.governedSystems.every((x) => x.supercomputerReady)).toBe(true);
  expect(status.governedSystems.every((x) => x.cloudReady)).toBe(true);
  expect(status.governedSystems.every((x) => x.saasReady)).toBe(true);
  expect(status.governedSystems.every((x) => x.aiReady)).toBe(true);

  expect(SUPERCOMPUTE_LAYERS).toContain('gpu-compute');
  expect(SUPERCOMPUTE_LAYERS).toContain('hpc-scheduler');
  expect(AI_PRODUCTION_LAYERS).toContain('model-registry');
  expect(AI_PRODUCTION_LAYERS).toContain('agent-orchestration');
});

test('rejects unsupported compute OS', () => {
  const fabric = new SheikhaSupremeComputeAIFederationFabric();

  expect(() => fabric.buildSystemProductionStack('unsupported-os'))
    .toThrow('Unsupported governed compute OS');
});
