'use strict';

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
  }
};
