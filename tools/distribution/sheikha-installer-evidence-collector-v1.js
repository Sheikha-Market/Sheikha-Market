'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  loadMatrix
} = require('../../core/distribution/sheikha-installer-distribution-governance-v1');
const {
  loadEvidenceTemplate
} = require('../../core/distribution/sheikha-native-installer-build-execution-v1');

function parseArgs(argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];

    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument near: ${key || '<empty>'}`);
    }

    args[key.slice(2)] = value;
  }

  return args;
}

function requiredFile(args, key) {
  const value = args[key];

  if (!value) {
    throw new Error(`--${key} is required`);
  }

  const resolved = path.resolve(value);

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    throw new Error(`Evidence file does not exist: ${resolved}`);
  }

  return resolved;
}

function sha256(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function parseBoolean(value) {
  return String(value).toLowerCase() === 'true';
}

function main() {
  const args = parseArgs(process.argv);
  const targetId = args['target-id'];

  if (!targetId) {
    throw new Error('--target-id is required');
  }

  const target = loadMatrix().targets.find((item) => item.id === targetId);

  if (!target) {
    throw new Error(`Unknown target: ${targetId}`);
  }

  const artifact = requiredFile(args, 'artifact');
  const buildLog = requiredFile(args, 'build-log');
  const sbom = requiredFile(args, 'sbom');
  const provenance = requiredFile(args, 'provenance');
  const installTestLog = requiredFile(args, 'install-test-log');
  const smokeTestLog = requiredFile(args, 'smoke-test-log');
  const uninstallTestLog = requiredFile(args, 'uninstall-test-log');
  const signingStatus = requiredFile(args, 'signing-status');
  const output = path.resolve(args.output || `${targetId}.json`);

  const sourceRoot = path.resolve(args.root || process.cwd());
  const sourceCommit = execFileSync(
    'git',
    ['-C', sourceRoot, 'rev-parse', 'HEAD'],
    { encoding: 'utf8' }
  ).trim();

  const evidence = loadEvidenceTemplate();
  const artifactStat = fs.statSync(artifact);

  evidence.targetId = targetId;
  evidence.sourceCommit = sourceCommit;
  evidence.artifact = {
    path: artifact,
    fileName: path.basename(artifact),
    sizeBytes: artifactStat.size,
    sha256: sha256(artifact)
  };
  evidence.runner = {
    platform: process.platform,
    architecture: process.arch,
    hostName: os.hostname(),
    startedAt: args['started-at'] || '',
    completedAt: new Date().toISOString()
  };
  evidence.evidenceFiles = {
    buildLog,
    sbom,
    provenance,
    installTestLog,
    smokeTestLog,
    uninstallTestLog,
    signingStatus,
    storeReceipt: args['store-receipt']
      ? requiredFile(args, 'store-receipt')
      : ''
  };

  evidence.gates.SOURCE_COMMIT_BOUND = true;
  evidence.gates.NATIVE_BUILD_COMPLETED = true;
  evidence.gates.ARTIFACT_PRESENT = true;
  evidence.gates.SHA256_RECORDED = true;
  evidence.gates.SBOM_RECORDED = true;
  evidence.gates.PROVENANCE_RECORDED = true;
  evidence.gates.NATIVE_INSTALL_TEST_PASSED =
    parseBoolean(args['install-test-passed']);
  evidence.gates.SMOKE_TEST_PASSED =
    parseBoolean(args['smoke-test-passed']);
  evidence.gates.UNINSTALL_TEST_PASSED =
    parseBoolean(args['uninstall-test-passed']);
  evidence.gates.SIGNATURE_OR_UNSIGNED_STATUS_RECORDED = true;

  if (target.platform === 'windows') {
    evidence.gates.WINDOWS_CODE_SIGNING_STATUS_RECORDED = true;
  }

  if (target.platform === 'macos') {
    evidence.gates.MACOS_SIGNING_STATUS_RECORDED = true;
    evidence.gates.MACOS_NOTARIZATION_STATUS_RECORDED =
      parseBoolean(args['notarization-status-recorded']);
  }

  if (target.storePublicationRequired) {
    evidence.gates.STORE_UPLOAD_COMPLETED =
      parseBoolean(args['store-upload-completed']);
    evidence.gates.STORE_PUBLICATION_STATUS_RECORDED =
      Boolean(evidence.evidenceFiles.storeReceipt);
  }

  evidence.humanReleaseApproval =
    parseBoolean(args['human-release-approval']);
  evidence.approval = {
    approvedBy: args['approved-by'] || '',
    approvedAt:
      evidence.humanReleaseApproval
        ? new Date().toISOString()
        : '',
    record: args['approval-record'] || ''
  };

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);

  process.stdout.write(`${JSON.stringify({
    system: 'SHEIKHA_INSTALLER_EVIDENCE_COLLECTION_RESULT_V1',
    targetId,
    sourceCommit,
    output,
    artifactSha256: evidence.artifact.sha256,
    humanReleaseApproval: evidence.humanReleaseApproval
  }, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
