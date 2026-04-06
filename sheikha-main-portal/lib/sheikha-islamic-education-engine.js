/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════
 *  منظومة شيخة — المرحلة ٢٤
 *  محرك التعليم الرقمي الإسلامي الشامل
 *  SHEIKHA ISLAMIC DIGITAL EDUCATION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *  ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق ١
 *  «طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ» — ابن ماجه
 * ═══════════════════════════════════════════════════════════════════════════
 */
'use strict';

// ── طبقات المنهج الإسلامي الرقمي ─────────────────────────────────────────
const EDUCATION_PILLARS = [
    { id: 'quran',       name: 'علوم القرآن الكريم',        icon: '📖', priority: 1, sharia: 'فرض عين — تعلم الفاتحة وضع وجوب الصلاة' },
    { id: 'aqeeda',      name: 'العقيدة الإسلامية',         icon: '🕌', priority: 1, sharia: 'أساس الدين — توحيد الله وإفراده بالعبادة' },
    { id: 'fiqh',        name: 'الفقه والأحكام الشرعية',    icon: '⚖️',  priority: 1, sharia: 'فرض كفاية — معرفة أحكام العبادات والمعاملات' },
    { id: 'hadith',      name: 'علوم الحديث والسنة',        icon: '📜', priority: 1, sharia: 'فرض كفاية — حفظ السنة وصونها' },
    { id: 'arabic',      name: 'اللغة العربية الفصحى',      icon: '🔤', priority: 1, sharia: 'فرض كفاية — لغة القرآن والوحي' },
    { id: 'economics',   name: 'الاقتصاد الإسلامي',         icon: '🪙', priority: 2, sharia: 'فرض كفاية — معرفة المعاملات الحلال والحرام' },
    { id: 'cs',          name: 'علوم الحاسب والبرمجة',      icon: '💻', priority: 2, sharia: 'واجب كفائي في عصر الرقمنة' },
    { id: 'science',     name: 'العلوم التطبيقية والطبيعية', icon: '🔬', priority: 2, sharia: '﴿أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ﴾ — التأمل آية' },
    { id: 'trade',       name: 'التجارة والأعمال الإسلامية', icon: '🛒', priority: 2, sharia: 'التاجر الصدوق مع النبيين والصديقين والشهداء' },
    { id: 'civics',      name: 'المجتمع والحكم الإسلامي',   icon: '🏛️', priority: 3, sharia: 'معرفة الحقوق والواجبات — الأمر بالمعروف' },
    { id: 'history',     name: 'التاريخ الإسلامي والحضارة', icon: '🌍', priority: 3, sharia: '﴿قُلْ سِيرُوا فِي الْأَرْضِ﴾' },
    { id: 'environment', name: 'البيئة والاستدامة الإسلامية', icon: '🌿', priority: 3, sharia: 'الاستخلاف في الأرض — لا إسراف ولا إفساد' },
];

// ── مستويات التعليم ────────────────────────────────────────────────────────
const EDUCATION_LEVELS = [
    { id: 'children',    name: 'الأطفال (٤–١١)',    icon: '🌱', approach: 'قصص القرآن — ألعاب تعليمية — حفظ مُيسَّر' },
    { id: 'youth',       name: 'الشباب (١٢–١٧)',   icon: '🌿', approach: 'فقه المعاملات — مهارات رقمية — ريادة أعمال' },
    { id: 'university',  name: 'الجامعيون (١٨–٢٥)', icon: '🎓', approach: 'تخصصات متكاملة — بحث علمي — مشاريع مع قرآن وسنة' },
    { id: 'adults',      name: 'الكبار (٢٥+)',      icon: '📚', approach: 'تطوير مهني — تجديد معرفة — تعليم مستمر' },
    { id: 'scholars',    name: 'العلماء والباحثون',  icon: '🔭', approach: 'تحقيق تراث — بحث متقدم — رياض الجنة الباحثين' },
];

// ── برامج منظومة شيخة للتعليم ────────────────────────────────────────────
const SHEIKHA_PROGRAMS = [
    {
        id: 'quran_hafiz',
        name: 'برنامج حُفَّاظ القرآن الرقمي',
        icon: '📖', duration: '٢ سنة', students: 12400,
        features: ['تلاوة بالتجويد مع التصحيح الآلي', 'خريطة ذهنية للسور', 'شهادة رقمية معتمدة', 'ربط معنوي بالحياة اليومية'],
        verse: '﴿وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ﴾',
    },
    {
        id: 'islamic_economics',
        name: 'أكاديمية الاقتصاد الإسلامي',
        icon: '🪙', duration: '١ سنة', students: 8700,
        features: ['الفقه المالي المقارن', 'تمويل الصكوك والتكافل', 'تحليل الحلال والحرام', 'مشاريع ريادية شرعية'],
        verse: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
    },
    {
        id: 'digital_scrap',
        name: 'مدرسة المعادن والسكراب الرقمية',
        icon: '⚙️', duration: '٦ أشهر', students: 3200,
        features: ['تقييم المعادن والتسعير', 'رموز HS للاستيراد/التصدير', 'سلسلة حلال للسكراب', 'AI في تحليل المخلفات'],
        verse: '﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ﴾',
    },
    {
        id: 'ai_halal',
        name: 'برنامج الذكاء الاصطناعي الحلال',
        icon: '🤖', duration: '٨ أشهر', students: 5600,
        features: ['أخلاق AI بمنظور إسلامي', 'تطوير نماذج بدون بيانات حرام', 'مراجعة شرعية للخوارزميات', 'مشاريع AI لخدمة الأمة'],
        verse: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾',
    },
    {
        id: 'arabic_computing',
        name: 'برمجة الحاسب بالعربية',
        icon: '🔤', duration: '٤ أشهر', students: 9100,
        features: ['Python/JS بمصطلحات عربية', 'معالجة اللغة العربية NLP', 'تطبيقات RTL ومواقع عربية', 'ربط البرمجة بالفكر الإسلامي'],
        verse: '﴿إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا﴾',
    },
    {
        id: 'waqf_knowledge',
        name: 'وقف المعرفة الرقمي',
        icon: '🕌', duration: 'مستمر', students: 0,
        features: ['كل المحتوى مجاني للأمة', 'رخصة وقفية للمحتوى', 'دعم الطلاب المحتاجين', 'تمويل من الزكاة والصدقات'],
        verse: '﴿لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ﴾',
    },
];

// ── شبكة الشراكات التعليمية ────────────────────────────────────────────────
const EDUCATION_PARTNERS = [
    { type: 'جامعات', count: 24, example: 'الجامعة الإسلامية بالمدينة المنورة، IIUM ماليزيا', scope: 'OIC' },
    { type: 'مدارس', count: 180, example: 'مدارس منظومة شيخة الشريكة', scope: 'إقليمي' },
    { type: 'معاهد', count: 45, example: 'AAOIFI، IDB، ISDB معهد التطوير', scope: 'دولي' },
    { type: 'منصات', count: 12, example: 'رياض الجنة الباحثين، مختبرات الابتكار', scope: 'رقمي' },
    { type: 'علماء', count: 300, example: 'مراجعون ومدقّقون شرعيون', scope: 'الأمة' },
];

// ── مؤشرات الأداء التعليمي ────────────────────────────────────────────────
const EDUCATION_KPIS = {
    total_learners:   39_000,
    courses_active:   128,
    completion_rate:  78.4,
    satisfaction_nps: 87,
    halal_certified:  100,
    languages:        ['العربية', 'English', 'Bahasa', 'Français', 'اردو', 'Türkçe'],
    accreditations:   ['هيئة تقويم التعليم السعودية', 'QAHE', 'IAO', 'ISO 21001'],
    free_content_pct: 100,
};

class SheikhaIslamicEducationEngine {
    getOverview() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            phase: 24,
            name: 'التعليم الرقمي الإسلامي الشامل',
            mission: 'تعليم الأمة — من الفاتحة إلى الذكاء الاصطناعي — بمنهج رباني',
            verse: '﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾',
            hadith: '«طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ»',
            kpis: EDUCATION_KPIS,
            principles: [
                'العلم عبادة والتعليم صدقة جارية',
                'التوازن بين الوحي والعقل',
                'المجانية الكاملة من صندوق الوقف الرقمي',
                'ربط كل مادة بالقرآن والسنة',
                'لا محتوى حرام — لا إلحاد — لا فساد',
            ],
            timestamp: new Date().toISOString(),
        };
    }
    getPillars()    { return EDUCATION_PILLARS; }
    getLevels()     { return EDUCATION_LEVELS; }
    getPrograms()   { return SHEIKHA_PROGRAMS; }
    getPartners()   { return EDUCATION_PARTNERS; }
    getKPIs()       { return EDUCATION_KPIS; }
    getProgram(id)  { return SHEIKHA_PROGRAMS.find(p => p.id === id) || null; }
    getByLevel(id)  {
        const lvl = EDUCATION_LEVELS.find(l => l.id === id);
        if (!lvl) return null;
        return { level: lvl, pillars: EDUCATION_PILLARS.filter(p => p.priority <= 2), programs: SHEIKHA_PROGRAMS };
    }
}

module.exports = new SheikhaIslamicEducationEngine();
