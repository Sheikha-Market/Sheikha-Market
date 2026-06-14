'use strict';

function governGovernance(req = {}) {
  const actor = req.actor || 'unknown';
  const channel = req.channel || req.source || 'unknown';
  const action = req.action || 'chat';
  const message = String(req.message || '');

  const blocked = [
    'rm -rf',
    'drop database',
    'delete from',
    'truncate',
    'shutdown',
    'reboot',
    'payment',
    'تحويل مالي',
    'افتح القفل',
    'iot'
  ];

  const violation = blocked.find(x => message.toLowerCase().includes(x));

  return {
    engine: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
    status: violation ? 'BLOCKED' : 'APPROVED',
    allowed: !violation,
    actor,
    channel,
    action,
    violation: violation || null,
    basis: 'التوحيد لله وحده، والرقمنة منضبطة بالكتاب والسنة، ولا ضرر ولا ضرار',
    controls: {
      governanceCannotBypassProtocol: true,
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
