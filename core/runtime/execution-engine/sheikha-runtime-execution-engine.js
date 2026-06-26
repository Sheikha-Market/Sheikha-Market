"use strict";

const {
  buildBootSequence
} = require("../boot-sequencer/sheikha-runtime-boot-sequencer");

const {
  buildDependencyGraph
} = require("../dependency-graph/sheikha-runtime-dependency-graph");

const {
  buildUnifiedRuntimeMetrics
} = require("../metrics-engine/sheikha-runtime-metrics-engine");

function classifyExecutionLane(phaseId) {
  if (phaseId === "ai" || phaseId === "graph") return "COMPUTE_LANE";
  if (phaseId === "api" || phaseId === "networking") return "NETWORK_LANE";
  if (phaseId === "storage") return "IO_LANE";
  if (phaseId === "security" || phaseId === "governance") return "GOVERNANCE_LANE";
  if (phaseId === "boot" || phaseId === "kernel") return "BOOT_LANE";
  return "GENERAL_RUNTIME_LANE";
}

function buildExecutionPlan(options = {}) {
  const boot = buildBootSequence(options);
  const graph = buildDependencyGraph(options);
  const metrics = buildUnifiedRuntimeMetrics();

  const blocked =
    boot.status !== "ACTIVE" ||
    boot.cycleDetected === true ||
    graph.readiness.missingDependencies > 0;

  const executionPlan = blocked
    ? []
    : boot.sequence.map((phase) => ({
        phase: phase.phase,
        id: phase.id,
        lane: classifyExecutionLane(phase.id),
        action: "PLAN_ONLY_READY_FOR_GOVERNED_EXECUTION",
        activeCount: phase.activeCount,
        totalCount: phase.count,
        priority:
          phase.id === "boot" || phase.id === "kernel"
            ? "CRITICAL"
            : phase.id === "governance" || phase.id === "security"
              ? "HIGH"
              : "NORMAL",
        resourceMode:
          phase.id === "ai" || phase.id === "graph"
            ? "CPU_WITH_OPTIONAL_GPU"
            : "CPU_SAFE_DEFAULT",
        timeoutMs: 30000,
        retryPolicy: {
          enabled: true,
          maxRetries: 1,
          backoffMs: 1000
        }
      }));

  return {
    system: "SHEIKHA_RUNTIME_EXECUTION_ENGINE",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_EXECUTION_PLAN",
    blocked,
    reason: blocked
      ? "BOOT_SEQUENCE_OR_DEPENDENCY_GRAPH_NOT_READY"
      : null,
    executionPlan,
    queues: {
      boot: executionPlan.filter((item) => item.lane === "BOOT_LANE").length,
      governance: executionPlan.filter((item) => item.lane === "GOVERNANCE_LANE").length,
      compute: executionPlan.filter((item) => item.lane === "COMPUTE_LANE").length,
      network: executionPlan.filter((item) => item.lane === "NETWORK_LANE").length,
      io: executionPlan.filter((item) => item.lane === "IO_LANE").length,
      general: executionPlan.filter((item) => item.lane === "GENERAL_RUNTIME_LANE").length
    },
    runtimeHealth: metrics.health,
    readiness: {
      executionPlanReady: !blocked,
      queuesReady: !blocked,
      retryPolicyReady: true,
      timeoutPolicyReady: true,
      cancellationPolicyReady: true,
      schedulerReady: true,
      recoveryReady: true,
      overall: blocked
        ? "RUNTIME_EXECUTION_BLOCKED"
        : "RUNTIME_EXECUTION_ENGINE_READY"
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
      humanReviewBeforeRealExecution: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildExecutionPlan,
  classifyExecutionLane
};
