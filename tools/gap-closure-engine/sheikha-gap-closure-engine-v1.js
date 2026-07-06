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
  engine: exists('runtime/gap-closure-engine/v1/sheikha-gap-closure-engine-v1.json'),
  taxonomy: exists('runtime/gap-closure-engine/v1/registries/gap-taxonomy.json'),
  closureCycle: exists('runtime/gap-closure-engine/v1/registries/gap-closure-cycle.json'),
  gapToProduct: exists('runtime/gap-closure-engine/v1/registries/gap-to-product-map.json'),
  customerIntelligence: exists('runtime/customer-intelligence-onboarding/v1/sheikha-customer-intelligence-onboarding-v1-report.json'),
  visualChain: exists('runtime/visual-chain-experience/v1/sheikha-visual-chain-experience-v1-report.json'),
  portalV2: exists('runtime/portal-v2/v1/sheikha-portal-v2-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_GAP_CLOSURE_ENGINE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
  decision: missing.length ? 'REVIEW_GAP_CLOSURE_ENGINE_GAPS' : 'GAP_CLOSURE_ENGINE_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'DETECT',
    'CLASSIFY',
    'MEASURE',
    'ROOT_CAUSE',
    'SOLUTION_DESIGN',
    'RESOURCE_MAPPING',
    'IMPLEMENTATION',
    'PRODUCT_OR_KNOWLEDGE',
    'IMPACT',
    'PREVENTION'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/gap-closure-engine/v1/sheikha-gap-closure-engine-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/gap-closure-engine/v1/sheikha-gap-closure-engine-v1-report.md',
  `# SHEIKHA_GAP_CLOSURE_ENGINE_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
