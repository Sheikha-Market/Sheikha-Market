'use strict';

const OPERATIONAL_FIELDS = new Set([
  'actor',
  'reason'
]);

function bumpPatchVersion(version = '1.0.0') {
  const parts = String(version).split('.').map((part) => Number(part || 0));
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.join('.');
}

function cleanPatch(patch = {}) {
  const productPatch = patch.product && typeof patch.product === 'object'
    ? patch.product
    : patch;

  return Object.fromEntries(
    Object.entries(productPatch).filter(([key]) => !OPERATIONAL_FIELDS.has(key))
  );
}

function readProductVersion(record = {}) {
  return record.version ||
    record.product?.version ||
    record.product?.lifecycle?.version ||
    '1.0.0';
}

function createProductVersion(currentRecord = {}, patch = {}) {
  const currentProduct = currentRecord.product || currentRecord || {};
  const productPatch = cleanPatch(patch);
  const nextVersion = productPatch.version || patch.version || bumpPatchVersion(readProductVersion(currentRecord));
  const now = new Date().toISOString();

  return {
    ...currentProduct,
    ...productPatch,
    id: currentRecord.id || currentProduct.id,
    name: productPatch.name || currentRecord.name || currentProduct.name || 'Unnamed Product',
    category: productPatch.category || currentRecord.category || currentProduct.category || 'general',
    status: productPatch.status || currentRecord.status || currentProduct.status || 'DRAFT',
    version: nextVersion,
    createdAt: currentRecord.createdAt || currentProduct.createdAt || now,
    updatedAt: now,
    lifecycle: {
      ...(currentProduct.lifecycle || {}),
      ...(productPatch.lifecycle || {}),
      version: nextVersion
    }
  };
}

module.exports = {
  bumpPatchVersion,
  cleanPatch,
  createProductVersion,
  readProductVersion
};
