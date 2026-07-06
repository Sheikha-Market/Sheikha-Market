'use strict';

const { getProductPolicies } = require('./product-policy-registry');

function evaluatePolicy(product = {}, policy = {}) {
  switch (policy.id) {
    case 'policy-quality-minimum':
      return Number(product.quality?.score || 0) >= 70;

    case 'policy-risk-high-review':
      return product.risk?.level !== 'HIGH';

    case 'policy-standards-required':
      return Array.isArray(product.standards) && product.standards.length > 0;

    case 'policy-price-required':
      return Number(product.price?.amount || 0) > 0;

    default:
      return false;
  }
}

function evaluateProductGovernance(product = {}, policies = getProductPolicies()) {
  const results = policies.map((policy) => ({
    id: policy.id,
    type: policy.type,
    severity: policy.severity,
    rule: policy.rule,
    description: policy.description,
    passed: Boolean(evaluatePolicy(product, policy))
  }));

  const blockers = results.filter((result) => result.severity === 'BLOCKER' && !result.passed);

  return {
    system: 'SHEIKHA_PRODUCT_GOVERNANCE_RULES_ENGINE_V2',
    status: blockers.length ? 'BLOCKED' : 'PASSED',
    passed: blockers.length === 0,
    policiesSource: 'PRODUCT_POLICY_REGISTRY',
    blockers,
    results
  };
}

module.exports = {
  evaluatePolicy,
  evaluateProductGovernance
};
