'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildProductionHardeningClosure
} = require('../../core/production-hardening/sheikha-production-hardening-closure-v1');

async function main() {
  const report = await buildProductionHardeningClosure();
  const outputDir = path.join(process.cwd(), 'runtime/production-hardening');
  const outputFile = path.join(outputDir, 'sheikha-production-hardening-closure-v1-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify(report, null, 2));

  if (report.status === 'BLOCKED') {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[SHEIKHA PRODUCTION HARDENING CLOSURE ERROR]', error.stack || error.message);
  process.exitCode = 1;
});
