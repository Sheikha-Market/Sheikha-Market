'use strict';

const { detectProductDuplicates } = require('./product-duplicate-detection');
const { evaluateProductGovernance } = require('./product-governance-rules');
const { validateProduct } = require('./product-knowledge-fabric');
const { evaluateProductQuality } = require('./product-quality-engine');
const { evaluateProductPricing } = require('./product-pricing-engine');
const { evaluateProductStandards } = require('./product-standards-engine');

function runProductGovernancePipeline(product = {}, existingProducts = [], options = {}) {
  const force = options.force === true;

  const duplicates = detectProductDuplicates(product, existingProducts);
  const validation = validateProduct(product);
  const governance = evaluateProductGovernance(product);
  const quality = evaluateProductQuality(product);
  const pricing = evaluateProductPricing(product);
  const standards = evaluateProductStandards(product);

  const blockers = [];

  if (duplicates.duplicateSuspected && !force) {
    blockers.push('DUPLICATE_PRODUCT_SUSPECTED');
  }

  if (!validation.valid) {
    blockers.push('VALIDATION_FAILED');
  }

  if (!governance.passed) {
    blockers.push('GOVERNANCE_BLOCKED');
  }

  if (!quality.passed) {
    blockers.push('QUALITY_FAILED');
  }

  if (!pricing.pricingValid) {
    blockers.push('PRICING_FAILED');
  }

  if (!standards.standardsValid) {
    blockers.push('STANDARDS_FAILED');
  }

  return {
    system: 'SHEIKHA_ENTERPRISE_PRODUCT_GOVERNANCE_PIPELINE_V1',
    status: blockers.length ? 'BLOCKED' : 'PASSED',
    passed: blockers.length === 0,
    finalDecision: blockers.length ? 'REVIEW_REQUIRED' : 'APPROVED',
    force,
    blockers,
    stages: {
      duplicates,
      validation,
      governance,
      quality,
      pricing,
      standards
    }
  };
}

module.exports = {
  runProductGovernancePipeline
};
