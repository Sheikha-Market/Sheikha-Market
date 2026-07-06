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
  engine: exists('runtime/visual-chain-experience/v1/sheikha-visual-chain-experience-v1.json'),
  visualFlows: exists('runtime/visual-chain-experience/v1/registries/visual-flow-types.json'),
  graphicsTech: exists('runtime/visual-chain-experience/v1/registries/graphics-tech-registry.json'),
  customerChainBlueprint: exists('runtime/visual-chain-experience/v1/registries/customer-chain-blueprint.json'),
  customerIntelligence: exists('runtime/customer-intelligence-onboarding/v1/sheikha-customer-intelligence-onboarding-v1-report.json'),
  portalV2: exists('runtime/portal-v2/v1/sheikha-portal-v2-report.json'),
  customerRevenue: exists('runtime/customer-revenue-experience/v1/sheikha-customer-revenue-experience-v1-report.json'),
  html: exists('public/sheikha-visual-chain/index.html'),
  css: exists('public/sheikha-visual-chain/visual-chain.css'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_VISUAL_CHAIN_EXPERIENCE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
  decision: missing.length ? 'REVIEW_VISUAL_CHAIN_EXPERIENCE_GAPS' : 'VISUAL_CHAIN_EXPERIENCE_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'CUSTOMER_PROFILE',
    'ORDER_OR_CONTRACT_TYPE',
    'SUPPLY_CHAIN_MAP',
    'VISUAL_DASHBOARD',
    'GRAPHICS_RENDERING',
    'VIDEO_STORYBOARD',
    'IMPACT_MEASUREMENT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/visual-chain-experience/v1/sheikha-visual-chain-experience-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/visual-chain-experience/v1/sheikha-visual-chain-experience-v1-report.md',
  `# SHEIKHA_VISUAL_CHAIN_EXPERIENCE_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
