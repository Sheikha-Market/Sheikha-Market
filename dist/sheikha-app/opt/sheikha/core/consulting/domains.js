/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA CONSULTING DOMAINS — قطاعات الاستشارة الشاملة في منظومة شيخة      ║
 * ║  محلية · دولية · قارية · كونية — بكل وسيلة رقمية وذكاء اصطناعي            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَشَاوِرْهُمْ فِي الْأَمْرِ" — آل عمران:١٥٩
 * "ما خاب من استخار ولا ندم من استشار" — الحديث
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// ① الاستشارات الحكومية والسياسية
// ═══════════════════════════════════════════════════════════════
const GOV_POLITICAL = [
    {
        id: 'GOV-DIGITAL',
        nameAr: 'الحوكمة الرقمية والتحول الحكومي',
        nameEn: 'Digital Governance & Government Transformation',
        scope: ['دولي', 'محلي'],
        maqsad: 'ARD',
        services: [
            'تصميم استراتيجيات التحول الرقمي الحكومي',
            'تطوير منصات الخدمات الحكومية الإلكترونية',
            'تحليل مؤشرات حوكمة WGI وتقديم خارطة تحسين',
            'ربط الوزارات بمعيار البيانات الموحّد',
        ],
        tools: ['AI-GOV-ANALYZER', 'STANDARDS-ENGINE', 'VISION-ADVISORY'],
        quranic_ref: { ref: 'النساء:٥٨', text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا' },
    },
    {
        id: 'GOV-POLICY',
        nameAr: 'السياسات العامة وصياغة التشريعات',
        nameEn: 'Public Policy & Legislation Drafting',
        scope: ['دولي', 'محلي'],
        maqsad: 'DEEN',
        services: [
            'تحليل السياسات الحكومية ومقارنتها بالمعايير الدولية',
            'صياغة لوائح وأنظمة متوافقة مع الشريعة والمعايير الدولية',
            'استشارات تشريعية بمرجعية الكتاب والسنة',
            'تقارير مقارنة أنظمة الدول',
        ],
        tools: ['LEGAL-ENGINE', 'STANDARDS-ENGINE', 'SHARIA-ENGINE'],
        quranic_ref: { ref: 'النساء:٥٩', text: 'أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ' },
    },
    {
        id: 'GOV-ANTI-CORRUPTION',
        nameAr: 'مكافحة الفساد والنزاهة المؤسسية',
        nameEn: 'Anti-Corruption & Institutional Integrity',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'DEEN',
        services: [
            'تقييم مستوى النزاهة بمؤشر CPI',
            'تصميم أنظمة مكافحة الفساد ISO 37001',
            'برامج الشفافية والمساءلة المؤسسية',
        ],
        tools: ['COMPLIANCE-ENGINE', 'AUDIT-AI'],
        hadith_ref: { ref: 'البخاري:٦٩٤٨', text: 'لعن الله الراشي والمرتشي' },
    },
    {
        id: 'GOV-SMART-CITY',
        nameAr: 'المدن الذكية والبنية التحتية',
        nameEn: 'Smart Cities & Infrastructure',
        scope: ['دولي', 'قاري'],
        maqsad: 'ARD',
        services: [
            'تصميم مخططات المدن الذكية المستدامة',
            'استراتيجيات البنية التحتية الرقمية',
            'أنظمة إدارة المدينة بالذكاء الاصطناعي',
        ],
        tools: ['AI-CITY-PLANNER', 'IOT-INTEGRATION', 'DIGITAL-TWIN'],
    },
];

// ═══════════════════════════════════════════════════════════════
// ② الاستشارات الاقتصادية والمالية
// ═══════════════════════════════════════════════════════════════
const ECONOMIC_FINANCIAL = [
    {
        id: 'FIN-ISLAMIC',
        nameAr: 'الاستشارات المالية الإسلامية',
        nameEn: 'Islamic Finance Advisory',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'MAL',
        services: [
            'هيكلة المنتجات المالية الإسلامية (مرابحة، مضاربة، مشاركة، إجارة)',
            'مراجعة التوافق الشرعي للعقود المالية وفق AAOIFI',
            'إدارة الزكاة والوقف المؤسسي رقمياً',
            'بناء المحافظ الاستثمارية الإسلامية',
            'الفرز الشرعي (Sharia Screening) للأسهم',
        ],
        tools: ['ZAKAT-ENGINE', 'AAOIFI-STANDARDS', 'SHARIA-SCREENER'],
        quranic_ref: { ref: 'البقرة:٢٧٥', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا' },
    },
    {
        id: 'FIN-STRATEGY',
        nameAr: 'الاستراتيجية الاقتصادية والتنموية',
        nameEn: 'Economic & Development Strategy',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'MAL',
        services: [
            'إعداد رؤى تنموية وطنية وتقييمها',
            'تحليل مؤشرات التنافسية GCI وخطط التحسين',
            'استراتيجيات التنويع الاقتصادي',
            'تحليل الناتج المحلي وخطط النمو',
        ],
        tools: ['VISION-ADVISORY', 'INDICATORS-ENGINE', 'ECONOMIC-AI'],
    },
    {
        id: 'FIN-STARTUP',
        nameAr: 'ريادة الأعمال والشركات الناشئة',
        nameEn: 'Entrepreneurship & Startup Advisory',
        scope: ['دولي', 'محلي'],
        maqsad: 'MAL',
        services: [
            'خطط العمل وجدوى الاستثمار',
            'هيكلة التمويل الإسلامي للشركات الناشئة',
            'استراتيجيات النمو والتوسع',
            'الدخول لأسواق جديدة',
        ],
        tools: ['BUSINESS-PLANNER-AI', 'MARKET-ENGINE'],
    },
    {
        id: 'FIN-TRADE',
        nameAr: 'التجارة الدولية والتصدير',
        nameEn: 'International Trade & Export',
        scope: ['كوني', 'دولي'],
        maqsad: 'MAL',
        services: [
            'استشارات WTO وقواعد التجارة الدولية',
            'تأهيل الشركات للتصدير',
            'شبكة ربط الموردين والمشترين عالمياً',
            'الامتثال لإنكوترمز 2020',
        ],
        tools: ['TRADE-ENGINE', 'MARKET-ENGINE', 'LEGAL-ENGINE'],
        quranic_ref: { ref: 'النساء:٢٩', text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ' },
    },
];

// ═══════════════════════════════════════════════════════════════
// ③ الاستشارات التقنية والرقمية
// ═══════════════════════════════════════════════════════════════
const TECHNICAL_DIGITAL = [
    {
        id: 'TECH-AI',
        nameAr: 'استشارات الذكاء الاصطناعي والبيانات',
        nameEn: 'AI & Data Consulting',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'AQL',
        services: [
            'استراتيجيات تبني الذكاء الاصطناعي',
            'تصميم نماذج AI إسلامية أخلاقية',
            'تحليل البيانات وإعداد التقارير التنبؤية',
            'بناء مراكز بيانات وبنية سحابية',
        ],
        tools: ['SHEIKHA-AI', 'LLM-ENGINE', 'CLOUD-ENGINE', 'DATA-ANALYTICS'],
        quranic_ref: { ref: 'العلق:١', text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ' },
    },
    {
        id: 'TECH-SECURITY',
        nameAr: 'الأمن السيبراني وحماية البيانات',
        nameEn: 'Cybersecurity & Data Protection',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'AQL',
        services: [
            'تقييم المخاطر الأمنية وإعداد خطط المعالجة',
            'الامتثال لـ NCA-ECC و PDPL و ISO 27001',
            'اختبار الاختراق وتقييم الثغرات',
            'بناء مراكز عمليات الأمن (SOC)',
        ],
        tools: ['SECURITY-ENGINE', 'NCA-COMPLIANCE', 'AUDIT-AI'],
        quranic_ref: { ref: 'الحجرات:١٢', text: 'وَلَا تَجَسَّسُوا' },
    },
    {
        id: 'TECH-DIGITAL-TRANSFORM',
        nameAr: 'التحول الرقمي المؤسسي',
        nameEn: 'Enterprise Digital Transformation',
        scope: ['دولي', 'محلي'],
        maqsad: 'ARD',
        services: [
            'خارطة طريق التحول الرقمي',
            'تصميم العمارة المؤسسية الرقمية',
            'دمج الأنظمة القديمة مع المنصات الحديثة',
            'تدريب وتأهيل الكوادر البشرية',
        ],
        tools: ['DIGITAL-MATURITY-ASSESSOR', 'ROADMAP-ENGINE', 'TRAINING-ENGINE'],
    },
    {
        id: 'TECH-CLOUD',
        nameAr: 'استشارات السحابة والبنية التحتية',
        nameEn: 'Cloud & Infrastructure Advisory',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'ARD',
        services: [
            'استراتيجية الانتقال إلى السحابة',
            'إدارة متعددة السحب (Multi-Cloud)',
            'تحسين التكاليف التقنية',
            'ضمان الاستمرارية والتعافي من الكوارث',
        ],
        tools: ['CLOUD-ENGINE', 'INFRA-OPTIMIZER'],
    },
    {
        id: 'TECH-BLOCKCHAIN',
        nameAr: 'استشارات البلوك تشين والهوية الرقمية',
        nameEn: 'Blockchain & Digital Identity',
        scope: ['كوني', 'دولي'],
        maqsad: 'DEEN',
        services: [
            'بناء حلول البلوك تشين الحلال',
            'الهوية الرقمية اللامركزية (DID)',
            'العقود الذكية المتوافقة مع الشريعة',
        ],
        tools: ['IDENTITY-ENGINE', 'BLOCKCHAIN-SHARIA'],
        quranic_ref: { ref: 'البقرة:٢٨٢', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ' },
    },
];

// ═══════════════════════════════════════════════════════════════
// ④ الاستشارات القانونية والامتثال
// ═══════════════════════════════════════════════════════════════
const LEGAL_COMPLIANCE = [
    {
        id: 'LEGAL-SHARIA',
        nameAr: 'الاستشارات الشرعية والفقهية',
        nameEn: 'Sharia & Islamic Jurisprudence Advisory',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'DEEN',
        services: [
            'الفتاوى التجارية والاقتصادية',
            'مراجعة العقود شرعياً',
            'تأهيل المنتجات للامتثال الشرعي',
            'بناء لجان الشريعة المؤسسية',
        ],
        tools: ['SHARIA-ENGINE', 'QURAN-SUNNAH-ENGINE', 'FATWA-AI'],
        quranic_ref: { ref: 'المائدة:١', text: 'أَوْفُوا بِالْعُقُودِ' },
    },
    {
        id: 'LEGAL-COMPLIANCE',
        nameAr: 'الامتثال التنظيمي والقانوني',
        nameEn: 'Regulatory & Legal Compliance',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'MAL',
        services: [
            'تقييم الامتثال للأنظمة المحلية والدولية',
            'إعداد ملفات الامتثال لهيئات التنظيم',
            'مراجعة العقود التجارية والشراكات',
            'الامتثال لـ GDPR, PDPL, FATF',
        ],
        tools: ['COMPLIANCE-ENGINE', 'LEGAL-ENGINE', 'STANDARDS-ENGINE'],
    },
    {
        id: 'LEGAL-IP',
        nameAr: 'الملكية الفكرية والحماية الرقمية',
        nameEn: 'Intellectual Property & Digital Rights',
        scope: ['كوني', 'دولي'],
        maqsad: 'AQL',
        services: [
            'تسجيل براءات الاختراع والعلامات التجارية',
            'حماية المحتوى الرقمي',
            'استراتيجيات الملكية الفكرية',
        ],
        tools: ['IP-PROTECTION-ENGINE'],
    },
];

// ═══════════════════════════════════════════════════════════════
// ⑤ الاستشارات الاجتماعية والإنسانية
// ═══════════════════════════════════════════════════════════════
const SOCIAL_HUMAN = [
    {
        id: 'SOC-EDUCATION',
        nameAr: 'الاستشارات التعليمية والتدريبية',
        nameEn: 'Education & Training Advisory',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'AQL',
        services: [
            'تصميم المناهج الدراسية الرقمية الإسلامية',
            'استراتيجيات التعليم الهجين والمدمج',
            'برامج التدريب المهني وتأهيل الكوادر',
            'منصات التعلم الذكي بالذكاء الاصطناعي',
        ],
        tools: ['LEARNING-ENGINE', 'AI-TUTOR', 'CURRICULUM-DESIGNER'],
        quranic_ref: { ref: 'العلق:١', text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ' },
    },
    {
        id: 'SOC-HEALTH',
        nameAr: 'الاستشارات الصحية والطبية',
        nameEn: 'Health & Medical Advisory',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'NAFS',
        services: [
            'تصميم منظومات الصحة الرقمية',
            'استراتيجيات التغطية الصحية الشاملة',
            'مؤشرات الصحة وتحليل بيانات المرضى',
            'الطب الإسلامي التكاملي',
        ],
        tools: ['MEDICAL-ENGINE', 'HEALTH-AI', 'WHO-INDICATORS'],
        quranic_ref: { ref: 'المائدة:٣٢', text: 'مَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا' },
    },
    {
        id: 'SOC-COMMUNITY',
        nameAr: 'التنمية المجتمعية والوقف',
        nameEn: 'Community Development & Waqf',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'NASL',
        services: [
            'تصميم برامج الوقف الرقمي',
            'استراتيجيات التنمية المجتمعية المستدامة',
            'برامج الزكاة والصدقات المؤسسية',
            'حوكمة المنظمات غير الربحية',
        ],
        tools: ['ZAKAT-ENGINE', 'COMMUNITY-AI', 'WAQF-PLATFORM'],
        quranic_ref: { ref: 'التوبة:٦٠', text: 'إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ' },
    },
    {
        id: 'SOC-ENVIRONMENT',
        nameAr: 'الاستشارات البيئية والاستدامة',
        nameEn: 'Environmental & Sustainability Advisory',
        scope: ['كوني', 'دولي'],
        maqsad: 'ARD',
        services: [
            'استراتيجيات الحياد الكربوني',
            'تقييم الأثر البيئي وتقارير ESG',
            'تصميم مشاريع الطاقة المتجددة',
            'الاقتصاد الدائري والصناعة الخضراء',
        ],
        tools: ['ESG-ENGINE', 'CARBON-TRACKER', 'SUSTAINABILITY-AI'],
        quranic_ref: { ref: 'الأعراف:٥٦', text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا' },
    },
];

// ═══════════════════════════════════════════════════════════════
// ⑥ الاستشارات الاستراتيجية والقيادية
// ═══════════════════════════════════════════════════════════════
const STRATEGIC_LEADERSHIP = [
    {
        id: 'STR-VISION',
        nameAr: 'الاستشارات الاستراتيجية ورسم الرؤى',
        nameEn: 'Strategic Vision & Planning Advisory',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'ARD',
        services: [
            'صياغة الرؤى المؤسسية وربطها بالمقاصد الشرعية',
            'تخطيط السيناريوهات الاستراتيجية',
            'OKRs و KPIs مرتبطة بالمؤشرات الدولية',
            'استشارات التحول من الرؤية إلى التنفيذ',
        ],
        tools: ['VISION-ADVISORY', 'INDICATORS-ENGINE', 'ROADMAP-ENGINE'],
        quranic_ref: { ref: 'الحشر:١٨', text: 'وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ' },
    },
    {
        id: 'STR-INNOVATION',
        nameAr: 'الابتكار والبحث والتطوير',
        nameEn: 'Innovation, R&D Advisory',
        scope: ['كوني', 'دولي'],
        maqsad: 'AQL',
        services: [
            'استراتيجيات الابتكار وإدارة الملكية الفكرية',
            'تحليل مؤشر GII وخطط التحسين',
            'بناء مراكز الابتكار والحاضنات',
            'شراكات البحث والتطوير',
        ],
        tools: ['INNOVATION-AI', 'GII-ANALYZER', 'R&D-PLANNER'],
    },
    {
        id: 'STR-LEADERSHIP',
        nameAr: 'تطوير القيادة والكوادر',
        nameEn: 'Leadership & Human Capital Development',
        scope: ['كوني', 'دولي', 'محلي'],
        maqsad: 'NAFS',
        services: [
            'برامج تطوير القيادة الإسلامية',
            'التخطيط الوظيفي والتعاقب القيادي',
            'استراتيجيات إدارة المواهب',
            'بناء ثقافة التميز المؤسسي',
        ],
        tools: ['LEARNING-ENGINE', 'HR-AI', 'LEADERSHIP-ASSESSOR'],
        hadith_ref: { ref: 'أحمد:١٢٩٠٢', text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه' },
    },
];

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
const ALL_DOMAINS = [
    ...GOV_POLITICAL,
    ...ECONOMIC_FINANCIAL,
    ...TECHNICAL_DIGITAL,
    ...LEGAL_COMPLIANCE,
    ...SOCIAL_HUMAN,
    ...STRATEGIC_LEADERSHIP,
];

module.exports = {
    GOV_POLITICAL,
    ECONOMIC_FINANCIAL,
    TECHNICAL_DIGITAL,
    LEGAL_COMPLIANCE,
    SOCIAL_HUMAN,
    STRATEGIC_LEADERSHIP,
    ALL_DOMAINS,
};
