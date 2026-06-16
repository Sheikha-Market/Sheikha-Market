'use strict';

const { status: vitalChatStatus } = require(
  '../../vital-chat-apex/v1/sheikha-vital-chat-apex-v1'
);

function status() {
  return {
    system: 'SHEIKHA_DEBUGGING_APEX_V1',
    status: 'ACTIVE',
    arabicName: 'قمة التصحيح والتشخيص في شيخة',
    level: 'HIGHEST_GOVERNED_DEBUGGING_DIAGNOSTICS_AND_REPAIR_PLANNING_LAYER',
    position: 'PEER_TOP_WITH_IDE_APEX_ABOVE_VITAL_CHAT_APEX_ENTERPRISE_INSPECTOR_AND_RUNTIME_GOVERNANCE',
    governedBy: [
      'SHEIKHA_COVENANT_GOVERNANCE_APEX_V1',
      'SHEIKHA_LAYER_GOVERNANCE_AND_PROMOTION_OS_V1',
      'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1'
    ],
    stack: {
      promotedBy: 'SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1',
      ideApex: 'SHEIKHA_IDE_APEX_V1',
      vitalChatApex: vitalChatStatus().system,
      conversationDebugPipeline: 'SHEIKHA_EXECUTION_PIPELINE_V1_DEBUG_PIPELINE',
      enterpriseInspector: 'SHEIKHA_ENTERPRISE_INSPECTOR_V3',
      intelligentInspector: 'SHEIKHA_INTELLIGENT_INSPECTOR_V1',
      logIntelligence: 'SHEIKHA_LOG_INTELLIGENCE_V2',
      selfGovernance: 'SHEIKHA_SELF_GOVERNANCE_CONTROLLER_V2',
      vscodeDiagnostics: 'SHEIKHA_VSCODE_TOOL_REGISTRY_V1_DIAGNOSTICS',
      gitAwareness: 'READ_ONLY_GIT_STATUS_AND_BRANCH',
      runtimeHealth: 'HEALTH_PORT_RUNTIME_POLICY',
      decisionFlowHealth: '/api/decision-flow/health'
    },
    routes: {
      status: '/api/sheikha/debugging-apex/v1/status',
      technicalCapabilityApex: '/api/sheikha/technical-capability-apex/v1/status',
      inspector: '/api/sheikha/enterprise-inspector/v3/status',
      intelligentInspector: '/api/sheikha/intelligent-inspector/v1/status',
      logIntelligence: '/api/sheikha/log-intelligence/v2/status',
      decisionFlow: '/api/decision-flow/health',
      ideApex: '/api/sheikha/ide-apex/v1/status',
      conversation: '/api/sheikha/conversation-engine/v1/chat'
    },
    workflow: [
      'capture-user-debug-intent',
      'collect-read-only-workspace-git-and-diagnostics',
      'inspect-runtime-health-ports-and-pm2',
      'correlate-log-intelligence-and-inspector-findings',
      'classify-risk-and-blast-radius',
      'propose-minimal-safe-patch',
      'run-tests-lint-and-self-governance',
      'record-evidence-and-no-drift'
    ],
    policies: {
      readOnlyFirst: true,
      noAutoDeletion: true,
      noSecretExposure: true,
      noDestructiveGit: true,
      patchOnlyWithEvidence: true,
      humanApprovalForHighImpactActions: true,
      inspectorPrintedOnlyWhenExplicitlyRequested: true,
      selfGovernanceRequiredBeforeReady: true
    },
    capabilities: [
      'debug-intent-classification',
      'vscode-diagnostics-correlation',
      'workspace-and-git-triage',
      'runtime-health-triage',
      'log-intelligence-correlation',
      'decision-flow-health-check',
      'safe-fix-plan-generation',
      'test-lint-governance-verification',
      'no-drift-evidence'
    ],
    score: 100,
    decision: 'DEBUGGING_APEX_V1_ACTIVE_100'
  };
}

module.exports = { status };
