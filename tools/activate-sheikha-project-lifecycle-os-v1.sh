#!/usr/bin/env bash
set -euo pipefail

cd ~/Projects/sheikha/sheikha-main-portal

echo "=== Activate Sheikha Project Lifecycle Operating System V1 ==="

mkdir -p runtime/project-lifecycle-os-v1/v1/registries
mkdir -p tools/project-lifecycle-os-v1
mkdir -p docs/project-lifecycle-os-v1
mkdir -p tests

cat > runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1.json <<'JSON'
{
  "system": "SHEIKHA_PROJECT_LIFECYCLE_OS_V1",
  "status": "ACTIVE",
  "purpose": "Activate full project lifecycle operating system from idea, initiation, design, governance, approval, planning, execution, monitoring, acceptance, handover, closure, and continuous improvement.",
  "modules": [
    "IDEA_INTAKE",
    "INITIATION",
    "DESIGN",
    "FEASIBILITY",
    "GOVERNANCE",
    "APPROVAL",
    "PLANNING",
    "EXECUTION",
    "MONITORING",
    "QUALITY_ASSURANCE",
    "ACCEPTANCE",
    "HANDOVER",
    "CLOSURE",
    "LESSONS_LEARNED",
    "CONTINUOUS_IMPROVEMENT"
  ],
  "principle": "ولا حول ولا قوة إلا بالله"
}
JSON

cat > runtime/project-lifecycle-os-v1/v1/registries/project-stages.json <<'JSON'
{
  "registry": "SHEIKHA_PROJECT_STAGES_V1",
  "status": "ACTIVE",
  "stages": [
    "IDEA",
    "INITIATION",
    "DISCOVERY",
    "DESIGN",
    "FEASIBILITY",
    "GOVERNANCE_REVIEW",
    "APPROVAL_GATE",
    "PLANNING",
    "EXECUTION",
    "MONITORING_CONTROL",
    "QUALITY_REVIEW",
    "ACCEPTANCE",
    "HANDOVER",
    "CLOSURE",
    "CONTINUOUS_IMPROVEMENT"
  ]
}
JSON

cat > runtime/project-lifecycle-os-v1/v1/registries/project-deliverables.json <<'JSON'
{
  "registry": "SHEIKHA_PROJECT_DELIVERABLES_V1",
  "status": "ACTIVE",
  "deliverables": [
    "PROJECT_CHARTER",
    "BUSINESS_CASE",
    "SCOPE_STATEMENT",
    "DESIGN_DOCUMENT",
    "GOVERNANCE_PLAN",
    "RISK_REGISTER",
    "STAKEHOLDER_REGISTER",
    "SCHEDULE",
    "BUDGET",
    "QUALITY_PLAN",
    "ACCEPTANCE_CRITERIA",
    "STATUS_REPORT",
    "CHANGE_LOG",
    "HANDOVER_REPORT",
    "LESSONS_LEARNED",
    "IMPROVEMENT_BACKLOG"
  ]
}
JSON

cat > runtime/project-lifecycle-os-v1/v1/registries/project-bindings.json <<'JSON'
{
  "registry": "SHEIKHA_PROJECT_BINDINGS_V1",
  "status": "ACTIVE",
  "bindings": [
    "MARKETPLACE_OPERATING_SYSTEM_V1",
    "EXECUTIVE_DECISION_ENGINE_V1",
    "DISCOVERY_ENGINE_V1",
    "KNOWLEDGE_GRAPH_ENGINE_V1",
    "ENTITY_RESOLUTION_ENGINE_V1",
    "VECTOR_KNOWLEDGE_STORE_V2",
    "UNIFIED_DATA_FABRIC_V1",
    "ENTERPRISE_CONNECTOR_FABRIC_V1",
    "SUPPLY_CHAIN_CONTROL_TOWER_V2",
    "DIGITAL_TWIN_ENGINE_V2",
    "GOVERNANCE_GENERATOR_V1",
    "SHEIKHA_MCP_GATEWAY_V2",
    "SDK_FABRIC_MCP_INTEGRATION"
  ]
}
JSON

cat > docs/project-lifecycle-os-v1/SHEIKHA-PROJECT-LIFECYCLE-OS-V1.md <<'MD'
# SHEIKHA_PROJECT_LIFECYCLE_OS_V1

## الهدف
تفعيل دائرة إدارة المشاريع الكاملة داخل شيخة من بداية الفكرة حتى الإغلاق والتحسين المستمر.

## السلسلة التشغيلية
Idea → Initiation → Discovery → Design → Feasibility → Governance → Approval → Planning → Execution → Monitoring → Quality → Acceptance → Handover → Closure → Continuous Improvement

## الضوابط
لا مشروع بلا ميثاق.
لا تنفيذ بلا اعتماد.
لا قبول بلا معايير قبول.
لا تغيير بلا سجل تغيير.
لا تحسين بلا قياس.
ولا حول ولا قوة إلا بالله.
MD

cat > tools/project-lifecycle-os-v1/sheikha-project-lifecycle-os-v1.js <<'JS'
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
JS

node - <<'JS'
const fs = require('fs');
const p = 'package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['ops:project-lifecycle-os:v1'] =
  'node tools/project-lifecycle-os-v1/sheikha-project-lifecycle-os-v1.js';
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
JS

cat > tests/project-lifecycle-os-v1.test.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Project Lifecycle OS V1', () => {
  const root = process.cwd();

  test('project lifecycle operating system report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_PROJECT_LIFECYCLE_OS_V1');
    expect(report.decision).toBe('PROJECT_LIFECYCLE_OS_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.stages).toBeGreaterThanOrEqual(15);
    expect(report.coverage.deliverables).toBeGreaterThanOrEqual(16);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(13);
  });
});
JS

node --check tools/project-lifecycle-os-v1/sheikha-project-lifecycle-os-v1.js
npm run ops:project-lifecycle-os:v1
python3 -m json.tool runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1-report.json >/dev/null

npm test
npm run lint
node tools/drift/sheikha-runtime-drift-detector.js

git add -A
git commit -m "Activate Sheikha project lifecycle operating system v1"
git push origin optimization/long-tail-latency-elimination

node tools/drift/sheikha-runtime-drift-detector.js
