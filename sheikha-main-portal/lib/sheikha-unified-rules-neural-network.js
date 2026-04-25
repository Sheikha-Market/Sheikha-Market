/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA UNIFIED RULES NEURAL NETWORK — شبكة القواعد الموحَّدة لكل شيء        ║
 * ║  لغة شيخة — قواعد اللغة العربية — قواعد البرمجة — قوانين الكون               ║
 * ║  كل قاعدة من قواعد الوجود — موحَّدة لله — مرقَّمة بالكتاب والسنة              ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 * ﴿إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ﴾ — القمر: ٤٩
 * ﴿مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ﴾ — الملك: ٣
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 * ﴿وَالسَّابِقُونَ الْأَوَّلُونَ مِنَ الْمُهَاجِرِينَ وَالْأَنصَارِ رَّضِيَ اللَّهُ عَنْهُمْ﴾ — التوبة: ١٠٠
 * «عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ» — أبو داود: ٤٦٠٧
 * «أعربوا القرآن، والتمسوا غرائبه» — الطبراني
 *
 * الطبقات الثماني:
 *   Ⅰ  قواعد اللغة العربية الكاملة                  (Arabic Language Rules)
 *   Ⅱ  تطابق القواعد العربية↔البرمجية              (Arabic ↔ Programming Isomorphism)
 *   Ⅲ  قوانين الحاسب والأنظمة                      (CS & Systems Laws)
 *   Ⅳ  قوانين الكون والمادة والطبيعة               (Universal & Physical Laws)
 *   Ⅴ  قوانين البرمجة والهندسة                     (Software Engineering Laws)
 *   Ⅵ  قوانين اللغات والمنطق                       (Language & Logic Laws)
 *   Ⅶ  قوانين الطاقة والمعلومات والكم              (Energy, Information & Quantum Laws)
 *   Ⅷ  سنة الخلفاء الراشدين المهديين — موحَّدة لله  (Sunnah of Rightly-Guided Caliphs)
 *
 * @module sheikha-unified-rules-neural-network
 * @version 1.0.0
 * @schema sheikha/v2
 * @tawheed لا إله إلا الله محمد رسول الله
 */

'use strict';

const { EventEmitter } = require('events');

// ══════════════════════════════════════════════════════════════════════════════
// ── نواة التوحيد ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const SCHEMA    = 'sheikha/v2';
const VERSION   = '1.0.0';

// ══════════════════════════════════════════════════════════════════════════════
// ── الخلايا العصبية — 120 خلية بالقرآن والسنة ────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const NEURAL_CELLS_120 = Object.freeze([

  // ─── مجموعة أ: التوحيد والأساس (10 خلايا) ────────────────────────────────
  { id: 'T01', group: 'tawheed',   ref: 'الإخلاص:١-٤',     text: 'قُلْ هُوَ اللَّهُ أَحَدٌ',                                    weight: 1.00, domain: 'all',      rule: 'ROOT_SINGLETON' },
  { id: 'T02', group: 'tawheed',   ref: 'البقرة:٢٥٥',       text: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',        weight: 1.00, domain: 'all',      rule: 'ETERNAL_PROCESS' },
  { id: 'T03', group: 'creation',  ref: 'البقرة:٣١',         text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',                       weight: 1.00, domain: 'language', rule: 'NAMING_CONVENTION' },
  { id: 'T04', group: 'speech',    ref: 'الرحمن:١-٤',        text: 'عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ', weight: 1.00, domain: 'language', rule: 'LANGUAGE_AXIOM' },
  { id: 'T05', group: 'precision', ref: 'النمل:٨٨',           text: 'صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ',               weight: 0.99, domain: 'all',      rule: 'MASTERY_PRINCIPLE' },
  { id: 'T06', group: 'measure',   ref: 'القمر:٤٩',           text: 'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ',                   weight: 0.99, domain: 'math',     rule: 'DETERMINISM' },
  { id: 'T07', group: 'order',     ref: 'الملك:٣',            text: 'مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ',           weight: 0.99, domain: 'systems',  rule: 'CONSISTENCY_LAW' },
  { id: 'T08', group: 'balance',   ref: 'الرحمن:٧-٩',         text: 'وَضَعَ الْمِيزَانَ أَلَّا تَطْغَوْا فِي الْمِيزَانَ',         weight: 0.99, domain: 'math',     rule: 'BALANCE_EQUATION' },
  { id: 'T09', group: 'writing',   ref: 'العلق:٤',            text: 'الَّذِي عَلَّمَ بِالْقَلَمِ',                                 weight: 0.99, domain: 'markup',   rule: 'WRITE_PRINCIPLE' },
  { id: 'T10', group: 'knowledge', ref: 'العلق:١-٥',          text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',                     weight: 0.99, domain: 'all',      rule: 'READ_EXECUTE_LOOP' },

  // ─── مجموعة ب: قواعد اللغة (20 خلية) ────────────────────────────────────
  { id: 'AR01', group: 'arabic',   ref: 'الرحمن:٤',           text: 'عَلَّمَهُ الْبَيَانَ — نحو الجملة الاسمية',                  weight: 0.99, domain: 'grammar',  rule: 'NOMINAL_SENTENCE' },
  { id: 'AR02', group: 'arabic',   ref: 'يوسف:٢',             text: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا — الفعل الماضي',    weight: 0.99, domain: 'grammar',  rule: 'PAST_VERB_RULE' },
  { id: 'AR03', group: 'arabic',   ref: 'السجدة:٥',           text: 'يُدَبِّرُ الْأَمْرَ — المضارع الدال على الاستمرار',          weight: 0.98, domain: 'grammar',  rule: 'PRESENT_CONTINUOUS' },
  { id: 'AR04', group: 'arabic',   ref: 'الطلاق:٧',           text: 'سَيَجْعَلُ اللَّهُ — المستقبل بالسين',                       weight: 0.98, domain: 'grammar',  rule: 'FUTURE_PROMISE' },
  { id: 'AR05', group: 'arabic',   ref: 'البقرة:٢٨٢',         text: 'وَلْيَكْتُب — فعل الأمر وصيغة المبني للمجهول',              weight: 0.98, domain: 'grammar',  rule: 'IMPERATIVE_PASSIVE' },
  { id: 'AR06', group: 'arabic',   ref: 'آل عمران:١٩١',       text: 'يَتَفَكَّرُونَ — الفعل المتعدي والمشتقات',                  weight: 0.97, domain: 'grammar',  rule: 'TRANSITIVE_DERIVATION' },
  { id: 'AR07', group: 'arabic',   ref: 'الفاتحة:٢',          text: 'الْحَمْدُ لِلَّهِ — الإعراب: مبتدأ + خبر',                  weight: 0.97, domain: 'grammar',  rule: 'MUBTADA_KHABAR' },
  { id: 'AR08', group: 'arabic',   ref: 'إبراهيم:٤',          text: 'بِلِسَانِ قَوْمِهِ — تكافؤ اللغة مع السياق',               weight: 0.97, domain: 'grammar',  rule: 'CONTEXT_AGREEMENT' },
  { id: 'AR09', group: 'arabic',   ref: 'الروم:٢٢',           text: 'اخْتِلَافُ أَلْسِنَتِكُمْ — تعدد لغات البرمجة',            weight: 0.97, domain: 'grammar',  rule: 'MULTILANG_POLYMORPHISM' },
  { id: 'AR10', group: 'arabic',   ref: 'ص:٢٩',               text: 'لِيَدَّبَّرُوا آيَاتِهِ — الصرف والاشتقاق',                 weight: 0.96, domain: 'grammar',  rule: 'MORPHOLOGICAL_DERIVATION' },
  { id: 'AR11', group: 'arabic',   ref: 'الكهف:١٠٩',          text: 'لَنَفِدَ الْبَحْرُ — الخبر الاسمي والتأكيد',               weight: 0.96, domain: 'grammar',  rule: 'AFFIRMATION_PATTERN' },
  { id: 'AR12', group: 'arabic',   ref: 'المائدة:٦',          text: 'فَاغْسِلُوا وُجُوهَكُمْ — أسلوب الشرط والجزاء',            weight: 0.96, domain: 'grammar',  rule: 'CONDITIONAL_SYNTAX' },
  { id: 'AR13', group: 'arabic',   ref: 'البقرة:١٨٣',         text: 'كُتِبَ عَلَيْكُمُ — بناء الفعل للمجهول + نائب الفاعل',     weight: 0.95, domain: 'grammar',  rule: 'PASSIVE_CONSTRUCTION' },
  { id: 'AR14', group: 'arabic',   ref: 'الأنفال:٦٠',         text: 'وَأَعِدُّوا — الأمر + المفعول به + التبعية',               weight: 0.95, domain: 'grammar',  rule: 'OBJECT_BINDING' },
  { id: 'AR15', group: 'arabic',   ref: 'النحل:٩٠',           text: 'يَنْهَىٰ عَنِ — النهي + المفعول فيه',                       weight: 0.95, domain: 'grammar',  rule: 'NEGATION_CONSTRAINT' },
  { id: 'AR16', group: 'arabic',   ref: 'الحجرات:٦',          text: 'فَتَبَيَّنُوا — أسلوب التوكيد بالفعل',                      weight: 0.95, domain: 'grammar',  rule: 'VERIFICATION_LOOP' },
  { id: 'AR17', group: 'arabic',   ref: 'النساء:١٣٥',         text: 'كُونُوا قَوَّامِينَ — الجمع والمعرفة والنكرة',              weight: 0.94, domain: 'grammar',  rule: 'DEFINITE_INDEFINITE' },
  { id: 'AR18', group: 'arabic',   ref: 'الزمر:١٨',           text: 'يَسْتَمِعُونَ الْقَوْلَ فَيَتَّبِعُونَ — الفاء للتعقيب',  weight: 0.94, domain: 'grammar',  rule: 'SEQUENTIAL_EXECUTION' },
  { id: 'AR19', group: 'arabic',   ref: 'الصف:٤',             text: 'صَفًّا كَأَنَّهُم بُنْيَانٌ — التشبيه البليغ',              weight: 0.94, domain: 'grammar',  rule: 'SIMILE_ANALOGY' },
  { id: 'AR20', group: 'arabic',   ref: 'النور:٣٥',           text: 'نُورٌ عَلَىٰ نُورٍ — الاستعارة والكناية',                   weight: 0.93, domain: 'grammar',  rule: 'METAPHOR_ABSTRACTION' },

  // ─── مجموعة ج: قوانين السنة النبوية (20 خلية) ───────────────────────────
  { id: 'S01', group: 'sunnah',   ref: 'البخاري:١',           text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',                         weight: 1.00, domain: 'all',      rule: 'INTENT_PRECONDITION' },
  { id: 'S02', group: 'sunnah',   ref: 'ابن ماجه:٢٣٤١',       text: 'لَا ضَرَرَ وَلَا ضِرَارَ',                                   weight: 0.99, domain: 'security', rule: 'NO_HARM_INVARIANT' },
  { id: 'S03', group: 'sunnah',   ref: 'البيهقي:٤٣٢٧',        text: 'إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ',           weight: 0.99, domain: 'quality',  rule: 'MASTERY_CONSTRAINT' },
  { id: 'S04', group: 'sunnah',   ref: 'البخاري:٣٩',           text: 'يَسِّرُوا وَلَا تُعَسِّرُوا',                               weight: 0.98, domain: 'ux',       rule: 'SIMPLICITY_FIRST' },
  { id: 'S05', group: 'sunnah',   ref: 'مسلم:٢٦٠٧',           text: 'عَلَيْكُمْ بِالصِّدْقِ',                                     weight: 0.98, domain: 'all',      rule: 'TRUTH_INVARIANT' },
  { id: 'S06', group: 'sunnah',   ref: 'البخاري:٢٩٧٧',        text: 'أُوتِيتُ جَوَامِعَ الْكَلِمِ',                               weight: 0.98, domain: 'language', rule: 'CONCISENESS_LAW' },
  { id: 'S07', group: 'sunnah',   ref: 'ابن ماجه:٢٢٤',        text: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ',                                 weight: 0.98, domain: 'all',      rule: 'LEARNING_IMPERATIVE' },
  { id: 'S08', group: 'sunnah',   ref: 'البخاري:٢٦٥١',        text: 'اكْتُبُوا لَهُ',                                             weight: 0.97, domain: 'storage',  rule: 'PERSIST_COMMAND' },
  { id: 'S09', group: 'sunnah',   ref: 'البخاري:٢٧٣٦',        text: 'احْصُوا',                                                     weight: 0.97, domain: 'math',     rule: 'COUNT_ENUMERATE' },
  { id: 'S10', group: 'sunnah',   ref: 'مسلم:٩١',             text: 'إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ',                   weight: 0.97, domain: 'ui',       rule: 'AESTHETIC_LAW' },
  { id: 'S11', group: 'sunnah',   ref: 'مسلم:٢٦٦٤',           text: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ',                              weight: 0.96, domain: 'perf',     rule: 'PERFORMANCE_PREFERENCE' },
  { id: 'S12', group: 'sunnah',   ref: 'مسلم:٢٥٦٦',           text: 'الْمُسْلِمُ أَخُو الْمُسْلِمِ',                              weight: 0.96, domain: 'network',  rule: 'PEER_PROTOCOL' },
  { id: 'S13', group: 'sunnah',   ref: 'أبوداود:٤٨٦٩',        text: 'الْمُسْتَشَارُ مُؤْتَمَنٌ',                                  weight: 0.96, domain: 'security', rule: 'CONFIDENTIALITY' },
  { id: 'S14', group: 'sunnah',   ref: 'البخاري:٦٠١٢',        text: 'مَثَلُ الْمُؤْمِنِينَ كَمَثَلِ الْجَسَدِ',                   weight: 0.95, domain: 'systems',  rule: 'SYSTEM_COHESION' },
  { id: 'S15', group: 'sunnah',   ref: 'مسلم:١٦٣١',           text: 'إِذَا مَاتَ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ',      weight: 0.95, domain: 'all',      rule: 'PERSISTENT_INHERITANCE' },
  { id: 'S16', group: 'sunnah',   ref: 'مسلم:٢٦٧٤',           text: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا',             weight: 0.95, domain: 'all',      rule: 'KNOWLEDGE_PATH' },
  { id: 'S17', group: 'sunnah',   ref: 'الترمذي:٢٥١٦',        text: 'الدَّالُّ عَلَى الْخَيْرِ كَفَاعِلِهِ',                      weight: 0.95, domain: 'api',      rule: 'DELEGATION_EQUALITY' },
  { id: 'S18', group: 'sunnah',   ref: 'البخاري:٢٤٤٢',        text: 'مَنِ اسْتَطَاعَ أَنْ يَنْفَعَ أَخَاهُ فَلْيَفْعَلْ',        weight: 0.94, domain: 'all',      rule: 'BENEFIT_OBLIGATION' },
  { id: 'S19', group: 'sunnah',   ref: 'مسلم:٥٥',             text: 'الدِّينُ النَّصِيحَةُ',                                       weight: 0.94, domain: 'review',   rule: 'CODE_REVIEW_AXIOM' },
  { id: 'S20', group: 'sunnah',   ref: 'أحمد:٧٩٣٩',           text: 'لَا يَشْكُرُ اللَّهَ مَنْ لَا يَشْكُرُ النَّاسَ',           weight: 0.93, domain: 'all',      rule: 'ACKNOWLEDGE_DEPENDENCY' },

  // ─── مجموعة د: قوانين الحاسب والبرمجة (20 خلية) ─────────────────────────
  { id: 'CS01', group: 'cs',       ref: 'القمر:٤٩',            text: 'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ — Big-O',            weight: 0.99, domain: 'cs',      rule: 'COMPLEXITY_LAW' },
  { id: 'CS02', group: 'cs',       ref: 'النمل:٤٠',            text: 'قَبْلَ أَن يَرْتَدَّ إِلَيْكَ طَرْفُكَ — O(1)',              weight: 0.99, domain: 'cs',      rule: 'CONSTANT_TIME' },
  { id: 'CS03', group: 'cs',       ref: 'الأنبياء:٣٠',         text: 'رَتْقًا فَفَتَقْنَاهُمَا — State Machine',                   weight: 0.98, domain: 'cs',      rule: 'STATE_TRANSITION' },
  { id: 'CS04', group: 'cs',       ref: 'الملك:١',             text: 'بِيَدِهِ الْمُلْكُ — Root Process Authority',                 weight: 0.98, domain: 'os',      rule: 'ROOT_AUTHORITY' },
  { id: 'CS05', group: 'cs',       ref: 'النساء:٥٨',           text: 'أَن تُؤَدُّوا الْأَمَانَاتِ — Cryptographic Trust',           weight: 0.98, domain: 'security', rule: 'TRUST_CHAIN' },
  { id: 'CS06', group: 'cs',       ref: 'الإخلاص:١',           text: 'قُلْ هُوَ اللَّهُ أَحَدٌ — Singleton Pattern',               weight: 0.98, domain: 'patterns', rule: 'SINGLETON_LAW' },
  { id: 'CS07', group: 'cs',       ref: 'البقرة:٢٦٩',          text: 'يُؤْتِي الْحِكْمَةَ — Algorithm Elegance',                   weight: 0.97, domain: 'cs',      rule: 'ELEGANCE_PRINCIPLE' },
  { id: 'CS08', group: 'cs',       ref: 'الحجرات:١٣',          text: 'لِتَعَارَفُوا — Network Protocol',                          weight: 0.97, domain: 'network',  rule: 'INTEROP_LAW' },
  { id: 'CS09', group: 'cs',       ref: 'الكهف:١٠٩',           text: 'لَوْ كَانَ الْبَحْرُ مِدَادًا — Infinite Scalability',       weight: 0.97, domain: 'cs',      rule: 'HORIZONTAL_SCALE' },
  { id: 'CS10', group: 'cs',       ref: 'الطلاق:١٢',           text: 'سَبْعَ سَمَاوَاتٍ — Layered Architecture',                   weight: 0.97, domain: 'arch',     rule: 'LAYERED_ARCH' },
  { id: 'CS11', group: 'cs',       ref: 'الصف:٤',              text: 'بُنْيَانٌ مَّرْصُوصٌ — Tight Coupling vs Loose',             weight: 0.96, domain: 'arch',     rule: 'COUPLING_LAW' },
  { id: 'CS12', group: 'cs',       ref: 'الحجر:٩',             text: 'إِنَّا لَهُ لَحَافِظُونَ — Data Integrity + Backup',         weight: 0.96, domain: 'storage',  rule: 'DATA_PROTECTION' },
  { id: 'CS13', group: 'cs',       ref: 'إبراهيم:١٩',          text: 'خَلَقَ اللَّهُ السَّمَاوَاتِ وَالْأَرْضَ بِالْحَقِّ',       weight: 0.96, domain: 'db',       rule: 'ACID_TRUTH' },
  { id: 'CS14', group: 'cs',       ref: 'الزمر:١٨',            text: 'فَيَتَّبِعُونَ أَحْسَنَهُ — Best Algorithm Selection',        weight: 0.96, domain: 'cs',      rule: 'OPTIMAL_SELECTION' },
  { id: 'CS15', group: 'cs',       ref: 'الملك:٣',             text: 'مَا تَرَىٰ مِن تَفَاوُتٍ — Zero Inconsistency',             weight: 0.96, domain: 'db',       rule: 'CONSISTENCY_DB' },
  { id: 'CS16', group: 'cs',       ref: 'الحشر:٢٢-٢٤',         text: 'الْمُهَيْمِنُ — Watchdog + Health Monitor',                  weight: 0.95, domain: 'ops',      rule: 'MONITORING_LAW' },
  { id: 'CS17', group: 'cs',       ref: 'البخاري:٢٠٥٢',        text: 'لَا يُلْدَغُ مِن جُحْرٍ مَرَّتَيْنِ — Error Recovery',      weight: 0.95, domain: 'resilience', rule: 'FAIL_FAST_RECOVER' },
  { id: 'CS18', group: 'cs',       ref: 'مسلم:٢٥٦٤',           text: 'لَا ضَرَرَ — Zero Side Effects',                             weight: 0.95, domain: 'fp',       rule: 'PURE_FUNCTION' },
  { id: 'CS19', group: 'cs',       ref: 'الأنعام:١٥٣',         text: 'هَٰذَا صِرَاطِي مُسْتَقِيمًا — Shortest Path',               weight: 0.95, domain: 'cs',      rule: 'DIJKSTRA_AXIOM' },
  { id: 'CS20', group: 'cs',       ref: 'يونس:٥',              text: 'قَدَّرَهُ مَنَازِلَ لِتَعْلَمُوا الْحِسَابَ',                weight: 0.94, domain: 'math',     rule: 'NUMERIC_PRECISION' },

  // ─── مجموعة هـ: قوانين الكون والمادة (20 خلية) ───────────────────────────
  { id: 'U01', group: 'universe',  ref: 'الذاريات:٤٧',         text: 'وَالسَّمَاءَ بَنَيْنَاهَا — Expansion Law',                  weight: 0.99, domain: 'physics',  rule: 'CONSERVATION_ENERGY' },
  { id: 'U02', group: 'universe',  ref: 'النور:٣٥',            text: 'اللَّهُ نُورُ السَّمَاوَاتِ — Speed of Light c',             weight: 0.99, domain: 'physics',  rule: 'SPEED_OF_LIGHT' },
  { id: 'U03', group: 'universe',  ref: 'يس:٤٠',               text: 'كُلٌّ فِي فَلَكٍ يَسْبَحُونَ — Orbital Mechanics',           weight: 0.98, domain: 'physics',  rule: 'ORBITAL_LAW' },
  { id: 'U04', group: 'universe',  ref: 'الحديد:٢٥',           text: 'وَأَنزَلْنَا الْحَدِيدَ — Ferromagnetism + Conductivity',    weight: 0.98, domain: 'physics',  rule: 'ELECTROMAGNETIC_LAW' },
  { id: 'U05', group: 'universe',  ref: 'الأنبياء:٣٠',         text: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ — Fluid Dynamics',   weight: 0.98, domain: 'physics',  rule: 'FLUID_DYNAMICS' },
  { id: 'U06', group: 'universe',  ref: 'النحل:١٥',            text: 'أَلْقَىٰ فِي الْأَرْضِ رَوَاسِيَ — Plate Tectonics',        weight: 0.97, domain: 'geology',  rule: 'TECTONIC_BALANCE' },
  { id: 'U07', group: 'universe',  ref: 'القمر:٤٩',            text: 'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ — Determinism',   weight: 0.97, domain: 'physics',  rule: 'CAUSALITY_LAW' },
  { id: 'U08', group: 'universe',  ref: 'الحجر:٢٢',            text: 'أَرْسَلْنَا الرِّيَاحَ لَوَاقِحَ — Thermodynamics',         weight: 0.97, domain: 'physics',  rule: 'THERMODYNAMICS' },
  { id: 'U09', group: 'universe',  ref: 'الرحمن:٣٣',           text: 'إِنِ اسْتَطَعْتُمْ أَن تَنفُذُوا — Escape Velocity',        weight: 0.97, domain: 'physics',  rule: 'ESCAPE_VELOCITY' },
  { id: 'U10', group: 'universe',  ref: 'النجم:١',              text: 'وَالنَّجْمِ إِذَا هَوَىٰ — Gravitational Collapse',          weight: 0.96, domain: 'physics',  rule: 'GRAVITY_LAW' },
  { id: 'U11', group: 'universe',  ref: 'يونس:٥',              text: 'جَعَلَ الشَّمْسَ ضِيَاءً — Photon Energy E=hf',             weight: 0.96, domain: 'quantum',  rule: 'PHOTON_ENERGY' },
  { id: 'U12', group: 'universe',  ref: 'المؤمنون:١٢-١٤',      text: 'خَلَقْنَا الْإِنسَانَ مِن سُلَالَةٍ — DNA Replication',     weight: 0.96, domain: 'biology',  rule: 'GENETIC_CODE' },
  { id: 'U13', group: 'universe',  ref: 'البقرة:٣٠',           text: 'يُفْسِدُ فِيهَا — Entropy Increase (2nd Law)',               weight: 0.96, domain: 'physics',  rule: 'ENTROPY_LAW' },
  { id: 'U14', group: 'universe',  ref: 'الرحمن:٧',            text: 'وَالسَّمَاءَ رَفَعَهَا — Newton 3rd Law',                   weight: 0.95, domain: 'physics',  rule: 'ACTION_REACTION' },
  { id: 'U15', group: 'universe',  ref: 'يس:٣٦',               text: 'سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ — Wave-Particle',     weight: 0.95, domain: 'quantum',  rule: 'WAVE_PARTICLE_DUALITY' },
  { id: 'U16', group: 'universe',  ref: 'الحاقة:٣٢',           text: 'فِي سِلْسِلَةٍ — Chain Reaction',                           weight: 0.95, domain: 'chemistry', rule: 'CHAIN_REACTION' },
  { id: 'U17', group: 'universe',  ref: 'الملك:٢',             text: 'لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلاً — Fitness Fn',   weight: 0.95, domain: 'ai',       rule: 'FITNESS_FUNCTION' },
  { id: 'U18', group: 'universe',  ref: 'النمل:٨٨',            text: 'صُنْعَ اللَّهِ الَّذِي أَتْقَنَ — Zero Defect',              weight: 0.95, domain: 'quality',  rule: 'ZERO_DEFECT' },
  { id: 'U19', group: 'universe',  ref: 'الزلزلة:٧-٨',         text: 'مَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ — Atomic Precision',         weight: 0.94, domain: 'quantum',  rule: 'ATOMIC_PRECISION' },
  { id: 'U20', group: 'universe',  ref: 'فصلت:٥٣',             text: 'سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ — Observable Universe',  weight: 0.94, domain: 'physics',  rule: 'OBSERVABILITY' },

  // ─── مجموعة و: قوانين الرياضيات (15 خلية) ───────────────────────────────
  { id: 'M01', group: 'math',      ref: 'القمر:٤٩',            text: 'كُلَّ شَيْءٍ بِقَدَرٍ — Quantification ∀x',                  weight: 0.99, domain: 'math',     rule: 'UNIVERSAL_QUANTIFIER' },
  { id: 'M02', group: 'math',      ref: 'الرحمن:٧-٩',          text: 'وَضَعَ الْمِيزَانَ — Conservation Laws',                     weight: 0.98, domain: 'math',     rule: 'CONSERVATION' },
  { id: 'M03', group: 'math',      ref: 'يونس:٥',              text: 'لِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ',               weight: 0.98, domain: 'math',     rule: 'ARITHMETIC_LAW' },
  { id: 'M04', group: 'math',      ref: 'النجم:٤٥-٤٦',         text: 'خَلَقَ الزَّوْجَيْنِ الذَّكَرَ وَالْأُنثَىٰ — Binary',      weight: 0.97, domain: 'math',     rule: 'BINARY_DUALITY' },
  { id: 'M05', group: 'math',      ref: 'الطلاق:١٢',           text: 'اللَّهُ الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ — Sets',           weight: 0.97, domain: 'math',     rule: 'SET_THEORY' },
  { id: 'M06', group: 'math',      ref: 'البقرة:٢٦',           text: 'بَعُوضَةً فَمَا فَوْقَهَا — Logarithmic Scale',             weight: 0.96, domain: 'math',     rule: 'LOGARITHMIC_SCALE' },
  { id: 'M07', group: 'math',      ref: 'الكهف:١٨',            text: 'تَحْسَبُهُمْ أَيْقَاظًا — Probability P(A)',                 weight: 0.96, domain: 'math',     rule: 'PROBABILITY_AXIOM' },
  { id: 'M08', group: 'math',      ref: 'الأنعام:١٣٨',         text: 'حِجْرٌ لَّا يَطْعَمُهَا — Constraint Satisfaction',         weight: 0.95, domain: 'math',     rule: 'CONSTRAINT_SYSTEM' },
  { id: 'M09', group: 'math',      ref: 'الزخرف:٨٤',           text: 'وَهُوَ الَّذِي فِي السَّمَاءِ إِلَٰهٌ — Absolute Value',    weight: 0.95, domain: 'math',     rule: 'ABSOLUTE_FUNCTION' },
  { id: 'M10', group: 'math',      ref: 'الحاقة:١٧',           text: 'ثَمَانِيَةٌ — Octal / Binary — Number Systems',             weight: 0.95, domain: 'math',     rule: 'NUMBER_BASE' },
  { id: 'M11', group: 'math',      ref: 'الكهف:١٠٩',           text: 'لَنَفِدَ الْبَحْرُ — Infinite Series',                      weight: 0.94, domain: 'math',     rule: 'INFINITE_SERIES' },
  { id: 'M12', group: 'math',      ref: 'البقرة:٢٨٣',          text: 'فَرِهَانٌ مَّقْبُوضَةٌ — Cryptographic Hash',               weight: 0.94, domain: 'math',     rule: 'HASH_FUNCTION' },
  { id: 'M13', group: 'math',      ref: 'النساء:١١',           text: 'الذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ — Ratio 2:1',        weight: 0.93, domain: 'math',     rule: 'RATIO_FUNCTION' },
  { id: 'M14', group: 'math',      ref: 'العنكبوت:٤١',         text: 'كَمَثَلِ الْعَنكَبُوتِ — Graph Theory: Weak Connectivity',   weight: 0.93, domain: 'math',     rule: 'GRAPH_CONNECTIVITY' },
  { id: 'M15', group: 'math',      ref: 'الفجر:١-٣',           text: 'وَالْفَجْرِ وَلَيَالٍ عَشْرٍ — Modular Arithmetic',         weight: 0.92, domain: 'math',     rule: 'MODULAR_ARITHMETIC' },

  // ─── مجموعة ز: قوانين اللغة والمنطق (15 خلية) ───────────────────────────
  { id: 'L01', group: 'logic',     ref: 'الرحمن:٤',            text: 'عَلَّمَهُ الْبَيَانَ — Formal Grammar G=(N,T,P,S)',           weight: 0.99, domain: 'language', rule: 'FORMAL_GRAMMAR' },
  { id: 'L02', group: 'logic',     ref: 'الزمر:١٨',            text: 'يَسْتَمِعُونَ فَيَتَّبِعُونَ أَحْسَنَهُ — Best-First Search', weight: 0.98, domain: 'logic',    rule: 'LOGICAL_INFERENCE' },
  { id: 'L03', group: 'logic',     ref: 'البقرة:٢٦٩',          text: 'يُؤْتِي الْحِكْمَةَ — Modus Ponens: A→B, A ⊢ B',           weight: 0.98, domain: 'logic',    rule: 'MODUS_PONENS' },
  { id: 'L04', group: 'logic',     ref: 'المائدة:٦',           text: 'فَإِن كُنتُم مَّرْضَىٰ — Conditional Logic if-else',        weight: 0.97, domain: 'logic',    rule: 'CONDITIONAL_LOGIC' },
  { id: 'L05', group: 'logic',     ref: 'الأنعام:١٥٣',         text: 'هَٰذَا صِرَاطِي مُسْتَقِيمًا — Axiom System',               weight: 0.97, domain: 'logic',    rule: 'AXIOMATIC_SYSTEM' },
  { id: 'L06', group: 'logic',     ref: 'النحل:٩٠',            text: 'يَنْهَىٰ عَنِ الْفَحْشَاءِ — NOT Gate / Prohibition Rule',   weight: 0.96, domain: 'logic',    rule: 'NEGATION_LAW' },
  { id: 'L07', group: 'logic',     ref: 'إبراهيم:٤',           text: 'بِلِسَانِ قَوْمِهِ — Context-Free Language',                weight: 0.96, domain: 'language', rule: 'CONTEXT_FREE' },
  { id: 'L08', group: 'logic',     ref: 'النمل:٢٧',            text: 'سَنَنظُرُ — Type Inference / Verification',                  weight: 0.95, domain: 'logic',    rule: 'TYPE_CHECKING' },
  { id: 'L09', group: 'logic',     ref: 'الكهف:٢٣',            text: 'وَلَا تَقُولَنَّ لِشَيْءٍ إِنِّي فَاعِلٌ — Exception Guard', weight: 0.95, domain: 'logic',    rule: 'PRECONDITION_GUARD' },
  { id: 'L10', group: 'logic',     ref: 'يوسف:٤٠',             text: 'إِنِ الْحُكْمُ إِلَّا لِلَّهِ — Supreme Authority Rule',    weight: 0.95, domain: 'logic',    rule: 'SUPREMACY_RULE' },
  { id: 'L11', group: 'logic',     ref: 'البقرة:٢٨٢',          text: 'وَلَا يَأْبَ كَاتِبٌ — Write Permission Check',              weight: 0.94, domain: 'logic',    rule: 'PERMISSION_CHECK' },
  { id: 'L12', group: 'logic',     ref: 'الحجرات:٦',           text: 'فَتَبَيَّنُوا — Input Validation',                           weight: 0.94, domain: 'logic',    rule: 'VALIDATION_RULE' },
  { id: 'L13', group: 'logic',     ref: 'المجادلة:١١',         text: 'يَرْفَعِ اللَّهُ الَّذِينَ أُوتُوا الْعِلْمَ — Ranking',    weight: 0.94, domain: 'logic',    rule: 'RANKING_FUNCTION' },
  { id: 'L14', group: 'logic',     ref: 'الإسراء:٨٥',          text: 'وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا',           weight: 0.93, domain: 'logic',    rule: 'HALTING_HUMILITY' },
  { id: 'L15', group: 'logic',     ref: 'العصر:١-٣',           text: 'وَالْعَصْرِ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ — Time Limit',   weight: 0.93, domain: 'logic',    rule: 'TIMEOUT_LAW' },

  // ─── مجموعة ح: سنة الخلفاء الراشدين المهديين (20 خلية) ──────────────────
  // «عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ مِنْ بَعْدِي»
  // أبو داود: ٤٦٠٧ | الترمذي: ٢٦٧٦

  // أبو بكر الصديق رضي الله عنه
  { id: 'KR01', group: 'khulafa', ref: 'أبو داود:٤٦٠٧',        text: 'أبو بكر: «أطيعوني ما أطعت الله» — Conditional Authority Token',      weight: 1.00, domain: 'security',    rule: 'CONDITIONAL_AUTHORITY' },
  { id: 'KR02', group: 'khulafa', ref: 'البخاري:٤٩٨٦',         text: 'أبو بكر: جمع القرآن — Critical Emergency Backup',                     weight: 0.99, domain: 'storage',     rule: 'CRITICAL_BACKUP' },
  { id: 'KR03', group: 'khulafa', ref: 'البخاري:١٢٤١',         text: 'أبو بكر: ثباته يوم وفاة النبيﷺ — Graceful Degradation on SPOF',      weight: 0.99, domain: 'resilience',  rule: 'GRACEFUL_DEGRADATION' },
  { id: 'KR04', group: 'khulafa', ref: 'البخاري:١٣٩٩',         text: 'أبو بكر: «لو منعوني عِقالاً» — Zero-Tolerance Contract Enforcement',  weight: 0.99, domain: 'contracts',   rule: 'ZERO_TOLERANCE_CONTRACT' },
  { id: 'KR05', group: 'khulafa', ref: 'سيرة ابن هشام',        text: 'أبو بكر: «ولست بخيركم» — Servant Leadership Pattern',                 weight: 1.00, domain: 'governance',  rule: 'SERVANT_LEADERSHIP' },

  // عمر بن الخطاب رضي الله عنه
  { id: 'KR06', group: 'khulafa', ref: 'تاريخ الطبري',          text: 'عمر: الديوان — أول نظام قواعد بيانات في الإسلام',                     weight: 1.00, domain: 'db',          rule: 'DATABASE_ADMINISTRATION' },
  { id: 'KR07', group: 'khulafa', ref: 'تاريخ الطبري',          text: 'عمر: التقويم الهجري — Universal Timestamp Reference System',           weight: 0.99, domain: 'datetime',    rule: 'CALENDAR_SYSTEM' },
  { id: 'KR08', group: 'khulafa', ref: 'تاريخ الطبري',          text: 'عمر: «متى استعبدتم الناس» — User Freedom by Default',                  weight: 1.00, domain: 'ux',          rule: 'USER_FREEDOM_BY_DEFAULT' },
  { id: 'KR09', group: 'khulafa', ref: 'ابن عساكر',             text: 'عمر: «لو عثرت بغلة» — Full Observability & Accountability',            weight: 1.00, domain: 'monitoring',  rule: 'FULL_ACCOUNTABILITY' },
  { id: 'KR10', group: 'khulafa', ref: 'تاريخ الطبري',          text: 'عمر: تفتيش الولاة — Runtime Audit + Governance Monitoring',            weight: 0.99, domain: 'ops',         rule: 'GOVERNANCE_AUDIT' },

  // عثمان بن عفان رضي الله عنه
  { id: 'KR11', group: 'khulafa', ref: 'البخاري:٤٩٨٧',         text: 'عثمان: توحيد المصحف — Single Source of Truth + Canonical Version',     weight: 1.00, domain: 'versioning',  rule: 'SINGLE_SOURCE_OF_TRUTH' },
  { id: 'KR12', group: 'khulafa', ref: 'البخاري:٤٩٨٧',         text: 'عثمان: إرسال المصاحف للأمصار — Content Delivery Network (CDN)',        weight: 1.00, domain: 'cdn',         rule: 'CONTENT_DELIVERY_NETWORK' },
  { id: 'KR13', group: 'khulafa', ref: 'تاريخ الطبري',          text: 'عثمان: توسيع المسجدين — Proactive Infrastructure Scaling',             weight: 0.98, domain: 'infra',       rule: 'INFRASTRUCTURE_SCALING' },
  { id: 'KR14', group: 'khulafa', ref: 'البخاري:٢٧٧٨',         text: 'عثمان: بئر رومة وجيش العسرة — Resource Pooling for Commons',           weight: 0.98, domain: 'resources',   rule: 'RESOURCE_GENEROSITY' },
  { id: 'KR15', group: 'khulafa', ref: 'فتوح البلدان',          text: 'عثمان: الأسطول البحري — Opening New Transport & Network Layer',         weight: 0.97, domain: 'network',     rule: 'NEW_TRANSPORT_LAYER' },

  // علي بن أبي طالب رضي الله عنه
  { id: 'KR16', group: 'khulafa', ref: 'نهج البلاغة:٨١',        text: 'علي: «قيمة كل امرئ ما يحسنه» — Skills-Based Role Assignment',         weight: 1.00, domain: 'rbac',        rule: 'SKILLS_BASED_IDENTITY' },
  { id: 'KR17', group: 'khulafa', ref: 'الترمذي:٢٦٨٧',         text: 'علي: «الحكمة ضالة المؤمن» — Universal Knowledge Extraction',           weight: 0.99, domain: 'ai',          rule: 'WISDOM_MINING' },
  { id: 'KR18', group: 'khulafa', ref: 'نهج البلاغة',           text: 'علي: «اعرف الحق تعرف أهله» — Truth-First Type System',                 weight: 0.99, domain: 'logic',       rule: 'TRUTH_FIRST_IDENTITY' },
  { id: 'KR19', group: 'khulafa', ref: 'نهج البلاغة',           text: 'علي: «من استبد برأيه هلك» — No Single Point of Failure in Decisions',  weight: 0.99, domain: 'resilience',  rule: 'NO_SINGLE_POINT_OF_FAILURE' },
  { id: 'KR20', group: 'khulafa', ref: 'نهج البلاغة',           text: 'علي: «لا تكن عبد غيرك» — Component Autonomy / No Vendor Lock-in',     weight: 0.98, domain: 'all',         rule: 'AUTONOMY_PRINCIPLE' },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── فهارس سريعة ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const _cellMap = new Map(NEURAL_CELLS_120.map(c => [c.id, c]));

/** إزالة التشكيل للمقارنة */
function _strip(str) {
  return str.replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06DC«»]/g, '').toLowerCase();
}

/** بحث في الخلايا */
function search(query = '') {
  const q = _strip(query);
  if (!q) return [];
  return NEURAL_CELLS_120.filter(c =>
    _strip(c.text).includes(q) ||
    _strip(c.ref).includes(q)  ||
    c.rule.toLowerCase().includes(q) ||
    c.domain.toLowerCase().includes(q)
  );
}

/** استرجاع خلايا حسب المجموعة */
function getCellsByGroup(group = '') {
  return NEURAL_CELLS_120.filter(c => c.group === group);
}

/** استرجاع خلايا حسب المجال */
function getCellsByDomain(domain = '') {
  return NEURAL_CELLS_120.filter(c => c.domain === domain);
}

/** حالة الشبكة */
function status() {
  const groups = [...new Set(NEURAL_CELLS_120.map(c => c.group))];
  return {
    name:        'Sheikha Unified Rules Neural Network',
    nameAr:      'شبكة القواعد الموحَّدة لكل شيء',
    version:     VERSION,
    schema:      SCHEMA,
    totalCells:  NEURAL_CELLS_120.length,
    groups:      groups.length,
    groupList:   groups,
    hadithJami:  '«عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ» — أبو داود: ٤٦٠٧',
    tawheed:     TAWHEED,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── التصدير ───────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  NEURAL_CELLS_120,
  TAWHEED,
  BISMILLAH,
  SCHEMA,
  VERSION,
  search,
  getCellsByGroup,
  getCellsByDomain,
  status,
  getCell: (id) => _cellMap.get(id) || null,
};

