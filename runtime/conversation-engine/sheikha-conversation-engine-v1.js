'use strict';

<<<<<<< HEAD
const { runCognitivePipeline } = require('../cognitive-governance-v3/sheikha-cognitive-pipeline-v3');

function wantsDiagnostics(message = '') {
  return /inspector|diagnostic|تشخيص|افحص|حالة المنظومة|تقرير|سجل|log/i.test(String(message));
}

function buildHumanReply(input = {}, cognitive = {}) {
  const msg = String(input.message || '').trim();

  if (wantsDiagnostics(msg)) {
    return null; // اتركه للمفتش عند الطلب الصريح فقط
  }

  const memoryCounts = cognitive.memory?.counts || {};

  return [
    'فهمت طلبك.',
    '',
    'راجعت السياق والذاكرة والحوكمة قبل الرد.',
    '',
    `- النية: ${cognitive.intent}`,
    `- مستوى المخاطر: ${cognitive.risk?.level}`,
    `- الذاكرة المعتمدة: ${(memoryCounts.enterpriseMemory || 0) + (memoryCounts.projectMemory || 0) + (memoryCounts.sessionMemory || 0) + (memoryCounts.longTermMemory || 0)}`,
    `- الذاكرة المحجوبة: ${memoryCounts.suppressedMemory || 0}`,
    '',
    'الخطوة الصحيحة الآن: أعطيك جواباً عملياً، وأترك المفتش يعمل في الخلفية ولا أعرض تفاصيله إلا إذا طلبت التشخيص.'
  ].join('\n');
}

function handleConversation(input = {}) {
  const cognitive = runCognitivePipeline(input);

  if (cognitive.blocked) {
    return {
      success: false,
      blocked: true,
      engine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
      cognitive,
      answer: 'تم إيقاف الطلب لأنه عالي الأثر أو خطر. يمكنني تحويله إلى فحص آمن أو خطة مراجعة.'
    };
  }

  const answer = buildHumanReply(input, cognitive);

  return {
    success: true,
    engine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
    mode: answer ? 'CONVERSATIONAL' : 'DIAGNOSTIC_REQUESTED',
    cognitive,
    nextRoute: answer ? null : '/api/sheikha/unified-chat',
    answer: answer || 'طلبك تشخيصي؛ سأمرره إلى مسار المفتش والتحقق.'
  };
}

module.exports = { handleConversation, wantsDiagnostics, buildHumanReply };
=======
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { collectEnterpriseInspector } = require('../../core/enterprise/sheikha-enterprise-inspector-v3');
const { executePipeline } = require('../execution/sheikha-execution-pipeline-v1');
const { governGovernance } = require('../governance/sheikha-governance-of-governance-v1');
const {
  formatChatAnswer,
  handleUnifiedChat
} = require('../chat-fabric/sheikha-unified-chat-fabric-v1');

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
  return /حلل\s+(?:الحالة|حالة)|افحص\s+(?:المنظومة|النظام|الحالة)|حالة\s+(?:المنظومة|شيخة|النظام)|enterprise\s+inspector|system\s+health|diagnostics|مفتش\s+المنظومة/i
    .test(String(message || ''));
}

function writeConversationAudit(record, options = {}) {
  const paths = getAuditPaths(options.rootDir);
  const answer = String(record.answer || '');
  const latest = {
    engine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
    generatedAt: record.timestamp,
    success: record.success,
    route: record.route,
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
    at: record.timestamp,
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
    foundry: 'SHEIKHA_FOUNDRY_V2',
    governance: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
    inspectorPolicy: 'EXPLICIT_DIAGNOSTIC_REQUESTS_ONLY'
  };
}

function handleConversation(payload = {}, options = {}) {
  const message = String(payload.message || payload.prompt || '').trim();
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
      governance,
      answer: 'تم حظر الطلب بواسطة حوكمة شيخة لأنه يتضمن صلاحية خطرة أو غير مأذونة.'
    };
    if (options.persist !== false) {
      writeConversationAudit({
        ...blocked,
        message,
        channel,
        diagnosticRequested,
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
      answer: formatChatAnswer(result.answer),
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
      channel
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
>>>>>>> b403e614 (Route VS Code chat through Sheikha conversation engine)
