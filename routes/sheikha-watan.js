// بسم الله الرحمن الرحيم
/**
 * routes/sheikha-watan.js
 * شيخة وطن طموح — الركيزة الثالثة من رؤية ٢٠٣٠
 * "وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ" — الحشر:١٨
 *
 * يشمل: الحوكمة الشاملة · الجهات السعودية · التشريعات · الشركات الوطنية ·
 *        رؤية ٢٠٣٠ · الرؤى الخليجية والعربية · القيادة الرشيدة
 */

'use strict';

const express = require('express');
const router = express.Router();
const SheikhaGovEngine = require('../lib/sheikha-gov-engine');
const SheikhaLeadershipGovernance = require('../lib/sheikha-leadership-governance');

let _gov = null;
let _leadership = null;

function getGov() {
    if (!_gov) _gov = new SheikhaGovEngine();
    return _gov;
}

function getLeadership() {
    if (!_leadership) _leadership = new SheikhaLeadershipGovernance();
    return _leadership;
}

// ═══════════════════════════════════════════════════════════════
// الصحة العامة
// ═══════════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
    const gov = getGov();
    res.json({
        success: true,
        message: 'شيخة وطن طموح — مفعّل ونابض',
        timestamp: new Date().toISOString(),
        data: {
            pillar: 'وطن طموح — An Ambitious Nation',
            vision: 'رؤية المملكة ٢٠٣٠',
            govEntities: gov.saudiEntities.length,
            countries: gov.countries.length,
            govCompanies: gov.govCompanies.length,
            regulations: gov.saudiRegulations.length
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// لوحة وطن طموح الشاملة
// ═══════════════════════════════════════════════════════════════
router.get('/dashboard', (req, res) => {
    const gov = getGov();
    const leadership = getLeadership();

    res.json({
        success: true,
        message: 'وطن طموح — لوحة شيخة الشاملة',
        timestamp: new Date().toISOString(),
        data: {
            pillar: {
                id: 'P3',
                nameAr: 'وطن طموح',
                nameEn: 'An Ambitious Nation',
                vision: 'رؤية المملكة ٢٠٣٠',
                headline: 'مجتمع حيوي، اقتصاد مزدهر، وطن طموح',
                maqsad: 'ARD — حفظ الأرض والوطن',
                quranic_ref: { ref: 'الحشر:١٨', text: 'وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ' }
            },
            governance: gov.getFullDashboard(),
            leadership: {
                foundation: leadership.getIslamicFoundation(),
                structure: leadership.getOrganizationalStructure()
            }
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// الجهات الحكومية السعودية
// ═══════════════════════════════════════════════════════════════
router.get('/saudi', (req, res) => {
    const gov = getGov();
    res.json({
        success: true,
        message: 'الجهات والأنظمة والشركات الحكومية السعودية',
        timestamp: new Date().toISOString(),
        data: gov.getSaudiDashboard()
    });
});

router.get('/saudi/entities', (req, res) => {
    const gov = getGov();
    const { type, sector, status } = req.query;
    let entities = gov.saudiEntities;
    if (type) entities = entities.filter(e => e.type === type);
    if (sector) entities = entities.filter(e => e.sector === sector);
    if (status) entities = entities.filter(e => e.status === status);
    res.json({
        success: true,
        message: 'الجهات الحكومية السعودية',
        timestamp: new Date().toISOString(),
        total: entities.length,
        data: entities
    });
});

router.get('/saudi/regulations', (req, res) => {
    const gov = getGov();
    res.json({
        success: true,
        message: 'الأنظمة والتشريعات السعودية',
        timestamp: new Date().toISOString(),
        total: gov.saudiRegulations.length,
        data: gov.saudiRegulations
    });
});

router.get('/saudi/companies', (req, res) => {
    const gov = getGov();
    res.json({
        success: true,
        message: 'الشركات والصناديق الحكومية السعودية',
        timestamp: new Date().toISOString(),
        data: gov.getGovCompaniesDashboard()
    });
});

// ═══════════════════════════════════════════════════════════════
// رؤية ٢٠٣٠ — أهداف الوطن الطموح
// ═══════════════════════════════════════════════════════════════
router.get('/vision2030', (req, res) => {
    const gov = getGov();
    const saudi = gov.getSaudiDashboard();
    res.json({
        success: true,
        message: 'رؤية المملكة ٢٠٣٠ — وطن طموح',
        timestamp: new Date().toISOString(),
        data: {
            vision2030: saudi.vision2030,
            goals: [
                { id: 'SA-G07', nameAr: 'الوصول لأفضل ٥ حكومات رقمية في العالم', kpi: 'E_GOV_RANK', target: 5, maqsad: 'ARD' },
                { id: 'SA-G09', nameAr: 'الوصول إلى صافي انبعاثات صفري بحلول ٢٠٦٠', kpi: 'CARBON_NET_ZERO', target: 2060, maqsad: 'ARD' },
                { id: 'SA-G10', nameAr: 'نيوم — بناء مدينة المستقبل', kpi: 'NEOM_PROGRESS', target: 2030, maqsad: 'ARD' },
                { id: 'SA-G08', nameAr: 'بناء ١ مليون وحدة سكنية', kpi: 'HOME_OWNERSHIP', target: 70, unit: '%', maqsad: 'NAFS' }
            ],
            sheikhaContribution: saudi.vision2030.sheikhaContribution,
            integrationRate: saudi.summary.integrationRate,
            complianceRate: saudi.summary.complianceRate
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// الدول والعلاقات الدولية
// ═══════════════════════════════════════════════════════════════
router.get('/international', (req, res) => {
    const gov = getGov();
    res.json({
        success: true,
        message: 'العلاقات الدولية وشبكة الدول',
        timestamp: new Date().toISOString(),
        data: gov.getInternationalDashboard()
    });
});

router.get('/international/:region', (req, res) => {
    const gov = getGov();
    const { region } = req.params;
    const countries = gov.countries.filter(c => c.region === region);
    if (!countries.length) {
        return res.status(404).json({
            success: false,
            message: `لا توجد دول في المنطقة: ${region}`,
            availableRegions: ['gcc', 'arab', 'international'],
            timestamp: new Date().toISOString()
        });
    }
    res.json({
        success: true,
        message: `دول منطقة: ${region}`,
        timestamp: new Date().toISOString(),
        total: countries.length,
        data: countries
    });
});

// ═══════════════════════════════════════════════════════════════
// القيادة والحوكمة الرشيدة
// ═══════════════════════════════════════════════════════════════
router.get('/leadership', (req, res) => {
    const leadership = getLeadership();
    res.json({
        success: true,
        message: 'القيادة الرشيدة والحوكمة الإسلامية',
        timestamp: new Date().toISOString(),
        data: {
            foundation: leadership.getIslamicFoundation(),
            structure: leadership.getOrganizationalStructure(),
            dashboard: leadership.getDashboard()
        }
    });
});

router.get('/leadership/foundation', (req, res) => {
    const leadership = getLeadership();
    res.json({
        success: true,
        message: 'الأساس الشرعي للقيادة والحوكمة',
        timestamp: new Date().toISOString(),
        data: leadership.getIslamicFoundation()
    });
});

router.get('/leadership/structure', (req, res) => {
    const leadership = getLeadership();
    res.json({
        success: true,
        message: 'الهيكل التنظيمي لمنظومة شيخة',
        timestamp: new Date().toISOString(),
        data: leadership.getOrganizationalStructure()
    });
});

// ═══════════════════════════════════════════════════════════════
// تسجيل جهة حكومية جديدة
// ═══════════════════════════════════════════════════════════════
router.post('/register', (req, res) => {
    const gov = getGov();
    const { nameAr, nameEn, type, sector, country } = req.body || {};
    if (!nameAr || !type) {
        return res.status(400).json({
            success: false,
            message: 'الاسم بالعربية ونوع الجهة مطلوبان',
            timestamp: new Date().toISOString()
        });
    }
    const result = gov.registerEntity({ nameAr, nameEn, type, sector, country: country || 'sa' });
    res.json({
        success: true,
        message: 'تم تسجيل الجهة — قيد المراجعة',
        timestamp: new Date().toISOString(),
        data: result
    });
});

module.exports = router;
