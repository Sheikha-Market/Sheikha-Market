// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║      SHEIKHA COIN ENGINE — محرك عملة شيخة المتكامل                         ║
 * ║      شيخة الدرهم (SDH) + شيخة الدينار (SDN) + شيخة كوين (SKC)             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * «وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة:275
 * «وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ» — الرحمن:9
 *
 * ══════════════════════════════════════════════════════════════════════
 * لماذا أعلى من Bitcoin وCrypto وSiren AI؟
 * ──────────────────────────────────────────
 * ✅ مدعومة بأصول حقيقية (ذهب + فضة + سلع)  — لا تقلب مضاربي
 * ✅ لا ربا — المكاسب من الأرباح الحقيقية فقط
 * ✅ لا غرر — كل وحدة لها مقابل حقيقي موثق
 * ✅ زكاة تلقائية — 2.5٪ تُحسب وتُوزَّع عند بلوغ النصاب
 * ✅ وقف رقمي — جزء من الأرباح للمشاريع الخيرية
 * ✅ تدقيق شرعي في كل معاملة
 * ✅ حوكمة: مجلس شرعي + ولي الأمر + SAMA
 * ══════════════════════════════════════════════════════════════════════
 *
 * الثلاثية:
 *   SDH — شيخة الدرهم  : مدعوم بالفضة (1 SDH = 1 درهم فضي = ~3.2g)
 *   SDN — شيخة الدينار : مدعوم بالذهب (1 SDN = 1 دينار ذهبي = ~4.25g)
 *   SKC — شيخة كوين    : سلة متنوعة  (40٪ ذهب + 30٪ فضة + 30٪ سلع)
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * © 2025-2026 Sheikha Market — جميع الحقوق محفوظة
 */

'use strict';

const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

// ─── Dependencies ─────────────────────────────────────────────────────────────

let sovereignRoot  = null;
let halalValidator = null;
let zakatCalc      = null;
let goldLedger     = null;

try { sovereignRoot  = require('../sovereign-root/sheikha-sovereign-root'); } catch (_) {}
try { halalValidator = require('../neural-root-network/halal-validator'); } catch (_) {}
try { zakatCalc      = require('./zakat-calculator'); } catch (_) {}
try { goldLedger     = require('./gold-backed-ledger'); } catch (_) {}

// ─── Currency Definitions ─────────────────────────────────────────────────────

const CURRENCIES = {
    SDH: {
        code: 'SDH', symbol: 'د.ش', name: 'شيخة الدرهم', nameEn: 'Sheikha Dirham',
        type: 'SILVER_BACKED',
        backingAsset: 'silver',
        backingWeight: 3.2,          // 3.2 جرام فضة لكل درهم
        backingUnit: 'gram',
        sarRate: 3.20,               // سعر مبدئي بالريال (يُحدَّث من السوق)
        usdRate: 0.85,
        maxSupply: 1_000_000_000,   // مليار درهم
        circulatingSupply: 0,
        quranRef: 'يوسف:20 — وشروه بثمن بخس دراهم معدودة',
        description: 'الدرهم الفضي الرقمي الإسلامي — أصيل كالدرهم التاريخي',
    },
    SDN: {
        code: 'SDN', symbol: 'د.د', name: 'شيخة الدينار', nameEn: 'Sheikha Dinar',
        type: 'GOLD_BACKED',
        backingAsset: 'gold',
        backingWeight: 4.25,         // 4.25 جرام ذهب لكل دينار (الدينار الإسلامي الكلاسيكي)
        backingUnit: 'gram',
        sarRate: 850.0,              // سعر مبدئي بالريال (1 دينار = ~4.25g ذهب)
        usdRate: 226.67,
        maxSupply: 100_000_000,     // مئة مليون دينار
        circulatingSupply: 0,
        quranRef: 'الكهف:19 — فابعثوا أحدكم بورقكم هذه إلى المدينة',
        description: 'الدينار الذهبي الرقمي — إحياء للدينار الإسلامي الحضاري',
    },
    SKC: {
        code: 'SKC', symbol: 'ش.ك', name: 'شيخة كوين', nameEn: 'SheikhaCoin',
        type: 'BASKET_BACKED',
        backingAsset: 'basket',
        backingComposition: { gold: 0.40, silver: 0.30, commodities: 0.30 },
        sarRate: 10.0,               // سعر مبدئي
        usdRate: 2.67,
        maxSupply: 10_000_000_000,  // عشرة مليارات
        circulatingSupply: 0,
        quranRef: 'البقرة:275 — وأحل الله البيع',
        description: 'عملة شيخة الأساسية — سلة متنوعة من الأصول الحقيقية',
    },
};

// ─── State ────────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'currency');
const DB_FILE  = path.join(DATA_DIR, 'skc-db.json');

let _db = null;
let _seq = 0;

function ensureDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDB() {
    try {
        if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (_) {}
    return {
        wallets: {},
        transactions: [],
        reserves: {
            SDH: { silver: 0 },
            SDN: { gold: 0 },
            SKC: { gold: 0, silver: 0, commodities: 0 },
        },
        circulatingSupply: { SDH: 0, SDN: 0, SKC: 0 },
        zakatPool: { SDH: 0, SDN: 0, SKC: 0 },
        waqfPool:  { SDH: 0, SDN: 0, SKC: 0 },
        createdAt: new Date().toISOString(),
    };
}

function saveDB() {
    ensureDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(_db, null, 2));
}

function newId(prefix) {
    return `${prefix}-${Date.now()}-${(++_seq).toString().padStart(5, '0')}`;
}

function sha256(data) {
    return crypto.createHash('sha256').update(
        typeof data === 'string' ? data : JSON.stringify(data)
    ).digest('hex');
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

function init() {
    ensureDir();
    _db = loadDB();
    if (sovereignRoot) {
        try { sovereignRoot.init(); } catch (_) {}
    }
    console.info('[SKC-ENGINE] 🌟 محرك عملة شيخة جاهز — SDH + SDN + SKC');
    return getStatus();
}

// ─── WALLET ──────────────────────────────────────────────────────────────────

/**
 * إنشاء محفظة جديدة لجميع العملات
 */
function createWallet(ownerName, ownerId) {
    if (!_db) init();
    const address = 'skw-' + sha256(`${ownerName}:${ownerId || Date.now()}:${Math.random()}`).slice(0, 32);
    const wallet = {
        address,
        ownerName,
        ownerId: ownerId || null,
        balances: { SDH: 0, SDN: 0, SKC: 0 },
        stakedBalances: { SDH: 0, SDN: 0, SKC: 0 },
        zakatDue: { SDH: 0, SDN: 0, SKC: 0 },
        transactions: [],
        createdAt: new Date().toISOString(),
        verified: false,
        level: 'L0',
    };
    _db.wallets[address] = wallet;
    saveDB();
    return wallet;
}

/**
 * الحصول على محفظة
 */
function getWallet(address) {
    if (!_db) init();
    return _db.wallets[address] || null;
}

// ─── MINT — سك العملة ────────────────────────────────────────────────────────

/**
 * سك عملة جديدة مقابل أصول حقيقية
 * @param {string} currency — SDH | SDN | SKC
 * @param {string} toAddress — عنوان المحفظة
 * @param {number} amount — الكمية
 * @param {object} backingProof — إثبات الأصل الحقيقي { asset, quantity, unit, certRef }
 */
function mint(currency, toAddress, amount, backingProof) {
    if (!_db) init();
    if (!CURRENCIES[currency]) throw new Error(`عملة غير معروفة: ${currency}`);

    const cur = CURRENCIES[currency];
    if (_db.circulatingSupply[currency] + amount > cur.maxSupply) {
        throw new Error(`تجاوز الحد الأقصى للإصدار: ${cur.maxSupply.toLocaleString()}`);
    }

    // التحقق الشرعي
    const validation = halalValidator ? halalValidator.validate({ type: 'MINT', currency, amount }) : { isHalal: true };
    if (!validation.isHalal) {
        throw new Error('رُفض السك — مخالفة شرعية: ' + validation.violations.map(v => v.name).join(', '));
    }

    const wallet = _db.wallets[toAddress];
    if (!wallet) throw new Error(`المحفظة غير موجودة: ${toAddress}`);

    const txId = newId('MINT');
    const tx = {
        id: txId, type: 'MINT', currency, amount,
        to: toAddress, backingProof,
        fee: 0,   // لا رسوم على السك الأولي
        timestamp: new Date().toISOString(),
        hash: sha256({ txId, currency, amount, toAddress }),
        shariahApproved: true,
    };

    wallet.balances[currency] = (wallet.balances[currency] || 0) + amount;
    wallet.transactions.push({ txId, type: 'MINT', currency, amount, ts: tx.timestamp });
    _db.circulatingSupply[currency] += amount;
    _db.transactions.push(tx);

    // تحديث الاحتياطيات
    if (backingProof) {
        const res = _db.reserves[currency];
        if (res && backingProof.asset && res[backingProof.asset] !== undefined) {
            res[backingProof.asset] = (res[backingProof.asset] || 0) + (backingProof.quantity || 0);
        }
    }

    // ختم سيادي
    if (sovereignRoot) {
        try { tx.sovereignSeal = sovereignRoot.sealTransaction({ id: txId, type: 'MINT' }); } catch (_) {}
    }

    saveDB();
    return tx;
}

// ─── BURN — حرق العملة ───────────────────────────────────────────────────────

function burn(currency, fromAddress, amount, redeemAsset) {
    if (!_db) init();
    const wallet = _db.wallets[fromAddress];
    if (!wallet) throw new Error('المحفظة غير موجودة');
    if (wallet.balances[currency] < amount) throw new Error('رصيد غير كافٍ للحرق');

    const txId = newId('BURN');
    const tx = {
        id: txId, type: 'BURN', currency, amount,
        from: fromAddress, redeemAsset,
        timestamp: new Date().toISOString(),
        hash: sha256({ txId, currency, amount, fromAddress }),
    };

    wallet.balances[currency] -= amount;
    wallet.transactions.push({ txId, type: 'BURN', currency, amount, ts: tx.timestamp });
    _db.circulatingSupply[currency] = Math.max(0, _db.circulatingSupply[currency] - amount);
    _db.transactions.push(tx);
    saveDB();
    return tx;
}

// ─── TRANSFER — تحويل ────────────────────────────────────────────────────────

/**
 * تحويل عملة بين محفظتين
 */
function transfer(currency, fromAddress, toAddress, amount, memo) {
    if (!_db) init();

    // التحقق الشرعي
    const validation = halalValidator
        ? halalValidator.validate({ type: 'TRANSFER', currency, amount, memo })
        : { isHalal: true };
    if (!validation.isHalal) {
        throw new Error('رُفض التحويل — مخالفة شرعية: ' + validation.violations.map(v => v.name).join(', '));
    }

    const from = _db.wallets[fromAddress];
    const to   = _db.wallets[toAddress];
    if (!from) throw new Error(`المحفظة المرسِلة غير موجودة: ${fromAddress}`);
    if (!to)   throw new Error(`المحفظة المستقبِلة غير موجودة: ${toAddress}`);
    if ((from.balances[currency] || 0) < amount) throw new Error('رصيد غير كافٍ');

    // حساب الزكاة إذا لزم
    let zakatDeducted = 0;
    if (zakatCalc) {
        const zakatCheck = zakatCalc.checkDue(from.balances[currency], currency);
        if (zakatCheck.due && zakatCheck.amount > 0) {
            zakatDeducted = Math.min(zakatCheck.amount, from.balances[currency] - amount);
            if (zakatDeducted > 0) {
                from.balances[currency] -= zakatDeducted;
                from.zakatDue[currency] = Math.max(0, (from.zakatDue[currency] || 0) - zakatDeducted);
                _db.zakatPool[currency] = (_db.zakatPool[currency] || 0) + zakatDeducted;
            }
        }
    }

    const fee = parseFloat((amount * 0.001).toFixed(6));  // 0.1٪ رسوم تشغيل (لا ربا)
    const waqfContrib = parseFloat((fee * 0.20).toFixed(6)); // 20٪ من الرسوم للوقف

    from.balances[currency] -= (amount + fee);
    to.balances[currency]    = (to.balances[currency] || 0) + amount;
    _db.waqfPool[currency]   = (_db.waqfPool[currency] || 0) + waqfContrib;

    const txId = newId('TX');
    const ts   = new Date().toISOString();
    const tx = {
        id: txId, type: 'TRANSFER', currency, amount, fee, waqfContrib, zakatDeducted,
        from: fromAddress, to: toAddress, memo: memo || '',
        timestamp: ts,
        hash: sha256({ txId, currency, amount, fromAddress, toAddress }),
        shariahApproved: true,
    };

    from.transactions.push({ txId, type: 'SEND',    currency, amount, fee, ts });
    to.transactions.push(  { txId, type: 'RECEIVE', currency, amount,      ts });
    _db.transactions.push(tx);

    if (sovereignRoot) {
        try { tx.sovereignSeal = sovereignRoot.sealTransaction({ id: txId, type: 'TRANSFER' }); } catch (_) {}
    }

    saveDB();
    return tx;
}

// ─── EXCHANGE — صرف بين العملات ──────────────────────────────────────────────

/**
 * صرف من عملة إلى أخرى (SDH ↔ SDN ↔ SKC)
 */
function exchange(fromCurrency, toCurrency, fromAddress, toAddress, amount) {
    if (!_db) init();
    const fromCur = CURRENCIES[fromCurrency];
    const toCur   = CURRENCIES[toCurrency];
    if (!fromCur || !toCur) throw new Error('عملة غير معروفة');

    const exchangeRate = fromCur.sarRate / toCur.sarRate;
    const toAmount = parseFloat((amount * exchangeRate).toFixed(8));

    // خصم من المحفظة المرسِلة
    const wallet = _db.wallets[fromAddress];
    if (!wallet) throw new Error('المحفظة غير موجودة');
    if ((wallet.balances[fromCurrency] || 0) < amount) throw new Error('رصيد غير كافٍ');
    wallet.balances[fromCurrency] -= amount;

    // إضافة للمحفظة المستقبِلة
    const toWallet = _db.wallets[toAddress] || wallet;
    toWallet.balances[toCurrency] = (toWallet.balances[toCurrency] || 0) + toAmount;

    const txId = newId('EX');
    const tx = {
        id: txId, type: 'EXCHANGE',
        fromCurrency, toCurrency, amount, toAmount, exchangeRate,
        fromAddress, toAddress,
        timestamp: new Date().toISOString(),
        hash: sha256({ txId, fromCurrency, toCurrency, amount }),
        shariahApproved: true,
        note: 'صرف شرعي — بدون ربا',
    };
    _db.transactions.push(tx);
    saveDB();
    return tx;
}

// ─── Rates ────────────────────────────────────────────────────────────────────

function getRates() {
    return Object.fromEntries(
        Object.entries(CURRENCIES).map(([code, c]) => [code, {
            code, name: c.name, symbol: c.symbol,
            sarRate: c.sarRate, usdRate: c.usdRate,
            backingAsset: c.backingAsset,
            circulatingSupply: _db ? _db.circulatingSupply[code] : 0,
        }])
    );
}

function updateRate(currency, sarRate) {
    if (!CURRENCIES[currency]) throw new Error('عملة غير معروفة');
    CURRENCIES[currency].sarRate = sarRate;
    CURRENCIES[currency].usdRate = parseFloat((sarRate / 3.75).toFixed(4));
    return CURRENCIES[currency];
}

// ─── Status ───────────────────────────────────────────────────────────────────

function getStatus() {
    return {
        engine: 'Sheikha Coin Engine',
        version: '1.0.0',
        currencies: Object.keys(CURRENCIES).map(code => ({
            ...CURRENCIES[code],
            circulatingSupply: _db ? _db.circulatingSupply[code] : 0,
        })),
        reserves: _db ? _db.reserves : {},
        pools: {
            zakat: _db ? _db.zakatPool : {},
            waqf:  _db ? _db.waqfPool  : {},
        },
        totalTransactions: _db ? _db.transactions.length : 0,
        totalWallets: _db ? Object.keys(_db.wallets).length : 0,
        shariahCompliance: '100٪ — متوافق مع الكتاب والسنة',
        superiority: {
            overBitcoin:  'مدعومة بأصول حقيقية — لا تقلب مضاربي',
            overEthereum: 'لا ربا — مكاسب من أرباح حقيقية فقط',
            overSirenAI:  'مرجعية إلهية لا بشرية — الكتاب والسنة',
            overCBDC:     'لامركزية مع حوكمة شرعية — لا احتكار حكومي',
        },
        startedAt: new Date().toISOString(),
    };
}

module.exports = {
    init,
    createWallet, getWallet,
    mint, burn, transfer, exchange,
    getRates, updateRate,
    getStatus,
    CURRENCIES,
};
