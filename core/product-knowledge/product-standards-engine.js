'use strict';

function evaluateProductStandards(product = {}) {
  const standards = Array.isArray(product.standards) ? product.standards : [];

  return {
    system: 'SHEIKHA_PRODUCT_STANDARDS_ENGINE_V1',
    status: standards.length ? 'DEFINED' : 'MISSING',
    standards,
    standardsValid: standards.length > 0,
    recommendation: standards.length
      ? 'Standards are linked.'
      : 'Add applicable standards such as internal inspection, SASO, ISO, ASTM, API, or customer specifications where relevant.'
  };
}

module.exports = { evaluateProductStandards };
