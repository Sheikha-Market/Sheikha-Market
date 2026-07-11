'use strict';

const crypto = require('node:crypto');

const CAPABILITY_POLICY = Object.freeze({
  'runtime.status.read': Object.freeze({ impact: 'read-only', humanApprovalRequired: false }),
  'release.status.read': Object.freeze({ impact: 'read-only', humanApprovalRequired: false }),
  'update.plan.read': Object.freeze({ impact: 'read-only', humanApprovalRequired: false }),
  'installer.user.install': Object.freeze({ impact: 'high', humanApprovalRequired: true }),
  'installer.user.uninstall': Object.freeze({ impact: 'high', humanApprovalRequired: true }),
  'installer.system.install': Object.freeze({ impact: 'critical', humanApprovalRequired: true }),
  'installer.system.uninstall': Object.freeze({ impact: 'critical', humanApprovalRequired: true }),
  'update.apply': Object.freeze({ impact: 'high', humanApprovalRequired: true }),
  'rollback.apply': Object.freeze({ impact: 'high', humanApprovalRequired: true })
});

const DIRECT_CONTROL_PREFIXES = Object.freeze([
  'shell.',
  'kernel.',
  'firmware.',
  'package.',
  'secrets.',
  'filesystem.unscoped.'
]);

function denied(intent, reason, policy = null) {
  return {
    decisionId: crypto.randomUUID(),
    requestId: intent?.requestId || null,
    capability: intent?.capability || null,
    permitted: false,
    status: 'DENIED',
    reason,
    impact: policy?.impact || 'unknown',
    humanFinalDecision: true,
    aiCanAuthorize: false
  };
}

function evaluateDesktopCapability(intent, context = {}) {
  const capability = String(intent?.capability || '').trim();
  if (!capability) return denied(intent, 'CAPABILITY_REQUIRED');
  if (DIRECT_CONTROL_PREFIXES.some((prefix) => capability.startsWith(prefix))) {
    return denied(intent, 'DIRECT_SYSTEM_CONTROL_PROHIBITED');
  }

  const policy = CAPABILITY_POLICY[capability];
  if (!policy) return denied(intent, 'CAPABILITY_NOT_ALLOWLISTED');

  const grants = new Set(Array.isArray(context.grantedCapabilities)
    ? context.grantedCapabilities.map(String)
    : []);
  if (!grants.has(capability)) return denied(intent, 'CAPABILITY_NOT_GRANTED', policy);

  if (policy.humanApprovalRequired) {
    const approval = intent?.humanApproval;
    if (approval?.approved !== true || !String(approval?.approvedBy || '').trim()) {
      return denied(intent, intent?.aiApproval === true
        ? 'AI_CANNOT_AUTHORIZE_HIGH_IMPACT_ACTION'
        : 'HUMAN_APPROVAL_REQUIRED', policy);
    }
    if (!String(approval?.approvalId || '').trim()) {
      return denied(intent, 'HUMAN_APPROVAL_EVIDENCE_REQUIRED', policy);
    }
  }

  return {
    decisionId: crypto.randomUUID(),
    requestId: intent.requestId,
    capability,
    permitted: true,
    status: 'PERMITTED',
    reason: 'GOVERNANCE_AND_CAPABILITY_GATES_PASSED',
    impact: policy.impact,
    humanApprovalRequired: policy.humanApprovalRequired,
    humanFinalDecision: true,
    aiCanAuthorize: false
  };
}

module.exports = {
  CAPABILITY_POLICY,
  DIRECT_CONTROL_PREFIXES,
  evaluateDesktopCapability
};
