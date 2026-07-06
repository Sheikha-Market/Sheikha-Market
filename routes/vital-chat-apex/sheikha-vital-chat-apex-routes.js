'use strict';

const express = require('express');
const vitalChatApex = require(
  '../../runtime/vital-chat-apex/v1/sheikha-vital-chat-apex-v1'
);

const router = express.Router();

router.get('/api/sheikha/vital-chat-apex/v1/status', (_req, res) => {
  res.json({ success: true, data: vitalChatApex.status() });
});

module.exports = router;
