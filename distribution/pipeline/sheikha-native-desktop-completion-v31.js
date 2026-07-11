#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { spawnSync } = require('node:child_process');

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

const SYSTEM = 'SHEIKHA_NATIVE_DESKTOP_COMPLETION_V31';
const RELEASE_LINE = 'v3.1';
const VERSION = readJson(path.join(ROOT, 'package.json')).version;
const SOURCE_PATH = path.join(
  ROOT,
  'desktop',
  'shell',
  'native-linux',
  'sheikha_native_desktop.c'
);
const SECURITY_CONTRACT_PATH = path.join(
  ROOT,
  'desktop',
  'shell',
  'native-linux',
  'sheikha-native-desktop-security-v31.json'
);
const DESKTOP_ENTRY_PATH = path.join(
  ROOT,
  'desktop',
  'shell',
  'native-linux',
  'sheikha-native-desktop.desktop'
);
const ICON_PATH = path.join(ROOT, 'public', 'icons', 'sheikha-emblem-v4.svg');
const REPORT_ROOT = path.join(ROOT, 'runtime', 'distribution', 'v3.1');
const EVIDENCE_ROOT = path.join(REPORT_ROOT, 'evidence');
const DECISION_REPORT = path.join(
  ROOT,
  'runtime',
  'desktop-runtime',
  'v2',
  'sheikha-native-desktop-runtime-decision-v2.json'
);
const MAIN_REPORT = path.join(REPORT_ROOT, 'sheikha-native-desktop-completion-v31-report.json');
const NATIVE_REPORT = path.join(REPORT_ROOT, 'sheikha-native-desktop-verification-v31.json');
const INSTALLER_REPORT = path.join(REPORT_ROOT, 'sheikha-native-desktop-installer-lifecycle-v31.json');
const SECURITY_REPORT = path.join(REPORT_ROOT, 'sheikha-native-desktop-security-hardening-v31.json');
const ACTUAL_ACTIVATION_EVIDENCE = path.join(
  EVIDENCE_ROOT,
  'actual-user-activation-v31.json'
);
const RELEASE_ROOT = path.join(DISTRIBUTION_ROOT, 'artifacts', RELEASE_LINE, VERSION);
const LOCAL_REGISTRY_ROOT = path.join(
  os.homedir(),
  'Sheikha-Local-Registry',
  'releases',
  RELEASE_LINE
);
const V3_BASELINE_ROOT = path.join(DISTRIBUTION_ROOT, 'artifacts', 'v3', VERSION);
const V3_LOCAL_BASELINE_ROOT = path.join(
  os.homedir(),
  'Sheikha-Local-Registry',
  'releases',
  'v3',
  VERSION
);

const COMPILE_ARGS = Object.freeze([
  '-std=c11',
  '-O2',
  '-fPIE',
  '-pie',
  '-fstack-protector-all',
  '-D_FORTIFY_SOURCE=2',
  '-Wall',
  '-Wextra',
  '-Werror',
  '-Wno-cast-function-type',
  '-Wl,-z,relro,-z,now,-z,noexecstack'
]);

function readJsonOptional(filePath, fallback = null) {
  try {
    return readJson(filePath);
  } catch (_) {
    return fallback;
  }
}

function timedRun(command, args = [], options = {}) {
  const started = performance.now();
  const result = spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...(options.env || {}) },
    maxBuffer: 32 * 1024 * 1024,
    timeout: options.timeout || 45000
  });
  const durationMs = Number((performance.now() - started).toFixed(2));
  if (result.error || (options.allowFailure !== true && result.status !== 0)) {
    const detail = result.error?.message || result.stderr || result.stdout || `exit ${result.status}`;
    throw new Error(`${command} failed: ${String(detail).trim()}`);
  }
  return {
    status: result.status,
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim(),
    durationMs
  };
}

function sourceIdentity() {
  const baselineCommit = run('git', ['rev-parse', 'HEAD']).stdout;
  return {
    baselineCommit,
    deterministicTimestamp: run('git', ['show', '-s', '--format=%cI', baselineCommit]).stdout,
    sourceSha256: sha256File(SOURCE_PATH),
    securityContractSha256: sha256File(SECURITY_CONTRACT_PATH),
    worktreeDirty: Boolean(run('git', ['status', '--porcelain'], { allowFailure: true }).stdout),
    sourcePolicy: 'V31_NATIVE_IMPLEMENTATION_OVER_IMMUTABLE_V3_BASELINE'
  };
}

function inspectRuntime() {
  const requiredTools = [
    'gcc', 'strip', 'file', 'readelf', 'objdump', 'nm', 'ldd', 'tar', 'gzip',
    'sha256sum', 'dpkg-query', '/usr/bin/time'
  ];
  const tools = Object.fromEntries(requiredTools.map((tool) => [
    tool,
    tool.startsWith('/') ? (fs.existsSync(tool) ? tool : null) : findTool(tool)
  ]));
  const libraries = {
    gtk3: '/lib/x86_64-linux-gnu/libgtk-3.so.0',
    webkit2gtk: '/lib/x86_64-linux-gnu/libwebkit2gtk-4.0.so.37',
    gobject: '/lib/x86_64-linux-gnu/libgobject-2.0.so.0',
    glib: '/lib/x86_64-linux-gnu/libglib-2.0.so.0'
  };
  const packages = run('dpkg-query', [
    '-W',
    '-f=${Package}\t${Version}\t${Architecture}\n',
    'libgtk-3-0',
    'libwebkit2gtk-4.0-37',
    'libglib2.0-0'
  ], { allowFailure: true });
  const missingTools = Object.entries(tools).filter(([, value]) => !value).map(([name]) => name);
  const missingLibraries = Object.entries(libraries).filter(([, value]) => !fs.existsSync(value)).map(([name]) => name);
  return {
    schemaVersion: '3.1.0',
    system: 'SHEIKHA_NATIVE_DESKTOP_RUNTIME_INSPECTION_V31',
    status: missingTools.length || missingLibraries.length ? 'TOOLCHAIN_MISSING' : 'BUILD_READY',
    host: {
      platform: process.platform,
      architecture: process.arch,
      display: process.env.DISPLAY || null,
      node: process.version,
      kernel: os.release()
    },
    tools,
    missingTools,
    libraries: Object.fromEntries(Object.entries(libraries).map(([name, filePath]) => [name, {
      path: filePath,
      available: fs.existsSync(filePath),
      inspection: fs.existsSync(filePath) ? run('file', [filePath]).stdout : null
    }])),
    missingLibraries,
    packages: packages.stdout.split('\n').filter(Boolean).map((line) => {
      const [name, version, architecture] = line.split('\t');
      return { name, version, architecture };
    }),
    dynamicBinding: true,
    developmentHeadersRequired: false,
    packagesInstalledByV31: false,
    sudoUsed: false
  };
}

function baselineIntegrity() {
  const workspaceIndexPath = path.join(V3_BASELINE_ROOT, 'release-index.json');
  const localIndexPath = path.join(V3_LOCAL_BASELINE_ROOT, 'release-index.json');
  const workspaceIndex = readJson(workspaceIndexPath);
  const localIndex = readJson(localIndexPath);
  const workspaceArtifacts = workspaceIndex.artifacts.map((artifact) => {
    const absolute = path.join(V3_BASELINE_ROOT, artifact.relativePath);
    return {
      name: artifact.name,
      expectedSha256: artifact.sha256,
      actualSha256: fs.existsSync(absolute) ? sha256File(absolute) : null,
      valid: fs.existsSync(absolute) && sha256File(absolute) === artifact.sha256
    };
  });
  const historicalDiff = run('git', [
    'diff', '--name-only', '--',
    'runtime/distribution/v3',
    'runtime/desktop-runtime/v1'
  ], { allowFailure: true }).stdout.split('\n').filter(Boolean);
  return {
    schemaVersion: '3.1.0',
    system: 'SHEIKHA_V31_IMMUTABLE_V3_BASELINE_LINK',
    status: workspaceArtifacts.every((item) => item.valid) && historicalDiff.length === 0
      ? 'V3_BASELINE_VERIFIED_UNMODIFIED'
      : 'FAILED',
    releaseLine: 'v3',
    version: VERSION,
    workspaceReleaseIndexSha256: sha256File(workspaceIndexPath),
    localReleaseIndexSha256: sha256File(localIndexPath),
    artifactCount: workspaceArtifacts.length,
    workspaceArtifacts,
    localPublicationState: localIndex.localPublicationState || null,
    historicalDiff,
    historicalFilesModifiedByV31: false
  };
}

function compileBinary(outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  run('gcc', [...COMPILE_ARGS, SOURCE_PATH, '-ldl', '-o', outputPath], { timeout: 120000 });
  run('strip', ['--strip-unneeded', outputPath]);
  fs.chmodSync(outputPath, 0o755);
  return fileMetadata(outputPath);
}

function inspectElf(binaryPath) {
  const fileInspection = run('file', [binaryPath]).stdout;
  const header = run('readelf', ['-W', '-h', binaryPath]).stdout;
  const programHeaders = run('readelf', ['-W', '-l', binaryPath]).stdout;
  const dynamic = run('readelf', ['-W', '-d', binaryPath]).stdout;
  const symbols = run('nm', ['-D', binaryPath], { allowFailure: true }).stdout;
  const dependencies = run('ldd', [binaryPath]).stdout;
  const stackLine = programHeaders.split('\n').find((line) => line.includes('GNU_STACK')) || '';
  return {
    fileInspection,
    elfHeader: header,
    programHeaders,
    dynamicSection: dynamic,
    dynamicSymbols: symbols,
    dependencies,
    architectureCorrect: /ELF 64-bit.*x86-64/iu.test(fileInspection),
    pie: /Type:\s+DYN/iu.test(header),
    nxStack: stackLine.includes('RW') && !stackLine.includes('RWE'),
    relro: programHeaders.includes('GNU_RELRO'),
    bindNow: dynamic.includes('BIND_NOW') || /FLAGS.*NOW/iu.test(dynamic),
    stackCanary: symbols.includes('__stack_chk_fail'),
    directNodeDependency: /libnode/iu.test(dependencies),
    directGtkLinkDependency: /libgtk|libwebkit/iu.test(dependencies)
  };
}

function runNativeVerification(binaryPath) {
  const probe = timedRun(binaryPath, ['--probe']);
  const version = timedRun(binaryPath, ['--version']);
  const remoteDenied = timedRun(binaryPath, ['--smoke', '--url', 'https://example.com/'], {
    allowFailure: true
  });
  const timedSmoke = timedRun('/usr/bin/time', [
    '-f',
    'SHEIKHA_TIME_ELAPSED_SECONDS=%e\nSHEIKHA_TIME_MAX_RSS_KB=%M',
    binaryPath,
    '--smoke'
  ], { timeout: 45000 });
  const rssMatch = timedSmoke.stderr.match(/SHEIKHA_TIME_MAX_RSS_KB=(\d+)/u);
  const elapsedMatch = timedSmoke.stderr.match(/SHEIKHA_TIME_ELAPSED_SECONDS=([0-9.]+)/u);
  const result = {
    schemaVersion: '3.1.0',
    system: 'SHEIKHA_NATIVE_DESKTOP_EXECUTION_EVIDENCE_V31',
    status: 'NATIVE_VERIFIED',
    hostPlatform: process.platform,
    hostArchitecture: process.arch,
    display: process.env.DISPLAY || null,
    probePassed: probe.status === 0 && probe.stdout.includes('SHEIKHA_NATIVE_DESKTOP_PROBE_OK'),
    probeOutput: probe.stdout,
    probeDurationMs: probe.durationMs,
    versionPassed: version.status === 0 && version.stdout.includes(VERSION),
    versionOutput: version.stdout,
    remoteUrlDenied: remoteDenied.status === 65 && remoteDenied.stderr.includes('SHEIKHA_NATIVE_DESKTOP_URL_DENIED'),
    remoteUrlDeniedExitCode: remoteDenied.status,
    guiLaunchPassed: timedSmoke.status === 0 && timedSmoke.stdout.includes('SHEIKHA_NATIVE_DESKTOP_LAUNCH_OK'),
    pageLoadPassed: timedSmoke.stdout.includes('SHEIKHA_NATIVE_DESKTOP_SMOKE_OK'),
    nativeSmokeOutput: timedSmoke.stdout,
    nativeSmokeDurationMs: timedSmoke.durationMs,
    measuredElapsedSeconds: elapsedMatch ? Number(elapsedMatch[1]) : null,
    measuredPeakRssKB: rssMatch ? Number(rssMatch[1]) : null,
    nativeBridgeExposed: false,
    loopbackOnly: true
  };
  if (!result.probePassed || !result.versionPassed || !result.remoteUrlDenied ||
      !result.guiLaunchPassed || !result.pageLoadPassed) {
    throw new Error('Native desktop execution verification failed.');
  }
  return result;
}

function createPackage(stageRoot, binaryPath) {
  const packageName = `sheikha-native-desktop-${VERSION}-linux-x86_64`;
  const packageRoot = path.join(stageRoot, packageName);
  const binaryTarget = path.join(packageRoot, 'bin', 'sheikha-native-desktop');
  fs.mkdirSync(path.dirname(binaryTarget), { recursive: true });
  fs.copyFileSync(binaryPath, binaryTarget);
  fs.chmodSync(binaryTarget, 0o755);
  const desktopTarget = path.join(packageRoot, 'share', 'applications', 'sheikha-native-desktop.desktop');
  fs.mkdirSync(path.dirname(desktopTarget), { recursive: true });
  fs.copyFileSync(DESKTOP_ENTRY_PATH, desktopTarget);
  const iconTarget = path.join(
    packageRoot,
    'share',
    'icons',
    'hicolor',
    'scalable',
    'apps',
    'sheikha.svg'
  );
  fs.mkdirSync(path.dirname(iconTarget), { recursive: true });
  fs.copyFileSync(ICON_PATH, iconTarget);
  const contractTarget = path.join(packageRoot, 'share', 'sheikha', 'security-contract.json');
  fs.mkdirSync(path.dirname(contractTarget), { recursive: true });
  fs.copyFileSync(SECURITY_CONTRACT_PATH, contractTarget);
  writeJson(path.join(packageRoot, 'INSTALLATION.json'), {
    schemaVersion: '3.1.0',
    product: 'sheikha-native-desktop',
    version: VERSION,
    platform: 'linux',
    architecture: 'x86_64',
    installationScope: 'current-user',
    installRootTemplate: '$HOME/.local/opt/sheikha-native-desktop/1.0.51',
    launcherTemplate: '$HOME/.local/bin/sheikha-native-desktop',
    administratorRequired: false,
    automaticPrivilegeEscalation: false,
    externalPublishing: false
  });
  return { packageName, packageRoot };
}

function verifyInstallerLifecycle(archivePath, packageName) {
  const verificationRoot = resetGeneratedDir(path.join(
    DISTRIBUTION_ROOT,
    'verification',
    RELEASE_LINE,
    VERSION,
    'user-install'
  ));
  const extractRoot = path.join(verificationRoot, 'extract');
  const fakeHome = path.join(verificationRoot, 'home');
  fs.mkdirSync(extractRoot, { recursive: true });
  fs.mkdirSync(fakeHome, { recursive: true });
  run('tar', ['-xzf', archivePath, '-C', extractRoot]);
  const extractedPackage = path.join(extractRoot, packageName);
  const installRoot = path.join(fakeHome, '.local', 'opt', 'sheikha-native-desktop', VERSION);
  const launcherPath = path.join(fakeHome, '.local', 'bin', 'sheikha-native-desktop');
  fs.mkdirSync(path.dirname(installRoot), { recursive: true });
  fs.mkdirSync(path.dirname(launcherPath), { recursive: true });
  fs.cpSync(extractedPackage, installRoot, { recursive: true, dereference: false });
  fs.symlinkSync(path.join(installRoot, 'bin', 'sheikha-native-desktop'), launcherPath);
  const probe = timedRun(launcherPath, ['--probe']);
  const launch = timedRun(launcherPath, ['--smoke'], { timeout: 45000 });
  const installedBinary = path.join(installRoot, 'bin', 'sheikha-native-desktop');
  const installedSha256 = sha256File(installedBinary);
  fs.unlinkSync(launcherPath);
  fs.rmSync(path.join(fakeHome, '.local', 'opt', 'sheikha-native-desktop'), {
    recursive: true,
    force: true
  });
  const result = {
    schemaVersion: '3.1.0',
    system: 'SHEIKHA_NATIVE_DESKTOP_USER_INSTALLER_LIFECYCLE_V31',
    status: 'NATIVE_VERIFIED',
    scope: 'current-user-test-root',
    administratorUsed: false,
    actualUserHomeModified: false,
    archiveExtracted: fs.existsSync(extractedPackage),
    installedBinarySha256: installedSha256,
    launcherCreated: true,
    installedProbePassed: probe.stdout.includes('SHEIKHA_NATIVE_DESKTOP_PROBE_OK'),
    installedLaunchPassed: launch.stdout.includes('SHEIKHA_NATIVE_DESKTOP_SMOKE_OK'),
    uninstallPassed: !fs.existsSync(launcherPath) && !fs.existsSync(installRoot),
    rollbackToPreInstallStatePassed: !fs.existsSync(launcherPath) && !fs.existsSync(installRoot),
    userDataDeleted: false,
    systemInstallerBuilt: false,
    systemInstallTested: false
  };
  if (!result.archiveExtracted || !result.installedProbePassed || !result.installedLaunchPassed ||
      !result.uninstallPassed || !result.rollbackToPreInstallStatePassed) {
    throw new Error('Native desktop installer lifecycle verification failed.');
  }
  return result;
}

function createSbom(artifact, runtime) {
  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    version: 1,
    metadata: {
      component: {
        type: 'application',
        name: artifact.product,
        version: VERSION,
        hashes: [{ alg: 'SHA-256', content: artifact.sha256 }]
      }
    },
    components: runtime.packages.map((item) => ({
      type: 'library',
      name: item.name,
      version: item.version,
      properties: [{ name: 'sheikha:runtimeArchitecture', value: item.architecture }]
    }))
  };
}

function createProvenance(artifact, source, baseline) {
  return {
    _type: 'https://in-toto.io/Statement/v1',
    subject: [{ name: artifact.name, digest: { sha256: artifact.sha256 } }],
    predicateType: 'https://slsa.dev/provenance/v1',
    predicate: {
      buildDefinition: {
        buildType: 'https://sheikha.local/build-types/native-desktop-v31',
        externalParameters: {
          platform: 'linux',
          architecture: 'x86_64',
          releaseLine: RELEASE_LINE,
          compileArguments: COMPILE_ARGS
        },
        internalParameters: {
          baselineCommit: source.baselineCommit,
          sourceSha256: source.sourceSha256,
          reproducibleDoubleBuildRequired: true
        },
        resolvedDependencies: [{
          uri: `local-registry://releases/v3/${VERSION}`,
          digest: { sha256: baseline.localReleaseIndexSha256 }
        }]
      },
      runDetails: {
        builder: { id: SYSTEM },
        metadata: {
          startedOn: source.deterministicTimestamp,
          finishedOn: source.deterministicTimestamp
        }
      }
    }
  };
}

function artifactRecord(id, product, filePath, kind, nativeVerified) {
  const metadata = fileMetadata(filePath);
  return {
    id,
    artifactId: id,
    product,
    version: VERSION,
    productVersion: VERSION,
    status: nativeVerified ? 'NATIVE_VERIFIED' : 'INSPECTED',
    name: path.basename(filePath),
    path: metadata.path,
    relativePath: `artifacts/${path.basename(filePath)}`,
    bytes: metadata.bytes,
    sha256: metadata.sha256,
    artifactKind: kind,
    platform: 'linux',
    architecture: 'x86_64',
    desktopExecutable: kind === 'ELF_NATIVE_EXECUTABLE',
    nativeVerified,
    signed: false,
    publicationState: 'NOT_PUBLISHED',
    verification: `verification/${path.basename(filePath)}.verification.json`,
    sbom: `sbom/${path.basename(filePath)}.cdx.json`,
    provenance: `provenance/${path.basename(filePath)}.provenance.json`,
    metadata: `metadata/${path.basename(filePath)}.manifest.json`
  };
}

function buildRelease(inspection, source, baseline) {
  if (fs.existsSync(RELEASE_ROOT)) {
    throw new Error(`V3.1 workspace release exists and will not be overwritten: ${RELEASE_ROOT}`);
  }
  if (inspection.status !== 'BUILD_READY') {
    throw new Error(`Native desktop runtime is not build ready: ${[
      ...inspection.missingTools,
      ...inspection.missingLibraries
    ].join(', ')}`);
  }
  const stageRoot = resetGeneratedDir(path.join(DISTRIBUTION_ROOT, 'staging', RELEASE_LINE, VERSION));
  const firstBuild = path.join(stageRoot, 'reproducibility', 'build-a', 'sheikha-native-desktop');
  const secondBuild = path.join(stageRoot, 'reproducibility', 'build-b', 'sheikha-native-desktop');
  compileBinary(firstBuild);
  compileBinary(secondBuild);
  const firstHash = sha256File(firstBuild);
  const secondHash = sha256File(secondBuild);
  if (firstHash !== secondHash) throw new Error('Native desktop reproducibility gate failed.');

  const artifactDir = path.join(RELEASE_ROOT, 'artifacts');
  fs.mkdirSync(artifactDir, { recursive: true });
  const binaryName = `sheikha-native-desktop-${VERSION}-linux-x86_64`;
  const binaryPath = path.join(artifactDir, binaryName);
  fs.copyFileSync(firstBuild, binaryPath);
  fs.chmodSync(binaryPath, 0o755);
  const elfInspection = inspectElf(binaryPath);
  if (!elfInspection.architectureCorrect || !elfInspection.pie || !elfInspection.nxStack ||
      !elfInspection.relro || !elfInspection.bindNow || !elfInspection.stackCanary ||
      elfInspection.directNodeDependency || elfInspection.directGtkLinkDependency) {
    throw new Error('Native desktop ELF hardening or dependency gate failed.');
  }
  const nativeVerification = runNativeVerification(binaryPath);

  const packageStage = path.join(stageRoot, 'package');
  fs.mkdirSync(packageStage, { recursive: true });
  const { packageName } = createPackage(packageStage, binaryPath);
  const archiveName = `${packageName}.tar.gz`;
  const archivePath = path.join(artifactDir, archiveName);
  createDeterministicTar(packageStage, packageName, archivePath);
  const archiveEntries = run('tar', ['-tzf', archivePath]).stdout.split('\n').filter(Boolean);
  const archiveRootValid = archiveEntries.every((entry) =>
    entry === `${packageName}/` || entry.startsWith(`${packageName}/`)
  );
  if (!archiveRootValid) throw new Error('Native desktop package archive root is invalid.');
  const installerLifecycle = verifyInstallerLifecycle(archivePath, packageName);

  const binaryArtifact = artifactRecord(
    'sheikha-native-desktop-linux-x86_64-elf',
    'sheikha-native-desktop',
    binaryPath,
    'ELF_NATIVE_EXECUTABLE',
    true
  );
  const archiveArtifact = artifactRecord(
    'sheikha-native-desktop-linux-x86_64-user-tar',
    'sheikha-native-desktop',
    archivePath,
    'USER_PORTABLE_TAR_GZ',
    true
  );
  const artifacts = [binaryArtifact, archiveArtifact];
  for (const directory of [
    'metadata', 'sbom', 'provenance', 'verification', 'native-evidence',
    'security-evidence', 'installer-evidence', 'rollback-evidence', 'compatibility'
  ]) fs.mkdirSync(path.join(RELEASE_ROOT, directory), { recursive: true });

  const binaryVerification = {
    schemaVersion: '3.1.0',
    status: 'NATIVE_VERIFIED',
    artifact: binaryArtifact,
    reproducibility: {
      doubleBuildPassed: true,
      firstSha256: firstHash,
      secondSha256: secondHash
    },
    elfInspection,
    nativeExecution: nativeVerification
  };
  const archiveVerification = {
    schemaVersion: '3.1.0',
    status: 'NATIVE_VERIFIED',
    artifact: archiveArtifact,
    archiveEntryCount: archiveEntries.length,
    archiveRootValid,
    installerLifecycle
  };
  writeJson(path.join(RELEASE_ROOT, 'verification', `${binaryName}.verification.json`), binaryVerification);
  writeJson(path.join(RELEASE_ROOT, 'verification', `${archiveName}.verification.json`), archiveVerification);
  for (const artifact of artifacts) {
    writeJson(path.join(RELEASE_ROOT, 'metadata', `${artifact.name}.manifest.json`), {
      schemaVersion: '3.1.0',
      system: SYSTEM,
      artifact,
      localRegistryOnly: true,
      githubRequired: false,
      externalPublishingRequested: false
    });
    writeJson(path.join(RELEASE_ROOT, 'sbom', `${artifact.name}.cdx.json`), createSbom(artifact, inspection));
    writeJson(
      path.join(RELEASE_ROOT, 'provenance', `${artifact.name}.provenance.json`),
      createProvenance(artifact, source, baseline)
    );
  }
  writeJson(path.join(RELEASE_ROOT, 'native-evidence', 'native-execution-v31.json'), nativeVerification);
  writeJson(path.join(RELEASE_ROOT, 'security-evidence', 'elf-hardening-v31.json'), elfInspection);
  writeJson(path.join(RELEASE_ROOT, 'security-evidence', 'native-shell-security-contract-v31.json'), readJson(SECURITY_CONTRACT_PATH));
  writeJson(path.join(RELEASE_ROOT, 'installer-evidence', 'user-installer-lifecycle-v31.json'), installerLifecycle);
  writeJson(path.join(RELEASE_ROOT, 'rollback-evidence', 'rollback-to-preinstall-state-v31.json'), {
    schemaVersion: '3.1.0',
    status: installerLifecycle.rollbackToPreInstallStatePassed ? 'NATIVE_VERIFIED' : 'FAILED',
    rollbackTarget: 'PRE_NATIVE_DESKTOP_INSTALL_STATE',
    previousRelease: `local-registry://releases/v3/${VERSION}`,
    launcherRemoved: installerLifecycle.uninstallPassed,
    installRootRemoved: installerLifecycle.uninstallPassed,
    actualUserHomeModified: false,
    humanApprovalRequiredForRealInstall: true
  });
  writeJson(path.join(RELEASE_ROOT, 'compatibility', 'compatibility-index.json'), {
    schemaVersion: '3.1.0',
    status: 'NATIVE_VERIFIED_ON_LINUX_X86_64',
    baselineRelease: `local-registry://releases/v3/${VERSION}`,
    platform: 'linux',
    architecture: 'x86_64',
    gtkRuntime: '3.24.33',
    webkitRuntime: '2.50.4',
    nodeRequiredAtRuntime: false,
    aarch64: 'TOOLCHAIN_MISSING',
    armv7: 'TOOLCHAIN_MISSING',
    windows: 'REQUIRES_NATIVE_RUNNER',
    macos: 'REQUIRES_NATIVE_RUNNER'
  });
  writeJson(path.join(RELEASE_ROOT, 'release-index.json'), {
    schemaVersion: '3.1.0',
    system: 'SHEIKHA_LOCAL_RELEASE_INDEX_V31',
    releaseLine: RELEASE_LINE,
    version: VERSION,
    sourceBaselineCommit: source.baselineCommit,
    artifactCount: artifacts.length,
    builtTargetCount: 1,
    inspectedTargetCount: 1,
    verifiedTargetCount: 1,
    nativeVerifiedTargetCount: 1,
    desktopExecutableArtifactCount: 1,
    localRegistryOnly: true,
    githubRequired: false,
    externalPublishingRequested: false,
    immutableRelease: true,
    artifacts,
    baseline: {
      releaseLine: 'v3',
      version: VERSION,
      releaseIndexSha256: baseline.localReleaseIndexSha256
    }
  });
  writeJson(path.join(RELEASE_ROOT, 'rollback-manifest.json'), {
    schemaVersion: '3.1.0',
    system: 'SHEIKHA_NATIVE_DESKTOP_ROLLBACK_MANIFEST_V31',
    version: VERSION,
    immutableRelease: true,
    silentOverwriteAllowed: false,
    rollbackRequiresHumanApproval: true,
    previousRelease: `local-registry://releases/v3/${VERSION}`,
    previousReleaseIndexSha256: baseline.localReleaseIndexSha256,
    rollbackToPreInstallStateTested: installerLifecycle.rollbackToPreInstallStatePassed,
    restoreChecksumsFrom: 'SHA256SUMS'
  });
  fs.writeFileSync(
    path.join(RELEASE_ROOT, 'SHA256SUMS'),
    `${artifacts.map((artifact) => `${artifact.sha256}  ${artifact.relativePath}`).join('\n')}\n`,
    'utf8'
  );
  fs.writeFileSync(
    path.join(RELEASE_ROOT, 'MANIFEST.txt'),
    `${[
      ...artifacts.map((artifact) => artifact.relativePath),
      ...artifacts.flatMap((artifact) => [artifact.verification, artifact.sbom, artifact.provenance, artifact.metadata]),
      'native-evidence/native-execution-v31.json',
      'security-evidence/elf-hardening-v31.json',
      'security-evidence/native-shell-security-contract-v31.json',
      'installer-evidence/user-installer-lifecycle-v31.json',
      'rollback-evidence/rollback-to-preinstall-state-v31.json',
      'compatibility/compatibility-index.json',
      'release-index.json',
      'rollback-manifest.json',
      'SHA256SUMS'
    ].join('\n')}\n`,
    'utf8'
  );
  return {
    artifacts,
    elfInspection,
    nativeVerification,
    installerLifecycle,
    reproducibility: { passed: true, sha256: firstHash }
  };
}

function safeReleasePath(releaseRoot, relativePath) {
  const resolved = path.resolve(releaseRoot, relativePath);
  if (!resolved.startsWith(`${path.resolve(releaseRoot)}${path.sep}`)) {
    throw new Error(`V3.1 release path escaped root: ${relativePath}`);
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
  if (index.nativeVerifiedTargetCount !== 1 || index.desktopExecutableArtifactCount !== 1) {
    errors.push('native-target-count-invalid');
  }
  if (index.localRegistryOnly !== true || index.githubRequired !== false) errors.push('publication-policy-invalid');
  const names = new Set();
  const hashes = new Set();
  for (const artifact of artifacts) {
    if (names.has(artifact.name)) errors.push(`${artifact.artifactId}:duplicate-name`);
    if (hashes.has(artifact.sha256)) errors.push(`${artifact.artifactId}:duplicate-hash`);
    names.add(artifact.name);
    hashes.add(artifact.sha256);
    for (const key of ['relativePath', 'verification', 'sbom', 'provenance', 'metadata']) {
      if (!artifact[key] || !fs.existsSync(safeReleasePath(releaseRoot, artifact[key]))) {
        errors.push(`${artifact.artifactId}:${key}-missing`);
      }
    }
    const absolute = safeReleasePath(releaseRoot, artifact.relativePath);
    if (fs.existsSync(absolute)) {
      if (fs.statSync(absolute).size !== artifact.bytes) errors.push(`${artifact.artifactId}:size-mismatch`);
      if (sha256File(absolute) !== artifact.sha256) errors.push(`${artifact.artifactId}:checksum-mismatch`);
      if (artifact.artifactKind === 'ELF_NATIVE_EXECUTABLE' &&
          !/ELF 64-bit.*x86-64/iu.test(run('file', [absolute]).stdout)) {
        errors.push(`${artifact.artifactId}:elf-architecture-invalid`);
      }
      if (artifact.artifactKind === 'USER_PORTABLE_TAR_GZ' &&
          run('tar', ['-tzf', absolute], { allowFailure: true }).status !== 0) {
        errors.push(`${artifact.artifactId}:archive-invalid`);
      }
    }
  }
  for (const relativePath of [
    'rollback-manifest.json',
    'SHA256SUMS',
    'MANIFEST.txt',
    'native-evidence/native-execution-v31.json',
    'security-evidence/elf-hardening-v31.json',
    'installer-evidence/user-installer-lifecycle-v31.json',
    'rollback-evidence/rollback-to-preinstall-state-v31.json',
    'compatibility/compatibility-index.json'
  ]) {
    if (!fs.existsSync(path.join(releaseRoot, relativePath))) errors.push(`${relativePath}:missing`);
  }
  const rollback = readJsonOptional(path.join(releaseRoot, 'rollback-manifest.json'), {});
  if (rollback.silentOverwriteAllowed !== false || rollback.rollbackToPreInstallStateTested !== true) {
    errors.push('rollback-manifest-invalid');
  }
  const secretScan = scanStageForSecrets(releaseRoot);
  if (!secretScan.passed) errors.push('secret-scan-failed');
  return {
    valid: errors.length === 0,
    errors,
    artifactCount: artifacts.length,
    nativeVerifiedTargetCount: Number(index.nativeVerifiedTargetCount || 0),
    desktopExecutableArtifactCount: Number(index.desktopExecutableArtifactCount || 0),
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
  if (!preflight.valid) throw new Error(`V3.1 publication preflight failed: ${preflight.errors.join('; ')}`);
  const finalRoot = path.join(registryRoot, VERSION);
  const stagingRoot = path.join(registryRoot, `.staging-${VERSION}-${process.pid}`);
  if (fs.existsSync(finalRoot)) throw new Error(`V3.1 local release exists and will not be overwritten: ${finalRoot}`);
  fs.mkdirSync(registryRoot, { recursive: true });
  try {
    fs.cpSync(releaseRoot, stagingRoot, { recursive: true, dereference: false, errorOnExist: true });
    setPublicationState(stagingRoot);
    const staged = verifyReleaseTree(stagingRoot);
    if (!staged.valid) throw new Error(`V3.1 staged release invalid: ${staged.errors.join('; ')}`);
    fsyncTree(stagingRoot);
    fs.renameSync(stagingRoot, finalRoot);
    const final = verifyReleaseTree(finalRoot);
    if (!final.valid) throw new Error(`V3.1 published release invalid: ${final.errors.join('; ')}`);
    return { releaseRoot: finalRoot, verification: final };
  } catch (error) {
    if (fs.existsSync(stagingRoot)) fs.rmSync(stagingRoot, { recursive: true, force: true });
    throw error;
  }
}

function createDecision(inspection, buildResult = null) {
  return {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_NATIVE_DESKTOP_RUNTIME_DECISION_V2',
    status: buildResult ? 'NATIVE_VERIFIED' : inspection.status,
    generatedAt: new Date().toISOString(),
    supersedesDecision: 'runtime/desktop-runtime/v1/sheikha-desktop-runtime-decision-v1.json',
    selection: {
      selectedRuntime: 'DYNAMIC_GTK3_WEBKIT2GTK_RUNTIME_BINDING',
      reason: 'The installed x86_64 runtime exposes the required stable C ABI, allowing a small native shell without installing packages or adding Node to the native process.',
      developmentHeadersRequired: false,
      packagesInstalled: false,
      nativeBridgeExposed: false,
      loopbackOnly: true
    },
    measurements: buildResult ? {
      elfBytes: buildResult.artifacts.find((item) => item.artifactKind === 'ELF_NATIVE_EXECUTABLE').bytes,
      archiveBytes: buildResult.artifacts.find((item) => item.artifactKind === 'USER_PORTABLE_TAR_GZ').bytes,
      nativeSmokeDurationMs: buildResult.nativeVerification.nativeSmokeDurationMs,
      measuredElapsedSeconds: buildResult.nativeVerification.measuredElapsedSeconds,
      measuredPeakRssKB: buildResult.nativeVerification.measuredPeakRssKB,
      reproducibleSha256: buildResult.reproducibility.sha256,
      measuredLocally: true
    } : null,
    platformCoverage: {
      linuxX86_64: buildResult ? 'NATIVE_VERIFIED' : inspection.status,
      linuxAarch64: 'TOOLCHAIN_MISSING',
      linuxArmv7: 'TOOLCHAIN_MISSING',
      windowsX64: 'REQUIRES_NATIVE_RUNNER',
      windowsArm64: 'REQUIRES_NATIVE_RUNNER',
      macosX86_64: 'REQUIRES_NATIVE_RUNNER',
      macosArm64: 'REQUIRES_NATIVE_RUNNER'
    },
    boundaries: {
      windowsExeBuilt: false,
      macosDmgBuilt: false,
      armArtifactBuilt: false,
      signed: false,
      notarized: false,
      externalPublishing: false
    }
  };
}

function writeReports({ inspection, source, baseline, buildResult = null, verification = null, publication = null }) {
  const generatedAt = new Date().toISOString();
  const decision = createDecision(inspection, buildResult);
  const actualActivation = readJsonOptional(ACTUAL_ACTIVATION_EVIDENCE, null);
  const main = {
    schemaVersion: '3.1.0',
    system: SYSTEM,
    status: buildResult && verification?.valid ? 'NATIVE_VERIFIED' : inspection.status,
    generatedAt,
    releaseLine: RELEASE_LINE,
    sourceVersion: VERSION,
    sourceBaselineCommit: source.baselineCommit,
    baselineV3Status: baseline.status,
    builtTargetCount: buildResult ? 1 : 0,
    inspectedTargetCount: buildResult ? 1 : 0,
    verifiedTargetCount: buildResult ? 1 : 0,
    nativeVerifiedTargetCount: buildResult ? 1 : 0,
    artifactCount: buildResult?.artifacts.length || 0,
    desktopExecutableArtifactCount: buildResult ? 1 : 0,
    publishedLocallyCount: publication ? 2 : 0,
    publishedExternallyCount: 0,
    localReleasePath: publication?.releaseRoot || null,
    artifacts: buildResult?.artifacts || [],
    platformStates: decision.platformCoverage,
    measurements: decision.measurements,
    security: buildResult ? {
      pie: buildResult.elfInspection.pie,
      nxStack: buildResult.elfInspection.nxStack,
      relro: buildResult.elfInspection.relro,
      bindNow: buildResult.elfInspection.bindNow,
      stackCanary: buildResult.elfInspection.stackCanary,
      nativeBridgeExposed: false,
      remoteUrlDenied: buildResult.nativeVerification.remoteUrlDenied
    } : null,
    installer: buildResult ? {
      userInstallVerified: buildResult.installerLifecycle.installedLaunchPassed,
      uninstallVerified: buildResult.installerLifecycle.uninstallPassed,
      rollbackVerified: buildResult.installerLifecycle.rollbackToPreInstallStatePassed,
      actualUserHomeModified: false,
      systemInstallerBuilt: false
    } : null,
    actualUserActivation: actualActivation,
    governance: {
      localRegistryOnly: true,
      githubRequired: false,
      sudoUsed: false,
      packagesInstalled: false,
      signingPerformed: false,
      notarizationPerformed: false,
      externalPublishingPerformed: false,
      humanFinalDecision: true,
      aiCanAuthorize: false
    },
    limitations: [
      'Native verification is complete only for Linux x86_64 on the measured host runtime.',
      'The shell requires the GTK3 and WebKit2GTK 4.0 runtime libraries recorded in the SBOM.',
      'Linux ARM, Windows, and macOS remain architecture-correct native-runner work.',
      'No signing, notarization, system-wide installation, or external publication was performed.'
    ],
    reports: {
      decision: path.relative(ROOT, DECISION_REPORT),
      nativeVerification: path.relative(ROOT, NATIVE_REPORT),
      installerLifecycle: path.relative(ROOT, INSTALLER_REPORT),
      securityHardening: path.relative(ROOT, SECURITY_REPORT),
      actualUserActivation: actualActivation ? path.relative(ROOT, ACTUAL_ACTIVATION_EVIDENCE) : null
    }
  };
  writeJson(DECISION_REPORT, decision);
  writeJson(NATIVE_REPORT, buildResult ? {
    schemaVersion: '3.1.0',
    system: 'SHEIKHA_NATIVE_DESKTOP_VERIFICATION_V31',
    status: 'NATIVE_VERIFIED',
    artifacts: buildResult.artifacts,
    reproducibility: buildResult.reproducibility,
    nativeExecution: buildResult.nativeVerification
  } : {
    schemaVersion: '3.1.0',
    system: 'SHEIKHA_NATIVE_DESKTOP_VERIFICATION_V31',
    status: inspection.status,
    artifacts: []
  });
  writeJson(INSTALLER_REPORT, buildResult ? buildResult.installerLifecycle : {
    schemaVersion: '3.1.0',
    status: 'DECLARED',
    userInstallerTested: false
  });
  writeJson(SECURITY_REPORT, buildResult ? {
    schemaVersion: '3.1.0',
    system: 'SHEIKHA_NATIVE_DESKTOP_SECURITY_HARDENING_V31',
    status: 'NATIVE_VERIFIED',
    elf: buildResult.elfInspection,
    contract: readJson(SECURITY_CONTRACT_PATH),
    remoteUrlDenied: buildResult.nativeVerification.remoteUrlDenied
  } : {
    schemaVersion: '3.1.0',
    system: 'SHEIKHA_NATIVE_DESKTOP_SECURITY_HARDENING_V31',
    status: inspection.status,
    contract: readJson(SECURITY_CONTRACT_PATH)
  });
  writeJson(path.join(EVIDENCE_ROOT, 'runtime-inspection-v31.json'), inspection);
  writeJson(path.join(EVIDENCE_ROOT, 'v3-baseline-integrity-v31.json'), baseline);
  writeJson(path.join(EVIDENCE_ROOT, 'release-tree-verification-v31.json'), verification || {
    valid: false,
    status: 'NOT_BUILT',
    errors: ['release-not-built']
  });
  writeJson(MAIN_REPORT, main);
  return main;
}

function execute(action = 'status', options = {}) {
  if (action === 'status' && fs.existsSync(MAIN_REPORT)) {
    return { action, report: readJson(MAIN_REPORT) };
  }
  if (action === 'verify') {
    const verification = verifyReleaseTree(options.releaseRoot || RELEASE_ROOT);
    if (!verification.valid) throw new Error(`V3.1 verification failed: ${verification.errors.join('; ')}`);
    return { action, verification, report: readJsonOptional(MAIN_REPORT, null) };
  }
  const inspection = inspectRuntime();
  const source = sourceIdentity();
  const baseline = baselineIntegrity();
  if (action === 'inspect') {
    const existingVerification = fs.existsSync(path.join(RELEASE_ROOT, 'release-index.json'))
      ? verifyReleaseTree(RELEASE_ROOT)
      : null;
    const report = writeReports({ inspection, source, baseline, verification: existingVerification });
    return { action, inspection, source, baseline, report, verification: existingVerification };
  }
  if (!['build', 'refresh', 'release-local'].includes(action)) {
    throw new Error(`Unknown V3.1 action: ${action}`);
  }
  let buildResult;
  if (fs.existsSync(path.join(RELEASE_ROOT, 'release-index.json'))) {
    const verification = verifyReleaseTree(RELEASE_ROOT);
    if (!verification.valid) throw new Error(`Existing V3.1 release invalid: ${verification.errors.join('; ')}`);
    buildResult = {
      artifacts: verification.index.artifacts,
      elfInspection: readJson(path.join(RELEASE_ROOT, 'security-evidence', 'elf-hardening-v31.json')),
      nativeVerification: readJson(path.join(RELEASE_ROOT, 'native-evidence', 'native-execution-v31.json')),
      installerLifecycle: readJson(path.join(RELEASE_ROOT, 'installer-evidence', 'user-installer-lifecycle-v31.json')),
      reproducibility: {
        passed: true,
        sha256: verification.index.artifacts.find((item) => item.artifactKind === 'ELF_NATIVE_EXECUTABLE').sha256
      }
    };
  } else {
    buildResult = buildRelease(inspection, source, baseline);
  }
  const verification = verifyReleaseTree(RELEASE_ROOT);
  if (!verification.valid) throw new Error(`Built V3.1 release invalid: ${verification.errors.join('; ')}`);
  const localReleaseRoot = path.join(options.registryRoot || LOCAL_REGISTRY_ROOT, VERSION);
  const publication = action === 'release-local'
    ? publishAtomic(RELEASE_ROOT, options.registryRoot || LOCAL_REGISTRY_ROOT)
    : action === 'refresh' && fs.existsSync(localReleaseRoot)
      ? { releaseRoot: localReleaseRoot, verification: verifyReleaseTree(localReleaseRoot) }
      : null;
  const report = writeReports({ inspection, source, baseline, buildResult, verification, publication });
  return { action, inspection, source, baseline, buildResult, verification, publication, report };
}

function commandSummary(result) {
  const report = result.report || {};
  return {
    system: SYSTEM,
    action: result.action,
    status: report.status || (result.verification?.valid ? 'NATIVE_VERIFIED' : 'DECLARED'),
    releaseLine: report.releaseLine || RELEASE_LINE,
    sourceVersion: report.sourceVersion || VERSION,
    builtTargetCount: Number(report.builtTargetCount || 0),
    verifiedTargetCount: Number(report.verifiedTargetCount || 0),
    nativeVerifiedTargetCount: Number(report.nativeVerifiedTargetCount || 0),
    artifactCount: Number(report.artifactCount || result.verification?.artifactCount || 0),
    desktopExecutableArtifactCount: Number(report.desktopExecutableArtifactCount || 0),
    publishedLocallyCount: Number(report.publishedLocallyCount || 0),
    localReleasePath: report.localReleasePath || null,
    platformStates: report.platformStates || null,
    githubRequired: false,
    externalPublishingPerformed: false,
    reports: report.reports || null
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
  DECISION_REPORT,
  MAIN_REPORT,
  RELEASE_LINE,
  RELEASE_ROOT,
  SYSTEM,
  VERSION,
  baselineIntegrity,
  buildRelease,
  commandSummary,
  execute,
  inspectElf,
  inspectRuntime,
  publishAtomic,
  runNativeVerification,
  verifyReleaseTree
};
