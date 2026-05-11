/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌌 مسارات المنظومة الكونية — Cosmic Pixel Routes v3
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275
 *
 * المسارات الكونية:
 *   GET  /api/cosmic-pixel/status       — الحالة الكاملة للمنظومة الكونية
 *   GET  /api/cosmic-pixel/stats        — الإحصائيات التراكمية
 *   GET  /api/cosmic-pixel/performance  — مقاييس الأداء (P50/P95/P99)
 *   POST /api/cosmic-pixel/process      — معالجة حدث واحد بـ 7 طبقات فحص
 *   POST /api/cosmic-pixel/analyze      — تحليل عميق متعدد الأبعاد
 *   POST /api/cosmic-pixel/batch        — معالجة دُفعية (حتى 500 عنصر)
 *   GET  /api/cosmic-pixel/audit        — سجل التدقيق الثابت
 *   GET  /api/cosmic-pixel/zones        — مناطق السوق العالمية
 *   GET  /api/cosmic-pixel/tiers        — مستويات الثقة
 *   POST /api/cosmic-pixel/reset        — إعادة تعيين الإحصائيات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

const BISMILLAH     = 'بسم الله الرحمن الرحيم';
const QURAN_REF     = '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275';
const NO_HARM       = 'لا ضرر ولا ضرار';

// ─── تحميل المحرك الكوني ─────────────────────────────────────────────────────
let cosmic;
try {
    cosmic = require('../lib/sheikha-pixel-cosmic-engine.js');
    console.log('[COSMIC-PIXEL] 🌌 المحرك الكوني محمّل — الإصدار', cosmic.COSMIC_VERSION || '3.0.0-COSMIC');
} catch (e) {
    console.error('[COSMIC-PIXEL] ❌ فشل تحميل المحرك الكوني:', e.message);
    cosmic = null;
}

// ─── حارس الربا الكوني ───────────────────────────────────────────────────────
const RIBA_COSMIC_GUARD = /\b(riba|ribawi|usury|interest[-\s]?based|interest[-\s]?bearing|compound\s*interest|apr|aer|loan\s*shark)\b|(ربا|ربوي|ربوية|قرض\s*بفائدة|فائدة\s*(بنكية|ثابتة|مركبة|سنوية)|فوائد\s*ربوية)/i;
const BYPASS_QUICK_RX   = /r[\s\-_\.]+i[\s\-_\.]+b[\s\-_\.]+a|r[!1|]ba\b|ponz[i1]\s*scheme|\bgam[b8]l[i1]ng\b/i;

function _norm(input) {
    return String(input || '').toLowerCase().replace(/[\u064B-\u065F\u0670]/g, '').replace(/\s+/g, ' ').trim();
}

function _extractBodyText(req) {
    if (!req.body) return '';
    const { payload, data, items } = req.body;
    if (payload !== undefined) return _norm(typeof payload === 'string' ? payload : JSON.stringify(payload));
    if (data    !== undefined) return _norm(typeof data    === 'string' ? data    : JSON.stringify(data));
    if (items   !== undefined) return _norm(JSON.stringify(items));
    return _norm(JSON.stringify(req.body));
}

function _isRibaResult(result) {
    return Array.isArray(result?.violations) && result.violations.some(v => v?.key === 'riba');
}

function _rejectRiba(res, source) {
    return res.status(403).json({
        success:   false,
        error:     'SHARIAH_BLOCK_RIBA',
        message:   'الربا محرم وغير مسموح — رُفض الطلب بواسطة المنظومة الكونية',
        source,
        quranRef:  QURAN_REF,
        hadith:    NO_HARM,
        timestamp: new Date().toISOString()
    });
}

function _rejectBypass(res, source) {
    return res.status(403).json({
        success:   false,
        error:     'BYPASS_ATTEMPT_BLOCKED',
        message:   'محاولة تحايل مُكتشفة — رُفض الطلب بواسطة درع السيادة الكوني',
        source,
        quranRef:  QURAN_REF,
        timestamp: new Date().toISOString()
    });
}

// ─── حارس موحّد قبل كل POST ──────────────────────────────────────────────────
router.use((req, res, next) => {
    if (req.method !== 'POST') return next();
    const text = _extractBodyText(req);
    if (BYPASS_QUICK_RX.test(text))      return _rejectBypass(res, 'cosmic-bypass-guard');
    if (RIBA_COSMIC_GUARD.test(text))    return _rejectRiba(res, 'cosmic-riba-guard');
    return next();
});

// ─── مساعد التحقق من توفر المحرك ─────────────────────────────────────────────
function _cosmicCheck(res) {
    if (!cosmic) {
        res.status(503).json({
            success:   false,
            message:   'المحرك الكوني غير متاح',
            timestamp: new Date().toISOString()
        });
        return false;
    }
    return true;
}

// ─── دالة بناء الاستجابة الموحّدة ────────────────────────────────────────────
function _ok(res, data, extra = {}) {
    return res.json({
        success:   true,
        bismillah: BISMILLAH,
        ...extra,
        data,
        timestamp: new Date().toISOString()
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /status — الحالة الكاملة للمنظومة الكونية
// ══════════════════════════════════════════════════════════════════════════════
router.get('/status', (req, res) => {
    try {
        if (!cosmic) {
            return res.json({
                success: true,
                status: 'DEGRADED',
                message: 'المحرك الكوني غير محمّل — وضع الطوارئ',
                timestamp: new Date().toISOString()
            });
        }
        const status = cosmic.getStatus();
        return res.json({
            success:    true,
            bismillah:  BISMILLAH,
            quranRef:   QURAN_REF,
            hadith:     NO_HARM,
            ...status,
            timestamp:  new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /stats — الإحصائيات التراكمية
// ══════════════════════════════════════════════════════════════════════════════
router.get('/stats', (req, res) => {
    if (!_cosmicCheck(res)) return;
    try {
        _ok(res, cosmic.getStatistics());
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /performance — مقاييس الأداء P50/P95/P99
// ══════════════════════════════════════════════════════════════════════════════
router.get('/performance', (req, res) => {
    if (!_cosmicCheck(res)) return;
    try {
        _ok(res, cosmic.getPerformance(), { description: 'مقاييس الكمون اللحظية — Latency Percentiles' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /process — معالجة حدث واحد بـ 7 طبقات فحص شرعي
// Body: { payload, zone? }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/process', (req, res) => {
    if (!_cosmicCheck(res)) return;
    try {
        const { payload, zone } = req.body || {};
        if (payload === undefined || payload === null) {
            return res.status(400).json({ success: false, message: 'payload مطلوب', timestamp: new Date().toISOString() });
        }
        const result = cosmic.process(payload, { zone });
        if (_isRibaResult(result)) return _rejectRiba(res, 'cosmic-engine-process');
        return _ok(res, result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /analyze — تحليل عميق متعدد الأبعاد
// Body: { data, zone? }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/analyze', (req, res) => {
    if (!_cosmicCheck(res)) return;
    try {
        const { data, zone } = req.body || {};
        if (data === undefined || data === null) {
            return res.status(400).json({ success: false, message: 'data مطلوب', timestamp: new Date().toISOString() });
        }
        const result = cosmic.analyze(data, { zone });
        if (_isRibaResult(result)) return _rejectRiba(res, 'cosmic-engine-analyze');
        return _ok(res, result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /batch — معالجة دُفعية (حتى 500 عنصر)
// Body: { items: [...], zone? }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/batch', (req, res) => {
    if (!_cosmicCheck(res)) return;
    try {
        const { items, zone } = req.body || {};
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'items يجب أن تكون مصفوفة غير فارغة', timestamp: new Date().toISOString() });
        }
        const result = cosmic.processBatch(items, { zone });
        return res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /audit — سجل التدقيق الثابت
// Query: ?limit=50
// ══════════════════════════════════════════════════════════════════════════════
router.get('/audit', (req, res) => {
    if (!_cosmicCheck(res)) return;
    try {
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 50));
        const log   = cosmic.getAuditLog(limit);
        return _ok(res, log, { count: log.length, description: 'سجل التدقيق الثابت — Immutable Audit Trail' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /zones — مناطق السوق العالمية
// ══════════════════════════════════════════════════════════════════════════════
router.get('/zones', (req, res) => {
    try {
        const { MARKET_ZONES } = require('../lib/sheikha-pixel-cosmic-engine.js');
        return _ok(res, MARKET_ZONES, { description: 'مناطق السوق الكوني المدعومة' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /tiers — مستويات الثقة المتدرجة
// ══════════════════════════════════════════════════════════════════════════════
router.get('/tiers', (req, res) => {
    try {
        const { CONFIDENCE_TIERS } = require('../lib/sheikha-pixel-cosmic-engine.js');
        return _ok(res, CONFIDENCE_TIERS, { description: 'مستويات الثقة: CERTAIN → HIGH → MEDIUM → LOW → UNCERTAIN' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /reset — إعادة تعيين الإحصائيات
// ══════════════════════════════════════════════════════════════════════════════
router.post('/reset', (req, res) => {
    if (!_cosmicCheck(res)) return;
    try {
        cosmic.reset();
        return res.json({
            success:   true,
            message:   'تمت إعادة تعيين المنظومة الكونية بنجاح',
            bismillah: BISMILLAH,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

module.exports = router;
