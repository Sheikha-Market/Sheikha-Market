/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA GHANAYIM — مسارات API لمحرك الغنائم والثروة الحلال
 * "فَكُلُوا مِمَّا غَنِمْتُمْ حَلَالًا طَيِّبًا ۚ وَاتَّقُوا اللَّهَ" — الأنفال:69
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const express = require('express');
const router  = express.Router();

let _engine = null;

function getEngine() {
    if (!_engine) {
        const SheikhaGhanayimEngine = require('../lib/sheikha-ghanayim-engine.js');
        _engine = new SheikhaGhanayimEngine();
        console.log('✅ [GHANAYIM] محرك الغنائم والثروة الحلال — مُفعَّل بإذن الله');
    }
    return _engine;
}

// ── لوحة التحكم الرئيسية
router.get('/dashboard', (req, res) => {
    res.json({ success: true, ...getEngine().getDashboard() });
});

// ── التقرير الكامل
router.get('/full-report', (req, res) => {
    res.json({ success: true, ...getEngine().getFullReport() });
});

// ── الأساس القرآني والحديثي
router.get('/quran-foundations', (req, res) => {
    res.json({ success: true, ...getEngine().getQuranFoundations() });
});

// ── أعظم الأغنياء في التاريخ الإسلامي
router.get('/islamic-wealthy', (req, res) => {
    res.json({ success: true, ...getEngine().getIslamicWealthy() });
});

// ── أركان الثروة الحلال
router.get('/wealth-pillars', (req, res) => {
    res.json({ success: true, ...getEngine().getWealthPillars() });
});

// ── مصفوفة الفرص
router.get('/opportunity-matrix', (req, res) => {
    res.json({ success: true, ...getEngine().getOpportunityMatrix() });
});

// ── أولويات الفرص
router.get('/opportunity-priority', (req, res) => {
    res.json({ success: true, ...getEngine().getOpportunityPriority() });
});

// ── استراتيجيات الثروة
router.get('/wealth-strategies', (req, res) => {
    res.json({ success: true, ...getEngine().getWealthStrategies() });
});

// ── نموذج الثروة المناسب للهدف
router.get('/wealth-model', (req, res) => {
    const { goal } = req.query;
    res.json({ success: true, ...getEngine().getWealthModel(goal) });
});

// ── محرك الزكاة
router.get('/zakat-engine', (req, res) => {
    res.json({ success: true, ...getEngine().getZakatEngine() });
});

// ── حاسبة الزكاة (GET بمعامل)
// ملاحظة: الـ POST endpoint هو الموصى به لإخفاء المبالغ من سجلات الخادم
router.get('/zakat-calculate', (req, res) => {
    const amount = parseFloat(req.query.amount);
    const type   = req.query.type || 'cash';
    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال مبلغ صحيح (amount > 0)' });
    }
    const result = getEngine().calculateZakat(amount, type);
    if (result.success === false) return res.status(400).json(result);
    res.json({ success: true, ...result });
});

// ── حاسبة الزكاة (POST) — الموصى به لحماية البيانات المالية من سجلات الخادم
router.post('/zakat-calculate', express.json(), (req, res) => {
    const { amount, type } = req.body || {};
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال مبلغ صحيح (amount > 0)' });
    }
    const result = getEngine().calculateZakat(amt, type || 'cash');
    if (result.success === false) return res.status(400).json(result);
    res.json({ success: true, ...result });
});

// ── قطاعات الثروة
router.get('/wealth-sectors', (req, res) => {
    res.json({ success: true, ...getEngine().getWealthSectors() });
});

// ── أعظم لحظات الثروة في التاريخ
router.get('/historical-wealth', (req, res) => {
    res.json({ success: true, ...getEngine().getHistoricalWealth() });
});

// ── مؤشرات الأداء
router.get('/kpis', (req, res) => {
    res.json({ success: true, ...getEngine().getWealthKPIs() });
});

module.exports = router;
