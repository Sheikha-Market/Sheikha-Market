/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🕌 API Routes — Sheikha Sovereignty System
 * نقاط وصول منظومة سيادة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const sovereignty = require('../lib/sheikha-sovereignty');

/**
 * GET /api/sovereignty/overview
 * نظرة عامة على المنظومة
 */
router.get('/overview', (req, res) => {
    try {
        const overview = {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            commander: sovereignty.commander,
            authCenter: sovereignty.authCenter,
            mission: sovereignty.mission,
            strategicPartner: sovereignty.strategicPartner,
            islamicValues: sovereignty.islamicValues,

            systems: [
                {
                    id: 1,
                    name: 'محرك التثمين العادل',
                    englishName: 'Fair Valuation Engine',
                    purpose: 'منع الظلم والغش والاحتكار في التسعير',
                    status: 'active',
                    icon: '🛡️'
                },
                {
                    id: 2,
                    name: 'نظام الكرامة الأسرية',
                    englishName: 'Family Dignity System',
                    purpose: 'القضاء على الفقر وحماية الأسر',
                    status: 'active',
                    icon: '🏠'
                },
                {
                    id: 3,
                    name: 'بوابة التوحيد والعلم',
                    englishName: 'Dawah & Education Module',
                    purpose: 'نشر الإسلام بالحكمة',
                    status: 'active',
                    icon: '📖'
                },
                {
                    id: 4,
                    name: 'حصن الأمان',
                    englishName: 'Anti-Evil Defense',
                    purpose: 'منع كل ما يهدم الكرامة',
                    status: 'active',
                    icon: '🛡️'
                }
            ],

            quran: [
                'وَأَحْسِن كَمَا أَحْسَنَ اللَّهُ إِلَيْكَ — القصص:77',
                'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ — النحل:90',
                'هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا — هود:61'
            ]
        };

        res.json({
            success: true,
            data: overview,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب النظرة العامة',
            error: error.message
        });
    }
});

/**
 * POST /api/sovereignty/valuation
 * تثمين عادل لسلعة
 */
router.post('/valuation', (req, res) => {
    try {
        const { item, marketData, context } = req.body;

        if (!item || !marketData) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إرسال بيانات السلعة والسوق'
            });
        }

        const valuation = sovereignty.fairValuationEngine(item, marketData, context);

        res.json({
            success: true,
            message: '✅ تم التثمين العادل',
            data: valuation,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التثمين',
            error: error.message
        });
    }
});

/**
 * POST /api/sovereignty/family-case
 * إنشاء حالة أسرية جديدة
 */
router.post('/family-case', async (req, res) => {
    try {
        const familyData = req.body;

        if (!familyData.members || !familyData.income) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إرسال بيانات الأسرة (عدد الأفراد والدخل على الأقل)'
            });
        }

        const familyCase = await sovereignty.familyDignitySystem(familyData);

        res.json({
            success: true,
            message: '✅ تم إنشاء ملف الحالة الأسرية',
            data: familyCase,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الحالة',
            error: error.message
        });
    }
});

/**
 * GET /api/sovereignty/family-case/:caseId
 * الحصول على حالة أسرية محددة
 */
router.get('/family-case/:caseId', (req, res) => {
    try {
        const { caseId } = req.params;
        const familyCase = sovereignty.activeCases.get(caseId);

        if (!familyCase) {
            return res.status(404).json({
                success: false,
                message: 'الحالة غير موجودة'
            });
        }

        res.json({
            success: true,
            data: familyCase,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الحالة',
            error: error.message
        });
    }
});

/**
 * GET /api/sovereignty/family-cases
 * جميع الحالات الأسرية النشطة
 */
router.get('/family-cases', (req, res) => {
    try {
        const cases = Array.from(sovereignty.activeCases.values());

        res.json({
            success: true,
            count: cases.length,
            data: cases,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الحالات',
            error: error.message
        });
    }
});

/**
 * POST /api/sovereignty/dawah
 * إنشاء رسالة دعوية
 */
router.post('/dawah', (req, res) => {
    try {
        const { target, language } = req.body;

        if (!target) {
            return res.status(400).json({
                success: false,
                message: 'يرجى تحديد الجمهور المستهدف'
            });
        }

        const dawahMessage = sovereignty.dawahEducationModule(target, language || 'ar');

        res.json({
            success: true,
            message: '✅ تم إنشاء رسالة دعوية',
            data: dawahMessage,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الرسالة',
            error: error.message
        });
    }
});

/**
 * GET /api/sovereignty/dawah-messages
 * جميع الرسائل الدعوية
 */
router.get('/dawah-messages', (req, res) => {
    try {
        const { limit } = req.query;
        const messages = limit
            ? sovereignty.educationSessions.slice(-parseInt(limit))
            : sovereignty.educationSessions;

        res.json({
            success: true,
            count: messages.length,
            total: sovereignty.educationSessions.length,
            data: messages,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الرسائل',
            error: error.message
        });
    }
});

/**
 * POST /api/sovereignty/defense
 * فحص نشاط للتأكد من سلامته
 */
router.post('/defense', (req, res) => {
    try {
        const { activity, context } = req.body;

        if (!activity) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إرسال النشاط للفحص'
            });
        }

        const defense = sovereignty.antiEvilDefense(activity, context);

        res.json({
            success: true,
            message: defense.security.blocked ? '🚫 النشاط محظور' : '✅ النشاط آمن',
            data: defense,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في الفحص',
            error: error.message
        });
    }
});

/**
 * GET /api/sovereignty/prevented-harms
 * الأضرار التي تم منعها
 */
router.get('/prevented-harms', (req, res) => {
    try {
        const { limit } = req.query;
        const harms = limit
            ? sovereignty.preventedHarms.slice(-parseInt(limit))
            : sovereignty.preventedHarms;

        res.json({
            success: true,
            count: harms.length,
            total: sovereignty.preventedHarms.length,
            data: harms,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الأضرار المنع',
            error: error.message
        });
    }
});

/**
 * POST /api/sovereignty/google-integration
 * تفعيل التكامل مع Google Cloud
 */
router.post('/google-integration', async (req, res) => {
    try {
        const credentials = req.body;

        const integration = await sovereignty.activateGoogleIntegration(credentials);

        res.json({
            success: integration.status === 'completed',
            message:
                integration.status === 'completed'
                    ? '✅ تم التكامل مع Google Cloud'
                    : '❌ فشل التكامل',
            data: integration,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التكامل',
            error: error.message
        });
    }
});

/**
 * GET /api/sovereignty/statistics
 * إحصائيات المنظومة
 */
router.get('/statistics', (req, res) => {
    try {
        const stats = sovereignty.getStatistics();

        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإحصائيات',
            error: error.message
        });
    }
});

/**
 * GET /api/sovereignty/report
 * تقرير شامل عن المنظومة
 */
router.get('/report', (req, res) => {
    try {
        const report = sovereignty.getFullReport();

        res.json({
            success: true,
            data: report,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في توليد التقرير',
            error: error.message
        });
    }
});

module.exports = router;
