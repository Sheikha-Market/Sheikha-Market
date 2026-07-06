'use strict';

const express = require('express');
const router = express.Router();
const fastpath = require('../../runtime/local-coding-fastpath/v1/sheikha-local-coding-fastpath-v1');

router.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      system: 'SHEIKHA_LOCAL_CODING_FASTPATH_V1',
      status: 'ACTIVE',
      mode: 'LOCAL_OFFLINE_CODING',
      model: process.env.SHEIKHA_LOCAL_CODING_MODEL || 'qwen2.5-coder:7b',
      noInspectorByDefault: true,
      noInternetRequired: true
    }
  });
});

router.post('/chat', async (req, res) => {
  try {
    const data = await fastpath.answer(req.body?.message || '', req.body?.context || {});
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'local_coding_fastpath_failed',
      message: error.message
    });
  }
});

module.exports = router;
