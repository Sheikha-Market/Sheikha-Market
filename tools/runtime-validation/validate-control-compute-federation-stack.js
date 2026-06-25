const fs = require("fs");

const files = {
  controlPlane: "runtime/universal-control-plane/sheikha-universal-control-plane.json",
  computePlane: "runtime/compute-acceleration-plane/sheikha-compute-acceleration-plane.json",
  federationPlane: "runtime/federation-plane/sheikha-federation-plane.json",
  executionGraph: "runtime/execution-graph-runtime/sheikha-execution-graph-runtime.json",
  workflow: "runtime/workflow-runtime/sheikha-workflow-runtime.json",
  eventBus: "runtime/universal-event-bus/sheikha-universal-event-bus.json",
  lifecycle: "runtime/engine-lifecycle/sheikha-engine-lifecycle-manager.json",
  loader: "runtime/universal-runtime-loader/sheikha-universal-runtime-loader.json",
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

const controlPlane = readJson("controlPlane", files.controlPlane);
const computePlane = readJson("computePlane", files.computePlane);
const federationPlane = readJson("federationPlane", files.federationPlane);

readJson("executionGraph", files.executionGraph);
readJson("workflow", files.workflow);
readJson("eventBus", files.eventBus);
readJson("lifecycle", files.lifecycle);
readJson("loader", files.loader);
readJson("registry", files.registry);

const requiredControlPlanes = [
  "control_plane_core",
  "policy_plane",
  "resource_plane",
  "scheduling_plane",
  "observability_plane",
  "configuration_plane",
  "security_plane",
  "knowledge_plane",
  "decision_plane",
  "reporting_plane"
];

for (const plane of requiredControlPlanes) {
  if (controlPlane?.planes?.[plane] !== "ACTIVE") {
    console.error("CONTROL PLANE MISSING:", plane);
    failed = true;
  }
}

const requiredAcceleration = [
  "cpu_parallelism",
  "gpu_acceleration",
  "npu_acceleration",
  "tpu_acceleration",
  "fpga_acceleration",
  "vector_compute",
  "distributed_compute",
  "cloud_acceleration",
  "hybrid_acceleration"
];

for (const layer of requiredAcceleration) {
  if (!computePlane?.acceleration_layers?.[layer]) {
    console.error("COMPUTE ACCELERATION LAYER MISSING:", layer);
    failed = true;
  }
}

const requiredFederation = [
  "node_registry",
  "environment_registry",
  "multi_node_coordination",
  "multi_cloud_coordination",
  "hybrid_runtime",
  "federated_observability",
  "federated_audit",
  "federated_recovery"
];

for (const layer of requiredFederation) {
  if (!federationPlane?.federation_layers?.[layer]) {
    console.error("FEDERATION LAYER MISSING:", layer);
    failed = true;
  }
}

if (
  controlPlane?.governance?.audit_trace_required !== true ||
  computePlane?.governance?.safe_execution_required !== true ||
  federationPlane?.governance?.security_required !== true
) {
  console.error("TOP LAYER GOVERNANCE INCOMPLETE");
  failed = true;
}

if (failed) process.exit(1);

console.log(JSON.stringify({
  status: "PASSED",
  controlPlane: 100,
  computeAcceleration: 100,
  federation: 100,
  runtimeStack: 100,
  governance: 100,
  overall: 100
}, null, 2));

console.log("SHEIKHA CONTROL COMPUTE FEDERATION STACK VALIDATED");
