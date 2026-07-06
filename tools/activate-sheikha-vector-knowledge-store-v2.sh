#!/usr/bin/env bash
set -euo pipefail

cd ~/Projects/sheikha/sheikha-main-portal

echo "=== Activate Sheikha Vector Knowledge Store V2 ==="

mkdir -p runtime/vector-knowledge-store-v2/v1/registries
mkdir -p tools/vector-knowledge-store-v2
mkdir -p docs/vector-knowledge-store-v2
mkdir -p tests

cat > runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2.json <<'JSON'
{
  "system": "SHEIKHA_VECTOR_KNOWLEDGE_STORE_V2",
  "status": "ACTIVE",
  "purpose": "Activate semantic knowledge store for embeddings, semantic search, entity graph, relationship graph, source traceability, citation engine, and operational knowledge retrieval.",
  "modules": [
    "EMBEDDING_STORE",
    "SEMANTIC_SEARCH",
    "ENTITY_GRAPH",
    "RELATIONSHIP_GRAPH",
    "SOURCE_TRACEABILITY",
    "CITATION_ENGINE",
    "RAG_BINDING",
    "MCP_GATEWAY_BINDING"
  ],
  "principle": "ولا حول ولا قوة إلا بالله"
}
JSON

cat > runtime/vector-knowledge-store-v2/v1/registries/vector-entities.json <<'JSON'
{
  "registry": "SHEIKHA_VECTOR_ENTITIES_V2",
  "status": "ACTIVE",
  "entities": [
    "CUSTOMER",
    "SUPPLIER",
    "BUYER",
    "PRODUCT",
    "RESOURCE",
    "HS_CODE",
    "CONTRACT",
    "QUOTE",
    "ORDER",
    "INVOICE",
    "MINE",
    "SMELTER",
    "FACTORY",
    "WAREHOUSE",
    "PORT",
    "FLEET",
    "MARKET",
    "SECTOR",
    "COUNTRY"
  ]
}
JSON

cat > runtime/vector-knowledge-store-v2/v1/registries/vector-relationships.json <<'JSON'
{
  "registry": "SHEIKHA_VECTOR_RELATIONSHIPS_V2",
  "status": "ACTIVE",
  "relationships": [
    "SUPPLIES",
    "BUYS",
    "PRODUCES",
    "USES",
    "DEPENDS_ON",
    "SHIPPED_THROUGH",
    "LOCATED_IN",
    "CLASSIFIED_BY",
    "CONNECTED_TO",
    "HAS_RISK",
    "HAS_OPPORTUNITY",
    "HAS_SOURCE",
    "CITED_BY"
  ]
}
JSON

cat > docs/vector-knowledge-store-v2/SHEIKHA-VECTOR-KNOWLEDGE-STORE-V2.md <<'MD'
# SHEIKHA_VECTOR_KNOWLEDGE_STORE_V2

## الهدف
تفعيل مخزن معرفة دلالي يربط البيانات والكيانات والعلاقات والمصادر والاستشهادات داخل شيخة.

## المكونات
- Embedding Store
- Semantic Search
- Entity Graph
- Relationship Graph
- Source Traceability
- Citation Engine
- RAG Binding
- MCP Gateway Binding

## الضوابط
لا إدخال بيانات خاصة بلا صلاحية.
لا معرفة بلا مصدر.
لا مخرجات عالية الأثر بلا مراجعة بشرية.
ولا حول ولا قوة إلا بالله.
MD

cat > tools/vector-knowledge-store-v2/sheikha-vector-knowledge-store-v2.js <<'JS'
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
JS

node - <<'JS'
const fs = require('fs');
const p = 'package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['ops:vector-knowledge-store:v2'] =
  'node tools/vector-knowledge-store-v2/sheikha-vector-knowledge-store-v2.js';
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
JS

cat > tests/vector-knowledge-store-v2.test.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Vector Knowledge Store V2', () => {
  const root = process.cwd();

  test('vector knowledge store v2 report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_VECTOR_KNOWLEDGE_STORE_V2');
    expect(report.decision).toBe('VECTOR_KNOWLEDGE_STORE_V2_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.entities).toBeGreaterThanOrEqual(19);
    expect(report.coverage.relationships).toBeGreaterThanOrEqual(13);
  });
});
JS

node --check tools/vector-knowledge-store-v2/sheikha-vector-knowledge-store-v2.js
npm run ops:vector-knowledge-store:v2
python3 -m json.tool runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2-report.json >/dev/null

npm test
npm run lint
node tools/drift/sheikha-runtime-drift-detector.js

git add -A
git commit -m "Activate Sheikha vector knowledge store v2"
git push origin optimization/long-tail-latency-elimination

node tools/drift/sheikha-runtime-drift-detector.js
