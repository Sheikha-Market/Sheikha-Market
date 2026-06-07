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
