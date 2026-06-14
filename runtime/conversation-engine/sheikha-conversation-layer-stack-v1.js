'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
  getPool,
  health: postgresqlHealth,
  isEnabled: isPostgreSQLEnabled
} = require('../../lib/database/postgresql/postgresql-connection-manager');

const VECTOR_DIMENSIONS = 192;
const KNOWLEDGE_LIMIT = 4;
const MEMORY_LIMIT = 4;
const cache = new Map();

function resolveRoot(rootDir) {
  return rootDir || process.env.SHEIKHA_ROOT || process.cwd();
}

function readJson(file, fallback = null) {
  try {
    const stat = fs.statSync(file);
    const cached = cache.get(file);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached.value;
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    cache.set(file, { mtimeMs: stat.mtimeMs, value });
    return value;
  } catch {
    return fallback;
  }
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .slice(0, 2000);
}

function redact(value) {
  return String(value || '')
    .replace(/(authorization|api[_-]?key|token|password|secret)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
    .replace(/\b(?:sk|ghp|github_pat)_[A-Za-z0-9_-]{12,}\b/g, '[REDACTED_TOKEN]');
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function lexicalScore(queryTokens, candidateTokens) {
  const query = new Set(queryTokens);
  let score = 0;
  for (const token of new Set(candidateTokens)) {
    if (query.has(token)) score += 1;
  }
  return score;
}

function hashToken(token) {
  const digest = crypto.createHash('sha256').update(token).digest();
  return digest.readUInt32BE(0) % VECTOR_DIMENSIONS;
}

function sparseVector(tokens) {
  const vector = new Map();
  tokens.forEach((token) => {
    const index = hashToken(token);
    vector.set(index, (vector.get(index) || 0) + 1);
  });
  return vector;
}

function cosine(left, right) {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  left.forEach((value, index) => {
    leftNorm += value * value;
    dot += value * (right.get(index) || 0);
  });
  right.forEach((value) => { rightNorm += value * value; });
  if (!leftNorm || !rightNorm) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

function readConversationEvents(rootDir) {
  const file = path.join(rootDir, 'runtime/memory/conversation/events.jsonl');
  try {
    return fs.readFileSync(file, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .slice(-100)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function retrieveMemory(message, rootDir) {
  const files = [
    'working-memory.json',
    'session-memory.json',
    'project-memory.json',
    'enterprise-memory.json',
    'longterm-memory.json'
  ];
  const records = [];

  files.forEach((name) => {
    const state = readJson(path.join(rootDir, 'runtime/memory', name), { records: [] });
    (state.records || []).forEach((record) => records.push({ ...record, memoryFile: name }));
  });
  records.push(...readConversationEvents(rootDir));

  const queryTokens = tokenize(message);
  const matches = records
    .map((record) => ({
      record,
      score: lexicalScore(queryTokens, tokenize(JSON.stringify(record)))
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MEMORY_LIMIT)
    .map(({ record, score }) => ({
      score,
      at: record.at || record.timestamp || null,
      channel: record.channel || null,
      summary: redact(record.summary || record.message || record.answer || '').slice(0, 500)
    }));

  return {
    layer: 2,
    name: 'MEMORY_FABRIC',
    status: 'ACTIVE',
    recordsScanned: records.length,
    matches
  };
}

function retrieveKnowledge(message, rootDir) {
  const index = readJson(
    path.join(rootDir, 'runtime/rag/index/sheikha-rag-index-v1.json'),
    { name: 'SHEIKHA_RAG_INDEX_V1', status: 'MISSING', docs: [] }
  );
  const queryTokens = tokenize(message);
  const results = (index.docs || [])
    .map((doc) => ({ doc, score: lexicalScore(queryTokens, doc.tokens || tokenize(doc.text)) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, KNOWLEDGE_LIMIT)
    .map(({ doc, score }) => ({
      source: doc.path,
      title: doc.title,
      score,
      excerpt: redact(doc.text).slice(0, 700)
    }));

  return {
    layer: 3,
    name: 'KNOWLEDGE_STORE',
    status: index.status === 'ACTIVE' ? 'ACTIVE' : 'DEGRADED',
    index: index.name,
    documents: Number(index.documentCount || index.docs?.length || 0),
    results
  };
}

function retrieveGraph(message, rootDir) {
  const entitiesRegistry = readJson(
    path.join(rootDir, 'runtime/knowledge-graph-engine-v1/v1/registries/graph-entities.json'),
    { status: 'MISSING', entities: [] }
  );
  const relationshipsRegistry = readJson(
    path.join(rootDir, 'runtime/knowledge-graph-engine-v1/v1/registries/graph-relationships.json'),
    { status: 'MISSING', relationships: [] }
  );
  const query = new Set(tokenize(message).map((token) => token.toUpperCase()));
  const match = (value) => tokenize(value).some((token) => query.has(token.toUpperCase()));
  const entities = (entitiesRegistry.entities || []).filter(match).slice(0, 10);
  const relationships = (relationshipsRegistry.relationships || []).filter(match).slice(0, 10);

  return {
    layer: 4,
    name: 'KNOWLEDGE_GRAPH',
    status: entitiesRegistry.status === 'ACTIVE' && relationshipsRegistry.status === 'ACTIVE'
      ? 'ACTIVE'
      : 'DEGRADED',
    entityCount: (entitiesRegistry.entities || []).length,
    relationshipCount: (relationshipsRegistry.relationships || []).length,
    matches: { entities, relationships }
  };
}

function retrieveVectors(message, rootDir, knowledge) {
  const registry = readJson(
    path.join(rootDir, 'runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2.json'),
    { status: 'MISSING' }
  );
  const queryVector = sparseVector(tokenize(message));
  const candidates = (knowledge.results || []).map((item) => ({
    source: item.source,
    title: item.title,
    score: Number(cosine(queryVector, sparseVector(tokenize(`${item.title} ${item.excerpt}`))).toFixed(6))
  })).sort((a, b) => b.score - a.score);

  return {
    layer: 6,
    name: 'VECTOR_STORE',
    status: registry.status === 'ACTIVE' ? 'ACTIVE' : 'DEGRADED',
    engine: 'SHEIKHA_HASHED_SPARSE_VECTOR_V1',
    dimensions: VECTOR_DIMENSIONS,
    externalEmbeddingModel: false,
    candidates
  };
}

async function inspectPostgreSQL() {
  const enabled = isPostgreSQLEnabled();
  const live = await postgresqlHealth();
  return {
    layer: 5,
    name: 'POSTGRESQL',
    status: enabled ? (live.success ? 'CONNECTED' : 'UNAVAILABLE') : 'READY_NOT_CONFIGURED',
    adapter: 'ACTIVE',
    enabled,
    live,
    writesEnabled: enabled && process.env.SHEIKHA_CONVERSATION_POSTGRES_WRITE === 'true',
    migrationPolicy: 'APPROVAL_REQUIRED_NO_AUTO_CREATE'
  };
}

function governanceLayer(governance) {
  return {
    layer: 7,
    name: 'ENTERPRISE_GOVERNANCE',
    status: governance?.allowed === false ? 'BLOCKED' : 'ACTIVE',
    engine: governance?.engine || 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
    humanReviewRequiredForWrites: true,
    evidenceRequired: true
  };
}

function evidenceLayer(requestId, startedAt, layers) {
  return {
    layer: 8,
    name: 'EVIDENCE_OBSERVABILITY',
    status: 'ACTIVE',
    requestId,
    durationMs: Date.now() - startedAt,
    layerTrace: layers.map((layer) => ({
      layer: layer.layer,
      name: layer.name,
      status: layer.status
    })),
    sourceCount: layers.reduce((total, layer) => total + Number(layer.results?.length || 0), 0),
    auditRequired: true
  };
}

async function buildConversationLayerStack(message, options = {}) {
  const startedAt = Date.now();
  const rootDir = resolveRoot(options.rootDir);
  const requestId = options.requestId || crypto.randomUUID();
  const memory = retrieveMemory(message, rootDir);
  const knowledge = retrieveKnowledge(message, rootDir);
  const graph = retrieveGraph(message, rootDir);
  const postgresql = await inspectPostgreSQL();
  const vectors = retrieveVectors(message, rootDir, knowledge);
  const governance = governanceLayer(options.governance);
  const layers = [
    { layer: 1, name: 'CONVERSATION_ENGINE', status: 'ACTIVE' },
    memory,
    knowledge,
    graph,
    postgresql,
    vectors,
    governance
  ];
  const evidence = evidenceLayer(requestId, startedAt, layers);

  return {
    stack: 'SHEIKHA_CONVERSATION_LAYER_STACK_V1',
    status: governance.status === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE',
    requestId,
    layers: [...layers, evidence],
    foundryPlane: {
      name: 'SHEIKHA_FOUNDRY_V2',
      status: 'ACTIVE',
      role: 'BUILD_EVOLUTION_AND_RELEASE_PLANE'
    }
  };
}

function buildLayerContext(stack) {
  const byLayer = Object.fromEntries((stack.layers || []).map((layer) => [layer.layer, layer]));
  return {
    requestId: stack.requestId,
    memory: byLayer[2]?.matches || [],
    knowledge: byLayer[3]?.results || [],
    graph: byLayer[4]?.matches || {},
    postgresql: {
      status: byLayer[5]?.status,
      writesEnabled: byLayer[5]?.writesEnabled
    },
    vectors: byLayer[6]?.candidates || [],
    governance: byLayer[7],
    evidence: byLayer[8]
  };
}

function persistConversationMemory(record, options = {}) {
  const rootDir = resolveRoot(options.rootDir);
  const file = path.join(rootDir, 'runtime/memory/conversation/events.jsonl');
  const event = {
    at: new Date().toISOString(),
    requestId: record.requestId,
    channel: record.channel || 'api',
    messageHash: sha256(record.message),
    answerHash: sha256(record.answer),
    summary: redact(record.answer).slice(0, 1000),
    intent: record.intent || null,
    governed: true
  };
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, `${JSON.stringify(event)}\n`, 'utf8');
    return { success: true, file, event };
  } catch (error) {
    return { success: false, error: error.message, file };
  }
}

async function persistConversationPostgreSQL(record) {
  if (!isPostgreSQLEnabled() || process.env.SHEIKHA_CONVERSATION_POSTGRES_WRITE !== 'true') {
    return { success: false, skipped: true, reason: 'POSTGRES_WRITE_NOT_AUTHORIZED' };
  }
  try {
    await getPool().query(
      `INSERT INTO sheikha_conversation_events
        (request_id, channel, intent, message_sha256, answer_sha256, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [record.requestId, record.channel, record.intent, sha256(record.message), sha256(record.answer)]
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  buildConversationLayerStack,
  buildLayerContext,
  cosine,
  persistConversationMemory,
  persistConversationPostgreSQL,
  redact,
  sparseVector,
  tokenize
};
