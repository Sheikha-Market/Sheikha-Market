'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

const checks = {
  heartCore: exists('runtime/heart-core/v1/sheikha-heart-core-report.json'),
  rootIdentity: exists('runtime/root-identity/v1/sheikha-root-identity-v1.json'),
  rootOperatingCore: exists('runtime/root-operating-core/v1/sheikha-root-operating-core-v1.json'),
  operatingSystem: exists('runtime/operating-system/v1/sheikha-operating-system-v1.json'),
  unifiedGovernanceFabric: exists('runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-v1.json'),
  architectureFreeze: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
  runtimeContractEnforcer: exists('runtime/runtime-contract-enforcer/v1/sheikha-runtime-contract-enforcer-v1.json'),
  apiContractRegistryV2: exists('runtime/api-contract-registry/v2/sheikha-api-contract-registry-v2.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-v1.json'),
  continuousImprovement: exists('runtime/continuous-improvement/v1/sheikha-continuous-improvement-v1.json'),
  developmentPsychology: exists('runtime/development-psychology/v1/sheikha-development-psychology-v1.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js'),
  packageIdentity: exists('package.json')
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_ROOT_AUTHORITY_LAYER_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  arabicName: 'طبقة سلطة الجذر الحاكمة',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_ROOT_AUTHORITY_GAPS' : 'ROOT_AUTHORITY_LAYER_ACTIVE_100',
  checks,
  missing,
  authorityChain: [
    'SHEIKHA_HEART_CORE_V1',
    'SHEIKHA_ROOT_AUTHORITY_LAYER_V1',
    'SHEIKHA_ROOT_IDENTITY_V1',
    'SHEIKHA_ROOT_OPERATING_CORE_V1',
    'SHEIKHA_OPERATING_SYSTEM_V1',
    'SHEIKHA_UNIFIED_GOVERNANCE_FABRIC_V1',
    'SHEIKHA_RUNTIME_CONTRACT_ENFORCER_V1',
    'SHEIKHA_STABILITY_LAYER_V1',
    'PORTAL_COMPATIBILITY_LAYER'
  ],
  enforcement: {
    noRawMerge: true,
    noDriftRequired: true,
    testsRequired: true,
    stabilityScoreRequired: 100,
    runtimeContractRequired: true,
    humanReviewForHighRisk: true
  },
  nextActions: [
    'Keep Root Authority above Root Operating Core.',
    'Use Heart Core as the highest values reference.',
    'Allow new engines only after PASS + NO_DRIFT + stability 100.',
    'Connect Knowledge Engine V2 next under Root Authority.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/root-authority-layer/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-root-authority-layer-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-root-authority-layer-report.md'),
  `# SHEIKHA_ROOT_AUTHORITY_LAYER_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## سلسلة السلطة
${report.authorityChain.map((x, i) => `${i + 1}. ${x}`).join('\n')}

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## القواعد
- لا دمج خام
- لا تشغيل مع Drift
- لا كسر للعقود
- لا توسع بلا Stability 100
- لا تغيير عالي المخاطر بلا مراجعة بشرية

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
