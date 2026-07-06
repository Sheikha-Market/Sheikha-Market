'use strict';

const fs = require('fs');
const path = require('path');
const cloudProductionDeploymentApex = require(
  '../../runtime/cloud-production-deployment-apex/v1/sheikha-cloud-production-deployment-apex-v1'
);

const root = path.join(__dirname, '..', '..');
const outDir = path.join(root, 'runtime/cloud-production-deployment-apex/v1');
const reportJson = path.join(outDir, 'sheikha-cloud-production-deployment-apex-v1-report.json');
const reportMd = path.join(outDir, 'sheikha-cloud-production-deployment-apex-v1-report.md');
const nginxTemplate = path.join(outDir, 'sheikha-nginx-zero-buffer-template.conf');

function renderMarkdown(report) {
  return [
    '# Sheikha Cloud Production Deployment Apex V1',
    '',
    `- System: ${report.system}`,
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Score: ${report.score}`,
    `- Level: ${report.level}`,
    `- Execution Mode: ${report.plan.executionMode}`,
    '',
    '## Production Gates',
    '',
    ...report.plan.gates.map((gate) => `- ${gate}`),
    '',
    '## Blocked Automation',
    '',
    ...report.plan.blockedAutomation.map((item) => `- ${item}`),
    '',
    '## Governance',
    '',
    ...Object.entries(report.governance).map(([name, value]) => `- ${name}: ${value}`)
  ].join('\n');
}

function main() {
  const report = cloudProductionDeploymentApex.status();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMd, `${renderMarkdown(report)}\n`);
  fs.writeFileSync(nginxTemplate, `${cloudProductionDeploymentApex.nginxZeroBufferTemplate()}\n`);
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { main };
