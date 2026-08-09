#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  buildUnifiedCommerceRuntime
} = require('../../core/commerce/sheikha-unified-commerce-runtime-v1');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT = path.join(
  ROOT,
  'runtime',
  'commerce',
  'v1',
  'sheikha-unified-commerce-runtime-v1-report.json'
);

function main() {
  const report = buildUnifiedCommerceRuntime();
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({
    system: report.system,
    status: report.status,
    passed: report.passed,
    coverage: report.coverage,
    output: path.relative(ROOT, OUTPUT)
  }, null, 2)}\n`);
  process.exitCode = report.passed ? 0 : 1;
}

if (require.main === module) main();

module.exports = { main, OUTPUT };
