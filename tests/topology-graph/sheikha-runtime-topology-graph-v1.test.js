const {
  createRuntimeTopologyGraph
} = require('../../runtime/topology-graph/sheikha-runtime-topology-graph');

describe('Sheikha Runtime Topology Graph V1', () => {
  test('creates runtime topology graph', () => {
    const graph = createRuntimeTopologyGraph();

    expect(graph.status).toBe('ACTIVE');
    expect(graph.nodes).toContain('route');
    expect(graph.nodes).toContain('dependency');
    expect(graph.edges).toContain('module-to-test');
  });
});
