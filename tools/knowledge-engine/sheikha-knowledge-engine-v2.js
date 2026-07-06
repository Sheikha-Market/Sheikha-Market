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
  rootIdentity: exists('runtime/root-identity/v1/sheikha-root-identity-v1.json'),
  rootOperatingCore: exists('runtime/root-operating-core/v1/sheikha-root-operating-core-v1.json'),
  operatingSystem: exists('runtime/operating-system/v1/sheikha-operating-system-v1.json'),
  architectureFreeze: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  runtimeContractEnforcer: exists('runtime/runtime-contract-enforcer/v1/sheikha-runtime-contract-enforcer-report.json'),
  apiContractRegistryV2: exists('runtime/api-contract-registry/v2/sheikha-api-contract-registry-v2.json'),
  continuousImprovement: exists('runtime/continuous-improvement/v1/sheikha-continuous-improvement-v1.json')
};

const lessons = readJson('runtime/knowledge-engine/v2/registries/lessons-learned-registry.json');
const governance = readJson('runtime/knowledge-engine/v2/registries/governance-knowledge-registry.json');
const runtime = readJson('runtime/knowledge-engine/v2/registries/runtime-knowledge-registry.json');

const registries = {
  lessonsLearned: Boolean(lessons && lessons.items && lessons.items.length),
  governanceKnowledge: Boolean(governance && governance.items && governance.items.length),
  runtimeKnowledge: Boolean(runtime && runtime.items && runtime.items.length)
};

const missingDependencies = Object.entries(dependencies).filter(([, ok]) => !ok).map(([k]) => k);
const missingRegistries = Object.entries(registries).filter(([, ok]) => !ok).map(([k]) => k);
const totalMissing = missingDependencies.length + missingRegistries.length;

const report = {
  system: 'SHEIKHA_KNOWLEDGE_ENGINE_V2',
  status: totalMissing ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  arabicName: 'محرك معرفة شيخة V2',
  score: totalMissing ? Math.max(0, 100 - totalMissing * 8) : 100,
  decision: totalMissing ? 'REVIEW_KNOWLEDGE_ENGINE_GAPS' : 'KNOWLEDGE_ENGINE_V2_ACTIVE_100',
  dependencies,
  registries,
  missingDependencies,
  missingRegistries,
  coverage: {
    lessonsLearnedItems: lessons?.items?.length || 0,
    governanceKnowledgeItems: governance?.items?.length || 0,
    runtimeKnowledgeItems: runtime?.items?.length || 0
  },
  nextDecisionInputs: [
    'Activate Decision Registry V2 after Knowledge Engine V2 is clean.',
    'Link decisions to lessons, governance rules, runtime events, and PR outcomes.',
    'Do not activate Execution Fabric V2 until Decision Registry V2 exists.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/knowledge-engine/v2');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-knowledge-engine-v2-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-knowledge-engine-v2-report.md'),
  `# SHEIKHA_KNOWLEDGE_ENGINE_V2

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- Lessons Learned: ${report.coverage.lessonsLearnedItems}
- Governance Knowledge: ${report.coverage.governanceKnowledgeItems}
- Runtime Knowledge: ${report.coverage.runtimeKnowledgeItems}

## الفحوص
${Object.entries(dependencies).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## المدخلات التالية للقرار
${report.nextDecisionInputs.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
