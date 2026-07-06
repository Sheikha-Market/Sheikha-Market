'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const exists = p => fs.existsSync(path.join(ROOT, p));
const readJson = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, c) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), c);
};

const checks = {
  engine: exists('runtime/saas-platform-layer-v1/v1/sheikha-saas-platform-layer-v1.json'),
  tenantModel: exists('runtime/saas-platform-layer-v1/v1/registries/tenant-model.json'),
  subscriptionPlans: exists('runtime/saas-platform-layer-v1/v1/registries/subscription-plans.json'),
  roles: exists('runtime/saas-platform-layer-v1/v1/registries/saas-roles.json'),
  services: exists('runtime/saas-platform-layer-v1/v1/registries/saas-services.json'),
  bindings: exists('runtime/saas-platform-layer-v1/v1/registries/saas-bindings.json'),
  docs: exists('docs/saas-platform-layer-v1/SHEIKHA-SAAS-PLATFORM-LAYER-V1.md'),
  marketplaceOS: exists('runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.json'),
  projectLifecycle: exists('runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1-report.json'),
  workflowAutomation: exists('runtime/workflow-automation-engine-v1/v1/sheikha-workflow-automation-engine-v1-report.json'),
  adminImpactOS: exists('runtime/admin-methodology-information-impact-os-v1/v1/sheikha-admin-methodology-information-impact-os-v1-report.json'),
  unifiedDataFabric: exists('runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const tenantModel = readJson('runtime/saas-platform-layer-v1/v1/registries/tenant-model.json');
const plans = readJson('runtime/saas-platform-layer-v1/v1/registries/subscription-plans.json').plans;
const roles = readJson('runtime/saas-platform-layer-v1/v1/registries/saas-roles.json').roles;
const services = readJson('runtime/saas-platform-layer-v1/v1/registries/saas-services.json').services;
const bindings = readJson('runtime/saas-platform-layer-v1/v1/registries/saas-bindings.json').bindings;

const report = {
  system: 'SHEIKHA_SAAS_PLATFORM_LAYER_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_SAAS_PLATFORM_LAYER_V1_GAPS' : 'SAAS_PLATFORM_LAYER_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    tenantTypes: tenantModel.tenants.length,
    isolationRules: tenantModel.isolation.length,
    plans: plans.length,
    roles: roles.length,
    services: services.length,
    bindings: bindings.length
  },
  cycle: [
    "TENANT",
    "SUBSCRIPTION",
    "IAM",
    "SERVICE_ACCESS",
    "USAGE",
    "BILLING",
    "AUDIT",
    "RENEWAL",
    "IMPROVEMENT"
  ],
  principle: 'عبادة الله وإعمار الأرض بالحق والعدل والإحسان، ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/saas-platform-layer-v1/v1/sheikha-saas-platform-layer-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/saas-platform-layer-v1/v1/sheikha-saas-platform-layer-v1-report.md',
  `# SHEIKHA_SAAS_PLATFORM_LAYER_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
