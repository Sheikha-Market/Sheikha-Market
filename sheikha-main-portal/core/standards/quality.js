/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         SHEIKHA QUALITY STANDARDS — معايير الجودة الدولية والإسلامية       ║
 * ║     ISO + ASTM + DIN + BS + SASO + AAOIFI — مرقّمة بالكتاب والسنة         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ" — النحل:٩٠
 * "إن الله يحب إذا عمل أحدكم عملًا أن يتقنه" — صحيح الجامع
 *
 * هذا الملف يُعرّف كل معايير الجودة المعتمدة في منظومة شيخة،
 * مرتبطةً بالمقصد الشرعي المناسب.
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// ① معايير الجودة الإدارية — ISO 9000 Family
// ═══════════════════════════════════════════════════════════════
const QUALITY_MANAGEMENT = [
    {
        id: 'ISO-9001',
        nameEn: 'ISO 9001:2015 — Quality Management Systems',
        nameAr: 'أنظمة إدارة الجودة',
        body: 'ISO',
        domain: 'إدارة الجودة',
        maqsad: 'MAL',
        quranic_ref: { ref: 'النحل:٩٠', text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ' },
        hadith_ref: { ref: 'صحيح الجامع', text: 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه' },
        principles: ['تركيز على العميل', 'القيادة', 'مشاركة الأفراد', 'نهج العملية', 'التحسين'],
        sharia_alignment: 'الإتقان في العمل والعدل في المعاملة',
    },
    {
        id: 'ISO-9000',
        nameEn: 'ISO 9000:2015 — QMS Fundamentals and Vocabulary',
        nameAr: 'أسس ومصطلحات أنظمة إدارة الجودة',
        body: 'ISO',
        domain: 'إدارة الجودة',
        maqsad: 'MAL',
        quranic_ref: { ref: 'النحل:٩٠', text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ' },
    },
    {
        id: 'ISO-9004',
        nameEn: 'ISO 9004:2018 — Managing for Sustained Success',
        nameAr: 'إدارة النجاح المستدام',
        body: 'ISO',
        domain: 'إدارة الجودة',
        maqsad: 'MAL',
        hadith_ref: { ref: 'أحمد:١٢٩٠٢', text: 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه' },
    },
    {
        id: 'ISO-19011',
        nameEn: 'ISO 19011:2018 — Guidelines for Auditing',
        nameAr: 'إرشادات التدقيق على أنظمة الإدارة',
        body: 'ISO',
        domain: 'تدقيق الجودة',
        maqsad: 'MAL',
        quranic_ref: { ref: 'التوبة:١١٩', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ' },
    },
];

// ═══════════════════════════════════════════════════════════════
// ② معايير البيئة والاستدامة — ISO 14000 + ISO 50001
// ═══════════════════════════════════════════════════════════════
const ENVIRONMENTAL_STANDARDS = [
    {
        id: 'ISO-14001',
        nameEn: 'ISO 14001:2015 — Environmental Management Systems',
        nameAr: 'أنظمة الإدارة البيئية',
        body: 'ISO',
        domain: 'البيئة',
        maqsad: 'ARD',
        quranic_ref: { ref: 'البقرة:٣٠', text: 'إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً' },
        hadith_ref: { ref: 'البخاري:٢٣٢٠', text: 'إن قامت الساعة وبيد أحدكم فسيلة فإن استطاع ألا تقوم حتى يغرسها فليغرسها' },
        sharia_alignment: 'الاستخلاف في الأرض وصون النعمة',
    },
    {
        id: 'ISO-14040',
        nameEn: 'ISO 14040:2006 — Life Cycle Assessment',
        nameAr: 'تقييم دورة الحياة',
        body: 'ISO',
        domain: 'البيئة',
        maqsad: 'ARD',
    },
    {
        id: 'ISO-50001',
        nameEn: 'ISO 50001:2018 — Energy Management Systems',
        nameAr: 'أنظمة إدارة الطاقة',
        body: 'ISO',
        domain: 'الطاقة',
        maqsad: 'ARD',
        quranic_ref: { ref: 'الأعراف:٣١', text: 'وَكُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا' },
        sharia_alignment: 'النهي عن الإسراف وصون الموارد',
    },
];

// ═══════════════════════════════════════════════════════════════
// ③ معايير الصحة والسلامة المهنية — ISO 45001 + OSHA
// ═══════════════════════════════════════════════════════════════
const SAFETY_STANDARDS = [
    {
        id: 'ISO-45001',
        nameEn: 'ISO 45001:2018 — Occupational Health & Safety',
        nameAr: 'أنظمة إدارة الصحة والسلامة المهنية',
        body: 'ISO',
        domain: 'الصحة والسلامة',
        maqsad: 'NAFS',
        quranic_ref: { ref: 'المائدة:٣٢', text: 'مَن قَتَلَ نَفْسًا بِغَيْرِ نَفْسٍ فَكَأَنَّمَا قَتَلَ النَّاسَ جَمِيعًا' },
        hadith_ref: { ref: 'ابن ماجه:٢٣٤٠', text: 'لا ضرر ولا ضرار' },
        sharia_alignment: 'حفظ النفس وواجب درء الضرر',
    },
    {
        id: 'OSHA-29CFR',
        nameEn: 'OSHA 29 CFR 1910 — General Industry Safety',
        nameAr: 'معايير السلامة الصناعية العامة (OSHA)',
        body: 'OSHA',
        domain: 'الصحة والسلامة',
        maqsad: 'NAFS',
    },
    {
        id: 'ISO-31000',
        nameEn: 'ISO 31000:2018 — Risk Management',
        nameAr: 'إدارة المخاطر',
        body: 'ISO',
        domain: 'إدارة المخاطر',
        maqsad: 'NAFS',
        quranic_ref: { ref: 'البقرة:١٩٥', text: 'وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ' },
    },
];

// ═══════════════════════════════════════════════════════════════
// ④ معايير أمن المعلومات والبيانات — ISO 27000 Family
// ═══════════════════════════════════════════════════════════════
const INFORMATION_SECURITY_STANDARDS = [
    {
        id: 'ISO-27001',
        nameEn: 'ISO/IEC 27001:2022 — Information Security Management',
        nameAr: 'إدارة أمن المعلومات',
        body: 'ISO/IEC',
        domain: 'أمن المعلومات',
        maqsad: 'AQL',
        quranic_ref: { ref: 'الحجرات:٦', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا' },
        sharia_alignment: 'التثبت وصون الأسرار والأمانة',
    },
    {
        id: 'ISO-27017',
        nameEn: 'ISO/IEC 27017 — Cloud Security',
        nameAr: 'أمن الحوسبة السحابية',
        body: 'ISO/IEC',
        domain: 'أمن المعلومات',
        maqsad: 'AQL',
    },
    {
        id: 'ISO-27701',
        nameEn: 'ISO/IEC 27701 — Privacy Information Management',
        nameAr: 'إدارة معلومات الخصوصية',
        body: 'ISO/IEC',
        domain: 'الخصوصية',
        maqsad: 'AQL',
        quranic_ref: { ref: 'الحجرات:١٢', text: 'وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا' },
        sharia_alignment: 'حرمة التجسس وصون الخصوصية',
    },
    {
        id: 'NIST-CSF',
        nameEn: 'NIST Cybersecurity Framework',
        nameAr: 'الإطار الوطني الأمريكي للأمن السيبراني',
        body: 'NIST',
        domain: 'الأمن السيبراني',
        maqsad: 'AQL',
    },
    {
        id: 'NCA-ECC',
        nameEn: 'NCA Essential Cybersecurity Controls (Saudi Arabia)',
        nameAr: 'الضوابط الأساسية للأمن السيبراني — الهيئة الوطنية للأمن السيبراني (السعودية)',
        body: 'NCA-SA',
        domain: 'الأمن السيبراني',
        maqsad: 'AQL',
        region: 'SA',
    },
];

// ═══════════════════════════════════════════════════════════════
// ⑤ المعايير الهندسية والتقنية — ASTM + DIN + BS + ANSI
// ═══════════════════════════════════════════════════════════════
const ENGINEERING_STANDARDS = [
    {
        id: 'ASTM-E1',
        nameEn: 'ASTM International Standards',
        nameAr: 'معايير ASTM الدولية للمواد والاختبارات',
        body: 'ASTM',
        domain: 'هندسة المواد',
        maqsad: 'ARD',
        hadith_ref: { ref: 'أحمد:١٢٩٠٢', text: 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه' },
    },
    {
        id: 'DIN-EN',
        nameEn: 'DIN EN — German/European Standards',
        nameAr: 'معايير DIN الألمانية والأوروبية',
        body: 'DIN',
        domain: 'الهندسة',
        maqsad: 'ARD',
        region: 'EU',
    },
    {
        id: 'BS-PD',
        nameEn: 'British Standards (BSI)',
        nameAr: 'المعايير البريطانية (BSI)',
        body: 'BSI',
        domain: 'الهندسة',
        maqsad: 'ARD',
        region: 'UK',
    },
    {
        id: 'ANSI',
        nameEn: 'American National Standards Institute',
        nameAr: 'المعهد الوطني الأمريكي للمعايير',
        body: 'ANSI',
        domain: 'الهندسة',
        maqsad: 'ARD',
        region: 'US',
    },
    {
        id: 'IEC-60000',
        nameEn: 'IEC Standards — Electrical & Electronic',
        nameAr: 'معايير اللجنة الكهروتقنية الدولية',
        body: 'IEC',
        domain: 'الكهرباء والإلكترونيات',
        maqsad: 'ARD',
    },
    {
        id: 'IEEE-802',
        nameEn: 'IEEE 802 — Networking Standards',
        nameAr: 'معايير IEEE للشبكات',
        body: 'IEEE',
        domain: 'الشبكات والاتصالات',
        maqsad: 'ARD',
    },
    {
        id: 'ITU-T',
        nameEn: 'ITU-T Recommendations',
        nameAr: 'توصيات الاتحاد الدولي للاتصالات',
        body: 'ITU',
        domain: 'الاتصالات',
        maqsad: 'ARD',
    },
    {
        id: 'ISO-2859',
        nameEn: 'ISO 2859 — Sampling Procedures for Inspection',
        nameAr: 'إجراءات أخذ العينات للفحص بالسمات',
        body: 'ISO',
        domain: 'ضبط الجودة',
        maqsad: 'MAL',
    },
];

// ═══════════════════════════════════════════════════════════════
// ⑥ المعايير المالية الإسلامية — AAOIFI + IFSB + Basel
// ═══════════════════════════════════════════════════════════════
const ISLAMIC_FINANCIAL_STANDARDS = [
    {
        id: 'AAOIFI-AS',
        nameEn: 'AAOIFI Accounting Standards',
        nameAr: 'معايير المحاسبة للمؤسسات المالية الإسلامية (هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية)',
        body: 'AAOIFI',
        domain: 'المحاسبة الإسلامية',
        maqsad: 'MAL',
        quranic_ref: { ref: 'البقرة:٢٨٢', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ' },
        sharia_alignment: 'توثيق المعاملات المالية وصون الحقوق',
    },
    {
        id: 'AAOIFI-SS',
        nameEn: 'AAOIFI Sharia Standards',
        nameAr: 'معايير الشريعة للمؤسسات المالية الإسلامية',
        body: 'AAOIFI',
        domain: 'التمويل الإسلامي',
        maqsad: 'MAL',
        quranic_ref: { ref: 'البقرة:٢٧٥', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا' },
    },
    {
        id: 'IFSB-1',
        nameEn: 'IFSB Capital Adequacy Standard',
        nameAr: 'معيار كفاية رأس المال للمؤسسات المالية الإسلامية',
        body: 'IFSB',
        domain: 'الرقابة المالية الإسلامية',
        maqsad: 'MAL',
    },
    {
        id: 'IFRS-9',
        nameEn: 'IFRS 9 — Financial Instruments',
        nameAr: 'معيار التقارير المالية الدولي ٩ — الأدوات المالية',
        body: 'IASB',
        domain: 'التقارير المالية',
        maqsad: 'MAL',
        note: 'يُطبّق بعد تصفيته من المحظورات الشرعية (الربا والغرر)',
    },
    {
        id: 'ZAKAT-SA',
        nameEn: 'Saudi Zakat and Tax Authority Standards',
        nameAr: 'معايير هيئة الزكاة والضريبة والجمارك السعودية',
        body: 'ZATCA',
        domain: 'الزكاة والضريبة',
        maqsad: 'MAL',
        quranic_ref: { ref: 'التوبة:١٠٣', text: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ' },
        region: 'SA',
    },
];

// ═══════════════════════════════════════════════════════════════
// ⑦ معايير الاستدامة والمسؤولية الاجتماعية
// ═══════════════════════════════════════════════════════════════
const SUSTAINABILITY_STANDARDS = [
    {
        id: 'ISO-26000',
        nameEn: 'ISO 26000 — Social Responsibility',
        nameAr: 'المسؤولية الاجتماعية',
        body: 'ISO',
        domain: 'المسؤولية الاجتماعية',
        maqsad: 'ARD',
        quranic_ref: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
        sharia_alignment: 'التعاون على البر والإحسان إلى الناس',
    },
    {
        id: 'GRI-STDS',
        nameEn: 'GRI Sustainability Reporting Standards',
        nameAr: 'معايير تقارير الاستدامة (GRI)',
        body: 'GRI',
        domain: 'الاستدامة',
        maqsad: 'ARD',
    },
    {
        id: 'UN-SDG',
        nameEn: 'UN Sustainable Development Goals (SDGs)',
        nameAr: 'أهداف التنمية المستدامة للأمم المتحدة',
        body: 'UN',
        domain: 'التنمية المستدامة',
        maqsad: 'ARD',
        quranic_ref: { ref: 'البقرة:٣٠', text: 'إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً' },
    },
    {
        id: 'VISION-2030',
        nameEn: 'Saudi Vision 2030',
        nameAr: 'رؤية المملكة العربية السعودية ٢٠٣٠',
        body: 'KSA-GOV',
        domain: 'التحول الوطني',
        maqsad: 'ARD',
        region: 'SA',
        pillars: ['مجتمع حيوي', 'اقتصاد مزدهر', 'وطن طموح'],
    },
    {
        id: 'TCFD',
        nameEn: 'TCFD — Climate-related Financial Disclosures',
        nameAr: 'إفصاحات المخاطر المناخية المالية',
        body: 'TCFD',
        domain: 'المناخ والمال',
        maqsad: 'ARD',
    },
];

// ═══════════════════════════════════════════════════════════════
// ⑧ المعايير السعودية (SASO) والخليجية (GSO)
// ═══════════════════════════════════════════════════════════════
const SAUDI_GCC_STANDARDS = [
    {
        id: 'SASO-QMS',
        nameEn: 'SASO Quality Management Standard',
        nameAr: 'معيار إدارة الجودة — هيئة المواصفات والمقاييس والجودة السعودية',
        body: 'SASO',
        domain: 'الجودة السعودية',
        maqsad: 'MAL',
        region: 'SA',
    },
    {
        id: 'SASO-HALAL',
        nameEn: 'SASO Halal Product Requirements',
        nameAr: 'متطلبات المنتجات الحلال — SASO',
        body: 'SASO',
        domain: 'الحلال',
        maqsad: 'DEEN',
        quranic_ref: { ref: 'البقرة:١٦٨', text: 'يَا أَيُّهَا النَّاسُ كُلُوا مِمَّا فِي الْأَرْضِ حَلَالًا طَيِّبًا' },
        region: 'SA',
    },
    {
        id: 'GSO-2055',
        nameEn: 'GSO 2055 — Halal Food',
        nameAr: 'معيار الغذاء الحلال الخليجي (GSO)',
        body: 'GSO',
        domain: 'الحلال',
        maqsad: 'DEEN',
        region: 'GCC',
    },
    {
        id: 'SFDA-FOOD',
        nameEn: 'SFDA Food Standards',
        nameAr: 'معايير الغذاء والدواء السعودية (SFDA)',
        body: 'SFDA',
        domain: 'الغذاء والدواء',
        maqsad: 'NAFS',
        region: 'SA',
    },
    {
        id: 'CITC-TCS',
        nameEn: 'CITC Telecom Standards (Saudi Arabia)',
        nameAr: 'معايير الاتصالات — هيئة الاتصالات والفضاء والتقنية السعودية',
        body: 'CITC',
        domain: 'الاتصالات',
        maqsad: 'ARD',
        region: 'SA',
    },
];

// ═══════════════════════════════════════════════════════════════
// ⑨ معايير المنهجية العلمية والبحثية
// ═══════════════════════════════════════════════════════════════
const SCIENTIFIC_METHODOLOGY = [
    {
        id: 'PRISMA',
        nameEn: 'PRISMA — Preferred Reporting Items for Systematic Reviews',
        nameAr: 'منهجية التقارير المفضّلة للمراجعات المنهجية',
        body: 'PRISMA',
        domain: 'البحث العلمي',
        maqsad: 'AQL',
        quranic_ref: { ref: 'العلق:١', text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ' },
    },
    {
        id: 'CONSORT',
        nameEn: 'CONSORT — Clinical Trials Reporting',
        nameAr: 'معيار تقارير التجارب السريرية',
        body: 'CONSORT',
        domain: 'البحث الطبي',
        maqsad: 'NAFS',
    },
    {
        id: 'IEEE-CS-STD',
        nameEn: 'IEEE Computer Society Standards',
        nameAr: 'معايير جمعية الحاسبات IEEE للبرمجيات',
        body: 'IEEE',
        domain: 'هندسة البرمجيات',
        maqsad: 'AQL',
    },
    {
        id: 'CMMI-DEV',
        nameEn: 'CMMI for Development',
        nameAr: 'نموذج نضج القدرات المتكامل للتطوير',
        body: 'ISACA',
        domain: 'هندسة البرمجيات',
        maqsad: 'AQL',
        hadith_ref: { ref: 'أحمد:١٢٩٠٢', text: 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه' },
    },
];

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════

module.exports = {
    QUALITY_MANAGEMENT,
    ENVIRONMENTAL_STANDARDS,
    SAFETY_STANDARDS,
    INFORMATION_SECURITY_STANDARDS,
    ENGINEERING_STANDARDS,
    ISLAMIC_FINANCIAL_STANDARDS,
    SUSTAINABILITY_STANDARDS,
    SAUDI_GCC_STANDARDS,
    SCIENTIFIC_METHODOLOGY,

    /** كل المعايير في مصفوفة واحدة */
    ALL_STANDARDS: [
        ...QUALITY_MANAGEMENT,
        ...ENVIRONMENTAL_STANDARDS,
        ...SAFETY_STANDARDS,
        ...INFORMATION_SECURITY_STANDARDS,
        ...ENGINEERING_STANDARDS,
        ...ISLAMIC_FINANCIAL_STANDARDS,
        ...SUSTAINABILITY_STANDARDS,
        ...SAUDI_GCC_STANDARDS,
        ...SCIENTIFIC_METHODOLOGY,
    ],
};
