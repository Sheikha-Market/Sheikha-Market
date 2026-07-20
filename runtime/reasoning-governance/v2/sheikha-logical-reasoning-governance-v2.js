'use strict';

const SYSTEM = 'SHEIKHA_LOGICAL_REASONING_GOVERNANCE_V2';

const REQUIRED_STEPS = Object.freeze([
  'DEFINE_CLAIM',
  'CLASSIFY_DOMAIN',
  'COLLECT_EVIDENCE',
  'VALIDATE_PROVENANCE',
  'CHECK_CONSISTENCY',
  'CHECK_RIGHTS_AND_HARM',
  'APPLY_POLICY_GATES',
  'RECORD_REASONING_SUMMARY',
  'ROUTE_TO_QUALIFIED_HUMAN_WHEN_REQUIRED'
]);

const FORBIDDEN_CLAIMS = Object.freeze([
  'CONSCIOUSNESS',
  'DIVINE_AUTHORITY',
  'CERTAIN_FUTURE_PREDICTION',
  'AUTONOMOUS_FATWA',
  'UNVERIFIED_COMPLETION'
]);

function normalizeText(value) {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

function evaluate({
  claim,
  evidence = [],
  domain = 'GENERAL',
  qualifiedReview = false,
  operatorReview = false
} = {}) {
  const normalizedClaim = normalizeText(claim);
  const normalizedEvidence = Array.isArray(evidence)
    ? evidence.filter(Boolean)
    : [];

  const failures = [];

  if (!normalizedClaim) {
    failures.push('CLAIM_REQUIRED');
  }

  if (normalizedEvidence.length === 0) {
    failures.push('EVIDENCE_REQUIRED');
  }

  if (
    domain === 'ISLAMIC_REFERENCE' &&
    !qualifiedReview
  ) {
    failures.push('QUALIFIED_SCHOLAR_REVIEW_REQUIRED');
  }

  return {
    system: SYSTEM,
    status: failures.length === 0
      ? 'EVIDENCE_READY'
      : 'FAIL_CLOSED',
    claim: normalizedClaim,
    domain,
    evidenceCount: normalizedEvidence.length,
    failures,
    requiredSteps: REQUIRED_STEPS,
    forbiddenClaims: FORBIDDEN_CLAIMS,
    qualifiedReview,
    operatorReview,
    autonomousExecutionAllowed: false
  };
}

module.exports = Object.freeze({
  SYSTEM,
  REQUIRED_STEPS,
  FORBIDDEN_CLAIMS,
  evaluate
});
