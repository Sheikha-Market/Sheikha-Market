'use strict';

const {
  collectRuntimeMetrics
} = require('../observability/sheikha-observability-runtime');

function createRuntimeObservatory() {

  return {
    system: 'SHEIKHA_RUNTIME_OBSERVATORY_V1',
    status: 'ACTIVE',

    metrics: collectRuntimeMetrics(),

    watches: [
      'cpu',
      'memory',
      'latency',
      'errors',
      'warnings',
      'routes',
      'pm2',
      'health'
    ],

    outputs: [
      'risk-score',
      'anomaly-signal',
      'health-snapshot',
      'evidence'
    ]
  };

}

module.exports = {
  createRuntimeObservatory
};
