'use strict';

const OLLAMA_URL = process.env.OLLAMA_HOST || process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const MODEL = process.env.SHEIKHA_CORE_MODEL || 'Sheikha-Core';
const TIMEOUT_MS = Number(process.env.SHEIKHA_CORE_TIMEOUT_MS || 30000);
const NUM_CTX = Number(process.env.SHEIKHA_CORE_NUM_CTX || 2048);
const NUM_PREDICT = Number(process.env.SHEIKHA_CORE_NUM_PREDICT || 256);
const KEEP_ALIVE = process.env.SHEIKHA_CORE_KEEP_ALIVE || '10m';

async function _fetchWithTimeout(url, opts = {}, ms = TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function _isOnline() {
  try {
    const res = await _fetchWithTimeout(`${OLLAMA_URL}/api/tags`, { method: 'GET' }, 3000);
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.models);
  } catch {
    return false;
  }
}

module.exports = {
  provider: 'SHEIKHA_OLLAMA_PROVIDER',
  sovereign: true,
  localFirst: true,
  offlineCapable: false,
  priority: 2,
  endpoint: OLLAMA_URL,
  model: MODEL,
  capabilities: ['local-llm', 'sheikha-core', 'private-inference', 'arabic-native'],

  async status() {
    const online = await _isOnline();
    return {
      success: true,
      provider: 'ollama',
      configured: true,
      online,
      endpoint: OLLAMA_URL,
      model: MODEL,
      localFirst: true,
      runtime: online ? 'ONLINE' : 'OFFLINE',
      timestamp: new Date().toISOString()
    };
  },

  async ask({ prompt, system, model: reqModel, options = {} }) {
    const usedModel = reqModel || MODEL;
    const systemPrompt = system || 'أنت Sheikha-Core. أجب مباشرة بالعربية عند الطلب، وباختصار وصدق.';

    const body = JSON.stringify({
      model: usedModel,
      prompt: [
        '<|start_header_id|>system<|end_header_id|>',
        '',
        systemPrompt,
        '<|eot_id|>',
        '<|start_header_id|>user<|end_header_id|>',
        '',
        prompt,
        '<|eot_id|>',
        '<|start_header_id|>assistant<|end_header_id|>',
        ''
      ].join('\n'),
      raw: true,
      stream: false,
      keep_alive: KEEP_ALIVE,
      options: {
        temperature: options.temperature ?? 0.2,
        num_ctx: options.num_ctx ?? NUM_CTX,
        num_predict: options.num_predict ?? NUM_PREDICT,
        top_p: options.top_p ?? 0.85,
        ...options
      }
    });

    try {
      const res = await _fetchWithTimeout(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      }, TIMEOUT_MS);

      if (!res.ok) {
        return {
          success: false,
          provider: 'ollama',
          error: `http_${res.status}`,
          output: null
        };
      }

      const data = await res.json();
      return {
        success: true,
        provider: 'ollama',
        model: usedModel,
        output: data.response || '',
        localModelOnline: true,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        success: false,
        provider: 'ollama',
        error: err.name === 'AbortError' ? 'timeout' : err.message,
        output: null,
        localModelOnline: false
      };
    }
  },

  async generate(prompt, opts = {}) {
    return this.ask({ prompt, ...opts });
  }
};
