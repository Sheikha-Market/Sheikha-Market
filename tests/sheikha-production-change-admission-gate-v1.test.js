'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const gate = require(
  '../core/production-safety/'
  + 'sheikha-production-change-admission-gate-v1'
);

function completeRequest(overrides = {}) {
  return {
    changeClass:
      'CONTROLLED_RUNTIME_CHANGE',
    impactLevel: 'MEDIUM',
    driftClassification:
      'NO_OPERATIONAL_DRIFT',
    baselineVerified: true,
    operationalAssuranceVerified: true,
    currentStateHealthy: true,
    criticalFailedCheckCount: 0,
    evidenceComplete: true,
    changeScope: [
      'server.js'
    ],
    testsPassed: true,
    currentReleaseVerified: true,
    rollbackReady: true,
    endpointsVerified: true,
    contractsVerified: true,
    storageWithinLimit: true,
    retentionVerified: true,
    packagePlanVerified: true,
    deploymentPlanVerified: true,
    postDeploymentVerificationPlanned:
      true,
    ...overrides
  };
}

function trustedApproval(overrides = {}) {
  return {
    decisionAuthority:
      'HUMAN_ONLY',
    approvalRecordVerified: true,
    approvalScopeMatches: true,
    approvalRecordId:
      'TEST-APPROVAL-001',
    highImpactApprovalVerified:
      false,
    ...overrides
  };
}

test(
  'reports an active fail-closed admission gate',
  () => {
    const status = gate.status();

    assert.equal(
      status.system,
      'SHEIKHA_PRODUCTION_CHANGE_ADMISSION_GATE_V1'
    );
    assert.equal(
      status.status,
      'ACTIVE'
    );
    assert.equal(
      status.failClosed,
      true
    );
    assert.equal(
      status.failClosedDecision,
      'ADMISSION_DENIED'
    );
  }
);

test(
  'preserves human-only decision authority',
  () => {
    const status = gate.status();

    assert.equal(
      status.authority,
      'HUMAN_ONLY'
    );
    assert.equal(
      status.externalRequestMayGrantApproval,
      false
    );
    assert.equal(
      status.autonomousProductionMutationAllowed,
      false
    );
  }
);

test(
  'verification passes',
  () => {
    assert.equal(
      gate.verify().passed,
      true
    );
  }
);

test(
  'complete technical candidate awaits human approval',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest()
      );

    assert.equal(
      result.technicalReady,
      true
    );
    assert.equal(
      result.status,
      'AWAITING_HUMAN_APPROVAL'
    );
    assert.equal(
      result.admissionGranted,
      false
    );
  }
);

test(
  'external humanApproval field is ignored',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest({
          humanApproval: true
        })
      );

    assert.equal(
      result.approval
        .requestHumanApprovalIgnored,
      true
    );
    assert.equal(
      result.approval
        .externalRequestMayGrantApproval,
      false
    );
    assert.equal(
      result.approval
        .trustedHumanApproval,
      false
    );
    assert.equal(
      result.admissionGranted,
      false
    );
  }
);

test(
  'verified human approval returns a manual-execution decision',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest(),
        trustedApproval()
      );

    assert.equal(
      result.status,
      'ADMISSION_APPROVED_FOR_MANUAL_EXECUTION'
    );
    assert.equal(
      result.admissionGranted,
      true
    );
    assert.equal(
      result.technicalBoundaries
        .productionDeploymentExecuted,
      false
    );
  }
);

test(
  'high-impact change requires separate high-impact approval',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest({
          changeClass:
            'HIGH_IMPACT_PRODUCTION_CHANGE',
          impactLevel: 'HIGH'
        }),
        trustedApproval()
      );

    assert.equal(
      result.status,
      'AWAITING_HIGH_IMPACT_HUMAN_APPROVAL'
    );
    assert.equal(
      result.admissionGranted,
      false
    );
  }
);

test(
  'verified high-impact approval permits manual execution only',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest({
          changeClass:
            'HIGH_IMPACT_PRODUCTION_CHANGE',
          impactLevel: 'HIGH'
        }),
        trustedApproval({
          highImpactApprovalVerified:
            true
        })
      );

    assert.equal(
      result.status,
      'ADMISSION_APPROVED_FOR_MANUAL_EXECUTION'
    );
    assert.equal(
      result.admissionGranted,
      true
    );
    assert.equal(
      result.technicalBoundaries
        .recommendationOnly,
      true
    );
  }
);

test(
  'unknown change classification fails closed',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest({
          changeClass:
            'UNKNOWN_CHANGE'
        }),
        trustedApproval()
      );

    assert.equal(
      result.status,
      'ADMISSION_DENIED'
    );
    assert.equal(
      result.admissionGranted,
      false
    );
  }
);

for (const classification of [
  'DEPLOYMENT_DRIFT',
  'SERVICE_DRIFT',
  'STORAGE_RISK',
  'RETENTION_DRIFT',
  'MULTIPLE_CRITICAL_DRIFT_CONDITIONS'
]) {
  test(
    `denies ${classification}`,
    () => {
      const result = gate
        .assessProductionChangeAdmission(
          completeRequest({
            driftClassification:
              classification
          }),
          trustedApproval({
            highImpactApprovalVerified:
              true
          })
        );

      assert.equal(
        result.status,
        'ADMISSION_DENIED'
      );
      assert.equal(
        result.admissionGranted,
        false
      );
      assert.equal(
        result.gates
          .riskToSafeAssessmentSafe,
        false
      );
    }
  );
}

test(
  'incomplete evidence denies admission',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest({
          evidenceComplete: false
        }),
        trustedApproval()
      );

    assert.equal(
      result.status,
      'ADMISSION_DENIED'
    );
    assert.equal(
      result.technicalReady,
      false
    );
  }
);

test(
  'cleanup request is denied',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest({
          cleanupRequested: true
        }),
        trustedApproval()
      );

    assert.equal(
      result.status,
      'ADMISSION_DENIED'
    );
    assert.equal(
      result.technicalBoundaries
        .cleanupAuthorized,
      false
    );
  }
);

test(
  'autonomous external mutation request is denied',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest({
          autonomousExternalMutationRequested:
            true
        }),
        trustedApproval()
      );

    assert.equal(
      result.status,
      'ADMISSION_DENIED'
    );
    assert.equal(
      result.technicalBoundaries
        .externalMutationPerformed,
      false
    );
  }
);

test(
  'no-change classification continues current release',
  () => {
    const result = gate
      .assessProductionChangeAdmission({
        changeClass: 'NO_CHANGE',
        impactLevel: 'NONE',
        driftClassification:
          'NO_OPERATIONAL_DRIFT'
      });

    assert.equal(
      result.status,
      'NO_CHANGE_RECORDED'
    );
    assert.equal(
      result.admissionGranted,
      false
    );
  }
);

test(
  'technical boundaries never claim execution or prediction',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest(),
        trustedApproval()
      );

    assert.deepEqual(
      {
        externalMutationPerformed:
          result.technicalBoundaries
            .externalMutationPerformed,
        productionDeploymentExecuted:
          result.technicalBoundaries
            .productionDeploymentExecuted,
        servicesRestarted:
          result.technicalBoundaries
            .servicesRestarted,
        packagesInstalled:
          result.technicalBoundaries
            .packagesInstalled,
        cleanupExecuted:
          result.technicalBoundaries
            .cleanupExecuted,
        futurePredictionClaim:
          result.technicalBoundaries
            .futurePredictionClaim,
        unseenKnowledgeClaim:
          result.technicalBoundaries
            .unseenKnowledgeClaim
      },
      {
        externalMutationPerformed:
          false,
        productionDeploymentExecuted:
          false,
        servicesRestarted:
          false,
        packagesInstalled:
          false,
        cleanupExecuted:
          false,
        futurePredictionClaim:
          false,
        unseenKnowledgeClaim:
          false
      }
    );
  }
);

test(
  'separates current-release safety from promotion approval',
  () => {
    const result = gate
      .assessProductionChangeAdmission(
        completeRequest()
      );

    assert.equal(
      result.riskAssessment.status,
      'CURRENT_PRODUCTION_SAFE'
    );
    assert.equal(
      result.riskAssessment
        .currentReleaseMayContinue,
      true
    );
    assert.equal(
      result.riskAssessment
        .promotionBlocked,
      true
    );
    assert.equal(
      result.gates
        .riskToSafeAssessmentSafe,
      true
    );
    assert.equal(
      result.status,
      'AWAITING_HUMAN_APPROVAL'
    );
    assert.equal(
      result.admissionGranted,
      false
    );
  }
);

