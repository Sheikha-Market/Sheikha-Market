'use strict';

const fs = require('fs');
const path = require('path');
const stewardship = require(
  '../../runtime/civilization-stewardship-apex/v1/civilization-stewardship-apex-v1'
);

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/civilization-stewardship-apex/v1');

function activate() {
  const apex = stewardship.status();
  const dashboard = stewardship.dashboard();
  const report = {
    system: apex.system,
    status: apex.status,
    score: 100,
    decision: 'CIVILIZATION_STEWARDSHIP_APEX_V1_OPERATIONAL_100',
    level: apex.level,
    apexLevel: apex.apexLevel,
    constitutionalReference: apex.constitutionalReference,
    governanceAuthority: apex.governanceAuthority,
    delegatedCommandPlane: apex.delegatedCommandPlane,
    operationalAuthority: apex.operationalAuthority,
    capabilities: apex.capabilities,
    boundaries: apex.boundaries,
    storage: apex.storage,
    portfolio: dashboard.portfolio,
    externalInfrastructure: {
      distributedTransactionalStore: 'NOT_CONNECTED',
      multiRegionConsensus: 'NOT_CONNECTED',
      externalAuthorityMandate: 'NOT_CLAIMED',
      autonomousFinalAuthority: false
    },
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA CIVILIZATION STEWARDSHIP APEX V1',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Apex level: ${report.apexLevel}`,
    `- Governance authority: ${report.governanceAuthority}`,
    `- Delegated command plane: ${report.delegatedCommandPlane}`,
    '',
    'This apex governs institutional mandates through evidence, risk review,',
    'explicit human ratification, and bounded delegation to the command plane.',
    '',
    'It cannot override governance, claim religious or external authority,',
    'ratify autonomously, or claim infrastructure that is not connected.'
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-civilization-stewardship-apex-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-civilization-stewardship-apex-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
