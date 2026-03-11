/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   🎓 API Routes — Global Academic Research Intelligence          ║
 * ║   نقاط وصول نظام الذكاء البحثي الأكاديمي العالمي               ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

const express = require('express');
const router = express.Router();
const academicIntelligence = require('../lib/global-academic-intelligence');

/**
 * GET /api/academic/universities
 * تحليل جميع الجامعات العالمية
 */
router.get('/universities', async (req, res) => {
    try {
        const analysis = await academicIntelligence.analyzeAllUniversities();

        res.json({
            success: true,
            message: `✅ تحليل ${analysis.totalUniversities} جامعة`,
            data: analysis,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحليل الجامعات',
            error: error.message
        });
    }
});

/**
 * GET /api/academic/research-centers
 * تحليل مراكز البحث والتطوير العالمية
 */
router.get('/research-centers', async (req, res) => {
    try {
        const analysis = await academicIntelligence.analyzeResearchCenters();

        res.json({
            success: true,
            message: `✅ تحليل ${analysis.totalCenters} مركز بحث`,
            data: analysis,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحليل مراكز البحث',
            error: error.message
        });
    }
});

/**
 * GET /api/academic/methodologies
 * مقارنة المناهج البحثية
 */
router.get('/methodologies', async (req, res) => {
    try {
        const comparison = await academicIntelligence.compareMethodologies();

        res.json({
            success: true,
            message: '✅ مقارنة شاملة للمناهج البحثية',
            data: comparison,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في مقارنة المناهج',
            error: error.message
        });
    }
});

/**
 * GET /api/academic/superior-architecture
 * بناء المعمارية المتفوقة لشيخة
 */
router.get('/superior-architecture', async (req, res) => {
    try {
        const architecture = await academicIntelligence.buildSuperiorArchitecture();

        res.json({
            success: true,
            message: '✅ المعمارية المتفوقة لشيخة',
            data: architecture,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في بناء المعمارية',
            error: error.message
        });
    }
});

/**
 * GET /api/academic/comprehensive-report
 * تقرير شامل لجميع التحليلات
 */
router.get('/comprehensive-report', async (req, res) => {
    try {
        const report = await academicIntelligence.generateComprehensiveReport();

        res.json({
            success: true,
            message: '✅ التقرير الشامل للذكاء الأكاديمي العالمي',
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
 * GET /api/academic/statistics
 * إحصائيات النظام
 */
router.get('/statistics', (req, res) => {
    try {
        const stats = academicIntelligence.getStatistics();

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
 * GET /api/academic/islamic-universities
 * الجامعات الإسلامية فقط
 */
router.get('/islamic-universities', async (req, res) => {
    try {
        const analysis = await academicIntelligence.analyzeAllUniversities();
        const islamicOnly = analysis.islamicUniversities;

        res.json({
            success: true,
            message: `✅ ${islamicOnly.length} جامعة إسلامية`,
            data: {
                universities: islamicOnly,
                totalCount: islamicOnly.length,
                averageScore: islamicOnly.reduce((acc, u) => acc + u.score, 0) / islamicOnly.length,
                quranRef: 'التوبة:122 — ليتفقهوا في الدين'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الجامعات الإسلامية',
            error: error.message
        });
    }
});

/**
 * GET /api/academic/tools
 * الأدوات البحثية المتاحة
 */
router.get('/tools', (req, res) => {
    try {
        const allTools = academicIntelligence.researchTools;

        res.json({
            success: true,
            message: '✅ جميع الأدوات البحثية',
            data: {
                tools: allTools,
                totalCategories: Object.keys(allTools).length,
                totalTools: Object.values(allTools).flat().length,
                quranRef: 'الحديد:25 — وأنزلنا الحديد فيه بأس شديد'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الأدوات',
            error: error.message
        });
    }
});

/**
 * GET /api/academic/search-engines
 * المحركات البحثية الأكاديمية
 */
router.get('/search-engines', (req, res) => {
    try {
        const engines = academicIntelligence.academicSearchEngines;

        res.json({
            success: true,
            message: '✅ المحركات البحثية الأكاديمية',
            data: {
                engines,
                totalEngines: engines.length,
                freeEngines: engines.filter(e => e.access === 'Free').length,
                paidEngines: engines.filter(e => e.access === 'Subscription').length
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المحركات',
            error: error.message
        });
    }
});

/**
 * POST /api/academic/compare
 * مقارنة مؤسسات محددة
 */
router.post('/compare', async (req, res) => {
    try {
        const { names } = req.body;

        if (!names || !Array.isArray(names) || names.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'يرجى تحديد مؤسستين على الأقل للمقارنة'
            });
        }

        const universities = academicIntelligence.topUniversities.filter(
            uni => names.some(name =>
                uni.name.toLowerCase().includes(name.toLowerCase()) ||
                uni.arabicName.includes(name)
            )
        );

        const comparison = {
            universities,
            count: universities.length,
            comparison: {
                budgets: universities.map(u => ({ name: u.name, budget: u.researchBudget })),
                architectures: universities.map(u => ({ name: u.name, model: u.architecture.model })),
                methodologies: universities.map(u => ({ name: u.name, method: u.researchMethodology.primary })),
                islamicScores: universities.map(u => ({ name: u.name, score: u.islamicScore }))
            }
        };

        res.json({
            success: true,
            message: '✅ المقارنة جاهزة',
            data: comparison,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في المقارنة',
            error: error.message
        });
    }
});

/**
 * GET /api/academic/overview
 * نظرة عامة على النظام
 */
router.get('/overview', async (req, res) => {
    try {
        const stats = academicIntelligence.getStatistics();

        const overview = {
            title: 'Global Academic Research Intelligence System',
            arabicTitle: 'نظام الذكاء البحثي الأكاديمي العالمي',
            status: 'active',

            coverage: {
                universities: `${stats.totalUniversities} جامعة`,
                researchCenters: `${stats.totalResearchCenters} مركز بحث`,
                methodologies: `${stats.totalMethodologies} منهج`,
                tools: `${stats.totalTools} أداة`,
                searchEngines: `${stats.totalSearchEngines} محرك بحث`,
                islamicUniversities: `${stats.islamicUniversities} جامعة إسلامية`
            },

            capabilities: [
                'تحليل شامل للجامعات العالمية',
                'مقارنة مراكز البحث والتطوير',
                'تحليل المناهج البحثية',
                'توصيات للأدوات',
                'بناء معمارية متفوقة',
                'تكامل إسلامي كامل'
            ],

            sheikhaSuperior: {
                status: '✅ تفوق شيخة على جميع المؤسسات',
                reasons: [
                    '🕌 المبادئ الإسلامية من القرآن والسنة',
                    '📚 تقليد علمي 1400+ سنة',
                    '🔬 تكامل العلوم الكلاسيكية والحديثة',
                    '⚖️ إطار أخلاقي مدمج',
                    '🌍 تأثير عالمي (1.8+ مليار مسلم)',
                    '🛡️ مبدأ عدم الضرر'
                ]
            },

            quranRef: 'العلق:1-5 — اقرأ باسم ربك الذي خلق',
            dua: 'رب اشرح لي صدري ويسر لي أمري'
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
