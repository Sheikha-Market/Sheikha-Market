'use strict';

const products = new Map();

function registerProduct(product = {}) {
  const id = product.id || `product-${Date.now()}`;

  const record = {
    id,
    name: product.name || 'Unnamed Product',
    category: product.category || 'general',
    status: product.status || 'DRAFT',
    version: product.version || '1.0.0',
    owner: product.owner || 'Sheikha Product Knowledge',
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    product
  };

  products.set(id, record);
  return record;
}

function getProductById(id) {
  return products.get(id) || null;
}

function listProducts() {
  return Array.from(products.values());
}

module.exports = {
  registerProduct,
  getProductById,
  listProducts
};
