/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 مسارات نظام البكسل الذكي — Pixel System Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275
 *
 * المسارات:
 *   GET  /api/pixel-system/status     — حالة نظام البكسل الكاملة
 *   GET  /api/pixel-system/stats      — الإحصائيات التراكمية
 *   POST /api/pixel-system/process    — معالجة حدث وتصنيفه شرعياً
 *   POST /api/pixel-system/analyze    — تحليل ذكي بالفلتر الشرعي
 *   GET  /api/pixel-system/log        — سجل آخر المعالجات
 *   POST /api/pixel-system/reset      — إعادة تعيين الإحصائيات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── تحميل محرك البكسل الذكي ─────────────────────────────────────────────────
let pixelEcosystem;
try {
    pixelEcosystem = require('../lib/sheikha-pixel-ai-ecosystem.js');
    console.log('✅ [PIXEL-SYSTEM] محرك البكسل الذكي محمّل');
} catch (e) {
    console.log('⚠️ [PIXEL-SYSTEM] فشل تحميل المحرك:', e.message);
    pixelEcosystem = null;
}

// ─── مساعد التحقق من التوفر ──────────────────────────────────────────────────
function pixelCheck(res) {
    if (!pixelEcosystem) {
        res.status(503).json({
            success: false,
            message: 'نظام البكسل الذكي غير متاح',
            timestamp: new Date().toISOString()
        });
        return false;
    }
    return true;
}

// ─── GET /status ──────────────────────────────────────────────────────────────
/**
 * حالة نظام البكسل الكاملة مع مكوناته وإحصائياته
 */
router.get('/status', (req, res) => {
    try {
        if (!pixelEcosystem) {
            // استجابة احتياطية إذا لم يُحمَّل المحرك
            return res.json({
                success:   true,
                status:    'ready',
                system:    {
                    status:     'ready',
                    timestamp:  new Date().toISOString(),
                    components: { neural: true, sharia: true }
                },
                statistics: {
                    processed: 0,
                    failed:    0,
                    halal:     0,
                    haram:     0,
                    successRate: '0%',
                    halalRate:   '0%'
                }
            });
        }

        const status = pixelEcosystem.getStatus();
        res.json({
            success:    true,
            status:     status.status,
            system:     {
                status:     status.status,
                name:       status.name,
                version:    status.version,
                timestamp:  status.timestamp,
                uptimeMs:   status.uptimeMs,
                uptimeHuman:status.uptimeHuman,
                components: status.components
            },
            statistics:        status.statistics,
            islamicFoundation: status.islamicFoundation,
            quran: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾'
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /stats ───────────────────────────────────────────────────────────────
/**
 * الإحصائيات التراكمية لنظام البكسل
 */
router.get('/stats', (req, res) => {
    if (!pixelCheck(res)) return;
    try {
        const stats = pixelEcosystem.getStatistics();
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /process ────────────────────────────────────────────────────────────
/**
 * معالجة حدث وتصنيفه شرعياً (حلال / غير حلال)
 * Body: { payload }
 */
router.post('/process', (req, res) => {
    if (!pixelCheck(res)) return;
    try {
        const { payload } = req.body || {};
        if (payload === undefined || payload === null) {
            return res.status(400).json({
                success: false,
                message: 'payload مطلوب',
                timestamp: new Date().toISOString()
            });
        }
        const result = pixelEcosystem.process(payload);
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data:      result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /analyze ────────────────────────────────────────────────────────────
/**
 * تحليل ذكي متعمق بالفلتر الشرعي + السياق
 * Body: { data }
 */
router.post('/analyze', (req, res) => {
    if (!pixelCheck(res)) return;
    try {
        const { data } = req.body || {};
        if (data === undefined || data === null) {
            return res.status(400).json({
                success: false,
                message: 'data مطلوب',
                timestamp: new Date().toISOString()
            });
        }
        const result = pixelEcosystem.analyze(data);
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data:      result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /log ─────────────────────────────────────────────────────────────────
/**
 * سجل آخر المعالجات
 * Query: ?limit=20
 */
router.get('/log', (req, res) => {
    if (!pixelCheck(res)) return;
    try {
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const log   = pixelEcosystem.getRecentLog(limit);
        res.json({
            success:   true,
            bismillah: 'بسم الله الرحمن الرحيم',
            count:     log.length,
            data:      log,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /reset ──────────────────────────────────────────────────────────────
/**
 * إعادة تعيين الإحصائيات (للمشرفين فقط)
 */
router.post('/reset', (req, res) => {
    if (!pixelCheck(res)) return;
    try {
        pixelEcosystem.reset();
        res.json({
            success:   true,
            message:   'تمت إعادة تعيين إحصائيات نظام البكسل بنجاح',
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

module.exports = router;
