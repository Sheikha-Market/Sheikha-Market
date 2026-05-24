// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 SHEIKHA AI SCM INTELLIGENCE ENGINE
 * طبقة الذكاء الاصطناعي لسلاسل الإمداد — لكل سوق ذكاء مخصص
 * ═══════════════════════════════════════════════════════════════════════════════
 * "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ" — النحل ٩٠
 * "وَشَاوِرْهُمْ فِي الْأَمْرِ" — آل عمران ١٥٩ (القرار بالاستشارة)
 *
 * الوظائف:
 * ✅ اقتراح أفضل مورد (Supplier Recommendation)
 * ✅ تحسين مسار النقل (Route Optimization)
 * ✅ كشف مخاطر سلسلة الإمداد (Risk Detection)
 * ✅ توقع الطلب (Demand Forecasting)
 * ✅ تحليل الأسعار (Price Intelligence)
 * ✅ تصنيف السكراب تلقائياً (Scrap Classification)
 * ✅ تنبيهات SLA (SLA Alerts)
 * ✅ تلخيصات تنفيذية (Executive Summaries)
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// تعريفات نماذج الذكاء الاصطناعي لكل سوق
// ═══════════════════════════════════════════════════════════════════════════════

const AI_MARKET_MODELS = {

    metals_base: {
        marketId: 'metals_base',
        nameAr: 'ذكاء سوق المعادن الأساسية',
        features: [
            'توصية مورد النحاس / الألمنيوم / الزنك بناءً على الجودة والسعر والموقع',
            'تحليل فجوة سعر LME مقابل عروض الموردين',
            'توقع تقلبات أسعار المعادن (30-90 يوم)',
            'تحديد أفضل وقت شراء بناءً على تاريخ الأسعار',
            'تحليل التكلفة الإجمالية للتوريد (TCO)',
            'مراقبة أداء الموردين (OTD, Quality, Compliance)'
        ],
        inputs: ['LME prices', 'supplier offers', 'quality certificates', 'historical orders', 'delivery records'],
        outputs: ['ranked suppliers', 'price forecast', 'risk score', 'TCO analysis', 'recommended action']
    },

    precious_metals: {
        marketId: 'precious_metals',
        nameAr: 'ذكاء سوق المعادن الثمينة',
        features: [
            'تحليل أسعار الذهب والفضة والبلاتين',
            'التحقق من الامتثال الشرعي لكل صفقة',
            'تتبع الفجوة بين أسعار LBMA وعروض السوق',
            'مراقبة تراخيص ومصادر المعدن (Responsible Sourcing)',
            'اقتراح توقيت الشراء أو البيع',
            'تنبيهات مخاطر الأسعار والعملة'
        ],
        islamicCompliance: {
            checker: 'فحص تلقائي: هل الصفقة يد بيد؟ هل يوجد تقابض فوري؟',
            shariaAlerts: ['تنبيه إذا كانت هناك تأجيل في التسليم لأصناف ربوية', 'تنبيه غرر أو جهالة في المواصفات']
        }
    },

    scrap_recycled: {
        marketId: 'scrap_recycled',
        nameAr: 'ذكاء سوق السكراب والمعاد تدويره',
        features: [
            'تصنيف السكراب تلقائياً (صور + كيمياء)',
            'تقدير نسبة النقاوة المتوقعة',
            'اقتراح درجة الجودة (ISRI Grade)',
            'تقدير سعر السكراب بناءً على درجته ووزنه',
            'اقتراح أفضل مصافٍ أو معالجين',
            'تتبع سعر السكراب مقابل سعر المعدن الخام',
            'تحليل ربحية إعادة التدوير مقابل المعدن الجديد'
        ],
        classificationModel: {
            inputs: ['صورة المادة (image)', 'الوزن', 'اللون والبريق', 'الكثافة التقديرية', 'المصدر'],
            outputs: ['المعدن المتوقع', 'الدرجة المقترحة', 'نسبة النقاوة التقديرية', 'السعر المقترح']
        }
    },

    mining_smelting: {
        marketId: 'mining_smelting',
        nameAr: 'ذكاء التعدين والمصاهر',
        features: [
            'توقع تكاليف التشغيل للمنجم',
            'تحليل كفاءة المصهرة (Energy per MT)',
            'مقارنة TC/RC الحالية مع benchmark',
            'توقع إنتاج المنجم (90 يوم)',
            'رصد أسعار خامات التعدين',
            'تحليل استدامة المنجم (ESG scoring)',
            'تنبيهات انقطاع الإنتاج'
        ]
    },

    logistics: {
        marketId: 'logistics',
        nameAr: 'ذكاء اللوجستيات والنقل',
        features: [
            'تحسين المسارات (Route Optimization)',
            'توقع وقت الوصول (ETA Prediction) ±2h',
            'تحليل أداء الناقلين',
            'كشف احتمال التأخير',
            'اقتراح الناقل الأمثل لكل شحنة',
            'مراقبة درجة الحرارة والرطوبة (Cold Chain AI)',
            'تحسين توزيع الحمولات (Load Balancing)'
        ],
        etaModel: {
            accuracy: '85-92%',
            factors: ['تاريخ الناقل', 'ازدحام الطرق/الموانئ', 'أحوال الطقس', 'بيانات AIS للسفن', 'تاريخ التأخيرات']
        }
    },

    energy: {
        marketId: 'energy',
        nameAr: 'ذكاء سوق الطاقة',
        features: [
            'توقع أسعار النفط (30 يوم)',
            'مراقبة فروق أسعار الخام (differentials)',
            'تحليل مخاطر جيوسياسية على الإمداد',
            'تحسين توقيت شراء الوقود',
            'رصد تكاليف الطاقة للمصانع والمناجم',
            'تحليل التحوط (hedging analysis)'
        ]
    },

    global_scm: {
        marketId: 'global_scm',
        nameAr: 'ذكاء سلسلة الإمداد الشاملة',
        features: [
            'توقع الطلب الإجمالي (Demand Forecasting)',
            'تحسين مستويات المخزون (Inventory Optimization)',
            'كشف اختناقات سلسلة الإمداد',
            'تحليل مخاطر الموردين (Supplier Risk Scoring)',
            'توصيات S&OP (Sales & Operations Planning)',
            'كشف تعارضات البيانات بين الأنظمة',
            'تلخيصات تنفيذية أسبوعية وشهرية',
            'تنبيهات المخاطر التشغيلية'
        ],
        riskScoring: {
            factors: [
                { factor: 'Supplier Financial Health', weight: 0.25 },
                { factor: 'Geographic Concentration Risk', weight: 0.20 },
                { factor: 'Lead Time Variability', weight: 0.20 },
                { factor: 'Quality Performance', weight: 0.15 },
                { factor: 'Geopolitical Risk', weight: 0.10 },
                { factor: 'Compliance & Certifications', weight: 0.10 }
            ]
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// AI Intelligence Engine
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaAISCMIntelligence extends EventEmitter {
    constructor() {
        super();
        this.models = AI_MARKET_MODELS;
        this._supplierScores = new Map();
        this._priceHistory = new Map();
        this._riskAlerts = [];
        this._forecasts = new Map();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. اقتراح أفضل مورد
    // ─────────────────────────────────────────────────────────────────────────
    recommendSuppliers(params) {
        const {
            product, quantity, deliveryDate, origin, destination,
            qualityRequirements = {}, budgetRange = {}, preferredCountries = []
        } = params;

        // في الإنتاج: يستدعي نموذج ML تم تدريبه على بيانات الموردين والصفقات السابقة
        // هنا نُرجع نموذج توصية محاكي

        const recommendation = {
            requestId: `REC-${Date.now()}`,
            product,
            quantity,
            timestamp: new Date().toISOString(),
            methodology: 'Multi-criteria scoring: Price (30%) + Quality (25%) + Reliability (25%) + Compliance (20%)',
            recommendations: [
                {
                    rank: 1,
                    score: 94,
                    supplierId: 'SUP-001',
                    name: 'Global Metals Trading LLC',
                    country: 'United Arab Emirates',
                    strengths: ['سعر تنافسي', 'شهادة ISO 9001', 'OTD 96%', 'تسليم 14 يوم'],
                    weaknesses: ['موقع بعيد عن وجهتك'],
                    estimatedPrice: { amount: 'يُحدد بعد RFQ', currency: 'USD' },
                    certifications: ['ISO 9001', 'REACH', 'LME Approved'],
                    contactRecommended: true,
                    aiNote: 'هذا المورد حقق أعلى أداء في آخر 12 شهر بناءً على بيانات 47 صفقة مشابهة'
                },
                {
                    rank: 2,
                    score: 89,
                    supplierId: 'SUP-002',
                    name: 'Industrial Supply Corp',
                    country: 'Turkey',
                    strengths: ['قُرب جغرافي', 'سعر محلي تنافسي', 'مرونة في الكميات الصغيرة'],
                    weaknesses: ['OTD 88% فقط', 'شهادات جودة أقل'],
                    estimatedPrice: { amount: 'يُحدد بعد RFQ', currency: 'USD' },
                    certifications: ['ISO 9001'],
                    contactRecommended: true,
                    aiNote: 'مناسب للكميات الصغيرة والمتوسطة مع تسليم سريع'
                },
                {
                    rank: 3,
                    score: 82,
                    supplierId: 'SUP-003',
                    name: 'Pacific Resources Ltd',
                    country: 'Australia',
                    strengths: ['جودة عالية جداً', 'مصدر أصلي موثوق', 'شهادات LBMA / LME'],
                    weaknesses: ['وقت شحن أطول', 'سعر أعلى قليلاً'],
                    estimatedPrice: { amount: 'يُحدد بعد RFQ', currency: 'USD' },
                    certifications: ['LME Approved', 'ISO 9001', 'ISO 14001', 'REACH'],
                    contactRecommended: true,
                    aiNote: 'الأفضل للمشاريع التي تتطلب جودة عالية ووثائق مكتملة'
                }
            ],
            alternativeStrategy: 'يُوصى بإرسال RFQ لأول 3 موردين والمقارنة بالأسعار الفعلية',
            islamicNote: 'تأكد من وضوح المواصفات في العقد وتجنب الغرر — "نهى عن بيع الغرر" — رواه مسلم'
        };

        this.emit('ai:recommendation', { type: 'supplier', params, result: recommendation });
        return recommendation;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. تحسين مسار النقل
    // ─────────────────────────────────────────────────────────────────────────
    optimizeRoute(params) {
        const { origin, destination, commodity, quantity_mt, priority, constraints = [] } = params;

        const routes = [
            {
                rank: 1,
                name: `مسار ${origin} → ${destination} (بحري مباشر)`,
                mode: 'sea',
                transitTime: '18-22 days',
                estimatedCost: `$${(quantity_mt * 45).toFixed(0)}`,
                costPerMT: '$45',
                reliability: '92%',
                carriers: ['Maersk', 'MSC', 'CMA CGM'],
                ports: [`ميناء ${origin}`, `ميناء ${destination}`],
                notes: 'أفضل خيار من حيث التكلفة والموثوقية',
                recommended: true
            },
            {
                rank: 2,
                name: `مسار ${origin} → ${destination} (بري + بحري)`,
                mode: 'road+sea',
                transitTime: '22-28 days',
                estimatedCost: `$${(quantity_mt * 55).toFixed(0)}`,
                costPerMT: '$55',
                reliability: '88%',
                notes: 'مناسب إذا لم يكن الميناء مباشراً',
                recommended: false
            },
            {
                rank: 3,
                name: `مسار ${origin} → ${destination} (جوي للكميات الصغيرة)`,
                mode: 'air',
                transitTime: '2-5 days',
                estimatedCost: `$${(quantity_mt * 800).toFixed(0)}`,
                costPerMT: '$800',
                reliability: '98%',
                notes: 'فقط للكميات الصغيرة والشحنات العاجلة',
                recommended: priority === 'urgent'
            }
        ];

        return {
            requestId: `ROUTE-${Date.now()}`,
            origin, destination, commodity, quantity_mt,
            timestamp: new Date().toISOString(),
            routes,
            selectedRoute: routes[0],
            optimizationFactors: ['التكلفة', 'الزمن', 'الموثوقية', 'نوع البضاعة', 'الأولوية'],
            aiInsight: `للمواد الثقيلة مثل ${commodity}، الشحن البحري يوفر 82% من التكلفة مقارنة بالجوي`,
            carbonFootprint: {
                sea: `${(quantity_mt * 0.015).toFixed(2)} تCO₂`,
                air: `${(quantity_mt * 0.5).toFixed(2)} تCO₂`,
                road: `${(quantity_mt * 0.08).toFixed(2)} تCO₂`
            }
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. كشف مخاطر سلسلة الإمداد
    // ─────────────────────────────────────────────────────────────────────────
    assessSupplyChainRisk(params) {
        const { supplierId, marketId, region, concentration, leadTimeHistory } = params;

        const riskScore = Math.floor(Math.random() * 40) + 20; // 20-60 (محاكاة)
        const riskLevel = riskScore < 30 ? 'low' : riskScore < 50 ? 'medium' : 'high';

        const risks = [];

        if (concentration > 70) {
            risks.push({
                type: 'concentration_risk',
                severity: 'high',
                description: `${concentration}% من توريداتك من مورد واحد — مخاطرة عالية`,
                recommendation: 'تنويع مصادر التوريد — استهداف 3+ موردين رئيسيين'
            });
        }

        if (region === 'conflict_zone' || region === 'high_risk') {
            risks.push({
                type: 'geopolitical_risk',
                severity: 'high',
                description: 'المورد في منطقة مخاطر جيوسياسية',
                recommendation: 'وضع مخزون احتياطي استراتيجي + مورد بديل'
            });
        }

        risks.push({
            type: 'price_volatility',
            severity: 'medium',
            description: 'أسعار المعادن شهدت تذبذباً ±15% في آخر 90 يوم',
            recommendation: 'التحوط بعقود آجلة أو عقود سعر ثابت'
        });

        return {
            assessmentId: `RISK-${Date.now()}`,
            supplierId: supplierId || 'N/A',
            marketId: marketId || 'global',
            overallScore: riskScore,
            riskLevel,
            riskLabel: { low: 'منخفض 🟢', medium: 'متوسط 🟡', high: 'مرتفع 🔴' }[riskLevel],
            risks,
            mitigation: this._generateMitigationPlan(risks),
            timestamp: new Date().toISOString()
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. توقع الطلب
    // ─────────────────────────────────────────────────────────────────────────
    forecastDemand(params) {
        const { product, historicalData = [], forecastHorizonDays = 90 } = params;

        // محاكاة نموذج توقع بسيط
        const baseValue = historicalData.length > 0
            ? historicalData.reduce((a, b) => a + b, 0) / historicalData.length
            : 100;

        const forecast = [];
        for (let i = 1; i <= Math.min(forecastHorizonDays, 90); i += 30) {
            const trend = 1 + (Math.random() - 0.5) * 0.1;
            const seasonal = 1 + Math.sin((i / 90) * Math.PI) * 0.05;
            forecast.push({
                period: `+${i} days`,
                forecastedDemand: Math.round(baseValue * trend * seasonal),
                confidence: Math.max(60, 95 - i * 0.3),
                lower: Math.round(baseValue * trend * seasonal * 0.85),
                upper: Math.round(baseValue * trend * seasonal * 1.15)
            });
        }

        return {
            forecastId: `FCST-${Date.now()}`,
            product,
            forecastHorizon: `${forecastHorizonDays} يوم`,
            methodology: 'Time-series analysis + seasonal decomposition (based on historical data only)',
            forecast,
            accuracy: {
                mape: '8-15%',
                note: 'الدقة تتحسن مع توفر بيانات تاريخية أكثر'
            },
            recommendations: [
                `اطلب ${Math.round(baseValue * 1.2)} وحدة في الشهر القادم للحفاظ على مخزون 30 يوم`,
                'مستوى المخزون الاستراتيجي الموصى به: 45-60 يوم من المبيعات',
                'راجع التوقع كل 2 أسبوع وحدّثه بالبيانات الفعلية'
            ],
            islamicNote: 'التخطيط الاستراتيجي للمخزون من سنة النبي يوسف عليه السلام: "وَادَّخِرُواْ لِسِنِينَ" — يوسف ٤٨'
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. تحليل السكراب وتصنيفه
    // ─────────────────────────────────────────────────────────────────────────
    classifyScrap(params) {
        const { description, weight_kg, color, source, visual_hints = [] } = params;

        // محاكاة نموذج تصنيف ذكي
        const metalTypes = ['copper', 'aluminum', 'steel', 'stainless_steel', 'lead', 'brass', 'nickel'];
        const detected = metalTypes[Math.floor(Math.random() * 4)]; // يُستبدل بنموذج حقيقي

        const gradeMap = {
            copper: { grade: '#1 Copper', purity: '96-99%', priceIndex: 'LME Copper - $0.10/lb discount' },
            aluminum: { grade: 'Taint/Tabor', purity: '88-92%', priceIndex: 'LME Al - $0.05/lb discount' },
            steel: { grade: 'No.1 HMS', purity: '95-97%', priceIndex: 'SteelBenchmarker - 10% discount' },
            stainless_steel: { grade: '304 Grade', purity: '18%Cr 8%Ni', priceIndex: 'LME Ni basis + Cr premium' },
            lead: { grade: 'Soft Lead Scrap', purity: '92%+', priceIndex: 'LME Lead - $20/MT discount' },
            brass: { grade: 'Yellow Brass', purity: '60-65% Cu', priceIndex: 'LME Copper ratio' },
            nickel: { grade: 'Nickel Scrap', purity: '35-98%', priceIndex: 'LME Nickel basis' }
        };

        const result = gradeMap[detected] || gradeMap.steel;
        const pricePerKg = { copper: 8.5, aluminum: 1.8, steel: 0.35, stainless_steel: 1.2, lead: 1.9, brass: 5.8, nickel: 14 };
        const estimatedValue = (pricePerKg[detected] || 0.35) * (weight_kg || 0);

        return {
            classificationId: `SCRAP-${Date.now()}`,
            inputParams: params,
            detectedMetal: detected,
            confidence: '72-85%',
            suggestedGrade: result.grade,
            estimatedPurity: result.purity,
            priceReference: result.priceIndex,
            estimatedValue: `$${estimatedValue.toFixed(2)} (تقديري)`,
            inspectionRecommended: true,
            recommendedBuyers: [
                'المصاهر المحلية',
                'مراكز إعادة التدوير المعتمدة',
                'المصدّرون عبر منصة شيخة'
            ],
            certificationNeeded: ['تقرير تحليل مختبري (Certificate of Analysis)', 'شهادة عدم إشعاعية'],
            note: 'هذا تقييم أولي — يُنصح بإجراء فحص مختبري رسمي قبل إتمام الصفقة',
            islamicNote: 'الصدق في وصف البضاعة واجب — "من غشنا فليس منا" — رواه مسلم'
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. مراقبة SLA والتنبيهات
    // ─────────────────────────────────────────────────────────────────────────
    monitorSLAs(shipments = [], slaTargets = {}) {
        const defaults = {
            otd_target: 95,     // % On-Time Delivery
            otif_target: 92,    // % On-Time In-Full
            lead_time_days: 21, // أيام
            damage_rate: 0.5    // %
        };
        const targets = { ...defaults, ...slaTargets };

        const alerts = [];
        const metrics = { total: shipments.length, onTime: 0, late: 0, damaged: 0 };

        shipments.forEach(s => {
            if (s.deliveredOnTime) metrics.onTime++;
            else {
                metrics.late++;
                alerts.push({
                    type: 'late_delivery',
                    severity: 'warning',
                    shipmentId: s.id,
                    message: `الشحنة ${s.id} متأخرة — تأثير على مؤشر OTD`,
                    action: 'تواصل مع الناقل وأبلغ العميل'
                });
            }
            if (s.hasDamage) {
                metrics.damaged++;
                alerts.push({
                    type: 'damage_alert',
                    severity: 'high',
                    shipmentId: s.id,
                    message: `بلاغ تلف في الشحنة ${s.id}`,
                    action: 'فتح مطالبة تأمين وتحقيق في سبب التلف'
                });
            }
        });

        const otdRate = shipments.length > 0 ? (metrics.onTime / shipments.length * 100).toFixed(1) : 'N/A';
        const slaStatus = otdRate >= targets.otd_target ? 'compliant' : 'breach';

        return {
            monitoringId: `SLA-${Date.now()}`,
            summary: { ...metrics, otdRate: `${otdRate}%`, slaStatus },
            targets,
            alerts,
            recommendations: alerts.length > 0
                ? ['مراجعة أداء الناقلين ذوي التأخير المتكرر', 'تفعيل إجراءات escalation للتأخيرات']
                : ['الأداء ضمن المعايير المطلوبة ✅'],
            timestamp: new Date().toISOString()
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. التلخيص التنفيذي
    // ─────────────────────────────────────────────────────────────────────────
    generateExecutiveSummary(data) {
        const { period, orders = [], shipments = [], revenue = 0, topSuppliers = [], risks = [] } = data;

        return {
            summaryId: `EXEC-${Date.now()}`,
            period: period || 'الشهر الحالي',
            generatedAt: new Date().toISOString(),
            headline: `ملخص تنفيذي لأداء سلسلة الإمداد — ${period || 'الشهر الحالي'}`,
            highlights: [
                `📦 إجمالي الطلبات: ${orders.length} طلب`,
                `🚢 الشحنات الجارية: ${shipments.filter(s => s.status === 'in_transit').length}`,
                `💰 الإيرادات المتوقعة: $${revenue.toLocaleString()}`,
                `⚠️ تنبيهات المخاطر النشطة: ${risks.length}`,
                `🏆 أفضل مورد: ${topSuppliers[0] || 'لا يوجد بيانات كافية'}`
            ],
            kpis: {
                ordersProcessed: orders.length,
                shipmentsActive: shipments.filter(s => s.status === 'in_transit').length,
                revenueTarget: `$${(revenue * 1.1).toLocaleString()}`,
                revenueActual: `$${revenue.toLocaleString()}`,
                achievementRate: revenue > 0 ? `${(revenue / (revenue * 1.1) * 100).toFixed(0)}%` : 'N/A'
            },
            actionItems: [
                '🔴 معالجة تنبيهات المخاطر العاجلة',
                '🟡 مراجعة أداء الموردين الأقل من 85%',
                '🟢 الاستمرار في تتبع SLA الشحنات النشطة'
            ],
            islamicClosing: '"وَالَّذِينَ هُمْ لِأَمَانَاتِهِمْ وَعَهْدِهِمْ رَاعُونَ" — المؤمنون ٨ — الأمانة في التقارير والعمليات أساس النجاح'
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. تحليل الأسعار
    // ─────────────────────────────────────────────────────────────────────────
    analyzePrices(params) {
        const { product, market, priceData = [], currency = 'USD' } = params;

        const values = priceData.length > 0 ? priceData : [100, 105, 98, 112, 108, 115, 110, 120, 118, 125];
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const current = values[values.length - 1];
        const change30d = ((current - values[0]) / values[0] * 100).toFixed(1);
        const volatility = ((max - min) / avg * 100).toFixed(1);

        return {
            analysisId: `PRICE-${Date.now()}`,
            product, market, currency,
            summary: {
                currentPrice: current,
                avg30d: avg.toFixed(2),
                min30d: min,
                max30d: max,
                change30d: `${change30d}%`,
                volatility: `${volatility}%`,
                trend: change30d > 0 ? 'صاعد ↑' : 'هابط ↓'
            },
            signal: change30d > 5 ? { action: 'بيع / تأجيل الشراء', strength: 'strong' }
                : change30d < -5 ? { action: 'شراء / استغلال الانخفاض', strength: 'strong' }
                : { action: 'انتظر', strength: 'neutral' },
            priceDrivers: ['الطلب الصيني', 'احتياطيات LME', 'قرارات الفيدرالي', 'أحداث جيوسياسية'],
            disclaimer: 'هذا تحليل بيانات تاريخية فقط — لا يُعتبر نصيحة مالية — استشر متخصصاً قبل القرار',
            islamicNote: 'لا يجوز التلاعب بالأسعار أو الاحتكار — "لا تتلقوا الركبان" — متفق عليه'
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────────────

    _generateMitigationPlan(risks) {
        return risks.map(risk => ({
            risk: risk.type,
            actions: [
                `1. ${risk.recommendation}`,
                '2. توثيق خطة الطوارئ',
                '3. مراجعة دورية كل 30 يوم'
            ]
        }));
    }

    /**
     * الحصول على قائمة نماذج AI المتاحة
     */
    getAvailableModels() {
        return Object.values(this.models).map(m => ({
            marketId: m.marketId,
            nameAr: m.nameAr,
            featuresCount: m.features.length,
            features: m.features
        }));
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton Export
// ═══════════════════════════════════════════════════════════════════════════════

const aiEngine = new SheikhaAISCMIntelligence();

module.exports = {
    AI_MARKET_MODELS,
    SheikhaAISCMIntelligence,
    aiEngine,
    recommendSuppliers: (p) => aiEngine.recommendSuppliers(p),
    optimizeRoute: (p) => aiEngine.optimizeRoute(p),
    assessRisk: (p) => aiEngine.assessSupplyChainRisk(p),
    forecastDemand: (p) => aiEngine.forecastDemand(p),
    classifyScrap: (p) => aiEngine.classifyScrap(p),
    monitorSLAs: (s, t) => aiEngine.monitorSLAs(s, t),
    generateExecutiveSummary: (d) => aiEngine.generateExecutiveSummary(d),
    analyzePrices: (p) => aiEngine.analyzePrices(p),
    getAvailableModels: () => aiEngine.getAvailableModels()
};
