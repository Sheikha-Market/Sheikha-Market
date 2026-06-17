'use strict';

const http = require('http');
const https = require('https');
const { collectWorkspaceContext } = require('./sheikhaWorkspaceIntelligence');
const { collectVSCodeToolContext } = require('./sheikhaVSCodeToolRegistry');
const { normalizeSheikhaReply } = require('./sheikhaReplyNormalizer');
const { decideSmartRoute } = require('./sheikhaSmartRouteGovernance');

const LOCAL_BASE_URL = process.env.SHEIKHA_LOCAL_API_BASE_URL || 'http://127.0.0.1:8080';
const DEFAULT_BASE_URL = process.env.SHEIKHA_API_BASE_URL || LOCAL_BASE_URL;
const CONVERSATION_ENDPOINT = '/api/sheikha/conversation-engine/v1/chat';
const UNIFIED_CHAT_FALLBACK_ENDPOINT = '/api/sheikha/unified-chat';
const INSPECTOR_STATUS_ENDPOINT = '/api/sheikha/enterprise-inspector/v3/status';
const EXTENSION_EXPERIENCE_STATUS_ENDPOINT = '/api/sheikha/extension-experience/v1/status';
const VITAL_CHAT_APEX_STATUS_ENDPOINT = '/api/sheikha/vital-chat-apex/v1/status';
const DEBUGGING_APEX_STATUS_ENDPOINT = '/api/sheikha/debugging-apex/v1/status';
const CHAT_INTERFACE_APEX_STATUS_ENDPOINT = '/api/sheikha/chat-interface-apex/v1/status';
const IDE_APEX_STATUS_ENDPOINT = '/api/sheikha/ide-apex/v1/status';
const TECHNICAL_CAPABILITY_APEX_STATUS_ENDPOINT = '/api/sheikha/technical-capability-apex/v1/status';
const STREAMING_CHAT_APEX_STATUS_ENDPOINT = '/api/sheikha/streaming-chat-apex/v1/status';
const STREAMING_CHAT_APEX_STREAM_ENDPOINT = '/api/sheikha/streaming-chat-apex/v1/stream';
const EXTENSION_STREAMING_ARTIFACT_APEX_STATUS_ENDPOINT =
  '/api/sheikha/extension-streaming-artifact-apex/v1/status';
const EXTENSION_TRANSPORT_VERSION = '1.0.89';

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
    const body = JSON.stringify(payload || {});
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
      timeout: 60000
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
      req.destroy(new Error('Sheikha extension chat timeout after 60s'));
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
    .replace(/\\n/g, '\n')
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

    const greetingFilter = createStreamingGreetingFilter(handlers.greetingAllowed !== false);

    function finish(result) {
      if (ended) return;
      ended = true;
      resolve(result);
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
      timeout: handlers.timeout || 90000
    }, (res) => {
      statusCode = Number(res.statusCode || 0);
      contentType = String(res.headers['content-type'] || '');

      res.on('data', (chunk) => {
        const parsed = parseSseBuffer(rest + chunk.toString('utf8'));
        rest = parsed.rest;

        parsed.events.forEach((item) => {
          events.push(item);
          if (typeof handlers.onEvent === 'function') handlers.onEvent(item);

          if (item.event === 'token') {
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
            reject(error);
          }
        });
      });

      res.on('end', () => {
        const parsed = parseSseBuffer(rest.endsWith('\n\n') ? rest : `${rest}\n\n`);
        parsed.events.forEach((item) => {
          events.push(item);
          if (typeof handlers.onEvent === 'function') handlers.onEvent(item);
        });
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
    });

    req.on('timeout', () => {
      req.destroy(new Error('Sheikha extension streaming timeout after 90s'));
    });

    req.on('error', (error) => {
      if (!ended) reject(error);
    });
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

function buildLocalChatFallbackAnswer(message, reason = '') {
  const text = String(message || '');
  const reasonLine = reason ? `\n\nسبب التحويل الاحتياطي: ${reason}` : '';

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

  return [
    'بسم الله الرحمن الرحيم',
    '',
    'أنا شيخة.',
    '',
    'تعذر وصول رد JSON صالح من البوابة، لكن الشات لم يتوقف. انتقلت إلى المسار الاحتياطي المحلي حتى يبقى الحوار عمليًا.',
    '',
    'أعد إرسال المطلوب بصيغة مباشرة، أو اطلب: "حلل الحالة"، "أصلح الخطأ"، "اكتب تقرير"، أو "افحص المنظومة".',
    reasonLine
  ].filter(Boolean).join('\n');
}

async function sendExtensionChat(message, options = {}) {
  const text = String(message || '');
  const primaryBaseUrl = options.baseUrl || DEFAULT_BASE_URL;
  const smartRoute = decideSmartRoute(text, options.mode || 'smart');
  const workspace = collectWorkspaceContext();
  const vscodeTools = collectVSCodeToolContext();
  const diagnosticRequested = isInspectorRequest(text);
  const inspectorSnapshot = diagnosticRequested
    ? await getEnterpriseInspectorStatus({ baseUrl: primaryBaseUrl })
    : undefined;

  const payload = {
    message: text,
    mode: options.mode || smartRoute.mode || (/كود|برمج|اصلح|fix|code|test|error|patch|دبق|debug/i.test(text) ? 'code' : 'chat'),
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
    history: Array.isArray(options.history) ? options.history.slice(-8) : []
  };
  const greetingAllowed = options.greetingAllowed !== false;

  try {
    if (options.streaming !== false) {
      try {
        const streamed = await postSse(STREAMING_CHAT_APEX_STREAM_ENDPOINT, {
          ...payload,
          transport: 'SSE',
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
  DEFAULT_BASE_URL,
  LOCAL_BASE_URL,
  INSPECTOR_STATUS_ENDPOINT,
  EXTENSION_EXPERIENCE_STATUS_ENDPOINT,
  VITAL_CHAT_APEX_STATUS_ENDPOINT,
  DEBUGGING_APEX_STATUS_ENDPOINT,
  CHAT_INTERFACE_APEX_STATUS_ENDPOINT,
  IDE_APEX_STATUS_ENDPOINT,
  TECHNICAL_CAPABILITY_APEX_STATUS_ENDPOINT,
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
  getExtensionExperienceStatus,
  getVitalChatApexStatus,
  getDebuggingApexStatus,
  getChatInterfaceApexStatus,
  getIdeApexStatus,
  getTechnicalCapabilityApexStatus,
  getStreamingChatApexStatus,
  getExtensionStreamingArtifactApexStatus,
  buildLocalChatFallbackAnswer,
  parseSseBuffer,
  parseSseEvent,
  isLocalBaseUrl,
  isInspectorRequest,
  safeJsonParse,
  shouldUseUnifiedFallback
};
