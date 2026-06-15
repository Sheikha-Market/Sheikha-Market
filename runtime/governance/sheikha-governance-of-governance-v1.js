'use strict';

const covenantGovernance = require(
  '../covenant-governance-apex/v1/covenant-governance-apex-v1'
);

function governGovernance(req = {}) {
  const actor = req.actor || 'unknown';
  const channel = req.channel || req.source || 'unknown';
  const action = req.action || 'chat';
  const message = String(req.message || '');

  const covenant = covenantGovernance.evaluateAction({
    actor,
    channel,
    action,
    message,
    evidenceRequired: req.evidenceRequired,
    evidenceRefs: req.evidenceRefs,
    highImpact: req.highImpact,
    specialistReviewRequired: req.specialistReviewRequired,
    specialistReviewed: req.specialistReviewed
  });
  const legacyBlocked = ['delete from', 'payment', 'iot'];
  const legacyViolation = legacyBlocked.find(x => message.toLowerCase().includes(x)) || null;
  const violation = covenant.violation || legacyViolation;

  return {
    engine: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
    status: violation ? 'BLOCKED' : covenant.status,
    allowed: !legacyViolation && covenant.allowed,
    actor,
    channel,
    action,
    violation: violation || null,
    covenant,
    basis: 'التوحيد لله وحده، والرقمنة منضبطة بالكتاب والسنة، ولا ضرر ولا ضرار',
    controls: {
      governanceCannotBypassProtocol: true,
      covenantGovernanceApexRequired: true,
      conversationEnginePrimary: true,
      unifiedChatFallbackOnly: true,
      inspectorExplicitDiagnosticsOnly: true,
      destructiveActionsBlocked: true,
      financialAndPhysicalActionsBlocked: true,
      auditRequired: true,
      humanReviewRequiredForWrites: true
    }
  };
}

module.exports = { governGovernance };
