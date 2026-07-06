'use strict';

const { recoverRuntime } = require('../recovery/sheikha-recovery-engine');
const { collectRuntimeMetrics } = require('../observability/sheikha-observability-runtime');

function reloadRuntime() {
  return {
    status: 'RELOADED',
    recovery: recoverRuntime(),
    observability: collectRuntimeMetrics()
  };
}

module.exports = { reloadRuntime };
