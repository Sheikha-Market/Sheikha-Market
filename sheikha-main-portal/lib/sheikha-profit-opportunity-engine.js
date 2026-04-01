/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  بسم الله الرحمن الرحيم                                                     ║
 * ║  SHEIKHA — محرك الربح والفرص التجارية                                       ║
 * ║  Profit & Trade Opportunity Engine                                          ║
 * ║                                                                              ║
 * ║  ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة 275            ║
 * ║  «التاجر الصدوق الأمين مع النبيين والصديقين والشهداء» — الترمذي            ║
 * ║                                                                              ║
 * ║  الهدف: تحقيق الربح الحلال + اكتشاف الفرص + خطط البيع                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const { performance } = require('perf_hooks');

// ═══════════════════════════════════════════════════════════
// §1 — بيانات أسعار السوق الحالية (معادن + سكراب)
// ═══════════════════════════════════════════════════════════

const MARKET_PRICES = {
    // أسعار السكراب والمعادن (ريال سعودي / طن)
    scrap: {
        'حديد_ثقيل':      { buyMin: 1200, buyMax: 1600, sellMin: 1900, sellMax: 2400, unit: 'طن', demand: 'عالي' },
        'حديد_خفيف':      { buyMin: 900,  buyMax: 1200, sellMin: 1400, sellMax: 1800, unit: 'طن', demand: 'متوسط' },
        'نحاس_نقي':       { buyMin: 28000,buyMax: 35000,sellMin: 38000,sellMax: 48000,unit: 'طن', demand: 'عالي جداً' },
        'نحاس_مشوب':      { buyMin: 18000,buyMax: 24000,sellMin: 28000,sellMax: 36000,unit: 'طن', demand: 'عالي' },
        'ألومنيوم_نقي':   { buyMin: 8000, buyMax: 11000,sellMin: 13000,sellMax: 17000,unit: 'طن', demand: 'عالي' },
        'ألومنيوم_بروفيل':{ buyMin: 6000, buyMax: 9000, sellMin: 10000,sellMax: 14000,unit: 'طن', demand: 'متوسط' },
        'استانلس':        { buyMin: 9000, buyMax: 13000,sellMin: 15000,sellMax: 20000,unit: 'طن', demand: 'عالي' },
        'بطاريات_سيارات': { buyMin: 2800, buyMax: 3500, sellMin: 4200, sellMax: 5500, unit: 'طن', demand: 'عالي جداً' },
        'زنك':            { buyMin: 7000, buyMax: 10000,sellMin: 12000,sellMax: 16000,unit: 'طن', demand: 'متوسط' },
        'رصاص':           { buyMin: 4500, buyMax: 6000, sellMin: 7500, sellMax: 10000,unit: 'طن', demand: 'منخفض' },
    },
    // أسعار عالمية (دولار / طن) — LME
    lme: {
        copper: 9800, aluminum: 2350, zinc: 2800, lead: 2100,
        nickel: 17500, tin: 28000, iron_ore: 110
    },
    // معامل تحويل الدولار للريال
    usdToSar: 3.75,
    updatedAt: new Date().toISOString()
};

// ═══════════════════════════════════════════════════════════
// §2 — محلل هامش الربح
// ═══════════════════════════════════════════════════════════

class ProfitMarginAnalyzer {

    // حساب هامش الربح لصفقة معينة
    analyze(material, buyPrice, quantity, sellPrice = null) {
        const ref = MARKET_PRICES.scrap[material];
        if (!ref) throw new Error(`المادة غير معروفة: ${material}`);

        // استخدام متوسط سعر البيع إذا لم يُحدد
        const actualSellPrice = sellPrice || Math.round((ref.sellMin + ref.sellMax) / 2);
        const revenue = actualSellPrice * quantity;
        const cost = buyPrice * quantity;
        const profit = revenue - cost;
        const margin = ((profit / revenue) * 100).toFixed(1);
        const roi = ((profit / cost) * 100).toFixed(1);

        // هل الصفقة جيدة؟
        const avgBuy = (ref.buyMin + ref.buyMax) / 2;
        const avgSell = (ref.sellMin + ref.sellMax) / 2;
        const benchmarkMargin = ((avgSell - avgBuy) / avgSell * 100).toFixed(1);

        return {
            material,
            quantity: `${quantity} ${ref.unit}`,
            buyPrice,
            sellPrice: actualSellPrice,
            cost,
            revenue,
            profit,
            marginPct: parseFloat(margin),
            roi: parseFloat(roi),
            benchmarkMarginPct: parseFloat(benchmarkMargin),
            isGoodDeal: parseFloat(margin) >= parseFloat(benchmarkMargin) * 0.8,
            islamicNote: profit > 0 ? 'ربح حلال — البيع عن تراضٍ' : 'تحذير: خسارة محتملة — راجع قبل البيع',
            verdict: this._verdict(parseFloat(roi))
        };
    }

    _verdict(roi) {
        if (roi >= 40) return '🏆 ممتاز — فرصة استثنائية';
        if (roi >= 25) return '✅ جيد جداً — صفقة مربحة';
        if (roi >= 15) return '👍 جيد — هامش معقول';
        if (roi >= 8)  return '⚠️ محدود — يحتاج تفاوض';
        return '❌ ضعيف — لا يُنصح';
    }

    // أفضل المواد ربحاً حالياً
    rankByProfit() {
        return Object.entries(MARKET_PRICES.scrap)
            .map(([name, p]) => {
                const avgBuy  = (p.buyMin + p.buyMax) / 2;
                const avgSell = (p.sellMin + p.sellMax) / 2;
                const margin  = ((avgSell - avgBuy) / avgSell * 100);
                const roi     = ((avgSell - avgBuy) / avgBuy * 100);
                return { name, avgBuy, avgSell, margin: margin.toFixed(1), roi: roi.toFixed(1), demand: p.demand };
            })
            .sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi));
    }
}

// ═══════════════════════════════════════════════════════════
// §3 — مولّد الفرص التجارية
// ═══════════════════════════════════════════════════════════

class OpportunityGenerator {
    constructor() {
        this.opportunities = [];
        this.lastGenerated = null;
    }

    // توليد فرصة تجارية بناءً على الوضع الحالي
    generate(budget = 50000, riskLevel = 'medium') {
        const analyzer = new ProfitMarginAnalyzer();
        const ranked = analyzer.rankByProfit();
        const opps = [];

        // اختر أفضل المواد حسب الميزانية ومستوى المخاطرة
        for (const mat of ranked) {
            const ref = MARKET_PRICES.scrap[mat.name];
            const avgBuy = (ref.buyMin + ref.buyMax) / 2;
            const maxQty = Math.floor(budget * this._riskFactor(riskLevel) / avgBuy);

            if (maxQty <= 0) continue;

            const expectedProfit = (parseFloat(mat.avgSell) - avgBuy) * maxQty;
            const capitalNeeded  = avgBuy * maxQty;

            opps.push({
                id: `OPP-${Date.now()}-${opps.length + 1}`,
                material: mat.name,
                demand: mat.demand,
                recommendedQty: maxQty,
                buyAtPrice: Math.round(ref.buyMin * 0.95), // هدف: اشترِ أقل من الحد الأدنى
                sellAtPrice: Math.round(ref.sellMax * 0.95),
                capitalNeeded: Math.round(capitalNeeded),
                expectedProfit: Math.round(expectedProfit),
                expectedROI: mat.roi + '%',
                margin: mat.margin + '%',
                timeframe: this._timeframe(mat.name),
                buyAction: this._buyAction(mat.name),
                sellAction: this._sellAction(mat.name),
                islamicValidity: '✅ صفقة مباحة — لا غرر ولا ربا ولا غش',
                sunnahRef: 'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء',
                priority: parseFloat(mat.roi) >= 30 ? 'عالية' : parseFloat(mat.roi) >= 20 ? 'متوسطة' : 'عادية'
            });
        }

        // أفضل 5 فرص
        this.opportunities = opps.slice(0, 5);
        this.lastGenerated = new Date().toISOString();
        return this.opportunities;
    }

    _riskFactor(level) {
        return { low: 0.3, medium: 0.6, high: 0.9 }[level] || 0.6;
    }

    _timeframe(material) {
        const fast = ['بطاريات_سيارات', 'نحاس_نقي', 'حديد_ثقيل'];
        return fast.includes(material) ? '3-7 أيام' : '7-21 يوماً';
    }

    _buyAction(material) {
        const actions = {
            'حديد_ثقيل':      'تواصل مع مصانع الهدم والبناء في المنطقة الشرقية',
            'حديد_خفيف':      'تواصل مع ورش الحدادة وتجار الخردة',
            'نحاس_نقي':       'تواصل مع الشركات الكهربائية والمقاولين — طلب كميات الكابلات المستعملة',
            'نحاس_مشوب':      'ورش الكهرباء والتبريد — كميات صغيرة متكررة',
            'ألومنيوم_نقي':   'مصانع المشروبات والتعبئة — تجار المعادن الكبار',
            'بطاريات_سيارات': 'ورش الكهرباء والسيارات — محطات الوقود — مراكز الخدمة',
            'استانلس':        'مطاعم ومستشفيات قديمة — مصانع الأغذية',
        };
        return actions[material] || 'تواصل مع تجار السكراب المحليين عبر منصة شيخة';
    }

    _sellAction(material) {
        const actions = {
            'حديد_ثقيل':      'بيع لمصانع الصلب: الحديد والصلب بالسعودية, نوفيس',
            'نحاس_نقي':       'بيع مباشر لمصانع النحاس في مصر, الهند, الصين — عبر منصة شيخة',
            'ألومنيوم_نقي':   'مصانع الألومنيوم المحلية أو التصدير للسوق الإقليمي',
            'بطاريات_سيارات': 'مصانع البطاريات — معامل إعادة التدوير',
            'استانلس':        'مصانع المعدات الطبية والغذائية',
        };
        return actions[material] || 'نشر على سوق شيخة — عروض أسعار RFQ لمشترين دوليين';
    }
}

// ═══════════════════════════════════════════════════════════
// §4 — خطة البيع السريع (Quick Sale Plan)
// ═══════════════════════════════════════════════════════════

class QuickSalePlanner {

    // خطة بيع جاهزة في 3 خطوات
    plan(material, quantity, targetDays = 7) {
        const ref = MARKET_PRICES.scrap[material];
        if (!ref) return { error: 'مادة غير معروفة' };

        const avgSell = Math.round((ref.sellMin + ref.sellMax) / 2);
        const urgenySell = Math.round(avgSell * 0.93); // خصم 7% للبيع السريع

        return {
            material,
            quantity,
            targetDays,
            steps: [
                {
                    day: 1,
                    action: 'نشر إعلان على منصة شيخة',
                    details: `انشر: "${quantity} ${ref.unit} من ${material.replace('_',' ')} — جودة ممتازة — سعر ${urgenySell} ر.س/${ref.unit}"`,
                    platform: 'سوق شيخة — صفحة الإعلانات',
                    isIslamic: 'ابدأ بالبسملة في الإعلان'
                },
                {
                    day: 1,
                    action: 'إرسال RFQ لمشترين مسجلين',
                    details: `أرسل طلب عرض أسعار لـ 10 مشترين محتملين في قاعدة بيانات شيخة`,
                    platform: 'API: POST /api/market/rfq',
                    isIslamic: 'الصدق في الوصف — لا غش في الجودة'
                },
                {
                    day: 2,
                    action: 'تواصل مباشر مع أكبر 3 مشترين',
                    details: 'اتصل بهم شخصياً — عرّف بنفسك — وضّح المواصفات',
                    platform: 'هاتف + واتساب',
                    isIslamic: 'لين الكلام وحسن الخلق في التفاوض'
                },
                {
                    day: 3,
                    action: 'فتح التفاوض وإغلاق الصفقة',
                    details: `هدف السعر: ${urgenySell}–${ref.sellMax} ر.س | لا تنزل تحت ${ref.sellMin}`,
                    platform: 'عقد إلكتروني عبر شيخة',
                    isIslamic: 'البيعان بالخيار ما لم يتفرقا — ألزم العقد بعد الرضا'
                },
                {
                    day: `${targetDays}`,
                    action: 'التسليم والتحصيل',
                    details: 'استلام الدفع — توثيق الصفقة — تقييم المشتري',
                    platform: 'نظام الدفع الآمن في شيخة',
                    isIslamic: 'أوفوا الكيل والميزان بالقسط — التوثيق واجب'
                }
            ],
            pricing: {
                ideal: ref.sellMax,
                realistic: avgSell,
                urgent: urgenySell,
                minAccept: ref.sellMin
            },
            estimatedRevenue: urgenySell * parseFloat(quantity),
            tip: 'الأفضل: ابحث عن مشترٍ مسبق قبل الشراء — "لا تبع ما ليس عندك" يُطبَّق هنا بالتحقق من الوجود الفعلي أولاً'
        };
    }
}

// ═══════════════════════════════════════════════════════════
// §5 — تحليل السوق وتوقع الأسعار
// ═══════════════════════════════════════════════════════════

class MarketIntelligence {

    // قراءة السوق من عدة زوايا (محاكاة الدكتور)
    readMarketFromMultipleAngles(material) {
        const ref = MARKET_PRICES.scrap[material];
        if (!ref) return null;

        const avgBuy  = (ref.buyMin + ref.buyMax) / 2;
        const avgSell = (ref.sellMin + ref.sellMax) / 2;

        return {
            // زاوية المشتري
            buyerView: {
                angle: 'نظرة المشتري',
                bestBuyPrice: ref.buyMin,
                whereToFind: 'المزادات — التشليح المباشر — الإفلاسات',
                tip: 'اشترِ حين الأسعار منخفضة والطلب منخفض'
            },
            // زاوية البائع
            sellerView: {
                angle: 'نظرة البائع',
                bestSellPrice: ref.sellMax,
                whereToSell: 'المصانع مباشرة — التصدير — منصة شيخة',
                tip: 'بع حين يرتفع الطلب والأسعار عالمياً'
            },
            // زاوية المحلل
            analystView: {
                angle: 'تحليل السوق',
                spreadPct: (((avgSell - avgBuy) / avgBuy) * 100).toFixed(1),
                liquidityScore: ref.demand === 'عالي جداً' ? 10 : ref.demand === 'عالي' ? 8 : 6,
                trend: this._guessTrend(material),
                globalLink: `${material.includes('نحاس') ? 'سعر النحاس العالمي LME: $' + MARKET_PRICES.lme.copper + '/طن' : 'متابع للأسواق العالمية'}`
            },
            // زاوية الفرصة
            opportunityView: {
                angle: 'الفرصة الربحية',
                margin: (((avgSell - avgBuy) / avgSell) * 100).toFixed(1) + '%',
                roi: (((avgSell - avgBuy) / avgBuy) * 100).toFixed(1) + '%',
                volatility: ref.sellMax - ref.sellMin > ref.sellMin * 0.3 ? 'عالي' : 'منخفض',
                action: parseFloat((((avgSell - avgBuy) / avgSell) * 100).toFixed(1)) >= 20
                    ? '✅ فرصة قوية — ادخل الآن'
                    : '⚠️ هامش محدود — انتظر سعراً أفضل'
            }
        };
    }

    _guessTrend(material) {
        const trending = ['نحاس_نقي', 'بطاريات_سيارات', 'ألومنيوم_نقي', 'استانلس'];
        return trending.includes(material) ? '📈 صاعد (طلب عالمي)' : '➡️ مستقر';
    }

    // لوحة السوق الشاملة
    dashboard() {
        const analyzer = new ProfitMarginAnalyzer();
        const ranked = analyzer.rankByProfit();
        const generator = new OpportunityGenerator();
        const top3 = generator.generate(100000, 'medium').slice(0, 3);

        return {
            title: 'لوحة سوق المعادن والسكراب — شيخة',
            updatedAt: new Date().toISOString(),
            hijriPrinciple: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
            lmePrices: MARKET_PRICES.lme,
            usdToSar: MARKET_PRICES.usdToSar,
            topProfitMaterials: ranked.slice(0, 5),
            topOpportunities: top3,
            marketSummary: {
                activeMaterials: Object.keys(MARKET_PRICES.scrap).length,
                highDemandCount: Object.values(MARKET_PRICES.scrap).filter(p => p.demand.includes('عالي')).length,
                bestROI: ranked[0] ? `${ranked[0].name}: ${ranked[0].roi}%` : 'N/A',
                totalMarketSize: 'تقديري: 2+ مليار ريال/سنة في المنطقة الشرقية'
            }
        };
    }
}

// ═══════════════════════════════════════════════════════════
// §6 — المحرك الموحد
// ═══════════════════════════════════════════════════════════

class SheikhaProfitOpportunityEngine {
    constructor() {
        this.analyzer = new ProfitMarginAnalyzer();
        this.generator = new OpportunityGenerator();
        this.planner = new QuickSalePlanner();
        this.intelligence = new MarketIntelligence();
        this.version = '1.0.0';
        this.bism = 'بسم الله الرحمن الرحيم';
    }

    // الوصول السريع لأفضل الفرص الآن
    getTopOpportunities(budget = 50000) {
        return {
            opportunities: this.generator.generate(budget, 'medium'),
            bestMaterials: this.analyzer.rankByProfit().slice(0, 5),
            message: 'الفرص مرتبة بالربحية — ابدأ بالأعلى ROI مع ميزانيتك',
            timestamp: new Date().toISOString()
        };
    }

    // تحليل صفقة محددة قبل الدخول
    analyzeDeal(material, buyPrice, quantity, sellPrice = null) {
        const analysis = this.analyzer.analyze(material, buyPrice, quantity, sellPrice);
        const multiAngle = this.intelligence.readMarketFromMultipleAngles(material);
        const plan = this.planner.plan(material, quantity, 7);
        return { analysis, multiAngle, quickSalePlan: plan };
    }

    // لوحة الربح الكاملة
    profitDashboard() {
        return this.intelligence.dashboard();
    }

    // خطة بيع جاهزة
    getSalePlan(material, quantity, days = 7) {
        return this.planner.plan(material, quantity, days);
    }

    getStatus() {
        const dash = this.profitDashboard();
        return {
            system: 'SHEIKHA Profit & Opportunity Engine',
            version: this.version,
            bism: this.bism,
            activeMaterials: dash.marketSummary.activeMaterials,
            highDemand: dash.marketSummary.highDemandCount,
            bestROI: dash.marketSummary.bestROI,
            islamicPrinciple: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
            timestamp: new Date().toISOString()
        };
    }
}

// ═══════════════════════════════════════════════════════════
// §7 — التصدير
// ═══════════════════════════════════════════════════════════

const engineInstance = new SheikhaProfitOpportunityEngine();

module.exports = {
    SheikhaProfitOpportunityEngine,
    ProfitMarginAnalyzer,
    OpportunityGenerator,
    QuickSalePlanner,
    MarketIntelligence,
    MARKET_PRICES,
    engine: engineInstance,
    version: '1.0.0'
};
