'use strict';

const {evaluateRelease} = require('../core/governance/sheikha-release-production-gate-v1');

function validRelease(overrides = {}) {
  return {
    releaseType: 'SERVICE', aiSelfAuthorized: false, mutableRelease: true,
    governance: {referenceId: 'ref-1', policyId: 'policy-1', decisionId: 'd1', executionLeaseId: 'l1', capabilityTokenVerified: true, pepAuthorizationAllowed: true, postExecutionVerified: true, masterAuditValid: true},
    artifact: {sha256: 'a'.repeat(64), signatureVerified: true, sbomDigest: 'sha256:sbom', buildProvenanceDigest: 'sha256:provenance'},
    productionKey: {status: 'APPROVED_PRODUCTION'},
    environment: {authorizedId: 'prod-sa-1', targetId: 'prod-sa-1'},
    recovery: {available: true, rollbackAvailable: true}, criticalBlockers: [],
    ...overrides
  };
}

describe('Sheikha release production gate V1', () => {
  test('allows a complete service fixture', () => {
    expect(evaluateRelease(validRelease())).toEqual({decision: 'RELEASE_ALLOW', blockers: []});
  });

  test('holds incomplete required human review', () => {
    expect(evaluateRelease(validRelease({humanReviewRequired: true, humanReviewCompleted: false}))).toEqual({
      decision: 'RELEASE_HOLD_FOR_HUMAN_REVIEW', blockers: ['REQUIRED_HUMAN_REVIEW_NOT_COMPLETED']
    });
  });

  test.each([
    ['invalid audit', {governance: {...validRelease().governance, masterAuditValid: false}}, 'VALID_MASTER_AUDIT_REQUIRED'],
    ['development key', {productionKey: {status: 'DEVELOPMENT'}}, 'APPROVED_PRODUCTION_KEY_REQUIRED'],
    ['critical blocker', {criticalBlockers: ['CVE_CRITICAL']}, 'UNRESOLVED_CRITICAL_BLOCKER'],
    ['environment mismatch', {environment: {authorizedId: 'prod-a', targetId: 'prod-b'}}, 'ENVIRONMENT_IDENTITY_MISMATCH'],
    ['AI self authorization', {aiSelfAuthorized: true}, 'AI_CANNOT_SELF_AUTHORIZE_PRODUCTION']
  ])('denies %s', (_name, overrides, blocker) => {
    const result = evaluateRelease(validRelease(overrides));
    expect(result.decision).toBe('RELEASE_DENY');
    expect(result.blockers).toContain(blocker);
  });

  test('enforces every firmware-specific release condition', () => {
    const result = evaluateRelease(validRelease({releaseType: 'FIRMWARE', firmware: {
      signedFirmware: true, boardPlatformBinding: 'board-1', antiRollbackPolicy: true,
      recoveryPathVerified: true, flashWriteAuthorized: true, physicalValidationEvidence: false
    }}));
    expect(result).toMatchObject({decision: 'RELEASE_DENY'});
    expect(result.blockers).toContain('PHYSICAL_VALIDATION_EVIDENCE_REQUIRED');
  });
});
