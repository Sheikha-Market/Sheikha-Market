'use strict';

const {
  registerFederation,
  registerFamily,
  getFederation,
  buildRegistryGraph
} = require('../core/dynamic-federation-registry/sheikha-dynamic-federation-registry-v1');

describe('Sheikha Dynamic Federation Registry V1', () => {
  test('registers new family and federation automatically', () => {
    const family = registerFamily({
      name: 'QuantumOS Family',
      parent: 'operating-system-federation',
      clusters: ['kernel', 'runtime', 'security']
    });

    const federation = registerFederation({
      type: 'OPERATING_SYSTEM',
      name: 'QuantumOS',
      family: family.id,
      clusters: ['kernel', 'filesystem', 'drivers', 'security'],
      capabilities: ['runtime-hosting', 'governance-observation']
    });

    expect(federation.status).toBe('REGISTERED');
    expect(federation.governance.noHarm).toBe(true);
    expect(federation.relations.map((r) => r.type)).toContain('GOVERNED_BY');
    expect(getFederation(federation.id)).not.toBeNull();
  });

  test('builds registry graph from dynamic registrations', () => {
    const graph = buildRegistryGraph();

    expect(graph.system).toBe('SHEIKHA_DYNAMIC_FEDERATION_REGISTRY_GRAPH_V1');
    expect(graph.status).toBe('ACTIVE');
    expect(graph.nodes.length).toBeGreaterThanOrEqual(1);
  });
});
