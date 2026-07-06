'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildEnterpriseConstitutionV1
} = require('../../core/enterprise-constitution/sheikha-enterprise-constitution-v1');

function main() {
  const report = buildEnterpriseConstitutionV1();
  const outputDir = path.join(process.cwd(), 'runtime/enterprise-constitution');
  const outputFile = path.join(outputDir, 'sheikha-enterprise-constitution-v1-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    decision: report.decision,
    standards: report.validation.standards,
    requiredItems: report.validation.requiredItems,
    commercialLaunchReady: report.linkedLayers.commercialLaunchReady,
    outputFile
  }, null, 2));

  if (report.status === 'BLOCKED') {
    process.exitCode = 1;
  }
}

main();
