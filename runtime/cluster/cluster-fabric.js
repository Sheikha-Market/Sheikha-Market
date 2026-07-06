'use strict';

function status() {
  return {
    fabric: 'SHEIKHA_CLUSTER_FABRIC_V1',
    status: 'BOOTSTRAPPED',
    mode: 'single_node_lab_candidate',
    components: ['node-registry', 'node-health', 'load-balancer', 'leader-election']
  };
}

module.exports = { status };
