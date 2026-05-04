/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA DIGITAL NEURAL CELL LAYER — طبقة الخلايا العصبية الرقمية           ║
 * ║  طبقة متخصصة بالمجال الرقمي الحديث — فوق جذر شيخة مباشرةً                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 * ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١
 * ﴿عَلَّمَ بِالْقَلَمِ * عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٤-٥
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 * «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي
 * ﴿وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ﴾
 *
 * ┌──────────────────── معمارية الطبقة الرقمية ────────────────────────────────┐
 * │                                                                              │
 * │  INPUT [text/command/digital-signal]                                        │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 0: الجذر الرقمي (1 خلية — التوحيد الرقمي)                           │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 1: كاشف المجال الرقمي (7 خلايا)                                     │
 * │   هوية │ تجارة │ بنية تحتية │ أمان │ بيانات │ ذكاء اصطناعي │ حوكمة رقمية  │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 2: خلايا الهوية الرقمية (12 خلية)                                   │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 3: خلايا التجارة والمدفوعات الرقمية (14 خلية)                       │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 4: خلايا الأمان والخصوصية الرقمية (14 خلية)                         │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  LAYER 5: الإخراج الرقمي (8 خلايا)                                         │
 * │      │                                                                       │
 * │      ▼                                                                       │
 * │  OUTPUT: { digitalDomain, confidence, action, compliance, response }        │
 * └──────────────────────────────────────────────────────────────────────────────┘
 *
 *  إجمالي الخلايا الرقمية: 1+7+12+14+14+8 = 56 خلية رقمية
 *  التضمين: 96-بُعد رقمي × 192 كلمة رقمية
 *  المُحسِّن: Adam (β1=0.9, β2=0.999) + He init
 *  التوافق: ISO 27001 · NCA · SDAIA · سلة · مدى
 *
 * @module sheikha-digital-neural-cell-layer
 * @version 1.0.0
 * @schema sheikha/digital-ncl-v1
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const EventEmitter = require('events');

// ── ثوابت الطبقة الرقمية ─────────────────────────────────────────────────────
const TAWHEED    = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH  = 'بسم الله الرحمن الرحيم';
const VERSION    = '1.0.0';
const DIGITAL_DIM = 96;  // أبعاد التضمين الرقمي

const SYNAPTIC_SAMPLE_SIZE = 5;  // عينة الأوزان للخريطة العصبية

// ═══════════════════════════════════════════════════════════════════════════════
// ── دوال التفعيل والرياضيات الرقمية ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

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
    dSigmoid:   (_, o) => o * (1 - o),
    dTanh:      (_, o) => 1 - o * o,
    dLeakyRelu: (x, _) => x >= 0 ? 1 : 0.01,
    dLinear:    ()     => 1,
});

const INIT = Object.freeze({
    he(n)       { const s = Math.sqrt(2/n); return Array.from({length:n}, ()=>(Math.random()*2-1)*s); },
    zeros: n   => new Array(n).fill(0),
    clip:  (v, lo, hi) => Math.min(hi, Math.max(lo, v)),
});

const VEC = Object.freeze({
    dot:   (a, b) => { let s=0; for(let i=0;i<a.length;i++) s+=a[i]*(b[i]||0); return s; },
    norm:  a => Math.sqrt(a.reduce((s,v)=>s+v*v,0)) || 1e-9,
    clip:  (v, lo, hi) => Math.min(hi, Math.max(lo, v)),
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── الخلية العصبية الرقمية ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class DigitalNeuralCell {
    constructor(id, nameAr, inSize, activation = 'relu', meta = {}) {
        this.id         = id;
        this.nameAr     = nameAr;
        this.inSize     = inSize;
        this.activation = activation;
        this.meta       = { ...meta };

        this.weights    = INIT.he(inSize);
        this.bias       = 0;
        this.lastInput  = null;
        this.lastRaw    = 0;
        this.lastOutput = 0;
        this.fireCount  = 0;

        // Adam state
        this.mW = INIT.zeros(inSize);
        this.vW = INIT.zeros(inSize);
        this.mB = 0; this.vB = 0;
        this.t  = 0;

        this.actFn  = ACT[activation]  || ACT.relu;
        this.dActFn = ACT[`d${activation.charAt(0).toUpperCase()}${activation.slice(1)}`] || ACT.dRelu;
    }

    forward(input) {
        this.lastInput  = input.length === this.inSize
            ? input
            : [...input.slice(0, this.inSize), ...INIT.zeros(Math.max(0, this.inSize - input.length))];
        this.lastRaw    = VEC.dot(this.weights, this.lastInput) + this.bias;
        this.lastOutput = this.actFn(this.lastRaw);
        this.fireCount++;
        return this.lastOutput;
    }

    backward(dOut, lr = 0.001) {
        const dAct  = this.dActFn(this.lastRaw, this.lastOutput) * dOut;
        const dInput = this.weights.map(w => dAct * w);
        this.t++;
        const beta1 = 0.9, beta2 = 0.999, eps = 1e-8;
        for (let i = 0; i < this.inSize; i++) {
            const g = dAct * (this.lastInput[i] || 0);
            this.mW[i] = beta1 * this.mW[i] + (1 - beta1) * g;
            this.vW[i] = beta2 * this.vW[i] + (1 - beta2) * g * g;
            const mHat = this.mW[i] / (1 - beta1 ** this.t);
            const vHat = this.vW[i] / (1 - beta2 ** this.t);
            this.weights[i] = VEC.clip(this.weights[i] - lr * mHat / (Math.sqrt(vHat) + eps), -10, 10);
        }
        this.mB = beta1 * this.mB + (1 - beta1) * dAct;
        this.vB = beta2 * this.vB + (1 - beta2) * dAct * dAct;
        const mHatB = this.mB / (1 - beta1 ** this.t);
        const vHatB = this.vB / (1 - beta2 ** this.t);
        this.bias -= lr * mHatB / (Math.sqrt(vHatB) + eps);
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
            fireCount: this.fireCount, t: this.t, ...this.meta,
        };
    }
}

// ── طبقة خلايا رقمية ─────────────────────────────────────────────────────────
class DigitalNeuralLayer {
    constructor(name, cells) {
        this.name    = name;
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
            .map(c => ({ id: c.id, nameAr: c.nameAr, score: c.lastOutput, meta: c.meta }))
            .sort((a, b) => b.score - a.score)
            .slice(0, k);
    }

    activations() { return this.cells.map(c => c.lastOutput); }
    reset()       { this.cells.forEach(c => c.reset()); return this; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── التضمين الرقمي (96-dim, 192 كلمة) ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const DIGITAL_VOCAB = Object.freeze({
    // الهوية الرقمية (24)
    'هوية':1,'رقمية':2,'مصادقة':3,'توثيق':4,'تحقق':5,'بيانات_شخصية':6,
    'حساب':7,'مستخدم':8,'كلمة_مرور':9,'تشفير':10,'جلسة':11,'رمز':12,
    'شهادة':13,'توقيع':14,'بصمة':15,'نفاذ':16,'iam':17,'oauth':18,
    'jwt':19,'مفتاح':20,'خاص':21,'عام':22,'pki':23,'did':24,
    // التجارة الرقمية (24)
    'دفع':25,'تحويل':26,'محفظة_رقمية':27,'عملة_رقمية':28,'بطاقة':29,'فاتورة_رقمية':30,
    'طلب_رقمي':31,'سلة':32,'checkout':33,'stripe':34,'مدى':35,'stc_pay':36,
    'apple_pay':37,'google_pay':38,'تسوق':39,'متجر':40,'منتج_رقمي':41,'اشتراك':42,
    'عرض_رقمي':43,'سعر_رقمي':44,'خصم_رقمي':45,'كوبون':46,'ضريبة_رقمية':47,'عقد_رقمي':48,
    // البنية التحتية الرقمية (24)
    'سحابة':49,'خادم':50,'api':51,'واجهة':52,'microservice':53,'docker':54,
    'kubernetes':55,'database':56,'cache':57,'cdn':58,'load_balancer':59,'gateway':60,
    'webhook':61,'queue':62,'stream':63,'socket':64,'http':65,'https':66,
    'rest':67,'graphql':68,'grpc':69,'نطاق':70,'dns':71,'ssl':72,
    // الأمان الرقمي (24)
    'أمان':73,'حماية':74,'تشفير_بيانات':75,'خصوصية':76,'gdpr':77,'pdpl':78,
    'nca':79,'جدار_ناري':80,'مراقبة':81,'تحليل_تهديد':82,'اختراق':83,'حادثة':84,
    'backup':85,'استرداد':86,'تحقق_ثنائي':87,'captcha':88,'rate_limit':89,'cors':90,
    'csrf':91,'xss':92,'sql_injection':93,'تدقيق':94,'سجل_أمني':95,'zero_trust':96,
    // البيانات والذكاء الاصطناعي (24)
    'بيانات_ضخمة':97,'تحليل':98,'نموذج_ذكاء':99,'تعلم_آلة':100,'معالجة_لغة':101,'تصنيف_رقمي':102,
    'توصية':103,'بحث_رقمي':104,'فهرسة':105,'ضغط':106,'تحويل_بيانات':107,'pipeline':108,
    'etl':109,'schema':110,'json':111,'xml':112,'csv':113,'embeddings':114,
    'vector_db':115,'rag':116,'llm':117,'fine_tuning':118,'inference_api':119,'monitoring_ai':120,
    // الحوكمة الرقمية (24)
    'امتثال_رقمي':121,'لوائح_رقمية':122,'سياسة_خصوصية':123,'شروط_الخدمة':124,'ترخيص_رقمي':125,'ملكية_فكرية':126,
    'حقوق_بيانات':127,'رقابة_رقمية':128,'تقرير_رقمي':129,'شفافية_رقمية':130,'مساءلة_رقمية':131,'حوكمة_بيانات':132,
    'sdaia':133,'citc':134,'monsha\'at':135,'vat_sa':136,'zatca':137,'ga_domain':138,
    'إدارة_رقمية':139,'تخطيط_رقمي':140,'استراتيجية_رقمية':141,'تحول_رقمي':142,'رؤية_2030':143,'vision_2030':144,
    // الاتصالات والشبكات الرقمية (24)
    'شبكة_رقمية':145,'اتصال':146,'bandwidth':147,'latency':148,'5g':149,'iot':150,
    'bluetooth':151,'wifi':152,'vpn':153,'proxy':154,'p2p':155,'blockchain':156,
    'nft':157,'smart_contract':158,'defi':159,'web3':160,'metaverse':161,'ar_vr':162,
    'edge_computing':163,'fog_computing':164,'quantum_computing':165,'هاتف_ذكي':166,'تطبيق':167,'نظام_تشغيل_موبايل':168,
    // الإنتاج الرقمي (24)
    'devops':169,'ci_cd':170,'git':171,'مستودع_كود':172,'اختبار_رقمي':173,'نشر':174,
    'مراقبة_أداء':175,'تحسين_رقمي':176,'agile':177,'sprint':178,'scrum':179,'kanban':180,
    'code_review':181,'documentation':182,'sdk':183,'npm':184,'pip':185,'docker_compose':186,
    'terraform':187,'ansible':188,'jenkins':189,'github_actions':190,'كود':191,'برمجة':192,
});

class DigitalEmbeddingLayer {
    constructor() {
        this.dim   = DIGITAL_DIM;
        this.vocab = DIGITAL_VOCAB;
        this._vecs = {};
        for (const [word, idx] of Object.entries(DIGITAL_VOCAB)) {
            this._vecs[word] = this._seedVec(idx);
        }
    }

    _seedVec(seed) {
        const v = new Float32Array(DIGITAL_DIM);
        let s = seed * 1664525 + 1013904223;
        for (let i = 0; i < DIGITAL_DIM; i++) {
            s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
            v[i] = ((s >>> 0) / 0xFFFFFFFF) * 2 - 1;
        }
        let n = 0; for (let i = 0; i < DIGITAL_DIM; i++) n += v[i] * v[i];
        n = Math.sqrt(n) || 1;
        for (let i = 0; i < DIGITAL_DIM; i++) v[i] /= n;
        return Array.from(v);
    }

    encode(text = '') {
        const tokens = text
            .replace(/[^\u0600-\u06FFa-zA-Z0-9\s_]/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (tokens.length === 0) return this._seedVec(0);

        const sum = new Float32Array(DIGITAL_DIM);
        let   cnt = 0;

        for (const tok of tokens) {
            const key = tok.toLowerCase();
            const v   = this._vecs[key] || this._vecs[tok];
            if (v) {
                for (let i = 0; i < DIGITAL_DIM; i++) sum[i] += v[i];
                cnt++;
            }
        }

        if (cnt === 0) {
            let h = 5381;
            for (let i = 0; i < text.length; i++) h = (h * 33 ^ text.charCodeAt(i)) >>> 0;
            return this._seedVec(h % 10000);
        }

        for (let i = 0; i < DIGITAL_DIM; i++) sum[i] /= cnt;
        let n = 0; for (let i = 0; i < DIGITAL_DIM; i++) n += sum[i] * sum[i];
        n = Math.sqrt(n) || 1;
        const out = new Array(DIGITAL_DIM);
        for (let i = 0; i < DIGITAL_DIM; i++) out[i] = sum[i] / n;
        return out;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── بناء الطبقات الرقمية ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── الطبقة الرقمية 0: الجذر الرقمي (1 خلية) ─────────────────────────────────
// ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١
function buildDigitalRootLayer() {
    return new DigitalNeuralLayer('DIGITAL_ROOT', [
        new DigitalNeuralCell('DL00','الجذر الرقمي — التوحيد الرقمي', DIGITAL_DIM, 'sigmoid', {
            layer: 0, role: 'DIGITAL_TAWHEED',
            quranRef: 'العلق:١',
            description: 'جذر كل عملية رقمية — لا إله إلا الله',
        }),
    ]);
}

// ── الطبقة الرقمية 1: كاشف المجال الرقمي (7 خلايا) ──────────────────────────
function buildDigitalDomainLayer() {
    return new DigitalNeuralLayer('DIGITAL_DOMAIN', [
        new DigitalNeuralCell('DD01','كاشف الهوية الرقمية',        DIGITAL_DIM,'sigmoid',{ layer:1, domain:'identity',       quranRef:'الحجرات:١١'  }),
        new DigitalNeuralCell('DD02','كاشف التجارة الرقمية',       DIGITAL_DIM,'relu',   { layer:1, domain:'commerce',        quranRef:'البقرة:٢٧٥'  }),
        new DigitalNeuralCell('DD03','كاشف البنية التحتية',        DIGITAL_DIM,'relu',   { layer:1, domain:'infrastructure',  quranRef:'النمل:٨٨'    }),
        new DigitalNeuralCell('DD04','كاشف الأمان الرقمي',         DIGITAL_DIM,'sigmoid',{ layer:1, domain:'security',        quranRef:'قريش:٤'      }),
        new DigitalNeuralCell('DD05','كاشف البيانات والذكاء',       DIGITAL_DIM,'relu',   { layer:1, domain:'data_ai',         quranRef:'العلق:١'     }),
        new DigitalNeuralCell('DD06','كاشف الحوكمة الرقمية',        DIGITAL_DIM,'sigmoid',{ layer:1, domain:'governance',      quranRef:'النحل:٩٠'    }),
        new DigitalNeuralCell('DD07','كاشف الاتصالات الرقمية',     DIGITAL_DIM,'relu',   { layer:1, domain:'comms',           quranRef:'الحديد:٤'    }),
    ]);
}

// ── الطبقة الرقمية 2: خلايا الهوية الرقمية (12 خلية) ─────────────────────────
function buildDigitalIdentityLayer(inSize) {
    return new DigitalNeuralLayer('DIGITAL_IDENTITY', [
        new DigitalNeuralCell('DI01','خلية التوثيق الرقمي',         inSize,'relu',   { layer:2, domain:'identity', rule:'AUTH',          quranRef:'النساء:٥٨'   }),
        new DigitalNeuralCell('DI02','خلية التحقق بخطوتين',         inSize,'sigmoid',{ layer:2, domain:'identity', rule:'MFA',           hadithRef:'البيهقي'   }),
        new DigitalNeuralCell('DI03','خلية إدارة الجلسات',          inSize,'relu',   { layer:2, domain:'identity', rule:'SESSION_MGT',   quranRef:'البقرة:٢٨٢' }),
        new DigitalNeuralCell('DI04','خلية OAuth والرموز',           inSize,'tanh',   { layer:2, domain:'identity', rule:'OAUTH_TOKENS',  quranRef:'الإسراء:٣٦' }),
        new DigitalNeuralCell('DI05','خلية الهوية المركزية',         inSize,'sigmoid',{ layer:2, domain:'identity', rule:'SSO',           quranRef:'الإخلاص:١'  }),
        new DigitalNeuralCell('DI06','خلية نفاذ السعودية',           inSize,'relu',   { layer:2, domain:'identity', rule:'NAFATH',        quranRef:'المائدة:٤٨' }),
        new DigitalNeuralCell('DI07','خلية بيانات الهوية الشخصية',   inSize,'sigmoid',{ layer:2, domain:'identity', rule:'PII_PROTECT',   quranRef:'الحجرات:١٢' }),
        new DigitalNeuralCell('DI08','خلية الصلاحيات والأدوار',      inSize,'relu',   { layer:2, domain:'identity', rule:'RBAC',          quranRef:'النساء:٥٩'  }),
        new DigitalNeuralCell('DI09','خلية التوقيع الرقمي',          inSize,'tanh',   { layer:2, domain:'identity', rule:'DIGITAL_SIG',   quranRef:'النساء:٥٨'  }),
        new DigitalNeuralCell('DI10','خلية PKI والشهادات',            inSize,'sigmoid',{ layer:2, domain:'identity', rule:'PKI_CERTS',     quranRef:'البقرة:٢٨٢' }),
        new DigitalNeuralCell('DI11','خلية الهوية اللامركزية DID',    inSize,'relu',   { layer:2, domain:'identity', rule:'DID',           quranRef:'الإخلاص:١'  }),
        new DigitalNeuralCell('DI12','خلية حماية الخصوصية الرقمية',  inSize,'sigmoid',{ layer:2, domain:'identity', rule:'PRIVACY_GUARD', quranRef:'الحجرات:١٢' }),
    ]);
}

// ── الطبقة الرقمية 3: خلايا التجارة والمدفوعات الرقمية (14 خلية) ─────────────
function buildDigitalCommerceLayer(inSize) {
    return new DigitalNeuralLayer('DIGITAL_COMMERCE', [
        new DigitalNeuralCell('DC01','خلية السوق الرقمي الحلال',     inSize,'relu',   { layer:3, domain:'commerce', rule:'HALAL_DIGITAL_MARKET', quranRef:'البقرة:٢٧٥' }),
        new DigitalNeuralCell('DC02','خلية عقود الدفع الذكية',       inSize,'sigmoid',{ layer:3, domain:'commerce', rule:'PAYMENT_CONTRACTS',   quranRef:'المائدة:١'  }),
        new DigitalNeuralCell('DC03','خلية سلة التسوق',              inSize,'relu',   { layer:3, domain:'commerce', rule:'CART_ENGINE',          quranRef:'البقرة:١٦٨' }),
        new DigitalNeuralCell('DC04','خلية مدى وبطاقات المدفوعات',   inSize,'tanh',   { layer:3, domain:'commerce', rule:'MADA_CARDS',           hadithRef:'أبو داود:٣٤٥٠'}),
        new DigitalNeuralCell('DC05','خلية المحفظة الرقمية',         inSize,'relu',   { layer:3, domain:'commerce', rule:'DIGITAL_WALLET',       quranRef:'التوبة:١٠٥' }),
        new DigitalNeuralCell('DC06','خلية زكاة التجارة الرقمية',    inSize,'sigmoid',{ layer:3, domain:'commerce', rule:'ZAKAT_DIGITAL',        quranRef:'البقرة:٢٧٧' }),
        new DigitalNeuralCell('DC07','خلية الفواتير الإلكترونية ZATCA',inSize,'relu',  { layer:3, domain:'commerce', rule:'ZATCA_EINVOICE',       quranRef:'البقرة:٢٨٢' }),
        new DigitalNeuralCell('DC08','خلية التسعير الذكي',            inSize,'tanh',   { layer:3, domain:'commerce', rule:'SMART_PRICING',        hadithRef:'أبو داود:٣٤٥٠'}),
        new DigitalNeuralCell('DC09','خلية الاشتراكات الرقمية',      inSize,'relu',   { layer:3, domain:'commerce', rule:'SUBSCRIPTIONS',        quranRef:'المائدة:١'  }),
        new DigitalNeuralCell('DC10','خلية إدارة المنتجات الرقمية',  inSize,'sigmoid',{ layer:3, domain:'commerce', rule:'PRODUCT_MANAGEMENT',  quranRef:'النمل:٨٨'   }),
        new DigitalNeuralCell('DC11','خلية خدمة العملاء الرقمية',    inSize,'relu',   { layer:3, domain:'commerce', rule:'DIGITAL_CX',           quranRef:'آل عمران:١٥٩'}),
        new DigitalNeuralCell('DC12','خلية إدارة المرتجعات',          inSize,'tanh',   { layer:3, domain:'commerce', rule:'RETURNS_MGMT',         quranRef:'البقرة:٢٨٦' }),
        new DigitalNeuralCell('DC13','خلية التجارة عبر الحدود',       inSize,'relu',   { layer:3, domain:'commerce', rule:'CROSS_BORDER',         quranRef:'قريش:٢'     }),
        new DigitalNeuralCell('DC14','خلية الامتثال التجاري الرقمي', inSize,'sigmoid',{ layer:3, domain:'commerce', rule:'COMMERCE_COMPLIANCE',  quranRef:'المائدة:٤٨' }),
    ]);
}

// ── الطبقة الرقمية 4: خلايا الأمان والخصوصية الرقمية (14 خلية) ──────────────
function buildDigitalSecurityLayer(inSize) {
    return new DigitalNeuralLayer('DIGITAL_SECURITY', [
        new DigitalNeuralCell('DS01','خلية تشفير AES/RSA',           inSize,'relu',   { layer:4, domain:'security', rule:'ENCRYPTION',         quranRef:'النساء:٥٨'  }),
        new DigitalNeuralCell('DS02','خلية حماية البيانات PDPL',      inSize,'sigmoid',{ layer:4, domain:'security', rule:'PDPL_NCA',           quranRef:'الحجرات:١٢' }),
        new DigitalNeuralCell('DS03','خلية كشف الاختراق',             inSize,'relu',   { layer:4, domain:'security', rule:'INTRUSION_DETECT',   quranRef:'الحديد:٤'   }),
        new DigitalNeuralCell('DS04','خلية النسخ الاحتياطي والاسترداد',inSize,'tanh',  { layer:4, domain:'security', rule:'BACKUP_RECOVERY',    hadithRef:'ابن ماجه:٢٣٤١'}),
        new DigitalNeuralCell('DS05','خلية إدارة الثغرات',            inSize,'relu',   { layer:4, domain:'security', rule:'VULN_MANAGEMENT',    quranRef:'قريش:٤'     }),
        new DigitalNeuralCell('DS06','خلية Zero Trust',               inSize,'sigmoid',{ layer:4, domain:'security', rule:'ZERO_TRUST',         quranRef:'الإسراء:٣٦' }),
        new DigitalNeuralCell('DS07','خلية مراقبة السجلات الأمنية',   inSize,'relu',   { layer:4, domain:'security', rule:'SIEM_LOGGING',       quranRef:'ق:١٨'       }),
        new DigitalNeuralCell('DS08','خلية Rate Limiting وحماية API', inSize,'tanh',   { layer:4, domain:'security', rule:'API_RATE_LIMIT',      hadithRef:'ابن ماجه:٢٣٤١'}),
        new DigitalNeuralCell('DS09','خلية CORS وCSRF والحماية',       inSize,'relu',   { layer:4, domain:'security', rule:'WEB_SECURITY',       quranRef:'البقرة:٢٨٦' }),
        new DigitalNeuralCell('DS10','خلية إدارة المفاتيح HSM',       inSize,'sigmoid',{ layer:4, domain:'security', rule:'KEY_MANAGEMENT',     quranRef:'النساء:٥٨'  }),
        new DigitalNeuralCell('DS11','خلية الهوية الصفرية معرفة ZKP', inSize,'gelu',   { layer:4, domain:'security', rule:'ZERO_KNOWLEDGE',     quranRef:'الإخلاص:١'  }),
        new DigitalNeuralCell('DS12','خلية مراقبة الامتثال الأمني',   inSize,'relu',   { layer:4, domain:'security', rule:'SECURITY_COMPLIANCE',quranRef:'المائدة:٤٨' }),
        new DigitalNeuralCell('DS13','خلية إدارة الهوية والوصول IAM', inSize,'sigmoid',{ layer:4, domain:'security', rule:'IAM_CONTROL',        quranRef:'النساء:٥٩'  }),
        new DigitalNeuralCell('DS14','خلية حماية البنية التحتية',     inSize,'relu',   { layer:4, domain:'security', rule:'INFRA_HARDENING',    quranRef:'نوح:١٥'     }),
    ]);
}

// ── الطبقة الرقمية 5: الإخراج الرقمي (8 خلايا) ──────────────────────────────
// ﴿وَتَمَّتْ كَلِمَتُ رَبِّكَ صِدْقًا وَعَدْلًا﴾ — الأنعام: ١١٥
function buildDigitalOutputLayer(inSize) {
    return new DigitalNeuralLayer('DIGITAL_OUTPUT', [
        new DigitalNeuralCell('DO01','بوابة الإخراج الرقمي',          inSize,'sigmoid',{ role:'DIGITAL_OUTPUT_GATE',    quranRef:'البقرة:٢'     }),
        new DigitalNeuralCell('DO02','مقياس الثقة الرقمية',           inSize,'sigmoid',{ role:'DIGITAL_CONFIDENCE',     quranRef:'التوبة:١٠٥'  }),
        new DigitalNeuralCell('DO03','كاشف المجال الرقمي النشط',      inSize,'relu',   { role:'ACTIVE_DOMAIN_DETECT',   quranRef:'العلق:١'     }),
        new DigitalNeuralCell('DO04','محقق الامتثال الرقمي',          inSize,'sigmoid',{ role:'DIGITAL_COMPLIANCE',     quranRef:'المائدة:٤٨'  }),
        new DigitalNeuralCell('DO05','مُوجِّه الإجراء الرقمي',        inSize,'relu',   { role:'DIGITAL_ACTION_ROUTE',   quranRef:'الأنفال:٦٠'  }),
        new DigitalNeuralCell('DO06','خلية الاستجابة الرقمية',        inSize,'tanh',   { role:'DIGITAL_RESPONSE',       quranRef:'الزلزلة:٧'   }),
        new DigitalNeuralCell('DO07','مولد التوثيق الرقمي',           inSize,'relu',   { role:'DIGITAL_AUDIT_GEN',      quranRef:'البقرة:٢٨٢'  }),
        new DigitalNeuralCell('DO08','خاتم القرار الرقمي',            inSize,'sigmoid',{ role:'DIGITAL_DECISION_SEAL',  quranRef:'الأنعام:١١٥' }),
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── طبقة الخلايا العصبية الرقمية الكاملة ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SheikhaDigitalNeuralCellLayer — طبقة الخلايا العصبية الرقمية
 *
 * ﴿عَلَّمَ بِالْقَلَمِ * عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٤-٥
 */
class SheikhaDigitalNeuralCellLayer extends EventEmitter {
    constructor() {
        super();

        this.name      = 'Sheikha Digital Neural Cell Layer';
        this.nameAr    = 'طبقة الخلايا العصبية الرقمية — شيخة';
        this.version   = VERSION;
        this.schema    = 'sheikha/digital-ncl-v1';
        this.tawheed   = TAWHEED;
        this.bismillah = BISMILLAH;

        // ── طبقة التضمين الرقمية ──────────────────────────────────────────
        this._embed = new DigitalEmbeddingLayer();

        // ── بناء الطبقات الرقمية ──────────────────────────────────────────
        this._layerDL0 = buildDigitalRootLayer();                           // L0: 1
        this._layerDL1 = buildDigitalDomainLayer();                         // L1: 7

        const idIn     = DIGITAL_DIM + 1 + 7;                              // dim + L0 + L1
        this._layerDL2 = buildDigitalIdentityLayer(idIn);                   // L2: 12

        const comIn    = idIn + 12;                                         // + L2
        this._layerDL3 = buildDigitalCommerceLayer(comIn);                  // L3: 14

        const secIn    = comIn + 14;                                        // + L3
        this._layerDL4 = buildDigitalSecurityLayer(secIn);                  // L4: 14

        const outIn    = 1 + 7 + 12 + 14 + 14;                            // all signals = 48
        this._layerDL5 = buildDigitalOutputLayer(outIn);                    // L5: 8

        this._layers = [
            this._layerDL0, this._layerDL1, this._layerDL2,
            this._layerDL3, this._layerDL4, this._layerDL5,
        ];

        // ── فهرس الخلايا ───────────────────────────────────────────────────
        this._allCells = this._layers.flatMap(l => l.cells);
        this._cellMap  = new Map(this._allCells.map(c => [c.id, c]));

        // ── إحصاءات ─────────────────────────────────────────────────────────
        this._queries    = 0;
        this._trainCount = 0;
        this._history    = [];
        this._startedAt  = new Date().toISOString();

        console.log(`[DIGITAL-NCL] 💻 ${this.nameAr} مُفعَّلة`);
        console.log(`[DIGITAL-NCL]    • إجمالي الخلايا الرقمية : ${this._allCells.length}`);
        console.log(`[DIGITAL-NCL]    • أبعاد التضمين الرقمي   : ${DIGITAL_DIM}`);
        console.log(`[DIGITAL-NCL]    • عدد كلمات المفردات      : ${Object.keys(DIGITAL_VOCAB).length}`);
        console.log(`[DIGITAL-NCL]    • الطبقات الرقمية         : ${this._layers.length} (L0→L5)`);
        console.log(`[DIGITAL-NCL] ✨ ﴿عَلَّمَ بِالْقَلَمِ﴾ — العلق: ٤`);
    }

    // ── التمرير الأمامي الرقمي ───────────────────────────────────────────────

    forward(inputText) {
        const emb = this._embed.encode(inputText);

        const dl0 = this._layerDL0.forward(emb);
        const dl1 = this._layerDL1.forward(emb);

        const combined_dl2 = [...emb, ...dl0, ...dl1];
        const dl2 = this._layerDL2.forward(combined_dl2);

        const combined_dl3 = [...combined_dl2, ...dl2];
        const dl3 = this._layerDL3.forward(combined_dl3);

        const combined_dl4 = [...combined_dl3, ...dl3];
        const dl4 = this._layerDL4.forward(combined_dl4);

        const combined_out = [...dl0, ...dl1, ...dl2, ...dl3, ...dl4];
        const dl5 = this._layerDL5.forward(combined_out);

        const domProbs    = ACT.softmax(dl1);
        const confidence  = ACT.sigmoid(dl5[1] || 0);
        const activeDomIdx = dl1.indexOf(Math.max(...dl1));
        const digitalDomains = ['هوية','تجارة','بنية_تحتية','أمان','بيانات_وذكاء','حوكمة_رقمية','اتصالات'];

        return {
            inputText,
            embeddingDim: DIGITAL_DIM,
            embedding:    emb.slice(0, 12),
            layers: {
                digitalRoot:    { sigs: dl0, topK: this._layerDL0.topK(1) },
                digitalDomain:  { sigs: dl1, topK: this._layerDL1.topK(3), probs: domProbs },
                identity:       { sigs: dl2, topK: this._layerDL2.topK(3) },
                commerce:       { sigs: dl3, topK: this._layerDL3.topK(3) },
                security:       { sigs: dl4, topK: this._layerDL4.topK(3) },
                output:         { sigs: dl5, topK: this._layerDL5.topK(3) },
            },
            confidence,
            activeDomain:  digitalDomains[activeDomIdx] || 'عام',
            activeCell:    this._layerDL1.cells[activeDomIdx]?.nameAr || '',
            totalCells:    this._allCells.length,
        };
    }

    // ── الاستدلال الرقمي الشامل ──────────────────────────────────────────────

    /**
     * infer — الاستدلال الرقمي
     * @param {string} inputText
     * @returns {object}
     */
    infer(inputText = '') {
        this._queries++;
        const forward = this.forward(inputText);

        const result = {
            id:           `digital-${Date.now()}-${this._queries}`,
            timestamp:    new Date().toISOString(),
            inputText,
            tawheed:      TAWHEED,
            bismillah:    BISMILLAH,
            confidence:   forward.confidence,
            activeDomain: forward.activeDomain,
            activeCell:   forward.activeCell,
            layers:       forward.layers,
            totalCells:   forward.totalCells,
            version:      VERSION,
            schema:       this.schema,
            quranRef:     '﴿عَلَّمَ بِالْقَلَمِ * عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٤-٥',
        };

        this._history.push({ ts: result.timestamp, domain: result.activeDomain, confidence: result.confidence });
        if (this._history.length > 100) this._history.shift();

        this.emit('infer', result);
        return result;
    }

    // ── التدريب الرقمي ──────────────────────────────────────────────────────

    /**
     * train — تدريب الطبقة الرقمية
     */
    train(inputText, targetVec, lr = 0.001) {
        const forward = this.forward(inputText);
        const output  = forward.layers.output.sigs;
        const target  = targetVec.slice(0, output.length);

        let loss = 0;
        const dOut = output.map((o, i) => {
            const diff = o - (target[i] || 0);
            loss += diff * diff;
            return 2 * diff / output.length;
        });

        this._layerDL5.backward(dOut, lr);
        this._trainCount++;
        return loss / output.length;
    }

    // ── وصول الخلايا ─────────────────────────────────────────────────────────

    getCells()  { return this._allCells.map(c => c.state()); }
    getCell(id) { const c = this._cellMap.get(id); return c ? c.state() : null; }

    getTopActiveCells(k = 7) {
        return this._allCells
            .map(c => ({ id: c.id, nameAr: c.nameAr, activation: c.lastOutput, meta: c.meta }))
            .sort((a, b) => b.activation - a.activation)
            .slice(0, k);
    }

    getDigitalSynapticMap() {
        const nodes = this._allCells.map(c => ({
            id: c.id, nameAr: c.nameAr, layer: c.meta.layer || 0, activation: c.lastOutput,
        }));
        const edges = [];
        for (let i = 0; i < this._layers.length - 1; i++) {
            for (const src of this._layers[i].cells) {
                for (const tgt of this._layers[i + 1].cells) {
                    edges.push({
                        from: src.id,
                        to:   tgt.id,
                        weight: VEC.dot(
                            src.weights.slice(0, SYNAPTIC_SAMPLE_SIZE),
                            tgt.weights.slice(0, SYNAPTIC_SAMPLE_SIZE)
                        ),
                    });
                }
            }
        }
        return {
            nodes,
            edges:      edges.slice(0, 500),
            totalNodes: nodes.length,
            totalEdges: edges.length,
        };
    }

    reset() {
        this._layers.forEach(l => l.reset());
        this._queries = 0; this._trainCount = 0; this._history = [];
        console.log('[DIGITAL-NCL] 🔄 الطبقة الرقمية أُعيد ضبطها');
        return this;
    }

    static getInstance() {
        if (!SheikhaDigitalNeuralCellLayer._instance) {
            SheikhaDigitalNeuralCellLayer._instance = new SheikhaDigitalNeuralCellLayer();
        }
        return SheikhaDigitalNeuralCellLayer._instance;
    }

    // ── حالة الطبقة الرقمية ───────────────────────────────────────────────────

    status() {
        return {
            name:       this.name,
            nameAr:     this.nameAr,
            version:    VERSION,
            schema:     this.schema,
            tawheed:    TAWHEED,
            bismillah:  BISMILLAH,
            startedAt:  this._startedAt,
            totalCells: this._allCells.length,
            embedDim:   DIGITAL_DIM,
            vocabSize:  Object.keys(DIGITAL_VOCAB).length,
            layers:     this._layers.length,
            layerSizes: this._layers.map(l => ({ name: l.name, cells: l.size })),
            trained:    this._trainCount > 0,
            trainCount: this._trainCount,
            queries:    this._queries,
            topActive:  this.getTopActiveCells(5),
            recentHistory: this._history.slice(-5),
            quranRef:   '﴿عَلَّمَ بِالْقَلَمِ * عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٤-٥',
            compliance: ['ISO 27001','NCA','PDPL','ZATCA','CITC'],
        };
    }
}

// ── حقل singleton ─────────────────────────────────────────────────────────────
SheikhaDigitalNeuralCellLayer._instance = null;

// ═══════════════════════════════════════════════════════════════════════════════
// ── الواجهة العامة ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function getInstance() { return SheikhaDigitalNeuralCellLayer.getInstance(); }
function init()        { return getInstance(); }
function infer(text)   { return getInstance().infer(text); }
function train(text, targetVec, lr) { return getInstance().train(text, targetVec, lr); }
function getCells()    { return getInstance().getCells(); }
function getCell(id)   { return getInstance().getCell(id); }
function getDigitalSynapticMap() { return getInstance().getDigitalSynapticMap(); }
function reset()       { return getInstance().reset(); }
function status()      { return getInstance().status(); }

module.exports = {
    SheikhaDigitalNeuralCellLayer,
    getInstance,
    init,
    infer,
    train,
    getCells,
    getCell,
    getDigitalSynapticMap,
    reset,
    status,
    TAWHEED,
    BISMILLAH,
    VERSION,
    DIGITAL_DIM,
    DIGITAL_VOCAB,
};
