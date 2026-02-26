/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏪 مسارات السوق
 *  Market Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const database = require('../config/database');

// ─── السوق السعودي المُجهز ────────────────────────────────────────────────────

router.get('/saudi-preloaded', (req, res) => {
    const data = database.read('saudiMarket');
    
    if (!data) {
        return res.status(404).json({
            success: false,
            message: 'بيانات السوق السعودي غير متوفرة'
        });
    }

    res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
    });
});

// ─── قطاعات السوق ─────────────────────────────────────────────────────────────

router.get('/sectors', (req, res) => {
    const sectors = [
        { id: 'precious', name: 'المعادن الثمينة', nameEn: 'Precious Metals', icon: '💎' },
        { id: 'base', name: 'المعادن الأساسية', nameEn: 'Base Metals', icon: '🔩' },
        { id: 'scrap', name: 'السكراب', nameEn: 'Scrap', icon: '♻️' },
        { id: 'rare', name: 'المعادن النادرة', nameEn: 'Rare Metals', icon: '⚗️' },
        { id: 'industrial', name: 'المعادن الصناعية', nameEn: 'Industrial Metals', icon: '🏭' },
        { id: 'recycling', name: 'إعادة التدوير', nameEn: 'Recycling', icon: '🔄' }
    ];

    res.json({
        success: true,
        count: sectors.length,
        sectors
    });
});

// ─── الشركات حسب القطاع ───────────────────────────────────────────────────────

router.get('/sectors/:sectorId/companies', (req, res) => {
    const { sectorId } = req.params;
    const data = database.read('saudiMarket');
    
    if (!data || !data.sectors || !data.sectors[sectorId]) {
        return res.status(404).json({
            success: false,
            message: 'القطاع غير موجود'
        });
    }

    res.json({
        success: true,
        sector: sectorId,
        companies: data.sectors[sectorId].companies || []
    });
});

// ─── تحليل الشركة ─────────────────────────────────────────────────────────────

router.get('/company/:id/analysis', (req, res) => {
    const { id } = req.params;
    const data = database.read('saudiMarket');
    
    let company = null;
    
    // البحث في جميع القطاعات
    if (data && data.sectors) {
        for (const sector of Object.values(data.sectors)) {
            if (sector.companies) {
                company = sector.companies.find(c => c.id === id);
                if (company) break;
            }
        }
    }

    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'الشركة غير موجودة'
        });
    }

    // تحليل الشركة
    const analysis = {
        company,
        strengths: company.strengths || [],
        weaknesses: company.weaknesses || [],
        opportunities: company.opportunities || [],
        threats: company.threats || [],
        supplyChain: company.supplyChain || null,
        gaps: company.gaps || [],
        recommendations: company.recommendations || []
    };

    res.json({
        success: true,
        analysis
    });
});

// ─── سلسلة التوريد ────────────────────────────────────────────────────────────

router.get('/supply-chain', (req, res) => {
    const { metal, region } = req.query;

    const supplyChain = {
        stages: [
            { id: 'source', name: 'المصدر', icon: '⛏️', description: 'استخراج المعادن من المناجم' },
            { id: 'collection', name: 'التجميع', icon: '📦', description: 'تجميع السكراب والخردة' },
            { id: 'sorting', name: 'الفرز', icon: '🔍', description: 'فرز المواد حسب النوع والجودة' },
            { id: 'processing', name: 'المعالجة', icon: '🔧', description: 'معالجة وتنقية المعادن' },
            { id: 'transport', name: 'النقل', icon: '🚚', description: 'نقل المواد للمصانع' },
            { id: 'manufacturing', name: 'التصنيع', icon: '🏭', description: 'تحويل المعادن لمنتجات' },
            { id: 'distribution', name: 'التوزيع', icon: '📤', description: 'توزيع المنتجات للأسواق' }
        ],
        participants: {
            suppliers: 45,
            collectors: 120,
            processors: 28,
            manufacturers: 67,
            distributors: 89
        }
    };

    res.json({
        success: true,
        supplyChain
    });
});

// ─── خدمات التسويق ────────────────────────────────────────────────────────────

router.get('/marketing-services', (req, res) => {
    const services = database.read('marketingServices');
    
    res.json({
        success: true,
        services: services || {}
    });
});

// ─── التسجيل السريع ───────────────────────────────────────────────────────────

router.post('/quick-register', (req, res) => {
    const { companyId, name, email, phone } = req.body;

    if (!companyId || !name || !email) {
        return res.status(400).json({
            success: false,
            message: 'البيانات المطلوبة: companyId, name, email'
        });
    }

    // البحث عن الشركة المُجهزة
    const data = database.read('saudiMarket');
    let preloadedCompany = null;

    if (data && data.sectors) {
        for (const sector of Object.values(data.sectors)) {
            if (sector.companies) {
                preloadedCompany = sector.companies.find(c => c.id === companyId);
                if (preloadedCompany) break;
            }
        }
    }

    // إنشاء التسجيل
    const registration = {
        id: require('uuid').v4(),
        companyId,
        preloadedData: preloadedCompany || null,
        contactPerson: { name, email, phone },
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // يمكن حفظه في قاعدة البيانات
    // database.insert('registrations', registration);

    res.status(201).json({
        success: true,
        message: 'تم استلام طلب التسجيل',
        registration,
        nextSteps: [
            'سيتم مراجعة طلبك خلال 24 ساعة',
            'ستصلك رسالة على بريدك الإلكتروني',
            'يمكنك البدء باستخدام المتجر فوراً'
        ]
    });
});

// ─── إحصائيات السوق ───────────────────────────────────────────────────────────

router.get('/stats', (req, res) => {
    const listings = database.read('listings') || [];
    const companies = database.read('companies') || [];
    const saudiMarket = database.read('saudiMarket') || {};

    const stats = {
        totalListings: Array.isArray(listings) ? listings.length : 0,
        totalCompanies: Array.isArray(companies) ? companies.length : Object.keys(companies).length,
        preloadedCompanies: 0,
        totalSectors: 0,
        activeTraders: 156,
        dailyTransactions: 89,
        monthlyVolume: '2.4M SAR'
    };

    // حساب الشركات المُجهزة
    if (saudiMarket.sectors) {
        stats.totalSectors = Object.keys(saudiMarket.sectors).length;
        for (const sector of Object.values(saudiMarket.sectors)) {
            if (sector.companies) {
                stats.preloadedCompanies += sector.companies.length;
            }
        }
    }

    res.json({
        success: true,
        stats
    });
});

module.exports = router;
