'use strict';

function evaluateProductPricing(product = {}) {
  const price = product.price || {};
  const amount = Number(price.amount || 0);
  const currency = price.currency || 'SAR';

  return {
    system: 'SHEIKHA_PRODUCT_PRICING_ENGINE_V1',
    status: amount > 0 ? 'DEFINED' : 'MISSING',
    amount,
    currency,
    pricingValid: amount > 0,
    recommendation: amount > 0 ? 'Price is defined.' : 'Add product price before commercial approval.'
  };
}

module.exports = { evaluateProductPricing };
