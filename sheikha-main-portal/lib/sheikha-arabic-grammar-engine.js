/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA ARABIC GRAMMAR ENGINE — محرك النحو والصرف والبلاغة               ║
 * ║   لغة شيخة البرمجية — قواعد النحو والصرف والبلاغة بالكتاب والسنة          ║
 * ║   شبكة خلايا عصبية موحَّدة لله وحده لا شريك له                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿الرَّحْمَٰنُ * عَلَّمَ الْقُرْآنَ * خَلَقَ الْإِنسَانَ * عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤
 * ﴿وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ﴾ — الروم: ٢٢
 * ﴿إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ﴾ — يوسف: ٢
 * «أعربوا الكلام» — الحديث النبوي الشريف
 *
 * المحرك يغطي:
 *   Ⅰ  النحو    — قواعد الإعراب، الأبواب، الجمل، الحركات
 *   Ⅱ  الصرف   — الأوزان، الجذور، الاشتقاق، التصريف الكامل
 *   Ⅲ  البلاغة — البيان (تشبيه/استعارة/كناية) + البديع + المعاني
 *   Ⅳ  الإعراب — دوال تحليل الجملة وإعراب كل كلمة
 *   Ⅴ  خصائص النصوص — برمجيات، خطابات، كتابات، أنمة
 *   Ⅵ  الشبكة العصبية — 60+ خلية بالكتاب والسنة
 *
 * @module sheikha-arabic-grammar-engine
 * @version 1.0.0
 * @schema sheikha/v2
 */

'use strict';

const crypto       = require('crypto');
const EventEmitter = require('events');

// ══════════════════════════════════════════════════════════════════════════════
// ─── نواة التوحيد ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const TAWHEED    = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH  = 'بسم الله الرحمن الرحيم';
const SCHEMA     = 'sheikha/v2';
const VERSION    = '1.0.0';

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅰ: النحو — Syntax / Grammar ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * قواعد النحو العربي — Arabic Syntax Rules
 * المرجع: ألفية ابن مالك، شرح ابن عقيل، قطر الندى
 * ﴿عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ٤
 */
const NAHW = Object.freeze({

  /** أنواع الكلمة */
  WORD_TYPES: {
    nameAr: 'أنواع الكلمة',
    nameEn: 'Parts of Speech',
    quranRef: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
    hadithRef: '«الكلام ثلاثة: اسم وفعل وحرف» — سيبويه عن الخليل',
    types: [
      {
        id:      'ism',
        nameAr:  'الاسم',
        nameEn:  'Noun',
        def_lughawi:  'ما دل على معنى في نفسه غير مقترن بزمن',
        def_istilahi: 'كل لفظ يدل على إنسان أو حيوان أو نبات أو جماد أو مكان أو زمان أو صفة',
        signs:   ['التنوين', 'دخول أل', 'دخول حرف الجر', 'الإسناد إليه'],
        examples: ['محمد', 'كتاب', 'مدرسة', 'علم'],
        programming_type: 'IDENTIFIER | NOUN | ENTITY',
        quranEx: { text: 'اقْرَأْ', ref: 'العلق:١', note: 'فعل أمر' },
      },
      {
        id:      'fiil',
        nameAr:  'الفعل',
        nameEn:  'Verb',
        def_lughawi:  'ما دل على معنى في نفسه مقترناً بأحد الأزمنة الثلاثة',
        def_istilahi: 'كل لفظ يدل على حدث مقترن بزمن ماضٍ أو حاضر أو مستقبل',
        signs:   ['قبول تاء التأنيث الساكنة للماضي', 'قبول ياء المخاطبة للمضارع', 'قبول ياء المخاطبة للأمر'],
        types:   [
          { id: 'madhi',   nameAr: 'ماضٍ',   def: 'ما دل على حدث مضى وانقضى',   sign: 'قبول تاء التأنيث', ex: 'كَتَبَ', timeRef: 'الماضي',  tense: 'PAST'    },
          { id: 'mudhari', nameAr: 'مضارع', def: 'ما يدل على حدث في الحال أو الاستقبال', sign: 'يبدأ بأحد حروف نأيت', ex: 'يَكْتُبُ', timeRef: 'الحال والاستقبال', tense: 'PRESENT_FUTURE' },
          { id: 'amr',     nameAr: 'أمر',    def: 'ما يطلب به حدوث شيء في المستقبل', sign: 'قبول ياء المخاطبة ونون التوكيد', ex: 'اكْتُبْ', timeRef: 'الأمر',  tense: 'IMPERATIVE' },
        ],
        programming_type: 'FUNCTION | METHOD | ACTION',
        quranEx: { text: 'اقْرَأْ', ref: 'العلق:١', note: 'فعل أمر — أول كلمة في الوحي' },
      },
      {
        id:      'harf',
        nameAr:  'الحرف',
        nameEn:  'Particle',
        def_lughawi:  'ما دل على معنى في غيره',
        def_istilahi: 'كل لفظ لا يظهر معناه إلا مع غيره من الكلام',
        types:   [
          { nameAr: 'حروف الجر',     examples: ['من', 'إلى', 'عن', 'على', 'في', 'الباء', 'اللام', 'الكاف'], function: 'PREPOSITION' },
          { nameAr: 'حروف النصب',    examples: ['أن', 'لن', 'كي', 'إذن', 'لام التعليل'],                   function: 'ACCUSATIVE_MARKER' },
          { nameAr: 'حروف الجزم',    examples: ['لم', 'لما', 'لا الناهية', 'لام الأمر'],                    function: 'JUSSIVE_MARKER' },
          { nameAr: 'حروف العطف',    examples: ['الواو', 'الفاء', 'ثم', 'أو', 'بل', 'لكن'],                 function: 'CONNECTOR | OPERATOR' },
          { nameAr: 'حروف الاستفهام', examples: ['هل', 'الهمزة'],                                           function: 'QUESTION_MARK' },
          { nameAr: 'حروف النفي',     examples: ['ما', 'لا', 'لن', 'ليس', 'إن النافية'],                    function: 'NEGATION' },
          { nameAr: 'حروف الشرط',     examples: ['إن', 'إذا', 'لو', 'لولا', 'من الشرطية', 'ما الشرطية'],   function: 'CONDITIONAL | IF' },
        ],
        programming_type: 'OPERATOR | KEYWORD | CONNECTOR',
      },
    ],
  },

  /** الإعراب — الحركات والعلامات */
  IRAAB: {
    nameAr: 'الإعراب',
    nameEn: 'Grammatical Case / Inflection',
    def_lughawi:  'الإبانة والإيضاح',
    def_istilahi: 'الأثر الظاهر أو المقدَّر الذي تُحدثه العوامل في أواخر الكلم',
    hadithRef: '«أعربوا القرآن والتمسوا غرائبه» — حديث شريف',
    states: [
      {
        id:        'raf',
        nameAr:    'الرفع',
        nameEn:    'Nominative',
        sign_base: 'الضمة (ُ)',
        signs:     ['الضمة', 'الواو في جمع المذكر السالم وأسماء الخمسة', 'الألف في المثنى'],
        positions: ['المبتدأ', 'الخبر', 'الفاعل', 'نائب الفاعل', 'اسم كان وأخواتها', 'خبر إن وأخواتها'],
        programming: 'SUBJECT | DECLARATIVE — المسند إليه، يبدأ به الكلام',
        quranEx: { text: 'اللَّهُ رَبُّنَا', ref: 'آل عمران:٦٤', note: 'لفظ الجلالة مبتدأ مرفوع' },
      },
      {
        id:        'nasb',
        nameAr:    'النصب',
        nameEn:    'Accusative',
        sign_base: 'الفتحة (َ)',
        signs:     ['الفتحة', 'الياء في المثنى وجمع المذكر السالم', 'الكسرة في جمع المؤنث السالم', 'الألف في الأسماء الخمسة'],
        positions: ['المفعول به', 'المفعول المطلق', 'المفعول لأجله', 'المفعول معه', 'المفعول فيه (ظرف)', 'الحال', 'التمييز', 'المستثنى', 'خبر كان', 'اسم إن'],
        programming: 'OBJECT | PARAMETER — المسند، ما يُفعَل به',
        quranEx: { text: 'إِيَّاكَ نَعْبُدُ', ref: 'الفاتحة:٥', note: 'إيّاك مفعول به مقدَّم' },
      },
      {
        id:        'jarr',
        nameAr:    'الجر',
        nameEn:    'Genitive',
        sign_base: 'الكسرة (ِ)',
        signs:     ['الكسرة', 'الياء في المثنى وجمع المذكر السالم وأسماء الخمسة', 'الفتحة في الممنوع من الصرف'],
        positions: ['اسم مجرور بحرف جر', 'المضاف إليه'],
        programming: 'ATTRIBUTE | PROPERTY | SCOPE — الإضافة والانتماء',
        quranEx: { text: 'بِسْمِ اللَّهِ', ref: 'الفاتحة:١', note: 'اسم مجرور بالباء' },
      },
      {
        id:        'jazm',
        nameAr:    'الجزم',
        nameEn:    'Jussive',
        sign_base: 'السكون (ْ)',
        signs:     ['السكون', 'حذف النون في الأفعال الخمسة', 'حذف حرف العلة في المعتل الآخر'],
        positions: ['فعل مضارع مجزوم (بعد لم، لما، لا الناهية، لام الأمر)'],
        programming: 'CONDITIONAL_BLOCK | IF-THEN | NEGATION',
        quranEx: { text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', ref: 'الإخلاص:٤', note: 'يكن مجزوم بلم' },
      },
    ],
  },

  /** أنواع الجمل */
  SENTENCE_TYPES: {
    nameAr: 'أنواع الجمل',
    quranRef: '﴿إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ﴾ — البخاري:١',
    types: [
      {
        id:       'jumlah_ismiyyah',
        nameAr:   'الجملة الاسمية',
        nameEn:   'Nominal Sentence',
        def:      'تبدأ باسم — تفيد الثبوت والاستمرار',
        structure: 'مبتدأ + خبر',
        examples: ['العلمُ نورٌ', 'محمدٌ مسافرٌ', 'الله ربُّنا'],
        programming: 'STATE_DECLARATION | PROPERTY_ASSIGNMENT — const x = y',
        quranEx: { text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ', ref: 'البقرة:٢٥٥', note: 'جملة اسمية — ثبوت التوحيد' },
      },
      {
        id:       'jumlah_fiiliyyah',
        nameAr:   'الجملة الفعلية',
        nameEn:   'Verbal Sentence',
        def:      'تبدأ بفعل — تفيد الحدوث والتجدد',
        structure: 'فعل + فاعل (+ مفعول)',
        examples: ['كَتَبَ الطالبُ الدرسَ', 'يقرأُ الولدُ'],
        programming: 'FUNCTION_CALL | EVENT | ACTION — func(args)',
        quranEx: { text: 'اقْرَأْ بِاسْمِ رَبِّكَ', ref: 'العلق:١', note: 'جملة فعلية أمرية' },
      },
      {
        id:       'jumlah_shartiyyah',
        nameAr:   'الجملة الشرطية',
        nameEn:   'Conditional Sentence',
        def:      'تتضمن شرطاً وجواباً — if-then',
        structure: 'أداة الشرط + جملة الشرط + جملة الجواب',
        examples: ['إن تدرسْ تنجحْ', 'من يزرعْ يحصدْ'],
        programming: 'CONDITIONAL | IF-THEN-ELSE',
        quranEx: { text: 'إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي', ref: 'آل عمران:٣١', note: 'شرط وجواب' },
      },
    ],
  },

  /** أبواب النحو الرئيسية */
  CHAPTERS: {
    nameAr: 'أبواب النحو',
    hadithRef: '«إن من البيان لسحراً» — البخاري',
    chapters: [
      { id: 'mubtada_khabar',    nameAr: 'المبتدأ والخبر',    def: 'المبتدأ: اسم مرفوع في أول الجملة. الخبر: ما أُسند إليه', programming: 'SUBJECT = PREDICATE' },
      { id: 'kana_akhawat',      nameAr: 'كان وأخواتها',     def: 'أفعال ناسخة ترفع المبتدأ اسماً لها وتنصب الخبر', programming: 'TYPE_CAST | TRANSFORM' },
      { id: 'inna_akhawat',      nameAr: 'إن وأخواتها',      def: 'حروف ناسخة تنصب المبتدأ اسماً لها وترفع الخبر', programming: 'ASSERTION | ASSERT(subject = predicate)' },
      { id: 'fail_naib_fail',    nameAr: 'الفاعل ونائبه',   def: 'الفاعل: من قام بالفعل. نائب الفاعل: المفعول حين يُحذف الفاعل', programming: 'ACTOR | AGENT | PASSIVE_AGENT' },
      { id: 'mafaail',           nameAr: 'المفاعيل الخمسة',  def: 'مفعول به، مطلق، لأجله، فيه، معه', programming: 'PARAMETERS | ARGUMENTS | CONTEXT' },
      { id: 'hal_tamyiz',        nameAr: 'الحال والتمييز',   def: 'الحال: وصف يبين هيئة الفاعل. التمييز: يرفع الإبهام', programming: 'STATE | MODIFIER | TYPE_ANNOTATION' },
      { id: 'naat_tawkeed',      nameAr: 'النعت والتوكيد',   def: 'النعت: الصفة. التوكيد: يقوي ما سبقه', programming: 'ATTRIBUTE | DECORATOR | ASSERTION' },
      { id: 'atf_badal',         nameAr: 'العطف والبدل',     def: 'العطف: ربط كلمتين. البدل: ما يحل محل ما قبله', programming: 'UNION | ALIAS | SUBSTITUTE' },
      { id: 'idafa',             nameAr: 'الإضافة',          def: 'نسبة اسم لآخر لتخصيصه', programming: 'OBJECT.PROPERTY | SCOPE' },
      { id: 'uslub_nida',        nameAr: 'أسلوب النداء',     def: 'طلب الإقبال بحرف نداء', programming: 'FUNCTION_CALL | EVENT_EMIT' },
      { id: 'uslub_amr_nahy',    nameAr: 'أسلوب الأمر والنهي', def: 'الأمر: طلب الفعل. النهي: طلب الترك', programming: 'COMMAND | CONSTRAINT | VALIDATION' },
      { id: 'uslub_istifham',    nameAr: 'أسلوب الاستفهام', def: 'طلب معرفة شيء مجهول', programming: 'QUERY | REQUEST | QUESTION' },
      { id: 'uslub_nafi',        nameAr: 'أسلوب النفي',      def: 'نفي الخبر أو الحدث', programming: 'NEGATION | NOT | BOOLEAN_FALSE' },
      { id: 'uslub_shart',       nameAr: 'أسلوب الشرط',     def: 'ربط حكم بحكم آخر', programming: 'CONDITIONAL | IF-THEN | CALLBACK' },
    ],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅱ: الصرف — Morphology ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * قواعد الصرف العربي — Arabic Morphology Rules
 * المرجع: شذا العرف في فن الصرف، الوافي في علم الصرف
 * ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا﴾ — إبراهيم: ٢٤
 */
const SARF = Object.freeze({

  /** أوزان الأفعال الثلاثية */
  VERB_PATTERNS: {
    nameAr: 'أوزان الأفعال الثلاثية',
    quranRef: '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
    patterns: [
      { wazn: 'فَعَلَ',  example: 'كَتَبَ',  meaning: 'حدث عادي',       mudhari: 'يَفْعُلُ', masdar_main: 'فَعْل'   },
      { wazn: 'فَعِلَ',  example: 'عَلِمَ',  meaning: 'صفة لازمة',      mudhari: 'يَفْعَلُ', masdar_main: 'فَعَل'   },
      { wazn: 'فَعُلَ',  example: 'كَرُمَ',  meaning: 'سجية وطبيعة',    mudhari: 'يَفْعُلُ', masdar_main: 'فُعُولَة' },
      { wazn: 'فَعَّلَ', example: 'كَسَّرَ', meaning: 'تكثير وتضعيف',   mudhari: 'يُفَعِّلُ', masdar_main: 'تَفْعِيل', note: 'الباب الثاني' },
      { wazn: 'فَاعَلَ', example: 'قَاتَلَ', meaning: 'مشاركة بين اثنين', mudhari: 'يُفَاعِلُ', masdar_main: 'مُفَاعَلَة', note: 'الباب الثالث' },
      { wazn: 'أَفْعَلَ', example: 'أَكْرَمَ', meaning: 'تعدية ودخول',   mudhari: 'يُفْعِلُ', masdar_main: 'إِفْعَال', note: 'الباب الرابع' },
      { wazn: 'تَفَعَّلَ', example: 'تَكَسَّرَ', meaning: 'تكلف وتطاوع', mudhari: 'يَتَفَعَّلُ', masdar_main: 'تَفَعُّل', note: 'الباب الخامس' },
      { wazn: 'تَفَاعَلَ', example: 'تَقَاتَلَ', meaning: 'مشاركة متبادلة', mudhari: 'يَتَفَاعَلُ', masdar_main: 'تَفَاعُل', note: 'الباب السادس' },
      { wazn: 'اِنْفَعَلَ', example: 'اِنْكَسَرَ', meaning: 'مطاوعة الثلاثي', mudhari: 'يَنْفَعِلُ', masdar_main: 'اِنْفِعَال', note: 'الباب السابع' },
      { wazn: 'اِفْتَعَلَ', example: 'اِجْتَمَعَ', meaning: 'مطاوعة أو اتخاذ', mudhari: 'يَفْتَعِلُ', masdar_main: 'اِفْتِعَال', note: 'الباب الثامن' },
      { wazn: 'اِفْعَلَّ',  example: 'اِحْمَرَّ',  meaning: 'دخول في صفة مكثفة', mudhari: 'يَفْعَلُّ', masdar_main: 'اِفْعِلَال', note: 'الباب التاسع' },
      { wazn: 'اِسْتَفْعَلَ', example: 'اِسْتَغْفَرَ', meaning: 'طلب الشيء', mudhari: 'يَسْتَفْعِلُ', masdar_main: 'اِسْتِفْعَال', note: 'الباب العاشر' },
    ],
  },

  /** أوزان الأسماء المشتقة */
  DERIVED_NOUNS: {
    nameAr: 'الأسماء المشتقة',
    hadithRef: '«إن الله عز وجل يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي',
    patterns: [
      { nameAr: 'اسم الفاعل',   wazn: 'فَاعِل',  example: 'كَاتِب',  def: 'من قام بالفعل',       programming: 'ACTOR | AGENT | WORKER_CLASS' },
      { nameAr: 'اسم المفعول',  wazn: 'مَفْعُول', example: 'مَكْتُوب', def: 'من وقع عليه الفعل',  programming: 'RESULT | OUTPUT | RETURN_VALUE' },
      { nameAr: 'المصدر',       wazn: 'فَعْل/فِعَالَة', example: 'كِتَابَة', def: 'أصل الأفعال المشتقة', programming: 'ROOT_CLASS | BASE_TYPE | INTERFACE' },
      { nameAr: 'اسم الزمان',   wazn: 'مَفْعَل',  example: 'مَكْتَب',  def: 'زمان وقوع الفعل',    programming: 'TIMESTAMP | DATETIME | SCHEDULED_AT' },
      { nameAr: 'اسم المكان',   wazn: 'مَفْعَل',  example: 'مَدْرَسَة', def: 'مكان وقوع الفعل',   programming: 'LOCATION | DIRECTORY | NAMESPACE' },
      { nameAr: 'اسم الآلة',    wazn: 'مِفْعَال', example: 'مِفْتَاح',  def: 'أداة الفعل',         programming: 'TOOL | DRIVER | UTILITY_CLASS' },
      { nameAr: 'الصفة المشبهة', wazn: 'فَعِيل',  example: 'كَرِيم',   def: 'صفة ثابتة',          programming: 'CONSTANT | IMMUTABLE_PROPERTY' },
      { nameAr: 'صيغة المبالغة', wazn: 'فَعَّال', example: 'عَلَّام',  def: 'مبالغة اسم الفاعل',  programming: 'ENHANCED | SUPER | HIGH_PERFORMANCE' },
      { nameAr: 'اسم التفضيل',  wazn: 'أَفْعَل',  example: 'أَكْبَر',  def: 'المفاضلة بين شيئين', programming: 'COMPARATOR | SORT_KEY | RANK' },
    ],
  },

  /** أنواع الجذور */
  ROOT_TYPES: {
    nameAr: 'أنواع الجذور',
    quranRef: '﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ﴾ — إبراهيم: ٢٤',
    types: [
      { nameAr: 'ثلاثي مجرد',   letters: 3, example: 'كَتَبَ  (ك-ت-ب)',    note: 'الأصل في الأفعال' },
      { nameAr: 'رباعي مجرد',   letters: 4, example: 'دَحْرَجَ (د-ح-ر-ج)',  note: 'أربعة أصول' },
      { nameAr: 'ثلاثي مزيد',   letters: '4-6', example: 'اِسْتَغْفَرَ', note: 'ثلاثي + زوائد' },
      { nameAr: 'رباعي مزيد',   letters: '5-6', example: 'تَدَحْرَجَ',    note: 'رباعي + زوائد' },
      { nameAr: 'معتل بالواو',  example: 'وَعَدَ', type: 'مثال واوي' },
      { nameAr: 'معتل بالياء',  example: 'يَسَرَ', type: 'مثال يائي' },
      { nameAr: 'أجوف',         example: 'قَالَ/بَاعَ', type: 'عين الفعل واو أو ياء' },
      { nameAr: 'ناقص',         example: 'رَمَى/دَعَا', type: 'لام الفعل واو أو ياء' },
      { nameAr: 'لفيف مقرون',   example: 'وَوَى',   type: 'اجتماع علتين' },
      { nameAr: 'لفيف مفروق',   example: 'وَفَى',   type: 'فاء ولام معتلان' },
    ],
  },

  /** التصريف الكامل للفعل الثلاثي */
  CONJUGATION: {
    nameAr: 'التصريف',
    def_lughawi:  'تحويل الفعل من صيغة إلى أخرى للدلالة على معان مختلفة',
    def_istilahi: 'علم بأصول يُعرف بها أحوال أبنية الكلم التي ليست بإعراب',
    programming:  'TYPE_SYSTEM | GENERIC<T> | FUNCTION_OVERLOADING',
    pronouns: [
      { pronoun: 'هو',   madhi: 'فَعَلَ',   mudhari: 'يَفْعُلُ',  amr: 'ليفعلْ',  note: 'المفرد المذكر الغائب' },
      { pronoun: 'هي',   madhi: 'فَعَلَتْ', mudhari: 'تَفْعُلُ',  amr: 'لتفعلْ',  note: 'المفردة المؤنثة الغائبة' },
      { pronoun: 'هما',  madhi: 'فَعَلَا',  mudhari: 'يَفْعُلَانِ', amr: 'ليفعلا', note: 'المثنى الغائب' },
      { pronoun: 'هم',   madhi: 'فَعَلُوا', mudhari: 'يَفْعُلُونَ', amr: 'ليفعلوا', note: 'جمع المذكر الغائب' },
      { pronoun: 'أنت',  madhi: 'فَعَلْتَ', mudhari: 'تَفْعُلُ',  amr: 'افعلْ',   note: 'المفرد المذكر المخاطب' },
      { pronoun: 'أنتِ', madhi: 'فَعَلْتِ', mudhari: 'تَفْعُلِينَ', amr: 'افعلي',  note: 'المفردة المؤنثة المخاطبة' },
      { pronoun: 'أنا',  madhi: 'فَعَلْتُ', mudhari: 'أَفْعُلُ',  amr: '—',        note: 'المفرد المتكلم' },
      { pronoun: 'نحن',  madhi: 'فَعَلْنَا', mudhari: 'نَفْعُلُ', amr: '—',         note: 'جمع المتكلم' },
    ],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅲ: البلاغة — Rhetoric ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * قواعد البلاغة العربية — Arabic Rhetoric Rules
 * المرجع: البلاغة الواضحة، دلائل الإعجاز، أسرار البلاغة
 * ﴿إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ﴾ — يوسف: ٢
 */
const BALAGHA = Object.freeze({

  /** علم البيان */
  ILM_AL_BAYAN: {
    nameAr: 'علم البيان',
    def:    'العلم الذي يُعرف به إيراد المعنى الواحد بطرق مختلفة في وضوح الدلالة',
    quranRef: '﴿وَمَا عَلَّمْنَاهُ الشِّعْرَ وَمَا يَنبَغِي لَهُ﴾ — يس: ٦٩',
    topics: [
      {
        id:      'tashbih',
        nameAr:  'التشبيه',
        nameEn:  'Simile',
        def_lughawi:  'التمثيل والتشابه',
        def_istilahi: 'إلحاق أمر بآخر في صفة أو أكثر بأداة لغرض بلاغي',
        parts:   ['المشبَّه (الموضوع)', 'المشبَّه به (المرجع)', 'أداة التشبيه (كـ، مثل، كأن)', 'وجه الشبه (الصفة المشتركة)'],
        types:   [
          { nameAr: 'تشبيه تام',     def: 'ذُكرت أركانه الأربعة',        programming: 'EXPLICIT_TYPE_DECLARATION' },
          { nameAr: 'تشبيه مجمل',    def: 'حُذف وجه الشبه',              programming: 'INFERRED_TYPE' },
          { nameAr: 'تشبيه مرسل',    def: 'حُذفت الأداة',                programming: 'IMPLICIT_COMPARISON' },
          { nameAr: 'تشبيه بليغ',    def: 'حُذفت الأداة ووجه الشبه',     programming: 'DUCK_TYPING | STRUCTURAL_TYPING' },
          { nameAr: 'تشبيه ضمني',    def: 'لا يُصرَّح به بل يُلمَح',    programming: 'INTERFACE | PROTOCOL' },
        ],
        examples: [
          { text: 'العلمُ كالنور يُضيء الطريق', type: 'تام', note: 'العلم=مشبه، النور=مشبه به، ك=أداة، الإضاءة=وجه الشبه' },
          { text: 'كأنَّ وجهه البدر', type: 'مؤكد بكأن', note: 'كأن تفيد التشبيه والتأكيد' },
        ],
        quranEx: { text: 'مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا', ref: 'البقرة:١٧', note: 'تشبيه تمثيلي' },
        programming: 'ANALOGICAL_REASONING | PATTERN_MATCHING | POLYMORPHISM',
      },
      {
        id:      'istiara',
        nameAr:  'الاستعارة',
        nameEn:  'Metaphor',
        def_lughawi:  'طلب إعارة الشيء',
        def_istilahi: 'تشبيه حُذف أحد طرفيه مع وجود قرينة مانعة من إرادة المعنى الحقيقي',
        types:   [
          { nameAr: 'استعارة تصريحية', def: 'صُرِّح بالمشبه به وحُذف المشبه',  programming: 'CONCRETE_ABSTRACTION' },
          { nameAr: 'استعارة مكنية',   def: 'ذُكر المشبه وأُضيفت إليه صفة المشبه به', programming: 'ENCAPSULATION' },
          { nameAr: 'استعارة تبعية',   def: 'في الفعل أو الحرف',              programming: 'OPERATOR_OVERLOADING' },
        ],
        examples: [
          { text: 'رأيتُ أسداً يُحاضِر', type: 'تصريحية', note: 'أسد=المشبه به (الرجل الشجاع=محذوف)' },
          { text: 'نطقَ الجدارُ بالحقيقة', type: 'مكنية', note: 'نسبة النطق للجدار' },
        ],
        quranEx: { text: 'وَاشْتَعَلَ الرَّأْسُ شَيْبًا', ref: 'مريم:٤', note: 'استعارة مكنية للشيب كالنار' },
        programming: 'ABSTRACT_CLASS | INTERFACE | GENERICS | POLYMORPHISM',
      },
      {
        id:      'kinaya',
        nameAr:  'الكناية',
        nameEn:  'Metonymy',
        def_lughawi:  'الستر والإخفاء',
        def_istilahi: 'لفظ أُريد به لازم معناه مع جواز إرادة المعنى الحقيقي',
        types:   [
          { nameAr: 'كناية عن صفة',   example: 'طويل النجاد (أي طويل القامة)',  programming: 'LAZY_EVALUATION | GETTER' },
          { nameAr: 'كناية عن موصوف', example: 'القلم الذهبي (أي الكاتب الماهر)', programming: 'ALIAS | TYPEDEF' },
          { nameAr: 'كناية عن نسبة',  example: 'الشجاعة في ربوعه',              programming: 'COMPOSITION | HAS-A' },
        ],
        quranEx: { text: 'أَوْ لَامَسْتُمُ النِّسَاءَ', ref: 'النساء:٤٣', note: 'كناية عن الجماع' },
        programming: 'INDIRECTION | ABSTRACTION | INFORMATION_HIDING',
      },
      {
        id:      'majaz',
        nameAr:  'المجاز',
        nameEn:  'Figurative Language',
        def:     'اللفظ المستعمَل في غير ما وضع له بعلاقة مع قرينة مانعة',
        types:   [
          { nameAr: 'مجاز مرسل',     relations: ['الجزئية', 'الكلية', 'المحلية', 'السببية', 'المسببية'], programming: 'ALIAS | DELEGATE' },
          { nameAr: 'مجاز عقلي',     def: 'إسناد الفعل لغير فاعله الحقيقي', programming: 'PROXY | DECORATOR' },
        ],
        quranEx: { text: 'وَاسْأَلِ الْقَرْيَةَ', ref: 'يوسف:٨٢', note: 'مجاز مرسل — القرية بمعنى أهلها' },
      },
    ],
  },

  /** علم البديع */
  ILM_AL_BADI: {
    nameAr: 'علم البديع',
    def:    'العلم الذي يُعرَف به وجوه تحسين الكلام بعد مطابقته للمقتضى ووضوح دلالته',
    quranRef: '﴿فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ﴾ — الزلزلة: ٧',
    muhassanat_lafziyya: [
      { nameAr: 'الجناس',   def: 'تشابه اللفظين في النطق مع اختلاف المعنى', programming: 'OVERLOADING | HOMONYM', quranEx: { text: 'وَيَوْمَ تَقُومُ السَّاعَةُ يُقْسِمُ الْمُجْرِمُونَ مَا لَبِثُوا غَيْرَ سَاعَةٍ', ref: 'الروم:٥٥', note: 'جناس — الساعة القيامة / الساعة الزمنية' } },
      { nameAr: 'السجع',    def: 'توافق الفاصلتين في الحرف الأخير',         programming: 'CONSISTENT_RETURN_TYPE | PATTERN', quranEx: { text: 'طَه * مَا أَنزَلْنَا عَلَيْكَ الْقُرْآنَ لِتَشْقَىٰ', ref: 'طه:١-٢' } },
      { nameAr: 'الترصيع',  def: 'تقابل ألفاظ الجملتين في الوزن والقافية',  programming: 'PARALLEL_STRUCTURE | SYMMETRIC' },
    ],
    muhassanat_maanawiyya: [
      { nameAr: 'الطباق',    def: 'الجمع بين متضادين في الكلام', programming: 'BOOLEAN | BINARY | XOR', quranEx: { text: 'قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَن تَشَاءُ وَتَنزِعُ الْمُلْكَ', ref: 'آل عمران:٢٦' } },
      { nameAr: 'المقابلة',  def: 'جمع متضادين أو أكثر',         programming: 'SWITCH_CASE | ENUM' },
      { nameAr: 'التورية',   def: 'ذكر لفظ له معنيان قريب وبعيد', programming: 'OVERLOADED_FUNCTION | CONTEXT_DEPENDENT' },
      { nameAr: 'المبالغة',  def: 'الادعاء بمجاوزة الوصف حده',   programming: 'MAX_VALUE | SATURATION | OVERFLOW_HANDLING' },
      { nameAr: 'حسن التعليل', def: 'ذكر علة طريفة للحكم',        programming: 'DOCUMENTATION | COMMENT | REASON' },
      { nameAr: 'التضمين',   def: 'إدراج شعر في نثر أو العكس',   programming: 'EMBEDDING | IMPORT | INCLUDE' },
    ],
  },

  /** علم المعاني */
  ILM_AL_MAANI: {
    nameAr: 'علم المعاني',
    def:    'الأحوال التي يكون عليها اللفظ العربي ليُطابق مقتضى الحال',
    quranRef: '﴿وَقُولُوا لِلنَّاسِ حُسْنًا﴾ — البقرة: ٨٣',
    principles: [
      { nameAr: 'مطابقة الكلام لمقتضى الحال', def: 'الكلام الفصيح يختلف تبعاً للمقام', programming: 'CONTEXT_AWARE_FUNCTION | POLYMORPHISM' },
      { nameAr: 'الإيجاز والإطناب',          def: 'الإيجاز: قِلَّة الألفاظ مع تمام المعنى. الإطناب: زيادة المعنى', programming: 'CODE_COMPRESSION vs VERBOSE_MODE' },
      { nameAr: 'الخبر والإنشاء',             def: 'الخبر: يحتمل الصدق والكذب. الإنشاء: لا يحتمل', programming: 'DECLARATION vs STATEMENT | IMPERATIVE vs DECLARATIVE' },
      { nameAr: 'الذكر والحذف',               def: 'ذكر ما يُستغنى عنه للتأكيد، وحذف ما يُفهم للإيجاز', programming: 'EXPLICIT vs IMPLICIT | INFERRED_ARGS' },
      { nameAr: 'التقديم والتأخير',            def: 'تقديم ما حقه التأخير لغرض بلاغي',  programming: 'PRIORITY | SORTING | OPERATOR_PRECEDENCE' },
      { nameAr: 'القصر والإطلاق',              def: 'القصر: تخصيص أمر بآخر',             programming: 'FILTER | CONSTRAINT | WHERE_CLAUSE' },
    ],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅳ: دوال الإعراب — I'rab Functions ───────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * دوال الإعراب البرمجية
 * ﴿وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا﴾ — البقرة: ٢٦٩
 */
class SheikhaIraabEngine {

  /**
   * إعراب كلمة واحدة
   * @param {string} word - الكلمة
   * @param {string} position - الموقع (subject|object|genitive|jussive)
   * @param {string} context  - السياق النحوي
   */
  static iraabWord(word, position = 'subject', context = '') {
    const posMap = {
      subject:   { nameAr: 'مرفوع', sign: 'الضمة', case: 'raf',  function: 'SUBJECT'   },
      object:    { nameAr: 'منصوب', sign: 'الفتحة', case: 'nasb', function: 'OBJECT'    },
      genitive:  { nameAr: 'مجرور', sign: 'الكسرة', case: 'jarr', function: 'GENITIVE'  },
      jussive:   { nameAr: 'مجزوم', sign: 'السكون', case: 'jazm', function: 'JUSSIVE'   },
      predicative: { nameAr: 'خبر', sign: 'الضمة',  case: 'raf',  function: 'PREDICATE' },
    };
    const pos = posMap[position] || posMap.subject;
    return {
      word,
      iraab:    pos.nameAr,
      sign:     pos.sign,
      case:     pos.case,
      function: pos.function,
      context,
      quranRef: 'البقرة:٢٦٩ — ﴿وَمَن يُؤْتَ الْحِكْمَةَ﴾',
    };
  }

  /**
   * إعراب جملة كاملة
   * @param {string} sentence - الجملة
   */
  static iraabSentence(sentence) {
    if (typeof sentence !== 'string' || !sentence.trim()) {
      return { error: 'الجملة مطلوبة' };
    }
    const words = sentence.trim().split(/\s+/).filter(Boolean);

    // الكلمات الدالة على الإعراب
    const PREPOSITIONS = new Set(['من', 'إلى', 'عن', 'على', 'في', 'ب', 'ل', 'ك', 'حتى', 'منذ', 'خلا', 'عدا', 'حاشا']);
    const NASB_PARTICLES = new Set(['إن', 'أن', 'كأن', 'لكن', 'ليت', 'لعل']);
    const JAZM_PARTICLES = new Set(['لم', 'لما', 'لا', 'لام']);
    const DEFINITE_ARTICLE = 'ال';
    const KANA_SISTERS = new Set(['كان', 'أصبح', 'أمسى', 'أضحى', 'ظل', 'بات', 'صار', 'ليس', 'مازال', 'لازال']);
    const INNA_SISTERS = new Set(['إن', 'أن', 'كأن', 'لكن', 'ليت', 'لعل']);

    const parsed = [];
    let prevCaseRequest = null; // حالة مطلوبة للكلمة التالية

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const isDefinite = w.startsWith(DEFINITE_ARTICLE);
      const bareWord   = isDefinite ? w.slice(2) : w;

      let wordType   = 'ism';       // افتراضي: اسم
      let iraaCase   = 'raf';       // افتراضي: مرفوع
      let function_  = 'UNKNOWN';
      let note       = '';

      // — تحديد الفعل
      if (/^[يتنأ]/.test(w) && w.length >= 3) { wordType = 'fiil_mudhari'; iraaCase = 'raf'; function_ = 'VERB_PRESENT'; note = 'مضارع مرفوع'; }
      else if (KANA_SISTERS.has(w)) { wordType = 'fiil_madhi'; iraaCase = 'mabni'; function_ = 'KANA_SISTER'; note = 'كان وأخواتها — تنصب الخبر'; prevCaseRequest = 'nasb'; }
      else if (INNA_SISTERS.has(w)) { wordType = 'harf_nasb'; iraaCase = 'mabni'; function_ = 'INNA_SISTER'; note = 'إن وأخواتها — تنصب الاسم'; prevCaseRequest = 'nasb'; }
      else if (PREPOSITIONS.has(w)) { wordType = 'harf_jarr'; iraaCase = 'mabni'; function_ = 'PREPOSITION'; note = 'حرف جر — ما بعده مجرور'; prevCaseRequest = 'jarr'; }
      else if (JAZM_PARTICLES.has(w)) { wordType = 'harf_jazm'; iraaCase = 'mabni'; function_ = 'JAZM_PARTICLE'; note = 'حرف جزم — الفعل بعده مجزوم'; prevCaseRequest = 'jazm'; }
      else if (NASB_PARTICLES.has(w) && !INNA_SISTERS.has(w)) { wordType = 'harf_nasb'; iraaCase = 'mabni'; function_ = 'NASB_PARTICLE'; prevCaseRequest = 'nasb'; }
      else {
        // اسم: تطبيق الحالة المطلوبة
        if (prevCaseRequest === 'jarr')  { iraaCase = 'jarr'; function_ = 'GENITIVE';  note = 'مجرور'; prevCaseRequest = null; }
        else if (prevCaseRequest === 'nasb') { iraaCase = 'nasb'; function_ = 'OBJECT';   note = 'منصوب'; prevCaseRequest = null; }
        else if (prevCaseRequest === 'jazm') { iraaCase = 'jazm'; function_ = 'JUSSIVE';  note = 'مجزوم'; prevCaseRequest = null; }
        else if (i === 0) { iraaCase = 'raf'; function_ = 'SUBJECT|MUBTADA'; note = i === 0 ? 'مبتدأ أو فاعل' : ''; }
        else { iraaCase = 'raf'; function_ = 'PREDICATE|KHABAR'; note = 'خبر أو فاعل'; }
      }

      parsed.push({
        position: i + 1,
        word:     w,
        isDefinite,
        bareWord,
        wordType,
        iraaCase,
        iraaSign: { raf: 'الضمة (ُ)', nasb: 'الفتحة (َ)', jarr: 'الكسرة (ِ)', jazm: 'السكون (ْ)', mabni: 'مبني — لا محل له' }[iraaCase] || '—',
        function: function_,
        note,
      });
    }

    const hasVerb = parsed.some(p => p.wordType.startsWith('fiil'));
    return {
      sentence,
      wordCount:     words.length,
      sentenceType:  hasVerb ? 'جملة فعلية' : 'جملة اسمية',
      parsed,
      tawheed:       TAWHEED,
      quranRef:      { ref: 'الرحمن:٤', text: '﴿عَلَّمَهُ الْبَيَانَ﴾' },
    };
  }

  /**
   * تحليل المصدر والاشتقاق
   * @param {string} word - الكلمة
   */
  static analyzeDerivation(word) {
    if (typeof word !== 'string') return { error: 'كلمة غير صالحة' };

    // بادئات اسم الفاعل
    const patterns = [
      { regex: /^مُ.*ِل$|^مُ.*ِن$|^مُ.*ِم$/, nameAr: 'اسم فاعل رباعي',  wazn: 'مُفَعِّل', programming: 'AGENT_CLASS'  },
      { regex: /^مَ.*ُول$|^مَ.*ُوب$/,         nameAr: 'اسم مفعول',        wazn: 'مَفْعُول', programming: 'RESULT_TYPE'  },
      { regex: /^اِسْتَ/,                       nameAr: 'فعل استفعل',       wazn: 'اِسْتِفْعَال', programming: 'REQUEST_METHOD' },
      { regex: /^تَ/,                            nameAr: 'مصدر تفعّل',       wazn: 'تَفَعُّل', programming: 'RECURSIVE_TYPE' },
      { regex: /^إِ.*ال$|^اِ.*ال$/,             nameAr: 'مصدر إفعال',       wazn: 'إِفْعَال', programming: 'ENABLER_CLASS' },
    ];

    let matchedPattern = null;
    for (const p of patterns) {
      if (p.regex.test(word)) { matchedPattern = p; break; }
    }

    return {
      word,
      pattern:         matchedPattern || { nameAr: 'ثلاثي مجرد أو غير محدد', wazn: 'فَعَلَ', programming: 'BASE_VERB' },
      derivedForms: {
        ismFail:   'فَاعِل  ← من قام بالفعل',
        ismMafuul: 'مَفْعُول ← من وقع عليه الفعل',
        masdar:    'المصدر  ← أصل الاشتقاق',
        zamMak:    'مَفْعَل  ← الزمان والمكان',
        ala:       'مِفْعَال ← الآلة',
      },
      quranRef: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
    };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅴ: خصائص النصوص وأنواعها ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * خصائص كل نوع من أنواع النصوص في منظومة شيخة
 * ﴿وَقُولُوا لِلنَّاسِ حُسْنًا﴾ — البقرة: ٨٣
 */
const TEXT_TYPES = Object.freeze({

  /** نصوص برمجية */
  PROGRAMMING_SCRIPTS: {
    nameAr: 'النصوص البرمجية',
    nameEn: 'Programming Scripts',
    quranRef: '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
    hadithRef: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي',
    properties: {
      nahw:     'كل دالة = جملة فعلية (فعل + فاعل + مفعول)',
      sarf:     'الأنواع (Types) = الأوزان الصرفية / الكلاسات = الأسماء المشتقة',
      balagha:  'التوثيق = حسن البيان / التسمية = الإيجاز والوضوح',
      iraab:    'الـ Scope = الإضافة / الـ Return = الخبر / الـ Parameter = المفعول به',
      laws: [
        'كل دالة لها اسم يدل على معناها (اسم الفاعل أو المصدر)',
        'كل متغير اسم يدل على محتواه',
        'الكلاس = جملة اسمية (مبتدأ ثابت)',
        'الفانكشن = جملة فعلية (حدث متجدد)',
        'الـ API = أسلوب النداء (استفهام وجواب)',
        'الـ Exception = أسلوب الشرط والجواب',
        'التعليقات = حال أو تمييز أو توكيد',
      ],
    },
    levels: [
      { level: 'صوت', examples: ['character', 'bit', 'byte'],         nahwEquiv: 'حرف مفرد'  },
      { level: 'كلمة', examples: ['variable', 'constant', 'keyword'], nahwEquiv: 'كلمة واحدة' },
      { level: 'جملة', examples: ['expression', 'statement'],         nahwEquiv: 'جملة مفيدة' },
      { level: 'فقرة', examples: ['function', 'method'],              nahwEquiv: 'فقرة'       },
      { level: 'نص',   examples: ['class', 'module', 'file'],         nahwEquiv: 'نص كامل'    },
      { level: 'خطاب', examples: ['application', 'system'],          nahwEquiv: 'خطاب متكامل' },
    ],
  },

  /** الخطابات والكتابات */
  SPEECHES_WRITINGS: {
    nameAr: 'الخطابات والكتابات النصية',
    nameEn: 'Speeches & Textual Writings',
    quranRef: '﴿وَقُل لِّعِبَادِي يَقُولُوا الَّتِي هِيَ أَحْسَنُ﴾ — الإسراء: ٥٣',
    hadithRef: '«إن من البيان لسحراً» — البخاري:٥١٤٦',
    properties: {
      muqaddimah:  { nameAr: 'المقدمة',  def: 'فاتحة الكلام — تشابه باسم الفاعل الذي يُعرِّف',    programming: 'CONSTRUCTOR | INIT' },
      ard:         { nameAr: 'العرض',    def: 'صلب الموضوع — جملة فعلية تتكرر وتتجدد',              programming: 'MAIN_BODY | LOOP' },
      khatimah:    { nameAr: 'الخاتمة', def: 'إجمال الكلام ودعوة للعمل — أسلوب إنشائي',            programming: 'RETURN | RESOLVE | CLOSE' },
      usloob:      { nameAr: 'الأسلوب', def: 'علمي / أدبي / خطابي / قصصي',                         programming: 'DESIGN_PATTERN | STYLE_GUIDE' },
      maqam:       { nameAr: 'المقام',  def: 'السياق والحال الذي يُقال فيه الكلام',                 programming: 'CONTEXT | ENVIRONMENT | SCOPE' },
    },
    types: [
      { id: 'adabi',    nameAr: 'أدبي',   signs: ['استعارة', 'تشبيه', 'موسيقى'], programming: 'ARTISTIC_RENDERING' },
      { id: 'ilmi',     nameAr: 'علمي',   signs: ['دقة', 'موضوعية', 'إيجاز'],   programming: 'TECHNICAL_DOCUMENTATION' },
      { id: 'khitabi',  nameAr: 'خطابي',  signs: ['عاطفة', 'حجة', 'مقابلة'],   programming: 'PERSUASIVE_ALGORITHM' },
      { id: 'qasasi',   nameAr: 'قصصي',  signs: ['تسلسل', 'شخصيات', 'حبكة'],  programming: 'STATE_MACHINE | STORY' },
      { id: 'taqriri',  nameAr: 'تقريري', signs: ['حياد', 'وقائع', 'تفصيل'],   programming: 'REPORT | ANALYTICS | LOG' },
    ],
  },

  /** الرسائل والوثائق */
  DOCUMENTS: {
    nameAr: 'الرسائل والوثائق الرسمية',
    nameEn: 'Official Documents & Letters',
    quranRef: '﴿إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾ — النمل: ٣٠',
    hadithRef: '«من كتب إليه فليبدأ باسم الله» — حديث شريف',
    structure: {
      opening:  { nameAr: 'الفاتحة',  content: 'بسم الله + تحية + تقديم صاحب الرسالة', grammar: 'جملة اسمية — ثبوت وتوقير' },
      purpose:  { nameAr: 'الغرض',    content: 'الهدف من الرسالة بوضوح', grammar: 'جملة فعلية — حدث واضح' },
      body:     { nameAr: 'الجسم',    content: 'التفاصيل والمعلومات',     grammar: 'جمل متوازنة — إيجاز وإيضاح' },
      closing:  { nameAr: 'الخاتمة',  content: 'الطلب أو الدعاء أو التوقيع', grammar: 'إنشاء — أمر أو دعاء' },
    },
    properties: ['الوضوح', 'الاختصار مع الوفاء', 'حسن الأدب', 'مطابقة الأسلوب للمقام'],
  },

  /** الأنمة (Animations) */
  ANIMATIONS: {
    nameAr: 'الأنمة (Animations)',
    nameEn: 'Animations',
    quranRef: '﴿وَمِنْ آيَاتِهِ أَن تَقُومَ السَّمَاءُ وَالْأَرْضُ بِأَمْرِهِ﴾ — الروم: ٢٥',
    properties: {
      nahw:    'الإطار = المبتدأ / الحركة = الخبر الفعلي المتجدد',
      sarf:    'كل حركة = فعل مضارع مستمر (يَتَحَرَّكُ، يَتَغَيَّرُ)',
      balagha: 'التأثير الجمالي = الاستعارة الحركية',
      laws: [
        'كل إطار (frame) = لحظة حاضرة (الفعل المضارع)',
        'التحريك (animation) = التجدد والاستمرار',
        'التوقف (pause) = الجزم والثبات',
        'التحول (transition) = المطاوعة (تَفَاعَلَ)',
        'التكرار (loop) = التكثير (فَعَّلَ)',
      ],
    },
    states: [
      { state: 'idle',       nahwEquiv: 'مبتدأ بلا خبر = حال الثبات',        sarf: 'الاسم الجامد' },
      { state: 'playing',    nahwEquiv: 'جملة فعلية مستمرة',                  sarf: 'المضارع المستمر' },
      { state: 'paused',     nahwEquiv: 'فعل مجزوم بلم يُكمَل',              sarf: 'الوقف' },
      { state: 'completed',  nahwEquiv: 'فعل ماضٍ مُتَمَّم',                 sarf: 'الماضي' },
      { state: 'looping',    nahwEquiv: 'فعل مضارع مكرر (التكثير)',           sarf: 'فَعَّلَ' },
      { state: 'reversed',   nahwEquiv: 'انعكاس = المطاوعة (اِنْفَعَلَ)',     sarf: 'باب الانفعال' },
    ],
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅵ: شبكة الخلايا العصبية — 60+ خلية ──────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * خلية عصبية لغوية متطورة
 */
class GrammarNeuralCell {
  constructor({ id, nameAr, layer, weight = 0.5, quranRef = '', hadithRef = '', connections = [], def = '', programming = '' }) {
    this.id          = id;
    this.nameAr      = nameAr;
    this.layer       = layer;        // nahw | sarf | balagha | iraab | text | quran | sunnah
    this.weight      = weight;       // [0 — 1]
    this.quranRef    = quranRef;
    this.hadithRef   = hadithRef;
    this.connections = connections;
    this.def         = def;
    this.programming = programming;
    this.fireCount   = 0;
    this.activation  = 0.0;
  }

  fire(input = '') {
    this.fireCount++;
    const score = typeof input === 'string' ? this._score(input) : 0.5;
    this.activation = Math.min(1.0, (this.activation * 0.6) + (score * this.weight * 0.4));
    return this.activation;
  }

  _score(text) {
    const keywords = {
      nahw:    ['إعراب', 'مرفوع', 'منصوب', 'مجرور', 'مبتدأ', 'خبر', 'فاعل', 'مفعول', 'نحو', 'جملة'],
      sarf:    ['جذر', 'وزن', 'مصدر', 'اشتقاق', 'تصريف', 'صرف', 'فعل', 'اسم فاعل', 'اسم مفعول'],
      balagha: ['استعارة', 'تشبيه', 'كناية', 'مجاز', 'جناس', 'طباق', 'بلاغة', 'بيان', 'بديع'],
      iraab:   ['إعراب', 'محل', 'حركة', 'ضمة', 'فتحة', 'كسرة', 'سكون', 'تنوين'],
      text:    ['نص', 'كتابة', 'خطاب', 'رسالة', 'كود', 'برمجة', 'أنمة', 'animation'],
      quran:   ['الله', 'قرآن', 'آية', 'سورة', 'تلاوة', 'حفظ', 'تجويد'],
      sunnah:  ['حديث', 'نبي', 'رسول', 'سنة', 'صحابة', 'محمد', 'صلى الله'],
    };
    const keys = keywords[this.layer] || [];
    const hits = keys.filter(k => text.includes(k)).length;
    return Math.min(1.0, hits / Math.max(1, keys.length * 0.5));
  }

  toJSON() {
    return {
      id: this.id, nameAr: this.nameAr, layer: this.layer,
      weight: this.weight, activation: Math.round(this.activation * 1000) / 1000,
      fireCount: this.fireCount, quranRef: this.quranRef, programming: this.programming,
    };
  }
}

/**
 * شبكة الخلايا العصبية اللغوية
 */
class GrammarNeuralNetwork extends EventEmitter {
  constructor() {
    super();
    this.nameAr  = 'شبكة الخلايا العصبية اللغوية — شيخة';
    this.tawheed = TAWHEED;
    this.cells   = new Map();
    this._buildNetwork();
  }

  _buildNetwork() {
    const cellDefs = [

      // ════════ طبقة التوحيد (3 خلايا) ════════
      { id: 'tawheed-core',    nameAr: 'نواة التوحيد',               layer: 'quran',  weight: 1.00, quranRef: 'الإخلاص:١', def: 'كل علم يبدأ بلا إله إلا الله', connections: ['quran-bayan', 'sunnah-bayan'] },
      { id: 'bismillah-cell',  nameAr: 'خلية البسملة',               layer: 'quran',  weight: 1.00, quranRef: 'الفاتحة:١', def: 'بداية كل عمل وكل كلام',         connections: ['tawheed-core'] },
      { id: 'baian-cell',      nameAr: 'خلية البيان الإلهي',          layer: 'quran',  weight: 0.99, quranRef: 'الرحمن:٤',  def: 'علَّم الإنسان البيان',           connections: ['tawheed-core', 'balagha-root'] },

      // ════════ طبقة القرآن الكريم (7 خلايا) ════════
      { id: 'quran-bayan',     nameAr: 'القرآن والبيان',              layer: 'quran',  weight: 0.99, quranRef: 'يوسف:٢',    def: 'القرآن عربي مبين',              connections: ['nahw-root', 'sarf-root', 'balagha-root'] },
      { id: 'quran-fasiha',    nameAr: 'فصاحة القرآن',               layer: 'quran',  weight: 0.98, quranRef: 'النحل:١٠٣', def: 'هذا لسان عربي مبين',           connections: ['balagha-root'] },
      { id: 'quran-iraab',     nameAr: 'إعراب القرآن الكريم',        layer: 'quran',  weight: 0.98, quranRef: 'البقرة:٢٥٥', def: 'آية الكرسي — إعراب نموذجي',   connections: ['nahw-iraab'] },
      { id: 'quran-amr',       nameAr: 'أسلوب الأمر في القرآن',       layer: 'quran',  weight: 0.97, quranRef: 'العلق:١',   def: 'اقرأ — أول أمر إلهي',          connections: ['nahw-amr-nahy'] },
      { id: 'quran-shart',     nameAr: 'أسلوب الشرط في القرآن',      layer: 'quran',  weight: 0.97, quranRef: 'آل عمران:٣١', def: 'إن كنتم تحبون الله فاتبعوني', connections: ['nahw-shart'] },
      { id: 'quran-names',     nameAr: 'أسماء القرآن — علم التسمية', layer: 'quran',  weight: 0.97, quranRef: 'البقرة:٣١', def: 'وعلم آدم الأسماء',             connections: ['sarf-root', 'lexicon-root'] },
      { id: 'quran-metaphor',  nameAr: 'الاستعارات القرآنية',         layer: 'quran',  weight: 0.96, quranRef: 'مريم:٤',    def: 'واشتعل الرأس شيباً',           connections: ['balagha-istiara'] },

      // ════════ طبقة السنة النبوية (6 خلايا) ════════
      { id: 'sunnah-bayan',    nameAr: 'بيان النبي ﷺ',              layer: 'sunnah', weight: 0.99, hadithRef: 'البخاري:٥١٤٦', def: 'إن من البيان لسحراً',          connections: ['balagha-root'] },
      { id: 'sunnah-iraab',    nameAr: 'السنة والإعراب',             layer: 'sunnah', weight: 0.98, hadithRef: 'حديث شريف',    def: 'أعربوا القرآن',               connections: ['nahw-iraab'] },
      { id: 'sunnah-jawami',   nameAr: 'جوامع الكلم',               layer: 'sunnah', weight: 0.98, hadithRef: 'البخاري:٢٩٧٧', def: 'أُوتيتُ جوامع الكلم',         connections: ['baalgha-maani'] },
      { id: 'sunnah-niyyah',   nameAr: 'النية في الكلام',            layer: 'sunnah', weight: 0.97, hadithRef: 'البخاري:١',    def: 'إنما الأعمال بالنيات',        connections: ['text-programming'] },
      { id: 'sunnah-sidq',     nameAr: 'صدق الحديث',                layer: 'sunnah', weight: 0.97, hadithRef: 'مسلم:٢٦٠٧',   def: 'عليكم بالصدق',               connections: ['text-speeches'] },
      { id: 'sunnah-itqan',    nameAr: 'إتقان العمل',               layer: 'sunnah', weight: 0.97, hadithRef: 'البيهقي',      def: 'يحب إذا عمل عملاً أن يتقنه', connections: ['text-programming'] },

      // ════════ طبقة النحو (12 خلية) ════════
      { id: 'nahw-root',       nameAr: 'جذر النحو',                  layer: 'nahw',   weight: 0.95, quranRef: 'الرحمن:٤',   def: 'علم النحو — ضبط أواخر الكلم',  programming: 'SYNTAX_PARSER',       connections: ['nahw-ism', 'nahw-fiil', 'nahw-harf'] },
      { id: 'nahw-ism',        nameAr: 'الاسم ووظيفته',              layer: 'nahw',   weight: 0.92, quranRef: 'البقرة:٣١',  def: 'الاسم: مرفوع منصوب مجرور',    programming: 'NOUN_IDENTIFIER',     connections: ['nahw-root'] },
      { id: 'nahw-fiil',       nameAr: 'الفعل ووظيفته',              layer: 'nahw',   weight: 0.92, quranRef: 'العلق:١',    def: 'الفعل: ماض مضارع أمر',         programming: 'FUNCTION_CALL',       connections: ['nahw-root'] },
      { id: 'nahw-harf',       nameAr: 'الحرف ووظيفته',              layer: 'nahw',   weight: 0.90, quranRef: 'الفاتحة:١',  def: 'الحرف: معناه في غيره',         programming: 'OPERATOR_KEYWORD',    connections: ['nahw-root'] },
      { id: 'nahw-iraab',      nameAr: 'الإعراب الكامل',             layer: 'nahw',   weight: 0.93, quranRef: 'الفاتحة:٥',  def: 'رفع نصب جر جزم',              programming: 'TYPE_ANNOTATION',     connections: ['nahw-root', 'nahw-ism'] },
      { id: 'nahw-jumlah',     nameAr: 'الجملة — اسمية وفعلية',      layer: 'nahw',   weight: 0.91, quranRef: 'آل عمران:٣١', def: 'الجملة الاسمية والفعلية',     programming: 'STATEMENT_EXPR',      connections: ['nahw-ism', 'nahw-fiil'] },
      { id: 'nahw-shart',      nameAr: 'أسلوب الشرط',                layer: 'nahw',   weight: 0.89, quranRef: 'آل عمران:٣١', def: 'إن + شرط + جواب',             programming: 'IF_THEN_ELSE',        connections: ['nahw-root'] },
      { id: 'nahw-amr-nahy',   nameAr: 'الأمر والنهي',               layer: 'nahw',   weight: 0.89, quranRef: 'العلق:١',    def: 'اقرأ = أمر. لا تقرأ = نهي',   programming: 'COMMAND_CONSTRAINT',  connections: ['nahw-root'] },
      { id: 'nahw-istifham',   nameAr: 'الاستفهام',                  layer: 'nahw',   weight: 0.87, quranRef: 'يونس:١٠١',  def: 'هل؟ من؟ ماذا؟',               programming: 'QUERY_REQUEST',       connections: ['nahw-root'] },
      { id: 'nahw-nafi',       nameAr: 'النفي',                      layer: 'nahw',   weight: 0.87, quranRef: 'الإخلاص:١',  def: 'لا إله = نفي + إثبات',        programming: 'NEGATION_BOOLEAN',    connections: ['nahw-root'] },
      { id: 'nahw-idafa',      nameAr: 'الإضافة',                    layer: 'nahw',   weight: 0.88, quranRef: 'الفاتحة:١',  def: 'رب العالمين — ملكية وانتساب', programming: 'OBJECT_PROPERTY',     connections: ['nahw-ism'] },
      { id: 'nahw-naat',       nameAr: 'النعت والصفة',               layer: 'nahw',   weight: 0.86, quranRef: 'الفاتحة:٢',  def: 'الرحمن الرحيم — نعت',         programming: 'DECORATOR_ATTRIBUTE', connections: ['nahw-ism'] },

      // ════════ طبقة الصرف (10 خلايا) ════════
      { id: 'sarf-root',       nameAr: 'الجذر الصرفي',               layer: 'sarf',   weight: 0.94, quranRef: 'إبراهيم:٢٤', def: 'أصل الكلمة — الجذر الثلاثي',  programming: 'ROOT_CLASS',          connections: ['sarf-wazn', 'sarf-ishtiqaq'] },
      { id: 'sarf-wazn',       nameAr: 'الوزن الصرفي',               layer: 'sarf',   weight: 0.92, quranRef: 'النمل:٨٨',   def: 'فَعَلَ فَعِلَ فَعُلَ ...',     programming: 'TEMPLATE_PATTERN',    connections: ['sarf-root'] },
      { id: 'sarf-ishtiqaq',   nameAr: 'الاشتقاق',                   layer: 'sarf',   weight: 0.91, quranRef: 'البقرة:٣١',  def: 'استخراج الكلمات من الجذر',    programming: 'TYPE_DERIVATION',     connections: ['sarf-root'] },
      { id: 'sarf-masdar',     nameAr: 'المصدر — أم الأفعال',        layer: 'sarf',   weight: 0.93, quranRef: 'الرحمن:٤',   def: 'المصدر أصل الأفعال المشتقة',  programming: 'ABSTRACT_BASE',       connections: ['sarf-root'] },
      { id: 'sarf-ism-fail',   nameAr: 'اسم الفاعل',                 layer: 'sarf',   weight: 0.90, quranRef: 'البقرة:٢٥٥', def: 'من قام بالفعل — الفاعل',      programming: 'AGENT_WORKER',        connections: ['sarf-masdar'] },
      { id: 'sarf-ism-mafuul', nameAr: 'اسم المفعول',                layer: 'sarf',   weight: 0.90, quranRef: 'الرحمن:٤',   def: 'من وقع عليه الفعل',           programming: 'RESULT_VALUE',        connections: ['sarf-masdar'] },
      { id: 'sarf-tasrif',     nameAr: 'التصريف الكامل',             layer: 'sarf',   weight: 0.89, quranRef: 'الفاتحة:٥',  def: 'تحويل الكلمة عبر الأوزان',    programming: 'GENERICS_OVERLOAD',   connections: ['sarf-wazn'] },
      { id: 'sarf-mujarrad',   nameAr: 'المجرد والمزيد',             layer: 'sarf',   weight: 0.87, quranRef: 'الكهف:١٠٩', def: 'ثلاثي مجرد — أبواب الزيادة',   programming: 'INHERITANCE_LAYERS',  connections: ['sarf-root'] },
      { id: 'sarf-mushtaq',    nameAr: 'المشتقات',                   layer: 'sarf',   weight: 0.88, quranRef: 'البقرة:٣١',  def: 'اسم فاعل مفعول صفة مشبهة...', programming: 'DERIVED_TYPES',       connections: ['sarf-ishtiqaq'] },
      { id: 'sarf-jamid',      nameAr: 'الاسم الجامد',               layer: 'sarf',   weight: 0.85, quranRef: 'الإخلاص:١',  def: 'الله — جامد لا يُشتق منه',    programming: 'PRIMITIVE_TYPE',      connections: ['sarf-root'] },

      // ════════ طبقة البلاغة (10 خلايا) ════════
      { id: 'balagha-root',    nameAr: 'جذر البلاغة',                layer: 'balagha', weight: 0.94, quranRef: 'الرحمن:٤',   def: 'علم البيان والمعاني والبديع', programming: 'DESIGN_PATTERNS',     connections: ['balagha-bayan', 'baalgha-maani', 'balagha-badi'] },
      { id: 'balagha-bayan',   nameAr: 'علم البيان',                 layer: 'balagha', weight: 0.92, quranRef: 'الرحمن:٤',   def: 'تشبيه استعارة كناية مجاز',    programming: 'ABSTRACTION_LAYER',   connections: ['balagha-root', 'balagha-tashbih'] },
      { id: 'balagha-tashbih', nameAr: 'التشبيه',                    layer: 'balagha', weight: 0.91, quranRef: 'البقرة:١٧',  def: 'تشبيه طرفان أداة وجه الشبه',  programming: 'ANALOGY_POLYMORPHISM', connections: ['balagha-bayan'] },
      { id: 'balagha-istiara', nameAr: 'الاستعارة',                  layer: 'balagha', weight: 0.91, quranRef: 'مريم:٤',     def: 'تشبيه حُذف أحد طرفيه',        programming: 'INTERFACE_GENERIC',   connections: ['balagha-bayan'] },
      { id: 'balagha-kinaya',  nameAr: 'الكناية',                    layer: 'balagha', weight: 0.90, quranRef: 'النساء:٤٣',  def: 'لازم المعنى للمعنى الحقيقي',  programming: 'ENCAPSULATION',       connections: ['balagha-bayan'] },
      { id: 'balagha-badi',    nameAr: 'علم البديع',                 layer: 'balagha', weight: 0.89, quranRef: 'الروم:٥٥',   def: 'جناس طباق مقابلة سجع',        programming: 'CODE_AESTHETICS',     connections: ['balagha-root'] },
      { id: 'baalgha-maani',   nameAr: 'علم المعاني',                layer: 'balagha', weight: 0.91, quranRef: 'البقرة:٨٣',  def: 'مطابقة الكلام للمقام',        programming: 'CONTEXT_AWARE',       connections: ['balagha-root'] },
      { id: 'balagha-ijaz',    nameAr: 'الإيجاز والإطناب',           layer: 'balagha', weight: 0.89, quranRef: 'البخاري:٢٩٧٧', def: 'جوامع الكلم — الإيجاز المعجز', programming: 'CODE_OPTIMIZATION',  connections: ['baalgha-maani'] },
      { id: 'balagha-fasaha',  nameAr: 'الفصاحة',                    layer: 'balagha', weight: 0.90, quranRef: 'النحل:١٠٣',  def: 'الخلو من التنافر والغرابة',   programming: 'CLEAN_CODE',          connections: ['balagha-root'] },
      { id: 'balagha-tibaq',   nameAr: 'الطباق والمقابلة',           layer: 'balagha', weight: 0.88, quranRef: 'آل عمران:٢٦', def: 'الجمع بين المتضادين',         programming: 'ENUM_BOOLEAN_TYPE',   connections: ['balagha-badi'] },

      // ════════ طبقة النصوص (8 خلايا) ════════
      { id: 'text-programming', nameAr: 'النص البرمجي',              layer: 'text',   weight: 0.90, quranRef: 'النمل:٨٨',   def: 'الكود = جمل برمجية منظمة',    programming: 'SOURCE_CODE',         connections: ['sarf-masdar', 'nahw-jumlah'] },
      { id: 'text-speeches',    nameAr: 'الخطابات والمحاضرات',       layer: 'text',   weight: 0.88, quranRef: 'الإسراء:٥٣', def: 'الخطاب = بلاغة + منطق + دليل', programming: 'PRESENTATION_LAYER',  connections: ['balagha-root'] },
      { id: 'text-documents',   nameAr: 'الرسائل والوثائق',          layer: 'text',   weight: 0.87, quranRef: 'النمل:٣٠',   def: 'من سليمان وبسم الله',          programming: 'DOCUMENT_SCHEMA',     connections: ['nahw-jumlah'] },
      { id: 'text-animation',   nameAr: 'الأنمة والحركة',            layer: 'text',   weight: 0.86, quranRef: 'الروم:٢٥',   def: 'الحركة = فعل مضارع مستمر',    programming: 'ANIMATION_STATE',     connections: ['nahw-fiil'] },
      { id: 'text-poetry',      nameAr: 'الشعر والإيقاع',            layer: 'text',   weight: 0.85, quranRef: 'الشعراء:٢٢٤', def: 'الشعر = موسيقى + معنى',       programming: 'RHYTHM_PATTERN',      connections: ['balagha-badi'] },
      { id: 'text-narrative',   nameAr: 'القصص والروايات',            layer: 'text',   weight: 0.85, quranRef: 'يوسف:٣',     def: 'نحن نقص عليك أحسن القصص',    programming: 'STATE_MACHINE',       connections: ['nahw-jumlah'] },
      { id: 'text-science',     nameAr: 'الكتابة العلمية',            layer: 'text',   weight: 0.88, quranRef: 'العلق:١',    def: 'العلم: دقة + موضوعية + دليل', programming: 'TECHNICAL_DOC',       connections: ['sunnah-itqan'] },
      { id: 'text-sharia',      nameAr: 'النصوص الشرعية',             layer: 'text',   weight: 0.93, quranRef: 'البقرة:٢',   def: 'القرآن والسنة = أصل كل نص',   programming: 'CONSTITUTION_LAW',    connections: ['quran-bayan', 'sunnah-bayan'] },

      // ════════ طبقة المعجم (4 خلايا) ════════
      { id: 'lexicon-root',     nameAr: 'المعجم والدلالة',            layer: 'sarf',   weight: 0.89, quranRef: 'البقرة:٣١',  def: 'المعنى اللغوي والاصطلاحي',    programming: 'SEMANTIC_LAYER',      connections: ['sarf-root'] },
      { id: 'lexicon-lughawi',  nameAr: 'المعنى اللغوي',              layer: 'sarf',   weight: 0.87, quranRef: 'الرحمن:٤',   def: 'ما وضع اللفظ له في اللغة',    programming: 'LITERAL_VALUE',       connections: ['lexicon-root'] },
      { id: 'lexicon-istilahi', nameAr: 'المعنى الاصطلاحي',           layer: 'sarf',   weight: 0.87, quranRef: 'البقرة:٣١',  def: 'ما اصطُلح عليه أهل الفن',     programming: 'DOMAIN_SPECIFIC',     connections: ['lexicon-root'] },
      { id: 'lexicon-mushtarak', nameAr: 'المشترك اللفظي',            layer: 'sarf',   weight: 0.85, quranRef: 'آل عمران:٧', def: 'لفظ يحتمل معنيين فأكثر',     programming: 'OVERLOADED_SYMBOL',   connections: ['lexicon-root'] },
    ];

    for (const def of cellDefs) {
      this.cells.set(def.id, new GrammarNeuralCell(def));
    }
  }

  /** معالجة نص عبر الشبكة */
  process(text) {
    if (typeof text !== 'string') return { error: 'النص مطلوب' };
    const activations = {};
    let total = 0;

    for (const [id, cell] of this.cells) {
      const act = cell.fire(text);
      activations[id] = act;
      total += act;
    }

    const avgActivation = total / this.cells.size;
    const dominant = this._dominant();
    this.emit('network:processed', { text: text.slice(0, 40), avgActivation });

    return {
      schema:        SCHEMA,
      tawheed:       this.tawheed,
      cells:         Object.fromEntries([...this.cells.entries()].map(([k, v]) => [k, v.toJSON()])),
      avgActivation: Math.round(avgActivation * 1000) / 1000,
      dominant,
      layers: this._layerSummary(),
    };
  }

  _dominant() {
    let max = -1, dom = null;
    for (const [, cell] of this.cells) {
      if (cell.activation > max) { max = cell.activation; dom = cell.nameAr; }
    }
    return dom;
  }

  _layerSummary() {
    const layers = {};
    for (const [, cell] of this.cells) {
      if (!layers[cell.layer]) layers[cell.layer] = { count: 0, totalActivation: 0 };
      layers[cell.layer].count++;
      layers[cell.layer].totalActivation += cell.activation;
    }
    return Object.fromEntries(
      Object.entries(layers).map(([k, v]) => [k, {
        count: v.count,
        avgActivation: Math.round((v.totalActivation / v.count) * 1000) / 1000,
      }])
    );
  }

  getStatus() {
    return {
      nameAr: this.nameAr,
      totalCells: this.cells.size,
      layers: [...new Set([...this.cells.values()].map(c => c.layer))],
      tawheed: this.tawheed,
    };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── المحرك الرئيسي ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

class SheikhArabicGrammarEngine extends EventEmitter {

  constructor() {
    super();
    this.name      = 'Sheikha Arabic Grammar Engine';
    this.nameAr    = 'محرك النحو والصرف والبلاغة — شيخة';
    this.version   = VERSION;
    this.schema    = SCHEMA;
    this.tawheed   = TAWHEED;
    this.bismillah = BISMILLAH;
    this.startedAt = new Date().toISOString();

    // الطبقات
    this.nahw        = NAHW;
    this.sarf        = SARF;
    this.balagha     = BALAGHA;
    this.iraabEngine = SheikhaIraabEngine;  // الفئة الثابتة — لا تُستدعى بـ new
    this.texts       = TEXT_TYPES;

    // الشبكة العصبية
    this.network = new GrammarNeuralNetwork();

    this._printBanner();
  }

  _printBanner() {
    console.log(`\n${this.bismillah}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ محرك النحو والصرف والبلاغة — شيخة               ');
    console.log(`  📖 النحو:    ${this.nahw.CHAPTERS.chapters.length} باباً`);
    console.log(`  🔤 الصرف:    ${this.sarf.VERB_PATTERNS.patterns.length} وزناً فعلياً`);
    console.log(`  🌟 البلاغة:  ${this.balagha.ILM_AL_BAYAN.topics.length + this.balagha.ILM_AL_BADI.muhassanat_lafziyya.length + this.balagha.ILM_AL_BADI.muhassanat_maanawiyya.length} فناً وأسلوباً`);
    console.log(`  🧠 الشبكة:   ${this.network.cells.size} خلية عصبية`);
    console.log('═══════════════════════════════════════════════════════\n');
  }

  /**
   * إعراب جملة كاملة
   * @param {string} sentence
   */
  iraab(sentence) {
    this.emit('request', { type: 'iraab', sentence: sentence.slice(0, 80) });
    const result = SheikhaIraabEngine.iraabSentence(sentence);
    return this._wrap('iraab', result);
  }

  /**
   * تحليل اشتقاقي للكلمة
   * @param {string} word
   */
  derive(word) {
    this.emit('request', { type: 'derive', word });
    const result = SheikhaIraabEngine.analyzeDerivation(word);
    return this._wrap('derive', result);
  }

  /**
   * معالجة نص عبر الشبكة العصبية
   * @param {string} text
   */
  analyzeNeural(text) {
    this.emit('request', { type: 'neural', text: text.slice(0, 80) });
    const result = this.network.process(text);
    return this._wrap('neural', result);
  }

  /**
   * تحليل نوع النص وخصائصه اللغوية
   * @param {string} textType - 'programming' | 'speech' | 'document' | 'animation'
   */
  getTextProperties(textType) {
    const map = {
      programming: this.texts.PROGRAMMING_SCRIPTS,
      speech:      this.texts.SPEECHES_WRITINGS,
      document:    this.texts.DOCUMENTS,
      animation:   this.texts.ANIMATIONS,
    };
    const result = map[textType] || { error: `نوع "${textType}" غير معروف — اختر من: ${Object.keys(map).join(' | ')}` };
    return this._wrap('text_properties', result);
  }

  /**
   * البحث في قواعد النحو
   * @param {string} chapter - اسم الباب
   */
  getNahwRule(chapter) {
    const found = this.nahw.CHAPTERS.chapters.find(c =>
      c.id === chapter || c.nameAr.includes(chapter)
    );
    return this._wrap('nahw_rule', found || {
      error: `الباب "${chapter}" غير موجود`,
      available: this.nahw.CHAPTERS.chapters.map(c => c.nameAr),
    });
  }

  /**
   * البحث في أوزان الصرف
   * @param {string} wazn - الوزن المطلوب
   */
  getSarfPattern(wazn) {
    const found = this.sarf.VERB_PATTERNS.patterns.find(p =>
      p.wazn === wazn || p.example === wazn || p.note?.includes(wazn)
    );
    return this._wrap('sarf_pattern', found || {
      error: `الوزن "${wazn}" غير موجود`,
      available: this.sarf.VERB_PATTERNS.patterns.map(p => `${p.wazn} (${p.example})`),
    });
  }

  /**
   * البحث في أساليب البلاغة
   * @param {string} style - الأسلوب البلاغي
   */
  getBalaghaStyle(style) {
    const allTopics = [
      ...this.balagha.ILM_AL_BAYAN.topics,
      ...this.balagha.ILM_AL_BADI.muhassanat_lafziyya,
      ...this.balagha.ILM_AL_BADI.muhassanat_maanawiyya,
      ...this.balagha.ILM_AL_MAANI.principles,
    ];
    const found = allTopics.find(t =>
      t.id === style || t.nameAr?.includes(style) || t.nameEn?.toLowerCase().includes(style.toLowerCase())
    );
    return this._wrap('balagha_style', found || {
      error: `الأسلوب "${style}" غير موجود`,
      available: allTopics.map(t => t.nameAr).filter(Boolean),
    });
  }

  /** حالة المحرك */
  status() {
    return {
      schema:    this.schema,
      tawheed:   this.tawheed,
      name:      this.nameAr,
      version:   this.version,
      startedAt: this.startedAt,
      layers: {
        nahw:    { chapters: this.nahw.CHAPTERS.chapters.length, states: this.nahw.IRAAB.states.length },
        sarf:    { patterns: this.sarf.VERB_PATTERNS.patterns.length, derived: this.sarf.DERIVED_NOUNS.patterns.length },
        balagha: { bayan: this.balagha.ILM_AL_BAYAN.topics.length, badi: this.balagha.ILM_AL_BADI.muhassanat_lafziyya.length + this.balagha.ILM_AL_BADI.muhassanat_maanawiyya.length },
        texts:   Object.keys(this.texts).length,
      },
      network: this.network.getStatus(),
    };
  }

  _wrap(type, data) {
    return {
      schema:    this.schema,
      tawheed:   this.tawheed,
      bismillah: this.bismillah,
      type,
      data,
      seal:      'والله أعلم وبالله التوفيق',
      timestamp: new Date().toISOString(),
    };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── التصدير ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const engine = new SheikhArabicGrammarEngine();

module.exports = {
  TAWHEED,
  BISMILLAH,
  SCHEMA,
  NAHW,
  SARF,
  BALAGHA,
  TEXT_TYPES,
  GrammarNeuralCell,
  GrammarNeuralNetwork,
  SheikhaIraabEngine,
  SheikhArabicGrammarEngine,
  engine,                           // singleton
  iraab:            (s) => engine.iraab(s),
  derive:           (w) => engine.derive(w),
  analyzeNeural:    (t) => engine.analyzeNeural(t),
  getTextProperties:(t) => engine.getTextProperties(t),
  getNahwRule:      (c) => engine.getNahwRule(c),
  getSarfPattern:   (w) => engine.getSarfPattern(w),
  getBalaghaStyle:  (s) => engine.getBalaghaStyle(s),
  status:           ()  => engine.status(),
};
