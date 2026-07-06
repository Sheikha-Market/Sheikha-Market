const { discoverRuntimeDefinitions } = require("../discovery-engine/sheikha-runtime-discovery-engine");

function classifyRuntime(item) {
  const text = `${item.file || ""} ${item.system || ""}`.toLowerCase();

  if (text.includes("kernel")) return "kernel";
  if (text.includes("bootstrap") || text.includes("boot")) return "boot";
  if (text.includes("governance")) return "governance";
  if (text.includes("security")) return "security";
  if (text.includes("api") || text.includes("routes")) return "api";
  if (text.includes("ai") || text.includes("neural") || text.includes("intelligence")) return "ai";
  if (text.includes("storage") || text.includes("data")) return "storage";
  if (text.includes("network") || text.includes("federation")) return "networking";
  if (text.includes("workflow")) return "workflow";
  if (text.includes("graph")) return "graph";
  if (text.includes("runtime")) return "runtime";
  if (text.includes("platform")) return "platform";
  if (text.includes("extension")) return "extension";

  return "general";
}

function buildRuntimeRegistry(options = {}) {
  const discovery = discoverRuntimeDefinitions(options);

  const registry = {
    system: "SHEIKHA_RUNTIME_REGISTRY_MANAGER",
    status: "ACTIVE",
    mode: "DISCOVERY_BACKED_RUNTIME_REGISTRY",
    totals: discovery.totals,
    categories: {},
    activeSystems: [],
    invalidFiles: [],
    governance: {
      readOnly: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };

  for (const item of discovery.definitions) {
    const category = classifyRuntime(item);

    if (!registry.categories[category]) {
      registry.categories[category] = [];
    }

    registry.categories[category].push(item);

    if (item.active && item.system) {
      registry.activeSystems.push({
        system: item.system,
        file: item.file,
        category,
        version: item.version,
        maturity: item.maturity
      });
    }

    if (item.error) {
      registry.invalidFiles.push({
        file: item.file,
        error: item.error
      });
    }
  }

  registry.categoryTotals = Object.fromEntries(
    Object.entries(registry.categories).map(([key, value]) => [key, value.length])
  );

  registry.readiness = {
    registryBuilt: true,
    activeSystems: registry.activeSystems.length,
    invalidFiles: registry.invalidFiles.length,
    overall: registry.invalidFiles.length === 0
      ? "RUNTIME_REGISTRY_READY"
      : "RUNTIME_REGISTRY_READY_WITH_INVALID_FILES"
  };

  return registry;
}

module.exports = {
  buildRuntimeRegistry,
  classifyRuntime
};
