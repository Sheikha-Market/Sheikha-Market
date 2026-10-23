'use strict';

const path = require('node:path');
const {BootEvidenceCollector, EVIDENCE_KINDS, MAX_EVIDENCE_BYTES, buildManifest} = require('../../core/governance/sheikha-boot-evidence-collector-v1');
const {ARCHITECTURES} = require('../../core/governance/sheikha-firmware-uefi-secure-boot-integration-v1');

const MAX_ARTIFACTS = 16;
const REQUIRED_KINDS = Object.freeze(['FIRMWARE_ARTIFACT', 'BOOTLOADER_ARTIFACT', 'SECURE_BOOT_DBX_EXPORT']);

function exactObject(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length || fields.some(key => !Object.hasOwn(value, key))) {
    throw new Error('INVALID_PLATFORM_EVIDENCE_FIELDS');
  }
}

function reference(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(value)) throw new Error('INVALID_PLATFORM_EVIDENCE_REFERENCE');
}

function validateInput(input) {
  exactObject(input, ['releaseRef', 'boardRef', 'architecture', 'artifacts']);
  reference(input.releaseRef);
  reference(input.boardRef);
  if (!ARCHITECTURES.includes(input.architecture)) throw new Error('INVALID_PLATFORM_EVIDENCE_ARCHITECTURE');
  if (!Array.isArray(input.artifacts) || !input.artifacts.length || input.artifacts.length > MAX_ARTIFACTS) throw new Error('INVALID_PLATFORM_EVIDENCE_COUNT');
  const ids = new Set();
  const paths = new Set();
  const requiredKinds = new Set();
  for (const entry of input.artifacts) {
    exactObject(entry, ['id', 'kind', 'relativePath', 'sha256']);
    reference(entry.id);
    if (!EVIDENCE_KINDS.includes(entry.kind)) throw new Error('UNAPPROVED_EVIDENCE_KIND');
    if (typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error('INVALID_PLATFORM_EVIDENCE_SHA256');
    if (typeof entry.relativePath !== 'string' || entry.relativePath.length > 512 || /[\\:]/.test(entry.relativePath) || [...entry.relativePath].some(char => char.codePointAt(0) < 32 || char.codePointAt(0) === 127) || entry.relativePath.split('/').some(part => ['', '.', '..'].includes(part))) {
      throw new Error('INVALID_PLATFORM_EVIDENCE_RELATIVE_PATH');
    }
    if (ids.has(entry.id) || paths.has(entry.relativePath) || (REQUIRED_KINDS.includes(entry.kind) && requiredKinds.has(entry.kind))) throw new Error('DUPLICATE_PLATFORM_EVIDENCE');
    ids.add(entry.id);
    paths.add(entry.relativePath);
    requiredKinds.add(entry.kind);
  }
}

function verifyPlatformEvidence(input, {workspaceRoot, allowedRoots}) {
  validateInput(input);
  if (!path.isAbsolute(workspaceRoot) || !Array.isArray(allowedRoots) || !allowedRoots.length) throw new Error('TRUSTED_PLATFORM_EVIDENCE_ROOTS_REQUIRED');
  // Roots come from the local caller, never from the manifest or an HTTP request.
  const collector = new BootEvidenceCollector({allowedRoots, maxBytes: MAX_EVIDENCE_BYTES});
  const records = [];
  const artifacts = input.artifacts.map(entry => {
    const base = {id: entry.id, kind: entry.kind, expectedSha256: entry.sha256};
    try {
      const record = collector.ingest({filePath: path.resolve(workspaceRoot, entry.relativePath), kind: entry.kind, source: 'OPERATOR_SELECTED_SAVED_FILE'});
      records.push(record);
      const matches = record.sha256 === entry.sha256;
      return {...base, actualSha256: record.sha256, sizeBytes: record.sizeBytes, byteIntegrityVerified: matches && record.sizeBytes > 0,
        status: !record.sizeBytes ? 'EMPTY_EVIDENCE_FILE' : matches ? 'MATCH' : 'SHA256_MISMATCH'};
    } catch (error) {
      const reason = error.code === 'ENOENT' ? 'EVIDENCE_FILE_MISSING' : /^[A-Z0-9_]+$/.test(error.message) ? error.message : 'EVIDENCE_FILE_UNREADABLE';
      return {...base, actualSha256: null, byteIntegrityVerified: false, status: reason};
    }
  });
  const missingKinds = REQUIRED_KINDS.filter(kind => !artifacts.some(entry => entry.kind === kind));
  const providedFilesVerified = artifacts.every(entry => entry.byteIntegrityVerified);
  const requiredFilesVerified = missingKinds.length === 0 && providedFilesVerified;
  const byteBlockers = [
    ...missingKinds.map(kind => ({kind, reason: 'REQUIRED_EVIDENCE_NOT_SUPPLIED'})),
    ...artifacts.filter(entry => !entry.byteIntegrityVerified).map(entry => ({id: entry.id, kind: entry.kind, reason: entry.status})),
  ];
  return {
    system: 'SHEIKHA_PLATFORM_RELEASE_FILE_VERIFICATION_V1',
    classification: 'CONFIDENTIAL_OFFLINE_FILE_VERIFICATION',
    checkedAt: new Date().toISOString(),
    releaseRef: input.releaseRef, boardRef: input.boardRef, architecture: input.architecture,
    identitySource: 'CALLER_DECLARATION_NOT_DEVICE_ATTESTATION',
    expectedHashesSource: 'CALLER_MANIFEST_NOT_AUTHENTICATED',
    status: requiredFilesVerified ? 'BYTES_VERIFIED_PENDING_TRUST_CHECKS' : 'RELEASE_HOLD',
    artifacts, byteBlockers, providedFilesVerified, requiredFilesVerified,
    collectedManifest: buildManifest(records),
    fileLimits: {maxArtifacts: MAX_ARTIFACTS, maxBytesPerArtifact: MAX_EVIDENCE_BYTES},
    remainingTrustChecks: [
      'AUTHENTICATED_RELEASE_MANIFEST_REQUIRED', 'FIRMWARE_AND_EFI_SIGNATURE_VERIFICATION_REQUIRED',
      'SECURE_BOOT_DB_AND_DBX_SEMANTIC_VERIFICATION_REQUIRED', 'DEVICE_BOUND_FRESH_TPM_AND_MEASURED_BOOT_VERIFICATION_REQUIRED',
      'BOARD_COMPATIBILITY_AND_RECOVERY_EVIDENCE_REQUIRED', 'INDEPENDENT_RELEASE_AUTHORIZATION_REQUIRED',
    ],
    signatureVerified: false, platformCompatibilityVerified: false, productionReleased: false, executionAuthorized: false,
    tpmAccessed: false, firmwareWritten: false, secureBootModified: false, networkCalls: 0, contentsExecuted: false,
  };
}

module.exports = {MAX_ARTIFACTS, REQUIRED_KINDS, validateInput, verifyPlatformEvidence};
