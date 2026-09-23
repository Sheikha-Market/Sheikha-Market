'use strict';

const { sourceCatalogSummary } = require('./quran-sunnah-source-catalog-v1');
const { validateShariaBindings } = require('./sharia-source-validator-v1');

const governance = Object.freeze({
  system: 'SHEIKHA_QURAN_SUNNAH_GOVERNANCE_V1',
  referenceOrder: Object.freeze([
    'QURAN',
    'AUTHENTIC_SUNNAH',
    'DOCUMENTED_VERIFIED_DERIVED_POLICY',
    'APPLICABLE_LAW_REGULATION_STANDARD_AND_CONTRACT',
    'AUTHORIZED_TECHNICAL_POLICY',
    'AUTHORIZED_EXECUTION',
    'POST_EXECUTION_EVIDENCE_AND_REVIEW',
  ]),
  controls: Object.freeze({
    shariaSourceLinkRequired: true,
    documentedPolicyMappingReviewRequired: true,
    canonicalReferenceDoesNotAuthorizeExecutablePolicyByItself: true,
    hadithAuthenticityMetadataRequiredBeforeEnforcement: true,
    ijtihadiOrDisputedRuleHumanReviewRequired: true,
    noHarm: true,
    justice: true,
    trust: true,
    noRiba: true,
    noDeception: true,
    noMonopoly: true,
    noUnauthorizedExecution: true,
    failClosed: true,
  }),
  sourceCatalog: sourceCatalogSummary,
});

function validatePolicySources(policy = {}, context = {}) {
  if (policy.shariaApplies !== true) {
    return { ok: true, reason: 'SHARIA_POLICY_NOT_APPLICABLE', results: [] };
  }

  return validateShariaBindings(policy, {
    humanApproved: context.humanApproved === true,
  });
}

module.exports = { governance, validatePolicySources };
