'use strict';

const { loadRuntime } = require('./loader/sheikha-runtime-loader');
const { discoverModules } = require('./discovery/sheikha-module-discovery');
const { evaluateSystemHealth } = require('./self-healing/sheikha-self-healing-engine');
const { collectRuntimeMetrics } = require('./observability/sheikha-observability-runtime');
const { autoRegisterModules } = require('./auto-registration/sheikha-auto-registration');

function productionSummary() {
  return {
    system: 'SHEIKHA_PRODUCTION_RUNTIME_SUMMARY_V1',
    status: 'ACTIVE',
    runtime: loadRuntime(),
    modules: discoverModules(),
    health: evaluateSystemHealth(),
    observability: collectRuntimeMetrics(),
    registration: autoRegisterModules()
  };
}

module.exports = { productionSummary };
