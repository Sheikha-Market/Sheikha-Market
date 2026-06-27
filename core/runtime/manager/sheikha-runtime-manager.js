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

const { inspectRuntimeTelemetry } = require("../telemetry-engine/sheikha-runtime-telemetry-engine");
const { buildUnifiedRuntimeMetrics } = require("../metrics-engine/sheikha-runtime-metrics-engine");
const { buildRuntimeDashboard } = require("../dashboard-engine/sheikha-runtime-dashboard-engine");
const { buildExecutionPlan } = require("../execution-engine/sheikha-runtime-execution-engine");
const { buildRuntimeSchedule } = require("../scheduler-engine/sheikha-runtime-scheduler-engine");
const { buildLifecyclePlan } = require("../lifecycle-engine/sheikha-runtime-lifecycle-engine");

const {
  buildRuntimeUpgradePlan
} = require("../upgrade-manager/sheikha-runtime-upgrade-manager");

const {
  buildRuntimeRecoveryPlan
} = require("../recovery-engine/sheikha-runtime-recovery-engine");

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

  const telemetry = inspectRuntimeTelemetry();
  const metrics = buildUnifiedRuntimeMetrics();
  const dashboard = buildRuntimeDashboard();
  const execution = buildExecutionPlan(options);
  const scheduler = buildRuntimeSchedule(options);
  const lifecycle = buildLifecyclePlan(options);
  const discovery = discoverRuntimeDefinitions(options);

  const recovery = buildRuntimeRecoveryPlan(options);

  const upgrade = buildRuntimeUpgradePlan(options);

  const registry = buildRuntimeRegistry(options);

  const dependencyGraph = buildDependencyGraph(options);

  const capabilityRegistry = buildCapabilityRegistry(options);

  const bootSequencer = buildBootSequence(options);

  const resourceManager = inspectRuntimeResources(options);

  const serverPlane = inspectServerPlane(options);

  const serviceManager = inspectRuntimeServices(options);

  const supervisor = superviseRuntime(options);

  const ready =
    upgrade.status === "ACTIVE" &&
    upgrade.readiness.overall === "RUNTIME_UPGRADE_MANAGER_READY" &&
    recovery.status === "ACTIVE" &&
    recovery.readiness.overall === "RUNTIME_RECOVERY_ENGINE_READY" &&
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
upgradeManager: {
  status: upgrade.status,
  readiness: upgrade.readiness.overall,
  summary: upgrade.upgradeSummary,
  health: upgrade.runtimeHealth
},
recoveryEngine: {
  status: recovery.status,
  readiness: recovery.readiness.overall,
  summary: recovery.recoverySummary,
  health: recovery.runtimeHealth
},
executionEngine: {
  status: execution.status,
  readiness: execution.readiness.overall,
  queues: execution.queues,
  health: execution.runtimeHealth
},

schedulerEngine: {
  status: scheduler.status,
  readiness: scheduler.readiness.overall,
  queues: scheduler.queues,
  health: scheduler.runtimeHealth
},

lifecycleEngine: {
  status: lifecycle.status,
  readiness: lifecycle.readiness.overall,
  states: lifecycle.states.length,
  plannedItems: lifecycle.lifecyclePlan.length,
  health: lifecycle.runtimeHealth
},

telemetryEngine: {
  status: telemetry.status,
  readiness: telemetry.readiness.overall
},

metricsEngine: {
  status: metrics.status,
  readiness: metrics.readiness.overall,
  health: metrics.health
},

dashboardEngine: {
  status: dashboard.status,
  readiness: dashboard.readiness.overall,
  summary: dashboard.summary
},
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
          execution.status === "ACTIVE" &&
          scheduler.status === "ACTIVE" &&
          lifecycle.status === "ACTIVE" &&
          telemetry.status === "ACTIVE" &&
          metrics.status === "ACTIVE" &&
          dashboard.status === "ACTIVE" &&
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
