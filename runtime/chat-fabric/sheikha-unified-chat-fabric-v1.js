'use strict';

const fs = require('fs');
const path = require('path');
const { governGovernance } = require('../governance/sheikha-governance-of-governance-v1');
const { executePipeline } = require('../execution/sheikha-execution-pipeline-v1');

const ROOT = '/opt/sheikha/current';
const AUDIT = path.join(ROOT, 'runtime/audit/sheikha-unified-chat-fabric-audit.jsonl');

function audit(entry) {
  fs.mkdirSync(path.dirname(AUDIT), { recursive: true });
  fs.appendFileSync(AUDIT, JSON.stringify({ ...entry, at: new Date().toISOString() }) + '\n');
}

function normalizeChannel(channel) {
  const c = String(channel || '').toLowerCase();
  if (c.includes('vscode')) return 'vscode-extension';
  if (c.includes('extension')) return 'extension-chat';
  if (c.includes('web')) return 'general-web-chat';
  if (c.includes('cli')) return 'cli';
  return 'api';
}

function buildExecutionMetadata(cli) {
  if (!cli) return undefined;

  return {
    cwd: cli.cwd || null,
    branch: cli.branch || null,
    status: cli.status || '',
    packageName: cli.packageName || null,
    packageVersion: cli.packageVersion || null
  };
}

function handleUnifiedChat(payload = {}) {
  const message = String(payload.message || payload.prompt || '').trim();
  const channel = normalizeChannel(payload.channel || payload.source || payload.actor);

  const governance = governGovernance({
    actor: payload.actor || channel,
    channel,
    action: 'unified_chat',
    message
  });

  if (!governance.allowed) {
    audit({ channel, message, governance });
    return {
      success: false,
      route: 'SHEIKHA_UNIFIED_CHAT_FABRIC_V1',
      blocked: true,
      governance,
      answer: 'تم حظر الطلب بواسطة حوكمة الحوكمة لأنه يتضمن صلاحية خطرة أو غير مأذونة.'
    };
  }

  const result = executePipeline({
    ...payload,
    message,
    source: channel
  });

  const response = {
    success: true,
    route: 'SHEIKHA_UNIFIED_CHAT_FABRIC_V1',
    protocol: 'SHEIKHA_PROTOCOL_V1',
    governanceOfGovernance: governance,
    orchestrator: 'SHEIKHA_SMART_CHAT_ORCHESTRATOR_V3',
    pipeline: result.pipeline,
    intent: result.intent,
    intelligenceMode: result.intelligenceMode,
    claimStatus: result.claimStatus,
    channel,
    answer: [
      'بسم الله الرحمن الرحيم',
      '',
      'أنا شيخة.',
      '',
      'تم المرور عبر بروتوكول شيخة الكامل.',
      '',
      '📜 البروتوكول: SHEIKHA_PROTOCOL_V1',
      '⚖️ حوكمة الحوكمة: SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
      '🧵 القماش الموحد: SHEIKHA_UNIFIED_CHAT_FABRIC_V1',
      '🧭 الأوركستريتور: SHEIKHA_SMART_CHAT_ORCHESTRATOR_V3',
      `⚙️ البيبلاين: ${result.pipeline}`,
      `🧩 النية: ${result.intent}`,
      `🧠 نمط الذكاء: ${result.intelligenceMode}`,
      '',
      result.answer
    ].join('\n'),
    execution: result.cli ? { cli: buildExecutionMetadata(result.cli) } : undefined
  };

  audit({
    channel,
    intent: result.intent,
    intelligenceMode: result.intelligenceMode,
    pipeline: result.pipeline,
    success: true,
    messageBytes: Buffer.byteLength(message),
    answerBytes: Buffer.byteLength(result.answer || '')
  });

  return response;
}

module.exports = { handleUnifiedChat, buildExecutionMetadata };
