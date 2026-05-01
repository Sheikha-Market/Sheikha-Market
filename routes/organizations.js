/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏛️ مسارات المنظمات — منظمة شيخة للمنظمات
 *  Organizations Routes
 *
 *  GET  /api/organizations                → قائمة المنظمات
 *  GET  /api/organizations/tree           → الشجرة الهرمية الكاملة
 *  GET  /api/organizations/:id            → تفاصيل منظمة
 *  POST /api/organizations                → تسجيل منظمة جديدة
 *  POST /api/organizations/:id/accept-charter → قبول الميثاق الشرعي
 *  POST /api/organizations/:id/markets    → إضافة سوق للمنظمة
 *  GET  /api/organizations/:id/markets    → أسواق المنظمة
 *  PUT  /api/organizations/:id/verify     → تفعيل / تحقق المنظمة (للإدارة)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express      = require('express');
const router       = express.Router();
const { v4: uuid } = require('uuid');
const Organization = require('../models/Organization');
const MarketUnit   = require('../models/MarketUnit');

// ─── قائمة المنظمات ───────────────────────────────────────────────────────────

router.get('/', (req, res) => {
    const { type, sector, status, verified } = req.query;

    const query = {};
    if (type)     query.type     = type;
    if (sector)   query.sector   = sector;
    if (status) {
        const allowedStatuses = ['pending', 'active', 'suspended'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `قيمة status غير صحيحة. المقبول: ${allowedStatuses.join(' | ')}`
            });
        }
        query.status = status;
    }
    if (verified !== undefined) query.verified = verified === 'true';

    const orgs = Organization.find(query);

    res.json({
        success: true,
        count: orgs.length,
        organizations: orgs.map(o => o.getSummary())
    });
});

// ─── شجرة المنظمات الهرمية الكاملة ───────────────────────────────────────────

router.get('/tree', (req, res) => {
    const all = Organization.find();

    // بناء الخريطة
    const map = {};
    all.forEach(o => { map[o.id] = { ...o.getSummary(), children: [] }; });

    const roots = [];
    all.forEach(o => {
        if (o.parentId && map[o.parentId]) {
            map[o.parentId].children.push(map[o.id]);
        } else {
            roots.push(map[o.id]);
        }
    });

    res.json({
        success: true,
        bismillah: 'بسم الله الرحمن الرحيم',
        description: 'منظمة شيخة — الجامعة الموحّدة لله',
        tree: roots
    });
});

// ─── أنواع وقطاعات المنظمات (reference) ──────────────────────────────────────

router.get('/reference', (req, res) => {
    res.json({
        success: true,
        types: Organization.TYPES,
        sectors: Organization.SECTORS
    });
});

// ─── تفاصيل منظمة ─────────────────────────────────────────────────────────────

router.get('/:id', (req, res) => {
    const org = Organization.findById(req.params.id);

    if (!org) {
        return res.status(404).json({
            success: false,
            message: 'المنظمة غير موجودة'
        });
    }

    // تحميل الأسواق التابعة
    const markets = org.marketIds
        .map(mid => MarketUnit.findById(mid))
        .filter(Boolean)
        .map(m => m.getSummary());

    // تحميل المنظمات التابعة
    const childOrgs = org.childOrgIds
        .map(cid => Organization.findById(cid))
        .filter(Boolean)
        .map(o => o.getSummary());

    res.json({
        success: true,
        organization: org,
        markets,
        childOrganizations: childOrgs
    });
});

// ─── تسجيل منظمة جديدة ────────────────────────────────────────────────────────

router.post('/', (req, res) => {
    const {
        name, nameAr, nameEn, mission,
        type, sector, parentId,
        contact,
        shariaCharter,
        ownerId
    } = req.body;

    // التحقق من الحقول الإلزامية
    if (!name && !nameAr) {
        return res.status(400).json({
            success: false,
            message: 'اسم المنظمة مطلوب (name أو nameAr)'
        });
    }

    if (!type || !Object.values(Organization.TYPES).includes(type)) {
        return res.status(400).json({
            success: false,
            message: `نوع المنظمة مطلوب. الأنواع المتاحة: ${Object.values(Organization.TYPES).join(' | ')}`
        });
    }

    // التحقق من عدم وجود منظمة جذر مسبقاً إن كان النوع root
    if (type === Organization.TYPES.ROOT) {
        const existingRoot = Organization.getRoot();
        if (existingRoot) {
            return res.status(409).json({
                success: false,
                message: 'منظمة الجذر موجودة بالفعل',
                existingRoot: existingRoot.getSummary()
            });
        }
    }

    // التحقق من وجود المنظمة الأم
    let parentOrg = null;
    if (parentId) {
        parentOrg = Organization.findById(parentId);
        if (!parentOrg) {
            return res.status(404).json({
                success: false,
                message: 'المنظمة الأم غير موجودة'
            });
        }
    }

    // إنشاء المنظمة
    const org = Organization.create({
        name:    nameAr || name,
        nameAr:  nameAr || name,
        nameEn:  nameEn  || '',
        mission: mission || '',
        type,
        sector:  sector  || null,
        parentId: parentId || null,
        contact: contact || {},
        shariaCharter: shariaCharter || undefined,
        ownerId: ownerId || null,
        status: 'pending'
    });

    // ربط بالمنظمة الأم
    if (parentOrg) {
        parentOrg.addChildOrg(org.id);
    }

    res.status(201).json({
        success: true,
        message: 'تم تسجيل المنظمة بنجاح — في انتظار قبول الميثاق الشرعي',
        organization: org.getSummary(),
        nextStep: `POST /api/organizations/${org.id}/accept-charter`
    });
});

// ─── قبول الميثاق الشرعي ──────────────────────────────────────────────────────

router.post('/:id/accept-charter', (req, res) => {
    const org = Organization.findById(req.params.id);

    if (!org) {
        return res.status(404).json({
            success: false,
            message: 'المنظمة غير موجودة'
        });
    }

    const { acceptedBy, confirmations } = req.body;

    // التأكد من قبول جميع بنود الميثاق صراحةً
    const required = ['noRiba', 'noGharar', 'noGhish', 'noIhtikar', 'noDarar', 'acceptsKitabAndSunnah'];
    if (confirmations) {
        const missing = required.filter(k => confirmations[k] !== true);
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `يجب قبول جميع بنود الميثاق صراحةً. البنود المفقودة: ${missing.join(', ')}`
            });
        }
        Object.assign(org.shariaCharter, confirmations);
    }

    org.acceptCharter(acceptedBy);

    // تفعيل المنظمة بعد قبول الميثاق
    org.status = 'active';
    org.save();

    res.json({
        success: true,
        message: 'تم قبول الميثاق الشرعي — المنظمة مفعّلة',
        charter: {
            ...org.shariaCharter,
            reference: {
                noRiba:              'البقرة: 275 — وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
                noGharar:            'حديث صحيح — نهى النبي ﷺ عن بيع الغرر',
                noGhish:             'حديث صحيح — من غشّنا فليس منّا',
                noIhtikar:           'حديث صحيح — لا يحتكر إلا خاطئ',
                noDarar:             'حديث صحيح — لا ضرر ولا ضرار',
                acceptsKitabAndSunnah: 'النساء: 59 — فَإِن تَنَازَعْتُمْ فِي شَيْءٍ فَرُدُّوهُ إِلَى اللَّهِ وَالرَّسُولِ'
            }
        },
        organization: org.getSummary()
    });
});

// ─── أسواق المنظمة ────────────────────────────────────────────────────────────

router.get('/:id/markets', (req, res) => {
    const org = Organization.findById(req.params.id);

    if (!org) {
        return res.status(404).json({
            success: false,
            message: 'المنظمة غير موجودة'
        });
    }

    const markets = org.marketIds
        .map(mid => MarketUnit.findById(mid))
        .filter(Boolean)
        .map(m => m.getSummary());

    res.json({
        success: true,
        orgId: org.id,
        orgName: org.nameAr || org.name,
        count: markets.length,
        markets
    });
});

// ─── إضافة سوق للمنظمة ────────────────────────────────────────────────────────

router.post('/:id/markets', (req, res) => {
    const org = Organization.findById(req.params.id);

    if (!org) {
        return res.status(404).json({
            success: false,
            message: 'المنظمة غير موجودة'
        });
    }

    if (org.status !== 'active') {
        return res.status(403).json({
            success: false,
            message: 'المنظمة غير مفعّلة — يجب قبول الميثاق الشرعي أولاً'
        });
    }

    const {
        name, nameAr, nameEn, description,
        marketType, sector,
        location, digital,
        shariaCompliance,
        operationalData,
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

    const market = MarketUnit.create({
        name:    nameAr || name,
        nameAr:  nameAr || name,
        nameEn:  nameEn  || '',
        description: description || '',
        marketType,
        sector:  sector || org.sector || MarketUnit.SECTORS.OTHER,
        orgId:   org.id,
        parentOrgId: org.parentId,
        location:    location    || undefined,
        digital:     digital     || undefined,
        shariaCompliance: shariaCompliance || undefined,
        operationalData:  operationalData  || undefined,
        tags: tags || [],
        status: 'active'
    });

    // ربط السوق بالمنظمة
    org.addMarket(market.id);

    res.status(201).json({
        success: true,
        message: 'تم تسجيل السوق وربطه بالمنظمة',
        market: market.getSummary(),
        organization: org.getSummary()
    });
});

// ─── تحقق / تفعيل منظمة (للإدارة) ───────────────────────────────────────────

router.put('/:id/verify', (req, res) => {
    const org = Organization.findById(req.params.id);

    if (!org) {
        return res.status(404).json({
            success: false,
            message: 'المنظمة غير موجودة'
        });
    }

    const { verifiedBy } = req.body;

    org.verified   = true;
    org.verifiedAt = new Date().toISOString();
    org.verifiedBy = verifiedBy || 'admin';
    org.save();

    res.json({
        success: true,
        message: 'تم التحقق من المنظمة',
        organization: org.getSummary()
    });
});

module.exports = router;
