'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildCivilizationalOperatingPlatform
} = require('../../core/civilizational-operating-platform/sheikha-civilizational-operating-platform-v1');

function main() {
  const report = buildCivilizationalOperatingPlatform();
  const outputDir = path.join(process.cwd(), 'runtime/civilizational-operating-platform');
  const outputFile = path.join(outputDir, 'sheikha-civilizational-operating-platform-v1-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    mode: report.mode,
    validation: report.validation.status,
    readiness: report.readiness.overall,
    architectureLayers: report.validation.architectureLayers,
    domains: report.validation.domains,
    lifecycleSteps: report.validation.lifecycleSteps,
    systemConsciousnessClaimed: report.claims.systemConsciousnessClaimed,
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
