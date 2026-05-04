/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * OrganizationFactory — مصنع المنظمات
 * يُنتج منظمات جديدة تحت مظلة منظومة شيخة
 *
 * "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ" — النحل ٩٠
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const { v4: uuidv4 } = (function() {
    try { return require('uuid'); } catch (_) {
        return { v4: () => `${Date.now()}-${Math.random().toString(36).slice(2)}` };
    }
})();

const ORG_TYPES = Object.freeze({
    ROOT:       'root',       // منظمة الأم
    MARKET:     'market',     // منظمة أسواق
    SCIENCE:    'science',    // منظمة علوم
    TECH:       'tech',       // منظمة تقنيات
    PRODUCTION: 'production', // منظمة إنتاج
    LOGISTICS:  'logistics',  // منظمة لوجستيك
    CUSTOM:     'custom'      // مخصص
});

const SHARIA_CHARTER = Object.freeze({
    noRiba: true,
    noGharar: true,
    noGhish: true,
    noHarm: true,
    mutualConsent: true
});

class OrganizationFactory {
    constructor() {
        this._produced = new Map();
        this._counter  = 0;
    }

    _enforceCharter(charterAcceptance = {}) {
        for (const [rule, required] of Object.entries(SHARIA_CHARTER)) {
            if (required && !charterAcceptance[rule]) {
                throw new Error(
                    `OrganizationFactory: رُفض إنشاء المنظمة — لم يُقبل بند الميثاق: "${rule}"`
                );
            }
        }
    }

    /**
     * إنشاء منظمة جديدة
     * @param {object} config
     * @param {string}  config.name       - اسم المنظمة
     * @param {string}  [config.nameAr]   - الاسم العربي
     * @param {string}  [config.type]     - النوع
     * @param {string}  [config.parentId] - معرّف المنظمة الأم
     * @param {object}  config.charter    - الميثاق الشرعي
     * @returns {object} منظمة جديدة
     */
    create(config = {}) {
        if (!config.name) throw new Error('OrganizationFactory: يجب تحديد اسم المنظمة');
        if (!config.charter) throw new Error('OrganizationFactory: يجب تقديم الميثاق الشرعي');

        this._enforceCharter(config.charter);

        const type = ORG_TYPES[String(config.type || 'custom').toUpperCase()]
            || ORG_TYPES.CUSTOM;

        this._counter++;

        const org = {
            id:          uuidv4(),
            orgNo:       this._counter,
            name:        config.name,
            nameAr:      config.nameAr || config.name,
            type,
            parentId:    config.parentId || null,
            description: config.description || '',
            charter: {
                ...SHARIA_CHARTER,
                accepted:   true,
                acceptedAt: new Date().toISOString()
            },
            members:   config.members  || [],
            markets:   config.markets  || [],
            children:  [],
            status:    'active',
            createdAt: new Date().toISOString(),
            createdBy: config.createdBy || 'system'
        };

        this._produced.set(org.id, org);

        // ربط بالأم إذا وُجدت
        if (org.parentId && this._produced.has(org.parentId)) {
            this._produced.get(org.parentId).children.push(org.id);
        }

        return org;
    }

    // ── الشجرة الهرمية ────────────────────────────────────────────────────────

    /** بناء الشجرة الهرمية للمنظمات */
    tree() {
        const roots = this.list().filter(o => !o.parentId);
        const buildNode = (org) => ({
            ...org,
            children: org.children
                .map(cid => this._produced.get(cid))
                .filter(Boolean)
                .map(buildNode)
        });
        return roots.map(buildNode);
    }

    // ── الاستعلام ─────────────────────────────────────────────────────────────

    get(id)   { return this._produced.get(id); }
    list()    { return [...this._produced.values()]; }
    get count() { return this._produced.size; }

    getStats() {
        return {
            total: this.count,
            byType: Object.values(ORG_TYPES).reduce((acc, type) => {
                acc[type] = this.list().filter(o => o.type === type).length;
                return acc;
            }, {})
        };
    }

    toJSON() {
        return { factory: 'OrganizationFactory', stats: this.getStats(), tree: this.tree() };
    }
}

OrganizationFactory.ORG_TYPES      = ORG_TYPES;
OrganizationFactory.SHARIA_CHARTER = SHARIA_CHARTER;

module.exports = OrganizationFactory;
