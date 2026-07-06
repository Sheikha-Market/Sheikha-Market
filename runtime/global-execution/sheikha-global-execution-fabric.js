'use strict';

const { loadFederationOmega } =
require('../federation-omega/sheikha-federation-omega');

const { loadUnifiedGraphFabric } =
require('../unified-graph/sheikha-unified-graph-runtime');

const { productionSummary } =
require('../production-summary');

function loadGlobalExecutionFabric() {
  return {
    system: 'SHEIKHA_GLOBAL_EXECUTION_FABRIC_OMEGA_V1',
    status: 'ACTIVE',
    federation: loadFederationOmega(),
    unifiedGraph: loadUnifiedGraphFabric(),
    production: productionSummary()
  };
}

module.exports = { loadGlobalExecutionFabric };
