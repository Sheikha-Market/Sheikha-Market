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
