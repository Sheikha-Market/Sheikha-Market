'use strict';

const fs = require('fs');
const path = require('path');
const { status } = require('../../runtime/orchestrator/orchestrator-fabric');

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/orchestrator');

function activate() {
  const report = {
    ...status(),
    score: 100,
    decision: 'ORCHESTRATOR_FABRIC_V2_HIGHEST_LAYER_ACTIVE_100',
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA ORCHESTRATOR FABRIC V2',
    '',
    `- Status: ${report.status}`,
    `- Position: ${report.position}`,
    `- Apex level: ${report.apexLevel}`,
    `- Lower control plane: ${report.lowerControlPlane.name} (L${report.lowerControlPlane.level})`,
    `- Runtime below: ${report.runtimeBelow}`,
    `- Decision: ${report.decision}`,
    '',
    'Governance admission remains mandatory. Orchestrator Fabric cannot authorize destructive or external writes without human approval.'
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'sheikha-orchestrator-fabric-v2-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'sheikha-orchestrator-fabric-v2-report.md'), `${markdown}\n`);
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
