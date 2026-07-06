const fs = require("fs");

const files = {
  registry: "runtime/universal-engine-registry/sheikha-universal-engine-registry.json",
  orchestrator: "runtime/universal-orchestrator/sheikha-universal-orchestrator.json",
  loader: "runtime/universal-runtime-loader/sheikha-universal-runtime-loader.json",
  lifecycle: "runtime/engine-lifecycle/sheikha-engine-lifecycle-manager.json",
  eventBus: "runtime/universal-event-bus/sheikha-universal-event-bus.json",
  workflow: "runtime/workflow-runtime/sheikha-workflow-runtime.json"
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
readJson("orchestrator", files.orchestrator);
readJson("loader", files.loader);
readJson("lifecycle", files.lifecycle);
const eventBus = readJson("eventBus", files.eventBus);
const workflow = readJson("workflow", files.workflow);

const requiredWorkflowFields = [
  "workflow_stages",
  "workflow_events",
  "execution_policy",
  "governance",
  "outputs",
  "maturity"
];

for (const key of requiredWorkflowFields) {
  if (!(key in (workflow || {}))) {
    console.error("WORKFLOW FIELD MISSING:", key);
    failed = true;
  }
}

const requiredStages = [
  "workflow_received",
  "input_validation",
  "domain_classification",
  "entity_extraction",
  "constant_variable_detection",
  "knowledge_graph_linking",
  "statistics_analysis",
  "evidence_evaluation",
  "confidence_scoring",
  "report_generation",
  "workflow_completed"
];

for (const stage of requiredStages) {
  if (!workflow?.workflow_stages?.includes(stage)) {
    console.error("REQUIRED WORKFLOW STAGE MISSING:", stage);
    failed = true;
  }
}

const requiredWorkflowEvents = [
  "WORKFLOW_STARTED",
  "WORKFLOW_STEP_STARTED",
  "WORKFLOW_STEP_COMPLETED",
  "WORKFLOW_STEP_FAILED",
  "WORKFLOW_FINISHED"
];

for (const eventName of requiredWorkflowEvents) {
  if (!workflow?.workflow_events?.includes(eventName)) {
    console.error("REQUIRED WORKFLOW EVENT MISSING:", eventName);
    failed = true;
  }
  if (!eventBus?.events?.includes(eventName)) {
    console.error("EVENT BUS DOES NOT SUPPORT WORKFLOW EVENT:", eventName);
    failed = true;
  }
}

if (workflow?.execution_policy?.event_bus_required !== true) {
  console.error("WORKFLOW EVENT BUS POLICY MISSING");
  failed = true;
}

if (
  workflow?.governance?.audit_trace_required !== true ||
  workflow?.governance?.no_harm !== true ||
  workflow?.governance?.confidence_score_required !== true
) {
  console.error("WORKFLOW GOVERNANCE INCOMPLETE");
  failed = true;
}

if (!registry?.engines || Object.keys(registry.engines).length < 5) {
  console.error("REGISTRY ENGINE COVERAGE TOO LOW");
  failed = true;
}

if (failed) process.exit(1);

console.log(JSON.stringify({
  status: "PASSED",
  registry: 100,
  orchestrator: 100,
  loader: 100,
  lifecycle: 100,
  eventBus: 100,
  workflow: 100,
  overall: 100
}, null, 2));

console.log("SHEIKHA WORKFLOW RUNTIME STACK VALIDATED");
