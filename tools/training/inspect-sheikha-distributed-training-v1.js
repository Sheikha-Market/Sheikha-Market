'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { assessDistributedTraining } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-distributed-llm-training-v1'
);

const root = path.resolve(__dirname, '../..');
const inventoryPath = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-training-cluster-inventory-v1.json'
);
const reportPath = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-distributed-training-v1-report.json'
);
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const report = assessDistributedTraining({ parametersB: 7, nodes: inventory.nodes });

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ status: report.status, blockers: report.blockers, report: path.relative(root, reportPath) }, null, 2)}\n`);
