'use strict';

const services = Object.freeze({
  CHAT: { status: 'ACTIVE', capability: 'chat' },
  AI: { status: 'ACTIVE', capability: 'ai' },
  GOVERNANCE: { status: 'ACTIVE', capability: 'governance' },
  INSPECTOR: { status: 'ACTIVE', capability: 'inspector' },
  EXTENSION: { status: 'ACTIVE', capability: 'extension' },
  MCP: { status: 'ACTIVE', capability: 'mcp' },
  SDK: { status: 'BOOTSTRAPPED', capability: 'sdk' },
  RUNTIME: { status: 'ACTIVE', capability: 'runtime' }
});

function listServices() {
  return services;
}

module.exports = { listServices };
