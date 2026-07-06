"use strict";

const {
  buildRuntimeRecoveryPlan
} = require("../recovery-engine/sheikha-runtime-recovery-engine");

const {
  buildRuntimeUpgradePlan
} = require("../upgrade-manager/sheikha-runtime-upgrade-manager");

const {
  buildExecutionPlan
} = require("../execution-engine/sheikha-runtime-execution-engine");

const {
  buildUnifiedRuntimeMetrics
} = require("../metrics-engine/sheikha-runtime-metrics-engine");

const HIGH_IMPACT_ACTIONS = Object.freeze([
  "EXECUTE",
  "RECOVER",
  "UPGRADE",
  "RESTART",
  "STOP",
  "DELETE",
  "WRITE",
  "INSTALL",
  "NETWORK_CHANGE"
]);

function evaluatePolicy(action, context = {}) {
  const normalizedAction = String(action || "").trim().toUpperCase();
  const destructive = Boolean(context.destructive);
  const unauthorized = Boolean(context.unauthorized);
  const highImpact = HIGH_IMPACT_ACTIONS.includes(normalizedAction);

  const allowed = !destructive && !unauthorized;

  return {
    action: normalizedAction,
    allowed,
    highImpact,
    humanReviewRequired: highImpact,
    auditRequired: true,
    reason: unauthorized
      ? "UNAUTHORIZED_ACTION_BLOCKED"
      : destructive
        ? "DESTRUCTIVE_ACTION_BLOCKED"
        : "POLICY_ALLOWED_READ_ONLY_OR_GOVERNED_PLAN"
  };
}

function summarizePolicies(policies) {
  const values = Object.values(policies);

  return {
    total: values.length,
    allowed: values.filter((policy) => policy.allowed).length,
    blocked: values.filter((policy) => !policy.allowed).length,
    humanReviewRequired: values.filter((policy) => policy.humanReviewRequired).length,
    auditRequired: values.filter((policy) => policy.auditRequired).length
  };
}

function buildRuntimePolicyReport(options = {}) {
  const execution = buildExecutionPlan(options);
  const recovery = buildRuntimeRecoveryPlan(options);
  const upgrade = buildRuntimeUpgradePlan(options);
  const metrics = buildUnifiedRuntimeMetrics(options);

  const blocked =
    execution.status !== "ACTIVE" ||
    recovery.status !== "ACTIVE" ||
    upgrade.status !== "ACTIVE" ||
    metrics.status !== "ACTIVE";

  const policies = {
    execution: evaluatePolicy("EXECUTE"),
    recovery: evaluatePolicy("RECOVER"),
    upgrade: evaluatePolicy("UPGRADE"),

    restart: evaluatePolicy("RESTART", {
      destructive: true
    }),

    stop: evaluatePolicy("STOP", {
      destructive: true
    }),

    write: evaluatePolicy("WRITE", {
      destructive: true
    }),

    networkChange: evaluatePolicy("NETWORK_CHANGE", {
      destructive: true
    })
  };

  return {
    system: "SHEIKHA_RUNTIME_POLICY_ENGINE",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_POLICY_EVALUATION",

    blocked,
    reason: blocked
      ? "EXECUTION_RECOVERY_UPGRADE_OR_METRICS_NOT_READY"
      : null,

    policies,
    summary: summarizePolicies(policies),

    runtimeHealth: metrics.health,

    readiness: {
      policyEvaluationReady: !blocked,
      governanceValidationReady: true,
      executionGateReady: true,
      recoveryGateReady: true,
      upgradeGateReady: true,
      auditGateReady: true,
      overall: blocked
        ? "RUNTIME_POLICY_ENGINE_BLOCKED"
        : "RUNTIME_POLICY_ENGINE_READY"
    },

    governance: {
      readOnly: true,
      denyByDefaultForDestructiveActions: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      humanReviewBeforeHighImpact: true,
      tawhid: "الله وحده لا شريك له"
    },

    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildRuntimePolicyReport,
  evaluatePolicy,
  summarizePolicies,
  HIGH_IMPACT_ACTIONS
};
