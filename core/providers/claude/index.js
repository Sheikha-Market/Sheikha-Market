'use strict';

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
  }
};
