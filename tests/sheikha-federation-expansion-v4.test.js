'use strict';

const {
  expandFederationFromDna,
  installFederationPackage,
  governanceLevels
} = require('../core/federation-expansion-v4/sheikha-federation-expansion-v4');

describe('Sheikha Federation Expansion Engine V4', () => {
  test('expands federation from DNA safely', () => {
    const result = expandFederationFromDna({
      type: 'DATABASE',
      name: 'TestDB Federation',
      familyName: 'TestDB Family',
      clusters: ['storage', 'query-engine', 'security'],
      capabilities: ['query', 'backup']
    });

    expect(result.system).toBe('SHEIKHA_FEDERATION_EXPANSION_ENGINE_V4');
    expect(result.status).toBe('COMMITTED');
    expect(result.safety.noHarm).toBe(true);
    expect(result.writeScope).toBe('SHEIKHA_INTERNAL_REGISTRY_AND_GRAPH_ONLY');
  });

  test('installs marketplace federation package', () => {
    const result = installFederationPackage('postgresql', { actor: 'test' });

    expect(result.status).toBe('COMMITTED');
    expect(result.dna.type).toBe('DATABASE');
    expect(result.expansion.generated.clusters.length).toBeGreaterThan(0);
  });

  test('blocks external changes without explicit approval', () => {
    const result = expandFederationFromDna({
      type: 'OPERATING_SYSTEM',
      name: 'Unsafe External OS',
      governanceLevel: governanceLevels.LEVEL_4_EXTERNAL_CHANGE
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.governance.allowed).toBe(false);
  });

  test('requires human approval for level 3 expansion', () => {
    const result = expandFederationFromDna({
      type: 'AI',
      name: 'Human Approval AI',
      governanceLevel: governanceLevels.LEVEL_3_HUMAN_APPROVED_EXPANSION
    });

    expect(result.status).toBe('PENDING_HUMAN_APPROVAL');
  });
});
