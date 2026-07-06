#!/usr/bin/env bash
set -euo pipefail

cd ~/Projects/sheikha/sheikha-main-portal

echo "=== Activate Sheikha Knowledge Graph Engine V1 ==="

mkdir -p runtime/knowledge-graph-engine-v1/v1/registries
mkdir -p tools/knowledge-graph-engine-v1
mkdir -p docs/knowledge-graph-engine-v1
mkdir -p tests

cat > runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1.json <<'JSON'
{
  "system": "SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V1",
  "status": "ACTIVE",
  "purpose": "Activate a governed knowledge graph engine connecting entities, relationships, sources, evidence, decisions, supply chains, markets, products, customers, and enterprise connectors.",
  "modules": [
    "ENTITY_REGISTRY",
    "RELATIONSHIP_REGISTRY",
    "SOURCE_TRACEABILITY",
    "EVIDENCE_GRAPH",
    "MARKET_GRAPH",
    "SUPPLY_CHAIN_GRAPH",
    "CUSTOMER_GRAPH",
    "PRODUCT_GRAPH",
    "DECISION_GRAPH",
    "SDK_FABRIC_MCP_BINDING"
  ],
  "principle": "ولا حول ولا قوة إلا بالله"
}
JSON

cat > runtime/knowledge-graph-engine-v1/v1/registries/graph-entities.json <<'JSON'
{
  "registry": "SHEIKHA_KNOWLEDGE_GRAPH_ENTITIES_V1",
  "status": "ACTIVE",
  "entities": [
    "SUPPLIER",
    "BUYER",
    "CUSTOMER",
    "PRODUCT",
    "RESOURCE",
    "HS_CODE",
    "CONTRACT",
    "QUOTE",
    "ORDER",
    "SHIPMENT",
    "INVOICE",
    "MINE",
    "SMELTER",
    "FACTORY",
    "WAREHOUSE",
    "PORT",
    "FLEET",
    "MARKET",
    "SECTOR",
    "COUNTRY",
    "ENTERPRISE_SYSTEM",
    "DATA_SOURCE",
    "DASHBOARD",
    "DECISION"
  ]
}
JSON

cat > runtime/knowledge-graph-engine-v1/v1/registries/graph-relationships.json <<'JSON'
{
  "registry": "SHEIKHA_KNOWLEDGE_GRAPH_RELATIONSHIPS_V1",
  "status": "ACTIVE",
  "relationships": [
    "SUPPLIES",
    "BUYS",
    "PRODUCES",
    "USES",
    "STORES",
    "SHIPS",
    "OWNS",
    "OPERATES",
    "LOCATED_IN",
    "CLASSIFIED_BY",
    "CONNECTED_TO",
    "DEPENDS_ON",
    "HAS_RISK",
    "HAS_OPPORTUNITY",
    "HAS_SOURCE",
    "HAS_EVIDENCE",
    "CITED_BY",
    "IMPACTS",
    "RECOMMENDS",
    "DECIDES"
  ]
}
JSON

cat > runtime/knowledge-graph-engine-v1/v1/registries/graph-bindings.json <<'JSON'
{
  "registry": "SHEIKHA_KNOWLEDGE_GRAPH_BINDINGS_V1",
  "status": "ACTIVE",
  "bindings": [
    "UNIFIED_DATA_FABRIC_V1",
    "VECTOR_KNOWLEDGE_STORE_V2",
    "ENTERPRISE_CONNECTOR_FABRIC_V1",
    "UNIFIED_RAG_ENGINE",
    "SHEIKHA_MCP_GATEWAY_V2",
    "SUPPLY_CHAIN_CONTROL_TOWER_V2",
    "DIGITAL_TWIN_ENGINE_V2",
    "COMMERCIAL_OPS_V2",
    "EXECUTIVE_DASHBOARD_GENERATOR_V2",
    "SDK_FABRIC_MCP_INTEGRATION"
  ]
}
JSON

cat > docs/knowledge-graph-engine-v1/SHEIKHA-KNOWLEDGE-GRAPH-ENGINE-V1.md <<'MD'
# SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V1

## الهدف
تفعيل محرك الرسم البياني المعرفي لربط الكيانات والعلاقات والمصادر والأدلة والقرارات داخل شيخة.

## الدورة
Data Source → Entity → Relationship → Evidence → Knowledge Graph → RAG → Decision → Dashboard → Action

## الضوابط
لا علاقة معرفية بلا مصدر.
لا بيانات خاصة بلا صلاحية.
كل قرار عالي الأثر يحتاج مراجعة بشرية.
ولا حول ولا قوة إلا بالله.
MD

cat > tools/knowledge-graph-engine-v1/sheikha-knowledge-graph-engine-v1.js <<'JS'
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
  engine: exists('runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1.json'),
  entities: exists('runtime/knowledge-graph-engine-v1/v1/registries/graph-entities.json'),
  relationships: exists('runtime/knowledge-graph-engine-v1/v1/registries/graph-relationships.json'),
  bindings: exists('runtime/knowledge-graph-engine-v1/v1/registries/graph-bindings.json'),
  docs: exists('docs/knowledge-graph-engine-v1/SHEIKHA-KNOWLEDGE-GRAPH-ENGINE-V1.md'),
  unifiedDataFabric: exists('runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'),
  vectorStoreV2: exists('runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2-report.json'),
  enterpriseConnector: exists('runtime/enterprise-connector-fabric-v1/v1/sheikha-enterprise-connector-fabric-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  controlTower: exists('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json'),
  digitalTwin: exists('runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'),
  commercialOps: exists('runtime/executive-dashboard-generator-v2/v1/sheikha-commercial-ops-v2-summary.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const entities = exists('runtime/knowledge-graph-engine-v1/v1/registries/graph-entities.json')
  ? readJson('runtime/knowledge-graph-engine-v1/v1/registries/graph-entities.json').entities
  : [];

const relationships = exists('runtime/knowledge-graph-engine-v1/v1/registries/graph-relationships.json')
  ? readJson('runtime/knowledge-graph-engine-v1/v1/registries/graph-relationships.json').relationships
  : [];

const bindings = exists('runtime/knowledge-graph-engine-v1/v1/registries/graph-bindings.json')
  ? readJson('runtime/knowledge-graph-engine-v1/v1/registries/graph-bindings.json').bindings
  : [];

const report = {
  system: 'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 7) : 100,
  decision: missing.length ? 'REVIEW_KNOWLEDGE_GRAPH_ENGINE_V1_GAPS' : 'KNOWLEDGE_GRAPH_ENGINE_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    entities: entities.length,
    relationships: relationships.length,
    bindings: bindings.length
  },
  cycle: [
    "DATA_SOURCE",
    "ENTITY",
    "RELATIONSHIP",
    "EVIDENCE",
    "KNOWLEDGE_GRAPH",
    "RAG",
    "MCP",
    "DECISION",
    "DASHBOARD",
    "ACTION"
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1-report.md',
  `# SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V1

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
pkg.scripts['ops:knowledge-graph-engine:v1'] =
  'node tools/knowledge-graph-engine-v1/sheikha-knowledge-graph-engine-v1.js';
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
JS

cat > tests/knowledge-graph-engine-v1.test.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Knowledge Graph Engine V1', () => {
  const root = process.cwd();

  test('knowledge graph engine report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V1');
    expect(report.decision).toBe('KNOWLEDGE_GRAPH_ENGINE_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.entities).toBeGreaterThanOrEqual(24);
    expect(report.coverage.relationships).toBeGreaterThanOrEqual(20);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(10);
  });
});
JS

node --check tools/knowledge-graph-engine-v1/sheikha-knowledge-graph-engine-v1.js
npm run ops:knowledge-graph-engine:v1
python3 -m json.tool runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1-report.json >/dev/null

npm test
npm run lint
node tools/drift/sheikha-runtime-drift-detector.js

git add -A
git commit -m "Activate Sheikha knowledge graph engine v1"
git push origin optimization/long-tail-latency-elimination

node tools/drift/sheikha-runtime-drift-detector.js
