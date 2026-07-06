'use strict';

const store = require('./store');

const CORE_SERVICES = Object.freeze([
  ['governance-admission', 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1'],
  ['orchestrator-fabric', 'SHEIKHA_ORCHESTRATOR_FABRIC_V2_L11'],
  ['conversation-engine', 'SHEIKHA_CONVERSATION_ENGINE_V1'],
  ['sdk-fabric-mcp-integration', 'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1'],
  ['mcp-unified-bridge', 'SHEIKHA_MCP_UNIFIED_BRIDGE'],
  ['foundry', 'SHEIKHA_FOUNDRY_V3'],
  ['knowledge-fabric', 'SHEIKHA_ROOT_KNOWLEDGE_FABRIC'],
  ['enterprise-saas', 'SHEIKHA_ENTERPRISE_SAAS_V2'],
  ['global-control-plane', 'SHEIKHA_GLOBAL_CONTROL_PLANE_V1'],
  ['enterprise-inspector', 'SHEIKHA_ENTERPRISE_INSPECTOR_V3'],
  ['runtime-fabric', 'SHEIKHA_RUNTIME_FABRIC_V5']
]);

function seed() {
  const state = store.read();
  const missing = CORE_SERVICES.filter(([id]) => !state.services.some(service => service.id === id));
  if (!missing.length) return state.services;
  store.transact({ action: 'CORE_SERVICES_REGISTERED', metadata: { count: missing.length } }, draft => {
    const now = new Date().toISOString();
    for (const [id, system] of missing) {
      draft.services.push({
        id, system, status: 'ACTIVE', kind: 'IN_PROCESS', endpoint: null,
        registeredAt: now, lastHeartbeat: now
      });
    }
    return { id: 'core-services', count: missing.length };
  });
  return store.read().services;
}

function register(input = {}, actorId = 'runtime-fabric-v5') {
  const id = String(input.id || '').trim();
  const system = String(input.system || '').trim();
  if (!id || !system) {
    const error = new Error('Service id and system are required.');
    error.code = 'SERVICE_VALIDATION_ERROR';
    error.statusCode = 400;
    throw error;
  }
  return store.transact({ action: 'SERVICE_REGISTERED', actorId, resourceId: id }, state => {
    const existing = state.services.find(service => service.id === id);
    const now = new Date().toISOString();
    if (existing) {
      Object.assign(existing, {
        system, status: input.status || 'ACTIVE', kind: input.kind || existing.kind,
        endpoint: input.endpoint || existing.endpoint, lastHeartbeat: now
      });
      return existing;
    }
    const service = {
      id, system, status: input.status || 'ACTIVE', kind: input.kind || 'IN_PROCESS',
      endpoint: input.endpoint || null, registeredAt: now, lastHeartbeat: now
    };
    state.services.push(service);
    return service;
  });
}

function list() {
  seed();
  return store.read().services;
}

function status() {
  const services = list();
  return {
    registry: 'SHEIKHA_RUNTIME_FABRIC_V5_SERVICE_REGISTRY',
    status: 'ACTIVE',
    services,
    active: services.filter(service => service.status === 'ACTIVE').length
  };
}

module.exports = { CORE_SERVICES, list, register, seed, status };
