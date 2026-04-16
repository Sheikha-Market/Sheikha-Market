/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║       SHEIKHA STANDARDS ENGINE — محرك المعايير والجودة والمقاييس الموحّد   ║
 * ║   الأفضل بأمر الله في الكون — رقمنة كل المعايير بالكتاب والسنة             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ"
 *  — النحل:٩٠
 *
 * "وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ" — الرحمن:٩
 *
 * "من غشّنا فليس منا" — صحيح مسلم
 *
 * الغاية: منظومة معايير موحّدة تجمع:
 *  ① معايير الجودة الدولية (ISO, ASTM, DIN, BS, ANSI...)
 *  ② المعايير الهندسية والتقنية والعلمية
 *  ③ المعايير المالية الإسلامية (AAOIFI, IFSB)
 *  ④ المعايير السعودية والخليجية (SASO, GSO, ZATCA)
 *  ⑤ القوانين المحلية والدولية والمعاهدات
 *  ⑥ كل ذلك مُوحَّد لله ومُرقَّم بالكتاب والسنة
 */

'use strict';

const { ALL_STANDARDS }   = require('./quality');
const { ALL_LEGAL, INTERNATIONAL_BODIES } = require('./legal');
const islamicDb = require('../islamic-db');

// ─── ثوابت المحرك ────────────────────────────────────────────────────────────

const SCHEMA    = 'sheikha/v2';
const TAWHEED   = 'لا إله إلا الله';

// ─── فئات المعايير المعترف بها ────────────────────────────────────────────────

const STANDARD_CATEGORIES = Object.freeze({
    QUALITY:      'quality',        // إدارة الجودة
    ENVIRONMENT:  'environment',    // البيئة والاستدامة
    SAFETY:       'safety',         // الصحة والسلامة
    SECURITY:     'security',       // أمن المعلومات
    ENGINEERING:  'engineering',    // الهندسة والتقنية
    FINANCE:      'finance',        // المالية الإسلامية
    LEGAL:        'legal',          // القوانين والأنظمة
    TREATY:       'treaty',         // المعاهدات والاتفاقيات
    SCIENTIFIC:   'scientific',     // المنهجية العلمية
    SUSTAINABILITY:'sustainability', // الاستدامة
    SAUDI:        'saudi',          // المعايير السعودية
    GCC:          'gcc',            // المعايير الخليجية
    HALAL:        'halal',          // معايير الحلال
});

// ─── نواة المحرك ─────────────────────────────────────────────────────────────

class SheikhaStandardsEngine {

    constructor() {
        this.schema    = SCHEMA;
        this.tawheed   = TAWHEED;
        this.nameAr    = 'محرك المعايير والجودة والمقاييس الموحّد';
        this.nameEn    = 'Sheikha Unified Standards & Quality Engine';
        this.version   = '1.0.0';
        this.builtAt   = new Date().toISOString();

        // مجمع كل المعايير
        this._standards = new Map();
        this._loadAll();
    }

    // ─── تحميل كل المعايير ───────────────────────────────────────────────────

    _loadAll() {
        for (const std of ALL_STANDARDS) {
            this._standards.set(std.id, { ...std, _type: 'standard' });
        }
        for (const law of ALL_LEGAL) {
            this._standards.set(law.id, { ...law, _type: 'legal' });
        }
    }

    // ─── البحث والاستعلام ────────────────────────────────────────────────────

    /**
     * البحث عن معيار بمعرّفه
     * @param {string} id  e.g. 'ISO-9001' | 'SA-LABOR'
     * @returns {object|null}
     */
    getById(id) {
        return this._standards.get(id) || null;
    }

    /**
     * البحث في المعايير بكلمة مفتاحية (معرّف، اسم عربي، اسم إنجليزي)
     * @param {string} keyword
     * @returns {object[]}
     */
    search(keyword) {
        const kw = keyword.toLowerCase().trim();
        const results = [];
        for (const std of this._standards.values()) {
            const searchable = [
                std.id || '',
                std.nameAr || '',
                std.nameEn || '',
                std.domain || '',
                std.body || '',
            ].join(' ').toLowerCase();
            if (searchable.includes(kw)) {
                results.push(std);
            }
        }
        return results;
    }

    /**
     * تصفية المعايير بالمقصد الشرعي
     * @param {string} maqsadId  DEEN | NAFS | AQL | NASL | MAL | ARD
     * @returns {object[]}
     */
    getByMaqsad(maqsadId) {
        return Array.from(this._standards.values()).filter((s) => s.maqsad === maqsadId);
    }

    /**
     * تصفية المعايير بالمنطقة الجغرافية
     * @param {string} region  SA | GCC | EU | US | ...
     * @returns {object[]}
     */
    getByRegion(region) {
        return Array.from(this._standards.values()).filter((s) => s.region === region);
    }

    /**
     * تصفية القوانين والاتفاقيات
     * @returns {object[]}
     */
    getLegalFrameworks() {
        return Array.from(this._standards.values()).filter((s) => s._type === 'legal');
    }

    /**
     * تصفية معايير الجودة الفنية
     * @returns {object[]}
     */
    getQualityStandards() {
        return Array.from(this._standards.values()).filter((s) => s._type === 'standard');
    }

    // ─── التحقق من الامتثال ──────────────────────────────────────────────────

    /**
     * التحقق من امتثال عملية أو منتج لمعيار معيّن
     * @param {object} params
     * @param {string} params.standardId     - معرّف المعيار (e.g. 'ISO-9001')
     * @param {object} params.entityData     - بيانات الكيان
     * @param {boolean} [params.verifySharia] - تحقق شرعي إضافي
     * @returns {object}  نتيجة التحقق بمعيار sheikha/v2
     */
    checkCompliance({ standardId, entityData = {}, verifySharia = true }) {
        const std = this.getById(standardId);
        if (!std) {
            return this._response(false, null, {
                code: 'STANDARD_NOT_FOUND',
                message: `المعيار "${standardId}" غير موجود في قاعدة البيانات`,
                no_harm_reason: 'لا ضرر ولا ضرار',
            });
        }

        const issues = [];

        // تحقق شرعي إضافي إذا طُلب
        if (verifySharia && std.maqsad) {
            const complianceCheck = islamicDb.verifyCompliance({
                hasRiba: entityData.hasRiba || false,
                hasGharar: entityData.hasGharar || false,
                hasMutualConsent: entityData.hasMutualConsent !== false,
            });
            if (!complianceCheck.compliant) {
                issues.push(...complianceCheck.violations.map((v) => `مخالفة شرعية: ${v}`));
            }
        }

        const shariaRef = std.maqsad ? islamicDb.buildShariaRef(std.maqsad) : null;

        return this._response(issues.length === 0, {
            standard: std,
            entity:   entityData,
            issues,
        }, {
            standardId,
            sharia_ref: shariaRef,
            zakat_flag: std.domain === 'الزكاة والضريبة',
        });
    }

    // ─── تقرير الامتثال الشامل ───────────────────────────────────────────────

    /**
     * توليد تقرير امتثال شامل للمعايير المطلوبة
     * @param {string[]} standardIds
     * @param {object}   entityData
     * @returns {object}
     */
    fullComplianceReport(standardIds, entityData = {}) {
        const results = standardIds.map((id) => this.checkCompliance({ standardId: id, entityData }));
        const passed  = results.filter((r) => r.success).length;
        const failed  = results.length - passed;

        // استخدام مقصد المعيار الأول في القائمة كمرجع شرعي للتقرير
        const firstStd   = standardIds.length > 0 ? this.getById(standardIds[0]) : null;
        const maqsadId   = (firstStd && firstStd.maqsad) || 'MAL';

        return this._response(failed === 0, {
            total: results.length,
            passed,
            failed,
            details: results,
        }, {
            entity: entityData.id || 'unknown',
            sharia_ref: islamicDb.buildShariaRef(maqsadId),
        });
    }

    // ─── قائمة المنظمات الدولية ──────────────────────────────────────────────

    /**
     * قائمة كل المنظمات المعيارية الدولية والإقليمية
     * @returns {object[]}
     */
    listBodies() {
        return INTERNATIONAL_BODIES;
    }

    /**
     * إجمالي إحصائيات قاعدة المعايير
     * @returns {object}
     */
    stats() {
        const all  = Array.from(this._standards.values());
        const byMaqsad = {};
        for (const s of all) {
            if (s.maqsad) {
                byMaqsad[s.maqsad] = (byMaqsad[s.maqsad] || 0) + 1;
            }
        }
        return {
            schema:   this.schema,
            tawheed:  this.tawheed,
            total:    all.length,
            quality:  all.filter((s) => s._type === 'standard').length,
            legal:    all.filter((s) => s._type === 'legal').length,
            bodies:   INTERNATIONAL_BODIES.length,
            byMaqsad,
        };
    }

    // ─── دالة بناء الاستجابة الموحدة ─────────────────────────────────────────

    _response(success, data, meta = {}) {
        return {
            schema:  this.schema,
            tawheed: this.tawheed,
            success,
            data:    data || null,
            meta: {
                engine:    'standards',
                timestamp: new Date().toISOString(),
                no_harm_reason: 'لا ضرر ولا ضرار',
                ...meta,
            },
        };
    }

    /** واجهة موحدة للموجّه العصبي — تُعيد البيانات الخام فقط (الموجّه يتولى التغليف) */
    handle(request) {
        const { intent, data = {} } = request;

        if (intent === 'standards.search')           return Promise.resolve(this.search(data.keyword || ''));
        if (intent === 'standards.getById')          return Promise.resolve(this.getById(data.id));
        if (intent === 'standards.byMaqsad')         return Promise.resolve(this.getByMaqsad(data.maqsad));
        if (intent === 'standards.checkCompliance')  return Promise.resolve(this.checkCompliance(data));
        if (intent === 'standards.fullReport')       return Promise.resolve(this.fullComplianceReport(data.ids || [], data.entity));
        if (intent === 'standards.stats')            return Promise.resolve(this.stats());
        if (intent === 'standards.listBodies')       return Promise.resolve(this.listBodies());
        if (intent === 'standards.byRegion')         return Promise.resolve(this.getByRegion(data.region || 'SA'));
        if (intent === 'standards.legal')            return Promise.resolve(this.getLegalFrameworks());
        if (intent === 'standards.quality')          return Promise.resolve(this.getQualityStandards());

        return Promise.resolve(this.stats());
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

const engine = new SheikhaStandardsEngine();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    engine,
    SheikhaStandardsEngine,
    STANDARD_CATEGORIES,
};
