'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  buildCommercialOperatingStatus,
  buildFeasibilityScenario,
  evaluateExperiment,
} = require('../runtime/sheikha-studio/core/sheikha-commercial-operating-system-v1');
const { buildSheikha360Status } = require('../runtime/sheikha-studio/core/sheikha-360-reality-bridge-v1');
const {
  buildCustomerExperience5DStatus,
  evaluateCustomerExperience5D,
} = require('../runtime/sheikha-studio/core/sheikha-customer-experience-5d-v1');
const { handleConversation } = require('../runtime/conversation-engine/sheikha-conversation-engine-v1');
const {
  buildUnifiedRuntimeStatus,
  buildSourceBoundContinuation,
} = require('../runtime/sheikha-studio/core/sheikha-unified-runtime-v1');

const router = express.Router();
router.use(express.json({ limit: '64kb' }));
const publicChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, status: 'PUBLIC_CHAT_RATE_LIMITED' },
});

const AUDIENCE_PROFILES = new Set(['adult', 'university', 'student', 'child', 'professional']);
const CHAT_DOMAINS = new Set(['general', 'education', 'science', 'business', 'faith']);

function deterministicPublicAnswer(prompt, domain) {
  if (domain === 'business' && /نقطة\s*التعادل|break[ -]?even/iu.test(prompt)) {
    return 'نقطة التعادل هي عدد المبيعات الذي تتساوى عنده الإيرادات مع مجموع التكاليف، فتكون النتيجة التشغيلية صفرًا. وتحسب للوحدات هكذا: التكاليف الثابتة ÷ (سعر الوحدة - التكلفة المتغيرة للوحدة).';
  }
  if (domain === 'business' && /هامش\s*المساهمة|contribution margin/iu.test(prompt)) {
    return 'هامش المساهمة هو سعر البيع ناقص التكلفة المتغيرة. ويستخدم لتغطية التكاليف الثابتة، ثم يتحول ما يزيد بعد ذلك إلى نتيجة تشغيلية موجبة.';
  }
  if (domain === 'business' && /ضريبة\s*القيمة\s*المضافة|VAT/iu.test(prompt)) {
    return 'ضريبة القيمة المضافة مبلغ يُحصّل عند انطباق النظام ويورّد للجهة المختصة، وليست إيرادًا للمنشأة. النسبة القياسية في السعودية 15%، مع ضرورة التحقق من حالة التسجيل ونوع التوريد.';
  }
  return null;
}

router.get('/api/sheikha/commercial-os/v1/status', (_req, res) => {
  res.json({
    ok: true,
    data: buildCommercialOperatingStatus(),
    reality: buildSheikha360Status(),
    runtime: buildUnifiedRuntimeStatus(),
  });
});

router.get('/api/sheikha/runtime/v1/status', (_req, res) => {
  res.json({ ok: true, data: buildUnifiedRuntimeStatus() });
});

router.post('/api/sheikha/runtime/v1/sequence/plan', (req, res) => {
  const result = buildSourceBoundContinuation(req.body || {});
  res.status(result.status === 'CONCRETE_GOAL_EVIDENCE_REQUIRED' ? 422 : 200)
    .json({ ok: result.status !== 'CONCRETE_GOAL_EVIDENCE_REQUIRED', data: result });
});

router.get('/api/sheikha/commercial-os/v1/experience-5d/status', (_req, res) => {
  res.json({ ok: true, data: buildCustomerExperience5DStatus() });
});

router.post('/api/sheikha/commercial-os/v1/experience-5d/evaluate', (req, res) => {
  const result = evaluateCustomerExperience5D(req.body || {});
  res.status(result.status === 'EVIDENCE_REQUIRED' ? 422 : 200).json({ ok: result.status !== 'EVIDENCE_REQUIRED', data: result });
});

router.get('/api/sheikha/commercial-os/v1/feasibility', (req, res) => {
  const result = buildFeasibilityScenario(req.query || {});
  res.status(result.status === 'FIXED_PRICE_OFFER_REQUIRED' ? 422 : 200).json({ ok: result.status !== 'FIXED_PRICE_OFFER_REQUIRED', data: result });
});

router.get('/api/sheikha/commercial-os/v1/experiment', (req, res) => {
  const result = evaluateExperiment(req.query || {});
  res.status(result.status === 'EXPERIMENT_EVIDENCE_REQUIRED' ? 422 : 200).json({ ok: result.status !== 'EXPERIMENT_EVIDENCE_REQUIRED', data: result });
});

router.post('/api/sheikha/commercial-os/v1/public-chat', publicChatLimiter, async (req, res) => {
  const prompt = String(req.body?.prompt || req.body?.message || '').trim();
  const audience = String(req.body?.audienceProfile || 'adult');
  const domain = String(req.body?.domain || 'general');
  if (!prompt || !AUDIENCE_PROFILES.has(audience) || !CHAT_DOMAINS.has(domain)) {
    return res.status(400).json({ ok: false, status: 'VALID_CHAT_SCOPE_REQUIRED' });
  }
  if (audience === 'child' && req.body?.guardianConsent !== true) {
    return res.status(403).json({ ok: false, status: 'GUARDIAN_SUPERVISION_CONFIRMATION_REQUIRED' });
  }
  const deterministicAnswer = deterministicPublicAnswer(prompt, domain);
  if (deterministicAnswer) {
    return res.json({
      ok: true,
      data: {
        answer: deterministicAnswer,
        route: 'SHEIKHA_VERIFIED_PUBLIC_KNOWLEDGE_FASTPATH_V1',
        modelInvoked: false,
        highImpactActionExecuted: false,
      },
    });
  }
  const result = await handleConversation({
    message: prompt,
    prompt,
    mode: 'smart',
    channel: 'sheikha-360-public-chat',
    context: {
      source: 'sheikha-360-public-chat', audience, domain,
      noAutomatedFatwa: true,
      noHighImpactExecution: true,
      educationOnlyForFaithDomain: domain === 'faith',
    },
  });
  return res.status(result.blocked ? 403 : 200).json({ ok: !result.blocked, data: result });
});

module.exports = router;
