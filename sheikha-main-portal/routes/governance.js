/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏛️ مسارات الحوكمة الشرعية — منظومة شيخة
 *  Sharia Governance Routes
 *
 *  GET  /api/governance/charter            → الميثاق الجامع (الكتاب + السنة + الخلفاء)
 *  GET  /api/governance/sources            → مصادر التشريع الإسلامي
 *  GET  /api/governance/values             → القيم الجوهرية للمنظومة
 *  GET  /api/governance/ethics             → أخلاقيات المنظمات والأسواق
 *  GET  /api/governance/regulations        → اللوائح والأنظمة التشغيلية
 *  GET  /api/governance/sunnah-khulafa     → سنة الخلفاء الراشدين في الإدارة والتجارة
 *  GET  /api/governance/networks           → الشبكات والمخططات الهيكلية
 *  GET  /api/governance/architecture       → المعمارية والهيكلة الموحّدة
 *  POST /api/governance/validate           → التحقق من امتثال أي فعل/عقد للحوكمة
 *  POST /api/governance/decisions          → تسجيل قرار حوكمة
 *  GET  /api/governance/decisions          → قائمة قرارات الحوكمة
 *  GET  /api/governance/decisions/:id      → تفاصيل قرار
 *  PUT  /api/governance/decisions/:id/stage → تقدّم مرحلة في القرار
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

const {
    MASTER_CHARTER,
    NETWORKS,
    REGULATIONS,
    ETHICS,
    ARCHITECTURE,
    GovernanceDecision
} = require('../models/ShariaGovernance');

// ─── الميثاق الجامع ───────────────────────────────────────────────────────────

router.get('/charter', (req, res) => {
    res.json({
        success:  true,
        bismillah: MASTER_CHARTER.bismillah,
        tawheed:   MASTER_CHARTER.tawheed,
        version:   MASTER_CHARTER.version,
        charter:   MASTER_CHARTER
    });
});

// ─── مصادر التشريع ────────────────────────────────────────────────────────────

router.get('/sources', (req, res) => {
    res.json({
        success: true,
        title:   'مصادر التشريع الإسلامي — المرجعية الحاكمة على منظومة شيخة',
        sources: MASTER_CHARTER.sources
    });
});

// ─── المحظورات المطلقة ────────────────────────────────────────────────────────

router.get('/prohibitions', (req, res) => {
    res.json({
        success: true,
        title:   'المحظورات المطلقة في التجارة الإسلامية',
        count:   MASTER_CHARTER.absoluteProhibitions.length,
        prohibitions: MASTER_CHARTER.absoluteProhibitions
    });
});

// ─── القيم الجوهرية ───────────────────────────────────────────────────────────

router.get('/values', (req, res) => {
    res.json({
        success: true,
        title:   'القيم الجوهرية لمنظومة شيخة',
        count:   MASTER_CHARTER.coreValues.length,
        values:  MASTER_CHARTER.coreValues
    });
});

// ─── سنة الخلفاء الراشدين ────────────────────────────────────────────────────

router.get('/sunnah-khulafa', (req, res) => {
    const { caliph } = req.query;

    let data = MASTER_CHARTER.sunnahKhulafa;

    if (caliph) {
        data = data.filter(c => c.caliphId === caliph);
        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'الخليفة غير موجود',
                available: MASTER_CHARTER.sunnahKhulafa.map(c => c.caliphId)
            });
        }
    }

    res.json({
        success: true,
        title:   'سنة الخلفاء الراشدين المهديين في الإدارة والتجارة',
        hadith:  MASTER_CHARTER.sources.find(s => s.id === 'sunnah-khulafa'),
        caliphs: data
    });
});

// ─── أخلاقيات المنظمات والأسواق ──────────────────────────────────────────────

router.get('/ethics', (req, res) => {
    const { type } = req.query; // organizations | markets

    if (type === 'organizations') {
        return res.json({
            success: true,
            type:    'organizations',
            title:   'أخلاقيات المنظمات',
            count:   ETHICS.forOrganizations.length,
            ethics:  ETHICS.forOrganizations
        });
    }

    if (type === 'markets') {
        return res.json({
            success: true,
            type:    'markets',
            title:   'أخلاقيات الأسواق والتجارة',
            count:   ETHICS.forMarkets.length,
            ethics:  ETHICS.forMarkets
        });
    }

    // الكل
    res.json({
        success: true,
        title:   'أخلاقيات المنظومة — المنظمات والأسواق',
        forOrganizations: {
            count:  ETHICS.forOrganizations.length,
            ethics: ETHICS.forOrganizations
        },
        forMarkets: {
            count:  ETHICS.forMarkets.length,
            ethics: ETHICS.forMarkets
        }
    });
});

// ─── اللوائح والأنظمة ─────────────────────────────────────────────────────────

router.get('/regulations', (req, res) => {
    const { category } = req.query;

    let regs = REGULATIONS;

    if (category) {
        regs = REGULATIONS.filter(r => r.category === category);
        if (regs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'الفئة غير موجودة',
                available: [...new Set(REGULATIONS.map(r => r.category))]
            });
        }
    }

    res.json({
        success:     true,
        title:       'اللوائح والأنظمة التشغيلية لمنظومة شيخة',
        count:       regs.length,
        categories:  [...new Set(REGULATIONS.map(r => r.category))],
        regulations: regs
    });
});

// ─── الشبكات والمخططات ────────────────────────────────────────────────────────

router.get('/networks', (req, res) => {
    const { id } = req.query;

    if (id) {
        const net = NETWORKS[id];
        if (!net) {
            return res.status(404).json({
                success: false,
                message: 'الشبكة غير موجودة',
                available: Object.keys(NETWORKS)
            });
        }
        return res.json({ success: true, network: net });
    }

    res.json({
        success:  true,
        title:    'شبكات منظومة شيخة الهيكلية',
        count:    Object.keys(NETWORKS).length,
        networks: NETWORKS
    });
});

// ─── المعمارية والهيكلة ───────────────────────────────────────────────────────

router.get('/architecture', (req, res) => {
    res.json({
        success:      true,
        title:        'المعمارية الموحّدة لمنظومة شيخة',
        pattern:      ARCHITECTURE.pattern,
        layersCount:  ARCHITECTURE.layers.length,
        layers:       ARCHITECTURE.layers,
        diagram: {
            description: 'الهيكل الهرمي من الحوكمة الشرعية إلى الأسواق',
            ascii: [
                '┌─────────────────────────────────────────────────────┐',
                '│         🕌 الحوكمة الشرعية (الكتاب والسنة)          │',
                '└──────────────────────┬──────────────────────────────┘',
                '                       │',
                '┌──────────────────────▼──────────────────────────────┐',
                '│         🏛️ منظمة شيخة الأم (root)                    │',
                '└────────┬─────────────┬──────────────┬───────────────┘',
                '         │             │              │',
                '    ┌────▼───┐   ┌─────▼──┐   ┌──────▼───┐',
                '    │أسواق  │   │ علوم   │   │ تقنيات  │',
                '    └────┬───┘   └────────┘   └──────────┘',
                '         │',
                '┌────────▼────────────────────────────────────────────┐',
                '│  🌐 سوق الأسواق: حقيقي + إلكتروني + رقمي            │',
                '└─────────────────────────────────────────────────────┘'
            ].join('\n')
        }
    });
});

// ─── التحقق من الامتثال للحوكمة ──────────────────────────────────────────────

router.post('/validate', (req, res) => {
    const { action, entityType, entityData } = req.body;

    if (!action) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال وصف الفعل أو العقد (action)'
        });
    }

    const checks = [];
    const text = JSON.stringify(entityData || {}).toLowerCase() + ' ' + action.toLowerCase();

    // ─── فحص المحظورات ────────────────────────────────────────────────────────
    MASTER_CHARTER.absoluteProhibitions.forEach(p => {
        let failed = false;

        if (p.id === 'riba') {
            failed = /فائدة|ربا|interest|usury/.test(text);
        } else if (p.id === 'gharar') {
            failed = /مجهول|غرر|غير محدد|غير واضح/.test(text);
        } else if (p.id === 'ghish') {
            failed = /غش|تدليس|مزوّر|مزور/.test(text);
        } else if (p.id === 'ihtikar') {
            failed = /احتكار|حكر/.test(text);
        } else if (p.id === 'haram-goods') {
            failed = /خمر|خنزير|ميسر|قمار|مخدر/.test(text);
        }

        checks.push({
            prohibition: p.nameAr,
            reference:   p.reference,
            evidence:    p.evidence,
            status:      failed ? 'FAIL' : 'PASS',
            severity:    failed ? 'critical' : 'ok'
        });
    });

    const failed    = checks.filter(c => c.status === 'FAIL');
    const isValid   = failed.length === 0;
    const score     = Math.round(((checks.length - failed.length) / checks.length) * 100);

    res.json({
        success:   true,
        isCompliant: isValid,
        score,
        status:    isValid ? 'متوافق مع الشريعة ✅' : 'غير متوافق — يجب المراجعة ❌',
        checks,
        violations: failed,
        recommendation: isValid
            ? 'الفعل/العقد يبدو متوافقاً مع الشريعة الإسلامية — تبارك الله'
            : `يوجد ${failed.length} مخالف/مخالفات شرعية يجب معالجتها قبل المتابعة`,
        note: 'هذا فحص آلي أوّلي — يُنصح بمراجعة عالم شرعي للمعاملات الكبيرة'
    });
});

// ─── تسجيل قرار حوكمة ─────────────────────────────────────────────────────────

router.post('/decisions', (req, res) => {
    const { type, entityId, entityType, title, description, shariaRef } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: 'عنوان القرار مطلوب'
        });
    }

    const allowedTypes = ['trade', 'org', 'market', 'dispute', 'general'];
    if (type && !allowedTypes.includes(type)) {
        return res.status(400).json({
            success: false,
            message: `نوع القرار غير صحيح. المقبول: ${allowedTypes.join(' | ')}`
        });
    }

    const decision = GovernanceDecision.create({
        type:        type        || 'general',
        entityId:    entityId    || null,
        entityType:  entityType  || null,
        title,
        description: description || '',
        shariaRef:   shariaRef   || [],
        verdict:     'pending'
    });

    res.status(201).json({
        success:  true,
        message:  'تم تسجيل قرار الحوكمة — في انتظار المراجعة الفقهية',
        decision,
        nextStep: `PUT /api/governance/decisions/${decision.id}/stage`
    });
});

// ─── قائمة قرارات الحوكمة ─────────────────────────────────────────────────────

router.get('/decisions', (req, res) => {
    const { type, verdict, entityType } = req.query;

    const query = {};
    if (type)       query.type       = type;
    if (verdict)    query.verdict    = verdict;
    if (entityType) query.entityType = entityType;

    const decisions = GovernanceDecision.find(query);

    res.json({
        success:   true,
        count:     decisions.length,
        decisions: decisions.map(d => ({
            id:          d.id,
            type:        d.type,
            title:       d.title,
            verdict:     d.verdict,
            entityId:    d.entityId,
            entityType:  d.entityType,
            currentStage: d.stages.find(s => s.status === 'pending')?.nameAr || 'مكتمل',
            createdAt:   d.createdAt
        }))
    });
});

// ─── تفاصيل قرار ──────────────────────────────────────────────────────────────

router.get('/decisions/:id', (req, res) => {
    const decision = GovernanceDecision.findById(req.params.id);

    if (!decision) {
        return res.status(404).json({
            success: false,
            message: 'القرار غير موجود'
        });
    }

    res.json({ success: true, decision });
});

// ─── تقدّم مرحلة في القرار ────────────────────────────────────────────────────

router.put('/decisions/:id/stage', (req, res) => {
    const decision = GovernanceDecision.findById(req.params.id);

    if (!decision) {
        return res.status(404).json({
            success: false,
            message: 'القرار غير موجود'
        });
    }

    const { stageId, result, reviewedBy, notes } = req.body;

    const allowedResults = ['approved', 'rejected', 'needs-revision'];
    if (!stageId || !result) {
        return res.status(400).json({
            success: false,
            message: 'stageId و result مطلوبان'
        });
    }

    if (!allowedResults.includes(result)) {
        return res.status(400).json({
            success: false,
            message: `result غير صحيح. المقبول: ${allowedResults.join(' | ')}`
        });
    }

    const stage = decision.stages.find(s => s.id === stageId);
    if (!stage) {
        return res.status(404).json({
            success: false,
            message: `المرحلة "${stageId}" غير موجودة`,
            available: decision.stages.map(s => s.id)
        });
    }

    stage.status      = result;
    stage.reviewedBy  = reviewedBy || null;
    stage.reviewedAt  = new Date().toISOString();
    stage.notes       = notes || null;

    // تحديث الحكم الكلي
    const allDone     = decision.stages.every(s => s.status !== 'pending');
    const anyRejected = decision.stages.some(s => s.status === 'rejected');

    if (allDone) {
        decision.verdict    = anyRejected ? 'non-compliant' : 'compliant';
        decision.reviewedBy = reviewedBy || null;
        decision.reviewedAt = new Date().toISOString();
    }

    decision.save();

    res.json({
        success:  true,
        message:  `تم تحديث المرحلة "${stage.nameAr}"`,
        stage,
        overallVerdict: decision.verdict,
        decision
    });
});

module.exports = router;
