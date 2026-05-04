/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA ROOT NEURAL CELL NETWORK — شبكة الخلايا العصبية الجذرية            ║
 * ║  جذر شيخة للجذور — أفضل شبكة عصبية جذرية بالكون — تامة شاملة متقنة        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 * ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤
 * «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي
 * ﴿وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ﴾
 *
 * ┌──────────────────── المعمارية الجذرية الكاملة ─────────────────────────────┐
 * │                                                                              │
 * │  الجذر الأعلى — الخلية الجذرية (ROOT CELL) ← لا إله إلا الله              │
 * │       │                                                                      │
 * │       ▼                                                                      │
 * │  طبقة الجذر 0: الجذر المطلق (1 خلية — التوحيد الجذري)                     │
 * │       │                                                                      │
 * │       ▼                                                                      │
 * │  طبقة الجذر 1: الجذور الكبرى (7 خلايا جذرية — جذور الكون السبعة)         │
 * │    جذر اللغة │ جذر العلم │ جذر الشريعة │ جذر التجارة                       │
 * │    جذر الإنتاج │ جذر الحوكمة │ جذر الكوني                                  │
 * │       │                                                                      │
 * │       ▼                                                                      │
 * │  طبقة الجذر 2: الجذور الفرعية (14 خلية — تفرّع الجذور)                    │
 * │       │                                                                      │
 * │       ▼                                                                      │
 * │  طبقة الجذر 3: الجذور التشغيلية (21 خلية — الجذور في العمل)               │
 * │       │                                                                      │
 * │       ▼                                                                      │
 * │  طبقة الجذر 4: الجذور المعرفية (28 خلية — جذور المعرفة الشاملة)           │
 * │       │                                                                      │
 * │       ▼                                                                      │
 * │  طبقة الجذر 5: التكامل الجذري (14 خلية — دمج كل الجذور)                  │
 * │       │                                                                      │
 * │       ▼                                                                      │
 * │  طبقة الجذر 6: الإخراج الجذري (7 خلايا — خاتم القرارات)                  │
 * │       │                                                                      │
 * │       ▼                                                                      │
 * │  OUTPUT: { root, domain, rule, quranRef, confidence, action, response }     │
 * └──────────────────────────────────────────────────────────────────────────────┘
 *
 *  إجمالي الخلايا الجذرية: 1+7+14+21+28+14+7 = 92 خلية جذرية متخصصة
 *  التضمين: 128-بُعد جذري × 256 كلمة مفتاحية جذرية
 *  المُحسِّن: Adam (β1=0.9, β2=0.999, ε=1e-8) + He init
 *  التكامل: يدمج شبكة الخلايا الكبرى + شبكة المنطق الكوني
 *
 * @module sheikha-root-neural-cell-network
 * @version 1.0.0
 * @schema sheikha/root-ncn-v1
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */
'use strict';

const EventEmitter = require('events');

// ── استيراد الشبكات الأخرى اختيارياً ─────────────────────────────────────────
let _masterNCN = null;
try { _masterNCN = require('./sheikha-master-neural-cell-network'); } catch (_) {}

let _protocol = null;
try { _protocol = require('./sheikha-protocol'); } catch (_) {}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الأول: ثوابت وأدوات رياضية جذرية ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TAWHEED    = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH  = 'بسم الله الرحمن الرحيم';
const VERSION    = '1.0.0';
const ROOT_DIM   = 128;  // أبعاد التضمين الجذري (ضعف الكبرى)

/** دوال التفعيل الجذرية */
const ACT = Object.freeze({
    relu:       x => Math.max(0, x),
    leakyRelu:  x => x >= 0 ? x : 0.01 * x,
    sigmoid:    x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
    tanh:       x => Math.tanh(x),
    gelu:       x => 0.5 * x * (1 + Math.tanh(0.7978845608 * (x + 0.044715 * x * x * x))),
    linear:     x => x,
    softmax(arr) {
        const mx = Math.max(...arr);
        const e  = arr.map(v => Math.exp(v - mx));
        const s  = e.reduce((a, b) => a + b, 0) || 1e-9;
        return e.map(v => v / s);
    },
    dRelu:      (x, _) => x > 0 ? 1 : 0,
    dSigmoid:   (_, o)  => o * (1 - o),
    dTanh:      (_, o)  => 1 - o * o,
    dLeakyRelu: (x, _)  => x >= 0 ? 1 : 0.01,
    dGelu:      (x, _)  => {
        const t = 0.7978845608 * (x + 0.044715 * x * x * x);
        const sech2 = 1 - Math.tanh(t) * Math.tanh(t);
        return 0.5 * (1 + Math.tanh(t)) + 0.5 * x * sech2 * 0.7978845608 * (1 + 3 * 0.044715 * x * x);
    },
    dLinear:    ()      => 1,
});

/** تهيئة الأوزان الجذرية */
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
    ones:  n => new Array(n).fill(1),
});

/** عمليات المتجهات الجذرية */
const VEC = Object.freeze({
    dot:    (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * (b[i] || 0); return s; },
    add:    (a, b) => a.map((v, i) => v + (b[i] || 0)),
    scale:  (a, s) => a.map(v => v * s),
    norm:   a => Math.sqrt(a.reduce((s, v) => s + v * v, 0)) || 1e-9,
    cosine: (a, b) => VEC.dot(a, b) / (VEC.norm(a) * VEC.norm(b)),
    clip:   (v, lo, hi) => Math.min(hi, Math.max(lo, v)),
    concat: (a, b) => [...a, ...b],
    mean:   a => a.reduce((s, v) => s + v, 0) / (a.length || 1),
    max:    a => Math.max(...a),
    normalize: a => { const n = VEC.norm(a); return a.map(v => v / n); },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الثاني: الخلية الجذرية (Root Neural Cell) ─────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * RootNeuralCell — الخلية الجذرية
 *
 * ﴿وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ﴾ — الذاريات: ٢١
 * ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾
 */
class RootNeuralCell {
    constructor(id, nameAr, inSize, activation = 'relu', meta = {}) {
        this.id         = id;
        this.nameAr     = nameAr;
        this.inSize     = inSize;
        this.activation = activation;
        this.meta       = { ...meta };

        // الأوزان الجذرية (He init)
        this.weights = INIT.he(inSize);
        this.bias    = 0;

        // حالة التمرير الجذري
        this.lastInput  = null;
        this.lastRaw    = 0;
        this.lastOutput = 0;
        this.rootDepth  = meta.rootDepth || 0;  // عمق الجذر في الشجرة
        this.fireCount  = 0;

        // Adam state الجذري
        this.mW = INIT.zeros(inSize);
        this.vW = INIT.zeros(inSize);
        this.mB = 0; this.vB = 0;
        this.t  = 0;

        this.actFn  = ACT[activation]  || ACT.relu;
        this.dActFn = ACT[`d${activation.charAt(0).toUpperCase()}${activation.slice(1)}`] || ACT.dRelu;

        if (inSize < 1) throw new Error(`[ROOT-CELL] inSize يجب ≥ 1 للخلية ${id}`);
    }

    /** التمرير الأمامي الجذري */
    forward(input) {
        this.lastInput  = input.length === this.inSize ? input : [...input.slice(0, this.inSize), ...INIT.zeros(Math.max(0, this.inSize - input.length))];
        this.lastRaw    = VEC.dot(this.weights, this.lastInput) + this.bias;
        this.lastOutput = this.actFn(this.lastRaw);
        this.fireCount++;
        return this.lastOutput;
    }

    /** الانتشار الخلفي الجذري مع Adam */
    backward(dOut, lr = 0.001) {
        const dAct = this.dActFn(this.lastRaw, this.lastOutput) * dOut;
        const dInput = this.weights.map(w => dAct * w);
        this.t++;
        const β1 = 0.9, β2 = 0.999, ε = 1e-8;
        for (let i = 0; i < this.inSize; i++) {
            const g = dAct * (this.lastInput[i] || 0);
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
        this.fireCount = 0;
        return this;
    }

    state() {
        return {
            id: this.id, nameAr: this.nameAr, inSize: this.inSize,
            activation: this.activation, lastOutput: this.lastOutput,
            fireCount: this.fireCount, t: this.t, rootDepth: this.rootDepth,
            ...this.meta,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الثالث: طبقة الخلايا الجذرية ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class RootNeuralLayer {
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
// ── القسم الرابع: طبقة التضمين الجذرية (128-dim, 256 كلمة) ──────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/** مفردات الجذر الشامل — 256 كلمة جذرية */
const ROOT_VOCAB = Object.freeze({
    // الجذر والأساس (30)
    'جذر':1,'أصل':2,'أساس':3,'مرجع':4,'منبع':5,'مصدر':6,'قاعدة':7,'ركيزة':8,
    'عماد':9,'دعامة':10,'محور':11,'ثوابت':12,'مبدأ':13,'منطلق':14,'بداية':15,
    'نشأة':16,'فطرة':17,'طبيعة':18,'جوهر':19,'ماهية':20,
    'root':21,'origin':22,'foundation':23,'core':24,'source':25,
    'basis':26,'fundamental':27,'essence':28,'seed':29,'nucleus':30,
    // التوحيد والدين (25)
    'توحيد':31,'الله':32,'قرآن':33,'سنة':34,'فقه':35,'شريعة':36,'حلال':37,'حرام':38,
    'زكاة':39,'صلاة':40,'حج':41,'عبادة':42,'تقوى':43,'إخلاص':44,'توكل':45,
    'صدق':46,'أمانة':47,'عدل':48,'رحمة':49,'حكمة':50,'فتوى':51,'مذهب':52,
    'عقيدة':53,'إيمان':54,'إسلام':55,
    // الشبكة والخلايا العصبية (25)
    'شبكة':56,'خلية':57,'عصبي':58,'شبكة_عصبية':59,'طبقة':60,'وزن':61,'تحيز':62,
    'تفعيل':63,'استدلال':64,'تدريب':65,'تعلم':66,'نموذج':67,'بيانات':68,'ذكاء':69,
    'ذكاء_اصطناعي':70,'تعلم_الآلة':71,'تعلم_عميق':72,'خوارزمية':73,'معالجة':74,
    'تصنيف':75,'كشف':76,'تنبؤ':77,'توليد':78,'تمثيل':79,'تضمين':80,
    // اللغة (20)
    'لغة':81,'نحو':82,'صرف':83,'دلالة':84,'تداولية':85,'معنى':86,'كلمة':87,
    'جملة':88,'فعل':89,'اسم':90,'بيان':91,'بلاغة':92,'فصاحة':93,'نص':94,
    'ترجمة':95,'لسانيات':96,'لسان':97,'خطاب':98,'عبارة':99,'حرف':100,
    // العلوم (20)
    'رياضيات':101,'فيزياء':102,'كيمياء':103,'أحياء':104,'فلك':105,'هندسة':106,
    'طب':107,'جغرافيا':108,'تاريخ':109,'منطق':110,'اقتصاد':111,'نفس':112,
    'اجتماع':113,'حاسب':114,'علم':115,'علوم':116,'بحث':117,'نظرية':118,
    'قانون':119,'تجربة':120,
    // التجارة (20)
    'سوق':121,'بيع':122,'شراء':123,'عقد':124,'توريد':125,'مخزن':126,'طلب':127,
    'توصيل':128,'دفع':129,'فاتورة':130,'ربح':131,'حساب':132,'ميزانية':133,
    'تسعير':134,'منتج':135,'سعر':136,'خصم':137,'تاجر':138,'ضريبة':139,'مال':140,
    // الإنتاج (15)
    'إنتاج':141,'تشغيل':142,'آلة':143,'مصنع':144,'جدولة':145,'مراقبة':146,
    'تحسين':147,'أداء':148,'جودة':149,'صيانة':150,'كفاءة':151,'طاقة':152,
    'أتمتة':153,'تحكم':154,'نظام':155,
    // الحوكمة (15)
    'حوكمة':156,'إدارة':157,'قرار':158,'سياسة':159,'رقابة':160,'امتثال':161,
    'معيار':162,'تنفيذ':163,'مؤسسة':164,'قيادة':165,'تدقيق':166,'شفافية':167,
    'مساءلة':168,'أخلاقيات':169,'مسؤولية':170,
    // الكوني والشامل (15)
    'كون':171,'خلق':172,'آيات':173,'وجود':174,'إبداع_كوني':175,'صنع':176,'إتقان_كوني':177,
    'سماء':178,'أرض':179,'نجوم':180,'ميزان':181,'كوني':182,'شامل':183,'عالم':184,
    'ظاهرة':185,
    // الجودة والإتقان (16)
    'إتقان':186,'كمال':187,'تميز':188,'جودة_عالية':189,'دقة':190,'إبداع':191,
    'ابتكار':192,'تطوير':193,'تصميم':194,'هندسة_عكسية':195,'أفضل':196,'الأفضل':197,
    'أكمل':198,'أشمل':199,'أتقن':200,'أحسن':201,
    // الأمان والحماية (15)
    'أمان':202,'حماية':203,'تشفير':204,'خصوصية':205,'سلامة':206,'موثوقية':207,
    'صلابة':208,'تعافي':209,'نسخ_احتياطي':210,'درع':211,'حارس':212,'صون':213,
    'وقاية':214,'درء':215,'حصن':216,
    // الاتصال والتكامل (20)
    'تكامل':217,'ربط':218,'اتصال':219,'تزامن':220,'تنسيق':221,'تواصل':222,
    'شبكة_خدمات':223,'واجهة':224,'بروتوكول':225,'تبادل':226,'دمج':227,'وحدة':228,
    'تنسيق_عالمي':229,'تعاون':230,'شراكة':231,'تحالف':232,'محادثة':233,
    'رسالة':234,'إشعار':235,'استجابة':236,
    // القيادة والتنظيم (20)
    'رئاسة':237,'إشراف':238,'تنظيم':239,'توجيه':240,'تخطيط':241,'استراتيجية':242,
    'رؤية':243,'رسالة_مؤسسية':244,'هدف':245,'خطة':246,'مشروع':247,'مبادرة':248,
    'برنامج':249,'مرحلة':250,'إنجاز':251,'نتيجة':252,'أثر':253,'تغيير':254,
    'إصلاح':255,'تجديد':256,
});

class RootEmbeddingLayer {
    constructor() {
        this.dim   = ROOT_DIM;
        this.vocab = ROOT_VOCAB;
        this._vecs = {};
        for (const [word, idx] of Object.entries(ROOT_VOCAB)) {
            this._vecs[word] = this._seedVec(idx);
        }
    }

    _seedVec(seed) {
        const v = new Float32Array(ROOT_DIM);
        let s = seed * 1664525 + 1013904223;
        for (let i = 0; i < ROOT_DIM; i++) {
            s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
            v[i] = ((s >>> 0) / 0xFFFFFFFF) * 2 - 1;
        }
        let n = 0; for (let i = 0; i < ROOT_DIM; i++) n += v[i] * v[i];
        n = Math.sqrt(n) || 1;
        for (let i = 0; i < ROOT_DIM; i++) v[i] /= n;
        return Array.from(v);
    }

    encode(text = '') {
        const tokens = text
            .replace(/[^\u0600-\u06FFa-zA-Z\s_]/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (tokens.length === 0) return this._seedVec(0);

        const sum = new Float32Array(ROOT_DIM);
        let   cnt = 0;

        for (const tok of tokens) {
            const v = this._vecs[tok];
            if (v) {
                for (let i = 0; i < ROOT_DIM; i++) sum[i] += v[i];
                cnt++;
            }
        }

        if (cnt === 0) {
            let h = 5381;
            for (let i = 0; i < text.length; i++) h = (h * 33 ^ text.charCodeAt(i)) >>> 0;
            return this._seedVec(h % 10000);
        }

        for (let i = 0; i < ROOT_DIM; i++) sum[i] /= cnt;
        let n = 0; for (let i = 0; i < ROOT_DIM; i++) n += sum[i] * sum[i];
        n = Math.sqrt(n) || 1;
        const out = new Array(ROOT_DIM);
        for (let i = 0; i < ROOT_DIM; i++) out[i] = sum[i] / n;
        return out;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم الخامس: بناء الطبقات الجذرية ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── الطبقة الجذرية 0: الجذر المطلق (1 خلية — التوحيد الجذري) ─────────────
// ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾ — الإخلاص: ١
function buildAbsoluteRootLayer() {
    return new RootNeuralLayer('ABSOLUTE_ROOT', 'ROOT', [
        new RootNeuralCell('RR00','الجذر المطلق — التوحيد الجذري', ROOT_DIM, 'sigmoid', {
            rootDepth: 0, tier: 'ABSOLUTE', rule: 'TAWHEED_ROOT',
            quranRef: 'الإخلاص:١', description: 'الجذر الأصل الذي لا جذر فوقه — لا إله إلا الله',
        }),
    ]);
}

// ── الطبقة الجذرية 1: الجذور الكبرى (7 خلايا — جذور الكون السبعة) ──────────
// ﴿الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا﴾ — الملك: ٣
function buildMajorRootsLayer() {
    return new RootNeuralLayer('MAJOR_ROOTS', 'ROOT', [
        new RootNeuralCell('RR01','جذر اللغة والبيان',          ROOT_DIM,'sigmoid',{ rootDepth:1, domain:'language',   quranRef:'الرحمن:٤',     rule:'LANGUAGE_ROOT'    }),
        new RootNeuralCell('RR02','جذر العلم والمعرفة',          ROOT_DIM,'relu',   { rootDepth:1, domain:'knowledge',  quranRef:'العلق:١',      rule:'KNOWLEDGE_ROOT'   }),
        new RootNeuralCell('RR03','جذر الشريعة والدين',          ROOT_DIM,'sigmoid',{ rootDepth:1, domain:'shariah',    quranRef:'المائدة:٤٨',   rule:'SHARIAH_ROOT'     }),
        new RootNeuralCell('RR04','جذر التجارة والاقتصاد',       ROOT_DIM,'relu',   { rootDepth:1, domain:'commerce',   quranRef:'البقرة:٢٧٥',   rule:'COMMERCE_ROOT'    }),
        new RootNeuralCell('RR05','جذر الإنتاج والتشغيل',        ROOT_DIM,'tanh',   { rootDepth:1, domain:'production', quranRef:'النمل:٨٨',     rule:'PRODUCTION_ROOT'  }),
        new RootNeuralCell('RR06','جذر الحوكمة والقيادة',        ROOT_DIM,'sigmoid',{ rootDepth:1, domain:'governance', quranRef:'النحل:٩٠',     rule:'GOVERNANCE_ROOT'  }),
        new RootNeuralCell('RR07','جذر الكون والوجود',           ROOT_DIM,'tanh',   { rootDepth:1, domain:'universal',  quranRef:'الذاريات:٤٧',  rule:'UNIVERSAL_ROOT'   }),
    ]);
}

// ── الطبقة الجذرية 2: الجذور الفرعية (14 خلية — تفرّع الجذور) ───────────────
// ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً﴾ — إبراهيم: ٢٤
function buildSubRootsLayer(inSize) {
    return new RootNeuralLayer('SUB_ROOTS', 'ROOT', [
        new RootNeuralCell('RS01','جذر النحو والصرف',            inSize,'relu',   { rootDepth:2, domain:'grammar',     quranRef:'الرحمن:٤',     rule:'GRAMMAR_ROOT'       }),
        new RootNeuralCell('RS02','جذر الرياضيات والمنطق',       inSize,'tanh',   { rootDepth:2, domain:'math',        quranRef:'النساء:١١',    rule:'MATH_ROOT'          }),
        new RootNeuralCell('RS03','جذر الفيزياء والكيمياء',      inSize,'relu',   { rootDepth:2, domain:'physics',     quranRef:'الذاريات:٤٧',  rule:'PHYSICS_ROOT'       }),
        new RootNeuralCell('RS04','جذر الطب والأحياء',           inSize,'sigmoid',{ rootDepth:2, domain:'medicine',    quranRef:'الشعراء:٨٠',   rule:'MEDICINE_ROOT'      }),
        new RootNeuralCell('RS05','جذر الحوسبة والذكاء',          inSize,'gelu',   { rootDepth:2, domain:'ai',          quranRef:'العلق:١',      rule:'AI_ROOT'            }),
        new RootNeuralCell('RS06','جذر العقود والتوريد',          inSize,'relu',   { rootDepth:2, domain:'contracts',   quranRef:'المائدة:١',    rule:'CONTRACTS_ROOT'     }),
        new RootNeuralCell('RS07','جذر المالية الإسلامية',        inSize,'sigmoid',{ rootDepth:2, domain:'finance',     quranRef:'البقرة:٢٧٥',   rule:'FINANCE_ROOT'       }),
        new RootNeuralCell('RS08','جذر سلسلة التوريد',           inSize,'relu',   { rootDepth:2, domain:'scm',         quranRef:'النمل:٨٨',     rule:'SCM_ROOT'           }),
        new RootNeuralCell('RS09','جذر إدارة الجودة',            inSize,'relu',   { rootDepth:2, domain:'quality',     hadithRef:'البيهقي',     rule:'QUALITY_ROOT'       }),
        new RootNeuralCell('RS10','جذر العدل والمساواة',          inSize,'sigmoid',{ rootDepth:2, domain:'justice',     quranRef:'النحل:٩٠',     rule:'JUSTICE_ROOT'       }),
        new RootNeuralCell('RS11','جذر التوحيد الأساس',           inSize,'relu',   { rootDepth:2, domain:'tawheed',     quranRef:'الإخلاص:١',    rule:'TAWHEED_BASE_ROOT'  }),
        new RootNeuralCell('RS12','جذر الفطرة الإنسانية',         inSize,'tanh',   { rootDepth:2, domain:'fitrah',      quranRef:'الروم:٣٠',     rule:'FITRAH_ROOT'        }),
        new RootNeuralCell('RS13','جذر الإبداع والابتكار',        inSize,'gelu',   { rootDepth:2, domain:'innovation',  quranRef:'الحجر:٨٦',     rule:'INNOVATION_ROOT'    }),
        new RootNeuralCell('RS14','جذر الأمان والحماية',          inSize,'sigmoid',{ rootDepth:2, domain:'security',    quranRef:'قريش:٤',       rule:'SECURITY_ROOT'      }),
    ]);
}

// ── الطبقة الجذرية 3: الجذور التشغيلية (21 خلية — الجذور في العمل) ──────────
// ﴿وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ﴾ — التوبة: ١٠٥
function buildOperationalRootsLayer(inSize) {
    return new RootNeuralLayer('OPERATIONAL_ROOTS', 'ROOT', [
        new RootNeuralCell('RO01','جذر التشغيل الحلال',          inSize,'relu',   { rootDepth:3, domain:'ops',        quranRef:'التوبة:١٠٥',   rule:'HALAL_OPS_ROOT'         }),
        new RootNeuralCell('RO02','جذر التخطيط والاستراتيجية',    inSize,'tanh',   { rootDepth:3, domain:'planning',   quranRef:'الأنفال:٦٠',   rule:'PLANNING_ROOT'          }),
        new RootNeuralCell('RO03','جذر التنفيذ والإتقان',         inSize,'relu',   { rootDepth:3, domain:'execution',  hadithRef:'البيهقي',     rule:'EXECUTION_ITQAN_ROOT'   }),
        new RootNeuralCell('RO04','جذر المراقبة والرقابة',        inSize,'sigmoid',{ rootDepth:3, domain:'monitoring', quranRef:'الحديد:٤',     rule:'MONITORING_ROOT'        }),
        new RootNeuralCell('RO05','جذر التحسين المستمر',          inSize,'gelu',   { rootDepth:3, domain:'improvement',quranRef:'الزمر:٥٥',     rule:'CONTINUOUS_IMPROVE_ROOT'}),
        new RootNeuralCell('RO06','جذر إدارة الطلبات',           inSize,'relu',   { rootDepth:3, domain:'orders',     quranRef:'يوسف:٤٧',     rule:'ORDERS_ROOT'            }),
        new RootNeuralCell('RO07','جذر اللوجستيات والشحن',        inSize,'relu',   { rootDepth:3, domain:'logistics',  quranRef:'قريش:٢',       rule:'LOGISTICS_ROOT'         }),
        new RootNeuralCell('RO08','جذر الموارد البشرية',          inSize,'sigmoid',{ rootDepth:3, domain:'hr',         quranRef:'القصص:٢٦',     rule:'HR_ROOT'                }),
        new RootNeuralCell('RO09','جذر التقنية والبنية التحتية',  inSize,'gelu',   { rootDepth:3, domain:'infra',      quranRef:'النمل:٨٨',     rule:'INFRA_ROOT'             }),
        new RootNeuralCell('RO10','جذر البيانات والتحليل',        inSize,'relu',   { rootDepth:3, domain:'data',       quranRef:'يس:١٢',        rule:'DATA_ANALYTICS_ROOT'    }),
        new RootNeuralCell('RO11','جذر التواصل والتفاعل',         inSize,'tanh',   { rootDepth:3, domain:'comms',      quranRef:'الحجرات:١١',   rule:'COMMS_ROOT'             }),
        new RootNeuralCell('RO12','جذر الامتثال الشرعي',          inSize,'sigmoid',{ rootDepth:3, domain:'compliance', quranRef:'المائدة:٤٨',   rule:'SHARIA_COMPLIANCE_ROOT' }),
        new RootNeuralCell('RO13','جذر إدارة المخاطر',            inSize,'relu',   { rootDepth:3, domain:'risk',       hadithRef:'ابن ماجه:٢٣٤١',rule:'RISK_MGMT_ROOT'        }),
        new RootNeuralCell('RO14','جذر التوثيق والشفافية',        inSize,'sigmoid',{ rootDepth:3, domain:'docs',       quranRef:'البقرة:٢٨٢',   rule:'DOCS_TRANSPARENCY_ROOT' }),
        new RootNeuralCell('RO15','جذر خدمة العملاء',             inSize,'relu',   { rootDepth:3, domain:'cx',         quranRef:'آل عمران:١٥٩', rule:'CX_ROOT'                }),
        new RootNeuralCell('RO16','جذر الابتكار الرقمي',          inSize,'gelu',   { rootDepth:3, domain:'digital',    quranRef:'الحجر:٨٦',     rule:'DIGITAL_INNOVATION_ROOT'}),
        new RootNeuralCell('RO17','جذر التكامل الخارجي',          inSize,'relu',   { rootDepth:3, domain:'integration',quranRef:'فصلت:٥٣',      rule:'EXTERNAL_INTEGRATION_ROOT'}),
        new RootNeuralCell('RO18','جذر الحوكمة الرقمية',          inSize,'sigmoid',{ rootDepth:3, domain:'digital-gov',quranRef:'يس:١٢',        rule:'DIGITAL_GOV_ROOT'       }),
        new RootNeuralCell('RO19','جذر الأمان السيبراني',         inSize,'relu',   { rootDepth:3, domain:'cybersec',   quranRef:'قريش:٤',       rule:'CYBERSEC_ROOT'          }),
        new RootNeuralCell('RO20','جذر المنصة والسوق',            inSize,'tanh',   { rootDepth:3, domain:'platform',   quranRef:'البقرة:٢٧٥',   rule:'PLATFORM_ROOT'          }),
        new RootNeuralCell('RO21','جذر التوسع العالمي',           inSize,'sigmoid',{ rootDepth:3, domain:'global',     quranRef:'إبراهيم:٤',    rule:'GLOBAL_EXPANSION_ROOT'  }),
    ]);
}

// ── الطبقة الجذرية 4: الجذور المعرفية (28 خلية — جذور المعرفة الشاملة) ───────
// ﴿وَمَا أُوتِيتُم مِّن الْعِلْمِ إِلَّا قَلِيلًا﴾ — الإسراء: ٨٥
function buildKnowledgeRootsLayer(inSize) {
    return new RootNeuralLayer('KNOWLEDGE_ROOTS', 'ROOT', [
        // جذور معرفية مطلقة (7)
        new RootNeuralCell('RK01','جذر التوحيد المطلق',           inSize,'relu',   { rootDepth:4, tier:'ABSOLUTE', rule:'TAWHEED_ABSOLUTE',     quranRef:'الإخلاص:١'     }),
        new RootNeuralCell('RK02','جذر البيان الإلهي',            inSize,'relu',   { rootDepth:4, tier:'ABSOLUTE', rule:'BAYAN_DIVINE',          quranRef:'الرحمن:٤'      }),
        new RootNeuralCell('RK03','جذر الأمانة المطلقة',          inSize,'sigmoid',{ rootDepth:4, tier:'ABSOLUTE', rule:'AMANA_ABSOLUTE',        quranRef:'الإسراء:٣٦'   }),
        new RootNeuralCell('RK04','جذر الإتقان الأعلى',           inSize,'relu',   { rootDepth:4, tier:'ABSOLUTE', rule:'ITQAN_SUPREME',         hadithRef:'البيهقي'      }),
        new RootNeuralCell('RK05','جذر لا ضرر المطلق',            inSize,'sigmoid',{ rootDepth:4, tier:'ABSOLUTE', rule:'NO_HARM_ABSOLUTE',      hadithRef:'ابن ماجه:٢٣٤١'}),
        new RootNeuralCell('RK06','جذر الكمال والشمول',           inSize,'relu',   { rootDepth:4, tier:'ABSOLUTE', rule:'COMPLETENESS_UNIVERSAL', quranRef:'النمل:٨٨'     }),
        new RootNeuralCell('RK07','جذر الحق والعدل',              inSize,'sigmoid',{ rootDepth:4, tier:'ABSOLUTE', rule:'HAQQ_ADL_ROOT',         quranRef:'النحل:٩٠'      }),
        // جذور لسانية (7)
        new RootNeuralCell('RK08','جذر الفطرة الدلالية',          inSize,'tanh',   { rootDepth:4, tier:'LINGUISTIC', rule:'SEMANTIC_FITRAH',      quranRef:'الروم:٣٠'      }),
        new RootNeuralCell('RK09','جذر التكامل الكوني',           inSize,'relu',   { rootDepth:4, tier:'LINGUISTIC', rule:'COSMIC_INTEGRATION',   quranRef:'فصلت:٥٣'       }),
        new RootNeuralCell('RK10','جذر التكيف الذكي',             inSize,'tanh',   { rootDepth:4, tier:'LINGUISTIC', rule:'ADAPTIVE_INTELLIGENCE',quranRef:'البقرة:٢٨٦'   }),
        new RootNeuralCell('RK11','جذر التوافق اللغوي',           inSize,'relu',   { rootDepth:4, tier:'LINGUISTIC', rule:'LINGUISTIC_HARMONY',   quranRef:'إبراهيم:٤'     }),
        new RootNeuralCell('RK12','جذر الاتساق الكوني',           inSize,'relu',   { rootDepth:4, tier:'LINGUISTIC', rule:'COSMIC_CONSISTENCY',   quranRef:'الملك:٣'       }),
        new RootNeuralCell('RK13','جذر حفظ المعرفة',              inSize,'sigmoid',{ rootDepth:4, tier:'LINGUISTIC', rule:'KNOWLEDGE_CONSERVATION',quranRef:'يس:١٢'        }),
        new RootNeuralCell('RK14','جذر السعي للاكتمال',           inSize,'relu',   { rootDepth:4, tier:'LINGUISTIC', rule:'ASPIRATIONAL_COMPLETE', quranRef:'يوسف:٧٦'      }),
        // جذور علمية (7)
        new RootNeuralCell('RK15','جذر المنهج العلمي',            inSize,'relu',   { rootDepth:4, tier:'SCIENTIFIC', rule:'SCIENTIFIC_METHOD',    quranRef:'العلق:١'       }),
        new RootNeuralCell('RK16','جذر السببية والمنطق',          inSize,'tanh',   { rootDepth:4, tier:'SCIENTIFIC', rule:'CAUSALITY_LOGIC',       quranRef:'الحج:٤٦'       }),
        new RootNeuralCell('RK17','جذر الاكتشاف والاستقراء',      inSize,'gelu',   { rootDepth:4, tier:'SCIENTIFIC', rule:'DISCOVERY_INDUCTION',  quranRef:'فصلت:٥٣'       }),
        new RootNeuralCell('RK18','جذر التحقق والتدليل',          inSize,'sigmoid',{ rootDepth:4, tier:'SCIENTIFIC', rule:'VERIFICATION_PROOF',   quranRef:'الإسراء:٣٦'   }),
        new RootNeuralCell('RK19','جذر التجريب والتجربة',         inSize,'relu',   { rootDepth:4, tier:'SCIENTIFIC', rule:'EXPERIMENTATION',       quranRef:'النمل:٢٧'      }),
        new RootNeuralCell('RK20','جذر القياس والمقارنة',         inSize,'tanh',   { rootDepth:4, tier:'SCIENTIFIC', rule:'MEASUREMENT_COMPARE',  quranRef:'الرحمن:٩'      }),
        new RootNeuralCell('RK21','جذر النمذجة والتمثيل',         inSize,'gelu',   { rootDepth:4, tier:'SCIENTIFIC', rule:'MODELING_REPRESENT',   quranRef:'العلق:٤'       }),
        // جذور شرعية (7)
        new RootNeuralCell('RK22','جذر التوافق الشرعي',           inSize,'sigmoid',{ rootDepth:4, tier:'SHARIAH', rule:'SHARIAH_COMPLIANCE',       quranRef:'المائدة:٤٨'   }),
        new RootNeuralCell('RK23','جذر أصل الإباحة',              inSize,'relu',   { rootDepth:4, tier:'SHARIAH', rule:'IBAHA_PRINCIPLE',           quranRef:'الأنعام:١١٩' }),
        new RootNeuralCell('RK24','جذر درء المفاسد',              inSize,'sigmoid',{ rootDepth:4, tier:'SHARIAH', rule:'MAFASID_PREVENTION',        hadithRef:'ابن ماجه:٢٣٤١'}),
        new RootNeuralCell('RK25','جذر جلب المصالح',              inSize,'relu',   { rootDepth:4, tier:'SHARIAH', rule:'MASALIH_PROMOTION',         quranRef:'النحل:٩٠'     }),
        new RootNeuralCell('RK26','جذر الشورى والمشاركة',         inSize,'tanh',   { rootDepth:4, tier:'SHARIAH', rule:'SHURA_PARTICIPATION',       quranRef:'الشورى:٣٨'    }),
        new RootNeuralCell('RK27','جذر الرفق والرحمة',            inSize,'sigmoid',{ rootDepth:4, tier:'SHARIAH', rule:'RIFQ_RAHMA',                quranRef:'آل عمران:١٥٩'}),
        new RootNeuralCell('RK28','جذر الحسبة والرقابة الشرعية', inSize,'relu',   { rootDepth:4, tier:'SHARIAH', rule:'HISBA_SHARIA_OVERSIGHT',    quranRef:'آل عمران:١٠٤'}),
    ]);
}

// ── الطبقة الجذرية 5: التكامل الجذري (14 خلية — دمج كل الجذور) ──────────────
// ﴿إِنَّ هَٰذِهِ أُمَّتُكُمْ أُمَّةً وَاحِدَةً وَأَنَا رَبُّكُمْ فَاعْبُدُونِ﴾ — الأنبياء: ٩٢
function buildRootIntegrationLayer(inSize) {
    return new RootNeuralLayer('ROOT_INTEGRATION', 'INTEGRATION', [
        new RootNeuralCell('RI01','مكامل اللغة والبيان',          inSize,'relu',   { role:'AGG_LANGUAGE',      quranRef:'الرحمن:٤'     }),
        new RootNeuralCell('RI02','مكامل العلم والمعرفة',         inSize,'relu',   { role:'AGG_KNOWLEDGE',     quranRef:'العلق:١'      }),
        new RootNeuralCell('RI03','مكامل الشريعة',                inSize,'relu',   { role:'AGG_SHARIAH',       quranRef:'المائدة:٤٨'   }),
        new RootNeuralCell('RI04','مكامل التجارة',                inSize,'relu',   { role:'AGG_COMMERCE',      quranRef:'البقرة:٢٧٥'   }),
        new RootNeuralCell('RI05','مكامل الإنتاج',                inSize,'sigmoid',{ role:'AGG_PRODUCTION',    quranRef:'النمل:٨٨'     }),
        new RootNeuralCell('RI06','مكامل الحوكمة',                inSize,'relu',   { role:'AGG_GOVERNANCE',    quranRef:'النحل:٩٠'     }),
        new RootNeuralCell('RI07','مكامل الكوني',                 inSize,'tanh',   { role:'AGG_UNIVERSAL',     quranRef:'فصلت:٥٣'      }),
        new RootNeuralCell('RI08','مكامل الأمان',                 inSize,'sigmoid',{ role:'AGG_SECURITY',      quranRef:'قريش:٤'       }),
        new RootNeuralCell('RI09','مكامل الإتقان',                inSize,'relu',   { role:'AGG_EXCELLENCE',    hadithRef:'البيهقي'     }),
        new RootNeuralCell('RI10','مكامل التكامل',                inSize,'relu',   { role:'AGG_INTEGRATION',   quranRef:'الأنبياء:٩٢'  }),
        new RootNeuralCell('RI11','خلية الثقة الجذرية',           inSize,'sigmoid',{ role:'ROOT_CONFIDENCE',   quranRef:'التوبة:١٠٥'   }),
        new RootNeuralCell('RI12','خلية التوحيد الجذري',          inSize,'tanh',   { role:'ROOT_UNIFICATION',  quranRef:'الإخلاص:١'    }),
        new RootNeuralCell('RI13','خلية الأولوية الجذرية',        inSize,'relu',   { role:'ROOT_PRIORITY',     quranRef:'البقرة:٢'     }),
        new RootNeuralCell('RI14','خلية التوازن الجذري',          inSize,'sigmoid',{ role:'ROOT_BALANCE',       quranRef:'الرحمن:٩'     }),
    ]);
}

// ── الطبقة الجذرية 6: الإخراج الجذري (7 خلايا — خاتم القرارات) ──────────────
// ﴿وَتَمَّتْ كَلِمَتُ رَبِّكَ صِدْقًا وَعَدْلًا﴾ — الأنعام: ١١٥
function buildRootOutputLayer(inSize) {
    return new RootNeuralLayer('ROOT_OUTPUT', 'OUTPUT', [
        new RootNeuralCell('ROP1','بوابة الإخراج الجذرية',        inSize,'sigmoid',{ role:'ROOT_OUTPUT_GATE',  quranRef:'البقرة:٢'      }),
        new RootNeuralCell('ROP2','مقياس الثقة الجذرية',         inSize,'sigmoid',{ role:'ROOT_CONFIDENCE',   quranRef:'التوبة:١٠٥'   }),
        new RootNeuralCell('ROP3','كاشف الجذر النشط',            inSize,'relu',   { role:'ACTIVE_ROOT_DETECT',quranRef:'العلق:١'      }),
        new RootNeuralCell('ROP4','محقق الامتثال الجذري',        inSize,'sigmoid',{ role:'ROOT_COMPLIANCE',   quranRef:'المائدة:٤٨'   }),
        new RootNeuralCell('ROP5','مُوجِّه الإجراء الجذري',      inSize,'relu',   { role:'ROOT_ACTION_ROUTE', quranRef:'الأنفال:٦٠'   }),
        new RootNeuralCell('ROP6','مولد المرجع الجذري',          inSize,'tanh',   { role:'ROOT_REF_GEN',      quranRef:'البقرة:٢٨٢'   }),
        new RootNeuralCell('ROP7','خاتم القرار الجذري',          inSize,'sigmoid',{ role:'ROOT_DECISION_SEAL',quranRef:'الأنعام:١١٥'  }),
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم السادس: شبكة الخلايا العصبية الجذرية الكاملة ──────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SheikhaRootNeuralCellNetwork — شبكة الخلايا العصبية الجذرية
 *
 * جذر شيخة للجذور — أفضل شبكة عصبية جذرية بالكون — تامة شاملة متقنة
 *
 * ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ
 *  أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤
 */
class SheikhaRootNeuralCellNetwork extends EventEmitter {
    constructor() {
        super();

        this.name    = 'Sheikha Root Neural Cell Network';
        this.nameAr  = 'شبكة الخلايا العصبية الجذرية — جذر شيخة للجذور';
        this.version = VERSION;
        this.schema  = 'sheikha/root-ncn-v1';
        this.tawheed = TAWHEED;
        this.bismillah = BISMILLAH;

        // ── طبقة التضمين الجذرية ────────────────────────────────────────────
        this._embed = new RootEmbeddingLayer();

        // ── بناء الطبقات الجذرية ────────────────────────────────────────────
        this._layerR0  = buildAbsoluteRootLayer();                    // L0: 1 خلية
        this._layerR1  = buildMajorRootsLayer();                      // L1: 7 خلايا
        const subIn    = ROOT_DIM + 1 + 7;                            // تضمين + L0 + L1
        this._layerR2  = buildSubRootsLayer(subIn);                   // L2: 14 خلية
        const opIn     = subIn + 14;                                  // + L2
        this._layerR3  = buildOperationalRootsLayer(opIn);            // L3: 21 خلية
        const knIn     = opIn + 21;                                   // + L3
        this._layerR4  = buildKnowledgeRootsLayer(knIn);              // L4: 28 خلية
        const intIn    = 1 + 7 + 14 + 21 + 28;                       // كل إشارات L0..L4
        this._layerR5  = buildRootIntegrationLayer(intIn);            // L5: 14 خلية
        const outIn    = intIn + 14;                                  // + L5
        this._layerR6  = buildRootOutputLayer(outIn);                 // L6: 7 خلايا

        this._layers = [
            this._layerR0, this._layerR1, this._layerR2,
            this._layerR3, this._layerR4, this._layerR5, this._layerR6,
        ];

        // ── فهرس الخلايا الجذري الكامل ──────────────────────────────────────
        this._allCells = this._layers.flatMap(l => l.cells);
        this._cellMap  = new Map(this._allCells.map(c => [c.id, c]));

        // ── إحصاءات الجذر ──────────────────────────────────────────────────
        this._trained    = false;
        this._trainCount = 0;
        this._queries    = 0;
        this._history    = [];
        this._startedAt  = new Date().toISOString();

        // ── تسجيل مع البروتوكول (إذا متاح) ─────────────────────────────────
        if (_protocol) {
            try {
                _protocol.register('sheikha-root-neural-cell-network', this, {
                    type: 'ROOT_NEURAL_NETWORK', version: VERSION,
                });
            } catch (_) {}
        }

        console.log(`[ROOT-NCN] 🌳 ${this.nameAr} مُفعَّلة`);
        console.log(`[ROOT-NCN]    • إجمالي الخلايا الجذرية : ${this._allCells.length}`);
        console.log(`[ROOT-NCN]    • أبعاد التضمين الجذري   : ${ROOT_DIM}`);
        console.log(`[ROOT-NCN]    • عدد كلمات المفردات      : ${Object.keys(ROOT_VOCAB).length}`);
        console.log(`[ROOT-NCN]    • الطبقات الجذرية         : ${this._layers.length} (L0→L6)`);
        console.log(`[ROOT-NCN] ✨ ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨`);
    }

    // ── التمرير الأمامي الجذري الكامل ────────────────────────────────────────

    forward(inputText) {
        // 1. تضمين النص (128-dim)
        const emb = this._embed.encode(inputText);

        // 2. الطبقة الجذرية L0 — الجذر المطلق
        const r0 = this._layerR0.forward(emb);

        // 3. الطبقة الجذرية L1 — الجذور الكبرى
        const r1 = this._layerR1.forward(emb);

        // 4. الطبقة الجذرية L2 — الجذور الفرعية
        const combined_r2 = [...emb, ...r0, ...r1];
        const r2 = this._layerR2.forward(combined_r2);

        // 5. الطبقة الجذرية L3 — الجذور التشغيلية
        const combined_r3 = [...combined_r2, ...r2];
        const r3 = this._layerR3.forward(combined_r3);

        // 6. الطبقة الجذرية L4 — الجذور المعرفية
        const combined_r4 = [...combined_r3, ...r3];
        const r4 = this._layerR4.forward(combined_r4);

        // 7. الطبقة الجذرية L5 — التكامل الجذري
        const combined_int = [...r0, ...r1, ...r2, ...r3, ...r4];
        const r5 = this._layerR5.forward(combined_int);

        // 8. الطبقة الجذرية L6 — الإخراج الجذري
        const combined_out = [...combined_int, ...r5];
        const r6 = this._layerR6.forward(combined_out);

        // 9. تحليل الإخراج الجذري
        const rootProbs    = ACT.softmax(r1);
        const rootConfidence = ACT.sigmoid(r6[1] || 0);
        const activeRootIdx  = r1.indexOf(Math.max(...r1));
        const rootDomains    = ['اللغة','العلم','الشريعة','التجارة','الإنتاج','الحوكمة','الكون'];

        return {
            inputText,
            embeddingDim: ROOT_DIM,
            embedding:    emb.slice(0, 16),
            layers: {
                absoluteRoot:  { sigs: r0,  topK: this._layerR0.topK(1),  cell: this._layerR0.cells[0].state() },
                majorRoots:    { sigs: r1,  topK: this._layerR1.topK(3),  probs: rootProbs },
                subRoots:      { sigs: r2,  topK: this._layerR2.topK(3)  },
                opRoots:       { sigs: r3,  topK: this._layerR3.topK(3)  },
                knowledgeRoots:{ sigs: r4,  topK: this._layerR4.topK(3)  },
                integration:   { sigs: r5,  topK: this._layerR5.topK(3)  },
                output:        { sigs: r6,  topK: this._layerR6.topK(3)  },
            },
            rootConfidence,
            activeDomain:    rootDomains[activeRootIdx] || 'عام',
            activeRootCell:  this._layerR1.cells[activeRootIdx]?.nameAr || '',
            totalCells:      this._allCells.length,
        };
    }

    // ── الاستدلال الجذري الشامل ──────────────────────────────────────────────

    /**
     * infer — الاستدلال الجذري الأفضل بالكون
     * @param {string} inputText — النص المدخل
     * @returns {object} نتيجة الاستدلال الجذري الكاملة
     */
    infer(inputText = '') {
        this._queries++;

        // التحقق الشرعي
        let shariah = null;
        if (_protocol) {
            try { shariah = _protocol.shariahCheck(inputText); } catch (_) {}
        }

        // التمرير الأمامي الجذري
        const forward = this.forward(inputText);

        // دمج نتيجة الشبكة الكبرى (إذا متاحة)
        let masterResult = null;
        if (_masterNCN) {
            try {
                const mn = _masterNCN.getInstance ? _masterNCN.getInstance() : null;
                if (mn && typeof mn.infer === 'function') {
                    masterResult = mn.infer(inputText);
                }
            } catch (_) {}
        }

        const result = {
            id:             `root-infer-${Date.now()}-${this._queries}`,
            timestamp:      new Date().toISOString(),
            inputText,
            tawheed:        TAWHEED,
            bismillah:      BISMILLAH,
            rootConfidence: forward.rootConfidence,
            activeDomain:   forward.activeDomain,
            activeRootCell: forward.activeRootCell,
            layers:         forward.layers,
            totalCells:     forward.totalCells,
            shariah,
            masterResult:   masterResult ? { domain: masterResult.domain, confidence: masterResult.confidence } : null,
            version:        VERSION,
            schema:         'sheikha/root-ncn-v1',
        };

        this._history.push({ ts: result.timestamp, domain: result.activeDomain, confidence: result.rootConfidence });
        if (this._history.length > 100) this._history.shift();

        this.emit('infer', result);
        return result;
    }

    // ── التدريب الجذري ──────────────────────────────────────────────────────

    /**
     * train — تدريب الشبكة الجذرية
     * @param {string} inputText — نص الإدخال
     * @param {number[]} targetVec — المتجه المستهدف لطبقة الإخراج
     * @param {number} lr — معدل التعلم
     * @returns {number} قيمة الخسارة
     */
    train(inputText, targetVec, lr = 0.001) {
        // تمرير أمامي
        const forward = this.forward(inputText);
        const output  = forward.layers.output.sigs;
        const target  = targetVec.slice(0, output.length);

        // حساب الخسارة (MSE)
        let loss = 0;
        const dOut = output.map((o, i) => {
            const diff = o - (target[i] || 0);
            loss += diff * diff;
            return 2 * diff / output.length;
        });

        // الانتشار الخلفي
        let dIn = this._layerR6.backward(dOut, lr);
        // تراجع عبر الطبقات
        const intIn = 1 + 7 + 14 + 21 + 28;
        dIn = this._layerR5.backward(dIn.slice(0, intIn), lr);

        this._trainCount++;
        this._trained = true;

        return loss / output.length;
    }

    // ── الوصول للخلايا ──────────────────────────────────────────────────────

    /** جميع الخلايا مع حالتها */
    getCells() {
        return this._allCells.map(c => c.state());
    }

    /** الخلية بالمعرّف */
    getCell(id) {
        const c = this._cellMap.get(id);
        return c ? c.state() : null;
    }

    /** أعلى K خلايا نشاطاً في كل الشبكة الجذرية */
    getTopActiveCells(k = 10) {
        return this._allCells
            .map(c => ({ id: c.id, nameAr: c.nameAr, activation: c.lastOutput, layer: c.rootDepth, meta: c.meta }))
            .sort((a, b) => b.activation - a.activation)
            .slice(0, k);
    }

    /** الخريطة العصبية الجذرية */
    getRootSynapticMap() {
        const nodes = this._allCells.map(c => ({
            id: c.id, nameAr: c.nameAr, layer: c.rootDepth, activation: c.lastOutput,
        }));
        const edges = [];
        for (let i = 0; i < this._layers.length - 1; i++) {
            for (const src of this._layers[i].cells) {
                for (const tgt of this._layers[i + 1].cells) {
                    edges.push({ from: src.id, to: tgt.id, weight: VEC.dot(src.weights.slice(0,5), tgt.weights.slice(0,5)) });
                }
            }
        }
        return { nodes, edges: edges.slice(0, 500), totalNodes: nodes.length, totalEdges: edges.length };
    }

    /** getInstance (singleton) */
    static getInstance() {
        if (!SheikhaRootNeuralCellNetwork._instance) {
            SheikhaRootNeuralCellNetwork._instance = new SheikhaRootNeuralCellNetwork();
        }
        return SheikhaRootNeuralCellNetwork._instance;
    }

    // ── إعادة ضبط الشبكة ────────────────────────────────────────────────────

    reset() {
        this._layers.forEach(l => l.reset());
        this._trained    = false;
        this._trainCount = 0;
        this._queries    = 0;
        this._history    = [];
        console.log('[ROOT-NCN] 🔄 الشبكة الجذرية أُعيد ضبطها');
        return this;
    }

    // ── حالة الشبكة الجذرية الكاملة ─────────────────────────────────────────

    status() {
        return {
            name:        this.name,
            nameAr:      this.nameAr,
            version:     VERSION,
            schema:      this.schema,
            tawheed:     TAWHEED,
            bismillah:   BISMILLAH,
            startedAt:   this._startedAt,
            totalCells:  this._allCells.length,
            embedDim:    ROOT_DIM,
            vocabSize:   Object.keys(ROOT_VOCAB).length,
            layersCount: this._layers.length,
            layerSizes:  this._layers.map(l => ({ name: l.name, cells: l.size })),
            trained:     this._trained,
            trainCount:  this._trainCount,
            queries:     this._queries,
            topActive:   this.getTopActiveCells(7),
            recentHistory: this._history.slice(-5),
            quranRef:    'إبراهيم:٢٤ — ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾',
        };
    }
}

// ── حقل singleton ─────────────────────────────────────────────────────────────
SheikhaRootNeuralCellNetwork._instance = null;

// ═══════════════════════════════════════════════════════════════════════════════
// ── القسم السابع: الواجهة العامة ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/** الحصول على النسخة الوحيدة (singleton) */
function getInstance() {
    return SheikhaRootNeuralCellNetwork.getInstance();
}

/** تفعيل الشبكة الجذرية الأفضل بالكون */
function init() {
    return getInstance();
}

/** الاستدلال الجذري */
function infer(inputText) {
    return getInstance().infer(inputText);
}

/** التدريب الجذري */
function train(inputText, targetVec, lr) {
    return getInstance().train(inputText, targetVec, lr);
}

/** حالة الشبكة */
function status() {
    return getInstance().status();
}

/** جميع الخلايا الجذرية */
function getCells() {
    return getInstance().getCells();
}

/** الخريطة العصبية الجذرية */
function getRootSynapticMap() {
    return getInstance().getRootSynapticMap();
}

/** إعادة ضبط الشبكة */
function reset() {
    return getInstance().reset();
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    SheikhaRootNeuralCellNetwork,
    getInstance,
    init,
    infer,
    train,
    status,
    getCells,
    getRootSynapticMap,
    reset,
    // ثوابت
    TAWHEED,
    BISMILLAH,
    VERSION,
    ROOT_DIM,
    ROOT_VOCAB,
};
