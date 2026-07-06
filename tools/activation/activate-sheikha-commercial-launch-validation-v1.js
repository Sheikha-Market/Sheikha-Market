'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildCommercialLaunchValidation
} = require('../../core/commercial-launch-validation/sheikha-commercial-launch-validation-v1');

function main() {
  const report = buildCommercialLaunchValidation();
  const outputDir = path.join(process.cwd(), 'runtime/commercial-launch-validation');
  const outputFile = path.join(outputDir, 'sheikha-commercial-launch-validation-v1-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    decision: report.decision,
    commercialLaunchReady: report.readiness.commercialLaunchReady,
    pending: report.pending.length,
    outputFile
  }, null, 2));

  if (report.status === 'BLOCKED') {
    process.exitCode = 1;
  }
}

main();
