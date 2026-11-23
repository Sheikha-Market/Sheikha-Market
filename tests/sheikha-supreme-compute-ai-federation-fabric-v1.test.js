'use strict';

const {
  SheikhaSupremeComputeAIFederationFabric,
  SUPERCOMPUTE_LAYERS,
  AI_PRODUCTION_LAYERS
} = require('../runtime/sheikha-supreme-compute-ai-federation/sheikha-supreme-compute-ai-federation-fabric');

test('does not promote a compute catalog to a production or training claim', () => {
  const fabric = new SheikhaSupremeComputeAIFederationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ARCHITECTURE_REGISTERED_EVIDENCE_REQUIRED');
  expect(status.layerRank).toBe('ABOVE_SHEIKHA_OS_ENTERPRISE_FEDERATION');
  expect(status.productionReady).toBe(false);
  expect(status.inspectorOnly).toBe(true);

  expect(status.governedSystems.length).toBeGreaterThanOrEqual(6);
  expect(status.governedSystems.every((x) => !x.supercomputerReady)).toBe(true);
  expect(status.governedSystems.every((x) => !x.cloudReady)).toBe(true);
  expect(status.governedSystems.every((x) => !x.saasReady)).toBe(true);
  expect(status.governedSystems.every((x) => !x.aiReady)).toBe(true);

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
