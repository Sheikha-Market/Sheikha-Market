/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     SHEIKHA LEGAL FRAMEWORKS — الأطر القانونية الدولية والمحلية             ║
 * ║     قوانين + اتفاقيات + معاهدات + منظمات — مرقّمة بالكتاب والسنة           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ" — النساء:٥٩
 * "العقود بالشروط والشرط الصحيح ما وافق الكتاب والسنة" — الفقه الإسلامي
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// ① القوانين المحلية السعودية
// ═══════════════════════════════════════════════════════════════
const SAUDI_LAWS = [
    {
        id: 'SA-COMMERCE',
        nameAr: 'نظام التجارة السعودي',
        nameEn: 'Saudi Commerce Regulation',
        issuer: 'الحكومة السعودية',
        domain: 'التجارة',
        maqsad: 'MAL',
        quranic_ref: { ref: 'النساء:٢٩', text: 'لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ' },
    },
    {
        id: 'SA-COMPANY',
        nameAr: 'نظام الشركات السعودي',
        nameEn: 'Saudi Companies Law',
        issuer: 'وزارة التجارة — السعودية',
        domain: 'الشركات',
        maqsad: 'MAL',
    },
    {
        id: 'SA-LABOR',
        nameAr: 'نظام العمل السعودي',
        nameEn: 'Saudi Labor Law',
        issuer: 'وزارة الموارد البشرية — السعودية',
        domain: 'العمل والتوظيف',
        maqsad: 'NAFS',
        quranic_ref: { ref: 'القصص:٢٦', text: 'إِنَّ خَيْرَ مَنِ اسْتَأْجَرْتَ الْقَوِيُّ الْأَمِينُ' },
    },
    {
        id: 'SA-ANTI-MONEY',
        nameAr: 'نظام مكافحة غسل الأموال السعودي',
        nameEn: 'Saudi AML Law',
        issuer: 'رئاسة أمن الدولة — السعودية',
        domain: 'غسيل الأموال',
        maqsad: 'MAL',
    },
    {
        id: 'SA-ECOMMERCE',
        nameAr: 'نظام التجارة الإلكترونية السعودي',
        nameEn: 'Saudi E-Commerce Law',
        issuer: 'وزارة التجارة — السعودية',
        domain: 'التجارة الإلكترونية',
        maqsad: 'MAL',
    },
    {
        id: 'SA-CYBER',
        nameAr: 'نظام مكافحة الجرائم المعلوماتية السعودي',
        nameEn: 'Saudi Anti-Cybercrime Law',
        issuer: 'الحكومة السعودية',
        domain: 'الجرائم الإلكترونية',
        maqsad: 'AQL',
    },
    {
        id: 'SA-PDPL',
        nameAr: 'نظام حماية البيانات الشخصية السعودي',
        nameEn: 'Saudi Personal Data Protection Law (PDPL)',
        issuer: 'الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA)',
        domain: 'حماية البيانات',
        maqsad: 'AQL',
        quranic_ref: { ref: 'الحجرات:١٢', text: 'وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا' },
    },
    {
        id: 'SA-ZAKAT-LAW',
        nameAr: 'نظام الزكاة والضريبة والجمارك السعودي',
        nameEn: 'Saudi Zakat, Tax and Customs Authority Regulation',
        issuer: 'هيئة الزكاة والضريبة والجمارك (ZATCA)',
        domain: 'الزكاة والضريبة',
        maqsad: 'MAL',
        quranic_ref: { ref: 'التوبة:١٠٣', text: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ' },
    },
    {
        id: 'SA-COMPETITION',
        nameAr: 'نظام المنافسة السعودي',
        nameEn: 'Saudi Competition Law',
        issuer: 'الهيئة العامة للمنافسة — السعودية',
        domain: 'المنافسة التجارية',
        maqsad: 'MAL',
    },
];

// ═══════════════════════════════════════════════════════════════
// ② الاتفاقيات الإقليمية — GCC + الجامعة العربية + OIC
// ═══════════════════════════════════════════════════════════════
const REGIONAL_AGREEMENTS = [
    {
        id: 'GCC-CUSTOMS',
        nameAr: 'الاتحاد الجمركي لمجلس التعاون الخليجي',
        nameEn: 'GCC Customs Union',
        parties: 'دول مجلس التعاون الخليجي الست',
        domain: 'الجمارك والتجارة',
        maqsad: 'MAL',
        quranic_ref: { ref: 'الحجرات:١٣', text: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا' },
    },
    {
        id: 'GCC-COMMON-MARKET',
        nameAr: 'السوق الخليجية المشتركة',
        nameEn: 'GCC Common Market',
        parties: 'دول مجلس التعاون الخليجي الست',
        domain: 'التكامل الاقتصادي',
        maqsad: 'MAL',
    },
    {
        id: 'ARAB-FREE-TRADE',
        nameAr: 'منطقة التجارة الحرة العربية الكبرى (GAFTA)',
        nameEn: 'Greater Arab Free Trade Area',
        parties: 'الدول الأعضاء في جامعة الدول العربية',
        domain: 'التجارة الحرة',
        maqsad: 'MAL',
        year: 1998,
    },
    {
        id: 'OIC-TRADE',
        nameAr: 'الإطار الاقتصادي لمنظمة التعاون الإسلامي',
        nameEn: 'OIC Trade Cooperation Framework',
        parties: '٥٧ دولة عضو في منظمة التعاون الإسلامي',
        domain: 'التعاون الاقتصادي الإسلامي',
        maqsad: 'MAL',
        quranic_ref: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
    },
    {
        id: 'COMESA',
        nameAr: 'السوق المشتركة لشرق وجنوب أفريقيا',
        nameEn: 'Common Market for Eastern and Southern Africa',
        domain: 'التجارة الأفريقية',
        maqsad: 'MAL',
        region: 'AF',
    },
];

// ═══════════════════════════════════════════════════════════════
// ③ الاتفاقيات الدولية — WTO + UN + UNCITRAL
// ═══════════════════════════════════════════════════════════════
const INTERNATIONAL_AGREEMENTS = [
    {
        id: 'WTO-GATT',
        nameAr: 'الاتفاقية العامة للتعريفات الجمركية والتجارة (GATT / WTO)',
        nameEn: 'WTO General Agreement on Tariffs and Trade',
        body: 'WTO',
        domain: 'التجارة الدولية',
        maqsad: 'MAL',
    },
    {
        id: 'WTO-TBT',
        nameAr: 'اتفاقية العوائق التقنية أمام التجارة',
        nameEn: 'WTO Agreement on Technical Barriers to Trade',
        body: 'WTO',
        domain: 'المعايير الفنية والتجارة',
        maqsad: 'MAL',
    },
    {
        id: 'WTO-TFA',
        nameAr: 'اتفاقية تيسير التجارة (WTO-TFA)',
        nameEn: 'WTO Trade Facilitation Agreement',
        body: 'WTO',
        domain: 'تيسير التجارة والجمارك',
        maqsad: 'MAL',
        year: 2017,
    },
    {
        id: 'CISG',
        nameAr: 'اتفاقية الأمم المتحدة بشأن عقود البيع الدولي للبضائع',
        nameEn: 'UN Convention on Contracts for the International Sale of Goods',
        body: 'UNCITRAL / UN',
        domain: 'عقود البيع الدولي',
        maqsad: 'MAL',
        quranic_ref: { ref: 'النساء:٢٩', text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ' },
        note: 'يُطبّق بعد تصفيته من المحظورات الشرعية',
    },
    {
        id: 'INCOTERMS-2020',
        nameAr: 'قواعد الإنكوترمز ٢٠٢٠ للتجارة الدولية',
        nameEn: 'Incoterms 2020 — International Commerce Terms',
        body: 'ICC',
        domain: 'نقل البضائع',
        maqsad: 'MAL',
        year: 2020,
    },
    {
        id: 'PARIS-AGREEMENT',
        nameAr: 'اتفاقية باريس للمناخ',
        nameEn: 'Paris Agreement on Climate Change',
        body: 'UNFCCC',
        domain: 'المناخ والبيئة',
        maqsad: 'ARD',
        quranic_ref: { ref: 'الأعراف:٥٦', text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا' },
        year: 2016,
    },
    {
        id: 'UNCRC',
        nameAr: 'اتفاقية حقوق الطفل (الأمم المتحدة)',
        nameEn: 'UN Convention on the Rights of the Child',
        body: 'UN',
        domain: 'حقوق الطفل',
        maqsad: 'NASL',
        quranic_ref: { ref: 'النساء:٩', text: 'وَلْيَخْشَ الَّذِينَ لَوْ تَرَكُوا مِنْ خَلْفِهِمْ ذُرِّيَّةً ضِعَافًا خَافُوا عَلَيْهِمْ' },
        note: 'يُطبّق مع مراعاة أحكام الشريعة الإسلامية',
    },
    {
        id: 'ILO-CORE',
        nameAr: 'اتفاقيات منظمة العمل الدولية الأساسية',
        nameEn: 'ILO Core Labour Standards',
        body: 'ILO',
        domain: 'حقوق العمال',
        maqsad: 'NAFS',
        quranic_ref: { ref: 'القصص:٢٦', text: 'إِنَّ خَيْرَ مَنِ اسْتَأْجَرْتَ الْقَوِيُّ الْأَمِينُ' },
    },
    {
        id: 'GDPR-EU',
        nameAr: 'اللائحة الأوروبية لحماية البيانات (GDPR)',
        nameEn: 'EU General Data Protection Regulation',
        body: 'EU',
        domain: 'حماية البيانات',
        maqsad: 'AQL',
        region: 'EU',
        quranic_ref: { ref: 'الحجرات:١٢', text: 'وَلَا تَجَسَّسُوا' },
    },
    {
        id: 'BASEL-III',
        nameAr: 'اتفاقية بازل الثالثة للرقابة المصرفية',
        nameEn: 'Basel III Banking Regulation',
        body: 'BCBS / BIS',
        domain: 'الرقابة المصرفية',
        maqsad: 'MAL',
        note: 'تُطبّق المصارف الإسلامية بديلها من معايير IFSB',
    },
    {
        id: 'FATF-REC',
        nameAr: 'توصيات مجموعة العمل المالي (FATF) لمكافحة غسل الأموال',
        nameEn: 'FATF 40 Recommendations — AML / CFT',
        body: 'FATF',
        domain: 'مكافحة غسيل الأموال وتمويل الإرهاب',
        maqsad: 'MAL',
        year: 2012,
    },
];

// ═══════════════════════════════════════════════════════════════
// ④ المنظمات الدولية المعيارية
// ═══════════════════════════════════════════════════════════════
const INTERNATIONAL_BODIES = [
    { id: 'ISO',      nameAr: 'المنظمة الدولية للتوحيد القياسي',          domain: 'معايير عامة',              website: 'iso.org'      },
    { id: 'IEC',      nameAr: 'اللجنة الكهروتقنية الدولية',               domain: 'الكهرباء والإلكترونيات',   website: 'iec.ch'       },
    { id: 'ITU',      nameAr: 'الاتحاد الدولي للاتصالات',                 domain: 'الاتصالات',                website: 'itu.int'      },
    { id: 'IEEE',     nameAr: 'معهد المهندسين الكهربائيين والإلكترونيين', domain: 'الهندسة والتقنية',         website: 'ieee.org'     },
    { id: 'ASTM',     nameAr: 'جمعية الاختبارات والمواد الأمريكية',       domain: 'مواد واختبارات',           website: 'astm.org'     },
    { id: 'AAOIFI',   nameAr: 'هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية', domain: 'المالية الإسلامية', website: 'aaoifi.com' },
    { id: 'IFSB',     nameAr: 'مجلس الخدمات المالية الإسلامية',          domain: 'الرقابة المالية الإسلامية', website: 'ifsb.org'   },
    { id: 'WTO',      nameAr: 'منظمة التجارة العالمية',                   domain: 'التجارة الدولية',          website: 'wto.org'      },
    { id: 'UN',       nameAr: 'الأمم المتحدة',                            domain: 'الشؤون الدولية',           website: 'un.org'       },
    { id: 'ILO',      nameAr: 'منظمة العمل الدولية',                      domain: 'العمل',                    website: 'ilo.org'      },
    { id: 'OIC',      nameAr: 'منظمة التعاون الإسلامي',                   domain: 'العالم الإسلامي',          website: 'oic-oci.org'  },
    { id: 'GCC',      nameAr: 'مجلس التعاون لدول الخليج العربي',          domain: 'الخليج',                   website: 'gcc-sg.org'   },
    { id: 'SASO',     nameAr: 'هيئة المواصفات والمقاييس والجودة السعودية', domain: 'المعايير السعودية',        website: 'saso.gov.sa'  },
    { id: 'GSO',      nameAr: 'هيئة التقييس لدول مجلس التعاون الخليجي',  domain: 'المعايير الخليجية',        website: 'gso.org.sa'   },
    { id: 'ZATCA',    nameAr: 'هيئة الزكاة والضريبة والجمارك',            domain: 'الزكاة والضريبة',          website: 'zatca.gov.sa' },
    { id: 'NCA-SA',   nameAr: 'الهيئة الوطنية للأمن السيبراني',          domain: 'الأمن السيبراني',          website: 'nca.gov.sa'   },
    { id: 'SDAIA',    nameAr: 'الهيئة السعودية للبيانات والذكاء الاصطناعي', domain: 'البيانات والذكاء الاصطناعي', website: 'sdaia.gov.sa' },
];

// ═══════════════════════════════════════════════════════════════
// ⑤ الاتفاقيات الثنائية والتجارية بين المملكة والدول
// ═══════════════════════════════════════════════════════════════
const BILATERAL_AGREEMENTS = [
    {
        id: 'SA-CN-BRI',
        nameAr: 'اتفاقيات الشراكة السعودية-الصينية (مبادرة الحزام والطريق)',
        parties: ['المملكة العربية السعودية', 'جمهورية الصين الشعبية'],
        domain: 'التجارة والبنية التحتية',
        maqsad: 'MAL',
    },
    {
        id: 'SA-US-FDI',
        nameAr: 'اتفاقية الاستثمار الأمريكي-السعودي',
        parties: ['المملكة العربية السعودية', 'الولايات المتحدة'],
        domain: 'الاستثمار الأجنبي المباشر',
        maqsad: 'MAL',
    },
    {
        id: 'SA-EU-TRADE',
        nameAr: 'اتفاقيات التجارة بين المملكة والاتحاد الأوروبي',
        parties: ['المملكة العربية السعودية', 'الاتحاد الأوروبي'],
        domain: 'التجارة',
        maqsad: 'MAL',
    },
    {
        id: 'GCC-UK-FTA',
        nameAr: 'اتفاقية التجارة الحرة بين دول مجلس التعاون والمملكة المتحدة',
        parties: ['دول مجلس التعاون الخليجي', 'المملكة المتحدة'],
        domain: 'التجارة الحرة',
        maqsad: 'MAL',
    },
    {
        id: 'GCC-INDIA-TRADE',
        nameAr: 'اتفاقيات التجارة الخليجية-الهندية',
        parties: ['دول مجلس التعاون الخليجي', 'الهند'],
        domain: 'التجارة',
        maqsad: 'MAL',
    },
];

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════

module.exports = {
    SAUDI_LAWS,
    REGIONAL_AGREEMENTS,
    INTERNATIONAL_AGREEMENTS,
    INTERNATIONAL_BODIES,
    BILATERAL_AGREEMENTS,

    ALL_LEGAL: [
        ...SAUDI_LAWS,
        ...REGIONAL_AGREEMENTS,
        ...INTERNATIONAL_AGREEMENTS,
        ...BILATERAL_AGREEMENTS,
    ],
};
