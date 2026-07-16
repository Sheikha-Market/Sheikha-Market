'use strict';

const riskToSafe = require(
  './sheikha-production-risk-to-safe-governance-v1'
);

const SYSTEM =
  'SHEIKHA_PRODUCTION_CHANGE_ADMISSION_GATE_V1';

const VERIFY_SYSTEM =
  'SHEIKHA_VERIFY_PRODUCTION_CHANGE_ADMISSION_GATE_V1';

const MODE =
  'EVIDENCE_VERIFY_CLASSIFY_REQUIRE_HUMAN_APPROVAL_ONLY';

const AUTHORITY = 'HUMAN_ONLY';
const FAIL_CLOSED_DECISION = 'ADMISSION_DENIED';

const KNOWN_CHANGE_CLASSES = Object.freeze([
  'NO_CHANGE',
  'DOCUMENTATION_ONLY',
  'LOW_RISK_INTERNAL_CHANGE',
  'CONTROLLED_RUNTIME_CHANGE',
  'HIGH_IMPACT_PRODUCTION_CHANGE'
]);

const IMPACT_LEVELS = Object.freeze([
  'NONE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
]);

const TECHNICAL_GATES = Object.freeze([
  'CLASSIFICATION_KNOWN',
  'BASELINE_VERIFIED',
  'OPERATIONAL_ASSURANCE_VERIFIED',
  'CURRENT_STATE_HEALTHY',
  'ZERO_CRITICAL_DRIFT',
  'EVIDENCE_COMPLETE',
  'CHANGE_SCOPE_DECLARED',
  'TESTS_PASSED',
  'CURRENT_RELEASE_VERIFIED',
  'ROLLBACK_READY',
  'ENDPOINTS_VERIFIED',
  'CONTRACTS_VERIFIED',
  'STORAGE_WITHIN_LIMIT',
  'RETENTION_VERIFIED',
  'PACKAGE_PLAN_VERIFIED',
  'DEPLOYMENT_PLAN_VERIFIED',
  'POST_DEPLOYMENT_VERIFICATION_PLANNED',
  'RISK_TO_SAFE_ASSESSMENT_SAFE'
]);

const DECISION_PIPELINE = Object.freeze([
  'READ_RECORDED_BASELINE',
  'READ_OPERATIONAL_ASSURANCE',
  'CLASSIFY_CHANGE',
  'VERIFY_EVIDENCE',
  'VERIFY_TESTS',
  'VERIFY_ROLLBACK',
  'VERIFY_RETENTION',
  'ASSESS_PRODUCTION_RISK',
  'REQUIRE_HUMAN_APPROVAL',
  'REQUIRE_HIGH_IMPACT_APPROVAL_WHEN_APPLICABLE',
  'RETURN_MANUAL_EXECUTION_DECISION_ONLY',
  'PRESERVE_EVIDENCE'
]);

function boolean(value) {
  return value === true;
}

function status() {
  return {
    schemaVersion: '1.0.0',
    system: SYSTEM,
    status: 'ACTIVE',
    mode: MODE,
    authority: AUTHORITY,
    failClosed: true,
    failClosedDecision: FAIL_CLOSED_DECISION,
    knownChangeClasses: [...KNOWN_CHANGE_CLASSES],
    impactLevels: [...IMPACT_LEVELS],
    technicalGates: [...TECHNICAL_GATES],
    decisionPipeline: [...DECISION_PIPELINE],
    externalRequestMayGrantApproval: false,
    autonomousProductionMutationAllowed: false,
    productionDeploymentExecuted: false,
    servicesRestarted: false,
    packagesInstalled: false,
    cleanupAuthorized: false,
    cleanupExecuted: false,
    retentionMode: 'DENY_BY_DEFAULT',
    recommendationOnly: true
  };
}

function buildRiskInput(request) {
  return {
    driftClassification:
      request.driftClassification
      || 'UNRECOGNIZED_STATE',
    baselineVerified:
      boolean(request.baselineVerified),
    evidenceComplete:
      boolean(request.evidenceComplete),
    currentReleaseVerified:
      boolean(request.currentReleaseVerified),
    rollbackReleaseRetained:
      boolean(request.rollbackReady),
    endpointsVerified:
      boolean(request.endpointsVerified),
    contractsVerified:
      boolean(request.contractsVerified),
    storageWithinLimit:
      boolean(request.storageWithinLimit),
    retentionPolicyVerified:
      boolean(request.retentionVerified),
    humanApproval: false
  };
}

function assessTrustedApproval(
  request,
  trustedApprovalContext
) {
  const externalApprovalFieldsPresent = [
    'humanApproval',
    'approval',
    'approved',
    'highImpactApproval'
  ].some(key => (
    Object.prototype.hasOwnProperty.call(
      request,
      key
    )
  ));

  const trustedHumanApproval = (
    trustedApprovalContext
      .decisionAuthority
      === AUTHORITY
    && boolean(
      trustedApprovalContext
        .approvalRecordVerified
    )
    && boolean(
      trustedApprovalContext
        .approvalScopeMatches
    )
    && typeof trustedApprovalContext
      .approvalRecordId === 'string'
    && trustedApprovalContext
      .approvalRecordId.trim().length > 0
  );

  const highImpactApprovalVerified = (
    trustedHumanApproval
    && boolean(
      trustedApprovalContext
        .highImpactApprovalVerified
    )
  );

  return {
    externalApprovalFieldsPresent,
    requestHumanApprovalIgnored:
      externalApprovalFieldsPresent,
    externalRequestMayGrantApproval:
      false,
    trustedHumanApproval,
    highImpactApprovalVerified,
    approvalRecordId:
      trustedHumanApproval
        ? trustedApprovalContext
          .approvalRecordId
        : null
  };
}

function assessProductionChangeAdmission(
  request = {},
  trustedApprovalContext = {}
) {
  const changeClass =
    typeof request.changeClass === 'string'
      ? request.changeClass
      : 'UNRECOGNIZED_CHANGE';

  const impactLevel =
    typeof request.impactLevel === 'string'
      ? request.impactLevel
      : 'CRITICAL';

  const classificationKnown =
    KNOWN_CHANGE_CLASSES.includes(
      changeClass
    );

  const impactKnown =
    IMPACT_LEVELS.includes(
      impactLevel
    );

  const approval = assessTrustedApproval(
    request,
    trustedApprovalContext
  );

  const riskStatus = riskToSafe.status();
  const riskVerification =
    riskToSafe.verify();

  const riskAssessment =
    riskToSafe.assessProductionRisk(
      buildRiskInput(request)
    );

  const riskAssessmentSafe = (
    riskVerification.passed === true
    && riskStatus.status === 'ACTIVE'
    && riskStatus.failClosed === true
    && riskAssessment.status
      === 'CURRENT_PRODUCTION_SAFE'
    && riskAssessment
      .currentReleaseMayContinue
      === true
  );

  const gates = {
    classificationKnown:
      classificationKnown
      && impactKnown,
    baselineVerified:
      boolean(request.baselineVerified),
    operationalAssuranceVerified:
      boolean(
        request
          .operationalAssuranceVerified
      ),
    currentStateHealthy:
      boolean(request.currentStateHealthy),
    zeroCriticalDrift:
      Number(
        request.criticalFailedCheckCount
      ) === 0,
    evidenceComplete:
      boolean(request.evidenceComplete),
    changeScopeDeclared:
      Array.isArray(
        request.changeScope
      )
      && request.changeScope.length > 0
      && request.changeScope.every(
        value => (
          typeof value === 'string'
          && value.trim().length > 0
        )
      ),
    testsPassed:
      boolean(request.testsPassed),
    currentReleaseVerified:
      boolean(request.currentReleaseVerified),
    rollbackReady:
      boolean(request.rollbackReady),
    endpointsVerified:
      boolean(request.endpointsVerified),
    contractsVerified:
      boolean(request.contractsVerified),
    storageWithinLimit:
      boolean(request.storageWithinLimit),
    retentionVerified:
      boolean(request.retentionVerified),
    packagePlanVerified:
      boolean(request.packagePlanVerified),
    deploymentPlanVerified:
      boolean(request.deploymentPlanVerified),
    postDeploymentVerificationPlanned:
      boolean(
        request
          .postDeploymentVerificationPlanned
      ),
    riskToSafeAssessmentSafe:
      riskAssessmentSafe
  };

  const technicalReady = Object.values(
    gates
  ).every(Boolean);

  const cleanupRequested =
    boolean(request.cleanupRequested);

  const autonomousExternalMutationRequested =
    boolean(
      request
        .autonomousExternalMutationRequested
    );

  const forbiddenRequest = (
    cleanupRequested
    || autonomousExternalMutationRequested
  );

  const highImpact = (
    changeClass
      === 'HIGH_IMPACT_PRODUCTION_CHANGE'
    || impactLevel === 'HIGH'
    || impactLevel === 'CRITICAL'
  );

  let admissionStatus =
    FAIL_CLOSED_DECISION;

  let admissionDecision =
    'BLOCK_AND_PRESERVE_EVIDENCE';

  let admissionGranted = false;

  const requiredActions = [];

  if (
    changeClass === 'NO_CHANGE'
    && classificationKnown
    && impactKnown
  ) {
    admissionStatus =
      'NO_CHANGE_RECORDED';

    admissionDecision =
      'NO_PRODUCTION_CHANGE_REQUIRED';

    requiredActions.push(
      'continue_current_verified_release'
    );
  } else if (
    !classificationKnown
    || !impactKnown
  ) {
    requiredActions.push(
      'classify_change_before_admission'
    );
  } else if (forbiddenRequest) {
    requiredActions.push(
      'deny_cleanup_or_autonomous_external_mutation'
    );
  } else if (!technicalReady) {
    requiredActions.push(
      'complete_all_technical_gates'
    );
  } else if (!approval.trustedHumanApproval) {
    admissionStatus =
      'AWAITING_HUMAN_APPROVAL';

    admissionDecision =
      'TECHNICALLY_ELIGIBLE_BUT_NOT_ADMITTED';

    requiredActions.push(
      'obtain_verified_human_approval_record'
    );
  } else if (
    highImpact
    && !approval
      .highImpactApprovalVerified
  ) {
    admissionStatus =
      'AWAITING_HIGH_IMPACT_HUMAN_APPROVAL';

    admissionDecision =
      'HIGH_IMPACT_APPROVAL_REQUIRED';

    requiredActions.push(
      'obtain_verified_high_impact_human_approval'
    );
  } else {
    admissionStatus =
      'ADMISSION_APPROVED_FOR_MANUAL_EXECUTION';

    admissionDecision =
      'MANUAL_EXECUTION_MAY_PROCEED_WITHIN_APPROVED_SCOPE';

    admissionGranted = true;

    requiredActions.push(
      'execute_manually_within_approved_scope',
      'retain_rollback_releases',
      'run_post_deployment_verification',
      'record_new_production_baseline'
    );
  }

  return {
    schemaVersion: '1.0.0',
    system: SYSTEM,
    status: admissionStatus,
    mode: MODE,
    authority: AUTHORITY,
    changeClass,
    impactLevel,
    highImpact,
    admissionDecision,
    admissionGranted,
    technicalReady,
    gates,
    approval,
    riskAssessment: {
      system: riskAssessment.system,
      status: riskAssessment.status,
      driftClassification:
        riskAssessment
          .driftClassification,
      currentReleaseMayContinue:
        riskAssessment
          .currentReleaseMayContinue,
      promotionBlocked:
        riskAssessment.promotionBlocked,
      safeCandidateEligible:
        riskAssessment.safeCandidateEligible
    },
    requiredActions,
    technicalBoundaries: {
      externalRequestMayGrantApproval:
        false,
      externalMutationPerformed:
        false,
      productionDeploymentExecuted:
        false,
      servicesRestarted:
        false,
      packagesInstalled:
        false,
      cleanupAuthorized:
        false,
      cleanupExecuted:
        false,
      retentionMode:
        'DENY_BY_DEFAULT',
      humanDecisionAuthority:
        true,
      highImpactApprovalRequired:
        highImpact,
      recommendationOnly:
        true,
      futurePredictionClaim:
        false,
      unseenKnowledgeClaim:
        false
    }
  };
}

function verify() {
  const completeRequest = {
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
      true
  };

  const awaiting =
    assessProductionChangeAdmission(
      completeRequest
    );

  const approved =
    assessProductionChangeAdmission(
      completeRequest,
      {
        decisionAuthority:
          AUTHORITY,
        approvalRecordVerified: true,
        approvalScopeMatches: true,
        approvalRecordId:
          'VERIFICATION-APPROVAL-001',
        highImpactApprovalVerified:
          false
      }
    );

  const externalApproval =
    assessProductionChangeAdmission(
      {
        ...completeRequest,
        humanApproval: true
      }
    );

  const critical =
    assessProductionChangeAdmission(
      {
        ...completeRequest,
        driftClassification:
          'MULTIPLE_CRITICAL_DRIFT_CONDITIONS'
      }
    );

  const unknown =
    assessProductionChangeAdmission(
      {
        ...completeRequest,
        changeClass:
          'UNKNOWN_CHANGE_CLASS'
      }
    );

  const checks = {
    systemActive:
      status().status === 'ACTIVE',
    failClosed:
      status().failClosed === true,
    humanAuthority:
      status().authority
        === AUTHORITY,
    technicalCandidateWaits:
      awaiting.status
        === 'AWAITING_HUMAN_APPROVAL'
      && awaiting.admissionGranted
        === false,
    trustedApprovalAllowsManualDecision:
      approved.status
        === 'ADMISSION_APPROVED_FOR_MANUAL_EXECUTION'
      && approved.admissionGranted
        === true,
    externalApprovalIgnored:
      externalApproval
        .approval
        .requestHumanApprovalIgnored
        === true
      && externalApproval
        .approval
        .trustedHumanApproval
        === false,
    criticalRiskDenied:
      critical.status
        === FAIL_CLOSED_DECISION
      && critical.admissionGranted
        === false,
    unknownFailsClosed:
      unknown.status
        === FAIL_CLOSED_DECISION,
    noExternalMutation:
      approved.technicalBoundaries
        .externalMutationPerformed
        === false,
    noDeployment:
      approved.technicalBoundaries
        .productionDeploymentExecuted
        === false,
    noCleanup:
      approved.technicalBoundaries
        .cleanupExecuted
        === false,
    recommendationOnly:
      approved.technicalBoundaries
        .recommendationOnly
        === true
  };

  return {
    schemaVersion: '1.0.0',
    system: VERIFY_SYSTEM,
    checks,
    passed: Object.values(
      checks
    ).every(Boolean)
  };
}

module.exports = Object.freeze({
  SYSTEM,
  VERIFY_SYSTEM,
  MODE,
  AUTHORITY,
  FAIL_CLOSED_DECISION,
  KNOWN_CHANGE_CLASSES,
  IMPACT_LEVELS,
  TECHNICAL_GATES,
  DECISION_PIPELINE,
  status,
  verify,
  assessProductionChangeAdmission
});
