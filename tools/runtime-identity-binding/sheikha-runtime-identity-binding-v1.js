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

const required = {
  wellKnownIdentity: '.well-known/sheikha.json',
  sheikhaIdentity: 'governance/identity/sheikha-identity.json',
  enterpriseIdentity: 'governance/identity/sheikha-enterprise-identity.json',
  runtimeManifest: 'governance/runtime/sheikha-runtime-manifest.json',
  operatingSystem: 'runtime/operating-system/v1/sheikha-operating-system-v1.json',
  rootIdentity: 'runtime/root-identity/v1/sheikha-root-identity-v1.json',
  rootArchitectureTools: 'runtime/root-architecture-tools/v1/sheikha-root-architecture-tools-v1.json',
  runtimeIdentityLib: 'lib/runtime-identity',
  runtimeIdentityRoutes: 'routes/runtime/identity',
  server: 'server.js'
};

const checks = Object.fromEntries(
  Object.entries(required).map(([k, p]) => [k, exists(p)])
);

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_RUNTIME_IDENTITY_BINDING_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  branch: sh('git branch --show-current'),
  head: sh('git rev-parse --short HEAD'),
  gitStatus: sh('git status --short'),
  checks,
  missing,
  decision: missing.length ? 'REVIEW_MISSING_RUNTIME_IDENTITY_LINKS' : 'RUNTIME_IDENTITY_BINDING_ACTIVE',
  hierarchy: [
    'Sheikha Root',
    'Sheikha Root Operating Core',
    'Sheikha Operating System',
    'Unified Governance Fabric',
    'Runtime Identity',
    'Portal Compatibility Layer'
  ],
  nextActions: [
    'Commit runtime identity binding as one governed layer.',
    'Run tests and PR checks.',
    'Keep portal path as compatibility only.',
    'Do not rename filesystem paths until a migration plan is approved.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/runtime-identity-binding/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-runtime-identity-binding-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-runtime-identity-binding-report.md'),
  `# Sheikha Runtime Identity Binding V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- القرار: ${report.decision}

## الهرم الرسمي
${report.hierarchy.map((x, i) => `${i + 1}. ${x}`).join('\n')}

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## الإجراءات التالية
${report.nextActions.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
