'use strict';

const { getSourceRecord } = require('./quran-sunnah-source-catalog-v1');
const { validateMappingReview } = require('./sharia-policy-mapping-review-v1');

function validateReferenceEligibility(record) {
  if (!record) return { ok: false, reason: 'UNKNOWN_SHARIA_SOURCE_ID' };

  if (record.sourceType === 'QURAN') {
    return record.referenceEligible === true &&
      record.status === 'VERIFIED_CANONICAL_REFERENCE'
      ? { ok: true, reason: 'QURAN_CANONICAL_REFERENCE_VERIFIED' }
      : { ok: false, reason: 'SHARIA_SOURCE_NOT_REFERENCE_OR_AUTHENTICITY_ELIGIBLE' };
  }

  if (record.sourceType === 'AUTHENTIC_SUNNAH') {
    const complete =
      record.referenceEligible === true &&
      record.canonicalReference &&
      record.collection &&
      record.hadithNumberOrCanonicalReference &&
      record.grade &&
      record.graderOrVerificationAuthority &&
      record.officialOrAuthoritativeSourceEvidence &&
      record.sourceVerifiedAt &&
      record.reviewedBy;

    return complete
      ? { ok: true, reason: 'SUNNAH_SOURCE_AUTHENTICITY_METADATA_VERIFIED' }
      : { ok: false, reason: 'SHARIA_SOURCE_NOT_REFERENCE_OR_AUTHENTICITY_ELIGIBLE' };
  }

  return { ok: false, reason: 'SHARIA_SOURCE_NOT_REFERENCE_OR_AUTHENTICITY_ELIGIBLE' };
}

function normalizeBindings(policy = {}) {
  if (Array.isArray(policy.shariaBindings) && policy.shariaBindings.length > 0) {
    return { ok: true, bindings: policy.shariaBindings };
  }

  if (Array.isArray(policy.sourceIds) && policy.sourceIds.length > 0) {
    return {
      ok: false,
      reason: 'POLICY_MAPPING_REVIEW_REQUIRED',
      legacySourceIds: policy.sourceIds,
      bindings: [],
    };
  }

  return { ok: false, reason: 'SHARIA_SOURCE_BINDINGS_REQUIRED', bindings: [] };
}

function validateShariaBindings(policy = {}, options = {}) {
  const normalized = normalizeBindings(policy);
  if (!normalized.ok) return normalized;

  const results = [];

  for (const binding of normalized.bindings) {
    if (!binding || !binding.sourceId) {
      return { ok: false, reason: 'SHARIA_SOURCE_BINDINGS_REQUIRED', results };
    }

    const record = getSourceRecord(binding.sourceId);
    if (!record) {
      return { ok: false, reason: 'UNKNOWN_SHARIA_SOURCE_ID', sourceId: binding.sourceId, results };
    }

    const reference = validateReferenceEligibility(record);
    if (!reference.ok) {
      return { ok: false, reason: reference.reason, sourceId: binding.sourceId, results };
    }

    const mapping = validateMappingReview(
      binding.mappingReview,
      policy,
      record,
      {
        ijtihadi: policy.ijtihadi === true,
        disputed: policy.disputed === true,
      },
    );

    if (!mapping.ok) {
      return { ok: false, reason: mapping.reason, sourceId: binding.sourceId, mapping, results };
    }

    results.push({
      sourceId: binding.sourceId,
      reference,
      mapping,
    });
  }

  return {
    ok: true,
    reason: 'SHARIA_SOURCE_AND_DOCUMENTED_POLICY_MAPPING_BINDINGS_VERIFIED',
    results,
  };
}

module.exports = {
  normalizeBindings,
  validateReferenceEligibility,
  validateShariaBindings,
};
