const { loadUnifiedGraphFabric } =
require('../../runtime/unified-graph/sheikha-unified-graph-runtime');

describe('Sheikha Unified Graph Fabric V1', () => {
  test('loads unified graph fabric', () => {
    const graph = loadUnifiedGraphFabric();

    expect(graph.status).toBe('ACTIVE');
    expect(graph.graphs).toContain('FEDERATION_GRAPH');
    expect(graph.graphs).toContain('SUPPLY_CHAIN_GRAPH');
    expect(graph.graphs.length).toBeGreaterThanOrEqual(10);
  });
});
