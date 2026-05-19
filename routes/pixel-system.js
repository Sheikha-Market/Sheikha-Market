/**
 * بسم الله الرحمن الرحيم
 * مسارات API نظام البكسل الشيخة
 * SHEIKHA PIXEL SYSTEM ROUTES
 */

'use strict';

const express = require('express');
const router = express.Router();

let pixelSystem = null;

// تحميل نظام البكسل
try {
    pixelSystem = require('../lib/sheikha-pixel-system');
} catch (err) {
    console.warn('[PIXEL-ROUTES] ⚠️  تحذير:', err.message);
}

// ─── تهيئة النظام ─────────────────────────────────────────────────────────────

router.post('/init', async (req, res) => {
    if (!pixelSystem) {
        return res.status(503).json({
            success: false,
            message: 'نظام البكسل غير متاح'
        });
    }

    try {
        const result = await pixelSystem.initPixelSystem();
        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('[PIXEL-INIT] ❌ خطأ:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ─── إنشاء بكسل جديد ──────────────────────────────────────────────────────────

router.post('/create', async (req, res) => {
    if (!pixelSystem) {
        return res.status(503).json({
            success: false,
            message: 'نظام البكسل غير متاح'
        });
    }

    try {
        const { id, data, metadata } = req.body;

        if (!id || !data) {
            return res.status(400).json({
                success: false,
                message: 'المعرّف والبيانات مطلوبة'
            });
        }

        const pixel = pixelSystem.createPixel(id, data, metadata);

        return res.json({
            success: true,
            data: {
                pixelId: pixel.id,
                created: pixel.timestamp,
                status: 'created'
            }
        });
    } catch (err) {
        console.error('[PIXEL-CREATE] ❌ خطأ:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ─── معالجة دفعة من البكسلات ───────────────────────────────────────────────────

router.post('/process-batch', async (req, res) => {
    if (!pixelSystem) {
        return res.status(503).json({
            success: false,
            message: 'نظام البكسل غير متاح'
        });
    }

    try {
        const { pixels, context } = req.body;

        if (!Array.isArray(pixels) || pixels.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'البكسلات مطلوبة (مصفوفة)'
            });
        }

        const pixelUnits = pixels.map(p => 
            pixelSystem.createPixel(p.id, p.data, p.metadata)
        );

        const results = await pixelSystem.processBatch(pixelUnits, context);

        return res.json({
            success: true,
            data: {
                processed: results.length,
                results,
                stats: pixelSystem.getStats()
            }
        });
    } catch (err) {
        console.error('[PIXEL-BATCH] ❌ خطأ:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ─── تجميع البكسلات ────────────────────────────────────────────────────────────

router.post('/aggregate', async (req, res) => {
    if (!pixelSystem) {
        return res.status(503).json({
            success: false,
            message: 'نظام البكسل غير متاح'
        });
    }

    try {
        const { pixelIds } = req.body;

        if (!Array.isArray(pixelIds) || pixelIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'معرّفات البكسل مطلوبة'
            });
        }

        const aggregation = await pixelSystem.aggregatePixels(pixelIds);

        return res.json({
            success: true,
            data: aggregation
        });
    } catch (err) {
        console.error('[PIXEL-AGGREGATE] ❌ خطأ:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ─── الإحصائيات ────────────────────────────────────────────────────────────────

router.get('/stats', (req, res) => {
    if (!pixelSystem) {
        return res.status(503).json({
            success: false,
            message: 'نظام البكسل غير متاح'
        });
    }

    try {
        const stats = pixelSystem.getStats();
        return res.json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('[PIXEL-STATS] ❌ خطأ:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ─── فحص الحالة ────────────────────────────────────────────────────────────────

router.get('/status', async (req, res) => {
    if (!pixelSystem) {
        return res.status(503).json({
            success: false,
            message: 'نظام البكسل غير متاح',
            status: 'unavailable'
        });
    }

    try {
        const init = await pixelSystem.initPixelSystem();
        const stats = pixelSystem.getStats();

        return res.json({
            success: true,
            status: 'ready',
            system: init,
            statistics: stats
        });
    } catch (err) {
        console.error('[PIXEL-STATUS] ❌ خطأ:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message,
            status: 'error'
        });
    }
});

// ─── معالجة طلب مخصص ───────────────────────────────────────────────────────────

router.post('/handle', async (req, res) => {
    if (!pixelSystem || !pixelSystem.handlePixelRequest) {
        return res.status(503).json({
            success: false,
            message: 'نظام البكسل غير متاح'
        });
    }

    return pixelSystem.handlePixelRequest(req, res);
});

// ═══════════════════════════════════════════════════════════════════════════════
// التصدير
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = router;
