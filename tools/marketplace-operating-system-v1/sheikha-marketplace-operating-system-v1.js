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
  engine: exists('runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1.json'),
  objects: exists('runtime/marketplace-operating-system-v1/v1/registries/marketplace-objects.json'),
  workflows: exists('runtime/marketplace-operating-system-v1/v1/registries/marketplace-workflows.json'),
  bindings: exists('runtime/marketplace-operating-system-v1/v1/registries/marketplace-bindings.json'),
  docs: exists('docs/marketplace-operating-system-v1/SHEIKHA-MARKETPLACE-OPERATING-SYSTEM-V1.md'),
  executiveDecision: exists('runtime/executive-decision-engine-v1/v1/sheikha-executive-decision-engine-v1-report.json'),
  discovery: exists('runtime/discovery-engine-v1/v1/sheikha-discovery-engine-v1-report.json'),
  knowledgeGraph: exists('runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1-report.json'),
  entityResolution: exists('runtime/entity-resolution-engine-v1/v1/sheikha-entity-resolution-engine-v1-report.json'),
  vectorStoreV2: exists('runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2-report.json'),
  unifiedDataFabric: exists('runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'),
  enterpriseConnector: exists('runtime/enterprise-connector-fabric-v1/v1/sheikha-enterprise-connector-fabric-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  controlTower: exists('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json'),
  digitalTwin: exists('runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'),
  commercialOps: exists('runtime/executive-dashboard-generator-v2/v1/sheikha-commercial-ops-v2-summary.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const objects = readJson('runtime/marketplace-operating-system-v1/v1/registries/marketplace-objects.json').objects;
const workflows = readJson('runtime/marketplace-operating-system-v1/v1/registries/marketplace-workflows.json').workflows;
const bindings = readJson('runtime/marketplace-operating-system-v1/v1/registries/marketplace-bindings.json').bindings;

const report = {
  system: 'SHEIKHA_MARKETPLACE_OPERATING_SYSTEM_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_MARKETPLACE_OPERATING_SYSTEM_V1_GAPS' : 'MARKETPLACE_OPERATING_SYSTEM_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    objects: objects.length,
    workflows: workflows.length,
    bindings: bindings.length
  },
  cycle: ["SUPPLIER_BUYER","PRODUCT","RFQ","QUOTATION","CONTRACT","ORDER","SHIPMENT","INVOICE","PERFORMANCE","AUDIT"],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write('runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.json', JSON.stringify(report, null, 2) + '\n');
write('runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.md', `# SHEIKHA_MARKETPLACE_OPERATING_SYSTEM_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`);

console.log(JSON.stringify(report, null, 2));
