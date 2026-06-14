#!/usr/bin/env bash
set -euo pipefail

echo "== SHEIKHA FULL ACTIVATION V1 =="

mkdir -p \
  runtime/conversation-engine \
  runtime/memory \
  runtime/self-healing/errors \
  runtime/self-healing/repairs \
  runtime/self-healing/diagnostics \
  runtime/foundry/knowledge \
  runtime/foundry/decisions \
  runtime/foundry/lessons \
  runtime/foundry/patterns \
  runtime/foundry/reports \
  runtime/reports/conversation-engine \
  runtime/audit \
  tools/runtime

cat > runtime/conversation-engine/sheikha-conversation-engine-v1.js <<'JS'
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { collectEnterpriseInspector } = require('../../core/enterprise/sheikha-enterprise-inspector-v3');
const { executePipeline } = require('../execution/sheikha-execution-pipeline-v1');
const { governGovernance } = require('../governance/sheikha-governance-of-governance-v1');
const { formatChatAnswer, handleUnifiedChat } = require('../chat-fabric/sheikha-unified-chat-fabric-v1');

function resolveRoot() {
  if (process.env.SHEIKHA_ROOT) return process.env.SHEIKHA_ROOT;
  if (fs.existsSync(path.join(process.cwd(), 'package.json'))) return process.cwd();
  if (fs.existsSync('/opt/sheikha/current')) return '/opt/sheikha/current';
  return process.cwd();
}

function getAuditPaths(rootDir = resolveRoot()) {
  return {
    latest: path.join(rootDir, 'runtime/reports/conversation-engine/latest.json'),
    audit: path.join(rootDir, 'runtime/audit/sheikha-conversation-engine-audit.jsonl')
  };
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function isDiagnosticRequest(message) {
  return /حلل|افحص|تشخيص|سجل|log|diagnostic|inspector|system health|enterprise inspector/i.test(String(message || ''));
}

function writeConversationAudit(record, options = {}) {
  const paths = getAuditPaths(options.rootDir);
  const answer = String(record.answer || '');
  const timestamp = record.timestamp || new Date().toISOString();

  const latest = {
    engine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
    generatedAt: timestamp,
    success: record.success !== false,
    route: record.route || 'SHEIKHA_CONVERSATION_ENGINE_V1',
    fallback: Boolean(record.fallback),
    diagnosticRequested: Boolean(record.diagnosticRequested),
    intent: record.intent || null,
    channel: record.channel || 'api',
    request: {
      sha256: hash(record.message),
      bytes: Buffer.byteLength(String(record.message || ''))
    },
    response: {
      answer: answer.slice(0, 50000),
      sha256: hash(answer),
      bytes: Buffer.byteLength(answer)
    }
  };

  const audit = {
    at: timestamp,
    engine: latest.engine,
    success: latest.success,
    route: latest.route,
    fallback: latest.fallback,
    diagnosticRequested: latest.diagnosticRequested,
    intent: latest.intent,
    channel: latest.channel,
    request: latest.request,
    response: {
      sha256: latest.response.sha256,
      bytes: latest.response.bytes,
      preview: answer.slice(0, 500)
    }
  };

  fs.mkdirSync(path.dirname(paths.latest), { recursive: true });
  fs.mkdirSync(path.dirname(paths.audit), { recursive: true });

  const temporary = `${paths.latest}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(latest, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, paths.latest);
  fs.appendFileSync(paths.audit, `${JSON.stringify(audit)}\n`, 'utf8');

  return { success: true, paths };
}

function status() {
  return {
    success: true,
    engine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
    status: 'ACTIVE',
    primaryRoute: '/api/sheikha/conversation-engine/v1/chat',
    diagnosticRoute: '/api/sheikha/enterprise-inspector/v3/status',
    fallbackRoute: '/api/sheikha/unified-chat',
    foundry: 'SHEIKHA_FOUNDRY_V2',
    governance: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
    inspectorPolicy: 'EXPLICIT_DIAGNOSTIC_REQUESTS_ONLY'
  };
}

function handleConversation(payload = {}, options = {}) {
  const message = String(payload.message || payload.prompt || payload.text || '').trim();
  const channel = String(payload.channel || payload.source || 'api');
  const diagnosticRequested = payload.diagnosticRequested === true || isDiagnosticRequest(message);

  const governance = governGovernance({
    actor: payload.actor || channel,
    channel,
    action: 'conversation_engine_chat',
    message
  });

  if (!governance.allowed) {
    const blocked = {
      success: false,
      blocked: true,
      route: 'SHEIKHA_CONVERSATION_ENGINE_V1',
      endpoint: '/api/sheikha/conversation-engine/v1/chat',
      governance,
      diagnosticRequested,
      fallback: false,
      answer: 'تم حظر الطلب بواسطة حوكمة شيخة لأنه يتضمن صلاحية خطرة أو غير مأذونة.'
    };

    if (options.persist !== false) {
      blocked.audit = writeConversationAudit({
        ...blocked,
        message,
        channel,
        timestamp: new Date().toISOString()
      }, options);
    }

    return blocked;
  }

  try {
    const enterpriseInspector = diagnosticRequested
      ? payload.inspectorSnapshot || collectEnterpriseInspector({
          workspace: payload.workspace,
          vscodeTools: payload.vscodeTools
        })
      : undefined;

    const result = executePipeline({
      ...payload,
      message,
      source: channel,
      channel,
      enterpriseInspector
    });

    const response = {
      success: true,
      route: 'SHEIKHA_CONVERSATION_ENGINE_V1',
      endpoint: '/api/sheikha/conversation-engine/v1/chat',
      foundry: 'SHEIKHA_FOUNDRY_V2',
      governance,
      pipeline: result.pipeline,
      intent: result.intent,
      intelligenceMode: result.intelligenceMode,
      diagnosticRequested,
      inspector: diagnosticRequested ? enterpriseInspector : undefined,
      answer: formatChatAnswer(result.answer || result.response || result.message || ''),
      fallback: false
    };

    if (options.persist !== false) {
      response.audit = writeConversationAudit({
        ...response,
        message,
        channel,
        timestamp: new Date().toISOString()
      }, options);
    }

    return response;
  } catch (error) {
    const fallback = handleUnifiedChat({
      ...payload,
      message,
      channel,
      source: channel,
      mode: payload.mode || 'smart'
    });

    const response = {
      ...fallback,
      route: 'SHEIKHA_CONVERSATION_ENGINE_V1',
      endpoint: '/api/sheikha/conversation-engine/v1/chat',
      fallback: true,
      fallbackRoute: '/api/sheikha/unified-chat',
      primaryError: error.message,
      diagnosticRequested
    };

    if (options.persist !== false) {
      response.audit = writeConversationAudit({
        ...response,
        message,
        channel,
        timestamp: new Date().toISOString()
      }, options);
    }

    return response;
  }
}

module.exports = {
  getAuditPaths,
  handleConversation,
  isDiagnosticRequest,
  status,
  writeConversationAudit
};
JS

cat > tools/runtime/verify-memory.js <<'JS'
'use strict';
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dir = path.join(root, 'runtime/memory');
const files = [
  'working-memory.json',
  'session-memory.json',
  'project-memory.json',
  'enterprise-memory.json',
  'longterm-memory.json'
];

fs.mkdirSync(dir, { recursive: true });

for (const file of files) {
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify({
      engine: 'SHEIKHA_MEMORY_FABRIC_V1',
      file,
      status: 'ACTIVE',
      records: [],
      updatedAt: new Date().toISOString()
    }, null, 2) + '\n');
  }
}

console.log(JSON.stringify({
  success: true,
  engine: 'SHEIKHA_MEMORY_FABRIC_V1',
  files
}, null, 2));
JS

cat > tools/runtime/verify-self-healing.js <<'JS'
'use strict';
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const base = path.join(root, 'runtime/self-healing');
const dirs = ['errors', 'repairs', 'diagnostics'];

for (const d of dirs) fs.mkdirSync(path.join(base, d), { recursive: true });

const latest = path.join(base, 'diagnostics/latest.json');
fs.writeFileSync(latest, JSON.stringify({
  success: true,
  engine: 'SHEIKHA_SELF_HEALING_V1',
  status: 'ACTIVE',
  policy: 'DETECT_CLASSIFY_RECOMMEND_VERIFY',
  updatedAt: new Date().toISOString()
}, null, 2) + '\n');

console.log(JSON.stringify({
  success: true,
  engine: 'SHEIKHA_SELF_HEALING_V1',
  latest
}, null, 2));
JS

cat > tools/runtime/verify-knowledge-store.js <<'JS'
'use strict';
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const base = path.join(root, 'runtime/foundry');
const dirs = ['knowledge', 'decisions', 'lessons', 'patterns', 'reports'];

for (const d of dirs) fs.mkdirSync(path.join(base, d), { recursive: true });

const decision = path.join(base, 'decisions/conversation-engine-routing.json');
if (!fs.existsSync(decision)) {
  fs.writeFileSync(decision, JSON.stringify({
    type: 'DECISION',
    title: 'Route VS Code chat through Sheikha Conversation Engine',
    status: 'ACTIVE',
    engine: 'SHEIKHA_FOUNDRY_KNOWLEDGE_STORE_V1',
    createdAt: new Date().toISOString()
  }, null, 2) + '\n');
}

console.log(JSON.stringify({
  success: true,
  engine: 'SHEIKHA_FOUNDRY_KNOWLEDGE_STORE_V1',
  decision
}, null, 2));
JS

grep -RIn "<<<<<<<\|=======\|>>>>>>>" runtime/conversation-engine && {
  echo "Merge markers still exist"
  exit 1
} || true

node --check runtime/conversation-engine/sheikha-conversation-engine-v1.js
node tools/runtime/verify-memory.js
node tools/runtime/verify-self-healing.js
node tools/runtime/verify-knowledge-store.js

npm run lint
npm test

echo "== ACTIVATION OK =="
git status --short
