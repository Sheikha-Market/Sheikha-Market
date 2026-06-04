'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

function sh(cmd) {
  try { return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim(); }
  catch (e) { return String(e.stderr || e.message || e).trim(); }
}

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

const report = {
  system: 'SHEIKHA_ROOT_OPERATING_CORE_V1',
  status: 'ACTIVE',
  officialName: 'Sheikha Root Operating Core',
  arabicName: 'جذر تشغيل شيخة الأعلى',
  branch: sh('git branch --show-current'),
  head: sh('git rev-parse --short HEAD'),
  gitStatus: sh('git status --short'),
  layerPosition: 'ABOVE_PORTAL_LAYER',
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
    developmentPsychology: exists('runtime/development-psychology/v1/sheikha-development-psychology-v1.json')
  },
  decision: 'ROOT_OPERATING_CORE_NAME_ACTIVATED',
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/root-operating-core/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-root-operating-core-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-root-operating-core-report.md'),
  `# Sheikha Root Operating Core

## الحالة
- الاسم الرسمي: ${report.officialName}
- الاسم العربي: ${report.arabicName}
- الموضع: ${report.layerPosition}
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
