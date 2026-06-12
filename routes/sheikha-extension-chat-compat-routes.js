'use strict';

const express = require('express');
const router = express.Router();

function forwardToUnified(req, res, next) {
  req.url = '/api/sheikha/unified-chat';
  return next('route');
}

router.get('/api/sheikha/extension/chat/status', (_req, res) => {
  res.json({
    success: true,
    status: 'ACTIVE',
    route: 'SHEIKHA_EXTENSION_CHAT_COMPAT_V1',
    unifiedChat: '/api/sheikha/unified-chat',
    governedBy: 'SHEIKHA_UNIFIED_CHAT_FABRIC_V1'
  });
});

router.post('/api/sheikha/extension/chat', forwardToUnified);

module.exports = router;
