'use strict';

const { getToolsetsStatus } = require('../../runtime/bus/sheikha-mcp-toolsets-registry');

const state = {
  name: 'Sheikha Root Neural Mesh',
  status: 'active',
  mode: 'complete-governed-root-neural-mesh',
  integrations: ['VS Code','Codex','Copilot','GitHub','GitLab','MCP','Ollama','Sheikha-Core'],
  fabrics: {
    runtimeBus: true,
    neuralFabric: true,
    eventFabric: true,
    orchestrationEngine: true,
    recoveryEngine: true,
    federation: true,
    synchronization: true
  },
  governance: {
    tawheed: true,
    basis: 'quran-and-sunnah',
    noConsciousnessClaim: true,
    noGhaybPrediction: true,
    noCreationClaim: true,
    humanAuthority: true
  }
};

function status() {
  const toolsets = getToolsetsStatus();
  return {
    ...state,
    toolsets: toolsets.toolsets.map(toolset => toolset.id),
    toolsetsCount: toolsets.count,
    toolsetsRegistry: {
      status: toolsets.status,
      count: toolsets.count,
      categories: toolsets.categories
    }
  };
}

module.exports = { status };
