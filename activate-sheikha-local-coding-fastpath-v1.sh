#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_LOCAL_CODING_FASTPATH_V1..."

# 1) أصلح تثبيت الإكستنشن: ابنِ وثبّت النسخة الموجودة فعلياً
cd sheikha-vscode-extension

VERSION="$(node -p "require('./package.json').version")"
npm run package

VSIX="dist/sheikha.sheikha-${VERSION}.vsix"
test -f "$VSIX"

code --install-extension "$VSIX" --force

cd ..

# 2) تأكد من وجود Ollama محلي
if ! command -v ollama >/dev/null 2>&1; then
  echo "ERROR: ollama غير مثبت. ثبته أولاً لتفعيل البرمجة بدون إنترنت."
  exit 1
fi

# 3) اسحب/استخدم موديل برمجة محلي إن لم يكن موجوداً
ollama list | grep -E "qwen2.5-coder|deepseek-coder|codellama" || {
  echo "Installing local coding model..."
  ollama pull qwen2.5-coder:7b
}

# 4) أنشئ Fast Path للبرمجة بدون Inspector
mkdir -p runtime/local-coding-fastpath/v1 routes/local-coding-fastpath tests docs/local-coding-fastpath

cat > runtime/local-coding-fastpath/v1/sheikha-local-coding-fastpath-v1.js <<'JS'
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
JS

cat > routes/local-coding-fastpath/sheikha-local-coding-fastpath-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();
const fastpath = require('../../runtime/local-coding-fastpath/v1/sheikha-local-coding-fastpath-v1');

router.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      system: 'SHEIKHA_LOCAL_CODING_FASTPATH_V1',
      status: 'ACTIVE',
      mode: 'LOCAL_OFFLINE_CODING',
      model: process.env.SHEIKHA_LOCAL_CODING_MODEL || 'qwen2.5-coder:7b',
      noInspectorByDefault: true,
      noInternetRequired: true
    }
  });
});

router.post('/chat', async (req, res) => {
  try {
    const data = await fastpath.answer(req.body?.message || '', req.body?.context || {});
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'local_coding_fastpath_failed',
      message: error.message
    });
  }
});

module.exports = router;
JS

python3 - <<'PY'
from pathlib import Path
p = Path("server.js")
s = p.read_text()
line = "app.use('/api/sheikha/local-coding-fastpath/v1', require('./routes/local-coding-fastpath/sheikha-local-coding-fastpath-routes'));"
if line not in s:
    marker = "app.use('/api/sheikha/living-conversation-apex/v1'"
    if marker in s:
        s = s.replace(marker, line + "\n" + marker, 1)
    else:
        s += "\n" + line + "\n"
p.write_text(s)
PY

cat > tests/sheikha-local-coding-fastpath-v1.test.js <<'JS'
'use strict';

const fastpath = require('../runtime/local-coding-fastpath/v1/sheikha-local-coding-fastpath-v1');

describe('Sheikha Local Coding FastPath V1', () => {
  test('detects coding requests before inspector templates', () => {
    expect(fastpath.isCodingRequest('برمج لي route جديد')).toBe(true);
    expect(fastpath.isCodingRequest('اكتب تقرير عام')).toBe(false);
  });

  test('builds action-first coding prompt', () => {
    const prompt = fastpath.buildPrompt('برمج route');
    expect(prompt).toContain('ابدأ بالبرمجة مباشرة');
    expect(prompt).toContain('بدون تقرير مفتش');
    expect(prompt).toContain('لا تحذف ملفات');
  });
});
JS

npm run lint
npm test -- --runInBand tests/sheikha-local-coding-fastpath-v1.test.js

pm2 restart sheikha-main-portal --update-env
pm2 save

curl -s http://127.0.0.1:8080/api/sheikha/local-coding-fastpath/v1/status | jq

curl -s -X POST http://127.0.0.1:8080/api/sheikha/local-coding-fastpath/v1/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"برمج لي route جديد لحالة Living Conversation"}' | jq

echo "SHEIKHA_LOCAL_CODING_FASTPATH_V1 activated."
