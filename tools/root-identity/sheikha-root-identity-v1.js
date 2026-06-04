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
  system: 'SHEIKHA_ROOT_IDENTITY_V1',
  status: 'ACTIVE',
  identity: {
    official: 'Sheikha Root',
    arabic: 'جذر شيخة',
    runtime: 'Sheikha Root Operating Core',
    legacy: 'sheikha-main-portal'
  },
  branch: sh('git branch --show-current'),
  head: sh('git rev-parse --short HEAD'),
  gitStatus: sh('git status --short'),
  elevation: {
    from: 'PORTAL_LAYER',
    to: 'ROOT_LAYER',
    repositoryPathKept: true,
    breakingRenameNow: false
  },
  checks: {
    rootOperatingCore: exists('runtime/root-operating-core/v1/sheikha-root-operating-core-v1.json'),
    unifiedGovernanceFabric: exists('runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-v1.json'),
    architectureFreeze: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
    stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-v1.json')
  },
  decision: 'SHEIKHA_ROOT_IDENTITY_ACTIVATED',
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/root-identity/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-root-identity-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-root-identity-report.md'),
  `# Sheikha Root Identity

## الهوية
- الاسم الأعلى: ${report.identity.official}
- الاسم العربي: ${report.identity.arabic}
- الاسم التشغيلي: ${report.identity.runtime}
- الاسم القديم: ${report.identity.legacy}

## الرفع
- من: ${report.elevation.from}
- إلى: ${report.elevation.to}
- تغيير المسار الآن: لا
- السبب: منع كسر VPS / PM2 / Git

## الفحوص
${Object.entries(report.checks).map(([k,v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
