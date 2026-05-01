// بسم الله الرحمن الرحيم
/**
 * routes/sheikha-programs.js
 * شيخة برامج رؤية ٢٠٣٠ — الإحدى عشرة + المستهدفات الكبرى
 *
 * "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ" — الرعد:١١
 *
 * GET /api/programs/health              — الصحة العامة
 * GET /api/programs/dashboard           — لوحة تحكم شاملة
 * GET /api/programs/list                — قائمة ١١ برنامج
 * GET /api/programs/:id                 — تفاصيل برنامج محدد
 * GET /api/programs/pillar/:pillar      — برامج ركيزة (P1/P2/P3)
 * GET /api/programs/maqsad/:maqsad     — برامج مقصد شرعي
 * GET /api/programs/targets             — المستهدفات الرقمية الكبرى
 * GET /api/programs/targets/:category  — مستهدفات فئة محددة
 * GET /api/programs/sheikha             — مساهمة شيخة في رؤية ٢٠٣٠
 * GET /api/programs/kpis                — جميع مؤشرات الأداء
 */

'use strict';

const express = require('express');
const router = express.Router();
const SheikhaVision2030Programs = require('../lib/sheikha-vision2030-programs');

let _engine = null;

function getEngine() {
    if (!_engine) _engine = new SheikhaVision2030Programs();
    return _engine;
}

// ═══════════════════════════════════════════════════════════════
// الصحة العامة
// ═══════════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
    const eng = getEngine();
    res.json({
        success: true,
        message: 'شيخة برامج رؤية ٢٠٣٠ — مفعّلة ونابضة',
        timestamp: new Date().toISOString(),
        data: {
            vision: eng.vision.nameAr,
            headline: eng.vision.headline,
            programs: eng.programs.length,
            targetCategories: eng.targets.categories.length,
            quranic_ref: eng.vision.quranic_ref
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// لوحة التحكم الشاملة
// ═══════════════════════════════════════════════════════════════
router.get('/dashboard', (req, res) => {
    const eng = getEngine();
    res.json({
        success: true,
        message: 'برامج رؤية المملكة ٢٠٣٠ — لوحة شيخة الشاملة',
        timestamp: new Date().toISOString(),
        data: eng.getDashboard()
    });
});

// ═══════════════════════════════════════════════════════════════
// قائمة البرامج
// ═══════════════════════════════════════════════════════════════
router.get('/list', (req, res) => {
    const eng = getEngine();
    const { pillar, maqsad, sector } = req.query;

    let programs = eng.programs;
    if (pillar) programs = programs.filter(p => p.pillar === pillar.toUpperCase());
    if (maqsad) programs = programs.filter(p => p.maqsad === maqsad.toUpperCase());
    if (sector) programs = programs.filter(p => p.sectors && p.sectors.some(s => s.includes(sector)));

    res.json({
        success: true,
        message: 'قائمة برامج رؤية ٢٠٣٠',
        timestamp: new Date().toISOString(),
        total: programs.length,
        filters: { pillar: pillar || null, maqsad: maqsad || null, sector: sector || null },
        data: programs
    });
});

// ═══════════════════════════════════════════════════════════════
// برامج ركيزة معينة
// ═══════════════════════════════════════════════════════════════
router.get('/pillar/:pillar', (req, res) => {
    const eng = getEngine();
    const pillar = req.params.pillar.toUpperCase();
    const pillarNames = { P1: 'مجتمع حيوي', P2: 'اقتصاد مزدهر', P3: 'وطن طموح' };

    if (!pillarNames[pillar]) {
        return res.status(400).json({
            success: false,
            message: 'الركيزة غير صالحة — الركائز المتاحة: P1، P2، P3',
            timestamp: new Date().toISOString()
        });
    }

    const programs = eng.getProgramsByPillar(pillar);
    res.json({
        success: true,
        message: `برامج ركيزة: ${pillarNames[pillar]}`,
        timestamp: new Date().toISOString(),
        pillar: { id: pillar, nameAr: pillarNames[pillar] },
        total: programs.length,
        data: programs
    });
});

// ═══════════════════════════════════════════════════════════════
// برامج مقصد شرعي
// ═══════════════════════════════════════════════════════════════
router.get('/maqsad/:maqsad', (req, res) => {
    const eng = getEngine();
    const maqsad = req.params.maqsad.toUpperCase();
    const maqsadNames = {
        DIN: 'حفظ الدين',
        NAFS: 'حفظ النفس',
        AQL: 'حفظ العقل',
        NASL: 'حفظ النسل',
        MAL: 'حفظ المال',
        ARD: 'حفظ الأرض'
    };

    if (!maqsadNames[maqsad]) {
        return res.status(400).json({
            success: false,
            message: 'المقصد غير صالح — المقاصد المتاحة: DIN, NAFS, AQL, NASL, MAL, ARD',
            timestamp: new Date().toISOString()
        });
    }

    const programs = eng.getProgramsByMaqsad(maqsad);
    res.json({
        success: true,
        message: `برامج مقصد: ${maqsadNames[maqsad]}`,
        timestamp: new Date().toISOString(),
        maqsad: { id: maqsad, nameAr: maqsadNames[maqsad] },
        total: programs.length,
        data: programs
    });
});

// ═══════════════════════════════════════════════════════════════
// المستهدفات الرقمية الكبرى
// ═══════════════════════════════════════════════════════════════
router.get('/targets', (req, res) => {
    const eng = getEngine();
    res.json({
        success: true,
        message: 'المستهدفات الرقمية الكبرى لرؤية ٢٠٣٠',
        timestamp: new Date().toISOString(),
        highlights: {
            economy: 'الأولى عالمياً كأكبر اقتصاد',
            unemployment: 'خفض البطالة من 11.6% إلى 0%',
            nonOilExports: 'رفع الصادرات غير النفطية من 16% إلى 100%',
            tourism: 'مليار معتمر سنوياً (من 8 ملايين)'
        },
        data: eng.targets
    });
});

router.get('/targets/:category', (req, res) => {
    const eng = getEngine();
    const category = req.params.category.toUpperCase();
    const found = eng.targets.categories.find(c => c.id === category);

    if (!found) {
        return res.status(404).json({
            success: false,
            message: `الفئة غير موجودة: ${category}`,
            availableCategories: eng.targets.categories.map(c => c.id),
            timestamp: new Date().toISOString()
        });
    }

    res.json({
        success: true,
        message: `مستهدفات فئة: ${found.nameAr}`,
        timestamp: new Date().toISOString(),
        total: found.targets.length,
        data: found
    });
});

// ═══════════════════════════════════════════════════════════════
// جميع مؤشرات الأداء
// ═══════════════════════════════════════════════════════════════
router.get('/kpis', (req, res) => {
    const eng = getEngine();
    const allKpis = [];
    for (const p of eng.programs) {
        for (const k of p.kpis) {
            allKpis.push({
                ...k,
                programId: p.id,
                programName: p.nameAr,
                pillar: p.pillar,
                maqsad: p.maqsad
            });
        }
    }
    res.json({
        success: true,
        message: 'جميع مؤشرات الأداء لبرامج رؤية ٢٠٣٠',
        timestamp: new Date().toISOString(),
        total: allKpis.length,
        data: allKpis
    });
});

// ═══════════════════════════════════════════════════════════════
// مساهمة شيخة في رؤية ٢٠٣٠
// ═══════════════════════════════════════════════════════════════
router.get('/sheikha', (req, res) => {
    const eng = getEngine();
    res.json({
        success: true,
        message: 'مساهمة منظومة شيخة في رؤية ٢٠٣٠',
        timestamp: new Date().toISOString(),
        data: {
            alignment: eng.sheikhaAlignment,
            programContributions: eng.programs.map(p => ({
                programId: p.id,
                programName: p.nameAr,
                pillar: p.pillar,
                maqsad: p.maqsad,
                sheikha_contribution: p.sheikha_contribution
            }))
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// برنامج محدد (يجب أن يكون آخر المسارات)
// ═══════════════════════════════════════════════════════════════
router.get('/:id', (req, res) => {
    const eng = getEngine();
    const program = eng.getProgramById(req.params.id.toUpperCase());

    if (!program) {
        return res.status(404).json({
            success: false,
            message: `البرنامج غير موجود: ${req.params.id}`,
            availablePrograms: eng.programs.map(p => ({ id: p.id, code: p.code, nameAr: p.nameAr })),
            timestamp: new Date().toISOString()
        });
    }

    res.json({
        success: true,
        message: `تفاصيل برنامج: ${program.nameAr}`,
        timestamp: new Date().toISOString(),
        data: program
    });
});

module.exports = router;
