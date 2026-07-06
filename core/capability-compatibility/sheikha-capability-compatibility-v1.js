'use strict';

const capabilityRegistry = Object.freeze([
  { id: 'runtime-hosting', type: 'runtime', reusable: true },
  { id: 'container-hosting', type: 'container', reusable: true },
  { id: 'orchestration', type: 'container', reusable: true },
  { id: 'observability', type: 'monitoring', reusable: true },
  { id: 'governance', type: 'policy', reusable: true },
  { id: 'storage', type: 'data', reusable: true },
  { id: 'query', type: 'data', reusable: true },
  { id: 'backup', type: 'data', reusable: true },
  { id: 'messaging', type: 'integration', reusable: true },
  { id: 'ai-inference', type: 'ai', reusable: true },
  { id: 'knowledge-retrieval', type: 'knowledge', reusable: true },
  { id: 'security-observation', type: 'security', reusable: true }
]);

const compatibilityMatrix = Object.freeze([
  { from: 'linux-family', to: 'docker-federation', type: 'COMPATIBLE_WITH', confidence: 0.95 },
  { from: 'linux-family', to: 'kubernetes-federation', type: 'COMPATIBLE_WITH', confidence: 0.95 },
  { from: 'windows-family', to: 'hyper-v-federation', type: 'COMPATIBLE_WITH', confidence: 0.9 },
  { from: 'apple-family', to: 'darwin-family', type: 'COMPATIBLE_WITH', confidence: 0.9 },
  { from: 'postgresql-federation', to: 'linux-family', type: 'RUNS_ON', confidence: 0.95 },
  { from: 'nodejs-federation', to: 'linux-family', type: 'RUNS_ON', confidence: 0.9 },
  { from: 'nodejs-federation', to: 'windows-family', type: 'RUNS_ON', confidence: 0.85 },
  { from: 'nodejs-federation', to: 'apple-family', type: 'RUNS_ON', confidence: 0.85 }
]);

function listCapabilities() {
  return capabilityRegistry;
}

function findCapability(id) {
  return capabilityRegistry.find((capability) => capability.id === id) || null;
}

function buildCapabilityGraph(federation = {}) {
  const federationId = federation.id || federation.name || 'unknown-federation';
  const capabilities = Array.isArray(federation.capabilities) ? federation.capabilities : [];

  const nodes = [
    { id: federationId, type: 'FEDERATION', label: federation.name || federationId },
    ...capabilities.map((capability) => ({
      id: capability,
      type: 'CAPABILITY',
      reusable: Boolean(findCapability(capability)?.reusable)
    }))
  ];

  const edges = capabilities.map((capability) => ({
    from: federationId,
    to: capability,
    type: 'PROVIDES'
  }));

  return {
    system: 'SHEIKHA_CAPABILITY_GRAPH_V1',
    status: 'ACTIVE',
    mode: 'GOVERNED_INTERNAL_CAPABILITY_MAPPING',
    nodes,
    edges,
    summary: {
      capabilities: capabilities.length,
      reusable: capabilities.filter((capability) => findCapability(capability)?.reusable).length
    }
  };
}

function queryCompatibility(entityId) {
  return compatibilityMatrix.filter(
    (relation) => relation.from === entityId || relation.to === entityId
  );
}

function evaluateCompatibility(from, to) {
  const relation = compatibilityMatrix.find(
    (item) => item.from === from && item.to === to
  );

  return {
    system: 'SHEIKHA_COMPATIBILITY_MATRIX_V1',
    status: relation ? 'COMPATIBLE' : 'UNKNOWN',
    compatible: Boolean(relation),
    relation: relation || null,
    safety: {
      advisoryOnly: true,
      noExternalMutation: true,
      noHarm: true
    }
  };
}

module.exports = {
  capabilityRegistry,
  compatibilityMatrix,
  listCapabilities,
  findCapability,
  buildCapabilityGraph,
  queryCompatibility,
  evaluateCompatibility
};
