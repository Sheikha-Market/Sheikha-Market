/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🎨  Visual Routes — مسارات محرك شيخة البصري
 *  طبقة API الكاملة لمحرك الإنتاج البصري
 *  "وَصَوَّرَكُمْ فَأَحْسَنَ صُوَرَكُمْ"
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── تحميل المحرك البصري ──────────────────────────────────────────────────────
let engine = null;
try {
    const mod = require('../lib/sheikha-visual-generation-engine');
    engine    = mod.getEngine();
    console.log('✅ [VISUAL] محرك شيخة البصري — مُحمَّل ومُفعَّل');
} catch (e) {
    console.warn('⚠️ [VISUAL] فشل تحميل محرك الصور:', e.message);
}

function requireEngine(res) {
    if (!engine) {
        res.status(503).json({ ok: false, error: 'المحرك البصري غير متوفر' });
        return false;
    }
    return true;
}

// ─── GET /api/visual/health — صحة المحرك ─────────────────────────────────────
router.get('/health', (req, res) => {
    if (!requireEngine(res)) return;
    res.json({ ok: true, ...engine.health() });
});

// ─── GET /api/visual/catalog — كتالوج المحولات والنوايا ──────────────────────
router.get('/catalog', (req, res) => {
    if (!requireEngine(res)) return;
    res.json({ ok: true, data: engine.catalog(), timestamp: new Date().toISOString() });
});

// ─── GET /api/visual/jobs — قائمة المهام ─────────────────────────────────────
router.get('/jobs', (req, res) => {
    if (!requireEngine(res)) return;
    const limit = parseInt(req.query.limit, 10) || 50;
    const jobs  = engine.listJobs(limit);
    res.json({
        ok:        true,
        count:     jobs.length,
        jobs,
        timestamp: new Date().toISOString(),
    });
});

// ─── GET /api/visual/jobs/:id — تفاصيل مهمة محددة ───────────────────────────
router.get('/jobs/:id', (req, res) => {
    if (!requireEngine(res)) return;
    const job = engine.getJob(req.params.id);
    if (!job) {
        return res.status(404).json({ ok: false, error: 'المهمة غير موجودة', id: req.params.id });
    }
    res.json({ ok: true, job, timestamp: new Date().toISOString() });
});

// ─── GET /api/visual/library — مكتبة الأصول المولّدة ────────────────────────
router.get('/library', (req, res) => {
    if (!requireEngine(res)) return;
    const limit   = parseInt(req.query.limit, 10) || 100;
    const assets  = engine.getLibrary(limit);
    res.json({
        ok:        true,
        count:     assets.length,
        assets,
        timestamp: new Date().toISOString(),
    });
});

// ─── POST /api/visual/plan — تخطيط بدون تنفيذ ────────────────────────────────
router.post('/plan', (req, res) => {
    if (!requireEngine(res)) return;
    const { prompt, type = 'image', options = {} } = req.body || {};

    if (!prompt) {
        return res.status(400).json({ ok: false, error: 'الحقل المطلوب: prompt' });
    }

    const visualPlan = engine.plan(prompt, type, options);
    res.json({
        ok:        true,
        plan:      visualPlan,
        message:   'تم إنشاء خطة التوليد البصري',
        timestamp: new Date().toISOString(),
    });
});

// ─── POST /api/visual/job — إنشاء مهمة (بدون تشغيل فوري) ────────────────────
router.post('/job', (req, res) => {
    if (!requireEngine(res)) return;
    const { prompt, type = 'image', options = {}, priority = 'normal' } = req.body || {};

    if (!prompt) {
        return res.status(400).json({ ok: false, error: 'الحقل المطلوب: prompt' });
    }

    const visualPlan = engine.plan(prompt, type, options);
    const job        = engine.createJob(visualPlan, priority);

    res.status(201).json({
        ok:        true,
        job,
        message:   'تم إنشاء المهمة — استخدم POST /api/visual/jobs/:id/execute لتشغيلها',
        timestamp: new Date().toISOString(),
    });
});

// ─── POST /api/visual/jobs/:id/execute — تنفيذ مهمة موجودة ──────────────────
router.post('/jobs/:id/execute', (req, res) => {
    if (!requireEngine(res)) return;
    const job = engine.getJob(req.params.id);
    if (!job) {
        return res.status(404).json({ ok: false, error: 'المهمة غير موجودة', id: req.params.id });
    }
    if (job.status === 'completed') {
        return res.json({ ok: true, job, message: 'المهمة اكتملت مسبقًا', timestamp: new Date().toISOString() });
    }

    const result = engine.executeJob(req.params.id);
    res.json({
        ok:        true,
        job:       result,
        asset:     result.asset,
        message:   result.status === 'completed' ? 'تم التنفيذ بنجاح' : 'فشل التنفيذ',
        timestamp: new Date().toISOString(),
    });
});

// ─── POST /api/visual/generate — تخطيط + تنفيذ فوري ─────────────────────────
router.post('/generate', (req, res) => {
    if (!requireEngine(res)) return;
    const { prompt, type = 'image', options = {} } = req.body || {};

    if (!prompt) {
        return res.status(400).json({ ok: false, error: 'الحقل المطلوب: prompt' });
    }

    const job = engine.generate(prompt, type, options);

    if (!job) {
        return res.status(500).json({ ok: false, error: 'فشل إنشاء المهمة — تحقق من صحة prompt والمحرك البصري' });
    }

    const success = job.status === 'completed';
    res.status(success ? 200 : 500).json({
        ok:        success,
        job,
        asset:     job.asset,
        plan:      job.plan,
        message:   success ? 'تم التوليد البصري بنجاح' : ('فشل التوليد: ' + (job.error || 'خطأ غير معروف')),
        timestamp: new Date().toISOString(),
    });
});

// ─── POST /api/visual/analyze — تحليل prompt بدون توليد ──────────────────────
router.post('/analyze', (req, res) => {
    if (!requireEngine(res)) return;
    const { prompt } = req.body || {};

    if (!prompt) {
        return res.status(400).json({ ok: false, error: 'الحقل المطلوب: prompt' });
    }

    const result = engine.analyze(prompt);
    res.json({
        ok:        true,
        analysis:  result,
        message:   'تم تحليل طلب التوليد البصري',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
