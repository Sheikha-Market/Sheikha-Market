'use strict';

const express = require('express');
const { handleConversation } = require(
  '../../runtime/conversation-engine/sheikha-conversation-engine-v1'
);
const streamingChatApex = require(
  '../../runtime/streaming-chat-apex/v1/sheikha-streaming-chat-apex-v1'
);

const router = express.Router();

router.use(express.json({ limit: '5mb' }));

router.get('/api/sheikha/streaming-chat-apex/v1/status', (_req, res) => {
  res.json({ success: true, data: streamingChatApex.status() });
});

router.post('/api/sheikha/streaming-chat-apex/v1/chat', async (req, res) => {
  const response = await handleConversation({
    ...(req.body || {}),
    channel: req.body?.channel || 'streaming-chat-apex',
    streamingRequested: true
  });
  const message = String(req.body?.message || req.body?.prompt || req.body?.text || '');

  res.status(response.blocked ? 403 : 200).json({
    ...response,
    streamingApex: streamingChatApex.status().system,
    language: streamingChatApex.detectLanguageProfile(message)
  });
});

router.post('/api/sheikha/streaming-chat-apex/v1/stream', async (req, res) => {
  const startedAt = new Date().toISOString();

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  try {
    const payload = {
      ...(req.body || {}),
      channel: req.body?.channel || 'streaming-chat-apex',
      streamingRequested: true
    };
    const response = await handleConversation(payload);
    const meta = streamingChatApex.buildStreamMeta({ payload, response, startedAt });
    const chunks = streamingChatApex.chunkText(response.answer || response.message || '');

    res.write(streamingChatApex.sseFrame('meta', meta));
    chunks.forEach((chunk, index) => {
      res.write(streamingChatApex.sseFrame('token', {
        index,
        text: chunk,
        direction: meta.language.direction,
        language: meta.language.language
      }));
    });
    res.write(streamingChatApex.sseFrame('done', {
      success: response.success === true,
      blocked: Boolean(response.blocked),
      chunks: chunks.length,
      completedAt: new Date().toISOString()
    }));
    res.end();
  } catch (error) {
    res.write(streamingChatApex.sseFrame('error', {
      success: false,
      error: error.message,
      completedAt: new Date().toISOString()
    }));
    res.end();
  }
});

module.exports = router;
