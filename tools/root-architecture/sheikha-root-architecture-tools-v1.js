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
const fabricRoutes = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const serverJs = readText('server.js');
const wellKnown = readJson('.well-known/sheikha.json');
const git = readGitInfo();
const rootIdentityRoute = (fabricRoutes.routes || []).find((route) => route.name === 'sheikha-root-identity');
const operatingSystemRoute = (fabricRoutes.routes || []).find((route) => route.name === 'sheikha-operating-system-identity');

const checks = {
  packageIdentityRaised: packageJson.name === 'sheikha-operating-system',
  wellKnownRootRaised: wellKnown.highestIdentity === 'Sheikha Root',
  expressRootIdentityBound:
    serverJs.includes('app.locals.sheikhaRuntimeIdentity') &&
    serverJs.includes("app.use('/api/root-identity'") &&
    serverJs.includes("app.use('/api/operating-system'") &&
    serverJs.includes("app.use('/api/runtime/identity'"),
  fabricRootIdentityBound:
    Boolean(rootIdentityRoute) &&
    rootIdentityRoute.mount === '/api/root-identity' &&
    rootIdentityRoute.module === './routes/runtime/identity/status.routes.js',
  fabricOperatingSystemBound:
    Boolean(operatingSystemRoute) &&
    operatingSystemRoute.mount === '/api/operating-system' &&
    operatingSystemRoute.module === './routes/runtime/identity/status.routes.js',
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
  branch: git.branch,
  head: git.head,
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
  actualBinding: {
    packageName: 'sheikha-operating-system',
    rootIdentityEndpoint: '/api/root-identity/status',
    operatingSystemEndpoint: '/api/operating-system/status',
    runtimeIdentityEndpoint: '/api/runtime/identity/status',
    rootFabricMount: '/api/root-identity',
    operatingSystemFabricMount: '/api/operating-system'
  },
  nextActions: [
    'Keep current repository path stable.',
    'Treat portal as compatibility only.',
    'Use Sheikha Root in architecture and reports.',
    'Bind operating system routes under root identity.',
    'Do not rename filesystem paths until migration plan is approved.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeJson('runtime/root-architecture-tools/v1/sheikha-root-architecture-tools-report.json', report);
writeText(
  'runtime/root-architecture-tools/v1/sheikha-root-architecture-tools-report.md',
  `# Sheikha Root Architecture Tools V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- القرار: ${report.decision}

## هرم التسمية الأعلى
${report.namingHierarchy.map((x, i) => `${i + 1}. ${x}`).join('\n')}

## الفحوص
${Object.entries(checks).map(([k,v]) => `- ${v ? 'OK' : 'MISSING'} ${k}`).join('\n')}

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
