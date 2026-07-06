'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'safe-catalyst-transport-fabric');

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_SAFE_EXPONENTIAL_CATALYST_TRANSPORT_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 53,
    role: 'SAFE_NON_HARMFUL_EXPONENTIAL_CATALYST_AND_INFORMATION_TRANSPORT_OPTIMIZER',
    safeCatalysts: [
      'MODULAR_REPLICATION',
      'CLASSIFICATION_ROUTING',
      'SCHEMA_VALIDATION',
      'IDEMPOTENCY_KEYS',
      'CHECKSUM_VERIFICATION',
      'BATCHING',
      'STREAMING',
      'CACHE_ACCELERATION',
      'QUEUE_BACKPRESSURE',
      'AFFINITY_ROUTING',
      'VECTOR_SIMILARITY_ROUTING',
      'OBSERVABILITY_FEEDBACK'
    ],
    transportStates: [
      'PACKET_CONTAINER',
      'LIQUID_STREAM',
      'AIR_EVENT_BROADCAST',
      'MAGNETIC_AFFINITY_ROUTING',
      'VECTOR_ATTRACTION_FIELD'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      safeOnly: true,
      noChemicalBiologicalCatalyst: true,
      noDestructiveReplication: true,
      noSecretExposure: true,
      noEnvMutation: true,
      calculationOnly: true,
      noFuturePredictionClaim: true
    }
  };
}

function classifyData(node = {}) {
  const t = String(node.type || node.dataType || '').toLowerCase();
  const content = node.content ?? node.schema ?? node.fields ?? node.payload ?? null;

  if (t.includes('semi')) return 'SEMI_STRUCTURED';
  if (t.includes('unstructured')) return 'UNSTRUCTURED';
  if (t.includes('structured')) return 'STRUCTURED';

  if (node.schema || Array.isArray(node.fields)) return 'STRUCTURED';
  if (content && typeof content === 'object' && !Array.isArray(content)) return 'STRUCTURED';
  if (typeof content === 'string' && (/^\s*[{[]/.test(content) || /[:=]/.test(content))) return 'SEMI_STRUCTURED';
  return 'UNSTRUCTURED';
}

function selectTransport(node = {}) {
  const dataType = classifyData(node);
  const size = Number(node.size || node.bytes || 0);
  const realtime = Boolean(node.realtime || node.live);
  const fanout = Number(node.fanout || 1);
  const similarity = Boolean(node.semantic || node.vector || node.embedding);
  const affinity = Boolean(node.affinity || node.owner || node.factory || node.cluster);

  if (similarity) return 'VECTOR_ATTRACTION_FIELD';
  if (affinity) return 'MAGNETIC_AFFINITY_ROUTING';
  if (realtime) return 'LIQUID_STREAM';
  if (fanout > 3) return 'AIR_EVENT_BROADCAST';
  if (size > 1024 * 1024) return 'PACKET_CONTAINER';
  if (dataType === 'STRUCTURED') return 'PACKET_CONTAINER';
  if (dataType === 'SEMI_STRUCTURED') return 'LIQUID_STREAM';
  return 'AIR_EVENT_BROADCAST';
}

function catalystScore(node = {}, depth = 0) {
  const base = Number(node.weight || 1);
  const safety = node.safe === false ? 0 : 1;
  const integration = Number(node.integration || 1);
  const classificationBoost = {
    STRUCTURED: 1.2,
    SEMI_STRUCTURED: 1.35,
    UNSTRUCTURED: 1.1
  }[classifyData(node)] || 1;

  return Number((base * safety * integration * classificationBoost * Math.pow(1.618, depth)).toFixed(6));
}

function analyze(input = {}) {
  ensureData();

  const roots = Array.isArray(input.roots) ? input.roots : [];
  const tabs = [];

  function walk(node, depth = 0, parent = '') {
    const name = String(node.name || node.id || `node-${tabs.length + 1}`);
    const pathName = parent ? `${parent}/${name}` : name;
    const dataType = classifyData(node);
    const transport = selectTransport(node);
    const score = catalystScore(node, depth);

    const record = {
      id: node.id || pathName,
      name,
      path: pathName,
      scope: String(node.scope || (depth === 0 ? 'ROOT' : 'TAB')).toUpperCase(),
      dataType,
      transport,
      depth,
      catalystScore: score,
      safeCatalysts: [
        'SCHEMA_VALIDATION',
        'IDEMPOTENCY_KEYS',
        'CHECKSUM_VERIFICATION',
        transport === 'LIQUID_STREAM' ? 'STREAMING' : 'BATCHING',
        transport === 'MAGNETIC_AFFINITY_ROUTING' ? 'AFFINITY_ROUTING' : 'CLASSIFICATION_ROUTING',
        transport === 'VECTOR_ATTRACTION_FIELD' ? 'VECTOR_SIMILARITY_ROUTING' : 'OBSERVABILITY_FEEDBACK'
      ]
    };

    tabs.push(record);

    for (const child of (Array.isArray(node.children) ? node.children : [])) {
      walk(child, depth + 1, pathName);
    }
  }

  roots.forEach((r) => walk(r));

  const byTransport = tabs.reduce((a, x) => {
    a[x.transport] = (a[x.transport] || 0) + 1;
    return a;
  }, {});

  const byType = tabs.reduce((a, x) => {
    a[x.dataType] = (a[x.dataType] || 0) + 1;
    return a;
  }, {});

  const result = {
    success: true,
    system: 'SHEIKHA_SAFE_EXPONENTIAL_CATALYST_TRANSPORT_FABRIC_V1',
    status: 'ANALYZED',
    totalTabs: tabs.length,
    totalCatalystScore: Number(tabs.reduce((s, x) => s + x.catalystScore, 0).toFixed(6)),
    byType,
    byTransport,
    tabs,
    strongestSafeCatalysts: [
      'SCHEMA_VALIDATION',
      'IDEMPOTENCY_KEYS',
      'CHECKSUM_VERIFICATION',
      'STREAMING',
      'AFFINITY_ROUTING',
      'VECTOR_SIMILARITY_ROUTING',
      'OBSERVABILITY_FEEDBACK'
    ],
    governance: status().governance
  };

  fs.writeFileSync(path.join(DATA_DIR, 'latest-analysis.json'), JSON.stringify(result, null, 2));
  return result;
}

module.exports = { status, analyze, classifyData, selectTransport };
