'use strict';

const crypto = require('node:crypto');

function diagnoseContextObservationFailure({ stderr, contextSha256, framingRepairSha256 }) {
  const text = String(stderr || '');
  const contextLoadFailure = /Esys_ContextLoad/i.test(text);
  const integrityFailure = /0x0*1df/i.test(text) && /integrity check failed/i.test(text);
  const readPublicFailure = /Unable to run tpm2_readpublic/i.test(text);
  const classification = contextLoadFailure && integrityFailure
    ? 'SAVED_TPM_CONTEXT_INTEGRITY_REJECTED_BEFORE_READPUBLIC'
    : 'UNCLASSIFIED_TPM_READPUBLIC_FAILURE';
  const base = {
    system: 'SHEIKHA_TPM_CONTEXT_OBSERVATION_FAILURE_DIAGNOSIS_V2',
    status: classification === 'UNCLASSIFIED_TPM_READPUBLIC_FAILURE' ? 'INSUFFICIENT_EVIDENCE' : 'DIAGNOSED',
    classification,
    evidence: {
      contextLoadFailure,
      integrityFailure,
      readPublicFailure,
      responseCode: integrityFailure ? '0x000001df' : null,
      stderrSha256: crypto.createHash('sha256').update(text).digest('hex'),
      contextSha256: contextSha256 || null,
      framingRepairSha256: framingRepairSha256 || null,
    },
    conclusions: {
      framingRepairInvalidated: false,
      activateCredentialReached: false,
      tpmMutationObserved: false,
      savedContextUsableNow: false,
      exactRootCauseProven: false,
    },
    possibleCauses: [
      'TPM_OR_RESOURCE_MANAGER_STATE_CHANGED_AFTER_CONTEXT_SAVE',
      'CONTEXT_CREATED_AGAINST_A_DIFFERENT_TPM_STATE',
      'CONTEXT_FILE_CORRUPTION_OR_PROTECTION_MISMATCH',
    ],
    nextRequiredStage: 'NEW_AUTHORIZED_READ_ONLY_TPM_RESET_COUNT_AND_HANDLE_INVENTORY',
    ifTransientObjectsWereLost: 'NEW_DEVICE_BOUND_EK_AK_CREATION_AND_COMPLETE_CREDENTIAL_REBIND_REQUIRED',
    oldPhysicalAuthorizationReusable: false,
    rerunFailedObservationAllowed: false,
  };
  return { ...base, reportSha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

module.exports = { diagnoseContextObservationFailure };
