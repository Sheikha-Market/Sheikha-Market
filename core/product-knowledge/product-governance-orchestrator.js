'use strict';

const { runProductGovernancePipeline } = require('./product-governance-pipeline');

const defaultStages = Object.freeze([
  'duplicates',
  'validation',
  'governance',
  'quality',
  'pricing',
  'standards'
]);

function orchestrateProductGovernance(product = {}, existingProducts = [], options = {}) {
  const pipeline = runProductGovernancePipeline(product, existingProducts, options);

  return {
    system: 'SHEIKHA_ENTERPRISE_PRODUCT_GOVERNANCE_ORCHESTRATOR_V1',
    status: pipeline.passed ? 'APPROVED' : 'REVIEW_REQUIRED',
    passed: pipeline.passed,
    finalDecision: pipeline.finalDecision,
    stagesOrder: defaultStages,
    blockers: pipeline.blockers,
    pipeline,
    orchestration: {
      mode: 'SEQUENTIAL_GOVERNED_PIPELINE',
      governance: 'PASSED',
      noHarm: true,
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
  defaultStages,
  orchestrateProductGovernance
};
