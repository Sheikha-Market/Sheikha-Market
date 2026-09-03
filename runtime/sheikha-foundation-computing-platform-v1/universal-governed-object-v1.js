    'use strict';

    const ugoSchema = Object.freeze({
  "fieldCount": 40,
  "fields": [
    "id",
    "type",
    "identity",
    "owner",
    "rights",
    "source",
    "provenance",
    "jurisdiction",
    "classification",
    "lifecycle",
    "currentState",
    "desiredState",
    "inputs",
    "process",
    "outputs",
    "outcomes",
    "beneficiaries",
    "publicBenefit",
    "risks",
    "obligations",
    "prohibitions",
    "policies",
    "authorization",
    "controls",
    "evidence",
    "metrics",
    "events",
    "dependencies",
    "resources",
    "cost",
    "revenue",
    "feedback",
    "improvements",
    "recovery",
    "retention",
    "version",
    "effectiveFrom",
    "effectiveTo",
    "reviewAt",
    "status"
  ],
  "version": 1
});

    function createGovernedObject(input = {}) {
  const out = {};
  for (const field of ugoSchema.fields) out[field] = input[field] ?? null;
  out.version = input.version ?? 1;
  out.status = input.status ?? 'DRAFT';
  return out;
}

function validateGovernedObject(obj = {}) {
  const missing = ugoSchema.fields.filter((field) => !(field in obj));
  return {
    ok: missing.length === 0,
    missing,
    productionEligible:
      missing.length === 0 &&
      Boolean(obj.owner) &&
      Boolean(obj.rights) &&
      Boolean(obj.source) &&
      Boolean(obj.provenance),
  };
}

    module.exports = { ugoSchema, createGovernedObject, validateGovernedObject };
