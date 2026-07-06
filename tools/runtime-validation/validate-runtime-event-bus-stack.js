const fs = require("fs");

const files = {
  registry: "runtime/universal-engine-registry/sheikha-universal-engine-registry.json",
  orchestrator: "runtime/universal-orchestrator/sheikha-universal-orchestrator.json",
  loader: "runtime/universal-runtime-loader/sheikha-universal-runtime-loader.json",
  lifecycle: "runtime/engine-lifecycle/sheikha-engine-lifecycle-manager.json",
  eventBus: "runtime/universal-event-bus/sheikha-universal-event-bus.json"
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

const requiredEventBusFields = [
  "event_categories",
  "events",
  "routing_policy",
  "delivery_policy",
  "governance",
  "outputs",
  "maturity"
];

for (const key of requiredEventBusFields) {
  if (!(key in (eventBus || {}))) {
    console.error("EVENT BUS FIELD MISSING:", key);
    failed = true;
  }
}

const requiredEvents = [
  "ENGINE_DISCOVERED",
  "ENGINE_VALIDATED",
  "ENGINE_REGISTERED",
  "ENGINE_LOADED",
  "ENGINE_READY",
  "ENGINE_ACTIVE",
  "ENGINE_FAILED",
  "WORKFLOW_STARTED",
  "WORKFLOW_FINISHED",
  "KNOWLEDGE_UPDATED",
  "REPORT_CREATED",
  "AUDIT_TRACE_CREATED"
];

for (const eventName of requiredEvents) {
  if (!eventBus?.events?.includes(eventName)) {
    console.error("REQUIRED EVENT MISSING:", eventName);
    failed = true;
  }
}

if (eventBus?.routing_policy?.event_schema_required !== true) {
  console.error("EVENT SCHEMA POLICY MISSING");
  failed = true;
}

if (eventBus?.delivery_policy?.dead_letter_queue_enabled === false) {
  console.error("DEAD LETTER QUEUE DISABLED");
  failed = true;
}

if (
  eventBus?.governance?.audit_trace_required !== true ||
  eventBus?.governance?.no_harm !== true
) {
  console.error("EVENT BUS GOVERNANCE INCOMPLETE");
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
  overall: 100
}, null, 2));

console.log("SHEIKHA RUNTIME EVENT BUS STACK VALIDATED");
