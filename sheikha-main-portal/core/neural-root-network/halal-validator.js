// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║          HALAL VALIDATOR — محقق الحلال الذكي                               ║
 * ║          يفحص كل معاملة قبل تنفيذها بناءً على الكتاب والسنة               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * «وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة:275
 * «نَهَى رَسُولُ اللَّهِ ﷺ عَنْ بَيْعِ الْغَرَرِ» — مسلم
 *
 * يُوقف أي معاملة تخالف الشريعة قبل تنفيذها تلقائياً.
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */

'use strict';

// ─── Prohibition Rules (من الكتاب والسنة) ────────────────────────────────────

const RULES = [
    {
        id: 'R001', name: 'تحريم الربا',
        quranRef: 'البقرة:275', severity: 'CRITICAL',
        check: tx => tx.interestRate > 0 || tx.riba === true || tx.type === 'LOAN_WITH_INTEREST',
        message: 'المعاملة تتضمن ربا — محظورة بنص القرآن الكريم',
    },
    {
        id: 'R002', name: 'تحريم الغرر',
        quranRef: 'البقرة:275 + مسلم', severity: 'HIGH',
        check: tx => tx.gharar === true || tx.priceUnknown === true || tx.assetUnknown === true,
        message: 'المعاملة تتضمن غرراً (جهالة) — محظورة',
    },
    {
        id: 'R003', name: 'تحريم الغش',
        quranRef: 'البخاري: من غشنا', severity: 'HIGH',
        check: tx => tx.deception === true || tx.falseBacking === true,
        message: 'المعاملة تتضمن غشاً أو تدليساً — محظورة',
    },
    {
        id: 'R004', name: 'اشتراط الملكية في البيع',
        quranRef: 'أبو داود: لا تبع ما ليس عندك', severity: 'HIGH',
        check: tx => tx.sellerOwns === false,
        message: 'البائع لا يملك السلعة — بيع ما لا تملك محظور',
    },
    {
        id: 'R005', name: 'تحريم الاحتكار',
        quranRef: 'مسلم: من احتكر فهو خاطئ', severity: 'MEDIUM',
        check: tx => tx.monopoly === true || (tx.stockQuantity > 0 && tx.intentToMonopolize),
        message: 'المعاملة تنطوي على احتكار — محظور',
    },
    {
        id: 'R006', name: 'تحريم بيع الخمر والمحرمات',
        quranRef: 'البقرة:219', severity: 'CRITICAL',
        check: tx => tx.commodity && ['خمر', 'خنزير', 'ميتة', 'alcohol', 'pork'].includes(
            (tx.commodity || '').toLowerCase()
        ),
        message: 'المعاملة تتعلق بسلعة محرمة — ممنوع تداولها',
    },
    {
        id: 'R007', name: 'اشتراط الشفافية',
        quranRef: 'البقرة:282', severity: 'MEDIUM',
        check: tx => tx.hidden === true || tx.secretFees === true,
        message: 'توجد رسوم أو شروط مخفية — يجب الإفصاح الكامل',
    },
];

// ─── Zakat Check ──────────────────────────────────────────────────────────────

const ZAKAT_NISAB_SAR  = 6000;   // نصاب الزكاة تقريبياً
const ZAKAT_RATE       = 0.025;  // 2.5٪

function checkZakat(balance, currency) {
    if (balance >= ZAKAT_NISAB_SAR) {
        return {
            required: true,
            rate: ZAKAT_RATE,
            amount: parseFloat((balance * ZAKAT_RATE).toFixed(2)),
            nisab: ZAKAT_NISAB_SAR,
            currency,
            message: 'الرصيد بلغ النصاب — الزكاة واجبة بنسبة 2.5٪',
        };
    }
    return { required: false, balance, nisab: ZAKAT_NISAB_SAR };
}

// ─── Main Validation ──────────────────────────────────────────────────────────

/**
 * التحقق الشرعي الكامل من معاملة
 * @param {object} tx — كائن المعاملة
 * @returns {object} — نتيجة التحقق
 */
function validate(tx) {
    const violations = [];
    const warnings   = [];

    for (const rule of RULES) {
        try {
            if (rule.check(tx)) {
                if (rule.severity === 'CRITICAL' || rule.severity === 'HIGH') {
                    violations.push({
                        ruleId:    rule.id,
                        name:      rule.name,
                        severity:  rule.severity,
                        quranRef:  rule.quranRef,
                        message:   rule.message,
                    });
                } else {
                    warnings.push({
                        ruleId:   rule.id,
                        name:     rule.name,
                        severity: rule.severity,
                        message:  rule.message,
                    });
                }
            }
        } catch (_) {}
    }

    const isHalal   = violations.length === 0;
    const hasWarn   = warnings.length > 0;

    return {
        isHalal,
        verdict: isHalal ? (hasWarn ? 'HALAL_WITH_WARNINGS' : 'HALAL') : 'HARAM',
        violations,
        warnings,
        rulesChecked: RULES.length,
        checkedAt: new Date().toISOString(),
        shariahNote: isHalal
            ? 'المعاملة متوافقة مع أحكام الشريعة الإسلامية'
            : 'المعاملة مرفوضة — تخالف أحكام الشريعة',
    };
}

/**
 * فحص سريع — يُعيد true إذا كانت المعاملة حلالاً
 */
function isHalal(tx) {
    return validate(tx).isHalal;
}

/**
 * فحص مجموعة معاملات دفعةً واحدة
 */
function validateBatch(transactions) {
    return transactions.map((tx, i) => ({
        index: i,
        txId: tx.id || `tx-${i}`,
        result: validate(tx),
    }));
}

module.exports = { validate, isHalal, validateBatch, checkZakat, RULES, ZAKAT_RATE, ZAKAT_NISAB_SAR };
