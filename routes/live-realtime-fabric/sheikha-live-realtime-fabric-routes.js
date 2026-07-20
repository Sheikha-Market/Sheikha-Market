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

router.get('/api/sheikha/live-realtime-fabric/v1/status', (_req, res) => {
  res.json(status());
});

function sendSse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function streamOllama({ message, mode, profile, res }) {
  const liveProfile = profile || resolveLiveProfile(message, mode);
  const model = liveProfile.model;
  const body = JSON.stringify({
    model,
    prompt: buildPrompt(message, liveProfile),
    stream: true,
    options: {
      temperature: liveProfile.temperature,
      top_p: liveProfile.topP,
      num_predict: liveProfile.numPredict
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
    timeout: liveProfile.timeoutMs
  }, (ollamaRes) => {
    let buffer = '';
    let firstTokenSeen = false;
    let sameLanguageGateOpen = !liveProfile.sameLanguageModel;
    let sameLanguagePending = '';

    const firstTokenGuard = setTimeout(() => {
      if (!firstTokenSeen && !res.writableEnded) {
        sendSse(res, 'model_wait', {
          success: true,
          waitingForFirstToken: true,
          model,
          liveProfile: liveProfile.name,
          firstTokenTargetMs: liveProfile.firstTokenTargetMs
        });
      }
    }, liveProfile.firstTokenTargetMs);

    ollamaRes.on('data', (chunk) => {
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
      if (!res.writableEnded) {
        sendSse(res, 'done', { success: true, model });
        res.end();
      }
    });
  });

  req.on('timeout', () => {
    req.destroy(new Error(`Ollama live stream timeout after ${liveProfile.timeoutMs}ms`));
  });

  req.on('error', (error) => {
    if (!res.writableEnded) {
      sendSse(res, 'error', {
        success: false,
        error: error.message,
        model
      });
      res.end();
    }
  });

  req.write(body);
  req.end();

  return model;
}

function runDeepSheikhaCoreInBackground(payload = {}, profile = {}) {
  if (process.env.SHEIKHA_LIVE_BACKGROUND_DEEP === 'false') return;

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
      options: {
        temperature: 0.15,
        top_p: 0.9,
        num_predict: Number(process.env.SHEIKHA_LIVE_BACKGROUND_NUM_PREDICT || 180)
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
    });

    req.on('timeout', () => {
      req.destroy(new Error('Sheikha live background model timeout'));
    });
    req.on('error', () => {});
    req.write(body);
    req.end();
  });
}

function writeLivePrelude(res, profile, model, fastArabicDefault = false) {
  sendSse(res, 'ack', {
    ok: true,
    success: true,
    route: profile.route,
    compatibilityRoute: profile.compatibilityRoute,
    liveFirst: true,
    mode: fastArabicDefault
      ? 'LIVE_FAST_ARABIC_FIRST'
      : 'LIVE_MODEL_STREAM'
  });

  sendSse(res, 'meta', {
    ok: true,
    profile: fastArabicDefault ? 'arabic-fast-default' : profile.name,
    route: profile.route,
    compatibilityRoute: profile.compatibilityRoute,
    apexLevel: profile.apexLevel,
    model,
    deepModel: profile.deepArabicModel || process.env.SHEIKHA_OLLAMA_MODEL || 'Sheikha-Core:latest',
    deepModelMode: fastArabicDefault ? 'background' : 'inline-stream',
    liveProfile: profile.name,
    profileReason: profile.reason,
    fastArabicDefault,
    performanceBudget: {
      timeoutMs: profile.timeoutMs,
      numPredict: profile.numPredict,
      firstTokenTargetMs: profile.firstTokenTargetMs
    },
    placeholderRemoved: true,
    source: fastArabicDefault ? 'fast-arabic-default' : 'ollama-stream',
    deepLayerEscalationAvailable: profile.deepLayerEscalationAvailable
  });

  sendSse(res, 'heartbeat', {
    success: true,
    live: true,
    route: profile.route,
    ts: new Date().toISOString()
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
  const model = profile.model;
  const fastArabicDefault = shouldUseFastArabicDefault(message, mode, {
    channel,
    language,
    fastArabic: req.body?.fastArabic,
    liveFast: req.body?.liveFast
  });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  writeLivePrelude(res, profile, model, fastArabicDefault);

  if (fastArabicDefault) {
    writeFastArabicCompletion(res, message);
    runDeepSheikhaCoreInBackground({
      message,
      mode,
      channel,
      language
    }, profile);
    return;
  }

  streamOllama({ message, mode, profile, res });
});

router.__test = {
  writeLivePrelude,
  writeFastArabicCompletion
};

module.exports = router;

/*
 * Sheikha Clean Checkout nested canonical export bridge.
 * Canonical source: afd0638146da8e536aa279fd5ba5c32120164853
 * Preserves the current Live Route and __test object.
 */
(() => {
  const canonicalRoute = require('./sheikha-live-realtime-fabric-routes-clean-checkout-canonical-v1');
  const exportPath = ["__test","createDeepStreamingProfile"];
  const getPath = (root, parts) => {
    let current = root;
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }
    return current;
  };
  const setPath = (root, parts, value) => {
    let current = root;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];
      if (
        !current[part]
        || typeof current[part] !== "object"
      ) {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  };
  const canonicalValue = getPath(canonicalRoute, exportPath);
  if (typeof canonicalValue !== "function") {
    throw new TypeError(
      "Canonical deep streaming profile export is not a function"
    );
  }
  if (typeof getPath(module.exports, exportPath) !== "function") {
    setPath(module.exports, exportPath, canonicalValue);
  }
})();
