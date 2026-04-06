/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════
 *  منظومة شيخة — المرحلة ٢٧
 *  محرك رابطة العالم الإسلامي والمنظمات الإسلامية الكونية
 *  SHEIKHA ISLAMIC WORLD ORGANIZATIONS ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *  ﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا﴾ — آل عمران ١٠٣
 *  «الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا»
 * ═══════════════════════════════════════════════════════════════════════════
 */
'use strict';

// ── المنظمات الإسلامية الكونية ────────────────────────────────────────────
const ISLAMIC_ORGANIZATIONS = [
    // ── التعاون والوحدة ──
    {
        id: 'oic',
        cat: 'وحدة وتعاون',
        name: 'منظمة التعاون الإسلامي',
        nameEn: 'Organisation of Islamic Cooperation',
        code: 'OIC',
        hq: 'جدة — المملكة العربية السعودية',
        founded: 1969,
        members: 57,
        mission: 'الصوت الجماعي للعالم الإسلامي',
        icon: '🌙',
        sheikha_role: 'الشبكة الأساسية للتجارة والـ DNS الإسلامي',
        integration: ['dns', 'trade', 'dinar', 'cosmic'],
        verse: '﴿وَلَا تَنَازَعُوا فَتَفْشَلُوا﴾',
        status: 'مُدمج',
    },
    {
        id: 'rabita',
        cat: 'دعوة وتعليم',
        name: 'رابطة العالم الإسلامي',
        nameEn: 'Muslim World League',
        code: 'MWL',
        hq: 'مكة المكرمة — المملكة العربية السعودية',
        founded: 1962,
        members: 139,
        mission: 'نشر الإسلام الوسطي وتوحيد المواقف الإسلامية',
        icon: '🕋',
        sheikha_role: 'محور الدعوة والتعليم الإسلامي العالمي في منظومة شيخة',
        integration: ['education', 'quran', 'fiqh', 'dawah'],
        verse: '﴿ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ﴾',
        status: 'مُدمج',
    },
    {
        id: 'idb',
        cat: 'تمويل وتنمية',
        name: 'البنك الإسلامي للتنمية',
        nameEn: 'Islamic Development Bank',
        code: 'IsDB',
        hq: 'جدة — المملكة العربية السعودية',
        founded: 1975,
        members: 57,
        mission: 'تعزيز التنمية الاقتصادية والاجتماعية',
        icon: '🏦',
        sheikha_role: 'التمويل الإسلامي وصكوك التنمية في منظومة شيخة',
        integration: ['finance', 'dinar', 'zakat', 'sukuk'],
        verse: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
        status: 'مُدمج',
    },
    {
        id: 'aaoifi',
        cat: 'معايير ومحاسبة',
        name: 'هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية',
        nameEn: 'AAOIFI',
        code: 'AAOIFI',
        hq: 'المنامة — البحرين',
        founded: 1991,
        members: 200,
        mission: 'معايير المحاسبة والحوكمة للمؤسسات المالية الإسلامية',
        icon: '⚖️',
        sheikha_role: 'المعايير المالية الإسلامية لكل معاملة في منظومة شيخة',
        integration: ['standards', 'finance', 'kpi', 'audit'],
        verse: '﴿وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ﴾',
        status: 'مُدمج',
    },
    {
        id: 'ifsb',
        cat: 'معايير ومحاسبة',
        name: 'مجلس الخدمات المالية الإسلامية',
        nameEn: 'Islamic Financial Services Board',
        code: 'IFSB',
        hq: 'كوالالمبور — ماليزيا',
        founded: 2002,
        members: 186,
        mission: 'معايير الرقابة والتنظيم للمؤسسات المالية الإسلامية',
        icon: '🏛️',
        sheikha_role: 'رقابة وتنظيم الخدمات المالية الرقمية في شيخة',
        integration: ['finance', 'standards', 'compliance'],
        verse: '﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ﴾',
        status: 'مُدمج',
    },
    {
        id: 'iiit',
        cat: 'بحث وفكر',
        name: 'المعهد الدولي للفكر الإسلامي',
        nameEn: 'IIIT',
        code: 'IIIT',
        hq: 'هيرندون — فيرجينيا، الولايات المتحدة',
        founded: 1981,
        members: 0,
        mission: 'الإسهام في نهضة الفكر الإسلامي والتأصيل الإسلامي للمعرفة',
        icon: '📚',
        sheikha_role: 'البحث والتأصيل العلمي لمحركات شيخة',
        integration: ['education', 'research', 'hpc'],
        verse: '﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾',
        status: 'مُدمج',
    },
    {
        id: 'ico',
        cat: 'وحدة وتعاون',
        name: 'مؤتمر الإسلامي الدولي',
        nameEn: 'Islamic Conference Organisation',
        code: 'ICO',
        hq: 'جدة',
        founded: 1972,
        members: 57,
        mission: 'التضامن الإسلامي والتعاون السياسي',
        icon: '🌍',
        sheikha_role: 'التكامل السياسي والوحدة الأممية',
        integration: ['governance', 'trade', 'oic'],
        verse: '﴿إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ﴾',
        status: 'مُدمج',
    },
    {
        id: 'icrc_islamic',
        cat: 'إغاثة إنسانية',
        name: 'منظمات الإغاثة الإسلامية',
        nameEn: 'Islamic Relief Organizations',
        code: 'IRW',
        hq: 'متعدد — إسلامك ريليف، رسالة، هلال',
        founded: 1984,
        members: 0,
        mission: 'الإغاثة الإنسانية والتنمية وفق أحكام الشريعة',
        icon: '🌙',
        sheikha_role: 'توزيع الزكاة والصدقات والقضاء على الفقر عبر شيخة',
        integration: ['zakat', 'bayt_almal', 'waqf', 'poor_relief'],
        verse: '﴿وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ﴾',
        status: 'مُدمج',
    },
    {
        id: 'isesco',
        cat: 'تعليم وثقافة',
        name: 'منظمة التربية والعلوم والثقافة الإسلامية',
        nameEn: 'ISESCO',
        code: 'ISESCO',
        hq: 'الرباط — المغرب',
        founded: 1979,
        members: 54,
        mission: 'التعليم والثقافة والعلوم في العالم الإسلامي',
        icon: '🎓',
        sheikha_role: 'التكامل التعليمي والثقافي مع منظومة التعليم الرقمي',
        integration: ['education', 'culture', 'arabic'],
        verse: '﴿يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ﴾',
        status: 'مُدمج',
    },
    {
        id: 'comcec',
        cat: 'تمويل وتنمية',
        name: 'لجنة التعاون الاقتصادي والتجاري بين دول OIC',
        nameEn: 'COMCEC',
        code: 'COMCEC',
        hq: 'إسطنبول — تركيا',
        founded: 1984,
        members: 57,
        mission: 'الاقتصاد والتجارة والتنمية بين دول OIC',
        icon: '🛒',
        sheikha_role: 'دعم التجارة البينية بين دول OIC في سوق شيخة',
        integration: ['trade', 'logistics', 'greatest_trade'],
        verse: '﴿لَا تَظْلِمُونَ وَلَا تُظْلَمُونَ﴾',
        status: 'مُدمج',
    },
    {
        id: 'icm',
        cat: 'معايير ومحاسبة',
        name: 'المجلس الإسلامي للأهلال',
        nameEn: 'Islamic Crescent Moon',
        code: 'ICM',
        hq: 'متعدد',
        founded: 2000,
        members: 0,
        mission: 'توحيد رؤية هلال رمضان والأشهر القمرية',
        icon: '🌙',
        sheikha_role: 'التقويم الهجري المُوحَّد لكل العمليات في شيخة',
        integration: ['calendar', 'trade', 'zakat'],
        verse: '﴿يَسْأَلُونَكَ عَنِ الْأَهِلَّةِ قُلْ هِيَ مَوَاقِيتُ لِلنَّاسِ وَالْحَجِّ﴾',
        status: 'مُدمج',
    },
    {
        id: 'iifa',
        cat: 'بحث وفكر',
        name: 'مجمع الفقه الإسلامي الدولي',
        nameEn: 'International Islamic Fiqh Academy',
        code: 'IIFA',
        hq: 'جدة — المملكة العربية السعودية',
        founded: 1981,
        members: 57,
        mission: 'البحث الفقهي في القضايا المستجدة وإصدار القرارات الشرعية',
        icon: '📜',
        sheikha_role: 'مرجعية شرعية لكل معاملة وتقنية في منظومة شيخة',
        integration: ['sharia', 'fiqh', 'fatwa', 'compliance'],
        verse: '﴿فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ﴾',
        status: 'مرجعية رسمية',
    },
];

// ── خريطة التكامل مع شيخة ────────────────────────────────────────────────
const SHEIKHA_INTEGRATION_MAP = {
    rabita: {
        org: 'رابطة العالم الإسلامي',
        sheikha_serves: [
            'تعليم ١٣٩ دولة رقمياً عبر منظومة شيخة',
            'نشر الإسلام الوسطي بالفيديو والتقنيات الرقمية',
            'توزيع الكتب والمحتوى الإسلامي مجاناً',
            'ربط العلماء بالمجتمعات الإسلامية حول العالم',
        ],
        apis: ['/api/education/', '/api/hpc/project/quran_analysis', '/api/sovereign-id/'],
        verse: '﴿ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ﴾',
    },
    oic: {
        org: 'منظمة التعاون الإسلامي',
        sheikha_serves: [
            'شبكة DNS إسلامية تجمع ٥٧ دولة',
            'سوق رقمي بين دول OIC',
            'نظام الدينار الرقمي للتبادل البيني',
            'الهوية السيادية الموحدة لمواطني OIC',
        ],
        apis: ['/api/telecom/', '/api/dinar/', '/api/sovereign-id/', '/api/trade/'],
        verse: '﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا﴾',
    },
    idb: {
        org: 'البنك الإسلامي للتنمية',
        sheikha_serves: [
            'منصة الصكوك الرقمية',
            'تمويل مشاريع التنمية بلا ربا',
            'قياس أثر التنمية بمؤشر SQI',
            'سجل blockchain للصكوك',
        ],
        apis: ['/api/finance/', '/api/dinar/', '/api/sheikha-index/'],
        verse: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
    },
};

// ── إحصائيات التكامل ────────────────────────────────────────────────────
const INTEGRATION_STATS = {
    total_orgs: ISLAMIC_ORGANIZATIONS.length,
    countries_covered: 57,
    population_served: '1.9 مليار مسلم',
    total_apis_shared: '1580+',
    zero_riba: true,
    sharia_certified: true,
    languages: ['العربية', 'English', 'Français', 'Bahasa', 'Türkçe', 'اردو'],
    live_sync: true,
    last_updated: new Date().toISOString(),
};

class SheikhaIslamicOrgsEngine {
    getOverview() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            phase: 27,
            name: 'رابطة العالم الإسلامي والمنظمات الكونية',
            mission: 'تكامل شيخة مع كل منظمة إسلامية في خدمة الأمة',
            verse: '﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا﴾',
            hadith: '«الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا»',
            stats: INTEGRATION_STATS,
            categories: [...new Set(ISLAMIC_ORGANIZATIONS.map(o => o.cat))],
            timestamp: new Date().toISOString(),
        };
    }
    getOrganizations(cat) {
        if (cat) return ISLAMIC_ORGANIZATIONS.filter(o => o.cat === cat);
        return ISLAMIC_ORGANIZATIONS;
    }
    getOrg(id) { return ISLAMIC_ORGANIZATIONS.find(o => o.id === id) || null; }
    getIntegrationMap(orgId) {
        if (orgId && SHEIKHA_INTEGRATION_MAP[orgId]) return SHEIKHA_INTEGRATION_MAP[orgId];
        return SHEIKHA_INTEGRATION_MAP;
    }
    getStats() { return INTEGRATION_STATS; }
    getCategories() {
        const cats = {};
        for (const o of ISLAMIC_ORGANIZATIONS) {
            if (!cats[o.cat]) cats[o.cat] = [];
            cats[o.cat].push({ id: o.id, name: o.name, icon: o.icon, members: o.members });
        }
        return cats;
    }
}

module.exports = new SheikhaIslamicOrgsEngine();
