'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildEnterpriseReferenceSystemV1
} = require('../../core/enterprise-reference-system/sheikha-enterprise-reference-system-v1');

function main() {
  const report = buildEnterpriseReferenceSystemV1();
  const outputDir = path.join(process.cwd(), 'runtime/enterprise-reference-system');
  const outputFile = path.join(outputDir, 'sheikha-enterprise-reference-system-v1-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    decision: report.decision,
    sections: report.validation.sections,
    requiredItems: report.validation.requiredItems,
    contracts: report.contractIndex.length,
    domains: report.domainIndex.length,
    commercialLaunchReady: report.linkedLayers.commercialLaunchReady,
    outputFile
  }, null, 2));

  if (report.status === 'REVIEW') {
    process.exitCode = 1;
  }
}

main();
