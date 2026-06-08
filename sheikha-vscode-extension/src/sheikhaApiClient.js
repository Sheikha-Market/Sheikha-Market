'use strict';

const http = require('http');

const BASE_URL = process.env.SHEIKHA_RUNTIME_URL || 'http://127.0.0.1:8080';
const TIMEOUT_MS = Number(process.env.SHEIKHA_API_TIMEOUT_MS || 30000);

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const body = JSON.stringify(payload || {});

    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: TIMEOUT_MS
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch {
          resolve({ success: false, message: data || `HTTP ${res.statusCode}` });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Sheikha API timeout'));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function askSheikha(prompt, context = {}) {
  const payload = {
    message: prompt,
    prompt,
    mode: context.mode || 'agentic',
    context
  };

  const endpoints = [
    '/api/sheikha/ai-gateway/chat',
    '/api/sheikha/chat',
    '/api/ai/chat',
    '/api/sheikha/protocol/decision'
  ];

  let lastError = null;

  for (const ep of endpoints) {
    try {
      const result = await postJson(ep, payload);
      if (result && result.success !== false) return result;
      lastError = result;
    } catch (e) {
      lastError = e;
    }
  }

  return {
    success: true,
    data: {
      reply: `تم استلام طلبك داخل شيخة، لكن لم أجد مسار دردشة مكتمل في Runtime. الطلب: ${prompt}`,
      provider: 'sheikha-extension-fallback',
      model: 'local-runtime',
      mode: context.mode || 'agentic',
      localModelOnline: false
    },
    error: lastError?.message || lastError
  };
}

module.exports = { askSheikha };
