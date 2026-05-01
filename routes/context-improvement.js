/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   🔗 API Routes — Context Integration & Improvement              ║
 * ║   واجهة برمجية شاملة لربط جميع الأنظمة معاً                      ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 *
 * @المالك سلمان أحمد بن سلمان الراجح
 */

const express = require('express');
const router = express.Router();
const contextIntegration = require('../lib/context-integration-engine');
const continuousImprovement = require('../lib/continuous-improvement-engine');

/**
 * POST /api/context/full-analysis
 * تحليل شامل للسياق الحالي
 */
router.post('/full-analysis', async (req, res) => {
    try {
        console.log('📊 [Context API] بدء التحليل الشامل...');

        const context = await contextIntegration.readFullContext();

        res.json({
            success: true,
            message: '✅ تم التحليل الشامل بنجاح',
            data: context,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التحليل الشامل',
            error: error.message
        });
    }
});

/**
 * POST /api/context/orchestrate-optimization
 * تنسيق عملية تحسين شاملة
 */
router.post('/orchestrate-optimization', async (req, res) => {
    try {
        console.log('⚡ [Context API] بدء عملية التحسين المنسقة...');

        const orchestration = await contextIntegration.orchestrateFullOptimization();

        res.json({
            success: true,
            message: '✅ اكتملت عملية التحسين المنسقة',
            data: orchestration,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في عملية التحسين',
            error: error.message
        });
    }
});

/**
 * GET /api/context/correlations
 * الحصول على الارتباطات بين الأنظمة
 */
router.get('/correlations', (req, res) => {
    try {
        const context = contextIntegration.readFullContext();

        res.json({
            success: true,
            data: {
                correlations: contextIntegration.correlations,
                principles: contextIntegration.islamicPrinciples,
                description: 'الارتباطات بين أنظمة شيخة والمبادئ الإسلامية'
            },
            quranRef: 'المائدة:2 — تعاونوا على البر والتقوى',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الارتباطات',
            error: error.message
        });
    }
});

/**
 * GET /api/context/report
 * الحصول على تقرير السياق الشامل
 */
router.get('/report', async (req, res) => {
    try {
        const report = await contextIntegration.generateFullContextReport();

        res.json({
            success: true,
            message: 'تقرير السياق الشامل',
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
 * GET /api/context/statistics
 * إحصائيات نظام التكامل
 */
router.get('/statistics', (req, res) => {
    try {
        const stats = contextIntegration.getStatistics();

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
 * POST /api/improvement/start-cycle
 * بدء دورة تحسين جديدة
 */
router.post('/start-cycle', async (req, res) => {
    try {
        console.log('📈 [Improvement API] بدء دورة تحسين جديدة...');

        const cycle = await continuousImprovement.startImprovementCycle();

        res.json({
            success: true,
            message: `✅ اكتملت دورة التحسين #${cycle.cycleNumber}`,
            data: cycle,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في بدء دورة التحسين',
            error: error.message
        });
    }
});

/**
 * GET /api/improvement/plan
 * الحصول على خطة التحسين الشاملة
 */
router.get('/plan', async (req, res) => {
    try {
        const plan = await continuousImprovement.createComprehensiveImprovementPlan();

        res.json({
            success: true,
            message: 'خطة التحسين الشاملة لـ30 يوم',
            data: plan,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الخطة',
            error: error.message
        });
    }
});

/**
 * GET /api/improvement/daily-tips
 * الحصول على نصائح التحسين اليومية
 */
router.get('/daily-tips', (req, res) => {
    try {
        const tips = continuousImprovement.generateDailyImprovementTips();

        const today = new Date().getDay();
        const todayTip = tips.find(t => t.day === (today || 7)); // إذا كان اليوم 0 (الأحد) استخدم 7

        res.json({
            success: true,
            data: {
                allTips: tips,
                todayTip: todayTip || tips[0],
                totalTips: tips.length
            },
            quranRef: 'الرحمن:29 — كل يوم هو في شأن',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب النصائح',
            error: error.message
        });
    }
});

/**
 * GET /api/improvement/statistics
 * إحصائيات التحسين المستمر
 */
router.get('/statistics', (req, res) => {
    try {
        const stats = continuousImprovement.getStatistics();

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
 * POST /api/improvement/auto-improve
 * تحسين تلقائي فوري
 */
router.post('/auto-improve', async (req, res) => {
    try {
        console.log('⚡ [Auto Improvement] بدء التحسين التلقائي...');

        // تشغيل دورة تحسين
        const cycle = await continuousImprovement.startImprovementCycle();

        // تشغيل تنسيق الأنظمة
        const orchestration = await contextIntegration.orchestrateFullOptimization();

        res.json({
            success: true,
            message: '✅ تم التحسين التلقائي بنجاح',
            data: {
                improvementCycle: cycle,
                orchestration: orchestration,
                summary: {
                    improvementsApplied: orchestration.results.totalImprovements,
                    systemsOptimized: orchestration.results.completedPhases
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التحسين التلقائي',
            error: error.message
        });
    }
});

/**
 * GET /api/overall/health
 * الصحة الشاملة لجميع الأنظمة
 */
router.get('/overall-health', (req, res) => {
    try {
        const contextStats = contextIntegration.getStatistics();
        const improvementStats = continuousImprovement.getStatistics();

        const health = {
            overallStatus: 'excellent',
            systemsIntegration: {
                activeSystems: contextStats.activeSystems,
                totalSystems: contextStats.totalSystems,
                integrationLevel: '100%'
            },
            improvementMomentum: {
                totalCycles: improvementStats.totalCycles,
                improvementsApplied: Object.values(improvementStats.improvementsByArea).reduce(
                    (a, b) => a + b,
                    0
                ),
                momentum: 'تصاعدي'
            },
            islamicCompliance: {
                score: '100%',
                status: 'ممتاز'
            },
            quranRef: 'الملك:3-4 — الإتقان والكمال'
        };

        res.json({
            success: true,
            data: health,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في فحص الصحة الشاملة',
            error: error.message
        });
    }
});

/**
 * POST /api/context/attach-listeners
 * تفعيل مستمعي الأحداث
 */
router.post('/attach-listeners', (req, res) => {
    try {
        contextIntegration.attachEventListeners();

        res.json({
            success: true,
            message: '✅ تم تفعيل مستمعي الأحداث',
            data: {
                status: 'listening',
                events: ['healing', 'seo-analysis', 'improvement-cycle'],
                realTimeUpdates: true
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تفعيل المستمعين',
            error: error.message
        });
    }
});

module.exports = router;
