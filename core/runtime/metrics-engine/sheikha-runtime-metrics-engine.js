"use strict";

const { inspectRuntimeTelemetry } = require("../telemetry-engine/sheikha-runtime-telemetry-engine");

function percentage(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Number((value * 100).toFixed(2));
}

function healthScore(metrics) {
  let score = 100;

  if (metrics.memory.usedPercent > 80) score -= 15;
  if (metrics.memory.usedPercent > 90) score -= 20;
  if (metrics.cpu.load1m > metrics.cpu.cores) score -= 15;
  if (!metrics.services.pm2Available) score -= 10;
  if (!metrics.services.dockerAvailable) score -= 5;
  if (metrics.network.listeningPortsDetected === 0) score -= 10;
  if (!metrics.gpu.available) score -= 3;

  return Math.max(0, Math.min(100, score));
}

function buildUnifiedRuntimeMetrics() {
  const telemetry = inspectRuntimeTelemetry();

  const metrics = {
    cpu: {
      cores: telemetry.telemetry.cpu.cores,
      model: telemetry.telemetry.cpu.model,
      load1m: telemetry.telemetry.cpu.loadavg[0],
      load5m: telemetry.telemetry.cpu.loadavg[1],
      load15m: telemetry.telemetry.cpu.loadavg[2]
    },
    memory: {
      totalBytes: telemetry.telemetry.memory.totalBytes,
      usedBytes: telemetry.telemetry.memory.usedBytes,
      freeBytes: telemetry.telemetry.memory.freeBytes,
      usedRatio: telemetry.telemetry.memory.usedRatio,
      usedPercent: percentage(telemetry.telemetry.memory.usedRatio)
    },
    gpu: {
      available: telemetry.telemetry.gpu.available,
      nvidia: telemetry.telemetry.gpu.nvidia,
      intel: telemetry.telemetry.gpu.intel,
      amd: telemetry.telemetry.gpu.amd
    },
    threads: telemetry.telemetry.threads,
    storage: telemetry.telemetry.storage,
    network: telemetry.telemetry.network,
    services: telemetry.telemetry.services,
    process: {
      pid: telemetry.process.pid,
      uptimeSeconds: telemetry.process.uptimeSeconds,
      nodeVersion: telemetry.process.nodeVersion,
      heapUsedBytes: telemetry.process.memory.heapUsed,
      rssBytes: telemetry.process.memory.rss
    },
    eventLoop: telemetry.eventLoop
  };

  return {
    system: "SHEIKHA_UNIFIED_RUNTIME_METRICS_ENGINE",
    status: "ACTIVE",
    mode: "UNIFIED_READ_ONLY_RUNTIME_METRICS",
    metrics,
    health: {
      score: healthScore(metrics),
      status: healthScore(metrics) >= 90
        ? "HEALTHY"
        : healthScore(metrics) >= 70
          ? "DEGRADED"
          : "CRITICAL"
    },
    readiness: {
      unifiedMetrics: true,
      dashboardFeed: true,
      apiFeed: true,
      alertingReady: true,
      schedulerReady: true,
      recoveryReady: true,
      overall: "UNIFIED_METRICS_READY"
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
  buildUnifiedRuntimeMetrics,
  healthScore,
  percentage
};
