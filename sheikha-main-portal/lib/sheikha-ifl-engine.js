/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         SHEIKHA IFL ENGINE — Interactive Functions List                     ║
 * ║     قائمة الوظائف التفاعلية — منظومة شيخة الشاملة                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 *
 * ١. ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 *    [IFL-BASE] أساس قائمة الوظائف: تسمية كل وظيفة وتوثيقها بعلم إلهي
 *
 * ٢. ﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ﴾ — النحل: ٩٠
 *    [IFL-ETHICS] كل وظيفة تعمل بالعدل والإحسان
 *
 * ٣. ﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾ — الأنفال: ٦٠
 *    [IFL-ENV] الاستخدام العلمي والبيئي — Intact Forest Landscapes
 *
 * ٤. ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١
 *    [IFL-SOFT] أبحاث وتطوير البرمجيات — iFL Interactive Feature Location
 *
 * ٥. ﴿وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ﴾ — الشعراء: ٨٠
 *    [IFL-MED] التطبيق الطبي — IFL online (المراقبة الصحية التفاعلية)
 *
 * ٦. ﴿وَنَزَّلْنَا مِنَ السَّمَاءِ مَاءً مُّبَارَكًا فَأَنبَتْنَا بِهِ جَنَّاتٍ﴾ — ق: ٩
 *    [IFL-CHEM] العلاج الكيميائي — IFL Regimen (بروتوكول الأيروبيسين)
 *
 * ٧. «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي
 *    [IFL-ITQAN] كل وظيفة تُنفَّذ بإتقان تام
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * التطبيقات الأربعة المرقّمة بالكتاب والسنة:
 *
 * ٣. الاستخدام العلمي والبيئي  (Intact Forest Landscapes — IFL)
 *    → تحليل البيئة والغابات الطبيعية + استدامة الأرض
 *
 * ٤. أبحاث وتطوير البرمجيات   (iFL — Interactive Feature Location)
 *    → تحديد المميزات التفاعلية في قواعد الكود والمشاريع
 *
 * ٥. التطبيق الطبي             (IFL online — Interactive Function Locator)
 *    → تحديد الوظائف الحيوية + المراقبة الصحية الرقمية
 *
 * ٦. العلاج الكيميائي          (IFL Regimen — Ifosfamide + Fluorouracil + Leucovorin)
 *    → بروتوكول علاجي موثّق + إدارة آمنة للجرعات
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * الموقع في المنظومة:
 *   Hardware
 *     → Guardian [UTF-8 + Sharia]
 *       → ROOT NCN LAYER
 *         → Control Plane
 *           → [IFL ENGINE ← هنا] — قائمة الوظائف التفاعلية
 *             → IDA ENGINE (الطبقة الأعلى)
 *
 * @module sheikha-ifl-engine
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */

'use strict';

const EventEmitter = require('events');

// ─── ثوابت التوحيد ────────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الأول: قاموس التطبيقات الأربعة — مرقّمة بالكتاب والسنة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * التطبيقات الأربعة المرقّمة بالكتاب والسنة
 * رقم ٣ → البيئي | رقم ٤ → البرمجي | رقم ٥ → الطبي | رقم ٦ → الكيميائي
 */
const IFL_DOMAINS = Object.freeze({

    // ٣. الاستخدامات العلمية والبيئية — Intact Forest Landscapes
    ENVIRONMENTAL: {
        id:          'IFL-ENV-3',
        number:      3,
        nameAr:      'الاستخدامات العلمية والبيئية',
        nameEn:      'Intact Forest Landscapes (IFL)',
        quranRef:    '﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾ — الأعراف: ٥٦',
        quranRef2:   '﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾ — الأنفال: ٦٠',
        hadithRef:   '«ما من مسلم يغرس غرساً أو يزرع زرعاً فيأكل منه طير أو إنسان أو بهيمة إلا كانت له به صدقة» — البخاري ومسلم',
        description: 'تحليل وحماية الغابات الطبيعية المتكاملة — رصد التغير البيئي — استدامة الأرض',
        capabilities: [
            'رصد مساحات الغابات عبر صور الأقمار الاصطناعية',
            'تحليل كثافة الغطاء النباتي',
            'تتبع التغيرات البيئية عبر الزمن',
            'تقييم صحة النظم البيئية',
            'دعم قرارات إعمار الأرض الإسلامية',
        ],
        status: 'active',
    },

    // ٤. أبحاث وتطوير البرمجيات — iFL Interactive Feature Location
    SOFTWARE: {
        id:          'IFL-SOFT-4',
        number:      4,
        nameAr:      'أبحاث وتطوير البرمجيات',
        nameEn:      'Interactive Feature Location (iFL)',
        quranRef:    '﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١',
        quranRef2:   '﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾ — طه: ١١٤',
        hadithRef:   '«طلب العلم فريضة على كل مسلم» — ابن ماجه',
        description: 'تحديد المميزات التفاعلية في قواعد الكود — ربط المتطلبات بالتنفيذ',
        capabilities: [
            'تحديد مواقع الوظائف في قواعد الكود الضخمة',
            'ربط طلبات المستخدم بالأكواد المقابلة',
            'تحليل تبعيات الوحدات البرمجية',
            'اقتراح تحسينات معمارية',
            'توثيق العلاقات بين المميزات',
        ],
        status: 'active',
    },

    // ٥. التطبيق الطبي — IFL online Interactive Function Locator
    MEDICAL: {
        id:          'IFL-MED-5',
        number:      5,
        nameAr:      'التطبيق الطبي',
        nameEn:      'IFL Online — Interactive Function Locator',
        quranRef:    '﴿وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ﴾ — الشعراء: ٨٠',
        quranRef2:   '﴿يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَاءٌ لِّمَا فِي الصُّدُورِ﴾ — يونس: ٥٧',
        hadithRef:   '«تداووا عباد الله، فإن الله لم يضع داءً إلا وضع له دواءً» — أبو داود',
        description: 'تحديد الوظائف الحيوية التفاعلية — المراقبة الصحية الرقمية الذكية',
        capabilities: [
            'رصد المؤشرات الحيوية في الوقت الفعلي',
            'تحديد الوظائف الجسدية الحيوية',
            'تحليل الأنماط الصحية',
            'تنبيه المرضى والأطباء تلقائياً',
            'توثيق سجلات المراقبة الطبية',
        ],
        status: 'active',
    },

    // ٦. العلاج الكيميائي — IFL Regimen
    CHEMICAL: {
        id:          'IFL-CHEM-6',
        number:      6,
        nameAr:      'العلاج الكيميائي',
        nameEn:      'IFL Regimen — Ifosfamide + Fluorouracil + Leucovorin',
        quranRef:    '﴿وَنَزَّلْنَا مِنَ السَّمَاءِ مَاءً مُّبَارَكًا فَأَنبَتْنَا بِهِ جَنَّاتٍ وَحَبَّ الْحَصِيدِ﴾ — ق: ٩',
        quranRef2:   '﴿وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا﴾ — الإسراء: ٨٥',
        hadithRef:   '«ما أنزل الله داءً إلا أنزل له شفاءً» — البخاري',
        description: 'بروتوكول علاجي كيميائي — إدارة الجرعات بدقة — المراقبة الإكلينيكية الآمنة',
        capabilities: [
            'حساب جرعات Ifosfamide بناءً على مساحة سطح الجسم',
            'جدولة بروتوكول Fluorouracil + Leucovorin',
            'رصد الآثار الجانبية وتنبيه الفريق الطبي',
            'توثيق دورات العلاج',
            'تقييم استجابة المريض للبروتوكول',
        ],
        status: 'active',
        warning: 'للاستخدام الطبي المتخصص فقط — يتطلب إشراف طبيب مختص',
    },
});

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثاني: وظائف IFL المركزية
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * قائمة الوظائف المركزية الشاملة — مرقّمة بالكتاب والسنة
 */
const IFL_CORE_FUNCTIONS = [

    // ──── وظائف التوحيد والأساس ─────────────────────────────────────────────────
    {
        id:        'IFL-F-001',
        nameAr:    'وظيفة التوحيد الجذرية',
        nameEn:    'Tawheed Root Function',
        domain:    'TAWHEED',
        quranRef:  '﴿لَا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ﴾ — البقرة: ١٦٣',
        hadithRef: '«أفضل ما قلته أنا والنبيون من قبلي: لا إله إلا الله» — الترمذي',
        inputs:    ['intent', 'context'],
        outputs:   ['tawheedValidation', 'islamicCompliance'],
        status:    'active',
    },
    {
        id:        'IFL-F-002',
        nameAr:    'وظيفة التحقق الشرعي',
        nameEn:    'Sharia Compliance Function',
        domain:    'SHARIA',
        quranRef:  '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
        hadithRef: '«الحلال بيّن والحرام بيّن وبينهما أمور مشتبهات» — البخاري',
        inputs:    ['transaction', 'data'],
        outputs:   ['halal', 'haram', 'reason', 'reference'],
        status:    'active',
    },

    // ──── وظائف البيئة (٣) ──────────────────────────────────────────────────────
    {
        id:        'IFL-F-003',
        nameAr:    'تحليل الغابات والبيئة الطبيعية',
        nameEn:    'Intact Forest Landscape Analyzer',
        domain:    'ENVIRONMENTAL',
        quranRef:  '﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾ — الأعراف: ٥٦',
        hadithRef: '«ما من مسلم يغرس غرساً فيأكل منه طير أو إنسان إلا كانت له صدقة» — البخاري',
        inputs:    ['coordinates', 'satelliteData', 'timeRange'],
        outputs:   ['forestCoverage', 'biodiversityIndex', 'degradationRisk', 'recommendations'],
        status:    'active',
    },
    {
        id:        'IFL-F-004',
        nameAr:    'رصد تغير المناخ والاستدامة',
        nameEn:    'Climate Change Monitor',
        domain:    'ENVIRONMENTAL',
        quranRef:  '﴿وَالْأَرْضَ مَدَدْنَاهَا وَأَلْقَيْنَا فِيهَا رَوَاسِيَ وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ﴾ — الحجر: ١٩',
        hadithRef: '«إن قامت الساعة وفي يد أحدكم فسيلة فإن استطاع أن لا تقوم حتى يغرسها فليغرسها» — أحمد',
        inputs:    ['region', 'period', 'metrics'],
        outputs:   ['temperatureChange', 'carbonLevel', 'sustainabilityScore', 'actionPlan'],
        status:    'active',
    },

    // ──── وظائف البرمجيات (٤) ───────────────────────────────────────────────────
    {
        id:        'IFL-F-005',
        nameAr:    'تحديد المميزات التفاعلية في الكود',
        nameEn:    'Interactive Feature Location (iFL)',
        domain:    'SOFTWARE',
        quranRef:  '﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١',
        hadithRef: '«طلب العلم فريضة على كل مسلم» — ابن ماجه',
        inputs:    ['featureRequest', 'codebase', 'language'],
        outputs:   ['locations', 'files', 'functions', 'confidence', 'explanation'],
        status:    'active',
    },
    {
        id:        'IFL-F-006',
        nameAr:    'ربط المتطلبات بالتنفيذ',
        nameEn:    'Requirements-to-Implementation Mapper',
        domain:    'SOFTWARE',
        quranRef:  '﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾ — طه: ١١٤',
        hadithRef: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي',
        inputs:    ['requirement', 'codebase'],
        outputs:   ['implementationMap', 'gaps', 'suggestions'],
        status:    'active',
    },

    // ──── وظائف طبية (٥) ────────────────────────────────────────────────────────
    {
        id:        'IFL-F-007',
        nameAr:    'رصد الوظائف الحيوية التفاعلي',
        nameEn:    'Vital Functions Interactive Monitor (IFL Online)',
        domain:    'MEDICAL',
        quranRef:  '﴿وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ﴾ — الشعراء: ٨٠',
        hadithRef: '«تداووا عباد الله، فإن الله لم يضع داءً إلا وضع له دواءً» — أبو داود',
        inputs:    ['patientId', 'vitals', 'timestamp'],
        outputs:   ['status', 'alerts', 'trends', 'recommendations'],
        status:    'active',
    },
    {
        id:        'IFL-F-008',
        nameAr:    'تحليل البيانات الصحية الرقمية',
        nameEn:    'Digital Health Analytics',
        domain:    'MEDICAL',
        quranRef:  '﴿يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَاءٌ لِّمَا فِي الصُّدُورِ﴾ — يونس: ٥٧',
        hadithRef: '«لكل داء دواء» — مسلم',
        inputs:    ['healthRecords', 'labResults', 'period'],
        outputs:   ['healthScore', 'riskFactors', 'personalizedPlan'],
        status:    'active',
    },

    // ──── وظائف كيميائية (٦) ────────────────────────────────────────────────────
    {
        id:        'IFL-F-009',
        nameAr:    'حساب جرعات بروتوكول IFL الكيميائي',
        nameEn:    'IFL Regimen Dosage Calculator',
        domain:    'CHEMICAL',
        quranRef:  '﴿وَنَزَّلْنَا مِنَ السَّمَاءِ مَاءً مُّبَارَكًا﴾ — ق: ٩',
        hadithRef: '«ما أنزل الله داءً إلا أنزل له شفاءً» — البخاري',
        inputs:    ['patientWeight', 'patientHeight', 'cycleNumber', 'protocolVariant'],
        outputs:   ['ifosfamideDose', 'fluorouracilDose', 'leucovorinDose', 'schedule', 'safetyFlags'],
        status:    'active',
        warning:   'للاستخدام الطبي المتخصص فقط',
    },
    {
        id:        'IFL-F-010',
        nameAr:    'مراقبة الآثار الجانبية للعلاج الكيميائي',
        nameEn:    'Chemotherapy Side Effects Monitor',
        domain:    'CHEMICAL',
        quranRef:  '﴿وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا﴾ — الإسراء: ٨٥',
        hadithRef: '«عليكم بالشفاءين: القرآن والعسل» — ابن ماجه',
        inputs:    ['patientId', 'treatmentCycle', 'symptoms'],
        outputs:   ['toxicityGrade', 'interventionRequired', 'adjustmentRecommendation'],
        status:    'active',
        warning:   'للاستخدام الطبي المتخصص فقط',
    },

    // ──── وظائف التجارة والاقتصاد ───────────────────────────────────────────────
    {
        id:        'IFL-F-011',
        nameAr:    'وظيفة التحليل التجاري الإسلامي',
        nameEn:    'Islamic Trade Analysis Function',
        domain:    'TRADE',
        quranRef:  '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ﴾ — النساء: ٢٩',
        hadithRef: '«البيعان بالخيار ما لم يتفرقا» — البخاري',
        inputs:    ['commodity', 'price', 'quantity', 'parties'],
        outputs:   ['halalStatus', 'fairPrice', 'contractTerms', 'risks'],
        status:    'active',
    },
    {
        id:        'IFL-F-012',
        nameAr:    'وظيفة حساب الزكاة',
        nameEn:    'Zakat Calculation Function',
        domain:    'TRADE',
        quranRef:  '﴿وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ﴾ — البقرة: ٤٣',
        hadithRef: '«في كل إبل سائمة في كل أربعين بنت لبون» — البخاري',
        inputs:    ['assets', 'liabilities', 'nisab', 'hawl'],
        outputs:   ['zakatAmount', 'distribution', 'recipients'],
        status:    'active',
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثالث: محرك IFL الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaIFLEngine extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(50);

        /** سجل الوظائف المُفعَّلة */
        this._registry = new Map();

        /** إحصائيات التشغيل */
        this._stats = {
            totalFunctions: 0,
            activeFunctions: 0,
            calls: 0,
            successes: 0,
            errors: 0,
            callsByDomain: {},
        };

        /** معالجات الوظائف المسجَّلة خارجياً */
        this._handlers = new Map();

        this._initialized = false;
        this._startedAt = null;
    }

    // ─── التهيئة ───────────────────────────────────────────────────────────────

    /**
     * تهيئة محرك IFL — تسجيل كل الوظائف
     */
    initialize() {
        if (this._initialized) return this;

        console.log(`[IFL-ENGINE] ⚡ ${BISMILLAH}`);
        console.log(`[IFL-ENGINE] 🌟 تهيئة قائمة الوظائف التفاعلية — ${VERSION}`);

        // تسجيل جميع الوظائف الأساسية
        for (const fn of IFL_CORE_FUNCTIONS) {
            this._registry.set(fn.id, {
                ...fn,
                registeredAt: new Date().toISOString(),
                calls: 0,
            });
        }

        this._stats.totalFunctions = this._registry.size;
        this._stats.activeFunctions = [...this._registry.values()].filter(f => f.status === 'active').length;

        // تهيئة إحصائيات النطاقات
        for (const domain of Object.keys(IFL_DOMAINS)) {
            this._stats.callsByDomain[domain] = 0;
        }

        this._initialized = true;
        this._startedAt = new Date().toISOString();

        console.log(`[IFL-ENGINE] ✅ ${this._stats.totalFunctions} وظيفة مُسجَّلة | ${this._stats.activeFunctions} نشطة`);
        console.log(`[IFL-ENGINE] 📖 ${TAWHEED}`);

        this.emit('initialized', { stats: this._stats });
        return this;
    }

    // ─── تسجيل الوظائف ────────────────────────────────────────────────────────

    /**
     * تسجيل وظيفة جديدة في القائمة
     * @param {object} fnDef — تعريف الوظيفة
     * @param {Function} handler — معالج الوظيفة
     */
    register(fnDef, handler) {
        if (!fnDef || !fnDef.id) {
            throw new Error('[IFL-ENGINE] خطأ: تعريف الوظيفة يجب أن يحتوي على id');
        }

        this._registry.set(fnDef.id, {
            ...fnDef,
            registeredAt: new Date().toISOString(),
            calls: 0,
        });

        if (typeof handler === 'function') {
            this._handlers.set(fnDef.id, handler);
        }

        this._stats.totalFunctions = this._registry.size;
        this._stats.activeFunctions = [...this._registry.values()].filter(f => f.status === 'active').length;

        console.log(`[IFL-ENGINE] 📌 وظيفة مُسجَّلة: ${fnDef.id} — ${fnDef.nameAr || fnDef.nameEn}`);
        this.emit('function:registered', { id: fnDef.id, domain: fnDef.domain });
        return this;
    }

    // ─── تنفيذ الوظائف ────────────────────────────────────────────────────────

    /**
     * تنفيذ وظيفة من القائمة
     * @param {string} functionId
     * @param {object} inputs
     * @returns {object}
     */
    async call(functionId, inputs = {}) {
        this._stats.calls++;

        const fn = this._registry.get(functionId);
        if (!fn) {
            this._stats.errors++;
            return {
                ok:      false,
                error:   `وظيفة غير موجودة: ${functionId}`,
                tawheed: TAWHEED,
            };
        }

        if (fn.status !== 'active') {
            this._stats.errors++;
            return {
                ok:    false,
                error: `الوظيفة غير نشطة: ${functionId}`,
            };
        }

        // تحديث إحصائيات النطاق
        if (fn.domain && this._stats.callsByDomain[fn.domain] !== undefined) {
            this._stats.callsByDomain[fn.domain]++;
        }

        // تحديث عداد مكالمات الوظيفة
        fn.calls = (fn.calls || 0) + 1;

        const handler = this._handlers.get(functionId);

        try {
            let result;

            if (typeof handler === 'function') {
                result = await handler(inputs);
            } else {
                // معالج افتراضي — يعيد بيانات الوظيفة مع المدخلات
                result = this._defaultHandler(fn, inputs);
            }

            this._stats.successes++;
            this.emit('function:called', { id: functionId, domain: fn.domain, success: true });

            return {
                ok:         true,
                functionId,
                nameAr:     fn.nameAr,
                domain:     fn.domain,
                quranRef:   fn.quranRef,
                hadithRef:  fn.hadithRef,
                result,
                tawheed:    TAWHEED,
                timestamp:  new Date().toISOString(),
            };

        } catch (err) {
            this._stats.errors++;
            this.emit('function:called', { id: functionId, domain: fn.domain, success: false, error: err.message });

            return {
                ok:        false,
                functionId,
                error:     err.message,
                tawheed:   TAWHEED,
                timestamp: new Date().toISOString(),
            };
        }
    }

    /**
     * معالج افتراضي للوظائف التي لا تحتوي على معالج مخصص
     * @private
     */
    _defaultHandler(fn, inputs) {
        return {
            message:     `تم استدعاء الوظيفة: ${fn.nameAr}`,
            inputs,
            domainInfo:  IFL_DOMAINS[fn.domain] || null,
            note:        'وظيفة جاهزة — تحتاج تنفيذاً مخصصاً للاستخدام الفعلي',
        };
    }

    // ─── الاستعلام عن القائمة ─────────────────────────────────────────────────

    /**
     * استرجاع قائمة جميع الوظائف
     * @param {object} filter — فلاتر اختيارية { domain, status }
     * @returns {Array}
     */
    list(filter = {}) {
        let fns = [...this._registry.values()];

        if (filter.domain) {
            fns = fns.filter(f => f.domain === filter.domain);
        }
        if (filter.status) {
            fns = fns.filter(f => f.status === filter.status);
        }

        return fns.map(f => ({
            id:       f.id,
            nameAr:   f.nameAr,
            nameEn:   f.nameEn,
            domain:   f.domain,
            quranRef: f.quranRef,
            status:   f.status,
            calls:    f.calls || 0,
        }));
    }

    /**
     * استرجاع معلومات وظيفة محددة
     * @param {string} functionId
     * @returns {object|null}
     */
    get(functionId) {
        return this._registry.get(functionId) || null;
    }

    /**
     * استرجاع معلومات نطاق محدد
     * @param {string} domain
     * @returns {object|null}
     */
    getDomain(domain) {
        return IFL_DOMAINS[domain] || null;
    }

    /**
     * قائمة كل النطاقات
     * @returns {Array}
     */
    listDomains() {
        return Object.entries(IFL_DOMAINS).map(([key, domain]) => ({
            key,
            id:          domain.id,
            number:      domain.number,
            nameAr:      domain.nameAr,
            nameEn:      domain.nameEn,
            quranRef:    domain.quranRef,
            hadithRef:   domain.hadithRef,
            description: domain.description,
            status:      domain.status,
        }));
    }

    // ─── البحث والاستعلام الذكي ───────────────────────────────────────────────

    /**
     * البحث في قائمة الوظائف
     * @param {string} query — نص البحث
     * @returns {Array}
     */
    search(query = '') {
        if (!query) return this.list();

        const q = query.toLowerCase();
        return [...this._registry.values()].filter(f => {
            return (
                (f.nameAr  && f.nameAr.toLowerCase().includes(q)) ||
                (f.nameEn  && f.nameEn.toLowerCase().includes(q)) ||
                (f.domain  && f.domain.toLowerCase().includes(q)) ||
                (f.id      && f.id.toLowerCase().includes(q))
            );
        }).map(f => ({
            id:       f.id,
            nameAr:   f.nameAr,
            nameEn:   f.nameEn,
            domain:   f.domain,
            quranRef: f.quranRef,
            status:   f.status,
        }));
    }

    // ─── الحالة والإحصائيات ───────────────────────────────────────────────────

    /**
     * حالة المحرك
     * @returns {object}
     */
    status() {
        return {
            name:            'Sheikha IFL Engine',
            nameAr:          'محرك قائمة الوظائف التفاعلية',
            version:         VERSION,
            initialized:     this._initialized,
            startedAt:       this._startedAt,
            stats:           { ...this._stats },
            domains:         Object.keys(IFL_DOMAINS),
            tawheed:         TAWHEED,
            bismillah:       BISMILLAH,
            quranRef:        '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الرابع: Singleton + تصدير
// ═══════════════════════════════════════════════════════════════════════════════

let _instance = null;

/**
 * الحصول على نسخة المحرك (Singleton)
 * @returns {SheikhaIFLEngine}
 */
function getInstance() {
    if (!_instance) {
        _instance = new SheikhaIFLEngine();
        _instance.initialize();
    }
    return _instance;
}

module.exports = {
    SheikhaIFLEngine,
    getInstance,
    IFL_DOMAINS,
    IFL_CORE_FUNCTIONS,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
