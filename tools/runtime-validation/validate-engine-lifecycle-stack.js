const fs = require("fs");

const files = {
  registry: "runtime/universal-engine-registry/sheikha-universal-engine-registry.json",
  orchestrator: "runtime/universal-orchestrator/sheikha-universal-orchestrator.json",
  loader: "runtime/universal-runtime-loader/sheikha-universal-runtime-loader.json",
  lifecycle: "runtime/engine-lifecycle/sheikha-engine-lifecycle-manager.json"
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

const registry = readJson("registry", files.registry);
const orchestrator = readJson("orchestrator", files.orchestrator);
const loader = readJson("loader", files.loader);
const lifecycle = readJson("lifecycle", files.lifecycle);

const requiredLifecycle = [
  "lifecycle_states",
  "allowed_transitions",
  "policies",
  "recovery",
  "monitoring",
  "governance",
  "outputs",
  "maturity"
];

for (const key of requiredLifecycle) {
  if (!(key in (lifecycle || {}))) {
    console.error("LIFECYCLE FIELD MISSING:", key);
    failed = true;
  }
}

for (const state of lifecycle?.lifecycle_states || []) {
  if (!(state in lifecycle.allowed_transitions)) {
    console.error("STATE WITHOUT TRANSITION RULE:", state);
    failed = true;
  }
}

if (lifecycle?.policies?.unvalidated_engine_must_not_run !== true) {
  console.error("MISSING POLICY: unvalidated_engine_must_not_run");
  failed = true;
}

if (lifecycle?.recovery?.retry_policy?.enabled !== true) {
  console.error("MISSING RETRY POLICY");
  failed = true;
}

if (
  lifecycle?.governance?.audit_trace_required !== true ||
  lifecycle?.governance?.no_harm !== true
) {
  console.error("LIFECYCLE GOVERNANCE INCOMPLETE");
  failed = true;
}

if (!registry?.engines || Object.keys(registry.engines).length < 5) {
  console.error("REGISTRY ENGINE COVERAGE TOO LOW");
  failed = true;
}

if (!orchestrator?.engine_roles || Object.keys(orchestrator.engine_roles).length < 5) {
  console.error("ORCHESTRATOR ROLE COVERAGE TOO LOW");
  failed = true;
}

if (!Array.isArray(loader?.loading_pipeline) || !loader.loading_pipeline.includes("emit_runtime_ready")) {
  console.error("LOADER PIPELINE INCOMPLETE");
  failed = true;
}

if (failed) process.exit(1);

console.log(JSON.stringify({
  status: "PASSED",
  registry: 100,
  orchestrator: 100,
  loader: 100,
  lifecycle: 100,
  overall: 100
}, null, 2));

console.log("SHEIKHA ENGINE LIFECYCLE STACK VALIDATED");
