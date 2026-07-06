const fs = require("fs");

const kernelFile = "runtime/runtime-os-kernel/sheikha-runtime-operating-system-kernel.json";
let failed = false;

function readJson(file) {
  if (!fs.existsSync(file)) {
    console.error("MISSING:", file);
    failed = true;
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const kernel = readJson(kernelFile);

if (kernel?.status !== "ACTIVE") {
  console.error("KERNEL NOT ACTIVE");
  failed = true;
}

for (const [name, file] of Object.entries(kernel?.sources || {})) {
  const source = readJson(file);
  if (!source) continue;
  if (source.status !== "ACTIVE") {
    console.error("KERNEL SOURCE NOT ACTIVE:", name, file);
    failed = true;
  } else {
    console.log("VALIDATED SOURCE:", name);
  }
}

const requiredLayers = [
  "boot_layer",
  "discovery_layer",
  "validation_layer",
  "registration_layer",
  "control_layer",
  "execution_layer",
  "event_layer",
  "workflow_layer",
  "lifecycle_layer",
  "resource_layer",
  "compute_acceleration_layer",
  "federation_layer",
  "observability_layer",
  "governance_layer",
  "security_layer",
  "knowledge_layer",
  "reporting_layer"
];

for (const layer of requiredLayers) {
  if (kernel?.kernel_layers?.[layer] !== "ACTIVE") {
    console.error("KERNEL LAYER MISSING:", layer);
    failed = true;
  }
}

if (!kernel?.boot_sequence?.includes("emit_kernel_ready")) {
  console.error("KERNEL BOOT SEQUENCE INCOMPLETE");
  failed = true;
}

if (
  kernel?.kernel_policies?.governance_before_execution !== true ||
  kernel?.kernel_policies?.audit_trace_required !== true ||
  kernel?.kernel_policies?.no_harm !== true
) {
  console.error("KERNEL POLICIES INCOMPLETE");
  failed = true;
}

if (failed) process.exit(1);

console.log(JSON.stringify({
  status: "PASSED",
  kernel: 100,
  sources: 100,
  layers: 100,
  bootSequence: 100,
  governance: 100,
  overall: 100
}, null, 2));

console.log("SHEIKHA RUNTIME OS KERNEL STACK VALIDATED");
