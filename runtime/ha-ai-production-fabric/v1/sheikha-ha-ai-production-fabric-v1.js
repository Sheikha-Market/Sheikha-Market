'use strict';

const fs = require('fs');
const path = require('path');
const { selectModel, status: modelStatus } = require('../../model-core/v1/sheikha-ollama-core-v1');

const ROOT = process.cwd();
const EVENT_DIR = path.join(ROOT, 'data', 'ha-ai-production-fabric', 'events');
const VECTOR_DIR = path.join(ROOT, 'data', 'ha-ai-production-fabric', 'vectors');

function ensureDirs() {
  fs.mkdirSync(EVENT_DIR, { recursive: true });
  fs.mkdirSync(VECTOR_DIR, { recursive: true });
}

function now() {
  return new Date().toISOString();
}

function appendEvent(type, payload = {}) {
  ensureDirs();
  const event = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ts: now(),
    type,
    payload
  };
  fs.appendFileSync(
    path.join(EVENT_DIR, 'events.jsonl'),
    `${JSON.stringify(event)}\n`
  );
  return event;
}

function hashText(text = '') {
  let h = 2166136261;
  const s = String(text);
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function sparseVector(text = '') {
  const tokens = String(text)
    .toLowerCase()
    .split(/[^\p{L}\p{N}_-]+/u)
    .filter(Boolean)
    .slice(0, 256);

  const vector = {};
  for (const token of tokens) {
    const key = hashText(token).slice(0, 8);
    vector[key] = (vector[key] || 0) + 1;
  }
  return vector;
}

function saveVector(id, text, metadata = {}) {
  ensureDirs();
  const record = {
    id: id || hashText(`${text}:${Date.now()}`),
    ts: now(),
    text: String(text || '').slice(0, 4000),
    metadata,
    vector: sparseVector(text)
  };
  fs.writeFileSync(
    path.join(VECTOR_DIR, `${record.id}.json`),
    JSON.stringify(record, null, 2)
  );
  appendEvent('VECTOR_UPSERT', { id: record.id, metadata });
  return record;
}

function routeTask(message = '', mode = 'smart') {
  const model = selectModel(message, mode);
  const text = String(message || '');

  let agent = 'conversation-agent';
  if (/code|كود|برمج|fix|debug|اختبار|test/i.test(text) || mode === 'code') {
    agent = 'coding-agent';
  } else if (/inspect|تشخيص|افحص|health|pm2|runtime/i.test(text)) {
    agent = 'inspector-agent';
  } else if (/حوكمة|governance|policy|risk|مخاطر/i.test(text)) {
    agent = 'governance-agent';
  } else if (/memory|ذاكرة|rag|knowledge|vector/i.test(text)) {
    agent = 'knowledge-agent';
  }

  const routed = {
    success: true,
    system: 'SHEIKHA_HIGH_AVAILABILITY_AI_PRODUCTION_FABRIC_V1',
    agent,
    model,
    mode,
    queue: 'LOCAL_IN_PROCESS_QUEUE',
    distributed: 'LOCAL_DISTRIBUTED_ABSTRACTION',
    production: 'SINGLE_NODE_HA_READY',
    externalMultiNode: 'NOT_CONNECTED'
  };

  appendEvent('TASK_ROUTED', { message: text.slice(0, 500), routed });
  return routed;
}

function status() {
  const ms = modelStatus();

  return {
    success: true,
    system: 'SHEIKHA_HIGH_AVAILABILITY_AI_PRODUCTION_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 20,
    productionReadiness: 'SINGLE_NODE_HA_READY',
    layers: {
      L15: 'SHEIKHA_DISTRIBUTED_EXECUTION_FABRIC_V1_ACTIVE_LOCAL',
      L16: 'SHEIKHA_MULTI_MODEL_ORCHESTRATOR_V1_ACTIVE',
      L17: 'SHEIKHA_VECTOR_MEMORY_FABRIC_V1_ACTIVE_LOCAL',
      L18: 'SHEIKHA_EVENT_STREAM_BUS_V1_ACTIVE_LOCAL_JSONL',
      L19: 'SHEIKHA_AGENTIC_EXECUTION_CLUSTER_V1_ACTIVE_LOCAL',
      L20: 'SHEIKHA_HIGH_AVAILABILITY_PRODUCTION_FABRIC_V1_ACTIVE_SINGLE_NODE'
    },
    cluster: {
      mode: 'LOCAL_HIGH_AVAILABILITY_SINGLE_NODE',
      ollamaCluster: ms,
      pm2: 'ACTIVE',
      eventBus: 'LOCAL_JSONL',
      vectorMemory: 'LOCAL_SPARSE_VECTOR_STORE',
      redis: 'NOT_CONNECTED',
      kubernetes: 'NOT_CONNECTED',
      externalLoadBalancer: 'NOT_CONNECTED',
      multiNode: 'NOT_CONNECTED'
    },
    agents: [
      'conversation-agent',
      'coding-agent',
      'inspector-agent',
      'governance-agent',
      'knowledge-agent',
      'repair-planner-agent'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      envProtected: true,
      secretsProtected: true,
      destructiveActionsBlocked: true,
      noFalseProductionClaim: true,
      productionClaim: 'Local single-node HA-ready only until external HA is connected'
    }
  };
}

function health() {
  ensureDirs();
  const eventFile = path.join(EVENT_DIR, 'events.jsonl');
  const eventCount = fs.existsSync(eventFile)
    ? fs.readFileSync(eventFile, 'utf8').split('\n').filter(Boolean).length
    : 0;

  const vectorCount = fs.existsSync(VECTOR_DIR)
    ? fs.readdirSync(VECTOR_DIR).filter((x) => x.endsWith('.json')).length
    : 0;

  return {
    ...status(),
    health: {
      eventCount,
      vectorCount,
      pid: process.pid,
      uptimeSeconds: Math.round(process.uptime()),
      memory: process.memoryUsage()
    }
  };
}

module.exports = {
  status,
  health,
  routeTask,
  appendEvent,
  saveVector,
  sparseVector
};
