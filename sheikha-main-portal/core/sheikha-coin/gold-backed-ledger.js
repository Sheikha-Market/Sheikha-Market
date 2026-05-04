// بسم الله الرحمن الرحيم
/**
 * GOLD-BACKED LEDGER — دفتر الأستاذ المدعوم بالذهب والفضة
 * يتتبع الاحتياطيات الحقيقية لكل عملة (SDH / SDN / SKC)
 *
 * «وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ» — الرحمن:9
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const DATA_DIR    = path.join(__dirname, '..', '..', 'data', 'currency');
const LEDGER_FILE = path.join(DATA_DIR, 'gold-ledger.json');

// أسعار تقريبية (تُحدَّث من Oracle)
let PRICES = {
    goldPerGram:   200,    // ريال / جرام ذهب
    silverPerGram: 2.50,   // ريال / جرام فضة
    updatedAt: new Date().toISOString(),
};

let _ledger = null;

function ensureDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
    try {
        if (fs.existsSync(LEDGER_FILE)) return JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
    } catch (_) {}
    return {
        reserves: {
            SDH: { asset: 'silver', grams: 0, sarValue: 0 },
            SDN: { asset: 'gold',   grams: 0, sarValue: 0 },
            SKC: { gold: 0, silver: 0, commoditiesSAR: 0, totalSAR: 0 },
        },
        auditLog: [],
        createdAt: new Date().toISOString(),
    };
}

function save() {
    ensureDir();
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(_ledger, null, 2));
}

function init() {
    ensureDir();
    _ledger = load();
    return getReserves();
}

/**
 * إضافة احتياطي (عند سك عملة جديدة)
 */
function addReserve(currency, asset, quantity, certRef) {
    if (!_ledger) init();
    const ts = new Date().toISOString();
    if (currency === 'SDN') {
        _ledger.reserves.SDN.grams += quantity;
        _ledger.reserves.SDN.sarValue = _ledger.reserves.SDN.grams * PRICES.goldPerGram;
    } else if (currency === 'SDH') {
        _ledger.reserves.SDH.grams += quantity;
        _ledger.reserves.SDH.sarValue = _ledger.reserves.SDH.grams * PRICES.silverPerGram;
    } else if (currency === 'SKC') {
        if (asset === 'gold')        _ledger.reserves.SKC.gold         += quantity;
        else if (asset === 'silver') _ledger.reserves.SKC.silver        += quantity;
        else                         _ledger.reserves.SKC.commoditiesSAR += quantity;
        _ledger.reserves.SKC.totalSAR =
            _ledger.reserves.SKC.gold   * PRICES.goldPerGram   +
            _ledger.reserves.SKC.silver * PRICES.silverPerGram +
            _ledger.reserves.SKC.commoditiesSAR;
    }
    _ledger.auditLog.push({ action: 'ADD', currency, asset, quantity, certRef, ts });
    save();
    return getReserves();
}

/**
 * خصم احتياطي (عند حرق عملة)
 */
function removeReserve(currency, asset, quantity, certRef) {
    if (!_ledger) init();
    const ts = new Date().toISOString();
    if (currency === 'SDN') {
        _ledger.reserves.SDN.grams = Math.max(0, _ledger.reserves.SDN.grams - quantity);
        _ledger.reserves.SDN.sarValue = _ledger.reserves.SDN.grams * PRICES.goldPerGram;
    } else if (currency === 'SDH') {
        _ledger.reserves.SDH.grams = Math.max(0, _ledger.reserves.SDH.grams - quantity);
        _ledger.reserves.SDH.sarValue = _ledger.reserves.SDH.grams * PRICES.silverPerGram;
    }
    _ledger.auditLog.push({ action: 'REMOVE', currency, asset, quantity, certRef, ts });
    save();
    return getReserves();
}

/**
 * حساب نسبة التغطية (Backing Ratio)
 * يجب أن تكون ≥ 100٪
 */
function getBackingRatio(currency, circulatingSupply, sarRate) {
    if (!_ledger) init();
    const totalIssuedSAR = circulatingSupply * sarRate;
    let reserveSAR = 0;
    if (currency === 'SDN') reserveSAR = _ledger.reserves.SDN.sarValue;
    else if (currency === 'SDH') reserveSAR = _ledger.reserves.SDH.sarValue;
    else if (currency === 'SKC') reserveSAR = _ledger.reserves.SKC.totalSAR;
    const ratio = totalIssuedSAR > 0 ? reserveSAR / totalIssuedSAR : 1;
    return {
        currency,
        reserveSAR: parseFloat(reserveSAR.toFixed(2)),
        issuedSAR: parseFloat(totalIssuedSAR.toFixed(2)),
        backingRatio: parseFloat(ratio.toFixed(4)),
        fullyBacked: ratio >= 1.0,
        status: ratio >= 1.0 ? 'FULLY_BACKED ✅' : 'UNDER_BACKED ⚠️',
    };
}

/**
 * تحديث أسعار السوق
 */
function updatePrices(goldPerGram, silverPerGram) {
    PRICES.goldPerGram   = goldPerGram;
    PRICES.silverPerGram = silverPerGram;
    PRICES.updatedAt     = new Date().toISOString();
    // إعادة حساب القيم
    if (_ledger) {
        _ledger.reserves.SDN.sarValue = _ledger.reserves.SDN.grams * goldPerGram;
        _ledger.reserves.SDH.sarValue = _ledger.reserves.SDH.grams * silverPerGram;
        _ledger.reserves.SKC.totalSAR =
            _ledger.reserves.SKC.gold   * goldPerGram   +
            _ledger.reserves.SKC.silver * silverPerGram +
            _ledger.reserves.SKC.commoditiesSAR;
        save();
    }
    return PRICES;
}

function getReserves() {
    if (!_ledger) init();
    return { ..._ledger.reserves, prices: PRICES, updatedAt: new Date().toISOString() };
}

module.exports = { init, addReserve, removeReserve, getBackingRatio, updatePrices, getReserves };
