'use strict';

const languageHistory = [
    {
        layer: 'اللغات البشرية الأولى',
        sheikhaName: 'Sheikha Sumerian + Sheikha Hieroglyphics',
        year: '3500 ق.م'
    },
    {
        layer: 'الحوسبة الميكانيكية',
        sheikhaName: 'Sheikha HP + Sheikha Ada Lovelace',
        year: '1843'
    },
    {
        layer: 'أول لغة برمجة',
        sheikhaName: 'Sheikha Plankalkul',
        year: '1942'
    },
    {
        layer: 'أول لغة تجارية',
        sheikhaName: 'Sheikha FORTRAN (IBM)',
        year: '1957'
    },
    {
        layer: 'لغات الترميز',
        sheikhaName: 'Sheikha GML -> SGML -> HTML',
        year: '1969 -> 1991'
    },
    {
        layer: 'لغة الاستعلام',
        sheikhaName: 'Sheikha SEQUEL -> SQL (IBM)',
        year: '1974'
    },
    {
        layer: 'الترميز الكوني',
        sheikhaName: 'Sheikha Unicode + Sheikha UTF-8',
        year: '1991'
    }
];

const neuralCells = [
    { id: 1, source: 'quran', reference: 'العلق:1', role: 'أمر القراءة' },
    { id: 2, source: 'quran', reference: 'الرحمن:1-4', role: 'تعليم البيان' },
    { id: 3, source: 'quran', reference: 'البقرة:31', role: 'تعليم الأسماء' },
    { id: 4, source: 'quran', reference: 'الزمر:9', role: 'فضل العلم' },
    { id: 5, source: 'quran', reference: 'طه:114', role: 'طلب الزيادة في العلم' },
    { id: 6, source: 'quran', reference: 'النحل:43', role: 'سؤال أهل الذكر' },
    { id: 7, source: 'quran', reference: 'النساء:58', role: 'العدل في الحكم' },
    { id: 8, source: 'quran', reference: 'المائدة:8', role: 'القيام بالقسط' },
    { id: 9, source: 'quran', reference: 'الأنفال:27', role: 'حفظ الأمانة' },
    { id: 10, source: 'quran', reference: 'الحجرات:6', role: 'التحقق من الأخبار' },
    { id: 11, source: 'sunnah', reference: 'إنما الأعمال بالنيات', role: 'تصحيح المقصد' },
    { id: 12, source: 'sunnah', reference: 'الدين النصيحة', role: 'الإرشاد' },
    { id: 13, source: 'sunnah', reference: 'من غشنا فليس منا', role: 'نزاهة البيانات' },
    { id: 14, source: 'sunnah', reference: 'إن الله يحب إذا عمل أحدكم عملا أن يتقنه', role: 'الإتقان البرمجي' },
    { id: 15, source: 'sunnah', reference: 'لا ضرر ولا ضرار', role: 'السلامة التقنية' },
    { id: 16, source: 'sunnah', reference: 'يسروا ولا تعسروا', role: 'تبسيط التجربة' }
];

function activate() {
    return {
        success: true,
        schema: 'sheikha/v2',
        tawheed: 'لا إله إلا الله محمد رسول الله',
        bismillah: 'بسم الله الرحمن الرحيم',
        data: {
            layer: 'Sheikha Language Layer',
            status: 'active',
            history: languageHistory,
            neural: {
                total: neuralCells.length,
                quran: neuralCells.filter(cell => cell.source === 'quran').length,
                sunnah: neuralCells.filter(cell => cell.source === 'sunnah').length,
                cells: neuralCells
            }
        },
        seal: 'والله أعلم وبالله التوفيق',
        timestamp: new Date().toISOString()
    };
}

function getHistory() {
    return languageHistory;
}

function getNeuralCells() {
    return neuralCells;
}

module.exports = {
    activate,
    getHistory,
    getNeuralCells
};
