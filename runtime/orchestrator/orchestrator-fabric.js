'use strict';

function status() {
  return {
    fabric: 'SHEIKHA_ORCHESTRATOR_V1',
    status: 'BOOTSTRAPPED',
    components: ['workflow-engine', 'pipeline-engine', 'task-dispatcher', 'execution-coordinator']
  };
}

module.exports = { status };
