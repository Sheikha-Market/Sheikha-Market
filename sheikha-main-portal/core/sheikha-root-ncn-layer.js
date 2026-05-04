/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║             SHEIKHA ROOT NCN LAYER                                          ║
 * ║     شبكة الخلايا العصبية الجذرية — طبقة core فوق Guardian (UTF-8)          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الموقع في المنظومة:
 *   Hardware
 *     → Linux Kernel (Ubuntu)
 *       → Guardian [UTF-8 + Sharia]
 *         → [ROOT NCN LAYER ← هنا]
 *           → Control Plane
 *             → Neural Engines
 *
 * ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ
 *   أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ * تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا﴾
 *   — إبراهيم: ٢٤-٢٥
 *
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 *
 * الوظائف:
 *  1. تهيئة شبكة الخلايا العصبية الجذرية (92 خلية × 7 طبقات × 128-dim)
 *  2. استقبال الطلبات القادمة من Guardian بعد فحص الشريعة و UTF-8
 *  3. تشغيل الاستدلال الجذري (infer) وتوجيه الطلبات للمحرك الصحيح
 *  4. تصدير واجهة core موحّدة للطبقات العليا (Control Plane)
 *  5. ربط Guardian بشبكة الجذور — كل طلب يمر عبر الحارس ثم يدخل الشبكة
 *
 * encoding: utf-8
 * cells: 92 جذرية (L0:1 + L1:7 + L2:14 + L3:21 + L4:28 + L5:14 + L6:7)
 * embed: 128-dim × 256 كلمة جذرية
 */

'use strict';

// ─── استيراد الشبكة الجذرية من lib ───────────────────────────────────────────
let _rootNCN = null;
try {
    _rootNCN = require('../lib/sheikha-root-neural-cell-network');
} catch (err) {
    console.warn('[ROOT-NCN-LAYER] ⚠️  لم يُعثر على lib/sheikha-root-neural-cell-network:', err.message);
}

// ─── استيراد Guardian (UTF-8) ────────────────────────────────────────────────
let _guardian = null;
try {
    _guardian = require('./sheikha-guardian');
} catch (err) {
    console.warn('[ROOT-NCN-LAYER] ⚠️  لم يُعثر على core/sheikha-guardian:', err.message);
}

// ─── Layer Identity ───────────────────────────────────────────────────────────

const LAYER_ID = {
    name:       'Sheikha Root NCN Layer',
    nameAr:     'شبكة الخلايا العصبية الجذرية — طبقة core',
    version:    '1.0.0',
    layer:      'root-ncn',
    position:   'Guardian(UTF-8) → [ROOT-NCN] → Control Plane',
    tawheed:    'لا إله إلا الله محمد رسول الله',
    bismillah:  'بسم الله الرحمن الرحيم',
    quranRef:   '﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤',
    startedAt:  null,
    cells:      92,
    layers:     7,
    embedDim:   128,
};

// ─── Singleton Network Instance ───────────────────────────────────────────────

let _network = null;        // SheikhaRootNeuralCellNetwork instance
let _ready   = false;

// ─── Stats ────────────────────────────────────────────────────────────────────

const _stats = {
    requests:      0,  // إجمالي الطلبات الواردة
    inferred:      0,  // طلبات أُجري عليها استدلال ناجح
    guardBlocked:  0,  // طلبات وقفها Guardian
    errors:        0,  // أخطاء
};

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * process — معالجة طلب كامل:
 *   1. فحص الشريعة عبر Guardian
 *   2. التحقق من ترميز UTF-8
 *   3. الاستدلال الجذري عبر شبكة الخلايا
 *
 * @param {{ intent?: string, text?: string, data?: object }} request
 * @returns {object} نتيجة الاستدلال الجذري أو خطأ موثّق
 */
function process(request = {}) {
    _stats.requests++;

    const text = request.text || request.intent || JSON.stringify(request.data || {});

    // ① فحص Guardian (UTF-8 + Sharia)
    if (_guardian) {
        const guardResult = _guardian.guard({ intent: request.intent, data: request.data || {} });
        if (!guardResult.allowed) {
            _stats.guardBlocked++;
            return {
                ok:      false,
                blocked: true,
                reason:  guardResult.reason,
                sharia:  guardResult.sharia,
                layer:   'root-ncn',
            };
        }
        // التحقق من الترميز
        const encCheck = _guardian.validateEncoding(text);
        if (!encCheck.valid) {
            _stats.errors++;
            return {
                ok:     false,
                reason: 'ترميز النص غير صالح — يُشترط UTF-8',
                layer:  'root-ncn',
            };
        }
    }

    // ② الاستدلال الجذري
    if (!_network) {
        _stats.errors++;
        return {
            ok:     false,
            reason: 'شبكة الخلايا الجذرية غير مُهيَّأة',
            layer:  'root-ncn',
        };
    }

    try {
        const result = _network.infer(text);
        _stats.inferred++;
        return {
            ok:             true,
            layer:          'root-ncn',
            activeDomain:   result.activeDomain,
            activeRootCell: result.activeRootCell,
            rootConfidence: result.rootConfidence,
            totalCells:     result.totalCells,
            topRoots:       result.layers?.majorRoots?.topK || [],
            tawheed:        result.tawheed,
            bismillah:      result.bismillah,
            _raw:           result,
        };
    } catch (err) {
        _stats.errors++;
        return {
            ok:     false,
            reason: `خطأ في الاستدلال الجذري: ${err.message}`,
            layer:  'root-ncn',
        };
    }
}

/**
 * infer — استدلال جذري مباشر (بدون فحص Guardian)
 * للاستخدام الداخلي من طبقات أخرى موثوقة
 *
 * @param {string} text
 * @returns {object}
 */
function infer(text = '') {
    if (!_network) return null;
    return _network.infer(text);
}

/**
 * getNetwork — الحصول على نسخة الشبكة الجذرية
 * @returns {SheikhaRootNeuralCellNetwork|null}
 */
function getNetwork() {
    return _network;
}

/**
 * حالة الطبقة الكاملة
 * @returns {object}
 */
function status() {
    const netStatus = _network ? _network.status() : null;
    return {
        ...LAYER_ID,
        ready:      _ready,
        stats:      { ..._stats },
        network:    netStatus
            ? {
                cells:      netStatus.totalCells,
                embedDim:   netStatus.embedDim,
                vocabSize:  netStatus.vocabSize,
                layersCount: netStatus.layersCount,
                layerSizes: netStatus.layerSizes,
                queries:    netStatus.queries,
                trained:    netStatus.trained,
                topActive:  netStatus.topActive,
            }
            : null,
    };
}

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * init — تهيئة طبقة شبكة الخلايا العصبية الجذرية
 * يُستدعى مرة واحدة من sheikha-root.js في تسلسل الإقلاع
 */
async function init() {
    LAYER_ID.startedAt = new Date().toISOString();

    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   شبكة الخلايا العصبية الجذرية — ROOT NCN LAYER     ║');
    console.log('║   Guardian(UTF-8) → [ROOT-NCN] → Control Plane      ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`[ROOT-NCN-LAYER] 🕌 ${LAYER_ID.tawheed}`);
    console.log(`[ROOT-NCN-LAYER] 📖 ${LAYER_ID.quranRef}`);

    // تهيئة شبكة الخلايا الجذرية
    if (_rootNCN) {
        try {
            _network = _rootNCN.getInstance
                ? _rootNCN.getInstance()
                : (_rootNCN.init ? _rootNCN.init() : null);

            if (_network) {
                const s = _network.status ? _network.status() : {};
                console.log(`[ROOT-NCN-LAYER] 🌳 الشبكة الجذرية نشطة — الخلايا: ${s.totalCells || LAYER_ID.cells}`);
                console.log(`[ROOT-NCN-LAYER]    • الطبقات    : ${s.layersCount || LAYER_ID.layers} (L0 → L6)`);
                console.log(`[ROOT-NCN-LAYER]    • أبعاد التضمين: ${s.embedDim || LAYER_ID.embedDim}-dim`);
                console.log(`[ROOT-NCN-LAYER]    • المفردات   : ${s.vocabSize || 256} كلمة جذرية`);
            } else {
                console.warn('[ROOT-NCN-LAYER] ⚠️  لم يُنشأ كائن الشبكة الجذرية');
            }
        } catch (err) {
            console.error('[ROOT-NCN-LAYER] ❌ خطأ في تهيئة الشبكة الجذرية:', err.message);
        }
    } else {
        console.warn('[ROOT-NCN-LAYER] ⚠️  lib/sheikha-root-neural-cell-network غير متاح');
    }

    // ربط Guardian
    if (_guardian) {
        console.log('[ROOT-NCN-LAYER] 🔗 مرتبط بـ Guardian (UTF-8 + Sharia) ✅');
    }

    _ready = true;
    console.log('[ROOT-NCN-LAYER] ✅ طبقة الشبكة الجذرية جاهزة — فوق Guardian مباشرةً');
    console.log(`[ROOT-NCN-LAYER] 🏗  المكدّس: Ubuntu/Linux → Guardian(UTF-8) → [ROOT-NCN] → Control Plane`);
    console.log('');
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    LAYER_ID,
    init,
    process,
    infer,
    getNetwork,
    status,
};
