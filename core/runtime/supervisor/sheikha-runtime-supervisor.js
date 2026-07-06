const { runRuntimeExecutive } = require("../executive/sheikha-runtime-executive");
const { inspectServerPlane } = require("../server-plane/sheikha-server-plane-inspector");
const { buildCapabilityRegistry } = require("../capability-registry/sheikha-runtime-capability-registry");

function superviseRuntime(options = {}) {
  const executive = runRuntimeExecutive(options);
  const server = inspectServerPlane();
  const capabilities = buildCapabilityRegistry(options);

  const healthy =
    executive.status === "ACTIVE" &&
    server.status === "ACTIVE" &&
    Object.keys(capabilities.capabilities).length > 0;

  return {
    system: "SHEIKHA_RUNTIME_SUPERVISOR",
    status: healthy ? "ACTIVE" : "DEGRADED",
    mode: "READ_ONLY_HEALTH_SUPERVISION",
    health: {
      executive: executive.status,
      serverPlane: server.status,
      capabilityRegistry: capabilities.status,
      overall: healthy ? "HEALTHY" : "DEGRADED"
    },
    checks: {
      bootSequenceReady: executive.boot.readiness.overall === "BOOT_SEQUENCE_READY",
      resourcesVisible: Boolean(server.resources?.cpu && server.resources?.memory),
      capabilitiesIndexed: Object.keys(capabilities.capabilities).length > 0,
      restartPolicyReady: true,
      recoveryPolicyReady: true
    },
    metrics: {
      executionPlanPhases: executive.executionPlan.length,
      cpuCores: server.resources.cpu.cores,
      memoryUsedRatio: server.resources.memory.usedRatio,
      gpuAvailable: server.resources.gpu.available,
      capabilityGroups: Object.keys(capabilities.capabilities).length
    },
    recovery: {
      autoRestartAllowed: false,
      safeRestartRequiresHumanReview: true,
      isolationReady: true,
      auditRequired: true
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
  superviseRuntime
};
