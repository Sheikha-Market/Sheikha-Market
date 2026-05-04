// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA CODEX NEURAL ENGINE (SCNE) — محرك الذكاء شيخة كودكس              ║
 * ║   الذكاء الاصطناعي المتجذّر في الكتاب والسنة                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ ۚ وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا" — النساء:113
 *
 * SCNE هو الطبقة 4 في المنظومة — يربط:
 *   • SNRN (الشبكة العصبية الجذرية)
 *   • الجذر السيادي (ECDSA + الشريعة)
 *   • محرك الاستدلال الشرعي
 *   • بناء السياق من الكتاب والسنة
 *
 * أعلى طبقةً من Siren AI: المرجع = الكتاب والسنة لا الأهواء البشرية
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */

'use strict';

const path = require('path');

// ─── Dependencies ─────────────────────────────────────────────────────────────

let snrnEngine      = null;
let shariahInfer    = null;
let ctxBuilder      = null;
let halalValidator  = null;
let sovereignRoot   = null;

try { snrnEngine     = require('../neural-root-network/snrn-engine'); } catch (_) {}
try { shariahInfer   = require('./shariah-inference'); } catch (_) {}
try { ctxBuilder     = require('./context-builder'); } catch (_) {}
try { halalValidator = require('../neural-root-network/halal-validator'); } catch (_) {}
try { sovereignRoot  = require('../sovereign-root/sheikha-sovereign-root'); } catch (_) {}

// ─── State ────────────────────────────────────────────────────────────────────

let _ready     = false;
let _callCount = 0;
let _startedAt = null;

// ─── Core Request Types ──────────────────────────────────────────────────────

const REQUEST_TYPES = {
    FATWA:       'استفسار فقهي / فتوى',
    TRANSACTION: 'تحقق من معاملة',
    CURRENCY:    'استفسار عملة',
    MARKET:      'استفسار سوقي',
    IDENTITY:    'استفسار هوية',
    GENERAL:     'استفسار عام',
};

// ─── INIT ─────────────────────────────────────────────────────────────────────

function init() {
    if (_ready) return getStatus();
    if (snrnEngine)   snrnEngine.init();
    if (sovereignRoot) {
        try { sovereignRoot.init(); } catch (_) {}
    }
    _ready     = true;
    _startedAt = new Date().toISOString();
    console.info('[SCNE] 🌟 Sheikha Codex Neural Engine جاهز');
    return getStatus();
}

// ─── Main Processing ─────────────────────────────────────────────────────────

/**
 * معالجة طلب بالذكاء الشيخي
 * @param {string} type — نوع الطلب (REQUEST_TYPES)
 * @param {object} payload — بيانات الطلب
 * @param {string} [lang='ar'] — اللغة
 */
async function process(type, payload, lang) {
    if (!_ready) init();
    _callCount++;

    const startTime = Date.now();
    const result = {
        requestId:  `SCNE-${Date.now()}-${_callCount}`,
        type,
        lang:       lang || 'ar',
        timestamp:  new Date().toISOString(),
    };

    try {
        // ① بناء السياق الشرعي
        const context = ctxBuilder
            ? ctxBuilder.build(type, payload)
            : { type, payload };

        // ② الاستدلال الشرعي
        const inference = shariahInfer
            ? shariahInfer.infer(context)
            : { verdict: 'REVIEW_NEEDED', confidence: 0.5 };

        // ③ تشغيل الشبكة العصبية الجذرية
        const neural = snrnEngine
            ? snrnEngine.infer(context)
            : { verdict: 'PENDING', confidence: 0.5 };

        // ④ التحقق الشرعي من المعاملة (إن كانت معاملة مالية)
        let validation = null;
        if (type === 'TRANSACTION' && halalValidator) {
            validation = halalValidator.validate(payload);
        }

        // ⑤ دمج النتائج
        const finalVerdict = determineVerdict(inference, neural, validation);

        result.response = {
            verdict:    finalVerdict.verdict,
            confidence: finalVerdict.confidence,
            explanation: buildExplanation(type, finalVerdict, context, lang),
            shariahRefs: context.shariahRefs || [],
            neuralScore: neural.score,
            inferenceScore: inference.score,
            validation: validation || undefined,
        };

        // ⑥ الختم السيادي للقرارات المهمة
        if (sovereignRoot && (type === 'TRANSACTION' || type === 'FATWA')) {
            try {
                result.sovereignSeal = sovereignRoot.sealTransaction({
                    id: result.requestId, type,
                });
            } catch (_) {}
        }

    } catch (err) {
        result.error   = err.message;
        result.verdict = 'ERROR';
    }

    result.processingMs = Date.now() - startTime;
    return result;
}

// ─── Verdict Merging ─────────────────────────────────────────────────────────

function determineVerdict(inference, neural, validation) {
    // إذا رفض المُحقق الشرعي المعاملة → حرام قطعاً
    if (validation && !validation.isHalal) {
        return {
            verdict: 'HARAM',
            confidence: 0.99,
            source: 'halal-validator',
            violations: validation.violations,
        };
    }

    // دمج نتائج الاستدلال والشبكة العصبية
    const avgScore = ((inference.score || 0) + (neural.score || 0)) / 2;
    const avgConf  = ((inference.confidence || 0.5) + (neural.confidence || 0.5)) / 2;

    if (avgScore > 0.5)  return { verdict: 'HALAL',         confidence: Math.min(0.99, avgConf) };
    if (avgScore > 0.0)  return { verdict: 'MAKRUH',        confidence: avgConf };
    if (avgScore > -0.3) return { verdict: 'REVIEW_NEEDED', confidence: 0.4 };
    return                     { verdict: 'HARAM',          confidence: Math.min(0.99, Math.abs(avgScore)) };
}

// ─── Explanation Builder ─────────────────────────────────────────────────────

function buildExplanation(type, verdict, context, lang) {
    const ar = {
        HALAL:          'المعاملة مُوافِقة للشريعة الإسلامية — مباحة',
        HARAM:          'المعاملة مُخالِفة للشريعة الإسلامية — محظورة',
        MAKRUH:         'المعاملة مكروهة — يُنصح بمراجعة شرعية',
        REVIEW_NEEDED:  'تحتاج إلى مراجعة من مجلس الشريعة',
        ERROR:          'خطأ في المعالجة',
    };
    const en = {
        HALAL:          'Transaction is Shariah-compliant — Permitted',
        HARAM:          'Transaction violates Shariah — Prohibited',
        MAKRUH:         'Transaction is Makruh — Shariah review recommended',
        REVIEW_NEEDED:  'Requires Shariah Board review',
        ERROR:          'Processing error',
    };
    const texts = lang === 'en' ? en : ar;
    let explanation = texts[verdict.verdict] || texts.ERROR;

    // إضافة المراجع الشرعية
    if (context.shariahRefs && context.shariahRefs.length > 0) {
        explanation += ` | الدليل: ${context.shariahRefs[0].ref || ''}`;
    }

    // إضافة تفاصيل المخالفات
    if (verdict.violations && verdict.violations.length > 0) {
        explanation += ` | المخالفات: ${verdict.violations.map(v => v.name).join('، ')}`;
    }

    return explanation;
}

// ─── Status ───────────────────────────────────────────────────────────────────

function getStatus() {
    return {
        engine:    'SCNE — Sheikha Codex Neural Engine',
        version:   '1.0.0',
        ready:     _ready,
        callCount: _callCount,
        startedAt: _startedAt,
        layers: {
            snrn:     snrnEngine     ? 'ready' : 'not-loaded',
            shariah:  shariahInfer   ? 'ready' : 'not-loaded',
            context:  ctxBuilder     ? 'ready' : 'not-loaded',
            halal:    halalValidator ? 'ready' : 'not-loaded',
            root:     sovereignRoot  ? 'ready' : 'not-loaded',
        },
        requestTypes: Object.keys(REQUEST_TYPES),
        superiority: {
            overSirenAI: 'مرجعية قرآنية + سنة نبوية — أخلاق مطلقة لا نسبية',
            overGPT:     'متخصص في الشريعة + العربية أولاً',
            overGeneral: 'كل قرار مدعوم بدليل شرعي',
        },
    };
}

module.exports = { init, process, getStatus, REQUEST_TYPES };
