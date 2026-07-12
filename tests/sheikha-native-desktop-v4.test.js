'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  REQUIRED_EVIDENCE_FILES,
  claimSeparation,
  generateV4Inspection,
  historicalIntegrity,
  inspectBuiltArtifact,
  inspectToolchain,
  securityVerification,
  verifyEvidence
} = require('../distribution/pipeline/sheikha-native-desktop-v4');
const {
  EXPECTED_HELPER_PATTERN,
  markerMap
} = require('../distribution/pipeline/sheikha-native-desktop-v4-smoke');

const ROOT = path.join(__dirname, '..');

describe('Sheikha Native Desktop Executable V4', () => {
  test('reports the installed and build-ready Tauri toolchain', () => {
    const report = inspectToolchain();

    expect(report).toMatchObject({
      system: 'SHEIKHA_NATIVE_DESKTOP_V4_TOOLCHAIN_INSPECTION',
      status: 'BUILD_READY',
      host: { platform: 'linux', architecture: 'x86_64' },
      missingRequirements: []
    });
    expect(report.tools.rustc.available).toBe(true);
    expect(report.tools.cargo.available).toBe(true);
    expect(report.tools.rustup.available).toBe(true);
    expect(report.pkgConfigModules['webkit2gtk-4.1'].available).toBe(true);
    expect(report.pkgConfigModules['gtk+-3.0'].available).toBe(true);
    expect(report.pkgConfigModules.openssl.available).toBe(true);
    expect(Object.hasOwn(report.pkgConfigModules, 'webkit2gtk-4.1')).toBe(true);
    expect(Object.hasOwn(report.pkgConfigModules, 'gtk+-3.0')).toBe(true);
    expect(Object.hasOwn(report.pkgConfigModules, 'openssl')).toBe(true);
    expect(report.requiredPackageNamesOnly).toEqual(expect.arrayContaining([
      'rustc',
      'cargo',
      'libwebkit2gtk-4.1-dev',
      'libgtk-3-dev'
    ]));
  });

  test('keeps V4 Tauri claims separate from predecessor, bare-metal, CLI, and eligibility', () => {
    const claims = claimSeparation();

    expect(claims.desktopNativeVerified).toMatchObject({
      existingNonTauriVerifiedCount: 1,
      v4TauriVerifiedCount: 0,
      predecessor: {
        framework: 'dynamic-gtk3-webkit2gtk-4.0',
        verified: true,
        countsTowardV4Tauri: false
      }
    });
    expect(claims.bareMetalNativeVerified.verifiedCount).toBe(1);
    expect(claims.cliNativeVerified).toMatchObject({
      legacyVerifiedCount: 1,
      selfContainedNativeExecutable: false
    });
    expect(claims.eligibilityOnlyVerification).toMatchObject({
      count: 1,
      desktopExecutable: false,
      nativeVerified: false
    });
  });

  test('expresses deny-by-default security and the governed invocation sequence', () => {
    const security = securityVerification();

    expect(security).toMatchObject({
      status: 'IMPLEMENTED_STATICALLY_VERIFIED_NATIVE_PENDING',
      implementationVerified: true,
      nativeEnforcementVerified: false,
      defaultDeny: {
        shell: true,
        arbitraryFilesystem: true,
        arbitraryNetwork: true,
        processSpawning: true,
        systemInstaller: true,
        firmware: true,
        kernel: true
      },
      artificialIntelligenceBoundaries: {
        automaticShellExecution: false,
        automaticPackageInstallation: false,
        automaticSystemMutation: false,
        humanApprovalBypass: false,
        automatedReligiousRuling: false
      },
      humanApprovalForHighImpact: true,
      tauriCapabilityManifestCreated: true,
      tauriPermissions: [
        'allow-governed-request',
        'allow-native-smoke-ready'
      ],
      prohibitedTauriPluginsPresent: false
    });
    expect(security.invocationFlow).toEqual([
      'UI Request',
      'Schema Validation',
      'Capability Contract',
      'Governance Gate',
      'Human Approval when required',
      'Native Adapter',
      'Audit Record'
    ]);
  });

  test('builds a real inspected Tauri ELF without unresolved dependencies', () => {
    const artifact = inspectBuiltArtifact();

    expect(artifact).toMatchObject({
      built: true,
      inspected: true,
      architectureCorrect: true,
      pie: true,
      bindNow: true,
      dependenciesResolved: true
    });
    expect(artifact.bytes).toBeGreaterThan(1_000_000);
    expect(artifact.sha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(artifact.fileInspection).toContain('ELF 64-bit LSB pie executable, x86-64');
    expect(artifact.dynamicSection).toContain('libwebkit2gtk-4.1.so.0');
    expect(artifact.dependencies).not.toContain('not found');
  });

  test('exposes only governed commands and keeps the frontend local', () => {
    const tauriRoot = path.join(ROOT, 'desktop', 'shell', 'tauri-v4');
    const cargo = fs.readFileSync(path.join(tauriRoot, 'src-tauri', 'Cargo.toml'), 'utf8');
    const lock = fs.readFileSync(path.join(tauriRoot, 'src-tauri', 'Cargo.lock'), 'utf8');
    const source = fs.readFileSync(path.join(tauriRoot, 'src-tauri', 'src', 'main.rs'), 'utf8');
    const html = fs.readFileSync(path.join(tauriRoot, 'ui', 'index.html'), 'utf8');
    const script = fs.readFileSync(path.join(tauriRoot, 'ui', 'app.js'), 'utf8');
    const capability = JSON.parse(fs.readFileSync(
      path.join(tauriRoot, 'src-tauri', 'capabilities', 'main-governed.json'),
      'utf8'
    ));

    expect(capability.permissions).toEqual([
      'allow-governed-request',
      'allow-native-smoke-ready'
    ]);
    expect(cargo).not.toMatch(/tauri-plugin-(?:shell|fs|http|process|updater|opener)/u);
    expect(lock).not.toContain('source = "git+');
    expect(source).not.toMatch(/std::process|Command::new|\bsystem\s*\(/u);
    expect(source).toContain('127.0.0.1:8080');
    expect(source).toContain('CAPABILITY_NOT_ALLOWLISTED');
    expect(source).toContain('get_webview_window("main")');
    expect(source).toContain('.is_visible()');
    expect(source).toContain('SHEIKHA_NATIVE_DESKTOP_V4_CLEAN_SHUTDOWN_OK');
    expect(html).toContain('lang="ar" dir="rtl"');
    expect(html).toContain('محادثة شيخة');
    expect(html).toContain('المفتش المؤسسي');
    expect(script).not.toMatch(/\bfetch\s*\(|XMLHttpRequest/u);
    expect(script).toContain("nativeInvoke('governed_request'");
  });

  test('requires every native UI and shutdown marker before verification', () => {
    const output = [
      'SHEIKHA_NATIVE_DESKTOP_V4_LAUNCH_OK',
      'SHEIKHA_NATIVE_DESKTOP_V4_WINDOW_OK',
      'SHEIKHA_NATIVE_DESKTOP_V4_HEALTH_OK',
      'SHEIKHA_NATIVE_DESKTOP_V4_CHAT_OK',
      'SHEIKHA_NATIVE_DESKTOP_V4_INSPECTOR_OK',
      'SHEIKHA_NATIVE_DESKTOP_V4_SMOKE_OK',
      'SHEIKHA_NATIVE_DESKTOP_V4_CLEAN_SHUTDOWN_OK'
    ].join('\n');

    expect(markerMap(output)).toEqual({
      launch: true,
      window: true,
      health: true,
      chat: true,
      inspector: true,
      smoke: true,
      cleanShutdown: true
    });
    expect(Object.values(markerMap(output.replace('CHAT_OK', 'CHAT_MISSING')))).toContain(false);
    expect(EXPECTED_HELPER_PATTERN.test('/usr/lib/WebKitNetworkProcess')).toBe(true);
    expect(EXPECTED_HELPER_PATTERN.test('/bin/sh -c arbitrary-command')).toBe(false);
  });

  test('does not alter historical V2 or V3 reports', () => {
    const integrity = historicalIntegrity();

    expect(integrity).toMatchObject({
      status: 'VERIFIED_UNMODIFIED',
      modifiedHistoricalFiles: []
    });
    expect(integrity.tracked).toHaveLength(4);
    expect(integrity.tracked.every((item) => item.exists && /^[a-f0-9]{64}$/u.test(item.sha256))).toBe(true);
  });

  test('generates complete built-not-native-verified evidence without overclaiming', () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-desktop-v4-'));
    try {
      const report = generateV4Inspection({ reportRoot: fixture });
      const verification = verifyEvidence(fixture);

      expect(verification).toMatchObject({ valid: true, missingFiles: [] });
      expect(report).toMatchObject({
        system: 'SHEIKHA_NATIVE_DESKTOP_EXECUTABLE_V4',
        status: 'BUILT_NOT_NATIVE_VERIFIED',
        platform: 'linux',
        architecture: 'x86_64',
        framework: 'tauri-2',
        tauriShellCreated: true,
        cargoManifestCreated: true,
        desktopExecutableBuilt: true,
        desktopExecutableBuiltCount: 1,
        artifactInspected: true,
        nativeLaunchExecuted: false,
        nativeLaunchVerified: false,
        desktopNativeVerifiedCount: 0,
        artifact: {
          format: 'ELF',
          architecture: 'x86_64',
          dependenciesResolved: true
        },
        installationPerformed: false,
        sudoUsed: false,
        githubUsed: false
      });
      expect(REQUIRED_EVIDENCE_FILES.every((name) => (
        fs.existsSync(path.join(fixture, 'evidence', name))
      ))).toBe(true);
      expect(fs.readFileSync(path.join(fixture, 'evidence', 'artifact-sha256.txt'), 'utf8'))
        .toMatch(/^[a-f0-9]{64}\s{2}desktop\/shell\/tauri-v4/u);
      expect(fs.existsSync(path.join(ROOT, 'desktop', 'shell', 'tauri-v4', 'src-tauri', 'Cargo.toml')))
        .toBe(true);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });
});
