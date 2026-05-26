'use strict';

module.exports = {
  provider: 'SHEIKHA_LOCAL_PROVIDER',
  sovereign: true,
  offlineCapable: true,
  priority: 1,
  capabilities: ['governance', 'routing', 'fallback-answer', 'local-runtime-status'],
  status() {
    return {
      success: true,
      provider: 'local',
      runtime: 'ACTIVE',
      sovereign: true,
      localFirst: true,
      offlineCapable: true,
      timestamp: new Date().toISOString()
    };
  },
  async ask({ prompt }) {
    return {
      success: true,
      provider: 'local',
      output: [
        'Sheikha local provider active.',
        'External AI providers are optional; local governance and routing remain available.',
        prompt ? `Prompt received: ${String(prompt).slice(0, 500)}` : 'No prompt supplied.'
      ].join('\n'),
      timestamp: new Date().toISOString()
    };
  }
};
