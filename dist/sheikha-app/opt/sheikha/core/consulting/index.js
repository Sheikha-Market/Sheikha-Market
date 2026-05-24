/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA CONSULTING ENGINE — محرك الاستشارات الكوني الموحّد                ║
 * ║   محلية · دولية · قارية · كونية — دمج التقنية والذكاء الاصطناعي            ║
 * ║   الأفضل بأمر الله — بلا ضرر ولا ضرار — موحّد لله                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَشَاوِرْهُمْ فِي الْأَمْرِ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ"
 * — آل عمران:١٥٩
 *
 * سلمان أحمد الراجح — مستشار دولي — مالك شيخة
 */

'use strict';

const { ALL_DOMAINS }              = require('./domains');
const { NETWORK_ARCHITECTURE, ORGANIZATIONAL_STRUCTURE,
        CONSULTING_FLOW, PRICING_MODELS }     = require('./network');
const { CORE_DIGITAL_TOOLS, SPECIALIZED_CONSULTING_TOOLS,
        COMMUNICATION_PLATFORMS,
        DIGITAL_CONSULTING_PROTOCOL }         = require('./ai-tools');
const islamicDb                              = require('../islamic-db');
const { ACCELERATED_ROADMAP,
        ETHICAL_DOMINANCE_AXES,
        SUPREMACY_CREED }                     = require('../visions/roadmap');

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const SCHEMA      = 'sheikha/v2';
const TAWHEED     = 'لا إله إلا الله';
const CONSULTANT  = 'سلمان أحمد الراجح — مستشار دولي';
const NO_HARM     = 'لا ضرر ولا ضرار';

// ═══════════════════════════════════════════════════════════════
// نواة محرك الاستشارات
// ═══════════════════════════════════════════════════════════════
class SheikhaConsultingEngine {

    constructor() {
        this.schema     = SCHEMA;
        this.tawheed    = TAWHEED;
        this.nameAr     = 'محرك شيخة للاستشارات الكونية الموحّدة';
        this.nameEn     = 'Sheikha Universal Consulting Engine';
        this.version    = '1.0.0';
        this.consultant = CONSULTANT;
        this.builtAt    = new Date().toISOString();

        // فهرس القطاعات والأدوات
        this._domains = new Map(ALL_DOMAINS.map((d) => [d.id, d]));
        this._tools   = new Map([
            ...CORE_DIGITAL_TOOLS.map((t) => [t.id, t]),
            ...SPECIALIZED_CONSULTING_TOOLS.map((t) => [t.id, t]),
        ]);
    }

    // ═══════════════════════════════════════════════════════════
    // ① لوحة القيادة الكاملة
    // ═══════════════════════════════════════════════════════════

    dashboard() {
        return this._ok({
            nameAr: this.nameAr,
            consultant: this.consultant,
            tawheed: this.tawheed,
            supremacy_creed: SUPREMACY_CREED,
            stats: {
                consulting_domains: ALL_DOMAINS.length,
                core_tools:         CORE_DIGITAL_TOOLS.length,
                specialized_tools:  SPECIALIZED_CONSULTING_TOOLS.length,
                platforms:          COMMUNICATION_PLATFORMS.length,
                network_levels:     5,
                consulting_flow_steps: CONSULTING_FLOW.length,
                ethical_dominance_axes: ETHICAL_DOMINANCE_AXES.length,
                roadmap_phases:     3,
            },
            network: {
                LOCAL:         NETWORK_ARCHITECTURE.LOCAL.scope,
                REGIONAL:      NETWORK_ARCHITECTURE.REGIONAL.scope,
                INTERNATIONAL: NETWORK_ARCHITECTURE.INTERNATIONAL.scope,
                CONTINENTAL:   NETWORK_ARCHITECTURE.CONTINENTAL.scope,
                UNIVERSAL:     NETWORK_ARCHITECTURE.UNIVERSAL.mission,
            },
            protocol: DIGITAL_CONSULTING_PROTOCOL.name,
            no_harm:  NO_HARM,
            verse:    { ref: 'آل عمران:١٥٩', text: 'وَشَاوِرْهُمْ فِي الْأَمْرِ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ' },
        }, { intent: 'consulting.dashboard' });
    }

    // ═══════════════════════════════════════════════════════════
    // ② القطاعات الاستشارية
    // ═══════════════════════════════════════════════════════════

    listDomains({ scope } = {}) {
        let list = ALL_DOMAINS;
        if (scope) list = ALL_DOMAINS.filter((d) => (d.scope || []).includes(scope));
        return this._ok(list.map((d) => ({
            id: d.id, nameAr: d.nameAr, scope: d.scope, maqsad: d.maqsad,
        })), { intent: 'consulting.domains', count: list.length });
    }

    getDomain(id) {
        const d = this._domains.get(id);
        if (!d) return this._err(`القطاع "${id}" غير موجود`);
        return this._ok(d, { intent: 'consulting.domain.get', sharia_ref: islamicDb.buildShariaRef(d.maqsad || 'MAL') });
    }

    searchDomains(keyword = '') {
        const kw = keyword.toLowerCase().trim();
        const results = ALL_DOMAINS.filter((d) => {
            const t = [d.id, d.nameAr || '', d.nameEn || ''].join(' ').toLowerCase();
            return !kw || t.includes(kw);
        });
        return this._ok(results, { intent: 'consulting.domains.search', count: results.length });
    }

    // ═══════════════════════════════════════════════════════════
    // ③ الأدوات الرقمية
    // ═══════════════════════════════════════════════════════════

    listTools({ type } = {}) {
        let list = [...CORE_DIGITAL_TOOLS, ...SPECIALIZED_CONSULTING_TOOLS];
        if (type) list = list.filter((t) => t.type === type || t.category === type);
        return this._ok(list, { intent: 'consulting.tools', count: list.length });
    }

    getTool(id) {
        const t = this._tools.get(id);
        if (!t) return this._err(`الأداة "${id}" غير موجودة`);
        return this._ok(t, { intent: 'consulting.tool.get' });
    }

    listPlatforms() {
        return this._ok(COMMUNICATION_PLATFORMS, {
            intent: 'consulting.platforms',
            count: COMMUNICATION_PLATFORMS.length,
        });
    }

    // ═══════════════════════════════════════════════════════════
    // ④ الشبكة الاستشارية
    // ═══════════════════════════════════════════════════════════

    getNetwork(level) {
        const levels = { local: 'LOCAL', regional: 'REGIONAL', international: 'INTERNATIONAL', continental: 'CONTINENTAL', universal: 'UNIVERSAL' };
        const key = level ? (levels[String(level).toLowerCase()] || String(level).toUpperCase()) : null;
        const data = key ? NETWORK_ARCHITECTURE[key] : NETWORK_ARCHITECTURE;
        if (key && !data) return this._err(`المستوى "${level}" غير موجود`);
        return this._ok(data, { intent: 'consulting.network' });
    }

    getStructure() {
        return this._ok(ORGANIZATIONAL_STRUCTURE, { intent: 'consulting.structure' });
    }

    getPricingModels() {
        return this._ok(PRICING_MODELS, { intent: 'consulting.pricing' });
    }

    // ═══════════════════════════════════════════════════════════
    // ⑤ البروتوكول والتدفق الاستشاري
    // ═══════════════════════════════════════════════════════════

    getProtocol() {
        return this._ok(DIGITAL_CONSULTING_PROTOCOL, {
            intent: 'consulting.protocol',
            sharia_ref: islamicDb.buildShariaRef('DEEN'),
        });
    }

    getFlow() {
        return this._ok(CONSULTING_FLOW, { intent: 'consulting.flow', steps: CONSULTING_FLOW.length });
    }

    // ═══════════════════════════════════════════════════════════
    // ⑥ الاستشارة الفورية المدمجة مع الذكاء الاصطناعي
    // ═══════════════════════════════════════════════════════════

    /**
     * تنفيذ جلسة استشارية كاملة
     * @param {object} request
     * @param {string} request.clientId
     * @param {string} request.clientNameAr
     * @param {string} request.domainId       - معرّف القطاع الاستشاري
     * @param {string} request.challenge       - التحدي أو السؤال
     * @param {string} [request.scope]         - local | regional | international | universal
     * @param {object} [request.entityData]    - بيانات الكيان
     */
    runConsultingSession({ clientId, clientNameAr, domainId, challenge, scope = 'international', entityData = {} }) {
        if (!clientId)  return this._err('يجب توفير معرّف العميل');
        if (!domainId)  return this._err('يجب تحديد قطاع الاستشارة');
        if (!challenge) return this._err('يجب وصف التحدي أو السؤال');

        const domain = this._domains.get(domainId);
        if (!domain) return this._err(`القطاع "${domainId}" غير موجود`);

        // ① التحقق الشرعي
        const shariaCheck = islamicDb.verifyCompliance({
            hasRiba:          entityData.hasRiba || false,
            hasGharar:        entityData.hasGharar || false,
            hasMutualConsent: entityData.hasMutualConsent !== false,
        });

        if (!shariaCheck.compliant) {
            return this._ok({
                status: 'SHARIA_REVIEW_REQUIRED',
                violations: shariaCheck.violations,
                references: shariaCheck.references,
                message: 'تحتاج الاستشارة إلى مراجعة شرعية قبل المتابعة',
            }, {
                intent: 'consulting.sharia_review',
                sharia_ref: islamicDb.buildShariaRef(domain.maqsad || 'DEEN'),
                no_harm: NO_HARM,
            });
        }

        // ② بناء الاستجابة الاستشارية
        const sharia_ref = islamicDb.buildShariaRef(domain.maqsad || 'MAL');
        const networkLevel = NETWORK_ARCHITECTURE[scope.toUpperCase()] || NETWORK_ARCHITECTURE.INTERNATIONAL;

        return this._ok({
            session_id:  `SHK-CONSULT-${Date.now()}`,
            client:      { id: clientId, nameAr: clientNameAr },
            domain:      { id: domainId, nameAr: domain.nameAr, scope: domain.scope },
            challenge,
            scope:       networkLevel.nameAr,
            status:      'ACTIVE',

            sharia_clearance: {
                compliant: true,
                maqsad: sharia_ref.maqsad,
                verse:  sharia_ref.verse,
            },

            recommended_tools: (domain.tools || []).map((toolId) => ({
                id: toolId,
                ...(this._tools.get(toolId) || { nameAr: toolId }),
            })),

            advisory_steps: CONSULTING_FLOW.map((s) => ({
                step: s.step,
                nameAr: s.nameAr,
                sla: s.duration,
            })),

            roadmap_phase: ACCELERATED_ROADMAP.phase2.nameAr,

            consultant: {
                name: CONSULTANT,
                verse: { ref: 'آل عمران:١٥٩', text: 'وَشَاوِرْهُمْ فِي الْأَمْرِ' },
                commitment: 'الأفضل بأمر الله — لا ضرر ولا ضرار',
            },
        }, {
            intent:     'consulting.session',
            sharia_ref,
            no_harm:    NO_HARM,
            consultant: CONSULTANT,
        });
    }

    /**
     * اقتراح القطاع الاستشاري المناسب بالذكاء الاصطناعي
     */
    suggestDomain({ keywords = [], scope }) {
        const kw = keywords.map((k) => k.toLowerCase());
        const scored = ALL_DOMAINS.map((d) => {
            let score = 0;
            const text = [d.nameAr, d.nameEn, ...(d.services || [])].join(' ').toLowerCase();
            for (const k of kw) { if (text.includes(k)) score++; }
            if (scope && (d.scope || []).includes(scope)) score += 2;
            return { ...d, _score: score };
        }).filter((d) => d._score > 0).sort((a, b) => b._score - a._score).slice(0, 5);

        return this._ok(scored.map(({ _score, ...d }) => ({
            id: d.id, nameAr: d.nameAr, scope: d.scope, match_score: _score,
        })), { intent: 'consulting.suggest', count: scored.length });
    }

    // ═══════════════════════════════════════════════════════════
    // ⑦ واجهة الموجّه العصبي — تُعيد البيانات الخام فقط
    // ═══════════════════════════════════════════════════════════

    handle(request) {
        const { intent, data = {} } = request;

        if (intent === 'consulting.dashboard')       return Promise.resolve(this._rawDashboard());
        if (intent === 'consulting.domains')         return Promise.resolve(this._rawDomains(data));
        if (intent === 'consulting.domain.get')      return Promise.resolve(this._domains.get(data.id) || null);
        if (intent === 'consulting.domains.search')  return Promise.resolve(this._rawSearch(data.keyword));
        if (intent === 'consulting.tools')           return Promise.resolve(this._rawTools(data));
        if (intent === 'consulting.tool.get')        return Promise.resolve(this._tools.get(data.id) || null);
        if (intent === 'consulting.platforms')       return Promise.resolve(COMMUNICATION_PLATFORMS);
        if (intent === 'consulting.network')         return Promise.resolve(this._rawNetwork(data.level));
        if (intent === 'consulting.structure')       return Promise.resolve(ORGANIZATIONAL_STRUCTURE);
        if (intent === 'consulting.pricing')         return Promise.resolve(PRICING_MODELS);
        if (intent === 'consulting.protocol')        return Promise.resolve(DIGITAL_CONSULTING_PROTOCOL);
        if (intent === 'consulting.flow')            return Promise.resolve(CONSULTING_FLOW);
        if (intent === 'consulting.session')         return Promise.resolve(this._rawSession(data));
        if (intent === 'consulting.suggest')         return Promise.resolve(this._rawSuggest(data));

        return Promise.resolve(this._rawDashboard());
    }

    // ─── دوال البيانات الخام (بدون تغليف) ───────────────────────────────────

    _rawDashboard() {
        return {
            nameAr: this.nameAr, consultant: this.consultant, tawheed: this.tawheed,
            supremacy_creed: SUPREMACY_CREED,
            stats: {
                consulting_domains: ALL_DOMAINS.length,
                core_tools:         CORE_DIGITAL_TOOLS.length,
                specialized_tools:  SPECIALIZED_CONSULTING_TOOLS.length,
                platforms:          COMMUNICATION_PLATFORMS.length,
                network_levels:     5,
                consulting_flow_steps: CONSULTING_FLOW.length,
                ethical_dominance_axes: ETHICAL_DOMINANCE_AXES.length,
                roadmap_phases:     3,
            },
            network: {
                LOCAL:         NETWORK_ARCHITECTURE.LOCAL.scope,
                REGIONAL:      NETWORK_ARCHITECTURE.REGIONAL.scope,
                INTERNATIONAL: NETWORK_ARCHITECTURE.INTERNATIONAL.scope,
                CONTINENTAL:   NETWORK_ARCHITECTURE.CONTINENTAL.scope,
                UNIVERSAL:     NETWORK_ARCHITECTURE.UNIVERSAL.mission,
            },
            protocol: DIGITAL_CONSULTING_PROTOCOL.name,
            no_harm:  NO_HARM,
            verse:    { ref: 'آل عمران:١٥٩', text: 'وَشَاوِرْهُمْ فِي الْأَمْرِ' },
        };
    }

    _rawDomains({ scope } = {}) {
        let list = ALL_DOMAINS;
        if (scope) list = ALL_DOMAINS.filter((d) => (d.scope || []).includes(scope));
        return list.map((d) => ({ id: d.id, nameAr: d.nameAr, scope: d.scope, maqsad: d.maqsad }));
    }

    _rawSearch(keyword = '') {
        const kw = keyword.toLowerCase().trim();
        return ALL_DOMAINS.filter((d) => {
            const t = [d.id, d.nameAr || '', d.nameEn || ''].join(' ').toLowerCase();
            return !kw || t.includes(kw);
        });
    }

    _rawTools({ type } = {}) {
        let list = [...CORE_DIGITAL_TOOLS, ...SPECIALIZED_CONSULTING_TOOLS];
        if (type) list = list.filter((t) => t.type === type || t.category === type);
        return list;
    }

    _rawNetwork(level) {
        if (!level) return NETWORK_ARCHITECTURE;
        const levels = { local: 'LOCAL', regional: 'REGIONAL', international: 'INTERNATIONAL', continental: 'CONTINENTAL', universal: 'UNIVERSAL' };
        const key = levels[String(level).toLowerCase()] || String(level).toUpperCase();
        return NETWORK_ARCHITECTURE[key] || NETWORK_ARCHITECTURE;
    }

    _rawSession({ clientId, clientNameAr, domainId, challenge, scope = 'international', entityData = {} }) {
        if (!clientId || !domainId || !challenge) return { error: 'بيانات ناقصة' };
        const domain = this._domains.get(domainId);
        if (!domain) return { error: `القطاع "${domainId}" غير موجود` };
        const shariaCheck = islamicDb.verifyCompliance({
            hasRiba: entityData.hasRiba || false,
            hasGharar: entityData.hasGharar || false,
            hasMutualConsent: entityData.hasMutualConsent !== false,
        });
        if (!shariaCheck.compliant) return { status: 'SHARIA_REVIEW_REQUIRED', violations: shariaCheck.violations };
        const networkLevel = NETWORK_ARCHITECTURE[scope.toUpperCase()] || NETWORK_ARCHITECTURE.INTERNATIONAL;
        return {
            session_id: `SHK-CONSULT-${Date.now()}`,
            client: { id: clientId, nameAr: clientNameAr },
            domain: { id: domainId, nameAr: domain.nameAr, scope: domain.scope },
            challenge, scope: networkLevel.nameAr, status: 'ACTIVE',
            sharia_clearance: { compliant: true },
            recommended_tools: (domain.tools || []).slice(0, 4),
            advisory_steps: CONSULTING_FLOW.map((s) => ({ step: s.step, nameAr: s.nameAr })),
            consultant: CONSULTANT, no_harm: NO_HARM,
        };
    }

    _rawSuggest({ keywords = [], scope }) {
        const kw = keywords.map((k) => k.toLowerCase());
        return ALL_DOMAINS.map((d) => {
            let score = 0;
            const text = [d.nameAr, d.nameEn, ...(d.services || [])].join(' ').toLowerCase();
            for (const k of kw) { if (text.includes(k)) score++; }
            if (scope && (d.scope || []).includes(scope)) score += 2;
            return { id: d.id, nameAr: d.nameAr, scope: d.scope, match_score: score };
        }).filter((d) => d.match_score > 0).sort((a, b) => b.match_score - a.match_score).slice(0, 5);
    }

    // ─── مساعدات ─────────────────────────────────────────────────────────────

    _ok(data, meta = {}) {
        return {
            schema:  this.schema,
            tawheed: this.tawheed,
            success: true,
            data:    data || null,
            meta: {
                engine:     'consulting',
                consultant: this.consultant,
                no_harm:    NO_HARM,
                timestamp:  new Date().toISOString(),
                ...meta,
            },
        };
    }

    _err(message) {
        return {
            schema:  this.schema,
            tawheed: this.tawheed,
            success: false,
            data:    null,
            meta: {
                engine:    'consulting',
                code:      'ERROR',
                message,
                no_harm:   NO_HARM,
                timestamp: new Date().toISOString(),
            },
        };
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
const engine = new SheikhaConsultingEngine();

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = {
    engine,
    SheikhaConsultingEngine,
};
