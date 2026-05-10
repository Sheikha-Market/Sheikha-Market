'use strict';
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║          🕌 SHEIKHA ISLAMIC FOUNDATION LAYER (IFL)                         ║
 * ║          الطبقة الأساسية الحاكمة الإسلامية — طبقة الجذر                    ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Stack Position:                                                            ║
 * ║   Hardware                                                                  ║
 * ║    └─ Linux Kernel (Ubuntu)                                                 ║
 * ║        └─ Systemd / Network / OS                                            ║
 * ║            └─ ★ IFL — هذه الطبقة ★  (تعمل فوق OS مباشرة)                 ║
 * ║                └─ Sheikha Guardian + Control Plane + Neural                 ║
 * ║                    └─ Express App + API Routes + Market                     ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  المرجعية الحاكمة العليا (لا تتغير بتغير الموقع أو الزمن):                 ║
 * ║    الطبقة 0: القرآن الكريم + السنة النبوية الصحيحة                         ║
 * ║    الطبقة 1: أنظمة المملكة العربية السعودية + قرارات ولي الأمر              ║
 * ║    الطبقة 2: قانون دولة التشغيل (مشروط — لا يخالف الطبقتين أعلاه)         ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  القواعد الحاكمة الصلبة (hard-wired — لا override):                        ║
 * ║    • لا ربا  • لا غرر  • لا غش  • لا احتكار  • لا ضرر ولا ضرار            ║
 * ║    • لا طاعة لمخلوق في معصية الخالق                                         ║
 * ║    • «إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ» — الحجرات:13          ║
 * ║    • «وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ» — الأنفال:60      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const os = require('os');

// ═══ ثوابت حاكمة صلبة ═══════════════════════════════════════════════════════
const IFL_VERSION = '1.0.0';
const IFL_BOOT_AT = new Date().toISOString();
const IFL_OWNER = 'سلمان أحمد سلمان الراجح';

const IFL_AXIOMS = Object.freeze({
    LA_RIBA: 'لا ربا',
    LA_GHARAR: 'لا غرر',
    LA_GHISH: 'لا غش',
    LA_IHTIKAR: 'لا احتكار',
    LA_DARAR: 'لا ضرر ولا ضرار',
    LA_TAAA: 'لا طاعة لمخلوق في معصية الخالق',
    TAQWA_STANDARD: '«إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ» — الحجرات:13',
    STRENGTH_MANDATE: '«وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ» — الأنفال:60'
});

// ═══ مصادر المرجعية الحاكمة ══════════════════════════════════════════════════
const IFL_REFERENCE_SOURCES = Object.freeze([
    { layer: 0, name: 'القرآن الكريم',                      priority: 'الأعلى — دائماً' },
    { layer: 0, name: 'السنة النبوية الصحيحة',               priority: 'الأعلى — دائماً' },
    { layer: 1, name: 'أنظمة المملكة العربية السعودية',       priority: 'الثاني — دائماً' },
    { layer: 1, name: 'قرارات ولي الأمر في المعروف',          priority: 'الثاني — دائماً' },
    { layer: 2, name: 'قانون دولة التشغيل',                   priority: 'مشروط — إن لم يخالف L0+L1' }
]);

// ═══ كشف بيئة التشغيل ════════════════════════════════════════════════════════
function detectRuntimeEnvironment() {
    const runtimeCountry = (
        process.env.SHEIKHA_RUNTIME_COUNTRY ||
        process.env.DEPLOYMENT_COUNTRY ||
        process.env.HOST_COUNTRY ||
        'SA'
    ).toUpperCase().trim();

    const neutralGccCountries = new Set(['AE', 'BH', 'KW', 'OM', 'QA']);

    return {
        runtimeCountry,
        homeCountry: 'SA',
        outsideSaudi: runtimeCountry !== 'SA',
        localLawActive: runtimeCountry !== 'SA' && neutralGccCountries.has(runtimeCountry),
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        nodeVersion: process.version,
        pid: process.pid
    };
}

// ═══ التحقق من القواعد الحاكمة الصلبة ════════════════════════════════════════
// تستقبل `context` بصيغة { riba, gharar, ghish, ihtikar, darar }
// تُعيد { passed, violations }
function enforceHardRules(context = {}) {
    const violations = [];

    const prohibitedPatterns = [
        { key: 'riba',    label: IFL_AXIOMS.LA_RIBA,    match: /ربوي|interest.?bearing|riba/i },
        { key: 'gharar',  label: IFL_AXIOMS.LA_GHARAR,  match: /غرر\s*فاحش|gharar|uncertainty.?excessive/i },
        { key: 'ghish',   label: IFL_AXIOMS.LA_GHISH,   match: /غش\s*متعمد|fraud|deception/i },
        { key: 'ihtikar', label: IFL_AXIOMS.LA_IHTIKAR, match: /احتكار\s*إلزامي|monopoly.?forced/i }
    ];

    const inputStr = JSON.stringify(context).toLowerCase();

    for (const rule of prohibitedPatterns) {
        if (rule.match.test(inputStr)) {
            violations.push({ rule: rule.label, key: rule.key });
        }
    }

    return {
        passed: violations.length === 0,
        violations,
        axioms: IFL_AXIOMS
    };
}

// ═══ دالة التحقق من التوافق الجغرافي-السيادي ═══════════════════════════════
function sovereignCheck({ targetCountry } = {}) {
    const target = (targetCountry || 'SA').toUpperCase().trim();
    const env = detectRuntimeEnvironment();
    const reasons = [];

    // الموقف الرسمي السعودي — يُطبَّق افتراضياً ما لم يوجد تفويض تنظيمي صريح
    if (env.homeCountry === 'SA' && target === 'IL') {
        reasons.push('يتطلب تفويضاً تنظيمياً سيادياً صريحاً من الجهات السعودية المختصة قبل التنفيذ.');
    }

    return {
        approved: reasons.length === 0,
        reasons,
        homeCountry: env.homeCountry,
        runtimeCountry: env.runtimeCountry,
        targetCountry: target,
        legalLayerNote: env.localLawActive
            ? `القانون المحلي (${env.runtimeCountry}) مفعّل مشروطاً — لا يخالف الشريعة ولا أنظمة المملكة.`
            : 'القانون المحلي خارج نطاق التفعيل المشروط أو أن التشغيل داخل المملكة.'
    };
}

// ═══ Bootstrap — يُنفَّذ فور تحميل هذه الوحدة ════════════════════════════════
function boot() {
    const env = detectRuntimeEnvironment();

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║     🕌 SHEIKHA ISLAMIC FOUNDATION LAYER — تفعيل الطبقة الأساسية     ║');
    console.log('╠══════════════════════════════════════════════════════════════════════╣');
    console.log(`║  بسم الله الرحمن الرحيم                                              ║`);
    console.log(`║  IFL v${IFL_VERSION}  |  PID: ${String(env.pid).padEnd(6)}  |  ${env.nodeVersion.padEnd(10)}      ║`);
    console.log(`║  Platform: ${env.platform}/${env.arch}  |  Host: ${env.hostname.slice(0,20).padEnd(20)} ║`);
    console.log('╠══════════════════════════════════════════════════════════════════════╣');
    console.log('║  المرجعية الحاكمة (لا تتغير بتغير الموقع أو الزمن):                ║');
    for (const src of IFL_REFERENCE_SOURCES) {
        const badge = src.layer === 0 ? '★' : src.layer === 1 ? '◆' : '◇';
        console.log(`║   ${badge} L${src.layer}: ${src.name.padEnd(40)}║`);
    }
    console.log('╠══════════════════════════════════════════════════════════════════════╣');
    console.log('║  القواعد الحاكمة الصلبة (hard-wired):                               ║');
    console.log('║   • لا ربا  • لا غرر  • لا غش  • لا احتكار  • لا ضرر ولا ضرار    ║');
    console.log('║   • لا طاعة لمخلوق في معصية الخالق                                   ║');
    console.log('╠══════════════════════════════════════════════════════════════════════╣');

    const runtimeStatus = env.outsideSaudi
        ? (env.localLawActive
            ? `⚠  خارج المملكة — Q. محلي ${env.runtimeCountry} مفعّل مشروطاً`
            : `⚠  خارج المملكة (${env.runtimeCountry}) — القانون المحلي غير مفعّل`)
        : '✅ داخل المملكة العربية السعودية — الطبقتان L0+L1 نافذتان';

    console.log(`║  بيئة التشغيل: ${runtimeStatus.padEnd(54)} ║`);
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log('');
}

// تشغيل الـ boot فور التحميل
boot();

// ═══ واجهة تصدير الوحدة ══════════════════════════════════════════════════════
module.exports = Object.freeze({
    IFL_VERSION,
    IFL_BOOT_AT,
    IFL_OWNER,
    IFL_AXIOMS,
    IFL_REFERENCE_SOURCES,
    detectRuntimeEnvironment,
    enforceHardRules,
    sovereignCheck,
    // تُستخدم داخل selfComplianceMiddleware كمرجع موثوق
    LAYER_0: 'الشريعة الإسلامية — القرآن الكريم + السنة النبوية الصحيحة',
    LAYER_1: 'أنظمة المملكة العربية السعودية + قرارات ولي الأمر في المعروف',
    LAYER_2: 'قانون دولة التشغيل — مشروط بعدم مخالفة L0 أو L1',
    GOVERNANCE_STACK: Object.freeze([
        'Hardware',
        'Linux Kernel (Ubuntu)',
        'Systemd / Network / OS',
        'Sheikha IFL — الطبقة الأساسية الحاكمة الإسلامية',
        'Sheikha Guardian + Control Plane + Neural',
        'Express App + API Routes + Market'
    ])
});
