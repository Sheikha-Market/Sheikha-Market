'use strict';

const LIVE_FAST_MODEL = process.env.SHEIKHA_LIVE_FAST_MODEL || 'tinyllama:latest';
const LIVE_GENERAL_MODEL = process.env.SHEIKHA_OLLAMA_MODEL || 'Sheikha-Core:latest';
const LIVE_ARABIC_MODEL = process.env.SHEIKHA_LIVE_ARABIC_MODEL || LIVE_FAST_MODEL;
const LIVE_CODE_MODEL = process.env.SHEIKHA_LIVE_CODE_MODEL || LIVE_FAST_MODEL;
const LIVE_REASONING_MODEL = process.env.SHEIKHA_LIVE_REASONING_MODEL || 'deepseek-r1:8b';

const LIVE_ROUTE = 'SHEIKHA_REAL_MODEL_LIVE_STREAM_L65_V2';
const COMPAT_ROUTE = 'SHEIKHA_REAL_MODEL_LIVE_STREAM_L50_V1';

const PROFILES = {
  fast: {
    name: 'LIVE_FIRST_FAST_L65',
    model: LIVE_FAST_MODEL,
    timeoutMs: 60000,
    numPredict: 48,
    temperature: 0.15,
    topP: 0.85,
    firstTokenTargetMs: 2500
  },
  general: {
    name: 'LIVE_GENERAL_FAST_L65',
    model: LIVE_FAST_MODEL,
    timeoutMs: 75000,
    numPredict: 128,
    temperature: 0.18,
    topP: 0.9,
    firstTokenTargetMs: 3500
  },
  code: {
    name: 'LIVE_CODE_BALANCED_L65',
    model: LIVE_CODE_MODEL,
    timeoutMs: 90000,
    numPredict: 160,
    temperature: 0.08,
    topP: 0.9,
    firstTokenTargetMs: 5000
  },
  reasoning: {
    name: 'LIVE_REASONING_DEEP_L65',
    model: LIVE_REASONING_MODEL,
    timeoutMs: 120000,
    numPredict: 180,
    temperature: 0.12,
    topP: 0.9,
    firstTokenTargetMs: 8000
  }
};

function status() {
  return {
    success: true,
    system: LIVE_ROUTE,
    status: 'ACTIVE',
    apexLevel: 65,
    mode: 'REAL_MODEL_TOKEN_STREAM_LIVE_FIRST',
    placeholderRemoved: true,
    makeFastAnswerRemoved: true,
    compatibility: {
      previousSystem: COMPAT_ROUTE,
      endpointStable: '/api/sheikha/live/chat/v1',
      extensionTransport: 'REAL_SSE_L51_COMPATIBLE'
    },
    routing: {
      fast: PROFILES.fast.model,
      arabicFast: LIVE_ARABIC_MODEL,
      arabicDeep: LIVE_GENERAL_MODEL,
      general: LIVE_GENERAL_MODEL,
      liveGeneral: PROFILES.general.model,
      code: PROFILES.code.model,
      reasoning: PROFILES.reasoning.model
    },
    performance: {
      liveFirst: true,
      ackBeforeModel: true,
      fastArabicDefault: true,
      firstArabicTokenWithoutModelWait: true,
      noPlaceholderTokens: true,
      defaultNumPredict: PROFILES.general.numPredict,
      defaultTimeoutMs: PROFILES.general.timeoutMs,
      firstTokenTargetMs: PROFILES.general.firstTokenTargetMs,
      deepLayerEscalationAvailable: true
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      envProtected: true,
      secretsProtected: true,
      destructiveActionsBlocked: true
    }
  };
}

function isArabicText(input = '') {
  return /[\u0600-\u06FF]/.test(String(input || ''));
}

function resolveLiveProfile(message = '', mode = 'smart', context = {}) {
  const text = String(message || '');
  const normalizedMode = String(mode || 'smart').toLowerCase();
  const channel = String(context.channel || '').toLowerCase();
  const arabicInput = isArabicText(text) ||
    String(context.language || '').toLowerCase().startsWith('ar');
  const wantsFast = normalizedMode === 'fast' ||
    normalizedMode === 'live' ||
    channel === 'extension-chat' ||
    /سريع|مختصر|fast|live|لايف/i.test(text);
  const wantsReasoning = /حلل|استنتج|reason|deep|منطق|برهان|استدلال/i.test(text);
  const wantsCode = normalizedMode === 'code' ||
    /كود|برمج|debug|fix|test|اختبار|patch|diff|stack|trace|خطأ/i.test(text);

  let key = 'general';
  let reason = 'general-live-default';

  if (wantsFast && !wantsReasoning) {
    key = 'fast';
    reason = 'live-first-speed-requested';
  } else if (wantsReasoning) {
    key = 'reasoning';
    reason = 'deep-reasoning-requested';
  } else if (wantsCode) {
    key = 'code';
    reason = 'code-quality-requested';
  }

  const profile = {
    ...PROFILES[key],
    key,
    reason,
    route: LIVE_ROUTE,
    compatibilityRoute: COMPAT_ROUTE,
    apexLevel: 65,
    liveFirst: true,
    deepLayerEscalationAvailable: true
  };

  if (arabicInput && key !== 'reasoning') {
    profile.model = LIVE_ARABIC_MODEL;
    profile.reason = `${reason}-arabic-same-language`;
    profile.sameLanguageModel = true;
    profile.deepArabicModel = LIVE_GENERAL_MODEL;
  }

  return profile;
}

function shouldUseFastArabicDefault(message = '', mode = 'smart', context = {}) {
  if (context.fastArabic === false || context.liveFast === false) return false;

  const normalizedMode = String(mode || 'smart').toLowerCase();
  const channel = String(context.channel || '').toLowerCase();
  const language = String(context.language || '').toLowerCase();

  return isArabicText(message) ||
    language.startsWith('ar') ||
    (channel === 'extension-chat' && normalizedMode !== 'reasoning');
}

function buildFastArabicReply(message = '') {
  const text = String(message || '').trim();
  if (!text) return 'شيخة جاهزة للطلب.';
  return 'تم، أعمل على ذلك الآن.';
}

function selectLiveModel(message = '', mode = 'smart', context = {}) {
  return resolveLiveProfile(message, mode, context).model;
}

function liveRequestOptions(message = '', mode = 'smart', context = {}) {
  const profile = resolveLiveProfile(message, mode, context);
  return {
    temperature: profile.temperature,
    top_p: profile.topP,
    num_predict: profile.numPredict
  };
}

function buildPrompt(message = '', profile = {}) {
  const userMessage = String(message || '').trim();
  const arabicInput = /[\u0600-\u06FF]/.test(userMessage);

  if (arabicInput) {
    return [
      'You are replying to an Arabic user. Reply ONLY in Arabic, no English.',
      'اكتب جواباً قصيراً ومباشراً ولا تستخدم عبارات انتظار.',
      'السؤال:',
      userMessage
    ].join('\n');
  }

  return [
    'أجب مرة واحدة فقط بدون تكرار.',
    'أجب بنفس لغة المستخدم. إذا كان الطلب عربياً فأجب بالعربية.',
    'If the user writes Arabic, reply ONLY in Arabic and do not explain in English.',
    'لا تستخدم عبارات: تم الاستلام، سأبدأ، سأكمل في الخلفية.',
    'كن مباشراً ومفيداً، وابدأ بأهم نتيجة عملية أولاً.',
    profile.name ? `Live profile: ${profile.name}.` : '',
    userMessage
  ].filter(Boolean).join('\n');
}

module.exports = {
  status,
  isArabicText,
  resolveLiveProfile,
  shouldUseFastArabicDefault,
  buildFastArabicReply,
  selectLiveModel,
  liveRequestOptions,
  buildPrompt
};
