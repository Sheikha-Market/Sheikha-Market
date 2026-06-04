'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

function sh(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (e) {
    return String(e.stderr || e.message || e).trim();
  }
}

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

const checks = {
  rootIdentity: exists('runtime/root-identity/v1/sheikha-root-identity-v1.json'),
  rootOperatingCore: exists('runtime/root-operating-core/v1/sheikha-root-operating-core-v1.json'),
  operatingSystem: exists('runtime/operating-system/v1/sheikha-operating-system-v1.json'),
  unifiedGovernanceFabric: exists('runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-v1.json'),
  runtimeIdentityBinding: exists('runtime/runtime-identity-binding/v1/sheikha-runtime-identity-binding-v1.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-v1.json'),
  continuousImprovement: exists('runtime/continuous-improvement/v1/sheikha-continuous-improvement-v1.json'),
  developmentPsychology: exists('runtime/development-psychology/v1/sheikha-development-psychology-v1.json'),
  architectureFreeze: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json')
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_HEART_CORE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  arabicName: 'قلب شيخة الحاكم',
  reference: 'الكتاب والسنة وسنة الخلفاء الراشدين المهديين',
  branch: sh('git branch --show-current'),
  head: sh('git rev-parse --short HEAD'),
  gitStatus: sh('git status --short'),
  position: 'ABOVE_ROOT_OPERATING_CORE',
  checks,
  missing,
  score: missing.length === 0 ? 100 : Math.max(0, 100 - missing.length * 10),
  decision: missing.length ? 'REVIEW_MISSING_HEART_LINKS' : 'HEART_CORE_ACTIVE_100',
  hierarchy: [
    'الكتاب والسنة وسنة الخلفاء الراشدين المهديين',
    'SHEIKHA_HEART_CORE_V1',
    'Sheikha Root',
    'Sheikha Root Operating Core',
    'Sheikha Operating System',
    'Unified Governance Fabric',
    'Runtime Identity Binding',
    'Execution Fabric',
    'Portal Compatibility Layer'
  ],
  principles: [
    'الصدق',
    'الأمانة',
    'العدل',
    'الإحسان',
    'الشورى',
    'التثبت',
    'الوفاء بالعقود',
    'لا ضرر ولا ضرار',
    'المسؤولية والمحاسبة',
    'التحسين المستمر'
  ],
  rules: {
    noRawMerge: true,
    noHarm: true,
    noDeception: true,
    auditRequired: true,
    testsRequired: true,
    humanReviewForHighRisk: true
  },
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/heart-core/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-heart-core-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-heart-core-report.md'),
  `# SHEIKHA_HEART_CORE_V1

## الحالة
- النظام: ${report.system}
- الاسم العربي: ${report.arabicName}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## المرجعية
${report.reference}

## الهرم الأعلى
${report.hierarchy.map((x, i) => `${i + 1}. ${x}`).join('\n')}

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## المبادئ
${report.principles.map((x, i) => `${i + 1}. ${x}`).join('\n')}

## القاعدة
لا دمج خام. لا ضرر. لا غش. لا تشغيل مؤثر بلا حوكمة. لا تطوير بلا اختبار. الإنسان صاحب القرار النهائي.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
