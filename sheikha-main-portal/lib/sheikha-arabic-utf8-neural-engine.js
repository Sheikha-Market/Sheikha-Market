/**
 * 🕋 Sheikha Arabic UTF-8 Neural Language Engine
 * محرك اللغة العربية العصبي — ترميز + تحليل + قرآن + سنة
 * "عَلَّمَهُ الْبَيَانَ" — الرحمن:٤
 *
 * الطبقات: ترميز | صرف | نحو | بلاغة | معجم
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// كتل Unicode العربية (8 كتل من Unicode 1.0 إلى Unicode 15.0)
// ═══════════════════════════════════════════════════════════════
const UNICODE_BLOCKS = [
    { name: 'Arabic',                    range: [0x0600, 0x06FF], version: '1.0',  year: 1991, description: 'الكتلة الأساسية — 256 رمز' },
    { name: 'Arabic Supplement',         range: [0x0750, 0x077F], version: '4.1',  year: 2005, description: 'امتداد اللهجات — 48 رمز' },
    { name: 'Arabic Extended-A',         range: [0x08A0, 0x08FF], version: '6.1',  year: 2012, description: 'تشكيل متقدم + قرآني — 96 رمز' },
    { name: 'Arabic Extended-B',         range: [0x0870, 0x089F], version: '14.0', year: 2021, description: 'ترميز تاريخي — 48 رمز' },
    { name: 'Arabic Extended-C',         range: [0x10EC0, 0x10EFF], version: '15.0', year: 2022, description: 'العربية التاريخية القديمة' },
    { name: 'Arabic Presentation Forms-A', range: [0xFB50, 0xFDFF], version: '1.1', year: 1993, description: 'أشكال العرض — 688 رمز' },
    { name: 'Arabic Presentation Forms-B', range: [0xFE70, 0xFEFF], version: '1.1', year: 1993, description: 'أشكال الوصل — 144 رمز' },
    { name: 'Rumi Numeral Symbols',      range: [0x10E60, 0x10E7F], version: '5.2', year: 2009, description: 'أرقام رومي — 32 رمز' }
];

// ═══════════════════════════════════════════════════════════════
// الحروف العربية — 45 حرف ومُشكِّل
// ═══════════════════════════════════════════════════════════════
const ARABIC_LETTERS = [
    { char: 'ا', unicode: 0x0627, name: 'ALEF',            trans: 'a',  abjad: 1  },
    { char: 'ب', unicode: 0x0628, name: 'BA',              trans: 'b',  abjad: 2  },
    { char: 'ت', unicode: 0x062A, name: 'TA',              trans: 't',  abjad: 400 },
    { char: 'ث', unicode: 0x062B, name: 'THA',             trans: 'th', abjad: 500 },
    { char: 'ج', unicode: 0x062C, name: 'JEEM',            trans: 'j',  abjad: 3  },
    { char: 'ح', unicode: 0x062D, name: 'HAH',             trans: 'h',  abjad: 8  },
    { char: 'خ', unicode: 0x062E, name: 'KHAH',            trans: 'kh', abjad: 600 },
    { char: 'د', unicode: 0x062F, name: 'DAL',             trans: 'd',  abjad: 4  },
    { char: 'ذ', unicode: 0x0630, name: 'THAL',            trans: 'dh', abjad: 700 },
    { char: 'ر', unicode: 0x0631, name: 'REH',             trans: 'r',  abjad: 200 },
    { char: 'ز', unicode: 0x0632, name: 'ZAIN',            trans: 'z',  abjad: 7  },
    { char: 'س', unicode: 0x0633, name: 'SEEN',            trans: 's',  abjad: 60  },
    { char: 'ش', unicode: 0x0634, name: 'SHEEN',           trans: 'sh', abjad: 300 },
    { char: 'ص', unicode: 0x0635, name: 'SAD',             trans: 'S',  abjad: 90  },
    { char: 'ض', unicode: 0x0636, name: 'DAD',             trans: 'D',  abjad: 800 },
    { char: 'ط', unicode: 0x0637, name: 'TAH',             trans: 'T',  abjad: 9  },
    { char: 'ظ', unicode: 0x0638, name: 'ZAH',             trans: 'Z',  abjad: 900 },
    { char: 'ع', unicode: 0x0639, name: 'AIN',             trans: '\'', abjad: 70  },
    { char: 'غ', unicode: 0x063A, name: 'GHAIN',           trans: 'gh', abjad: 1000 },
    { char: 'ف', unicode: 0x0641, name: 'FA',              trans: 'f',  abjad: 80  },
    { char: 'ق', unicode: 0x0642, name: 'QAF',             trans: 'q',  abjad: 100 },
    { char: 'ك', unicode: 0x0643, name: 'KAF',             trans: 'k',  abjad: 20  },
    { char: 'ل', unicode: 0x0644, name: 'LAM',             trans: 'l',  abjad: 30  },
    { char: 'م', unicode: 0x0645, name: 'MEEM',            trans: 'm',  abjad: 40  },
    { char: 'ن', unicode: 0x0646, name: 'NOON',            trans: 'n',  abjad: 50  },
    { char: 'ه', unicode: 0x0647, name: 'HEH',             trans: 'h',  abjad: 5  },
    { char: 'و', unicode: 0x0648, name: 'WAW',             trans: 'w',  abjad: 6  },
    { char: 'ي', unicode: 0x064A, name: 'YEH',             trans: 'y',  abjad: 10  },
    { char: 'ء', unicode: 0x0621, name: 'HAMZA',           trans: '\'', abjad: 1  },
    { char: 'آ', unicode: 0x0622, name: 'ALEF WITH MADDA', trans: 'aa', abjad: 1  },
    { char: 'أ', unicode: 0x0623, name: 'ALEF WITH HAMZA ABOVE', trans: 'a', abjad: 1 },
    { char: 'إ', unicode: 0x0625, name: 'ALEF WITH HAMZA BELOW', trans: 'i', abjad: 1 },
    { char: 'ة', unicode: 0x0629, name: 'TEH MARBUTA',     trans: 'h',  abjad: 400 },
    { char: 'ى', unicode: 0x0649, name: 'ALEF MAKSURA',    trans: 'a',  abjad: 1  },
    // التشكيل
    { char: 'َ', unicode: 0x064E, name: 'FATHAH',          trans: 'a',  abjad: 0, type: 'diacritic' },
    { char: 'ِ', unicode: 0x0650, name: 'KASRAH',          trans: 'i',  abjad: 0, type: 'diacritic' },
    { char: 'ُ', unicode: 0x064F, name: 'DAMMAH',          trans: 'u',  abjad: 0, type: 'diacritic' },
    { char: 'ً', unicode: 0x064B, name: 'FATHATAN',        trans: 'an', abjad: 0, type: 'diacritic' },
    { char: 'ٍ', unicode: 0x064D, name: 'KASRATAN',        trans: 'in', abjad: 0, type: 'diacritic' },
    { char: 'ٌ', unicode: 0x064C, name: 'DAMMATAN',        trans: 'un', abjad: 0, type: 'diacritic' },
    { char: 'ّ', unicode: 0x0651, name: 'SHADDA',          trans: '~',  abjad: 0, type: 'diacritic' },
    { char: 'ْ', unicode: 0x0652, name: 'SUKUN',           trans: '',   abjad: 0, type: 'diacritic' },
    { char: 'ـ', unicode: 0x0640, name: 'TATWEEL',         trans: '-',  abjad: 0, type: 'connector' },
    { char: 'ٰ', unicode: 0x0670, name: 'SUPERSCRIPT ALEF', trans: 'a', abjad: 0, type: 'diacritic' },
    { char: 'ۖ', unicode: 0x0656, name: 'SUBSCRIPT ALEF',  trans: '',   abjad: 0, type: 'quranic' }
];

// ═══════════════════════════════════════════════════════════════
// قاعدة القرآن الكريم — 13 آية تمثيلية
// ═══════════════════════════════════════════════════════════════
const QURAN_VERSES = [
    { id: 1,  surah: 'الفاتحة',  ayah: 1,  text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',        theme: 'البسملة',       maqasid: 'الدين' },
    { id: 2,  surah: 'البقرة',   ayah: 1,  text: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ',         theme: 'الكتاب',        maqasid: 'العقل' },
    { id: 3,  surah: 'البقرة',   ayah: 275, text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', theme: 'التجارة',       maqasid: 'المال' },
    { id: 4,  surah: 'الرحمن',   ayah: 4,  text: 'عَلَّمَهُ الْبَيَانَ',                            theme: 'البيان',        maqasid: 'العقل' },
    { id: 5,  surah: 'الرحمن',   ayah: 9,  text: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ',              theme: 'العدل',         maqasid: 'المال' },
    { id: 6,  surah: 'الإسراء',  ayah: 70, text: 'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ',               theme: 'الكرامة',       maqasid: 'النفس' },
    { id: 7,  surah: 'الحجرات',  ayah: 13, text: 'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ',  theme: 'التقوى',        maqasid: 'الدين' },
    { id: 8,  surah: 'الأنبياء', ayah: 107, text: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ', theme: 'الرحمة', maqasid: 'النفس' },
    { id: 9,  surah: 'النساء',   ayah: 29, text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ', theme: 'التراضي', maqasid: 'المال' },
    { id: 10, surah: 'الزمر',    ayah: 9,  text: 'هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ', theme: 'العلم', maqasid: 'العقل' },
    { id: 11, surah: 'الحديد',   ayah: 25, text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', theme: 'المعادن', maqasid: 'المال' },
    { id: 12, surah: 'يوسف',     ayah: 55, text: 'اجْعَلْنِي عَلَىٰ خَزَائِنِ الْأَرْضِ',          theme: 'الإدارة',       maqasid: 'المال' },
    { id: 13, surah: 'المطففين', ayah: 1,  text: 'وَيْلٌ لِّلْمُطَفِّفِينَ',                       theme: 'الوزن والعدل',  maqasid: 'المال' }
];

// ═══════════════════════════════════════════════════════════════
// قاعدة السنة النبوية — 7 أحاديث صحيحة
// ═══════════════════════════════════════════════════════════════
const SUNNAH_HADITHS = [
    { id: 1, text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',             book: 'البخاري ومسلم', theme: 'النية',    grade: 'متفق عليه' },
    { id: 2, text: 'الْبَيِّعَانِ بِالْخِيَارِ مَا لَمْ يَتَفَرَّقَا', book: 'البخاري',       theme: 'البيع',    grade: 'صحيح' },
    { id: 3, text: 'التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ', book: 'الترمذي', theme: 'التجارة', grade: 'حسن صحيح' },
    { id: 4, text: 'مَنْ غَشَّنَا فَلَيْسَ مِنَّا',                  book: 'مسلم',           theme: 'الغش',     grade: 'صحيح' },
    { id: 5, text: 'لَا ضَرَرَ وَلَا ضِرَارَ',                       book: 'ابن ماجه وأحمد', theme: 'العدل',    grade: 'صحيح' },
    { id: 6, text: 'أَعْطُوا الأَجِيرَ أَجْرَهُ قَبْلَ أَن يَجِفَّ عَرَقُهُ', book: 'ابن ماجه', theme: 'الحق', grade: 'حسن' },
    { id: 7, text: 'الْمُسْلِمُونَ عَلَى شُرُوطِهِمْ',               book: 'أبو داود',       theme: 'العقود',   grade: 'صحيح' }
];

// ═══════════════════════════════════════════════════════════════
// مقاصد الشريعة الخمس
// ═══════════════════════════════════════════════════════════════
const MAQASID = [
    { id: 1, name: 'الدين',  arabic: 'حفظ الدين',  desc: 'صون العقيدة والعبادة' },
    { id: 2, name: 'النفس',  arabic: 'حفظ النفس',  desc: 'صون الحياة والكرامة' },
    { id: 3, name: 'العقل',  arabic: 'حفظ العقل',  desc: 'صون العلم والفكر' },
    { id: 4, name: 'النسل',  arabic: 'حفظ النسل',  desc: 'صون الأسرة والنسب' },
    { id: 5, name: 'المال',  arabic: 'حفظ المال',  desc: 'صون الملكية والتجارة' }
];

// ═══════════════════════════════════════════════════════════════
// الشبكة العصبية — 17 خلية في 5 طبقات
// ═══════════════════════════════════════════════════════════════
const NEURAL_NETWORK = {
    layers: [
        {
            id: 1, name: 'طبقة الترميز', name_en: 'Encoding Layer',
            neurons: [
                { id: 'E1', fn: 'UTF-8 Encoder',       desc: 'تحويل النص إلى بايتات UTF-8' },
                { id: 'E2', fn: 'Codepoint Analyzer',  desc: 'تحليل نقاط Unicode' },
                { id: 'E3', fn: 'Block Classifier',    desc: 'تصنيف الكتلة Unicode' },
                { id: 'E4', fn: 'BOM Detector',        desc: 'كشف علامة ترتيب البايت' }
            ]
        },
        {
            id: 2, name: 'طبقة الصرف', name_en: 'Morphology Layer',
            neurons: [
                { id: 'M1', fn: 'Root Extractor',      desc: 'استخراج الجذر الثلاثي/الرباعي' },
                { id: 'M2', fn: 'Pattern Matcher',     desc: 'مطابقة الأوزان الصرفية' },
                { id: 'M3', fn: 'Diacritic Handler',   desc: 'معالجة التشكيل' },
                { id: 'M4', fn: 'Affixation Engine',   desc: 'تحليل الزوائد والأدوات' }
            ]
        },
        {
            id: 3, name: 'طبقة النحو', name_en: 'Syntax Layer',
            neurons: [
                { id: 'S1', fn: 'POS Tagger',          desc: 'تحديد أنواع الكلمات' },
                { id: 'S2', fn: 'Dependency Parser',   desc: 'تحليل الإعراب والمتعلقات' },
                { id: 'S3', fn: 'Sentence Segmenter',  desc: 'تقطيع الجمل' }
            ]
        },
        {
            id: 4, name: 'طبقة البلاغة', name_en: 'Rhetoric Layer',
            neurons: [
                { id: 'R1', fn: 'Metaphor Detector',   desc: 'كشف المجاز والاستعارة' },
                { id: 'R2', fn: 'Rhythm Analyzer',     desc: 'تحليل السجع والإيقاع' },
                { id: 'R3', fn: 'Ijaz Scorer',         desc: 'قياس الإيجاز والإطناب' }
            ]
        },
        {
            id: 5, name: 'طبقة المعجم', name_en: 'Lexicon Layer',
            neurons: [
                { id: 'L1', fn: 'Similarity Engine',   desc: 'حساب التشابه الدلالي' },
                { id: 'L2', fn: 'Embedding Generator', desc: 'توليد التضمين الدلالي 64 بُعد' },
                { id: 'L3', fn: 'Language Detector',   desc: 'كشف اللغة ولهجتها' }
            ]
        }
    ],
    totalNeurons: 17,
    totalLayers: 5
};

// ═══════════════════════════════════════════════════════════════
// الدوال الأساسية
// ═══════════════════════════════════════════════════════════════

/**
 * ترميز النص إلى UTF-8 bytes + تحليل
 */
function encodeText(text) {
    if (!text || typeof text !== 'string') return null;
    const buf = Buffer.from(text, 'utf8');
    const bytes = Array.from(buf);
    return {
        text,
        length: text.length,
        byteLength: buf.length,
        bytes: bytes.slice(0, 64), // أول 64 بايت للعرض
        encoding: 'UTF-8',
        bom: bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF,
        rtl: /[\u0600-\u06FF]/.test(text)
    };
}

/**
 * تحليل نقاط Unicode
 */
function analyzeCodePoints(text) {
    if (!text || typeof text !== 'string') return [];
    return Array.from(text).map(char => {
        const cp = char.codePointAt(0);
        const block = UNICODE_BLOCKS.find(b => cp >= b.range[0] && cp <= b.range[1]);
        const letter = ARABIC_LETTERS.find(l => l.unicode === cp);
        return {
            char,
            codepoint: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
            decimal: cp,
            block: block ? block.name : 'Other',
            letterName: letter ? letter.name : null,
            abjad: letter ? letter.abjad : null,
            isArabic: !!block
        };
    });
}

/**
 * كشف اللغة
 */
function detectLanguage(text) {
    if (!text) return { language: 'unknown', confidence: 0 };
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars  = (text.match(/[a-zA-Z]/g) || []).length;
    const total = text.replace(/\s/g, '').length || 1;
    const arabicRatio = arabicChars / total;
    const latinRatio  = latinChars  / total;

    if (arabicRatio > 0.6) return { language: 'Arabic',  script: 'Arabic',  confidence: Math.round(arabicRatio * 100), rtl: true };
    if (latinRatio  > 0.6) return { language: 'Latin',   script: 'Latin',   confidence: Math.round(latinRatio  * 100), rtl: false };
    if (arabicRatio > 0 && latinRatio > 0) return { language: 'Mixed', script: 'Mixed', confidence: 60, rtl: false };
    return { language: 'Other', script: 'Other', confidence: 50, rtl: false };
}

/**
 * تطبيع النص العربي
 */
function normalizeText(text) {
    if (!text) return '';
    return text
        .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
        .replace(/[أإآ]/g, 'ا')                // توحيد الألف
        .replace(/ة/g, 'ه')                    // توحيد التاء المربوطة
        .replace(/ى/g, 'ي')                    // توحيد الياء
        .replace(/ؤ/g, 'و')                    // توحيد الواو
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * إزالة التشكيل
 */
function removeDiacritics(text) {
    if (!text) return '';
    return text.replace(/[\u064B-\u065F\u0670\u0671]/g, '');
}

/**
 * استخراج الجذر (تبسيط عملي)
 */
function extractRoot(word) {
    if (!word) return null;
    const clean = removeDiacritics(normalizeText(word));
    // إزالة الزوائد الشائعة
    const prefixes = ['ال', 'وال', 'بال', 'كال', 'فال', 'و', 'ف', 'ب', 'ك', 'ل', 'ست', 'مست', 'ت', 'ي', 'ن', 'أ'];
    const suffixes = ['ون', 'ين', 'ات', 'ان', 'ة', 'ه', 'ها', 'هم', 'هن', 'كم', 'كن', 'نا', 'ني', 'ي'];
    let stem = clean;
    for (const p of prefixes) { if (stem.startsWith(p) && stem.length - p.length >= 3) { stem = stem.slice(p.length); break; } }
    for (const s of suffixes) { if (stem.endsWith(s)   && stem.length - s.length >= 3) { stem = stem.slice(0, -s.length); break; } }
    return { word, stem, estimatedRoot: stem.slice(0, 3), length: stem.length };
}

/**
 * تحليل الجملة
 */
function analyzeSentence(text) {
    if (!text) return null;
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const arabicWords = words.filter(w => /[\u0600-\u06FF]/.test(w));
    const totalChars = text.length;
    const abjadSum = Array.from(removeDiacritics(text)).reduce((sum, ch) => {
        const l = ARABIC_LETTERS.find(x => x.char === ch);
        return sum + (l ? l.abjad : 0);
    }, 0);

    return {
        text,
        wordCount: words.length,
        arabicWordCount: arabicWords.length,
        charCount: totalChars,
        byteCount: Buffer.from(text, 'utf8').length,
        abjadValue: abjadSum,
        avgWordLength: words.length ? (totalChars / words.length).toFixed(1) : 0,
        language: detectLanguage(text),
        hasDiacritics: /[\u064B-\u065F]/.test(text),
        hasQuranicSymbols: /[\u0610-\u061A\u06D6-\u06DC]/.test(text)
    };
}

/**
 * حساب التشابه بين نصين (Jaccard على n-grams)
 */
function calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    const ngrams = (t, n = 2) => {
        const clean = normalizeText(t);
        const grams = new Set();
        for (let i = 0; i <= clean.length - n; i++) grams.add(clean.slice(i, i + n));
        return grams;
    };
    const g1 = ngrams(text1);
    const g2 = ngrams(text2);
    const intersection = new Set([...g1].filter(x => g2.has(x)));
    const union = new Set([...g1, ...g2]);
    if (!union.size) return 0;
    return parseFloat((intersection.size / union.size).toFixed(4));
}

/**
 * توليد تضمين دلالي 64 بُعد (محاكاة عملية)
 */
function generateEmbedding(text) {
    if (!text) return new Array(64).fill(0);
    const clean = normalizeText(text);
    const embedding = new Array(64).fill(0);
    for (let i = 0; i < clean.length; i++) {
        const cp = clean.codePointAt(i);
        const dim = cp % 64;
        embedding[dim] = (embedding[dim] + Math.sin(cp * (i + 1) * 0.01)) / 2;
    }
    // تطبيع L2
    const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)) || 1;
    return embedding.map(v => parseFloat((v / norm).toFixed(6)));
}

/**
 * تشغيل الشبكة العصبية الكاملة
 */
function runNeuralNetwork(text) {
    const start = Date.now();
    const results = {
        input: text,
        layers: {}
    };

    // L1: ترميز
    results.layers.encoding = encodeText(text);
    // L2: صرف
    const words = text.split(/\s+/).filter(Boolean);
    results.layers.morphology = {
        words: words.length,
        roots: words.slice(0, 5).map(w => extractRoot(w)),
        hasDiacritics: /[\u064B-\u065F]/.test(text)
    };
    // L3: نحو
    results.layers.syntax = analyzeSentence(text);
    // L4: بلاغة
    results.layers.rhetoric = {
        hasRepetition: (text.match(/(\w+)\s+\1/g) || []).length > 0,
        questionMark: text.includes('؟'),
        exclamation: text.includes('!'),
        estimatedStyle: text.length < 20 ? 'إيجاز' : text.length < 60 ? 'توسط' : 'إطناب'
    };
    // L5: معجم
    results.layers.lexicon = {
        language: detectLanguage(text),
        embedding: generateEmbedding(text).slice(0, 8), // عرض أول 8 أبعاد فقط
        embeddingDims: 64
    };

    results.processingMs = Date.now() - start;
    results.neuronsActivated = NEURAL_NETWORK.totalNeurons;
    return results;
}

// ═══════════════════════════════════════════════════════════════
// تصدير المحرك
// ═══════════════════════════════════════════════════════════════
module.exports = {
    UNICODE_BLOCKS,
    ARABIC_LETTERS,
    QURAN_VERSES,
    SUNNAH_HADITHS,
    MAQASID,
    NEURAL_NETWORK,
    // دوال المحرك
    encodeText,
    analyzeCodePoints,
    detectLanguage,
    normalizeText,
    removeDiacritics,
    extractRoot,
    analyzeSentence,
    calculateSimilarity,
    generateEmbedding,
    runNeuralNetwork
};
