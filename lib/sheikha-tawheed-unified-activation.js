/**
 * بسم الله الرحمن الرحيم
 * ════════════════════════════════════════════════════════════════════
 *  SHEIKHA TAWHEED UNIFIED ACTIVATION — التفعيل الموحد بالكتاب والسنة
 * ════════════════════════════════════════════════════════════════════
 *
 * «قُلْ هُوَ اللَّهُ أَحَدٌ» — التوحيد: أساس كل عملية في المنظومة
 * «إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ» — الإسراء:9
 * «لَا ضَرَرَ وَلَا ضِرَارَ» — حديث صحيح
 * «وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة:275
 *
 * هذه الوحدة تُوحِّد:
 *   1. طبقة الأساس الإسلامية (IFL) — القواعد الصلبة
 *   2. محرك القرآن والسنة — التحقق الشرعي
 *   3. نواة التوحيد — كل عملية تبدأ بالله وتنتهي بحمده
 *   4. الشبكة العصبية الجذرية — خلية الشريعة
 *
 * @version 1.0.0
 * @owner سلمان أحمد بن سلمان الراجح
 */
'use strict';

// ═══ استيراد الطبقات ══════════════════════════════════════════════
let IFL = null;
let quranSunnahEngine = null;
let tawheedCore = null;
let rootNeural = null;

try {
    IFL = require('./sheikha-islamic-foundation-layer');
} catch (e) {
    console.warn('[TAWHEED-UNIFIED] ⚠️  IFL غير متوفر:', e.message);
}

try {
    const SheikhaQuranSunnahEngine = require('./sheikha-quran-sunnah-engine');
    quranSunnahEngine = new SheikhaQuranSunnahEngine();
} catch (e) {
    console.warn('[TAWHEED-UNIFIED] ⚠️  محرك القرآن والسنة غير متوفر:', e.message);
}

try {
    const SheikhaTawheedCore = require('./sheikha-tawheed-core');
    tawheedCore = new SheikhaTawheedCore();
} catch (e) {
    console.warn('[TAWHEED-UNIFIED] ⚠️  نواة التوحيد غير متوفرة:', e.message);
}

try {
    rootNeural = require('./sheikha-root-neural-network');
} catch (e) {
    console.warn('[TAWHEED-UNIFIED] ⚠️  الشبكة العصبية الجذرية غير متوفرة:', e.message);
}

// ═══ مبادئ التوحيد الموحدة ═══════════════════════════════════════
const TAWHEED_PRINCIPLES = Object.freeze({
    // القواعد الحاكمة الصلبة — الكتاب والسنة
    LA_RIBA:    { label: 'لا ربا',          ayah: '«وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة:275' },
    LA_GHARAR:  { label: 'لا غرر',          hadith: '«نَهَى رَسُولُ اللَّهِ ﷺ عَنْ بَيْعِ الْغَرَرِ» — مسلم' },
    LA_GHISH:   { label: 'لا غش',           hadith: '«مَنْ غَشَّنَا فَلَيْسَ مِنَّا» — مسلم' },
    LA_IHTIKAR: { label: 'لا احتكار',        hadith: '«لَا يَحْتَكِرُ إِلَّا خَاطِئٌ» — مسلم' },
    LA_DARAR:   { label: 'لا ضرر ولا ضرار', hadith: '«لَا ضَرَرَ وَلَا ضِرَارَ» — ابن ماجه، صحيح' },
    // التوحيد الأساسي
    TAWHEED:    { label: 'توحيد الله',       ayah: '«قُلْ هُوَ اللَّهُ أَحَدٌ» — الإخلاص:1' },
    BASMALA:    { label: 'بسم الله الرحمن الرحيم', desc: 'كل أمر ذي بال يبدأ بالبسملة' },
    TAWAKKUL:   { label: 'التوكل على الله',  ayah: '«وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ» — الطلاق:3' }
});

// ═══ إحصائيات التفعيل ════════════════════════════════════════════
const stats = {
    activatedAt: new Date().toISOString(),
    totalVerifications: 0,
    halalCount: 0,
    violationCount: 0,
    lastVerification: null
};

// ═══ التحقق الشرعي الكامل — الكتاب والسنة + IFL ═════════════════
/**
 * يُمرَّر أي محتوى (بيانات، عملية تجارية، بكسل)
 * يُعيد: { halal, score, violations, principles, tawheed, basmala, hamd }
 */
function verifyWithQuranSunnah({ content, scope = 'general', operationId = null } = {}) {
    stats.totalVerifications++;

    // البسملة — بداية كل عمل
    const basmala = 'بسم الله الرحمن الرحيم';

    // التحقق من القرآن والسنة
    let quranResult = { halal: true, score: 100, violations: [], principles: [] };
    if (quranSunnahEngine) {
        quranResult = quranSunnahEngine.verify({ content, scope, pixelId: operationId });
    }

    // التحقق من IFL (الطبقة الأساسية الإسلامية)
    let iflResult = { passed: true, violations: [] };
    if (IFL && IFL.enforceHardRules) {
        iflResult = IFL.enforceHardRules(typeof content === 'object' ? content : { text: content });
    }

    // دمج النتائج
    const allViolations = [
        ...quranResult.violations,
        ...iflResult.violations.map(v => v.rule || v.label || v)
    ];
    const uniqueViolations = [...new Set(allViolations)];

    const combinedScore = iflResult.passed
        ? parseFloat(quranResult.score || 100)
        : Math.min(parseFloat(quranResult.score || 100), 50);

    const isHalal = uniqueViolations.length === 0 && combinedScore >= 60 && iflResult.passed;

    // نواة التوحيد — كل عملية تُشهد على التوحيد
    let tawheedStamp = null;
    if (tawheedCore) {
        try {
            const op = tawheedCore.beginWithBasmala(operationId || 'verify');
            tawheedStamp = {
                basmala: tawheedCore.basmala?.arabic,
                shahada: tawheedCore.shahada?.first + ' ' + tawheedCore.shahada?.second,
                operationId: op?.operationId
            };
        } catch (e) { /* تجاهل */ }
    }

    // الحمد — ختم كل عمل بالحمد
    const hamd = 'الحمد لله رب العالمين';

    if (isHalal) stats.halalCount++;
    else stats.violationCount++;
    stats.lastVerification = new Date().toISOString();

    return {
        halal: isHalal,
        score: combinedScore.toFixed(2),
        verdict: isHalal ? 'حلال ✓' : 'يحتاج مراجعة شرعية ✗',
        basmala,
        violations: uniqueViolations,
        principles: [
            ...Object.values(TAWHEED_PRINCIPLES).map(p => p.label),
            ...(quranResult.principles || [])
        ],
        quran: {
            ayah: quranResult.scopeAyah,
            scope
        },
        sunnah: {
            hadith: quranResult.hadith
        },
        ifl: {
            passed: iflResult.passed,
            violations: iflResult.violations
        },
        tawheed: tawheedStamp,
        hamd,
        verifiedAt: new Date().toISOString()
    };
}

// ═══ تفعيل المنظومة بأسرها — الجذر والفروع ══════════════════════
/**
 * يُفعِّل كامل المنظومة: IFL + محرك القرآن + التوحيد + الشبكة العصبية الجذرية
 * يُعيد تقرير التفعيل الكامل
 */
async function activateUnifiedSystem({ region = 'SA', operatorId = 'system' } = {}) {
    const report = {
        basmala: 'بسم الله الرحمن الرحيم',
        shahada: 'أشهد أن لا إله إلا الله وأشهد أن محمدًا رسول الله',
        activatedAt: new Date().toISOString(),
        region,
        operatorId,
        layers: {}
    };

    // الطبقة 0 — القرآن الكريم والسنة النبوية
    report.layers.quranSunnah = quranSunnahEngine
        ? {
            status: 'نشط',
            engine: quranSunnahEngine.name,
            quranSurahs: quranSunnahEngine.quran?.stats?.totalSurahs,
            hadithBooks: quranSunnahEngine.sunnah?.hadithBooks?.length,
            shariaPrinciples: quranSunnahEngine.shariaGuidelines?.principles?.length,
            reference: 'القرآن الكريم + الكتب الستة + مسند أحمد + موطأ مالك'
          }
        : { status: 'غير متوفر' };

    // الطبقة 1 — الطبقة الأساسية الإسلامية (IFL)
    report.layers.ifl = IFL
        ? {
            status: 'نشط',
            version: IFL.version || '1.0.0',
            axioms: IFL.axioms || ['لا ربا', 'لا غرر', 'لا غش', 'لا احتكار', 'لا ضرر ولا ضرار'],
            hardRulesActive: true
          }
        : { status: 'غير متوفر' };

    // الطبقة 2 — نواة التوحيد
    report.layers.tawheed = tawheedCore
        ? {
            status: 'نشط',
            basmala: tawheedCore.basmala?.arabic,
            shahada: tawheedCore.shahada?.first,
            asmaulHusna: tawheedCore.asmaulHusna?.length + ' اسم من أسماء الله الحسنى',
            divineProtection: tawheedCore.divineProtection?.ayatAlKursi?.substring(0, 60) + '...'
          }
        : { status: 'غير متوفر' };

    // الطبقة 3 — الشبكة العصبية الجذرية (خلية الشريعة)
    let neuralSharia = { status: 'غير متوفر' };
    if (rootNeural) {
        try {
            await rootNeural.ensureBooted();
            const cells = rootNeural.cells || rootNeural.getCells?.() || {};
            neuralSharia = {
                status: 'نشط',
                shariaCell: cells.sharia ? 'نشط — التحقق الشرعي اللحظي' : 'غير متوفر',
                riskCell: cells.risk ? 'نشط — تقييم المخاطر' : 'غير متوفر',
                governanceCell: cells.governance ? 'نشط — الحوكمة الإسلامية' : 'غير متوفر',
                totalCells: Object.keys(cells).length
            };
        } catch (e) {
            neuralSharia = { status: 'خطأ في التشغيل', error: e.message };
        }
    }
    report.layers.rootNeural = neuralSharia;

    // التحقق الكامل من مثال
    const testVerify = verifyWithQuranSunnah({
        content: { type: 'test', operation: 'commerce', scope: region },
        scope: 'commerce',
        operationId: 'activation-test'
    });

    report.activationVerification = {
        testResult: testVerify.halal ? 'اجتاز التحقق الشرعي ✓' : 'فشل التحقق ✗',
        score: testVerify.score,
        verdict: testVerify.verdict
    };

    // الإحصائيات
    report.stats = stats;

    // الحمد
    report.hamd = 'الحمد لله الذي بنعمته تتم الصالحات';

    // الطبقة المرجعية الحاكمة
    report.governance = {
        layer0: 'القرآن الكريم + السنة النبوية الصحيحة — الأولوية المطلقة',
        layer1: 'أنظمة المملكة العربية السعودية — الأولوية الثانية',
        layer2: 'قانون دولة التشغيل — مشروط، لا يخالف L0+L1',
        owner: 'سلمان أحمد بن سلمان الراجح — المالك الوحيد'
    };

    return report;
}

// ═══ تصدير الوحدة ════════════════════════════════════════════════
module.exports = Object.freeze({
    verifyWithQuranSunnah,
    activateUnifiedSystem,
    TAWHEED_PRINCIPLES,
    getStats: () => ({ ...stats }),
    isReady: () => !!(quranSunnahEngine || IFL || tawheedCore)
});

console.log('[TAWHEED-UNIFIED] ✅ بسم الله — طبقة التوحيد الموحدة محملة');
console.log('[TAWHEED-UNIFIED]    القرآن + السنة + IFL + التوحيد + الشبكة العصبية — لا ضرر ولا ضرار');
