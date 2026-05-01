/**
 * ♻️🌍 منظومة شيخة — البورصة العالمية الدولية للمعادن والذهب والفضة والسكراب
 * بسم الله الرحمن الرحيم
 * وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة 275
 *
 * Global Exchange Routes:
 *   GET  /api/exchange/overview          — نظرة عامة على البورصات العالمية
 *   GET  /api/exchange/prices/live       — أسعار لحظية لكل المعادن
 *   GET  /api/exchange/prices/:metal     — سعر معدن محدد
 *   GET  /api/exchange/prices/history    — تاريخ أسعار
 *   GET  /api/exchange/exchanges         — قائمة البورصات العالمية
 *   GET  /api/exchange/exchanges/:id     — تفاصيل بورصة
 *   GET  /api/exchange/gold              — بورصة الذهب التفصيلية
 *   GET  /api/exchange/silver            — بورصة الفضة
 *   GET  /api/exchange/scrap             — بورصة الخردة العالمية
 *   GET  /api/exchange/incoterms         — دليل إنكوترمز 2020
 *   GET  /api/exchange/incoterms/:code   — شرح إنكوترم محدد
 *   GET  /api/exchange/hs-codes          — رموز HS المعادن
 *   GET  /api/exchange/freight           — أسعار الشحن العالمية
 *   GET  /api/exchange/currencies        — أسعار العملات مقابل الريال
 *   GET  /api/exchange/regions           — مناطق التجارة العالمية
 *   GET  /api/exchange/trade-flows       — تدفقات التجارة العالمية
 *   POST /api/exchange/price-calculator  — حاسبة السعر الشيخة
 *   POST /api/exchange/zakat-precious    — زكاة الذهب والفضة
 *   GET  /api/exchange/sheikha-index     — مؤشر شيخة العالمي
 *   GET  /api/exchange/islamic-finance   — أدوات التمويل الإسلامي
 *   GET  /api/exchange/health            — فحص صحة المسار
 */

'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// ── تحميل البيانات ──────────────────────────────────────────────────────────
let exchangeData = {};
let legislationData = {};
try {
    const exPath = path.join(__dirname, '../data/global-exchange-data.json');
    const lgPath = path.join(__dirname, '../data/international-trade-legislation.json');
    if (fs.existsSync(exPath)) exchangeData = JSON.parse(fs.readFileSync(exPath, 'utf8'));
    if (fs.existsSync(lgPath)) legislationData = JSON.parse(fs.readFileSync(lgPath, 'utf8'));
} catch (e) {
    console.warn('[GlobalExchange] تحذير تحميل البيانات:', e.message);
}

// ── محاكاة تحركات السعر اللحظية ─────────────────────────────────────────────
function simulateLivePrice(base, volatility = 0.005) {
    const change = (Math.random() - 0.5) * 2 * volatility;
    return parseFloat((base * (1 + change)).toFixed(2));
}

function getLivePricesAll() {
    const metals = exchangeData.metals || {};
    const forex = exchangeData.currency_rates_sar || {};
    const usdToSar = forex.USD || 3.75;
    const now = new Date().toISOString();

    const prices = {};
    for (const [key, m] of Object.entries(metals)) {
        if (m.benchmarkPrice_usd_oz) {
            const liveUSD = simulateLivePrice(m.benchmarkPrice_usd_oz, 0.004);
            prices[key] = {
                metal: m.nameAr,
                symbol: m.symbol,
                unit: m.unitAr || 'أوقية تروي',
                price_usd: liveUSD,
                price_sar: parseFloat((liveUSD * usdToSar).toFixed(2)),
                price_sar_gram: parseFloat(((liveUSD * usdToSar) / 31.1035).toFixed(4)),
                change_24h_pct: parseFloat(((Math.random() - 0.5) * 3).toFixed(2)),
                exchanges: m.primaryExchanges || [],
                timestamp: now
            };
        } else if (m.benchmarkPrice_usd_ton) {
            const base =
                typeof m.benchmarkPrice_usd_ton === 'object'
                    ? m.benchmarkPrice_usd_ton[Object.keys(m.benchmarkPrice_usd_ton)[0]]
                    : m.benchmarkPrice_usd_ton;
            const liveUSD = simulateLivePrice(base, 0.006);
            prices[key] = {
                metal: m.nameAr,
                symbol: m.symbol,
                unit: 'طن متري',
                price_usd: liveUSD,
                price_sar: parseFloat((liveUSD * usdToSar).toFixed(2)),
                change_24h_pct: parseFloat(((Math.random() - 0.5) * 2.5).toFixed(2)),
                exchanges: m.primaryExchanges || [],
                timestamp: now
            };
        }
    }
    return prices;
}

// ── نقاط نهاية API ──────────────────────────────────────────────────────────

/**
 * GET /api/exchange/overview
 * نظرة عامة على منظومة البورصة العالمية
 */
router.get('/overview', (req, res) => {
    const exchanges = exchangeData.exchanges || {};
    const metals = exchangeData.metals || {};
    const indices = exchangeData.price_indices || {};

    res.json({
        success: true,
        message: 'منظومة شيخة — البورصة العالمية للمعادن والسكراب والذهب والفضة',
        data: {
            title: 'البورصة العالمية الدولية — شيخة',
            subtitle: 'مرجع أسعار المعادن والسكراب والمعادن الثمينة',
            quran: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة 275',
            exchanges_count: Object.keys(exchanges).length,
            metals_tracked: Object.keys(metals).length,
            price_indices_count: Object.keys(indices).length,
            exchanges: Object.values(exchanges).map(ex => ({
                id: ex.id,
                name: ex.nameAr,
                country: ex.country,
                city: ex.city,
                metals: ex.metals?.length || 0
            })),
            price_indices: Object.values(indices).map(idx => ({
                id: idx.id,
                name: idx.nameAr || idx.name,
                coverage: Array.isArray(idx.coverage) ? idx.coverage : []
            })),
            note: 'للمعرفة والاسترشاد فقط — ليس تسعيراً إلزامياً',
            shariah_note: 'التجارة حلال بشروطها الشرعية — إنما البيع عن تراضٍ'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/prices/live
 * أسعار لحظية محاكاة لكل المعادن
 */
router.get('/prices/live', (req, res) => {
    const prices = getLivePricesAll();
    const forex = exchangeData.currency_rates_sar || {};

    res.json({
        success: true,
        message: 'أسعار المعادن اللحظية — محاكاة استرشادية',
        data: {
            prices,
            forex_rates_sar: forex,
            note: 'أسعار استرشادية محاكاة — مستندة إلى LME/COMEX/SHFE — للمعرفة فقط',
            lbma_gold_fix: 'الذهب يُحدَّد مرتين يومياً بتوقيت لندن: 10:30 و 15:00',
            refresh_interval_seconds: 15
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/prices/:metal
 * سعر معدن بعينه بالتفصيل
 */
router.get('/prices/:metal', (req, res) => {
    const metalId = req.params.metal.toLowerCase();
    const metals = exchangeData.metals || {};
    const metal = metals[metalId];
    const forex = exchangeData.currency_rates_sar || {};
    const usdToSar = forex.USD || 3.75;

    if (!metal) {
        const available = Object.keys(metals).join(', ');
        return res.status(404).json({
            success: false,
            message: `المعدن '${metalId}' غير موجود`,
            available_metals: available
        });
    }

    let liveData = {};
    if (metal.benchmarkPrice_usd_oz) {
        const live = simulateLivePrice(metal.benchmarkPrice_usd_oz, 0.004);
        liveData = {
            price_usd_oz: live,
            price_sar_oz: parseFloat((live * usdToSar).toFixed(2)),
            price_sar_gram: parseFloat(((live * usdToSar) / 31.1035).toFixed(4)),
            price_usd_kg: parseFloat((live / 0.031103).toFixed(2))
        };
    } else if (metal.benchmarkPrice_usd_ton) {
        const base =
            typeof metal.benchmarkPrice_usd_ton === 'object'
                ? Object.entries(metal.benchmarkPrice_usd_ton).map(([k, v]) => ({
                      grade: k,
                      price_usd: v,
                      price_sar: parseFloat((v * usdToSar).toFixed(2))
                  }))
                : simulateLivePrice(metal.benchmarkPrice_usd_ton, 0.005);
        liveData = { price_data: base, unit: 'USD/طن متري' };
    }

    // بناء تاريخ أسعار محاكى لـ 30 يوماً
    const basePrice =
        metal.benchmarkPrice_usd_oz ||
        (typeof metal.benchmarkPrice_usd_ton === 'number' ? metal.benchmarkPrice_usd_ton : 1000);
    const history30d = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
            date: d.toISOString().split('T')[0],
            price_usd: simulateLivePrice(basePrice, 0.012)
        };
    });

    res.json({
        success: true,
        data: {
            ...metal,
            live: liveData,
            history_30d: history30d,
            forex: { USD_to_SAR: usdToSar },
            benchmark_date: metal.benchmarkDate || '2026-03-11',
            islamicStatus: metal.islamicStatus
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/prices/history
 * تاريخ أسعار افتراضي من 2020 إلى اليوم مع منعطفات رئيسية
 */
router.get('/prices/history', (req, res) => {
    const { metal = 'gold', years = 5 } = req.query;
    const metals = exchangeData.metals || {};
    const m = metals[metal];

    if (!m) {
        return res.status(404).json({ success: false, message: `معدن غير موجود: ${metal}` });
    }

    const basePrice =
        m.benchmarkPrice_usd_oz ||
        (typeof m.benchmarkPrice_usd_ton === 'number' ? m.benchmarkPrice_usd_ton : 2000);
    const numYears = Math.min(parseInt(years) || 5, 30);
    const monthlyData = [];
    let currentPrice = basePrice * 0.7; // نبدأ بسعر أقل

    for (let y = numYears; y >= 0; y--) {
        for (let m_ = 11; m_ >= 0; m_--) {
            const d = new Date();
            d.setFullYear(d.getFullYear() - y);
            d.setMonth(d.getMonth() - m_);
            currentPrice = simulateLivePrice(currentPrice, 0.04);
            // اتجاه نحو السعر الحالي تدريجياً
            currentPrice = currentPrice * 0.95 + basePrice * 0.05;
            monthlyData.push({
                date: d.toISOString().split('T')[0].substring(0, 7),
                price_usd: parseFloat(currentPrice.toFixed(2))
            });
        }
    }

    res.json({
        success: true,
        data: {
            metal: m.nameAr,
            symbol: m.symbol,
            unit: m.unitAr || 'طن متري',
            currency: 'USD',
            period_years: numYears,
            points: monthlyData.length,
            history: monthlyData,
            note: 'بيانات محاكاة استرشادية — للرسوم البيانية التوضيحية فقط'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/exchanges
 * قائمة البورصات العالمية
 */
router.get('/exchanges', (req, res) => {
    const exchanges = exchangeData.exchanges || {};
    res.json({
        success: true,
        data: Object.values(exchanges),
        count: Object.keys(exchanges).length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/exchanges/:id
 * تفاصيل بورصة واحدة
 */
router.get('/exchanges/:id', (req, res) => {
    const id = req.params.id.toUpperCase();
    const exchange = (exchangeData.exchanges || {})[id];
    if (!exchange) {
        return res.status(404).json({ success: false, message: `بورصة غير موجودة: ${id}` });
    }
    res.json({ success: true, data: exchange, timestamp: new Date().toISOString() });
});

/**
 * GET /api/exchange/gold
 * بورصة الذهب المفصلة
 */
router.get('/gold', (req, res) => {
    const gold = (exchangeData.metals || {}).gold || {};
    const forex = exchangeData.currency_rates_sar || {};
    const usdToSar = forex.USD || 3.75;
    const liveUSD = simulateLivePrice(gold.benchmarkPrice_usd_oz || 2650, 0.003);

    const purities = gold.purity_levels || {};
    const pricesPerPurity = {};
    for (const [key, p] of Object.entries(purities)) {
        const adjustedUSD = liveUSD * (p.fineness / 1000);
        pricesPerPurity[key] = {
            nameAr: p.nameAr,
            fineness: p.fineness,
            price_usd_oz: parseFloat(adjustedUSD.toFixed(2)),
            price_sar_gram: parseFloat(((adjustedUSD * usdToSar) / 31.1035).toFixed(3)),
            price_sar_mithqal: parseFloat((((adjustedUSD * usdToSar) / 31.1035) * 4.25).toFixed(3))
        };
    }

    res.json({
        success: true,
        message: 'بورصة الذهب — مرجع شيخة',
        data: {
            current_price_usd_oz: liveUSD,
            current_price_sar_gram: parseFloat(((liveUSD * usdToSar) / 31.1035).toFixed(3)),
            current_price_sar_oz: parseFloat((liveUSD * usdToSar).toFixed(2)),
            gold_silver_ratio: parseFloat((liveUSD / simulateLivePrice(30.5, 0.005)).toFixed(1)),
            prices_by_purity: pricesPerPurity,
            lbma_fixing: gold.LBMA_fixings,
            major_producers: gold.major_producers,
            major_consumers: gold.major_consumers,
            islamicRules: {
                zakat_nisab_grams: gold.nisab_grams,
                zakat_rate_pct: (gold.zakat_rate || 0.025) * 100,
                exchange_rule: 'ذهب بذهب: يد بيد مثلاً بمثل — الزيادة ربا',
                allow: 'بيع وشراء الذهب بالعملات مؤجلاً جائز',
                prohibit: 'ذهب بذهب مع تأجيل أو زيادة = ربا الفضل'
            },
            exchanges: (gold.primaryExchanges || [])
                .map(id => (exchangeData.exchanges || {})[id])
                .filter(Boolean)
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/silver
 * بورصة الفضة
 */
router.get('/silver', (req, res) => {
    const silver = (exchangeData.metals || {}).silver || {};
    const forex = exchangeData.currency_rates_sar || {};
    const usdToSar = forex.USD || 3.75;
    const liveUSD = simulateLivePrice(silver.benchmarkPrice_usd_oz || 30.5, 0.006);

    res.json({
        success: true,
        message: 'بورصة الفضة — مرجع شيخة',
        data: {
            current_price_usd_oz: liveUSD,
            current_price_sar_gram: parseFloat(((liveUSD * usdToSar) / 31.1035).toFixed(3)),
            current_price_sar_oz: parseFloat((liveUSD * usdToSar).toFixed(2)),
            purity_levels: silver.purity_levels,
            major_uses_pct: silver.major_uses_pct,
            islamicRules: {
                zakat_nisab_grams: silver.nisab_grams,
                zakat_rate_pct: (silver.zakat_rate || 0.025) * 100,
                exchange_rule: 'فضة بفضة: يد بيد مثلاً بمثل — الزيادة ربا',
                allow: 'بيع الفضة بالدولار والريال مؤجلاً جائز'
            }
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/scrap
 * بورصة الخردة العالمية
 */
router.get('/scrap', (req, res) => {
    const scrap = exchangeData.scrap_grades || {};
    const flows = exchangeData.global_trade_flows || {};
    const forex = exchangeData.currency_rates_sar || {};
    const usdToSar = forex.USD || 3.75;

    // بناء أسعار خردة محاكاة
    const isri = scrap.ISRI_codes || {};
    const livePrices = {};

    if (isri.steel) {
        livePrices.steel = {};
        for (const [k, v] of Object.entries(isri.steel)) {
            const base = v.price_usd_ton || 380;
            const live = simulateLivePrice(base, 0.015);
            livePrices.steel[k] = {
                ...v,
                price_usd_ton: live,
                price_sar_ton: parseFloat((live * usdToSar).toFixed(0))
            };
        }
    }

    if (isri.copper) {
        const copperLME = simulateLivePrice(9200, 0.006);
        livePrices.copper = {};
        for (const [k, v] of Object.entries(isri.copper)) {
            const discountFactor = 1 + (v.premiumVsLME || -10) / 100;
            const price = parseFloat((copperLME * discountFactor).toFixed(0));
            livePrices.copper[k] = {
                ...v,
                price_usd_ton: price,
                price_sar_ton: parseFloat((price * usdToSar).toFixed(0)),
                vs_lme: `${v.premiumVsLME > 0 ? '+' : ''}${v.premiumVsLME}%`
            };
        }
    }

    if (isri.aluminum) {
        const alLME = simulateLivePrice(2600, 0.006);
        livePrices.aluminum = {};
        for (const [k, v] of Object.entries(isri.aluminum)) {
            const discountFactor = 1 + (v.premiumVsLME || -20) / 100;
            const price = parseFloat((alLME * discountFactor).toFixed(0));
            livePrices.aluminum[k] = {
                ...v,
                price_usd_ton: price,
                price_sar_ton: parseFloat((price * usdToSar).toFixed(0))
            };
        }
    }

    res.json({
        success: true,
        message: 'بورصة الخردة العالمية — تصنيف ISRI/BIR',
        data: {
            live_prices: livePrices,
            purity_testing: scrap.purity_testing,
            trade_flows: {
                steel_scrap: flows.steel_scrap,
                copper_scrap: flows.copper_scrap
            },
            note: 'أسعار استرشادية — تتفاوت حسب الجودة والموقع والكميات',
            source_list: [
                'ISRI — محاور الخردة العالمية لأمريكا الشمالية',
                'BIR — برلين',
                'Platts / Fastmarkets — TSI'
            ]
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/incoterms
 * دليل إنكوترمز 2020 كاملاً
 */
router.get('/incoterms', (req, res) => {
    const inco = exchangeData.incoterms_2020 || {};
    const all = { ...(inco.any_mode || {}), ...(inco.sea_inland_waterway || {}) };

    res.json({
        success: true,
        message: 'قواعد إنكوترمز 2020 — ICC',
        data: {
            version: 'Incoterms® 2020',
            issuer: 'ICC — International Chamber of Commerce',
            total_rules: Object.keys(all).length,
            any_transport_mode: Object.values(inco.any_mode || {}),
            sea_and_inland_waterway: Object.values(inco.sea_inland_waterway || {}),
            most_used_metals: ['FOB', 'CIF', 'CFR', 'DAP', 'DDP'],
            tip: 'يجب دائماً تذكر المكان مع الشرط: FOB Jeddah — CIF Shanghai — DDP Hamburg'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/incoterms/:code
 * شرح إنكوترم محدد
 */
router.get('/incoterms/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    const inco = exchangeData.incoterms_2020 || {};
    const all = { ...(inco.any_mode || {}), ...(inco.sea_inland_waterway || {}) };
    const term = all[code];

    if (!term) {
        return res.status(404).json({
            success: false,
            message: `إنكوترم غير موجود: ${code}`,
            available: Object.keys(all)
        });
    }

    res.json({ success: true, data: term, timestamp: new Date().toISOString() });
});

/**
 * GET /api/exchange/hs-codes
 * رموز HS المعادن والسكراب
 */
router.get('/hs-codes', (req, res) => {
    const hs = exchangeData.hs_codes || {};
    const { category } = req.query;

    if (category && hs[category]) {
        return res.json({
            success: true,
            data: hs[category],
            category,
            timestamp: new Date().toISOString()
        });
    }

    res.json({
        success: true,
        message: 'رموز النظام المنسق HS للمعادن والسكراب',
        data: hs,
        categories: Object.keys(hs).filter(k => k !== '_info'),
        source: 'WCO — World Customs Organization',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/freight
 * أسعار الشحن البحري إلى الخليج
 */
router.get('/freight', (req, res) => {
    const freight = exchangeData.freight_rates || {};
    const forex = exchangeData.currency_rates_sar || {};
    const usdToSar = forex.USD || 3.75;

    const enriched = {};
    for (const [dest, routes] of Object.entries(freight)) {
        enriched[dest] = {};
        for (const [origin, data] of Object.entries(routes)) {
            enriched[dest][origin] = {
                ...data,
                cost_sar_ton: parseFloat((data.usd_ton * usdToSar).toFixed(2))
            };
        }
    }

    res.json({
        success: true,
        message: 'أسعار الشحن البحري التقريبية — USD/طن',
        data: enriched,
        note: 'أسعار تقديرية — تتغير حسب الموسم والطلب والناقل',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/currencies
 * أسعار العملات مقابل الريال السعودي
 */
router.get('/currencies', (req, res) => {
    const forex = exchangeData.currency_rates_sar || {};
    const rates = Object.entries(forex)
        .filter(([k]) => !k.startsWith('_') && !k.endsWith('_note') && !k.endsWith('_to_USD'))
        .map(([currency, rate]) => ({
            currency,
            rate_per_sar: parseFloat((1 / rate).toFixed(4)),
            sar_per_unit: rate,
            name: getCurrencyName(currency)
        }));

    res.json({
        success: true,
        data: rates,
        base: 'SAR',
        note: 'أسعار استرشادية — استخدم منصة التداول للأسعار الدقيقة',
        timestamp: new Date().toISOString()
    });
});

function getCurrencyName(code) {
    const names = {
        USD: 'دولار أمريكي',
        EUR: 'يورو',
        GBP: 'جنيه إسترليني',
        CNY: 'يوان صيني',
        JPY: 'ين ياباني',
        AED: 'درهم إماراتي',
        INR: 'روبية هندية',
        TRY: 'ليرة تركية'
    };
    return names[code] || code;
}

/**
 * GET /api/exchange/regions
 * مناطق التجارة العالمية للمعادن
 */
router.get('/regions', (req, res) => {
    const regions = exchangeData.world_regions || {};
    res.json({
        success: true,
        data: Object.values(regions),
        count: Object.keys(regions).length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/trade-flows
 * تدفقات التجارة العالمية للمعادن
 */
router.get('/trade-flows', (req, res) => {
    const flows = exchangeData.global_trade_flows || {};
    res.json({
        success: true,
        message: 'تدفقات تجارة المعادن والخردة العالمية',
        data: flows,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/exchange/price-calculator
 * حاسبة سعر شيخة الشاملة
 * Body: { metal, quantity_tons, origin_country, destination, incoterm, purity_grade }
 */
router.post('/price-calculator', (req, res) => {
    const {
        metal = 'copper',
        quantity_tons = 1,
        origin_country = 'SA',
        destination = 'to_jeddah',
        incoterm = 'FOB',
        purity_grade = 'No1',
        currency = 'SAR'
    } = req.body;

    const metals = exchangeData.metals || {};
    const m = metals[metal];
    const forex = exchangeData.currency_rates_sar || {};
    const usdToSar = forex.USD || 3.75;

    if (!m) {
        return res.status(400).json({ success: false, message: `معدن غير معروف: ${metal}` });
    }

    // السعر الأساسي
    let baseUSD = 0;
    if (m.benchmarkPrice_usd_oz) {
        baseUSD = m.benchmarkPrice_usd_oz * 32150.7; // oz/ton
    } else if (typeof m.benchmarkPrice_usd_ton === 'number') {
        baseUSD = m.benchmarkPrice_usd_ton;
    } else if (typeof m.benchmarkPrice_usd_ton === 'object') {
        baseUSD = Object.values(m.benchmarkPrice_usd_ton)[0] || 1000;
    }

    baseUSD = simulateLivePrice(baseUSD, 0.003);

    // خصم الجودة/الخردة
    let qualityDiscount = 0;
    if (m.scrapDiscount_pct) {
        qualityDiscount = m.scrapDiscount_pct[purity_grade] || 0;
    }

    const priceAfterQuality = baseUSD * (1 + qualityDiscount / 100);

    // تكلفة الشحن
    const freight = exchangeData.freight_rates || {};
    let freightCost = 0;
    const destFreight = freight[destination];
    if (destFreight) {
        const originKey = `from_${origin_country.toLowerCase()}_`;
        const matchKey = Object.keys(destFreight).find(k => k.startsWith(originKey));
        if (matchKey) freightCost = destFreight[matchKey].usd_ton || 0;
    }

    // حساب السعر حسب الإنكوترم
    let totalUSD = priceAfterQuality;
    if (['CIF', 'CFR', 'CPT', 'CIP', 'DAP', 'DDP'].includes(incoterm)) {
        totalUSD += freightCost;
    }

    const totalForQty = totalUSD * quantity_tons;
    const totalSAR = parseFloat((totalForQty * usdToSar).toFixed(2));

    // مؤشر شيخة
    const sheikhaIndex = parseFloat((totalUSD * 1.02).toFixed(2)); // هامش السوق المحلي 2%

    res.json({
        success: true,
        message: 'حاسبة الأسعار — مرجع استرشادي',
        data: {
            inputs: { metal, quantity_tons, origin_country, destination, incoterm, purity_grade },
            calculation: {
                base_price_usd_ton: parseFloat(baseUSD.toFixed(2)),
                quality_discount_pct: qualityDiscount,
                price_after_quality_usd_ton: parseFloat(priceAfterQuality.toFixed(2)),
                freight_cost_usd_ton: freightCost,
                incoterm_price_usd_ton: parseFloat(totalUSD.toFixed(2)),
                sheikha_index_usd_ton: sheikhaIndex,
                quantity_tons,
                total_usd: parseFloat(totalForQty.toFixed(2)),
                total_sar: totalSAR
            },
            breakdown: [
                { item: 'سعر LME الأساسي', value: `${baseUSD.toFixed(0)} USD/طن` },
                { item: 'خصم الجودة', value: `${qualityDiscount}%` },
                { item: 'تكلفة شحن تقديرية', value: `${freightCost} USD/طن` },
                { item: 'سعر الإنكوترم المختار', value: `${totalUSD.toFixed(0)} USD/طن` },
                { item: 'مؤشر شيخة (يشمل هامش محلي)', value: `${sheikhaIndex} USD/طن` },
                {
                    item: 'الإجمالي للكمية بالريال',
                    value: `${totalSAR.toLocaleString('ar-SA')} SAR`
                }
            ],
            disclaimer:
                'مرجع للاسترشاد فقط — ليس تسعيراً إلزامياً — للأسعار الدقيقة راجع البورصات الرسمية',
            shariah: m.islamicStatus || 'مباح بشروطه الشرعية'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/exchange/zakat-precious
 * حاسبة زكاة الذهب والفضة
 * Body: { metal, quantity_grams, holding_months, price_sar_gram }
 */
router.post('/zakat-precious', (req, res) => {
    const { metal = 'gold', quantity_grams = 0, holding_months = 12, price_sar_gram } = req.body;

    const metals = exchangeData.metals || {};
    const m = metals[metal];

    if (!m || !m.zakatable) {
        return res.status(400).json({
            success: false,
            message: `${metal} غير خاضع للزكاة أو غير موجود`
        });
    }

    const forex = exchangeData.currency_rates_sar || {};
    const usdToSar = forex.USD || 3.75;
    let pricePerGram = price_sar_gram;
    if (!pricePerGram && m.benchmarkPrice_usd_oz) {
        pricePerGram = parseFloat(((m.benchmarkPrice_usd_oz * usdToSar) / 31.1035).toFixed(3));
    }

    const nisab = m.nisab_grams || (metal === 'gold' ? 85 : 595);
    const zakatRate = m.zakat_rate || 0.025;
    const totalValue = quantity_grams * pricePerGram;
    const nisabValue = nisab * pricePerGram;
    const hasNisab = quantity_grams >= nisab;
    const hasHawl = holding_months >= 12;
    const zakatDue = hasNisab && hasHawl;
    const zakatAmount = zakatDue ? parseFloat((totalValue * zakatRate).toFixed(2)) : 0;

    res.json({
        success: true,
        message: 'حاسبة الزكاة — الذهب والفضة',
        data: {
            metal: m.nameAr,
            quantity_grams,
            price_sar_gram: pricePerGram,
            total_value_sar: parseFloat(totalValue.toFixed(2)),
            nisab_grams: nisab,
            nisab_value_sar: parseFloat(nisabValue.toFixed(2)),
            has_nisab: hasNisab,
            holding_months,
            has_hawl: hasHawl,
            zakat_due: zakatDue,
            zakat_rate_pct: zakatRate * 100,
            zakat_amount_sar: zakatAmount,
            result: zakatDue
                ? `تجب الزكاة: ${zakatAmount.toFixed(2)} ريال`
                : hasNisab
                  ? 'لم يكتمل الحَوْل — تابع للعام القادم'
                  : `لم يبلغ النصاب — النصاب ${nisab} غرام`,
            fiqh_note:
                metal === 'gold'
                    ? 'نصاب الذهب 85 غراماً 24 قيراطاً وفق قرار مجمع الفقه الإسلامي'
                    : 'نصاب الفضة 595 غراماً وفق المذاهب الأربعة'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/sheikha-index
 * مؤشر شيخة للمعادن
 */
router.get('/sheikha-index', (req, res) => {
    const indices = exchangeData.price_indices || {};
    const sheikha = indices.SheikhaIndex || {};
    const prices = getLivePricesAll();
    const forex = exchangeData.currency_rates_sar || {};
    const usdToSar = forex.USD || 3.75;

    // بناء مؤشر شيخة الكلي
    const indexComponents = [];
    let weightedSum = 0;
    const weights = { gold: 30, silver: 15, copper: 25, aluminum: 15, steel: 15 };

    for (const [metal, w] of Object.entries(weights)) {
        if (prices[metal]) {
            const price = prices[metal].price_usd || prices[metal].price_usd_oz || 0;
            indexComponents.push({ metal, weight_pct: w, price_usd: price });
            weightedSum += (price * w) / 100;
        }
    }

    res.json({
        success: true,
        message: 'مؤشر شيخة للمعادن — للمعرفة فقط',
        data: {
            index_name: sheikha.nameAr || 'مؤشر شيخة',
            methodology: sheikha.methodology,
            formula: sheikha.formula,
            components: indexComponents,
            weighted_average_usd: parseFloat(weightedSum.toFixed(2)),
            factors: sheikha.factors,
            note: sheikha.note || 'للمعرفة والاسترشاد فقط — ليس تسعيراً إلزامياً',
            live_prices_summary: prices
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/islamic-finance
 * أدوات التمويل الإسلامي للمعادن
 */
router.get('/islamic-finance', (req, res) => {
    const islamic = exchangeData.islamic_finance || {};
    res.json({
        success: true,
        message: 'أدوات التمويل الإسلامي لتجارة المعادن',
        data: {
            shariah_products: islamic.shariah_compliant_products || {},
            prohibitions: islamic.prohibitions || {},
            fatawa_references: islamic.fatawa_references || [],
            quran: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا الرِّبَا أَضْعَافًا مُّضَاعَفَةً — آل عمران 130',
            practical_tips: [
                'استخدم عقود المرابحة لتمويل الخردة والمعادن',
                'عقد الاستصناع للمعادن المصنعة مستقبلاً',
                'بيع السلم جائز في الخردة المتجانسة الجودة',
                'تأمين تكافل بدلاً من تأمين تجاري',
                'بيع الذهب بالريال: جائز ولو بتأجيل الريال'
            ]
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/exchange/health
 * فحص صحة المسار
 */
router.get('/health', (req, res) => {
    const has_exchange = Object.keys(exchangeData).length > 0;
    const has_legislation = Object.keys(legislationData).length > 0;
    const metals_count = Object.keys(exchangeData.metals || {}).length;
    const exchanges_count = Object.keys(exchangeData.exchanges || {}).length;

    res.json({
        success: true,
        status: has_exchange ? 'healthy' : 'degraded',
        data: {
            exchange_data_loaded: has_exchange,
            legislation_data_loaded: has_legislation,
            metals_count,
            exchanges_count,
            endpoints: 20,
            basePath: '/api/exchange'
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
