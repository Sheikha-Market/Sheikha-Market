/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔮 مسارات الرؤية الاستشارية — Advisory Vision Routes
 *
 * الطبقة الحاكمة الاستشارية — API endpoints
 * "وَشَاوِرْهُمْ فِي الْأَمْرِ" — آل عمران: ١٥٩
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();

let AdvisoryVisionEngine;
let advisoryEngine;

try {
    AdvisoryVisionEngine = require('../lib/sheikha-advisory-vision-engine.js');
    advisoryEngine = new AdvisoryVisionEngine();
    console.log('✅ [ADVISORY-VISION-ROUTES] الرؤية الاستشارية محمّلة — الطبقة الحاكمة جاهزة');
} catch (e) {
    console.log('⚠️ [ADVISORY-VISION-ROUTES] فشل تحميل الرؤية الاستشارية:', e.message);
    advisoryEngine = null;
}

function engineCheck(req, res) {
    if (!advisoryEngine) {
        res.status(503).json({
            success: false,
            message: 'محرك الرؤية الاستشارية غير متاح',
            timestamp: new Date().toISOString()
        });
        return false;
    }
    return true;
}

// ─── GET /api/advisory-vision/status ───────────────────────────────────────
/**
 * حالة الطبقة الحاكمة الاستشارية
 */
router.get('/status', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        res.json({ success: true, data: advisoryEngine.getStatus(), timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /api/advisory-vision/council ──────────────────────────────────────
/**
 * مجلس المستشارين — قائمة الوكلاء والمحركات المُدارة
 */
router.get('/council', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        res.json({ success: true, data: advisoryEngine.getAdvisoryCouncil(), timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /api/advisory-vision/report ───────────────────────────────────────
/**
 * التقرير الاستشاري الشامل
 */
router.get('/report', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        res.json({
            success: true,
            data: advisoryEngine.getComprehensiveAdvisoryReport(),
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/advisory-vision/consult ─────────────────────────────────────
/**
 * الاستشارة الشاملة — تجمع آراء جميع الوكلاء
 *
 * Body:
 * {
 *   subject: "موضوع الاستشارة",
 *   context: {
 *     sector, services, targetCountries, countries,
 *     keywords, businessType, budget, riskTolerance,
 *     hasInterest, hasGharar, hasHaram
 *   },
 *   domains: ["trade","sharia","investment","governance","market","technology","risk","legal"],
 *   priority: "balanced" | "sharia" | "financial" | "risk",
 *   includeNationalVisions: true
 * }
 */
router.post('/consult', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { subject, context, domains, priority, includeNationalVisions } = req.body;

        if (!subject || !subject.trim()) {
            return res.status(400).json({
                success: false,
                message: 'موضوع الاستشارة (subject) مطلوب',
                example: {
                    subject: 'إطلاق منصة تجارة إلكترونية للمعادن',
                    context: {
                        sector: 'تجارة المعادن',
                        targetCountries: ['SA', 'AE'],
                        budget: 500000,
                        hasInterest: false
                    },
                    domains: ['trade', 'sharia', 'risk', 'market']
                },
                timestamp: new Date().toISOString()
            });
        }

        const result = await advisoryEngine.consult({
            subject: subject.trim(),
            context: context || {},
            domains,
            priority,
            includeNationalVisions
        });

        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/advisory-vision/trade ───────────────────────────────────────
/**
 * استشارة تجارية متخصصة
 * Body: { subject, context: { businessType, targetMarkets, products, budget } }
 */
router.post('/trade', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { subject, context } = req.body;
        if (!subject) return res.status(400).json({ success: false, message: 'subject مطلوب', timestamp: new Date().toISOString() });
        const result = await advisoryEngine.getTradeAdvisory(subject, context);
        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/advisory-vision/sharia ──────────────────────────────────────
/**
 * استشارة شرعية
 * Body: { subject, context: { hasInterest, hasGharar, hasHaram } }
 */
router.post('/sharia', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { subject, context } = req.body;
        if (!subject) return res.status(400).json({ success: false, message: 'subject مطلوب', timestamp: new Date().toISOString() });
        const result = await advisoryEngine.getShariaAdvisory(subject, context);
        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/advisory-vision/investment ──────────────────────────────────
/**
 * استشارة استثمارية
 * Body: { subject, context: { amount, horizon, riskTolerance, sector } }
 */
router.post('/investment', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { subject, context } = req.body;
        if (!subject) return res.status(400).json({ success: false, message: 'subject مطلوب', timestamp: new Date().toISOString() });
        const result = await advisoryEngine.getInvestmentAdvisory(subject, context);
        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/advisory-vision/governance ──────────────────────────────────
/**
 * استشارة الحوكمة
 * Body: { subject, context: { orgType, size, country } }
 */
router.post('/governance', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { subject, context } = req.body;
        if (!subject) return res.status(400).json({ success: false, message: 'subject مطلوب', timestamp: new Date().toISOString() });
        const result = await advisoryEngine.getGovernanceAdvisory(subject, context);
        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/advisory-vision/market ──────────────────────────────────────
/**
 * استشارة السوق
 * Body: { subject, context: { targetSegment, competitors, geography } }
 */
router.post('/market', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { subject, context } = req.body;
        if (!subject) return res.status(400).json({ success: false, message: 'subject مطلوب', timestamp: new Date().toISOString() });
        const result = await advisoryEngine.getMarketAdvisory(subject, context);
        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/advisory-vision/technology ──────────────────────────────────
/**
 * استشارة تقنية
 * Body: { subject, context: { currentStack, scalability, securityLevel } }
 */
router.post('/technology', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { subject, context } = req.body;
        if (!subject) return res.status(400).json({ success: false, message: 'subject مطلوب', timestamp: new Date().toISOString() });
        const result = await advisoryEngine.getTechnologyAdvisory(subject, context);
        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/advisory-vision/risk ────────────────────────────────────────
/**
 * تقييم المخاطر
 * Body: { subject, context: { ... } }
 */
router.post('/risk', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { subject, context } = req.body;
        if (!subject) return res.status(400).json({ success: false, message: 'subject مطلوب', timestamp: new Date().toISOString() });
        const result = await advisoryEngine.getRiskAssessment(subject, context);
        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/advisory-vision/legal ───────────────────────────────────────
/**
 * استشارة قانونية
 * Body: { subject, context: { countries, businessType, contractType } }
 */
router.post('/legal', async (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { subject, context } = req.body;
        if (!subject) return res.status(400).json({ success: false, message: 'subject مطلوب', timestamp: new Date().toISOString() });
        const result = await advisoryEngine.getLegalAdvisory(subject, context);
        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /api/advisory-vision/evaluate-decision ───────────────────────────
/**
 * تقييم قرار استراتيجي
 * Body: {
 *   title, description,
 *   pros: [...], cons: [...],
 *   alternatives: [...], stakeholders: [...],
 *   timeframe, budget
 * }
 */
router.post('/evaluate-decision', (req, res) => {
    if (!engineCheck(req, res)) return;
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'عنوان القرار (title) مطلوب',
                example: {
                    title: 'إطلاق خدمة الاستشارات المدفوعة',
                    description: 'تقديم استشارات تجارية وشرعية مدفوعة عبر منظومة شيخة',
                    pros: ['مصدر دخل إضافي', 'تعزيز الموثوقية'],
                    cons: ['يحتاج موارد بشرية', 'المنافسة قوية'],
                    timeframe: '6 أشهر',
                    budget: 200000
                },
                timestamp: new Date().toISOString()
            });
        }

        const result = advisoryEngine.evaluateDecision(req.body);
        res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

module.exports = router;
