'use strict';

const express = require('express');
const http = require('http');
const router = express.Router();

const {
  status,
  resolveLiveProfile,
  shouldUseFastArabicDefault,
  buildFastArabicReply,
  buildPrompt
} = require('../../runtime/live-realtime-fabric/v1/sheikha-live-realtime-fabric-v1');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
let backgroundDeepInFlight = false;

// SHEIKHA_LIVE_REQUEST_METRICS_V1
const liveRequestMetrics = {
  totalOllamaRequests: 0,
  activeOllamaRequests: 0,
  completedOllamaRequests: 0,
  abortedOllamaRequests: 0,
  timedOutOllamaRequests: 0,
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
    liveRequestMetrics: snapshotLiveRequestMetrics()
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

function streamOllama({ message, mode, profile, res }) {
  // SHEIKHA_LIVE_ABORT_CONTROLLER_NORMALIZATION_V1
  const liveProfile = profile || resolveLiveProfile(message, mode);
  const model = liveProfile.model;
  const body = JSON.stringify({
    model,
    prompt: buildPrompt(message, liveProfile),
    stream: true,
    keep_alive: process.env.SHEIKHA_LIVE_KEEP_ALIVE || '30m',
    options: {
      temperature: liveProfile.temperature,
      top_p: liveProfile.topP,
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

      case 'failed':
        liveRequestMetrics.failedOllamaRequests += 1;
        break;

      default:
        liveRequestMetrics.closedOllamaRequests += 1;
        break;
    }
  };

  let clientClosed = false;
  let firstTokenSeen = false;

  const isSseOpen = () => (
    !clientClosed &&
    isSseWritable(res)
  );
  const firstTokenGuard = setTimeout(() => {
    if (!firstTokenSeen && isSseOpen()) {
      sendSse(res, 'model_wait', {
        success: true,
        waitingForFirstToken: true,
        model,
        liveProfile: liveProfile.name,
        firstTokenTargetMs: liveProfile.firstTokenTargetMs
      });
    }
  }, liveProfile.firstTokenTargetMs);

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

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const frame = JSON.parse(line);
          if (frame.response) {
            let tokenText = frame.response;

            if (!sameLanguageGateOpen) {
              sameLanguagePending += tokenText;
              const arabicIndex = sameLanguagePending.search(/[\u0600-\u06FF]/);

              if (arabicIndex === -1) {
                continue;
              }

              sameLanguageGateOpen = true;
              tokenText = sameLanguagePending.slice(arabicIndex);
              sameLanguagePending = '';
            }

            firstTokenSeen = true;
            sendSse(res, 'token', { text: tokenText });
          }
          if (frame.done) {
            settleLiveRequestMetrics('completed');
            clearTimeout(firstTokenGuard);
            sendSse(res, 'done', {
              success: true,
              model,
              doneReason: frame.done_reason || 'stop'
            });
            res.end();
          }
        } catch (_) {}
      }
    });

    ollamaRes.on('end', () => {
      clearTimeout(firstTokenGuard);
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
  const model = profile.deepArabicModel ||
    process.env.SHEIKHA_OLLAMA_MODEL ||
    'Sheikha-Core:latest';

  return {
    ...profile,
    key: 'deep-response',
    name: 'EXTENSION_DEEP_ARABIC_STREAM',
    reason: `${profile.reason || 'live'}-deep-response-requested`,
    model,
    deepArabicModel: model,
    timeoutMs: Number(
      process.env.SHEIKHA_EXTENSION_DEEP_TIMEOUT_MS || 90000
    ),
    numPredict: Number(
      process.env.SHEIKHA_EXTENSION_DEEP_NUM_PREDICT || 64
    ),
    temperature: 0.15,
    topP: 0.9,
    firstTokenTargetMs: Number(
      process.env.SHEIKHA_EXTENSION_DEEP_FIRST_TOKEN_MS || 3500
    ),
    sameLanguageModel: true
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
      keep_alive: process.env.SHEIKHA_LIVE_KEEP_ALIVE || '30m',
      options: {
        temperature: 0.15,
        top_p: 0.9,
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
      (fastArabicDefault ? 'fast-inline-stream' : 'inline-stream'),
    liveProfile: profile.name,
    profileReason: profile.reason,
    fastArabicDefault,
    performanceBudget: {
      timeoutMs: profile.timeoutMs,
      numPredict: profile.numPredict,
      firstTokenTargetMs: profile.firstTokenTargetMs
    },
    placeholderRemoved: true,
    source: options.source ||
      (fastArabicDefault ? 'fast-model-inline-stream' : 'ollama-stream'),
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
  const language = req.body?.language || req.body?.locale || '';
  const profile = resolveLiveProfile(message, mode, { channel, language });
  const inputContainsArabic = containsArabicText(message);
  const fastArabicDefault = inputContainsArabic &&
    shouldUseFastArabicDefault(message, mode, {
    channel,
    language,
    fastArabic: req.body?.fastArabic,
    liveFast: req.body?.liveFast
  });
  const deepStreamRequested = channel === 'extension-chat' &&
    String(req.body?.responseMode || '').toUpperCase() ===
      'FAST_THEN_DEEP_STREAM';
  const responseProfile = deepStreamRequested
    ? createDeepStreamingProfile(profile)
    : profile;
  const responseModel = responseProfile.model;

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

  // SHEIKHA_FAST_MODEL_INLINE_STREAM_V2
  // Default live chat must stream a real fast-model answer
  // in the same SSE connection. No canned final token and
  // no duplicate background generation.
  if (fastArabicDefault && !deepStreamRequested) {
    writeFastArabicProgress(res);

    streamOllama({
      message,
      mode,
      profile,
      res
    });

    return;
  }

  if (fastArabicDefault && deepStreamRequested) {
    writeFastArabicProgress(res);
    streamOllama({
      message,
      mode,
      profile: responseProfile,
      res
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
  writeLivePrelude,
  writeFastArabicCompletion,
  writeFastArabicProgress
};

module.exports = router;
