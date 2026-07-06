'use strict';

const fs = require('fs');
const path = require('path');
const extensionStreamingArtifactApex = require(
  '../../runtime/extension-streaming-artifact-apex/v1/sheikha-extension-streaming-artifact-apex-v1'
);

const root = path.join(__dirname, '..', '..');
const outDir = path.join(root, 'runtime/extension-streaming-artifact-apex/v1');
const reportJson = path.join(outDir, 'sheikha-extension-streaming-artifact-apex-v1-report.json');
const reportMd = path.join(outDir, 'sheikha-extension-streaming-artifact-apex-v1-report.md');

function renderMarkdown(report) {
  return [
    '# Sheikha Extension Streaming Artifact Apex V1',
    '',
    `- System: ${report.system}`,
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Score: ${report.score}`,
    `- Level: ${report.level}`,
    '',
    '## Capabilities',
    '',
    ...Object.entries(report.capabilities).map(([name, value]) => `- ${name}: ${value}`),
    '',
    '## Transport',
    '',
    ...Object.entries(report.transport.endpoints).map(([name, value]) => `- ${name}: ${value}`),
    '',
    '## Artifact Policy',
    '',
    ...Object.entries(report.artifactPolicy).map(([name, value]) => `- ${name}: ${Array.isArray(value) ? value.join(', ') : value}`),
    '',
    '## Governance',
    '',
    ...Object.entries(report.governance).map(([name, value]) => `- ${name}: ${value}`)
  ].join('\n');
}

function main() {
  const report = extensionStreamingArtifactApex.status();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMd, `${renderMarkdown(report)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { main };
