const fs = require("fs");

const registryFile =
  "runtime/universal-engine-registry/sheikha-universal-engine-registry.json";
const orchestratorFile =
  "runtime/universal-orchestrator/sheikha-universal-orchestrator.json";

let failed = false;

function readJson(file) {
  if (!fs.existsSync(file)) {
    console.error("MISSING:", file);
    failed = true;
    return null;
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const registry = readJson(registryFile);
const orchestrator = readJson(orchestratorFile);

if (registry?.status !== "ACTIVE") {
  console.error("REGISTRY NOT ACTIVE");
  failed = true;
}

if (orchestrator?.status !== "ACTIVE") {
  console.error("ORCHESTRATOR NOT ACTIVE");
  failed = true;
}

const engines = registry?.engines || {};
const roles = orchestrator?.engine_roles || {};

for (const [roleName, roleValue] of Object.entries(roles)) {
  if (!engines[roleName]) {
    console.error("ROLE ENGINE NOT REGISTERED:", roleName, roleValue);
    failed = true;
  } else {
    console.log("VALIDATED ROLE:", roleName, "->", roleValue);
  }
}

const requiredGovernance = [
  "registry_required",
  "evidence_required",
  "source_traceability_required",
  "confidence_score_required",
  "human_review_for_high_impact",
  "no_harm"
];

for (const key of requiredGovernance) {
  if (orchestrator?.governance?.[key] !== true) {
    console.error("ORCHESTRATOR GOVERNANCE MISSING:", key);
    failed = true;
  }
}

if (!Array.isArray(orchestrator?.orchestration_flow)) {
  console.error("ORCHESTRATION FLOW MISSING");
  failed = true;
}

if (Object.keys(roles).length < 5) {
  console.error("INSUFFICIENT ENGINE ROLES");
  failed = true;
}

if (failed) process.exit(1);

console.log(JSON.stringify({
  status: "PASSED",
  registry: 100,
  orchestrator: 100,
  mapping: 100,
  governance: 100,
  overall: 100
}, null, 2));

console.log("SHEIKHA UNIVERSAL REGISTRY ORCHESTRATOR VALIDATED");
