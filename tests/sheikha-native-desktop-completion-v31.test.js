'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  DECISION_REPORT,
  MAIN_REPORT,
  RELEASE_ROOT,
  baselineIntegrity,
  verifyReleaseTree
} = require('../distribution/pipeline/sheikha-native-desktop-completion-v31');
const { createSheikhaApiClient } = require('../sdk/sheikha-api');
const {
  executeGoverned,
  installationStatus
} = require('../desktop/installer-contracts/sheikha-linux-user-installer-v31');
const nativeDesktopStatus = require(
  '../runtime/distribution/v3.1/sheikha-native-desktop-v31-status'
);

const ROOT = path.join(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('Sheikha Native Desktop Completion V3.1', () => {
  test('implements a loopback-only native shell without a system bridge', () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'desktop/shell/native-linux/sheikha_native_desktop.c'),
      'utf8'
    );
    const contract = readJson(path.join(
      ROOT,
      'desktop/shell/native-linux/sheikha-native-desktop-security-v31.json'
    ));

    expect(source).toContain('dlopen("libgtk-3.so.0"');
    expect(source).toContain('dlopen("libwebkit2gtk-4.0.so.37"');
    expect(source).toContain('SHEIKHA_NATIVE_DESKTOP_URL_DENIED');
    expect(source).not.toContain('system(');
    expect(source).not.toContain('execve(');
    expect(contract.nativeBridge).toMatchObject({
      implemented: false,
      shellAccess: false,
      filesystemAccess: false,
      kernelAccess: false,
      firmwareAccess: false,
      packageManagerAccess: false,
      secretsAccess: false
    });
    expect(contract.webView).toMatchObject({
      sandboxRequired: true,
      downloads: false,
      newWindows: false,
      remoteTopLevelNavigation: false
    });
  });

  test('contains a verified x86_64 ELF and user-local archive', () => {
    const verification = verifyReleaseTree(RELEASE_ROOT);
    const kinds = verification.index.artifacts.map((artifact) => artifact.artifactKind);

    expect(verification).toMatchObject({
      valid: true,
      errors: [],
      artifactCount: 2,
      nativeVerifiedTargetCount: 1,
      desktopExecutableArtifactCount: 1,
      duplicateArtifactNames: 0,
      duplicateArtifactHashes: 0,
      secretScan: { passed: true, findings: [] }
    });
    expect(kinds).toEqual(expect.arrayContaining(['ELF_NATIVE_EXECUTABLE', 'USER_PORTABLE_TAR_GZ']));
    expect(verification.index.artifacts.every((artifact) => artifact.nativeVerified === true)).toBe(true);
  });

  test('runs the built native binary probe and rejects a remote URL', () => {
    const index = readJson(path.join(RELEASE_ROOT, 'release-index.json'));
    const elf = index.artifacts.find((artifact) => artifact.artifactKind === 'ELF_NATIVE_EXECUTABLE');
    const binary = path.join(RELEASE_ROOT, elf.relativePath);
    const probe = spawnSync(binary, ['--probe'], { encoding: 'utf8' });
    const denied = spawnSync(binary, ['--smoke', '--url', 'https://example.com/'], { encoding: 'utf8' });

    expect(probe.status).toBe(0);
    expect(probe.stdout).toContain('SHEIKHA_NATIVE_DESKTOP_PROBE_OK');
    expect(probe.stdout).toContain('"architecture":"x86_64"');
    expect(denied.status).toBe(65);
    expect(denied.stderr).toContain('SHEIKHA_NATIVE_DESKTOP_URL_DENIED');
  });

  test('records reproducibility, GUI launch measurements, and ELF hardening', () => {
    const report = readJson(MAIN_REPORT);
    const security = readJson(path.join(
      ROOT,
      'runtime/distribution/v3.1/sheikha-native-desktop-security-hardening-v31.json'
    ));
    const native = readJson(path.join(
      ROOT,
      'runtime/distribution/v3.1/sheikha-native-desktop-verification-v31.json'
    ));

    expect(report).toMatchObject({
      status: 'NATIVE_VERIFIED',
      builtTargetCount: 1,
      verifiedTargetCount: 1,
      nativeVerifiedTargetCount: 1,
      desktopExecutableArtifactCount: 1,
      platformStates: { linuxX86_64: 'NATIVE_VERIFIED' }
    });
    expect(report.measurements).toMatchObject({ measuredLocally: true });
    expect(report.measurements.elfBytes).toBeGreaterThan(0);
    expect(report.measurements.nativeSmokeDurationMs).toBeGreaterThan(0);
    expect(native.reproducibility.passed).toBe(true);
    expect(native.nativeExecution).toMatchObject({
      probePassed: true,
      remoteUrlDenied: true,
      guiLaunchPassed: true,
      pageLoadPassed: true,
      nativeBridgeExposed: false
    });
    expect(security.elf).toMatchObject({
      architectureCorrect: true,
      pie: true,
      nxStack: true,
      relro: true,
      bindNow: true,
      stackCanary: true,
      directNodeDependency: false,
      directGtkLinkDependency: false
    });
  });

  test('verifies user install, native launch, uninstall, and rollback to preinstall state', () => {
    const lifecycle = readJson(path.join(
      ROOT,
      'runtime/distribution/v3.1/sheikha-native-desktop-installer-lifecycle-v31.json'
    ));

    expect(lifecycle).toMatchObject({
      status: 'NATIVE_VERIFIED',
      administratorUsed: false,
      actualUserHomeModified: false,
      archiveExtracted: true,
      launcherCreated: true,
      installedProbePassed: true,
      installedLaunchPassed: true,
      uninstallPassed: true,
      rollbackToPreInstallStatePassed: true,
      userDataDeleted: false,
      systemInstallerBuilt: false,
      systemInstallTested: false
    });
  });

  test('records the governed activation of the actual current-user installation', () => {
    const activation = readJson(path.join(
      ROOT,
      'runtime/distribution/v3.1/evidence/actual-user-activation-v31.json'
    ));

    expect(activation).toMatchObject({
      status: 'NATIVE_VERIFIED',
      approvalSource: 'EXPLICIT_USER_REQUEST_COMPLETE_ACTIVATION_NOW',
      scope: 'current-user',
      probePassed: true,
      installedBinaryLaunchPassed: true,
      installedPageLoadPassed: true,
      windowGeometryVerified: '1280x820',
      administratorUsed: false,
      sudoUsed: false,
      packagesInstalled: false,
      githubRequired: false,
      rollbackAdapterAvailable: true,
      actualRollbackExecuted: false,
      rollbackTestedInIsolatedHome: true
    });
    expect(activation.binarySha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(activation.auditEvidenceSha256).toMatch(/^[a-f0-9]{64}$/u);
  });

  test('executes the governed user installer adapter atomically in an isolated home', async () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-native-installer-v31-'));
    try {
      const releaseRoot = path.join(
        fixture,
        'Sheikha-Local-Registry',
        'releases',
        'v3.1',
        '1.0.51'
      );
      fs.mkdirSync(path.dirname(releaseRoot), { recursive: true });
      fs.cpSync(RELEASE_ROOT, releaseRoot, { recursive: true, dereference: false });
      const installed = await executeGoverned('install', {
        homeDir: fixture,
        releaseRoot,
        actorId: 'installer-test-human',
        approvalId: 'installer-test-approval-v31'
      });
      const active = installationStatus({ homeDir: fixture });

      expect(installed).toMatchObject({
        status: 'INSTALLED',
        scope: 'current-user',
        probePassed: true,
        administratorUsed: false,
        githubRequired: false
      });
      expect(active).toMatchObject({
        installed: true,
        launcherPresent: true,
        desktopEntryPresent: true,
        iconPresent: true
      });

      const removed = await executeGoverned('uninstall', {
        homeDir: fixture,
        releaseRoot,
        actorId: 'installer-test-human',
        approvalId: 'installer-test-uninstall-v31'
      });
      expect(removed).toMatchObject({
        status: 'UNINSTALLED',
        productFilesRemoved: true,
        userDataDeleted: false,
        administratorUsed: false
      });
      expect(installationStatus({ homeDir: fixture }).installed).toBe(false);
      const auditPath = path.join(
        fixture,
        '.local',
        'state',
        'sheikha',
        'native-desktop',
        'audit-v31.jsonl'
      );
      expect(fs.readFileSync(auditPath, 'utf8').trim().split('\n')).toHaveLength(4);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  test('keeps immutable V3 baseline unchanged and records a successor decision', () => {
    const baseline = baselineIntegrity();
    const decision = readJson(DECISION_REPORT);

    expect(baseline).toMatchObject({
      status: 'V3_BASELINE_VERIFIED_UNMODIFIED',
      artifactCount: 1,
      historicalDiff: [],
      historicalFilesModifiedByV31: false
    });
    expect(baseline.workspaceArtifacts.every((artifact) => artifact.valid)).toBe(true);
    expect(decision).toMatchObject({
      status: 'NATIVE_VERIFIED',
      supersedesDecision: 'runtime/desktop-runtime/v1/sheikha-desktop-runtime-decision-v1.json',
      selection: {
        selectedRuntime: 'DYNAMIC_GTK3_WEBKIT2GTK_RUNTIME_BINDING',
        packagesInstalled: false,
        nativeBridgeExposed: false,
        loopbackOnly: true
      },
      platformCoverage: {
        linuxX86_64: 'NATIVE_VERIFIED',
        linuxAarch64: 'TOOLCHAIN_MISSING',
        windowsX64: 'REQUIRES_NATIVE_RUNNER',
        macosArm64: 'REQUIRES_NATIVE_RUNNER'
      }
    });
  });

  test('exposes only read-only V3.1 operations through the SDK', async () => {
    const calls = [];
    const client = createSheikhaApiClient({
      fetchImpl: async (url, options) => {
        calls.push({ url, options });
        return { ok: true, status: 200, json: async () => ({ success: true }) };
      }
    });

    await client.nativeDesktop.status();
    await client.nativeDesktop.nativeVerification();
    await client.nativeDesktop.installerLifecycle();
    await client.nativeDesktop.security();
    await client.nativeDesktop.releaseIndex();
    expect(calls.map((call) => call.url)).toEqual([
      'http://localhost:8080/api/sheikha/distribution-apex/v3.1/status',
      'http://localhost:8080/api/sheikha/distribution-apex/v3.1/native-verification',
      'http://localhost:8080/api/sheikha/distribution-apex/v3.1/installer-lifecycle',
      'http://localhost:8080/api/sheikha/distribution-apex/v3.1/security',
      'http://localhost:8080/api/sheikha/distribution-apex/v3.1/release-index'
    ]);
    expect(calls.every((call) => call.options.method === 'GET')).toBe(true);
  });

  test('returns sanitized live status and release metadata without local paths', () => {
    const status = nativeDesktopStatus.status();
    const index = nativeDesktopStatus.releaseIndex();

    expect(status).toMatchObject({
      status: 'NATIVE_VERIFIED',
      nativeVerifiedTargetCount: 1,
      desktopExecutableArtifactCount: 1,
      actualUserActivation: {
        status: 'NATIVE_VERIFIED',
        scope: 'current-user',
        probePassed: true,
        installedBinaryLaunchPassed: true,
        administratorUsed: false,
        rollbackAdapterAvailable: true,
        actualRollbackExecuted: false
      },
      readOnlyApi: true,
      remoteBuildEndpointExposed: false,
      remoteInstallEndpointExposed: false,
      remotePublishEndpointExposed: false
    });
    expect(index).toMatchObject({
      available: true,
      artifactCount: 2,
      nativeVerifiedTargetCount: 1,
      desktopExecutableArtifactCount: 1,
      localPathExposed: false
    });
    expect(JSON.stringify({ status, index })).not.toContain('/home/sheikha');
  });
});
