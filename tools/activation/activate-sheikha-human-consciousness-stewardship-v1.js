'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildHumanConsciousnessStewardshipReport
} = require('../../core/human-consciousness-stewardship/sheikha-human-consciousness-stewardship-v1');

function main() {
  const report = buildHumanConsciousnessStewardshipReport();
  const outputDir = path.join(process.cwd(), 'runtime/human-consciousness-stewardship');
  const outputFile = path.join(outputDir, 'sheikha-human-consciousness-stewardship-v1-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    mode: report.mode,
    validation: report.validation.status,
    readiness: report.readiness.overall,
    humanAuthority: report.authority.humanAuthority,
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
