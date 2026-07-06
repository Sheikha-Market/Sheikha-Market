'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildEnterpriseOperatingPlatformV9
} = require('../../core/enterprise-operating-platform/sheikha-enterprise-operating-platform-v9');

function writeReport(report) {
  const outputDir = path.join(process.cwd(), 'runtime/enterprise-operating-platform');
  const outputFile = path.join(outputDir, 'sheikha-enterprise-operating-platform-v9-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  return outputFile;
}

function main() {
  const report = buildEnterpriseOperatingPlatformV9();
  const outputFile = writeReport(report);

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    decision: report.decision,
    healthScore: report.readiness.healthScore,
    productionCandidateReady: report.readiness.productionCandidateReady,
    commercialLaunchReady: report.readiness.commercialLaunchReady,
    outputFile
  }, null, 2));

  if (report.status === 'BLOCKED') {
    process.exitCode = 1;
  }
}

main();
