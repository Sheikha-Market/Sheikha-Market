'use strict';

const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const destination = path.resolve(
  process.argv[2] || '/tmp/sheikha-v6-local-release/1.0.51'
);
const reportPath = path.join(
  root,
  'runtime/distribution/v6/sheikha-linux-deb-native-lifecycle-v6-report.json'
);
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const releaseToolCommit = execFileSync(
  'git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }
).trim();
const artifactSourceCommit =
  '91097129fe2beabb6ef0e463871f9c608860c517';

if (
  report.status !== 'DEB_NATIVE_LIFECYCLE_VERIFIED' ||
  report.nativeVerified !== true ||
  report.canonicalPromotionAllowed !== true
) {
  throw new Error('V6 native lifecycle is not eligible for local release.');
}

if (fs.existsSync(destination)) {
  throw new Error(`Refusing to overwrite existing release: ${destination}`);
}

const sha256 = file => crypto
  .createHash('sha256')
  .update(fs.readFileSync(file))
  .digest('hex');

const artifacts = [
  ['runtime-baseline', report.artifacts.baseline],
  ['linux-deb-amd64', report.artifacts.candidate]
].map(([artifactId, evidence]) => {
  const source = path.join(root, evidence.path);
  const name = path.basename(source);
  const bytes = fs.statSync(source).size;
  const digest = sha256(source);

  if (bytes !== evidence.bytes || digest !== evidence.sha256) {
    throw new Error(`Artifact evidence mismatch: ${name}`);
  }

  return {
    artifactId,
    source,
    name,
    bytes,
    sha256: digest,
    version: evidence.version,
    nativeVerified: artifactId === 'linux-deb-amd64'
  };
});

if (new Set(artifacts.map(item => item.name)).size !== artifacts.length) {
  throw new Error('Duplicate artifact names detected.');
}
if (new Set(artifacts.map(item => item.sha256)).size !== artifacts.length) {
  throw new Error('Duplicate artifact hashes detected.');
}

for (const directory of [
  'artifacts', 'metadata', 'provenance', 'sbom', 'verification'
]) {
  fs.mkdirSync(path.join(destination, directory), { recursive: true });
}

const writeJson = (relative, value) => fs.writeFileSync(
  path.join(destination, relative),
  `${JSON.stringify(value, null, 2)}\n`,
  { encoding: 'utf8', mode: 0o644 }
);

for (const artifact of artifacts) {
  fs.copyFileSync(
    artifact.source,
    path.join(destination, 'artifacts', artifact.name)
  );

  writeJson(`metadata/${artifact.name}.manifest.json`, {
    schemaVersion: '6.0.0',
    artifactId: artifact.artifactId,
    name: artifact.name,
    version: artifact.version,
    architecture: 'amd64',
    format: 'deb',
    bytes: artifact.bytes,
    sha256: artifact.sha256
  });
  writeJson(`provenance/${artifact.name}.provenance.json`, {
    schemaVersion: '6.0.0',
    artifactSourceCommit,
    releaseToolCommit,
    sourceReport: path.relative(root, reportPath),
    buildNetworkUsed: false,
    hostInstallationUsed: false,
    signingUsed: false,
    githubUsed: false
  });
  writeJson(`verification/${artifact.name}.verification.json`, {
    schemaVersion: '6.0.0',
    artifactId: artifact.artifactId,
    checksumVerified: true,
    inspected: true,
    nativeVerified: artifact.nativeVerified,
    lifecycleVerified: artifact.artifactId === 'linux-deb-amd64',
    externalNetworkUsed: false
  });
  writeJson(`sbom/${artifact.name}.cdx.json`, {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    version: 1,
    metadata: { component: {
      type: 'application',
      name: 'sheikha',
      version: artifact.version,
      hashes: [{ alg: 'SHA-256', content: artifact.sha256 }]
    } },
    components: []
  });
}

const generatedAt = new Date().toISOString();
const index = {
  schemaVersion: '6.0.0',
  system: 'SHEIKHA_LOCAL_RELEASE_INDEX_V6',
  version: '1.0.51+sheikha.v6.2',
  channel: 'verified-local',
  sourceCommit: releaseToolCommit,
  artifactSourceCommit,
  generatedAt,
  artifactCount: artifacts.length,
  builtCount: 2,
  verifiedCount: 1,
  nativeVerifiedCount: 1,
  targetCount: 27,
  remainingTargetCount: 24,
  localRegistryOnly: true,
  githubRequired: false,
  externalPublishingRequested: false,
  artifacts: artifacts.map(item => ({
    artifactId: item.artifactId,
    name: item.name,
    version: item.version,
    relativePath: `artifacts/${item.name}`,
    bytes: item.bytes,
    sha256: item.sha256,
    status: item.nativeVerified ? 'VERIFIED' : 'ROLLBACK_BASELINE',
    nativeVerified: item.nativeVerified,
    signed: false,
    notarized: false
  }))
};

writeJson('release-index.json', index);
writeJson('rollback-manifest.json', {
  schemaVersion: '6.0.0',
  system: 'SHEIKHA_LOCAL_RELEASE_ROLLBACK_MANIFEST_V6',
  version: index.version,
  immutableRelease: true,
  silentOverwriteAllowed: false,
  rollbackArtifact: `artifacts/${artifacts[0].name}`,
  rollbackVersion: artifacts[0].version,
  rollbackRequiresHumanApproval: true,
  restoreChecksumsFrom: 'SHA256SUMS'
});

const checksumLines = artifacts
  .map(item => `${item.sha256}  artifacts/${item.name}`)
  .join('\n') + '\n';
fs.writeFileSync(path.join(destination, 'SHA256SUMS'), checksumLines);

const files = fs.readdirSync(destination, { recursive: true })
  .map(String)
  .filter(relative => fs.statSync(path.join(destination, relative)).isFile())
  .sort();
fs.writeFileSync(path.join(destination, 'MANIFEST.txt'), `${files.join('\n')}\n`);

console.log(JSON.stringify({ destination, ...index }, null, 2));
