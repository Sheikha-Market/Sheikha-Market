'use strict';

function evaluateTpmProductionTrialGate({platformReport, quotePreflight, conformance}) {
  const checks = {
    boundedParsersImplemented: ['ATTESTATION_QUOTE', 'QUOTE_SIGNATURE', 'AK_PUBLIC_IDENTITY', 'OBJECT_NAME']
      .every((id) => platformReport.tpm2Part2Conformance?.implementedProfiles?.includes(id)),
    physicalBootEvidenceVerified: platformReport.evidence?.physicalNamedDeviceBootVerified === true,
    tpmReadOnlyCollectionReady: quotePreflight.readiness?.readyForReadOnlyCollection === true,
    governedQuoteReady: quotePreflight.readiness?.readyForGovernedQuote === true,
    secureBootVerified: platformReport.physicalPlatformTrust?.secureBootEnabled === true,
    measuredBootVerified: platformReport.physicalPlatformTrust?.measuredBootEvidenceAvailable === true,
    realQuoteVerified: platformReport.measurementEvidencePipeline?.nativeQuoteCryptographicallyVerified === true,
    realAkNameVerified: platformReport.measurementEvidencePipeline?.akQualifiedNameBindingVerified === true,
    realTpmResidencyVerified: platformReport.measurementEvidencePipeline?.realTpmResidencyVerified === true,
    releaseGateAllowed: platformReport.actualFirmwareReleaseGate?.decision === 'RELEASE_ALLOW',
    fullPart2ClaimAvoided: conformance.claim === 'BOUNDED_SUBSET_IMPLEMENTATION_NOT_FULL_PART2_CONFORMANCE'
  };
  const labReady = checks.boundedParsersImplemented && checks.physicalBootEvidenceVerified && checks.fullPart2ClaimAvoided;
  const physicalTrialReady = labReady && checks.tpmReadOnlyCollectionReady && checks.governedQuoteReady;
  const productionReady = physicalTrialReady && checks.secureBootVerified && checks.measuredBootVerified &&
    checks.realQuoteVerified && checks.realAkNameVerified && checks.realTpmResidencyVerified && checks.releaseGateAllowed;
  const blockers = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_TPM_PRODUCTION_TRIAL_GATE_V1',
    decision: productionReady ? 'PRODUCTION_READY' : physicalTrialReady ? 'PHYSICAL_TRIAL_READY_PRODUCTION_BLOCKED' : labReady ? 'LAB_READY_PHYSICAL_TRIAL_BLOCKED' : 'LAB_BLOCKED',
    readiness: {labReady, physicalTrialReady, productionReady},
    checks,
    blockers,
    trialSequence: [
      'T0_CAPTURE_BASELINE_AND_RECOVERY_INFORMATION',
      'T1_VERIFY_TPM_RESOURCE_MANAGER_AND_PINNED_TOOLS',
      'T2_EXPORT_EVENT_LOG_AND_PCRS_READ_ONLY',
      'T3_CREATE_NON_EXPORTABLE_AK_AFTER_HUMAN_APPROVAL',
      'T4_EXPORT_AK_PUBLIC_AND_CREATE_ENROLLMENT_DRAFT',
      'T5_COLLECT_NONCE_BOUND_QUOTE_AND_SIGNATURE',
      'T6_VERIFY_PUBLIC_NAME_SIGNATURE_NONCE_AND_PCR_REPLAY_OFFLINE',
      'T7_RUN_MAKECREDENTIAL_ACTIVATECREDENTIAL_TRIAL',
      'T8_REBOOT_AND_REPEAT_FOR_STABILITY',
      'T9_INDEPENDENT_REVIEW_AND_RELEASE_GATE'
    ],
    stopConditions: [
      'TPM_OR_EVENT_LOG_DISAPPEARS', 'PCR_REPLAY_MISMATCH', 'AK_NAME_MISMATCH',
      'SIGNATURE_OR_NONCE_FAILURE', 'UNEXPECTED_FIRMWARE_OR_SECURE_BOOT_CHANGE',
      'RECOVERY_PATH_UNAVAILABLE'
    ],
    execution: {performed: false, tpmCommandsExecuted: false, firmwareMutationPerformed: false, networkUsed: false}
  };
}

module.exports = {evaluateTpmProductionTrialGate};
