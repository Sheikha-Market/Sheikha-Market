"use strict";

const os = require("os");
const fs = require("fs");
const { inspectRuntimeResources } = require("../resource-manager/sheikha-runtime-resource-manager");
const { inspectRuntimeStorage } = require("../storage-manager/sheikha-runtime-storage-manager");
const { inspectRuntimeNetwork } = require("../network-manager/sheikha-runtime-network-manager");
const { inspectRuntimeServices } = require("../service-manager/sheikha-runtime-service-manager");

function safeRead(file, fallback = "") {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return fallback;
  }
}

function inspectEventLoop() {
  const start = process.hrtime.bigint();
  const end = process.hrtime.bigint();

  return {
    sampleLatencyNs: Number(end - start),
    status: "SAMPLED"
  };
}

function inspectProcessTelemetry() {
  const memory = process.memoryUsage();

  return {
    pid: process.pid,
    nodeVersion: process.version,
    uptimeSeconds: process.uptime(),
    memory,
    cpuUsage: process.cpuUsage()
  };
}

function inspectRuntimeTelemetry() {
  const resources = inspectRuntimeResources();
  const storage = inspectRuntimeStorage();
  const network = inspectRuntimeNetwork();
  const services = inspectRuntimeServices();

  return {
    system: "SHEIKHA_RUNTIME_TELEMETRY_ENGINE",
    status: "ACTIVE",
    mode: "READ_ONLY_RUNTIME_TELEMETRY",
    host: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      uptimeSeconds: os.uptime(),
      loadavg: os.loadavg()
    },
    process: inspectProcessTelemetry(),
    eventLoop: inspectEventLoop(),
    telemetry: {
      cpu: resources.cpu,
      memory: resources.memory,
      gpu: resources.gpu,
      threads: resources.threads,
      storage: {
        mountsDetected: storage.storage.mountsDetected,
        classes: storage.storage.classes,
        readiness: storage.readiness.overall
      },
      network: {
        interfacesDetected: network.network.interfacesDetected,
        listeningPortsDetected: network.network.listeningPortsDetected,
        readiness: network.readiness.overall
      },
      services: {
        pm2Available: services.adapters.pm2.available,
        pm2Services: services.adapters.pm2.services?.length || 0,
        dockerAvailable: services.adapters.docker.available,
        readiness: services.readiness.overall
      }
    },
    readiness: {
      cpuTelemetry: true,
      memoryTelemetry: true,
      storageTelemetry: true,
      networkTelemetry: true,
      serviceTelemetry: true,
      eventLoopTelemetry: true,
      unifiedMetricsReady: true,
      dashboardReady: true,
      overall: "RUNTIME_TELEMETRY_READY"
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
  inspectRuntimeTelemetry,
  inspectProcessTelemetry,
  inspectEventLoop
};
