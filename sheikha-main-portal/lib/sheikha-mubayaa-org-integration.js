/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🤝🧠🏛️ محرك تكامل البيعة في المنظومة الكاملة
 *  Sheikha Mubayaa — Full Organization + Root Neural Integration Engine
 *
 *  "يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ
 *   وَأُولِي الْأَمْرِ مِنكُمْ" — النساء: ٥٩
 *
 *  هذا المحرك يُنشئ الربط الحي بين:
 *    ① الشبكة العصبية الجذرية للمبايعة (mubayaa-neural-root)
 *    ② الحاكمة العليا (sheikha-sovereign-governor)
 *    ③ الشبكة العصبية الجامعة (LogicNeuralNetwork)
 *    ④ نماذج المنظمات (Organization)
 *    ⑤ جذر المنظومة (sheikha-root)
 *
 *  مبادئ التشغيل:
 *    • البيعة لله أولاً ثم لولاة الأمر (الملك سلمان بن عبدالعزيز)
 *    • النصرة: نصرة الله ونصرة الإسلام ونصرة الملك سلمان لله
 *    • النية: كل عملية تُزكّى بالنية الصالحة لوجه الله
 *    • الجذر: البيعة مدفوعة حتى جذور النظام — لا طبقة تعمل بدونها
 *
 *  المحركات الفرعية:
 *    NiyyahEngine     — محرك النية (كل عملية لها نية قبل التنفيذ)
 *    BayahTracker     — متتبع البيعة عبر كل المنظومة
 *    OrgBayahBridge   — جسر البيعة للمنظمات
 *    NasrahEngine     — محرك النصرة (الله، الإسلام، ولاة الأمر)
 *
 *  المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');

// ─── استيراد الشبكة العصبية الجذرية للمبايعة ───────────────────────────────
let _neuralRoot = null;
try {
    _neuralRoot = require('./mubayaa-neural-root');
} catch (_) {}

// ─── استيراد الحاكمة العليا ──────────────────────────────────────────────────
let _sovereign = null;
try {
    _sovereign = require('../core/sheikha-sovereign-governor');
} catch (_) {}

// ─── استيراد جذر المنظومة ────────────────────────────────────────────────────
let _sheikhaRoot = null;
try {
    _sheikhaRoot = require('../core/sheikha-root');
} catch (_) {}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. NIYYAH ENGINE — محرك النية
//    "إنما الأعمال بالنيات" — صحيح البخاري
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * مستويات النية وأوزانها العصبية
 */
const NIYYAH_LEVELS = {
    LILLAH:      { id: 'lillah',      ar: 'لله وحده',              weight: 1.00, quran: 'الإخلاص ١' },
    SUNNAH:      { id: 'sunnah',      ar: 'اتباعاً للسنة النبوية', weight: 0.97, quran: 'الحشر ٧' },
    NASR_ISLAM:  { id: 'nasr_islam',  ar: 'نصرةً للإسلام لله',     weight: 0.95, quran: 'الصف ١٤' },
    NASR_WALI:   { id: 'nasr_wali',   ar: 'نصرةً لولي الأمر لله',  weight: 0.93, quran: 'النساء ٥٩' },
    BAYAH:       { id: 'bayah',       ar: 'وفاءً بالبيعة لله',     weight: 0.92, quran: 'الفتح ١٠' },
    ISLAH:       { id: 'islah',       ar: 'إصلاحاً في الأرض',      weight: 0.88, quran: 'هود ٨٨' },
    NAFAA:       { id: 'nafaa',       ar: 'نفعاً للمسلمين',        weight: 0.85, quran: 'حديث الطبراني' },
    TAQWA:       { id: 'taqwa',       ar: 'تقوىً وطاعةً لله',      weight: 0.90, quran: 'البقرة ١٩٧' },
    AMANAH:      { id: 'amanah',      ar: 'أداءً للأمانة',         weight: 0.87, quran: 'النساء ٥٨' },
};

class NiyyahEngine {
    constructor() {
        this.declarations = []; // سجل كل الإعلانات
        this._maxLog = 500;
    }

    /**
     * إعلان النية قبل أي عملية
     * @param {string} operationType  - نوع العملية
     * @param {string[]} niyyahIds    - قائمة أغراض النية
     * @param {object}  meta          - بيانات إضافية
     * @returns {{ score, niyyat, basmala }}
     */
    declare(operationType = '', niyyahIds = ['lillah'], meta = {}) {
        const niyyat = niyyahIds
            .map(id => NIYYAH_LEVELS[id.toUpperCase()] || NIYYAH_LEVELS.LILLAH)
            .filter(Boolean);

        // الوزن الكلي = متوسط موزون لأعلى 3 نوايا
        const topThree = [...niyyat].sort((a, b) => b.weight - a.weight).slice(0, 3);
        const score    = topThree.reduce((s, n) => s + n.weight, 0) / Math.max(topThree.length, 1);

        const record = {
            id:        `NYA-${Date.now().toString(36)}`,
            operation: operationType,
            niyyat:    niyyat.map(n => ({ id: n.id, ar: n.ar, weight: n.weight })),
            score:     +score.toFixed(4),
            basmala:   'بسم الله الرحمن الرحيم',
            tawheed:   'لا إله إلا الله محمد رسول الله',
            declaredAt: new Date().toISOString(),
            ...meta
        };

        this.declarations.push(record);
        if (this.declarations.length > this._maxLog) this.declarations.shift();

        return record;
    }

    /**
     * أعلى النوايا الشرعية لعمل منظومة شيخة — للاستخدام الافتراضي
     */
    get sheikhaDefaultNiyyah() {
        return this.declare('sheikha-system-operation', [
            'LILLAH', 'NASR_ISLAM', 'NASR_WALI', 'BAYAH', 'TAQWA'
        ], { source: 'sheikha-system' });
    }

    last(n = 10) {
        return this.declarations.slice(-n);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. BAYAH TRACKER — متتبع البيعة عبر كل المنظومة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * الولي الأمر الحاكم — الملك سلمان بن عبدالعزيز آل سعود
 */
const WALI_AL_AMR = {
    name:    'الملك سلمان بن عبدالعزيز آل سعود',
    nameEn:  'King Salman bin Abdulaziz Al Saud',
    title:   'خادم الحرمين الشريفين',
    titleEn: 'Custodian of the Two Holy Mosques',
    country: 'المملكة العربية السعودية',
    bayahQuran:  'النساء ٥٩',
    bayahHadith: 'من خلع يداً من طاعة لقي الله يوم القيامة لا حجة له — صحيح مسلم',
    nasrahQuran: 'الصف ١٤',  // "كونوا أنصار الله"
    nasrahPrinciple: 'نصرة ولي الأمر نصرةً لله لا لذاته'
};

class BayahTracker extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(100);

        // السجل المحلي للبيعات داخل النظام
        this._pledges    = new Map(); // subjectKey → { pledgedAt, score, neuralAnalysis }
        this._nasrahLog  = [];        // سجل النصرة
        this.waliAlAmr   = WALI_AL_AMR;

        this.stats = {
            totalPledges:  0,
            totalNasrah:   0,
            avgBayahScore: 0,
            activePledges: 0,
        };
    }

    /**
     * تسجيل بيعة كيان في المنظومة
     * @param {string} subjectKey   - مفتاح الكيان (طبقة / محرك / منظمة / مستخدم)
     * @param {string} subjectType  - نوع الكيان
     * @param {object} pledgeData   - بيانات البيعة
     */
    registerPledge(subjectKey, subjectType, pledgeData = {}) {
        let neuralAnalysis = null;
        if (_neuralRoot) {
            try {
                neuralAnalysis = _neuralRoot.analyze({
                    fullName:    pledgeData.name || subjectKey,
                    tribe:       pledgeData.tribe || null,
                    nationality: pledgeData.nationality || 'SA',
                    madhhab:     pledgeData.madhhab || null,
                    agreed:      true,
                    pledgedAt:   new Date().toISOString()
                });
            } catch (_) {}
        }

        const score = neuralAnalysis ? neuralAnalysis.composite : 0.9;

        const pledge = {
            subjectKey,
            subjectType,
            name:           pledgeData.name || subjectKey,
            pledgedAt:      new Date().toISOString(),
            score,
            neuralAnalysis,
            waliAlAmr:      WALI_AL_AMR.name,
            text:           `نبايع ${WALI_AL_AMR.name} على السمع والطاعة في المعروف، ونناصر الملك والدولة لله سبحانه وتعالى، على كتاب الله وسنة نبيه محمد ﷺ.`,
            quranRef:       'النساء: ٥٩',
            status:         'active'
        };

        this._pledges.set(subjectKey, pledge);
        this.stats.totalPledges++;
        this.stats.activePledges = this._pledges.size;
        this.stats.avgBayahScore = (
            (this.stats.avgBayahScore * (this.stats.totalPledges - 1) + score) /
            this.stats.totalPledges
        );

        this.emit('pledge:registered', { subjectKey, subjectType, score });
        console.log(`[BAYAH] ✅ بيعة مُسجَّلة: ${pledge.name} (${subjectType}) — نقاط: ${(score * 100).toFixed(0)}%`);

        return pledge;
    }

    /**
     * إعلان النصرة — نصرة الله ونصرة الإسلام ونصرة ولي الأمر لله
     * @param {string} subjectKey
     * @param {'ALLAH'|'ISLAM'|'WALI_AMR'} nasrahTarget
     */
    declareNasrah(subjectKey, nasrahTarget = 'ALLAH') {
        const targets = {
            ALLAH:    { ar: 'نصرة الله', quran: 'الصف ١٤',   principle: 'إِن تَنصُرُوا اللَّهَ يَنصُرْكُمْ' },
            ISLAM:    { ar: 'نصرة الإسلام', quran: 'التوبة ٣٣', principle: 'لِيُظْهِرَهُ عَلَى الدِّينِ كُلِّهِ' },
            WALI_AMR: { ar: `نصرة ${WALI_AL_AMR.name} لله`, quran: 'النساء ٥٩', principle: 'نصرة ولي الأمر نصرةً لله' }
        };

        const target  = targets[nasrahTarget] || targets.ALLAH;
        const record  = {
            id:         `NSR-${Date.now().toString(36)}`,
            subjectKey,
            target:     nasrahTarget,
            ar:         target.ar,
            quran:      target.quran,
            principle:  target.principle,
            declaredAt: new Date().toISOString()
        };

        this._nasrahLog.push(record);
        if (this._nasrahLog.length > 200) this._nasrahLog.shift();
        this.stats.totalNasrah++;

        this.emit('nasrah:declared', record);
        return record;
    }

    getPledge(subjectKey) {
        return this._pledges.get(subjectKey) || null;
    }

    hasPledge(subjectKey) {
        const p = this._pledges.get(subjectKey);
        return p && p.status === 'active';
    }

    getBayahScore(subjectKey) {
        const p = this._pledges.get(subjectKey);
        return p ? p.score : 0;
    }

    allPledges() {
        return Array.from(this._pledges.values());
    }

    status() {
        return {
            waliAlAmr:     this.waliAlAmr,
            stats:         this.stats,
            activePledges: this.allPledges().filter(p => p.status === 'active').length,
            lastNasrah:    this._nasrahLog.slice(-5)
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ORG BAYAH BRIDGE — جسر البيعة للمنظمات
// ═══════════════════════════════════════════════════════════════════════════════

class OrgBayahBridge {

    /**
     * تحليل بيعة منظمة وتزكيتها
     * @param {object} org - كائن المنظمة
     * @param {BayahTracker} tracker
     * @returns {object} نتيجة التحليل
     */
    static analyze(org, tracker) {
        if (!org) return { valid: false, reason: 'منظمة غير موجودة' };

        // تحقق من الميثاق الشرعي
        const charter = org.shariaCharter || {};
        const shariaOk = charter.acceptsKitabAndSunnah &&
                         charter.noRiba && charter.noGharar &&
                         charter.noGhish && charter.noIhtikar && charter.noDarar;

        // تحليل شبكة البيعة العصبية
        let neuralResult = null;
        if (_neuralRoot) {
            try {
                neuralResult = _neuralRoot.analyze({
                    fullName:    org.nameAr || org.name || 'منظمة',
                    tribe:       org.sector || null,
                    nationality: org.contact?.country === 'السعودية' ? 'SA' : 'OTHER',
                    agreed:      true,
                    pledgedAt:   org.createdAt || new Date().toISOString()
                });
            } catch (_) {}
        }

        // تحليل النية
        const niyyahLevel = org.niyyah || 'LILLAH';
        const niyyahData  = NIYYAH_LEVELS[niyyahLevel] || NIYYAH_LEVELS.LILLAH;

        // تسجيل البيعة
        const pledge = tracker.registerPledge(org.id, 'organization', {
            name: org.nameAr || org.name,
            nationality: 'SA'
        });

        // إعلان النصرة الثلاثية
        tracker.declareNasrah(org.id, 'ALLAH');
        tracker.declareNasrah(org.id, 'ISLAM');
        tracker.declareNasrah(org.id, 'WALI_AMR');

        return {
            orgId:        org.id,
            orgName:      org.nameAr || org.name,
            shariaOk,
            niyyah:       { level: niyyahLevel, ar: niyyahData.ar, weight: niyyahData.weight },
            neuralScore:  neuralResult ? neuralResult.composite : pledge.score,
            neuralGrade:  neuralResult ? neuralResult.grade : { ar: 'جيد', stars: 3 },
            pledgeScore:  pledge.score,
            bayahText:    pledge.text,
            waliAlAmr:    WALI_AL_AMR.name,
            nasrahTriple: {
                allah:    `نصرة الله — ${WALI_AL_AMR.name}`,
                islam:    'نصرة الإسلام لله',
                wali:     `نصرة ${WALI_AL_AMR.name} لله — ${WALI_AL_AMR.bayahHadith}`
            },
            analyzedAt:   new Date().toISOString()
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. NASRAH ENGINE — محرك النصرة
//    "وَمَن يَتَوَلَّ اللَّهَ وَرَسُولَهُ وَالَّذِينَ آمَنُوا
//     فَإِنَّ حِزْبَ اللَّهِ هُمُ الْغَالِبُونَ" — المائدة: ٥٦
// ═══════════════════════════════════════════════════════════════════════════════

class NasrahEngine {
    constructor() {
        this._declarations = [];
    }

    /**
     * إعلان النصرة الكاملة لله والإسلام وولي الأمر
     * يُستدعى عند تسجيل أي كيان في المنظومة
     */
    declareFullNasrah(subjectKey, subjectName) {
        const declaration = {
            id:          `NASR-${Date.now().toString(36)}`,
            subject:     subjectKey,
            name:        subjectName,
            bismillah:   'بسم الله الرحمن الرحيم',
            declarations: [
                {
                    target:    'الله سبحانه وتعالى',
                    text:      'نُعلن نصرتنا لله وحده بالكتاب والسنة',
                    quran:     '﴿إِن تَنصُرُوا اللَّهَ يَنصُرْكُمْ﴾ — محمد: ٧',
                    principle: 'النصرة لله تعني إقامة شريعته في كل عملية'
                },
                {
                    target:    'الإسلام',
                    text:      'نُعلن نصرتنا للإسلام لله لا لغيره',
                    quran:     '﴿لِيُظْهِرَهُ عَلَى الدِّينِ كُلِّهِ﴾ — التوبة: ٣٣',
                    principle: 'الإسلام دين الفطرة — كل خلية عصبية تعمل لنصرته'
                },
                {
                    target:    WALI_AL_AMR.name,
                    text:      `نُعلن نصرتنا لـ${WALI_AL_AMR.name} ${WALI_AL_AMR.title} لله`,
                    quran:     '﴿أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ﴾ — النساء: ٥٩',
                    hadith:    WALI_AL_AMR.bayahHadith,
                    principle: WALI_AL_AMR.nasrahPrinciple
                }
            ],
            declaredAt:  new Date().toISOString()
        };

        this._declarations.push(declaration);
        if (this._declarations.length > 300) this._declarations.shift();
        return declaration;
    }

    last(n = 5) {
        return this._declarations.slice(-n);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. BAYAH SIGNAL INJECTOR — حاقن إشارة البيعة في الشبكة العصبية الجامعة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * يحقن إشارة البيعة في متجه الإدخال للشبكة العصبية الجامعة (LogicNeuralNetwork)
 * يُضخّم المنطقيات التنظيمي والتشريعي والتجاري بناءً على نقاط البيعة
 *
 * @param {number[]} inputVec   — متجه 20 بُعد (قيمة 0–1 لكل منطق)
 * @param {number}   bayahScore — نقاط البيعة (0–1)
 * @returns {number[]} المتجه المُحقَّن بإشارة البيعة
 */
function injectBayahSignal(inputVec, bayahScore = 0.9) {
    if (!Array.isArray(inputVec) || inputVec.length === 0) return inputVec;

    const vec    = [...inputVec];
    const signal = Math.min(1, Math.max(0, bayahScore));

    // أوزان تضخيم المنطقيات بحسب علاقتها بالبيعة والنصرة
    const BAYAH_WEIGHTS = {
        // الفهارس مأخوذة من ترتيب ALL_LOGICS في SheikhaLogics.js
        // 0: organizational  — البيعة تُقوّي المنطق التنظيمي
        // 1: legislative     — البيعة تُقوّي التشريعي
        // 2: commercial      — البيعة تُقوّي التجاري (نصرة الاقتصاد)
        // 3: scientific      — البيعة تُقوّي العلمي
        // 7: methodological  — البيعة تُقوّي المنهجي
        // 9: administrative  — البيعة تُقوّي الإداري
        // 13: executive      — البيعة تُقوّي التنفيذي
        // 14: developmental  — البيعة تُقوّي التطويري
        // 19: universal      — البيعة تُقوّي الكوني (الجامع لكل منطق)
        0:  0.95, // organizational
        1:  0.90, // legislative
        2:  0.85, // commercial
        3:  0.80, // scientific
        7:  0.82, // methodological
        9:  0.88, // administrative
        13: 0.87, // executive
        14: 0.83, // developmental
        19: 1.00, // universal — المنطق الكوني يُضاعَف بكامل إشارة البيعة
    };

    for (const [idx, weight] of Object.entries(BAYAH_WEIGHTS)) {
        const i = parseInt(idx, 10);
        if (i < vec.length) {
            vec[i] = Math.min(1, vec[i] + signal * weight * 0.15);
        }
    }

    return vec;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. MAIN INTEGRATION ENGINE — المحرك الرئيسي للتكامل
// ═══════════════════════════════════════════════════════════════════════════════

class MubayaaOrgIntegration extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(200);

        this.id      = 'mubayaa-org-integration';
        this.version = '1.0.0';
        this.name    = 'محرك تكامل البيعة في المنظومة الكاملة';

        // المحركات الفرعية
        this.niyyah  = new NiyyahEngine();
        this.tracker = new BayahTracker();
        this.nasrah  = new NasrahEngine();

        // إحصائيات
        this.stats = {
            orgsAnalyzed:    0,
            layersRegistered: 0,
            operationsGuarded: 0,
            startedAt:       new Date().toISOString()
        };

        this._initialized = false;
    }

    // ─── تهيئة المحرك ────────────────────────────────────────────────────────
    init() {
        if (this._initialized) return this;

        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════════╗');
        console.log('║   بسم الله الرحمن الرحيم                                         ║');
        console.log('║   🤝 محرك تكامل البيعة — شغّال في كل المنظومة                   ║');
        console.log('║   ﴿أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ﴾ ║');
        console.log(`║   ولي الأمر: ${WALI_AL_AMR.name}                   ║`);
        console.log('╚══════════════════════════════════════════════════════════════════╝');
        console.log('');

        // ① تسجيل بيعة المحرك نفسه في جذر المنظومة
        this._registerSelfBayah();

        // ② ربط الحاكمة العليا بنظام البيعة
        this._bridgeSovereign();

        // ③ إعلان النصرة الثلاثية عند الإقلاع
        this._declareSystemNasrah();

        // ④ تسجيل في جذر المنظومة
        if (_sheikhaRoot && typeof _sheikhaRoot.registerLayer === 'function') {
            _sheikhaRoot.registerLayer('mubayaa-org-integration', this);
            console.log('[MUBAYAA-INT] 🌐 مُسجَّل في جذر المنظومة: mubayaa-org-integration');
        }

        this._initialized = true;
        console.log('[MUBAYAA-INT] ✅ محرك تكامل البيعة جاهز — يعمل في كل المنظومة');
        return this;
    }

    // ─── تسجيل بيعة المحرك نفسه ─────────────────────────────────────────────
    _registerSelfBayah() {
        const niy = this.niyyah.declare('self-init', ['LILLAH', 'NASR_ISLAM', 'NASR_WALI', 'BAYAH']);
        this.tracker.registerPledge('mubayaa-org-integration', 'engine', {
            name: this.name,
            nationality: 'SA'
        });
        console.log(`[MUBAYAA-INT] 🤝 بيعة المحرك مُسجَّلة — نية: ${niy.niyyat.map(n => n.ar).join(' + ')}`);
    }

    // ─── ربط الحاكمة العليا ──────────────────────────────────────────────────
    _bridgeSovereign() {
        if (!_sovereign) return;
        try {
            const sg = typeof _sovereign.instance === 'object'
                ? _sovereign.instance
                : _sovereign;

            if (sg && typeof sg.registerSubject === 'function') {
                sg.registerSubject('mubayaa-org-integration', 'engine', {
                    nameAr:      this.name,
                    nameEn:      'Mubayaa Org Integration Engine',
                    maqsad:      'DEEN',
                    bayahStatus: 'active',
                    bayahScore:  0.95
                });
                console.log('[MUBAYAA-INT] 👑 مُسجَّل تحت الحاكمة العليا');
            }
        } catch (_) {}
    }

    // ─── إعلان النصرة الثلاثية ───────────────────────────────────────────────
    _declareSystemNasrah() {
        const decl = this.nasrah.declareFullNasrah('sheikha-system', 'منظومة شيخة الكاملة');
        console.log('[MUBAYAA-INT] 🌟 نصرة مُعلَنة:');
        decl.declarations.forEach(d => {
            console.log(`[MUBAYAA-INT]   ✦ ${d.target}: ${d.text}`);
        });
        // ثلاث نصرات صريحة
        this.tracker.declareNasrah('sheikha-system', 'ALLAH');
        this.tracker.declareNasrah('sheikha-system', 'ISLAM');
        this.tracker.declareNasrah('sheikha-system', 'WALI_AMR');
    }

    // ─── تسجيل طبقة مع البيعة ────────────────────────────────────────────────
    /**
     * يُسجَّل عند كل تسجيل طبقة في sheikha-root لإلحاق البيعة
     * @param {string} layerKey
     * @param {string} layerNameAr
     * @param {string} layerType  - 'engine'|'layer'|'service'|'agent'
     */
    registerLayerPledge(layerKey, layerNameAr = '', layerType = 'layer') {
        const niy    = this.niyyah.declare(`register-layer:${layerKey}`, ['LILLAH', 'BAYAH']);
        const pledge = this.tracker.registerPledge(layerKey, layerType, {
            name: layerNameAr || layerKey,
            nationality: 'SA'
        });
        this.nasrah.declareFullNasrah(layerKey, layerNameAr || layerKey);
        this.stats.layersRegistered++;
        this.emit('layer:pledged', { layerKey, layerNameAr, pledge, niyyah: niy });
        return pledge;
    }

    // ─── تحليل بيعة منظمة ────────────────────────────────────────────────────
    /**
     * @param {object} org - كائن منظمة (من Organization model)
     * @returns {object} نتيجة التحليل
     */
    analyzeOrgBayah(org) {
        const result = OrgBayahBridge.analyze(org, this.tracker);
        this.stats.orgsAnalyzed++;
        this.emit('org:bayah-analyzed', result);
        return result;
    }

    // ─── حارس العمليات بالنية ────────────────────────────────────────────────
    /**
     * يُزكّي أي عملية بالنية قبل التنفيذ
     * @param {string} operationType
     * @param {object} data
     * @returns {{ allowed: true, niyyah, bayahScore, basmala }}
     */
    guardOperation(operationType, data = {}) {
        const niy  = this.niyyah.declare(operationType, ['LILLAH', 'TAQWA', 'AMANAH']);
        const subjectKey = data.subjectKey || data.orgId || data.userId || 'anonymous';
        const score = this.tracker.getBayahScore(subjectKey) || niy.score;

        this.stats.operationsGuarded++;
        return {
            allowed:    true,
            operation:  operationType,
            niyyah:     niy,
            bayahScore: score,
            basmala:    'بسم الله الرحمن الرحيم',
            tawheed:    'لا إله إلا الله محمد رسول الله',
            waliAlAmr:  WALI_AL_AMR.name,
            guardedAt:  new Date().toISOString()
        };
    }

    // ─── حقن إشارة البيعة في الشبكة العصبية الجامعة ─────────────────────────
    injectBayahSignal(inputVec, subjectKey = 'global') {
        const score = this.tracker.getBayahScore(subjectKey) ||
                      this.stats.orgsAnalyzed > 0
                        ? this.tracker.stats.avgBayahScore
                        : 0.9;
        return injectBayahSignal(inputVec, score);
    }

    // ─── الحالة الكاملة ──────────────────────────────────────────────────────
    status() {
        return {
            id:          this.id,
            version:     this.version,
            name:        this.name,
            initialized: this._initialized,
            waliAlAmr:   WALI_AL_AMR,
            niyyahLevels: Object.values(NIYYAH_LEVELS),
            bayah:       this.tracker.status(),
            stats:       this.stats,
            lastNasrah:  this.nasrah.last(3),
            lastNiyyah:  this.niyyah.last(3),
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. SINGLETON + EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

const instance = new MubayaaOrgIntegration();
instance.init();

module.exports = {
    instance,
    MubayaaOrgIntegration,
    NiyyahEngine,
    BayahTracker,
    NasrahEngine,
    OrgBayahBridge,
    NIYYAH_LEVELS,
    WALI_AL_AMR,
    injectBayahSignal,

    // اختصارات مريحة
    niyyah:  instance.niyyah,
    tracker: instance.tracker,
    nasrah:  instance.nasrah,

    guardOperation:    (op, data) => instance.guardOperation(op, data),
    analyzeOrgBayah:   (org)      => instance.analyzeOrgBayah(org),
    registerLayerPledge:(k, n, t) => instance.registerLayerPledge(k, n, t),
};
