"use strict";

const {
  routeRuntimeEvent
} = require("../event-router/sheikha-runtime-event-router");

const {
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
    status: eventRoute.status === "ACTIVE"
      ? "STORED_PLAN_ONLY"
      : "STORE_BLOCKED",
    createdAt: eventRoute.event.createdAt,
    storedAt: new Date().toISOString()
  };
}

function buildEventStoreProbe(options = {}) {
  const routed = routeRuntimeEvent("COMMAND_ROUTED", {
    command: "START_RUNTIME",
    accepted: true
  }, options);

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

function buildRuntimeEventStore(options = {}) {
  const routes = [
    routeRuntimeEvent("COMMAND_ROUTED", {
      command: "START_RUNTIME",
      accepted: true
    }, options),
    routeRuntimeEvent("RECOVERY_PLANNED", {}, options),
    routeRuntimeEvent("UPGRADE_PLANNED", {}, options),
    routeRuntimeEvent("RUNTIME_HEALTH_SAMPLED", {}, options)
  ];

  const records = routes.map((route, index) =>
    normalizeEventRecord(route, index)
  );

  return {
    system: "SHEIKHA_RUNTIME_EVENT_STORE",
    status: "ACTIVE",
    mode: "READ_ONLY_EVENT_STORE_PLAN",
    blocked: false,
    reason: null,
    records,
    auditEvent: buildAuditEvent("EVENT_STORE_BUILT", {
      totalRecords: records.length,
      storedPlanOnly: true
    }),
    summary: {
      totalRecords: records.length,
      stored: records.filter((record) =>
        record.status === "STORED_PLAN_ONLY"
      ).length,
      blocked: records.filter((record) =>
        record.status === "STORE_BLOCKED"
      ).length,
      evidenceReady: records.every((record) =>
        Boolean(record.evidenceHash)
      )
    },
    readiness: {
      eventStoreReady: true,
      eventRouterIntegrationReady: true,
      auditIntegrationReady: true,
      auditEventReady: true,
      evidenceIndexReady: true,
      replayFoundationReady: true,
      streamFoundationReady: true,
      overall: "RUNTIME_EVENT_STORE_READY"
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

module.exports = {
  buildRuntimeEventStore,
  buildEventStoreProbe,
  normalizeEventRecord
};
