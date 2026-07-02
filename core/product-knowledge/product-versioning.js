'use strict';

function bumpPatchVersion(version = '1.0.0') {
  const parts = String(version).split('.').map((part) => Number(part || 0));
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.join('.');
}

function createProductVersion(currentRecord = {}, patch = {}) {
  const currentVersion =
    currentRecord.version ||
    currentRecord.lifecycle?.version ||
    currentRecord.product?.version ||
    '1.0.0';

  const nextVersion = patch.version || bumpPatchVersion(currentVersion);

  const {
    actor,
    reason,
    product: patchProduct,
    lifecycle: patchLifecycle,
    ...safePatch
  } = patch || {};

  return {
    ...currentRecord,
    ...safePatch,
    version: nextVersion,
    updatedAt: new Date().toISOString(),
    lifecycle: {
      ...(currentRecord.lifecycle || {}),
      ...(patchLifecycle || {}),
      version: nextVersion
    },
    product: {
      ...(currentRecord.product || {}),
      ...(patchProduct || {}),
      version: nextVersion
    }
  };
}

module.exports = {
  bumpPatchVersion,
  createProductVersion
};
