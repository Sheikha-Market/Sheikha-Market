/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔌 مسارات API العامة
 *  General API Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const database = require('../config/database');
const config = require('../config/config');

// ─── معلومات الخادم ───────────────────────────────────────────────────────────

router.get('/server/health', (req, res) => {
    res.json({
        success: true,
        status: 'operational',
        server: {
            name: config.system.name,
            version: config.system.version,
            environment: config.server.env,
            uptime: Math.floor(process.uptime()),
            memory: process.memoryUsage()
        },
        timestamp: new Date().toISOString()
    });
});

router.get('/server/stats', (req, res) => {
    const dbStats = database.getStats();
    res.json({
        success: true,
        stats: {
            database: dbStats,
            uptime: Math.floor(process.uptime()),
            memory: process.memoryUsage(),
            platform: process.platform,
            nodeVersion: process.version
        }
    });
});

// ─── إعدادات النظام ───────────────────────────────────────────────────────────

router.get('/settings', (req, res) => {
    res.json({
        success: true,
        settings: {
            system: config.system,
            sharia: { enabled: config.sharia.enabled },
            arabic: { enabled: config.arabic.enabled },
            ai: {
                openai: { enabled: !!config.ai.openai.apiKey },
                claude: { enabled: !!config.ai.anthropic.apiKey }
            }
        }
    });
});

// ─── الأسعار ──────────────────────────────────────────────────────────────────

router.get('/prices', (req, res) => {
    // أسعار المعادن الافتراضية
    const prices = {
        gold: { buy: 245.50, sell: 248.20, unit: 'جرام', currency: 'SAR' },
        silver: { buy: 3.25, sell: 3.45, unit: 'جرام', currency: 'SAR' },
        copper: { buy: 35.00, sell: 37.50, unit: 'كيلو', currency: 'SAR' },
        aluminum: { buy: 8.50, sell: 9.20, unit: 'كيلو', currency: 'SAR' },
        iron: { buy: 2.50, sell: 3.00, unit: 'كيلو', currency: 'SAR' },
        brass: { buy: 25.00, sell: 27.00, unit: 'كيلو', currency: 'SAR' },
        lead: { buy: 12.00, sell: 13.50, unit: 'كيلو', currency: 'SAR' },
        zinc: { buy: 15.00, sell: 16.50, unit: 'كيلو', currency: 'SAR' }
    };

    res.json({
        success: true,
        prices,
        lastUpdate: new Date().toISOString(),
        source: 'sheikha-market'
    });
});

// ─── العروض ───────────────────────────────────────────────────────────────────

router.get('/listings', (req, res) => {
    const listings = database.read('listings') || [];
    res.json({
        success: true,
        count: listings.length,
        listings
    });
});

router.post('/listings', (req, res) => {
    const { title, category, price, quantity, description, location, contact } = req.body;

    if (!title || !category || !price) {
        return res.status(400).json({
            success: false,
            message: 'البيانات المطلوبة: title, category, price'
        });
    }

    const listing = {
        id: require('uuid').v4(),
        title,
        category,
        price,
        quantity: quantity || 1,
        description: description || '',
        location: location || 'غير محدد',
        contact: contact || {},
        status: 'active',
        createdAt: new Date().toISOString()
    };

    database.insert('listings', listing);

    res.status(201).json({
        success: true,
        message: 'تم إضافة العرض بنجاح',
        listing
    });
});

// ─── الشركات ──────────────────────────────────────────────────────────────────

router.get('/companies', (req, res) => {
    const companies = database.read('companies') || [];
    res.json({
        success: true,
        count: Array.isArray(companies) ? companies.length : Object.keys(companies).length,
        companies
    });
});

router.get('/companies/:id', (req, res) => {
    const companies = database.read('companies') || [];
    const company = Array.isArray(companies) 
        ? companies.find(c => c.id === req.params.id)
        : companies[req.params.id];

    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'الشركة غير موجودة'
        });
    }

    res.json({ success: true, company });
});

// ─── البحث ────────────────────────────────────────────────────────────────────

router.get('/search', (req, res) => {
    const { q, type, category, location } = req.query;

    if (!q) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال نص البحث (q)'
        });
    }

    const results = {
        listings: [],
        companies: [],
        total: 0
    };

    // البحث في العروض
    const listings = database.read('listings') || [];
    results.listings = listings.filter(item => 
        item.title?.includes(q) || 
        item.description?.includes(q) ||
        item.category?.includes(q)
    );

    // البحث في الشركات
    const companies = database.read('companies') || [];
    const companyList = Array.isArray(companies) ? companies : Object.values(companies);
    results.companies = companyList.filter(c =>
        c.name?.includes(q) ||
        c.nameAr?.includes(q) ||
        c.activity?.includes(q)
    );

    results.total = results.listings.length + results.companies.length;

    res.json({
        success: true,
        query: q,
        results
    });
});

module.exports = router;
