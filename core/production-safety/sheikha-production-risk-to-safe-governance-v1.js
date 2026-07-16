'use strict';

const SYSTEM =
  'SHEIKHA_PRODUCTION_RISK_TO_SAFE_GOVERNANCE_V1';

const VERIFICATION_SYSTEM =
  'SHEIKHA_VERIFY_PRODUCTION_RISK_TO_SAFE_GOVERNANCE_V1';

const MODE =
  'PREVENT_CONTAIN_REMEDIATE_VERIFY_APPROVE_ONLY';

const RISK_CLASSIFICATIONS = Object.freeze([
  'NO_OPERATIONAL_DRIFT',
  'HEALTHY_RUNTIME_CHURN',
  'DEPLOYMENT_DRIFT',
  'SERVICE_DRIFT',
  'STORAGE_RISK',
  'RETENTION_DRIFT',
  'MULTIPLE_CRITICAL_DRIFT_CONDITIONS',
  'UNRECOGNIZED_STATE'
]);

const GOVERNANCE_GATES = Object.freeze([
  'TRUTHFULNESS',
  'NO_HARM',
  'SHARIA_COMPLIANCE',
  'BASELINE_INTEGRITY',
  'EVIDENCE_COMPLETENESS',
  'CURRENT_RELEASE_VERIFICATION',
  'ROLLBACK_READINESS',
  'HUMAN_AUTHORITY',
  'HIGH_IMPACT_APPROVAL',
  'NO_CLEANUP_BY_DEFAULT',
  'NO_UNVERIFIED_PROMOTION',
  'NO_AUTONOMOUS_EXTERNAL_MUTATION'
]);

const SAFE_PIPELINE = Object.freeze([
  'DETECT',
  'FREEZE_RISKY_PROMOTION',
  'PRESERVE_EVIDENCE',
  'CONTAIN',
  'BUILD_REMEDIATION_PLAN',
  'VERIFY_REMEDIATION',
  'REQUIRE_HUMAN_APPROVAL',
  'PROMOTE_ONLY_VERIFIED_SAFE_CANDIDATE',
  'KEEP_ROLLBACK_RELEASE',
  'OBSERVE'
]);

const ACTIONS = Object.freeze({
  NO_OPERATIONAL_DRIFT: Object.freeze([
    'continue_current_verified_release',
    'preserve_recorded_baseline',
    'observe_without_mutation'
  ]),
  HEALTHY_RUNTIME_CHURN: Object.freeze([
    'continue_current_verified_release',
    'record_runtime_change',
    'verify_endpoints_and_contracts',
    'observe_without_mutation'
  ]),
  DEPLOYMENT_DRIFT: Object.freeze([
    'freeze_all_new_promotions',
    'preserve_current_and_previous_releases',
    'compare_active_release_with_verified_manifest',
    'prepare_controlled_repair_candidate',
    'require_human_approval_before_any_switch'
  ]),
  SERVICE_DRIFT: Object.freeze([
    'freeze_high_impact_changes',
    'preserve_logs_and_runtime_evidence',
    'keep_current_service_when_health_is_verified',
    'prepare_verified_rollback_or_repair_plan',
    'require_human_approval_before_restart_or_switch'
  ]),
  STORAGE_RISK: Object.freeze([
    'deny_new_release_expansion',
    'preserve_current_and_rollback_releases',
    'measure_storage_scope',
    'prepare_non_destructive_capacity_plan',
    'require_explicit_cleanup_scope_and_independent_backup'
  ]),
  RETENTION_DRIFT: Object.freeze([
    'deny_cleanup',
    'freeze_release_retirement',
    'restore_deny_by_default_retention_policy',
    'verify_current_and_rollback_release_presence',
    'require_human_approval'
  ]),
  MULTIPLE_CRITICAL_DRIFT_CONDITIONS: Object.freeze([
    'enter_safe_hold',
    'freeze_all_promotions_restarts_and_cleanup',
    'preserve_all_available_evidence',
    'isolate_decision_authority_to_human_review',
    'prepare_ordered_recovery_plan',
    'verify_each recovery_gate_before_execution'
  ]),
  UNRECOGNIZED_STATE: Object.freeze([
    'enter_safe_hold',
    'deny_promotion_restart_and_cleanup',
    'preserve_evidence',
    'require_complete_classification',
    'require_human_review'
  ])
});

const SEVERITY = Object.freeze({
  NO_OPERATIONAL_DRIFT: 'LOW',
  HEALTHY_RUNTIME_CHURN: 'LOW',
  DEPLOYMENT_DRIFT: 'HIGH',
  SERVICE_DRIFT: 'HIGH',
  STORAGE_RISK: 'HIGH',
  RETENTION_DRIFT: 'HIGH',
  MULTIPLE_CRITICAL_DRIFT_CONDITIONS: 'CRITICAL',
  UNRECOGNIZED_STATE: 'CRITICAL'
});

function asBoolean(value) {
  return value === true;
}

function normalizeClassification(value) {
  if (
    typeof value === 'string'
    && RISK_CLASSIFICATIONS.includes(value)
  ) {
    return value;
  }

  return 'UNRECOGNIZED_STATE';
}

function normalizeInput(input = {}) {
  const source = (
    input
    && typeof input === 'object'
    && !Array.isArray(input)
  )
    ? input
    : {};

  return Object.freeze({
    driftClassification:
      normalizeClassification(
        source.driftClassification
      ),
    baselineVerified:
      asBoolean(source.baselineVerified),
    evidenceComplete:
      asBoolean(source.evidenceComplete),
    currentReleaseVerified:
      asBoolean(source.currentReleaseVerified),
    rollbackReleaseRetained:
      asBoolean(source.rollbackReleaseRetained),
    endpointsVerified:
      asBoolean(source.endpointsVerified),
    contractsVerified:
      asBoolean(source.contractsVerified),
    storageWithinLimit:
      asBoolean(source.storageWithinLimit),
    retentionPolicyVerified:
      asBoolean(source.retentionPolicyVerified),
    humanApproval:
      asBoolean(source.humanApproval)
  });
}

function buildGateState(normalized) {
  const lowRisk = (
    normalized.driftClassification
      === 'NO_OPERATIONAL_DRIFT'
    || normalized.driftClassification
      === 'HEALTHY_RUNTIME_CHURN'
  );

  const technicalReady = (
    normalized.baselineVerified
    && normalized.evidenceComplete
    && normalized.currentReleaseVerified
    && normalized.rollbackReleaseRetained
    && normalized.endpointsVerified
    && normalized.contractsVerified
    && normalized.storageWithinLimit
    && normalized.retentionPolicyVerified
  );

  return Object.freeze({
    classificationKnown:
      normalized.driftClassification
      !== 'UNRECOGNIZED_STATE',
    lowRisk,
    baselineVerified:
      normalized.baselineVerified,
    evidenceComplete:
      normalized.evidenceComplete,
    currentReleaseVerified:
      normalized.currentReleaseVerified,
    rollbackReleaseRetained:
      normalized.rollbackReleaseRetained,
    endpointsVerified:
      normalized.endpointsVerified,
    contractsVerified:
      normalized.contractsVerified,
    storageWithinLimit:
      normalized.storageWithinLimit,
    retentionPolicyVerified:
      normalized.retentionPolicyVerified,
    humanApproval:
      normalized.humanApproval,
    technicalReady,
    safeCandidateEligible:
      lowRisk
      && technicalReady
      && normalized.humanApproval
  });
}

function decisionFor(classification, gates) {
  if (
    classification
      === 'NO_OPERATIONAL_DRIFT'
    && gates.technicalReady
  ) {
    return Object.freeze({
      status: 'CURRENT_PRODUCTION_SAFE',
      productionDecision:
        'CONTINUE_CURRENT_VERIFIED_RELEASE',
      promotionBlocked: true,
      currentReleaseMayContinue: true,
      safeCandidateEligible:
        gates.safeCandidateEligible
    });
  }

  if (
    classification
      === 'HEALTHY_RUNTIME_CHURN'
    && gates.technicalReady
  ) {
    return Object.freeze({
      status: 'OBSERVE_VERIFIED_RUNTIME_CHANGE',
      productionDecision:
        'CONTINUE_AND_OBSERVE_CURRENT_RELEASE',
      promotionBlocked: true,
      currentReleaseMayContinue: true,
      safeCandidateEligible:
        gates.safeCandidateEligible
    });
  }

  return Object.freeze({
    status: 'SAFE_HOLD',
    productionDecision:
      'BLOCK_RISKY_PRODUCTION_AND_REMEDIATE',
    promotionBlocked: true,
    currentReleaseMayContinue: false,
    safeCandidateEligible: false
  });
}

function assessProductionRisk(input = {}) {
  const normalized = normalizeInput(input);
  const gates = buildGateState(normalized);
  const classification =
    normalized.driftClassification;
  const decision =
    decisionFor(classification, gates);

  return Object.freeze({
    schemaVersion: '1.0.0',
    system: SYSTEM,
    status: decision.status,
    mode: MODE,
    driftClassification: classification,
    severity: SEVERITY[classification],
    productionDecision:
      decision.productionDecision,
    promotionBlocked:
      decision.promotionBlocked,
    currentReleaseMayContinue:
      decision.currentReleaseMayContinue,
    safeCandidateEligible:
      decision.safeCandidateEligible,
    governanceGates: GOVERNANCE_GATES,
    safePipeline: SAFE_PIPELINE,
    requiredActions: ACTIONS[classification],
    gates,
    technicalBoundaries: Object.freeze({
      externalMutationPerformed: false,
      productionDeploymentExecuted: false,
      servicesRestarted: false,
      packagesInstalled: false,
      cleanupAuthorized: false,
      cleanupExecuted: false,
      retentionMode: 'DENY_BY_DEFAULT',
      humanDecisionAuthority: true,
      highImpactApprovalRequired: true,
      recommendationOnly: true,
      futurePredictionClaim: false,
      unseenKnowledgeClaim: false
    })
  });
}

function status() {
  return Object.freeze({
    schemaVersion: '1.0.0',
    system: SYSTEM,
    status: 'ACTIVE',
    mode: MODE,
    riskClassifications:
      RISK_CLASSIFICATIONS,
    governanceGates: GOVERNANCE_GATES,
    safePipeline: SAFE_PIPELINE,
    failClosed: true,
    unknownStateDecision: 'SAFE_HOLD',
    riskyPromotionAllowed: false,
    externalMutationPerformed: false,
    productionDeploymentExecuted: false,
    servicesRestarted: false,
    cleanupAuthorized: false,
    cleanupExecuted: false,
    retentionMode: 'DENY_BY_DEFAULT',
    humanDecisionAuthority: true,
    recommendationOnly: true
  });
}

function verify() {
  const safeInput = {
    driftClassification:
      'NO_OPERATIONAL_DRIFT',
    baselineVerified: true,
    evidenceComplete: true,
    currentReleaseVerified: true,
    rollbackReleaseRetained: true,
    endpointsVerified: true,
    contractsVerified: true,
    storageWithinLimit: true,
    retentionPolicyVerified: true,
    humanApproval: true
  };

  const riskInput = {
    ...safeInput,
    driftClassification:
      'MULTIPLE_CRITICAL_DRIFT_CONDITIONS'
  };

  const unknownInput = {
    ...safeInput,
    driftClassification:
      'NOT_A_RECOGNIZED_CLASSIFICATION'
  };

  const safeAssessment =
    assessProductionRisk(safeInput);

  const riskAssessment =
    assessProductionRisk(riskInput);

  const unknownAssessment =
    assessProductionRisk(unknownInput);

  const checks = Object.freeze({
    systemActive:
      status().status === 'ACTIVE',
    sevenKnownRiskStatesPlusFailClosed:
      RISK_CLASSIFICATIONS.length === 8,
    twelveGovernanceGates:
      GOVERNANCE_GATES.length === 12,
    tenSafePipelineStages:
      SAFE_PIPELINE.length === 10,
    safeCurrentReleaseRecognized:
      safeAssessment.status
      === 'CURRENT_PRODUCTION_SAFE',
    safeCandidateRequiresHumanApproval:
      safeAssessment.safeCandidateEligible
      === true,
    criticalRiskHeld:
      riskAssessment.status
      === 'SAFE_HOLD',
    criticalRiskPromotionBlocked:
      riskAssessment.promotionBlocked
      === true,
    unknownFailsClosed:
      unknownAssessment.driftClassification
      === 'UNRECOGNIZED_STATE'
      && unknownAssessment.status
      === 'SAFE_HOLD',
    noExternalMutation:
      riskAssessment.technicalBoundaries
        .externalMutationPerformed
      === false,
    noCleanup:
      riskAssessment.technicalBoundaries
        .cleanupAuthorized
      === false,
    humanAuthorityPreserved:
      riskAssessment.technicalBoundaries
        .humanDecisionAuthority
      === true
  });

  return Object.freeze({
    schemaVersion: '1.0.0',
    system: VERIFICATION_SYSTEM,
    checks,
    passed:
      Object.values(checks).every(Boolean)
  });
}

module.exports = Object.freeze({
  SYSTEM,
  VERIFICATION_SYSTEM,
  MODE,
  RISK_CLASSIFICATIONS,
  GOVERNANCE_GATES,
  SAFE_PIPELINE,
  ACTIONS,
  SEVERITY,
  normalizeInput,
  assessProductionRisk,
  status,
  verify
});
