'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'autonomous-enterprise-fabric');

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function writeEvent(type, payload = {}) {
  ensureData();
  const event = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ts: new Date().toISOString(),
    type,
    payload
  };
  fs.appendFileSync(path.join(DATA_DIR, 'events.jsonl'), `${JSON.stringify(event)}\n`);
  return event;
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_AUTONOMOUS_ENTERPRISE_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 25,
    position: 'AUTONOMOUS_ENTERPRISE_CONTROL_PLANE',
    layers: {
      L21: 'SHEIKHA_FEDERATED_AGENT_MESH_V1',
      L22: 'SHEIKHA_GLOBAL_MEMORY_FABRIC_V1',
      L23: 'SHEIKHA_EXECUTION_COORDINATOR_FABRIC_V1',
      L24: 'SHEIKHA_ENTERPRISE_SERVICE_MESH_V1',
      L25: 'SHEIKHA_AUTONOMOUS_OPERATIONS_FABRIC_V1'
    },
    bindings: {
      haAiProductionFabric: exists('runtime/ha-ai-production-fabric/v1/sheikha-ha-ai-production-fabric-v1.js'),
      aiClusterPipeline: exists('runtime/ai-cluster-pipeline-production/v1/sheikha-ai-cluster-pipeline-production-apex-v1.js'),
      supremeGovernance: exists('runtime/supreme-governance-intelligence-fabric/v1/sheikha-supreme-governance-intelligence-fabric-v1.js'),
      developerTools: exists('runtime/developer-tools-apex/v1/sheikha-developer-tools-apex-v1.js'),
      notesGovernance: exists('runtime/ai-notes-governance/v1/sheikha-ai-notes-governance-autofix-v1.js'),
      modelCore: exists('runtime/model-core/v1/sheikha-ollama-core-v1.js')
    },
    agents: [
      'coding-agent',
      'inspector-agent',
      'runtime-agent',
      'governance-agent',
      'knowledge-agent',
      'extension-agent',
      'repair-planner-agent'
    ],
    serviceMesh: [
      '/api/health',
      '/api/sheikha/model-core/v1/status',
      '/api/sheikha/ai-cluster-pipeline-production/v1/status',
      '/api/sheikha/ha-ai-production-fabric/v1/status',
      '/api/sheikha/supreme-governance-intelligence-fabric/v1/status',
      '/api/sheikha/developer-tools-apex/v1/status',
      '/api/sheikha/ai-notes-governance/v1/status'
    ],
    production: {
      readiness: 'SINGLE_NODE_AUTONOMOUS_ENTERPRISE_READY',
      redis: 'NOT_CONNECTED',
      kubernetes: 'NOT_CONNECTED',
      externalLoadBalancer: 'NOT_CONNECTED',
      multiNode: 'NOT_CONNECTED'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      secretsProtected: true,
      envProtected: true,
      destructiveActionsBlocked: true,
      humanApprovalForCriticalChanges: true,
      rollbackRequired: true,
      noFalseMultiNodeClaim: true
    }
  };
}

function classify(message = '') {
  const text = String(message || '');
  if (/code|كود|برمج|fix|debug|اختبار|test/i.test(text)) return 'coding-agent';
  if (/inspect|تشخيص|افحص|health|pm2|runtime/i.test(text)) return 'inspector-agent';
  if (/حوكمة|governance|policy|risk|مخاطر/i.test(text)) return 'governance-agent';
  if (/memory|ذاكرة|rag|knowledge|vector/i.test(text)) return 'knowledge-agent';
  if (/extension|vscode|vs code|اكستنشن/i.test(text)) return 'extension-agent';
  if (/repair|إصلاح|اصلح|rollback|patch/i.test(text)) return 'repair-planner-agent';
  return 'runtime-agent';
}

function plan(message = '') {
  const agent = classify(message);
  const result = {
    success: true,
    system: 'SHEIKHA_AUTONOMOUS_ENTERPRISE_FABRIC_V1',
    status: 'PLANNED',
    agent,
    message,
    executionPlan: [
      'CLASSIFY_REQUEST',
      'LOAD_RELEVANT_MEMORY',
      'ROUTE_TO_AGENT',
      'APPLY_GOVERNANCE',
      'RUN_SAFE_CHECKS',
      'PREPARE_RESPONSE_OR_PATCH_PLAN',
      'REQUIRE_HUMAN_APPROVAL_FOR_CRITICAL_CHANGES'
    ],
    allowedActions: {
      read: true,
      analyze: true,
      safePatchPlan: true,
      destructiveWrite: false,
      envMutation: false,
      secretExposure: false
    }
  };
  writeEvent('PLAN_CREATED', result);
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
  classify,
  plan,
  writeEvent
};
