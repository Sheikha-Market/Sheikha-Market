'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  createContext,
  inspectToolchain,
  scanSecrets,
  validateMatrix,
  validateResultClaims,
  verifyReleaseIndex
} = require('../distribution/scripts/sheikha-distribution-v1');

const ROOT = path.join(__dirname, '..');
const MATRIX_PATH = path.join(
  ROOT,
  'distribution/manifest/sheikha-release-matrix-v1.json'
);
const REPORT_PATH = path.join(
  ROOT,
  'runtime/distribution/v1/sheikha-universal-distribution-v1-report.json'
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('Sheikha Universal Distribution and Installer Fabric V1', () => {
  test('defines exactly 27 unique release targets', () => {
    const matrix = readJson(MATRIX_PATH);
    const validation = validateMatrix(matrix);

    expect(validation).toEqual({
      valid: true,
      errors: [],
      platformCounts: { windows: 8, linux: 15, macos: 4 }
    });
    expect(new Set(matrix.targets.map((target) => target.id)).size).toBe(27);
  });

  test('uses technically correct architecture names and deterministic extensions', () => {
    const matrix = readJson(MATRIX_PATH);
    const architectures = new Set(matrix.targets.map((target) => target.architecture));

    expect(architectures).toEqual(new Set([
      'x64', 'arm64', 'amd64', 'armhf', 'x86_64', 'armv7hl', 'aarch64',
      'armv7', 'universal2'
    ]));
    expect(matrix.targets.find((target) => target.id === 'linux-deb-armhf').artifactName)
      .toBe('sheikha-1.0.51-linux-armhf.deb');
    expect(matrix.targets.find((target) => target.id === 'linux-rpm-armv7hl').artifactName)
      .toBe('sheikha-1.0.51-linux-armv7hl.rpm');
    expect(matrix.targets.every((target) => target.artifactName.includes(matrix.version)))
      .toBe(true);
  });

  test('records honest desktop and native-runner boundaries', () => {
    const matrix = readJson(MATRIX_PATH);
    const product = readJson(path.join(
      ROOT,
      'distribution/manifest/sheikha-product-manifest-v1.json'
    ));

    expect(product.desktopRuntime.implemented).toBe(false);
    expect(product.desktopRuntime.installerClaimAllowed).toBe(false);
    expect(matrix.targets.filter((target) => target.packageFormat === 'exe')
      .every((target) => target.status === 'REQUIRES_DESKTOP_RUNTIME_IMPLEMENTATION'))
      .toBe(true);
    expect(matrix.targets.find((target) => target.id === 'macos-dmg-universal2').status)
      .toBe('REQUIRES_DESKTOP_RUNTIME_IMPLEMENTATION');
  });

  test('rejects unsupported completion, native, signature, and notarization claims', () => {
    const result = validateResultClaims([
      {
        id: 'fake-verified',
        status: 'VERIFIED',
        built: false,
        verified: true,
        nativeVerified: false,
        signed: false,
        notarized: false,
        artifact: null
      },
      {
        id: 'fake-signed',
        status: 'SIGNING_REQUIRED',
        built: true,
        signed: true,
        notarized: true,
        signatureEvidence: [],
        notarizationEvidence: []
      }
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'fake-verified:verified-without-artifact',
      'fake-verified:verified-without-native-evidence',
      'fake-signed:signed-without-signature-evidence',
      'fake-signed:notarized-without-evidence'
    ]));
  });

  test('keeps channels local and prevents automatic external publication', () => {
    const channels = readJson(path.join(
      ROOT,
      'distribution/manifest/sheikha-update-channels-v1.json'
    ));
    const product = readJson(path.join(
      ROOT,
      'distribution/manifest/sheikha-product-manifest-v1.json'
    ));

    expect(channels.channels.every((channel) => channel.externalPublishing === false)).toBe(true);
    expect(channels.policy.silentOverwrite).toBe(false);
    expect(product.governance.localRegistryOnly).toBe(true);
    expect(product.governance.githubRequired).toBe(false);
  });

  test('contains no embedded secret material in distribution source', () => {
    expect(scanSecrets()).toEqual({ passed: true, findings: [] });
  });

  test('verifies built artifact checksums and release index when present', () => {
    expect(fs.existsSync(REPORT_PATH)).toBe(true);
    const report = readJson(REPORT_PATH);
    const context = createContext(inspectToolchain());
    const indexPath = path.join(context.versionRoot, 'release-index.json');

    expect(report.targetCount).toBe(27);
    expect(report.localRegistryOnly).toBe(true);
    expect(report.githubRequired).toBe(false);
    expect(report.targets.filter((target) => target.built).length).toBe(report.builtCount);
    expect(report.reproducibility).toMatchObject({ tested: true, passed: true });
    expect(report.localRegistryPublishedCount).toBe(3);
    expect(report.localReleasePath)
      .toBe(path.join(os.homedir(), 'Sheikha-Local-Registry/releases/1.0.51'));
    expect(fs.existsSync(indexPath)).toBe(true);
    expect(verifyReleaseIndex(context, readJson(indexPath))).toEqual({ valid: true, errors: [] });
  });
});
