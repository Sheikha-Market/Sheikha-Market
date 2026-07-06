'use strict';

function evaluateProductQuality(product = {}) {
  const quality = product.quality || {};
  const score = Number(quality.score || 0);
  const riskLevel = product.risk?.level || 'UNKNOWN';

  return {
    system: 'SHEIKHA_PRODUCT_QUALITY_ENGINE_V1',
    status: 'EVALUATED',
    score,
    grade:
      score >= 90 ? 'A' :
      score >= 80 ? 'B' :
      score >= 70 ? 'C' :
      'REVIEW_REQUIRED',
    inspectionRequired: quality.inspectionRequired !== false,
    passed: score >= 70 && riskLevel !== 'HIGH',
    riskLevel
  };
}

module.exports = { evaluateProductQuality };
