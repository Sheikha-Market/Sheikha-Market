"use strict";

const {
  buildUnifiedRuntimeMetrics
} = require("../metrics-engine/sheikha-runtime-metrics-engine");

const {
  inspectRuntimeTelemetry
} = require("../telemetry-engine/sheikha-runtime-telemetry-engine");

function buildRuntimeDashboard() {
  const metrics = buildUnifiedRuntimeMetrics();
  const telemetry = inspectRuntimeTelemetry();

  return {
    system: "SHEIKHA_RUNTIME_DASHBOARD_ENGINE",
    status: "ACTIVE",
    mode: "UNIFIED_RUNTIME_DASHBOARD_FEED",
    summary: {
      healthScore: metrics.health.score,
      healthStatus: metrics.health.status,
      metricsStatus: metrics.status,
      telemetryStatus: telemetry.status,
      overall: metrics.health.status === "HEALTHY"
        ? "RUNTIME_PLATFORM_HEALTHY"
        : "RUNTIME_PLATFORM_NEEDS_ATTENTION"
    },
    panels: {
      runtime: {
        system: metrics.system,
        status: metrics.status,
        readiness: metrics.readiness.overall
      },
      resources: {
        cpu: metrics.metrics.cpu,
        memory: metrics.metrics.memory,
        gpu: metrics.metrics.gpu,
        threads: metrics.metrics.threads
      },
      services: metrics.metrics.services,
      storage: metrics.metrics.storage,
      network: metrics.metrics.network,
      process: metrics.metrics.process,
      eventLoop: metrics.metrics.eventLoop,
      telemetry: {
        host: telemetry.host,
        readiness: telemetry.readiness.overall
      }
    },
    alerts: {
      count: metrics.health.status === "HEALTHY" ? 0 : 1,
      items: metrics.health.status === "HEALTHY"
        ? []
        : [{
            level: metrics.health.status,
            message: "Runtime health is below healthy threshold"
          }]
    },
    readiness: {
      dashboardFeed: true,
      apiReady: true,
      webDashboardReady: true,
      vscodeDashboardReady: true,
      cliDashboardReady: true,
      alertPanelReady: true,
      overall: "RUNTIME_DASHBOARD_READY"
    },
    governance: {
      readOnly: true,
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
  buildRuntimeDashboard
};
