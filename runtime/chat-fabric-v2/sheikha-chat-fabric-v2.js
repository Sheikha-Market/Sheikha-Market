'use strict';

const CAPABILITIES = Object.freeze([
  'response-rendering-clean-markdown',
  'no-json-visible-to-user',
  'sse-streaming-ready',
  'session-memory',
  'context-memory',
  'workspace-awareness',
  'git-awareness',
  'project-awareness',
  'debugging-on-demand',
  'ide-apex-routing',
  'technical-capability-apex',
  'governance-before-execution'
]);

const APEX_STACK = Object.freeze([
  'SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1',
  'SHEIKHA_IDE_APEX_V1',
  'SHEIKHA_DEBUGGING_APEX_V1',
  'SHEIKHA_CHAT_INTERFACE_APEX_V1',
  'SHEIKHA_VITAL_CHAT_APEX_V1',
  'SHEIKHA_EXTENSION_EXPERIENCE_APEX_V1',
  'SHEIKHA_CONVERSATION_ENGINE_V1'
]);

function status() {
  return {
    system: 'SHEIKHA_CHAT_FABRIC_V2',
    status: 'ACTIVE',
    decision: 'CHAT_FABRIC_V2_ACTIVE_100',
    level: 'ADVANCED_GOVERNED_CHAT_RUNTIME',
    capabilities: CAPABILITIES,
    apexStack: APEX_STACK,
    governance: {
      reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
      noHarmNoHarar: true,
      noSecretExposure: true,
      noVisibleRawJson: true,
      noAutonomousHighImpactAction: true,
      humanApprovalForHighRisk: true,
      debuggingExplicitOnly: true
    }
  };
}

function classifyMessage(message = '') {
  const text = String(message || '').toLowerCase();

  const wantsDebug = [
    'debug',
    'diagnose',
    'diagnostic',
    'inspector',
    'trace',
    'stack',
    'شخص',
    'تشخيص',
    'افحص الخطأ',
    'المفتش'
  ].some((x) => text.includes(x));

  const wantsReport = [
    'تقرير',
    'تثرير',
    'اكتب تقرير',
    'اكتبي تقرير',
    'report'
  ].some((x) => text.includes(x));

  const wantsCode = [
    'code',
    'vscode',
    'vs code',
    'ide',
    'npm',
    'git',
    'server.js',
    'package.json',
    'todo tree',
    'ripgrep',
    'برمجة',
    'اكستنشن',
    'الإكستنشن'
  ].some((x) => text.includes(x));

  if (wantsDebug) return 'DEBUGGING_ON_DEMAND';
  if (wantsCode) return 'IDE_CODE_ASSIST';
  if (wantsReport) return 'PROFESSIONAL_REPORT';
  return 'CONVERSATION_ENGINE';
}

function renderCleanResponse(payload = {}) {
  const text = String(payload.text || payload.answer || payload.response || '');
  return {
    success: true,
    renderer: 'SHEIKHA_RESPONSE_RENDERER_V2',
    format: 'CLEAN_MARKDOWN',
    visibleRawJson: false,
    text: text
      .replace(/^data:\s*/gm, '')
      .replace(/proxy_non_json_response/g, 'تم تحويل المسار إلى رد احتياطي محكوم')
      .trim()
  };
}

module.exports = {
  status,
  classifyMessage,
  renderCleanResponse
};
