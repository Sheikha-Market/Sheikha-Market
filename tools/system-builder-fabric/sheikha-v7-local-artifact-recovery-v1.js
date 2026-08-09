'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const EXPECTED_SHA256 =
  '936bdc0dfbb794e1fe41d8fd7799af95a9e3cc92b117a62c0b8b2383f6a571b9';
const EXPECTED_BYTES = 26200270;
const HISTORICAL_SOURCE_HEAD =
  '33752746f4969647191f0a830949ad328f0d9bc3';
const DEFAULT_BACKUP_ROOT =
  '/home/sheikha/Backups/sheikha/' +
  'v7-complete-finalization-20260713-225943';
const ARTIFACT_RELATIVE_PATH =
  'distribution/artifacts/v7/1.0.51_sheikha.v7.1/artifacts/' +
  'sheikha-1.0.51-0.sheikha.v7.1.x86_64.rpm';
const RECOVERY_REPORT =
  'runtime/distribution/v7/recovery/' +
  'sheikha-v7-local-artifact-recovery-verification-v1.json';
const FABRIC_REPORT =
  'runtime/system-builder-fabric/v1/' +
  'sheikha-system-builder-fabric-v1.json';

function sha256File(file) {
  const hash = crypto.createHash('sha256');
  const descriptor = fs.openSync(file, 'r');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  try {
    let bytesRead;
    do {
      bytesRead = fs.readSync(
        descriptor,
        buffer,
        0,
        buffer.length,
        null
      );
      if (bytesRead > 0) {
        hash.update(buffer.subarray(0, bytesRead));
      }
    } while (bytesRead > 0);
  } finally {
    fs.closeSync(descriptor);
  }
  return hash.digest('hex');
}

function writeJsonAtomic(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(
    temporary,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8'
  );
  fs.renameSync(temporary, target);
}

function currentHead(root) {
  const gitPath = path.join(root, '.git');
  const head = fs.readFileSync(
    path.join(gitPath, 'HEAD'),
    'utf8'
  ).trim();
  if (!head.startsWith('ref: ')) return head;
  const reference = head.slice(5);
  const looseReference = path.join(gitPath, reference);
  if (fs.existsSync(looseReference)) {
    return fs.readFileSync(looseReference, 'utf8').trim();
  }
  const packedReferences = fs.readFileSync(
    path.join(gitPath, 'packed-refs'),
    'utf8'
  );
  const match = packedReferences
    .split('\n')
    .find((line) => line.endsWith(` ${reference}`));
  if (!match) throw new Error('CURRENT_GIT_HEAD_NOT_FOUND');
  return match.split(' ')[0];
}

function verifyRpmMagic(file) {
  const descriptor = fs.openSync(file, 'r');
  const magic = Buffer.alloc(4);
  try {
    fs.readSync(descriptor, magic, 0, magic.length, 0);
  } finally {
    fs.closeSync(descriptor);
  }
  return magic.toString('hex') === 'edabeedb';
}

function recover(options = {}) {
  const root = path.resolve(options.root || ROOT);
  const backupRoot = path.resolve(
    options.backupRoot ||
    process.env.SHEIKHA_V7_RECOVERY_BACKUP_ROOT ||
    DEFAULT_BACKUP_ROOT
  );
  const sourceArtifact = path.join(
    backupRoot,
    'sheikha-1.0.51-0.sheikha.v7.1.x86_64.rpm'
  );
  const sourceReport = path.join(
    backupRoot,
    'runtime-distribution-v7-before/evidence/' +
    'sheikha-v7-rpm-native-build-report.json'
  );
  const targetArtifact = path.join(root, ARTIFACT_RELATIVE_PATH);
  const expectedSha256 =
    options.expectedSha256 || EXPECTED_SHA256;
  const expectedBytes =
    Number(options.expectedBytes || EXPECTED_BYTES);

  if (!fs.existsSync(sourceArtifact) || !fs.existsSync(sourceReport)) {
    throw new Error('V7_RECOVERY_SOURCE_EVIDENCE_MISSING');
  }
  const sourceBytes = fs.statSync(sourceArtifact).size;
  const sourceSha256 = sha256File(sourceArtifact);
  const legacyReportBuffer = fs.readFileSync(sourceReport);
  const legacyReport = JSON.parse(legacyReportBuffer.toString('utf8'));
  if (
    sourceBytes !== expectedBytes ||
    sourceSha256 !== expectedSha256 ||
    legacyReport.artifact?.sha256 !== expectedSha256 ||
    legacyReport.sourceHead !== HISTORICAL_SOURCE_HEAD ||
    !verifyRpmMagic(sourceArtifact)
  ) {
    throw new Error('V7_RECOVERY_SOURCE_VERIFICATION_FAILED');
  }

  fs.mkdirSync(path.dirname(targetArtifact), { recursive: true });
  if (fs.existsSync(targetArtifact)) {
    if (
      fs.statSync(targetArtifact).size !== expectedBytes ||
      sha256File(targetArtifact) !== expectedSha256
    ) {
      throw new Error('V7_RECOVERY_TARGET_CONFLICT');
    }
  } else {
    const temporary = `${targetArtifact}.${process.pid}.tmp`;
    fs.copyFileSync(sourceArtifact, temporary);
    if (
      fs.statSync(temporary).size !== expectedBytes ||
      sha256File(temporary) !== expectedSha256
    ) {
      fs.unlinkSync(temporary);
      throw new Error('V7_RECOVERY_COPY_VERIFICATION_FAILED');
    }
    fs.renameSync(temporary, targetArtifact);
  }

  const verificationHead = currentHead(root);
  const generatedAt =
    options.generatedAt || new Date().toISOString();
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V7_LOCAL_ARTIFACT_RECOVERY_V1',
    generatedAt,
    status:
      'HISTORICAL_RPM_ARTIFACT_RECOVERED_AND_SHA256_VERIFIED',
    passed: true,
    artifact: {
      path: ARTIFACT_RELATIVE_PATH,
      bytes: expectedBytes,
      sha256: expectedSha256,
      rpmMagicVerified: true,
      architecture: 'x86_64',
      signed: false
    },
    provenance: {
      artifactSourceHead: HISTORICAL_SOURCE_HEAD,
      recoveryVerificationHead: verificationHead,
      historicalBuildReportSha256:
        crypto.createHash('sha256')
          .update(legacyReportBuffer)
          .digest('hex'),
      sourceBackup: sourceArtifact,
      copiedWithoutRebuild: true,
      rpmBuildCountAdded: 0
    },
    dependencyPolicy: {
      metadataComplete: false,
      nativeInstallAuthorized: false,
      lifecycleVerificationAuthorized: false,
      nextGate:
        'A newly accepted corrected-build contract is required before ' +
        'creating a dependency-corrected RPM.'
    },
    executionBoundaries: {
      networkUsed: false,
      sudoUsed: false,
      hostInstallExecuted: false,
      containerExecuted: false,
      externalPublishingExecuted: false,
      signingExecuted: false,
      gitMutationExecuted: false
    }
  };
  writeJsonAtomic(path.join(root, RECOVERY_REPORT), report);

  const fabricPath = path.join(root, FABRIC_REPORT);
  const fabric = JSON.parse(fs.readFileSync(fabricPath, 'utf8'));
  const updatedFabric = {
    ...fabric,
    sourceHead: verificationHead,
    verifiedAt: generatedAt,
    activeExecution: {
      ...fabric.activeExecution,
      status:
        'RECOVERED_HISTORICAL_ARTIFACT_CONTENT_VERIFIED_DEPENDENCY_GAP',
      artifactPath: ARTIFACT_RELATIVE_PATH,
      artifactSha256: expectedSha256,
      artifactBytes: expectedBytes,
      artifactPresent: true,
      artifactVerificationStatus: 'SHA256_VERIFIED',
      artifactSourceHead: HISTORICAL_SOURCE_HEAD,
      recoveryVerificationHead: verificationHead,
      dependencyMetadataComplete: false,
      nativeInstallVerified: false,
      lifecycleVerified: false,
      recoveryEvidence: RECOVERY_REPORT
    }
  };
  writeJsonAtomic(fabricPath, updatedFabric);
  return report;
}

if (require.main === module) {
  try {
    console.log(JSON.stringify(recover(), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  ARTIFACT_RELATIVE_PATH,
  EXPECTED_BYTES,
  EXPECTED_SHA256,
  FABRIC_REPORT,
  HISTORICAL_SOURCE_HEAD,
  RECOVERY_REPORT,
  recover,
  sha256File,
  verifyRpmMagic,
  writeJsonAtomic
};
