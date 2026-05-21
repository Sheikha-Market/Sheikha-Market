'use strict';

const ROOT_RULES = [
  'Tawheed',
  'NoHarm',
  'TruthAndDisclosure',
  'NoFraud',
  'NoMonopoly',
  'GovernanceBeforeExecution',
  'RollbackBeforeExpansion',
  'EarthDevelopment'
];

function calculateRootScore(input = {}) {
  const weights = {
    intention: 20,
    truth: 20,
    noHarm: 20,
    usefulness: 15,
    governance: 15,
    rollback: 10
  };

  return Object.entries(weights).reduce((sum, [key, value]) => {
    return sum + (input[key] === true ? value : 0);
  }, 0);
}

function classifyGrowth(score) {
  if (score >= 90) return 'HARVEST_READY';
  if (score >= 70) return 'GROWTH_READY';
  if (score >= 50) return 'ROOT_REVIEW';
  return 'REJECT_OR_REPLANT';
}

function evaluate(input = {}) {
  const score = calculateRootScore(input);
  return {
    science: 'Sheikha Root Science',
    rules: ROOT_RULES,
    score,
    status: classifyGrowth(score),
    timestamp: new Date().toISOString()
  };
}

module.exports = { evaluate, calculateRootScore, classifyGrowth, ROOT_RULES };
