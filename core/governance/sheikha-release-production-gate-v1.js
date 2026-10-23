'use strict';

const HASH = /^[a-f0-9]{64}$/;

function evaluateRelease(input) {
  if (input.humanReviewRequired === true && input.humanReviewCompleted !== true) {
    return {decision: 'RELEASE_HOLD_FOR_HUMAN_REVIEW', blockers: ['REQUIRED_HUMAN_REVIEW_NOT_COMPLETED']};
  }
  const blockers = [];
  const requireValue = (condition, blocker) => { if (!condition) blockers.push(blocker); };

  requireValue(input.aiSelfAuthorized !== true, 'AI_CANNOT_SELF_AUTHORIZE_PRODUCTION');
  requireValue(Boolean(input.governance?.referenceId), 'REFERENCE_REQUIRED');
  requireValue(Boolean(input.governance?.policyId), 'POLICY_REQUIRED');
  requireValue(Boolean(input.governance?.decisionId), 'DECISION_REQUIRED');
  requireValue(Boolean(input.governance?.executionLeaseId), 'EXECUTION_LEASE_REQUIRED');
  requireValue(input.governance?.capabilityTokenVerified === true, 'VERIFIED_CAPABILITY_TOKEN_REQUIRED');
  requireValue(input.governance?.pepAuthorizationAllowed === true, 'PEP_AUTHORIZATION_REQUIRED');
  requireValue(input.governance?.postExecutionVerified === true, 'POST_EXECUTION_VERIFICATION_REQUIRED');
  requireValue(input.governance?.masterAuditValid === true, 'VALID_MASTER_AUDIT_REQUIRED');
  requireValue(HASH.test(input.artifact?.sha256 || ''), 'ARTIFACT_SHA256_REQUIRED');
  requireValue(input.artifact?.signatureVerified === true, 'ARTIFACT_SIGNATURE_VERIFICATION_REQUIRED');
  requireValue(Boolean(input.artifact?.sbomDigest), 'SBOM_REQUIRED');
  requireValue(Boolean(input.artifact?.buildProvenanceDigest), 'BUILD_PROVENANCE_REQUIRED');
  requireValue(input.productionKey?.status === 'APPROVED_PRODUCTION', 'APPROVED_PRODUCTION_KEY_REQUIRED');
  requireValue(Boolean(input.environment?.authorizedId) && input.environment.authorizedId === input.environment.targetId, 'ENVIRONMENT_IDENTITY_MISMATCH');
  requireValue(!Array.isArray(input.criticalBlockers) || input.criticalBlockers.length === 0, 'UNRESOLVED_CRITICAL_BLOCKER');

  if (input.mutableRelease === true) {
    requireValue(input.recovery?.available === true, 'MUTABLE_RELEASE_RECOVERY_REQUIRED');
    requireValue(input.recovery?.rollbackAvailable === true, 'MUTABLE_RELEASE_ROLLBACK_REQUIRED');
  }

  if (input.releaseType === 'FIRMWARE') {
    requireValue(input.firmware?.signedFirmware === true, 'SIGNED_FIRMWARE_REQUIRED');
    requireValue(Boolean(input.firmware?.boardPlatformBinding), 'BOARD_PLATFORM_BINDING_REQUIRED');
    requireValue(input.firmware?.antiRollbackPolicy === true, 'ANTI_ROLLBACK_POLICY_REQUIRED');
    requireValue(input.firmware?.recoveryPathVerified === true, 'FIRMWARE_RECOVERY_PATH_REQUIRED');
    requireValue(input.firmware?.flashWriteAuthorized === true, 'FLASH_WRITE_AUTHORIZATION_REQUIRED');
    requireValue(input.firmware?.physicalValidationEvidence === true, 'PHYSICAL_VALIDATION_EVIDENCE_REQUIRED');
  }

  return blockers.length
    ? {decision: 'RELEASE_DENY', blockers: [...new Set(blockers)]}
    : {decision: 'RELEASE_ALLOW', blockers: []};
}

module.exports = {evaluateRelease};
