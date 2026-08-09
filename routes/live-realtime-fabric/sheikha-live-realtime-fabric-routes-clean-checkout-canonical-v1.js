'use strict';

const express = require('express');
const http = require('node:http');
const router = express.Router();

const {
  status,
  resolveLiveProfile,
  shouldUseFastArabicDefault,
  buildFastArabicReply,
  buildGovernedLocalFallbackReply,
  buildGovernedShellReviewReply,
  buildGovernedOperationalEvidenceReply,
  buildGovernedContextualReportReply,
  buildPrompt,
  extractExactOutputContract
} = require('../../runtime/live-realtime-fabric/v1/sheikha-live-realtime-fabric-v1');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
let backgroundDeepInFlight = false;
let liveArabicWarmupInFlight = null;
const liveArabicWarmup = {
  enabled: process.env.SHEIKHA_LIVE_ARABIC_WARMUP !== 'false',
  status: 'NOT_STARTED',
  model: null,
  startedAt: null,
  completedAt: null,
  durationMs: null,
  error: null
};

// SHEIKHA_LIVE_REQUEST_METRICS_V1
const liveRequestMetrics = {
  totalOllamaRequests: 0,
  activeOllamaRequests: 0,
  completedOllamaRequests: 0,
  abortedOllamaRequests: 0,
  timedOutOllamaRequests: 0,
  localFallbackOllamaRequests: 0,
  failedOllamaRequests: 0,
  closedOllamaRequests: 0,
  lastOutcome: null,
  lastReason: null,
  lastStartedAt: null,
  lastSettledAt: null
};

function snapshotLiveRequestMetrics() {
  return {
    ...liveRequestMetrics
  };
}


// SHEIKHA_LANGUAGE_AWARE_MODEL_ROUTING_V3
function containsArabicText(value = '') {
  return /[\u0600-\u06ff]/u.test(String(value || ''));
}

router.get('/api/sheikha/live-realtime-fabric/v1/status', (_req, res) => {
  res.json({
    ...status(),
    liveRequestMetrics: snapshotLiveRequestMetrics(),
    liveArabicWarmup: { ...liveArabicWarmup }
  });
});

function isSseWritable(res) {
  return Boolean(
    res &&
    !res.writableEnded &&
    !res.destroyed
  );
}

function sendSse(res, event, data) {
  if (!isSseWritable(res)) return false;

  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);

  return true;
}

function resolveModelFirstTokenHardTimeoutMs(liveProfile = {}) {
  const profileBudget = Number(
    liveProfile.modelFirstTokenHardTimeoutMs
  );
  const globalBudget = Number(
    process.env.SHEIKHA_LIVE_MODEL_FIRST_TOKEN_HARD_TIMEOUT_MS
  );
  const selectedBudget =
    liveProfile.modelFirstTokenHardTimeoutAuthoritative === true
      ? profileBudget
      : globalBudget || profileBudget || 12000;

  return Math.max(1000, selectedBudget || 12000);
}

function shouldUseDeepExtensionStream(channel = '', responseMode = '') {
  return String(channel).toLowerCase() === 'extension-chat' &&
    String(responseMode).toUpperCase() !== 'FAST_ONLY';
}

function parseOllamaStreamLine(line = '') {
  const trimmedLine = String(line || '').trim();

  if (!trimmedLine) return null;

  try {
    const parsed = JSON.parse(trimmedLine);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function applyOllamaStreamFrame(frame = {}, state = {}) {
  if (!frame || typeof frame !== 'object') return;

  if (frame.response) {
    let tokenText = frame.response;

    if (!state.sameLanguageGateOpen) {
      state.sameLanguagePending += tokenText;
      const arabicIndex = state.sameLanguagePending.search(/[\u0600-\u06FF]/u);

      if (arabicIndex === -1) {
        return;
      }

      state.sameLanguageGateOpen = true;
      tokenText = state.sameLanguagePending.slice(arabicIndex);
      state.sameLanguagePending = '';
    }

    state.userVisibleTokenSeen = true;
    state.modelTokenSeen = true;
    clearTimeout(state.firstTokenGuard);
    clearTimeout(state.modelFirstTokenGuard);
    sendSse(state.res, 'token', { text: tokenText });
  }

  if (frame.done) {
    state.settleLiveRequestMetrics('completed');
    clearTimeout(state.firstTokenGuard);
    clearTimeout(state.modelFirstTokenGuard);
    sendSse(state.res, 'done', {
      success: true,
      model: state.model,
      doneReason: frame.done_reason || 'stop'
    });
    state.res.end();
  }
}

function consumeOllamaStreamBuffer(buffer = '', state = {}) {
  const lines = String(buffer).split('\n');
  const remainder = lines.pop() || '';

  for (const line of lines) {
    if (!line.trim()) continue;

    const frame = parseOllamaStreamLine(line);
    if (!frame) continue;

    applyOllamaStreamFrame(frame, state);
  }

  return remainder;
}

function warmLiveArabicModel() {
  if (!liveArabicWarmup.enabled) {
    liveArabicWarmup.status = 'DISABLED';
    return Promise.resolve({ ...liveArabicWarmup });
  }
  if (liveArabicWarmupInFlight) return liveArabicWarmupInFlight;

  const profile = resolveLiveProfile('', 'chat', {
    channel: 'extension-chat',
    language: 'ar'
  });
  const model = profile.deepArabicModel || profile.model;
  const keepAlive = process.env.SHEIKHA_LIVE_KEEP_ALIVE || '2h';
  const body = JSON.stringify({
    model,
    prompt: '',
    stream: false,
    keep_alive: keepAlive,
    options: {
      num_ctx: Number(process.env.SHEIKHA_EXTENSION_DEEP_NUM_CTX || 1024),
      num_thread: Number(process.env.SHEIKHA_LIVE_NUM_THREAD || 16)
    }
  });
  const url = new URL('/api/generate', OLLAMA_HOST);
  const startedAtMs = Date.now();

  liveArabicWarmup.status = 'IN_PROGRESS';
  liveArabicWarmup.model = model;
  liveArabicWarmup.startedAt = new Date(startedAtMs).toISOString();
  liveArabicWarmup.completedAt = null;
  liveArabicWarmup.durationMs = null;
  liveArabicWarmup.error = null;

  liveArabicWarmupInFlight = new Promise((resolve) => {
    let settled = false;
    const finish = (nextStatus, error = null) => {
      if (settled) return;
      settled = true;
      liveArabicWarmup.status = nextStatus;
      liveArabicWarmup.completedAt = new Date().toISOString();
      liveArabicWarmup.durationMs = Date.now() - startedAtMs;
      liveArabicWarmup.error = error ? error.message : null;
      liveArabicWarmupInFlight = null;
      resolve({ ...liveArabicWarmup });
    };

    const warmupReq = http.request({
      hostname: url.hostname,
      port: url.port || 11434,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: Number(process.env.SHEIKHA_LIVE_WARMUP_TIMEOUT_MS || 120000)
    }, (warmupRes) => {
      warmupRes.resume();
      warmupRes.once('end', () => {
        finish(
          warmupRes.statusCode >= 200 && warmupRes.statusCode < 300
            ? 'READY'
            : 'FAILED',
          warmupRes.statusCode >= 200 && warmupRes.statusCode < 300
            ? null
            : new Error(`Ollama warmup HTTP ${warmupRes.statusCode}`)
        );
      });
    });

    warmupReq.on('timeout', () => {
      const error = new Error('Ollama Arabic model warmup timed out');
      finish('FAILED', error);
      warmupReq.destroy(error);
    });
    warmupReq.on('error', (error) => finish('FAILED', error));
    warmupReq.write(body);
    warmupReq.end();
  });

  return liveArabicWarmupInFlight;
}

function streamOllama({
  message,
  mode,
  profile,
  res,
  initialTokenSent = false
}) {
  // SHEIKHA_LIVE_ABORT_CONTROLLER_NORMALIZATION_V1
  const liveProfile = profile || resolveLiveProfile(message, mode);
  const model = liveProfile.model;
  const body = JSON.stringify({
    model,
    prompt: buildPrompt(message, liveProfile),
    stream: true,
    keep_alive: process.env.SHEIKHA_LIVE_KEEP_ALIVE || '2h',
    options: {
      temperature: liveProfile.temperature,
      top_p: liveProfile.topP,
      num_ctx: liveProfile.numCtx || 1024,
      num_thread: liveProfile.numThread || 16,
      num_predict: liveProfile.numPredict
    }
  });

  const url = new URL('/api/generate', OLLAMA_HOST);
  const abortController = new AbortController();

  liveRequestMetrics.totalOllamaRequests += 1;
  liveRequestMetrics.activeOllamaRequests += 1;
  liveRequestMetrics.lastStartedAt = new Date().toISOString();

  let requestMetricsSettled = false;

  const settleLiveRequestMetrics = (
    outcome,
    reason = null
  ) => {
    if (requestMetricsSettled) return;

    requestMetricsSettled = true;

    liveRequestMetrics.activeOllamaRequests = Math.max(
      0,
      liveRequestMetrics.activeOllamaRequests - 1
    );

    liveRequestMetrics.lastOutcome = outcome;
    liveRequestMetrics.lastReason = reason;
    liveRequestMetrics.lastSettledAt =
      new Date().toISOString();

    switch (outcome) {
      case 'completed':
        liveRequestMetrics.completedOllamaRequests += 1;
        break;

      case 'aborted':
        liveRequestMetrics.abortedOllamaRequests += 1;
        break;

      case 'timeout':
        liveRequestMetrics.timedOutOllamaRequests += 1;
        break;

      case 'local-fallback':
        liveRequestMetrics.localFallbackOllamaRequests += 1;
        break;

      case 'failed':
        liveRequestMetrics.failedOllamaRequests += 1;
        break;

      default:
        liveRequestMetrics.closedOllamaRequests += 1;
        break;
    }
  };

  let clientClosed = false;
  let userVisibleTokenSeen = initialTokenSent;
  let modelTokenSeen = false;

  const isSseOpen = () => (
    !clientClosed &&
    isSseWritable(res)
  );
  const firstTokenGuard = setTimeout(() => {
    if (!modelTokenSeen && isSseOpen()) {
      sendSse(res, 'model_wait', {
        success: true,
        waitingForFirstToken: true,
        contextualOpeningVisible: userVisibleTokenSeen,
        model,
        liveProfile: liveProfile.name,
        firstTokenTargetMs: liveProfile.firstTokenTargetMs
      });
    }
  }, liveProfile.firstTokenTargetMs);
  const modelFirstTokenHardTimeoutMs =
    resolveModelFirstTokenHardTimeoutMs(liveProfile);
  const modelFirstTokenGuard = setTimeout(() => {
    if (modelTokenSeen || !isSseOpen()) return;

    const budgetError = new Error(
      'Ollama first model token exceeded governed budget ' +
      `${modelFirstTokenHardTimeoutMs}ms`
    );

    settleLiveRequestMetrics('local-fallback', budgetError.message);
    clearTimeout(firstTokenGuard);
    writeGovernedFallbackCompletion(res, message, {
      model,
      budgetMs: modelFirstTokenHardTimeoutMs
    });

    if (!abortController.signal.aborted) {
      abortController.abort(budgetError);
    }
    if (!req.destroyed) {
      req.destroy(budgetError);
    }
  }, modelFirstTokenHardTimeoutMs);

  const req = http.request({
    hostname: url.hostname,
    port: url.port || 11434,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    signal: abortController.signal,
    timeout: liveProfile.timeoutMs
  }, (ollamaRes) => {
    let buffer = '';
    let sameLanguageGateOpen = !liveProfile.sameLanguageModel;
    let sameLanguagePending = '';

    ollamaRes.on('data', (chunk) => {
      if (!isSseOpen()) return;

      buffer += chunk.toString();

      const streamState = {
        res,
        model,
        sameLanguageGateOpen,
        sameLanguagePending,
        userVisibleTokenSeen,
        modelTokenSeen,
        firstTokenGuard,
        modelFirstTokenGuard,
        settleLiveRequestMetrics
      };

      buffer = consumeOllamaStreamBuffer(buffer, streamState);

      sameLanguageGateOpen = streamState.sameLanguageGateOpen;
      sameLanguagePending = streamState.sameLanguagePending;
      userVisibleTokenSeen = streamState.userVisibleTokenSeen;
      modelTokenSeen = streamState.modelTokenSeen;
    });

    ollamaRes.on('end', () => {
      clearTimeout(firstTokenGuard);
      clearTimeout(modelFirstTokenGuard);
      settleLiveRequestMetrics('completed');

      if (isSseOpen()) {
        sendSse(res, 'done', {
          success: true,
          model
        });

        res.end();
      }
    });
  });

  req.once('close', () => {
    if (!requestMetricsSettled) {
      settleLiveRequestMetrics(
        abortController.signal.aborted
          ? 'aborted'
          : 'closed',
        abortController.signal.reason?.message || null
      );
    }
  });

  req.on('timeout', () => {
    clearTimeout(firstTokenGuard);
    clearTimeout(modelFirstTokenGuard);

    const timeoutError = new Error(
      `Ollama live stream timeout after ${liveProfile.timeoutMs}ms`
    );

    settleLiveRequestMetrics(
      'timeout',
      timeoutError.message
    );

    if (!abortController.signal.aborted) {
      abortController.abort(timeoutError);
    }

    if (!req.destroyed) {
      req.destroy(timeoutError);
    }
  });

  req.on('error', (error) => {
    clearTimeout(firstTokenGuard);
    clearTimeout(modelFirstTokenGuard);

    settleLiveRequestMetrics(
      (
        clientClosed ||
        abortController.signal.aborted
      )
        ? 'aborted'
        : 'failed',
      error.message
    );

    if (
      clientClosed &&
      abortController.signal.aborted
    ) {
      return;
    }

    if (isSseOpen()) {
      sendSse(res, 'error', {
        success: false,
        error: error.message,
        model
      });
      res.end();
    }
  });

  res.once('close', () => {
    clearTimeout(firstTokenGuard);
    clearTimeout(modelFirstTokenGuard);

    // close is also emitted after a normal res.end().
    if (res.writableEnded) return;

    clientClosed = true;

    const disconnectError = new Error(
      'Sheikha live client disconnected'
    );

    settleLiveRequestMetrics(
      'aborted',
      disconnectError.message
    );

    if (!abortController.signal.aborted) {
      abortController.abort(disconnectError);
    }

    // Keep request.destroy as a fail-safe for Node HTTP transports.
    if (!req.destroyed) {
      req.destroy(disconnectError);
    }
  });

  req.write(body);
  req.end();

  return model;
}

function createDeepStreamingProfile(profile = {}) {
  // الـ deep streaming يستخدم نموذج الجودة المحلي المحدد (code model) دائماً
  const model =
    process.env.SHEIKHA_LIVE_CODE_MODEL ||
    'qwen2.5-coder:7b';

  return {
    ...profile,
    key: 'deep-response',
    name: 'EXTENSION_DEEP_ARABIC_STREAM',
    reason: `${profile.reason || 'live'}-deep-response-requested`,
    model,
    deepArabicModel: model,
    timeoutMs: Number(
      process.env.SHEIKHA_EXTENSION_DEEP_TIMEOUT_MS || 120000
    ),
    numPredict: Number(
      process.env.SHEIKHA_EXTENSION_DEEP_NUM_PREDICT || 64
    ),
    numCtx: Number(
      process.env.SHEIKHA_EXTENSION_DEEP_NUM_CTX || 1024
    ),
    numThread: Number(process.env.SHEIKHA_LIVE_NUM_THREAD || 16),
    temperature: 0.15,
    topP: 0.9,
    firstTokenTargetMs: Number(
      process.env.SHEIKHA_EXTENSION_DEEP_FIRST_TOKEN_MS || 3500
    ),
    modelFirstTokenHardTimeoutMs: Number(
      process.env
        .SHEIKHA_EXTENSION_DEEP_FIRST_MODEL_TOKEN_TIMEOUT_MS ||
      75000
    ),
    modelFirstTokenHardTimeoutAuthoritative: true,
    sameLanguageModel: profile.outputLanguage === 'ar' ||
      profile.sameLanguageModel === true
  };
}

function runDeepSheikhaCoreInBackground(payload = {}, profile = {}) {
  if (process.env.SHEIKHA_LIVE_BACKGROUND_DEEP === 'false') return;
  if (backgroundDeepInFlight) return;
  backgroundDeepInFlight = true;

  setImmediate(() => {
    const model = profile.deepArabicModel ||
      process.env.SHEIKHA_OLLAMA_MODEL ||
      'Sheikha-Core:latest';
    const body = JSON.stringify({
      model,
      prompt: buildPrompt(payload.message || '', {
        ...profile,
        name: 'BACKGROUND_DEEP_ARABIC'
      }),
      stream: false,
      keep_alive: process.env.SHEIKHA_LIVE_KEEP_ALIVE || '2h',
      options: {
        temperature: 0.15,
        top_p: 0.9,
        num_ctx: Number(process.env.SHEIKHA_LIVE_BACKGROUND_NUM_CTX || 1024),
        num_thread: Number(process.env.SHEIKHA_LIVE_NUM_THREAD || 16),
        num_predict: Number(process.env.SHEIKHA_LIVE_BACKGROUND_NUM_PREDICT || 64)
      }
    });
    const url = new URL('/api/generate', OLLAMA_HOST);

    const req = http.request({
      hostname: url.hostname,
      port: url.port || 11434,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: Number(process.env.SHEIKHA_LIVE_BACKGROUND_TIMEOUT_MS || 120000)
    }, (backgroundRes) => {
      backgroundRes.resume();
      backgroundRes.once('end', () => {
        backgroundDeepInFlight = false;
      });
      backgroundRes.once('close', () => {
        backgroundDeepInFlight = false;
      });
    });

    req.on('timeout', () => {
      backgroundDeepInFlight = false;
      req.destroy(new Error('Sheikha live background model timeout'));
    });
    req.on('error', () => {
      backgroundDeepInFlight = false;
    });
    req.write(body);
    req.end();
  });
}

function writeLivePrelude(
  res,
  profile,
  model,
  fastArabicDefault = false,
  options = {}
) {
  sendSse(res, 'ack', {
    ok: true,
    success: true,
    route: profile.route,
    compatibilityRoute: profile.compatibilityRoute,
    liveFirst: true,
    mode: options.mode || (fastArabicDefault
      ? 'LIVE_FAST_ARABIC_FIRST'
      : 'LIVE_MODEL_STREAM')
  });

  sendSse(res, 'meta', {
    ok: true,
    profile: options.profileName ||
      (fastArabicDefault ? 'arabic-fast-default' : profile.name),
    route: profile.route,
    compatibilityRoute: profile.compatibilityRoute,
    apexLevel: profile.apexLevel,
    model,
    deepModel: profile.deepArabicModel || process.env.SHEIKHA_OLLAMA_MODEL || 'Sheikha-Core:latest',
    deepModelMode: options.deepModelMode ||
      (
        fastArabicDefault
          ? 'available-on-explicit-escalation'
          : 'inline-stream'
      ),
    liveProfile: profile.name,
    profileReason: profile.reason,
    fastArabicDefault,
    performanceBudget: {
      timeoutMs: profile.timeoutMs,
      numCtx: profile.numCtx,
      numThread: profile.numThread,
      numPredict: profile.numPredict,
      firstTokenTargetMs: profile.firstTokenTargetMs,
      modelFirstTokenHardTimeoutMs:
        resolveModelFirstTokenHardTimeoutMs(profile),
      modelFirstTokenHardTimeoutAuthoritative:
        profile.modelFirstTokenHardTimeoutAuthoritative === true
    },
    placeholderRemoved: true,
    source: options.source ||
      (
        fastArabicDefault
          ? 'contextual-arabic-opening-then-fast-model-stream'
          : 'ollama-stream'
      ),
    deepLayerEscalationAvailable: profile.deepLayerEscalationAvailable
  });

  sendSse(res, 'heartbeat', {
    success: true,
    live: true,
    route: profile.route,
    ts: new Date().toISOString()
  });
}

function writeFastArabicProgress(res) {
  sendSse(res, 'progress', {
    ok: true,
    text: 'تم استلام الطلب، ويجري الآن توليد الإجابة الكاملة.',
    phase: 'deep-model-stream',
    finalAnswer: false
  });
}

function writeFastArabicOpening(res, message = '') {
  return sendSse(res, 'token', {
    ok: true,
    text: buildFastArabicReply(message),
    immediate: true,
    partial: true,
    source: 'local-contextual-arabic-opening'
  });
}

function writeExactOutputCompletion(res, exactOutput) {
  sendSse(res, 'token', {
    ok: true,
    text: exactOutput,
    immediate: true,
    partial: false,
    source: 'validated-exact-output-contract'
  });
  sendSse(res, 'done', {
    ok: true,
    success: true,
    route: 'EXACT_OUTPUT_CONTRACT',
    modelUsed: false
  });
  res.end();
}

function writeGovernedFallbackCompletion(
  res,
  message = '',
  options = {}
) {
  sendSse(res, 'token', {
    ok: true,
    text: buildGovernedLocalFallbackReply(message),
    immediate: false,
    partial: false,
    source: 'governed-local-time-budget-fallback'
  });
  sendSse(res, 'done', {
    ok: true,
    success: true,
    route: 'GOVERNED_LOCAL_TIME_BUDGET_FALLBACK',
    model: options.model || null,
    modelCompleted: false,
    firstModelTokenBudgetMs: options.budgetMs || null
  });
  res.end();
}

function writeGovernedLocalAnswer(res, text, route, metadata = {}) {
  sendSse(res, 'token', {
    ok: true,
    text,
    immediate: true,
    partial: false,
    source: route.toLowerCase()
  });
  sendSse(res, 'done', {
    ok: true,
    success: true,
    route,
    modelUsed: false,
    highImpactActionExecuted: false,
    ...metadata
  });
  res.end();
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

  if (errors > 0) risks.push(`${errors} أخطاء تشخيصية`);
  if (warnings > 0) risks.push(`${warnings} تحذيرًا يحتاج الفرز`);
  if (git.clean === false || changedFileCount > 0) {
    risks.push(`مساحة العمل غير نظيفة وبها ${changedFileCount} تغييرًا`);
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
    `التشخيص: ${errors} أخطاء، ${warnings} تحذيرًا، الخادم ${health.runtime || 'غير محدد'}، والإضافة ${health.extension || 'غير محددة'}.`,
    `الموارد: حمل الدقيقة ${runtime.cpuLoad1m ?? 'غير متاح'}، الذاكرة ${runtime.ramUsedPercent ?? 'غير متاح'}%، Heap ${runtime.heapUsedMb ?? 'غير متاح'}/${runtime.heapTotalMb ?? 'غير متاح'}MB.`,
    `المخاطر: ${riskText}.`,
    `الحوكمة: ${governance.status || 'غير محددة'}، والإجراءات عالية الأثر تتطلب مراجعة بشرية: ${governance.humanReviewForHighImpactActions === true ? 'نعم' : 'غير مثبت'}.`,
    'أفضل إجراء تالٍ دون أثر مرتفع: فرز التحذيرات، وتقسيم التغييرات غير المرتبطة إلى نطاقات مستقلة، ثم تشغيل الاختبارات المستهدفة وlint وفحص الأسرار قبل أي نشر أو تثبيت.',
    'لم يُنفذ أي إجراء عالي الأثر.'
  ].join('\n');
}

function writeEnterpriseInspectorCompletion(res) {
  const bodyChunks = [];
  let bodyBytes = 0;
  const inspectorReq = http.request({
    hostname: '127.0.0.1',
    port: Number(process.env.PORT || 8080),
    path: '/api/sheikha/enterprise-inspector/v3/status',
    method: 'GET',
    timeout: 8000
  }, (inspectorRes) => {
    inspectorRes.on('data', (chunk) => {
      bodyBytes += chunk.length;
      if (bodyBytes <= 1024 * 1024) bodyChunks.push(chunk);
    });
    inspectorRes.on('end', () => {
      try {
        const snapshot = JSON.parse(Buffer.concat(bodyChunks).toString('utf8'));
        writeGovernedLocalAnswer(
          res,
          buildEnterpriseInspectorArabicSummary(snapshot),
          'ENTERPRISE_INSPECTOR_READ_ONLY_ANALYSIS',
          { inspectorStatus: snapshot.status || null }
        );
      } catch (error) {
        writeGovernedLocalAnswer(
          res,
          `تعذر تفسير لقطة Enterprise Inspector: ${error.message}`,
          'ENTERPRISE_INSPECTOR_READ_FAILED'
        );
      }
    });
  });

  inspectorReq.on('timeout', () => {
    inspectorReq.destroy(new Error('Enterprise Inspector read timed out'));
  });
  inspectorReq.on('error', (error) => {
    writeGovernedLocalAnswer(
      res,
      `تعذر قراءة Enterprise Inspector دون تنفيذ أي إجراء: ${error.message}`,
      'ENTERPRISE_INSPECTOR_READ_FAILED'
    );
  });
  inspectorReq.end();
}

function writeFastArabicCompletion(res, message = '') {
  sendSse(res, 'token', {
    ok: true,
    text: buildFastArabicReply(message),
    immediate: true,
    modelWaitBlocked: false
  });

  sendSse(res, 'done', {
    ok: true,
    success: true,
    route: 'FAST_ARABIC_DEFAULT',
    deepModelMode: 'background'
  });
  res.end();
}

router.post('/api/sheikha/live/chat/v1', (req, res) => {
  const message = req.body?.message || '';
  const mode = req.body?.mode || 'smart';
  const channel = req.body?.channel || 'extension-chat';
  const language = req.body?.language || req.body?.locale ||
    (channel === 'extension-chat' ? 'ar' : '');
  const profile = resolveLiveProfile(message, mode, { channel, language });
  const inputContainsArabic = containsArabicText(message);
  const arabicResponseRequested = inputContainsArabic ||
    String(language).toLowerCase().startsWith('ar');
  const fastArabicDefault = arabicResponseRequested &&
    shouldUseFastArabicDefault(message, mode, {
    channel,
    language,
    fastArabic: req.body?.fastArabic,
    liveFast: req.body?.liveFast
  });
  const normalizedResponseMode = String(
    req.body?.responseMode || ''
  ).toUpperCase();
  const deepStreamRequested = shouldUseDeepExtensionStream(
    channel,
    normalizedResponseMode
  );
  const responseProfile = deepStreamRequested
    ? createDeepStreamingProfile(profile)
    : profile;
  const responseModel = responseProfile.model;
  const exactOutput = extractExactOutputContract(message);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  writeLivePrelude(
    res,
    responseProfile,
    responseModel,
    fastArabicDefault,
    deepStreamRequested
      ? {
          mode: 'LIVE_FAST_THEN_DEEP_STREAM',
          profileName: 'arabic-fast-then-deep',
          deepModelMode: 'inline-stream',
          source: 'extension-deep-stream'
        }
      : {}
  );

  if (exactOutput !== null) {
    writeExactOutputCompletion(res, exactOutput);
    return;
  }

  const contextualReport =
    req.body?.governedContextualReportRequested === true
      ? buildGovernedContextualReportReply(
          req.body?.reportContext,
          message
        )
      : null;
  if (contextualReport) {
    writeGovernedLocalAnswer(
      res,
      contextualReport,
      'GOVERNED_CONTEXTUAL_REPORT_FAST_PATH',
      {
        contextSource: 'conversation-history',
        reportGenerated: true
      }
    );
    return;
  }

  const operationalEvidenceReview =
    buildGovernedOperationalEvidenceReply(message);
  if (operationalEvidenceReview) {
    writeFastArabicOpening(res, message);
    writeGovernedLocalAnswer(
      res,
      operationalEvidenceReview,
      'GOVERNED_OPERATIONAL_EVIDENCE_FAST_PATH',
      { evidenceFilesRead: false }
    );
    return;
  }

  const shellReview = buildGovernedShellReviewReply(message);
  if (shellReview) {
    writeFastArabicOpening(res, message);
    writeGovernedLocalAnswer(
      res,
      shellReview,
      'GOVERNED_SHELL_REVIEW_FAST_PATH',
      { shellExecuted: false }
    );
    return;
  }

  const inspectorRequested = req.body?.diagnosticRequested === true ||
    /Enterprise Inspector|انسبكتور|المفتش المؤسسي/i.test(message);
  if (inspectorRequested) {
    writeFastArabicOpening(res, message);
    writeEnterpriseInspectorCompletion(res);
    return;
  }

  // SHEIKHA_CONTEXTUAL_ARABIC_FIRST_TOKEN_V3
  // Give the Arabic UI a semantic opening immediately, then append the
  // governed model answer in the same stream.
  if (fastArabicDefault && !deepStreamRequested) {
    const initialTokenSent = writeFastArabicOpening(res, message);

    streamOllama({
      message,
      mode,
      profile,
      res,
      initialTokenSent
    });

    return;
  }

  if (fastArabicDefault && deepStreamRequested) {
    const initialTokenSent = writeFastArabicOpening(res, message);
    streamOllama({
      message,
      mode,
      profile: responseProfile,
      res,
      initialTokenSent
    });
    return;
  }

  streamOllama({ message, mode, profile, res });
});

router.__test = {
  containsArabicText,
  snapshotLiveRequestMetrics,
  streamOllama,
  sendSse,
  isSseWritable,
  createDeepStreamingProfile,
  resolveModelFirstTokenHardTimeoutMs,
  shouldUseDeepExtensionStream,
  warmLiveArabicModel,
  writeLivePrelude,
  parseOllamaStreamLine,
  writeFastArabicCompletion,
  writeFastArabicProgress,
  writeFastArabicOpening,
  writeExactOutputCompletion,
  writeGovernedFallbackCompletion,
  writeGovernedLocalAnswer,
  buildEnterpriseInspectorArabicSummary,
  writeEnterpriseInspectorCompletion,
  buildGovernedContextualReportReply
};

const shouldWarmPrimaryRuntime =
  process.env.NODE_ENV !== 'test' &&
  String(process.env.PORT || '8080') === '8080' &&
  process.env.SHEIKHA_UNIVERSAL_API !== 'true';

if (shouldWarmPrimaryRuntime && liveArabicWarmup.enabled) {
  const warmupTimer = setTimeout(() => {
    warmLiveArabicModel().catch(() => {});
  }, 1000);
  warmupTimer.unref();
}

module.exports = router;
