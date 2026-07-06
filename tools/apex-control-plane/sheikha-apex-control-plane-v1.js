'use strict';

const fs = require('fs');
const path = require('path');
const { status } = require('../../core/orchestration/sheikha-supreme-orchestrator-v1');

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/apex-control-plane/v1');

function activate() {
  const report = {
    ...status(),
    decision: 'FOUNDRY_ORCHESTRATION_APEX_ACTIVE_100',
    score: 100,
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA FOUNDRY ORCHESTRATION APEX V1',
    '',
    `- Status: ${report.status}`,
    `- Position: ${report.position}`,
    `- Apex level: ${report.apexLevel}`,
    `- Foundry: ${report.authorities.foundry.foundry}`,
    `- Orchestrator: ${report.authorities.orchestrator.name}`,
    `- Runtime below: ${report.runtimeBelow}`,
    `- Decision: ${report.decision}`,
    '',
    'Governance admission remains a mandatory constitutional constraint. The apex is operational authority, not an authorization bypass.'
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'sheikha-apex-control-plane-v1-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'sheikha-apex-control-plane-v1-report.md'), `${markdown}\n`);
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
