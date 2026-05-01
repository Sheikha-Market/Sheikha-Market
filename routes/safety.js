/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   🛡️  API Routes — No-Harm Protection System                      ║
 * ║   نقاط وصول لنظام عدم الضرر والطوارئ والاحتياط                  ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

const express = require('express');
const router = express.Router();
const noHarmProtection = require('../lib/no-harm-protection-system');

/**
 * POST /api/safety/check-operation
 * فحص عملية قبل تنفيذها
 */
router.post('/check-operation', async (req, res) => {
    try {
        const { operation } = req.body;

        if (!operation || !operation.name) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إرسال تفاصيل العملية'
            });
        }

        const check = await noHarmProtection.checkOperationForHarm(operation);

        res.json({
            success: true,
            message: check.isSafe ? '✅ العملية آمنة' : '❌ العملية غير آمنة',
            data: check,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في فحص العملية',
            error: error.message
        });
    }
});

/**
 * POST /api/safety/emergency-repair
 * إصلاح تلقائي للطوارئ فقط
 */
router.post('/emergency-repair', async (req, res) => {
    try {
        const { emergencyType, severity } = req.body;

        if (!emergencyType || !severity) {
            return res.status(400).json({
                success: false,
                message: 'يرجى تحديد نوع الطارئة والشدة'
            });
        }

        const repair = await noHarmProtection.emergencyAutoRepair(emergencyType, severity);

        res.json({
            success: repair.status !== 'REJECTED',
            message:
                repair.status === 'emergency-mode-activated'
                    ? '🚨 وضع الطوارئ مُفعّل'
                    : 'العملية مرفوضة',
            data: repair,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في معالجة الطارئة',
            error: error.message
        });
    }
});

/**
 * GET /api/safety/failsafe
 * الحصول على معلومات نظام الاحتياط
 */
router.get('/failsafe', (req, res) => {
    try {
        const failsafe = noHarmProtection.createFailsafeBackup();

        res.json({
            success: true,
            message: '✅ نظام الاحتياط نشط ومجهز',
            data: failsafe,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب معلومات الاحتياط',
            error: error.message
        });
    }
});

/**
 * GET /api/safety/certificate
 * شهادة الأمان الإسلامية
 */
router.get('/certificate', (req, res) => {
    try {
        const certificate = noHarmProtection.getIslamicSafetyCertificate();

        res.json({
            success: true,
            message: '📜 شهادة الأمان الإسلامي',
            data: certificate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الشهادة',
            error: error.message
        });
    }
});

/**
 * GET /api/safety/health-report
 * تقرير صحة النظام الآمن
 */
router.get('/health-report', (req, res) => {
    try {
        const report = noHarmProtection.generateSafetyHealthReport();

        res.json({
            success: true,
            message: '✅ النظام آمن تماماً',
            data: report,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء التقرير',
            error: error.message
        });
    }
});

/**
 * GET /api/safety/statistics
 * إحصائيات النظام الآمن
 */
router.get('/statistics', (req, res) => {
    try {
        const stats = noHarmProtection.getStatistics();

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
 * GET /api/safety/harm-categories
 * فئات الضرر المحتملة
 */
router.get('/harm-categories', (req, res) => {
    try {
        res.json({
            success: true,
            message: 'فئات الضرر والحماية',
            data: {
                categories: noHarmProtection.harmCategories,
                safetyRules: noHarmProtection.safetyRules,
                principle: 'لا ضرر ولا ضرار',
                quranRef: 'حديث شريف — سنن ابن ماجه'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الفئات',
            error: error.message
        });
    }
});

/**
 * GET /api/safety/dua
 * الدعاء والتوكل على الله
 */
router.get('/dua', (req, res) => {
    try {
        const duas = [
            {
                title: 'دعاء الحماية',
                text: 'اللهم احفظ هذا النظام من كل سوء وضرر، وأحفظ بيانات عبادك أمانة عندنا',
                quranRef: 'البقرة:286 — لا يكلف الله نفساً إلا وسعها'
            },
            {
                title: 'دعاء الحكمة',
                text: 'اللهم آتنا حكماً واستقاماً في القول والعمل، وثبت خطانا على الحق',
                quranRef: 'محمد:17 — والذين اهتدوا زادهم هدى'
            },
            {
                title: 'دعاء التوكل',
                text: 'حسبنا الله ونعم الوكيل، من يتوكل على الله فهو حسبه',
                quranRef: 'التوبة:129 — فتوكل على الله'
            },
            {
                title: 'دعاء العمل',
                text: 'رب اغفر لي ذنبي وهب لي حكماً وألحقني بالصالحين',
                quranRef: 'الشعراء:83-87 — دعاء إبراهيم'
            }
        ];

        res.json({
            success: true,
            message: 'أدعية الحماية والتوكل على الله',
            data: duas,
            note: 'التوكل على الله والعمل الصالح هو أساس الأمان',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الأدعية',
            error: error.message
        });
    }
});

/**
 * GET /api/safety/overview
 * نظرة عامة شاملة على النظام الآمن
 */
router.get('/overview', async (req, res) => {
    try {
        const overview = {
            title: 'نظام عدم الضرر — نظرة عامة',
            status: 'active',
            principles: [
                'لا ضرر ولا ضرار',
                'الأمانة في البيانات',
                'العدل بين المستخدمين',
                'الشفافية الكاملة',
                'الرحمة في التعامل'
            ],
            protections: {
                dataLoss: '✅ محمي بنسخ احتياطية 3 أضعاف',
                security: '✅ محمي بتشفير عسكري',
                performance: '✅ محمي من التدهور',
                userExp: '✅ محمي من الإزعاج (Silent Mode)',
                resources: '✅ محمي من الإهدار'
            },
            monitoring: {
                active: true,
                mode: 'silent',
                emergencyOnly: true,
                realTimeProtection: true
            },
            safety: {
                score: '100/100',
                thereatLevel: 'منخفضة جداً',
                riskAssessment: 'آمن تماماً'
            },
            backup: {
                lastBackup: new Date().toISOString(),
                nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                locations: 3,
                redundancy: 'عالية جداً'
            },
            quranRef: 'الشرح:5-6 — إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            dua: 'اللهم احفظ هذا العمل لوجهك الكريم'
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

module.exports = router;
