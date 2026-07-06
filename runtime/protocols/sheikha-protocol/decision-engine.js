'use strict';

function decide(governanceResult = {}) {
  const approved = governanceResult.allowed === true;

  return {
    engine: 'SHEIKHA_DECISION_ENGINE_V1',
    decision: approved ? 'approved' : 'rejected',
    executable: approved,
    reason: approved ? 'Governance passed' : 'Governance rejected',
    governance: governanceResult,
    timestamp: new Date().toISOString()
  };
}

module.exports = { decide };
