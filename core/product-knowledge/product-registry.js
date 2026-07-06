'use strict';

const {
  readProducts,
  upsertProduct
} = require('./product-persistent-store');

const products = new Map();

function registerProduct(product = {}) {
  const id = product.id || `product-${Date.now()}`;

  const record = {
    id,
    name: product.name || 'Unnamed Product',
    category: product.category || 'general',
    description: product.description || '',
    status: product.status || 'DRAFT',
    version: product.version || '1.0.0',
    lifecycle: {
      ...(product.lifecycle || {}),
      version: product.version || product.lifecycle?.version || '1.0.0'
    },
    owner: product.owner || 'Sheikha Product Knowledge',
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    product
  };

  products.set(id, record);
  upsertProduct(record);
  return record;
}

function getProductById(id) {
  return products.get(id) || readProducts().find((record) => record.id === id) || null;
}

function listProducts() {
  const persisted = readProducts();
  const merged = new Map(persisted.map((record) => [record.id, record]));

  for (const record of products.values()) {
    merged.set(record.id, record);
  }

  return Array.from(merged.values());
}

module.exports = {
  registerProduct,
  getProductById,
  listProducts
};
