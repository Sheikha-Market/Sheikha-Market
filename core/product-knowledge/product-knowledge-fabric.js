'use strict';

const productKnowledgeFabric = Object.freeze({
  system: 'SHEIKHA_PRODUCT_KNOWLEDGE_FABRIC_V1',
  status: 'ACTIVE',
  purpose:
    'Organize product identity, specifications, quality, price, usage, standards, risks, suppliers, and value for governed commerce.',
  domains: [
    'product-definition',
    'classification',
    'specifications',
    'quality',
    'pricing',
    'usage',
    'standards',
    'risk',
    'supplier',
    'value'
  ],
  requiredFields: [
    'name',
    'category',
    'description',
    'usage',
    'specifications',
    'quality',
    'price',
    'supplier',
    'risk',
    'standards'
  ]
});

function getProductKnowledgeFabric() {
  return productKnowledgeFabric;
}

function normalizeProduct(product = {}) {
  return {
    id: product.id || `product-${Date.now()}`,
    name: product.name || 'Unnamed Product',
    category: product.category || 'general',
    description: product.description || '',
    usage: product.usage || [],
    specifications: product.specifications || {},
    quality: {
      grade: product.quality?.grade || 'UNVERIFIED',
      score: Number(product.quality?.score || 0),
      inspectionRequired: product.quality?.inspectionRequired !== false
    },
    price: {
      amount: Number(product.price?.amount || 0),
      currency: product.price?.currency || 'SAR',
      pricingStatus: product.price?.amount ? 'DEFINED' : 'MISSING'
    },
    supplier: product.supplier || {},
    standards: product.standards || [],
    risk: product.risk || { level: 'UNKNOWN', notes: [] },
    value: {
      score: Number(product.value?.score || 0),
      notes: product.value?.notes || []
    }
  };
}

function validateProduct(product = {}) {
  const normalized = normalizeProduct(product);
  const missing = [];

  if (!normalized.name || normalized.name === 'Unnamed Product') missing.push('name');
  if (!normalized.description) missing.push('description');
  if (!Object.keys(normalized.specifications).length) missing.push('specifications');
  if (!normalized.standards.length) missing.push('standards');
  if (!normalized.price.amount) missing.push('price.amount');

  return {
    valid: missing.length === 0,
    missing,
    normalized,
    qualityGate:
      normalized.quality.score >= 70 &&
      normalized.price.amount > 0 &&
      normalized.risk.level !== 'HIGH'
  };
}

module.exports = {
  getProductKnowledgeFabric,
  normalizeProduct,
  validateProduct
};
