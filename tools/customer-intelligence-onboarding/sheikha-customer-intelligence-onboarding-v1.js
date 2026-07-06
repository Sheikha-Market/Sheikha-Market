'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const exists = p => fs.existsSync(path.join(ROOT, p));
const write = (p, c) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), c);
};

const checks = {
  engine: exists('runtime/customer-intelligence-onboarding/v1/sheikha-customer-intelligence-onboarding-v1.json'),
  customerDataMap: exists('runtime/customer-intelligence-onboarding/v1/registries/customer-data-map.json'),
  supplyChainBlueprint: exists('runtime/customer-intelligence-onboarding/v1/registries/supply-chain-blueprint-map.json'),
  secureIntegrationPolicy: exists('runtime/customer-intelligence-onboarding/v1/registries/secure-integration-policy.json'),
  customerClassification: exists('runtime/customer-classification/v1/sheikha-customer-classification-v1-report.json'),
  customerRevenue: exists('runtime/customer-revenue-experience/v1/sheikha-customer-revenue-experience-v1-report.json'),
  portalV2: exists('runtime/portal-v2/v1/sheikha-portal-v2-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_CUSTOMER_INTELLIGENCE_ONBOARDING_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
  decision: missing.length ? 'REVIEW_CUSTOMER_INTELLIGENCE_ONBOARDING_GAPS' : 'CUSTOMER_INTELLIGENCE_ONBOARDING_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'REGISTRATION',
    'CONSENT',
    'AUTHORIZED_DATA_COLLECTION',
    'CUSTOMER_KNOWLEDGE_BASE',
    'SUPPLY_CHAIN_BLUEPRINT',
    'GOALS_ALIGNMENT',
    'PRODUCT_MATCHING',
    'DASHBOARD_GENERATION'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/customer-intelligence-onboarding/v1/sheikha-customer-intelligence-onboarding-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/customer-intelligence-onboarding/v1/sheikha-customer-intelligence-onboarding-v1-report.md',
  `# SHEIKHA_CUSTOMER_INTELLIGENCE_ONBOARDING_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
