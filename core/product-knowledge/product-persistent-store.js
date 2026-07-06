'use strict';

const fs = require('fs');
const path = require('path');

const storePath = path.join(process.cwd(), 'data', 'product-knowledge-catalog.json');

function ensureStore() {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ products: [] }, null, 2));
  }
}

function readProducts() {
  ensureStore();

  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    return Array.isArray(parsed.products) ? parsed.products : [];
  } catch (error) {
    return [];
  }
}

function writeProducts(products = []) {
  ensureStore();
  fs.writeFileSync(storePath, JSON.stringify({ products }, null, 2));
  return products;
}

function upsertProduct(record) {
  const products = readProducts();
  const index = products.findIndex((item) => item.id === record.id);

  if (index >= 0) {
    products[index] = record;
  } else {
    products.push(record);
  }

  writeProducts(products);
  return record;
}

module.exports = {
  storePath,
  readProducts,
  writeProducts,
  upsertProduct
};
