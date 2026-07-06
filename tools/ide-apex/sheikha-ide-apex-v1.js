'use strict';

const fs = require('fs');
const path = require('path');
const ideApex = require('../../runtime/ide-apex/v1/sheikha-ide-apex-v1');

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/ide-apex/v1');

function activate() {
  const report = {
    ...ideApex.status(),
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA IDE APEX V1',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Level: ${report.level}`,
    `- Position: ${report.position}`,
    '',
    '## Capabilities',
    '',
    ...report.capabilities.map((capability) => `- ${capability}`),
    '',
    '## Transport Policy',
    '',
    ...Object.entries(report.transportPolicy).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Governance',
    '',
    ...Object.entries(report.governance).map(([key, value]) => `- ${key}: ${value}`)
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-ide-apex-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-ide-apex-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
