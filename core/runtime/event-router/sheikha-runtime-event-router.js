"use strict";

const crypto = require("crypto");

const {
  buildAuditEvent
} = require("../audit-engine/sheikha-runtime-audit-engine");

const EVENT_SUBSCRIBERS = Object.freeze({
  COMMAND_ROUTED: ["audit", "telemetry", "metrics", "dashboard", "supervisor"],
  COMMAND_BLOCKED: ["audit", "telemetry", "metrics", "dashboard", "security"],
  POLICY_BLOCKED: ["audit", "telemetry", "dashboard", "security"],
  RECOVERY_PLANNED: ["audit", "telemetry", "metrics", "dashboard", "supervisor"],
  UPGRADE_PLANNED: ["audit", "telemetry", "metrics", "dashboard", "supervisor"],
  RUNTIME_HEALTH_SAMPLED: ["telemetry", "metrics", "dashboard"],
  AUDIT_RECORDED: ["audit", "dashboard"]
});

function hashEvent(event) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(event))
    .digest("hex");
}

function createRuntimeEvent(type, payload = {}) {
  const normalizedType = String(type || "").trim().toUpperCase();
  const createdAt = new Date().toISOString();

  const event = {
    type: normalizedType,
    payload,
    createdAt
  };

  return {
    id: `evt-${hashEvent(event).slice(0, 16)}`,
    ...event,
    evidenceHash: hashEvent(event)
  };
}

function buildDeliveries(event, subscribers) {
  return subscribers.map((subscriber, index) => ({
    order: index + 1,
    subscriber,
    eventId: event.id,
    eventType: event.type,
    deliveryMode: "PLAN_ONLY_DELIVERY",
    status: "ROUTED",
    auditRequired: true,
    timestamp: new Date().toISOString()
  }));
}

function routeRuntimeEvent(eventInput, payloadOrOptions = {}, maybeOptions = {}) {
  const hasPayload =
    eventInput &&
    typeof eventInput === "string" &&
    payloadOrOptions &&
    !payloadOrOptions.runtimeOptions;

  const payload = hasPayload ? payloadOrOptions : {};
  const options = hasPayload ? maybeOptions : payloadOrOptions;

  const event = typeof eventInput === "string"
    ? createRuntimeEvent(eventInput, payload)
    : createRuntimeEvent(eventInput.type, eventInput.payload || {});

  const subscribers = EVENT_SUBSCRIBERS[event.type] || ["audit"];
  const deliveries = buildDeliveries(event, subscribers);

  return {
    system: "SHEIKHA_RUNTIME_EVENT_ROUTER",
    status: "ACTIVE",
    mode: "READ_ONLY_EVENT_ROUTING_PLAN",
    blocked: false,
    reason: null,
    event,
    subscribers,
    deliveries,
    auditEvent: buildAuditEvent("EVENT_ROUTED", {
      eventId: event.id,
      eventType: event.type,
      subscriberCount: subscribers.length,
      routed: true
    }),
    readiness: {
      eventRouterReady: true,
      lightweightRoutingReady: true,
      subscriberRoutingReady: true,
      evidenceHashReady: true,
      overall: "RUNTIME_EVENT_ROUTER_READY"
    },
    governance: {
      readOnly: true,
      planOnly: true,
      noShellExecution: true,
      noFileMutation: true,
      noProcessStart: true,
      noProcessStop: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    options: {
      lightweight: Boolean(options.lightweight !== false)
    },
    timestamp: new Date().toISOString()
  };
}

function buildEventRouterReport(options = {}) {
  const probes = [
    routeRuntimeEvent("COMMAND_ROUTED", {
      command: "START_RUNTIME",
      accepted: true
    }, options),
    routeRuntimeEvent("RECOVERY_PLANNED", {}, options),
    routeRuntimeEvent("UPGRADE_PLANNED", {}, options),
    routeRuntimeEvent("RUNTIME_HEALTH_SAMPLED", {}, options)
  ];

  return {
    system: "SHEIKHA_RUNTIME_EVENT_ROUTER_REPORT",
    status: "ACTIVE",
    mode: "READ_ONLY_EVENT_ROUTER_REPORT",
    probes,
    summary: {
      totalEvents: probes.length,
      routedEvents: probes.length,
      totalDeliveries: probes.reduce(
        (sum, probe) => sum + probe.deliveries.length,
        0
      )
    },
    readiness: {
      eventRouterReportReady: true,
      eventRoutingReady: true,
      lightweightReportReady: true,
      overall: "RUNTIME_EVENT_ROUTER_REPORT_READY"
    },
    governance: {
      readOnly: true,
      planOnly: true,
      auditRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  createRuntimeEvent,
  routeRuntimeEvent,
  buildEventRouterReport,
  EVENT_SUBSCRIBERS
};
