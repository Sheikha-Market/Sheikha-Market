/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA ORGANIZATIONS VISIONS — رؤى وأهداف الشركات والمؤسسات والمجتمعات ║
 * ║   كل شركة / مؤسسة / مجموعة / مجتمع — مرقّمة بالكتاب والسنة               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ" — المائدة:٢
 * "الله في عون العبد ما كان العبد في عون أخيه" — مسلم:٢٦٩٩
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// ① رؤية شيخة — النموذج الأعلى الموحّد لله
// ═══════════════════════════════════════════════════════════════
const SHEIKHA_VISION = {
    id: 'SHEIKHA',
    nameAr: 'شيخة — السوق الذكي المتكامل',
    nameEn: 'Sheikha — Integrated Smart Market',
    owner: 'سلمان أحمد بن سلمان الراجح',
    role: 'مستشار دولي ومالك شيخة',

    vision: {
        textAr: 'الأفضل بأمر الله — منظومة رقمية متكاملة توحّد التجارة والعلم والحوكمة بالكتاب والسنة',
        textEn: 'Best by God\'s Command — an integrated digital ecosystem unifying trade, knowledge, and governance through Quran & Sunnah',
        quranic_ref: { ref: 'الإسراء:٧٠', text: 'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ' },
    },

    mission: {
        textAr: 'رقمنة كل المعايير والمنهجيات والعلوم والقوانين وتوحيدها لله، وربط الموردين والمشترين بأفضل منظومة ذكاء اصطناعي إسلامية في الكون',
        hadith_ref: { ref: 'أحمد:١٢٩٠٢', text: 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه' },
    },

    goals: [
        { id: 'SHK-G01', nameAr: 'توحيد كل المعايير والمقاييس رقمياً بالكتاب والسنة', kpi: 'STANDARDS_DIGITIZED', target: 1000, maqsad: 'DEEN' },
        { id: 'SHK-G02', nameAr: 'ربط مليون مورد ومشترٍ عالمياً', kpi: 'USERS_CONNECTED', target: 1000000, maqsad: 'MAL' },
        { id: 'SHK-G03', nameAr: 'رقمنة رؤى كل دولة ومنظمة في العالم', kpi: 'VISIONS_DIGITIZED', target: 200, maqsad: 'ARD' },
        { id: 'SHK-G04', nameAr: 'توفير استشارات دولية لكل حكومة بأفضل من رؤيتها', kpi: 'ADVISORY_ENGAGEMENTS', target: 50, maqsad: 'ARD' },
        { id: 'SHK-G05', nameAr: 'الوصول لأفضل منظومة ذكاء اصطناعي إسلامية', kpi: 'AI_RANK_ISLAMIC', target: 1, maqsad: 'AQL' },
    ],

    values: [
        { id: 'V1', nameAr: 'التوحيد', ref: 'الإخلاص:١', text: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
        { id: 'V2', nameAr: 'الإتقان', hadith: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه' },
        { id: 'V3', nameAr: 'العدل', ref: 'النحل:٩٠', text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ' },
        { id: 'V4', nameAr: 'الأمانة', ref: 'النساء:٥٨', text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا' },
        { id: 'V5', nameAr: 'لا ضرر', hadith: 'لا ضرر ولا ضرار' },
    ],
};

// ═══════════════════════════════════════════════════════════════
// ② رؤى الشركات الكبرى (كمرجع للمستشار)
// ═══════════════════════════════════════════════════════════════
const CORPORATIONS_VISIONS = [
    {
        id: 'ARAMCO',
        nameAr: 'أرامكو السعودية',
        nameEn: 'Saudi Aramco',
        sector: 'النفط والطاقة',
        vision: { textAr: 'شركة الطاقة الأكثر قيمة وأماناً في العالم' },
        mission: { textAr: 'تحقيق الاستدامة في قطاع الطاقة وخدمة الاقتصاد العالمي' },
        goals: [
            { id: 'ARAMCO-G01', nameAr: 'صافي انبعاثات صفري ٢٠٥٠', kpi: 'NET_ZERO', target: 2050, maqsad: 'ARD' },
            { id: 'ARAMCO-G02', nameAr: 'تطوير تقنيات الهيدروجين', kpi: 'HYDROGEN_TECH', maqsad: 'ARD' },
        ],
        sheikha_advisory: 'التوجه نحو الطاقة النظيفة واجب شرعي لصون النعمة وحفظ الأرض',
    },
    {
        id: 'STC',
        nameAr: 'شركة الاتصالات السعودية',
        nameEn: 'Saudi Telecom Company (STC)',
        sector: 'الاتصالات والتقنية',
        vision: { textAr: 'أن تكون شركة تقنية رائدة وملهِمة' },
        mission: { textAr: 'تمكين المجتمعات من خلال التقنية المبتكرة' },
        goals: [
            { id: 'STC-G01', nameAr: 'توسيع شبكة ٥G', kpi: '5G_COVERAGE', target: 99, unit: '%', maqsad: 'ARD' },
            { id: 'STC-G02', nameAr: 'قيادة الفضاء والحوسبة السحابية', kpi: 'CLOUD_LEADERSHIP', maqsad: 'AQL' },
        ],
    },
    {
        id: 'SABIC',
        nameAr: 'سابك',
        nameEn: 'Saudi Basic Industries Corporation',
        sector: 'البتروكيماويات',
        vision: { textAr: 'شركة كيماويات رائدة عالمياً وذات مسؤولية' },
        goals: [
            { id: 'SABIC-G01', nameAr: 'الاقتصاد الدائري', kpi: 'CIRCULAR_ECONOMY', maqsad: 'ARD' },
        ],
    },
    {
        id: 'PIF',
        nameAr: 'صندوق الاستثمارات العامة',
        nameEn: 'Public Investment Fund (PIF)',
        sector: 'الاستثمار السيادي',
        vision: { textAr: 'كونه محفزاً لتنويع الاقتصاد الوطني ورائداً للاستثمار العالمي' },
        mission: { textAr: 'تحقيق عوائد مالية طويلة الأمد لتمكين تنويع اقتصاد المملكة' },
        goals: [
            { id: 'PIF-G01', nameAr: 'الوصول إلى ٢ تريليون دولار أصول مُدارة', kpi: 'AUM', target: 2000000000000, unit: 'USD', maqsad: 'MAL' },
            { id: 'PIF-G02', nameAr: 'خلق ١.٨ مليون وظيفة بحلول ٢٠٣٠', kpi: 'JOBS_CREATED', target: 1800000, maqsad: 'MAL' },
        ],
        sheikha_advisory: 'ضمان توافق الاستثمارات مع الأسس الشرعية ودعم الاقتصاد الإسلامي',
        quranic_ref: { ref: 'النساء:٢٩', text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ' },
    },
];

// ═══════════════════════════════════════════════════════════════
// ③ رؤى المؤسسات العلمية والتعليمية
// ═══════════════════════════════════════════════════════════════
const ACADEMIC_INSTITUTION_VISIONS = [
    {
        id: 'KAU',
        nameAr: 'جامعة الملك عبدالعزيز',
        nameEn: 'King Abdulaziz University',
        sector: 'التعليم العالي',
        vision: { textAr: 'جامعة بحثية ريادية عالمياً في خدمة الإسلام والبشرية' },
        mission: { textAr: 'إعداد الكوادر المتميزة وإنتاج المعرفة لخدمة المجتمع' },
        goals: [
            { id: 'KAU-G01', nameAr: 'ضمن أفضل ٥٠ جامعة عالمياً', kpi: 'WORLD_RANK', target: 50, maqsad: 'AQL' },
            { id: 'KAU-G02', nameAr: 'تعميق البحث العلمي الإسلامي', kpi: 'ISLAMIC_RESEARCH', maqsad: 'DEEN' },
        ],
        quranic_ref: { ref: 'المجادلة:١١', text: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ' },
    },
    {
        id: 'KFUPM',
        nameAr: 'جامعة الملك فهد للبترول والمعادن',
        nameEn: 'King Fahd University of Petroleum & Minerals',
        sector: 'التعليم التقني',
        vision: { textAr: 'جامعة بحثية ريادية عالمياً في العلوم والتقنية والهندسة' },
        goals: [
            { id: 'KFUPM-G01', nameAr: 'ريادة البحث في الطاقة', kpi: 'ENERGY_RESEARCH', maqsad: 'ARD' },
            { id: 'KFUPM-G02', nameAr: 'براءات الاختراع التكنولوجية', kpi: 'PATENTS', maqsad: 'AQL' },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════
// ④ رؤى المجتمعات والمجموعات المحلية والدولية
// ═══════════════════════════════════════════════════════════════
const COMMUNITY_VISIONS = [
    {
        id: 'COMM-MUSLIM-MINORITIES',
        nameAr: 'مجتمعات الأقليات المسلمة في الغرب',
        category: 'مجتمع',
        vision: { textAr: 'المسلم مواطن فاعل ومحافظ على هويته الإسلامية في آنٍ واحد' },
        mission: { textAr: 'التمكين الاقتصادي والاجتماعي مع صون الهوية والقيم الإسلامية' },
        goals: [
            { id: 'MM-G01', nameAr: 'الاستقلالية المالية والاقتصادية', kpi: 'ECONOMIC_INDEPENDENCE', maqsad: 'MAL' },
            { id: 'MM-G02', nameAr: 'الحفاظ على الهوية الإسلامية', kpi: 'ISLAMIC_IDENTITY', maqsad: 'DEEN' },
        ],
        quranic_ref: { ref: 'البقرة:١٤٣', text: 'وَكَذَٰلِكَ جَعَلْنَاكُمْ أُمَّةً وَسَطًا' },
    },
    {
        id: 'COMM-ENTREPRENEURS',
        nameAr: 'مجتمع رواد الأعمال المسلمين',
        category: 'مجتمع',
        vision: { textAr: 'ريادة أعمال إسلامية تحقق الفلاح في الدنيا والآخرة' },
        mission: { textAr: 'بناء منظومة أعمال إسلامية متكاملة تخدم الأمة' },
        goals: [
            { id: 'ENT-G01', nameAr: 'تأسيس ١٠٠٠ شركة إسلامية ناجحة', kpi: 'COMPANIES_FOUNDED', target: 1000, maqsad: 'MAL' },
            { id: 'ENT-G02', nameAr: 'التمويل الإسلامي للمشاريع الصغيرة', kpi: 'SME_ISLAMIC_FINANCE', maqsad: 'MAL', quranic_ref: { ref: 'البقرة:٢٧٥', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا' } },
        ],
    },
    {
        id: 'COMM-YOUTH',
        nameAr: 'مجتمع الشباب المسلم',
        category: 'مجتمع',
        vision: { textAr: 'شباب مسلم مؤهَّل رقمياً وشرعياً يقود تحول الأمة' },
        goals: [
            { id: 'YOUTH-G01', nameAr: 'التعليم الرقمي الإسلامي للشباب', kpi: 'YOUTH_DIGITAL_ED', maqsad: 'AQL' },
            { id: 'YOUTH-G02', nameAr: 'توظيف الشباب في التكنولوجيا', kpi: 'YOUTH_TECH_EMPLOYMENT', maqsad: 'MAL' },
        ],
        quranic_ref: { ref: 'الكهف:١٣', text: 'إِنَّهُمْ فِتْيَةٌ آمَنُوا بِرَبِّهِمْ وَزِدْنَاهُمْ هُدًى' },
    },
];

// ═══════════════════════════════════════════════════════════════
// ⑤ قالب توليد رؤية لأي كيان
// ═══════════════════════════════════════════════════════════════
function buildEntityVision({ id, nameAr, nameEn, sector, description }) {
    return {
        id,
        nameAr,
        nameEn,
        sector: sector || 'عام',
        generated: true,
        vision: {
            textAr: `أن يكون ${nameAr} الأفضل في مجاله بما يرضي الله ويخدم الإنسانية`,
            quranic_ref: { ref: 'النحل:٩٠', text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ' },
        },
        mission: {
            textAr: `تقديم ${description || 'خدمات متميزة'} وفق أعلى معايير الجودة والأمانة والإتقان`,
            hadith_ref: { ref: 'أحمد:١٢٩٠٢', text: 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه' },
        },
        goals: [
            { id: `${id}-G01`, nameAr: 'الريادة والتميز في المجال', kpi: 'EXCELLENCE', maqsad: 'MAL' },
            { id: `${id}-G02`, nameAr: 'خدمة المجتمع والمساهمة في التنمية', kpi: 'COMMUNITY_SERVICE', maqsad: 'ARD' },
            { id: `${id}-G03`, nameAr: 'الالتزام بمعايير الأمانة والشفافية', kpi: 'INTEGRITY', maqsad: 'DEEN' },
        ],
        tawheed_ref: { ref: 'الذاريات:٥٦', text: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ' },
        sheikha_advisory: `مستشار دولي — سلمان أحمد الراجح: كل رؤية ناجحة تبدأ بالتوحيد وتنتهي بخدمة الإنسان`,
    };
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    SHEIKHA_VISION,
    CORPORATIONS_VISIONS,
    ACADEMIC_INSTITUTION_VISIONS,
    COMMUNITY_VISIONS,
    buildEntityVision,

    ALL_ENTITIES: [
        SHEIKHA_VISION,
        ...CORPORATIONS_VISIONS,
        ...ACADEMIC_INSTITUTION_VISIONS,
        ...COMMUNITY_VISIONS,
    ],
};
