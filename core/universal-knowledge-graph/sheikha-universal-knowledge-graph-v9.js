'use strict';

const {
  applyTemplateToDna
} = require('../universal-template-engine/sheikha-universal-template-engine-v8');

const relationDictionary = Object.freeze([
  'BELONGS_TO',
  'PART_OF',
  'PARENT_OF',
  'CHILD_OF',
  'DEPENDS_ON',
  'REQUIRED_BY',
  'IMPLEMENTS',
  'EXTENDS',
  'SPECIALIZES',
  'PROVIDES',
  'CONSUMES',
  'HOSTS',
  'EXECUTES',
  'MANAGES',
  'GOVERNS',
  'AUDITS',
  'OBSERVES',
  'INSPECTS',
  'CONNECTS_TO',
  'DISCOVERS',
  'GENERATES',
  'PUBLISHES',
  'SUBSCRIBES',
  'FEDERATES_WITH',
  'COMPATIBLE_WITH',
  'ISOLATED_FROM',
  'REPLACES',
  'VERSION_OF'
]);

function node(id, type, data = {}) {
  return { id, type, ...data };
}

function edge(from, to, type, data = {}) {
  if (!relationDictionary.includes(type)) {
    throw new Error(`UNKNOWN_RELATION_TYPE:${type}`);
  }

  return { from, to, type, ...data };
}

function buildKnowledgeGraphFromTemplate(dna = {}) {
  const expansion = applyTemplateToDna(dna);

  if (expansion.status !== 'COMMITTED') {
    return {
      system: 'SHEIKHA_UNIVERSAL_KNOWLEDGE_GRAPH_V9',
      status: expansion.status,
      expansion,
      nodes: [],
      edges: []
    };
  }

  const federationId =
    expansion.result?.result?.result?.expansion?.expansion?.baseExpansion?.federation?.id ||
    expansion.result?.result?.result?.expansion?.baseExpansion?.federation?.id ||
    `federation:${dna.name}`;

  const nodes = [
    node(federationId, 'FEDERATION', { name: dna.name }),
    node(`family:${dna.family}`, 'FAMILY', { name: dna.family }),
    node(`blueprint:${dna.blueprint}`, 'BLUEPRINT', { name: dna.blueprint }),
    node(`template:${dna.blueprint}:${expansion.template.templateVersion}`, 'TEMPLATE', {
      blueprint: dna.blueprint,
      version: expansion.template.templateVersion
    })
  ];

  const edges = [
    edge(federationId, `family:${dna.family}`, 'BELONGS_TO'),
    edge(federationId, `blueprint:${dna.blueprint}`, 'IMPLEMENTS'),
    edge(`blueprint:${dna.blueprint}`, `template:${dna.blueprint}:${expansion.template.templateVersion}`, 'GENERATES')
  ];

  for (const fabric of expansion.dna.fabrics || []) {
    const id = `${federationId}:fabric:${fabric}`;
    nodes.push(node(id, 'FABRIC', { name: fabric }));
    edges.push(edge(federationId, id, 'GENERATES'));
  }

  for (const cluster of expansion.dna.clusters || []) {
    const id = `${federationId}:cluster:${cluster}`;
    nodes.push(node(id, 'CLUSTER', { name: cluster }));
    edges.push(edge(federationId, id, 'PROVIDES'));
  }

  for (const capability of expansion.dna.capabilities || []) {
    const id = `capability:${capability}`;
    nodes.push(node(id, 'CAPABILITY', { name: capability }));
    edges.push(edge(federationId, id, 'PROVIDES'));
  }

  return {
    system: 'SHEIKHA_UNIVERSAL_KNOWLEDGE_GRAPH_V9',
    status: 'ACTIVE',
    mode: 'GOVERNED_UNIVERSAL_KNOWLEDGE_GRAPH',
    expansion,
    relationDictionary,
    nodes,
    edges,
    summary: {
      nodes: nodes.length,
      edges: edges.length
    },
    safety: {
      governedInternalGraphOnly: true,
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noExternalMutation: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noHarm: true
    }
  };
}

module.exports = {
  relationDictionary,
  node,
  edge,
  buildKnowledgeGraphFromTemplate
};
