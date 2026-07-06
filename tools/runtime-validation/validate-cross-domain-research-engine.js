const fs = require("fs");

const file = "runtime/cross-domain-research/sheikha-cross-domain-research-engine.json";

const requiredTop = [
  "system",
  "version",
  "status",
  "purpose",
  "supported_domains",
  "core_capabilities",
  "comparison_axes",
  "study_lifecycle",
  "outputs",
  "governance",
  "maturity"
];

const requiredCapabilities = [
  "constant_variable_detection",
  "cross_domain_comparison",
  "similarity_detection",
  "difference_detection",
  "continuous_observation",
  "root_cause_analysis",
  "pattern_discovery",
  "research_knowledge_generation",
  "application_translation",
  "commercialization_pathway",
  "continuous_improvement"
];

let failed = false;

if (!fs.existsSync(file)) {
  console.error("MISSING:", file);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));

for (const key of requiredTop) {
  if (!(key in data)) {
    console.error("MISSING TOP FIELD:", key);
    failed = true;
  }
}

for (const key of requiredCapabilities) {
  if (data.core_capabilities?.[key] !== "ACTIVE") {
    console.error("CAPABILITY NOT ACTIVE:", key);
    failed = true;
  }
}

if (!Array.isArray(data.supported_domains) || data.supported_domains.length < 20) {
  console.error("INSUFFICIENT SUPPORTED DOMAINS");
  failed = true;
}

if (!Array.isArray(data.study_lifecycle) || !data.study_lifecycle.includes("productization")) {
  console.error("MISSING PRODUCTIZATION LIFECYCLE");
  failed = true;
}

if (data.governance?.evidence_required !== true || data.governance?.no_harm !== true) {
  console.error("GOVERNANCE RULES INCOMPLETE");
  failed = true;
}

if (failed) process.exit(1);

console.log("SHEIKHA CROSS DOMAIN RESEARCH ENGINE VALIDATED");
