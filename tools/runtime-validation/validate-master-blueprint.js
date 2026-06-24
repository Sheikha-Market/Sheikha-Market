const fs = require("fs");

const required = [
  "runtime/runtime-index/sheikha-runtime-index.json",
  "runtime/dependency-genome/sheikha-dependency-genome.json",
  "runtime/topology-graph/sheikha-topology-graph.json",
  "runtime/runtime-observatory/sheikha-runtime-observatory.json",
  "runtime/master-blueprint/sheikha-master-blueprint-engine.json",
  "runtime/capability-genome/sheikha-capability-genome.json",
  "runtime/enterprise-dashboard/sheikha-enterprise-runtime-dashboard.json"
];

let ok = true;

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error("MISSING:", file);
    ok = false;
  } else {
    console.log("OK:", file);
  }
}

if (!ok) {
  process.exit(1);
}

console.log("SHEIKHA MASTER BLUEPRINT VALIDATED");
