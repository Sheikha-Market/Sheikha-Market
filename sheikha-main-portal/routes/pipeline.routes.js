/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * pipeline.routes.js — مسارات API الموحّدة لمنظومة شيخة
 * Pipeline + Factory + Neural Network
 *
 * المسارات:
 *   GET  /api/engine/status               — حالة المحرك الكاملة
 *   POST /api/engine/process              — تشغيل خط أنابيب
 *   POST /api/engine/create               — إنشاء كيان (سوق/منظمة/خط أنابيب)
 *   POST /api/engine/signal               — إرسال إشارة عبر الشبكة العصبية
 *   POST /api/engine/learn                — دورة تعلم
 *
 *   GET  /api/engine/pipelines            — قائمة خطوط الأنابيب
 *   POST /api/engine/pipelines/run        — تشغيل خط أنابيب بالاسم
 *
 *   GET  /api/engine/factory/markets      — قائمة الأسواق
 *   GET  /api/engine/factory/organizations — قائمة المنظمات
 *   GET  /api/engine/factory/overview     — نظرة عامة على المصانع
 *
 *   GET  /api/engine/neural/nodes         — عقد الشبكة العصبية
 *   GET  /api/engine/neural/edges         — روابط الشبكة
 *   GET  /api/engine/neural/stats         — إحصاءات الشبكة
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const express = require('express');
const router  = express.Router();

// تحميل المحرك عند أول طلب (lazy) لتجنب تأثير بدء التشغيل
let _engine = null;
function engine() {
    if (!_engine) {
        const { getInstance } = require('../lib/sheikha-core/SheikhaEngine');
        _engine = getInstance({ verbose: false });
    }
    return _engine;
}

// ── مساعد الاستجابة ────────────────────────────────────────────────────────────
function ok(res, data, status = 200) {
    res.status(status).json({ success: true, data, timestamp: new Date().toISOString() });
}

function fail(res, message, status = 400) {
    res.status(status).json({ success: false, error: message, timestamp: new Date().toISOString() });
}

// ══════════════════════════════════════════════════════════════════════════════
// حالة المحرك
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/engine/status
 * حالة المحرك الكاملة (Pipeline + Factory + Neural)
 */
router.get('/status', (req, res) => {
    try {
        ok(res, engine().status());
    } catch (err) {
        fail(res, err.message, 500);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// خطوط الأنابيب
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/engine/pipelines
 * قائمة جميع خطوط الأنابيب المسجّلة
 */
router.get('/pipelines', (req, res) => {
    try {
        ok(res, engine().pipelineRegistry.toJSON());
    } catch (err) {
        fail(res, err.message, 500);
    }
});

/**
 * POST /api/engine/pipelines/run
 * body: { name: string, input: any, context?: object }
 * تشغيل خط أنابيب بالاسم
 */
router.post('/pipelines/run', async (req, res) => {
    const { name, input, context } = req.body || {};
    if (!name) return fail(res, 'يجب تحديد اسم خط الأنابيب (name)');
    try {
        const result = await engine().runPipeline(name, input, context || {});
        ok(res, result);
    } catch (err) {
        fail(res, err.message, 400);
    }
});

/**
 * POST /api/engine/process
 * body: { type: 'data'|'sharia'|'market'|'production', input: any, context?: object }
 * معالجة مدخل عبر خط الأنابيب المناسب
 */
router.post('/process', async (req, res) => {
    const { type, input, context } = req.body || {};
    if (!type)  return fail(res, 'يجب تحديد نوع خط الأنابيب (type)');
    if (input === undefined) return fail(res, 'يجب تحديد المدخلات (input)');
    try {
        const result = await engine().process(type, input, context || {});
        ok(res, result);
    } catch (err) {
        fail(res, err.message, 400);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// المصانع
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/engine/factory/overview
 * نظرة عامة على جميع المصانع والكيانات المُنتَجة
 */
router.get('/factory/overview', (req, res) => {
    try {
        ok(res, engine().factories.overview());
    } catch (err) {
        fail(res, err.message, 500);
    }
});

/**
 * GET /api/engine/factory/markets
 * قائمة الأسواق
 */
router.get('/factory/markets', (req, res) => {
    try {
        const markets = engine().factories.market.list();
        ok(res, { markets, count: markets.length, stats: engine().factories.market.getStats() });
    } catch (err) {
        fail(res, err.message, 500);
    }
});

/**
 * GET /api/engine/factory/organizations
 * قائمة المنظمات مع الشجرة الهرمية
 */
router.get('/factory/organizations', (req, res) => {
    try {
        const orgs = engine().factories.organization;
        ok(res, { organizations: orgs.list(), tree: orgs.tree(), stats: orgs.getStats() });
    } catch (err) {
        fail(res, err.message, 500);
    }
});

/**
 * POST /api/engine/create
 * body: { factoryType: 'market'|'organization'|'pipeline', config: object }
 * إنشاء كيان جديد عبر المصنع المناسب
 */
router.post('/create', (req, res) => {
    const { factoryType, config } = req.body || {};
    if (!factoryType) return fail(res, 'يجب تحديد نوع المصنع (factoryType)');
    if (!config)      return fail(res, 'يجب تحديد بيانات الكيان (config)');
    try {
        const entity = engine().create(factoryType, config);
        ok(res, entity, 201);
    } catch (err) {
        fail(res, err.message, 400);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// الشبكة العصبية
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/engine/neural/stats
 * إحصاءات الشبكة العصبية
 */
router.get('/neural/stats', (req, res) => {
    try {
        ok(res, engine().neuralNet.getStats());
    } catch (err) {
        fail(res, err.message, 500);
    }
});

/**
 * GET /api/engine/neural/nodes
 * قائمة عقد الشبكة العصبية
 */
router.get('/neural/nodes', (req, res) => {
    try {
        ok(res, { nodes: engine().neuralNet.getNodeList(), count: engine().neuralNet.nodeCount });
    } catch (err) {
        fail(res, err.message, 500);
    }
});

/**
 * GET /api/engine/neural/edges
 * روابط الشبكة العصبية
 */
router.get('/neural/edges', (req, res) => {
    try {
        const edges = engine().neuralNet.getEdges();
        ok(res, { edges, count: edges.length });
    } catch (err) {
        fail(res, err.message, 500);
    }
});

/**
 * POST /api/engine/signal
 * body: { sourceId: string, targetId: string, signal: any, strategy?: string }
 * إرسال إشارة عبر الشبكة العصبية
 */
router.post('/signal', async (req, res) => {
    const { sourceId, targetId, signal, strategy } = req.body || {};
    if (!sourceId) return fail(res, 'يجب تحديد العقدة المرسِلة (sourceId)');
    if (!targetId) return fail(res, 'يجب تحديد العقدة الهدف (targetId)');
    if (signal === undefined) return fail(res, 'يجب تحديد الإشارة (signal)');
    try {
        const result = await engine().sendSignal(sourceId, targetId, signal, strategy);
        ok(res, result);
    } catch (err) {
        fail(res, err.message, 400);
    }
});

/**
 * POST /api/engine/learn
 * body: { samples: [{nodeId: string, feedback: object}] }
 * دورة تعلم للشبكة العصبية
 */
router.post('/learn', (req, res) => {
    const { samples } = req.body || {};
    if (!Array.isArray(samples)) return fail(res, 'يجب تحديد مصفوفة samples');
    try {
        const result = engine().learn(samples);
        ok(res, result);
    } catch (err) {
        fail(res, err.message, 400);
    }
});

module.exports = router;
