'use strict';

const { evaluateGovernance } = require('./governance-engine');
const { decide } = require('./decision-engine');

function runSheikhaProtocol(request = {}) {
  const governance = evaluateGovernance(request);
  const decision = decide(governance);

  return {
    protocol: 'SHEIKHA_PROTOCOL_V1',
    status: decision.executable ? 'READY_TO_EXECUTE' : 'BLOCKED',
    request,
    governance,
    decision
  };
}

module.exports = {
  runSheikhaProtocol,
  evaluateGovernance,
  decide
};
