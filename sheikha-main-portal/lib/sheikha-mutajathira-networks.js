/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA MUTAJATHIRA NETWORKS — شبكات المتجذرة                               ║
 * ║  سجل وإدارة كل الشبكات العصبية المتجذرة في منظومة شيخة                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 * ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ
 *  أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ * تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا
 *  وَيَضْرِبُ اللَّهُ الْأَمْثَالَ لِلنَّاسِ لَعَلَّهُمْ يَتَذَكَّرُونَ﴾ — إبراهيم: ٢٤-٢٥
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 *
 * شبكات المتجذرة:
 *  مجموعة الشبكات العصبية التي تجذّرت بالكامل في شجرة شيخة الرقمية.
 *  كل شبكة متجذرة = فرع حي يؤتي أكله بإذن الله.
 *
 * المهام الرئيسية:
 *  • registerNetwork(id, instance, meta)   — تسجيل شبكة متجذرة
 *  • activateAll()                         — تفعيل كل الشبكات
 *  • broadcastInfer(text)                  — بث استدلال لكل الشبكات
 *  • getNetwork(id)                        — الحصول على شبكة بالمعرّف
 *  • listNetworks()                        — قائمة كل الشبكات
 *  • getHealthReport()                     — تقرير صحة الشبكات
 *
 * @module sheikha-mutajathira-networks
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const EventEmitter = require('events');

// ── ثوابت المتجذرة ────────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// أنواع الشبكات المتجذرة
const NETWORK_TYPE = Object.freeze({
    ROOT:        'root',         // شبكة جذرية
    MASTER:      'master',       // شبكة كبرى
    UNIVERSAL:   'universal',    // شبكة شاملة
    DOMAIN:      'domain',       // شبكة مجالية
    SPECIALIZED: 'specialized',  // شبكة متخصصة
    DIGITAL:     'digital',      // شبكة رقمية
    INTEGRATION: 'integration',  // شبكة تكاملية
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── إدخال شبكة متجذرة ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class MutajathiraEntry {
    constructor(id, instance, meta = {}) {
        this.id          = id;
        this.instance    = instance;
        this.nameAr      = meta.nameAr     || id;
        this.type        = meta.type       || NETWORK_TYPE.DOMAIN;
        this.domain      = meta.domain     || 'عام';
        this.quranRef    = meta.quranRef   || '';
        this.cells       = meta.cells      || 0;
        this.layers      = meta.layers     || 0;
        this.dim         = meta.dim        || 0;
        this.active      = true;
        this.registeredAt = new Date().toISOString();
        this.inferCount  = 0;
        this.lastInferAt = null;
        this.health      = 1.0;  // 0–1
    }

    /**
     * استدلال من هذه الشبكة
     */
    async infer(text) {
        if (!this.instance) return null;
        this.inferCount++;
        this.lastInferAt = new Date().toISOString();
        try {
            const fn = this.instance.infer || this.instance.process || null;
            if (typeof fn === 'function') {
                const result = await Promise.resolve(fn.call(this.instance, text));
                this.health = Math.min(1.0, this.health + 0.01);
                return result;
            }
        } catch (err) {
            this.health = Math.max(0, this.health - 0.05);
        }
        return null;
    }

    toJSON() {
        return {
            id:           this.id,
            nameAr:       this.nameAr,
            type:         this.type,
            domain:       this.domain,
            cells:        this.cells,
            layers:       this.layers,
            dim:          this.dim,
            active:       this.active,
            health:       +this.health.toFixed(3),
            inferCount:   this.inferCount,
            lastInferAt:  this.lastInferAt,
            registeredAt: this.registeredAt,
            quranRef:     this.quranRef,
            hasInstance:  !!this.instance,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── سجل شبكات المتجذرة ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class MutajathiraNetworks extends EventEmitter {
    constructor() {
        super();

        this.name    = 'Sheikha Mutajathira Networks';
        this.nameAr  = 'شبكات المتجذرة — شيخة';
        this.version = VERSION;
        this.tawheed = TAWHEED;

        // السجل الرئيسي
        this._networks   = new Map();   // id → MutajathiraEntry
        this._byType     = new Map();   // type → Set<id>
        this._byDomain   = new Map();   // domain → Set<id>

        // إحصاءات
        this._totalInferences = 0;
        this._startedAt       = new Date().toISOString();

        // تحميل الشبكات المتجذرة الأساسية
        this._loadCoreNetworks();

        console.log(`[MUTAJATHIRA] 🌳 ${this.nameAr} مُفعَّلة`);
        console.log(`[MUTAJATHIRA]    • الشبكات المتجذرة: ${this._networks.size}`);
        console.log(`[MUTAJATHIRA] ✨ ﴿تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا﴾ — إبراهيم: ٢٥`);
    }

    // ── تحميل الشبكات الأساسية ──────────────────────────────────────────────
    _loadCoreNetworks() {
        const coreSpecs = [
            {
                id: 'root-neural-cell-network',
                module: './sheikha-root-neural-cell-network',
                meta: {
                    nameAr: 'شبكة الخلايا العصبية الجذرية',
                    type: NETWORK_TYPE.ROOT, domain: 'جذر',
                    cells: 92, layers: 7, dim: 128,
                    quranRef: 'إبراهيم:٢٤',
                },
            },
            {
                id: 'master-neural-cell-network',
                module: './sheikha-master-neural-cell-network',
                meta: {
                    nameAr: 'شبكة الخلايا العصبية الكبرى',
                    type: NETWORK_TYPE.MASTER, domain: 'كبرى',
                    cells: 100, layers: 6, dim: 64,
                    quranRef: 'النمل:٨٨',
                },
            },
            {
                id: 'universal-neural-network',
                module: './sheikha-universal-neural-network',
                meta: {
                    nameAr: 'الشبكة العصبية الشاملة',
                    type: NETWORK_TYPE.UNIVERSAL, domain: 'شامل',
                    cells: 100, layers: 16, dim: 64,
                    quranRef: 'البقرة:٣١',
                },
            },
            {
                id: 'language-neural-cell-network',
                module: './sheikha-language-neural-cell-network',
                meta: {
                    nameAr: 'شبكة الخلايا العصبية للغة',
                    type: NETWORK_TYPE.DOMAIN, domain: 'لغة',
                    cells: 63, layers: 5, dim: 64,
                    quranRef: 'الرحمن:٤',
                },
            },
            {
                id: 'execution-neural-cell-network',
                module: './sheikha-execution-neural-cell-network',
                meta: {
                    nameAr: 'شبكة الخلايا العصبية للتنفيذ',
                    type: NETWORK_TYPE.SPECIALIZED, domain: 'تنفيذ',
                    cells: 5, layers: 4, dim: 8,
                    quranRef: 'التوبة:١٠٥',
                },
            },
            {
                id: 'digital-neural-cell-layer',
                module: './sheikha-digital-neural-cell-layer',
                meta: {
                    nameAr: 'طبقة الخلايا العصبية الرقمية',
                    type: NETWORK_TYPE.DIGITAL, domain: 'رقمي',
                    cells: 56, layers: 5, dim: 96,
                    quranRef: 'العلق:١',
                },
            },
        ];

        for (const spec of coreSpecs) {
            try {
                const mod = require(spec.module);
                const instance = mod.getInstance ? mod.getInstance() : (mod.init ? mod.init() : mod);
                this.registerNetwork(spec.id, instance, spec.meta);
            } catch (_) {
                // تسجيل بدون نسخة
                this.registerNetwork(spec.id, null, spec.meta);
            }
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ── واجهة المتجذرة ────────────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * registerNetwork — تسجيل شبكة متجذرة
     */
    registerNetwork(id, instance, meta = {}) {
        const entry = new MutajathiraEntry(id, instance, meta);
        this._networks.set(id, entry);

        // فهرسة بالنوع
        if (!this._byType.has(entry.type)) this._byType.set(entry.type, new Set());
        this._byType.get(entry.type).add(id);

        // فهرسة بالمجال
        if (!this._byDomain.has(entry.domain)) this._byDomain.set(entry.domain, new Set());
        this._byDomain.get(entry.domain).add(id);

        this.emit('network-registered', entry.toJSON());
        return entry;
    }

    /**
     * getNetwork — الحصول على شبكة بالمعرّف
     */
    getNetwork(id) {
        return this._networks.get(id) || null;
    }

    /**
     * listNetworks — قائمة كل الشبكات المتجذرة
     */
    listNetworks(filterType = null, filterDomain = null) {
        let entries = Array.from(this._networks.values());
        if (filterType)   entries = entries.filter(e => e.type   === filterType);
        if (filterDomain) entries = entries.filter(e => e.domain === filterDomain);
        return entries.map(e => e.toJSON());
    }

    /**
     * broadcastInfer — بث استدلال لكل الشبكات النشطة وتجميع النتائج
     * @param {string} text — النص المدخل
     * @returns {Promise<object>} نتائج بث الاستدلال
     */
    async broadcastInfer(text = '') {
        this._totalInferences++;
        const results  = [];
        const errors   = [];
        const startMs  = Date.now();

        for (const [id, entry] of this._networks) {
            if (!entry.active || !entry.instance) continue;
            try {
                const result = await entry.infer(text);
                if (result) {
                    results.push({
                        id,
                        nameAr:     entry.nameAr,
                        type:       entry.type,
                        domain:     entry.domain,
                        confidence: result.rootConfidence || result.confidence || 0.5,
                        activeDomain: result.activeDomain || result.domain || 'عام',
                        result,
                    });
                }
            } catch (err) {
                errors.push({ id, error: err.message });
            }
        }

        // خلاصة جماعية
        const avgConf = results.length > 0
            ? results.reduce((s, r) => s + r.confidence, 0) / results.length
            : 0;

        const domainVotes = {};
        for (const r of results) {
            domainVotes[r.activeDomain] = (domainVotes[r.activeDomain] || 0) + r.confidence;
        }
        const topDomain = Object.entries(domainVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'عام';

        return {
            id:           `broadcast-${Date.now()}-${this._totalInferences}`,
            timestamp:    new Date().toISOString(),
            text,
            tawheed:      TAWHEED,
            results,
            errors,
            summary: {
                networksQueried:  results.length,
                avgConfidence:    +avgConf.toFixed(4),
                consensusDomain:  topDomain,
                elapsed:          `${Date.now() - startMs}ms`,
            },
            quranRef: '﴿تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا﴾ — إبراهيم: ٢٥',
        };
    }

    /**
     * activateAll — تفعيل كل الشبكات
     */
    activateAll() {
        for (const entry of this._networks.values()) {
            entry.active = true;
        }
        console.log('[MUTAJATHIRA] ✅ جميع الشبكات المتجذرة مُفعَّلة');
        this.emit('all-activated', { count: this._networks.size });
        return this;
    }

    /**
     * getHealthReport — تقرير صحة جميع الشبكات
     */
    getHealthReport() {
        const all    = Array.from(this._networks.values());
        const healthy    = all.filter(e => e.health >= 0.8);
        const degraded   = all.filter(e => e.health >= 0.5 && e.health < 0.8);
        const critical   = all.filter(e => e.health < 0.5);
        const avgHealth  = all.length > 0
            ? all.reduce((s, e) => s + e.health, 0) / all.length : 0;

        return {
            timestamp:  new Date().toISOString(),
            total:      all.length,
            healthy:    healthy.length,
            degraded:   degraded.length,
            critical:   critical.length,
            avgHealth:  +avgHealth.toFixed(3),
            details:    all.map(e => ({ id: e.id, nameAr: e.nameAr, health: +e.health.toFixed(3), active: e.active })),
            byType: Object.fromEntries(
                [...this._byType.entries()].map(([t, ids]) => [t, ids.size])
            ),
        };
    }

    /**
     * getInstance (singleton)
     */
    static getInstance() {
        if (!MutajathiraNetworks._instance) {
            MutajathiraNetworks._instance = new MutajathiraNetworks();
        }
        return MutajathiraNetworks._instance;
    }

    // ── حالة المتجذرة ────────────────────────────────────────────────────────
    status() {
        return {
            name:             this.name,
            nameAr:           this.nameAr,
            version:          VERSION,
            tawheed:          TAWHEED,
            startedAt:        this._startedAt,
            totalNetworks:    this._networks.size,
            totalInferences:  this._totalInferences,
            byType:           Object.fromEntries([...this._byType.entries()].map(([t,s]) => [t, s.size])),
            byDomain:         Object.fromEntries([...this._byDomain.entries()].map(([d,s]) => [d, s.size])),
            networks:         this.listNetworks(),
            health:           this.getHealthReport(),
            quranRef:         '﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤',
        };
    }
}

// ── حقل singleton ─────────────────────────────────────────────────────────────
MutajathiraNetworks._instance = null;

// ═══════════════════════════════════════════════════════════════════════════════
// ── الواجهة العامة ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function getInstance()                           { return MutajathiraNetworks.getInstance(); }
function init()                                  { return getInstance(); }
function registerNetwork(id, instance, meta)     { return getInstance().registerNetwork(id, instance, meta); }
function getNetwork(id)                          { return getInstance().getNetwork(id); }
function listNetworks(type, domain)              { return getInstance().listNetworks(type, domain); }
async function broadcastInfer(text)              { return getInstance().broadcastInfer(text); }
function activateAll()                           { return getInstance().activateAll(); }
function getHealthReport()                       { return getInstance().getHealthReport(); }
function status()                                { return getInstance().status(); }

module.exports = {
    MutajathiraNetworks,
    getInstance,
    init,
    registerNetwork,
    getNetwork,
    listNetworks,
    broadcastInfer,
    activateAll,
    getHealthReport,
    status,
    NETWORK_TYPE,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
