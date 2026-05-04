// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA CURRENCY API — مسارات عملة شيخة المتكاملة                        ║
 * ║   شيخة الدرهم (SDH) + شيخة الدينار (SDN) + شيخة كوين (SKC)               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * «وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة:275
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ENDPOINTS:
 *   GET  /api/currency                 — دليل العملات
 *   GET  /api/currency/status          — حالة النظام
 *   GET  /api/currency/rates           — أسعار الصرف الحية
 *   GET  /api/currency/dirham          — معلومات شيخة الدرهم
 *   GET  /api/currency/dinar           — معلومات شيخة الدينار
 *   POST /api/currency/wallet/create   — إنشاء محفظة
 *   GET  /api/currency/wallet/:address — تفاصيل المحفظة
 *   POST /api/currency/mint            — سك عملة
 *   POST /api/currency/burn            — حرق عملة
 *   POST /api/currency/transfer        — تحويل
 *   POST /api/currency/exchange        — صرف بين العملات
 *   GET  /api/currency/reserves        — الاحتياطيات
 *   POST /api/currency/zakat/calculate — حساب الزكاة
 *   POST /api/currency/waqf/create     — إنشاء وقف
 *   GET  /api/currency/waqf/list       — قائمة الأوقاف
 *   POST /api/currency/validate        — التحقق الشرعي
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── Load Engines ─────────────────────────────────────────────────────────────

let skcEngine    = null;
let zakatCalc    = null;
let goldLedger   = null;
let waqfToken    = null;
let halalVal     = null;

try { skcEngine  = require('../core/sheikha-coin/skc-engine');         } catch (_) {}
try { zakatCalc  = require('../core/sheikha-coin/zakat-calculator');   } catch (_) {}
try { goldLedger = require('../core/sheikha-coin/gold-backed-ledger'); } catch (_) {}
try { waqfToken  = require('../core/sheikha-coin/waqf-token');         } catch (_) {}
try { halalVal   = require('../core/neural-root-network/halal-validator'); } catch (_) {}

// ─── Middleware Helpers ───────────────────────────────────────────────────────

function ok(res, data) {
    res.json({ success: true, ...data });
}

function err(res, message, status) {
    res.status(status || 400).json({ success: false, error: message });
}

function wrap(fn) {
    return async (req, res) => {
        try {
            await fn(req, res);
        } catch (e) {
            err(res, e.message, 500);
        }
    };
}

function getEngine() {
    if (!skcEngine) throw new Error('محرك العملة غير متوفر');
    if (!skcEngine._db) skcEngine.init();
    return skcEngine;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET / — دليل العملات
// ─────────────────────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
    ok(res, {
        name:    'منظومة عملة شيخة الرقمية',
        nameEn:  'Sheikha Digital Currency System',
        version: '1.0.0',
        quranRef: '«وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة:275',
        currencies: [
            { code: 'SDH', name: 'شيخة الدرهم',  backing: 'فضة — 3.2 جرام/درهم',  rate: '~3.20 ريال' },
            { code: 'SDN', name: 'شيخة الدينار', backing: 'ذهب — 4.25 جرام/دينار', rate: '~850 ريال' },
            { code: 'SKC', name: 'شيخة كوين',    backing: 'سلة (ذهب+فضة+سلع)',    rate: '~10 ريال' },
        ],
        superiority: {
            ar: 'أعلى من Bitcoin وCrypto وSiren AI — مدعومة بأصول حقيقية + شريعة إسلامية',
            en: 'Superior to Bitcoin, Crypto & Siren AI — Real assets + Shariah-backed',
        },
        endpoints: {
            'GET  /api/currency/status':           'حالة النظام',
            'GET  /api/currency/rates':             'أسعار الصرف',
            'GET  /api/currency/dirham':            'معلومات الدرهم',
            'GET  /api/currency/dinar':             'معلومات الدينار',
            'POST /api/currency/wallet/create':     'إنشاء محفظة',
            'GET  /api/currency/wallet/:address':   'تفاصيل المحفظة',
            'POST /api/currency/mint':              'سك عملة',
            'POST /api/currency/transfer':          'تحويل',
            'POST /api/currency/exchange':          'صرف',
            'GET  /api/currency/reserves':          'الاحتياطيات',
            'POST /api/currency/zakat/calculate':   'حساب الزكاة',
            'POST /api/currency/waqf/create':       'وقف رقمي',
            'POST /api/currency/validate':          'تحقق شرعي',
        },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /status
// ─────────────────────────────────────────────────────────────────────────────

router.get('/status', wrap((req, res) => {
    const eng = getEngine();
    ok(res, { currency: eng.getStatus() });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /rates
// ─────────────────────────────────────────────────────────────────────────────

router.get('/rates', wrap((req, res) => {
    const eng = getEngine();
    ok(res, { rates: eng.getRates(), updatedAt: new Date().toISOString() });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /dirham — شيخة الدرهم
// ─────────────────────────────────────────────────────────────────────────────

router.get('/dirham', wrap((req, res) => {
    const eng = getEngine();
    const sdh = eng.CURRENCIES.SDH;
    ok(res, {
        currency: sdh,
        description: {
            ar: 'شيخة الدرهم — الدرهم الفضي الرقمي الإسلامي المتوافق مع الشريعة الإسلامية',
            en: 'Sheikha Dirham — Islamic Digital Silver Dirham, Shariah-compliant',
        },
        history: 'الدرهم الإسلامي الكلاسيكي: 2.975 جرام فضة — المعيار منذ صدر الإسلام',
        quranRef: 'يوسف:20 — وشروه بثمن بخس دراهم معدودة',
        standard: '3.2 جرام فضة نقية لكل درهم رقمي',
        sarRate: sdh.sarRate,
        usdRate: sdh.usdRate,
        advantages: [
            'مدعوم بفضة حقيقية محفوظة في مستودعات مرخصة',
            'لا ربا — مكاسب من التجارة الحقيقية',
            'زكاة تلقائية 2.5٪ عند بلوغ النصاب',
            'تدقيق شرعي في كل معاملة',
        ],
    });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /dinar — شيخة الدينار
// ─────────────────────────────────────────────────────────────────────────────

router.get('/dinar', wrap((req, res) => {
    const eng = getEngine();
    const sdn = eng.CURRENCIES.SDN;
    ok(res, {
        currency: sdn,
        description: {
            ar: 'شيخة الدينار — الدينار الذهبي الرقمي إحياءً للدينار الإسلامي الحضاري',
            en: 'Sheikha Dinar — Islamic Digital Gold Dinar, reviving the classical Islamic Dinar',
        },
        history: 'الدينار الإسلامي الكلاسيكي: 4.25 جرام ذهب — معيار الأمة الإسلامية لأكثر من 1300 سنة',
        quranRef: 'الكهف:19 — فابعثوا أحدكم بورقكم هذه إلى المدينة',
        standard: '4.25 جرام ذهب خالص (24 قيراط) لكل دينار رقمي',
        sarRate: sdn.sarRate,
        usdRate: sdn.usdRate,
        advantages: [
            'مدعوم بذهب حقيقي — أعلى درجات الاستقرار',
            'قيمة ثابتة نسبياً — لا مضاربة',
            'حفظ للثروة عبر الأجيال (وقف الدينار)',
            'إحياء للمعيار النقدي الإسلامي',
        ],
        superiority: {
            overBitcoin: 'ذهب حقيقي vs رياضيات — الذهب أصدق وأثبت',
            overUSDT: 'دعم بذهب vs دولار — الذهب لا يتضخم',
        },
    });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /wallet/create
// ─────────────────────────────────────────────────────────────────────────────

router.post('/wallet/create', wrap((req, res) => {
    const { ownerName, ownerId } = req.body || {};
    if (!ownerName) return err(res, 'ownerName مطلوب');
    const eng = getEngine();
    const wallet = eng.createWallet(ownerName, ownerId);
    ok(res, { wallet, message: 'تم إنشاء المحفظة بنجاح — SDH + SDN + SKC' });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /wallet/:address
// ─────────────────────────────────────────────────────────────────────────────

router.get('/wallet/:address', wrap((req, res) => {
    const eng    = getEngine();
    const wallet = eng.getWallet(req.params.address);
    if (!wallet) return err(res, 'المحفظة غير موجودة', 404);
    ok(res, { wallet });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /mint — سك عملة
// ─────────────────────────────────────────────────────────────────────────────

router.post('/mint', wrap((req, res) => {
    const { currency, toAddress, amount, backingProof } = req.body || {};
    if (!currency || !toAddress || !amount) return err(res, 'currency + toAddress + amount مطلوبة');
    if (!['SDH', 'SDN', 'SKC'].includes(currency)) return err(res, 'عملة غير صالحة — SDH | SDN | SKC');
    const eng = getEngine();
    const tx  = eng.mint(currency, toAddress, Number(amount), backingProof);
    ok(res, { transaction: tx, message: `تم سك ${amount} ${currency} بنجاح` });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /burn
// ─────────────────────────────────────────────────────────────────────────────

router.post('/burn', wrap((req, res) => {
    const { currency, fromAddress, amount, redeemAsset } = req.body || {};
    if (!currency || !fromAddress || !amount) return err(res, 'currency + fromAddress + amount مطلوبة');
    const eng = getEngine();
    const tx  = eng.burn(currency, fromAddress, Number(amount), redeemAsset);
    ok(res, { transaction: tx, message: `تم حرق ${amount} ${currency}` });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /transfer
// ─────────────────────────────────────────────────────────────────────────────

router.post('/transfer', wrap((req, res) => {
    const { currency, from, to, amount, memo } = req.body || {};
    if (!currency || !from || !to || !amount) return err(res, 'currency + from + to + amount مطلوبة');
    const eng = getEngine();
    const tx  = eng.transfer(currency, from, to, Number(amount), memo);
    ok(res, { transaction: tx, message: `تم التحويل: ${amount} ${currency}` });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /exchange — صرف
// ─────────────────────────────────────────────────────────────────────────────

router.post('/exchange', wrap((req, res) => {
    const { fromCurrency, toCurrency, fromAddress, toAddress, amount } = req.body || {};
    if (!fromCurrency || !toCurrency || !fromAddress || !amount) {
        return err(res, 'fromCurrency + toCurrency + fromAddress + amount مطلوبة');
    }
    const eng = getEngine();
    const tx  = eng.exchange(fromCurrency, toCurrency, fromAddress, toAddress || fromAddress, Number(amount));
    ok(res, { transaction: tx, message: `تم الصرف: ${amount} ${fromCurrency} → ${tx.toAmount} ${toCurrency}` });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /reserves
// ─────────────────────────────────────────────────────────────────────────────

router.get('/reserves', wrap((req, res) => {
    if (!goldLedger) return err(res, 'دفتر الاحتياطيات غير متوفر', 503);
    const reserves = goldLedger.getReserves();
    ok(res, { reserves });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /zakat/calculate
// ─────────────────────────────────────────────────────────────────────────────

router.post('/zakat/calculate', wrap((req, res) => {
    const { balance, currency, haulDays } = req.body || {};
    if (!balance || !currency) return err(res, 'balance + currency مطلوبان');
    if (!zakatCalc) return err(res, 'محرك الزكاة غير متوفر', 503);
    const result = zakatCalc.calculate(Number(balance), currency, Number(haulDays) || 365);
    ok(res, { zakat: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /waqf/create
// ─────────────────────────────────────────────────────────────────────────────

router.post('/waqf/create', wrap((req, res) => {
    const { waaqif, currency, amount, waqfType, beneficiary, duration } = req.body || {};
    if (!waaqif || !currency || !amount) return err(res, 'waaqif + currency + amount مطلوبة');
    if (!waqfToken) return err(res, 'محرك الوقف غير متوفر', 503);
    const waqf = waqfToken.createWaqf(waaqif, currency, Number(amount), waqfType, beneficiary, duration);
    ok(res, { waqf, message: 'تم تسجيل الوقف الرقمي بنجاح — جزاك الله خيراً' });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /waqf/list
// ─────────────────────────────────────────────────────────────────────────────

router.get('/waqf/list', wrap((req, res) => {
    if (!waqfToken) return err(res, 'محرك الوقف غير متوفر', 503);
    const awqaf = waqfToken.listActive(req.query.currency);
    const stats = waqfToken.getStats();
    ok(res, { awqaf, stats });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /validate — تحقق شرعي
// ─────────────────────────────────────────────────────────────────────────────

router.post('/validate', wrap((req, res) => {
    if (!halalVal) return err(res, 'محقق الحلال غير متوفر', 503);
    const result = halalVal.validate(req.body || {});
    ok(res, { validation: result });
}));

module.exports = router;
