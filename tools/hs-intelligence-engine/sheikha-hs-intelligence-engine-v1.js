'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT, p));
const write = (p, c) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), c); };

const checks = {
  engine: exists('runtime/hs-intelligence-engine/v1/sheikha-hs-intelligence-engine-v1.json'),
  domainMap: exists('runtime/hs-intelligence-engine/v1/registries/hs-domain-map.json'),
  resourceGraph: exists('runtime/global-resource-graph-v2/v1/registries/resource-nodes.json'),
  resourceSources: exists('runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1-report.json'),
  marketplace: exists('runtime/executive-commercial-os/v1/registries/crm-sales-marketplace.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
const report = {
  system: 'SHEIKHA_HS_CODE_INTELLIGENCE_ENGINE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
  decision: missing.length ? 'REVIEW_HS_CODE_INTELLIGENCE_GAPS' : 'HS_CODE_INTELLIGENCE_ACTIVE_100',
  checks,
  missing,
  principle: 'ولا حول ولا قوة إلا بالله'
};

write('runtime/hs-intelligence-engine/v1/sheikha-hs-intelligence-engine-v1-report.json', JSON.stringify(report, null, 2) + '\n');
write('runtime/hs-intelligence-engine/v1/sheikha-hs-intelligence-engine-v1-report.md', `# SHEIKHA_HS_CODE_INTELLIGENCE_ENGINE_V1\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report, null, 2));
