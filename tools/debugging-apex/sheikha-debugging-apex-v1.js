'use strict';

const fs = require('fs');
const path = require('path');
const debuggingApex = require(
  '../../runtime/debugging-apex/v1/sheikha-debugging-apex-v1'
);

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/debugging-apex/v1');

function activate() {
  const report = {
    ...debuggingApex.status(),
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA DEBUGGING APEX V1',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Level: ${report.level}`,
    '',
    '## Workflow',
    '',
    ...report.workflow.map((step, index) => `${index + 1}. ${step}`),
    '',
    '## Policies',
    '',
    ...Object.entries(report.policies).map(([key, value]) => `- ${key}: ${value}`),
    '',
    'Debugging Apex is a governed diagnostics and repair-planning layer. It does not perform destructive actions without human approval.'
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-debugging-apex-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-debugging-apex-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
