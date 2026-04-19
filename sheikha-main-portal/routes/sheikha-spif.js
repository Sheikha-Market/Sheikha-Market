// بسم الله الرحمن الرحيم
/**
 * routes/sheikha-spif.js
 * صندوق شيخة للاستثمارات العامة — REST API
 * Sheikha Public Investment Fund (SPIF)
 *
 * "مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ" — البقرة:٢٦١
 *
 * GET /api/spif/health           — الصحة العامة
 * GET /api/spif/dashboard        — لوحة التحكم الشاملة
 * GET /api/spif/identity         — هوية الصندوق واسمه الكامل
 * GET /api/spif/portfolios       — جميع المحافظ الاستثمارية
 * GET /api/spif/portfolios/:id   — محفظة محددة
 * GET /api/spif/mega-projects    — المشاريع الكبرى
 * GET /api/spif/mega-projects/:id — مشروع كبير محدد
 * GET /api/spif/kpis             — مؤشرات الأداء الرئيسية
 * GET /api/spif/partnerships     — الشراكات الاستراتيجية
 * GET /api/spif/sharia           — الهيئة الشرعية ومعايير الامتثال
 * GET /api/spif/sheikha-role     — دور منصة شيخة في الصندوق
 * GET /api/spif/report           — التقرير الشامل الكامل
 */

'use strict';

const express = require('express');
const router  = express.Router();
const SheikhaPublicInvestmentFund = require('../lib/sheikha-public-investment-fund');

let _fund = null;

function getFund() {
    if (!_fund) _fund = new SheikhaPublicInvestmentFund();
    return _fund;
}

// ══════════════════════════════════════════════════════════
// الصحة العامة
// ══════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
    const fund = getFund();
    res.json({
        success:   true,
        message:   `${fund.nameAr} — مفعّل ونابض`,
        timestamp: new Date().toISOString(),
        data: {
            nameAr:    fund.nameAr,
            nameEn:    fund.nameEn,
            acronym:   fund.acronym,
            taglineAr: fund.identity.taglineAr,
            taglineEn: fund.identity.taglineEn,
            portfolios:   fund.portfolios.length,
            megaProjects: fund.megaProjects.length,
            kpis:         fund.kpis.length,
            quranic_ref:  fund.identity.quranic_refs[0],
        },
    });
});

// ══════════════════════════════════════════════════════════
// لوحة التحكم الشاملة
// ══════════════════════════════════════════════════════════
router.get('/dashboard', (req, res) => {
    const fund = getFund();
    res.json({
        success:   true,
        message:   `${fund.nameAr} — لوحة التحكم الشاملة`,
        timestamp: new Date().toISOString(),
        data:      fund.getDashboard(),
    });
});

// ══════════════════════════════════════════════════════════
// هوية الصندوق
// ══════════════════════════════════════════════════════════
router.get('/identity', (req, res) => {
    const fund = getFund();
    res.json({
        success:   true,
        message:   'هوية صندوق شيخة للاستثمارات العامة',
        timestamp: new Date().toISOString(),
        data:      fund.identity,
    });
});

// ══════════════════════════════════════════════════════════
// الحوكمة
// ══════════════════════════════════════════════════════════
router.get('/governance', (req, res) => {
    const fund = getFund();
    res.json({
        success:   true,
        message:   'حوكمة صندوق شيخة للاستثمارات العامة',
        timestamp: new Date().toISOString(),
        data:      fund.governance,
    });
});

// ══════════════════════════════════════════════════════════
// المحافظ الاستثمارية
// ══════════════════════════════════════════════════════════
router.get('/portfolios', (req, res) => {
    const fund = getFund();
    res.json({
        success:   true,
        message:   `المحافظ الاستثمارية لـ ${fund.nameAr}`,
        timestamp: new Date().toISOString(),
        count:     fund.portfolios.length,
        data:      fund.portfolios,
    });
});

router.get('/portfolios/:id', (req, res) => {
    const fund = getFund();
    const portfolio = fund.getPortfolioById(req.params.id.toUpperCase());
    if (!portfolio) {
        return res.status(404).json({ success: false, message: `المحفظة غير موجودة: ${req.params.id}` });
    }
    res.json({
        success:   true,
        message:   `محفظة: ${portfolio.nameAr}`,
        timestamp: new Date().toISOString(),
        data:      portfolio,
    });
});

// ══════════════════════════════════════════════════════════
// المشاريع الكبرى
// ══════════════════════════════════════════════════════════
router.get('/mega-projects', (req, res) => {
    const fund = getFund();
    const { status } = req.query;
    let projects = fund.megaProjects;
    if (status) {
        projects = projects.filter(p => p.status === status);
    }
    res.json({
        success:   true,
        message:   `المشاريع الكبرى لـ ${fund.nameAr}`,
        timestamp: new Date().toISOString(),
        count:     projects.length,
        data:      projects,
    });
});

router.get('/mega-projects/:id', (req, res) => {
    const fund = getFund();
    const project = fund.getMegaProjectById(req.params.id.toUpperCase());
    if (!project) {
        return res.status(404).json({ success: false, message: `المشروع غير موجود: ${req.params.id}` });
    }
    res.json({
        success:   true,
        message:   `مشروع: ${project.nameAr}`,
        timestamp: new Date().toISOString(),
        data:      project,
    });
});

// ══════════════════════════════════════════════════════════
// مؤشرات الأداء
// ══════════════════════════════════════════════════════════
router.get('/kpis', (req, res) => {
    const fund = getFund();
    const totalTarget = fund.kpis.reduce((s, k) => {
        if (k.unit === 'مليار ريال') return s + k.target;
        return s;
    }, 0);
    res.json({
        success:   true,
        message:   `مؤشرات أداء ${fund.nameAr}`,
        timestamp: new Date().toISOString(),
        count:     fund.kpis.length,
        totalAUMTarget: `${totalTarget.toLocaleString()} مليار ريال`,
        data:      fund.kpis,
    });
});

// ══════════════════════════════════════════════════════════
// الشراكات الاستراتيجية
// ══════════════════════════════════════════════════════════
router.get('/partnerships', (req, res) => {
    const fund = getFund();
    const { scope } = req.query; // local | regional | global
    const data = scope ? (fund.partnerships[scope] || []) : fund.partnerships;
    res.json({
        success:   true,
        message:   `الشراكات الاستراتيجية لـ ${fund.nameAr}`,
        timestamp: new Date().toISOString(),
        data,
    });
});

// ══════════════════════════════════════════════════════════
// الهيئة الشرعية
// ══════════════════════════════════════════════════════════
router.get('/sharia', (req, res) => {
    const fund = getFund();
    res.json({
        success:   true,
        message:   `الهيئة الشرعية لـ ${fund.nameAr}`,
        timestamp: new Date().toISOString(),
        data:      fund.shariaBoard,
    });
});

// ══════════════════════════════════════════════════════════
// دور منصة شيخة
// ══════════════════════════════════════════════════════════
router.get('/sheikha-role', (req, res) => {
    const fund = getFund();
    res.json({
        success:   true,
        message:   `دور منصة شيخة في ${fund.nameAr}`,
        timestamp: new Date().toISOString(),
        data:      fund.sheikhaRole,
    });
});

// ══════════════════════════════════════════════════════════
// التقرير الشامل الكامل
// ══════════════════════════════════════════════════════════
router.get('/report', (req, res) => {
    const fund = getFund();
    res.json({
        success:   true,
        message:   `التقرير الشامل — ${fund.nameAr}`,
        timestamp: new Date().toISOString(),
        data:      fund.getFullReport(),
    });
});

module.exports = router;
