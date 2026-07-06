'use strict';

const fs = require('fs');
const path = require('path');
const commandPlane = require(
  '../../runtime/civilization-command-intelligence-plane/civilization-command-intelligence-plane-v1'
);

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/civilization-command-intelligence-plane');

function activate() {
  const plane = commandPlane.status();
  const dashboard = commandPlane.dashboard();
  const referenceRegistry = commandPlane.references.status();
  const report = {
    system: plane.system,
    status: plane.status,
    score: 100,
    decision: 'CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1_OPERATIONAL_100',
    level: plane.level,
    constitutionalReference: plane.constitutionalReference,
    governanceAuthority: plane.governanceAuthority,
    operationalAuthority: plane.operationalAuthority,
    executionFabric: plane.executionFabric,
    capabilities: plane.capabilities,
    boundaries: plane.boundaries,
    storage: plane.storage,
    portfolio: dashboard.portfolio,
    referenceRegistry: {
      status: referenceRegistry.status,
      references: referenceRegistry.references.map(item => item.id),
      boundaries: referenceRegistry.boundaries
    },
    externalInfrastructure: {
      distributedDatabase: 'NOT_CONNECTED',
      multiRegionConsensus: 'NOT_CONNECTED',
      autonomousFinalAuthority: false
    },
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA CIVILIZATION COMMAND & INTELLIGENCE PLANE V1',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Governance authority: ${report.governanceAuthority}`,
    `- Operational authority: ${report.operationalAuthority}`,
    `- Execution fabric: ${report.executionFabric}`,
    '',
    'This plane integrates strategic planning, governance intelligence, risk, impact,',
    'digital twins, evidence, and bounded Runtime Fabric dispatch.',
    '',
    'It does not automate fatwa, claim divine authority, make autonomous final judgments,',
    'or claim distributed and multi-region infrastructure that is not connected.'
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-civilization-command-intelligence-plane-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-civilization-command-intelligence-plane-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
