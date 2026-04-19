// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 SHEIKHA ERP NEURAL NETWORK — الشبكة العصبية لنظام تخطيط موارد المؤسسة
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ" — الأنفال: 60
 * "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ" — النحل: 90
 *
 * شبكة عصبية حقيقية (بجافاسكربت نقي) لكل وحدة من وحدات ERP:
 *
 * ✅ وحدة المالية والمحاسبة  → ERPFinanceNet
 * ✅ وحدة الموارد البشرية    → ERPHRNet
 * ✅ وحدة المخزون            → ERPInventoryNet
 * ✅ وحدة الإنتاج            → ERPProductionNet
 * ✅ وحدة المشتريات          → ERPProcurementNet
 * ✅ وحدة المبيعات           → ERPSalesNet
 * ✅ الشبكة العصبية الجامعة  → ERPMasterNet (تجمع كل الوحدات)
 *
 * كل شبكة:
 *   • طبقة إدخال (Input Layer)
 *   • طبقات خفية (Hidden Layers) بدالة تفعيل ReLU
 *   • طبقة إخراج (Output Layer) بدالة Sigmoid / Softmax
 *   • Adam Optimizer + Backpropagation
 *   • Xavier Initialization
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. MATRIX ENGINE — عمليات المصفوفات
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
        if (a.cols !== b.rows) throw new Error(`Matrix dim error: ${a.rows}x${a.cols} * ${b.rows}x${b.cols}`);
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

    static addVec(m, vec) {
        const out = new Matrix(m.rows, m.cols);
        for (let i = 0; i < m.rows; i++) {
            for (let j = 0; j < m.cols; j++) {
                out.data[i * m.cols + j] = m.data[i * m.cols + j] + vec[j];
            }
        }
        return out;
    }

    static transpose(m) {
        const out = new Matrix(m.cols, m.rows);
        for (let i = 0; i < m.rows; i++) {
            for (let j = 0; j < m.cols; j++) {
                out.data[j * m.rows + i] = m.data[i * m.cols + j];
            }
        }
        return out;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ACTIVATION FUNCTIONS — دوال التفعيل
// ═══════════════════════════════════════════════════════════════════════════════

const Activation = {
    relu:      (x) => Math.max(0, x),
    reluGrad:  (x) => (x > 0 ? 1 : 0),
    sigmoid:   (x) => 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500))),
    sigmoidGrad: (s) => s * (1 - s),
    tanh:      (x) => Math.tanh(x),
    tanhGrad:  (t) => 1 - t * t,
    softmax: (arr) => {
        const mx = Math.max(...arr);
        const exps = arr.map(v => Math.exp(v - mx));
        const sum = exps.reduce((a, b) => a + b, 0);
        return exps.map(v => v / sum);
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DENSE LAYER — طبقة كثيفة مع Adam Optimizer
// ═══════════════════════════════════════════════════════════════════════════════

class DenseLayer {
    constructor(inputSize, outputSize, activation = 'relu') {
        this.inputSize  = inputSize;
        this.outputSize = outputSize;
        this.activation = activation;

        this.W = Matrix.xavier(inputSize, outputSize);
        this.b = new Float64Array(outputSize);

        // Adam optimizer state
        this.lr   = 0.001;
        this.beta1 = 0.9;
        this.beta2 = 0.999;
        this.eps   = 1e-8;
        this.t     = 0;
        this.mW = new Float64Array(inputSize * outputSize);
        this.vW = new Float64Array(inputSize * outputSize);
        this.mb = new Float64Array(outputSize);
        this.vb = new Float64Array(outputSize);

        this._input  = null;
        this._preact = null;
        this._output = null;
    }

    forward(input) {
        this._input = input;
        const pre = new Float64Array(this.outputSize);
        for (let j = 0; j < this.outputSize; j++) {
            let s = this.b[j];
            for (let i = 0; i < this.inputSize; i++) {
                s += input[i] * this.W.data[i * this.outputSize + j];
            }
            pre[j] = s;
        }
        this._preact = pre;

        const act = Activation[this.activation] || Activation.relu;
        if (this.activation === 'softmax') {
            this._output = Activation.softmax(Array.from(pre));
        } else {
            this._output = pre.map(v => act(v));
        }
        return this._output;
    }

    backward(dOut) {
        const act = this.activation;
        let dPre;
        if (act === 'sigmoid') {
            dPre = dOut.map((d, i) => d * Activation.sigmoidGrad(this._output[i]));
        } else if (act === 'tanh') {
            dPre = dOut.map((d, i) => d * Activation.tanhGrad(this._output[i]));
        } else if (act === 'softmax') {
            dPre = dOut; // simplified
        } else {
            dPre = dOut.map((d, i) => d * Activation.reluGrad(this._preact[i]));
        }

        const dInput = new Float64Array(this.inputSize);
        const dW = new Float64Array(this.inputSize * this.outputSize);
        const db = new Float64Array(this.outputSize);

        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                dW[i * this.outputSize + j] = this._input[i] * dPre[j];
                dInput[i] += this.W.data[i * this.outputSize + j] * dPre[j];
            }
        }
        for (let j = 0; j < this.outputSize; j++) db[j] = dPre[j];

        this._adamUpdate(dW, db);
        return dInput;
    }

    _adamUpdate(dW, db) {
        this.t++;
        const bc1 = 1 - Math.pow(this.beta1, this.t);
        const bc2 = 1 - Math.pow(this.beta2, this.t);
        for (let i = 0; i < dW.length; i++) {
            this.mW[i] = this.beta1 * this.mW[i] + (1 - this.beta1) * dW[i];
            this.vW[i] = this.beta2 * this.vW[i] + (1 - this.beta2) * dW[i] * dW[i];
            const mHat = this.mW[i] / bc1;
            const vHat = this.vW[i] / bc2;
            this.W.data[i] -= this.lr * mHat / (Math.sqrt(vHat) + this.eps);
        }
        for (let i = 0; i < db.length; i++) {
            this.mb[i] = this.beta1 * this.mb[i] + (1 - this.beta1) * db[i];
            this.vb[i] = this.beta2 * this.vb[i] + (1 - this.beta2) * db[i] * db[i];
            const mHat = this.mb[i] / bc1;
            const vHat = this.vb[i] / bc2;
            this.b[i] -= this.lr * mHat / (Math.sqrt(vHat) + this.eps);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. BASE NEURAL NETWORK — قاعدة الشبكة العصبية
// ═══════════════════════════════════════════════════════════════════════════════

class ERPModuleNet {
    constructor(config) {
        this.id         = config.id;
        this.nameAr     = config.nameAr;
        this.nameEn     = config.nameEn;
        this.inputNames = config.inputNames;  // أسماء مدخلات
        this.outputNames= config.outputNames; // أسماء مخرجات
        this.layers     = [];
        this.trainCount = 0;
        this.totalLoss  = 0;
        this.initialized= false;

        const sizes = config.layerSizes; // مثال: [8, 16, 8, 4]
        for (let i = 0; i < sizes.length - 1; i++) {
            const act = (i === sizes.length - 2) ? (config.outputActivation || 'sigmoid') : 'relu';
            this.layers.push(new DenseLayer(sizes[i], sizes[i + 1], act));
        }
        this.initialized = true;
    }

    forward(inputs) {
        let out = Array.isArray(inputs) ? inputs : Array.from(inputs);
        // تطبيع المدخلات
        out = out.map(v => (isFinite(v) ? v : 0));
        for (const layer of this.layers) {
            out = layer.forward(out);
        }
        return out;
    }

    train(inputs, targets, epochs = 10) {
        let lastLoss = 0;
        for (let e = 0; e < epochs; e++) {
            const pred = this.forward(inputs);
            // MSE loss + backward
            const dOut = pred.map((p, i) => p - (targets[i] || 0));
            lastLoss = dOut.reduce((s, d) => s + d * d, 0) / dOut.length;
            let grad = dOut;
            for (let l = this.layers.length - 1; l >= 0; l--) {
                grad = this.layers[l].backward(grad);
            }
            this.trainCount++;
            this.totalLoss += lastLoss;
        }
        return lastLoss;
    }

    predict(inputs) {
        const raw = this.forward(inputs);
        const named = {};
        this.outputNames.forEach((n, i) => { named[n] = raw[i] !== undefined ? raw[i] : 0; });
        return { raw, named, confidence: Math.max(...raw) };
    }

    getStatus() {
        return {
            id:          this.id,
            nameAr:      this.nameAr,
            nameEn:      this.nameEn,
            layers:      this.layers.map(l => `${l.inputSize}→${l.outputSize}(${l.activation})`),
            trainCount:  this.trainCount,
            avgLoss:     this.trainCount > 0 ? (this.totalLoss / this.trainCount).toFixed(6) : 'غير مدرّبة',
            initialized: this.initialized
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ERP MODULE NEURAL NETWORKS — شبكات عصبية لكل وحدة ERP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 5.1 وحدة المالية والمحاسبة
 * المدخلات: الإيرادات، المصاريف، الأصول، الخصوم، التدفق النقدي، نسبة الزكاة، المخصصات
 * المخرجات: صحة_الميزانية، توصية_الزكاة، توقع_الإفلاس، مؤشر_السيولة
 */
const ERPFinanceNet = new ERPModuleNet({
    id:         'erp_finance',
    nameAr:     'الشبكة العصبية — المالية والمحاسبة',
    nameEn:     'ERP Finance & Accounting Neural Net',
    inputNames: ['revenues', 'expenses', 'assets', 'liabilities', 'cashFlow', 'zakatBase', 'provisions', 'equity'],
    outputNames:['budgetHealth', 'zakatRecommendation', 'insolvencyRisk', 'liquidityIndex'],
    layerSizes: [8, 20, 12, 4],
    outputActivation: 'sigmoid'
});

/**
 * 5.2 وحدة الموارد البشرية
 * المدخلات: عدد الموظفين، معدل الدوران، الإنتاجية، الرواتب، التدريب، الغياب، الرضا، الأداء
 * المخرجات: توصية_توظيف، خطر_استقالة، احتياج_تدريب، مؤشر_رضا
 */
const ERPHRNet = new ERPModuleNet({
    id:         'erp_hr',
    nameAr:     'الشبكة العصبية — الموارد البشرية',
    nameEn:     'ERP Human Resources Neural Net',
    inputNames: ['headcount', 'turnoverRate', 'productivity', 'avgSalary', 'trainingHours', 'absenceRate', 'satisfactionScore', 'performanceIndex'],
    outputNames:['hiringRecommendation', 'resignationRisk', 'trainingNeed', 'satisfactionForecast'],
    layerSizes: [8, 24, 12, 4],
    outputActivation: 'sigmoid'
});

/**
 * 5.3 وحدة المخزون
 * المدخلات: مستوى_المخزون، معدل_الدوران، نقطة_إعادة_الطلب، الفاقد، التكلفة، الطلب_المتوقع، أيام_التوريد، دقة_التنبؤ
 * المخرجات: توصية_إعادة_طلب، خطر_نقص، توقع_فائض، تحسين_التكلفة
 */
const ERPInventoryNet = new ERPModuleNet({
    id:         'erp_inventory',
    nameAr:     'الشبكة العصبية — إدارة المخزون',
    nameEn:     'ERP Inventory Management Neural Net',
    inputNames: ['stockLevel', 'turnoverRate', 'reorderPoint', 'shrinkage', 'holdingCost', 'demandForecast', 'leadDays', 'forecastAccuracy'],
    outputNames:['reorderRecommendation', 'stockoutRisk', 'overstockWarning', 'costOptimization'],
    layerSizes: [8, 24, 16, 4],
    outputActivation: 'sigmoid'
});

/**
 * 5.4 وحدة الإنتاج والتصنيع
 * المدخلات: طاقة_المصنع، استغلال_الطاقة، معدل_العيوب، كفاءة_الآلات، وقت_الدورة، تكلفة_الوحدة، إنتاجية_العمالة، زمن_التوقف
 * المخرجات: توصية_جدولة، مؤشر_الجودة، كفاءة_OEE، توقع_التوقف
 */
const ERPProductionNet = new ERPModuleNet({
    id:         'erp_production',
    nameAr:     'الشبكة العصبية — الإنتاج والتصنيع',
    nameEn:     'ERP Production & Manufacturing Neural Net',
    inputNames: ['plantCapacity', 'capacityUtilization', 'defectRate', 'machineEfficiency', 'cycleTime', 'unitCost', 'laborProductivity', 'downtimeHours'],
    outputNames:['schedulingRecommendation', 'qualityIndex', 'oeeForecast', 'downtimePrediction'],
    layerSizes: [8, 24, 16, 4],
    outputActivation: 'sigmoid'
});

/**
 * 5.5 وحدة المشتريات والتوريد
 * المدخلات: عدد_الموردين، متوسط_سعر_الشراء، مدة_سداد، جودة_التسليم، الامتثال_الشرعي، مخاطر_المورد، حجم_المشتريات، معدل_الشكاوى
 * المخرجات: توصية_مورد، خطر_سلسلة_التوريد، مؤشر_الامتثال، توقع_التكلفة
 */
const ERPProcurementNet = new ERPModuleNet({
    id:         'erp_procurement',
    nameAr:     'الشبكة العصبية — المشتريات والتوريد',
    nameEn:     'ERP Procurement & Sourcing Neural Net',
    inputNames: ['supplierCount', 'avgPurchasePrice', 'paymentTermDays', 'deliveryQuality', 'shariahCompliance', 'supplierRisk', 'purchaseVolume', 'complaintRate'],
    outputNames:['supplierRecommendation', 'supplyChainRisk', 'complianceIndex', 'costForecast'],
    layerSizes: [8, 24, 16, 4],
    outputActivation: 'sigmoid'
});

/**
 * 5.6 وحدة المبيعات وإدارة علاقات العملاء
 * المدخلات: عدد_العملاء، معدل_التحويل، متوسط_قيمة_الطلب، معدل_الاحتفاظ، رضا_العميل، نمو_الإيرادات، مخزون_العروض، دورة_المبيعات
 * المخرجات: توصية_بيعية، توقع_الإيرادات، خطر_فقد_عميل، مؤشر_النمو
 */
const ERPSalesNet = new ERPModuleNet({
    id:         'erp_sales',
    nameAr:     'الشبكة العصبية — المبيعات وإدارة العملاء',
    nameEn:     'ERP Sales & CRM Neural Net',
    inputNames: ['customerCount', 'conversionRate', 'avgOrderValue', 'retentionRate', 'customerSatisfaction', 'revenueGrowth', 'pipelineValue', 'salesCycleDays'],
    outputNames:['salesRecommendation', 'revenueForecast', 'churnRisk', 'growthIndex'],
    layerSizes: [8, 24, 16, 4],
    outputActivation: 'sigmoid'
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ERP MASTER NETWORK — الشبكة العصبية الجامعة لكل وحدات ERP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تأخذ مخرجات كل وحدة (4 مخرجات × 6 وحدات = 24 مدخلاً)
 * وتخرج: صحة_المؤسسة_الكلية، أولوية_التدخل، مؤشر_الربحية، مستوى_الامتثال_الشرعي
 */
const ERPMasterNet = new ERPModuleNet({
    id:         'erp_master',
    nameAr:     'الشبكة العصبية الجامعة — ERP الكامل',
    nameEn:     'ERP Master Neural Network (All Modules Integrated)',
    inputNames: [
        // Finance outputs
        'fin_budgetHealth', 'fin_zakatRec', 'fin_insolvencyRisk', 'fin_liquidity',
        // HR outputs
        'hr_hiringRec', 'hr_resignRisk', 'hr_trainingNeed', 'hr_satisfaction',
        // Inventory outputs
        'inv_reorder', 'inv_stockoutRisk', 'inv_overstock', 'inv_costOpt',
        // Production outputs
        'prod_schedule', 'prod_quality', 'prod_oee', 'prod_downtime',
        // Procurement outputs
        'proc_supplier', 'proc_scRisk', 'proc_compliance', 'proc_cost',
        // Sales outputs
        'sales_rec', 'sales_revenue', 'sales_churn', 'sales_growth'
    ],
    outputNames:['enterpriseHealth', 'interventionPriority', 'profitabilityIndex', 'shariahComplianceLevel'],
    layerSizes: [24, 48, 32, 16, 4],
    outputActivation: 'sigmoid'
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. ERP NEURAL ENGINE — المحرك الموحد للشبكة العصبية ERP
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaERPNeuralNetwork extends EventEmitter {
    constructor() {
        super();
        this.version    = '1.0.0';
        this.nameAr     = 'الشبكة العصبية لنظام ERP — منظومة شيخة';
        this.nameEn     = 'Sheikha ERP Neural Network';
        this.startTime  = new Date();
        this.status     = 'operational';

        // الشبكات الفردية لكل وحدة
        this.modules = {
            finance:     ERPFinanceNet,
            hr:          ERPHRNet,
            inventory:   ERPInventoryNet,
            production:  ERPProductionNet,
            procurement: ERPProcurementNet,
            sales:       ERPSalesNet
        };

        // الشبكة الجامعة
        this.masterNet = ERPMasterNet;

        console.log(`✅ [ERP-NEURAL] ${this.nameAr} — مُفعَّل`);
        console.log(`   ├─ وحدة المالية:       ${ERPFinanceNet.layers.length} طبقات`);
        console.log(`   ├─ وحدة الموارد البشرية: ${ERPHRNet.layers.length} طبقات`);
        console.log(`   ├─ وحدة المخزون:       ${ERPInventoryNet.layers.length} طبقات`);
        console.log(`   ├─ وحدة الإنتاج:       ${ERPProductionNet.layers.length} طبقات`);
        console.log(`   ├─ وحدة المشتريات:     ${ERPProcurementNet.layers.length} طبقات`);
        console.log(`   ├─ وحدة المبيعات:      ${ERPSalesNet.layers.length} طبقات`);
        console.log(`   └─ الشبكة الجامعة:     ${ERPMasterNet.layers.length} طبقات (24 مدخل → 4 مخرجات)`);
    }

    /**
     * تحليل كامل لوحدة ERP واحدة
     * @param {string} moduleId - 'finance' | 'hr' | 'inventory' | 'production' | 'procurement' | 'sales'
     * @param {number[]} inputs - مصفوفة المدخلات المطابقة للوحدة
     */
    analyzeModule(moduleId, inputs) {
        const net = this.modules[moduleId];
        if (!net) throw new Error(`وحدة ERP غير معروفة: ${moduleId}`);
        const result = net.predict(inputs);
        this.emit('module_analyzed', { moduleId, result });
        return { moduleId, nameAr: net.nameAr, ...result };
    }

    /**
     * تدريب وحدة ERP محددة
     * @param {string} moduleId
     * @param {number[]} inputs
     * @param {number[]} targets
     * @param {number} epochs
     */
    trainModule(moduleId, inputs, targets, epochs = 20) {
        const net = this.modules[moduleId];
        if (!net) throw new Error(`وحدة ERP غير معروفة: ${moduleId}`);
        const loss = net.train(inputs, targets, epochs);
        this.emit('module_trained', { moduleId, loss, epochs });
        return { moduleId, loss, epochs };
    }

    /**
     * التحليل الشامل لكل وحدات ERP والشبكة الجامعة
     * @param {Object} allInputs - { finance: [...], hr: [...], inventory: [...], production: [...], procurement: [...], sales: [...] }
     */
    analyzeAll(allInputs) {
        const moduleResults = {};
        const masterInputs  = [];

        for (const [key, net] of Object.entries(this.modules)) {
            const inputs = allInputs[key] || new Array(net.layers[0].inputSize).fill(0.5);
            const result = net.predict(inputs);
            moduleResults[key] = { nameAr: net.nameAr, ...result };
            // أضف مخرجات هذه الوحدة كمدخلات للشبكة الجامعة
            masterInputs.push(...result.raw.slice(0, 4));
        }

        // تأكد من أن masterInputs به 24 عنصراً
        while (masterInputs.length < 24) masterInputs.push(0.5);

        const masterResult = this.masterNet.predict(masterInputs.slice(0, 24));

        const analysis = {
            timestamp: new Date().toISOString(),
            modules:   moduleResults,
            master:    { nameAr: this.masterNet.nameAr, ...masterResult },
            summary: {
                enterpriseHealth:     (masterResult.named.enterpriseHealth      || 0).toFixed(4),
                interventionPriority: (masterResult.named.interventionPriority  || 0).toFixed(4),
                profitabilityIndex:   (masterResult.named.profitabilityIndex    || 0).toFixed(4),
                shariahCompliance:    (masterResult.named.shariahComplianceLevel || 0).toFixed(4)
            }
        };

        this.emit('full_analysis', analysis);
        return analysis;
    }

    /**
     * تدريب الشبكة الجامعة
     */
    trainMaster(masterInputs, masterTargets, epochs = 20) {
        const loss = this.masterNet.train(masterInputs, masterTargets, epochs);
        this.emit('master_trained', { loss, epochs });
        return { loss, epochs };
    }

    getStatus() {
        const moduleStatus = {};
        for (const [key, net] of Object.entries(this.modules)) {
            moduleStatus[key] = net.getStatus();
        }
        return {
            name:      this.nameAr,
            version:   this.version,
            status:    this.status,
            uptime:    Math.floor((Date.now() - this.startTime) / 1000) + 's',
            modules:   moduleStatus,
            master:    this.masterNet.getStatus(),
            totalNets: Object.keys(this.modules).length + 1
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

const erpNeuralNetwork = new SheikhaERPNeuralNetwork();

module.exports = {
    SheikhaERPNeuralNetwork,
    erpNeuralNetwork,
    ERPFinanceNet,
    ERPHRNet,
    ERPInventoryNet,
    ERPProductionNet,
    ERPProcurementNet,
    ERPSalesNet,
    ERPMasterNet,
    ERPModuleNet
};
