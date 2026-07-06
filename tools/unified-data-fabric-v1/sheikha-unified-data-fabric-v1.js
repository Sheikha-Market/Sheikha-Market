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
