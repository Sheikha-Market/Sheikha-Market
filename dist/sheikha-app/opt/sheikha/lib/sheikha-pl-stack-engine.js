// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚛 SHEIKHA COMPLETE PL STACK ENGINE
 * منظومة خدمات اللوجستيات الشاملة — 2PL / 3PL / 4PL / 5PL / 360PL / 3DPL
 * ═══════════════════════════════════════════════════════════════════════════════
 * "لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ" — قريش ١-٢
 * "وَأَوْفُوا بِالْعَهْدِ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا" — الإسراء ٣٤
 *
 * الخدمات:
 * ✅ 2PL  — Carrier / الناقل المباشر
 * ✅ 3PL  — Third Party Logistics / لوجستيات الطرف الثالث
 * ✅ 4PL  — Fourth Party Logistics / مدير سلسلة الإمداد
 * ✅ 5PL  — Fifth Party Logistics / شبكة رقمية موحدة
 * ✅ 360PL — Full-Circle Integrated Logistics / لوجستيات 360 درجة
 * ✅ 3DPL — Data-Driven Digital Logistics / لوجستيات رقمية تحليلية
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// تعريفات خدمات PL الشاملة
// ═══════════════════════════════════════════════════════════════════════════════

const PL_DEFINITIONS = {

    // ─────────────────────────────────────────────────────────────────────────
    // 2PL — الناقل المباشر (Carrier)
    // ─────────────────────────────────────────────────────────────────────────
    '2PL': {
        id: '2PL',
        nameAr: 'ناقل مباشر',
        nameEn: 'Second Party Logistics (Carrier)',
        description: 'الشركة تمتلك أسطولها الخاص من الشاحنات / السفن / الطائرات وتنفذ النقل بنفسها',
        sheikhaRole: 'شيخة تربطك بناقلين مباشرين محليين ودوليين وتدير عروضهم',
        services: [
            'نقل بري مباشر بأسطول مملوك',
            'نقل بحري بسفن مملوكة أو مستأجرة',
            'نقل جوي بطائرات شحن',
            'نقل بالسكة الحديدية',
            'إدارة السائقين والأطقم'
        ],
        whoUses: ['المصانع الكبرى التي تمتلك أساطيل', 'شركات التوزيع الكبرى', 'شركات النفط والغاز'],
        strengths: ['تحكم كامل في الأسطول', 'تكاليف أقل على المدى البعيد', 'موثوقية عالية'],
        weaknesses: ['رأس مال ضخم', 'تعقيد التشغيل', 'محدودية الشبكة'],
        sheikhaIntegration: {
            carrierDirectory: 'دليل شامل للناقلين المعتمدين بالعالم',
            realTimeTracking: 'تتبع لحظي لكل مركبة / سفينة / رحلة',
            rateComparison: 'مقارنة أسعار ناقلين متعددين',
            performanceScore: 'تقييم أداء الناقل (OTP, damage rate, compliance)',
            bookingAPI: 'API لحجز مباشر عبر أنظمة الناقل',
            compliance: 'فحص الاعتمادات والتراخيص تلقائياً'
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 3PL — لوجستيات الطرف الثالث
    // ─────────────────────────────────────────────────────────────────────────
    '3PL': {
        id: '3PL',
        nameAr: 'لوجستيات الطرف الثالث',
        nameEn: 'Third Party Logistics',
        description: 'شركة متخصصة في تقديم خدمات لوجستية منفصلة: نقل + تخزين + توزيع + جمارك',
        sheikhaRole: 'شيخة تعمل كمنصة 3PL وتربط عملاءها بشركاء 3PL معتمدين',
        services: [
            {
                category: 'transportation',
                nameAr: 'إدارة النقل',
                items: [
                    'تخطيط المسارات وتحسينها',
                    'اختيار الناقل الأنسب',
                    'إدارة التوثيق (BL, AWB, CMR)',
                    'التأمين على الشحنات',
                    'تتبع الشحنات لحظياً',
                    'إدارة الشحن البارد (Cold Chain)',
                    'نقل المواد الخطرة (ADR/IMDG)',
                    'شحن المشاريع الضخمة (Project Cargo)'
                ]
            },
            {
                category: 'warehousing',
                nameAr: 'التخزين والمستودعات',
                items: [
                    'استقبال وتفريغ البضائع',
                    'جرد وإدارة المخزون',
                    'تخزين بالرفوف أو بالأرض',
                    'تخزين خطوط الإنتاج (VMI)',
                    'تخزين مبرد / مجمد',
                    'مستودع جمركي (Bonded Warehouse)',
                    'تعبئة وتغليف (Value-Added Services)',
                    'Cross-docking سريع'
                ]
            },
            {
                category: 'distribution',
                nameAr: 'التوزيع والتسليم',
                items: [
                    'التوزيع للنقطة الأخيرة (Last Mile)',
                    'توزيع بالجملة لموزعين',
                    'خدمة تجميع الطلبات (Order Fulfilment)',
                    'إدارة الإرجاع (Reverse Logistics)'
                ]
            },
            {
                category: 'customs',
                nameAr: 'التخليص الجمركي',
                items: [
                    'إعداد وثائق التصدير/الاستيراد',
                    'تصنيف HS Code',
                    'دفع الرسوم والجمارك',
                    'الامتثال لقواعد المنشأ',
                    'ATA Carnet والمناطق الحرة'
                ]
            }
        ],
        certifications: ['ISO 9001', 'TAPA (Security)', 'GDP (Pharma)', 'IATA (Air)', 'FIATA', 'CSCMP'],
        globalNetworks: ['DHL Supply Chain', 'DB Schenker', 'Kuehne+Nagel', 'Geodis', 'DSV', 'XPO', 'GWC (Qatar)', 'Almajdouie (KSA)', 'NAQEL', 'Agility'],
        sheikhaIntegration: {
            tenderManagement: 'إنشاء مناقصات 3PL وتلقي العروض وتقييمها',
            contractManagement: 'إدارة عقود 3PL مع SLA وKPI',
            visibilityPlatform: 'رؤية موحدة لكل شحنات العميل عبر مزودي 3PL متعددين',
            invoiceReconciliation: 'مطابقة فواتير 3PL تلقائياً',
            kpiDashboard: 'OTP, OTIF, damage rate, cost per order, fill rate'
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 4PL — مدير سلسلة الإمداد الشامل
    // ─────────────────────────────────────────────────────────────────────────
    '4PL': {
        id: '4PL',
        nameAr: 'مدير سلسلة الإمداد الشامل',
        nameEn: 'Fourth Party Logistics (Lead Logistics Provider)',
        description: 'إدارة كاملة لسلسلة الإمداد نيابةً عن العميل — يُنسّق بين عدة 3PL وناقلين وموردين',
        sheikhaRole: 'شيخة تعمل كـ 4PL للعملاء الكبار — تُدير كل سلسلة إمدادهم من نقطة واحدة',
        scope: [
            'استراتيجية سلسلة الإمداد والتصميم',
            'اختيار وإدارة 3PLs متعددين',
            'تحسين الشبكة اللوجستية',
            'إدارة العلاقات مع الموردين',
            'تخطيط الطلب (Demand Planning)',
            'S&OP (Sales & Operations Planning)',
            'إدارة المخزون العالمي',
            'رؤية كاملة من المورد للعميل النهائي',
            'إدارة المخاطر وخطط الطوارئ',
            'تحليل التكاليف وتحسين الإنفاق',
            'الامتثال التنظيمي والجمركي العالمي',
            'تقارير تنفيذية وKPIs'
        ],
        controlTower: {
            description: 'لوحة تحكم مركزية ترصد كل سلسلة الإمداد',
            capabilities: [
                'رؤية كاملة للطلبات والشحنات والمخزون',
                'تنبيهات استباقية للانحرافات',
                'قرارات آنية مبنية على بيانات',
                'تنسيق بين موردين وناقلين وعملاء',
                'استجابة فورية للأزمات'
            ]
        },
        KPIs: {
            delivery: ['OTIF (On Time In Full)', 'OTP (On Time Performance)', 'Fill Rate'],
            cost: ['Cost per Order', 'Freight Spend', 'Logistics as % of Revenue'],
            quality: ['Damage Rate', 'Claims Rate', 'Documentation Accuracy'],
            inventory: ['Inventory Turnover', 'Days of Supply', 'Stockout Rate'],
            supplier: ['Supplier OTIF', 'Lead Time Variability', 'Perfect Order Rate']
        },
        sheikhaValue: [
            'عميل واحد — نقطة اتصال واحدة',
            'تقليل التكاليف اللوجستية 15-30%',
            'رؤية كاملة وتقارير موحدة',
            'تحسين مستمر قائم على البيانات',
            'توسع دولي بدون بناء شبكة خاصة'
        ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 5PL — شبكة لوجستيات رقمية موحدة
    // ─────────────────────────────────────────────────────────────────────────
    '5PL': {
        id: '5PL',
        nameAr: 'شبكة اللوجستيات الرقمية',
        nameEn: 'Fifth Party Logistics (Digital Logistics Network)',
        description: 'منصة رقمية تجمع شبكة من 3PLs و 4PLs وتقدم خدمات موحدة للعملاء عبر التقنية',
        sheikhaRole: 'شيخة تعمل كمنصة 5PL — تربط آلاف الموردين والناقلين والعملاء في شبكة رقمية واحدة',
        capabilities: [
            'Marketplace للخدمات اللوجستية',
            'ربط 3PLs و 4PLs في شبكة موحدة',
            'Marketplace لتبادل الطاقة الفارغة (Capacity Exchange)',
            'تحسين الشبكة بالذكاء الاصطناعي',
            'توصيل API مع ERPs وأنظمة العملاء',
            'نماذج تسعير ديناميكية',
            'إدارة مخاطر متعددة الأطراف',
            'تتبع كارمي عبر الشبكة بالكامل',
            'تسوية مدفوعات موحدة بين الأطراف'
        ],
        networkEffect: 'كل عميل وكل ناقل ينضم يزيد من قيمة الشبكة للجميع',
        aiFeatures: [
            'تحسين توزيع الحمولات (Load Optimization)',
            'توقع الطلب عبر الشبكة',
            'تسعير ديناميكي بالطلب والعرض',
            'كشف تعارضات الطاقة الفارغة',
            'تنسيق تلقائي بين 3PLs المختلفين'
        ],
        digitalFoundation: {
            APIs: 'REST APIs + Webhooks + EDI للتكامل مع أي نظام',
            dataStandards: ['GS1', 'EDIFACT', 'ANSI X12', 'OpenAPI'],
            blockchain: 'سجل لا مركزي لتتبع الشحنات ووثائق التجارة',
            iot: 'أجهزة IoT لتتبع درجة الحرارة والرطوبة والموقع'
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 360PL — لوجستيات 360 درجة (رؤية كاملة متكاملة)
    // ─────────────────────────────────────────────────────────────────────────
    '360PL': {
        id: '360PL',
        nameAr: 'لوجستيات 360 درجة',
        nameEn: '360° Integrated Logistics',
        description: 'رؤية كاملة لدورة حياة المنتج من الخام حتى التسليم النهائي وإعادة التدوير',
        sheikhaRole: 'شيخة توفر رؤية 360° للعميل — من المنجم أو المصنع حتى العميل النهائي والسكراب',
        lifecycle: [
            { step: 1, phase: 'المصدر', nameEn: 'Source', icon: '⛏️', activities: ['تعدين / زراعة / تصنيع', 'فحص جودة المصدر', 'وثائق المنشأ وشهادات'] },
            { step: 2, phase: 'الشراء', nameEn: 'Procurement', icon: '🛒', activities: ['RFQ / مناقصة', 'اختيار المورد', 'إصدار PO', 'عقود التوريد'] },
            { step: 3, phase: 'الإنتاج', nameEn: 'Production', icon: '🏭', activities: ['BOM وتخطيط المواد', 'مراقبة التصنيع', 'فحص خط الإنتاج', 'تقارير أوامر الإنتاج'] },
            { step: 4, phase: 'التخزين الأولي', nameEn: 'Origin Storage', icon: '🏪', activities: ['استقبال وإدخال مخزون', 'فحص ومعاينة', 'تنظيم وتصنيف'] },
            { step: 5, phase: 'نقل التصدير', nameEn: 'Export Transport', icon: '🚛', activities: ['تعبئة وتحميل', 'وثائق تصدير', 'تخليص جمركي صادر', 'تسليم للميناء/المطار'] },
            { step: 6, phase: 'الشحن الدولي', nameEn: 'International Freight', icon: '🚢', activities: ['بحري / جوي / بري', 'تتبع لحظي', 'تأمين الشحنة', 'وثائق نقل دولي'] },
            { step: 7, phase: 'الاستيراد والجمارك', nameEn: 'Import & Customs', icon: '🛃', activities: ['تصنيف HS Code', 'دفع رسوم الاستيراد', 'فحص الجمارك', 'فك الحجز'] },
            { step: 8, phase: 'التخزين النهائي', nameEn: 'Destination Storage', icon: '🏢', activities: ['استقبال في المستودع', 'تحديث المخزون', 'جاهزية التوزيع'] },
            { step: 9, phase: 'التوزيع والتسليم', nameEn: 'Distribution & Delivery', icon: '📦', activities: ['اختيار الطلبات', 'تعبئة', 'توزيع آخر ميل', 'تأكيد الاستلام'] },
            { step: 10, phase: 'الفوترة والدفع', nameEn: 'Invoicing & Payment', icon: '💳', activities: ['فاتورة تجارية', 'Letter of Credit / دفع', 'مطابقة السداد'] },
            { step: 11, phase: 'ما بعد التسليم', nameEn: 'After Delivery', icon: '🔄', activities: ['تقييم المورد', 'مطالبات جودة وتأمين', 'إرجاع ومبادلة'] },
            { step: 12, phase: 'السكراب والتدوير', nameEn: 'End-of-Life / Recycling', icon: '♻️', activities: ['تصنيف سكراب', 'بيع للمعالجين', 'شهادات بيئية', 'تقرير Carbon Footprint'] }
        ],
        digitalDocuments: [
            'Bill of Lading (BL)',
            'Airway Bill (AWB)',
            'Certificate of Origin',
            'Commercial Invoice',
            'Packing List',
            'Letter of Credit (LC)',
            'Certificate of Inspection',
            'Phytosanitary / Health Certificate',
            'Dangerous Goods Declaration',
            'Electronic Export Information (EEI)',
            'HS Code Classification Report'
        ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 3DPL — لوجستيات رقمية تحليلية
    // ─────────────────────────────────────────────────────────────────────────
    '3DPL': {
        id: '3DPL',
        nameAr: 'اللوجستيات الرقمية التحليلية',
        nameEn: 'Data-Driven Digital Logistics (3DPL)',
        description: 'خدمات لوجستية تقوم بشكل أساسي على البيانات والذكاء الاصطناعي والتحسين المستمر',
        sheikhaRole: 'شيخة تدمج طبقة ذكاء بيانات فوق كل خدماتها اللوجستية',
        dataPillars: [
            {
                pillar: 'رؤية البيانات',
                nameEn: 'Data Visibility',
                icon: '👁️',
                capabilities: [
                    'تتبع لحظي لكل شحنة وأصل',
                    'IoT sensors على الحاويات والمركبات',
                    'تكامل بيانات من موردين وناقلين',
                    'لوحة رؤية موحدة Control Tower'
                ]
            },
            {
                pillar: 'التحليل والتنبيه',
                nameEn: 'Analytics & Alerts',
                icon: '📊',
                capabilities: [
                    'تحليل أداء الناقلين والموردين',
                    'رصد SLAs ومؤشرات الأداء',
                    'تنبيهات فورية للانحرافات',
                    'تحليل جذر أسباب التأخير',
                    'تقارير Carbon Footprint'
                ]
            },
            {
                pillar: 'الذكاء الاصطناعي',
                nameEn: 'AI & Machine Learning',
                icon: '🧠',
                capabilities: [
                    'توقع أوقات العبور (ETA Prediction)',
                    'تحسين المسارات ديناميكياً',
                    'توقع تعطل المعدات (Predictive Maintenance)',
                    'كشف الشذوذات في البيانات',
                    'اقتراح أفضل ناقل وأفضل مسار'
                ]
            },
            {
                pillar: 'التحسين المستمر',
                nameEn: 'Continuous Improvement',
                icon: '📈',
                capabilities: [
                    'تحليل benchmarking لسلاسل الإمداد',
                    'تحديد فرص تخفيض التكاليف',
                    'تحسين شبكة التوزيع',
                    'نماذج Simulation لسيناريوهات',
                    'خطط Playbook للأزمات'
                ]
            },
            {
                pillar: 'التكامل الرقمي',
                nameEn: 'Digital Integration',
                icon: '🔗',
                capabilities: [
                    'API Gateway لكل الأنظمة',
                    'EDI / AS2 / SFTP',
                    'Webhooks للأحداث الفورية',
                    'تكامل ERP (SAP, Oracle, Dynamics)',
                    'Master Data Management'
                ]
            }
        ],
        aiModels: {
            etaPrediction: {
                nameAr: 'توقع وقت الوصول',
                inputs: ['رقم الرحلة', 'الطقس', 'ازدحام الموانئ', 'أداء الناقل السابق'],
                output: 'ETA بدقة ±2 ساعة (بحري) / ±30 دقيقة (بري)',
                accuracy: '85-92%'
            },
            routeOptimization: {
                nameAr: 'تحسين المسار',
                inputs: ['نقطة الانطلاق', 'الوجهة', 'نوع البضاعة', 'تكاليف الوقود', 'قيود الوزن'],
                output: 'أقل مسار تكلفة + أسرع وقت',
                savings: '10-25% تخفيض وقود'
            },
            demandForecasting: {
                nameAr: 'توقع الطلب اللوجستي',
                inputs: ['بيانات شحنات سابقة', 'خطط مبيعات', 'مواسم وأحداث'],
                output: 'خطة طاقة لوجستية 3-12 شهر',
                accuracy: '80-90%'
            },
            riskDetection: {
                nameAr: 'كشف مخاطر سلاسل الإمداد',
                inputs: ['بيانات موردين', 'أحداث جيوسياسية', 'كوارث طبيعية', 'بيانات ائتمان'],
                output: 'تقييم مخاطر + بدائل بديلة',
                alerts: 'تنبيهات استباقية قبل 72 ساعة من الحدث'
            }
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// خدمات النقل المتخصصة لكل سوق
// ═══════════════════════════════════════════════════════════════════════════════

const SPECIALIZED_LOGISTICS = {
    metals_scrap: {
        nameAr: 'لوجستيات المعادن والسكراب',
        requirements: [
            'معدات تحميل ثقيلة (رافعات، جرافات)',
            'حاويات مفتوحة (Open Top / Flat Rack)',
            'ناقلات بضائع جافة (Bulk Carrier)',
            'ميناء مجهز لتحميل البضائع السائبة',
            'تحليل مختبري للنقاوة والجودة',
            'شهادة السكراب (Certificate of Analysis)',
            'تفتيش قبل الشحن (PSI / Third Party Inspection)',
            'بروتوكولات السلامة للمواد الخطرة'
        ],
        documents: ['Scrap Metal Certificate', 'Material Test Report (MTR)', 'Non-Radioactivity Certificate', 'Fumigation Certificate (if required)'],
        specialHandling: ['تغطية من الرطوبة', 'عدم خلط أنواع المعادن', 'وزن دقيق بميزان رسمي'],
        vessels: ['Bulk Carrier', 'Tween Deck', 'Container (for packed scrap)'],
        inspectionBodies: ['SGS', 'Intertek', 'Bureau Veritas', 'CQST', 'Alex Stewart']
    },
    precious_metals: {
        nameAr: 'لوجستيات المعادن الثمينة',
        requirements: [
            'شحن مؤمّن بالكامل (Bullion Freight)',
            'رافق أمني مسلح',
            'صناديق مقاومة للحريق',
            'سيارات نقل أموال أو طائرة شحن خاصة',
            'تتبع GPS مشفر',
            'وثائق تصدير/استيراد خاصة بالمعادن الثمينة'
        ],
        providers: ['Brinks Global', 'Loomis International', 'G4S', 'Malca-Amit'],
        insurance: 'تأمين متخصص (Marine Cargo + Inland Transit) بقيمة كاملة',
        compliance: ['LBMA Responsible Sourcing', 'FATF AML/CFT', 'Conflict Minerals (Dodd-Frank)']
    },
    petroleum_chemicals: {
        nameAr: 'لوجستيات البترول والكيماويات',
        requirements: [
            'ناقلات بترول (VLCC, Suezmax, Aframax)',
            'صهاريج كيميائية معتمدة',
            'شهادة ISPS للسفن',
            'الامتثال لـ MARPOL (البيئة البحرية)',
            'بروتوكولات سلامة HAZMAT',
            'شهادة ADR (للنقل البري)'
        ],
        documents: ['Bill of Lading (Tanker)', 'Certificate of Quality', 'Tank Inspection Certificate', 'MSDS / SDS Sheet'],
        inspectionBodies: ['SGS', 'Saybolt', 'Core Laboratories', 'Inspectorate']
    },
    agriculture_food: {
        nameAr: 'لوجستيات الزراعة والغذاء',
        requirements: [
            'حاويات مبردة (Reefer) للسلع الحساسة',
            'سفن حبوب (Grain Carrier)',
            'صوامع وخزانات مبرّدة',
            'شهادة صحية وبيتوسانية',
            'التحقق من شهادات الحلال',
            'مراقبة الرطوبة والحرارة المستمرة'
        ],
        documents: ['Phytosanitary Certificate', 'Health Certificate', 'Fumigation Certificate', 'Certificate of Analysis', 'Halal Certificate'],
        coldChainMonitoring: { dataLoggers: true, alertThreshold: '±2°C', reportingInterval: '15min' }
    },
    mining_heavy_equipment: {
        nameAr: 'لوجستيات معدات التعدين الثقيلة',
        requirements: [
            'شحن معدات ثقيلة (Heavy Lift)',
            'صناديق ومنصات تحميل خاصة',
            'رسوم عبور الطرق الثقيلة',
            'تصاريح نقل استثنائي',
            'أطقم تجميع وتركيب في الموقع'
        ],
        carriers: ['Project Cargo specialists', 'Jumbo Shipping', 'Mammoet', 'ALE', 'Heavy Lift Group']
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// كلاس إدارة PL Stack
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaPLStackEngine extends EventEmitter {
    constructor() {
        super();
        this.plDefinitions = PL_DEFINITIONS;
        this.specializedLogistics = SPECIALIZED_LOGISTICS;
        this.activeShipments = new Map();
        this.carriers = new Map();
        this.warehouses = new Map();
        this._initDefaultData();
    }

    _initDefaultData() {
        // عينة من الناقلين المعتمدين
        this.carriers.set('DHL-SC', {
            id: 'DHL-SC', name: 'DHL Supply Chain', type: '3PL',
            coverage: 'global', services: ['warehousing', 'transport', 'customs'],
            rating: 4.5, certifications: ['ISO 9001', 'TAPA', 'AEO'],
            contacts: { email: 'enterprise@dhl.com', phone: '+49 228 182 63 000' }
        });
        this.carriers.set('NAQEL', {
            id: 'NAQEL', name: 'نقل — Naqel Express', type: '2PL/3PL',
            coverage: 'saudi_arabia_gcc', services: ['last_mile', 'express', 'freight'],
            rating: 4.2, certifications: ['ISO 9001', 'ZATCA Approved'],
            contacts: { email: 'business@naqel.com.sa', phone: '+966 920 000 555' }
        });
        this.carriers.set('ALMAJDOUIE', {
            id: 'ALMAJDOUIE', name: 'المجدوعي للخدمات اللوجستية', type: '3PL/4PL',
            coverage: 'ksa_gcc_mena', services: ['heavy_transport', 'warehousing', 'project_cargo'],
            rating: 4.6, certifications: ['ISO 9001', 'OHSAS 18001'],
            contacts: { email: 'info@almajdouie.com', phone: '+966 13 835 0000' }
        });
        this.carriers.set('MAERSK', {
            id: 'MAERSK', name: 'Maersk Line', type: '2PL',
            coverage: 'global_ocean', services: ['FCL', 'LCL', 'bulk', 'cold_chain'],
            rating: 4.3, certifications: ['ISM', 'ISPS', 'ISO 14001'],
            contacts: { email: 'customer.service@maersk.com', phone: '+45 3363 3363' }
        });
    }

    /**
     * الحصول على تعريف خدمة PL
     */
    getPLDefinition(plType) {
        return this.plDefinitions[plType] || null;
    }

    /**
     * الحصول على جميع أنواع PL
     */
    getAllPLTypes() {
        return Object.values(this.plDefinitions).map(pl => ({
            id: pl.id,
            nameAr: pl.nameAr,
            nameEn: pl.nameEn,
            description: pl.description,
            sheikhaRole: pl.sheikhaRole
        }));
    }

    /**
     * اقتراح مستوى PL المناسب للعميل
     */
    recommendPLLevel(clientProfile) {
        const { companySize, supplyChainComplexity, internationalScope, internalCapability, budget } = clientProfile;

        if (companySize === 'small' || internalCapability === 'high') {
            return { recommended: '2PL', reason: 'شركة صغيرة أو لديها كفاءة داخلية — التعامل المباشر مع الناقل يكفي' };
        }
        if (companySize === 'medium' && !internationalScope) {
            return { recommended: '3PL', reason: 'شركة متوسطة — تعهيد اللوجستيات لمتخصص يوفر تكلفة وجودة' };
        }
        if (internationalScope && supplyChainComplexity === 'complex') {
            return { recommended: '4PL', reason: 'عمليات دولية معقدة — إدارة موحدة لكل سلسلة الإمداد' };
        }
        if (companySize === 'large' && budget === 'high') {
            return { recommended: '5PL', reason: 'مجموعة كبرى تريد شبكة رقمية كاملة مع تحسين مستمر' };
        }
        if (supplyChainComplexity === 'extreme') {
            return { recommended: '360PL', reason: 'رؤية كاملة من المصدر للسكراب — مناسب للمجموعات الصناعية الكبرى' };
        }
        return { recommended: '3PL', reason: 'الخيار الافتراضي المناسب لأغلب الشركات' };
    }

    /**
     * إنشاء طلب شحنة جديدة
     */
    createShipmentRequest(data) {
        const id = `SHP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const shipment = {
            id,
            status: 'pending_assignment',
            plType: data.plType || '3PL',
            origin: data.origin,
            destination: data.destination,
            commodity: data.commodity,
            quantity: data.quantity,
            unit: data.unit || 'MT',
            incoterm: data.incoterm || 'CIF',
            requestedDelivery: data.requestedDelivery,
            specialRequirements: data.specialRequirements || [],
            documents: [],
            timeline: [{ event: 'created', timestamp: new Date().toISOString(), note: 'طلب الشحن أُنشئ' }],
            costEstimate: null,
            assignedCarrier: null,
            tracking: null,
            createdAt: new Date().toISOString()
        };
        this.activeShipments.set(id, shipment);
        this.emit('shipment:created', shipment);
        return shipment;
    }

    /**
     * تحديث حالة الشحنة
     */
    updateShipmentStatus(shipmentId, status, note = '') {
        const shipment = this.activeShipments.get(shipmentId);
        if (!shipment) return { error: 'شحنة غير موجودة' };
        shipment.status = status;
        shipment.timeline.push({ event: status, timestamp: new Date().toISOString(), note });
        this.emit('shipment:updated', shipment);
        return shipment;
    }

    /**
     * حساب تكلفة تقديرية للشحنة
     */
    estimateShipmentCost(params) {
        const { origin, destination, commodity, quantity_mt, transport_mode, plType, urgent } = params;

        const baseRates = {
            sea: 50, air: 800, road: 80, rail: 40
        };
        const plMultiplier = { '2PL': 1.0, '3PL': 1.15, '4PL': 1.25, '5PL': 1.20, '360PL': 1.30, '3DPL': 1.35 };
        const commodityMultiplier = {
            metals: 1.0, scrap: 0.9, precious_metals: 2.0, petroleum: 1.1,
            chemicals: 1.3, food: 1.2, project_cargo: 2.5, default: 1.0
        };

        const mode = transport_mode || 'sea';
        const rate = baseRates[mode] || baseRates.sea;
        const plMult = plMultiplier[plType] || 1.15;
        const commMult = commodityMultiplier[commodity] || commodityMultiplier.default;
        const urgencyMult = urgent ? 1.5 : 1.0;

        const qty = Number(quantity_mt) || 1;
        const freightBase = qty * rate;
        const total = freightBase * plMult * commMult * urgencyMult;

        return {
            shipmentParams: params,
            breakdown: {
                base_freight: `$${freightBase.toFixed(0)}`,
                pl_management_fee: `$${(freightBase * (plMult - 1)).toFixed(0)}`,
                commodity_adjustment: `${((commMult - 1) * 100).toFixed(0)}%`,
                urgency_premium: urgent ? '50%' : '0%',
                estimated_total: `$${total.toFixed(0)}`,
                per_mt: `$${(total / qty).toFixed(2)}/MT`
            },
            note: 'تكلفة تقديرية — احصل على عروض رسمية من خلال منصة شيخة',
            disclaimer: 'الأسعار تتغير حسب الطلب وأسعار الوقود وتوفر الناقلين'
        };
    }

    /**
     * لوحة إحصائيات سريعة
     */
    getDashboardStats() {
        const shipments = Array.from(this.activeShipments.values());
        const byStatus = shipments.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
        }, {});
        return {
            totalShipments: shipments.length,
            byStatus,
            carriersRegistered: this.carriers.size,
            warehousesRegistered: this.warehouses.size,
            plTypesAvailable: Object.keys(this.plDefinitions).length
        };
    }

    /**
     * الحصول على لوجستيات متخصصة حسب نوع السوق
     */
    getSpecializedLogistics(marketType) {
        return this.specializedLogistics[marketType] || null;
    }

    /**
     * الحصول على جميع الناقلين
     */
    getCarriers(filter = {}) {
        let carriers = Array.from(this.carriers.values());
        if (filter.type) carriers = carriers.filter(c => c.type.includes(filter.type));
        if (filter.coverage) carriers = carriers.filter(c => c.coverage.includes(filter.coverage));
        return carriers;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton Export
// ═══════════════════════════════════════════════════════════════════════════════

const plEngine = new SheikhaPLStackEngine();

module.exports = {
    SheikhaPLStackEngine,
    PL_DEFINITIONS,
    SPECIALIZED_LOGISTICS,
    plEngine,
    getPLDefinition: (type) => plEngine.getPLDefinition(type),
    getAllPLTypes: () => plEngine.getAllPLTypes(),
    recommendPLLevel: (profile) => plEngine.recommendPLLevel(profile),
    createShipmentRequest: (data) => plEngine.createShipmentRequest(data),
    estimateShipmentCost: (params) => plEngine.estimateShipmentCost(params),
    getDashboardStats: () => plEngine.getDashboardStats()
};
