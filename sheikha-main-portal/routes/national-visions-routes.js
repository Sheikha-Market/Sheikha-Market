/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌍 مسارات رؤية الدول — National Visions Routes
 *
 * API endpoints لمحرك رؤية الدول الاستراتيجية
 * "وَشَاوِرْهُمْ فِي الْأَمْرِ" — آل عمران: ١٥٩
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();

let NationalVisionsEngine;
let visionEngine;

try {
    NationalVisionsEngine = require('../lib/sheikha-national-visions-engine.js');
    visionEngine = new NationalVisionsEngine();
    console.log('✅ [NATIONAL-VISIONS-ROUTES] محرك رؤية الدول محمّل');
} catch (e) {
    console.log('⚠️ [NATIONAL-VISIONS-ROUTES] فشل تحميل محرك رؤية الدول:', e.message);
    visionEngine = null;
}

function engineCheck(req, res) {
    if (!visionEngine) {
        res.status(503).json({ success: false, message: 'محرك رؤية الدول غير متاح', timestamp: new Date().toISOString() });
        return false;
    }
    return true;
}

// ─── GET /api/national-visions/status ──────────────────────────────────────
/**
 * حالة محرك رؤية الدول
 */
router.get('/status', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        res.json({ success: true, data: visionEngine.getStatus(), timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /api/national-visions ─────────────────────────────────────────────
/**
 * قائمة جميع رؤى الدول
 */
router.get('/', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const visions = visionEngine.getAllVisions();
        res.json({
            success: true,
            count: visions.length,
            data: visions,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /api/national-visions/country/:code ───────────────────────────────
/**
 * رؤية دولة بعينها (رمز ISO 3166-1 alpha-2: SA, AE, QA...)
 */
router.get('/country/:code', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const vision = visionEngine.getVisionByCountry(req.params.code);
        if (!vision) {
            return res.status(404).json({
                success: false,
                message: `لم يتم العثور على رؤية للدولة: ${req.params.code}`,
                availableCodes: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'MA', 'MY', 'TR', 'PK', 'CN', 'IN'],
                timestamp: new Date().toISOString()
            });
        }
        res.json({ success: true, data: vision, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /api/national-visions/region/:region ─────────────────────────────
/**
 * رؤى منطقة بعينها (gcc, arab, islamic, global, asia)
 */
router.get('/region/:region', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const visions = visionEngine.getVisionsByRegion(req.params.region);
        res.json({
            success: true,
            region: req.params.region,
            count: visions.length,
            data: visions,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /api/national-visions/search ─────────────────────────────────────
/**
 * البحث في رؤى الدول
 * Query: ?q=...
 */
router.get('/search', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { q = '' } = req.query;
        if (!q.trim()) {
            return res.status(400).json({
                success: false,
                message: 'أدخل نص البحث في المعامل q',
                example: '/api/national-visions/search?q=تقنية',
                timestamp: new Date().toISOString()
            });
        }
        const results = visionEngine.searchVisions(q);
        res.json({
            success: true,
            query: q,
            count: results.length,
            data: results,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /api/national-visions/progress ────────────────────────────────────
/**
 * تقرير تقدم رؤى الدول
 */
router.get('/progress', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const report = visionEngine.getProgressReport();
        res.json({ success: true, data: report, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /api/national-visions/opportunities ──────────────────────────────
/**
 * فرص الاستثمار عبر رؤى الدول
 * Query: ?sector=...
 */
router.get('/opportunities', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { sector = '' } = req.query;
        const opportunities = visionEngine.getInvestmentOpportunities(sector);
        res.json({ success: true, data: opportunities, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/national-visions/align ──────────────────────────────────────
/**
 * مواءمة نشاط تجاري مع رؤى الدول
 * Body: { sector, services, targetCountries, keywords }
 */
router.post('/align', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { sector, services, targetCountries, keywords } = req.body;

        if (!sector && !(services && services.length > 0)) {
            return res.status(400).json({
                success: false,
                message: 'أدخل قطاع النشاط (sector) أو الخدمات (services)',
                example: { sector: 'تقنية المعلومات', services: ['تطوير تطبيقات', 'ذكاء اصطناعي'], targetCountries: ['SA', 'AE'], keywords: ['رقمنة', 'ابتكار'] },
                timestamp: new Date().toISOString()
            });
        }

        const alignment = visionEngine.alignBusinessWithVisions({
            sector: sector || '',
            services: services || [],
            targetCountries: targetCountries || [],
            keywords: keywords || []
        });

        res.json({ success: true, data: alignment, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

module.exports = router;
