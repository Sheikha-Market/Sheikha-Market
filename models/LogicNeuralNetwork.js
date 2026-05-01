/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🧠 الشبكة العصبية لكل أنواع المنطق بالكون — منظومة شيخة
 *  Logic Neural Network — Universal Logic Activation Engine
 *
 *  "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: 31
 *
 *  البنية العصبية:
 *    • طبقة الإدخال   (InputLayer)   : 21 خاصية — واحدة لكل منطق
 *    • طبقة المنطق الأصلية (CoreLayer)    : 7 خلايا عصبية — المنطق السباعي
 *    • طبقة المنطق الموسّع (ExtLayer)  : 13 خلية عصبية — المنطق الموسّع
 *    • طبقة التكامل   (SynthLayer)  : 20 خلية عصبية — كل المنطقيات
 *    • طبقة الإخراج   (MasterLayer) : 1 خلية عليا — المنطق الأعلى (التوحيد)
 *
 *  الخصائص:
 *    ✅ عمليات مصفوفات حقيقية (بجافاسكربت نقي — بلا مكتبات خارجية)
 *    ✅ دوال تفعيل: Sigmoid, ReLU, Softmax, Tanh
 *    ✅ Adam Optimizer للتدريب
 *    ✅ كل منطق = خلية عصبية بأوزان وانحياز واتصالات
 *    ✅ الخريطة العصبية Synaptic Map: الاتصال بين كل منطقين
 *    ✅ Backpropagation لتعديل الأوزان
 *    ✅ حفظ/استرداد حالة الشبكة من قاعدة البيانات
 *    ✅ المنطق الأعلى (MASTER) = عقدة الإخراج العليا
 *
 *  المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const database = require('../config/database');
const { ALL_LOGICS, MASTER_LOGIC, LOGIC_TYPES } = require('./SheikhaLogics');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. MATRIX — عمليات المصفوفات (القاعدة الرياضية للشبكة)
// ═══════════════════════════════════════════════════════════════════════════════

class Matrix {
    constructor(rows, cols, data = null) {
        this.rows = rows;
        this.cols = cols;
        this.data = data || new Float64Array(rows * cols);
    }

    static zeros(r, c) { return new Matrix(r, c); }

    static random(r, c, scale = 0.1) {
        const m = new Matrix(r, c);
        for (let i = 0; i < m.data.length; i++) {
            m.data[i] = (Math.random() * 2 - 1) * scale;
        }
        return m;
    }

    // Xavier initialization — أفضل لتقليل مشكلة Vanishing/Exploding gradient
    static xavier(r, c) {
        return Matrix.random(r, c, Math.sqrt(2.0 / (r + c)));
    }

    get(r, c)    { return this.data[r * this.cols + c]; }
    set(r, c, v) { this.data[r * this.cols + c] = v; }

    // ضرب مصفوفات
    static multiply(a, b) {
        if (a.cols !== b.rows) throw new Error(`Matrix dimensions incompatible: ${a.rows}x${a.cols} * ${b.rows}x${b.cols}`);
        const out = new Matrix(a.rows, b.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let k = 0; k < a.cols; k++) {
                const aik = a.data[i * a.cols + k];
                if (aik === 0) continue;
                for (let j = 0; j < b.cols; j++) {
                    out.data[i * b.cols + j] += aik * b.data[k * b.cols + j];
                }
            }
        }
        return out;
    }

    // جمع
    static add(a, b) {
        const out = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] + b.data[i];
        return out;
    }

    // طرح
    static subtract(a, b) {
        const out = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] - b.data[i];
        return out;
    }

    // ضرب عنصر بعنصر (Hadamard)
    static hadamard(a, b) {
        const out = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] * b.data[i];
        return out;
    }

    scale(s) {
        const out = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.data.length; i++) out.data[i] = this.data[i] * s;
        return out;
    }

    transpose() {
        const out = new Matrix(this.cols, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                out.data[j * this.rows + i] = this.data[i * this.cols + j];
            }
        }
        return out;
    }

    map(fn) {
        const out = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.data.length; i++) out.data[i] = fn(this.data[i]);
        return out;
    }

    sumRows() {
        const out = new Matrix(1, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) out.data[j] += this.data[i * this.cols + j];
        }
        return out;
    }

    // بث الانحياز على الدفعة
    broadcastBias(batchSize) {
        const out = new Matrix(batchSize, this.cols);
        for (let i = 0; i < batchSize; i++) {
            for (let j = 0; j < this.cols; j++) out.data[i * this.cols + j] = this.data[j];
        }
        return out;
    }

    toArray() {
        return Array.from(this.data);
    }

    static fromArray(arr) {
        const m = new Matrix(1, arr.length);
        for (let i = 0; i < arr.length; i++) m.data[i] = arr[i];
        return m;
    }

    clone() {
        const m = new Matrix(this.rows, this.cols);
        m.data.set(this.data);
        return m;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ACTIVATIONS — دوال التفعيل العصبي
// ═══════════════════════════════════════════════════════════════════════════════

const Act = {
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
    leakyRelu: {
        f:  x => x > 0 ? x : 0.01 * x,
        df: y => y > 0 ? 1 : 0.01
    },
    identity: {
        f:  x => x,
        df: () => 1
    },
    softmax: {
        // يُطبَّق على مصفوفة صف كاملة
        fVec(arr) {
            const max = Math.max(...arr);
            const exps = arr.map(x => Math.exp(x - max));
            const s = exps.reduce((a, b) => a + b, 0);
            return exps.map(e => e / (s || 1));
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DENSE LAYER — الطبقة الكثيفة مع Adam Optimizer
// ═══════════════════════════════════════════════════════════════════════════════

class DenseLayer {
    constructor(inSize, outSize, activation = 'relu') {
        this.inSize  = inSize;
        this.outSize = outSize;
        this.actName = activation;
        this.act     = Act[activation];

        this.W = Matrix.xavier(inSize, outSize);
        this.b = Matrix.zeros(1, outSize);

        // حالات Adam
        this.mW = Matrix.zeros(inSize, outSize);
        this.vW = Matrix.zeros(inSize, outSize);
        this.mB = Matrix.zeros(1, outSize);
        this.vB = Matrix.zeros(1, outSize);
        this.t  = 0;

        // للتدريب
        this._input = null;
        this._pre   = null;
        this._out   = null;
    }

    forward(X) {
        this._input = X;
        this._pre   = Matrix.add(Matrix.multiply(X, this.W), this.b.broadcastBias(X.rows));

        if (this.actName === 'softmax') {
            this._out = new Matrix(this._pre.rows, this._pre.cols);
            for (let i = 0; i < this._pre.rows; i++) {
                const row = Array.from(this._pre.data.slice(i * this._pre.cols, (i + 1) * this._pre.cols));
                const sm  = Act.softmax.fVec(row);
                for (let j = 0; j < sm.length; j++) this._out.data[i * this._pre.cols + j] = sm[j];
            }
        } else {
            this._out = this._pre.map(x => this.act.f(x));
        }
        return this._out;
    }

    backward(dOut, lr = 0.001) {
        let dPre;
        if (this.actName === 'softmax') {
            dPre = dOut;
        } else {
            dPre = new Matrix(dOut.rows, dOut.cols);
            for (let i = 0; i < dOut.data.length; i++) {
                dPre.data[i] = dOut.data[i] * this.act.df(this._out.data[i]);
            }
        }

        const dW = Matrix.multiply(this._input.transpose(), dPre);
        const dB = dPre.sumRows();
        const dX = Matrix.multiply(dPre, this.W.transpose());

        this._adam(dW, dB, lr);
        return dX;
    }

    _adam(dW, dB, lr, b1 = 0.9, b2 = 0.999, eps = 1e-8) {
        this.t++;
        const update = (arr, m, v) => {
            for (let i = 0; i < arr.data.length; i++) {
                m.data[i] = b1 * m.data[i] + (1 - b1) * arr.data[i];
                v.data[i] = b2 * v.data[i] + (1 - b2) * arr.data[i] * arr.data[i];
                const mH = m.data[i] / (1 - Math.pow(b1, this.t));
                const vH = v.data[i] / (1 - Math.pow(b2, this.t));
                return lr * mH / (Math.sqrt(vH) + eps);
            }
        };
        for (let i = 0; i < this.W.data.length; i++) {
            this.mW.data[i] = b1 * this.mW.data[i] + (1 - b1) * dW.data[i];
            this.vW.data[i] = b2 * this.vW.data[i] + (1 - b2) * dW.data[i] * dW.data[i];
            const mH = this.mW.data[i] / (1 - Math.pow(b1, this.t));
            const vH = this.vW.data[i] / (1 - Math.pow(b2, this.t));
            this.W.data[i] -= lr * mH / (Math.sqrt(vH) + eps);
        }
        for (let i = 0; i < this.b.data.length; i++) {
            this.mB.data[i] = b1 * this.mB.data[i] + (1 - b1) * dB.data[i];
            this.vB.data[i] = b2 * this.vB.data[i] + (1 - b2) * dB.data[i] * dB.data[i];
            const mH = this.mB.data[i] / (1 - Math.pow(b1, this.t));
            const vH = this.vB.data[i] / (1 - Math.pow(b2, this.t));
            this.b.data[i] -= lr * mH / (Math.sqrt(vH) + eps);
        }
    }

    // تصدير الأوزان كمصفوفة JS عادية (للتخزين)
    exportWeights() {
        return {
            W: Array.from(this.W.data),
            b: Array.from(this.b.data),
            inSize:  this.inSize,
            outSize: this.outSize,
            actName: this.actName,
            t:       this.t
        };
    }

    // استيراد الأوزان المحفوظة
    importWeights(saved) {
        if (!saved) return;
        if (saved.W && saved.W.length === this.W.data.length) this.W.data.set(saved.W);
        if (saved.b && saved.b.length === this.b.data.length) this.b.data.set(saved.b);
        if (saved.t) this.t = saved.t;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. LOGIC NEURON — خلية عصبية لكل نوع منطق
// ═══════════════════════════════════════════════════════════════════════════════

class LogicNeuron {
    constructor(logicDef) {
        this.id       = logicDef.id;
        this.nameAr   = logicDef.nameAr;
        this.nameEn   = logicDef.nameEn;
        this.icon     = logicDef.icon;
        this.category = logicDef.category || 'core';

        // حالة الخلية
        this.activation   = 0;       // قيمة التفعيل الحالية (0–1)
        this.potential    = 0;       // إمكانية التفعيل (قبل التفعيل النهائي)
        this.firingCount  = 0;       // عدد مرات إطلاق الخلية
        this.lastFiredAt  = null;    // وقت آخر إطلاق

        // أوزان الاتصال الخاصة بهذه الخلية مع كل خلية أخرى
        // تُحدَّث عبر طبقات DenseLayer
        this.synapticWeight = 1.0;   // الوزن الشامل لهذه الخلية في الشبكة
    }

    // إطلاق الخلية بمستوى تفعيل معين
    fire(level) {
        this.activation  = Math.max(0, Math.min(1, level));
        this.potential   = level;
        if (this.activation > 0.1) {
            this.firingCount++;
            this.lastFiredAt = new Date().toISOString();
        }
        return this.activation;
    }

    reset() {
        this.activation = 0;
        this.potential  = 0;
    }

    toJSON() {
        return {
            id:           this.id,
            nameAr:       this.nameAr,
            nameEn:       this.nameEn,
            icon:         this.icon,
            category:     this.category,
            activation:   +this.activation.toFixed(4),
            potential:    +this.potential.toFixed(4),
            firingCount:  this.firingCount,
            lastFiredAt:  this.lastFiredAt,
            synapticWeight: +this.synapticWeight.toFixed(4)
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. LOGIC NEURAL NETWORK — الشبكة العصبية الجامعة
// ═══════════════════════════════════════════════════════════════════════════════

const N_LOGICS = ALL_LOGICS.length; // 20
const N_CORE   = 7;
const N_EXT    = 13;
const N_INPUT  = N_LOGICS;          // 20-dim input vector
const N_HIDDEN  = 32;               // طبقة مخفية وسيطة
const N_OUTPUT = N_LOGICS;          // 20-dim output (activation for each logic)
const N_MASTER = 1;                 // خلية المنطق الأعلى

class LogicNeuralNetwork {
    constructor() {
        // ─── الخلايا العصبية — واحدة لكل منطق ────────────────────────────────
        this.neurons = ALL_LOGICS.map(l => new LogicNeuron(l));

        // خلية المنطق الأعلى
        this.masterNeuron = new LogicNeuron({
            id:       MASTER_LOGIC.id,
            nameAr:   MASTER_LOGIC.nameAr,
            nameEn:   MASTER_LOGIC.nameEn,
            icon:     MASTER_LOGIC.icon,
            category: 'master'
        });

        // فهرس سريع بالمعرف
        this.neuronIndex = {};
        this.neurons.forEach((n, i) => { this.neuronIndex[n.id] = i; });

        // ─── الطبقات ──────────────────────────────────────────────────────────
        //   Layer 1: Input(20) → Core(7) — يُعالج المنطق الأصلي السباعي
        this.coreLayer     = new DenseLayer(N_INPUT,  N_CORE,  'sigmoid');

        //   Layer 2: Core(7) → Extended(13) — يُغذّي المنطق الموسّع من الأصلي
        this.extLayer      = new DenseLayer(N_CORE,   N_EXT,   'sigmoid');

        //   Layer 3: Extended(13) → Synthesis(20) — دمج كل المنطقيات
        this.synthLayer    = new DenseLayer(N_EXT,    N_OUTPUT, 'sigmoid');

        //   Layer 4: Synthesis(20) → Master(1) — خلية المنطق الأعلى
        this.masterLayer   = new DenseLayer(N_OUTPUT, N_MASTER, 'sigmoid');

        //   Layer 5: Synthesis(20) → Rank(20) softmax — ترتيب أولويات المنطق
        this.rankingLayer  = new DenseLayer(N_OUTPUT, N_OUTPUT, 'softmax');

        // ─── فهرس الأوزان الأولية للمنطقيات المترابطة ─────────────────────────
        //  تمثل قوة الارتباط المسبق بين كل زوج من المنطقيات
        this.synapticMap = this._buildSynapticMap();

        // ─── سجل الاستدلال ────────────────────────────────────────────────────
        this.inferenceLog  = [];
        this.trainedSteps  = 0;
        this.totalInferences = 0;

        // ─── مراجعة المنطق الأعلى — يُطبَّق بعد كل استدلال ─────────────────
        this.masterShield  = true;  // المنطق الأعلى يحجب أي مخرج يخالف التوحيد
    }

    // ─── بناء خريطة الاتصالات الدلالية الأولية بين المنطقيات ─────────────────
    _buildSynapticMap() {
        const map = {};
        const pairs = [
            // المنطق السباعي — ترابط داخلي قوي
            ['organizational', 'administrative',  0.92],
            ['organizational', 'structural',      0.88],
            ['organizational', 'legislative',     0.85],
            ['legislative',    'commercial',      0.90],
            ['legislative',    'quality',         0.80],
            ['commercial',     'planning',        0.82],
            ['commercial',     'executive',       0.87],
            ['scientific',     'research',        0.95],
            ['scientific',     'methodological',  0.88],
            ['research',       'improvement',     0.85],
            ['research',       'developmental',   0.88],
            ['technical',      'computational',   0.92],
            ['technical',      'structural',      0.83],
            ['technological',  'computational',   0.93],
            ['technological',  'adaptive',        0.80],
            // المنطق الموسّع — ترابط متقاطع
            ['methodological', 'quality',         0.88],
            ['methodological', 'planning',        0.86],
            ['administrative', 'executive',       0.93],
            ['administrative', 'planning',        0.87],
            ['structural',     'planning',        0.82],
            ['planning',       'developmental',   0.87],
            ['network',        'commercial',      0.85],
            ['network',        'adaptive',        0.80],
            ['executive',      'improvement',     0.88],
            ['developmental',  'improvement',     0.92],
            ['improvement',    'adaptive',        0.86],
            ['adaptive',       'environmental',   0.78],
            ['environmental',  'universal',       0.88],
            ['computational',  'methodological',  0.82],
            ['computational',  'scientific',      0.87],
            ['universal',      'legislative',     0.90],
            ['universal',      'master',          1.00]
        ];

        pairs.forEach(([a, b, w]) => {
            if (!map[a]) map[a] = {};
            if (!map[b]) map[b] = {};
            map[a][b] = w;
            map[b][a] = w;  // متماثل
        });

        return map;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔵 FORWARD PROPAGATION — الانتشار الأمامي عبر طبقات المنطق
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * infer — استدلال أي المنطقيات يجب تفعيلها بناءً على السياق
     * @param {number[]} inputVec — متجه 20 بُعد (قيمة 0–1 لكل منطق)
     *                               أو يُولَّد من نص إن لم يُقدَّم
     * @param {string}   context  — وصف السياق (اختياري) للسجل
     * @returns {object} نتيجة الاستدلال
     */
    infer(inputVec, context = '') {
        // إذا لم يُقدَّم متجه، ابدأ بتوزيع متساوٍ
        if (!inputVec || inputVec.length === 0) {
            inputVec = new Array(N_INPUT).fill(0.5);
        }

        // تأكد من طول المتجه
        while (inputVec.length < N_INPUT) inputVec.push(0);
        inputVec = inputVec.slice(0, N_INPUT);

        // ─── إدخال المتجه في الشبكة ───────────────────────────────────────────
        const X = Matrix.fromArray(inputVec);

        // طبقة 1: المنطق الأصلي السباعي
        const coreFeat  = this.coreLayer.forward(X);

        // طبقة 2: المنطق الموسّع
        const extFeat   = this.extLayer.forward(coreFeat);

        // طبقة 3: التكامل الكامل
        const synthFeat = this.synthLayer.forward(extFeat);

        // طبقة 4: المنطق الأعلى — مستوى التوحيد
        const masterAct = this.masterLayer.forward(synthFeat);

        // طبقة 5: ترتيب أولويات المنطق (Softmax)
        const rankVec   = this.rankingLayer.forward(synthFeat);

        // ─── تحديث الخلايا العصبية ───────────────────────────────────────────
        this.neurons.forEach((neuron, i) => {
            neuron.fire(synthFeat.data[i] || 0);
        });

        const masterActivation = masterAct.data[0] || 0;
        this.masterNeuron.fire(masterActivation);

        // ─── درجة الانتشار العصبي عبر الخريطة ────────────────────────────────
        const propagated = this._propagateSynaptic(synthFeat.toArray());

        // ─── بناء نتيجة الاستدلال ────────────────────────────────────────────
        const results = ALL_LOGICS.map((logic, i) => ({
            id:         logic.id,
            nameAr:     logic.nameAr,
            nameEn:     logic.nameEn,
            icon:       logic.icon,
            category:   logic.category || 'core',
            activation: +((synthFeat.data[i] || 0)).toFixed(4),
            rank:       +((rankVec.data[i] || 0)).toFixed(4),
            propagated: +((propagated[i] || 0)).toFixed(4),
            neuronFiring: (synthFeat.data[i] || 0) > 0.5
        })).sort((a, b) => b.activation - a.activation);

        const inferenceRecord = {
            id:          `inf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            context,
            timestamp:   new Date().toISOString(),
            masterActivation: +masterActivation.toFixed(4),
            masterFiring: masterActivation > 0.5,
            topLogics:   results.slice(0, 5).map(r => r.id),
            allResults:  results
        };

        this.inferenceLog.push(inferenceRecord);
        if (this.inferenceLog.length > 100) this.inferenceLog.shift();
        this.totalInferences++;

        return inferenceRecord;
    }

    // ─── انتشار سينابتي عبر خريطة الاتصالات ──────────────────────────────────
    _propagateSynaptic(activations) {
        const propagated = [...activations];
        this.neurons.forEach((n, i) => {
            const conns = this.synapticMap[n.id] || {};
            Object.entries(conns).forEach(([targetId, w]) => {
                const j = this.neuronIndex[targetId];
                if (j !== undefined) {
                    propagated[j] = Math.min(1, propagated[j] + activations[i] * w * 0.1);
                }
            });
        });
        return propagated;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔴 TRAIN — تدريب الشبكة على مثال جديد
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * train — تدريب الشبكة على زوج (input, target)
     * @param {number[]} inputVec  — متجه الإدخال (20 بُعد)
     * @param {number[]} targetVec — المتجه المستهدف (20 بُعد) — قيم 0/1
     * @param {number}   lr        — معدل التعلم (0.001 افتراضي)
     * @returns {number} الخسارة (Loss) بعد هذه الخطوة
     */
    train(inputVec, targetVec, lr = 0.001) {
        if (!inputVec || !targetVec) return null;
        while (inputVec.length < N_INPUT)  inputVec.push(0);
        while (targetVec.length < N_OUTPUT) targetVec.push(0);
        inputVec  = inputVec.slice(0, N_INPUT);
        targetVec = targetVec.slice(0, N_OUTPUT);

        const X = Matrix.fromArray(inputVec);
        const Y = Matrix.fromArray(targetVec);

        // ─── Forward ──────────────────────────────────────────────────────────
        const coreFeat  = this.coreLayer.forward(X);
        const extFeat   = this.extLayer.forward(coreFeat);
        const synthFeat = this.synthLayer.forward(extFeat);
        const rankVec   = this.rankingLayer.forward(synthFeat);

        // ─── Loss — Mean Squared Error ────────────────────────────────────────
        let loss = 0;
        const dOut = new Matrix(1, N_OUTPUT);
        for (let i = 0; i < N_OUTPUT; i++) {
            const diff = (synthFeat.data[i] || 0) - (Y.data[i] || 0);
            loss       += diff * diff;
            dOut.data[i] = 2 * diff / N_OUTPUT;
        }
        loss /= N_OUTPUT;

        // ─── Backward ─────────────────────────────────────────────────────────
        const dSynth = this.synthLayer.backward(dOut, lr);
        const dExt   = this.extLayer.backward(dSynth, lr);
        this.coreLayer.backward(dExt, lr);

        this.trainedSteps++;
        return +loss.toFixed(6);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 STATE — حالة الشبكة الحالية
    // ═══════════════════════════════════════════════════════════════════════════

    getState() {
        return {
            architecture: {
                inputSize:   N_INPUT,
                coreLayers:  N_CORE,
                extLayers:   N_EXT,
                synthLayers: N_OUTPUT,
                masterUnits: N_MASTER,
                totalLayers: 5,
                totalNeurons: N_LOGICS + 1
            },
            neurons:          this.neurons.map(n => n.toJSON()),
            masterNeuron:     this.masterNeuron.toJSON(),
            trainedSteps:     this.trainedSteps,
            totalInferences:  this.totalInferences,
            masterShield:     this.masterShield,
            lastInference:    this.inferenceLog[this.inferenceLog.length - 1] || null
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🗺️ SYNAPTIC MAP — خريطة الاتصالات العصبية
    // ═══════════════════════════════════════════════════════════════════════════

    getSynapticMap() {
        const nodes = [
            ...this.neurons.map(n => ({
                id:         n.id,
                nameAr:     n.nameAr,
                icon:       n.icon,
                category:   n.category,
                activation: +n.activation.toFixed(4),
                firingCount: n.firingCount
            })),
            {
                id:         this.masterNeuron.id,
                nameAr:     this.masterNeuron.nameAr,
                icon:       this.masterNeuron.icon,
                category:   'master',
                activation: +this.masterNeuron.activation.toFixed(4),
                firingCount: this.masterNeuron.firingCount
            }
        ];

        const edges = [];
        Object.entries(this.synapticMap).forEach(([src, targets]) => {
            Object.entries(targets).forEach(([tgt, w]) => {
                if (src < tgt) { // لا تكرار
                    edges.push({
                        source:   src,
                        target:   tgt,
                        weight:   w,
                        active:   (this.neuronIndex[src] !== undefined && this.neurons[this.neuronIndex[src]]?.activation > 0.3)
                    });
                }
            });
        });

        return { nodes, edges, totalNodes: nodes.length, totalEdges: edges.length };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 💾 PERSIST — حفظ واسترداد الشبكة
    // ═══════════════════════════════════════════════════════════════════════════

    save() {
        const saved = {
            coreLayer:    this.coreLayer.exportWeights(),
            extLayer:     this.extLayer.exportWeights(),
            synthLayer:   this.synthLayer.exportWeights(),
            masterLayer:  this.masterLayer.exportWeights(),
            rankingLayer: this.rankingLayer.exportWeights(),
            trainedSteps: this.trainedSteps,
            totalInferences: this.totalInferences,
            savedAt:      new Date().toISOString()
        };
        database.write('logicNeuralNetwork', saved);
        return saved;
    }

    load() {
        const saved = database.read('logicNeuralNetwork');
        if (!saved) return false;
        this.coreLayer.importWeights(saved.coreLayer);
        this.extLayer.importWeights(saved.extLayer);
        this.synthLayer.importWeights(saved.synthLayer);
        this.masterLayer.importWeights(saved.masterLayer);
        this.rankingLayer.importWeights(saved.rankingLayer);
        this.trainedSteps    = saved.trainedSteps    || 0;
        this.totalInferences = saved.totalInferences || 0;
        return true;
    }

    reset() {
        this.coreLayer    = new DenseLayer(N_INPUT,  N_CORE,    'sigmoid');
        this.extLayer     = new DenseLayer(N_CORE,   N_EXT,     'sigmoid');
        this.synthLayer   = new DenseLayer(N_EXT,    N_OUTPUT,  'sigmoid');
        this.masterLayer  = new DenseLayer(N_OUTPUT, N_MASTER,  'sigmoid');
        this.rankingLayer = new DenseLayer(N_OUTPUT, N_OUTPUT,  'softmax');
        this.neurons.forEach(n => n.reset());
        this.masterNeuron.reset();
        this.trainedSteps    = 0;
        this.totalInferences = 0;
        this.inferenceLog    = [];
        return true;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SINGLETON INSTANCE — نسخة واحدة مشتركة للشبكة
// ═══════════════════════════════════════════════════════════════════════════════

let _network = null;

function getNetwork() {
    if (!_network) {
        _network = new LogicNeuralNetwork();
        _network.load(); // محاولة تحميل الأوزان المحفوظة
    }
    return _network;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CONTEXT ENCODER — تحويل السياق النصي إلى متجه إدخال
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * encodeContext — يحوّل سياقاً نصياً إلى متجه 20 بُعد
 * يبحث عن مؤشرات المنطق في النص العربي والإنجليزي
 */
const LOGIC_KEYWORDS = {
    organizational:  ['منظمة', 'هيكل', 'صلاحيات', 'تسلسل', 'organization', 'hierarchy'],
    legislative:     ['قانون', 'تشريع', 'شريعة', 'نظام', 'law', 'regulation', 'sharia'],
    commercial:      ['تجارة', 'بيع', 'شراء', 'عقد', 'سوق', 'trade', 'market', 'commerce'],
    scientific:      ['علم', 'بحث', 'دراسة', 'نظرية', 'science', 'research', 'study'],
    research:        ['بحث', 'تطوير', 'ابتكار', 'اكتشاف', 'research', 'development', 'innovation'],
    technical:       ['هندسة', 'تقني', 'نظام', 'بنية', 'engineering', 'technical', 'system'],
    technological:   ['تكنولوجيا', 'رقمي', 'ذكاء', 'أتمتة', 'technology', 'digital', 'AI'],
    methodological:  ['منهج', 'أسلوب', 'إطار', 'method', 'framework', 'approach'],
    quality:         ['جودة', 'إتقان', 'معيار', 'تميز', 'quality', 'excellence', 'standard'],
    administrative:  ['إدارة', 'قيادة', 'مدير', 'administration', 'management', 'leadership'],
    structural:      ['هيكل', 'تصميم', 'بناء', 'structure', 'design', 'architecture'],
    planning:        ['تخطيط', 'استراتيجية', 'خطة', 'planning', 'strategy', 'roadmap'],
    network:         ['شبكة', 'شراكة', 'تواصل', 'network', 'partnership', 'connection'],
    executive:       ['تنفيذ', 'إنجاز', 'عمليات', 'execution', 'operations', 'delivery'],
    developmental:   ['تطوير', 'نمو', 'ارتقاء', 'development', 'growth', 'advancement'],
    improvement:     ['تحسين', 'كايزن', 'رفع', 'improvement', 'kaizen', 'optimization'],
    adaptive:        ['تكيف', 'مرونة', 'صمود', 'adaptive', 'resilience', 'flexibility'],
    environmental:   ['بيئة', 'استدامة', 'طبيعة', 'environment', 'sustainability', 'green'],
    computational:   ['حساب', 'خوارزمية', 'بيانات', 'computation', 'algorithm', 'data'],
    universal:       ['كون', 'إلهي', 'كوني', 'universal', 'cosmic', 'divine']
};

function encodeContext(text) {
    if (!text || typeof text !== 'string') return new Array(N_INPUT).fill(0.5);
    const lower = text.toLowerCase();
    return ALL_LOGICS.map(logic => {
        const keywords = LOGIC_KEYWORDS[logic.id] || [];
        const hits = keywords.filter(kw => lower.includes(kw.toLowerCase())).length;
        return Math.min(1, 0.3 + hits * 0.15);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 التصدير
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    LogicNeuralNetwork,
    LogicNeuron,
    DenseLayer,
    Matrix,
    getNetwork,
    encodeContext,
    LOGIC_KEYWORDS,
    N_LOGICS,
    N_INPUT,
    N_OUTPUT
};
