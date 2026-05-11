/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌌🧠🤖 مسارات البكسل الذكي المدمج — Pixel AI Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31
 * ﴿ صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ ﴾ — النمل: 88
 *
 * المسارات:
 *   GET  /api/pixel-ai/status              — الحالة الموحّدة (LLM + Neural + Cosmic)
 *   POST /api/pixel-ai/process             — معالجة بالذكاء الاصطناعي الكامل
 *   POST /api/pixel-ai/neural-analyze      — تحليل بشبكة الخلايا الجذرية
 *   POST /api/pixel-ai/generate-script     — توليد سكربت بكسل ذكي (JS/Python/cURL)
 *   POST /api/pixel-ai/generate-bundle     — توليد حزمة بكسل كاملة
 *   POST /api/pixel-ai/llm-prompt          — إرسال محفز لـ LLM الراق
 *   POST /api/pixel-ai/interpret-event     — تفسير حدث بلغة طبيعية
 *   POST /api/pixel-ai/market-signal       — تحليل إشارة سوقية بالذكاء الاصطناعي
 *   POST /api/pixel-ai/activate-neural     — تفعيل شبكة الخلايا العصبية الجذرية
 *   GET  /api/pixel-ai/llm-status          — حالة LLM الراق
 *   GET  /api/pixel-ai/context             — ذاكرة السياق الحالية
 *   POST /api/pixel-ai/clear-context       — مسح السياق
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

const BISMILLAH = 'بسم الله الرحمن الرحيم';
const QURAN_REF = '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275';
const NO_HARM   = 'لا ضرر ولا ضرار';

// ─── تحميل المحركات ───────────────────────────────────────────────────────────
let integrator, llmRaqy;

try {
    integrator = require('../lib/sheikha-pixel-ai-integrator.js');
    console.log('[PIXEL-AI] 🌌 محرك الدمج الكوني محمّل —', integrator.INTEGRATOR_VERSION || '1.0.0-INTEGRATOR');
} catch (e) {
    console.error('[PIXEL-AI] ❌ فشل تحميل محرك الدمج:', e.message);
    integrator = null;
}

try {
    llmRaqy = require('../lib/sheikha-llm-al-raq.js');
    console.log('[PIXEL-AI] 🧠 LLM الراق محمّل —', llmRaqy.RAQY_VERSION || '1.0.0-RAQY');
} catch (e) {
    console.error('[PIXEL-AI] ❌ فشل تحميل LLM الراق:', e.message);
    llmRaqy = null;
}

// ─── حارس الربا الموحّد ───────────────────────────────────────────────────────
const RIBA_GUARD = /\b(riba|usury|interest[-\s]?based|compound\s*interest|apr)\b|(ربا|ربوي|فائدة\s*(ثابتة|مركبة|سنوية|بنكية)|فوائد\s*ربوية)/i;

function _norm(input) {
    return String(input || '').toLowerCase().replace(/[\u064B-\u065F\u0670]/g, '').replace(/\s+/g, ' ').trim();
}

function _extractText(req) {
    const { payload, data, text, prompt, signal, config } = req.body || {};
    const val = payload || data || text || prompt || signal || config;
    return _norm(typeof val === 'string' ? val : JSON.stringify(val || ''));
}

function _rejectRiba(res, src) {
    return res.status(403).json({
        success: false, error: 'SHARIAH_BLOCK_RIBA',
        message: 'الربا محرم — رُفض الطلب بواسطة درع الشريعة',
        source: src, quranRef: QURAN_REF, hadith: NO_HARM,
        timestamp: new Date().toISOString()
    });
}

// حارس قبل كل POST
router.use((req, res, next) => {
    if (req.method !== 'POST') return next();
    if (RIBA_GUARD.test(_extractText(req))) return _rejectRiba(res, 'pixel-ai-guard');
    return next();
});

// مساعد التحقق
function _check(res, engine, name) {
    if (!engine) {
        res.status(503).json({ success: false, message: `${name} غير متاح`, timestamp: new Date().toISOString() });
        return false;
    }
    return true;
}

function _ok(res, data, extra = {}) {
    return res.json({ success: true, bismillah: BISMILLAH, ...extra, data, timestamp: new Date().toISOString() });
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /status — الحالة الموحّدة لجميع الطبقات
// ══════════════════════════════════════════════════════════════════════════════
router.get('/status', (req, res) => {
    try {
        const integratorStatus = integrator ? integrator.getUnifiedStatus() : { status: 'UNAVAILABLE' };
        const llmStatus        = llmRaqy    ? llmRaqy.getStatus()           : { status: 'UNAVAILABLE' };
        return res.json({
            success:    true,
            bismillah:  BISMILLAH,
            quranRef:   QURAN_REF,
            hadith:     NO_HARM,
            system:     'Sheikha Pixel AI — محرك الدمج الكوني',
            version:    '1.0.0-INTEGRATOR',
            integrator: integratorStatus,
            llm:        llmStatus,
            endpoints: {
                process:         'POST /api/pixel-ai/process',
                neuralAnalyze:   'POST /api/pixel-ai/neural-analyze',
                generateScript:  'POST /api/pixel-ai/generate-script',
                generateBundle:  'POST /api/pixel-ai/generate-bundle',
                llmPrompt:       'POST /api/pixel-ai/llm-prompt',
                interpretEvent:  'POST /api/pixel-ai/interpret-event',
                marketSignal:    'POST /api/pixel-ai/market-signal',
                activateNeural:  'POST /api/pixel-ai/activate-neural',
                llmStatus:       'GET /api/pixel-ai/llm-status',
                context:         'GET /api/pixel-ai/context'
            },
            timestamp:  new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /process — معالجة كاملة بالذكاء الاصطناعي (SPCE + LLM)
// Body: { payload, zone?, language? }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/process', (req, res) => {
    if (!_check(res, integrator, 'محرك الدمج الكوني')) return;
    try {
        const { payload, zone, language } = req.body || {};
        if (payload === undefined || payload === null) {
            return res.status(400).json({ success: false, message: 'payload مطلوب', timestamp: new Date().toISOString() });
        }
        const result = integrator.processWithAI(payload, { zone, language });
        return _ok(res, result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /neural-analyze — تحليل بشبكة الخلايا الجذرية
// Body: { data, zone? }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/neural-analyze', (req, res) => {
    if (!_check(res, integrator, 'محرك الدمج')) return;
    try {
        const { data, zone } = req.body || {};
        if (data === undefined || data === null) {
            return res.status(400).json({ success: false, message: 'data مطلوب', timestamp: new Date().toISOString() });
        }
        const result = integrator.analyzeWithNeuralRoot(data, { zone });
        return _ok(res, result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /generate-script — توليد سكربت بكسل ذكي
// Body: { config: { eventName, domain, market, endpoint }, type: 'js'|'python'|'curl' }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/generate-script', (req, res) => {
    if (!_check(res, llmRaqy, 'LLM الراق')) return;
    try {
        const { config = {}, type = 'js' } = req.body || {};
        if (!['js', 'python', 'curl'].includes(String(type).toLowerCase())) {
            return res.status(400).json({ success: false, message: 'type يجب أن يكون: js | python | curl', timestamp: new Date().toISOString() });
        }
        const result = llmRaqy.generateScript(config, type);
        return _ok(res, result, { description: `سكربت بكسل ${result.lang_name} — مولَّد بـ LLM الراق` });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /generate-bundle — توليد حزمة بكسل كاملة (JS + Python + cURL + تحليل)
// Body: { config: { eventName, domain, market, endpoint, value? } }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/generate-bundle', (req, res) => {
    if (!_check(res, integrator, 'محرك الدمج')) return;
    try {
        const { config = {} } = req.body || {};
        const result = integrator.generatePixelBundle(config);
        return res.json({ ...result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /llm-prompt — إرسال محفز لـ LLM الراق
// Body: { prompt, language? }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/llm-prompt', (req, res) => {
    if (!_check(res, llmRaqy, 'LLM الراق')) return;
    try {
        const { prompt, language } = req.body || {};
        if (!prompt) {
            return res.status(400).json({ success: false, message: 'prompt مطلوب', timestamp: new Date().toISOString() });
        }
        const result = llmRaqy.prompt(prompt, { language });
        return _ok(res, result, { model: `LLM الراق ${llmRaqy.RAQY_VERSION || ''}` });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /interpret-event — تفسير حدث بكسل بلغة طبيعية
// Body: { event, language? }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/interpret-event', (req, res) => {
    if (!_check(res, llmRaqy, 'LLM الراق')) return;
    try {
        const { event, language } = req.body || {};
        if (!event) {
            return res.status(400).json({ success: false, message: 'event مطلوب', timestamp: new Date().toISOString() });
        }
        const result = llmRaqy.interpretPixelEvent(event, { language });
        return _ok(res, result, { description: 'تفسير حدث بكسل بلغة طبيعية — LLM الراق' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /market-signal — تحليل إشارة سوقية
// Body: { signal: { type, value, market } }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/market-signal', (req, res) => {
    if (!_check(res, llmRaqy, 'LLM الراق')) return;
    try {
        const { signal } = req.body || {};
        if (!signal || !signal.type) {
            return res.status(400).json({ success: false, message: 'signal.type مطلوب', timestamp: new Date().toISOString() });
        }
        const result = llmRaqy.analyzeMarketSignal(signal);
        return _ok(res, result, { description: 'تحليل إشارة سوقية — LLM الراق' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /activate-neural — تفعيل شبكة الخلايا العصبية الجذرية
// ══════════════════════════════════════════════════════════════════════════════
router.post('/activate-neural', (req, res) => {
    if (!_check(res, integrator, 'محرك الدمج')) return;
    try {
        const result = integrator.activateNeuralRoot();
        return res.json({
            success:   true,
            bismillah: BISMILLAH,
            quranRef:  '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31',
            ...result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /llm-status — حالة LLM الراق
// ══════════════════════════════════════════════════════════════════════════════
router.get('/llm-status', (req, res) => {
    try {
        const status = llmRaqy ? llmRaqy.getStatus() : { status: 'UNAVAILABLE', message: 'LLM الراق غير محمّل' };
        return _ok(res, status, { description: 'حالة LLM الراق — نموذج اللغة الذكي الراقي' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /context — ذاكرة السياق الحالية
// Query: ?limit=20
// ══════════════════════════════════════════════════════════════════════════════
router.get('/context', (req, res) => {
    if (!_check(res, llmRaqy, 'LLM الراق')) return;
    try {
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const ctx   = llmRaqy.getContext(limit);
        return _ok(res, ctx, { count: ctx.length, description: 'ذاكرة السياق قصيرة المدى — LLM الراق' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /clear-context — مسح السياق
// ══════════════════════════════════════════════════════════════════════════════
router.post('/clear-context', (req, res) => {
    if (!_check(res, llmRaqy, 'LLM الراق')) return;
    try {
        llmRaqy.clearContext();
        return res.json({ success: true, message: 'تم مسح السياق بنجاح', bismillah: BISMILLAH, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

module.exports = router;
