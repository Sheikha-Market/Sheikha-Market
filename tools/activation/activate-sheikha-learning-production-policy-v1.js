'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildPolicyCatalog } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-learning-production-policy-v1'
);

const report = buildPolicyCatalog();
const output = path.join(process.cwd(),
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-learning-production-policy-v1.json');
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
