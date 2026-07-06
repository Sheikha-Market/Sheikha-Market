'use strict';

const graph =
require('../../knowledge/unified-graph/sheikha-unified-graph-fabric-v1.json');

function loadUnifiedGraphFabric() {
  return graph;
}

module.exports = { loadUnifiedGraphFabric };
