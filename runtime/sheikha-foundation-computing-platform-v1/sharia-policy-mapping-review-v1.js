'use strict';

const mappingStatuses = Object.freeze([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUPERSEDED',
  'EXPIRED',
]);

const mappingReviewSchema = Object.freeze({
  fields: Object.freeze([
    'mappingId',
    'policyId',
    'policyVersion',
    'sourceId',
    'sourceType',
    'mappingStatementHash',
    'rationale',
    'applicability',
    'status',
    'reviewedBy',
    'reviewedAt',
    'reviewEvidence',
    'reviewAuthorityClass',
    'reviewNotes',
    'effectiveFrom',
    'reviewAt',
    'supersedes',
    'version',
  ]),
  fieldCount: 18,
  approvedStatus: 'APPROVED',
});

function validateMappingReview(mappingReview, policy = {}, sourceRecord = {}, options = {}) {
  if (!mappingReview || typeof mappingReview !== 'object') {
    return { ok: false, reason: 'POLICY_MAPPING_REVIEW_REQUIRED' };
  }

  if (!mappingStatuses.includes(mappingReview.status)) {
    return { ok: false, reason: 'POLICY_MAPPING_STATUS_INVALID' };
  }

  if (mappingReview.status !== 'APPROVED') {
    return { ok: false, reason: 'POLICY_MAPPING_NOT_APPROVED' };
  }

  const required = [
    'mappingId',
    'policyId',
    'policyVersion',
    'sourceId',
    'sourceType',
    'mappingStatementHash',
    'reviewedBy',
    'reviewedAt',
    'reviewEvidence',
    'reviewAuthorityClass',
  ];

  const missing = required.filter((field) => {
    const value = mappingReview[field];
    return value === null || value === undefined || String(value).trim() === '';
  });

  if (missing.length > 0) {
    return { ok: false, reason: 'POLICY_MAPPING_METADATA_INCOMPLETE', missing };
  }

  if (
    String(mappingReview.policyId) !== String(policy.id || '') ||
    String(mappingReview.policyVersion) !== String(policy.version || '')
  ) {
    return { ok: false, reason: 'POLICY_MAPPING_POLICY_ID_OR_VERSION_MISMATCH' };
  }

  if (String(mappingReview.sourceId) !== String(sourceRecord.id || '')) {
    return { ok: false, reason: 'POLICY_MAPPING_SOURCE_ID_MISMATCH' };
  }

  if (String(mappingReview.sourceType) !== String(sourceRecord.sourceType || '')) {
    return { ok: false, reason: 'POLICY_MAPPING_SOURCE_TYPE_MISMATCH' };
  }

  if (
    (options.ijtihadi === true || options.disputed === true) &&
    mappingReview.reviewAuthorityClass !== 'QUALIFIED_SCHOLARLY_REVIEW'
  ) {
    return { ok: false, reason: 'QUALIFIED_HUMAN_REVIEW_REQUIRED' };
  }

  return { ok: true, reason: 'DOCUMENTED_POLICY_MAPPING_REVIEW_APPROVED' };
}

module.exports = {
  mappingStatuses,
  mappingReviewSchema,
  validateMappingReview,
};
