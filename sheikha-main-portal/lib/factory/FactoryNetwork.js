/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * FactoryNetwork — شبكة المصانع (مصنع يُنتج مصانع)
 * Meta-Factory: يُنظّم جميع المصانع ويتيح إنشاء مصانع جديدة ديناميكياً
 *
 * "وَهُوَ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ بِالْحَقِّ" — الأنعام ٧٣
 * الحق: أساس كل إنتاج في المنظومة
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const MarketFactory       = require('./MarketFactory');
const OrganizationFactory = require('./OrganizationFactory');
const PipelineFactory     = require('./PipelineFactory');

const FACTORY_TYPES = Object.freeze({
    MARKET:       'market',
    ORGANIZATION: 'organization',
    PIPELINE:     'pipeline'
});

class FactoryNetwork {
    /**
     * @param {object} [options]
     * @param {boolean} [options.autoInit] - تهيئة المصانع الافتراضية تلقائياً (افتراضي: true)
     */
    constructor(options = {}) {
        this._factories = new Map();
        this._createdAt = new Date().toISOString();

        // تسجيل المصانع الرئيسية
        this._registerBuiltins();

        if (options.autoInit !== false) {
            this._initDefaults();
        }
    }

    // ── التسجيل الداخلي ───────────────────────────────────────────────────────

    _registerBuiltins() {
        this._factories.set(FACTORY_TYPES.MARKET,       new MarketFactory());
        this._factories.set(FACTORY_TYPES.ORGANIZATION, new OrganizationFactory());
        this._factories.set(FACTORY_TYPES.PIPELINE,     new PipelineFactory());
    }

    /** تهيئة كيانات افتراضية عند البدء */
    _initDefaults() {
        const charter = {
            noRiba: true, noGharar: true, noGhish: true,
            noHarm: true, mutualConsent: true
        };

        // السوق الإلكتروني الافتراضي
        try {
            this.market.create({
                name: 'Sheikha General Market',
                nameAr: 'السوق العام لشيخة',
                type: 'electronic',
                category: 'general',
                charter
            });
        } catch (_) {}

        // المنظمة الأم
        try {
            this.organization.create({
                name: 'Sheikha Root Organization',
                nameAr: 'منظمة شيخة الأم',
                type: 'root',
                charter
            });
        } catch (_) {}

        // خطوط الأنابيب الافتراضية
        ['data', 'sharia', 'market', 'production'].forEach(type => {
            try { this.pipeline.create({ type }); } catch (_) {}
        });
    }

    // ── الوصول للمصانع ────────────────────────────────────────────────────────

    /** @returns {MarketFactory} */
    get market()       { return this._factories.get(FACTORY_TYPES.MARKET); }

    /** @returns {OrganizationFactory} */
    get organization() { return this._factories.get(FACTORY_TYPES.ORGANIZATION); }

    /** @returns {PipelineFactory} */
    get pipeline()     { return this._factories.get(FACTORY_TYPES.PIPELINE); }

    // ── الإنشاء الموحّد ───────────────────────────────────────────────────────

    /**
     * إنشاء أي كيان عبر نوع المصنع
     * @param {string} factoryType - 'market' | 'organization' | 'pipeline'
     * @param {object} config
     */
    create(factoryType, config = {}) {
        const type = String(factoryType).toLowerCase();
        const factory = this._factories.get(type);
        if (!factory) {
            throw new Error(`FactoryNetwork: نوع المصنع غير مدعوم "${factoryType}". المتاح: ${[...this._factories.keys()].join(', ')}`);
        }
        return factory.create(config);
    }

    // ── الإضافة الديناميكية ───────────────────────────────────────────────────

    /**
     * إضافة مصنع مخصص للشبكة
     * @param {string} name
     * @param {object} factory - أي كائن يحتوي على create()
     */
    addFactory(name, factory) {
        if (typeof factory.create !== 'function') {
            throw new TypeError('FactoryNetwork: المصنع يجب أن يمتلك دالة create()');
        }
        this._factories.set(name, factory);
        return this;
    }

    // ── الإحصاءات ─────────────────────────────────────────────────────────────

    getStats() {
        const stats = { createdAt: this._createdAt, factories: {} };
        for (const [name, factory] of this._factories.entries()) {
            stats.factories[name] = typeof factory.getStats === 'function'
                ? factory.getStats()
                : { available: true };
        }
        return stats;
    }

    /** نظرة عامة على كل ما أُنتج */
    overview() {
        return {
            markets:       this.market.list(),
            organizations: this.organization.list(),
            pipelines:     this.pipeline.toJSON().registry.pipelines,
            stats:         this.getStats()
        };
    }

    toJSON() {
        return { network: 'FactoryNetwork', ...this.getStats() };
    }
}

FactoryNetwork.FACTORY_TYPES = FACTORY_TYPES;

// Singleton: شبكة مصانع عالمية واحدة
const globalNetwork = new FactoryNetwork();

module.exports = { FactoryNetwork, globalNetwork };
