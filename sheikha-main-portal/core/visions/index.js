/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA VISION ADVISORY ENGINE — محرك الرؤى والاستشارات الدولية الموحّد  ║
 * ║   المركز الأول والأفضل — هيمنة أخلاقية — مسار تقني مسارع                   ║
 * ║   رقمنة كل الرؤى والأهداف والمؤشرات بالكتاب والسنة وتوحيدها لله            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ تَأْمُرُونَ بِالْمَعْرُوفِ وَتَنْهَوْنَ عَنِ الْمُنكَرِ"
 * — آل عمران:١١٠
 *
 * "وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ" — الأنفال:٦٠
 *
 * سلمان أحمد الراجح — مستشار دولي — مالك شيخة
 * Salman Ahmad Al-Rajhi — International Consultant — Owner of Sheikha
 */

'use strict';

const { ALL_VISIONS }                                         = require('./national');
const { ALL_ENTITIES, buildEntityVision, SHEIKHA_VISION }     = require('./organizations');
const { ALL_INDICATORS, calcEthicalDominanceScore,
        SHEIKHA_ISLAMIC_INDICATORS, GOVERNMENT_INDICATORS,
        NON_GOVERNMENT_INDICATORS }                           = require('./indicators');
const { ACCELERATED_ROADMAP, ETHICAL_DOMINANCE_AXES,
        SUPREMACY_TARGETS, generateAdvisoryActionPlan,
        enhanceVision, SUPREMACY_CREED }                      = require('./roadmap');
const islamicDb = require('../islamic-db');

// ─── ثوابت المحرك ────────────────────────────────────────────────────────────
const SCHEMA   = 'sheikha/v2';
const TAWHEED  = 'لا إله إلا الله';

// ═══════════════════════════════════════════════════════════════
// نواة المحرك
// ═══════════════════════════════════════════════════════════════
class SheikhaVisionAdvisoryEngine {

    constructor() {
        this.schema     = SCHEMA;
        this.tawheed    = TAWHEED;
        this.nameAr     = 'محرك الرؤى والاستشارات الدولية الموحّد';
        this.nameEn     = 'Sheikha Vision Advisory Engine';
        this.version    = '1.0.0';
        this.consultant = 'سلمان أحمد الراجح — مستشار دولي';
        this.builtAt    = new Date().toISOString();

        // فهارس الرؤى
        this._visions    = new Map();
        this._indicators = new Map();
        this._loadAll();
    }

    // ─── تحميل البيانات ──────────────────────────────────────────────────────

    _loadAll() {
        for (const v of [...ALL_VISIONS, ...ALL_ENTITIES]) {
            this._visions.set(v.id, v);
        }
        for (const ind of ALL_INDICATORS) {
            this._indicators.set(ind.id, ind);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // ① رؤية شيخة الموحّدة
    // ═══════════════════════════════════════════════════════════

    getSheikhaVision() {
        return this._ok(SHEIKHA_VISION, {
            intent: 'vision.sheikha',
            sharia_ref: islamicDb.buildShariaRef('DEEN'),
        });
    }

    // ═══════════════════════════════════════════════════════════
    // ② الرؤى الوطنية والمؤسسية
    // ═══════════════════════════════════════════════════════════

    getVision(id) {
        const v = this._visions.get(id);
        if (!v) return this._err(`الرؤية "${id}" غير موجودة`);
        return this._ok(v, { intent: 'vision.get', entity: id });
    }

    searchVisions(keyword = '') {
        const kw = keyword.toLowerCase().trim();
        const results = Array.from(this._visions.values()).filter((v) => {
            const text = [v.nameAr || '', v.nameEn || '', (v.vision && (v.vision.nameAr || v.vision.textAr)) || ''].join(' ').toLowerCase();
            return !kw || text.includes(kw);
        });
        return this._ok(results, { intent: 'vision.search', count: results.length });
    }

    listAllVisions() {
        const all = Array.from(this._visions.values()).map((v) => ({
            id: v.id,
            nameAr: v.nameAr,
            nameEn: v.nameEn,
            visionTitle: (v.vision && (v.vision.nameAr || v.vision.textAr)) || '',
        }));
        return this._ok(all, { intent: 'vision.list', count: all.length });
    }

    // ═══════════════════════════════════════════════════════════
    // ③ المؤشرات
    // ═══════════════════════════════════════════════════════════

    getIndicator(id) {
        const ind = this._indicators.get(id);
        if (!ind) return this._err(`المؤشر "${id}" غير موجود`);
        return this._ok(ind, { intent: 'indicator.get' });
    }

    listIndicators({ type } = {}) {
        let list = ALL_INDICATORS;
        if (type === 'government')    list = GOVERNMENT_INDICATORS;
        if (type === 'non-government') list = NON_GOVERNMENT_INDICATORS;
        if (type === 'islamic')        list = SHEIKHA_ISLAMIC_INDICATORS;
        return this._ok(list, { intent: 'indicator.list', count: list.length, type: type || 'all' });
    }

    searchIndicators(keyword = '') {
        const kw = keyword.toLowerCase().trim();
        const results = ALL_INDICATORS.filter((ind) => {
            const text = [ind.id, ind.nameAr || '', ind.nameEn || '', ind.domain || ''].join(' ').toLowerCase();
            return !kw || text.includes(kw);
        });
        return this._ok(results, { intent: 'indicator.search', count: results.length });
    }

    // ═══════════════════════════════════════════════════════════
    // ④ الهيمنة الأخلاقية
    // ═══════════════════════════════════════════════════════════

    calcDominance(entityScores = {}) {
        const result = calcEthicalDominanceScore(entityScores);
        return this._ok(result, {
            intent: 'dominance.calc',
            sharia_ref: islamicDb.buildShariaRef('DEEN'),
            no_harm_confirmed: result.no_harm_confirmed,
        });
    }

    listDominanceAxes() {
        return this._ok(ETHICAL_DOMINANCE_AXES, {
            intent: 'dominance.axes',
            count:  ETHICAL_DOMINANCE_AXES.length,
            sharia_ref: islamicDb.buildShariaRef('DEEN'),
        });
    }

    listSupremacyTargets() {
        return this._ok(SUPREMACY_TARGETS, {
            intent: 'supremacy.targets',
            count:  SUPREMACY_TARGETS.length,
        });
    }

    // ═══════════════════════════════════════════════════════════
    // ⑤ المسار التقني المسارع
    // ═══════════════════════════════════════════════════════════

    getRoadmap(phase) {
        const p = phase ? ACCELERATED_ROADMAP[`phase${phase}`] : ACCELERATED_ROADMAP;
        if (phase && !p) return this._err(`المرحلة ${phase} غير موجودة (١-٣)`);
        return this._ok(p, {
            intent:     'roadmap.get',
            consultant: this.consultant,
            sharia_ref: islamicDb.buildShariaRef('ARD'),
        });
    }

    // ═══════════════════════════════════════════════════════════
    // ⑥ الاستشارة الدولية — دور المستشار سلمان الراجح
    // ═══════════════════════════════════════════════════════════

    /**
     * خطة عمل استشارية فورية لأي كيان
     */
    advise({ entityId, entityNameAr, currentScores, targetHorizon }) {
        if (!entityId) return this._err('يجب توفير معرّف الكيان');
        const plan = generateAdvisoryActionPlan({ entityId, entityNameAr, currentScores, targetHorizon });
        return this._ok(plan, {
            intent:     'advisory.plan',
            consultant: this.consultant,
            sharia_ref: islamicDb.buildShariaRef('MAL'),
        });
    }

    /**
     * تطوير رؤية موجودة وتقديم ما هو أفضل منها
     */
    enhanceVision({ entityId, nameAr, currentVision, currentGoals }) {
        if (!entityId) return this._err('يجب توفير معرّف الكيان');
        const enhanced = enhanceVision({ entityId, nameAr, currentVision, currentGoals });
        return this._ok(enhanced, {
            intent:     'advisory.enhance',
            consultant: this.consultant,
        });
    }

    /**
     * توليد رؤية كاملة لأي كيان من الصفر
     */
    generateVision({ id, nameAr, nameEn, sector, description }) {
        if (!id || !nameAr) return this._err('يجب توفير المعرّف والاسم');
        const v = buildEntityVision({ id, nameAr, nameEn, sector, description });
        return this._ok(v, {
            intent:     'advisory.generate',
            consultant: this.consultant,
            sharia_ref: islamicDb.buildShariaRef('ARD'),
        });
    }

    /**
     * مقارنة رؤيتين وتقديم تقرير المستشار
     */
    compareVisions(id1, id2) {
        const v1 = this._visions.get(id1);
        const v2 = this._visions.get(id2);
        if (!v1 || !v2) return this._err(`رؤية غير موجودة: ${!v1 ? id1 : id2}`);

        const goalsCount1 = (v1.goals || []).length;
        const goalsCount2 = (v2.goals || []).length;

        return this._ok({
            entity1: { id: id1, nameAr: v1.nameAr, goals: goalsCount1, horizon: (v1.vision || {}).year },
            entity2: { id: id2, nameAr: v2.nameAr, goals: goalsCount2, horizon: (v2.vision || {}).year },
            advisory: {
                consultant: this.consultant,
                recommendation: `بعد المقارنة: الأفضل بأمر الله يتطلب ربط كل هدف بمقصد شرعي ومؤشر قياس واضح وخط زمني محدد`,
                enhancement: 'يُنصح بدمج نقاط القوة في كلا الرؤيتين وتجاوز نقاط الضعف بالإضافة لأهداف المقاصد الشرعية الستة',
            },
            no_harm_confirmed: true,
        }, { intent: 'advisory.compare', sharia_ref: islamicDb.buildShariaRef('ARD') });
    }

    // ═══════════════════════════════════════════════════════════
    // ⑦ لوحة القيادة الكاملة
    // ═══════════════════════════════════════════════════════════

    dashboard() {
        return this._ok({
            engine:      this.nameAr,
            consultant:  this.consultant,
            tawheed:     this.tawheed,
            supremacy_creed: SUPREMACY_CREED,
            stats: {
                total_visions:     this._visions.size,
                total_indicators:  this._indicators.size,
                government_inds:   GOVERNMENT_INDICATORS.length,
                non_gov_inds:      NON_GOVERNMENT_INDICATORS.length,
                islamic_inds:      SHEIKHA_ISLAMIC_INDICATORS.length,
                dominance_axes:    ETHICAL_DOMINANCE_AXES.length,
                supremacy_targets: SUPREMACY_TARGETS.length,
                roadmap_phases:    3,
            },
            accelerated_roadmap: {
                phase1: { nameAr: ACCELERATED_ROADMAP.phase1.nameAr, duration: ACCELERATED_ROADMAP.phase1.duration },
                phase2: { nameAr: ACCELERATED_ROADMAP.phase2.nameAr, duration: ACCELERATED_ROADMAP.phase2.duration },
                phase3: { nameAr: ACCELERATED_ROADMAP.phase3.nameAr, duration: ACCELERATED_ROADMAP.phase3.duration },
            },
            top_verse:   SUPREMACY_CREED.verse,
            no_harm:     SUPREMACY_CREED.principle,
        }, {
            intent: 'vision.dashboard',
            sharia_ref: islamicDb.buildShariaRef('DEEN'),
        });
    }

    // ═══════════════════════════════════════════════════════════
    // ⑧ واجهة الموجّه العصبي — تُعيد البيانات الخام فقط
    // ═══════════════════════════════════════════════════════════

    handle(request) {
        const { intent, data = {} } = request;
        const rawDash = () => ({
            engine: this.nameAr, consultant: this.consultant, tawheed: this.tawheed,
            supremacy_creed: SUPREMACY_CREED,
            stats: {
                total_visions:     this._visions.size,
                total_indicators:  this._indicators.size,
                government_inds:   GOVERNMENT_INDICATORS.length,
                non_gov_inds:      NON_GOVERNMENT_INDICATORS.length,
                islamic_inds:      SHEIKHA_ISLAMIC_INDICATORS.length,
                dominance_axes:    ETHICAL_DOMINANCE_AXES.length,
                supremacy_targets: SUPREMACY_TARGETS.length,
                roadmap_phases:    3,
            },
            accelerated_roadmap: {
                phase1: { nameAr: ACCELERATED_ROADMAP.phase1.nameAr, duration: ACCELERATED_ROADMAP.phase1.duration },
                phase2: { nameAr: ACCELERATED_ROADMAP.phase2.nameAr, duration: ACCELERATED_ROADMAP.phase2.duration },
                phase3: { nameAr: ACCELERATED_ROADMAP.phase3.nameAr, duration: ACCELERATED_ROADMAP.phase3.duration },
            },
            top_verse: SUPREMACY_CREED.verse,
            no_harm:   SUPREMACY_CREED.principle,
        });

        if (intent === 'vision.sheikha')       return Promise.resolve(SHEIKHA_VISION);
        if (intent === 'vision.get')           return Promise.resolve(this._visions.get(data.id) || null);
        if (intent === 'vision.search')        return Promise.resolve(this._rawSearch(data.keyword));
        if (intent === 'vision.list')          return Promise.resolve(this._rawList());
        if (intent === 'vision.compare')       return Promise.resolve(this._rawCompare(data.id1, data.id2));
        if (intent === 'indicator.get')        return Promise.resolve(this._indicators.get(data.id) || null);
        if (intent === 'indicator.list')       return Promise.resolve(this._rawIndicators(data.type));
        if (intent === 'indicator.search')     return Promise.resolve(this._rawSearchIndicators(data.keyword));
        if (intent === 'dominance.calc')       return Promise.resolve(calcEthicalDominanceScore(data.scores || {}));
        if (intent === 'dominance.axes')       return Promise.resolve(ETHICAL_DOMINANCE_AXES);
        if (intent === 'supremacy.targets')    return Promise.resolve(SUPREMACY_TARGETS);
        if (intent === 'roadmap.get')          return Promise.resolve(data.phase ? ACCELERATED_ROADMAP[`phase${data.phase}`] : ACCELERATED_ROADMAP);
        if (intent === 'advisory.plan')        return Promise.resolve(generateAdvisoryActionPlan(data));
        if (intent === 'advisory.enhance')     return Promise.resolve(enhanceVision(data));
        if (intent === 'advisory.generate')    return Promise.resolve(buildEntityVision(data));
        if (intent === 'advisory.compare')     return Promise.resolve(this._rawCompare(data.id1, data.id2));
        if (intent === 'vision.dashboard')     return Promise.resolve(rawDash());

        return Promise.resolve(rawDash());
    }

    _rawSearch(keyword = '') {
        const kw = keyword.toLowerCase().trim();
        return Array.from(this._visions.values()).filter((v) => {
            const text = [v.nameAr || '', v.nameEn || '', (v.vision && (v.vision.nameAr || v.vision.textAr)) || ''].join(' ').toLowerCase();
            return !kw || text.includes(kw);
        });
    }

    _rawList() {
        return Array.from(this._visions.values()).map((v) => ({
            id: v.id, nameAr: v.nameAr, nameEn: v.nameEn,
            visionTitle: (v.vision && (v.vision.nameAr || v.vision.textAr)) || '',
        }));
    }

    _rawIndicators(type) {
        if (type === 'government')     return GOVERNMENT_INDICATORS;
        if (type === 'non-government') return NON_GOVERNMENT_INDICATORS;
        if (type === 'islamic')        return SHEIKHA_ISLAMIC_INDICATORS;
        return ALL_INDICATORS;
    }

    _rawSearchIndicators(keyword = '') {
        const kw = keyword.toLowerCase().trim();
        return ALL_INDICATORS.filter((ind) => {
            const text = [ind.id, ind.nameAr || '', ind.nameEn || '', ind.domain || ''].join(' ').toLowerCase();
            return !kw || text.includes(kw);
        });
    }

    _rawCompare(id1, id2) {
        const v1 = this._visions.get(id1);
        const v2 = this._visions.get(id2);
        if (!v1 || !v2) return { error: `رؤية غير موجودة: ${!v1 ? id1 : id2}` };
        return {
            entity1: { id: id1, nameAr: v1.nameAr, goals: (v1.goals || []).length, horizon: (v1.vision || {}).year },
            entity2: { id: id2, nameAr: v2.nameAr, goals: (v2.goals || []).length, horizon: (v2.vision || {}).year },
            advisory: {
                consultant: this.consultant,
                recommendation: 'الأفضل بأمر الله يتطلب ربط كل هدف بمقصد شرعي ومؤشر قياس واضح وخط زمني محدد',
            },
            no_harm_confirmed: true,
        };
    }

    // ─── مساعدات الاستجابة ───────────────────────────────────────────────────

    _ok(data, meta = {}) {
        return {
            schema:   this.schema,
            tawheed:  this.tawheed,
            success:  true,
            data:     data || null,
            meta: {
                engine:    'vision-advisory',
                consultant: this.consultant,
                timestamp:  new Date().toISOString(),
                no_harm:    SUPREMACY_CREED.principle,
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
                engine:    'vision-advisory',
                code:      'NOT_FOUND',
                message,
                no_harm:   SUPREMACY_CREED.principle,
                timestamp: new Date().toISOString(),
            },
        };
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
const engine = new SheikhaVisionAdvisoryEngine();

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = {
    engine,
    SheikhaVisionAdvisoryEngine,
    // re-export sub-modules for direct access
    ACCELERATED_ROADMAP,
    ETHICAL_DOMINANCE_AXES,
    SUPREMACY_CREED,
};
