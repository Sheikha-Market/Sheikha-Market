/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA MARKETPLACE ROUTER — موجّه الأسواق المتعددة                        ║
 * ║  سوق المعادن · التقنية · العلوم · الاستشارات · التمويل الإسلامي            ║
 * ║  جامع لمنظمات وأسواق المحلية والعالمية في سوق واحد موحّد                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — البقرة:٢٧٥
 * "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" — المائدة:٢
 */

'use strict';

const { MARKETPLACE_ROUTING_MAP } = require('./registry');

// ═══════════════════════════════════════════════════════════════
// قطاعات السوق الجامع — كل قطاع وهيكله الكامل
// ═══════════════════════════════════════════════════════════════
const MARKETPLACE_SECTORS = [
    // ─── القطاع ١: المعادن والموارد الطبيعية ─────────────────
    {
        id:        'METALS',
        nameAr:    'سوق المعادن والخامات',
        nameEn:    'Metals & Raw Materials Market',
        icon:      '⛏️',
        scope:     ['محلي', 'إقليمي', 'دولي'],
        path:      '/marketplace/metals',
        maqsad:    'MAL',
        categories: [
            { id: 'PRECIOUS', nameAr: 'المعادن الثمينة', items: ['ذهب', 'فضة', 'بلاتين', 'باليوم'] },
            { id: 'BASE',     nameAr: 'المعادن الأساسية', items: ['نحاس', 'ألمنيوم', 'حديد', 'زنك', 'رصاص'] },
            { id: 'RARE',     nameAr: 'المعادن النادرة', items: ['ليثيوم', 'كوبالت', 'نيوديميوم', 'إنديوم'] },
            { id: 'SCRAP',    nameAr: 'السكراب وإعادة التدوير', items: ['سكراب حديد', 'سكراب نحاس', 'سكراب ألمنيوم'] },
            { id: 'MINERAL',  nameAr: 'المعادن الصناعية', items: ['نيكل', 'تيتانيوم', 'فناديوم', 'كروم'] },
        ],
        pricing: { currency: 'SAR/USD', real_time: true, source: 'LME + محلي' },
        quranic_ref: { ref: 'الأعراف:١٠', text: 'وَلَقَدْ مَكَّنَّاكُمْ فِي الْأَرْضِ' },
    },

    // ─── القطاع ٢: التقنية والبرمجيات ────────────────────────
    {
        id:        'TECH',
        nameAr:    'سوق التقنية والبرمجيات',
        nameEn:    'Technology & Software Market',
        icon:      '💻',
        scope:     ['دولي', 'كوني'],
        path:      '/marketplace/tech',
        maqsad:    'AQL',
        categories: [
            { id: 'SOFTWARE',  nameAr: 'البرمجيات والتطبيقات', items: ['SaaS', 'APIs', 'أدوات تطوير', 'أمن سيبراني'] },
            { id: 'AI_TOOLS',  nameAr: 'أدوات الذكاء الاصطناعي', items: ['نماذج AI', 'أدوات بيانات', 'منصات ML'] },
            { id: 'HARDWARE',  nameAr: 'الأجهزة والمعدات', items: ['خوادم', 'شبكات', 'أجهزة IoT'] },
            { id: 'CLOUD',     nameAr: 'خدمات السحابة', items: ['Cloud Computing', 'Storage', 'CDN'] },
            { id: 'BLOCKCHAIN',nameAr: 'بلوك تشين وWeb3 الحلال', items: ['عقود ذكية حلال', 'DID', 'Tokenization إسلامي'] },
        ],
        sharia_filter: { blocked: ['قمار رقمي', 'محتوى محرم', 'ربا رقمي'] },
        quranic_ref: { ref: 'العلق:١', text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ' },
    },

    // ─── القطاع ٣: العلوم والبحث العلمي ──────────────────────
    {
        id:        'SCIENCE',
        nameAr:    'سوق العلوم والبحث العلمي',
        nameEn:    'Science & Research Market',
        icon:      '🔬',
        scope:     ['دولي', 'كوني'],
        path:      '/marketplace/science',
        maqsad:    'AQL',
        categories: [
            { id: 'RESEARCH',   nameAr: 'أبحاث ودراسات', items: ['دراسات جدوى', 'أبحاث علمية', 'تقارير صناعية'] },
            { id: 'PATENTS',    nameAr: 'براءات الاختراع', items: ['تسجيل براءات', 'نقل تقنية'] },
            { id: 'DATA',       nameAr: 'البيانات والإحصاءات', items: ['بيانات السوق', 'إحصاءات دولية'] },
            { id: 'LAB',        nameAr: 'مختبرات ومعامل', items: ['خدمات مختبرية', 'معامل اختبار', 'شهادات جودة'] },
        ],
        hadith_ref: { ref: 'مسلم:٢٦٩٩', text: 'من سلك طريقاً يلتمس فيه علماً' },
    },

    // ─── القطاع ٤: الاستشارات الدولية ────────────────────────
    {
        id:        'CONSULTING',
        nameAr:    'سوق الاستشارات الدولية',
        nameEn:    'International Consulting Market',
        icon:      '🤝',
        scope:     ['محلي', 'إقليمي', 'دولي', 'كوني'],
        path:      '/marketplace/consulting',
        maqsad:    'ARD',
        categories: [
            { id: 'GOV',      nameAr: 'استشارات حكومية', items: ['رقمنة حكومية', 'سياسات عامة', 'تشريعات'] },
            { id: 'BUSINESS', nameAr: 'استشارات أعمال', items: ['خطط عمل', 'تمويل', 'توسع دولي'] },
            { id: 'TECH_C',   nameAr: 'استشارات تقنية', items: ['AI', 'أمن سيبراني', 'تحول رقمي'] },
            { id: 'SHARIA_C', nameAr: 'استشارات شرعية', items: ['فتاوى تجارية', 'مراجعة عقود', 'امتثال'] },
            { id: 'VISION',   nameAr: 'استشارات رؤى ومؤشرات', items: ['رؤى وطنية', 'مؤشرات دولية', 'خارطة طريق'] },
        ],
        consultant: 'سلمان أحمد الراجح — مستشار دولي',
        quranic_ref: { ref: 'آل عمران:١٥٩', text: 'وَشَاوِرْهُمْ فِي الْأَمْرِ' },
    },

    // ─── القطاع ٥: التمويل الإسلامي ──────────────────────────
    {
        id:        'ISLAMIC_FINANCE',
        nameAr:    'سوق التمويل الإسلامي',
        nameEn:    'Islamic Finance Market',
        icon:      '🕌',
        scope:     ['محلي', 'إقليمي', 'دولي'],
        path:      '/marketplace/finance',
        maqsad:    'MAL',
        categories: [
            { id: 'MURABAHA', nameAr: 'مرابحة', items: ['تمويل السلع', 'تمويل العقارات'] },
            { id: 'MUSHARAKA',nameAr: 'مشاركة ومضاربة', items: ['شراكات استثمارية', 'صناديق إسلامية'] },
            { id: 'SUKUK',    nameAr: 'صكوك إسلامية', items: ['صكوك حكومية', 'صكوك شركات'] },
            { id: 'TAKAFUL',  nameAr: 'تكافل', items: ['تأمين تكافلي', 'حماية إسلامية'] },
        ],
        sharia_filter: { mandatory: true, standard: 'AAOIFI' },
        quranic_ref: { ref: 'البقرة:٢٧٥', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا' },
    },

    // ─── القطاع ٦: الخدمات اللوجستية والنقل ─────────────────
    {
        id:        'LOGISTICS',
        nameAr:    'سوق اللوجستيات والنقل',
        nameEn:    'Logistics & Transport Market',
        icon:      '🚢',
        scope:     ['محلي', 'إقليمي', 'دولي'],
        path:      '/marketplace/logistics',
        maqsad:    'MAL',
        categories: [
            { id: 'SEA',   nameAr: 'الشحن البحري', items: ['FCL', 'LCL', 'حاويات', 'ناقلات'] },
            { id: 'AIR',   nameAr: 'الشحن الجوي', items: ['شحن سريع', 'بضاعة', 'مستندات'] },
            { id: 'LAND',  nameAr: 'الشحن البري', items: ['شاحنات', 'قطارات', 'مستودعات'] },
            { id: 'CUSTOM',nameAr: 'الجمارك والتخليص', items: ['تخليص جمركي', 'شهادات منشأ'] },
        ],
    },

    // ─── القطاع ٧: الوقف والصدقات والزكاة ───────────────────
    {
        id:        'WAQF_ZAKAT',
        nameAr:    'سوق الوقف والزكاة والخير',
        nameEn:    'Waqf, Zakat & Charity Market',
        icon:      '🌙',
        scope:     ['كوني'],
        path:      '/marketplace/waqf',
        maqsad:    'MAL',
        categories: [
            { id: 'ZAKAT',    nameAr: 'الزكاة الرقمية', items: ['حساب الزكاة', 'توزيع الزكاة', 'مستحقو الزكاة'] },
            { id: 'SADAQAH',  nameAr: 'الصدقات', items: ['صدقة جارية', 'مشاريع خيرية'] },
            { id: 'WAQF',     nameAr: 'الوقف الرقمي', items: ['وقف عقاري', 'وقف نقدي', 'وقف تعليمي'] },
            { id: 'QARD',     nameAr: 'القرض الحسن', items: ['قروض بلا فائدة للمحتاجين'] },
        ],
        free_service: true,             // الوقف والزكاة مجاناً لا عمولة
        quranic_ref: { ref: 'التوبة:٦٠', text: 'إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ' },
    },

    // ─── القطاع ٨: المنظمات الدولية ──────────────────────────
    {
        id:        'ORGANIZATIONS',
        nameAr:    'سوق المنظمات الدولية',
        nameEn:    'International Organizations Market',
        icon:      '🌐',
        scope:     ['دولي', 'قاري', 'كوني'],
        path:      '/marketplace/organizations',
        maqsad:    'ARD',
        categories: [
            { id: 'INTERNAT', nameAr: 'منظمات دولية', items: ['UN', 'WTO', 'WHO', 'OIC', 'Arab League'] },
            { id: 'REGIONAL', nameAr: 'منظمات إقليمية', items: ['GCC', 'Arab League', 'OIC', 'ASEAN'] },
            { id: 'CHAMBERS', nameAr: 'الغرف التجارية', items: ['غرف سعودية', 'خليجية', 'دولية'] },
            { id: 'STANDARD', nameAr: 'هيئات المعايير', items: ['ISO', 'AAOIFI', 'SASO', 'GSO'] },
        ],
        quranic_ref: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
    },
];

// ═══════════════════════════════════════════════════════════════
// التوجيه الذكي — اكتشاف القطاع من الطلب
// ═══════════════════════════════════════════════════════════════
function resolveMarketSector(pathname) {
    for (const [route, info] of Object.entries(MARKETPLACE_ROUTING_MAP)) {
        if (pathname.startsWith(route)) return { route, ...info };
    }
    return null;
}

function getSectorById(id) {
    return MARKETPLACE_SECTORS.find((s) => s.id === id) || null;
}

function searchSectors(keyword = '') {
    const kw = keyword.toLowerCase().trim();
    if (!kw) return MARKETPLACE_SECTORS;
    return MARKETPLACE_SECTORS.filter((s) => {
        const text = [s.nameAr, s.nameEn, ...(s.categories || []).map((c) => c.nameAr)].join(' ').toLowerCase();
        return text.includes(kw);
    });
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    MARKETPLACE_SECTORS,
    resolveMarketSector,
    getSectorById,
    searchSectors,
};
