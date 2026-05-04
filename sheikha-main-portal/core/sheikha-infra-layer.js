/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA INFRA LAYER v1.0.0 — طبقة البنية التحتية الذكية                   ║
 * ║  💡 CV + Quantum + 6 أنواع حوسبة + RNN الجذرية                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 */
'use strict';

let _infraEngine = null;
try { _infraEngine = require('../lib/sheikha-infra-intelligence-engine'); } catch (e) {
    console.warn('[INFRA-LAYER] ⚠️ ', e.message);
}

let _controlPlane = null;
try { _controlPlane = require('./sheikha-control-plane'); } catch (_) {}

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

const LAYER_ID = {
    name:      'Sheikha Infra Layer',
    nameAr:    '💡 طبقة البنية التحتية الذكية',
    version:   VERSION,
    layer:     'infra',
    position:  'SIDC → [INFRA] → سوق شيخة',
    quranRef:  '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
    tawheed:   TAWHEED,
    bismillah: BISMILLAH,
};

let _infra = null;
let _ready = false;

function initialize() {
    if (_ready) return;

    console.log(`[INFRA-LAYER] 💡 ${BISMILLAH}`);
    console.log(`[INFRA-LAYER] 🌟 تهيئة طبقة البنية التحتية الذكية — v${VERSION}`);

    if (_infraEngine) {
        _infra = _infraEngine.getInstance();
        console.log('[INFRA-LAYER] ✅ Infra Intelligence Engine نشط');
    }

    if (_controlPlane) {
        _controlPlane.registerCommand('infra:process',  (p) => process(p),        { description: 'معالجة البنية التحتية', layer: 'infra' });
        _controlPlane.registerCommand('infra:status',   () => status(),            { description: 'حالة البنية التحتية', layer: 'infra' });
        _controlPlane.registerCommand('infra:compute',  (p) => compute(p),         { description: 'توجيه طلب حوسبة', layer: 'infra' });
        _controlPlane.registerCommand('infra:quantum',  (p) => quantum(p),         { description: 'معالجة كمية', layer: 'infra' });
        console.log('[INFRA-LAYER] 📌 أوامر INFRA مسجّلة في Control Plane');
    }

    _ready = true;
    console.log(`[INFRA-LAYER] 📖 ${TAWHEED}`);
}

function process(request = {}) {
    if (!_ready) initialize();
    if (!_infra) return { ok: false, error: 'Infra Engine غير متاح' };
    return _infra.process(request);
}

function compute(task = {}) {
    if (!_ready) initialize();
    return process({ type: 'compute', input: task });
}

function quantum(task = {}) {
    if (!_ready) initialize();
    return process({ type: 'quantum', input: task, options: task.options || {} });
}

function vision(input = {}) {
    if (!_ready) initialize();
    return process({ type: 'vision', input });
}

function neural(text = '') {
    if (!_ready) initialize();
    return process({ type: 'neural', input: text });
}

function status() {
    return {
        ...LAYER_ID,
        ready: _ready,
        engine: _infra ? _infra.status() : null,
    };
}

initialize();

module.exports = { initialize, process, compute, quantum, vision, neural, status, LAYER_ID, TAWHEED, BISMILLAH, VERSION };
