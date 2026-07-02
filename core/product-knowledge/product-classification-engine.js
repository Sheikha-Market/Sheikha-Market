'use strict';

const categories = Object.freeze({
  metals: ['scrap', 'copper', 'steel', 'aluminum', 'stainless', 'precious-metals'],
  industrial: ['equipment', 'machinery', 'tools', 'spare-parts'],
  construction: ['cement', 'steel-rebar', 'pipes', 'insulation'],
  energy: ['oil-gas', 'electricity', 'solar', 'battery'],
  general: ['uncategorized']
});

function classifyProduct(product = {}) {
  const category = product.category || 'general';
  const name = String(product.name || '').toLowerCase();

  let detected = category;

  if (/copper|نحاس/.test(name)) detected = 'metals';
  if (/steel|حديد|scrap|سكراب/.test(name)) detected = 'metals';
  if (/pipe|أنبوب|pipes/.test(name)) detected = 'construction';
  if (/solar|battery|energy|طاقة/.test(name)) detected = 'energy';

  return {
    system: 'SHEIKHA_PRODUCT_CLASSIFICATION_ENGINE_V1',
    status: 'CLASSIFIED',
    inputCategory: category,
    detectedCategory: detected,
    allowedGroups: categories[detected] || categories.general,
    confidence: detected === category ? 90 : 75
  };
}

module.exports = {
  classifyProduct,
  categories
};
