'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  makeFastAnswer
} = require('../../runtime/live-realtime-fabric/v1/sheikha-live-realtime-fabric-v1');

router.get('/api/sheikha/live-realtime-fabric/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/live/chat/v1', (req, res) => {
  const payload = {
    message: req.body?.message || '',
    mode: req.body?.mode || 'smart',
    channel: req.body?.channel || 'extension-chat',
    ts: new Date().toISOString()
  };

  const wantsJson = req.query?.format === 'json' || req.headers.accept === 'application/json';
  const text = makeFastAnswer(payload.message);

  setImmediate(async () => {
    try {
      const { execute } = require('../../runtime/autonomous-execution-bridge/v1/sheikha-autonomous-execution-bridge-v1');
      execute(payload.message, {
        mode: payload.mode,
        timeoutMs: 180000,
        numPredict: 180
      }).catch((err) => console.warn('[sheikha-live-bg-execute]', err.message));
    } catch (err) {
      console.warn('[sheikha-live-bg-load]', err.message);
    }
  });

  if (wantsJson) {
    return res.json({
      success: true,
      route: 'SHEIKHA_LIVE_REALTIME_FABRIC_L40_L45_V1',
      live: true,
      backgroundDeepEngine: true,
      answer: text,
      meta: status()
    });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send('ack', { success: true, accepted: true, startedAt: payload.ts });
  send('meta', {
    route: 'SHEIKHA_LIVE_REALTIME_FABRIC_L40_L45_V1',
    apexLevel: 45,
    blocking: false,
    backgroundDeepEngine: true
  });

  for (const part of text.split(/(\s+)/).filter(Boolean)) {
    send('token', { text: part });
  }

  send('done', { success: true });
  res.end();
});

module.exports = router;
