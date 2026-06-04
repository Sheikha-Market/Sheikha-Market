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

const definition = readJson('runtime/root-identity/v1/sheikha-root-identity-v1.json');
const packageJson = readJson('package.json');
const fabricRoutes = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const serverJs = readText('server.js');
const wellKnown = readJson('.well-known/sheikha.json');
const git = readGitInfo();
const rootIdentityRoute = (fabricRoutes.routes || []).find((route) => route.name === 'sheikha-root-identity');

const report = {
  system: definition.system,
  status: definition.status,
  identity: {
    official: definition.official_identity.english,
    arabic: definition.official_identity.arabic,
    runtime: definition.official_identity.full_runtime_name,
    operatingSystem: 'Sheikha Operating System',
    legacy: definition.legacy_identity.old_name
  },
  branch: git.branch,
  head: git.head,
  elevation: {
    from: definition.elevation.from,
    to: definition.elevation.to,
    repositoryPathKept: true,
    breakingRenameNow: false
  },
  actualBinding: definition.actual_binding,
  checks: {
    packageNameRaised: packageJson.name === definition.actual_binding.package_name,
    packageDisplayNameRaised: packageJson.displayName === definition.actual_binding.package_display_name,
    expressRootIdentityBound:
      serverJs.includes('app.locals.sheikhaRuntimeIdentity') &&
      serverJs.includes("app.use('/api/root-identity'") &&
      serverJs.includes("app.use('/api/operating-system'"),
    fabricRootIdentityBound:
      Boolean(rootIdentityRoute) &&
      rootIdentityRoute.mount === definition.actual_binding.fabric_root_mount &&
      rootIdentityRoute.module === './routes/runtime/identity/status.routes.js',
    wellKnownRaised:
      wellKnown.runtime === 'SHEIKHA_ROOT_IDENTITY_V1' &&
      wellKnown.highestIdentity === 'Sheikha Root' &&
      wellKnown.operatingSystem === 'Sheikha Operating System',
    operatingSystem: exists('runtime/operating-system/v1/sheikha-operating-system-v1.json'),
    rootOperatingCore: exists('runtime/root-operating-core/v1/sheikha-root-operating-core-v1.json'),
    unifiedGovernanceFabric: exists('runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-v1.json'),
    architectureFreeze: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
    stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-v1.json')
  },
  decision: 'SHEIKHA_ROOT_IDENTITY_ACTIVATED_ACTUALLY_AND_NOMINALLY',
  principle: definition.principle
};

writeJson('runtime/root-identity/v1/sheikha-root-identity-report.json', report);
writeText(
  'runtime/root-identity/v1/sheikha-root-identity-report.md',
  `# Sheikha Root Identity

## الهوية
- الاسم الأعلى: ${report.identity.official}
- الاسم العربي: ${report.identity.arabic}
- الاسم التشغيلي: ${report.identity.runtime}
- الاسم النظامي: ${report.identity.operatingSystem}
- الاسم القديم: ${report.identity.legacy}

## الرفع
- من: ${report.elevation.from}
- إلى: ${report.elevation.to}
- تغيير المسار الآن: لا
- السبب: منع كسر VPS / PM2 / Git

## الربط الفعلي
- package: ${report.actualBinding.package_name}
- Express: ${report.actualBinding.express_app_local}
- Root endpoint: ${report.actualBinding.direct_root_identity_endpoint}
- Operating endpoint: ${report.actualBinding.direct_operating_system_endpoint}
- Runtime endpoint: ${report.actualBinding.direct_runtime_identity_endpoint}
- Fabric root mount: ${report.actualBinding.fabric_root_mount}

## الفحوص
${Object.entries(report.checks).map(([k,v]) => `- ${v ? 'OK' : 'MISSING'} ${k}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
