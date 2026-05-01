// بسم الله الرحمن الرحيم
/**
 * routes/sheikha-vision.js
 * شيخة — قائدة رؤية ٢٠٣٠ + محرك الأثر الذكي
 * Sheikha Vision 2030 Leadership & Smart Impact Engine API
 *
 * "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ" — التوبة:١٠٥
 *
 * === برامج ورؤية ===
 * GET /api/vision/health                — الصحة العامة
 * GET /api/vision/dashboard             — لوحة القيادة الشاملة
 * GET /api/vision/royal-mandate         — الأمر الملكي وتوجيهات الملك سلمان
 * GET /api/vision/leadership            — قيادة شيخة الهيكلية
 * GET /api/vision/programs              — ١١ برنامجاً باسم شيخة
 * GET /api/vision/programs/:id          — برنامج محدد
 * GET /api/vision/programs/leader/:role — برامج قائد محدد
 * GET /api/vision/programs/pillar/:p    — برامج ركيزة محددة (P1/P2/P3)
 * GET /api/vision/targets               — جميع المستهدفات الملموسة
 * GET /api/vision/impact                — إطار قياس الأثر المجتمعي
 * GET /api/vision/impact/metrics        — جميع مقاييس الأثر لكل برنامج
 * GET /api/vision/roadmap               — خارطة طريق شيخة ٢٠٣٠
 * GET /api/vision/sdg                   — التوافق مع أهداف التنمية المستدامة
 *
 * === محرك الأثر الذكي ===
 * GET  /api/vision/live                 — لوحة التحكم الحية (تقييم + ترتيب)
 * GET  /api/vision/live/score           — النقاط الوطنية الشاملة
 * GET  /api/vision/live/program/:id     — أثر برنامج واحد بالتفصيل
 * GET  /api/vision/first-place          — مسار "الأول والأفضل"
 * GET  /api/vision/national-report      — تقرير الأثر الوطني الشامل
 * GET  /api/vision/national-integration — التكامل مع المؤشرات الوطنية
 * POST /api/vision/refresh              — تحديث بيانات التقدم الحي
 */

'use strict';

const express = require('express');
const router  = express.Router();
const SheikhaVisionLeadership = require('../lib/sheikha-vision-leadership');
const SheikhaImpactEngine     = require('../lib/sheikha-impact-engine');

let _engine       = null;
let _impactEngine = null;

function getEngine() {
    if (!_engine) _engine = new SheikhaVisionLeadership();
    return _engine;
}

function getImpact() {
    if (!_impactEngine) _impactEngine = new SheikhaImpactEngine();
    return _impactEngine;
}

// ══════════════════════════════════════════════════════════
// الصحة العامة
// ══════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
    const eng = getEngine();
    res.json({
        success:   true,
        message:   `${eng.name} — مفعّلة ونابضة`,
        timestamp: new Date().toISOString(),
        data: {
            name:      eng.name,
            nameEn:    eng.nameEn,
            programs:  eng.programs.length,
            king:      eng.royalMandate.king.nameAr,
            vision:    eng.royalMandate.vision.nameAr,
            headline:  eng.royalMandate.vision.headline,
            quranic_ref: eng.royalMandate.vision.quranic_ref,
        },
    });
});

// ══════════════════════════════════════════════════════════
// لوحة القيادة الشاملة
// ══════════════════════════════════════════════════════════
router.get('/dashboard', (req, res) => {
    const eng = getEngine();
    res.json({
        success:   true,
        message:   'شيخة — قائدة رؤية ٢٠٣٠ · لوحة القيادة الشاملة',
        timestamp: new Date().toISOString(),
        data:      eng.getDashboard(),
    });
});

// ══════════════════════════════════════════════════════════
// الأمر الملكي — الملك سلمان
// ══════════════════════════════════════════════════════════
router.get('/royal-mandate', (req, res) => {
    const eng = getEngine();
    res.json({
        success:   true,
        message:   'التوجيهات الملكية لرؤية ٢٠٣٠ وتعهد شيخة',
        timestamp: new Date().toISOString(),
        data:      eng.royalMandate,
    });
});

// ══════════════════════════════════════════════════════════
// قيادة شيخة
// ══════════════════════════════════════════════════════════
router.get('/leadership', (req, res) => {
    const eng = getEngine();
    res.json({
        success:   true,
        message:   'هيكل قيادة شيخة لرؤية ٢٠٣٠',
        timestamp: new Date().toISOString(),
        data:      eng.leadership,
    });
});

// ══════════════════════════════════════════════════════════
// البرامج الـ١١ — باسم شيخة
// ══════════════════════════════════════════════════════════
router.get('/programs', (req, res) => {
    const eng = getEngine();
    const { pillar } = req.query;
    const programs = pillar
        ? eng.getProgramsByPillar(pillar.toUpperCase())
        : eng.programs;

    res.json({
        success:   true,
        message:   `برامج رؤية ٢٠٣٠ — باسم شيخة وقيادتها (${programs.length} برنامج)`,
        timestamp: new Date().toISOString(),
        count:     programs.length,
        data:      programs.map(p => ({
            id:               p.id,
            sheikhaName:      p.sheikhaName,
            sheikhaNameEn:    p.sheikhaNameEn,
            sheikhaLeader:    p.sheikhaLeader,
            vision2030Program: p.vision2030Program,
            pillar:           p.pillar,
            royalGoal:        p.royalGoal,
            sheikhaObjective: p.sheikhaObjective,
            sectors:          p.sectors,
            tangibleTargets:  p.tangibleTargets,
            societalImpact:   p.societalImpact,
            sheikhaContribution: p.sheikhaContribution,
            quranic_ref:      p.quranic_ref,
        })),
    });
});

// ── برنامج محدد بـ id ──────────────────────────────────────
router.get('/programs/leader/:role', (req, res) => {
    const eng      = getEngine();
    const programs = eng.getProgramsByLeader(decodeURIComponent(req.params.role));
    if (!programs.length) {
        return res.status(404).json({ success: false, message: `لا توجد برامج للقائد: ${req.params.role}` });
    }
    res.json({
        success:   true,
        message:   `برامج القائد: ${req.params.role}`,
        timestamp: new Date().toISOString(),
        count:     programs.length,
        data:      programs,
    });
});

router.get('/programs/pillar/:p', (req, res) => {
    const eng      = getEngine();
    const programs = eng.getProgramsByPillar(req.params.p.toUpperCase());
    if (!programs.length) {
        return res.status(404).json({ success: false, message: `لا توجد برامج للركيزة: ${req.params.p}` });
    }
    res.json({
        success:   true,
        message:   `برامج الركيزة: ${req.params.p}`,
        timestamp: new Date().toISOString(),
        count:     programs.length,
        data:      programs,
    });
});

router.get('/programs/:id', (req, res) => {
    const eng     = getEngine();
    const program = eng.getProgramById(req.params.id.toUpperCase());
    if (!program) {
        return res.status(404).json({ success: false, message: `البرنامج غير موجود: ${req.params.id}` });
    }
    res.json({
        success:   true,
        message:   `شيخة — ${program.sheikhaName}`,
        timestamp: new Date().toISOString(),
        data:      program,
    });
});

// ══════════════════════════════════════════════════════════
// المستهدفات الملموسة والمحسوسة
// ══════════════════════════════════════════════════════════
router.get('/targets', (req, res) => {
    const eng     = getEngine();
    const targets = eng.getAllTangibleTargets();
    res.json({
        success:   true,
        message:   'المستهدفات الملموسة والمحسوسة — رؤية شيخة ٢٠٣٠',
        timestamp: new Date().toISOString(),
        count:     targets.length,
        data:      targets,
    });
});

// ══════════════════════════════════════════════════════════
// إطار قياس الأثر المجتمعي
// ══════════════════════════════════════════════════════════
router.get('/impact', (req, res) => {
    const eng = getEngine();
    res.json({
        success:   true,
        message:   'إطار شيخة لقياس الأثر المجتمعي',
        timestamp: new Date().toISOString(),
        data:      eng.impactFramework,
    });
});

router.get('/impact/metrics', (req, res) => {
    const eng     = getEngine();
    const metrics = eng.getAllImpactMetrics();
    res.json({
        success:   true,
        message:   'مقاييس الأثر المجتمعي لكل برنامج من برامج شيخة',
        timestamp: new Date().toISOString(),
        count:     metrics.length,
        data:      metrics,
    });
});

// ══════════════════════════════════════════════════════════
// خارطة الطريق
// ══════════════════════════════════════════════════════════
router.get('/roadmap', (req, res) => {
    const eng = getEngine();
    res.json({
        success:   true,
        message:   'خارطة طريق شيخة — من ٢٠٢٦ إلى ٢٠٣٠',
        timestamp: new Date().toISOString(),
        data:      eng.roadmap,
    });
});

// ══════════════════════════════════════════════════════════
// التوافق مع أهداف التنمية المستدامة
// ══════════════════════════════════════════════════════════
router.get('/sdg', (req, res) => {
    const eng = getEngine();
    res.json({
        success:   true,
        message:   'توافق برامج شيخة مع أهداف التنمية المستدامة للأمم المتحدة',
        timestamp: new Date().toISOString(),
        count:     eng.impactFramework.sdgAlignment.length,
        data:      eng.impactFramework.sdgAlignment,
    });
});

// ══════════════════════════════════════════════════════════
// ⚡ لوحة التحكم الحية — محرك الأثر الذكي
// ══════════════════════════════════════════════════════════
router.get('/live', (req, res) => {
    const impact = getImpact();
    res.json({
        success:   true,
        message:   'شيخة — لوحة التحكم الحية لقياس الأثر الوطني',
        timestamp: new Date().toISOString(),
        data:      impact.getLiveDashboard(),
    });
});

// ── النقاط الوطنية الشاملة ────────────────────────────────
router.get('/live/score', (req, res) => {
    const impact = getImpact();
    const idx    = impact._nationalIndex;
    res.json({
        success:       true,
        message:       'النقاط الوطنية الشاملة لمحرك شيخة الذكي',
        timestamp:     new Date().toISOString(),
        nationalScore:  idx.nationalScore,
        nationalRating: idx.nationalRating,
        lastRefreshed:  impact._lastRefreshed,
        programs:       idx.programScores.map(s => ({
            rank:         s.rank,
            sheikhaName:  s.sheikhaName,
            score:        s.score,
            status:       s.status,
        })),
    });
});

// ── أثر برنامج واحد بالتفصيل ─────────────────────────────
router.get('/live/program/:id', (req, res) => {
    const impact  = getImpact();
    const program = impact.getProgramImpact(req.params.id.toUpperCase());
    if (!program) {
        return res.status(404).json({ success: false, message: `البرنامج غير موجود: ${req.params.id}` });
    }
    res.json({
        success:   true,
        message:   `أثر برنامج: ${program.sheikhaName}`,
        timestamp: new Date().toISOString(),
        data:      program,
    });
});

// ══════════════════════════════════════════════════════════
// 🏆 مسار "الأول والأفضل"
// ══════════════════════════════════════════════════════════
router.get('/first-place', (req, res) => {
    const impact = getImpact();
    res.json({
        success:   true,
        message:   'شيخة — مسار الأول والأفضل في تحقيق النتائج الوطنية',
        timestamp: new Date().toISOString(),
        data:      impact.getFirstPlaceRoadmap(),
    });
});

// ══════════════════════════════════════════════════════════
// 📊 تقرير الأثر الوطني الشامل
// ══════════════════════════════════════════════════════════
router.get('/national-report', (req, res) => {
    const impact = getImpact();
    res.json({
        success:   true,
        message:   'تقرير شيخة للأثر الوطني الشامل — رؤية ٢٠٣٠',
        timestamp: new Date().toISOString(),
        data:      impact.getNationalImpactReport(),
    });
});

// ══════════════════════════════════════════════════════════
// 🔗 التكامل مع المؤشرات الوطنية
// ══════════════════════════════════════════════════════════
router.get('/national-integration', (req, res) => {
    const impact = getImpact();
    res.json({
        success:   true,
        message:   'تكامل شيخة مع المؤشرات الوطنية لرؤية ٢٠٣٠',
        timestamp: new Date().toISOString(),
        data:      impact.getNationalIntegrationStatus(),
    });
});

// ══════════════════════════════════════════════════════════
// 🔄 تحديث بيانات التقدم الحي (POST)
// ══════════════════════════════════════════════════════════
router.post('/refresh', (req, res) => {
    const impact = getImpact();
    const result = impact.refresh(req.body || {});
    res.json({
        success:   true,
        message:   'تم تحديث مؤشرات الأثر بنجاح',
        timestamp: new Date().toISOString(),
        data:      result,
    });
});

module.exports = router;
