'use strict';

const express = require('express');
const router = express.Router();
const {
  handleConversation,
  status
} = require('../runtime/conversation-engine/sheikha-conversation-engine-v1');

router.get('/api/sheikha/conversation-engine/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/conversation-engine/v1/chat', express.json({ limit: '5mb' }), (req, res) => {
  const result = handleConversation(req.body || {});
  res.status(result.blocked ? 403 : 200).json(result);
});

module.exports = router;
