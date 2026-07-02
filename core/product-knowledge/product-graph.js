'use strict';

function buildProductGraph(products = []) {
  const nodes = [];
  const edges = [];

  for (const record of products) {
    const product = record.product || record;

    nodes.push({
      id: record.id,
      type: 'product',
      label: record.name || product.name || 'Unnamed Product',
      category: record.category || product.category || 'general',
      status: record.status || product.status || 'DRAFT'
    });

    const categoryId = `category:${record.category || product.category || 'general'}`;
    nodes.push({
      id: categoryId,
      type: 'category',
      label: record.category || product.category || 'general'
    });

    edges.push({
      from: record.id,
      to: categoryId,
      type: 'BELONGS_TO'
    });

    if (product.price?.currency) {
      const currencyId = `currency:${product.price.currency}`;
      nodes.push({ id: currencyId, type: 'currency', label: product.price.currency });
      edges.push({ from: record.id, to: currencyId, type: 'PRICED_IN' });
    }

    if (product.risk?.level) {
      const riskId = `risk:${product.risk.level}`;
      nodes.push({ id: riskId, type: 'risk', label: product.risk.level });
      edges.push({ from: record.id, to: riskId, type: 'HAS_RISK' });
    }

    for (const standard of product.standards || []) {
      const standardId = `standard:${standard}`;
      nodes.push({ id: standardId, type: 'standard', label: standard });
      edges.push({ from: record.id, to: standardId, type: 'FOLLOWS_STANDARD' });
    }
  }

  const uniqueNodes = Array.from(new Map(nodes.map((node) => [node.id, node])).values());

  return {
    system: 'SHEIKHA_ENTERPRISE_PRODUCT_KNOWLEDGE_GRAPH_V1',
    status: 'ACTIVE',
    nodes: uniqueNodes,
    edges,
    summary: {
      products: products.length,
      nodes: uniqueNodes.length,
      edges: edges.length
    }
  };
}

module.exports = { buildProductGraph };
