'use strict';

const {
  analyzeWarning
} = require('../warning-governance/sheikha-warning-governance-fabric');

function analyzeRootCause(input = {}) {
  const message = String(input.message || '');
  const warning = analyzeWarning({
    message,
    severity: input.severity || 'WARNING'
  });

  return {
    system: 'SHEIKHA_ROOT_CAUSE_INTELLIGENCE_V2',
    status: 'ACTIVE',
    category: warning.category,
    source: input.source || 'unknown',
    message,
    rootCause: warning.rootCause,
    consequences: warning.consequences,
    historicalFailureModes: warning.historicalFailureModes,
    safeResolution: warning.safeResolution,
    preventionControls: warning.preventionControls,
    requiresEvidence: true,
    requiresVerification: true,
    suppressWarning: false
  };
}

module.exports = { analyzeRootCause };
