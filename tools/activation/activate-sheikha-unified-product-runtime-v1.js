#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  buildUnifiedProductRuntime
} = require(
  '../../core/product-runtime/sheikha-unified-product-runtime-v1'
);

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT = path.join(
  ROOT,
  'runtime/product-runtime/v1/' +
    'sheikha-unified-product-runtime-v1-report.json'
);

function activate() {
  const report = buildUnifiedProductRuntime();
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) {
  const report = activate();
  process.stdout.write(`${JSON.stringify({
    system: report.system,
    status: report.status,
    products: report.products.length,
    passed: report.passed,
    failedChecks: report.failedChecks,
    output: path.relative(ROOT, OUTPUT)
  }, null, 2)}\n`);
  if (!report.passed) process.exitCode = 1;
}

module.exports = {
  OUTPUT,
  activate
};
