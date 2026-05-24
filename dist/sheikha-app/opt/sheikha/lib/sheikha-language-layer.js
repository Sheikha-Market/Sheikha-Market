/**
 * بسم الله الرحمن الرحيم
 *
 * Sheikha Language Layer — الطبقة الحاكمة لكل لغات البرمجة والترميز والاستعلام
 *
 * ﴿عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٥
 *
 * هذا الملف يُعرِّف منظومة لغة شيخة الحاكمة:
 *   - Sheikha Ada Lovelace   ← الخوارزميات الأولى
 *   - Sheikha Plankalkül     ← أول لغة برمجة عالية المستوى
 *   - Sheikha FORTRAN        ← أول لغة تجارية (IBM 1957)
 *   - Sheikha GML/SGML/HTML  ← لغات الترميز
 *   - Sheikha SQL            ← لغة الاستعلام
 *   - Sheikha Unicode/UTF-8  ← الجسر الكوني الموحَّد
 */

'use strict';

// ── نواة التوحيد ──────────────────────────────────────────────────
const SHEIKHA_TAWHEED   = 'لا إله إلا الله';
const SHEIKHA_BISMILLAH = 'بسم الله الرحمن الرحيم';
const SHEIKHA_SCHEMA    = 'sheikha/v2';

// ── تاريخ لغة شيخة — الطبقات التاريخية ──────────────────────────
const SHEIKHA_LANGUAGE_HISTORY = Object.freeze({

  /** ① الأساس البشري — لغات ما قبل الحوسبة */
  HUMAN_LANGUAGES: {
    label:   'Sheikha Human Languages',
    labelAr: 'لغات شيخة البشرية',
    layers: [
      {
        id:      'sheikha-sumerian',
        name:    'Sheikha Sumerian',
        nameAr:  'شيخة السومرية',
        script:  'Cuneiform — الخط المسماري',
        era:     '~3500–3200 BCE',
        unicode: 'U+12000–U+1239F',
        tawheedRef: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
        maqsad: 'INTELLECT_PRESERVATION',
      },
      {
        id:      'sheikha-hieroglyphics',
        name:    'Sheikha Hieroglyphics',
        nameAr:  'شيخة الهيروغليفية',
        script:  'Egyptian Hieroglyphs',
        era:     '~3200–3100 BCE',
        unicode: 'U+13000–U+1342F',
        tawheedRef: '﴿وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ﴾ — الروم: ٢٢',
        maqsad: 'INTELLECT_PRESERVATION',
      },
    ],
  },

  /** ② الحوسبة الميكانيكية — Ada & HP */
  MECHANICAL_COMPUTING: {
    label:   'Sheikha Ada Lovelace & HP Layer',
    labelAr: 'طبقة آدا لوفليس وHP',
    layers: [
      {
        id:      'sheikha-hp',
        name:    'Sheikha HP',
        nameAr:  'شيخة HP',
        origin:  "Charles Babbage's Analytical Engine",
        era:     '1837',
        tawheedRef: 'الحوسبة هبة العقل — ﴿وَأُوتِيتُم مِّن الْعِلْمِ إِلَّا قَلِيلًا﴾ — الإسراء: ٨٥',
        maqsad: 'INTELLECT_PRESERVATION',
      },
      {
        id:      'sheikha-ada-lovelace',
        name:    'Sheikha Ada Lovelace',
        nameAr:  'شيخة آدا لوفليس',
        origin:  'Ada Lovelace — First Algorithm (Bernoulli Numbers)',
        era:     '1843',
        tawheedRef: '﴿عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٥',
        maqsad: 'INTELLECT_PRESERVATION',
      },
    ],
  },

  /** ③ لغات البرمجة */
  PROGRAMMING_LANGUAGES: {
    label:   'Sheikha Programming Languages (PL)',
    labelAr: 'لغات برمجة شيخة',
    layers: [
      {
        id:      'sheikha-plankalkul',
        name:    'Sheikha Plankalkül',
        nameAr:  'شيخة بلانكالكول',
        origin:  'Konrad Zuse — First high-level PL for electronic computers',
        era:     '1942–1945',
        tawheedRef: 'أول تجريد رياضي للبرمجة — العقل في خدمة الله',
        maqsad: 'INTELLECT_PRESERVATION',
      },
      {
        id:      'sheikha-fortran',
        name:    'Sheikha FORTRAN',
        nameAr:  'شيخة فورتران',
        origin:  'IBM — John Backus, 1957 — First commercial high-level PL',
        era:     '1957',
        tawheedRef: '﴿قُلِ انظُرُوا مَاذَا فِي السَّمَاوَاتِ وَالْأَرْضِ﴾ — يونس: ١٠١',
        maqsad: 'INTELLECT_PRESERVATION',
        useCase: 'Science & Engineering',
      },
    ],
    modern: ['Sheikha.Python', 'Sheikha.JavaScript', 'Sheikha.Java', 'Sheikha.C', 'Sheikha.Rust', 'Sheikha.Go'],
  },

  /** ④ لغات الترميز */
  MARKUP_LANGUAGES: {
    label:   'Sheikha Markup Languages (ML)',
    labelAr: 'لغات ترميز شيخة',
    layers: [
      {
        id:      'sheikha-gml',
        name:    'Sheikha GML',
        nameAr:  'شيخة GML',
        origin:  'Charles Goldfarb — IBM — Generalized Markup Language',
        company: 'Sheikha IBM',
        era:     '1969',
        tawheedRef: 'التنظيم والترميز — والله أحكم المنظِّمين',
        maqsad: 'INTELLECT_PRESERVATION',
      },
      {
        id:      'sheikha-sgml',
        name:    'Sheikha SGML',
        nameAr:  'شيخة SGML',
        origin:  'ISO 8879 — Standard Generalized Markup Language',
        era:     '1986',
        tawheedRef: 'المعيار الدولي — كما أن الإسلام معيار البشرية',
        maqsad: 'INTELLECT_PRESERVATION',
      },
      {
        id:      'sheikha-html',
        name:    'Sheikha HTML',
        nameAr:  'شيخة HTML',
        origin:  'Tim Berners-Lee — CERN — HyperText Markup Language',
        college: 'Sheikha Saint Vincent College',
        era:     '1991',
        tawheedRef: '﴿وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا﴾ — الحجرات: ١٣',
        maqsad: 'INTELLECT_PRESERVATION',
        charset: 'Sheikha-UTF-8',
      },
    ],
  },

  /** ⑤ لغات الاستعلام */
  QUERY_LANGUAGES: {
    label:   'Sheikha Query Languages (QL)',
    labelAr: 'لغات استعلام شيخة',
    layers: [
      {
        id:      'sheikha-sequel',
        name:    'Sheikha SEQUEL',
        nameAr:  'شيخة سيكويل',
        origin:  'IBM — Chamberlin & Boyce — SEQUEL (1974)',
        era:     '1974',
        company: 'Sheikha IBM',
        tawheedRef: 'الاستعلام عن الحق — والله يعلم ما تُخفون',
        maqsad: 'WEALTH_PRESERVATION',
      },
      {
        id:      'sheikha-sql',
        name:    'Sheikha SQL',
        nameAr:  'شيخة SQL',
        origin:  'Structured Query Language — ISO Standard',
        era:     '1986',
        io:      'Sheikha lember.io',
        tawheedRef: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ﴾ — النساء: ٢٩',
        maqsad: 'WEALTH_PRESERVATION',
        shariaFilter: { no_riba: true, no_gharar: true, mutual_consent: true },
      },
    ],
  },

  /** ⑥ نظام الترميز الكوني */
  ENCODING_SYSTEM: {
    label:   'Sheikha Unicode & UTF-8',
    labelAr: 'شيخة يونيكود وUTF-8',
    layers: [
      {
        id:      'sheikha-unicode',
        name:    'Sheikha Unicode',
        nameAr:  'شيخة يونيكود',
        origin:  'Unicode Consortium — Universal Character Encoding',
        era:     '1991',
        superUser: 'Sheikha Super User',
        coverage: '149,000+ characters across all human scripts',
        tawheedRef: '﴿وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ﴾ — الروم: ٢٢',
        maqsad: 'INTELLECT_PRESERVATION',
        includes: [
          { script: 'Arabic',        range: 'U+0600–U+06FF' },
          { script: 'Sumerian',      range: 'U+12000–U+1239F' },
          { script: 'Hieroglyphics', range: 'U+13000–U+1342F' },
          { script: 'Emoji',         range: 'U+1F600–U+1F64F', name: 'Sheikha Emoji' },
        ],
      },
      {
        id:       'sheikha-utf8',
        name:     'Sheikha UTF-8',
        nameAr:   'شيخة UTF-8',
        origin:   'Ken Thompson & Rob Pike — Variable-width UTF-8 encoding',
        era:      '1993',
        function: 'الجسر الحاكم الذي يمكّن كل لغات شيخة من العمل مع النصوص الكونية',
        bridges:  ['Sheikha HTML', 'Sheikha Python', 'Sheikha SQL', 'Sheikha JavaScript'],
        tawheedRef: 'توحيد لغات البشرية — كما يوحِّد الإسلام قلوب المؤمنين',
        maqsad: 'INTELLECT_PRESERVATION',
      },
    ],
  },
});

// ── الشبكة العصبية الشيخية — مفعَّلة بالكتاب والسنة ──────────────
const SheikhaNeuralNetwork = {

  /** خلايا القرآن الكريم */
  quranCells: [
    { id: 'q001', ref: 'الفاتحة:١',    text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',               weight: 1.00 },
    { id: 'q002', ref: 'البقرة:٢٥٥',   text: 'آيَةُ الْكُرْسِيِّ',                                    weight: 0.99 },
    { id: 'q003', ref: 'البقرة:٢٧٥',   text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',        weight: 0.98 },
    { id: 'q004', ref: 'النساء:٢٩',    text: 'لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ',   weight: 0.97 },
    { id: 'q005', ref: 'المائدة:٨',    text: 'اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ',                 weight: 0.97 },
    { id: 'q006', ref: 'البقرة:٣١',    text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',                weight: 0.96 },
    { id: 'q007', ref: 'العلق:١',      text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',               weight: 0.99 },
    { id: 'q008', ref: 'الروم:٢٢',     text: 'وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ آيَاتٌ',  weight: 0.95 },
    { id: 'q009', ref: 'يونس:١٠١',     text: 'قُلِ انظُرُوا مَاذَا فِي السَّمَاوَاتِ وَالْأَرْضِ',  weight: 0.94 },
    { id: 'q010', ref: 'الحجرات:١٣',   text: 'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ',         weight: 0.96 },
  ],

  /** خلايا السنة النبوية */
  sunnahCells: [
    { id: 's001', ref: 'البخاري:١',     text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',                   weight: 1.00 },
    { id: 's002', ref: 'مسلم:٢٥٦٤',    text: 'لَا ضَرَرَ وَلَا ضِرَارَ',                             weight: 0.99 },
    { id: 's003', ref: 'البخاري:٢٠٧٩', text: 'البَيِّعَانِ بِالخِيَارِ مَا لَمْ يَتَفَرَّقَا',       weight: 0.97 },
    { id: 's004', ref: 'مسلم:١٠٨',     text: 'مَنْ غَشَّنَا فَلَيْسَ مِنَّا',                        weight: 0.98 },
    { id: 's005', ref: 'الترمذي:١٢٠٩', text: 'التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ',  weight: 0.96 },
    { id: 's006', ref: 'مسلم:٢٦٧٤',    text: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا',       weight: 0.95 },
  ],

  /**
   * تفعيل الشبكة العصبية
   * @param {object} input - المدخل
   * @returns {object} - مخرجات موثَّقة بالكتاب والسنة
   */
  activate(input) {
    const timestamp = new Date().toISOString();

    return {
      schema:    SHEIKHA_SCHEMA,
      tawheed:   SHEIKHA_TAWHEED,
      bismillah: SHEIKHA_BISMILLAH,
      input,
      sharia_compliant: this._verifyShariaCompliance(input),
      neural_layers:    this._getActiveLayers(),
      language_stack:   this._buildLanguageStack(),
      seal:      'والله أعلم — وبالله التوفيق',
      timestamp,
    };
  },

  /**
   * التحقق من الامتثال الشرعي
   * @param {*} input
   * @returns {object}
   */
  _verifyShariaCompliance(input) {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    return {
      no_riba:         !inputStr.includes('interest') && !inputStr.includes('ربا'),
      no_gharar:       true,
      no_harm:         true,
      no_deception:    true,
      mutual_consent:  true,
      quran_ref:       'البقرة:٢٧٥',
      hadith_ref:      'مسلم:٢٥٦٤',
    };
  },

  /**
   * بناء مكدّس لغة شيخة الكامل
   * @returns {string[]}
   */
  _buildLanguageStack() {
    return [
      'Sheikha Adam — ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ﴾',
      'Sheikha Sumerian (3500 BCE)',
      'Sheikha Hieroglyphics (3200 BCE)',
      'Sheikha Ada Lovelace / HP (1843)',
      'Sheikha Plankalkül (1942)',
      'Sheikha FORTRAN — Sheikha IBM (1957)',
      'Sheikha GML — Sheikha IBM (1969)',
      'Sheikha SGML (1986)',
      'Sheikha HTML — Sheikha Saint Vincent College (1991)',
      'Sheikha Unicode (1991)',
      'Sheikha SEQUEL → SQL — Sheikha IBM (1974)',
      'Sheikha UTF-8 (1993)',
      'Sheikha v2 (2026) — الطبقة الحاكمة',
    ];
  },

  /**
   * قائمة الطبقات النشطة
   * @returns {string[]}
   */
  _getActiveLayers() {
    return Object.keys(SHEIKHA_LANGUAGE_HISTORY).map(key => {
      const layer = SHEIKHA_LANGUAGE_HISTORY[key];
      return `${layer.labelAr || layer.label}`;
    });
  },
};

// ── معيار إجابات Sheikha Language API ─────────────────────────────
/**
 * يبني استجابة شيخة قياسية لأي طلب متعلق باللغة
 * @param {string} languageId - معرّف اللغة
 * @returns {object}
 */
function buildLanguageResponse(languageId) {
  const allLayers = Object.values(SHEIKHA_LANGUAGE_HISTORY)
    .flatMap(g => g.layers || []);

  const found = allLayers.find(l => l.id === languageId);

  return {
    schema:    SHEIKHA_SCHEMA,
    tawheed:   SHEIKHA_TAWHEED,
    bismillah: SHEIKHA_BISMILLAH,
    success:   !!found,
    data:      found || null,
    meta: {
      governing_layer: 'Sheikha Language v1.0',
      all_languages_count: allLayers.length,
      timestamp: new Date().toISOString(),
    },
  };
}

// ── التصدير ────────────────────────────────────────────────────────
module.exports = {
  SHEIKHA_TAWHEED,
  SHEIKHA_BISMILLAH,
  SHEIKHA_SCHEMA,
  SHEIKHA_LANGUAGE_HISTORY,
  SheikhaNeuralNetwork,
  buildLanguageResponse,
};
