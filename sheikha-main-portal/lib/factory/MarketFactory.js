/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * MarketFactory — مصنع الأسواق
 * يُنتج أسواقاً جديدة (physical | electronic | digital | hybrid)
 * بعد التحقق من قبول الميثاق الشرعي
 *
 * "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — البقرة ٢٧٥
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const { v4: uuidv4 } = (function() {
    try { return require('uuid'); } catch (_) {
        return { v4: () => `${Date.now()}-${Math.random().toString(36).slice(2)}` };
    }
})();

// ── أنواع الأسواق المدعومة ─────────────────────────────────────────────────────
const MARKET_TYPES = Object.freeze({
    PHYSICAL:    'physical',
    ELECTRONIC:  'electronic',
    DIGITAL:     'digital',
    HYBRID:      'hybrid'
});

// ── الميثاق الشرعي الإلزامي ───────────────────────────────────────────────────
const SHARIA_CHARTER = Object.freeze({
    noRiba:     true,
    noGharar:   true,
    noGhish:    true,
    noHarm:     true,
    mutualConsent: true
});

class MarketFactory {
    constructor() {
        this._produced = new Map();
        this._counter  = 0;
    }

    // ── التحقق من الميثاق ──────────────────────────────────────────────────────

    /**
     * التحقق من قبول الميثاق قبل إنشاء أي سوق
     * @param {object} charterAcceptance
     * @throws إذا لم يُقبل الميثاق كاملاً
     */
    _enforceCharter(charterAcceptance = {}) {
        for (const [rule, required] of Object.entries(SHARIA_CHARTER)) {
            if (required && !charterAcceptance[rule]) {
                throw new Error(
                    `MarketFactory: رُفض إنشاء السوق — لم يُقبل بند الميثاق الشرعي: "${rule}"`
                );
            }
        }
    }

    // ── الإنتاج ────────────────────────────────────────────────────────────────

    /**
     * إنشاء سوق جديد
     * @param {object} config
     * @param {string}  config.name           - اسم السوق
     * @param {string}  [config.nameAr]       - الاسم العربي
     * @param {string}  [config.type]         - النوع: physical|electronic|digital|hybrid
     * @param {string}  [config.category]     - الفئة: metals|agriculture|tech|services|research
     * @param {object}  config.charter        - الميثاق الشرعي (يجب القبول بكل البنود)
     * @param {object}  [config.location]     - الموقع الجغرافي (للأسواق الحقيقية)
     * @param {string}  [config.description]  - وصف السوق
     * @returns {object} سوق جديد
     */
    create(config = {}) {
        if (!config.name) throw new Error('MarketFactory: يجب تحديد اسم السوق');
        if (!config.charter) throw new Error('MarketFactory: يجب تقديم الميثاق الشرعي');

        this._enforceCharter(config.charter);

        const type = MARKET_TYPES[String(config.type || 'electronic').toUpperCase()]
            || MARKET_TYPES.ELECTRONIC;

        this._counter++;

        const market = {
            id:          uuidv4(),
            marketNo:    this._counter,
            name:        config.name,
            nameAr:      config.nameAr || config.name,
            type,
            category:    config.category || 'general',
            description: config.description || '',
            location:    type === MARKET_TYPES.PHYSICAL ? (config.location || {}) : null,
            charter:     { ...SHARIA_CHARTER, accepted: true, acceptedAt: new Date().toISOString() },
            status:      'active',
            createdAt:   new Date().toISOString(),
            createdBy:   config.createdBy || 'system',
            metrics: {
                totalListings: 0,
                totalTransactions: 0,
                volume: 0
            }
        };

        this._produced.set(market.id, market);
        return market;
    }

    // ── الاستعلام ─────────────────────────────────────────────────────────────

    get(id) { return this._produced.get(id); }

    list() { return [...this._produced.values()]; }

    get count() { return this._produced.size; }

    getStats() {
        return {
            total: this.count,
            byType: Object.values(MARKET_TYPES).reduce((acc, type) => {
                acc[type] = this.list().filter(m => m.type === type).length;
                return acc;
            }, {})
        };
    }

    toJSON() {
        return { factory: 'MarketFactory', stats: this.getStats(), markets: this.list() };
    }
}

MarketFactory.MARKET_TYPES  = MARKET_TYPES;
MarketFactory.SHARIA_CHARTER = SHARIA_CHARTER;

module.exports = MarketFactory;
