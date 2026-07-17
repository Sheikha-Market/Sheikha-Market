'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const enforcement = require(
  './sheikha-production-change-admission-enforcement-plane-v1'
);

const SYSTEM =
  'SHEIKHA_ENFORCEMENT_GOVERNED_PRODUCTION_PROMOTION_WORKFLOW_V1';
const STATUS = 'READY';
const AUTHORITY = 'HUMAN_ONLY';
const EXECUTION_BOUNDARY =
  enforcement.EXECUTION_BOUNDARY
  || 'CONTROLLED_LOCAL_PRODUCTION_PROMOTION_WORKFLOW';

const PHASES = Object.freeze([
  'VERIFY_LOCAL_EVIDENCE',
  'VERIFY_EXACT_SCOPE',
  'MATERIALIZE_PROPOSED_RELEASE',
  'VERIFY_PROPOSED_RELEASE',
  'SWITCH_CURRENT_LINK',
  'VERIFY_PM2_PROCESS_UNCHANGED',
  'VERIFY_POST_PROMOTION_HEALTH',
  'PRESERVE_ROLLBACK_RELEASES'
]);

function normalizeScopePaths(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(
    values
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean)
  )].sort();
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

function safeHold(failedChecks, extra = {}) {
  return {
    system: SYSTEM,
    status: 'SAFE_HOLD',
    authority: AUTHORITY,
    executionBoundary: EXECUTION_BOUNDARY,
    workflowAdmissionGranted: false,
    promotionPlanCreated: false,
    commandsExecuted: false,
    productionMutationPerformed: false,
    serviceRestartPerformed: false,
    packageInstallPerformed: false,
    cleanupPerformed: false,
    requiresSeparateReviewedExecutor: true,
    failedChecks,
    ...extra
  };
}

function preflight(input) {
  const failed = [];
  const scopePaths = normalizeScopePaths(input.scopePaths);
  const externalFields = [
    'httpApproval',
    'externalApproval',
    'approvalToken',
    'trustedExternalApproval',
    'approvalFromHttp'
  ];

  if (input.source !== 'LOCAL_CONTROLLED_WORKFLOW') {
    failed.push('LOCAL_SOURCE_REQUIRED');
  }

  if (
    externalFields.some(
      (field) => Object.prototype.hasOwnProperty.call(input, field)
    )
  ) {
    failed.push('EXTERNAL_APPROVAL_FIELDS_DENIED');
  }

  if (!/^[a-f0-9]{40}$/u.test(input.candidateMainHead || '')) {
    failed.push('CANDIDATE_MAIN_HEAD_INVALID');
  }

  if (!/^[a-f0-9]{64}$/u.test(input.payloadSha256 || '')) {
    failed.push('PAYLOAD_SHA256_INVALID');
  }

  if (!/^[a-f0-9]{64}$/u.test(input.approvalRecordSha256 || '')) {
    failed.push('APPROVAL_RECORD_SHA256_INVALID');
  }

  if (!input.approvalRecordPath || scopePaths.length === 0) {
    failed.push('LOCAL_APPROVAL_AND_SCOPE_REQUIRED');
  }

  if (!input.currentRelease || !input.targetRelease) {
    failed.push('RELEASE_PATHS_REQUIRED');
  }

  if (input.currentRelease === input.targetRelease) {
    failed.push('TARGET_RELEASE_MUST_DIFFER');
  }

  if (input.baselineVerified !== true) {
    failed.push('BASELINE_VERIFICATION_REQUIRED');
  }

  if (input.operationalAssuranceVerified !== true) {
    failed.push('OPERATIONAL_ASSURANCE_REQUIRED');
  }

  if (input.driftClassification !== 'NO_OPERATIONAL_DRIFT') {
    failed.push('NO_OPERATIONAL_DRIFT_REQUIRED');
  }

  if (input.criticalFailedCheckCount !== 0) {
    failed.push('CRITICAL_FAILED_CHECK_COUNT_MUST_BE_ZERO');
  }

  if (input.currentStateHealthy !== true) {
    failed.push('CURRENT_STATE_HEALTHY_REQUIRED');
  }

  if (input.rollbackReady !== true) {
    failed.push('ROLLBACK_READY_REQUIRED');
  }

  if (input.packageInstallRequested !== false) {
    failed.push('PACKAGE_INSTALL_DENIED');
  }

  if (input.cleanupRequested !== false) {
    failed.push('CLEANUP_DENIED');
  }

  if (input.serviceRestartRequested !== false) {
    failed.push('SERVICE_RESTART_DENIED');
  }

  const gate = input.gateAssessment || {};

  if (
    gate.status !== 'AWAITING_HUMAN_APPROVAL'
    || gate.admissionGranted !== false
    || gate.authority !== AUTHORITY
    || gate.trustedHumanApproval !== false
  ) {
    failed.push('GATE_INVARIANTS_FAILED');
  }

  return { failed, scopePaths };
}

function assessPromotionWorkflow(input = {}) {
  const { failed, scopePaths } = preflight(input);
  if (failed.length > 0) return safeHold(failed);

  const request = {
    source: input.source,
    executionBoundary: EXECUTION_BOUNDARY,
    candidateMainHead: input.candidateMainHead,
    payloadSha256: input.payloadSha256,
    scopePaths,
    baselineVerified: input.baselineVerified,
    operationalAssuranceVerified: input.operationalAssuranceVerified,
    driftClassification: input.driftClassification,
    criticalFailedCheckCount: input.criticalFailedCheckCount,
    currentStateHealthy: input.currentStateHealthy,
    rollbackReady: input.rollbackReady,
    packageInstallRequested: input.packageInstallRequested,
    cleanupRequested: input.cleanupRequested
  };

  let enforcementResult;
  try {
    enforcementResult = enforcement.assessControlledPromotion({
      request,
      gateAssessment: input.gateAssessment,
      approvalRecordPath: input.approvalRecordPath,
      expectedApprovalRecordSha256: input.approvalRecordSha256
    });
  } catch (error) {
    return safeHold(
      ['ENFORCEMENT_ASSESSMENT_ERROR'],
      { enforcementError: String(error.message || error) }
    );
  }

  if (
    enforcementResult.status !== 'CONTROLLED_WORKFLOW_ADMITTED'
    || enforcementResult.controlledWorkflowAdmissionGranted !== true
    || enforcementResult.productionExecutionPerformed !== false
  ) {
    return safeHold(
      ['ENFORCEMENT_ADMISSION_NOT_GRANTED'],
      { enforcementResult }
    );
  }

  const plan = {
    system: SYSTEM,
    authority: AUTHORITY,
    executionBoundary: EXECUTION_BOUNDARY,
    candidateMainHead: input.candidateMainHead,
    payloadSha256: input.payloadSha256,
    approvalRecordSha256: input.approvalRecordSha256,
    currentRelease: input.currentRelease,
    targetRelease: input.targetRelease,
    scopePaths,
    packageInstallAllowed: false,
    cleanupAllowed: false,
    serviceRestartAllowed: false,
    rollbackRequired: true,
    phases: PHASES.map((phase, index) => ({
      order: index + 1,
      phase,
      executionPerformed: false
    }))
  };

  plan.promotionPlanSha256 = sha256(JSON.stringify(plan));

  return {
    system: SYSTEM,
    status: 'PROMOTION_PLAN_READY',
    authority: AUTHORITY,
    executionBoundary: EXECUTION_BOUNDARY,
    workflowAdmissionGranted: true,
    promotionPlanCreated: true,
    commandsExecuted: false,
    productionMutationPerformed: false,
    serviceRestartPerformed: false,
    packageInstallPerformed: false,
    cleanupPerformed: false,
    requiresSeparateReviewedExecutor: true,
    enforcementResult,
    promotionPlan: plan,
    failedChecks: []
  };
}

function status() {
  return {
    system: SYSTEM,
    status: STATUS,
    authority: AUTHORITY,
    executionBoundary: EXECUTION_BOUNDARY,
    phases: [...PHASES],
    httpApprovalAccepted: false,
    externalApprovalTrusted: false,
    executesCommands: false,
    performsProductionMutation: false,
    requiresSeparateReviewedExecutor: true
  };
}

function selfVerify() {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'sheikha-governed-promotion-')
  );
  const approvalRecordPath = path.join(tempDir, 'approval.json');
  const candidateMainHead = 'a'.repeat(40);
  const payloadSha256 = 'b'.repeat(64);
  const scopePaths = ['package.json', 'tools/example.js'].sort();
  const record = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_CONTROLLED_LOCAL_PRODUCTION_APPROVAL_RECORD_V1',
    approvalChannel: 'LOCAL_HUMAN_SESSION_ACKNOWLEDGEMENT',
    authority: AUTHORITY,
    approverId: 'SALMAN_AHMED_SALMAN_AL_RAJEH',
    candidateMainHead,
    payloadSha256,
    scopePaths,
    approved: true,
    identityProofClaimed: false,
    rollbackRequired: true,
    packageInstallAllowed: false,
    cleanupAllowed: false,
    serviceRestartAllowed: false,
    targetRelease: '/opt/sheikha/releases/target',
    governanceReference: 'الكتاب والسنة',
    noHarmRule: 'لا ضرر ولا ضرار'
  };

  try {
    fs.writeFileSync(
      approvalRecordPath,
      `${JSON.stringify(record, null, 2)}\n`,
      'utf8'
    );
    const approvalRecordSha256 = sha256(
      fs.readFileSync(approvalRecordPath)
    );
    const result = assessPromotionWorkflow({
      source: 'LOCAL_CONTROLLED_WORKFLOW',
      candidateMainHead,
      payloadSha256,
      approvalRecordPath,
      approvalRecordSha256,
      currentRelease: '/opt/sheikha/releases/current',
      targetRelease: record.targetRelease,
      scopePaths,
      baselineVerified: true,
      operationalAssuranceVerified: true,
      driftClassification: 'NO_OPERATIONAL_DRIFT',
      criticalFailedCheckCount: 0,
      currentStateHealthy: true,
      rollbackReady: true,
      packageInstallRequested: false,
      cleanupRequested: false,
      serviceRestartRequested: false,
      gateAssessment: {
        status: 'AWAITING_HUMAN_APPROVAL',
        admissionGranted: false,
        authority: AUTHORITY,
        trustedHumanApproval: false
      }
    });

    const checks = {
      ready: status().status === STATUS,
      admitted: result.workflowAdmissionGranted === true,
      plan: result.promotionPlanCreated === true,
      noExecution:
        result.commandsExecuted === false
        && result.productionMutationPerformed === false,
      separateExecutor:
        result.requiresSeparateReviewedExecutor === true
    };

    return {
      system: SYSTEM,
      status: Object.values(checks).every(Boolean)
        ? 'VERIFIED'
        : 'FAILED',
      checks,
      failedChecks: Object.entries(checks)
        .filter(([, passed]) => !passed)
        .map(([name]) => name)
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

module.exports = {
  SYSTEM,
  STATUS,
  AUTHORITY,
  EXECUTION_BOUNDARY,
  PHASES,
  normalizeScopePaths,
  assessPromotionWorkflow,
  status,
  selfVerify
};
