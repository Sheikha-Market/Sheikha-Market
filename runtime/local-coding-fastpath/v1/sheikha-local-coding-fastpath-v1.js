'use strict';

const http = require('http');

function isCodingRequest(message = '') {
  return /برمج|كود|route|api|function|class|server\.js|package\.json|vscode|extension|npm|git|اصلح/i
    .test(String(message || ''));
}

function buildPrompt(message = '', context = {}) {
  return [
    'أنت Sheikha Local Coding FastPath.',
    'ابدأ بالبرمجة مباشرة بدون ترحيب وبدون تقرير مفتش.',
    'اكتب الكود أو خطة تعديل الملفات مباشرة.',
    'لا تنفذ أوامر عالية الأثر، ولا تحذف ملفات، ولا تكشف أسرار.',
    'اذكر: الملفات المقترحة، الكود، الاختبارات.',
    '',
    `السياق: ${JSON.stringify(context || {})}`,
    '',
    `طلب المستخدم: ${message}`
  ].join('\n');
}

function ollamaGenerate(prompt, model = process.env.SHEIKHA_LOCAL_CODING_MODEL || 'qwen2.5-coder:7b') {
  const payload = JSON.stringify({
    model,
    prompt,
    stream: false,
    options: { temperature: 0.2 }
  });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 45000
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.response || '');
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('LOCAL_CODING_MODEL_TIMEOUT'));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function answer(message = '', context = {}) {
  if (!isCodingRequest(message)) {
    return {
      system: 'SHEIKHA_LOCAL_CODING_FASTPATH_V1',
      used: false,
      reason: 'NOT_CODING_REQUEST'
    };
  }

  const response = await ollamaGenerate(buildPrompt(message, context));
  return {
    system: 'SHEIKHA_LOCAL_CODING_FASTPATH_V1',
    used: true,
    mode: 'LOCAL_OFFLINE_CODING',
    model: process.env.SHEIKHA_LOCAL_CODING_MODEL || 'qwen2.5-coder:7b',
    response
  };
}

module.exports = { isCodingRequest, buildPrompt, answer };
