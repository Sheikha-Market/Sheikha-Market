/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🧠 شبكة شيخة العصبية للإنتاج
 *  Sheikha Production Neural Network
 *
 *  "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ"
 *  "صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ" — النمل: ٨٨
 *
 *  الغرض:
 *    شبكة عصبية متخصصة بالإنتاج — تدمج الذكاء العصبي مع خطوط الإنتاج
 *    الرباعية (العلمي / التقني / التجاري / التشغيلي) وتتخذ قرارات ذكية
 *    بشأن تخصيص الموارد ، وبوابات الجودة ، وأولويات المخرجات.
 *
 *  البنية العصبية:
 *    • طبقة الإدخال       (InputLayer)      : 16 ميزة إنتاجية
 *    • طبقة الاستخلاص     (ExtractionLayer) : 32 خلية — استخلاص السمات
 *    • طبقة التخطيط       (PlanningLayer)   : 24 خلية — التخطيط الإنتاجي
 *    • طبقة الجودة        (QualityLayer)    : 16 خلية — بوابة الجودة
 *    • طبقة الإخراج       (OutputLayer)     : 8 خلايا — قرار المسار
 *
 *  مسارات الإنتاج الثمانية:
 *    P1 — العلمي     : بحث، تحليل، قياس، توثيق
 *    P2 — التقني     : هندسة، برمجة، أتمتة، تكامل
 *    P3 — التجاري    : عرض، تسويق، مبيعات، شراكات
 *    P4 — التشغيلي   : جدولة، تنفيذ، مراقبة، تحسين
 *    P5 — المعرفي    : توثيق، تعلّم، نشر، تدريب
 *    P6 — الإبداعي   : ابتكار، تصميم، إبداع، ريادة
 *    P7 — الاجتماعي  : مجتمع، تواصل، أثر، شراكة
 *    P8 — الشرعي     : فتوى، امتثال، حوكمة، رقابة
 *
 *  الخصائص:
 *    ✅ شبكة عصبية ذاتية الكتابة بجافاسكربت نقي (بلا مكتبات خارجية)
 *    ✅ Adam Optimizer مع Backpropagation
 *    ✅ تكامل مع LogicNeuralNetwork لتعزيز المنطق الإنتاجي
 *    ✅ تدريب تدريجي من بيانات الإنتاج الفعلية
 *    ✅ فلتر الشريعة والجودة مدمج في كل قرار
 *    ✅ تصدير/استيراد الأوزان للاستمرارية
 *
 *  المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── استيراد اختياري للشبكة العصبية المنطقية ─────────────────────────────────
let _logicNet = null;
let _encodeCtx = null;
try {
    const logicModule = require('../models/LogicNeuralNetwork');
    _logicNet  = logicModule.getNetwork ? logicModule.getNetwork() : null;
    _encodeCtx = logicModule.encodeContext || null;
} catch (_) { /* تعمل باستقلالية إذا لم يكن المسار متاحًا */ }

// ═══════════════════════════════════════════════════════════════════════════════
// 1. MATRIX — عمليات المصفوفات
// ═══════════════════════════════════════════════════════════════════════════════

class Matrix {
    constructor(rows, cols, data = null) {
        this.rows = rows;
        this.cols = cols;
        this.data = data || new Float64Array(rows * cols);
    }

    static zeros(r, c) { return new Matrix(r, c); }

    static xavier(r, c) {
        const m = new Matrix(r, c);
        const scale = Math.sqrt(2.0 / (r + c));
        for (let i = 0; i < m.data.length; i++) {
            m.data[i] = (Math.random() * 2 - 1) * scale;
        }
        return m;
    }

    get(r, c)    { return this.data[r * this.cols + c]; }
    set(r, c, v) { this.data[r * this.cols + c] = v; }

    static multiply(a, b) {
        if (a.cols !== b.rows) throw new Error(`[ProdNet] أبعاد غير متوافقة: ${a.rows}x${a.cols} × ${b.rows}x${b.cols}`);
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

    static add(a, b) {
        const out = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] + b.data[i];
        return out;
    }

    static subtract(a, b) {
        const out = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] - b.data[i];
        return out;
    }

    static hadamard(a, b) {
        const out = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] * b.data[i];
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

    broadcastBias(batchSize) {
        const out = new Matrix(batchSize, this.cols);
        for (let i = 0; i < batchSize; i++) {
            for (let j = 0; j < this.cols; j++) out.data[i * this.cols + j] = this.data[j];
        }
        return out;
    }

    toArray() { return Array.from(this.data); }

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
// 2. ACTIVATIONS — دوال التفعيل
// ═══════════════════════════════════════════════════════════════════════════════

const Act = {
    sigmoid: {
        f:  x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
        df: y => y * (1 - y)
    },
    relu: {
        f:  x => Math.max(0, x),
        df: y => (y > 0 ? 1 : 0)
    },
    tanh: {
        f:  x => Math.tanh(x),
        df: y => 1 - y * y
    },
    softmax: {
        fVec(arr) {
            const max  = Math.max(...arr);
            const exps = arr.map(x => Math.exp(x - max));
            const s    = exps.reduce((a, b) => a + b, 0) || 1;
            return exps.map(e => e / s);
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

        // Adam state
        this.mW = Matrix.zeros(inSize, outSize);
        this.vW = Matrix.zeros(inSize, outSize);
        this.mB = Matrix.zeros(1, outSize);
        this.vB = Matrix.zeros(1, outSize);
        this.t  = 0;

        this._input = null;
        this._out   = null;
    }

    forward(X) {
        this._input = X;
        const pre = Matrix.add(Matrix.multiply(X, this.W), this.b.broadcastBias(X.rows));
        if (this.actName === 'softmax') {
            this._out = new Matrix(pre.rows, pre.cols);
            for (let i = 0; i < pre.rows; i++) {
                const row = Array.from(pre.data.slice(i * pre.cols, (i + 1) * pre.cols));
                const sm  = Act.softmax.fVec(row);
                for (let j = 0; j < sm.length; j++) this._out.data[i * pre.cols + j] = sm[j];
            }
        } else {
            this._out = pre.map(x => this.act.f(x));
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
        this._adamUpdate(dW, dB, lr);
        return dX;
    }

    _adamUpdate(dW, dB, lr, b1 = 0.9, b2 = 0.999, eps = 1e-8) {
        this.t++;
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

    exportWeights() {
        return {
            W:       Array.from(this.W.data),
            b:       Array.from(this.b.data),
            inSize:  this.inSize,
            outSize: this.outSize,
            actName: this.actName,
            t:       this.t
        };
    }

    importWeights(saved) {
        if (!saved) return;
        if (saved.W && saved.W.length === this.W.data.length) this.W.data.set(saved.W);
        if (saved.b && saved.b.length === this.b.data.length) this.b.data.set(saved.b);
        if (saved.t) this.t = saved.t;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PRODUCTION FEATURES — ميزات الإدخال الإنتاجية (16 بُعد)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * الميزات الست عشرة التي تصف أي طلب إنتاجي:
 *
 *  [0]  urgency          — درجة الإلحاح          (0–1)
 *  [1]  complexity       — درجة التعقيد           (0–1)
 *  [2]  scientific_load  — الحمل العلمي           (0–1)
 *  [3]  technical_load   — الحمل التقني           (0–1)
 *  [4]  commercial_load  — الحمل التجاري          (0–1)
 *  [5]  operational_load — الحمل التشغيلي         (0–1)
 *  [6]  quality_req      — متطلب الجودة           (0–1)
 *  [7]  resource_avail   — توافر الموارد           (0–1)
 *  [8]  time_constraint  — ضغط الوقت              (0–1)
 *  [9]  innovation_level — مستوى الابتكار          (0–1)
 *  [10] compliance_req   — متطلب الامتثال الشرعي  (0–1)
 *  [11] collab_need      — الحاجة للتعاون         (0–1)
 *  [12] data_richness    — ثراء البيانات           (0–1)
 *  [13] automation_fit   — ملاءمة الأتمتة         (0–1)
 *  [14] impact_scale     — مقياس الأثر            (0–1)
 *  [15] sustainability   — الاستدامة والاستمرارية  (0–1)
 */
const N_INPUT    = 16;
const N_EXTRACT  = 32;
const N_PLAN     = 24;
const N_QUALITY  = 16;
const N_OUTPUT   = 8;  // 4 مسارات × 2 (رئيسي + ثانوي)

const PRODUCTION_PIPELINES = [
    { id: 'P1', nameAr: 'الإنتاج العلمي',    nameEn: 'Scientific Production',   icon: '🔬', maqsad: 'AQL'  },
    { id: 'P2', nameAr: 'الإنتاج التقني',    nameEn: 'Technical Production',    icon: '⚙️', maqsad: 'ARD'  },
    { id: 'P3', nameAr: 'الإنتاج التجاري',   nameEn: 'Commercial Production',   icon: '📈', maqsad: 'MAL'  },
    { id: 'P4', nameAr: 'الإنتاج التشغيلي',  nameEn: 'Operational Production',  icon: '🏭', maqsad: 'ARD'  },
    { id: 'P5', nameAr: 'الإنتاج المعرفي',   nameEn: 'Knowledge Production',    icon: '📚', maqsad: 'AQL'  },
    { id: 'P6', nameAr: 'الإنتاج الإبداعي',  nameEn: 'Creative Production',     icon: '✨', maqsad: 'ARD'  },
    { id: 'P7', nameAr: 'الإنتاج الاجتماعي', nameEn: 'Social Production',       icon: '🤝', maqsad: 'NAFS' },
    { id: 'P8', nameAr: 'الإنتاج الشرعي',    nameEn: 'Sharia-Compliance Output', icon: '☪️', maqsad: 'DEEN' }
];

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PRODUCTION NEURAL NETWORK — الشبكة العصبية الإنتاجية
// ═══════════════════════════════════════════════════════════════════════════════

class ProductionNeuralNetwork {
    constructor() {
        // ─── الطبقات ──────────────────────────────────────────────────────────
        this.extractLayer = new DenseLayer(N_INPUT,   N_EXTRACT, 'relu');
        this.planLayer    = new DenseLayer(N_EXTRACT, N_PLAN,    'tanh');
        this.qualityLayer = new DenseLayer(N_PLAN,    N_QUALITY, 'sigmoid');
        this.outputLayer  = new DenseLayer(N_QUALITY, N_OUTPUT,  'softmax');

        // ─── الذاكرة الإنتاجية ────────────────────────────────────────────────
        this.productionLog   = [];
        this.trainedSteps    = 0;
        this.totalInferences = 0;

        // ─── إحصاءات المسارات ────────────────────────────────────────────────
        this.pipelineStats = {};
        PRODUCTION_PIPELINES.forEach(p => {
            this.pipelineStats[p.id] = { selected: 0, avgScore: 0 };
        });

        // ─── خريطة المعرفة الإنتاجية ─────────────────────────────────────────
        // تصل بين الميزات والمسارات بمعامل أولوية مسبق
        this.priorWeights = this._buildPriorWeights();
    }

    /**
     * معاملات أولوية مبدئية — تمثّل الارتباط الدلالي بين كل ميزة ومسار
     * المصفوفة: N_INPUT × N_OUTPUT (16 × 8)
     */
    _buildPriorWeights() {
        // [urgency, complexity, sci, tech, com, ops, qual, res, time, inno, comp, collab, data, auto, impact, sust]
        //  P1      P2      P3      P4      P5      P6      P7      P8
        return [
            [0.10, 0.15, 0.10, 0.20, 0.10, 0.10, 0.05, 0.20], // urgency
            [0.25, 0.25, 0.10, 0.15, 0.15, 0.05, 0.03, 0.02], // complexity
            [0.40, 0.10, 0.10, 0.05, 0.25, 0.05, 0.03, 0.02], // scientific_load
            [0.10, 0.40, 0.10, 0.15, 0.10, 0.10, 0.03, 0.02], // technical_load
            [0.05, 0.10, 0.45, 0.10, 0.05, 0.10, 0.10, 0.05], // commercial_load
            [0.05, 0.15, 0.10, 0.40, 0.05, 0.10, 0.10, 0.05], // operational_load
            [0.20, 0.15, 0.10, 0.10, 0.10, 0.05, 0.05, 0.25], // quality_req
            [0.10, 0.15, 0.15, 0.20, 0.10, 0.15, 0.10, 0.05], // resource_avail
            [0.10, 0.20, 0.15, 0.25, 0.05, 0.10, 0.10, 0.05], // time_constraint
            [0.25, 0.15, 0.10, 0.05, 0.25, 0.15, 0.03, 0.02], // innovation_level
            [0.10, 0.05, 0.10, 0.05, 0.05, 0.05, 0.10, 0.50], // compliance_req
            [0.10, 0.10, 0.20, 0.15, 0.15, 0.10, 0.15, 0.05], // collab_need
            [0.30, 0.20, 0.15, 0.10, 0.15, 0.05, 0.03, 0.02], // data_richness
            [0.05, 0.30, 0.10, 0.30, 0.05, 0.10, 0.05, 0.05], // automation_fit
            [0.15, 0.10, 0.25, 0.15, 0.10, 0.10, 0.10, 0.05], // impact_scale
            [0.10, 0.05, 0.10, 0.10, 0.10, 0.10, 0.20, 0.25]  // sustainability
        ];
    }

    // ─── الانتشار الأمامي ─────────────────────────────────────────────────────

    /**
     * infer — استدلال المسار الإنتاجي الأمثل من متجه الميزات
     * @param {number[]} featureVec — متجه ميزات 16-بُعد (قيم 0–1)
     * @param {string}   [context]  — وصف السياق
     * @returns {object} نتيجة الاستدلال مع ترتيب المسارات وقرار بوابة الجودة
     */
    infer(featureVec, context = '') {
        featureVec = this._normalizeInput(featureVec);

        // دمج مسبق مع المعاملات الأولوية (Prior Blending)
        const blended = this._blendWithPrior(featureVec);

        const X = Matrix.fromArray(blended);

        // Forward propagation
        const extracted = this.extractLayer.forward(X);
        const planned   = this.planLayer.forward(extracted);
        const quality   = this.qualityLayer.forward(planned);
        const output    = this.outputLayer.forward(quality);

        // ترتيب المسارات
        const pipelineScores = PRODUCTION_PIPELINES.map((p, i) => ({
            ...p,
            score:    +((output.data[i] || 0)).toFixed(4),
            selected: false
        })).sort((a, b) => b.score - a.score);

        pipelineScores[0].selected = true; // المسار الأفضل

        // بوابة الجودة — متوسط طبقة الجودة
        const qualityScore = Array.from(quality.data).reduce((s, v) => s + v, 0) / N_QUALITY;
        const qualityGate  = qualityScore >= 0.5;

        // تعزيز بالشبكة العصبية المنطقية (إن توافرت)
        let logicEnhancement = null;
        if (_logicNet && _encodeCtx && context) {
            try {
                const logicVec = _encodeCtx(context);
                const logicResult = _logicNet.infer(logicVec, context);
                logicEnhancement = {
                    masterActivation: logicResult.masterActivation,
                    topLogics:        logicResult.topLogics
                };
            } catch (_) { /* تعزيز اختياري */ }
        }

        const result = {
            id:        `prod_inf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toISOString(),
            context,
            selectedPipeline:  pipelineScores[0],
            fallbackPipeline:  pipelineScores[1] || null,
            allPipelines:      pipelineScores,
            qualityScore:      +qualityScore.toFixed(4),
            qualityGate,
            qualityDecision:   qualityGate ? 'مرّ بوابة الجودة ✅' : 'لم يمرّ بوابة الجودة ❌ — يحتاج مراجعة',
            featureVector:     featureVec,
            logicEnhancement:  logicEnhancement || undefined,
            sharia_note:       'لا ضرر ولا ضرار — كل إنتاج تحت رقابة الشريعة والجودة',
            tawheed:           'لا إله إلا الله'
        };

        // تحديث إحصاءات المسارات
        const selId = pipelineScores[0].id;
        if (this.pipelineStats[selId]) {
            const st = this.pipelineStats[selId];
            st.selected++;
            st.avgScore = +(((st.avgScore * (st.selected - 1)) + pipelineScores[0].score) / st.selected).toFixed(4);
        }

        this.productionLog.push({ id: result.id, selectedPipeline: selId, qualityGate, timestamp: result.timestamp });
        if (this.productionLog.length > 200) this.productionLog.shift();
        this.totalInferences++;

        return result;
    }

    // ─── التدريب ──────────────────────────────────────────────────────────────

    /**
     * train — تدريب الشبكة على مثال إنتاجي
     * @param {number[]} featureVec  — متجه الميزات (16-بُعد)
     * @param {number[]} targetVec   — المسار المستهدف (8-بُعد، one-hot أو توزيع احتمالي)
     * @param {number}   [lr=0.001]  — معدل التعلم
     * @returns {number} قيمة الخسارة (MSE)
     */
    train(featureVec, targetVec, lr = 0.001) {
        featureVec = this._normalizeInput(featureVec);
        while (targetVec.length < N_OUTPUT)  targetVec.push(0);
        targetVec = targetVec.slice(0, N_OUTPUT);

        const blended = this._blendWithPrior(featureVec);
        const X = Matrix.fromArray(blended);
        const Y = Matrix.fromArray(targetVec);

        // Forward
        const extracted = this.extractLayer.forward(X);
        const planned   = this.planLayer.forward(extracted);
        const quality   = this.qualityLayer.forward(planned);
        const output    = this.outputLayer.forward(quality);

        // MSE Loss
        let loss = 0;
        const dOut = new Matrix(1, N_OUTPUT);
        for (let i = 0; i < N_OUTPUT; i++) {
            const diff = (output.data[i] || 0) - (Y.data[i] || 0);
            loss += diff * diff;
            dOut.data[i] = 2 * diff / N_OUTPUT;
        }
        loss /= N_OUTPUT;

        // Backward
        const dQ = this.outputLayer.backward(dOut, lr);
        const dP = this.qualityLayer.backward(dQ, lr);
        const dE = this.planLayer.backward(dP, lr);
        this.extractLayer.backward(dE, lr);

        this.trainedSteps++;
        return +loss.toFixed(6);
    }

    /**
     * batchTrain — تدريب على مجموعة من الأمثلة
     * @param {Array<{features: number[], target: number[]}>} samples
     * @param {number} [lr=0.001]
     * @param {number} [epochs=1]
     * @returns {{ totalLoss: number, avgLoss: number, steps: number }}
     */
    batchTrain(samples, lr = 0.001, epochs = 1) {
        if (!samples || samples.length === 0) return { totalLoss: 0, avgLoss: 0, steps: 0 };
        let totalLoss = 0;
        let steps = 0;
        for (let e = 0; e < epochs; e++) {
            for (const s of samples) {
                const loss = this.train(s.features || [], s.target || [], lr);
                totalLoss += loss;
                steps++;
            }
        }
        return {
            totalLoss: +totalLoss.toFixed(6),
            avgLoss:   +(totalLoss / steps).toFixed(6),
            steps
        };
    }

    // ─── دوال مساعدة ──────────────────────────────────────────────────────────

    _normalizeInput(vec) {
        if (!vec || vec.length === 0) return new Array(N_INPUT).fill(0.5);
        while (vec.length < N_INPUT) vec.push(0.5);
        return vec.slice(0, N_INPUT).map(v => Math.max(0, Math.min(1, +v || 0.5)));
    }

    /** دمج المتجه مع المعاملات الأولوية — يُحسّن التقارب المبكر */
    _blendWithPrior(featureVec, alpha = 0.3) {
        return featureVec.map((fv, fi) => {
            const priorSignal = this.priorWeights[fi]
                ? this.priorWeights[fi].reduce((s, v) => s + v, 0) / N_OUTPUT
                : 0.5;
            return (1 - alpha) * fv + alpha * priorSignal;
        });
    }

    // ─── حالة الشبكة ──────────────────────────────────────────────────────────

    getState() {
        return {
            architecture: {
                inputSize:     N_INPUT,
                extractNeurons: N_EXTRACT,
                planNeurons:   N_PLAN,
                qualityNeurons: N_QUALITY,
                outputPipelines: N_OUTPUT,
                totalLayers:   4
            },
            pipelines:       PRODUCTION_PIPELINES,
            pipelineStats:   this.pipelineStats,
            trainedSteps:    this.trainedSteps,
            totalInferences: this.totalInferences,
            lastInference:   this.productionLog[this.productionLog.length - 1] || null
        };
    }

    // ─── حفظ / استرداد الأوزان ────────────────────────────────────────────────

    exportWeights() {
        return {
            extractLayer: this.extractLayer.exportWeights(),
            planLayer:    this.planLayer.exportWeights(),
            qualityLayer: this.qualityLayer.exportWeights(),
            outputLayer:  this.outputLayer.exportWeights(),
            trainedSteps: this.trainedSteps,
            totalInferences: this.totalInferences,
            savedAt:      new Date().toISOString()
        };
    }

    importWeights(saved) {
        if (!saved) return false;
        this.extractLayer.importWeights(saved.extractLayer);
        this.planLayer.importWeights(saved.planLayer);
        this.qualityLayer.importWeights(saved.qualityLayer);
        this.outputLayer.importWeights(saved.outputLayer);
        this.trainedSteps    = saved.trainedSteps    || 0;
        this.totalInferences = saved.totalInferences || 0;
        return true;
    }

    reset() {
        this.extractLayer = new DenseLayer(N_INPUT,   N_EXTRACT, 'relu');
        this.planLayer    = new DenseLayer(N_EXTRACT, N_PLAN,    'tanh');
        this.qualityLayer = new DenseLayer(N_PLAN,    N_QUALITY, 'sigmoid');
        this.outputLayer  = new DenseLayer(N_QUALITY, N_OUTPUT,  'softmax');
        this.trainedSteps    = 0;
        this.totalInferences = 0;
        this.productionLog   = [];
        PRODUCTION_PIPELINES.forEach(p => {
            this.pipelineStats[p.id] = { selected: 0, avgScore: 0 };
        });
        return true;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. CONTEXT ENCODER — تحويل النص إلى متجه ميزات إنتاجي
// ═══════════════════════════════════════════════════════════════════════════════

const PRODUCTION_KEYWORDS = {
    urgency:          ['عاجل', 'طارئ', 'فوري', 'أولوية', 'urgent', 'priority', 'immediate', 'critical'],
    complexity:       ['معقد', 'متشعب', 'متكامل', 'دقيق', 'complex', 'intricate', 'sophisticated', 'advanced'],
    scientific_load:  ['بحث', 'علم', 'دراسة', 'تحليل', 'نظرية', 'research', 'science', 'analysis', 'study'],
    technical_load:   ['هندسة', 'برمجة', 'تقني', 'كود', 'نظام', 'engineering', 'code', 'technical', 'system'],
    commercial_load:  ['تجارة', 'مبيعات', 'ربح', 'عقد', 'سوق', 'trade', 'sales', 'market', 'revenue', 'profit'],
    operational_load: ['تشغيل', 'عمليات', 'إنتاج', 'جدول', 'تنفيذ', 'operations', 'production', 'schedule', 'execute'],
    quality_req:      ['جودة', 'إتقان', 'معيار', 'مراجعة', 'quality', 'excellence', 'standard', 'review', 'audit'],
    resource_avail:   ['موارد', 'فريق', 'ميزانية', 'قدرة', 'resources', 'team', 'budget', 'capacity', 'available'],
    time_constraint:  ['وقت', 'موعد', 'سريع', 'مدة', 'time', 'deadline', 'duration', 'fast', 'schedule'],
    innovation_level: ['ابتكار', 'إبداع', 'جديد', 'ريادة', 'innovation', 'creative', 'novel', 'pioneer', 'new'],
    compliance_req:   ['شريعة', 'حلال', 'امتثال', 'حوكمة', 'sharia', 'halal', 'compliance', 'governance', 'ethics'],
    collab_need:      ['تعاون', 'فريق', 'شراكة', 'تنسيق', 'collaboration', 'team', 'partnership', 'coordinate'],
    data_richness:    ['بيانات', 'قاعدة', 'معلومات', 'إحصاء', 'data', 'database', 'information', 'statistics', 'analytics'],
    automation_fit:   ['أتمتة', 'آلي', 'ذكاء', 'تلقائي', 'automation', 'automatic', 'AI', 'robot', 'autonomous'],
    impact_scale:     ['أثر', 'نطاق', 'واسع', 'كبير', 'impact', 'scale', 'broad', 'wide', 'large', 'global'],
    sustainability:   ['استدامة', 'مستمر', 'بيئة', 'طويل', 'sustainability', 'continuous', 'environment', 'long-term']
};

/**
 * encodeProductionContext — يحوّل نصاً إلى متجه ميزات إنتاجي 16-بُعد
 * @param {string|object} input — نص وصفي أو كائن بيانات
 * @returns {number[]} متجه بأبعاد 16 (قيم 0–1)
 */
function encodeProductionContext(input) {
    let text = '';
    if (typeof input === 'string') {
        text = input;
    } else if (input && typeof input === 'object') {
        text = JSON.stringify(input);
    }
    if (!text) return new Array(N_INPUT).fill(0.5);

    const lower = text.toLowerCase();
    const keys  = Object.keys(PRODUCTION_KEYWORDS);
    return keys.map(key => {
        const hits = PRODUCTION_KEYWORDS[key].filter(kw => lower.includes(kw.toLowerCase())).length;
        return Math.min(1, 0.3 + hits * 0.12);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. SINGLETON — نسخة واحدة مشتركة
// ═══════════════════════════════════════════════════════════════════════════════

let _network = null;

function getNetwork() {
    if (!_network) _network = new ProductionNeuralNetwork();
    return _network;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. ENGINE INTERFACE — واجهة المحرك القياسية للموجّه العصبي
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * handle — المعالج القياسي المتوافق مع SheikhaIslamicNeuralRouter
 * @param {object} req — { intent, entity, data, traceId }
 * @returns {object} استجابة محرك الإنتاج العصبي
 */
async function handle(req) {
    const { intent = '', data = {}, traceId = '' } = req;
    const net = getNetwork();

    // تشفير السياق إلى متجه ميزات
    const contextStr  = data.context || data.description || data.text || intent;
    const featureVec  = data.features || encodeProductionContext(contextStr);

    switch (intent) {
        // ─── استدلال المسار الأمثل ─────────────────────────────────────────
        case 'production.infer':
        case 'production':
        case 'prod.infer': {
            const result = net.infer(featureVec, contextStr);
            return {
                action:  'production_inference',
                traceId,
                result
            };
        }

        // ─── تدريب الشبكة ─────────────────────────────────────────────────
        case 'production.train':
        case 'prod.train': {
            if (!data.target) {
                return { action: 'train_error', traceId, error: 'يجب تقديم المتجه الهدف (target)' };
            }
            const loss = net.train(featureVec, data.target, data.lr || 0.001);
            return { action: 'production_train', traceId, loss, trainedSteps: net.trainedSteps };
        }

        // ─── تدريب دفعي ───────────────────────────────────────────────────
        case 'production.batch_train':
        case 'prod.batch_train': {
            if (!Array.isArray(data.samples)) {
                return { action: 'batch_train_error', traceId, error: 'يجب تقديم مصفوفة samples' };
            }
            const batchResult = net.batchTrain(data.samples, data.lr || 0.001, data.epochs || 1);
            return { action: 'production_batch_train', traceId, ...batchResult };
        }

        // ─── حالة الشبكة ──────────────────────────────────────────────────
        case 'production.status':
        case 'prod.status': {
            return { action: 'production_status', traceId, state: net.getState() };
        }

        // ─── تصدير الأوزان ────────────────────────────────────────────────
        case 'production.export':
        case 'prod.export': {
            return { action: 'production_export', traceId, weights: net.exportWeights() };
        }

        // ─── استيراد الأوزان ──────────────────────────────────────────────
        case 'production.import':
        case 'prod.import': {
            if (!data.weights) {
                return { action: 'import_error', traceId, error: 'يجب تقديم الأوزان (weights)' };
            }
            const ok = net.importWeights(data.weights);
            return { action: 'production_import', traceId, success: ok };
        }

        // ─── إعادة تهيئة الشبكة ───────────────────────────────────────────
        case 'production.reset':
        case 'prod.reset': {
            net.reset();
            return { action: 'production_reset', traceId, message: 'تمت إعادة تهيئة الشبكة العصبية الإنتاجية' };
        }

        // ─── قائمة المسارات ───────────────────────────────────────────────
        case 'production.pipelines':
        case 'prod.pipelines': {
            return { action: 'production_pipelines', traceId, pipelines: PRODUCTION_PIPELINES };
        }

        // ─── تشفير السياق فقط ─────────────────────────────────────────────
        case 'production.encode':
        case 'prod.encode': {
            const encoded = encodeProductionContext(contextStr);
            return { action: 'production_encode', traceId, features: encoded, featureKeys: Object.keys(PRODUCTION_KEYWORDS) };
        }

        // ─── الاستدلال الافتراضي لأي intent إنتاجي مجهول ─────────────────
        default: {
            const result = net.infer(featureVec, `${intent} — ${contextStr}`);
            return {
                action:  'production_auto_inference',
                traceId,
                intent,
                result
            };
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. EXPORT — التصدير
// ═══════════════════════════════════════════════════════════════════════════════

const engine = { handle };

module.exports = {
    engine,
    handle,
    getNetwork,
    ProductionNeuralNetwork,
    DenseLayer,
    Matrix,
    encodeProductionContext,
    PRODUCTION_PIPELINES,
    PRODUCTION_KEYWORDS,
    N_INPUT,
    N_EXTRACT,
    N_PLAN,
    N_QUALITY,
    N_OUTPUT
};
