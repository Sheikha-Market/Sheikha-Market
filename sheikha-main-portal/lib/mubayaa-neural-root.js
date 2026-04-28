/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🧠 الشبكة العصبية الجذرية للمبايعة الرقمية
 *  Mubayaa Root Neural Network — MubayaaNeuralRoot
 *
 *  "يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ
 *   وَأُولِي الْأَمْرِ مِنكُمْ" — النساء: ٥٩
 *
 *  البنية العصبية (4 طبقات):
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │  Input (8)  →  RootLayer (12)  →  LoyaltyLayer (8)                 │
 *  │             →  TrustLayer (4)  →  Output (3)                       │
 *  └─────────────────────────────────────────────────────────────────────┘
 *
 *  مُدخَلات الشبكة (8 ميزة):
 *   [0] nameLength      — طول الاسم (مُطبَّع)
 *   [1] hasTribe        — وجود القبيلة (0/1)
 *   [2] nationalityGCC  — جنسية خليجية (0/1)
 *   [3] hasMadhhab      — وجود مذهب (0/1)
 *   [4] pledgeHour      — ساعة المبايعة (مُطبَّعة 0-1)
 *   [5] pledgeDayOfWeek — يوم الأسبوع (مُطبَّع 0-1)
 *   [6] isAuthenticated — مستخدم مسجّل (0/1)
 *   [7] textAgreed      — موافقة صريحة على النص (1 دائماً)
 *
 *  مُخرَجات الشبكة (3 قيم Sigmoid — كل قيمة بين 0 و 1):
 *   [0] pledgeScore     — نقاط المبايعة الكلية
 *   [1] loyaltyIndex    — مؤشر الولاء
 *   [2] trustLevel      — مستوى الثقة
 *
 *  التسجيل: sheikha-root ← mubayaa-neural-root
 *  المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── مسجّل الجذر (اختياري — يُدمَج إذا كان متاحاً) ───────────────────────────
let sheikhaRoot = null;
try {
    sheikhaRoot = require('../core/sheikha-root');
} catch (_) { /* الجذر غير متاح — الشبكة تعمل مستقلة */ }

// ═══════════════════════════════════════════════════════════════════════════════
// 1. MATRIX UTILS — عمليات المصفوفات (نقية بلا مكتبات)
// ═══════════════════════════════════════════════════════════════════════════════

class M {
    constructor(r, c, data) {
        this.r = r;
        this.c = c;
        this.d = data || new Float64Array(r * c);
    }

    // تهيئة Xavier
    static xavier(r, c) {
        const scale = Math.sqrt(2.0 / (r + c));
        const m = new M(r, c);
        for (let i = 0; i < m.d.length; i++) {
            m.d[i] = (Math.random() * 2 - 1) * scale;
        }
        return m;
    }

    static zeros(r, c) { return new M(r, c); }

    get(r, c)    { return this.d[r * this.c + c]; }
    set(r, c, v) { this.d[r * this.c + c] = v; }

    // ضرب مصفوفتين
    static mul(a, b) {
        const out = new M(a.r, b.c);
        for (let i = 0; i < a.r; i++) {
            for (let k = 0; k < a.c; k++) {
                const aik = a.d[i * a.c + k];
                if (aik === 0) continue;
                for (let j = 0; j < b.c; j++) {
                    out.d[i * b.c + j] += aik * b.d[k * b.c + j];
                }
            }
        }
        return out;
    }

    // جمع مصفوفتين
    static add(a, b) {
        const out = new M(a.r, a.c);
        for (let i = 0; i < a.d.length; i++) out.d[i] = a.d[i] + b.d[i];
        return out;
    }

    // طرح
    static sub(a, b) {
        const out = new M(a.r, a.c);
        for (let i = 0; i < a.d.length; i++) out.d[i] = a.d[i] - b.d[i];
        return out;
    }

    // ضرب حديّ (Hadamard)
    static had(a, b) {
        const out = new M(a.r, a.c);
        for (let i = 0; i < a.d.length; i++) out.d[i] = a.d[i] * b.d[i];
        return out;
    }

    scale(s) {
        const out = new M(this.r, this.c);
        for (let i = 0; i < this.d.length; i++) out.d[i] = this.d[i] * s;
        return out;
    }

    T() {  // transpose
        const out = new M(this.c, this.r);
        for (let i = 0; i < this.r; i++) {
            for (let j = 0; j < this.c; j++) {
                out.d[j * this.r + i] = this.d[i * this.c + j];
            }
        }
        return out;
    }

    map(fn) {
        const out = new M(this.r, this.c);
        for (let i = 0; i < this.d.length; i++) out.d[i] = fn(this.d[i]);
        return out;
    }

    sumRows() {
        const out = new M(1, this.c);
        for (let i = 0; i < this.r; i++) {
            for (let j = 0; j < this.c; j++) out.d[j] += this.d[i * this.c + j];
        }
        return out;
    }

    broadcastRow(batchSize) {
        const out = new M(batchSize, this.c);
        for (let i = 0; i < batchSize; i++) {
            for (let j = 0; j < this.c; j++) out.d[i * this.c + j] = this.d[j];
        }
        return out;
    }

    static fromVec(arr) {
        const m = new M(1, arr.length);
        for (let i = 0; i < arr.length; i++) m.d[i] = arr[i];
        return m;
    }

    toVec() { return Array.from(this.d); }

    clone() {
        const m = new M(this.r, this.c);
        m.d.set(this.d);
        return m;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ACTIVATIONS — دوال التفعيل
// ═══════════════════════════════════════════════════════════════════════════════

const ACT = {
    sigmoid: {
        f:  x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
        df: y => y * (1 - y)
    },
    relu: {
        f:  x => Math.max(0, x),
        df: y => y > 0 ? 1 : 0
    },
    tanh: {
        f:  x => Math.tanh(x),
        df: y => 1 - y * y
    },
    leaky: {
        f:  x => x > 0 ? x : 0.01 * x,
        df: y => y > 0 ? 1 : 0.01
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DENSE LAYER — الطبقة الكثيفة مع Adam Optimizer
// ═══════════════════════════════════════════════════════════════════════════════

class Dense {
    constructor(inSize, outSize, actName = 'relu') {
        this.inSize  = inSize;
        this.outSize = outSize;
        this.actName = actName;
        this.act     = ACT[actName];

        this.W = M.xavier(inSize, outSize);
        this.b = M.zeros(1, outSize);

        // Adam states
        this.mW = M.zeros(inSize, outSize);
        this.vW = M.zeros(inSize, outSize);
        this.mB = M.zeros(1, outSize);
        this.vB = M.zeros(1, outSize);
        this.t  = 0;

        this._in  = null;
        this._pre = null;
        this._out = null;
    }

    forward(X) {
        this._in  = X;
        this._pre = M.add(M.mul(X, this.W), this.b.broadcastRow(X.r));
        this._out = this._pre.map(x => this.act.f(x));
        return this._out;
    }

    backward(dOut, lr = 0.001) {
        const beta1 = 0.9, beta2 = 0.999, eps = 1e-8;
        this.t++;

        const dPre = M.had(dOut, this._out.map(y => this.act.df(y)));
        const dW   = M.mul(this._in.T(), dPre);
        const dB   = dPre.sumRows();
        const dX   = M.mul(dPre, this.W.T());

        // Adam update — W
        for (let i = 0; i < dW.d.length; i++) {
            this.mW.d[i] = beta1 * this.mW.d[i] + (1 - beta1) * dW.d[i];
            this.vW.d[i] = beta2 * this.vW.d[i] + (1 - beta2) * dW.d[i] * dW.d[i];
            const mHat   = this.mW.d[i] / (1 - Math.pow(beta1, this.t));
            const vHat   = this.vW.d[i] / (1 - Math.pow(beta2, this.t));
            this.W.d[i] -= lr * mHat / (Math.sqrt(vHat) + eps);
        }

        // Adam update — b
        for (let i = 0; i < dB.d.length; i++) {
            this.mB.d[i] = beta1 * this.mB.d[i] + (1 - beta1) * dB.d[i];
            this.vB.d[i] = beta2 * this.vB.d[i] + (1 - beta2) * dB.d[i] * dB.d[i];
            const mHat   = this.mB.d[i] / (1 - Math.pow(beta1, this.t));
            const vHat   = this.vB.d[i] / (1 - Math.pow(beta2, this.t));
            this.b.d[i] -= lr * mHat / (Math.sqrt(vHat) + eps);
        }

        return dX;
    }

    // تسلسل الأوزان للحفظ
    serialize() {
        return {
            W: Array.from(this.W.d), b: Array.from(this.b.d),
            mW: Array.from(this.mW.d), vW: Array.from(this.vW.d),
            mB: Array.from(this.mB.d), vB: Array.from(this.vB.d),
            t: this.t, inSize: this.inSize, outSize: this.outSize, actName: this.actName
        };
    }

    // استعادة الأوزان
    static deserialize(s) {
        const layer = new Dense(s.inSize, s.outSize, s.actName);
        layer.W.d.set(s.W); layer.b.d.set(s.b);
        layer.mW.d.set(s.mW); layer.vW.d.set(s.vW);
        layer.mB.d.set(s.mB); layer.vB.d.set(s.vB);
        layer.t = s.t;
        return layer;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FEATURE EXTRACTOR — استخراج المُدخَلات من بيانات المبايعة
// ═══════════════════════════════════════════════════════════════════════════════

const GCC_CODES = new Set(['SA', 'AE', 'KW', 'QA', 'BH', 'OM']);

function extractFeatures(pledgeData) {
    const d = pledgeData || {};

    const nameLen = Math.min((d.fullName || '').length / 30, 1.0);

    const hasTribe    = (d.tribe && d.tribe.length > 0) ? 1.0 : 0.0;
    const isGCC       = GCC_CODES.has(d.nationality) ? 1.0 : 0.5;
    const hasMadhhab  = (d.madhhab && d.madhhab.length > 0) ? 1.0 : 0.0;
    const isAuth      = d.userId ? 1.0 : 0.3;
    const textAgreed  = d.agreed === true ? 1.0 : 0.0;

    const now   = new Date(d.pledgedAt || Date.now());
    const hour  = now.getHours() / 23;
    const day   = now.getDay() / 6;

    return [nameLen, hasTribe, isGCC, hasMadhhab, hour, day, isAuth, textAgreed];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. MUBAYAA NEURAL ROOT — الشبكة العصبية الجذرية للمبايعة
// ═══════════════════════════════════════════════════════════════════════════════

class MubayaaNeuralRoot {
    constructor() {
        this.id      = 'mubayaa-neural-root';
        this.version = '1.0.0';
        this.name    = 'الشبكة العصبية الجذرية للمبايعة الرقمية';

        // ─── بنية الشبكة ─────────────────────────────────────────────────────
        // Input(8) → RootLayer(12, tanh) → LoyaltyLayer(8, relu)
        //          → TrustLayer(4, leaky) → Output(3, sigmoid)
        this.layers = [
            new Dense(8,  12, 'tanh'),    // الطبقة الجذرية
            new Dense(12,  8, 'relu'),    // طبقة الولاء
            new Dense(8,   4, 'leaky'),   // طبقة الثقة
            new Dense(4,   3, 'sigmoid')  // طبقة الإخراج
        ];

        this.layerNames = [
            'الطبقة الجذرية',
            'طبقة الولاء',
            'طبقة الثقة',
            'طبقة الإخراج'
        ];

        // إحصائيات الشبكة
        this.stats = {
            totalAnalyzed: 0,
            totalTrained:  0,
            avgScore:      0,
            lastUpdated:   new Date().toISOString()
        };

        this._initialized = false;
        this._loadWeights();
    }

    // ─── تحميل الأوزان من قاعدة البيانات ────────────────────────────────────
    _loadWeights() {
        try {
            const db = require('../config/database');
            const saved = db.read('mubayaaNeuralWeights');
            if (saved && Array.isArray(saved.layers) && saved.layers.length === 4) {
                this.layers = saved.layers.map(s => Dense.deserialize(s));
                this.stats  = saved.stats || this.stats;
                console.log('[MUBAYAA-NR] ✅ أوزان الشبكة العصبية مُستعادة من قاعدة البيانات');
            } else {
                console.log('[MUBAYAA-NR] 🔄 شبكة عصبية جذرية جديدة — أوزان Xavier عشوائية');
            }
        } catch (e) {
            console.log('[MUBAYAA-NR] ⚠️ لا تتوفر قاعدة بيانات — شبكة مؤقتة');
        }
        this._initialized = true;
    }

    // ─── حفظ الأوزان ─────────────────────────────────────────────────────────
    _saveWeights() {
        try {
            const db = require('../config/database');
            db.write('mubayaaNeuralWeights', {
                version: this.version,
                layers:  this.layers.map(l => l.serialize()),
                stats:   this.stats,
                savedAt: new Date().toISOString()
            });
        } catch (_) { /* تجاهل إذا لم تتوفر قاعدة بيانات */ }
    }

    // ─── المرور الأمامي (Forward Pass) ───────────────────────────────────────
    _forward(features) {
        let X = M.fromVec(features);
        const activations = [Array.from(features)];

        for (const layer of this.layers) {
            X = layer.forward(X);
            activations.push(X.toVec());
        }

        return { output: X.toVec(), activations };
    }

    // ─── التدريب المنضبط (Supervised step) ───────────────────────────────────
    _trainStep(features, target, lr = 0.003) {
        const { output, activations } = this._forward(features);

        // MSE loss gradient
        let dOut = M.fromVec(output.map((o, i) => o - target[i]));

        // Backpropagation عبر الطبقات
        for (let i = this.layers.length - 1; i >= 0; i--) {
            dOut = this.layers[i].backward(dOut, lr);
        }

        return output;
    }

    // ─── تحليل مبايعة واحدة ──────────────────────────────────────────────────
    /**
     * @param {object} pledgeData — بيانات المبايعة
     * @returns {object} نتائج التحليل العصبي
     */
    analyze(pledgeData) {
        const features = extractFeatures(pledgeData);
        const { output, activations } = this._forward(features);

        const [pledgeScore, loyaltyIndex, trustLevel] = output;

        // التصنيف النوعي بناءً على مجموع النقاط
        const composite = (pledgeScore * 0.4 + loyaltyIndex * 0.35 + trustLevel * 0.25);
        const grade     = this._grade(composite);

        this.stats.totalAnalyzed++;
        this.stats.avgScore = (
            (this.stats.avgScore * (this.stats.totalAnalyzed - 1) + composite) /
            this.stats.totalAnalyzed
        );
        this.stats.lastUpdated = new Date().toISOString();

        // تدريب تلقائي على المبايعات الصحيحة (agreed = true يُعطي هدف 1.0)
        if (pledgeData.agreed === true) {
            const target = [
                Math.min(pledgeScore + 0.02, 1.0),
                Math.min(loyaltyIndex + 0.02, 1.0),
                Math.min(trustLevel + 0.01, 1.0)
            ];
            this._trainStep(features, target, 0.001);
            this.stats.totalTrained++;

            // حفظ كل 50 تدريب
            if (this.stats.totalTrained % 50 === 0) this._saveWeights();
        }

        return {
            // المُدخَلات
            features: {
                nameLength:      +(features[0] * 30).toFixed(0),
                hasTribe:         features[1] === 1.0,
                isGCC:            features[2] > 0.9,
                hasMadhhab:       features[3] === 1.0,
                pledgeHour:      +(features[4] * 23).toFixed(0),
                pledgeDayOfWeek:  ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'][Math.round(features[5] * 6)],
                isAuthenticated:  features[6] > 0.9,
                textAgreed:       features[7] === 1.0
            },
            // المُخرَجات
            pledgeScore:  +pledgeScore.toFixed(4),
            loyaltyIndex: +loyaltyIndex.toFixed(4),
            trustLevel:   +trustLevel.toFixed(4),
            composite:    +composite.toFixed(4),
            grade,
            // الطبقات العصبية
            layers: activations.slice(1).map((act, i) => ({
                name:        this.layerNames[i],
                activation:  act.map(v => +v.toFixed(4)),
                mean:        +(act.reduce((s, v) => s + v, 0) / act.length).toFixed(4),
                max:         +Math.max(...act).toFixed(4)
            })),
            timestamp: new Date().toISOString()
        };
    }

    // ─── تصنيف المبايعة ──────────────────────────────────────────────────────
    _grade(composite) {
        if (composite >= 0.85) return { ar: 'ممتاز', en: 'Excellent',  color: '#22c55e', stars: 5 };
        if (composite >= 0.70) return { ar: 'جيد جداً', en: 'Very Good', color: '#84cc16', stars: 4 };
        if (composite >= 0.55) return { ar: 'جيد',    en: 'Good',       color: '#eab308', stars: 3 };
        if (composite >= 0.40) return { ar: 'مقبول',  en: 'Acceptable', color: '#f97316', stars: 2 };
        return                        { ar: 'ضعيف',   en: 'Weak',        color: '#ef4444', stars: 1 };
    }

    // ─── تدريب دُفعي من السجل ────────────────────────────────────────────────
    trainFromRegistry(epochs = 5, lr = 0.003) {
        let db, records;
        try {
            db      = require('../config/database');
            records = db.read('mubayaa') || [];
        } catch (_) { return { trained: 0 }; }

        const active = records.filter(r => r.agreed === true && r.status === 'active');
        if (active.length === 0) return { trained: 0, epochs };

        let totalLoss = 0;

        for (let ep = 0; ep < epochs; ep++) {
            // خلط البيانات
            const shuffled = [...active].sort(() => Math.random() - 0.5);
            for (const rec of shuffled) {
                const features = extractFeatures(rec);
                const out      = this._trainStep(features, [1.0, 1.0, 1.0], lr);
                const loss     = out.reduce((s, v) => s + Math.pow(v - 1.0, 2), 0) / 3;
                totalLoss     += loss;
            }
        }

        this.stats.totalTrained += active.length * epochs;
        this._saveWeights();

        return {
            trained:   active.length,
            epochs,
            avgLoss:   +(totalLoss / (active.length * epochs)).toFixed(6),
            timestamp: new Date().toISOString()
        };
    }

    // ─── حالة الشبكة ─────────────────────────────────────────────────────────
    status() {
        return {
            id:          this.id,
            version:     this.version,
            name:        this.name,
            initialized: this._initialized,
            architecture: {
                inputSize:   8,
                layers: this.layers.map((l, i) => ({
                    index:      i + 1,
                    name:       this.layerNames[i],
                    inSize:     l.inSize,
                    outSize:    l.outSize,
                    activation: l.actName,
                    params:     l.W.d.length + l.b.d.length
                })),
                outputSize:   3,
                outputNames: ['pledgeScore', 'loyaltyIndex', 'trustLevel'],
                totalParams: this.layers.reduce((s, l) => s + l.W.d.length + l.b.d.length, 0)
            },
            stats: this.stats,
            registeredInRoot: !!sheikhaRoot
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SINGLETON — نسخة واحدة من الشبكة
// ═══════════════════════════════════════════════════════════════════════════════

const instance = new MubayaaNeuralRoot();

// ─── تسجيل في جذر المنظومة ────────────────────────────────────────────────────
if (sheikhaRoot && typeof sheikhaRoot.registerLayer === 'function') {
    sheikhaRoot.registerLayer('mubayaa-neural-root', instance);
    console.log('[MUBAYAA-NR] 🌐 مُسجَّل في جذر المنظومة: mubayaa-neural-root');
}

module.exports = instance;
