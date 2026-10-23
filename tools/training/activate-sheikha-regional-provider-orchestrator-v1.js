'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { planRegionalExecution } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-regional-provider-orchestrator-v1'
);

const root = path.resolve(__dirname, '../..');
const inventoryPath = path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-regional-provider-inventory-v1.json');
const reportPath = path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-regional-provider-orchestrator-v1-report.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const report = planRegionalExecution({
  workload: 'LARGE_LLM_TRAINING', zone: 'SAUDI_ARABIA', gpuRequired: true
}, inventory.providers);
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  status: report.status,
  selected: report.selected,
  executionStarted: report.executionStarted,
  providersEvaluated: report.evaluations.length,
  report: path.relative(root, reportPath)
}, null, 2)}\n`);
