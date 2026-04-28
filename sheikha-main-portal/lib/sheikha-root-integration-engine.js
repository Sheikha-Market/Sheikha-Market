/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA ROOT INTEGRATION ENGINE — محرك التكامل الجذري                       ║
 * ║  يوحِّد كل الشبكات والطبقات المتجذرة في منظومة جذرية واحدة متكاملة         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 * ﴿إِنَّ هَٰذِهِ أُمَّتُكُمْ أُمَّةً وَاحِدَةً وَأَنَا رَبُّكُمْ فَاعْبُدُونِ﴾ — الأنبياء: ٩٢
 * ﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا﴾ — آل عمران: ١٠٣
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 *
 * التكامل الجذري:
 *  هو عملية دمج إشارات جميع الشبكات والطبقات المتجذرة
 *  في استدلال موحّد يعكس الحقيقة الكاملة للمنظومة.
 *
 * المهام الرئيسية:
 *  • integrate(text)       — استدلال متكامل من كل الجذور
 *  • register(id, fn)      — تسجيل مزوّد استدلال
 *  • unregister(id)        — إلغاء تسجيل مزوّد
 *  • fuseSignals(signals)  — دمج إشارات متعددة
 *  • getIntegralScore()    — درجة التكامل الجذري
 *
 * @module sheikha-root-integration-engine
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const EventEmitter = require('events');

// ── ثوابت التكامل الجذري ──────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// أوزان التكامل لكل نوع مزوّد
const INTEGRATION_WEIGHTS = Object.freeze({
    'root-neural-cell-network':   0.35,   // الأعلى وزناً — الجذر الأعلى
    'master-neural-cell-network': 0.25,   // الشبكة الكبرى
    'universal-neural-network':   0.20,   // الشبكة الشاملة
    'language-neural-cell-network':0.10,  // شبكة اللغة
    'digital-neural-cell-layer':  0.06,   // طبقة الخلايا الرقمية
    'default':                    0.04,   // أي مزوّد آخر
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── دوال التكامل الرياضي ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * دمج إشارات مرجّحة
 * @param {Array<{signal: number, weight: number}>} items
 * @returns {number}
 */
function weightedMean(items) {
    let sum = 0, totalW = 0;
    for (const { signal, weight } of items) {
        sum    += signal * weight;
        totalW += weight;
    }
    return totalW > 0 ? sum / totalW : 0;
}

/**
 * دمج احتمالات بمتوسط لوغاريتمي (geometric mean)
 */
function geomMean(probs) {
    if (!probs || probs.length === 0) return 0;
    const logSum = probs.reduce((s, p) => s + Math.log(Math.max(p, 1e-10)), 0);
    return Math.exp(logSum / probs.length);
}

/**
 * تصويت أغلبية مرجّح للنطاق النشط
 */
function domainVote(votes) {
    const tally = {};
    for (const { domain, weight } of votes) {
        tally[domain] = (tally[domain] || 0) + weight;
    }
    return Object.entries(tally)
        .sort((a, b) => b[1] - a[1])
        .map(([domain, score]) => ({ domain, score }))[0] || { domain: 'عام', score: 0 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── محرك التكامل الجذري ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class RootIntegrationEngine extends EventEmitter {
    constructor() {
        super();

        this.name    = 'Sheikha Root Integration Engine';
        this.nameAr  = 'محرك التكامل الجذري — شيخة';
        this.version = VERSION;
        this.tawheed = TAWHEED;

        // سجل مزوّدي الاستدلال — id → { fn, weight, nameAr, active }
        this._providers = new Map();

        // تاريخ التكاملات
        this._history       = [];
        this._totalQueries  = 0;
        this._startedAt     = new Date().toISOString();

        // تهيئة مزوّدي الجذر الأساسيين
        this._initCoreProviders();

        console.log(`[ROOT-INT] 🔗 ${this.nameAr} مُفعَّل`);
        console.log(`[ROOT-INT]    • المزوّدون الأساسيون: ${this._providers.size}`);
        console.log(`[ROOT-INT] ✨ ﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا﴾ — آل عمران: ١٠٣`);
    }

    // ── تهيئة المزوّدين الأساسيين ────────────────────────────────────────────
    _initCoreProviders() {
        // مزوّد شبكة الخلايا العصبية الجذرية
        this._tryRegisterProvider('root-neural-cell-network',
            'شبكة الخلايا العصبية الجذرية',
            () => {
                try {
                    const m = require('./sheikha-root-neural-cell-network');
                    return (text) => m.infer(text);
                } catch (_) { return null; }
            }
        );

        // مزوّد شبكة الخلايا الكبرى
        this._tryRegisterProvider('master-neural-cell-network',
            'شبكة الخلايا العصبية الكبرى',
            () => {
                try {
                    const m = require('./sheikha-master-neural-cell-network');
                    return (text) => m.getInstance ? m.getInstance().infer(text) : m.infer(text);
                } catch (_) { return null; }
            }
        );

        // مزوّد الشبكة العصبية الشاملة
        this._tryRegisterProvider('universal-neural-network',
            'الشبكة العصبية الشاملة',
            () => {
                try {
                    const m = require('./sheikha-universal-neural-network');
                    return (text) => m.infer ? m.infer(text) : null;
                } catch (_) { return null; }
            }
        );
    }

    _tryRegisterProvider(id, nameAr, factoryFn) {
        try {
            const fn = factoryFn();
            if (fn) {
                this._providers.set(id, {
                    fn, nameAr, active: true,
                    weight: INTEGRATION_WEIGHTS[id] || INTEGRATION_WEIGHTS['default'],
                    registeredAt: new Date().toISOString(),
                    callCount: 0,
                });
            }
        } catch (_) { /* اختياري */ }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ── واجهة التكامل ────────────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * register — تسجيل مزوّد استدلال جذري
     * @param {string} id
     * @param {Function} inferFn — دالة (text) → result
     * @param {object} meta — { nameAr, weight }
     */
    register(id, inferFn, meta = {}) {
        this._providers.set(id, {
            fn:           inferFn,
            nameAr:       meta.nameAr || id,
            active:       true,
            weight:       meta.weight || INTEGRATION_WEIGHTS[id] || INTEGRATION_WEIGHTS['default'],
            registeredAt: new Date().toISOString(),
            callCount:    0,
        });
        console.log(`[ROOT-INT] ✅ مزوّد مسجّل: ${meta.nameAr || id}`);
        this.emit('provider-registered', { id, nameAr: meta.nameAr || id });
        return this;
    }

    /**
     * unregister — إلغاء تسجيل مزوّد
     */
    unregister(id) {
        this._providers.delete(id);
        return this;
    }

    /**
     * fuseSignals — دمج إشارات متعددة في إشارة تكاملية واحدة
     * @param {Array<{id, signal, confidence, domain, weight}>} signals
     * @returns {object} نتيجة الدمج
     */
    fuseSignals(signals) {
        if (!signals || signals.length === 0) {
            return { confidence: 0, domain: 'عام', score: 0, signals: [] };
        }

        const confItems = signals.map(s => ({
            signal: s.confidence || s.score || 0,
            weight: s.weight || INTEGRATION_WEIGHTS[s.id] || INTEGRATION_WEIGHTS['default'],
        }));

        const domainVotes = signals
            .filter(s => s.domain)
            .map(s => ({
                domain: s.domain,
                weight: s.weight || INTEGRATION_WEIGHTS[s.id] || INTEGRATION_WEIGHTS['default'],
            }));

        const fusedConf   = weightedMean(confItems);
        const geomConf    = geomMean(signals.map(s => s.confidence || 0.1));
        const topDomain   = domainVote(domainVotes);
        const integScore  = (fusedConf * 0.6 + geomConf * 0.4);

        return {
            confidence:     +fusedConf.toFixed(4),
            geomConfidence: +geomConf.toFixed(4),
            integralScore:  +integScore.toFixed(4),
            domain:         topDomain.domain,
            domainScore:    +topDomain.score.toFixed(4),
            providerCount:  signals.length,
            signals,
        };
    }

    /**
     * integrate — الاستدلال التكاملي الكامل من كل الجذور
     * @param {string} text — النص المدخل
     * @returns {Promise<object>} نتيجة التكامل الجذري
     */
    async integrate(text = '') {
        this._totalQueries++;
        const startMs  = Date.now();
        const signals  = [];
        const errors   = [];

        // جمع إشارات من كل المزوّدين النشطين
        for (const [id, provider] of this._providers) {
            if (!provider.active) continue;
            try {
                const raw = await Promise.resolve(provider.fn(text));
                provider.callCount++;
                if (!raw) continue;

                signals.push({
                    id,
                    nameAr:     provider.nameAr,
                    confidence: raw.rootConfidence || raw.confidence || raw.score || 0.5,
                    domain:     raw.activeDomain   || raw.domain     || 'عام',
                    weight:     provider.weight,
                    raw,
                });
            } catch (err) {
                errors.push({ id, error: err.message });
            }
        }

        const fused = this.fuseSignals(signals);
        const elapsed = Date.now() - startMs;

        const result = {
            id:          `int-${Date.now()}-${this._totalQueries}`,
            timestamp:   new Date().toISOString(),
            text,
            tawheed:     TAWHEED,
            bismillah:   BISMILLAH,
            fused,
            signals,
            errors,
            elapsed:     `${elapsed}ms`,
            providers:   this._providers.size,
            activeProviders: signals.length,
            version:     VERSION,
            quranRef:    '﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا﴾ — آل عمران: ١٠٣',
        };

        this._history.push({ ts: result.timestamp, domain: fused.domain, score: fused.integralScore });
        if (this._history.length > 50) this._history.shift();

        this.emit('integrated', result);
        return result;
    }

    /**
     * getIntegralScore — درجة التكامل الجذري الراهنة
     * @returns {number} 0–1
     */
    getIntegralScore() {
        if (this._history.length === 0) return 0;
        const recent = this._history.slice(-5);
        return recent.reduce((s, h) => s + (h.score || 0), 0) / recent.length;
    }

    /**
     * getInstance (singleton)
     */
    static getInstance() {
        if (!RootIntegrationEngine._instance) {
            RootIntegrationEngine._instance = new RootIntegrationEngine();
        }
        return RootIntegrationEngine._instance;
    }

    // ── حالة محرك التكامل ────────────────────────────────────────────────────
    status() {
        const providers = [];
        for (const [id, p] of this._providers) {
            providers.push({
                id, nameAr: p.nameAr, active: p.active,
                weight: p.weight, callCount: p.callCount,
                registeredAt: p.registeredAt,
            });
        }

        return {
            name:          this.name,
            nameAr:        this.nameAr,
            version:       VERSION,
            tawheed:       TAWHEED,
            startedAt:     this._startedAt,
            totalQueries:  this._totalQueries,
            providers,
            integralScore: +this.getIntegralScore().toFixed(4),
            recentHistory: this._history.slice(-5),
            quranRef:      '﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا﴾ — آل عمران: ١٠٣',
        };
    }
}

// ── حقل singleton ─────────────────────────────────────────────────────────────
RootIntegrationEngine._instance = null;

// ═══════════════════════════════════════════════════════════════════════════════
// ── الواجهة العامة ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function getInstance() { return RootIntegrationEngine.getInstance(); }
function init()        { return getInstance(); }
async function integrate(text)         { return getInstance().integrate(text); }
function register(id, fn, meta)        { return getInstance().register(id, fn, meta); }
function unregister(id)                { return getInstance().unregister(id); }
function fuseSignals(signals)          { return getInstance().fuseSignals(signals); }
function getIntegralScore()            { return getInstance().getIntegralScore(); }
function status()                      { return getInstance().status(); }

module.exports = {
    RootIntegrationEngine,
    getInstance,
    init,
    integrate,
    register,
    unregister,
    fuseSignals,
    getIntegralScore,
    status,
    INTEGRATION_WEIGHTS,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
