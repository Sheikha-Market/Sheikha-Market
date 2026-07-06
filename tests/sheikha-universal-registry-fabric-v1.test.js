'use strict';

const {
  SheikhaUniversalRegistryFabric,
  SheikhaUniversalSubRegistry
} = require('../runtime/sheikha-universal-production-integration/registry/sheikha-universal-registry-fabric');

test('activates universal registry with governed sub registries for every system family', () => {
  const registry = new SheikhaUniversalRegistryFabric();
  const status = registry.activate();

  expect(status.status).toBe('ACTIVE');
  expect(status.layerRank).toBe('HIGHEST_UNIVERSAL_REGISTRY_LAYER');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.mainRegistryRecords.length).toBeGreaterThanOrEqual(20);
  expect(status.subRegistries.length).toBeGreaterThanOrEqual(20);
  expect(status.subRegistries.every((x) => x.status === 'ACTIVE')).toBe(true);
  expect(status.subRegistries.every((x) => x.governed)).toBe(true);
  expect(status.subRegistries.every((x) => x.audited)).toBe(true);
  expect(status.subRegistries.every((x) => x.productionReady)).toBe(true);

  expect(status.boundaries.allSubRegistriesGoverned).toBe(true);
  expect(status.boundaries.allSubRegistriesAudited).toBe(true);
  expect(status.boundaries.allSubRegistriesProductionReady).toBe(true);
});

test('sub registry records governed production entries', () => {
  const registry = new SheikhaUniversalSubRegistry('linux');
  const entry = registry.register({
    id: 'linux:runtime-adapter',
    layer: 'linux-production-layer',
    capabilities: ['discovery', 'recovery']
  });

  expect(entry.family).toBe('linux');
  expect(entry.governed).toBe(true);
  expect(entry.audited).toBe(true);
  expect(entry.productionReady).toBe(true);
  expect(registry.getStatus().records).toHaveLength(1);
});
