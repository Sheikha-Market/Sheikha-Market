/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA MASTER NEURAL CELL NETWORK                                           ║
 * ║  شبكة الخلايا العصبية الكبرى — المنظومة الشاملة                             ║
 * ║  تُنفِّذ بروتوكول شيخة · 7 مجالات · 6 طبقات · 120 خلية · 64-dim           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 * ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ﴾ — إبراهيم: ٢٤
 * «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي
 *
 * ┌──────────────────────────── المعمارية الكاملة ─────────────────────────────┐
 * │                                                                              │
 * │  INPUT [text/command/query]                                                  │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 0: Embedding (64-dim, 180 keywords)                                  │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 1: Domain Detection (7 cells — sigmoid)                               │
 * │    Language │ Sciences │ Shariah │ Commerce │ Production │ Governance │ Univ │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 2: Language + Text (20 cells — ReLU/Tanh)                             │
 * │    NLP · Syntax · Morphology · Semantics · Pragmatics · Patterns             │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 3: Sciences + Commerce (22 cells — mixed)                             │
 * │    14 sciences + 8 commerce cells                                            │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 4: Production + Governance (14 cells — mixed)                         │
 * │    8 PM cells + 6 governance cells                                           │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 5: Knowledge / Quran+Sunnah (21 cells — mixed)                       │
 * │    14 core knowledge + 7 fiqh-ruling cells                                   │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 6: Aggregation + Output (16 cells — sigmoid/tanh)                    │
 * │    8 aggregation + 8 output-gate cells                                       │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  OUTPUT: { domain, rule, quranRef, confidence, action, topCells, response } │
 * └──────────────────────────────────────────────────────────────────────────────┘
 *
 *  إجمالي الخلايا: 7+20+22+14+21+16 = 100 خلية متخصصة
 *  إجمالي المعاملات (params): ~6,700 وزن + تحيز
 *  التضمين: 64-بُعد · 180 كلمة مفتاحية
 *  المُحسِّن: Adam (β1=0.9, β2=0.999) + He init
 *  الكشف: هجين (شبكة عصبية + قاموس مفردات)
 *
 * @module sheikha-master-neural-cell-network
 * @version 1.0.0
 * @schema sheikha/master-ncn-v1
 * @implements SheikhaProtocol v2.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const EventEmitter = require('events');

// ── استيراد بروتوكول شيخة ─────────────────────────────────────────────────────
let _protocol = null;
try {
  _protocol = require('./sheikha-protocol');
} catch (_) { /* اختياري */ }

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الأول: ثوابت وأدوات رياضية ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';
const EMBED_DIM = 64;  // أبعاد التضمين

/** دوال التفعيل */
const ACT = Object.freeze({
  relu:      x => Math.max(0, x),
  leakyRelu: x => x >= 0 ? x : 0.01 * x,
  sigmoid:   x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
  tanh:      x => Math.tanh(x),
  gelu:      x => 0.5 * x * (1 + Math.tanh(0.7978845608 * (x + 0.044715 * x * x * x))),
  linear:    x => x,
  softmax(arr) {
    const mx = Math.max(...arr);
    const e  = arr.map(v => Math.exp(v - mx));
    const s  = e.reduce((a, b) => a + b, 0) || 1e-9;
    return e.map(v => v / s);
  },
  dRelu:     (x, _) => x > 0 ? 1 : 0,
  dSigmoid:  (_, o)  => o * (1 - o),
  dTanh:     (_, o)  => 1 - o * o,
  dLeakyRelu:(x, _)  => x >= 0 ? 1 : 0.01,
  dLinear:   ()      => 1,
});

/** تهيئة الأوزان */
const INIT = Object.freeze({
  he(n, m = 1) {
    const std = Math.sqrt(2 / n);
    return Array.from({ length: n * m }, () => (Math.random() * 2 - 1) * std);
  },
  xavier(n, m = 1) {
    const lim = Math.sqrt(6 / (n + m));
    return Array.from({ length: n * m }, () => (Math.random() * 2 - 1) * lim);
  },
  zeros: n => new Array(n).fill(0),
});

/** عمليات المتجهات */
const VEC = Object.freeze({
  dot:    (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * (b[i] || 0); return s; },
  add:    (a, b) => a.map((v, i) => v + (b[i] || 0)),
  scale:  (a, s) => a.map(v => v * s),
  norm:   a => Math.sqrt(a.reduce((s, v) => s + v * v, 0)) || 1e-9,
  cosine: (a, b) => VEC.dot(a, b) / (VEC.norm(a) * VEC.norm(b)),
  clip:   (v, lo, hi) => Math.min(hi, Math.max(lo, v)),
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الثاني: الخلية العصبية (SNC-compliant) ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * MasterNeuralCell — خلية عصبية متوافقة مع بروتوكول شيخة (SNC v1.0)
 *
 * البنية البيولوجية → الرقمية:
 *  تشعبات (dendrites) → المداخل (inputs)
 *  جسم الخلية (soma)  → الجمع والتفعيل
 *  محور (axon)         → الإخراج
 *  مشابك (synapses)    → الأوزان (weights)
 *
 * ﴿وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ﴾ — الذاريات: ٢١
 */
class MasterNeuralCell {
  constructor(id, nameAr, inSize, activation = 'relu', meta = {}) {
    this.id         = id;
    this.nameAr     = nameAr;
    this.inSize     = inSize;
    this.activation = activation;
    this.meta       = { ...meta };

    // الأوزان (He init)
    this.weights = INIT.he(inSize);
    this.bias    = 0;

    // حالة التمرير
    this.lastInput  = null;
    this.lastRaw    = 0;
    this.lastOutput = 0;

    // Adam state
    this.mW = INIT.zeros(inSize);
    this.vW = INIT.zeros(inSize);
    this.mB = 0; this.vB = 0;
    this.t  = 0;

    this.actFn  = ACT[activation]  || ACT.relu;
    this.dActFn = ACT[`d${activation.charAt(0).toUpperCase()}${activation.slice(1)}`] || ACT.dRelu;

    // SNC validation
    if (inSize < 1) throw new Error(`[SNC] inSize يجب ≥ 1 للخلية ${id}`);
  }

  /** التمرير الأمامي */
  forward(input) {
    this.lastInput  = input.length === this.inSize ? input : input.slice(0, this.inSize);
    this.lastRaw    = VEC.dot(this.weights, this.lastInput) + this.bias;
    this.lastOutput = this.actFn(this.lastRaw);
    return this.lastOutput;
  }

  /** الانتشار الخلفي مع Adam */
  backward(dOut, lr = 0.001) {
    const dAct = this.dActFn(this.lastRaw, this.lastOutput) * dOut;
    const dInput = this.weights.map(w => dAct * w);
    this.t++;
    const β1 = 0.9, β2 = 0.999, ε = 1e-8;
    for (let i = 0; i < this.inSize; i++) {
      const g = dAct * this.lastInput[i];
      this.mW[i] = β1 * this.mW[i] + (1 - β1) * g;
      this.vW[i] = β2 * this.vW[i] + (1 - β2) * g * g;
      const m̂ = this.mW[i] / (1 - β1 ** this.t);
      const v̂ = this.vW[i] / (1 - β2 ** this.t);
      this.weights[i] = VEC.clip(this.weights[i] - lr * m̂ / (Math.sqrt(v̂) + ε), -10, 10);
    }
    this.mB = β1 * this.mB + (1 - β1) * dAct;
    this.vB = β2 * this.vB + (1 - β2) * dAct * dAct;
    const m̂B = this.mB / (1 - β1 ** this.t);
    const v̂B = this.vB / (1 - β2 ** this.t);
    this.bias -= lr * m̂B / (Math.sqrt(v̂B) + ε);
    return dInput;
  }

  reset() {
    this.weights = INIT.he(this.inSize);
    this.bias    = 0;
    this.mW = INIT.zeros(this.inSize); this.vW = INIT.zeros(this.inSize);
    this.mB = 0; this.vB = 0; this.t = 0;
    this.lastInput = null; this.lastRaw = 0; this.lastOutput = 0;
    return this;
  }

  state() {
    return {
      id: this.id, nameAr: this.nameAr, inSize: this.inSize,
      activation: this.activation, lastOutput: this.lastOutput, t: this.t,
      ...this.meta,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الثالث: طبقة الخلايا ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class NeuralCellLayer {
  constructor(name, type, cells) {
    this.name    = name;
    this.type    = type;
    this.cells   = cells;
    this.size    = cells.length;
    this.lastOut = null;
  }

  forward(input) {
    this.lastOut = this.cells.map(c => c.forward(input));
    return this.lastOut;
  }

  backward(dOuts, lr = 0.001) {
    if (!Array.isArray(dOuts)) dOuts = new Array(this.size).fill(dOuts);
    const dIn = new Array(this.cells[0].inSize).fill(0);
    for (let i = 0; i < this.size; i++) {
      const d = this.cells[i].backward(dOuts[i] || 0, lr);
      for (let j = 0; j < dIn.length; j++) dIn[j] += d[j] || 0;
    }
    return dIn;
  }

  topK(k = 3) {
    return this.cells
      .map((c, i) => ({ i, id: c.id, nameAr: c.nameAr, score: c.lastOutput, meta: c.meta }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  activations() { return this.cells.map(c => c.lastOutput); }
  reset()       { this.cells.forEach(c => c.reset()); return this; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الرابع: طبقة التضمين الكبرى (64-dim, 180 كلمة) ────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const VOCAB = Object.freeze({
  // التوحيد والدين (20)
  'توحيد':1,'الله':2,'قرآن':3,'سنة':4,'فقه':5,'شريعة':6,'حلال':7,'حرام':8,
  'زكاة':9,'صلاة':10,'حج':11,'عبادة':12,'تقوى':13,'إخلاص':14,'توكل':15,
  'صدق':16,'أمانة':17,'عدل':18,'رحمة':19,'حكمة':20,
  // اللغة (20)
  'لغة':21,'نحو':22,'صرف':23,'دلالة':24,'تداولية':25,'معنى':26,'كلمة':27,
  'جملة':28,'فعل':29,'اسم':30,'حرف':31,'بيان':32,'خطاب':33,'عبارة':34,
  'لسان':35,'بلاغة':36,'فصاحة':37,'نص':38,'ترجمة':39,'لسانيات':40,
  // العلوم (20)
  'رياضيات':41,'فيزياء':42,'كيمياء':43,'أحياء':44,'فلك':45,'هندسة':46,
  'طب':47,'جغرافيا':48,'تاريخ':49,'منطق':50,'اقتصاد':51,'نفس':52,'اجتماع':53,
  'حاسب':54,'علم':55,'علوم':56,'بحث':57,'تجربة':58,'نظرية':59,'قانون':60,
  // الحاسب والذكاء الاصطناعي (20)
  'خوارزمية':61,'برمجة':62,'كود':63,'شبكة':64,'بيانات':65,'ذكاء':66,'نموذج':67,
  'تدريب':68,'خلية':69,'طبقة':70,'تفعيل':71,'وزن':72,'تحيز':73,'تعلم':74,
  'معالجة':75,'تصنيف':76,'استنتاج':77,'شبكة_عصبية':78,'تعلم_الآلة':79,'ذكاء_اصطناعي':80,
  // التجارة والاقتصاد (20)
  'سوق':81,'بيع':82,'شراء':83,'عقد':84,'توريد':85,'مخزن':86,'طلب':87,'توصيل':88,
  'دفع':89,'فاتورة':90,'ضريبة':91,'ربح':92,'خسارة':93,'حساب':94,'ميزانية':95,
  'تسعير':96,'منتج':97,'سعر':98,'خصم':99,'تاجر':100,
  // الإنتاج والتشغيل (20)
  'إنتاج':101,'تشغيل':102,'آلة':103,'مصنع':104,'جدولة':105,'مراقبة':106,
  'تحسين':107,'أداء':108,'جودة':109,'صيانة':110,'كفاءة':111,'طاقة':112,
  'مورد':113,'سلسلة_توريد':114,'لوجستيات':115,'شحن':116,'مستودع':117,
  'أتمتة':118,'تحكم':119,'نظام_تشغيل':120,
  // الحوكمة والإدارة (20)
  'حوكمة':121,'إدارة':122,'قرار':123,'سياسة':124,'رقابة':125,'امتثال':126,
  'معيار':127,'تنفيذ':128,'مؤسسة':129,'هيكل':130,'خطة':131,'استراتيجية':132,
  'قيادة':133,'تنظيم':134,'تقرير':135,'تدقيق':136,'شفافية':137,'مساءلة':138,
  'أخلاقيات':139,'مسؤولية':140,
  // الكوني والشامل (20)
  'كون':141,'خلق':142,'آيات':143,'وجود':144,'إبداع':145,'صنع':146,'إتقان':147,
  'سماء':148,'أرض':149,'نجوم':150,'ميزان':151,'نظام':152,'كوني':153,'كل':154,
  'شيء':155,'جميع':156,'شامل':157,'عالم':158,'طبيعة':159,'ظاهرة':160,
  // إضافي (20)
  'تحليل':161,'تقييم':162,'فهم':163,'تطوير':164,'تصميم':165,'ابتكار':166,
  'مشروع':167,'هدف':168,'نتيجة':169,'حل':170,'مشكلة':171,'سؤال':172,
  'إجابة':173,'معلومة':174,'معرفة':175,'ثقة':176,'دقة':177,'سرعة':178,
  'أمان':179,'خصوصية':180,
});

class MasterEmbeddingLayer {
  constructor() {
    this.dim   = EMBED_DIM;
    this.vocab = VOCAB;
    // إنشاء متجهات محددة لكل كلمة
    this._vecs = {};
    for (const [word, idx] of Object.entries(VOCAB)) {
      this._vecs[word] = this._seedVec(idx);
    }
  }

  _seedVec(seed) {
    const v = new Float32Array(EMBED_DIM);
    let s = seed * 1664525 + 1013904223;
    for (let i = 0; i < EMBED_DIM; i++) {
      s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
      v[i] = ((s >>> 0) / 0xFFFFFFFF) * 2 - 1;
    }
    // نرمّل
    let n = 0; for (let i = 0; i < EMBED_DIM; i++) n += v[i] * v[i];
    n = Math.sqrt(n) || 1;
    for (let i = 0; i < EMBED_DIM; i++) v[i] /= n;
    return Array.from(v);
  }

  encode(text = '') {
    const tokens = text
      .replace(/[^\u0600-\u06FFa-zA-Z\s_]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (tokens.length === 0) return this._seedVec(0);

    const sum = new Float32Array(EMBED_DIM);
    let   cnt = 0;

    for (const tok of tokens) {
      const v = this._vecs[tok];
      if (v) {
        for (let i = 0; i < EMBED_DIM; i++) sum[i] += v[i];
        cnt++;
      }
    }

    if (cnt === 0) {
      // OOV — fallback hash
      let h = 5381;
      for (let i = 0; i < text.length; i++) h = (h * 33 ^ text.charCodeAt(i)) >>> 0;
      return this._seedVec(h % 10000);
    }

    for (let i = 0; i < EMBED_DIM; i++) sum[i] /= cnt;
    let n = 0; for (let i = 0; i < EMBED_DIM; i++) n += sum[i] * sum[i];
    n = Math.sqrt(n) || 1;
    const out = new Array(EMBED_DIM);
    for (let i = 0; i < EMBED_DIM; i++) out[i] = sum[i] / n;
    return out;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الخامس: بناء الطبقات ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── الطبقة 1: كشف المجال (7 خلايا) ───────────────────────────────────────────
function buildDomainLayer() {
  return new NeuralCellLayer('DOMAIN', 'DOMAIN', [
    new MasterNeuralCell('DM01','كاشف اللغة',     EMBED_DIM,'sigmoid',{ domain:'language',   color:'🔤' }),
    new MasterNeuralCell('DM02','كاشف العلوم',     EMBED_DIM,'sigmoid',{ domain:'sciences',   color:'🔬' }),
    new MasterNeuralCell('DM03','كاشف الشريعة',    EMBED_DIM,'sigmoid',{ domain:'shariah',    color:'☪️'  }),
    new MasterNeuralCell('DM04','كاشف التجارة',    EMBED_DIM,'sigmoid',{ domain:'commerce',   color:'📈' }),
    new MasterNeuralCell('DM05','كاشف الإنتاج',    EMBED_DIM,'sigmoid',{ domain:'production', color:'🏭' }),
    new MasterNeuralCell('DM06','كاشف الحوكمة',    EMBED_DIM,'sigmoid',{ domain:'governance', color:'⚖️'  }),
    new MasterNeuralCell('DM07','كاشف الكوني',     EMBED_DIM,'sigmoid',{ domain:'universal',  color:'🌐' }),
  ]);
}

// ── الطبقة 2: اللغة (20 خلية) ─────────────────────────────────────────────────
function buildLanguageLayer() {
  return new NeuralCellLayer('LANGUAGE', 'SPECIALIZED', [
    new MasterNeuralCell('LG01','خلية النحو الواضح',       EMBED_DIM,'relu',  { domain:'language', rule:'CLEAR_SYNTAX',         quranRef:'البقرة:٨٣'  }),
    new MasterNeuralCell('LG02','خلية الأمر الأول',         EMBED_DIM,'relu',  { domain:'language', rule:'READ_FIRST',           quranRef:'العلق:١'    }),
    new MasterNeuralCell('LG03','خلية التوطين',             EMBED_DIM,'sigmoid',{ domain:'i18n',    rule:'LOCALIZED_SYNTAX',     quranRef:'إبراهيم:٤'  }),
    new MasterNeuralCell('LG04','خلية البيان',              EMBED_DIM,'relu',  { domain:'language', rule:'EXPRESSIVE_SYNTAX',    quranRef:'الرحمن:٤'   }),
    new MasterNeuralCell('LG05','خلية التسمية',             EMBED_DIM,'relu',  { domain:'naming',   rule:'NAMING_RULES',         quranRef:'البقرة:٣١'  }),
    new MasterNeuralCell('LG06','خلية الكتابة',             EMBED_DIM,'sigmoid',{ domain:'storage',  rule:'WRITE_TO_STORE',       quranRef:'العلق:٤'    }),
    new MasterNeuralCell('LG07','خلية الفطرة الدلالية',     EMBED_DIM,'tanh',  { domain:'semantics',rule:'UNIVERSAL_MEANING',    quranRef:'الروم:٣٠'   }),
    new MasterNeuralCell('LG08','خلية السياق',              EMBED_DIM,'tanh',  { domain:'semantics',rule:'CONTEXT_AWARE',        quranRef:'البقرة:٢٨٦' }),
    new MasterNeuralCell('LG09','خلية هرمية المعرفة',       EMBED_DIM,'relu',  { domain:'ai',       rule:'KNOWLEDGE_HIERARCHY',  quranRef:'يوسف:٧٦'   }),
    new MasterNeuralCell('LG10','خلية لا هلوسة',            EMBED_DIM,'sigmoid',{ domain:'ethics',   rule:'NO_HALLUCINATION',     quranRef:'الإسراء:٣٦' }),
    new MasterNeuralCell('LG11','خلية اللطف',               EMBED_DIM,'tanh',  { domain:'ux',       rule:'GENTLE_FEEDBACK',      quranRef:'آل عمران:١٥٩'}),
    new MasterNeuralCell('LG12','خلية اللوغ الهادئ',        EMBED_DIM,'relu',  { domain:'logging',  rule:'QUIET_LOGGING',        quranRef:'لقمان:١٩'   }),
    new MasterNeuralCell('LG13','خلية الأمانة المُطابَقة', EMBED_DIM,'sigmoid',{ domain:'security', rule:'TYPED_TRUST',          quranRef:'النساء:٥٨'  }),
    new MasterNeuralCell('LG14','خلية السجل الثابت',        EMBED_DIM,'relu',  { domain:'finance',  rule:'TYPED_LEDGER',         quranRef:'البقرة:٢٨٢' }),
    new MasterNeuralCell('LG15','خلية التعافي',             EMBED_DIM,'tanh',  { domain:'resilience',rule:'ERROR_RECOVERY',      hadithRef:'الترمذي:٢٤٩٩'}),
    new MasterNeuralCell('LG16','خلية لا ضرر',              EMBED_DIM,'sigmoid',{ domain:'safety',   rule:'HARMLESS_ERROR',       hadithRef:'ابن ماجه:٢٣٤١'}),
    new MasterNeuralCell('LG17','خلية التوحيد Singleton',   EMBED_DIM,'relu',  { domain:'design',   rule:'SINGLETON_TAWHEED',    quranRef:'الإخلاص:١'  }),
    new MasterNeuralCell('LG18','خلية الرقيب Observer',     EMBED_DIM,'sigmoid',{ domain:'monitoring',rule:'OBSERVER_RAQEEB',    quranRef:'ق:١٨'       }),
    new MasterNeuralCell('LG19','خلية سلسلة السلطة',        EMBED_DIM,'relu',  { domain:'governance',rule:'CHAIN_AUTHORITY',     quranRef:'النساء:٥٩'  }),
    new MasterNeuralCell('LG20','خلية استراتيجية الاجتهاد', EMBED_DIM,'tanh',  { domain:'algorithm',rule:'STRATEGY_IJTIHAD',    quranRef:'الأنفال:٦٠' }),
  ]);
}

// ── الطبقة 3: العلوم (14) + التجارة (8) = 22 خلية ─────────────────────────────
function buildSciCommerceLayer() {
  return new NeuralCellLayer('SCI_COMMERCE', 'SPECIALIZED', [
    // العلوم (14)
    new MasterNeuralCell('SC01','خلية اللسانيات',     EMBED_DIM,'relu',   { domain:'language',   science:'LINGUISTICS',  quranRef:'الرحمن:٤'    }),
    new MasterNeuralCell('SC02','خلية الرياضيات',     EMBED_DIM,'relu',   { domain:'math',       science:'MATHEMATICS',  quranRef:'النساء:١١'   }),
    new MasterNeuralCell('SC03','خلية الفيزياء',      EMBED_DIM,'tanh',   { domain:'physics',    science:'PHYSICS',      quranRef:'الذاريات:٤٧' }),
    new MasterNeuralCell('SC04','خلية الكيمياء',      EMBED_DIM,'sigmoid',{ domain:'chemistry',  science:'CHEMISTRY',    quranRef:'الأنبياء:٣٠' }),
    new MasterNeuralCell('SC05','خلية الأحياء',       EMBED_DIM,'relu',   { domain:'biology',    science:'BIOLOGY',      quranRef:'الأنبياء:٣٠' }),
    new MasterNeuralCell('SC06','خلية علم الحاسب',    EMBED_DIM,'relu',   { domain:'cs',         science:'CS',           quranRef:'العلق:١'     }),
    new MasterNeuralCell('SC07','خلية المنطق',        EMBED_DIM,'tanh',   { domain:'logic',      science:'LOGIC',        quranRef:'الحج:٤٦'     }),
    new MasterNeuralCell('SC08','خلية الاقتصاد',      EMBED_DIM,'sigmoid',{ domain:'economics',  science:'ECONOMICS',    quranRef:'البقرة:٢٧٥'  }),
    new MasterNeuralCell('SC09','خلية الطب',          EMBED_DIM,'relu',   { domain:'medicine',   science:'MEDICINE',     quranRef:'الشعراء:٨٠'  }),
    new MasterNeuralCell('SC10','خلية الفلك',         EMBED_DIM,'tanh',   { domain:'astronomy',  science:'ASTRONOMY',    quranRef:'يس:٣٨'       }),
    new MasterNeuralCell('SC11','خلية الهندسة',       EMBED_DIM,'relu',   { domain:'engineering',science:'ENGINEERING',  quranRef:'النساء:٥٨'   }),
    new MasterNeuralCell('SC12','خلية التاريخ',       EMBED_DIM,'sigmoid',{ domain:'history',    science:'HISTORY',      quranRef:'الأنعام:١١'  }),
    new MasterNeuralCell('SC13','خلية الجغرافيا',     EMBED_DIM,'relu',   { domain:'geography',  science:'GEOGRAPHY',    quranRef:'البقرة:١٤٤'  }),
    new MasterNeuralCell('SC14','خلية النفس والمجتمع',EMBED_DIM,'tanh',   { domain:'psychology', science:'PSYCHOLOGY',   quranRef:'الفجر:٢٧'    }),
    // التجارة (8)
    new MasterNeuralCell('CM01','خلية السوق الحلال',  EMBED_DIM,'relu',   { domain:'commerce',   rule:'HALAL_MARKET',     quranRef:'البقرة:٢٧٥'  }),
    new MasterNeuralCell('CM02','خلية العقد الصحيح',  EMBED_DIM,'sigmoid',{ domain:'contract',   rule:'VALID_CONTRACT',   quranRef:'المائدة:١'   }),
    new MasterNeuralCell('CM03','خلية التسعير العادل',EMBED_DIM,'relu',   { domain:'pricing',    rule:'FAIR_PRICING',     hadithRef:'أبو داود:٣٤٥٠'}),
    new MasterNeuralCell('CM04','خلية إدارة المخزن',  EMBED_DIM,'tanh',   { domain:'inventory',  rule:'INVENTORY_MGMT',   quranRef:'يوسف:٤٧'    }),
    new MasterNeuralCell('CM05','خلية التوريد',       EMBED_DIM,'relu',   { domain:'supply',     rule:'SCM_CHAIN',        quranRef:'النمل:٨٨'    }),
    new MasterNeuralCell('CM06','خلية المالية الإسلامية',EMBED_DIM,'sigmoid',{ domain:'finance',  rule:'ISLAMIC_FINANCE',  quranRef:'البقرة:٢٧٥'  }),
    new MasterNeuralCell('CM07','خلية التسليم',       EMBED_DIM,'relu',   { domain:'logistics',  rule:'DELIVERY_CHAIN',   quranRef:'النساء:٥٨'   }),
    new MasterNeuralCell('CM08','خلية الجودة',        EMBED_DIM,'relu',   { domain:'quality',    rule:'QUALITY_ITQAN',    hadithRef:'البيهقي'    }),
  ]);
}

// ── الطبقة 4: الإنتاج (8) + الحوكمة (6) = 14 خلية ────────────────────────────
function buildProdGovLayer() {
  return new NeuralCellLayer('PROD_GOV', 'SPECIALIZED', [
    // الإنتاج (8) — الآلات PM1-PM8
    new MasterNeuralCell('PM01','آلة الإنتاج العلمي',    EMBED_DIM,'relu',   { domain:'production', machine:'PM1', type:'SCIENTIFIC',   quranRef:'العلق:١'   }),
    new MasterNeuralCell('PM02','آلة الإنتاج التقني',    EMBED_DIM,'tanh',   { domain:'production', machine:'PM2', type:'TECHNICAL',    quranRef:'النمل:٨٨'  }),
    new MasterNeuralCell('PM03','آلة الإنتاج التجاري',   EMBED_DIM,'relu',   { domain:'production', machine:'PM3', type:'COMMERCIAL',   quranRef:'البقرة:٢٧٥'}),
    new MasterNeuralCell('PM04','آلة الإنتاج التشغيلي',  EMBED_DIM,'sigmoid',{ domain:'production', machine:'PM4', type:'OPERATIONAL',  quranRef:'التوبة:١٠٥'}),
    new MasterNeuralCell('PM05','آلة الإنتاج المعرفي',   EMBED_DIM,'relu',   { domain:'production', machine:'PM5', type:'KNOWLEDGE',    quranRef:'العلق:٤'   }),
    new MasterNeuralCell('PM06','آلة الإنتاج الإبداعي',  EMBED_DIM,'gelu',   { domain:'production', machine:'PM6', type:'CREATIVE',     quranRef:'الحجر:٨٦'  }),
    new MasterNeuralCell('PM07','آلة الإنتاج الاجتماعي', EMBED_DIM,'tanh',   { domain:'production', machine:'PM7', type:'SOCIAL',       quranRef:'المائدة:٢' }),
    new MasterNeuralCell('PM08','آلة الإنتاج الشرعي',    EMBED_DIM,'sigmoid',{ domain:'production', machine:'PM8', type:'SHARIA',       quranRef:'المائدة:٤٨'}),
    // الحوكمة (6)
    new MasterNeuralCell('GV01','خلية العدل والمساواة',  EMBED_DIM,'sigmoid',{ domain:'governance', rule:'JUSTICE_EQUALITY',  quranRef:'النحل:٩٠'  }),
    new MasterNeuralCell('GV02','خلية الشورى',           EMBED_DIM,'relu',   { domain:'governance', rule:'SHURA_COUNCIL',     quranRef:'الشورى:٣٨' }),
    new MasterNeuralCell('GV03','خلية الشفافية',         EMBED_DIM,'relu',   { domain:'governance', rule:'TRANSPARENCY',      quranRef:'البقرة:٢٨٢'}),
    new MasterNeuralCell('GV04','خلية المساءلة',         EMBED_DIM,'sigmoid',{ domain:'governance', rule:'ACCOUNTABILITY',   quranRef:'الزلزلة:٧' }),
    new MasterNeuralCell('GV05','خلية امتثال المعايير',  EMBED_DIM,'relu',   { domain:'governance', rule:'STANDARDS_COMPLIANCE',quranRef:'الرحمن:٩' }),
    new MasterNeuralCell('GV06','خلية حوكمة البيانات',   EMBED_DIM,'tanh',   { domain:'governance', rule:'DATA_GOVERNANCE',   quranRef:'يس:١٢'     }),
  ]);
}

// ── الطبقة 5: المعرفة الشرعية (14) + أحكام الفقه (7) = 21 خلية ──────────────
function buildKnowledgeLayer() {
  return new NeuralCellLayer('KNOWLEDGE', 'KNOWLEDGE', [
    // المعرفة (14)
    new MasterNeuralCell('KN01','خلية التوحيد الأساس',      EMBED_DIM,'relu',   { domain:'all', rule:'TAWHEED_FOUNDATION',       quranRef:'الإخلاص:١',    tier:'ABSOLUTE' }),
    new MasterNeuralCell('KN02','خلية البيان الإلهي',       EMBED_DIM,'relu',   { domain:'lang',rule:'BAYAN_OBLIGATION',         quranRef:'الرحمن:٤',     tier:'ABSOLUTE' }),
    new MasterNeuralCell('KN03','خلية الأمانة المطلقة',     EMBED_DIM,'sigmoid',{ domain:'all', rule:'AMANA_NO_LIE',             quranRef:'الإسراء:٣٦',   tier:'ABSOLUTE' }),
    new MasterNeuralCell('KN04','خلية الإتقان',             EMBED_DIM,'relu',   { domain:'all', rule:'ITQAN_EXCELLENCE',         hadithRef:'البيهقي',      tier:'ABSOLUTE' }),
    new MasterNeuralCell('KN05','خلية لا ضرر المطلق',       EMBED_DIM,'sigmoid',{ domain:'all', rule:'NO_HARM_ABSOLUTE',        hadithRef:'ابن ماجه:٢٣٤١',tier:'ABSOLUTE' }),
    new MasterNeuralCell('KN06','خلية الفطرة',              EMBED_DIM,'tanh',   { domain:'ux',  rule:'FITRAH_INTUITIVE',         quranRef:'الروم:٣٠',      tier:'LINGUISTIC'}),
    new MasterNeuralCell('KN07','خلية التكامل الكوني',      EMBED_DIM,'relu',   { domain:'all', rule:'UNIVERSAL_INTEGRATION',   quranRef:'فصلت:٥٣',       tier:'LINGUISTIC'}),
    new MasterNeuralCell('KN08','خلية التكيف',              EMBED_DIM,'tanh',   { domain:'ux',  rule:'ADAPTIVE_COMPLEXITY',     quranRef:'البقرة:٢٨٦',    tier:'LINGUISTIC'}),
    new MasterNeuralCell('KN09','خلية الاتساق الكوني',      EMBED_DIM,'relu',   { domain:'all', rule:'COSMIC_CONSISTENCY',       quranRef:'الملك:٣',       tier:'SCIENTIFIC'}),
    new MasterNeuralCell('KN10','خلية حفظ المعرفة',         EMBED_DIM,'sigmoid',{ domain:'storage',rule:'KNOWLEDGE_CONSERVATION',quranRef:'يس:١٢',         tier:'SCIENTIFIC'}),
    new MasterNeuralCell('KN11','خلية السعي للاكتمال',      EMBED_DIM,'relu',   { domain:'all', rule:'ASPIRATIONAL_COMPLETENESS',quranRef:'يوسف:٧٦',       tier:'SCIENTIFIC'}),
    new MasterNeuralCell('KN12','خلية التوافق الشرعي',      EMBED_DIM,'sigmoid',{ domain:'gov', rule:'SHARIAH_COMPLIANCE',       quranRef:'المائدة:٤٨',    tier:'SHARIAH'  }),
    new MasterNeuralCell('KN13','خلية أصل الإباحة',         EMBED_DIM,'relu',   { domain:'policy',rule:'IBAHA_DEFAULT',          quranRef:'الأنعام:١١٩',   tier:'SHARIAH'  }),
    new MasterNeuralCell('KN14','خلية التوثيق الكامل',      EMBED_DIM,'relu',   { domain:'docs', rule:'FULL_CITATION',           quranRef:'البقرة:٢٨٢',    tier:'SHARIAH'  }),
    // أحكام الفقه (7)
    new MasterNeuralCell('FQ01','خلية الفرض والواجب',       EMBED_DIM,'relu',   { domain:'fiqh', ruling:'FARD',                 quranRef:'البقرة:٤٣'      }),
    new MasterNeuralCell('FQ02','خلية المستحب والسنة',      EMBED_DIM,'sigmoid',{ domain:'fiqh', ruling:'MANDUB',               quranRef:'المزمل:٢٠'      }),
    new MasterNeuralCell('FQ03','خلية المباح',              EMBED_DIM,'relu',   { domain:'fiqh', ruling:'MUBAH',                quranRef:'الأنعام:١١٩'    }),
    new MasterNeuralCell('FQ04','خلية المكروه',             EMBED_DIM,'tanh',   { domain:'fiqh', ruling:'MAKRUH',               hadithRef:'البخاري:٥٣'    }),
    new MasterNeuralCell('FQ05','خلية الحرام والمنع',       EMBED_DIM,'sigmoid',{ domain:'fiqh', ruling:'HARAM',                quranRef:'البقرة:٢٧٥'     }),
    new MasterNeuralCell('FQ06','خلية القياس والاجتهاد',    EMBED_DIM,'relu',   { domain:'fiqh', ruling:'QIYAS',                hadithRef:'أبو داود:٣٥٧٢' }),
    new MasterNeuralCell('FQ07','خلية المصلحة العامة',      EMBED_DIM,'tanh',   { domain:'fiqh', ruling:'MASLAHA',              quranRef:'النحل:٩٠'       }),
  ]);
}

// ── الطبقة 6: التجميع والإخراج (16 خلية) ─────────────────────────────────────
function buildAggOutputLayer(aggIn) {
  return new NeuralCellLayer('AGGREGATION', 'AGGREGATION', [
    // التجميع (8)
    new MasterNeuralCell('AG01','تجميع اللغة',        aggIn,'relu',   { role:'AGG_LANGUAGE'   }),
    new MasterNeuralCell('AG02','تجميع العلوم',       aggIn,'relu',   { role:'AGG_SCIENCES'   }),
    new MasterNeuralCell('AG03','تجميع التجارة',      aggIn,'relu',   { role:'AGG_COMMERCE'   }),
    new MasterNeuralCell('AG04','تجميع الإنتاج',      aggIn,'sigmoid',{ role:'AGG_PRODUCTION' }),
    new MasterNeuralCell('AG05','تجميع المعرفة',      aggIn,'relu',   { role:'AGG_KNOWLEDGE'  }),
    new MasterNeuralCell('AG06','خلية الثقة',         aggIn,'sigmoid',{ role:'CONFIDENCE'     }),
    new MasterNeuralCell('AG07','خلية التوحيد',       aggIn,'tanh',   { role:'FINAL_UNIFY'    }),
    new MasterNeuralCell('AG08','خلية الأولوية',      aggIn,'relu',   { role:'PRIORITY'       }),
    // الإخراج (8)
    new MasterNeuralCell('OP01','بوابة الإخراج',      aggIn,'sigmoid',{ role:'OUTPUT_GATE'    }),
    new MasterNeuralCell('OP02','مقياس الثقة',        aggIn,'sigmoid',{ role:'CONFIDENCE_SCORE'}),
    new MasterNeuralCell('OP03','كاشف الأمر',         aggIn,'relu',   { role:'COMMAND_DETECT' }),
    new MasterNeuralCell('OP04','كاشف الاستشارة',     aggIn,'sigmoid',{ role:'ADVICE_DETECT'  }),
    new MasterNeuralCell('OP05','مُوجِّه الإجراء',    aggIn,'relu',   { role:'ACTION_ROUTE'   }),
    new MasterNeuralCell('OP06','محقق الامتثال',      aggIn,'sigmoid',{ role:'COMPLIANCE_CHECK'}),
    new MasterNeuralCell('OP07','مولد المرجع',        aggIn,'tanh',   { role:'REF_GENERATOR'  }),
    new MasterNeuralCell('OP08','خاتم القرار',        aggIn,'sigmoid',{ role:'DECISION_SEAL'  }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم السادس: مصنّف المجال بالمفردات ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const DOMAIN_VOCAB_PRIOR = Object.freeze({
  language:   ['لغة','نحو','صرف','دلالة','تداولية','بلاغة','فصاحة','لسان','نص','ترجمة','syntax','nlp','grammar','linguistics'],
  sciences:   ['رياضيات','فيزياء','كيمياء','أحياء','فلك','هندسة','طب','منطق','حاسب','علم','معادلة','تفاضل','تكامل','جبر'],
  shariah:    ['قرآن','سنة','فقه','شريعة','حلال','حرام','زكاة','صلاة','حج','توحيد','تقوى','إخلاص','فتوى','مذهب','عقيدة'],
  commerce:   ['بيع','شراء','عقد','توريد','مخزن','طلب','توصيل','دفع','فاتورة','سوق','ربح','خسارة','تسعير','تاجر','بضاعة'],
  production: ['إنتاج','تشغيل','آلة','مصنع','جدولة','مراقبة','تحسين','أداء','جودة','صيانة','أتمتة','تحكم','مورد'],
  governance: ['حوكمة','إدارة','قرار','سياسة','رقابة','امتثال','معيار','تنفيذ','مؤسسة','قيادة','تدقيق','شفافية'],
  universal:  ['كون','خلق','آيات','توحيد','وجود','إبداع','صنع','إتقان','سماء','أرض','نجوم','طبيعة','ظاهرة'],
});

function domainPrior(text) {
  const w = text.toLowerCase().replace(/[^\u0600-\u06FFa-zA-Z\s]/g,' ').split(/\s+/).filter(Boolean);
  const sc = {};
  for (const [d, kws] of Object.entries(DOMAIN_VOCAB_PRIOR)) {
    sc[d] = w.filter(t => kws.some(k => k.includes(t) || t.includes(k))).length;
  }
  const tot = Object.values(sc).reduce((s,v) => s+v, 0) || 1;
  const pr  = {}; for (const [d,s] of Object.entries(sc)) pr[d] = s / tot;
  const top = Object.entries(pr).sort((a,b) => b[1]-a[1])[0];
  return { top: top[0], topScore: top[1], probs: pr, scores: sc };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم السابع: شبكة الخلايا العصبية الكبرى ───────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SheikhaM asterNeuralCellNetwork
 *
 * الشبكة الكاملة التي تُنفِّذ بروتوكول شيخة وتوحّد كل المجالات
 *
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 */
class SheikhaM_asterNeuralCellNetwork extends EventEmitter {
  constructor() {
    super();

    this.name    = 'Sheikha Master Neural Cell Network';
    this.nameAr  = 'شبكة الخلايا العصبية الكبرى — شيخة';
    this.version = VERSION;
    this.schema  = 'sheikha/master-ncn-v1';
    this.tawheed = TAWHEED;

    // ── بناء طبقة التضمين ─────────────────────────────────────────────────
    this._embed   = new MasterEmbeddingLayer();

    // ── بناء الطبقات العصبية ──────────────────────────────────────────────
    this._layerDomain   = buildDomainLayer();          // L1: 7 خلايا
    this._layerLang     = buildLanguageLayer();         // L2: 20 خلية
    this._layerSciCom   = buildSciCommerceLayer();      // L3: 22 خلية
    this._layerProdGov  = buildProdGovLayer();          // L4: 14 خلية
    this._layerKnow     = buildKnowledgeLayer();        // L5: 21 خلية

    // حجم مدخل طبقة التجميع = جمع كل إشارات الطبقات السابقة
    const aggIn = 7 + 20 + 22 + 14 + 21;  // = 84
    this._layerAgg = buildAggOutputLayer(aggIn);        // L6: 16 خلية

    this._layers = [
      this._layerDomain, this._layerLang, this._layerSciCom,
      this._layerProdGov, this._layerKnow, this._layerAgg,
    ];

    // ── فهرس الخلايا الكامل ───────────────────────────────────────────────
    this._allCells = this._layers.flatMap(l => l.cells);
    this._cellMap  = new Map(this._allCells.map(c => [c.id, c]));

    // ── إحصاءات ───────────────────────────────────────────────────────────
    this._trained     = false;
    this._trainCount  = 0;
    this._queries     = 0;
    this._history     = [];

    // ── تسجيل مع البروتوكول (إذا متاح) ───────────────────────────────────
    if (_protocol) {
      try {
        _protocol.register('sheikha-master-neural-cell-network', this, {
          type: 'MASTER_NEURAL_NETWORK', version: VERSION,
        });
      } catch (_) {}
    }
  }

  // ── التمرير الأمامي الكامل ─────────────────────────────────────────────────

  forward(inputText) {
    // 1. تضمين النص (64-dim)
    const emb = this._embed.encode(inputText);

    // 2. طبقة كشف المجال (L1)
    const domSigs  = this._layerDomain.forward(emb);

    // 3. طبقة اللغة (L2)
    const langSigs = this._layerLang.forward(emb);

    // 4. طبقة العلوم + التجارة (L3)
    const sciSigs  = this._layerSciCom.forward(emb);

    // 5. طبقة الإنتاج + الحوكمة (L4)
    const prodSigs = this._layerProdGov.forward(emb);

    // 6. طبقة المعرفة الشرعية (L5)
    const knowSigs = this._layerKnow.forward(emb);

    // 7. دمج كل الإشارات → طبقة التجميع (L6)
    const combined = [...domSigs, ...langSigs, ...sciSigs, ...prodSigs, ...knowSigs];
    const aggSigs  = this._layerAgg.forward(combined);

    // 8. تحليل الإخراج
    const domProbs   = ACT.softmax(domSigs);
    const confidence = ACT.sigmoid(aggSigs[5] || 0);

    return {
      inputText,
      embedding: emb.slice(0, 10),
      layers: {
        domain:      { sigs: domSigs,  topK: this._layerDomain.topK(3),  probs: domProbs },
        language:    { sigs: langSigs, topK: this._layerLang.topK(3)     },
        sciCommerce: { sigs: sciSigs,  topK: this._layerSciCom.topK(3)   },
        prodGov:     { sigs: prodSigs, topK: this._layerProdGov.topK(3)  },
        knowledge:   { sigs: knowSigs, topK: this._layerKnow.topK(3)     },
        aggregation: { sigs: aggSigs,  topK: this._layerAgg.topK(3)      },
      },
      confidence,
    };
  }

  // ── الاستدلال الهجين ───────────────────────────────────────────────────────

  infer(inputText) {
    this._queries++;

    // الفحص الشرعي (عبر البروتوكول أو مباشرة)
    let scl = null;
    if (_protocol) {
      try { scl = _protocol.shariahCheck(inputText); } catch (_) {}
    }
    if (scl && !scl.isAllowed) {
      return {
        ok: false, blocked: true, reason: 'HARAM_CONTENT',
        message: `⛔ ${scl.issues.map(i => i.keyword).join(', ')}`,
        tawheed: TAWHEED,
      };
    }

    // تمرير أمامي
    const fwd = this.forward(inputText);

    // قاموس المجال (prior)
    const prior = domainPrior(inputText);

    // مجال هجين
    const topNeuralDomain = fwd.layers.domain.topK[0]?.meta?.domain || 'universal';
    const hybridDomain    = prior.topScore > 0.35 ? prior.top : topNeuralDomain;
    const hybridConf      = Math.max(fwd.confidence, prior.topScore > 0.35 ? prior.topScore * 0.88 : 0);

    // أفضل خلايا
    const topKnow = fwd.layers.knowledge.topK[0];
    const topLang = fwd.layers.language.topK[0];
    const topAgg  = fwd.layers.aggregation.topK[0];

    // تصنيف النص
    const isCommand = /^(احسب|نفذ|حلل|استخرج|فعل|اربط|أرسل|اعرض|قارن|ابحث|تحقق|بين|اشرح|أكمل|أنشئ|افعل|ابن)/u.test(inputText.trim());
    const hasQuran  = inputText.includes('﴿') || inputText.includes('آية') || inputText.includes('سورة');
    const hasCode   = /function|class|if|for|while|const|let|var|def|import|return/.test(inputText);

    const result = {
      ok:      !scl || scl.isAllowed,
      input:   inputText,
      domain:  hybridDomain,
      domainAr: { language:'اللغة', sciences:'العلوم', shariah:'الشريعة',
                   commerce:'التجارة', production:'الإنتاج', governance:'الحوكمة',
                   universal:'الكوني' }[hybridDomain] || hybridDomain,
      confidence:  parseFloat(hybridConf.toFixed(4)),
      action:      hybridConf > 0.8 ? 'EXECUTE_HIGH' : hybridConf > 0.5 ? 'EXECUTE_REVIEW' : hybridConf > 0.3 ? 'CLARIFY' : 'DEFER',
      rule:        topKnow?.meta?.rule   || 'UNIVERSAL_INTEGRATION',
      quranRef:    topKnow?.meta?.quranRef || 'فصلت:٥٣',
      topCells: [
        topLang  && { id: topLang.id,  name: topLang.nameAr,  score: topLang.score?.toFixed(4),  layer: 'LANGUAGE'   },
        fwd.layers.sciCommerce.topK[0] && { id: fwd.layers.sciCommerce.topK[0].id, name: fwd.layers.sciCommerce.topK[0].nameAr, score: fwd.layers.sciCommerce.topK[0].score?.toFixed(4), layer: 'SCI_COMMERCE' },
        topKnow  && { id: topKnow.id,  name: topKnow.nameAr,  score: topKnow.score?.toFixed(4),  layer: 'KNOWLEDGE'  },
        topAgg   && { id: topAgg.id,   name: topAgg.nameAr,   score: topAgg.score?.toFixed(4),   layer: 'AGGREGATION'},
      ].filter(Boolean),
      type: isCommand ? 'COMMAND' : hasQuran ? 'QURANIC' : hasCode ? 'CODE' : 'TEXT',
      prior,
      scl,
      tawheed: TAWHEED,
    };

    this.emit('inferred', { domain: hybridDomain, confidence: hybridConf });
    return result;
  }

  /** معالجة كاملة (مع البروتوكول) */
  process(inputText) {
    if (_protocol) {
      try {
        return _protocol.process(inputText);
      } catch (_) {}
    }
    return this.infer(inputText);
  }

  // ── الانتشار الخلفي والتدريب ───────────────────────────────────────────────

  trainOnSample(text, domainIdx = 0, lr = 0.001) {
    const fwd = this.forward(text);

    // هدف طبقة التجميع
    const target = new Array(16).fill(0);
    target[domainIdx % 16] = 1;
    const aggGrad = this._layerAgg.cells.map((c, i) => c.lastOutput - target[i]);

    // انتشار خلفي
    const dFromAgg = this._layerAgg.backward(aggGrad, lr);
    const dD  = dFromAgg.slice(0,  7);
    const dL  = dFromAgg.slice(7,  27);
    const dSC = dFromAgg.slice(27, 49);
    const dPG = dFromAgg.slice(49, 63);
    const dK  = dFromAgg.slice(63, 84);

    this._layerDomain.backward(dD,   lr);
    this._layerLang.backward(dL,     lr);
    this._layerSciCom.backward(dSC,  lr);
    this._layerProdGov.backward(dPG, lr);
    this._layerKnow.backward(dK,     lr);

    return aggGrad.reduce((s, d) => s + d * d, 0) / aggGrad.length;
  }

  train(samples, epochs = 10, lr = 0.001) {
    console.log(`🧠 [MasterNCN] بدء التدريب: ${samples.length} عينة × ${epochs} حقبة`);
    const hist = [];
    for (let e = 0; e < epochs; e++) {
      let total = 0;
      for (const s of samples) total += this.trainOnSample(s.text, s.domainIdx || 0, lr);
      const avg = parseFloat((total / samples.length).toFixed(6));
      hist.push({ epoch: e + 1, loss: avg });
      if (e === 0 || (e+1) % Math.max(1, Math.floor(epochs/4)) === 0)
        console.log(`   حقبة ${e+1}/${epochs} — خسارة: ${avg}`);
    }
    this._trained = true; this._trainCount++;
    this._history.push({ id: this._trainCount, epochs, n: samples.length, hist });
    console.log(`✅ [MasterNCN] اكتمل — آخر خسارة: ${hist[hist.length-1].loss}`);
    return hist;
  }

  /** تدريب تلقائي على المعرفة المدمجة (14 مجال × 2 حقبة = 20 حقبة) */
  trainOnBuiltinCorpus() {
    const corpus = [
      { text:'لغة نحو صرف دلالة تداولية بلاغة فصاحة لسان نص',             domainIdx:0 },
      { text:'كلمة جملة فعل اسم حرف بيان خطاب عبارة ترجمة لسانيات',        domainIdx:0 },
      { text:'رياضيات فيزياء كيمياء أحياء فلك هندسة طب منطق حاسب علم',     domainIdx:1 },
      { text:'معادلة تفاضل تكامل مشتقة متجه مصفوفة جبر هندسة احتمال',       domainIdx:1 },
      { text:'قرآن سنة فقه شريعة حلال حرام زكاة صلاة حج توحيد تقوى',        domainIdx:2 },
      { text:'إخلاص توكل صدق أمانة عدل رحمة حكمة فتوى مذهب عقيدة',         domainIdx:2 },
      { text:'بيع شراء عقد توريد مخزن طلب توصيل دفع فاتورة سوق ربح',        domainIdx:3 },
      { text:'تسعير منتج سعر خصم تاجر بضاعة شحن جمارك استيراد تصدير',      domainIdx:3 },
      { text:'إنتاج تشغيل آلة مصنع جدولة مراقبة تحسين أداء جودة صيانة',    domainIdx:4 },
      { text:'أتمتة تحكم مورد سلسلة_توريد لوجستيات شحن مستودع أتمتة كفاءة', domainIdx:4 },
      { text:'حوكمة إدارة قرار سياسة رقابة امتثال معيار تنفيذ قيادة تدقيق', domainIdx:5 },
      { text:'شفافية مساءلة أخلاقيات مسؤولية تنظيم هيكل استراتيجية خطة',    domainIdx:5 },
      { text:'كون خلق آيات وجود إبداع صنع إتقان سماء أرض نجوم ميزان',       domainIdx:6 },
      { text:'نظام كوني كل شيء جميع شامل طبيعة ظاهرة وجود حق باطل ظاهر',   domainIdx:6 },
    ];
    return this.train(corpus, 20, 0.002);
  }

  // ── مقارنة نصين ───────────────────────────────────────────────────────────
  compare(t1, t2) {
    const e1 = this._embed.encode(t1);
    const e2 = this._embed.encode(t2);
    const sim = parseFloat(VEC.cosine(e1, e2).toFixed(4));
    return {
      text1: t1, text2: t2, similarity: sim,
      level: sim > 0.9 ? 'متطابق تقريباً' : sim > 0.7 ? 'متشابه جداً' : sim > 0.5 ? 'متشابه' : sim > 0.3 ? 'قريب' : 'مختلف',
    };
  }

  /** بحث في الخلايا */
  searchCells(q = '') {
    const sq = q.toLowerCase();
    return this._allCells
      .filter(c => c.nameAr.includes(sq) || (c.meta.domain || '').includes(sq) || (c.meta.rule || '').includes(sq))
      .map(c => ({ id: c.id, nameAr: c.nameAr, ...c.meta }));
  }

  /** إعادة ضبط كاملة */
  reset() {
    this._layers.forEach(l => l.reset());
    this._trained = false; this._queries = 0; this._trainCount = 0; this._history = [];
    return this;
  }

  // ── الهيكل الطبولوجي ───────────────────────────────────────────────────────
  topology() {
    return {
      name:    this.name,
      nameAr:  this.nameAr,
      version: this.version,
      tawheed: TAWHEED,
      quranic: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
      protocol: 'SheikhaProtocol v2.0.0',
      architecture: {
        embeddingDim:   EMBED_DIM,
        vocabSize:      Object.keys(VOCAB).length,
        totalLayers:    this._layers.length,
        totalCells:     this._allCells.length,
        totalWeights:   this._allCells.reduce((s, c) => s + c.inSize, 0),
        totalParams:    this._allCells.reduce((s, c) => s + c.inSize + 1, 0),
        layers: [
          { id:1, name:'Domain Detection',       type:'DOMAIN',      cells:7,  dim:EMBED_DIM,   activation:'sigmoid' },
          { id:2, name:'Language & Text',         type:'SPECIALIZED', cells:20, dim:EMBED_DIM,   activation:'mixed'   },
          { id:3, name:'Sciences + Commerce',     type:'SPECIALIZED', cells:22, dim:EMBED_DIM,   activation:'mixed'   },
          { id:4, name:'Production + Governance', type:'SPECIALIZED', cells:14, dim:EMBED_DIM,   activation:'mixed'   },
          { id:5, name:'Knowledge (Quran+Sunnah)',type:'KNOWLEDGE',   cells:21, dim:EMBED_DIM,   activation:'mixed'   },
          { id:6, name:'Aggregation + Output',    type:'AGGREGATION', cells:16, dim:7+20+22+14+21, activation:'mixed' },
        ],
      },
      training: {
        status:    this._trained ? 'مُدرَّبة' : 'لم تُدرَّب بعد',
        sessions:  this._trainCount,
        algorithm: 'Adam (β1=0.9, β2=0.999, ε=1e-8)',
        init:      'He initialization',
        loss:      'MSE',
        history:   this._history.map(h => ({
          id: h.id, epochs: h.epochs, samples: h.n,
          finalLoss: h.hist[h.hist.length-1]?.loss,
        })),
      },
      domains: Object.keys(DOMAIN_VOCAB_PRIOR),
      stats: { queriesProcessed: this._queries },
    };
  }

  status() {
    return {
      engine:      this.name,
      nameAr:      this.nameAr,
      version:     this.version,
      protocol:    'SheikhaProtocol v2.0.0',
      totalCells:  this._allCells.length,
      totalLayers: this._layers.length,
      totalParams: this._allCells.reduce((s, c) => s + c.inSize + 1, 0),
      trained:     this._trained,
      sessions:    this._trainCount,
      queries:     this._queries,
      tawheed:     TAWHEED,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Singleton ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

let _instance = null;

function getNetwork() {
  if (!_instance) {
    _instance = new SheikhaM_asterNeuralCellNetwork();
    _instance.trainOnBuiltinCorpus();
  }
  return _instance;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── التصدير ───────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // الفئة الرئيسية
  SheikhaM_asterNeuralCellNetwork,
  MasterNeuralCell,
  NeuralCellLayer,
  MasterEmbeddingLayer,

  // المصانع
  buildDomainLayer,
  buildLanguageLayer,
  buildSciCommerceLayer,
  buildProdGovLayer,
  buildKnowledgeLayer,
  buildAggOutputLayer,

  // الأدوات
  ACT, INIT, VEC,
  VOCAB, DOMAIN_VOCAB_PRIOR,
  domainPrior,

  // Singleton
  getNetwork,

  // ثوابت
  TAWHEED, BISMILLAH, VERSION, EMBED_DIM,

  // واجهات سريعة
  infer:       t       => getNetwork().infer(t),
  process:     t       => getNetwork().process(t),
  compare:    (a, b)   => getNetwork().compare(a, b),
  forward:     t       => getNetwork().forward(t),
  train:      (s,e,lr) => getNetwork().train(s, e, lr),
  searchCells: q       => getNetwork().searchCells(q),
  topology:    ()      => getNetwork().topology(),
  status:      ()      => getNetwork().status(),
};
