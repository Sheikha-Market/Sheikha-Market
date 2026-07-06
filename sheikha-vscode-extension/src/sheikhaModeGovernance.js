'use strict';

const { detectIntent } = require('./sheikhaIntentRouter');

function governMode(message, selectedMode = 'agentic') {
  const intent = detectIntent(message, selectedMode);

  const map = {
    CHAT: 'agentic',
    CODE: 'coding',
    DEBUG: 'debug',
    CLI: 'cli',
    RAG: 'rag',
    MCP: 'mcp',
    SDK: 'sdk',
    GRAPHICS: 'graphics',
    ENVIRONMENT: 'environment',
    GLOBAL_REGISTRY: 'registry',
    TODO: 'todo',
    TAG: 'tag'
  };

  return {
    requestedMode: selectedMode,
    intent,
    effectiveMode: map[intent] || selectedMode,
    governed: true,
    transition: intent === 'CHAT' ? 'manual_or_agent' : 'auto',
    reason: `intent=${intent}; selected=${selectedMode}; effective=${map[intent] || selectedMode}`
  };
}

module.exports = { governMode };
