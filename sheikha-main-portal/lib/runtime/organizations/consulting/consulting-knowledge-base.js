/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📚 SHEIKHA International Consulting Organization — Knowledge Base
 *  منظمة شيخة للاستشارات الدولية — قاعدة المعرفة التشغيلية
 *
 *  "نظام يُنتج المعرفة ويشغّلها"
 *  ﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── المعايير والمنهجيات ──────────────────────────────────────────────────────
const METHODOLOGIES = [
    {
        id:      'scm-optimization',
        nameAr:  'منهجية تحسين سلاسل الإمداد',
        nameEn:  'Supply Chain Optimization Methodology',
        domain:  'supply-chain',
        phases:  ['التحليل والتشخيص', 'تحديد الفجوات', 'وضع الحلول', 'التنفيذ', 'القياس والمتابعة'],
        tools:   ['Value Stream Mapping', 'ABC Analysis', 'EOQ Model', 'Just-In-Time'],
        standard: 'ISO 28000',
    },
    {
        id:      'digital-transformation-roadmap',
        nameAr:  'منهجية خارطة التحول الرقمي',
        nameEn:  'Digital Transformation Roadmap',
        domain:  'digital-transformation',
        phases:  ['تقييم النضج الرقمي', 'تحديد الأولويات', 'بناء الخارطة', 'التنفيذ التدريجي', 'قياس الأثر'],
        tools:   ['Digital Maturity Model', 'KPI Framework', 'Change Management', 'Agile'],
        standard: 'ISO/IEC 38500',
    },
    {
        id:      'metals-market-analysis',
        nameAr:  'منهجية تحليل سوق المعادن',
        nameEn:  'Metals Market Analysis Methodology',
        domain:  'metals-market',
        phases:  ['جمع البيانات', 'تحليل HS Codes', 'تقييم الموردين', 'تحليل المخاطر', 'التوصيات'],
        tools:   ['HS Code Intelligence', 'Supplier Scorecard', 'Risk Matrix', 'Trade Flow Analysis'],
        standard: 'ISO 9001 + ISO 14001',
    },
    {
        id:      'recycling-consulting',
        nameAr:  'منهجية استشارات التدوير والاستدامة',
        nameEn:  'Recycling & Sustainability Consulting',
        domain:  'sustainability-recycling',
        phases:  ['مسح مواد السكراب', 'تحليل دورة الحياة', 'تصميم مسار التدوير', 'قياس الأثر البيئي', 'التقرير النهائي'],
        tools:   ['Life Cycle Assessment (LCA)', 'Material Flow Analysis', 'Carbon Footprint Calculator'],
        standard: 'ISO 14001 + GRI Standards',
    },
    {
        id:      'governance-framework',
        nameAr:  'منهجية بناء إطار الحوكمة',
        nameEn:  'Governance Framework Methodology',
        domain:  'standards-governance',
        phases:  ['تحليل الوضع الراهن', 'تصميم الإطار', 'بناء السياسات', 'التدريب والتطبيق', 'المراجعة الدورية'],
        tools:   ['COSO Framework', 'COBIT', 'Risk Heat Map', 'Policy Templates'],
        standard: 'ISO 37000',
    },
    {
        id:      'smart-city-consulting',
        nameAr:  'منهجية استشارات المدن الذكية',
        nameEn:  'Smart City Consulting Methodology',
        domain:  'smart-cities',
        phases:  ['تقييم البنية التحتية', 'تصميم معمارية المدينة الذكية', 'تحديد الحلول التقنية', 'التنفيذ التدريجي', 'قياس الأداء'],
        tools:   ['Smart City Index', 'IoT Architecture', 'Data Analytics Platform', 'Digital Twin'],
        standard: 'ISO 37120 + ITU-T Y.4000',
    },
];

// ─── قواعد المعرفة المتخصصة ───────────────────────────────────────────────────
const KNOWLEDGE_DOMAINS = [
    { id: 'metals-market',            nameAr: 'سوق المعادن والسكراب',     articles: 0, playbooks: 0 },
    { id: 'supply-chain',             nameAr: 'سلاسل الإمداد',            articles: 0, playbooks: 0 },
    { id: 'logistics',                nameAr: 'اللوجستيات',               articles: 0, playbooks: 0 },
    { id: 'recycling-sustainability', nameAr: 'التدوير والاستدامة',        articles: 0, playbooks: 0 },
    { id: 'digital-transformation',   nameAr: 'التحول الرقمي',            articles: 0, playbooks: 0 },
    { id: 'ai-applications',          nameAr: 'تطبيقات الذكاء الصناعي',   articles: 0, playbooks: 0 },
    { id: 'smart-cities',             nameAr: 'المدن الذكية',             articles: 0, playbooks: 0 },
    { id: 'governance-risk',          nameAr: 'الحوكمة وإدارة المخاطر',   articles: 0, playbooks: 0 },
    { id: 'economic-analysis',        nameAr: 'التحليل الاقتصادي',        articles: 0, playbooks: 0 },
    { id: 'industrial-operations',    nameAr: 'العمليات الصناعية',         articles: 0, playbooks: 0 },
    { id: 'hs-codes',                 nameAr: 'بنود HS Code والجمارك',    articles: 0, playbooks: 0 },
    { id: 'government-relations',     nameAr: 'العلاقات الحكومية',         articles: 0, playbooks: 0 },
];

// ─── Playbooks التشغيلية ──────────────────────────────────────────────────────
const PLAYBOOKS = [
    {
        id:       'supplier-onboarding-playbook',
        nameAr:   'دليل تأهيل الموردين',
        domain:   'metals-market',
        steps:    [
            'جمع وثائق الشركة والتراخيص',
            'تحليل جودة المنتجات والمواصفات',
            'تقييم قدرة التوريد والأسعار',
            'مراجعة سجل الموثوقية والالتزام بالتسليم',
            'المراجعة الشرعية للعقود والمدفوعات',
            'إدخال البيانات في النظام وإصدار كود المورد',
        ],
        estimatedDuration: '5-7 أيام عمل',
    },
    {
        id:       'scrap-classification-playbook',
        nameAr:   'دليل تصنيف السكراب',
        domain:   'metals-market',
        steps:    [
            'تحديد نوع المادة (حديد / نحاس / ألومنيوم / مختلط)',
            'قياس درجة النقاء والتلوث',
            'تحديد HS Code المناسب',
            'حساب القيمة التقديرية',
            'تحديد مسار التدوير المثلى',
            'إصدار شهادة التصنيف',
        ],
        estimatedDuration: '1-2 أيام عمل',
    },
    {
        id:       'digital-readiness-assessment',
        nameAr:   'دليل تقييم الجاهزية الرقمية',
        domain:   'digital-transformation',
        steps:    [
            'مقابلات مع الإدارة العليا والمستخدمين',
            'مراجعة الأنظمة والبنية التحتية الحالية',
            'تقييم المستوى الرقمي (1-5)',
            'تحديد الفجوات والفرص',
            'وضع خارطة طريق بأولويات زمنية',
            'تسليم تقرير التقييم والتوصيات',
        ],
        estimatedDuration: '10-15 يوم عمل',
    },
    {
        id:       'supply-chain-audit-playbook',
        nameAr:   'دليل مراجعة سلسلة الإمداد',
        domain:   'supply-chain',
        steps:    [
            'رسم خريطة سلسلة الإمداد الحالية',
            'تحليل نقاط الضعف والاختناقات',
            'تقييم الموردين والشركاء اللوجستيين',
            'قياس مؤشرات الأداء الحالية',
            'تحديد فرص التحسين والتوفير',
            'تقرير المراجعة مع خطة الإجراءات',
        ],
        estimatedDuration: '15-20 يوم عمل',
    },
];

// ─── معايير جودة التقارير ────────────────────────────────────────────────────
const REPORT_STANDARDS = {
    mandatorySections: [
        'الملخص التنفيذي',
        'المنهجية المستخدمة',
        'التحليل التفصيلي',
        'النتائج والمخرجات',
        'التوصيات',
        'خطة التنفيذ',
        'المؤشرات والقياسات',
        'المراجع والمصادر',
    ],
    language:          'العربية + الإنجليزية',
    reviewRequired:    true,
    shariaReview:      true,
    maxTurnaround:     '48 ساعة للمراجعة',
};

// ─── واجهات برمجية ────────────────────────────────────────────────────────────
function getMethodologyById(id) {
    return METHODOLOGIES.find(m => m.id === id) || null;
}

function getMethodologiesByDomain(domain) {
    return METHODOLOGIES.filter(m => m.domain === domain);
}

function getPlaybookById(id) {
    return PLAYBOOKS.find(p => p.id === id) || null;
}

function getPlaybooksByDomain(domain) {
    return PLAYBOOKS.filter(p => p.domain === domain);
}

function getKnowledgeSummary() {
    return {
        totalMethodologies:    METHODOLOGIES.length,
        totalPlaybooks:        PLAYBOOKS.length,
        totalDomains:          KNOWLEDGE_DOMAINS.length,
        domains:               KNOWLEDGE_DOMAINS,
        reportStandards:       REPORT_STANDARDS,
    };
}

module.exports = {
    METHODOLOGIES,
    KNOWLEDGE_DOMAINS,
    PLAYBOOKS,
    REPORT_STANDARDS,
    getMethodologyById,
    getMethodologiesByDomain,
    getPlaybookById,
    getPlaybooksByDomain,
    getKnowledgeSummary,
};
