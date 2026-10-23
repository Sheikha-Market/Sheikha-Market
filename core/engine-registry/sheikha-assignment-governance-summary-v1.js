'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-assignment-governance-summary-v1.json'
);

const {
  buildMasterRegistry,
} = require('./sheikha-master-engine-registry-v1');
const {
  buildEngineIntegrations,
} = require('./sheikha-engine-integration-fabric-v1');
const {
  buildAuthorityCapabilityMatrix,
} = require('./sheikha-connector-authority-capability-matrix-v1');
const {
  buildConnectorIdentityEvidenceBinding,
} = require('./sheikha-connector-identity-evidence-binding-v1');
const {
  buildPromotionGateStatus,
} = require('./sheikha-connector-authorization-promotion-gate-v1');
const {
  projectApprovedEvidenceLedger,
  queueStatus,
} = require('./sheikha-connector-evidence-intake-review-v1');
const {
  buildReviewerAuthorityRegistry,
} = require('./sheikha-reviewer-authority-registry-v1');
const {
  proposalGateStatus,
} = require('./sheikha-reviewer-assignment-proposal-gate-v1');
const {
  buildManualCommitGateStatus,
} = require('./sheikha-reviewer-assignment-manual-commit-gate-v1');
const {
  buildWritePlanStatus,
} = require('./sheikha-reviewer-assignment-write-plan-v1');
const {
  buildAuditDriftGuardStatus,
} = require('./sheikha-reviewer-assignment-audit-drift-guard-v1');
const {
  buildRecoveryPlan,
} = require('./sheikha-reviewer-assignment-recovery-reconciliation-v1');
const {
  buildRegistry,
} = require('../site-registry/sheikha-engine-domain-registry-v3');
const {
  inspectEngineRuntime,
} = require('../site-registry/sheikha-engine-domain-health-v3');

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function stage({
  id,
  labelAr,
  systemStatus,
  workflowState,
  evidence,
  blockers = [],
  nextAllowedAction,
}) {
  return {
    id,
    labelAr,
    systemStatus,
    workflowState,
    evidence,
    blockers,
    nextAllowedAction,
  };
}

function deriveWorkflow(master, health, integration, authority, identity,
  promotion, evidenceQueue, approvedLedger, reviewerAuthority,
  proposalGate, manualCommit, writePlan, auditDrift, recovery) {
  const hardSystemFailures = [
    master.status !== 'CLEAR',
    health.status !== 'CLEAR',
    integration.status !== 'CLEAR',
    authority.status !== 'CLEAR',
    identity.status !== 'CLEAR',
    promotion.status !== 'CLEAR',
    reviewerAuthority.status !== 'CLEAR',
    proposalGate.status !== 'CLEAR',
    manualCommit.status !== 'CLEAR',
    writePlan.status !== 'CLEAR',
    auditDrift.status !== 'CLEAR',
    recovery.status !== 'CLEAR',
  ].some(Boolean);

  if (hardSystemFailures) {
    return {
      workflowState: 'SYSTEM_REVIEW_REQUIRED',
      nextAllowedAction: 'REVIEW_FAILED_GOVERNANCE_STAGE',
    };
  }

  if (auditDrift.summary.driftDetected > 0) {
    return {
      workflowState: 'ASSIGNMENT_DRIFT_RECONCILIATION_REQUIRED',
      nextAllowedAction: 'INSPECT_RECOVERY_RECONCILIATION_PLAN',
    };
  }

  if (reviewerAuthority.summary.assignments === 0) {
    return {
      workflowState: 'AWAITING_REVIEWER_ASSIGNMENT',
      nextAllowedAction:
        'PROPOSE_REVIEWER_ASSIGNMENT_PREVIEW_AFTER_EXPLICIT_IDENTITY_AND_ROLE_INPUT',
    };
  }

  if (evidenceQueue.summary.records === 0) {
    return {
      workflowState: 'AWAITING_EVIDENCE_INTAKE',
      nextAllowedAction: 'PREPARE_EVIDENCE_INTAKE_PREVIEW',
    };
  }

  if (approvedLedger.records.length === 0) {
    return {
      workflowState: 'AWAITING_HUMAN_EVIDENCE_REVIEW',
      nextAllowedAction: 'REVIEW_EVIDENCE_WITH_AUTHORIZED_REVIEWER',
    };
  }

  if (promotion.summary.eligible === 0) {
    return {
      workflowState: 'AUTHORIZATION_REVIEW_GAPS_REMAIN',
      nextAllowedAction: 'INSPECT_AUTHORIZATION_PROMOTION_GAPS',
    };
  }

  return {
    workflowState: 'HUMAN_AUTHORIZATION_REVIEW_READY',
    nextAllowedAction: 'HUMAN_AUTHORIZATION_REVIEW_ONLY',
  };
}

function buildAssignmentGovernanceSummary() {
  const config = readConfig();
  const siteRegistry = buildRegistry();
  const master = buildMasterRegistry();
  const health = inspectEngineRuntime(siteRegistry);
  const integration = buildEngineIntegrations();
  const authority = buildAuthorityCapabilityMatrix();
  const identity = buildConnectorIdentityEvidenceBinding();
  const promotion = buildPromotionGateStatus();
  const evidenceQueue = queueStatus();
  const approvedLedger = projectApprovedEvidenceLedger();
  const reviewerAuthority = buildReviewerAuthorityRegistry();
  const proposalGate = proposalGateStatus();
  const manualCommit = buildManualCommitGateStatus();
  const writePlan = buildWritePlanStatus();
  const auditDrift = buildAuditDriftGuardStatus();
  const recovery = buildRecoveryPlan();

  const stages = [
    stage({
      id: 'MASTER_ENGINE_REGISTRY',
      labelAr: 'سجل المحركات الرئيسي',
      systemStatus: master.status,
      workflowState: master.status === 'CLEAR' ? 'READY' : 'REVIEW_REQUIRED',
      evidence: {
        coreEngines: master.summary.coreEngines,
        optionalEngines: master.summary.optionalEngines,
        runtimeMissingFromMaster: master.summary.runtimeMissingFromMaster,
        criticalMissingFiles: master.summary.criticalMissingFiles,
      },
      blockers: master.status === 'CLEAR' ? [] : ['MASTER_ENGINE_REGISTRY_GAPS'],
      nextAllowedAction:
        master.status === 'CLEAR'
          ? 'READ_ONLY_CONTINUE_TO_ENGINE_HEALTH'
          : 'REVIEW_MASTER_ENGINE_FINDINGS',
    }),
    stage({
      id: 'ENGINE_HEALTH',
      labelAr: 'صحة المحركات والتوجيه',
      systemStatus: health.status,
      workflowState:
        health.status === 'CLEAR' ? 'READY' : 'REVIEW_REQUIRED',
      evidence: {
        referencedEngines: health.summary.referencedEngines,
        unresolvedReferencedEngines:
          health.summary.unresolvedReferencedEngines,
        routeIntentConflicts: health.summary.routeIntentConflicts,
        missingFromMasterRegistry:
          health.summary.missingFromMasterRegistry,
      },
      blockers: [
        ...(health.summary.unresolvedReferencedEngines > 0
          ? ['UNRESOLVED_ENGINES']
          : []),
        ...(health.summary.routeIntentConflicts > 0
          ? ['ROUTE_INTENT_CONFLICTS']
          : []),
      ],
      nextAllowedAction:
        health.status === 'CLEAR'
          ? 'READ_ONLY_CONTINUE_TO_INTEGRATION'
          : 'REVIEW_ENGINE_HEALTH_FINDINGS',
    }),
    stage({
      id: 'INTEGRATION_FABRIC',
      labelAr: 'تكامل المحركات والموصلات',
      systemStatus: integration.status,
      workflowState: 'READINESS_ONLY',
      evidence: {
        engines: integration.summary.engines,
        mcpContractReady: integration.summary.mcpContractReady,
        sdkContractReady: integration.summary.sdkContractReady,
        connectorProfiles: integration.summary.connectorProfiles,
        liveExternalConnections:
          integration.summary.liveExternalConnections,
      },
      blockers:
        integration.summary.liveExternalConnections === 0
          ? ['NO_LIVE_EXTERNAL_CONNECTION_EVIDENCE']
          : [],
      nextAllowedAction: 'READ_ONLY_INSPECT_CONNECTOR_READINESS',
    }),
    stage({
      id: 'AUTHORITY_MATRIX',
      labelAr: 'مصفوفة الصلاحيات والقدرات',
      systemStatus: authority.status,
      workflowState: 'DEFAULT_DENY',
      evidence: {
        connectorCapabilityRecords:
          authority.summary.connectorCapabilityRecords,
        liveExternalReads: authority.summary.liveExternalReads,
        externalMutationsAuthorized:
          authority.summary.externalMutationsAuthorized,
      },
      blockers:
        authority.summary.externalMutationsAuthorized === 0
          ? ['NO_EXTERNAL_MUTATION_AUTHORITY']
          : [],
      nextAllowedAction: 'READ_ONLY_INSPECT_CAPABILITY_BOUNDARIES',
    }),
    stage({
      id: 'IDENTITY_EVIDENCE_BINDING',
      labelAr: 'هوية وأدلة الموصلات',
      systemStatus: identity.status,
      workflowState: 'EVIDENCE_INCOMPLETE',
      evidence: {
        bindings: identity.summary.bindings,
        identitiesBound: identity.summary.identitiesBound,
        ownerIdentitiesAssigned:
          identity.summary.ownerIdentitiesAssigned,
        authorized: identity.summary.authorized,
        liveVerified: identity.summary.liveVerified,
      },
      blockers: [
        ...(identity.summary.ownerIdentitiesAssigned === 0
          ? ['NO_OWNER_IDENTITIES_ASSIGNED']
          : []),
        ...(identity.summary.missingAuthorizationEvidence > 0
          ? ['AUTHORIZATION_EVIDENCE_MISSING']
          : []),
      ],
      nextAllowedAction: 'READ_ONLY_INSPECT_IDENTITY_EVIDENCE_GAPS',
    }),
    stage({
      id: 'AUTHORIZATION_PROMOTION_GATE',
      labelAr: 'بوابة ترقية التفويض',
      systemStatus: promotion.status,
      workflowState:
        promotion.summary.eligible > 0
          ? 'HUMAN_REVIEW_ELIGIBLE'
          : 'REVIEW_REQUIRED',
      evidence: {
        connectorsEvaluated: promotion.summary.connectorsEvaluated,
        review: promotion.summary.review,
        eligible: promotion.summary.eligible,
        authorizationsGranted:
          promotion.summary.authorizationsGranted,
      },
      blockers:
        promotion.summary.eligible === 0
          ? ['NO_CONNECTOR_ELIGIBLE_FOR_HUMAN_AUTHORIZATION_REVIEW']
          : [],
      nextAllowedAction:
        promotion.summary.eligible > 0
          ? 'HUMAN_AUTHORIZATION_REVIEW_ONLY'
          : 'COMPLETE_EVIDENCE_AND_REVIEWER_REQUIREMENTS',
    }),
    stage({
      id: 'EVIDENCE_INTAKE_REVIEW',
      labelAr: 'إدخال ومراجعة الأدلة',
      systemStatus: evidenceQueue.status,
      workflowState:
        evidenceQueue.summary.records > 0
          ? 'QUEUE_ACTIVE'
          : 'EMPTY_QUEUE',
      evidence: {
        records: evidenceQueue.summary.records,
        pending: evidenceQueue.summary.pending,
        verifiedApproved: evidenceQueue.summary.verifiedApproved,
        approvedLedgerRecords: approvedLedger.records.length,
      },
      blockers:
        evidenceQueue.summary.records === 0
          ? ['NO_EVIDENCE_CANDIDATES_IN_QUEUE']
          : [],
      nextAllowedAction:
        evidenceQueue.summary.records === 0
          ? 'PREPARE_EVIDENCE_INTAKE_PREVIEW'
          : 'HUMAN_REVIEW_PENDING_EVIDENCE',
    }),
    stage({
      id: 'REVIEWER_AUTHORITY_REGISTRY',
      labelAr: 'سجل صلاحيات المراجعين',
      systemStatus: reviewerAuthority.status,
      workflowState:
        reviewerAuthority.summary.assignments > 0
          ? 'REVIEWERS_ASSIGNED'
          : 'NO_ASSIGNMENTS',
      evidence: {
        authorityRoles: reviewerAuthority.summary.authorityRoles,
        assignments: reviewerAuthority.summary.assignments,
        invalidAssignments: reviewerAuthority.summary.invalidAssignments,
      },
      blockers:
        reviewerAuthority.summary.assignments === 0
          ? ['NO_REVIEWER_ASSIGNMENTS']
          : [],
      nextAllowedAction:
        reviewerAuthority.summary.assignments === 0
          ? 'PROPOSE_REVIEWER_ASSIGNMENT_PREVIEW'
          : 'USE_ASSIGNED_REVIEWER_WITH_SCOPE_CHECK',
    }),
    stage({
      id: 'REVIEWER_ASSIGNMENT_PROPOSAL_GATE',
      labelAr: 'بوابة اقتراح تعيين المراجعين',
      systemStatus: proposalGate.status,
      workflowState:
        proposalGate.summary.proposals > 0
          ? 'PROPOSALS_PRESENT'
          : 'NO_PROPOSALS',
      evidence: {
        proposals: proposalGate.summary.proposals,
        ratifications: proposalGate.summary.ratifications,
        approvedAssignmentPreviews:
          proposalGate.summary.approvedAssignmentPreviews,
        assignmentsCreatedByGate:
          proposalGate.summary.assignmentsCreatedByGate,
      },
      blockers:
        proposalGate.summary.proposals === 0
          ? ['NO_REVIEWER_ASSIGNMENT_PROPOSALS']
          : [],
      nextAllowedAction:
        'PROPOSAL_PREVIEW_ONLY_UNTIL_EXPLICIT_HUMAN_RATIFICATION',
    }),
    stage({
      id: 'MANUAL_ASSIGNMENT_COMMIT_GATE',
      labelAr: 'بوابة الكتابة اليدوية للتعيين',
      systemStatus: manualCommit.status,
      workflowState: 'CLOSED_DEFAULT_DENY',
      evidence: {
        assignmentRecords: manualCommit.summary.assignmentRecords,
        proposalRecords: manualCommit.summary.proposalRecords,
        ratificationRecords: manualCommit.summary.ratificationRecords,
        assignmentsWrittenByGate:
          manualCommit.summary.assignmentsWrittenByGate,
        currentRegistrySha256: manualCommit.currentRegistry.sha256,
      },
      blockers:
        manualCommit.summary.proposalRecords === 0
          ? ['NO_PERSISTED_PROPOSAL_AND_RATIFICATION']
          : [],
      nextAllowedAction:
        'EVALUATE_MANUAL_COMMIT_ONLY_AFTER_PERSISTED_HUMAN_RATIFICATION',
    }),
    stage({
      id: 'REVIEWER_ASSIGNMENT_WRITE_PLAN',
      labelAr: 'خطة كتابة تعيين المراجع',
      systemStatus: writePlan.status,
      workflowState: 'PREVIEW_ONLY',
      evidence: {
        assignmentRecords: writePlan.summary.assignmentRecords,
        persistedPlans: writePlan.summary.persistedPlans,
        writesPerformedByPlanner:
          writePlan.summary.writesPerformedByPlanner,
      },
      blockers:
        writePlan.summary.persistedPlans === 0
          ? ['NO_ELIGIBLE_WRITE_PLAN']
          : [],
      nextAllowedAction:
        'GENERATE_DETERMINISTIC_PATCH_PREVIEW_ONLY_WHEN_COMMIT_GATE_ELIGIBLE',
    }),
    stage({
      id: 'ASSIGNMENT_AUDIT_DRIFT_GUARD',
      labelAr: 'تدقيق وانحراف سجل التعيين',
      systemStatus: auditDrift.status,
      workflowState:
        auditDrift.summary.driftDetected === 0
          ? 'NO_DRIFT'
          : 'DRIFT_DETECTED',
      evidence: {
        auditRecords: auditDrift.summary.auditRecords,
        driftDetected: auditDrift.summary.driftDetected,
        auditChainBreaks: auditDrift.summary.auditChainBreaks,
        auditEvidenceGaps: auditDrift.summary.auditEvidenceGaps,
      },
      blockers:
        auditDrift.summary.driftDetected > 0
          ? ['ASSIGNMENT_REGISTRY_DRIFT']
          : [],
      nextAllowedAction:
        auditDrift.summary.driftDetected > 0
          ? 'INSPECT_RECOVERY_RECONCILIATION_PLAN'
          : 'READ_ONLY_MONITOR_ASSIGNMENT_REGISTRY',
    }),
    stage({
      id: 'RECOVERY_RECONCILIATION_PLAN',
      labelAr: 'خطة الاستعادة والمصالحة',
      systemStatus: recovery.status,
      workflowState:
        recovery.summary.driftDetected > 0
          ? 'RECONCILIATION_REQUIRED'
          : 'STANDBY_CLEAR',
      evidence: {
        driftDetected: recovery.summary.driftDetected,
        proposedActions: recovery.summary.proposedActions,
        automaticRepairsPerformed:
          recovery.summary.automaticRepairsPerformed,
        automaticRollbacksPerformed:
          recovery.summary.automaticRollbacksPerformed,
        baselineRefreshesPerformed:
          recovery.summary.baselineRefreshesPerformed,
      },
      blockers:
        recovery.summary.driftDetected > 0
          ? ['HUMAN_RECONCILIATION_DECISION_REQUIRED']
          : [],
      nextAllowedAction:
        recovery.summary.driftDetected > 0
          ? 'HUMAN_RECONCILIATION_REVIEW_ONLY'
          : 'NO_RECOVERY_ACTION_REQUIRED',
    }),
  ];

  const workflow = deriveWorkflow(
    master,
    health,
    integration,
    authority,
    identity,
    promotion,
    evidenceQueue,
    approvedLedger,
    reviewerAuthority,
    proposalGate,
    manualCommit,
    writePlan,
    auditDrift,
    recovery
  );

  const blockers = stages
    .flatMap((item) => item.blockers.map((blocker) => ({
      stage: item.id,
      blocker,
    })));

  const systemStatus = stages.every(
    (item) => item.systemStatus === 'CLEAR'
  )
    ? 'CLEAR'
    : 'REVIEW_REQUIRED';

  return {
    system: config.system,
    version: config.version,
    status: systemStatus,
    mode: config.mode,
    governance: config.governance,
    workflowState: workflow.workflowState,
    nextAllowedAction: workflow.nextAllowedAction,
    summary: {
      stages: stages.length,
      clearSystemStages: stages.filter(
        (item) => item.systemStatus === 'CLEAR'
      ).length,
      stagesWithBlockers: stages.filter(
        (item) => item.blockers.length > 0
      ).length,
      blockerCount: blockers.length,
      activeReviewerAssignments:
        reviewerAuthority.summary.assignments,
      authorizedConnectors: identity.summary.authorized,
      liveVerifiedConnectors: identity.summary.liveVerified,
      assignmentDriftDetected:
        auditDrift.summary.driftDetected,
      automaticMutationsPerformed:
        manualCommit.summary.assignmentsWrittenByGate +
        writePlan.summary.writesPerformedByPlanner +
        recovery.summary.automaticRepairsPerformed +
        recovery.summary.automaticRollbacksPerformed +
        recovery.summary.baselineRefreshesPerformed,
    },
    blockers,
    stages,
  };
}

module.exports = {
  buildAssignmentGovernanceSummary,
};
