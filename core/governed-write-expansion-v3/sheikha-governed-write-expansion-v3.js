'use strict';

const {
  governedExpandFederation,
  evaluateWritePolicy
} = require('../governed-write-expansion/sheikha-governed-write-expansion-v2');

const relationshipRegistry = Object.freeze([
  'BELONGS_TO',
  'DEPENDS_ON',
  'IMPLEMENTS',
  'EXTENDS',
  'PROVIDES',
  'CONSUMES',
  'HOSTS',
  'EXECUTES',
  'SUPERVISES',
  'AUDITS',
  'GOVERNS',
  'OBSERVES',
  'CONNECTS_TO',
  'DISCOVERS',
  'GENERATES',
  'REPORTS_TO',
  'PUBLISHES',
  'SUBSCRIBES',
  'SCALES_WITH',
  'FEDERATES_WITH',
  'COMPATIBLE_WITH',
  'REQUIRES',
  'OPTIONAL_WITH',
  'ISOLATED_FROM',
  'VALIDATES'
]);

const blueprintLibrary = Object.freeze({
  OPERATING_SYSTEM: {
    version: '1.0.0',
    fabrics: ['industrial', 'capability', 'service', 'api', 'sdk', 'runtime', 'application', 'knowledge', 'governance', 'inspector', 'observability'],
    clusters: ['kernel', 'filesystem', 'drivers', 'memory', 'scheduler', 'ipc', 'networking', 'security', 'services', 'monitoring']
  },
  LANGUAGE: {
    version: '1.0.0',
    fabrics: ['compiler', 'toolchain', 'sdk', 'runtime', 'api', 'governance', 'inspector', 'observability'],
    clusters: ['lexer', 'parser', 'ast', 'ir', 'compiler', 'optimizer', 'formatter', 'linter', 'package-manager', 'debugger', 'runtime']
  },
  DATABASE: {
    version: '1.0.0',
    fabrics: ['storage', 'query', 'driver', 'api', 'sdk', 'backup', 'governance', 'inspector', 'observability'],
    clusters: ['storage', 'replication', 'transactions', 'query-engine', 'optimizer', 'backup', 'security', 'drivers']
  },
  AI: {
    version: '1.0.0',
    fabrics: ['model', 'agent', 'tool', 'rag', 'memory', 'evaluation', 'guardrails', 'knowledge', 'governance', 'inspector'],
    clusters: ['models', 'agents', 'tools', 'mcp', 'rag', 'memory', 'planning', 'evaluation', 'guardrails']
  }
});

function resolveExpansionBlueprint(type = 'CUSTOM') {
  return blueprintLibrary[type] || {
    version: '1.0.0',
    fabrics: ['registry', 'graph', 'capability', 'service', 'api', 'governance', 'inspector', 'observability'],
    clusters: ['registry', 'graph', 'governance', 'inspector', 'observability']
  };
}

function buildFabricNodes(federationId, blueprint) {
  return blueprint.fabrics.map((fabric) => ({
    id: `${federationId}:${fabric}-fabric`,
    type: 'GENERATED_FABRIC',
    fabric,
    blueprintVersion: blueprint.version
  }));
}

function buildClusterNodes(federationId, blueprint) {
  return blueprint.clusters.map((cluster) => ({
    id: `${federationId}:${cluster}-cluster`,
    type: 'GENERATED_CLUSTER',
    cluster,
    blueprintVersion: blueprint.version
  }));
}

function buildExpansionRelations(federation, fabrics, clusters) {
  const relations = [];

  for (const fabric of fabrics) {
    relations.push({ from: federation.id, to: fabric.id, type: 'GENERATES' });
    relations.push({ from: fabric.id, to: 'governance-federation', type: 'GOVERNED_BY' });
  }

  for (const cluster of clusters) {
    relations.push({ from: federation.id, to: cluster.id, type: 'PROVIDES' });
    relations.push({ from: cluster.id, to: 'inspector-federation', type: 'OBSERVES' });
  }

  return relations;
}

function governedExpandFederationV3(request = {}) {
  const policy = evaluateWritePolicy(request);
  if (!policy.passed) {
    return {
      system: 'SHEIKHA_GOVERNED_WRITE_EXPANSION_FABRIC_V3',
      status: 'BLOCKED',
      mode: 'GOVERNED_READ_WRITE',
      policy,
      result: null
    };
  }

  const v2 = governedExpandFederation(request);
  const blueprint = resolveExpansionBlueprint(request.type);
  const fabrics = buildFabricNodes(v2.federation.id, blueprint);
  const clusters = buildClusterNodes(v2.federation.id, blueprint);
  const generatedRelations = buildExpansionRelations(v2.federation, fabrics, clusters);

  return {
    system: 'SHEIKHA_GOVERNED_WRITE_EXPANSION_FABRIC_V3',
    status: 'COMMITTED',
    mode: 'GOVERNED_READ_WRITE_FULL_BLUEPRINT_EXPANSION',
    writeScope: 'SHEIKHA_INTERNAL_REGISTRY_AND_GRAPH_ONLY',
    safety: v2.safety,
    policy,
    relationshipRegistry,
    blueprint: {
      type: request.type || 'CUSTOM',
      version: blueprint.version,
      fabrics: blueprint.fabrics,
      clusters: blueprint.clusters
    },
    baseExpansion: v2,
    generated: {
      fabrics,
      clusters,
      relations: generatedRelations
    },
    audit: {
      action: 'GOVERNED_FULL_BLUEPRINT_EXPANSION_COMMITTED',
      actor: request.actor || 'system',
      at: new Date().toISOString()
    }
  };
}

module.exports = {
  relationshipRegistry,
  blueprintLibrary,
  resolveExpansionBlueprint,
  governedExpandFederationV3
};
