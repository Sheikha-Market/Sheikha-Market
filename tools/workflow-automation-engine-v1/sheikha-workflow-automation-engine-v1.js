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
  engine: exists('runtime/workflow-automation-engine-v1/v1/sheikha-workflow-automation-engine-v1.json'),
  cycles: exists('runtime/workflow-automation-engine-v1/v1/registries/workflow-cycles.json'),
  bindings: exists('runtime/workflow-automation-engine-v1/v1/registries/workflow-bindings.json'),
  docs: exists('docs/workflow-automation-engine-v1/SHEIKHA-WORKFLOW-AUTOMATION-ENGINE-V1.md'),
  projectLifecycle: exists('runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1-report.json'),
  marketplaceOS: exists('runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.json'),
  executiveDecision: exists('runtime/executive-decision-engine-v1/v1/sheikha-executive-decision-engine-v1-report.json'),
  discovery: exists('runtime/discovery-engine-v1/v1/sheikha-discovery-engine-v1-report.json'),
  controlTower: exists('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json'),
  digitalTwin: exists('runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'),
  governanceGenerator: exists('runtime/governance-generator/v1/sheikha-governance-generator-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const cycles = readJson('runtime/workflow-automation-engine-v1/v1/registries/workflow-cycles.json').cycles;
const bindings = readJson('runtime/workflow-automation-engine-v1/v1/registries/workflow-bindings.json').bindings;

const report = {
  system: 'SHEIKHA_WORKFLOW_AUTOMATION_ENGINE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 7) : 100,
  decision: missing.length ? 'REVIEW_WORKFLOW_AUTOMATION_ENGINE_V1_GAPS' : 'WORKFLOW_AUTOMATION_ENGINE_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    cycles: cycles.length,
    bindings: bindings.length
  },
  cycle: [
    "IDEA",
    "DISCOVERY",
    "DECISION",
    "PROJECT",
    "RFQ",
    "QUOTATION",
    "CONTRACT",
    "ORDER",
    "SHIPMENT",
    "INVOICE",
    "ACCEPTANCE",
    "CLOSURE",
    "IMPROVEMENT"
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/workflow-automation-engine-v1/v1/sheikha-workflow-automation-engine-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/workflow-automation-engine-v1/v1/sheikha-workflow-automation-engine-v1-report.md',
  `# SHEIKHA_WORKFLOW_AUTOMATION_ENGINE_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
