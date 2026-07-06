#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Sheikha Ollama Core Model Activation V1 =="

echo "== Check Ollama =="
ollama list || true

MODEL="${SHEIKHA_OLLAMA_MODEL:-Sheikha-Core:latest}"

if ! ollama list | grep -qi "Sheikha-Core"; then
  echo "WARNING: Sheikha-Core not found in ollama list."
  echo "Available models above. Set model manually with:"
  echo "export SHEIKHA_OLLAMA_MODEL='llama3.1:8b'"
fi

mkdir -p runtime/model-core/v1
mkdir -p routes/model-core

cat > runtime/model-core/v1/sheikha-ollama-core-v1.js <<'JS'
'use strict';

const http = require('http');

const DEFAULT_MODEL = process.env.SHEIKHA_OLLAMA_MODEL || 'Sheikha-Core:latest';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

function requestJson(path, payload, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, OLLAMA_HOST);
    const body = JSON.stringify(payload || {});

    const req = http.request({
      hostname: url.hostname,
      port: url.port || 11434,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: timeoutMs
    }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk.toString(); });
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw || '{}'));
        } catch {
          reject(new Error(`Invalid Ollama JSON: ${raw.slice(0, 200)}`));
        }
      });
    });

    req.on('timeout', () => req.destroy(new Error(`Ollama timeout after ${timeoutMs}ms`)));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateWithSheikhaCore(message, options = {}) {
  const model = options.model || DEFAULT_MODEL;
  const prompt = [
    'أنت Sheikha Core داخل منظومة شيخة.',
    'أجب بصدق، بلا ادعاء وعي بشري، وبحوكمة: لا ضرر ولا ضرار.',
    'اجعل الرد عمليًا ومباشرًا.',
    '',
    `الطلب: ${message || ''}`
  ].join('\n');

  const data = await requestJson('/api/generate', {
    model,
    prompt,
    stream: false,
    options: {
      temperature: 0.2,
      num_ctx: 4096
    }
  }, Number(options.timeoutMs || 30000));

  return {
    success: true,
    system: 'SHEIKHA_OLLAMA_CORE_V1',
    model,
    answer: data.response || '',
    raw: {
      done: data.done,
      total_duration: data.total_duration,
      load_duration: data.load_duration,
      eval_count: data.eval_count
    }
  };
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_OLLAMA_CORE_V1',
    status: 'ACTIVE',
    model: DEFAULT_MODEL,
    ollamaHost: OLLAMA_HOST,
    modes: {
      sheikhaCore: 'PRIMARY_LOCAL_MODEL',
      sheikhaLeast: 'FAST_MINIMAL_FALLBACK',
      fastPath: 'LIVE_ACK',
      deepPath: 'OLLAMA_BACKGROUND_OR_DIRECT'
    },
    governance: {
      noHumanConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      principle: 'لا ضرر ولا ضرار'
    }
  };
}

module.exports = {
  status,
  generateWithSheikhaCore
};
JS

cat > routes/model-core/sheikha-ollama-core-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  generateWithSheikhaCore
} = require('../../runtime/model-core/v1/sheikha-ollama-core-v1');

router.get('/api/sheikha/model-core/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/model-core/v1/chat', async (req, res) => {
  try {
    const result = await generateWithSheikhaCore(req.body?.message || '', {
      model: req.body?.model,
      timeoutMs: req.body?.timeoutMs || 30000
    });
    res.json(result);
  } catch (error) {
    res.status(200).json({
      success: false,
      system: 'SHEIKHA_OLLAMA_CORE_V1',
      error: error.message,
      fallback: {
        model: 'Sheikha-Least',
        answer: 'تم الاستلام. تعذر تشغيل النموذج المحلي الآن، وتم استخدام مسار Sheikha Least الاحتياطي السريع.'
      }
    });
  }
});

module.exports = router;
JS

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/model-core/sheikha-ollama-core-routes'));
} catch (error) {
  console.warn('[sheikha-ollama-core] route mount skipped:', error.message);
}
"""

if "sheikha-ollama-core" not in s:
    marker = "app.use(express.json"
    idx = s.find(marker)
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find server.js insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

echo "== Checks =="
node --check server.js
node --check runtime/model-core/v1/sheikha-ollama-core-v1.js
node --check routes/model-core/sheikha-ollama-core-routes.js

echo "== Restart PM2 =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API Status =="
curl -s http://127.0.0.1:8080/api/sheikha/model-core/v1/status | jq

echo "== Ollama Direct Test =="
curl -s -X POST http://127.0.0.1:8080/api/sheikha/model-core/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"عرّف بنفسك باختصار","timeoutMs":30000}' | jq '.success,.model,.answer,.fallback'

echo "== Done =="
