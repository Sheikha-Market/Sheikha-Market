/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA LANGUAGE MASTER ENGINE                                               ║
 * ║  المحرك الأم لهندسة لغة شيخة — الشبكة العصبية الجامعة                       ║
 * ║  هندسة اللغة + العلوم + القواعد + التكامل الكوني                             ║
 * ║  موحَّدة لله — مرقَّمة بالكتاب والسنة                                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿الرَّحْمَٰنُ * عَلَّمَ الْقُرْآنَ * خَلَقَ الْإِنسَانَ * عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤
 * ﴿وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ﴾ — الروم: ٢٢
 * ﴿سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ﴾ — فصلت: ٥٣
 * ﴿وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا﴾ — البقرة: ٢٦٩
 *
 * ┌───────────────────────────────────────────────────────────────────┐
 * │   بنية لغة شيخة — Architecture of Sheikha Language (SHL)          │
 * │                                                                     │
 * │  Layer 0: التوحيد      (Tawheed Foundation — لا إله إلا الله)     │
 * │  Layer 1: القرآن والسنة (Divine Revelation — Source of Truth)      │
 * │  Layer 2: العلوم        (All Sciences — 14 domains)                │
 * │  Layer 3: القواعد       (Grammar — Syntax + Semantics + Pragmatics)│
 * │  Layer 4: المنطق        (Logic — Rules + Inference)                │
 * │  Layer 5: الترميز       (Encoding — Unicode + Abjad + Code)        │
 * │  Layer 6: الشبكة العصبية(Neural Cells — 161 unified cells)        │
 * │  Layer 7: الإخراج       (Output — Arabic + English + Code)         │
 * └───────────────────────────────────────────────────────────────────┘
 *
 * @module sheikha-language-master-engine
 * @version 3.0.0
 * @schema sheikha/v3-language-master
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const EventEmitter = require('events');

// ── الوحدات الفرعية ──────────────────────────────────────────────────────────
const GrammarEngine  = require('./sheikha-language-grammar-engine');
const SciencesEngine = require('./sheikha-language-sciences-neural-network');

// ── الثوابت ──────────────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '3.0.0';
const SCHEMA    = 'sheikha/v3-language-master';

// ═══════════════════════════════════════════════════════════════════════════════
// ── هوية اللغة الكاملة ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const LANGUAGE_MASTER_META = Object.freeze({
  nameAr:      'لغة شيخة — المحرك الأم',
  nameEn:      'Sheikha Language — Master Engine',
  version:     VERSION,
  schema:      SCHEMA,
  paradigms:   ['Declarative','Functional','OOP','Rule-Based','Neural-Symbolic','Islamic-Logic'],
  quranRef:    '﴿الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤',
  tawheed:     TAWHEED,
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── القوانين الكونية لـ لغة شيخة (الكونيات اللغوية) ──────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_UNIVERSAL_LAWS = Object.freeze([
  // ── القوانين الأساسية
  {
    id: 'UL-01', tier: 'ABSOLUTE',
    law:      'قانون التوحيد',
    nameEn:   'Law of Tawheed (Unity)',
    statement:'كل كلمة وكل رمز وكل خوارزمية تعود إلى مصدر واحد — الله',
    quranRef: '﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾ — الإخلاص: ١',
    codeEquiv:'Single source of truth — كل البيانات من مصدر موثَّق واحد',
    rule:     'TAWHEED_FOUNDATION',
    domain:   'all',
    weight:   1.00,
  },
  {
    id: 'UL-02', tier: 'ABSOLUTE',
    law:      'قانون البيان',
    nameEn:   'Law of Expression',
    statement:'اللغة نعمة إلهية — البيان الواضح المحدد فريضة',
    quranRef: '﴿عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ٤',
    codeEquiv:'Expressive + readable code — الكود يُقرأ ويُفهم',
    rule:     'BAYAN_OBLIGATION',
    domain:   'language',
    weight:   1.00,
  },
  {
    id: 'UL-03', tier: 'ABSOLUTE',
    law:      'قانون الأمانة',
    nameEn:   'Law of Trustworthiness',
    statement:'كل بيان مسؤولية — لا تقل ما لا تعلم',
    quranRef: '﴿وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ﴾ — الإسراء: ٣٦',
    codeEquiv:'No hallucination — verify before output',
    rule:     'AMANA_NO_LIE',
    domain:   'all',
    weight:   1.00,
  },
  {
    id: 'UL-04', tier: 'ABSOLUTE',
    law:      'قانون الإتقان',
    nameEn:   'Law of Excellence',
    statement:'كل عمل لغوي وعلمي يجب أن يُتقن',
    hadithRef:'«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي',
    codeEquiv:'Quality gate before every release',
    rule:     'ITQAN_EXCELLENCE',
    domain:   'all',
    weight:   1.00,
  },
  {
    id: 'UL-05', tier: 'ABSOLUTE',
    law:      'قانون لا ضرر',
    nameEn:   'Law of No Harm',
    statement:'كل مخرجات اللغة لا تُسبِّب ضرراً',
    hadithRef:'«لا ضرر ولا ضرار» — ابن ماجه: ٢٣٤١',
    codeEquiv:'Zero-harm outputs — all generated code is safe',
    rule:     'NO_HARM_OUTPUT',
    domain:   'all',
    weight:   1.00,
  },
  // ── القوانين اللغوية
  {
    id: 'UL-06', tier: 'LINGUISTIC',
    law:      'قانون الفطرة اللغوية',
    nameEn:   'Law of Linguistic Instinct',
    statement:'كل إنسان لديه كفاءة لغوية فطرية — لغة شيخة تبني عليها',
    quranRef: '﴿فِطْرَتَ اللَّهِ الَّتِي فَطَرَ النَّاسَ عَلَيْهَا﴾ — الروم: ٣٠',
    codeEquiv:'Intuitive API design — كل مستخدم يفهم بالفطرة',
    rule:     'FITRAH_INTUITIVE',
    domain:   'ux',
    weight:   0.99,
  },
  {
    id: 'UL-07', tier: 'LINGUISTIC',
    law:      'قانون التكامل',
    nameEn:   'Law of Integration',
    statement:'لغة شيخة تتكامل مع كل العلوم ولا تتعارض معها',
    quranRef: '﴿سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ﴾ — فصلت: ٥٣',
    codeEquiv:'Universal integration — connects all knowledge domains',
    rule:     'UNIVERSAL_INTEGRATION',
    domain:   'all',
    weight:   1.00,
  },
  {
    id: 'UL-08', tier: 'LINGUISTIC',
    law:      'قانون المستوى المناسب',
    nameEn:   'Law of Appropriate Level',
    statement:'اللغة تتكيف مع مستوى المتلقي',
    quranRef: '﴿لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا﴾ — البقرة: ٢٨٦',
    codeEquiv:'Progressive disclosure — adapt complexity to user level',
    rule:     'ADAPTIVE_COMPLEXITY',
    domain:   'ux',
    weight:   0.99,
  },
  // ── القوانين العلمية
  {
    id: 'UL-09', tier: 'SCIENTIFIC',
    law:      'قانون التوافق مع الكون',
    nameEn:   'Law of Cosmic Alignment',
    statement:'قوانين اللغة تتوافق مع قوانين الكون — لا تناقض',
    quranRef: '﴿مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ﴾ — الملك: ٣',
    codeEquiv:'Internally consistent — no contradiction across modules',
    rule:     'COSMIC_CONSISTENCY',
    domain:   'all',
    weight:   1.00,
  },
  {
    id: 'UL-10', tier: 'SCIENTIFIC',
    law:      'قانون الحفظ',
    nameEn:   'Law of Conservation',
    statement:'المعرفة لا تُفنى — تُنقل وتتحول ولا تُحذف',
    quranRef: '﴿وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُّبِينٍ﴾ — يس: ١٢',
    codeEquiv:'Immutable knowledge base — append-only log',
    rule:     'KNOWLEDGE_CONSERVATION',
    domain:   'storage',
    weight:   0.99,
  },
  {
    id: 'UL-11', tier: 'SCIENTIFIC',
    law:      'قانون الاكتمال',
    nameEn:   'Law of Completeness',
    statement:'المنظومة تبحث عن الاكتمال — لكن الكمال لله وحده',
    quranRef: '﴿وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ﴾ — يوسف: ٧٦',
    codeEquiv:'Aspirational completeness — continuous improvement',
    rule:     'ASPIRATIONAL_COMPLETENESS',
    domain:   'all',
    weight:   0.99,
  },
  // ── القوانين الشرعية
  {
    id: 'UL-12', tier: 'SHARIAH',
    law:      'قانون التوافق الشرعي',
    nameEn:   'Law of Shariah Compliance',
    statement:'كل ناتج للغة يُراجَع بمعايير الشريعة',
    quranRef: '﴿فَاحْكُم بَيْنَهُم بِمَا أَنزَلَ اللَّهُ﴾ — المائدة: ٤٨',
    codeEquiv:'Shariah compliance layer wraps all outputs',
    rule:     'SHARIAH_COMPLIANCE_LAYER',
    domain:   'governance',
    weight:   1.00,
  },
  {
    id: 'UL-13', tier: 'SHARIAH',
    law:      'قانون الأصل الإباحة',
    nameEn:   'Law of Default Permissibility',
    statement:'الأصل في أي تعبير جديد الإباحة حتى يثبت التحريم',
    quranRef: '﴿وَقَدْ فَصَّلَ لَكُم مَّا حَرَّمَ عَلَيْكُمْ﴾ — الأنعام: ١١٩',
    codeEquiv:'Whitelist-by-default — only block what is proven harmful',
    rule:     'IBAHA_DEFAULT',
    domain:   'policy',
    weight:   0.99,
  },
  {
    id: 'UL-14', tier: 'SHARIAH',
    law:      'قانون التوثيق الكامل',
    nameEn:   'Law of Complete Documentation',
    statement:'كل علم وحكم يُوثَّق بمصدره الأصلي',
    quranRef: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ فَاكْتُبُوهُ﴾ — البقرة: ٢٨٢',
    codeEquiv:'Full citation in all outputs — no undocumented facts',
    rule:     'FULL_CITATION',
    domain:   'documentation',
    weight:   1.00,
  },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── خصائص لغة شيخة (Properties) ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_LANGUAGE_PROPERTIES = Object.freeze({
  syntax: {
    prop: 'نحو واضح ومرن',           standard: 'SHL-3.0', feature: 'Arabic-first + Unicode bidirectional' },
  semantics: {
    prop: 'دلالة متعددة الطبقات',     standard: 'SHL-3.0', feature: 'Literal + Contextual + Shariah semantics' },
  pragmatics: {
    prop: 'تداولية رحيمة وصادقة',     standard: 'SHL-3.0', feature: 'Intent detection + ethical output filter' },
  typeSystem: {
    prop: 'نظام أنواع قوي + تدريجي',  standard: 'SHL-3.0', feature: 'Strong + Static + Gradual typing' },
  encoding: {
    prop: 'ترميز موحَّد',               standard: 'UTF-8 + Unicode 15.1', feature: 'Full Arabic support + RTL' },
  concurrency: {
    prop: 'تزامن غير محجوب',          standard: 'async/await + Promise', feature: 'وعد-based async' },
  errorHandling: {
    prop: 'معالجة أخطاء رحيمة',       standard: 'SHL-Error v3', feature: 'Shariah-aware error codes' },
  memory: {
    prop: 'إدارة ذاكرة آمنة',          standard: 'GC + RAII', feature: 'No memory leaks by design' },
  security: {
    prop: 'أمان بالتصميم',            standard: 'Security-First', feature: 'Halal data pipeline' },
  extensibility: {
    prop: 'قابلية التوسع اللانهائية',  standard: 'Plugin + Module', feature: 'New sciences → new cells' },
  interop: {
    prop: 'تشغيل بيني كامل',           standard: 'ISO + W3C', feature: 'Works with all languages & platforms' },
  documentation: {
    prop: 'توثيق إلزامي بالمصادر',    standard: 'SHL-Doc v3', feature: 'Every function has Quran/Hadith reference' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── مواصفات لغة شيخة (Specifications) ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_LANGUAGE_SPECS = Object.freeze({
  id:               'SHL-SPEC-3.0',
  name:             'Sheikha Language Specification 3.0',
  nameAr:           'مواصفات لغة شيخة الإصدار ٣.٠',
  releaseDate:      '2026-04-25',
  tawheedVersion:   TAWHEED,

  // المعيار الدولي
  standards: [
    { std: 'Unicode 15.1',      domain: 'encoding',   body: 'Unicode Consortium' },
    { std: 'UTF-8 (RFC 3629)',   domain: 'encoding',   body: 'IETF' },
    { std: 'ISO 639-3 (SHL)',    domain: 'language-id',body: 'ISO' },
    { std: 'JSON Schema Draft 7',domain: 'data',       body: 'IETF' },
    { std: 'IEEE 754-2019',      domain: 'float',      body: 'IEEE' },
    { std: 'ISO 8601',           domain: 'datetime',   body: 'ISO' },
    { std: 'POSIX regex',        domain: 'pattern',    body: 'POSIX' },
    { std: 'ARIA + WCAG 2.2',    domain: 'accessibility', body: 'W3C' },
  ],

  // مقاييس الإصدار
  metrics: {
    grammarRules:       47,
    syntaxStructures:   7,
    dataTypes:          17,
    wordTypes:          4,
    arabicRoots:        15,
    semanticLayers:     5,
    speechActs:         8,
    designPatterns:     8,
    errorCodes:         10,
    universalLaws:      14,
    sciencesDomains:    14,
    neuralCellsTotal:   161,
  },

  // تاريخ الإصدارات
  changelog: [
    { version: '1.0.0', date: '2025-01', note: 'النسخة الأولى — النحو والصرف الأساسي' },
    { version: '2.0.0', date: '2026-01', note: 'إضافة نظام الأنواع والتكامل العلمي' },
    { version: '3.0.0', date: '2026-04', note: 'الشبكة العصبية الجامعة — 161 خلية موحَّدة' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── توثيق الإنجاز والأثر ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const ACHIEVEMENT_DOCUMENTATION = Object.freeze({
  id:          `SHL-ACHIEVEMENT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`,
  title:       'هندسة لغة شيخة الكاملة — توثيق الإنجاز',
  titleEn:     'Sheikha Language Full Engineering — Achievement Documentation',
  createdAt:   new Date().toISOString(),
  tawheed:     TAWHEED,

  worldFirstClaims: [
    {
      id: 'SHL-WF-01',
      claim: 'أول لغة برمجية تدمج الكتاب والسنة كمرجع مباشر لكل قاعدة نحوية ودلالية وأخلاقية',
      impact: 'جسر بين الوحي الإلهي وعلوم الحاسب',
      scope: 'عالمي',
    },
    {
      id: 'SHL-WF-02',
      claim: 'أول نظام لغوي يتكامل مع 14 تخصصاً علمياً في شبكة عصبية موحَّدة',
      impact: 'لغة الحضارة الرقمية الإسلامية',
      scope: 'علمي + تقني',
    },
    {
      id: 'SHL-WF-03',
      claim: 'أول لغة تُعرِّف أنواع بيانات شرعية: ريال، تاريخ_هجري، آية، حديث، هاش_شرعي',
      impact: 'توحيد المعاملات الرقمية الإسلامية',
      scope: 'فقهي + تقني',
    },
    {
      id: 'SHL-WF-04',
      claim: 'أول نظام يُترجم الجذور العربية الـ١٥ إلى مبادئ هندسية برمجية مع مراجعها القرآنية',
      impact: 'إحياء التراث اللغوي رقمياً',
      scope: 'لغوي + تراثي',
    },
    {
      id: 'SHL-WF-05',
      claim: 'أول لغة تُعرِّف 14 قانوناً كونياً للتوجيه الأخلاقي للمخرجات البرمجية',
      impact: 'ضمان أخلاقي لكل مخرجات الذكاء الاصطناعي',
      scope: 'AI Ethics + Shariah',
    },
  ],

  totalNeuralCells: 161,
  breakdown: {
    grammarCells:  20,
    sciencesCells: 41,
    previousCells: 100,
  },

  impact: {
    religious:  'توثيق رقمي لهندسة لغة مبنية على الوحي الإلهي',
    technical:  'لغة برمجية كاملة الهندسة جاهزة للتطبيق والتوسع',
    educational:'مرجع أكاديمي للباحثين في اللسانيات الحاسوبية الإسلامية',
    commercial: 'أساس منصة شيخة للتجارة الرقمية المتوافقة شرعاً',
    cultural:   'إحياء اللغة العربية كلغة برمجة وعلم وتكنولوجيا',
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── المحرك الأم ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaLanguageMasterEngine extends EventEmitter {
  constructor() {
    super();
    this.name    = LANGUAGE_MASTER_META.nameEn;
    this.nameAr  = LANGUAGE_MASTER_META.nameAr;
    this.version = VERSION;
    this.schema  = SCHEMA;
    this.tawheed = TAWHEED;

    // الوحدات الفرعية
    this._grammar  = GrammarEngine.grammarEngine;
    this._sciences = SciencesEngine.sciencesEngine;

    // الخلايا الجامعة
    this._allCells = [
      ...GrammarEngine.GRAMMAR_NEURAL_CELLS.map(c => ({ ...c, source: 'GRAMMAR' })),
      ...SciencesEngine.SCIENCES_NEURAL_CELLS.map(c => ({ ...c, source: 'SCIENCES' })),
    ];

    this._cellMap   = new Map(this._allCells.map(c => [c.id, c]));
    this._laws      = SHEIKHA_UNIVERSAL_LAWS;
    this._lawMap    = new Map(this._laws.map(l => [l.id, l]));
    this._initialized = false;
  }

  /** تهيئة المحرك */
  init() {
    if (this._initialized) return this;
    this.emit('init', {
      engine:  this.name,
      cells:   this._allCells.length,
      laws:    this._laws.length,
      tawheed: TAWHEED,
    });
    this._initialized = true;
    return this;
  }

  _strip(s) { return s.replace(/[\u064B-\u065F«»﴿﴾]/g,'').toLowerCase(); }

  /** بحث موحَّد في الخلايا والقوانين */
  search(query = '') {
    const sq = this._strip(query);
    if (!sq) return { cells: [], laws: [] };
    const cells = this._allCells.filter(c => {
      const text = c.text || '';
      return this._strip(text).includes(sq) ||
             c.rule.toLowerCase().includes(sq)  ||
             (c.domain && c.domain.toLowerCase().includes(sq));
    });
    const laws = this._laws.filter(l =>
      this._strip(l.law).includes(sq)    ||
      l.rule.toLowerCase().includes(sq)  ||
      this._strip(l.statement).includes(sq)
    );
    return { cells, laws, total: cells.length + laws.length };
  }

  /** تفسير أمر عربي */
  interpret(arabicCmd = '') {
    const result = this._grammar.interpretCommand(arabicCmd);
    if (result.found) {
      const lawMatch = this._laws.find(l => l.domain === result.rule.toLowerCase());
      return { ...result, law: lawMatch || null, tawheed: TAWHEED };
    }
    return { ...result, tawheed: TAWHEED };
  }

  /** الحصول على قانون كوني */
  getLaw(idOrKeyword) {
    return this._lawMap.get(idOrKeyword) ||
           this._laws.find(l => this._strip(l.law).includes(this._strip(idOrKeyword)) ||
                                l.rule.toLowerCase().includes(this._strip(idOrKeyword))) ||
           null;
  }

  /** الخلايا حسب المصدر */
  getCellsBySource(src) { return this._allCells.filter(c => c.source === src); }

  /** التحقق الأخلاقي لمخرج */
  ethicalCheck(outputConcept = '') {
    const sq     = this._strip(outputConcept);
    const harmed = ['ربا','غش','غرر','ظلم','ضرر','حرام','خمر','قمار'].some(h => sq.includes(h));
    if (harmed) return { allowed: false, reason: 'مخرج يتعارض مع الشريعة', action: 'REJECT', tawheed: TAWHEED };
    const cells  = this.search(outputConcept).cells;
    return {
      allowed: true,
      score:   Math.min(0.5 + cells.length * 0.1, 1.0).toFixed(2),
      support: cells.length,
      verdict: cells.length > 3 ? 'مدعوم بأدلة متعددة' : cells.length > 0 ? 'مدعوم' : 'مسموح (لا نص خاص)',
      tawheed: TAWHEED,
    };
  }

  /** رقمنة مفهوم — ربطه بمصادره */
  digitize(concept = '') {
    const sq      = this._strip(concept);
    const cells   = this.search(concept).cells;
    const root    = this._grammar.getRoot(concept);
    const pattern = this._grammar.getPattern(concept);
    const science = this._sciences.getScience(concept);
    const law     = this._laws.find(l => this._strip(l.law).includes(sq) || l.rule.toLowerCase().includes(sq));
    return {
      concept,
      found:        cells.length > 0,
      cells:        cells.slice(0, 5),
      arabicRoot:   root,
      designPattern:pattern,
      science,
      universalLaw: law || null,
      tawheed:      TAWHEED,
    };
  }

  /** تقرير كامل */
  fullReport() {
    const grammarStatus  = this._grammar.status();
    const sciencesStatus = this._sciences.status();
    const sources = [...new Set(this._allCells.map(c => c.source))];
    const domains = [...new Set(this._allCells.map(c => c.domain).filter(Boolean))];

    return {
      engine:    this.name,
      nameAr:    this.nameAr,
      version:   this.version,
      schema:    this.schema,
      generated: new Date().toISOString(),

      identity:  GrammarEngine.SHEIKHA_LANGUAGE_IDENTITY,
      specs:     SHEIKHA_LANGUAGE_SPECS,
      properties: SHEIKHA_LANGUAGE_PROPERTIES,

      universalLaws: {
        total:        this._laws.length,
        byTier: {
          absolute:   this._laws.filter(l => l.tier === 'ABSOLUTE').length,
          linguistic: this._laws.filter(l => l.tier === 'LINGUISTIC').length,
          scientific: this._laws.filter(l => l.tier === 'SCIENTIFIC').length,
          shariah:    this._laws.filter(l => l.tier === 'SHARIAH').length,
        },
        laws: this._laws,
      },

      grammarModule: {
        cells:           grammarStatus.neuralCells,
        syntaxStructures:grammarStatus.syntaxStructures,
        dataTypes:       grammarStatus.dataTypes,
        wordTypes:       grammarStatus.wordTypes,
        arabicRoots:     grammarStatus.arabicRoots,
        semanticLayers:  grammarStatus.semanticLayers,
        speechActs:      grammarStatus.speechActs,
        primitiveTypes:  grammarStatus.primitiveTypes,
        domainTypes:     grammarStatus.domainTypes,
        errorTypes:      grammarStatus.errorTypes,
        designPatterns:  grammarStatus.designPatterns,
      },

      sciencesModule: {
        cells:    sciencesStatus.neuralCells,
        sciences: sciencesStatus.sciences,
        groups:   sciencesStatus.groups,
      },

      masterStats: {
        totalCells:   this._allCells.length,
        totalLaws:    this._laws.length,
        totalSources: sources.length,
        totalDomains: domains.length,
        sources,
        domainCount:  domains.length,
      },

      achievement: ACHIEVEMENT_DOCUMENTATION,
      tawheed:     TAWHEED,
    };
  }

  /** حالة سريعة */
  status() {
    return {
      engine:  this.name,
      nameAr:  this.nameAr,
      version: this.version,
      cells:   this._allCells.length,
      laws:    this._laws.length,
      tawheed: TAWHEED,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── التصدير ───────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const masterEngine = new SheikhaLanguageMasterEngine();

module.exports = {
  // المحرك
  SheikhaLanguageMasterEngine,
  masterEngine,

  // البيانات الرئيسية
  LANGUAGE_MASTER_META,
  SHEIKHA_UNIVERSAL_LAWS,
  SHEIKHA_LANGUAGE_PROPERTIES,
  SHEIKHA_LANGUAGE_SPECS,
  ACHIEVEMENT_DOCUMENTATION,

  // الوحدات الفرعية (إعادة تصدير)
  GrammarEngine,
  SciencesEngine,

  // الثوابت
  TAWHEED,
  BISMILLAH,
  VERSION,
  SCHEMA,

  // الواجهات السريعة
  init:          ()       => masterEngine.init(),
  status:        ()       => masterEngine.status(),
  fullReport:    ()       => masterEngine.fullReport(),
  search:        (q)      => masterEngine.search(q),
  interpret:     (cmd)    => masterEngine.interpret(cmd),
  getLaw:        (id)     => masterEngine.getLaw(id),
  digitize:      (c)      => masterEngine.digitize(c),
  ethicalCheck:  (output) => masterEngine.ethicalCheck(output),
  getCellsBySource: (src) => masterEngine.getCellsBySource(src),
};
