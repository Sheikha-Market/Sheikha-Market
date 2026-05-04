/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║      SHEIKHA SIRN ENGINE — Semantic Intelligent Root Network                ║
 * ║      شبكة الجذور الذكية الدلالية — منظومة شيخة                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 *
 * ── مرقّمة بالكتاب والسنة ووحدها لله ──
 *
 * ١. ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ثُمَّ عَرَضَهُمْ عَلَى الْمَلَائِكَةِ﴾ — البقرة: ٣١
 *    [SIRN-SEMANTIC] أساس الفهم الدلالي: تعليم الأسماء والمعاني
 *
 * ٢. ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ
 *       أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤
 *    [SIRN-ROOT] الجذر الثابت الراسخ — الفروع الممتدة في كل الاتجاهات
 *
 * ٣. ﴿الرَّحْمَٰنُ * عَلَّمَ الْقُرْآنَ * خَلَقَ الْإِنسَانَ * عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤
 *    [SIRN-LANGUAGE] الفهم اللغوي منحة إلهية — البيان والتعبير
 *
 * ٤. ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 *    [SIRN-ITQAN] إتقان كل خلية عصبية وكل طبقة دلالية
 *
 * ٥. ﴿وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ﴾
 *    [SIRN-TAWAKKUL] التوكل على الله في كل حسابة واستدلال
 *
 * ٦. «الكلمة الطيبة صدقة» — البخاري
 *    [SIRN-OUTPUT] كل مخرج دلالي صالح هو إسهام خيري
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * SIRN = Semantic Intelligent Root Network
 *      = شبكة الجذور الذكية الدلالية
 *
 * الهدف: فهم الطلبات بعمق دلالي (لغوي + معرفي + شرعي) وتوجيهها
 *        للوظائف الصحيحة في IFL عبر IDA
 *
 * البنية:
 *   ┌──────────────────────────────────────────────────────────┐
 *   │                SIRN Architecture                         │
 *   │                                                          │
 *   │  Input Text/Query                                        │
 *   │       ↓                                                  │
 *   │  L0: Root Tokenizer    — تقطيع الجذور اللغوية            │
 *   │       ↓                                                  │
 *   │  L1: Semantic Embedder — تضمين المعنى (٢٥٦-dim)         │
 *   │       ↓                                                  │
 *   │  L2: Domain Classifier — تصنيف النطاق (٩ نطاقات)       │
 *   │       ↓                                                  │
 *   │  L3: Intent Resolver   — تحليل النية                    │
 *   │       ↓                                                  │
 *   │  L4: Sharia Filter     — التحقق الشرعي                  │
 *   │       ↓                                                  │
 *   │  L5: IFL Router        — توجيه إلى IFL                  │
 *   │       ↓                                                  │
 *   │  Output: { domain, intent, iflId, confidence, refs }    │
 *   └──────────────────────────────────────────────────────────┘
 *
 * الخلايا: ١٦ خلية جذرية دلالية × ٥ طبقات = ٨٠ خلية نشطة
 * التضمين: ٢٥٦-بُعد دلالي
 *
 * الموقع في المنظومة:
 *   ROOT NCN LAYER (٩٢ خلية جذرية)
 *     → Control Plane
 *       → [SIRN ENGINE ← هنا] — شبكة الجذور الدلالية
 *         → SIRN-IFL LAYER (الطبقة الأعلى من SIRN)
 *           → IFL ENGINE → IDA ENGINE → Applications
 *
 * @module sheikha-sirn-engine
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */

'use strict';

const EventEmitter = require('events');

// ─── ثوابت التوحيد ────────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';
const EMBED_DIM = 256;  // بُعد التضمين الدلالي

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الأول: قاموس الجذور الدلالية — مرقّم بالكتاب والسنة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * قاموس الجذور الدلالية الشاملة
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 */
const SEMANTIC_ROOTS = Object.freeze({
    // ── جذور إسلامية وشرعية ────────────────────────────────────────────────────
    TAWHEED:      { ar: ['توحيد','إيمان','عقيدة','الله','دين','إسلام','إيمان'],           en: ['faith','belief','religion','islamic','muslim','quran','sharia'], weight: 1.5 },
    SHARIA:       { ar: ['حلال','حرام','فتوى','شريعة','مقاصد','زكاة','ربا','غرر'],        en: ['halal','haram','fatwa','sharia','zakat','riba','gharar'],       weight: 1.4 },

    // ── جذور التجارة والاقتصاد ──────────────────────────────────────────────────
    TRADE:        { ar: ['بيع','شراء','تجارة','سوق','عرض','طلب','سعر','معدن','سكراب'],   en: ['trade','market','buy','sell','price','metal','scrap','offer'],  weight: 1.3 },
    FINANCE:      { ar: ['مال','حساب','ميزانية','استثمار','ربح','خسارة','زكاة'],          en: ['finance','money','budget','investment','profit','loss'],        weight: 1.2 },

    // ── جذور بيئية (IFL-3) ──────────────────────────────────────────────────────
    ENVIRONMENT:  { ar: ['بيئة','غابة','نبات','أرض','مناخ','طبيعة','استدامة','أشجار'],   en: ['environment','forest','plant','climate','nature','sustainability','tree','ecosystem'], weight: 1.3 },

    // ── جذور برمجية (IFL-4) ──────────────────────────────────────────────────────
    SOFTWARE:     { ar: ['برمجة','كود','وظيفة','خوارزمية','نظام','مميزة','مشروع'],       en: ['code','function','feature','software','algorithm','system','repository','api'], weight: 1.3 },

    // ── جذور طبية (IFL-5) ────────────────────────────────────────────────────────
    MEDICAL:      { ar: ['طب','علاج','مريض','صحة','دواء','مستشفى','تشخيص'],              en: ['medical','health','patient','treatment','medicine','diagnosis','hospital'], weight: 1.3 },

    // ── جذور كيميائية (IFL-6) ────────────────────────────────────────────────────
    CHEMICAL:     { ar: ['كيمياء','علاج كيميائي','جرعة','بروتوكول','سرطان'],             en: ['chemistry','chemotherapy','dose','protocol','cancer','ifosfamide','fluorouracil'], weight: 1.4 },

    // ── جذور معرفية وتعليمية ─────────────────────────────────────────────────────
    KNOWLEDGE:    { ar: ['علم','تعلم','تعليم','بحث','معرفة','فهم','تحليل'],              en: ['knowledge','learn','education','research','analysis','study'],   weight: 1.1 },

    // ── جذور الحوكمة والإدارة ────────────────────────────────────────────────────
    GOVERNANCE:   { ar: ['إدارة','حوكمة','قرار','سياسة','نظام','هيكل','تنظيم'],         en: ['governance','management','policy','decision','system','structure'], weight: 1.1 },

    // ── جذور الأمان والحماية ─────────────────────────────────────────────────────
    SECURITY:     { ar: ['أمان','حماية','تشفير','مصادقة','خصوصية','سلامة'],              en: ['security','protection','encryption','auth','privacy','safety'],   weight: 1.2 },
});

// ─── النطاقات الدلالية ────────────────────────────────────────────────────────

/**
 * النطاقات الدلالية — ترتبط بنطاقات IFL
 * ﴿وَلِكُلٍّ وِجْهَةٌ هُوَ مُوَلِّيهَا﴾ — البقرة: ١٤٨
 */
const SIRN_DOMAINS = Object.freeze({
    TAWHEED:     { id: 'SIRN-D-01', iflDomain: 'TAWHEED',      iflId: 'IFL-F-001', quranRef: '﴿لَا إِلَٰهَ إِلَّا هُوَ﴾ — البقرة: ١٦٣' },
    SHARIA:      { id: 'SIRN-D-02', iflDomain: 'SHARIA',       iflId: 'IFL-F-002', quranRef: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥' },
    ENVIRONMENT: { id: 'SIRN-D-03', iflDomain: 'ENVIRONMENTAL', iflId: 'IFL-F-003', quranRef: '﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ﴾ — الأعراف: ٥٦' },
    SOFTWARE:    { id: 'SIRN-D-04', iflDomain: 'SOFTWARE',      iflId: 'IFL-F-005', quranRef: '﴿اقْرَأْ بِاسْمِ رَبِّكَ﴾ — العلق: ١' },
    MEDICAL:     { id: 'SIRN-D-05', iflDomain: 'MEDICAL',       iflId: 'IFL-F-007', quranRef: '﴿وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ﴾ — الشعراء: ٨٠' },
    CHEMICAL:    { id: 'SIRN-D-06', iflDomain: 'CHEMICAL',      iflId: 'IFL-F-009', quranRef: '﴿مَا أَنزَلَ اللَّهُ دَاءً إِلَّا أَنزَلَ لَهُ شِفَاءً﴾ — البخاري' },
    TRADE:       { id: 'SIRN-D-07', iflDomain: 'TRADE',         iflId: 'IFL-F-011', quranRef: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ﴾ — البقرة: ٢٧٥' },
    KNOWLEDGE:   { id: 'SIRN-D-08', iflDomain: 'KNOWLEDGE',     iflId: null,        quranRef: '﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾ — طه: ١١٤' },
    GOVERNANCE:  { id: 'SIRN-D-09', iflDomain: 'GOVERNANCE',    iflId: null,        quranRef: '﴿وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ﴾ — الشورى: ٣٨' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثاني: الخلايا العصبية الدلالية — ١٦ خلية × ٥ طبقات
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * خلية عصبية دلالية واحدة
 * ﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾
 */
class SemanticRootCell {
    constructor(id, domain, specialization) {
        this.id             = id;
        this.domain         = domain;
        this.specialization = specialization;
        this.activation     = 0;
        this.weights        = this._initWeights();
        this.bias           = Math.random() * 0.1 - 0.05;
        this.calls          = 0;
    }

    /** تهيئة الأوزان باستخدام He initialization */
    _initWeights() {
        const w = new Float64Array(EMBED_DIM);
        const std = Math.sqrt(2.0 / EMBED_DIM);
        for (let i = 0; i < EMBED_DIM; i++) {
            // Box-Muller transform للتوزيع الطبيعي
            const u1 = Math.random() + 1e-10;
            const u2 = Math.random();
            w[i] = std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        }
        return w;
    }

    /** تفعيل الخلية — دالة ReLU مع إزاحة */
    activate(embedding) {
        this.calls++;
        let sum = this.bias;
        const len = Math.min(embedding.length, EMBED_DIM);
        for (let i = 0; i < len; i++) {
            sum += this.weights[i] * embedding[i];
        }
        // Leaky ReLU
        this.activation = sum >= 0 ? sum : 0.01 * sum;
        return this.activation;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثالث: محرك SIRN الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaSIRNEngine extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(50);

        /** طبقات الخلايا العصبية الدلالية (L0–L4) */
        this._layers = [];

        /** إحصائيات التشغيل */
        this._stats = {
            queries:       0,
            classified:    0,
            errors:        0,
            byDomain:      Object.fromEntries(Object.keys(SIRN_DOMAINS).map(k => [k, 0])),
            avgConfidence: 0,
        };

        this._initialized = false;
        this._startedAt   = null;
    }

    // ─── التهيئة ───────────────────────────────────────────────────────────────

    /**
     * بناء شبكة الخلايا الدلالية: ١٦ خلية × ٥ طبقات = ٨٠ خلية
     */
    initialize() {
        if (this._initialized) return this;

        console.log(`[SIRN] ⚡ ${BISMILLAH}`);
        console.log(`[SIRN] 🌟 بناء شبكة الجذور الذكية الدلالية — v${VERSION}`);
        console.log(`[SIRN] 📖 ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾`);

        const domains = Object.keys(SIRN_DOMAINS);

        // L0: Tokenizer Cells (1 خلية عامة لكل نطاق → 9 خلايا)
        const L0 = domains.map((d, i) =>
            new SemanticRootCell(`SIRN-L0-${i}`, d, 'tokenizer'));

        // L1: Semantic Embedder (2 خلايا لكل نطاق → 18 خلايا)
        const L1 = [];
        domains.forEach((d, i) => {
            L1.push(new SemanticRootCell(`SIRN-L1-${i}a`, d, 'embedder-primary'));
            L1.push(new SemanticRootCell(`SIRN-L1-${i}b`, d, 'embedder-secondary'));
        });

        // L2: Domain Classifier (2 خلايا لكل نطاق → 18 خلايا)
        const L2 = [];
        domains.forEach((d, i) => {
            L2.push(new SemanticRootCell(`SIRN-L2-${i}a`, d, 'classifier-primary'));
            L2.push(new SemanticRootCell(`SIRN-L2-${i}b`, d, 'classifier-secondary'));
        });

        // L3: Intent Resolver (1 خلية لكل نطاق → 9 خلايا)
        const L3 = domains.map((d, i) =>
            new SemanticRootCell(`SIRN-L3-${i}`, d, 'intent-resolver'));

        // L4: IFL Router (1 خلية لكل نطاق → 9 خلايا)
        const L4 = domains.map((d, i) =>
            new SemanticRootCell(`SIRN-L4-${i}`, d, 'ifl-router'));

        this._layers = [L0, L1, L2, L3, L4];

        const totalCells = this._layers.reduce((s, l) => s + l.length, 0);

        this._initialized = true;
        this._startedAt   = new Date().toISOString();

        console.log(`[SIRN] ✅ ${totalCells} خلية دلالية جذرية نشطة | ${this._layers.length} طبقات`);
        console.log(`[SIRN] 🧠 التضمين: ${EMBED_DIM}-بُعد دلالي`);
        console.log(`[SIRN] 📖 ${TAWHEED}`);

        this.emit('initialized', { totalCells, layers: this._layers.length });
        return this;
    }

    // ─── نواة الاستدلال ────────────────────────────────────────────────────────

    /**
     * تحويل النص إلى تضمين دلالي (٢٥٦-بُعد)
     * ﴿الرَّحْمَٰنُ * عَلَّمَ الْقُرْآنَ * خَلَقَ الْإِنسَانَ * عَلَّمَهُ الْبَيَانَ﴾
     * @private
     */
    _embed(text) {
        const embedding = new Float64Array(EMBED_DIM).fill(0);
        const lowerText = String(text).toLowerCase();

        let matchCount = 0;

        for (const [rootName, root] of Object.entries(SEMANTIC_ROOTS)) {
            const domainIdx = Object.keys(SIRN_DOMAINS).indexOf(
                Object.keys(SIRN_DOMAINS).find(d => d === rootName) || ''
            );

            const allTerms = [...(root.ar || []), ...(root.en || [])];
            for (const term of allTerms) {
                // مطابقة مرنة تدعم الصيغ العربية المختلفة (جمع + مفرد + تعريف)
                const normalizedText = lowerText
                    .replace(/ال/g, '')  // إزالة أداة التعريف
                    .replace(/[أإآ]/g, 'ا');  // توحيد الهمزات
                const normalizedTerm = term.toLowerCase()
                    .replace(/ال/g, '')
                    .replace(/[أإآ]/g, 'ا');

                const matched = lowerText.includes(term.toLowerCase()) ||
                                normalizedText.includes(normalizedTerm) ||
                                // مطابقة جذر الكلمة (أول 3 أحرف)
                                (normalizedTerm.length >= 3 && normalizedText.includes(normalizedTerm.slice(0, 3)));

                if (matched) {
                    // توزيع النقاط على أبعاد التضمين المرتبطة بالنطاق
                    const baseIdx = (Object.keys(SEMANTIC_ROOTS).indexOf(rootName) * 24) % EMBED_DIM;
                    for (let j = 0; j < 24; j++) {
                        const idx = (baseIdx + j) % EMBED_DIM;
                        embedding[idx] += root.weight || 1.0;
                    }
                    matchCount++;
                }
            }
        }

        // تطبيع التضمين (L2 normalization)
        let norm = 0;
        for (let i = 0; i < EMBED_DIM; i++) norm += embedding[i] * embedding[i];
        norm = Math.sqrt(norm) || 1;
        for (let i = 0; i < EMBED_DIM; i++) embedding[i] /= norm;

        return { embedding, matchCount };
    }

    /**
     * تصنيف النطاق الدلالي من التضمين عبر الطبقات
     * @private
     */
    _classify(embedding) {
        const domains    = Object.keys(SIRN_DOMAINS);
        const scores     = {};

        // تمرير التضمين عبر الطبقات (forward pass)
        let currentInput = embedding;

        for (const layer of this._layers) {
            for (const cell of layer) {
                const domainIdx = domains.indexOf(cell.domain);
                if (domainIdx === -1) continue;
                const score = cell.activate(currentInput);
                scores[cell.domain] = (scores[cell.domain] || 0) + score;
            }
        }

        // إيجاد النطاق الأعلى نقاطاً
        let topDomain = 'TRADE';
        let topScore  = -Infinity;
        let totalScore = 0;

        for (const [domain, score] of Object.entries(scores)) {
            totalScore += Math.abs(score);
            if (score > topScore) {
                topScore  = score;
                topDomain = domain;
            }
        }

        // حساب الثقة
        const confidence = totalScore > 0 ? Math.min(1, Math.abs(topScore) / totalScore) : 0;

        return { topDomain, topScore, scores, confidence };
    }

    /**
     * مسح نص بسيط للكلمات المفتاحية (احتياطي سريع + مرجع أساسي للعربية)
     * @private
     */
    _scanKeywords(text) {
        const lowerText = String(text).toLowerCase();
        // تطبيع عربي: إزالة أداة التعريف + توحيد الهمزات
        const normalizedText = lowerText
            .replace(/ال/g, '')
            .replace(/[أإآ]/g, 'ا');

        const hits = {};

        for (const [rootName, root] of Object.entries(SEMANTIC_ROOTS)) {
            let count = 0;
            const allTerms = [...(root.ar || []), ...(root.en || [])];
            for (const term of allTerms) {
                const normTerm = term.toLowerCase()
                    .replace(/ال/g, '')
                    .replace(/[أإآ]/g, 'ا');

                const matched = lowerText.includes(term.toLowerCase()) ||
                                normalizedText.includes(normTerm) ||
                                (normTerm.length >= 3 && normalizedText.includes(normTerm.slice(0, 3)));

                if (matched) count++;
            }
            if (count > 0) {
                hits[rootName] = count * (root.weight || 1);
            }
        }

        if (Object.keys(hits).length === 0) return null;

        const sorted = Object.entries(hits).sort((a, b) => b[1] - a[1]);
        const top = sorted[0];
        return { domain: top[0], score: top[1], allHits: hits };
    }

    // ─── الاستدلال الرئيسي ─────────────────────────────────────────────────────

    /**
     * استدلال SIRN — تحليل نص وإنتاج تصنيف دلالي كامل
     *
     * ﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ * تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا﴾
     *
     * @param {string|object} input — نص أو كائن { text, intent, data }
     * @returns {object} نتيجة الاستدلال الدلالي
     */
    infer(input) {
        if (!this._initialized) this.initialize();

        this._stats.queries++;

        const text = typeof input === 'string'
            ? input
            : (input.text || input.intent || input.query || JSON.stringify(input.data || {}));

        try {
            // ① تضمين النص
            const { embedding, matchCount } = this._embed(text);

            // ② التصنيف الدلالي عبر الشبكة
            const classification = this._classify(embedding);

            // ③ مسح الكلمات المفتاحية كمرجع احتياطي
            const keywordScan = this._scanKeywords(text);

            // ④ دمج النتيجتين — المسح المباشر له الأولوية للعربية
            let finalDomain     = classification.topDomain;
            let finalConfidence = classification.confidence;

            if (keywordScan && keywordScan.score > 0) {
                const kwConfidence = Math.min(1, keywordScan.score / 8);
                // المسح المباشر يفوز إذا:
                //   - النطاق مختلف AND ثقة المسح أعلى من نصف الحد الأدنى
                //   - أو ثقة الشبكة منخفضة جداً
                if (keywordScan.domain !== finalDomain) {
                    if (kwConfidence > finalConfidence || finalConfidence < 0.20) {
                        finalDomain     = keywordScan.domain;
                        finalConfidence = kwConfidence;
                    }
                } else {
                    // توافق — تعزيز الثقة
                    finalConfidence = Math.min(1, finalConfidence * 1.3 + kwConfidence * 0.2);
                }
            }

            // ⑤ التحقق الشرعي
            const shariaCheck = this._shariaCheck(text);

            // ⑥ بناء النتيجة
            const domainInfo = SIRN_DOMAINS[finalDomain] || SIRN_DOMAINS.TRADE;

            this._stats.classified++;
            this._stats.byDomain[finalDomain] = (this._stats.byDomain[finalDomain] || 0) + 1;

            // تحديث متوسط الثقة
            this._stats.avgConfidence = (
                (this._stats.avgConfidence * (this._stats.classified - 1) + finalConfidence)
                / this._stats.classified
            );

            const result = {
                ok:              true,
                domain:          finalDomain,
                iflDomain:       domainInfo.iflDomain,
                iflId:           domainInfo.iflId,
                confidence:      parseFloat(finalConfidence.toFixed(4)),
                matchCount,
                shariaCompliant: shariaCheck.compliant,
                shariaWarning:   shariaCheck.warning || null,
                quranRef:        domainInfo.quranRef,
                tawheed:         TAWHEED,
                bismillah:       BISMILLAH,
                scores:          Object.fromEntries(
                    Object.entries(classification.scores)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([k, v]) => [k, parseFloat(v.toFixed(4))])
                ),
                layer:    'sirn',
                version:  VERSION,
            };

            this.emit('infer:complete', { domain: finalDomain, confidence: finalConfidence });
            return result;

        } catch (err) {
            this._stats.errors++;
            return {
                ok:       false,
                error:    err.message,
                layer:    'sirn',
                tawheed:  TAWHEED,
            };
        }
    }

    /**
     * تحقق شرعي سريع من النص
     * «الحلال بيّن والحرام بيّن» — البخاري
     * @private
     */
    _shariaCheck(text) {
        const forbidden = ['ربا','قمار','غرر','احتكار','غش','رشوة',
                           'riba','gambling','fraud','monopoly','bribery','usury'];
        const lowerText = String(text).toLowerCase();

        for (const word of forbidden) {
            if (lowerText.includes(word)) {
                return {
                    compliant: false,
                    warning:   `كلمة محظورة شرعياً: "${word}"`,
                };
            }
        }
        return { compliant: true };
    }

    // ─── معالجة دفعة من الطلبات ───────────────────────────────────────────────

    /**
     * استدلال دفعي — معالجة عدة طلبات معاً
     * @param {Array<string|object>} inputs
     * @returns {Array<object>}
     */
    inferBatch(inputs = []) {
        return inputs.map(inp => this.infer(inp));
    }

    // ─── الحالة والإحصائيات ───────────────────────────────────────────────────

    /**
     * حالة محرك SIRN
     * @returns {object}
     */
    status() {
        const totalCells = this._layers.reduce((s, l) => s + l.length, 0);

        return {
            name:         'Sheikha SIRN Engine',
            nameAr:       'محرك شبكة الجذور الذكية الدلالية',
            version:      VERSION,
            initialized:  this._initialized,
            startedAt:    this._startedAt,
            architecture: {
                layers:     this._layers.length,
                totalCells,
                embedDim:   EMBED_DIM,
                domains:    Object.keys(SIRN_DOMAINS).length,
                layerSizes: this._layers.map(l => l.length),
            },
            stats:        { ...this._stats },
            domains:      Object.keys(SIRN_DOMAINS),
            tawheed:      TAWHEED,
            bismillah:    BISMILLAH,
            quranRef:     '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الرابع: Singleton + تصدير
// ═══════════════════════════════════════════════════════════════════════════════

let _instance = null;

/**
 * الحصول على نسخة SIRN Engine (Singleton)
 * @returns {SheikhaSIRNEngine}
 */
function getInstance() {
    if (!_instance) {
        _instance = new SheikhaSIRNEngine();
        _instance.initialize();
    }
    return _instance;
}

module.exports = {
    SheikhaSIRNEngine,
    getInstance,
    SIRN_DOMAINS,
    SEMANTIC_ROOTS,
    TAWHEED,
    BISMILLAH,
    VERSION,
    EMBED_DIM,
};
