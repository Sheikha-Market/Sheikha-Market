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
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "READ_ONLY_RUNTIME_CONFIGURATION",
    environment: currentEnvironment(),
    host: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release()
    },
    configuration: {
      runtimeManager: {
        enabled: true,
        readOnlyDefault: true,
        managerMode: "UNIFIED_ENTERPRISE_RUNTIME_MANAGER"
      },
      governance: {
        policyEngineRequired: true,
        auditRequired: true,
        humanReviewForHighImpact: true,
        destructiveActionsDeniedByDefault: true
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
        rollbackRequired: true
      }
    },
    dependencies: {
      stateStore: stateStore.readiness.overall,
      coordinator: coordinator.readiness.overall
    },
    summary: {
      sections: 6,
      stateStoreReady: stateStore.status === "ACTIVE",
      coordinatorReady: coordinator.status === "ACTIVE",
      productionMode: currentEnvironment() === "production"
    },
    runtimeHealth: stateStore.runtimeHealth,
    readiness: {
      configurationReady: !blocked,
      defaultsReady: true,
      environmentAwarenessReady: true,
      managerIntegrationReady: true,
      coordinatorIntegrationReady: true,
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
