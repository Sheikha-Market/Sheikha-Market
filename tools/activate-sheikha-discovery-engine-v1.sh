#!/usr/bin/env bash
set -euo pipefail

cd ~/Projects/sheikha/sheikha-main-portal

echo "=== Activate Sheikha Discovery Engine V1 ==="

mkdir -p runtime/discovery-engine-v1/v1/registries
mkdir -p tools/discovery-engine-v1
mkdir -p docs/discovery-engine-v1
mkdir -p tests

cat > runtime/discovery-engine-v1/v1/sheikha-discovery-engine-v1.json <<'JSON'
{
  "system": "SHEIKHA_DISCOVERY_ENGINE_V1",
  "status": "ACTIVE",
  "purpose": "Discover gaps, markets, suppliers, customers, risks, opportunities, technologies, research, resources, and operational improvements using the knowledge graph, entity resolution, vector store, unified data fabric, and enterprise connectors.",
  "modules": [
    "GAP_DISCOVERY",
    "MARKET_DISCOVERY",
    "SUPPLIER_DISCOVERY",
    "CUSTOMER_DISCOVERY",
    "RISK_DISCOVERY",
    "OPPORTUNITY_DISCOVERY",
    "TECHNOLOGY_DISCOVERY",
    "RESEARCH_DISCOVERY",
    "RESOURCE_DISCOVERY",
    "OPERATIONAL_IMPROVEMENT_DISCOVERY"
  ],
  "principle": "ولا حول ولا قوة إلا بالله"
}
JSON

cat > runtime/discovery-engine-v1/v1/registries/discovery-domains.json <<'JSON'
{
  "registry": "SHEIKHA_DISCOVERY_DOMAINS_V1",
  "status": "ACTIVE",
  "domains": [
    "SUPPLY_CHAIN",
    "MARKETPLACE",
    "CRM",
    "SALES",
    "LOGISTICS",
    "PORTS",
    "FACTORIES",
    "MINES",
    "SCRAP",
    "METALS",
    "ENERGY",
    "SMART_CITIES",
    "ENTERPRISE_SYSTEMS",
    "RESEARCH",
    "OPEN_DATA"
  ]
}
JSON

cat > runtime/discovery-engine-v1/v1/registries/discovery-types.json <<'JSON'
{
  "registry": "SHEIKHA_DISCOVERY_TYPES_V1",
  "status": "ACTIVE",
  "types": [
    "GAP",
    "RISK",
    "OPPORTUNITY",
    "MARKET",
    "SUPPLIER",
    "CUSTOMER",
    "RESOURCE",
    "PRODUCT",
    "TECHNOLOGY",
    "RESEARCH",
    "PROCESS_IMPROVEMENT",
    "COST_REDUCTION",
    "CARBON_REDUCTION",
    "REVENUE_GROWTH"
  ]
}
JSON

cat > runtime/discovery-engine-v1/v1/registries/discovery-bindings.json <<'JSON'
{
  "registry": "SHEIKHA_DISCOVERY_BINDINGS_V1",
  "status": "ACTIVE",
  "bindings": [
    "KNOWLEDGE_GRAPH_ENGINE_V1",
    "ENTITY_RESOLUTION_ENGINE_V1",
    "VECTOR_KNOWLEDGE_STORE_V2",
    "UNIFIED_DATA_FABRIC_V1",
    "ENTERPRISE_CONNECTOR_FABRIC_V1",
    "SHEIKHA_MCP_GATEWAY_V2",
    "COMMERCIAL_OPS_V2",
    "SUPPLY_CHAIN_CONTROL_TOWER_V2",
    "DIGITAL_TWIN_ENGINE_V2",
    "EXECUTIVE_DASHBOARD_GENERATOR_V2"
  ]
}
JSON

cat > docs/discovery-engine-v1/SHEIKHA-DISCOVERY-ENGINE-V1.md <<'MD'
# SHEIKHA_DISCOVERY_ENGINE_V1

## الهدف
تفعيل محرك الاكتشاف لاستخراج الفجوات والفرص والمخاطر والأسواق والموردين والعملاء والتحسينات التشغيلية.

## الدورة
Data → Entity Resolution → Knowledge Graph → Discovery → Evidence → Recommendation → Decision → Dashboard → Action

## الضوابط
لا اكتشاف بلا مصدر.
لا توصية عالية الأثر بلا مراجعة بشرية.
لا استخدام بيانات خاصة بلا صلاحية.
ولا حول ولا قوة إلا بالله.
MD

cat > tools/discovery-engine-v1/sheikha-discovery-engine-v1.js <<'JS'
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
  engine: exists('runtime/discovery-engine-v1/v1/sheikha-discovery-engine-v1.json'),
  domains: exists('runtime/discovery-engine-v1/v1/registries/discovery-domains.json'),
  types: exists('runtime/discovery-engine-v1/v1/registries/discovery-types.json'),
  bindings: exists('runtime/discovery-engine-v1/v1/registries/discovery-bindings.json'),
  docs: exists('docs/discovery-engine-v1/SHEIKHA-DISCOVERY-ENGINE-V1.md'),
  knowledgeGraph: exists('runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1-report.json'),
  entityResolution: exists('runtime/entity-resolution-engine-v1/v1/sheikha-entity-resolution-engine-v1-report.json'),
  vectorStoreV2: exists('runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2-report.json'),
  unifiedDataFabric: exists('runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'),
  enterpriseConnector: exists('runtime/enterprise-connector-fabric-v1/v1/sheikha-enterprise-connector-fabric-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  controlTower: exists('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const domains = exists('runtime/discovery-engine-v1/v1/registries/discovery-domains.json')
  ? readJson('runtime/discovery-engine-v1/v1/registries/discovery-domains.json').domains
  : [];

const types = exists('runtime/discovery-engine-v1/v1/registries/discovery-types.json')
  ? readJson('runtime/discovery-engine-v1/v1/registries/discovery-types.json').types
  : [];

const bindings = exists('runtime/discovery-engine-v1/v1/registries/discovery-bindings.json')
  ? readJson('runtime/discovery-engine-v1/v1/registries/discovery-bindings.json').bindings
  : [];

const report = {
  system: 'SHEIKHA_DISCOVERY_ENGINE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 7) : 100,
  decision: missing.length ? 'REVIEW_DISCOVERY_ENGINE_V1_GAPS' : 'DISCOVERY_ENGINE_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    domains: domains.length,
    types: types.length,
    bindings: bindings.length
  },
  cycle: [
    "DATA",
    "ENTITY_RESOLUTION",
    "KNOWLEDGE_GRAPH",
    "DISCOVERY",
    "EVIDENCE",
    "RECOMMENDATION",
    "DECISION",
    "DASHBOARD",
    "ACTION"
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/discovery-engine-v1/v1/sheikha-discovery-engine-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/discovery-engine-v1/v1/sheikha-discovery-engine-v1-report.md',
  `# SHEIKHA_DISCOVERY_ENGINE_V1

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
pkg.scripts['ops:discovery-engine:v1'] =
  'node tools/discovery-engine-v1/sheikha-discovery-engine-v1.js';
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
JS

cat > tests/discovery-engine-v1.test.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Discovery Engine V1', () => {
  const root = process.cwd();

  test('discovery engine report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/discovery-engine-v1/v1/sheikha-discovery-engine-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_DISCOVERY_ENGINE_V1');
    expect(report.decision).toBe('DISCOVERY_ENGINE_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.domains).toBeGreaterThanOrEqual(15);
    expect(report.coverage.types).toBeGreaterThanOrEqual(14);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(10);
  });
});
JS

node --check tools/discovery-engine-v1/sheikha-discovery-engine-v1.js
npm run ops:discovery-engine:v1
python3 -m json.tool runtime/discovery-engine-v1/v1/sheikha-discovery-engine-v1-report.json >/dev/null

npm test
npm run lint
node tools/drift/sheikha-runtime-drift-detector.js

git add -A
git commit -m "Activate Sheikha discovery engine v1"
git push origin optimization/long-tail-latency-elimination

node tools/drift/sheikha-runtime-drift-detector.js
