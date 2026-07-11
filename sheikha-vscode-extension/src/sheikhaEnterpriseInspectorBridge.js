'use strict';

const { collectVSCodeToolContext } = require('./sheikhaVSCodeToolRegistry');
const { postJson } = require('./sheikhaExtensionChatClient');

async function sendInspectorHeartbeat(baseUrl) {
  const vscodeTools = collectVSCodeToolContext();

  return postJson('/api/sheikha/enterprise-inspector/v3/context', {
    source: 'SHEIKHA_VSCODE_EXTENSION',
    status: 'CONNECTED',
    heartbeatAt: new Date().toISOString(),
    vscodeTools,
    __timeoutMs: 10000
  }, baseUrl);
}

module.exports = { sendInspectorHeartbeat };
