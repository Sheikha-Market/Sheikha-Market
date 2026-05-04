/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         SHEIKHA IFL LAYER — طبقة IFL في البنية الأساسية                     ║
 * ║     الطبقة الأعلى من ROOT NCN — تجمع IFL + IDA + شبكة الخلايا الجذرية      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 *
 * ── مرقّمة بالكتاب والسنة ووحدها لله ──
 *
 * ١. ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ
 *       أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ * تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا﴾
 *    — إبراهيم: ٢٤-٢٥
 *    [ARCH] شجرة المعمارية — الجذور في الحوسبة، الفروع في التطبيقات
 *
 * ٢. ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 *    [IFL] القائمة الشاملة — كل وظيفة مُسمّاة ومُعرَّفة
 *
 * ٣. ﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾ — الأعراف: ٥٦
 *    [ENV-3] الاستخدام البيئي للـ IFL — حماية الغابات والطبيعة
 *
 * ٤. ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١
 *    [SOFT-4] البحث البرمجي — تحديد المميزات التفاعلية في الكود
 *
 * ٥. ﴿وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ﴾ — الشعراء: ٨٠
 *    [MED-5] التطبيق الطبي — رصد الوظائف الحيوية رقمياً
 *
 * ٦. ﴿مَا أَنزَلَ اللَّهُ دَاءً إِلَّا أَنزَلَ لَهُ شِفَاءً﴾ — البخاري
 *    [CHEM-6] العلاج الكيميائي — بروتوكول IFL الكيميائي
 *
 * ٧. ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 *    [ITQAN] الإتقان في كل طبقة من طبقات المنظومة
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * الموقع الكامل في المنظومة:
 *
 *   Hardware
 *     ↓
 *   Linux Kernel (Ubuntu)
 *     ↓
 *   Guardian [UTF-8 + Sharia]
 *     ↓
 *   ROOT NCN LAYER (شبكة الخلايا العصبية الجذرية — 92 خلية × 7 طبقات)
 *     ↓
 *   Control Plane (الأوامر + الأحداث + الهوية)
 *     ↓
 *   [IFL LAYER ← هنا] — طبقة قائمة الوظائف التفاعلية
 *     ├── IFL Engine   (قائمة الوظائف: بيئي + برمجي + طبي + كيميائي)
 *     └── IDA Engine   (المعمارية التفاعلية: التوجيه + التجميع + الإخراج)
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * شبكة الخلايا العصبية الجذرية الكاملة المرتبطة بـ IFL:
 *
 *   ROOT NCN (L0:١ + L1:٧ + L2:١٤ + L3:٢١ + L4:٢٨ + L5:١٤ + L6:٧ = ٩٢ خلية)
 *     ↓ استدلال جذري
 *   IFL LAYER
 *     ├── نطاق البيئة    → IFL-F-003 / IFL-F-004
 *     ├── نطاق البرمجيات → IFL-F-005 / IFL-F-006
 *     ├── نطاق الطب      → IFL-F-007 / IFL-F-008
 *     ├── نطاق الكيمياء  → IFL-F-009 / IFL-F-010
 *     └── نطاق التجارة   → IFL-F-011 / IFL-F-012
 *
 * @module sheikha-ifl-layer
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */

'use strict';

// ─── استيراد الطبقات ──────────────────────────────────────────────────────────

let _iflEngine = null;
try {
    _iflEngine = require('../lib/sheikha-ifl-engine');
} catch (err) {
    console.warn('[IFL-LAYER] ⚠️  لم يُعثر على lib/sheikha-ifl-engine:', err.message);
}

let _idaEngine = null;
try {
    _idaEngine = require('../lib/sheikha-ida-engine');
} catch (err) {
    console.warn('[IFL-LAYER] ⚠️  لم يُعثر على lib/sheikha-ida-engine:', err.message);
}

let _rootNCN = null;
try {
    _rootNCN = require('./sheikha-root-ncn-layer');
} catch (err) {
    console.warn('[IFL-LAYER] ⚠️  لم يُعثر على core/sheikha-root-ncn-layer:', err.message);
}

let _controlPlane = null;
try {
    _controlPlane = require('./sheikha-control-plane');
} catch (err) {
    console.warn('[IFL-LAYER] ⚠️  لم يُعثر على core/sheikha-control-plane:', err.message);
}

// ─── ثوابت ───────────────────────────────────────────────────────────────────

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// ─── هوية الطبقة ─────────────────────────────────────────────────────────────

const LAYER_ID = {
    name:      'Sheikha IFL Layer',
    nameAr:    'طبقة قائمة الوظائف التفاعلية',
    version:   VERSION,
    layer:     'ifl',
    position:  'Control Plane → [IFL LAYER] → Applications',
    tawheed:   TAWHEED,
    bismillah: BISMILLAH,
    quranRef:  '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
    // التطبيقات الأربعة المرقّمة
    domains: {
        3: 'الاستخدام العلمي والبيئي — Intact Forest Landscapes (IFL)',
        4: 'أبحاث وتطوير البرمجيات — Interactive Feature Location (iFL)',
        5: 'التطبيق الطبي — IFL Online (المراقبة الصحية التفاعلية)',
        6: 'العلاج الكيميائي — IFL Regimen (Ifosfamide + Fluorouracil + Leucovorin)',
    },
};

// ─── الإحصائيات ──────────────────────────────────────────────────────────────

const _stats = {
    requests:      0,
    processed:     0,
    rootInferred:  0,
    errors:        0,
    startedAt:     null,
};

// ─── الحالة ───────────────────────────────────────────────────────────────────

let _ready = false;
let _ifl   = null;  // IFL Engine instance
let _ida   = null;  // IDA Engine instance

// ═══════════════════════════════════════════════════════════════════════════════
// التهيئة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تهيئة طبقة IFL وكل ما يعتمد عليها
 */
function initialize() {
    if (_ready) return;

    console.log(`[IFL-LAYER] ⚡ ${BISMILLAH}`);
    console.log(`[IFL-LAYER] 🌟 تهيئة طبقة IFL — ${VERSION}`);
    console.log(`[IFL-LAYER] 📖 ${LAYER_ID.quranRef}`);

    // تهيئة IFL Engine
    if (_iflEngine) {
        _ifl = _iflEngine.getInstance();
        console.log('[IFL-LAYER] ✅ IFL Engine نشط —', _ifl.status().stats.totalFunctions, 'وظيفة');
    }

    // تهيئة IDA Engine
    if (_idaEngine) {
        _ida = _idaEngine.getInstance();
        console.log('[IFL-LAYER] ✅ IDA Engine نشط — طبقة المعمارية التفاعلية');
    }

    // تسجيل أوامر في Control Plane
    if (_controlPlane) {
        _controlPlane.registerCommand('ifl:list', () => listFunctions(), {
            description: 'قائمة وظائف IFL',
            layer: 'ifl',
        });
        _controlPlane.registerCommand('ifl:domains', () => listDomains(), {
            description: 'نطاقات IFL الأربعة',
            layer: 'ifl',
        });
        _controlPlane.registerCommand('ifl:process', (payload) => process(payload), {
            description: 'معالجة طلب عبر IFL + IDA',
            layer: 'ifl',
        });
        _controlPlane.registerCommand('ifl:status', () => status(), {
            description: 'حالة طبقة IFL',
            layer: 'ifl',
        });
        console.log('[IFL-LAYER] 📌 أوامر IFL مسجّلة في Control Plane');
    }

    _ready       = true;
    _stats.startedAt = new Date().toISOString();

    console.log('[IFL-LAYER] 🏁 طبقة IFL جاهزة');
    console.log(`[IFL-LAYER] 📖 ${TAWHEED}`);

    // طباعة الطبقة الكاملة
    console.log('[IFL-LAYER] 🏗️  بنية المنظومة:');
    console.log('  Hardware → Guardian → ROOT-NCN → Control Plane → [IFL] → Applications');
    console.log('  التطبيقات:');
    for (const [num, name] of Object.entries(LAYER_ID.domains)) {
        console.log(`    ${num}. ${name}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// الوظائف الرئيسية
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * معالجة طلب عبر المنظومة الكاملة:
 *   ROOT NCN (استدلال جذري) → IFL (تحديد الوظيفة) → IDA (التوجيه والتجميع)
 *
 * ﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ * تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا﴾
 *
 * @param {object} request — { query, data, domain?, userId? }
 * @returns {Promise<object>}
 */
async function process(request = {}) {
    if (!_ready) initialize();

    _stats.requests++;

    // ── خطوة ١: استدلال ROOT NCN (إذا متاح) ──────────────────────────────────
    let ncnResult = null;
    if (_rootNCN && typeof _rootNCN.process === 'function') {
        ncnResult = _rootNCN.process({
            intent: request.query || '',
            data:   request.data || {},
        });
        if (ncnResult && ncnResult.ok) {
            _stats.rootInferred++;
        }
    }

    // ── خطوة ٢: معالجة عبر IDA → IFL ─────────────────────────────────────────
    if (_ida) {
        try {
            const result = await _ida.process({
                ...request,
                // إثراء الطلب بنتيجة ROOT NCN
                ncnContext: ncnResult || undefined,
            });
            _stats.processed++;
            return {
                ...result,
                layer:      'ifl',
                ncnContext: ncnResult || null,
            };
        } catch (err) {
            _stats.errors++;
            return {
                ok:     false,
                error:  err.message,
                layer:  'ifl',
                tawheed: TAWHEED,
            };
        }
    }

    // ── وضع احتياطي: IFL مباشر بدون IDA ─────────────────────────────────────
    if (_ifl && request.functionId) {
        const result = await _ifl.call(request.functionId, request.data || {});
        _stats.processed++;
        return {
            ...result,
            layer: 'ifl',
        };
    }

    _stats.errors++;
    return {
        ok:      false,
        error:   'IDA و IFL غير متاحَين',
        layer:   'ifl',
        tawheed: TAWHEED,
    };
}

/**
 * قائمة وظائف IFL
 * @param {object} filter
 * @returns {Array}
 */
function listFunctions(filter = {}) {
    if (!_ifl) return [];
    return _ifl.list(filter);
}

/**
 * قائمة نطاقات IFL الأربعة المرقّمة
 * @returns {Array}
 */
function listDomains() {
    if (!_ifl) return Object.entries(LAYER_ID.domains).map(([num, name]) => ({ number: num, name }));
    return _ifl.listDomains();
}

/**
 * استدعاء وظيفة IFL محددة مباشرة
 * @param {string} functionId
 * @param {object} inputs
 * @returns {Promise<object>}
 */
async function callFunction(functionId, inputs = {}) {
    if (!_ready) initialize();
    if (!_ifl) return { ok: false, error: 'IFL Engine غير متاح' };
    return _ifl.call(functionId, inputs);
}

/**
 * حالة طبقة IFL الكاملة
 * @returns {object}
 */
function status() {
    return {
        ...LAYER_ID,
        ready:   _ready,
        stats:   { ..._stats },
        ifl:     _ifl    ? _ifl.status()    : null,
        ida:     _ida    ? _ida.status()    : null,
        rootNCN: _rootNCN ? (_rootNCN.status ? _rootNCN.status() : { available: true }) : null,
    };
}

// ─── التهيئة التلقائية ────────────────────────────────────────────────────────
initialize();

// ═══════════════════════════════════════════════════════════════════════════════
// التصدير
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    initialize,
    process,
    listFunctions,
    listDomains,
    callFunction,
    status,
    LAYER_ID,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
