/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         SHEIKHA IDA ENGINE — Interactive Data Architecture                  ║
 * ║     المعمارية التفاعلية للبيانات — الطبقة الأعلى من IFL                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 *
 * ── المراجع القرآنية والنبوية (مرقّمة بالكتاب والسنة ووحدها لله) ──
 *
 * ١. ﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾ — الأنبياء: ٣٠
 *    [IDA-FLOW] تدفق البيانات الحي بين الطبقات — كل شيء بأمر الله
 *
 * ٢. ﴿إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ﴾ — الرعد: ١١
 *    [IDA-ADAPT] التكيف الذكي للبيانات — النظام يتطور بقرار الإنسان
 *
 * ٣. ﴿وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ﴾ — الشورى: ٣٨
 *    [IDA-CONSENSUS] تجميع البيانات بالتشاور بين الطبقات
 *
 * ٤. ﴿وَفِي كُلِّ شَيْءٍ لَّهُ آيَةٌ تَدُلُّ عَلَىٰ أَنَّهُ وَاحِدٌ﴾ — الديوان
 *    [IDA-UNITY] وحدة المعمارية — كل بيانة تدل على المصدر الواحد
 *
 * ٥. ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 *    [IDA-ITQAN] إتقان بنية البيانات التفاعلية
 *
 * ٦. «الدين النصيحة» — مسلم
 *    [IDA-INTEGRITY] سلامة البيانات ونزاهتها — لا غش ولا تزوير
 *
 * ٧. «من غشنا فليس منا» — مسلم
 *    [IDA-VALIDATION] التحقق الصارم من كل بيانة واردة
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * الموقع في المنظومة:
 *
 *   Hardware
 *     → Guardian [UTF-8 + Sharia]
 *       → ROOT NCN LAYER (شبكة الخلايا العصبية الجذرية)
 *         → Control Plane
 *           → IFL ENGINE (قائمة الوظائف التفاعلية)
 *             → [IDA ENGINE ← هنا] — المعمارية التفاعلية للبيانات
 *               → Applications (ENV | SOFT | MED | CHEM)
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * وظائف IDA:
 *  ١. تجميع مخرجات IFL من النطاقات الأربعة
 *  ٢. توجيه البيانات للتطبيقات الصحيحة
 *  ٣. التحقق الشرعي من كل بيانة
 *  ٤. الدمج الذكي للنتائج
 *  ٥. إنتاج تقارير موحّدة مع مراجع الكتاب والسنة
 *
 * @module sheikha-ida-engine
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */

'use strict';

const EventEmitter = require('events');

// ─── استيراد IFL Engine ───────────────────────────────────────────────────────
let _iflEngine = null;
try {
    _iflEngine = require('./sheikha-ifl-engine');
} catch (err) {
    console.warn('[IDA-ENGINE] ⚠️  لم يُعثر على sheikha-ifl-engine:', err.message);
}

// ─── ثوابت التوحيد ────────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الأول: مخطط المعمارية التفاعلية
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * طبقات IDA — المعمارية التفاعلية للبيانات
 * ﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾
 */
const IDA_LAYERS = Object.freeze({
    // الطبقة ١: الاستقبال والتحقق
    RECEPTION: {
        id:       'IDA-L1',
        nameAr:   'طبقة الاستقبال والتحقق',
        nameEn:   'Reception & Validation Layer',
        quranRef: '﴿مَن غَشَّنَا فَلَيْسَ مِنَّا﴾ — مسلم',
        role:     'استقبال البيانات + التحقق من صحتها + فرز النطاقات',
    },
    // الطبقة ٢: التوجيه الذكي
    ROUTING: {
        id:       'IDA-L2',
        nameAr:   'طبقة التوجيه الذكي',
        nameEn:   'Intelligent Routing Layer',
        quranRef: '﴿وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ﴾ — الشورى: ٣٨',
        role:     'توجيه البيانات للطبقة المناسبة من IFL',
    },
    // الطبقة ٣: المعالجة والتجميع
    AGGREGATION: {
        id:       'IDA-L3',
        nameAr:   'طبقة المعالجة والتجميع',
        nameEn:   'Processing & Aggregation Layer',
        quranRef: '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
        role:     'تجميع نتائج IFL ومعالجتها بإتقان',
    },
    // الطبقة ٤: التحقق الشرعي
    SHARIA_FILTER: {
        id:       'IDA-L4',
        nameAr:   'طبقة التحقق الشرعي',
        nameEn:   'Sharia Compliance Filter',
        quranRef: '﴿الدِّينُ النَّصِيحَةُ﴾ — مسلم',
        role:     'فلترة النتائج بالمعايير الشرعية',
    },
    // الطبقة ٥: الإخراج الموحّد
    OUTPUT: {
        id:       'IDA-L5',
        nameAr:   'طبقة الإخراج الموحّد',
        nameEn:   'Unified Output Layer',
        quranRef: '﴿وَفِي كُلِّ شَيْءٍ لَّهُ آيَةٌ تَدُلُّ عَلَىٰ أَنَّهُ وَاحِدٌ﴾',
        role:     'إنتاج تقارير موحّدة مع مراجع الكتاب والسنة',
    },
});

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثاني: قواعد التوجيه — ربط الطلبات بنطاقات IFL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * قواعد التوجيه الذكي — تحديد النطاق المناسب للطلب
 * ﴿إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ﴾
 */
const ROUTING_RULES = [
    {
        pattern:  /غابة|بيئة|نبات|مناخ|أرض|forest|environment|climate|nature/i,
        domain:   'ENVIRONMENTAL',
        iflId:    'IFL-F-003',
        quranRef: '﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾ — الأعراف: ٥٦',
    },
    {
        pattern:  /كود|برمجة|مميزة|وظيفة برمجية|code|feature|software|function location/i,
        domain:   'SOFTWARE',
        iflId:    'IFL-F-005',
        quranRef: '﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١',
    },
    {
        pattern:  /طبي|صحة|مريض|مستشفى|علاج طبي|medical|health|patient|vital/i,
        domain:   'MEDICAL',
        iflId:    'IFL-F-007',
        quranRef: '﴿وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ﴾ — الشعراء: ٨٠',
    },
    {
        pattern:  /كيميائي|علاج كيميائي|جرعة|ifl regimen|ifosfamide|chemotherapy|dose/i,
        domain:   'CHEMICAL',
        iflId:    'IFL-F-009',
        quranRef: '﴿مَا أَنزَلَ اللَّهُ دَاءً إِلَّا أَنزَلَ لَهُ شِفَاءً﴾ — البخاري',
    },
    {
        pattern:  /تجارة|بيع|شراء|سوق|trade|market|buy|sell/i,
        domain:   'TRADE',
        iflId:    'IFL-F-011',
        quranRef: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
    },
    {
        pattern:  /زكاة|نصاب|حول|zakat/i,
        domain:   'TRADE',
        iflId:    'IFL-F-012',
        quranRef: '﴿وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ﴾ — البقرة: ٤٣',
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثالث: محرك IDA الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaIDAEngine extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(50);

        /** مرجع IFL Engine */
        this._ifl = null;

        /** سجل طلبات IDA */
        this._requestLog = [];

        /** إحصائيات IDA */
        this._stats = {
            totalRequests:  0,
            routed:         0,
            aggregated:     0,
            shariaBlocked:  0,
            errors:         0,
            byDomain: {
                ENVIRONMENTAL: 0,
                SOFTWARE:      0,
                MEDICAL:       0,
                CHEMICAL:      0,
                TRADE:         0,
                UNKNOWN:       0,
            },
        };

        this._initialized = false;
        this._startedAt   = null;
    }

    // ─── التهيئة ───────────────────────────────────────────────────────────────

    /**
     * تهيئة IDA Engine — ربطه بـ IFL
     */
    initialize() {
        if (this._initialized) return this;

        console.log(`[IDA-ENGINE] ⚡ ${BISMILLAH}`);
        console.log(`[IDA-ENGINE] 🌟 تهيئة المعمارية التفاعلية للبيانات — ${VERSION}`);

        // ربط IFL
        if (_iflEngine) {
            this._ifl = _iflEngine.getInstance();
            console.log('[IDA-ENGINE] ✅ IFL Engine مرتبط بنجاح');
        } else {
            console.warn('[IDA-ENGINE] ⚠️  IFL Engine غير متاح — سيعمل IDA بوضع مستقل');
        }

        this._initialized = true;
        this._startedAt   = new Date().toISOString();

        console.log(`[IDA-ENGINE] 📖 ${TAWHEED}`);
        console.log('[IDA-ENGINE] 🏗️  طبقات IDA النشطة:', Object.keys(IDA_LAYERS).join(' → '));

        this.emit('initialized', { layers: Object.keys(IDA_LAYERS) });
        return this;
    }

    // ─── الوظيفة الرئيسية: معالجة الطلب عبر كل الطبقات ──────────────────────

    /**
     * معالجة طلب عبر المعمارية التفاعلية الكاملة
     * ﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾
     *
     * @param {object} request — { query, data, domain?, userId? }
     * @returns {object} — النتيجة الموحّدة مع مراجع الكتاب والسنة
     */
    async process(request = {}) {
        this._stats.totalRequests++;

        const startTime = Date.now();
        const requestId = `IDA-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        console.log(`[IDA-ENGINE] 📥 طلب جديد: ${requestId}`);

        // ── الطبقة ١: الاستقبال والتحقق ─────────────────────────────────────
        const validationResult = this._validateRequest(request);
        if (!validationResult.valid) {
            this._stats.errors++;
            return this._buildErrorResponse(requestId, validationResult.reason, request);
        }

        // ── الطبقة ٢: التوجيه الذكي ──────────────────────────────────────────
        const routingResult = this._routeRequest(request);
        this._stats.routed++;

        // تحديث إحصائيات النطاق
        const domain = routingResult.domain || 'UNKNOWN';
        if (this._stats.byDomain[domain] !== undefined) {
            this._stats.byDomain[domain]++;
        } else {
            this._stats.byDomain.UNKNOWN++;
        }

        // ── الطبقة ٣: تنفيذ IFL + التجميع ───────────────────────────────────
        const iflResult = await this._executeIFL(routingResult, request);
        this._stats.aggregated++;

        // ── الطبقة ٤: التحقق الشرعي ──────────────────────────────────────────
        const shariaResult = this._applyShariaFilter(iflResult, request);
        if (!shariaResult.passed) {
            this._stats.shariaBlocked++;
            return this._buildShariaBlockedResponse(requestId, shariaResult, request);
        }

        // ── الطبقة ٥: الإخراج الموحّد ─────────────────────────────────────────
        const duration = Date.now() - startTime;
        const output   = this._buildUnifiedOutput(requestId, request, routingResult, iflResult, duration);

        this._logRequest(requestId, request, domain, duration, true);
        this.emit('request:processed', { requestId, domain, duration });

        return output;
    }

    // ─── الطبقة ١: التحقق ────────────────────────────────────────────────────

    /**
     * التحقق من صحة الطلب
     * «مَن غَشَّنَا فَلَيْسَ مِنَّا»
     * @private
     */
    _validateRequest(request) {
        if (!request || typeof request !== 'object') {
            return { valid: false, reason: 'الطلب يجب أن يكون كائناً صالحاً' };
        }
        if (!request.query && !request.data && !request.domain) {
            return { valid: false, reason: 'الطلب يجب أن يحتوي على query أو data أو domain' };
        }
        return { valid: true };
    }

    // ─── الطبقة ٢: التوجيه ───────────────────────────────────────────────────

    /**
     * توجيه الطلب للنطاق المناسب
     * ﴿وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ﴾
     * @private
     */
    _routeRequest(request) {
        // إذا حُدّد النطاق صراحةً
        if (request.domain) {
            return {
                domain:   request.domain.toUpperCase(),
                iflId:    request.iflId || null,
                quranRef: '﴿وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ﴾ — الشورى: ٣٨',
                method:   'explicit',
            };
        }

        // البحث بقواعد التوجيه في query
        const query = request.query || JSON.stringify(request.data || {});
        for (const rule of ROUTING_RULES) {
            if (rule.pattern.test(query)) {
                return {
                    domain:   rule.domain,
                    iflId:    rule.iflId,
                    quranRef: rule.quranRef,
                    method:   'pattern-match',
                };
            }
        }

        // النطاق الافتراضي
        return {
            domain:   'TRADE',
            iflId:    'IFL-F-011',
            quranRef: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
            method:   'default',
        };
    }

    // ─── الطبقة ٣: تنفيذ IFL ─────────────────────────────────────────────────

    /**
     * تنفيذ الوظيفة عبر IFL Engine
     * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾
     * @private
     */
    async _executeIFL(routingResult, request) {
        if (!this._ifl || !routingResult.iflId) {
            return {
                source:   'IDA-standalone',
                domain:   routingResult.domain,
                data:     request.data || {},
                message:  'معالجة بدون IFL Engine',
            };
        }

        try {
            const result = await this._ifl.call(routingResult.iflId, {
                query:  request.query,
                data:   request.data || {},
                userId: request.userId,
            });
            return result;
        } catch (err) {
            console.error(`[IDA-ENGINE] ❌ خطأ في تنفيذ IFL: ${err.message}`);
            return {
                source:   'IDA-fallback',
                domain:   routingResult.domain,
                error:    err.message,
                data:     request.data || {},
            };
        }
    }

    // ─── الطبقة ٤: التحقق الشرعي ──────────────────────────────────────────────

    /**
     * فلترة شرعية على النتائج
     * «الدين النصيحة» — مسلم
     * @private
     */
    _applyShariaFilter(iflResult, request) {
        // وظيفة التحقق الشرعي الأساسية
        const blockedKeywords = [
            'ربا', 'غرر', 'قمار', 'احتكار', 'غش',
            'riba', 'gambling', 'fraud', 'monopoly',
        ];

        const contentToCheck = JSON.stringify({
            query:  request.query || '',
            result: iflResult,
        }).toLowerCase();

        for (const kw of blockedKeywords) {
            if (contentToCheck.includes(kw)) {
                return {
                    passed:   false,
                    reason:   `محتوى محظور شرعياً: "${kw}"`,
                    quranRef: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
                };
            }
        }

        return { passed: true };
    }

    // ─── الطبقة ٥: الإخراج الموحّد ────────────────────────────────────────────

    /**
     * بناء الاستجابة الموحّدة مع مراجع الكتاب والسنة
     * ﴿وَفِي كُلِّ شَيْءٍ لَّهُ آيَةٌ تَدُلُّ عَلَىٰ أَنَّهُ وَاحِدٌ﴾
     * @private
     */
    _buildUnifiedOutput(requestId, request, routingResult, iflResult, duration) {
        return {
            ok:         true,
            requestId,
            bismillah:  BISMILLAH,
            tawheed:    TAWHEED,
            architecture: {
                layer:    'IDA — Interactive Data Architecture',
                position: 'IFL ENGINE → [IDA ENGINE] → Applications',
                version:  VERSION,
            },
            routing: {
                domain:   routingResult.domain,
                iflId:    routingResult.iflId,
                method:   routingResult.method,
                quranRef: routingResult.quranRef,
            },
            data:       iflResult,
            meta: {
                duration:    `${duration}ms`,
                timestamp:   new Date().toISOString(),
                processedBy: 'Sheikha IDA Engine',
            },
            islamicRefs: {
                main:    '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
                flow:    '﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾ — الأنبياء: ٣٠',
                unity:   '﴿وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ﴾ — الشورى: ٣٨',
                hadith:  '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي',
            },
        };
    }

    /**
     * بناء رد على طلب محظور شرعياً
     * @private
     */
    _buildShariaBlockedResponse(requestId, shariaResult, request) {
        return {
            ok:        false,
            requestId,
            blocked:   true,
            reason:    shariaResult.reason,
            quranRef:  shariaResult.quranRef,
            message:   'هذا الطلب لا يتوافق مع الشريعة الإسلامية',
            tawheed:   TAWHEED,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * بناء رد على طلب خاطئ
     * @private
     */
    _buildErrorResponse(requestId, reason, request) {
        return {
            ok:        false,
            requestId,
            error:     reason,
            tawheed:   TAWHEED,
            timestamp: new Date().toISOString(),
        };
    }

    // ─── السجل والإحصائيات ────────────────────────────────────────────────────

    /**
     * تسجيل الطلب في السجل
     * @private
     */
    _logRequest(requestId, request, domain, duration, success) {
        const entry = {
            requestId,
            domain,
            duration,
            success,
            timestamp: new Date().toISOString(),
        };
        this._requestLog.push(entry);

        // الاحتفاظ بآخر 100 طلب فقط
        if (this._requestLog.length > 100) {
            this._requestLog.shift();
        }
    }

    // ─── استعلامات الحالة ────────────────────────────────────────────────────

    /**
     * حالة IDA Engine
     * @returns {object}
     */
    status() {
        return {
            name:          'Sheikha IDA Engine',
            nameAr:        'محرك المعمارية التفاعلية للبيانات',
            version:       VERSION,
            initialized:   this._initialized,
            startedAt:     this._startedAt,
            layers:        Object.entries(IDA_LAYERS).map(([k, v]) => ({
                key:      k,
                id:       v.id,
                nameAr:   v.nameAr,
                quranRef: v.quranRef,
            })),
            stats:         { ...this._stats },
            iflConnected:  !!this._ifl,
            tawheed:       TAWHEED,
            bismillah:     BISMILLAH,
            quranRef:      '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
        };
    }

    /**
     * آخر الطلبات المعالجة
     * @param {number} count
     * @returns {Array}
     */
    recentRequests(count = 10) {
        return this._requestLog.slice(-count);
    }

    /**
     * قائمة طبقات IDA
     * @returns {Array}
     */
    listLayers() {
        return Object.entries(IDA_LAYERS).map(([key, layer]) => ({
            key,
            ...layer,
        }));
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الرابع: Singleton + تصدير
// ═══════════════════════════════════════════════════════════════════════════════

let _instance = null;

/**
 * الحصول على نسخة المحرك (Singleton)
 * @returns {SheikhaIDAEngine}
 */
function getInstance() {
    if (!_instance) {
        _instance = new SheikhaIDAEngine();
        _instance.initialize();
    }
    return _instance;
}

module.exports = {
    SheikhaIDAEngine,
    getInstance,
    IDA_LAYERS,
    ROUTING_RULES,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
