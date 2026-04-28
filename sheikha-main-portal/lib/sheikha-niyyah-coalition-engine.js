/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * محرك التحالف بالنية والأمان — SHEIKHA NIYYAH COALITION ENGINE v1.0
 * "ستصالحون الروم صلحاً آمناً، وتغزون أنتم وهم عدواً من ورائكم"
 *  — أبو داود 4292، صحّحه الأرناؤوط
 * ═══════════════════════════════════════════════════════════════════════════════
 * المبدأ الأساسي: التحالف يُبنى على النية الخالصة لله ويُطبَّق بضمانات الأمان
 * "إنما الأعمال بالنيات" — البخاري 1، مسلم 1907
 * ═══════════════════════════════════════════════════════════════════════════════
 * للتثقيف الشرعي والمعرفي فقط — لا جزم بتوقيت — العلم عند الله
 * لا يجوز استخدام هذا المحتوى لتبرير أعمال غير مشروعة أو إثارة فتنة
 * ═══════════════════════════════════════════════════════════════════════════════
 * المالك: سلمان أحمد بن سلمان الراجح | 1031605270 | market@sheikha.top
 */
'use strict';

/* ══════════════════════════════════════════════════════════════════════════════
 * ثوابت النية — Niyyah Constants
 * ══════════════════════════════════════════════════════════════════════════════ */
const NIYYAH_LEVELS = {
    LILLAH:       { id: 'LILLAH',       score: 100, label: 'لله وحده',             basis: 'إنما الأعمال بالنيات — البخاري 1' },
    NASRAH_ISLAM: { id: 'NASRAH_ISLAM', score:  95, label: 'نصرة الإسلام',          basis: 'إن تنصروا الله ينصركم — محمد:7' },
    DAFU_ZULM:    { id: 'DAFU_ZULM',   score:  90, label: 'دفع الظلم والعدوان',    basis: 'لا ضرر ولا ضرار — ابن ماجه 2341' },
    HIFZ_NAFS:    { id: 'HIFZ_NAFS',   score:  85, label: 'حفظ النفوس المحترمة',   basis: 'ولا تقتلوا النفس التي حرم الله — الإسراء:33' },
    MASLAHAM:     { id: 'MASLAHAM',     score:  80, label: 'المصلحة المشتركة',       basis: 'وتعاونوا على البر والتقوى — المائدة:2' },
    DUBIOUS:      { id: 'DUBIOUS',      score:  30, label: 'نية مشبوهة — تحتاج مراجعة', basis: 'شاور واستخر — السنة' },
    HARAM:        { id: 'HARAM',        score:   0, label: 'محظور — يُرفض قطعاً',    basis: 'لا ضرر ولا ضرار — ابن ماجه 2341' }
};

const MIN_SAFE_NIYYAH_SCORE = 75; // أدنى درجة مقبولة للتطبيق الآمن

/* ══════════════════════════════════════════════════════════════════════════════
 * مراحل التحالف من الحديث — Coalition Stages from Hadith (أبو داود 4292)
 * ══════════════════════════════════════════════════════════════════════════════ */
const COALITION_STAGES = [
    {
        id: 'CS-01', order: 1,
        nameAr: 'الصلح الآمن مع الروم',
        nameEn: 'Safe Peace with the Romans',
        hadithRef: 'ستصالحون الروم صلحاً آمناً — أبو داود 4292',
        niyyahRequired: ['LILLAH', 'DAFU_ZULM', 'MASLAHAM'],
        safetyChecks: ['لا إكراه في الدين', 'وضوح الشروط', 'احترام هوية الطرفين'],
        quranRef: 'وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ لَهَا — الأنفال:61',
        lesson: 'السلم المشروع خير — والاتفاق على الشروط الواضحة واجب'
    },
    {
        id: 'CS-02', order: 2,
        nameAr: 'الجهاد المشترك ضد العدو من الخلف',
        nameEn: 'Joint Defence Against the Common Enemy',
        hadithRef: 'وتغزون أنتم وهم عدواً من ورائكم — أبو داود 4292',
        niyyahRequired: ['LILLAH', 'NASRAH_ISLAM', 'DAFU_ZULM', 'HIFZ_NAFS'],
        safetyChecks: ['تحديد العدو المشترك بوضوح', 'حماية المدنيين', 'ميثاق مكتوب', 'الهوية الإسلامية خط أحمر'],
        quranRef: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ — الأنفال:60',
        lesson: 'دفع العدو المشترك واجب — التحالف الدفاعي جائز شرعاً بشروطه'
    },
    {
        id: 'CS-03', order: 3,
        nameAr: 'النصر والغنيمة والسلامة',
        nameEn: 'Victory, Spoils and Safety',
        hadithRef: 'فتنصرون وتغنمون وتسلمون — أبو داود 4292',
        niyyahRequired: ['LILLAH', 'NASRAH_ISLAM'],
        safetyChecks: ['توزيع الغنيمة بالعدل', 'الخمس لمستحقيه', 'الوفاء بالعهود بعد النصر'],
        quranRef: 'وَاعْلَمُوا أَنَّمَا غَنِمْتُم مِّن شَيْءٍ فَأَنَّ لِلَّهِ خُمُسَهُ — الأنفال:41',
        lesson: 'النصر من الله — الغنيمة الحلال نعمة يُشكر الله عليها'
    },
    {
        id: 'CS-04', order: 4,
        nameAr: 'خيانة بعض الروم وانتقاض التحالف',
        nameEn: 'Betrayal and Coalition Collapse',
        hadithRef: 'فيرفع رجل من الروم الصليب فيقتله رجل من المسلمين — أبو داود 4292',
        niyyahRequired: ['LILLAH'],
        safetyChecks: ['عدم الانتقام الأعمى', 'محاسبة الفرد لا الجماعة', 'درء الفتنة قبل الانهيار'],
        quranRef: 'وَأَوْفُوا بِالْعَهْدِ إِنَّ الْعَهْدَ كَانَ مَسْؤُولًا — الإسراء:34',
        lesson: 'الوفاء بالعهود واجب — والغدر حرام على المسلمين'
    },
    {
        id: 'CS-05', order: 5,
        nameAr: 'الملحمة الكبرى — الاعماق ودابق',
        nameEn: 'The Great Battle — Al-Amaq and Dabiq',
        hadithRef: 'لا تقوم الساعة حتى ينزل الروم بالأعماق أو بدابق — مسلم 2897',
        niyyahRequired: ['LILLAH', 'NASRAH_ISLAM'],
        safetyChecks: ['الثبات والإيمان', 'عدم الفرار من الجيش', 'حفظ النساء والأطفال'],
        quranRef: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا لَقِيتُمْ فِئَةً فَاثْبُتُوا — الأنفال:45',
        lesson: 'الثبات والتوكل على الله في الملحمة — الجيش الإيماني خير أهل الأرض يومئذ'
    }
];

/* ══════════════════════════════════════════════════════════════════════════════
 * الحديث الأساسي — Foundation Hadith
 * ══════════════════════════════════════════════════════════════════════════════ */
const FOUNDATION_HADITH = {
    id: 'FH-01',
    grade: 'حسن صحيح — صحّحه الأرناؤوط',
    source: 'سنن أبي داود — كتاب الملاحم — حديث 4292',
    narrator: 'ذو مخبر رضي الله عنه',
    text: {
        arabic: 'ستصالحون الروم صلحاً آمناً، وتغزون أنتم وهم عدواً من ورائكم، فتنصرون، وتغنمون، وتسلمون، ثم ترجعون حتى تنزلوا بمرج ذي تلول، فيرفع رجل من أهل الصليب الصليب فيقول: غلب الصليب. فيغضب رجل من المسلمين فيدقّه، فعند ذلك تغدر الروم وتكون الملاحم.',
        meaning: 'صلح آمن + حرب مشتركة ضد عدو ثالث + نصر وغنيمة وسلامة + خيانة بعض الروم + الملاحم الكبرى'
    },
    stages: COALITION_STAGES.map(s => ({ id: s.id, order: s.order, nameAr: s.nameAr })),
    scholarlyNotes: [
        'الروم في الحديث = الغرب الأوروبي المسيحي — اصطلاح نبوي معروف',
        'العدو من الوراء = قوم ثالث مشترك بين المسلمين والروم',
        'الحديث يثبت مشروعية التحالف الدفاعي مع غير المسلمين بشروطه',
        'الخيانة من فرد لا تُنسب لجميع الروم ابتداءً — والمحاسبة على الفرد أولاً',
        'لا جزم بتوقيت — العلم عند الله وحده'
    ]
};

/* ══════════════════════════════════════════════════════════════════════════════
 * قواعد الأمان — Safety Rules
 * ══════════════════════════════════════════════════════════════════════════════ */
const SAFETY_RULES = [
    { id: 'SR-01', rule: 'لا إكراه في الدين',              basis: 'لَا إِكْرَاهَ فِي الدِّينِ — البقرة:256',        blocking: true  },
    { id: 'SR-02', rule: 'لا ضرر ولا ضرار',                basis: 'سنن ابن ماجه 2341 — موطأ مالك',                blocking: true  },
    { id: 'SR-03', rule: 'الوفاء بالعهود واجب',             basis: 'وَأَوْفُوا بِالْعَهْدِ — الإسراء:34',            blocking: true  },
    { id: 'SR-04', rule: 'حماية المدنيين في الحروب',        basis: 'وصايا أبي بكر الصديق للجند',                   blocking: true  },
    { id: 'SR-05', rule: 'الهوية الإسلامية خط أحمر',        basis: 'لَن تَرْضَى عَنكَ الْيَهُودُ — البقرة:120',     blocking: true  },
    { id: 'SR-06', rule: 'الشفافية والوضوح في الاتفاقيات',   basis: 'صلح الحديبية نموذجاً',                         blocking: false },
    { id: 'SR-07', rule: 'الاستشارة قبل القرار الكبير',      basis: 'وَأَمْرُهُمْ شُورَى بَيْنَهُمْ — الشورى:38',   blocking: false }
];

/* ══════════════════════════════════════════════════════════════════════════════
 * المحرك الرئيسي
 * ══════════════════════════════════════════════════════════════════════════════ */
class SheikhaNiyyahCoalitionEngine {
    constructor() {
        this.name      = 'محرك التحالف بالنية والأمان';
        this.nameEn    = 'Sheikha Niyyah Coalition Engine';
        this.version   = '1.0.0';
        this.mode      = 'educational';
        this.owner     = 'سلمان أحمد بن سلمان الراجح — 1031605270';
        this.startedAt = new Date().toISOString();

        this.disclaimer = [
            'هذا المحرك للتثقيف الشرعي والمعرفي فقط — لا يقدم توقيتاً ولا جزماً',
            'العلم بوقت الأحداث عند الله وحده',
            'لا يجوز استخدام هذه المعلومات لتبرير أعمال غير مشروعة أو إثارة فتنة',
            'الواجب: الثبات على الكتاب والسنة والاستعداد بالتقوى والعمل الصالح'
        ];

        // تهيئة البيانات الثابتة
        this._foundationHadith  = FOUNDATION_HADITH;
        this._coalitionStages   = COALITION_STAGES;
        this._niyyahLevels      = NIYYAH_LEVELS;
        this._safetyRules       = SAFETY_RULES;
        this._niyyahHistory     = []; // سجل إعلانات النية
    }

    /* ─── 1. التحقق من النية ────────────────────────────────────────────────── */

    /**
     * validateNiyyah — يتحقق من صحة النية قبل أي عملية تحالف
     * "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى" — البخاري 1
     * @param {string[]} niyyahIds — قائمة النوايا المُعلنة
     * @param {string}   operation — وصف العملية
     * @returns {{ valid: boolean, score: number, details: object }}
     */
    validateNiyyah(niyyahIds = [], operation = 'general') {
        const resolvedNiyyahs = niyyahIds
            .map(id => NIYYAH_LEVELS[String(id).toUpperCase()])
            .filter(Boolean);

        if (resolvedNiyyahs.length === 0) {
            return {
                valid: false,
                score: 0,
                message: '⚠️ لم تُعلن النية — يجب تحديد النية قبل التحالف',
                hadith: 'إنما الأعمال بالنيات — البخاري 1',
                resolvedNiyyahs: [],
                operation
            };
        }

        // رفض فوري إن وجدت نية محرمة
        const haramNiyyah = resolvedNiyyahs.find(n => n.id === 'HARAM');
        if (haramNiyyah) {
            return {
                valid: false,
                score: 0,
                message: '🚫 نية محرمة — يُرفض قطعاً بموجب قاعدة لا ضرر ولا ضرار',
                basis: haramNiyyah.basis,
                resolvedNiyyahs: resolvedNiyyahs.map(n => ({ id: n.id, label: n.label })),
                operation
            };
        }

        // أعلى درجة نية معلنة هي الأساس
        const maxScore = Math.max(...resolvedNiyyahs.map(n => n.score));
        const primaryNiyyah = resolvedNiyyahs.find(n => n.score === maxScore);
        const valid = maxScore >= MIN_SAFE_NIYYAH_SCORE;

        const record = {
            valid,
            score: maxScore,
            message: valid
                ? `✅ النية صحيحة — "${primaryNiyyah.label}" — مقبولة شرعاً`
                : `⚠️ النية ضعيفة (${maxScore}/100) — تحتاج تصحيحاً قبل المضي`,
            primaryNiyyah: { id: primaryNiyyah.id, label: primaryNiyyah.label, basis: primaryNiyyah.basis },
            resolvedNiyyahs: resolvedNiyyahs.map(n => ({ id: n.id, label: n.label, score: n.score })),
            hadith: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى — البخاري 1، مسلم 1907',
            operation,
            timestamp: new Date().toISOString()
        };

        this._niyyahHistory.push(record);
        return record;
    }

    /* ─── 2. التطبيق الآمن ──────────────────────────────────────────────────── */

    /**
     * applySafely — يتحقق من ضمانات الأمان قبل تنفيذ أي عملية تحالف
     * "لا ضرر ولا ضرار" — ابن ماجه 2341
     * @param {string}   stageId    — مرحلة التحالف (CS-01 ... CS-05)
     * @param {string[]} niyyahIds  — النوايا المُعلنة
     * @param {object}   context    — سياق إضافي (اختياري)
     */
    applySafely(stageId, niyyahIds = [], context = {}) {
        // أولاً: التحقق من النية
        const niyyahResult = this.validateNiyyah(niyyahIds, stageId);
        if (!niyyahResult.valid) {
            return {
                allowed: false,
                reason: 'فشل التحقق من النية',
                niyyah: niyyahResult,
                safetyPassed: [],
                safetyFailed: [],
                stage: null,
                quran: 'وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ — الإسراء:36'
            };
        }

        // ثانياً: التحقق من صحة المرحلة
        const stage = COALITION_STAGES.find(s => s.id === stageId.toUpperCase());
        if (!stage) {
            return {
                allowed: false,
                reason: `مرحلة غير معروفة: ${stageId}`,
                validStages: COALITION_STAGES.map(s => s.id),
                niyyah: niyyahResult
            };
        }

        // ثالثاً: التحقق من النوايا المطلوبة للمرحلة
        const declaredIds = niyyahIds.map(id => String(id).toUpperCase());
        const missingNiyyahs = stage.niyyahRequired.filter(req => !declaredIds.includes(req));

        // رابعاً: تطبيق قواعد الأمان
        const safetyPassed = [];
        const safetyFailed = [];

        for (const rule of SAFETY_RULES) {
            const contextKey = rule.rule.toLowerCase();
            // قاعدة حماية المدنيين: يمكن تجاوزها فقط إن صرّح السياق بالحماية
            if (rule.id === 'SR-04' && context.civilianProtectionConfirmed === false) {
                safetyFailed.push({ id: rule.id, rule: rule.rule, basis: rule.basis, blocking: rule.blocking });
            } else {
                safetyPassed.push({ id: rule.id, rule: rule.rule });
            }
        }

        const hasBlockingFailure = safetyFailed.some(r => r.blocking);

        const result = {
            allowed: !hasBlockingFailure && missingNiyyahs.length === 0,
            stageId: stage.id,
            stageName: stage.nameAr,
            niyyah: niyyahResult,
            missingNiyyahs: missingNiyyahs.map(id => NIYYAH_LEVELS[id]),
            safetyPassed,
            safetyFailed,
            stageChecks: stage.safetyChecks,
            quranRef: stage.quranRef,
            hadithRef: stage.hadithRef,
            lesson: stage.lesson,
            timestamp: new Date().toISOString()
        };

        if (result.allowed) {
            result.message = `✅ مُصرَّح بالتطبيق الآمن — المرحلة: "${stage.nameAr}"`;
        } else if (missingNiyyahs.length > 0) {
            result.message = `⚠️ تنقص نوايا مطلوبة للمرحلة: ${missingNiyyahs.join('، ')}`;
        } else {
            result.message = `🚫 فشل فحص الأمان — يُحظر التطبيق`;
        }

        return result;
    }

    /* ─── 3. الحصول على بيانات المحرك ──────────────────────────────────────── */

    getFoundationHadith() {
        return {
            bismillah: 'بسم الله الرحمن الرحيم',
            ...this._foundationHadith,
            disclaimer: this.disclaimer[0]
        };
    }

    getCoalitionStages() {
        return {
            title: 'مراحل التحالف من حديث أبي داود 4292',
            hadithGrade: 'حسن صحيح',
            totalStages: this._coalitionStages.length,
            stages: this._coalitionStages,
            note: 'الترتيب استنباطي — قد يختلف العلماء في التفاصيل — لا جزم بتوقيت'
        };
    }

    getNiyyahLevels() {
        return {
            title: 'درجات النية في التحالف',
            hadith: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى — البخاري 1، مسلم 1907',
            minSafeScore: MIN_SAFE_NIYYAH_SCORE,
            levels: Object.values(this._niyyahLevels).map(n => ({
                id: n.id, label: n.label, score: n.score, basis: n.basis
            }))
        };
    }

    getSafetyRules() {
        return {
            title: 'قواعد الأمان في التحالف',
            principle: 'لا ضرر ولا ضرار — سنن ابن ماجه 2341',
            totalRules: this._safetyRules.length,
            blockingRules: this._safetyRules.filter(r => r.blocking).length,
            rules: this._safetyRules
        };
    }

    getNiyyahHistory() {
        return {
            title: 'سجل إعلانات النية',
            totalDeclarations: this._niyyahHistory.length,
            validDeclarations: this._niyyahHistory.filter(r => r.valid).length,
            history: this._niyyahHistory.slice(-50) // آخر 50 إعلاناً
        };
    }

    getStatus() {
        return {
            success: true,
            name: this.name,
            nameEn: this.nameEn,
            version: this.version,
            mode: this.mode,
            disclaimer: this.disclaimer[0],
            summary: {
                coalitionStages:    this._coalitionStages.length,
                niyyahLevels:       Object.keys(this._niyyahLevels).length,
                safetyRules:        this._safetyRules.length,
                blockingRules:      this._safetyRules.filter(r => r.blocking).length,
                niyyahDeclarations: this._niyyahHistory.length
            },
            apis: [
                'GET  /api/niyyah-coalition/status',
                'GET  /api/niyyah-coalition/dashboard',
                'GET  /api/niyyah-coalition/foundation-hadith',
                'GET  /api/niyyah-coalition/stages',
                'GET  /api/niyyah-coalition/niyyah-levels',
                'GET  /api/niyyah-coalition/safety-rules',
                'GET  /api/niyyah-coalition/niyyah-history',
                'POST /api/niyyah-coalition/validate-niyyah',
                'POST /api/niyyah-coalition/apply-safely'
            ],
            timestamp: new Date().toISOString()
        };
    }

    getDashboard() {
        return {
            bismillah: 'بسم الله الرحمن الرحيم',
            laHawl: 'ولا حول ولا قوة إلا بالله العلي العظيم',
            name: this.name,
            owner: this.owner,
            version: this.version,
            foundationVerse: 'وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ لَهَا وَتَوَكَّلْ عَلَى اللَّهِ — الأنفال:61',
            foundationHadith: 'ستصالحون الروم صلحاً آمناً وتغزون أنتم وهم عدواً من ورائكم — أبو داود 4292',
            niyyahPrinciple: 'إنما الأعمال بالنيات — البخاري 1',
            safetyPrinciple: 'لا ضرر ولا ضرار — ابن ماجه 2341',
            coalitionStages: this._coalitionStages.map(s => ({
                id: s.id, order: s.order, nameAr: s.nameAr, api: `/api/niyyah-coalition/stages`
            })),
            stats: {
                stages:       this._coalitionStages.length,
                niyyahLevels: Object.keys(this._niyyahLevels).length,
                safetyRules:  this._safetyRules.length
            },
            disclaimer: this.disclaimer,
            timestamp: new Date().toISOString()
        };
    }

    getFullReport() {
        return {
            bismillah: 'بسم الله الرحمن الرحيم',
            name: this.name,
            version: this.version,
            owner: this.owner,
            disclaimer: this.disclaimer,
            foundationHadith: this._foundationHadith,
            coalitionStages: this._coalitionStages,
            niyyahLevels: Object.values(this._niyyahLevels),
            safetyRules: this._safetyRules,
            niyyahHistory: this._niyyahHistory.slice(-10),
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = SheikhaNiyyahCoalitionEngine;
