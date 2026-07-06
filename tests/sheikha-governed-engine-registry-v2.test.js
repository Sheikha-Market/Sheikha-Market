'use strict';

const {
  governedResolveEngine,
  registerOptionalEngineStubs
} = require('../core/engine-registry/sheikha-governed-engine-registry-v2');

describe('Sheikha Governed Engine Registry V2', () => {
  test('registers optional engine stubs under governance', () => {
    const result = registerOptionalEngineStubs();

    expect(result.system).toBe('SHEIKHA_GOVERNED_ENGINE_REGISTRY_V2');
    expect(result.status).toBe('ACTIVE');
    expect(result.registeredOptionalStubs).toBeGreaterThan(10);
  });

  test('returns governed dashboard contract for optional engine', () => {
    registerOptionalEngineStubs();

    const result = governedResolveEngine('AS');
    const dashboard = result.instance.getDashboard();

    expect(result.governance.noHarm).toBe(true);
    expect(dashboard.quranVerses.total).toBe(0);
    expect(Array.isArray(dashboard.logistics.ports)).toBe(true);
    expect(Array.isArray(dashboard.accounting.chartOfAccounts)).toBe(true);
    expect(Array.isArray(dashboard.trust.trustPillars)).toBe(true);
    expect(dashboard.saudi.salvageYards).toBe(0);
    expect(dashboard.stats.historicalEras).toBe(0);
    expect(dashboard.stats.preciousMetals).toBe(0);
    expect(dashboard.stats.quranicLogicPrinciples).toBe(0);
    expect(dashboard.stats.historicalNetworks).toBe(0);
  });

  test('keeps unknown optional get methods safe through V14 proxy contracts', () => {
    registerOptionalEngineStubs();

    const result = governedResolveEngine('GPE');
    const govPlatforms = result.instance.getGovPlatforms();

    expect(govPlatforms.success).toBe(true);
    expect(govPlatforms.status).toBe('RESOLVED');
    expect(govPlatforms.governance.noHarm).toBe(true);
  });
});
