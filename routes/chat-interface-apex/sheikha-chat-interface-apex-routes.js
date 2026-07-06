'use strict';

const express = require('express');
const chatInterfaceApex = require(
  '../../runtime/chat-interface-apex/v1/sheikha-chat-interface-apex-v1'
);

const router = express.Router();

router.get('/api/sheikha/chat-interface-apex/v1/status', (_req, res) => {
  res.json({ success: true, data: chatInterfaceApex.status() });
});

module.exports = router;
