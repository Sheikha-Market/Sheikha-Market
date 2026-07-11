#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  DISTRIBUTION_ROOT,
  ROOT,
  createDeterministicTar,
  fileMetadata,
  findTool,
  readJson,
  resetGeneratedDir,
  run,
  sha256File,
  writeJson
} = require('../common/distribution-utils');
const { scanStageForSecrets } = require('../common/source-staging-engine');
const { writeRunnerContracts } = require('../native-runners/sheikha-native-runner-contracts-v3');
const deliveryV2 = require('./sheikha-universal-delivery-v2');

const SYSTEM = 'SHEIKHA_NATIVE_DESKTOP_AND_MULTI_ARCH_DELIVERY_V3';
const VERSION = readJson(path.join(ROOT, 'package.json')).version;
const REPORT_ROOT = path.join(ROOT, 'runtime', 'distribution', 'v3');
const EVIDENCE_ROOT = path.join(REPORT_ROOT, 'evidence');
const DECISION_PATH = path.join(
  ROOT,
  'runtime',
  'desktop-runtime',
  'v1',
  'sheikha-desktop-runtime-decision-v1.json'
);
const MAIN_REPORT = path.join(REPORT_ROOT, 'sheikha-native-delivery-v3-report.json');
const DESKTOP_REPORT = path.join(REPORT_ROOT, 'sheikha-desktop-runtime-readiness-v3.json');
const CROSS_ARCH_REPORT = path.join(REPORT_ROOT, 'sheikha-cross-architecture-eligibility-v3.json');
const RUNNER_REPORT = path.join(REPORT_ROOT, 'sheikha-native-runner-readiness-v3.json');
const INSTALLER_REPORT = path.join(REPORT_ROOT, 'sheikha-installer-verification-v3.json');
const UPGRADE_REPORT = path.join(REPORT_ROOT, 'sheikha-upgrade-rollback-v3.json');
const RELEASE_ROOT = path.join(DISTRIBUTION_ROOT, 'artifacts', 'v3', VERSION);
const LOCAL_REGISTRY_ROOT = path.join(os.homedir(), 'Sheikha-Local-Registry', 'releases', 'v3');
const V2_RELEASE_ROOT = path.join(DISTRIBUTION_ROOT, 'artifacts', 'v2', VERSION);
const V2_LOCAL_RELEASE_ROOT = path.join(
  os.homedir(),
  'Sheikha-Local-Registry',
  'releases',
  'v2',
  VERSION
);

const ALLOWED_STATES = Object.freeze([
  'DECLARED',
  'ARCHITECTURE_ELIGIBLE',
  'TOOLCHAIN_MISSING',
  'BUILD_READY',
  'BUILT',
  'INSPECTED',
  'REQUIRES_NATIVE_RUNNER',
  'NATIVE_VERIFIED',
  'SIGNING_REQUIRED',
  'NOTARIZATION_REQUIRED',
  'PUBLISHING_NOT_REQUESTED',
  'FAILED'
]);

const TOOL_NAMES = Object.freeze([
  'node', 'npm', 'tar', 'gzip', 'zip', 'unzip', 'sha256sum', 'file', 'readelf',
  'objdump', 'ldd', 'gcc', 'clang', 'cc', 'c++', 'ld', 'x86_64-linux-gnu-gcc',
  'x86_64-linux-gnu-ld', 'aarch64-linux-gnu-gcc', 'aarch64-linux-gnu-ld',
  'arm-linux-gnueabihf-gcc', 'arm-linux-gnueabihf-ld', 'rustc', 'cargo', 'cmake',
  'meson', 'ninja', 'qmake', 'electron', 'rpmbuild', 'rpm', 'snapcraft',
  'makensis', 'wix', 'candle', 'light', 'signtool', 'codesign', 'notarytool',
  'lipo', 'otool', 'qemu-system-x86_64', 'qemu-system-aarch64', 'pkg-config'
]);

function readJsonOptional(filePath, fallback = null) {
  try {
    return readJson(filePath);
  } catch (_) {
    return fallback;
  }
}

function normalizeArchitecture(architecture) {
  if (architecture === 'x64') return 'x86_64';
  if (architecture === 'arm64') return 'aarch64';
  return architecture;
}

function sourceIdentity() {
  const baselineCommit = run('git', ['rev-parse', 'HEAD']).stdout;
  const deterministicTimestamp = run('git', ['show', '-s', '--format=%cI', baselineCommit]).stdout;
  return {
    baselineCommit,
    deterministicTimestamp,
    worktreeDirty: Boolean(run('git', ['status', '--porcelain'], { allowFailure: true }).stdout),
    sourcePolicy: 'V3_WORKTREE_IMPLEMENTATION_OVER_V2_BASELINE',
    selfReferentialCommitHashEmbedded: false
  };
}

function pkgConfigInspection(name) {
  if (!findTool('pkg-config')) return { available: false, version: null };
  const result = run('pkg-config', ['--modversion', name], { allowFailure: true });
  return {
    available: result.status === 0,
    version: result.status === 0 ? result.stdout : null
  };
}

function toolOutput(command, args = []) {
  if (!findTool(command)) return null;
  const result = run(command, args, { allowFailure: true });
  return result.status === 0 ? result.stdout : null;
}

function inspectToolchain() {
  const tools = Object.fromEntries(TOOL_NAMES.map((tool) => [tool, findTool(tool)]));
  const dynamicLinkers = {
    x86_64: '/lib64/ld-linux-x86-64.so.2',
    aarch64: '/lib/aarch64-linux-gnu/ld-linux-aarch64.so.1',
    armv7: '/lib/arm-linux-gnueabihf/ld-linux-armhf.so.3'
  };
  const architectures = {
    x86_64: {
      compiler: Boolean(tools['x86_64-linux-gnu-gcc'] || tools.gcc),
      linker: Boolean(tools['x86_64-linux-gnu-ld'] || tools.ld),
      runtime: process.platform === 'linux' && normalizeArchitecture(process.arch) === 'x86_64',
      dynamicLinker: fs.existsSync(dynamicLinkers.x86_64)
    },
    aarch64: {
      compiler: Boolean(tools['aarch64-linux-gnu-gcc']),
      linker: Boolean(tools['aarch64-linux-gnu-ld']),
      runtime: process.platform === 'linux' && normalizeArchitecture(process.arch) === 'aarch64',
      dynamicLinker: fs.existsSync(dynamicLinkers.aarch64)
    },
    armv7: {
      compiler: Boolean(tools['arm-linux-gnueabihf-gcc']),
      linker: Boolean(tools['arm-linux-gnueabihf-ld']),
      runtime: process.platform === 'linux' && ['arm', 'armv7'].includes(process.arch),
      dynamicLinker: fs.existsSync(dynamicLinkers.armv7)
    }
  };
  const nodeExecutable = process.execPath;
  const nativeDependencies = deliveryV2.inspectNativeDependencies();
  return {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_MULTI_ARCH_TOOLCHAIN_INSPECTION_V3',
    status: 'INSPECTED',
    generatedAt: new Date().toISOString(),
    host: {
      platform: process.platform,
      architecture: normalizeArchitecture(process.arch),
      release: os.release(),
      node: process.version,
      nodeModuleAbi: process.versions.modules,
      nodeApi: process.versions.napi
    },
    tools,
    availableTools: Object.entries(tools).filter(([, value]) => Boolean(value)).map(([name]) => name),
    missingTools: Object.entries(tools).filter(([, value]) => !value).map(([name]) => name),
    pkgConfig: {
      gtk4: pkgConfigInspection('gtk4'),
      webkit2gtk4_1: pkgConfigInspection('webkit2gtk-4.1'),
      webkit2gtk4_0: pkgConfigInspection('webkit2gtk-4.0'),
      glib2: pkgConfigInspection('glib-2.0'),
      gio2: pkgConfigInspection('gio-2.0'),
      openssl: pkgConfigInspection('openssl')
    },
    compiler: {
      target: toolOutput('gcc', ['-dumpmachine']),
      version: toolOutput('gcc', ['--version'])?.split('\n')[0] || null,
      multilib: toolOutput('gcc', ['-print-multi-lib'])?.split('\n').filter(Boolean) || []
    },
    linker: {
      version: toolOutput('ld', ['--version'])?.split('\n')[0] || null
    },
    libc: {
      versionLine: toolOutput('ldd', ['--version'])?.split('\n')[0] || null
    },
    nodeExecutable: {
      path: nodeExecutable,
      fileInspection: toolOutput('file', [nodeExecutable]),
      elfHeader: toolOutput('readelf', ['-h', nodeExecutable]),
      dependencies: toolOutput('ldd', [nodeExecutable])
    },
    dynamicLinkers: Object.fromEntries(Object.entries(dynamicLinkers).map(([architecture, filePath]) => [architecture, {
      path: filePath,
      available: fs.existsSync(filePath)
    }])),
    architectures,
    nativeDependencies,
    packaging: {
      rpm: tools.rpmbuild ? 'BUILD_READY' : 'TOOLCHAIN_MISSING',
      snap: tools.snapcraft ? 'BUILD_READY' : 'TOOLCHAIN_MISSING'
    },
    constraints: {
      sudoUsed: false,
      packagesInstalled: false,
      signingCredentialsLoaded: false,
      externalPublishingRequested: false,
      githubRequired: false
    }
  };
}

function inspectDesktopShell() {
  const tracked = run('git', ['ls-files'], { allowFailure: true }).stdout.split('\n').filter(Boolean);
  const packageFiles = tracked.filter((file) => file.endsWith('package.json') &&
    !file.startsWith('distribution/verification/') && !file.startsWith('distribution/common/staging/'));
  const dependencyEvidence = [];
  const frameworkPackages = new Set([
    'electron', '@tauri-apps/api', '@tauri-apps/cli', 'node-gtk', 'webkit2gtk', 'webview'
  ]);
  for (const relativePath of packageFiles) {
    const manifest = readJsonOptional(path.join(ROOT, relativePath), {});
    const dependencies = {
      ...(manifest.dependencies || {}),
      ...(manifest.devDependencies || {}),
      ...(manifest.optionalDependencies || {})
    };
    for (const name of Object.keys(dependencies)) {
      if (frameworkPackages.has(name)) dependencyEvidence.push({ relativePath, dependency: name });
    }
  }
  const configEvidence = tracked.filter((file) =>
    /(?:^|\/)(?:src-tauri\/tauri\.conf\.json|tauri\.conf\.json|Cargo\.toml|[^/]+\.pro|[^/]+\.qml)$/u.test(file)
  );
  const sourceEvidence = tracked.filter((file) =>
    /(?:desktop|shell|native-webview)/iu.test(file) &&
    /\.(?:c|cc|cpp|h|hpp|rs|m|mm|swift)$/u.test(file)
  );
  const found = dependencyEvidence.length > 0 || configEvidence.length > 0 || sourceEvidence.length > 0;
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_DESKTOP_RUNTIME_DISCOVERY_V1',
    status: found ? 'DESKTOP_RUNTIME_EVIDENCE_FOUND_REVIEW_REQUIRED' : 'NO_EXECUTABLE_DESKTOP_RUNTIME_FOUND',
    trackedFileCount: tracked.length,
    packageManifestCount: packageFiles.length,
    dependencyEvidence,
    configEvidence,
    sourceEvidence,
    electronImplemented: dependencyEvidence.some((item) => item.dependency === 'electron'),
    tauriImplemented: dependencyEvidence.some((item) => item.dependency.startsWith('@tauri-apps/')) ||
      configEvidence.some((file) => file.includes('tauri')),
    qtImplemented: configEvidence.some((file) => /\.(?:pro|qml)$/u.test(file)),
    gtkImplemented: dependencyEvidence.some((item) => item.dependency === 'node-gtk'),
    nativeWebViewImplemented: dependencyEvidence.some((item) => ['webkit2gtk', 'webview'].includes(item.dependency)),
    executableDesktopRuntimeFound: found,
    documentationMentionsCountedAsImplementation: false
  };
}

function createDesktopDecision(toolchain, discovery) {
  const commonUnmeasured = {
    localArtifactBytes: null,
    localPeakMemoryBytes: null,
    localColdStartMilliseconds: null,
    measuredLocally: false
  };
  const candidates = [
    {
      id: 'TAURI_2',
      rank: 1,
      runtimeBundling: 'Uses the operating system webview with a Rust native core.',
      nodeRequiredAtRuntime: false,
      supportedTargets: ['Windows x64/arm64', 'Linux x86_64/aarch64/armv7 subject to dependencies', 'macOS x86_64/arm64'],
      capabilitySecurityModel: 'Granular capabilities constrain frontend access to native commands.',
      updateAndSigning: 'Platform-specific signing and updater evidence remain mandatory.',
      localBuildReady: Boolean(
        toolchain.tools.rustc && toolchain.tools.cargo &&
        toolchain.pkgConfig.webkit2gtk4_1.available && toolchain.pkgConfig.gtk4.available
      ),
      localBlockers: ['rustc', 'cargo', 'webkit2gtk-4.1', 'gtk4'].filter((name) => {
        if (name === 'rustc' || name === 'cargo') return !toolchain.tools[name];
        if (name === 'webkit2gtk-4.1') return !toolchain.pkgConfig.webkit2gtk4_1.available;
        return !toolchain.pkgConfig.gtk4.available;
      }),
      officialEvidence: [
        'https://v2.tauri.app/start/',
        'https://v2.tauri.app/security/capabilities/',
        'https://v2.tauri.app/start/prerequisites/'
      ],
      ...commonUnmeasured
    },
    {
      id: 'ELECTRON',
      rank: 2,
      runtimeBundling: 'Bundles Chromium and Node.js into the desktop runtime.',
      nodeRequiredAtRuntime: true,
      supportedTargets: ['Windows', 'Linux', 'macOS', 'x64', 'ia32', 'arm64', 'arm where supported'],
      capabilitySecurityModel: 'Requires strict main/preload/renderer isolation and narrow IPC.',
      updateAndSigning: 'Mature packaging ecosystem; native signing remains platform-specific.',
      localBuildReady: false,
      localBlockers: ['electron dependency absent', 'desktop main process absent'],
      officialEvidence: [
        'https://www.electronjs.org/docs/latest/',
        'https://www.electronjs.org/docs/latest/tutorial/process-model',
        'https://www.electronjs.org/docs/latest/tutorial/installation'
      ],
      ...commonUnmeasured
    },
    {
      id: 'QT_6',
      rank: 3,
      runtimeBundling: 'Native C++ application and Qt runtime/plugins with platform-specific deployment.',
      nodeRequiredAtRuntime: false,
      supportedTargets: ['Windows', 'Linux', 'macOS with platform-specific architecture support'],
      capabilitySecurityModel: 'Native surface must be explicitly designed and sandboxed.',
      updateAndSigning: 'Deployment, plugins, licensing, and signing require platform review.',
      localBuildReady: false,
      localBlockers: ['qmake absent', 'Qt project absent'],
      officialEvidence: [
        'https://doc.qt.io/qt-6/supported-platforms.html',
        'https://doc.qt.io/qt-6/deployment.html'
      ],
      ...commonUnmeasured
    },
    {
      id: 'GTK_4',
      rank: 4,
      runtimeBundling: 'Native GTK application with platform port and packaging work.',
      nodeRequiredAtRuntime: false,
      supportedTargets: ['Linux primary', 'Windows backend', 'macOS port'],
      capabilitySecurityModel: 'Native surface and WebView bridge would require project-specific controls.',
      updateAndSigning: 'No unified cross-platform application packaging is provided by GTK itself.',
      localBuildReady: toolchain.pkgConfig.gtk4.available,
      localBlockers: toolchain.pkgConfig.gtk4.available ? ['desktop source absent'] : ['gtk4 development absent'],
      officialEvidence: [
        'https://docs.gtk.org/gtk4/',
        'https://docs.gtk.org/gtk4/getting_started.html',
        'https://docs.gtk.org/gtk4/windows.html',
        'https://docs.gtk.org/gtk4/osx.html'
      ],
      ...commonUnmeasured
    },
    {
      id: 'CUSTOM_NATIVE_WEBVIEW',
      rank: 5,
      runtimeBundling: 'Uses each platform WebView through custom native bindings.',
      nodeRequiredAtRuntime: false,
      supportedTargets: ['Possible per platform; no shared implementation exists in the repository'],
      capabilitySecurityModel: 'Highest project-owned bridge and lifecycle security burden.',
      updateAndSigning: 'All packaging, updating, signing, and lifecycle behavior must be implemented.',
      localBuildReady: false,
      localBlockers: ['native shell source absent', 'platform bridges absent'],
      officialEvidence: [],
      ...commonUnmeasured
    }
  ];
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_DESKTOP_RUNTIME_ARCHITECTURE_DECISION_V1',
    status: 'DECISION_COMPLETE_PRODUCT_CORE_IMPLEMENTED_NATIVE_SHELL_TOOLCHAIN_MISSING',
    generatedAt: new Date().toISOString(),
    repositoryDiscovery: discovery,
    selection: {
      selectedCandidate: 'TAURI_2',
      selectionType: 'ARCHITECTURE_CANDIDATE_NOT_INSTALLED',
      reason: 'The current product is web-oriented, does not require Node in a native shell, and needs a narrow capability model. Tauri aligns best, but local prerequisites are absent.',
      desktopExecutableBuilt: false,
      dependencyAdded: false,
      frameworkInstalled: false
    },
    measurementPolicy: {
      localArtifactSizeMeasuredOnlyAfterBuild: true,
      localMemoryMeasuredOnlyAfterNativeLaunch: true,
      localStartupMeasuredOnlyAfterNativeLaunch: true,
      vendorClaimsAreNotLocalMeasurements: true
    },
    candidates,
    boundaries: {
      noFakeExe: true,
      noFakeDmg: true,
      noArmArtifactByRenaming: true,
      noSigningClaimWithoutEvidence: true,
      noNotarizationClaimWithoutEvidence: true,
      humanFinalDecision: true,
      aiIsAdvisoryOnly: true
    }
  };
}

function baselineV2Integrity() {
  const reportPath = path.join(ROOT, 'runtime', 'distribution', 'v2', 'sheikha-universal-delivery-v2-report.json');
  const indexPath = path.join(V2_RELEASE_ROOT, 'release-index.json');
  const localIndexPath = path.join(V2_LOCAL_RELEASE_ROOT, 'release-index.json');
  const index = readJsonOptional(indexPath, { artifacts: [] });
  const localIndex = readJsonOptional(localIndexPath, null);
  const workspaceArtifacts = (index.artifacts || []).map((artifact) => {
    const artifactPath = path.join(V2_RELEASE_ROOT, artifact.relativePath);
    return {
      name: artifact.name,
      expectedSha256: artifact.sha256,
      actualSha256: fs.existsSync(artifactPath) ? sha256File(artifactPath) : null,
      valid: fs.existsSync(artifactPath) && sha256File(artifactPath) === artifact.sha256
    };
  });
  const v2ModifiedPaths = run('git', [
    'diff', '--name-only', '--',
    'runtime/distribution/v2',
    'distribution/manifest/sheikha-target-matrix-v2.json',
    'distribution/manifest/sheikha-products-v2.json'
  ], { allowFailure: true }).stdout.split('\n').filter(Boolean);
  const workspaceArtifactSet = (index.artifacts || [])
    .map((item) => `${item.name}:${item.sha256}`)
    .sort();
  const localArtifactSet = (localIndex?.artifacts || [])
    .map((item) => `${item.name}:${item.sha256}`)
    .sort();
  return {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_V2_IMMUTABLE_BASELINE_LINK_V3',
    status: workspaceArtifacts.every((item) => item.valid) && v2ModifiedPaths.length === 0
      ? 'V2_BASELINE_VERIFIED_UNMODIFIED'
      : 'FAILED',
    version: VERSION,
    report: fs.existsSync(reportPath) ? { path: path.relative(ROOT, reportPath), sha256: sha256File(reportPath) } : null,
    workspaceReleaseIndex: fs.existsSync(indexPath) ? { path: path.relative(ROOT, indexPath), sha256: sha256File(indexPath) } : null,
    localReleaseIndex: fs.existsSync(localIndexPath) ? { sha256: sha256File(localIndexPath) } : null,
    workspaceAndLocalIndexMatch: Boolean(localIndex && sha256File(indexPath) === sha256File(localIndexPath)),
    workspaceAndLocalArtifactSetMatch: Boolean(localIndex &&
      JSON.stringify(workspaceArtifactSet) === JSON.stringify(localArtifactSet)),
    localPublicationMetadataDifferenceExpected: true,
    artifactCount: workspaceArtifacts.length,
    workspaceArtifacts,
    v2ModifiedPaths,
    historicalFilesModifiedByV3: false
  };
}

function productBaselineEvidence(product, baselineReport) {
  const targets = (baselineReport.targets || []).filter((item) => item.product === product && item.built);
  const auxiliary = (baselineReport.auxiliaryProducts || []).filter((item) => item.product === product && item.built);
  return [...targets, ...auxiliary];
}

function crossArchitectureEligibility(toolchain) {
  const baselineReport = readJson(path.join(ROOT, 'runtime', 'distribution', 'v2', 'sheikha-universal-delivery-v2-report.json'));
  const architectures = ['x86_64', 'aarch64', 'armv7'];
  const products = [
    { id: 'sheikha-cli', sourcePortable: true, dependenciesPortable: true, nativeModulesDetected: false },
    {
      id: 'sheikha-server-runtime',
      sourcePortable: true,
      dependenciesPortable: toolchain.nativeDependencies.productionTopLevelNativeAddons.length === 0,
      nativeModulesDetected: toolchain.nativeDependencies.productionTopLevelNativeAddons.length > 0
    },
    { id: 'sheikha-vscode-extension', sourcePortable: true, dependenciesPortable: true, nativeModulesDetected: false },
    { id: 'sheikha-bare-metal-seed', sourcePortable: null, dependenciesPortable: null, nativeModulesDetected: true },
    { id: 'sheikha-desktop', sourcePortable: true, dependenciesPortable: false, nativeModulesDetected: false }
  ];
  const entries = [];
  for (const product of products) {
    for (const architecture of architectures) {
      const environment = toolchain.architectures[architecture];
      const baseline = architecture === 'x86_64' ? productBaselineEvidence(product.id, baselineReport) : [];
      const bareMetal = product.id === 'sheikha-bare-metal-seed';
      const desktop = product.id === 'sheikha-desktop';
      const sourcePortable = bareMetal ? architecture === 'x86_64' : product.sourcePortable;
      const dependenciesPortable = bareMetal ? architecture === 'x86_64' : product.dependenciesPortable;
      const artifactBuilt = baseline.length > 0;
      const architectureInspected = baseline.some((item) => item.inspected === true || item.qemuVerified === true || item.verified === true);
      const nativeTested = baseline.some((item) => item.nativeVerified === true);
      const runtimeAvailable = bareMetal
        ? architecture === 'x86_64' && baseline.some((item) => item.qemuVerified === true)
        : desktop
          ? false
          : environment.runtime;
      const blockers = [];
      if (!sourcePortable) blockers.push('SOURCE_NOT_PORTED_TO_ARCHITECTURE');
      if (!dependenciesPortable) blockers.push('DEPENDENCY_PORTABILITY_NOT_VERIFIED');
      if (!environment.compiler && (bareMetal || desktop)) blockers.push('ARCHITECTURE_COMPILER_MISSING');
      if (!environment.linker && (bareMetal || desktop)) blockers.push('ARCHITECTURE_LINKER_MISSING');
      if (!runtimeAvailable) blockers.push('ARCHITECTURE_RUNTIME_OR_NATIVE_RUNNER_MISSING');
      if (!artifactBuilt) blockers.push('ARCHITECTURE_ARTIFACT_NOT_BUILT');
      if (!architectureInspected) blockers.push('ARCHITECTURE_NOT_INSPECTED');
      if (!nativeTested) blockers.push('NATIVE_TEST_NOT_EXECUTED');
      if (desktop) blockers.push('NATIVE_DESKTOP_SHELL_NOT_IMPLEMENTED');

      let status = 'REQUIRES_NATIVE_RUNNER';
      if (nativeTested) status = 'NATIVE_VERIFIED';
      else if (artifactBuilt && architectureInspected) status = 'INSPECTED';
      else if (desktop) status = 'TOOLCHAIN_MISSING';
      else if ((bareMetal || desktop) && (!environment.compiler || !environment.linker)) status = 'TOOLCHAIN_MISSING';
      else if (sourcePortable && dependenciesPortable && runtimeAvailable) status = 'ARCHITECTURE_ELIGIBLE';
      if (!ALLOWED_STATES.includes(status)) throw new Error(`Invalid V3 status: ${status}`);

      entries.push({
        id: `${product.id}-${architecture}`,
        product: product.id,
        architecture,
        status,
        sourcePortable,
        dependenciesPortable,
        nativeModulesDetected: product.nativeModulesDetected,
        compilerAvailable: environment.compiler,
        linkerAvailable: environment.linker,
        runtimeAvailable,
        dynamicLinkerAvailable: environment.dynamicLinker,
        artifactBuilt,
        architectureInspected,
        nativeTested,
        desktopExecutableBuilt: false,
        artifactEvidence: baseline.map((item) => item.artifact || null).filter(Boolean),
        blockers
      });
    }
  }
  return {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_CROSS_ARCHITECTURE_ELIGIBILITY_V3',
    status: 'INSPECTED',
    generatedAt: new Date().toISOString(),
    architectureCount: architectures.length,
    productCount: products.length,
    eligibilityRecordCount: entries.length,
    statusCounts: countStatuses(entries),
    policy: {
      renamedArtifactIsBuild: false,
      sourceEligibilityIsNativeVerification: false,
      qemuIsPhysicalHardwareVerification: false,
      externalNodeRuntimeIsDeclared: true
    },
    entries
  };
}

function runnerReadiness(toolchain, contracts) {
  const runners = contracts.map((entry) => {
    const hostMatches = process.platform === entry.platform &&
      normalizeArchitecture(process.arch) === entry.architecture;
    const architectureToolchain = entry.platform === 'linux'
      ? toolchain.architectures[entry.architecture]
      : null;
    let status = 'REQUIRES_NATIVE_RUNNER';
    if (entry.platform === 'linux' && entry.architecture !== 'x86_64') status = 'TOOLCHAIN_MISSING';
    if (hostMatches && architectureToolchain?.compiler && architectureToolchain?.linker) status = 'BUILD_READY';
    return {
      id: entry.contract.system,
      platform: entry.platform,
      architecture: entry.architecture,
      status,
      contract: path.relative(ROOT, entry.filePath),
      contractDefined: true,
      nativeRunnerDetected: hostMatches,
      compilerAvailable: architectureToolchain?.compiler ?? null,
      linkerAvailable: architectureToolchain?.linker ?? null,
      nativeDesktopShellAvailable: false,
      signingAvailable: false,
      notarizationAvailable: false,
      blockers: status === 'BUILD_READY'
        ? ['NATIVE_DESKTOP_SHELL_NOT_IMPLEMENTED']
        : [status === 'TOOLCHAIN_MISSING' ? 'TARGET_TOOLCHAIN_MISSING' : 'NATIVE_RUNNER_REQUIRED']
    };
  });
  return {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_NATIVE_RUNNER_READINESS_V3',
    status: 'CONTRACTS_ACTIVE_RUNNERS_PARTIAL',
    generatedAt: new Date().toISOString(),
    runnerCount: runners.length,
    contractCount: contracts.length,
    statusCounts: countStatuses(runners),
    runners
  };
}

function installerVerification(toolchain) {
  return {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_INSTALLER_VERIFICATION_V3',
    status: 'INSPECTED_WITH_NATIVE_RUNNER_BOUNDARIES',
    generatedAt: new Date().toISOString(),
    desktopExecutableBuilt: false,
    windows: {
      status: 'REQUIRES_NATIVE_RUNNER',
      sharedAdapter: 'desktop/installer-contracts/sheikha-desktop-installer-adapter-v1.js',
      profiles: {
        user: { scope: 'current-user', administratorRequired: false, artifactBuilt: false },
        system: { scope: 'machine-wide', administratorRequired: true, artifactBuilt: false }
      },
      exeBuilt: false,
      nativeTested: false,
      signed: false
    },
    linux: {
      nativeHostArchitecture: normalizeArchitecture(process.arch),
      rpm: { status: toolchain.packaging.rpm, artifactBuilt: false, published: false },
      snap: { status: toolchain.packaging.snap, artifactBuilt: false, published: false },
      packagesInstalledByV3: false
    },
    macos: {
      status: 'REQUIRES_NATIVE_RUNNER',
      dmgBuilt: false,
      universal2: false,
      machoX86_64SliceVerified: false,
      machoArm64SliceVerified: false,
      signed: false,
      notarized: false,
      stapled: false
    },
    boundaries: {
      fakeExeCreated: false,
      fakeDmgCreated: false,
      fakeArmArtifactCreated: false,
      signingPerformed: false,
      notarizationPerformed: false,
      externalPublishingPerformed: false
    }
  };
}

function countStatuses(items) {
  return items.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
}

function buildProductCoreRelease(source, baseline) {
  if (fs.existsSync(RELEASE_ROOT)) {
    throw new Error(`V3 workspace release already exists and will not be overwritten: ${RELEASE_ROOT}`);
  }
  const stageRoot = resetGeneratedDir(path.join(DISTRIBUTION_ROOT, 'staging', 'v3', VERSION));
  const verificationRoot = resetGeneratedDir(path.join(DISTRIBUTION_ROOT, 'verification', 'v3', VERSION));
  const packageRootName = `sheikha-desktop-product-core-${VERSION}`;
  const packageRoot = path.join(stageRoot, packageRootName);
  fs.cpSync(path.join(ROOT, 'desktop'), packageRoot, { recursive: true, dereference: false });
  const contractRoot = path.join(packageRoot, 'native-runner-contracts');
  fs.mkdirSync(contractRoot, { recursive: true });
  for (const platform of ['windows', 'linux', 'macos']) {
    const sourceRoot = path.join(DISTRIBUTION_ROOT, 'native-runners', platform);
    const targetRoot = path.join(contractRoot, platform);
    fs.mkdirSync(targetRoot, { recursive: true });
    for (const name of fs.readdirSync(sourceRoot).filter((item) => item.endsWith('.json'))) {
      fs.copyFileSync(path.join(sourceRoot, name), path.join(targetRoot, name));
    }
  }
  writeJson(path.join(packageRoot, 'BUILD-CLAIMS.json'), {
    schemaVersion: '3.0.0',
    product: 'sheikha-desktop-product-core',
    version: VERSION,
    artifactKind: 'PLATFORM_NEUTRAL_SOURCE_ARCHIVE',
    desktopExecutableIncluded: false,
    nativeShellIncluded: false,
    windowsExeIncluded: false,
    macosDmgIncluded: false,
    armBinaryIncluded: false,
    externalNodeRuntimeRequired: true
  });

  const artifactDir = path.join(RELEASE_ROOT, 'artifacts');
  fs.mkdirSync(artifactDir, { recursive: true });
  const artifactName = `sheikha-desktop-product-core-${VERSION}-v3.tar.gz`;
  const artifactPath = path.join(artifactDir, artifactName);
  createDeterministicTar(stageRoot, packageRootName, artifactPath);

  run('tar', ['-xzf', artifactPath, '-C', verificationRoot]);
  const extractedRoot = path.join(verificationRoot, packageRootName);
  const smokeScript = [
    `const api=require(${JSON.stringify(extractedRoot)});`,
    "const adapters=api.createReadOnlyStatusAdapters({runtimeStatus:()=>({healthy:true}),releaseStatus:()=>({version:'1.0.51'})});",
    'const bridge=api.createCapabilityBridge({adapters});',
    'const core=api.createDesktopProductCore({bridge});',
    "core.dispatch({requestId:'v3-smoke',requestedAt:'2026-01-01T00:00:00.000Z',capability:'runtime.status.read',actor:{id:'native-v3-smoke'},payload:{}},{grantedCapabilities:['runtime.status.read']}).then((result)=>{if(!result.ok||result.output.healthy!==true||!result.evidence.evidenceSha256)process.exit(2);process.stdout.write('SHEIKHA_DESKTOP_PRODUCT_CORE_SMOKE_OK');});"
  ].join('');
  const smoke = run(process.execPath, ['-e', smokeScript], { cwd: verificationRoot });
  const archiveList = run('tar', ['-tzf', artifactPath]).stdout.split('\n').filter(Boolean);
  const artifact = {
    id: 'desktop-product-core-neutral-v3',
    product: 'sheikha-desktop-product-core',
    version: VERSION,
    status: 'INSPECTED',
    artifactKind: 'PLATFORM_NEUTRAL_SOURCE_ARCHIVE',
    architecture: 'neutral-source',
    desktopExecutable: false,
    nativeVerified: false,
    externalNodeRuntimeRequired: true,
    ...fileMetadata(artifactPath)
  };
  const verification = {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_DESKTOP_PRODUCT_CORE_ARTIFACT_VERIFICATION_V3',
    status: 'INSPECTED',
    artifact: { name: artifactName, bytes: artifact.bytes, sha256: artifact.sha256 },
    archiveFormat: 'tar.gz',
    archiveEntryCount: archiveList.length,
    archiveRootValid: archiveList.every((entry) => entry === packageRootName || entry.startsWith(`${packageRootName}/`)),
    extractedPackageJsonValid: readJson(path.join(extractedRoot, 'package.json')).name === '@sheikha/desktop-product-core',
    productCoreSmokePassed: smoke.stdout === 'SHEIKHA_DESKTOP_PRODUCT_CORE_SMOKE_OK',
    nativeDesktopLaunchTested: false,
    marker: smoke.stdout
  };
  if (!verification.archiveRootValid || !verification.extractedPackageJsonValid || !verification.productCoreSmokePassed) {
    throw new Error('Desktop Product Core archive verification failed.');
  }

  for (const directory of [
    'metadata', 'sbom', 'provenance', 'verification', 'native-evidence',
    'signing-evidence', 'compatibility', 'upgrade'
  ]) fs.mkdirSync(path.join(RELEASE_ROOT, directory), { recursive: true });

  writeJson(path.join(RELEASE_ROOT, 'verification', `${artifactName}.verification.json`), verification);
  writeJson(path.join(RELEASE_ROOT, 'metadata', `${artifactName}.manifest.json`), {
    schemaVersion: '3.0.0',
    system: SYSTEM,
    artifact,
    desktopExecutable: false,
    nativeShell: false,
    localRegistryOnly: true,
    githubRequired: false
  });
  writeJson(path.join(RELEASE_ROOT, 'sbom', `${artifactName}.cdx.json`), {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    version: 1,
    metadata: {
      timestamp: source.deterministicTimestamp,
      component: {
        type: 'library',
        name: '@sheikha/desktop-product-core',
        version: VERSION,
        hashes: [{ alg: 'SHA-256', content: artifact.sha256 }]
      }
    },
    components: []
  });
  writeJson(path.join(RELEASE_ROOT, 'provenance', `${artifactName}.provenance.json`), {
    _type: 'https://in-toto.io/Statement/v1',
    subject: [{ name: artifactName, digest: { sha256: artifact.sha256 } }],
    predicateType: 'https://slsa.dev/provenance/v1',
    predicate: {
      buildDefinition: {
        buildType: 'https://sheikha.local/build-types/native-delivery-v3-product-core',
        externalParameters: { version: VERSION, artifactKind: artifact.artifactKind },
        internalParameters: { baselineCommit: source.baselineCommit, worktreeDirty: source.worktreeDirty },
        resolvedDependencies: [{
          uri: `local-registry://releases/v2/${VERSION}`,
          digest: { sha256: baseline.localReleaseIndex?.sha256 || baseline.workspaceReleaseIndex?.sha256 || 'UNAVAILABLE' }
        }]
      },
      runDetails: {
        builder: { id: SYSTEM },
        metadata: { startedOn: source.deterministicTimestamp, finishedOn: source.deterministicTimestamp }
      }
    }
  });
  writeJson(path.join(RELEASE_ROOT, 'native-evidence', 'linux-x86_64-product-core-smoke-v3.json'), {
    schemaVersion: '3.0.0',
    status: 'INSPECTED',
    hostPlatform: process.platform,
    hostArchitecture: normalizeArchitecture(process.arch),
    nodeArchitecture: normalizeArchitecture(process.arch),
    productCoreSmokePassed: true,
    desktopNativeShellTested: false,
    nativeDesktopVerified: false,
    marker: smoke.stdout
  });
  writeJson(path.join(RELEASE_ROOT, 'signing-evidence', 'signing-boundary-v3.json'), {
    schemaVersion: '3.0.0',
    status: 'PUBLISHING_NOT_REQUESTED',
    signingPerformed: false,
    notarizationPerformed: false,
    credentialsLoaded: false,
    productCoreArchiveRequiresPublicPlatformSigning: false,
    futureWindowsDesktopRequiresAuthenticode: true,
    futureMacosDesktopRequiresCodesignAndNotarization: true
  });
  writeJson(path.join(RELEASE_ROOT, 'compatibility', 'compatibility-index.json'), {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_V3_COMPATIBILITY_INDEX',
    version: VERSION,
    baselineV2: VERSION,
    compatibility: 'ADDITIVE_PRODUCT_CORE_AND_NATIVE_EVIDENCE',
    replacesV2Artifacts: false,
    modifiesV2Reports: false,
    supportedHostForVerifiedSmoke: { platform: process.platform, architecture: normalizeArchitecture(process.arch) },
    unverifiedNativeHosts: ['windows-x64', 'windows-arm64', 'macos-x86_64', 'macos-arm64', 'linux-aarch64', 'linux-armv7']
  });
  writeJson(path.join(RELEASE_ROOT, 'upgrade', 'upgrade-matrix.json'), {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_V3_UPGRADE_MATRIX',
    from: { releaseLine: 'v2', version: VERSION },
    to: { releaseLine: 'v3', version: VERSION },
    operation: 'ADD_PRODUCT_CORE_AND_NATIVE_DELIVERY_EVIDENCE',
    binaryReplacement: false,
    installExecuted: false,
    upgradeExecuted: false,
    rollbackExecuted: false,
    rollbackTarget: `local-registry://releases/v2/${VERSION}`,
    humanApprovalRequired: true
  });

  const v2Index = readJson(path.join(V2_RELEASE_ROOT, 'release-index.json'));
  const inventory = {
    artifactId: artifact.id,
    product: artifact.product,
    productVersion: VERSION,
    status: artifact.status,
    name: artifactName,
    relativePath: `artifacts/${artifactName}`,
    bytes: artifact.bytes,
    sha256: artifact.sha256,
    artifactKind: artifact.artifactKind,
    architecture: artifact.architecture,
    desktopExecutable: false,
    nativeVerified: false,
    publicationState: 'NOT_PUBLISHED',
    verification: `verification/${artifactName}.verification.json`,
    sbom: `sbom/${artifactName}.cdx.json`,
    provenance: `provenance/${artifactName}.provenance.json`,
    metadata: `metadata/${artifactName}.manifest.json`
  };
  writeJson(path.join(RELEASE_ROOT, 'release-index.json'), {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_LOCAL_RELEASE_INDEX_V3',
    version: VERSION,
    releaseLine: 'v3',
    sourceBaselineCommit: source.baselineCommit,
    artifactCount: 1,
    inheritedArtifactCount: v2Index.artifactCount,
    localRegistryOnly: true,
    githubRequired: false,
    externalPublishingRequested: false,
    immutableRelease: true,
    desktopExecutableArtifactCount: 0,
    artifacts: [inventory],
    baseline: {
      releaseLine: 'v2',
      version: VERSION,
      releaseIndexSha256: baseline.localReleaseIndex?.sha256 || baseline.workspaceReleaseIndex.sha256,
      workspaceReleaseIndexSha256: baseline.workspaceReleaseIndex.sha256,
      artifacts: v2Index.artifacts.map((item) => ({
        artifactId: item.artifactId,
        name: item.name,
        bytes: item.bytes,
        sha256: item.sha256
      }))
    }
  });
  writeJson(path.join(RELEASE_ROOT, 'rollback-manifest.json'), {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_LOCAL_RELEASE_ROLLBACK_MANIFEST_V3',
    version: VERSION,
    immutableRelease: true,
    silentOverwriteAllowed: false,
    rollbackRequiresHumanApproval: true,
    previousRelease: `local-registry://releases/v2/${VERSION}`,
    previousReleaseIndexSha256: baseline.localReleaseIndex?.sha256 || baseline.workspaceReleaseIndex.sha256,
    productCoreRemovalDoesNotDeleteUserData: true,
    restoreChecksumsFrom: 'SHA256SUMS'
  });
  fs.writeFileSync(path.join(RELEASE_ROOT, 'SHA256SUMS'), `${artifact.sha256}  artifacts/${artifactName}\n`, 'utf8');
  const manifestFiles = [
    `artifacts/${artifactName}`,
    `metadata/${artifactName}.manifest.json`,
    `sbom/${artifactName}.cdx.json`,
    `provenance/${artifactName}.provenance.json`,
    `verification/${artifactName}.verification.json`,
    'native-evidence/linux-x86_64-product-core-smoke-v3.json',
    'signing-evidence/signing-boundary-v3.json',
    'compatibility/compatibility-index.json',
    'upgrade/upgrade-matrix.json',
    'release-index.json',
    'rollback-manifest.json',
    'SHA256SUMS'
  ];
  fs.writeFileSync(path.join(RELEASE_ROOT, 'MANIFEST.txt'), `${manifestFiles.join('\n')}\n`, 'utf8');
  return { artifact, verification, archiveList };
}

function safeReleasePath(releaseRoot, relativePath) {
  const resolved = path.resolve(releaseRoot, relativePath);
  if (!resolved.startsWith(`${path.resolve(releaseRoot)}${path.sep}`)) {
    throw new Error(`V3 release path escaped release root: ${relativePath}`);
  }
  return resolved;
}

function verifyReleaseTree(releaseRoot = RELEASE_ROOT) {
  const errors = [];
  const indexPath = path.join(releaseRoot, 'release-index.json');
  if (!fs.existsSync(indexPath)) return { valid: false, errors: ['release-index-missing'], artifactCount: 0 };
  const index = readJson(indexPath);
  const artifacts = Array.isArray(index.artifacts) ? index.artifacts : [];
  if (index.artifactCount !== artifacts.length) errors.push('artifact-count-mismatch');
  if (index.localRegistryOnly !== true || index.githubRequired !== false) errors.push('publication-policy-invalid');
  if (index.desktopExecutableArtifactCount !== 0) errors.push('desktop-executable-count-invalid');
  const names = new Set();
  const hashes = new Set();
  const baselineHashes = new Set((index.baseline?.artifacts || []).map((item) => item.sha256));
  for (const artifact of artifacts) {
    if (names.has(artifact.name)) errors.push(`${artifact.artifactId}:duplicate-name`);
    if (hashes.has(artifact.sha256)) errors.push(`${artifact.artifactId}:duplicate-hash`);
    if (baselineHashes.has(artifact.sha256)) errors.push(`${artifact.artifactId}:duplicate-baseline-hash`);
    names.add(artifact.name);
    hashes.add(artifact.sha256);
    if (/\.(?:exe|dmg|rpm|snap)$/iu.test(artifact.name)) errors.push(`${artifact.artifactId}:prohibited-fabricated-format`);
    for (const key of ['relativePath', 'verification', 'sbom', 'provenance', 'metadata']) {
      if (!artifact[key]) errors.push(`${artifact.artifactId}:${key}-missing`);
      else if (!fs.existsSync(safeReleasePath(releaseRoot, artifact[key]))) errors.push(`${artifact.artifactId}:${key}-not-found`);
    }
    const artifactPath = safeReleasePath(releaseRoot, artifact.relativePath);
    if (fs.existsSync(artifactPath)) {
      if (fs.statSync(artifactPath).size !== artifact.bytes) errors.push(`${artifact.artifactId}:size-mismatch`);
      if (sha256File(artifactPath) !== artifact.sha256) errors.push(`${artifact.artifactId}:checksum-mismatch`);
      if (findTool('tar') && run('tar', ['-tzf', artifactPath], { allowFailure: true }).status !== 0) {
        errors.push(`${artifact.artifactId}:archive-invalid`);
      }
    }
  }
  for (const relativePath of [
    'rollback-manifest.json',
    'SHA256SUMS',
    'MANIFEST.txt',
    'native-evidence/linux-x86_64-product-core-smoke-v3.json',
    'signing-evidence/signing-boundary-v3.json',
    'compatibility/compatibility-index.json',
    'upgrade/upgrade-matrix.json'
  ]) {
    if (!fs.existsSync(path.join(releaseRoot, relativePath))) errors.push(`${relativePath}:missing`);
  }
  const rollback = readJsonOptional(path.join(releaseRoot, 'rollback-manifest.json'), {});
  if (rollback.silentOverwriteAllowed !== false || rollback.previousReleaseIndexSha256 !== index.baseline?.releaseIndexSha256) {
    errors.push('rollback-manifest-invalid');
  }
  const sums = fs.existsSync(path.join(releaseRoot, 'SHA256SUMS'))
    ? fs.readFileSync(path.join(releaseRoot, 'SHA256SUMS'), 'utf8').trim().split('\n').filter(Boolean)
    : [];
  if (sums.length !== artifacts.length) errors.push('sha256sums-count-mismatch');
  const secretScan = scanStageForSecrets(releaseRoot);
  if (!secretScan.passed) errors.push('secret-scan-failed');
  return {
    valid: errors.length === 0,
    errors,
    artifactCount: artifacts.length,
    inheritedArtifactCount: Number(index.inheritedArtifactCount || 0),
    secretScan,
    duplicateArtifactNames: artifacts.length - names.size,
    duplicateArtifactHashes: artifacts.length - hashes.size,
    index
  };
}

function fsyncTree(root) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const child = path.join(root, entry.name);
    if (entry.isDirectory()) fsyncTree(child);
    else if (entry.isFile()) {
      const descriptor = fs.openSync(child, 'r');
      try { fs.fsyncSync(descriptor); } finally { fs.closeSync(descriptor); }
    }
  }
  const descriptor = fs.openSync(root, 'r');
  try { fs.fsyncSync(descriptor); } finally { fs.closeSync(descriptor); }
}

function setPublicationState(releaseRoot) {
  const indexPath = path.join(releaseRoot, 'release-index.json');
  const temporaryPath = path.join(releaseRoot, `.release-index-${process.pid}.tmp`);
  const index = readJson(indexPath);
  index.localPublicationState = 'PUBLISHED_LOCAL_ATOMIC';
  index.artifacts = index.artifacts.map((artifact) => ({
    ...artifact,
    publicationState: 'PUBLISHED_LOCAL_ATOMIC'
  }));
  const descriptor = fs.openSync(temporaryPath, 'wx');
  try {
    fs.writeFileSync(descriptor, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
  fs.renameSync(temporaryPath, indexPath);
}

function publishAtomic(releaseRoot = RELEASE_ROOT, registryRoot = LOCAL_REGISTRY_ROOT) {
  const preflight = verifyReleaseTree(releaseRoot);
  if (!preflight.valid || preflight.artifactCount === 0) {
    throw new Error(`V3 publication preflight failed: ${preflight.errors.join('; ')}`);
  }
  const finalRoot = path.join(registryRoot, VERSION);
  const stagingRoot = path.join(registryRoot, `.staging-${VERSION}-${process.pid}`);
  if (fs.existsSync(finalRoot)) throw new Error(`V3 local release exists and will not be overwritten: ${finalRoot}`);
  fs.mkdirSync(registryRoot, { recursive: true });
  try {
    fs.cpSync(releaseRoot, stagingRoot, { recursive: true, dereference: false, errorOnExist: true });
    setPublicationState(stagingRoot);
    const stagedVerification = verifyReleaseTree(stagingRoot);
    if (!stagedVerification.valid) throw new Error(`V3 staged release invalid: ${stagedVerification.errors.join('; ')}`);
    fsyncTree(stagingRoot);
    fs.renameSync(stagingRoot, finalRoot);
    const finalVerification = verifyReleaseTree(finalRoot);
    if (!finalVerification.valid) throw new Error(`V3 published release invalid: ${finalVerification.errors.join('; ')}`);
    return { releaseRoot: finalRoot, verification: finalVerification };
  } catch (error) {
    if (fs.existsSync(stagingRoot)) fs.rmSync(stagingRoot, { recursive: true, force: true });
    throw error;
  }
}

function upgradeRollbackReport(baseline) {
  return {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_UPGRADE_AND_ROLLBACK_V3',
    status: 'DECLARED',
    generatedAt: new Date().toISOString(),
    baseline: { releaseLine: 'v2', version: VERSION, verified: baseline.status === 'V2_BASELINE_VERIFIED_UNMODIFIED' },
    current: { releaseLine: 'v3', version: VERSION },
    compatibilityMode: 'ADDITIVE_PRODUCT_CORE_NO_V2_BINARY_REPLACEMENT',
    upgradeTestedNatively: false,
    rollbackTestedNatively: false,
    nativeRunnerRequired: true,
    humanApprovalRequired: true,
    rollbackPreservesUserData: true,
    rollbackManifest: 'distribution/artifacts/v3/1.0.51/rollback-manifest.json',
    blockers: ['NATIVE_INSTALL_NOT_EXECUTED', 'NATIVE_UPGRADE_NOT_EXECUTED', 'NATIVE_ROLLBACK_NOT_EXECUTED']
  };
}

function writeReports({
  source,
  toolchain,
  discovery,
  decision,
  baseline,
  crossArchitecture,
  runnerReadinessReport,
  installer,
  artifact = null,
  releaseVerification = null,
  localPublication = null
}) {
  const generatedAt = new Date().toISOString();
  const upgradeRollback = upgradeRollbackReport(baseline);
  const v2Report = readJson(path.join(ROOT, 'runtime', 'distribution', 'v2', 'sheikha-universal-delivery-v2-report.json'));
  const desktopReadiness = {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_DESKTOP_RUNTIME_READINESS_V3',
    status: 'PRODUCT_CORE_IMPLEMENTED_NATIVE_SHELL_TOOLCHAIN_MISSING',
    generatedAt,
    productCore: {
      implemented: true,
      governedBridgeImplemented: true,
      highImpactFlowImplemented: true,
      artifactBuilt: Boolean(artifact),
      artifactInspected: releaseVerification?.valid === true,
      artifact: artifact || null
    },
    nativeShell: {
      implemented: false,
      selectedCandidate: decision.selection.selectedCandidate,
      frameworkInstalled: false,
      toolchainReady: false,
      desktopExecutableBuilt: false,
      nativeDesktopTested: false
    },
    directControlBoundaries: {
      shell: false,
      kernel: false,
      firmware: false,
      packageInstallation: false,
      secrets: false,
      unscopedFilesystem: false
    },
    decisionReport: path.relative(ROOT, DECISION_PATH)
  };
  const formatInspection = {
    schemaVersion: '3.0.0',
    system: 'SHEIKHA_ARTIFACT_FORMAT_INSPECTION_V3',
    status: artifact ? 'INSPECTED' : 'DECLARED',
    productCoreArchive: artifact ? {
      name: path.basename(artifact.path),
      bytes: artifact.bytes,
      sha256: artifact.sha256,
      fileInspection: toolOutput('file', [path.join(ROOT, artifact.path)]),
      tarInspectionPassed: releaseVerification?.valid === true
    } : null,
    nodeRuntimeElf: toolchain.nodeExecutable.fileInspection,
    peExecutableCreatedByV3: false,
    machOExecutableCreatedByV3: false,
    armExecutableCreatedByV3: false
  };
  const main = {
    schemaVersion: '3.0.0',
    system: SYSTEM,
    status: baseline.status === 'V2_BASELINE_VERIFIED_UNMODIFIED' &&
      (!artifact || releaseVerification?.valid === true)
      ? 'ACTIVE_WITH_GOVERNED_PRODUCT_CORE_AND_MEASURED_NATIVE_BOUNDARIES'
      : 'REVIEW_REQUIRED',
    generatedAt,
    sourceVersion: VERSION,
    sourceBaselineCommit: source.baselineCommit,
    baselineV2: {
      version: VERSION,
      targetCount: v2Report.targetCount,
      builtCount: v2Report.builtCount,
      verifiedCount: v2Report.verifiedCount,
      nativeVerifiedCount: v2Report.nativeVerifiedCount,
      totalArtifactCount: v2Report.totalArtifactCount,
      immutableIntegrityStatus: baseline.status
    },
    productCoreImplemented: true,
    desktopNativeShellImplemented: false,
    desktopExecutableBuiltCount: 0,
    eligibilityRecordCount: crossArchitecture.eligibilityRecordCount,
    nativeRunnerContractCount: runnerReadinessReport.contractCount,
    builtCount: artifact ? 1 : 0,
    inspectedCount: releaseVerification?.valid ? 1 : 0,
    verifiedCount: releaseVerification?.valid ? 1 : 0,
    nativeVerifiedCount: 0,
    publishedLocallyCount: localPublication ? 1 : 0,
    publishedExternallyCount: 0,
    localReleasePath: localPublication?.releaseRoot || null,
    artifact: artifact || null,
    crossArchitectureStatusCounts: crossArchitecture.statusCounts,
    runnerStatusCounts: runnerReadinessReport.statusCounts,
    missingTools: toolchain.missingTools,
    actualImplementation: [
      'PLATFORM_NEUTRAL_DESKTOP_PRODUCT_CORE',
      'GOVERNANCE_GATE',
      'CAPABILITY_BRIDGE',
      'AUDIT_EVIDENCE',
      'USER_AND_SYSTEM_INSTALLER_PROFILES',
      'SEVEN_NATIVE_RUNNER_CONTRACTS',
      'LINUX_X86_64_AARCH64_ARMV7_INSPECTION'
    ],
    limitations: [
      'No native desktop shell was present or built.',
      'Tauri 2 is an architecture candidate; Rust, Cargo, GTK4 development, and WebKitGTK 4.1 development prerequisites are missing locally.',
      'No Windows EXE, macOS DMG, RPM, Snap, or ARM executable was fabricated.',
      'Linux aarch64 and armv7 require architecture-correct toolchains and native runners.',
      'Windows and macOS require native runners; signing and notarization were not requested.',
      'The V3 artifact is a platform-neutral Product Core source archive requiring an external Node runtime, not a desktop executable.',
      'Native install, upgrade, uninstall, and rollback remain unverified.'
    ],
    governance: {
      localRegistryOnly: true,
      githubRequired: false,
      sudoUsed: false,
      packagesInstalled: false,
      signingPerformed: false,
      notarizationPerformed: false,
      externalPublishingPerformed: false,
      humanFinalDecision: true,
      aiIsAdvisoryOnly: true
    },
    reports: {
      desktopDecision: path.relative(ROOT, DECISION_PATH),
      desktopReadiness: path.relative(ROOT, DESKTOP_REPORT),
      crossArchitecture: path.relative(ROOT, CROSS_ARCH_REPORT),
      runnerReadiness: path.relative(ROOT, RUNNER_REPORT),
      installerVerification: path.relative(ROOT, INSTALLER_REPORT),
      upgradeRollback: path.relative(ROOT, UPGRADE_REPORT)
    }
  };

  writeJson(DECISION_PATH, decision);
  writeJson(DESKTOP_REPORT, desktopReadiness);
  writeJson(CROSS_ARCH_REPORT, crossArchitecture);
  writeJson(RUNNER_REPORT, runnerReadinessReport);
  writeJson(INSTALLER_REPORT, installer);
  writeJson(UPGRADE_REPORT, upgradeRollback);
  writeJson(path.join(EVIDENCE_ROOT, 'toolchain-inspection-v3.json'), toolchain);
  writeJson(path.join(EVIDENCE_ROOT, 'desktop-runtime-discovery-v3.json'), discovery);
  writeJson(path.join(EVIDENCE_ROOT, 'v2-baseline-integrity-v3.json'), baseline);
  writeJson(path.join(EVIDENCE_ROOT, 'artifact-format-inspection-v3.json'), formatInspection);
  writeJson(path.join(EVIDENCE_ROOT, 'release-tree-verification-v3.json'), releaseVerification || {
    valid: false,
    status: 'NOT_BUILT',
    errors: ['v3-release-not-built']
  });
  writeJson(MAIN_REPORT, main);
  return main;
}

function createInspection() {
  const source = sourceIdentity();
  const contracts = writeRunnerContracts();
  const toolchain = inspectToolchain();
  const discovery = inspectDesktopShell();
  const decision = createDesktopDecision(toolchain, discovery);
  const baseline = baselineV2Integrity();
  const crossArchitecture = crossArchitectureEligibility(toolchain);
  const runnerReadinessReport = runnerReadiness(toolchain, contracts);
  const installer = installerVerification(toolchain);
  return {
    source,
    contracts,
    toolchain,
    discovery,
    decision,
    baseline,
    crossArchitecture,
    runnerReadinessReport,
    installer
  };
}

function execute(action = 'status', options = {}) {
  if (action === 'status' && fs.existsSync(MAIN_REPORT)) {
    return { action, report: readJson(MAIN_REPORT) };
  }
  if (action === 'verify') {
    const verification = verifyReleaseTree(options.releaseRoot || RELEASE_ROOT);
    if (!verification.valid) throw new Error(`V3 release verification failed: ${verification.errors.join('; ')}`);
    return { action, verification, report: readJsonOptional(MAIN_REPORT, null) };
  }
  const inspection = createInspection();
  if (['inspect', 'decision'].includes(action)) {
    const existingVerification = fs.existsSync(path.join(RELEASE_ROOT, 'release-index.json'))
      ? verifyReleaseTree(RELEASE_ROOT)
      : null;
    const existingArtifact = existingVerification?.valid
      ? existingVerification.index.artifacts[0]
      : null;
    const report = writeReports({
      ...inspection,
      artifact: existingArtifact,
      releaseVerification: existingVerification
    });
    return { action, ...inspection, report, verification: existingVerification };
  }
  if (!['build', 'release-local'].includes(action)) throw new Error(`Unknown V3 delivery action: ${action}`);

  let buildResult;
  if (fs.existsSync(path.join(RELEASE_ROOT, 'release-index.json'))) {
    const verification = verifyReleaseTree(RELEASE_ROOT);
    if (!verification.valid) throw new Error(`Existing V3 release is invalid: ${verification.errors.join('; ')}`);
    const indexed = verification.index.artifacts[0];
    buildResult = {
      artifact: {
        id: indexed.artifactId,
        product: indexed.product,
        version: indexed.productVersion,
        status: indexed.status,
        artifactKind: indexed.artifactKind,
        architecture: indexed.architecture,
        desktopExecutable: indexed.desktopExecutable,
        nativeVerified: indexed.nativeVerified,
        path: path.relative(ROOT, path.join(RELEASE_ROOT, indexed.relativePath)),
        bytes: indexed.bytes,
        sha256: indexed.sha256
      }
    };
  } else {
    buildResult = buildProductCoreRelease(inspection.source, inspection.baseline);
  }
  const verification = verifyReleaseTree(RELEASE_ROOT);
  if (!verification.valid) throw new Error(`Built V3 release is invalid: ${verification.errors.join('; ')}`);
  const localPublication = action === 'release-local'
    ? publishAtomic(RELEASE_ROOT, options.registryRoot || LOCAL_REGISTRY_ROOT)
    : null;
  const report = writeReports({
    ...inspection,
    artifact: buildResult.artifact,
    releaseVerification: verification,
    localPublication
  });
  return { action, ...inspection, ...buildResult, verification, localPublication, report };
}

function commandSummary(result) {
  return {
    system: SYSTEM,
    action: result.action,
    status: result.report?.status || (result.verification?.valid ? 'INSPECTED' : 'DECLARED'),
    sourceVersion: result.report?.sourceVersion || VERSION,
    builtCount: Number(result.report?.builtCount || 0),
    inspectedCount: Number(result.report?.inspectedCount || 0),
    verifiedCount: Number(result.report?.verifiedCount || 0),
    nativeVerifiedCount: Number(result.report?.nativeVerifiedCount || 0),
    desktopExecutableBuiltCount: Number(result.report?.desktopExecutableBuiltCount || 0),
    eligibilityRecordCount: Number(result.report?.eligibilityRecordCount || 0),
    nativeRunnerContractCount: Number(result.report?.nativeRunnerContractCount || 0),
    publishedLocallyCount: Number(result.report?.publishedLocallyCount || 0),
    localReleasePath: result.report?.localReleasePath || null,
    githubRequired: false,
    externalPublishingPerformed: false,
    reports: result.report?.reports || null
  };
}

if (require.main === module) {
  try {
    const result = execute(process.argv[2] || 'status');
    console.log(JSON.stringify(commandSummary(result), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ system: SYSTEM, status: 'FAILED', error: error.message }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = {
  ALLOWED_STATES,
  CROSS_ARCH_REPORT,
  DECISION_PATH,
  MAIN_REPORT,
  RELEASE_ROOT,
  RUNNER_REPORT,
  SYSTEM,
  VERSION,
  baselineV2Integrity,
  buildProductCoreRelease,
  commandSummary,
  createDesktopDecision,
  crossArchitectureEligibility,
  execute,
  inspectDesktopShell,
  inspectToolchain,
  installerVerification,
  publishAtomic,
  runnerReadiness,
  verifyReleaseTree
};
