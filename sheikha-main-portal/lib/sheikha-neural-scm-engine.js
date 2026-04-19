// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   🧠 شبكة شيخة العصبية لسلاسل المداد والتوريد                            ║
 * ║   SHEIKHA NEURAL SUPPLY CHAIN ENGINE (NSCE)                                ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ" — الأنفال ٦٠
 * "وَشَاوِرْهُمْ فِي الْأَمْرِ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ" — آل عمران ١٥٩
 *
 * البنية العصبية:
 *   طبقة الإدخال  (InputLayer)     — 12 عقدة: مؤشرات سلسلة المداد الحية
 *   طبقة SCM الأساسية (CoreLayer) — 8 خلايا: مراحل سلسلة المداد (SCOR)
 *   طبقة الذكاء  (IntelLayer)     — 6 خلايا: التوصيات والتحليلات
 *   طبقة الإخراج (OutputLayer)    — 4 خلايا: قرار موحد + ثقة + امتثال + ملخص
 *
 * الخصائص:
 *   ✅ عمليات مصفوفات حقيقية (JavaScript نقي — بلا مكتبات خارجية)
 *   ✅ دوال تفعيل: Sigmoid, ReLU, Tanh, Softmax
 *   ✅ Feedforward كامل عبر 3 طبقات مخفية
 *   ✅ توقع الطلب (Demand Forecasting) بمتوسط متحرك موزون
 *   ✅ تسجيل الموردين (Supplier Scoring) بمعايير متعددة
 *   ✅ تقدير مخاطر سلسلة المداد (Risk Assessment)
 *   ✅ تحسين المخزون (Inventory Optimization) بنموذج EOQ
 *   ✅ فلتر الشريعة: غرر / ربا / تراضي
 *   ✅ سجل مراجع قرآنية ونبوية بكل مرحلة
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */

'use strict';

const EventEmitter = require('events');

// ══════════════════════════════════════════════════════════════════════════════
// 1. MATRIX — عمليات المصفوفات (أساس الشبكة العصبية)
// ══════════════════════════════════════════════════════════════════════════════

class Matrix {
    constructor(rows, cols, data) {
        this.rows = rows;
        this.cols = cols;
        this.data = data || new Float64Array(rows * cols);
    }

    static zeros(r, c) { return new Matrix(r, c); }

    static fromArray(arr) {
        const m = new Matrix(arr.length, 1);
        for (let i = 0; i < arr.length; i++) m.data[i] = arr[i];
        return m;
    }

    static xavier(r, c) {
        const scale = Math.sqrt(2.0 / (r + c));
        const m = new Matrix(r, c);
        for (let i = 0; i < m.data.length; i++) {
            m.data[i] = (Math.random() * 2 - 1) * scale;
        }
        return m;
    }

    get(r, c) { return this.data[r * this.cols + c]; }
    set(r, c, v) { this.data[r * this.cols + c] = v; }

    /** ضرب مصفوفات — A × B */
    static multiply(a, b) {
        if (a.cols !== b.rows) {
            throw new Error(`أبعاد غير متوافقة: ${a.rows}×${a.cols} × ${b.rows}×${b.cols}`);
        }
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

    /** جمع مصفوفتين */
    static add(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) {
            throw new Error('أبعاد غير متطابقة للجمع');
        }
        const out = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] + b.data[i];
        return out;
    }

    /** تطبيق دالة تفعيل على كل عنصر */
    map(fn) {
        const out = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.data.length; i++) out.data[i] = fn(this.data[i]);
        return out;
    }

    toArray() { return Array.from(this.data); }

    toJSON() {
        return { rows: this.rows, cols: this.cols, data: Array.from(this.data) };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. دوال التفعيل
// ══════════════════════════════════════════════════════════════════════════════

// حدود التشبع للـ Sigmoid — تمنع overflow في Math.exp
const SIGMOID_CLAMP_MIN = -500;
const SIGMOID_CLAMP_MAX =  500;

// عتبات تقييم الموردين
const GRADE_A_PLUS  = 90;
const GRADE_A       = 80;
const GRADE_B       = 70;
const GRADE_C       = 60;

// حد أدنى لتكلفة الاحتفاظ بالمخزون في نموذج EOQ — يمنع القسمة على صفر
// (يُعادل جزءًا من دولار، وهو أصغر قيمة اقتصادية ممكنة)
const MIN_HOLDING_COST = 1e-6;

const Activations = {
    sigmoid:  x => 1 / (1 + Math.exp(-Math.max(SIGMOID_CLAMP_MIN, Math.min(SIGMOID_CLAMP_MAX, x)))),
    relu:     x => Math.max(0, x),
    tanh:     x => Math.tanh(x),
    softmax(arr) {
        const max = Math.max(...arr);
        const exps = arr.map(v => Math.exp(v - max));
        const sum = exps.reduce((a, b) => a + b, 0);
        return exps.map(v => v / (sum || 1e-9));
    },
    linear:   x => x,
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. تعريف بنية الشبكة العصبية لسلاسل المداد
// ══════════════════════════════════════════════════════════════════════════════

/**
 * طبقة الإدخال (12 مؤشر لسلسلة المداد)
 */
const INPUT_FEATURES = [
    { id: 'demand_signal',      nameAr: 'إشارة الطلب',             min: 0, max: 1 },
    { id: 'price_index',        nameAr: 'مؤشر السعر',              min: 0, max: 1 },
    { id: 'supplier_score',     nameAr: 'تقييم المورد',            min: 0, max: 1 },
    { id: 'lead_time',          nameAr: 'وقت التوريد (معيار)',     min: 0, max: 1 },
    { id: 'quality_rate',       nameAr: 'معدل الجودة',             min: 0, max: 1 },
    { id: 'inventory_level',    nameAr: 'مستوى المخزون',           min: 0, max: 1 },
    { id: 'logistics_cost',     nameAr: 'تكلفة اللوجستيات',       min: 0, max: 1 },
    { id: 'risk_factor',        nameAr: 'عامل المخاطر',            min: 0, max: 1 },
    { id: 'geo_risk',           nameAr: 'مخاطر جغرافية/سياسية',   min: 0, max: 1 },
    { id: 'compliance_score',   nameAr: 'نقاط الامتثال',          min: 0, max: 1 },
    { id: 'market_volatility',  nameAr: 'تقلبات السوق',           min: 0, max: 1 },
    { id: 'sharia_compliance',  nameAr: 'الامتثال الشرعي',        min: 0, max: 1 },
];

const INPUT_SIZE  = INPUT_FEATURES.length;   // 12
const CORE_SIZE   = 8;   // طبقة SCM الأساسية (مراحل SCOR)
const INTEL_SIZE  = 6;   // طبقة الذكاء
const OUTPUT_SIZE = 4;   // طبقة الإخراج

/**
 * خلايا طبقة SCM الأساسية (مراحل SCOR الستة + مخاطر + استدامة)
 */
const CORE_NODES = [
    { id: 'plan',        nameAr: 'التخطيط',              maqsad: 'AQL' },
    { id: 'source',      nameAr: 'التوريد والمشتريات',   maqsad: 'MAL' },
    { id: 'make',        nameAr: 'التصنيع والإنتاج',     maqsad: 'ARD' },
    { id: 'store',       nameAr: 'التخزين',              maqsad: 'MAL' },
    { id: 'deliver',     nameAr: 'التوزيع والتسليم',     maqsad: 'MAL' },
    { id: 'return',      nameAr: 'الإرجاع واللوجستيات العكسية', maqsad: 'ARD' },
    { id: 'risk',        nameAr: 'إدارة المخاطر',        maqsad: 'NAFS' },
    { id: 'sustain',     nameAr: 'الاستدامة والإحسان',   maqsad: 'ARD' },
];

/**
 * خلايا طبقة الذكاء (التوصيات)
 */
const INTEL_NODES = [
    { id: 'demand_forecast',      nameAr: 'توقع الطلب' },
    { id: 'supplier_rec',         nameAr: 'توصية المورد' },
    { id: 'inventory_opt',        nameAr: 'تحسين المخزون' },
    { id: 'route_opt',            nameAr: 'تحسين المسار' },
    { id: 'risk_mitigation',      nameAr: 'تخفيف المخاطر' },
    { id: 'cost_reduction',       nameAr: 'تخفيض التكلفة' },
];

// ══════════════════════════════════════════════════════════════════════════════
// 4. المراجع الشرعية لكل مرحلة
// ══════════════════════════════════════════════════════════════════════════════

const SCM_SHARIA_REFS = {
    plan:    { surah: 'الأنفال',   ayah: 60,  text: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ',                       context: 'التخطيط والإعداد' },
    source:  { surah: 'البقرة',   ayah: 275, text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',                         context: 'التوريد والشراء الحلال' },
    make:    { surah: 'الكهف',    ayah: 30,  text: 'إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا',                        context: 'الإتقان في الإنتاج' },
    store:   { surah: 'يوسف',     ayah: 47,  text: 'تَزْرَعُونَ سَبْعَ سِنِينَ دَأَبًا فَمَا حَصَدتُّمْ فَذَرُوهُ فِي سُنبُلِهِ', context: 'التخزين الاستراتيجي' },
    deliver: { surah: 'الإسراء',  ayah: 34,  text: 'وَأَوْفُوا بِالْعَهْدِ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا',                 context: 'الوفاء بالتسليم' },
    return:  { surah: 'المؤمنون', ayah: 8,   text: 'وَالَّذِينَ هُمْ لِأَمَانَاتِهِمْ وَعَهْدِهِمْ رَاعُونَ',               context: 'أمانة المرتجعات' },
    risk:    { surah: 'التغابن',  ayah: 11,  text: 'مَا أَصَابَ مِن مُّصِيبَةٍ إِلَّا بِإِذْنِ اللَّهِ',                      context: 'إدارة المخاطر بتوكل' },
    sustain: { surah: 'الأعراف',  ayah: 56,  text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا',                    context: 'الاستدامة والحفاظ على الأرض' },
};

// ══════════════════════════════════════════════════════════════════════════════
// 5. نموذج الطبقة (DenseLayer)
// ══════════════════════════════════════════════════════════════════════════════

class DenseLayer {
    /**
     * @param {number} inputSize   - عدد العقد في الطبقة السابقة
     * @param {number} outputSize  - عدد العقد في هذه الطبقة
     * @param {string} activation  - اسم دالة التفعيل
     */
    constructor(inputSize, outputSize, activation = 'sigmoid') {
        this.inputSize  = inputSize;
        this.outputSize = outputSize;
        this.activation = activation;
        // تهيئة الأوزان بمبدأ Xavier لتجنب مشكلة اختفاء/انفجار التدرج
        this.weights = Matrix.xavier(outputSize, inputSize);
        this.biases  = Matrix.zeros(outputSize, 1);
    }

    /**
     * التمرير الأمامي (Forward Pass)
     * @param {Matrix} input — عمود (inputSize × 1)
     * @returns {Matrix}     — عمود (outputSize × 1)
     */
    forward(input) {
        const z = Matrix.add(
            Matrix.multiply(this.weights, input),
            this.biases
        );
        if (this.activation === 'softmax') {
            const arr = Activations.softmax(z.toArray());
            return Matrix.fromArray(arr);
        }
        const fn = Activations[this.activation] || Activations.sigmoid;
        return z.map(fn);
    }

    /** تصدير الأوزان للحفظ */
    toJSON() {
        return {
            inputSize:  this.inputSize,
            outputSize: this.outputSize,
            activation: this.activation,
            weights:    this.weights.toJSON(),
            biases:     this.biases.toJSON(),
        };
    }

    /** استعادة الأوزان */
    static fromJSON(obj) {
        const layer = new DenseLayer(obj.inputSize, obj.outputSize, obj.activation);
        layer.weights = new Matrix(obj.weights.rows, obj.weights.cols,
            new Float64Array(obj.weights.data));
        layer.biases  = new Matrix(obj.biases.rows, obj.biases.cols,
            new Float64Array(obj.biases.data));
        return layer;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. الشبكة العصبية الكاملة لسلاسل المداد
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaSupplyChainNeuralNetwork {

    constructor() {
        // ── الطبقات ──────────────────────────────────────────────────────────
        this.coreLayer   = new DenseLayer(INPUT_SIZE,  CORE_SIZE,   'tanh');
        this.intelLayer  = new DenseLayer(CORE_SIZE,   INTEL_SIZE,  'relu');
        this.outputLayer = new DenseLayer(INTEL_SIZE,  OUTPUT_SIZE, 'sigmoid');

        this._forecastHistory = [];   // سجل توقعات الطلب
        this._supplierCache   = new Map();
        this._trained = false;
    }

    // ── التمرير الأمامي الكامل ──────────────────────────────────────────────

    /**
     * تمرير متجه المدخلات عبر طبقات الشبكة
     * @param {number[]} inputArr — 12 قيمة مُعيَّرة بين 0 و 1
     * @returns {{ core: number[], intel: number[], output: number[] }}
     */
    forward(inputArr) {
        if (inputArr.length !== INPUT_SIZE) {
            throw new Error(`يجب توفير ${INPUT_SIZE} مؤشر، وُجد: ${inputArr.length}`);
        }
        const input       = Matrix.fromArray(inputArr);
        const coreOut     = this.coreLayer.forward(input);
        const intelOut    = this.intelLayer.forward(coreOut);
        const outputOut   = this.outputLayer.forward(intelOut);

        return {
            core:   coreOut.toArray(),
            intel:  intelOut.toArray(),
            output: outputOut.toArray(),
        };
    }

    // ── تعيير المدخلات ───────────────────────────────────────────────────────

    /**
     * تحويل بيانات سلسلة المداد الخام إلى متجه مُعيَّر (0-1)
     * @param {object} params — بيانات الطلب الخام
     * @returns {number[]} inputArr
     */
    normalizeInput(params) {
        const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
        const p = params || {};

        return [
            clamp((p.demandLevel    || 0.5)),                       // demand_signal
            clamp(1 - (p.priceIndex || 0.5)),                       // price_index  (سعر أعلى → ضغط)
            clamp((p.supplierScore  || 70) / 100),                  // supplier_score
            clamp(1 - Math.min(1, (p.leadTimeDays || 14) / 90)),    // lead_time (أقل أحسن)
            clamp((p.qualityRate    || 95) / 100),                  // quality_rate
            clamp((p.inventoryLevel || 0.5)),                       // inventory_level
            clamp(1 - Math.min(1, (p.logisticsCostPct || 0.1))),    // logistics_cost
            clamp(1 - (p.riskFactor     || 0.3)),                   // risk_factor
            clamp(1 - (p.geoRisk        || 0.2)),                   // geo_risk
            clamp((p.complianceScore    || 0.9)),                   // compliance_score
            clamp(1 - (p.marketVolatility || 0.3)),                 // market_volatility
            clamp(p.shariaCompliant === false ? 0 : (p.shariaScore || 1.0)), // sharia_compliance
        ];
    }

    // ── الفلتر الشرعي ────────────────────────────────────────────────────────

    /**
     * فحص الامتثال الشرعي الأولي للمعاملة
     * @param {object} params
     * @returns {{ compliant: boolean, violations: string[], alerts: string[] }}
     */
    shariaFilter(params) {
        const violations = [];
        const alerts     = [];

        if (params.interestRate > 0 || params.riba) {
            violations.push('ربا — عمليات بفائدة محرمة');
        }
        if (params.unknownQuantity || params.unknownPrice) {
            violations.push('غرر — جهالة في الكمية أو السعر');
        }
        if (params.consent === false) {
            violations.push('انعدام التراضي بين الطرفين');
        }
        if (params.prohibitedGoods) {
            violations.push('بضاعة محرمة — لا يجوز تداولها');
        }
        if (params.delayedGoldSilver) {
            alerts.push('تنبيه: ذهب أو فضة — يُشترط التقابض الفوري');
        }
        if (params.speculativeContract) {
            alerts.push('تنبيه: عقد مضاربي — يُراجع بفقيه');
        }

        return {
            compliant:  violations.length === 0,
            violations,
            alerts,
            reference:  'لا ضرر ولا ضرار — النووي',
            quranRef:   'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة ٢٧٥',
        };
    }

    // ── توقع الطلب (Demand Forecasting) ────────────────────────────────────

    /**
     * تحسين توقع الطلب بمتوسط متحرك موزون أسي (EWM)
     * @param {number[]} historicalDemand — سلسلة تاريخية من الطلب
     * @param {object}   [factors]        — معاملات تأثير إضافية
     * @returns {{ forecast: number, confidence: number, trend: string, method: string }}
     */
    forecastDemand(historicalDemand, factors = {}) {
        if (!historicalDemand || historicalDemand.length === 0) {
            return { forecast: 0, confidence: 0, trend: 'unknown', method: 'EWM' };
        }

        const alpha = 0.3; // معامل التنعيم
        let ewm = historicalDemand[0];
        for (let i = 1; i < historicalDemand.length; i++) {
            ewm = alpha * historicalDemand[i] + (1 - alpha) * ewm;
        }

        // تأثير العوامل الخارجية
        const seasonalFactor = factors.seasonal || 1.0;
        const growthFactor   = factors.growth   || 1.0;
        const riskAdjustment = 1 - (factors.risk || 0);

        const forecast = ewm * seasonalFactor * growthFactor * riskAdjustment;

        // حساب الثقة بناءً على تباين البيانات
        const mean = historicalDemand.reduce((a, b) => a + b, 0) / historicalDemand.length;
        const variance = historicalDemand.reduce((s, v) => s + (v - mean) ** 2, 0) / historicalDemand.length;
        const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // معامل التباين
        const confidence = Math.max(0, Math.min(1, 1 - cv));

        const last = historicalDemand[historicalDemand.length - 1];
        const trend = forecast > last * 1.05 ? 'تصاعدي ↑' : forecast < last * 0.95 ? 'تنازلي ↓' : 'مستقر →';

        this._forecastHistory.push({ ts: Date.now(), forecast, confidence, trend });

        return { forecast: Math.round(forecast * 100) / 100, confidence, trend, method: 'EWM-α0.3' };
    }

    // ── تسجيل الموردين (Supplier Scoring) ──────────────────────────────────

    /**
     * حساب نقاط مورد بمعايير متعددة
     * @param {object} supplier — بيانات المورد
     * @returns {{ score: number, grade: string, details: object }}
     */
    scoreSupplier(supplier) {
        const s = supplier || {};

        const weights = {
            quality:     0.30,
            reliability: 0.25,
            price:       0.20,
            compliance:  0.15,
            sharia:      0.10,
        };

        const scores = {
            quality:     Math.min(1, (s.qualityRate    || 0) / 100),
            reliability: Math.min(1, (s.otdRate        || 0) / 100),
            price:       Math.min(1, 1 - (s.priceIndex || 0.5)),
            compliance:  Math.min(1, (s.complianceScore || 0)),
            sharia:      s.shariaCompliant === false ? 0 : 1,
        };

        let total = 0;
        for (const k of Object.keys(weights)) {
            total += (scores[k] || 0) * weights[k];
        }

        const pct = Math.round(total * 100);
        const grade = pct >= GRADE_A_PLUS ? 'A+' : pct >= GRADE_A ? 'A' : pct >= GRADE_B ? 'B' : pct >= GRADE_C ? 'C' : 'D';

        const result = { score: pct, grade, details: scores, weights };
        this._supplierCache.set(s.id || `S-${Date.now()}`, result);
        return result;
    }

    // ── تحسين المخزون (EOQ) ─────────────────────────────────────────────────

    /**
     * حساب كمية الطلب الاقتصادية (Economic Order Quantity)
     * @param {object} params — { annualDemand, orderCost, holdingCostPct, unitPrice }
     * @returns {{ eoq: number, reorderPoint: number, safetyStock: number, annualCost: number }}
     */
    optimizeInventory(params) {
        const { annualDemand = 1000, orderCost = 50, holdingCostPct = 0.25, unitPrice = 10,
                leadTimeDays = 14, demandStdDev = 50, serviceLevelZ = 1.65 } = params;

        const holdingCost = Math.max(MIN_HOLDING_COST, holdingCostPct * unitPrice); // تجنب القسمة على صفر
        const eoq         = Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
        const dailyDemand = annualDemand / 365;
        const safetyStock = serviceLevelZ * demandStdDev * Math.sqrt(leadTimeDays);
        const reorderPoint = dailyDemand * leadTimeDays + safetyStock;
        const orderFreq    = annualDemand / eoq;
        const annualCost   = orderFreq * orderCost + (eoq / 2) * holdingCost;

        return {
            eoq:          Math.round(eoq),
            safetyStock:  Math.round(safetyStock),
            reorderPoint: Math.round(reorderPoint),
            orderFreq:    Math.round(orderFreq * 10) / 10,
            annualCost:   Math.round(annualCost * 100) / 100,
            method:       'Wilson EOQ',
            islamicNote:  'التخزين الاستراتيجي — سنة يوسف عليه السلام (يوسف ٤٧)',
        };
    }

    // ── تقدير المخاطر ───────────────────────────────────────────────────────

    /**
     * تقدير مخاطر سلسلة المداد وترتيبها بالأولوية
     * @param {object} params
     * @returns {{ totalRisk: number, level: string, factors: object[], mitigation: string[] }}
     */
    assessRisk(params) {
        const p = params || {};

        const riskFactors = [
            { id: 'supplier_concentration', nameAr: 'تركز الموردين',          weight: 0.20, value: p.supplierConcentration || 0.3 },
            { id: 'geo_political',          nameAr: 'مخاطر جيوسياسية',         weight: 0.20, value: p.geoPoliticalRisk     || 0.2 },
            { id: 'lead_time_variability',  nameAr: 'تذبذب وقت التوريد',       weight: 0.15, value: p.leadTimeVariability  || 0.25 },
            { id: 'demand_volatility',      nameAr: 'تقلبات الطلب',            weight: 0.15, value: p.demandVolatility     || 0.2 },
            { id: 'quality_failure',        nameAr: 'مخاطر جودة',              weight: 0.15, value: p.qualityFailureRate   || 0.05 },
            { id: 'financial_health',       nameAr: 'صحة مالية الموردين',      weight: 0.10, value: 1 - (p.supplierFinancialHealth || 0.8) },
            { id: 'regulatory_compliance',  nameAr: 'مخاطر تنظيمية',           weight: 0.05, value: 1 - (p.complianceScore       || 0.9) },
        ];

        let totalRisk = 0;
        for (const f of riskFactors) {
            f.contribution = f.weight * f.value;
            totalRisk += f.contribution;
        }
        totalRisk = Math.min(1, totalRisk);

        const level = totalRisk < 0.2 ? 'منخفض 🟢' : totalRisk < 0.4 ? 'متوسط 🟡' : totalRisk < 0.6 ? 'مرتفع 🟠' : 'حرج 🔴';

        const mitigation = [];
        if ((p.supplierConcentration || 0) > 0.4) mitigation.push('تنويع قاعدة الموردين — لا تعتمد على مورد واحد');
        if ((p.geoPoliticalRisk     || 0) > 0.3) mitigation.push('وضع خطة طوارئ للمناطق الجيوسياسية عالية المخاطر');
        if ((p.leadTimeVariability  || 0) > 0.3) mitigation.push('بناء مخزون احتياطي (Safety Stock) أعلى');
        if ((p.qualityFailureRate   || 0) > 0.1) mitigation.push('تعزيز برنامج فحص الجودة عند الاستلام');
        if (mitigation.length === 0) mitigation.push('سلسلة المداد في وضع صحي — استمر في المراقبة الدورية');

        return { totalRisk: Math.round(totalRisk * 100) / 100, level, factors: riskFactors, mitigation };
    }

    // ── التشغيل الكامل (Main Inference) ────────────────────────────────────

    /**
     * التشغيل الكامل للشبكة العصبية على بيانات سلسلة مداد
     * @param {object} scmData — بيانات سلسلة المداد الكاملة
     * @returns {object}       — تقرير شامل من الشبكة العصبية
     */
    analyze(scmData) {
        const traceId = `NSCE-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

        // 1. فلتر الشريعة أولاً
        const shariaCheck = this.shariaFilter(scmData);
        if (!shariaCheck.compliant) {
            return {
                traceId,
                success:  false,
                code:     'SHARIA_VIOLATION',
                message:  `المعاملة تخالف الشريعة: ${shariaCheck.violations.join(' | ')}`,
                sharia:   shariaCheck,
                tawheed:  'لا إله إلا الله',
            };
        }

        // 2. تعيير المدخلات
        const inputArr = this.normalizeInput(scmData);

        // 3. التمرير الأمامي عبر الشبكة
        const { core, intel, output } = this.forward(inputArr);

        // 4. تعيين نتائج الطبقة الأساسية للمراحل
        const coreResults = CORE_NODES.map((node, i) => ({
            ...node,
            activation:  Math.round(core[i] * 100) / 100,
            status:      core[i] > 0.6 ? 'نشط ✅' : core[i] > 0.3 ? 'يحتاج انتباه ⚠️' : 'حرج 🔴',
            shariaRef:   SCM_SHARIA_REFS[node.id] || null,
        }));

        // 5. تعيين نتائج طبقة الذكاء
        const intelResults = INTEL_NODES.map((node, i) => ({
            ...node,
            score:      Math.round(intel[i] * 100) / 100,
            priority:   intel[i] > 0.7 ? 'عالية' : intel[i] > 0.4 ? 'متوسطة' : 'منخفضة',
        }));

        // 6. نتائج طبقة الإخراج
        const [actionScore, confidence, complianceOut, summarySignal] = output;
        const overallGrade = actionScore > 0.8 ? 'ممتاز A+' : actionScore > 0.65 ? 'جيد جداً A'
            : actionScore > 0.5 ? 'جيد B' : actionScore > 0.35 ? 'مقبول C' : 'يحتاج تحسين D';

        // 7. توقع الطلب
        const demandForecast = scmData.historicalDemand
            ? this.forecastDemand(scmData.historicalDemand, scmData.demandFactors)
            : null;

        // 8. تسجيل المورد (إن وُجد)
        const supplierScore = scmData.supplier
            ? this.scoreSupplier(scmData.supplier)
            : null;

        // 9. تحسين المخزون
        const inventoryOpt = scmData.inventoryParams
            ? this.optimizeInventory(scmData.inventoryParams)
            : null;

        // 10. تقدير المخاطر
        const riskAssessment = this.assessRisk(scmData.riskParams || scmData);

        // 11. ملخص تنفيذي
        const executiveSummary = this._buildExecutiveSummary({
            actionScore, confidence, overallGrade,
            coreResults, intelResults, riskAssessment, demandForecast,
        });

        return {
            traceId,
            success:    true,
            tawheed:    'لا إله إلا الله',
            schema:     'sheikha/nsce/v1',
            timestamp:  new Date().toISOString(),
            network: {
                inputFeatures:    INPUT_FEATURES.map((f, i) => ({ ...f, value: inputArr[i] })),
                coreLayer:        coreResults,
                intelLayer:       intelResults,
                outputLayer: {
                    actionScore:   Math.round(actionScore  * 100) / 100,
                    confidence:    Math.round(confidence   * 100) / 100,
                    compliance:    Math.round(complianceOut * 100) / 100,
                    summarySignal: Math.round(summarySignal * 100) / 100,
                    overallGrade,
                },
            },
            analysis: {
                sharia:       shariaCheck,
                demandForecast,
                supplierScore,
                inventoryOpt,
                riskAssessment,
            },
            executiveSummary,
        };
    }

    // ── ملخص تنفيذي ─────────────────────────────────────────────────────────

    _buildExecutiveSummary({ actionScore, confidence, overallGrade, coreResults, intelResults, riskAssessment, demandForecast }) {
        const topIntel  = [...intelResults].sort((a, b) => b.score - a.score).slice(0, 3);
        const critNodes = coreResults.filter(n => n.activation < 0.35);
        const lines = [
            `📊 التقييم الإجمالي: ${overallGrade} (${Math.round(actionScore * 100)}%) | ثقة: ${Math.round(confidence * 100)}%`,
            `⚠️  مستوى المخاطر: ${riskAssessment.level} (${Math.round(riskAssessment.totalRisk * 100)}%)`,
        ];
        if (demandForecast) {
            lines.push(`📈 توقع الطلب: ${demandForecast.forecast} وحدة | الاتجاه: ${demandForecast.trend}`);
        }
        if (critNodes.length > 0) {
            lines.push(`🔴 مراحل تحتاج تدخل: ${critNodes.map(n => n.nameAr).join('، ')}`);
        }
        lines.push(`💡 أولويات الذكاء: ${topIntel.map(n => n.nameAr).join(' | ')}`);
        if (riskAssessment.mitigation.length > 0) {
            lines.push(`🛡️  توصيات المخاطر: ${riskAssessment.mitigation[0]}`);
        }
        return lines.join('\n');
    }

    /** حالة الشبكة */
    status() {
        return {
            schema:          'sheikha/nsce/v1',
            nameAr:          'شبكة شيخة العصبية لسلاسل المداد والتوريد',
            layers: {
                input:  { nodes: INPUT_SIZE,  description: 'مؤشرات سلسلة المداد' },
                core:   { nodes: CORE_SIZE,   description: 'مراحل SCOR' },
                intel:  { nodes: INTEL_SIZE,  description: 'طبقة الذكاء والتوصيات' },
                output: { nodes: OUTPUT_SIZE, description: 'القرار الموحد' },
            },
            features:        INPUT_FEATURES.map(f => f.id),
            coreNodes:       CORE_NODES.map(n => n.id),
            intelNodes:      INTEL_NODES.map(n => n.id),
            forecastHistory: this._forecastHistory.length,
            cachedSuppliers: this._supplierCache.size,
            tawheed:         'لا إله إلا الله',
        };
    }

    /** تصدير أوزان الشبكة */
    exportWeights() {
        return {
            schema:      'sheikha/nsce/v1',
            exportedAt:  new Date().toISOString(),
            coreLayer:   this.coreLayer.toJSON(),
            intelLayer:  this.intelLayer.toJSON(),
            outputLayer: this.outputLayer.toJSON(),
        };
    }

    /** استيراد أوزان الشبكة */
    importWeights(data) {
        if (data.schema !== 'sheikha/nsce/v1') {
            throw new Error('مخطط الأوزان غير متوافق');
        }
        this.coreLayer   = DenseLayer.fromJSON(data.coreLayer);
        this.intelLayer  = DenseLayer.fromJSON(data.intelLayer);
        this.outputLayer = DenseLayer.fromJSON(data.outputLayer);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// 7. Singleton + تصدير
// ══════════════════════════════════════════════════════════════════════════════

/** Singleton للاستخدام في المسارات */
const neuralSCM = new SheikhaSupplyChainNeuralNetwork();

module.exports = {
    neuralSCM,
    SheikhaSupplyChainNeuralNetwork,
    DenseLayer,
    Matrix,
    Activations,
    INPUT_FEATURES,
    CORE_NODES,
    INTEL_NODES,
    SCM_SHARIA_REFS,
};
