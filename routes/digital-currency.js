// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⭐ SHEIKHA DIGITAL CURRENCY — API ROUTES
 *    عملة شيخة الرقمية — المسارات الكاملة
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * «وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة: 275
 *
 * مبدأ العملة الأساسية:
 *   SHK هي العملة الأساسية — كل تداول يمر عبرها (INPUT → SHK → OUTPUT)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  INFO
 *  GET  /api/shk                         — دليل المسارات + مبدأ العملة الأساسية
 *  GET  /api/shk/status                  — الحالة الكاملة للنظام
 *  GET  /api/shk/price                   — سعر SHK المباشر (Neural Oracle)
 *  GET  /api/shk/market                  — معلومات السوق الكاملة
 *  GET  /api/shk/backing                 — وضع الاحتياطيات (ذهب+فضة+سلع+سيولة)
 *
 *  EXCHANGE (SHK هي العملة الأساسية)
 *  GET  /api/shk/currencies              — كل العملات المدعومة (30+)
 *  GET  /api/shk/rates                   — كل الأسعار مقابل SHK
 *  POST /api/shk/exchange/quote          — عرض سعر صرف (ANY → SHK → ANY)
 *  POST /api/shk/exchange/execute        — تنفيذ تداول فعلي
 *  GET  /api/shk/exchange/rate/:from/:to — سعر زوج محدد
 *
 *  WALLETS
 *  POST /api/shk/wallet/create           — إنشاء محفظة SHK on-chain
 *  GET  /api/shk/wallet/:address         — تفاصيل المحفظة
 *  GET  /api/shk/wallet/:address/history — سجل معاملات المحفظة
 *  GET  /api/shk/wallet/:address/balance — الرصيد بجميع العملات
 *
 *  TRANSFERS
 *  POST /api/shk/transfer                — تحويل SHK بين محفظتين
 *
 *  MINT / BURN / STAKE
 *  POST /api/shk/mint                    — سك SHK مقابل أصول حقيقية
 *  POST /api/shk/burn                    — حرق SHK واسترداد أصول
 *  POST /api/shk/stake                   — تجميد SHK لكسب مكافآت
 *  POST /api/shk/unstake                 — إلغاء التجميد مع المكافأة
 *
 *  NEURAL ORACLE
 *  GET  /api/shk/oracle/assess           — تقييم عصبي للقيمة
 *  POST /api/shk/oracle/train            — تدريب Oracle على سعر فعلي
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

let shkCore          = null;
let DIGITAL_CURRENCIES = null;

try {
    const mod        = require('../lib/sheikha-digital-currency-core');
    shkCore          = mod.shkCore;
    DIGITAL_CURRENCIES = mod.DIGITAL_CURRENCIES;
} catch (e) {
    console.warn('[SHK-ROUTES] ⚠️ Digital Currency Core غير متوفر:', e.message);
}

function notAvailable(res) {
    return res.status(503).json({ success: false, error: 'Sheikha Digital Currency Core غير متوفر' });
}

function wrap(fn) {
    return (req, res) => {
        try { fn(req, res); }
        catch (e) { res.status(500).json({ success: false, error: e.message }); }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET / — دليل المسارات
// ─────────────────────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
    res.json({
        success:    true,
        nameAr:     'عملة شيخة الرقمية — SHK',
        nameEn:     'Sheikha Digital Currency — SHK',
        version:    '2.0.0',
        principle: {
            ar: 'SHK هي العملة الأساسية — كل تداول يمر عبرها: INPUT → SHK → OUTPUT',
            en: 'SHK is the BASE currency — every trade routes through it: INPUT → SHK → OUTPUT'
        },
        quranRef:   '«وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة: 275',
        endpoints: {
            info: {
                'GET /api/shk/status':               'الحالة الكاملة',
                'GET /api/shk/price':                'سعر SHK المباشر',
                'GET /api/shk/market':               'معلومات السوق',
                'GET /api/shk/backing':              'وضع الاحتياطيات'
            },
            exchange: {
                'GET  /api/shk/currencies':          'كل العملات المدعومة (30+)',
                'GET  /api/shk/rates':               'كل الأسعار مقابل SHK',
                'POST /api/shk/exchange/quote':      'عرض سعر صرف { from, to, amount }',
                'POST /api/shk/exchange/execute':    'تنفيذ تداول { walletFrom, walletTo, from, to, amount }',
                'GET  /api/shk/exchange/rate/:f/:t': 'سعر زوج محدد'
            },
            wallets: {
                'POST /api/shk/wallet/create':           'إنشاء محفظة { ownerName, ownerId? }',
                'GET  /api/shk/wallet/:address':         'تفاصيل المحفظة',
                'GET  /api/shk/wallet/:address/history': 'سجل المعاملات',
                'GET  /api/shk/wallet/:address/balance': 'الرصيد'
            },
            transfers: {
                'POST /api/shk/transfer': 'تحويل SHK { from, to, amount, currency?, memo? }'
            },
            mintBurnStake: {
                'POST /api/shk/mint':    'سك SHK { to, amount, backingAsset, backingValueSAR }',
                'POST /api/shk/burn':    'حرق SHK { from, amount, redeemAsset }',
                'POST /api/shk/stake':   'تجميد SHK { address, amount }',
                'POST /api/shk/unstake': 'إلغاء التجميد { address, amount }'
            },
            oracle: {
                'GET  /api/shk/oracle/assess': 'تقييم عصبي للقيمة',
                'POST /api/shk/oracle/train':  'تدريب Oracle { indicators, actual, epochs? }'
            }
        },
        supportedCurrencies: DIGITAL_CURRENCIES ? Object.keys(DIGITAL_CURRENCIES).length : 0
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /status — الحالة الكاملة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/status', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    res.json({ success: true, data: shkCore.getStatus() });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /price — سعر SHK المباشر
// ─────────────────────────────────────────────────────────────────────────────

router.get('/price', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const assessment = shkCore.getNeuralValueAssessment();
    res.json({
        success: true,
        data: {
            code:           'SHK',
            symbol:         '⭐',
            nameAr:         'شيخة كوين',
            isBaseCurrency: true,
            priceSAR:       assessment.priceSAR,
            priceUSD:       assessment.priceUSD,
            confidence:     assessment.confidence,
            growthSignal:   assessment.growthSignal,
            recommendation: assessment.recommendation,
            updatedAt:      new Date().toISOString()
        }
    });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /market — معلومات السوق
// ─────────────────────────────────────────────────────────────────────────────

router.get('/market', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    res.json({ success: true, data: shkCore.getMarketInfo() });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /backing — وضع الاحتياطيات
// ─────────────────────────────────────────────────────────────────────────────

router.get('/backing', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    res.json({ success: true, data: shkCore.getBackingStatus() });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /currencies — كل العملات المدعومة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/currencies', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const category = req.query.category || null; // islamic | major | stable | fiat
    let currencies = shkCore.getSupportedCurrencies();
    if (category) currencies = currencies.filter(c => c.category === category);
    res.json({
        success: true,
        count:   currencies.length,
        baseCurrency: 'SHK',
        principle: 'كل تداول يمر عبر SHK (INPUT → SHK → OUTPUT)',
        data: currencies
    });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /rates — كل الأسعار مقابل SHK
// ─────────────────────────────────────────────────────────────────────────────

router.get('/rates', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    res.json({
        success:      true,
        baseCurrency: 'SHK',
        unit:         'كم SHK تساوي وحدة واحدة من كل عملة',
        data:         shkCore.getAllRatesVsSHK(),
        updatedAt:    new Date().toISOString()
    });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /exchange/quote — عرض سعر التبادل
// Body: { from: 'BTC', to: 'SAR', amount: 0.01 }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/exchange/quote', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const { from, to, amount } = req.body || {};
    if (!from || !to || !amount) {
        return res.status(400).json({ success: false, error: 'الحقول المطلوبة: from, to, amount' });
    }
    const result = shkCore.getExchangeQuote(from.toUpperCase(), to.toUpperCase(), parseFloat(amount));
    const status = result.success ? 200 : 422;
    res.status(status).json(result);
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /exchange/execute — تنفيذ تداول فعلي
// Body: { walletFrom, walletTo, from, to, amount }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/exchange/execute', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const { walletFrom, walletTo, from, to, amount } = req.body || {};
    if (!from || !to || !amount) {
        return res.status(400).json({ success: false, error: 'الحقول المطلوبة: from, to, amount' });
    }
    const result = shkCore.executeExchange(
        walletFrom, walletTo,
        from.toUpperCase(), to.toUpperCase(),
        parseFloat(amount)
    );
    const status = result.success ? 200 : 422;
    res.status(status).json(result);
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /exchange/rate/:from/:to — سعر زوج محدد مقابل SHK
// ─────────────────────────────────────────────────────────────────────────────

router.get('/exchange/rate/:from/:to', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const from   = req.params.from.toUpperCase();
    const to     = req.params.to.toUpperCase();
    const amount = parseFloat(req.query.amount || 1);
    const result = shkCore.getExchangeQuote(from, to, amount);
    res.json(result);
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /wallet/create — إنشاء محفظة SHK on-chain
// Body: { ownerName, ownerId? }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/wallet/create', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const { ownerName, ownerId } = req.body || {};
    if (!ownerName) return res.status(400).json({ success: false, error: 'ownerName مطلوب' });
    const wallet = shkCore.createWallet(ownerName, ownerId);
    res.json({ success: true, data: wallet });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /wallet/:address — تفاصيل المحفظة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/wallet/:address', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const wallet = shkCore.getWallet(req.params.address);
    if (!wallet) return res.status(404).json({ success: false, error: 'المحفظة غير موجودة' });
    res.json({ success: true, data: wallet });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /wallet/:address/history — سجل المعاملات
// ─────────────────────────────────────────────────────────────────────────────

router.get('/wallet/:address/history', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const limit   = Math.min(parseInt(req.query.limit || 50), 200);
    const history = shkCore.getWalletHistory(req.params.address, limit);
    res.json({ success: true, count: history.length, data: history });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /wallet/:address/balance — الرصيد
// ─────────────────────────────────────────────────────────────────────────────

router.get('/wallet/:address/balance', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const wallet = shkCore.getWallet(req.params.address);
    if (!wallet) return res.status(404).json({ success: false, error: 'المحفظة غير موجودة' });
    const price  = shkCore.market.getLivePrice();
    res.json({
        success:        true,
        address:        req.params.address,
        balances:       wallet.balances,
        staked:         wallet.staked,
        liveValueSAR:   wallet.liveValueSAR,
        shkPriceSAR:    price,
        totalSHK:       (wallet.balances.SHK || 0) + (wallet.staked.SHK || 0)
    });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /transfer — تحويل SHK
// Body: { from, to, amount, currency?, memo? }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/transfer', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const { from, to, amount, currency = 'SHK', memo = '' } = req.body || {};
    if (!from || !to || !amount) {
        return res.status(400).json({ success: false, error: 'الحقول المطلوبة: from, to, amount' });
    }
    const result = shkCore.transferSHK(from, to, parseFloat(amount), currency.toUpperCase(), memo);
    res.json({ success: true, data: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /mint — سك SHK مقابل أصول حقيقية
// Body: { to, amount, backingAsset, backingValueSAR }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/mint', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const { to, amount, backingAsset, backingValueSAR } = req.body || {};
    if (!to || !amount || !backingAsset || !backingValueSAR) {
        return res.status(400).json({ success: false, error: 'الحقول المطلوبة: to, amount, backingAsset, backingValueSAR' });
    }
    const result = shkCore.mintSHK(to, parseFloat(amount), backingAsset, parseFloat(backingValueSAR));
    res.json({ success: true, data: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /burn — حرق SHK
// Body: { from, amount, redeemAsset }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/burn', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const { from, amount, redeemAsset } = req.body || {};
    if (!from || !amount || !redeemAsset) {
        return res.status(400).json({ success: false, error: 'الحقول المطلوبة: from, amount, redeemAsset' });
    }
    const result = shkCore.burnSHK(from, parseFloat(amount), redeemAsset);
    res.json({ success: true, data: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /stake — تجميد SHK
// Body: { address, amount }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/stake', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const { address, amount } = req.body || {};
    if (!address || !amount) {
        return res.status(400).json({ success: false, error: 'الحقول المطلوبة: address, amount' });
    }
    const result = shkCore.stakeSHK(address, parseFloat(amount));
    res.json({ success: true, data: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /unstake — إلغاء التجميد
// Body: { address, amount }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/unstake', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const { address, amount } = req.body || {};
    if (!address || !amount) {
        return res.status(400).json({ success: false, error: 'الحقول المطلوبة: address, amount' });
    }
    const result = shkCore.unstakeSHK(address, parseFloat(amount));
    res.json({ success: true, data: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /oracle/assess — تقييم عصبي للقيمة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/oracle/assess', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const assessment = shkCore.getNeuralValueAssessment();
    res.json({ success: true, data: assessment });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /oracle/train — تدريب Oracle
// Body: { indicators: {...}, actual: { priceSAR, confidence, growthSignal }, epochs? }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/oracle/train', wrap((req, res) => {
    if (!shkCore) return notAvailable(res);
    const { indicators, actual, epochs = 10 } = req.body || {};
    if (!indicators || !actual) {
        return res.status(400).json({ success: false, error: 'الحقول المطلوبة: indicators, actual' });
    }
    const result = shkCore.trainOracle(indicators, actual, epochs);
    res.json({ success: true, data: result });
}));

module.exports = router;
