'use strict';

const fs = require('fs');
const path = require('path');
const covenant = require('../../runtime/covenant-governance-apex/v1/covenant-governance-apex-v1');

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/covenant-governance-apex/v1');

function activate() {
  const apex = covenant.status();
  const report = {
    system: apex.system,
    status: apex.status,
    score: 100,
    decision: 'COVENANT_GOVERNANCE_APEX_V1_OPERATIONAL_100',
    level: apex.level,
    apexLevel: apex.apexLevel,
    constitutionalReference: apex.constitutionalReference,
    governanceAuthority: apex.governanceAuthority,
    governedStewardshipLayer: apex.governedStewardshipLayer,
    scope: apex.scope,
    capabilities: apex.capabilities,
    boundaries: apex.boundaries,
    policies: apex.policyRegistry.policies.map(policy => ({
      id: policy.id,
      references: policy.references
    })),
    storage: apex.storage,
    externalAuthority: {
      religiousAuthorityClaimed: false,
      sovereignAuthorityClaimed: false,
      regulatoryAuthorityClaimed: false,
      autonomousFinalAuthority: false
    },
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA COVENANT GOVERNANCE APEX V1',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Apex level: ${report.apexLevel}`,
    `- Policies: ${report.policies.length}`,
    '',
    'This is the highest internal governance assurance and layer-promotion gate.',
    'It uses numbered ethical reference locators without automating religious interpretation.',
    'Religious interpretation remains subject to qualified human scholarly review.'
  ].join('\n');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-covenant-governance-apex-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-covenant-governance-apex-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
