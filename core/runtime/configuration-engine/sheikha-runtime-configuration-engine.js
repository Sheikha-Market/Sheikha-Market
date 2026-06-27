"use strict";

const os = require("os");

const {
  buildRuntimeStateStore
} = require("../state-store/sheikha-runtime-state-store");

const {
  buildRuntimeCoordinator
} = require("../coordinator/sheikha-runtime-coordinator");

function currentEnvironment() {
  return process.env.NODE_ENV || "development";
}

function buildRuntimeConfiguration(options = {}) {
  const stateStore = buildRuntimeStateStore(options);
  const coordinator = buildRuntimeCoordinator(options);

  const blocked =
    stateStore.status !== "ACTIVE" ||
    coordinator.status !== "ACTIVE";

  return {
    system: "SHEIKHA_RUNTIME_CONFIGURATION_ENGINE",
    version: "1.0.0",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_RUNTIME_CONFIGURATION",

    environment: currentEnvironment(),

    host: {
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
      release: os.release(),
      cpuCount: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime()
    },

    configuration: {
      runtimeManager: {
        enabled: true,
        mode: "UNIFIED_ENTERPRISE_RUNTIME_MANAGER",
        readOnlyDefault: true
      },

      coordinator: {
        enabled: true,
        centralizedCoordination: true
      },

      governance: {
        policyEngineRequired: true,
        auditEngineRequired: true,
        humanReviewForHighImpact: true,
        denyDestructiveActionsByDefault: true
      },

      observability: {
        telemetryEnabled: true,
        metricsEnabled: true,
        dashboardEnabled: true,
        evidenceHashingEnabled: true
      },

      execution: {
        executionPlanOnly: true,
        schedulerPlanOnly: true,
        lifecyclePlanOnly: true,
        noShellExecution: true,
        noPrivilegeEscalation: true
      },

      recovery: {
        recoveryPlanOnly: true,
        checkpointPolicyReady: true,
        rollbackPolicyReady: true,
        isolationPolicyReady: true
      },

      upgrade: {
        upgradePlanOnly: true,
        compatibilityCheckRequired: true,
        snapshotBeforeUpgradeRequired: true,
        rollbackRequired: true,
        rollingUpgradePreferred: true
      }
    },

    dependencies: {
      stateStore: {
        status: stateStore.status,
        readiness: stateStore.readiness.overall
      },

      coordinator: {
        status: coordinator.status,
        readiness: coordinator.readiness.overall
      }
    },

    summary: {
      sections: Object.keys(this?.configuration || {}).length || 6,
      stateStoreReady: stateStore.status === "ACTIVE",
      coordinatorReady: coordinator.status === "ACTIVE",
      productionMode: currentEnvironment() === "production"
    },

    runtimeHealth: stateStore.runtimeHealth,

    readiness: {
      configurationReady: !blocked,
      defaultsReady: true,
      environmentAwarenessReady: true,
      runtimeManagerIntegrationReady: true,
      coordinatorIntegrationReady: true,
      stateStoreIntegrationReady: true,

      overall: blocked
        ? "RUNTIME_CONFIGURATION_BLOCKED"
        : "RUNTIME_CONFIGURATION_ENGINE_READY"
    },

    governance: {
      readOnly: true,
      noFileMutation: true,
      noShellExecution: true,
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
  buildRuntimeConfiguration,
  currentEnvironment
};
