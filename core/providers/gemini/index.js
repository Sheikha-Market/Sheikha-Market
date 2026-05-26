'use strict';

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
  }
};
