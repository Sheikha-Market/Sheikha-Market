/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║      SHEIKHA SIRN-IFL LAYER — الطبقة الأعلى من SIRN                         ║
 * ║      تكامل شبكة الجذور الدلالية مع قائمة الوظائف التفاعلية                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 *
 * ── مرقّمة بالكتاب والسنة ووحدها لله ──
 *
 * ١. ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ
 *       أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤
 *    [ARCH] SIRN هو الجذر — IFL هو الفروع
 *
 * ٢. ﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾ — الأنبياء: ٣٠
 *    [FLOW] تدفق البيانات من SIRN إلى IFL — كل شيء حي بالتدفق
 *
 * ٣. ﴿وَفِي كُلِّ شَيْءٍ لَّهُ آيَةٌ تَدُلُّ عَلَىٰ أَنَّهُ وَاحِدٌ﴾
 *    [UNITY] وحدة المعمارية — SIRN + IFL + IDA = منظومة واحدة
 *
 * ٤. ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 *    [ITQAN] إتقان كل طبقة وكل ربط بين الطبقات
 *
 * ٥. «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي
 *    [EXCELLENCE] التميز في كل وظيفة من وظائف الطبقة
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * البنية الكاملة للمنظومة:
 *
 *   Hardware
 *     ↓
 *   Guardian [UTF-8 + Sharia]
 *     ↓
 *   ROOT NCN LAYER (٩٢ خلية جذرية × ٧ طبقات × ١٢٨-dim)
 *     ↓
 *   Control Plane
 *     ↓
 *   SIRN ENGINE (شبكة الجذور الدلالية — ٦٣ خلية × ٥ طبقات × ٢٥٦-dim)
 *     ↓
 *   ╔══════════════════════════════════╗
 *   ║  [SIRN-IFL LAYER ← هنا]         ║  ← الطبقة الأعلى من SIRN
 *   ║  ربط الاستدلال الدلالي بالوظائف ║
 *   ╚══════════════════════════════════╝
 *     ↓
 *   IFL ENGINE (١٢ وظيفة — ٤ نطاقات × ٣ + أساسيات)
 *     ↓
 *   IDA ENGINE (٥ طبقات — توجيه + تجميع + شريعة + إخراج)
 *     ↓
 *   Applications (ENV:٣ | SOFT:٤ | MED:٥ | CHEM:٦)
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * وظائف هذه الطبقة (SIRN-IFL):
 *  ١. استقبال مخرجات SIRN (domain + iflId + confidence)
 *  ٢. التحقق من الاتساق الدلالي قبل تمرير الطلب لـ IFL
 *  ٣. تحسين التوجيه بناءً على سياق SIRN
 *  ٤. إدارة fallback عند انخفاض الثقة
 *  ٥. تسجيل مسار كل طلب عبر كل الطبقات
 *
 * @module sheikha-sirn-ifl-layer
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */

'use strict';

// ─── استيراد الطبقات ──────────────────────────────────────────────────────────

let _sirnEngine = null;
try {
    _sirnEngine = require('../lib/sheikha-sirn-engine');
} catch (err) {
    console.warn('[SIRN-IFL] ⚠️  sheikha-sirn-engine غير متاح:', err.message);
}

let _iflLayer = null;
try {
    _iflLayer = require('./sheikha-ifl-layer');
} catch (err) {
    console.warn('[SIRN-IFL] ⚠️  sheikha-ifl-layer غير متاح:', err.message);
}

let _iflEngine = null;
try {
    _iflEngine = require('../lib/sheikha-ifl-engine');
} catch (err) {
    console.warn('[SIRN-IFL] ⚠️  sheikha-ifl-engine غير متاح:', err.message);
}

let _idaEngine = null;
try {
    _idaEngine = require('../lib/sheikha-ida-engine');
} catch (err) {
    console.warn('[SIRN-IFL] ⚠️  sheikha-ida-engine غير متاح:', err.message);
}

let _controlPlane = null;
try {
    _controlPlane = require('./sheikha-control-plane');
} catch (err) {
    console.warn('[SIRN-IFL] ⚠️  sheikha-control-plane غير متاح:', err.message);
}

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

/** حد أدنى للثقة لقبول استدلال SIRN — إذا أقل نستخدم fallback */
const CONFIDENCE_THRESHOLD = 0.15;

// ─── هوية الطبقة ─────────────────────────────────────────────────────────────
const LAYER_ID = {
    name:      'Sheikha SIRN-IFL Layer',
    nameAr:    'طبقة SIRN-IFL — الجسر الدلالي الوظيفي',
    version:   VERSION,
    layer:     'sirn-ifl',
    position:  'SIRN ENGINE → [SIRN-IFL LAYER] → IFL ENGINE → IDA',
    tawheed:   TAWHEED,
    bismillah: BISMILLAH,
    quranRef:  '﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤',
};

// ─── الإحصائيات ──────────────────────────────────────────────────────────────
const _stats = {
    requests:        0,
    sirnInferred:    0,
    iflRouted:       0,
    fallbackUsed:    0,
    shariaBlocked:   0,
    errors:          0,
    startedAt:       null,
};

let _ready = false;
let _sirn  = null;
let _ifl   = null;
let _ida   = null;

// ═══════════════════════════════════════════════════════════════════════════════
// التهيئة
// ═══════════════════════════════════════════════════════════════════════════════

function initialize() {
    if (_ready) return;

    console.log(`[SIRN-IFL] ⚡ ${BISMILLAH}`);
    console.log(`[SIRN-IFL] 🌟 تهيئة الطبقة الأعلى من SIRN — v${VERSION}`);

    // تهيئة SIRN
    if (_sirnEngine) {
        _sirn = _sirnEngine.getInstance();
        const s = _sirn.status();
        console.log(`[SIRN-IFL] ✅ SIRN نشط — ${s.architecture.totalCells} خلية | ${s.architecture.embedDim}-dim`);
    }

    // تهيئة IFL
    if (_iflEngine) {
        _ifl = _iflEngine.getInstance();
        console.log('[SIRN-IFL] ✅ IFL Engine نشط —', _ifl.status().stats.totalFunctions, 'وظيفة');
    }

    // تهيئة IDA
    if (_idaEngine) {
        _ida = _idaEngine.getInstance();
        console.log('[SIRN-IFL] ✅ IDA Engine نشط');
    }

    // تسجيل أوامر في Control Plane
    if (_controlPlane) {
        _controlPlane.registerCommand('sirn:infer',   (p) => infer(p.text || p),         { description: 'استدلال SIRN دلالي', layer: 'sirn-ifl' });
        _controlPlane.registerCommand('sirn:process', (p) => process(p),                  { description: 'معالجة كاملة SIRN→IFL→IDA', layer: 'sirn-ifl' });
        _controlPlane.registerCommand('sirn:status',  () => status(),                     { description: 'حالة طبقة SIRN-IFL', layer: 'sirn-ifl' });
        _controlPlane.registerCommand('sirn:domains', () => listDomains(),                { description: 'نطاقات SIRN', layer: 'sirn-ifl' });
        console.log('[SIRN-IFL] 📌 أوامر SIRN مسجّلة في Control Plane');
    }

    _ready            = true;
    _stats.startedAt  = new Date().toISOString();

    console.log(`[SIRN-IFL] 📖 ${TAWHEED}`);
    console.log('[SIRN-IFL] 🏗️  المنظومة: ROOT-NCN → CP → SIRN → [SIRN-IFL] → IFL → IDA → Apps');
}

// ═══════════════════════════════════════════════════════════════════════════════
// الوظائف الرئيسية
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * استدلال SIRN فقط — تحليل دلالي بدون تنفيذ IFL
 * @param {string|object} input
 * @returns {object}
 */
function infer(input) {
    if (!_ready) initialize();
    if (!_sirn) {
        return { ok: false, error: 'SIRN Engine غير متاح', tawheed: TAWHEED };
    }
    _stats.sirnInferred++;
    return _sirn.infer(input);
}

/**
 * معالجة كاملة: SIRN (استدلال دلالي) → SIRN-IFL (ربط) → IFL + IDA (تنفيذ)
 *
 * ﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ * تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا﴾
 *
 * @param {object} request — { query, text, data, domain?, userId? }
 * @returns {Promise<object>}
 */
async function process(request = {}) {
    if (!_ready) initialize();

    _stats.requests++;

    const text = request.query || request.text || request.intent
        || (request.data ? JSON.stringify(request.data) : '');

    // ── خطوة ١: استدلال SIRN ──────────────────────────────────────────────────
    let sirnResult = null;
    if (_sirn && text) {
        sirnResult = _sirn.infer(text);
        _stats.sirnInferred++;
    }

    // ── خطوة ٢: فحص الشريعة من SIRN ──────────────────────────────────────────
    if (sirnResult && !sirnResult.shariaCompliant) {
        _stats.shariaBlocked++;
        return {
            ok:       false,
            blocked:  true,
            reason:   sirnResult.shariaWarning || 'محتوى محظور شرعياً',
            quranRef: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
            tawheed:  TAWHEED,
        };
    }

    // ── خطوة ٣: تحديد النطاق + iflId ─────────────────────────────────────────
    let domain  = request.domain || null;
    let iflId   = request.iflId  || null;
    let confidence = 0;

    if (sirnResult && sirnResult.ok) {
        // استخدم SIRN إذا ثقته كافية أو لا يوجد نطاق صريح
        if (!domain || sirnResult.confidence >= CONFIDENCE_THRESHOLD) {
            domain     = sirnResult.iflDomain || sirnResult.domain;
            iflId      = sirnResult.iflId     || null;
            confidence = sirnResult.confidence;
        }
    }

    // fallback إذا لا يوجد نطاق
    if (!domain) {
        domain = 'TRADE';
        iflId  = 'IFL-F-011';
        _stats.fallbackUsed++;
    }

    // ── خطوة ٤: تنفيذ IFL مباشرة (إذا iflId محدد) ────────────────────────────
    let iflResult = null;
    if (_ifl && iflId) {
        iflResult = await _ifl.call(iflId, {
            query:   text,
            data:    request.data || {},
            userId:  request.userId,
        });
        _stats.iflRouted++;
    }

    // ── خطوة ٥: معالجة IDA (الطبقة العليا للبيانات) ───────────────────────────
    let idaResult = null;
    if (_ida) {
        idaResult = await _ida.process({
            query:      text,
            domain,
            iflId,
            data:       request.data || {},
            userId:     request.userId,
            sirnContext: sirnResult || undefined,
        });
    }

    // ── خطوة ٦: بناء الاستجابة الموحّدة ─────────────────────────────────────
    return _buildResponse(request, sirnResult, iflResult, idaResult, domain, iflId, confidence);
}

/**
 * بناء الاستجابة الموحّدة
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾
 * @private
 */
function _buildResponse(request, sirnResult, iflResult, idaResult, domain, iflId, confidence) {
    return {
        ok:         true,
        bismillah:  BISMILLAH,
        tawheed:    TAWHEED,
        pipeline: {
            layers:     ['ROOT-NCN', 'SIRN', 'SIRN-IFL', 'IFL', 'IDA'],
            activePath: `SIRN(${domain}) → IFL(${iflId || 'auto'}) → IDA`,
        },
        sirn: sirnResult ? {
            domain:          sirnResult.domain,
            iflDomain:       sirnResult.iflDomain,
            confidence:      sirnResult.confidence,
            shariaCompliant: sirnResult.shariaCompliant,
            quranRef:        sirnResult.quranRef,
            topScores:       sirnResult.scores,
        } : null,
        ifl:  iflResult  || null,
        ida:  idaResult  || null,
        routing: {
            domain,
            iflId,
            confidence,
            method: sirnResult ? 'sirn-semantic' : 'fallback',
        },
        islamicRefs: {
            arch:   '﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤',
            flow:   '﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾ — الأنبياء: ٣٠',
            itqan:  '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
            hadith: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي',
        },
        timestamp: new Date().toISOString(),
    };
}

/**
 * قائمة النطاقات الدلالية مع روابط IFL
 * @returns {Array}
 */
function listDomains() {
    const sirnDomains = _sirnEngine ? _sirnEngine.SIRN_DOMAINS : {};
    return Object.entries(sirnDomains).map(([key, d]) => ({
        key,
        id:        d.id,
        iflDomain: d.iflDomain,
        iflId:     d.iflId,
        quranRef:  d.quranRef,
    }));
}

/**
 * حالة طبقة SIRN-IFL
 * @returns {object}
 */
function status() {
    return {
        ...LAYER_ID,
        ready:  _ready,
        stats:  { ..._stats },
        sirn:   _sirn ? _sirn.status() : null,
        ifl:    _ifl  ? _ifl.status()  : null,
        ida:    _ida  ? _ida.status()  : null,
        confidenceThreshold: CONFIDENCE_THRESHOLD,
    };
}

// ─── التهيئة التلقائية ────────────────────────────────────────────────────────
initialize();

// ═══════════════════════════════════════════════════════════════════════════════
// التصدير
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    initialize,
    infer,
    process,
    listDomains,
    status,
    LAYER_ID,
    CONFIDENCE_THRESHOLD,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
