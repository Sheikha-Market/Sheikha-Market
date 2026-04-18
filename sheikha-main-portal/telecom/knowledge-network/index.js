/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📚 Sheikha Telecom — Knowledge Network Module
 *  شبكة العلوم والمعرفة — رقمنة التراث الإسلامي
 *  المرجع: SHEIKHA-TELECOM-NETWORK.md — الطبقة 5
 *  ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾ — طه: 114
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// مصادر قاعدة المعرفة
const KNOWLEDGE_SOURCES = [
    {
        id: 'quran',
        nameAr: 'القرآن الكريم',
        nameEn: 'Holy Quran',
        icon: '📖',
        verses: 6236,
        surahs: 114,
        status: 'available'
    },
    {
        id: 'hadith',
        nameAr: 'الحديث النبوي الشريف',
        nameEn: 'Prophetic Hadith',
        icon: '☪️',
        collections: ['البخاري', 'مسلم', 'أبو داود', 'الترمذي', 'ابن ماجه', 'النسائي'],
        status: 'available'
    },
    {
        id: 'fiqh',
        nameAr: 'الفقه الإسلامي',
        nameEn: 'Islamic Jurisprudence',
        icon: '⚖️',
        schools: ['الحنبلي', 'الشافعي', 'المالكي', 'الحنفي'],
        status: 'available'
    },
    {
        id: 'science',
        nameAr: 'العلوم التطبيقية',
        nameEn: 'Applied Sciences',
        icon: '🔬',
        fields: ['الكيمياء', 'الفيزياء', 'الطب', 'الهندسة', 'الاقتصاد'],
        status: 'available'
    },
    {
        id: 'heritage',
        nameAr: 'التراث الإسلامي',
        nameEn: 'Islamic Heritage',
        icon: '🏛️',
        period: '7th–21st century',
        status: 'in_progress'
    },
    {
        id: 'research',
        nameAr: 'البحث العلمي',
        nameEn: 'Scientific Research',
        icon: '📊',
        note: 'منصة مفتوحة للباحثين',
        status: 'planned'
    }
];

/**
 * جلب قاعدة المعرفة الموحدة
 * @param {string} [category] - تصفية حسب الفئة
 */
function getKnowledgeBase(category) {
    const sources = category
        ? KNOWLEDGE_SOURCES.filter(s => s.id === category)
        : KNOWLEDGE_SOURCES;

    return {
        name: 'Sheikha Knowledge Network',
        nameAr: 'شبكة شيخة للمعرفة',
        verse: '﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾ — طه: 114',
        hadith: '«طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ» — ابن ماجه',
        totalSources: sources.length,
        sources,
        linkedInstitutions: [
            { nameAr: 'جامعة الإمام محمد بن سعود الإسلامية', status: 'planned' },
            { nameAr: 'جامعة أم القرى',                       status: 'planned' },
            { nameAr: 'المجمع الفقهي الإسلامي الدولي',         status: 'planned' }
        ],
        features: [
            'بحث متقدم في النصوص الشرعية',
            'ترجمة فورية عبر Sheikha Neural Engine',
            'توثيق المصادر تلقائياً',
            'ربط المفاهيم المترابطة',
            'تصدير بصيغ متعددة'
        ]
    };
}

module.exports = { getKnowledgeBase, KNOWLEDGE_SOURCES };
