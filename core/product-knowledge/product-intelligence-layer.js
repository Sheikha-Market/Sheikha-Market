'use strict';

function clampScore(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function calculateCompletenessScore(product = {}) {
  const required = [
    'name',
    'category',
    'description',
    'specifications',
    'standards',
    'price',
    'quality',
    'risk'
  ];

  const completed = required.filter((field) => {
    const value = product[field];
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return Boolean(value);
  }).length;

  return Math.round((completed / required.length) * 100);
}

function evaluateProductIntelligence(product = {}, context = {}) {
  const qualityScore = clampScore(product.quality?.score || 0);
  const completenessScore = calculateCompletenessScore(product);
  const riskScore = product.risk?.level === 'HIGH' ? 30 : product.risk?.level === 'MEDIUM' ? 65 : 90;
  const governanceScore = context.governancePassed === false ? 40 : 100;
  const lifecycleHealth =
    ['APPROVED', 'PUBLISHED'].includes(product.status || product.lifecycle?.status) ? 100 :
    product.status === 'PENDING_REVIEW' ? 70 :
    55;

  const marketReadiness = Math.round(
    (qualityScore + completenessScore + riskScore + governanceScore + lifecycleHealth) / 5
  );

  return {
    system: 'SHEIKHA_ENTERPRISE_PRODUCT_INTELLIGENCE_LAYER_V1',
    status: marketReadiness >= 80 ? 'READY' : marketReadiness >= 60 ? 'NEEDS_REVIEW' : 'NOT_READY',
    scores: {
      qualityScore,
      completenessScore,
      riskScore,
      governanceScore,
      lifecycleHealth,
      marketReadiness
    },
    recommendation:
      marketReadiness >= 80
        ? 'Product is ready for governed enterprise usage.'
        : 'Product requires improvement before enterprise publishing.'
  };
}

module.exports = {
  calculateCompletenessScore,
  evaluateProductIntelligence
};
