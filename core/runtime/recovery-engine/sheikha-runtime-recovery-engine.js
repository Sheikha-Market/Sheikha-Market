"use strict";

const {
  superviseRuntime
} = require("../supervisor/sheikha-runtime-supervisor");

const {
  buildRuntimeSchedule
} = require("../scheduler-engine/sheikha-runtime-scheduler-engine");

const {
  buildLifecyclePlan
} = require("../lifecycle-engine/sheikha-runtime-lifecycle-engine");

const {
  buildUnifiedRuntimeMetrics
} = require("../metrics-engine/sheikha-runtime-metrics-engine");

function classifyRecoveryAction(item, health) {
  if (health.status === "HEALTHY") return "NO_ACTION_REQUIRED";
  if (item.priority === "CRITICAL") return "HUMAN_REVIEW_RESTART_PLAN";
  if (item.priority === "HIGH") return "ISOLATE_AND_RETRY_PLAN";
  return "DEFER_AND_MONITOR_PLAN";
}

function buildRuntimeRecoveryPlan(options = {}) {
  const supervisor = superviseRuntime(options);
  const schedule = buildRuntimeSchedule(options);
  const lifecycle = buildLifecyclePlan(options);
  const metrics = buildUnifiedRuntimeMetrics();

  const blocked =
    schedule.status !== "ACTIVE" ||
    lifecycle.status !== "ACTIVE" ||
    supervisor.status !== "ACTIVE";

  const recoveryPlan = blocked
    ? []
    : lifecycle.lifecyclePlan.map((item) => ({
        id: item.id,
        order: item.order,
        phase: item.phase,
        lane: item.lane,
        priority: item.priority,
        currentState: item.currentState,
        targetState: item.targetState,
        health: metrics.health.status,
        recoveryAction: classifyRecoveryAction(item, metrics.health),
        checkpointRequired: item.priority === "CRITICAL" || item.priority === "HIGH",
        rollbackReady: true,
        isolationReady: true,
        auditRequired: true,
        humanReviewRequired: item.priority === "CRITICAL"
      }));

  return {
    system: "SHEIKHA_RUNTIME_RECOVERY_ENGINE",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_RECOVERY_PLAN",
    blocked,
    reason: blocked ? "SCHEDULER_LIFECYCLE_OR_SUPERVISOR_NOT_READY" : null,
    recoveryPlan,
    recoverySummary: {
      total: recoveryPlan.length,
      noAction: recoveryPlan.filter((x) => x.recoveryAction === "NO_ACTION_REQUIRED").length,
      humanReview: recoveryPlan.filter((x) => x.humanReviewRequired).length,
      checkpointRequired: recoveryPlan.filter((x) => x.checkpointRequired).length,
      rollbackReady: recoveryPlan.filter((x) => x.rollbackReady).length,
      isolationReady: recoveryPlan.filter((x) => x.isolationReady).length
    },
    runtimeHealth: metrics.health,
    readiness: {
      recoveryPlanReady: !blocked,
      failureDetectorReady: true,
      checkpointPolicyReady: true,
      rollbackPolicyReady: true,
      isolationPolicyReady: true,
      supervisorIntegrationReady: !blocked,
      metricsIntegrationReady: true,
      overall: blocked
        ? "RUNTIME_RECOVERY_BLOCKED"
        : "RUNTIME_RECOVERY_ENGINE_READY"
    },
    governance: {
      readOnly: true,
      planOnly: true,
      noProcessRestart: true,
      noShellExecution: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      humanReviewBeforeRealRecovery: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildRuntimeRecoveryPlan,
  classifyRecoveryAction
};
