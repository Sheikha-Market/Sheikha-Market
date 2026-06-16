'use strict';

function sense(message = '', context = {}) {
  const text = String(message || '').trim();

  const wantsInspector = /inspector|diagnostics|debug|تشخيص|المفتش|حلل حالة/i.test(text);
  const wantsReport = /تقرير|اكتب|اكتبي|لخص|ملخص/i.test(text);
  const wantsFix = /اصلح|فعّل|فعل|اكمل|طور|حسن/i.test(text);

  return {
    system: 'SHEIKHA_LIVING_CONVERSATION_APEX_V1',
    status: 'ACTIVE',
    metaphor: {
      hears: 'INPUT_RECEPTION',
      senses: 'INTENT_AND_TONE_READING',
      sees: 'WORKSPACE_CONTEXT_AWARENESS',
      thinks: 'GOVERNED_COMPUTATIONAL_REASONING',
      heart: 'NO_HARM_GOVERNANCE_CENTER'
    },
    intent: wantsInspector ? 'INSPECTOR_REQUEST'
      : wantsFix ? 'ACTION_OR_REPAIR_REQUEST'
      : wantsReport ? 'REPORT_REQUEST'
      : 'NATURAL_CONVERSATION',
    responsePolicy: {
      repeatGreeting: false,
      hideInspectorByDefault: !wantsInspector,
      answerFirst: true,
      askOnlyWhenNeeded: true,
      noRawJson: true,
      noLongDiagnosticsUnlessRequested: true,
      noHighImpactExecutionWithoutApproval: true
    },
    context: {
      branch: context.branch || null,
      gitClean: context.gitClean ?? null,
      activeFile: context.activeFile || null
    }
  };
}

function composeReply(message = '', context = {}) {
  const s = sense(message, context);

  if (s.intent === 'INSPECTOR_REQUEST') {
    return {
      ...s,
      reply: 'أفهم أنك تريد فحص الحالة. سأعرض الخلاصة أولاً، ثم أترك تفاصيل المفتش قابلة للفتح عند الحاجة.'
    };
  }

  if (s.intent === 'ACTION_OR_REPAIR_REQUEST') {
    return {
      ...s,
      reply: 'فهمت المطلوب. سأبدأ بالإصلاح الآمن: أحدد السبب، أعطيك خطوة تنفيذ مباشرة، وأمنع أي إجراء عالي الأثر دون موافقتك.'
    };
  }

  if (s.intent === 'REPORT_REQUEST') {
    return {
      ...s,
      reply: 'سأكتب تقريراً حياً مختصراً ومفيداً، لا قالباً عاماً: ملخص، حالة، مخاطر، قرار، وخطوة تالية.'
    };
  }

  return {
    ...s,
    reply: 'أنا معك. قل لي ما تريد إنجازه الآن، وسأتعامل معه بسياق المشروع لا كرد آلي جامد.'
  };
}

module.exports = { sense, composeReply };
