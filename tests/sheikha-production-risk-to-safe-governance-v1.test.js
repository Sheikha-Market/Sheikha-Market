'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const governance = require(
  '../core/production-safety/'
  + 'sheikha-production-risk-to-safe-governance-v1'
);

function verifiedInput(
  driftClassification,
  overrides = {}
) {
  return {
    driftClassification,
    baselineVerified: true,
    evidenceComplete: true,
    currentReleaseVerified: true,
    rollbackReleaseRetained: true,
    endpointsVerified: true,
    contractsVerified: true,
    storageWithinLimit: true,
    retentionPolicyVerified: true,
    humanApproval: true,
    ...overrides
  };
}

test('reports an active fail-closed governance fabric', () => {
  const status = governance.status();

  assert.equal(
    status.system,
    'SHEIKHA_PRODUCTION_RISK_TO_SAFE_GOVERNANCE_V1'
  );
  assert.equal(status.status, 'ACTIVE');
  assert.equal(status.failClosed, true);
  assert.equal(status.riskyPromotionAllowed, false);
});

test('continues a verified release with no drift', () => {
  const result = governance.assessProductionRisk(
    verifiedInput('NO_OPERATIONAL_DRIFT')
  );

  assert.equal(
    result.status,
    'CURRENT_PRODUCTION_SAFE'
  );
  assert.equal(
    result.currentReleaseMayContinue,
    true
  );
  assert.equal(
    result.productionDecision,
    'CONTINUE_CURRENT_VERIFIED_RELEASE'
  );
});

test('observes healthy runtime churn without mutation', () => {
  const result = governance.assessProductionRisk(
    verifiedInput('HEALTHY_RUNTIME_CHURN')
  );

  assert.equal(
    result.status,
    'OBSERVE_VERIFIED_RUNTIME_CHANGE'
  );
  assert.equal(
    result.currentReleaseMayContinue,
    true
  );
  assert.equal(
    result.technicalBoundaries
      .externalMutationPerformed,
    false
  );
});

test('blocks deployment drift', () => {
  const result = governance.assessProductionRisk(
    verifiedInput('DEPLOYMENT_DRIFT')
  );

  assert.equal(result.status, 'SAFE_HOLD');
  assert.equal(result.promotionBlocked, true);
  assert.equal(
    result.requiredActions.includes(
      'freeze_all_new_promotions'
    ),
    true
  );
});

test('blocks service drift', () => {
  const result = governance.assessProductionRisk(
    verifiedInput('SERVICE_DRIFT')
  );

  assert.equal(result.status, 'SAFE_HOLD');
  assert.equal(
    result.requiredActions.includes(
      'preserve_logs_and_runtime_evidence'
    ),
    true
  );
});

test('blocks storage risk without cleanup', () => {
  const result = governance.assessProductionRisk(
    verifiedInput('STORAGE_RISK')
  );

  assert.equal(result.status, 'SAFE_HOLD');
  assert.equal(
    result.technicalBoundaries
      .cleanupAuthorized,
    false
  );
  assert.equal(
    result.requiredActions.includes(
      'prepare_non_destructive_capacity_plan'
    ),
    true
  );
});

test('blocks retention drift', () => {
  const result = governance.assessProductionRisk(
    verifiedInput('RETENTION_DRIFT')
  );

  assert.equal(result.status, 'SAFE_HOLD');
  assert.equal(
    result.requiredActions.includes(
      'deny_cleanup'
    ),
    true
  );
});

test('places multiple critical conditions in safe hold', () => {
  const result = governance.assessProductionRisk(
    verifiedInput(
      'MULTIPLE_CRITICAL_DRIFT_CONDITIONS'
    )
  );

  assert.equal(result.status, 'SAFE_HOLD');
  assert.equal(result.severity, 'CRITICAL');
  assert.equal(
    result.currentReleaseMayContinue,
    false
  );
});

test('fails closed for an unknown classification', () => {
  const result = governance.assessProductionRisk(
    verifiedInput('UNKNOWN_INPUT')
  );

  assert.equal(
    result.driftClassification,
    'UNRECOGNIZED_STATE'
  );
  assert.equal(result.status, 'SAFE_HOLD');
  assert.equal(result.promotionBlocked, true);
});

test('requires every technical gate for eligibility', () => {
  const result = governance.assessProductionRisk(
    verifiedInput(
      'NO_OPERATIONAL_DRIFT',
      {
        contractsVerified: false
      }
    )
  );

  assert.equal(
    result.gates.technicalReady,
    false
  );
  assert.equal(
    result.safeCandidateEligible,
    false
  );
});

test('requires human approval for a safe candidate', () => {
  const result = governance.assessProductionRisk(
    verifiedInput(
      'NO_OPERATIONAL_DRIFT',
      {
        humanApproval: false
      }
    )
  );

  assert.equal(
    result.safeCandidateEligible,
    false
  );
  assert.equal(
    result.technicalBoundaries
      .humanDecisionAuthority,
    true
  );
});

test('verification passes', () => {
  const verification = governance.verify();

  assert.equal(
    verification.system,
    'SHEIKHA_VERIFY_PRODUCTION_RISK_TO_SAFE_GOVERNANCE_V1'
  );
  assert.equal(verification.passed, true);
  assert.equal(
    Object.values(
      verification.checks
    ).every(Boolean),
    true
  );
});
