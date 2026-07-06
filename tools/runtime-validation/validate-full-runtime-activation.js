const fs = require("fs");

const requiredFiles = [
  "runtime/runtime-index/sheikha-runtime-index.json",
  "runtime/dependency-genome/sheikha-dependency-genome.json",
  "runtime/topology-graph/sheikha-topology-graph.json",
  "runtime/runtime-observatory/sheikha-runtime-observatory.json",
  "runtime/master-blueprint/sheikha-master-blueprint-engine.json",
  "runtime/capability-genome/sheikha-capability-genome.json",
  "runtime/enterprise-dashboard/sheikha-enterprise-runtime-dashboard.json",
  "runtime/runtime-contract-registry/sheikha-runtime-contract-registry.json",
  "runtime/runtime-health-aggregator/sheikha-runtime-health-aggregator.json",
  "routes/runtime-health/sheikha-runtime-health-routes.js"
];

let failed = false;
const report = {
  system: "SHEIKHA_FULL_RUNTIME_ACTIVATION_VALIDATION",
  status: "ACTIVE",
  checkedAt: new Date().toISOString(),
  files: []
};

for (const file of requiredFiles) {
  const exists = fs.existsSync(file);
  report.files.push({ file, status: exists ? "OK" : "MISSING" });

  if (!exists) {
    console.error("MISSING:", file);
    failed = true;
    continue;
  }

  if (file.endsWith(".json")) {
    try {
      JSON.parse(fs.readFileSync(file, "utf8"));
      console.log("OK JSON:", file);
    } catch (error) {
      console.error("INVALID JSON:", file, error.message);
      failed = true;
    }
  } else {
    console.log("OK FILE:", file);
  }
}

report.result = failed ? "FAILED" : "PASSED";

fs.writeFileSync(
  "reports/master-blueprint/full-runtime-activation-validation.json",
  JSON.stringify(report, null, 2)
);

if (failed) process.exit(1);

console.log("SHEIKHA FULL RUNTIME ACTIVATION VALIDATED");
