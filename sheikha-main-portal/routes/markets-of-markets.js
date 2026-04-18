/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🌐 مسارات سوق الأسواق — الجامع الموحّد لكل الأسواق
 *  Market-of-Markets Routes
 *
 *  GET  /api/markets-of-markets                     → السوق الجامع (كل الأسواق)
 *  GET  /api/markets-of-markets/sectors             → القطاعات المتاحة
 *  GET  /api/markets-of-markets/types               → أنواع الأسواق (حقيقي/إلكتروني/رقمي)
 *  GET  /api/markets-of-markets/search              → بحث موحّد عبر كل الأسواق
 *  GET  /api/markets-of-markets/:id                 → تفاصيل سوق
 *  POST /api/markets-of-markets                     → تسجيل سوق جديد
 *  GET  /api/markets-of-markets/:id/sharia-audit    → التدقيق الشرعي للسوق
 *  POST /api/markets-of-markets/:id/sharia-audit    → تحديث التدقيق الشرعي
 *  GET  /api/markets-of-markets/stats/overview      → إحصائيات السوق الجامع
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express      = require('express');
const router       = express.Router();
const MarketUnit   = require('../models/MarketUnit');
const Organization = require('../models/Organization');

// ─── السوق الجامع — عرض كل الأسواق ──────────────────────────────────────────

router.get('/', (req, res) => {
    const { sector, marketType, status, verified, shariaOnly } = req.query;

    const query = {};
    if (sector)     query.sector     = sector;
    if (marketType) query.marketType = marketType;
    if (status)     query.status     = status;
    if (verified !== undefined) query.verified = verified === 'true';

    let markets = MarketUnit.find(query);

    // فلترة الامتثال الشرعي
    if (shariaOnly === 'true') {
        markets = markets.filter(m => m.isShariaCompliant());
    }

    // تجميع حسب القطاع
    const bySector = {};
    markets.forEach(m => {
        if (!bySector[m.sector]) bySector[m.sector] = [];
        bySector[m.sector].push(m.getSummary());
    });

    res.json({
        success: true,
        bismillah: 'بسم الله الرحمن الرحيم',
        title: 'سوق شيخة للأسواق — الجامع الموحّد لكل الأسواق',
        mission: 'رقمنة الأسواق الحقيقية والإلكترونية والرقمية بالكتاب والسنة وتوحيدها لله',
        totalCount: markets.length,
        markets: markets.map(m => m.getSummary()),
        bySector,
        filterApplied: { sector, marketType, status, verified, shariaOnly }
    });
});

// ─── القطاعات المتاحة ─────────────────────────────────────────────────────────

router.get('/sectors', (req, res) => {
    const sectorInfo = {
        metals: {
            id: 'metals',
            nameAr: 'المعادن والسكراب',
            nameEn: 'Metals & Scrap',
            icon: '⚙️',
            subSectors: ['الحديد', 'الذهب', 'الفضة', 'النحاس', 'الألمنيوم', 'المعادن النادرة'],
            shariaNote: 'الذهب والفضة: يُشترط التقابض في المجلس للجنس الواحد'
        },
        agriculture: {
            id: 'agriculture',
            nameAr: 'الزراعة والأغذية الحلال',
            nameEn: 'Agriculture & Halal Food',
            icon: '🌾',
            subSectors: ['الحبوب', 'التمور', 'الزيتون', 'الأسماك الحلال', 'العضوي'],
            shariaNote: 'يُشترط أن يكون المنتج حلالاً وطيباً'
        },
        technology: {
            id: 'technology',
            nameAr: 'البرمجيات والأجهزة',
            nameEn: 'Technology & Software',
            icon: '💻',
            subSectors: ['SaaS', 'IoT', 'AI & Data', 'أجهزة', 'خدمات سحابية'],
            shariaNote: 'يُشترط ألا يكون المنتج وسيلةً للحرام'
        },
        services: {
            id: 'services',
            nameAr: 'الخدمات واللوجستيك',
            nameEn: 'Services & Logistics',
            icon: '🚚',
            subSectors: ['الشحن', 'التخزين', 'التأمين الإسلامي (تكافل)', 'الاستشارات'],
            shariaNote: 'التأمين: يُشترط أن يكون تكافلياً لا تجارياً'
        },
        science: {
            id: 'science',
            nameAr: 'البحث والتطوير',
            nameEn: 'Research & Development',
            icon: '🔬',
            subSectors: ['البراءات', 'الكفاءات', 'البيانات الحلال', 'الأبحاث'],
            shariaNote: 'يُشترط ألا يُستخدم البحث في ما يضر البشر أو يحرمه الشرع'
        },
        'real-estate': {
            id: 'real-estate',
            nameAr: 'العقارات',
            nameEn: 'Real Estate',
            icon: '🏗️',
            subSectors: ['سكني', 'تجاري', 'صناعي', 'زراعي'],
            shariaNote: 'يُشترط الشفافية في العقود وعدم الغرر'
        },
        education: {
            id: 'education',
            nameAr: 'التعليم والتدريب',
            nameEn: 'Education & Training',
            icon: '📚',
            subSectors: ['دورات إسلامية', 'تقنية', 'تجارية', 'مهنية'],
            shariaNote: 'طلب العلم فريضة — العلم النافع من أفضل الصدقات'
        }
    };

    res.json({
        success: true,
        count: Object.keys(sectorInfo).length,
        sectors: sectorInfo
    });
});

// ─── أنواع الأسواق ────────────────────────────────────────────────────────────

router.get('/types', (req, res) => {
    res.json({
        success: true,
        types: {
            physical: {
                id: 'physical',
                nameAr: 'سوق حقيقي',
                nameEn: 'Physical Market',
                icon: '🏪',
                description: 'سوق بموقع جغرافي فعلي — مبنى أو منطقة تجارية',
                examples: ['سوق المعادن بالرياض', 'سوق السكراب بجدة']
            },
            electronic: {
                id: 'electronic',
                nameAr: 'سوق إلكتروني',
                nameEn: 'Electronic Market',
                icon: '🛒',
                description: 'سوق عبر الإنترنت — موقع ويب أو تطبيق جوال',
                examples: ['متجر إلكتروني للمعادن', 'منصة بيع وشراء الزراعة']
            },
            digital: {
                id: 'digital',
                nameAr: 'سوق رقمي',
                nameEn: 'Digital Market',
                icon: '🌐',
                description: 'سوق للأصول الرقمية — برمجيات، بيانات، ملكية فكرية',
                examples: ['سوق البرمجيات الإسلامية', 'سوق البيانات الحلال']
            },
            hybrid: {
                id: 'hybrid',
                nameAr: 'سوق هجين',
                nameEn: 'Hybrid Market',
                icon: '🔗',
                description: 'يجمع بين الحقيقي والإلكتروني والرقمي',
                examples: ['سوق شيخة الجامع']
            }
        }
    });
});

// ─── إحصائيات السوق الجامع ────────────────────────────────────────────────────

router.get('/stats/overview', (req, res) => {
    const allMarkets = MarketUnit.find();
    const allOrgs    = Organization.find();

    const byType = { physical: 0, electronic: 0, digital: 0, hybrid: 0 };
    const bySector = {};
    let totalSellers  = 0;
    let totalListings = 0;
    let shariaCompliantCount = 0;

    allMarkets.forEach(m => {
        byType[m.marketType] = (byType[m.marketType] || 0) + 1;
        bySector[m.sector]   = (bySector[m.sector]   || 0) + 1;
        totalSellers         += m.stats.totalSellers   || 0;
        totalListings        += m.stats.totalListings  || 0;
        if (m.isShariaCompliant()) shariaCompliantCount++;
    });

    res.json({
        success: true,
        overview: {
            totalOrganizations:        allOrgs.length,
            activeOrganizations:       allOrgs.filter(o => o.status === 'active').length,
            totalMarkets:              allMarkets.length,
            activeMarkets:             allMarkets.filter(m => m.status === 'active').length,
            shariaCompliantMarkets:    shariaCompliantCount,
            shariaComplianceRate:      allMarkets.length
                ? Math.round((shariaCompliantCount / allMarkets.length) * 100)
                : 100,
            totalSellers,
            totalListings,
            marketsByType:   byType,
            marketsBySector: bySector
        },
        timestamp: new Date().toISOString()
    });
});

// ─── بحث موحّد عبر كل الأسواق ────────────────────────────────────────────────

router.get('/search', (req, res) => {
    const { q, sector, marketType, shariaOnly } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال كلمة بحث (حدٌّها الأدنى حرفان)'
        });
    }

    const term = q.trim().toLowerCase();
    let markets = MarketUnit.find();

    // فلترة بالنص
    markets = markets.filter(m => {
        const text = [m.nameAr, m.nameEn, m.description, m.sector]
            .join(' ').toLowerCase();
        return text.includes(term);
    });

    // فلترات إضافية
    if (sector)     markets = markets.filter(m => m.sector     === sector);
    if (marketType) markets = markets.filter(m => m.marketType === marketType);
    if (shariaOnly === 'true') markets = markets.filter(m => m.isShariaCompliant());

    res.json({
        success: true,
        query: q,
        count: markets.length,
        results: markets.map(m => m.getSummary())
    });
});

// ─── تفاصيل سوق ───────────────────────────────────────────────────────────────

router.get('/:id', (req, res) => {
    const market = MarketUnit.findById(req.params.id);

    if (!market) {
        return res.status(404).json({
            success: false,
            message: 'السوق غير موجود'
        });
    }

    // تحميل بيانات المنظمة المشرفة
    const org = market.orgId ? Organization.findById(market.orgId) : null;

    res.json({
        success: true,
        market,
        organization: org ? org.getSummary() : null
    });
});

// ─── تسجيل سوق جديد (مباشر — مستقل عن المنظمة) ─────────────────────────────

router.post('/', (req, res) => {
    const {
        name, nameAr, nameEn, description,
        marketType, sector,
        orgId,
        location, digital,
        shariaCompliance, operationalData,
        tags
    } = req.body;

    if (!name && !nameAr) {
        return res.status(400).json({
            success: false,
            message: 'اسم السوق مطلوب'
        });
    }

    if (!marketType || !Object.values(MarketUnit.TYPES).includes(marketType)) {
        return res.status(400).json({
            success: false,
            message: `نوع السوق مطلوب. الأنواع المتاحة: ${Object.values(MarketUnit.TYPES).join(' | ')}`
        });
    }

    // التحقق من المنظمة إن وُجدت
    let supervisingOrg = null;
    if (orgId) {
        supervisingOrg = Organization.findById(orgId);
        if (!supervisingOrg) {
            return res.status(404).json({
                success: false,
                message: 'المنظمة المشرفة غير موجودة'
            });
        }
        if (supervisingOrg.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'المنظمة غير مفعّلة — يجب قبول الميثاق الشرعي أولاً'
            });
        }
    }

    const market = MarketUnit.create({
        name:    nameAr || name,
        nameAr:  nameAr || name,
        nameEn:  nameEn  || '',
        description: description || '',
        marketType,
        sector:  sector || MarketUnit.SECTORS.OTHER,
        orgId:   orgId   || null,
        location,
        digital,
        shariaCompliance,
        operationalData,
        tags: tags || [],
        status: 'active'
    });

    // ربط بالمنظمة
    if (supervisingOrg) {
        supervisingOrg.addMarket(market.id);
    }

    res.status(201).json({
        success: true,
        message: 'تم تسجيل السوق في سوق الأسواق',
        market: market.getSummary(),
        shariaScore: market.shariaCompliance.auditScore
    });
});

// ─── التدقيق الشرعي للسوق — قراءة ────────────────────────────────────────────

router.get('/:id/sharia-audit', (req, res) => {
    const market = MarketUnit.findById(req.params.id);

    if (!market) {
        return res.status(404).json({
            success: false,
            message: 'السوق غير موجود'
        });
    }

    const s = market.shariaCompliance;

    const auditReport = {
        marketId:   market.id,
        marketName: market.nameAr || market.name,
        auditDate:  s.lastAuditAt || new Date().toISOString(),
        score:      s.auditScore,
        status:     s.auditScore === 100 ? 'متوافق تماماً' : s.auditScore >= 75 ? 'متوافق جزئياً' : 'غير متوافق',
        checks: [
            {
                rule:      'تحريم الربا',
                status:    s.noRiba   ? 'pass' : 'fail',
                reference: 'البقرة: 275 — وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا'
            },
            {
                rule:      'تحريم الغرر',
                status:    s.noGharar ? 'pass' : 'fail',
                reference: 'حديث صحيح — نهى النبي ﷺ عن بيع الغرر'
            },
            {
                rule:      'تحريم الغش',
                status:    s.noGhish  ? 'pass' : 'fail',
                reference: 'حديث صحيح — من غشّنا فليس منّا'
            },
            {
                rule:      'تحريم الاحتكار',
                status:    s.noIhtikar ? 'pass' : 'fail',
                reference: 'حديث صحيح — لا يحتكر إلا خاطئ'
            },
            {
                rule:      'اشتراط الحلال في المنتجات',
                status:    s.isHalal   ? 'pass' : 'fail',
                reference: 'المائدة: 88 — وَكُلُوا مِمَّا رَزَقَكُمُ اللَّهُ حَلَالًا طَيِّبًا'
            },
            {
                rule:      'دعم حساب الزكاة',
                status:    s.zakatEligible ? 'pass' : 'warn',
                reference: 'البقرة: 43 — وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ'
            }
        ],
        recommendation: s.auditScore === 100
            ? 'ماشاء الله — السوق متوافق مع الشريعة الإسلامية'
            : 'يُرجى مراجعة البنود التي لم تجتاز التدقيق وتصحيحها'
    };

    res.json({
        success: true,
        auditReport
    });
});

// ─── تحديث التدقيق الشرعي للسوق ─────────────────────────────────────────────

router.post('/:id/sharia-audit', (req, res) => {
    const market = MarketUnit.findById(req.params.id);

    if (!market) {
        return res.status(404).json({
            success: false,
            message: 'السوق غير موجود'
        });
    }

    const { noRiba, noGharar, noGhish, noIhtikar, isHalal, zakatEligible, auditorRef } = req.body;

    if (noRiba       !== undefined) market.shariaCompliance.noRiba       = Boolean(noRiba);
    if (noGharar     !== undefined) market.shariaCompliance.noGharar     = Boolean(noGharar);
    if (noGhish      !== undefined) market.shariaCompliance.noGhish      = Boolean(noGhish);
    if (noIhtikar    !== undefined) market.shariaCompliance.noIhtikar    = Boolean(noIhtikar);
    if (isHalal      !== undefined) market.shariaCompliance.isHalal      = Boolean(isHalal);
    if (zakatEligible !== undefined) market.shariaCompliance.zakatEligible = Boolean(zakatEligible);
    if (auditorRef)                  market.shariaCompliance.auditorRef   = auditorRef;

    const newScore = market.calculateShariaScore();
    market.save();

    res.json({
        success: true,
        message: 'تم تحديث التدقيق الشرعي',
        newScore,
        isCompliant: market.isShariaCompliant(),
        market: market.getSummary()
    });
});

module.exports = router;
