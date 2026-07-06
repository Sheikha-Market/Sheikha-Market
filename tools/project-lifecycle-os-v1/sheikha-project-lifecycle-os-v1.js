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
  engine: exists('runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1.json'),
  stages: exists('runtime/project-lifecycle-os-v1/v1/registries/project-stages.json'),
  deliverables: exists('runtime/project-lifecycle-os-v1/v1/registries/project-deliverables.json'),
  bindings: exists('runtime/project-lifecycle-os-v1/v1/registries/project-bindings.json'),
  docs: exists('docs/project-lifecycle-os-v1/SHEIKHA-PROJECT-LIFECYCLE-OS-V1.md'),
  marketplaceOS: exists('runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.json'),
  executiveDecision: exists('runtime/executive-decision-engine-v1/v1/sheikha-executive-decision-engine-v1-report.json'),
  discovery: exists('runtime/discovery-engine-v1/v1/sheikha-discovery-engine-v1-report.json'),
  knowledgeGraph: exists('runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1-report.json'),
  controlTower: exists('runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json'),
  digitalTwin: exists('runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'),
  governanceGenerator: exists('runtime/governance-generator/v1/sheikha-governance-generator-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const stages = readJson('runtime/project-lifecycle-os-v1/v1/registries/project-stages.json').stages;
const deliverables = readJson('runtime/project-lifecycle-os-v1/v1/registries/project-deliverables.json').deliverables;
const bindings = readJson('runtime/project-lifecycle-os-v1/v1/registries/project-bindings.json').bindings;

const report = {
  system: 'SHEIKHA_PROJECT_LIFECYCLE_OS_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_PROJECT_LIFECYCLE_OS_V1_GAPS' : 'PROJECT_LIFECYCLE_OS_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    stages: stages.length,
    deliverables: deliverables.length,
    bindings: bindings.length
  },
  cycle: [
    "IDEA",
    "INITIATION",
    "DESIGN",
    "GOVERNANCE",
    "APPROVAL",
    "PLANNING",
    "EXECUTION",
    "MONITORING",
    "ACCEPTANCE",
    "HANDOVER",
    "CLOSURE",
    "CONTINUOUS_IMPROVEMENT"
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1-report.md',
  `# SHEIKHA_PROJECT_LIFECYCLE_OS_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
