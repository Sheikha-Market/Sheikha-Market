'use strict';

const {
  findCapability,
  buildCapabilityGraph,
  queryCompatibility,
  evaluateCompatibility
} = require('../core/capability-compatibility/sheikha-capability-compatibility-v1');

describe('Sheikha Capability Registry and Compatibility Matrix V1', () => {
  test('finds reusable capability', () => {
    const capability = findCapability('storage');
    expect(capability).not.toBeNull();
    expect(capability.reusable).toBe(true);
  });

  test('builds capability graph for federation', () => {
    const graph = buildCapabilityGraph({
      id: 'postgresql-federation',
      name: 'PostgreSQL Federation',
      capabilities: ['storage', 'query', 'backup']
    });

    expect(graph.system).toBe('SHEIKHA_CAPABILITY_GRAPH_V1');
    expect(graph.summary.capabilities).toBe(3);
    expect(graph.edges.map((edge) => edge.type)).toContain('PROVIDES');
  });

  test('queries compatibility matrix', () => {
    const relations = queryCompatibility('linux-family');
    expect(relations.length).toBeGreaterThan(0);
  });

  test('evaluates known compatibility safely', () => {
    const result = evaluateCompatibility('postgresql-federation', 'linux-family');
    expect(result.status).toBe('COMPATIBLE');
    expect(result.safety.noHarm).toBe(true);
    expect(result.safety.advisoryOnly).toBe(true);
  });
});
