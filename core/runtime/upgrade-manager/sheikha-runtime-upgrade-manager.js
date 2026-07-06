"use strict";

const { buildRuntimeRecoveryPlan } = require("../recovery-engine/sheikha-runtime-recovery-engine");
const { buildUnifiedRuntimeMetrics } = require("../metrics-engine/sheikha-runtime-metrics-engine");
const { buildLifecyclePlan } = require("../lifecycle-engine/sheikha-runtime-lifecycle-engine");

function buildRuntimeUpgradePlan(options = {}) {
  const recovery = buildRuntimeRecoveryPlan(options);
  const metrics = buildUnifiedRuntimeMetrics();
  const lifecycle = buildLifecyclePlan(options);

  const blocked =
    recovery.status !== "ACTIVE" ||
    metrics.status !== "ACTIVE" ||
    lifecycle.status !== "ACTIVE";

  const upgradePlan = blocked
    ? []
    : lifecycle.lifecyclePlan.map((item) => ({
        id: item.id,
        order: item.order,
        phase: item.phase,
        priority: item.priority,
        currentState: item.currentState,
        targetState: item.targetState,
        compatibilityCheckRequired: true,
        snapshotRequired: item.priority === "CRITICAL" || item.priority === "HIGH",
        rollbackRequired: true,
        rollingUpgradeReady: item.priority !== "CRITICAL",
        humanReviewRequired: item.priority === "CRITICAL",
        upgradeAction: "PLAN_ONLY_GOVERNED_UPGRADE"
      }));

  return {
    system: "SHEIKHA_RUNTIME_UPGRADE_MANAGER",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_UPGRADE_PLAN",
    blocked,
    reason: blocked ? "RECOVERY_METRICS_OR_LIFECYCLE_NOT_READY" : null,
    upgradePlan,
    upgradeSummary: {
      total: upgradePlan.length,
      snapshotsRequired: upgradePlan.filter((x) => x.snapshotRequired).length,
      rollbackReady: upgradePlan.filter((x) => x.rollbackRequired).length,
      rollingUpgradeReady: upgradePlan.filter((x) => x.rollingUpgradeReady).length,
      humanReviewRequired: upgradePlan.filter((x) => x.humanReviewRequired).length
    },
    runtimeHealth: metrics.health,
    readiness: {
      upgradePlanReady: !blocked,
      compatibilityCheckReady: true,
      snapshotBeforeUpgradeReady: true,
      rollbackPolicyReady: true,
      rollingUpgradePolicyReady: true,
      recoveryIntegrationReady: !blocked,
      overall: blocked
        ? "RUNTIME_UPGRADE_BLOCKED"
        : "RUNTIME_UPGRADE_MANAGER_READY"
    },
    governance: {
      readOnly: true,
      planOnly: true,
      noPackageInstall: true,
      noFileMutation: true,
      noShellExecution: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      humanReviewBeforeRealUpgrade: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildRuntimeUpgradePlan
};
