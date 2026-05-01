/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ©️ مسارات الملكية الفكرية — سوق شيخة
 *  Intellectual Property Routes
 *
 *  GET  /api/ip/charter              → ميثاق الملكية الفكرية الكامل
 *  GET  /api/ip/categories           → فئات الملكية الفكرية
 *  GET  /api/ip/confidentiality      → مبادئ السرية وبنود اتفاقية NDA
 *  GET  /api/ip/assets               → سجل الأصول الفكرية المسجّلة
 *  GET  /api/ip/assets/:id           → تفاصيل أصل فكري
 *  POST /api/ip/assets               → تسجيل أصل فكري جديد
 *  PUT  /api/ip/assets/:id           → تحديث أصل فكري
 *  GET  /api/ip/notice               → إشعار حقوق الملكية (للدمج في الموقع)
 *  POST /api/ip/report-violation     → الإبلاغ عن انتهاك
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { v4: uuid } = require('uuid');

const { IP_MASTER_CHARTER, IPAsset } = require('../models/IntellectualProperty');
const database = require('../config/database');

// الفئات المسموح بها
const ALLOWED_CATEGORIES = [
    'trademark', 'copyright', 'trade-secret',
    'patent', 'domain', 'data', 'design', 'methodology'
];

const ALLOWED_CONFIDENTIALITY = ['public', 'internal', 'confidential', 'top-secret'];

// ─── ميثاق الملكية الفكرية الكامل ────────────────────────────────────────────

router.get('/charter', (req, res) => {
    res.json({
        success:     true,
        bismillah:   'بسم الله الرحمن الرحيم',
        title:       'ميثاق الملكية الفكرية وسريّتها — سوق شيخة',
        version:     IP_MASTER_CHARTER.version,
        effectiveDate: IP_MASTER_CHARTER.effectiveDate,
        owner:       IP_MASTER_CHARTER.owner,
        ownershipDeclaration: IP_MASTER_CHARTER.ownershipDeclaration,
        categories:  IP_MASTER_CHARTER.categories.map(c => ({
            id:     c.id,
            nameAr: c.nameAr,
            nameEn: c.nameEn,
            icon:   c.icon,
            protection: c.protection
        })),
        usageTerms:               IP_MASTER_CHARTER.usageTerms,
        confidentialityPrinciples: IP_MASTER_CHARTER.confidentialityPrinciples,
        ndaTerms:                  IP_MASTER_CHARTER.ndaTerms,
        violationReporting:        IP_MASTER_CHARTER.violationReporting,
        islamicBasis: {
            amanah:   'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا — النساء: 58',
            wafa:     'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ — المائدة: 1',
            khiyanah: 'لَا تَخُونُوا اللَّهَ وَالرَّسُولَ وَتَخُونُوا أَمَانَاتِكُمْ — الأنفال: 27'
        }
    });
});

// ─── فئات الملكية الفكرية ─────────────────────────────────────────────────────

router.get('/categories', (req, res) => {
    const { id } = req.query;

    if (id) {
        const cat = IP_MASTER_CHARTER.categories.find(c => c.id === id);
        if (!cat) {
            return res.status(404).json({
                success: false,
                message: 'الفئة غير موجودة',
                available: ALLOWED_CATEGORIES
            });
        }
        return res.json({ success: true, category: cat });
    }

    res.json({
        success:    true,
        title:      'فئات الملكية الفكرية لسوق شيخة',
        count:      IP_MASTER_CHARTER.categories.length,
        categories: IP_MASTER_CHARTER.categories
    });
});

// ─── مبادئ السرية وبنود NDA ───────────────────────────────────────────────────

router.get('/confidentiality', (req, res) => {
    res.json({
        success: true,
        title:   'ميثاق السرية وحماية المعلومات — سوق شيخة',
        principles: IP_MASTER_CHARTER.confidentialityPrinciples,
        ndaTerms:   IP_MASTER_CHARTER.ndaTerms,
        levels: [
            {
                id:     'public',
                nameAr: 'عام',
                desc:   'معلومات يمكن مشاركتها علناً'
            },
            {
                id:     'internal',
                nameAr: 'داخلي',
                desc:   'للموظفين والشركاء الداخليين فقط'
            },
            {
                id:     'confidential',
                nameAr: 'سري',
                desc:   'يتطلب توقيع NDA قبل الاطّلاع'
            },
            {
                id:     'top-secret',
                nameAr: 'سري للغاية',
                desc:   'محدود بالإدارة العليا — حظر مطلق على المشاركة'
            }
        ]
    });
});

// ─── إشعار حقوق الملكية ──────────────────────────────────────────────────────

router.get('/notice', (req, res) => {
    const year = new Date().getFullYear();
    res.json({
        success: true,
        notice: {
            ar: `© ${year} سوق شيخة — جميع الحقوق محفوظة. لا يجوز إعادة الاستخدام أو النسخ أو التوزيع دون إذن كتابي صريح.`,
            en: `© ${year} Sheikha Market — All Rights Reserved. No reproduction, distribution or use without explicit written permission.`,
            short: `© ${year} Sheikha Market`,
            legal: IP_MASTER_CHARTER.usageTerms.violations.civil
        }
    });
});

// ─── سجل الأصول الفكرية المسجّلة ──────────────────────────────────────────────

router.get('/assets', (req, res) => {
    const { category, confidentiality, status } = req.query;

    const query = {};
    if (category) {
        if (!ALLOWED_CATEGORIES.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `فئة غير صحيحة. المقبول: ${ALLOWED_CATEGORIES.join(' | ')}`
            });
        }
        query.category = category;
    }
    if (confidentiality) {
        if (!ALLOWED_CONFIDENTIALITY.includes(confidentiality)) {
            return res.status(400).json({
                success: false,
                message: `مستوى السرية غير صحيح. المقبول: ${ALLOWED_CONFIDENTIALITY.join(' | ')}`
            });
        }
        query.confidentiality = confidentiality;
    }
    if (status) query.status = status;

    const assets = IPAsset.find(query);

    res.json({
        success: true,
        count:   assets.length,
        owner:   IP_MASTER_CHARTER.owner.nameAr,
        assets:  assets.map(a => a.getSummary())
    });
});

// ─── تفاصيل أصل فكري ──────────────────────────────────────────────────────────

router.get('/assets/:id', (req, res) => {
    const asset = IPAsset.findById(req.params.id);

    if (!asset) {
        return res.status(404).json({
            success: false,
            message: 'الأصل الفكري غير موجود'
        });
    }

    // إخفاء التفاصيل للأصول السرية للغاية (إظهار الملخص فقط)
    if (asset.confidentiality === 'top-secret') {
        return res.json({
            success: true,
            asset:   asset.getSummary(),
            note:    'الأصل ذو تصنيف "سري للغاية" — التفاصيل محظورة على هذا المسار'
        });
    }

    res.json({ success: true, asset });
});

// ─── تسجيل أصل فكري جديد ─────────────────────────────────────────────────────

router.post('/assets', (req, res) => {
    const {
        title, titleAr, titleEn,
        description, category, confidentiality,
        version, registrationRef, registrationDate,
        expiryDate, jurisdiction, tags, createdBy
    } = req.body;

    if (!title && !titleAr) {
        return res.status(400).json({
            success: false,
            message: 'عنوان الأصل الفكري مطلوب (title أو titleAr)'
        });
    }

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
            success: false,
            message: `الفئة مطلوبة. المقبول: ${ALLOWED_CATEGORIES.join(' | ')}`
        });
    }

    if (confidentiality && !ALLOWED_CONFIDENTIALITY.includes(confidentiality)) {
        return res.status(400).json({
            success: false,
            message: `مستوى السرية غير صحيح. المقبول: ${ALLOWED_CONFIDENTIALITY.join(' | ')}`
        });
    }

    const asset = IPAsset.create({
        title:           titleAr || title,
        titleAr:         titleAr || title,
        titleEn:         titleEn  || '',
        description:     description  || '',
        category,
        owner:           IP_MASTER_CHARTER.owner.nameAr,
        confidentiality: confidentiality || 'confidential',
        version:         version         || '1.0.0',
        registrationRef: registrationRef || null,
        registrationDate:registrationDate|| null,
        expiryDate:      expiryDate      || null,
        jurisdiction:    jurisdiction    || ['Saudi Arabia'],
        tags:            tags            || [],
        createdBy:       createdBy       || null,
        status:          'active'
    });

    res.status(201).json({
        success: true,
        message: `تم تسجيل الأصل الفكري — مملوك لـ${IP_MASTER_CHARTER.owner.nameAr}`,
        asset:   asset.getSummary(),
        charterRef: `GET /api/ip/charter`
    });
});

// ─── تحديث أصل فكري ──────────────────────────────────────────────────────────

router.put('/assets/:id', (req, res) => {
    const asset = IPAsset.findById(req.params.id);

    if (!asset) {
        return res.status(404).json({
            success: false,
            message: 'الأصل الفكري غير موجود'
        });
    }

    const allowed = [
        'description', 'version', 'registrationRef', 'registrationDate',
        'expiryDate', 'jurisdiction', 'tags', 'status', 'metadata'
    ];

    // لا يمكن تغيير الفئة أو المالك
    allowed.forEach(field => {
        if (req.body[field] !== undefined) {
            asset[field] = req.body[field];
        }
    });

    // التحقق من status إن وُجد
    const allowedStatuses = ['active', 'expired', 'disputed', 'transferred'];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
            success: false,
            message: `status غير صحيح. المقبول: ${allowedStatuses.join(' | ')}`
        });
    }

    asset.save();

    res.json({
        success: true,
        message: 'تم تحديث الأصل الفكري',
        asset:   asset.getSummary()
    });
});

// ─── الإبلاغ عن انتهاك ────────────────────────────────────────────────────────

router.post('/report-violation', (req, res) => {
    const { reporterName, reporterEmail, violationType, description, evidence, violatorInfo } = req.body;

    if (!description || !violationType) {
        return res.status(400).json({
            success: false,
            message: 'نوع الانتهاك والوصف مطلوبان'
        });
    }

    const allowedViolationTypes = [
        'unauthorized-use', 'copyright-infringement', 'trademark-abuse',
        'trade-secret-breach', 'data-theft', 'nda-breach', 'other'
    ];

    if (!allowedViolationTypes.includes(violationType)) {
        return res.status(400).json({
            success: false,
            message: `نوع الانتهاك غير صحيح. المقبول: ${allowedViolationTypes.join(' | ')}`
        });
    }

    // تسجيل البلاغ
    const report = {
        id:            uuid(),
        type:          'ip-violation',
        violationType,
        description,
        evidence:      evidence      || null,
        violatorInfo:  violatorInfo  || null,
        reporter: {
            name:  reporterName  || 'مجهول',
            email: reporterEmail || null
        },
        status:     'received',
        receivedAt: new Date().toISOString()
    };

    // حفظ في سجل البلاغات
    const violations = database.read('ipViolations') || [];
    violations.push(report);
    database.write('ipViolations', violations);

    res.status(201).json({
        success: true,
        message:      'تم استلام بلاغ الانتهاك — سيتم مراجعته خلال 48 ساعة',
        reportId:     report.id,
        responseTime: IP_MASTER_CHARTER.violationReporting.responseTime,
        process:      IP_MASTER_CHARTER.violationReporting.process,
        legalWarning: IP_MASTER_CHARTER.usageTerms.violations
    });
});

module.exports = router;
