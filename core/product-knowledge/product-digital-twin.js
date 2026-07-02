'use strict';

const { getProductById } = require('./product-registry');
const { getProductAuditTrail } = require('./product-audit-trail');
const { listProductEvents } = require('./product-event-bus');
const { buildProductGraph } = require('./product-graph');
const { evaluateProductIntelligence } = require('./product-intelligence-layer');
const { runProductGovernancePipeline } = require('./product-governance-pipeline');

function buildProductDigitalTwin(productId, allProducts = []) {
  const record = getProductById(productId);

  if (!record) {
    return {
      system: 'SHEIKHA_PRODUCT_DIGITAL_TWIN_V1',
      status: 'NOT_FOUND',
      productId
    };
  }

  const product = record.product || record;
  const governance = runProductGovernancePipeline(product, allProducts, { force: true });
  const intelligence = evaluateProductIntelligence(product, {
    governancePassed: governance.passed
  });

  return {
    system: 'SHEIKHA_PRODUCT_DIGITAL_TWIN_V1',
    status: 'ACTIVE',
    productId,
    record,
    product,
    lifecycle: record.lifecycle || product.lifecycle || { status: record.status || 'DRAFT' },
    governance,
    intelligence,
    auditTrail: getProductAuditTrail(productId),
    events: listProductEvents({ productId }),
    graph: buildProductGraph([record]),
    noHarm: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  buildProductDigitalTwin
};
