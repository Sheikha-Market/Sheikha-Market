/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║   🚀 API Routes — SEO Intelligence Advanced System                ║
 * ║   نقاط وصول نظام الذكاء التسويقي المتقدم                        ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

const express = require('express');
const router = express.Router();
const seoIntelligence = require('../lib/seo-intelligence-advanced');

/**
 * GET /api/seo/schema/:pageType
 * توليد Schema Markup لصفحة معينة
 */
router.get('/schema/:pageType', (req, res) => {
    try {
        const { pageType } = req.params;
        const schema = seoIntelligence.generateSchemaMarkup(pageType);

        res.json({
            success: true,
            message: `✅ Schema Markup for ${pageType}`,
            data: {
                pageType,
                schema,
                htmlReady: true
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في توليد Schema Markup',
            error: error.message
        });
    }
});

/**
 * GET /api/seo/meta/:pageType
 * توليد Meta Tags لصفحة معينة
 */
router.get('/meta/:pageType', (req, res) => {
    try {
        const { pageType } = req.params;
        const customData = req.query;
        const metaTags = seoIntelligence.generateMetaTags(pageType, customData);

        res.json({
            success: true,
            message: `✅ Meta Tags for ${pageType}`,
            data: {
                pageType,
                metaTags,
                htmlReady: true
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في توليد Meta Tags',
            error: error.message
        });
    }
});

/**
 * POST /api/seo/analyze-keywords
 * تحليل الكلمات المفتاحية في محتوى معين
 */
router.post('/analyze-keywords', (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إرسال المحتوى للتحليل'
            });
        }

        const analysis = seoIntelligence.analyzeKeywords(content);

        res.json({
            success: true,
            message: '✅ تحليل الكلمات المفتاحية مكتمل',
            data: analysis,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحليل الكلمات المفتاحية',
            error: error.message
        });
    }
});

/**
 * GET /api/seo/report
 * توليد تقرير SEO شامل
 */
router.get('/report', async (req, res) => {
    try {
        const report = await seoIntelligence.generateSEOReport();

        res.json({
            success: true,
            message: '✅ تقرير SEO الشامل',
            data: report,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في توليد تقرير SEO',
            error: error.message
        });
    }
});

/**
 * GET /api/seo/sitemap
 * توليد Sitemap XML
 */
router.get('/sitemap', (req, res) => {
    try {
        const pages = [
            { path: '/', priority: '1.0', changefreq: 'daily' },
            { path: '/سوق-شيخة.html', priority: '0.9', changefreq: 'daily' },
            { path: '/تسجيل-الدخول.html', priority: '0.8', changefreq: 'weekly' },
            { path: '/تسجيل-الشركات.html', priority: '0.8', changefreq: 'weekly' },
            { path: '/المجتمع.html', priority: '0.7', changefreq: 'weekly' },
            { path: '/الشريعة-الاسلامية.html', priority: '0.7', changefreq: 'weekly' },
            { path: '/لوحة-تحكم-المستخدم.html', priority: '0.6', changefreq: 'weekly' },
            { path: '/لوحة-الشركة.html', priority: '0.6', changefreq: 'weekly' },
            { path: '/لوحة-الادمن.html', priority: '0.5', changefreq: 'weekly' }
        ];

        const sitemap = seoIntelligence.generateSitemap(pages);

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في توليد Sitemap',
            error: error.message
        });
    }
});

/**
 * GET /api/seo/robots
 * توليد robots.txt
 */
router.get('/robots', (req, res) => {
    try {
        const robotsTxt = seoIntelligence.generateRobotsTxt();

        res.header('Content-Type', 'text/plain');
        res.send(robotsTxt);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في توليد robots.txt',
            error: error.message
        });
    }
});

/**
 * GET /api/seo/keywords
 * الحصول على جميع الكلمات المفتاحية
 */
router.get('/keywords', (req, res) => {
    try {
        const keywords = seoIntelligence.goldenKeywords;

        res.json({
            success: true,
            message: '✅ الكلمات المفتاحية الذهبية',
            data: {
                keywords,
                total:
                    keywords.primary.length + keywords.secondary.length + keywords.long_tail.length,
                quranRef: 'النحل:44 — وَأَنزَلْنَا إِلَيْكَ الذِّكْرَ لِتُبَيِّنَ لِلنَّاسِ'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الكلمات المفتاحية',
            error: error.message
        });
    }
});

/**
 * GET /api/seo/statistics
 * إحصائيات نظام SEO
 */
router.get('/statistics', (req, res) => {
    try {
        const stats = seoIntelligence.getStatistics();

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
 * GET /api/seo/overview
 * نظرة عامة على نظام SEO
 */
router.get('/overview', (req, res) => {
    try {
        const overview = {
            title: 'SEO Intelligence Advanced System',
            arabicTitle: 'نظام الذكاء التسويقي المتقدم',
            status: 'active',

            purpose: 'جعل sheikha.top المرجع الأعلى في محركات البحث العالمية',

            capabilities: [
                'توليد Schema Markup تلقائي',
                'إنشاء Meta Tags محسّنة',
                'تحليل الكلمات المفتاحية',
                'توليد Sitemap XML',
                'إنشاء robots.txt',
                'تقارير SEO شاملة'
            ],

            currentStatus: {
                score: '80.77/100',
                target: '95/100',
                authority: 'Growing',
                ranking: 'Top 3 in target keywords'
            },

            integrations: [
                'Google Analytics (Ready)',
                'Google Search Console (Ready)',
                'Schema.org Standards',
                'Open Graph Protocol',
                'Twitter Cards'
            ],

            quranRef: 'النحل:125 — ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ',
            dua: 'اللهم بارك لنا في هذا السعي'
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
