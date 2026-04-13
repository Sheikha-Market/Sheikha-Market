/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🌍 منظومة الهوية الثقافية والاجتماعية — سوق شيخة
 *  Cultural & Social Identity API
 *  بسم الله الرحمن الرحيم
 *  "وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا" — الحجرات ١٣
 *
 *  GET  /api/cultural/origins         — فئات الأصل (عربي / أعجمي / مختلط)
 *  GET  /api/cultural/ajam-peoples    — شعوب الأعجام
 *  GET  /api/cultural/tribes          — القبائل العربية
 *  GET  /api/cultural/families        — العائلات التجارية الكبرى
 *  GET  /api/cultural/languages       — اللغات المدعومة
 *  GET  /api/cultural/community-types — أنواع المجتمعات
 *  PUT  /api/cultural/profile         — تحديث الهوية الثقافية للمستخدم
 *  GET  /api/cultural/search/tribe    — البحث عن قبيلة
 *  GET  /api/cultural/search/family   — البحث عن عائلة تجارية
 *  GET  /api/cultural/stats           — إحصائيات الهوية الثقافية في المنصة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// ─── تحميل قاعدة البيانات ─────────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, '..', 'data', 'cultural-identity-db.json');
let culturalDB = null;

function getCulturalDB() {
    if (culturalDB) return culturalDB;
    try {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        culturalDB = JSON.parse(raw);
    } catch (err) {
        culturalDB = {
            originCategories: [],
            ajamPeoples: [],
            arabTribes: [],
            commercialFamilies: [],
            supportedLanguages: [],
            communityTypes: []
        };
    }
    return culturalDB;
}

// ─── مساعد موحّد للاستجابة ────────────────────────────────────────────────────
function ok(res, data, meta = {}) {
    res.json({ success: true, ...meta, data });
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/origins — فئات الأصل
// ══════════════════════════════════════════════════════════════════════════════
router.get('/origins', (req, res) => {
    const db = getCulturalDB();
    ok(res, db.originCategories, { total: db.originCategories.length });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/ajam-peoples — شعوب الأعجام
// ══════════════════════════════════════════════════════════════════════════════
router.get('/ajam-peoples', (req, res) => {
    const db = getCulturalDB();
    ok(res, db.ajamPeoples, { total: db.ajamPeoples.length });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/tribes — قائمة القبائل مع دعم البحث والتصفية
// ══════════════════════════════════════════════════════════════════════════════
router.get('/tribes', (req, res) => {
    const db = getCulturalDB();
    const { q, country } = req.query;

    let results = db.arabTribes;

    if (country) {
        results = results.filter(t =>
            t.country && t.country.toLowerCase().includes(country.toLowerCase())
        );
    }

    if (q) {
        const query = q.toLowerCase();
        results = results.filter(
            t =>
                t.nameAr.includes(q) ||
                (t.nameEn && t.nameEn.toLowerCase().includes(query)) ||
                (t.region && t.region.includes(q))
        );
    }

    ok(res, results, { total: results.length });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/tribes/:id — تفاصيل قبيلة بعينها
// ══════════════════════════════════════════════════════════════════════════════
router.get('/tribes/:id', (req, res) => {
    const db = getCulturalDB();
    const tribe = db.arabTribes.find(t => t.id === req.params.id);
    if (!tribe) {
        return res.status(404).json({ success: false, message: 'القبيلة غير موجودة' });
    }
    ok(res, tribe);
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/families — العائلات التجارية الكبرى
// ══════════════════════════════════════════════════════════════════════════════
router.get('/families', (req, res) => {
    const db = getCulturalDB();
    const { q, country, sector } = req.query;

    let results = db.commercialFamilies;

    if (country) {
        results = results.filter(f =>
            f.country && f.country.includes(country)
        );
    }

    if (sector) {
        results = results.filter(f =>
            f.sector && f.sector.some(s => s.includes(sector))
        );
    }

    if (q) {
        results = results.filter(
            f =>
                f.nameAr.includes(q) ||
                (f.nameEn && f.nameEn.toLowerCase().includes(q.toLowerCase()))
        );
    }

    ok(res, results, { total: results.length });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/families/:id — تفاصيل عائلة بعينها
// ══════════════════════════════════════════════════════════════════════════════
router.get('/families/:id', (req, res) => {
    const db = getCulturalDB();
    const family = db.commercialFamilies.find(f => f.id === req.params.id);
    if (!family) {
        return res.status(404).json({ success: false, message: 'العائلة غير موجودة' });
    }
    ok(res, family);
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/languages — اللغات المدعومة
// ══════════════════════════════════════════════════════════════════════════════
router.get('/languages', (req, res) => {
    const db = getCulturalDB();
    ok(res, db.supportedLanguages, { total: db.supportedLanguages.length });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/community-types — أنواع المجتمعات المتاحة
// ══════════════════════════════════════════════════════════════════════════════
router.get('/community-types', (req, res) => {
    const db = getCulturalDB();
    ok(res, db.communityTypes, { total: db.communityTypes.length });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/search/tribe?q=... — بحث سريع في القبائل
// ══════════════════════════════════════════════════════════════════════════════
router.get('/search/tribe', (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'الرجاء إدخال كلمة بحث (حرفين على الأقل)' });
    }
    const db = getCulturalDB();
    const results = db.arabTribes.filter(
        t =>
            t.nameAr.includes(q) ||
            (t.nameEn && t.nameEn.toLowerCase().includes(q.toLowerCase())) ||
            (t.branches && t.branches.some(b => b.includes(q)))
    );
    ok(res, results, { query: q, total: results.length });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/search/family?q=... — بحث سريع في العائلات
// ══════════════════════════════════════════════════════════════════════════════
router.get('/search/family', (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'الرجاء إدخال كلمة بحث (حرفين على الأقل)' });
    }
    const db = getCulturalDB();
    const results = db.commercialFamilies.filter(
        f =>
            f.nameAr.includes(q) ||
            (f.nameEn && f.nameEn.toLowerCase().includes(q.toLowerCase()))
    );
    ok(res, results, { query: q, total: results.length });
});

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/cultural/profile — تحديث الهوية الثقافية للمستخدم المسجّل
// ══════════════════════════════════════════════════════════════════════════════
router.put('/profile', (req, res) => {
    // ملاحظة: يتوقع هذا المسار وجود middleware للمصادقة يضع المستخدم في req.user
    // عند دمجه مع نظام المصادقة الرئيسي يُفعَّل requireAuth هنا
    const { origin, ajamPeople, tribe, tribeName, family, familyName, languages, nationality, region } = req.body;

    const db = getCulturalDB();

    // التحقق من صحة القيم إن وُجدت
    if (origin && !db.originCategories.find(o => o.id === origin)) {
        return res.status(400).json({ success: false, message: 'فئة الأصل غير صحيحة' });
    }

    if (ajamPeople && !db.ajamPeoples.find(p => p.id === ajamPeople)) {
        return res.status(400).json({ success: false, message: 'شعب الأعجام غير موجود في القائمة' });
    }

    if (tribe && !db.arabTribes.find(t => t.id === tribe)) {
        return res.status(400).json({ success: false, message: 'القبيلة غير موجودة' });
    }

    if (family && !db.commercialFamilies.find(f => f.id === family)) {
        return res.status(400).json({ success: false, message: 'العائلة التجارية غير موجودة' });
    }

    if (languages) {
        const validCodes = db.supportedLanguages.map(l => l.code);
        const invalid = languages.filter(l => !validCodes.includes(l));
        if (invalid.length > 0) {
            return res.status(400).json({ success: false, message: `لغات غير مدعومة: ${invalid.join(', ')}` });
        }
    }

    const updatedProfile = {
        origin: origin || null,
        ajamPeople: ajamPeople || null,
        tribe: tribe || null,
        tribeName: tribeName || null,
        family: family || null,
        familyName: familyName || null,
        languages: languages || [],
        nationality: nationality || null,
        region: region || null,
        updatedAt: new Date().toISOString()
    };

    // في البيئة الكاملة: يُحدَّث سجل المستخدم في قاعدة البيانات
    // User.findById(req.user.id).culturalIdentity = updatedProfile; user.save();
    ok(res, updatedProfile, { message: 'تم تحديث الهوية الثقافية بنجاح' });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/stats — إحصائيات الهوية الثقافية
// ══════════════════════════════════════════════════════════════════════════════
router.get('/stats', (req, res) => {
    const db = getCulturalDB();
    ok(res, {
        totalTribes: db.arabTribes.length,
        totalAjamPeoples: db.ajamPeoples.length,
        totalCommercialFamilies: db.commercialFamilies.length,
        totalSupportedLanguages: db.supportedLanguages.length,
        totalCommunityTypes: db.communityTypes.length,
        countries: [...new Set(db.arabTribes.map(t => t.country).flatMap(c => c.split(' / ')))].filter(Boolean).length,
        ayah: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا — الحجرات ١٣'
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/cultural/health
// ══════════════════════════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
    const db = getCulturalDB();
    ok(res, {
        status: 'active',
        module: 'cultural-identity',
        tribes: db.arabTribes.length,
        languages: db.supportedLanguages.length,
        families: db.commercialFamilies.length,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
