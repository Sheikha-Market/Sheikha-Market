'use strict';

const express = require('express');
const router = express.Router();

const ROUTE = '/api/sheikha/streaming-chat-apex/v1';

function sse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function fastToken(message) {
  const text = String(message || '').trim();
  if (!text) return 'شيخة جاهزة. أرسل الأمر أو الكود المطلوب.';
  return `Sheikha live route is available. Use /api/sheikha/live/chat/v1 for real model streaming.`;
}

function runDeepEngineInBackground(payload) {
  setImmediate(async () => {
    try {
      let engine = null;
      const candidates = [
        '../../core/conversation/sheikha-conversation-engine',
        '../../core/ai/sheikha-conversation-engine',
        '../../runtime/conversation/sheikha-conversation-engine',
        '../../core/runtime/sheikha-runtime'
      ];

      for (const p of candidates) {
        try {
          const mod = require(p);
          engine = mod?.default || mod?.engine || mod;
          if (engine?.handleConversation) break;
        } catch (_) {}
      }

      if (engine?.handleConversation) {
        await engine.handleConversation(payload);
      }
    } catch (err) {
      console.warn('[sheikha-sse-background-engine]', err?.message || err);
    }
  });
}

router.get('/status', (_req, res) => {
  res.json({
    success: true,
    service: 'sheikha-streaming-chat-apex',
    mode: 'fast-sse-with-background-engine',
    status: 'ready',
    routes: [`${ROUTE}/status`, `${ROUTE}/stream`]
  });
});

router.post('/stream', (req, res) => {
  const payload = {
    message: req.body?.message || '',
    channel: req.body?.channel || 'extension-chat',
    mode: req.body?.mode || 'code',
    actor: req.body?.actor || 'vscode-extension',
    ts: new Date().toISOString()
  };

  const wantsJson =
    req.query?.format === 'json' ||
    req.headers.accept === 'application/json';

  if (wantsJson) {
    runDeepEngineInBackground(payload);
    return res.json({
      success: true,
      ack: true,
      meta: {
        route: 'streaming-chat-apex',
        mode: payload.mode,
        channel: payload.channel,
        backgroundEngine: true,
        blocking: false
      },
      token: fastToken(payload.message),
      done: true
    });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  sse(res, 'ack', {
    ok: true,
    received: true,
    ts: payload.ts
  });

  sse(res, 'meta', {
    route: 'streaming-chat-apex',
    mode: payload.mode,
    channel: payload.channel,
    backgroundEngine: true,
    blocking: false,
    principle: 'لا ضرر ولا ضرار'
  });

  sse(res, 'token', {
    text: fastToken(payload.message)
  });

  sse(res, 'done', {
    ok: true,
    backgroundEngineStarted: true
  });

  res.end();

  runDeepEngineInBackground(payload);
});

module.exports = router;
