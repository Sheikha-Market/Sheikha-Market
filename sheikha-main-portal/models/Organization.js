/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏛️ نموذج المنظمة — منظمة شيخة للمنظمات
 *  Organization Model — Sheikha Org-of-Orgs
 *
 *  الهيكل:
 *    root        → منظمة شيخة الأم (الجامعة الموحّدة لله)
 *    specialized → منظمة متخصصة بقطاع (أسواق / علوم / تقنيات / خدمات)
 *    market-org  → منظمة تنظيم أسواق (سوق شيخة للأسواق)
 *
 *  القاعدة الحاكمة: الكتاب والسنة — لا ضرر ولا ضرار
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const { v4: uuid } = require('uuid');
const database = require('../config/database');

// ─── أنواع المنظمات ────────────────────────────────────────────────────────────
const ORG_TYPES = {
    ROOT:        'root',        // المنظمة الأم
    SPECIALIZED: 'specialized', // منظمة متخصصة بقطاع
    MARKET_ORG:  'market-org'   // منظمة تنظيم الأسواق
};

// ─── قطاعات المنظمات المتخصصة ────────────────────────────────────────────────
const ORG_SECTORS = {
    MARKETS:    'markets',    // منظمة أسواق
    SCIENCE:    'science',    // منظمة علوم
    TECHNOLOGY: 'technology', // منظمة تقنيات
    SERVICES:   'services',   // منظمة خدمات (لوجستيك وتوريد)
    FINANCE:    'finance',    // منظمة تمويل إسلامي
    EDUCATION:  'education'   // منظمة تعليم
};

class Organization {
    constructor(data = {}) {
        this.id          = data.id          || uuid();
        this.name        = data.name        || '';
        this.nameAr      = data.nameAr      || data.name || '';
        this.nameEn      = data.nameEn      || '';
        this.mission     = data.mission     || '';

        // ─── نوع المنظمة والتسلسل الهرمي ─────────────────────────────────────
        this.type        = data.type        || ORG_TYPES.SPECIALIZED;
        this.sector      = data.sector      || null; // من ORG_SECTORS
        this.parentId    = data.parentId    || null; // معرّف المنظمة الأم
        this.childOrgIds = data.childOrgIds || [];   // معرّفات المنظمات التابعة
        this.marketIds   = data.marketIds   || [];   // معرّفات الأسواق المسجّلة

        // ─── بيانات الاتصال والموقع ──────────────────────────────────────────
        this.contact = data.contact || {
            email:   null,
            phone:   null,
            website: null,
            address: null,
            city:    null,
            country: 'السعودية'
        };

        // ─── الميثاق الشرعي ───────────────────────────────────────────────────
        this.shariaCharter = data.shariaCharter || {
            acceptsKitabAndSunnah: true,     // الكتاب والسنة مرجع
            noRiba:                true,     // لا ربا
            noGharar:              true,     // لا غرر
            noGhish:               true,     // لا غش
            noIhtikar:             true,     // لا احتكار
            noDarar:               true,     // لا ضرر ولا ضرار
            charterVersion:        '1.0.0',
            acceptedAt:            null      // تاريخ قبول الميثاق
        };

        // ─── معايير التسجيل والحوكمة ──────────────────────────────────────────
        this.status       = data.status       || 'pending';  // pending | active | suspended
        this.verified     = data.verified     || false;
        this.verifiedAt   = data.verifiedAt   || null;
        this.verifiedBy   = data.verifiedBy   || null;

        // ─── البيعة والنصرة والنية ────────────────────────────────────────────
        // "أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ" — النساء: ٥٩
        this.niyyah         = data.niyyah         || 'LILLAH';   // نية المنظمة
        this.bayahStatus    = data.bayahStatus    || 'pending';  // pending | active | revoked
        this.bayahScore     = data.bayahScore     || null;       // نقاط البيعة من الشبكة العصبية
        this.bayahPledgedAt = data.bayahPledgedAt || null;       // وقت تسجيل البيعة
        this.nasrahStatus   = data.nasrahStatus   || {
            allah:   false,  // نصرة الله
            islam:   false,  // نصرة الإسلام
            waliAmr: false   // نصرة ولي الأمر لله
        };

        // ─── الإدارة ──────────────────────────────────────────────────────────
        this.ownerId  = data.ownerId  || null;
        this.adminIds = data.adminIds || [];

        // ─── المعلومات الوصفية ────────────────────────────────────────────────
        this.metadata  = data.metadata  || {};
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // ─── حفظ المنظمة ──────────────────────────────────────────────────────────
    save() {
        this.updatedAt = new Date().toISOString();

        let orgs = database.read('organizations') || [];
        if (!Array.isArray(orgs)) orgs = Object.values(orgs);

        const index = orgs.findIndex(o => o.id === this.id);
        if (index >= 0) {
            orgs[index] = this;
        } else {
            orgs.push(this);
        }

        database.write('organizations', orgs);
        return this;
    }

    // ─── إضافة منظمة تابعة ────────────────────────────────────────────────────
    addChildOrg(childOrgId) {
        if (!this.childOrgIds.includes(childOrgId)) {
            this.childOrgIds.push(childOrgId);
            this.save();
        }
        return this;
    }

    // ─── إضافة سوق تابع ───────────────────────────────────────────────────────
    addMarket(marketId) {
        if (!this.marketIds.includes(marketId)) {
            this.marketIds.push(marketId);
            this.save();
        }
        return this;
    }

    // ─── التحقق من الامتثال الشرعي ────────────────────────────────────────────
    isShariaCompliant() {
        const c = this.shariaCharter;
        return c.acceptsKitabAndSunnah &&
               c.noRiba && c.noGharar && c.noGhish &&
               c.noIhtikar && c.noDarar;
    }

    // ─── قبول الميثاق ─────────────────────────────────────────────────────────
    acceptCharter(acceptedBy) {
        this.shariaCharter.acceptedAt = new Date().toISOString();
        this.shariaCharter.acceptedBy = acceptedBy || null;
        return this.save();
    }

    // ─── تسجيل البيعة لولي الأمر لله ─────────────────────────────────────────
    pledgeBayah(niyyah = 'LILLAH') {
        this.niyyah      = niyyah;
        this.bayahStatus = 'active';
        this.bayahPledgedAt = new Date().toISOString();
        this.nasrahStatus   = { allah: true, islam: true, waliAmr: true };

        // التحليل العصبي للبيعة
        try {
            const integration = require('../lib/sheikha-mubayaa-org-integration');
            const result = integration.analyzeOrgBayah(this);
            this.bayahScore = result.neuralScore || result.pledgeScore;
        } catch (_) { this.bayahScore = 0.9; }

        return this.save();
    }

    // ─── حالة البيعة الكاملة ──────────────────────────────────────────────────
    getBayahSummary() {
        return {
            orgId:       this.id,
            orgName:     this.nameAr || this.name,
            niyyah:      this.niyyah,
            bayahStatus: this.bayahStatus,
            bayahScore:  this.bayahScore,
            nasrahStatus: this.nasrahStatus,
            waliAlAmr:   'الملك سلمان بن عبدالعزيز آل سعود',
            bayahQuran:  '﴿أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ﴾ — النساء: ٥٩'
        };
    }

    // ─── ملخص المنظمة ─────────────────────────────────────────────────────────
    getSummary() {
        return {
            id:               this.id,
            name:             this.nameAr || this.name,
            nameEn:           this.nameEn,
            type:             this.type,
            sector:           this.sector,
            parentId:         this.parentId,
            childOrgsCount:   this.childOrgIds.length,
            marketsCount:     this.marketIds.length,
            status:           this.status,
            verified:         this.verified,
            shariaCompliant:  this.isShariaCompliant()
        };
    }

    // ─── البحث بالمعرّف ───────────────────────────────────────────────────────
    static findById(id) {
        let orgs = database.read('organizations') || [];
        if (!Array.isArray(orgs)) orgs = Object.values(orgs);
        const data = orgs.find(o => o.id === id);
        return data ? new Organization(data) : null;
    }

    // ─── البحث العام ──────────────────────────────────────────────────────────
    static find(query = {}) {
        let orgs = database.read('organizations') || [];
        if (!Array.isArray(orgs)) orgs = Object.values(orgs);

        if (Object.keys(query).length === 0) return orgs.map(o => new Organization(o));

        return orgs
            .filter(o => Object.entries(query).every(([k, v]) => o[k] === v))
            .map(o => new Organization(o));
    }

    // ─── الحصول على المنظمة الجذر ─────────────────────────────────────────────
    static getRoot() {
        const roots = Organization.find({ type: ORG_TYPES.ROOT });
        return roots.length > 0 ? roots[0] : null;
    }

    // ─── إنشاء منظمة جديدة ────────────────────────────────────────────────────
    static create(data) {
        const org = new Organization(data);
        return org.save();
    }

    // ─── حذف منظمة ────────────────────────────────────────────────────────────
    static delete(id) {
        let orgs = database.read('organizations') || [];
        if (!Array.isArray(orgs)) orgs = Object.values(orgs);
        const index = orgs.findIndex(o => o.id === id);
        if (index < 0) return false;
        orgs.splice(index, 1);
        database.write('organizations', orgs);
        return true;
    }
}

Organization.TYPES   = ORG_TYPES;
Organization.SECTORS = ORG_SECTORS;

module.exports = Organization;
