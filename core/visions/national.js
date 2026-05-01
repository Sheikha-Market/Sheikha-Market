/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║    SHEIKHA NATIONAL VISIONS — رؤى وأهداف ورسائل الدول والمنظمات الدولية   ║
 * ║    مرقّمة بالكتاب والسنة — موحّدة لله سبحانه وتعالى                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ" — الذاريات:٥٦
 * "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ" — النحل:٩٠
 *
 * سلمان أحمد الراجح — مستشار دولي — مالك شيخة
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// أولاً: رؤية المملكة العربية السعودية
// ═══════════════════════════════════════════════════════════════
const SAUDI_VISION = {
    id: 'SA',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Kingdom of Saudi Arabia',
    region: 'الشرق الأوسط',

    vision: {
        id: 'VISION-2030',
        nameAr: 'رؤية المملكة ٢٠٣٠',
        nameEn: 'Saudi Vision 2030',
        year: 2030,
        headline: 'مجتمع حيوي، اقتصاد مزدهر، وطن طموح',
        quranic_ref: { ref: 'الحشر:١٨', text: 'وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ' },
        pillars: [
            { id: 'P1', nameAr: 'مجتمع حيوي', nameEn: 'A Vibrant Society', maqsad: 'NAFS' },
            { id: 'P2', nameAr: 'اقتصاد مزدهر', nameEn: 'A Thriving Economy', maqsad: 'MAL' },
            { id: 'P3', nameAr: 'وطن طموح', nameEn: 'An Ambitious Nation', maqsad: 'ARD' },
        ],
    },

    mission: {
        textAr: 'تحويل المملكة إلى نموذج عالمي ناجح في كل المجالات مع الحفاظ على القيم الإسلامية والهوية الوطنية',
        hadith_ref: { ref: 'أحمد:١٢٩٠٢', text: 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه' },
    },

    goals: [
        { id: 'SA-G01', nameAr: 'رفع مساهمة القطاع الخاص في الناتج المحلي إلى ٦٥٪', kpi: 'GDP_PRIVATE', target: 65, unit: '%', maqsad: 'MAL' },
        { id: 'SA-G02', nameAr: 'رفع نسبة توطين الوظائف (السعودة) إلى ٤٥٪', kpi: 'EMPLOYMENT_SAUDIZATION', target: 45, unit: '%', maqsad: 'MAL' },
        { id: 'SA-G03', nameAr: 'رفع نسبة المرأة في سوق العمل إلى ٣٠٪', kpi: 'WOMEN_WORKFORCE', target: 30, unit: '%', maqsad: 'NASL' },
        { id: 'SA-G04', nameAr: 'تحسين ترتيب المملكة في مؤشر الترفيه إلى أفضل ٢٥ دولة', kpi: 'TOURISM_RANK', target: 25, maqsad: 'NAFS' },
        { id: 'SA-G05', nameAr: 'رفع دخل السياحة إلى ٣٣٪ من الناتج المحلي', kpi: 'TOURISM_GDP', target: 33, unit: '%', maqsad: 'MAL' },
        { id: 'SA-G06', nameAr: 'خفض الاعتماد على النفط — تنويع مصادر الدخل', kpi: 'OIL_DEPENDENCY', target: 50, unit: '% reduction', maqsad: 'MAL' },
        { id: 'SA-G07', nameAr: 'الوصول لأفضل ٥ حكومات رقمية في العالم', kpi: 'E_GOV_RANK', target: 5, maqsad: 'ARD' },
        { id: 'SA-G08', nameAr: 'بناء ١ مليون وحدة سكنية لرفع نسبة تملّك المساكن', kpi: 'HOME_OWNERSHIP', target: 70, unit: '%', maqsad: 'NAFS' },
        { id: 'SA-G09', nameAr: 'الوصول إلى صافي انبعاثات صفري بحلول ٢٠٦٠', kpi: 'CARBON_NET_ZERO', target: 2060, maqsad: 'ARD', quranic_ref: { ref: 'الأعراف:٥٦', text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا' } },
        { id: 'SA-G10', nameAr: 'نيوم — بناء مدينة المستقبل', kpi: 'NEOM_PROGRESS', target: 2030, maqsad: 'ARD' },
    ],

    sheikha_advisory: {
        consultant: 'سلمان أحمد الراجح',
        role: 'مستشار دولي — Sheikha International Advisory',
        enhancements: [
            'ربط مؤشرات رؤية ٢٠٣٠ بالمقاصد الشرعية الخمس',
            'إضافة مؤشرات الأخلاق الاقتصادية الإسلامية (الزكاة، الوقف)',
            'توحيد التقارير الحكومية بمعيار sheikha/v2',
            'تعميق برامج الإسكان والسكن للمواطن',
            'تكامل رؤية ٢٠٣٠ مع رؤى دول الخليج لسوق موحد',
        ],
        tawheed_ref: { ref: 'الذاريات:٥٦', text: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ' },
    },
};

// ═══════════════════════════════════════════════════════════════
// ثانياً: رؤى دول مجلس التعاون الخليجي
// ═══════════════════════════════════════════════════════════════
const GCC_VISIONS = [
    {
        id: 'AE',
        nameAr: 'الإمارات العربية المتحدة',
        nameEn: 'United Arab Emirates',
        vision: { nameAr: 'رؤية الإمارات ٢٠٧١', nameEn: 'UAE Vision 2071', year: 2071, headline: 'أن تصبح الإمارات الدولة الأولى عالمياً في الرضا' },
        mission: { textAr: 'بناء مجتمع متماسك وأمة متمكّنة تُلهم العالم' },
        goals: [
            { id: 'AE-G01', nameAr: 'أفضل اقتصاد معرفي في العالم', kpi: 'KNOWLEDGE_ECONOMY', maqsad: 'AQL' },
            { id: 'AE-G02', nameAr: 'رواد في الذكاء الاصطناعي', kpi: 'AI_LEADERSHIP', maqsad: 'AQL' },
            { id: 'AE-G03', nameAr: 'أعلى جودة حياة في العالم', kpi: 'QUALITY_OF_LIFE', maqsad: 'NAFS' },
        ],
        quranic_ref: { ref: 'الرعد:١١', text: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ' },
    },
    {
        id: 'QA',
        nameAr: 'قطر',
        nameEn: 'Qatar',
        vision: { nameAr: 'رؤية قطر الوطنية ٢٠٣٠', nameEn: 'Qatar National Vision 2030', year: 2030, headline: 'تحويل قطر إلى مجتمع متقدم قادر على التنمية المستدامة' },
        mission: { textAr: 'الموازنة بين التنمية ومتطلبات الجيل الحالي والأجيال القادمة' },
        goals: [
            { id: 'QA-G01', nameAr: 'التنمية البشرية', kpi: 'HUMAN_DEVELOPMENT', maqsad: 'NAFS' },
            { id: 'QA-G02', nameAr: 'الاقتصاد المتنوع', kpi: 'ECONOMIC_DIVERSIFICATION', maqsad: 'MAL' },
            { id: 'QA-G03', nameAr: 'التنمية الاجتماعية', kpi: 'SOCIAL_DEVELOPMENT', maqsad: 'NASL' },
            { id: 'QA-G04', nameAr: 'التنمية البيئية', kpi: 'ENVIRONMENTAL', maqsad: 'ARD' },
        ],
    },
    {
        id: 'KW',
        nameAr: 'الكويت',
        nameEn: 'Kuwait',
        vision: { nameAr: 'رؤية الكويت ٢٠٣٥', nameEn: 'Kuwait Vision 2035 (New Kuwait)', year: 2035, headline: 'الكويت مركز مالي وتجاري عالمي' },
        mission: { textAr: 'تحويل الكويت إلى مركز مالي وتجاري' },
        goals: [
            { id: 'KW-G01', nameAr: 'المركز المالي الإقليمي', kpi: 'FINANCIAL_HUB', maqsad: 'MAL' },
            { id: 'KW-G02', nameAr: 'التنويع الاقتصادي', kpi: 'DIVERSIFICATION', maqsad: 'MAL' },
        ],
    },
    {
        id: 'BH',
        nameAr: 'البحرين',
        nameEn: 'Bahrain',
        vision: { nameAr: 'رؤية البحرين الاقتصادية ٢٠٣٠', nameEn: 'Bahrain Economic Vision 2030', year: 2030, headline: 'من اقتصاد مدفوع بالحكومة إلى اقتصاد مدفوع بالقطاع الخاص' },
        goals: [
            { id: 'BH-G01', nameAr: 'التحول الاقتصادي', kpi: 'ECONOMIC_TRANSFORMATION', maqsad: 'MAL' },
            { id: 'BH-G02', nameAr: 'التنافسية الدولية', kpi: 'GLOBAL_COMPETITIVENESS', maqsad: 'MAL' },
        ],
    },
    {
        id: 'OM',
        nameAr: 'عُمان',
        nameEn: 'Oman',
        vision: { nameAr: 'رؤية عُمان ٢٠٤٠', nameEn: 'Oman Vision 2040', year: 2040, headline: 'تنويع الاقتصاد والارتقاء بجودة الحياة' },
        goals: [
            { id: 'OM-G01', nameAr: 'الاقتصاد المتنوع', kpi: 'DIVERSIFIED_ECONOMY', maqsad: 'MAL' },
            { id: 'OM-G02', nameAr: 'المواطن الفاعل', kpi: 'CITIZEN_EMPOWERMENT', maqsad: 'NAFS' },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════
// ثالثاً: رؤى الدول العربية والإسلامية
// ═══════════════════════════════════════════════════════════════
const ARAB_ISLAMIC_VISIONS = [
    {
        id: 'EG',
        nameAr: 'مصر',
        nameEn: 'Egypt',
        vision: { nameAr: 'رؤية مصر ٢٠٣٠', nameEn: 'Egypt Vision 2030', year: 2030, headline: 'مجتمع متماسك، اقتصاد تنافسي، بيئة مستدامة' },
        goals: [
            { id: 'EG-G01', nameAr: 'التنمية الاقتصادية المستدامة', kpi: 'SUSTAINABLE_GROWTH', maqsad: 'MAL' },
            { id: 'EG-G02', nameAr: 'مصر الرقمية', kpi: 'DIGITAL_EGYPT', maqsad: 'AQL' },
            { id: 'EG-G03', nameAr: 'التنمية البشرية', kpi: 'HDI', maqsad: 'NAFS' },
        ],
    },
    {
        id: 'JO',
        nameAr: 'الأردن',
        nameEn: 'Jordan',
        vision: { nameAr: 'رؤية الأردن ٢٠٢٥', nameEn: 'Jordan 2025', year: 2025, headline: 'نموذج وطني ومرجع إقليمي' },
        goals: [
            { id: 'JO-G01', nameAr: 'الاقتصاد المنافس', kpi: 'COMPETITIVENESS', maqsad: 'MAL' },
            { id: 'JO-G02', nameAr: 'الشمول الاجتماعي', kpi: 'SOCIAL_INCLUSION', maqsad: 'NASL' },
        ],
    },
    {
        id: 'MA',
        nameAr: 'المغرب',
        nameEn: 'Morocco',
        vision: { nameAr: 'المغرب ٢٠٣٠', nameEn: 'Morocco 2030', year: 2030, headline: 'دولة ناشئة ديمقراطية' },
        goals: [
            { id: 'MA-G01', nameAr: 'التحول الرقمي', kpi: 'DIGITAL_TRANSFORMATION', maqsad: 'AQL' },
            { id: 'MA-G02', nameAr: 'الطاقة المتجددة ٥٢٪', kpi: 'RENEWABLE_ENERGY', target: 52, unit: '%', maqsad: 'ARD' },
        ],
    },
    {
        id: 'TR',
        nameAr: 'تركيا',
        nameEn: 'Turkey',
        vision: { nameAr: 'رؤية تركيا ٢٠٢٣', nameEn: 'Turkey Vision 2023', year: 2023, headline: 'من بين العشر اقتصاديات الأولى في العالم' },
        goals: [
            { id: 'TR-G01', nameAr: 'التحول الصناعي التكنولوجي', kpi: 'INDUSTRIAL_TECH', maqsad: 'MAL' },
            { id: 'TR-G02', nameAr: 'الاستقلالية الدفاعية', kpi: 'DEFENSE', maqsad: 'NAFS' },
        ],
    },
    {
        id: 'MY',
        nameAr: 'ماليزيا',
        nameEn: 'Malaysia',
        vision: { nameAr: 'رؤية ماليزيا المزدهرة', nameEn: 'Shared Prosperity Vision 2030', year: 2030, headline: 'دولة مزدهرة وعادلة ومتآلفة' },
        goals: [
            { id: 'MY-G01', nameAr: 'الاقتصاد الرقمي الإسلامي', kpi: 'ISLAMIC_DIGITAL_ECONOMY', maqsad: 'MAL' },
            { id: 'MY-G02', nameAr: 'الرعاية الاجتماعية الشاملة', kpi: 'SOCIAL_WELFARE', maqsad: 'NAFS' },
        ],
    },
    {
        id: 'ID',
        nameAr: 'إندونيسيا',
        nameEn: 'Indonesia',
        vision: { nameAr: 'إندونيسيا ذهبية ٢١٠٠', nameEn: 'Golden Indonesia 2045', year: 2045, headline: 'اقتصاد متقدم وسيادة ولياقة' },
        goals: [
            { id: 'ID-G01', nameAr: 'تنمية الموارد البشرية', kpi: 'HUMAN_CAPITAL', maqsad: 'NAFS' },
            { id: 'ID-G02', nameAr: 'الاقتصاد الرابع عالمياً', kpi: 'ECONOMY_RANK', target: 4, maqsad: 'MAL' },
        ],
    },
    {
        id: 'PK',
        nameAr: 'باكستان',
        nameEn: 'Pakistan',
        vision: { nameAr: 'باكستان ٢٠٢٥', nameEn: 'Pakistan Vision 2025', year: 2025, headline: 'أمة متماسكة، ديناميكية، ومزدهرة' },
        goals: [
            { id: 'PK-G01', nameAr: 'الاقتصاد الإسلامي', kpi: 'ISLAMIC_FINANCE', maqsad: 'MAL' },
            { id: 'PK-G02', nameAr: 'الطاقة والبنية التحتية', kpi: 'ENERGY_INFRA', maqsad: 'ARD' },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════
// رابعاً: رؤى الدول المتقدمة (مرجعية المستشار)
// ═══════════════════════════════════════════════════════════════
const ADVANCED_NATIONS_VISIONS = [
    {
        id: 'US',
        nameAr: 'الولايات المتحدة',
        nameEn: 'United States',
        vision: { nameAr: 'أجندة البنية التحتية والابتكار', nameEn: 'Bipartisan Infrastructure & Innovation Agenda', year: 2030 },
        goals: [
            { id: 'US-G01', nameAr: 'الريادة في الذكاء الاصطناعي', kpi: 'AI_SUPREMACY', maqsad: 'AQL' },
            { id: 'US-G02', nameAr: 'البنية التحتية الرقمية', kpi: 'DIGITAL_INFRA', maqsad: 'ARD' },
        ],
        sheikha_note: 'نستفيد من التقنية مع تصفية ما يخالف الشريعة',
    },
    {
        id: 'CN',
        nameAr: 'الصين',
        nameEn: 'China',
        vision: { nameAr: 'الصين ٢٠٤٩ — الحلم الصيني', nameEn: 'China 2049 — Chinese Dream', year: 2049 },
        goals: [
            { id: 'CN-G01', nameAr: 'الاكتفاء التكنولوجي الذاتي', kpi: 'TECH_SELF_SUFFICIENCY', maqsad: 'AQL' },
            { id: 'CN-G02', nameAr: 'الحزام والطريق', kpi: 'BRI', maqsad: 'MAL' },
        ],
        sheikha_note: 'الشراكات الإنتاجية مع تجنّب الاستغلال والتبعية',
    },
    {
        id: 'SG',
        nameAr: 'سنغافورة',
        nameEn: 'Singapore',
        vision: { nameAr: 'سنغافورة الذكية ٢٠٣٠', nameEn: 'Smart Nation 2030', year: 2030, headline: 'أذكى أمة في العالم' },
        goals: [
            { id: 'SG-G01', nameAr: 'الحكومة الرقمية الكاملة', kpi: 'FULL_DIGITAL_GOV', maqsad: 'ARD' },
            { id: 'SG-G02', nameAr: 'النمو الاقتصادي المستدام', kpi: 'SUSTAINABLE_GROWTH', maqsad: 'MAL' },
        ],
        sheikha_note: 'نموذج للكفاءة الحكومية الرقمية يمكن تكييفه إسلامياً',
    },
    {
        id: 'JP',
        nameAr: 'اليابان',
        nameEn: 'Japan',
        vision: { nameAr: 'مجتمع ٥.٠ — المجتمع الفائق', nameEn: 'Society 5.0', year: 2050 },
        goals: [
            { id: 'JP-G01', nameAr: 'دمج الفضاء الافتراضي والمادي', kpi: 'CYBERSPACE_INTEGRATION', maqsad: 'AQL' },
            { id: 'JP-G02', nameAr: 'اقتصاد يتمحور حول الإنسان', kpi: 'HUMAN_CENTERED', maqsad: 'NAFS' },
        ],
        sheikha_note: 'إتقان العمل وخدمة الإنسان أصيل في الإسلام',
    },
    {
        id: 'DE',
        nameAr: 'ألمانيا',
        nameEn: 'Germany',
        vision: { nameAr: 'الاستراتيجية الرقمية الألمانية ٢٠٣٠', nameEn: 'Digital Strategy Germany 2030', year: 2030 },
        goals: [
            { id: 'DE-G01', nameAr: 'الصناعة ٤.٠', kpi: 'INDUSTRY_4', maqsad: 'MAL' },
            { id: 'DE-G02', nameAr: 'الحياد المناخي', kpi: 'CLIMATE_NEUTRAL', maqsad: 'ARD' },
        ],
    },
    {
        id: 'KR',
        nameAr: 'كوريا الجنوبية',
        nameEn: 'South Korea',
        vision: { nameAr: 'الصفقة الجديدة الكورية الرقمية ٢٠٣٠', nameEn: 'Korean Digital New Deal', year: 2030 },
        goals: [
            { id: 'KR-G01', nameAr: 'الديناميكيات المبتكرة', kpi: 'INNOVATION_DYNAMICS', maqsad: 'AQL' },
            { id: 'KR-G02', nameAr: 'البنية التحتية الرقمية', kpi: 'DIGITAL_INFRA', maqsad: 'ARD' },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════
// خامساً: رؤى المنظمات الدولية
// ═══════════════════════════════════════════════════════════════
const INTERNATIONAL_ORG_VISIONS = [
    {
        id: 'UN',
        nameAr: 'الأمم المتحدة',
        nameEn: 'United Nations',
        vision: { nameAr: 'أجندة ٢٠٣٠ — التنمية المستدامة', nameEn: 'UN 2030 Agenda — Sustainable Development', year: 2030 },
        mission: { textAr: 'إنقاذ الأجيال القادمة من ويلات الحرب وتعزيز التنمية الشاملة' },
        goals_count: 17,
        goals: [
            { id: 'SDG-1', nameAr: 'لا للفقر', nameEn: 'No Poverty', maqsad: 'MAL', quranic_ref: { ref: 'التوبة:٦٠', text: 'إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ' } },
            { id: 'SDG-2', nameAr: 'لا للجوع', nameEn: 'Zero Hunger', maqsad: 'NAFS' },
            { id: 'SDG-3', nameAr: 'الصحة الجيدة', nameEn: 'Good Health', maqsad: 'NAFS', quranic_ref: { ref: 'المائدة:٣٢', text: 'مَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا' } },
            { id: 'SDG-4', nameAr: 'التعليم الجيد', nameEn: 'Quality Education', maqsad: 'AQL', quranic_ref: { ref: 'العلق:١', text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ' } },
            { id: 'SDG-5', nameAr: 'المساواة بين الجنسين', nameEn: 'Gender Equality', maqsad: 'NASL', note: 'وفق المنظور الإسلامي المتوازن' },
            { id: 'SDG-6', nameAr: 'المياه النظيفة', nameEn: 'Clean Water', maqsad: 'NAFS', hadith_ref: { ref: 'الترمذي:١٩٦٨', text: 'المسلمون شركاء في ثلاثة: الماء والكلأ والنار' } },
            { id: 'SDG-7', nameAr: 'طاقة نظيفة وبأسعار معقولة', nameEn: 'Clean Energy', maqsad: 'ARD' },
            { id: 'SDG-8', nameAr: 'العمل اللائق والنمو الاقتصادي', nameEn: 'Decent Work', maqsad: 'MAL' },
            { id: 'SDG-9', nameAr: 'الصناعة والابتكار والبنية التحتية', nameEn: 'Industry & Innovation', maqsad: 'ARD' },
            { id: 'SDG-10', nameAr: 'الحد من عدم المساواة', nameEn: 'Reduced Inequalities', maqsad: 'MAL' },
            { id: 'SDG-11', nameAr: 'المدن والمجتمعات المستدامة', nameEn: 'Sustainable Cities', maqsad: 'ARD' },
            { id: 'SDG-12', nameAr: 'الاستهلاك والإنتاج المسؤول', nameEn: 'Responsible Consumption', maqsad: 'MAL', quranic_ref: { ref: 'الأعراف:٣١', text: 'وَلَا تُسْرِفُوا' } },
            { id: 'SDG-13', nameAr: 'العمل المناخي', nameEn: 'Climate Action', maqsad: 'ARD', quranic_ref: { ref: 'الأعراف:٥٦', text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ' } },
            { id: 'SDG-14', nameAr: 'الحياة تحت الماء', nameEn: 'Life Below Water', maqsad: 'ARD' },
            { id: 'SDG-15', nameAr: 'الحياة في البر', nameEn: 'Life on Land', maqsad: 'ARD' },
            { id: 'SDG-16', nameAr: 'السلام والعدالة', nameEn: 'Peace & Justice', maqsad: 'DEEN', quranic_ref: { ref: 'المائدة:٨', text: 'اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ' } },
            { id: 'SDG-17', nameAr: 'شراكات من أجل الأهداف', nameEn: 'Partnerships', maqsad: 'MAL', quranic_ref: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' } },
        ],
        sheikha_advisory: {
            enhancement: 'ربط أهداف التنمية المستدامة بمقاصد الشريعة الإسلامية — الإسلام سبق الأمم المتحدة بقرون في تحقيق هذه الأهداف',
        },
    },
    {
        id: 'OIC',
        nameAr: 'منظمة التعاون الإسلامي',
        nameEn: 'Organisation of Islamic Cooperation',
        vision: { nameAr: 'أجندة عمل الإسلام ٢٠٢٥', nameEn: 'OIC Agenda 2025', year: 2025 },
        mission: { textAr: 'تعزيز التضامن الإسلامي وحماية مصالح العالم الإسلامي والدفاع عن القضايا الإسلامية' },
        goals: [
            { id: 'OIC-G01', nameAr: 'تعزيز الهوية الإسلامية', kpi: 'ISLAMIC_IDENTITY', maqsad: 'DEEN' },
            { id: 'OIC-G02', nameAr: 'التكامل الاقتصادي الإسلامي', kpi: 'ISLAMIC_ECONOMIC_INTEGRATION', maqsad: 'MAL' },
            { id: 'OIC-G03', nameAr: 'حماية حقوق المسلمين في الدول غير الإسلامية', kpi: 'MUSLIM_RIGHTS', maqsad: 'NAFS' },
        ],
        quranic_ref: { ref: 'آل عمران:١٠٣', text: 'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا' },
    },
    {
        id: 'WB',
        nameAr: 'البنك الدولي',
        nameEn: 'World Bank',
        vision: { nameAr: 'عالم خالٍ من الفقر على كوكب صالح للعيش', nameEn: 'A World Free of Poverty on a Livable Planet', year: 2030 },
        mission: { textAr: 'القضاء على الفقر المدقع وتعزيز الرخاء المشترك' },
        goals: [
            { id: 'WB-G01', nameAr: 'تخفيض الفقر المدقع إلى ٣٪', kpi: 'EXTREME_POVERTY', target: 3, unit: '%', maqsad: 'MAL' },
            { id: 'WB-G02', nameAr: 'تمكين الفئات الهشة', kpi: 'VULNERABLE_EMPOWERMENT', maqsad: 'NAFS' },
        ],
    },
    {
        id: 'IMF',
        nameAr: 'صندوق النقد الدولي',
        nameEn: 'International Monetary Fund',
        mission: { textAr: 'ضمان استقرار النظام النقدي الدولي' },
        goals: [
            { id: 'IMF-G01', nameAr: 'الاستقرار المالي الدولي', kpi: 'FINANCIAL_STABILITY', maqsad: 'MAL' },
            { id: 'IMF-G02', nameAr: 'النمو الاقتصادي المستدام', kpi: 'SUSTAINABLE_GROWTH', maqsad: 'MAL' },
        ],
        sheikha_note: 'الفائدة (الربا) في صلب IMF — الاستفادة من التحليل مع الالتزام بالبديل الإسلامي',
    },
    {
        id: 'WHO',
        nameAr: 'منظمة الصحة العالمية',
        nameEn: 'World Health Organization',
        vision: { nameAr: 'عالم يتمتع فيه الجميع بأقصى مستويات الصحة', year: 2030 },
        mission: { textAr: 'تعزيز الصحة والحفاظ على سلامة العالم وخدمة الضعفاء' },
        goals: [
            { id: 'WHO-G01', nameAr: 'التغطية الصحية الشاملة', kpi: 'UHC', maqsad: 'NAFS' },
            { id: 'WHO-G02', nameAr: 'حماية البشر من الأوبئة', kpi: 'EPIDEMIC_PROTECTION', maqsad: 'NAFS', quranic_ref: { ref: 'المائدة:٣٢', text: 'مَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا' } },
        ],
    },
    {
        id: 'GCC-ORG',
        nameAr: 'مجلس التعاون لدول الخليج العربي',
        nameEn: 'Gulf Cooperation Council',
        vision: { nameAr: 'رؤية التكامل الخليجي ٢٠٣٠', year: 2030 },
        mission: { textAr: 'تحقيق التنسيق والتكامل والترابط بين الدول الأعضاء' },
        goals: [
            { id: 'GCC-G01', nameAr: 'السوق الخليجية المشتركة الكاملة', kpi: 'COMMON_MARKET', maqsad: 'MAL' },
            { id: 'GCC-G02', nameAr: 'العملة الخليجية الموحدة', kpi: 'GCC_CURRENCY', maqsad: 'MAL' },
            { id: 'GCC-G03', nameAr: 'الأمن المشترك', kpi: 'COLLECTIVE_SECURITY', maqsad: 'NAFS' },
        ],
        quranic_ref: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
    },
];

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    SAUDI_VISION,
    GCC_VISIONS,
    ARAB_ISLAMIC_VISIONS,
    ADVANCED_NATIONS_VISIONS,
    INTERNATIONAL_ORG_VISIONS,

    ALL_VISIONS: [
        SAUDI_VISION,
        ...GCC_VISIONS,
        ...ARAB_ISLAMIC_VISIONS,
        ...ADVANCED_NATIONS_VISIONS,
        ...INTERNATIONAL_ORG_VISIONS,
    ],
};
