/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           SHEIKHA NEURAL CELLS — خلايا الشبكة العصبية لجذر شيخة            ║
 * ║      طبقة الذكاء العصبي المدمجة في جذر المنظومة — شيخة                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: ٣١
 *
 * هذه الطبقة تُنشئ وتُدير خلايا الشبكة العصبية لجذر شيخة:
 *   • خلايا المنطق السباعي    (7  خلايا أصلية)
 *   • خلايا المنطق الموسّع   (13 خلية موسّعة)
 *   • الخلية العليا           (1  خلية سيادية — التوحيد)
 *
 * واجهة الطبقة:
 *   init()         — تهيئة الخلايا وتحميل الأوزان المحفوظة
 *   infer(context) — تشغيل الاستدلال العصبي
 *   train(in, tgt) — تدريب الشبكة
 *   status()       — حالة الطبقة الكاملة
 *   handle(req)    — معالجة الطلبات من الموجّه العصبي
 */

'use strict';

const path = require('path');

// ─── استيراد نواة الشبكة العصبية ─────────────────────────────────────────────

let _getNetwork, _encodeContext, _LogicNeuron, _LogicNeuralNetwork;

try {
    const nnMod = require(path.join(__dirname, '../models/LogicNeuralNetwork'));
    _getNetwork    = nnMod.getNetwork;
    _encodeContext = nnMod.encodeContext;
    _LogicNeuron   = nnMod.LogicNeuron;
    _LogicNeuralNetwork = nnMod.LogicNeuralNetwork;
} catch (err) {
    console.error('[NEURAL-CELLS] ❌ تعذّر تحميل LogicNeuralNetwork:', err.message);
}

// ─── حالة الطبقة ─────────────────────────────────────────────────────────────

let _network   = null;
let _ready     = false;
let _initAt    = null;
let _callCount = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// ① INIT — تهيئة خلايا الشبكة العصبية
// ═══════════════════════════════════════════════════════════════════════════════

async function init() {
    if (_ready) return;

    if (!_getNetwork) {
        console.warn('[NEURAL-CELLS] ⚠️  نواة الشبكة العصبية غير متوفرة — تشغيل بوضع المحاكاة');
        _ready  = true;
        _initAt = new Date().toISOString();
        return;
    }

    try {
        _network = _getNetwork();
        _ready   = true;
        _initAt  = new Date().toISOString();

        const st = _network.getState();
        console.log(`[NEURAL-CELLS] 🧠 الخلايا العصبية جاهزة:`);
        console.log(`[NEURAL-CELLS]    • عدد الخلايا  : ${st.neurons.length + 1} (${st.neurons.length} منطق + 1 سيادية)`);
        console.log(`[NEURAL-CELLS]    • خطوات التدريب: ${st.trainedSteps}`);
        console.log(`[NEURAL-CELLS]    • إجمالي الاستدلالات: ${st.totalInferences}`);
    } catch (err) {
        console.error('[NEURAL-CELLS] ❌ خطأ في تهيئة الخلايا:', err.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② INFER — تشغيل الاستدلال العصبي
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * استدلال أي الخلايا العصبية يجب تفعيلها بناءً على السياق
 * @param {string|number[]} context — نص السياق أو متجه الإدخال
 * @returns {object} نتيجة الاستدلال
 */
function infer(context = '') {
    _callCount++;

    if (!_network) {
        return _mockInfer(context);
    }

    let inputVec;
    if (typeof context === 'string') {
        inputVec = _encodeContext(context);
    } else if (Array.isArray(context)) {
        inputVec = context;
    } else {
        inputVec = [];
    }

    return _network.infer(inputVec, typeof context === 'string' ? context : '');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ TRAIN — تدريب الشبكة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تدريب الشبكة العصبية على زوج (إدخال، هدف)
 * @param {number[]} inputVec  — متجه الإدخال
 * @param {number[]} targetVec — المتجه المستهدف
 * @param {number}   lr        — معدل التعلم
 * @returns {number|null} قيمة الخسارة
 */
function train(inputVec, targetVec, lr = 0.001) {
    if (!_network) return null;
    return _network.train(inputVec, targetVec, lr);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ CELLS — الوصول المباشر لبيانات الخلايا
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * قائمة كل الخلايا العصبية مع حالتها الحالية
 * @returns {object[]}
 */
function getCells() {
    if (!_network) return [];
    const st = _network.getState();
    return [
        ...st.neurons,
        { ...st.masterNeuron, category: 'master' }
    ];
}

/**
 * خريطة الاتصالات السينابتية بين الخلايا
 * @returns {object}
 */
function getSynapticMap() {
    if (!_network) return { nodes: [], edges: [], totalNodes: 0, totalEdges: 0 };
    return _network.getSynapticMap();
}

/**
 * الخلية بالمعرّف
 * @param {string} id
 * @returns {object|null}
 */
function getCell(id) {
    if (!_network) return null;
    const cells = getCells();
    return cells.find(c => c.id === id) || null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ HANDLE — معالج طلبات الموجّه العصبي
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * معالج الطلبات القادمة من الموجّه
 * @param {object} req — { intent, entity, data, traceId }
 * @returns {Promise<object>}
 */
function handle(req) {
    const { data = {} } = req;
    const action = data.action || 'infer';

    switch (action) {
        case 'infer':
            return {
                action: 'infer',
                result: infer(data.context || data.text || ''),
            };

        case 'train':
            return {
                action: 'train',
                loss:   train(data.inputVec, data.targetVec, data.lr),
            };

        case 'cells':
            return {
                action: 'cells',
                cells:  getCells(),
            };

        case 'synaptic_map':
            return {
                action: 'synaptic_map',
                map:    getSynapticMap(),
            };

        case 'cell':
            return {
                action: 'cell',
                cell:   getCell(data.id),
            };

        case 'save':
            if (_network) _network.save();
            return { action: 'save', saved: true };

        case 'reset':
            if (_network) _network.reset();
            return { action: 'reset', reset: true };

        case 'status':
        default:
            return { action: 'status', status: status() };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑥ STATUS — حالة الطبقة الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

function status() {
    const base = {
        layer:      'neural-cells',
        nameAr:     'خلايا الشبكة العصبية',
        ready:      _ready,
        initAt:     _initAt,
        callCount:  _callCount,
        mode:       _network ? 'live' : 'mock',
    };

    if (!_network) return base;

    const st = _network.getState();
    return {
        ...base,
        architecture:    st.architecture,
        totalNeurons:    st.neurons.length + 1,
        trainedSteps:    st.trainedSteps,
        totalInferences: st.totalInferences,
        masterShield:    st.masterShield,
        topActivated:    st.neurons
            .sort((a, b) => b.activation - a.activation)
            .slice(0, 5)
            .map(n => ({ id: n.id, nameAr: n.nameAr, activation: n.activation })),
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// وضع المحاكاة — عند غياب نواة الشبكة
// ═══════════════════════════════════════════════════════════════════════════════

function _mockInfer(context) {
    return {
        id:              `mock_${Date.now()}`,
        context:         typeof context === 'string' ? context : '',
        timestamp:       new Date().toISOString(),
        masterActivation: 0.5,
        masterFiring:    false,
        topLogics:       ['organizational', 'commercial', 'technological'],
        allResults:      [],
        mode:            'mock',
    };
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    init,
    infer,
    train,
    getCells,
    getSynapticMap,
    getCell,
    handle,
    status,
};
