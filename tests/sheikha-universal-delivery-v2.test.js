'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  MAIN_REPORT,
  inspectProducts,
  publishAtomic,
  validateMatrix,
  validateResultClaims,
  verifyReleaseTree
} = require('../distribution/pipeline/sheikha-universal-delivery-v2');
const { WindowsInstallerAdapter } = require('../distribution/adapters/windows/windows-installer-adapter-v2');
const { SheikhaCliDistributionAdapter } = require('../distribution/adapters/cli/sheikha-cli-distribution-adapter-v2');
const { sha256File } = require('../distribution/common/distribution-utils');
const {
  RUNTIME_DIRECTORIES,
  RUNTIME_FILES,
  listTrackedRuntimeFiles
} = require('../distribution/common/source-staging-engine');
const { createSheikhaApiClient } = require('../sdk/sheikha-api');

const ROOT = path.join(__dirname, '..');
const MATRIX_PATH = path.join(ROOT, 'distribution/manifest/sheikha-target-matrix-v2.json');
const PRODUCTS_PATH = path.join(ROOT, 'distribution/manifest/sheikha-products-v2.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function createAtomicFixture(parent) {
  const releaseTree = path.join(parent, 'source', '1.2.3');
  for (const directory of ['artifacts', 'verification', 'sbom', 'provenance', 'metadata']) {
    fs.mkdirSync(path.join(releaseTree, directory), { recursive: true });
  }
  const artifactPath = path.join(releaseTree, 'artifacts', 'fixture.bin');
  fs.writeFileSync(artifactPath, 'governed fixture\n');
  for (const [directory, name] of [
    ['verification', 'fixture.bin.verification.json'],
    ['sbom', 'fixture.bin.cdx.json'],
    ['provenance', 'fixture.bin.provenance.json'],
    ['metadata', 'fixture.bin.manifest.json']
  ]) fs.writeFileSync(path.join(releaseTree, directory, name), '{}\n');
  const artifact = {
    artifactId: 'fixture',
    targetId: null,
    product: 'fixture',
    productVersion: '1.2.3',
    status: 'INSPECTED',
    name: 'fixture.bin',
    relativePath: 'artifacts/fixture.bin',
    bytes: fs.statSync(artifactPath).size,
    sha256: sha256File(artifactPath),
    verification: 'verification/fixture.bin.verification.json',
    sbom: 'sbom/fixture.bin.cdx.json',
    provenance: 'provenance/fixture.bin.provenance.json',
    metadata: 'metadata/fixture.bin.manifest.json'
  };
  fs.writeFileSync(path.join(releaseTree, 'release-index.json'), `${JSON.stringify({
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_LOCAL_RELEASE_INDEX_V2',
    version: '1.2.3',
    artifactCount: 1,
    localRegistryOnly: true,
    githubRequired: false,
    artifacts: [artifact]
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(releaseTree, 'rollback-manifest.json'), `${JSON.stringify({
    version: '1.2.3',
    silentOverwriteAllowed: false
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(releaseTree, 'SHA256SUMS'), `${artifact.sha256}  artifacts/fixture.bin\n`);
  fs.writeFileSync(path.join(releaseTree, 'MANIFEST.txt'), 'artifacts/fixture.bin\n');
  return releaseTree;
}

describe('Sheikha Universal Delivery, Distribution and Installer Fabric V2', () => {
  test('defines exactly 27 unique targets from one valid source matrix', () => {
    const matrix = readJson(MATRIX_PATH);
    const validation = validateMatrix(matrix, readJson(PRODUCTS_PATH));

    expect(validation).toMatchObject({
      valid: true,
      errors: [],
      platformCounts: { windows: 8, linux: 15, macos: 4 },
      uniqueTargetIds: 27,
      uniqueArtifactNames: 27
    });
    expect(matrix.sourceOfTruth).toBe(true);
    expect(new Set(matrix.targets.map((target) => target.id)).size).toBe(27);
  });

  test('requires every target contract field and an explicitly allowed status', () => {
    const matrix = readJson(MATRIX_PATH);
    const required = [
      'id', 'product', 'platform', 'operatingSystem', 'architecture', 'format',
      'installationScope', 'runtimeType', 'buildStrategy', 'buildHostRequirement',
      'nativeRunnerRequirement', 'signingRequirement', 'notarizationRequirement',
      'publicationRequirement', 'artifactName', 'status', 'evidence', 'limitations'
    ];
    for (const target of matrix.targets) {
      expect(required.every((field) => Object.hasOwn(target, field))).toBe(true);
      expect(matrix.allowedStatuses).toContain(target.status);
    }
  });

  test('keeps product compatibility honest and excludes the absent desktop runtime', () => {
    const products = readJson(PRODUCTS_PATH);
    const inspection = inspectProducts(products);

    expect(inspection).toEqual({
      valid: true,
      errors: [],
      productCount: 4,
      implementedProductIds: [
        'sheikha-cli',
        'sheikha-server-runtime',
        'sheikha-vscode-extension',
        'sheikha-bare-metal-seed'
      ],
      declaredCandidateIds: ['sheikha-desktop']
    });
    expect(products.declaredCandidates[0]).toMatchObject({
      id: 'sheikha-desktop',
      implemented: false,
      installerClaimAllowed: false
    });
  });

  test('uses one profiled Windows installer adapter for user and system scopes', () => {
    const user = new WindowsInstallerAdapter({ installationScope: 'current-user' });
    const system = new WindowsInstallerAdapter({ installationScope: 'system' });

    expect(user).toBeInstanceOf(WindowsInstallerAdapter);
    expect(system).toBeInstanceOf(WindowsInstallerAdapter);
    expect(user.profile.installationScope).toBe('current-user');
    expect(system.profile.installationScope).toBe('system');
    expect(() => new WindowsInstallerAdapter({ installationScope: 'unknown' })).toThrow();
  });

  test('declares the CLI external Node runtime instead of calling it standalone', () => {
    const target = readJson(MATRIX_PATH).targets.find((item) => item.id === 'linux-cli-x86_64');
    const inspection = new SheikhaCliDistributionAdapter(target).inspectSource();

    expect(inspection).toMatchObject({
      launcherExists: true,
      launcherExecutable: true,
      requiresExternalNodeRuntime: true,
      standalone: false,
      nativeExecutable: false,
      nativeArchitectureClaimAllowed: false
    });
  });

  test('rejects verified, native, signed, and notarized claims without evidence', () => {
    const claims = validateResultClaims([
      { id: 'fake', status: 'VERIFIED', verified: true, built: false, nativeVerified: false },
      { id: 'signed', status: 'SIGNING_REQUIRED', signed: true, signatureEvidence: [] },
      { id: 'notarized', status: 'NOTARIZATION_REQUIRED', notarized: true, notarizationEvidence: [] }
    ]);

    expect(claims.valid).toBe(false);
    expect(claims.errors).toEqual(expect.arrayContaining([
      'fake:verified-without-artifact',
      'fake:verified-without-native-evidence',
      'signed:signed-without-evidence',
      'notarized:notarized-without-evidence'
    ]));
  });

  test('publishes atomically and rejects a silent overwrite', () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-delivery-v2-'));
    try {
      const releaseTree = createAtomicFixture(fixture);
      const registryRoot = path.join(fixture, 'registry');
      const context = { releaseTree, version: '1.2.3' };
      const published = publishAtomic(context, registryRoot);

      expect(published.releaseRoot).toBe(path.join(registryRoot, '1.2.3'));
      expect(published.verification.valid).toBe(true);
      expect(readJson(path.join(published.releaseRoot, 'release-index.json')))
        .toMatchObject({
          localPublicationState: 'PUBLISHED_LOCAL_ATOMIC',
          artifacts: [{ publicationState: 'PUBLISHED_LOCAL_ATOMIC' }]
        });
      expect(() => publishAtomic(context, registryRoot)).toThrow(/will not be overwritten/u);
      expect(fs.readdirSync(registryRoot).some((name) => name.startsWith('.staging-'))).toBe(false);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  test('contains a verified release tree with no fake Windows EXE or macOS DMG', () => {
    expect(fs.existsSync(MAIN_REPORT)).toBe(true);
    const report = readJson(MAIN_REPORT);
    const releaseTree = path.join(ROOT, 'distribution', 'artifacts', 'v2', report.sourceVersion);
    const verification = verifyReleaseTree(releaseTree);
    const index = verification.index;

    expect(verification.valid).toBe(true);
    expect(index.artifacts.some((artifact) => artifact.name.endsWith('.exe'))).toBe(false);
    expect(index.artifacts.some((artifact) => artifact.name.endsWith('.dmg'))).toBe(false);
    expect(index.artifacts.every((artifact) => /^[a-f0-9]{64}$/u.test(artifact.sha256))).toBe(true);
    expect(index.artifacts.every((artifact) => fs.existsSync(path.join(releaseTree, artifact.sbom)))).toBe(true);
    expect(index.artifacts.every((artifact) => fs.existsSync(path.join(releaseTree, artifact.provenance)))).toBe(true);
  });

  test('links current Bare-Metal checksums and QEMU marker without a hardware claim', () => {
    const report = readJson(MAIN_REPORT);
    const bareMetal = report.auxiliaryProducts.filter((item) => item.product === 'sheikha-bare-metal-seed');

    expect(bareMetal).toHaveLength(2);
    expect(bareMetal.every((item) => item.qemuVerified === true)).toBe(true);
    expect(bareMetal.every((item) => item.nativeVerified === false)).toBe(true);
    expect(bareMetal.map((item) => item.artifact.sha256)).toEqual(expect.arrayContaining([
      '99b952b84b0b33f61b6c0184f174b5ace0d8216cbdcf391a4ddca1c64e0365dd',
      'ff385760c1cf5c9ee83f2a95c60b6225bc4f716e68dda306aa67ed21195597d8'
    ]));
  });

  test('keeps release channels local with no GitHub or automatic external publishing', () => {
    const channels = readJson(path.join(ROOT, 'distribution/manifest/sheikha-release-channels-v2.json'));
    const products = readJson(PRODUCTS_PATH);

    expect(channels.channels.map((item) => item.id)).toEqual(['dev', 'beta', 'stable']);
    expect(channels.channels.every((item) => item.externalPublishing === false)).toBe(true);
    expect(channels.policy.silentOverwrite).toBe(false);
    expect(products.governance.githubRequired).toBe(false);
    expect(products.governance.externalPublishingAutomatic).toBe(false);
  });

  test('stages every runtime root required by the packaged server bootstrap', () => {
    const trackedRuntimeFiles = listTrackedRuntimeFiles();

    expect(RUNTIME_DIRECTORIES).toEqual(expect.arrayContaining([
      'knowledge',
      'sheikha-language'
    ]));
    expect(RUNTIME_FILES).toEqual(expect.arrayContaining([
      'routes/pr-governance/status.routes.js',
      'routes/runtime/verification/status.routes.js',
      'runtime/distribution/v2/sheikha-universal-delivery-v2-status.js',
      'runtime/distribution/v3/sheikha-native-delivery-v3-status.js',
      'runtime/distribution/v3.1/sheikha-native-desktop-v31-status.js',
      'runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json',
      'runtime/snapshots/sheikha-snapshot-engine.js',
      'tools/activation/sheikha-unified-apex-manifest-v1.json'
    ]));
    expect(trackedRuntimeFiles).toEqual(expect.arrayContaining([
      'knowledge/quranic-atlas/sheikha-quranic-architectural-atlas.json',
      'knowledge/quranic-operating-system/sheikha-quranic-operating-system-atlas-omega-v1.json',
      'knowledge/unified-graph/sheikha-unified-graph-fabric-v1.json',
      'routes/pr-governance/status.routes.js',
      'routes/runtime/verification/status.routes.js',
      'runtime/distribution/v2/sheikha-universal-delivery-v2-status.js',
      'runtime/distribution/v3/sheikha-native-delivery-v3-status.js',
      'runtime/distribution/v3.1/sheikha-native-desktop-v31-status.js',
      'runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json',
      'runtime/snapshots/sheikha-snapshot-engine.js',
      'sheikha-language/compiler/lexer.js',
      'tools/activation/sheikha-unified-apex-manifest-v1.json'
    ]));
  });

  test('defines a bounded clean shutdown for packaged runtime lifecycle tests', () => {
    const source = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');

    expect(source).toContain("process.once('SIGTERM'");
    expect(source).toContain("process.once('SIGINT'");
    expect(source).toContain('SHEIKHA_RUNTIME_CLEAN_SHUTDOWN_OK');
    expect(source).toContain('server.close(finish)');
  });

  test('exposes read-only V2 delivery operations through the local SDK', async () => {
    const calls = [];
    const client = createSheikhaApiClient({
      fetchImpl: async (url, options) => {
        calls.push({ url, options });
        return { ok: true, status: 200, json: async () => ({ success: true }) };
      }
    });

    await client.delivery.status();
    await client.delivery.matrix();
    await client.delivery.releaseIndex();
    expect(calls.map((call) => call.url)).toEqual([
      'http://localhost:8080/api/sheikha/distribution-apex/v2/status',
      'http://localhost:8080/api/sheikha/distribution-apex/v2/matrix',
      'http://localhost:8080/api/sheikha/distribution-apex/v2/release-index'
    ]);
    expect(calls.every((call) => call.options.method === 'GET')).toBe(true);
  });
});
