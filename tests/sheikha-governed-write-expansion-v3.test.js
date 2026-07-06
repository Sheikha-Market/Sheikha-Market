'use strict';

const {
  governedExpandFederationV3,
  relationshipRegistry
} = require('../core/governed-write-expansion-v3/sheikha-governed-write-expansion-v3');

describe('Sheikha Governed Write Expansion Fabric V3', () => {
  test('generates fabrics clusters and relations from blueprint safely', () => {
    const result = governedExpandFederationV3({
      type: 'OPERATING_SYSTEM',
      name: 'BlueprintOS',
      actor: 'test'
    });

    expect(result.system).toBe('SHEIKHA_GOVERNED_WRITE_EXPANSION_FABRIC_V3');
    expect(result.status).toBe('COMMITTED');
    expect(result.safety.noHarm).toBe(true);
    expect(result.generated.fabrics.length).toBeGreaterThan(5);
    expect(result.generated.clusters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ cluster: 'kernel' }),
        expect.objectContaining({ cluster: 'security' })
      ])
    );
    expect(result.generated.relations.map((r) => r.type)).toContain('GENERATES');
  });

  test('relationship registry contains governed extensible relation types', () => {
    expect(relationshipRegistry).toContain('GOVERNS');
    expect(relationshipRegistry).toContain('GENERATES');
    expect(relationshipRegistry).toContain('ISOLATED_FROM');
  });

  test('blocks external system mutation', () => {
    const result = governedExpandFederationV3({
      type: 'OPERATING_SYSTEM',
      name: 'UnsafeOS',
      kernelMutation: true
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.policy.risks).toContain('KERNEL_MUTATION_BLOCKED');
  });
});
