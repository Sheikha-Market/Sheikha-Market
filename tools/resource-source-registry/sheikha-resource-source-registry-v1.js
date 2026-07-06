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
  engine: exists('runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1.json'),
  sourceTaxonomy: exists('runtime/resource-source-registry/v1/registries/source-type-taxonomy.json'),
  materialMap: exists('runtime/resource-source-registry/v1/registries/material-classification-map.json'),
  sourceChainFlow: exists('runtime/resource-source-registry/v1/registries/source-chain-flow.json'),
  availabilityLevels: exists('runtime/resource-source-registry/v1/registries/availability-levels.json'),
  gapClosure: exists('runtime/gap-closure-engine/v1/sheikha-gap-closure-engine-v1-report.json'),
  visualChain: exists('runtime/visual-chain-experience/v1/sheikha-visual-chain-experience-v1-report.json'),
  customerIntelligence: exists('runtime/customer-intelligence-onboarding/v1/sheikha-customer-intelligence-onboarding-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_RESOURCE_SOURCE_REGISTRY_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
  decision: missing.length ? 'REVIEW_RESOURCE_SOURCE_REGISTRY_GAPS' : 'RESOURCE_SOURCE_REGISTRY_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'SOURCE_IDENTIFICATION',
    'SOURCE_VERIFICATION',
    'HS_CLASSIFICATION',
    'MATERIAL_INSPECTION',
    'QUANTITY_CONFIRMATION',
    'LOGISTICS_PLANNING',
    'CONTRACT_OR_PO',
    'GREEN_AND_CIRCULAR_IMPACT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1-report.md',
  `# SHEIKHA_RESOURCE_SOURCE_REGISTRY_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
