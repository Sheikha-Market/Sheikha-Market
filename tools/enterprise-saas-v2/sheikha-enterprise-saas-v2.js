'use strict';

const fs = require('fs');
const path = require('path');
const subscriptions = require('../../runtime/saas/subscriptions/subscription-manager');
const tenancy = require('../../runtime/tenancy/tenant-isolation');
const apiKeys = require('../../runtime/security/api-keys/api-key-manager');
const orchestrator = require('../../runtime/orchestrator/orchestrator-fabric');

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/saas/enterprise-v2');

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function activate() {
  const checks = {
    atomicStore: exists('runtime/saas/enterprise-v2/store.js'),
    rbac: exists('runtime/saas/enterprise-v2/rbac.js'),
    subscriptionManager: subscriptions.status().status === 'ACTIVE',
    tenantIsolation: tenancy.status().status === 'ACTIVE',
    apiKeyLifecycle: apiKeys.status().status === 'ACTIVE',
    orchestratorL11: orchestrator.status().apexLevel === 11,
    runtimeRoutes: exists('routes/enterprise-saas-v2-routes.js'),
    nodeSdk: exists('sdk/sheikha-api/index.js'),
    pythonSdk: exists('sdk/sheikha-python/sheikha_saas.py'),
    cli: exists('bin/sheikha')
  };
  const complete = Object.values(checks).every(Boolean);
  const report = {
    system: 'SHEIKHA_ENTERPRISE_SAAS_V2',
    status: complete ? 'ACTIVE' : 'INCOMPLETE',
    mode: 'GOVERNED_MULTI_TENANT_CONTROL_PLANE',
    score: complete ? 100 : 0,
    decision: complete ? 'ENTERPRISE_SAAS_V2_CONTROL_PLANE_ACTIVE_100' : 'ACTIVATION_INCOMPLETE',
    checks,
    truthfulBoundaries: {
      externalIdentityProviderConnected: false,
      billingGatewayConnected: false,
      productionDatabaseConnected: false,
      realCustomersClaimed: false,
      revenueClaimed: false,
      regulatoryLicenseClaimed: false
    },
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA ENTERPRISE SAAS V2',
    '',
    `- Status: ${report.status}`,
    `- Score: ${report.score}`,
    `- Decision: ${report.decision}`,
    '- Orchestrator: SHEIKHA_ORCHESTRATOR_FABRIC_V2 (L11)',
    '- Billing: ESTIMATE_ONLY',
    '- Regulatory license claimed: false',
    '- Production database connected: false'
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'sheikha-enterprise-saas-v2-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'sheikha-enterprise-saas-v2-report.md'), `${markdown}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!complete) process.exitCode = 1;
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
