"use strict";

const crypto = require("crypto");

const {
  buildCommandBusReport,
  routeCommand
} = require("../command-bus/sheikha-runtime-command-bus");

const {
  buildRuntimeAuditReport,
  buildAuditEvent
} = require("../audit-engine/sheikha-runtime-audit-engine");

const {
  buildRuntimeConfiguration
} = require("../configuration-engine/sheikha-runtime-configuration-engine");

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

function routeRuntimeEvent(eventInput, options = {}) {
  const commandBus = buildCommandBusReport(options);
  const audit = buildRuntimeAuditReport(options);
  const configuration = buildRuntimeConfiguration(options);

  const event = typeof eventInput === "string"
    ? createRuntimeEvent(eventInput)
    : createRuntimeEvent(eventInput.type, eventInput.payload || {});

  const subscribers = EVENT_SUBSCRIBERS[event.type] || ["audit"];

  const blocked =
    commandBus.status !== "ACTIVE" ||
    audit.status !== "ACTIVE" ||
    configuration.status !== "ACTIVE";

  const deliveries = blocked
    ? []
    : subscribers.map((subscriber, index) => ({
        order: index + 1,
        subscriber,
        eventId: event.id,
        eventType: event.type,
        deliveryMode: "PLAN_ONLY_DELIVERY",
        status: "ROUTED",
        auditRequired: true,
        timestamp: new Date().toISOString()
      }));

  return {
    system: "SHEIKHA_RUNTIME_EVENT_ROUTER",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_EVENT_ROUTING_PLAN",
    blocked,
    reason: blocked
      ? "COMMAND_BUS_AUDIT_OR_CONFIGURATION_NOT_READY"
      : null,
    event,
    subscribers,
    deliveries,
    auditEvent: buildAuditEvent("EVENT_ROUTED", {
      eventId: event.id,
      eventType: event.type,
      subscriberCount: subscribers.length,
      routed: !blocked
    }),
    readiness: {
      eventRouterReady: !blocked,
      commandBusIntegrationReady: commandBus.status === "ACTIVE",
      auditIntegrationReady: audit.status === "ACTIVE",
      configurationIntegrationReady: configuration.status === "ACTIVE",
      subscriberRoutingReady: true,
      evidenceHashReady: true,
      overall: blocked
        ? "RUNTIME_EVENT_ROUTER_BLOCKED"
        : "RUNTIME_EVENT_ROUTER_READY"
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
    timestamp: new Date().toISOString()
  };
}

function buildEventRouterReport(options = {}) {
  const commandProbe = routeCommand("START_RUNTIME", options);

  const probes = [
    routeRuntimeEvent("COMMAND_ROUTED", {
      command: commandProbe.command.command,
      commandId: commandProbe.command.id,
      accepted: commandProbe.routing.accepted
    }, options),
    routeRuntimeEvent("RECOVERY_PLANNED", {}, options),
    routeRuntimeEvent("UPGRADE_PLANNED", {}, options),
    routeRuntimeEvent("RUNTIME_HEALTH_SAMPLED", {}, options)
  ];

  const blocked = probes.some((probe) => probe.status !== "ACTIVE");

  return {
    system: "SHEIKHA_RUNTIME_EVENT_ROUTER_REPORT",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_EVENT_ROUTER_REPORT",
    probes,
    summary: {
      totalEvents: probes.length,
      routedEvents: probes.filter((probe) => probe.status === "ACTIVE").length,
      totalDeliveries: probes.reduce(
        (sum, probe) => sum + probe.deliveries.length,
        0
      )
    },
    readiness: {
      eventRouterReportReady: !blocked,
      eventRoutingReady: probes.every(
        (probe) => probe.readiness.overall === "RUNTIME_EVENT_ROUTER_READY"
      ),
      overall: blocked
        ? "RUNTIME_EVENT_ROUTER_REPORT_BLOCKED"
        : "RUNTIME_EVENT_ROUTER_REPORT_READY"
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
