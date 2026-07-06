'use strict';

const {
  runUniversalFederationEngine,
  buildFederationLifecycle
} = require('../core/universal-federation-engine/sheikha-universal-federation-engine-v5');

describe('Sheikha Universal Federation Engine V5', () => {
  test('orchestrates marketplace package safely', () => {
    const result = runUniversalFederationEngine({
      marketplacePackage: 'postgresql',
      actor: 'test',
      compatibility: {
        from: 'postgresql-federation',
        to: 'linux-family'
      }
    });

    expect(result.system).toBe('SHEIKHA_UNIVERSAL_FEDERATION_ENGINE_V5');
    expect(result.status).toBe('COMMITTED');
    expect(result.safety.noHarm).toBe(true);
    expect(result.registries.capability).toBe(true);
    expect(result.events.length).toBeGreaterThanOrEqual(5);
  });

  test('builds lifecycle state', () => {
    const lifecycle = buildFederationLifecycle('OBSERVED');

    expect(lifecycle.system).toBe('SHEIKHA_FEDERATION_LIFECYCLE_V5');
    expect(lifecycle.allowed).toBe(true);
  });

  test('blocks external change through lower governance layer', () => {
    const result = runUniversalFederationEngine({
      type: 'OPERATING_SYSTEM',
      name: 'UnsafeOS',
      governanceLevel: 'EXTERNAL_CHANGE_EXPLICIT_APPROVAL_REQUIRED'
    });

    expect(result.status).toBe('BLOCKED');
  });
});
