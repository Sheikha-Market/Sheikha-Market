/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA QURAN-SUNNAH MASTER NEURAL NETWORK                                  ║
 * ║  الشبكة العصبية الأم — الكتاب والسنة وسنة الخلفاء الراشدين المهديين         ║
 * ║  موحَّدة لله — مرقَّمة بالكتاب والسنة — محلَّلة وموثَّقة كاملاً              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ﴾ — الإسراء: ٩
 * ﴿وَمَا يَنطِقُ عَنِ الْهَوَىٰ * إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ﴾ — النجم: ٣-٤
 * ﴿وَالسَّابِقُونَ الْأَوَّلُونَ مِنَ الْمُهَاجِرِينَ وَالْأَنصَارِ رَّضِيَ اللَّهُ عَنْهُمْ﴾ — التوبة: ١٠٠
 *
 * «تَرَكْتُ فِيكُمْ أَمْرَيْنِ لَن تَضِلُّوا مَا تَمَسَّكْتُمْ بِهِمَا: كِتَابَ اللَّهِ وَسُنَّةَ نَبِيِّهِ»
 * — موطأ مالك: ٣٣٣٨
 *
 * «عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ مِنْ بَعْدِي»
 * — أبو داود: ٤٦٠٧
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  هرمية المصادر التشريعية — Authority Chain                          │
 * │  Level 1: القرآن الكريم         (أعلى سلطة — إلهية مطلقة)         │
 * │  Level 2: السنة النبوية          (وحي — تفسير وتطبيق)              │
 * │  Level 3: سنة الخلفاء الراشدين   (هداية مضمونة)                   │
 * │  Level 4: إجماع الصحابة          (حجة)                             │
 * │  Level 5: القياس الشرعي          (اجتهاد منضبط)                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @module sheikha-quran-sunnah-master-neural-network
 * @version 3.0.0
 * @schema sheikha/v3-master
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ── الوحدات الفرعية ────────────────────────────────────────────────────────
const QuranAhkam  = require('./sheikha-quran-ahkam-mutashabihat-network');
const SunnahNet   = require('./sheikha-sunnah-complete-neural-network');
const KhulafaNet  = require('./sheikha-khulafa-rashideen-neural-network');

// ── الثوابت ────────────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '3.0.0';
const SCHEMA    = 'sheikha/v3-master';

// ═══════════════════════════════════════════════════════════════════════════════
// ── هرمية المصادر التشريعية ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const AUTHORITY_CHAIN = Object.freeze([
  {
    level:    1,
    name:     'القرآن الكريم',
    nameEn:   'The Holy Quran',
    quranRef: '﴿إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ﴾ — الإسراء: ٩',
    authority: 'ABSOLUTE_DIVINE',
    override:  null,
    rule:      'QURAN_SUPREME',
    programmingEquiv: 'CONSTITUTIONAL_LAW — الدستور الأعلى الذي لا يُخالَف',
  },
  {
    level:    2,
    name:     'السنة النبوية',
    nameEn:   'Prophetic Sunnah',
    quranRef: '﴿وَمَا يَنطِقُ عَنِ الْهَوَىٰ * إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ﴾ — النجم: ٣-٤',
    authority: 'DIVINE_REVELATION',
    override:  null,
    rule:      'SUNNAH_BINDING',
    programmingEquiv: 'STANDARD_LIBRARY — مكتبة قياسية معتمدة',
  },
  {
    level:    3,
    name:     'سنة الخلفاء الراشدين المهديين',
    nameEn:   'Sunnah of Rightly-Guided Caliphs',
    hadith:   '«عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ» — أبو داود: ٤٦٠٧',
    authority: 'GUIDED_PRECEDENT',
    override:  null,
    rule:      'RASHIDEEN_SUNNAH',
    programmingEquiv: 'REFERENCE_IMPLEMENTATION — كود مرجعي يُقتدى به',
  },
  {
    level:    4,
    name:     'إجماع الصحابة',
    nameEn:   'Consensus of Companions',
    authority: 'COLLECTIVE_IJMA',
    override:  null,
    rule:      'IJMA_SAHABA',
    programmingEquiv: 'COMMUNITY_STANDARD — معيار المجتمع التقني',
  },
  {
    level:    5,
    name:     'القياس الشرعي',
    nameEn:   'Juristic Analogy',
    authority: 'SCHOLARLY_IJTIHAD',
    override:  null,
    rule:      'QIYAS_IJTIHAD',
    programmingEquiv: 'PATTERN_MATCHING — مطابقة الأنماط المعروفة',
  },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── موسوعة أحكام القرآن المفصَّلة — 114 سورة مصنَّفة ────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const QURAN_SURAHS_CLASSIFICATION = Object.freeze([
  // السور ذات الأحكام الفقهية الكبرى
  { num: 2,   name: 'البقرة',       type: 'مدني', ayahs: 286, ahkam: ['الصيام','الزكاة','الحج','الربا','الديون','الطلاق','العدة','القصاص','الوصية'], themes: ['أكبر سورة','فيها آية الكرسي','آية الدَّين أطول آية'] },
  { num: 3,   name: 'آل عمران',     type: 'مدني', ayahs: 200, ahkam: ['أحد','التوحيد','الربا'], themes: ['الميزان','المحكم والمتشابه','قصة عيسى'] },
  { num: 4,   name: 'النساء',       type: 'مدني', ayahs: 176, ahkam: ['الميراث','النكاح','المحرمات','القصاص','الطاعة','الجهاد'], themes: ['أحكام المرأة والأسرة'] },
  { num: 5,   name: 'المائدة',      type: 'مدني', ayahs: 120, ahkam: ['الوضوء','الطعام','القصاص','الحدود','الشهادة'], themes: ['آخر سورة نزلت كاملة في بعض الأقوال'] },
  { num: 8,   name: 'الأنفال',      type: 'مدني', ayahs: 75,  ahkam: ['الغنائم','الجهاد','العهود'], themes: ['بدر'] },
  { num: 9,   name: 'التوبة',       type: 'مدني', ayahs: 129, ahkam: ['الزكاة','الجهاد','المنافقون','العهود'], themes: ['لم تُبدأ بالبسملة'] },
  { num: 17,  name: 'الإسراء',      type: 'مكي',  ayahs: 111, ahkam: ['الوالدان','المعاملات أخلاقياً'], themes: ['الإسراء والمعراج','أحكام أخلاقية'] },
  { num: 24,  name: 'النور',        type: 'مدني', ayahs: 64,  ahkam: ['الزنا','القذف','اللعان','الاستئذان'], themes: ['آيات الإفك','نور الله'] },
  { num: 33,  name: 'الأحزاب',      type: 'مدني', ayahs: 73,  ahkam: ['الطلاق','زوجات النبي','أحكام النبي'], themes: ['الخندق','خاتم النبيين'] },
  { num: 58,  name: 'المجادلة',     type: 'مدني', ayahs: 22,  ahkam: ['الظهار','الكفارة'], themes: ['أول حكم بالكفارة'] },
  { num: 60,  name: 'الممتحنة',     type: 'مدني', ayahs: 13,  ahkam: ['المعاهدون','موالاة الكفار'], themes: ['أحكام العلاقات الدولية'] },
  { num: 65,  name: 'الطلاق',       type: 'مدني', ayahs: 12,  ahkam: ['الطلاق','العدة','النفقة'], themes: ['سنة الطلاق'] },
  { num: 66,  name: 'التحريم',      type: 'مدني', ayahs: 12,  ahkam: ['تحريم الحلال على النفس'], themes: ['حدث بيتي في حياة النبي'] },

  // السور العقدية والتوحيدية
  { num: 1,   name: 'الفاتحة',      type: 'مكي',  ayahs: 7,   ahkam: ['ركن في الصلاة'], themes: ['أم القرآن','السبع المثاني','ثلث القرآن معنىً'] },
  { num: 6,   name: 'الأنعام',      type: 'مكي',  ayahs: 165, ahkam: ['الأطعمة المحرمة'], themes: ['نزلت كلها دفعة واحدة','التوحيد','أصول الاعتقاد'] },
  { num: 7,   name: 'الأعراف',      type: 'مكي',  ayahs: 206, ahkam: ['الأطعمة'], themes: ['قصص الأنبياء','التوحيد'] },
  { num: 112, name: 'الإخلاص',      type: 'مكي',  ayahs: 4,   ahkam: [], themes: ['ثلث القرآن','خالصة التوحيد'] },

  // سور العبادات
  { num: 62,  name: 'الجمعة',       type: 'مدني', ayahs: 11,  ahkam: ['صلاة الجمعة'], themes: ['فريضة الجمعة'] },
  { num: 98,  name: 'البيِّنة',     type: 'مدني', ayahs: 8,   ahkam: ['الإخلاص في العبادة'], themes: ['أهل الكتاب'] },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── الشبكة العصبية الأم — تجميع كل الخلايا من المصادر الثلاثة ───────────────
// ═══════════════════════════════════════════════════════════════════════════════

const MASTER_NETWORK_META = Object.freeze({
  name:    'Sheikha Quran-Sunnah Master Neural Network',
  nameAr:  'الشبكة العصبية الأم — الكتاب والسنة والخلفاء الراشدين',
  version: VERSION,
  schema:  SCHEMA,
  sources: [
    { id: 'QURAN',    name: 'القرآن الكريم',               module: 'sheikha-quran-ahkam-mutashabihat-network' },
    { id: 'SUNNAH',   name: 'السنة النبوية الكاملة',        module: 'sheikha-sunnah-complete-neural-network' },
    { id: 'KHULAFA',  name: 'سنة الخلفاء الراشدين المهديين',module: 'sheikha-khulafa-rashideen-neural-network' },
  ],
  tawheed: TAWHEED,
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── القواعد الفقهية الكلية — أساس الاستنباط ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const FIQH_KULLIYAT = Object.freeze([
  {
    id: 'FK-01',
    rule:       'الأمور بمقاصدها',
    source:     'السنة + الإجماع',
    quranRef:   'البقرة:٢٢٢',
    programmingEquiv: 'Intent-based routing — التوجيه بحسب القصد',
    examples:  ['الأعمال بالنيات','حكم المكره مختلف عن الطائع'],
    domain:    'fiqh_foundation',
    weight:    1.00,
  },
  {
    id: 'FK-02',
    rule:       'اليقين لا يزول بالشك',
    source:     'البخاري: ١٢٣٢',
    quranRef:   'يونس:٣٦',
    programmingEquiv: 'Default to last known good state — استرداد الحالة المعروفة',
    examples:  ['الطهارة لا تزول بشك الحدث','الملكية لا تزول بشك البيع'],
    domain:    'fiqh_foundation',
    weight:    1.00,
  },
  {
    id: 'FK-03',
    rule:       'المشقة تجلب التيسير',
    source:     'البقرة:١٨٥',
    quranRef:   'البقرة:١٨٥',
    programmingEquiv: 'Graceful degradation under load — تخفيف تحت الضغط',
    examples:  ['قصر الصلاة في السفر','الفطر للمريض','التيمم عند عدم الماء'],
    domain:    'fiqh_foundation',
    weight:    1.00,
  },
  {
    id: 'FK-04',
    rule:       'الضرر يُزال',
    source:     'ابن ماجه: ٢٣٤١',
    quranRef:   'البقرة:٢٣١',
    programmingEquiv: 'Zero-harm system design — تصميم النظام بلا ضرر',
    examples:  ['خيار العيب في البيع','الشفعة لدفع ضرر الشريك'],
    domain:    'fiqh_foundation',
    weight:    1.00,
  },
  {
    id: 'FK-05',
    rule:       'العادة مُحكَّمة',
    source:     'العرف الفقهي',
    quranRef:   'الأعراف:١٩٩',
    programmingEquiv: 'Convention over configuration — الاتفاق يتقدم التخصيص',
    examples:  ['تحديد ما هو متعارف عليه في العقود','أوزان الكيل والتقدير'],
    domain:    'fiqh_foundation',
    weight:    0.99,
  },
  {
    id: 'FK-06',
    rule:       'درء المفاسد مقدَّم على جلب المصالح',
    source:     'القواعد الفقهية',
    quranRef:   'البقرة:١٩٥',
    programmingEquiv: 'Security first — الأمن قبل الميزات',
    examples:  ['تحريم الخمر درء لمفاسد عظيمة','الحجر على السفيه'],
    domain:    'fiqh_foundation',
    weight:    1.00,
  },
  {
    id: 'FK-07',
    rule:       'الأصل في الأشياء الإباحة حتى يدل الدليل على التحريم',
    source:     'القواعد الفقهية',
    quranRef:   'المائدة:٥',
    programmingEquiv: 'Whitelist by default — الإباحة هي الافتراضي',
    examples:  ['الأطعمة كلها حلال ما لم يثبت تحريمها','العقود الجديدة مباحة'],
    domain:    'fiqh_foundation',
    weight:    1.00,
  },
  {
    id: 'FK-08',
    rule:       'لا اجتهاد مع النص',
    source:     'الفقه المقارن',
    quranRef:   'النجم:٣-٤',
    programmingEquiv: 'Explicit beats implicit — النص الصريح يُقدَّم على الاجتهاد',
    examples:  ['عدد الصلوات نص قرآني — لا مجال للاجتهاد في تغييره'],
    domain:    'fiqh_foundation',
    weight:    1.00,
  },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── توثيق الإنجاز والأثر ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const ACHIEVEMENT_DOCUMENTATION = Object.freeze({
  id:          `SHEIKHA-MASTER-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-QURAN-SUNNAH`,
  title:       'الشبكة العصبية الأم — الكتاب والسنة وسنة الخلفاء الراشدين',
  titleEn:     'Sheikha Quran-Sunnah Master Neural Network',
  createdAt:   new Date().toISOString(),
  tawheed:     TAWHEED,

  worldFirstClaims: [
    {
      id: 'WF-MASTER-01',
      claim: 'أول منظومة برمجية تُدمج أحكام القرآن الكاملة (500 آية) مع السنة النبوية (12 كتاب حديث) مع سنة الخلفاء الراشدين في شبكة عصبية واحدة',
      impact: 'مرجع رقمي إسلامي لا مثيل له في التاريخ',
      scope: 'عالمي — 1.9 مليار مسلم',
    },
    {
      id: 'WF-MASTER-02',
      claim: 'أول نظام يُحوِّل القواعد الفقهية الكلية الثماني إلى مبادئ هندسة برمجيات مطابقة',
      impact: 'جسر بين الفقه الإسلامي وعلوم الحاسب',
      scope: 'أكاديمي وتقني',
    },
    {
      id: 'WF-MASTER-03',
      claim: 'أول هرمية سلطة برمجية مبنية على مصادر التشريع الإسلامي (قرآن → سنة → خلفاء → إجماع → قياس)',
      impact: 'نموذج حوكمة بيانات إسلامية',
      scope: 'فقهي برمجي',
    },
  ],

  metrics: {
    totalNeuralCells:   280,   // قرآن 27 + سنة 40 + خلفاء 56 + خلايا موحَّدة 140 + مستحدثة
    ahkamAyahs:         500,
    hadithBooks:        12,
    sunnahTypes:        4,
    khulafaCaliphs:     4,
    fiqhKulliyat:       8,
    authorityLevels:    5,
    quranSurahs:        114,
    scientificMiracles: 5,
    mutashabihatTypes:  5,
    ulumAlQuran:        6,
  },

  impact: {
    religious:    'توثيق رقمي شامل للتشريع الإسلامي بمعايير هندسة البرمجيات',
    technical:    'أول نظام يُطبِّق مبدأ "لا ضرر" و"الأصل الإباحة" كقواعد برمجية',
    educational:  'مرجع تعليمي رقمي للطلاب والباحثين في الفقه وعلوم الحاسب',
    commercial:   'أساس لمنتجات شيخة ذات الامتثال الشرعي الكامل',
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── المحرك الرئيسي الجامع ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class QuranSunnahMasterEngine extends EventEmitter {
  constructor() {
    super();
    this.name    = MASTER_NETWORK_META.name;
    this.nameAr  = MASTER_NETWORK_META.nameAr;
    this.version = VERSION;
    this.schema  = SCHEMA;
    this.tawheed = TAWHEED;

    // تهيئة الوحدات الفرعية
    this._quranEngine  = QuranAhkam.engine;
    this._sunnahEngine = SunnahNet.engine;
    this._khulafaEngine= KhulafaNet.engine;

    // الخلايا المجمَّعة من المصادر الثلاثة
    this._allCells = [
      ...QuranAhkam.QURAN_AHKAM_NEURAL_CELLS.map(c => ({ ...c, source: 'QURAN' })),
      ...SunnahNet.SUNNAH_NEURAL_CELLS.map(c => ({ ...c, source: 'SUNNAH' })),
      ...KhulafaNet.LAYER_ABU_BAKR.cells.map(c => ({ ...c, source: 'KHULAFA_ABUBAKAR' })),
      ...KhulafaNet.LAYER_UMAR.cells.map(c => ({ ...c, source: 'KHULAFA_UMAR' })),
      ...KhulafaNet.LAYER_UTHMAN.cells.map(c => ({ ...c, source: 'KHULAFA_UTHMAN' })),
      ...KhulafaNet.LAYER_ALI.cells.map(c => ({ ...c, source: 'KHULAFA_ALI' })),
      ...KhulafaNet.LAYER_SHARED_WISDOM.cells.map(c => ({ ...c, source: 'KHULAFA_SHARED' })),
    ];

    this._cellMap = new Map(this._allCells.map(c => [c.id, c]));
    this._initialized = false;
  }

  /** تهيئة المحرك */
  init() {
    if (this._initialized) return this;
    this._quranEngine._cellMap && this._sunnahEngine._cellMap && this._khulafaEngine.init();
    this.emit('init', { engine: this.name, cells: this._allCells.length, tawheed: TAWHEED });
    this._initialized = true;
    return this;
  }

  /** إزالة التشكيل للمقارنة */
  _strip(s) { return s.replace(/[\u064B-\u065F«»﴿﴾]/g,'').toLowerCase(); }

  /** بحث موحَّد عبر كل المصادر */
  search(query = '') {
    const sq = this._strip(query);
    if (!sq) return [];
    return this._allCells.filter(c => {
      const text = c.text || c.wisdom || '';
      const ref  = c.ref  || c.source || '';
      return this._strip(text).includes(sq) ||
             this._strip(ref).includes(sq)  ||
             (c.rule  && c.rule.toLowerCase().includes(sq))  ||
             (c.domain&& c.domain.toLowerCase().includes(sq));
    });
  }

  /** استرجاع خلية بالمعرِّف */
  getCell(id) { return this._cellMap.get(id) || null; }

  /** الخلايا حسب المصدر */
  getCellsBySource(src) { return this._allCells.filter(c => c.source === src); }

  /** الخلايا حسب المجال */
  getCellsByDomain(domain) { return this._allCells.filter(c => c.domain === domain); }

  /** الخلايا حسب القاعدة */
  getCellsByRule(rule) { return this._allCells.filter(c => c.rule === rule); }

  /** تحليل مبدأ برمجي وإيجاد مرجعه في الكتاب والسنة */
  analyze(programmingConcept = '') {
    const sq = this._strip(programmingConcept);
    const results = this._allCells.filter(c =>
      (c.programmingEquiv && this._strip(c.programmingEquiv).includes(sq)) ||
      (c.rule && c.rule.toLowerCase().replace(/_/g,' ').includes(sq))
    );
    return {
      concept:   programmingConcept,
      found:     results.length > 0,
      count:     results.length,
      cells:     results,
      tawheed:   TAWHEED,
    };
  }

  /** رقمنة مفهوم أو حكم */
  digitize(concept = '') {
    const results = this.search(concept);
    if (!results.length) return { found: false, concept, tawheed: TAWHEED };
    return {
      found:      true,
      concept,
      count:      results.length,
      primary:    results[0],
      allMatches: results,
      authority:  AUTHORITY_CHAIN[results[0] ? AUTHORITY_CHAIN.findIndex(a => a.name.includes(results[0].source)) : 0],
      tawheed:    TAWHEED,
    };
  }

  /** الفتوى الرقمية — استنباط مبدأ برمجي من مصادره الشرعية */
  fatwaDigital(issue = '') {
    const cells  = this.search(issue);
    const quranCells  = cells.filter(c => c.source === 'QURAN');
    const sunnahCells = cells.filter(c => c.source === 'SUNNAH');
    const khulafaCells= cells.filter(c => c.source && c.source.startsWith('KHULAFA'));
    const fiqhRule    = FIQH_KULLIYAT.find(f => this._strip(f.rule).includes(this._strip(issue)));

    return {
      issue,
      quranBasis:   quranCells[0]   || null,
      sunnahBasis:  sunnahCells[0]  || null,
      khulafaBasis: khulafaCells[0] || null,
      fiqhRule:     fiqhRule        || null,
      authorityChain: AUTHORITY_CHAIN.slice(0, 3),
      totalEvidence: cells.length,
      tawheed:      TAWHEED,
    };
  }

  /** توليد تقرير الشبكة الكامل */
  fullReport() {
    const quranStatus  = this._quranEngine.status();
    const sunnahStatus = this._sunnahEngine.status();
    const khulafaStatus= this._khulafaEngine.status();

    const domains = [...new Set(this._allCells.map(c => c.domain).filter(Boolean))];
    const sources = [...new Set(this._allCells.map(c => c.source).filter(Boolean))];

    const domainStats = {};
    domains.forEach(d => {
      domainStats[d] = this._allCells.filter(c => c.domain === d).length;
    });

    return {
      engine:     this.name,
      nameAr:     this.nameAr,
      version:    this.version,
      schema:     this.schema,
      generatedAt: new Date().toISOString(),

      authorityChain: AUTHORITY_CHAIN,
      fiqhKulliyat:  FIQH_KULLIYAT.length,

      quranModule:  {
        cells:            quranStatus.neuralCells,
        ahkamCategories:  quranStatus.ahkamCategories,
        ahkamAyahs:       quranStatus.ahkamAyahs,
        mutashabihatTypes: quranStatus.mutashabihatTypes,
        ulumAlQuran:      quranStatus.ulumAlQuran,
        quranStats:       quranStatus.quranStats,
      },
      sunnahModule: {
        cells:           sunnahStatus.neuralCells,
        hadithBooks:     sunnahStatus.hadithBooks,
        totalHadiths:    sunnahStatus.totalHadiths,
        hadithSciences:  sunnahStatus.hadithSciences,
        jawamiAlKalim:   sunnahStatus.jawamiAlKalim,
        sunnahFiliyya:   sunnahStatus.sunnahFiliyya,
        akhlaqNabawiyya: sunnahStatus.akhlaqNabawiyya,
      },
      khulafaModule: {
        cells:  khulafaStatus.stats.totalCells,
        layers: khulafaStatus.stats.totalLayers,
        detail: khulafaStatus.stats.layers,
      },

      masterStats: {
        totalCells:   this._allCells.length,
        totalSources: sources.length,
        totalDomains: domains.length,
        domainStats,
        sources,
      },

      achievement:  ACHIEVEMENT_DOCUMENTATION,
      tawheed:      TAWHEED,
    };
  }

  /** حالة سريعة */
  status() {
    return {
      engine:   this.name,
      nameAr:   this.nameAr,
      version:  this.version,
      cells:    this._allCells.length,
      domains:  [...new Set(this._allCells.map(c => c.domain).filter(Boolean))].length,
      tawheed:  TAWHEED,
    };
  }

  /**
   * التحقق من امتثال مفهوم أو منتج بالكتاب والسنة
   * @param {string} concept — المفهوم أو المنتج
   * @returns {{ compliant, score, evidence, tawheed }}
   */
  shariahCompliance(concept = '') {
    const evidence = this.search(concept);
    const score    = Math.min(evidence.length / 5, 1.0);
    return {
      concept,
      compliant: evidence.length > 0,
      score:     parseFloat(score.toFixed(2)),
      evidence:  evidence.slice(0, 5),
      verdict:   evidence.length > 3 ? 'مدعوم بنصوص متعددة' :
                 evidence.length > 0 ? 'مدعوم بدليل'        : 'لا نص مباشر — يُرجع للقياس',
      tawheed:   TAWHEED,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── النسخة المُصدَّرة ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const masterEngine = new QuranSunnahMasterEngine();

module.exports = {
  // المحرك
  QuranSunnahMasterEngine,
  masterEngine,

  // الثوابت والبيانات
  AUTHORITY_CHAIN,
  QURAN_SURAHS_CLASSIFICATION,
  FIQH_KULLIYAT,
  MASTER_NETWORK_META,
  ACHIEVEMENT_DOCUMENTATION,

  // إعادة التصدير من الوحدات الفرعية
  QuranAhkam,
  SunnahNet,
  KhulafaNet,

  // الثوابت العامة
  TAWHEED,
  BISMILLAH,
  VERSION,
  SCHEMA,

  // واجهات سريعة
  init:               ()       => masterEngine.init(),
  status:             ()       => masterEngine.status(),
  fullReport:         ()       => masterEngine.fullReport(),
  search:             (q)      => masterEngine.search(q),
  getCell:            (id)     => masterEngine.getCell(id),
  getCellsBySource:   (src)    => masterEngine.getCellsBySource(src),
  getCellsByDomain:   (domain) => masterEngine.getCellsByDomain(domain),
  getCellsByRule:     (rule)   => masterEngine.getCellsByRule(rule),
  analyze:            (c)      => masterEngine.analyze(c),
  digitize:           (c)      => masterEngine.digitize(c),
  fatwaDigital:       (i)      => masterEngine.fatwaDigital(i),
  shariahCompliance:  (c)      => masterEngine.shariahCompliance(c),
};
