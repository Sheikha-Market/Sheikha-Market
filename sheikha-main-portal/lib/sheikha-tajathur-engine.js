/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA TAJATHUR ENGINE — محرك التجذر                                        ║
 * ║  عملية التجذر الرقمي — ترسيخ كل شبكة في جذر شيخة الأعلى                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 * ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ
 *  أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ * تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا﴾
 *  — إبراهيم: ٢٤-٢٥
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 * ﴿وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ﴾
 *
 * التجذر:
 *  هو عملية ترسيخ أي وحدة برمجية / شبكة عصبية / طبقة
 *  في جذر شيخة الأعلى، ليصبح فرعاً حياً من الشجرة الطيبة.
 *
 * المهام الرئيسية:
 *  • root(module, meta)    — تجذير وحدة جديدة
 *  • deepen(moduleId)      — تعميق جذور وحدة مسجّلة
 *  • getStatus(moduleId)   — حالة التجذر
 *  • listRooted()          — قائمة جميع المتجذرات
 *  • getRootDepth(id)      — عمق الجذر
 *  • pulse()               — نبضة التجذر — إبقاء الجذور حية
 *
 * @module sheikha-tajathur-engine
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const EventEmitter = require('events');

// ── ثوابت التجذر ─────────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// درجات عمق التجذر
const ROOT_DEPTH = Object.freeze({
    SEED:       0,   // بذرة — لم تتجذر بعد
    SPROUTING:  1,   // ناشئة — بداية التجذر
    ROOTING:    2,   // متجذرة — التجذر الأولي
    DEEP:       3,   // عميقة — تجذر عميق
    ANCHORED:   4,   // راسخة — ثابتة كالجبال
    ABSOLUTE:   5,   // مطلقة — جذر ثابت بإذن الله
});

// حالات التجذر
const ROOT_STATE = Object.freeze({
    PENDING:  'pending',   // في انتظار التجذر
    ACTIVE:   'active',    // نشطة
    DORMANT:  'dormant',   // خاملة
    THRIVING: 'thriving',  // مزدهرة
    WITHERED: 'withered',  // ذابلة — تحتاج تجديداً
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── سجل التجذر ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class RootedEntry {
    constructor(id, module, meta = {}) {
        this.id          = id;
        this.module      = module;
        this.nameAr      = meta.nameAr      || id;
        this.domain      = meta.domain      || 'عام';
        this.quranRef    = meta.quranRef    || '';
        this.hadithRef   = meta.hadithRef   || '';
        this.depth       = meta.depth       || ROOT_DEPTH.SPROUTING;
        this.state       = ROOT_STATE.ACTIVE;
        this.rootedAt    = new Date().toISOString();
        this.lastPulse   = this.rootedAt;
        this.pulseCount  = 0;
        this.deepenCount = 0;
        this.signalStrength = 0.5;  // قوة الإشارة الجذرية (0–1)
    }

    deepen() {
        this.deepenCount++;
        if (this.depth < ROOT_DEPTH.ABSOLUTE) {
            this.depth++;
        }
        this.signalStrength = Math.min(1.0, this.signalStrength + 0.1);
        this.state = this.depth >= ROOT_DEPTH.ANCHORED ? ROOT_STATE.THRIVING : ROOT_STATE.ACTIVE;
        return this;
    }

    pulse() {
        this.pulseCount++;
        this.lastPulse = new Date().toISOString();
        if (this.state === ROOT_STATE.DORMANT) {
            this.state = ROOT_STATE.ACTIVE;
        }
        return this;
    }

    wither() {
        this.state = ROOT_STATE.WITHERED;
        this.signalStrength = Math.max(0, this.signalStrength - 0.05);
        return this;
    }

    revive() {
        this.state = ROOT_STATE.ACTIVE;
        this.signalStrength = Math.min(1.0, this.signalStrength + 0.2);
        return this;
    }

    toJSON() {
        return {
            id:             this.id,
            nameAr:         this.nameAr,
            domain:         this.domain,
            depth:          this.depth,
            depthName:      Object.keys(ROOT_DEPTH).find(k => ROOT_DEPTH[k] === this.depth) || 'UNKNOWN',
            state:          this.state,
            signalStrength: +this.signalStrength.toFixed(4),
            rootedAt:       this.rootedAt,
            lastPulse:      this.lastPulse,
            pulseCount:     this.pulseCount,
            deepenCount:    this.deepenCount,
            quranRef:       this.quranRef,
            hadithRef:      this.hadithRef,
            hasModule:      !!this.module,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── محرك التجذر الرئيسي ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class TajathurEngine extends EventEmitter {
    constructor() {
        super();

        this.name    = 'Sheikha Tajathur Engine';
        this.nameAr  = 'محرك التجذر — شيخة';
        this.version = VERSION;
        this.tawheed = TAWHEED;

        // سجل المتجذرات
        this._registry = new Map();  // id → RootedEntry

        // الوحدات الجذرية المسجّلة مسبقاً (الجذور الأساسية)
        this._coreRoots = new Set([
            'root-neural-cell-network',
            'universal-neural-network',
            'master-neural-cell-network',
            'language-neural-cell-network',
            'supreme-cs',
            'arabic-grammar-engine',
            'arabic-grammar-rules',
            'language-layer',
        ]);

        // إحصاءات
        this._totalRooted  = 0;
        this._pulseCount   = 0;
        this._startedAt    = new Date().toISOString();

        // تجذير الجذور الأساسية
        this._initCoreRoots();

        console.log(`[TAJATHUR] 🌱 ${this.nameAr} مُفعَّل`);
        console.log(`[TAJATHUR]    • الجذور الأساسية: ${this._registry.size}`);
        console.log(`[TAJATHUR] ✨ ﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤`);
    }

    // ── التهيئة الأساسية ────────────────────────────────────────────────────
    _initCoreRoots() {
        const coreEntries = [
            { id: 'root-neural-cell-network',  nameAr: 'شبكة الخلايا العصبية الجذرية',   domain: 'جذر',      depth: ROOT_DEPTH.ABSOLUTE, quranRef: 'إبراهيم:٢٤'  },
            { id: 'universal-neural-network',  nameAr: 'الشبكة العصبية الشاملة',          domain: 'شامل',     depth: ROOT_DEPTH.ANCHORED,  quranRef: 'البقرة:٣١'   },
            { id: 'master-neural-cell-network',nameAr: 'شبكة الخلايا العصبية الكبرى',     domain: 'كبرى',     depth: ROOT_DEPTH.ANCHORED,  quranRef: 'النمل:٨٨'    },
            { id: 'language-neural-cell-network',nameAr:'شبكة الخلايا العصبية للغة',      domain: 'لغة',      depth: ROOT_DEPTH.DEEP,      quranRef: 'الرحمن:٤'    },
            { id: 'supreme-cs',                nameAr: 'المحرك العلمي العلوي',             domain: 'علم',      depth: ROOT_DEPTH.ANCHORED,  quranRef: 'العلق:١'     },
            { id: 'arabic-grammar-engine',     nameAr: 'محرك النحو والصرف والبلاغة',      domain: 'نحو',      depth: ROOT_DEPTH.DEEP,      quranRef: 'الرحمن:٤'    },
            { id: 'arabic-grammar-rules',      nameAr: 'منظومة القواعد العربية الرقمية',   domain: 'قواعد',    depth: ROOT_DEPTH.DEEP,      quranRef: 'الرحمن:٤'    },
            { id: 'language-layer',            nameAr: 'طبقة لغة شيخة الحاكمة',           domain: 'لغة',      depth: ROOT_DEPTH.DEEP,      quranRef: 'إبراهيم:٤'   },
            { id: 'sovereign-governor',        nameAr: 'الحاكمة العليا',                   domain: 'حوكمة',    depth: ROOT_DEPTH.ABSOLUTE,  quranRef: 'يوسف:٤٠'    },
        ];

        for (const e of coreEntries) {
            const entry = new RootedEntry(e.id, null, e);
            entry.depth = e.depth;
            entry.state = ROOT_STATE.THRIVING;
            entry.signalStrength = e.depth >= ROOT_DEPTH.ANCHORED ? 0.95 : 0.80;
            this._registry.set(e.id, entry);
        }
        this._totalRooted = this._registry.size;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ── واجهة التجذر ─────────────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * root — تجذير وحدة جديدة في شجرة شيخة
     * @param {string} id — معرّف الوحدة
     * @param {object|null} module — مرجع الوحدة (اختياري)
     * @param {object} meta — { nameAr, domain, quranRef, hadithRef, depth }
     * @returns {RootedEntry}
     */
    root(id, module = null, meta = {}) {
        if (this._registry.has(id)) {
            const existing = this._registry.get(id);
            existing.revive();
            console.log(`[TAJATHUR] 🔄 تجذير مُجدَّد: ${id}`);
            this.emit('re-rooted', existing.toJSON());
            return existing;
        }

        const entry = new RootedEntry(id, module, meta);
        this._registry.set(id, entry);
        this._totalRooted++;

        console.log(`[TAJATHUR] 🌱 تجذير جديد: ${entry.nameAr} (${id}) — عمق: ${entry.depth}`);
        this.emit('rooted', entry.toJSON());
        return entry;
    }

    /**
     * deepen — تعميق جذور وحدة مسجّلة
     * @param {string} id
     * @returns {RootedEntry|null}
     */
    deepen(id) {
        const entry = this._registry.get(id);
        if (!entry) {
            console.warn(`[TAJATHUR] ⚠️  لا تجذر لـ: ${id}`);
            return null;
        }
        entry.deepen();
        console.log(`[TAJATHUR] 🌳 تعميق جذور: ${entry.nameAr} → عمق ${entry.depth}`);
        this.emit('deepened', entry.toJSON());
        return entry;
    }

    /**
     * pulse — نبضة التجذر الدورية لإبقاء كل الجذور حية
     * @returns {object} ملخص النبضة
     */
    pulse() {
        this._pulseCount++;
        let thriving = 0, dormant = 0, withered = 0;

        for (const [id, entry] of this._registry) {
            const msSincePulse = Date.now() - new Date(entry.lastPulse).getTime();
            if (msSincePulse > 5 * 60 * 1000) {  // 5 دقائق
                entry.wither();
                withered++;
            } else {
                entry.pulse();
                if (entry.state === ROOT_STATE.THRIVING) thriving++;
            }
        }

        const summary = {
            pulse:    this._pulseCount,
            total:    this._registry.size,
            thriving, dormant, withered,
            timestamp: new Date().toISOString(),
        };

        this.emit('pulse', summary);
        return summary;
    }

    /**
     * reviveAll — إحياء جميع الجذور الذابلة
     */
    reviveAll() {
        for (const entry of this._registry.values()) {
            if (entry.state === ROOT_STATE.WITHERED) {
                entry.revive();
            }
        }
        console.log('[TAJATHUR] 💚 جميع الجذور أُحييت');
        return this;
    }

    /**
     * isRooted — هل الوحدة متجذرة؟
     * @param {string} id
     * @returns {boolean}
     */
    isRooted(id) {
        return this._registry.has(id);
    }

    /**
     * getRootDepth — عمق تجذر الوحدة
     * @param {string} id
     * @returns {number}
     */
    getRootDepth(id) {
        return this._registry.get(id)?.depth ?? -1;
    }

    /**
     * getStatus — حالة تجذر وحدة بعينها
     * @param {string} id
     * @returns {object|null}
     */
    getStatus(id) {
        return this._registry.get(id)?.toJSON() || null;
    }

    /**
     * listRooted — قائمة جميع المتجذرات
     * @param {string} [filterState] — تصفية حسب الحالة
     * @returns {object[]}
     */
    listRooted(filterState = null) {
        const all = Array.from(this._registry.values()).map(e => e.toJSON());
        if (!filterState) return all;
        return all.filter(e => e.state === filterState);
    }

    /**
     * getRootTree — شجرة التجذر الكاملة
     * @returns {object} شجرة هرمية
     */
    getRootTree() {
        const byDepth = {};
        for (const entry of this._registry.values()) {
            const d = entry.depth;
            if (!byDepth[d]) byDepth[d] = [];
            byDepth[d].push(entry.toJSON());
        }
        return {
            title: 'شجرة التجذر — شيخة',
            quranRef: '﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤',
            byDepth,
            depthNames: ROOT_DEPTH,
        };
    }

    /**
     * getInstance (singleton)
     */
    static getInstance() {
        if (!TajathurEngine._instance) {
            TajathurEngine._instance = new TajathurEngine();
        }
        return TajathurEngine._instance;
    }

    // ── حالة المحرك ─────────────────────────────────────────────────────────

    status() {
        const entries = Array.from(this._registry.values());
        const byState = {};
        const byDepth = {};

        for (const e of entries) {
            byState[e.state] = (byState[e.state] || 0) + 1;
            byDepth[e.depth] = (byDepth[e.depth] || 0) + 1;
        }

        return {
            name:        this.name,
            nameAr:      this.nameAr,
            version:     VERSION,
            tawheed:     TAWHEED,
            startedAt:   this._startedAt,
            totalRooted: this._registry.size,
            pulseCount:  this._pulseCount,
            byState,
            byDepth,
            topRooted:   entries
                .sort((a, b) => b.depth - a.depth || b.signalStrength - a.signalStrength)
                .slice(0, 7)
                .map(e => e.toJSON()),
            quranRef: '﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤',
        };
    }
}

// ── حقل singleton ─────────────────────────────────────────────────────────────
TajathurEngine._instance = null;

// ═══════════════════════════════════════════════════════════════════════════════
// ── الواجهة العامة ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function getInstance() { return TajathurEngine.getInstance(); }
function init()        { return getInstance(); }
function root(id, module, meta) { return getInstance().root(id, module, meta); }
function deepen(id)    { return getInstance().deepen(id); }
function pulse()       { return getInstance().pulse(); }
function reviveAll()   { return getInstance().reviveAll(); }
function isRooted(id)  { return getInstance().isRooted(id); }
function getRootDepth(id) { return getInstance().getRootDepth(id); }
function getStatus(id) { return getInstance().getStatus(id); }
function listRooted(filterState) { return getInstance().listRooted(filterState); }
function getRootTree() { return getInstance().getRootTree(); }
function status()      { return getInstance().status(); }

module.exports = {
    TajathurEngine,
    getInstance,
    init,
    root,
    deepen,
    pulse,
    reviveAll,
    isRooted,
    getRootDepth,
    getStatus,
    listRooted,
    getRootTree,
    status,
    ROOT_DEPTH,
    ROOT_STATE,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
