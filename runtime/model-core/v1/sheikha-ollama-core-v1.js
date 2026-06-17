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
