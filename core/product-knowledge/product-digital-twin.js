'use strict';

const { getProductById } = require('./product-registry');
const { getProductAuditTrail } = require('./product-audit-trail');
const { listProductEvents } = require('./product-event-bus');
const { buildProductGraph } = require('./product-graph');
const { evaluateProductIntelligence } = require('./product-intelligence-layer');
const { runProductGovernancePipeline } = require('./product-governance-pipeline');


function calculateTwinHealth({ governance, intelligence, auditTrail, events, graph }) {
  const governanceScore = governance.passed ? 100 : 50;
  const intelligenceScore = intelligence.scores?.marketReadiness || 0;
  const auditScore = auditTrail.length > 0 ? 100 : 70;
  const eventScore = events.length > 0 ? 100 : 70;
  const graphScore = graph.summary?.nodes > 0 ? 100 : 60;

  const score = Math.round(
    (governanceScore + intelligenceScore + auditScore + eventScore + graphScore) / 5
  );

  return {
    score,
    rating: score >= 90 ? 'EXCELLENT' : score >= 75 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
    components: {
      governanceScore,
      intelligenceScore,
      auditScore,
      eventScore,
      graphScore
    }
  };
}

function buildTwinTimeline(auditTrail = [], events = []) {
  return [
    ...auditTrail.map((item) => ({
      type: 'AUDIT',
      action: item.action,
      timestamp: item.timestamp,
      source: item
    })),
    ...events.map((item) => ({
      type: 'EVENT',
      action: item.type,
      timestamp: item.timestamp,
      source: item
    }))
  ].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
}

function buildCapabilityProfile(product = {}) {
  return {
    category: product.category || 'general',
    usage: product.usage || [],
    standards: product.standards || [],
    hasPricing: Number(product.price?.amount || 0) > 0,
    hasQualityScore: Number(product.quality?.score || 0) > 0,
    riskLevel: product.risk?.level || 'UNKNOWN'
  };
}


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

  const auditTrail = getProductAuditTrail(productId);
  const events = listProductEvents({ productId });
  const graph = buildProductGraph([record]);
  const health = calculateTwinHealth({ governance, intelligence, auditTrail, events, graph });

  return {
    system: 'SHEIKHA_PRODUCT_DIGITAL_TWIN_V2',
    status: 'ACTIVE',
    productId,
    record,
    product,
    lifecycle: record.lifecycle || product.lifecycle || { status: record.status || 'DRAFT' },
    governance,
    intelligence,
    health,
    excellenceRating: health.rating,
    capabilityProfile: buildCapabilityProfile(product),
    dependencySummary: {
      graphNodes: graph.summary?.nodes || 0,
      graphEdges: graph.summary?.edges || 0
    },
    timeline: buildTwinTimeline(auditTrail, events),
    auditTrail,
    events,
    graph,
    noHarm: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  buildProductDigitalTwin,
  calculateTwinHealth,
  buildTwinTimeline,
  buildCapabilityProfile
};
