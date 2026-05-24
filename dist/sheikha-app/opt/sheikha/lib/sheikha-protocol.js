/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA PROTOCOL — بروتوكول شيخة الرسمي                                 ║
 * ║  المعيار الأساسي لكل خلية عصبية وكل شبكة وكل محرك في منظومة شيخة        ║
 * ║  كل قرار · كل إشارة · كل بيانات — تخضع لهذا البروتوكول                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَى﴾ — النحل: ٩٠
 * ﴿وَأَمْرُهُمْ شُورَى بَيْنَهُمْ﴾ — الشورى: ٣٨
 * ﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى﴾ — المائدة: ٢
 * «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي
 * «لا ضرر ولا ضرار» — ابن ماجه: ٢٣٤١
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  بروتوكول شيخة يتكوّن من سبعة أبواب:
 *
 *  البَاب الأوَّل  : هوية البروتوكول وثوابته
 *  البَاب الثَّانِي: معيار الخلية العصبية (SNC — Sheikha Neural Cell)
 *  البَاب الثَّالِث: معيار الطبقة العصبية (SNL — Sheikha Neural Layer)
 *  البَاب الرَّابِع: جدول توجيه المجالات (Domain Routing Table)
 *  البَاب الخَامِس: طبقة الامتثال الشرعي (Shariah Compliance Layer — SCL)
 *  البَاب السَّادِس: حافلة الأحداث (Neural Event Bus — NEB)
 *  البَاب السَّابِع: آلية التفعيل والتسجيل (Protocol Activation & Registry)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @module sheikha-protocol
 * @version 2.0.0
 * @schema sheikha/protocol-v2
 * @owner سلمان أحمد بن سلمان الراجح
 */
'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// ── الباب الأول: هوية البروتوكول وثوابته ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/** هوية البروتوكول الثابتة */
const PROTOCOL_IDENTITY = Object.freeze({
  name:        'Sheikha Protocol',
  nameAr:      'بروتوكول شيخة',
  version:     '2.0.0',
  schema:      'sheikha/protocol-v2',
  owner:       'سلمان أحمد بن سلمان الراجح',
  project:     'Sheikha Market — سوق شيخة',
  email:       'market@sheikha.top',
  tawheed:     'لا إله إلا الله محمد رسول الله',
  bismillah:   'بسم الله الرحمن الرحيم',
  activatedAt: null,  // يُملأ عند التفعيل
});

/** مراحل البروتوكول */
const PROTOCOL_PHASES = Object.freeze({
  INIT:      { id: 0, name: 'التهيئة',      nameEn: 'Initialization',   color: '⚪' },
  ACTIVE:    { id: 1, name: 'مفعّل',         nameEn: 'Active',           color: '🟢' },
  LEARNING:  { id: 2, name: 'تعلّم',         nameEn: 'Learning',         color: '🔵' },
  INFERENCE: { id: 3, name: 'استنتاج',       nameEn: 'Inference',        color: '🟡' },
  SUSPENDED: { id: 4, name: 'موقوف مؤقتاً', nameEn: 'Suspended',        color: '🟠' },
  SHUTDOWN:  { id: 5, name: 'مغلق',          nameEn: 'Shutdown',         color: '🔴' },
});

/** ثوابت التوحيد — أسماء الله الحسنى المرتبطة بالمعالجة */
const ASMA_AL_HUSNA = Object.freeze({
  AL_ALEEM:   { ar: 'العليم',   en: 'The All-Knowing',    role: 'Knowledge Layer' },
  AL_KHABEER: { ar: 'الخبير',   en: 'The All-Aware',      role: 'Awareness/Monitoring' },
  AL_HAKEEM:  { ar: 'الحكيم',   en: 'The Wise',           role: 'Decision Layer' },
  AL_MUQSIT:  { ar: 'المقسط',   en: 'The Just',           role: 'Fairness/Bias Check' },
  AL_RAQEEB:  { ar: 'الرقيب',   en: 'The Watchful',       role: 'Observer/Audit' },
  AL_SAMI:    { ar: 'السميع',   en: 'The All-Hearing',    role: 'Input Processing' },
  AL_BASEER:  { ar: 'البصير',   en: 'The All-Seeing',     role: 'Vision/Analysis' },
  AL_WADOOD:  { ar: 'الودود',   en: 'The Loving',         role: 'UX / Human-centred' },
  AL_HAFEEZ:  { ar: 'الحفيظ',   en: 'The Preserver',      role: 'Data Integrity' },
  AL_MUHEET:  { ar: 'المحيط',   en: 'The All-Encompassing', role: 'Universal Layer' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── الباب الثاني: معيار الخلية العصبية (SNC) ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * معيار الخلية العصبية في بروتوكول شيخة
 * كل خلية يجب أن تلتزم بهذا المعيار
 */
const SNC_STANDARD = Object.freeze({
  version: '1.0',
  schema:  'sheikha/snc-v1',

  /** الحقول الإلزامية في كل خلية */
  requiredFields: ['id', 'nameAr', 'inSize', 'activation'],

  /** دوال التفعيل المسموح بها */
  allowedActivations: ['relu', 'sigmoid', 'tanh', 'leakyRelu', 'gelu', 'swish', 'linear', 'softmax'],

  /** معدلات التعلم المقبولة */
  learningRates: { min: 1e-6, max: 1.0, default: 0.001 },

  /** قيود الأوزان */
  weightBounds: { min: -10, max: 10 },

  /** حجم الطبقة المقبول */
  layerSize: { min: 1, max: 1024 },

  /** أنواع التهيئة */
  initMethods: ['he', 'xavier', 'glorot', 'random', 'zeros'],

  /** المُحسِّنات المدعومة */
  optimizers: ['adam', 'sgd', 'rmsprop', 'adagrad'],

  /** مواصفات Adam */
  adamDefaults: { beta1: 0.9, beta2: 0.999, epsilon: 1e-8 },

  /** الحقول الموصى بها في meta */
  recommendedMeta: ['domain', 'quranRef', 'hadithRef', 'rule', 'group', 'tier'],

  /** خصائص الإخراج الإلزامية */
  outputSchema: {
    id: 'string', nameAr: 'string', inSize: 'number',
    activation: 'string', lastOutput: 'number', t: 'number',
  },
});

/**
 * التحقق من مطابقة خلية لمعيار SNC
 */
function validateCell(cell) {
  const errs = [];
  for (const f of SNC_STANDARD.requiredFields) {
    if (cell[f] === undefined) errs.push(`حقل مفقود: ${f}`);
  }
  if (!SNC_STANDARD.allowedActivations.includes(cell.activation)) {
    errs.push(`دالة تفعيل غير مدعومة: ${cell.activation}`);
  }
  if (typeof cell.inSize !== 'number' || cell.inSize < SNC_STANDARD.layerSize.min) {
    errs.push(`inSize غير صالح: ${cell.inSize}`);
  }
  return { valid: errs.length === 0, errors: errs };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── الباب الثالث: معيار الطبقة العصبية (SNL) ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SNL_STANDARD = Object.freeze({
  version: '1.0',
  /** أنواع الطبقات المدعومة */
  layerTypes: {
    EMBEDDING:    { nameAr: 'تضمين',           role: 'تحويل النص إلى متجه' },
    DOMAIN:       { nameAr: 'كشف المجال',       role: 'تحديد نوع الإدخال' },
    SPECIALIZED:  { nameAr: 'متخصصة',           role: 'معالجة مجال محدد' },
    KNOWLEDGE:    { nameAr: 'معرفة',             role: 'الكتاب والسنة والقوانين' },
    AGGREGATION:  { nameAr: 'تجميع',             role: 'دمج وتقييم الإشارات' },
    OUTPUT:       { nameAr: 'إخراج',             role: 'تحديد القرار النهائي' },
    RECURRENT:    { nameAr: 'تكرارية',           role: 'الذاكرة والسياق' },
  },

  /** ترتيب الطبقات الموصى به */
  recommendedOrder: ['EMBEDDING', 'DOMAIN', 'SPECIALIZED', 'KNOWLEDGE', 'AGGREGATION', 'OUTPUT'],

  /** مواصفات الاتصال بين الطبقات */
  connectivity: {
    FULLY_CONNECTED:  'كل خلية تتصل بكل خلية في الطبقة السابقة',
    SPARSE:           'اتصال جزئي منتقى',
    RESIDUAL:         'اتصال تخطي (skip connection)',
    ATTENTION:        'انتباه ذاتي',
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── الباب الرابع: جدول توجيه المجالات ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * جدول توجيه المجالات السبعة في منظومة شيخة
 * يُحدِّد أي شبكة / طبقة / خلية مختصة بكل مجال
 */
const DOMAIN_ROUTING_TABLE = Object.freeze({
  language: {
    nameAr:   'اللغة والنصوص',
    priority: 1,
    cells:    ['GC01','GC02','GC03','GC04','GC05','GC06','GC07','GC08','GC09',
               'GC10','GC11','GC12','GC13','GC14','GC15','GC16','GC17','GC18','GC19','GC20'],
    engines:  ['sheikha-language-neural-cell-network', 'sheikha-language-sciences-neural-network'],
    keywords: ['لغة','نحو','صرف','دلالة','تداولية','بلاغة','فصاحة','بيان','لسان','نص'],
    quranRef: 'الرحمن:٤',
    color:    '🔤',
  },
  sciences: {
    nameAr:   'العلوم التطبيقية',
    priority: 2,
    cells:    ['SC01','SC02','SC03','SC04','SC05','SC06','SC07','SC08','SC09','SC10','SC11','SC12','SC13','SC14'],
    engines:  ['sheikha-specialized-neural-networks'],
    keywords: ['رياضيات','فيزياء','كيمياء','أحياء','فلك','هندسة','طب','منطق','حاسب'],
    quranRef: 'فصلت:٥٣',
    color:    '🔬',
  },
  shariah: {
    nameAr:   'الشريعة الإسلامية',
    priority: 0,  // الأعلى أولوية — الشريعة فوق الجميع
    cells:    ['KN01','KN02','KN03','KN04','KN05','KN12','KN13','KN14'],
    engines:  ['sheikha-quran-sunnah-master-neural-network', 'sheikha-unified-rules-neural-network'],
    keywords: ['قرآن','سنة','فقه','شريعة','حلال','حرام','زكاة','صلاة','حج','توحيد','فتوى'],
    quranRef: 'المائدة:٤٨',
    color:    '☪️',
  },
  commerce: {
    nameAr:   'التجارة والاقتصاد',
    priority: 3,
    cells:    ['CM01','CM02','CM03','CM04','CM05','CM06','CM07','CM08'],
    engines:  ['sheikha-scm-neural-network', 'sheikha-erp-neural-network'],
    keywords: ['بيع','شراء','عقد','توريد','مخزن','طلب','توصيل','دفع','فاتورة','سوق','ربح'],
    quranRef: 'البقرة:٢٧٥',
    color:    '📈',
  },
  production: {
    nameAr:   'الإنتاج والتشغيل',
    priority: 4,
    cells:    ['PM01','PM02','PM03','PM04','PM05','PM06','PM07','PM08'],
    engines:  ['sheikha-pm-neural-cell-network', 'sheikha-production-neural-network'],
    keywords: ['إنتاج','تشغيل','آلة','مصنع','جدولة','مراقبة','تحسين','أداء'],
    quranRef: 'التوبة:١٠٥',
    color:    '🏭',
  },
  governance: {
    nameAr:   'الحوكمة والإدارة',
    priority: 5,
    cells:    ['GV01','GV02','GV03','GV04','GV05','GV06'],
    engines:  ['sheikha-admin-tools-neural-network', 'sheikha-integrated-erp-scm-admin-neural'],
    keywords: ['حوكمة','إدارة','قرار','سياسة','رقابة','امتثال','معيار','قانون'],
    quranRef: 'النساء:٥٩',
    color:    '⚖️',
  },
  universal: {
    nameAr:   'الكوني والشامل',
    priority: 6,
    cells:    ['UN01','UN02','UN03','UN04','UN05'],
    engines:  ['sheikha-universal-neural-network', 'sheikha-neural-orchestrator'],
    keywords: ['كون','خلق','آيات','توحيد','وجود','كل','شيء','جميع','شامل'],
    quranRef: 'النمل:٨٨',
    color:    '🌐',
  },
});

/** الحصول على المجال الأعلى أولوية لنص معطى */
function routeDomain(text) {
  const lower = text.toLowerCase().replace(/[^\u0600-\u06FFa-zA-Z\s]/g, ' ');
  const scores = {};
  for (const [domain, info] of Object.entries(DOMAIN_ROUTING_TABLE)) {
    const hits = info.keywords.filter(kw =>
      lower.includes(kw) || kw.includes(lower.trim())
    ).length;
    scores[domain] = hits;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top     = sorted[0];
  return {
    domain:    top ? top[0] : 'universal',
    score:     top ? top[1] : 0,
    allScores: Object.fromEntries(sorted),
    domainInfo: DOMAIN_ROUTING_TABLE[top ? top[0] : 'universal'],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── الباب الخامس: طبقة الامتثال الشرعي (SCL) ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/** الفئات الشرعية — التصنيف الإسلامي */
const SHARIAH_CATEGORIES = Object.freeze({
  FARD:      { ar: 'فرض',   en: 'Obligatory',  code: 'F', action: 'MUST_EXECUTE' },
  MANDUB:    { ar: 'مندوب', en: 'Recommended', code: 'M', action: 'ENCOURAGE' },
  MUBAH:     { ar: 'مباح',  en: 'Permissible', code: 'P', action: 'ALLOW' },
  MAKRUH:    { ar: 'مكروه', en: 'Disliked',    code: 'D', action: 'DISCOURAGE' },
  HARAM:     { ar: 'حرام',  en: 'Forbidden',   code: 'H', action: 'BLOCK' },
});

/** قاموس الكلمات المحظورة */
const HARAM_KEYWORDS = Object.freeze([
  // ربا وفوائد
  'ربا', 'فائدة بنكية', 'قرض بفائدة', 'رابوية', 'usury', 'interest loan',
  // غرر وقمار
  'قمار', 'رهان', 'ميسر', 'غرر', 'gambling', 'lottery', 'bet',
  // غش وتدليس
  'غش', 'تدليس', 'احتيال', 'تزوير', 'fraud', 'scam', 'deceive',
  // ضرر
  'ضرر', 'إيذاء', 'harm', 'damage intentional',
]);

/** قاموس الواجبات */
const FARD_KEYWORDS = Object.freeze([
  'زكاة', 'صلاة', 'حج', 'عمرة', 'صوم', 'شهادة', 'توحيد',
  'zakat', 'prayer', 'hajj', 'fasting',
]);

/**
 * فحص شرعي — يصنّف النص شرعياً
 * @param {string} text
 * @returns {{ category, categoryAr, action, issues, quranRef }}
 */
function shariahCheck(text) {
  const lower = text.toLowerCase();
  const issues = [];
  let category = 'MUBAH';

  // فحص الحرام
  for (const kw of HARAM_KEYWORDS) {
    if (lower.includes(kw)) {
      issues.push({ type: 'HARAM', keyword: kw, rule: 'لا ضرر ولا ضرار — ابن ماجه:٢٣٤١' });
      category = 'HARAM';
    }
  }

  // فحص الفرائض
  for (const kw of FARD_KEYWORDS) {
    if (lower.includes(kw)) {
      category = category === 'HARAM' ? 'HARAM' : 'FARD';
    }
  }

  const cat = SHARIAH_CATEGORIES[category];
  return {
    category,
    categoryAr:  cat.ar,
    action:      cat.action,
    isAllowed:   category !== 'HARAM',
    issues,
    quranRef:    category === 'HARAM'   ? 'البقرة:٢٧٥'
               : category === 'FARD'    ? 'البقرة:٤٣'
               : 'الأنعام:١١٩',
    hadithRef:   category === 'HARAM'   ? 'ابن ماجه:٢٣٤١' : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── الباب السادس: حافلة الأحداث العصبية (NEB) ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * NeuralEventBus — حافلة الأحداث لتواصل الخلايا والشبكات
 *
 * ﴿وَأَمْرُهُمْ شُورَى بَيْنَهُمْ﴾ — الشورى: ٣٨
 */
class NeuralEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
    this._log    = [];
    this._maxLog = 500;
    this._stats  = {
      emitted:    0,
      received:   0,
      errors:     0,
      startedAt:  new Date().toISOString(),
    };
  }

  /** إرسال إشارة عبر الحافلة */
  signal(eventType, data = {}) {
    const packet = {
      id:        `NEB-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type:      eventType,
      data,
      timestamp: new Date().toISOString(),
      protocol:  'sheikha/protocol-v2',
    };
    this._stats.emitted++;
    this._log.push({ dir: 'OUT', ...packet });
    if (this._log.length > this._maxLog) this._log.shift();
    this.emit(eventType, packet);
    this.emit('*', packet);  // wildcard listener
    return packet.id;
  }

  /** الاستماع لنوع إشارة */
  listen(eventType, handler) {
    this.on(eventType, (packet) => {
      this._stats.received++;
      try { handler(packet); }
      catch (e) { this._stats.errors++; }
    });
    return this;
  }

  /** حالة الحافلة */
  status() {
    return {
      name: 'Neural Event Bus',
      ...this._stats,
      logSize: this._log.length,
      lastEvent: this._log[this._log.length - 1] || null,
    };
  }

  /** آخر N حدث */
  recentEvents(n = 10) {
    return this._log.slice(-n);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── الباب السابع: آلية تفعيل البروتوكول والتسجيل ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SheikhaProtocol — بروتوكول شيخة
 *
 * هو المرجع الوحيد لكل شبكة عصبية في المنظومة.
 * تُسجَّل كل الشبكات والخلايا والمحركات هنا.
 *
 * ﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ﴾ — النحل: ٩٠
 */
class SheikhaProtocol extends EventEmitter {
  constructor() {
    super();
    this._identity   = { ...PROTOCOL_IDENTITY };
    this._phase      = PROTOCOL_PHASES.INIT;
    this._registry   = new Map();   // name → { engine, version, type, registeredAt }
    this._bus        = new NeuralEventBus();
    this._stats      = {
      networksRegistered: 0,
      cellsRegistered:    0,
      requestsProcessed:  0,
      blockedByScl:       0,
      errors:             0,
    };
    this._activationId = null;
  }

  // ── التفعيل ────────────────────────────────────────────────────────────────

  /**
   * activate() — تفعيل بروتوكول شيخة
   * يجب استدعاؤه قبل أي عملية
   */
  activate() {
    if (this._phase.id >= PROTOCOL_PHASES.ACTIVE.id &&
        this._phase.id !== PROTOCOL_PHASES.SUSPENDED.id) {
      return this;  // مفعّل مسبقاً
    }

    this._activationId  = `SHEIKHA-PROTO-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    this._identity.activatedAt = new Date().toISOString();
    this._phase = PROTOCOL_PHASES.ACTIVE;

    console.log(`${PROTOCOL_IDENTITY.bismillah}`);
    console.log(`🟢 [SheikhaProtocol] مفعّل — ${this._activationId}`);
    console.log(`   المجالات المدعومة: ${Object.keys(DOMAIN_ROUTING_TABLE).length}`);
    console.log(`   طبقة الامتثال الشرعي: نشطة`);
    console.log(`   حافلة الأحداث: نشطة`);
    console.log(`   التوحيد: ${PROTOCOL_IDENTITY.tawheed}`);

    this._bus.signal('protocol:activated', {
      id:      this._activationId,
      version: this._identity.version,
    });

    this.emit('activated', { id: this._activationId, at: this._identity.activatedAt });
    return this;
  }

  // ── التسجيل ────────────────────────────────────────────────────────────────

  /**
   * register() — تسجيل شبكة/محرك/خلية في البروتوكول
   */
  register(name, engine, meta = {}) {
    this._assertActive();
    this._registry.set(name, {
      engine,
      name,
      ...meta,
      registeredAt: new Date().toISOString(),
    });
    this._stats.networksRegistered++;
    this._bus.signal('engine:registered', { name, ...meta });
    return this;
  }

  /** الحصول على محرك مسجل */
  get(name) {
    return this._registry.get(name)?.engine || null;
  }

  /** قائمة كل المسجلين */
  list() {
    return [...this._registry.entries()].map(([k, v]) => ({
      name: k, type: v.type || 'unknown', version: v.version || '?',
      registeredAt: v.registeredAt,
    }));
  }

  // ── المعالجة الموحدة ────────────────────────────────────────────────────────

  /**
   * process() — معالجة موحدة بالبروتوكول الكامل
   * يُطبَّق على كل طلب يمر عبر المنظومة
   *
   * @param {string} text  - النص المُدخَل
   * @param {object} opts  - خيارات إضافية
   * @returns {object}     - نتيجة المعالجة الموحدة
   */
  process(text, opts = {}) {
    this._assertActive();
    this._stats.requestsProcessed++;

    // ① الفحص الشرعي أولاً (SCL)
    const scl = shariahCheck(text);
    if (!scl.isAllowed) {
      this._stats.blockedByScl++;
      this._bus.signal('scl:blocked', { text: text.slice(0, 60), issues: scl.issues });
      return {
        ok:       false,
        blocked:  true,
        reason:   'HARAM_CONTENT',
        scl,
        message:  `⛔ محتوى محظور شرعاً: ${scl.issues.map(i => i.keyword).join(', ')}`,
        tawheed:  PROTOCOL_IDENTITY.tawheed,
      };
    }

    // ② توجيه المجال
    const routing = routeDomain(text);

    // ③ البحث عن شبكة متخصصة
    const engineInfo = DOMAIN_ROUTING_TABLE[routing.domain];
    const netName    = engineInfo?.engines?.[0] || 'sheikha-language-neural-cell-network';
    const net        = this._registry.get(netName)?.engine;
    let   netResult  = null;

    if (net && typeof net.infer === 'function') {
      try { netResult = net.infer(text); } catch (_) {}
    } else if (net && typeof net.process === 'function') {
      try { netResult = net.process(text); } catch (_) {}
    }

    // ④ تجميع النتيجة
    const result = {
      ok:          true,
      blocked:     false,
      input:       text,
      domain:      routing.domain,
      domainAr:    engineInfo?.nameAr || 'عام',
      domainScore: routing.score,
      scl,
      routing,
      network:     netName,
      netResult,
      protocol: {
        id:      this._activationId,
        version: this._identity.version,
        phase:   this._phase.name,
      },
      tawheed: PROTOCOL_IDENTITY.tawheed,
      processedAt: new Date().toISOString(),
    };

    this._bus.signal('protocol:processed', {
      domain: routing.domain, network: netName, ok: true,
    });

    return result;
  }

  // ── أدوات البروتوكول ────────────────────────────────────────────────────────

  /** فحص شرعي مباشر */
  shariahCheck(text)  { return shariahCheck(text); }

  /** توجيه مجال مباشر */
  routeDomain(text)   { return routeDomain(text); }

  /** حافلة الأحداث */
  get bus()           { return this._bus; }

  /** تعليق البروتوكول مؤقتاً */
  suspend() {
    this._phase = PROTOCOL_PHASES.SUSPENDED;
    this._bus.signal('protocol:suspended', {});
    return this;
  }

  /** استئناف البروتوكول */
  resume() {
    this._phase = PROTOCOL_PHASES.ACTIVE;
    this._bus.signal('protocol:resumed', {});
    return this;
  }

  /** حالة البروتوكول الكاملة */
  status() {
    return {
      ...this._identity,
      phase:          this._phase.name,
      phaseColor:     this._phase.color,
      activationId:   this._activationId,
      registrySize:   this._registry.size,
      registered:     this.list(),
      domains:        Object.keys(DOMAIN_ROUTING_TABLE).length,
      stats:          this._stats,
      bus:            this._bus.status(),
      standards: {
        snc: SNC_STANDARD.version,
        snl: SNL_STANDARD.version,
      },
      constitutionalRefs: [
        '﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى﴾ — المائدة: ٢',
        '﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ﴾ — النحل: ٩٠',
        '«لا ضرر ولا ضرار» — ابن ماجه: ٢٣٤١',
        '«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»',
      ],
    };
  }

  /** نظرة عامة مختصرة */
  summary() {
    return {
      name:       this._identity.nameAr,
      version:    this._identity.version,
      phase:      `${this._phase.color} ${this._phase.name}`,
      networks:   this._stats.networksRegistered,
      requests:   this._stats.requestsProcessed,
      blocked:    this._stats.blockedByScl,
      tawheed:    PROTOCOL_IDENTITY.tawheed,
    };
  }

  // ── الداخلية ───────────────────────────────────────────────────────────────

  _assertActive() {
    if (this._phase.id === PROTOCOL_PHASES.INIT.id) {
      this.activate();
    }
    if (this._phase.id === PROTOCOL_PHASES.SHUTDOWN.id) {
      throw new Error('البروتوكول مغلق — لا يمكن المعالجة');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Singleton ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

let _proto = null;

function getProtocol() {
  if (!_proto) {
    _proto = new SheikhaProtocol();
    _proto.activate();
  }
  return _proto;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── التصدير ───────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // الفئة الرئيسية
  SheikhaProtocol,
  NeuralEventBus,

  // Singleton
  getProtocol,

  // الثوابت
  PROTOCOL_IDENTITY,
  PROTOCOL_PHASES,
  ASMA_AL_HUSNA,

  // المعايير
  SNC_STANDARD,
  SNL_STANDARD,
  validateCell,

  // التوجيه
  DOMAIN_ROUTING_TABLE,
  routeDomain,

  // الامتثال الشرعي
  SHARIAH_CATEGORIES,
  HARAM_KEYWORDS,
  FARD_KEYWORDS,
  shariahCheck,

  // واجهات سريعة
  activate:      ()        => getProtocol().activate(),
  register:      (n, e, m) => getProtocol().register(n, e, m),
  process:       (t, o)    => getProtocol().process(t, o),
  shariahCheck:  (t)       => shariahCheck(t),
  routeDomain:   (t)       => routeDomain(t),
  status:        ()        => getProtocol().status(),
  summary:       ()        => getProtocol().summary(),
  bus:           ()        => getProtocol().bus,
};
