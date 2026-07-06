const fs = require("fs");
const path = require("path");

function readJson(file) {
  const fullPath = path.join(process.cwd(), file);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function buildBootstrapStatus() {
  const bootstrap = readJson("runtime/runtime-bootstrap/sheikha-runtime-bootstrap-engine.json");
  const kernel = readJson("runtime/runtime-os-kernel/sheikha-runtime-operating-system-kernel.json");
  const controlPlane = readJson("runtime/universal-control-plane/sheikha-universal-control-plane.json");
  const executionGraph = readJson("runtime/execution-graph-runtime/sheikha-execution-graph-runtime.json");
  const eventBus = readJson("runtime/universal-event-bus/sheikha-universal-event-bus.json");
  const workflow = readJson("runtime/workflow-runtime/sheikha-workflow-runtime.json");

  return {
    system: "SHEIKHA_RUNTIME_BOOTSTRAP_API",
    status: "ACTIVE",
    bootstrap: {
      system: bootstrap.system,
      status: bootstrap.status,
      version: bootstrap.version,
      readiness: bootstrap.maturity?.overall
    },
    kernel: {
      system: kernel.system,
      status: kernel.status,
      readiness: kernel.maturity?.overall
    },
    controlPlane: {
      system: controlPlane.system,
      status: controlPlane.status,
      readiness: controlPlane.maturity?.overall
    },
    executionGraph: {
      system: executionGraph.system,
      status: executionGraph.status,
      readiness: executionGraph.maturity?.overall
    },
    eventBus: {
      system: eventBus.system,
      status: eventBus.status,
      readiness: eventBus.maturity?.overall
    },
    workflow: {
      system: workflow.system,
      status: workflow.status,
      readiness: workflow.maturity?.overall
    },
    kernelEvent: "KERNEL_READY",
    timestamp: new Date().toISOString()
  };
}

function registerSheikhaRuntimeBootstrapRoutes(app) {
  app.get("/api/runtime/bootstrap/status", (req, res) => {
    try {
      res.json(buildBootstrapStatus());
    } catch (error) {
      res.status(500).json({
        system: "SHEIKHA_RUNTIME_BOOTSTRAP_API",
        status: "ERROR",
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  app.post("/api/runtime/bootstrap/run", (req, res) => {
    try {
      const status = buildBootstrapStatus();
      res.json({
        ...status,
        action: "BOOTSTRAP_RUN",
        result: "KERNEL_READY"
      });
    } catch (error) {
      res.status(500).json({
        system: "SHEIKHA_RUNTIME_BOOTSTRAP_API",
        status: "ERROR",
        action: "BOOTSTRAP_RUN",
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  registerSheikhaRuntimeBootstrapRoutes,
  buildBootstrapStatus
};
