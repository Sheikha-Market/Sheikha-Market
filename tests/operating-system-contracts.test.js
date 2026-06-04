const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

describe('Sheikha operating system naming contracts', () => {
  test('package identity is raised from portal to operating system', () => {
    const packageJson = readJson('package.json');
    const lockfile = readJson('package-lock.json');

    expect(packageJson.name).toBe('sheikha-operating-system');
    expect(packageJson.displayName).toBe('Sheikha Operating System');
    expect(lockfile.name).toBe('sheikha-operating-system');
    expect(lockfile.packages[''].name).toBe('sheikha-operating-system');
  });

  test('operating system is the highest methodological layer above root operating core', () => {
    const operatingSystem = readJson('runtime/operating-system/v1/sheikha-operating-system-v1.json');

    expect(operatingSystem.system).toBe('SHEIKHA_OPERATING_SYSTEM_V1');
    expect(operatingSystem.status).toBe('ACTIVE');
    expect(operatingSystem.official_name).toBe('Sheikha Operating System');
    expect(operatingSystem.position).toBe('ABOVE_ROOT_OPERATING_CORE');
    expect(operatingSystem.operating_order.slice(0, 2)).toEqual([
      'operating_system',
      'root_operating_core'
    ]);
  });

  test('legacy portal names remain compatibility aliases only', () => {
    const operatingSystem = readJson('runtime/operating-system/v1/sheikha-operating-system-v1.json');

    expect(operatingSystem.naming_policy.highest_methodological_name).toBe('Sheikha Operating System');
    expect(operatingSystem.naming_policy.highest_runtime_core_name).toBe('Sheikha Root Operating Core');
    expect(operatingSystem.naming_policy.legacy_repository_name).toBe('sheikha-main-portal');
    expect(operatingSystem.naming_policy.portal_is_compatibility_layer).toBe(true);
    expect(operatingSystem.naming_policy.do_not_break_existing_paths).toBe(true);
  });

  test('operating system is bound to express and fabric runtime surfaces', () => {
    const operatingSystem = readJson('runtime/operating-system/v1/sheikha-operating-system-v1.json');
    const fabricRoutes = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const serverJs = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const fabricRoute = fabricRoutes.routes.find((route) => route.name === 'sheikha-operating-system-identity');

    expect(operatingSystem.actual_binding.package_name).toBe('sheikha-operating-system');
    expect(serverJs).toContain('app.locals.sheikhaRuntimeIdentity');
    expect(serverJs).toContain("app.use('/api/root-identity'");
    expect(serverJs).toContain("app.use('/api/runtime/identity'");
    expect(serverJs).toContain("app.use('/api/operating-system'");
    expect(fabricRoute).toEqual(expect.objectContaining({
      mount: '/api/operating-system',
      module: './routes/runtime/identity/status.routes.js'
    }));
  });

  test('root identity is raised across well-known and governance manifests', () => {
    const rootIdentity = readJson('runtime/root-identity/v1/sheikha-root-identity-v1.json');
    const wellKnown = readJson('.well-known/sheikha.json');
    const governanceIdentity = readJson('governance/identity/sheikha-identity.json');
    const runtimeManifest = readJson('governance/runtime/sheikha-runtime-manifest.json');
    const fabricRoutes = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const rootRoute = fabricRoutes.routes.find((route) => route.name === 'sheikha-root-identity');

    expect(rootIdentity.status).toBe('ACTIVE');
    expect(rootIdentity.official_identity.english).toBe('Sheikha Root');
    expect(rootIdentity.actual_binding.direct_root_identity_endpoint).toBe('/api/root-identity/status');
    expect(wellKnown.highestIdentity).toBe('Sheikha Root');
    expect(wellKnown.operatingSystem).toBe('Sheikha Operating System');
    expect(governanceIdentity.name).toBe('Sheikha Root');
    expect(runtimeManifest.operatingSystem).toBe('Sheikha Operating System');
    expect(rootRoute).toEqual(expect.objectContaining({
      mount: '/api/root-identity',
      module: './routes/runtime/identity/status.routes.js'
    }));
  });

  test('runtime identity binding report is active and fully bound', () => {
    const report = readJson('runtime/runtime-identity-binding/v1/sheikha-runtime-identity-binding-report.json');

    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('RUNTIME_IDENTITY_BINDING_ACTIVE');
    expect(report.missing).toEqual([]);
    expect(report.actualBinding).toEqual(expect.objectContaining({
      packageName: 'sheikha-operating-system',
      rootIdentityEndpoint: '/api/root-identity/status',
      operatingSystemEndpoint: '/api/operating-system/status',
      runtimeIdentityEndpoint: '/api/runtime/identity/status'
    }));
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
  });

  test('operating system activation report is governed and complete', () => {
    const report = readJson('runtime/operating-system/v1/sheikha-operating-system-report.json');

    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('SHEIKHA_OPERATING_SYSTEM_V1_READY');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
  });
});
