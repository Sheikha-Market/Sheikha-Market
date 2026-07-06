'use strict';

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, ' ')
    .trim();
}

function tokenSet(value = '') {
  return new Set(normalizeText(value).split(/\s+/).filter(Boolean));
}

function jaccardSimilarity(a = '', b = '') {
  const left = tokenSet(a);
  const right = tokenSet(b);

  if (!left.size && !right.size) return 1;

  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;

  return union ? intersection / union : 0;
}

function detectProductDuplicates(candidate = {}, products = [], threshold = 0.75) {
  const candidateText = [
    candidate.name,
    candidate.category,
    candidate.description,
    JSON.stringify(candidate.specifications || {})
  ].join(' ');

  const matches = products
    .map((record) => {
      const product = record.product || record;
      const recordText = [
        record.name || product.name,
        record.category || product.category,
        record.description || product.description,
        JSON.stringify(product.specifications || {})
      ].join(' ');

      const similarity = jaccardSimilarity(candidateText, recordText);

      return {
        id: record.id,
        name: record.name || product.name,
        category: record.category || product.category,
        similarity: Number((similarity * 100).toFixed(2)),
        duplicate: similarity >= threshold
      };
    })
    .filter((match) => match.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity);

  return {
    system: 'SHEIKHA_PRODUCT_DUPLICATE_DETECTION_ENGINE_V1',
    status: matches.some((match) => match.duplicate) ? 'DUPLICATE_SUSPECTED' : 'CLEAR',
    threshold: Number((threshold * 100).toFixed(2)),
    matches,
    duplicateSuspected: matches.some((match) => match.duplicate)
  };
}

module.exports = {
  normalizeText,
  jaccardSimilarity,
  detectProductDuplicates
};
