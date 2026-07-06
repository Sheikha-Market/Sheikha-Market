const { buildBootSequence } = require("../boot-sequencer/sheikha-runtime-boot-sequencer");
const { inspectRuntimeResources } = require("../resource-manager/sheikha-runtime-resource-manager");

function runRuntimeExecutive(options = {}) {
  const boot = buildBootSequence(options);
  const resources = inspectRuntimeResources();

  const blocked = boot.status !== "ACTIVE" || boot.cycleDetected === true;

  return {
    system: "SHEIKHA_RUNTIME_EXECUTIVE",
    status: blocked ? "BLOCKED" : "ACTIVE",
    mode: "BOOT_SEQUENCE_RESOURCE_GOVERNED_EXECUTION",
    boot: {
      status: boot.status,
      readiness: boot.readiness,
      phases: boot.sequence
    },
    resources: {
      platform: resources.platform,
      arch: resources.arch,
      cpu: resources.cpu,
      memory: resources.memory,
      threads: resources.threads,
      storage: resources.storage,
      gpu: resources.gpu,
      schedulingPolicy: resources.schedulingPolicy
    },
    executionPlan: blocked
      ? []
      : boot.sequence.map((phase) => ({
          phase: phase.phase,
          id: phase.id,
          action: "READY_FOR_CONTROLLED_ACTIVATION",
          activeCount: phase.activeCount,
          totalCount: phase.count,
          resourceMode: phase.id === "ai" || phase.id === "graph"
            ? "CPU_WITH_OPTIONAL_GPU"
            : "CPU_SAFE_DEFAULT"
        })),
    events: blocked
      ? ["EXECUTIVE_STARTED", "BOOT_SEQUENCE_BLOCKED"]
      : [
          "EXECUTIVE_STARTED",
          "BOOT_SEQUENCE_ACCEPTED",
          "RESOURCES_INSPECTED",
          "EXECUTION_PLAN_READY"
        ],
    governance: {
      readOnlyPlan: true,
      governanceBeforeExecution: true,
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
  runRuntimeExecutive
};
