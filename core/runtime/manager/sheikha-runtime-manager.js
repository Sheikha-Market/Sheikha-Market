"use strict";

/**
 * ============================================================
 * SHEIKHA Runtime Manager V1
 * Unified Enterprise Runtime Platform Manager
 * ============================================================
 *
 * المسؤول عن تجميع جميع طبقات التشغيل داخل منصة واحدة.
 *
 * لا يقوم بتنفيذ صلاحيات نظام التشغيل مباشرة،
 * وإنما يدير طبقات الـ Runtime والحوكمة والمراقبة.
 *
 * ============================================================
 */

const {
  discoverRuntimeDefinitions
} = require("../discovery-engine/sheikha-runtime-discovery-engine");

const {
  buildRuntimeRegistry
} = require("../registry-manager/sheikha-runtime-registry-manager");

const {
  buildDependencyGraph
} = require("../dependency-graph/sheikha-runtime-dependency-graph");

const {
  buildCapabilityRegistry
} = require("../capability-registry/sheikha-runtime-capability-registry");

const {
  buildBootSequence
} = require("../boot-sequencer/sheikha-runtime-boot-sequencer");

const {
  inspectRuntimeResources
} = require("../resource-manager/sheikha-runtime-resource-manager");

const {
  inspectServerPlane
} = require("../server-plane/sheikha-server-plane-inspector");

const {
  inspectRuntimeServices
} = require("../service-manager/sheikha-runtime-service-manager");

const {
  superviseRuntime
} = require("../supervisor/sheikha-runtime-supervisor");

/* ============================================================
 * Helpers
 * ============================================================
 */

function safe(value, fallback = null) {
  return value === undefined || value === null ? fallback : value;
}

/* ============================================================
 * Runtime Manager
 * ============================================================
 */

function runRuntimeManager(options = {}) {

  const discovery = discoverRuntimeDefinitions(options);

  const registry = buildRuntimeRegistry(options);

  const dependencyGraph = buildDependencyGraph(options);

  const capabilityRegistry = buildCapabilityRegistry(options);

  const bootSequencer = buildBootSequence(options);

  const resourceManager = inspectRuntimeResources(options);

  const serverPlane = inspectServerPlane(options);

  const serviceManager = inspectRuntimeServices(options);

  const supervisor = superviseRuntime(options);

  const ready =
    discovery.status === "ACTIVE" &&
    registry.status === "ACTIVE" &&
    dependencyGraph.readiness.overall ===
      "RUNTIME_DEPENDENCY_GRAPH_READY" &&
    capabilityRegistry.status === "ACTIVE" &&
    bootSequencer.readiness.overall ===
      "BOOT_SEQUENCE_READY" &&
    resourceManager.status === "ACTIVE" &&
    serverPlane.status === "ACTIVE" &&
    serviceManager.status === "ACTIVE" &&
    serviceManager.readiness.overall ===
      "SERVICE_MANAGER_READY" &&
    supervisor.status === "ACTIVE";

  return {

    system: "SHEIKHA_RUNTIME_MANAGER_V1",

    version: "1.0.0",

    mode: "UNIFIED_ENTERPRISE_RUNTIME_PLATFORM_MANAGER",

    status: ready ? "ACTIVE" : "DEGRADED",

    layers: {

      discovery: {
        status: discovery.status,
        totals: discovery.totals
      },

      registry: registry.readiness,

      dependencyGraph: dependencyGraph.readiness,

      capabilityRegistry: {
        status: capabilityRegistry.status,
        capabilityGroups: Object.keys(
          capabilityRegistry.capabilities || {}
        ).length,
        pluginsReady:
          capabilityRegistry.plugins.dynamicPluginsReady
      },

      bootSequencer: bootSequencer.readiness,

      resourceManager: {
        status: resourceManager.status,
        cpuCores: safe(resourceManager.cpu?.cores, 0),
        memoryUsedRatio: safe(
          resourceManager.memory?.usedRatio,
          0
        ),
        gpuAvailable: safe(
          resourceManager.gpu?.available,
          false
        ),
        workerThreads: safe(
          resourceManager.threads?.recommendedWorkerThreads,
          0
        )
      },

      serverPlane: {
        status: serverPlane.status,
        hostname: serverPlane.server.hostname,
        platform: serverPlane.server.platform,
        productionNodeReady:
          serverPlane.serverRoles.productionNodeReady,
        clusterNodeReady:
          serverPlane.serverRoles.clusterNodeReady
      },

      serviceManager: {
        status: serviceManager.status,
        pm2Available:
          serviceManager.adapters.pm2.available,
        pm2Services:
          serviceManager.adapters.pm2.services.length,
        dockerAvailable:
          serviceManager.adapters.docker.available,
        kubernetesAvailable:
          serviceManager.adapters.kubernetes.available,
        readiness:
          serviceManager.readiness.overall
      },

      supervisor: supervisor.health

    },

    roadmapReady: {

      dynamicPluginLoader: true,

      serviceDiscovery: true,

      hotReload: true,

      distributedRuntimeCluster: true,

      multiNodeFederation: true,

      runtimeScheduler: true,

      resourceAllocator: true,

      runtimeTelemetry: true,

      unifiedMetrics: true,

      runtimeDashboard: true,

      sdkPlatform: true

    },

    sdkTargets: [

      "javascript-nodejs",

      "python",

      "go",

      "rust",

      "java",

      "csharp",

      "php"

    ],

    governance: {

      readOnlyDefault: true,

      governanceBeforeExecution: true,

      noPrivilegeEscalation: true,

      noUnauthorizedAccess: true,

      noHarm: true,

      auditRequired: true,

      humanReviewForHighImpact: true,

      noGhaybClaims: true,

      tawhid: "الله وحده لا شريك له"

    },

    timestamp: new Date().toISOString()

  };

}

module.exports = {
  runRuntimeManager
};
