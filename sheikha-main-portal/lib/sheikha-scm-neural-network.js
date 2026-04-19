// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 SHEIKHA SCM NEURAL NETWORK — الشبكة العصبية لسلاسل الإمداد
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ" — الأنعام: 152
 * "وَشَاوِرْهُمْ فِي الْأَمْرِ" — آل عمران: 159
 *
 * شبكة عصبية حقيقية لكل وظيفة من وظائف SCM:
 *
 * ✅ توقع الطلب               → SCMDemandNet
 * ✅ ذكاء الموردين            → SCMSupplierNet
 * ✅ تحسين اللوجستيات         → SCMLogisticsNet
 * ✅ كشف المخاطر              → SCMRiskNet
 * ✅ تحسين المخزون (SCM)      → SCMInventoryOptNet
 * ✅ التخليص الجمركي والامتثال → SCMComplianceNet
 * ✅ الشبكة العصبية الجامعة   → SCMMasterNet
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SHARED NEURAL PRIMITIVES — مشترك مع محرك ERP العصبي
// ═══════════════════════════════════════════════════════════════════════════════

const Activation = {
    relu:        (x) => Math.max(0, x),
    reluGrad:    (x) => (x > 0 ? 1 : 0),
    sigmoid:     (x) => 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500))),
    sigmoidGrad: (s) => s * (1 - s),
    tanh:        (x) => Math.tanh(x),
    tanhGrad:    (t) => 1 - t * t,
    softmax: (arr) => {
        const mx = Math.max(...arr);
        const exps = arr.map(v => Math.exp(v - mx));
        const sum  = exps.reduce((a, b) => a + b, 0);
        return exps.map(v => v / sum);
    }
};

class DenseLayer {
    constructor(inputSize, outputSize, activation = 'relu') {
        this.inputSize  = inputSize;
        this.outputSize = outputSize;
        this.activation = activation;

        // Xavier initialization
        const scale = Math.sqrt(2.0 / (inputSize + outputSize));
        this.W = new Float64Array(inputSize * outputSize);
        for (let i = 0; i < this.W.length; i++) {
            this.W[i] = (Math.random() * 2 - 1) * scale;
        }
        this.b = new Float64Array(outputSize);

        // Adam state
        this.lr    = 0.001;
        this.beta1 = 0.9;
        this.beta2 = 0.999;
        this.eps   = 1e-8;
        this.t     = 0;
        this.mW = new Float64Array(this.W.length);
        this.vW = new Float64Array(this.W.length);
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
                s += input[i] * this.W[i * this.outputSize + j];
            }
            pre[j] = s;
        }
        this._preact = pre;
        const act = Activation[this.activation] || Activation.relu;
        if (this.activation === 'softmax') {
            this._output = Activation.softmax(Array.from(pre));
        } else {
            this._output = Array.from(pre).map(v => act(v));
        }
        return this._output;
    }

    backward(dOut) {
        let dPre;
        if (this.activation === 'sigmoid') {
            dPre = dOut.map((d, i) => d * Activation.sigmoidGrad(this._output[i]));
        } else if (this.activation === 'tanh') {
            dPre = dOut.map((d, i) => d * Activation.tanhGrad(this._output[i]));
        } else {
            dPre = dOut.map((d, i) => d * Activation.reluGrad(this._preact[i]));
        }

        const dInput = new Float64Array(this.inputSize);
        const dW     = new Float64Array(this.W.length);
        const db     = new Float64Array(this.outputSize);

        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                dW[i * this.outputSize + j] = this._input[i] * dPre[j];
                dInput[i] += this.W[i * this.outputSize + j] * dPre[j];
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
            this.W[i] -= this.lr * (this.mW[i] / bc1) / (Math.sqrt(this.vW[i] / bc2) + this.eps);
        }
        for (let i = 0; i < db.length; i++) {
            this.mb[i] = this.beta1 * this.mb[i] + (1 - this.beta1) * db[i];
            this.vb[i] = this.beta2 * this.vb[i] + (1 - this.beta2) * db[i] * db[i];
            this.b[i] -= this.lr * (this.mb[i] / bc1) / (Math.sqrt(this.vb[i] / bc2) + this.eps);
        }
    }
}

class SCMModuleNet {
    constructor(config) {
        this.id          = config.id;
        this.nameAr      = config.nameAr;
        this.nameEn      = config.nameEn;
        this.inputNames  = config.inputNames;
        this.outputNames = config.outputNames;
        this.layers      = [];
        this.trainCount  = 0;
        this.totalLoss   = 0;

        const sizes = config.layerSizes;
        for (let i = 0; i < sizes.length - 1; i++) {
            const act = (i === sizes.length - 2) ? (config.outputActivation || 'sigmoid') : 'relu';
            this.layers.push(new DenseLayer(sizes[i], sizes[i + 1], act));
        }
    }

    forward(inputs) {
        let out = Array.isArray(inputs) ? inputs.map(v => isFinite(v) ? v : 0) : Array.from(inputs);
        for (const layer of this.layers) out = layer.forward(out);
        return out;
    }

    train(inputs, targets, epochs = 10) {
        let lastLoss = 0;
        for (let e = 0; e < epochs; e++) {
            const pred = this.forward(inputs);
            const dOut = pred.map((p, i) => p - (targets[i] || 0));
            lastLoss   = dOut.reduce((s, d) => s + d * d, 0) / dOut.length;
            let grad   = dOut;
            for (let l = this.layers.length - 1; l >= 0; l--) {
                grad = this.layers[l].backward(grad);
            }
            this.trainCount++;
            this.totalLoss += lastLoss;
        }
        return lastLoss;
    }

    predict(inputs) {
        const raw   = this.forward(inputs);
        const named = {};
        this.outputNames.forEach((n, i) => { named[n] = raw[i] !== undefined ? raw[i] : 0; });
        return { raw, named, confidence: Math.max(...raw) };
    }

    getStatus() {
        return {
            id:         this.id,
            nameAr:     this.nameAr,
            nameEn:     this.nameEn,
            layers:     this.layers.map(l => `${l.inputSize}→${l.outputSize}(${l.activation})`),
            trainCount: this.trainCount,
            avgLoss:    this.trainCount > 0 ? (this.totalLoss / this.trainCount).toFixed(6) : 'غير مدرّبة'
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. SCM MODULE NEURAL NETWORKS — شبكة عصبية لكل وظيفة SCM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 2.1 توقع الطلب — Demand Forecasting
 * المدخلات: المبيعات التاريخية (6 أشهر مضغوطة)، الموسمية، السعر، الحملات التسويقية، النمو الاقتصادي، المخزون الحالي
 * المخرجات: توقع_30يوم، توقع_90يوم، مؤشر_الموسمية، دقة_التنبؤ
 */
const SCMDemandNet = new SCMModuleNet({
    id:         'scm_demand',
    nameAr:     'الشبكة العصبية — توقع الطلب',
    nameEn:     'SCM Demand Forecasting Neural Net',
    inputNames: ['avgMonthlySales', 'salesTrend', 'seasonalityFactor', 'priceLevel', 'marketingSpend', 'economicIndex', 'currentInventory', 'competitorActivity'],
    outputNames:['forecast30d', 'forecast90d', 'seasonalityIndex', 'forecastAccuracy'],
    layerSizes: [8, 20, 16, 8, 4],
    outputActivation: 'sigmoid'
});

/**
 * 2.2 ذكاء الموردين — Supplier Intelligence
 * المدخلات: جودة_التسليم، الالتزام_بالمواعيد، السعر_التنافسي، الامتثال_الشرعي، قدرة_التوسع، الاستدامة، تاريخ_العلاقة، حوادث_الجودة
 * المخرجات: تقييم_المورد، توصية_التعاقد، مؤشر_الخطر، نقاط_الامتثال_الشرعي
 */
const SCMSupplierNet = new SCMModuleNet({
    id:         'scm_supplier',
    nameAr:     'الشبكة العصبية — ذكاء الموردين',
    nameEn:     'SCM Supplier Intelligence Neural Net',
    inputNames: ['deliveryQuality', 'onTimeRate', 'competitivePrice', 'shariahCompliance', 'scalingCapacity', 'sustainabilityScore', 'relationshipYears', 'qualityIncidents'],
    outputNames:['supplierScore', 'contractRecommendation', 'riskIndex', 'shariahPoints'],
    layerSizes: [8, 24, 16, 4],
    outputActivation: 'sigmoid'
});

/**
 * 2.3 تحسين اللوجستيات — Logistics Optimization
 * المدخلات: المسافة_كم، وزن_الشحنة، نوع_النقل، عدد_النقاط_الوسيطة، التكلفة_الحالية، وقت_التسليم_الحالي، مؤشر_الجمارك، درجة_الحرارة_المطلوبة
 * المخرجات: المسار_الأمثل، تكلفة_متوقعة، وقت_تسليم_محسّن، مؤشر_الاستدامة
 */
const SCMLogisticsNet = new SCMModuleNet({
    id:         'scm_logistics',
    nameAr:     'الشبكة العصبية — تحسين اللوجستيات',
    nameEn:     'SCM Logistics Optimization Neural Net',
    inputNames: ['distanceKm', 'weightTons', 'transportMode', 'waypointCount', 'currentCost', 'currentLeadTime', 'customsComplexity', 'temperatureReq'],
    outputNames:['optimalRouteScore', 'expectedCost', 'optimizedLeadTime', 'sustainabilityIndex'],
    layerSizes: [8, 24, 16, 4],
    outputActivation: 'sigmoid'
});

/**
 * 2.4 كشف المخاطر — Risk Detection
 * المدخلات: تركيز_الموردين، التقلب_الجغرافي، مخاطر_العملة، اضطراب_التوريد_التاريخي، تقلب_الأسعار، حوادث_الامتثال، مؤشر_الاستقرار_السياسي، درجة_الاعتماد_المتبادل
 * المخرجات: مؤشر_المخاطرة_الكلي، خطر_الانقطاع، خطر_السعر، توصية_التحوط
 */
const SCMRiskNet = new SCMModuleNet({
    id:         'scm_risk',
    nameAr:     'الشبكة العصبية — كشف مخاطر سلسلة الإمداد',
    nameEn:     'SCM Risk Detection Neural Net',
    inputNames: ['supplierConcentration', 'geoVolatility', 'currencyRisk', 'historicalDisruption', 'priceVolatility', 'complianceIncidents', 'politicalStability', 'interdependence'],
    outputNames:['overallRiskIndex', 'disruptionRisk', 'priceRisk', 'hedgingRecommendation'],
    layerSizes: [8, 24, 16, 4],
    outputActivation: 'sigmoid'
});

/**
 * 2.5 تحسين المخزون عبر سلسلة الإمداد — SCM Inventory Optimization
 * المدخلات: مستوى_خدمة_مطلوب، تباين_الطلب، فترة_التوريد، تكلفة_الاحتجاز، تكلفة_النقص، قاعدة_الموردين، معدل_التلف، دقة_التنبؤ
 * المخرجات: مستوى_المخزون_الأمثل، نقطة_إعادة_الطلب، مخزون_الأمان، معدل_الدوران_المستهدف
 */
const SCMInventoryOptNet = new SCMModuleNet({
    id:         'scm_inventory_opt',
    nameAr:     'الشبكة العصبية — تحسين المخزون عبر SCM',
    nameEn:     'SCM Inventory Optimization Neural Net',
    inputNames: ['serviceLevel', 'demandVariance', 'leadTimeDays', 'holdingCostPct', 'stockoutCost', 'supplierBase', 'spoilageRate', 'forecastAccuracy'],
    outputNames:['optimalStockLevel', 'reorderPoint', 'safetyStock', 'targetTurnover'],
    layerSizes: [8, 24, 16, 4],
    outputActivation: 'sigmoid'
});

/**
 * 2.6 الامتثال الجمركي والتجاري — Compliance & Customs
 * المدخلات: كود_HS، بلد_المنشأ، القيمة_الجمركية، نوع_الوثائق، امتثال_الشريعة، شهادات_الجودة، حوادث_الجمارك_التاريخية، مؤشر_التعقيد
 * المخرجات: درجة_الامتثال، خطر_التأخير_الجمركي، متطلبات_مفقودة، نقاط_الشريعة
 */
const SCMComplianceNet = new SCMModuleNet({
    id:         'scm_compliance',
    nameAr:     'الشبكة العصبية — الامتثال الجمركي والتجاري',
    nameEn:     'SCM Compliance & Customs Neural Net',
    inputNames: ['hsCodeComplexity', 'originCountryRisk', 'customsValue', 'documentCompleteness', 'shariahCompliance', 'qualityCertScore', 'historicalDelays', 'complexityIndex'],
    outputNames:['complianceScore', 'customsDelayRisk', 'missingRequirements', 'shariahPoints'],
    layerSizes: [8, 24, 16, 4],
    outputActivation: 'sigmoid'
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SCM MASTER NETWORK — الشبكة العصبية الجامعة لكل وظائف SCM
// ═══════════════════════════════════════════════════════════════════════════════

// 6 وحدات × 4 مخرجات = 24 مدخلاً للشبكة الجامعة
const SCMMasterNet = new SCMModuleNet({
    id:         'scm_master',
    nameAr:     'الشبكة العصبية الجامعة — SCM الكامل',
    nameEn:     'SCM Master Neural Network (All Functions Integrated)',
    inputNames: [
        'dem_30d', 'dem_90d', 'dem_seasonal', 'dem_accuracy',
        'sup_score', 'sup_contract', 'sup_risk', 'sup_shariah',
        'log_route', 'log_cost', 'log_lead', 'log_sustainability',
        'risk_overall', 'risk_disruption', 'risk_price', 'risk_hedge',
        'inv_optimal', 'inv_reorder', 'inv_safety', 'inv_turnover',
        'comp_score', 'comp_customs', 'comp_missing', 'comp_shariah'
    ],
    outputNames:['scmChainHealth', 'supplyResilience', 'costEfficiency', 'complianceLevel'],
    layerSizes: [24, 48, 32, 16, 4],
    outputActivation: 'sigmoid'
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SCM NEURAL ENGINE — المحرك الموحد للشبكة العصبية SCM
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaScmNeuralNetwork extends EventEmitter {
    constructor() {
        super();
        this.version   = '1.0.0';
        this.nameAr    = 'الشبكة العصبية لسلاسل الإمداد — منظومة شيخة';
        this.nameEn    = 'Sheikha SCM Neural Network';
        this.startTime = new Date();
        this.status    = 'operational';

        this.modules = {
            demand:       SCMDemandNet,
            supplier:     SCMSupplierNet,
            logistics:    SCMLogisticsNet,
            risk:         SCMRiskNet,
            inventoryOpt: SCMInventoryOptNet,
            compliance:   SCMComplianceNet
        };

        this.masterNet = SCMMasterNet;

        console.log(`✅ [SCM-NEURAL] ${this.nameAr} — مُفعَّل`);
        console.log(`   ├─ توقع الطلب:         ${SCMDemandNet.layers.length} طبقات`);
        console.log(`   ├─ ذكاء الموردين:      ${SCMSupplierNet.layers.length} طبقات`);
        console.log(`   ├─ اللوجستيات:         ${SCMLogisticsNet.layers.length} طبقات`);
        console.log(`   ├─ كشف المخاطر:        ${SCMRiskNet.layers.length} طبقات`);
        console.log(`   ├─ تحسين المخزون:      ${SCMInventoryOptNet.layers.length} طبقات`);
        console.log(`   ├─ الامتثال الجمركي:   ${SCMComplianceNet.layers.length} طبقات`);
        console.log(`   └─ الشبكة الجامعة:     ${SCMMasterNet.layers.length} طبقات (24 مدخل → 4 مخرجات)`);
    }

    analyzeModule(moduleId, inputs) {
        const net = this.modules[moduleId];
        if (!net) throw new Error(`وحدة SCM غير معروفة: ${moduleId}`);
        const result = net.predict(inputs);
        this.emit('module_analyzed', { moduleId, result });
        return { moduleId, nameAr: net.nameAr, ...result };
    }

    trainModule(moduleId, inputs, targets, epochs = 20) {
        const net = this.modules[moduleId];
        if (!net) throw new Error(`وحدة SCM غير معروفة: ${moduleId}`);
        const loss = net.train(inputs, targets, epochs);
        this.emit('module_trained', { moduleId, loss, epochs });
        return { moduleId, loss, epochs };
    }

    analyzeAll(allInputs) {
        const moduleResults = {};
        const masterInputs  = [];

        for (const [key, net] of Object.entries(this.modules)) {
            const inputs = allInputs[key] || new Array(net.layers[0].inputSize).fill(0.5);
            const result = net.predict(inputs);
            moduleResults[key] = { nameAr: net.nameAr, ...result };
            masterInputs.push(...result.raw.slice(0, 4));
        }

        while (masterInputs.length < 24) masterInputs.push(0.5);

        const masterResult = this.masterNet.predict(masterInputs.slice(0, 24));

        const analysis = {
            timestamp: new Date().toISOString(),
            modules:   moduleResults,
            master:    { nameAr: this.masterNet.nameAr, ...masterResult },
            summary: {
                chainHealth:     (masterResult.named.scmChainHealth   || 0).toFixed(4),
                supplyResilience:(masterResult.named.supplyResilience  || 0).toFixed(4),
                costEfficiency:  (masterResult.named.costEfficiency    || 0).toFixed(4),
                complianceLevel: (masterResult.named.complianceLevel   || 0).toFixed(4)
            }
        };

        this.emit('full_analysis', analysis);
        return analysis;
    }

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
// 5. EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

const scmNeuralNetwork = new SheikhaScmNeuralNetwork();

module.exports = {
    SheikhaScmNeuralNetwork,
    scmNeuralNetwork,
    SCMDemandNet,
    SCMSupplierNet,
    SCMLogisticsNet,
    SCMRiskNet,
    SCMInventoryOptNet,
    SCMComplianceNet,
    SCMMasterNet,
    SCMModuleNet
};
