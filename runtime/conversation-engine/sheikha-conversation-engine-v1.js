'use strict';

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
