"use strict";

const {
  buildRuntimeSchedule
} = require("../scheduler-engine/sheikha-runtime-scheduler-engine");

const {
  buildUnifiedRuntimeMetrics
} = require("../metrics-engine/sheikha-runtime-metrics-engine");

const LIFECYCLE_STATES = [
  "DISCOVERED",
  "REGISTERED",
  "VERIFIED",
  "LOADED",
  "INITIALIZED",
  "READY",
  "RUNNING",
  "PAUSED",
  "STOPPING",
  "STOPPED",
  "UNLOADED"
];

const VALID_TRANSITIONS = {
  DISCOVERED: ["REGISTERED"],
  REGISTERED: ["VERIFIED"],
  VERIFIED: ["LOADED"],
  LOADED: ["INITIALIZED"],
  INITIALIZED: ["READY"],
  READY: ["RUNNING", "STOPPING"],
  RUNNING: ["PAUSED", "STOPPING"],
  PAUSED: ["RUNNING", "STOPPING"],
  STOPPING: ["STOPPED"],
  STOPPED: ["UNLOADED", "READY"],
  UNLOADED: ["LOADED"]
};

function canTransition(from, to) {
  return Boolean(VALID_TRANSITIONS[from]?.includes(to));
}

function buildLifecyclePlan(options = {}) {
  const schedule = buildRuntimeSchedule(options);
  const metrics = buildUnifiedRuntimeMetrics();

  const blocked =
    schedule.status !== "ACTIVE" ||
    schedule.readiness.overall !== "RUNTIME_SCHEDULER_READY";

  const lifecyclePlan = blocked
    ? []
    : schedule.schedule.map((item) => ({
        id: item.id,
        order: item.order,
        phase: item.phase,
        lane: item.lane,
        priority: item.priority,
        currentState: "DISCOVERED",
        targetState: "READY",
        transitionPath: [
          "DISCOVERED",
          "REGISTERED",
          "VERIFIED",
          "LOADED",
          "INITIALIZED",
          "READY"
        ],
        allowedToRun: item.priority === "CRITICAL" || metrics.health.status === "HEALTHY",
        supervisionRequired: true,
        telemetryRequired: true,
        auditRequired: true
      }));

  return {
    system: "SHEIKHA_RUNTIME_LIFECYCLE_ENGINE",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_LIFECYCLE_PLAN",
    blocked,
    reason: blocked ? "SCHEDULER_NOT_READY" : null,
    states: LIFECYCLE_STATES,
    validTransitions: VALID_TRANSITIONS,
    lifecyclePlan,
    runtimeHealth: metrics.health,
    readiness: {
      lifecyclePlanReady: !blocked,
      stateMachineReady: true,
      transitionValidationReady: true,
      supervisorIntegrationReady: true,
      telemetryIntegrationReady: true,
      recoveryIntegrationReady: true,
      overall: blocked
        ? "RUNTIME_LIFECYCLE_BLOCKED"
        : "RUNTIME_LIFECYCLE_ENGINE_READY"
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
      humanReviewBeforeStateChangingExecution: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildLifecyclePlan,
  canTransition,
  LIFECYCLE_STATES,
  VALID_TRANSITIONS
};
