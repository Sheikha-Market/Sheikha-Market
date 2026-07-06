'use strict';

function createRuntimeTopologyGraph() {
  return {
    system: 'SHEIKHA_RUNTIME_TOPOLOGY_GRAPH_V1',
    status: 'ACTIVE',
    nodes: [
      'route',
      'service',
      'module',
      'dependency',
      'test',
      'evidence',
      'warning'
    ],
    edges: [
      'route-to-service',
      'service-to-module',
      'module-to-dependency',
      'module-to-test',
      'warning-to-evidence'
    ]
  };
}

module.exports = { createRuntimeTopologyGraph };
