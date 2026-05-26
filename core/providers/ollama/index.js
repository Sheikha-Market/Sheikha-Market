'use strict';

const OLLAMA_URL = process.env.OLLAMA_HOST || process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const MODEL = process.env.SHEIKHA_CORE_MODEL || 'Sheikha-Core';

module.exports = {
  provider: 'SHEIKHA_OLLAMA_PROVIDER',
  sovereign: true,
  localFirst: true,
  offlineCapable: false,
  priority: 2,
  endpoint: OLLAMA_URL,
  model: MODEL,
  capabilities: ['local-llm', 'sheikha-core', 'private-inference'],
  status() {
    return {
      success: true,
      provider: 'ollama',
      configured: true,
      endpoint: OLLAMA_URL,
      model: MODEL,
      localFirst: true,
      runtime: 'AVAILABLE_WHEN_OLLAMA_RUNNING',
      timestamp: new Date().toISOString()
    };
  }
};
