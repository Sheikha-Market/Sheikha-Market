'use strict';

const crypto = require('crypto');

const registry = new Map();

function stableId(input = {}) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({
      type: input.type || 'custom',
      name: input.name || 'unnamed',
      family: input.family || 'general'
    }))
    .digest('hex')
    .slice(0, 16);
}

function normalizeFederation(input = {}) {
  const id = input.id || `fed-${stableId(input)}`;
  const family = input.family || 'general-family';

  return {
    id,
    type: input.type || 'CUSTOM_FEDERATION',
    name: input.name || 'Unnamed Federation',
    family,
    status: 'REGISTERED',
    mode: 'READ_ONLY_REGISTRY',
    clusters: Array.isArray(input.clusters) ? input.clusters : [],
    capabilities: Array.isArray(input.capabilities) ? input.capabilities : [],
    metadata: input.metadata || {},
    governance: {
      noHarm: true,
      humanReviewRequired: true,
      autoLinked: true,
      productionClaim: false
    },
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function buildAutoRelations(record) {
  return [
    { from: record.id, to: record.family, type: 'BELONGS_TO_FAMILY' },
    { from: record.id, to: 'governance-federation', type: 'GOVERNED_BY' },
    { from: record.id, to: 'capability-fabric', type: 'DECLARES_CAPABILITIES' },
    { from: record.id, to: 'observability-fabric', type: 'OBSERVED_BY' },
    { from: record.id, to: 'enterprise-federation', type: 'AVAILABLE_TO_ENTERPRISE' }
  ];
}

function registerFederation(input = {}) {
  const record = normalizeFederation(input);
  const relations = buildAutoRelations(record);

  const stored = {
    ...record,
    relations,
    audit: [{
      action: 'FEDERATION_REGISTERED',
      at: new Date().toISOString(),
      actor: input.actor || 'system',
      reason: input.reason || 'Dynamic federation registration'
    }]
  };

  registry.set(record.id, stored);
  return stored;
}

function registerFamily(family = {}) {
  const record = {
    id: family.id || `family-${stableId({ type: 'family', name: family.name, family: family.parent || 'root' })}`,
    type: 'FEDERATION_FAMILY',
    name: family.name || 'Unnamed Family',
    parent: family.parent || 'federation-of-federations',
    clusters: Array.isArray(family.clusters) ? family.clusters : [],
    governance: {
      noHarm: true,
      humanReviewRequired: true,
      productionClaim: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  registry.set(record.id, record);
  return record;
}

function listFederations() {
  return Array.from(registry.values());
}

function getFederation(id) {
  return registry.get(id) || null;
}

function buildRegistryGraph() {
  const nodes = [];
  const edges = [];

  for (const record of registry.values()) {
    nodes.push({
      id: record.id,
      label: record.name,
      type: record.type,
      family: record.family || record.parent || null
    });

    for (const relation of record.relations || []) {
      edges.push(relation);
    }

    if (record.parent) {
      edges.push({ from: record.id, to: record.parent, type: 'BELONGS_TO_PARENT' });
    }
  }

  return {
    system: 'SHEIKHA_DYNAMIC_FEDERATION_REGISTRY_GRAPH_V1',
    status: 'ACTIVE',
    mode: 'READ_ONLY_DYNAMIC_REGISTRY_GRAPH',
    nodes,
    edges,
    summary: {
      federations: nodes.length,
      relations: edges.length
    }
  };
}

module.exports = {
  normalizeFederation,
  registerFederation,
  registerFamily,
  listFederations,
  getFederation,
  buildRegistryGraph
};
