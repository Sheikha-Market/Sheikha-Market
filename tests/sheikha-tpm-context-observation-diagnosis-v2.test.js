'use strict';

const { diagnoseContextObservationFailure } = require('../core/governance/sheikha-tpm-context-observation-diagnosis-v2');

describe('Sheikha TPM context observation diagnosis V2', () => {
  test('separates ContextLoad integrity rejection from MakeCredential framing', () => {
    const report = diagnoseContextObservationFailure({
      stderr: [
        'Esys_ContextLoad_Finish() Received TPM Error',
        'Esys_ContextLoad() Esys Finish ErrorCode (0x000001df)',
        'tpm:parameter(1):integrity check failed',
        'Unable to run tpm2_readpublic',
      ].join('\n'),
      contextSha256: 'a'.repeat(64),
      framingRepairSha256: 'b'.repeat(64),
    });
    expect(report.status).toBe('DIAGNOSED');
    expect(report.classification).toBe('SAVED_TPM_CONTEXT_INTEGRITY_REJECTED_BEFORE_READPUBLIC');
    expect(report.conclusions).toMatchObject({
      framingRepairInvalidated: false,
      activateCredentialReached: false,
      tpmMutationObserved: false,
      savedContextUsableNow: false,
      exactRootCauseProven: false,
    });
    expect(report.oldPhysicalAuthorizationReusable).toBe(false);
  });

  test('does not invent a diagnosis from unrelated stderr', () => {
    const report = diagnoseContextObservationFailure({ stderr: 'unknown failure' });
    expect(report.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(report.evidence.responseCode).toBeNull();
  });
});
