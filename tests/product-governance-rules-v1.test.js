'use strict';

const {
  evaluateProductGovernance
} = require('../core/product-knowledge/product-governance-rules');

describe('Sheikha Product Governance Rules V1', () => {
  test('passes governed valid product', () => {
    const result = evaluateProductGovernance({
      quality: { score: 80 },
      risk: { level: 'LOW' },
      standards: ['internal-inspection-required'],
      price: { amount: 25 }
    });

    expect(result.system).toBe('SHEIKHA_PRODUCT_GOVERNANCE_RULES_ENGINE_V2');
    expect(result.status).toBe('PASSED');
    expect(result.passed).toBe(true);
    expect(result.policiesSource).toBe('PRODUCT_POLICY_REGISTRY');
  });

  test('blocks high risk or incomplete product', () => {
    const result = evaluateProductGovernance({
      quality: { score: 50 },
      risk: { level: 'HIGH' },
      standards: [],
      price: { amount: 0 }
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.passed).toBe(false);
    expect(result.blockers.length).toBeGreaterThanOrEqual(1);
  });
});
