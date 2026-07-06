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
  engine: exists('runtime/advisory-services/v1/sheikha-advisory-services-v1.json'),
  catalog: exists('runtime/advisory-services/v1/registries/advisory-product-catalog.json'),
  workflow: exists('runtime/advisory-services/v1/registries/advisory-workflow.json'),
  outputs: exists('runtime/advisory-services/v1/registries/advisory-output-templates.json'),
  pricing: exists('runtime/advisory-services/v1/registries/advisory-pricing-packages.json'),
  gapClosure: exists('runtime/gap-closure-engine/v1/sheikha-gap-closure-engine-v1-report.json'),
  resourceSources: exists('runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1-report.json'),
  customerIntelligence: exists('runtime/customer-intelligence-onboarding/v1/sheikha-customer-intelligence-onboarding-v1-report.json'),
  customerRevenue: exists('runtime/customer-revenue-experience/v1/sheikha-customer-revenue-experience-v1-report.json'),
  visualChain: exists('runtime/visual-chain-experience/v1/sheikha-visual-chain-experience-v1-report.json'),
  portalV2: exists('runtime/portal-v2/v1/sheikha-portal-v2-report.json'),
  html: exists('public/sheikha-advisory/index.html'),
  css: exists('public/sheikha-advisory/advisory.css'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_ADVISORY_SERVICES_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 7) : 100,
  decision: missing.length ? 'REVIEW_ADVISORY_SERVICES_GAPS' : 'ADVISORY_SERVICES_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'CLIENT_REGISTRATION',
    'CLASSIFICATION',
    'ASSESSMENT',
    'GAP_ANALYSIS',
    'RESOURCE_ANALYSIS',
    'RECOMMENDATIONS',
    'REPORT',
    'ROADMAP',
    'KPIS',
    'CONTRACT',
    'FOLLOW_UP',
    'IMPACT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/advisory-services/v1/sheikha-advisory-services-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/advisory-services/v1/sheikha-advisory-services-v1-report.md',
  `# SHEIKHA_ADVISORY_SERVICES_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
