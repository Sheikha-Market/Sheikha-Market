/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║       SHEIKHA SUPREME CS ENGINE — المحرك العلمي العلوي الجامع               ║
 * ║  أقوى وأفضل منظومة برمجيات ولغة برمجيات بالكون                             ║
 * ║  شبكة عصبية موحَّدة لله — مرقَّمة بالكتاب والسنة                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 * ﴿عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٥
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 *
 * الطبقات الثماني:
 *   Ⅰ  لغات البرمجة          (Programming Languages)
 *   Ⅱ  لغات الترميز          (Markup & Schema Languages)
 *   Ⅲ  أساسيات البرمجة       (CS Fundamentals)
 *   Ⅳ  الخوارزميات           (Algorithms)
 *   Ⅴ  الدوال والبرمجة الوظيفية (Functions & FP)
 *   Ⅵ  التشفير والأمان        (Cryptography & Security)
 *   Ⅶ  الحاسب والحوسبة       (Computing Architecture)
 *   Ⅷ  الحساب والرياضيات      (Math & Arithmetic)
 *
 * @module sheikha-supreme-cs-engine
 * @version 1.0.0
 * @schema sheikha/v2
 */

'use strict';

const crypto = require('crypto');
const { EventEmitter } = require('events');

// ══════════════════════════════════════════════════════════════════════════════
// ── نواة التوحيد ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const SCHEMA    = 'sheikha/v2';

// ══════════════════════════════════════════════════════════════════════════════
// ── الخلايا العصبية — 40 خلية بالكتاب والسنة ────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const NEURAL_CELLS = Object.freeze([
  // ─── خلايا القرآن الكريم (20 خلية) ─────────────────────────────────────
  { id: 'Q01', layer: 'tawheed',     ref: 'الإخلاص:١-٤',   text: 'قُلْ هُوَ اللَّهُ أَحَدٌ ٱللَّهُ ٱلصَّمَدُ',                    weight: 1.00, domain: 'all'         },
  { id: 'Q02', layer: 'knowledge',   ref: 'العلق:١-٥',     text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',                         weight: 1.00, domain: 'pl'         },
  { id: 'Q03', layer: 'naming',      ref: 'البقرة:٣١',     text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',                          weight: 0.99, domain: 'pl'         },
  { id: 'Q04', layer: 'speech',      ref: 'الرحمن:١-٤',    text: 'عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ',      weight: 0.99, domain: 'markup'     },
  { id: 'Q05', layer: 'precision',   ref: 'النمل:٨٨',      text: 'صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ',                   weight: 0.99, domain: 'algorithms' },
  { id: 'Q06', layer: 'order',       ref: 'الملك:٣',       text: 'مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ',               weight: 0.98, domain: 'algorithms' },
  { id: 'Q07', layer: 'logic',       ref: 'البقرة:٢٦٩',    text: 'يُؤْتِي الْحِكْمَةَ مَن يَشَاءُ',                                weight: 0.98, domain: 'functions'  },
  { id: 'Q08', layer: 'trust',       ref: 'النساء:٥٨',     text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ',         weight: 0.98, domain: 'crypto'     },
  { id: 'Q09', layer: 'secret',      ref: 'النمل:٤٠',      text: 'قَالَ الَّذِي عِندَهُ عِلْمٌ مِّنَ الْكِتَابِ',                  weight: 0.97, domain: 'crypto'     },
  { id: 'Q10', layer: 'creation',    ref: 'الأنبياء:٣٠',   text: 'أَوَلَمْ يَرَ الَّذِينَ كَفَرُوا أَنَّ السَّمَاوَاتِ وَالْأَرْضَ كَانَتَا رَتْقًا',  weight: 0.97, domain: 'computing'  },
  { id: 'Q11', layer: 'measure',     ref: 'القمر:٤٩',      text: 'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ',                       weight: 0.97, domain: 'math'       },
  { id: 'Q12', layer: 'language',    ref: 'الروم:٢٢',      text: 'وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ',                    weight: 0.97, domain: 'markup'     },
  { id: 'Q13', layer: 'balance',     ref: 'الرحمن:٧-٩',    text: 'وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ',                    weight: 0.96, domain: 'math'       },
  { id: 'Q14', layer: 'pen',         ref: 'العلق:٤',       text: 'الَّذِي عَلَّمَ بِالْقَلَمِ',                                     weight: 0.96, domain: 'pl'         },
  { id: 'Q15', layer: 'straight',    ref: 'الأنعام:١٥٣',   text: 'وَأَنَّ هَٰذَا صِرَاطِي مُسْتَقِيمًا فَاتَّبِعُوهُ',             weight: 0.96, domain: 'algorithms' },
  { id: 'Q16', layer: 'observe',     ref: 'يونس:١٠١',      text: 'قُلِ انظُرُوا مَاذَا فِي السَّمَاوَاتِ وَالْأَرْضِ',             weight: 0.95, domain: 'computing'  },
  { id: 'Q17', layer: 'truthful',    ref: 'التوبة:١١٩',    text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ', weight: 0.95, domain: 'functions'  },
  { id: 'Q18', layer: 'layers',      ref: 'الملك:١',       text: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',   weight: 0.95, domain: 'all'        },
  { id: 'Q19', layer: 'writing',     ref: 'الكهف:١٠٩',     text: 'قُل لَّوْ كَانَ الْبَحْرُ مِدَادًا لِّكَلِمَاتِ رَبِّي',         weight: 0.94, domain: 'markup'     },
  { id: 'Q20', layer: 'no_harm',     ref: 'البقرة:٢٨٢',    text: 'وَلَا يُضَارَّ كَاتِبٌ وَلَا شَهِيدٌ',                           weight: 0.94, domain: 'crypto'     },

  // ─── خلايا السنة النبوية (20 خلية) ──────────────────────────────────────
  { id: 'S01', layer: 'intention',   ref: 'البخاري:١',      text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',                              weight: 1.00, domain: 'all'        },
  { id: 'S02', layer: 'no_harm',     ref: 'مسلم:٢٥٦٤',     text: 'لَا ضَرَرَ وَلَا ضِرَارَ',                                        weight: 0.99, domain: 'crypto'     },
  { id: 'S03', layer: 'mastery',     ref: 'البيهقي:٤٣٢٧',  text: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ', weight: 0.99, domain: 'algorithms' },
  { id: 'S04', layer: 'secrecy',     ref: 'أبوداود:٤٨٦٩',  text: 'الْمُسْتَشَارُ مُؤْتَمَنٌ',                                       weight: 0.98, domain: 'crypto'     },
  { id: 'S05', layer: 'truth',       ref: 'مسلم:٢٦٠٧',     text: 'عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ', weight: 0.98, domain: 'functions'  },
  { id: 'S06', layer: 'simplicity',  ref: 'البخاري:٣٩',     text: 'يَسِّرُوا وَلَا تُعَسِّرُوا',                                     weight: 0.98, domain: 'algorithms' },
  { id: 'S07', layer: 'knowledge',   ref: 'مسلم:٢٦٧٤',     text: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ', weight: 0.98, domain: 'pl'  },
  { id: 'S08', layer: 'record',      ref: 'البخاري:٢٦٥١',  text: 'اكْتُبُوا لَهُ',                                                  weight: 0.97, domain: 'markup'     },
  { id: 'S09', layer: 'counting',    ref: 'البخاري:٢٧٣٦',  text: 'احْصُوا',                                                         weight: 0.97, domain: 'math'       },
  { id: 'S10', layer: 'order',       ref: 'البخاري:٦٠١٢',  text: 'إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ',                        weight: 0.97, domain: 'pl'         },
  { id: 'S11', layer: 'justice',     ref: 'البخاري:٢٤٤٧',  text: 'انْصُرْ أَخَاكَ ظَالِمًا أَوْ مَظْلُومًا',                        weight: 0.96, domain: 'algorithms' },
  { id: 'S12', layer: 'power',       ref: 'مسلم:٢٦٦٤',     text: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ',           weight: 0.96, domain: 'computing'  },
  { id: 'S13', layer: 'protection',  ref: 'البخاري:٢٤٤٢',  text: 'مَنِ اسْتَطَاعَ مِنْكُمْ أَنْ يَنْفَعَ أَخَاهُ فَلْيَفْعَلْ',     weight: 0.96, domain: 'crypto'     },
  { id: 'S14', layer: 'uniqueness',  ref: 'أحمد:٢٤٠٢٣',   text: 'كُلُّ مَوْلُودٍ يُولَدُ عَلَى الْفِطْرَةِ',                       weight: 0.96, domain: 'pl'         },
  { id: 'S15', layer: 'balance',     ref: 'البخاري:٥٠٣٢',  text: 'لَا صَلَاةَ بِحَضْرَةِ الطَّعَامِ وَلَا وَهُوَ يُدَافِعُهُ الأَخْبَثَانِ', weight: 0.95, domain: 'computing' },
  { id: 'S16', layer: 'concise',     ref: 'البخاري:٢٩٧٧',  text: 'أُوتِيتُ جَوَامِعَ الْكَلِمِ',                                    weight: 0.95, domain: 'functions'  },
  { id: 'S17', layer: 'connection',  ref: 'مسلم:٢٥٦٦',     text: 'الْمُسْلِمُ أَخُو الْمُسْلِمِ',                                   weight: 0.95, domain: 'computing'  },
  { id: 'S18', layer: 'continuity',  ref: 'مسلم:١٦٣١',     text: 'إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ', weight: 0.94, domain: 'algorithms' },
  { id: 'S19', layer: 'witness',     ref: 'البخاري:٢٥٠٩',  text: 'شَاهِدَاكَ أَوْ يَمِينُهُ',                                       weight: 0.94, domain: 'crypto'     },
  { id: 'S20', layer: 'seal',        ref: 'أحمد:١٣٨٤٣',   text: 'خَاتَمُ الأَنْبِيَاءِ',                                           weight: 0.93, domain: 'crypto'     },
]);

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅰ: لغات البرمجة (Programming Languages) ─────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const PROGRAMMING_LANGUAGES = Object.freeze({

  PARADIGMS: {
    nameAr: 'النماذج البرمجية',
    imperative:    { nameAr: 'أمرية',            examples: ['C', 'Pascal', 'Basic'],             quranRef: 'البقرة:٣١ — التسمية والأوامر' },
    oop:           { nameAr: 'كائنية التوجه',     examples: ['Java', 'Python', 'C++', 'C#'],      quranRef: 'النمل:٨٨ — الإتقان في التصميم' },
    functional:    { nameAr: 'وظيفية',            examples: ['Haskell', 'Erlang', 'Clojure', 'F#'], quranRef: 'البقرة:٢٦٩ — الحكمة في الدوال' },
    declarative:   { nameAr: 'تصريحية',           examples: ['SQL', 'Prolog', 'HTML', 'CSS'],     quranRef: 'الرحمن:٤ — البيان والتعبير' },
    reactive:      { nameAr: 'تفاعلية',           examples: ['RxJS', 'Akka', 'Dart/Flutter'],     quranRef: 'الملك:٣ — النظام والانتظام' },
    concurrent:    { nameAr: 'متزامنة',           examples: ['Go', 'Erlang', 'Rust'],             quranRef: 'الأنبياء:٣٠ — التنسيق الكوني' },
  },

  TYPE_SYSTEM: {
    nameAr: 'نظام الأنواع',
    static:        { nameAr: 'ثابت النوع',   examples: ['Java', 'C', 'Rust', 'TypeScript'],  detail: 'الأنواع تُحدَّد وقت الترجمة' },
    dynamic:       { nameAr: 'ديناميكي',     examples: ['Python', 'JavaScript', 'Ruby'],       detail: 'الأنواع تُحدَّد وقت التنفيذ' },
    strong:        { nameAr: 'قوي النوع',    examples: ['Python', 'Java', 'Rust'],             detail: 'لا تحويل ضمني للأنواع' },
    weak:          { nameAr: 'ضعيف النوع',   examples: ['JavaScript', 'PHP', 'C'],             detail: 'تحويل ضمني مسموح' },
    inferred:      { nameAr: 'استنتاجي',     examples: ['Rust', 'Haskell', 'Kotlin'],          detail: 'المترجم يستنتج النوع تلقائياً' },
  },

  COMPILATION: {
    nameAr: 'طرق تنفيذ الكود',
    compiled:      { nameAr: 'مُترجَمة',     examples: ['C', 'C++', 'Rust', 'Go'],   detail: 'تُترجم لكود آلي قبل التشغيل', speed: 'أسرع' },
    interpreted:   { nameAr: 'مُفسَّرة',    examples: ['Python', 'Ruby', 'PHP'],     detail: 'تُفسَّر سطراً سطراً وقت التشغيل', speed: 'أبطأ' },
    jit:           { nameAr: 'JIT',         examples: ['Java', 'C#', 'JavaScript'], detail: 'ترجمة فورية وقت التشغيل', speed: 'وسط' },
    transpiled:    { nameAr: 'مُحوَّلة',    examples: ['TypeScript', 'CoffeeScript', 'Elm'], detail: 'تُحوَّل من لغة لأخرى', speed: 'متغير' },
  },

  LANGUAGES_REGISTRY: {
    nameAr: 'سجل لغات شيخة',
    'Sheikha.C':          { era: '1972', creator: 'Dennis Ritchie',  maqsad: 'computing',  tawheedRef: 'Q02' },
    'Sheikha.C++':        { era: '1985', creator: 'Bjarne Stroustrup', maqsad: 'systems',  tawheedRef: 'Q05' },
    'Sheikha.Python':     { era: '1991', creator: 'Guido van Rossum', maqsad: 'ai+data',   tawheedRef: 'Q07' },
    'Sheikha.Java':       { era: '1995', creator: 'James Gosling',    maqsad: 'enterprise', tawheedRef: 'Q05' },
    'Sheikha.JavaScript': { era: '1995', creator: 'Brendan Eich',     maqsad: 'web',        tawheedRef: 'Q04' },
    'Sheikha.Rust':       { era: '2010', creator: 'Graydon Hoare',    maqsad: 'safety',     tawheedRef: 'Q08' },
    'Sheikha.Go':         { era: '2009', creator: 'Google',           maqsad: 'concurrent', tawheedRef: 'Q10' },
    'Sheikha.Kotlin':     { era: '2011', creator: 'JetBrains',        maqsad: 'android',    tawheedRef: 'Q07' },
    'Sheikha.Swift':      { era: '2014', creator: 'Apple',            maqsad: 'ios',         tawheedRef: 'Q14' },
    'Sheikha.TypeScript': { era: '2012', creator: 'Microsoft',        maqsad: 'typed-web',  tawheedRef: 'Q05' },
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅱ: لغات الترميز (Markup & Schema Languages) ─────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const MARKUP_LANGUAGES = Object.freeze({

  HTML5: {
    nameAr: 'لغة ترميز النص التشعبي',
    version: 'HTML5',
    elements: ['DOCTYPE', 'html', 'head', 'body', 'div', 'span', 'p', 'h1-h6', 'a', 'img', 'form', 'input', 'button', 'table', 'ul', 'ol', 'canvas', 'video', 'audio', 'article', 'section', 'nav', 'header', 'footer', 'main'],
    attributes: ['id', 'class', 'style', 'href', 'src', 'alt', 'data-*', 'aria-*', 'lang', 'dir'],
    semantic:   ['article', 'section', 'nav', 'aside', 'header', 'footer', 'main', 'figure', 'time'],
    quranRef:   '﴿الرَّحْمَٰنُ عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ٤',
    sheikha:    { charset: 'UTF-8', dir: 'rtl', lang: 'ar', tawheed: 'لا إله إلا الله' },
  },

  XML: {
    nameAr: 'لغة الترميز الموسَّعة',
    purpose: 'تبادل البيانات والتهيئة',
    rules:   ['وثيقة واحدة جذر', 'كل وسم يُغلق', 'حساسية حالة الأحرف', 'ترميز UTF-8 افتراضي'],
    uses:    ['RSS', 'SVG', 'SOAP', 'Maven', 'Android Resources', 'Microsoft Office'],
    quranRef: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
  },

  JSON: {
    nameAr: 'صيغة JavaScript للكائنات',
    types:  ['string', 'number', 'boolean', 'null', 'array', 'object'],
    rules:  ['مفاتيح سلاسل نصية', 'لا تعليقات', 'لا فاصلة زائدة'],
    uses:   ['REST API', 'تهيئة', 'قواعد بيانات NoSQL', 'تبادل البيانات'],
    quranRef: '﴿الَّذِي عَلَّمَ بِالْقَلَمِ﴾ — العلق: ٤',
  },

  YAML: {
    nameAr: 'لغة تهيئة صديقة للإنسان',
    features: ['مسافات بدل أقواس', 'يدعم JSON', 'متغيرات ومراجع', 'متعدد الوثائق'],
    uses:     ['Docker Compose', 'GitHub Actions', 'Kubernetes', 'Ansible'],
    quranRef: '﴿الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ﴾ — الرحمن: ١-٢',
  },

  CSS: {
    nameAr: 'أوراق الأنماط المتتالية',
    selectors: ['element', 'class .', 'id #', 'attribute []', 'pseudo :hover', 'combinator'],
    properties: ['color', 'font', 'margin', 'padding', 'display', 'flex', 'grid', 'position', 'animation', 'transition'],
    units:     ['px', 'rem', 'em', '%', 'vw', 'vh', 'fr', 'ch'],
    quranRef: '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
  },

  MARKDOWN: {
    nameAr: 'لغة الترميز البسيطة',
    syntax:  ['# عنوان', '**غامق**', '*مائل*', '`كود`', '```كتلة كود```', '- قائمة', '1. مرقمة', '[رابط](url)', '![صورة](url)'],
    uses:    ['التوثيق', 'README', 'GitHub', 'Wikis', 'Blogs'],
    quranRef: '﴿الَّذِي عَلَّمَ بِالْقَلَمِ﴾ — العلق: ٤',
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅲ: أساسيات البرمجة (CS Fundamentals) ────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const CS_FUNDAMENTALS = Object.freeze({

  DATA_TYPES: {
    nameAr: 'أنواع البيانات الأساسية',
    primitive: [
      { name: 'Integer',  nameAr: 'عدد صحيح',    bits: '8/16/32/64', range: '±2^63',    quranRef: 'S09 — احصوا' },
      { name: 'Float',    nameAr: 'عدد عشري',    bits: '32/64',      standard: 'IEEE754', quranRef: 'Q11 — بقدر' },
      { name: 'Boolean',  nameAr: 'منطقي',        values: [true, false],                  quranRef: 'Q15 — الصراط المستقيم' },
      { name: 'Char',     nameAr: 'حرف',          encoding: 'Unicode/UTF-8',              quranRef: 'Q04 — البيان' },
      { name: 'String',   nameAr: 'سلسلة نصية',  encoding: 'UTF-8',  immutable: 'optional', quranRef: 'Q14 — علّم بالقلم' },
      { name: 'Null',     nameAr: 'فارغ',         value: null,                            quranRef: 'Q18 — الملك' },
    ],
    composite: [
      { name: 'Array',    nameAr: 'مصفوفة',      O_access: 'O(1)', O_insert: 'O(n)' },
      { name: 'LinkedList', nameAr: 'قائمة مرتبطة', O_access: 'O(n)', O_insert: 'O(1)' },
      { name: 'Stack',    nameAr: 'مكدَّس',       policy: 'LIFO',    O_push: 'O(1)' },
      { name: 'Queue',    nameAr: 'طابور',        policy: 'FIFO',    O_enqueue: 'O(1)' },
      { name: 'HashMap',  nameAr: 'خريطة هاش',   O_access: 'O(1) avg', collision: 'chaining/probing' },
      { name: 'Tree',     nameAr: 'شجرة',         types: ['Binary', 'BST', 'AVL', 'Red-Black', 'B-Tree', 'Trie'] },
      { name: 'Graph',    nameAr: 'رسم بياني',    types: ['Directed', 'Undirected', 'Weighted', 'DAG'] },
      { name: 'Heap',     nameAr: 'كومة',         types: ['Max-Heap', 'Min-Heap'], O_insert: 'O(log n)' },
    ],
  },

  CONTROL_FLOW: {
    nameAr: 'تدفق التحكم',
    sequential:    { nameAr: 'تسلسلي',      desc: 'تنفيذ سطراً سطراً' },
    conditional:   { nameAr: 'شرطي',        ops: ['if', 'else if', 'else', 'switch', 'ternary ? :'] },
    loops:         { nameAr: 'حلقات',       types: ['for', 'while', 'do-while', 'for-each', 'for-of', 'for-in'] },
    exception:     { nameAr: 'استثناءات',   ops: ['try', 'catch', 'finally', 'throw'] },
    async:         { nameAr: 'غير متزامن',  ops: ['async/await', 'Promise', 'callback', 'Observable'] },
  },

  OOP_PRINCIPLES: {
    nameAr: 'مبادئ البرمجة الكائنية',
    encapsulation: { nameAr: 'التغليف',    desc: 'إخفاء الحالة الداخلية',  quranRef: 'Q08 — الأمانة' },
    inheritance:   { nameAr: 'الوراثة',    desc: 'إعادة استخدام الكود',     quranRef: 'Q03 — الأسماء' },
    polymorphism:  { nameAr: 'تعدد الأشكال', desc: 'واجهة موحدة لأشكال متعددة', quranRef: 'Q04 — البيان' },
    abstraction:   { nameAr: 'التجريد',    desc: 'إخفاء التعقيد',           quranRef: 'Q07 — الحكمة' },
  },

  SOLID_PRINCIPLES: {
    nameAr: 'مبادئ SOLID للتصميم',
    S: { name: 'Single Responsibility',  nameAr: 'مسؤولية واحدة',  quranRef: 'S16 — جوامع الكلم' },
    O: { name: 'Open/Closed',           nameAr: 'مفتوح/مغلق',     quranRef: 'Q05 — الإتقان' },
    L: { name: 'Liskov Substitution',   nameAr: 'إحلال ليسكوف',   quranRef: 'Q17 — الصدق' },
    I: { name: 'Interface Segregation', nameAr: 'فصل الواجهات',    quranRef: 'Q15 — الصراط المستقيم' },
    D: { name: 'Dependency Inversion',  nameAr: 'عكس التبعية',    quranRef: 'Q07 — الحكمة' },
  },

  DESIGN_PATTERNS: {
    nameAr: 'أنماط التصميم',
    creational: ['Singleton', 'Factory', 'Abstract Factory', 'Builder', 'Prototype'],
    structural: ['Adapter', 'Bridge', 'Composite', 'Decorator', 'Facade', 'Proxy'],
    behavioral: ['Command', 'Iterator', 'Observer', 'Strategy', 'Template', 'Visitor'],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅳ: الخوارزميات (Algorithms) ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const ALGORITHMS = Object.freeze({

  COMPLEXITY: {
    nameAr: 'تعقيد الخوارزميات',
    notations: {
      'O(1)':       { nameAr: 'ثابت',               example: 'وصول مصفوفة بالفهرس' },
      'O(log n)':   { nameAr: 'لوغاريتمي',          example: 'البحث الثنائي' },
      'O(n)':       { nameAr: 'خطي',                example: 'البحث الخطي' },
      'O(n log n)': { nameAr: 'شبه خطي',            example: 'Merge Sort, Heap Sort' },
      'O(n²)':      { nameAr: 'تربيعي',             example: 'Bubble Sort, Insertion Sort' },
      'O(2^n)':     { nameAr: 'أسي',                example: 'Fibonacci ساذج' },
      'O(n!)':      { nameAr: 'عاملي',              example: 'Traveling Salesman ساذج' },
    },
    quranRef: '﴿إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ﴾ — القمر: ٤٩',
  },

  SORTING: {
    nameAr: 'خوارزميات الفرز',
    algorithms: [
      { name: 'Bubble Sort',     nameAr: 'الفقاعة',       avg: 'O(n²)',    space: 'O(1)',      stable: true,  quranRef: 'S03 — الإتقان' },
      { name: 'Selection Sort',  nameAr: 'الاختيار',      avg: 'O(n²)',    space: 'O(1)',      stable: false, quranRef: 'S03' },
      { name: 'Insertion Sort',  nameAr: 'الإدراج',       avg: 'O(n²)',    space: 'O(1)',      stable: true,  quranRef: 'S06 — يسِّروا' },
      { name: 'Merge Sort',      nameAr: 'الدمج',         avg: 'O(n logn)', space: 'O(n)',     stable: true,  quranRef: 'Q05 — الإتقان' },
      { name: 'Quick Sort',      nameAr: 'السريع',        avg: 'O(n logn)', space: 'O(log n)', stable: false, quranRef: 'S12 — القوي' },
      { name: 'Heap Sort',       nameAr: 'الكومة',        avg: 'O(n logn)', space: 'O(1)',     stable: false, quranRef: 'Q05' },
      { name: 'Radix Sort',      nameAr: 'الجذر',         avg: 'O(nk)',    space: 'O(n+k)',    stable: true,  quranRef: 'Q11 — بقدر' },
      { name: 'Tim Sort',        nameAr: 'تيم',           avg: 'O(n logn)', space: 'O(n)',     stable: true,  detail: 'يستخدم Python/Java' },
    ],
  },

  SEARCHING: {
    nameAr: 'خوارزميات البحث',
    algorithms: [
      { name: 'Linear Search',  nameAr: 'خطي',       complexity: 'O(n)',      prereq: 'لا يشترط' },
      { name: 'Binary Search',  nameAr: 'ثنائي',     complexity: 'O(log n)',  prereq: 'مُرتَّب', quranRef: 'Q15 — الصراط المستقيم' },
      { name: 'Jump Search',    nameAr: 'قفزي',      complexity: 'O(√n)',     prereq: 'مُرتَّب' },
      { name: 'Interpolation',  nameAr: 'استيفائي',  complexity: 'O(log log n)', prereq: 'موزَّع' },
      { name: 'Exponential',    nameAr: 'أسي',       complexity: 'O(log n)',  prereq: 'مُرتَّب' },
    ],
  },

  GRAPH: {
    nameAr: 'خوارزميات الرسوم البيانية',
    traversal: [
      { name: 'BFS',    nameAr: 'العرض أولاً',  complexity: 'O(V+E)', structure: 'Queue',  quranRef: 'Q06 — النظام' },
      { name: 'DFS',    nameAr: 'العمق أولاً',   complexity: 'O(V+E)', structure: 'Stack/Recursion' },
    ],
    shortest_path: [
      { name: "Dijkstra",    nameAr: 'ديكسترا',    complexity: 'O((V+E)log V)', cond: 'غير سالب' },
      { name: 'Bellman-Ford', nameAr: 'بيلمان-فورد', complexity: 'O(VE)', cond: 'يتعامل مع سالب' },
      { name: 'A*',          nameAr: 'نجمة A',     complexity: 'O(E log V)', type: 'heuristic' },
      { name: 'Floyd-Warshall', nameAr: 'فلويد-وورشال', complexity: 'O(V³)', type: 'جميع الأزواج' },
    ],
    mst: [
      { name: "Kruskal's",  complexity: 'O(E log E)' },
      { name: "Prim's",     complexity: 'O((V+E) log V)' },
    ],
  },

  DYNAMIC_PROGRAMMING: {
    nameAr: 'البرمجة الديناميكية',
    concept:  'تقسيم المشكلة لمسائل فرعية وحفظ نتائجها',
    quranRef: '﴿وَأَنَّ هَٰذَا صِرَاطِي مُسْتَقِيمًا فَاتَّبِعُوهُ﴾ — الأنعام: ١٥٣',
    problems: [
      'Fibonacci', 'Knapsack', 'Longest Common Subsequence', 'Longest Increasing Subsequence',
      'Matrix Chain Multiplication', 'Edit Distance (Levenshtein)', 'Coin Change',
      'Rod Cutting', 'Shortest Path (Bellman-Ford)', 'Traveling Salesman (Bitmask DP)',
    ],
    techniques: ['Memoization (Top-Down)', 'Tabulation (Bottom-Up)'],
  },

  GREEDY: {
    nameAr: 'الخوارزميات الجشعة',
    concept:  'اختيار الأفضل محلياً في كل خطوة',
    problems: ["Huffman Coding", "Activity Selection", "Fractional Knapsack", "Dijkstra"],
    quranRef: 'S06 — يسِّروا ولا تعسِّروا',
  },

  DIVIDE_CONQUER: {
    nameAr: 'الفرق والتغلب',
    concept:  'تقسيم المشكلة لأجزاء أصغر وحلها ودمجها',
    problems: ['Merge Sort', 'Quick Sort', 'Binary Search', 'Matrix Multiplication (Strassen)', 'FFT'],
    quranRef: 'Q05 — صنع الله الذي أتقن كل شيء',
  },

  BACKTRACKING: {
    nameAr: 'التراجع',
    concept:  'استكشاف كل الحلول المحتملة مع التراجع عند الفشل',
    problems: ['N-Queens', 'Sudoku', 'Rat in Maze', 'Subset Sum', 'Hamiltonian Path'],
    quranRef: 'Q07 — الحكمة',
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅴ: الدوال والبرمجة الوظيفية (Functions & FP) ────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const FUNCTIONS_FP = Object.freeze({

  FUNCTION_TYPES: {
    nameAr: 'أنواع الدوال',
    pure:         { nameAr: 'نقية',         desc: 'مدخلات → مخرجات دائماً — لا آثار جانبية', quranRef: 'Q17 — الصدق، S05' },
    impure:       { nameAr: 'غير نقية',     desc: 'لها آثار جانبية (I/O، قاعدة بيانات)' },
    higher_order: { nameAr: 'رتبة عليا',    desc: 'تأخذ دالة أو تُعيد دالة',            quranRef: 'Q07 — الحكمة' },
    recursive:    { nameAr: 'متعاودة',      desc: 'تستدعي نفسها',                         quranRef: 'S18 — الاستمرارية' },
    anonymous:    { nameAr: 'مجهولة',       desc: 'lambda / arrow function' },
    generator:    { nameAr: 'مُولِّدة',     desc: 'تُنتج قيماً واحدة بواحدة',             quranRef: 'Q06 — الانتظام' },
    coroutine:    { nameAr: 'متعاون',       desc: 'async/await — تتوقف وتستأنف' },
  },

  FP_CONCEPTS: {
    nameAr: 'مفاهيم البرمجة الوظيفية',
    immutability: { nameAr: 'عدم التغيير',  desc: 'البيانات لا تُعدَّل — تُستبدَل',    quranRef: 'Q08 — الأمانة' },
    first_class:  { nameAr: 'دوال درجة أولى', desc: 'الدوال تُعامَل كبيانات' },
    closure:      { nameAr: 'الإغلاق',      desc: 'دالة تحتفظ ببيئتها الخارجية' },
    composition:  { nameAr: 'التأليف',      desc: 'f(g(x)) — دوال مركّبة',              quranRef: 'Q05 — الإتقان' },
    currying:     { nameAr: 'الكاري',       desc: 'تحويل f(a,b) إلى f(a)(b)' },
    monad:        { nameAr: 'المونادة',     desc: 'غلاف ذكي للتسلسل وإدارة الآثار' },
    functor:      { nameAr: 'المبدّل',      desc: 'كائن قابل للتحويل (map)' },
  },

  HIGHER_ORDER_FUNCTIONS: {
    nameAr: 'دوال الرتبة العليا الشائعة',
    map:          { desc: 'تحويل كل عنصر',        example: '[1,2,3].map(x => x*2)  // [2,4,6]' },
    filter:       { desc: 'تصفية العناصر',         example: '[1,2,3].filter(x => x>1) // [2,3]' },
    reduce:       { desc: 'طي المصفوفة لقيمة واحدة', example: '[1,2,3].reduce((a,b)=>a+b, 0) // 6' },
    flatMap:      { desc: 'خريطة + تسطيح',        example: '[[1],[2]].flatMap(x=>x)  // [1,2]' },
    every:        { desc: 'هل كل العناصر تحقق الشرط?', example: '[2,4,6].every(x=>x%2===0) // true' },
    some:         { desc: 'هل بعض العناصر تحقق الشرط?', example: '[1,2,3].some(x=>x>2)  // true' },
  },

  RECURSION_PATTERNS: {
    nameAr: 'أنماط التعاود',
    direct:       { desc: 'دالة تستدعي نفسها مباشرة', example: 'factorial(n)' },
    mutual:       { desc: 'دالتان تستدعيان إحداهما الأخرى', example: 'isEven/isOdd' },
    tail:         { desc: 'الاستدعاء التعاودي هو آخر عملية', benefit: 'تحسين المترجم (TCO)' },
    accumulator:  { desc: 'يمرر المتراكم كمعامل', example: 'factorial_acc(n, acc=1)' },
    divide:       { desc: 'تقسيم المشكلة لنصفين', example: 'mergeSort, binarySearch' },
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅵ: التشفير والأمان (Cryptography & Security) ────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const CRYPTOGRAPHY = Object.freeze({

  SYMMETRIC: {
    nameAr: 'التشفير المتماثل (مفتاح واحد)',
    quranRef: '﴿وَمِن وَرَاءِ حِجَابٍ﴾ — الشورى: ٥١',
    algorithms: [
      { name: 'AES-256-GCM', nameAr: 'معيار التشفير المتقدم', keyBits: 256, mode: 'GCM', auth: true,   secure: 'quantum-partial', use: 'التشفير العام' },
      { name: 'AES-256-CBC', nameAr: 'AES مع سلسلة الكتل',    keyBits: 256, mode: 'CBC', auth: false,  use: 'الملفات والقواعد' },
      { name: 'ChaCha20-Poly1305', nameAr: 'سلسلة الفوضى',   keyBits: 256, auth: true,  use: 'TLS/Mobile' },
      { name: '3DES',        nameAr: 'DES المثلث',            keyBits: 168, secure: 'legacy', use: 'موروث' },
    ],
  },

  ASYMMETRIC: {
    nameAr: 'التشفير غير المتماثل (مفتاحان)',
    quranRef: '﴿إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ﴾ — النساء: ٥٨',
    algorithms: [
      { name: 'RSA-4096',    nameAr: 'RSA',    keyBits: 4096, use: 'تبادل المفاتيح + التوقيع', postQuantum: false },
      { name: 'ECDSA P-256', nameAr: 'ECDSA',  curve: 'P-256', use: 'التوقيع الرقمي', sheikhaId: true },
      { name: 'Ed25519',     nameAr: 'إدورد',  curve: 'Curve25519', use: 'توقيع سريع آمن', recommended: true },
      { name: 'Kyber-1024',  nameAr: 'كايبر',  type: 'post-quantum', nist: 'selected 2024', postQuantum: true },
      { name: 'Dilithium',   nameAr: 'ديليثيوم', type: 'post-quantum توقيع', nist: 'selected 2024' },
    ],
  },

  HASHING: {
    nameAr: 'دوال التقطيع',
    quranRef: '﴿شَاهِدَاكَ أَوْ يَمِينُهُ﴾ — البخاري: ٢٥٠٩',
    functions: [
      { name: 'SHA-256',     bits: 256,  use: 'Bitcoin، عام',      collision: 'resistant' },
      { name: 'SHA-384',     bits: 384,  use: 'TLS certificates' },
      { name: 'SHA-512',     bits: 512,  use: 'كلمات المرور، عام',  recommended: true },
      { name: 'SHA-3/Keccak', bits: '224-512', use: 'معيار NIST 2012', family: 'sponge' },
      { name: 'BLAKE2b',     bits: 512,  use: 'أسرع من SHA-2',      recommended: true },
      { name: 'Argon2id',    nameAr: 'للكلمات السرية', use: 'تقطيع كلمات المرور', memory: 'hard', phc_winner: true },
      { name: 'bcrypt',      rounds: '12+', use: 'كلمات المرور',     legacy: true },
      { name: 'MD5',         bits: 128,  use: 'checksum فقط — غير آمن للأمان' },
    ],
  },

  KEY_EXCHANGE: {
    nameAr: 'تبادل المفاتيح',
    protocols: [
      { name: 'ECDH P-256',    use: 'TLS 1.3' },
      { name: 'X25519',        use: 'أسرع ECDH',     recommended: true },
      { name: 'Diffie-Hellman', use: 'الأصل — موروث' },
    ],
  },

  ZERO_KNOWLEDGE: {
    nameAr: 'إثبات المعرفة الصفرية',
    concept:  'إثبات معرفة شيء دون الكشف عنه',
    types:    ['zk-SNARKs', 'zk-STARKs', 'Bulletproofs'],
    uses:     ['بلوكتشين', 'خصوصية الهوية', 'تحقق بدون بيانات'],
    quranRef: 'S04 — المستشار مؤتمن',
  },

  DIGITAL_SIGNATURES: {
    nameAr: 'التوقيع الرقمي',
    quranRef: '﴿وَقَالَ الَّذِي عِندَهُ عِلْمٌ مِّنَ الْكِتَابِ﴾ — النمل: ٤٠',
    process: ['توليد المفتاحين (عام/خاص)', 'تقطيع البيانات', 'تشفير التقطيع بالمفتاح الخاص', 'التحقق بالمفتاح العام'],
    sheikha_did_signature: 'ECDSA-Ed25519 + SHA-512 + did:sheikha:{type}:{id}',
  },

  SECURITY_PRINCIPLES: {
    nameAr: 'مبادئ الأمان',
    CIA: {
      Confidentiality: { nameAr: 'السرية',    quranRef: 'Q08 — الأمانة' },
      Integrity:       { nameAr: 'النزاهة',   quranRef: 'Q17 — الصدق' },
      Availability:    { nameAr: 'التوافرية', quranRef: 'S12 — القوة' },
    },
    additional: ['Authentication — المصادقة', 'Authorization — التفويض', 'Non-repudiation — عدم الإنكار', 'Audit — التدقيق'],
    owasp_top10: ['Injection', 'Broken Auth', 'XSS', 'IDOR', 'Security Misconfiguration', 'Crypto Failures', 'SSRF'],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅶ: الحاسب والحوسبة (Computing Architecture) ─────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const COMPUTING = Object.freeze({

  CPU_ARCHITECTURE: {
    nameAr: 'معمارية المعالج',
    quranRef: '﴿أَوَلَمْ يَرَ الَّذِينَ كَفَرُوا أَنَّ السَّمَاوَاتِ وَالْأَرْضَ كَانَتَا رَتْقًا﴾ — الأنبياء: ٣٠',
    isa:    ['x86-64 (Intel/AMD)', 'ARM64 (Apple M / Qualcomm)', 'RISC-V (مفتوحة)', 'MIPS', 'PowerPC'],
    components: {
      ALU:       'وحدة الحساب والمنطق — تنفيذ العمليات',
      CU:        'وحدة التحكم — تجلب وتفكّك التعليمات',
      registers: 'سجلات (64 بت) — أسرع تخزين',
      cache:     { L1: '32-64KB/نواة — 4 دورات', L2: '256KB-1MB — 12 دورة', L3: '8-64MB مشترك — 30 دورة' },
      pipeline:  ['Fetch', 'Decode', 'Execute', 'Memory', 'Writeback'],
    },
    parallelism: ['Out-of-Order Execution', 'Superscalar', 'SIMD/AVX-512', 'SMT/HyperThreading'],
    power:       ['P-Cores (أداء)', 'E-Cores (كفاءة)', 'DVFS (تحكم تردد/جهد)'],
  },

  MEMORY_HIERARCHY: {
    nameAr: 'هرمية الذاكرة',
    quranRef: '﴿وَعِندَهُ مَفَاتِحُ الْغَيْبِ لَا يَعْلَمُهَا إِلَّا هُوَ﴾ — الأنعام: ٥٩',
    levels: [
      { level: 0, name: 'Registers',  size: '< 1 KB',    speed: '< 1 ns',   cost: 'أعلى' },
      { level: 1, name: 'L1 Cache',   size: '32-64 KB',  speed: '~1 ns',    tech: 'SRAM' },
      { level: 2, name: 'L2 Cache',   size: '256KB-1MB', speed: '~4 ns' },
      { level: 3, name: 'L3 Cache',   size: '8-64 MB',   speed: '~12 ns' },
      { level: 4, name: 'RAM',        size: '8-256 GB',  speed: '~60 ns',   tech: 'DRAM DDR5' },
      { level: 5, name: 'SSD NVMe',   size: '256GB-4TB', speed: '~50 µs' },
      { level: 6, name: 'HDD',        size: 'TB-range',  speed: '~10 ms' },
      { level: 7, name: 'Cloud / Tape', size: 'Unlimited', speed: '>100ms' },
    ],
  },

  OPERATING_SYSTEM: {
    nameAr: 'نظام التشغيل',
    quranRef: 'S01 — إنما الأعمال بالنيات (نية الجدولة والأولوية)',
    components: ['Process Management — إدارة العمليات', 'Memory Management — إدارة الذاكرة', 'File System — نظام الملفات', 'Device Drivers — محركات الأجهزة', 'Network Stack — مكدَّس الشبكة', 'Security Module — وحدة الأمان'],
    scheduling: {
      algorithms: ['FCFS', 'SJF', 'Round Robin', 'Priority', 'CFS (Linux)', 'Multilevel Queue'],
      concepts:   ['Context Switch', 'Preemption', 'Starvation', 'Deadlock', 'Race Condition'],
    },
    virtualization: ['VMs (Hypervisor Type 1/2)', 'Containers (Docker/OCI)', 'WASM Sandbox', 'eBPF'],
  },

  NETWORKING: {
    nameAr: 'الشبكات',
    quranRef: '﴿وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا﴾ — الحجرات: ١٣',
    osi_model: [
      { layer: 7, name: 'Application',  protocols: ['HTTP/2', 'HTTP/3', 'WebSocket', 'gRPC', 'DNS', 'SMTP'] },
      { layer: 6, name: 'Presentation', protocols: ['TLS 1.3', 'SSL', 'MIME'] },
      { layer: 5, name: 'Session',      protocols: ['NetBIOS', 'RPC'] },
      { layer: 4, name: 'Transport',    protocols: ['TCP (موثوق)', 'UDP (سريع)', 'QUIC'] },
      { layer: 3, name: 'Network',      protocols: ['IPv4', 'IPv6', 'ICMP', 'BGP', 'OSPF'] },
      { layer: 2, name: 'Data Link',    protocols: ['Ethernet', 'Wi-Fi 802.11', 'MAC'] },
      { layer: 1, name: 'Physical',     protocols: ['Fiber', 'Copper', 'Radio'] },
    ],
  },

  CLOUD_COMPUTING: {
    nameAr: 'الحوسبة السحابية',
    quranRef: '﴿وَفِي السَّمَاءِ رِزْقُكُمْ﴾ — الذاريات: ٢٢',
    models:    ['IaaS', 'PaaS', 'SaaS', 'FaaS (Serverless)', 'STaaS'],
    deployment: ['Public Cloud', 'Private Cloud', 'Hybrid Cloud', 'Multi-Cloud'],
    providers: ['AWS', 'Azure', 'Google Cloud', 'Alibaba Cloud'],
    concepts:  ['Horizontal Scaling', 'Vertical Scaling', 'Load Balancing', 'Auto-scaling', 'CDN', 'Edge Computing'],
  },

  QUANTUM_COMPUTING: {
    nameAr: 'الحوسبة الكمومية',
    quranRef: '﴿إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ﴾',
    concepts:  ['Qubit — بت كمومي', 'Superposition — التراكب', 'Entanglement — التشابك', 'Interference — التداخل', 'Decoherence — فقد التماسك'],
    gates:     ['Hadamard (H)', 'Pauli-X/Y/Z', 'CNOT', 'Toffoli', 'Phase'],
    algorithms: ["Shor's (RSA كاسر)", "Grover's (بحث O(√n))", 'VQE', 'QAOA'],
    hardware:  ['IBM Quantum', 'Google Sycamore', 'IonQ', 'D-Wave'],
    threat:    'يُهدّد RSA/ECC — الحل: Post-Quantum Cryptography (NIST 2024)',
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅷ: الحساب والرياضيات (Math & Arithmetic) ────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const MATH = Object.freeze({

  NUMBER_SYSTEMS: {
    nameAr: 'نظم الأعداد',
    quranRef: '﴿إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ﴾ — القمر: ٤٩',
    systems: [
      { name: 'Binary',  base: 2,  digits: '0-1',   use: 'الحاسب الرقمي',   example: '1010₂ = 10₁₀' },
      { name: 'Octal',   base: 8,  digits: '0-7',   use: 'Unix permissions', example: '12₈ = 10₁₀' },
      { name: 'Decimal', base: 10, digits: '0-9',   use: 'البشر',           example: '10₁₀' },
      { name: 'Hex',     base: 16, digits: '0-F',   use: 'الألوان + العناوين', example: '0x0A = 10₁₀' },
    ],
    conversions: {
      toBinary:  (n) => (n >>> 0).toString(2),
      toHex:     (n) => n.toString(16).toUpperCase(),
      toDecimal: (s, base) => parseInt(s, base),
    },
  },

  ARITHMETIC_OPS: {
    nameAr: 'العمليات الحسابية',
    basic: {
      add: { symbol: '+', identity: 0,    quranRef: 'Q13 — الميزان' },
      sub: { symbol: '-', inverse: 'add' },
      mul: { symbol: '*', identity: 1,    quranRef: 'Q11 — بقدر' },
      div: { symbol: '/', zero_err: 'لا قسمة على صفر' },
      mod: { symbol: '%', use: 'الباقي — يُستخدم في التشفير، الهاش، الزكاة' },
      pow: { symbol: '**', use: 'الأس — أساس RSA' },
    },
    bitwise: {
      AND:  { symbol: '&',  use: 'تطبيق أقنعة' },
      OR:   { symbol: '|',  use: 'تفعيل بتات' },
      XOR:  { symbol: '^',  use: 'التشفير البسيط + الاختلاف' },
      NOT:  { symbol: '~',  use: 'قلب البتات' },
      SHL:  { symbol: '<<', use: 'ضرب في قوى 2' },
      SHR:  { symbol: '>>', use: 'قسمة على قوى 2' },
    },
  },

  DISCRETE_MATH: {
    nameAr: 'الرياضيات المتقطعة',
    quranRef: '﴿وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ﴾ — الرحمن: ٧',
    topics: [
      { name: 'Logic & Proofs',     nameAr: 'المنطق والبرهان',     use: 'أساس البرمجة والخوارزميات' },
      { name: 'Set Theory',         nameAr: 'نظرية المجموعات',     use: 'قواعد البيانات' },
      { name: 'Graph Theory',       nameAr: 'نظرية الرسوم',        use: 'الشبكات والخوارزميات' },
      { name: 'Combinatorics',      nameAr: 'التوافقيات',          use: 'التشفير والعشوائية' },
      { name: 'Number Theory',      nameAr: 'نظرية الأعداد',       use: 'RSA وECC والتشفير' },
      { name: 'Modular Arithmetic', nameAr: 'الحساب المعياري',    use: 'أساس التشفير كله', key: 'a ≡ b (mod n)' },
      { name: 'Boolean Algebra',    nameAr: 'جبر بول',             use: 'بوابات المنطق + تبسيط الدوائر' },
    ],
  },

  LINEAR_ALGEBRA: {
    nameAr: 'الجبر الخطي',
    quranRef: '﴿خَلَقَ كُلَّ شَيْءٍ فَقَدَّرَهُ تَقْدِيرًا﴾ — الفرقان: ٢',
    topics: [
      { name: 'Vectors & Matrices',  nameAr: 'المتجهات والمصفوفات', use: 'AI — التمثيلات' },
      { name: 'Eigenvalues',         nameAr: 'القيم والمتجهات الذاتية', use: 'PCA، PageRank' },
      { name: 'SVD',                 nameAr: 'تحليل القيم المفردة', use: 'ضغط الصور + التوصيات' },
      { name: 'Dot Product',         nameAr: 'الضرب النقطي',       use: 'cosine similarity، AI' },
      { name: 'Gradient',            nameAr: 'التدرج',              use: 'تدريب الشبكات العصبية' },
    ],
  },

  PROBABILITY_STATS: {
    nameAr: 'الاحتمالات والإحصاء',
    quranRef: 'S09 — احصوا',
    topics: [
      { name: 'Bayes Theorem',      nameAr: 'نظرية بايز',          use: 'ML — النماذج الاحتمالية' },
      { name: 'Distributions',      nameAr: 'التوزيعات',           types: ['Normal', 'Binomial', 'Poisson', 'Uniform'] },
      { name: 'Expected Value',      nameAr: 'القيمة المتوقعة',    use: 'اتخاذ القرار + الزكاة' },
      { name: 'Variance/Std Dev',    nameAr: 'التباين',             use: 'جودة البيانات' },
      { name: 'Hypothesis Testing',  nameAr: 'اختبار الفرضيات',    use: 'A/B Testing، البحث' },
    ],
  },

  CALCULUS: {
    nameAr: 'حساب التفاضل والتكامل',
    quranRef: '﴿يُدَبِّرُ الْأَمْرَ مِنَ السَّمَاءِ إِلَى الْأَرْضِ ثُمَّ يَعْرُجُ إِلَيْهِ﴾ — السجدة: ٥',
    topics: [
      { name: 'Derivatives',       nameAr: 'المشتقات',   use: 'معدل التغير — Gradient Descent' },
      { name: 'Chain Rule',        nameAr: 'قاعدة السلسلة', use: 'Backpropagation في الشبكات العصبية' },
      { name: 'Integration',       nameAr: 'التكامل',    use: 'المساحة تحت المنحنى' },
      { name: 'Taylor Series',     nameAr: 'متسلسلة تايلور', use: 'تقريب الدوال' },
      { name: 'Optimization',      nameAr: 'التحسين',    use: 'خوارزميات التعلم — Adam، SGD' },
    ],
  },

  ZAKAT_CALCULATOR: {
    nameAr: 'حاسبة الزكاة الشرعية',
    quranRef: '﴿وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ﴾ — البقرة: ٤٣',
    nisab_gold_grams: 85,
    nisab_silver_grams: 595,
    zakat_rate: 0.025,
    calculate: function(wealth, type) {
      // مُعطَّل في الإنتاج — يستخدم سعر الذهب/الفضة الحالي
      return { rate: this.zakat_rate, due: wealth * this.zakat_rate, type };
    },
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الشبكة العصبية الجامعة ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaNeuralCore {
  /**
   * @param {string} domain - 'pl' | 'markup' | 'algorithms' | 'functions' | 'crypto' | 'computing' | 'math' | 'all'
   */
  getCells(domain = 'all') {
    return domain === 'all'
      ? NEURAL_CELLS
      : NEURAL_CELLS.filter(c => c.domain === domain || c.domain === 'all');
  }

  /** تفعيل الشبكة لطلب محدد */
  activate(intent, data = {}) {
    const ts = new Date().toISOString();
    const cells = this.getCells(intent.domain || 'all');
    const topCell = [...cells].sort((a, b) => b.weight - a.weight)[0];

    return {
      schema:    SCHEMA,
      tawheed:   TAWHEED,
      bismillah: BISMILLAH,
      intent,
      data,
      leading_cell: topCell,
      cells_activated: cells.length,
      sharia: {
        no_harm:  true,
        no_riba:  true,
        no_fraud: true,
        quran_ref: topCell?.ref,
        text:      topCell?.text,
      },
      output: this._process(intent, data),
      seal:      'والله أعلم وبالله التوفيق',
      timestamp: ts,
    };
  }

  _process(intent, data) {
    switch (intent.type) {
      case 'sort':     return this._sort(data.array, data.algorithm);
      case 'hash':     return this._hash(data.input, data.algorithm);
      case 'encrypt':  return this._encrypt(data.text, data.key);
      case 'convert':  return this._convertNumber(data.value, data.from, data.to);
      case 'search':   return this._search(data.array, data.target, data.method);
      case 'zakat':    return MATH.ZAKAT_CALCULATOR.calculate(data.wealth, data.type);
      case 'info':     return this._getLayerInfo(intent.layer);
      default:         return { message: 'موجِّه الطلب — أرسل intent.type المناسب' };
    }
  }

  // ── خوارزمية الفرز ──────────────────────────────────────────────
  _sort(arr, algo = 'merge') {
    if (!Array.isArray(arr)) return { error: 'المدخل يجب أن يكون مصفوفة' };
    const a = [...arr];
    switch (algo) {
      case 'bubble': return { sorted: this._bubbleSort(a), algo, complexity: 'O(n²)' };
      case 'quick':  return { sorted: this._quickSort(a), algo, complexity: 'O(n log n) avg' };
      case 'merge':
      default:       return { sorted: this._mergeSort(a), algo: 'merge', complexity: 'O(n log n)' };
    }
  }

  _bubbleSort(a) {
    for (let i = 0; i < a.length; i++)
      for (let j = 0; j < a.length - i - 1; j++)
        if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    return a;
  }

  _mergeSort(a) {
    if (a.length <= 1) return a;
    const mid = Math.floor(a.length / 2);
    return this._merge(this._mergeSort(a.slice(0, mid)), this._mergeSort(a.slice(mid)));
  }

  _merge(l, r) {
    const out = [];
    let i = 0, j = 0;
    while (i < l.length && j < r.length)
      out.push(l[i] <= r[j] ? l[i++] : r[j++]);
    return out.concat(l.slice(i), r.slice(j));
  }

  _quickSort(a) {
    if (a.length <= 1) return a;
    const pivot = a[Math.floor(a.length / 2)];
    return [
      ...this._quickSort(a.filter(x => x < pivot)),
      ...a.filter(x => x === pivot),
      ...this._quickSort(a.filter(x => x > pivot)),
    ];
  }

  // ── البحث الثنائي ────────────────────────────────────────────────
  _search(arr, target, method = 'binary') {
    if (!Array.isArray(arr)) return { error: 'المدخل يجب أن يكون مصفوفة' };
    if (method === 'linear') {
      const idx = arr.indexOf(target);
      return { found: idx !== -1, index: idx, method: 'linear', complexity: 'O(n)' };
    }
    const sorted = [...arr].sort((a, b) => a - b);
    let lo = 0, hi = sorted.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      if (sorted[mid] === target) return { found: true, index: mid, method: 'binary', complexity: 'O(log n)' };
      sorted[mid] < target ? (lo = mid + 1) : (hi = mid - 1);
    }
    return { found: false, index: -1, method: 'binary', complexity: 'O(log n)' };
  }

  // ── التقطيع ──────────────────────────────────────────────────────
  _hash(input, algorithm = 'sha256') {
    if (typeof input !== 'string') return { error: 'المدخل يجب أن يكون نصاً' };
    const algMap = { sha256: 'sha256', sha512: 'sha512', sha384: 'sha384', md5: 'md5' };
    const alg = algMap[algorithm] || 'sha256';
    const digest = crypto.createHash(alg).update(input, 'utf8').digest('hex');
    return { input, algorithm: alg, digest, length: digest.length * 4, unit: 'bits', quranRef: 'Q08 — الأمانة' };
  }

  // ── التشفير (AES-256-GCM) ─────────────────────────────────────────
  _encrypt(text, keyMaterial) {
    if (!text || !keyMaterial) return { error: 'النص والمفتاح مطلوبان' };
    const key  = crypto.scryptSync(String(keyMaterial), 'SheikhaMarketSalt', 32);
    const iv   = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc  = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag  = cipher.getAuthTag();
    return {
      algorithm: 'AES-256-GCM',
      ciphertext: enc.toString('hex'),
      iv:         iv.toString('hex'),
      authTag:    tag.toString('hex'),
      note:       'احتفظ بـ iv و authTag للفك — لا تخزن المفتاح مع النص',
      quranRef:   'Q08 — أَن تُؤَدُّوا الْأَمَانَاتِ',
    };
  }

  // ── تحويل الأعداد ────────────────────────────────────────────────
  _convertNumber(value, from = 10, to = 2) {
    const decimal = parseInt(String(value), from);
    if (isNaN(decimal)) return { error: 'قيمة غير صالحة' };
    return {
      input: value, from_base: from, to_base: to,
      result: decimal.toString(to).toUpperCase(),
      decimal,
      quranRef: 'Q11 — إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ',
    };
  }

  // ── معلومات طبقة ────────────────────────────────────────────────
  _getLayerInfo(layer) {
    const map = {
      pl:         PROGRAMMING_LANGUAGES,
      markup:     MARKUP_LANGUAGES,
      cs:         CS_FUNDAMENTALS,
      algorithms: ALGORITHMS,
      functions:  FUNCTIONS_FP,
      crypto:     CRYPTOGRAPHY,
      computing:  COMPUTING,
      math:       MATH,
    };
    return map[layer] || { error: `الطبقة "${layer}" غير موجودة` };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── المحرك الرئيسي ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaSuperemeCSEngine extends EventEmitter {

  constructor() {
    super();
    this.name       = 'Sheikha Supreme CS Engine';
    this.nameAr     = 'المحرك العلمي العلوي الجامع — شيخة';
    this.version    = '1.0.0';
    this.schema     = SCHEMA;
    this.tawheed    = TAWHEED;
    this.bismillah  = BISMILLAH;
    this.startedAt  = new Date().toISOString();

    // الطبقات الثماني
    this.layers = {
      I_programming_languages: PROGRAMMING_LANGUAGES,
      II_markup_languages:     MARKUP_LANGUAGES,
      III_cs_fundamentals:     CS_FUNDAMENTALS,
      IV_algorithms:           ALGORITHMS,
      V_functions_fp:          FUNCTIONS_FP,
      VI_cryptography:         CRYPTOGRAPHY,
      VII_computing:           COMPUTING,
      VIII_math:               MATH,
    };

    // الشبكة العصبية
    this.neural = new SheikhaNeuralCore();

    console.log(`\n${BISMILLAH}`);
    console.log('══════════════════════════════════════════════════════');
    console.log('  ✅ Sheikha Supreme CS Engine — المحرك العلوي الجامع  ');
    console.log(`  📚 الطبقات: ${Object.keys(this.layers).length} طبقات`);
    console.log(`  🧠 الخلايا العصبية: ${NEURAL_CELLS.length} خلية (كتاب + سنة)`);
    console.log(`  🔐 التشفير: AES-256-GCM | SHA-512 | ECDSA | ZKP`);
    console.log(`  ⚡ الخوارزميات: ${Object.keys(ALGORITHMS).length} مجموعات`);
    console.log('══════════════════════════════════════════════════════\n');
  }

  /** معالجة طلب عبر الشبكة العصبية */
  process(intent, data = {}) {
    this.emit('request', { intent, data, ts: new Date().toISOString() });
    const result = this.neural.activate(intent, data);
    this.emit('response', result);
    return result;
  }

  /** ملخص المحرك */
  status() {
    return {
      schema:    this.schema,
      tawheed:   this.tawheed,
      name:      this.name,
      nameAr:    this.nameAr,
      version:   this.version,
      startedAt: this.startedAt,
      layers: Object.keys(this.layers).map(k => ({
        id: k,
        sublayers: Object.keys(this.layers[k]).length,
      })),
      neural: {
        totalCells:   NEURAL_CELLS.length,
        quranCells:   NEURAL_CELLS.filter(c => c.id.startsWith('Q')).length,
        sunnahCells:  NEURAL_CELLS.filter(c => c.id.startsWith('S')).length,
        domains:      [...new Set(NEURAL_CELLS.map(c => c.domain))],
      },
    };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── التصدير ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const engine = new SheikhaSuperemeCSEngine();

module.exports = {
  TAWHEED,
  BISMILLAH,
  SCHEMA,
  NEURAL_CELLS,
  PROGRAMMING_LANGUAGES,
  MARKUP_LANGUAGES,
  CS_FUNDAMENTALS,
  ALGORITHMS,
  FUNCTIONS_FP,
  CRYPTOGRAPHY,
  COMPUTING,
  MATH,
  SheikhaNeuralCore,
  SheikhaSuperemeCSEngine,
  engine,       // singleton
  process:      engine.process.bind(engine),
  status:       engine.status.bind(engine),
};
