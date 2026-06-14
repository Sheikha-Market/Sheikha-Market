'use strict';

const crypto = require('crypto');
const { reviewRequest, status: foundryStatus } = require('../foundry/sheikha-foundry-v3');

const APEX_NAME = 'SHEIKHA_FOUNDRY_ORCHESTRATION_APEX_V1';

function status() {
  return {
    success: true,
    controlPlane: APEX_NAME,
    status: 'ACTIVE',
    position: 'HIGHEST_OPERATIONAL_CONTROL_PLANE',
    apexLevel: 10,
    runtimeBelow: 'SHEIKHA_CONVERSATION_LAYER_STACK_V1_L1_L8',
    authorities: {
      foundry: foundryStatus(),
      orchestrator: {
        name: 'SHEIKHA_SUPREME_ORCHESTRATOR_V1',
        status: 'ACTIVE',
        position: 'APEX_CONTROL_PLANE',
        apexLevel: 10,
        authority: 'ROUTING_COORDINATION_AND_EXECUTION_ENVELOPES'
      }
    },
    constitutionalConstraint: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
    controls: {
      governanceAdmissionRequired: true,
      foundryReviewBeforeDispatch: true,
      orchestratorEnvelopeRequired: true,
      runtimeCannotSelfElevate: true,
      inspectorDiagnosticsOnly: true,
      unifiedChatFallbackOnly: true,
      evidenceRequired: true,
      humanAuthorityRetained: true
    }
  };
}

function createExecutionEnvelope(payload = {}, governance = {}) {
  const foundryReview = reviewRequest(payload);
  const allowed = governance.allowed !== false;

  return {
    controlPlane: APEX_NAME,
    status: allowed ? 'ADMITTED' : 'BLOCKED',
    apexLevel: 10,
    requestId: crypto.randomUUID(),
    governanceAdmission: {
      engine: governance.engine || 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
      status: governance.status || (allowed ? 'APPROVED' : 'BLOCKED'),
      allowed
    },
    foundry: foundryReview,
    orchestrator: {
      name: 'SHEIKHA_SUPREME_ORCHESTRATOR_V1',
      status: allowed ? 'ROUTED' : 'BLOCKED',
      target: allowed ? 'SHEIKHA_CONVERSATION_ENGINE_V1' : null,
      fallback: allowed ? 'SHEIKHA_UNIFIED_CHAT_FABRIC_V1' : null,
      diagnosticTarget: payload.diagnosticRequested === true
        ? 'SHEIKHA_ENTERPRISE_INSPECTOR_V3'
        : null
    },
    executionOrder: [
      'GOVERNANCE_ADMISSION',
      'FOUNDRY_V3_REVIEW',
      'SUPREME_ORCHESTRATOR_ENVELOPE',
      'RUNTIME_STACK_L1_L8',
      'EVIDENCE_AND_AUDIT'
    ],
    mutationAuthorized: false
  };
}

module.exports = { APEX_NAME, createExecutionEnvelope, status };
