'use strict';

const {buildPlatformReleaseCompatibility} = require('../core/governance/sheikha-firmware-uefi-secure-boot-integration-v1');

function fixture() {
  return {
    releaseRef: 'SHEIKHA_NATIVE_CANDIDATE_V1', channel: 'PILOT', architecture: 'X86_64', boardRef: 'MSI_TEST_BOARD',
    firmware: {vendorRef: 'VENDOR_TO_VERIFY', versionRef: 'VERSION_TO_VERIFY', artifactSha256: 'a'.repeat(64), signatureVerified: true, readbackBackupVerified: true},
    uefi: {specificationRef: 'UEFI_2_11', bootArtifactSha256: 'b'.repeat(64), gptEspVerified: true, exitBootServicesVerified: true},
    secureBoot: {enabled: true, setupMode: false, pkPresent: true, kekPresent: true, dbPresent: true, dbxPresent: true, bootSignerAllowed: true, bootArtifactRevoked: false, dbxCompatibilityChecked: true, dbxSnapshotSha256: 'c'.repeat(64)},
    verification: {qemuBootVerified: true, physicalBootVerified: true, recoveryBootVerified: true, tpmQuoteVerified: true, measuredBootVerified: true, sbomVerified: true, provenanceVerified: true},
  };
}

test('complete declarations do not claim cryptographic or physical verification', () => {
  const result = buildPlatformReleaseCompatibility(fixture());
  expect(result.compatibilityDecision).toBe('DECLARED_CHECKS_COMPLETE_PENDING_EVIDENCE_VERIFICATION');
  expect(result.evidenceCryptographicallyVerified).toBe(false);
  expect(result.compatibilityProven).toBe(false);
  expect(result.blockers).toEqual([]);
  expect(result.automation).toEqual(expect.objectContaining({automaticFirmwareFlashAllowed: false, automaticSecureBootKeyMutationAllowed: false, automaticDbxUpdateAllowed: false, automaticProductionPublicationAllowed: false}));
  expect(result.actualFirmwareWritePerformed).toBe(false);
  expect(result.productionReleased).toBe(false);
});

test.each(['setupMode', 'bootArtifactRevoked'])('missing or nonboolean %s cannot be interpreted as safe', key => {
  const input = fixture(); delete input.secureBoot[key];
  expect(() => buildPlatformReleaseCompatibility(input)).toThrow('EXPLICIT_PLATFORM_CHECK_BOOLEAN_REQUIRED');
  input.secureBoot[key] = 'false';
  expect(() => buildPlatformReleaseCompatibility(input)).toThrow('EXPLICIT_PLATFORM_CHECK_BOOLEAN_REQUIRED');
});

test.each([
  ['revoked boot artifact', value => { value.secureBoot.bootArtifactRevoked = true; }, 'BOOT_ARTIFACT_REVOKED_BY_DBX'],
  ['unchecked dbx compatibility', value => { value.secureBoot.dbxCompatibilityChecked = false; }, 'DBX_COMPATIBILITY_NOT_CHECKED'],
  ['setup mode', value => { value.secureBoot.setupMode = true; }, 'SECURE_BOOT_NOT_ENFORCING_USER_MODE'],
  ['missing recovery trial', value => { value.verification.recoveryBootVerified = false; }, 'RECOVERY_BOOT_NOT_VERIFIED'],
  ['missing physical boot', value => { value.verification.physicalBootVerified = false; }, 'PHYSICAL_BOOT_NOT_VERIFIED'],
  ['missing measured boot', value => { value.verification.measuredBootVerified = false; }, 'TPM_MEASURED_BOOT_NOT_VERIFIED'],
])('holds %s', (_name, change, blocker) => {
  const input = fixture(); change(input);
  const result = buildPlatformReleaseCompatibility(input);
  expect(result.compatibilityDecision).toBe('RELEASE_HOLD');
  expect(result.blockers).toContain(blocker);
});

test('rejects forged fields, weak hashes and unsupported architectures', () => {
  expect(() => buildPlatformReleaseCompatibility({...fixture(), flashNow: true})).toThrow('INVALID_PLATFORM_RELEASE_FIELDS');
  expect(() => buildPlatformReleaseCompatibility({...fixture(), architecture: 'ALL'})).toThrow('INVALID_PLATFORM_RELEASE_ARCHITECTURE');
  expect(() => buildPlatformReleaseCompatibility({...fixture(), secureBoot: {...fixture().secureBoot, dbxSnapshotSha256: 'unknown'}})).toThrow('INVALID_PLATFORM_RELEASE_SHA256');
});
