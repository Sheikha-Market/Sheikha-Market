'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildEnterpriseOperatingSystemV13
} = require('../../core/enterprise-operating-system-v13/sheikha-enterprise-operating-system-v13');

function main() {
  const report = buildEnterpriseOperatingSystemV13();
  const outputDir = path.join(process.cwd(), 'runtime/enterprise-operating-system-v13');
  const outputFile = path.join(outputDir, 'sheikha-enterprise-operating-system-v13-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    phase: report.phase,
    decision: report.decision,
    programs: report.validation.programs,
    capabilities: report.validation.capabilities,
    compositionLayers: report.validation.compositionLayers,
    commercialLaunchReady: report.linkedLayers.commercialLaunchReady,
    outputFile
  }, null, 2));

  if (report.status === 'REVIEW') {
    process.exitCode = 1;
  }
}

main();
