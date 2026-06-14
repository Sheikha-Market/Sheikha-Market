'use strict';

const services = Object.freeze({
  CHAT: { status: 'ACTIVE', capability: 'chat' },
  AI: { status: 'ACTIVE', capability: 'ai' },
  GOVERNANCE: { status: 'ACTIVE', capability: 'governance' },
  INSPECTOR: { status: 'ACTIVE', capability: 'inspector' },
  EXTENSION: { status: 'ACTIVE', capability: 'extension' },
  MCP: { status: 'ACTIVE', capability: 'mcp' },
  SDK: { status: 'ACTIVE', capability: 'sdk' },
  CLI: { status: 'ACTIVE', capability: 'cli' },
  ENTERPRISE_SAAS_V2: { status: 'ACTIVE', capability: 'enterpriseSaasV2' },
  RUNTIME: { status: 'ACTIVE', capability: 'runtime' }
});

function listServices() {
  return services;
}

module.exports = { listServices };
