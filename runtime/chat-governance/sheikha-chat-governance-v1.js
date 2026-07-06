'use strict';

function stripAnsi(value) {
  return String(value || '')
    .replace(/\x1B\[[0-9;]*[A-Za-z]/g, '')
    .replace(/\u001b\[[0-9;]*[A-Za-z]/g, '');
}

function normalizeChatInput(body = {}, source = 'general-chat') {
  return {
    message: stripAnsi(body.message || body.prompt || body.text || ''),
    mode: body.mode || 'smart',
    source,
    actor: body.actor || source,
    governed: true,
    governance: {
      engine: 'SHEIKHA_CHAT_GOVERNANCE_V1',
      beforeExecution: true,
      noSecrets: true,
      noDestructiveActionWithoutReview: true,
      contextPolicy: 'MINIMUM_NECESSARY_NO_SECRETS',
      principle: 'لا ضرر ولا ضرار'
    }
  };
}

function normalizeChatOutput(result = {}) {
  const answer = stripAnsi(
    result.answer || result.response || result.message || result.text || ''
  );

  return {
    success: result.success !== false,
    answer,
    response: answer,
    message: answer,
    route: result.route || 'SHEIKHA_GOVERNED_CHAT',
    governance: {
      engine: 'SHEIKHA_CHAT_GOVERNANCE_V1',
      outputSanitized: true,
      schemaUnified: true
    },
    raw: {
      intent: result.intent,
      mode: result.mode,
      protocol: result.protocol,
      fabric: result.fabric,
      orchestrator: result.orchestrator
    }
  };
}

module.exports = {
  stripAnsi,
  normalizeChatInput,
  normalizeChatOutput
};
