#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  ROOT,
  findTool,
  readJson,
  sha256File
} = require('../common/distribution-utils');

const SYSTEM = 'SHEIKHA_NATIVE_DESKTOP_EXECUTABLE_V4';
const SCHEMA_VERSION = '4.0.0';
const REPORT_ROOT = path.join(ROOT, 'runtime', 'desktop-runtime', 'v4');
const EVIDENCE_ROOT = path.join(REPORT_ROOT, 'evidence');
const MAIN_REPORT = path.join(REPORT_ROOT, 'sheikha-native-desktop-v4-report.json');
const TAURI_ROOT = path.join(ROOT, 'desktop', 'shell', 'tauri-v4');
const TAURI_MANIFEST = path.join(TAURI_ROOT, 'src-tauri', 'Cargo.toml');
const TAURI_BINARY = path.join(
  TAURI_ROOT,
  'src-tauri',
  'target',
  'release',
  'sheikha-native-desktop'
);
const REQUESTED_START_HEAD = 'd387436f11b2d48ac91f435245b6b836499a0afa';

const HISTORICAL_PATHS = Object.freeze([
  'runtime/distribution/v2/sheikha-universal-delivery-v2-report.json',
  'runtime/distribution/v2/sheikha-native-verification-v2.json',
  'runtime/distribution/v3/sheikha-native-delivery-v3-report.json',
  'runtime/distribution/v3/sheikha-desktop-runtime-readiness-v3.json'
]);

const TOOL_VERSION_ARGS = Object.freeze({
  rustc: ['--version'],
  cargo: ['--version'],
  rustup: ['--version'],
  'pkg-config': ['--version'],
  gcc: ['--version'],
  clang: ['--version'],
  cmake: ['--version'],
  ninja: ['--version'],
  patchelf: ['--version'],
  ldd: ['--version'],
  file: ['--version'],
  readelf: ['--version'],
  objdump: ['--version']
});

const PKG_CONFIG_MODULES = Object.freeze([
  'webkit2gtk',
  'webkit2gtk-4.1',
  'gtk4',
  'gtk+-3.0',
  'openssl'
]);

const OFFICIAL_TAURI_LINUX_PACKAGES = Object.freeze([
  'build-essential',
  'libwebkit2gtk-4.1-dev',
  'libgtk-3-dev',
  'libssl-dev',
  'libayatana-appindicator3-dev',
  'librsvg2-dev',
  'libxdo-dev'
]);

const REQUIRED_EVIDENCE_FILES = Object.freeze([
  'toolchain-report.json',
  'build-command.txt',
  'build-log.txt',
  'artifact-sha256.txt',
  'elf-inspection.txt',
  'dependency-inspection.txt',
  'native-launch.log',
  'security-verification.json',
  'native-smoke-verification.json',
  'claim-separation.json',
  'historical-integrity.json',
  'dependency-installation.json',
  'cargo-check.log',
  'cargo-test.log',
  'npm-audit-analysis.json'
]);

function runCapture(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    encoding: 'utf8',
    env: options.env || process.env,
    maxBuffer: options.maxBuffer || 8 * 1024 * 1024,
    timeout: options.timeout || 15000
  });
  return {
    command,
    args,
    status: Number.isInteger(result.status) ? result.status : null,
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim(),
    error: result.error ? String(result.error.message || result.error) : null
  };
}

function firstLine(value) {
  return String(value || '').split('\n').find(Boolean) || null;
}

function inspectTool(name) {
  const userCargoExecutable = ['rustc', 'cargo', 'rustup'].includes(name)
    ? path.join(os.homedir(), '.cargo', 'bin', name)
    : null;
  const executable = findTool(name) || (
    userCargoExecutable && fs.existsSync(userCargoExecutable) ? userCargoExecutable : null
  );
  if (!executable) {
    return { name, available: false, path: null, version: null };
  }
  const result = runCapture(executable, TOOL_VERSION_ARGS[name] || ['--version']);
  return {
    name,
    available: true,
    path: executable,
    version: firstLine(result.stdout || result.stderr),
    versionProbeExitCode: result.status
  };
}

function inspectPkgConfigModule(name, pkgConfigPath) {
  if (!pkgConfigPath) return { name, available: false, version: null };
  const exists = runCapture(pkgConfigPath, ['--exists', name]);
  if (exists.status !== 0) return { name, available: false, version: null };
  const version = runCapture(pkgConfigPath, ['--modversion', name]);
  return {
    name,
    available: version.status === 0,
    version: version.status === 0 ? version.stdout : null
  };
}

function inspectDebianPackage(name) {
  const dpkgQuery = findTool('dpkg-query');
  if (!dpkgQuery) return { name, installed: false, version: null, status: 'DPKG_QUERY_MISSING' };
  const result = runCapture(dpkgQuery, [
    '-W',
    '-f=${Status}\t${Version}\t${Architecture}',
    name
  ]);
  if (result.status !== 0) {
    return { name, installed: false, version: null, status: 'NOT_INSTALLED' };
  }
  const [status, version, architecture] = result.stdout.split('\t');
  return {
    name,
    installed: status === 'install ok installed',
    version: version || null,
    architecture: architecture || null,
    status: status || 'UNKNOWN'
  };
}

function normalizeArchitecture(value) {
  if (value === 'x64') return 'x86_64';
  if (value === 'arm64') return 'aarch64';
  return value;
}

function inspectToolchain() {
  const tools = Object.fromEntries(
    Object.keys(TOOL_VERSION_ARGS).map((name) => [name, inspectTool(name)])
  );
  const modules = Object.fromEntries(PKG_CONFIG_MODULES.map((name) => [
    name,
    inspectPkgConfigModule(name, tools['pkg-config'].path)
  ]));
  const packages = Object.fromEntries(OFFICIAL_TAURI_LINUX_PACKAGES.map((name) => [
    name,
    inspectDebianPackage(name)
  ]));
  const runtimeLibraries = {
    gtk3: '/lib/x86_64-linux-gnu/libgtk-3.so.0',
    webkit2gtk4_0: '/lib/x86_64-linux-gnu/libwebkit2gtk-4.0.so.37',
    webkit2gtk4_1: '/lib/x86_64-linux-gnu/libwebkit2gtk-4.1.so.0'
  };
  const blockingChecks = {
    rustc: tools.rustc.available,
    cargo: tools.cargo.available,
    pkgConfig: tools['pkg-config'].available,
    gcc: tools.gcc.available,
    webkit2gtk4_1Development: modules['webkit2gtk-4.1'].available,
    gtk3Development: modules['gtk+-3.0'].available,
    opensslDevelopment: modules.openssl.available,
    buildEssential: packages['build-essential'].installed,
    appIndicatorDevelopment: packages['libayatana-appindicator3-dev'].installed,
    rsvgDevelopment: packages['librsvg2-dev'].installed,
    xdoDevelopment: packages['libxdo-dev'].installed,
    fileInspection: tools.file.available,
    elfInspection: tools.readelf.available && tools.objdump.available && tools.ldd.available
  };
  const missingRequirements = Object.entries(blockingChecks)
    .filter(([, available]) => !available)
    .map(([name]) => `${name.replace(/([a-z0-9])([A-Z])/gu, '$1_$2').toUpperCase()}_MISSING`);

  return {
    schemaVersion: SCHEMA_VERSION,
    system: 'SHEIKHA_NATIVE_DESKTOP_V4_TOOLCHAIN_INSPECTION',
    generatedAt: new Date().toISOString(),
    status: missingRequirements.length === 0 ? 'BUILD_READY' : 'TOOLCHAIN_MISSING',
    host: {
      platform: process.platform,
      architecture: normalizeArchitecture(process.arch),
      kernel: os.release(),
      displayAvailable: Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY)
    },
    tools,
    pkgConfigModules: modules,
    debianPackages: packages,
    runtimeLibraries: Object.fromEntries(Object.entries(runtimeLibraries).map(([name, filePath]) => [
      name,
      { path: filePath, available: fs.existsSync(filePath) }
    ])),
    blockingChecks,
    missingRequirements,
    requiredPackageNamesOnly: [
      'rustc',
      'cargo',
      ...OFFICIAL_TAURI_LINUX_PACKAGES
    ],
    optionalInspectedTools: ['rustup', 'clang', 'cmake', 'ninja', 'patchelf'],
    tauriPrerequisiteReference: 'https://v2.tauri.app/start/prerequisites/',
    packagesInstalledByV4: false,
    sudoUsedByV4: false
  };
}

function readJsonOptional(filePath, fallback = null) {
  try {
    return readJson(filePath);
  } catch (_) {
    return fallback;
  }
}

function gitOutput(args) {
  const result = runCapture('git', args);
  return result.status === 0 ? result.stdout : null;
}

function historicalIntegrity() {
  const tracked = HISTORICAL_PATHS.map((relativePath) => {
    const absolutePath = path.join(ROOT, relativePath);
    return {
      path: relativePath,
      exists: fs.existsSync(absolutePath),
      sha256: fs.existsSync(absolutePath) ? sha256File(absolutePath) : null
    };
  });
  const diff = runCapture('git', [
    'diff',
    '--name-only',
    '--',
    'runtime/distribution/v2',
    'runtime/distribution/v3'
  ]);
  const modifiedHistoricalFiles = diff.stdout.split('\n').filter(Boolean);
  return {
    schemaVersion: SCHEMA_VERSION,
    system: 'SHEIKHA_NATIVE_DESKTOP_V4_HISTORICAL_INTEGRITY',
    status: tracked.every((item) => item.exists) && modifiedHistoricalFiles.length === 0
      ? 'VERIFIED_UNMODIFIED'
      : 'FAILED',
    requestedStartHead: REQUESTED_START_HEAD,
    actualInspectionHead: gitOutput(['rev-parse', 'HEAD']),
    v3TagCommit: gitOutput(['rev-list', '-n', '1', 'sheikha-native-delivery-v3']),
    predecessorV31TagCommit: gitOutput(['rev-list', '-n', '1', 'sheikha-native-desktop-v3.1']),
    tracked,
    modifiedHistoricalFiles
  };
}

function verifyExistingDesktopV31() {
  const reportPath = path.join(
    ROOT,
    'runtime',
    'distribution',
    'v3.1',
    'sheikha-native-desktop-completion-v31-report.json'
  );
  const report = readJsonOptional(reportPath, {});
  const releaseIndexPath = path.join(
    os.homedir(),
    'Sheikha-Local-Registry',
    'releases',
    'v3.1',
    '1.0.51',
    'release-index.json'
  );
  const index = readJsonOptional(releaseIndexPath, {});
  const executable = Array.isArray(index.artifacts)
    ? index.artifacts.find((item) => item.artifactKind === 'ELF_NATIVE_EXECUTABLE')
    : null;
  const artifactPath = executable
    ? path.join(path.dirname(releaseIndexPath), executable.relativePath)
    : null;
  const artifactValid = Boolean(
    artifactPath &&
    fs.existsSync(artifactPath) &&
    executable.sha256 === sha256File(artifactPath)
  );
  return {
    framework: 'dynamic-gtk3-webkit2gtk-4.0',
    releaseLine: 'v3.1',
    status: report.status || 'UNKNOWN',
    verified: report.status === 'NATIVE_VERIFIED' && artifactValid,
    desktopExecutableArtifactCount: Number(report.desktopExecutableArtifactCount || 0),
    artifact: executable && artifactValid ? {
      name: executable.name,
      bytes: executable.bytes,
      sha256: executable.sha256
    } : null,
    evidence: 'runtime/distribution/v3.1/sheikha-native-desktop-completion-v31-report.json',
    countsTowardV4Tauri: false
  };
}

function claimSeparation(v4TauriNativeVerified = false) {
  const desktopV31 = verifyExistingDesktopV31();
  const bareMetalPath = path.join(
    ROOT,
    'runtime',
    'bare-metal',
    'v1',
    'sheikha-bare-metal-seed-v1-report.json'
  );
  const bareMetal = readJsonOptional(bareMetalPath, {});
  const serialPath = path.join(ROOT, 'runtime', 'bare-metal', 'v1', 'evidence', 'qemu-serial.log');
  const serialMarkerVerified = fs.existsSync(serialPath) &&
    fs.readFileSync(serialPath, 'utf8').includes('SHEIKHA_BARE_METAL_BOOT_OK');
  const deliveryV2 = readJsonOptional(path.join(
    ROOT,
    'runtime',
    'distribution',
    'v2',
    'sheikha-universal-delivery-v2-report.json'
  ), {});
  const cliTarget = Array.isArray(deliveryV2.targets)
    ? deliveryV2.targets.find((item) => item.id === 'linux-cli-x86_64')
    : null;
  const deliveryV3 = readJsonOptional(path.join(
    ROOT,
    'runtime',
    'distribution',
    'v3',
    'sheikha-native-delivery-v3-report.json'
  ), {});

  return {
    schemaVersion: SCHEMA_VERSION,
    system: 'SHEIKHA_NATIVE_CLAIM_SEPARATION_V4',
    scope: 'Claims are independent and must never be summed as desktop-native verification.',
    desktopNativeVerified: {
      existingNonTauriVerifiedCount: desktopV31.verified ? 1 : 0,
      v4TauriVerifiedCount: v4TauriNativeVerified ? 1 : 0,
      predecessor: desktopV31,
      claim: 'V3.1 is a verified Linux x86_64 desktop executable, but it is not a Tauri 2 V4 artifact.'
    },
    bareMetalNativeVerified: {
      verifiedCount: bareMetal.status === 'VERIFIED_BARE_METAL_BOOT' && serialMarkerVerified ? 1 : 0,
      status: bareMetal.status || 'UNKNOWN',
      serialMarkerVerified,
      evidence: 'runtime/bare-metal/v1/sheikha-bare-metal-seed-v1-report.json',
      claim: 'This proves the scoped UEFI/QEMU seed boot only; it is not desktop verification.'
    },
    cliNativeVerified: {
      legacyVerifiedCount: cliTarget?.nativeVerified === true ? 1 : 0,
      status: cliTarget?.status || 'UNKNOWN',
      runtimeType: cliTarget?.runtimeType || null,
      selfContainedNativeExecutable: false,
      evidence: cliTarget?.evidence || [],
      claim: 'The legacy CLI verification requires an external Node.js runtime and is not desktop verification.'
    },
    eligibilityOnlyVerification: {
      count: deliveryV3.desktopExecutableBuiltCount === 0 && deliveryV3.artifact ? 1 : 0,
      status: deliveryV3.artifact?.status || 'UNKNOWN',
      artifactKind: deliveryV3.artifact?.artifactKind || null,
      desktopExecutable: deliveryV3.artifact?.desktopExecutable === true,
      nativeVerified: deliveryV3.artifact?.nativeVerified === true,
      evidence: 'runtime/distribution/v3/sheikha-native-delivery-v3-report.json',
      claim: 'V3 source and product-core inspection is eligibility evidence only.'
    }
  };
}

function inspectBuiltArtifact(binaryPath = TAURI_BINARY) {
  if (!fs.existsSync(binaryPath)) {
    return {
      built: false,
      inspected: false,
      path: null,
      bytes: 0,
      sha256: null,
      architectureCorrect: false,
      pie: false,
      bindNow: false,
      dependenciesResolved: false,
      fileInspection: null,
      elfHeader: null,
      dynamicSection: null,
      objectInspection: null,
      dependencies: null
    };
  }
  const fileInspection = runCapture('file', [binaryPath]);
  const elfHeader = runCapture('readelf', ['-W', '-h', binaryPath]);
  const dynamicSection = runCapture('readelf', ['-W', '-d', binaryPath]);
  const objectInspection = runCapture('objdump', ['-p', binaryPath]);
  const dependencies = runCapture('ldd', [binaryPath]);
  const stat = fs.statSync(binaryPath);
  const architectureCorrect = /ELF 64-bit.*x86-64/iu.test(fileInspection.stdout) &&
    /Machine:\s+Advanced Micro Devices X86-64/iu.test(elfHeader.stdout);
  const pie = /Type:\s+DYN/iu.test(elfHeader.stdout) && /\bPIE\b/u.test(dynamicSection.stdout);
  const bindNow = /BIND_NOW|FLAGS.*NOW/iu.test(dynamicSection.stdout);
  const dependenciesResolved = dependencies.status === 0 && !/not found/iu.test(dependencies.stdout);
  const inspected = [fileInspection, elfHeader, dynamicSection, objectInspection, dependencies]
    .every((result) => result.status === 0) && architectureCorrect && dependenciesResolved;
  return {
    built: true,
    inspected,
    path: path.relative(ROOT, binaryPath),
    bytes: stat.size,
    sha256: sha256File(binaryPath),
    architectureCorrect,
    pie,
    bindNow,
    dependenciesResolved,
    fileInspection: fileInspection.stdout,
    elfHeader: elfHeader.stdout,
    dynamicSection: dynamicSection.stdout,
    objectInspection: objectInspection.stdout,
    dependencies: dependencies.stdout
  };
}

function securityVerification(artifact = inspectBuiltArtifact(), smoke = null) {
  const sourcePath = path.join(TAURI_ROOT, 'src-tauri', 'src', 'main.rs');
  const capabilityPath = path.join(
    TAURI_ROOT,
    'src-tauri',
    'capabilities',
    'main-governed.json'
  );
  const cargoManifest = fs.existsSync(TAURI_MANIFEST)
    ? fs.readFileSync(TAURI_MANIFEST, 'utf8')
    : '';
  const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';
  const capability = readJsonOptional(capabilityPath, {});
  const permissions = Array.isArray(capability.permissions) ? capability.permissions : [];
  const forbiddenPluginPattern = /tauri-plugin-(?:shell|fs|http|process|updater|opener)/u;
  const staticImplementationVerified = Boolean(
    fs.existsSync(TAURI_MANIFEST) &&
    fs.existsSync(sourcePath) &&
    fs.existsSync(capabilityPath) &&
    permissions.length === 2 &&
    permissions.includes('allow-governed-request') &&
    permissions.includes('allow-native-smoke-ready') &&
    !forbiddenPluginPattern.test(cargoManifest) &&
    !/std::process|Command::new|\bsystem\s*\(/u.test(source)
  );
  const nativeEnforcementVerified = Boolean(
    staticImplementationVerified &&
    smoke?.status === 'NATIVE_VERIFIED' &&
    smoke.v4NativeLaunchVerified === true &&
    smoke.noUnrestrictedShellAccess === true &&
    smoke.noUnrestrictedFilesystemAccess === true &&
    smoke.noUnrestrictedNetworkAccess === true
  );
  return {
    schemaVersion: SCHEMA_VERSION,
    system: 'SHEIKHA_NATIVE_DESKTOP_V4_SECURITY_VERIFICATION',
    status: !staticImplementationVerified
      ? 'SECURITY_GATE_FAILED'
      : nativeEnforcementVerified
        ? 'NATIVE_ENFORCEMENT_VERIFIED'
        : 'IMPLEMENTED_STATICALLY_VERIFIED_NATIVE_PENDING',
    implementationVerified: staticImplementationVerified,
    nativeEnforcementVerified,
    artifactBuilt: artifact.built,
    artifactInspected: artifact.inspected,
    reason: !staticImplementationVerified
      ? 'The Tauri security implementation is incomplete.'
      : nativeEnforcementVerified
        ? 'The deny-by-default Tauri ACL and fixed loopback adapter passed native launch verification.'
        : 'Tauri ACL, fixed loopback adapter, and deny-by-default source are implemented; native enforcement awaits launch evidence.',
    defaultDeny: {
      shell: true,
      arbitraryFilesystem: true,
      arbitraryNetwork: true,
      processSpawning: true,
      systemInstaller: true,
      firmware: true,
      kernel: true
    },
    allowedCapabilities: [
      'read governed application state',
      'call approved loopback API',
      'open approved local resources',
      'render chat and inspector',
      'request high-impact action through approval gate'
    ],
    invocationFlow: [
      'UI Request',
      'Schema Validation',
      'Capability Contract',
      'Governance Gate',
      'Human Approval when required',
      'Native Adapter',
      'Audit Record'
    ],
    artificialIntelligenceBoundaries: {
      automaticShellExecution: false,
      automaticPackageInstallation: false,
      automaticSystemMutation: false,
      writesOutsideApprovedPaths: false,
      humanApprovalBypass: false,
      automatedReligiousRuling: false
    },
    remoteContentAllowed: false,
    cdnAllowed: false,
    broadTauriPluginPermissionsAllowed: false,
    humanApprovalForHighImpact: true,
    existingGovernanceGate: 'desktop/security/sheikha-desktop-governance-gate-v1.js',
    existingCapabilityBridge: 'desktop/bridge/sheikha-desktop-capability-bridge-v1.js',
    tauriCapabilityManifestCreated: fs.existsSync(capabilityPath),
    tauriPermissions: permissions,
    cargoManifestPresent: Boolean(cargoManifest),
    prohibitedTauriPluginsPresent: forbiddenPluginPattern.test(cargoManifest),
    claim: 'Static policy is verified; Tauri runtime enforcement remains unverified until a real build and native launch exist.'
  };
}

function nativeSmokeVerification(predecessor, artifact = inspectBuiltArtifact()) {
  return {
    schemaVersion: SCHEMA_VERSION,
    system: 'SHEIKHA_NATIVE_DESKTOP_V4_SMOKE_VERIFICATION',
    status: artifact.built
      ? 'NOT_EXECUTED_BUILT_NOT_NATIVE_VERIFIED'
      : 'NOT_EXECUTED_TOOLCHAIN_MISSING',
    framework: 'tauri-2',
    executableLaunches: false,
    mainWindowOpens: false,
    localHealthEndpointWorks: false,
    chatViewLoads: false,
    inspectorLoads: false,
    cleanShutdown: false,
    noUnexpectedChildProcesses: false,
    noSecretExposure: false,
    noUnrestrictedFilesystemAccess: false,
    v4NativeLaunchExecuted: false,
    v4NativeLaunchVerified: false,
    predecessorV31: {
      framework: predecessor.framework,
      status: predecessor.status,
      verified: predecessor.verified,
      countsTowardV4Tauri: false
    }
  };
}

function writeFileAtomic(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, contents, 'utf8');
  fs.renameSync(temporary, filePath);
}

function writeJsonAtomic(filePath, value) {
  writeFileAtomic(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function evidenceText(status, reason, intendedCommand = null, artifactCreated = false) {
  return [
    `status=${status}`,
    `reason=${reason}`,
    intendedCommand ? `intended_command=${intendedCommand}` : null,
    `artifact_created=${artifactCreated}`,
    'claim=No V4 Tauri evidence exists without a real build and native launch.'
  ].filter(Boolean).join('\n') + '\n';
}

function readTextOptional(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return '';
  }
}

function stripTrailingWhitespace(value) {
  return String(value || '').split('\n').map((line) => line.trimEnd()).join('\n');
}

function runGovernedBuild() {
  const toolchain = inspectToolchain();
  if (toolchain.status !== 'BUILD_READY') {
    return {
      system: SYSTEM,
      status: 'TOOLCHAIN_MISSING',
      buildExecuted: false,
      missingRequirements: toolchain.missingRequirements,
      report: generateV4Inspection()
    };
  }

  const cargo = toolchain.tools.cargo.path;
  const args = [
    'build',
    '--release',
    '--locked',
    '--offline',
    '--manifest-path',
    TAURI_MANIFEST
  ];
  const startedAt = new Date().toISOString();
  const result = runCapture(cargo, args, {
    timeout: 30 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
    env: {
      ...process.env,
      CARGO_NET_OFFLINE: 'true'
    }
  });
  const finishedAt = new Date().toISOString();
  const command = [cargo, ...args].join(' ');
  const artifact = inspectBuiltArtifact();
  const succeeded =
    result.status === 0 &&
    artifact.built &&
    artifact.inspected;

  writeFileAtomic(path.join(EVIDENCE_ROOT, 'build-command.txt'), [
    `status=${succeeded ? 'BUILD_SUCCEEDED' : 'BUILD_FAILED'}`,
    `command=${command}`,
    'cargo_network_mode=OFFLINE',
    'external_publish=DENY',
    'sudo=DENY',
    `started_at=${startedAt}`,
    `finished_at=${finishedAt}`,
    `exit_code=${result.status}`,
    ''
  ].join('\n'));
  writeFileAtomic(path.join(EVIDENCE_ROOT, 'build-log.txt'), [
    `status=${succeeded ? 'BUILD_SUCCEEDED' : 'BUILD_FAILED'}`,
    `started_at=${startedAt}`,
    `finished_at=${finishedAt}`,
    `exit_code=${result.status}`,
    `error=${result.error || 'none'}`,
    '',
    '== stdout ==',
    result.stdout,
    '',
    '== stderr ==',
    result.stderr,
    ''
  ].join('\n'));

  const report = generateV4Inspection();
  return {
    system: SYSTEM,
    status: succeeded ? report.status : 'BUILD_FAILED',
    buildExecuted: true,
    buildSucceeded: succeeded,
    cargoNetworkMode: 'OFFLINE',
    externalPublishExecuted: false,
    sudoUsed: false,
    command,
    exitCode: result.status,
    artifact: artifact.built ? {
      path: artifact.path,
      bytes: artifact.bytes,
      sha256: artifact.sha256,
      inspected: artifact.inspected
    } : null,
    report
  };
}

function generateV4Inspection(options = {}) {
  const reportRoot = options.reportRoot || REPORT_ROOT;
  const evidenceRoot = path.join(reportRoot, 'evidence');
  const mainReportPath = path.join(reportRoot, 'sheikha-native-desktop-v4-report.json');
  const toolchain = inspectToolchain();
  const integrity = historicalIntegrity();
  const artifact = inspectBuiltArtifact();
  const unverifiedClaims = claimSeparation(false);
  const predecessor = unverifiedClaims.desktopNativeVerified.predecessor;
  const smokePath = path.join(evidenceRoot, 'native-smoke-verification.json');
  const priorSmoke = readJsonOptional(smokePath, null);
  const priorSmokeMatchesArtifact = Boolean(
    priorSmoke?.status === 'NATIVE_VERIFIED' &&
    artifact.built &&
    artifact.inspected &&
    priorSmoke.artifactSha256 === artifact.sha256
  );
  const smoke = priorSmokeMatchesArtifact
    ? priorSmoke
    : nativeSmokeVerification(predecessor, artifact);
  const buildReady = toolchain.status === 'BUILD_READY';
  const nativeVerified = artifact.built &&
    artifact.inspected &&
    smoke.status === 'NATIVE_VERIFIED' &&
    smoke.v4NativeLaunchVerified === true;
  const claims = claimSeparation(nativeVerified);
  const security = securityVerification(artifact, smoke);
  let status = 'TOOLCHAIN_MISSING';
  if (buildReady) status = 'BUILD_READY';
  if (artifact.built && !artifact.inspected) status = 'BUILD_FAILED';
  if (artifact.built && artifact.inspected) status = 'BUILT_NOT_NATIVE_VERIFIED';
  if (artifact.built && artifact.inspected && nativeVerified) status = 'NATIVE_VERIFIED';
  if (security.status === 'SECURITY_GATE_FAILED') status = 'SECURITY_GATE_FAILED';
  const intendedBuildCommand = '/home/sheikha/.cargo/bin/cargo build --release --locked --offline ' +
    '--manifest-path desktop/shell/tauri-v4/src-tauri/Cargo.toml';
  const installationEvidencePath = path.join(evidenceRoot, 'dependency-installation.json');
  const installationEvidence = readJsonOptional(installationEvidencePath, null);
  const cargoCheckLogPath = path.join(evidenceRoot, 'cargo-check.log');
  const cargoTestLogPath = path.join(evidenceRoot, 'cargo-test.log');
  const npmAuditPath = path.join(evidenceRoot, 'npm-audit-analysis.json');

  writeJsonAtomic(path.join(evidenceRoot, 'toolchain-report.json'), toolchain);
  writeJsonAtomic(path.join(evidenceRoot, 'historical-integrity.json'), integrity);
  writeJsonAtomic(path.join(evidenceRoot, 'claim-separation.json'), claims);
  writeJsonAtomic(path.join(evidenceRoot, 'security-verification.json'), security);
  writeJsonAtomic(path.join(evidenceRoot, 'native-smoke-verification.json'), smoke);
  writeFileAtomic(path.join(evidenceRoot, 'build-command.txt'), evidenceText(
    artifact.built ? 'BUILD_SUCCEEDED' : (buildReady ? 'BUILD_READY_NOT_EXECUTED' : 'NOT_EXECUTED_TOOLCHAIN_MISSING'),
    artifact.built
      ? 'The locked offline Cargo release build produced a real ELF artifact.'
      : buildReady
        ? 'The Tauri shell is ready for the governed build step.'
      : 'Rust/Cargo and required Tauri Linux development dependencies are incomplete.',
    intendedBuildCommand,
    artifact.built
  ));
  const buildLogPath = path.join(evidenceRoot, 'build-log.txt');
  if (!fs.existsSync(buildLogPath)) {
    writeFileAtomic(buildLogPath, evidenceText(
      buildReady ? 'BUILD_READY_NOT_EXECUTED' : 'NOT_EXECUTED_TOOLCHAIN_MISSING',
      'No Cargo release build log is available.'
    ));
  }
  if (artifact.built) {
    writeFileAtomic(
      path.join(evidenceRoot, 'artifact-sha256.txt'),
      `${artifact.sha256}  ${artifact.path}\n`
    );
    writeFileAtomic(path.join(evidenceRoot, 'elf-inspection.txt'), [
      '== file ==',
      stripTrailingWhitespace(artifact.fileInspection),
      '',
      '== readelf -h ==',
      stripTrailingWhitespace(artifact.elfHeader),
      '',
      '== readelf -d ==',
      stripTrailingWhitespace(artifact.dynamicSection),
      '',
      '== objdump -p ==',
      stripTrailingWhitespace(artifact.objectInspection),
      ''
    ].join('\n'));
    writeFileAtomic(path.join(evidenceRoot, 'dependency-inspection.txt'), [
      '== ldd ==',
      stripTrailingWhitespace(artifact.dependencies),
      '',
      `dependencies_resolved=${artifact.dependenciesResolved}`,
      ''
    ].join('\n'));
  } else {
    writeFileAtomic(path.join(evidenceRoot, 'artifact-sha256.txt'), evidenceText(
      'NOT_GENERATED',
      'No V4 Tauri artifact exists, so no SHA-256 can be claimed.'
    ));
    writeFileAtomic(path.join(evidenceRoot, 'elf-inspection.txt'), evidenceText(
      'NOT_EXECUTED',
      'file/readelf/objdump inspection requires a real V4 artifact.'
    ));
    writeFileAtomic(path.join(evidenceRoot, 'dependency-inspection.txt'), evidenceText(
      'NOT_EXECUTED',
      'ldd dependency inspection requires a real V4 artifact.'
    ));
  }
  const nativeLaunchPath = path.join(evidenceRoot, 'native-launch.log');
  if (!nativeVerified) {
    writeFileAtomic(nativeLaunchPath, evidenceText(
      artifact.built ? 'NOT_EXECUTED_BUILT_NOT_NATIVE_VERIFIED' : 'NOT_EXECUTED_TOOLCHAIN_MISSING',
      artifact.built
        ? 'The GUI launch awaits an approved native window execution.'
        : 'No V4 Tauri process or desktop window was launched.',
      null,
      artifact.built
    ));
  }
  if (!fs.existsSync(installationEvidencePath)) {
    writeJsonAtomic(installationEvidencePath, {
      schemaVersion: SCHEMA_VERSION,
      status: 'PROVENANCE_NOT_RECORDED',
      packagesInstalledByV4: false,
      sudoUsed: false
    });
  }
  if (!fs.existsSync(cargoCheckLogPath)) {
    writeFileAtomic(cargoCheckLogPath, 'status=NOT_RECORDED\n');
  }
  if (!fs.existsSync(cargoTestLogPath)) {
    writeFileAtomic(cargoTestLogPath, 'status=NOT_RECORDED\n');
  }
  if (!fs.existsSync(npmAuditPath)) {
    writeJsonAtomic(npmAuditPath, {
      schemaVersion: SCHEMA_VERSION,
      status: 'NOT_RECORDED',
      packageLockChanged: false,
      npmAuditFixForceUsed: false
    });
  }

  const artifactReport = artifact.built ? {
    path: artifact.path,
    bytes: artifact.bytes,
    sha256: artifact.sha256,
    format: 'ELF',
    architecture: 'x86_64',
    pie: artifact.pie,
    bindNow: artifact.bindNow,
    dependenciesResolved: artifact.dependenciesResolved
  } : null;
  const cargoCheckPassed = /Finished `dev` profile|status=PASSED/u.test(readTextOptional(cargoCheckLogPath));
  const cargoTestPassed = /test result: ok|status=PASSED/u.test(readTextOptional(cargoTestLogPath));

  const report = {
    schemaVersion: SCHEMA_VERSION,
    system: SYSTEM,
    generatedAt: new Date().toISOString(),
    status,
    statusReason: status === 'NATIVE_VERIFIED'
      ? 'A real Tauri ELF passed native window, service, security, and shutdown verification.'
      : status === 'BUILT_NOT_NATIVE_VERIFIED'
        ? 'A real inspected Tauri ELF exists; native window verification has not completed.'
        : buildReady
          ? 'The inspected toolchain is sufficient; a governed Tauri shell build has not started.'
          : 'The required Rust/Cargo and Tauri Linux development toolchain is incomplete.',
    scope: 'V4_TAURI_2_LINUX_X86_64_ONLY',
    platform: 'linux',
    architecture: 'x86_64',
    framework: 'tauri-2',
    requestedStartHead: REQUESTED_START_HEAD,
    actualStartHead: integrity.actualInspectionHead,
    historicalV2V3Modified: integrity.modifiedHistoricalFiles.length > 0,
    tauriShellCreated: fs.existsSync(TAURI_MANIFEST),
    cargoManifestCreated: fs.existsSync(TAURI_MANIFEST),
    desktopExecutableBuilt: artifact.built,
    desktopExecutableBuiltCount: artifact.built ? 1 : 0,
    artifactInspected: artifact.inspected,
    nativeLaunchExecuted: smoke.v4NativeLaunchExecuted === true,
    nativeLaunchVerified: nativeVerified,
    desktopNativeVerifiedCount: nativeVerified ? 1 : 0,
    unrestrictedShellAccess: false,
    unrestrictedFilesystemAccess: false,
    unrestrictedNetworkAccess: false,
    processSpawningAllowed: false,
    systemInstallerAccess: false,
    firmwareAccess: false,
    kernelAccess: false,
    humanApprovalForHighImpact: true,
    artifact: artifactReport,
    missingRequirements: toolchain.missingRequirements,
    requiredPackageNamesOnly: toolchain.requiredPackageNamesOnly,
    installationPerformed: installationEvidence?.status === 'INSTALLED_AND_VERIFIED',
    sudoUsed: installationEvidence?.sudoUsed === true,
    githubUsed: false,
    windowsArtifactsCreated: false,
    macosArtifactsCreated: false,
    armArtifactsCreated: false,
    claimSeparation: claims,
    existingNonTauriNativeDesktop: predecessor,
    security: {
      status: security.status,
      implementationVerified: security.implementationVerified,
      defaultDeny: security.defaultDeny,
      humanApprovalForHighImpact: security.humanApprovalForHighImpact
    },
    verification: {
      cargoCheck: cargoCheckPassed ? 'PASSED' : 'NOT_RECORDED',
      cargoTest: cargoTestPassed ? 'PASSED' : 'NOT_RECORDED',
      artifactInspection: artifact.inspected ? 'PASSED' : 'NOT_EXECUTED_NO_ARTIFACT',
      nativeSmoke: smoke.status
    },
    evidence: Object.fromEntries(REQUIRED_EVIDENCE_FILES.map((name) => [
      name,
      path.relative(ROOT, path.join(evidenceRoot, name))
    ])),
    claimPolicy: 'No desktop completion claim without a built executable and native launch evidence.'
  };
  writeJsonAtomic(mainReportPath, report);
  return report;
}

function verifyEvidence(reportRoot = REPORT_ROOT) {
  const evidenceRoot = path.join(reportRoot, 'evidence');
  const reportPath = path.join(reportRoot, 'sheikha-native-desktop-v4-report.json');
  const report = readJson(reportPath);
  const currentArtifact = inspectBuiltArtifact();
  const smoke = readJsonOptional(
    path.join(evidenceRoot, 'native-smoke-verification.json'),
    {}
  );
  const missingFiles = REQUIRED_EVIDENCE_FILES.filter((name) => !fs.existsSync(path.join(evidenceRoot, name)));
  const artifactClaimValid = report.desktopExecutableBuilt === true
    ? Boolean(
      report.artifact &&
      report.artifactInspected === true &&
      /^[a-f0-9]{64}$/u.test(report.artifact.sha256 || '') &&
      currentArtifact.built &&
      currentArtifact.inspected &&
      report.artifact.sha256 === currentArtifact.sha256
    )
    : report.artifact === null &&
      report.artifactInspected === false &&
      currentArtifact.built === false;
  const nativeClaimValid = report.nativeLaunchVerified === true
    ? report.desktopNativeVerifiedCount === 1 &&
      report.status === 'NATIVE_VERIFIED' &&
      smoke.status === 'NATIVE_VERIFIED' &&
      smoke.artifactSha256 === currentArtifact.sha256
    : report.desktopNativeVerifiedCount === 0 && report.status !== 'NATIVE_VERIFIED';
  const valid = missingFiles.length === 0 &&
    report.system === SYSTEM &&
    artifactClaimValid &&
    nativeClaimValid;
  return { valid, missingFiles, report };
}

function main() {
  const command = process.argv[2] || 'inspect';
  if (command === 'inspect') {
    process.stdout.write(`${JSON.stringify(generateV4Inspection(), null, 2)}\n`);
    return;
  }
  if (command === 'build') {
    const build = runGovernedBuild();
    process.stdout.write(`${JSON.stringify(build, null, 2)}\n`);
    if (build.buildSucceeded !== true) process.exitCode = 1;
    return;
  }
  if (command === 'status') {
    process.stdout.write(`${JSON.stringify(readJson(MAIN_REPORT), null, 2)}\n`);
    return;
  }
  if (command === 'verify') {
    const verification = verifyEvidence();
    process.stdout.write(`${JSON.stringify(verification, null, 2)}\n`);
    if (!verification.valid) process.exitCode = 1;
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

if (require.main === module) main();

module.exports = {
  EVIDENCE_ROOT,
  MAIN_REPORT,
  REPORT_ROOT,
  REQUIRED_EVIDENCE_FILES,
  claimSeparation,
  generateV4Inspection,
  historicalIntegrity,
  inspectBuiltArtifact,
  inspectToolchain,
  runGovernedBuild,
  securityVerification,
  verifyEvidence
};
