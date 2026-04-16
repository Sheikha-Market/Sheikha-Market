/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║          SHEIKHA NEURAL ROUTER — الموجّه العصبي الذكي الموحّد              ║
 * ║       يستقبل كل طلب ويوجّهه للمحرك المناسب بعد التحقق الشرعي              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ" — يوسف:٧٦
 *
 * تدفق كل طلب:
 *   الطلب → [تحقق الهوية DID] → [فلتر الشريعة] → [توجيه ذكي] → [تنفيذ] → [Audit] → رد
 */

'use strict';

const EventEmitter = require('events');
const islamicDb    = require('../islamic-db');

// ─── سجل المحركات ─────────────────────────────────────────────────────────────

const _engines = new Map(); // engineKey → { module, meta }

/**
 * تسجيل محرك في الموجّه
 * @param {string} key      - مفتاح فريد مثل 'market' | 'sharia' | 'identity'
 * @param {object} module   - وحدة المحرك (يجب أن تحوي handle(req) أو execute(req))
 * @param {object} [meta]   - بيانات وصفية: { nameAr, maqsad, domain }
 */
function registerEngine(key, module, meta = {}) {
    _engines.set(key, { module, meta });
    console.log(`[NEURAL-ROUTER] ✅ محرك مسجّل: ${key} — ${meta.nameAr || key}`);
}

/**
 * قائمة المحركات المسجّلة
 * @returns {string[]}
 */
function listEngines() {
    return Array.from(_engines.keys());
}

// ─── جدول التوجيه الافتراضي ──────────────────────────────────────────────────
//
// يربط نوع الطلب (intent) بالمحرك المسؤول عنه
// يمكن توسيعه ديناميكيًا عبر registerRoute()

const _routeTable = new Map([
    // السوق والتجارة
    ['market',      { engine: 'market',   maqsad: 'MAL' }],
    ['listing',     { engine: 'market',   maqsad: 'MAL' }],
    ['rfq',         { engine: 'market',   maqsad: 'MAL' }],
    ['price',       { engine: 'market',   maqsad: 'MAL' }],
    ['trade',       { engine: 'trade',    maqsad: 'MAL' }],
    ['zakat',       { engine: 'zakat',    maqsad: 'MAL' }],
    ['payment',     { engine: 'payments', maqsad: 'MAL' }],
    // الهوية والمصادقة
    ['auth',        { engine: 'identity', maqsad: 'DEEN' }],
    ['identity',    { engine: 'identity', maqsad: 'DEEN' }],
    ['did',         { engine: 'identity', maqsad: 'DEEN' }],
    // الشريعة والفتاوى
    ['fatwa',       { engine: 'sharia',   maqsad: 'DEEN' }],
    ['sharia',      { engine: 'sharia',   maqsad: 'DEEN' }],
    ['compliance',  { engine: 'sharia',   maqsad: 'DEEN' }],
    // التعليم والمعرفة
    ['education',   { engine: 'learning', maqsad: 'AQL' }],
    ['knowledge',   { engine: 'learning', maqsad: 'AQL' }],
    ['quran',       { engine: 'quran',    maqsad: 'AQL' }],
    // الصحة
    ['health',      { engine: 'medical',  maqsad: 'NAFS' }],
    ['medical',     { engine: 'medical',  maqsad: 'NAFS' }],
    // الذكاء الاصطناعي
    ['ai',          { engine: 'ai',       maqsad: 'ARD' }],
    ['lmm',         { engine: 'ai',       maqsad: 'ARD' }],
    ['agent',       { engine: 'agents',   maqsad: 'ARD' }],
    // الأمان
    ['security',    { engine: 'security', maqsad: 'NAFS' }],
    ['audit',       { engine: 'security', maqsad: 'NAFS' }],
]);

/**
 * تسجيل مسار توجيه مخصص
 * @param {string} intent
 * @param {string} engineKey
 * @param {string} [maqsadId]
 */
function registerRoute(intent, engineKey, maqsadId = 'ARD') {
    _routeTable.set(intent, { engine: engineKey, maqsad: maqsadId });
}

// ─── نواة التوجيه ─────────────────────────────────────────────────────────────

class SheikhaIslamicNeuralRouter extends EventEmitter {

    constructor() {
        super();
        this.schema  = 'sheikha/v2';
        this.tawheed = 'لا إله إلا الله';
        this.startedAt = new Date().toISOString();
    }

    /**
     * المدخل الرئيسي — يعالج كل طلب وارد
     *
     * @param {object} request
     * @param {string} request.intent   - نوع الطلب (market | fatwa | auth | …)
     * @param {object} [request.entity] - بيانات الكيان (هوية المستخدم / الشركة)
     * @param {object} [request.data]   - بيانات الطلب
     * @returns {Promise<object>}       - استجابة موحدة بالمعيار sheikha/v2
     */
    async route(request) {
        const { intent, entity = {}, data = {} } = request;
        const traceId = `SHK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        this.emit('request', { traceId, intent, entity });

        try {
            // ① تحقق الهوية الأولي
            this._verifyIdentity(entity);

            // ② فلتر الشريعة — تحقق أولي من البيانات
            const complianceCheck = this._shariaFilter(intent, data);
            if (!complianceCheck.compliant) {
                return this._buildResponse(false, null, {
                    traceId,
                    intent,
                    code: 'SHARIA_VIOLATION',
                    message: `المعاملة تخالف: ${complianceCheck.violations.join('، ')}`,
                    no_harm_reason: 'لا ضرر ولا ضرار',
                    references: complianceCheck.references,
                });
            }

            // ③ توجيه ذكي إلى المحرك
            const route  = this._resolveRoute(intent);
            const engine = _engines.get(route.engine);

            let result;
            if (engine) {
                const handler = engine.module.handle || engine.module.execute || engine.module.process;
                if (typeof handler === 'function') {
                    result = await handler.call(engine.module, { intent, entity, data, traceId });
                } else {
                    result = { message: `محرك "${route.engine}" لا يحوي دالة معالجة` };
                }
            } else {
                result = { message: `محرك "${route.engine}" غير مسجّل — سيُضاف لاحقًا` };
            }

            // ④ إرفاق المرجع الشرعي
            const shariaRef = islamicDb.buildShariaRef(route.maqsad);

            // ⑤ حفظ بالسجل (Audit)
            this.emit('audit', { traceId, intent, entity: entity.id, result: 'success' });

            return this._buildResponse(true, result, {
                traceId,
                intent,
                sharia_ref: shariaRef,
                engine: route.engine,
                maqsad: route.maqsad,
            });

        } catch (err) {
            this.emit('error', { traceId, intent, error: err.message });
            return this._buildResponse(false, null, {
                traceId,
                intent,
                code: 'INTERNAL_ERROR',
                message: err.message,
                no_harm_reason: 'لا ضرر ولا ضرار — يُعالج الخطأ بأمان',
            });
        }
    }

    // ─── دوال مساعدة خاصة ────────────────────────────────────────────────────

    /** التحقق الأساسي من وجود هوية */
    _verifyIdentity(entity) {
        if (entity && entity.id && !entity.id.startsWith('did:sheikha:')) {
            console.warn(`[NEURAL-ROUTER] ⚠️  هوية لا تتبع معيار DID: ${entity.id}`);
        }
    }

    /** فلتر الشريعة الأولي بناءً على نوع الطلب والبيانات */
    _shariaFilter(intent, data) {
        const operation = {
            hasRiba: Boolean(data.interest_rate || data.riba),
            hasGharar: Boolean(data.unknown_quantity && data.unknown_price),
            hasMutualConsent: data.consent !== false,
        };
        return islamicDb.verifyCompliance(operation);
    }

    /** استخراج مسار التوجيه المناسب للنية */
    _resolveRoute(intent) {
        if (!intent) return { engine: 'ai', maqsad: 'ARD' };
        const normalized = String(intent).toLowerCase().trim();
        return _routeTable.get(normalized) || { engine: normalized, maqsad: 'ARD' };
    }

    /** بناء الاستجابة الموحدة بمعيار sheikha/v2 */
    _buildResponse(success, data, meta = {}) {
        return {
            schema:   this.schema,
            tawheed:  this.tawheed,
            success,
            data:     data || null,
            meta: {
                timestamp: new Date().toISOString(),
                ...meta,
            },
        };
    }

    /** حالة الموجّه */
    status() {
        return {
            schema:     this.schema,
            startedAt:  this.startedAt,
            engines:    listEngines(),
            routes:     _routeTable.size,
            tawheed:    this.tawheed,
        };
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

const router = new SheikhaIslamicNeuralRouter();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    router,
    registerEngine,
    registerRoute,
    listEngines,
    SheikhaIslamicNeuralRouter,
};
