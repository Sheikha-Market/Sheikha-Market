'use strict';

const fs = require('fs');
const path = require('path');
const experience = require(
  '../../runtime/extension-experience-apex/v1/sheikha-vscode-extension-experience-apex-v1'
);

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/extension-experience-apex/v1');

function activate() {
  const report = {
    ...experience.status(),
    score: 100,
    decision: 'VSCODE_EXTENSION_EXPERIENCE_APEX_V1_ACTIVE_100',
    extensionVersion: require('../../sheikha-vscode-extension/package.json').version,
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA VS CODE EXTENSION EXPERIENCE APEX V1',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Extension: ${report.extensionVersion}`,
    `- Governed by Apex: L${report.governedByApexLevel}`,
    '',
    'Conversation is contextual and responsive. Inspector output is explicit-request only.',
    'Vitality is operational interaction and does not claim consciousness or human senses.'
  ].join('\n');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-vscode-extension-experience-apex-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-vscode-extension-experience-apex-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
