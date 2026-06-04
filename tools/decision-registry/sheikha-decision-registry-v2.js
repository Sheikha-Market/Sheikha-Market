'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  } catch {
    return null;
  }
}

const dependencies = {
  heartCore: exists('runtime/heart-core/v1/sheikha-heart-core-report.json'),
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  knowledgeEngineV2: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  lessonsRegistry: exists('runtime/knowledge-engine/v2/registries/lessons-learned-registry.json'),
  governanceKnowledgeRegistry: exists('runtime/knowledge-engine/v2/registries/governance-knowledge-registry.json'),
  runtimeKnowledgeRegistry: exists('runtime/knowledge-engine/v2/registries/runtime-knowledge-registry.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  runtimeContractEnforcer: exists('runtime/runtime-contract-enforcer/v1/sheikha-runtime-contract-enforcer-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const decisions = readJson('runtime/decision-registry/v2/registries/decision-registry-items.json');
const lessons = readJson('runtime/knowledge-engine/v2/registries/lessons-learned-registry.json');
const governance = readJson('runtime/knowledge-engine/v2/registries/governance-knowledge-registry.json');
const runtime = readJson('runtime/knowledge-engine/v2/registries/runtime-knowledge-registry.json');

function registryItems(registry) {
  return Array.isArray(registry?.items) ? registry.items : [];
}

const knownKnowledgeIds = new Set([
  ...registryItems(lessons).map((item) => item.id),
  ...registryItems(governance).map((item) => item.id),
  ...registryItems(runtime).map((item) => item.id)
]);

const registryChecks = {
  decisionItems: Boolean(decisions && decisions.items && decisions.items.length),
  approvedDecisions: Boolean(decisions && decisions.items && decisions.items.every(item => item.decision && item.authority)),
  evidenceLinked: Boolean(decisions && decisions.items && decisions.items.every(item => Array.isArray(item.sourceKnowledge) && item.sourceKnowledge.length > 0)),
  sourceKnowledgeResolvable: Boolean(decisions && decisions.items && decisions.items.every(
    item => item.sourceKnowledge.every(id => knownKnowledgeIds.has(id))
  )),
  measurementLinked: Boolean(decisions && decisions.items && decisions.items.every(item => item.measurement)),
  riskClassified: Boolean(decisions && decisions.items && decisions.items.every(item => item.risk)),
  executionConditionsLinked: Boolean(decisions && decisions.items && decisions.items.every(
    item => Array.isArray(item.executionConditions) && item.executionConditions.length > 0
  ))
};

const missingDependencies = Object.entries(dependencies).filter(([, ok]) => !ok).map(([k]) => k);
const missingRegistryChecks = Object.entries(registryChecks).filter(([, ok]) => !ok).map(([k]) => k);
const totalMissing = missingDependencies.length + missingRegistryChecks.length;

const report = {
  system: 'SHEIKHA_DECISION_REGISTRY_V2',
  status: totalMissing ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  arabicName: 'سجل قرارات شيخة V2',
  score: totalMissing ? Math.max(0, 100 - totalMissing * 8) : 100,
  decision: totalMissing ? 'REVIEW_DECISION_REGISTRY_GAPS' : 'DECISION_REGISTRY_V2_ACTIVE_100',
  dependencies,
  registryChecks,
  missingDependencies,
  missingRegistryChecks,
  coverage: {
    decisionItems: decisions?.items?.length || 0,
    approvedItems: decisions?.items?.filter(x => String(x.decision || '').includes('APPROVED')).length || 0,
    executableItems: decisions?.items?.filter(x => x.executionAllowed === true).length || 0,
    gatedItems: decisions?.items?.filter(x => x.executionAllowed === false).length || 0,
    highRiskItems: decisions?.items?.filter(x => x.risk === 'HIGH').length || 0
  },
  nextActions: [
    'Activate Capability Registry V2 after Decision Registry V2 is clean.',
    'Link each capability to approved decisions only.',
    'Do not activate Execution Fabric V2 until Capability Registry V2 exists.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/decision-registry/v2');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-decision-registry-v2-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-decision-registry-v2-report.md'),
  `# SHEIKHA_DECISION_REGISTRY_V2

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- القرارات: ${report.coverage.decisionItems}
- القرارات المعتمدة: ${report.coverage.approvedItems}
- القرارات القابلة للتنفيذ: ${report.coverage.executableItems}
- القرارات المحجوبة: ${report.coverage.gatedItems}
- القرارات عالية المخاطر: ${report.coverage.highRiskItems}

## الفحوص
${Object.entries(dependencies).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## فحوص السجل
${Object.entries(registryChecks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## المدخلات التالية
${report.nextActions.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
