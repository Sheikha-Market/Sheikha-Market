'use strict';

const ugoSchema = Object.freeze({
  fieldCount: 40,
  fields: [
    'id',
    'type',
    'identity',
    'owner',
    'rights',
    'source',
    'provenance',
    'jurisdiction',
    'classification',
    'lifecycle',
    'currentState',
    'desiredState',
    'inputs',
    'process',
    'outputs',
    'outcomes',
    'beneficiaries',
    'publicBenefit',
    'risks',
    'obligations',
    'prohibitions',
    'policies',
    'authorization',
    'controls',
    'evidence',
    'metrics',
    'events',
    'dependencies',
    'resources',
    'cost',
    'revenue',
    'feedback',
    'improvements',
    'recovery',
    'retention',
    'version',
    'effectiveFrom',
    'effectiveTo',
    'reviewAt',
    'status'
  ],
  version: 1
});

function nonBlank(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function createGovernedObject(input = {}) {
  const out = {};
  for (const field of ugoSchema.fields) out[field] = input[field] ?? null;
  out.version = input.version ?? 1;
  out.status = input.status ?? 'DRAFT';
  return out;
}

function validateGovernedObject(obj = {}) {
  const missing = ugoSchema.fields.filter((field) => !(field in obj));
  const semanticErrors = [];

  if (!nonBlank(obj.id)) semanticErrors.push('GOVERNED_OBJECT_ID_REQUIRED');
  if (!nonBlank(obj.type)) semanticErrors.push('GOVERNED_OBJECT_TYPE_REQUIRED');

  const productionEligibilityErrors = [];
  for (const field of ['owner', 'rights', 'source', 'provenance']) {
    if (!nonBlank(obj[field])) productionEligibilityErrors.push(field);
  }
  if (obj.rights === 'UNKNOWN_UNVERIFIED') {
    productionEligibilityErrors.push('rights');
  }

  return Object.freeze({
    ok: missing.length === 0 && semanticErrors.length === 0,
    missing: Object.freeze(missing),
    semanticErrors: Object.freeze(semanticErrors),
    productionEligible:
      missing.length === 0 &&
      semanticErrors.length === 0 &&
      productionEligibilityErrors.length === 0,
    productionEligibilityErrors: Object.freeze([
      ...new Set(productionEligibilityErrors)
    ])
  });
}

module.exports = {
  ugoSchema,
  nonBlank,
  createGovernedObject,
  validateGovernedObject
};
