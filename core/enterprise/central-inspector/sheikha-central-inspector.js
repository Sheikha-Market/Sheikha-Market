"use strict";

const {
  createEmptyEnterpriseInspector,
  safeCompactInspectorContext
} = require("../contracts/sheikha-enterprise-inspector-contract");

const INSPECTOR_DOMAINS = Object.freeze([
  "runtime",
  "live-chat",
  "conversation",
  "governance",
  "security",
  "development",
  "deployment",
  "storage",
  "network",
  "ai",
  "memory",
  "telemetry",
  "scheduler",
  "event-router",
  "event-store",
  "command-bus",
  "recovery",
  "upgrade",
  "health"
]);

function buildGovernanceBoundary(domain) {
  return {
    domain,
    readOnlyDefault: true,
    noSecretExposure: true,
    noTokenExposure: true,
    noEnvLeak: true,
    noUnauthorizedAccess: true,
    noPrivilegeEscalation: true,
    noShellExecution: true,
    noFileMutation: true,
    noProductionMutationWithoutApproval: true,
    auditRequired: true,
    humanReviewForHighImpact: true,
    safeOperationalMode: "INSPECT_ONLY"
  };
}

function inspectDomain(domain, input = {}) {
  const status = input.status || "OBSERVED";

  return {
    domain,
    status,
    readiness: `${domain.toUpperCase().replace(/-/g, "_")}_INSPECTOR_READY`,
    boundary: buildGovernanceBoundary(domain),
    signals: {
      enabled: true,
      supervised: true,
      leakageGuard: true,
      developmentGovernance: true,
      operationalSafety: true
    },
    risks: [],
    recommendations: [],
    timestamp: new Date().toISOString()
  };
}

function buildCentralInspector(input = {}) {
  const domains = INSPECTOR_DOMAINS.map((domain) =>
    inspectDomain(domain, input[domain] || {})
  );

  const blocked = domains.some((domain) => domain.status === "BLOCKED");

  return {
    system: "SHEIKHA_CENTRAL_ENTERPRISE_INSPECTOR",
    version: "1.0.0",
    status: blocked ? "DEGRADED" : "ACTIVE",
    mode: "CENTRAL_GOVERNED_INSPECTION_CONTROL_PLANE",
    centralInspector: true,
    subInspectors: domains,
    summary: {
      totalDomains: domains.length,
      activeDomains: domains.filter((d) => d.status !== "BLOCKED").length,
      blockedDomains: domains.filter((d) => d.status === "BLOCKED").length,
      governanceBoundaries: domains.length,
      leakageGuardsActive: domains.every((d) => d.boundary.noSecretExposure),
      operationalSafetyActive: true
    },
    governance: {
      centralReadOnlyControl: true,
      subInspectorSupervision: true,
      noSecretsInReports: true,
      noEnvDump: true,
      noCredentialsLogging: true,
      noShellExecution: true,
      noDirectMutation: true,
      developmentGovernance: true,
      operationalSafety: true,
      auditRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    compact: safeCompactInspectorContext(
      createEmptyEnterpriseInspector("CENTRAL_INSPECTOR_ACTIVE")
    ),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildCentralInspector,
  inspectDomain,
  buildGovernanceBoundary,
  INSPECTOR_DOMAINS
};
