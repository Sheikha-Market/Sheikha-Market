'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { inspectGpuRuntime } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-gpu-runtime-readiness-v1'
);

const output = path.join(process.cwd(),
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-gpu-runtime-readiness-v1.json');
const report = inspectGpuRuntime();
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
