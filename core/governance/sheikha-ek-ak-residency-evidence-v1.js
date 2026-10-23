'use strict';

const crypto = require('node:crypto');
const {spkiSha256, verifyX509AkChain} = require('./sheikha-native-tpm-attestation-v1');

function equalHex(left, right) {
  const a = Buffer.from(String(left || ''), 'hex');
  const b = Buffer.from(String(right || ''), 'hex');
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

function verifyEkAkResidencyEvidence({
  ekPublicKey,
  ekLeafCertificatePem,
  ekRootCertificatePem,
  expectedEkRootSha256,
  platformEnrollment,
  akEnrollment,
  activationEvidence,
  trustedCollectorIds = [],
  now = new Date()
}) {
  const missing = [];
  if (!ekPublicKey || !ekLeafCertificatePem || !ekRootCertificatePem || !expectedEkRootSha256) missing.push('EK_TRUST_INPUT_REQUIRED');
  if (!platformEnrollment) missing.push('PLATFORM_ENROLLMENT_REQUIRED');
  if (!akEnrollment) missing.push('AK_ENROLLMENT_REQUIRED');
  if (!activationEvidence) missing.push('CREDENTIAL_ACTIVATION_EVIDENCE_REQUIRED');
  if (missing.length > 0) {
    return {system: 'SHEIKHA_EK_AK_RESIDENCY_EVIDENCE_V1', verdict: 'INDETERMINATE', accepted: false, blockers: missing, realTpmCommandExecutionProven: false};
  }

  let ekTrust;
  try {
    ekTrust = verifyX509AkChain({akPublicKey: ekPublicKey, leafCertificatePem: ekLeafCertificatePem,
      rootCertificatePem: ekRootCertificatePem, expectedRootSha256: expectedEkRootSha256, now});
  } catch {
    ekTrust = {trusted: false};
  }
  const ekFingerprint = spkiSha256(ekPublicKey);
  const checks = {
    ekCertificateChainAndRootPinVerified: ekTrust.trusted === true,
    ekBoundToPlatform: platformEnrollment.ekSpkiSha256 === ekFingerprint && Boolean(platformEnrollment.platformId),
    akBoundToEkAndPlatform: akEnrollment.ekSpkiSha256 === ekFingerprint &&
      akEnrollment.platformId === platformEnrollment.platformId &&
      Boolean(akEnrollment.akObjectName && akEnrollment.akQualifiedName && akEnrollment.akSpkiSha256),
    collectorTrusted: trustedCollectorIds.includes(activationEvidence.collectorId),
    challengeBound: equalHex(activationEvidence.challengeSha256, akEnrollment.activationChallengeSha256),
    akNameBound: activationEvidence.akObjectName === akEnrollment.akObjectName,
    ekFingerprintBound: activationEvidence.ekSpkiSha256 === ekFingerprint,
    recoveredSecretDigestMatches: equalHex(activationEvidence.recoveredSecretSha256, akEnrollment.expectedRecoveredSecretSha256),
    externalActivationDeclaredExecuted: activationEvidence.externalActivationExecuted === true
  };
  const blockers = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return {
    system: 'SHEIKHA_EK_AK_RESIDENCY_EVIDENCE_V1',
    verdict: blockers.length === 0 ? 'TPM_RESIDENCY_EVIDENCE_ACCEPTED' : 'TPM_RESIDENCY_EVIDENCE_DENIED',
    accepted: blockers.length === 0,
    profile: 'EK_CHAIN_AK_ENROLLMENT_CREDENTIAL_ACTIVATION_V1',
    checks,
    blockers,
    ekSpkiSha256: ekFingerprint,
    realTpmCommandExecutionProven: blockers.length === 0,
    boundaries: {
      ekTrustAloneProvesAkResidency: false,
      akKeyMatchAloneProvesTpmResidency: false,
      evidenceConsistencyWithoutExternalActivationIsAccepted: false,
      firmwareMutationPerformed: false
    }
  };
}

module.exports = {verifyEkAkResidencyEvidence};
