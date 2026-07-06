#!/usr/bin/env bash
set -euo pipefail

cd ~/Projects/sheikha/sheikha-main-portal

echo "=== Activate Sheikha Unified Data Fabric V1 ==="

mkdir -p runtime/unified-data-fabric-v1/v1/registries
mkdir -p tools/unified-data-fabric-v1
mkdir -p docs/unified-data-fabric-v1
mkdir -p tests

cat > runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1.json <<'JSON'
{
  "system": "SHEIKHA_UNIFIED_DATA_FABRIC_V1",
  "status": "ACTIVE",
  "purpose": "Unify data sources across GitHub, documents, contracts, CRM, marketplace, supply chain, digital twin, ERP, WMS, TMS, open data, research, and operational registries.",
  "modules": [
    "DATA_SOURCE_REGISTRY",
    "DATA_ACCESS_GOVERNANCE",
    "SOURCE_TRACEABILITY",
    "RAG_BINDING",
    "VECTOR_STORE_BINDING",
    "KNOWLEDGE_GRAPH_BINDING",
    "MCP_GATEWAY_BINDING",
    "DASHBOARD_BINDING"
  ],
  "principle": "ولا حول ولا قوة إلا بالله"
}
JSON

cat > runtime/unified-data-fabric-v1/v1/registries/data-sources.json <<'JSON'
{
  "registry": "SHEIKHA_UNIFIED_DATA_SOURCES_V1",
  "status": "ACTIVE",
  "sources": [
    "GITHUB",
    "DOCUMENTS",
    "CONTRACTS",
    "POLICIES",
    "RESEARCH",
    "OPEN_DATA",
    "CRM",
    "MARKETPLACE",
    "SUPPLY_CHAIN",
    "DIGITAL_TWIN",
    "ERP",
    "WMS",
    "TMS",
    "RUNTIME_REGISTRIES",
    "EXECUTIVE_DASHBOARDS"
  ]
}
JSON

cat > runtime/unified-data-fabric-v1/v1/registries/data-governance-policy.json <<'JSON'
{
  "registry": "SHEIKHA_DATA_GOVERNANCE_POLICY_V1",
  "status": "ACTIVE",
  "policies": [
    "No private data access without authorization.",
    "No secret exposure in logs or Git.",
    "Every data source must have traceability.",
    "High-impact decisions require human approval.",
    "External systems require official API authorization.",
    "Research and open data must be cited.",
    "Operational data must be auditable.",
    "Data deletion and update must be supported."
  ]
}
JSON

cat > docs/unified-data-fabric-v1/SHEIKHA-UNIFIED-DATA-FABRIC-V1.md <<'MD'
# SHEIKHA_UNIFIED_DATA_FABRIC_V1

## الهدف
توحيد مصادر البيانات داخل شيخة وربطها مع RAG وVector Store وKnowledge Graph وMCP Gateway واللوحات التنفيذية.

## المصادر
GitHub, Documents, Contracts, Policies, Research, Open Data, CRM, Marketplace, Supply Chain, Digital Twin, ERP, WMS, TMS, Runtime Registries, Executive Dashboards.

## الضوابط
لا بيانات خاصة بلا صلاحية.
لا أسرار داخل Git.
كل مصدر بيانات يجب أن يكون قابلًا للتتبع.
كل قرار عالي الأثر يحتاج موافقة بشرية.
ولا حول ولا قوة إلا بالله.
MD

cat > tools/unified-data-fabric-v1/sheikha-unified-data-fabric-v1.js <<'JS'
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
  engine: exists('runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1.json'),
  sources: exists('runtime/unified-data-fabric-v1/v1/registries/data-sources.json'),
  policy: exists('runtime/unified-data-fabric-v1/v1/registries/data-governance-policy.json'),
  docs: exists('docs/unified-data-fabric-v1/SHEIKHA-UNIFIED-DATA-FABRIC-V1.md'),
  unifiedRag: exists('runtime/unified-rag-engine/v1/sheikha-unified-rag-engine-v1-report.json'),
  vectorStore: exists('runtime/vector-knowledge-store/v1/sheikha-vector-knowledge-store-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  commercialOps: exists('runtime/executive-dashboard-generator-v2/v1/sheikha-commercial-ops-v2-summary.json'),
  controlTower: exists('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json'),
  digitalTwin: exists('runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const sources = exists('runtime/unified-data-fabric-v1/v1/registries/data-sources.json')
  ? readJson('runtime/unified-data-fabric-v1/v1/registries/data-sources.json').sources
  : [];

const policies = exists('runtime/unified-data-fabric-v1/v1/registries/data-governance-policy.json')
  ? readJson('runtime/unified-data-fabric-v1/v1/registries/data-governance-policy.json').policies
  : [];

const report = {
  system: 'SHEIKHA_UNIFIED_DATA_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_UNIFIED_DATA_FABRIC_V1_GAPS' : 'UNIFIED_DATA_FABRIC_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    sources: sources.length,
    policies: policies.length
  },
  cycle: [
    'DATA_SOURCE',
    'ACCESS_GOVERNANCE',
    'TRACEABILITY',
    'RAG',
    'VECTOR_STORE',
    'KNOWLEDGE_GRAPH',
    'MCP_GATEWAY',
    'DASHBOARD',
    'AUDIT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.md',
  `# SHEIKHA_UNIFIED_DATA_FABRIC_V1

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
pkg.scripts['ops:unified-data-fabric:v1'] =
  'node tools/unified-data-fabric-v1/sheikha-unified-data-fabric-v1.js';
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
JS

cat > tests/unified-data-fabric-v1.test.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Unified Data Fabric V1', () => {
  const root = process.cwd();

  test('unified data fabric report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_UNIFIED_DATA_FABRIC_V1');
    expect(report.decision).toBe('UNIFIED_DATA_FABRIC_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.sources).toBeGreaterThanOrEqual(15);
    expect(report.coverage.policies).toBeGreaterThanOrEqual(8);
  });
});
JS

node --check tools/unified-data-fabric-v1/sheikha-unified-data-fabric-v1.js
npm run ops:unified-data-fabric:v1
python3 -m json.tool runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json >/dev/null

npm test
npm run lint
node tools/drift/sheikha-runtime-drift-detector.js

git add -A
git commit -m "Activate Sheikha unified data fabric v1"
git push origin optimization/long-tail-latency-elimination

node tools/drift/sheikha-runtime-drift-detector.js
