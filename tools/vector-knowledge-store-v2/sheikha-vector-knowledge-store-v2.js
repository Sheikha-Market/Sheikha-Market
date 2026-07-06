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
  engine: exists('runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2.json'),
  entities: exists('runtime/vector-knowledge-store-v2/v1/registries/vector-entities.json'),
  relationships: exists('runtime/vector-knowledge-store-v2/v1/registries/vector-relationships.json'),
  docs: exists('docs/vector-knowledge-store-v2/SHEIKHA-VECTOR-KNOWLEDGE-STORE-V2.md'),
  unifiedDataFabric: exists('runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'),
  unifiedRag: exists('runtime/unified-rag-engine/v1/sheikha-unified-rag-engine-v1-report.json'),
  vectorStoreV1: exists('runtime/vector-knowledge-store/v1/sheikha-vector-knowledge-store-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  commercialOps: exists('runtime/executive-dashboard-generator-v2/v1/sheikha-commercial-ops-v2-summary.json'),
  controlTower: exists('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const entities = exists('runtime/vector-knowledge-store-v2/v1/registries/vector-entities.json')
  ? readJson('runtime/vector-knowledge-store-v2/v1/registries/vector-entities.json').entities
  : [];

const relationships = exists('runtime/vector-knowledge-store-v2/v1/registries/vector-relationships.json')
  ? readJson('runtime/vector-knowledge-store-v2/v1/registries/vector-relationships.json').relationships
  : [];

const report = {
  system: 'SHEIKHA_VECTOR_KNOWLEDGE_STORE_V2',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_VECTOR_KNOWLEDGE_STORE_V2_GAPS' : 'VECTOR_KNOWLEDGE_STORE_V2_ACTIVE_100',
  checks,
  missing,
  coverage: {
    entities: entities.length,
    relationships: relationships.length
  },
  cycle: [
    'DATA_SOURCE',
    'ENTITY',
    'RELATIONSHIP',
    'EMBEDDING',
    'SEMANTIC_SEARCH',
    'SOURCE_TRACE',
    'CITATION',
    'RAG',
    'MCP',
    'DASHBOARD'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2-report.md',
  `# SHEIKHA_VECTOR_KNOWLEDGE_STORE_V2

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
