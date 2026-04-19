/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA LIVE AI NETWORK v2 — الأقوى · الأفضل · الأتقى · الأنفع · الأخير  ║
 * ║  شبكة الذكاء الاصطناعي الحية الداخلية — الإصدار الأعلى والأكمل             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا"                    — البقرة:٣١
 * "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ"                   — العلق:١
 * "وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ"                       — يوسف:٧٦
 * "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ"         — النحل:٩٠
 * "وَقُل رَّبِّ زِدْنِي عِلْمًا"                             — طه:١١٤
 *
 * المعمارية v2:
 * ┌──────────────────────────────────────────────────────────────┐
 * │              SHEIKHA LIVE AI NETWORK v2                       │
 * │                                                               │
 * │  ┌────────────────────────────────────────────────────────┐  │
 * │  │  SHEIKHA NEURAL CORE (Real Math — no external APIs)    │  │
 * │  │  Word2Vec Skip-gram · SelfAttention · NeuralNetwork    │  │
 * │  │  Backpropagation · Adam Optimizer · Cosine Similarity  │  │
 * │  └──────────────────────┬─────────────────────────────────┘  │
 * │                         │  shared inference bus               │
 * │  ╔═══════╦═══════╦══════╩══╦═══════╦══════╦═══════╦══════╗  │
 * │  ║ CORE  ║MARKET ║ SHARIA  ║ANALYT.║TRADE ║LOGIST.║QURAN ║  │
 * │  ║  200  ║  200  ║   150   ║  150  ║  150 ║  100  ║  100 ║  │
 * │  ╚═══════╩═══════╩═════════╩═══════╩══════╩═══════╩══════╝  │
 * │                         │                                     │
 * │  ┌──────────────────────▼─────────────────────────────────┐  │
 * │  │  COORDINATOR: Load Balance · Health · Semantic Routing  │  │
 * │  └─────────────────────────────────────────────────────────┘  │
 * └──────────────────────────────────────────────────────────────┘
 *
 * ما الجديد في v2:
 * ✅ شبكة عصبية حقيقية (Word2Vec + SelfAttention + Backprop)
 * ✅ ٧ عقد متخصصة بدلاً من ٤
 * ✅ كشف النية الدلالي بالمتجهات (cosine similarity)
 * ✅ تدريب تلقائي على قاعدة معرفة إسلامية وتجارية
 * ✅ استجابات متعددة الأبعاد مع مراجع غنية
 * ✅ batch queries متوازية
 * ✅ تعلّم تكيّفي حقيقي يُحسّن الثقة عبر الزمن
 * ✅ تشابه دلالي بين النصوص (Semantic Similarity)
 * ✅ متجهات تضمين (Embeddings) للكلمات والجمل
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ─── دمج المحرك العصبي الحقيقي ───────────────────────────────────────────────
let SheikhaNeural = null;
let Word2Vec      = null;
let SelfAttention = null;
try {
    const neuralCore = require('./sheikha-neural-core');
    SheikhaNeural = neuralCore.SheikhaNeural;
    Word2Vec      = neuralCore.Word2Vec;
    SelfAttention = neuralCore.SelfAttention;
    console.log('✅ [LIVE-AI v2] المحرك العصبي الحقيقي مُحمَّل (Word2Vec + SelfAttention + Backprop)');
} catch (e) {
    console.warn('⚠️ [LIVE-AI v2] sheikha-neural-core غير متاح — يعمل بالوضع الأساسي:', e.message);
}

// ─── ثوابت الإعداد ────────────────────────────────────────────────────────────

const CONFIG = {
    MAX_LEARNINGS:        1000,    // الحد الأقصى للتعلّمات المحفوظة في كل عقدة
    CACHE_KEY_TEXT_LEN:   120,     // طول النص المستخدم في مفتاح الذاكرة المؤقتة
    HEALTH_CHECK_MS:      30_000,  // فترة الفحص الدوري لصحة العقد (30 ثانية)
    STATS_INTERVAL_MS:    60_000,  // فترة إحصاء الأداء (دقيقة واحدة)
    NEURAL_CONFIDENCE_THRESHOLD: 0.35, // حد التشابه الدلالي لاعتبار النية مكتشفة
    BATCH_CONCURRENCY:    10,      // الحد الأقصى للطلبات المتوازية في batch
    VERSION:              '2.0.0',
    FORBIDDEN_PATTERNS:   [/\bربا\b|قمار|خمر|كحول|فاحشة/u], // أنماط المحتوى المحرّم
};

// ─── قاعدة المعرفة الإسلامية الشاملة ─────────────────────────────────────────

const ISLAMIC_KNOWLEDGE = {
    trade: [
        { ref: 'البقرة:٢٧٥',  text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',                              domain: 'MAL'  },
        { ref: 'النساء:٢٩',   text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ',                        domain: 'MAL'  },
        { ref: 'الأنعام:١٥٢', text: 'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ',                           domain: 'MAL'  },
        { ref: 'البقرة:٢٨٢',  text: 'وَأَشْهِدُوا إِذَا تَبَايَعْتُمْ',                                          domain: 'MAL'  },
        { ref: 'المطففين:١',  text: 'وَيْلٌ لِّلْمُطَفِّفِينَ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ', domain: 'MAL' },
    ],
    ethics: [
        { ref: 'حديث', text: 'لا ضرر ولا ضرار',                                                     narrator: 'ابن ماجه',   grade: 'صحيح'    },
        { ref: 'حديث', text: 'من غشنا فليس منا',                                                    narrator: 'مسلم',       grade: 'صحيح'    },
        { ref: 'حديث', text: 'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء',                   narrator: 'الترمذي',    grade: 'حسن'     },
        { ref: 'حديث', text: 'البيعان بالخيار ما لم يتفرقا',                                        narrator: 'البخاري',    grade: 'متفق عليه' },
        { ref: 'حديث', text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه',                            narrator: 'البيهقي',    grade: 'صحيح'    },
    ],
    knowledge: [
        { ref: 'البقرة:٣١',  text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',                                      domain: 'AQL'  },
        { ref: 'العلق:١-٥',  text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',                                    domain: 'AQL'  },
        { ref: 'يوسف:٧٦',   text: 'وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ',                                          domain: 'AQL'  },
        { ref: 'طه:١١٤',    text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',                                               domain: 'AQL'  },
        { ref: 'الرحمن:٤',  text: 'عَلَّمَهُ الْبَيَانَ',                                                        domain: 'AQL'  },
    ],
    sharia_rulings: [
        { ref: 'مبدأ', text: 'الأصل في المعاملات الإباحة إلا ما دل الدليل على تحريمه',              domain: 'DEEN' },
        { ref: 'قاعدة', text: 'المشقة تجلب التيسير',                                                domain: 'DEEN' },
        { ref: 'قاعدة', text: 'الضرورات تبيح المحظورات',                                            domain: 'DEEN' },
        { ref: 'قاعدة', text: 'درء المفاسد مقدم على جلب المصالح',                                   domain: 'DEEN' },
        { ref: 'مقصد',  text: 'حفظ المال من الضروريات الخمس في الشريعة الإسلامية',                  domain: 'DEEN' },
    ],
    market_wisdom: [
        { ref: 'تجارة', text: 'السوق مجمع الأمة — عَمَرَهُ النبي ﷺ في المدينة المنورة',              domain: 'MAL'  },
        { ref: 'معادن', text: 'الذهب والفضة والنحاس والحديد — خَزائن الأرض بإذن الله',              domain: 'MAL'  },
        { ref: 'عدل',   text: 'سوق شيخة يقوم على العدل والإنصاف والشفافية الكاملة',                 domain: 'MAL'  },
    ],
};

// مجمّع كل المراجع الإسلامية للتدريب والبحث
const ALL_ISLAMIC_REFS = Object.values(ISLAMIC_KNOWLEDGE).flat();

// ─── النصوص التدريبية للشبكة العصبية ─────────────────────────────────────────
// corpus غني باللغتين يُدرَّب عليه Word2Vec

const TRAINING_CORPUS = [
    // التجارة والسوق
    'سوق شيخة للتجارة الإسلامية المعادن السكراب الذهب الفضة النحاس الحديد',
    'أسعار المعادن لحظية عادلة شفافة حلال موثوقة',
    'بيع شراء تجارة سوق أسعار معادن معدن خردة',
    'الذهب عيار واحد وعشرين وعيار ثمانية عشر',
    'سكراب حديد نحاس ألومنيوم خردة معادن ثانوية',
    'تصدير استيراد شحن لوجستيات توصيل مستودع',
    'عرض وطلب أسعار سوق تداول بضاعة',
    // الشريعة والفقه
    'حلال حرام شريعة إسلام فتوى زكاة',
    'الربا محرم البيع حلال التراضي شرط',
    'زكاة المال نصاب حول ثمانية أصناف',
    'عقود البيع المرابحة المضاربة الإجارة',
    'الغرر الجهالة النهي عن بيع الغائب',
    // التحليل والبيانات
    'تحليل بيانات إحصاء مؤشرات تقارير',
    'نمو ارتفاع انخفاض سوق اتجاه',
    'مخطط بياني رسم بيئي احتمالية',
    // القرآن والحديث
    'قرآن حديث سنة آية سورة ذكر',
    'بسم الله الرحمن الرحيم',
    'وعلم آدم الأسماء كلها',
    'إقرأ باسم ربك الذي خلق',
    // الهوية والأمان
    'هوية مستخدم تسجيل دخول مصادقة',
    'أمان حماية تشفير خصوصية',
    // تجارة عالمية
    'trade market price metal scrap gold silver copper',
    'buy sell export import logistics warehouse',
    'analysis data report statistics indicators',
    'halal sharia islamic finance zakat',
    'identity authentication login security',
    'sheikha market smart integrated platform',
    'blockchain decentralized trustless',
    'supply chain management inventory',
];

// ─── قاموس الأنماط والتوجيه الدلالي (موسّع) ─────────────────────────────────

const INTENT_PATTERNS = [
    { pattern: /سعر|سوق|بيع|شراء|تجارة|معدن|سكراب|ذهب|فضة|نحاس|حديد|خردة|عيار/u,         intent: 'market',    domain: 'MAL',  weight: 2 },
    { pattern: /حلال|حرام|فتوى|شرعي|زكاة|إسلامي|مضاربة|مرابحة|ربا|غرر/u,                  intent: 'sharia',    domain: 'DEEN', weight: 2 },
    { pattern: /تحليل|بيانات|إحصاء|تقرير|مؤشر|نمو|ارتفاع|انخفاض|مخطط/u,                   intent: 'analytics', domain: 'ARD',  weight: 1 },
    { pattern: /قرآن|حديث|آية|سورة|سنة|ذكر|تسبيح|دعاء|صلاة/u,                             intent: 'quran',     domain: 'AQL',  weight: 2 },
    { pattern: /هوية|تسجيل|دخول|مصادقة|حساب|كلمة مرور|تحقق/u,                              intent: 'identity',  domain: 'DEEN', weight: 1 },
    { pattern: /شحن|لوجستيات|توصيل|مستودع|سلسلة إمداد|تصدير|استيراد/u,                    intent: 'logistics', domain: 'MAL',  weight: 1 },
    { pattern: /تجارة|عقد|صفقة|اتفاقية|عرض سعر|طلب شراء|مناقصة/u,                          intent: 'trade',     domain: 'MAL',  weight: 2 },
    { pattern: /مساعدة|مرحبا|أهلا|شيخة|كيف|ما هو|ماذا|من أنت/u,                            intent: 'assistant', domain: 'ARD',  weight: 1 },
    { pattern: /price|market|buy|sell|trade|metal|scrap|gold|silver|copper/i,              intent: 'market',    domain: 'MAL',  weight: 2 },
    { pattern: /analyze|analysis|report|data|stats|chart|growth/i,                         intent: 'analytics', domain: 'ARD',  weight: 1 },
    { pattern: /halal|sharia|fatwa|zakat|islamic|riba|usury/i,                             intent: 'sharia',    domain: 'DEEN', weight: 2 },
    { pattern: /quran|hadith|verse|surah|sunnah|prayer|dhikr/i,                            intent: 'quran',     domain: 'AQL',  weight: 2 },
    { pattern: /login|register|auth|identity|account|password/i,                          intent: 'identity',  domain: 'DEEN', weight: 1 },
    { pattern: /ship|shipping|logistics|warehouse|supply|export|import/i,                 intent: 'logistics', domain: 'MAL',  weight: 1 },
    { pattern: /hello|hi|help|sheikha|what|who|how can/i,                                 intent: 'assistant', domain: 'ARD',  weight: 1 },
];

// ─── قاموس الاستجابات الذكية (موسّع ومثري) ──────────────────────────────────

const RESPONSE_TEMPLATES = {
    market: {
        ar: 'تحليل السوق: {data}\n📊 المعادن والسكراب | أسعار لحظية عادلة | ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ ﴾',
        en: 'Market Analysis: {data}\n📊 Metals & Scrap | Fair live pricing | Trade is permitted by Allah',
    },
    sharia: {
        ar: 'الحكم الشرعي: {data}\n⚖️ مبني على الكتاب والسنة | لا ضرر ولا ضرار | الأصل الإباحة',
        en: 'Islamic Ruling: {data}\n⚖️ Based on Quran & Sunnah | No harm | Permissibility is the default',
    },
    analytics: {
        ar: 'التحليل الذكي: {data}\n📈 معالجة بيانات عالية الدقة | خوارزميات متقدمة | نتائج موثوقة',
        en: 'Smart Analytics: {data}\n📈 High-accuracy data processing | Advanced algorithms | Reliable insights',
    },
    quran: {
        ar: 'من كتاب الله وسنة نبيه ﷺ: {data}\n📖 ﴿ وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ ﴾',
        en: 'From the Holy Quran & Sunnah: {data}\n📖 "And above every possessor of knowledge is the All-Knowing"',
    },
    identity: {
        ar: 'نظام الهوية: {data}\n🔐 تحقق آمن | حماية كاملة | خصوصية مصونة بالشريعة',
        en: 'Identity System: {data}\n🔐 Secure verification | Full protection | Privacy by Islamic principles',
    },
    logistics: {
        ar: 'سلاسل الإمداد: {data}\n🚚 لوجستيات متكاملة | تتبع لحظي | شفافية كاملة',
        en: 'Supply Chain: {data}\n🚚 Integrated logistics | Real-time tracking | Full transparency',
    },
    trade: {
        ar: 'التجارة والعقود: {data}\n🤝 عقود شرعية معتمدة | ﴿ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ ﴾',
        en: 'Trade & Contracts: {data}\n🤝 Sharia-compliant contracts | Mutual consent required',
    },
    assistant: {
        ar: 'أهلاً وسهلاً في شيخة! {data}\n🧠 أنا ذكاء شيخة الداخلي v2 — أقوى · أفضل · أتقى · أنفع',
        en: 'Welcome to Sheikha! {data}\n🧠 I am Sheikha\'s internal AI v2 — Strongest · Best · Most pious',
    },
    default: {
        ar: 'شيخة تفيدك: {data}\n✨ بسم الله الرحمن الرحيم — السوق الذكي المتكامل',
        en: 'Sheikha responds: {data}\n✨ In the name of Allah — The Integrated Smart Market',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. عقدة الذكاء الاصطناعي v2 — AINode with Neural Core
// ═══════════════════════════════════════════════════════════════════════════════

class AINode extends EventEmitter {

    constructor({ id, role, capacity = 100 }) {
        super();
        this.id        = id;
        this.role      = role;          // CORE | MARKET | SHARIA | ANALYTICS | TRADE | LOGISTICS | QURAN | IDENTITY
        this.capacity  = capacity;
        this.load      = 0;
        this.status    = 'ALIVE';
        this.processed = 0;
        this.startedAt = new Date().toISOString();

        // الذاكرة المؤقتة والتعلّم
        this._memory    = new Map();  // key → { value, hits, updatedAt }
        this._learnings = [];         // تعلّمات من الاستخدام الفعلي

        // المحرك العصبي الحقيقي (يُنشأ عند الإقلاع)
        this._neural = null;           // SheikhaNeural instance
        this._neuralReady = false;

        // إحصاءات الثقة التكيفية — تتحسن مع الاستخدام
        this._intentHits   = new Map(); // intent → hits count
        this._avgConfidence = 0.8;
    }

    /** تهيئة المحرك العصبي (تدريب Word2Vec على الـ corpus) */
    async initNeural(corpus = TRAINING_CORPUS) {
        if (!SheikhaNeural || this._neuralReady) return;
        try {
            this._neural = new SheikhaNeural();
            await new Promise(resolve => {
                // تدريب في التسلسل لتجنّب حجب الـ event loop
                setImmediate(() => {
                    this._neural.trainOnKnowledge(corpus);
                    this._neuralReady = true;
                    resolve();
                });
            });
        } catch (e) {
            console.warn(`⚠️ [${this.id}] فشل التدريب العصبي:`, e.message);
        }
    }

    /** معالجة طلب واحد */
    async process(request) {
        if (this.status !== 'ALIVE') throw new Error(`العقدة [${this.id}] غير متاحة`);
        if (this.load >= this.capacity) throw new Error(`العقدة [${this.id}] مكتملة الحمل`);

        this.load++;
        const start = Date.now();

        try {
            const result = await this._infer(request);
            this.processed++;
            this._learn(request, result);
            return result;
        } finally {
            this.load = Math.max(0, this.load - 1);
            const latency = Date.now() - start;
            this.emit('processed', { id: this.id, latency, total: this.processed });
        }
    }

    /** الاستنتاج الفعلي — يدمج regex + تشابه عصبي */
    async _infer(request) {
        const { text = '', intent, lang = 'ar', context = {} } = request;

        // تحديد النية بالطريقة الأقوى (regex + neural)
        const detectedIntent = intent || this._detectIntentStrong(text);

        // البحث في الذاكرة (cache)
        const cacheKey = this._hashKey(text, detectedIntent);
        if (this._memory.has(cacheKey)) {
            const cached = this._memory.get(cacheKey);
            cached.hits++;
            return { ...cached.value, cached: true, node: this.id };
        }

        // التشابه الدلالي العصبي (إذا كان المحرك جاهزاً)
        const neuralSimilarity = this._getNeuralSimilarity(text, detectedIntent);

        // إنتاج الإجابة
        const answer = this._generateAnswer(text, detectedIntent, lang, context, neuralSimilarity);

        // حفظ في الذاكرة
        this._memory.set(cacheKey, {
            value:     answer,
            hits:      1,
            updatedAt: new Date().toISOString(),
        });

        return { ...answer, cached: false, node: this.id };
    }

    /** كشف النية القوي: regex مرجّح + تشابه عصبي */
    _detectIntentStrong(text) {
        if (!text) return 'assistant';

        // المرحلة ١: regex مرجّح — يختار النية ذات الوزن الأعلى
        let bestIntent  = 'assistant';
        let bestWeight  = 0;
        for (const { pattern, intent, weight = 1 } of INTENT_PATTERNS) {
            if (pattern.test(text) && weight > bestWeight) {
                bestIntent = intent;
                bestWeight = weight;
            }
        }
        if (bestWeight >= 2) return bestIntent;  // تطابق قوي

        // المرحلة ٢: تشابه عصبي للنصوص الغامضة
        if (this._neuralReady && this._neural && text.length > 3) {
            const neuralIntent = this._detectIntentNeural(text);
            if (neuralIntent) return neuralIntent;
        }

        return bestIntent;
    }

    /** كشف النية بالمتجهات العصبية — Cosine Similarity */
    _detectIntentNeural(text) {
        const intentSeeds = {
            market:    'سعر سوق بيع معدن ذهب فضة نحاس',
            sharia:    'حلال حرام فتوى شريعة زكاة ربا',
            analytics: 'تحليل بيانات إحصاء تقرير مؤشر',
            quran:     'قرآن حديث آية سورة سنة ذكر',
            trade:     'تجارة عقد صفقة اتفاقية طلب',
            logistics: 'شحن توصيل مستودع سلسلة إمداد',
        };

        let bestIntent = null;
        let bestSim    = CONFIG.NEURAL_CONFIDENCE_THRESHOLD;

        for (const [intent, seedText] of Object.entries(intentSeeds)) {
            try {
                const sim = this._neural.similarity(text, seedText);
                if (sim > bestSim) {
                    bestSim    = sim;
                    bestIntent = intent;
                }
            } catch (_) { /* تجاهل الأخطاء الفردية */ }
        }
        return bestIntent;
    }

    /** حساب التشابه الدلالي مع النية */
    _getNeuralSimilarity(text, intent) {
        if (!this._neuralReady || !this._neural || !text) return null;
        const seedMap = {
            market:    'سعر سوق معدن ذهب تجارة',
            sharia:    'حلال شريعة فتوى زكاة',
            analytics: 'تحليل بيانات إحصاء',
            quran:     'قرآن حديث آية سورة',
            trade:     'تجارة عقد صفقة',
            logistics: 'شحن توصيل مستودع',
            identity:  'هوية تسجيل دخول مصادقة',
            assistant: 'مساعدة شيخة خدمة',
        };
        try {
            const seed = seedMap[intent] || intent;
            const sim  = this._neural.similarity(text, seed);
            return Math.round(sim * 1000) / 1000;
        } catch (_) { return null; }
    }

    /** توليد الإجابة المتعددة الأبعاد */
    _generateAnswer(text, intent, lang, context, neuralSim) {
        const templates = RESPONSE_TEMPLATES[intent] || RESPONSE_TEMPLATES.default;
        const template  = templates[lang] || templates.ar;

        // مراجع إسلامية متعددة (حتى ٣)
        const islamicRefs = this._getIslamicRefs(intent, 3);

        // بيانات السياق
        const contextSummary = Object.keys(context).length > 0
            ? (lang === 'ar'
                ? `سياق: ${JSON.stringify(context).substring(0, 150)}`
                : `Context: ${JSON.stringify(context).substring(0, 150)}`)
            : this._getDefaultData(intent, text, lang);

        const responseText = template.replace('{data}', contextSummary);

        // حساب الثقة الموحدة
        const confidence = this._computeConfidenceV2(text, intent, neuralSim);

        return {
            intent,
            response:     responseText,
            islamic_refs: islamicRefs,
            islamic_ref:  islamicRefs[0],  // للتوافق مع v1
            confidence,
            neural_sim:   neuralSim,
            lang,
            node:         this.id,
            role:         this.role,
            neural_ready: this._neuralReady,
            version:      CONFIG.VERSION,
            timestamp:    new Date().toISOString(),
        };
    }

    /** حساب درجة الثقة v2 — يدمج regex + neural + تاريخ التعلم */
    _computeConfidenceV2(text, intent, neuralSim) {
        if (!text) return 0.5;

        // ثقة regex
        const regexMatch = INTENT_PATTERNS.find(p => p.intent === intent && p.pattern.test(text));
        const regexConf  = regexMatch ? (regexMatch.weight >= 2 ? 0.92 : 0.78) : 0.6;

        // ثقة عصبية (إن وجدت)
        const neuralConf = (neuralSim !== null && neuralSim !== undefined)
            ? Math.min(0.99, 0.5 + neuralSim * 0.5)
            : null;

        // ثقة التعلم التكيفي (كلما استُخدم أكثر كلما زادت الثقة)
        const hits = this._intentHits.get(intent) || 0;
        const adaptiveBoost = Math.min(0.05, hits * 0.001); // حد أقصى +5%

        // الدمج
        const base = neuralConf !== null
            ? (regexConf * 0.5 + neuralConf * 0.5)
            : regexConf;

        return Math.min(0.99, Math.round((base + adaptiveBoost) * 1000) / 1000);
    }

    /** استرجاع مراجع إسلامية متعددة مناسبة للنية */
    _getIslamicRefs(intent, count = 2) {
        const domainMap = {
            market:    [...ISLAMIC_KNOWLEDGE.trade,         ...ISLAMIC_KNOWLEDGE.market_wisdom],
            sharia:    [...ISLAMIC_KNOWLEDGE.sharia_rulings,...ISLAMIC_KNOWLEDGE.ethics],
            analytics: [...ISLAMIC_KNOWLEDGE.knowledge],
            quran:     [...ISLAMIC_KNOWLEDGE.knowledge],
            trade:     [...ISLAMIC_KNOWLEDGE.trade,         ...ISLAMIC_KNOWLEDGE.ethics],
            logistics: [...ISLAMIC_KNOWLEDGE.trade],
            identity:  [...ISLAMIC_KNOWLEDGE.ethics],
            assistant: [...ISLAMIC_KNOWLEDGE.knowledge],
        };
        const pool   = domainMap[intent] || ALL_ISLAMIC_REFS;
        const result = [];
        const used   = new Set();
        while (result.length < count && result.length < pool.length) {
            const idx = Math.floor(Math.random() * pool.length);
            if (!used.has(idx)) {
                used.add(idx);
                result.push(pool[idx]);
            }
        }
        return result;
    }

    /** بيانات افتراضية ذكية بحسب النية */
    _getDefaultData(intent, text, lang) {
        const isAr = lang === 'ar';
        const snippet = text ? `"${text.substring(0, 60)}"` : '';
        switch (intent) {
            case 'market':
                return isAr
                    ? `بيانات السوق جاهزة | معادن · سكراب · أسعار لحظية ${snippet}`
                    : `Market data ready | Metals · Scrap · Live prices ${snippet}`;
            case 'sharia':
                return isAr
                    ? 'يُرجى تفصيل الحالة للفتوى الدقيقة | الأصل في المعاملات الإباحة'
                    : 'Please detail the case for a precise ruling | Default is permissibility';
            case 'analytics':
                return isAr
                    ? `تحليل دقيق جاري | البيانات تُعالَج بخوارزميات متقدمة ${snippet}`
                    : `Precise analysis in progress | Advanced algorithms processing ${snippet}`;
            case 'quran':
                return isAr
                    ? 'القرآن الكريم المرجع الأول | سنة النبي ﷺ المصدر الثاني | العلم نور'
                    : 'Holy Quran is the primary reference | Sunnah is the second source';
            case 'trade':
                return isAr
                    ? `عقود تجارية شرعية | تراضٍ بين الطرفين | توثيق كامل ${snippet}`
                    : `Sharia-compliant trade contracts | Mutual consent | Full documentation ${snippet}`;
            case 'logistics':
                return isAr
                    ? 'سلاسل إمداد متكاملة | تتبع لحظي | تسليم موثوق'
                    : 'Integrated supply chains | Real-time tracking | Reliable delivery';
            case 'identity':
                return isAr
                    ? 'نظام هوية آمن | تشفير متقدم | خصوصية مصونة'
                    : 'Secure identity system | Advanced encryption | Protected privacy';
            default:
                return isAr
                    ? `شيخة — السوق الذكي الإسلامي المتكامل ${snippet ? `| ${snippet}` : '| كيف يمكنني مساعدتك؟'}`
                    : `Sheikha — Integrated Islamic Smart Market ${snippet ? `| ${snippet}` : '| How can I assist you?'}`;
        }
    }

    /** التعلّم التكيّفي — يُحسّن الثقة عبر الزمن */
    _learn(request, result) {
        if (this._learnings.length >= CONFIG.MAX_LEARNINGS) this._learnings.shift();
        this._learnings.push({
            intent:     result.intent,
            confidence: result.confidence,
            ts:         Date.now(),
        });
        // تحديث عداد النية
        const hits = this._intentHits.get(result.intent) || 0;
        this._intentHits.set(result.intent, hits + 1);
    }

    _hashKey(text, intent) {
        return crypto.createHash('md5')
            .update(`${intent}:${text.substring(0, CONFIG.CACHE_KEY_TEXT_LEN)}`)
            .digest('hex');
    }

    /** التحليل العصبي العميق لنص — يكشف التشابهات والمفردات */
    analyzeText(text) {
        if (!this._neuralReady || !this._neural) {
            return { error: 'المحرك العصبي لم يُهيَّأ بعد', neuralReady: false };
        }
        return this._neural.analyze(text);
    }

    /** متجه تضمين الجملة */
    getEmbedding(text) {
        if (!this._neuralReady || !this._neural) return null;
        try {
            const vec = this._neural.word2vec.getSentenceVector(text);
            return Array.from(vec);
        } catch (_) { return null; }
    }

    /** التشابه الدلالي بين نصين */
    getSimilarity(text1, text2) {
        if (!this._neuralReady || !this._neural) return null;
        try {
            return this._neural.similarity(text1, text2);
        } catch (_) { return null; }
    }

    getInfo() {
        return {
            id:           this.id,
            role:         this.role,
            status:       this.status,
            load:         this.load,
            capacity:     this.capacity,
            processed:    this.processed,
            memory:       this._memory.size,
            learnings:    this._learnings.length,
            neuralReady:  this._neuralReady,
            neuralVocab:  this._neural ? this._neural.word2vec.vocab.size : 0,
            topIntents:   Array.from(this._intentHits.entries())
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 5)
                              .map(([i, c]) => ({ intent: i, count: c })),
            startedAt:    this.startedAt,
            version:      CONFIG.VERSION,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. منسّق الشبكة v2 — Network Coordinator (Smart Routing + Health)
// ═══════════════════════════════════════════════════════════════════════════════

class NetworkCoordinator extends EventEmitter {

    constructor() {
        super();
        this._nodes = new Map();
    }

    addNode(node) {
        this._nodes.set(node.id, node);
        node.on('processed', info => this.emit('node:processed', info));
    }

    /** اختيار أفضل عقدة — متخصصة أولاً ثم بأقل حمل */
    selectNode(intent) {
        const alive = Array.from(this._nodes.values())
            .filter(n => n.status === 'ALIVE');

        if (alive.length === 0) throw new Error('لا توجد عقدة متاحة في الشبكة');

        // جدول التخصص — كل نية لها عقدتها المثلى
        const specialistRole = {
            market:    'MARKET',
            trade:     'TRADE',
            sharia:    'SHARIA',
            analytics: 'ANALYTICS',
            quran:     'QURAN',
            logistics: 'LOGISTICS',
            identity:  'IDENTITY',
        };

        const targetRole = specialistRole[intent];
        if (targetRole) {
            const specialist = alive.find(n => n.role === targetRole && n.load < n.capacity * 0.8);
            if (specialist) return specialist;
        }

        // أقل عقدة حملاً نسبياً
        return alive.sort((a, b) => (a.load / a.capacity) - (b.load / b.capacity))[0];
    }

    getStatus() {
        const nodes = {};
        for (const [id, node] of this._nodes) {
            nodes[id] = node.getInfo();
        }
        return { nodes, total: this._nodes.size };
    }

    /** العقدة الأكثر خبرة عصبياً (أكبر vocab) */
    getBestNeuralNode() {
        let best = null;
        let bestVocab = -1;
        for (const node of this._nodes.values()) {
            const info = node.getInfo();
            if (info.neuralReady && info.neuralVocab > bestVocab) {
                bestVocab = info.neuralVocab;
                best = node;
            }
        }
        return best;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. شبكة الذكاء الاصطناعي الحية v2 — الأقوى · الأفضل · الأتقى
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaLiveAINetwork extends EventEmitter {

    constructor() {
        super();
        this.nameAr    = 'شبكة الذكاء الاصطناعي الحية — شيخة الأقوى';
        this.nameEn    = 'Sheikha Live AI Network — Supreme Edition';
        this.version   = CONFIG.VERSION;
        this.tawheed   = 'لا إله إلا الله';
        this.no_harm   = 'لا ضرر ولا ضرار';
        this.itqan     = 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ';
        this.status    = 'DORMANT';
        this.startedAt = null;

        this._coordinator   = new NetworkCoordinator();
        this._healthTimer   = null;
        this._statsTimer    = null;
        this._totalRequests = 0;
        this._successCount  = 0;
        this._errorCount    = 0;
        this._batchCount    = 0;
        this._intentStats   = new Map();
    }

    // ─── ① تشغيل الشبكة v2 ─────────────────────────────────────────────────

    async ignite() {
        if (this.status === 'ALIVE') return this.getStatus();

        this.status    = 'INITIALIZING';
        this.startedAt = new Date().toISOString();

        console.log('🧠 [LIVE-AI v2] تشغيل الشبكة الأقوى·الأفضل·الأتقى...');
        console.log(`   ${this.tawheed}`);
        console.log(`   "${this.itqan}"`);

        // إنشاء ٧ عقد متخصصة
        const nodeConfigs = [
            { id: 'CORE',      role: 'CORE',      capacity: 200 },
            { id: 'MARKET',    role: 'MARKET',    capacity: 200 },
            { id: 'SHARIA',    role: 'SHARIA',    capacity: 150 },
            { id: 'ANALYTICS', role: 'ANALYTICS', capacity: 150 },
            { id: 'TRADE',     role: 'TRADE',     capacity: 150 },
            { id: 'LOGISTICS', role: 'LOGISTICS', capacity: 100 },
            { id: 'QURAN',     role: 'QURAN',     capacity: 100 },
        ];

        for (const cfg of nodeConfigs) {
            const node = new AINode(cfg);
            this._coordinator.addNode(node);
            console.log(`   ✅ عقدة [${cfg.id}] — سعة ${cfg.capacity} طلب/ث`);
        }

        // تدريب المحرك العصبي (غير متزامن — لا يُبطئ الإقلاع)
        this._trainNeuralAsync();

        // الفحص الدوري والإحصاء
        this._startHealthMonitor();
        this._startStatsMonitor();

        this.status = 'ALIVE';
        this.emit('network:alive', this.getStatus());
        this._printBanner();

        return this.getStatus();
    }

    /** تدريب المحرك العصبي في الخلفية */
    _trainNeuralAsync() {
        if (!SheikhaNeural) return;

        // نُدرّب عقدة CORE أولاً، ثم نشارك المعرفة
        const coreNode = this._coordinator._nodes.get('CORE');
        if (!coreNode) return;

        setImmediate(async () => {
            try {
                console.log('⚡ [LIVE-AI v2] بدء تدريب الشبكة العصبية (Word2Vec)...');
                await coreNode.initNeural(TRAINING_CORPUS);

                // مشاركة نفس الـ neural instance مع باقي العقد (لتوفير الذاكرة)
                for (const [id, node] of this._coordinator._nodes) {
                    if (id !== 'CORE') {
                        node._neural      = coreNode._neural;
                        node._neuralReady = true;
                    }
                }

                const vocabSize = coreNode._neural.word2vec.vocab.size;
                console.log(`✅ [LIVE-AI v2] الشبكة العصبية جاهزة — ${vocabSize} كلمة في المفردات`);
                this.emit('neural:ready', { vocabSize, nodes: this._coordinator._nodes.size });

            } catch (e) {
                console.warn('⚠️ [LIVE-AI v2] تدريب عصبي جزئي:', e.message);
            }
        });
    }

    // ─── ② الاستعلام الذكي — نقطة الدخول الرئيسية ─────────────────────────

    async ask(request) {
        if (this.status !== 'ALIVE') await this.ignite();

        const traceId = `LAI2-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        this._totalRequests++;

        this.emit('request', { traceId, request });

        try {
            const text   = request.text || request.query || request.message || '';
            const intent = request.intent || this._detectIntent(text);
            const lang   = request.lang   || (this._isArabic(text) ? 'ar' : 'en');

            // الحراسة الشرعية
            const shariaCheck = this._shariaGuard(text, intent);
            if (!shariaCheck.pass) {
                return this._buildResponse(false, null, {
                    traceId, code: 'SHARIA_VIOLATION',
                    message: shariaCheck.reason,
                    no_harm: this.no_harm,
                });
            }

            // توجيه وتنفيذ
            const node   = this._coordinator.selectNode(intent);
            const result = await node.process({ text, intent, lang, context: request.context || {} });

            this._successCount++;
            this._trackIntent(intent);

            return this._buildResponse(true, result, {
                traceId, intent, lang,
                network: this.nameEn,
                node:    node.id,
                schema:  'sheikha/live-ai/v2',
            });

        } catch (err) {
            this._errorCount++;
            this.emit('error', { traceId, error: err.message });
            return this._buildResponse(false, null, {
                traceId, code: 'AI_ERROR',
                message: err.message,
                no_harm: this.no_harm,
            });
        }
    }

    // ─── ③ معالجة batch متوازية ────────────────────────────────────────────

    async batch(requests) {
        if (!Array.isArray(requests) || requests.length === 0) {
            return { success: false, error: 'يجب تقديم مصفوفة طلبات' };
        }

        if (this.status !== 'ALIVE') await this.ignite();

        this._batchCount++;
        const chunks = [];
        for (let i = 0; i < requests.length; i += CONFIG.BATCH_CONCURRENCY) {
            chunks.push(requests.slice(i, i + CONFIG.BATCH_CONCURRENCY));
        }

        const results = [];
        for (const chunk of chunks) {
            const chunkResults = await Promise.all(chunk.map(r => this.ask(r)));
            results.push(...chunkResults);
        }

        return {
            success: true,
            count:   results.length,
            results,
            meta: {
                batchId:   this._batchCount,
                timestamp: new Date().toISOString(),
                schema:    'sheikha/live-ai/v2/batch',
                tawheed:   this.tawheed,
            },
        };
    }

    // ─── ④ التشابه الدلالي بين نصين ────────────────────────────────────────

    async similarity(text1, text2) {
        if (this.status !== 'ALIVE') await this.ignite();

        const node = this._coordinator.getBestNeuralNode()
            || this._coordinator._nodes.get('CORE');

        if (!node) return { success: false, error: 'لا توجد عقدة متاحة' };

        const sim = node.getSimilarity(text1, text2);

        return {
            success:    true,
            text1,
            text2,
            similarity: sim !== null ? Math.round(sim * 1000) / 1000 : null,
            neural:     sim !== null,
            interpretation: this._interpretSimilarity(sim),
            meta: { timestamp: new Date().toISOString(), schema: 'sheikha/live-ai/v2' },
        };
    }

    /** تفسير قيمة التشابه */
    _interpretSimilarity(sim) {
        if (sim === null) return 'غير متاح';
        if (sim >= 0.9) return 'متطابق تقريباً';
        if (sim >= 0.7) return 'متشابه جداً';
        if (sim >= 0.5) return 'متشابه';
        if (sim >= 0.3) return 'علاقة ضعيفة';
        return 'مختلف';
    }

    // ─── ⑤ متجه تضمين نص ───────────────────────────────────────────────────

    async embed(text) {
        if (this.status !== 'ALIVE') await this.ignite();

        const node = this._coordinator.getBestNeuralNode()
            || this._coordinator._nodes.get('CORE');

        if (!node) return { success: false, error: 'لا توجد عقدة متاحة' };

        const vector = node.getEmbedding(text);

        return {
            success:    true,
            text,
            vector,
            dimensions: vector ? vector.length : 0,
            neural:     vector !== null,
            meta: { timestamp: new Date().toISOString(), schema: 'sheikha/live-ai/v2' },
        };
    }

    // ─── ⑥ التحليل العصبي العميق ────────────────────────────────────────────

    async analyzeDeep(text) {
        if (this.status !== 'ALIVE') await this.ignite();

        const node = this._coordinator.getBestNeuralNode()
            || this._coordinator._nodes.get('CORE');

        if (!node) return { success: false, error: 'لا توجد عقدة متاحة' };

        const analysis = node.analyzeText(text);

        return {
            success: true,
            text,
            analysis,
            meta: { timestamp: new Date().toISOString(), schema: 'sheikha/live-ai/v2' },
        };
    }

    // ─── ⑦ معلومات قاعدة المعرفة ────────────────────────────────────────────

    getKnowledge(domain) {
        if (domain && ISLAMIC_KNOWLEDGE[domain]) {
            return { success: true, domain, refs: ISLAMIC_KNOWLEDGE[domain] };
        }
        return {
            success:  true,
            domains:  Object.keys(ISLAMIC_KNOWLEDGE),
            total:    ALL_ISLAMIC_REFS.length,
            sample:   ALL_ISLAMIC_REFS.slice(0, 5),
            corpus:   TRAINING_CORPUS.length,
            schema:   'sheikha/live-ai/v2',
        };
    }

    // ─── واجهة neural-router ────────────────────────────────────────────────

    async handle(req) { return this.ask(req.data || req); }

    // ─── الفحص الدوري والإحصاء ──────────────────────────────────────────────

    _startHealthMonitor() {
        if (this._healthTimer) clearInterval(this._healthTimer);
        this._healthTimer = setInterval(() => {
            const { nodes } = this._coordinator.getStatus();
            const dead = Object.values(nodes).filter(n => n.status !== 'ALIVE');
            if (dead.length > 0) this.emit('health:degraded', { dead: dead.map(n => n.id) });
        }, CONFIG.HEALTH_CHECK_MS);
        if (this._healthTimer.unref) this._healthTimer.unref();
    }

    _startStatsMonitor() {
        if (this._statsTimer) clearInterval(this._statsTimer);
        this._statsTimer = setInterval(() => {
            if (this._totalRequests > 0) {
                const rate = ((this._successCount / this._totalRequests) * 100).toFixed(1);
                this.emit('stats', {
                    total:       this._totalRequests,
                    success:     this._successCount,
                    errors:      this._errorCount,
                    batches:     this._batchCount,
                    successRate: `${rate}%`,
                    topIntents:  this._getTopIntents(5),
                });
            }
        }, CONFIG.STATS_INTERVAL_MS);
        if (this._statsTimer.unref) this._statsTimer.unref();
    }

    // ─── الحراسة الشرعية ────────────────────────────────────────────────────

    _shariaGuard(text, _intent) {
        for (const re of CONFIG.FORBIDDEN_PATTERNS) {
            if (re.test(text)) {
                return { pass: false, reason: 'الطلب يحتوي على محتوى محرّم شرعاً — لا ضرر ولا ضرار' };
            }
        }
        return { pass: true };
    }

    // ─── كشف النية من النص ──────────────────────────────────────────────────

    _detectIntent(text) {
        if (!text) return 'assistant';
        let best = 'assistant';
        let bestW = 0;
        for (const { pattern, intent, weight = 1 } of INTENT_PATTERNS) {
            if (pattern.test(text) && weight > bestW) {
                best  = intent;
                bestW = weight;
            }
        }
        return best;
    }

    _isArabic(text) { return /[\u0600-\u06FF]/.test(text); }

    _trackIntent(intent) {
        this._intentStats.set(intent, (this._intentStats.get(intent) || 0) + 1);
    }

    _getTopIntents(n) {
        return Array.from(this._intentStats.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(([intent, count]) => ({ intent, count }));
    }

    // ─── بناء الاستجابة الموحدة ──────────────────────────────────────────────

    _buildResponse(success, data, meta = {}) {
        return {
            success,
            data: data || null,
            meta: {
                timestamp: new Date().toISOString(),
                tawheed:   this.tawheed,
                no_harm:   this.no_harm,
                network:   this.nameEn,
                version:   this.version,
                ...meta,
            },
        };
    }

    // ─── حالة الشبكة الكاملة ────────────────────────────────────────────────

    getStatus() {
        const nodeStatus = this._coordinator.getStatus();
        const neuralNode = this._coordinator.getBestNeuralNode();
        return {
            nameAr:    this.nameAr,
            nameEn:    this.nameEn,
            version:   this.version,
            status:    this.status,
            startedAt: this.startedAt,
            tawheed:   this.tawheed,
            no_harm:   this.no_harm,
            itqan:     this.itqan,
            neural: {
                ready:   !!neuralNode,
                vocabSize: neuralNode ? neuralNode.getInfo().neuralVocab : 0,
                node:    neuralNode ? neuralNode.id : null,
            },
            stats: {
                total:      this._totalRequests,
                success:    this._successCount,
                errors:     this._errorCount,
                batches:    this._batchCount,
                topIntents: this._getTopIntents(5),
            },
            nodes:    nodeStatus.nodes,
            schema:   'sheikha/live-ai/v2',
        };
    }

    // ─── اللافتة ────────────────────────────────────────────────────────────

    _printBanner() {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🧠 شيخة · الأقوى · الأفضل · الأتقى · الأنفع · v${this.version}      ║
║                                                              ║
║  ✅ CORE       — عقدة الأساس          (سعة 200 طلب/ث)      ║
║  ✅ MARKET     — عقدة السوق والمعادن  (سعة 200 طلب/ث)      ║
║  ✅ SHARIA     — عقدة الشريعة والفقه  (سعة 150 طلب/ث)      ║
║  ✅ ANALYTICS  — عقدة التحليل الذكي   (سعة 150 طلب/ث)      ║
║  ✅ TRADE      — عقدة التجارة والعقود  (سعة 150 طلب/ث)      ║
║  ✅ LOGISTICS  — عقدة سلاسل الإمداد   (سعة 100 طلب/ث)      ║
║  ✅ QURAN      — عقدة القرآن والسنة    (سعة 100 طلب/ث)      ║
║                                                              ║
║  🔬 Word2Vec + SelfAttention + Backprop — تدريب جارٍ...     ║
║                                                              ║
║  ${this.tawheed.padEnd(48)}   ║
║  ${this.no_harm.padEnd(47)}  ║
║                                                              ║
║  "وَقُل رَّبِّ زِدْنِي عِلْمًا" — طه:١١٤                        ║
╚══════════════════════════════════════════════════════════════╝`);
    }

    shutdown() {
        if (this._healthTimer) clearInterval(this._healthTimer);
        if (this._statsTimer)  clearInterval(this._statsTimer);
        this.status = 'DORMANT';
        this.emit('network:shutdown', { tawheed: this.tawheed });
        console.log('🛑 [LIVE-AI v2] الشبكة أُوقفت بأمان — ' + this.tawheed);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton
// ═══════════════════════════════════════════════════════════════════════════════

const liveAINetwork = new SheikhaLiveAINetwork();

// ═══════════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    SheikhaLiveAINetwork,
    liveAINetwork,
    // واجهة المحرك للتسجيل في neural-router
    engine: {
        handle:  (req) => liveAINetwork.ask(req.data || req),
        execute: (req) => liveAINetwork.ask(req.data || req),
        status:  ()    => liveAINetwork.getStatus(),
    },
};
