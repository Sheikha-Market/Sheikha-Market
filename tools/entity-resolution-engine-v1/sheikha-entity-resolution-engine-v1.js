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
  engine: exists('runtime/entity-resolution-engine-v1/v1/sheikha-entity-resolution-engine-v1.json'),
  entities: exists('runtime/entity-resolution-engine-v1/v1/registries/resolution-entities.json'),
  rules: exists('runtime/entity-resolution-engine-v1/v1/registries/resolution-rules.json'),
  bindings: exists('runtime/entity-resolution-engine-v1/v1/registries/resolution-bindings.json'),
  docs: exists('docs/entity-resolution-engine-v1/SHEIKHA-ENTITY-RESOLUTION-ENGINE-V1.md'),
  knowledgeGraph: exists('runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1-report.json'),
  vectorStoreV2: exists('runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2-report.json'),
  unifiedDataFabric: exists('runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'),
  enterpriseConnector: exists('runtime/enterprise-connector-fabric-v1/v1/sheikha-enterprise-connector-fabric-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  commercialOps: exists('runtime/executive-dashboard-generator-v2/v1/sheikha-commercial-ops-v2-summary.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const entities = exists('runtime/entity-resolution-engine-v1/v1/registries/resolution-entities.json')
  ? readJson('runtime/entity-resolution-engine-v1/v1/registries/resolution-entities.json').entities
  : [];

const rules = exists('runtime/entity-resolution-engine-v1/v1/registries/resolution-rules.json')
  ? readJson('runtime/entity-resolution-engine-v1/v1/registries/resolution-rules.json').rules
  : [];

const bindings = exists('runtime/entity-resolution-engine-v1/v1/registries/resolution-bindings.json')
  ? readJson('runtime/entity-resolution-engine-v1/v1/registries/resolution-bindings.json').bindings
  : [];

const report = {
  system: 'SHEIKHA_ENTITY_RESOLUTION_ENGINE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 7) : 100,
  decision: missing.length ? 'REVIEW_ENTITY_RESOLUTION_ENGINE_V1_GAPS' : 'ENTITY_RESOLUTION_ENGINE_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    entities: entities.length,
    rules: rules.length,
    bindings: bindings.length
  },
  cycle: [
    "SOURCE_ENTITY",
    "NORMALIZATION",
    "MATCHING",
    "CONFIDENCE",
    "CANONICAL_ID",
    "MERGE_REVIEW",
    "AUDIT",
    "KNOWLEDGE_GRAPH",
    "VECTOR_STORE",
    "DASHBOARD"
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/entity-resolution-engine-v1/v1/sheikha-entity-resolution-engine-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/entity-resolution-engine-v1/v1/sheikha-entity-resolution-engine-v1-report.md',
  `# SHEIKHA_ENTITY_RESOLUTION_ENGINE_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
