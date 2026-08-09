'use strict';

const fs = require('node:fs');
const path = require('node:path');
const fabric = require(
  '../../core/organization/sheikha-autonomous-role-dashboard-fabric-v1'
);

const root = path.resolve(__dirname, '..', '..');
const outputDir = path.join(root, 'runtime', 'organization-control', 'v1');
const reportPath = path.join(
  outputDir,
  'sheikha-autonomous-role-dashboard-fabric-v1-report.json'
);

const status = fabric.status();
const roles = fabric.listRoles();
const zeroHumanModel = fabric.buildOperatingModel({ humanOperators: 0 });
const ownerDashboard = fabric.designDashboard({ roleId: 'OWNER' });
const report = {
  system: status.system,
  status: status.status,
  generatedAt: new Date().toISOString(),
  evidence: {
    roleCount: roles.count,
    defaultHumanOperatorCount: zeroHumanModel.activeHumanOperators,
    autonomousRoleAssignments: zeroHumanModel.autonomousRoleAssignments,
    ownerDashboardGenerated: ownerDashboard.status === 'GENERATED_FROM_ROLE_CONTRACT',
    bindingDecisionAutomation: status.operatingModel.bindingDecisionAutomation
  },
  boundaries: status.governance
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
