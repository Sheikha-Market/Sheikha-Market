'use strict';

const http = require('http');
const https = require('https');
const { collectWorkspaceContext } = require('./sheikhaWorkspaceIntelligence');
const { collectVSCodeToolContext } = require('./sheikhaVSCodeToolRegistry');
const { normalizeSheikhaReply } = require('./sheikhaReplyNormalizer');
const { decideSmartRoute } = require('./sheikhaSmartRouteGovernance');
const {
  isGovernedPreconditionDriftCaptureRequest,
  isGovernedPublishedEvidenceVerificationRequest,
  isGovernedReadOnlyEvidenceCaptureRequest
} = require('./chat/sheikhaReadOnlyEvidenceCapture');
const {
  isGovernedLauncherPreflightRequest
} = require('./chat/sheikhaGovernedLauncherPreflight');
const {
  isGovernedReadOnlyScriptRequest
} = require('./chat/sheikhaGovernedReadOnlyScriptRunner');

const LOCAL_BASE_URL = process.env.SHEIKHA_LOCAL_API_BASE_URL || 'http://127.0.0.1:8080';
const DEFAULT_BASE_URL = process.env.SHEIKHA_API_BASE_URL || LOCAL_BASE_URL;
const CONVERSATION_ENDPOINT = '/api/sheikha/conversation-engine/v1/chat';
const UNIFIED_CHAT_FALLBACK_ENDPOINT = '/api/sheikha/unified-chat';
const INSPECTOR_STATUS_ENDPOINT = '/api/sheikha/enterprise-inspector/v3/context';
const ORGANIZATION_CONTROL_STATUS_ENDPOINT =
  '/api/sheikha/organization-control/v1/status';
const EXTENSION_EXPERIENCE_STATUS_ENDPOINT = '/api/sheikha/extension-experience/v1/status';
const VITAL_CHAT_APEX_STATUS_ENDPOINT = '/api/sheikha/vital-chat-apex/v1/status';
const DEBUGGING_APEX_STATUS_ENDPOINT = '/api/sheikha/debugging-apex/v1/status';
const CHAT_INTERFACE_APEX_STATUS_ENDPOINT = '/api/sheikha/chat-interface-apex/v1/status';
const IDE_APEX_STATUS_ENDPOINT = '/api/sheikha/ide-apex/v1/status';
const TECHNICAL_CAPABILITY_APEX_STATUS_ENDPOINT = '/api/sheikha/technical-capability-apex/v1/status';
const COMPUTING_COGNITIVE_APEX_STATUS_ENDPOINT = '/api/intelligence/execution-loop/apex/status';
const STREAMING_CHAT_APEX_STATUS_ENDPOINT = '/api/sheikha/streaming-chat-apex/v1/status';
const STREAMING_CHAT_APEX_STREAM_ENDPOINT = '/api/sheikha/streaming-chat-apex/v1/stream';
const AUTONOMOUS_CHAT_ENDPOINT = '/api/sheikha/chat/autonomous/v1';
const AUTONOMOUS_STREAM_ENDPOINT = '/api/sheikha/streaming-chat-apex/v1/autonomous';
const LIVE_CHAT_ENDPOINT = '/api/sheikha/live/chat/v1';
const LEGACY_LIVE_CHAT_ENDPOINT = '/api/sheikha/live-chat';
const LIVE_RESPONSE_MODE = 'FAST_THEN_DEEP_STREAM';
const DEFAULT_EXTENSION_CHAT_LANGUAGE = 'ar';
const EXTENSION_STREAMING_ARTIFACT_APEX_STATUS_ENDPOINT =
  '/api/sheikha/extension-streaming-artifact-apex/v1/status';
const EXTENSION_TRANSPORT_VERSION = require('../package.json').version;
const DEFAULT_LIVE_FIRST_TOKEN_TIMEOUT_MS = 8000;
const {
  buildGovernedCompletionContract
} = require('./chat/sheikhaGovernedCompletionContract');

function normalizeLocalBaseUrl(value, fallback = LOCAL_BASE_URL) {
  try {
    const url = new URL(String(value || fallback).trim());
    if (!['http:', 'https:'].includes(url.protocol)) return fallback;
    if (url.hostname === 'localhost') url.hostname = '127.0.0.1';
    return url.toString().replace(/\/+$/u, '');
  } catch {
    return fallback;
  }
}

function extractAnswerText(value, seen = new Set()) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value !== 'object') return '';
  if (seen.has(value)) return '';
  seen.add(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => extractAnswerText(item, seen))
      .filter(Boolean)
      .join('\n');
  }

  for (const key of ['answer', 'answerText', 'text', 'content', 'response', 'reply', 'message']) {
    const text = extractAnswerText(value[key], seen);
    if (text) return text;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

function isAmbiguousExecutionRequest(message) {
  return /^(?:شغ[ّ]?ل|تشغيل|نف[ّ]?ذ|ابدأ|ابدا|run|start|execute)[.!؟?\s]*$/iu
    .test(String(message || '').trim());
}

function buildAmbiguousExecutionAnswer() {
  return [
    'طلب التشغيل يحتاج هدفًا محددًا حتى لا أنفذ إجراءً غير مقصود.',
    '',
    'اختر أو اكتب أحد الخيارات:',
    '1. شغّل المشروع محليًا.',
    '2. شغّل اختبارات الإضافة.',
    '3. افحص الخادم وEnterprise Inspector.',
    '4. افحص الجاهزية الإنتاجية دون نشر.',
    '5. شغّل أمرًا محددًا بعد مراجعته.',
    '',
    'لم يُنفذ أي أمر أو إجراء عالي الأثر.'
  ].join('\n');
}

function isWebsiteRequest(message) {
  const text = String(message || '').trim();
  return /(?:شغ[ّ]?ل[ي]?(?:\s+لي)?\s+(?:الموقع|موقع\s+شيخة)|(?:افتح|حالة|رابط)\s+(?:الموقع|موقع\s+شيخة)|(?:https?:\/\/)?(?:www\.)?sheikha\.top(?:\/\S*)?)/iu
    .test(text);
}

function buildWebsiteStatusAnswer(status = {}) {
  const online = status?.success === true &&
    (status?.data?.status === 'ok' || status?.status === 'ok');
  const lines = online
    ? [
        'موقع شيخة يعمل محليًا والخدمة بحالة سليمة.',
        '',
        '- الموقع المحلي: http://127.0.0.1:8080/',
        '- الموقع الرسمي: https://www.sheikha.top',
        '- الصحة المحلية: http://127.0.0.1:8080/api/health'
      ]
    : [
        'موقع شيخة غير متاح محليًا الآن أو تعذر التحقق من صحته.',
        '',
        'الإجراء المحكوم التالي: استخدم أداة «إعادة Runtime»؛ فهي تتطلب موافقة بشرية قبل إعادة التشغيل.',
        'الموقع الرسمي: https://www.sheikha.top'
      ];
  lines.push('', 'لم يُنفذ نشر أو تعديل أو إجراء عالي الأثر.');
  return lines.join('\n');
}

function isSheikhaChatIdentityRequest(message) {
  return /^(?:(?:ما هو|ما هي|ما حالة)\s*)?(?:ال)?شات(?:\s+شيخة)?\s*[؟?!.]*$/iu
    .test(String(message || '').trim()) ||
    /^(?:عر[ّ]?ف(?:ي)?|من هي|ما هي)\s+(?:منظومة\s+)?شيخة(?:\s+عن\s+نفسك)?\s*[؟?!.]*$/iu
      .test(String(message || '').trim()) ||
    /^شيخة\s+عر[ّ]?ف(?:ي)?\s+(?:عن\s+)?نفسك\s*[؟?!.]*$/iu
      .test(String(message || '').trim());
}

function buildSheikhaChatIdentityAnswer() {
  return [
    'شيخة هي منصة تشغيل عربية محكومة باسم SHEIKHA UGIT-RP للصناعة والتجارة وسلاسل الإمداد والتدوير والمدن الذكية.',
    'وشات شيخة هو واجهة تشغيل محلية محكومة للمساعدة الهندسية والتشغيلية، وليس شاتًا عامًا أو اسم نبات أو شخص حقيقي.',
    '',
    'وظائفه المثبتة في الإضافة:',
    '- قراءة حالة Runtime وEnterprise Inspector.',
    '- تحرير الوثائق والكود مع أدلة وحدود واضحة.',
    '- تشغيل 39 أداة مسجلة عبر أوامر VS Code محكومة.',
    '- بث عربي، ومراجعة الأدلة، وفصل الإجراءات عالية الأثر خلف موافقة بشرية.',
    '',
    'لا أدّعي الوعي أو العصمة أو سلطة شرعية، ولا أنفذ أوامر النظام أو النشر أو التثبيت تلقائيًا دون مسار مصرح ومراجعة بشرية.'
  ].join('\n');
}

function isSheikhaCapabilitiesRequest(message) {
  return /^(?:ماذا|ما الذي|وش)\s+(?:يمكنك|تستطيع(?:ين)?|تقدر(?:ين)?)\s+(?:[أا]ن\s+)?تفعل(?:ين)?\s*[؟?!.]*$/iu
    .test(String(message || '').trim()) ||
    /^(?:ما|اذكر(?:ي)?)\s+(?:هي\s+)?(?:قدراتك|إمكاناتك|امكانياتك)\s*[؟?!.]*$/iu
      .test(String(message || '').trim());
}

function buildSheikhaCapabilitiesAnswer() {
  return [
    '## قدرات شات شيخة',
    '',
    'أستطيع ضمن مساحة المشروع والصلاحيات المتاحة:',
    '1. قراءة الملفات وفهم المعمارية وتتبع الأخطاء والمخاطر.',
    '2. تحرير الوثائق والكود والاختبارات وإنتاج فرق قابل للمراجعة.',
    '3. تحليل Enterprise Inspector وحالة Runtime وGit دون اختلاق نتائج.',
    '4. تشغيل اختبارات وفحوص محلية وأوامر محكومة بعد تصنيف أثرها.',
    '5. مراجعة الأدلة والبصمات والتراخيص وحدود الجاهزية الإنتاجية.',
    '6. تحليل العلوم والحساب مع إظهار الفرضيات والوحدات وعدم اليقين.',
    '',
    'الحدود: لا أنفذ نشرًا أو تثبيتًا أو أمرًا عالي الأثر دون تفويض صريح، ولا أصدر فتوى أو ترخيصًا حكوميًا، ولا أصف نتيجة بأنها مكتملة بلا دليل تشغيلي.'
  ].join('\n');
}

function isUsefulDiscoveryRequest(message) {
  return /(?:ابحث|استخرج|اقترح).{0,20}(?:ما|شيئ(?:ًا|ا)?|أشياء).{0,15}(?:مفيد|نافع)|ما\s+المفيد\s+الآن/iu
    .test(String(message || '').trim());
}

function buildUsefulDiscoveryAnswer() {
  return [
    '## أعلى الأعمال فائدة الآن',
    '',
    '1. تثبيت جودة الرد العربي ومنع انتقال الإجابات العامة أو تعريف شيخة تعريفًا خاطئًا.',
    '2. فرز تغييرات مساحة العمل إلى نطاقات مستقلة قبل أي إصدار.',
    '3. تشغيل اختبارات الشات وDOM وlint وفحص الأسرار ثم حفظ النتائج ببصمات.',
    '4. اعتماد A100 أو B200 فقط بعد التحقق من السعر والمنطقة والتخصيص وسقف الميزانية؛ لم يتم شراء GPU خارجي.',
    '5. إبقاء الإنتاج التجاري الموزع محجوبًا حتى اختبار الفشل والتعافي والمراجعة القانونية والتشغيلية.',
    '',
    'هذه أولويات عملية من حالة المشروع الحالية، وليست بحث ويب أو ادعاء تحقق مستقل جديد.'
  ].join('\n');
}

function isStandaloneReportRequest(message) {
  return /^(?:اكتب(?:ي)?|أنشئ|حرر)\s+(?:لي\s+)?تقرير(?:ًا|ا)?(?:\s+(?:كامل(?:ًا|ا)?|مفصل(?:ًا|ا)?|متكامل(?:ًا|ا)?))?\s*[؟?!.]*$/iu
    .test(String(message || '').trim());
}

function buildStandaloneReportAnswer(history = []) {
  const { reportMarkdown, historySource } = require('./chat/sheikhaContextReport');
  return reportMarkdown(historySource(history));
}

function isCommercialReadinessRequest(message) {
  return /(?:ما\s+يحتاجه|متطلبات|جاهزي(?:ة|ه)|تشغيل).{0,60}(?:الموقع|شيخة).{0,60}(?:تجار|بيع|إنتاج)|(?:تجار|بيع).{0,60}(?:جاهزي(?:ة|ه)|تشغيل)/iu
    .test(String(message || '').trim());
}

function buildCommercialReadinessAnswer(siteStatus = {}) {
  const online = siteStatus?.success === true &&
    (siteStatus?.data?.status === 'ok' || siteStatus?.status === 'ok');
  return [
    '# جاهزية موقع شيخة للتشغيل التجاري',
    '',
    `- الخدمة المحلية الآن: ${online ? 'تعمل وحالتها سليمة' : 'غير متحقق منها الآن'}.`,
    '- آخر دليل تجاري محفوظ بتاريخ 2026-08-28: 42/42 اختبارًا مستهدفًا ناجحًا.',
    '- اختبار الاستمرارية القصير: 24/24 طلبًا ناجحًا، وP95 = 86.424ms.',
    '- اختبار الاستعادة المحلية: ناجح خلال 2599ms.',
    '- TLS، تحديد المعدل، رفض الجسم الكبير، ومنع تجاوز Forwarded-For: متحققة ضمن المسار الموثق.',
    '',
    '## ما يلزم قبل بيع واسع أو التزام تعاقدي',
    '1. تحقق مستقل من دورة الطلب والدفع والفاتورة والاسترجاع والإلغاء كاملة.',
    '2. سياسات خصوصية وشروط بيع وضريبة وحماية مستهلك مع مراجعة قانونية مختصة.',
    '3. مراقبة وتنبيه ونسخ احتياطي واختبار استعادة دوري بأدلة حديثة.',
    '4. اختبار تحميل وSoak أطول وفق حجم العملاء المتوقع.',
    '5. تعريف SLA وRPO وRTO، ثم اختبار تعدد العقد والفشل الانتقالي إن كان مطلوبًا.',
    '6. دعم عملاء، إدارة حوادث، وسجل تدقيق للعمليات المالية والتجارية.',
    '',
    'الحكم: المسار التجاري المحكوم للشات متحقق، لكن الجاهزية التجارية الكاملة للموقع لا تُعلن حتى تمر دورة التجارة والامتثال والتعافي بالاختبارات المستقلة المذكورة.',
    'لم يُنفذ نشر أو دفع أو تعديل عالي الأثر.'
  ].join('\n');
}

function isChatLlmReadinessRequest(message) {
  return /(?:الشات|شات).{0,80}(?:LLM|النموذج|اللغة).{0,80}(?:تكامل|تدريب|إنتاج|تجار)|(?:LLM|نموذج\s+(?:لغوي\s+)?ضخم).{0,100}(?:زمن|وقت|تدريب|تكامل|إنتاج|تجار)/iu
    .test(String(message || '').trim());
}

function buildChatLlmReadinessAnswer(response = {}) {
  const plan = response?.data || response || {};
  const blockers = Array.isArray(plan.blockers) ? plan.blockers : [];
  const calendar = plan.estimatedCalendar || {};
  return [
    '## جاهزية تكامل شات شيخة وLLM',
    '',
    `- الحالة: ${plan.status || 'EVIDENCE_UNAVAILABLE'}.`,
    `- التقدم المثبت: ${Number.isFinite(plan.progressPercent) ? `${plan.progressPercent}%` : 'غير مقاس'}.`,
    `- نمط التدريب: ${plan.trainingMode || 'غير محدد'}.`,
    `- فئة النموذج المعلنة: ${plan.modelClassClaim || 'غير مثبتة'}.`,
    `- إثبات أنه نموذج كبير: ${plan.modelIsLargeVerified === true ? 'نعم' : 'لا'}.`,
    `- الزمن التقديري المشروط: ${calendar.minimumWeeks ?? '?'}–${calendar.maximumWeeks ?? '?'} أسبوعًا.`,
    '',
    '### الموانع الحالية',
    ...(blockers.length ? blockers.map((item) => `- ${item}`) : ['- لا موانع في عقد التخطيط؛ يلزم Canary قبل الترويج.']),
    '',
    '### حدود النتيجة',
    '- توجيه عدة نماذج لا ينشئ أوزان نموذج ضخم جديدًا.',
    '- التكييف أو LoRA ليس تدريبًا من الصفر.',
    '- لا يُعتمد الإنتاج التجاري تلقائيًا؛ يلزم تقييم عربي وأمان وتحميل وتعافٍ وموافقة بشرية.',
    '',
    `الحالة النهائية: ${blockers.length ? 'COMMERCIAL_INTEGRATION_BLOCKED' : 'READY_FOR_CONTROLLED_COMMERCIAL_CANARY'}.`
  ].join('\n');
}

function safeJsonParse(rawInput, metadata = {}) {
  const raw = String(rawInput || '').trim();
  const statusCode = Number(metadata.statusCode || 0);
  const contentType = String(metadata.contentType || '').toLowerCase();

  if (!raw) {
    return {
      success: false,
      error: 'empty_response',
      answer: 'تعذر الاتصال بشات شيخة: الرد فارغ من الخادم.',
      rawPreview: '',
      statusCode,
      contentType
    };
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {}

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');

  if (start >= 0 && end > start) {
    try {
      const parsed = JSON.parse(raw.slice(start, end + 1));
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {}
  }

  const proxyResponse = contentType.includes('text/html') || /^\s*<(?:!doctype|html|head|body)/i.test(raw);

  return {
    success: false,
    error: proxyResponse ? 'ide_apex_non_json_fallback' : 'invalid_json',
    answer: proxyResponse
      ? 'استلم شات شيخة رد بوابة غير صالح، وسيتم الانتقال تلقائيًا إلى المسار الاحتياطي.'
      : 'استلم شات شيخة ردًا غير صالح، وسيتم الانتقال تلقائيًا إلى المسار الاحتياطي.',
    rawPreview: raw.replace(/\s+/g, ' ').slice(0, 240),
    statusCode,
    contentType
  };
}

function postJson(path, payload, baseUrl = DEFAULT_BASE_URL) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const timeoutMs = Number(payload?.__timeoutMs || 60000);
    const wirePayload = { ...(payload || {}) };
    delete wirePayload.__timeoutMs;
    const body = JSON.stringify(wirePayload);
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.request({
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': `Sheikha-VSCode-Extension/${EXTENSION_TRANSPORT_VERSION}`
      },
      timeout: timeoutMs
    }, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const parsed = safeJsonParse(data, {
          statusCode: res.statusCode,
          contentType: res.headers['content-type']
        });
        parsed.statusCode = res.statusCode;
        parsed.contentType = String(res.headers['content-type'] || '');
        resolve(parsed);
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Sheikha extension chat timeout after ${timeoutMs}ms`));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function parseSseEvent(frame = '') {
  const lines = String(frame || '').replace(/\r\n/g, '\n').split('\n');
  let event = 'message';
  const dataLines = [];

  lines.forEach((line) => {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim() || 'message';
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  });

  if (!dataLines.length && !event) return null;

  const dataRaw = dataLines.join('\n');
  let data = dataRaw;
  try {
    data = dataRaw ? JSON.parse(dataRaw) : {};
  } catch {}

  return { event, data, dataRaw };
}

function parseSseBuffer(buffer = '') {
  const normalized = String(buffer || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const delimiter = '\n\n';
  const completeEnd = normalized.lastIndexOf(delimiter);

  if (completeEnd === -1) {
    return { events: [], rest: normalized };
  }

  const complete = normalized.slice(0, completeEnd);
  const rest = normalized.slice(completeEnd + delimiter.length);
  const frames = complete.split(delimiter).filter(Boolean);

  const events = frames
    .map(parseSseEvent)
    .filter(Boolean);

  return { events, rest };
}

function isProvisionalLiveResponse(streamed = {}) {
  const events = Array.isArray(streamed.events) ? streamed.events : [];
  const done = events.find((item) => item.event === 'done');
  const meta = events.find((item) => item.event === 'meta');
  const route = String(done?.data?.route || streamed.route || '').toUpperCase();
  const deepMode = String(meta?.data?.deepModelMode || '').toLowerCase();
  const answer = String(streamed.answer || '').trim();

  return route === 'FAST_ARABIC_DEFAULT' ||
    deepMode === 'background' ||
    answer === 'تم، أعمل على ذلك الآن.';
}

function shouldCompleteLiveResponse(streamed = {}, options = {}) {
  const answer = String(
    streamed?.answer ||
    streamed?.text ||
    streamed?.tokens?.join?.('') ||
    ''
  ).trim();
  const events = Array.isArray(streamed?.events) ? streamed.events : [];
  const done = events.some((item) => item.event === 'done');
  const statusCode = Number(streamed?.statusCode || 0);
  const successfulHttp = statusCode >= 200 && statusCode < 300;

  if (
    isProvisionalLiveResponse(streamed) &&
    options.allowProvisional !== true
  ) {
    return false;
  }

  return streamed?.success !== false && Boolean(answer) &&
    (done || successfulHttp);
}

function stripLeadingGreetingBlock(input = '') {
  let text = String(input || '');
  let previous = '';

  while (text && text !== previous) {
    previous = text;
    text = text.replace(/^\s*(?:بسم الله الرحمن الرحيم)[\s.،:;-]*/i, '');
    text = text.replace(/^\s*(?:أنا\s+شيخة\.?)[\s.،:;-]*/i, '');
    text = text.replace(
      /^\s*(?:ما الذي تحتاج إليه من مساعدة أو عون\??)[\s.،:;-]*/i,
      ''
    );
  }

  return text.trimStart();
}

function createStreamingGreetingFilter(greetingAllowed = true) {
  let buffer = '';
  let released = Boolean(greetingAllowed);

  return {
    push(chunk = '') {
      const text = String(chunk || '');
      if (!text) return '';
      if (released) return text;

      buffer += text;
      const stripped = stripLeadingGreetingBlock(buffer);
      const ready = stripped.length > 32 ||
        buffer.length > 220 ||
        /[#>*`]|(?:تقرير|تحليل|خطة|خطوات|أصلح|اصلح|نتيجة)/i.test(stripped);

      if (!ready) return '';

      released = true;
      return stripped;
    },
    flush() {
      if (released || !buffer) return '';
      released = true;
      return stripLeadingGreetingBlock(buffer);
    }
  };
}

function postSse(path, payload, baseUrl = DEFAULT_BASE_URL, handlers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const body = JSON.stringify(payload || {});
    const lib = url.protocol === 'https:' ? https : http;
    const events = [];
    const tokens = [];
    let rest = '';
    let ended = false;
    let statusCode = 0;
    let contentType = '';
    let receivedBytes = 0;
    let firstTokenTimer = null;
    const timeoutMs = Number(handlers.timeout || 90000);
    const firstTokenTimeoutMs = Number(
      handlers.firstTokenTimeout || DEFAULT_LIVE_FIRST_TOKEN_TIMEOUT_MS
    );
    const maxResponseBytes = Number(handlers.maxResponseBytes || 8 * 1024 * 1024);

    const greetingFilter = createStreamingGreetingFilter(handlers.greetingAllowed !== false);

    function clearFirstTokenTimer() {
      if (firstTokenTimer) clearTimeout(firstTokenTimer);
      firstTokenTimer = null;
    }

    function finish(result) {
      if (ended) return;
      ended = true;
      clearFirstTokenTimer();
      resolve(result);
    }

    function fail(error) {
      if (ended) return;
      ended = true;
      clearFirstTokenTimer();
      reject(error);
    }

    function processEvent(item) {
      if (!item || ended) return;
      events.push(item);
      if (typeof handlers.onEvent === 'function') handlers.onEvent(item);

      if (['progress', 'model_wait'].includes(item.event)) {
        clearFirstTokenTimer();
      }

      if (item.event === 'token') {
        clearFirstTokenTimer();
        const rawText = String(item.data?.text || '');
        const filteredText = greetingFilter.push(rawText);
        if (!filteredText) return;
        tokens.push(filteredText);
        if (typeof handlers.onToken === 'function') {
          handlers.onToken({
            ...item,
            data: { ...(item.data || {}), text: filteredText },
            text: filteredText
          });
        }
      }

      if (item.event === 'error') {
        const error = new Error(item.data?.error || 'Sheikha SSE stream error');
        error.payload = item.data;
        fail(error);
      }
    }

    const req = lib.request({
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        Accept: 'text/event-stream, application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': `Sheikha-VSCode-Extension/${EXTENSION_TRANSPORT_VERSION}`
      },
      timeout: timeoutMs
    }, (res) => {
      statusCode = Number(res.statusCode || 0);
      contentType = String(res.headers['content-type'] || '');

      res.on('data', (chunk) => {
        receivedBytes += chunk.length;
        if (receivedBytes > maxResponseBytes) {
          res.destroy(new Error('Sheikha SSE response exceeded the governed size limit'));
          return;
        }
        const parsed = parseSseBuffer(rest + chunk.toString('utf8'));
        rest = parsed.rest;
        parsed.events.forEach(processEvent);
      });

      res.on('end', () => {
        if (ended) return;
        const parsed = parseSseBuffer(rest.endsWith('\n\n') ? rest : `${rest}\n\n`);
        parsed.events.forEach(processEvent);
        if (ended) return;
        const flushed = greetingFilter.flush();
        if (flushed) {
          tokens.push(flushed);
          if (typeof handlers.onToken === 'function') {
            handlers.onToken({ event: 'token', data: { text: flushed }, text: flushed });
          }
        }

        const done = events.find((item) => item.event === 'done');
        finish({
          success: done ? done.data?.success !== false : tokens.length > 0,
          answer: tokens.join(''),
          endpoint: path,
          statusCode,
          contentType,
          streaming: true,
          events
        });
      });
      res.on('aborted', () => fail(new Error('Sheikha SSE response aborted')));
      res.on('error', fail);
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Sheikha extension streaming timeout after ${timeoutMs}ms`));
    });

    req.on('error', fail);
    if (firstTokenTimeoutMs > 0) {
      firstTokenTimer = setTimeout(() => {
        const error = new Error(
          `Sheikha extension first token timeout after ${firstTokenTimeoutMs}ms`
        );
        error.code = 'SHEIKHA_FIRST_TOKEN_TIMEOUT';
        req.destroy(error);
      }, firstTokenTimeoutMs);
    }
    req.write(body);
    req.end();
  });
}

function getJson(path, baseUrl = DEFAULT_BASE_URL, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request({
      method: 'GET',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        Accept: 'application/json',
        'User-Agent': `Sheikha-VSCode-Extension/${EXTENSION_TRANSPORT_VERSION}`
      },
      timeout
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = safeJsonParse(data, {
          statusCode: res.statusCode,
          contentType: res.headers['content-type']
        });
        parsed.statusCode = res.statusCode;
        parsed.contentType = String(res.headers['content-type'] || '');
        resolve(parsed);
      });
    });

    req.on('timeout', () => req.destroy(new Error(`Sheikha request timeout after ${timeout}ms`)));
    req.on('error', reject);
    req.end();
  });
}

async function getEnterpriseInspectorStatus(options = {}) {
  try {
    const data = await getJson(
      INSPECTOR_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );

    if (data?.success === true) return data;
    return {
      success: false,
      status: 'DEGRADED',
      error: data?.error || `HTTP_${data?.statusCode || 'UNKNOWN'}`
    };
  } catch (error) {
    return {
      success: false,
      status: 'OFFLINE',
      error: error.message
    };
  }
}

async function getOrganizationControlStatus(options = {}) {
  try {
    return await getJson(
      ORGANIZATION_CONTROL_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );
  } catch (error) {
    return { success: false, status: 'OFFLINE', error: error.message };
  }
}

async function getExtensionExperienceStatus(options = {}) {
  try {
    return await getJson(
      EXTENSION_EXPERIENCE_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );
  } catch (error) {
    return { success: false, status: 'OFFLINE', error: error.message };
  }
}

async function getVitalChatApexStatus(options = {}) {
  try {
    return await getJson(
      VITAL_CHAT_APEX_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );
  } catch (error) {
    return { success: false, status: 'OFFLINE', error: error.message };
  }
}

async function getDebuggingApexStatus(options = {}) {
  try {
    return await getJson(
      DEBUGGING_APEX_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );
  } catch (error) {
    return { success: false, status: 'OFFLINE', error: error.message };
  }
}

async function getChatInterfaceApexStatus(options = {}) {
  try {
    return await getJson(
      CHAT_INTERFACE_APEX_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );
  } catch (error) {
    return { success: false, status: 'OFFLINE', error: error.message };
  }
}

async function getIdeApexStatus(options = {}) {
  try {
    return await getJson(
      IDE_APEX_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );
  } catch (error) {
    return { success: false, status: 'OFFLINE', error: error.message };
  }
}

async function getTechnicalCapabilityApexStatus(options = {}) {
  try {
    return await getJson(
      TECHNICAL_CAPABILITY_APEX_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );
  } catch (error) {
    return { success: false, status: 'OFFLINE', error: error.message };
  }
}

async function getComputingCognitiveApexStatus(options = {}) {
  try {
    return await getJson(
      COMPUTING_COGNITIVE_APEX_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );
  } catch (error) {
    return { success: false, status: 'OFFLINE', error: error.message };
  }
}

async function getStreamingChatApexStatus(options = {}) {
  try {
    return await getJson(
      STREAMING_CHAT_APEX_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );
  } catch (error) {
    return { success: false, status: 'OFFLINE', error: error.message };
  }
}

async function getExtensionStreamingArtifactApexStatus(options = {}) {
  try {
    return await getJson(
      EXTENSION_STREAMING_ARTIFACT_APEX_STATUS_ENDPOINT,
      options.baseUrl || DEFAULT_BASE_URL,
      options.timeout || 15000
    );
  } catch (error) {
    return { success: false, status: 'OFFLINE', error: error.message };
  }
}

function isInspectorRequest(message) {
  return /حلل\s+(?:الحالة|حالة)|افحص\s+(?:المنظومة|النظام|الحالة)|حالة\s+(?:المنظومة|شيخة|النظام)|enterprise\s+inspector|system\s+health|diagnostics|مفتش\s+المنظومة/i
    .test(String(message || ''));
}

function shouldUseUnifiedFallback(data) {
  const status = Number(data?.statusCode || 0);
  return !data ||
    status === 404 ||
    status >= 500 ||
    [
      'connection_error',
      'empty_response',
      'invalid_json',
      'ide_apex_non_json_fallback'
    ].includes(data.error);
}

function isLocalBaseUrl(baseUrl = '') {
  try {
    const hostname = new URL(baseUrl).hostname;
    return ['127.0.0.1', 'localhost', '::1'].includes(hostname);
  } catch {
    return false;
  }
}

function isGovernedShellCommandRequest(message = '') {
  const text = String(message || '');
  const commandSignals = text.match(
    /(?:^|\n)\s*(?:cd|find|chmod|bash|sh|sha256sum|curl|wget|npm|git)\b|\$\(|\[\[/gim
  ) || [];
  const terminalEvidence = /(?:^|\n)\s*F12_[A-Z0-9_]*EXIT_CODE=\d+/im.test(text);

  return commandSignals.length >= 2 ||
    (terminalEvidence && commandSignals.length >= 1) ||
    (/EXPECTED_[A-Z0-9_]*SHA256/.test(text) && /bash\s+["']?\$/i.test(text));
}

function isGovernedShellFollowUpRequest(message = '') {
  return /(?:شغ[ّ]?ل|شغل|نف[ّ]?ذ|نفذ|ابدأ\s+التشغيل|تحقق\s+من\s+البصمات|افتح\s+المشغ[ّ]?ل|راجع\s+المشغ[ّ]?ل|run\s+(?:it|the\s+script))/i
    .test(String(message || ''));
}

function resolveRecentGovernedShellContext(message = '', history = []) {
  const text = String(message || '');
  if (isGovernedShellCommandRequest(text)) {
    return { reviewMessage: text, followUp: false };
  }
  if (!isGovernedShellFollowUpRequest(text) || !Array.isArray(history)) {
    return null;
  }

  for (const item of history.slice(-12).reverse()) {
    if (String(item?.role || '').toLowerCase() !== 'user') continue;
    const content = String(item?.content || '');
    if (!isGovernedShellCommandRequest(content)) continue;

    return {
      reviewMessage: [
        text,
        '',
        'سياق أمر الطرفية السابق للمراجعة فقط، دون تنفيذ:',
        content.slice(-16000)
      ].join('\n'),
      followUp: true
    };
  }

  return null;
}

function parseOperationalEvidenceMarkers(message = '') {
  const markers = {};
  for (const line of String(message || '').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]{2,})\s*=\s*(.*?)\s*$/);
    if (match) markers[match[1]] = match[2];
  }
  return markers;
}

function isStructuredOperationalEvidenceReviewRequest(message = '') {
  const keys = Object.keys(parseOperationalEvidenceMarkers(message));
  return keys.length >= 4 && keys.some((key) =>
    key === 'SELECTION_REVIEW_COMPLETE' ||
    key === 'SELECTION_REVIEW_TERMINAL' ||
    /_EXIT_CODE$|_COMPLETED_SUCCESSFULLY$/.test(key)
  );
}

function buildGovernedOperationalEvidenceFallbackAnswer(message = '', reason = '') {
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
  const exitSucceeded = !exitKey || markers[exitKey] === '0';
  const reasonLine = reason ? `\n\nسبب التحويل الاحتياطي: ${reason}` : '';

  return [
    'قراءة محكومة للأدلة النصية المرسلة فقط:',
    '',
    `- المرحلة: ${phase}.`,
    `- النتيجة المعلنة: ${completed && exitSucceeded ? 'مكتملة بنجاح' : 'غير مكتملة أو تحتاج تحققًا إضافيًا'}.`,
    `- السجل الطرفي: ${markers.SELECTION_REVIEW_TERMINAL === 'true' ? 'نهائي' : 'غير مثبت كنهائي في النص'}.`,
    `- قائمة البصمات: ${markers.SELECTION_REVIEW_DIGEST_LIST_VALID === 'true' ? 'معلنة صحيحة' : 'غير مثبتة في النص'}.`,
    markers.SELECTION_REVIEW_RERUN_ALLOWED === 'false'
      ? '- إعادة تشغيل المرحلة ممنوعة وفق السجل المرسل.'
      : '- لا يظهر منع صريح لإعادة التشغيل في النص.',
    '- لم أنفذ تشغيلًا أو نشرًا أو تعديلًا من داخل الشات.',
    '- الاعتماد الملفي النهائي يتطلب مطابقة مجلد الأدلة وقائمة SHA-256؛ النص وحده لا يثبت الملفات على القرص.',
    reasonLine
  ].filter(Boolean).join('\n');
}

function isContextualReportFollowUpRequest(message = '') {
  return /^\s*(?:اكتب(?:ي)?|أنشئ(?:ي)?|أعد|اعد|جهز(?:ي)?|حو[ّ]?ل(?:ي)?)\s+(?:لي\s+)?(?:هذا\s+)?(?:ال)?(?:تقرير|تثرير)(?:\s|$)/i
    .test(String(message || ''));
}

function resolveRecentContextualReportContext(message = '', history = []) {
  if (
    !isContextualReportFollowUpRequest(message) ||
    !Array.isArray(history)
  ) {
    return null;
  }

  const assistantMessages = history.slice(-12).reverse().filter((item) =>
    String(item?.role || '').toLowerCase() === 'assistant' &&
    String(item?.content || '').trim()
  );
  const structured = assistantMessages.find((item) =>
    /حالة المنظومة:|التشخيص:|المخاطر:|الحوكمة:|أفضل إجراء تالٍ/i
      .test(String(item.content || ''))
  );
  const selected = structured || assistantMessages[0];

  if (!selected) return null;

  return {
    request: String(message || '').trim(),
    context: String(selected.content || '').trim().slice(0, 8000),
    source: 'assistant-conversation-history'
  };
}

function isInspectorContinuationRequest(message = '') {
  return /^\s*(?:اكمل|أكمل|استمر|تابع)(?:\s+(?:التحليل|التشخيص|من\s+هنا))?\s*[.!؟?]*\s*$/iu
    .test(String(message || ''));
}

function resolveRecentInspectorContinuation(message = '', history = []) {
  if (!isInspectorContinuationRequest(message) || !Array.isArray(history)) {
    return null;
  }
  const selected = history.slice(-12).reverse().find((item) =>
    String(item?.role || '').toLowerCase() === 'assistant' &&
    /حالة المنظومة:|التشخيص:|المخاطر:|أفضل إجراء تالٍ/iu
      .test(String(item?.content || ''))
  );
  if (!selected) return null;
  return {
    request: String(message || '').trim(),
    context: String(selected.content || '').trim().slice(0, 8000),
    source: 'assistant-inspector-history'
  };
}

function collectInspectorDiagnosticItems(snapshot = {}) {
  const groups = Array.isArray(snapshot?.extension?.diagnostics)
    ? snapshot.extension.diagnostics
    : [];
  const seen = new Set();
  const items = [];

  groups.forEach((group) => {
    const file = String(group?.file || 'ملف غير محدد').trim();
    const diagnostics = Array.isArray(group?.diagnostics)
      ? group.diagnostics
      : [];
    diagnostics.forEach((diagnostic) => {
      const severity = Number(diagnostic?.severity);
      const message = String(diagnostic?.message || 'رسالة غير متاحة')
        .replace(/\s+/gu, ' ')
        .trim()
        .slice(0, 300);
      const line = Math.max(0, Number(diagnostic?.line || 0));
      const character = Math.max(0, Number(diagnostic?.character || 0));
      const key = [severity, file, line, character, message].join('|');
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ severity, file, line, character, message });
    });
  });

  return items.sort((left, right) => {
    const leftPriority = getInspectorDiagnosticPriority(left);
    const rightPriority = getInspectorDiagnosticPriority(right);
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return left.file.localeCompare(right.file, 'ar');
  });
}

function getInspectorDiagnosticPriority(item = {}) {
  if (Number(item.severity) === 0) return 0;
  const message = String(item.message || '').toLowerCase();
  if (/unconditionally|not be executed conditionally|unreachable|always execute/u.test(message)) {
    return 10;
  }
  if (/\bpath\b.*(?:fixed|unwriteable)|security|secret|credential|injection/u.test(message)) {
    return 20;
  }
  if (/exception|catch it|error handling/u.test(message)) return 30;
  if (/cognitive complexity/u.test(message)) return 40;
  return 50;
}

function getInspectorDiagnosticCategory(item = {}) {
  const priority = getInspectorDiagnosticPriority(item);
  if (priority === 0) return 'خلل';
  if (priority === 10) return 'صحة منطق';
  if (priority === 20) return 'أمن';
  if (priority === 30) return 'معالجة أخطاء';
  if (priority === 40) return 'قابلية صيانة';
  return 'جودة كود';
}

function formatInspectorDiagnosticItem(item = {}) {
  const severity = Number(item.severity) === 0
    ? 'خطأ'
    : Number(item.severity) === 1
      ? 'تحذير'
      : 'معلومة';
  const location = item.line > 0
    ? `${item.file}:${item.line}${item.character > 0 ? `:${item.character}` : ''}`
    : item.file;
  return `- ${severity} / ${getInspectorDiagnosticCategory(item)} | ${location} | ${item.message}`;
}

function buildInspectorDiagnosticTriage(snapshot = {}, limit = 20) {
  const diagnostics = snapshot?.health?.diagnostics || {};
  const expectedErrors = Math.max(0, Number(diagnostics.errors || 0));
  const expectedWarnings = Math.max(0, Number(diagnostics.warnings || 0));
  const items = collectInspectorDiagnosticItems(snapshot)
    .filter((item) => item.severity === 0 || item.severity === 1);
  const displayed = items.slice(0, Math.max(1, Number(limit || 8)));
  const expectedTotal = expectedErrors + expectedWarnings;

  if (expectedTotal === 0) {
    return ['- لا توجد أخطاء أو تحذيرات في اللقطة الحديثة.'];
  }
  if (items.length === 0) {
    return [
      `- سجّل Inspector ${formatArabicDiagnosticCount(expectedErrors, 'error')} و${formatArabicDiagnosticCount(expectedWarnings, 'warning')}، لكن تفاصيل الملفات والأسطر غير موجودة في اللقطة.`,
      '- يلزم تحديث heartbeat الإضافة الذي يحمل diagnostics قبل نسبة التحذيرات إلى ملفات أو اقتراح رقعة.'
    ];
  }

  const lines = displayed.map(formatInspectorDiagnosticItem);
  if (items.length > displayed.length) {
    lines.push(`- عُرضت ${displayed.length} من ${items.length} نتيجة مفصلة؛ الباقي محفوظ في Inspector.`);
  }
  if (items.length < expectedTotal) {
    lines.push(`- تغطية التفاصيل ${items.length}/${expectedTotal}؛ عدّاد Inspector أكبر من الحمولة التفصيلية المتاحة.`);
  }
  return lines;
}

function summarizeInspectorGitStatus(status = '') {
  const lines = String(status || '').split('\n').filter(Boolean);
  const byState = {
    untracked: 0,
    conflicted: 0,
    staged: 0,
    unstaged: 0,
    stagedAndUnstaged: 0
  };
  const areaCounts = new Map();
  let unclassified = 0;

  lines.forEach((line) => {
    // Older servers trimmed the first index column. Its state is then unknown.
    if (!/^[ MADRCUT?!]{2} .+/u.test(line)) {
      unclassified += 1;
      return;
    }
    const code = line.slice(0, 2);
    const rawPath = line.slice(3);
    const selectedPath = rawPath.includes(' -> ')
      ? rawPath.split(' -> ').at(-1)
      : rawPath;
    const normalizedPath = selectedPath.replace(/^"|"$/gu, '');
    const area = normalizedPath.includes('/')
      ? normalizedPath.split('/')[0]
      : '(root)';
    let state = 'unstaged';
    if (code === '??') state = 'untracked';
    else if (code.includes('U') || code === 'AA' || code === 'DD') {
      state = 'conflicted';
    } else if (code[0] !== ' ' && code[1] !== ' ') {
      state = 'stagedAndUnstaged';
    } else if (code[0] !== ' ') state = 'staged';
    byState[state] += 1;
    areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
  });

  return {
    total: lines.length,
    unclassified,
    byState,
    topAreas: [...areaCounts.entries()]
      .map(([area, count]) => ({area, count}))
      .sort((left, right) =>
        right.count - left.count || left.area.localeCompare(right.area)
      )
      .slice(0, 12)
  };
}

function resolveInspectorGitSummary(snapshot = {}) {
  const provided = snapshot?.git?.changeSummary;
  if (provided?.byState && Array.isArray(provided.topAreas)) return provided;
  if (typeof snapshot?.git?.status !== 'string') {
    return {total: snapshot?.git?.changedFileCount};
  }
  return summarizeInspectorGitStatus(snapshot?.git?.status);
}

function buildInspectorGitTriage(snapshot = {}, limit = 8) {
  const summary = resolveInspectorGitSummary(snapshot);
  const byState = summary.byState || {};
  const topAreas = Array.isArray(summary.topAreas)
    ? summary.topAreas.slice(0, Math.max(1, Number(limit || 8)))
    : [];
  const total = Math.max(
    0,
    Number(summary.total || snapshot?.git?.changedFileCount || 0)
  );

  if (snapshot?.git?.stale || snapshot?.git?.refreshStatus === 'DEGRADED') {
    return ['- لقطة Git قديمة أو تعذّر جمعها؛ يلزم تحديثها قبل اعتماد العدّادات.'];
  }
  if (total === 0 && typeof snapshot?.git?.status !== 'string' && !summary.byState) {
    return ['- تفاصيل Git غير متاحة؛ نظافة مساحة العمل غير مثبتة.'];
  }
  if (total === 0) return ['- لا توجد تغييرات Git في اللقطة الحديثة.'];
  if (!summary.byState || topAreas.length === 0) {
    return [
      `- العدد الكلي: ${formatArabicChangeCount(total)}.`,
      '- تفاصيل الحالات والنطاقات غير متاحة في هذه اللقطة؛ لم يُجر أي تقسيم تخميني.'
    ];
  }

  return [
    `- الحالات: غير متتبعة ${Number(byState.untracked || 0)}، معدلة غير مرحّلة ${Number(byState.unstaged || 0)}، مرحّلة ${Number(byState.staged || 0)}، مرحّلة ومعدلة ${Number(byState.stagedAndUnstaged || 0)}، تعارضات ${Number(byState.conflicted || 0)}.`,
    ...(summary.unclassified > 0
      ? [`- حالات غير محسومة: ${summary.unclassified}؛ بيانات Git الواردة ناقصة التنسيق وتحتاج تحديث الخادم.`]
      : []),
    `- أكبر النطاقات: ${topAreas.map(({area, count}) => `${area}=${count}`).join('، ')}.`
  ];
}

function buildInspectorNextAction({
  firstDiagnostic,
  errors,
  warnings,
  changedFiles,
  topChangeArea
}) {
  if (firstDiagnostic) {
    const location = firstDiagnostic.line > 0
      ? `${firstDiagnostic.file}:${firstDiagnostic.line}`
      : firstDiagnostic.file;
    return `ابدأ بمراجعة ${location} ومعالجة السبب المثبت، ثم شغّل فحصًا مستهدفًا لهذا النطاق فقط.`;
  }
  if (errors + warnings > 0) {
    return 'حدّث heartbeat الإضافة للحصول على تفاصيل diagnostics؛ لا تبدأ تعديلًا تخمينيًا من العدّاد وحده.';
  }
  if (changedFiles > 0 && topChangeArea) {
    return `لا توجد diagnostics حالية؛ ابدأ بمراجعة نطاق ${topChangeArea.area} الذي يضم ${topChangeArea.count} تغييرًا، واربطه باختباراته دون staging أو commit تلقائي.`;
  }
  if (changedFiles > 0) {
    return 'لا توجد diagnostics حالية؛ قسّم تغييرات مساحة العمل إلى نطاقات قابلة للمراجعة قبل بوابات الجودة.';
  }
  return 'ثبّت الحالة النظيفة بفحوص النطاق المستهدف وlint وفحص الأسرار.';
}

function buildInspectorContinuationAnswer(context = '', snapshot = null, refreshError = '') {
  const lines = String(context || '')
    .replace(/^\s*الحالة الموثقة الآن:\s*/iu, '')
    .trim().split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const find = (...prefixes) => lines.find((line) =>
    prefixes.some((prefix) => line.startsWith(prefix))
  );
  const refreshed = snapshot?.success === true;

  if (!refreshed) {
    return [
      '## متابعة تشخيص منظومة شيخة',
      '',
      '### صلاحية الدليل',
      'تعذر تحديث Enterprise Inspector الآن؛ القيم التالية من آخر رد في المحادثة وليست قياسات حالية.',
      refreshError ? `سبب تعذر التحديث: ${String(refreshError).slice(0, 300)}.` : '',
      '',
      find('حالة المنظومة:') || 'حالة المنظومة غير متاحة في السياق السابق.',
      find('التشخيص:') || 'لا توجد أرقام تشخيصية موثقة في السياق السابق.',
      find('المخاطر:') || 'لم تُذكر مخاطر محددة في السياق السابق.',
      '',
      '### ما لم يكتمل',
      '- لا يحمل الرد السابق أسماء ملفات التحذيرات أو أسطرها، لذلك لم أدّعِ فرزها أو إصلاحها.',
      '- المتطلب المحدد: استعادة اتصال Runtime، ثم تحديث heartbeat الإضافة وقراءة diagnostics التفصيلية.',
      '',
      'لم يُنفذ أي تعديل أو نشر أو إجراء عالي الأثر.'
    ].filter(Boolean).join('\n');
  }

  const diagnostics = snapshot?.health?.diagnostics || {};
  const errors = Math.max(0, Number(diagnostics.errors || 0));
  const warnings = Math.max(0, Number(diagnostics.warnings || 0));
  const changedFiles = Math.max(0, Number(snapshot?.git?.changedFileCount || 0));
  const gitStale = snapshot?.git?.stale === true;
  const singleNode = String(snapshot?.health?.runtimeFabricV5 || '')
    .includes('SINGLE_NODE');
  const generatedAt = snapshot.generatedAt || 'غير متاح';
  const topChangeArea = resolveInspectorGitSummary(snapshot).topAreas?.[0];
  const firstDiagnostic = collectInspectorDiagnosticItems(snapshot)
    .find((item) => item.severity === 0 || item.severity === 1);
  const nextAction = buildInspectorNextAction({
    firstDiagnostic,
    errors,
    warnings,
    changedFiles,
    topChangeArea
  });

  return [
    '## متابعة تشخيص منظومة شيخة',
    '',
    '### اللقطة الحديثة',
    `- وقت التوليد: ${generatedAt}.`,
    `- الحالة: ${snapshot?.health?.overall || snapshot?.status || 'غير محددة'}.`,
    `- التشخيص: ${formatArabicDiagnosticCount(errors, 'error')}، ${formatArabicDiagnosticCount(warnings, 'warning')}.`,
    `- مساحة العمل: ${formatArabicChangeCount(changedFiles)}${snapshot?.git?.clean === false ? ' وغير نظيفة' : ''}${gitStale ? '؛ عدّاد Git قيد التحديث' : ''}.`,
    `- نمط التشغيل: ${singleNode ? 'أحادي العقدة؛ خطر استمرارية عند الإطلاق الموزع' : 'لا يظهر قيد أحادي العقدة في اللقطة'}.`,
    '',
    '### الفرز الفعلي',
    ...buildInspectorDiagnosticTriage(snapshot),
    ...(changedFiles > 0
      ? ['', '### خريطة تغييرات Git', ...buildInspectorGitTriage(snapshot)]
      : []),
    '',
    '### الإجراء التالي المحدد',
    nextAction,
    '',
    'لم يُنفذ أي تعديل أو نشر أو إجراء عالي الأثر من هذا الرد.'
  ].join('\n');
}

function isContextualRepairFollowUpRequest(message = '') {
  return /^\s*(?:أصلح(?:ها|ه|هم)?|اصلح(?:ها|ه|هم)?|عالج(?:ها|ه|هم)?|نف[ّ]?ذ\s+الإصلاح|fix\s+(?:it|them))\s*[.!؟?]*\s*$/iu
    .test(String(message || ''));
}

function resolveRecentContextualRepairContext(message = '', history = []) {
  if (
    !isContextualRepairFollowUpRequest(message) ||
    !Array.isArray(history)
  ) return null;

  const selected = history.slice(-12).reverse().find((item) =>
    String(item?.role || '').toLowerCase() === 'assistant' &&
    /حالة المنظومة:|التشخيص:|المخاطر:|أفضل إجراء تالٍ/iu
      .test(String(item?.content || ''))
  );
  if (!selected) return null;

  const context = String(selected.content || '').trim().slice(0, 8000);
  return {
    request: String(message || '').trim(),
    context,
    repairMessage: [
      'نفذ إصلاحًا هندسيًا محكومًا إلى نهاية مثبتة بالدليل اعتمادًا على التشخيص السابق.',
      'لا تطلب من المستخدم معلومات موجودة في السياق، ولا تنفذ إجراء عالي الأثر دون موافقة.',
      'اتبع: DISCOVER ثم PLAN ثم IMPLEMENT_SCOPED_PATCH ثم VERIFY ثم REPORT_TERMINAL_STATE.',
      '',
      'التشخيص السابق:',
      context
    ].join('\n'),
    source: 'assistant-diagnostic-history'
  };
}

function buildContextualRepairFallbackAnswer(context = '', reason = '') {
  const diagnosis = String(context || '').trim().slice(0, 8000);
  const errorMatch = diagnosis.match(/(\d+)\s+أخطاء|خطأ\s+واحد|خطآن/iu);
  const warningMatch = diagnosis.match(/(\d+)\s+تحذير/iu);
  const dirtyMatch = diagnosis.match(/(?:بها|تضم)\s+(\d+)\s+تغيير/iu);
  const errorCount = errorMatch?.[1]
    ? Number(errorMatch[1])
    : /خطأ\s+واحد/iu.test(diagnosis)
      ? 1
      : /خطآن/iu.test(diagnosis) ? 2 : 0;
  return [
    'تعذر إكمال مسار التنفيذ العميق، لكن سياق الإصلاح السابق محفوظ ولم يُفقد.',
    '',
    `- الأخطاء المرصودة: ${errorCount}.`,
    `- التحذيرات المرصودة: ${warningMatch?.[1] || 'غير محددة'}.`,
    `- تغييرات مساحة العمل: ${dirtyMatch?.[1] || 'غير محددة'}.`,
    '- حالة التنفيذ: BLOCKED_WITH_EXACT_REQUIREMENT.',
    '- المتطلب الدقيق: تحديث لقطة Enterprise Inspector وتحديد مصدر الخطأ الحالي قبل أي تعديل؛ لا يعتمد هذا التحقق على النموذج.',
    '- لم يُنفذ تعديل أو نشر أو إجراء عالي الأثر.',
    reason ? `- سبب التعطل: ${reason}.` : ''
  ].filter(Boolean).join('\n');
}

function buildContextualRepairResolutionAnswer(previousContext = '', snapshot = {}) {
  const previous = String(previousContext || '');
  const priorErrorMatch = previous.match(/(\d+)\s+أخطاء|خطأ\s+واحد|خطآن/iu);
  const priorErrors = priorErrorMatch?.[1]
    ? Number(priorErrorMatch[1])
    : /خطأ\s+واحد/iu.test(previous)
      ? 1
      : /خطآن/iu.test(previous) ? 2 : 0;
  const currentErrors = Number(snapshot?.health?.diagnostics?.errors || 0);
  const currentWarnings = Number(snapshot?.health?.diagnostics?.warnings || 0);
  const changedFiles = Number(snapshot?.git?.changedFileCount || 0);
  const stale = snapshot?.git?.stale === true;
  const errorResolved = priorErrors > 0 && currentErrors === 0;
  return [
    '## نتيجة الإصلاح المحكوم',
    '',
    `- الحالة الحالية: ${snapshot?.health?.overall || snapshot?.status || 'غير محددة'}.`,
    `- الأخطاء السابقة: ${priorErrors}.`,
    `- الأخطاء الحالية: ${currentErrors}.`,
    `- التحذيرات الحالية: ${currentWarnings}.`,
    `- تغييرات مساحة العمل: ${changedFiles}.`,
    `- الخطأ السابق: ${errorResolved ? 'لم يعد ظاهرًا في اللقطة الحالية' : 'ما زال يحتاج تحديد المصدر'}.`,
    `- حداثة Git: ${stale ? 'REFRESHING؛ لا تعتمد نظافة الشجرة حتى يكتمل التحديث' : 'محدثة'}.`,
    '',
    '### الإجراء التالي',
    currentErrors > 0
      ? 'اقرأ تفاصيل الخطأ التشخيصي من Problems/Inspector وحدد الملف والسطر، ثم طبّق أصغر إصلاح واختبره.'
      : currentWarnings > 0
        ? 'لا يوجد خطأ حالي لإصلاحه؛ فرز التحذيرات حسب المصدر والأثر هو الخطوة التالية.'
        : 'لا تظهر أخطاء أو تحذيرات حاليًا؛ ثبّت الحالة بالاختبارات المستهدفة وlint وفحص الأسرار.',
    '',
    'لم يُنفذ تعديل أو نشر أو إجراء عالي الأثر. النتيجة مبنية على مقارنة لقطة Inspector السابقة بالحالية.'
  ].join('\n');
}

function parseExtensionActivationEvidence(message = '') {
  const text = String(message || '');
  const version = text.match(/(?:الإصدار المثبت|extensionVersion)\s*[:=]\s*`?([0-9]+(?:\.[0-9]+){2})/iu)?.[1] || null;
  const tests = text.match(/(?:الاختبارات)\s*[:=]\s*`?(\d+)\s*\/\s*(\d+)/iu);
  const sha256 = text.match(/(?:SHA-?256)\s*[:=]\s*`?([a-f0-9]{64})/iu)?.[1]?.toLowerCase() || null;
  const domVerified = /DOM_CLICK_VERIFIED/iu.test(text);
  const editorial = /تحرير بحث ووثائق وبرمجيات|تحرير موثق|مسار التحرير الموثق|وجود مسار التحرير/iu.test(text);
  const looksLikeEvidence = Boolean(version && tests && sha256 && domVerified);
  return {
    looksLikeEvidence,
    version,
    testsPassed: tests ? Number(tests[1]) : null,
    testsTotal: tests ? Number(tests[2]) : null,
    sha256,
    domVerified,
    editorial
  };
}

function buildExtensionActivationEvidenceAnswer(message = '', expectedVersion = '') {
  const evidence = parseExtensionActivationEvidence(message);
  if (!evidence.looksLikeEvidence) return null;
  const versionMatches = !expectedVersion || evidence.version === expectedVersion;
  const testsPass = evidence.testsPassed === evidence.testsTotal && evidence.testsTotal > 0;
  const accepted = versionMatches && testsPass && evidence.domVerified;
  return {
    accepted,
    evidence,
    answer: [
      '## مراجعة دليل تفعيل شات شيخة',
      '',
      `- الإصدار المعلن: ${evidence.version}${versionMatches ? '، مطابق للإضافة الحالية' : `، لا يطابق ${expectedVersion}`}.`,
      `- الاختبارات المعلنة: ${evidence.testsPassed}/${evidence.testsTotal}${testsPass ? '، ناجحة حسابيًا' : '، غير مكتملة'}.`,
      `- اختبار الواجهة: ${evidence.domVerified ? 'DOM_CLICK_VERIFIED' : 'غير مثبت'}.`,
      `- SHA-256: ${evidence.sha256}.`,
      `- مسار التحرير الموثق: ${evidence.editorial ? 'مذكور' : 'غير مذكور'}.`,
      '',
      `الحالة: ${accepted ? 'EVIDENCE_FORMAT_ACCEPTED' : 'EVIDENCE_REVIEW_BLOCKED'}.`,
      '',
      'الحدود: تحققت بنية الدليل واتساق أرقامه مع نسخة الإضافة، لكن النص وحده لا يعيد تشغيل الاختبارات ولا يعيد حساب بصمة ملف VSIX. التحقق المستقل يتطلب الوصول إلى الحزمة وتشغيل بواباتها المحلية.',
      'لم يُنفذ أي إجراء عالي الأثر.'
    ].join('\n')
  };
}

function isGenericEditorialProductionRequest(message = '') {
  const text = String(message || '');
  return /حرر نتيجة بحث أو وثيقة أو ديوان(?:ًا|ا)? برمجي(?:ًا|ا)?/iu.test(text) &&
    /سجل تغييرات|بصمة مصدر|provenance/iu.test(text);
}

function buildGovernedEditorialDocument(message = '', history = []) {
  if (!isGenericEditorialProductionRequest(message)) return null;
  const { reportMarkdown, historySource } = require('./chat/sheikhaContextReport');
  return reportMarkdown(historySource(history), true);
}

function buildGovernedContextualReportFallbackAnswer(
  context = '',
  reason = ''
) {
  const normalizedContext = String(context || '')
    .replace(/^\s*الحالة الموثقة الآن:\s*/i, '')
    .trim()
    .slice(0, 8000);

  if (!normalizedContext) {
    return 'لا توجد نتيجة سابقة موثقة كافية لبناء التقرير.';
  }

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
  const reasonLine = reason ? `- تعذر مسار الخادم: ${reason}` : null;

  return [
    '## تقرير حالة منظومة شيخة',
    '',
    '### الملخص التنفيذي',
    statusLine || lines.slice(0, 3).join(' '),
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
    '- لم تُقرأ ملفات جديدة ولم تُنفذ أوامر أو تغييرات في النظام.',
    reasonLine
  ].filter(Boolean).join('\n');
}

function shouldUseGovernedLiveTransport({
  intelligenceApexMode = false,
  governedShellReviewRequested = false,
  governedEvidenceReviewRequested = false,
  governedContextualReportRequested = false,
  diagnosticRequested = false,
  liveEnabled = true
} = {}) {
  return liveEnabled &&
    (
      !intelligenceApexMode ||
      governedShellReviewRequested ||
      governedEvidenceReviewRequested ||
      governedContextualReportRequested ||
      diagnosticRequested
    );
}

function buildGovernedShellReviewFallbackAnswer(message = '', reason = '') {
  const text = String(message || '');
  const reasonLine = reason ? `\n\nسبب التحويل الاحتياطي: ${reason}` : '';
  if (isGovernedReadOnlyEvidenceCaptureRequest(text)) {
    return [
      'صُنّف الطلب كالتقاط أدلة محلي للقراءة فقط.',
      '',
      'العمليات الظاهرة: التحقق من قائمة SHA-256، قراءة سجلات JSON، وقراءة HEAD وstatus وdiff وبصمات manifest.',
      'لا يظهر في النص مشغّل فرعي أو شبكة أو sudo أو تثبيت أو أمر Git تغييري.',
      'عند تشغيله من واجهة VS Code الكاملة يُحوّل إلى محوّل الأدلة المحكوم دون تمرير النص إلى Shell عام.',
      reasonLine
    ].filter(Boolean).join('\n');
  }
  if (isGovernedPreconditionDriftCaptureRequest(text)) {
    return [
      'صُنّف الطلب كالتقاط فرق شروط I1-R1 للقراءة فقط.',
      '',
      'في واجهة VS Code الكاملة يقرأ المحوّل سجل predecessor، ويتحقق من بصماته، ثم يقارن HEAD وTree وStatus والمسارات المتتبعة وغير المتتبعة دون تشغيل كتلة Python.',
      'لا يكتب أدلة ولا ينفذ npm أو تنظيفًا أو تفويض D6.',
      reasonLine
    ].filter(Boolean).join('\n');
  }
  if (isGovernedPublishedEvidenceVerificationRequest(text)) {
    return [
      'صُنّف الطلب كتحقق من دليل منشور للقراءة فقط.',
      '',
      'في واجهة VS Code الكاملة يتحقق المحوّل من جميع بصمات SHA-256، ويعد الملفات، ويقرأ سجل النتيجة والسجل النهائي مباشرة دون تشغيل Shell أو Python.',
      'لا يكتب ملفات ولا يعيد تشغيل المرحلة ولا يمنح تفويض D6.',
      reasonLine
    ].filter(Boolean).join('\n');
  }
  if (isGovernedReadOnlyScriptRequest(text)) {
    return [
      'صُنّف الطلب كسكربت تحقق قرائي محلي مربوط ببصمة SHA-256.',
      '',
      'في واجهة VS Code الكاملة يبحث المحوّل عن النسخة المطابقة، ويفحص صياغتها وغلافها، ثم يشغلها داخل Bubblewrap بجذر ومشروع للقراءة فقط، ومنزل محجوب، وشبكة مفصولة.',
      'إذا كان الملف غير موجود أو خالف البصمة أو السياسة، يعرض سببًا صريحًا ولا يشغّل شيئًا.',
      reasonLine
    ].filter(Boolean).join('\n');
  }
  if (isGovernedLauncherPreflightRequest(text)) {
    return [
      'صُنّف الطلب كتشغيل مشغّل محلي ذي بصمة مثبتة.',
      '',
      'في واجهة VS Code الكاملة يمر أولًا عبر فاحص المشغّلات المحكوم: مطابقة SHA-256، وفحص الحزمة والسكربت الداخلي، ومقارنة شروط HEAD وحالة Git.',
      'لا يُنفذ bash تلقائيًا، ويُحجب التشغيل عند انحراف أي شرط أو ظهور شبكة أو رفع صلاحيات أو أمر تغييري غير مصرح به.',
      reasonLine
    ].filter(Boolean).join('\n');
  }
  const f12D2EvidenceFileMismatch =
    /F12_D2_EXIT_CODE=1/i.test(text) &&
    /^-current-worktree-state\.json\s*$/m.test(text) &&
    /expected\.txt[\s\S]*actual\.txt/i.test(text);

  if (f12D2EvidenceFileMismatch) {
    return [
      'لم أنفذ أي أمر من النص المرسل.',
      '',
      'تشخيص F12_D2:',
      '- مراجعة المرشحين انتهت إلى عدم وجود شجرة تبعيات آمنة للاستخدام المباشر.',
      '- التشغيل فشل قبل النشر الذري لأن `current-worktree-state.json` كان متوقعًا ولم يُنشأ في أدلة المرحلة.',
      '- لا يُعد هذا التشغيل إكمالًا لـ F12_D2، ولا يجوز اعتماد سجله النهائي.',
      '- التصحيح التالي يجب أن يولد ملف الحالة، ويصدر سكربتًا ببصمة جديدة، ثم يعيد تحقق الأدلة فقط دون Jest أو تثبيت أو تعديل شجرة العمل.',
      reasonLine
    ].filter(Boolean).join('\n');
  }

  const capabilities = [
    /\bfind\b/i.test(text) ? 'البحث عن ملفات محلية' : null,
    /sha256sum|EXPECTED_[A-Z0-9_]*SHA256/i.test(text)
      ? 'مطابقة بصمات SHA-256'
      : null,
    /\bchmod\b/i.test(text) ? 'تغيير صلاحية ملف' : null,
    /\bbash\b|(?:^|\n)\s*sh\s+/im.test(text) ? 'تشغيل سكربت محلي' : null
  ].filter(Boolean).join('، ');

  return [
    'لم أنفذ هذه الأوامر.',
    '',
    `وظيفة النص الظاهرة: ${capabilities || 'إجراء عمليات طرفية محلية'}.`,
    'سأتعامل معه كمراجعة محكومة: مطابقة البصمات، فحص محتوى المشغّل ومسارات الكتابة والشبكة، ثم موافقة بشرية منفصلة قبل أي تشغيل.',
    reasonLine
  ].filter(Boolean).join('\n');
}

function formatArabicDiagnosticCount(count, type) {
  const value = Math.max(0, Number(count || 0));
  const forms = type === 'error'
    ? {
        zero: '0 أخطاء', one: 'خطأ واحد', two: 'خطآن',
        plural: 'أخطاء', accusative: 'خطأً'
      }
    : {
        zero: '0 تحذيرات', one: 'تحذير واحد', two: 'تحذيران',
        plural: 'تحذيرات', accusative: 'تحذيرًا'
      };
  if (value === 0) return forms.zero;
  if (value === 1) return forms.one;
  if (value === 2) return forms.two;
  if (value >= 3 && value <= 10) return `${value} ${forms.plural}`;
  return `${value} ${forms.accusative}`;
}

function formatArabicChangeCount(count) {
  const value = Math.max(0, Number(count || 0));
  if (value === 0) return 'لا تغييرات';
  if (value === 1) return 'تغيير واحد';
  if (value === 2) return 'تغييران';
  if (value >= 3 && value <= 10) return `${value} تغييرات`;
  return `${value} تغييرًا`;
}

function formatArabicWarningRisk(count) {
  const value = Math.max(0, Number(count || 0));
  if (value === 1) return 'تحذير واحد يحتاج إلى الفرز';
  if (value === 2) return 'تحذيران يحتاجان إلى الفرز';
  if (value >= 3 && value <= 10) {
    return `${value} تحذيرات تحتاج إلى الفرز`;
  }
  return `${value} تحذيرًا يحتاج إلى الفرز`;
}

function formatArabicErrorRisk(count) {
  const value = Math.max(0, Number(count || 0));
  if (value === 1) return 'خطأ تشخيصي واحد';
  if (value === 2) return 'خطآن تشخيصيان';
  if (value >= 3 && value <= 10) return `${value} أخطاء تشخيصية`;
  return `${value} خطأً تشخيصيًا`;
}

function buildEnterpriseInspectorArabicSummary(snapshot = {}) {
  const health = snapshot.health || {};
  const diagnostics = health.diagnostics || {};
  const runtime = snapshot.runtime || {};
  const git = snapshot.git || {};
  const governance = snapshot.governance || {};
  const changedFileCount = Number(git.changedFileCount || 0);
  const warnings = Number(diagnostics.warnings || 0);
  const errors = Number(diagnostics.errors || 0);
  const risks = [];

  if (errors > 0) risks.push(formatArabicErrorRisk(errors));
  if (warnings > 0) risks.push(formatArabicWarningRisk(warnings));
  if (git.clean === false || changedFileCount > 0) {
    risks.push(`مساحة العمل غير نظيفة وبها ${formatArabicChangeCount(changedFileCount)}`);
  }
  if (Number(runtime.ramUsedPercent || 0) >= 80) {
    risks.push(`استخدام الذاكرة مرتفع عند ${runtime.ramUsedPercent}%`);
  }
  if (String(health.runtimeFabricV5 || '').includes('SINGLE_NODE')) {
    risks.push('التشغيل الحالي أحادي العقدة');
  }

  const riskText = risks.length
    ? risks.join('، ')
    : 'لا تظهر مخاطر تشغيلية حرجة في اللقطة الحالية';
  const nextAction = errors > 0
    ? 'معالجة الأخطاء التشخيصية أولًا، ثم تشغيل اختبارات الانحدار وlint وفحص الأسرار'
    : warnings > 0
      ? 'فرز التحذيرات، ثم تشغيل الاختبارات المستهدفة وlint وفحص الأسرار'
      : git.clean === false || changedFileCount > 0
        ? 'تقسيم تغييرات مساحة العمل غير المرتبطة إلى نطاقات مستقلة، ثم تشغيل الاختبارات المستهدفة وlint وفحص الأسرار'
        : 'تشغيل الاختبارات المستهدفة وlint وفحص الأسرار لتثبيت اللقطة النظيفة';

  const summary = [
    `حالة المنظومة: ${health.overall || snapshot.status || 'غير محددة'}.`,
    `التشخيص: ${formatArabicDiagnosticCount(errors, 'error')}، ${formatArabicDiagnosticCount(warnings, 'warning')}، الخادم ${health.runtime || 'غير محدد'}، والإضافة ${health.extension || 'غير محددة'}.`,
    `الموارد: حمل الدقيقة ${runtime.cpuLoad1m ?? 'غير متاح'}، الذاكرة ${runtime.ramUsedPercent ?? 'غير متاح'}%، Heap ${runtime.heapUsedMb ?? 'غير متاح'}/${runtime.heapTotalMb ?? 'غير متاح'}MB.`,
    `المخاطر: ${riskText}.`,
    `الحوكمة: ${governance.status || 'غير محددة'}، والإجراءات عالية الأثر تتطلب مراجعة بشرية: ${governance.humanReviewForHighImpactActions === true ? 'نعم' : 'غير مثبت'}.`,
    `أفضل إجراء تالٍ دون أثر مرتفع: ${nextAction} قبل أي نشر أو تثبيت.`
  ];
  if (errors + warnings > 0) {
    summary.push('', 'تفاصيل التشخيص:', ...buildInspectorDiagnosticTriage(snapshot, 5));
  }
  if (changedFileCount > 0) {
    summary.push('', 'خريطة تغييرات Git:', ...buildInspectorGitTriage(snapshot, 5));
  }
  summary.push('', 'لم يُنفذ أي إجراء عالي الأثر.');
  return summary.join('\n');
}

function buildLocalChatFallbackAnswer(message, reason = '') {
  const text = String(message || '');
  const reasonLine = reason ? `\n\nسبب التحويل الاحتياطي: ${reason}` : '';

  if (/ECONNREFUSED|ECONNRESET|ENOTFOUND|EHOSTUNREACH/i.test(String(reason))) {
    return [
      'خادم شيخة المحلي غير متصل، ولذلك لم يصل طلبك إلى أي نموذج.',
      '',
      'الخطوات:',
      '1. شغّل الخادم: npm start (المنفذ الافتراضي 8080).',
      '2. تأكد أن إعداد sheikha.serverUrl يطابق منفذ الخادم الفعلي.',
      '3. أعد إرسال الطلب.',
      '',
      'لم يُنفذ أي إجراء، ولم تُختلق إجابة بديلة.',
      reasonLine
    ].filter(Boolean).join('\n');
  }

  if (isStructuredOperationalEvidenceReviewRequest(text)) {
    return buildGovernedOperationalEvidenceFallbackAnswer(text, reason);
  }

  if (isGovernedShellCommandRequest(text)) {
    return buildGovernedShellReviewFallbackAnswer(text, reason);
  }

  if (isInspectorRequest(text)) {
    return [
      'تعذر الوصول إلى Enterprise Inspector عبر مسار البث المحكوم.',
      'لم أختلق حالة تشغيل بديلة، ولم أنفذ أي إجراء عالي الأثر.',
      'تحقق من اتصال الخادم المحلي ثم أعد طلب التشخيص.',
      reasonLine
    ].filter(Boolean).join('\n');
  }

  if (/لوحة\s+(?:المالك|الإدارة)|مجلس\s+الإدارة|صفر\s+موظف|zero[\s-]*human|organization\s+control/i.test(text)) {
    return [
      'حالة مركز المالك والمؤسسة:',
      '',
      '- الوضع الافتراضي: صفر موظفين تشغيليين، مع وكيل محكوم لكل دور.',
      '- تُولد لوحة كل منصب من عقد المهمة والصلاحيات وأدوات القياس.',
      '- القراءة والقياس والتحليل والتقارير والتخطيط مؤهلة للأتمتة.',
      '- العقود والمال والتوظيف وتغييرات الإنتاج والقرارات الائتمانية تنتظر موافقة بشرية مخولة.',
      '- التوظيف البشري اختياري، وعند الإسناد تُنشأ لوحة أقل صلاحية حسب الوظيفة.',
      '',
      'واجهة التشغيل المحلية: http://127.0.0.1:8080/dashboard/',
      reasonLine
    ].filter(Boolean).join('\n');
  }

  if (/\brpm\b|\bv7\b|حزمة\s+فيدورا|فيدورا/i.test(text)) {
    return [
      'نتيجة V7 المثبتة:',
      '',
      '- بُنيت حزمة RPM واحدة فقط للإصدار 1.0.51 على x86_64.',
      '- التحقق الساكن ناجح: لا Scriptlets، والاعتماديات bash وcoreutils وNode.js 20 معلنة.',
      '- الحمولة مكافئة محتويًا، مع تشديد آمن للصلاحيات.',
      '- لم تكتمل دورة الحياة الأصلية بعد؛ المرحلة التالية هي بيئة Fedora المعزولة للتثبيت والترقية والرجوع والإزالة.',
      reasonLine
    ].filter(Boolean).join('\n');
  }

  if (/todo[-\s_]*tree|vscode[-\s_]*ripgrep|ripgrep|\brg\b/i.test(text)) {
    return [
      'بسم الله الرحمن الرحيم',
      '',
      'أنا شيخة.',
      '',
      'تم تشخيص مشكلة Todo Tree محليًا دون الاعتماد على بوابة الخادم.',
      '',
      'الإجراء الصحيح:',
      '',
      '1. تأكد أن `rg` موجود:',
      '```bash',
      'command -v rg',
      'rg --version',
      '```',
      '',
      '2. ثبّت إعداد VS Code داخل `.vscode/settings.json`:',
      '```json',
      '"todo-tree.ripgrep": "/usr/bin/rg"',
      '```',
      '',
      '3. أعد تحميل VS Code: `Developer: Reload Window`.',
      '',
      'إذا بقي الخطأ بعد ذلك، يكون السبب غالبًا أن الإضافة تعمل على بيئة Remote/WSL مختلفة عن بيئة المشروع، وعندها نضبط المسار حسب البيئة الفعلية.',
      reasonLine
    ].filter(Boolean).join('\n');
  }

  if (
    /(اختبار|test|تحقق|verification).*(نشر|production|release)|(?:نشر|production|release).*(اختبار|test|تحقق|verification)/i
      .test(text)
  ) {
    return [
      'فائدة الاختبار قبل النشر:',
      '',
      '1. يكشف الأعطال والانحدارات قبل وصولها إلى المستخدم.',
      '2. يتحقق من توافق الوظائف والأمان والأداء مع متطلبات الإصدار.',
      '3. يمنح قرار النشر أو التراجع دليلًا قابلًا للمراجعة.',
      '4. يقلل كلفة الإصلاح؛ لأن معالجة الخلل قبل الإنتاج أسرع وأقل أثرًا.',
      '',
      'الحد الأدنى العملي: اختبارات مستهدفة، lint، فحص أسرار، فحص الحزمة، وتجربة تشغيل أو استعادة في بيئة مماثلة للإنتاج.',
      '',
      'ملاحظة: هذه إجابة احتياطية محلية؛ النموذج العميق لم يكتمل ضمن المهلة.',
      reasonLine
    ].filter(Boolean).join('\n');
  }

  if (/أصلح|اصلح|إصلاح|fix|خطأ|error|تعطل|فشل|failed|bug/i.test(text)) {
    return [
      'فهمت أن المطلوب إصلاح خلل.',
      '',
      `الطلب: ${text.slice(0, 500)}`,
      '',
      'مسار الإصلاح المحكوم:',
      '1. ثبّت رسالة الخطأ وخطوات إعادة الإنتاج.',
      '2. افحص أصغر مسار مسؤول وسجلاته.',
      '3. طبّق تعديلًا محدودًا.',
      '4. شغّل اختبار الانحدار وlint وفحص الفرق.',
      '5. لا تنشر قبل تحقق الدليل.',
      '',
      'أرسل نص الخطأ أو اسم الملف إن لم يكونا ضمن الطلب.',
      reasonLine
    ].filter(Boolean).join('\n');
  }

  if (/تقرير|تثرير|تقرير|report|اكتب|اكتبي|write/i.test(text)) {
    return [
      'بسم الله الرحمن الرحيم',
      '',
      'أنا شيخة.',
      '',
      'تعذر وصول رد JSON صالح من البوابة، لذلك انتقلت إلى جواب احتياطي محلي محكوم بدل إظهار خطأ خام.',
      '',
      'أستطيع كتابة التقرير، لكن أحتاج تحديد الموضوع بدقة أو سأبنيه من النص الذي أرسلته. أرسل الموضوع أو البيانات المطلوبة، وسأعيده بصيغة: ملخص تنفيذي، تحليل، مخاطر، توصيات، وخطوات تالية.',
      reasonLine
    ].filter(Boolean).join('\n');
  }

  if (/اشرح|شرح|ما\s+فائدة|لماذا|كيف|explain|why|how/i.test(text)) {
    return [
      'فهمت طلب الشرح:',
      '',
      text.slice(0, 700),
      '',
      'لم يكتمل استدلال النموذج المحلي ضمن المهلة. لتقديم شرح دقيق بلا تخمين، حدّد المصطلح أو الملف أو النتيجة المقصودة، وسأربط الشرح بالتعريف والسبب والمثال وطريقة التحقق.',
      '',
      'هذا رد احتياطي محكوم، وليس ادعاءً بأن النموذج أجاب عن الموضوع.',
      reasonLine
    ].filter(Boolean).join('\n');
  }

  return [
    'بسم الله الرحمن الرحيم',
    '',
    'أنا شيخة.',
    '',
    'فهمت طلبك:',
    '',
    text.slice(0, 700) || 'لم يُرسل نص يمكن تحليله.',
    '',
    'لم تصل الإجابة الكاملة من النموذج ضمن المهلة، وبقي الشات والخادم مستجيبين. يمكن متابعة الطلب عبر مسار محدد مثل: شرح، إصلاح، تقرير، فحص منظومة، أو حوار أفكار موثق.',
    reasonLine
  ].filter(Boolean).join('\n');
}


function dedupeSheikhaAnswer(text) {
  const raw = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!raw) return raw;

  const lines = raw.split('\n').map(x => x.trim()).filter(Boolean);
  const seen = new Set();
  const out = [];

  for (const line of lines) {
    const key = line
      .replace(/[.،,:؛!؟\s]+$/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();

    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }

  let finalText = out.join('\n');

  finalText = finalText.replace(/^(أنا شيخة\.\s*){2,}/g, 'أنا شيخة.\n');
  finalText = finalText.replace(/(بسم الله الرحمن الرحيم\s*){2,}/g, 'بسم الله الرحمن الرحيم\n');

  return finalText.trim();
}

async function sendExtensionChat(message, options = {}) {
  const text = String(message || '');
  const primaryBaseUrl = options.baseUrl || DEFAULT_BASE_URL;
  const sseTransport = typeof options.sseTransport === 'function'
    ? options.sseTransport
    : postSse;
  const inspectorStatusLoader =
    typeof options.inspectorStatusLoader === 'function'
      ? options.inspectorStatusLoader
      : getEnterpriseInspectorStatus;
  const smartRoute = decideSmartRoute(text, options.mode || 'smart');
  const liveMode = options.streaming !== false;
  const history = Array.isArray(options.history) ? options.history.slice(-12) : [];
  const contextualRepairContext =
    resolveRecentContextualRepairContext(text, history);
  const diagnosticRequested =
    isInspectorRequest(text) || Boolean(contextualRepairContext);
  const governedShellContext = resolveRecentGovernedShellContext(text, history);
  const governedShellReviewRequested = Boolean(governedShellContext);
  const governedEvidenceReviewRequested =
    isStructuredOperationalEvidenceReviewRequest(text);
  const contextualReportContext =
    resolveRecentContextualReportContext(text, history);
  const inspectorContinuation =
    resolveRecentInspectorContinuation(text, history);
  const governedContextualReportRequested =
    Boolean(contextualReportContext);
  const governedLiveMessage = governedShellContext?.reviewMessage ||
    contextualRepairContext?.repairMessage || text;
  const constructiveDialogueMode =
    options.dialogueMode === 'constructive' ||
    options.mode === 'constructive';
  const governedReasoningMode =
    ['standard', 'pro', 'ultra'].includes(options.mode)
      ? options.mode
      : 'standard';
  const liveLegacyTransport =
    typeof options.liveLegacyTransport === 'function'
      ? options.liveLegacyTransport
      : (payload) => postJson(
        LEGACY_LIVE_CHAT_ENDPOINT,
        payload,
        primaryBaseUrl
      );
  let terminalLiveFailure = null;
  let governedLiveError = null;
  let provisionalLiveReceived = false;

  if (isSheikhaChatIdentityRequest(text)) {
    return {
      success: true,
      answer: buildSheikhaChatIdentityAnswer(),
      raw: {
        success: true,
        route: 'SHEIKHA_EXTENSION_CHAT_IDENTITY_V1',
        modelInvoked: false,
        highImpactActionExecuted: false
      }
    };
  }

  const localInformationalAnswer = isSheikhaCapabilitiesRequest(text)
    ? buildSheikhaCapabilitiesAnswer()
    : isUsefulDiscoveryRequest(text)
      ? buildUsefulDiscoveryAnswer()
      : isStandaloneReportRequest(text)
        ? buildStandaloneReportAnswer(history)
        : null;
  if (localInformationalAnswer) {
    return {
      success: true,
      answer: localInformationalAnswer,
      raw: {
        success: true,
        route: 'SHEIKHA_EXTENSION_LOCAL_INFORMATIONAL_V1',
        modelInvoked: false,
        highImpactActionExecuted: false
      }
    };
  }

  if (isChatLlmReadinessRequest(text)) {
    const integrationLoader = typeof options.llmIntegrationLoader === 'function'
      ? options.llmIntegrationLoader
      : ({ baseUrl }) => postJson(
        '/api/sheikha/ai-governor/federation/v1/chat-llm/integration/plan',
        {
          chatContractVerified: true,
          modelWeightsAvailable: false,
          modelLicenseVerified: false,
          datasetLicenseVerified: false,
          arabicEvaluationPassed: false,
          safetyEvaluationPassed: false,
          loadAndRecoveryPassed: false,
          observabilityEnabled: true,
          humanCommercialApproval: false,
          modelClassClaim: 'UNVERIFIED'
        },
        baseUrl
      );
    let integration = null;
    try {
      integration = await integrationLoader({ baseUrl: primaryBaseUrl });
    } catch {}
    return {
      success: true,
      answer: buildChatLlmReadinessAnswer(integration),
      raw: {
        success: true,
        route: 'SHEIKHA_EXTENSION_CHAT_LLM_READINESS_V1',
        modelInvoked: false,
        highImpactActionExecuted: false
      }
    };
  }

  if (isCommercialReadinessRequest(text)) {
    const siteStatusLoader = typeof options.siteStatusLoader === 'function'
      ? options.siteStatusLoader
      : ({ baseUrl }) => getJson('/api/health', baseUrl, 3000);
    let siteStatus = null;
    try {
      siteStatus = await siteStatusLoader({ baseUrl: primaryBaseUrl });
    } catch {}
    return {
      success: true,
      answer: buildCommercialReadinessAnswer(siteStatus),
      raw: {
        success: true,
        route: 'SHEIKHA_EXTENSION_COMMERCIAL_READINESS_V1',
        modelInvoked: false,
        highImpactActionExecuted: false
      }
    };
  }

  if (isWebsiteRequest(text)) {
    const siteStatusLoader = typeof options.siteStatusLoader === 'function'
      ? options.siteStatusLoader
      : ({ baseUrl }) => getJson('/api/health', baseUrl, 3000);
    let siteStatus = null;
    try {
      siteStatus = await siteStatusLoader({ baseUrl: primaryBaseUrl });
    } catch {}
    const answer = buildWebsiteStatusAnswer(siteStatus);
    return {
      success: true,
      answer,
      raw: {
        success: true,
        route: 'SHEIKHA_EXTENSION_WEBSITE_STATUS_V1',
        websiteOnline: siteStatus?.success === true &&
          (siteStatus?.data?.status === 'ok' || siteStatus?.status === 'ok'),
        modelInvoked: false,
        highImpactActionExecuted: false
      }
    };
  }

  if (isAmbiguousExecutionRequest(text)) {
    const answer = buildAmbiguousExecutionAnswer();
    if (typeof options.onEvent === 'function') {
      options.onEvent({ event: 'ack', data: { success: true } });
      options.onEvent({
        event: 'token',
        data: { text: answer, source: 'governed-intent-clarification' }
      });
      options.onEvent({
        event: 'done',
        data: {
          success: true,
          route: 'SHEIKHA_EXTENSION_GOVERNED_INTENT_CLARIFICATION_V1'
        }
      });
    }
    if (typeof options.onToken === 'function') {
      options.onToken({ event: 'token', data: { text: answer }, text: answer });
    }
    return {
      success: true,
      answer,
      raw: {
        success: true,
        route: 'SHEIKHA_EXTENSION_GOVERNED_INTENT_CLARIFICATION_V1',
        modelInvoked: false,
        highImpactActionExecuted: false
      }
    };
  }

  // Live path must not wait for workspace/tool/inspector collection.
  const workspace = liveMode ? {} : collectWorkspaceContext();
  const vscodeTools = liveMode ? {} : collectVSCodeToolContext();
  const inspectorSnapshot = (!liveMode && diagnosticRequested)
    ? await inspectorStatusLoader({ baseUrl: primaryBaseUrl })
    : undefined;

  const payload = {
    message: text,
    mode: constructiveDialogueMode
      ? governedReasoningMode
      : options.mode === 'engineering'
        ? 'agentic'
        : options.mode === 'editorial'
          ? 'agentic'
        : options.mode === 'scientific'
          ? 'pro'
        : options.mode || smartRoute.mode ||
        (/كود|برمج|اصلح|fix|code|test|error|patch|دبق|debug/i.test(text)
          ? 'code'
          : 'chat'),
    dialogueMode: constructiveDialogueMode
      ? 'constructive'
      : null,
    audienceContext:
      options.audienceContext || 'GENERAL_PUBLIC',
    religiousLensRequested:
      constructiveDialogueMode &&
      options.religiousLensRequested !== false,
    ultraBudgetApproved:
      options.ultraBudgetApproved === true,
    actor: 'vscode-extension',
    channel: 'extension-chat',
    source: 'sheikha-vscode-extension',
    governanceProfile: 'SHEIKHA_ENTERPRISE_CHAT_GOVERNANCE_V1',
    completion: buildGovernedCompletionContract(text),
    diagnosticRequested,
    inspectorSnapshot,
    route: smartRoute,
    workspace,
    vscodeTools,
    conversationId: options.conversationId || null,
    history: history.slice(-8)
  };
  const greetingAllowed = options.greetingAllowed !== false;
  const engineeringMode = ['engineering', 'editorial'].includes(options.mode);
  const intelligenceApexMode =
    ['standard', 'pro', 'ultra'].includes(payload.mode) ||
    engineeringMode ||
    constructiveDialogueMode;

  if (liveMode && contextualRepairContext) {
    const repairSnapshot = await inspectorStatusLoader({
      baseUrl: primaryBaseUrl,
      timeout: Number(options.inspectorDirectTimeout || 6000)
    });
    if (repairSnapshot?.success === true) {
      const answer = buildContextualRepairResolutionAnswer(
        contextualRepairContext.context,
        repairSnapshot
      );
      if (typeof options.onEvent === 'function') {
        options.onEvent({ event: 'ack', data: { success: true } });
        options.onEvent({
          event: 'token',
          data: { text: answer, source: 'inspector-repair-comparison' }
        });
        options.onEvent({
          event: 'done',
          data: {
            success: true,
            route: 'SHEIKHA_EXTENSION_INSPECTOR_REPAIR_RESOLUTION_V1'
          }
        });
      }
      if (typeof options.onToken === 'function') {
        options.onToken({ event: 'token', data: { text: answer }, text: answer });
      }
      return {
        success: true,
        answer,
        raw: {
          success: true,
          route: 'SHEIKHA_EXTENSION_INSPECTOR_REPAIR_RESOLUTION_V1',
          contextSource: contextualRepairContext.source,
          highImpactActionExecuted: false
        }
      };
    }
  }

  if (inspectorContinuation) {
    let continuationSnapshot = null;
    let continuationRefreshError = '';
    try {
      continuationSnapshot = await inspectorStatusLoader({
        baseUrl: primaryBaseUrl,
        timeout: Number(options.inspectorDirectTimeout || 3000)
      });
      if (continuationSnapshot?.success !== true) {
        continuationRefreshError = continuationSnapshot?.error ||
          continuationSnapshot?.status || 'INSPECTOR_UNAVAILABLE';
      }
    } catch (error) {
      continuationRefreshError = error?.message || 'INSPECTOR_UNAVAILABLE';
    }
    const answer = buildInspectorContinuationAnswer(
      inspectorContinuation.context,
      continuationSnapshot,
      continuationRefreshError
    );
    if (typeof options.onEvent === 'function') {
      options.onEvent({
        event: 'token',
        data: { text: answer, source: 'inspector-conversation-history' }
      });
      options.onEvent({
        event: 'done',
        data: {
          success: true,
          route: 'SHEIKHA_EXTENSION_INSPECTOR_CONTEXT_CONTINUATION_V1'
        }
      });
    }
    if (typeof options.onToken === 'function') {
      options.onToken({ event: 'token', data: { text: answer }, text: answer });
    }
    return {
      success: true,
      answer,
      raw: {
        success: true,
        route: 'SHEIKHA_EXTENSION_INSPECTOR_CONTEXT_CONTINUATION_V1',
        contextSource: inspectorContinuation.source,
        inspectorRefreshSucceeded: continuationSnapshot?.success === true,
        highImpactActionExecuted: false
      }
    };
  }

  if (
    liveMode && diagnosticRequested && !contextualRepairContext &&
    options.preferDirectInspector !== false
  ) {
    const directSnapshot = await inspectorStatusLoader({
      baseUrl: primaryBaseUrl,
      timeout: Number(options.inspectorDirectTimeout || 6000)
    });
    if (directSnapshot?.success === true) {
      const answer = buildEnterpriseInspectorArabicSummary(directSnapshot);
      if (typeof options.onEvent === 'function') {
        options.onEvent({ event: 'ack', data: { success: true } });
        options.onEvent({
          event: 'meta',
          data: { route: 'SHEIKHA_EXTENSION_DIRECT_INSPECTOR_V2' }
        });
        options.onEvent({ event: 'token', data: { text: answer } });
        options.onEvent({
          event: 'done',
          data: {
            success: true,
            route: 'SHEIKHA_EXTENSION_DIRECT_INSPECTOR_V2'
          }
        });
      }
      if (typeof options.onToken === 'function') {
        options.onToken({ event: 'token', data: { text: answer }, text: answer });
      }
      return {
        success: true,
        answer,
        raw: {
          success: true,
          route: 'SHEIKHA_EXTENSION_DIRECT_INSPECTOR_V2',
          diagnosticRequested: true,
          inspectorStatus: directSnapshot.status || null,
          highImpactActionExecuted: false
        }
      };
    }
  }

  try {
    // SHEIKHA_EXTENSION_REAL_SSE_BINDING_L51_V1
    // Real transport path: Extension -> /api/sheikha/live/chat/v1 -> Ollama SSE tokens.
    if (shouldUseGovernedLiveTransport({
      intelligenceApexMode,
      governedShellReviewRequested,
      governedEvidenceReviewRequested,
      governedContextualReportRequested,
      diagnosticRequested,
      liveEnabled: options.live !== false
    })) {
      try {
        const streamed = await sseTransport(
          LIVE_CHAT_ENDPOINT,
          {
            message: governedLiveMessage,
            mode: payload.mode || options.mode || 'smart',
            actor: 'vscode-extension',
            channel: 'extension-chat',
            source: 'sheikha-vscode-extension',
            transport: 'REAL_SSE_L51',
            diagnosticRequested,
            language: options.language || DEFAULT_EXTENSION_CHAT_LANGUAGE,
            responseMode: options.fastOnly === true
              ? 'FAST_ONLY'
              : LIVE_RESPONSE_MODE,
            governedShellReviewRequested,
            governedShellFollowUp: governedShellContext?.followUp === true,
            governedEvidenceReviewRequested,
            governedContextualReportRequested,
            completion: payload.completion,
            reportContext: contextualReportContext?.context || null,
            reportContextSource: contextualReportContext?.source || null
          },
          primaryBaseUrl,
          {
            timeout: Number(options.liveTimeout || 90000),
            firstTokenTimeout: Number(
              options.liveFirstTokenTimeout ||
              DEFAULT_LIVE_FIRST_TOKEN_TIMEOUT_MS
            ),
            greetingAllowed,
            onEvent: options.onEvent,
            onToken: options.onToken
          }
        );

        const answerText = String(
          streamed?.answer ||
          streamed?.text ||
          streamed?.tokens?.join?.('') ||
          ''
        ).trim();

        const provisional = isProvisionalLiveResponse(streamed);
        provisionalLiveReceived = provisional;
        if (shouldCompleteLiveResponse(streamed, {
          allowProvisional: options.fastOnly === true
        })) {
          if (provisional && typeof options.onEvent === 'function') {
            options.onEvent({
              event: 'live-fast-ack-complete',
              data: {
                route: 'FAST_ARABIC_DEFAULT',
                deepModelMode: 'background',
                requestCompleted: true
              }
            });
          }
          return {
            success: true,
            answer: dedupeSheikhaAnswer(answerText),
            raw: {
              ...streamed,
              route: 'SHEIKHA_EXTENSION_REAL_SSE_BINDING_L51_V1',
              endpoint: LIVE_CHAT_ENDPOINT,
              realSse: true,
              fastArabicFirst: provisional,
              deepModelMode: provisional ? 'background' : undefined
            }
          };
        }
        if (provisional && typeof options.onEvent === 'function') {
          options.onEvent({
            event: 'deep-continuation',
            data: {
              route: 'SHEIKHA_EXTENSION_DEEP_RESPONSE_CONTINUATION_V1',
              requestCompleted: false
            }
          });
        }
      } catch (sseError) {
        governedLiveError = sseError;
        if (
          /timeout|ollama|model/i.test(String(sseError.message || '')) ||
          sseError.payload?.model
        ) {
          terminalLiveFailure = sseError;
        }
        if (typeof options.onEvent === 'function') {
          options.onEvent({
            event: 'real-sse-l51-error',
            data: { error: sseError.message }
          });
        }

        // Inspector requests recover from authoritative local status first.
        // The legacy chat endpoint is retained only for general conversation.
        if (!diagnosticRequested) try {
          const legacyLive = await liveLegacyTransport({
            message: governedLiveMessage,
            mode: payload.mode || options.mode || 'smart',
            actor: 'vscode-extension',
            channel: 'extension-chat',
            source: 'sheikha-vscode-extension',
            transport: 'LEGACY_LIVE_CHAT_JSON'
          });
          const legacyAnswer = String(
            legacyLive?.answer ||
            legacyLive?.reply ||
            legacyLive?.response ||
            legacyLive?.message ||
            ''
          ).trim();

          if (legacyLive?.success === true && legacyAnswer) {
            if (typeof options.onEvent === 'function') {
              options.onEvent({
                event: 'legacy-live-chat-fallback',
                data: {
                  route: 'SHEIKHA_EXTENSION_LEGACY_LIVE_CHAT_FALLBACK_V1',
                  endpoint: LEGACY_LIVE_CHAT_ENDPOINT
                }
              });
            }

            return {
              success: true,
              answer: dedupeSheikhaAnswer(legacyAnswer),
              raw: {
                ...legacyLive,
                route: 'SHEIKHA_EXTENSION_LEGACY_LIVE_CHAT_FALLBACK_V1',
                endpoint: LEGACY_LIVE_CHAT_ENDPOINT,
                recoveredFrom: sseError?.message || null
              }
            };
          }
        } catch (legacyError) {
          if (typeof options.onEvent === 'function') {
            options.onEvent({
              event: 'legacy-live-chat-fallback-error',
              data: { error: legacyError.message }
            });
          }
        }
      }
    }

    if (governedContextualReportRequested) {
      return {
        success: true,
        answer: buildGovernedContextualReportFallbackAnswer(
          contextualReportContext.context,
          governedLiveError?.message || 'تعذر إكمال مسار SSE المحكوم'
        ),
        raw: {
          success: true,
          route: 'SHEIKHA_EXTENSION_LOCAL_CONTEXTUAL_REPORT_V1',
          contextSource: contextualReportContext.source,
          highImpactActionExecuted: false
        }
      };
    }

    if (contextualRepairContext) {
      return {
        success: true,
        answer: buildContextualRepairFallbackAnswer(
          contextualRepairContext.context,
          governedLiveError?.message || 'تعذر إكمال مسار الإصلاح العميق'
        ),
        raw: {
          success: false,
          route: 'SHEIKHA_EXTENSION_CONTEXTUAL_REPAIR_TERMINAL_FALLBACK_V1',
          terminalState: 'BLOCKED_WITH_EXACT_REQUIREMENT',
          contextSource: contextualRepairContext.source,
          highImpactActionExecuted: false
        }
      };
    }

    if (governedEvidenceReviewRequested) {
      return {
        success: true,
        answer: buildGovernedOperationalEvidenceFallbackAnswer(
          text,
          governedLiveError?.message || 'تعذر إكمال مسار SSE المحكوم'
        ),
        raw: {
          success: true,
          route: 'SHEIKHA_EXTENSION_LOCAL_OPERATIONAL_EVIDENCE_REVIEW_V1',
          evidenceFilesRead: false,
          highImpactActionExecuted: false
        }
      };
    }

    if (governedShellReviewRequested) {
      return {
        success: true,
        answer: buildGovernedShellReviewFallbackAnswer(
          governedLiveMessage,
          governedLiveError?.message || 'تعذر إكمال مسار SSE المحكوم'
        ),
        raw: {
          success: true,
          route: 'SHEIKHA_EXTENSION_LOCAL_GOVERNED_SHELL_REVIEW_V1',
          shellExecuted: false,
          highImpactActionExecuted: false
        }
      };
    }

    if (diagnosticRequested) {
      const directInspectorSnapshot = await inspectorStatusLoader({
        baseUrl: primaryBaseUrl,
        timeout: Number(options.inspectorFallbackTimeout || 5000)
      });
      if (directInspectorSnapshot?.success === true) {
        return {
          success: true,
          answer: buildEnterpriseInspectorArabicSummary(
            directInspectorSnapshot
          ),
          raw: {
            success: true,
            route: 'SHEIKHA_EXTENSION_DIRECT_INSPECTOR_RECOVERY_V1',
            diagnosticRequested: true,
            recoveredFrom: governedLiveError?.code ||
              governedLiveError?.message || null,
            highImpactActionExecuted: false
          }
        };
      }
      return {
        success: true,
        answer: buildLocalChatFallbackAnswer(
          text,
          governedLiveError?.message || 'تعذر إكمال مسار SSE المحكوم'
        ),
        raw: {
          success: false,
          route: 'SHEIKHA_EXTENSION_LOCAL_INSPECTOR_FALLBACK_V1',
          diagnosticRequested: true,
          highImpactActionExecuted: false
        }
      };
    }

    if (
      terminalLiveFailure &&
      options.allowSlowFallbackOnLiveError !== true
    ) {
      return {
        success: true,
        answer: normalizeSheikhaReply(
          buildLocalChatFallbackAnswer(
            text,
            `live_model_unavailable: ${terminalLiveFailure.message}`
          ),
          text,
          { greetingAllowed }
        ),
        raw: {
          success: false,
          route: 'SHEIKHA_EXTENSION_GOVERNED_LOCAL_FALLBACK_V1',
          liveModelUnavailable: true,
          error: terminalLiveFailure.message
        }
      };
    }

    // SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1
    // Primary deep governed path: Extension -> Autonomous Chat -> L35/L26 -> Model Router.
    if (
      (!intelligenceApexMode || engineeringMode) &&
      !provisionalLiveReceived &&
      options.autonomous !== false
    ) {
      try {
        if (typeof options.onEvent === 'function') {
          options.onEvent({
            event: 'ack',
            data: {
              success: true,
              route: 'SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1'
            }
          });
        }

        const autonomous = await postJson(
          AUTONOMOUS_CHAT_ENDPOINT,
          {
            message: text,
            mode: payload.mode || options.mode || 'smart',
            actor: 'vscode-extension',
            channel: 'extension-chat',
            source: 'sheikha-vscode-extension',
            transport: 'AUTONOMOUS_L35_JSON',
            completion: payload.completion,
            __timeoutMs: Number(options.timeout || 180000)
          },
          primaryBaseUrl
        );

        const answerText = extractAnswerText(
          autonomous?.answer ?? autonomous?.result?.answer ?? autonomous?.message
        );

        if (autonomous?.success === true && answerText) {
          const meta = {
            route: 'SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1',
            backendRoute: autonomous.route,
            status: autonomous?.result?.status,
            model: autonomous?.result?.routed?.model,
            agent: autonomous?.result?.plan?.agent,
            apexLevel: autonomous?.result?.plan?.apexLevel || 35
          };

          if (typeof options.onEvent === 'function') {
            options.onEvent({ event: 'meta', data: meta });
            options.onEvent({ event: 'token', data: { text: dedupeSheikhaAnswer(answerText) } });
            options.onEvent({ event: 'done', data: { success: true } });
          }

          if (typeof options.onToken === 'function') {
            options.onToken({ event: 'token', data: { text: dedupeSheikhaAnswer(answerText) }, text: dedupeSheikhaAnswer(answerText) });
          }

          const fullAnswerText = extractAnswerText(
            autonomous?.answer ??
            autonomous?.result?.answer ??
            autonomous?.result?.answerText ??
            autonomous?.result?.response ??
            answerText
          );

          return {
            success: true,
            answer: dedupeSheikhaAnswer(fullAnswerText),
            raw: {
              ...autonomous,
              route: 'SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1',
              endpoint: AUTONOMOUS_CHAT_ENDPOINT,
              meta,
              fullAnswerText
            }
          };
        }
      } catch (autonomousError) {
        if (typeof options.onEvent === 'function') {
          options.onEvent({
            event: 'autonomous-l35-fallback',
            data: { error: autonomousError.message }
          });
        }
      }
    }

    // Removed obsolete JSON fastpath; real SSE L51 is authoritative.

    if (
      !intelligenceApexMode &&
      !provisionalLiveReceived &&
      options.streaming !== false
    ) {
      try {
        const streamed = await postSse(STREAMING_CHAT_APEX_STREAM_ENDPOINT, {
          message: text,
          mode: payload.mode,
          actor: 'vscode-extension',
          channel: 'extension-chat',
          source: 'sheikha-vscode-extension',
          transport: 'SSE_LIVE',
          extensionStreaming: true
        }, primaryBaseUrl, {
          greetingAllowed,
          onEvent: options.onEvent,
          onToken: options.onToken,
          timeout: options.timeout || 90000
        });

        if (streamed?.success === true && streamed.answer) {
          return {
            success: true,
            answer: normalizeSheikhaReply(streamed.answer, text, { greetingAllowed }),
            raw: {
              ...streamed,
              route: 'SHEIKHA_STREAMING_MULTILINGUAL_CHAT_APEX_V1',
              endpoint: STREAMING_CHAT_APEX_STREAM_ENDPOINT
            }
          };
        }
      } catch (streamError) {
        if (typeof options.onEvent === 'function') {
          options.onEvent({
            event: 'stream-fallback',
            data: { error: streamError.message }
          });
        }
      }
    }

    let data = await postJson(CONVERSATION_ENDPOINT, payload, primaryBaseUrl);

    if (shouldUseUnifiedFallback(data) && !isLocalBaseUrl(primaryBaseUrl)) {
      try {
        const localData = await postJson(CONVERSATION_ENDPOINT, {
          ...payload,
          fallbackFrom: primaryBaseUrl,
          fallbackReason: data?.error || 'primary_non_json_or_unavailable'
        }, LOCAL_BASE_URL);

        if (localData?.success === true) {
          data = {
            ...localData,
            extensionFallback: true,
            localRuntimeFallback: true
          };
        }
      } catch {}
    }

    if (shouldUseUnifiedFallback(data)) {
      data = await postJson(UNIFIED_CHAT_FALLBACK_ENDPOINT, {
        ...payload,
        fallbackFrom: CONVERSATION_ENDPOINT
      }, primaryBaseUrl);
      data.extensionFallback = true;
    }

    if (!data || data.success !== true) {
      const reason = data?.error || data?.message || `HTTP_${data?.statusCode || 'UNKNOWN'}`;
      return {
        success: true,
        answer: normalizeSheikhaReply(
          buildLocalChatFallbackAnswer(text, reason),
          text,
          { greetingAllowed }
        ),
        raw: {
          ...(data || {}),
          localConversationFallback: true,
          originalSuccess: data?.success === true
        }
      };
    }

    return {
      success: true,
      answer: normalizeSheikhaReply(
        extractAnswerText(data.answer ?? data.reply ?? data.message ?? data.response ?? data.result),
        text,
        { greetingAllowed }
      ),
      raw: data
    };
  } catch (err) {
    try {
      const fallback = await postJson(UNIFIED_CHAT_FALLBACK_ENDPOINT, {
        ...payload,
        fallbackFrom: CONVERSATION_ENDPOINT,
        primaryError: err.message
      }, primaryBaseUrl);

      if (fallback?.success === true) {
        return {
          success: true,
          answer: normalizeSheikhaReply(
            extractAnswerText(
              fallback.answer ?? fallback.reply ?? fallback.message ?? fallback.response ?? fallback.result
            ),
            text,
            { greetingAllowed }
          ),
          raw: { ...fallback, extensionFallback: true }
        };
      }
    } catch {}

    return {
      success: true,
      answer: normalizeSheikhaReply(
        buildLocalChatFallbackAnswer(text, err.message),
        text,
        { greetingAllowed }
      ),
      raw: { success: false, error: err.message, localConversationFallback: true }
    };
  }
}

module.exports = {
  CONVERSATION_ENDPOINT,
  DEFAULT_LIVE_FIRST_TOKEN_TIMEOUT_MS,
  DEFAULT_EXTENSION_CHAT_LANGUAGE,
  DEFAULT_BASE_URL,
  normalizeLocalBaseUrl,
  LOCAL_BASE_URL,
  LIVE_RESPONSE_MODE,
  LEGACY_LIVE_CHAT_ENDPOINT,
  INSPECTOR_STATUS_ENDPOINT,
  ORGANIZATION_CONTROL_STATUS_ENDPOINT,
  EXTENSION_EXPERIENCE_STATUS_ENDPOINT,
  VITAL_CHAT_APEX_STATUS_ENDPOINT,
  DEBUGGING_APEX_STATUS_ENDPOINT,
  CHAT_INTERFACE_APEX_STATUS_ENDPOINT,
  IDE_APEX_STATUS_ENDPOINT,
  TECHNICAL_CAPABILITY_APEX_STATUS_ENDPOINT,
  COMPUTING_COGNITIVE_APEX_STATUS_ENDPOINT,
  STREAMING_CHAT_APEX_STATUS_ENDPOINT,
  STREAMING_CHAT_APEX_STREAM_ENDPOINT,
  EXTENSION_STREAMING_ARTIFACT_APEX_STATUS_ENDPOINT,
  EXTENSION_TRANSPORT_VERSION,
  UNIFIED_CHAT_FALLBACK_ENDPOINT,
  sendExtensionChat,
  postJson,
  postSse,
  getJson,
  getEnterpriseInspectorStatus,
  getOrganizationControlStatus,
  getExtensionExperienceStatus,
  getVitalChatApexStatus,
  getDebuggingApexStatus,
  getChatInterfaceApexStatus,
  getIdeApexStatus,
  getTechnicalCapabilityApexStatus,
  getComputingCognitiveApexStatus,
  getStreamingChatApexStatus,
  getExtensionStreamingArtifactApexStatus,
  buildEnterpriseInspectorArabicSummary,
  buildGovernedOperationalEvidenceFallbackAnswer,
  buildGovernedShellReviewFallbackAnswer,
  buildLocalChatFallbackAnswer,
  parseSseBuffer,
  parseSseEvent,
  parseOperationalEvidenceMarkers,
  isStructuredOperationalEvidenceReviewRequest,
  isGovernedShellCommandRequest,
  isGovernedShellFollowUpRequest,
  resolveRecentGovernedShellContext,
  isContextualReportFollowUpRequest,
  resolveRecentContextualReportContext,
  isInspectorContinuationRequest,
  resolveRecentInspectorContinuation,
  buildInspectorContinuationAnswer,
  collectInspectorDiagnosticItems,
  buildInspectorDiagnosticTriage,
  buildInspectorGitTriage,
  buildContextualRepairFallbackAnswer,
  buildContextualRepairResolutionAnswer,
  buildExtensionActivationEvidenceAnswer,
  buildGovernedEditorialDocument,
  isContextualRepairFollowUpRequest,
  resolveRecentContextualRepairContext,
  parseExtensionActivationEvidence,
  isGenericEditorialProductionRequest,
  buildGovernedContextualReportFallbackAnswer,
  shouldUseGovernedLiveTransport,
  isLocalBaseUrl,
  isInspectorRequest,
  isProvisionalLiveResponse,
  shouldCompleteLiveResponse,
  safeJsonParse,
  shouldUseUnifiedFallback
  ,extractAnswerText
  ,isAmbiguousExecutionRequest
  ,buildAmbiguousExecutionAnswer
  ,isWebsiteRequest
  ,buildWebsiteStatusAnswer
  ,isSheikhaChatIdentityRequest
  ,buildSheikhaChatIdentityAnswer
  ,isSheikhaCapabilitiesRequest
  ,buildSheikhaCapabilitiesAnswer
  ,isUsefulDiscoveryRequest
  ,buildUsefulDiscoveryAnswer
  ,isStandaloneReportRequest
  ,buildStandaloneReportAnswer
  ,isCommercialReadinessRequest
  ,buildCommercialReadinessAnswer
  ,isChatLlmReadinessRequest
  ,buildChatLlmReadinessAnswer
};
