/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏪 نموذج وحدة السوق — سوق شيخة للأسواق
 *  MarketUnit Model — Sheikha Market of Markets
 *
 *  أنواع الأسواق:
 *    physical    → سوق حقيقي (موقع جغرافي — مبنى / منطقة تجارية)
 *    electronic  → سوق إلكتروني (موقع ويب / تطبيق / منصة تجارة إلكترونية)
 *    digital     → سوق رقمي (NFT / عملات رقمية إسلامية / بيانات / برمجيات)
 *    hybrid      → سوق هجين (جمع بين الأنواع السابقة)
 *
 *  القطاعات:
 *    metals | agriculture | technology | services | science | real-estate | other
 *
 *  القاعدة الحاكمة: الكتاب والسنة — الأصل في المعاملات الإباحة إلا ما دلّ الدليل على تحريمه
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const { v4: uuid } = require('uuid');
const database = require('../config/database');

// ─── أنواع الأسواق ─────────────────────────────────────────────────────────────
const MARKET_TYPES = {
    PHYSICAL:   'physical',   // سوق حقيقي
    ELECTRONIC: 'electronic', // سوق إلكتروني
    DIGITAL:    'digital',    // سوق رقمي
    HYBRID:     'hybrid'      // سوق هجين
};

// ─── قطاعات الأسواق ──────────────────────────────────────────────────────────
const MARKET_SECTORS = {
    METALS:       'metals',       // المعادن والسكراب
    AGRICULTURE:  'agriculture',  // الزراعة والأغذية الحلال
    TECHNOLOGY:   'technology',   // البرمجيات والأجهزة
    SERVICES:     'services',     // الخدمات واللوجستيك
    SCIENCE:      'science',      // البحث والتطوير
    REAL_ESTATE:  'real-estate',  // العقارات
    EDUCATION:    'education',    // التعليم والتدريب
    HEALTHCARE:   'healthcare',   // الرعاية الصحية الحلال
    OTHER:        'other'         // أخرى
};

class MarketUnit {
    constructor(data = {}) {
        this.id          = data.id          || uuid();
        this.name        = data.name        || '';
        this.nameAr      = data.nameAr      || data.name || '';
        this.nameEn      = data.nameEn      || '';
        this.description = data.description || '';

        // ─── تصنيف السوق ──────────────────────────────────────────────────────
        this.marketType  = data.marketType  || MARKET_TYPES.HYBRID;
        this.sector      = data.sector      || MARKET_SECTORS.OTHER;

        // ─── الانتماء التنظيمي ─────────────────────────────────────────────────
        this.orgId       = data.orgId       || null; // المنظمة المشرفة على هذا السوق
        this.parentOrgId = data.parentOrgId || null; // منظمة الأسواق الأم

        // ─── بيانات السوق الحقيقي (physical) ─────────────────────────────────
        this.location = data.location || {
            country:     null,
            city:        null,
            district:    null,
            address:     null,
            coordinates: { lat: null, lng: null },
            area_sqm:    null      // المساحة بالمتر المربع
        };

        // ─── بيانات السوق الإلكتروني / الرقمي ────────────────────────────────
        this.digital = data.digital || {
            url:      null,   // رابط الموقع أو المنصة
            platform: null,   // WooCommerce | Shopify | custom | ...
            appStore: null,   // رابط App Store
            playStore: null   // رابط Google Play
        };

        // ─── الامتثال الشرعي ──────────────────────────────────────────────────
        this.shariaCompliance = data.shariaCompliance || {
            isHalal:           true,  // المنتجات/الخدمات حلال
            noRiba:            true,  // لا فوائد ربوية
            noGharar:          true,  // لا غرر في العقود
            noGhish:           true,  // لا غش في المنتجات
            noIhtikar:         true,  // لا احتكار
            zakatEligible:     true,  // السوق يدعم حساب الزكاة
            auditScore:        100,   // درجة التدقيق الشرعي (0-100)
            lastAuditAt:       null,
            auditorRef:        null
        };

        // ─── البيانات التشغيلية ───────────────────────────────────────────────
        this.operationalData = data.operationalData || {
            workingHours:       null,  // ساعات العمل
            currency:           'SAR', // العملة الأساسية
            supportedCurrencies: ['SAR', 'USD', 'EUR'],
            languagesSupported:  ['ar', 'en'],
            paymentMethods:      []    // طرق الدفع المتاحة
        };

        // ─── الإحصائيات ───────────────────────────────────────────────────────
        this.stats = data.stats || {
            totalSellers:      0,
            totalBuyers:       0,
            totalListings:     0,
            dailyTransactions: 0,
            monthlyVolume:     0  // بالريال السعودي
        };

        // ─── قائمة العروض والتجار ─────────────────────────────────────────────
        this.listingIds = data.listingIds || [];
        this.sellerIds  = data.sellerIds  || [];

        // ─── حالة التسجيل ─────────────────────────────────────────────────────
        this.status     = data.status     || 'pending'; // pending | active | suspended | closed
        this.verified   = data.verified   || false;
        this.verifiedAt = data.verifiedAt || null;

        // ─── المعلومات الوصفية ────────────────────────────────────────────────
        this.tags      = data.tags      || [];
        this.metadata  = data.metadata  || {};
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // ─── حفظ السوق ────────────────────────────────────────────────────────────
    save() {
        this.updatedAt = new Date().toISOString();

        let markets = database.read('marketUnits') || [];
        if (!Array.isArray(markets)) markets = Object.values(markets);

        const index = markets.findIndex(m => m.id === this.id);
        if (index >= 0) {
            markets[index] = this;
        } else {
            markets.push(this);
        }

        database.write('marketUnits', markets);
        return this;
    }

    // ─── التحقق من الامتثال الشرعي ────────────────────────────────────────────
    isShariaCompliant() {
        const s = this.shariaCompliance;
        return s.isHalal && s.noRiba && s.noGharar && s.noGhish && s.noIhtikar;
    }

    // ─── حساب درجة التدقيق الشرعي ────────────────────────────────────────────
    calculateShariaScore() {
        const s = this.shariaCompliance;
        const checks = [
            s.isHalal, s.noRiba, s.noGharar, s.noGhish, s.noIhtikar, s.zakatEligible
        ];
        const passed = checks.filter(Boolean).length;
        this.shariaCompliance.auditScore = Math.round((passed / checks.length) * 100);
        this.shariaCompliance.lastAuditAt = new Date().toISOString();
        return this.shariaCompliance.auditScore;
    }

    // ─── ملخص السوق ───────────────────────────────────────────────────────────
    getSummary() {
        return {
            id:              this.id,
            name:            this.nameAr || this.name,
            nameEn:          this.nameEn,
            marketType:      this.marketType,
            sector:          this.sector,
            orgId:           this.orgId,
            status:          this.status,
            verified:        this.verified,
            shariaCompliant: this.isShariaCompliant(),
            shariaScore:     this.shariaCompliance.auditScore,
            totalListings:   this.stats.totalListings,
            totalSellers:    this.stats.totalSellers,
            location:        this.marketType === MARKET_TYPES.PHYSICAL ? this.location : null,
            url:             this.digital.url
        };
    }

    // ─── البحث بالمعرّف ───────────────────────────────────────────────────────
    static findById(id) {
        let markets = database.read('marketUnits') || [];
        if (!Array.isArray(markets)) markets = Object.values(markets);
        const data = markets.find(m => m.id === id);
        return data ? new MarketUnit(data) : null;
    }

    // ─── البحث العام ──────────────────────────────────────────────────────────
    static find(query = {}) {
        let markets = database.read('marketUnits') || [];
        if (!Array.isArray(markets)) markets = Object.values(markets);

        if (Object.keys(query).length === 0) return markets.map(m => new MarketUnit(m));

        return markets
            .filter(m => Object.entries(query).every(([k, v]) => m[k] === v))
            .map(m => new MarketUnit(m));
    }

    // ─── البحث حسب القطاع ─────────────────────────────────────────────────────
    static findBySector(sector) {
        return MarketUnit.find({ sector });
    }

    // ─── البحث حسب النوع ──────────────────────────────────────────────────────
    static findByType(marketType) {
        return MarketUnit.find({ marketType });
    }

    // ─── إنشاء سوق جديد ───────────────────────────────────────────────────────
    static create(data) {
        const market = new MarketUnit(data);
        market.calculateShariaScore();
        return market.save();
    }

    // ─── حذف سوق ──────────────────────────────────────────────────────────────
    static delete(id) {
        let markets = database.read('marketUnits') || [];
        if (!Array.isArray(markets)) markets = Object.values(markets);
        const index = markets.findIndex(m => m.id === id);
        if (index < 0) return false;
        markets.splice(index, 1);
        database.write('marketUnits', markets);
        return true;
    }
}

MarketUnit.TYPES   = MARKET_TYPES;
MarketUnit.SECTORS = MARKET_SECTORS;

module.exports = MarketUnit;
