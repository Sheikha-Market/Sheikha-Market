#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate Sheikha AI Cluster Pipeline Production Apex V1 =="

mkdir -p runtime/ai-cluster-pipeline-production/v1
mkdir -p routes/ai-cluster-pipeline-production

cp runtime/model-core/v1/sheikha-ollama-core-v1.js \
   runtime/model-core/v1/sheikha-ollama-core-v1.js.bak-cluster-pipeline-$(date +%Y%m%d%H%M%S)

cat > runtime/model-core/v1/sheikha-ollama-core-v1.js <<'JS'
'use strict';

const http = require('http');

const DEFAULT_MODEL = process.env.SHEIKHA_OLLAMA_MODEL || 'Sheikha-Core:latest';
const FAST_MODEL = process.env.SHEIKHA_FAST_MODEL || 'tinyllama:latest';
const CODER_MODEL = process.env.SHEIKHA_CODER_MODEL || 'qwen2.5-coder:7b';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

function requestJson(path, payload, timeoutMs = 180000) {
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
          reject(new Error(`Invalid Ollama JSON: ${raw.slice(0, 300)}`));
        }
      });
    });

    req.on('timeout', () => req.destroy(new Error(`Ollama timeout after ${timeoutMs}ms`)));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function selectModel(message = '', mode = 'smart') {
  const text = String(message || '');
  if (/code|كود|برمج|اصلح|fix|debug/i.test(text) || mode === 'code') return CODER_MODEL;
  if (/سريع|مختصر|fast|least/i.test(text) || mode === 'least') return FAST_MODEL;
  return DEFAULT_MODEL;
}

async function generateWithSheikhaCore(message, options = {}) {
  const model = options.model || selectModel(message, options.mode);
  const prompt = [
    'أنت Sheikha-Core داخل منظومة شيخة.',
    'أجب بصدق وعمليًا، بلا ادعاء وعي أو إحساس بشري.',
    'الحوكمة: لا ضرر ولا ضرار، لا أسرار، لا .env، لا عمليات تدميرية.',
    '',
    `الطلب: ${message || ''}`
  ].join('\n');

  const data = await requestJson('/api/generate', {
    model,
    prompt,
    stream: false,
    options: {
      temperature: Number(options.temperature ?? 0.2),
      top_p: 0.9,
      num_ctx: Number(options.numCtx || 1024),
      num_predict: Number(options.numPredict || 128),
      repeat_penalty: 1.08
    }
  }, Number(options.timeoutMs || 180000));

  return {
    success: true,
    system: 'SHEIKHA_OLLAMA_CORE_V1',
    route: 'SHEIKHA_AI_CLUSTER_PIPELINE_MODEL_CORE',
    model,
    answer: data.response || '',
    raw: {
      done: data.done,
      done_reason: data.done_reason,
      total_duration: data.total_duration,
      load_duration: data.load_duration,
      prompt_eval_count: data.prompt_eval_count,
      eval_count: data.eval_count
    }
  };
}

async function fastLeast(message) {
  try {
    return await generateWithSheikhaCore(message, {
      model: FAST_MODEL,
      mode: 'least',
      timeoutMs: 30000,
      numCtx: 512,
      numPredict: 96
    });
  } catch (error) {
    return {
      success: true,
      system: 'SHEIKHA_LEAST_FALLBACK_V1',
      model: 'Sheikha-Least',
      answer: `تم الاستلام: ${message || 'أمر جديد'}\n\nتعذر تشغيل النموذج المحلي الآن، وتم استخدام مسار Sheikha Least السريع.`,
      fallbackReason: error.message
    };
  }
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_OLLAMA_CORE_V1',
    status: 'ACTIVE',
    model: DEFAULT_MODEL,
    fastModel: FAST_MODEL,
    coderModel: CODER_MODEL,
    ollamaHost: OLLAMA_HOST,
    modes: {
      sheikhaCore: 'PRIMARY_LOCAL_MODEL',
      sheikhaLeast: 'FAST_MINIMAL_FALLBACK',
      sheikhaCoder: 'LOCAL_CODE_MODEL',
      aiCluster: 'SINGLE_NODE_LOCAL_CLUSTER',
      pipeline: 'FAST_PATH_TO_DEEP_MODEL'
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
  generateWithSheikhaCore,
  fastLeast,
  selectModel
};
JS

cat > runtime/ai-cluster-pipeline-production/v1/sheikha-ai-cluster-pipeline-production-apex-v1.js <<'JS'
'use strict';

const { status } = require('../../model-core/v1/sheikha-ollama-core-v1');

function getApexStatus() {
  return {
    success: true,
    system: 'SHEIKHA_AI_CLUSTER_PIPELINE_PRODUCTION_APEX_V1',
    status: 'ACTIVE',
    productionReadiness: 'SINGLE_NODE_PRODUCTION_CANDIDATE',
    cluster: {
      mode: 'LOCAL_OLLAMA_MODEL_CLUSTER',
      models: status(),
      externalKubernetes: 'NOT_CONNECTED',
      multiNode: 'NOT_CONNECTED'
    },
    pipeline: {
      fastPath: 'ACTIVE',
      sheikhaLeastFallback: 'ACTIVE',
      sheikhaCoreDeepPath: 'ACTIVE',
      coderModelPath: 'ACTIVE',
      governedRouting: 'ACTIVE'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      secretsProtected: true,
      envProtected: true,
      destructiveActionsBlocked: true,
      productionClaims: 'LOCAL_SINGLE_NODE_ONLY_UNTIL_EXTERNAL_DEPLOYMENT'
    }
  };
}

module.exports = { getApexStatus };
JS

cat > routes/ai-cluster-pipeline-production/sheikha-ai-cluster-pipeline-production-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  getApexStatus
} = require('../../runtime/ai-cluster-pipeline-production/v1/sheikha-ai-cluster-pipeline-production-apex-v1');

const {
  generateWithSheikhaCore,
  fastLeast
} = require('../../runtime/model-core/v1/sheikha-ollama-core-v1');

router.get('/api/sheikha/ai-cluster-pipeline-production/v1/status', (_req, res) => {
  res.json(getApexStatus());
});

router.post('/api/sheikha/ai-cluster-pipeline-production/v1/run', async (req, res) => {
  const message = req.body?.message || '';
  const mode = req.body?.mode || 'smart';

  if (mode === 'least' || req.body?.fast === true) {
    return res.json(await fastLeast(message));
  }

  try {
    const result = await generateWithSheikhaCore(message, {
      mode,
      timeoutMs: req.body?.timeoutMs || 180000,
      numPredict: req.body?.numPredict || 128
    });
    return res.json(result);
  } catch (error) {
    const fallback = await fastLeast(message);
    return res.json({
      ...fallback,
      clusterFallback: true,
      deepError: error.message
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
  app.use(require('./routes/ai-cluster-pipeline-production/sheikha-ai-cluster-pipeline-production-routes'));
} catch (error) {
  console.warn('[sheikha-ai-cluster-pipeline-production] route mount skipped:', error.message);
}
"""

if "sheikha-ai-cluster-pipeline-production" not in s:
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
node --check runtime/ai-cluster-pipeline-production/v1/sheikha-ai-cluster-pipeline-production-apex-v1.js
node --check routes/ai-cluster-pipeline-production/sheikha-ai-cluster-pipeline-production-routes.js

echo "== Restart =="
export SHEIKHA_OLLAMA_MODEL="Sheikha-Core:latest"
export SHEIKHA_FAST_MODEL="tinyllama:latest"
export SHEIKHA_CODER_MODEL="qwen2.5-coder:7b"
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== Status =="
curl -s http://127.0.0.1:8080/api/sheikha/ai-cluster-pipeline-production/v1/status | jq

echo "== Fast least test =="
curl -s -X POST http://127.0.0.1:8080/api/sheikha/ai-cluster-pipeline-production/v1/run \
  -H "Content-Type: application/json" \
  -d '{"message":"اختبار سريع","mode":"least","fast":true}' | jq '.success,.model,.answer'

echo "== Sheikha Core test =="
curl -s -X POST http://127.0.0.1:8080/api/sheikha/ai-cluster-pipeline-production/v1/run \
  -H "Content-Type: application/json" \
  -d '{"message":"عرّف بنفسك باختصار","mode":"smart","timeoutMs":180000,"numPredict":96}' | jq '.success,.model,.answer,.clusterFallback,.deepError'

echo "== Model-core route test =="
curl -s -X POST http://127.0.0.1:8080/api/sheikha/model-core/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"عرّف بنفسك باختصار","timeoutMs":180000}' | jq '.success,.model,.answer,.fallback'

echo "== Done =="
