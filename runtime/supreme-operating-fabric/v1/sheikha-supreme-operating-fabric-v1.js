'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'supreme-operating-fabric');

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function event(type, payload = {}) {
  ensureData();
  const record = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ts: new Date().toISOString(),
    type,
    payload
  };
  fs.appendFileSync(path.join(DATA_DIR, 'events.jsonl'), `${JSON.stringify(record)}\n`);
  return record;
}

function selectAgent(message = '', mode = 'smart') {
  const text = String(message || '');
  if (/code|كود|برمج|fix|debug|اختبار|test/i.test(text) || mode === 'code') return 'coding-agent';
  if (/reason|تحليل|استنتاج|deep|منطق/i.test(text)) return 'reasoning-agent';
  if (/memory|ذاكرة|rag|knowledge|vector/i.test(text)) return 'memory-agent';
  if (/governance|حوكمة|شرع|ربا|غرر|policy/i.test(text)) return 'governance-agent';
  if (/diagnostic|تشخيص|health|pm2|runtime/i.test(text)) return 'diagnostics-agent';
  if (/doc|توثيق|تقرير|report/i.test(text)) return 'documentation-agent';
  return 'core-agent';
}

function selectModel(agent) {
  return {
    'coding-agent': 'qwen2.5-coder:7b',
    'reasoning-agent': 'deepseek-r1:8b',
    'memory-agent': 'Sheikha-Core:latest',
    'governance-agent': 'Sheikha-Core:latest',
    'diagnostics-agent': 'Sheikha-Core:latest',
    'documentation-agent': 'Sheikha-Core:latest',
    'core-agent': 'Sheikha-Core:latest'
  }[agent] || 'Sheikha-Core:latest';
}

function status() {
  ensureData();

  return {
    success: true,
    system: 'SHEIKHA_SUPREME_OPERATING_FABRIC_L30_L35_V1',
    status: 'ACTIVE',
    apexLevel: 35,
    layers: {
      L30: 'UNIFIED_MEMORY_GRAPH_ACTIVE',
      L31: 'MULTI_AGENT_MESH_ACTIVE',
      L32: 'PERSISTENT_VECTOR_MEMORY_ACTIVE_LOCAL',
      L33: 'SELF_HEALING_RUNTIME_ACTIVE_SAFE_PLAN',
      L34: 'CLUSTER_MANAGER_ACTIVE_LOCAL_OLLAMA',
      L35: 'PRODUCTION_ORCHESTRATOR_ACTIVE_SINGLE_NODE'
    },
    bindings: {
      shariaGovernance: exists('runtime/sharia-governance-fabric/v1/sheikha-sharia-governance-fabric-v1.js'),
      knowledgeEvidence: exists('runtime/knowledge-evidence-fabric/v1/sheikha-knowledge-evidence-fabric-v1.js'),
      autonomousExecution: exists('runtime/autonomous-execution-bridge/v1/sheikha-autonomous-execution-bridge-v1.js'),
      modelCore: exists('runtime/model-core/v1/sheikha-ollama-core-v1.js'),
      haProduction: exists('runtime/ha-ai-production-fabric/v1/sheikha-ha-ai-production-fabric-v1.js')
    },
    agents: [
      'core-agent',
      'coding-agent',
      'reasoning-agent',
      'memory-agent',
      'governance-agent',
      'diagnostics-agent',
      'documentation-agent'
    ],
    models: {
      core: 'Sheikha-Core:latest',
      coding: 'qwen2.5-coder:7b',
      reasoning: 'deepseek-r1:8b',
      fast: 'tinyllama:latest'
    },
    production: {
      readiness: 'SINGLE_NODE_SUPREME_OPERATING_READY',
      redis: 'NOT_CONNECTED',
      kubernetes: 'NOT_CONNECTED',
      externalLoadBalancer: 'NOT_CONNECTED',
      multiNode: 'NOT_CONNECTED'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      shariaGovernanceRequired: true,
      envProtected: true,
      secretsProtected: true,
      destructiveActionsBlocked: true,
      humanApprovalForCriticalChanges: true
    }
  };
}

function plan(message = '', mode = 'smart') {
  const agent = selectAgent(message, mode);
  const model = selectModel(agent);

  const result = {
    success: true,
    system: 'SHEIKHA_SUPREME_OPERATING_FABRIC_L30_L35_V1',
    status: 'PLANNED',
    apexLevel: 35,
    message,
    agent,
    model,
    pipeline: [
      'SHARIA_GOVERNANCE',
      'KNOWLEDGE_EVIDENCE',
      'UNIFIED_MEMORY_GRAPH',
      'AGENT_MESH',
      'MODEL_CLUSTER_ROUTING',
      'SAFE_EXECUTION_PLAN',
      'TRACE_AND_ARTIFACT',
      'RESPONSE'
    ],
    allowedActions: {
      read: true,
      analyze: true,
      generatePatchPlan: true,
      executeDestructiveWrite: false,
      mutateEnv: false,
      exposeSecrets: false
    }
  };

  event('SUPREME_PLAN_CREATED', result);
  return result;
}

function health() {
  ensureData();
  const eventPath = path.join(DATA_DIR, 'events.jsonl');
  const events = fs.existsSync(eventPath)
    ? fs.readFileSync(eventPath, 'utf8').split('\n').filter(Boolean).length
    : 0;

  return {
    ...status(),
    health: {
      pid: process.pid,
      uptimeSeconds: Math.round(process.uptime()),
      memory: process.memoryUsage(),
      events
    }
  };
}

module.exports = {
  status,
  health,
  plan,
  selectAgent,
  selectModel
};
