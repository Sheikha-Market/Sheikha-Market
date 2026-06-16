'use strict';

const fs = require('fs');
const path = require('path');
const streamingChatApex = require(
  '../../runtime/streaming-chat-apex/v1/sheikha-streaming-chat-apex-v1'
);

const root = path.join(__dirname, '..', '..');
const outDir = path.join(root, 'runtime/streaming-chat-apex/v1');
const reportJson = path.join(outDir, 'sheikha-streaming-chat-apex-v1-report.json');
const reportMd = path.join(outDir, 'sheikha-streaming-chat-apex-v1-report.md');

function renderMarkdown(report) {
  return [
    '# Sheikha Streaming Multilingual Chat Apex V1',
    '',
    `- System: ${report.system}`,
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Score: ${report.score}`,
    `- Level: ${report.level}`,
    '',
    '## Protocols',
    '',
    ...Object.entries(report.protocols).map(([name, value]) => `- ${name}: ${value}`),
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
  const report = streamingChatApex.status();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMd, `${renderMarkdown(report)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { main };
