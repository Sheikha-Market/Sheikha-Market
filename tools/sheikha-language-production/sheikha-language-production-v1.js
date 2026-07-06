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
  engine: exists('runtime/sheikha-language-production/v1/sheikha-language-production-v1.json'),
  pipeline: exists('runtime/sheikha-language-production/v1/registries/language-pipeline.json'),
  clusterReadiness: exists('runtime/sheikha-language-production/v1/registries/language-cluster-readiness.json'),
  docs: exists('docs/sheikha-language-production/SHEIKHA-LANGUAGE-PRODUCTION-READINESS-V1.md'),
  logisticsNetworkProducts: exists('runtime/logistics-market-network-platform/v1/registries/network-design-products.json'),
  logisticsPlatform: exists('runtime/logistics-market-network-platform/v1/sheikha-logistics-market-network-platform-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_LANGUAGE_PRODUCTION_READINESS_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
  decision: missing.length ? 'REVIEW_LANGUAGE_PRODUCTION_READINESS_GAPS' : 'LANGUAGE_PRODUCTION_READINESS_ACTIVE_100',
  checks,
  missing,
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/sheikha-language-production/v1/sheikha-language-production-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/sheikha-language-production/v1/sheikha-language-production-v1-report.md',
  `# SHEIKHA_LANGUAGE_PRODUCTION_READINESS_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
