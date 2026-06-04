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

const checks = {
  rootIdentity: exists('runtime/root-identity/v1/sheikha-root-identity-v1.json'),
  rootOperatingCore: exists('runtime/root-operating-core/v1/sheikha-root-operating-core-v1.json'),
  operatingSystem: exists('runtime/operating-system/v1/sheikha-operating-system-v1.json'),
  unifiedGovernanceFabric: exists('runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-v1.json'),
  architectureFreeze: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-v1.json'),
  runtimeIdentityLib: exists('lib/runtime-identity'),
  runtimeIdentityRoutes: exists('routes/runtime/identity'),
  operatingSystemDocs: exists('docs/operating-system/SHEIKHA-OPERATING-SYSTEM-V1.md'),
  portalCompatibilityKept: exists('server.js')
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_ROOT_ARCHITECTURE_TOOLS_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  branch: sh('git branch --show-current'),
  head: sh('git rev-parse --short HEAD'),
  gitStatus: sh('git status --short'),
  namingHierarchy: [
    'Sheikha Root',
    'Sheikha Root Operating Core',
    'Sheikha Operating System',
    'Unified Governance Fabric',
    'Architecture Freeze V1.3',
    'Portal Compatibility Layer'
  ],
  checks,
  missing,
  decision: missing.length ? 'REVIEW_MISSING_ROOT_LINKS' : 'ROOT_ARCHITECTURE_TOOLS_ACTIVE',
  nextActions: [
    'Keep current repository path stable.',
    'Treat portal as compatibility only.',
    'Use Sheikha Root in architecture and reports.',
    'Bind operating system routes under root identity.',
    'Do not rename filesystem paths until migration plan is approved.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/root-architecture-tools/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-root-architecture-tools-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-root-architecture-tools-report.md'),
  `# Sheikha Root Architecture Tools V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- القرار: ${report.decision}

## هرم التسمية الأعلى
${report.namingHierarchy.map((x, i) => `${i + 1}. ${x}`).join('\n')}

## الفحوص
${Object.entries(checks).map(([k,v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## الإجراءات التالية
${report.nextActions.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
