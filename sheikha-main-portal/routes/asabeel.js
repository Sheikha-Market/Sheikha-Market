// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌐 شبكة شيخة العصبيل للوجستيات والنقل — API Routes
 * SHEIKHA AL-ASABEEL LOGISTICS & TRANSPORT NETWORK — API Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Base path: /api/asabeel
 *
 * Endpoints:
 *   GET  /api/asabeel/overview          — نظرة عامة على الشبكة
 *   GET  /api/asabeel/network           — شبكة العقد والمراكز والممرات
 *   GET  /api/asabeel/carriers          — الناقلون والأسطول
 *   GET  /api/asabeel/transport-modes   — وسائل النقل
 *   GET  /api/asabeel/warehouses        — المستودعات
 *   GET  /api/asabeel/services          — الخدمات المتاحة
 *   GET  /api/asabeel/ai                — قدرات الذكاء الاصطناعي
 *   GET  /api/asabeel/compliance        — الامتثال والوثائق
 *   GET  /api/asabeel/islamic           — الأساس القرآني والشرعي
 *   GET  /api/asabeel/statistics        — الإحصائيات الحية
 *   POST /api/asabeel/quote             — عرض سعر شحنة
 *   GET  /api/asabeel/tracking/:id      — تتبع شحنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const express = require('express');
const router = express.Router();

let asabeel;
try {
    asabeel = require('../lib/sheikha-asabeel-logistics-network');
} catch (e) {
    console.warn('[Asabeel] load error:', e.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware guard
// ─────────────────────────────────────────────────────────────────────────────
function engineGuard(req, res, next) {
    if (!asabeel) {
        return res.status(503).json({ success: false, error: 'شبكة العصبيل غير متوفرة حالياً' });
    }
    next();
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/overview
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/overview
 * @desc    نظرة عامة شاملة على شبكة العصبيل للوجستيات والنقل
 * @access  Public
 */
router.get('/overview', engineGuard, (req, res) => {
    try {
        const data = asabeel.getOverview();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/network
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/network
 * @desc    شبكة العقد والمراكز اللوجستية والممرات
 * @access  Public
 */
router.get('/network', engineGuard, (req, res) => {
    try {
        const data = asabeel.getNetworkDetails();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/carriers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/carriers
 * @desc    الناقلون المسجلون والأسطول وإجراءات التسجيل
 * @access  Public
 */
router.get('/carriers', engineGuard, (req, res) => {
    try {
        const data = asabeel.getCarriersInfo();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/transport-modes
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/transport-modes
 * @desc    وسائل النقل المتاحة (بري، بحري، جوي، سككي، متعدد)
 * @access  Public
 */
router.get('/transport-modes', engineGuard, (req, res) => {
    try {
        const data = asabeel.getTransportModes();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/warehouses
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/warehouses
 * @desc    شبكة المستودعات ومميزات WMS
 * @access  Public
 */
router.get('/warehouses', engineGuard, (req, res) => {
    try {
        const data = asabeel.getWarehousesInfo();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/services
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/services
 * @desc    الخدمات المتاحة (تتبع، تحسين مسار، تخليص، تأمين...)
 * @access  Public
 */
router.get('/services', engineGuard, (req, res) => {
    try {
        const data = asabeel.getServices();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/ai
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/ai
 * @desc    قدرات الذكاء الاصطناعي في شبكة العصبيل
 * @access  Public
 */
router.get('/ai', engineGuard, (req, res) => {
    try {
        const data = asabeel.getAICapabilities();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/compliance
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/compliance
 * @desc    الامتثال التنظيمي والمعايير الدولية والوثائق
 * @access  Public
 */
router.get('/compliance', engineGuard, (req, res) => {
    try {
        const data = asabeel.getComplianceInfo();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/islamic
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/islamic
 * @desc    الأساس القرآني والشرعي لشبكة العصبيل
 * @access  Public
 */
router.get('/islamic', engineGuard, (req, res) => {
    try {
        const data = asabeel.getIslamicFoundation();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/statistics
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/statistics
 * @desc    الإحصائيات الحية للشبكة
 * @access  Public
 */
router.get('/statistics', engineGuard, (req, res) => {
    try {
        const data = asabeel.getLiveStatistics();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/asabeel/quote
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   POST /api/asabeel/quote
 * @desc    احتساب عرض سعر شحنة فوري
 * @body    { origin, destination, weight, mode, cargoType, urgent }
 * @access  Public
 *
 * @example
 * POST /api/asabeel/quote
 * {
 *   "origin": "RUH",
 *   "destination": "JED",
 *   "weight": 5000,
 *   "mode": "road",
 *   "cargoType": "general",
 *   "urgent": false
 * }
 */
router.post('/quote', engineGuard, (req, res) => {
    try {
        const { origin, destination, weight, mode, cargoType, urgent } = req.body || {};

        if (!origin || !destination) {
            return res.status(400).json({
                success: false,
                error: 'يرجى تحديد مدينة الإرسال (origin) ومدينة الاستلام (destination)'
            });
        }

        if (weight !== undefined && (isNaN(weight) || weight <= 0)) {
            return res.status(400).json({ success: false, error: 'الوزن يجب أن يكون رقماً موجباً بالكيلوجرام' });
        }

        const validModes = ['road', 'sea', 'air', 'rail', 'express'];
        if (mode && !validModes.includes(mode)) {
            return res.status(400).json({
                success: false,
                error: `وسيلة النقل غير صالحة. الخيارات المتاحة: ${validModes.join(', ')}`
            });
        }

        const quote = asabeel.calculateQuote({ origin, destination, weight, mode, cargoType, urgent });
        res.json({ success: true, data: quote });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel/tracking/:trackingId
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel/tracking/:trackingId
 * @desc    تتبع شحنة باستخدام رقم التتبع
 * @access  Public
 */
router.get('/tracking/:trackingId', engineGuard, (req, res) => {
    try {
        const { trackingId } = req.params;
        if (!trackingId || trackingId.trim().length < 3) {
            return res.status(400).json({ success: false, error: 'رقم التتبع غير صالح' });
        }
        const data = asabeel.trackShipment(trackingId.trim());
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/asabeel (root — quick summary)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/asabeel
 * @desc    ملخص سريع لشبكة العصبيل
 * @access  Public
 */
router.get('/', (req, res) => {
    try {
        const summary = asabeel ? asabeel.summary : { status: 'loading' };
        res.json({
            success: true,
            message: 'بسم الله الرحمن الرحيم — شبكة شيخة العصبيل للوجستيات والنقل',
            data: summary,
            endpoints: {
                overview: 'GET /api/asabeel/overview',
                network: 'GET /api/asabeel/network',
                carriers: 'GET /api/asabeel/carriers',
                transportModes: 'GET /api/asabeel/transport-modes',
                warehouses: 'GET /api/asabeel/warehouses',
                services: 'GET /api/asabeel/services',
                ai: 'GET /api/asabeel/ai',
                compliance: 'GET /api/asabeel/compliance',
                islamic: 'GET /api/asabeel/islamic',
                statistics: 'GET /api/asabeel/statistics',
                quote: 'POST /api/asabeel/quote',
                tracking: 'GET /api/asabeel/tracking/:trackingId'
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
