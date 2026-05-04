/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA SDC LAYER v1.0.0 — طبقة نواة شيخة الرقمية                         ║
 * ║  💎 9 وحدات رقمية — مُرقَّمة بالكتاب والسنة                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 */
'use strict';

let _sdcEngine = null;
try { _sdcEngine = require('../lib/sheikha-sdc-engine'); } catch (e) { console.warn('[SDC-LAYER] ⚠️ ', e.message); }

let _sidcLayer = null;
try { _sidcLayer = require('./sheikha-sidc-layer'); } catch (_) {}

let _controlPlane = null;
try { _controlPlane = require('./sheikha-control-plane'); } catch (_) {}

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

const LAYER_ID = {
    name:      'Sheikha SDC Layer',
    nameAr:    '💎 نواة شيخة الرقمية',
    version:   VERSION,
    layer:     'sdc',
    cells:     9,
    position:  'RNN → [SDC] → SIDC → سوق شيخة',
    quranRef:  '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
    tawheed:   TAWHEED,
    bismillah: BISMILLAH,
};

let _sdc   = null;
let _ready = false;

function initialize() {
    if (_ready) return;

    console.log(`[SDC-LAYER] 💎 ${BISMILLAH}`);
    console.log(`[SDC-LAYER] 🌟 تهيئة طبقة SDC — v${VERSION}`);

    if (_sdcEngine) {
        _sdc = _sdcEngine.getInstance();
        console.log(`[SDC-LAYER] ✅ SDC Engine نشط — ${Object.keys(_sdcEngine.SDC_UNITS).length} وحدات رقمية`);
    }

    if (_controlPlane) {
        _controlPlane.registerCommand('sdc:execute',  (p) => execute(p.unitId, p.data),  { description: 'تنفيذ وحدة SDC', layer: 'sdc' });
        _controlPlane.registerCommand('sdc:pipeline', (p) => pipeline(p.units, p.data), { description: 'pipeline وحدات SDC', layer: 'sdc' });
        _controlPlane.registerCommand('sdc:status',   () => status(),                   { description: 'حالة SDC', layer: 'sdc' });
        console.log('[SDC-LAYER] 📌 أوامر SDC مسجّلة في Control Plane');
    }

    _ready           = true;
    console.log(`[SDC-LAYER] 📖 ${TAWHEED}`);
}

function execute(unitId, data = {}) {
    if (!_ready) initialize();
    if (!_sdc) return { ok: false, error: 'SDC Engine غير متاح' };
    return _sdc.execute(unitId, data);
}

function pipeline(unitIds = [], data = {}) {
    if (!_ready) initialize();
    if (!_sdc) return [];
    return _sdc.pipeline(unitIds, data);
}

function status() {
    return {
        ...LAYER_ID,
        ready:  _ready,
        engine: _sdc ? _sdc.status() : null,
        sidc:   _sidcLayer ? _sidcLayer.status() : null,
    };
}

initialize();

module.exports = { initialize, execute, pipeline, status, LAYER_ID, TAWHEED, BISMILLAH, VERSION };
