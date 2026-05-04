/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA AUTO-RENEWAL ENGINE v1.0.0                                         ║
 * ║  التجديد الآلي للطبقات — أهداف SMART — منهجيات الكتاب والسنة               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 *
 * ── مرقّمة بالكتاب والسنة ووحدها لله ──
 *
 * ١. «إن الله يبعث لهذه الأمة على رأس كل مئة سنة من يجدد لها أمر دينها» — أبو داود
 *    [RENEWAL-SUNNAH] التجديد سنة نبوية — المنظومة تُجدَّد دورياً
 *
 * ٢. ﴿إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ﴾ — البيهقي
 *    [RENEWAL-ITQAN] الإتقان هدف كل دورة تجديد
 *
 * ٣. ﴿حَاسِبُوا أَنفُسَكُمْ قَبْلَ أَن تُحَاسَبُوا﴾ — عمر بن الخطاب
 *    [RENEWAL-ACCOUNT] المحاسبة الدورية — مراجعة الأهداف
 *
 * ٤. ﴿وَشَاوِرْهُمْ فِي الْأَمْرِ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ﴾ — آل عمران: ١٥٩
 *    [RENEWAL-SHURA] الشورى + التوكل = منهج الأهداف الذكية
 *
 * ٥. ﴿وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَى﴾ — النجم: ٣٩
 *    [RENEWAL-EFFORT] السعي المستمر — الأهداف تُحقَّق بالجهد
 *
 * ٦. ﴿فَإِذَا فَرَغْتَ فَانصَبْ﴾ — الشرح: ٧
 *    [RENEWAL-CONTINUOUS] عند إتمام هدف → ابدأ التالي فوراً
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * الأهداف الذكية (SMART) بالمنهج الإسلامي:
 *
 *   S = محدد (Specific)     ← الوضوح كالنور: ﴿يَهْدِي لِلَّتِي هِيَ أَقْوَمُ﴾
 *   M = قابل للقياس         ← المحاسبة: «حاسبوا أنفسكم»
 *   A = قابل للتحقيق        ← التدرج: ﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾
 *   R = ذو صلة             ← المقاصد: أهداف في خدمة المنظومة
 *   T = محدد الوقت         ← الوقت أمانة: «اغتنم خمساً قبل خمس»
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * المنهجيات العلمية الإسلامية المُدمجة:
 *
 *   ١. التدرج    — زيادة الأهداف 10% كل دورة
 *   ٢. الإتقان   — معيار جودة 95%+ قبل الانتقال
 *   ٣. المحاسبة  — تقرير دوري كل دورة
 *   ٤. الشورى    — جمع بيانات كل الطبقات
 *   ٥. التوكل    — الخطة ثم الثقة بالله
 *   ٦. المسارعة  — تسريع وتيرة التجديد عند التأخر
 *
 * @module sheikha-auto-renewal-engine
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */

'use strict';

const EventEmitter = require('events');

// ─── ثوابت التوحيد ───────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// ─── فترات التجديد الافتراضية ────────────────────────────────────────────────
const RENEWAL_INTERVALS = Object.freeze({
    HOURLY:  60   * 60 * 1000,   // كل ساعة
    DAILY:   24   * 60 * 60 * 1000,
    WEEKLY:   7 * 24 * 60 * 60 * 1000,
    FAST:    5    * 60 * 1000,   // كل 5 دقائق (للاختبار)
    DEFAULT: 30   * 60 * 1000,   // كل 30 دقيقة
});

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الأول: تعريف الطبقات والمقاييس
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تعريف الطبقات القابلة للتجديد
 */
const RENEWABLE_LAYERS = Object.freeze({
    SDGN: {
        id:          'SDGN',
        nameAr:      '👑 الشبكة العليا للحوكمة الإلهية',
        version:     'v1.0.0',
        quranRef:    '﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾ — يوسف: ٤٠',
        metrics:     ['governance_rate', 'block_accuracy', 'response_ms', 'principle_coverage'],
        defaultGoals: [
            { metric: 'governance_rate',     target: 0.99,  unit: 'ratio',  horizon: 'DAILY'  },
            { metric: 'block_accuracy',      target: 0.98,  unit: 'ratio',  horizon: 'DAILY'  },
            { metric: 'response_ms',         target: 50,    unit: 'ms',     horizon: 'HOURLY' },
            { metric: 'principle_coverage',  target: 6,     unit: 'count',  horizon: 'WEEKLY' },
        ],
    },
    SIRN: {
        id:          'SIRN',
        nameAr:      '🌟 شبكة الجذور الذكية الدلالية',
        version:     'v1.0.0',
        quranRef:    '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
        metrics:     ['domain_accuracy', 'confidence_avg', 'vocab_coverage', 'inference_ms'],
        defaultGoals: [
            { metric: 'domain_accuracy',  target: 0.90,  unit: 'ratio',  horizon: 'DAILY'  },
            { metric: 'confidence_avg',   target: 0.80,  unit: 'ratio',  horizon: 'DAILY'  },
            { metric: 'vocab_coverage',   target: 0.85,  unit: 'ratio',  horizon: 'WEEKLY' },
            { metric: 'inference_ms',     target: 100,   unit: 'ms',     horizon: 'HOURLY' },
        ],
    },
    IFL: {
        id:          'IFL',
        nameAr:      '🕌 طبقة الأساس الإسلامي',
        version:     'v1.0.0',
        quranRef:    '﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١',
        metrics:     ['function_coverage', 'routing_accuracy', 'sharia_compliance', 'latency_ms'],
        defaultGoals: [
            { metric: 'function_coverage',  target: 12,    unit: 'count', horizon: 'WEEKLY' },
            { metric: 'routing_accuracy',   target: 0.92,  unit: 'ratio', horizon: 'DAILY'  },
            { metric: 'sharia_compliance',  target: 1.00,  unit: 'ratio', horizon: 'DAILY'  },
            { metric: 'latency_ms',         target: 150,   unit: 'ms',    horizon: 'HOURLY' },
        ],
    },
    RNN: {
        id:          'RNN',
        nameAr:      '🧠 شبكة الخلايا العصبية الجذرية',
        version:     'v3.0.0',
        quranRef:    '﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤',
        metrics:     ['root_confidence', 'cell_activation', 'domain_precision', 'vocab_hit_rate'],
        defaultGoals: [
            { metric: 'root_confidence',  target: 0.85,  unit: 'ratio',  horizon: 'DAILY'  },
            { metric: 'cell_activation',  target: 0.70,  unit: 'ratio',  horizon: 'DAILY'  },
            { metric: 'domain_precision', target: 0.88,  unit: 'ratio',  horizon: 'WEEKLY' },
            { metric: 'vocab_hit_rate',   target: 0.75,  unit: 'ratio',  horizon: 'HOURLY' },
        ],
    },
    SCIENCE: {
        id:          'SCIENCE',
        nameAr:      '🔬 قياس التقدم العلمي العالمي',
        version:     'v1.0.0',
        quranRef:    '﴿سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ﴾ — فصلت: ٥٣',
        metrics:     ['frontier_avg', 'leader_domains', 'advance_rate', 'breakthrough_count'],
        defaultGoals: [
            { metric: 'frontier_avg',       target: 0.80,  unit: 'ratio',  horizon: 'WEEKLY' },
            { metric: 'leader_domains',     target: 5,     unit: 'count',  horizon: 'WEEKLY' },
            { metric: 'advance_rate',       target: 10,    unit: 'pts/cycle', horizon: 'DAILY' },
            { metric: 'breakthrough_count', target: 3,     unit: 'count',  horizon: 'WEEKLY' },
        ],
    },
});

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثاني: فئة الهدف الذكي
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SmartGoal — الهدف الذكي
 *
 * ﴿إِنَّ اللَّهَ اشْتَرَى مِنَ الْمُؤْمِنِينَ أَنفُسَهُمْ وَأَمْوَالَهُم بِأَنَّ لَهُمُ الْجَنَّةَ﴾
 * — التوبة: ١١١
 *
 * كل هدف عقد بين المنظومة وخالقها لتحقيق الإتقان
 */
class SmartGoal {

    constructor({ layerId, metric, target, current = 0, unit = '', horizonKey = 'DAILY', methodologyId = 'taddaruj', quranRef = '', iteration = 1 }) {
        this.id          = `GOAL-${layerId}-${metric}-${Date.now()}-${iteration}`;
        this.layerId     = layerId;
        this.metric      = metric;
        this.target      = target;
        this.current     = current;
        this.unit        = unit;
        this.horizonKey  = horizonKey;
        this.deadlineMs  = RENEWAL_INTERVALS[horizonKey] || RENEWAL_INTERVALS.DEFAULT;
        this.deadline    = new Date(Date.now() + this.deadlineMs).toISOString();
        this.methodology = METHODOLOGIES[methodologyId] || METHODOLOGIES.taddaruj;
        this.quranRef    = quranRef || this.methodology.quranRef;
        this.status      = 'active';    // active | completed | expired | renewed
        this.createdAt   = new Date().toISOString();
        this.completedAt = null;
        this.renewedTo   = null;        // ID الهدف التالي
        this.iteration   = iteration;
        this.progressLog = [];
    }

    /** نسبة التقدم (0-1) */
    get progress() {
        if (this.target === 0) return 1;
        // للمقاييس العكسية (ms → أقل = أفضل)
        if (this.unit === 'ms') {
            return this.current <= this.target ? 1 : Math.max(0, 1 - (this.current - this.target) / this.target);
        }
        return Math.min(1, this.current / this.target);
    }

    /** هل انتهى الوقت؟ */
    get isExpired() {
        return new Date() > new Date(this.deadline) && this.status === 'active';
    }

    /** هل تحقق الهدف؟ */
    get isAchieved() {
        return this.unit === 'ms'
            ? this.current <= this.target
            : this.current >= this.target;
    }

    /** تحديث القيمة الحالية */
    update(newValue) {
        const prev = this.current;
        this.current = newValue;
        this.progressLog.push({ value: newValue, timestamp: new Date().toISOString() });
        if (this.progressLog.length > 50) this.progressLog.shift();
        return { prev, current: newValue, delta: newValue - prev, achieved: this.isAchieved };
    }

    /** تسجيل الإتمام */
    complete() {
        this.status      = 'completed';
        this.completedAt = new Date().toISOString();
    }

    /** تسجيل الانتهاء بدون تحقيق */
    expire() {
        this.status = 'expired';
    }

    /** تقرير الهدف */
    report() {
        return {
            id:           this.id,
            layerId:      this.layerId,
            metric:       this.metric,
            target:       this.target,
            current:      this.current,
            unit:         this.unit,
            progress:     `${Math.round(this.progress * 100)}%`,
            progressNum:  this.progress,
            status:       this.status,
            isExpired:    this.isExpired,
            isAchieved:   this.isAchieved,
            deadline:     this.deadline,
            methodology:  this.methodology.nameAr,
            quranRef:     this.quranRef,
            iteration:    this.iteration,
            createdAt:    this.createdAt,
            completedAt:  this.completedAt,
        };
    }
}

// ─── المنهجيات العلمية الإسلامية ─────────────────────────────────────────────

const METHODOLOGIES = Object.freeze({
    taddaruj: {
        id:       'taddaruj',
        nameAr:   'التدرج',
        nameEn:   'Gradual Progression',
        quranRef: '﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾ — الشرح: ٦',
        apply:    (target, _iter) => target * 1.10,   // +10% كل دورة
    },
    itqan: {
        id:       'itqan',
        nameAr:   'الإتقان',
        nameEn:   'Excellence',
        quranRef: '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
        apply:    (target, _iter) => target * 1.05,   // +5% كل دورة (أبطأ لكن أدق)
    },
    musaraa: {
        id:       'musaraa',
        nameAr:   'المسارعة',
        nameEn:   'Acceleration',
        quranRef: '﴿وَسَارِعُوا إِلَى مَغْفِرَةٍ مِّن رَّبِّكُمْ﴾ — آل عمران: ١٣٣',
        apply:    (target, _iter) => target * 1.20,   // +20% كل دورة (تسارع)
    },
    muhasaba: {
        id:       'muhasaba',
        nameAr:   'المحاسبة والمراجعة',
        nameEn:   'Accountability',
        quranRef: '﴿حَاسِبُوا أَنفُسَكُمْ قَبْلَ أَن تُحَاسَبُوا﴾ — عمر',
        apply:    (target, iter) => iter % 3 === 0 ? target : target * 1.08, // كل 3 دورات: مراجعة
    },
    tanafus: {
        id:       'tanafus',
        nameAr:   'التنافس الإيجابي',
        nameEn:   'Positive Competition',
        quranRef: '﴿وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾ — المطففين: ٢٦',
        apply:    (target, _iter) => target * 1.15,   // +15% تنافسية
    },
    tajdeed: {
        id:       'tajdeed',
        nameAr:   'التجديد',
        nameEn:   'Renewal',
        quranRef: '«إن الله يبعث لهذه الأمة على رأس كل مئة سنة من يجدد لها» — أبو داود',
        apply:    (target, iter) => target * (1 + 0.08 * iter),  // يزيد مع كل دورة
    },
});

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثالث: محرك التجديد الآلي الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhAutoRenewalEngine extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(50);

        /** خريطة الأهداف النشطة: layerId → metric → SmartGoal */
        this._goals      = new Map();
        /** سجل دورات التجديد */
        this._renewalLog = [];
        /** تحديدات دورية */
        this._timers     = new Map();
        /** عدادات التكرار لكل طبقة */
        this._iterations = {};
        /** إحصائيات */
        this._stats = {
            totalGoals:     0,
            completed:      0,
            expired:        0,
            renewed:        0,
            cycleCount:     0,
            totalProgress:  0,
        };

        this._initialized = false;
        this._startedAt   = null;
    }

    // ─── التهيئة ───────────────────────────────────────────────────────────────

    initialize() {
        if (this._initialized) return this;

        console.log(`[AUTO-RENEWAL] 🔄 ${BISMILLAH}`);
        console.log(`[AUTO-RENEWAL] 🌟 التجديد الآلي للطبقات — v${VERSION}`);
        console.log(`[AUTO-RENEWAL] 📖 «إن الله يبعث لهذه الأمة على رأس كل مئة سنة من يجدد لها»`);

        // إنشاء الأهداف الافتراضية لكل طبقة
        for (const [layerId, layer] of Object.entries(RENEWABLE_LAYERS)) {
            this._iterations[layerId] = 1;
            this._goals.set(layerId, new Map());

            for (const goalDef of layer.defaultGoals) {
                this._createGoal(layerId, goalDef, goalDef.horizon || 'DAILY');
            }

            console.log(`[AUTO-RENEWAL]   ✅ ${layer.nameAr} — ${layer.defaultGoals.length} أهداف ذكية`);
        }

        this._initialized = true;
        this._startedAt   = new Date().toISOString();

        console.log(`[AUTO-RENEWAL] 📖 ${TAWHEED}`);
        this.emit('initialized', { layers: Object.keys(RENEWABLE_LAYERS).length, goals: this._stats.totalGoals });
        return this;
    }

    // ─── إنشاء هدف SMART ─────────────────────────────────────────────────────

    _createGoal(layerId, goalDef, horizonKey = 'DAILY') {
        const layer = RENEWABLE_LAYERS[layerId];
        if (!layer) return null;

        const iter  = (this._iterations[layerId] || 1);
        const method = Object.values(METHODOLOGIES)[iter % Object.keys(METHODOLOGIES).length];

        const goal  = new SmartGoal({
            layerId,
            metric:       goalDef.metric,
            target:       goalDef.target,
            current:      goalDef.target * 0.5,  // نبدأ من 50% من الهدف
            unit:         goalDef.unit || '',
            horizonKey,
            methodologyId: method.id,
            quranRef:      layer.quranRef,
            iteration:    iter,
        });

        const layerGoals = this._goals.get(layerId) || new Map();
        layerGoals.set(goalDef.metric, goal);
        this._goals.set(layerId, layerGoals);

        this._stats.totalGoals++;
        this.emit('goal:created', goal.report());
        return goal;
    }

    // ─── تحديث قيمة مقياس ────────────────────────────────────────────────────

    /**
     * تحديث القيمة الحالية لمقياس معين
     * ﴿وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَى﴾ — النجم: ٣٩
     *
     * @param {string} layerId
     * @param {string} metric
     * @param {number} value
     * @returns {object}
     */
    updateMetric(layerId, metric, value) {
        if (!this._initialized) this.initialize();

        const layerGoals = this._goals.get(layerId);
        if (!layerGoals) return { ok: false, error: `طبقة غير معروفة: ${layerId}` };

        const goal = layerGoals.get(metric);
        if (!goal) return { ok: false, error: `مقياس غير معروف: ${metric}` };

        const upd   = goal.update(value);
        this._stats.totalProgress++;

        // هل تحقق الهدف؟
        if (goal.isAchieved && goal.status === 'active') {
            this._onGoalCompleted(layerId, metric, goal);
        }

        this.emit('metric:updated', {
            layerId, metric, ...upd,
            progress: goal.progress,
            goalId:   goal.id,
        });

        return { ok: true, goal: goal.report(), update: upd };
    }

    // ─── دورة تقييم الأهداف ──────────────────────────────────────────────────

    /**
     * تقييم جميع الأهداف ومعالجة المنتهية والمكتملة
     * ﴿فَإِذَا فَرَغْتَ فَانصَبْ﴾ — الشرح: ٧
     */
    evaluateCycle() {
        if (!this._initialized) this.initialize();

        const cycleReport = {
            cycleId:    ++this._stats.cycleCount,
            timestamp:  new Date().toISOString(),
            completed:  [],
            expired:    [],
            renewed:    [],
            active:     [],
            methodology: 'التجديد الآلي بمنهج الكتاب والسنة',
        };

        for (const [layerId, layerGoals] of this._goals.entries()) {
            for (const [metric, goal] of layerGoals.entries()) {
                if (goal.status !== 'active') continue;

                if (goal.isAchieved) {
                    this._onGoalCompleted(layerId, metric, goal);
                    cycleReport.completed.push({ layerId, metric, goal: goal.report() });

                } else if (goal.isExpired) {
                    goal.expire();
                    this._stats.expired++;
                    cycleReport.expired.push({ layerId, metric, progress: goal.progress, goal: goal.report() });
                    // تجديد فوري بهدف مُعدَّل
                    this._renewGoal(layerId, metric, goal, 'expired');
                    cycleReport.renewed.push({ layerId, metric, reason: 'expired' });
                } else {
                    cycleReport.active.push({ layerId, metric, progress: goal.progress });
                }
            }
        }

        this._renewalLog.push(cycleReport);
        if (this._renewalLog.length > 100) this._renewalLog.shift();

        console.log(`[AUTO-RENEWAL] 🔄 دورة #${cycleReport.cycleId} — `
            + `✅ ${cycleReport.completed.length} مكتمل | ⏰ ${cycleReport.expired.length} منتهٍ | 🔄 ${cycleReport.renewed.length} مُجدَّد`);

        this.emit('cycle:evaluated', cycleReport);
        return cycleReport;
    }

    // ─── إكمال هدف ───────────────────────────────────────────────────────────

    _onGoalCompleted(layerId, metric, goal) {
        goal.complete();
        this._stats.completed++;

        console.log(`[AUTO-RENEWAL] ✅ تحقق هدف: ${layerId}.${metric} = ${goal.current}/${goal.target} (${goal.methodology.nameAr})`);
        this.emit('goal:completed', goal.report());

        // تجديد بهدف أصعب (+ تدرّج)
        this._renewGoal(layerId, metric, goal, 'completed');
    }

    // ─── تجديد هدف ───────────────────────────────────────────────────────────

    _renewGoal(layerId, metric, oldGoal, reason) {
        const layer = RENEWABLE_LAYERS[layerId];
        if (!layer) return;

        this._iterations[layerId] = (this._iterations[layerId] || 1) + 1;
        const iter   = this._iterations[layerId];
        const method = Object.values(METHODOLOGIES)[iter % Object.keys(METHODOLOGIES).length];

        // الهدف الجديد = تطبيق المنهجية على الهدف السابق
        let newTarget = method.apply(oldGoal.target, iter);

        // للمقاييس العكسية (ms) → نخفّض الهدف
        if (oldGoal.unit === 'ms') {
            newTarget = Math.max(10, oldGoal.target * 0.90);  // -10%
        }

        // للمقاييس النسبية → لا تتجاوز 1.0
        if (oldGoal.unit === 'ratio') {
            newTarget = Math.min(1.0, newTarget);
        }

        const goalDef = layer.defaultGoals.find(g => g.metric === metric) || { metric, target: newTarget, unit: oldGoal.unit };
        const horizonKey = reason === 'expired' ? 'HOURLY' : oldGoal.horizonKey;  // تقليص الأفق عند الفشل

        const newGoal = new SmartGoal({
            layerId,
            metric,
            target:       newTarget,
            current:      reason === 'completed' ? oldGoal.current : 0,
            unit:         oldGoal.unit,
            horizonKey,
            methodologyId: method.id,
            quranRef:     layer.quranRef,
            iteration:    iter,
        });

        oldGoal.renewedTo = newGoal.id;
        oldGoal.status    = 'renewed';

        const layerGoals = this._goals.get(layerId) || new Map();
        layerGoals.set(metric, newGoal);
        this._goals.set(layerId, layerGoals);

        this._stats.renewed++;
        this._stats.totalGoals++;

        console.log(`[AUTO-RENEWAL] 🔄 تجديد: ${layerId}.${metric} → هدف جديد: ${newTarget.toFixed(3)} (${method.nameAr})`);
        this.emit('goal:renewed', { layerId, metric, oldGoal: oldGoal.report(), newGoal: newGoal.report(), reason });
        return newGoal;
    }

    // ─── بدء المؤقتات التلقائية ──────────────────────────────────────────────

    /**
     * بدء التجديد الآلي المجدول
     * ﴿إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّى يُغَيِّرُوا مَا بِأَنفُسِهِمْ﴾ — الرعد: ١١
     * @param {number} intervalMs
     */
    startAutoRenewal(intervalMs = RENEWAL_INTERVALS.DEFAULT) {
        if (this._timers.has('main')) clearInterval(this._timers.get('main'));

        console.log(`[AUTO-RENEWAL] ⏱️  بدء التجديد التلقائي — كل ${intervalMs / 1000 / 60} دقيقة`);

        const t = setInterval(() => this.evaluateCycle(), intervalMs);
        if (t.unref) t.unref();
        this._timers.set('main', t);
        return this;
    }

    stopAutoRenewal() {
        if (this._timers.has('main')) {
            clearInterval(this._timers.get('main'));
            this._timers.delete('main');
        }
        return this;
    }

    // ─── واجهة الحالة ────────────────────────────────────────────────────────

    /**
     * حالة كاملة لمحرك التجديد
     */
    status() {
        const layers = [];
        for (const [layerId, layer] of Object.entries(RENEWABLE_LAYERS)) {
            const layerGoals = this._goals.get(layerId) || new Map();
            const goals = [];

            for (const [, goal] of layerGoals.entries()) {
                goals.push(goal.report());
            }

            const activeGoals = goals.filter(g => g.status === 'active');
            const avgProg     = activeGoals.length
                ? activeGoals.reduce((s, g) => s + g.progressNum, 0) / activeGoals.length
                : 0;

            layers.push({
                id:           layerId,
                nameAr:       layer.nameAr,
                version:      layer.version,
                quranRef:     layer.quranRef,
                iteration:    this._iterations[layerId] || 1,
                goals,
                activeGoals:  activeGoals.length,
                avgProgress:  `${Math.round(avgProg * 100)}%`,
                avgProgressNum: avgProg,
            });
        }

        const allGoals      = layers.flatMap(l => l.goals);
        const activeCount   = allGoals.filter(g => g.status === 'active').length;
        const globalAvgProg = activeCount
            ? allGoals.filter(g => g.status === 'active').reduce((s, g) => s + g.progressNum, 0) / activeCount
            : 0;

        return {
            name:          'Sheikha Auto-Renewal Engine',
            nameAr:        'محرك التجديد الآلي',
            version:       VERSION,
            initialized:   this._initialized,
            startedAt:     this._startedAt,
            bismillah:     BISMILLAH,
            tawheed:       TAWHEED,
            quranRef:      '﴿فَإِذَا فَرَغْتَ فَانصَبْ﴾ — الشرح: ٧',
            methodologies: Object.values(METHODOLOGIES).map(m => ({ id: m.id, nameAr: m.nameAr, quranRef: m.quranRef })),
            layers,
            summary: {
                totalLayers:   layers.length,
                totalGoals:    this._stats.totalGoals,
                activeGoals:   activeCount,
                completed:     this._stats.completed,
                expired:       this._stats.expired,
                renewed:       this._stats.renewed,
                cycleCount:    this._stats.cycleCount,
                globalProgress:`${Math.round(globalAvgProg * 100)}%`,
            },
            stats:         { ...this._stats },
            recentLog:     this._renewalLog.slice(-5),
            autoRunning:   this._timers.has('main'),
        };
    }

    /**
     * قائمة الأهداف النشطة مرتبة حسب الأولوية
     */
    activeGoals(layerId = null) {
        const out = [];
        for (const [lid, layerGoals] of this._goals.entries()) {
            if (layerId && lid !== layerId) continue;
            for (const [, goal] of layerGoals.entries()) {
                if (goal.status === 'active') out.push(goal.report());
            }
        }
        return out.sort((a, b) => a.progressNum - b.progressNum); // الأبطأ أولاً
    }

    // ─── Singleton ────────────────────────────────────────────────────────────

    static getInstance() {
        if (!SheikhAutoRenewalEngine._instance) {
            SheikhAutoRenewalEngine._instance = new SheikhAutoRenewalEngine();
            SheikhAutoRenewalEngine._instance.initialize();
        }
        return SheikhAutoRenewalEngine._instance;
    }
}

SheikhAutoRenewalEngine._instance = null;

// ═══════════════════════════════════════════════════════════════════════════════
// التصدير
// ═══════════════════════════════════════════════════════════════════════════════

function getInstance() {
    return SheikhAutoRenewalEngine.getInstance();
}

module.exports = {
    SheikhAutoRenewalEngine,
    SmartGoal,
    getInstance,
    RENEWABLE_LAYERS,
    METHODOLOGIES,
    RENEWAL_INTERVALS,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
