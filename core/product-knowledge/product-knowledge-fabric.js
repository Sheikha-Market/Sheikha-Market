'use strict';

const productKnowledgeFabric = Object.freeze({
  system: 'SHEIKHA_PRODUCT_KNOWLEDGE_FABRIC_V2',
  status: 'ACTIVE',
  purpose:
    'Govern product identity, classification, specifications, quality, standards, pricing, usage, suppliers, risks, compliance, lifecycle, and value.',
  domains: [
    'identity',
    'classification',
    'specifications',
    'quality',
    'standards',
    'pricing',
    'usage',
    'supplier',
    'risk',
    'compliance',
    'lifecycle',
    'value'
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
    usage: Array.isArray(product.usage) ? product.usage : [],
    specifications: product.specifications || {},
    standards: Array.isArray(product.standards) ? product.standards : [],
    compliance: product.compliance || { status: 'UNVERIFIED', notes: [] },
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
    risk: product.risk || { level: 'UNKNOWN', notes: [] },
    lifecycle: product.lifecycle || { status: 'DRAFT', version: '1.0.0' },
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
