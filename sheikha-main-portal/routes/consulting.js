/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🌐 SHEIKHA International Consulting Organization — API Routes
 *  منظمة شيخة للاستشارات الدولية — مسارات API
 *
 *  GET  /api/consulting/status             — حالة المنظمة والمنظومة
 *  GET  /api/consulting/profile            — الملف المؤسسي الكامل
 *  GET  /api/consulting/divisions          — الأقسام المؤسسية
 *  GET  /api/consulting/services           — خدمات الاستشارات
 *  GET  /api/consulting/markets            — سوق الاستشارات الدولية
 *  GET  /api/consulting/governance         — نظام الحوكمة
 *  GET  /api/consulting/kpi                — مؤشرات الأداء
 *  GET  /api/consulting/kpi/dashboard      — لوحة تحكم KPI
 *  POST /api/consulting/kpi/update         — تحديث مؤشر أداء
 *  GET  /api/consulting/hs-codes           — محرك HS Intelligence
 *  GET  /api/consulting/supply-chain       — استشارات سلاسل الإمداد
 *  GET  /api/consulting/recycling          — استشارات التدوير والاستدامة
 *  GET  /api/consulting/economic-analysis  — التحليل الاقتصادي
 *  GET  /api/consulting/knowledge          — قاعدة المعرفة
 *  GET  /api/consulting/methodologies      — المنهجيات
 *  GET  /api/consulting/playbooks          — Playbooks التشغيلية
 *  POST /api/consulting/projects           — تسجيل مشروع استشاري جديد
 *  GET  /api/consulting/projects           — قائمة المشاريع
 *
 *  ﴿ وَشَاوِرْهُمْ فِي الْأَمْرِ ﴾ — آل عمران: 159
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { v4: uuid } = require('uuid');

const registry    = require('../lib/runtime/organizations/consulting/consulting-registry');
const governance  = require('../lib/runtime/organizations/consulting/consulting-governance');
const kpi         = require('../lib/runtime/organizations/consulting/consulting-kpi');
const knowledge   = require('../lib/runtime/organizations/consulting/consulting-knowledge-base');

// مخزن المشاريع في الذاكرة (يُستبدل بقاعدة بيانات عند الإنتاج)
const _projects = [];

// ─── حالة المنظمة ─────────────────────────────────────────────────────────────
router.get('/status', (req, res) => {
    const govSummary  = governance.getGovernanceSummary();
    const kpiSummary  = kpi.getDashboardSummary();
    const knwSummary  = knowledge.getKnowledgeSummary();

    res.json({
        success:    true,
        bismillah:  'بسم الله الرحمن الرحيم',
        org:        registry.CONSULTING_ORG.nameAr,
        orgEn:      registry.CONSULTING_ORG.nameEn,
        abbreviation: registry.CONSULTING_ORG.abbreviation,
        status:     registry.CONSULTING_ORG.status,
        version:    registry.CONSULTING_ORG.version,
        activatedAt: registry.CONSULTING_ORG.activatedAt,
        operationalModel: 'Consulting + Runtime + Intelligence + Operations',
        quran:       '﴿ وَشَاوِرْهُمْ فِي الْأَمْرِ ﴾ — آل عمران: 159',
        stats: {
            divisions:          govSummary.layers,
            services:           registry.CONSULTING_SERVICES.length,
            linkedOrganizations: registry.LINKED_ORGANIZATIONS.length,
            activeProjects:     _projects.filter(p => p.status === 'active').length,
            kpiOverallScore:    kpiSummary.overallScore,
            methodologies:      knwSummary.totalMethodologies,
            playbooks:          knwSummary.totalPlaybooks,
            knowledgeDomains:   knwSummary.totalDomains,
        },
        endpoints: {
            profile:          '/api/consulting/profile',
            divisions:        '/api/consulting/divisions',
            services:         '/api/consulting/services',
            market:           '/api/consulting/markets',
            governance:       '/api/consulting/governance',
            kpiDashboard:     '/api/consulting/kpi/dashboard',
            hsIntelligence:   '/api/consulting/hs-codes',
            supplyChain:      '/api/consulting/supply-chain',
            recycling:        '/api/consulting/recycling',
            economicAnalysis: '/api/consulting/economic-analysis',
            knowledge:        '/api/consulting/knowledge',
            methodologies:    '/api/consulting/methodologies',
            playbooks:        '/api/consulting/playbooks',
            projects:         '/api/consulting/projects',
        },
    });
});

// ─── الملف المؤسسي الكامل ──────────────────────────────────────────────────────
router.get('/profile', (req, res) => {
    res.json({
        success: true,
        profile: registry.getOrgProfile(),
    });
});

// ─── الأقسام المؤسسية ──────────────────────────────────────────────────────────
router.get('/divisions', (req, res) => {
    const divisions = Object.values(registry.DIVISIONS).map(d => ({
        ...d,
        services: registry.getServicesByDivision(d.id),
    }));

    res.json({
        success:  true,
        count:    divisions.length,
        divisions,
    });
});

// ─── خدمات الاستشارات ──────────────────────────────────────────────────────────
router.get('/services', (req, res) => {
    const { divisionId, tier } = req.query;
    let services = registry.CONSULTING_SERVICES;

    if (divisionId) services = services.filter(s => s.divisionId === divisionId);
    if (tier)       services = services.filter(s => s.tier === tier);

    res.json({
        success: true,
        count:   services.length,
        services,
    });
});

// ─── سوق الاستشارات الدولية ────────────────────────────────────────────────────
router.get('/markets', (req, res) => {
    res.json({
        success: true,
        market:  registry.CONSULTING_MARKET,
        servicesCount: registry.CONSULTING_SERVICES.length,
        services:      registry.CONSULTING_SERVICES,
    });
});

// ─── نظام الحوكمة ──────────────────────────────────────────────────────────────
router.get('/governance', (req, res) => {
    res.json({
        success:       true,
        summary:       governance.getGovernanceSummary(),
        layers:        governance.GOVERNANCE_LAYERS,
        policies:      governance.OPERATIONAL_POLICIES,
        decisionFlow:  governance.DECISION_FLOW,
        authorityMatrix: governance.AUTHORITY_MATRIX,
    });
});

// ─── مؤشرات الأداء KPI ────────────────────────────────────────────────────────
router.get('/kpi', (req, res) => {
    const { category } = req.query;

    const kpis = category
        ? kpi.getKPIsByCategory(category)
        : kpi.getAllKPIs();

    res.json({
        success: true,
        count:   kpis.length,
        kpis,
    });
});

// ─── لوحة تحكم KPI ────────────────────────────────────────────────────────────
router.get('/kpi/dashboard', (req, res) => {
    res.json({
        success:   true,
        dashboard: kpi.getDashboardSummary(),
    });
});

// ─── تحديث مؤشر أداء ─────────────────────────────────────────────────────────
router.post('/kpi/update', (req, res) => {
    const { kpiId, value } = req.body;

    if (!kpiId || value === undefined) {
        return res.status(400).json({
            success: false,
            message: 'kpiId و value مطلوبان',
        });
    }

    const result = kpi.updateKPI(kpiId, Number(value));

    if (!result.success) {
        return res.status(404).json({ success: false, message: result.message });
    }

    res.json({ success: true, ...result });
});

// ─── محرك HS Intelligence ─────────────────────────────────────────────────────
router.get('/hs-codes', (req, res) => {
    const { query: searchQuery } = req.query;

    // بنود HS Code الأساسية للمعادن والسكراب
    const HS_CODES_METALS = [
        { code: '7204',     nameAr: 'سكراب الحديد والصلب',           metal: 'iron-steel',   recycled: true  },
        { code: '7204.10',  nameAr: 'سكراب الحديد الزهر',            metal: 'cast-iron',    recycled: true  },
        { code: '7204.21',  nameAr: 'سكراب الفولاذ المقاوم للصدأ',   metal: 'stainless',    recycled: true  },
        { code: '7204.30',  nameAr: 'سكراب الحديد المطليّ',          metal: 'tinned-iron',  recycled: true  },
        { code: '7204.41',  nameAr: 'سكراب القطع والنشارة',          metal: 'cuttings',     recycled: true  },
        { code: '7204.49',  nameAr: 'سكراب الحديد والصلب (أخرى)',   metal: 'other-steel',  recycled: true  },
        { code: '7404',     nameAr: 'سكراب النحاس',                  metal: 'copper',       recycled: true  },
        { code: '7503',     nameAr: 'سكراب النيكل',                  metal: 'nickel',       recycled: true  },
        { code: '7602',     nameAr: 'سكراب الألومنيوم',              metal: 'aluminium',    recycled: true  },
        { code: '7802',     nameAr: 'سكراب الرصاص',                  metal: 'lead',         recycled: true  },
        { code: '7902',     nameAr: 'سكراب الزنك',                   metal: 'zinc',         recycled: true  },
        { code: '8002',     nameAr: 'سكراب القصدير',                 metal: 'tin',          recycled: true  },
        { code: '7201',     nameAr: 'حديد الصهارة الخام (pig iron)',  metal: 'pig-iron',     recycled: false },
        { code: '7207',     nameAr: 'شبه منتجات من الحديد',          metal: 'iron-semi',    recycled: false },
        { code: '7225',     nameAr: 'مسطحات الفولاذ السبيكي',        metal: 'alloy-steel',  recycled: false },
    ];

    let results = HS_CODES_METALS;
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        results = HS_CODES_METALS.filter(c =>
            c.code.includes(q) ||
            c.nameAr.includes(q) ||
            c.metal.includes(q)
        );
    }

    res.json({
        success:       true,
        engine:        registry.HS_INTELLIGENCE_ENGINE.nameAr,
        capabilities:  registry.HS_INTELLIGENCE_ENGINE.capabilities,
        count:         results.length,
        hsCodes:       results,
        integration: {
            marketsLinked: true,
            tradeFlowAnalysis: true,
            customsConnection: true,
        },
    });
});

// ─── استشارات سلاسل الإمداد ───────────────────────────────────────────────────
router.get('/supply-chain', (req, res) => {
    const methodologies = knowledge.getMethodologiesByDomain('supply-chain');
    const playbooks     = knowledge.getPlaybooksByDomain('supply-chain');
    const services      = registry.getServicesByDivision('supply-chain-advisory');

    res.json({
        success:         true,
        division:        registry.getDivisionById('supply-chain-advisory'),
        services,
        methodologies,
        playbooks,
        metalsIntegration: registry.METALS_MARKET_INTEGRATION,
        kpis: kpi.getKPIsByCategory('operational'),
    });
});

// ─── استشارات التدوير والاستدامة ──────────────────────────────────────────────
router.get('/recycling', (req, res) => {
    const methodologies = knowledge.getMethodologiesByDomain('sustainability-recycling');
    const playbooks     = knowledge.getPlaybooksByDomain('metals-market');
    const services      = registry.getServicesByDivision('sustainability-recycling');

    res.json({
        success:      true,
        division:     registry.getDivisionById('sustainability-recycling'),
        services,
        methodologies,
        playbooks,
        recyclingFlows: registry.METALS_MARKET_INTEGRATION.flows.filter(
            f => f.entity === 'smelter' || f.entity === 'manufacturing'
        ),
    });
});

// ─── التحليل الاقتصادي ────────────────────────────────────────────────────────
router.get('/economic-analysis', (req, res) => {
    const services = registry.getServicesByDivision('economic-intelligence');

    res.json({
        success:  true,
        division: registry.getDivisionById('economic-intelligence'),
        services,
        analyticalCapabilities: [
            'تحليل أسعار المعادن العالمية',
            'تحليل التدفقات التجارية الدولية',
            'نمذجة العرض والطلب',
            'تحليل المخاطر الاقتصادية',
            'تحليل الأثر البيئي-الاقتصادي',
            'التنبؤ بالأسعار باستخدام الذكاء الصناعي',
            'تحليل المؤشرات الاقتصادية الكلية',
            'تقييم الجدوى الاستثمارية',
        ],
        linkedMarkets: [
            { id: 'metals',       nameAr: 'سوق المعادن' },
            { id: 'scrap',        nameAr: 'سوق السكراب' },
            { id: 'supply-chain', nameAr: 'سلاسل الإمداد' },
            { id: 'recycling',    nameAr: 'الاقتصاد الدائري والتدوير' },
        ],
    });
});

// ─── قاعدة المعرفة ────────────────────────────────────────────────────────────
router.get('/knowledge', (req, res) => {
    res.json({
        success:  true,
        summary:  knowledge.getKnowledgeSummary(),
    });
});

// ─── المنهجيات ────────────────────────────────────────────────────────────────
router.get('/methodologies', (req, res) => {
    const { domain } = req.query;

    const methodologies = domain
        ? knowledge.getMethodologiesByDomain(domain)
        : knowledge.METHODOLOGIES;

    res.json({
        success: true,
        count:   methodologies.length,
        methodologies,
    });
});

router.get('/methodologies/:id', (req, res) => {
    const method = knowledge.getMethodologyById(req.params.id);
    if (!method) {
        return res.status(404).json({ success: false, message: 'المنهجية غير موجودة' });
    }
    res.json({ success: true, methodology: method });
});

// ─── Playbooks التشغيلية ──────────────────────────────────────────────────────
router.get('/playbooks', (req, res) => {
    const { domain } = req.query;

    const playbooks = domain
        ? knowledge.getPlaybooksByDomain(domain)
        : knowledge.PLAYBOOKS;

    res.json({
        success: true,
        count:   playbooks.length,
        playbooks,
    });
});

router.get('/playbooks/:id', (req, res) => {
    const playbook = knowledge.getPlaybookById(req.params.id);
    if (!playbook) {
        return res.status(404).json({ success: false, message: 'الدليل غير موجود' });
    }
    res.json({ success: true, playbook });
});

// ─── تسجيل مشروع استشاري ─────────────────────────────────────────────────────
router.post('/projects', (req, res) => {
    const { clientName, serviceId, scopeSummary, divisionId, contactEmail, priority } = req.body;

    // التحقق من صحة الطلب عبر نظام الحوكمة
    const validation = governance.validateConsultingRequest({ clientName, serviceId, scopeSummary });
    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            message: 'الطلب غير مكتمل',
            issues:  validation.issues,
        });
    }

    // التحقق من صحة الخدمة
    const service = registry.getServiceById(serviceId);
    if (!service) {
        return res.status(400).json({
            success: false,
            message: `خدمة الاستشارة غير موجودة: ${serviceId}`,
            availableServices: registry.CONSULTING_SERVICES.map(s => s.id),
        });
    }

    const project = {
        id:           uuid(),
        clientName,
        serviceId,
        service:      service.nameAr,
        divisionId:   divisionId || service.divisionId,
        scopeSummary,
        contactEmail: contactEmail || null,
        priority:     priority || 'normal',
        status:       'pending',
        shariaCheck:  validation.shariaCheck,
        createdAt:    new Date().toISOString(),
        updatedAt:    new Date().toISOString(),
        nextStep:     governance.DECISION_FLOW[0],
    };

    _projects.push(project);

    res.status(201).json({
        success:  true,
        message:  'تم تسجيل المشروع الاستشاري — في انتظار مراجعة المدير المختص',
        project,
        quran:    '﴿ وَشَاوِرْهُمْ فِي الْأَمْرِ ﴾ — آل عمران: 159',
    });
});

// ─── قائمة المشاريع ───────────────────────────────────────────────────────────
router.get('/projects', (req, res) => {
    const { status, divisionId, serviceId } = req.query;
    let projects = [..._projects];

    if (status)     projects = projects.filter(p => p.status === status);
    if (divisionId) projects = projects.filter(p => p.divisionId === divisionId);
    if (serviceId)  projects = projects.filter(p => p.serviceId === serviceId);

    res.json({
        success: true,
        count:   projects.length,
        projects,
    });
});

// ─── تفاصيل مشروع ─────────────────────────────────────────────────────────────
router.get('/projects/:id', (req, res) => {
    const project = _projects.find(p => p.id === req.params.id);
    if (!project) {
        return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    }
    res.json({ success: true, project });
});

// ─── لوحة تحكم الاستشارات (Command Center) ───────────────────────────────────
router.get('/command-center', (req, res) => {
    const kpiDashboard = kpi.getDashboardSummary();
    const govSummary   = governance.getGovernanceSummary();
    const knwSummary   = knowledge.getKnowledgeSummary();

    res.json({
        success:     true,
        title:       'SHEIKHA CONSULTING COMMAND CENTER',
        titleAr:     'مركز تحكم شيخة للاستشارات',
        org:         registry.CONSULTING_ORG.nameAr,
        status:      registry.CONSULTING_ORG.status,
        sections: {
            kpi: {
                overallScore: kpiDashboard.overallScore,
                onTarget:     kpiDashboard.onTarget,
                belowTarget:  kpiDashboard.belowTarget,
                topKPIs:      kpiDashboard.kpis.filter(k => k.weight > 0.1),
            },
            projects: {
                total:   _projects.length,
                pending: _projects.filter(p => p.status === 'pending').length,
                active:  _projects.filter(p => p.status === 'active').length,
                closed:  _projects.filter(p => p.status === 'closed').length,
            },
            governance: {
                layers:       govSummary.layers,
                decisionSteps: govSummary.decisionSteps,
                shariaStatus: 'compliant',
            },
            knowledge: {
                methodologies: knwSummary.totalMethodologies,
                playbooks:     knwSummary.totalPlaybooks,
                domains:       knwSummary.totalDomains,
            },
            linkedOrgs:    registry.LINKED_ORGANIZATIONS.length,
            services:      registry.CONSULTING_SERVICES.length,
            divisions:     Object.keys(registry.DIVISIONS).length,
            hsIntelligence: registry.HS_INTELLIGENCE_ENGINE.nameAr,
        },
        generatedAt: new Date().toISOString(),
    });
});

module.exports = router;
