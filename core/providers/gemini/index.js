'use strict';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-1.5-flash';
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
  provider: 'SHEIKHA_GEMINI_PROVIDER',
  sovereign: false,
  external: true,
  priority: 5,
  capabilities: ['cloud-llm', 'multimodal'],

  status() {
    return {
      success: true,
      provider: 'gemini',
      configured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      external: true,
      role: 'replaceable-provider',
      runtimeBlocking: false,
      timestamp: new Date().toISOString()
    };
  },

  async ask({ prompt, system, model: reqModel, options = {} }) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return { success: false, provider: 'gemini', error: 'no_api_key', output: null };
    }

    const usedModel = reqModel || DEFAULT_MODEL;
    const parts = [];
    if (system) parts.push({ text: `${system}\n\n` });
    parts.push({ text: prompt });

    const reqBody = {
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.max_tokens ?? 512
      }
    };

    const url = `${GEMINI_BASE}/models/${usedModel}:generateContent?key=${apiKey}`;

    try {
      const res = await _fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      }, TIMEOUT_MS);

      if (!res.ok) {
        return { success: false, provider: 'gemini', error: `http_${res.status}`, output: null };
      }
      const data = await res.json();
      const output = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { success: true, provider: 'gemini', model: usedModel, output, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, provider: 'gemini', error: err.name === 'AbortError' ? 'timeout' : err.message, output: null };
    }
  }
};
