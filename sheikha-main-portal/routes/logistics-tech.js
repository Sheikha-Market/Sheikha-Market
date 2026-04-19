// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚙️ تكنولوجيا اللوجيستك والنقل — API Routes
 * SHEIKHA LOGISTICS & TRANSPORT TECHNOLOGY — API Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Base path: /api/logistics-tech
 *
 * Endpoints:
 *   GET  /api/logistics-tech                    — ملخص سريع
 *   GET  /api/logistics-tech/overview           — نظرة عامة شاملة
 *   GET  /api/logistics-tech/iot                — IoT والتيليماتيكس
 *   GET  /api/logistics-tech/blockchain         — سلسلة الكتل
 *   GET  /api/logistics-tech/ai                 — الذكاء الاصطناعي والتعلم الآلي
 *   GET  /api/logistics-tech/autonomous         — الأنظمة المستقلة والطائرات المسيّرة
 *   GET  /api/logistics-tech/smart-warehouse    — المستودعات الذكية
 *   GET  /api/logistics-tech/platforms          — المنصات الرقمية TMS/WMS
 *   GET  /api/logistics-tech/connectivity       — الاتصالات والجيل الخامس
 *   GET  /api/logistics-tech/green-tech         — التكنولوجيا الخضراء
 *   GET  /api/logistics-tech/cybersecurity      — أمن المعلومات
 *   GET  /api/logistics-tech/digital-docs       — الوثائق الرقمية
 *   GET  /api/logistics-tech/integration        — التكامل مع الأنظمة
 *   GET  /api/logistics-tech/roadmap            — خارطة الطريق التقنية
 *   POST /api/logistics-tech/assess-maturity    — تقييم نضج التكنولوجيا
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const express = require('express');
const router = express.Router();

let logTech;
try {
    logTech = require('../lib/sheikha-logistics-transport-technology');
} catch (e) {
    console.warn('[LogisticsTech] load error:', e.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware guard
// ─────────────────────────────────────────────────────────────────────────────
function engineGuard(req, res, next) {
    if (!logTech) {
        return res.status(503).json({ success: false, error: 'محرك تكنولوجيا اللوجيستك غير متوفر حالياً' });
    }
    next();
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech (root — quick summary)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech
 * @desc    ملخص سريع لمنظومة تكنولوجيا اللوجيستك والنقل
 * @access  Public
 */
router.get('/', (req, res) => {
    try {
        const data = logTech ? logTech.summary : { status: 'loading' };
        res.json({
            success: true,
            message: 'بسم الله الرحمن الرحيم — تكنولوجيا اللوجيستك والنقل | شيخة',
            data,
            endpoints: {
                overview:       'GET /api/logistics-tech/overview',
                iot:            'GET /api/logistics-tech/iot',
                blockchain:     'GET /api/logistics-tech/blockchain',
                ai:             'GET /api/logistics-tech/ai',
                autonomous:     'GET /api/logistics-tech/autonomous',
                smartWarehouse: 'GET /api/logistics-tech/smart-warehouse',
                platforms:      'GET /api/logistics-tech/platforms',
                connectivity:   'GET /api/logistics-tech/connectivity',
                greenTech:      'GET /api/logistics-tech/green-tech',
                cybersecurity:  'GET /api/logistics-tech/cybersecurity',
                digitalDocs:    'GET /api/logistics-tech/digital-docs',
                integration:    'GET /api/logistics-tech/integration',
                roadmap:        'GET /api/logistics-tech/roadmap',
                assessMaturity: 'POST /api/logistics-tech/assess-maturity'
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/overview
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/overview
 * @desc    نظرة عامة شاملة على منظومة تكنولوجيا اللوجيستك والنقل
 * @access  Public
 */
router.get('/overview', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getOverview() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/iot
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/iot
 * @desc    إنترنت الأشياء والتيليماتيكس: GPS، OBD، حساسات البضائع، تتبع الأصول
 * @access  Public
 */
router.get('/iot', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getIoT() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/blockchain
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/blockchain
 * @desc    بلوكتشين سلسلة الإمداد: eBL، عقود ذكية، جمارك رقمية، حلال
 * @access  Public
 */
router.get('/blockchain', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getBlockchain() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/ai
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/ai
 * @desc    نماذج الذكاء الاصطناعي: تحسين مسارات، تنبؤ طلب، صيانة تنبؤية، رؤية حاسوبية
 * @access  Public
 */
router.get('/ai', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getAI() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/autonomous
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/autonomous
 * @desc    الأنظمة المستقلة: طائرات مسيّرة، مركبات ذاتية القيادة، AGV/AMR
 * @access  Public
 */
router.get('/autonomous', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getAutonomous() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/smart-warehouse
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/smart-warehouse
 * @desc    المستودعات الذكية: RFID، AS/RS، WMS، أتمتة التغليف
 * @access  Public
 */
router.get('/smart-warehouse', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getSmartWarehouse() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/platforms
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/platforms
 * @desc    المنصات الرقمية: TMS، تطبيقات الجوال (سائق/مشغِّل/عميل)، برج التحكم
 * @access  Public
 */
router.get('/platforms', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getPlatforms() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/connectivity
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/connectivity
 * @desc    الاتصالات: 5G، LTE-M، NB-IoT، V2X، أقمار صناعية، PCS للموانئ
 * @access  Public
 */
router.get('/connectivity', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getConnectivity() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/green-tech
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/green-tech
 * @desc    التكنولوجيا الخضراء: مركبات كهربائية، تتبع كربوني، وقود بديل، مستودع أخضر
 * @access  Public
 */
router.get('/green-tech', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getGreenTech() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/cybersecurity
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/cybersecurity
 * @desc    أمن المعلومات: IoT Security، Zero Trust، SOC 24/7، امتثال NCA
 * @access  Public
 */
router.get('/cybersecurity', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getCybersecurity() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/digital-docs
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/digital-docs
 * @desc    الوثائق الرقمية: eBL، e-AWB، e-CMR، فاتورة إلكترونية، جمارك رقمية
 * @access  Public
 */
router.get('/digital-docs', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getDigitalDocs() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/integration
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/integration
 * @desc    بنية التكامل: ERP، EDI، API Gateway، Kafka Event Streaming
 * @access  Public
 */
router.get('/integration', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getIntegration() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics-tech/roadmap
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/logistics-tech/roadmap
 * @desc    خارطة الطريق التقنية 2026-2030
 * @access  Public
 */
router.get('/roadmap', engineGuard, (req, res) => {
    try {
        res.json({ success: true, data: logTech.getRoadmap() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/logistics-tech/assess-maturity
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   POST /api/logistics-tech/assess-maturity
 * @desc    تقييم نضج التكنولوجيا اللوجستية لمنشأة ما
 * @body    { fleetSize, hasGPS, hasWMS, hasTMS, hasBlockchain, evPercentage, hasAI, hasDigitalDocs }
 * @access  Public
 *
 * @example
 * POST /api/logistics-tech/assess-maturity
 * {
 *   "fleetSize": 200,
 *   "hasGPS": true,
 *   "hasWMS": true,
 *   "hasTMS": false,
 *   "hasBlockchain": false,
 *   "evPercentage": 10,
 *   "hasAI": false,
 *   "hasDigitalDocs": true
 * }
 */
router.post('/assess-maturity', engineGuard, (req, res) => {
    try {
        const {
            fleetSize,
            hasGPS,
            hasWMS,
            hasTMS,
            hasBlockchain,
            evPercentage,
            hasAI,
            hasDigitalDocs
        } = req.body || {};

        if (fleetSize !== undefined && (isNaN(fleetSize) || fleetSize < 0)) {
            return res.status(400).json({ success: false, error: 'حجم الأسطول يجب أن يكون رقماً غير سالب' });
        }
        if (evPercentage !== undefined && (isNaN(evPercentage) || evPercentage < 0 || evPercentage > 100)) {
            return res.status(400).json({ success: false, error: 'نسبة المركبات الكهربائية يجب أن تكون بين 0 و100' });
        }

        const result = logTech.assessMaturity({
            fleetSize, hasGPS, hasWMS, hasTMS,
            hasBlockchain, evPercentage, hasAI, hasDigitalDocs
        });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
