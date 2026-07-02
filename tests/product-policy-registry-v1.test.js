'use strict';

const {
  getProductPolicies,
  getProductPolicyById
} = require('../core/product-knowledge/product-policy-registry');

describe('Sheikha Product Policy Registry V1', () => {
  test('lists product governance policies', () => {
    const policies = getProductPolicies();

    expect(Array.isArray(policies)).toBe(true);
    expect(policies.length).toBeGreaterThanOrEqual(4);
    expect(policies.map((policy) => policy.id)).toContain('policy-quality-minimum');
  });

  test('finds product policy by id', () => {
    const policy = getProductPolicyById('policy-price-required');

    expect(policy).not.toBeNull();
    expect(policy.type).toBe('PRICING');
    expect(policy.severity).toBe('BLOCKER');
  });
});
