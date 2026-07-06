"use strict";

const crypto = require("crypto");

const {
  buildRuntimePolicyReport,
  evaluatePolicy
} = require("../policy-engine/sheikha-runtime-policy-engine");

const {
  buildRuntimeCoordinator
} = require("../coordinator/sheikha-runtime-coordinator");

const {
  buildRuntimeAuditReport,
  buildAuditEvent
} = require("../audit-engine/sheikha-runtime-audit-engine");

const {
  buildRuntimeConfiguration
} = require("../configuration-engine/sheikha-runtime-configuration-engine");

const COMMAND_POLICY_MAP = Object.freeze({
  START_RUNTIME: "EXECUTE",
  STOP_RUNTIME: "STOP",
  RESTART_RUNTIME: "RESTART",
  RECOVER_RUNTIME: "RECOVER",
  UPGRADE_RUNTIME: "UPGRADE",
  WRITE_RUNTIME: "WRITE",
  NETWORK_CHANGE: "NETWORK_CHANGE"
});

function createCommand(command, target = "runtime-manager", payload = {}) {
  const normalizedCommand = String(command || "").trim().toUpperCase();
  const createdAt = new Date().toISOString();

  const base = {
    command: normalizedCommand,
    target,
    payload,
    createdAt,
    status: "QUEUED"
  };

  return {
    id: `cmd-${crypto
      .createHash("sha256")
      .update(JSON.stringify(base))
      .digest("hex")
      .slice(0, 16)}`,
    ...base
  };
}

function routeCommand(commandInput, options = {}) {
  const policy = buildRuntimePolicyReport(options);
  const coordinator = buildRuntimeCoordinator(options);
  const audit = buildRuntimeAuditReport(options);
  const configuration = buildRuntimeConfiguration(options);

  const command = typeof commandInput === "string"
    ? createCommand(commandInput)
    : createCommand(
        commandInput.command,
        commandInput.target || "runtime-manager",
        commandInput.payload || {}
      );

  const policyAction = COMMAND_POLICY_MAP[command.command] || "EXECUTE";

  const destructive = [
    "STOP_RUNTIME",
    "RESTART_RUNTIME",
    "WRITE_RUNTIME",
    "NETWORK_CHANGE"
  ].includes(command.command);

  const policyDecision = evaluatePolicy(policyAction, {
    destructive,
    unauthorized: false
  });

  const blocked =
    policy.status !== "ACTIVE" ||
    coordinator.status !== "ACTIVE" ||
    audit.status !== "ACTIVE" ||
    configuration.status !== "ACTIVE";

  const accepted = !blocked && policyDecision.allowed;

  const routedCommand = {
    ...command,
    status: accepted ? "ROUTED_PLAN_ONLY" : "BLOCKED",
    policyAction,
    policyDecision,
    coordinatorReady: coordinator.status === "ACTIVE",
    auditEvent: buildAuditEvent("COMMAND_ROUTED", {
      command: command.command,
      target: command.target,
      accepted,
      policyAction,
      reason: policyDecision.reason
    })
  };

  return {
    system: "SHEIKHA_RUNTIME_COMMAND_BUS",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_COMMAND_ROUTING_PLAN",
    blocked,
    reason: blocked
      ? "POLICY_COORDINATOR_AUDIT_OR_CONFIGURATION_NOT_READY"
      : null,
    command: routedCommand,
    routing: {
      accepted,
      target: command.target,
      policyAction,
      coordinatorReadiness: coordinator.readiness.overall,
      configurationReadiness: configuration.readiness.overall
    },
    readiness: {
      commandBusReady: !blocked,
      policyGateReady: policy.status === "ACTIVE",
      coordinatorGateReady: coordinator.status === "ACTIVE",
      auditGateReady: audit.status === "ACTIVE",
      configurationGateReady: configuration.status === "ACTIVE",
      planOnlyRoutingReady: true,
      overall: blocked
        ? "RUNTIME_COMMAND_BUS_BLOCKED"
        : "RUNTIME_COMMAND_BUS_READY"
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
      humanReviewBeforeHighImpact: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

function buildCommandBusReport(options = {}) {
  const probes = [
    routeCommand("START_RUNTIME", options),
    routeCommand("RECOVER_RUNTIME", options),
    routeCommand("UPGRADE_RUNTIME", options),
    routeCommand("RESTART_RUNTIME", options)
  ];

  const blocked = probes.some((probe) => probe.status !== "ACTIVE");

  return {
    system: "SHEIKHA_RUNTIME_COMMAND_BUS_REPORT",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_COMMAND_BUS_REPORT",
    probes,
    summary: {
      total: probes.length,
      accepted: probes.filter((probe) => probe.routing.accepted).length,
      blocked: probes.filter((probe) => !probe.routing.accepted).length
    },
    readiness: {
      commandBusReportReady: !blocked,
      commandRoutingReady: probes.every((probe) =>
        probe.readiness.overall === "RUNTIME_COMMAND_BUS_READY"
      ),
      overall: blocked
        ? "RUNTIME_COMMAND_BUS_REPORT_BLOCKED"
        : "RUNTIME_COMMAND_BUS_REPORT_READY"
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
  createCommand,
  routeCommand,
  buildCommandBusReport,
  COMMAND_POLICY_MAP
};
