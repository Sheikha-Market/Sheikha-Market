/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏛️ SHEIKHA Supreme Activation Routes — مسارات التفعيل الأعلى الشامل
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 *
 * المسارات:
 *   POST /api/supreme/activate            — التفعيل الأعلى الشامل الكوني
 *   GET  /api/supreme/status              — حالة التفعيل الأعلى
 *   GET  /api/supreme/agents/board        — لوحة جاهزية الوكلاء
 *   GET  /api/supreme/agents/registry     — سجل الوكلاء الرسمي
 *   GET  /api/supreme/foundation/summary  — ملخص منظومة الحاسب والعلوم
 *   GET  /api/supreme/foundation/pillars  — أركان المنظومة الكاملة
 *   GET  /api/supreme/neural/laws         — قوانين الشبكة العصبية الجذرية
 *   GET  /api/supreme/neural/specs        — مواصفات وخصائص الشبكة
 *   GET  /api/supreme/environments        — جميع البيئات التشغيلية
 *   GET  /api/supreme/environments/:id    — بيئة تشغيل واحدة مع تقرير الامتثال
 *   POST /api/supreme/watchdog/start      — بدء وكيل المراقبة
 *   GET  /api/supreme/watchdog/status     — حالة وكيل المراقبة
 *   GET  /api/supreme/watchdog/logs       — سجل المراقبة
 *   GET  /api/supreme/health              — فحص صحة المنظومة الشاملة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── تحميل الوحدات ───────────────────────────────────────────────────────────

let supreme    = null;
let foundation = null;
let agentLayer = null;
let registry   = null;
let watchdog   = null;

function _load() {
    if (!supreme) {
        try { supreme = require('../lib/sheikha-supreme-activation'); } catch (_) {}
    }
    if (!foundation) {
        try { foundation = require('../lib/sheikha-universal-computing-foundation'); } catch (_) {}
    }
    if (!agentLayer) {
        try { agentLayer = require('../lib/sheikha-operational-agents-layer'); } catch (_) {}
    }
    if (!registry) {
        try { registry = require('../lib/sheikha-agents-activation-registry'); } catch (_) {}
    }
    if (!watchdog) {
        try { watchdog = require('../lib/sheikha-agent-continuity-watchdog'); } catch (_) {}
    }
}

_load();

// ─── مساعدات ────────────────────────────────────────────────────────────────

function _ts() { return new Date().toISOString(); }
function _err(res, code, msg) {
    return res.status(code).json({ success: false, message: msg, timestamp: _ts() });
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /activate — التفعيل الأعلى الشامل الكوني
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تفعيل منظومة الحاسب + الذكاء الصناعي + الوكلاء + الشبكة العصبية بالكامل.
 * Body (اختياري):
 *   { startWatchdog?: boolean, watchdogIntervalMs?: number }
 */
router.post('/activate', (req, res) => {
    _load();
    if (!supreme) return _err(res, 503, 'وحدة التفعيل الأعلى غير متاحة');

    try {
        const body = (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) ? req.body : {};
        const result = supreme.activateAll({
            startWatchdog:      body.startWatchdog      !== false,
            watchdogIntervalMs: body.watchdogIntervalMs || 60000,
        });
        res.json({
            success:    result.success,
            bismillah:  'بسم الله الرحمن الرحيم',
            tawheed:    result.tawheed,
            quranRef:   result.quranRef,
            hadithRef:  result.hadithRef,
            noHarm:     result.noHarm,
            data:       result,
            timestamp:  _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /status — حالة التفعيل الأعلى
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/status', (req, res) => {
    _load();
    const st = supreme ? supreme.status() : { available: false };
    res.json({
        success:   true,
        bismillah: 'بسم الله الرحمن الرحيم',
        data:      st,
        timestamp: _ts(),
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /agents/board — لوحة جاهزية الوكلاء
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/agents/board', (req, res) => {
    _load();
    if (!agentLayer) return _err(res, 503, 'طبقة الوكلاء التشغيلية غير متاحة');
    try {
        const board = agentLayer.readinessBoard();
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data:      board,
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /agents/registry — سجل الوكلاء الرسمي
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/agents/registry', (req, res) => {
    _load();
    if (!registry) return _err(res, 503, 'سجل الوكلاء الرسمي غير متاح');
    try {
        const summary = registry.registrySummary();
        const agents  = registry.getAllAgents();
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data:      { summary, agents },
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /agents/registry/:id — وكيل واحد بمعرّفه
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/agents/registry/:id', (req, res) => {
    _load();
    if (!registry) return _err(res, 503, 'سجل الوكلاء غير متاح');
    try {
        const agent = registry.getAgent(req.params.id);
        if (!agent) return _err(res, 404, `الوكيل "${req.params.id}" غير موجود في السجل`);
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: agent,
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /foundation/summary — ملخص منظومة الحاسب والعلوم
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/foundation/summary', (req, res) => {
    _load();
    if (!foundation) return _err(res, 503, 'منظومة الحاسب والعلوم غير متاحة');
    try {
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data:      foundation.foundationSummary(),
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /foundation/pillars — أركان المنظومة الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/foundation/pillars', (req, res) => {
    _load();
    if (!foundation) return _err(res, 503, 'منظومة الحاسب والعلوم غير متاحة');
    try {
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: {
                foundationPillars: foundation.FOUNDATION_PILLARS,
                csPillars:         Object.values(foundation.CS_PILLARS).map(p => ({ id: p.id, nameAr: p.nameAr, nameEn: p.nameEn, islamicRef: p.islamicRef })),
                neuralLaws:        foundation.NEURAL_ROOT_LAWS,
                neuralSpecs:       foundation.NEURAL_SPECIFICATIONS,
            },
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /neural/laws — قوانين الشبكة العصبية الجذرية
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/neural/laws', (req, res) => {
    _load();
    if (!foundation) return _err(res, 503, 'منظومة الحاسب والعلوم غير متاحة');
    try {
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data:      { laws: foundation.NEURAL_ROOT_LAWS, total: foundation.NEURAL_ROOT_LAWS.length },
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /neural/specs — مواصفات وخصائص الشبكة
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/neural/specs', (req, res) => {
    _load();
    if (!foundation) return _err(res, 503, 'منظومة الحاسب والعلوم غير متاحة');
    try {
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data:      foundation.NEURAL_SPECIFICATIONS,
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /environments — جميع البيئات التشغيلية
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/environments', (req, res) => {
    _load();
    if (!foundation) return _err(res, 503, 'منظومة البيئات غير متاحة');
    try {
        const envs = Object.values(foundation.ENVIRONMENTS);
        res.json({
            success:    true,
            bismillah:  'بسم الله الرحمن الرحيم',
            total:      envs.length,
            data:       envs,
            timestamp:  _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /environments/:id — بيئة واحدة مع تقرير الامتثال
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/environments/:id', (req, res) => {
    _load();
    if (!foundation) return _err(res, 503, 'منظومة البيئات غير متاحة');
    try {
        const report = foundation.environmentReport(req.params.id);
        if (report.error) return _err(res, 404, report.error);
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data:      report,
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /watchdog/start — بدء وكيل المراقبة
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/watchdog/start', (req, res) => {
    _load();
    if (!watchdog) return _err(res, 503, 'وكيل المراقبة غير متاح');
    try {
        const body = (req.body && typeof req.body === 'object') ? req.body : {};
        const result = watchdog.start({
            intervalMs: typeof body.intervalMs === 'number' && body.intervalMs >= 5000
                ? body.intervalMs
                : 60000,
        });
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data:      result,
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /watchdog/status — حالة وكيل المراقبة
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/watchdog/status', (req, res) => {
    _load();
    if (!watchdog) return _err(res, 503, 'وكيل المراقبة غير متاح');
    try {
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data:      watchdog.status(),
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /watchdog/logs — سجل المراقبة
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/watchdog/logs', (req, res) => {
    _load();
    if (!watchdog) return _err(res, 503, 'وكيل المراقبة غير متاح');
    try {
        const n = Math.min(parseInt(req.query.n || '50', 10), 200);
        const alertsOnly = req.query.alerts === 'true';
        const logs = alertsOnly ? watchdog.getAlerts(n) : watchdog.getLogs(n);
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            total:     logs.length,
            data:      logs,
            timestamp: _ts(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: _ts() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /health — فحص صحة المنظومة الشاملة
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/health', (req, res) => {
    _load();

    const health = {
        bismillah:  'بسم الله الرحمن الرحيم',
        tawheed:    'لا إله إلا الله محمد رسول الله',
        components: {},
        timestamp:  _ts(),
    };

    // حالة التفعيل الأعلى
    health.components.supremeActivation = supreme
        ? { available: true, ...supreme.status() }
        : { available: false };

    // حالة الشبكة العصبية (lazy-loaded)
    try {
        const nr = require('../intelligence/sheikha-neural-root-activator');
        const h  = nr.health();
        health.components.neuralRoot = { available: true, ready: h.ready, totalCells: h.totalCells, networksActive: h.networksActive };
    } catch (e) {
        health.components.neuralRoot = { available: false, error: e.message };
    }

    // حالة طبقة الوكلاء
    health.components.agentLayer = agentLayer
        ? { available: true, ...agentLayer.readinessBoard() }
        : { available: false };

    // حالة وكيل المراقبة
    health.components.watchdog = watchdog
        ? { available: true, running: watchdog.status().running }
        : { available: false };

    // حالة منظومة الحاسب والعلوم
    health.components.foundation = foundation
        ? { available: true, ...foundation.foundationSummary() }
        : { available: false };

    const availableCount = Object.values(health.components).filter(c => c.available !== false).length;
    health.availableComponents = availableCount;
    health.totalComponents     = Object.keys(health.components).length;
    health.healthy             = availableCount === health.totalComponents;
    health.success             = true;
    health.quranRef            = '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨';

    res.json(health);
});

module.exports = router;
