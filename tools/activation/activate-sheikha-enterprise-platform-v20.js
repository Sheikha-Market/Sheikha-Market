'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildEnterprisePlatformV20
} = require('../../core/enterprise-platform-v20/sheikha-enterprise-platform-v20');

function main() {
  const report = buildEnterprisePlatformV20();
  const outputDir = path.join(process.cwd(), 'runtime/enterprise-platform-v20');
  const outputFile = path.join(outputDir, 'sheikha-enterprise-platform-v20-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    phase: report.phase,
    decision: report.decision,
    kernelItems: report.validation.kernelItems,
    capabilities: report.validation.capabilities,
    domains: report.validation.domains,
    contracts: report.validation.contracts,
    registries: report.validation.registries,
    maturityGates: report.validation.maturityGates,
    requirements: report.validation.requirements,
    commercialLaunchReady: report.linkedLayers.commercialLaunchReady,
    outputFile
  }, null, 2));

  if (report.status === 'REVIEW') {
    process.exitCode = 1;
  }
}

main();
