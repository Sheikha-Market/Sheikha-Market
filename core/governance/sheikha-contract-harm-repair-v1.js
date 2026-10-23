'use strict';

const REQUIRED_BOUNDARIES = Object.freeze({
  failClosed: true,
  highImpactHumanApprovalRequired: true,
  privateProductionKeysBundled: false,
  automaticFirmwareMutationAllowed: false,
  automaticLegalAcceptanceAllowed: false,
  automaticReligiousAuthorityClaimed: false,
  evidenceRequiredForReadinessClaim: true
});

function reviewAndProposeContractRepair(contract) {
  if (!contract || typeof contract !== 'object' || Array.isArray(contract)) {
    throw new Error('STRUCTURED_CONTRACT_OBJECT_REQUIRED');
  }
  const current = contract.boundaries && typeof contract.boundaries === 'object'
    ? contract.boundaries : {};
  const violations = Object.entries(REQUIRED_BOUNDARIES)
    .filter(([key, expected]) => current[key] !== expected)
    .map(([key, expected]) => ({key, expected, actual: current[key] ?? null}));
  const repairedDraft = {
    ...contract,
    boundaries: {...current, ...REQUIRED_BOUNDARIES},
    repairMetadata: {
      system: 'SHEIKHA_CONTRACT_HARM_REPAIR_V1',
      draftOnly: true,
      legalAcceptancePerformed: false,
      executionAuthorizationGranted: false,
      humanReviewRequired: true,
      originalPreserved: true
    }
  };
  return {
    system: 'SHEIKHA_CONTRACT_HARM_REPAIR_V1',
    decision: violations.length === 0 ? 'CONTRACT_BOUNDARIES_ACCEPTABLE' : 'REPAIR_DRAFT_REQUIRES_HUMAN_REVIEW',
    principle: 'NO_HARM_NO_RECIPROCAL_HARM',
    violations,
    repairedDraft,
    originalMutated: false,
    automaticallyAccepted: false,
    automaticallyExecuted: false
  };
}

module.exports = {REQUIRED_BOUNDARIES, reviewAndProposeContractRepair};
