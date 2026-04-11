/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA MALAHEM — مسارات API لمحرك الملاحم والاتحاد (تثقيف شرعي معرفي)
 * "وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ" — الأنفال:60
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const express = require('express');
const router  = express.Router();

let _engine = null;

function getEngine() {
    if (!_engine) {
        const SheikhaМalahemUnionEngine = require('../lib/sheikha-malahem-union-engine.js');
        _engine = new SheikhaМalahemUnionEngine();
        console.log('✅ [MALAHEM] محرك الملاحم والاتحاد — مُفعَّل (تثقيف شرعي معرفي)');
    }
    return _engine;
}

// ── لوحة التحكم الرئيسية
router.get('/dashboard', (req, res) => {
    res.json({ success: true, ...getEngine().getDashboard() });
});

// ── الحالة العامة
router.get('/status', (req, res) => {
    res.json({ success: true, ...getEngine().getStatus() });
});

// ── التقرير الكامل
router.get('/full-report', (req, res) => {
    res.json({ success: true, ...getEngine().getFullReport() });
});

// ── أحاديث الاتحاد والصُّلح مع الروم
router.get('/alliance-hadiths', (req, res) => {
    res.json({ success: true, ...getEngine().getAllianceHadiths() });
});

// ── تسلسل الملاحم الكبرى
router.get('/malahem-sequence', (req, res) => {
    res.json({ success: true, ...getEngine().getMalahemSequence() });
});

// ── حدث معيّن من الملاحم (مثل: /event/MS-07)
router.get('/event/:id', (req, res) => {
    const result = getEngine().getMalahemEvent(String(req.params.id).toUpperCase());
    if (result.success === false) return res.status(404).json(result);
    res.json({ success: true, ...result });
});

// ── نموذج الاتحاد الإسلامي والدروس الاستراتيجية
router.get('/islamic-union-model', (req, res) => {
    res.json({ success: true, ...getEngine().getIslamicUnionModel() });
});

// ── الغنائم في سياق الملاحم
router.get('/ghanayim-malahem', (req, res) => {
    res.json({ success: true, ...getEngine().getGhanayimMalahem() });
});

// ── نزول عيسى بن مريم ﷺ
router.get('/isa-descend', (req, res) => {
    res.json({ success: true, ...getEngine().getIsaDescend() });
});

// ── المسيح الدجال ونهايته
router.get('/dajjal', (req, res) => {
    res.json({ success: true, ...getEngine().getDajjalEnd() });
});

// ── دليل الاستعداد الشامل
router.get('/preparedness-guide', (req, res) => {
    res.json({ success: true, ...getEngine().getPreparednessGuide() });
});

// ── ملاحظات العلماء وضوابط الفهم
router.get('/scholarly-notes', (req, res) => {
    res.json({ success: true, ...getEngine().getScholarlyNotes() });
});

module.exports = router;
