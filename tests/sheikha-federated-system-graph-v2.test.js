'use strict';

const {
  buildFederatedSystemGraph
} = require('../core/federated-system-graph/sheikha-federated-system-graph-v2');

describe('Sheikha Federated System Graph V2', () => {
  test('builds a safe directed graph for all federated industrial layers', () => {
    const graph = buildFederatedSystemGraph();
    const ids = graph.nodes.map((node) => node.id);

    expect(graph.system).toBe('SHEIKHA_FEDERATED_SYSTEM_GRAPH_V2');
    expect(graph.mode).toBe('READ_ONLY_FEDERATED_SYSTEM_GRAPH');
    expect(graph.safety.noHarm).toBe(true);
    expect(ids).toContain('hardware-federation');
    expect(ids).toContain('kernel-family-federation');
    expect(ids).toContain('operating-system-federation');
    expect(ids).toContain('runtime-federation');
    expect(ids).toContain('knowledge-federation');
    expect(ids).toContain('governance-federation');
    expect(ids).toContain('global-federation');
    expect(graph.edges.length).toBeGreaterThanOrEqual(16);
    expect(graph.relationTypes).toContain('GOVERNS');
    expect(graph.relationTypes).toContain('FEDERATES_WITH');
  });
});
