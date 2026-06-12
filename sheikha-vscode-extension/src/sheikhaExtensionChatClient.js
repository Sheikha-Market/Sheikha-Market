'use strict';

const http = require('http');
const https = require('https');
const { collectWorkspaceContext } = require('./sheikhaWorkspaceIntelligence');
const { collectVSCodeToolContext } = require('./sheikhaVSCodeToolRegistry');
const { normalizeSheikhaReply } = require('./sheikhaReplyNormalizer');
const { decideSmartRoute } = require('./sheikhaSmartRouteGovernance');

const DEFAULT_BASE_URL = process.env.SHEIKHA_API_BASE_URL || 'https://sheikha.top';

function safeJsonParse(rawInput) {
  const raw = String(rawInput || '').trim();

  if (!raw) {
    return {
      success: false,
      error: 'empty_response',
      answer: 'تعذر الاتصال بشات شيخة: الرد فارغ من الخادم.',
      raw: ''
    };
  }

  try {
    return JSON.parse(raw);
  } catch {}

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');

  if (start >= 0 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {}
  }

  return {
    success: false,
    error: 'invalid_json',
    answer: 'تعذر قراءة رد شات شيخة كـ JSON. تحقق من حالة السيرفر أو أعد المحاولة بعد انتهاء الاختبارات.',
    raw: raw.slice(0, 1000)
  };
}

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
      timeout: 60000
    }, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const parsed = safeJsonParse(data);
        parsed.statusCode = res.statusCode;
        resolve(parsed);
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Sheikha extension chat timeout after 60s'));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(path, baseUrl = DEFAULT_BASE_URL, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request({
      method: 'GET',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: { Accept: 'application/json' },
      timeout
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = safeJsonParse(data);
        parsed.statusCode = res.statusCode;
        resolve(parsed);
      });
    });

    req.on('timeout', () => req.destroy(new Error(`Sheikha request timeout after ${timeout}ms`)));
    req.on('error', reject);
    req.end();
  });
}

async function getEnterpriseInspectorStatus(options = {}) {
  try {
    const data = await getJson(
      '/api/sheikha/enterprise-inspector/v3/status',
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );

    if (data?.success === true) return data;
    return {
      success: false,
      status: 'DEGRADED',
      error: data?.error || `HTTP_${data?.statusCode || 'UNKNOWN'}`
    };
  } catch (error) {
    return {
      success: false,
      status: 'OFFLINE',
      error: error.message
    };
  }
}

async function sendExtensionChat(message, options = {}) {
  const text = String(message || '');
  const smartRoute = decideSmartRoute(text);
  const workspace = collectWorkspaceContext();
  const vscodeTools = collectVSCodeToolContext();

  const payload = {
    message: text,
    mode: options.mode || smartRoute.mode || (/كود|برمج|اصلح|fix|code|test|error|patch|دبق|debug/i.test(text) ? 'code' : 'chat'),
    actor: 'vscode-extension',
    channel: 'extension-chat',
    source: 'sheikha-vscode-extension',
    governanceProfile: 'SHEIKHA_ENTERPRISE_CHAT_GOVERNANCE_V1',
    route: smartRoute,
    workspace,
    vscodeTools
  };

  try {
    const data = await postJson('/api/sheikha/unified-chat', payload, options.baseUrl);

    if (!data || data.success !== true) {
      return {
        success: false,
        answer: normalizeSheikhaReply(
          data?.answer ||
          data?.message ||
          `تعذر الاتصال بشات الإكستنشن: ${data?.error || 'unknown_error'}`,
          text
        ),
        raw: data
      };
    }

    return {
      success: true,
      answer: normalizeSheikhaReply(data.answer || data.reply || data.message || '', text),
      raw: data
    };
  } catch (err) {
    return {
      success: false,
      answer: normalizeSheikhaReply(`تعذر الاتصال بشات الإكستنشن: ${err.message}`, text),
      raw: {
        success: false,
        error: err.message
      }
    };
  }
}

module.exports = {
  DEFAULT_BASE_URL,
  sendExtensionChat,
  postJson,
  getJson,
  getEnterpriseInspectorStatus,
  safeJsonParse
};
