'use strict';

const express = require('express');
const router = express.Router();
const fabric = require('../../runtime/chat-fabric-v2/sheikha-chat-fabric-v2');

router.get('/status', (_req, res) => {
  res.json({ success: true, data: fabric.status() });
});

router.post('/classify', (req, res) => {
  res.json({
    success: true,
    data: {
      route: fabric.classifyMessage(req.body?.message || ''),
      fabric: fabric.status().system
    }
  });
});

router.post('/render', (req, res) => {
  res.json({
    success: true,
    data: fabric.renderCleanResponse(req.body || {})
  });
});

module.exports = router;
