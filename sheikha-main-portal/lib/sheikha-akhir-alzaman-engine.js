'use strict';
/**
 * بسم الله الرحمن الرحيم
 * محرك معرفي: علامات الساعة (تثقيف شرعي)
 * ملاحظة: لا يقدم توقيتاً ولا جزمًا بوقوع الأحداث — العلم عند الله.
 */

class SheikhaAkhirAlzamanEngine {
    constructor() {
        this.version = '1.0.0';
        this.mode = 'educational';
        this.updatedAt = new Date().toISOString();

        this.minorSigns = [
            { id: 'fitan', title: 'كثرة الفتن', source: 'أحاديث صحيحة', priority: 'high' },
            { id: 'amanah', title: 'ضياع الأمانة', source: 'صحيح البخاري', priority: 'high' },
            { id: 'jahil', title: 'رفع العلم وظهور الجهل', source: 'صحيح البخاري', priority: 'high' },
            { id: 'riba', title: 'انتشار الربا', source: 'أحاديث صحيحة', priority: 'high' },
            { id: 'qatl', title: 'كثرة القتل (الهرج)', source: 'صحيح مسلم', priority: 'high' },
            { id: 'tatawul', title: 'التطاول في البنيان', source: 'حديث جبريل', priority: 'medium' }
        ];

        this.majorSigns = [
            { id: 'dajjal', title: 'خروج المسيح الدجال', source: 'أحاديث متواترة', priority: 'critical' },
            { id: 'isa', title: 'نزول عيسى ابن مريم عليه السلام', source: 'أحاديث صحيحة', priority: 'critical' },
            { id: 'yajuj', title: 'خروج يأجوج ومأجوج', source: 'القرآن والسنة', priority: 'critical' },
            { id: 'dukhan', title: 'الدخان', source: 'القرآن والسنة', priority: 'high' },
            { id: 'sunWest', title: 'طلوع الشمس من مغربها', source: 'صحيح مسلم', priority: 'critical' },
            { id: 'dabbah', title: 'خروج الدابة', source: 'القرآن والسنة', priority: 'high' }
        ];

        this.guidance = [
            'الواجب: الثبات على الكتاب والسنة والعبادة والعمل الصالح.',
            'عدم الجزم بتعيين زمن العلامات أو إسقاطها على أحداث معاصرة بلا علم.',
            'الاستعداد بالقوة المشروعة النافعة: علم، إيمان، انضباط، تقنية، عدل.'
        ];
    }

    getStatus() {
        return {
            success: true,
            mode: this.mode,
            version: this.version,
            minorCount: this.minorSigns.length,
            majorCount: this.majorSigns.length,
            updatedAt: this.updatedAt,
            note: 'العلم عند الله — هذا المحتوى للتذكير والتثقيف الشرعي فقط'
        };
    }

    getSigns(level = 'all') {
        if (level === 'minor') return this.minorSigns;
        if (level === 'major') return this.majorSigns;
        return { minor: this.minorSigns, major: this.majorSigns };
    }

    getImportantAlerts() {
        const important = this.majorSigns
            .filter(s => s.priority === 'critical')
            .map(s => ({ id: s.id, title: s.title, source: s.source }));
        return {
            important,
            guidance: this.guidance,
            policy: 'لا ضرر ولا ضرار',
            quran: '﴿ وَأَعِدّوا لَهُم مَا اسْتَطَعتُم مِّن قُوَّةٍ ﴾'
        };
    }
}

module.exports = SheikhaAkhirAlzamanEngine;

