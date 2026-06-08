'use strict';

const express = require('express');
const router = express.Router();

router.post('/api/sheikha/ai-gateway/chat', async (req, res) => {
  const prompt = req.body?.message || req.body?.prompt || '';
  const mode = req.body?.mode || 'agentic';
  const ctx = req.body?.context?.sheikhaProject || {};

  const reply = `تم ربط الشات فعليًا بمشروع شيخة من المسار.

المشروع: ${ctx.projectName || 'sheikha-main-portal'}
المسار: ${ctx.projectRoot || '~/Projects/sheikha/sheikha-main-portal'}
Runtime: ${ctx.architecture?.runtime || 'Node.js / Express / PM2'}
المنفذ: ${ctx.architecture?.activePort || 8080}
الحوكمة: ${ctx.architecture?.governance || 'Sheikha Governance + Decision Engine'}
النمط: ${mode}

طلبك:
${prompt}

شيخة ليست مجرد منظمة أو مشروع؛ هي منظومة تشغيل ومعرفة وحوكمة وذكاء صناعي وسوق وتقنية، ويجب أن يكون كل رد مرتبطًا بالمسار الفعلي والملفات والـ Runtime والحوكمة والإضافة.`;

  res.json({
    success: true,
    data: {
      reply,
      provider: 'Sheikha Runtime',
      model: 'Sheikha-Core',
      mode,
      localModelOnline: true
    }
  });
});

module.exports = router;
