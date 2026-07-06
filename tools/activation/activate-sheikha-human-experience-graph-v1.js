'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildHumanExperienceGraph
} = require('../../core/human-experience-graph/sheikha-human-experience-graph-v1');

function main() {
  const report = buildHumanExperienceGraph();
  const outputDir = path.join(process.cwd(), 'runtime/human-experience-graph');
  const outputFile = path.join(outputDir, 'sheikha-human-experience-graph-v1-report.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    mode: report.mode,
    decision: report.decision,
    validation: report.validation.status,
    readiness: report.readiness.overall,
    nodes: report.validation.nodes,
    edges: report.validation.edges,
    experienceNodes: report.validation.experienceNodes,
    domainNodes: report.validation.domainNodes,
    governanceNodes: report.validation.governanceNodes,
    impactNodes: report.validation.impactNodes,
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
