'use strict';

const fs = require('fs');
const path = require('path');
const vitalChatApex = require(
  '../../runtime/vital-chat-apex/v1/sheikha-vital-chat-apex-v1'
);

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/vital-chat-apex/v1');

function activate() {
  const report = {
    ...vitalChatApex.status(),
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA VITAL CHAT APEX V1',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Level: ${report.level}`,
    '',
    '## Integrated Layers',
    '',
    `- Conversation Engine: ${report.stack.conversationEngine}`,
    `- Session Memory: ${report.stack.sessionMemory}`,
    `- Context Memory: ${report.stack.contextMemory}`,
    `- VS Code Workspace Awareness: ${report.stack.workspaceAwareness}`,
    `- Git Awareness: ${report.stack.gitAwareness}`,
    `- Project Awareness: ${report.stack.projectAwareness}`,
    `- Extension Experience Apex: ${report.stack.extensionExperienceApex}`,
    '',
    '## Boundaries',
    '',
    '- Vitality means responsive operational interaction, not human consciousness.',
    '- Inspector output stays explicit-request only.',
    '- Persisted memory requires consent.',
    '- High-impact actions require human approval.'
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-vital-chat-apex-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-vital-chat-apex-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
