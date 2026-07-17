'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SYSTEM =
  'SHEIKHA_PRODUCTION_CHANGE_ADMISSION_ENFORCEMENT_PLANE_V1';

const AUTHORITY = 'HUMAN_ONLY';
const EXECUTION_BOUNDARY =
  'CONTROLLED_LOCAL_PRODUCTION_PROMOTION_WORKFLOW';

const APPROVAL_RECORD_SYSTEM =
  'SHEIKHA_CONTROLLED_LOCAL_PRODUCTION_APPROVAL_RECORD_V1';

const APPROVAL_CHANNEL =
  'LOCAL_HUMAN_SESSION_ACKNOWLEDGEMENT';

const EXTERNAL_APPROVAL_FIELDS = Object.freeze([
  'approval',
  'approved',
  'humanApproval',
  'highImpactApproval',
  'externalApproval',
  'trustedHumanApproval'
]);

const sha256 = value =>
  crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');

const normalizeScope = scope => {
  if (!Array.isArray(scope)) {
    return [];
  }

  return [
    ...new Set(
      scope
        .filter(item => typeof item === 'string')
        .map(item => item.trim())
        .filter(Boolean)
    )
  ].sort();
};

const scopeDigest = scope =>
  sha256(
    JSON.stringify(
      normalizeScope(scope)
    )
  );

const detectExternalApprovalFields = request => {
  if (!request || typeof request !== 'object') {
    return [];
  }

  return EXTERNAL_APPROVAL_FIELDS.filter(
    field =>
      Object.prototype.hasOwnProperty.call(
        request,
        field
      )
  );
};

const readApprovalRecord = ({
  approvalRecordPath,
  expectedApprovalRecordSha256
}) => {
  if (
    typeof approvalRecordPath !== 'string'
    || !path.isAbsolute(approvalRecordPath)
  ) {
    return {
      valid: false,
      reason:
        'APPROVAL_RECORD_PATH_MUST_BE_ABSOLUTE'
    };
  }

  if (
    typeof expectedApprovalRecordSha256
      !== 'string'
    || !/^[a-f0-9]{64}$/u.test(
      expectedApprovalRecordSha256
    )
  ) {
    return {
      valid: false,
      reason:
        'EXPECTED_APPROVAL_RECORD_SHA256_INVALID'
    };
  }

  let bytes;

  try {
    bytes = fs.readFileSync(
      approvalRecordPath
    );
  } catch {
    return {
      valid: false,
      reason:
        'APPROVAL_RECORD_NOT_READABLE'
    };
  }

  const actualSha256 = sha256(bytes);

  if (
    actualSha256
      !== expectedApprovalRecordSha256
  ) {
    return {
      valid: false,
      reason:
        'APPROVAL_RECORD_SHA256_MISMATCH',
      actualSha256
    };
  }

  let record;

  try {
    record = JSON.parse(
      bytes.toString('utf8')
    );
  } catch {
    return {
      valid: false,
      reason:
        'APPROVAL_RECORD_JSON_INVALID',
      actualSha256
    };
  }

  return {
    valid: true,
    actualSha256,
    record
  };
};

const verifyApprovalRecord = ({
  request,
  approvalRecordPath,
  expectedApprovalRecordSha256
}) => {
  const loaded = readApprovalRecord({
    approvalRecordPath,
    expectedApprovalRecordSha256
  });

  if (!loaded.valid) {
    return loaded;
  }

  const { record } = loaded;
  const requestScope =
    normalizeScope(request.scopePaths);
  const recordScope =
    normalizeScope(record.scopePaths);

  const checks = {
    system:
      record.system
        === APPROVAL_RECORD_SYSTEM,
    channel:
      record.approvalChannel
        === APPROVAL_CHANNEL,
    authority:
      record.authority === AUTHORITY,
    approved:
      record.approved === true,
    identityProofNotClaimed:
      record.identityProofClaimed
        === false,
    candidate:
      record.candidateMainHead
        === request.candidateMainHead,
    payload:
      record.payloadSha256
        === request.payloadSha256,
    scope:
      scopeDigest(recordScope)
        === scopeDigest(requestScope),
    approver:
      typeof record.approverId
        === 'string'
      && record.approverId.length > 0,
    rollback:
      record.rollbackRequired
        === true,
    noInstall:
      record.packageInstallAllowed
        === false,
    noCleanup:
      record.cleanupAllowed
        === false
  };

  const failedChecks = Object.entries(
    checks
  )
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    valid:
      failedChecks.length === 0,
    reason:
      failedChecks.length
        ? 'APPROVAL_RECORD_INVARIANTS_FAILED'
        : 'APPROVAL_RECORD_VERIFIED',
    actualSha256:
      loaded.actualSha256,
    checks,
    failedChecks,
    record: {
      system: record.system,
      approvalChannel:
        record.approvalChannel,
      authority: record.authority,
      approverId: record.approverId,
      candidateMainHead:
        record.candidateMainHead,
      payloadSha256:
        record.payloadSha256,
      scopePaths: recordScope,
      scopeSha256:
        scopeDigest(recordScope),
      approved: record.approved,
      identityProofClaimed:
        record.identityProofClaimed,
      rollbackRequired:
        record.rollbackRequired,
      packageInstallAllowed:
        record.packageInstallAllowed,
      cleanupAllowed:
        record.cleanupAllowed
    }
  };
};

const status = () => ({
  system: SYSTEM,
  status: 'ACTIVE',
  authority: AUTHORITY,
  executionBoundary: EXECUTION_BOUNDARY,
  failClosed: true,
  executesCommands: false,
  performsProductionMutation: false,
  acceptsHttpApproval: false,
  acceptsExternalApprovalFields: false,
  requiresLocalApprovalRecord: true,
  approvalRecordSystem:
    APPROVAL_RECORD_SYSTEM,
  approvalChannel:
    APPROVAL_CHANNEL
});

const verify = () => {
  const current = status();

  const checks = {
    system:
      current.system === SYSTEM,
    active:
      current.status === 'ACTIVE',
    authority:
      current.authority === AUTHORITY,
    boundary:
      current.executionBoundary
        === EXECUTION_BOUNDARY,
    failClosed:
      current.failClosed === true,
    noExecution:
      current.executesCommands === false,
    noProductionMutation:
      current.performsProductionMutation
        === false,
    noHttpApproval:
      current.acceptsHttpApproval
        === false,
    noExternalApproval:
      current.acceptsExternalApprovalFields
        === false,
    localRecordRequired:
      current.requiresLocalApprovalRecord
        === true
  };

  const failedChecks = Object.entries(
    checks
  )
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    system: SYSTEM,
    passed:
      failedChecks.length === 0,
    checks,
    failedChecks
  };
};

const assessControlledPromotion = input => {
  const request =
    input?.request
    && typeof input.request === 'object'
      ? input.request
      : {};

  const gateAssessment =
    input?.gateAssessment
    && typeof input.gateAssessment
      === 'object'
      ? input.gateAssessment
      : {};

  const externalFields =
    detectExternalApprovalFields(
      request
    );

  const approval = verifyApprovalRecord({
    request,
    approvalRecordPath:
      input?.approvalRecordPath,
    expectedApprovalRecordSha256:
      input?.expectedApprovalRecordSha256
  });

  const checks = {
    localSource:
      request.source
        === 'LOCAL_CONTROLLED_WORKFLOW',
    executionBoundary:
      request.executionBoundary
        === EXECUTION_BOUNDARY,
    noExternalApprovalFields:
      externalFields.length === 0,
    candidateMainHead:
      typeof request.candidateMainHead
        === 'string'
      && /^[a-f0-9]{40}$/u.test(
        request.candidateMainHead
      ),
    payloadSha256:
      typeof request.payloadSha256
        === 'string'
      && /^[a-f0-9]{64}$/u.test(
        request.payloadSha256
      ),
    nonEmptyScope:
      normalizeScope(
        request.scopePaths
      ).length > 0,
    baselineVerified:
      request.baselineVerified
        === true,
    operationalAssuranceVerified:
      request
        .operationalAssuranceVerified
        === true,
    noOperationalDrift:
      request.driftClassification
        === 'NO_OPERATIONAL_DRIFT',
    zeroCriticalFailures:
      request.criticalFailedCheckCount
        === 0,
    currentStateHealthy:
      request.currentStateHealthy
        === true,
    rollbackReady:
      request.rollbackReady === true,
    noPackageInstall:
      request.packageInstallRequested
        === false,
    noCleanup:
      request.cleanupRequested
        === false,
    gateAwaitingHumanApproval:
      gateAssessment.status
        === 'AWAITING_HUMAN_APPROVAL',
    gateDidNotGrant:
      gateAssessment.admissionGranted
        === false,
    gateAuthorityHumanOnly:
      gateAssessment.authority
        === AUTHORITY,
    gateExternalApprovalUntrusted:
      gateAssessment
        .trustedHumanApproval
        === false,
    approvalRecord:
      approval.valid === true
  };

  const failedChecks = Object.entries(
    checks
  )
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  const admitted =
    failedChecks.length === 0;

  return {
    system: SYSTEM,
    authority: AUTHORITY,
    executionBoundary:
      EXECUTION_BOUNDARY,
    status:
      admitted
        ? 'CONTROLLED_WORKFLOW_ADMITTED'
        : 'SAFE_HOLD',
    controlledWorkflowAdmissionGranted:
      admitted,
    productionExecutionPerformed:
      false,
    commandsExecuted: false,
    failClosed: true,
    externalApprovalFieldsPresent:
      externalFields.length > 0,
    externalApprovalFields:
      externalFields,
    approvalRecord: approval,
    checks,
    failedChecks,
    nextAction:
      admitted
        ? 'CONTROLLED_WORKFLOW_MAY_PROCEED_UNDER_SEPARATE_EXECUTION_SCRIPT'
        : 'HUMAN_REVIEW_REQUIRED'
  };
};

module.exports = {
  SYSTEM,
  AUTHORITY,
  EXECUTION_BOUNDARY,
  APPROVAL_RECORD_SYSTEM,
  APPROVAL_CHANNEL,
  status,
  verify,
  normalizeScope,
  scopeDigest,
  detectExternalApprovalFields,
  verifyApprovalRecord,
  assessControlledPromotion
};
