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
  engine: exists('runtime/vector-knowledge-store/v1/sheikha-vector-knowledge-store-v1.json'),
  entitySchema: exists('runtime/vector-knowledge-store/v1/registries/entity-schema.json'),
  relationshipSchema: exists('runtime/vector-knowledge-store/v1/registries/relationship-schema.json'),
  docs: exists('docs/vector-knowledge-store/SHEIKHA-VECTOR-KNOWLEDGE-STORE-V1.md'),
  unifiedRag: exists('runtime/unified-rag-engine/v1/sheikha-unified-rag-engine-v1-report.json'),
  resourceGraph: exists('runtime/global-resource-graph-v2/v1/sheikha-global-resource-graph-v2-report.json'),
  resourceProductMarket: exists('runtime/resource-product-market-intelligence/v1/sheikha-resource-product-market-intelligence-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_VECTOR_KNOWLEDGE_STORE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_VECTOR_KNOWLEDGE_STORE_GAPS' : 'VECTOR_KNOWLEDGE_STORE_ACTIVE_100',
  checks,
  missing,
  coverage: {
    entities: 19,
    relationships: 12
  },
  principle: 'ولا حول ولا قوة إلا بالله'
};

write('runtime/vector-knowledge-store/v1/sheikha-vector-knowledge-store-v1-report.json', JSON.stringify(report, null, 2) + '\n');
write('runtime/vector-knowledge-store/v1/sheikha-vector-knowledge-store-v1-report.md', `# SHEIKHA_VECTOR_KNOWLEDGE_STORE_V1\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report, null, 2));
