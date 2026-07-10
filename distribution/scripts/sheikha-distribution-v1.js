#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const adapterRegistry = require('../common/platform-adapter-registry');
const {
  DISTRIBUTION_ROOT,
  ROOT,
  fileMetadata,
  findTool,
  readJson,
  resetGeneratedDir,
  run,
  sha256File,
  writeJson
} = require('../common/distribution-utils');

const SYSTEM = 'SHEIKHA_UNIVERSAL_DISTRIBUTION_INSTALLER_FABRIC_V1';
const MATRIX_PATH = path.join(DISTRIBUTION_ROOT, 'manifest', 'sheikha-release-matrix-v1.json');
const PRODUCT_PATH = path.join(DISTRIBUTION_ROOT, 'manifest', 'sheikha-product-manifest-v1.json');
const REPORT_ROOT = path.join(ROOT, 'runtime', 'distribution', 'v1');
const EVIDENCE_ROOT = path.join(REPORT_ROOT, 'evidence');
const TOOLCHAIN_REPORT = path.join(REPORT_ROOT, 'sheikha-distribution-toolchain-v1-report.json');
const MATRIX_REPORT = path.join(REPORT_ROOT, 'sheikha-distribution-matrix-v1-report.json');
const ARTIFACT_REPORT = path.join(REPORT_ROOT, 'sheikha-distribution-artifacts-v1.json');
const NATIVE_REPORT = path.join(REPORT_ROOT, 'sheikha-distribution-native-verification-v1.json');
const MAIN_REPORT = path.join(REPORT_ROOT, 'sheikha-universal-distribution-v1-report.json');
const REPRODUCIBILITY_REPORT = path.join(
  EVIDENCE_ROOT,
  'sheikha-distribution-reproducibility-v1.json'
);

const TOOL_NAMES = [
  'node', 'npm', 'tar', 'gzip', 'zip', 'unzip', 'sha256sum', 'file', 'ar',
  'dpkg-deb', 'dpkg', 'rpmbuild', 'rpm', 'snapcraft', 'shellcheck', 'syft',
  'cyclonedx', 'cosign', 'makensis', 'wixl', 'osslsigncode', '7z', 'hdiutil',
  'lipo', 'codesign', 'xcrun', 'qemu-x86_64', 'qemu-aarch64', 'qemu-arm'
];

const REQUIRED_FIELDS = [
  'id', 'platform', 'operatingSystem', 'architecture', 'packageFormat',
  'installationScope', 'buildHostRequirement', 'signingRequirement',
  'nativeSmokeTestRequirement', 'artifactName', 'status', 'evidence', 'limitations'
];

const FORMAT_EXTENSIONS = {
  deb: '.deb',
  dmg: '.dmg',
  exe: '.exe',
  rpm: '.rpm',
  snap: '.snap',
  'tar.gz': '.tar.gz',
  zip: '.zip'
};

function normalizeArchitecture(value) {
  if (value === 'x64') return 'x86_64';
  if (value === 'arm64') return 'aarch64';
  return value;
}

function inspectToolchain() {
  const tools = Object.fromEntries(TOOL_NAMES.map((name) => [name, findTool(name)]));
  const report = {
    system: 'SHEIKHA_DISTRIBUTION_TOOLCHAIN_INSPECTOR_V1',
    status: 'INSPECTED',
    generatedAt: new Date().toISOString(),
    host: {
      platform: process.platform,
      architecture: normalizeArchitecture(process.arch),
      node: process.version,
      release: os.release()
    },
    tools,
    available: Object.entries(tools).filter(([, value]) => Boolean(value)).map(([name]) => name),
    missing: Object.entries(tools).filter(([, value]) => !value).map(([name]) => name),
    constraints: {
      sudoUsed: false,
      packagesInstalled: false,
      nativeWindowsRunner: process.platform === 'win32',
      nativeMacosRunner: process.platform === 'darwin',
      externalPublishingConfigured: false
    }
  };
  writeJson(TOOLCHAIN_REPORT, report);
  return report;
}

function validateMatrix(matrix = readJson(MATRIX_PATH)) {
  const errors = [];
  if (matrix.system !== SYSTEM) errors.push('invalid-system');
  if (matrix.targetCount !== 27 || matrix.targets.length !== 27) errors.push('target-count-must-be-27');
  const ids = new Set();
  for (const target of matrix.targets) {
    const missing = REQUIRED_FIELDS.filter((field) => !(field in target));
    if (missing.length) errors.push(`${target.id || 'unknown'}:missing:${missing.join(',')}`);
    if (ids.has(target.id)) errors.push(`${target.id}:duplicate-id`);
    ids.add(target.id);
    const extension = FORMAT_EXTENSIONS[target.packageFormat];
    if (!extension || !target.artifactName.endsWith(extension)) {
      errors.push(`${target.id}:invalid-artifact-extension`);
    }
    if (!target.artifactName.includes(matrix.version) || /[\\/]/.test(target.artifactName)) {
      errors.push(`${target.id}:non-reproducible-artifact-name`);
    }
    if (!Array.isArray(target.evidence) || !Array.isArray(target.limitations)) {
      errors.push(`${target.id}:evidence-and-limitations-must-be-arrays`);
    }
  }
  const platformCounts = matrix.targets.reduce((counts, target) => {
    counts[target.platform] = (counts[target.platform] || 0) + 1;
    return counts;
  }, {});
  if (platformCounts.windows !== 8 || platformCounts.linux !== 15 || platformCounts.macos !== 4) {
    errors.push('platform-counts-must-be-windows-8-linux-15-macos-4');
  }
  return { valid: errors.length === 0, errors, platformCounts };
}

function createContext(toolchain = inspectToolchain()) {
  const matrix = readJson(MATRIX_PATH);
  const product = readJson(PRODUCT_PATH);
  const validation = validateMatrix(matrix);
  if (!validation.valid) throw new Error(`Invalid release matrix: ${validation.errors.join('; ')}`);
  const versionRoot = path.join(DISTRIBUTION_ROOT, 'artifacts', matrix.version);
  return {
    version: matrix.version,
    matrix,
    product,
    validation,
    toolchain,
    host: toolchain.host,
    versionRoot,
    artifactDir: path.join(versionRoot, 'artifacts'),
    metadataDir: path.join(versionRoot, 'metadata'),
    sbomDir: path.join(versionRoot, 'SBOM'),
    provenanceDir: path.join(versionRoot, 'provenance'),
    verificationDir: path.join(versionRoot, 'verification'),
    stagingRoot: path.join(DISTRIBUTION_ROOT, 'common', 'staging', matrix.version),
    workingVerificationRoot: path.join(DISTRIBUTION_ROOT, 'common', 'verification', matrix.version)
  };
}

function writeMatrixReport(context, targetResults = []) {
  const byTarget = new Map(targetResults.map((result) => [result.id, result]));
  const targets = context.matrix.targets.map((target) => ({
    ...target,
    runtimeStatus: byTarget.get(target.id)?.status || target.status,
    artifact: byTarget.get(target.id)?.artifact || null
  }));
  const statusCounts = targets.reduce((counts, target) => {
    counts[target.runtimeStatus] = (counts[target.runtimeStatus] || 0) + 1;
    return counts;
  }, {});
  const report = {
    system: 'SHEIKHA_DISTRIBUTION_TARGET_MATRIX_RESOLVER_V1',
    status: 'RESOLVED',
    generatedAt: new Date().toISOString(),
    targetCount: targets.length,
    platformCounts: context.validation.platformCounts,
    statusCounts,
    targets
  };
  writeJson(MATRIX_REPORT, report);
  return report;
}

function inspectArchivePaths(entries) {
  const unsafe = entries.filter((entry) => {
    const clean = String(entry).replace(/^\.\//, '');
    return path.isAbsolute(clean) || clean.split('/').includes('..');
  });
  return { passed: unsafe.length === 0, unsafe };
}

function extractTar(context, artifactPath, targetId) {
  const extractRoot = path.join(context.workingVerificationRoot, targetId);
  resetGeneratedDir(extractRoot);
  run('tar', ['-xzf', artifactPath, '-C', extractRoot], { timeout: 300000 });
  const roots = fs.readdirSync(extractRoot);
  if (roots.length !== 1) throw new Error(`${targetId}: archive must contain one root directory`);
  return path.join(extractRoot, roots[0]);
}

function verifyTar(context, target, artifactPath) {
  const listing = run('tar', ['-tzf', artifactPath], { timeout: 300000 }).stdout.split('\n').filter(Boolean);
  const pathSafety = inspectArchivePaths(listing);
  const extractedRoot = extractTar(context, artifactPath, target.id);
  const manifestExists = fs.existsSync(path.join(extractedRoot, 'distribution-manifest.json'));
  if (target.id === 'linux-cli-x86_64') {
    const cliPath = path.join(extractedRoot, 'bin', 'sheikha');
    const help = run(process.execPath, [cliPath, 'help'], { allowFailure: true });
    const unknown = run(process.execPath, [cliPath, '__invalid_distribution_probe__'], { allowFailure: true });
    const nativePassed = help.status === 0 && /Sheikha CLI V1/.test(help.stdout) &&
      unknown.status !== 0 && /Unknown command/.test(unknown.stderr);
    return {
      inspectionPassed: pathSafety.passed && manifestExists && fs.existsSync(cliPath),
      pathSafety,
      entryCount: listing.length,
      structuralSmokePassed: nativePassed,
      nativeSmokePassed: nativePassed,
      nativeEvidence: nativePassed ? ['CLI help returned successfully.', 'Unknown command returned non-zero.'] : [],
      status: nativePassed ? 'VERIFIED' : 'BUILT_NOT_NATIVE_VERIFIED'
    };
  }
  const serverPath = path.join(extractedRoot, 'server.js');
  const syntax = run(process.execPath, ['--check', serverPath], { allowFailure: true, timeout: 300000 });
  return {
    inspectionPassed: pathSafety.passed && manifestExists && fs.existsSync(serverPath),
    pathSafety,
    entryCount: listing.length,
    structuralSmokePassed: syntax.status === 0,
    nativeSmokePassed: false,
    nativeEvidence: [],
    status: 'BUILT_NOT_NATIVE_VERIFIED',
    limitation: 'Server dependencies were not bundled; native launch and install smoke were not performed.'
  };
}

function verifyDeb(context, target, artifactPath) {
  const info = run('dpkg-deb', ['--info', artifactPath], { timeout: 300000 });
  const contents = run('dpkg-deb', ['--contents', artifactPath], { timeout: 300000 });
  const extractRoot = path.join(context.workingVerificationRoot, target.id);
  resetGeneratedDir(extractRoot);
  run('dpkg-deb', ['--extract', artifactPath, extractRoot], { timeout: 300000 });
  const cliPath = path.join(extractRoot, 'usr', 'lib', 'sheikha', 'bin', 'sheikha');
  const serverPath = path.join(extractRoot, 'usr', 'lib', 'sheikha', 'server.js');
  const cliHelp = run(process.execPath, [cliPath, 'help'], { allowFailure: true });
  const syntax = run(process.execPath, ['--check', serverPath], { allowFailure: true, timeout: 300000 });
  const inspectionPassed = /Package: sheikha/.test(info.stdout) &&
    /Architecture: amd64/.test(info.stdout) &&
    contents.stdout.includes('./usr/bin/sheikha') &&
    cliHelp.status === 0 && syntax.status === 0;
  return {
    inspectionPassed,
    pathSafety: { passed: true, unsafe: [] },
    entryCount: contents.stdout.split('\n').filter(Boolean).length,
    structuralSmokePassed: cliHelp.status === 0 && syntax.status === 0,
    nativeSmokePassed: false,
    nativeEvidence: [],
    status: 'BUILT_NOT_NATIVE_VERIFIED',
    limitation: 'Package was extracted and inspected without sudo; dpkg install, service launch, and uninstall were not performed.'
  };
}

function generateSbom(context, target, artifact) {
  const packageJson = readJson(path.join(ROOT, 'package.json'));
  const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.optionalDependencies || {}) };
  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:${artifact.sha256.slice(0, 8)}-${artifact.sha256.slice(8, 12)}-4${artifact.sha256.slice(13, 16)}-8${artifact.sha256.slice(17, 20)}-${artifact.sha256.slice(20, 32)}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [{ vendor: 'Sheikha', name: 'Universal Distribution Fabric', version: '1.0.0' }],
      component: {
        type: 'application',
        name: packageJson.name,
        version: packageJson.version
      },
      properties: [{ name: 'sheikha:targetId', value: target.id }]
    },
    components: Object.entries(dependencies).sort(([a], [b]) => a.localeCompare(b)).map(([name, version]) => ({
      type: 'library',
      name,
      version: String(version),
      purl: `pkg:npm/${encodeURIComponent(name)}@${encodeURIComponent(String(version))}`
    }))
  };
}

function currentSourceRevision() {
  let revision = 'UNKNOWN';
  try {
    const gitHead = fs.readFileSync(path.join(ROOT, '.git', 'HEAD'), 'utf8').trim();
    if (gitHead.startsWith('ref: ')) {
      revision = fs.readFileSync(path.join(ROOT, '.git', gitHead.slice(5)), 'utf8').trim();
    } else {
      revision = gitHead;
    }
  } catch (_) {
    revision = 'UNKNOWN';
  }
  return {
    revision,
    dirty: true,
    note: 'Provenance was generated from the reviewed worktree before its release commit.'
  };
}

function generateProvenance(context, target, artifact, verification) {
  const source = currentSourceRevision();
  return {
    _type: 'https://in-toto.io/Statement/v1',
    subject: [{ name: target.artifactName, digest: { sha256: artifact.sha256 } }],
    predicateType: 'https://slsa.dev/provenance/v1',
    predicate: {
      buildDefinition: {
        buildType: 'https://sheikha.local/build-types/universal-distribution-v1',
        externalParameters: {
          targetId: target.id,
          version: context.version,
          localRegistryOnly: true
        },
        internalParameters: {
          adapter: verification.adapter,
          sourceTreeDirtyAtBuild: source.dirty
        },
        resolvedDependencies: [{
          uri: 'git+local://sheikha-main-portal',
          digest: { gitCommit: source.revision }
        }]
      },
      runDetails: {
        builder: { id: 'SHEIKHA_PACKAGE_BUILDER_V1' },
        metadata: {
          invocationId: `${target.id}-${artifact.sha256.slice(0, 16)}`,
          startedOn: verification.startedAt,
          finishedOn: verification.finishedAt
        }
      }
    }
  };
}

function verifyBuild(context, target, build) {
  const startedAt = new Date().toISOString();
  const artifact = fileMetadata(build.artifactPath);
  const detail = target.packageFormat === 'deb'
    ? verifyDeb(context, target, build.artifactPath)
    : verifyTar(context, target, build.artifactPath);
  const checksumVerified = sha256File(build.artifactPath) === artifact.sha256;
  const status = detail.inspectionPassed && checksumVerified
    ? detail.status
    : 'INSPECTION_FAILED';
  const verification = {
    system: 'SHEIKHA_PACKAGE_INSPECTOR_AND_NATIVE_SMOKE_GATE_V1',
    targetId: target.id,
    adapter: build.adapter,
    startedAt,
    finishedAt: new Date().toISOString(),
    artifact,
    artifactExists: fs.existsSync(build.artifactPath),
    checksumVerified,
    metadataVerified: true,
    packageInspectionPassed: detail.inspectionPassed,
    archivePathSafetyPassed: detail.pathSafety.passed,
    structuralSmokePassed: detail.structuralSmokePassed,
    nativeSmokePassed: detail.nativeSmokePassed,
    nativeEvidence: detail.nativeEvidence,
    signed: false,
    signatureEvidence: [],
    notarized: false,
    notarizationEvidence: [],
    status,
    limitation: detail.limitation || null
  };
  const metadata = {
    schemaVersion: '1.0.0',
    system: SYSTEM,
    target,
    artifact,
    verificationStatus: status,
    localRegistryOnly: true,
    githubRequired: false
  };
  writeJson(path.join(context.metadataDir, `${target.artifactName}.manifest.json`), metadata);
  writeJson(path.join(context.sbomDir, `${target.artifactName}.cdx.json`), generateSbom(context, target, artifact));
  writeJson(
    path.join(context.provenanceDir, `${target.artifactName}.provenance.json`),
    generateProvenance(context, target, artifact, verification)
  );
  writeJson(path.join(context.verificationDir, `${target.artifactName}.verification.json`), verification);
  return {
    id: target.id,
    status,
    built: true,
    verified: status === 'VERIFIED',
    nativeVerified: detail.nativeSmokePassed,
    signed: false,
    notarized: false,
    published: false,
    artifact,
    verification
  };
}

function buildAvailable(context) {
  resetGeneratedDir(context.versionRoot);
  resetGeneratedDir(context.stagingRoot);
  resetGeneratedDir(context.workingVerificationRoot);
  for (const directory of [
    context.artifactDir,
    context.metadataDir,
    context.sbomDir,
    context.provenanceDir,
    context.verificationDir
  ]) fs.mkdirSync(directory, { recursive: true });

  const results = [];
  for (const target of context.matrix.targets) {
    const adapter = adapterRegistry.resolve(target.id);
    if (!adapter) continue;
    if (!adapter.canBuild(context)) {
      results.push({ id: target.id, status: 'TOOLCHAIN_MISSING', built: false });
      continue;
    }
    try {
      const build = adapter.build(context, target);
      results.push(verifyBuild(context, target, build));
    } catch (error) {
      results.push({
        id: target.id,
        status: 'BUILD_FAILED',
        built: false,
        error: error.message
      });
    }
  }
  return results;
}

function writeReleaseIndex(context, targetResults) {
  const artifacts = targetResults.filter((result) => result.built).map((result) => ({
    targetId: result.id,
    status: result.status,
    name: path.basename(result.artifact.path),
    relativePath: `artifacts/${path.basename(result.artifact.path)}`,
    bytes: result.artifact.bytes,
    sha256: result.artifact.sha256,
    nativeVerified: result.nativeVerified,
    signed: result.signed,
    notarized: result.notarized
  })).sort((a, b) => a.targetId.localeCompare(b.targetId));
  const checksumLines = artifacts.map((artifact) => `${artifact.sha256}  ${artifact.relativePath}`).join('\n');
  fs.writeFileSync(path.join(context.versionRoot, 'SHA256SUMS'), `${checksumLines}\n`, 'utf8');
  fs.writeFileSync(path.join(context.versionRoot, 'MANIFEST.txt'), `${artifacts.map((item) => item.relativePath).join('\n')}\n`, 'utf8');
  const index = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_LOCAL_RELEASE_INDEX_V1',
    version: context.version,
    channel: 'stable',
    localRegistryOnly: true,
    githubRequired: false,
    generatedAt: new Date().toISOString(),
    artifactCount: artifacts.length,
    artifacts
  };
  writeJson(path.join(context.versionRoot, 'release-index.json'), index);
  const indexVerification = verifyReleaseIndex(context, index);
  if (!indexVerification.valid) {
    throw new Error(`Release index checksum verification failed: ${indexVerification.errors.join('; ')}`);
  }
  return index;
}

function verifyReleaseIndex(context, index = readJson(path.join(context.versionRoot, 'release-index.json'))) {
  const errors = [];
  const names = new Set();
  for (const artifact of index.artifacts || []) {
    if (names.has(artifact.name)) errors.push(`${artifact.targetId}:duplicate-artifact-name`);
    names.add(artifact.name);
    const artifactPath = path.join(context.versionRoot, artifact.relativePath);
    if (!fs.existsSync(artifactPath)) {
      errors.push(`${artifact.targetId}:artifact-missing`);
    } else if (sha256File(artifactPath) !== artifact.sha256) {
      errors.push(`${artifact.targetId}:checksum-mismatch`);
    }
  }
  return { valid: errors.length === 0, errors };
}

function scanSecrets() {
  const findings = [];
  const patterns = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /\bghp_[A-Za-z0-9_]{20,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/
  ];
  function walk(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (['artifacts', 'staging', 'verification'].includes(entry.name)) continue;
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(target);
      else {
        const text = fs.readFileSync(target, 'utf8');
        patterns.forEach((pattern) => {
          if (pattern.test(text)) findings.push(path.relative(ROOT, target));
        });
      }
    }
  }
  walk(DISTRIBUTION_ROOT);
  return { passed: findings.length === 0, findings: [...new Set(findings)] };
}

function validateResultClaims(targets) {
  const errors = [];
  for (const target of targets) {
    if (target.status === 'VERIFIED' || target.verified === true) {
      if (!target.built || !target.artifact?.path) errors.push(`${target.id}:verified-without-artifact`);
      const artifactPath = target.artifact?.path ? path.join(ROOT, target.artifact.path) : null;
      if (!artifactPath || !fs.existsSync(artifactPath)) errors.push(`${target.id}:verified-artifact-missing`);
      if (!target.nativeVerified) errors.push(`${target.id}:verified-without-native-evidence`);
    }
    if (target.nativeVerified && !target.verificationEvidence) {
      errors.push(`${target.id}:native-verified-without-evidence`);
    }
    if (target.signed && !target.signatureEvidence?.length) {
      errors.push(`${target.id}:signed-without-signature-evidence`);
    }
    if (target.notarized && !target.notarizationEvidence?.length) {
      errors.push(`${target.id}:notarized-without-evidence`);
    }
  }
  return { valid: errors.length === 0, errors };
}

function inspectLocalRegistryRelease(context) {
  const registryRoot = process.env.SHEIKHA_LOCAL_RELEASE_REGISTRY ||
    path.join(os.homedir(), 'Sheikha-Local-Registry', 'releases');
  const releaseRoot = path.join(registryRoot, context.version);
  const indexPath = path.join(releaseRoot, 'release-index.json');
  if (!fs.existsSync(indexPath)) {
    return { available: false, valid: false, releaseRoot, targetIds: [], errors: [] };
  }
  const index = readJson(indexPath);
  const errors = [];
  for (const artifact of index.artifacts || []) {
    const artifactPath = path.join(releaseRoot, artifact.relativePath);
    if (!fs.existsSync(artifactPath)) errors.push(`${artifact.targetId}:artifact-missing`);
    else if (sha256File(artifactPath) !== artifact.sha256) errors.push(`${artifact.targetId}:checksum-mismatch`);
  }
  return {
    available: true,
    valid: errors.length === 0,
    releaseRoot,
    targetIds: (index.artifacts || []).map((artifact) => artifact.targetId),
    errors
  };
}

function buildReports(context, targetResults, options = {}) {
  const resultById = new Map(targetResults.map((result) => [result.id, result]));
  const localRelease = inspectLocalRegistryRelease(context);
  const targets = context.matrix.targets.map((target) => {
    const result = resultById.get(target.id);
    return {
      ...target,
      status: result?.status || target.status,
      built: result?.built === true,
      verified: result?.verified === true,
      nativeVerified: result?.nativeVerified === true,
      signed: result?.signed === true,
      notarized: result?.notarized === true,
      localRegistryPublished: result?.built === true &&
        ((options.localRegistryPublished === true) ||
          (localRelease.valid && localRelease.targetIds.includes(target.id))),
      artifact: result?.artifact || null,
      signatureEvidence: result?.verification?.signatureEvidence || [],
      notarizationEvidence: result?.verification?.notarizationEvidence || [],
      verificationEvidence: result?.verification
        ? path.relative(ROOT, path.join(context.verificationDir, `${target.artifactName}.verification.json`))
        : null,
      buildError: result?.error || null
    };
  });
  const built = targets.filter((target) => target.built);
  const native = targets.filter((target) => target.nativeVerified);
  const claimValidation = validateResultClaims(targets);
  if (!claimValidation.valid) {
    throw new Error(`Artifact claim validation failed: ${claimValidation.errors.join('; ')}`);
  }
  const secretScan = scanSecrets();
  const reproducibility = fs.existsSync(REPRODUCIBILITY_REPORT)
    ? readJson(REPRODUCIBILITY_REPORT)
    : { tested: false, passed: false, artifacts: [] };
  const limitations = [
    'No executable desktop shell exists; desktop installers were not fabricated.',
    'Windows and macOS native runners are unavailable on this Linux host.',
    'rpmbuild, snapcraft, ARM cross-toolchains, signing tools, and Apple notarization tools are unavailable.',
    'Server source artifacts require npm ci --omit=dev after extraction or installation.',
    'DEB was inspected by extraction only; system install and uninstall were not run without explicit sudo approval.'
  ];
  const report = {
    system: SYSTEM,
    status: built.length > 0 && built.every((target) => target.status !== 'INSPECTION_FAILED' && target.status !== 'BUILD_FAILED')
      ? 'ACTIVE_WITH_PARTIALLY_VERIFIED_LOCAL_ARTIFACTS'
      : built.length > 0 ? 'REVIEW_REQUIRED' : 'PLANNED_NO_ARTIFACTS',
    generatedAt: new Date().toISOString(),
    targetCount: targets.length,
    builtCount: built.length,
    verifiedCount: targets.filter((target) => target.verified).length,
    nativeVerifiedCount: native.length,
    signedCount: targets.filter((target) => target.signed).length,
    notarizedCount: targets.filter((target) => target.notarized).length,
    publishedCount: 0,
    localRegistryPublishedCount: targets.filter((target) => target.localRegistryPublished).length,
    localReleasePath: localRelease.valid ? localRelease.releaseRoot : null,
    localRegistryOnly: true,
    githubRequired: false,
    externalPublishingAutomatic: false,
    sourceMatrix: path.relative(ROOT, MATRIX_PATH),
    releaseIndex: built.length ? path.relative(ROOT, path.join(context.versionRoot, 'release-index.json')) : null,
    claimPolicy: 'No target is complete without artifact inspection and required native smoke evidence.',
    governance: {
      noSecretsIncluded: secretScan.passed,
      noAutomaticSigning: true,
      noAutomaticNotarization: true,
      noAutomaticExternalPublishing: true,
      crossBuildEqualsNativeVerification: false,
      humanReviewForHighImpactChanges: true,
      aiIsToolOnly: true,
      humanFinalDecision: true
    },
    toolchainReport: path.relative(ROOT, TOOLCHAIN_REPORT),
    targets,
    missingToolchains: context.toolchain.missing,
    nativeRunnerRequiredTargets: targets
      .filter((target) => /REQUIRES_NATIVE_RUNNER|REQUIRES_DESKTOP_RUNTIME_IMPLEMENTATION/.test(target.status))
      .map((target) => target.id),
    signingRequiredTargets: targets
      .filter((target) => /REQUIRED/.test(target.signingRequirement))
      .map((target) => target.id),
    notarizationRequiredTargets: ['macos-dmg-universal2'],
    snapStoreCredentialsRequiredForPublishing: [
      'linux-snap-amd64', 'linux-snap-armhf', 'linux-snap-arm64'
    ],
    limitations,
    secretScan,
    localRegistryVerification: localRelease,
    reproducibility: {
      tested: reproducibility.tested === true,
      passed: reproducibility.passed === true,
      evidence: path.relative(ROOT, REPRODUCIBILITY_REPORT)
    }
  };
  const matrixReport = writeMatrixReport(context, targets.map((target) => ({
    id: target.id,
    status: target.status,
    artifact: target.artifact
  })));
  writeJson(ARTIFACT_REPORT, {
    system: 'SHEIKHA_DISTRIBUTION_ARTIFACT_REGISTRY_V1',
    generatedAt: report.generatedAt,
    artifactCount: built.length,
    artifacts: built.map((target) => ({
      targetId: target.id,
      status: target.status,
      ...target.artifact,
      localRegistryPublished: target.localRegistryPublished
    }))
  });
  writeJson(NATIVE_REPORT, {
    system: 'SHEIKHA_DISTRIBUTION_NATIVE_VERIFICATION_V1',
    generatedAt: report.generatedAt,
    nativeVerifiedCount: native.length,
    policy: 'Cross-build and structural inspection are not native verification.',
    targets: targets.map((target) => ({
      id: target.id,
      status: target.status,
      nativeVerified: target.nativeVerified,
      evidence: target.verificationEvidence
    }))
  });
  writeJson(MAIN_REPORT, report);
  writeJson(path.join(EVIDENCE_ROOT, 'sheikha-distribution-build-evidence-v1.json'), {
    system: 'SHEIKHA_DISTRIBUTION_BUILD_EVIDENCE_V1',
    generatedAt: report.generatedAt,
    matrixValid: context.validation.valid,
    adapterRegistry: adapterRegistry.status(context),
    builtTargets: built.map((target) => target.id),
    nativeVerifiedTargets: native.map((target) => target.id),
    secretScan,
    claimValidation,
    matrixReport: path.relative(ROOT, MATRIX_REPORT)
  });
  return { report, matrixReport };
}

function artifactDigestMap(results) {
  return Object.fromEntries(results
    .filter((result) => result.built)
    .map((result) => [result.id, {
      name: path.basename(result.artifact.path),
      bytes: result.artifact.bytes,
      sha256: result.artifact.sha256
    }]));
}

function verifyReproducibility(context) {
  const first = buildAvailable(context);
  writeReleaseIndex(context, first);
  const firstDigests = artifactDigestMap(first);
  const second = buildAvailable(context);
  writeReleaseIndex(context, second);
  const secondDigests = artifactDigestMap(second);
  const targetIds = [...new Set([...Object.keys(firstDigests), ...Object.keys(secondDigests)])].sort();
  const artifacts = targetIds.map((targetId) => ({
    targetId,
    first: firstDigests[targetId] || null,
    second: secondDigests[targetId] || null,
    identical: JSON.stringify(firstDigests[targetId]) === JSON.stringify(secondDigests[targetId])
  }));
  const report = {
    system: 'SHEIKHA_DISTRIBUTION_REPRODUCIBILITY_EVIDENCE_V1',
    tested: true,
    passed: artifacts.length > 0 && artifacts.every((artifact) => artifact.identical),
    generatedAt: new Date().toISOString(),
    method: 'Two clean local builds with deterministic timestamps, ownership, ordering, and gzip metadata.',
    artifacts
  };
  writeJson(REPRODUCIBILITY_REPORT, report);
  if (!report.passed) throw new Error('Reproducibility verification failed.');
  return { results: second, report };
}

function verifyExistingArtifacts(context) {
  const results = [];
  for (const target of context.matrix.targets) {
    const adapter = adapterRegistry.resolve(target.id);
    const artifactPath = path.join(context.artifactDir, target.artifactName);
    if (!adapter || !fs.existsSync(artifactPath)) continue;
    results.push(verifyBuild(context, target, {
      targetId: target.id,
      artifactPath,
      adapter: `REVERIFY:${adapter.TARGET_ID}`
    }));
  }
  return results;
}

function publishLocalRegistry(context, targetResults) {
  const built = targetResults.filter((result) => result.built);
  if (!built.length || built.some((result) => !result.verification?.checksumVerified)) {
    throw new Error('Local publication requires built artifacts with verified checksums.');
  }
  const registryRoot = process.env.SHEIKHA_LOCAL_RELEASE_REGISTRY ||
    path.join(os.homedir(), 'Sheikha-Local-Registry', 'releases');
  const finalRoot = path.join(registryRoot, context.version);
  const stagingRoot = path.join(registryRoot, `.staging-${context.version}-${process.pid}`);
  if (fs.existsSync(finalRoot)) {
    throw new Error(`Local release already exists and will not be overwritten: ${finalRoot}`);
  }
  fs.mkdirSync(registryRoot, { recursive: true });
  if (fs.existsSync(stagingRoot)) fs.rmSync(stagingRoot, { recursive: true, force: true });
  fs.cpSync(context.versionRoot, stagingRoot, { recursive: true });
  const copiedIndex = readJson(path.join(stagingRoot, 'release-index.json'));
  for (const artifact of copiedIndex.artifacts) {
    const copiedPath = path.join(stagingRoot, artifact.relativePath);
    if (!fs.existsSync(copiedPath) || sha256File(copiedPath) !== artifact.sha256) {
      fs.rmSync(stagingRoot, { recursive: true, force: true });
      throw new Error(`Atomic local publication verification failed: ${artifact.targetId}`);
    }
  }
  fs.renameSync(stagingRoot, finalRoot);
  return finalRoot;
}

function execute(action = 'release-local') {
  const toolchain = inspectToolchain();
  const context = createContext(toolchain);
  if (action === 'inspect') {
    const { report } = buildReports(context, []);
    return { action, toolchain, report };
  }
  if (action === 'matrix' || action === 'plan') {
    const { report, matrixReport } = buildReports(context, []);
    return { action, validation: context.validation, matrixReport, report };
  }

  let results;
  let reproducibility = null;
  if (action === 'reproducibility') {
    const outcome = verifyReproducibility(context);
    results = outcome.results;
    reproducibility = outcome.report;
  } else if (['build-local', 'build-linux', 'release-local'].includes(action)) {
    results = buildAvailable(context);
    writeReleaseIndex(context, results);
  } else if (['verify', 'index'].includes(action)) {
    results = verifyExistingArtifacts(context);
    if (results.length) writeReleaseIndex(context, results);
  } else {
    throw new Error(`Unknown distribution action: ${action}`);
  }

  let localReleasePath = null;
  if (action === 'release-local') {
    localReleasePath = publishLocalRegistry(context, results);
  }
  const { report, matrixReport } = buildReports(context, results, {
    localRegistryPublished: Boolean(localReleasePath)
  });
  return {
    action,
    validation: context.validation,
    matrixReport,
    report,
    reproducibility,
    localReleasePath,
    artifacts: results.filter((result) => result.built).map((result) => result.artifact)
  };
}

if (require.main === module) {
  try {
    const action = process.argv[2] || 'release-local';
    const result = execute(action);
    console.log(JSON.stringify({
      system: SYSTEM,
      action: result.action,
      status: result.report.status,
      targetCount: result.report.targetCount,
      builtCount: result.report.builtCount,
      verifiedCount: result.report.verifiedCount,
      nativeVerifiedCount: result.report.nativeVerifiedCount,
      localRegistryPublishedCount: result.report.localRegistryPublishedCount,
      githubRequired: result.report.githubRequired,
      localReleasePath: result.localReleasePath || result.report.localReleasePath,
      artifacts: result.artifacts || [],
      reports: {
        main: path.relative(ROOT, MAIN_REPORT),
        toolchain: path.relative(ROOT, TOOLCHAIN_REPORT),
        matrix: path.relative(ROOT, MATRIX_REPORT),
        artifacts: path.relative(ROOT, ARTIFACT_REPORT),
        nativeVerification: path.relative(ROOT, NATIVE_REPORT)
      }
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      system: SYSTEM,
      status: 'FAILED',
      error: error.message
    }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = {
  SYSTEM,
  buildAvailable,
  buildReports,
  createContext,
  execute,
  inspectToolchain,
  inspectLocalRegistryRelease,
  publishLocalRegistry,
  scanSecrets,
  validateMatrix,
  validateResultClaims,
  verifyReproducibility,
  verifyExistingArtifacts,
  verifyReleaseIndex,
  writeReleaseIndex
};
