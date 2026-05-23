/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  بسم الله الرحمن الرحيم                                                       ║
 * ║  منظومة سوق شيخة الرقمي الذكي — Smart Digital Market Engine                  ║
 * ║  «التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ»     ║
 * ║  الملكية الفكرية: سلمان أحمد بن سلمان الراجح — 2026                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * 7 أنظمة متكاملة:
 * ━━━━━━━━━━━━━━━━
 * 1. نظام المنتجات والتصنيف الشامل
 * 2. نظام التاجر الصدوق الأمين (الثقة والتقييم)
 * 3. نظام سلسلة الإمداد الرقمية (8 مراحل)
 * 4. الشبكة الرقمية الذكية (مصانع + مناجم + مصاهر + مخازن + نقل)
 * 5. نظام الأتمتة (توصيل + توريد + تسعير)
 * 6. نظام التحليلات والذكاء الاصطناعي
 * 7. الأساس الشرعي والملكية الفكرية
 *
 * المرجعية: القرآن الكريم والسنة النبوية الشريفة
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// الأساس الشرعي — كل نظام مرجعيته من الكتاب والسنة
// ═══════════════════════════════════════════════════════════════════════════════
const SHARIA_FOUNDATION = {
    tawheed: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
    commerce: {
        permission: { text: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾', ref: 'البقرة: 275' },
        justice:    { text: '﴿ وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ ﴾', ref: 'الأنعام: 152' },
        honesty:    { text: '﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ ﴾', ref: 'التوبة: 119' },
        noFraud:    { text: '﴿ وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ ﴾', ref: 'الأعراف: 85' },
        prosperity: { text: '﴿ هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا ﴾', ref: 'هود: 61' },
        iron:       { text: '﴿ وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ ﴾', ref: 'الحديد: 25' },
        noWaste:    { text: '﴿ وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ ﴾', ref: 'الأنعام: 141' },
        strength:   { text: '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾', ref: 'الأنفال: 60' }
    },
    hadith: {
        truthfulMerchant: { text: '«التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ»', ref: 'الترمذي' },
        noMonopoly:       { text: '«لا يحتكر إلا خاطئ»', ref: 'مسلم' },
        blessingInHonesty:{ text: '«البيّعان بالخيار ما لم يتفرقا فإن صدقا وبيّنا بُورك لهما في بيعهما»', ref: 'البخاري ومسلم' },
        noFraud:          { text: '«من غشنا فليس منا»', ref: 'مسلم' },
        excellence:       { text: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»', ref: 'البيهقي' },
        provision:        { text: '«الجالب مرزوق والمحتكر ملعون»', ref: 'ابن ماجه' },
        pricing:          { text: '«إن الله هو المسعّر القابض الباسط الرازق»', ref: 'أبو داود والترمذي' }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. نظام المنتجات والتصنيف الشامل
// ═══════════════════════════════════════════════════════════════════════════════
const PRODUCT_CLASSIFICATION = {
    // تصنيف HS الدولي للمعادن
    chapters: {
        26: { name: 'خامات معدنية', nameEn: 'Ores & Concentrates', icon: '⛏️' },
        28: { name: 'مواد كيميائية غير عضوية', nameEn: 'Inorganic Chemicals', icon: '🧪' },
        71: { name: 'معادن ثمينة', nameEn: 'Precious Metals', icon: '💎' },
        72: { name: 'حديد وصلب', nameEn: 'Iron & Steel', icon: '🏗️' },
        73: { name: 'مصنوعات الحديد', nameEn: 'Iron Articles', icon: '⚙️' },
        74: { name: 'نحاس', nameEn: 'Copper', icon: '🔶' },
        75: { name: 'نيكل', nameEn: 'Nickel', icon: '⬜' },
        76: { name: 'ألمنيوم', nameEn: 'Aluminum', icon: '🔲' },
        78: { name: 'رصاص', nameEn: 'Lead', icon: '⬛' },
        79: { name: 'زنك', nameEn: 'Zinc', icon: '🔳' },
        80: { name: 'قصدير', nameEn: 'Tin', icon: '▫️' },
        81: { name: 'معادن أخرى', nameEn: 'Other Base Metals', icon: '🔩' }
    },

    // مستويات الجودة (معايير دولية)
    qualityGrades: {
        premium:  { label: 'ممتاز', labelEn: 'Premium',  minPurity: 99, color: '#D4AF37', trust: 5 },
        high:     { label: 'عالي',  labelEn: 'High',     minPurity: 95, color: '#22c55e', trust: 4 },
        standard: { label: 'قياسي', labelEn: 'Standard', minPurity: 90, color: '#3b82f6', trust: 3 },
        good:     { label: 'جيد',   labelEn: 'Good',     minPurity: 80, color: '#64748b', trust: 2 },
        basic:    { label: 'أساسي', labelEn: 'Basic',    minPurity: 0,  color: '#94a3b8', trust: 1 }
    },

    // معايير ISRI للسكراب (المرجع العالمي)
    isriGrades: {
        HMS1: { code: '200-206', desc: 'حديد سكراب ثقيل', minThickness: '6mm', maxSize: '1.5m' },
        HMS2: { code: '207-210', desc: 'حديد سكراب مختلط', minThickness: '3mm', maxSize: '1.5m' },
        SHREDDED: { code: '211-213', desc: 'حديد مفروم', purity: '95%+' },
        BIRCH: { code: '230', desc: 'نحاس أصفر مطحون', purity: '95%+' },
        BERRY: { code: '240', desc: 'نحاس أحمر نظيف', purity: '99%+' },
        CANDY: { code: '251', desc: 'كابلات نحاس مغلفة', recovery: '85-90%' },
        TAINT: { code: '320-325', desc: 'ألمنيوم نظيف', purity: '99%+' },
        ZORBA: { code: '365', desc: 'ألمنيوم مختلط مفروم', recovery: '90-95%' }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. نظام التاجر الصدوق الأمين — 5 محاور تقييم
// ═══════════════════════════════════════════════════════════════════════════════
const TRUST_SYSTEM = {
    name: 'نظام التاجر الصدوق الأمين',
    hadith: SHARIA_FOUNDATION.hadith.truthfulMerchant,

    // 5 محاور تقييم
    axes: {
        honesty: {
            nameAr: 'الصدق', nameEn: 'Honesty', weight: 0.25, icon: '🤝',
            quran: SHARIA_FOUNDATION.commerce.honesty,
            metrics: ['مطابقة الوصف للمنتج', 'دقة الكميات', 'صحة المواصفات', 'شفافية التسعير']
        },
        trustworthiness: {
            nameAr: 'الأمانة', nameEn: 'Trustworthiness', weight: 0.25, icon: '🛡️',
            hadith: { text: '«أدِّ الأمانة إلى من ائتمنك»', ref: 'أبو داود والترمذي' },
            metrics: ['حماية بيانات العملاء', 'الالتزام بالعقود', 'حفظ حقوق الأطراف', 'السرية التجارية']
        },
        quality: {
            nameAr: 'جودة المنتج', nameEn: 'Product Quality', weight: 0.20, icon: '⭐',
            hadith: SHARIA_FOUNDATION.hadith.excellence,
            metrics: ['مطابقة المواصفات', 'الاتساق في الجودة', 'التغليف والتعبئة', 'شهادات الجودة']
        },
        delivery: {
            nameAr: 'الالتزام بالتسليم', nameEn: 'Delivery Commitment', weight: 0.15, icon: '🚛',
            metrics: ['التسليم في الموعد', 'سلامة الشحنة', 'التوثيق الكامل', 'التواصل المستمر']
        },
        fairPricing: {
            nameAr: 'السعر العادل', nameEn: 'Fair Pricing', weight: 0.15, icon: '⚖️',
            hadith: SHARIA_FOUNDATION.hadith.pricing,
            metrics: ['سعر تنافسي', 'لا احتكار', 'وضوح البنود', 'خصومات الكميات']
        }
    },

    // مستويات الشارات
    badges: [
        { min: 4.5, label: 'التاجر الصدوق الأمين', labelEn: 'The Truthful & Trustworthy Merchant', color: '#D4AF37', icon: '☪' },
        { min: 4.0, label: 'تاجر موثوق ممتاز', labelEn: 'Excellent Trusted Merchant', color: '#22c55e', icon: '✓✓' },
        { min: 3.5, label: 'تاجر موثوق', labelEn: 'Trusted Merchant', color: '#3b82f6', icon: '✓' },
        { min: 2.5, label: 'تاجر نشط', labelEn: 'Active Merchant', color: '#f59e0b', icon: '◆' },
        { min: 0,   label: 'تاجر جديد', labelEn: 'New Merchant', color: '#94a3b8', icon: '○' }
    ],

    // حساب التقييم الشامل
    calculateTrust(trader, orders, reviews) {
        const scores = {};
        let totalWeighted = 0;

        for (const [axis, config] of Object.entries(this.axes)) {
            const axisReviews = (reviews || []).filter(r => r.axis === axis);
            const avgScore = axisReviews.length > 0
                ? axisReviews.reduce((s, r) => s + r.score, 0) / axisReviews.length
                : (trader.rating || 3.5);
            scores[axis] = { score: Math.round(avgScore * 10) / 10, weight: config.weight };
            totalWeighted += avgScore * config.weight;
        }

        const overall = Math.round(totalWeighted * 10) / 10;
        const badge = this.badges.find(b => overall >= b.min) || this.badges[this.badges.length - 1];
        const totalOrders = (orders || []).length;
        const completedOrders = (orders || []).filter(o => o.status === 'completed').length;
        const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

        return {
            overall,
            scores,
            badge: badge.label,
            badgeEn: badge.labelEn,
            badgeColor: badge.color,
            badgeIcon: badge.icon,
            totalOrders,
            completedOrders,
            completionRate,
            totalReviews: (reviews || []).length,
            verified: trader.verified || false,
            TRUST_VERIFIED: overall >= 4.0,
            hadith: this.hadith
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. نظام سلسلة الإمداد الرقمية — 8 مراحل
// ═══════════════════════════════════════════════════════════════════════════════
const SUPPLY_CHAIN = {
    name: 'سلسلة الإمداد الرقمية — من المنجم إلى المستهلك',
    quran: SHARIA_FOUNDATION.commerce.iron,

    stages: [
        {
            id: 'extraction', order: 1,
            nameAr: 'الاستخراج', nameEn: 'Extraction',
            icon: '⛏️', color: '#78716c',
            desc: 'استخراج المعدن الخام من المناجم أو مصادر السكراب',
            actors: ['مناجم', 'مواقع تجميع', 'مصادر سكراب'],
            qualityChecks: ['تحليل العينة', 'نسبة التركيز', 'فحص الشوائب'],
            digital: { sensor: 'تحليل طيفي', tracking: 'GPS + RFID', ai: 'تقدير الاحتياطي' }
        },
        {
            id: 'collection', order: 2,
            nameAr: 'التجميع', nameEn: 'Collection',
            icon: '📦', color: '#a16207',
            desc: 'تجميع المواد الخام من مصادر متعددة وفرزها مبدئياً',
            actors: ['جامعون', 'وسطاء', 'تجار جملة'],
            qualityChecks: ['فرز مبدئي', 'وزن دقيق', 'تصنيف أولي'],
            digital: { sensor: 'موازين رقمية', tracking: 'باركود', ai: 'تصنيف آلي بالصور' }
        },
        {
            id: 'sorting', order: 3,
            nameAr: 'الفرز والتصنيف', nameEn: 'Sorting & Classification',
            icon: '🔬', color: '#0369a1',
            desc: 'فرز وتصنيف المواد حسب النوع والجودة ومعايير ISRI',
            actors: ['مصانع فرز', 'مختبرات', 'خبراء جودة'],
            qualityChecks: ['تحليل XRF', 'فحص مغناطيسي', 'تصنيف ISRI', 'شهادة تحليل'],
            digital: { sensor: 'XRF محمول', tracking: 'QR + بلوك تشين', ai: 'فرز بالذكاء الاصطناعي' }
        },
        {
            id: 'processing', order: 4,
            nameAr: 'المعالجة', nameEn: 'Processing',
            icon: '🔥', color: '#dc2626',
            desc: 'معالجة المعدن — صهر، تنقية، تشكيل',
            actors: ['مصاهر', 'مصانع تنقية', 'مصافي'],
            qualityChecks: ['نقاوة المعدن', 'نسبة الاسترداد', 'مطابقة المواصفات', 'فحص الانبعاثات'],
            digital: { sensor: 'حرارة + تحليل كيميائي', tracking: 'IoT sensors', ai: 'تحسين عملية الصهر' }
        },
        {
            id: 'manufacturing', order: 5,
            nameAr: 'التصنيع', nameEn: 'Manufacturing',
            icon: '🏭', color: '#7c3aed',
            desc: 'تصنيع المنتجات المعدنية النهائية أو نصف المصنعة',
            actors: ['مصانع', 'ورش', 'خطوط إنتاج'],
            qualityChecks: ['مراقبة الجودة', 'فحص الأبعاد', 'اختبار الشد', 'شهادة ISO'],
            digital: { sensor: 'أنظمة SCADA', tracking: 'MES رقمي', ai: 'صيانة تنبؤية' }
        },
        {
            id: 'warehousing', order: 6,
            nameAr: 'التخزين', nameEn: 'Warehousing',
            icon: '🏪', color: '#0891b2',
            desc: 'تخزين المنتجات في مستودعات ذكية مع إدارة المخزون',
            actors: ['مستودعات', 'مناطق حرة', 'موانئ'],
            qualityChecks: ['فحص الاستلام', 'ظروف التخزين', 'جرد دوري', 'FIFO/LIFO'],
            digital: { sensor: 'رطوبة + حرارة + وزن', tracking: 'WMS رقمي', ai: 'تحسين المخزون' }
        },
        {
            id: 'transport', order: 7,
            nameAr: 'النقل واللوجستيات', nameEn: 'Transport & Logistics',
            icon: '🚛', color: '#ea580c',
            desc: 'نقل المنتجات من المخزن أو المصنع إلى المشتري',
            actors: ['شركات نقل', 'شحن بحري', 'شحن جوي', 'قطارات'],
            qualityChecks: ['سلامة التحميل', 'التأمين', 'وثائق الشحن', 'التتبع المباشر'],
            digital: { sensor: 'GPS + تحميل', tracking: 'TMS رقمي', ai: 'تحسين المسارات' }
        },
        {
            id: 'delivery', order: 8,
            nameAr: 'التسليم', nameEn: 'Delivery',
            icon: '✅', color: '#16a34a',
            desc: 'تسليم المنتج للمشتري مع التوثيق والتقييم',
            actors: ['المشتري', 'مفتش الجودة', 'موظف التسليم'],
            qualityChecks: ['فحص المطابقة', 'وزن التسليم', 'توقيع الاستلام', 'تقييم التاجر'],
            digital: { sensor: 'موازين + صور', tracking: 'توقيع رقمي', ai: 'تقييم تلقائي' }
        }
    ],

    // تتبع شحنة عبر المراحل
    trackShipment(shipmentId, shipments) {
        const shipment = (shipments || []).find(s => s.id === shipmentId);
        if (!shipment) return null;
        const currentStage = this.stages.find(s => s.id === shipment.currentStage) || this.stages[0];
        const progress = Math.round(((currentStage.order) / this.stages.length) * 100);
        return {
            ...shipment,
            stageName: currentStage.nameAr,
            stageIcon: currentStage.icon,
            progress,
            totalStages: this.stages.length,
            nextStage: this.stages.find(s => s.order === currentStage.order + 1) || null,
            qualityChecks: currentStage.qualityChecks,
            digital: currentStage.digital
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. الشبكة الرقمية الذكية — المصانع + المناجم + المصاهر + المخازن + النقل
// ═══════════════════════════════════════════════════════════════════════════════
const DIGITAL_NETWORK = {
    name: 'شبكة شيخة الرقمية الذكية',
    quran: SHARIA_FOUNDATION.commerce.strength,

    nodes: {
        mines: {
            nameAr: 'المناجم الرقمية', nameEn: 'Digital Mines', icon: '⛏️',
            capabilities: ['استكشاف جيولوجي بالأقمار الصناعية', 'تقدير الاحتياطي بالذكاء الاصطناعي', 'استخراج آلي', 'مراقبة بيئية'],
            sensors: ['تحليل طيفي', 'GPS', 'LIDAR', 'كاميرات حرارية'],
            apis: ['/api/network/mines', '/api/network/mines/:id/production', '/api/network/mines/:id/reserves'],
            kpis: ['طن/يوم', 'نسبة التركيز', 'تكلفة الاستخراج', 'الأثر البيئي']
        },
        smelters: {
            nameAr: 'المصاهر الرقمية', nameEn: 'Digital Smelters', icon: '🔥',
            capabilities: ['صهر كهربائي (EAF)', 'تنقية إلكتروليتية', 'سبائك مخصصة', 'استخلاص متعدد المعادن'],
            sensors: ['حرارة', 'تحليل كيميائي لحظي', 'انبعاثات', 'استهلاك طاقة'],
            apis: ['/api/network/smelters', '/api/network/smelters/:id/capacity', '/api/network/smelters/:id/output'],
            kpis: ['طن/ساعة', 'نسبة الاسترداد', 'استهلاك الطاقة/طن', 'كفاءة الصهر']
        },
        factories: {
            nameAr: 'المصانع الرقمية الذكية', nameEn: 'Smart Digital Factories', icon: '🏭',
            capabilities: ['خطوط إنتاج آلية', 'رقابة جودة بالرؤية الحاسوبية', 'صيانة تنبؤية', 'إنتاج مخصص'],
            sensors: ['SCADA', 'PLC', 'رؤية حاسوبية', 'اهتزاز', 'حرارة'],
            apis: ['/api/network/factories', '/api/network/factories/:id/production', '/api/network/factories/:id/capacity'],
            kpis: ['OEE', 'معدل الإنتاج', 'نسبة العيوب', 'وقت التوقف']
        },
        warehouses: {
            nameAr: 'المخازن الرقمية', nameEn: 'Digital Warehouses', icon: '🏪',
            capabilities: ['إدارة مخزون ذكية', 'تتبع RFID', 'روبوتات نقل', 'تحسين المساحة بالذكاء الاصطناعي'],
            sensors: ['RFID', 'وزن', 'رطوبة', 'حرارة', 'كاميرات'],
            apis: ['/api/network/warehouses', '/api/network/warehouses/:id/inventory', '/api/network/warehouses/:id/movements'],
            kpis: ['معدل الدوران', 'دقة المخزون', 'تكلفة التخزين/طن', 'نسبة الاستغلال']
        },
        transport: {
            nameAr: 'أنظمة النقل الرقمية الذكية', nameEn: 'Smart Digital Transport', icon: '🚛',
            capabilities: ['تحسين المسارات بالذكاء الاصطناعي', 'تتبع مباشر', 'جدولة ذكية', 'تحميل محسّن'],
            sensors: ['GPS', 'وزن المحاور', 'حرارة الحاوية', 'كاميرات'],
            modes: [
                { id: 'road', name: 'نقل بري', icon: '🚛', speed: 'سريع', cost: 'متوسط', capacity: '25-40 طن' },
                { id: 'rail', name: 'قطارات', icon: '🚂', speed: 'متوسط', cost: 'منخفض', capacity: '1000+ طن' },
                { id: 'sea', name: 'شحن بحري', icon: '🚢', speed: 'بطيء', cost: 'أقل', capacity: '50,000+ طن' },
                { id: 'air', name: 'شحن جوي', icon: '✈️', speed: 'أسرع', cost: 'أعلى', capacity: '100 طن' }
            ],
            apis: ['/api/network/transport', '/api/network/transport/routes', '/api/network/transport/track/:shipmentId'],
            kpis: ['زمن التسليم', 'تكلفة/طن/كم', 'نسبة التسليم بالموعد', 'سلامة الشحنات']
        }
    },

    // حساب أفضل مسار توريد
    calculateOptimalRoute(from, to, product, quantity) {
        const modes = this.nodes.transport.modes;
        return modes.map(mode => ({
            mode: mode.id,
            name: mode.name,
            icon: mode.icon,
            estimatedCost: this._estimateCost(mode, quantity),
            estimatedTime: this._estimateTime(mode, from, to),
            capacity: mode.capacity,
            recommended: this._isRecommended(mode, quantity)
        })).sort((a, b) => a.estimatedCost - b.estimatedCost);
    },

    _estimateCost(mode, qty) {
        const rates = { road: 0.15, rail: 0.08, sea: 0.03, air: 2.5 };
        return Math.round((rates[mode.id] || 0.1) * (parseFloat(qty) || 1) * 500);
    },
    _estimateTime(mode, from, to) {
        const days = { road: '1-3 أيام', rail: '3-7 أيام', sea: '15-45 يوم', air: '1-3 أيام' };
        return days[mode.id] || '—';
    },
    _isRecommended(mode, qty) {
        const q = parseFloat(qty) || 0;
        if (q > 5000) return mode.id === 'sea';
        if (q > 500) return mode.id === 'rail';
        return mode.id === 'road';
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. نظام الأتمتة — التوصيل + التوريد + التسعير
// ═══════════════════════════════════════════════════════════════════════════════
const AUTOMATION = {
    name: 'نظام الأتمتة الذكي',

    // أتمتة التوصيل عند الشراء
    fulfillment: {
        process: [
            { step: 1, action: 'استلام الطلب', auto: true, trigger: 'order.created' },
            { step: 2, action: 'التحقق من المخزون', auto: true, trigger: 'stock.check' },
            { step: 3, action: 'حجز الكمية', auto: true, trigger: 'stock.reserve' },
            { step: 4, action: 'إنشاء أمر شحن', auto: true, trigger: 'shipping.create' },
            { step: 5, action: 'تعيين الناقل الأمثل', auto: true, trigger: 'carrier.assign' },
            { step: 6, action: 'إنشاء وثائق الشحن', auto: true, trigger: 'docs.generate' },
            { step: 7, action: 'التحميل والإرسال', auto: false, trigger: 'shipping.dispatch' },
            { step: 8, action: 'التتبع المباشر', auto: true, trigger: 'tracking.live' },
            { step: 9, action: 'تأكيد الاستلام', auto: false, trigger: 'delivery.confirm' },
            { step: 10, action: 'تقييم التاجر', auto: false, trigger: 'review.request' }
        ]
    },

    // أتمتة عقود التوريد
    supplyContracts: {
        types: [
            { id: 'spot', name: 'شراء فوري', desc: 'شراء كمية محددة بالسعر الحالي', duration: 'فوري' },
            { id: 'forward', name: 'عقد آجل', desc: 'اتفاق على سعر وكمية لتاريخ مستقبلي', duration: '1-12 شهر' },
            { id: 'blanket', name: 'عقد إطاري', desc: 'اتفاقية توريد مستمر بأسعار متفق عليها', duration: '6-24 شهر' },
            { id: 'consignment', name: 'أمانة', desc: 'استلام البضاعة والدفع عند البيع', duration: 'مفتوح' }
        ],
        shariaRules: [
            'لا ربا في التسعير أو التمويل',
            'لا غرر — كل البنود واضحة ومحددة',
            'لا احتكار — متاح للجميع',
            'خيار المجلس — حق الإلغاء قبل التفرق',
            'كل عقد يتضمن شرط التحكيم الشرعي'
        ]
    },

    // أتمتة التسعير الذكي
    pricing: {
        factors: ['سعر LME/COMEX العالمي', 'العرض والطلب المحلي', 'تكلفة النقل', 'جودة المنتج', 'الكمية', 'الموسمية'],
        hadith: SHARIA_FOUNDATION.hadith.pricing,
        // التسعير العادل — لا احتكار ولا تلاعب
        calculateFairPrice(basePrice, quality, quantity, demand) {
            let price = basePrice;
            // تعديل حسب الجودة
            const qualityMultiplier = { premium: 1.15, high: 1.05, standard: 1.0, good: 0.95, basic: 0.85 };
            price *= qualityMultiplier[quality] || 1.0;
            // خصم الكمية (حلال — تشجيع التجارة)
            if (quantity > 1000) price *= 0.97;
            if (quantity > 5000) price *= 0.95;
            if (quantity > 10000) price *= 0.92;
            // لا رفع سعر عند الطلب المرتفع (لا احتكار)
            return Math.round(price * 100) / 100;
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. نظام التحليلات — العرض والطلب الكلي
// ═══════════════════════════════════════════════════════════════════════════════
const ANALYTICS = {
    name: 'تحليلات سوق شيخة الذكية',

    // تحليل العرض والطلب لكل تصنيف
    analyzeMarket(listings, orders) {
        const analysis = {};

        // تجميع حسب الفئة
        (listings || []).forEach(l => {
            const cat = l.categoryName || l.category || 'غير مصنف';
            if (!analysis[cat]) {
                analysis[cat] = {
                    category: cat,
                    supply: { totalQuantity: 0, traders: new Set(), listings: 0, locations: new Set() },
                    demand: { totalOrders: 0, totalQuantityRequested: 0, buyers: new Set() },
                    prices: [],
                    quality: { premium: 0, high: 0, standard: 0, good: 0, basic: 0 }
                };
            }
            const a = analysis[cat];
            a.supply.totalQuantity += parseFloat(l.quantity) || 0;
            a.supply.traders.add(l.traderId);
            a.supply.listings++;
            if (l.storeRegion) a.supply.locations.add(l.storeRegion);
            if (l.price) a.prices.push(parseFloat(l.price));
            const q = (l.quality || 'good').toLowerCase();
            if (a.quality[q] !== undefined) a.quality[q]++;
        });

        // تجميع الطلبات
        (orders || []).forEach(o => {
            const cat = o.categoryName || o.category || 'غير مصنف';
            if (analysis[cat]) {
                analysis[cat].demand.totalOrders++;
                analysis[cat].demand.totalQuantityRequested += parseFloat(o.quantity) || 0;
                if (o.buyerId) analysis[cat].demand.buyers.add(o.buyerId);
            }
        });

        // تحويل Sets إلى أرقام وحساب الإحصائيات
        return Object.values(analysis).map(a => {
            const prices = a.prices;
            const avgPrice = prices.length > 0 ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : 0;
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
            const supplyDemandRatio = a.demand.totalQuantityRequested > 0
                ? Math.round((a.supply.totalQuantity / a.demand.totalQuantityRequested) * 100) / 100
                : null;

            return {
                category: a.category,
                supply: {
                    totalQuantity: a.supply.totalQuantity,
                    tradersCount: a.supply.traders.size,
                    listingsCount: a.supply.listings,
                    locationsCount: a.supply.locations.size,
                    locations: [...a.supply.locations]
                },
                demand: {
                    totalOrders: a.demand.totalOrders,
                    totalQuantityRequested: a.demand.totalQuantityRequested,
                    buyersCount: a.demand.buyers.size
                },
                pricing: { average: avgPrice, min: minPrice, max: maxPrice, currency: 'ريال' },
                quality: a.quality,
                balance: supplyDemandRatio,
                balanceLabel: supplyDemandRatio === null ? 'لا بيانات'
                    : supplyDemandRatio > 1.5 ? 'فائض عرض'
                    : supplyDemandRatio < 0.7 ? 'نقص عرض — فرصة'
                    : 'متوازن'
            };
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. الملكية الفكرية
// ═══════════════════════════════════════════════════════════════════════════════
const INTELLECTUAL_PROPERTY = {
    owner: 'سلمان أحمد بن سلمان الراجح',
    ownerEn: 'Salman Ahmed S Alrajeh',
    entity: 'مؤسسة سلمان احمد بن سلمان الراجح التجارية',
    cr: '2051263653',
    brand: 'شيخة — Sheikha',
    domain: 'sheikha.top',
    year: 2026,
    systems: [
        'نظام السوق الرقمي الذكي — Smart Digital Market Engine',
        'نظام التاجر الصدوق الأمين — Truthful Merchant Trust System',
        'سلسلة الإمداد الرقمية — Digital Supply Chain',
        'الشبكة الرقمية الذكية — Smart Digital Network',
        'نظام الأتمتة الذكي — Smart Automation System',
        'نظام التحليلات والذكاء الاصطناعي — AI Analytics',
        'نظام الأساس الشرعي — Sharia Foundation System'
    ],
    notice: 'جميع الحقوق محفوظة © 2026 — لا يجوز النسخ أو الاستخدام بدون إذن خطي',
    license: 'PROPRIETARY — All rights reserved'
};

// ═══════════════════════════════════════════════════════════════════════════════
// تسجيل APIs في الخادم
// ═══════════════════════════════════════════════════════════════════════════════
function registerAPIs(app, { LISTINGS, TRADERS, USERS, ORDERS, saveJSON }) {

    // ─── لوحة تحكم السوق الذكي ───
    app.get('/api/smart-market/dashboard', (req, res) => {
        const marketAnalysis = ANALYTICS.analyzeMarket(LISTINGS, ORDERS || []);
        const totalSupply = marketAnalysis.reduce((s, a) => s + a.supply.totalQuantity, 0);
        const totalTraders = new Set((LISTINGS || []).map(l => l.traderId)).size;
        const totalListings = (LISTINGS || []).filter(l => l.status !== 'deleted').length;

        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            dashboard: {
                totalSupply: Math.round(totalSupply),
                totalTraders,
                totalListings,
                totalCategories: marketAnalysis.length,
                categories: marketAnalysis,
                supplyChainStages: SUPPLY_CHAIN.stages.length,
                networkNodes: Object.keys(DIGITAL_NETWORK.nodes).length,
                automationSteps: AUTOMATION.fulfillment.process.length
            },
            sharia: {
                foundation: SHARIA_FOUNDATION.commerce.justice,
                hadith: SHARIA_FOUNDATION.hadith.truthfulMerchant
            },
            ip: INTELLECTUAL_PROPERTY,
            timestamp: new Date().toISOString()
        });
    });

    // ─── تقييم تاجر ───
    app.get('/api/smart-market/trust/:traderId', (req, res) => {
        const trader = (TRADERS || []).find(t => t.id === req.params.traderId);
        if (!trader) return res.status(404).json({ success: false, message: 'التاجر غير موجود' });
        const traderOrders = (ORDERS || []).filter(o => o.sellerId === trader.id);
        const trust = TRUST_SYSTEM.calculateTrust(trader, traderOrders, []);
        const traderListings = (LISTINGS || []).filter(l => l.traderId === trader.id && l.status !== 'deleted');

        res.json({
            success: true,
            trader: { id: trader.id, name: trader.name, region: trader.region, verified: trader.verified || false },
            trust,
            products: traderListings.length,
            axes: Object.entries(TRUST_SYSTEM.axes).map(([key, axis]) => ({
                id: key, name: axis.nameAr, nameEn: axis.nameEn, weight: axis.weight,
                score: trust.scores[key]?.score || 0, icon: axis.icon,
                metrics: axis.metrics,
                reference: axis.quran || axis.hadith || null
            })),
            badges: TRUST_SYSTEM.badges
        });
    });

    // ─── سلسلة الإمداد ───
    app.get('/api/smart-market/supply-chain', (req, res) => {
        res.json({
            success: true,
            name: SUPPLY_CHAIN.name,
            quran: SUPPLY_CHAIN.quran,
            stages: SUPPLY_CHAIN.stages,
            totalStages: SUPPLY_CHAIN.stages.length
        });
    });

    // ─── الشبكة الرقمية ───
    app.get('/api/smart-market/network', (req, res) => {
        res.json({
            success: true,
            name: DIGITAL_NETWORK.name,
            quran: DIGITAL_NETWORK.quran,
            nodes: Object.entries(DIGITAL_NETWORK.nodes).map(([key, node]) => ({
                id: key, nameAr: node.nameAr, nameEn: node.nameEn, icon: node.icon,
                capabilities: node.capabilities, sensors: node.sensors,
                apis: node.apis, kpis: node.kpis,
                modes: node.modes || null
            })),
            totalNodes: Object.keys(DIGITAL_NETWORK.nodes).length
        });
    });

    // ─── حساب أفضل مسار توريد ───
    app.post('/api/smart-market/optimal-route', (req, res) => {
        const { from, to, product, quantity } = req.body;
        const routes = DIGITAL_NETWORK.calculateOptimalRoute(from, to, product, quantity);
        res.json({
            success: true,
            from, to, product, quantity,
            routes,
            recommended: routes.find(r => r.recommended) || routes[0],
            hadith: SHARIA_FOUNDATION.hadith.provision
        });
    });

    // ─── نظام الأتمتة ───
    app.get('/api/smart-market/automation', (req, res) => {
        res.json({
            success: true,
            fulfillment: AUTOMATION.fulfillment,
            contractTypes: AUTOMATION.supplyContracts.types,
            shariaRules: AUTOMATION.supplyContracts.shariaRules,
            pricingFactors: AUTOMATION.pricing.factors,
            pricingHadith: AUTOMATION.pricing.hadith
        });
    });

    // ─── تسعير عادل ───
    app.post('/api/smart-market/fair-price', (req, res) => {
        const { basePrice, quality, quantity, demand } = req.body;
        const fairPrice = AUTOMATION.pricing.calculateFairPrice(
            parseFloat(basePrice) || 0, quality || 'standard', parseFloat(quantity) || 1, demand || 'normal'
        );
        res.json({
            success: true,
            basePrice: parseFloat(basePrice),
            fairPrice,
            quality, quantity,
            hadith: AUTOMATION.pricing.hadith,
            note: 'السعر العادل — لا احتكار ولا تلاعب'
        });
    });

    // ─── تصنيف المنتجات ───
    app.get('/api/smart-market/classifications', (req, res) => {
        res.json({
            success: true,
            hsChapters: PRODUCT_CLASSIFICATION.chapters,
            qualityGrades: PRODUCT_CLASSIFICATION.qualityGrades,
            isriGrades: PRODUCT_CLASSIFICATION.isriGrades
        });
    });

    // ─── العرض والطلب الكلي ───
    app.get('/api/smart-market/supply-demand', (req, res) => {
        const analysis = ANALYTICS.analyzeMarket(LISTINGS, ORDERS || []);
        res.json({
            success: true,
            categories: analysis,
            totalCategories: analysis.length,
            quran: SHARIA_FOUNDATION.commerce.noWaste,
            timestamp: new Date().toISOString()
        });
    });

    // ─── الملكية الفكرية ───
    app.get('/api/smart-market/ip', (req, res) => {
        res.json({ success: true, ip: INTELLECTUAL_PROPERTY });
    });

    console.log('✅ [SmartMarket] نظام السوق الرقمي الذكي — مفعّل');
    console.log('   📊 7 أنظمة: منتجات | ثقة | إمداد | شبكة | أتمتة | تحليلات | ملكية فكرية');
    console.log('   📡 APIs: /api/smart-market/dashboard, /trust/:id, /supply-chain, /network');
    console.log('   ☪ «' + SHARIA_FOUNDATION.hadith.truthfulMerchant.text + '»');
}

module.exports = {
    SHARIA_FOUNDATION,
    PRODUCT_CLASSIFICATION,
    TRUST_SYSTEM,
    SUPPLY_CHAIN,
    DIGITAL_NETWORK,
    AUTOMATION,
    ANALYTICS,
    INTELLECTUAL_PROPERTY,
    registerAPIs
};
