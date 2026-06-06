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
  engine: exists('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2.json'),
  registry: exists('runtime/supply-chain-control-tower-v2/v1/registries/control-tower-registry.json'),
  docs: exists('docs/supply-chain-control-tower-v2/SHEIKHA-SUPPLY-CHAIN-CONTROL-TOWER-V2.md'),
  route: exists('routes/supply-chain-control-tower-v2/status.routes.js'),
  sdkFabricMcp: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  unifiedRag: exists('runtime/unified-rag-engine/v1/sheikha-unified-rag-engine-v1-report.json'),
  vectorStore: exists('runtime/vector-knowledge-store/v1/sheikha-vector-knowledge-store-v1-report.json'),
  digitalTwin: exists('runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'),
  operationalPlatform: exists('runtime/operational-platform-v1/v1/sheikha-operational-platform-v1-report.json'),
  protocolFabric: exists('runtime/unified-protocol-fabric/v1/sheikha-unified-protocol-fabric-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
const registry = exists('runtime/supply-chain-control-tower-v2/v1/registries/control-tower-registry.json')
  ? readJson('runtime/supply-chain-control-tower-v2/v1/registries/control-tower-registry.json')
  : { objects: [] };

const report = {
  system: 'SHEIKHA_SUPPLY_CHAIN_CONTROL_TOWER_V2',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 7) : 100,
  decision: missing.length ? 'REVIEW_SUPPLY_CHAIN_CONTROL_TOWER_V2_GAPS' : 'SUPPLY_CHAIN_CONTROL_TOWER_V2_ACTIVE_100',
  checks,
  missing,
  coverage: {
    objects: registry.objects.length
  },
  cycle: [
    'DEMAND',
    'SUPPLY',
    'INVENTORY',
    'PROCUREMENT',
    'LOGISTICS',
    'PORTS',
    'FLEET',
    'RISK',
    'CARBON',
    'DASHBOARD',
    'DECISION',
    'IMPACT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json', JSON.stringify(report, null, 2) + '\n');
write('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.md', `# SHEIKHA_SUPPLY_CHAIN_CONTROL_TOWER_V2

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`);

console.log(JSON.stringify(report, null, 2));
