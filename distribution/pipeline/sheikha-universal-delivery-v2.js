#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  SheikhaCliDistributionAdapter,
  WindowsInstallerAdapter,
  buildAvailableLinux,
  inspectMacosReadiness,
  stageAndInspectBareMetal,
  stageAndInspectVsix
} = require('../adapters');
const {
  DISTRIBUTION_ROOT,
  ROOT,
  fileMetadata,
  findTool,
  readJson,
  run,
  sha256File,
  writeJson
} = require('../common/distribution-utils');
const { scanStageForSecrets } = require('../common/source-staging-engine');
const v1 = require('../scripts/sheikha-distribution-v1');

const SYSTEM = 'SHEIKHA_UNIVERSAL_DELIVERY_DISTRIBUTION_INSTALLER_FABRIC_V2';
const MATRIX_PATH = path.join(DISTRIBUTION_ROOT, 'manifest', 'sheikha-target-matrix-v2.json');
const PRODUCTS_PATH = path.join(DISTRIBUTION_ROOT, 'manifest', 'sheikha-products-v2.json');
const COMPATIBILITY_PATH = path.join(DISTRIBUTION_ROOT, 'manifest', 'sheikha-format-compatibility-v2.json');
const CHANNELS_PATH = path.join(DISTRIBUTION_ROOT, 'manifest', 'sheikha-release-channels-v2.json');
const UPDATE_POLICY_PATH = path.join(DISTRIBUTION_ROOT, 'manifest', 'sheikha-update-policy-v2.json');
const REPORT_ROOT = path.join(ROOT, 'runtime', 'distribution', 'v2');
const EVIDENCE_ROOT = path.join(REPORT_ROOT, 'evidence');
const MAIN_REPORT = path.join(REPORT_ROOT, 'sheikha-universal-delivery-v2-report.json');
const PRODUCT_MATRIX_REPORT = path.join(REPORT_ROOT, 'sheikha-product-matrix-v2-report.json');
const TOOLCHAIN_REPORT = path.join(REPORT_ROOT, 'sheikha-toolchain-inspection-v2.json');
const ARTIFACT_INVENTORY_REPORT = path.join(REPORT_ROOT, 'sheikha-artifact-inventory-v2.json');
const NATIVE_VERIFICATION_REPORT = path.join(REPORT_ROOT, 'sheikha-native-verification-v2.json');
const SIGNING_REPORT = path.join(REPORT_ROOT, 'sheikha-signing-readiness-v2.json');
const SUPPLY_CHAIN_REPORT = path.join(REPORT_ROOT, 'sheikha-supply-chain-integrity-v2.json');

const TOOL_NAMES = [
  'node', 'npm', 'tar', 'gzip', 'zip', 'unzip', 'sha256sum', 'file', 'readelf',
  'objdump', 'ar', 'dpkg-deb', 'dpkg', 'fakeroot', 'rpmbuild', 'rpm', 'snapcraft',
  'syft', 'cyclonedx', 'cosign', 'lipo', 'hdiutil', 'codesign', 'productbuild',
  'xcrun', 'osslsigncode', 'makensis', 'wix', 'wixl', 'signtool',
  'qemu-system-x86_64', 'qemu-system-aarch64', 'rg'
];

const REQUIRED_TARGET_FIELDS = [
  'id', 'product', 'platform', 'operatingSystem', 'architecture', 'format',
  'installationScope', 'runtimeType', 'buildStrategy', 'buildHostRequirement',
  'nativeRunnerRequirement', 'signingRequirement', 'notarizationRequirement',
  'publicationRequirement', 'artifactName', 'status', 'evidence', 'limitations'
];

const FORMAT_EXTENSIONS = Object.freeze({
  exe: '.exe',
  zip: '.zip',
  deb: '.deb',
  rpm: '.rpm',
  'tar.gz': '.tar.gz',
  snap: '.snap',
  dmg: '.dmg'
});

function sourceIdentity() {
  const revision = run('git', ['rev-parse', 'HEAD']).stdout;
  const timestamp = run('git', ['show', '-s', '--format=%cI', revision]).stdout;
  const status = run('git', ['status', '--porcelain'], { allowFailure: true }).stdout;
  return {
    revision,
    deterministicTimestamp: timestamp,
    builderWorktreeDirty: Boolean(status),
    payloadSource: 'COMMITTED_HEAD_SNAPSHOT'
  };
}

function normalizeHostArchitecture(value) {
  if (value === 'x64') return 'x86_64';
  if (value === 'arm64') return 'aarch64';
  return value;
}

function packageNameFromNodeModulesPath(relativePath) {
  const parts = relativePath.split('/');
  const index = parts.lastIndexOf('node_modules');
  if (index < 0 || !parts[index + 1]) return null;
  return parts[index + 1].startsWith('@')
    ? `${parts[index + 1]}/${parts[index + 2] || ''}`
    : parts[index + 1];
}

function inspectNativeDependencies() {
  const packageJson = readJson(path.join(ROOT, 'package.json'));
  const packageLock = readJson(path.join(ROOT, 'package-lock.json'));
  const productionNames = new Set(Object.keys(packageJson.dependencies || {}));
  const lockNativeCandidates = Object.entries(packageLock.packages || {})
    .filter(([, metadata]) => metadata?.hasInstallScript === true || metadata?.gypfile === true)
    .map(([location, metadata]) => ({
      location,
      name: metadata.name || packageNameFromNodeModulesPath(location),
      version: metadata.version || null,
      hasInstallScript: metadata.hasInstallScript === true,
      gypfile: metadata.gypfile === true,
      topLevelProductionDependency: productionNames.has(metadata.name || packageNameFromNodeModulesPath(location))
    }));
  const tracked = run('git', ['ls-files'], { allowFailure: true }).stdout.split('\n').filter(Boolean);
  const trackedNativeSources = tracked.filter((name) =>
    /(?:^|\/)(?:binding\.gyp|prebuilds?\/)|\.(?:node|so|dll|dylib|exe)$/iu.test(name)
  );
  const nativeListing = findTool('rg')
    ? run('rg', ['--no-ignore', '--files', 'node_modules', '-g', '*.node'], { allowFailure: true }).stdout
    : '';
  const installedNativeAddons = nativeListing.split('\n').filter(Boolean).slice(0, 200).map((name) => {
    const inspection = findTool('file')
      ? run('file', [name], { allowFailure: true }).stdout
      : 'file tool unavailable';
    const packageName = packageNameFromNodeModulesPath(name);
    return {
      path: name,
      packageName,
      productionTopLevel: productionNames.has(packageName),
      inspection
    };
  });
  return {
    packageLockVersion: packageLock.lockfileVersion,
    lockNativeCandidates,
    trackedNativeSources,
    installedNativeAddons,
    productionTopLevelNativeAddons: installedNativeAddons.filter((item) => item.productionTopLevel),
    conclusion: installedNativeAddons.some((item) => item.productionTopLevel)
      ? 'PRODUCTION_NATIVE_ADDON_REVIEW_REQUIRED'
      : 'NO_TOP_LEVEL_PRODUCTION_NATIVE_ADDON_DETECTED',
    caveat: 'Transitive package install scripts remain target-specific and require package-native runner verification.'
  };
}

function inspectToolchain() {
  const tools = Object.fromEntries(TOOL_NAMES.map((name) => [name, findTool(name)]));
  const npmTree = run('npm', ['ls', '--omit=dev', '--depth=0', '--json'], { allowFailure: true });
  let parsedNpmTree = null;
  try {
    parsedNpmTree = JSON.parse(npmTree.stdout);
  } catch (_) {
    parsedNpmTree = null;
  }
  const report = {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_DELIVERY_TOOLCHAIN_AND_DEPENDENCY_INSPECTOR_V2',
    status: 'INSPECTED',
    generatedAt: new Date().toISOString(),
    host: {
      platform: process.platform,
      architecture: normalizeHostArchitecture(process.arch),
      node: process.version,
      release: os.release()
    },
    tools,
    available: Object.entries(tools).filter(([, value]) => Boolean(value)).map(([name]) => name),
    missing: Object.entries(tools).filter(([, value]) => !value).map(([name]) => name),
    npmProductionTree: {
      commandSucceeded: npmTree.status === 0,
      dependencyCount: Object.keys(parsedNpmTree?.dependencies || {}).length,
      problems: parsedNpmTree?.problems || []
    },
    nativeDependencies: inspectNativeDependencies(),
    constraints: {
      sudoUsed: false,
      packagesInstalled: false,
      nativeWindowsRunner: process.platform === 'win32',
      nativeMacosRunner: process.platform === 'darwin',
      nativeLinuxRunner: process.platform === 'linux',
      externalPublishingConfigured: false,
      signingCredentialsLoaded: false
    }
  };
  writeJson(TOOLCHAIN_REPORT, report);
  return report;
}

function validateMatrix(matrix = readJson(MATRIX_PATH), products = readJson(PRODUCTS_PATH)) {
  const errors = [];
  const packageVersion = readJson(path.join(ROOT, 'package.json')).version;
  if (matrix.system !== SYSTEM) errors.push('invalid-system');
  if (matrix.sourceOfTruth !== true) errors.push('matrix-must-be-source-of-truth');
  if (matrix.version !== packageVersion) errors.push('matrix-version-must-match-package-json');
  if (matrix.targetCount !== 27 || matrix.targets?.length !== 27) errors.push('target-count-must-be-27');
  const ids = new Set();
  const names = new Set();
  const allowedStatuses = new Set(matrix.allowedStatuses || []);
  const compatibility = readJson(COMPATIBILITY_PATH).rules;
  for (const target of matrix.targets || []) {
    const missing = REQUIRED_TARGET_FIELDS.filter((field) => !(field in target));
    if (missing.length) errors.push(`${target.id || 'unknown'}:missing:${missing.join(',')}`);
    if (ids.has(target.id)) errors.push(`${target.id}:duplicate-id`);
    ids.add(target.id);
    if (names.has(target.artifactName)) errors.push(`${target.id}:duplicate-artifact-name`);
    names.add(target.artifactName);
    if (!allowedStatuses.has(target.status)) errors.push(`${target.id}:status-not-allowed`);
    const extension = FORMAT_EXTENSIONS[target.format];
    if (!extension || !target.artifactName.endsWith(extension)) errors.push(`${target.id}:invalid-format-extension`);
    if (!target.artifactName.includes(matrix.version) || /[\\/]/u.test(target.artifactName)) {
      errors.push(`${target.id}:non-deterministic-artifact-name`);
    }
    if (!Array.isArray(target.evidence) || !Array.isArray(target.limitations)) {
      errors.push(`${target.id}:evidence-and-limitations-must-be-arrays`);
    }
    const rule = compatibility.find((item) => item.product === target.product);
    if (!rule || !rule.formats.includes(target.format)) errors.push(`${target.id}:product-format-incompatible`);
    if (rule?.allowed === false && !products.declaredCandidates.some((item) => item.id === target.product)) {
      errors.push(`${target.id}:blocked-product-not-declared`);
    }
  }
  const platformCounts = (matrix.targets || []).reduce((counts, target) => {
    counts[target.platform] = (counts[target.platform] || 0) + 1;
    return counts;
  }, {});
  if (platformCounts.windows !== 8 || platformCounts.linux !== 15 || platformCounts.macos !== 4) {
    errors.push('platform-counts-must-be-windows-8-linux-15-macos-4');
  }
  const windowsScopes = matrix.targets.filter((target) => target.format === 'exe')
    .reduce((counts, target) => {
      counts[target.installationScope] = (counts[target.installationScope] || 0) + 1;
      return counts;
    }, {});
  if (windowsScopes['current-user'] !== 2 || windowsScopes.system !== 2) {
    errors.push('windows-user-system-scope-separation-invalid');
  }
  return {
    valid: errors.length === 0,
    errors,
    platformCounts,
    uniqueTargetIds: ids.size,
    uniqueArtifactNames: names.size,
    packageVersion
  };
}

function inspectProducts(products = readJson(PRODUCTS_PATH)) {
  const implemented = products.products.filter((product) => product.implemented && product.countedAsProduct);
  const errors = [];
  if (implemented.length !== products.productCount) errors.push('product-count-mismatch');
  const desktop = products.declaredCandidates.find((product) => product.id === 'sheikha-desktop');
  if (!desktop || desktop.implemented || desktop.installerClaimAllowed) {
    errors.push('desktop-candidate-boundary-invalid');
  }
  return {
    valid: errors.length === 0,
    errors,
    productCount: implemented.length,
    implementedProductIds: implemented.map((item) => item.id),
    declaredCandidateIds: products.declaredCandidates.map((item) => item.id)
  };
}

function createContext(options = {}) {
  const matrix = readJson(MATRIX_PATH);
  const products = readJson(PRODUCTS_PATH);
  const validation = validateMatrix(matrix, products);
  const productInspection = inspectProducts(products);
  if (!validation.valid || !productInspection.valid) {
    throw new Error(`V2 contract validation failed: ${[...validation.errors, ...productInspection.errors].join('; ')}`);
  }
  const source = sourceIdentity();
  const releaseTree = options.releaseTree || path.join(DISTRIBUTION_ROOT, 'artifacts', 'v2', matrix.version);
  const context = {
    matrix,
    products,
    compatibility: readJson(COMPATIBILITY_PATH),
    channels: readJson(CHANNELS_PATH),
    updatePolicy: readJson(UPDATE_POLICY_PATH),
    validation,
    productInspection,
    version: matrix.version,
    source,
    toolchain: options.toolchain || inspectToolchain(),
    releaseTree,
    artifactDir: path.join(releaseTree, 'artifacts'),
    metadataDir: path.join(releaseTree, 'metadata'),
    sbomDir: path.join(releaseTree, 'sbom'),
    provenanceDir: path.join(releaseTree, 'provenance'),
    verificationDir: path.join(releaseTree, 'verification'),
    workingVerificationRoot: path.join(DISTRIBUTION_ROOT, 'verification', 'v2', matrix.version)
  };
  return context;
}

function resolveArtifactPath(artifact) {
  const resolved = path.resolve(ROOT, artifact.path);
  if (!resolved.startsWith(`${path.resolve(DISTRIBUTION_ROOT, 'artifacts', 'v2')}${path.sep}`)) {
    throw new Error(`Artifact path escaped V2 root: ${artifact.path}`);
  }
  return resolved;
}

function validateResultClaims(results) {
  const errors = [];
  for (const result of results) {
    const artifactPath = result.artifact?.path ? resolveArtifactPath(result.artifact) : null;
    const evidencePath = result.evidence || result.verificationEvidence;
    const evidenceExists = evidencePath ? fs.existsSync(path.join(ROOT, evidencePath)) : false;
    if (result.status === 'VERIFIED' || result.verified === true) {
      if (!result.built || !artifactPath || !fs.existsSync(artifactPath)) errors.push(`${result.id}:verified-without-artifact`);
      if (!result.artifact?.bytes || !/^[a-f0-9]{64}$/u.test(result.artifact?.sha256 || '')) {
        errors.push(`${result.id}:verified-without-size-and-sha256`);
      }
      if (result.inspectionPassed !== true && result.verification?.packageInspectionPassed !== true &&
          result.verification?.archiveIntegrityPassed !== true) {
        errors.push(`${result.id}:verified-without-structure-inspection`);
      }
      if (result.nativeVerified !== true) errors.push(`${result.id}:verified-without-native-evidence`);
      if (!evidenceExists) errors.push(`${result.id}:verified-evidence-missing`);
    }
    if (result.nativeVerified === true && !evidenceExists) errors.push(`${result.id}:native-evidence-missing`);
    if (result.signed === true && !result.signatureEvidence?.length) errors.push(`${result.id}:signed-without-evidence`);
    if (result.notarized === true && !result.notarizationEvidence?.length) errors.push(`${result.id}:notarized-without-evidence`);
  }
  return { valid: errors.length === 0, errors };
}

function normalizeBaseResults(context, results) {
  const targetById = new Map(context.matrix.targets.map((target) => [target.id, target]));
  return results.map((result) => {
    const target = targetById.get(result.id);
    const evidence = result.verification
      ? path.relative(ROOT, path.join(context.verificationDir, `${target.artifactName}.verification.json`))
      : null;
    return {
      ...result,
      product: target.product,
      version: context.version,
      inspectionPassed: result.verification?.packageInspectionPassed === true,
      evidence,
      verificationEvidence: evidence,
      signatureEvidence: result.verification?.signatureEvidence || [],
      notarizationEvidence: result.verification?.notarizationEvidence || []
    };
  });
}

function dependencyComponents() {
  const lock = readJson(path.join(ROOT, 'package-lock.json'));
  return Object.entries(lock.packages || {})
    .filter(([location, metadata]) => location && metadata?.version)
    .map(([location, metadata]) => ({
      type: 'library',
      name: metadata.name || packageNameFromNodeModulesPath(location) || location,
      version: String(metadata.version),
      licenses: metadata.license ? [{ license: { name: String(metadata.license) } }] : undefined
    }))
    .sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`));
}

function createSbom(context, result) {
  const components = result.product === 'sheikha-server-runtime' || result.product === 'sheikha-cli'
    ? dependencyComponents()
    : [];
  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:${result.artifact.sha256.slice(0, 8)}-${result.artifact.sha256.slice(8, 12)}-4${result.artifact.sha256.slice(13, 16)}-8${result.artifact.sha256.slice(17, 20)}-${result.artifact.sha256.slice(20, 32)}`,
    version: 1,
    metadata: {
      timestamp: context.source.deterministicTimestamp,
      tools: [{ vendor: 'Sheikha', name: 'Universal Delivery Fabric', version: '2.0.0' }],
      component: {
        type: 'application',
        name: result.product,
        version: result.version,
        hashes: [{ alg: 'SHA-256', content: result.artifact.sha256 }]
      },
      properties: [{ name: 'sheikha:artifactId', value: result.id }]
    },
    components
  };
}

function createProvenance(context, result) {
  return {
    _type: 'https://in-toto.io/Statement/v1',
    subject: [{ name: path.basename(result.artifact.path), digest: { sha256: result.artifact.sha256 } }],
    predicateType: 'https://slsa.dev/provenance/v1',
    predicate: {
      buildDefinition: {
        buildType: 'https://sheikha.local/build-types/universal-delivery-v2',
        externalParameters: {
          artifactId: result.id,
          product: result.product,
          version: result.version,
          localRegistryOnly: true
        },
        internalParameters: {
          v1BuildEngineReused: result.bridge === 'SHEIKHA_V1_BUILD_ENGINE_REUSED_BY_V2',
          builderWorktreeDirty: context.source.builderWorktreeDirty,
          payloadSource: context.source.payloadSource
        },
        resolvedDependencies: [{
          uri: 'git+local://sheikha-main-portal',
          digest: { gitCommit: context.source.revision }
        }]
      },
      runDetails: {
        builder: { id: SYSTEM },
        metadata: {
          invocationId: `${result.id}-${result.artifact.sha256.slice(0, 16)}`,
          startedOn: context.source.deterministicTimestamp,
          finishedOn: context.source.deterministicTimestamp
        }
      }
    }
  };
}

function writeArtifactSupport(context, results) {
  fs.mkdirSync(context.metadataDir, { recursive: true });
  fs.mkdirSync(context.sbomDir, { recursive: true });
  fs.mkdirSync(context.provenanceDir, { recursive: true });
  fs.mkdirSync(context.verificationDir, { recursive: true });
  const artifacts = results.filter((result) => result.built && result.artifact);
  for (const result of artifacts) {
    const name = path.basename(result.artifact.path);
    writeJson(path.join(context.sbomDir, `${name}.cdx.json`), createSbom(context, result));
    writeJson(path.join(context.provenanceDir, `${name}.provenance.json`), createProvenance(context, result));
    writeJson(path.join(context.metadataDir, `${name}.manifest.json`), {
      schemaVersion: '2.0.0',
      system: SYSTEM,
      artifactId: result.id,
      product: result.product,
      productVersion: result.version,
      artifact: result.artifact,
      status: result.status,
      nativeVerified: result.nativeVerified === true,
      signed: result.signed === true,
      notarized: result.notarized === true,
      evidence: result.evidence || result.verificationEvidence || null,
      localRegistryOnly: true,
      githubRequired: false
    });
  }
  const components = dependencyComponents();
  writeJson(path.join(context.metadataDir, 'THIRD_PARTY_NOTICES.json'), {
    schemaVersion: '2.0.0',
    generatedFrom: 'package-lock.json',
    componentCount: components.length,
    components: components.map((item) => ({
      name: item.name,
      version: item.version,
      license: item.licenses?.[0]?.license?.name || 'NOT_DECLARED_IN_LOCKFILE'
    }))
  });
  writeJson(path.join(context.metadataDir, 'installation-contracts.json'), {
    schemaVersion: '2.0.0',
    cli: {
      install: 'Extract archive and invoke bin/sheikha with a supported Node.js runtime.',
      uninstall: 'Remove the extracted directory and any user-created external configuration.'
    },
    deb: {
      install: 'Native dpkg install requires explicit administrator approval and was not run by this pipeline.',
      uninstall: 'Native dpkg uninstall requires explicit administrator approval and was not run by this pipeline.'
    },
    vscode: {
      install: 'Install the inspected VSIX into a compatible VS Code extension host.',
      uninstall: 'Use the VS Code extension manager; user data is not silently deleted.'
    },
    bareMetal: {
      install: 'Copy the EFI artifact to an ESP or use the FAT image in an explicitly selected test device.',
      uninstall: 'Remove only the explicitly installed ESP artifact or detach the test image.'
    }
  });
  return artifacts;
}

function resultInventoryEntry(context, result) {
  const absolute = resolveArtifactPath(result.artifact);
  const name = path.basename(absolute);
  return {
    artifactId: result.id,
    targetId: context.matrix.targets.some((target) => target.id === result.id) ? result.id : null,
    product: result.product,
    productVersion: result.version,
    status: result.status,
    name,
    relativePath: `artifacts/${name}`,
    bytes: result.artifact.bytes,
    sha256: result.artifact.sha256,
    inspectionPassed: result.inspectionPassed === true ||
      result.verification?.packageInspectionPassed === true ||
      result.verification?.archiveIntegrityPassed === true ||
      result.verification?.formatInspectionPassed === true,
    nativeVerified: result.nativeVerified === true,
    qemuVerified: result.qemuVerified === true,
    signed: result.signed === true,
    notarized: result.notarized === true,
    publicationState: 'NOT_PUBLISHED',
    verification: `verification/${name}.verification.json`,
    sbom: `sbom/${name}.cdx.json`,
    provenance: `provenance/${name}.provenance.json`,
    metadata: `metadata/${name}.manifest.json`
  };
}

function writeReleaseIndex(context, results) {
  const artifacts = results.filter((result) => result.built && result.artifact)
    .map((result) => resultInventoryEntry(context, result))
    .sort((a, b) => a.artifactId.localeCompare(b.artifactId));
  const names = new Set();
  const hashes = new Map();
  const duplicateArtifactNames = [];
  const duplicateArtifactHashes = [];
  for (const artifact of artifacts) {
    if (names.has(artifact.name)) duplicateArtifactNames.push(artifact.name);
    names.add(artifact.name);
    if (hashes.has(artifact.sha256)) duplicateArtifactHashes.push([hashes.get(artifact.sha256), artifact.artifactId]);
    hashes.set(artifact.sha256, artifact.artifactId);
  }
  if (duplicateArtifactNames.length || duplicateArtifactHashes.length) {
    throw new Error('Duplicate artifact detection gate failed.');
  }
  const index = {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_LOCAL_RELEASE_INDEX_V2',
    version: context.version,
    channel: context.channels.defaultChannel,
    sourceCommit: context.source.revision,
    buildTimestamp: context.source.deterministicTimestamp,
    artifactCount: artifacts.length,
    targetArtifactCount: artifacts.filter((item) => item.targetId).length,
    auxiliaryArtifactCount: artifacts.filter((item) => !item.targetId).length,
    localRegistryOnly: true,
    githubRequired: false,
    externalPublishingRequested: false,
    artifacts
  };
  writeJson(path.join(context.releaseTree, 'release-index.json'), index);
  writeJson(path.join(context.releaseTree, 'rollback-manifest.json'), {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_LOCAL_RELEASE_ROLLBACK_MANIFEST_V2',
    version: context.version,
    sourceCommit: context.source.revision,
    immutableRelease: true,
    silentOverwriteAllowed: false,
    previousRelease: null,
    rollbackRequiresHumanApproval: true,
    restoreChecksumsFrom: 'SHA256SUMS'
  });
  fs.writeFileSync(
    path.join(context.releaseTree, 'SHA256SUMS'),
    `${artifacts.map((item) => `${item.sha256}  ${item.relativePath}`).join('\n')}\n`,
    'utf8'
  );
  fs.writeFileSync(
    path.join(context.releaseTree, 'MANIFEST.txt'),
    `${artifacts.map((item) => item.relativePath).join('\n')}\n`,
    'utf8'
  );
  return index;
}

function safeReleasePath(releaseRoot, relativePath) {
  const resolved = path.resolve(releaseRoot, relativePath);
  if (!resolved.startsWith(`${path.resolve(releaseRoot)}${path.sep}`)) {
    throw new Error(`Release index path escaped release root: ${relativePath}`);
  }
  return resolved;
}

function verifyReleaseTree(releaseRoot) {
  const errors = [];
  const indexPath = path.join(releaseRoot, 'release-index.json');
  const rollbackPath = path.join(releaseRoot, 'rollback-manifest.json');
  if (!fs.existsSync(indexPath)) return { valid: false, errors: ['release-index-missing'], artifactCount: 0 };
  const index = readJson(indexPath);
  const artifacts = Array.isArray(index.artifacts) ? index.artifacts : [];
  if (index.artifactCount !== artifacts.length) errors.push('artifact-count-mismatch');
  if (index.localRegistryOnly !== true || index.githubRequired !== false) errors.push('publication-policy-invalid');
  const names = new Set();
  const hashes = new Set();
  for (const artifact of artifacts) {
    if (names.has(artifact.name)) errors.push(`${artifact.artifactId}:duplicate-name`);
    if (hashes.has(artifact.sha256)) errors.push(`${artifact.artifactId}:duplicate-sha256`);
    names.add(artifact.name);
    hashes.add(artifact.sha256);
    for (const key of ['relativePath', 'verification', 'sbom', 'provenance', 'metadata']) {
      if (!artifact[key]) {
        errors.push(`${artifact.artifactId}:${key}-missing`);
        continue;
      }
      let filePath;
      try {
        filePath = safeReleasePath(releaseRoot, artifact[key]);
      } catch (error) {
        errors.push(`${artifact.artifactId}:${key}-unsafe`);
        continue;
      }
      if (!fs.existsSync(filePath)) errors.push(`${artifact.artifactId}:${key}-not-found`);
    }
    const artifactPath = safeReleasePath(releaseRoot, artifact.relativePath);
    if (fs.existsSync(artifactPath)) {
      if (fs.statSync(artifactPath).size !== artifact.bytes) errors.push(`${artifact.artifactId}:size-mismatch`);
      if (sha256File(artifactPath) !== artifact.sha256) errors.push(`${artifact.artifactId}:checksum-mismatch`);
    }
  }
  if (!fs.existsSync(rollbackPath)) errors.push('rollback-manifest-missing');
  else {
    const rollback = readJson(rollbackPath);
    if (rollback.version !== index.version || rollback.silentOverwriteAllowed !== false) {
      errors.push('rollback-manifest-invalid');
    }
  }
  return { valid: errors.length === 0, errors, artifactCount: artifacts.length, index };
}

function writeTargetPlanEvidence(context) {
  const plansRoot = path.join(EVIDENCE_ROOT, 'target-plans');
  fs.mkdirSync(plansRoot, { recursive: true });
  const plans = [];
  for (const target of context.matrix.targets) {
    let adapterPlan;
    if (target.format === 'exe') {
      adapterPlan = new WindowsInstallerAdapter({ installationScope: target.installationScope })
        .plan(target, context);
    } else if (target.platform === 'macos') {
      adapterPlan = inspectMacosReadiness(target, context);
    } else if (target.product === 'sheikha-cli') {
      adapterPlan = new SheikhaCliDistributionAdapter(target).inspectSource();
    } else {
      adapterPlan = {
        system: 'SHEIKHA_TARGET_BUILD_PLAN_V2',
        targetId: target.id,
        status: target.status,
        buildStrategy: target.buildStrategy,
        limitations: target.limitations
      };
    }
    const evidencePath = path.join(plansRoot, `${target.id}.json`);
    writeJson(evidencePath, adapterPlan);
    plans.push({ targetId: target.id, evidence: path.relative(ROOT, evidencePath), plan: adapterPlan });
  }
  return plans;
}

function resolveTargets(context, baseResults, plans, published = false) {
  const resultById = new Map(baseResults.map((result) => [result.id, result]));
  const planById = new Map(plans.map((item) => [item.targetId, item]));
  return context.matrix.targets.map((target) => {
    const result = resultById.get(target.id);
    const plan = planById.get(target.id);
    return {
      ...target,
      status: result?.status || target.status,
      built: result?.built === true,
      inspected: result?.inspectionPassed === true,
      verified: result?.verified === true,
      nativeVerified: result?.nativeVerified === true,
      signed: result?.signed === true,
      notarized: result?.notarized === true,
      localRegistryPublished: published && result?.built === true,
      artifact: result?.artifact || null,
      evidence: result?.evidence ? [result.evidence] : [plan.evidence],
      buildError: result?.error || null
    };
  });
}

function statusCounts(targets) {
  return targets.reduce((counts, target) => {
    counts[target.status] = (counts[target.status] || 0) + 1;
    return counts;
  }, {});
}

function writeReports(context, baseResults, auxiliaryResults, plans, options = {}) {
  const allResults = [...baseResults, ...auxiliaryResults];
  const targets = resolveTargets(context, baseResults, plans, options.published === true);
  const inventory = allResults.filter((result) => result.built && result.artifact)
    .map((result) => resultInventoryEntry(context, result));
  if (options.published === true) inventory.forEach((item) => { item.publicationState = 'PUBLISHED_LOCAL_ATOMIC'; });
  const claims = validateResultClaims(allResults);
  const releaseVerification = verifyReleaseTree(context.releaseTree);
  const releaseSecretScan = scanStageForSecrets(context.releaseTree);
  const sourceSecretScan = v1.scanSecrets();
  const duplicateNames = inventory.length - new Set(inventory.map((item) => item.name)).size;
  const duplicateHashes = inventory.length - new Set(inventory.map((item) => item.sha256)).size;
  const builtTargets = targets.filter((target) => target.built);
  const inspectedTargets = targets.filter((target) => target.inspected);
  const verifiedTargets = targets.filter((target) => target.verified);
  const nativeTargets = targets.filter((target) => target.nativeVerified);
  const report = {
    schemaVersion: '2.0.0',
    system: SYSTEM,
    status: claims.valid && releaseVerification.valid && releaseSecretScan.passed && sourceSecretScan.passed
      ? 'ACTIVE_WITH_EVIDENCE_GATED_LOCAL_ARTIFACTS'
      : 'REVIEW_REQUIRED',
    generatedAt: new Date().toISOString(),
    sourceVersion: context.version,
    sourceCommit: context.source.revision,
    productCount: context.productInspection.productCount,
    targetCount: targets.length,
    declaredCount: targets.filter((target) => target.status === 'DECLARED').length,
    stagedCount: targets.filter((target) => target.status === 'STAGED').length,
    builtCount: builtTargets.length,
    inspectedCount: inspectedTargets.length,
    verifiedCount: verifiedTargets.length,
    nativeVerifiedCount: nativeTargets.length,
    signedCount: targets.filter((target) => target.signed).length,
    notarizedCount: targets.filter((target) => target.notarized).length,
    publishedLocallyCount: options.published === true ? inventory.length : 0,
    targetPublishedLocallyCount: options.published === true ? builtTargets.length : 0,
    publishedExternallyCount: 0,
    auxiliaryArtifactCount: auxiliaryResults.filter((result) => result.built).length,
    totalArtifactCount: inventory.length,
    localReleasePath: options.localReleasePath || null,
    githubRequired: false,
    localRegistryOnly: true,
    externalPublishingRequested: false,
    claimPolicy: 'No artifact is complete without target-specific inspection and required native evidence.',
    architecturalReadinessSeparatedFromArtifactVerification: true,
    coverage: {
      builtTargetsPercent: Number(((builtTargets.length / targets.length) * 100).toFixed(2)),
      verifiedTargetsPercent: Number(((verifiedTargets.length / targets.length) * 100).toFixed(2)),
      nativeVerifiedTargetsPercent: Number(((nativeTargets.length / targets.length) * 100).toFixed(2)),
      falseCompletionClaims: claims.errors.length
    },
    statusCounts: statusCounts(targets),
    products: context.products.products,
    declaredProductCandidates: context.products.declaredCandidates,
    targets,
    auxiliaryProducts: auxiliaryResults.map((result) => ({
      id: result.id,
      product: result.product,
      status: result.status,
      built: result.built === true,
      verified: result.verified === true,
      nativeVerified: result.nativeVerified === true,
      qemuVerified: result.qemuVerified === true,
      artifact: result.artifact || null,
      evidence: result.evidence || null
    })),
    limitations: [
      'No executable Desktop Runtime exists; Windows EXE and macOS DMG artifacts were not fabricated.',
      'Windows and macOS native runners are unavailable on this Linux host.',
      'ARM targets require architecture-correct native or cross-build payloads and native runner evidence.',
      'RPM and Snap toolchains are unavailable; no RPM or Snap artifacts were fabricated.',
      'CLI and server artifacts require an external compatible Node.js runtime.',
      'The DEB was extracted and inspected; privileged install and uninstall were not performed.',
      'Bare-Metal boot is verified under QEMU UEFI only, not on physical hardware.',
      'Signing, notarization, and external publication were not requested or performed.'
    ],
    reports: {
      productMatrix: path.relative(ROOT, PRODUCT_MATRIX_REPORT),
      toolchain: path.relative(ROOT, TOOLCHAIN_REPORT),
      artifactInventory: path.relative(ROOT, ARTIFACT_INVENTORY_REPORT),
      nativeVerification: path.relative(ROOT, NATIVE_VERIFICATION_REPORT),
      signingReadiness: path.relative(ROOT, SIGNING_REPORT),
      supplyChainIntegrity: path.relative(ROOT, SUPPLY_CHAIN_REPORT)
    },
    releaseIndex: path.relative(ROOT, path.join(context.releaseTree, 'release-index.json')),
    releaseVerification: path.relative(ROOT, path.join(EVIDENCE_ROOT, 'release-tree-verification-v2.json'))
  };
  writeJson(PRODUCT_MATRIX_REPORT, {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_PRODUCT_TARGET_MATRIX_REPORT_V2',
    generatedAt: report.generatedAt,
    sourceOfTruth: path.relative(ROOT, MATRIX_PATH),
    productCount: report.productCount,
    targetCount: report.targetCount,
    platformCounts: context.validation.platformCounts,
    statusCounts: report.statusCounts,
    compatibility: context.compatibility,
    targets
  });
  writeJson(ARTIFACT_INVENTORY_REPORT, {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_ARTIFACT_INVENTORY_V2',
    generatedAt: report.generatedAt,
    artifactCount: inventory.length,
    targetArtifactCount: inventory.filter((item) => item.targetId).length,
    auxiliaryArtifactCount: inventory.filter((item) => !item.targetId).length,
    artifacts: inventory
  });
  writeJson(NATIVE_VERIFICATION_REPORT, {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_NATIVE_VERIFICATION_V2',
    generatedAt: report.generatedAt,
    policy: 'Cross-build, extraction, source syntax, and QEMU evidence are reported separately from native install verification.',
    nativeVerifiedTargetCount: nativeTargets.length,
    targets: targets.map((target) => ({
      id: target.id,
      status: target.status,
      nativeVerified: target.nativeVerified,
      evidence: target.evidence
    })),
    auxiliary: report.auxiliaryProducts
  });
  writeJson(SIGNING_REPORT, {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_SIGNING_AND_NOTARIZATION_READINESS_V2',
    generatedAt: report.generatedAt,
    credentialsLoaded: false,
    signedCount: 0,
    notarizedCount: 0,
    signingRequiredTargets: targets.filter((target) => /REQUIRED/u.test(target.signingRequirement)).map((target) => target.id),
    notarizationRequiredTargets: targets.filter((target) => /REQUIRED/u.test(target.notarizationRequirement)).map((target) => target.id),
    automaticSigning: false,
    automaticNotarization: false
  });
  writeJson(SUPPLY_CHAIN_REPORT, {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_SUPPLY_CHAIN_INTEGRITY_V2',
    generatedAt: report.generatedAt,
    status: claims.valid && releaseVerification.valid && releaseSecretScan.passed && sourceSecretScan.passed
      ? 'PASSED'
      : 'FAILED',
    sourceCommit: context.source.revision,
    deterministicArtifactNames: context.validation.uniqueArtifactNames === 27,
    checksumsVerified: releaseVerification.valid,
    sbomFormat: 'CycloneDX 1.5',
    provenanceFormat: 'SLSA v1 shaped in-toto statement',
    releaseSecretScan,
    distributionSourceSecretScan: sourceSecretScan,
    duplicateArtifactNames: duplicateNames,
    duplicateArtifactHashes: duplicateHashes,
    claimValidation: claims,
    noAutomaticExternalPublication: true,
    githubRequired: false,
    nativeDependencyInspection: path.relative(ROOT, TOOLCHAIN_REPORT)
  });
  writeJson(path.join(EVIDENCE_ROOT, 'matrix-validation-v2.json'), context.validation);
  writeJson(path.join(EVIDENCE_ROOT, 'release-tree-verification-v2.json'), releaseVerification);
  writeJson(MAIN_REPORT, report);
  return report;
}

function fsyncTree(root) {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
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

function setReleasePublicationState(releaseRoot, publicationState) {
  const indexPath = path.join(releaseRoot, 'release-index.json');
  const temporaryPath = path.join(releaseRoot, `.release-index-${process.pid}.tmp`);
  const index = readJson(indexPath);
  index.localPublicationState = publicationState;
  index.artifacts = (index.artifacts || []).map((artifact) => ({
    ...artifact,
    publicationState
  }));
  const payload = `${JSON.stringify(index, null, 2)}\n`;
  const descriptor = fs.openSync(temporaryPath, 'wx');
  try {
    fs.writeFileSync(descriptor, payload, 'utf8');
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
  fs.renameSync(temporaryPath, indexPath);
  const rootDescriptor = fs.openSync(releaseRoot, 'r');
  try { fs.fsyncSync(rootDescriptor); } finally { fs.closeSync(rootDescriptor); }
  return verifyReleaseTree(releaseRoot);
}

function publishAtomic(context, registryRoot = process.env.SHEIKHA_LOCAL_RELEASE_REGISTRY ||
  path.join(os.homedir(), 'Sheikha-Local-Registry', 'releases', 'v2')) {
  const preflight = verifyReleaseTree(context.releaseTree);
  if (!preflight.valid || preflight.artifactCount === 0) {
    throw new Error(`Atomic publication preflight failed: ${preflight.errors.join('; ')}`);
  }
  const finalRoot = path.join(registryRoot, context.version);
  const stagingRoot = path.join(registryRoot, `.staging-${context.version}-${process.pid}`);
  if (fs.existsSync(finalRoot)) throw new Error(`Local release already exists and will not be overwritten: ${finalRoot}`);
  fs.mkdirSync(registryRoot, { recursive: true });
  if (fs.existsSync(stagingRoot)) fs.rmSync(stagingRoot, { recursive: true, force: true });
  try {
    fs.cpSync(context.releaseTree, stagingRoot, { recursive: true, dereference: false });
    setReleasePublicationState(stagingRoot, 'PUBLISHED_LOCAL_ATOMIC');
    const stagedVerification = verifyReleaseTree(stagingRoot);
    if (!stagedVerification.valid) throw new Error(`Staged release verification failed: ${stagedVerification.errors.join('; ')}`);
    fsyncTree(stagingRoot);
    fs.renameSync(stagingRoot, finalRoot);
    const finalVerification = verifyReleaseTree(finalRoot);
    if (!finalVerification.valid) throw new Error(`Published release verification failed: ${finalVerification.errors.join('; ')}`);
    return { releaseRoot: finalRoot, verification: finalVerification };
  } catch (error) {
    if (fs.existsSync(stagingRoot)) fs.rmSync(stagingRoot, { recursive: true, force: true });
    throw error;
  }
}

function build(context, options = {}) {
  const { results: rawBaseResults } = buildAvailableLinux(context);
  const baseResults = normalizeBaseResults(context, rawBaseResults);
  const auxiliaryResults = options.includeAuxiliary === false
    ? []
    : [stageAndInspectVsix(context), ...stageAndInspectBareMetal(context)];
  const allResults = [...baseResults, ...auxiliaryResults];
  const claims = validateResultClaims(allResults);
  if (!claims.valid) throw new Error(`Artifact claim gate failed: ${claims.errors.join('; ')}`);
  writeArtifactSupport(context, allResults);
  writeReleaseIndex(context, allResults);
  const releaseVerification = verifyReleaseTree(context.releaseTree);
  if (!releaseVerification.valid) {
    throw new Error(`Release tree verification failed: ${releaseVerification.errors.join('; ')}`);
  }
  return { baseResults, auxiliaryResults };
}

function execute(action = 'status', options = {}) {
  if (action === 'status' && fs.existsSync(MAIN_REPORT)) {
    const report = readJson(MAIN_REPORT);
    const localVerification = report.localReleasePath && fs.existsSync(report.localReleasePath)
      ? verifyReleaseTree(report.localReleasePath)
      : null;
    return { action, report, localVerification };
  }
  if (action === 'verify') {
    const matrix = readJson(MATRIX_PATH);
    const releaseTree = options.releaseTree ||
      path.join(DISTRIBUTION_ROOT, 'artifacts', 'v2', matrix.version);
    const verification = verifyReleaseTree(releaseTree);
    if (!verification.valid) throw new Error(`Release verification failed: ${verification.errors.join('; ')}`);
    return { action, verification, report: fs.existsSync(MAIN_REPORT) ? readJson(MAIN_REPORT) : null };
  }
  const context = createContext(options);
  const plans = writeTargetPlanEvidence(context);
  if (['inspect', 'matrix', 'plan'].includes(action)) {
    return {
      action,
      context,
      plans,
      validation: context.validation,
      productInspection: context.productInspection,
      toolchain: context.toolchain
    };
  }
  if (!['build-linux', 'build-available', 'release-local'].includes(action)) {
    throw new Error(`Unknown delivery action: ${action}`);
  }
  const output = build(context, { includeAuxiliary: action !== 'build-linux' });
  let localPublication = null;
  if (action === 'release-local') localPublication = publishAtomic(context, options.registryRoot);
  const report = writeReports(context, output.baseResults, output.auxiliaryResults, plans, {
    published: Boolean(localPublication),
    localReleasePath: localPublication?.releaseRoot || null
  });
  return {
    action,
    context,
    ...output,
    report,
    localPublication,
    verification: verifyReleaseTree(context.releaseTree)
  };
}

function commandSummary(result) {
  if (!result.report) {
    return {
      system: SYSTEM,
      action: result.action,
      status: result.validation?.valid ? 'READY' : 'REVIEW_REQUIRED',
      targetCount: result.context?.matrix.targetCount || 27,
      productCount: result.productInspection?.productCount || 0,
      toolchainMissing: result.toolchain?.missing || [],
      githubRequired: false,
      localRegistryOnly: true
    };
  }
  return {
    system: SYSTEM,
    action: result.action,
    status: result.report.status,
    productCount: result.report.productCount,
    targetCount: result.report.targetCount,
    builtCount: result.report.builtCount,
    inspectedCount: result.report.inspectedCount,
    verifiedCount: result.report.verifiedCount,
    nativeVerifiedCount: result.report.nativeVerifiedCount,
    auxiliaryArtifactCount: result.report.auxiliaryArtifactCount,
    totalArtifactCount: result.report.totalArtifactCount,
    publishedLocallyCount: result.report.publishedLocallyCount,
    publishedExternallyCount: result.report.publishedExternallyCount,
    githubRequired: result.report.githubRequired,
    localRegistryOnly: result.report.localRegistryOnly,
    localReleasePath: result.report.localReleasePath,
    reports: result.report.reports
  };
}

if (require.main === module) {
  try {
    const action = process.argv[2] || 'status';
    const result = execute(action);
    console.log(JSON.stringify(commandSummary(result), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ system: SYSTEM, status: 'FAILED', error: error.message }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = {
  ARTIFACT_INVENTORY_REPORT,
  MAIN_REPORT,
  MATRIX_PATH,
  PRODUCT_MATRIX_REPORT,
  SYSTEM,
  TOOLCHAIN_REPORT,
  commandSummary,
  createContext,
  execute,
  inspectNativeDependencies,
  inspectProducts,
  inspectToolchain,
  publishAtomic,
  setReleasePublicationState,
  validateMatrix,
  validateResultClaims,
  verifyReleaseTree,
  writeReleaseIndex
};
