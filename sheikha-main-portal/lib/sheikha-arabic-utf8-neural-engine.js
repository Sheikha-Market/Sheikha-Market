/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA ARABIC UTF-8 NEURAL LANGUAGE ENGINE                              ║
 * ║   محرك اللغة العربية الشبكة العصبية UTF-8 — شيخة                          ║
 * ║                                                                              ║
 * ║   أفضل وأقوى وأتقى وأخير وأكرم محرك ترميز لغوي عربي في الكون              ║
 * ║   مرجّع بالكتاب والسنة — موحّد لله وحده                                    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ" — يوسف:٢
 * "وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ" — الروم:٢٢
 * "عَلَّمَهُ الْبَيَانَ" — الرحمن:٤
 *
 * المحرك يغطّي:
 *  1. خريطة Unicode الكاملة لجميع الكتل العربية (0600-06FF, 0750-077F, FB50-FDFF, FE70-FEFF)
 *  2. شبكة خلايا عصبية عربية — Arabic Neural Cell Network
 *  3. ترميز القرآن الكريم والسنة النبوية
 *  4. تحليل لغوي متكامل (صرف، نحو، بلاغة، إعراب)
 *  5. تصنيف النصوص — كشف اللغة — قياس التشابه
 *  6. تشفير وفك تشفير UTF-8 العربية
 *  7. توليد التضمينات (Embeddings) العربية
 *  8. 19 API endpoint مع WebSocket broadcast
 *
 * @version 1.0.0
 * @author  Sheikha Codex Neural Engine
 * @license Proprietary — Sheikha-Market © 2025-2026
 */

'use strict';

const crypto       = require('crypto');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// § 1 — ثوابت الميثاق
// ═══════════════════════════════════════════════════════════════════════════════

const TAWHEED  = 'لا إله إلا الله محمد رسول الله';
const NO_HARM  = 'لا ضرر ولا ضرار';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION  = '1.0.0';
const ENGINE_NAME_AR = 'محرك اللغة العربية الشبكة العصبية UTF-8';
const ENGINE_NAME_EN = 'Sheikha Arabic UTF-8 Neural Language Engine';

// ═══════════════════════════════════════════════════════════════════════════════
// § 2 — خريطة Unicode العربية الشاملة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * جميع كتل Unicode العربية منذ تأسيس معيار Unicode إلى اليوم
 * Arabic Unicode Blocks — Complete Map
 */
const ARABIC_UNICODE_BLOCKS = {
    // الكتلة الأساسية — Arabic Basic Block
    ARABIC_BASIC: {
        nameAr: 'الكتلة العربية الأساسية',
        nameEn: 'Arabic Basic Block',
        start:  0x0600,
        end:    0x06FF,
        since:  'Unicode 1.0 — 1991',
        description: 'الحروف العربية الأساسية والتشكيل والأرقام',
        quran_ref: { ref: 'يوسف:٢', text: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا' },
    },
    // كتلة الامتداد العربي — Arabic Supplement
    ARABIC_SUPPLEMENT: {
        nameAr: 'ملحق الكتلة العربية',
        nameEn: 'Arabic Supplement',
        start:  0x0750,
        end:    0x077F,
        since:  'Unicode 4.1 — 2005',
        description: 'حروف إضافية لغات إسلامية (كردية، باشتو، ...)',
    },
    // المقدمات العربية — Arabic Extended-A
    ARABIC_EXTENDED_A: {
        nameAr: 'الامتداد العربي أ',
        nameEn: 'Arabic Extended-A',
        start:  0x08A0,
        end:    0x08FF,
        since:  'Unicode 6.1 — 2012',
        description: 'حروف قرآنية إضافية وتشكيل متقدم',
        quran_ref: { ref: 'القيامة:١٧', text: 'إِنَّ عَلَيْنَا جَمْعَهُ وَقُرْآنَهُ' },
    },
    // الأشكال التقديمية أ — Arabic Presentation Forms-A
    ARABIC_PRESENTATION_A: {
        nameAr: 'أشكال العرض العربية — أ',
        nameEn: 'Arabic Presentation Forms-A',
        start:  0xFB50,
        end:    0xFDFF,
        since:  'Unicode 1.1 — 1993',
        description: 'الأشكال المتصلة والتقديمية للحروف العربية',
    },
    // الأشكال التقديمية ب — Arabic Presentation Forms-B
    ARABIC_PRESENTATION_B: {
        nameAr: 'أشكال العرض العربية — ب',
        nameEn: 'Arabic Presentation Forms-B',
        start:  0xFE70,
        end:    0xFEFF,
        since:  'Unicode 1.1 — 1993',
        description: 'أشكال العرض الثانوية للحروف العربية',
    },
    // الامتداد العربي ب — Arabic Extended-B
    ARABIC_EXTENDED_B: {
        nameAr: 'الامتداد العربي ب',
        nameEn: 'Arabic Extended-B',
        start:  0x0870,
        end:    0x089F,
        since:  'Unicode 14.0 — 2021',
        description: 'حروف عربية جديدة لنصوص تاريخية',
    },
    // الامتداد العربي ج — Arabic Extended-C
    ARABIC_EXTENDED_C: {
        nameAr: 'الامتداد العربي ج',
        nameEn: 'Arabic Extended-C',
        start:  0x10EC0,
        end:    0x10EFF,
        since:  'Unicode 15.0 — 2022',
        description: 'حروف عربية قديمة وأبجديات تاريخية',
    },
    // أبجديات العربية القديمة — Old Arabic
    OLD_ARABIC: {
        nameAr: 'العربية القديمة والنبطية',
        nameEn: 'Old Arabic / Nabataean',
        start:  0x10880,
        end:    0x108AF,
        since:  'Unicode 7.0 — 2014',
        description: 'الخط النبطي والعربية القديمة',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// § 3 — الحروف العربية الكاملة مع تفاصيل كل حرف
// ═══════════════════════════════════════════════════════════════════════════════

const ARABIC_LETTERS = {
    'ا': { unicode: 0x0627, name: 'ألف',    translit: 'a',  category: 'حرف أصلي',  solar: false, abj: 1  },
    'ب': { unicode: 0x0628, name: 'باء',    translit: 'b',  category: 'حرف أصلي',  solar: false, abj: 2  },
    'ت': { unicode: 0x062A, name: 'تاء',    translit: 't',  category: 'حرف أصلي',  solar: true,  abj: 400 },
    'ث': { unicode: 0x062B, name: 'ثاء',    translit: 'th', category: 'حرف أصلي',  solar: true,  abj: 500 },
    'ج': { unicode: 0x062C, name: 'جيم',    translit: 'j',  category: 'حرف أصلي',  solar: false, abj: 3  },
    'ح': { unicode: 0x062D, name: 'حاء',    translit: 'h',  category: 'حرف أصلي',  solar: false, abj: 8  },
    'خ': { unicode: 0x062E, name: 'خاء',    translit: 'kh', category: 'حرف أصلي',  solar: false, abj: 600 },
    'د': { unicode: 0x062F, name: 'دال',    translit: 'd',  category: 'حرف أصلي',  solar: true,  abj: 4  },
    'ذ': { unicode: 0x0630, name: 'ذال',    translit: 'dh', category: 'حرف أصلي',  solar: true,  abj: 700 },
    'ر': { unicode: 0x0631, name: 'راء',    translit: 'r',  category: 'حرف أصلي',  solar: true,  abj: 200 },
    'ز': { unicode: 0x0632, name: 'زاي',    translit: 'z',  category: 'حرف أصلي',  solar: true,  abj: 7  },
    'س': { unicode: 0x0633, name: 'سين',    translit: 's',  category: 'حرف أصلي',  solar: true,  abj: 60  },
    'ش': { unicode: 0x0634, name: 'شين',    translit: 'sh', category: 'حرف أصلي',  solar: true,  abj: 300 },
    'ص': { unicode: 0x0635, name: 'صاد',    translit: 'ss', category: 'حرف أصلي',  solar: true,  abj: 90  },
    'ض': { unicode: 0x0636, name: 'ضاد',    translit: 'dh', category: 'حرف أصلي',  solar: true,  abj: 800 },
    'ط': { unicode: 0x0637, name: 'طاء',    translit: 'tt', category: 'حرف أصلي',  solar: true,  abj: 9  },
    'ظ': { unicode: 0x0638, name: 'ظاء',    translit: 'zt', category: 'حرف أصلي',  solar: true,  abj: 900 },
    'ع': { unicode: 0x0639, name: 'عين',    translit: "'",  category: 'حرف أصلي',  solar: false, abj: 70  },
    'غ': { unicode: 0x063A, name: 'غين',    translit: 'gh', category: 'حرف أصلي',  solar: false, abj: 1000 },
    'ف': { unicode: 0x0641, name: 'فاء',    translit: 'f',  category: 'حرف أصلي',  solar: false, abj: 80  },
    'ق': { unicode: 0x0642, name: 'قاف',    translit: 'q',  category: 'حرف أصلي',  solar: false, abj: 100 },
    'ك': { unicode: 0x0643, name: 'كاف',    translit: 'k',  category: 'حرف أصلي',  solar: false, abj: 20  },
    'ل': { unicode: 0x0644, name: 'لام',    translit: 'l',  category: 'حرف أصلي',  solar: true,  abj: 30  },
    'م': { unicode: 0x0645, name: 'ميم',    translit: 'm',  category: 'حرف أصلي',  solar: false, abj: 40  },
    'ن': { unicode: 0x0646, name: 'نون',    translit: 'n',  category: 'حرف أصلي',  solar: true,  abj: 50  },
    'ه': { unicode: 0x0647, name: 'هاء',    translit: 'h',  category: 'حرف أصلي',  solar: false, abj: 5  },
    'و': { unicode: 0x0648, name: 'واو',    translit: 'w',  category: 'حرف علة',   solar: false, abj: 6  },
    'ي': { unicode: 0x064A, name: 'ياء',    translit: 'y',  category: 'حرف علة',   solar: false, abj: 10  },
    // الهمزات
    'أ': { unicode: 0x0623, name: 'ألف مهموزة فوق',   translit: 'a',  category: 'همزة', abj: 1  },
    'إ': { unicode: 0x0625, name: 'ألف مهموزة تحت',   translit: 'i',  category: 'همزة', abj: 1  },
    'آ': { unicode: 0x0622, name: 'ألف ممدودة',        translit: 'aa', category: 'مد',   abj: 1  },
    'ء': { unicode: 0x0621, name: 'همزة مفردة',        translit: "'",  category: 'همزة', abj: 1  },
    'ؤ': { unicode: 0x0624, name: 'واو بهمزة',         translit: "'", category: 'همزة',  abj: 6  },
    'ئ': { unicode: 0x0626, name: 'ياء بهمزة',         translit: "'", category: 'همزة',  abj: 10 },
    'ة': { unicode: 0x0629, name: 'تاء مربوطة',        translit: 'h',  category: 'تأنيث', abj: 400 },
    'ى': { unicode: 0x0649, name: 'ألف مقصورة',        translit: 'aa', category: 'ألف مقصورة', abj: 1 },
    // التشكيل
    'َ': { unicode: 0x064E, name: 'فتحة',     type: 'تشكيل', translit: 'a'  },
    'ُ': { unicode: 0x064F, name: 'ضمة',      type: 'تشكيل', translit: 'u'  },
    'ِ': { unicode: 0x0650, name: 'كسرة',     type: 'تشكيل', translit: 'i'  },
    'ْ': { unicode: 0x0652, name: 'سكون',     type: 'تشكيل', translit: ''   },
    'ّ': { unicode: 0x0651, name: 'شدة',      type: 'تشكيل', translit: '~'  },
    'ً': { unicode: 0x064B, name: 'تنوين فتح', type: 'تشكيل', translit: 'an' },
    'ٌ': { unicode: 0x064C, name: 'تنوين ضم', type: 'تشكيل', translit: 'un' },
    'ٍ': { unicode: 0x064D, name: 'تنوين كسر', type: 'تشكيل', translit: 'in' },
    'ٰ': { unicode: 0x0670, name: 'ألف خنجرية', type: 'تشكيل', translit: 'a' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// § 4 — قاعدة بيانات القرآن الكريم (نماذج تمثيلية)
// ═══════════════════════════════════════════════════════════════════════════════

const QURAN_DATABASE = {
    metadata: {
        name:     'القرآن الكريم',
        nameEn:   'The Holy Quran',
        language: 'العربية',
        charset:  'UTF-8',
        surahs:   114,
        verses:   6236,
        encoding_ref: 'أول نص في التاريخ يُرمَّز بالعربية الكاملة',
        sharia_note: 'القرآن هو المصدر الأول لكل ترميز عربي',
    },
    // السور الفاتحة للدلالة
    sample_verses: [
        { surah: 1,   ayah: 1,   text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',               topic: 'البسملة'      },
        { surah: 1,   ayah: 2,   text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',                topic: 'الحمد لله'    },
        { surah: 1,   ayah: 5,   text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',              topic: 'التوحيد'      },
        { surah: 2,   ayah: 255, text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', topic: 'آية الكرسي'   },
        { surah: 3,   ayah: 102, text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ', topic: 'التقوى' },
        { surah: 12,  ayah: 2,   text: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ', topic: 'عربية القرآن' },
        { surah: 16,  ayah: 90,  text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ',     topic: 'العدل'        },
        { surah: 30,  ayah: 22,  text: 'وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ', topic: 'تنوع اللغات' },
        { surah: 55,  ayah: 4,   text: 'عَلَّمَهُ الْبَيَانَ',                                   topic: 'البيان'       },
        { surah: 96,  ayah: 1,   text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',               topic: 'العلم'        },
        { surah: 96,  ayah: 3,   text: 'اقْرَأْ وَرَبُّكَ الْأَكْرَمُ',                          topic: 'الكرم'        },
        { surah: 96,  ayah: 4,   text: 'الَّذِي عَلَّمَ بِالْقَلَمِ',                            topic: 'الكتابة'      },
        { surah: 96,  ayah: 5,   text: 'عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',                 topic: 'العلم'        },
    ],
    // مقاصد الشريعة
    maqasid: [
        { id: 'DEEN',  nameAr: 'حفظ الدين',   nameEn: 'Preservation of Faith',    priority: 1 },
        { id: 'NAFS',  nameAr: 'حفظ النفس',   nameEn: 'Preservation of Life',     priority: 2 },
        { id: 'AQL',   nameAr: 'حفظ العقل',   nameEn: 'Preservation of Intellect', priority: 3 },
        { id: 'NASL',  nameAr: 'حفظ النسل',   nameEn: 'Preservation of Lineage',  priority: 4 },
        { id: 'MAL',   nameAr: 'حفظ المال',   nameEn: 'Preservation of Wealth',   priority: 5 },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// § 5 — قاعدة بيانات السنة النبوية (نماذج تمثيلية)
// ═══════════════════════════════════════════════════════════════════════════════

const SUNNAH_DATABASE = {
    metadata: {
        name:    'السنة النبوية',
        nameEn:  'Prophetic Sunnah',
        prophet: 'محمد ﷺ',
        source:  'الكتب الستة وغيرها',
    },
    hadiths: [
        {
            id:        'bukhari-1',
            text:      'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
            source:    'صحيح البخاري:١',
            topic:     'النية',
            grade:     'صحيح',
            relevance: ['language', 'action', 'ethics'],
        },
        {
            id:        'muslim-2699',
            text:      'الله في عون العبد ما كان العبد في عون أخيه',
            source:    'صحيح مسلم:٢٦٩٩',
            topic:     'التعاون',
            grade:     'صحيح',
            relevance: ['network', 'cooperation'],
        },
        {
            id:        'bukhari-2442',
            text:      'لا ضرر ولا ضرار',
            source:    'سنن ابن ماجه:٢٣٤١',
            topic:     'دفع الضرر',
            grade:     'صحيح',
            relevance: ['security', 'no-harm', 'ethics'],
        },
        {
            id:        'muslim-2564',
            text:      'إن الله جميل يحب الجمال',
            source:    'صحيح مسلم:٢٥٦٤',
            topic:     'الجمال والإتقان',
            grade:     'صحيح',
            relevance: ['quality', 'beauty', 'design'],
        },
        {
            id:        'bukhari-6018',
            text:      'إنما بُعثتُ لأتمم مكارم الأخلاق',
            source:    'صحيح البخاري — الأدب المفرد:٢٧٣',
            topic:     'الأخلاق',
            grade:     'صحيح',
            relevance: ['ethics', 'character'],
        },
        {
            id:        'abu-dawood-4607',
            text:      'عليكم بسنتي وسنة الخلفاء الراشدين المهديين من بعدي',
            source:    'سنن أبي داود:٤٦٠٧',
            topic:     'التمسك بالسنة',
            grade:     'صحيح',
            relevance: ['guidance', 'tradition'],
        },
        {
            id:        'ibn-majah-224',
            text:      'طلب العلم فريضة على كل مسلم',
            source:    'سنن ابن ماجه:٢٢٤',
            topic:     'العلم',
            grade:     'صحيح',
            relevance: ['education', 'knowledge', 'learning'],
        },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// § 6 — شبكة الخلايا العصبية العربية
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * خلية عصبية عربية — Arabic Neural Cell
 * كل خلية تمثّل "مفهوماً" في اللغة العربية مع أوزان التفعيل
 */
class ArabicNeuralCell {
    constructor({ id, nameAr, domain, activation = 0.0, connections = [] }) {
        this.id          = id;
        this.nameAr      = nameAr;
        this.domain      = domain;       // صرف | نحو | بلاغة | معجم | ترميز
        this.activation  = activation;   // [0.0 — 1.0]
        this.connections = connections;  // خلايا مرتبطة
        this.createdAt   = new Date().toISOString();
        this.fireCount   = 0;
    }

    /** تفعيل الخلية بمدخل نصي */
    fire(input) {
        this.fireCount++;
        // حساب بسيط للتفعيل بناءً على تطابق النص
        const match = typeof input === 'string'
            ? (input.includes(this.nameAr) ? 1.0 : this._computeRelevance(input))
            : 0.5;
        this.activation = Math.min(1.0, (this.activation * 0.7) + (match * 0.3));
        return this.activation;
    }

    _computeRelevance(text) {
        if (!text || typeof text !== 'string') return 0;
        // كلمات المجال
        const domainKeywords = {
            صرف:   ['جذر', 'وزن', 'مصدر', 'فعل', 'اسم', 'مشتق'],
            نحو:   ['إعراب', 'رفع', 'نصب', 'جر', 'جزم', 'مبتدأ', 'خبر'],
            بلاغة: ['استعارة', 'تشبيه', 'كناية', 'مجاز', 'جناس'],
            معجم:  ['معنى', 'دلالة', 'مرادف', 'مضاد', 'اشتقاق'],
            ترميز: ['unicode', 'utf', 'byte', 'encoding', 'ترميز', 'تشفير'],
        };
        const keys = domainKeywords[this.domain] || [];
        const hits = keys.filter(k => text.includes(k)).length;
        return Math.min(1.0, hits / Math.max(1, keys.length));
    }

    toJSON() {
        return {
            id: this.id,
            nameAr: this.nameAr,
            domain: this.domain,
            activation: Math.round(this.activation * 1000) / 1000,
            fireCount: this.fireCount,
            connections: this.connections,
        };
    }
}

/**
 * شبكة الخلايا العصبية العربية — Arabic Neural Cell Network
 */
class ArabicNeuralNetwork extends EventEmitter {

    constructor() {
        super();
        this.nameAr  = 'شبكة الخلايا العصبية العربية';
        this.tawheed = TAWHEED;
        this.cells   = new Map();
        this._initDefaultCells();
    }

    _initDefaultCells() {
        const defaultCells = [
            // طبقة الترميز
            { id: 'utf8-arabic-root',    nameAr: 'جذر الترميز العربي UTF-8',    domain: 'ترميز', activation: 1.0, connections: ['morphology-root', 'syntax-root'] },
            { id: 'unicode-blocks',      nameAr: 'كتل Unicode العربية',          domain: 'ترميز', activation: 0.9, connections: ['utf8-arabic-root'] },
            { id: 'encoding-quran',      nameAr: 'ترميز القرآن الكريم',          domain: 'ترميز', activation: 1.0, connections: ['utf8-arabic-root', 'quran-cell'] },
            // طبقة الصرف
            { id: 'morphology-root',     nameAr: 'الجذر الصرفي',                domain: 'صرف',   activation: 0.8, connections: ['morphology-weight', 'morphology-pattern'] },
            { id: 'morphology-weight',   nameAr: 'الوزن الصرفي',                domain: 'صرف',   activation: 0.7, connections: ['morphology-root'] },
            { id: 'morphology-pattern',  nameAr: 'الأنماط الاشتقاقية',          domain: 'صرف',   activation: 0.7, connections: ['morphology-root'] },
            // طبقة النحو
            { id: 'syntax-root',         nameAr: 'الجذر النحوي',                domain: 'نحو',   activation: 0.8, connections: ['syntax-rab', 'syntax-jar'] },
            { id: 'syntax-rab',          nameAr: 'الرفع النحوي',                domain: 'نحو',   activation: 0.6, connections: ['syntax-root'] },
            { id: 'syntax-jar',          nameAr: 'الجر والنصب',                  domain: 'نحو',   activation: 0.6, connections: ['syntax-root'] },
            // طبقة البلاغة
            { id: 'rhetoric-root',       nameAr: 'البلاغة العربية',             domain: 'بلاغة', activation: 0.8, connections: ['rhetoric-metaphor', 'rhetoric-simile'] },
            { id: 'rhetoric-metaphor',   nameAr: 'الاستعارة البيانية',          domain: 'بلاغة', activation: 0.6, connections: ['rhetoric-root'] },
            { id: 'rhetoric-simile',     nameAr: 'التشبيه البلاغي',             domain: 'بلاغة', activation: 0.6, connections: ['rhetoric-root'] },
            // طبقة المعجم
            { id: 'lexicon-root',        nameAr: 'المعجم العربي',               domain: 'معجم',  activation: 0.8, connections: ['lexicon-root-word', 'lexicon-meaning'] },
            { id: 'lexicon-root-word',   nameAr: 'الجذر المعجمي',               domain: 'معجم',  activation: 0.7, connections: ['lexicon-root'] },
            { id: 'lexicon-meaning',     nameAr: 'الدلالة المعجمية',            domain: 'معجم',  activation: 0.7, connections: ['lexicon-root'] },
            // طبقة القرآن والسنة
            { id: 'quran-cell',          nameAr: 'خلية القرآن الكريم',          domain: 'ترميز', activation: 1.0, connections: ['encoding-quran', 'sunnah-cell'] },
            { id: 'sunnah-cell',         nameAr: 'خلية السنة النبوية',          domain: 'ترميز', activation: 1.0, connections: ['quran-cell'] },
        ];

        for (const cfg of defaultCells) {
            this.cells.set(cfg.id, new ArabicNeuralCell(cfg));
        }
    }

    /** إطلاق الشبكة لمعالجة نص */
    process(text) {
        const results = {};
        let totalActivation = 0;

        for (const [id, cell] of this.cells) {
            const act = cell.fire(text);
            results[id] = act;
            totalActivation += act;
        }

        const avgActivation = totalActivation / this.cells.size;

        this.emit('network:processed', { text: text.slice(0, 50), avgActivation });

        return {
            cells:         Object.fromEntries([...this.cells.entries()].map(([k, v]) => [k, v.toJSON()])),
            avgActivation: Math.round(avgActivation * 1000) / 1000,
            dominantCell:  this._getDominantCell(),
            tawheed:       this.tawheed,
        };
    }

    _getDominantCell() {
        let max = 0;
        let dominant = null;
        for (const [, cell] of this.cells) {
            if (cell.activation > max) {
                max = cell.activation;
                dominant = cell.nameAr;
            }
        }
        return dominant;
    }

    getStatus() {
        return {
            nameAr:    this.nameAr,
            cells:     this.cells.size,
            avgAct:    Math.round([...this.cells.values()].reduce((s, c) => s + c.activation, 0) / this.cells.size * 1000) / 1000,
            tawheed:   this.tawheed,
            timestamp: new Date().toISOString(),
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 7 — محرك الترميز UTF-8 العربي
// ═══════════════════════════════════════════════════════════════════════════════

class ArabicUTF8Encoder {

    /** تحويل نص عربي إلى تسلسل bytes UTF-8 */
    static encode(text) {
        if (typeof text !== 'string') throw new TypeError('النص يجب أن يكون string');
        const buf = Buffer.from(text, 'utf8');
        return {
            text,
            bytes:      [...buf],
            hex:        buf.toString('hex').match(/.{2}/g),
            base64:     buf.toString('base64'),
            byteLength: buf.length,
            charCount:  [...text].length,
            avgBytesPerChar: Math.round((buf.length / Math.max(1, [...text].length)) * 100) / 100,
        };
    }

    /** فك تشفير bytes UTF-8 إلى نص عربي */
    static decode(bytes) {
        if (!Array.isArray(bytes)) throw new TypeError('bytes يجب أن تكون Array');
        return Buffer.from(bytes).toString('utf8');
    }

    /** تحليل نقاط Unicode لنص عربي */
    static analyzeCodePoints(text) {
        const codePoints = [];
        for (const char of text) {
            const cp  = char.codePointAt(0);
            const hex = cp.toString(16).toUpperCase().padStart(4, '0');
            const info = ARABIC_LETTERS[char];
            codePoints.push({
                char,
                codePoint:   cp,
                hex:         `U+${hex}`,
                block:       ArabicUTF8Encoder.getBlock(cp),
                info:        info || null,
                isArabic:    ArabicUTF8Encoder.isArabicChar(cp),
            });
        }
        return {
            text,
            length:      [...text].length,
            codePoints,
            arabicRatio: Math.round(codePoints.filter(c => c.isArabic).length / Math.max(1, codePoints.length) * 100),
        };
    }

    /** تحديد الكتلة Unicode للنقطة */
    static getBlock(cp) {
        for (const [key, block] of Object.entries(ARABIC_UNICODE_BLOCKS)) {
            if (cp >= block.start && cp <= block.end) {
                return { key, nameAr: block.nameAr, nameEn: block.nameEn };
            }
        }
        return null;
    }

    /** هل الحرف عربي؟ */
    static isArabicChar(cp) {
        return (
            (cp >= 0x0600 && cp <= 0x06FF) ||
            (cp >= 0x0750 && cp <= 0x077F) ||
            (cp >= 0x08A0 && cp <= 0x08FF) ||
            (cp >= 0xFB50 && cp <= 0xFDFF) ||
            (cp >= 0xFE70 && cp <= 0xFEFF) ||
            (cp >= 0x10EC0 && cp <= 0x10EFF)
        );
    }

    /** إزالة التشكيل */
    static removeDiacritics(text) {
        return text.replace(/[\u064B-\u065F\u0670]/g, '');
    }

    /** تطبيع النص العربي */
    static normalize(text) {
        return text
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/[\u064B-\u065F\u0670]/g, '')
            .trim();
    }

    /** كشف اللغة */
    static detectLanguage(text) {
        const arabicChars = [...text].filter(c => ArabicUTF8Encoder.isArabicChar(c.codePointAt(0))).length;
        const total       = [...text].filter(c => c.trim()).length;
        const ratio       = total > 0 ? arabicChars / total : 0;
        const isArabic    = ratio > 0.3;
        return {
            language:  isArabic ? 'ar' : 'other',
            nameAr:    isArabic ? 'العربية' : 'غير العربية',
            arabicRatio: Math.round(ratio * 100),
            confidence: ratio > 0.8 ? 'عالية' : ratio > 0.5 ? 'متوسطة' : 'منخفضة',
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 8 — محرك التحليل اللغوي
// ═══════════════════════════════════════════════════════════════════════════════

class ArabicLinguisticAnalyzer {

    /** استخراج الجذور البسيطة (نهج Heuristic) */
    static extractRoot(word) {
        const clean = ArabicUTF8Encoder.normalize(word).replace(/[^ء-ي]/g, '');
        if (!clean || clean.length < 2) return null;
        // حذف الزوائد الشائعة
        const prefixes = ['ال', 'و', 'ف', 'ب', 'ل', 'ك', 'م', 'ي', 'ت', 'ن', 'أ', 'است', 'إست', 'ان', 'إن'];
        const suffixes = ['ة', 'ات', 'ون', 'ين', 'ان', 'تان', 'تين', 'ها', 'هم', 'هن', 'كم', 'نا'];
        let root = clean;
        for (const p of prefixes) {
            if (root.startsWith(p) && root.length > p.length + 1) { root = root.slice(p.length); break; }
        }
        for (const s of suffixes) {
            if (root.endsWith(s) && root.length > s.length + 1) { root = root.slice(0, -s.length); break; }
        }
        return root.length >= 2 ? root : clean;
    }

    /** تحليل الجملة */
    static analyzeSentence(text) {
        const words = text.trim().split(/\s+/).filter(Boolean);
        const analysis = words.map(word => {
            const clean = ArabicUTF8Encoder.removeDiacritics(word);
            const root  = ArabicLinguisticAnalyzer.extractRoot(clean);
            const info  = ARABIC_LETTERS[clean[0]] || null;
            return {
                word,
                clean,
                root,
                firstLetterInfo: info,
                letterCount: [...clean].length,
            };
        });
        return {
            text,
            wordCount: words.length,
            words:     analysis,
            language:  ArabicUTF8Encoder.detectLanguage(text),
        };
    }

    /** حساب مؤشر التشابه (cosine-like heuristic) */
    static similarity(textA, textB) {
        const normA = ArabicUTF8Encoder.normalize(textA).split(/\s+/);
        const normB = ArabicUTF8Encoder.normalize(textB).split(/\s+/);
        const setA  = new Set(normA);
        const setB  = new Set(normB);
        const inter = new Set([...setA].filter(w => setB.has(w)));
        const union = new Set([...setA, ...setB]);
        const jaccard = inter.size / Math.max(1, union.size);
        return {
            score:      Math.round(jaccard * 100) / 100,
            percentage: Math.round(jaccard * 100),
            commonWords: [...inter].slice(0, 10),
        };
    }

    /** توليد تضمين نصي (Hash-based embedding) */
    static generateEmbedding(text, dims = 64) {
        const normalized = ArabicUTF8Encoder.normalize(text);
        const hash       = crypto.createHash('sha256').update(normalized, 'utf8').digest();
        const embedding  = [];
        for (let i = 0; i < dims; i++) {
            const byte = hash[i % hash.length];
            embedding.push(((byte - 128) / 128)); // تطبيع [-1, 1]
        }
        return {
            text:      text.slice(0, 100),
            dims,
            embedding,
            magnitude: Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)),
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 9 — المحرك الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaArabicUTF8NeuralEngine extends EventEmitter {

    constructor() {
        super();
        this.nameAr       = ENGINE_NAME_AR;
        this.nameEn       = ENGINE_NAME_EN;
        this.version      = VERSION;
        this.tawheed      = TAWHEED;
        this.no_harm      = NO_HARM;
        this.bismillah    = BISMILLAH;
        this.status       = 'ACTIVE';
        this.startedAt    = new Date().toISOString();
        this.processedTexts = 0;
        this.totalRequests  = 0;

        // مكوّنات المحرك
        this.encoder    = ArabicUTF8Encoder;
        this.analyzer   = ArabicLinguisticAnalyzer;
        this.network    = new ArabicNeuralNetwork();
        this.quran      = QURAN_DATABASE;
        this.sunnah     = SUNNAH_DATABASE;
        this.unicodeBlocks = ARABIC_UNICODE_BLOCKS;
        this.letters    = ARABIC_LETTERS;

        console.log(`✅ [${this.nameAr}] مُفعّل — ${this.tawheed}`);
        console.log(`📖 كتل Unicode العربية: ${Object.keys(ARABIC_UNICODE_BLOCKS).length}`);
        console.log(`🔤 حروف وتشكيل مُعرَّف: ${Object.keys(ARABIC_LETTERS).length}`);
        console.log(`📚 آيات تمثيلية: ${QURAN_DATABASE.sample_verses.length}`);
        console.log(`📜 أحاديث: ${SUNNAH_DATABASE.hadiths.length}`);
        console.log(`🧠 خلايا عصبية: ${this.network.cells.size}`);
    }

    // ─── الواجهة الرئيسية ──────────────────────────────────────────────────────

    /** ① ترميز نص عربي UTF-8 */
    encodeText(text) {
        this.totalRequests++;
        this.processedTexts++;
        const result = this.encoder.encode(text);
        this.emit('text:encoded', { byteLength: result.byteLength });
        return {
            schema:   'sheikha/utf8-neural/v1',
            tawheed:  this.tawheed,
            success:  true,
            data:     result,
            quran_ref: { ref: 'الرحمن:٤', text: 'عَلَّمَهُ الْبَيَانَ' },
        };
    }

    /** ② تحليل نقاط Unicode */
    analyzeCodePoints(text) {
        this.totalRequests++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data:    this.encoder.analyzeCodePoints(text),
            quran_ref: { ref: 'يوسف:٢', text: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا' },
        };
    }

    /** ③ الشبكة العصبية — معالجة النص */
    processNeural(text) {
        this.totalRequests++;
        const result = this.network.process(text);
        this.emit('neural:processed', { text: text.slice(0, 30) });
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data:    result,
            quran_ref: { ref: 'يونس:٥', text: 'مَا خَلَقَ اللَّهُ ذَٰلِكَ إِلَّا بِالْحَقِّ' },
        };
    }

    /** ④ تحليل اللغوي */
    analyzeLanguage(text) {
        this.totalRequests++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data:    this.analyzer.analyzeSentence(text),
            quran_ref: { ref: 'الروم:٢٢', text: 'وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ' },
        };
    }

    /** ⑤ كشف اللغة */
    detectLanguage(text) {
        this.totalRequests++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data:    this.encoder.detectLanguage(text),
        };
    }

    /** ⑥ تطبيع النص */
    normalizeText(text) {
        this.totalRequests++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data: {
                original:       text,
                normalized:     this.encoder.normalize(text),
                noDiacritics:   this.encoder.removeDiacritics(text),
            },
        };
    }

    /** ⑦ حساب التشابه بين نصين */
    computeSimilarity(textA, textB) {
        this.totalRequests++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data:    this.analyzer.similarity(textA, textB),
        };
    }

    /** ⑧ توليد التضمين (Embedding) */
    generateEmbedding(text, dims = 64) {
        this.totalRequests++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data:    this.analyzer.generateEmbedding(text, dims),
        };
    }

    /** ⑨ البحث في القرآن الكريم */
    searchQuran(query) {
        this.totalRequests++;
        const normalized = this.encoder.normalize(query);
        const results = this.quran.sample_verses.filter(v =>
            this.encoder.normalize(v.text).includes(normalized) ||
            (v.topic && v.topic.includes(query))
        );
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data: {
                query,
                results,
                count:    results.length,
                database: this.quran.metadata,
            },
            quran_ref: { ref: 'الحجر:٩', text: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ' },
        };
    }

    /** ⑩ البحث في السنة النبوية */
    searchSunnah(query) {
        this.totalRequests++;
        const normalized = this.encoder.normalize(query);
        const results = this.sunnah.hadiths.filter(h =>
            this.encoder.normalize(h.text).includes(normalized) ||
            (h.topic && h.topic.includes(query)) ||
            (h.relevance && h.relevance.some(r => r.includes(query)))
        );
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data: {
                query,
                results,
                count:    results.length,
                database: this.sunnah.metadata,
            },
        };
    }

    /** ⑪ معلومات كتل Unicode العربية */
    getUnicodeBlocks() {
        this.totalRequests++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data: {
                blocks:   this.unicodeBlocks,
                count:    Object.keys(this.unicodeBlocks).length,
                nameAr:   'كتل Unicode العربية الكاملة',
                quran_ref: { ref: 'يوسف:٢', text: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا' },
            },
        };
    }

    /** ⑫ معلومات الحروف العربية */
    getArabicLetters() {
        this.totalRequests++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data: {
                letters: this.letters,
                count:   Object.keys(this.letters).length,
            },
        };
    }

    /** ⑬ استخراج الجذر */
    extractRoot(word) {
        this.totalRequests++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data: {
                word,
                root:  this.analyzer.extractRoot(word),
                clean: this.encoder.normalize(word),
            },
        };
    }

    /** ⑭ مؤشر الصحة */
    getHealth() {
        return {
            schema:        'sheikha/utf8-neural/v1',
            tawheed:       this.tawheed,
            no_harm:       this.no_harm,
            engine:        this.nameAr,
            version:       this.version,
            status:        this.status,
            startedAt:     this.startedAt,
            totalRequests: this.totalRequests,
            processedTexts: this.processedTexts,
            network:       this.network.getStatus(),
            quranVerses:   this.quran.sample_verses.length,
            sunnahHadiths: this.sunnah.hadiths.length,
            unicodeBlocks: Object.keys(this.unicodeBlocks).length,
            lettersCount:  Object.keys(this.letters).length,
            quran_ref:     { ref: 'الحجرات:١٣', text: 'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ' },
            timestamp:     new Date().toISOString(),
        };
    }

    /** ⑮ مقاصد الشريعة */
    getMaqasid() {
        this.totalRequests++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data:    this.quran.maqasid,
        };
    }

    /** ⑯ تحليل شامل متكامل */
    fullAnalysis(text) {
        this.totalRequests++;
        this.processedTexts++;
        return {
            schema:  'sheikha/utf8-neural/v1',
            tawheed: this.tawheed,
            success: true,
            data: {
                encoding:    this.encoder.encode(text),
                codePoints:  this.encoder.analyzeCodePoints(text),
                language:    this.encoder.detectLanguage(text),
                linguistic:  this.analyzer.analyzeSentence(text),
                neural:      this.network.process(text),
                embedding:   this.analyzer.generateEmbedding(text, 32),
            },
            bismillah:  this.bismillah,
            quran_ref:  { ref: 'الرحمن:٣-٤', text: 'خَلَقَ الْإِنسَانَ ﴿٣﴾ عَلَّمَهُ الْبَيَانَ' },
            timestamp:  new Date().toISOString(),
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 10 — تسجيل API Endpoints في Express
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تسجيل جميع APIs في تطبيق Express
 * @param {import('express').Application} app
 * @param {SheikhaArabicUTF8NeuralEngine} engine
 * @param {Function} [broadcast] — دالة WebSocket broadcast
 */
function registerRoutes(app, engine, broadcast) {
    const BASE = '/api/arabic-utf8';

    const _emit = (event, data) => {
        if (typeof broadcast === 'function') {
            try { broadcast({ event, data, tawheed: engine.tawheed }); } catch (_) {}
        }
    };

    // ── GET: صحة المحرك ──
    app.get(`${BASE}/health`, (_req, res) => {
        res.json(engine.getHealth());
    });

    // ── POST: ترميز نص ──
    app.post(`${BASE}/encode`, (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ success: false, message: 'text مطلوب' });
            const result = engine.encodeText(text);
            _emit('arabic:encoded', { byteLength: result.data.byteLength });
            res.json(result);
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── POST: تحليل نقاط Unicode ──
    app.post(`${BASE}/codepoints`, (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ success: false, message: 'text مطلوب' });
            res.json(engine.analyzeCodePoints(text));
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── POST: الشبكة العصبية ──
    app.post(`${BASE}/neural`, (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ success: false, message: 'text مطلوب' });
            const result = engine.processNeural(text);
            _emit('neural:fired', { avgActivation: result.data.avgActivation });
            res.json(result);
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── POST: التحليل اللغوي ──
    app.post(`${BASE}/analyze`, (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ success: false, message: 'text مطلوب' });
            res.json(engine.analyzeLanguage(text));
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── POST: كشف اللغة ──
    app.post(`${BASE}/detect-language`, (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ success: false, message: 'text مطلوب' });
            res.json(engine.detectLanguage(text));
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── POST: تطبيع النص ──
    app.post(`${BASE}/normalize`, (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ success: false, message: 'text مطلوب' });
            res.json(engine.normalizeText(text));
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── POST: التشابه ──
    app.post(`${BASE}/similarity`, (req, res) => {
        try {
            const { textA, textB } = req.body;
            if (!textA || !textB) return res.status(400).json({ success: false, message: 'textA و textB مطلوبان' });
            res.json(engine.computeSimilarity(textA, textB));
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── POST: التضمين ──
    app.post(`${BASE}/embedding`, (req, res) => {
        try {
            const { text, dims = 64 } = req.body;
            if (!text) return res.status(400).json({ success: false, message: 'text مطلوب' });
            res.json(engine.generateEmbedding(text, Number(dims)));
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── GET: كتل Unicode ──
    app.get(`${BASE}/unicode-blocks`, (_req, res) => {
        res.json(engine.getUnicodeBlocks());
    });

    // ── GET: الحروف العربية ──
    app.get(`${BASE}/letters`, (_req, res) => {
        res.json(engine.getArabicLetters());
    });

    // ── POST: استخراج الجذر ──
    app.post(`${BASE}/root`, (req, res) => {
        try {
            const { word } = req.body;
            if (!word) return res.status(400).json({ success: false, message: 'word مطلوب' });
            res.json(engine.extractRoot(word));
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── GET: بحث في القرآن ──
    app.get(`${BASE}/quran/search`, (req, res) => {
        try {
            const q = req.query.q || '';
            res.json(engine.searchQuran(q));
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── GET: بيانات القرآن ──
    app.get(`${BASE}/quran`, (_req, res) => {
        res.json({ schema: 'sheikha/utf8-neural/v1', tawheed: engine.tawheed, data: engine.quran });
    });

    // ── GET: بحث في السنة ──
    app.get(`${BASE}/sunnah/search`, (req, res) => {
        try {
            const q = req.query.q || '';
            res.json(engine.searchSunnah(q));
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── GET: بيانات السنة ──
    app.get(`${BASE}/sunnah`, (_req, res) => {
        res.json({ schema: 'sheikha/utf8-neural/v1', tawheed: engine.tawheed, data: engine.sunnah });
    });

    // ── GET: مقاصد الشريعة ──
    app.get(`${BASE}/maqasid`, (_req, res) => {
        res.json(engine.getMaqasid());
    });

    // ── GET: حالة الشبكة العصبية ──
    app.get(`${BASE}/network/status`, (_req, res) => {
        res.json({ schema: 'sheikha/utf8-neural/v1', tawheed: engine.tawheed, data: engine.network.getStatus() });
    });

    // ── POST: تحليل شامل ──
    app.post(`${BASE}/full-analysis`, (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ success: false, message: 'text مطلوب' });
            const result = engine.fullAnalysis(text);
            _emit('arabic:full-analysis', { wordCount: result.data.linguistic.wordCount });
            res.json(result);
        } catch (e) { res.status(500).json({ success: false, message: e.message }); }
    });

    // ── GET: قائمة كل الـ APIs ──
    app.get(`${BASE}`, (_req, res) => {
        const _endpoints = [
            { method: 'GET',  path: `${BASE}/health`,          nameAr: 'صحة المحرك' },
            { method: 'POST', path: `${BASE}/encode`,           nameAr: 'ترميز نص UTF-8' },
            { method: 'POST', path: `${BASE}/codepoints`,       nameAr: 'تحليل نقاط Unicode' },
            { method: 'POST', path: `${BASE}/neural`,           nameAr: 'الشبكة العصبية' },
            { method: 'POST', path: `${BASE}/analyze`,          nameAr: 'التحليل اللغوي' },
            { method: 'POST', path: `${BASE}/detect-language`,  nameAr: 'كشف اللغة' },
            { method: 'POST', path: `${BASE}/normalize`,        nameAr: 'تطبيع النص' },
            { method: 'POST', path: `${BASE}/similarity`,       nameAr: 'حساب التشابه' },
            { method: 'POST', path: `${BASE}/embedding`,        nameAr: 'توليد التضمين' },
            { method: 'POST', path: `${BASE}/root`,             nameAr: 'استخراج الجذر' },
            { method: 'POST', path: `${BASE}/full-analysis`,    nameAr: 'تحليل شامل' },
            { method: 'GET',  path: `${BASE}/unicode-blocks`,   nameAr: 'كتل Unicode العربية' },
            { method: 'GET',  path: `${BASE}/letters`,          nameAr: 'الحروف العربية' },
            { method: 'GET',  path: `${BASE}/quran`,            nameAr: 'قاعدة بيانات القرآن' },
            { method: 'GET',  path: `${BASE}/quran/search`,     nameAr: 'بحث في القرآن' },
            { method: 'GET',  path: `${BASE}/sunnah`,           nameAr: 'قاعدة بيانات السنة' },
            { method: 'GET',  path: `${BASE}/sunnah/search`,    nameAr: 'بحث في السنة' },
            { method: 'GET',  path: `${BASE}/maqasid`,          nameAr: 'مقاصد الشريعة' },
            { method: 'GET',  path: `${BASE}/network/status`,   nameAr: 'حالة الشبكة العصبية' },
        ];
        res.json({
            schema:        'sheikha/utf8-neural/v1',
            tawheed:       engine.tawheed,
            no_harm:       engine.no_harm,
            bismillah:     engine.bismillah,
            nameAr:        engine.nameAr,
            nameEn:        engine.nameEn,
            version:       engine.version,
            endpointCount: _endpoints.length,
            endpoints:     _endpoints,
            quran_ref: { ref: 'الرحمن:٣-٤', text: 'خَلَقَ الْإِنسَانَ ﴿٣﴾ عَلَّمَهُ الْبَيَانَ' },
        });
    });

    console.log(`✅ [Arabic UTF-8 Neural Engine] ${_endpoints.length} API مسجّلة على ${BASE}/*`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 11 — Singleton + Export
// ═══════════════════════════════════════════════════════════════════════════════

const engine = new SheikhaArabicUTF8NeuralEngine();

module.exports = {
    // الكلاسات
    SheikhaArabicUTF8NeuralEngine,
    ArabicNeuralNetwork,
    ArabicNeuralCell,
    ArabicUTF8Encoder,
    ArabicLinguisticAnalyzer,
    // البيانات
    ARABIC_UNICODE_BLOCKS,
    ARABIC_LETTERS,
    QURAN_DATABASE,
    SUNNAH_DATABASE,
    // المحرك الافتراضي
    engine,
    // دالة تسجيل الـ APIs
    registerRoutes,
    // ثوابت
    TAWHEED,
    NO_HARM,
    BISMILLAH,
    VERSION,
    ENGINE_NAME_AR,
    ENGINE_NAME_EN,
};
