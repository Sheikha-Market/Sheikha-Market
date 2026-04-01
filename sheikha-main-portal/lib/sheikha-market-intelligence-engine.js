/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ☪️  بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * SHEIKHA — محرك استخبارات سوق المعادن والسكراب
 * "يد على السعر — عين على السوق — قلب على الشريعة"
 *
 * ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُسَمًّى فَاكْتُبُوهُ﴾
 * «مَنْ غَشَّنَا فَلَيْسَ مِنَّا» — صحة المعلومة واجبة
 * «التاجر الصدوق مع النبيين والصديقين والشهداء»
 * «لا ضرر ولا ضرار» — حماية السوق من الغش والمضاربة
 *
 * الهيكل:
 *   §1  MARKET_CONFIG           — أسعار إرشادية + نطاقات + عملات
 *   §2  PRICE_ENGINE            — محاكاة حركة الأسعار (فنية)
 *   §3  TradingSignalAnalyzer   — إشارات الشراء/البيع/الانتظار
 *   §4  ScrapSpreadAnalyzer     — تحليل الفارق (سكراب vs نقي)
 *   §5  RFQMatcher              — مطابقة طلبات الأسعار
 *   §6  IslamicFinanceProducts  — مرابحة، استصناع، سلم
 *   §7  RegionalMarketComparator— مقارنة الأسواق الإقليمية
 *   §8  RiskAnalyzer            — مخاطر السعر والعملة والنقل
 *   §9  MarketAlertSystem       — تنبيهات الأسعار والفرص
 *   §10 SheikhaMarketIntelligenceEngine — المحرك الرئيسي
 *   §11 التصدير
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * الإصدار: 1.0.0
 * ══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');

// ══════════════════════════════════════════════════════════════════════════════
// §1 — MARKET_CONFIG
// ══════════════════════════════════════════════════════════════════════════════

const MARKET_CONFIG = {
    // أسعار مرجعية حالية (SAR/USD — 1 USD ≈ 3.75 SAR)
    FX: { USDSAR: 3.75, EURUSD: 1.08, GBPUSD: 1.27 },

    // بيانات الأسعار لكل معدن/سكراب
    PRICES: {
        // ─── فلزات LME ───
        Cu:    { unit:'USD/ton',    ref:9200,  lo:7800,  hi:10500, volatility:0.018, exchange:'LME' },
        Al:    { unit:'USD/ton',    ref:2350,  lo:1900,  hi:2800,  volatility:0.016, exchange:'LME' },
        Zn:    { unit:'USD/ton',    ref:2900,  lo:2200,  hi:3500,  volatility:0.020, exchange:'LME' },
        Pb:    { unit:'USD/ton',    ref:2000,  lo:1700,  hi:2500,  volatility:0.015, exchange:'LME' },
        Ni:    { unit:'USD/ton',    ref:16000, lo:12000, hi:21000, volatility:0.025, exchange:'LME' },
        Sn:    { unit:'USD/ton',    ref:26000, lo:22000, hi:32000, volatility:0.022, exchange:'LME' },
        Co:    { unit:'USD/lb',     ref:13,    lo:9,     hi:20,    volatility:0.030, exchange:'LME' },
        // ─── فلزات COMEX / قياسي ───
        Fe:    { unit:'USD/ton',    ref:450,   lo:380,   hi:560,   volatility:0.012, exchange:'SGX' },
        Au:    { unit:'USD/toz',    ref:2300,  lo:1900,  hi:2600,  volatility:0.010, exchange:'COMEX'},
        Ag:    { unit:'USD/toz',    ref:27,    lo:21,    hi:34,    volatility:0.022, exchange:'COMEX'},
        Pt:    { unit:'USD/toz',    ref:950,   lo:800,   hi:1200,  volatility:0.015, exchange:'COMEX'},
        Pd:    { unit:'USD/toz',    ref:1000,  lo:700,   hi:1500,  volatility:0.035, exchange:'COMEX'},
        // ─── سكراب (SAR/kg أو SAR/ton) ───
        HMS1:  { unit:'SAR/ton',    ref:500,   lo:400,   hi:620,   volatility:0.025, exchange:'محلي' },
        HMS2:  { unit:'SAR/ton',    ref:420,   lo:330,   hi:500,   volatility:0.025, exchange:'محلي' },
        BIRCH: { unit:'SAR/kg',     ref:30,    lo:24,    hi:36,    volatility:0.018, exchange:'محلي' },
        CANDY: { unit:'SAR/kg',     ref:29,    lo:23,    hi:35,    volatility:0.018, exchange:'محلي' },
        TWITCH:{ unit:'SAR/kg',     ref:4.0,   lo:3.2,   hi:5.0,   volatility:0.020, exchange:'محلي' },
        ZORBA: { unit:'SAR/ton',    ref:1800,  lo:1400,  hi:2200,  volatility:0.022, exchange:'محلي' },
        PCB:   { unit:'USD/kg',     ref:3,     lo:2,     hi:5,     volatility:0.040, exchange:'عالمي' },
        ECAT:  { unit:'USD/piece',  ref:120,   lo:80,    hi:180,   volatility:0.045, exchange:'عالمي' },
        SS304: { unit:'SAR/kg',     ref:3.5,   lo:2.8,   hi:4.5,   volatility:0.015, exchange:'محلي' },
        BAT:   { unit:'SAR/kg',     ref:0.8,   lo:0.5,   hi:1.2,   volatility:0.020, exchange:'محلي' },
    },

    // العروض الإقليمية (premium/discount vs global ref)
    REGIONAL_PREMIUMS: {
        KSA:    { cu: +50,  al: +30,  fe: +40,  desc: 'السوق السعودي' },
        UAE:    { cu: +60,  al: +40,  fe: +50,  desc: 'سوق الإمارات'  },
        KUWAIT: { cu: +45,  al: +25,  fe: +35,  desc: 'السوق الكويتي' },
        TURKEY: { cu: +20,  al: +10,  fe: +15,  desc: 'السوق التركي'  },
        INDIA:  { cu: -10,  al: -20,  fe: -30,  desc: 'السوق الهندي'  },
        CHINA:  { cu: -30,  al: -40,  fe: -50,  desc: 'السوق الصيني'  },
    },

    // تكاليف نقل إرشادية (USD/ton)
    FREIGHT: {
        localTruck:   5,
        GCCTruck:    30,
        seaGCC:      35,
        seaIndia:    50,
        seaChina:    60,
        airCargo:   400,
    },

    islamicNote: '«البيعان بالخيار ما لم يتفرقا» — حرية السوق الحقيقية',
};

// ══════════════════════════════════════════════════════════════════════════════
// §2 — PRICE_ENGINE
//      محاكاة حركة الأسعار الفنية (random walk حول المرجع)
// ══════════════════════════════════════════════════════════════════════════════

class PriceEngine {
    constructor() {
        // تاريخ الأسعار لكل رمز
        this.history = {};
        this._init();
    }

    _init() {
        for (const [sym, cfg] of Object.entries(MARKET_CONFIG.PRICES)) {
            this.history[sym] = this._generateHistory(cfg, 30); // 30 نقطة
        }
    }

    _generateHistory(cfg, points) {
        const data = [];
        let price = cfg.ref;
        for (let i = points; i >= 0; i--) {
            const change = (Math.random() - 0.5) * 2 * cfg.volatility * price;
            price = Math.max(cfg.lo, Math.min(cfg.hi, price + change));
            data.push({
                t: Date.now() - i * 3600000, // ساعة لكل نقطة
                p: Math.round(price * 100) / 100,
                v: Math.floor(Math.random() * 500 + 100), // حجم وهمي
            });
        }
        return data;
    }

    // السعر الحالي (آخر نقطة)
    getCurrentPrice(sym) {
        const h = this.history[sym];
        if (!h || !h.length) return null;
        return h[h.length - 1].p;
    }

    // تحديث الأسعار (نبضة)
    tick() {
        const updated = {};
        for (const [sym, cfg] of Object.entries(MARKET_CONFIG.PRICES)) {
            const h    = this.history[sym];
            const last = h[h.length - 1].p;
            const change = (Math.random() - 0.5) * 2 * cfg.volatility * last;
            const next = Math.max(cfg.lo, Math.min(cfg.hi, last + change));
            const point = { t: Date.now(), p: Math.round(next * 100) / 100, v: Math.floor(Math.random() * 500 + 100) };
            h.push(point);
            if (h.length > 100) h.shift(); // احتفظ بآخر 100 نقطة
            updated[sym] = point.p;
        }
        return updated;
    }

    // OHLC آخر N نقطة
    getOHLC(sym, n = 24) {
        const h = this.history[sym] || [];
        const slice = h.slice(-n);
        if (!slice.length) return null;
        const prices = slice.map(x => x.p);
        return {
            open:  prices[0],
            high:  Math.max(...prices),
            low:   Math.min(...prices),
            close: prices[prices.length - 1],
            change:  prices[prices.length - 1] - prices[0],
            changePct: Math.round((prices[prices.length - 1] / prices[0] - 1) * 10000) / 100,
            volume:  slice.reduce((s, x) => s + x.v, 0),
        };
    }

    // قائمة الأسعار الحالية
    getAllPrices() {
        const result = {};
        for (const sym of Object.keys(MARKET_CONFIG.PRICES)) {
            const ohlc = this.getOHLC(sym, 24);
            result[sym] = {
                price:   this.getCurrentPrice(sym),
                unit:    MARKET_CONFIG.PRICES[sym].unit,
                exchange:MARKET_CONFIG.PRICES[sym].exchange,
                ohlc,
            };
        }
        return result;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §3 — TradingSignalAnalyzer
//      إشارات تقنية — للمعلومة فقط، ليست فتوى ولا توصية استثمارية ملزمة
// ══════════════════════════════════════════════════════════════════════════════

class TradingSignalAnalyzer {
    constructor(priceEngine) {
        this.priceEngine = priceEngine;
    }

    // المتوسط المتحرك البسيط SMA
    _sma(prices, n) {
        if (prices.length < n) return null;
        const slice = prices.slice(-n);
        return slice.reduce((s, x) => s + x, 0) / n;
    }

    // RSI بسيط
    _rsi(prices, period = 14) {
        if (prices.length < period + 1) return null;
        const slice = prices.slice(-(period + 1));
        let gains = 0, losses = 0;
        for (let i = 1; i < slice.length; i++) {
            const diff = slice[i] - slice[i - 1];
            if (diff > 0) gains += diff; else losses -= diff;
        }
        const rs = gains / (losses || 1);
        return Math.round(100 - 100 / (1 + rs));
    }

    // إشارة لمعدن واحد
    analyzeSymbol(sym) {
        const h = this.priceEngine.history[sym];
        if (!h || h.length < 20) return null;
        const prices = h.map(x => x.p);
        const last  = prices[prices.length - 1];
        const sma7  = this._sma(prices, 7);
        const sma20 = this._sma(prices, 20);
        const rsi   = this._rsi(prices, 14);
        const cfg   = MARKET_CONFIG.PRICES[sym];

        // إشارة بسيطة
        let signal, strength, rationale;
        if (last < cfg.lo * 1.05) {
            signal = 'POSSIBLE_BUY'; strength = 'قوية'; rationale = 'السعر قرب الحد الأدنى التاريخي';
        } else if (last > cfg.hi * 0.95) {
            signal = 'POSSIBLE_SELL'; strength = 'قوية'; rationale = 'السعر قرب الحد الأعلى التاريخي';
        } else if (sma7 && sma20 && sma7 > sma20 && rsi && rsi < 65) {
            signal = 'POSSIBLE_BUY'; strength = 'متوسطة'; rationale = 'تقاطع SMA7 فوق SMA20 — اتجاه صاعد';
        } else if (sma7 && sma20 && sma7 < sma20 && rsi && rsi > 60) {
            signal = 'POSSIBLE_SELL'; strength = 'متوسطة'; rationale = 'تقاطع SMA7 تحت SMA20 — اتجاه هابط';
        } else {
            signal = 'HOLD'; strength = 'محايدة'; rationale = 'السوق في نطاق متوازن';
        }

        return {
            sym, signal, strength, rationale,
            price: last, sma7, sma20, rsi,
            disclaimer: '⚠️ للمعلومة فقط — ليس توصية استثمارية — استشر أهل الخبرة',
            islamicNote: '«لا تبع ما ليس عندك» — لا بيع ما لا تملك',
        };
    }

    // كل الإشارات
    analyzeAll() {
        return Object.keys(MARKET_CONFIG.PRICES).map(sym => this.analyzeSymbol(sym)).filter(Boolean);
    }

    // أفضل الفرص (POSSIBLE_BUY فقط)
    getBuyOpportunities() {
        return this.analyzeAll().filter(s => s.signal === 'POSSIBLE_BUY');
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §4 — ScrapSpreadAnalyzer
//      تحليل الفارق الاقتصادي: سكراب → نقي
// ══════════════════════════════════════════════════════════════════════════════

class ScrapSpreadAnalyzer {
    constructor(priceEngine) {
        this.priceEngine = priceEngine;
    }

    // الفارق الاقتصادي لتحويل السكراب إلى معدن نقي
    analyzeSpread(scrapSym, metalSym, purityPct, processingCost) {
        const scrapP = this.priceEngine.getCurrentPrice(scrapSym);
        const metalP = this.priceEngine.getCurrentPrice(metalSym);
        if (!scrapP || !metalP) return null;

        const recoveredMetal = scrapP * (purityPct / 100);
        const grossMargin    = metalP - recoveredMetal - processingCost;
        const marginPct      = Math.round((grossMargin / metalP) * 10000) / 100;

        return {
            scrapSym,
            metalSym,
            scrapPrice:       scrapP,
            metalPrice:       metalP,
            purityPct,
            processingCost,
            recoveredMetal:   Math.round(recoveredMetal * 100) / 100,
            grossMargin:      Math.round(grossMargin * 100) / 100,
            marginPct,
            verdict:          marginPct > 15 ? '✅ مربح' : marginPct > 5 ? '⚡ هامش ضيق' : '❌ خسارة',
            islamicNote:      '«لا غش ولا تدليس» — الصدق في نسبة النقاء',
        };
    }

    // أبرز الفوارق
    topSpreads() {
        return [
            this.analyzeSpread('BIRCH',  'Cu',    99, 500),
            this.analyzeSpread('HMS1',   'Fe',    98, 80),
            this.analyzeSpread('TWITCH', 'Al',    88, 250),
            this.analyzeSpread('SS304',  'Ni',    8,  300),
            this.analyzeSpread('ZORBA',  'Al',    45, 400),
            this.analyzeSpread('PCB',    'Cu',    15, 800),
            this.analyzeSpread('ECAT',   'Pt',    0.2, 50),
        ].filter(Boolean).sort((a, b) => b.marginPct - a.marginPct);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §5 — RFQMatcher
//      مطابقة طلبات الأسعار — منصة البيع والشراء الإسلامية
// ══════════════════════════════════════════════════════════════════════════════

class RFQMatcher {
    constructor() {
        this.rfqBook   = new Map(); // id → RFQ
        this.offerBook = new Map(); // id → Offer
        this.matches   = [];
        this.counter   = 0;
    }

    // إضافة طلب شراء
    addBuyRFQ({ buyerId, material, quantityTon, priceLimit, currency = 'SAR', destination, notes = '' }) {
        const id = `RFQ-${++this.counter}-${Date.now()}`;
        const rfq = { id, type: 'BUY', buyerId, material, quantityTon, priceLimit, currency, destination, notes, status: 'open', ts: new Date().toISOString() };
        this.rfqBook.set(id, rfq);
        this._tryMatch(id, rfq);
        return { id, message: `طلب شراء RFQ: ${material} ${quantityTon}t — ${rfq.id}` };
    }

    // إضافة عرض بيع
    addSellOffer({ sellerId, material, quantityTon, priceFloor, currency = 'SAR', origin, notes = '' }) {
        const id = `OFR-${++this.counter}-${Date.now()}`;
        const offer = { id, type: 'SELL', sellerId, material, quantityTon, priceFloor, currency, origin, notes, status: 'open', ts: new Date().toISOString() };
        this.offerBook.set(id, offer);
        this._tryMatch(null, null, id, offer);
        return { id, message: `عرض بيع: ${material} ${quantityTon}t — ${offer.id}` };
    }

    // محاولة المطابقة
    _tryMatch(rfqId = null, rfq = null, offerId = null, offer = null) {
        // بحث في كل المجموعتين عن مطابقة
        for (const r of this.rfqBook.values()) {
            for (const o of this.offerBook.values()) {
                if (r.status !== 'open' || o.status !== 'open') continue;
                if (r.material !== o.material) continue;
                if (r.priceLimit < o.priceFloor) continue;
                const matchPrice = Math.round((r.priceLimit + o.priceFloor) / 2 * 100) / 100;
                const matchQty   = Math.min(r.quantityTon, o.quantityTon);
                const match = {
                    id:          `MATCH-${Date.now()}`,
                    rfqId:       r.id,
                    offerId:     o.id,
                    material:    r.material,
                    quantityTon: matchQty,
                    matchPrice,
                    currency:    r.currency,
                    ts:          new Date().toISOString(),
                    islamicNote: '«البيعان بالخيار ما لم يتفرقا» — المطابقة مبدئية فقط',
                };
                this.matches.push(match);
                r.status = 'matched';
                o.status = 'matched';
                return match;
            }
        }
        return null;
    }

    getStatus() {
        return {
            openRFQs:   [...this.rfqBook.values()].filter(x => x.status === 'open').length,
            openOffers: [...this.offerBook.values()].filter(x => x.status === 'open').length,
            totalMatches: this.matches.length,
            recentMatches: this.matches.slice(-5),
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §6 — IslamicFinanceProducts
//      منتجات تمويل إسلامية للمعادن والسكراب
// ══════════════════════════════════════════════════════════════════════════════

class IslamicFinanceProducts {
    // المرابحة — تمويل شراء المعادن
    murabaha({ principal, profitRate, months }) {
        if (principal <= 0 || profitRate <= 0 || months <= 0) return { error: 'مدخلات غير صحيحة' };
        if (profitRate > 0.20) return { error: '«لا ضرر» — هامش الربح مرتفع جداً' };
        const totalProfit    = Math.round(principal * profitRate * (months / 12) * 100) / 100;
        const totalAmount    = principal + totalProfit;
        const monthlyPayment = Math.round(totalAmount / months * 100) / 100;
        return {
            product:        'مرابحة',
            definition:     'شراء السلعة بالأجل مع هامش ربح معلوم',
            principal,
            profitRate:     `${profitRate * 100}%`,
            months,
            totalProfit,
            totalAmount,
            monthlyPayment,
            islamicConditions: [
                'السلعة يجب أن تكون موجودة عند العقد',
                'هامش الربح يُعلَن مسبقاً ولا يتغير',
                'يُمنع بيع الدَّين بالدَّين',
            ],
            ayah: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
        };
    }

    // الاستصناع — تمويل التصنيع المعدني
    istisna({ productDesc, totalCost, deliveryMonths, installments }) {
        return {
            product:        'استصناع',
            definition:     'عقد لتصنيع سلعة بمواصفات محددة وتسليم مؤجل',
            productDesc,
            totalCost,
            deliveryMonths,
            installments,
            installmentAmount: Math.round(totalCost / installments * 100) / 100,
            conditions: [
                'تحديد المواصفات بالكامل',
                'الثمن يُدفع على أقساط أو عند التسليم',
                'يُمنع إعادة البيع قبل القبض',
            ],
            ayah: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ﴾',
        };
    }

    // السلم — شراء المعادن بثمن عاجل وتسليم آجل
    salam({ material, quantityTon, unitPrice, deliveryDate, currency = 'SAR' }) {
        const totalPrice = Math.round(quantityTon * unitPrice * 100) / 100;
        return {
            product:    'بيع السلم',
            definition: 'دفع الثمن كاملاً الآن مقابل تسليم السلعة لاحقاً',
            material,
            quantityTon,
            unitPrice,
            totalPrice,
            currency,
            deliveryDate,
            conditions: [
                'دفع الثمن كاملاً في مجلس العقد',
                'تحديد نوع ووزن وجودة المعدن',
                'تحديد تاريخ ومكان التسليم بدقة',
                'المعدن يجب أن يكون متوفراً بحجمه عند التسليم',
            ],
            hadith: '«مَنْ أَسْلَفَ فِي شَيْءٍ فَفِي كَيْلٍ مَعْلُومٍ وَوَزْنٍ مَعْلُومٍ إِلَى أَجَلٍ مَعْلُومٍ»',
        };
    }

    // حساب الزكاة على مخزون المعادن
    zakah({ goldGrams, silverGrams, cashSAR, tradeStockSAR, goldPriceSar, silverPriceSar }) {
        const NISAB_GOLD_G   = 85;   // نصاب الذهب
        const NISAB_SILVER_G = 595;  // نصاب الفضة
        const ZAKAH_RATE     = 0.025;

        const goldValue   = goldGrams   * (goldPriceSar   || 290);  // تقريباً
        const silverValue = silverGrams * (silverPriceSar || 3.5);
        const totalAssets = goldValue + silverValue + (cashSAR || 0) + (tradeStockSAR || 0);
        const nisabValue  = NISAB_GOLD_G * (goldPriceSar || 290);

        const zakatDue    = totalAssets >= nisabValue ? Math.round(totalAssets * ZAKAH_RATE * 100) / 100 : 0;

        return {
            product:        'حساب الزكاة',
            totalAssets:    Math.round(totalAssets * 100) / 100,
            nisabValue:     Math.round(nisabValue * 100) / 100,
            meetsNisab:     totalAssets >= nisabValue,
            zakatDue,
            breakdown:      { goldValue: Math.round(goldValue), silverValue: Math.round(silverValue), cashSAR: cashSAR || 0, tradeStockSAR: tradeStockSAR || 0 },
            note:           'الزكاة ركن من أركان الإسلام — تُخرج في رأس السنة الهجرية',
            ayah:           '﴿وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ﴾',
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §7 — RegionalMarketComparator
//      مقارنة أسواق المنطقة — أين أفضل مكان للبيع؟
// ══════════════════════════════════════════════════════════════════════════════

class RegionalMarketComparator {
    constructor(priceEngine) {
        this.priceEngine = priceEngine;
    }

    compareMarkets(sym) {
        const basePrice = this.priceEngine.getCurrentPrice(sym);
        if (!basePrice) return null;
        const markets = [];
        for (const [region, premiums] of Object.entries(MARKET_CONFIG.REGIONAL_PREMIUMS)) {
            const metalKey = sym.toLowerCase().slice(0, 2);
            const premium  = premiums[metalKey] || 0;
            const freight  = region === 'KSA' ? MARKET_CONFIG.FREIGHT.localTruck
                           : region === 'UAE' || region === 'KUWAIT' ? MARKET_CONFIG.FREIGHT.GCCTruck
                           : MARKET_CONFIG.FREIGHT.seaIndia;
            const netPrice = basePrice + premium - freight;
            markets.push({
                region,
                desc:     premiums.desc,
                basePrice,
                premium,
                freight,
                netPrice:   Math.round(netPrice * 100) / 100,
                margin:     Math.round(((netPrice - basePrice) / basePrice) * 10000) / 100,
            });
        }
        markets.sort((a, b) => b.netPrice - a.netPrice);
        return {
            sym,
            bestMarket:  markets[0],
            worstMarket: markets[markets.length - 1],
            markets,
        };
    }

    topDestinations(sym) {
        const cmp = this.compareMarkets(sym);
        return cmp ? cmp.markets.slice(0, 3) : [];
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §8 — RiskAnalyzer
//      مخاطر السعر والعملة والنقل — «لا غرر»
// ══════════════════════════════════════════════════════════════════════════════

class RiskAnalyzer {
    constructor(priceEngine) {
        this.priceEngine = priceEngine;
    }

    analyzeRisk(sym, quantityTon, holdingDays = 30) {
        const cfg      = MARKET_CONFIG.PRICES[sym];
        if (!cfg) return null;
        const price    = this.priceEngine.getCurrentPrice(sym) || cfg.ref;
        const value    = price * quantityTon;
        const dailyVol = cfg.volatility / Math.sqrt(252); // تقلب يومي
        const VaR95    = Math.round(value * dailyVol * 1.645 * Math.sqrt(holdingDays) * 100) / 100;
        const VaR99    = Math.round(value * dailyVol * 2.326 * Math.sqrt(holdingDays) * 100) / 100;
        const maxLoss  = Math.round(value * (1 - cfg.lo / price) * 100) / 100;

        let riskLevel;
        if (cfg.volatility > 0.030) riskLevel = 'عالي';
        else if (cfg.volatility > 0.018) riskLevel = 'متوسط';
        else riskLevel = 'منخفض';

        return {
            sym,
            quantityTon,
            currentPrice: price,
            portfolioValue: Math.round(value * 100) / 100,
            dailyVolatility: `${Math.round(dailyVol * 10000) / 100}%`,
            VaR95_30d: VaR95,
            VaR99_30d: VaR99,
            maxHistoricalLoss: maxLoss,
            riskLevel,
            hedgingAdvice:   riskLevel === 'عالي' ? 'يُنصح بالتحوط بعقود LME الآجلة' : 'التحوط اختياري',
            islamicNote:     '«لا غرر» — كشف الغرر واجب على التاجر',
        };
    }

    // مخاطر العملة USD/SAR
    currencyRisk(amountUsd) {
        const rate     = MARKET_CONFIG.FX.USDSAR;
        const sarValue = Math.round(amountUsd * rate * 100) / 100;
        const sensit   = Math.round(amountUsd * 0.01 * 100) / 100; // تأثير تغير 1 هللة
        return { amountUsd, rate, sarValue, sensitivityPerHalala: sensit, islamicNote: '﴿وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ﴾' };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §9 — MarketAlertSystem
//      نظام التنبيهات — سعر مستهدف + انحراف حاد
// ══════════════════════════════════════════════════════════════════════════════

class MarketAlertSystem {
    constructor(priceEngine) {
        this.priceEngine = priceEngine;
        this.alerts      = new Map();
        this.triggered   = [];
    }

    addAlert({ sym, targetPrice, direction = 'below', userId = 'system' }) {
        const id = `ALT-${Date.now()}`;
        this.alerts.set(id, { id, sym, targetPrice, direction, userId, active: true, ts: new Date().toISOString() });
        return id;
    }

    checkAlerts() {
        const fired = [];
        for (const alert of this.alerts.values()) {
            if (!alert.active) continue;
            const price = this.priceEngine.getCurrentPrice(alert.sym);
            if (!price) continue;
            const hit = (alert.direction === 'below' && price <= alert.targetPrice) ||
                        (alert.direction === 'above' && price >= alert.targetPrice);
            if (hit) {
                alert.active = false;
                const t = { ...alert, currentPrice: price, firedAt: new Date().toISOString() };
                this.triggered.push(t);
                fired.push(t);
            }
        }
        return fired;
    }

    // تنبيه انحراف حاد (>3% تغير في آخر 4 ساعات)
    scanForSpikes() {
        const spikes = [];
        for (const sym of Object.keys(MARKET_CONFIG.PRICES)) {
            const ohlc = this.priceEngine.getOHLC(sym, 4);
            if (!ohlc) continue;
            if (Math.abs(ohlc.changePct) > 3) {
                spikes.push({
                    sym,
                    changePct: ohlc.changePct,
                    direction: ohlc.changePct > 0 ? 'صعود حاد' : 'هبوط حاد',
                    message:   `${sym}: تحرك ${ohlc.changePct}% في آخر 4 ساعات`,
                });
            }
        }
        return spikes.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
    }

    summary() {
        return {
            activeAlerts:   [...this.alerts.values()].filter(a => a.active).length,
            triggeredToday: this.triggered.filter(t => t.firedAt > new Date(Date.now() - 86400000).toISOString()).length,
            spikes:         this.scanForSpikes().length,
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §10 — SheikhaMarketIntelligenceEngine
//       المحرك الرئيسي — يجمع كل المحللين
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaMarketIntelligenceEngine extends EventEmitter {
    constructor() {
        super();
        this.version         = '1.0.0';
        this.bism            = 'بسم الله الرحمن الرحيم';
        this.priceEngine     = new PriceEngine();
        this.signalAnalyzer  = new TradingSignalAnalyzer(this.priceEngine);
        this.spreadAnalyzer  = new ScrapSpreadAnalyzer(this.priceEngine);
        this.rfqMatcher      = new RFQMatcher();
        this.islamicFinance  = new IslamicFinanceProducts();
        this.regionalCompar  = new RegionalMarketComparator(this.priceEngine);
        this.riskAnalyzer    = new RiskAnalyzer(this.priceEngine);
        this.alertSystem     = new MarketAlertSystem(this.priceEngine);
        this.isInitialized   = false;
        this.tickCount       = 0;
        this.tickInterval    = null;

        // تنبيهات افتراضية عند التشغيل
        this._seedDefaultAlerts();
    }

    _seedDefaultAlerts() {
        this.alertSystem.addAlert({ sym:'Cu',    targetPrice: MARKET_CONFIG.PRICES.Cu.lo * 1.05,    direction:'below' });
        this.alertSystem.addAlert({ sym:'Fe',    targetPrice: MARKET_CONFIG.PRICES.Fe.hi * 0.95,    direction:'above' });
        this.alertSystem.addAlert({ sym:'HMS1',  targetPrice: MARKET_CONFIG.PRICES.HMS1.hi * 0.92,  direction:'above' });
        this.alertSystem.addAlert({ sym:'BIRCH', targetPrice: MARKET_CONFIG.PRICES.BIRCH.lo * 1.08, direction:'below' });
    }

    initialize() {
        this.isInitialized = true;
        // نبضة كل 5 دقائق
        this.tickInterval = setInterval(() => {
            this.tickCount++;
            const prices = this.priceEngine.tick();
            const fired  = this.alertSystem.checkAlerts();
            this.emit('tick', { tick: this.tickCount, prices, alerts: fired });
        }, 300000);
        console.log('✅ [ACTIVE] sheikha-market-intelligence-engine.js — محرك استخبارات السوق جاهز');
        return this;
    }

    stopTicking() {
        if (this.tickInterval) { clearInterval(this.tickInterval); this.tickInterval = null; }
    }

    // ─── API helpers ───

    getDashboard() {
        const allPrices = this.priceEngine.getAllPrices();
        const signals   = this.signalAnalyzer.analyzeAll();
        const spreads   = this.spreadAnalyzer.topSpreads();
        const buys      = signals.filter(s => s.signal === 'POSSIBLE_BUY');
        const spikes    = this.alertSystem.scanForSpikes();
        const rfq       = this.rfqMatcher.getStatus();
        const alertSumm = this.alertSystem.summary();

        return {
            ts:          new Date().toISOString(),
            bism:        this.bism,
            tickers:     Object.keys(allPrices).length,
            buySignals:  buys.length,
            topSpread:   spreads[0] || null,
            rfq,
            alerts:      alertSumm,
            spikes,
            islamicPrinciple: '«التاجر الصدوق مع النبيين والصديقين والشهداء»',
        };
    }

    getAllPrices()           { return this.priceEngine.getAllPrices(); }
    getSignals()             { return this.signalAnalyzer.analyzeAll(); }
    getSpreads()             { return this.spreadAnalyzer.topSpreads(); }
    getRFQStatus()           { return this.rfqMatcher.getStatus(); }
    compareMarkets(sym)      { return this.regionalCompar.compareMarkets(sym); }
    getRisk(sym, qty)        { return this.riskAnalyzer.analyzeRisk(sym, qty); }
    getAlerts()              { return this.alertSystem.summary(); }
    getSpikes()              { return this.alertSystem.scanForSpikes(); }

    murabaha(params)         { return this.islamicFinance.murabaha(params); }
    istisna(params)          { return this.islamicFinance.istisna(params); }
    salam(params)            { return this.islamicFinance.salam(params); }
    zakah(params)            { return this.islamicFinance.zakah(params); }

    addRFQ(params)           { return this.rfqMatcher.addBuyRFQ(params); }
    addOffer(params)         { return this.rfqMatcher.addSellOffer(params); }

    addPriceAlert(params)    { return this.alertSystem.addAlert(params); }

    getStatus() {
        return {
            system:        'SHEIKHA Market Intelligence Engine',
            version:       this.version,
            isInitialized: this.isInitialized,
            isLive:        !!this.tickInterval,
            tickCount:     this.tickCount,
            tickers:       Object.keys(MARKET_CONFIG.PRICES).length,
            metrics: {
                buySignals:       this.signalAnalyzer.getBuyOpportunities().length,
                topSpreadMargin:  this.spreadAnalyzer.topSpreads()[0]?.marginPct || 0,
                rfqOpen:          this.rfqMatcher.getStatus().openRFQs,
                offersOpen:       this.rfqMatcher.getStatus().openOffers,
                activeAlerts:     this.alertSystem.summary().activeAlerts,
                spikes:           this.alertSystem.scanForSpikes().length,
            },
            islamicPrinciple: '«من غشنا فليس منا» — صدق المعلومة واجب',
            timestamp: new Date().toISOString(),
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §11 — التصدير
// ══════════════════════════════════════════════════════════════════════════════

const engineInstance = new SheikhaMarketIntelligenceEngine();

module.exports = {
    SheikhaMarketIntelligenceEngine,
    PriceEngine,
    TradingSignalAnalyzer,
    ScrapSpreadAnalyzer,
    RFQMatcher,
    IslamicFinanceProducts,
    RegionalMarketComparator,
    RiskAnalyzer,
    MarketAlertSystem,
    MARKET_CONFIG,
    engine:       engineInstance,
    init()        { return engineInstance.initialize(); },
    getStatus()   { return engineInstance.getStatus(); },
    getDashboard(){ return engineInstance.getDashboard(); },
    getAllPrices() { return engineInstance.getAllPrices(); },
    getSignals()  { return engineInstance.getSignals(); },
    getSpreads()  { return engineInstance.getSpreads(); },
    version:      '1.0.0',
    bism:         'بسم الله الرحمن الرحيم',
};
