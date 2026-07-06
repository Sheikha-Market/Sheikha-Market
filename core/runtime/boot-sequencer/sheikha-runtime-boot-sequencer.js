const { buildDependencyGraph } = require("../dependency-graph/sheikha-runtime-dependency-graph");

function buildBootSequence(options = {}) {
  const graph = buildDependencyGraph(options);
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const incoming = new Map();
  const outgoing = new Map();

  for (const node of graph.nodes) {
    incoming.set(node.id, 0);
    outgoing.set(node.id, []);
  }

  for (const edge of graph.edges) {
    incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
    outgoing.get(edge.from)?.push(edge.to);
  }

  const queue = [...incoming.entries()]
    .filter(([, count]) => count === 0)
    .map(([id]) => id)
    .sort();

  const sequence = [];

  while (queue.length > 0) {
    const current = queue.shift();
    const node = nodes.get(current);

    sequence.push({
      id: current,
      count: node?.count || 0,
      activeCount: node?.activeCount || 0,
      phase: sequence.length + 1
    });

    for (const next of outgoing.get(current) || []) {
      incoming.set(next, incoming.get(next) - 1);
      if (incoming.get(next) === 0) {
        queue.push(next);
        queue.sort();
      }
    }
  }

  const cycleDetected = sequence.length !== graph.nodes.length;

  return {
    system: "SHEIKHA_RUNTIME_BOOT_SEQUENCER",
    status: cycleDetected ? "BLOCKED" : "ACTIVE",
    mode: "DEPENDENCY_GRAPH_BOOT_ORDER",
    sequence,
    cycleDetected,
    readiness: {
      sequenceBuilt: !cycleDetected,
      phases: sequence.length,
      totalNodes: graph.nodes.length,
      overall: cycleDetected
        ? "BOOT_SEQUENCE_BLOCKED_BY_CYCLE"
        : "BOOT_SEQUENCE_READY"
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
  buildBootSequence
};
