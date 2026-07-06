'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  generateWithSheikhaCore
} = require('../../runtime/model-core/v1/sheikha-ollama-core-v1');

router.get('/api/sheikha/model-core/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/model-core/v1/chat', async (req, res) => {
  try {
    const result = await generateWithSheikhaCore(req.body?.message || '', {
      model: req.body?.model,
      timeoutMs: req.body?.timeoutMs || 30000
    });
    res.json(result);
  } catch (error) {
    res.status(200).json({
      success: false,
      system: 'SHEIKHA_OLLAMA_CORE_V1',
      error: error.message,
      fallback: {
        model: 'Sheikha-Least',
        answer: 'تم الاستلام. تعذر تشغيل النموذج المحلي الآن، وتم استخدام مسار Sheikha Least الاحتياطي السريع.'
      }
    });
  }
});

module.exports = router;
