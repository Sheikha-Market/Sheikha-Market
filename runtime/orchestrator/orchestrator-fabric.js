'use strict';

const {
  createExecutionEnvelope
} = require('../../core/orchestration/sheikha-supreme-orchestrator-v1');

const FABRIC_NAME = 'SHEIKHA_ORCHESTRATOR_FABRIC_V2';

function status() {
  return {
    success: true,
    fabric: FABRIC_NAME,
    status: 'ACTIVE',
    position: 'HIGHEST_OPERATIONAL_LAYER',
    apexLevel: 11,
    lowerControlPlane: {
      name: 'SHEIKHA_FOUNDRY_ORCHESTRATION_APEX_V1',
      level: 10
    },
    runtimeBelow: 'SHEIKHA_CONVERSATION_LAYER_STACK_V1_L1_L8',
    components: {
      workflowEngine: 'ACTIVE',
      pipelineEngine: 'ACTIVE',
      taskDispatcher: 'ACTIVE',
      executionCoordinator: 'ACTIVE',
      foundryBridge: 'ACTIVE',
      governanceAdmissionBridge: 'ACTIVE',
      evidenceBridge: 'ACTIVE'
    },
    controls: {
      governanceAdmissionRequired: true,
      fabricEnvelopeRequired: true,
      foundryReviewRequired: true,
      noRuntimeSelfElevation: true,
      humanApprovalRequiredForWrites: true,
      evidenceRequired: true,
      noDestructiveActionWithoutReview: true
    }
  };
}

function orchestrate(payload = {}, governance = {}) {
  const executionEnvelope = createExecutionEnvelope(payload, governance);
  const allowed = governance.allowed !== false && executionEnvelope.status !== 'BLOCKED';
  const mutationRequested = payload.mutationRequested === true;
  const policyAuthorized = payload.mutationClass === 'APPEND_ONLY_TELEMETRY' &&
    governance.preApprovedPolicy === 'USAGE_METER_APPEND_ONLY';
  const mutationAuthorized = allowed && mutationRequested &&
    (governance.humanApproved === true || policyAuthorized);

  return {
    fabric: FABRIC_NAME,
    status: allowed ? 'ADMITTED' : 'BLOCKED',
    position: 'HIGHEST_OPERATIONAL_LAYER',
    apexLevel: 11,
    governanceAdmission: executionEnvelope.governanceAdmission,
    executionEnvelope,
    dispatch: {
      status: allowed ? 'ROUTED' : 'BLOCKED',
      target: allowed ? executionEnvelope.orchestrator.target : null,
      fallback: allowed ? executionEnvelope.orchestrator.fallback : null
    },
    executionOrder: [
      'GOVERNANCE_ADMISSION',
      'ORCHESTRATOR_FABRIC_V2_L11',
      'FOUNDRY_V3_REVIEW_L10',
      'SUPREME_ORCHESTRATOR_ENVELOPE_L10',
      'RUNTIME_STACK_L1_L8',
      'EVIDENCE_AND_AUDIT'
    ],
    mutationAuthorized,
    mutationControl: {
      requested: mutationRequested,
      humanApproved: governance.humanApproved === true,
      policyAuthorized,
      authorized: mutationAuthorized
    }
  };
}

module.exports = { FABRIC_NAME, orchestrate, status };
