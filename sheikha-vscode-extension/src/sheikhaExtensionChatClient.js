'use strict';

const http = require('http');
const https = require('https');
const { collectWorkspaceContext } = require('./sheikhaWorkspaceIntelligence');
const { collectVSCodeToolContext } = require('./sheikhaVSCodeToolRegistry');
const { normalizeSheikhaReply } = require('./sheikhaReplyNormalizer');
const { decideSmartRoute } = require('./sheikhaSmartRouteGovernance');

const DEFAULT_BASE_URL = process.env.SHEIKHA_API_BASE_URL || 'https://sheikha.top';

function postJson(path, payload, baseUrl = DEFAULT_BASE_URL) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const body = JSON.stringify(payload || {});
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.request({
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ success: false, error: 'invalid_json', raw: data }); }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Sheikha extension chat timeout'));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendExtensionChat(message, options = {}) {
  const payload = {
    message,
    mode: options.mode || (/كود|برمج|اصلح|fix|code|test|error|patch|دبق|debug/i.test(String(message)) ? 'code' : 'chat'),
    actor: 'vscode-extension',
    source: 'sheikha-vscode-extension',
    workspace: collectWorkspaceContext(),
    vscodeTools: collectVSCodeToolContext(),
    workspace: collectWorkspaceContext(),
  };

  const data = await postJson('/api/sheikha/unified-chat', payload, options.baseUrl);

  if (!data || data.success !== true) {
    return {
      success: false,
      answer: `تعذر الاتصال بشات الإكستنشن: ${data?.error || 'unknown_error'}`
    };
  }

  return {
    success: true,
    answer: normalizeSheikhaReply(data.answer || data.reply || data.message || ''),
    raw: data
  };
}

module.exports = {
  DEFAULT_BASE_URL,
  sendExtensionChat
};
