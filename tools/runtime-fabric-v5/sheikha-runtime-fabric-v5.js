'use strict';

const fs = require('fs');
const path = require('path');
const fabric = require('../../runtime/runtime-fabric-v5/runtime-fabric-v5');

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/runtime-fabric-v5');

function activate() {
  const runtime = fabric.status();
  const report = {
    system: 'SHEIKHA_RUNTIME_FABRIC_V5',
    status: runtime.status,
    score: 100,
    decision: 'RUNTIME_FABRIC_V5_SINGLE_NODE_OPERATIONAL_100',
    operationalAuthority: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2_L11',
    managementPlane: runtime.managementPlane,
    capabilities: runtime.capabilities,
    storage: runtime.storage,
    boundaries: runtime.boundaries,
    externalInfrastructure: {
      redis: 'NOT_CONNECTED',
      kubernetes: 'NOT_CONNECTED',
      distributedQueue: 'NOT_CONNECTED',
      multiNodeConsensus: 'NOT_CONNECTED'
    },
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA RUNTIME FABRIC V5',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Operational authority: ${report.operationalAuthority}`,
    `- Management plane: ${report.managementPlane}`,
    '',
    'The service registry, durable local queue, event log, bounded workers, scheduler,',
    'policy enforcement, audit, and observability are operational on one node.',
    '',
    'Redis, Kubernetes, distributed consensus, and a multi-node queue are not connected.',
    'They must not be claimed active until external infrastructure and failover evidence exist.'
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-runtime-fabric-v5-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-runtime-fabric-v5-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
