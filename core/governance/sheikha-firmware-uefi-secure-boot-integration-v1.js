'use strict';

const crypto = require('node:crypto');

const HASH = /^[a-f0-9]{64}$/;
const ARCHITECTURES = Object.freeze(['X86_64', 'AARCH64', 'RISCV64']);
const CHANNELS = Object.freeze(['LAB', 'PILOT', 'PRODUCTION']);

function object(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !fields.includes(key))) {
    throw new Error('INVALID_PLATFORM_RELEASE_FIELDS');
  }
}

function reference(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(value)) {
    throw new Error('INVALID_PLATFORM_RELEASE_REFERENCE');
  }
  return value;
}

function hash(value) {
  if (typeof value !== 'string' || !HASH.test(value)) throw new Error('INVALID_PLATFORM_RELEASE_SHA256');
  return value;
}

function requireBooleans(value, fields) {
  for (const key of fields) {
    if (typeof value[key] !== 'boolean') throw new Error('EXPLICIT_PLATFORM_CHECK_BOOLEAN_REQUIRED');
  }
}

function buildPlatformReleaseCompatibility(input) {
  object(input, ['releaseRef', 'channel', 'architecture', 'boardRef', 'firmware', 'uefi', 'secureBoot', 'verification']);
  object(input.firmware, ['vendorRef', 'versionRef', 'artifactSha256', 'signatureVerified', 'readbackBackupVerified']);
  object(input.uefi, ['specificationRef', 'bootArtifactSha256', 'gptEspVerified', 'exitBootServicesVerified']);
  object(input.secureBoot, ['enabled', 'setupMode', 'pkPresent', 'kekPresent', 'dbPresent', 'dbxPresent', 'bootSignerAllowed', 'bootArtifactRevoked', 'dbxCompatibilityChecked', 'dbxSnapshotSha256']);
  object(input.verification, ['qemuBootVerified', 'physicalBootVerified', 'recoveryBootVerified', 'tpmQuoteVerified', 'measuredBootVerified', 'sbomVerified', 'provenanceVerified']);
  requireBooleans(input.firmware, ['signatureVerified', 'readbackBackupVerified']);
  requireBooleans(input.uefi, ['gptEspVerified', 'exitBootServicesVerified']);
  requireBooleans(input.secureBoot, ['enabled', 'setupMode', 'pkPresent', 'kekPresent', 'dbPresent', 'dbxPresent', 'bootSignerAllowed', 'bootArtifactRevoked', 'dbxCompatibilityChecked']);
  requireBooleans(input.verification, ['qemuBootVerified', 'physicalBootVerified', 'recoveryBootVerified', 'tpmQuoteVerified', 'measuredBootVerified', 'sbomVerified', 'provenanceVerified']);

  const release = {
    releaseRef: reference(input.releaseRef),
    channel: CHANNELS.includes(input.channel) ? input.channel : (() => { throw new Error('INVALID_PLATFORM_RELEASE_CHANNEL'); })(),
    architecture: ARCHITECTURES.includes(input.architecture) ? input.architecture : (() => { throw new Error('INVALID_PLATFORM_RELEASE_ARCHITECTURE'); })(),
    boardRef: reference(input.boardRef),
    firmware: {
      vendorRef: reference(input.firmware.vendorRef), versionRef: reference(input.firmware.versionRef),
      artifactSha256: hash(input.firmware.artifactSha256), signatureVerified: input.firmware.signatureVerified === true,
      readbackBackupVerified: input.firmware.readbackBackupVerified === true,
    },
    uefi: {
      specificationRef: reference(input.uefi.specificationRef), bootArtifactSha256: hash(input.uefi.bootArtifactSha256),
      gptEspVerified: input.uefi.gptEspVerified === true, exitBootServicesVerified: input.uefi.exitBootServicesVerified === true,
    },
    secureBoot: {
      enabled: input.secureBoot.enabled === true, setupMode: input.secureBoot.setupMode === true,
      pkPresent: input.secureBoot.pkPresent === true, kekPresent: input.secureBoot.kekPresent === true,
      dbPresent: input.secureBoot.dbPresent === true, dbxPresent: input.secureBoot.dbxPresent === true,
      bootSignerAllowed: input.secureBoot.bootSignerAllowed === true, bootArtifactRevoked: input.secureBoot.bootArtifactRevoked === true,
      dbxCompatibilityChecked: input.secureBoot.dbxCompatibilityChecked === true,
      dbxSnapshotSha256: hash(input.secureBoot.dbxSnapshotSha256),
    },
    verification: Object.fromEntries(Object.entries(input.verification).map(([key, value]) => [key, value === true])),
  };

  const blockers = [];
  const requireCheck = (condition, code) => { if (!condition) blockers.push(code); };
  requireCheck(release.firmware.signatureVerified, 'FIRMWARE_SIGNATURE_NOT_VERIFIED');
  requireCheck(release.firmware.readbackBackupVerified, 'FIRMWARE_READBACK_BACKUP_NOT_VERIFIED');
  requireCheck(release.uefi.gptEspVerified, 'UEFI_GPT_ESP_NOT_VERIFIED');
  requireCheck(release.uefi.exitBootServicesVerified, 'UEFI_HANDOFF_NOT_VERIFIED');
  requireCheck(release.secureBoot.enabled && !release.secureBoot.setupMode, 'SECURE_BOOT_NOT_ENFORCING_USER_MODE');
  requireCheck(release.secureBoot.pkPresent && release.secureBoot.kekPresent && release.secureBoot.dbPresent && release.secureBoot.dbxPresent, 'SECURE_BOOT_TRUST_DATABASES_INCOMPLETE');
  requireCheck(release.secureBoot.bootSignerAllowed, 'BOOT_SIGNER_NOT_VERIFIED_IN_DB');
  requireCheck(!release.secureBoot.bootArtifactRevoked, 'BOOT_ARTIFACT_REVOKED_BY_DBX');
  requireCheck(release.secureBoot.dbxCompatibilityChecked, 'DBX_COMPATIBILITY_NOT_CHECKED');
  requireCheck(release.verification.qemuBootVerified, 'QEMU_BOOT_NOT_VERIFIED');
  requireCheck(release.verification.physicalBootVerified, 'PHYSICAL_BOOT_NOT_VERIFIED');
  requireCheck(release.verification.recoveryBootVerified, 'RECOVERY_BOOT_NOT_VERIFIED');
  requireCheck(release.verification.tpmQuoteVerified && release.verification.measuredBootVerified, 'TPM_MEASURED_BOOT_NOT_VERIFIED');
  requireCheck(release.verification.sbomVerified && release.verification.provenanceVerified, 'SUPPLY_CHAIN_EVIDENCE_NOT_VERIFIED');

  const candidate = {
    system: 'SHEIKHA_FIRMWARE_UEFI_SECURE_BOOT_INTEGRATION_V1',
    release,
    blockers,
    compatibilityDecision: blockers.length ? 'RELEASE_HOLD' : 'DECLARED_CHECKS_COMPLETE_PENDING_EVIDENCE_VERIFICATION',
    classification: 'CONFIDENTIAL_DECLARATION_REVIEW_ONLY',
    evidenceCryptographicallyVerified: false,
    compatibilityProven: false,
    executionAuthorized: false,
    automation: {
      observeAndGenerateCandidateAllowed: true,
      automaticFirmwareFlashAllowed: false,
      automaticSecureBootKeyMutationAllowed: false,
      automaticDbxUpdateAllowed: false,
      automaticProductionPublicationAllowed: false,
    },
    requiredMutationRoute: ['DEVICE_BOUND_CONTRACT', 'INDEPENDENT_HUMAN_APPROVAL', 'RECOVERY_MEDIA_BOOT_TEST', 'EXACT_ARTIFACT_AND_TARGET_BINDING', 'SINGLE_USE_CAPABILITY_TOKEN', 'POST_WRITE_READBACK_AND_AUDIT'],
    actualFirmwareWritePerformed: false,
    actualSecureBootMutationPerformed: false,
    productionReleased: false,
  };
  return {...candidate, candidateSha256: crypto.createHash('sha256').update(JSON.stringify(candidate)).digest('hex'), digestIsSignature: false};
}

module.exports = {ARCHITECTURES, CHANNELS, buildPlatformReleaseCompatibility};
