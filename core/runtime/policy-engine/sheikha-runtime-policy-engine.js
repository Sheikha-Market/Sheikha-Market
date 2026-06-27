"use strict";

const { buildRuntimeRecoveryPlan } = require("../recovery-engine/sheikha-runtime-recovery-engine");
const { buildRuntimeUpgradePlan } = require("../upgrade-manager/sheikha-runtime-upgrade-manager");
const { buildExecutionPlan } = require("../execution-engine/sheikha-runtime-execution-engine");
const { buildUnifiedRuntimeMetrics } = require("../metrics-engine/sheikha-runtime-metrics-engine");

function evaluatePolicy(action, context = {}) {
  const highImpactActions = [
    "EXECUTE",
    "RECOVER",
    "UPGRADE",
    "RESTART",
    "STOP",
    "DELETE",
    "WRITE",
    "INSTALL",
    "NETWORK_CHANGE"
  ];

  const isHighImpact = highImpactActions.includes(action);

  return {
    action,
    allowed: !context.destructive && !context.unauthorized,
    highImpact: isHighImpact,
    humanReviewRequired: isHighImpact,
    auditRequired: true,
    reason: context.unauthorized
      ? "UNAUTHORIZED_ACTION_BLOCKED"
      : context.destructive
        ? "DESTRUCTIVE_ACTION_BLOCKED"
        : "POLICY_ALLOWED_READ_ONLY_OR_GOVERNED_PLAN"
  };
}

function buildRuntimePolicyReport(options = {}) {
  const execution = buildExecutionPlan(options);
  const recovery = buildRuntimeRecoveryPlan(options);
  const upgrade = buildRuntimeUpgradePlan(options);
  const metrics = buildUnifiedRuntimeMetrics();

  const blocked =
    execution.status !== "ACTIVE" ||
    recovery.status !== "ACTIVE" ||
    upgrade.status !== "ACTIVE" ||
    metrics.status !== "ACTIVE";

  const policies = {
    execution: evaluatePolicy("EXECUTE", { destructive: false }),
    recovery: evaluatePolicy("RECOVER", { destructive: false }),
    upgrade: evaluatePolicy("UPGRADE", { destructive: false }),
    restart: evaluatePolicy("RESTART", { destructive: true }),
    stop: evaluatePolicy("STOP", { destructive: true }),
    write: evaluatePolicy("WRITE", { destructive: true }),
    networkChange: evaluatePolicy("NETWORK_CHANGE", { destructive: true })
  };

  return {
    system: "SHEIKHA_RUNTIME_POLICY_ENGINE",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_POLICY_EVALUATION",
    blocked,
    reason: blocked ? "EXECUTION_RECOVERY_UPGRADE_OR_METRICS_NOT_READY" : null,
    policies,
    summary: {
      total: Object.keys(policies).length,
      allowed: Object.values(policies).filter((x) => x.allowed).length,
      blocked: Object.values(policies).filter((x) => !x.allowed).length,
      humanReviewRequired: Object.values(policies).filter((x) => x.humanReviewRequired).length,
      auditRequired: Object.values(policies).filter((x) => x.auditRequired).length
    },
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
  evaluatePolicy
};
