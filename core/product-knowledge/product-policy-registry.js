'use strict';

const productPolicies = Object.freeze([
  {
    id: 'policy-quality-minimum',
    type: 'QUALITY',
    severity: 'BLOCKER',
    rule: 'quality.score >= 70',
    description: 'Minimum accepted quality score is 70.'
  },
  {
    id: 'policy-risk-high-review',
    type: 'RISK',
    severity: 'BLOCKER',
    rule: 'risk.level !== HIGH',
    description: 'High risk products require review and cannot be auto-approved.'
  },
  {
    id: 'policy-standards-required',
    type: 'STANDARDS',
    severity: 'BLOCKER',
    rule: 'standards.length > 0',
    description: 'At least one product standard is required.'
  },
  {
    id: 'policy-price-required',
    type: 'PRICING',
    severity: 'BLOCKER',
    rule: 'price.amount > 0',
    description: 'Product price must be defined and greater than zero.'
  }
]);

function getProductPolicies() {
  return productPolicies;
}

function getProductPolicyById(id) {
  return productPolicies.find((policy) => policy.id === id) || null;
}

module.exports = {
  productPolicies,
  getProductPolicies,
  getProductPolicyById
};
