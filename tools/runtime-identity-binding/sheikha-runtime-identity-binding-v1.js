'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

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

const packageJson = readJson('package.json');
const wellKnown = readJson('.well-known/sheikha.json');
const serverJs = readText('server.js');
const fabricRoutes = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const git = readGitInfo();
const rootIdentityRoute = (fabricRoutes.routes || []).find((route) => route.name === 'sheikha-root-identity');
const operatingSystemRoute = (fabricRoutes.routes || []).find((route) => route.name === 'sheikha-operating-system-identity');

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

Object.assign(checks, {
  packageNameRaised: packageJson.name === 'sheikha-operating-system',
  wellKnownRootIdentityRaised:
    wellKnown.highestIdentity === 'Sheikha Root' &&
    wellKnown.operatingSystem === 'Sheikha Operating System',
  serverRoutesBound:
    serverJs.includes("app.use('/api/root-identity'") &&
    serverJs.includes("app.use('/api/operating-system'") &&
    serverJs.includes("app.use('/api/runtime/identity'"),
  fabricRoutesBound:
    Boolean(rootIdentityRoute) &&
    Boolean(operatingSystemRoute) &&
    rootIdentityRoute.mount === '/api/root-identity' &&
    operatingSystemRoute.mount === '/api/operating-system'
});

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_RUNTIME_IDENTITY_BINDING_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  branch: git.branch,
  head: git.head,
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
  actualBinding: {
    packageName: 'sheikha-operating-system',
    rootIdentityEndpoint: '/api/root-identity/status',
    operatingSystemEndpoint: '/api/operating-system/status',
    runtimeIdentityEndpoint: '/api/runtime/identity/status',
    rootFabricMount: '/api/root-identity',
    operatingSystemFabricMount: '/api/operating-system'
  },
  nextActions: [
    'Commit runtime identity binding as one governed layer.',
    'Run tests and PR checks.',
    'Keep portal path as compatibility only.',
    'Do not rename filesystem paths until a migration plan is approved.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeJson('runtime/runtime-identity-binding/v1/sheikha-runtime-identity-binding-report.json', report);
writeText(
  'runtime/runtime-identity-binding/v1/sheikha-runtime-identity-binding-report.md',
  `# Sheikha Runtime Identity Binding V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- القرار: ${report.decision}

## الهرم الرسمي
${report.hierarchy.map((x, i) => `${i + 1}. ${x}`).join('\n')}

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? 'OK' : 'MISSING'} ${k}`).join('\n')}

## الربط الفعلي
- package: ${report.actualBinding.packageName}
- root identity: ${report.actualBinding.rootIdentityEndpoint}
- operating system: ${report.actualBinding.operatingSystemEndpoint}
- runtime identity: ${report.actualBinding.runtimeIdentityEndpoint}
- root fabric: ${report.actualBinding.rootFabricMount}
- operating system fabric: ${report.actualBinding.operatingSystemFabricMount}

## الإجراءات التالية
${report.nextActions.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
