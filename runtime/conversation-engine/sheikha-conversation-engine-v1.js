'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
  executePipelineAsync
} = require('../execution/sheikha-execution-pipeline-v1');
const {
  executeIntelligenceRequest
} = require(
  '../../core/intelligence-apex/' +
  'sheikha-intelligence-capability-apex-v1'
);
const {
  detectConstructiveDialogueTopic,
  generateConstructiveDialogue
} = require(
  '../../core/gardens-dialogue/' +
  'sheikha-constructive-thought-dialogue-ai-v3'
);
const { governGovernance } = require('../governance/sheikha-governance-of-governance-v1');
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

function formatConversationAnswer(answer) {
  const text = String(answer || '').trim();
  if (!text) return 'بسم الله الرحمن الرحيم\n\nأنا شيخة.\n\nتعذر تكوين الإجابة.';
  if (text.startsWith('بسم الله الرحمن الرحيم')) return text;

  return `بسم الله الرحمن الرحيم\n\nأنا شيخة.\n\n${text}`;
}

function collectEnterpriseInspectorSnapshot(input = {}) {
  const {
    collectEnterpriseInspector
  } = require('../../core/enterprise/sheikha-enterprise-inspector-v3');

  return collectEnterpriseInspector(input);
}

async function handleUnifiedChatFallback(payload = {}) {
  const {
    handleUnifiedChat
  } = require('../chat-fabric/sheikha-unified-chat-fabric-v1');

  return handleUnifiedChat(payload);
}

function isDiagnosticRequest(message) {
  return /حلل\s+(?:الحالة|حالة)\s+(?:الحالية\s+)?(?:للمنظومة|للنظام|لشيخة)|افحص\s+(?:المنظومة|النظام|حالة\s+المنظومة)|حالة\s+(?:المنظومة|شيخة|النظام)|enterprise\s+inspector|system\s+health|system\s+diagnostics|مفتش\s+المنظومة|تشخيص\s+(?:المنظومة|النظام)/i
    .test(String(message || ''));
}

function isConstructiveThoughtDialogueRequested(payload = {}) {
  const mode = String(
    payload.dialogueMode || payload.dialogue || ''
  ).trim().toLowerCase();
  const explicitMode = payload.thoughtDialogue === true ||
    [
      'constructive',
      'constructive-thought',
      'thought-dialogue',
      'ideology-dialogue'
    ].includes(mode);
  if (explicitMode) return true;
  return detectConstructiveDialogueTopic(
    payload.message || payload.prompt || payload.text
  ).matched;
}

function writeConversationAudit(record, options = {}) {
  const paths = getAuditPaths(options.rootDir);
  const answer = String(record.answer || '');
  const timestamp = record.timestamp || new Date().toISOString();
  const metadataOnly = record.metadataOnly === true;

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
      answer: metadataOnly ? undefined : answer.slice(0, 50000),
      sha256: hash(answer),
      bytes: Buffer.byteLength(answer),
      contentStored: !metadataOnly
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
      preview: metadataOnly ? undefined : answer.slice(0, 500),
      contentStored: !metadataOnly
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
    streamingMultilingualChatApex: 'SHEIKHA_STREAMING_MULTILINGUAL_CHAT_APEX_V1',
    technicalCapabilityApex: 'SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1',
    ideApex: 'SHEIKHA_IDE_APEX_V1',
    debuggingApex: 'SHEIKHA_DEBUGGING_APEX_V1',
    chatInterfaceApex: 'SHEIKHA_CHAT_INTERFACE_APEX_V1',
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
    ],
    apexLayers: [
      'Streaming Multilingual Chat Apex',
      'Technical Capability Apex',
      'IDE Apex',
      'Debugging Apex',
      'Chat Interface Apex',
      'Vital Chat Apex'
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
  const thoughtDialogueRequested =
    !diagnosticRequested &&
    isConstructiveThoughtDialogueRequested(payload);

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
      ? payload.inspectorSnapshot || collectEnterpriseInspectorSnapshot({
          workspace: payload.workspace,
          vscodeTools: payload.vscodeTools
        })
      : undefined;

    const requestedMode = String(payload.mode || '').toLowerCase();
    const intelligenceApexRequested =
      !diagnosticRequested &&
      ['standard', 'pro', 'ultra'].includes(requestedMode);
    let thoughtDialogue;
    let intelligenceApex;
    let result;

    if (thoughtDialogueRequested) {
      thoughtDialogue = await generateConstructiveDialogue({
        message,
        frameworkIds: payload.frameworkIds,
        audienceContext: payload.audienceContext,
        religiousLensRequested:
          payload.religiousLensRequested !== false,
        mode: ['standard', 'pro', 'ultra'].includes(requestedMode)
          ? requestedMode
          : 'standard',
        ultraBudgetApproved:
          payload.ultraBudgetApproved === true,
        classifyPerson: payload.classifyPerson === true,
        inferBeliefs: payload.inferBeliefs === true,
        inferReligiousSchool:
          payload.inferReligiousSchool === true,
        inferPoliticalIdeology:
          payload.inferPoliticalIdeology === true,
        politicalMicrotargeting:
          payload.politicalMicrotargeting === true,
        religiousMicrotargeting:
          payload.religiousMicrotargeting === true
      }, {
        intelligenceOptions:
          options.intelligenceOptions || {},
        persist: options.persist !== false,
        root: options.rootDir || payload.workspaceRoot
      });

      result = {
        pipeline: thoughtDialogue.system,
        intent: 'CONSTRUCTIVE_THOUGHT_DIALOGUE',
        intelligenceMode:
          thoughtDialogue.intelligence?.mode?.resolved || null,
        answer: thoughtDialogue.answer
      };
    } else if (intelligenceApexRequested) {
      intelligenceApex = await executeIntelligenceRequest({
        prompt: message,
        task: payload.task,
        mode: requestedMode,
        ultraBudgetApproved:
          payload.ultraBudgetApproved === true
      }, {
        ...(options.intelligenceOptions || {}),
        root: options.rootDir || payload.workspaceRoot,
        persist: options.persist !== false
      });

      if (
        intelligenceApex.status === 'BLOCKED_BY_GOVERNANCE'
      ) {
        return handleBlocked({
          governance: {
            ...governance,
            allowed: false,
            reason: 'INTELLIGENCE_APEX_POLICY'
          },
          message,
          channel,
          diagnosticRequested,
          options
        });
      }

      result = {
        pipeline: intelligenceApex.system,
        intent: intelligenceApex.task,
        intelligenceMode:
          intelligenceApex.mode.resolved,
        answer: intelligenceApex.output
      };
    } else {
      result = await executePipelineAsync({
        ...payload,
        message,
        source: channel,
        channel,
        conversationContext,
        orchestrationFabric,
        apexControlPlane,
        enterpriseInspector
      });
    }

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
      intelligenceApex: intelligenceApex
        ? {
          system: intelligenceApex.system,
          status: intelligenceApex.status,
          task: intelligenceApex.task,
          mode: intelligenceApex.mode,
          execution: intelligenceApex.execution,
          quality: intelligenceApex.quality,
          comparison: intelligenceApex.comparison
        }
        : undefined,
      thoughtDialogue: thoughtDialogue
        ? {
          system: thoughtDialogue.system,
          status: thoughtDialogue.status,
          audience: thoughtDialogue.audience,
          subject: thoughtDialogue.subject,
          methodAnchors: thoughtDialogue.methodAnchors,
          intelligence: thoughtDialogue.intelligence,
          dialogueQuality: thoughtDialogue.dialogueQuality,
          governance: thoughtDialogue.governance,
          privacy: thoughtDialogue.privacy,
          execution: thoughtDialogue.execution
        }
        : undefined,
      layerStack,
      diagnosticRequested,
      inspector: diagnosticRequested ? enterpriseInspector : undefined,
      answer: formatConversationAnswer(result.answer || result.response || result.message || ''),
      fallback: false
    };

    if (options.persist !== false) {
      response.audit = writeConversationAudit({
        ...response,
        message,
        channel,
        metadataOnly: Boolean(thoughtDialogue),
        timestamp: new Date().toISOString()
      }, options);
      response.memory = thoughtDialogue
        ? {
          success: false,
          skipped: true,
          reason: 'CONSTRUCTIVE_DIALOGUE_METADATA_ONLY'
        }
        : payload.memoryConsent === true
        ? persistConversationMemory({
            requestId: layerStack.requestId,
            channel,
            message,
            answer: response.answer,
            intent: response.intent
          }, options)
        : { success: false, skipped: true, reason: 'MEMORY_CONSENT_REQUIRED' };
      response.postgresql = thoughtDialogue
        ? {
          success: false,
          skipped: true,
          reason: 'CONSTRUCTIVE_DIALOGUE_METADATA_ONLY'
        }
        : await persistConversationPostgreSQL({
          requestId: layerStack.requestId,
          channel,
          message,
          answer: response.answer,
          intent: response.intent
        });
    }

    return response;
  } catch (error) {
    const fallback = await handleUnifiedChatFallback({
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
        metadataOnly: thoughtDialogueRequested,
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
