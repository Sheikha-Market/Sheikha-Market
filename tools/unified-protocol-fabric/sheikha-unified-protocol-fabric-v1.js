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
  engine: exists('runtime/unified-protocol-fabric/v1/sheikha-unified-protocol-fabric-v1.json'),
  registry: exists('runtime/unified-protocol-fabric/v1/registries/protocol-registry.json'),
  securityPolicy: exists('runtime/unified-protocol-fabric/v1/registries/protocol-security-policy.json'),
  sdkMcpMap: exists('runtime/unified-protocol-fabric/v1/registries/protocol-sdk-mcp-map.json'),
  docs: exists('docs/unified-protocol-fabric/SHEIKHA-UNIFIED-PROTOCOL-FABRIC-V1.md'),
  route: exists('routes/unified-protocol-fabric/status.routes.js'),
  developerPlatform: exists('runtime/sheikha-developer-platform/v1/sheikha-developer-platform-v1-report.json'),
  sdkFabricMcp: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  unifiedRag: exists('runtime/unified-rag-engine/v1/sheikha-unified-rag-engine-v1-report.json'),
  vectorStore: exists('runtime/vector-knowledge-store/v1/sheikha-vector-knowledge-store-v1-report.json'),
  digitalTwin: exists('runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'),
  operationalPlatform: exists('runtime/operational-platform-v1/v1/sheikha-operational-platform-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const registry = exists('runtime/unified-protocol-fabric/v1/registries/protocol-registry.json')
  ? readJson('runtime/unified-protocol-fabric/v1/registries/protocol-registry.json')
  : { groups: {} };

const protocolCount = Object.values(registry.groups || {})
  .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);

const security = exists('runtime/unified-protocol-fabric/v1/registries/protocol-security-policy.json')
  ? readJson('runtime/unified-protocol-fabric/v1/registries/protocol-security-policy.json')
  : { policies: [] };

const sdkMcp = exists('runtime/unified-protocol-fabric/v1/registries/protocol-sdk-mcp-map.json')
  ? readJson('runtime/unified-protocol-fabric/v1/registries/protocol-sdk-mcp-map.json')
  : { bindings: [], fabricTargets: [] };

const report = {
  system: 'SHEIKHA_UNIFIED_PROTOCOL_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_UNIFIED_PROTOCOL_FABRIC_GAPS' : 'UNIFIED_PROTOCOL_FABRIC_ACTIVE_100',
  checks,
  missing,
  coverage: {
    protocolGroups: Object.keys(registry.groups || {}).length,
    protocols: protocolCount,
    securityPolicies: security.policies.length,
    sdkMcpBindings: sdkMcp.bindings.length,
    fabricTargets: sdkMcp.fabricTargets.length
  },
  cycle: [
    'PROTOCOL',
    'SECURITY_POLICY',
    'SDK_BINDING',
    'MCP_GATEWAY',
    'RAG_CONTEXT',
    'VECTOR_CONTEXT',
    'DIGITAL_TWIN',
    'OPERATIONAL_PLATFORM',
    'AUDIT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/unified-protocol-fabric/v1/sheikha-unified-protocol-fabric-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/unified-protocol-fabric/v1/sheikha-unified-protocol-fabric-v1-report.md',
  `# SHEIKHA_UNIFIED_PROTOCOL_FABRIC_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
