/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * WeightedSharia — أوزان الشريعة لشبكة شيخة العصبية
 * دالة التفعيل مبنية على معايير الكتاب والسنة
 *
 * "وَالْمِيزَانَ أَلَّا تَطْغَوْا فِي الْمِيزَانِ" — الرحمن ٨
 * العدل والتوازن: أساس حساب الأوزان
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

// ── المعايير الشرعية وأوزانها الافتراضية ─────────────────────────────────────
const SHARIA_WEIGHTS = Object.freeze({
    // المعايير الخمسة الأساسية (الضروريات الخمس)
    noRiba:        { weight: 1.0, nameAr: 'لا ربا',          penalty: -1.0 },
    noGharar:      { weight: 0.9, nameAr: 'لا غرر',          penalty: -0.9 },
    noGhish:       { weight: 0.9, nameAr: 'لا غش',           penalty: -0.9 },
    noHarm:        { weight: 1.0, nameAr: 'لا ضرر ولا ضرار', penalty: -1.0 },
    mutualConsent: { weight: 0.8, nameAr: 'التراضي',         penalty: -0.8 },

    // معايير الجودة والإتقان
    itqan:  { weight: 0.7, nameAr: 'الإتقان',    penalty: -0.3 },
    sidq:   { weight: 0.8, nameAr: 'الصدق',      penalty: -0.7 },
    amanah: { weight: 0.8, nameAr: 'الأمانة',    penalty: -0.7 },
    adl:    { weight: 0.9, nameAr: 'العدل',      penalty: -0.8 },

    // مؤشرات البركة
    barakah: { weight: 0.6, nameAr: 'البركة',    penalty:  0.0 }
});

/**
 * يحسب الوزن الشرعي للعقدة بناءً على صفاتها
 * @param {object} nodeAttributes - خصائص العقدة / الكيان
 * @returns {{ score: number, breakdown: object, compliant: boolean }}
 */
function computeWeight(nodeAttributes = {}) {
    let totalScore     = 0;
    let maxPossible    = 0;
    const breakdown    = {};
    const violations   = [];

    for (const [criterion, meta] of Object.entries(SHARIA_WEIGHTS)) {
        maxPossible += meta.weight;

        // استخراج قيمة المعيار من الخصائص
        const raw = nodeAttributes[criterion];
        let value;

        if (typeof raw === 'boolean') {
            value = raw ? meta.weight : 0;
        } else if (typeof raw === 'number') {
            value = Math.max(0, Math.min(meta.weight, raw));
        } else if (raw === undefined || raw === null) {
            // غياب المعيار = قيمة محايدة (نصف الوزن)
            value = meta.weight * 0.5;
        } else {
            value = meta.weight * 0.5;
        }

        // تطبيق العقوبة عند الانتهاك الصريح
        if (raw === false && meta.penalty < 0) {
            value = 0;
            violations.push({ criterion, nameAr: meta.nameAr, penalty: meta.penalty });
        }

        totalScore       += value;
        breakdown[criterion] = {
            nameAr:   meta.nameAr,
            raw,
            computed: value,
            maxPossible: meta.weight
        };
    }

    const normalizedScore = maxPossible > 0 ? totalScore / maxPossible : 0;
    const compliant       = violations.filter(v => v.penalty <= -0.9).length === 0;

    return {
        score:     Math.max(0, Math.min(1, normalizedScore)),
        breakdown,
        violations,
        compliant,
        computedAt: new Date().toISOString()
    };
}

/**
 * دالة التفعيل الشرعية — Sharia Activation Function
 * تُطبَّق على كل عقدة في الشبكة
 *
 * السلوك:
 *   - إذا كانت الإشارة كائناً: تُثري بالوزن الشرعي
 *   - إذا كانت رقماً: تُضرب في درجة التوافق الشرعي
 *   - إذا وُجدت مخالفة فادحة: تُعاد إشارة صفر (لا تمرير)
 *
 * @param {*} signal
 * @param {NeuralNode} node
 * @returns {*}
 */
function shariaActivation(signal, node) {
    if (!node) return signal;

    const attrs = node.entity
        ? { ...node.entity, ...extractShariaAttrs(node.entity) }
        : {};

    const weightResult = computeWeight(attrs);

    // مخالفة فادحة → إيقاف الإشارة
    if (!weightResult.compliant) {
        return typeof signal === 'number' ? 0 : null;
    }

    if (typeof signal === 'number') {
        return signal * weightResult.score;
    }

    if (typeof signal === 'object' && signal !== null) {
        return {
            ...signal,
            _shariaWeight: weightResult.score,
            _shariaCompliant: weightResult.compliant,
            _shariaViolations: weightResult.violations
        };
    }

    return signal;
}

/** استخراج خصائص شرعية من كيان (سوق / منظمة / ...) */
function extractShariaAttrs(entity) {
    if (!entity) return {};
    const charter = entity.charter || entity._shariaAudit || {};
    return {
        noRiba:        charter.noRiba        !== false,
        noGharar:      charter.noGharar      !== false,
        noGhish:       charter.noGhish       !== false,
        noHarm:        charter.noHarm        !== false,
        mutualConsent: charter.mutualConsent !== false,
        itqan:         entity.itqan          !== false,
        sidq:          entity.sidq           !== false,
        amanah:        entity.amanah         !== false,
        adl:           entity.adl            !== false
    };
}

module.exports = {
    SHARIA_WEIGHTS,
    computeWeight,
    shariaActivation,
    extractShariaAttrs
};
