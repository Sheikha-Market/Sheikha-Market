/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA AI CONSULTING TOOLS — الأدوات الرقمية والذكاء الاصطناعي            ║
 * ║  دمج الاستشارات بالتقنية — كل أداة رقمية في خدمة الاستشارة الإسلامية       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ" — الأنفال:٦٠
 * "من سلك طريقاً يلتمس فيه علماً سهّل الله له طريقاً إلى الجنة" — مسلم:٢٦٩٩
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// ① الأدوات الرقمية الأساسية لشيخة
// ═══════════════════════════════════════════════════════════════
const CORE_DIGITAL_TOOLS = [
    {
        id: 'SHEIKHA-AI-CORE',
        nameAr: 'محرك الذكاء الاصطناعي الإسلامي الأساسي',
        nameEn: 'Sheikha Islamic AI Core Engine',
        type: 'AI',
        status: 'مفعّل',
        capabilities: [
            'فهم اللغة العربية الفصحى والمحلية',
            'استنباط الأحكام الشرعية بالإشارة للمصادر',
            'تحليل المعايير والمؤشرات الدولية',
            'توليد التقارير والاستشارات',
            'التحقق من التوافق الشرعي',
        ],
        integration: 'core/engines/sheikha-neural-router',
        maqsad: 'AQL',
    },
    {
        id: 'STANDARDS-ENGINE',
        nameAr: 'محرك المعايير والجودة',
        nameEn: 'Standards & Quality Engine',
        type: 'Knowledge',
        status: 'مفعّل',
        capabilities: ['٧٢+ معياراً دولياً', 'امتثال ISO/AAOIFI/SASO', 'تحقق شرعي'],
        integration: 'core/standards',
        maqsad: 'MAL',
    },
    {
        id: 'VISION-ADVISORY',
        nameAr: 'محرك الرؤى والاستشارات الدولية',
        nameEn: 'Vision & International Advisory Engine',
        type: 'Advisory',
        status: 'مفعّل',
        capabilities: ['٣٥+ رؤية وطنية', '٣١+ مؤشر دولي', 'خطط العمل', 'تطوير الرؤى'],
        integration: 'core/visions',
        maqsad: 'ARD',
    },
    {
        id: 'SHARIA-ENGINE',
        nameAr: 'محرك الشريعة والفقه',
        nameEn: 'Sharia & Fiqh Engine',
        type: 'Sharia',
        status: 'مفعّل',
        capabilities: ['فحص التوافق الشرعي', 'أحكام المعاملات', 'فلتر الربا والغرر'],
        integration: 'lib/sheikha-sharia-engine',
        maqsad: 'DEEN',
    },
    {
        id: 'LEGAL-ENGINE',
        nameAr: 'محرك القوانين والاتفاقيات',
        nameEn: 'Legal & Treaties Engine',
        type: 'Legal',
        status: 'مفعّل',
        capabilities: ['٣٠+ إطار قانوني', 'قوانين سعودية ودولية', 'اتفاقيات WTO/UN/FATF'],
        integration: 'core/standards/legal',
        maqsad: 'DEEN',
    },
    {
        id: 'IDENTITY-ENGINE',
        nameAr: 'محرك الهوية الرقمية',
        nameEn: 'Digital Identity Engine (DID)',
        type: 'Identity',
        status: 'مفعّل',
        capabilities: ['DID W3C', 'توقيع رقمي ECDSA P-256', 'تحقق الكيانات'],
        integration: 'lib/sheikha-id',
        maqsad: 'DEEN',
    },
    {
        id: 'MARKET-ENGINE',
        nameAr: 'محرك السوق الذكي',
        nameEn: 'Smart Market Engine',
        type: 'Market',
        status: 'مفعّل',
        capabilities: ['ربط موردين ومشترين', 'تسعير ذكي', 'توصيات المنتجات'],
        integration: 'lib/sheikha-smart-market-engine',
        maqsad: 'MAL',
    },
    {
        id: 'ZAKAT-ENGINE',
        nameAr: 'محرك الزكاة والبركة',
        nameEn: 'Zakat & Barakah Engine',
        type: 'Financial',
        status: 'مفعّل',
        capabilities: ['حساب الزكاة', 'توزيع الزكاة الرقمي', 'مؤشر أثر الزكاة'],
        integration: 'lib/sheikha-barakah-engine',
        maqsad: 'MAL',
    },
    {
        id: 'NEURAL-ROUTER',
        nameAr: 'الموجّه العصبي الموحّد',
        nameEn: 'Sheikha Neural Router',
        type: 'Infrastructure',
        status: 'مفعّل',
        capabilities: ['توجيه ذكي لكل الطلبات', 'فلتر شريعة', 'تتبع التدقيق'],
        integration: 'core/engines/sheikha-neural-router',
        maqsad: 'ARD',
    },
];

// ═══════════════════════════════════════════════════════════════
// ② أدوات الاستشارة المتخصصة
// ═══════════════════════════════════════════════════════════════
const SPECIALIZED_CONSULTING_TOOLS = [
    {
        id: 'TOOL-SWOT-AI',
        nameAr: 'أداة تحليل SWOT الذكية بالمقاصد الشرعية',
        nameEn: 'AI SWOT Analysis with Maqasid Sharia Mapping',
        category: 'تحليل استراتيجي',
        input: 'بيانات الكيان + قطاعه + مؤشراته',
        output: 'تحليل SWOT + فرص إسلامية + خارطة المقاصد',
        sharia_layer: true,
        maqsad: 'ARD',
        verse: { ref: 'الحشر:١٨', text: 'وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ' },
    },
    {
        id: 'TOOL-OKR-GENERATOR',
        nameAr: 'مولّد OKRs بالمؤشرات الدولية والشرعية',
        nameEn: 'OKR Generator with International & Sharia KPIs',
        category: 'تخطيط',
        input: 'الرؤية + الأهداف الاستراتيجية',
        output: 'OKRs مرتبطة بمؤشرات GCI/HDI/GII + المقاصد',
        sharia_layer: true,
        maqsad: 'MAL',
    },
    {
        id: 'TOOL-GAP-ANALYZER',
        nameAr: 'محلل الفجوة عن المركز الأول',
        nameEn: 'Gap Analyzer to First Place',
        category: 'تقييم',
        input: 'مؤشرات الكيان الحالية + المؤشرات الدولية',
        output: 'خريطة الفجوات + خطة المعالجة المسارعة',
        sharia_layer: false,
        maqsad: 'ARD',
    },
    {
        id: 'TOOL-COMPLIANCE-CHECKER',
        nameAr: 'مدقق الامتثال الشرعي والتنظيمي',
        nameEn: 'Sharia & Regulatory Compliance Checker',
        category: 'امتثال',
        input: 'عقد / منتج / عملية / سياسة',
        output: 'تقرير الامتثال + قائمة المخاطر + التوصيات',
        sharia_layer: true,
        maqsad: 'DEEN',
    },
    {
        id: 'TOOL-VISION-ENHANCER',
        nameAr: 'محسّن الرؤى الوطنية والمؤسسية',
        nameEn: 'Vision Enhancer — Better Than Current',
        category: 'رؤية',
        input: 'رؤية الكيان الحالية + أهدافه',
        output: 'رؤية محسّنة + أهداف أفضل + مرجع شرعي',
        sharia_layer: true,
        maqsad: 'ARD',
    },
    {
        id: 'TOOL-REPORT-AI',
        nameAr: 'مولّد التقارير الاستشارية التلقائي',
        nameEn: 'AI Consulting Report Generator',
        category: 'تقارير',
        input: 'بيانات التحليل + توصيات المستشار',
        output: 'تقرير PDF/Word بالعربية والإنجليزية',
        sharia_layer: true,
        formats: ['PDF', 'Word', 'PowerPoint', 'JSON/API'],
        maqsad: 'AQL',
    },
    {
        id: 'TOOL-IMPACT-TRACKER',
        nameAr: 'متتبع الأثر والنتائج',
        nameEn: 'Impact & Outcome Tracker',
        category: 'قياس',
        input: 'الاستشارة المنفّذة + مؤشرات الأداء',
        output: 'لوحة قيادة الأثر المباشر',
        sharia_layer: false,
        maqsad: 'ARD',
    },
    {
        id: 'TOOL-SCENARIO-PLANNER',
        nameAr: 'مخطط السيناريوهات الاستراتيجية',
        nameEn: 'Strategic Scenario Planner',
        category: 'تخطيط',
        input: 'السياق الاستراتيجي + المتغيرات',
        output: '٣ سيناريوهات: متفائل / واقعي / متشائم + خطة لكل سيناريو',
        sharia_layer: true,
        maqsad: 'ARD',
        verse: { ref: 'التغابن:١١', text: 'وَمَن يُؤْمِن بِاللَّهِ يَهْدِ قَلْبَهُ' },
    },
];

// ═══════════════════════════════════════════════════════════════
// ③ منصات التواصل والتفاعل الاستشاري
// ═══════════════════════════════════════════════════════════════
const COMMUNICATION_PLATFORMS = [
    {
        id: 'PLAT-CHATBOT',
        nameAr: 'بوت الاستشارات الفوري (٢٤/٧)',
        nameEn: 'Instant Advisory Chatbot (24/7)',
        channel: 'Web / Mobile App',
        languages: ['العربية', 'الإنجليزية', 'الأردية', 'الإندونيسية', 'الفرنسية'],
        ai_model: 'Sheikha AI Core',
        sharia_filtered: true,
        availability: '٢٤/٧/٣٦٥',
    },
    {
        id: 'PLAT-VIRTUAL',
        nameAr: 'الجلسات الاستشارية الافتراضية',
        nameEn: 'Virtual Advisory Sessions',
        channel: 'Video Conference',
        features: ['ترجمة فورية AI', 'تسجيل وتلخيص تلقائي', 'مشاركة الشاشة', 'لوحة بيضاء رقمية'],
        availability: 'بالتنسيق المسبق',
    },
    {
        id: 'PLAT-PORTAL',
        nameAr: 'بوابة العملاء الاستشارية',
        nameEn: 'Client Advisory Portal',
        channel: 'Web Portal',
        features: ['متابعة المشاريع', 'مستودع الوثائق', 'لوحة المؤشرات', 'تتبع الأثر'],
        security: 'ISO 27001 + NCA-ECC',
    },
    {
        id: 'PLAT-API',
        nameAr: 'واجهة برمجة التطبيقات (API)',
        nameEn: 'Consulting API',
        channel: 'REST API / GraphQL',
        features: ['تكامل مباشر مع أنظمة العميل', 'استشارات مبرمجة تلقائية', 'بيانات المؤشرات المباشرة'],
        auth: 'DID + JWT',
        standard: 'sheikha/v2',
    },
    {
        id: 'PLAT-MOBILE',
        nameAr: 'تطبيق شيخة للاستشارات',
        nameEn: 'Sheikha Consulting App',
        channel: 'iOS + Android',
        features: ['استشارات فورية', 'تتبع المؤشرات', 'إشعارات ذكية', 'تقارير مباشرة'],
    },
    {
        id: 'PLAT-EMAIL-AI',
        nameAr: 'البريد الاستشاري الذكي',
        nameEn: 'AI Advisory Email',
        channel: 'Email',
        features: ['ردود AI سريعة', 'توجيه للمتخصص المناسب', 'أرشفة وتصنيف تلقائي'],
    },
];

// ═══════════════════════════════════════════════════════════════
// ④ بروتوكول الاستشارة الرقمية الكاملة
// ═══════════════════════════════════════════════════════════════
const DIGITAL_CONSULTING_PROTOCOL = {
    name: 'بروتوكول شيخة للاستشارة الرقمية المتكاملة',
    version: '1.0.0',
    standard: 'sheikha/v2',
    tawheed: 'لا إله إلا الله',

    phases: [
        {
            phase: 'INTAKE',
            nameAr: 'الاستقبال الذكي',
            tools: ['SHEIKHA-AI-CORE', 'TOOL-SWOT-AI'],
            outputs: ['نموذج الطلب الكامل', 'التصنيف التلقائي', 'الأولوية'],
            auto: true,
            sla_hours: 1,
        },
        {
            phase: 'SHARIA_CHECK',
            nameAr: 'التحقق الشرعي الفوري',
            tools: ['SHARIA-ENGINE', 'NEURAL-ROUTER'],
            outputs: ['شهادة التوافق الشرعي', 'قائمة المخاطر'],
            auto: true,
            sla_hours: 0.5,
            mandatory: true,
        },
        {
            phase: 'DEEP_ANALYSIS',
            nameAr: 'التحليل العميق',
            tools: ['SHEIKHA-AI-CORE', 'STANDARDS-ENGINE', 'VISION-ADVISORY', 'LEGAL-ENGINE'],
            outputs: ['تقرير التحليل الاستراتيجي', 'مصفوفة المقارنة الدولية'],
            auto: false,
            sla_hours: 24,
        },
        {
            phase: 'RECOMMENDATION',
            nameAr: 'التوصيات والخارطة',
            tools: ['TOOL-OKR-GENERATOR', 'TOOL-SCENARIO-PLANNER', 'TOOL-VISION-ENHANCER'],
            outputs: ['تقرير التوصيات', 'خارطة الطريق', 'مؤشرات النجاح'],
            auto: false,
            sla_hours: 8,
        },
        {
            phase: 'DELIVERY',
            nameAr: 'التسليم والتكامل',
            tools: ['TOOL-REPORT-AI', 'PLAT-PORTAL', 'PLAT-API'],
            outputs: ['التقرير النهائي', 'خطة التنفيذ', 'لوحة المتابعة'],
            auto: true,
            sla_hours: 2,
        },
        {
            phase: 'FOLLOW_UP',
            nameAr: 'المتابعة وقياس الأثر',
            tools: ['TOOL-IMPACT-TRACKER', 'TOOL-GAP-ANALYZER'],
            outputs: ['تقرير الأثر الدوري', 'تحديثات المؤشرات'],
            auto: true,
            frequency: 'شهري',
        },
    ],

    quality_gates: [
        { gate: 'SHARIA_COMPLIANCE',   mandatory: true,  auto: true  },
        { gate: 'NO_HARM_CHECK',        mandatory: true,  auto: true  },
        { gate: 'EVIDENCE_BASED',       mandatory: true,  auto: false },
        { gate: 'IHSAN_STANDARD',       mandatory: true,  auto: false },
    ],
};

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    CORE_DIGITAL_TOOLS,
    SPECIALIZED_CONSULTING_TOOLS,
    COMMUNICATION_PLATFORMS,
    DIGITAL_CONSULTING_PROTOCOL,
};
