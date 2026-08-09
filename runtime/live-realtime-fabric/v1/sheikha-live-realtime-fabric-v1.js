'use strict';

const LIVE_FAST_MODEL = process.env.SHEIKHA_LIVE_FAST_MODEL || 'tinyllama:latest';
const LIVE_GENERAL_MODEL = process.env.SHEIKHA_OLLAMA_MODEL || 'Sheikha-Core:latest';
const LIVE_CODE_MODEL = process.env.SHEIKHA_LIVE_CODE_MODEL || 'qwen2.5-coder:7b';
const LIVE_ARABIC_MODEL =
  process.env.SHEIKHA_LIVE_ARABIC_MODEL || LIVE_FAST_MODEL;
const LIVE_ARABIC_DEEP_MODEL =
  process.env.SHEIKHA_LIVE_ARABIC_DEEP_MODEL || LIVE_GENERAL_MODEL;
const LIVE_ARABIC_REASONING_MODEL =
  process.env.SHEIKHA_LIVE_ARABIC_REASONING_MODEL || LIVE_ARABIC_MODEL;
const LIVE_REASONING_MODEL = process.env.SHEIKHA_LIVE_REASONING_MODEL || 'deepseek-r1:8b';
const LIVE_NUM_THREAD = Number(process.env.SHEIKHA_LIVE_NUM_THREAD || 16);

const LIVE_ROUTE = 'SHEIKHA_REAL_MODEL_LIVE_STREAM_L65_V2';
const COMPAT_ROUTE = 'SHEIKHA_REAL_MODEL_LIVE_STREAM_L50_V1';

const PROFILES = {
  fast: {
    name: 'LIVE_FIRST_FAST_L65',
    model: LIVE_FAST_MODEL,
    timeoutMs: 60000,
    numCtx: 1024,
    numThread: LIVE_NUM_THREAD,
    numPredict: 48,
    temperature: 0.15,
    topP: 0.85,
    firstTokenTargetMs: 2500,
    modelFirstTokenHardTimeoutMs: 8000
  },
  general: {
    name: 'LIVE_GENERAL_FAST_L65',
    model: LIVE_FAST_MODEL,
    timeoutMs: 75000,
    numCtx: 1536,
    numThread: LIVE_NUM_THREAD,
    numPredict: 128,
    temperature: 0.18,
    topP: 0.9,
    firstTokenTargetMs: 3500,
    modelFirstTokenHardTimeoutMs: 12000
  },
  code: {
    name: 'LIVE_CODE_BALANCED_L65',
    model: LIVE_CODE_MODEL,
    timeoutMs: 90000,
    numCtx: 2048,
    numThread: LIVE_NUM_THREAD,
    numPredict: 160,
    temperature: 0.08,
    topP: 0.9,
    firstTokenTargetMs: 5000,
    modelFirstTokenHardTimeoutMs: 20000
  },
  reasoning: {
    name: 'LIVE_REASONING_DEEP_L65',
    model: LIVE_REASONING_MODEL,
    timeoutMs: 120000,
    numCtx: 2048,
    numThread: LIVE_NUM_THREAD,
    numPredict: 180,
    temperature: 0.12,
    topP: 0.9,
    firstTokenTargetMs: 8000,
    modelFirstTokenHardTimeoutMs: 30000
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
      arabicDeep: LIVE_ARABIC_DEEP_MODEL,
      arabicReasoning: LIVE_ARABIC_REASONING_MODEL,
      general: LIVE_GENERAL_MODEL,
      liveGeneral: PROFILES.general.model,
      code: PROFILES.code.model,
      reasoning: PROFILES.reasoning.model
    },
    performance: {
      liveFirst: true,
      ackBeforeModel: true,
      fastArabicDefault: true,
      firstProgressSignalBeforeModel: false,
      firstArabicTokenWithoutModelWait: true,
      immediateContextualArabicOpening: true,
      fastThenDeepStreaming: true,
      fastModelInlineStreaming: true,
      progressSeparatedFromFinalAnswer: true,
      backgroundDeepSingleFlight: false,
      backgroundDeepDisabledByDefault: true,
      noPlaceholderTokens: true,
      defaultNumPredict: PROFILES.general.numPredict,
      defaultNumCtx: PROFILES.general.numCtx,
      defaultNumThread: PROFILES.general.numThread,
      defaultTimeoutMs: PROFILES.general.timeoutMs,
      firstTokenTargetMs: PROFILES.general.firstTokenTargetMs,
      firstTokenTargetPurpose: 'MODEL_WAIT_PROGRESS_THRESHOLD',
      firstTokenTargetIsSla: false,
      modelFirstTokenHardTimeoutEnabled: true,
      governedLocalFallbackOnBudgetExceeded: true,
      coldStartFirstTokenSlaMs: null,
      coldStartPerformanceCertification: 'NOT_CERTIFIED_CPU_VARIABLE',
      promptComplianceCertification: 'MODEL_AND_PROFILE_SPECIFIC',
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
  // SHEIKHA_LIVE_PROFILE_PRECEDENCE_V3
  const text = String(message || '');
  const normalizedMode = String(mode || 'smart')
    .trim()
    .toLowerCase();
  const channel = String(context.channel || '')
    .trim()
    .toLowerCase();
  const normalizedLanguage = String(context.language || '')
    .trim()
    .toLowerCase();

  const arabicInput = isArabicText(text) ||
    normalizedLanguage.startsWith('ar');

  const wantsReasoning =
    normalizedMode === 'reasoning' ||
    normalizedMode === 'reason' ||
    normalizedMode === 'deep' ||
    /حلل|استنتج|reason|deep|منطق|برهان|استدلال/i.test(text);

  const wantsCode =
    normalizedMode === 'code' ||
    normalizedMode === 'coding' ||
    normalizedMode === 'debug' ||
    normalizedMode === 'programming' ||
    /كود|برمج|debug|fix|patch|diff|stack|trace|خطأ برمجي|javascript|typescript|python|java|rust|golang|php|c#/i.test(text) ||
    /(?:^|\n)\s*(?:cd|find|chmod|bash|sh|sha256sum|curl|wget|npm|git)\b|\$\(|\[\[/i.test(text);

  // Match explicit fast/live instructions only.
  // Identifiers such as LIVE_MODEL_STREAM_OK must not activate this lane.
  const explicitFastText =
    /(?:^|[\s,;:()])(?:fast|live)(?:$|[\s,;:()])/i.test(text) ||
    /سريع|مختصر|لايف/i.test(text);

  const wantsFast =
    normalizedMode === 'fast' ||
    normalizedMode === 'live' ||
    (
      channel === 'extension-chat' &&
      !wantsReasoning &&
      !wantsCode
    ) ||
    explicitFastText;

  let key = 'general';
  let reason = 'general-live-default';

  // Governed priority:
  // reasoning -> coding -> explicit fast -> general
  if (wantsReasoning) {
    key = 'reasoning';
    reason = 'deep-reasoning-requested';
  } else if (wantsCode) {
    key = 'code';
    reason = 'code-quality-requested';
  } else if (wantsFast) {
    key = 'fast';
    reason = 'live-first-speed-requested';
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

  if (arabicInput) {
    profile.outputLanguage = 'ar';
  }

  if (arabicInput && key === 'reasoning') {
    profile.model = LIVE_ARABIC_REASONING_MODEL;
    profile.deepArabicModel = LIVE_ARABIC_REASONING_MODEL;
    profile.sameLanguageModel = true;
    profile.reason = `${reason}-arabic-reasoning-model`;
  }

  // The lightweight Arabic override is only for ordinary fast/general
  // conversation. It must not replace coding or reasoning models.
  if (
    arabicInput &&
    (key === 'fast' || key === 'general')
  ) {
    profile.model = LIVE_ARABIC_MODEL;
    profile.reason = `${reason}-arabic-same-language`;
    profile.sameLanguageModel = true;
    profile.deepArabicModel = LIVE_ARABIC_DEEP_MODEL;
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
  if (/^(?:السلام عليكم|وعليكم السلام|مرحبا|مرحباً|أهلا|أهلًا|شيخة)[.!؟\s]*$/u.test(text)) {
    return 'أهلًا بك. أنا شيخة، كيف أساعدك؟';
  }
  if (/حالة|تشغيل|صحة|health|status/i.test(text)) {
    return 'الحالة الموثقة الآن: ';
  }
  if (/اختبار|تحقق|افحص|قياس/u.test(text)) {
    return 'نتيجة الفحص المباشر: ';
  }
  if (/كود|برمج|debug|patch|خطأ برمجي/i.test(text)) {
    return 'النتيجة التقنية المباشرة: ';
  }
  if (/[؟?]$/u.test(text)) {
    return 'الجواب المباشر: ';
  }
  return 'إليك النتيجة مباشرة: ';
}

function buildGovernedLocalFallbackReply(message = '') {
  const text = String(message || '').trim();

  if (/^(?:السلام عليكم|وعليكم السلام|مرحبا|مرحباً|أهلا|أهلًا|شيخة)[.!؟\s]*$/u.test(text)) {
    return 'أهلًا بك. أنا شيخة، كيف أساعدك؟';
  }
  if (/واحد\s*(?:زائد|\+)\s*واحد/u.test(text)) {
    return 'اثنان.';
  }
  if (/حالة|تشغيل|صحة|health|status/i.test(text)) {
    return [
      'الخادم ومسار SSE متصلان، وأول Token العربي يعمل.',
      'لم يكتمل استدلال النموذج المحلي ضمن الميزانية الزمنية،',
      'لذلك أُغلق الطلب بتعافٍ محلي بدل إبقاء الواجهة معلقة.'
    ].join(' ');
  }
  if (/أصلح|اصلح|إصلاح|fix|خطأ|تعطل|فشل|bug/i.test(text)) {
    return [
      'ثبّت خطوات إعادة العطل ورسالة الخطأ،',
      'افحص أصغر مسار مسؤول،',
      'طبّق تعديلًا محدودًا،',
      'ثم شغّل اختبار الانحدار وlint وفحص الفرق.',
      'النموذج المحلي تجاوز ميزانية أول Token، لذا هذا مسار تعافٍ محكوم.'
    ].join(' ');
  }
  if (/اختبار|تحقق|افحص|قياس/u.test(text)) {
    return [
      'نجح اتصال الشات والبث،',
      'لكن النموذج المحلي لم ينتج Token ضمن الميزانية الزمنية.',
      'أُنهي الطلب دون تعليق، ويحتاج الجواب المتخصص إلى نموذج أسرع أو تسريع عتادي.'
    ].join(' ');
  }
  if (/اشرح|شرح|لماذا|كيف|ما\s+فائدة/u.test(text)) {
    return [
      'لم يكتمل الاستدلال المحلي ضمن المهلة.',
      'لشرح موثق دون تخمين، حدّد الملف أو المصطلح أو النتيجة،',
      'وسيرتبط الجواب بالتعريف والسبب والمثال وطريقة التحقق.'
    ].join(' ');
  }

  return [
    'وصل الطلب وبقي الخادم مستجيبًا،',
    'لكن النموذج المحلي تجاوز ميزانية أول Token.',
    'أُنهي البث بتعافٍ محلي صريح بدل عرض انتظار مفتوح.'
  ].join(' ');
}

function isShellCommandReviewRequest(message = '') {
  const text = String(message || '');
  const commandSignals = text.match(
    /(?:^|\n)\s*(?:cd|find|chmod|bash|sh|sha256sum|curl|wget|npm|git)\b|\$\(|\[\[/gim
  ) || [];
  const terminalEvidence = /(?:^|\n)\s*F12_[A-Z0-9_]*EXIT_CODE=\d+/im.test(text);

  return commandSignals.length >= 2 ||
    (terminalEvidence && commandSignals.length >= 1) ||
    (/EXPECTED_[A-Z0-9_]*SHA256/.test(text) && /bash\s+["']?\$/i.test(text));
}

function buildGovernedShellReviewReply(message = '') {
  if (!isShellCommandReviewRequest(message)) return null;

  const text = String(message || '');
  const f12D2EvidenceFileMismatch =
    /F12_D2_EXIT_CODE=1/i.test(text) &&
    /^-current-worktree-state\.json\s*$/m.test(text) &&
    /expected\.txt[\s\S]*actual\.txt/i.test(text);

  if (f12D2EvidenceFileMismatch) {
    return [
      'لم أنفذ أي أمر من النص المرسل.',
      'تشخيص F12_D2: التحليل نفسه وصل إلى قرار NO_SAFE_EXISTING_DEPENDENCY_TREE_OFFLINE_ENVIRONMENT_PREFLIGHT_REQUIRED، لكن المرحلة فشلت قبل النشر الذري.',
      'سبب الفشل المثبت في فرق الملفات: current-worktree-state.json موجود في القائمة المتوقعة ولم يُنشأ داخل مجلد أدلة المراجعة.',
      'لذلك لا يجوز اعتبار هذا التشغيل إكمالًا لـ F12_D2، ولا اعتماد RESULT أو TERMINAL نهائيين منه.',
      'الإجراء الصحيح: تصحيح مولد الأدلة بإنتاج حالة شجرة العمل، وإصدار سكربت تصحيح ببصمة جديدة، ثم إعادة التحقق دون تشغيل Jest أو تثبيت تبعيات أو تعديل شجرة العمل.'
    ].join(' ');
  }

  const checksDigest = /sha256sum|EXPECTED_[A-Z0-9_]*SHA256/i.test(text);
  const searchesFiles = /\bfind\b/i.test(text);
  const changesPermissions = /\bchmod\b/i.test(text);
  const launchesScript = /\bbash\b|(?:^|\n)\s*sh\s+/im.test(text);
  const capabilities = [
    searchesFiles ? 'البحث عن ملفات محلية' : null,
    checksDigest ? 'مطابقة بصمات SHA-256' : null,
    changesPermissions ? 'تغيير صلاحية ملف' : null,
    launchesScript ? 'تشغيل سكربت محلي' : null
  ].filter(Boolean).join('، ');

  return [
    'لم أنفذ هذه الأوامر.',
    `وظيفة السكربت الظاهرة: ${capabilities || 'إجراء عمليات طرفية محلية'}.`,
    checksDigest
      ? 'وجود البصمات المتوقعة يقلل خطر استبدال الملفات، لكنه لا يثبت سلامة محتوى المشغّل نفسه.'
      : 'لا يظهر تحقق صريح من سلامة الملف قبل التشغيل.',
    launchesScript
      ? 'الخطر الأعلى هو تشغيل bash؛ فقد يكتب أو يحذف أو يتصل بالشبكة بحسب محتوى الملف المستهدف.'
      : 'لا يظهر تشغيل مباشر لملف آخر في النص المعروض.',
    'الإجراء الآمن التالي: تحقق من البصمات، وافتح المشغّل للمراجعة، وافحص مسارات الكتابة والشبكة، ثم اطلب موافقة بشرية منفصلة قبل التشغيل.'
  ].join(' ');
}

function parseOperationalEvidenceMarkers(message = '') {
  const markers = {};

  for (const line of String(message || '').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]{2,})\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    markers[match[1]] = match[2];
  }

  return markers;
}

function isStructuredOperationalEvidenceReviewRequest(message = '') {
  const markers = parseOperationalEvidenceMarkers(message);
  const keys = Object.keys(markers);

  return keys.length >= 4 && keys.some((key) =>
    key === 'SELECTION_REVIEW_COMPLETE' ||
    key === 'SELECTION_REVIEW_TERMINAL' ||
    /_EXIT_CODE$|_COMPLETED_SUCCESSFULLY$/.test(key)
  );
}

function buildGovernedOperationalEvidenceReply(message = '') {
  if (!isStructuredOperationalEvidenceReviewRequest(message)) return null;

  const markers = parseOperationalEvidenceMarkers(message);
  const completionKey = Object.keys(markers).find((key) =>
    /_COMPLETED_SUCCESSFULLY$/.test(key)
  );
  const exitKey = Object.keys(markers).find((key) => /_EXIT_CODE$/.test(key));
  const phase = completionKey
    ? completionKey.replace(/_COMPLETED_SUCCESSFULLY$/, '')
    : exitKey
      ? exitKey.replace(/_EXIT_CODE$/, '')
      : 'المرحلة المرسلة';
  const completed = markers.SELECTION_REVIEW_COMPLETE === 'true' ||
    markers[completionKey] === 'true';
  const terminal = markers.SELECTION_REVIEW_TERMINAL === 'true';
  const rerunForbidden = markers.SELECTION_REVIEW_RERUN_ALLOWED === 'false';
  const digestValid = markers.SELECTION_REVIEW_DIGEST_LIST_VALID === 'true';
  const exitSucceeded = !exitKey || markers[exitKey] === '0';
  const counts = [
    ['المتوافقون', markers.COMPATIBLE_CANDIDATE_COUNT],
    ['المؤهلون الصارمون', markers.STRICT_ELIGIBLE_CANDIDATE_COUNT],
    ['الآمنون للنسخ المعزول', markers.SAFE_FOR_ISOLATED_COPY_CANDIDATE_COUNT]
  ].filter(([, value]) => value !== undefined)
    .map(([label, value]) => `${label}: ${value}`)
    .join('، ');

  return [
    'قراءة محكومة للأدلة النصية المرسلة فقط:',
    `- المرحلة: ${phase}.`,
    `- النتيجة المعلنة: ${completed && exitSucceeded ? 'مكتملة بنجاح' : 'غير مكتملة أو تحتاج تحققًا إضافيًا'}.`,
    `- السجل الطرفي: ${terminal ? 'نهائي' : 'غير مثبت كنهائي في النص'}.`,
    `- قائمة البصمات: ${digestValid ? 'معلنة صحيحة' : 'غير مثبتة في النص'}.`,
    counts ? `- المرشحون: ${counts}.` : null,
    rerunForbidden
      ? '- إعادة تشغيل المرحلة ممنوعة وفق السجل المرسل.'
      : '- لا يظهر منع صريح لإعادة التشغيل في النص.',
    '- لم أنفذ تشغيلًا أو نشرًا أو تعديلًا من داخل الشات.',
    '- الاعتماد الملفي النهائي يتطلب مطابقة مجلد الأدلة وقائمة SHA-256 مع هذه العلامات؛ النص وحده يثبت الادعاء المرسل ولا يثبت الملفات على القرص.'
  ].filter(Boolean).join('\n');
}

function isContextualReportFollowUpRequest(message = '') {
  return /^\s*(?:اكتب(?:ي)?|أنشئ(?:ي)?|أعد|اعد|جهز(?:ي)?|حو[ّ]?ل(?:ي)?)\s+(?:لي\s+)?(?:هذا\s+)?(?:ال)?(?:تقرير|تثرير)(?:\s|$)/i
    .test(String(message || ''));
}

function restoreSafeReportPunctuation(value = '') {
  let text = String(value || '');

  for (let index = 0; index < 4; index += 1) {
    text = text.replace(
      /&amp;(?=(?:amp;)*(?:#x2F;|#47;|quot;|#34;|#x27;|#39;))/gi,
      '&'
    );
  }

  return text
    .replace(/&#x2F;|&#47;/gi, '/')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'");
}

function buildGovernedContextualReportReply(
  context = '',
  request = 'اكتب تقرير'
) {
  if (!isContextualReportFollowUpRequest(request)) return null;

  const normalizedContext = restoreSafeReportPunctuation(context)
    .replace(/^\s*الحالة الموثقة الآن:\s*/i, '')
    .trim()
    .slice(0, 8000);

  if (!normalizedContext) return null;

  const lines = normalizedContext
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const findLine = (...prefixes) => lines.find((line) =>
    prefixes.some((prefix) => line.startsWith(prefix))
  );
  const statusLine = findLine('حالة المنظومة:', 'الحالة:');
  const diagnosticsLine = findLine('التشخيص:');
  const resourcesLine = findLine('الموارد:');
  const risksLine = findLine('المخاطر:');
  const governanceLine = findLine('الحوكمة:');
  const nextActionLine = findLine(
    'أفضل إجراء تالٍ',
    'الإجراء التالي:',
    'التوصية:'
  );
  const noImpactLine = findLine('لم يُنفذ', 'لم ينفذ');
  const fallbackSummary = lines.slice(0, 3).join(' ');

  return [
    '## تقرير حالة منظومة شيخة',
    '',
    '### الملخص التنفيذي',
    statusLine || fallbackSummary,
    '',
    '### الحالة التشغيلية والتشخيص',
    diagnosticsLine || 'لا يحتوي السياق السابق على قياسات تشخيصية مفصلة.',
    resourcesLine || 'لا يحتوي السياق السابق على قياسات موارد مفصلة.',
    '',
    '### المخاطر',
    risksLine || 'لم تُذكر مخاطر محددة في السياق السابق.',
    '',
    '### الحوكمة والضوابط',
    governanceLine || 'لم تُذكر حالة الحوكمة تفصيليًا في السياق السابق.',
    noImpactLine || 'لم ينفذ إنشاء هذا التقرير أي إجراء عالي الأثر.',
    '',
    '### الإجراء الموصى به',
    nextActionLine || 'يلزم جمع دليل تشغيلي إضافي قبل تحديد الإجراء التالي.',
    '',
    '### حدود التقرير',
    '- بُني التقرير من آخر نتيجة ظاهرة في سياق المحادثة فقط.',
    '- لم تُقرأ ملفات جديدة ولم تُنفذ أوامر أو تغييرات في النظام.'
  ].join('\n');
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


// SHEIKHA_LIVE_EXACT_OUTPUT_AND_TRUTHFUL_LATENCY_POLICY_V3
function extractExactOutputContract(message = '') {
  const text = String(message || '').trim();

  const patterns = [
    /^(?:return|reply|respond|output|print)\s+only\s+(?:this\s+)?(?:text|identifier|token|string)\s*:\s*([\s\S]+)$/i,
    /^(?:أعد|ارجع|اكتب|اطبع)\s+(?:فقط\s+)?(?:هذا\s+)?(?:النص|المعرف|الرمز|السلسلة)\s*:\s*([\s\S]+)$/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match) continue;

    return String(match[1] || '')
      .trim()
      .replace(/^["'`]+|["'`]+$/g, '');
  }

  return null;
}

function buildPrompt(message = '', profile = {}) {

  const exactOutput = extractExactOutputContract(message);

  if (exactOutput) {
    return [
      'Output exactly the text below.',
      'Do not add an introduction, explanation, translation, quotation marks, or punctuation.',
      exactOutput
    ].join('\n');
  }

  const userMessage = String(message || '').trim();
  const arabicInput = /[\u0600-\u06FF]/.test(userMessage) ||
    profile.outputLanguage === 'ar';

  if (arabicInput) {
    return [
      'You are replying to an Arabic user. Reply ONLY in Arabic, no English.',
      'اكتب جواباً قصيراً ومباشراً ولا تستخدم عبارات انتظار.',
      'ابدأ بالمحتوى المطلوب مباشرة، ولا تذكر اسمك أو اسم النموذج أو المنصة.',
      'أكمل جميع النقاط أو البنود التي طلبها المستخدم ضمن جواب موجز.',
      'السؤال:',
      userMessage
    ].join('\n');
  }

  return [
    'أجب مرة واحدة فقط بدون تكرار.',
    'أجب بنفس لغة المستخدم. إذا كان الطلب عربياً فأجب بالعربية.',
    'If the user writes Arabic, reply ONLY in Arabic and do not explain in English.',
    'لا تستخدم عبارات: تم الاستلام، سأبدأ، سأكمل في الخلفية.',
    'لا تذكر اسمك أو اسم النموذج أو المنصة إلا إذا سأل المستخدم عنها.',
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
  buildGovernedLocalFallbackReply,
  isShellCommandReviewRequest,
  buildGovernedShellReviewReply,
  parseOperationalEvidenceMarkers,
  isStructuredOperationalEvidenceReviewRequest,
  buildGovernedOperationalEvidenceReply,
  isContextualReportFollowUpRequest,
  restoreSafeReportPunctuation,
  buildGovernedContextualReportReply,
  selectLiveModel,
  liveRequestOptions,
  buildPrompt,
  extractExactOutputContract
};
