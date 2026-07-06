'use strict';

const CLAUDE_BASE = 'https://api.anthropic.com/v1';
const DEFAULT_MODEL = 'claude-3-haiku-20240307';
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
  provider: 'SHEIKHA_CLAUDE_PROVIDER',
  sovereign: false,
  external: true,
  priority: 4,
  capabilities: ['cloud-llm', 'agentic-coding'],

  status() {
    return {
      success: true,
      provider: 'claude',
      configured: Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
      external: true,
      role: 'replaceable-provider',
      runtimeBlocking: false,
      timestamp: new Date().toISOString()
    };
  },

  async ask({ prompt, system, model: reqModel, options = {} }) {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return { success: false, provider: 'claude', error: 'no_api_key', output: null };
    }

    const usedModel = reqModel || DEFAULT_MODEL;
    const messages = [{ role: 'user', content: prompt }];

    const reqBody = {
      model: usedModel,
      max_tokens: options.max_tokens ?? 512,
      messages
    };
    if (system) reqBody.system = system;

    try {
      const res = await _fetchWithTimeout(`${CLAUDE_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(reqBody)
      }, TIMEOUT_MS);

      if (!res.ok) {
        return { success: false, provider: 'claude', error: `http_${res.status}`, output: null };
      }
      const data = await res.json();
      const output = data.content?.[0]?.text || '';
      return { success: true, provider: 'claude', model: usedModel, output, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, provider: 'claude', error: err.name === 'AbortError' ? 'timeout' : err.message, output: null };
    }
  }
};
