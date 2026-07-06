'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildEnterpriseLifecycleV21
} = require('../../core/enterprise-lifecycle-v21/sheikha-enterprise-lifecycle-v21');

function main() {
  const report = buildEnterpriseLifecycleV21();
  const outputDir = path.join(process.cwd(), 'runtime/enterprise-lifecycle-v21');
  const outputFile = path.join(outputDir, 'sheikha-enterprise-lifecycle-v21-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    phase: report.phase,
    decision: report.decision,
    lifecycleStages: report.validation.lifecycleStages,
    portfolioAreas: report.validation.portfolioAreas,
    risks: report.validation.risks,
    kpis: report.validation.kpis,
    operationalGates: report.validation.operationalGates,
    requirements: report.validation.requirements,
    productionReady: report.readiness.productionReady,
    pendingOperationalGates: report.readiness.pendingOperationalGates,
    outputFile
  }, null, 2));

  if (report.status === 'REVIEW') {
    process.exitCode = 1;
  }
}

main();
