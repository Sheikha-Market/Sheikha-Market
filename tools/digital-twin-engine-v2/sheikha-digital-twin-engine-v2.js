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
  engine: exists('runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2.json'),
  assets: exists('runtime/digital-twin-engine-v2/v1/registries/twin-asset-registry.json'),
  metrics: exists('runtime/digital-twin-engine-v2/v1/registries/twin-metric-registry.json'),
  integrations: exists('runtime/digital-twin-engine-v2/v1/registries/twin-integration-map.json'),
  docs: exists('docs/digital-twin-engine-v2/SHEIKHA-DIGITAL-TWIN-ENGINE-V2.md'),
  route: exists('routes/digital-twin-engine-v2/status.routes.js'),
  unifiedRag: exists('runtime/unified-rag-engine/v1/sheikha-unified-rag-engine-v1-report.json'),
  vectorStore: exists('runtime/vector-knowledge-store/v1/sheikha-vector-knowledge-store-v1-report.json'),
  resourceProductMarket: exists('runtime/resource-product-market-intelligence/v1/sheikha-resource-product-market-intelligence-v1-report.json'),
  operationalPlatform: exists('runtime/operational-platform-v1/v1/sheikha-operational-platform-v1-report.json'),
  sdkFabricMcp: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const assets = exists('runtime/digital-twin-engine-v2/v1/registries/twin-asset-registry.json')
  ? readJson('runtime/digital-twin-engine-v2/v1/registries/twin-asset-registry.json').assets
  : [];

const metrics = exists('runtime/digital-twin-engine-v2/v1/registries/twin-metric-registry.json')
  ? readJson('runtime/digital-twin-engine-v2/v1/registries/twin-metric-registry.json').metrics
  : [];

const integrations = exists('runtime/digital-twin-engine-v2/v1/registries/twin-integration-map.json')
  ? readJson('runtime/digital-twin-engine-v2/v1/registries/twin-integration-map.json').integrations
  : [];

const report = {
  system: 'SHEIKHA_DIGITAL_TWIN_ENGINE_V2',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 7) : 100,
  decision: missing.length ? 'REVIEW_DIGITAL_TWIN_ENGINE_V2_GAPS' : 'DIGITAL_TWIN_ENGINE_V2_ACTIVE_100',
  checks,
  missing,
  coverage: {
    assets: assets.length,
    metrics: metrics.length,
    integrations: integrations.length
  },
  cycle: [
    'ASSET',
    'RESOURCE',
    'METRIC',
    'RAG_EVIDENCE',
    'VECTOR_CONTEXT',
    'TWIN_STATE',
    'RISK',
    'CONTROL_TOWER',
    'DASHBOARD',
    'DECISION',
    'IMPACT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.md',
  `# SHEIKHA_DIGITAL_TWIN_ENGINE_V2

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
