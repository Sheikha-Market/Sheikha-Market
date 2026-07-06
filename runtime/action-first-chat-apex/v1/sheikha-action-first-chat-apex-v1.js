'use strict';

function classify(message = '') {
  const text = String(message || '').toLowerCase();

  if (/برمج|كود|code|function|class|api|route|server|npm|git|vscode|extension|اصلح/.test(text)) {
    return 'CODING_MODE';
  }

  if (/اكتب|صياغة|نص|خطاب|رسالة|تقرير|محتوى|document|report/.test(text)) {
    return 'WRITING_MODE';
  }

  if (/حلل|analyz|analysis|راجع|افحص|قارن|قيّم/.test(text)) {
    return 'ANALYSIS_MODE';
  }

  if (/فكر|خطط|thinking|reason|استنتج|استراتيجية/.test(text)) {
    return 'THINKING_MODE';
  }

  return 'DIRECT_HELP_MODE';
}

function actionPolicy(message = '') {
  const mode = classify(message);

  return {
    system: 'SHEIKHA_ACTION_FIRST_CHAT_APEX_V1',
    status: 'ACTIVE',
    mode,
    rules: {
      noGenericTemplateFirst: true,
      noRepeatedGreeting: true,
      noInspectorUnlessRequested: true,
      startWithWorkImmediately: true,
      showWhatWasDone: true,
      showNextStep: true,
      noHighImpactExecutionWithoutApproval: true,
      noHarmNoHarar: true
    },
    opening:
      mode === 'CODING_MODE'
        ? 'سأبدأ بالبرمجة مباشرة: أحدد الملف، أكتب التعديل، ثم أعطيك أوامر الاختبار.'
      : mode === 'WRITING_MODE'
        ? 'سأكتب النص مباشرة بصياغة جاهزة ثم أذكر ما تم تحسينه.'
      : mode === 'ANALYSIS_MODE'
        ? 'سأحلل مباشرة: الحالة، السبب، المخاطر، وأفضل إجراء تالٍ.'
      : mode === 'THINKING_MODE'
        ? 'سأرتب التفكير عملياً: فرضيات، ترجيح، قرار، وخطوة تنفيذ.'
      : 'سأتعامل مع طلبك مباشرة بدون قالب جاهز.'
  };
}

module.exports = { classify, actionPolicy };
