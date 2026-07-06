'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildHumanCenteredKnowledgeCivilizationPlatform
} = require('../../core/human-centered-knowledge-civilization-platform/sheikha-human-centered-knowledge-civilization-platform-v1');

function main() {
  const report = buildHumanCenteredKnowledgeCivilizationPlatform();
  const outputDir = path.join(process.cwd(), 'runtime/human-centered-knowledge-civilization-platform');
  const outputFile = path.join(
    outputDir,
    'sheikha-human-centered-knowledge-civilization-platform-v1-report.json'
  );

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    mode: report.mode,
    decision: report.decision,
    validation: report.validation.status,
    readiness: report.readiness.overall,
    pillars: report.validation.pillars,
    platformStages: report.validation.platformStages,
    recommendationFlowSteps: report.validation.recommendationFlowSteps,
    executionIntegrations: report.validation.executionIntegrations,
    machineConsciousnessClaimed: report.claims.machineConsciousnessClaimed,
    agiClaimed: report.claims.agiClaimed,
    asiClaimed: report.claims.asiClaimed,
    noHarm: report.governance.noHarm,
    outputFile
  }, null, 2));

  if (report.validation.status !== 'PASSED') {
    process.exitCode = 1;
  }
}

main();
