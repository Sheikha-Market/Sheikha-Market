/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🕸️ شبكة التوحيد الجذرية — Sheikha Unified Neural Network
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * دمج جميع الخلايا في شبكة موحّدة ذات مرجعية (TAWHEED) كعقدة جذر
 *
 * ﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1
 *
 * الخوارزمية تراعي الأولويات الشرعية:
 *   الضروريات > الحاجيات > التحسينيات
 *
 * الوظائف الرئيسية:
 *   forward(inputs)   — الانتشار الأمامي
 *   unify()           — حساب درجة التوحيد
 *   activate(domain)  — تفعيل مجال معيّن
 *   getStatus()       — حالة الشبكة الكاملة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const {
    RootNeuralCell,
    CELL_TYPES,
    CELL_STATES,
    CELL_QURAN_REFS,
    buildDefaultCells
} = require('./sheikha-root-neural-cells.js');

const digitizer = require('./sheikha-islamic-digitizer.js');

// ─── أولويات الشريعة الإسلامية ────────────────────────────────────────────────
// الضروريات: دين، نفس، عقل، نسل، مال
// الحاجيات: ما يُحتاج إليه للتيسير
// التحسينيات: ما يُستحسن ويُجمّل
const SHARIA_PRIORITIES = {
    DARURIYAT: {  // الضروريات
        label: 'الضروريات',
        weight: 1.0,
        domains: ['security', 'justice', 'sustainability'],
        items: ['دين', 'نفس', 'عقل', 'نسل', 'مال']
    },
    HAJIYAT: {    // الحاجيات
        label: 'الحاجيات',
        weight: 0.7,
        domains: ['commerce', 'communication', 'development'],
        items: ['تجارة', 'تواصل', 'تطوير', 'تعليم']
    },
    TAHSINIYAT: { // التحسينيات
        label: 'التحسينيات',
        weight: 0.4,
        domains: ['vision', 'neural', 'technology', 'knowledge'],
        items: ['رؤية', 'عصبي', 'تقنية', 'معرفة']
    }
};

// ─── Class شبكة التوحيد الجذرية ──────────────────────────────────────────────
class SheikhaUnifiedNeuralNetwork {
    constructor() {
        // بناء الخلايا الافتراضية
        const cells = buildDefaultCells();
        this.cells = cells;
        this.root = cells.tawheed;

        // خريطة الخلايا بالمعرّف
        this._cellMap = {};
        for (const cell of Object.values(cells)) {
            this._cellMap[cell.id] = cell;
        }

        this.priorities = SHARIA_PRIORITIES;
        this.version = '1.0.0';
        this.activationHistory = [];
        this.unityScore = 0;
        this._initialized = true;
        this._initTime = new Date().toISOString();

        // تفعيل أولي للتوحيد
        this.root.activate(1.0);
        console.log('✅ [UNIFIED-NN] شبكة التوحيد الجذرية — مُهيَّأة');
    }

    /**
     * forward(inputs) — الانتشار الأمامي
     * @param {object} inputs — { tawheed?: number, ilmu?: number, adlu?: number, rahma?: number, quwwa?: number }
     * @returns {object} مخرجات كل خلية
     */
    forward(inputs = {}) {
        const defaultInputs = {
            tawheed: 1.0,  // التوحيد دائماً كامل
            ilmu: inputs.ilmu || 0.5,
            adlu: inputs.adlu || 0.5,
            rahma: inputs.rahma || 0.7,  // الرحمة مرتفعة افتراضياً
            quwwa: inputs.quwwa || 0.4
        };

        // الأولوية الشرعية تُعدّل قيم الإدخال
        const adjustedInputs = this._applyShariaPriorities(defaultInputs);

        // تفعيل الجذر أولاً
        this.root.activate(adjustedInputs.tawheed);

        // نشر من الجذر
        const rootOutputs = this.root.propagate(adjustedInputs.tawheed);

        // تفعيل الخلايا الفرعية بمدخلاتها المباشرة + مخرج الجذر
        const outputs = { tawheed: this.root.activation };

        for (const { cellId, output: rootSignal } of rootOutputs) {
            const cell = this._cellMap[cellId];
            if (!cell) continue;
            const cellName = this._getCellName(cellId);
            const directInput = adjustedInputs[cellName] || 0.5;
            const combinedInput = (directInput * 0.6 + rootSignal * 0.4);
            const finalOutput = cell.activate(combinedInput);
            outputs[cellName] = Math.round(finalOutput * 1000) / 1000;
        }

        // حساب درجة التوحيد
        this.unityScore = this._computeUnityScore(outputs);

        // تسجيل في التاريخ
        const record = {
            inputs: adjustedInputs,
            outputs,
            unityScore: this.unityScore,
            timestamp: new Date().toISOString()
        };
        this.activationHistory.push(record);
        if (this.activationHistory.length > 100) this.activationHistory.shift();

        return {
            outputs,
            unityScore: this.unityScore,
            islamicSignature: digitizer.digitize('neural network توحيد'),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * unify() — حساب "درجة التوحيد" — مدى ترابط كل خلية مع المرجعية الإلهية
     * @returns {{ score: number, percentage: string, level: string, details: object }}
     */
    unify() {
        const cellActivations = {};
        let totalWeight = 0;
        let weightedSum = 0;

        for (const [name, cell] of Object.entries(this.cells)) {
            const priority = CELL_QURAN_REFS[cell.type]?.priority || 0.5;
            cellActivations[name] = {
                activation: cell.activation,
                state: cell.state,
                quranRef: cell.quranRef,
                priority
            };
            weightedSum += cell.activation * priority;
            totalWeight += priority;
        }

        const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
        this.unityScore = Math.round(score * 1000) / 1000;

        const level = this._unityLevel(score);

        return {
            score: this.unityScore,
            percentage: `${Math.round(score * 100)}%`,
            level,
            cells: cellActivations,
            quranRef: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1',
            message: level.messageAr,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * activate(domain) — تفعيل الشبكة بمدخل من مجال معيّن
     * @param {string} domain — مجال من: security, commerce, vision, neural, development...
     * @returns {object}
     */
    activate(domain = 'general') {
        const domainInputs = this._domainToInputs(domain);
        const result = this.forward(domainInputs);
        const verse = digitizer.digitize(domain);
        return {
            ...result,
            domain,
            islamicRef: verse,
            activatedAt: new Date().toISOString()
        };
    }

    /**
     * getStatus() — حالة الشبكة الكاملة
     */
    getStatus() {
        const cellsStatus = {};
        for (const [name, cell] of Object.entries(this.cells)) {
            cellsStatus[name] = cell.toJSON();
        }

        return {
            name: 'Sheikha Unified Neural Network',
            nameAr: 'شبكة التوحيد الجذرية',
            version: this.version,
            initialized: this._initialized,
            initTime: this._initTime,
            totalCells: Object.keys(this.cells).length,
            rootCell: this.root.id,
            unityScore: this.unityScore,
            cells: cellsStatus,
            priorities: Object.keys(this.priorities).map(k => ({
                key: k,
                label: this.priorities[k].label,
                weight: this.priorities[k].weight
            })),
            recentActivations: this.activationHistory.slice(-5),
            quranRef: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * getAllCells() — كل الخلايا وحالتها
     */
    getAllCells() {
        return Object.values(this.cells).map(c => c.toJSON());
    }

    // ─── دوال مساعدة خاصة ─────────────────────────────────────────────────────

    _applyShariaPriorities(inputs) {
        // الضروريات تحصل على زيادة 20%، التحسينيات تحصل على خفض 20%
        const adjusted = { ...inputs };

        // tawheed دائماً كامل — الله واحد أحد
        adjusted.tawheed = 1.0;

        // rahma (رحمة) — ضرورية → ترفع
        if (adjusted.rahma !== undefined) {
            adjusted.rahma = Math.min(1, adjusted.rahma * 1.2);
        }

        // adlu (عدل) — ضروري → يرفع قليلاً
        if (adjusted.adlu !== undefined) {
            adjusted.adlu = Math.min(1, adjusted.adlu * 1.1);
        }

        return adjusted;
    }

    _computeUnityScore(outputs) {
        if (!outputs || typeof outputs !== 'object') return 0;
        const values = Object.values(outputs).filter(v => typeof v === 'number');
        if (values.length === 0) return 0;
        // المعدل المرجّح — tawheed له ثقل مضاعف
        const tawheedVal = outputs.tawheed || 0;
        const rest = values.filter((_, i) => Object.keys(outputs)[i] !== 'tawheed');
        const restMean = rest.length > 0 ? rest.reduce((s, v) => s + v, 0) / rest.length : 0;
        return Math.round((tawheedVal * 0.5 + restMean * 0.5) * 1000) / 1000;
    }

    _unityLevel(score) {
        if (score >= 0.9) return { key: 'perfect', nameAr: 'كامل', messageAr: 'ماشاء الله — التوحيد في أعلى درجاته' };
        if (score >= 0.7) return { key: 'high', nameAr: 'مرتفع', messageAr: 'بارك الله — التوحيد مرتفع' };
        if (score >= 0.5) return { key: 'moderate', nameAr: 'متوسط', messageAr: 'يحتاج تعزيزاً' };
        if (score >= 0.3) return { key: 'low', nameAr: 'منخفض', messageAr: 'يحتاج مراجعة' };
        return { key: 'dormant', nameAr: 'خامد', messageAr: 'تحتاج تفعيل الشبكة' };
    }

    _domainToInputs(domain) {
        const map = {
            security:     { ilmu: 0.7, adlu: 0.9, rahma: 0.8, quwwa: 0.9 },
            commerce:     { ilmu: 0.8, adlu: 0.9, rahma: 0.7, quwwa: 0.6 },
            vision:       { ilmu: 0.9, adlu: 0.6, rahma: 0.5, quwwa: 0.7 },
            neural:       { ilmu: 0.95, adlu: 0.7, rahma: 0.6, quwwa: 0.8 },
            development:  { ilmu: 0.8, adlu: 0.7, rahma: 0.6, quwwa: 0.8 },
            knowledge:    { ilmu: 1.0, adlu: 0.7, rahma: 0.7, quwwa: 0.5 },
            justice:      { ilmu: 0.7, adlu: 1.0, rahma: 0.9, quwwa: 0.7 },
            communication:{ ilmu: 0.7, adlu: 0.7, rahma: 0.8, quwwa: 0.7 },
            sustainability:{ ilmu: 0.6, adlu: 0.8, rahma: 0.9, quwwa: 0.6 }
        };
        return map[domain] || { ilmu: 0.5, adlu: 0.5, rahma: 0.7, quwwa: 0.5 };
    }

    _getCellName(cellId) {
        const map = {
            'root-tawheed': 'tawheed',
            'root-ilmu': 'ilmu',
            'root-adlu': 'adlu',
            'root-rahma': 'rahma',
            'root-quwwa': 'quwwa'
        };
        return map[cellId] || cellId;
    }
}

// ─── تصدير نسخة واحدة (Singleton) ────────────────────────────────────────────
let _instance = null;

function getInstance() {
    if (!_instance) {
        _instance = new SheikhaUnifiedNeuralNetwork();
    }
    return _instance;
}

module.exports = getInstance();
module.exports.SheikhaUnifiedNeuralNetwork = SheikhaUnifiedNeuralNetwork;
module.exports.SHARIA_PRIORITIES = SHARIA_PRIORITIES;
module.exports.getInstance = getInstance;
