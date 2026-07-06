'use strict';

const {
  buildKnowledgeGraphFromTemplate,
  edge
} = require('../core/universal-knowledge-graph/sheikha-universal-knowledge-graph-v9');

describe('Sheikha Universal Knowledge Graph V9', () => {
  test('builds universal graph from template expansion', () => {
    const graph = buildKnowledgeGraphFromTemplate({
      name: 'Graph PostgreSQL Federation',
      family: 'PostgreSQL Family',
      blueprint: 'PostgreSQL',
      version: '1.0.0'
    });

    expect(graph.system).toBe('SHEIKHA_UNIVERSAL_KNOWLEDGE_GRAPH_V9');
    expect(graph.status).toBe('ACTIVE');
    expect(graph.safety.noHarm).toBe(true);
    expect(graph.summary.nodes).toBeGreaterThan(5);
    expect(graph.edges.map((item) => item.type)).toContain('PROVIDES');
  });

  test('blocks unknown relation type', () => {
    expect(() => edge('a', 'b', 'UNKNOWN')).toThrow('UNKNOWN_RELATION_TYPE');
  });
});
