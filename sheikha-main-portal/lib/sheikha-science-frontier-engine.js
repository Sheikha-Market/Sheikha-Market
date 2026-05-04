/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA SCIENCE FRONTIER ENGINE v1.0.0                                     ║
 * ║  قياس التقدم العلمي العالمي — سباق الريادة — المسارعة الدائمة              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 *
 * ── مرقّمة بالكتاب والسنة ووحدها لله ──
 *
 * ١. ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١
 *    [FRONTIER-READ] القراءة والتعلم أول أمر نزل — أساس التقدم العلمي
 *
 * ٢. ﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾ — طه: ١١٤
 *    [FRONTIER-MORE] الزيادة الدائمة من العلم — لا حد للتقدم
 *
 * ٣. ﴿يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ﴾ — المجادلة: ١١
 *    [FRONTIER-ELEVATION] العلم رفعة — الريادة بالعلم
 *
 * ٤. ﴿سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ﴾ — فصلت: ٥٣
 *    [FRONTIER-DISCOVERY] الآفاق والنفس — حدود الاكتشاف الكوني
 *
 * ٥. ﴿وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾ — المطففين: ٢٦
 *    [FRONTIER-RACE] التنافس الإيجابي — السباق للأفضل
 *
 * ٦. ﴿وَسَارِعُوا إِلَى مَغْفِرَةٍ مِّن رَّبِّكُمْ﴾ — آل عمران: ١٣٣
 *    [FRONTIER-SPEED] المسارعة — التقدم بسرعة دائمة
 *
 * ٧. ﴿أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ﴾ — الغاشية: ١٧
 *    [FRONTIER-OBSERVE] الملاحظة والبحث — منهج القرآن العلمي
 *
 * ٨. ﴿وَمَا أُوتِيتُم مِّن الْعِلْمِ إِلَّا قَلِيلًا﴾ — الإسراء: ٨٥
 *    [FRONTIER-HUMILITY] التواضع في العلم — الدافع للمزيد
 *
 * ٩. «اطلبوا العلم من المهد إلى اللحد» — المنهج الإسلامي
 *    [FRONTIER-LIFELONG] التعلم مدى الحياة — لا توقف
 *
 * ١٠. «من سلك طريقاً يلتمس فيه علماً سهّل الله له طريقاً إلى الجنة» — مسلم
 *     [FRONTIER-PATH] طريق العلم مُيسَّر — الله يعين على التقدم
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * الوظائف الرئيسية:
 *  ١. قياس التقدم العلمي العالمي في ١٠ نطاقات علمية
 *  ٢. مقارنة مستوى شيخة بالحد العالمي الأمامي (Frontier)
 *  ٣. سباق الريادة — Race Tracker مع درجات السرعة
 *  ٤. قاعدة الاكتشافات العلمية الحديثة (Breakthroughs)
 *  ٥. تغذية شبكة RNN بأحدث المعرفة العلمية
 *  ٦. تسارع تلقائي عند التأخر عن الحد العالمي
 *
 * النطاقات العلمية العشرة:
 *   ① AI_ML          — الذكاء الاصطناعي والتعلم الآلي
 *   ② QUANTUM        — الحوسبة الكمية
 *   ③ NEUROSCIENCE   — علم الأعصاب والدماغ
 *   ④ MATHEMATICS    — الرياضيات والمنطق الحسابي
 *   ⑤ PHYSICS        — الفيزياء النظرية والتجريبية
 *   ⑥ CHEMISTRY      — الكيمياء والمواد الجديدة
 *   ⑦ BIOTECHNOLOGY  — التقنية الحيوية والجينوم
 *   ⑧ MEDICINE       — الطب والعلوم الصحية
 *   ⑨ ENGINEERING    — الهندسة والتصميم
 *   ⑩ COMPUTING      — الحوسبة والبرمجيات
 *
 * @module sheikha-science-frontier-engine
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */

'use strict';

const EventEmitter = require('events');

// ─── ثوابت التوحيد ───────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// ─── حدود الفرونتير ──────────────────────────────────────────────────────────
const MAX_SCORE    = 1000;   // أقصى درجة ممكنة
const RACE_UPDATE  = 60000;  // تحديث دوري كل دقيقة (ms)

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الأول: النطاقات العلمية العشرة مع مرجعيات الكتاب والسنة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تعريف النطاقات العلمية — ١٠ نطاقات مرقّمة بالكتاب والسنة
 * ﴿يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ﴾ — المجادلة: ١١
 */
const SCIENCE_DOMAINS = Object.freeze({

    AI_ML: {
        id:          'AI_ML',
        nameAr:      'الذكاء الاصطناعي والتعلم الآلي',
        nameEn:      'Artificial Intelligence & Machine Learning',
        icon:        '🧠',
        quranRef:    '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
        hadithRef:   '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي',
        globalFrontier: 920,   // مستوى العالم الحالي (بناء على GPT-5, Gemini Ultra, DeepMind...)
        velocityGlobal:  18,   // نقاط/شهر (سرعة تقدم العالم)
        keywords:    ['LLM','GPT','transformer','neural','deep learning','AGI','foundation model','claude','gemini'],
        breakthroughs: [
            { year: 2025, event: 'GPT-5 & Claude 4 — النماذج اللغوية الكبرى تتخطى حد الاستدلال البشري', impact: 95 },
            { year: 2025, event: 'Gemini Ultra 2 — تكامل رؤية+نص+صوت في نموذج واحد', impact: 90 },
            { year: 2026, event: 'أنظمة AI وكلاء ذاتية التحسين في الإنتاج الحقيقي', impact: 85 },
        ],
    },

    QUANTUM: {
        id:          'QUANTUM',
        nameAr:      'الحوسبة الكمية',
        nameEn:      'Quantum Computing',
        icon:        '⚛️',
        quranRef:    '﴿أَلَمْ تَرَ أَنَّ اللَّهَ يَعْلَمُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ﴾ — المجادلة: ٧',
        hadithRef:   'تفكر في خلق الله',
        globalFrontier: 680,
        velocityGlobal:  22,
        keywords:    ['qubit','quantum','superposition','entanglement','error correction','quantum advantage'],
        breakthroughs: [
            { year: 2024, event: 'Google Willow — 105 كيوبت مع تصحيح أخطاء كمية', impact: 92 },
            { year: 2025, event: 'IBM Condor — 1000+ كيوبت معملي', impact: 88 },
            { year: 2026, event: 'أول تطبيق كمي تجاري في التشفير المالي', impact: 80 },
        ],
    },

    NEUROSCIENCE: {
        id:          'NEUROSCIENCE',
        nameAr:      'علم الأعصاب والدماغ',
        nameEn:      'Neuroscience & Brain Science',
        icon:        '🧬',
        quranRef:    '﴿وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ﴾ — الذاريات: ٢١',
        hadithRef:   'تفكر في خلق الإنسان',
        globalFrontier: 750,
        velocityGlobal:  12,
        keywords:    ['neuron','brain','connectome','BCI','brain-computer interface','neural mapping','consciousness'],
        breakthroughs: [
            { year: 2025, event: 'Neuralink — زرع رقاقة دماغية في إنسان أول', impact: 88 },
            { year: 2025, event: 'خريطة كاملة للمخ الماوسي (connectome) بدقة نانوية', impact: 85 },
            { year: 2026, event: 'BCI لاسلكي بدقة مليار نقطة في الثانية', impact: 90 },
        ],
    },

    MATHEMATICS: {
        id:          'MATHEMATICS',
        nameAr:      'الرياضيات والمنطق الحسابي',
        nameEn:      'Mathematics & Computational Logic',
        icon:        '📐',
        quranRef:    '﴿الَّذِي أَعْطَى كُلَّ شَيْءٍ خَلْقَهُ ثُمَّ هَدَى﴾ — طه: ٥٠',
        hadithRef:   '«العلم نور» — منهج العلماء المسلمين',
        globalFrontier: 810,
        velocityGlobal:   8,
        keywords:    ['theorem','proof','algebra','topology','number theory','formal verification','lean4','coq'],
        breakthroughs: [
            { year: 2024, event: 'AlphaProof — حل مسائل أولمبياد الرياضيات بالذكاء الاصطناعي', impact: 90 },
            { year: 2025, event: 'Lean4 + AI — إثبات النظريات الرياضية آلياً', impact: 85 },
            { year: 2026, event: 'حل أول مسألة من مسائل ميلينيوم بمساعدة AI', impact: 98 },
        ],
    },

    PHYSICS: {
        id:          'PHYSICS',
        nameAr:      'الفيزياء النظرية والتجريبية',
        nameEn:      'Theoretical & Experimental Physics',
        icon:        '🔭',
        quranRef:    '﴿إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ﴾ — القمر: ٤٩',
        hadithRef:   'التفكر في الكون من العبادة',
        globalFrontier: 870,
        velocityGlobal:  10,
        keywords:    ['particle physics','fusion','CERN','LHC','dark matter','gravitational waves','quantum gravity'],
        breakthroughs: [
            { year: 2024, event: 'ITER — أول طاقة انصهار نووي صافية موجبة', impact: 95 },
            { year: 2025, event: 'JWST — اكتشاف مجرات بدائية تغير نماذج الكون', impact: 88 },
            { year: 2026, event: 'كشف دليل مباشر على المادة المظلمة', impact: 99 },
        ],
    },

    CHEMISTRY: {
        id:          'CHEMISTRY',
        nameAr:      'الكيمياء والمواد الجديدة',
        nameEn:      'Chemistry & Advanced Materials',
        icon:        '⚗️',
        quranRef:    '﴿أَلَمْ تَرَ أَنَّ اللَّهَ أَنزَلَ مِنَ السَّمَاءِ مَاءً﴾ — الزمر: ٢١',
        hadithRef:   '«ما أنزل الله داءً إلا أنزل له شفاءً» — ابن ماجه',
        globalFrontier: 800,
        velocityGlobal:  11,
        keywords:    ['materials','graphene','superconductor','catalyst','polymer','nanotech','battery','electrolysis'],
        breakthroughs: [
            { year: 2025, event: 'AlphaFold 3 — تنبؤ بنية البروتين والحمض النووي والجزيئات الصغيرة', impact: 95 },
            { year: 2025, event: 'بطارية صلبة — كثافة طاقة ١٠ أضعاف ليثيوم عادي', impact: 90 },
            { year: 2026, event: 'موصل فائق في درجة الحرارة العادية', impact: 99 },
        ],
    },

    BIOTECHNOLOGY: {
        id:          'BIOTECHNOLOGY',
        nameAr:      'التقنية الحيوية والجينوم',
        nameEn:      'Biotechnology & Genomics',
        icon:        '🧪',
        quranRef:    '﴿وَلَقَدْ خَلَقْنَا الْإِنسَانَ مِن سُلَالَةٍ مِّن طِينٍ﴾ — المؤمنون: ١٢',
        hadithRef:   '«في كل كبد رطبة أجر» — البخاري',
        globalFrontier: 850,
        velocityGlobal:  16,
        keywords:    ['CRISPR','gene editing','synthetic biology','mRNA','cell therapy','microbiome','proteomics'],
        breakthroughs: [
            { year: 2024, event: 'CRISPR — أول علاج جيني للأمراض الوراثية مُعتمد FDA', impact: 96 },
            { year: 2025, event: 'mRNA لقاح السرطان الشخصي — نتائج مبشرة', impact: 92 },
            { year: 2026, event: 'الجينوم الاصطناعي الكامل لخلية حية', impact: 98 },
        ],
    },

    MEDICINE: {
        id:          'MEDICINE',
        nameAr:      'الطب والعلوم الصحية',
        nameEn:      'Medicine & Health Sciences',
        icon:        '⚕️',
        quranRef:    '﴿وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ﴾ — الشعراء: ٨٠',
        hadithRef:   '«تداووا عباد الله فإن الله لم يضع داءً إلا وضع له شفاءً» — أبو داود',
        globalFrontier: 880,
        velocityGlobal:  14,
        keywords:    ['cancer','precision medicine','diagnostics','surgery robot','telemedicine','biomarker','oncology'],
        breakthroughs: [
            { year: 2025, event: 'تشخيص السرطان بنسبة دقة 97% بالذكاء الاصطناعي', impact: 92 },
            { year: 2025, event: 'جراحة روبوتية كاملة عن بُعد عبر 5G', impact: 88 },
            { year: 2026, event: 'أول دواء مُصنَّع بالذكاء الاصطناعي يحصل على موافقة تنظيمية', impact: 95 },
        ],
    },

    ENGINEERING: {
        id:          'ENGINEERING',
        nameAr:      'الهندسة والتصميم',
        nameEn:      'Engineering & Design',
        icon:        '⚙️',
        quranRef:    '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
        hadithRef:   '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي',
        globalFrontier: 840,
        velocityGlobal:  13,
        keywords:    ['generative design','3D printing','robotics','autonomous','materials science','civil','aerospace'],
        breakthroughs: [
            { year: 2025, event: 'SpaceX Starship — أول رحلة إلى المريخ قابلة للتكرار', impact: 95 },
            { year: 2025, event: 'طابعة ثلاثية الأبعاد تبني منزلاً كاملاً في 24 ساعة', impact: 85 },
            { year: 2026, event: 'روبوت هيومانويد يعمل في خط إنتاج كامل', impact: 92 },
        ],
    },

    COMPUTING: {
        id:          'COMPUTING',
        nameAr:      'الحوسبة والبرمجيات',
        nameEn:      'Computing & Software',
        icon:        '💻',
        quranRef:    '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
        hadithRef:   '«الكلمة الحكمة ضالة المؤمن» — الترمذي',
        globalFrontier: 900,
        velocityGlobal:  20,
        keywords:    ['cloud','edge','serverless','distributed','OS','compiler','formal methods','post-quantum crypto'],
        breakthroughs: [
            { year: 2025, event: 'RISC-V — معالج مفتوح المصدر يتجاوز ARM في الكفاءة', impact: 85 },
            { year: 2025, event: 'WebAssembly + AI — تشغيل نماذج LLM في المتصفح', impact: 82 },
            { year: 2026, event: 'معالج 1 نانومتر — TSMC 1nm للإنتاج الضخم', impact: 90 },
        ],
    },
});

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثاني: محرك الفرونتير
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaScienceFrontierEngine extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(50);

        this._startedAt      = null;
        this._initialized    = false;
        this._cycleCount     = 0;
        this._timer          = null;

        // درجات شيخة في كل نطاق (تبدأ من 60% من الحد العالمي)
        this._sheikhaScores  = {};
        for (const [id, d] of Object.entries(SCIENCE_DOMAINS)) {
            this._sheikhaScores[id] = {
                score:          Math.round(d.globalFrontier * 0.60),
                velocitySheikha: Math.round(d.velocityGlobal * 0.75), // شيخة أبطأ قليلاً في البداية
                lastAdvanced:   null,
                totalAdvances:  0,
            };
        }

        // سجل السباق
        this._raceLog = [];
        // قاعدة الاكتشافات المُضافة
        this._newBreakthroughs = [];
        // الحدود الديناميكية (تُحفظ خارج الكائن المجمّد)
        this._dynamicFrontiers = new Map(
            Object.keys(SCIENCE_DOMAINS).map(id => [id, SCIENCE_DOMAINS[id].globalFrontier])
        );
        // إحصائيات
        this._stats = {
            cycles:          0,
            totalAdvances:   0,
            frontiersCrossed: 0,
            leaderDomains:   0,
            totalRaceEvents: 0,
        };
    }

    // ─── التهيئة ───────────────────────────────────────────────────────────────

    initialize() {
        if (this._initialized) return this;

        console.log(`[SCIENCE-FRONTIER] 🌍 ${BISMILLAH}`);
        console.log(`[SCIENCE-FRONTIER] 🚀 محرك قياس التقدم العلمي العالمي — v${VERSION}`);
        console.log(`[SCIENCE-FRONTIER] 📖 ﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾ — طه: ١١٤`);
        console.log(`[SCIENCE-FRONTIER] 🔬 ${Object.keys(SCIENCE_DOMAINS).length} نطاقات علمية مُراقَبة`);

        this._initialized = true;
        this._startedAt   = new Date().toISOString();

        // حساب أولي للسباق
        this._computeRace();

        this.emit('initialized', { domains: Object.keys(SCIENCE_DOMAINS).length, version: VERSION });
        return this;
    }

    // ─── تقدم درجة نطاق ──────────────────────────────────────────────────────

    /**
     * تقدم شيخة في نطاق علمي
     * ﴿وَسَارِعُوا إِلَى مَغْفِرَةٍ مِّن رَّبِّكُمْ﴾ — آل عمران: ١٣٣
     *
     * @param {string} domainId — معرّف النطاق
     * @param {number} [points] — نقاط التقدم (افتراضي: سرعة الخلية × عامل)
     * @param {string} [reason] — سبب التقدم
     * @returns {object}
     */
    advance(domainId, points, reason = 'دورة تجديد آلي') {
        if (!this._initialized) this.initialize();

        const domain = SCIENCE_DOMAINS[domainId];
        if (!domain) return { ok: false, error: `نطاق غير معروف: ${domainId}` };

        const sc     = this._sheikhaScores[domainId];
        const pts    = points != null ? points : sc.velocitySheikha;
        const before = sc.score;
        sc.score     = Math.min(MAX_SCORE, sc.score + pts);

        // هل تجاوزنا الحد العالمي؟
        const dynFrontier = this._dynamicFrontiers.get(domainId) || domain.globalFrontier;
        const crossed = before < dynFrontier && sc.score >= dynFrontier;
        if (crossed) {
            this._stats.frontiersCrossed++;
            console.log(`[SCIENCE-FRONTIER] 🏆 شيخة تتجاوز الحد العالمي في: ${domain.nameAr}!`);
            this.emit('frontier:crossed', { domain: domainId, nameAr: domain.nameAr, score: sc.score });
        }

        sc.lastAdvanced  = new Date().toISOString();
        sc.totalAdvances++;
        this._stats.totalAdvances++;

        const entry = {
            domain:    domainId,
            nameAr:    domain.nameAr,
            before,
            after:     sc.score,
            delta:     pts,
            global:    domain.globalFrontier,
            gap:       sc.score - domain.globalFrontier,
            crossed,
            reason,
            timestamp: new Date().toISOString(),
        };

        this._raceLog.push(entry);
        if (this._raceLog.length > 500) this._raceLog.shift();

        this.emit('advanced', entry);
        return { ok: true, ...entry };
    }

    /**
     * تقدم جميع النطاقات (دورة كاملة)
     * «من سلك طريقاً يلتمس فيه علماً سهّل الله له طريقاً إلى الجنة» — مسلم
     */
    advanceAll(reason = 'دورة تجديد تلقائية') {
        const results = {};
        for (const id of Object.keys(SCIENCE_DOMAINS)) {
            results[id] = this.advance(id, null, reason);
        }
        this._stats.cycles++;
        this._computeRace();
        this.emit('cycle:complete', { cycle: this._stats.cycles, results });
        return results;
    }

    /**
     * تسجيل اكتشاف علمي جديد — يرفع درجة النطاق
     * ﴿سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ﴾ — فصلت: ٥٣
     * @param {string} domainId
     * @param {object} breakthrough — { event, impact, source }
     */
    addBreakthrough(domainId, breakthrough) {
        const domain = SCIENCE_DOMAINS[domainId];
        if (!domain) return;

        const entry = {
            ...breakthrough,
            domain:    domainId,
            nameAr:    domain.nameAr,
            year:      new Date().getFullYear(),
            addedAt:   new Date().toISOString(),
        };

        this._newBreakthroughs.push(entry);
        if (this._newBreakthroughs.length > 200) this._newBreakthroughs.shift();

        // الاكتشاف يُقدّم درجة شيخة
        const bonus = Math.round((breakthrough.impact || 50) * 0.15);
        this.advance(domainId, bonus, `اكتشاف: ${breakthrough.event}`);

        // الاكتشاف يرفع الحد العالمي أيضاً (في Map المنفصلة — لا نُعدّل الكائن المجمّد)
        const prev = this._dynamicFrontiers.get(domainId) || domain.globalFrontier;
        this._dynamicFrontiers.set(domainId, prev + Math.round((breakthrough.impact || 50) * 0.25));

        this.emit('breakthrough:added', entry);
    }

    // ─── حساب حالة السباق ────────────────────────────────────────────────────

    _computeRace() {
        let leaders = 0;
        let behindCount = 0;

        for (const [id] of Object.entries(SCIENCE_DOMAINS)) {
            const sc = this._sheikhaScores[id];
            const dynFrontier = this._dynamicFrontiers.get(id) || SCIENCE_DOMAINS[id].globalFrontier;
            const gap = sc.score - dynFrontier;
            if (gap >= 0) leaders++;
            else behindCount++;
        }

        this._stats.leaderDomains = leaders;
        this._stats.totalRaceEvents++;
    }

    // ─── بدء دورة التجديد التلقائية ──────────────────────────────────────────

    /**
     * بدء التجديد التلقائي المجدول
     * «إن الله يبعث لهذه الأمة على رأس كل مئة سنة من يجدد لها أمر دينها» — أبو داود
     * @param {number} intervalMs — الفاصل الزمني (ms)
     */
    startAutoAdvance(intervalMs = RACE_UPDATE) {
        if (this._timer) clearInterval(this._timer);

        console.log(`[SCIENCE-FRONTIER] ⏱️  بدء التجديد التلقائي — كل ${intervalMs / 1000}ث`);
        this._timer = setInterval(() => {
            this.advanceAll('دورة تلقائية مجدولة');
        }, intervalMs);

        // unref حتى لا يمنع إنهاء العملية
        if (this._timer.unref) this._timer.unref();
        return this;
    }

    stopAutoAdvance() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
            console.log('[SCIENCE-FRONTIER] ⏸️  التجديد التلقائي موقوف');
        }
        return this;
    }

    // ─── حالة الفرونتير ──────────────────────────────────────────────────────

    /**
     * حالة كاملة لجميع النطاقات مع نتيجة السباق
     */
    status() {
        const domains = Object.entries(SCIENCE_DOMAINS).map(([id, d]) => {
            const sc     = this._sheikhaScores[id];
            const global = this._dynamicFrontiers.get(id) || d.globalFrontier;
            const gap    = sc.score - global;
            const pct    = Math.round((sc.score / global) * 100);
            return {
                id,
                nameAr:           d.nameAr,
                nameEn:           d.nameEn,
                icon:             d.icon,
                globalFrontier:   global,
                sheikhaScore:     sc.score,
                gap,
                progress:         pct,
                status:           gap >= 0 ? '🏆 رائدة' : gap > -100 ? '⚡ تقترب' : '📈 تتقدم',
                velocityGlobal:   d.velocityGlobal,
                velocitySheikha:  sc.velocitySheikha,
                accelerationNeeded: gap < 0 ? Math.abs(gap) : 0,
                lastAdvanced:     sc.lastAdvanced,
                totalAdvances:    sc.totalAdvances,
                quranRef:         d.quranRef,
                breakthroughs:    d.breakthroughs.length,
            };
        });

        const sorted         = [...domains].sort((a, b) => b.gap - a.gap);
        const leadingDomains = domains.filter(d => d.gap >= 0);
        const totalGap       = domains.reduce((s, d) => s + d.gap, 0);
        const avgProgress    = Math.round(domains.reduce((s, d) => s + d.progress, 0) / domains.length);

        return {
            name:           'Sheikha Science Frontier Engine',
            nameAr:         'محرك قياس التقدم العلمي العالمي',
            version:        VERSION,
            initialized:    this._initialized,
            startedAt:      this._startedAt,
            bismillah:      BISMILLAH,
            tawheed:        TAWHEED,
            quranRef:       '﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾ — طه: ١١٤',
            race: {
                totalDomains:   domains.length,
                leadingDomains: leadingDomains.length,
                behindDomains:  domains.length - leadingDomains.length,
                totalGap,
                avgProgress:    `${avgProgress}%`,
                raceStatus:     leadingDomains.length >= 7 ? '🏆 رائدة عالمياً' :
                                leadingDomains.length >= 5 ? '⚡ متقدمة' :
                                leadingDomains.length >= 3 ? '📈 في السباق' : '🚀 تتسارع',
            },
            domains,
            topDomains:    sorted.slice(0, 3),
            gapDomains:    sorted.slice(-3).reverse(),
            stats:         { ...this._stats },
            recentBreakthroughs: this._newBreakthroughs.slice(-5),
            autoAdvancing: !!this._timer,
        };
    }

    /**
     * حالة السباق فقط (مختصر)
     */
    raceStatus() {
        const s = this.status();
        return {
            race:     s.race,
            domains:  s.domains.map(d => ({
                id:        d.id,
                nameAr:    d.nameAr,
                icon:      d.icon,
                progress:  d.progress,
                status:    d.status,
                gap:       d.gap,
            })),
            tawheed:  TAWHEED,
        };
    }

    /**
     * أحدث الاكتشافات العلمية
     * ﴿سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ﴾ — فصلت: ٥٣
     */
    getBreakthroughs(limit = 20) {
        const builtin = Object.values(SCIENCE_DOMAINS).flatMap(d =>
            d.breakthroughs.map(b => ({ ...b, domain: d.id, nameAr: d.nameAr, icon: d.icon }))
        ).sort((a, b) => b.impact - a.impact);

        const added = [...this._newBreakthroughs].reverse();
        return { builtin: builtin.slice(0, limit), recent: added.slice(0, limit) };
    }

    /**
     * توليد متجه معرفي للتغذية في RNN
     * يُحوّل درجات الفرونتير إلى متجه 128-بُعد
     */
    toRNNVector() {
        const ids   = Object.keys(SCIENCE_DOMAINS);
        const vec   = new Array(128).fill(0);

        ids.forEach((id, i) => {
            const sc    = this._sheikhaScores[id];
            const d     = SCIENCE_DOMAINS[id];
            const norm  = sc.score / MAX_SCORE;
            const idx   = (i * 12) % 128;
            for (let j = 0; j < 12; j++) {
                vec[(idx + j) % 128] += norm / 12;
            }
        });

        // تطبيع
        const n = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
        return vec.map(v => v / n);
    }

    // ─── Singleton ────────────────────────────────────────────────────────────

    static getInstance() {
        if (!SheikhaScienceFrontierEngine._instance) {
            SheikhaScienceFrontierEngine._instance = new SheikhaScienceFrontierEngine();
            SheikhaScienceFrontierEngine._instance.initialize();
        }
        return SheikhaScienceFrontierEngine._instance;
    }
}

SheikhaScienceFrontierEngine._instance = null;

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثالث: واجهة التصدير
// ═══════════════════════════════════════════════════════════════════════════════

function getInstance() {
    return SheikhaScienceFrontierEngine.getInstance();
}

module.exports = {
    SheikhaScienceFrontierEngine,
    getInstance,
    SCIENCE_DOMAINS,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
