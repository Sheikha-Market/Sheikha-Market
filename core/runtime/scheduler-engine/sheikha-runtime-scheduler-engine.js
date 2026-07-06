"use strict";

const {
  buildExecutionPlan
} = require("../execution-engine/sheikha-runtime-execution-engine");

const {
  buildUnifiedRuntimeMetrics
} = require("../metrics-engine/sheikha-runtime-metrics-engine");

function queuePriority(item) {
  if (item.priority === "CRITICAL") return 1;
  if (item.priority === "HIGH") return 2;
  return 3;
}

function buildRuntimeSchedule(options = {}) {
  const execution = buildExecutionPlan(options);
  const metrics = buildUnifiedRuntimeMetrics();

  const blocked =
    execution.status !== "ACTIVE" ||
    execution.readiness.overall !== "RUNTIME_EXECUTION_ENGINE_READY";

  const schedule = blocked
    ? []
    : [...execution.executionPlan]
        .sort((a, b) => {
          const byPriority = queuePriority(a) - queuePriority(b);
          if (byPriority !== 0) return byPriority;
          return a.phase - b.phase;
        })
        .map((item, index) => ({
          order: index + 1,
          phase: item.phase,
          id: item.id,
          lane: item.lane,
          priority: item.priority,
          resourceMode: item.resourceMode,
          timeoutMs: item.timeoutMs,
          retryPolicy: item.retryPolicy,
          scheduleState: "SCHEDULED_PLAN_ONLY"
        }));

  return {
    system: "SHEIKHA_RUNTIME_SCHEDULER_ENGINE",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_RUNTIME_SCHEDULE_PLAN",
    blocked,
    reason: blocked ? "EXECUTION_ENGINE_NOT_READY" : null,
    schedule,
    queues: {
      critical: schedule.filter((item) => item.priority === "CRITICAL").length,
      high: schedule.filter((item) => item.priority === "HIGH").length,
      normal: schedule.filter((item) => item.priority === "NORMAL").length,
      compute: schedule.filter((item) => item.lane === "COMPUTE_LANE").length,
      network: schedule.filter((item) => item.lane === "NETWORK_LANE").length,
      io: schedule.filter((item) => item.lane === "IO_LANE").length,
      governance: schedule.filter((item) => item.lane === "GOVERNANCE_LANE").length,
      boot: schedule.filter((item) => item.lane === "BOOT_LANE").length
    },
    runtimeHealth: metrics.health,
    readiness: {
      prioritySchedulerReady: !blocked,
      queueManagerReady: !blocked,
      timeoutManagerReady: true,
      retryEngineReady: true,
      cancellationManagerReady: true,
      resourceAwareSchedulingReady: true,
      recoveryIntegrationReady: true,
      overall: blocked
        ? "RUNTIME_SCHEDULER_BLOCKED"
        : "RUNTIME_SCHEDULER_READY"
    },
    governance: {
      readOnly: true,
      planOnly: true,
      noProcessStart: true,
      noShellExecution: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      humanReviewBeforeRealScheduling: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildRuntimeSchedule,
  queuePriority
};
