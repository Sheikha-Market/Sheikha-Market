'use strict';

const fs = require('fs');
const path = require('path');
const technicalCapabilityApex = require(
  '../../runtime/technical-capability-apex/v1/sheikha-technical-capability-apex-v1'
);

const root = path.join(__dirname, '..', '..');
const outDir = path.join(root, 'runtime/technical-capability-apex/v1');
const reportJson = path.join(outDir, 'sheikha-technical-capability-apex-v1-report.json');
const reportMd = path.join(outDir, 'sheikha-technical-capability-apex-v1-report.md');

function renderMarkdown(report) {
  return [
    '# Sheikha Technical Capability Apex V1',
    '',
    `- System: ${report.system}`,
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Score: ${report.score}`,
    `- Level: ${report.level}`,
    '',
    '## Capability Matrix',
    '',
    ...Object.entries(report.capabilityMatrix).map(([name, value]) => (
      `- ${name}: ${value.status} - ${value.purpose}`
    )),
    '',
    '## Chat Apex Order',
    '',
    ...report.chatApexOrder.map((layer, index) => `${index + 1}. ${layer}`),
    '',
    '## Governance',
    '',
    ...Object.entries(report.governance).map(([name, value]) => `- ${name}: ${value}`)
  ].join('\n');
}

function main() {
  const report = technicalCapabilityApex.status();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMd, `${renderMarkdown(report)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { main };
