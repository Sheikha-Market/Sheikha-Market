'use strict';

const {
  SheikhaSupremeCore,
  SUPREME_CORE_MODULES,
  CORE_RESPONSIBILITIES
} = require('../runtime/sheikha-core/supreme/sheikha-supreme-core');

test('activates Sheikha supreme core consolidation layer', () => {
  const core = new SheikhaSupremeCore();
  const status = core.getStatus();

  expect(status.status).toBe('ACTIVE_SHEIKHA_SUPREME_CORE');
  expect(status.layerRank).toBe('TOP_CORE_CONSOLIDATION_LAYER');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.modules).toEqual(SUPREME_CORE_MODULES);
  expect(status.responsibilities).toEqual(CORE_RESPONSIBILITIES);
  expect(status.composedCore.status).toBe('SHEIKHA_SUPREME_CORE_COMPOSED');

  expect(status.boundaries.supremeCoreEnabled).toBe(true);
  expect(status.boundaries.noUngovernedCoreActivation).toBe(true);
});

test('activates each supreme core module with responsibilities', () => {
  const core = new SheikhaSupremeCore();

  for (const module of SUPREME_CORE_MODULES) {
    const activated = core.activateCoreModule(module);

    expect(activated.status).toBe('SUPREME_CORE_MODULE_ACTIVE');
    expect(activated.governed).toBe(true);
    expect(activated.audited).toBe(true);
    expect(activated.responsibilities).toEqual(CORE_RESPONSIBILITIES[module]);
    expect(activated.boundaries.singleResponsibility).toBe(true);
  }
});

test('composes governed and audited supreme core', () => {
  const core = new SheikhaSupremeCore();
  const composed = core.composeCore();

  expect(composed.status).toBe('SHEIKHA_SUPREME_CORE_COMPOSED');
  expect(composed.modules).toHaveLength(SUPREME_CORE_MODULES.length);
  expect(composed.composition.oneSupremeEntryPoint).toBe(true);
  expect(composed.composition.allCoresContracted).toBe(true);
  expect(composed.boundaries.noDuplicateCoreResponsibility).toBe(true);
  expect(composed.boundaries.domainPacksAboveCoreOnly).toBe(true);
});

test('rejects unsupported supreme core module', () => {
  const core = new SheikhaSupremeCore();

  expect(() => core.activateCoreModule('unknown-core'))
    .toThrow('Unsupported Sheikha supreme core module');
});
