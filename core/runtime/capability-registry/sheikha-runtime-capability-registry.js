const { buildRuntimeRegistry } = require("../registry-manager/sheikha-runtime-registry-manager");

function inferCapabilities(item) {
  const text = `${item.system || ""} ${item.file || ""}`.toLowerCase();
  const caps = new Set();

  if (text.includes("api") || text.includes("route")) caps.add("api");
  if (text.includes("governance")) caps.add("governance");
  if (text.includes("security")) caps.add("security");
  if (text.includes("workflow")) caps.add("workflow");
  if (text.includes("graph")) caps.add("graph");
  if (text.includes("ai") || text.includes("neural") || text.includes("intelligence")) caps.add("ai");
  if (text.includes("storage") || text.includes("data")) caps.add("storage");
  if (text.includes("federation") || text.includes("network")) caps.add("networking");
  if (text.includes("runtime")) caps.add("runtime");
  if (text.includes("kernel")) caps.add("kernel");
  if (text.includes("boot")) caps.add("boot");
  if (text.includes("server") || text.includes("vps")) caps.add("server-plane");

  if (caps.size === 0) caps.add("general");

  return [...caps];
}

function buildCapabilityRegistry(options = {}) {
  const registry = buildRuntimeRegistry(options);
  const capabilities = {};

  for (const item of registry.activeSystems) {
    const caps = inferCapabilities(item);

    for (const cap of caps) {
      if (!capabilities[cap]) capabilities[cap] = [];
      capabilities[cap].push(item);
    }
  }

  return {
    system: "SHEIKHA_RUNTIME_CAPABILITY_REGISTRY",
    status: "ACTIVE",
    mode: "CAPABILITY_BASED_RUNTIME_LOOKUP",
    capabilityTotals: Object.fromEntries(
      Object.entries(capabilities).map(([key, value]) => [key, value.length])
    ),
    capabilities,
    plugins: {
      supported: true,
      registrationMode: "GOVERNED_RUNTIME_CAPABILITY",
      dynamicPluginsReady: true
    },
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
}

module.exports = {
  buildCapabilityRegistry,
  inferCapabilities
};
