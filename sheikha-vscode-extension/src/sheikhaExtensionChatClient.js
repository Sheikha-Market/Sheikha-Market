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
const EXTENSION_TRANSPORT_VERSION = '1.0.114';
const DEFAULT_LIVE_FIRST_TOKEN_TIMEOUT_MS = 8000;

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

  return [
    `حالة المنظومة: ${health.overall || snapshot.status || 'غير محددة'}.`,
    `التشخيص: ${formatArabicDiagnosticCount(errors, 'error')}، ${formatArabicDiagnosticCount(warnings, 'warning')}، الخادم ${health.runtime || 'غير محدد'}، والإضافة ${health.extension || 'غير محددة'}.`,
    `الموارد: حمل الدقيقة ${runtime.cpuLoad1m ?? 'غير متاح'}، الذاكرة ${runtime.ramUsedPercent ?? 'غير متاح'}%، Heap ${runtime.heapUsedMb ?? 'غير متاح'}/${runtime.heapTotalMb ?? 'غير متاح'}MB.`,
    `المخاطر: ${riskText}.`,
    `الحوكمة: ${governance.status || 'غير محددة'}، والإجراءات عالية الأثر تتطلب مراجعة بشرية: ${governance.humanReviewForHighImpactActions === true ? 'نعم' : 'غير مثبت'}.`,
    'أفضل إجراء تالٍ دون أثر مرتفع: فرز التحذيرات، وتقسيم التغييرات غير المرتبطة إلى نطاقات مستقلة، ثم تشغيل الاختبارات المستهدفة وlint وفحص الأسرار قبل أي نشر أو تثبيت.',
    'لم يُنفذ أي إجراء عالي الأثر.'
  ].join('\n');
}

function buildLocalChatFallbackAnswer(message, reason = '') {
  const text = String(message || '');
  const reasonLine = reason ? `\n\nسبب التحويل الاحتياطي: ${reason}` : '';

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
  const diagnosticRequested = isInspectorRequest(text);
  const history = Array.isArray(options.history) ? options.history.slice(-12) : [];
  const governedShellContext = resolveRecentGovernedShellContext(text, history);
  const governedShellReviewRequested = Boolean(governedShellContext);
  const governedEvidenceReviewRequested =
    isStructuredOperationalEvidenceReviewRequest(text);
  const contextualReportContext =
    resolveRecentContextualReportContext(text, history);
  const governedContextualReportRequested =
    Boolean(contextualReportContext);
  const governedLiveMessage = governedShellContext?.reviewMessage || text;
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
    diagnosticRequested,
    inspectorSnapshot,
    route: smartRoute,
    workspace,
    vscodeTools
    ,
    conversationId: options.conversationId || null,
    history: history.slice(-8)
  };
  const greetingAllowed = options.greetingAllowed !== false;
  const intelligenceApexMode =
    ['standard', 'pro', 'ultra'].includes(payload.mode) ||
    constructiveDialogueMode;

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

        // Compatibility fallback for runtimes that only expose /api/sheikha/live-chat.
        try {
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
      !intelligenceApexMode &&
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
            __timeoutMs: Number(options.timeout || 180000)
          },
          primaryBaseUrl
        );

        const answerText = String(
          autonomous?.answer ||
          autonomous?.result?.answer ||
          autonomous?.message ||
          ''
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

          const fullAnswerText = String(
            autonomous?.answer ||
            autonomous?.result?.answer ||
            autonomous?.result?.answerText ||
            autonomous?.result?.response ||
            answerText ||
            ''
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
        data.answer || data.reply || data.message || '',
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
            fallback.answer || fallback.reply || fallback.message || '',
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
  buildGovernedContextualReportFallbackAnswer,
  shouldUseGovernedLiveTransport,
  isLocalBaseUrl,
  isInspectorRequest,
  isProvisionalLiveResponse,
  shouldCompleteLiveResponse,
  safeJsonParse,
  shouldUseUnifiedFallback
};
