// بسم الله الرحمن الرحيم
/**
 * أحاديث مُفهرسة — قاعدة بيانات السنة النبوية لمنظومة شيخة
 * تُستخدم كـ embeddings للتحقق الشرعي
 */
'use strict';

const HADITH_DB = [
    {
        id: 'h001', source: 'صحيح مسلم', bookNum: 10, hadithNum: 3808,
        narrator: 'أبو هريرة رضي الله عنه',
        arabic: 'نَهَى رَسُولُ اللَّهِ ﷺ عَنْ بَيْعِ الْغَرَرِ',
        topic: 'غرر', rule: 'PROHIBITED', keywords: ['غرر', 'بيع', 'نهي'],
        weight: 1.0,
    },
    {
        id: 'h002', source: 'سنن ابن ماجه', bookNum: 13, hadithNum: 2340,
        narrator: 'ابن عباس رضي الله عنهما',
        arabic: 'لَا ضَرَرَ وَلَا ضِرَارَ',
        topic: 'ضرر', rule: 'PROHIBITED', keywords: ['ضرر', 'ضرار'],
        weight: 1.0,
    },
    {
        id: 'h003', source: 'سنن الترمذي', bookNum: 12, hadithNum: 1209,
        narrator: 'أبو سعيد الخدري رضي الله عنه',
        arabic: 'التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ',
        topic: 'تجارة', rule: 'RECOMMENDED', keywords: ['تاجر', 'صدق', 'أمانة'],
        weight: 1.0,
    },
    {
        id: 'h004', source: 'صحيح البخاري', bookNum: 34, hadithNum: 2076,
        narrator: 'حكيم بن حزام رضي الله عنه',
        arabic: 'الْبَيِّعَانِ بِالْخِيَارِ مَا لَمْ يَتَفَرَّقَا، فَإِنْ صَدَقَا وَبَيَّنَا بُورِكَ لَهُمَا فِي بَيْعِهِمَا',
        topic: 'بيع', rule: 'REQUIRED', keywords: ['بيع', 'خيار', 'بركة', 'صدق'],
        weight: 1.0,
    },
    {
        id: 'h005', source: 'صحيح البخاري', bookNum: 34, hadithNum: 2116,
        narrator: 'ابن عمر رضي الله عنهما',
        arabic: 'نَهَى النَّبِيُّ ﷺ عَنْ بَيْعِ حَبَلِ الْحَبَلَةِ',
        topic: 'غرر', rule: 'PROHIBITED', keywords: ['غرر', 'مجهول', 'نهي'],
        weight: 0.9,
    },
    {
        id: 'h006', source: 'صحيح مسلم', bookNum: 22, hadithNum: 4017,
        narrator: 'جابر رضي الله عنه',
        arabic: 'نَهَى رَسُولُ اللَّهِ ﷺ عَنِ الْمُزَابَنَةِ وَالْمُحَاقَلَةِ',
        topic: 'غرر', rule: 'PROHIBITED', keywords: ['مزابنة', 'مجهول', 'نهي'],
        weight: 0.9,
    },
    {
        id: 'h007', source: 'صحيح البخاري', bookNum: 24, hadithNum: 1454,
        narrator: 'ابن عباس رضي الله عنهما',
        arabic: 'لَيْسَ فِيمَا دُونَ خَمْسَةِ أَوْسُقٍ صَدَقَةٌ',
        topic: 'زكاة', rule: 'REQUIRED', keywords: ['زكاة', 'نصاب'],
        weight: 1.0,
    },
    {
        id: 'h008', source: 'صحيح البخاري', bookNum: 34, hadithNum: 2068,
        narrator: 'أبو هريرة رضي الله عنه',
        arabic: 'مَنِ اشْتَرَى طَعَامًا فَلَا يَبِعْهُ حَتَّى يَكْتَالَهُ',
        topic: 'قبض', rule: 'REQUIRED', keywords: ['قبض', 'بيع', 'طعام'],
        weight: 0.9,
    },
    {
        id: 'h009', source: 'سنن أبي داود', bookNum: 23, hadithNum: 3504,
        narrator: 'ابن مسعود رضي الله عنه',
        arabic: 'لَعَنَ رَسُولُ اللَّهِ ﷺ آكِلَ الرِّبَا وَمُؤْكِلَهُ وَشَاهِدَيْهِ وَكَاتِبَهُ',
        topic: 'ربا', rule: 'PROHIBITED', keywords: ['ربا', 'لعن', 'تحريم'],
        weight: 1.0,
    },
    {
        id: 'h010', source: 'صحيح البخاري', bookNum: 34, hadithNum: 2237,
        narrator: 'أبو هريرة رضي الله عنه',
        arabic: 'مَنْ غَشَّنَا فَلَيْسَ مِنَّا',
        topic: 'غش', rule: 'PROHIBITED', keywords: ['غش', 'أمانة', 'تجارة'],
        weight: 1.0,
    },
];

/**
 * البحث في الأحاديث بالكلمات المفتاحية
 */
function search(query) {
    const q = query.toLowerCase();
    return HADITH_DB.filter(h =>
        h.arabic.includes(query) ||
        h.keywords.some(k => k.includes(q)) ||
        h.topic.includes(q)
    );
}

/**
 * الحصول على أحاديث موضوع معين
 */
function byTopic(topic) {
    return HADITH_DB.filter(h => h.topic === topic);
}

/**
 * التحقق من حكم معاملة بناءً على الأحاديث
 */
function assessTransaction(tx) {
    const flags = [];
    if (tx.hasInterest || tx.riba)   flags.push({ rule: 'PROHIBITED', ref: 'h009', reason: 'ربا' });
    if (tx.hasUncertainty || tx.gharar) flags.push({ rule: 'PROHIBITED', ref: 'h001', reason: 'غرر' });
    if (tx.hasDeception)              flags.push({ rule: 'PROHIBITED', ref: 'h010', reason: 'غش' });
    return {
        compliant: flags.length === 0,
        violations: flags,
        hadithRefs: flags.map(f => HADITH_DB.find(h => h.id === f.ref)),
    };
}

module.exports = { HADITH_DB, search, byTopic, assessTransaction };
