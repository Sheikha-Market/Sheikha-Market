'use strict';

const defaultRules = Object.freeze([
  {
    id: 'quality-minimum-score',
    severity: 'BLOCKER',
    description: 'Product quality score must be 70 or higher.',
    check(product = {}) {
      return Number(product.quality?.score || 0) >= 70;
    }
  },
  {
    id: 'high-risk-review',
    severity: 'BLOCKER',
    description: 'High risk products cannot be approved without review.',
    check(product = {}) {
      return product.risk?.level !== 'HIGH';
    }
  },
  {
    id: 'standards-required',
    severity: 'BLOCKER',
    description: 'Product must include at least one applicable standard.',
    check(product = {}) {
      return Array.isArray(product.standards) && product.standards.length > 0;
    }
  },
  {
    id: 'price-required',
    severity: 'BLOCKER',
    description: 'Product must include a valid positive price.',
    check(product = {}) {
      return Number(product.price?.amount || 0) > 0;
    }
  }
]);

function evaluateProductGovernance(product = {}, rules = defaultRules) {
  const results = rules.map((rule) => ({
    id: rule.id,
    severity: rule.severity,
    description: rule.description,
    passed: Boolean(rule.check(product))
  }));

  const blockers = results.filter((result) => result.severity === 'BLOCKER' && !result.passed);

  return {
    system: 'SHEIKHA_PRODUCT_GOVERNANCE_RULES_ENGINE_V1',
    status: blockers.length ? 'BLOCKED' : 'PASSED',
    passed: blockers.length === 0,
    blockers,
    results
  };
}

module.exports = {
  defaultRules,
  evaluateProductGovernance
};
