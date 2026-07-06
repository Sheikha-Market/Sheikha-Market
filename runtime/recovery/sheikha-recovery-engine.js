'use strict';

const {
  evaluateSystemHealth
} = require('../self-healing/sheikha-self-healing-engine');

function recoverRuntime() {

  const health =
    evaluateSystemHealth();

  return {
    status: 'RECOVERED',
    recoveredModules:
      health.activeModules,
    totalModules:
      health.totalModules,
    health
  };

}

module.exports = {
  recoverRuntime
};
