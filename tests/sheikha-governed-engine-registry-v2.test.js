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
  });
});
