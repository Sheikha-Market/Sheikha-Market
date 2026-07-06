const fs = require("fs");

const graphFile =
  "runtime/universal-knowledge-graph/sheikha-universal-knowledge-graph-engine.json";

let failed = false;

function readJson(file) {
  if (!fs.existsSync(file)) {
    console.error("MISSING:", file);
    failed = true;
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const graph = readJson(graphFile);

if (graph) {
  const required = [
    "graph_layers",
    "supported_nodes",
    "relationship_types",
    "integration",
    "governance",
    "outputs",
    "maturity"
  ];

  for (const key of required) {
    if (!(key in graph)) {
      console.error("MISSING GRAPH FIELD:", key);
      failed = true;
    }
  }

  for (const [name, file] of Object.entries(graph.integration || {})) {
    const engine = readJson(file);
    if (!engine) continue;

    if (engine.status !== "ACTIVE") {
      console.error("INTEGRATED ENGINE NOT ACTIVE:", name, file);
      failed = true;
    } else {
      console.log("VALIDATED INTEGRATION:", name);
    }
  }

  if (graph.governance?.evidence_required_for_claims !== true) {
    console.error("EVIDENCE GOVERNANCE MISSING");
    failed = true;
  }

  if (!Array.isArray(graph.relationship_types) || graph.relationship_types.length < 10) {
    console.error("INSUFFICIENT RELATIONSHIP TYPES");
    failed = true;
  }
}

if (failed) process.exit(1);

console.log("SHEIKHA UNIVERSAL KNOWLEDGE GRAPH VALIDATED");
