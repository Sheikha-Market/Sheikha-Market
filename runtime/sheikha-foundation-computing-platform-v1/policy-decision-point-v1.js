'use strict';

function decide({
  object,
  policy = {},
  context = {},
  rightsValidation = { ok: true },
  legalValidation = { ok: true },
  sourceValidation = { ok: true },
} = {}) {
  if (!object) return { decision: 'DENY', reason: 'OBJECT_REQUIRED' };

  if (policy.failClosed !== false && context.evidenceVerified !== true) {
    return { decision: 'DENY', reason: 'VERIFIED_EVIDENCE_REQUIRED' };
  }

  if (rightsValidation.ok !== true) {
    return { decision: 'DENY', reason: rightsValidation.reason || 'RIGHTS_VALIDATION_FAILED' };
  }

  if (legalValidation.ok !== true) {
    return { decision: 'DENY', reason: legalValidation.reason || 'LEGAL_VALIDATION_FAILED' };
  }

  if (policy.shariaApplies === true && sourceValidation.ok !== true) {
    return { decision: 'DENY', reason: sourceValidation.reason || 'SHARIA_SOURCE_VALIDATION_FAILED' };
  }

  if (
    context.highImpact === true &&
    context.humanReviewRequired === true &&
    context.humanApproved !== true
  ) {
    return { decision: 'DENY', reason: 'HUMAN_REVIEW_REQUIRED' };
  }

  return { decision: 'ALLOW', reason: 'POLICY_CONDITIONS_SATISFIED' };
}

module.exports = { decide };
