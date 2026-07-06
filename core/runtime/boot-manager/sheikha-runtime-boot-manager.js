const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const REQUIRED_STACK = {
  bootstrap: "runtime/runtime-bootstrap/sheikha-runtime-bootstrap-engine.json",
  kernel: "runtime/runtime-os-kernel/sheikha-runtime-operating-system-kernel.json",
  controlPlane: "runtime/universal-control-plane/sheikha-universal-control-plane.json",
  registry: "runtime/universal-engine-registry/sheikha-universal-engine-registry.json",
  loader: "runtime/universal-runtime-loader/sheikha-universal-runtime-loader.json",
  lifecycle: "runtime/engine-lifecycle/sheikha-engine-lifecycle-manager.json",
  eventBus: "runtime/universal-event-bus/sheikha-universal-event-bus.json",
  workflow: "runtime/workflow-runtime/sheikha-workflow-runtime.json",
  executionGraph: "runtime/execution-graph-runtime/sheikha-execution-graph-runtime.json",
  compute: "runtime/compute-acceleration-plane/sheikha-compute-acceleration-plane.json",
  federation: "runtime/federation-plane/sheikha-federation-plane.json",
  language: "runtime/sheikha-programming-language-core/sheikha-programming-language-core.json"
};

function readJson(file) {
  const fullPath = path.join(ROOT, file);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function bootSheikhaRuntime() {
  const layers = {};

  for (const [name, file] of Object.entries(REQUIRED_STACK)) {
    const data = readJson(file);

    if (data.status !== "ACTIVE") {
      throw new Error(`Layer not active: ${name}`);
    }

    layers[name] = {
      system: data.system,
      version: data.version,
      status: data.status,
      readiness: data.maturity?.overall || "READY"
    };
  }

  return {
    system: "SHEIKHA_RUNTIME_BOOT_MANAGER",
    status: "KERNEL_READY",
    bootMode: "EXECUTABLE_ARCHITECTURE",
    layers,
    events: [
      "BOOT_MANAGER_STARTED",
      "LAYERS_VALIDATED",
      "RUNTIME_STACK_READY",
      "KERNEL_READY"
    ],
    governance: {
      governanceBeforeExecution: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  bootSheikhaRuntime,
  REQUIRED_STACK
};
