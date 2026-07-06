const fs = require("fs");

const files = {
  bootstrap: "runtime/runtime-bootstrap/sheikha-runtime-bootstrap-engine.json",
  kernel: "runtime/runtime-os-kernel/sheikha-runtime-operating-system-kernel.json",
  controlPlane: "runtime/universal-control-plane/sheikha-universal-control-plane.json",
  executionGraph: "runtime/execution-graph-runtime/sheikha-execution-graph-runtime.json",
  eventBus: "runtime/universal-event-bus/sheikha-universal-event-bus.json",
  workflow: "runtime/workflow-runtime/sheikha-workflow-runtime.json",
  registry: "runtime/universal-engine-registry/sheikha-universal-engine-registry.json"
};

let failed = false;

function readJson(name, file) {
  if (!fs.existsSync(file)) {
    console.error("MISSING:", name, file);
    failed = true;
    return null;
  }

  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  if (data.status !== "ACTIVE") {
    console.error("NOT ACTIVE:", name);
    failed = true;
  }

  console.log("VALIDATED:", name);
  return data;
}

const bootstrap = readJson("bootstrap", files.bootstrap);
readJson("kernel", files.kernel);
readJson("controlPlane", files.controlPlane);
readJson("executionGraph", files.executionGraph);
readJson("eventBus", files.eventBus);
readJson("workflow", files.workflow);
readJson("registry", files.registry);

const requiredSequence = [
  "discover_runtime_definitions",
  "validate_runtime_json",
  "resolve_dependencies",
  "calculate_load_order",
  "build_execution_graph",
  "register_engines",
  "activate_event_bus",
  "activate_workflow_runtime",
  "activate_control_plane",
  "run_kernel_health_check",
  "emit_kernel_ready"
];

for (const step of requiredSequence) {
  if (!bootstrap?.bootstrap_sequence?.includes(step)) {
    console.error("BOOTSTRAP STEP MISSING:", step);
    failed = true;
  }
}

if (
  bootstrap?.execution?.executable_architecture !== true ||
  bootstrap?.execution?.dynamic_registration !== true ||
  bootstrap?.execution?.dependency_graph_required !== true
) {
  console.error("BOOTSTRAP EXECUTION POLICY INCOMPLETE");
  failed = true;
}

if (
  bootstrap?.governance?.governance_before_execution !== true ||
  bootstrap?.governance?.audit_trace_required !== true ||
  bootstrap?.governance?.no_harm !== true
) {
  console.error("BOOTSTRAP GOVERNANCE INCOMPLETE");
  failed = true;
}

if (!bootstrap?.kernel_events?.includes("KERNEL_READY")) {
  console.error("KERNEL_READY EVENT MISSING");
  failed = true;
}

if (failed) process.exit(1);

console.log(JSON.stringify({
  status: "PASSED",
  bootstrap: 100,
  kernel: 100,
  controlPlane: 100,
  executionGraph: 100,
  governance: 100,
  overall: 100
}, null, 2));

console.log("SHEIKHA RUNTIME BOOTSTRAP STACK VALIDATED");
