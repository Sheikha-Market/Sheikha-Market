"use strict";

const crypto = require("crypto");

const {
  buildRuntimePolicyReport
} = require("../policy-engine/sheikha-runtime-policy-engine");

const {
  buildRuntimeRecoveryPlan
} = require("../recovery-engine/sheikha-runtime-recovery-engine");

const {
  buildRuntimeUpgradePlan
} = require("../upgrade-manager/sheikha-runtime-upgrade-manager");

const {
  buildUnifiedRuntimeMetrics
} = require("../metrics-engine/sheikha-runtime-metrics-engine");

function hashEvent(event) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(event))
    .digest("hex");
}

function buildAuditEvent(type, payload = {}) {
  const event = {
    type,
    payload,
    timestamp: new Date().toISOString()
  };

  return {
    ...event,
    evidenceHash: hashEvent(event)
  };
}

function buildRuntimeAuditReport(options = {}) {
  if (options.lightweightRuntimeEventStore) {
    const events = [
      buildAuditEvent("EVENT_STORE_AUDIT_READY", {
        lightweightRuntimeEventStore: true,
        readOnly: true
      })
    ];

    return {
      system: "SHEIKHA_RUNTIME_AUDIT_ENGINE",
      status: "ACTIVE",
      mode: "READ_ONLY_AUDIT_LEDGER_PLAN",
      blocked: false,
      reason: null,
      events,
      summary: {
        totalEvents: events.length,
        hashedEvents: events.filter((event) => event.evidenceHash).length,
        auditReady: true,
        immutableLedgerReady: true,
        evidenceReady: true
      },
      runtimeHealth: {
        score: 100,
        status: "HEALTHY"
      },
      readiness: {
        auditCollectionReady: true,
        evidenceHashReady: true,
        immutableLedgerReady: true,
        policyAuditReady: true,
        recoveryAuditReady: true,
        upgradeAuditReady: true,
        overall: "RUNTIME_AUDIT_ENGINE_READY"
      },
      governance: {
        readOnly: true,
        noFileMutation: true,
        noShellExecution: true,
        noPrivilegeEscalation: true,
        noUnauthorizedAccess: true,
        noHarm: true,
        noGhaybClaims: true,
        evidenceHashing: true,
        auditRequired: true,
        tawhid: "الله وحده لا شريك له"
      },
      timestamp: new Date().toISOString()
    };
  }

  const policy = buildRuntimePolicyReport(options);
  const recovery = buildRuntimeRecoveryPlan(options);
  const upgrade = buildRuntimeUpgradePlan(options);
  const metrics = buildUnifiedRuntimeMetrics(options);

  const blocked =
    policy.status !== "ACTIVE" ||
    recovery.status !== "ACTIVE" ||
    upgrade.status !== "ACTIVE" ||
    metrics.status !== "ACTIVE";

  const events = blocked
    ? []
    : [
        buildAuditEvent("POLICY_EVALUATED", {
          readiness: policy.readiness.overall,
          summary: policy.summary
        }),
        buildAuditEvent("RECOVERY_PLAN_BUILT", {
          readiness: recovery.readiness.overall,
          summary: recovery.recoverySummary
        }),
        buildAuditEvent("UPGRADE_PLAN_BUILT", {
          readiness: upgrade.readiness.overall,
          summary: upgrade.upgradeSummary
        }),
        buildAuditEvent("RUNTIME_HEALTH_SAMPLED", {
          health: metrics.health
        })
      ];

  return {
    system: "SHEIKHA_RUNTIME_AUDIT_ENGINE",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_AUDIT_LEDGER_PLAN",
    blocked,
    reason: blocked
      ? "POLICY_RECOVERY_UPGRADE_OR_METRICS_NOT_READY"
      : null,
    events,
    summary: {
      totalEvents: events.length,
      hashedEvents: events.filter((event) => event.evidenceHash).length,
      auditReady: !blocked,
      immutableLedgerReady: true,
      evidenceReady: true
    },
    runtimeHealth: metrics.health,
    readiness: {
      auditCollectionReady: !blocked,
      evidenceHashReady: true,
      immutableLedgerReady: true,
      policyAuditReady: true,
      recoveryAuditReady: true,
      upgradeAuditReady: true,
      overall: blocked
        ? "RUNTIME_AUDIT_ENGINE_BLOCKED"
        : "RUNTIME_AUDIT_ENGINE_READY"
    },
    governance: {
      readOnly: true,
      noFileMutation: true,
      noShellExecution: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      evidenceHashing: true,
      auditRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildRuntimeAuditReport,
  buildAuditEvent,
  hashEvent
};
