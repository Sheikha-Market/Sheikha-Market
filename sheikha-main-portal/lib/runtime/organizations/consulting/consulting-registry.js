/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏛️ SHEIKHA International Consulting Organization — Registry
 *  منظمة شيخة للاستشارات الدولية — سجل المنظمة الرسمي
 *
 *  النموذج التشغيلي: Consulting + Runtime + Intelligence + Operations
 *  ﴿ وَشَاوِرْهُمْ فِي الْأَمْرِ ﴾ — آل عمران: 159
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── هوية المنظمة ─────────────────────────────────────────────────────────────
const CONSULTING_ORG = {
    id:          'sheikha-international-consulting-org',
    nameAr:      'منظمة شيخة للاستشارات الدولية',
    nameEn:      'SHEIKHA International Consulting Organization',
    abbreviation: 'SICO',
    version:     '1.0.0',
    activatedAt: '2026-05-14T00:00:00.000Z',
    status:      'active',
    type:        'specialized',
    sector:      'consulting',
    parentOrgId: 'sheikha-root-system',
    mission:     'تحويل شيخة من منصة تشغيل إلى جهة استشارية تشغيلية تنفيذية عالمية — تحليل، تشغيل، حوكمة، تحسين، تكامل، رقمنة',
    vision:      'أن تكون SICO المرجع العالمي في الاستشارات المؤسسية التشغيلية لأسواق المعادن، سلاسل الإمداد، الصناعة، والتحول الرقمي',
    shariaCharter: {
        acceptsKitabAndSunnah: true,
        noRiba:     true,
        noGharar:   true,
        noGhish:    true,
        noIhtikar:  true,
        noDarar:    true,
        charterVersion: '1.0.0',
        reference: '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ﴾ — المائدة: 2'
    }
};

// ─── الأقسام المؤسسية ─────────────────────────────────────────────────────────
const DIVISIONS = {
    EXECUTIVE_COUNCIL:        { id: 'executive-council',         nameAr: 'المجلس التنفيذي',                   nameEn: 'Executive Council' },
    GLOBAL_STRATEGY:          { id: 'global-strategy',           nameAr: 'قسم الاستراتيجية العالمية',          nameEn: 'Global Strategy Division' },
    SUPPLY_CHAIN_ADVISORY:    { id: 'supply-chain-advisory',     nameAr: 'قسم استشارات سلاسل الإمداد',        nameEn: 'Supply Chain Advisory Division' },
    SMART_MARKETS:            { id: 'smart-markets',             nameAr: 'قسم الأسواق الذكية',                nameEn: 'Smart Markets Division' },
    SMART_CITIES:             { id: 'smart-cities',              nameAr: 'قسم المدن الذكية',                  nameEn: 'Smart Cities Division' },
    AI_DIGITAL_TRANSFORMATION:{ id: 'ai-digital-transformation', nameAr: 'قسم الذكاء الصناعي والتحول الرقمي', nameEn: 'AI & Digital Transformation Division' },
    SUSTAINABILITY_RECYCLING: { id: 'sustainability-recycling',  nameAr: 'قسم الاستدامة وإعادة التدوير',      nameEn: 'Sustainability & Recycling Division' },
    INDUSTRIAL_OPERATIONS:    { id: 'industrial-operations',     nameAr: 'قسم العمليات الصناعية',             nameEn: 'Industrial Operations Division' },
    GOVERNMENT_RELATIONS:     { id: 'government-relations',      nameAr: 'قسم العلاقات الحكومية',             nameEn: 'Government Relations Division' },
    ECONOMIC_INTELLIGENCE:    { id: 'economic-intelligence',     nameAr: 'قسم الاستخبارات الاقتصادية',        nameEn: 'Economic Intelligence Division' },
    STANDARDS_GOVERNANCE:     { id: 'standards-governance',      nameAr: 'قسم المعايير والحوكمة',             nameEn: 'Standards & Governance Division' },
    KNOWLEDGE_TRAINING:       { id: 'knowledge-training',        nameAr: 'قسم المعرفة والتدريب',              nameEn: 'Knowledge & Training Division' },
};

// ─── خدمات الاستشارات ─────────────────────────────────────────────────────────
const CONSULTING_SERVICES = [
    { id: 'gov-consulting',       nameAr: 'استشارات حكومية',           nameEn: 'Government Consulting',        divisionId: 'government-relations',      tier: 'premium' },
    { id: 'industrial-consulting',nameAr: 'استشارات صناعية',           nameEn: 'Industrial Consulting',        divisionId: 'industrial-operations',     tier: 'standard' },
    { id: 'supply-chain-consulting',nameAr:'استشارات سلاسل الإمداد',   nameEn: 'Supply Chain Consulting',      divisionId: 'supply-chain-advisory',     tier: 'standard' },
    { id: 'logistics-consulting', nameAr: 'استشارات لوجستية',          nameEn: 'Logistics Consulting',         divisionId: 'supply-chain-advisory',     tier: 'standard' },
    { id: 'economic-consulting',  nameAr: 'استشارات اقتصادية',         nameEn: 'Economic Consulting',          divisionId: 'economic-intelligence',     tier: 'premium' },
    { id: 'recycling-consulting', nameAr: 'استشارات التدوير والاستدامة',nameEn: 'Recycling & Sustainability',  divisionId: 'sustainability-recycling',  tier: 'standard' },
    { id: 'smart-cities-consulting',nameAr:'استشارات المدن الذكية',    nameEn: 'Smart Cities Consulting',      divisionId: 'smart-cities',              tier: 'premium' },
    { id: 'digital-consulting',   nameAr: 'استشارات التحول الرقمي',    nameEn: 'Digital Transformation',       divisionId: 'ai-digital-transformation', tier: 'premium' },
    { id: 'ai-consulting',        nameAr: 'استشارات الذكاء الصناعي',   nameEn: 'AI Consulting',                divisionId: 'ai-digital-transformation', tier: 'premium' },
    { id: 'ops-consulting',       nameAr: 'استشارات تشغيلية',          nameEn: 'Operational Consulting',       divisionId: 'industrial-operations',     tier: 'standard' },
    { id: 'institutional-consulting',nameAr:'استشارات مؤسسية',         nameEn: 'Institutional Consulting',     divisionId: 'executive-council',         tier: 'premium' },
    { id: 'risk-governance',      nameAr: 'استشارات المخاطر والحوكمة', nameEn: 'Risk & Governance Consulting', divisionId: 'standards-governance',      tier: 'premium' },
];

// ─── المنظمات المرتبطة ────────────────────────────────────────────────────────
const LINKED_ORGANIZATIONS = [
    'org-markets',
    'org-supply-chain',
    'org-digital-transformation',
    'org-smart-cities',
    'org-operations',
    'org-governance',
    'org-ai',
    'org-economy-investment',
    'org-sustainability-recycling',
];

// ─── سوق الاستشارات الدولية ───────────────────────────────────────────────────
const CONSULTING_MARKET = {
    id:          'sheikha-international-consulting-market',
    nameAr:      'سوق الاستشارات الدولية',
    nameEn:      'International Consulting Market',
    marketType:  'electronic',
    sector:      'services',
    orgId:       CONSULTING_ORG.id,
    status:      'active',
    description: 'المنصة التشغيلية لعرض وطلب الاستشارات الدولية المتخصصة — استشارات حكومية، صناعية، لوجستية، اقتصادية، تدوير، مدن ذكية، تحول رقمي، ذكاء صناعي',
    services:    CONSULTING_SERVICES.map(s => s.id),
    activatedAt: '2026-05-14T00:00:00.000Z',
};

// ─── الارتباطات مع سوق المعادن والسكراب ──────────────────────────────────────
const METALS_MARKET_INTEGRATION = {
    enabled: true,
    analyticalRole: 'العقل التحليلي لسوق المعادن والسكراب',
    flows: [
        {
            entity: 'supplier',
            nameAr: 'المورد',
            analyses: ['تحليل جودة', 'تقييم سلسلة التوريد', 'تحليل المخاطر'],
        },
        {
            entity: 'transport',
            nameAr: 'النقل',
            analyses: ['تحسين المسارات', 'قياس التكلفة', 'قياس الانبعاثات'],
        },
        {
            entity: 'smelter',
            nameAr: 'المصهر',
            analyses: ['تحليل الطاقة', 'كفاءة الإنتاج', 'التدوير'],
        },
        {
            entity: 'manufacturing',
            nameAr: 'المصانع التحويلية',
            analyses: ['تتبع المواد', 'تحليل الهدر', 'تحسين الجودة'],
        },
    ],
};

// ─── محرك HS Intelligence ─────────────────────────────────────────────────────
const HS_INTELLIGENCE_ENGINE = {
    id:      'sheikha-global-hs-intelligence-engine',
    nameAr:  'محرك شيخة العالمي للاستخبارات الجمركية',
    nameEn:  'SHEIKHA Global HS Intelligence Engine',
    status:  'active',
    capabilities: [
        'تصنيف المنتجات عالميًا',
        'ربط الأسواق بالبند الجمركي',
        'ربط المعادن الخام',
        'ربط المعادن المعاد تدويرها',
        'ربط المنتجات النهائية',
        'ربط الدول والموانئ',
        'تحليل التدفقات التجارية',
    ],
};

// ─── واجهة برمجية ─────────────────────────────────────────────────────────────
function getOrgProfile() {
    return {
        ...CONSULTING_ORG,
        divisions: Object.values(DIVISIONS),
        services:  CONSULTING_SERVICES,
        market:    CONSULTING_MARKET,
        linkedOrganizations: LINKED_ORGANIZATIONS,
        metalsMarketIntegration: METALS_MARKET_INTEGRATION,
        hsIntelligenceEngine:    HS_INTELLIGENCE_ENGINE,
        stats: {
            divisionsCount:  Object.keys(DIVISIONS).length,
            servicesCount:   CONSULTING_SERVICES.length,
            linkedOrgsCount: LINKED_ORGANIZATIONS.length,
        },
    };
}

function getServicesByDivision(divisionId) {
    return CONSULTING_SERVICES.filter(s => s.divisionId === divisionId);
}

function getServiceById(serviceId) {
    return CONSULTING_SERVICES.find(s => s.id === serviceId) || null;
}

function getDivisionById(divisionId) {
    return Object.values(DIVISIONS).find(d => d.id === divisionId) || null;
}

module.exports = {
    CONSULTING_ORG,
    DIVISIONS,
    CONSULTING_SERVICES,
    LINKED_ORGANIZATIONS,
    CONSULTING_MARKET,
    METALS_MARKET_INTEGRATION,
    HS_INTELLIGENCE_ENGINE,
    getOrgProfile,
    getServicesByDivision,
    getServiceById,
    getDivisionById,
};
