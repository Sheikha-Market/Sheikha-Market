'use strict';

const {evaluateTpmProductionTrialGate} = require('../core/governance/sheikha-tpm-production-trial-gate-v1');

function input(overrides = {}) {
  return {
    platformReport: {
      evidence: {physicalNamedDeviceBootVerified: true},
      tpm2Part2Conformance: {implementedProfiles: ['ATTESTATION_QUOTE', 'QUOTE_SIGNATURE', 'AK_PUBLIC_IDENTITY', 'OBJECT_NAME']},
      physicalPlatformTrust: {secureBootEnabled: false, measuredBootEvidenceAvailable: false},
      measurementEvidencePipeline: {nativeQuoteCryptographicallyVerified: false, akQualifiedNameBindingVerified: false, realTpmResidencyVerified: false},
      actualFirmwareReleaseGate: {decision: 'RELEASE_DENY'}
    },
    quotePreflight: {readiness: {readyForReadOnlyCollection: false, readyForGovernedQuote: false}},
    conformance: {claim: 'BOUNDED_SUBSET_IMPLEMENTATION_NOT_FULL_PART2_CONFORMANCE'},
    ...overrides
  };
}

describe('Sheikha TPM production trial gate V1', () => {
  test('reports the current bounded implementation as lab-ready only', () => {
    const report = evaluateTpmProductionTrialGate(input());
    expect(report.decision).toBe('LAB_READY_PHYSICAL_TRIAL_BLOCKED');
    expect(report.readiness).toEqual({labReady: true, physicalTrialReady: false, productionReady: false});
    expect(report.execution.performed).toBe(false);
  });

  test('requires every real evidence gate for production', () => {
    const values = input();
    values.quotePreflight.readiness = {readyForReadOnlyCollection: true, readyForGovernedQuote: true};
    values.platformReport.physicalPlatformTrust = {secureBootEnabled: true, measuredBootEvidenceAvailable: true};
    values.platformReport.measurementEvidencePipeline = {nativeQuoteCryptographicallyVerified: true, akQualifiedNameBindingVerified: true, realTpmResidencyVerified: true};
    values.platformReport.actualFirmwareReleaseGate.decision = 'RELEASE_ALLOW';
    const report = evaluateTpmProductionTrialGate(values);
    expect(report.decision).toBe('PRODUCTION_READY');
    expect(report.blockers).toEqual([]);
  });

  test('provides ordered stop-controlled trial steps', () => {
    const report = evaluateTpmProductionTrialGate(input());
    expect(report.trialSequence).toHaveLength(10);
    expect(report.stopConditions).toContain('PCR_REPLAY_MISMATCH');
    expect(report.execution.tpmCommandsExecuted).toBe(false);
  });
});
