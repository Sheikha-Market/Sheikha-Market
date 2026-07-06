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

function omitOperationalFields(source = {}) {
  return Object.fromEntries(
    Object.entries(source || {}).filter(([key]) => !OPERATIONAL_FIELDS.has(key))
  );
}

function cleanPatch(patch = {}) {
  const safeTopLevelPatch = omitOperationalFields(patch);
  const patchProduct = patch.product && typeof patch.product === 'object'
    ? omitOperationalFields(patch.product)
    : {};

  delete safeTopLevelPatch.product;

  const merged = {
    ...safeTopLevelPatch,
    ...patchProduct
  };

  if (patch.lifecycle || patchProduct.lifecycle) {
    merged.lifecycle = {
      ...(patch.lifecycle || {}),
      ...(patchProduct.lifecycle || {})
    };
  }

  return merged;
}

function readProductVersion(record = {}) {
  return record.version ||
    record.lifecycle?.version ||
    record.product?.version ||
    record.product?.lifecycle?.version ||
    '1.0.0';
}

function createProductVersion(currentRecord = {}, patch = {}) {
  const currentProduct = currentRecord.product || currentRecord || {};
  const productPatch = cleanPatch(patch);
  const explicitVersion = patch.version || patch.product?.version;
  const nextVersion = explicitVersion || bumpPatchVersion(readProductVersion(currentRecord));
  const now = new Date().toISOString();

  delete productPatch.version;

  const mergedProduct = {
    ...currentProduct,
    ...productPatch
  };

  return {
    ...mergedProduct,
    id: currentRecord.id || mergedProduct.id,
    name: mergedProduct.name || currentRecord.name || currentProduct.name || 'Unnamed Product',
    category: mergedProduct.category || currentRecord.category || currentProduct.category || 'general',
    description: mergedProduct.description ?? currentRecord.description ?? currentProduct.description,
    status: mergedProduct.status || currentRecord.status || currentProduct.status || 'DRAFT',
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
