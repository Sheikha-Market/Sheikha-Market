'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function writeJson(relativePath, value) {
  const filePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function writeText(relativePath, value) {
  const filePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function readGitInfo() {
  const headPath = path.join(ROOT, '.git', 'HEAD');

  if (!fs.existsSync(headPath)) {
    return {
      branch: 'unknown',
      head: 'unknown'
    };
  }

  const headRaw = fs.readFileSync(headPath, 'utf8').trim();

  if (!headRaw.startsWith('ref: ')) {
    return {
      branch: 'detached',
      head: headRaw.slice(0, 8)
    };
  }

  const ref = headRaw.slice(5);
  const refPath = path.join(ROOT, '.git', ref);
  const branch = ref.replace(/^refs\/heads\//, '');
  const head = fs.existsSync(refPath)
    ? fs.readFileSync(refPath, 'utf8').trim().slice(0, 8)
    : 'unknown';

  return {
    branch,
    head
  };
}

const git = readGitInfo();

const report = {
  system: 'SHEIKHA_ROOT_OPERATING_CORE_V1',
  status: 'ACTIVE',
  officialName: 'Sheikha Root Operating Core',
  arabicName: 'جذر تشغيل شيخة الأعلى',
  branch: git.branch,
  head: git.head,
  layerPosition: 'ABOVE_PORTAL_LAYER',
  methodologicalParent: exists('runtime/operating-system/v1/sheikha-operating-system-v1.json')
    ? 'SHEIKHA_OPERATING_SYSTEM_V1'
    : null,
  compatibility: {
    currentRepoPathKept: true,
    portalNameDeprecatedArchitecturally: true,
    portalPathStillAllowed: true,
    breakingRenameAllowedNow: false
  },
  checks: {
    unifiedGovernanceFabric: exists('runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-v1.json'),
    architectureFreeze: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
    stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-v1.json'),
    continuousImprovement: exists('runtime/continuous-improvement/v1/sheikha-continuous-improvement-v1.json'),
    developmentPsychology: exists('runtime/development-psychology/v1/sheikha-development-psychology-v1.json'),
    operatingSystemLayer: exists('runtime/operating-system/v1/sheikha-operating-system-v1.json')
  },
  decision: 'ROOT_OPERATING_CORE_NAME_ACTIVATED',
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeJson('runtime/root-operating-core/v1/sheikha-root-operating-core-report.json', report);
writeText(
  'runtime/root-operating-core/v1/sheikha-root-operating-core-report.md',
  `# Sheikha Root Operating Core

## الحالة
- الاسم الرسمي: ${report.officialName}
- الاسم العربي: ${report.arabicName}
- الموضع: ${report.layerPosition}
- الطبقة المنهجية الأعلى: ${report.methodologicalParent || 'غير مفعلة بعد'}
- القرار: ${report.decision}

## التوافق
- يبقى مسار portal للتوافق.
- الاسم المعماري الأعلى أصبح Root Operating Core.
- لا تغيير كاسر للمسارات الآن.

## الفحوص
${Object.entries(report.checks).map(([k,v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
