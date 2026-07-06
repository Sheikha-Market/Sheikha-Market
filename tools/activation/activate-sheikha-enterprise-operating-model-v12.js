'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildEnterpriseOperatingModelV12
} = require('../../core/enterprise-operating-model/sheikha-enterprise-operating-model-v12');

function main() {
  const report = buildEnterpriseOperatingModelV12();
  const outputDir = path.join(process.cwd(), 'runtime/enterprise-operating-model');
  const outputFile = path.join(outputDir, 'sheikha-enterprise-operating-model-v12-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    phase: report.phase,
    decision: report.decision,
    domains: report.validation.domains,
    requirements: report.validation.requirements,
    lifecycleStates: report.validation.lifecycleStates,
    roadmapPrograms: report.validation.roadmapPrograms,
    commercialLaunchReady: report.linkedLayers.commercialLaunchReady,
    outputFile
  }, null, 2));

  if (report.status === 'REVIEW') {
    process.exitCode = 1;
  }
}

main();
