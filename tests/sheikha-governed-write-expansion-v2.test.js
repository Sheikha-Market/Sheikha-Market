'use strict';

const {
  governedExpandFederation,
  evaluateWritePolicy
} = require('../core/governed-write-expansion/sheikha-governed-write-expansion-v2');

describe('Sheikha Governed Write Expansion Fabric V2', () => {
  test('commits internal governed registry write safely', () => {
    const result = governedExpandFederation({
      type: 'OPERATING_SYSTEM',
      name: 'SafeFutureOS',
      actor: 'test'
    });

    expect(result.system).toBe('SHEIKHA_GOVERNED_WRITE_EXPANSION_FABRIC_V2');
    expect(result.status).toBe('COMMITTED');
    expect(result.safety.noHarm).toBe(true);
    expect(result.writeScope).toBe('SHEIKHA_INTERNAL_REGISTRY_ONLY');
    expect(result.family.clusters).toContain('kernel');
    expect(result.federation.relations.map((r) => r.type)).toContain('GOVERNED_BY');
  });

  test('blocks high impact system mutation', () => {
    const policy = evaluateWritePolicy({
      kernelMutation: true,
      serviceRestart: true
    });

    expect(policy.status).toBe('BLOCKED');
    expect(policy.passed).toBe(false);
    expect(policy.risks).toContain('KERNEL_MUTATION_BLOCKED');
    expect(policy.risks).toContain('SERVICE_RESTART_BLOCKED');
  });
});
