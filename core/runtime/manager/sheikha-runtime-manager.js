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
 * وإنما يدير طبقات Runtime والحوكمة والمراقبة.
 *
 * ============================================================
 */

const {
  inspectRuntimeTelemetry
} = require("../telemetry-engine/sheikha-runtime-telemetry-engine");

const {
  buildUnifiedRuntimeMetrics
} = require("../metrics-engine/sheikha-runtime-metrics-engine");

const {
  buildRuntimeDashboard
} = require("../dashboard-engine/sheikha-runtime-dashboard-engine");

const {
  buildExecutionPlan
} = require("../execution-engine/sheikha-runtime-execution-engine");

const {
  buildRuntimeSchedule
} = require("../scheduler-engine/sheikha-runtime-scheduler-engine");

const {
  buildLifecyclePlan
} = require("../lifecycle-engine/sheikha-runtime-lifecycle-engine");

const {
  buildCommandBusReport
} = require("../command-bus/sheikha-runtime-command-bus");

const {
  buildEventRouterReport
} = require("../event-router/sheikha-runtime-event-router");

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

function readiness(report) {
  return report?.readiness?.overall || "UNKNOWN";
}

function isActive(report, expectedReadiness = null) {
  if (!report || report.status !== "ACTIVE") {
    return false;
  }

  if (!expectedReadiness) {
    return true;
  }

  return readiness(report) === expectedReadiness;
}

/* ============================================================
 * Runtime Manager
 * ============================================================
 */

function runRuntimeManager(options = {}) {
  const telemetry = inspectRuntimeTelemetry(options);
  const metrics = buildUnifiedRuntimeMetrics(options);
  const dashboard = buildRuntimeDashboard(options);

  const execution = buildExecutionPlan(options);
  const scheduler = buildRuntimeSchedule(options);
  const lifecycle = buildLifecyclePlan(options);

  const commandBus = buildCommandBusReport(options);
  const eventRouter = buildEventRouterReport(options);

  const recovery = buildRuntimeRecoveryPlan(options);
  const upgrade = buildRuntimeUpgradePlan(options);

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
    isActive(upgrade, "RUNTIME_UPGRADE_MANAGER_READY") &&
    isActive(recovery, "RUNTIME_RECOVERY_ENGINE_READY") &&
    isActive(commandBus, "RUNTIME_COMMAND_BUS_REPORT_READY") &&
    isActive(eventRouter, "RUNTIME_EVENT_ROUTER_REPORT_READY") &&
    isActive(execution, "RUNTIME_EXECUTION_ENGINE_READY") &&
    isActive(scheduler, "RUNTIME_SCHEDULER_READY") &&
    isActive(lifecycle, "RUNTIME_LIFECYCLE_ENGINE_READY") &&
    isActive(telemetry, "RUNTIME_TELEMETRY_READY") &&
    isActive(metrics, "UNIFIED_METRICS_READY") &&
    isActive(dashboard, "RUNTIME_DASHBOARD_READY") &&
    discovery.status === "ACTIVE" &&
    registry.status === "ACTIVE" &&
    dependencyGraph.readiness.overall === "RUNTIME_DEPENDENCY_GRAPH_READY" &&
    capabilityRegistry.status === "ACTIVE" &&
    bootSequencer.readiness.overall === "BOOT_SEQUENCE_READY" &&
    resourceManager.status === "ACTIVE" &&
    serverPlane.status === "ACTIVE" &&
    serviceManager.status === "ACTIVE" &&
    serviceManager.readiness.overall === "SERVICE_MANAGER_READY" &&
    supervisor.status === "ACTIVE";

  return {
    system: "SHEIKHA_RUNTIME_MANAGER_V1",
    version: "1.0.0",
    mode: "UNIFIED_ENTERPRISE_RUNTIME_PLATFORM_MANAGER",
    status: ready ? "ACTIVE" : "DEGRADED",

    layers: {
      commandBus: {
        status: commandBus.status,
        readiness: readiness(commandBus),
        summary: commandBus.summary
      },

      eventRouter: {
        status: eventRouter.status,
        readiness: readiness(eventRouter),
        summary: eventRouter.summary
      },

      upgradeManager: {
        status: upgrade.status,
        readiness: readiness(upgrade),
        summary: upgrade.upgradeSummary,
        health: upgrade.runtimeHealth
      },

      recoveryEngine: {
        status: recovery.status,
        readiness: readiness(recovery),
        summary: recovery.recoverySummary,
        health: recovery.runtimeHealth
      },

      executionEngine: {
        status: execution.status,
        readiness: readiness(execution),
        queues: execution.queues,
        health: execution.runtimeHealth
      },

      schedulerEngine: {
        status: scheduler.status,
        readiness: readiness(scheduler),
        queues: scheduler.queues,
        health: scheduler.runtimeHealth
      },

      lifecycleEngine: {
        status: lifecycle.status,
        readiness: readiness(lifecycle),
        states: safe(lifecycle.states?.length, 0),
        plannedItems: safe(lifecycle.lifecyclePlan?.length, 0),
        health: lifecycle.runtimeHealth
      },

      telemetryEngine: {
        status: telemetry.status,
        readiness: readiness(telemetry)
      },

      metricsEngine: {
        status: metrics.status,
        readiness: readiness(metrics),
        health: metrics.health
      },

      dashboardEngine: {
        status: dashboard.status,
        readiness: readiness(dashboard),
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
          safe(capabilityRegistry.plugins?.dynamicPluginsReady, false)
      },

      bootSequencer: bootSequencer.readiness,

      resourceManager: {
        status: resourceManager.status,
        cpuCores: safe(resourceManager.cpu?.cores, 0),
        memoryUsedRatio: safe(resourceManager.memory?.usedRatio, 0),
        gpuAvailable: safe(resourceManager.gpu?.available, false),
        workerThreads: safe(
          resourceManager.threads?.recommendedWorkerThreads,
          0
        )
      },

      serverPlane: {
        status: serverPlane.status,
        hostname: safe(serverPlane.server?.hostname, "unknown"),
        platform: safe(serverPlane.server?.platform, "unknown"),
        productionNodeReady: safe(
          serverPlane.serverRoles?.productionNodeReady,
          false
        ),
        clusterNodeReady: safe(
          serverPlane.serverRoles?.clusterNodeReady,
          false
        )
      },

      serviceManager: {
        status: serviceManager.status,
        pm2Available: safe(serviceManager.adapters?.pm2?.available, false),
        pm2Services: safe(serviceManager.adapters?.pm2?.services?.length, 0),
        dockerAvailable: safe(
          serviceManager.adapters?.docker?.available,
          false
        ),
        kubernetesAvailable: safe(
          serviceManager.adapters?.kubernetes?.available,
          false
        ),
        readiness: readiness(serviceManager)
      },

      supervisor: supervisor.health
    },

    roadmapReady: {
      commandBus: true,
      eventRouter: true,
      eventDrivenRuntime: true,
      auditPipeline: true,
      distributedEvents: true,
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
      planOnlyExecution: true,
      governanceBeforeExecution: true,
      commandAuditRequired: true,
      eventAuditRequired: true,
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
