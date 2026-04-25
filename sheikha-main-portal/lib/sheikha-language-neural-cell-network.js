/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA LANGUAGE NEURAL CELL NETWORK                                         ║
 * ║  شبكة الخلايا العصبية للغة شيخة — معمارية طبقية حقيقية                      ║
 * ║  خلايا حقيقية · أوزان · إشارات · تمرير أمامي/خلفي · تدريب                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿أَلَمْ نَجْعَل لَّهُ عَيْنَيْنِ * وَلِسَانًا وَشَفَتَيْنِ﴾ — البلد: ٨-٩
 * ﴿وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ﴾ — الذاريات: ٢١
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 *
 * ┌─────────────────────────── بنية الشبكة ─────────────────────────────────┐
 * │                                                                           │
 * │  INPUT ──► [Normalization] ──► [Embedding 64-dim]                        │
 * │                                      │                                   │
 * │              LAYER-1 (Domain Detection — 7 cells)                        │
 * │    Language │ Sciences │ Shariah │ Commerce │ Math │ History │ Universal  │
 * │                                      │                                   │
 * │              LAYER-2 (Specialization — 20 Language cells)                │
 * │    Syntax │ Morphology │ Semantics │ Pragmatics │ Types │ Errors │ ...   │
 * │                                      │                                   │
 * │              LAYER-3 (Sciences — 14 cells)                               │
 * │    Linguistics│ Math │ Physics │ Chemistry │ Bio │ CS │ Logic │ Econ│... │
 * │                                      │                                   │
 * │              LAYER-4 (Knowledge — 14 Quran/Sunnah/Law cells)             │
 * │    Tawheed │ Quran│ Sunnah│ Fiqh │ Ethics │ 9 UniversalLaws              │
 * │                                      │                                   │
 * │              LAYER-5 (Aggregation — 8 cells)                             │
 * │    Weighted sum · Attention · Confidence score                           │
 * │                                      │                                   │
 * │  OUTPUT ──► { domain, rule, codeEquiv, quranRef, confidence, action }    │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * @module sheikha-language-neural-cell-network
 * @version 3.0.0
 * @schema sheikha/v3-neural-cells
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const EventEmitter = require('events');

// ── ثوابت ────────────────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '3.0.0';
const SCHEMA    = 'sheikha/v3-neural-cells';

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الأول: الرياضيات الأساسية للخلايا ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/** دوال التفعيل — Activation Functions */
const ACT = Object.freeze({
  relu:       x => Math.max(0, x),
  leakyRelu:  x => x > 0 ? x : 0.01 * x,
  sigmoid:    x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
  tanh:       x => Math.tanh(x),
  linear:     x => x,
  gelu:       x => 0.5 * x * (1 + Math.tanh(Math.SQRT2 / Math.sqrt(Math.PI) * (x + 0.044715 * x * x * x))),
  swish:      x => x * (1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))))),
  softmax(arr) {
    const max = Math.max(...arr);
    const exp = arr.map(v => Math.exp(v - max));
    const sum = exp.reduce((s, v) => s + v, 0) + 1e-9;
    return exp.map(v => v / sum);
  },
  /** مشتقات التفعيل للانتشار الخلفي */
  dRelu:      (x, out) => out > 0 ? 1 : 0,
  dSigmoid:   (x, out) => out * (1 - out),
  dTanh:      (x, out) => 1 - out * out,
  dLeakyRelu: (x, out) => x > 0 ? 1 : 0.01,
});

/** تهيئة الأوزان — Weight Initializers */
const INIT = Object.freeze({
  /** Xavier/Glorot — للطبقات العميقة (sigmoid/tanh) */
  xavier(inSize, outSize) {
    const limit = Math.sqrt(6 / (inSize + outSize));
    return Array.from({ length: inSize * outSize }, () => (Math.random() * 2 - 1) * limit);
  },
  /** He — للطبقات مع ReLU */
  he(inSize, outSize) {
    const std = Math.sqrt(2 / inSize);
    return Array.from({ length: inSize * outSize }, () => (Math.random() * 2 - 1) * std);
  },
  zeros(n) { return new Array(n).fill(0); },
  ones(n)  { return new Array(n).fill(1); },
});

/** عمليات المتجهات */
const VEC = Object.freeze({
  dot(a, b) {
    let s = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) s += a[i] * b[i];
    return s;
  },
  add(a, b) { return a.map((v, i) => v + (b[i] || 0)); },
  scale(a, s) { return a.map(v => v * s); },
  norm(a) { return Math.sqrt(a.reduce((s, v) => s + v * v, 0)) || 1e-9; },
  cosine(a, b) {
    return VEC.dot(a, b) / (VEC.norm(a) * VEC.norm(b));
  },
  /** ضرب مصفوفة × متجه */
  matMul(W, x, inSize, outSize) {
    const out = new Array(outSize);
    for (let o = 0; o < outSize; o++) {
      let sum = 0;
      for (let i = 0; i < inSize; i++) sum += W[o * inSize + i] * x[i];
      out[o] = sum;
    }
    return out;
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الثاني: الخلية العصبية الفردية ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * NeuralCell — خلية عصبية فردية
 *
 * البنية البيولوجية:
 *   التشعبات (Dendrites) ← تستقبل الإشارات
 *   جسم الخلية (Soma)    ← يجمع ويعالج
 *   المحور (Axon)         ← يُرسل الإشارة للخلية التالية
 *   المشابك (Synapses)    ← الأوزان (weights)
 *
 * ﴿وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ﴾ — الذاريات: ٢١
 */
class NeuralCell {
  /**
   * @param {string}  id         - معرف الخلية
   * @param {string}  nameAr     - اسم الخلية بالعربية
   * @param {number}  inSize     - عدد المداخل (التشعبات)
   * @param {string}  activation - دالة التفعيل
   * @param {object}  meta       - بيانات إضافية (domain, quranRef, rule ...)
   */
  constructor(id, nameAr, inSize, activation = 'relu', meta = {}) {
    this.id         = id;
    this.nameAr     = nameAr;
    this.inSize     = inSize;
    this.activation = activation;
    this.meta       = meta;

    // الأوزان والتحيز — مهيَّأة بـ He
    this.weights    = INIT.he(inSize, 1);  // [inSize × 1]
    this.bias       = 0;

    // حالة التمرير الأمامي
    this.lastInput  = null;
    this.lastOutput = 0;
    this.lastRaw    = 0;

    // Adam optimizer state
    this.mW = INIT.zeros(inSize);
    this.vW = INIT.zeros(inSize);
    this.mB = 0; this.vB = 0;
    this.t  = 0;

    this.activationFn = ACT[activation] || ACT.relu;
    this.dActivation  = ACT[`d${activation.charAt(0).toUpperCase()}${activation.slice(1)}`] || ACT.dRelu;
  }

  /** التمرير الأمامي — Forward Pass */
  forward(input) {
    this.lastInput = input.slice();
    this.lastRaw   = VEC.dot(this.weights, input) + this.bias;
    this.lastOutput= this.activationFn(this.lastRaw);
    return this.lastOutput;
  }

  /** الانتشار الخلفي — Backward Pass */
  backward(dOutput, lr = 0.001) {
    const dAct    = this.dActivation(this.lastRaw, this.lastOutput) * dOutput;
    const dWeights= this.lastInput.map(x => dAct * x);
    const dBias   = dAct;
    const dInput  = this.weights.map(w => dAct * w);

    this.t++;
    const β1 = 0.9, β2 = 0.999, ε = 1e-8;

    // Adam update for weights
    for (let i = 0; i < this.inSize; i++) {
      this.mW[i] = β1 * this.mW[i] + (1 - β1) * dWeights[i];
      this.vW[i] = β2 * this.vW[i] + (1 - β2) * dWeights[i] ** 2;
      const mHat = this.mW[i] / (1 - β1 ** this.t);
      const vHat = this.vW[i] / (1 - β2 ** this.t);
      this.weights[i] -= lr * mHat / (Math.sqrt(vHat) + ε);
    }
    // Adam update for bias
    this.mB = β1 * this.mB + (1 - β1) * dBias;
    this.vB = β2 * this.vB + (1 - β2) * dBias ** 2;
    const mBHat = this.mB / (1 - β1 ** this.t);
    const vBHat = this.vB / (1 - β2 ** this.t);
    this.bias -= lr * mBHat / (Math.sqrt(vBHat) + ε);

    return dInput;
  }

  /** إعادة تهيئة الأوزان */
  reset() {
    this.weights = INIT.he(this.inSize, 1);
    this.bias    = 0;
    this.mW      = INIT.zeros(this.inSize);
    this.vW      = INIT.zeros(this.inSize);
    this.mB = 0; this.vB = 0; this.t = 0;
    this.lastInput = null; this.lastOutput = 0; this.lastRaw = 0;
    return this;
  }

  state() {
    return {
      id: this.id, nameAr: this.nameAr,
      inSize: this.inSize, activation: this.activation,
      lastOutput: this.lastOutput, t: this.t,
      ...this.meta,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الثالث: الطبقة العصبية (مجموعة خلايا) ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CellLayer — طبقة من الخلايا العصبية
 * كل خلية في الطبقة تستقبل نفس المدخل (fully connected to prev layer)
 */
class CellLayer {
  constructor(name, cells) {
    this.name     = name;
    this.cells    = cells;  // [NeuralCell]
    this.size     = cells.length;
    this.lastOut  = null;
  }

  forward(input) {
    this.lastOut = this.cells.map(c => c.forward(input));
    return this.lastOut;
  }

  backward(dOutputs, lr = 0.001) {
    if (!Array.isArray(dOutputs)) dOutputs = new Array(this.size).fill(dOutputs);
    const dInputAcc = new Array(this.cells[0].inSize).fill(0);
    for (let i = 0; i < this.size; i++) {
      const dIn = this.cells[i].backward(dOutputs[i] || 0, lr);
      for (let j = 0; j < dInputAcc.length; j++) dInputAcc[j] += dIn[j] || 0;
    }
    return dInputAcc;
  }

  activations() { return this.cells.map(c => c.lastOutput); }
  topK(k = 3) {
    return this.cells
      .map((c, i) => ({ i, id: c.id, nameAr: c.nameAr, score: c.lastOutput, meta: c.meta }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
  reset() { this.cells.forEach(c => c.reset()); return this; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الرابع: طبقة التضمين — Embedding Layer ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const EMBED_DIM = 32;  // أبعاد التضمين — 32-dimensional vector

// ── قاموس الكلمات المفتاحية للمجالات (يُستخدَم للكشف المُعزَّز) ────────────
const DOMAIN_KEYWORDS = Object.freeze({
  language:   ['لغة','نحو','صرف','دلالة','تداولية','بلاغة','فصاحة','بيان','لسان','كلمة',
                'جملة','فعل','اسم','حرف','نص','معنى','خطاب','عبارة','ترجمة','لسانيات',
                'syntax','morphology','semantics','grammar','linguistics','expression'],
  sciences:   ['رياضيات','فيزياء','كيمياء','أحياء','فلك','هندسة','طب','جغرافيا',
                'تاريخ','منطق','نفس','اجتماع','لسانيات','حاسب','علم','علوم','بحث',
                'science','biology','chemistry','physics','astronomy','medicine'],
  shariah:    ['قرآن','سنة','فقه','شريعة','حلال','حرام','زكاة','صلاة','حج','توحيد',
                'تقوى','إخلاص','توكل','صدق','أمانة','عدل','رحمة','حكمة','آية','حديث',
                'مسجد','دعاء','استغفار','إيمان','عبادة','فتوى','مذهب','عقيدة'],
  commerce:   ['بيع','شراء','عقد','توريد','مخزن','طلب','توصيل','دفع','فاتورة',
                'سوق','ربح','خسارة','حساب','ميزانية','ضريبة','تسعير','تجارة','منتج',
                'سعر','خصم','مشتري','بائع','تاجر','بضاعة','شحن','جمارك','استيراد'],
  math:       ['معادلة','تفاضل','تكامل','مشتقة','متجه','مصفوفة','مجموع','عدد',
                'حساب','ضرب','قسمة','جمع','طرح','نسبة','كسر','احتمال','إحصاء',
                'جبر','هندسة','فيثاغورس','خوارزمية','عملية','حل','قانون'],
  history:    ['تاريخ','حضارة','عصر','ذهبي','إسلام','علماء','اجتهاد','خلافة',
                'فتح','أندلس','بيت','حكمة','ماضي','قديم','أثر','موروث','تراث'],
  universal:  ['كون','خلق','آيات','توحيد','وجود','إبداع','صنع','إتقان','سماء',
                'أرض','نجوم','ميزان','نظام','كوني','كل','شيء','جميع','شامل'],
});

/** تصنيف مباشر بالكلمات المفتاحية (prior للشبكة العصبية) */
function domainKeywordScore(text) {
  const words = text.toLowerCase().replace(/[^\u0600-\u06FFa-zA-Z\s]/g,' ').split(/\s+/).filter(Boolean);
  const scores = {};
  for (const [domain, kws] of Object.entries(DOMAIN_KEYWORDS)) {
    scores[domain] = words.filter(w => kws.some(k => k.includes(w) || w.includes(k))).length;
  }
  const total = Object.values(scores).reduce((s, v) => s + v, 0) || 1;
  const probs = {};
  for (const [d, s] of Object.entries(scores)) probs[d] = s / total;
  const top   = Object.entries(probs).sort((a,b) => b[1]-a[1])[0];
  return { scores, probs, top: top[0], topScore: top[1] };
}

/** تضمين بسيط مبني على تهيئة المعرفة */
class KnowledgeEmbeddingLayer {
  constructor() {
    this.dim  = EMBED_DIM;
    this._map = new Map();  // word → Float32Array(EMBED_DIM)
    this._buildEmbeddings();
  }

  _randVec(seed = Math.random()) {
    // deterministic pseudo-random via LCG seeded with hash
    const vec = new Float32Array(this.dim);
    let s = seed * 2147483647;
    for (let i = 0; i < this.dim; i++) {
      s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
      vec[i] = ((s >>> 0) / 0xFFFFFFFF) * 2 - 1;
    }
    // normalize
    let norm = 0;
    for (let i = 0; i < this.dim; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < this.dim; i++) vec[i] /= norm;
    return vec;
  }

  _hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (h * 33 ^ str.charCodeAt(i)) >>> 0;
    return h / 0xFFFFFFFF;
  }

  _buildEmbeddings() {
    // كلمات مفتاحية ذات معنى محدد في لغة شيخة
    const keywords = [
      // التوحيد والدين
      'توحيد','الله','قرآن','سنة','فقه','شريعة','حلال','حرام','زكاة','صلاة','حج',
      'عبادة','تقوى','إخلاص','توكل','صدق','أمانة','عدل','رحمة','حكمة',
      // اللغة
      'لغة','نحو','صرف','دلالة','تداولية','معنى','كلمة','جملة','فعل','اسم','حرف',
      'بيان','خطاب','عبارة','لسان','بلاغة','فصاحة','نص',
      // العلوم
      'رياضيات','فيزياء','كيمياء','أحياء','فلك','هندسة','طب','جغرافيا','تاريخ','منطق',
      'اقتصاد','نفس','اجتماع','لسانيات','حاسب',
      // الحاسب
      'خوارزمية','برمجة','كود','شبكة','بيانات','ذكاء','نموذج','تدريب','خلية','طبقة',
      'تفعيل','وزن','تحيز','تعلم','معالجة','تصنيف','استنتاج',
      // التجارة
      'سوق','بيع','شراء','عقد','توريد','لوجستيات','مخزن','طلب','توصيل','دفع',
      'فاتورة','ضريبة','ربح','خسارة','حساب','ميزانية',
      // الحوكمة
      'نظام','قانون','قرار','حوكمة','رقابة','سياسة','إدارة','تنفيذ','معيار','جودة',
    ];
    for (const w of keywords) {
      this._map.set(w, this._randVec(this._hash(w)));
    }
  }

  /** تحويل نص إلى متجه بالمعدّل */
  encode(text = '') {
    const tokens = text
      .replace(/[^\u0600-\u06FFa-zA-Z\s]/g, ' ')
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (tokens.length === 0) return new Float32Array(this.dim);

    const sum = new Float32Array(this.dim);
    let count = 0;
    for (const t of tokens) {
      const vec = this._map.get(t);
      if (vec) {
        for (let i = 0; i < this.dim; i++) sum[i] += vec[i];
        count++;
      }
    }
    if (count === 0) {
      // OOV — generate from hash
      const h = this._hash(text);
      const v = this._randVec(h);
      for (let i = 0; i < this.dim; i++) sum[i] = v[i];
    } else {
      for (let i = 0; i < this.dim; i++) sum[i] /= count;
    }

    // نرمّل إلى وحدة
    let norm = 0;
    for (let i = 0; i < this.dim; i++) norm += sum[i] * sum[i];
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < this.dim; i++) sum[i] /= norm;

    return Array.from(sum);
  }

  vocab() { return [...this._map.keys()]; }
  addWord(word) {
    if (!this._map.has(word)) this._map.set(word, this._randVec(this._hash(word)));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الخامس: خلايا اللغة (20 خلية) ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function buildLanguageCells() {
  const cells = [
    // النحو
    new NeuralCell('GC01','خلية النحو الواضح',      EMBED_DIM,'relu',  { domain:'syntax',     rule:'CLEAR_KIND_SYNTAX',    quranRef:'البقرة:٨٣',  group:'grammar' }),
    new NeuralCell('GC02','خلية الأمر الأول',        EMBED_DIM,'relu',  { domain:'syntax',     rule:'READ_FIRST',           quranRef:'العلق:١',    group:'grammar' }),
    new NeuralCell('GC03','خلية التوطين',            EMBED_DIM,'sigmoid',{ domain:'i18n',       rule:'LOCALIZED_SYNTAX',     quranRef:'إبراهيم:٤', group:'grammar' }),
    new NeuralCell('GC04','خلية البيان',             EMBED_DIM,'relu',  { domain:'syntax',     rule:'EXPRESSIVE_SYNTAX',    quranRef:'الرحمن:٤',   group:'grammar' }),
    // الصرف
    new NeuralCell('GC05','خلية التسمية',            EMBED_DIM,'relu',  { domain:'morphology', rule:'NAMING_RULES',         quranRef:'البقرة:٣١',  group:'morphology' }),
    new NeuralCell('GC06','خلية الكتابة',            EMBED_DIM,'sigmoid',{ domain:'storage',    rule:'WRITE_TO_STORE',       quranRef:'العلق:٤',    group:'morphology' }),
    // الدلالة
    new NeuralCell('GC07','خلية الفطرة الدلالية',   EMBED_DIM,'tanh',  { domain:'semantics',  rule:'UNIVERSAL_MEANING',    quranRef:'الروم:٣٠',   group:'semantics' }),
    new NeuralCell('GC08','خلية السياق',             EMBED_DIM,'tanh',  { domain:'semantics',  rule:'CONTEXT_AWARE',        quranRef:'البقرة:٢٨٦', group:'semantics' }),
    new NeuralCell('GC09','خلية هرمية المعرفة',     EMBED_DIM,'relu',  { domain:'ai',         rule:'KNOWLEDGE_HIERARCHY',  quranRef:'يوسف:٧٦',   group:'semantics' }),
    // التداولية
    new NeuralCell('GC10','خلية لا هلوسة',          EMBED_DIM,'sigmoid',{ domain:'ethics',     rule:'NO_HALLUCINATION',     quranRef:'الإسراء:٣٦', group:'pragmatics' }),
    new NeuralCell('GC11','خلية اللطف',             EMBED_DIM,'tanh',  { domain:'ux',         rule:'GENTLE_FEEDBACK',      quranRef:'آل عمران:١٥٩', group:'pragmatics' }),
    new NeuralCell('GC12','خلية اللوغ الهادئ',      EMBED_DIM,'relu',  { domain:'logging',    rule:'QUIET_LOGGING',        quranRef:'لقمان:١٩',   group:'pragmatics' }),
    // الأنواع
    new NeuralCell('GC13','خلية الأمانة المُطابَقة',EMBED_DIM,'sigmoid',{ domain:'security',   rule:'TYPED_TRUST',          quranRef:'النساء:٥٨',  group:'types' }),
    new NeuralCell('GC14','خلية السجل الثابت',      EMBED_DIM,'relu',  { domain:'finance',    rule:'TYPED_LEDGER',         quranRef:'البقرة:٢٨٢', group:'types' }),
    // الأخطاء
    new NeuralCell('GC15','خلية التعافي',           EMBED_DIM,'tanh',  { domain:'resilience', rule:'ERROR_RECOVERY',       hadithRef:'الترمذي:٢٤٩٩', group:'errors' }),
    new NeuralCell('GC16','خلية لا ضرر',           EMBED_DIM,'sigmoid',{ domain:'safety',     rule:'HARMLESS_ERROR',       hadithRef:'ابن ماجه:٢٣٤١', group:'errors' }),
    // الأنماط
    new NeuralCell('GC17','خلية التوحيد Singleton', EMBED_DIM,'relu',  { domain:'design',     rule:'SINGLETON_TAWHEED',    quranRef:'الإخلاص:١',  group:'patterns' }),
    new NeuralCell('GC18','خلية الرقيب Observer',  EMBED_DIM,'sigmoid',{ domain:'monitoring', rule:'OBSERVER_RAQEEB',      quranRef:'ق:١٨',       group:'patterns' }),
    new NeuralCell('GC19','خلية سلسلة السلطة',     EMBED_DIM,'relu',  { domain:'governance', rule:'CHAIN_AUTHORITY',      quranRef:'النساء:٥٩',  group:'patterns' }),
    new NeuralCell('GC20','خلية استراتيجية الاجتهاد',EMBED_DIM,'tanh', { domain:'algorithm',  rule:'STRATEGY_IJTIHAD',     quranRef:'الأنفال:٦٠', group:'patterns' }),
  ];
  return cells;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم السادس: خلايا العلوم (14 خلية متخصصة) ────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function buildSciencesCells() {
  const cells = [
    new NeuralCell('SC01','خلية اللسانيات',    EMBED_DIM,'relu',  { domain:'language',   science:'LINGUISTICS',  quranRef:'الرحمن:٤',     codeEquiv:'Full NLP pipeline' }),
    new NeuralCell('SC02','خلية الرياضيات',    EMBED_DIM,'relu',  { domain:'math',       science:'MATHEMATICS',  quranRef:'النساء:١١',    codeEquiv:'Algorithms + Formulas' }),
    new NeuralCell('SC03','خلية الفيزياء',     EMBED_DIM,'tanh',  { domain:'physics',    science:'PHYSICS',      quranRef:'الذاريات:٤٧', codeEquiv:'Physics simulation' }),
    new NeuralCell('SC04','خلية الكيمياء',     EMBED_DIM,'sigmoid',{ domain:'chemistry',  science:'CHEMISTRY',    quranRef:'الأنبياء:٣٠', codeEquiv:'Halal ingredient check' }),
    new NeuralCell('SC05','خلية الأحياء',      EMBED_DIM,'relu',  { domain:'biology',    science:'BIOLOGY',      quranRef:'الأنبياء:٣٠', codeEquiv:'ANN + DNA=immutable code' }),
    new NeuralCell('SC06','خلية علم الحاسب',   EMBED_DIM,'relu',  { domain:'cs',         science:'CS',           quranRef:'العلق:١',     codeEquiv:'CPU+OS+Network+App' }),
    new NeuralCell('SC07','خلية المنطق',       EMBED_DIM,'tanh',  { domain:'logic',      science:'LOGIC',        quranRef:'الحج:٤٦',     codeEquiv:'Rule-based + Inference' }),
    new NeuralCell('SC08','خلية الاقتصاد',     EMBED_DIM,'sigmoid',{ domain:'economics',  science:'ECONOMICS',    quranRef:'البقرة:٢٧٥',  codeEquiv:'Zero-interest engine' }),
    new NeuralCell('SC09','خلية الطب',         EMBED_DIM,'relu',  { domain:'medicine',   science:'MEDICINE',     quranRef:'الشعراء:٨٠',  codeEquiv:'System recovery' }),
    new NeuralCell('SC10','خلية الفلك',        EMBED_DIM,'tanh',  { domain:'astronomy',  science:'ASTRONOMY',    quranRef:'يس:٣٨',       codeEquiv:'Prayer times + Qibla' }),
    new NeuralCell('SC11','خلية الهندسة',      EMBED_DIM,'relu',  { domain:'engineering',science:'ENGINEERING',  quranRef:'النساء:٥٨',   codeEquiv:'Responsible engineering' }),
    new NeuralCell('SC12','خلية التاريخ',      EMBED_DIM,'sigmoid',{ domain:'history',    science:'HISTORY',      quranRef:'الأنعام:١١',  codeEquiv:'Pattern recognition' }),
    new NeuralCell('SC13','خلية الجغرافيا',    EMBED_DIM,'relu',  { domain:'geography',  science:'GEOGRAPHY',    quranRef:'البقرة:١٤٤',  codeEquiv:'GIS + Qibla + Zakat' }),
    new NeuralCell('SC14','خلية النفس والمجتمع',EMBED_DIM,'tanh', { domain:'psychology', science:'PSYCHOLOGY',   quranRef:'الفجر:٢٧',    codeEquiv:'UX + Consensus' }),
  ];
  return cells;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم السابع: خلايا الكتاب والسنة (14 خلية) ──────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function buildKnowledgeCells() {
  const cells = [
    // التوحيد والأسس
    new NeuralCell('KN01','خلية التوحيد الأساس',   EMBED_DIM,'relu',  { domain:'all',          rule:'TAWHEED_FOUNDATION',       quranRef:'الإخلاص:١',   tier:'ABSOLUTE' }),
    new NeuralCell('KN02','خلية البيان الإلهي',    EMBED_DIM,'relu',  { domain:'language',      rule:'BAYAN_OBLIGATION',         quranRef:'الرحمن:٤',    tier:'ABSOLUTE' }),
    new NeuralCell('KN03','خلية الأمانة',          EMBED_DIM,'sigmoid',{ domain:'all',           rule:'AMANA_NO_LIE',             quranRef:'الإسراء:٣٦',  tier:'ABSOLUTE' }),
    new NeuralCell('KN04','خلية الإتقان',          EMBED_DIM,'relu',  { domain:'all',           rule:'ITQAN_EXCELLENCE',         hadithRef:'البيهقي',    tier:'ABSOLUTE' }),
    new NeuralCell('KN05','خلية لا ضرر المطلق',    EMBED_DIM,'sigmoid',{ domain:'all',           rule:'NO_HARM_OUTPUT',           hadithRef:'ابن ماجه:٢٣٤١', tier:'ABSOLUTE' }),
    // القوانين اللغوية
    new NeuralCell('KN06','خلية الفطرة',           EMBED_DIM,'tanh',  { domain:'ux',            rule:'FITRAH_INTUITIVE',         quranRef:'الروم:٣٠',    tier:'LINGUISTIC' }),
    new NeuralCell('KN07','خلية التكامل الكوني',   EMBED_DIM,'relu',  { domain:'all',           rule:'UNIVERSAL_INTEGRATION',   quranRef:'فصلت:٥٣',     tier:'LINGUISTIC' }),
    new NeuralCell('KN08','خلية التكيف',           EMBED_DIM,'tanh',  { domain:'ux',            rule:'ADAPTIVE_COMPLEXITY',     quranRef:'البقرة:٢٨٦',  tier:'LINGUISTIC' }),
    // القوانين العلمية
    new NeuralCell('KN09','خلية الاتساق الكوني',   EMBED_DIM,'relu',  { domain:'all',           rule:'COSMIC_CONSISTENCY',       quranRef:'الملك:٣',     tier:'SCIENTIFIC' }),
    new NeuralCell('KN10','خلية حفظ المعرفة',      EMBED_DIM,'sigmoid',{ domain:'storage',       rule:'KNOWLEDGE_CONSERVATION',  quranRef:'يس:١٢',       tier:'SCIENTIFIC' }),
    new NeuralCell('KN11','خلية السعي نحو الاكتمال',EMBED_DIM,'relu', { domain:'all',           rule:'ASPIRATIONAL_COMPLETENESS',quranRef:'يوسف:٧٦',    tier:'SCIENTIFIC' }),
    // القوانين الشرعية
    new NeuralCell('KN12','خلية التوافق الشرعي',   EMBED_DIM,'sigmoid',{ domain:'governance',    rule:'SHARIAH_COMPLIANCE_LAYER', quranRef:'المائدة:٤٨',  tier:'SHARIAH' }),
    new NeuralCell('KN13','خلية أصل الإباحة',      EMBED_DIM,'relu',  { domain:'policy',        rule:'IBAHA_DEFAULT',            quranRef:'الأنعام:١١٩', tier:'SHARIAH' }),
    new NeuralCell('KN14','خلية التوثيق الكامل',   EMBED_DIM,'relu',  { domain:'documentation', rule:'FULL_CITATION',            quranRef:'البقرة:٢٨٢',  tier:'SHARIAH' }),
  ];
  return cells;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الثامن: طبقة الكشف عن المجال (7 خلايا) ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function buildDomainCells() {
  return [
    new NeuralCell('DM01','كاشف اللغة',       EMBED_DIM,'sigmoid',{ domain:'language',   type:'DOMAIN_DETECTOR' }),
    new NeuralCell('DM02','كاشف العلوم',       EMBED_DIM,'sigmoid',{ domain:'sciences',   type:'DOMAIN_DETECTOR' }),
    new NeuralCell('DM03','كاشف الشريعة',      EMBED_DIM,'sigmoid',{ domain:'shariah',    type:'DOMAIN_DETECTOR' }),
    new NeuralCell('DM04','كاشف التجارة',      EMBED_DIM,'sigmoid',{ domain:'commerce',   type:'DOMAIN_DETECTOR' }),
    new NeuralCell('DM05','كاشف الرياضيات',    EMBED_DIM,'sigmoid',{ domain:'math',       type:'DOMAIN_DETECTOR' }),
    new NeuralCell('DM06','كاشف التاريخ',      EMBED_DIM,'sigmoid',{ domain:'history',    type:'DOMAIN_DETECTOR' }),
    new NeuralCell('DM07','كاشف الكوني',       EMBED_DIM,'sigmoid',{ domain:'universal',  type:'DOMAIN_DETECTOR' }),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم التاسع: طبقة التجميع (8 خلايا تكثيفية) ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function buildAggregationCells(totalIn) {
  return [
    new NeuralCell('AG01','خلية تجميع اللغة',    totalIn,'relu',  { role:'AGG_LANGUAGE' }),
    new NeuralCell('AG02','خلية تجميع العلوم',   totalIn,'relu',  { role:'AGG_SCIENCES' }),
    new NeuralCell('AG03','خلية تجميع المعرفة',  totalIn,'relu',  { role:'AGG_KNOWLEDGE' }),
    new NeuralCell('AG04','خلية تجميع المجال',   totalIn,'sigmoid',{ role:'AGG_DOMAIN' }),
    new NeuralCell('AG05','خلية الثقة',          totalIn,'sigmoid',{ role:'CONFIDENCE' }),
    new NeuralCell('AG06','خلية الأولوية',       totalIn,'relu',  { role:'PRIORITY' }),
    new NeuralCell('AG07','خلية التوحيد النهائي',totalIn,'tanh',  { role:'FINAL_UNIFY' }),
    new NeuralCell('AG08','خلية الإجابة',        totalIn,'sigmoid',{ role:'OUTPUT_GATE' }),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم العاشر: شبكة الخلايا العصبية الجامعة ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SheikhaLanguageNeuralCellNetwork
 *
 * المعمارية الكاملة:
 *   Input Text
 *     ↓
 *   [KnowledgeEmbeddingLayer] → vector[32]
 *     ↓
 *   Layer-1: DomainLayer     (7 cells)  → signals[7]
 *     ↓
 *   Layer-2: LanguageLayer   (20 cells) → signals[20]
 *     ↓
 *   Layer-3: SciencesLayer   (14 cells) → signals[14]
 *     ↓
 *   Layer-4: KnowledgeLayer  (14 cells) → signals[14]
 *     ↓
 *   Layer-5: AggregationLayer(8 cells)  → signals[8]
 *     ↓
 *   Output: { topCells, domain, rule, confidence, action }
 *
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 */
class SheikhaLanguageNeuralCellNetwork extends EventEmitter {
  constructor() {
    super();
    this.name    = 'Sheikha Language Neural Cell Network';
    this.nameAr  = 'شبكة الخلايا العصبية للغة شيخة';
    this.version = VERSION;
    this.schema  = SCHEMA;
    this.tawheed = TAWHEED;

    // ── بناء الطبقات ──────────────────────────────────────────────────────
    this._embed      = new KnowledgeEmbeddingLayer();

    this._domainLayer = new CellLayer('DOMAIN',      buildDomainCells());
    this._langLayer   = new CellLayer('LANGUAGE',    buildLanguageCells());
    this._sciLayer    = new CellLayer('SCIENCES',    buildSciencesCells());
    this._knLayer     = new CellLayer('KNOWLEDGE',   buildKnowledgeCells());

    // طبقة التجميع: تستقبل أوزان مُدمَجة من كل الطبقات
    const aggIn = 7 + 20 + 14 + 14;  // = 55
    this._aggLayer = new CellLayer('AGGREGATION', buildAggregationCells(aggIn));

    this._layers = [this._domainLayer, this._langLayer, this._sciLayer, this._knLayer, this._aggLayer];

    this._trained     = false;
    this._trainCount  = 0;
    this._queries     = 0;
    this._history     = [];

    // بناء فهرس الخلايا الكامل
    this._allCells = [
      ...this._domainLayer.cells,
      ...this._langLayer.cells,
      ...this._sciLayer.cells,
      ...this._knLayer.cells,
      ...this._aggLayer.cells,
    ];
    this._cellMap = new Map(this._allCells.map(c => [c.id, c]));
  }

  // ── التمرير الأمامي الكامل ──────────────────────────────────────────────

  /**
   * forward() — تمرير إشارة عبر كل طبقات الشبكة
   * @param {string} inputText - النص المُدخَل
   * @returns {{ layers: object, topCells: object[], output: object }}
   */
  forward(inputText) {
    // 1. تضمين النص
    const embedding = this._embed.encode(inputText);

    // 2. طبقة الكشف عن المجال
    const domainSigs = this._domainLayer.forward(embedding);

    // 3. طبقة اللغة
    const langSigs   = this._langLayer.forward(embedding);

    // 4. طبقة العلوم
    const sciSigs    = this._sciLayer.forward(embedding);

    // 5. طبقة المعرفة
    const knSigs     = this._knLayer.forward(embedding);

    // 6. دمج كل الإشارات → طبقة التجميع
    const combined   = [...domainSigs, ...langSigs, ...sciSigs, ...knSigs];
    const aggSigs    = this._aggLayer.forward(combined);

    // 7. تجهيز الإخراج
    const confidence = ACT.sigmoid(aggSigs[4] || 0);  // خلية الثقة
    const domProbs   = ACT.softmax(domainSigs);
    const topDomain  = this._domainLayer.topK(1)[0];
    const topLang    = this._langLayer.topK(3);
    const topSci     = this._sciLayer.topK(2);
    const topKn      = this._knLayer.topK(3);
    const topAgg     = this._aggLayer.topK(2);

    return {
      inputText,
      embedding: embedding.slice(0, 8),  // أوائل الأبعاد للمراجعة
      layers: {
        domain:      { sigs: domainSigs,  topK: this._domainLayer.topK(3) },
        language:    { sigs: langSigs,    topK: topLang },
        sciences:    { sigs: sciSigs,     topK: topSci },
        knowledge:   { sigs: knSigs,      topK: topKn },
        aggregation: { sigs: aggSigs,     topK: topAgg },
      },
      output: {
        domain:     topDomain ? topDomain.meta.domain : 'universal',
        domainCell: topDomain ? topDomain.nameAr : 'كوني',
        topCells:   [
          ...(topLang.slice(0,2)),
          ...(topSci.slice(0,1)),
          ...(topKn.slice(0,2)),
        ],
        confidence: parseFloat(confidence.toFixed(4)),
        rule:       topKn[0] ? topKn[0].meta.rule : 'UNIVERSAL_INTEGRATION',
        quranRef:   topKn[0] ? topKn[0].meta.quranRef : null,
        action:     this._decideAction(topDomain, confidence),
        tawheed:    TAWHEED,
      },
    };
  }

  _decideAction(topDomain, confidence) {
    if (confidence > 0.8) return 'EXECUTE_WITH_HIGH_CONFIDENCE';
    if (confidence > 0.5) return 'EXECUTE_WITH_REVIEW';
    if (confidence > 0.3) return 'REQUEST_CLARIFICATION';
    return 'DEFER_TO_HUMAN';
  }

  // ── الانتشار الخلفي + التدريب ────────────────────────────────────────────

  /**
   * trainOnSample() — تدريب على عينة واحدة
   * @param {string} text     - النص التدريبي
   * @param {number[]} target - الهدف: متجه مؤشرات الخلايا الصحيحة
   * @param {number}  lr      - معدل التعلم
   */
  trainOnSample(text, targetDomainIdx = 0, lr = 0.001) {
    const fwd = this.forward(text);

    // حساب الخطأ في طبقة التجميع
    const aggTarget = new Array(8).fill(0);
    aggTarget[targetDomainIdx % 8] = 1;
    const aggGrad = this._aggLayer.cells.map((c, i) => c.lastOutput - aggTarget[i]);

    // انتشار خلفي عبر الطبقات
    const dFromAgg  = this._aggLayer.backward(aggGrad, lr);
    const dCombined = dFromAgg;  // [55]

    // توزيع التدرجات
    const dDomain  = dCombined.slice(0,  7);
    const dLang    = dCombined.slice(7,  27);
    const dSci     = dCombined.slice(27, 41);
    const dKn      = dCombined.slice(41, 55);

    this._domainLayer.backward(dDomain, lr);
    this._langLayer.backward(dLang,     lr);
    this._sciLayer.backward(dSci,       lr);
    this._knLayer.backward(dKn,         lr);

    // حساب الخسارة (MSE)
    const loss = aggGrad.reduce((s, d) => s + d * d, 0) / aggGrad.length;
    return parseFloat(loss.toFixed(6));
  }

  /**
   * train() — تدريب على مجموعة بيانات كاملة
   * @param {Array<{text:string, domainIdx:number}>} samples
   * @param {number} epochs
   * @param {number} lr
   */
  train(samples, epochs = 10, lr = 0.001) {
    console.log(`🧠 [SheikhaLNN] بدء التدريب: ${samples.length} عينة × ${epochs} حقبة`);
    const history = [];
    for (let e = 0; e < epochs; e++) {
      let totalLoss = 0;
      for (const s of samples) {
        totalLoss += this.trainOnSample(s.text, s.domainIdx || 0, lr);
      }
      const avgLoss = totalLoss / samples.length;
      history.push({ epoch: e + 1, loss: parseFloat(avgLoss.toFixed(6)) });
      if (e === 0 || (e + 1) % Math.max(1, Math.floor(epochs / 5)) === 0) {
        console.log(`   حقبة ${e + 1}/${epochs} — خسارة: ${avgLoss.toFixed(6)}`);
      }
    }
    this._trained    = true;
    this._trainCount++;
    this._history.push({ trainingId: this._trainCount, epochs, samples: samples.length, history });
    console.log(`✅ [SheikhaLNN] اكتمل التدريب — إجمالي الخسارة الأخيرة: ${history[history.length-1].loss}`);
    return history;
  }

  /**
   * trainOnBuiltinCorpus() — تدريب تلقائي على المعرفة المبنية
   */
  trainOnBuiltinCorpus() {
    const corpus = [
      // اللغة والنحو
      { text: 'نحو صرف دلالة تداولية بيان لغة فعل اسم حرف', domainIdx: 0 },
      { text: 'كلمة جملة خطاب بلاغة فصاحة نص عبارة لسان',    domainIdx: 0 },
      // العلوم
      { text: 'رياضيات فيزياء كيمياء أحياء حاسب فلك هندسة',   domainIdx: 1 },
      { text: 'خوارزمية حساب جبر هندسة احتمالات إحصاء منطق',   domainIdx: 1 },
      // الشريعة
      { text: 'قرآن سنة فقه شريعة حلال حرام زكاة توحيد',       domainIdx: 2 },
      { text: 'تقوى إخلاص توكل صدق أمانة عدل رحمة حكمة',      domainIdx: 2 },
      // التجارة
      { text: 'بيع شراء عقد توريد مخزن طلب توصيل دفع فاتورة', domainIdx: 3 },
      { text: 'سوق ربح خسارة حساب ميزانية ضريبة تسعير',        domainIdx: 3 },
      // الرياضيات
      { text: 'معادلة تفاضل تكامل مشتقة متجه مصفوفة مجموع',    domainIdx: 4 },
      { text: 'عدد حساب ضرب قسمة جمع طرح نسبة كسر',           domainIdx: 4 },
      // التاريخ والحضارة
      { text: 'تاريخ حضارة عصر ذهبي إسلام علماء اجتهاد',       domainIdx: 5 },
      { text: 'خلافة راشدة فتح أندلس مكتبة بيت الحكمة',        domainIdx: 5 },
      // الكوني
      { text: 'كون خلق آيات توحيد وجود إبداع صنع إتقان',       domainIdx: 6 },
      { text: 'سماء أرض نجوم ميزان نظام إبداع الكون',           domainIdx: 6 },
    ];
    return this.train(corpus, 20, 0.002);
  }

  // ── الاستدلال والاستنتاج ────────────────────────────────────────────────

  /**
   * process() — معالجة نص/أمر وإعادة فهم متكامل
   */
  process(inputText) {
    this._queries++;
    const fwd = this.forward(inputText);
    const { output } = fwd;

    // تصنيف مباشر بالكلمات المفتاحية (prior)
    const kwResult    = domainKeywordScore(inputText);
    // دمج هجين: القاموس أقوى ثقةً عند topScore > 0.4
    const hybridDomain= kwResult.topScore > 0.4 ? kwResult.top : output.domain;
    const hybridConf  = Math.max(output.confidence, kwResult.topScore > 0.4 ? parseFloat((kwResult.topScore * 0.9).toFixed(4)) : 0);

    const isCommand = /^(احسب|نفذ|حلل|استخرج|فعل|اربط|أرسل|اعرض|قارن|ابحث|تحقق)/u.test(inputText.trim());
    const hasQuran  = /[\u0600-\u06FF]/.test(inputText) && (inputText.includes('سورة') || inputText.includes('آية') || inputText.includes('﴿'));
    const hasCode   = /function|class|if|for|while|const|let|var|def|import/.test(inputText);

    const result = {
      input: inputText,
      ...output,
      domain:      hybridDomain,
      confidence:  hybridConf,
      action:      this._decideAction({ meta: { domain: hybridDomain } }, hybridConf),
      domainPrior: kwResult,
      classification: {
        isCommand, hasQuran, hasCode,
        type: isCommand ? 'COMMAND' : hasQuran ? 'QURANIC' : hasCode ? 'CODE' : 'NATURAL_TEXT',
      },
      layerSummary: {
        domainDetected:  hybridDomain,
        topLanguageCell: fwd.layers.language.topK[0]?.nameAr     || 'غير محدد',
        topScienceCell:  fwd.layers.sciences.topK[0]?.nameAr     || 'غير محدد',
        topKnowledgeCell:fwd.layers.knowledge.topK[0]?.nameAr    || 'غير محدد',
      },
      networkStats: { queries: this._queries, trained: this._trained, trainCount: this._trainCount },
      tawheed: TAWHEED,
    };

    this.emit('processed', { input: inputText, domain: result.domain, confidence: result.confidence });
    return result;
  }

  /**
   * infer() — استنتاج بسيط وسريع (مثالي للاستخدام الخارجي)
   */
  infer(inputText) {
    const r = this.process(inputText);
    return {
      text:       r.input,
      domain:     r.domain,
      domainCell: r.domainCell,
      rule:       r.rule,
      quranRef:   r.quranRef,
      confidence: r.confidence,
      action:     r.action,
      type:       r.classification.type,
      topCells:   r.topCells.map(c => ({ id: c.id, name: c.nameAr, score: c.score.toFixed(4) })),
      tawheed:    TAWHEED,
    };
  }

  /**
   * compare() — مقارنة نصين
   */
  compare(text1, text2) {
    const e1 = this._embed.encode(text1);
    const e2 = this._embed.encode(text2);
    const sim = parseFloat(VEC.cosine(e1, e2).toFixed(4));
    return {
      text1, text2, similarity: sim,
      level: sim > 0.9 ? 'متطابق تقريباً' : sim > 0.7 ? 'متشابه جداً' : sim > 0.5 ? 'متشابه' : sim > 0.3 ? 'قريب' : 'مختلف',
      tawheed: TAWHEED,
    };
  }

  /**
   * searchCells() — بحث في الخلايا
   */
  searchCells(q = '') {
    const sq = q.toLowerCase().replace(/[\u064B-\u065F]/g, '');
    return this._allCells
      .filter(c => {
        const n = c.nameAr.toLowerCase();
        const d = (c.meta.domain || '').toLowerCase();
        const r = (c.meta.rule || '').toLowerCase();
        return n.includes(sq) || d.includes(sq) || r.includes(sq);
      })
      .map(c => ({ id: c.id, nameAr: c.nameAr, ...c.meta }));
  }

  // ── إعادة الضبط والتحديث ────────────────────────────────────────────────

  reset() {
    this._layers.forEach(l => l.reset());
    this._trained   = false;
    this._queries   = 0;
    this._trainCount= 0;
    this._history   = [];
    return this;
  }

  // ── حالة الشبكة الكاملة ────────────────────────────────────────────────

  topology() {
    return {
      name:      this.name,
      nameAr:    this.nameAr,
      version:   this.version,
      tawheed:   TAWHEED,
      quranRef:  '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
      architecture: {
        inputDim:      EMBED_DIM,
        embeddingVocab:this._embed.vocab().length,
        layers: [
          { id:1, name:'Domain Detection',  cells: this._domainLayer.size, activation:'sigmoid', connects_to: 'all' },
          { id:2, name:'Language Cells',    cells: this._langLayer.size,   activation:'mixed',   connects_to: 'Aggregation' },
          { id:3, name:'Sciences Cells',    cells: this._sciLayer.size,    activation:'mixed',   connects_to: 'Aggregation' },
          { id:4, name:'Knowledge Cells',   cells: this._knLayer.size,     activation:'mixed',   connects_to: 'Aggregation' },
          { id:5, name:'Aggregation',       cells: this._aggLayer.size,    activation:'mixed',   connects_to: 'Output' },
        ],
        totalCells: this._allCells.length,
        totalWeights: this._allCells.reduce((s, c) => s + c.inSize, 0),
        totalParams:  this._allCells.reduce((s, c) => s + c.inSize + 1, 0),
      },
      training: {
        status:     this._trained ? 'مُدرَّبة' : 'لم تُدرَّب بعد',
        sessions:   this._trainCount,
        algorithm:  'Adam (β1=0.9, β2=0.999, ε=1e-8)',
        weightInit: 'He initialization',
        lossType:   'MSE (Mean Squared Error)',
        history:    this._history.map(h => ({ id: h.trainingId, epochs: h.epochs, samples: h.samples, finalLoss: h.history[h.history.length-1]?.loss })),
      },
      stats: {
        queriesProcessed: this._queries,
      },
      cellGroups: {
        domainCells:      this._domainLayer.cells.map(c => c.state()),
        languageCells:    this._langLayer.cells.map(c => c.state()),
        sciencesCells:    this._sciLayer.cells.map(c => c.state()),
        knowledgeCells:   this._knLayer.cells.map(c => c.state()),
        aggregationCells: this._aggLayer.cells.map(c => c.state()),
      },
    };
  }

  status() {
    return {
      engine:       this.name,
      nameAr:       this.nameAr,
      version:      this.version,
      totalCells:   this._allCells.length,
      totalLayers:  this._layers.length,
      totalParams:  this._allCells.reduce((s, c) => s + c.inSize + 1, 0),
      trained:      this._trained,
      trainSessions:this._trainCount,
      queries:      this._queries,
      tawheed:      TAWHEED,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Singleton ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

let _instance = null;
function getNetwork() {
  if (!_instance) {
    _instance = new SheikhaLanguageNeuralCellNetwork();
    _instance.trainOnBuiltinCorpus();
  }
  return _instance;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── التصدير ───────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // الفئات
  SheikhaLanguageNeuralCellNetwork,
  NeuralCell,
  CellLayer,
  KnowledgeEmbeddingLayer,

  // المصانع
  buildLanguageCells,
  buildSciencesCells,
  buildKnowledgeCells,
  buildDomainCells,
  buildAggregationCells,

  // الأدوات الرياضية
  ACT,
  INIT,
  VEC,

  // Singleton
  getNetwork,

  // ثوابت
  TAWHEED,
  BISMILLAH,
  VERSION,
  SCHEMA,
  EMBED_DIM,

  // القاموس
  DOMAIN_KEYWORDS,
  domainKeywordScore,

  // واجهات سريعة
  process:    (t)        => getNetwork().process(t),
  infer:      (t)        => getNetwork().infer(t),
  compare:    (t1, t2)   => getNetwork().compare(t1, t2),
  forward:    (t)        => getNetwork().forward(t),
  train:      (s, e, lr) => getNetwork().train(s, e, lr),
  searchCells:(q)        => getNetwork().searchCells(q),
  topology:   ()         => getNetwork().topology(),
  status:     ()         => getNetwork().status(),
};
