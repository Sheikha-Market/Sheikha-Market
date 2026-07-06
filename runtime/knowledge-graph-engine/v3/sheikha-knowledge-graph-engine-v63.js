'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
    status: 'ACTIVE',
    apexLevel: 63,
    role: 'UNIFIED_ENTITY_RELATION_KNOWLEDGE_GRAPH_ENGINE',
    domains: [
      'HUMAN',
      'SCIENCE',
      'MATHEMATICS',
      'MEDICINE',
      'FOOD',
      'WATER',
      'ENERGY',
      'MINING',
      'MATERIALS',
      'REFINERY',
      'PETROCHEMICAL',
      'MANUFACTURING',
      'ROBOTICS',
      'AI_PRODUCTION',
      'SUPPLY_CHAIN',
      'LOGISTICS',
      'SPACE',
      'SATELLITES',
      'RECYCLING',
      'CONTINUOUS_IMPROVEMENT'
    ],
    relationTypes: [
      'USES',
      'PRODUCES',
      'CONVERTS',
      'STORES',
      'TRANSPORTS',
      'SUPPLIES',
      'RECYCLES',
      'MEASURES',
      'CONTROLS',
      'IMPROVES'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      humanIsPrimary: true,
      aiToolOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      calculationAndClassificationOnly: true
    }
  };
}

function normalizeEntity(entity = {}) {
  return {
    id: entity.id || `ent-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: entity.name || 'Unnamed Entity',
    type: entity.type || 'GENERAL',
    domain: entity.domain || 'KNOWLEDGE',
    properties: entity.properties || {}
  };
}

function buildGraph(input = {}) {
  const entities = (input.entities || []).map(normalizeEntity);
  const relations = (input.relations || []).map((r, i) => ({
    id: r.id || `rel-${i + 1}`,
    from: r.from,
    to: r.to,
    type: r.type || 'RELATED_TO',
    weight: Number(r.weight || 1),
    properties: r.properties || {}
  }));

  const byDomain = entities.reduce((a, e) => {
    a[e.domain] = (a[e.domain] || 0) + 1;
    return a;
  }, {});

  return {
    success: true,
    system: 'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
    status: 'GRAPH_BUILT',
    entityCount: entities.length,
    relationCount: relations.length,
    byDomain,
    entities,
    relations,
    governance: status().governance
  };
}

function demoGraph() {
  return buildGraph({
    entities: [
      { id: 'human', name: 'الإنسان', type: 'REFERENCE_MODEL', domain: 'HUMAN' },
      { id: 'knowledge', name: 'المعرفة', type: 'KNOWLEDGE', domain: 'SCIENCE' },
      { id: 'energy', name: 'الطاقة', type: 'RESOURCE', domain: 'ENERGY' },
      { id: 'material', name: 'المواد', type: 'RESOURCE', domain: 'MATERIALS' },
      { id: 'factory', name: 'المصنع', type: 'PRODUCTION_NODE', domain: 'MANUFACTURING' },
      { id: 'supply', name: 'سلسلة الإمداد', type: 'NETWORK', domain: 'SUPPLY_CHAIN' },
      { id: 'ai', name: 'إنتاج الذكاء الصناعي', type: 'AI_PRODUCTION', domain: 'AI_PRODUCTION' }
    ],
    relations: [
      { from: 'human', to: 'knowledge', type: 'LEARNS_AND_TEACHES' },
      { from: 'knowledge', to: 'ai', type: 'GOVERNS_AND_GUIDES' },
      { from: 'energy', to: 'factory', type: 'POWERS' },
      { from: 'material', to: 'factory', type: 'SUPPLIES' },
      { from: 'factory', to: 'supply', type: 'PRODUCES_TO' },
      { from: 'supply', to: 'ai', type: 'FEEDS_REALITY_SIGNALS' }
    ]
  });
}

module.exports = { status, buildGraph, demoGraph };
