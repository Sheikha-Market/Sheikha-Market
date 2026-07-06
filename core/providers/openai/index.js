'use strict';

const OPENAI_BASE = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
const TIMEOUT_MS = 30000;

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

module.exports = {
  provider: 'SHEIKHA_OPENAI_PROVIDER',
  sovereign: false,
  external: true,
  priority: 3,
  capabilities: ['cloud-llm', 'vision-capable', 'tool-calling'],

  status() {
    return {
      success: true,
      provider: 'openai',
      configured: Boolean(process.env.OPENAI_API_KEY),
      external: true,
      role: 'replaceable-provider',
      runtimeBlocking: false,
      timestamp: new Date().toISOString()
    };
  },

  async ask({ prompt, system, model: reqModel, options = {} }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { success: false, provider: 'openai', error: 'no_api_key', output: null };
    }

    const usedModel = reqModel || DEFAULT_MODEL;
    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: prompt });

    try {
      const res = await _fetchWithTimeout(`${OPENAI_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: usedModel,
          messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.max_tokens ?? 512
        })
      }, TIMEOUT_MS);

      if (!res.ok) {
        return { success: false, provider: 'openai', error: `http_${res.status}`, output: null };
      }
      const data = await res.json();
      const output = data.choices?.[0]?.message?.content || '';
      return { success: true, provider: 'openai', model: usedModel, output, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, provider: 'openai', error: err.name === 'AbortError' ? 'timeout' : err.message, output: null };
    }
  }
};
