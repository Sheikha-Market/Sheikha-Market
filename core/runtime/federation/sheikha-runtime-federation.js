'use strict';

const { getToolsetsStatus } = require('../bus/sheikha-mcp-toolsets-registry');

const FEDERATED_SYSTEMS = [
  { id: 'local-runtime', name: 'Sheikha Local Runtime', entrance: 'http://127.0.0.1:8080', role: 'canonical-runtime' },
  { id: 'companion-runtime', name: 'Sheikha Companion Runtime', entrance: 'http://127.0.0.1:8082', role: 'companion-runtime' },
  { id: 'vscode-extension', name: 'Sheikha VS Code Extension', entrance: 'sheikha.sheikha', role: 'ide-surface' },
  { id: 'ollama-core', name: 'Sheikha-Core Ollama', entrance: 'http://127.0.0.1:11434', role: 'local-ai-provider' },
  { id: 'github-mcp', name: 'GitHub MCP Toolsets', entrance: 'mcp://github', role: 'source-control-federation' },
  { id: 'mcp-sdk', name: 'MCP SDK', entrance: 'mcp://sheikha-root-neural', role: 'tool-federation' }
];

function status() {
  const toolsets = getToolsetsStatus();
  const systems = FEDERATED_SYSTEMS.map((system) => ({
    ...system,
    status: system.id === 'local-runtime'
      ? 'active-local'
      : system.id === 'github-mcp'
        ? 'registered-optional-external'
        : 'registered-not-liveness-verified',
    governed: true,
    requiredForLocalRuntime: system.id === 'local-runtime',
    livenessVerified: system.id === 'local-runtime'
  }));
  return {
    success: true,
    name: 'Sheikha Runtime Federation',
    status: 'active',
    mode: 'distributed-root-runtime-federation',
    systems,
    toolsets: {
      status: toolsets.status,
      count: toolsets.count,
      categories: toolsets.categories
    },
    governance: {
      tawheed: true,
      basis: 'quran-and-sunnah',
      humanAuthority: true,
      noBlindExternalTrust: true,
      localFirst: true,
      auditRequired: true
    },
    offlineOperation: {
      githubRequired: false,
      gitlabRequired: false,
      externalCloudRequired: false,
      localRuntimeIndependent: true
    },
    liveness: {
      registered: systems.length,
      verifiedLive: systems.filter((system) => system.livenessVerified).length,
      allRegisteredSystemsLive: false,
      registryStatusDoesNotClaimRemoteLiveness: true
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = { status };
