'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { collectEnterpriseInspector } = require('../../core/enterprise/sheikha-enterprise-inspector-v3');
const { executePipeline } = require('../execution/sheikha-execution-pipeline-v1');
const { governGovernance } = require('../governance/sheikha-governance-of-governance-v1');
const { formatChatAnswer, handleUnifiedChat } = require('../chat-fabric/sheikha-unified-chat-fabric-v1');
const { orchestrate } = require('../orchestrator/orchestrator-fabric');
const {
  buildConversationLayerStack,
  buildLayerContext,
  persistConversationMemory,
  persistConversationPostgreSQL
} = require('./sheikha-conversation-layer-stack-v1');

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
  return /حلل\s+(?:الحالة|حالة)\s+(?:الحالية\s+)?(?:للمنظومة|للنظام|لشيخة)|افحص\s+(?:المنظومة|النظام|حالة\s+المنظومة)|حالة\s+(?:المنظومة|شيخة|النظام)|enterprise\s+inspector|system\s+health|system\s+diagnostics|مفتش\s+المنظومة|تشخيص\s+(?:المنظومة|النظام)/i
    .test(String(message || ''));
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
    requestId: record.layerStack?.requestId || record.requestId || null,
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
    },
    layerTrace: (record.layerStack?.layers || []).map((layer) => ({
      layer: layer.layer,
      name: layer.name,
      status: layer.status
    })),
    orchestratorFabric: record.orchestrationFabric
      ? {
          name: record.orchestrationFabric.fabric,
          status: record.orchestrationFabric.status,
          level: record.orchestrationFabric.apexLevel
        }
      : null,
    apexControlPlane: record.apexControlPlane
      ? {
          name: record.apexControlPlane.controlPlane,
          status: record.apexControlPlane.status,
          level: record.apexControlPlane.apexLevel,
          foundry: record.apexControlPlane.foundry?.foundry,
          orchestrator: record.apexControlPlane.orchestrator?.name
        }
      : null
  };

  const audit = {
    at: timestamp,
    engine: latest.engine,
    success: latest.success,
    route: latest.route,
    fallback: latest.fallback,
    diagnosticRequested: latest.diagnosticRequested,
    requestId: latest.requestId,
    intent: latest.intent,
    channel: latest.channel,
    orchestratorFabric: latest.orchestratorFabric,
    apexControlPlane: latest.apexControlPlane,
    request: latest.request,
    response: {
      sha256: latest.response.sha256,
      bytes: latest.response.bytes,
      preview: answer.slice(0, 500)
    },
    layerTrace: latest.layerTrace
  };

  try {
    fs.mkdirSync(path.dirname(paths.latest), { recursive: true });
    fs.mkdirSync(path.dirname(paths.audit), { recursive: true });

    const temporary = `${paths.latest}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(latest, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, paths.latest);
    fs.appendFileSync(paths.audit, `${JSON.stringify(audit)}\n`, 'utf8');

    return { success: true, paths };
  } catch (error) {
    console.warn('[SHEIKHA CONVERSATION AUDIT]', error.message);
    return { success: false, error: error.message, paths };
  }
}

function status() {
  return {
    success: true,
    engine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
    status: 'ACTIVE',
    primaryRoute: '/api/sheikha/conversation-engine/v1/chat',
    diagnosticRoute: '/api/sheikha/enterprise-inspector/v3/status',
    fallbackRoute: '/api/sheikha/unified-chat',
    foundry: 'SHEIKHA_FOUNDRY_V3',
    orchestrator: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2',
    executionOrchestrator: 'SHEIKHA_SUPREME_ORCHESTRATOR_V1',
    orchestratorFabric: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2',
    apexControlPlane: 'SHEIKHA_FOUNDRY_ORCHESTRATION_APEX_V1',
    highestControlPlane: 11,
    governance: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
    inspectorPolicy: 'EXPLICIT_DIAGNOSTIC_REQUESTS_ONLY',
    conversationExperience: 'SHEIKHA_VITAL_CONVERSATION_V1',
    vitality: 'RESPONSIVE_CONTEXTUAL_NON_CONSCIOUS_SYSTEM',
    layerStack: 'SHEIKHA_CONVERSATION_LAYER_STACK_V1',
    highestRuntimeLayer: 8,
    layers: [
      'Conversation Engine',
      'Memory Fabric',
      'Knowledge Store',
      'Knowledge Graph',
      'PostgreSQL',
      'Vector Store',
      'Enterprise Governance',
      'Evidence & Observability'
    ]
  };
}

function handleBlocked({ governance, message, channel, diagnosticRequested, options }) {
  const response = {
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
    response.audit = writeConversationAudit({
      ...response,
      message,
      channel,
      timestamp: new Date().toISOString()
    }, options);
  }

  return response;
}

async function handleConversation(payload = {}, options = {}) {
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
    return handleBlocked({ governance, message, channel, diagnosticRequested, options });
  }

  try {
    const orchestrationFabric = orchestrate({
      ...payload,
      message,
      channel,
      diagnosticRequested
    }, governance);
    const apexControlPlane = orchestrationFabric.executionEnvelope;
    const layerStack = await buildConversationLayerStack(message, {
      rootDir: options.rootDir || payload.workspaceRoot,
      governance,
      orchestrationFabric,
      apexControlPlane
    });
    const conversationContext = buildLayerContext(layerStack);
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
      conversationContext,
      orchestrationFabric,
      apexControlPlane,
      enterpriseInspector
    });

    const response = {
      success: true,
      route: 'SHEIKHA_CONVERSATION_ENGINE_V1',
      endpoint: '/api/sheikha/conversation-engine/v1/chat',
      foundry: 'SHEIKHA_FOUNDRY_V3',
      orchestrator: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2',
      executionOrchestrator: 'SHEIKHA_SUPREME_ORCHESTRATOR_V1',
      orchestrationFabric,
      apexControlPlane,
      governance,
      pipeline: result.pipeline,
      intent: result.intent,
      intelligenceMode: result.intelligenceMode,
      layerStack,
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
      response.memory = payload.memoryConsent === true
        ? persistConversationMemory({
            requestId: layerStack.requestId,
            channel,
            message,
            answer: response.answer,
            intent: response.intent
          }, options)
        : { success: false, skipped: true, reason: 'MEMORY_CONSENT_REQUIRED' };
      response.postgresql = await persistConversationPostgreSQL({
        requestId: layerStack.requestId,
        channel,
        message,
        answer: response.answer,
        intent: response.intent
      });
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
      diagnosticRequested,
      layerStack: null
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
