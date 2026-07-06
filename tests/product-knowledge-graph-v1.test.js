'use strict';

const { buildProductGraph } = require('../core/product-knowledge/product-graph');

describe('Sheikha Enterprise Product Knowledge Graph V1', () => {
  test('builds product graph nodes and edges', () => {
    const graph = buildProductGraph([
      {
        id: 'graph-copper-cable',
        name: 'Copper Cable',
        category: 'metals',
        status: 'APPROVED',
        product: {
          price: { currency: 'SAR' },
          risk: { level: 'LOW' },
          standards: ['internal-inspection-required']
        }
      }
    ]);

    expect(graph.system).toBe('SHEIKHA_ENTERPRISE_PRODUCT_KNOWLEDGE_GRAPH_V1');
    expect(graph.status).toBe('ACTIVE');
    expect(graph.summary.products).toBe(1);
    expect(graph.nodes.length).toBeGreaterThanOrEqual(4);
    expect(graph.edges.map((edge) => edge.type)).toContain('BELONGS_TO');
    expect(graph.edges.map((edge) => edge.type)).toContain('FOLLOWS_STANDARD');
  });
});
