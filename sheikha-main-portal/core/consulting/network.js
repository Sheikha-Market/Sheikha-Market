/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA CONSULTING NETWORK — الشبكة الاستشارية الكونية الموحّدة            ║
 * ║  محلي → إقليمي → دولي → قاري → كوني                                        ║
 * ║  هيكل + مخطط + شبكة + معمارية استشارية — الأفضل بأمر الله                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا" — الحجرات:١٣
 * "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" — المائدة:٢
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// معمارية الشبكة — ٥ مستويات متكاملة
// ═══════════════════════════════════════════════════════════════
const NETWORK_ARCHITECTURE = {

    // ─── المستوى الأول: المحلي ────────────────────────────────
    LOCAL: {
        level: 1,
        nameAr: 'المستوى المحلي',
        nameEn: 'Local Level',
        scope: 'المدينة / المنطقة / المحافظة',
        coverage: ['المملكة العربية السعودية — كل المناطق', 'المدن الرئيسية في دول الخليج'],
        nodes: [
            { id: 'LOCAL-RIYADH',  nameAr: 'عقدة الرياض',  type: 'hub',       capacity: 'عالية'   },
            { id: 'LOCAL-JEDDAH',  nameAr: 'عقدة جدة',    type: 'hub',       capacity: 'عالية'   },
            { id: 'LOCAL-DAMMAM', nameAr: 'عقدة الدمام',  type: 'node',      capacity: 'متوسطة'  },
            { id: 'LOCAL-MAKKAH', nameAr: 'عقدة مكة',     type: 'node',      capacity: 'متوسطة'  },
            { id: 'LOCAL-MEDINA', nameAr: 'عقدة المدينة', type: 'node',      capacity: 'متوسطة'  },
        ],
        services: ['استشارات فورية عبر التطبيق', 'جلسات افتراضية', 'زيارات ميدانية', 'ورش عمل محلية'],
        sla: { response: '٢ ساعة', delivery: '٢٤ ساعة' },
        quranic_ref: { ref: 'التوبة:١١٩', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ' },
    },

    // ─── المستوى الثاني: الإقليمي ─────────────────────────────
    REGIONAL: {
        level: 2,
        nameAr: 'المستوى الإقليمي',
        nameEn: 'Regional Level',
        scope: 'الخليج + الجزيرة العربية + المشرق + المغرب العربي',
        regions: [
            { id: 'GCC',    nameAr: 'الخليج العربي',     countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'] },
            { id: 'LEVANT', nameAr: 'بلاد الشام',        countries: ['JO', 'LB', 'SY', 'PS', 'IQ'] },
            { id: 'NILE',   nameAr: 'وادي النيل والقرن', countries: ['EG', 'SD', 'ET', 'SO'] },
            { id: 'MAGHREB',nameAr: 'المغرب العربي',     countries: ['MA', 'DZ', 'TN', 'LY'] },
        ],
        services: ['استشارات إقليمية', 'مقارنة التجارب الإقليمية', 'شراكات إقليمية', 'مؤتمرات افتراضية'],
        sla: { response: '٦ ساعات', delivery: '٤٨ ساعة' },
        quranic_ref: { ref: 'آل عمران:١٠٣', text: 'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا' },
    },

    // ─── المستوى الثالث: الدولي ───────────────────────────────
    INTERNATIONAL: {
        level: 3,
        nameAr: 'المستوى الدولي',
        nameEn: 'International Level',
        scope: 'دول العالم الإسلامي + الدول الشريكة',
        zones: [
            { id: 'ZONE-MENA',    nameAr: 'منطقة الشرق الأوسط وشمال أفريقيا', countries_count: 22 },
            { id: 'ZONE-SEA',     nameAr: 'جنوب شرق آسيا (إندونيسيا، ماليزيا، باكستان)', countries_count: 8 },
            { id: 'ZONE-AFRICA',  nameAr: 'أفريقيا جنوب الصحراء (الدول الإسلامية)', countries_count: 15 },
            { id: 'ZONE-TURKEY',  nameAr: 'تركيا وآسيا الوسطى', countries_count: 7 },
            { id: 'ZONE-EUROPE',  nameAr: 'الجاليات الإسلامية في أوروبا', countries_count: 10 },
            { id: 'ZONE-AMERICAS',nameAr: 'أمريكا الشمالية والجنوبية', countries_count: 5 },
        ],
        services: [
            'استشارات حكومية دولية',
            'تقارير مقارنة دولية',
            'مشاركة في مؤتمرات دولية',
            'شراكات استراتيجية دولية',
        ],
        integrations: ['UN', 'OIC', 'WB', 'IMF', 'WTO', 'WHO', 'GCC'],
        sla: { response: '٢٤ ساعة', delivery: '٧٢ ساعة' },
    },

    // ─── المستوى الرابع: القاري ───────────────────────────────
    CONTINENTAL: {
        level: 4,
        nameAr: 'المستوى القاري',
        nameEn: 'Continental Level',
        scope: 'القارات السبع — تغطية شاملة',
        continents: [
            { id: 'ASIA',       nameAr: 'آسيا',           muslim_pct: 62, strategy: 'مركز قيادي للعالم الإسلامي' },
            { id: 'AFRICA',     nameAr: 'أفريقيا',        muslim_pct: 42, strategy: 'نهضة أفريقيا الإسلامية' },
            { id: 'EUROPE',     nameAr: 'أوروبا',         muslim_pct: 5,  strategy: 'تمكين الجاليات وتصدير التميز' },
            { id: 'N_AMERICA',  nameAr: 'أمريكا الشمالية', muslim_pct: 2, strategy: 'النفوذ الاقتصادي الإسلامي' },
            { id: 'S_AMERICA',  nameAr: 'أمريكا الجنوبية', muslim_pct: 1, strategy: 'بناء جسور التعاون الجديد' },
            { id: 'OCEANIA',    nameAr: 'أوقيانوسيا',     muslim_pct: 2, strategy: 'تعزيز الحضور الإسلامي' },
            { id: 'ANTARCTICA', nameAr: 'القطب الجنوبي',  muslim_pct: 0, strategy: 'حفظ البيئة والطبيعة' },
        ],
        quranic_ref: { ref: 'الحجرات:١٣', text: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا' },
    },

    // ─── المستوى الخامس: الكوني ───────────────────────────────
    UNIVERSAL: {
        level: 5,
        nameAr: 'المستوى الكوني — الأفضل بأمر الله',
        nameEn: 'Universal Level — Best by God\'s Command',
        scope: 'الكون كله — كل إنسان وكل كيان وكل مجتمع',
        mission: 'رقمنة كل المعايير والمنهجيات والعلوم وتوحيدها لله وخدمة الإنسانية جمعاء',
        pillars: [
            { id: 'UP1', nameAr: 'التوحيد الكوني', description: 'ربط كل الجهود بالله الواحد' },
            { id: 'UP2', nameAr: 'خدمة الإنسانية', description: 'خير الناس أنفعهم للناس' },
            { id: 'UP3', nameAr: 'الأمانة الكونية', description: 'الاستخلاف في الأرض مسؤولية' },
            { id: 'UP4', nameAr: 'العدل الكوني',    description: 'العدل أساس الملك والحضارة' },
            { id: 'UP5', nameAr: 'لا ضرر كوني',    description: 'لا ضرر ولا ضرار في كل الكون' },
        ],
        quranic_ref: { ref: 'الأنبياء:١٠٧', text: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ' },
        hadith_ref:   { ref: 'الطبراني:٨٠٦', text: 'خير الناس أنفعهم للناس' },
    },
};

// ═══════════════════════════════════════════════════════════════
// الهيكل التنظيمي للاستشارات
// ═══════════════════════════════════════════════════════════════
const ORGANIZATIONAL_STRUCTURE = {
    apex: {
        role: 'المستشار الدولي الأعلى',
        nameAr: 'سلمان أحمد الراجح',
        title: 'International Consultant — Owner of Sheikha',
        responsibilities: [
            'الإشراف العام على كل الاستشارات',
            'تقديم الرؤى الاستراتيجية للحكومات',
            'توحيد كل المعايير بالكتاب والسنة',
            'قيادة فريق الاستشارات الدولية',
        ],
    },

    advisory_council: {
        nameAr: 'المجلس الاستشاري الشرعي والتقني',
        members: [
            { role: 'المستشار الشرعي الأول', domain: 'الفقه والشريعة' },
            { role: 'مستشار الذكاء الاصطناعي', domain: 'AI والبيانات' },
            { role: 'مستشار الحوكمة الدولية', domain: 'السياسات العامة' },
            { role: 'مستشار التمويل الإسلامي', domain: 'المالية والاقتصاد' },
            { role: 'مستشار التحول الرقمي', domain: 'التقنية والأمن' },
        ],
    },

    delivery_teams: [
        { id: 'T1', nameAr: 'فريق الاستشارات الحكومية',      capacity: 50, scope: 'دولي' },
        { id: 'T2', nameAr: 'فريق الاستشارات المالية الإسلامية', capacity: 30, scope: 'دولي' },
        { id: 'T3', nameAr: 'فريق الاستشارات التقنية والرقمية', capacity: 40, scope: 'كوني'  },
        { id: 'T4', nameAr: 'فريق الاستشارات القانونية والامتثال', capacity: 20, scope: 'دولي' },
        { id: 'T5', nameAr: 'فريق الاستشارات الاجتماعية والإنسانية', capacity: 25, scope: 'قاري' },
        { id: 'T6', nameAr: 'فريق الرؤى الاستراتيجية',        capacity: 15, scope: 'كوني'  },
    ],

    digital_operations: {
        nameAr: 'مركز العمليات الرقمية',
        components: [
            'منصة إدارة مشاريع الاستشارات',
            'نظام إدارة علاقات العملاء (CRM الإسلامي)',
            'منصة التعاون الرقمي عبر الحدود',
            'مستودع المعرفة الاستشارية',
            'لوحة قيادة المؤشرات المباشرة',
        ],
    },
};

// ═══════════════════════════════════════════════════════════════
// مخطط التدفق الاستشاري — من الطلب للتسليم
// ═══════════════════════════════════════════════════════════════
const CONSULTING_FLOW = [
    {
        step: 1,
        nameAr: 'استقبال الطلب والتشخيص الأولي',
        nameEn: 'Request Intake & Initial Diagnosis',
        input: 'طلب العميل',
        tools: ['AI-INTAKE-BOT', 'DOMAIN-CLASSIFIER'],
        output: 'ملف التشخيص الأولي',
        duration: '٢ ساعة',
        sharia_check: true,
    },
    {
        step: 2,
        nameAr: 'التحقق الشرعي والأخلاقي',
        nameEn: 'Sharia & Ethical Verification',
        input: 'ملف التشخيص',
        tools: ['SHARIA-ENGINE', 'NO-HARM-ENGINE'],
        output: 'تقرير التحقق الشرعي',
        duration: '١ ساعة',
        sharia_check: true,
        quranic_ref: { ref: 'المائدة:٢', text: 'وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ' },
    },
    {
        step: 3,
        nameAr: 'التحليل الذكي والبحث',
        nameEn: 'AI-Powered Analysis & Research',
        input: 'الطلب المعتمد شرعياً',
        tools: ['SHEIKHA-AI', 'STANDARDS-ENGINE', 'INDICATORS-ENGINE', 'VISION-ADVISORY'],
        output: 'تقرير التحليل الشامل',
        duration: '٦-٢٤ ساعة',
    },
    {
        step: 4,
        nameAr: 'صياغة الاستشارة والتوصيات',
        nameEn: 'Consulting Report & Recommendations',
        input: 'تقرير التحليل',
        tools: ['REPORT-GENERATOR-AI', 'ROADMAP-ENGINE'],
        output: 'تقرير الاستشارة الكامل',
        duration: '٤-٨ ساعات',
    },
    {
        step: 5,
        nameAr: 'المراجعة والاعتماد',
        nameEn: 'Review & Approval',
        input: 'تقرير الاستشارة',
        tools: ['QUALITY-REVIEWER', 'SHARIA-AUDITOR'],
        output: 'استشارة معتمدة',
        duration: '٢-٤ ساعات',
        quality_gate: true,
    },
    {
        step: 6,
        nameAr: 'التسليم والمتابعة',
        nameEn: 'Delivery & Follow-Up',
        input: 'استشارة معتمدة',
        tools: ['DELIVERY-PLATFORM', 'IMPACT-TRACKER'],
        output: 'نتائج قابلة للقياس',
        duration: 'مستمر',
        hadith_ref: { ref: 'أحمد:١٢٩٠٢', text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه' },
    },
];

// ═══════════════════════════════════════════════════════════════
// نماذج تسعير الاستشارات (الإطار العام)
// ═══════════════════════════════════════════════════════════════
const PRICING_MODELS = [
    { id: 'PM-HOURLY',    nameAr: 'بالساعة',             scope: 'أفراد + شركات صغيرة', currency: 'SAR' },
    { id: 'PM-PROJECT',   nameAr: 'بالمشروع',            scope: 'شركات + مؤسسات',       currency: 'SAR/USD' },
    { id: 'PM-RETAINER',  nameAr: 'عقد استشاري مستمر',   scope: 'حكومات + كبرى',        currency: 'USD' },
    { id: 'PM-SUCCESS',   nameAr: 'مشاركة في النجاح',    scope: 'شراكات استراتيجية',    currency: 'متغير' },
    { id: 'PM-ZAKAT',     nameAr: 'استشارات خيرية (زكاة)', scope: 'منظمات غير ربحية + فقراء', currency: 'مجاني' },
];

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    NETWORK_ARCHITECTURE,
    ORGANIZATIONAL_STRUCTURE,
    CONSULTING_FLOW,
    PRICING_MODELS,
};
