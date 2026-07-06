'use strict';

const fs = require('fs');
const path = require('path');
const chatInterfaceApex = require(
  '../../runtime/chat-interface-apex/v1/sheikha-chat-interface-apex-v1'
);

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/chat-interface-apex/v1');

function activate() {
  const report = {
    ...chatInterfaceApex.status(),
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA CHAT INTERFACE APEX V1',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Level: ${report.level}`,
    `- Position: ${report.position}`,
    '',
    '## Template Regions',
    '',
    ...report.template.regions.map((region) => `- ${region}`),
    '',
    '## Controls',
    '',
    ...report.template.controls.map((control) => `- ${control}`),
    '',
    '## Governance',
    '',
    ...Object.entries(report.interfaceGovernance).map(([key, value]) => `- ${key}: ${value}`),
    '',
    'This layer governs the advanced chat and VS Code interface template. It provides interactive vitality without claiming consciousness, AGI, or ASI runtime.'
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-chat-interface-apex-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-chat-interface-apex-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
