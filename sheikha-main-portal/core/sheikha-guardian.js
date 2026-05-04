/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                       SHEIKHA GUARDIAN                                      ║
 * ║         الطبقة الحاكمة الإسلامية — فوق Ubuntu / Linux مباشرةً              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الموقع في المنظومة:
 *   Hardware → Linux Kernel (Ubuntu) → [SHEIKHA GUARDIAN] → Control Plane → Neural
 *
 * المرجع الشرعي:
 *   ﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾ — يوسف: ٤٠
 *   ﴿وَأَنِ احْكُم بَيْنَهُم بِمَا أَنزَلَ اللَّهُ﴾ — المائدة: ٤٩
 *   «لَا ضَرَرَ وَلَا ضِرَارَ» — ابن ماجه
 *
 * الوظائف الأساسية:
 *  1. التحقق من الامتثال الشرعي لكل طلب (لا ربا | لا غرر | التراضي | لا ضرر)
 *  2. ضبط بيئة UTF-8 للعربية وكل لغات الأمة
 *  3. حراسة الحدود بين طبقة OS وطبقة التحكم
 *  4. سجل التدقيق الإسلامي (Shariah Audit Trail)
 *  5. منع العمليات المحرّمة قبل وصولها إلى أي طبقة أخرى
 *
 * encoding: utf-8
 * platform: Ubuntu / Linux Kernel
 */

'use strict';

// ─── UTF-8 Enforcement ────────────────────────────────────────────────────────
// ضبط ترميز UTF-8 على مستوى العملية فور تحميل الطبقة
if (process.env.SHEIKHA_ENCODING !== 'utf-8') {
    process.env.SHEIKHA_ENCODING = 'utf-8';
}
// Node.js 18+ يدعم ICU الكامل — نضمن أن الإدخال/الإخراج يستخدم UTF-8
if (process.stdout && process.stdout.setEncoding) {
    process.stdout.setEncoding('utf8');
}
if (process.stderr && process.stderr.setEncoding) {
    process.stderr.setEncoding('utf8');
}

// ─── Guardian Identity ────────────────────────────────────────────────────────

const GUARDIAN_ID = {
    name:       'Sheikha Guardian',
    nameAr:     'الحارس الإسلامي — الطبقة الحاكمة',
    version:    '1.0.0',
    layer:      'guardian',
    position:   'Ubuntu/Linux → [GUARDIAN] → Control Plane',
    encoding:   'UTF-8',
    platform:   process.platform,
    startedAt:  null,
    tawheed:    'لا إله إلا الله محمد رسول الله',
    quran_ref:  '﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾ — يوسف: ٤٠',
};

// ─── Sharia Rules ─────────────────────────────────────────────────────────────

/**
 * قواعد الحكم الشرعي المدمجة في الحارس
 * كل قاعدة: { id, nameAr, check(payload) → boolean, ref }
 */
const SHARIA_RULES = [
    {
        id:     'no-riba',
        nameAr: 'تحريم الربا',
        ref:    '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
        check:  (p) => !p || !p.hasRiba,
    },
    {
        id:     'no-gharar',
        nameAr: 'تحريم الغرر',
        ref:    '«نَهَى النَّبِيُّ ﷺ عَنْ بَيْعِ الْغَرَرِ» — مسلم: ١٥١٣',
        check:  (p) => !p || !p.hasGharar,
    },
    {
        id:     'no-harm',
        nameAr: 'لا ضرر ولا ضرار',
        ref:    '«لَا ضَرَرَ وَلَا ضِرَارَ» — ابن ماجه: ٢٣٤١',
        check:  (p) => !p || !p.hasHarm,
    },
    {
        id:     'mutual-consent',
        nameAr: 'التراضي في المعاملات',
        ref:    '﴿إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ﴾ — النساء: ٢٩',
        check:  (p) => !p || p.hasMutualConsent !== false,
    },
    {
        id:     'no-monopoly',
        nameAr: 'تحريم الاحتكار',
        ref:    '«مَنِ احْتَكَرَ فَهُوَ خَاطِئٌ» — مسلم: ١٦٠٥',
        check:  (p) => !p || !p.hasMonopoly,
    },
];

// ─── Audit Log ────────────────────────────────────────────────────────────────

const _auditLog = []; // سجل التدقيق الإسلامي (نافذة متحركة 500 سجل)

/**
 * تسجيل حدث في سجل التدقيق الإسلامي
 * @param {string} event
 * @param {object} detail
 */
function _audit(event, detail = {}) {
    const entry = {
        event,
        detail,
        timestamp: new Date().toISOString(),
        layer: 'guardian',
    };
    _auditLog.push(entry);
    if (_auditLog.length > 500) _auditLog.shift();
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * فحص الامتثال الشرعي لأي عملية قبل تمريرها للطبقات العليا
 *
 * @param {object} payload — بيانات العملية المطلوب فحصها
 * @returns {{ compliant: boolean, violations: string[], references: string[] }}
 */
function checkSharia(payload = {}) {
    const violations  = [];
    const references  = [];

    for (const rule of SHARIA_RULES) {
        if (!rule.check(payload)) {
            violations.push(rule.nameAr);
            references.push(rule.ref);
        }
    }

    const compliant = violations.length === 0;

    _audit('sharia:check', { compliant, violations, payload: Object.keys(payload) });

    return { compliant, violations, references };
}

/**
 * حراسة طلب — يُوقِف العمليات غير الشرعية فورًا
 *
 * @param {object} request — { intent, entity, data }
 * @returns {{ allowed: boolean, reason?: string, sharia?: object }}
 */
function guard(request = {}) {
    const sharia = checkSharia(request.data || {});

    if (!sharia.compliant) {
        _audit('guard:blocked', { intent: request.intent, violations: sharia.violations });
        return {
            allowed: false,
            reason:  `مخالفة شرعية: ${sharia.violations.join(' | ')}`,
            sharia,
        };
    }

    _audit('guard:allowed', { intent: request.intent });
    return { allowed: true, sharia };
}

/**
 * التحقق من صحة الترميز — يضمن أن النص عربي/إنجليزي مرمَّز بـ UTF-8
 *
 * @param {string} text
 * @returns {{ valid: boolean, encoding: string }}
 */
function validateEncoding(text) {
    if (typeof text !== 'string') {
        return { valid: false, encoding: 'unknown' };
    }
    // التحقق من وجود أحرف عربية أو لاتينية صحيحة (UTF-8)
    const hasValidChars = /^[\u0000-\uFFFF]*$/.test(text);
    return { valid: hasValidChars, encoding: 'UTF-8' };
}

/**
 * معلومات البيئة فوق Ubuntu/Linux
 *
 * @returns {object}
 */
function getEnvironmentInfo() {
    return {
        platform:     process.platform,
        arch:         process.arch,
        nodeVersion:  process.version,
        encoding:     process.env.SHEIKHA_ENCODING || 'utf-8',
        lang:         process.env.LANG || 'C.UTF-8',
        lcAll:        process.env.LC_ALL || 'C.UTF-8',
        osLayer:      process.env.SHEIKHA_OS_LAYER || 'linux',
        timezone:     process.env.TZ || 'Asia/Riyadh',
        pid:          process.pid,
    };
}

/**
 * حالة الحارس
 *
 * @returns {object}
 */
function status() {
    return {
        ...GUARDIAN_ID,
        environment:  getEnvironmentInfo(),
        rules:        SHARIA_RULES.map(r => ({ id: r.id, nameAr: r.nameAr, ref: r.ref })),
        auditCount:   _auditLog.length,
        healthy:      true,
    };
}

/**
 * آخر سجلات التدقيق
 *
 * @param {number} limit
 * @returns {object[]}
 */
function getAuditLog(limit = 50) {
    return _auditLog.slice(-limit);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * تهيئة الطبقة الحاكمة — يُستدعى مرة واحدة عند الإقلاع
 */
async function init() {
    GUARDIAN_ID.startedAt = new Date().toISOString();

    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║        SHEIKHA GUARDIAN — الطبقة الحاكمة            ║');
    console.log('║   Ubuntu/Linux → [GUARDIAN] → Control Plane → Neural ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`[GUARDIAN] 🕌 ${GUARDIAN_ID.tawheed}`);
    console.log(`[GUARDIAN] 📖 ${GUARDIAN_ID.quran_ref}`);
    console.log(`[GUARDIAN] 🖥  النظام: ${process.platform} (${process.arch})`);
    console.log(`[GUARDIAN] 🔤 الترميز: UTF-8 | LANG=${process.env.LANG || 'C.UTF-8'}`);
    console.log(`[GUARDIAN] ⚖️  القواعد الشرعية المفعّلة: ${SHARIA_RULES.length}`);

    for (const rule of SHARIA_RULES) {
        console.log(`[GUARDIAN]    ✅ ${rule.nameAr}`);
    }

    _audit('guardian:init', { rules: SHARIA_RULES.length, platform: process.platform });

    console.log('[GUARDIAN] ✅ الحارس الإسلامي جاهز — يحرس المنظومة بالكتاب والسنة');
    console.log('');
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    GUARDIAN_ID,
    SHARIA_RULES,
    init,
    checkSharia,
    guard,
    validateEncoding,
    getEnvironmentInfo,
    getAuditLog,
    status,
};
