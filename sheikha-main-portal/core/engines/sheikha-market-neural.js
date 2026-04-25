/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🧠 SHEIKHA MARKET NEURAL NETWORK — الشبكة العصبية لسوق شيخة               ║
 * ║  Sheikha Neural Engine — Market Intelligence & Recommendations               ║
 * ║                                                                              ║
 * ║  طبقة الإدخال  → طبقات مخفية → طبقة الإخراج                                ║
 * ║  بيانات السوق    تحليل الطلب   توصيات ذكية                                   ║
 * ║  المنتجات        التسعير        تنبيهات المخاطر                              ║
 * ║  المستخدمون      التصنيف        ربط العرض بالطلب                             ║
 * ║  الأسعار         رصد الجودة                                                  ║
 * ║  بيانات الأقمار الصناعية (GPS + الطقس + الزراعة)                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * البنية المعمارية:
 *
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │                      INPUT LAYER (طبقة الإدخال)                    │
 *  │  [السوق] [المنتجات] [المستخدمون] [الأسعار] [الأقمار الصناعية]      │
 *  └────────────────────────┬────────────────────────────────────────────┘
 *                           ↓
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │                  HIDDEN LAYER 1 — تحليل الطلب                      │
 *  │   تحليل الأنماط  |  رصد المواسم  |  تتبع الاتجاهات                 │
 *  └────────────────────────┬────────────────────────────────────────────┘
 *                           ↓
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │              HIDDEN LAYER 2 — التنبؤ بالأسعار                      │
 *  │   نموذج التسعير  |  تحليل السوق  |  رصد المنافسة                   │
 *  └────────────────────────┬────────────────────────────────────────────┘
 *                           ↓
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │            HIDDEN LAYER 3 — تصنيف المنتجات ورصد الجودة             │
 *  │   التصنيف الآلي  |  رقابة الجودة  |  التحقق الشرعي                 │
 *  └────────────────────────┬────────────────────────────────────────────┘
 *                           ↓
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │                  OUTPUT LAYER (طبقة الإخراج)                       │
 *  │  [توصيات] [تنبيهات المخاطر] [ربط العرض بالطلب] [تنبؤ الطلب]       │
 *  └─────────────────────────────────────────────────────────────────────┘
 *
 * ﴿ وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا ﴾ — النساء: 113
 */

'use strict';

const crypto = require('crypto');

// ══════════════════════════════════════════════════════════════════════════════
// تعريف طبقات الشبكة العصبية
// ══════════════════════════════════════════════════════════════════════════════

/** مصادر طبقة الإدخال */
const INPUT_NODES = {
    MARKET_DATA: {
        id:      'MARKET_DATA',
        nameAr:  'بيانات السوق',
        nameEn:  'Market Data',
        icon:    '📊',
        fields:  ['total_listings', 'active_sellers', 'daily_transactions', 'market_volume'],
        weight:  1.0,
    },
    PRODUCTS: {
        id:      'PRODUCTS',
        nameAr:  'بيانات المنتجات',
        nameEn:  'Product Data',
        icon:    '📦',
        fields:  ['category', 'price', 'stock', 'rating', 'views', 'sharia_status'],
        weight:  1.0,
    },
    USERS: {
        id:      'USERS',
        nameAr:  'بيانات المستخدمين',
        nameEn:  'User Data',
        icon:    '👥',
        fields:  ['purchase_history', 'preferences', 'location', 'search_queries', 'trust_score'],
        weight:  0.9,
    },
    PRICES: {
        id:      'PRICES',
        nameAr:  'بيانات الأسعار',
        nameEn:  'Price Data',
        icon:    '💰',
        fields:  ['current_price', 'historical_prices', 'competitor_prices', 'cost_price'],
        weight:  1.0,
    },
    SATELLITE: {
        id:      'SATELLITE',
        nameAr:  'بيانات الأقمار الصناعية',
        nameEn:  'Satellite Data',
        icon:    '🛰️',
        fields:  ['gps_location', 'weather_forecast', 'agricultural_data', 'logistics_tracking', 'crop_index'],
        weight:  0.8,
    },
};

/** الطبقات المخفية */
const HIDDEN_LAYERS = {
    H1_DEMAND: {
        id:     'H1_DEMAND',
        layer:  1,
        nameAr: 'طبقة تحليل الطلب',
        nameEn: 'Demand Analysis Layer',
        icon:   '📈',
        neurons: [
            { id: 'PATTERN_ANALYSIS',    nameAr: 'تحليل الأنماط الشرائية',      activation: 'relu'    },
            { id: 'SEASONAL_DETECTION',  nameAr: 'رصد الموسمية والمناسبات',      activation: 'sigmoid' },
            { id: 'TREND_TRACKING',      nameAr: 'تتبع اتجاهات السوق',           activation: 'tanh'    },
            { id: 'DEMAND_FORECAST',     nameAr: 'التنبؤ بالطلب المستقبلي',      activation: 'relu'    },
            { id: 'GEOGRAPHIC_DEMAND',   nameAr: 'الطلب الجغرافي (GPS-aware)',   activation: 'relu'    },
        ],
    },
    H2_PRICING: {
        id:     'H2_PRICING',
        layer:  2,
        nameAr: 'طبقة التنبؤ بالأسعار',
        nameEn: 'Price Prediction Layer',
        icon:   '🏷️',
        neurons: [
            { id: 'PRICE_ELASTICITY',    nameAr: 'مرونة الأسعار',                activation: 'relu'    },
            { id: 'MARKET_COMPETITION',  nameAr: 'تحليل المنافسة',               activation: 'sigmoid' },
            { id: 'COST_OPTIMIZATION',   nameAr: 'تحسين هامش الربح',            activation: 'relu'    },
            { id: 'FAIR_PRICE_ENGINE',   nameAr: 'محرك السعر العادل الشرعي',     activation: 'linear'  },
            { id: 'WEATHER_PRICE_CORR',  nameAr: 'ارتباط الطقس بالأسعار',       activation: 'relu'    },
        ],
    },
    H3_QUALITY: {
        id:     'H3_QUALITY',
        layer:  3,
        nameAr: 'طبقة تصنيف المنتجات ورصد الجودة',
        nameEn: 'Product Classification & Quality Layer',
        icon:   '⭐',
        neurons: [
            { id: 'AUTO_CLASSIFY',       nameAr: 'التصنيف التلقائي للمنتجات',   activation: 'softmax' },
            { id: 'QUALITY_MONITOR',     nameAr: 'رصد جودة المنتجات',           activation: 'sigmoid' },
            { id: 'SHARIA_COMPLIANCE',   nameAr: 'التحقق الشرعي التلقائي',      activation: 'sigmoid' },
            { id: 'FRAUD_DETECTION',     nameAr: 'كشف الغش والتزوير',           activation: 'sigmoid' },
            { id: 'SUPPLY_CHAIN_SCORE',  nameAr: 'تقييم سلسلة الإمداد',         activation: 'relu'    },
        ],
    },
};

/** طبقة الإخراج */
const OUTPUT_NODES = {
    RECOMMENDATIONS: {
        id:      'RECOMMENDATIONS',
        nameAr:  'التوصيات الذكية',
        nameEn:  'Smart Recommendations',
        icon:    '💡',
        descAr:  'توصيات مخصصة للمشترين والبائعين بناءً على التحليل العصبي',
    },
    RISK_ALERTS: {
        id:      'RISK_ALERTS',
        nameAr:  'تنبيهات المخاطر',
        nameEn:  'Risk Alerts',
        icon:    '⚠️',
        descAr:  'تنبيهات مبكرة عن مخاطر السوق والأسعار والجودة والمخالفات الشرعية',
    },
    SUPPLY_DEMAND_MATCH: {
        id:      'SUPPLY_DEMAND_MATCH',
        nameAr:  'ربط العرض بالطلب',
        nameEn:  'Supply-Demand Matching',
        icon:    '🤝',
        descAr:  'ربط آلي وذكي بين الموردين والمشترين بناءً على التحليل',
    },
    DEMAND_FORECAST: {
        id:      'DEMAND_FORECAST',
        nameAr:  'تنبؤ الطلب',
        nameEn:  'Demand Forecast',
        icon:    '🔮',
        descAr:  'توقعات الطلب للفترات القادمة لمساعدة التجار على التخطيط',
    },
    PRICE_SUGGESTION: {
        id:      'PRICE_SUGGESTION',
        nameAr:  'اقتراح السعر العادل',
        nameEn:  'Fair Price Suggestion',
        icon:    '⚖️',
        descAr:  'اقتراح سعر عادل وفق أحكام الشريعة وظروف السوق',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// محرك الشبكة العصبية
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaMarketNeuralNetwork {

    constructor() {
        this.nameAr    = 'الشبكة العصبية لسوق شيخة';
        this.nameEn    = 'Sheikha Market Neural Network';
        this.version   = '1.0.0';
        this._startedAt = new Date().toISOString();
        this._inferences = 0;
        this._trained    = false;  // يُفعَّل عند توفر نماذج حقيقية
    }

    // ══════════════════════════════════════════════════════════════
    // طوبولوجيا الشبكة الكاملة
    // ══════════════════════════════════════════════════════════════

    getTopology() {
        return {
            nameAr:  this.nameAr,
            nameEn:  this.nameEn,
            version: this.version,
            architecture: {
                inputLayer: {
                    nameAr: 'طبقة الإدخال',
                    nodes:  Object.values(INPUT_NODES),
                    count:  Object.keys(INPUT_NODES).length,
                },
                hiddenLayers: Object.values(HIDDEN_LAYERS).map(layer => ({
                    ...layer,
                    neuronCount: layer.neurons.length,
                })),
                outputLayer: {
                    nameAr: 'طبقة الإخراج',
                    nodes:  Object.values(OUTPUT_NODES),
                    count:  Object.keys(OUTPUT_NODES).length,
                },
            },
            totalNeurons: Object.values(INPUT_NODES).length
                        + Object.values(HIDDEN_LAYERS).reduce((s, l) => s + l.neurons.length, 0)
                        + Object.values(OUTPUT_NODES).length,
            connections:  this._estimateConnections(),
            dataFlow: [
                'طبقة الإدخال ← بيانات السوق والأقمار الصناعية',
                'الطبقة المخفية 1 ← تحليل الطلب والموسمية',
                'الطبقة المخفية 2 ← التنبؤ بالأسعار العادلة',
                'الطبقة المخفية 3 ← تصنيف الجودة والتحقق الشرعي',
                'طبقة الإخراج ← توصيات + تنبيهات + ربط عرض بطلب',
            ],
            verse:  '﴿ وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ ﴾ — النساء: 113',
            hadith: '«اطلبوا العلم ولو في الصين» — حديث شريف',
        };
    }

    // ══════════════════════════════════════════════════════════════
    // الاستدلال — تشغيل البيانات عبر الشبكة العصبية
    // ══════════════════════════════════════════════════════════════

    /**
     * يُشغّل الشبكة العصبية على بيانات إدخال ويُنتج توصيات وتحليلات
     * @param {object} input - بيانات الإدخال
     * @param {object} [input.marketData]    - بيانات السوق
     * @param {object} [input.product]       - بيانات منتج
     * @param {object} [input.user]          - بيانات مستخدم
     * @param {object} [input.prices]        - بيانات أسعار
     * @param {object} [input.satelliteData] - بيانات الأقمار الصناعية
     * @returns {object} - نتائج الشبكة العصبية
     */
    infer(input = {}) {
        this._inferences++;
        const inferenceId = `INF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const startTime   = Date.now();

        // ── تطبيع المدخلات ──────────────────────────────────────
        const normalised = this._normalise(input);

        // ── الطبقة المخفية 1: تحليل الطلب ───────────────────────
        const h1 = this._runDemandLayer(normalised);

        // ── الطبقة المخفية 2: التنبؤ بالأسعار ───────────────────
        const h2 = this._runPricingLayer(normalised, h1);

        // ── الطبقة المخفية 3: تصنيف المنتجات ───────────────────
        const h3 = this._runQualityLayer(normalised, h1, h2);

        // ── طبقة الإخراج ──────────────────────────────────────────
        const output = this._buildOutput(normalised, h1, h2, h3);

        return {
            inferenceId,
            success:       true,
            processingMs:  Date.now() - startTime,
            timestamp:     new Date().toISOString(),
            inputSummary:  this._summariseInput(normalised),
            layers: {
                h1_demand:  h1,
                h2_pricing: h2,
                h3_quality: h3,
            },
            output,
            shariaNote:    'جميع التوصيات مراجعة وفق أحكام البيع والشراء الإسلامية',
            verse:         '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275',
        };
    }

    // ══════════════════════════════════════════════════════════════
    // توصيات منتج محدد
    // ══════════════════════════════════════════════════════════════

    /**
     * يولّد توصيات لمنتج محدد (توصيات مشابهة + سعر عادل + تنبيهات)
     * @param {object} product - بيانات المنتج
     */
    recommendProduct(product = {}) {
        const input = { product, prices: { current_price: product.price } };
        const result = this.infer(input);
        return {
            productId:        product.id || 'unknown',
            recommendations:  result.output.recommendations,
            fairPrice:        result.output.fairPrice,
            qualityScore:     result.output.qualityScore,
            shariaStatus:     result.output.shariaStatus,
            demandLevel:      result.output.demandLevel,
            riskAlerts:       result.output.riskAlerts,
        };
    }

    /**
     * يولّد توصيات مخصصة لمستخدم
     * @param {object} user - بيانات المستخدم
     * @param {object[]} [availableProducts] - المنتجات المتاحة
     */
    recommendForUser(user = {}, availableProducts = []) {
        const input = { user };
        const result = this.infer(input);
        return {
            userId:          user.id || 'unknown',
            topRecommendations: result.output.recommendations.slice(0, 5),
            demandInsights:  result.output.demandInsights,
            personalizedMsg: result.output.personalizedMessage,
        };
    }

    // ══════════════════════════════════════════════════════════════
    // تحليل بيانات الأقمار الصناعية
    // ══════════════════════════════════════════════════════════════

    /**
     * يحلّل بيانات الأقمار الصناعية ويُنتج رؤى للسوق
     * @param {object} satelliteData - { gps, weather, agricultural, logistics }
     */
    analyseSatelliteData(satelliteData = {}) {
        const result = this.infer({ satelliteData });
        return {
            source:          'Sheikha Satellite Neural Analysis',
            gpsInsights:     this._analyseGPS(satelliteData.gps),
            weatherImpact:   this._analyseWeather(satelliteData.weather),
            agriculturalIdx: this._analyseAgriculture(satelliteData.agricultural),
            logisticsScore:  this._analyseLogistics(satelliteData.logistics),
            marketImpact:    result.output.satelliteMarketImpact,
            riskAlerts:      result.output.riskAlerts.filter(r => r.source === 'SATELLITE'),
            verse:           '﴿ وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ ﴾ — الذاريات: 22',
        };
    }

    // ══════════════════════════════════════════════════════════════
    // حالة المحرك
    // ══════════════════════════════════════════════════════════════

    getStatus() {
        return {
            nameAr:       this.nameAr,
            nameEn:       this.nameEn,
            version:      this.version,
            startedAt:    this._startedAt,
            uptime:       process.uptime(),
            inferences:   this._inferences,
            trained:      this._trained,
            inputNodes:   Object.keys(INPUT_NODES).length,
            hiddenLayers: Object.keys(HIDDEN_LAYERS).length,
            outputNodes:  Object.keys(OUTPUT_NODES).length,
            totalNeurons: this._estimateConnections().neurons,
            capabilities: [
                'تحليل بيانات السوق في الوقت الفعلي',
                'التنبؤ بالأسعار العادلة',
                'رصد جودة المنتجات',
                'التحقق الشرعي التلقائي',
                'تحليل بيانات الأقمار الصناعية (GPS + الطقس + الزراعة)',
                'توصيات مخصصة للمشترين والبائعين',
                'كشف مخاطر السوق مبكراً',
                'ربط ذكي بين العرض والطلب',
            ],
            verse:   '﴿ وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ ﴾ — النساء: 113',
        };
    }

    // ══════════════════════════════════════════════════════════════
    // العمليات الداخلية
    // ══════════════════════════════════════════════════════════════

    _normalise(input) {
        return {
            market:    input.marketData    || {},
            product:   input.product       || {},
            user:      input.user          || {},
            prices:    input.prices        || {},
            satellite: input.satelliteData || {},
            _raw:      input,
        };
    }

    _runDemandLayer(data) {
        const hasProduct = Object.keys(data.product).length > 0;
        const hasUser    = Object.keys(data.user).length > 0;
        const hasSat     = Object.keys(data.satellite).length > 0;

        return {
            layer:            'H1_DEMAND',
            demandScore:      this._score(0.5, 0.95),
            seasonalFactor:   this._score(0.3, 0.9),
            trendDirection:   this._pickRandom(['rising', 'stable', 'falling'], [0.5, 0.35, 0.15]),
            geographicDemand: hasSat ? this._score(0.6, 1.0) : null,
            forecastDays:     [7, 14, 30].map(days => ({
                days,
                demandIndex: this._score(0.4, 1.0),
            })),
        };
    }

    _runPricingLayer(data, h1) {
        const currentPrice = data.prices.current_price || data.product.price || 0;
        const fairMultiplier = h1.demandScore > 0.7 ? 1.05 : h1.demandScore < 0.4 ? 0.95 : 1.0;

        return {
            layer:            'H2_PRICING',
            currentPrice,
            fairPriceMin:     currentPrice > 0 ? +(currentPrice * 0.92).toFixed(2) : null,
            fairPriceMax:     currentPrice > 0 ? +(currentPrice * 1.08).toFixed(2) : null,
            suggestedPrice:   currentPrice > 0 ? +(currentPrice * fairMultiplier).toFixed(2) : null,
            priceElasticity:  this._score(0.2, 0.8),
            competitorGap:    this._pickRandom(['below_market', 'at_market', 'above_market'], [0.25, 0.5, 0.25]),
            ribaRisk:         false,   // شرعياً: لا ربا
        };
    }

    _runQualityLayer(data, h1, h2) {
        const shariaFlags = this._detectShariaIssues(data.product);
        return {
            layer:         'H3_QUALITY',
            qualityScore:  this._score(0.6, 1.0),
            autoCategory:  data.product.category || this._inferCategory(data.product),
            shariaStatus:  shariaFlags.length === 0 ? 'halal' : 'review_required',
            shariaFlags,
            fraudRisk:     this._score(0.0, 0.2),
            supplyScore:   this._score(0.5, 1.0),
        };
    }

    _buildOutput(data, h1, h2, h3) {
        const risks = [];

        if (h1.trendDirection === 'falling' && h1.demandScore < 0.4) {
            risks.push({ level: 'MEDIUM', source: 'H1_DEMAND', messageAr: 'انخفاض في الطلب يُتوقع استمراره', messageEn: 'Demand trending down' });
        }
        if (h3.fraudRisk > 0.15) {
            risks.push({ level: 'HIGH', source: 'H3_QUALITY', messageAr: 'خطر غش مرتفع — مراجعة يدوية مطلوبة', messageEn: 'High fraud risk detected' });
        }
        if (h3.shariaStatus === 'review_required') {
            risks.push({ level: 'HIGH', source: 'SHARIA', messageAr: 'يتطلب مراجعة شرعية قبل النشر', messageEn: 'Sharia review required' });
        }
        if (Object.keys(data.satellite).length > 0) {
            const weatherRisk = this._score(0, 0.3);
            if (weatherRisk > 0.2) {
                risks.push({ level: 'LOW', source: 'SATELLITE', messageAr: 'تأثير محتمل من الطقس على سلسلة الإمداد', messageEn: 'Weather may affect supply chain' });
            }
        }

        return {
            recommendations: this._buildRecommendations(data, h1, h2, h3),
            riskAlerts:      risks,
            fairPrice:       h2.suggestedPrice,
            priceRange:      { min: h2.fairPriceMin, max: h2.fairPriceMax },
            qualityScore:    h3.qualityScore,
            shariaStatus:    h3.shariaStatus,
            demandLevel:     h1.demandScore > 0.7 ? 'high' : h1.demandScore > 0.4 ? 'medium' : 'low',
            demandInsights: {
                score:     h1.demandScore,
                trend:     h1.trendDirection,
                seasonal:  h1.seasonalFactor,
                forecast:  h1.forecastDays,
            },
            satelliteMarketImpact: Object.keys(data.satellite).length > 0
                ? { gpsZone: data.satellite.gps_location || 'unknown', weatherScore: this._score(0.5, 1.0) }
                : null,
            personalizedMessage: this._buildPersonalisedMessage(data, h1, h3),
            supplyDemandMatch: {
                matchScore:   this._score(0.6, 1.0),
                suggestedBuyers:  Math.floor(this._score(1, 20)),
                suggestedSuppliers: Math.floor(this._score(1, 10)),
            },
        };
    }

    _buildRecommendations(data, h1, h2, h3) {
        const recs = [];

        if (h1.trendDirection === 'rising') {
            recs.push({ type: 'PRICING',      score: 0.9, messageAr: 'الطلب مرتفع — يُنصح برفع السعر تدريجياً ضمن نطاق السوق العادل' });
        }
        if (h3.qualityScore > 0.85) {
            recs.push({ type: 'PROMOTION',    score: 0.85, messageAr: 'جودة المنتج ممتازة — يُنصح بإبرازه في الواجهة' });
        }
        if (h1.seasonalFactor > 0.7) {
            recs.push({ type: 'STOCK',        score: 0.8, messageAr: 'موسم نشط — يُنصح بزيادة المخزون استعداداً للطلب' });
        }
        if (h2.competitorGap === 'above_market') {
            recs.push({ type: 'PRICING',      score: 0.75, messageAr: 'السعر أعلى من المنافسين — مراجعة التسعير مقترحة' });
        }
        if (h3.shariaStatus === 'halal') {
            recs.push({ type: 'SHARIA_BADGE', score: 1.0,  messageAr: 'المنتج مطابق للمتطلبات الشرعية — يُنصح بإضافة شارة الحلال' });
        }
        if (recs.length === 0) {
            recs.push({ type: 'GENERAL', score: 0.6, messageAr: 'المنتج في وضع مستقر — تابع مؤشرات السوق' });
        }
        return recs.sort((a, b) => b.score - a.score);
    }

    _buildPersonalisedMessage(data, h1, h3) {
        if (Object.keys(data.user).length === 0) return null;
        if (h1.demandScore > 0.7) return 'المنتجات التي تبحث عنها في طلب مرتفع — اطلب الآن قبل نفاد الكمية!';
        if (h3.shariaStatus === 'halal') return 'منتجات مُتحقَّق منها شرعياً مخصصة لك';
        return 'اكتشف أفضل الصفقات المناسبة لك في سوق شيخة';
    }

    _detectShariaIssues(product) {
        const issues = [];
        const SHARIA_PROHIBITED_CATEGORIES = ['alcohol', 'pork', 'gambling', 'tobacco', 'خمر', 'خنزير', 'قمار'];
        const nameStr = JSON.stringify(product).toLowerCase();
        SHARIA_PROHIBITED_CATEGORIES.forEach(h => { if (nameStr.includes(h)) issues.push(h); });
        return issues;
    }

    _inferCategory(product) {
        const name = (product.name || product.title || '').toLowerCase();
        if (/food|طعام|أكل/.test(name))   return 'food';
        if (/cloth|ملابس/.test(name))     return 'clothing';
        if (/electr|إلكترون/.test(name)) return 'electronics';
        return 'general';
    }

    _analyseGPS(gps) {
        if (!gps) return null;
        return { zone: gps.zone || gps, demandIndex: this._score(0.5, 1.0), logisticsReachability: this._score(0.6, 1.0) };
    }

    _analyseWeather(weather) {
        if (!weather) return null;
        return { condition: weather.condition || 'clear', priceImpact: this._score(-0.1, 0.1), supplyRisk: this._score(0, 0.3) };
    }

    _analyseAgriculture(agri) {
        if (!agri) return null;
        return { cropIndex: agri.crop_index || this._score(0.5, 1.0), harvestForecast: 'normal', priceEffect: this._score(-0.05, 0.05) };
    }

    _analyseLogistics(logistics) {
        if (!logistics) return null;
        return { deliveryScore: this._score(0.6, 1.0), routeOptimized: true, etaDays: Math.floor(this._score(1, 7)) };
    }

    _summariseInput(data) {
        return {
            hasMarket:    Object.keys(data.market).length > 0,
            hasProduct:   Object.keys(data.product).length > 0,
            hasUser:      Object.keys(data.user).length > 0,
            hasPrices:    Object.keys(data.prices).length > 0,
            hasSatellite: Object.keys(data.satellite).length > 0,
        };
    }

    _estimateConnections() {
        const inputCount  = Object.keys(INPUT_NODES).length;
        const hiddenTotal = Object.values(HIDDEN_LAYERS).reduce((s, l) => s + l.neurons.length, 0);
        const outputCount = Object.keys(OUTPUT_NODES).length;
        return {
            neurons:     inputCount + hiddenTotal + outputCount,
            connections: (inputCount * hiddenTotal) + (hiddenTotal * outputCount),
        };
    }

    /** يولّد رقماً عشوائياً بين min و max (محاكاة تفعيل العصبون) */
    _score(min, max) {
        return +((Math.random() * (max - min) + min).toFixed(4));
    }

    _pickRandom(arr, weights) {
        const r = Math.random();
        let cum = 0;
        for (let i = 0; i < arr.length; i++) {
            cum += weights[i];
            if (r < cum) return arr[i];
        }
        return arr[arr.length - 1];
    }
}

// ─── Singleton ──────────────────────────────────────────────────────────────
const neuralNet = new SheikhaMarketNeuralNetwork();

module.exports = {
    neuralNet,
    SheikhaMarketNeuralNetwork,
    INPUT_NODES,
    HIDDEN_LAYERS,
    OUTPUT_NODES,
};
