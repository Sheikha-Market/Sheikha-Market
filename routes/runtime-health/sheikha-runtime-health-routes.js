const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath);

  if (!fs.existsSync(fullPath)) {
    return {
      status: "MISSING",
      path: relativePath
    };
  }

  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    return {
      status: "INVALID_JSON",
      path: relativePath,
      error: error.message
    };
  }
}

function registerSheikhaRuntimeHealthRoutes(app) {
  app.get("/api/runtime/health", (req, res) => {
    const healthAggregator = readJson(
      "runtime/runtime-health-aggregator/sheikha-runtime-health-aggregator.json"
    );

    const contractRegistry = readJson(
      "runtime/runtime-contract-registry/sheikha-runtime-contract-registry.json"
    );

    const masterBlueprint = readJson(
      "runtime/master-blueprint/sheikha-master-blueprint-engine.json"
    );

    const enterpriseDashboard = readJson(
      "runtime/enterprise-dashboard/sheikha-enterprise-runtime-dashboard.json"
    );

    const runtimeIndex = readJson(
      "runtime/runtime-index/sheikha-runtime-index.json"
    );

    res.json({
      system: "SHEIKHA_RUNTIME_HEALTH_API_OMEGA",
      status: "ACTIVE",
      health: healthAggregator,
      contracts: contractRegistry,
      blueprint: masterBlueprint,
      dashboard: enterpriseDashboard,
      runtime_index: runtimeIndex,
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = {
  registerSheikhaRuntimeHealthRoutes
};
