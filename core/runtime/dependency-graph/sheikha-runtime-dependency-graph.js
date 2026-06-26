const { buildRuntimeRegistry } = require("../registry-manager/sheikha-runtime-registry-manager");

const CORE_DEPENDENCIES = {
  boot: ["kernel"],
  kernel: ["runtime"],
  governance: ["kernel"],
  security: ["kernel", "governance"],
  api: ["runtime", "security"],
  ai: ["runtime", "governance"],
  storage: ["runtime", "security"],
  networking: ["runtime", "security"],
  workflow: ["runtime", "governance"],
  graph: ["runtime", "workflow"],
  platform: ["runtime", "api"],
  extension: ["platform", "api"],
  general: ["runtime"],
  runtime: []
};

function buildDependencyGraph(options = {}) {
  const registry = buildRuntimeRegistry(options);
  const categories = Object.keys(registry.categories);

  const nodes = categories.map((category) => ({
    id: category,
    count: registry.categories[category].length,
    activeCount: registry.categories[category].filter((item) => item.active).length,
    dependsOn: CORE_DEPENDENCIES[category] || ["runtime"]
  }));

  const edges = [];

  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      if (categories.includes(dep)) {
        edges.push({
          from: dep,
          to: node.id
        });
      }
    }
  }

  const missingDependencies = nodes.flatMap((node) =>
    node.dependsOn
      .filter((dep) => !categories.includes(dep))
      .map((dep) => ({ node: node.id, missing: dep }))
  );

  return {
    system: "SHEIKHA_RUNTIME_DEPENDENCY_GRAPH",
    status: "ACTIVE",
    mode: "REGISTRY_BACKED_DEPENDENCY_GRAPH",
    nodes,
    edges,
    missingDependencies,
    readiness: {
      graphBuilt: true,
      nodes: nodes.length,
      edges: edges.length,
      missingDependencies: missingDependencies.length,
      overall: missingDependencies.length === 0
        ? "RUNTIME_DEPENDENCY_GRAPH_READY"
        : "RUNTIME_DEPENDENCY_GRAPH_READY_WITH_MISSING_DEPENDENCIES"
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
  buildDependencyGraph,
  CORE_DEPENDENCIES
};
