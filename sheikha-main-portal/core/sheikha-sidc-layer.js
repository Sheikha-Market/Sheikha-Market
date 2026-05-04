/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA SIDC LAYER v1.0.0 — طبقة العملة الرقمية الإسلامية                 ║
 * ║  🪙 1 SIDC = 12.65 USD — مشروعة | شفافة | مزكّاة | بلا ربا                ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥
 */
'use strict';

let _sidcEngine = null;
try { _sidcEngine = require('../lib/sheikha-sidc-engine'); } catch (e) { console.warn('[SIDC-LAYER] ⚠️ ', e.message); }

let _controlPlane = null;
try { _controlPlane = require('./sheikha-control-plane'); } catch (_) {}

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

const LAYER_ID = {
    name:      'Sheikha SIDC Layer',
    nameAr:    '🪙 العملة الرقمية الإسلامية',
    version:   VERSION,
    layer:     'sidc',
    rateUSD:   12.65,
    position:  'SDC → [SIDC] → سوق شيخة',
    quranRef:  '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
    tawheed:   TAWHEED,
    bismillah: BISMILLAH,
};

let _sidc  = null;
let _ready = false;

function initialize() {
    if (_ready) return;

    console.log(`[SIDC-LAYER] 🪙 ${BISMILLAH}`);
    console.log(`[SIDC-LAYER] 🌟 تهيئة طبقة SIDC — 1 SIDC = ${LAYER_ID.rateUSD} USD`);

    if (_sidcEngine) {
        _sidc = _sidcEngine.getInstance();
        console.log(`[SIDC-LAYER] ✅ SIDC Engine نشط — ${LAYER_ID.rateUSD} USD/SIDC`);
    }

    if (_controlPlane) {
        _controlPlane.registerCommand('sidc:transfer',    (p) => transfer(p.from, p.to, p.amount, p.meta),   { description: 'تحويل SIDC', layer: 'sidc' });
        _controlPlane.registerCommand('sidc:issue',       (p) => issue(p.address, p.amount, p.reason),        { description: 'إصدار SIDC', layer: 'sidc' });
        _controlPlane.registerCommand('sidc:balance',     (p) => balance(p.address),                          { description: 'رصيد SIDC', layer: 'sidc' });
        _controlPlane.registerCommand('sidc:zakat',       (p) => calculateZakat(p.address),                   { description: 'حساب الزكاة', layer: 'sidc' });
        _controlPlane.registerCommand('sidc:pay-zakat',   (p) => payZakat(p.address),                         { description: 'دفع الزكاة', layer: 'sidc' });
        _controlPlane.registerCommand('sidc:convert',     (p) => convert(p.amount, p.from),                   { description: 'تحويل العملات', layer: 'sidc' });
        _controlPlane.registerCommand('sidc:status',      () => status(),                                      { description: 'حالة SIDC', layer: 'sidc' });
        console.log('[SIDC-LAYER] 📌 أوامر SIDC مسجّلة في Control Plane');
    }

    _ready           = true;
    console.log(`[SIDC-LAYER] 📖 ${TAWHEED}`);
}

function issue(address, amount, reason)       { if (!_ready) initialize(); return _sidc ? _sidc.issue(address, amount, reason) : { ok: false, error: 'SIDC غير متاح' }; }
function transfer(from, to, amount, meta)     { if (!_ready) initialize(); return _sidc ? _sidc.transfer(from, to, amount, meta) : { ok: false, error: 'SIDC غير متاح' }; }
function balance(address)                     { if (!_ready) initialize(); return _sidc ? _sidc.balance(address) : { ok: false, error: 'SIDC غير متاح' }; }
function calculateZakat(address)              { if (!_ready) initialize(); return _sidc ? _sidc.calculateZakat(address) : { ok: false, error: 'SIDC غير متاح' }; }
function payZakat(address)                    { if (!_ready) initialize(); return _sidc ? _sidc.payZakat(address) : { ok: false, error: 'SIDC غير متاح' }; }
function convert(amount, from)                { if (!_ready) initialize(); return _sidc ? _sidc.convert(amount, from) : { ok: false, error: 'SIDC غير متاح' }; }
function shariaCheck(tx)                      { if (!_ready) initialize(); return _sidc ? _sidc.shariaCheck(tx) : { compliant: false }; }

function status() {
    return {
        ...LAYER_ID,
        ready:  _ready,
        engine: _sidc ? _sidc.status() : null,
    };
}

initialize();

module.exports = { initialize, issue, transfer, balance, calculateZakat, payZakat, convert, shariaCheck, status, LAYER_ID, TAWHEED, BISMILLAH, VERSION };
