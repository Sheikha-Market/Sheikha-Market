"use strict";

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

const {
  buildUnifiedRuntimeMetrics
} = require("../metrics-engine/sheikha-runtime-metrics-engine");

function buildStateEntry(name, report, readinessKey = "overall") {
  return {
    name,
    status: report.status,
    readiness: report.readiness?.[readinessKey] || report.readiness?.overall || "UNKNOWN",
    health: report.runtimeHealth || null,
    timestamp: new Date().toISOString()
  };
}

function buildRuntimeStateStore(options = {}) {
  const policy = buildRuntimePolicyReport(options);
  const audit = buildRuntimeAuditReport(options);
  const recovery = buildRuntimeRecoveryPlan(options);
  const upgrade = buildRuntimeUpgradePlan(options);
  const metrics = buildUnifiedRuntimeMetrics(options);

  const states = {
    policy: buildStateEntry("policy", policy),
    audit: buildStateEntry("audit", audit),
    recovery: buildStateEntry("recovery", recovery),
    upgrade: buildStateEntry("upgrade", upgrade),
    metrics: buildStateEntry("metrics", metrics)
  };

  const values = Object.values(states);

  const active = values.filter((entry) => entry.status === "ACTIVE").length;
  const blocked = values.filter((entry) => entry.status === "BLOCKED").length;
  const degraded = values.filter((entry) => entry.status === "DEGRADED").length;

  const healthy = metrics.health?.status === "HEALTHY";

  return {
    system: "SHEIKHA_RUNTIME_STATE_STORE",
    status: blocked === 0 && degraded === 0 ? "ACTIVE" : "DEGRADED",
    mode: "READ_ONLY_RUNTIME_STATE_STORE",
    states,
    summary: {
      total: values.length,
      active,
      blocked,
      degraded,
      healthy
    },
    runtimeHealth: metrics.health,
    readiness: {
      stateStoreReady: true,
      runtimeStateReadable: true,
      managerIntegrationReady: true,
      coordinatorReady: true,
      dashboardFeedReady: true,
      overall: blocked === 0 && degraded === 0
        ? "RUNTIME_STATE_STORE_READY"
        : "RUNTIME_STATE_STORE_DEGRADED"
    },
    governance: {
      readOnly: true,
      noFileMutation: true,
      noShellExecution: true,
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
  buildRuntimeStateStore,
  buildStateEntry
};
