"use strict";

const {
  buildEventRouterReport,
  routeRuntimeEvent
} = require("../event-router/sheikha-runtime-event-router");

const {
  buildRuntimeAuditReport,
  buildAuditEvent
} = require("../audit-engine/sheikha-runtime-audit-engine");

function normalizeEventRecord(eventRoute, index = 0) {
  return {
    sequence: index + 1,
    eventId: eventRoute.event.id,
    eventType: eventRoute.event.type,
    evidenceHash: eventRoute.event.evidenceHash,
    subscriberCount: eventRoute.subscribers.length,
    deliveryCount: eventRoute.deliveries.length,
    status: eventRoute.status === "ACTIVE" ? "STORED_PLAN_ONLY" : "STORE_BLOCKED",
    createdAt: eventRoute.event.createdAt,
    storedAt: new Date().toISOString()
  };
}

function buildRuntimeEventStore(options = {}) {
  const storeOptions = {
    ...options,
    lightweightRuntimeEventStore: true
  };
  const router = buildEventRouterReport(storeOptions);
  const audit = buildRuntimeAuditReport(storeOptions);

  const blocked =
    router.status !== "ACTIVE" ||
    audit.status !== "ACTIVE";

  const records = blocked
    ? []
    : router.probes.map((probe, index) => normalizeEventRecord(probe, index));

  return {
    system: "SHEIKHA_RUNTIME_EVENT_STORE",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_EVENT_STORE_PLAN",
    blocked,
    reason: blocked ? "EVENT_ROUTER_OR_AUDIT_NOT_READY" : null,
    records,
    auditEvent: buildAuditEvent("EVENT_STORE_BUILT", {
      totalRecords: records.length,
      storedPlanOnly: true
    }),
    summary: {
      totalRecords: records.length,
      stored: records.filter((record) => record.status === "STORED_PLAN_ONLY").length,
      blocked: records.filter((record) => record.status === "STORE_BLOCKED").length,
      evidenceReady: records.every((record) => Boolean(record.evidenceHash))
    },
    readiness: {
      eventStoreReady: !blocked,
      eventRouterIntegrationReady: router.status === "ACTIVE",
      auditIntegrationReady: audit.status === "ACTIVE",
      evidenceIndexReady: true,
      replayFoundationReady: true,
      streamFoundationReady: true,
      overall: blocked
        ? "RUNTIME_EVENT_STORE_BLOCKED"
        : "RUNTIME_EVENT_STORE_READY"
    },
    governance: {
      readOnly: true,
      planOnly: true,
      noFileMutation: true,
      noDatabaseWrite: true,
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

function buildEventStoreProbe(options = {}) {
  const storeOptions = {
    ...options,
    lightweightRuntimeEventStore: true
  };
  const routed = routeRuntimeEvent("COMMAND_ROUTED", {
    command: "START_RUNTIME",
    accepted: true
  }, storeOptions);

  return {
    system: "SHEIKHA_RUNTIME_EVENT_STORE_PROBE",
    status: routed.status === "ACTIVE" ? "ACTIVE" : "BLOCKED",
    record: normalizeEventRecord(routed, 0),
    readiness: {
      eventStoreProbeReady: routed.status === "ACTIVE",
      overall: routed.status === "ACTIVE"
        ? "RUNTIME_EVENT_STORE_PROBE_READY"
        : "RUNTIME_EVENT_STORE_PROBE_BLOCKED"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildRuntimeEventStore,
  buildEventStoreProbe,
  normalizeEventRecord
};
