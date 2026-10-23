'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const LIMIT = 2 * 1024 * 1024;
const COMMIT = /^[a-f0-9]{40}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const LANES = Object.freeze([
  { id: 'FIRMWARE', system: 'SHEIKHA_FIRMWARE_PLATFORM_OEM_ODM_V1', file: 'runtime/bare-metal/v3/firmware-platform/sheikha-firmware-platform-oem-odm-v1-report.json',
    requiredEvidence: ['BOARD_BOUND_SIGNED_IMAGE', 'TPM_QUOTE_AND_MEASURED_BOOT', 'SECURE_BOOT_AND_RECOVERY', 'INDEPENDENT_FLASH_AUTHORIZATION'] },
  { id: 'BARE_METAL', system: 'SHEIKHA_V2_PHYSICAL_BOOT_TRIAL_V1', file: 'runtime/bare-metal/v2/physical-trial/v1/sheikha-v2-physical-boot-trial-v1-report.json',
    requiredEvidence: ['CURRENT_SOURCE_AND_BOOT_ARTIFACT', 'QEMU_POST_FIRMWARE_MARKER', 'SEPARATE_PHYSICAL_TRIAL_AUTHORIZATION', 'PHYSICAL_BOOT_AND_RECOVERY'] },
  { id: 'NATIVE_C', system: 'SHEIKHA_NATIVE_DESKTOP_COMPLETION_V31', file: 'runtime/distribution/v3.1/sheikha-native-desktop-completion-v31-report.json',
    requiredEvidence: ['CURRENT_SOURCE_AND_LOCKFILES', 'GTK3_WEBKIT40_RUNTIME', 'FRESH_BINARY_AND_GUI_TESTS', 'INSTALLER_LIFECYCLE_AND_RECOVERY'] },
  { id: 'NATIVE_TAURI', system: 'SHEIKHA_NATIVE_DESKTOP_EXECUTABLE_V4', file: 'runtime/desktop-runtime/v4/sheikha-native-desktop-v4-report.json',
    requiredEvidence: ['CURRENT_SOURCE_AND_LOCKFILES', 'RUST_AND_WEBKIT41_DEVELOPMENT', 'FRESH_TAURI_BINARY_AND_GUI_TESTS', 'INSTALLER_LIFECYCLE_AND_RECOVERY'] }
].map(lane => Object.freeze({ ...lane, requiredEvidence: Object.freeze(lane.requiredEvidence) })));
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const token = value => typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,160}$/.test(value) ? value : null;
const bool = value => typeof value === 'boolean' ? value : null;

function describePlatformIntegration() {
  return { system: 'SHEIKHA_FIRMWARE_BARE_METAL_NATIVE_INTEGRATION_V1', mode: 'LOCAL_REPORT_REVIEW_ONLY',
    lanes: LANES.map(({ id, requiredEvidence }) => ({ id, requiredEvidence: [...requiredEvidence] })),
    connections: [
      { from: 'FIRMWARE_UEFI', to: 'BARE_METAL', contract: 'BOOT_ARTIFACT_HANDOFF_AND_RECOVERY' },
      { from: 'HOST_OS', to: 'NATIVE_C', contract: 'GTK3_WEBKIT40_RUNTIME_ABI' },
      { from: 'HOST_OS', to: 'NATIVE_TAURI', contract: 'TAURI2_WEBKIT41_RUNTIME_ABI' },
      { from: 'GOVERNANCE', to: 'ALL_RELEASE_LANES', contract: 'SOURCE_BOUND_EVIDENCE_AND_SEPARATE_APPROVAL' }
    ],
    independentReleaseLanes: true, nativeRequiresSheikhaFirmwareRelease: false,
    qemuSuccessProvesPhysicalBoot: false, reportDigestIsSignature: false,
    productionReady: false, executionAuthorized: false, publicHostDataIncluded: false };
}

// Reports are data, never executable adapters or artifact paths to follow.
function readReport(root, relative) {
  const file = path.join(root, relative); let fd;
  try {
    if (fs.realpathSync(file) !== file) throw Error('LINKED_REPORT');
    fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    const before = fs.fstatSync(fd, { bigint: true });
    if (!before.isFile() || before.nlink !== 1n || before.size > BigInt(LIMIT)) throw Error('UNSAFE_REPORT');
    const bytes = Buffer.alloc(Number(before.size) + 1); let size = 0;
    while (size < bytes.length) { const n = fs.readSync(fd, bytes, size, bytes.length - size, null); if (!n) break; size += n; }
    const after = fs.fstatSync(fd, { bigint: true });
    const current = fs.lstatSync(file, { bigint: true });
    if (BigInt(size) !== before.size || after.size !== before.size || after.mtimeNs !== before.mtimeNs || after.ctimeNs !== before.ctimeNs ||
        current.ino !== before.ino || current.dev !== before.dev || current.ctimeNs !== before.ctimeNs || fs.realpathSync(file) !== file) throw Error('REPORT_CHANGED');
    const data = bytes.subarray(0, size); const report = JSON.parse(data.toString('utf8'));
    if (!report || typeof report !== 'object' || Array.isArray(report)) throw Error('INVALID_REPORT');
    return { state: 'REPORT_READ', sha256: digest(data), report };
  } catch (error) { return { state: error.code === 'ENOENT' ? 'REPORT_MISSING' : 'REPORT_UNVERIFIED', sha256: null }; }
  finally { if (fd !== undefined) fs.closeSync(fd); }
}

function summarizeLane(lane, observed, expectedHead) {
  const result = { id: lane.id, file: lane.file, reportState: observed.state, reportSha256: observed.sha256,
    reportedStatus: null, reportedClaims: {}, sourceBinding: 'NOT_ESTABLISHED', reviewBlockers: [],
    artifactBytesVerified: false, evidenceAcceptedForRelease: false, productionReady: false,
    requiredEvidence: [...lane.requiredEvidence] };
  const report = observed.report;
  if (observed.state !== 'REPORT_READ') { result.reviewBlockers.push(observed.state); return result; }
  if (report.system !== lane.system) { result.reportState = 'REPORT_SCHEMA_MISMATCH'; result.reviewBlockers.push('REPORT_SCHEMA_MISMATCH'); return result; }
  result.reportedStatus = token(report.status);
  if (lane.id === 'FIRMWARE') {
    result.reportedClaims = { namedBoardFirmwareReady: bool(report.readiness?.namedBoardFirmwareReady),
      commercialReleaseReady: bool(report.readiness?.oemOdmCommercialReleaseReady), releaseDecision: token(report.actualFirmwareReleaseGate?.decision) };
  } else if (lane.id === 'BARE_METAL') {
    result.reportedClaims = { qemuBootVerified: bool(report.qemuBootVerified), physicalBootVerified: bool(report.physicalBootVerified),
      physicalBootExecuted: bool(report.physicalBootExecuted), physicalMediaWritten: bool(report.physicalMediaWritten) };
  } else if (lane.id === 'NATIVE_C') {
    result.reportedClaims = { nativeVerifiedTargetCount: Number.isSafeInteger(report.nativeVerifiedTargetCount) && report.nativeVerifiedTargetCount >= 0 ? report.nativeVerifiedTargetCount : null };
    result.baselineCommit = COMMIT.test(report.sourceBaselineCommit || '') ? report.sourceBaselineCommit : null;
    if (result.baselineCommit) result.sourceBinding = 'BASELINE_REFERENCE_NOT_BUILD_BINDING';
  } else {
    result.reportedClaims = { desktopExecutableBuilt: bool(report.desktopExecutableBuilt), nativeLaunchVerified: bool(report.nativeLaunchVerified) };
    result.reportedSourceCommit = COMMIT.test(report.actualStartHead || '') ? report.actualStartHead : null;
    result.reportedArtifactSha256 = DIGEST.test(report.artifact?.sha256 || '') ? report.artifact.sha256 : null;
    if (result.reportedSourceCommit) result.sourceBinding = result.reportedSourceCommit === expectedHead ? 'DECLARED_HEAD_MATCH_NOT_PROOF' : 'DIFFERENT_SOURCE_COMMIT';
  }
  result.reviewBlockers.push(result.sourceBinding, 'ARTIFACT_VERIFICATION_NOT_PERFORMED', 'INDEPENDENT_REVIEW_REQUIRED');
  return result;
}

function gitIdentity(root, runner = spawnSync) {
  const env = { PATH: '/usr/bin:/bin', LC_ALL: 'C', GIT_OPTIONAL_LOCKS: '0', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_NO_REPLACE_OBJECTS: '1' };
  const read = args => {
    const r = runner('/usr/bin/git', ['-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', '-C', root, ...args],
      { env, encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    return r.status === 0 ? r.stdout.trim() : null;
  };
  const head = read(['rev-parse', '--verify', 'HEAD']);
  const tree = read(['rev-parse', '--verify', 'HEAD^{tree}']);
  // Do not run status/diff against arbitrary repository filters; this reader establishes identity only.
  return { head: COMMIT.test(head || '') ? head : null, tree: COMMIT.test(tree || '') ? tree : null, clean: null };
}

function inspectPlatformEvidence({ repo, expectedHead, identityReader = gitIdentity } = {}) {
  if (typeof repo !== 'string' || !path.isAbsolute(repo) || !COMMIT.test(expectedHead || '')) throw Error('EXPLICIT_REPOSITORY_AND_FULL_HEAD_REQUIRED');
  const root = path.resolve(repo);
  if (!fs.lstatSync(root).isDirectory() || fs.realpathSync(root) !== root) throw Error('CANONICAL_REPOSITORY_REQUIRED');
  const before = identityReader(root);
  const lanes = LANES.map(lane => summarizeLane(lane, readReport(root, lane.file), expectedHead));
  const after = identityReader(root);
  const identityStable = Boolean(before?.head && before?.tree && JSON.stringify(before) === JSON.stringify(after));
  const headMatches = identityStable && after.head === expectedHead;
  const sourceMatches = headMatches && after.clean === true;
  const result = { ...describePlatformIntegration(), checkedAt: new Date().toISOString(),
    classification: 'REPORTS_REVIEWED_NOT_RELEASED', source: { expectedHead, observedHead: after.head, observedTree: after.tree, clean: after.clean,
      identityStable, headMatches, sourceMatches, worktreeCleanlinessChecked: typeof after.clean === 'boolean', snapshotAtomic: false, sourceMatchIsArtifactAttestation: false }, lanes,
    blockers: [...(!sourceMatches ? ['SOURCE_IDENTITY_OR_CLEANLINESS_NOT_ESTABLISHED'] : []), 'NO_INDEPENDENT_CURRENT_RELEASE_EVIDENCE'],
    boundaries: { reportTextPublished: false, privateDeviceDetailsIncluded: false, artifactPathsFollowed: false,
      workspaceCodeExecuted: false, networkUsed: false, filesWritten: false, gitMutation: false, nativeBuildExecuted: false,
      qemuExecuted: false, physicalBootExecuted: false, tpmAccessed: false, firmwareAccessed: false, secureBootChanged: false,
      historicalChecksRerun: false, releaseGateChanged: false } };
  return { ...result, sha256: digest(JSON.stringify(result)) };
}

module.exports = { LANES, describePlatformIntegration, inspectPlatformEvidence, summarizeLane, gitIdentity };
