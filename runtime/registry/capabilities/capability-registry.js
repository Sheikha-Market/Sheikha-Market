'use strict';

const capabilities = Object.freeze({
  ai: { id: 'ai', status: 'ACTIVE', scope: ['chat', 'analysis', 'coding'] },
  governance: { id: 'governance', status: 'ACTIVE', scope: ['policy', 'admission', 'audit'] },
  chat: { id: 'chat', status: 'ACTIVE', endpoints: ['/api/sheikha/chat', '/api/sheikha/unified-chat'] },
  extension: { id: 'extension', status: 'ACTIVE', endpoints: ['/api/sheikha/extension/chat'] },
  inspector: { id: 'inspector', status: 'ACTIVE', scope: ['runtime', 'git', 'chat', 'governance'] },
  mcp: { id: 'mcp', status: 'ACTIVE', scope: ['tools', 'providers', 'execution-context'] },
  sdk: { id: 'sdk', status: 'BOOTSTRAPPED', languages: ['node', 'python'] },
  runtime: { id: 'runtime', status: 'ACTIVE', ports: [8080, 9191] }
});

function listCapabilities() {
  return capabilities;
}

function getCapability(id) {
  return capabilities[id] || null;
}

module.exports = { listCapabilities, getCapability };
