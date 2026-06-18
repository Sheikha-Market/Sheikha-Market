'use strict';

const express = require('express');
const http = require('http');
const router = express.Router();

const {
  status,
  selectLiveModel,
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

function streamOllama({ message, mode, res }) {
  const model = selectLiveModel(message, mode);
  const body = JSON.stringify({
    model,
    prompt: buildPrompt(message),
    stream: true,
    options: {
      temperature: 0.2,
      top_p: 0.9,
      num_predict: 180
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
    timeout: 180000
  }, (ollamaRes) => {
    let buffer = '';

    ollamaRes.on('data', (chunk) => {
      buffer += chunk.toString();

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const frame = JSON.parse(line);
          if (frame.response) {
            sendSse(res, 'token', { text: frame.response });
          }
          if (frame.done) {
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
      if (!res.writableEnded) {
        sendSse(res, 'done', { success: true, model });
        res.end();
      }
    });
  });

  req.on('timeout', () => {
    req.destroy(new Error('Ollama live stream timeout'));
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

router.post('/api/sheikha/live/chat/v1', (req, res) => {
  const message = req.body?.message || '';
  const mode = req.body?.mode || 'smart';
  const model = selectLiveModel(message, mode);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  sendSse(res, 'ack', {
    success: true,
    route: 'SHEIKHA_REAL_MODEL_LIVE_STREAM_L50_V1'
  });

  sendSse(res, 'meta', {
    route: 'SHEIKHA_REAL_MODEL_LIVE_STREAM_L50_V1',
    apexLevel: 50,
    model,
    placeholderRemoved: true,
    source: 'ollama-stream'
  });

  streamOllama({ message, mode, res });
});

module.exports = router;
