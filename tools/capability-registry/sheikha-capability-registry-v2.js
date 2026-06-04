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
  decisionRegistryV2: exists('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  runtimeContractEnforcer: exists('runtime/runtime-contract-enforcer/v1/sheikha-runtime-contract-enforcer-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const registry = readJson('runtime/capability-registry/v2/registries/capability-registry-items.json');

const registryChecks = {
  capabilityItems: Boolean(registry && registry.items && registry.items.length),
  allActive: Boolean(registry && registry.items && registry.items.every(item => item.status === 'ACTIVE')),
  decisionLinked: Boolean(registry && registry.items && registry.items.every(item => item.decision)),
  scoped: Boolean(registry && registry.items && registry.items.every(item => Array.isArray(item.scope) && item.scope.length > 0))
};

const missingDependencies = Object.entries(dependencies).filter(([, ok]) => !ok).map(([k]) => k);
const missingRegistryChecks = Object.entries(registryChecks).filter(([, ok]) => !ok).map(([k]) => k);
const totalMissing = missingDependencies.length + missingRegistryChecks.length;

const report = {
  system: 'SHEIKHA_CAPABILITY_REGISTRY_V2',
  status: totalMissing ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: totalMissing ? Math.max(0, 100 - totalMissing * 8) : 100,
  decision: totalMissing ? 'REVIEW_CAPABILITY_REGISTRY_GAPS' : 'CAPABILITY_REGISTRY_V2_ACTIVE_100',
  dependencies,
  registryChecks,
  missingDependencies,
  missingRegistryChecks,
  coverage: {
    capabilityItems: registry?.items?.length || 0,
    activeItems: registry?.items?.filter(x => x.status === 'ACTIVE').length || 0,
    humanReviewItems: registry?.items?.filter(x => x.requiresHumanReview === true).length || 0
  },
  nextActions: [
    'Activate Execution Fabric V2 after Capability Registry V2 is clean.',
    'Allow execution only for registered active capabilities.',
    'Connect capability execution to tests, drift detector, and PR governance.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/capability-registry/v2');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-capability-registry-v2-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-capability-registry-v2-report.md'),
  `# SHEIKHA_CAPABILITY_REGISTRY_V2

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- القدرات: ${report.coverage.capabilityItems}
- القدرات النشطة: ${report.coverage.activeItems}
- قدرات تحتاج مراجعة بشرية: ${report.coverage.humanReviewItems}

## الفحوص
${Object.entries(dependencies).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## التالي
${report.nextActions.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
