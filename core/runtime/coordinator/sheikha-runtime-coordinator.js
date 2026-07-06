"use strict";

const {
  buildRuntimeStateStore
} = require("../state-store/sheikha-runtime-state-store");

const {
  buildRuntimePolicyReport
} = require("../policy-engine/sheikha-runtime-policy-engine");

const {
  buildRuntimeAuditReport
} = require("../audit-engine/sheikha-runtime-audit-engine");

const {
  buildRuntimeRecoveryPlan
} = require("../recovery-engine/sheikha-runtime-recovery-engine");

const {
  buildRuntimeUpgradePlan
} = require("../upgrade-manager/sheikha-runtime-upgrade-manager");

function buildCoordinationStep(order, name, report, readiness) {
  return {
    order,
    name,
    status: report.status,
    readiness,
    action: report.status === "ACTIVE"
      ? "COORDINATED"
      : "HOLD_AND_REVIEW",
    auditRequired: true,
    timestamp: new Date().toISOString()
  };
}

function buildRuntimeCoordinator(options = {}) {
  const stateStore = buildRuntimeStateStore(options);
  const policy = buildRuntimePolicyReport(options);
  const audit = buildRuntimeAuditReport(options);
  const recovery = buildRuntimeRecoveryPlan(options);
  const upgrade = buildRuntimeUpgradePlan(options);

  const blocked =
    stateStore.status !== "ACTIVE" ||
    policy.status !== "ACTIVE" ||
    audit.status !== "ACTIVE" ||
    recovery.status !== "ACTIVE" ||
    upgrade.status !== "ACTIVE";

  const coordinationPlan = [
    buildCoordinationStep(1, "stateStore", stateStore, stateStore.readiness.overall),
    buildCoordinationStep(2, "policy", policy, policy.readiness.overall),
    buildCoordinationStep(3, "audit", audit, audit.readiness.overall),
    buildCoordinationStep(4, "recovery", recovery, recovery.readiness.overall),
    buildCoordinationStep(5, "upgrade", upgrade, upgrade.readiness.overall)
  ];

  return {
    system: "SHEIKHA_RUNTIME_COORDINATOR",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_RUNTIME_COORDINATION_PLAN",
    blocked,
    reason: blocked
      ? "STATE_POLICY_AUDIT_RECOVERY_OR_UPGRADE_NOT_READY"
      : null,
    coordinationPlan,
    summary: {
      total: coordinationPlan.length,
      coordinated: coordinationPlan.filter((x) => x.action === "COORDINATED").length,
      holdAndReview: coordinationPlan.filter((x) => x.action === "HOLD_AND_REVIEW").length
    },
    runtimeHealth: stateStore.runtimeHealth,
    readiness: {
      coordinatorReady: !blocked,
      stateStoreIntegrationReady: true,
      policyIntegrationReady: true,
      auditIntegrationReady: true,
      recoveryIntegrationReady: true,
      upgradeIntegrationReady: true,
      managerIntegrationReady: true,
      overall: blocked
        ? "RUNTIME_COORDINATOR_BLOCKED"
        : "RUNTIME_COORDINATOR_READY"
    },
    governance: {
      readOnly: true,
      planOnly: true,
      noShellExecution: true,
      noFileMutation: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildRuntimeCoordinator,
  buildCoordinationStep
};
