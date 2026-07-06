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
  engine: exists('runtime/enterprise-connector-fabric-v1/v1/sheikha-enterprise-connector-fabric-v1.json'),
  connectors: exists('runtime/enterprise-connector-fabric-v1/v1/registries/enterprise-connectors.json'),
  governancePolicy: exists('runtime/enterprise-connector-fabric-v1/v1/registries/connector-governance-policy.json'),
  bindings: exists('runtime/enterprise-connector-fabric-v1/v1/registries/connector-bindings.json'),
  docs: exists('docs/enterprise-connector-fabric-v1/SHEIKHA-ENTERPRISE-CONNECTOR-FABRIC-V1.md'),
  sdkFabricMcp: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  unifiedDataFabric: exists('runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'),
  vectorStoreV2: exists('runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2-report.json'),
  commercialOps: exists('runtime/executive-dashboard-generator-v2/v1/sheikha-commercial-ops-v2-summary.json'),
  controlTower: exists('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const connectors = exists('runtime/enterprise-connector-fabric-v1/v1/registries/enterprise-connectors.json')
  ? readJson('runtime/enterprise-connector-fabric-v1/v1/registries/enterprise-connectors.json').connectors
  : [];

const policies = exists('runtime/enterprise-connector-fabric-v1/v1/registries/connector-governance-policy.json')
  ? readJson('runtime/enterprise-connector-fabric-v1/v1/registries/connector-governance-policy.json').policies
  : [];

const bindings = exists('runtime/enterprise-connector-fabric-v1/v1/registries/connector-bindings.json')
  ? readJson('runtime/enterprise-connector-fabric-v1/v1/registries/connector-bindings.json').bindings
  : [];

const report = {
  system: 'SHEIKHA_ENTERPRISE_CONNECTOR_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 7) : 100,
  decision: missing.length ? 'REVIEW_ENTERPRISE_CONNECTOR_FABRIC_V1_GAPS' : 'ENTERPRISE_CONNECTOR_FABRIC_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    connectors: connectors.length,
    policies: policies.length,
    bindings: bindings.length
  },
  cycle: [
    "CONNECTOR",
    "AUTHORIZATION",
    "DATA_SCOPE",
    "PERMISSION",
    "MCP_GATEWAY",
    "UNIFIED_DATA_FABRIC",
    "VECTOR_STORE",
    "RAG",
    "DASHBOARD",
    "AUDIT"
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/enterprise-connector-fabric-v1/v1/sheikha-enterprise-connector-fabric-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/enterprise-connector-fabric-v1/v1/sheikha-enterprise-connector-fabric-v1-report.md',
  `# SHEIKHA_ENTERPRISE_CONNECTOR_FABRIC_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
