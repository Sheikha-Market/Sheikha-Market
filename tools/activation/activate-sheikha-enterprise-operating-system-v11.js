'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildEnterpriseOperatingSystemV11
} = require('../../core/enterprise-operating-system/sheikha-enterprise-operating-system-v11');

function main() {
  const report = buildEnterpriseOperatingSystemV11();
  const outputDir = path.join(process.cwd(), 'runtime/enterprise-operating-system');
  const outputFile = path.join(outputDir, 'sheikha-enterprise-operating-system-v11-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    decision: report.decision,
    productionCandidateReady: report.readiness.productionCandidateReady,
    commercialLaunchReady: report.readiness.commercialLaunchReady,
    currentReleaseStage: report.enterpriseReleaseFabric.currentStage,
    outputFile
  }, null, 2));

  if (report.status === 'BLOCKED') {
    process.exitCode = 1;
  }
}

main();
