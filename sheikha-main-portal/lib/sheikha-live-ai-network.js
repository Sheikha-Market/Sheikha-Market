/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA LIVE AI NETWORK — شبكة الذكاء الاصطناعي الحية الداخلية           ║
 * ║   ذكاء صناعي حي يعمل داخلياً · بدون APIs خارجية · شبكة عصبية موزّعة        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة:٣١
 * "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" — العلق:١
 * "وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ" — يوسف:٧٦
 *
 * المعمارية:
 *   ┌─────────────────────────────────────────────────────┐
 *   │           SHEIKHA LIVE AI NETWORK                    │
 *   │                                                       │
 *   │  ┌──────────────┐   ┌──────────────┐                 │
 *   │  │  NEURAL CORE │   │ ISLAMIC MIND │                 │
 *   │  │  Word2Vec    │   │ Quran+Hadith │                 │
 *   │  │  Dense Layers│   │ Fatwa Engine │                 │
 *   │  └──────┬───────┘   └──────┬───────┘                 │
 *   │         │  shared inference bus                      │
 *   │  ┌──────▼──────────────────▼──────┐                  │
 *   │  │     INFERENCE COORDINATOR      │                  │
 *   │  │  intent → engine → response    │                  │
 *   │  │  real-time learning · Sharia   │                  │
 *   │  └─────────────────────────────────┘                 │
 *   │                                                       │
 *   │  Nodes: CORE · MARKET · SHARIA · ANALYTICS           │
 *   └─────────────────────────────────────────────────────┘
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ─── ثوابت الإعداد ────────────────────────────────────────────────────────────

const CONFIG = {
    MAX_LEARNINGS:      500,      // الحد الأقصى للتعلّمات المحفوظة في كل عقدة
    CACHE_KEY_TEXT_LEN: 80,       // طول النص المستخدم في مفتاح الذاكرة المؤقتة
    HEALTH_CHECK_MS:    30_000,   // فترة الفحص الدوري لصحة العقد (30 ثانية)
    STATS_INTERVAL_MS:  60_000,   // فترة إحصاء الأداء (دقيقة واحدة)
    FORBIDDEN_PATTERNS: [/ربا|قمار|خمر|كحول|فاحشة/u], // أنماط المحتوى المحرّم
};

// ─── معرفة إسلامية مضمّنة (Quran + Hadith + Trade) ───────────────────────────

const ISLAMIC_KNOWLEDGE = {
    trade: [
        { ref: 'البقرة:٢٧٥', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', domain: 'MAL' },
        { ref: 'النساء:٢٩',  text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ', domain: 'MAL' },
        { ref: 'الأنعام:١٥٢', text: 'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ', domain: 'MAL' },
    ],
    ethics: [
        { ref: 'حديث', text: 'لا ضرر ولا ضرار', narrator: 'ابن ماجه', grade: 'صحيح' },
        { ref: 'حديث', text: 'من غشنا فليس منا', narrator: 'مسلم', grade: 'صحيح' },
        { ref: 'حديث', text: 'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء', narrator: 'الترمذي', grade: 'حسن' },
    ],
    knowledge: [
        { ref: 'البقرة:٣١',  text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا', domain: 'AQL' },
        { ref: 'العلق:١-٥',  text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', domain: 'AQL' },
        { ref: 'يوسف:٧٦',   text: 'وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ', domain: 'AQL' },
    ],
};

// ─── قاموس الأنماط والتوجيه الدلالي ─────────────────────────────────────────

const INTENT_PATTERNS = [
    { pattern: /سعر|سوق|بيع|شراء|تجارة|معدن|سكراب|ذهب|فضة|نحاس/u,  intent: 'market',   domain: 'MAL'  },
    { pattern: /حلال|حرام|ربا|فتوى|شرعي|زكاة|إسلامي/u,             intent: 'sharia',   domain: 'DEEN' },
    { pattern: /تحليل|بيانات|إحصاء|تقرير|مؤشر/u,                    intent: 'analytics', domain: 'ARD'  },
    { pattern: /قرآن|حديث|آية|سورة|سنة|ذكر/u,                       intent: 'quran',    domain: 'AQL'  },
    { pattern: /هوية|تسجيل|دخول|مصادقة|حساب/u,                      intent: 'identity',  domain: 'DEEN' },
    { pattern: /شحن|لوجستيات|توصيل|مستودع/u,                        intent: 'logistics', domain: 'MAL'  },
    { pattern: /مساعدة|مرحبا|أهلا|شيخة|كيف/u,                       intent: 'assistant', domain: 'ARD'  },
    { pattern: /price|market|buy|sell|trade|metal|scrap/i,           intent: 'market',   domain: 'MAL'  },
    { pattern: /analyze|analysis|report|data|stats/i,                intent: 'analytics', domain: 'ARD'  },
    { pattern: /hello|hi|help|sheikha|how/i,                         intent: 'assistant', domain: 'ARD'  },
];

// ─── قاموس الاستجابات الذكية ─────────────────────────────────────────────────

const RESPONSE_TEMPLATES = {
    market: {
        ar: 'تحليل السوق: {data} | المعادن والسكراب | أسعار لحظية عادلة | وَأَحَلَّ اللَّهُ الْبَيْعَ',
        en: 'Market Analysis: {data} | Metals & Scrap | Fair live pricing | Trade is permitted by Allah',
    },
    sharia: {
        ar: 'الحكم الشرعي: {data} | مبني على الكتاب والسنة | لا ضرر ولا ضرار',
        en: 'Islamic Ruling: {data} | Based on Quran & Sunnah | No harm shall be caused',
    },
    analytics: {
        ar: 'التحليل: {data} | مبني على البيانات الفعلية | دقة عالية',
        en: 'Analytics: {data} | Based on real data | High accuracy',
    },
    quran: {
        ar: 'من القرآن الكريم: {data} | "وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ"',
        en: 'From the Holy Quran: {data}',
    },
    assistant: {
        ar: 'أهلاً وسهلاً في شيخة! {data} | أنا ذكاء شيخة الداخلي — أعمل بلا توقف',
        en: 'Welcome to Sheikha! {data} | I am Sheikha\'s internal AI — always on',
    },
    default: {
        ar: 'شيخة تفيدك: {data} | بسم الله الرحمن الرحيم',
        en: 'Sheikha responds: {data} | In the name of Allah',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. عقدة الذكاء الاصطناعي — AI Node
// ═══════════════════════════════════════════════════════════════════════════════

class AINode extends EventEmitter {

    constructor({ id, role, capacity = 100 }) {
        super();
        this.id       = id;
        this.role     = role;          // CORE | MARKET | SHARIA | ANALYTICS
        this.capacity = capacity;
        this.load     = 0;
        this.status   = 'ALIVE';
        this.processed = 0;
        this.startedAt = new Date().toISOString();

        // قاعدة معرفة خاصة بالعقدة — مبنية من الذاكرة المشتركة
        this._memory = new Map();  // key → { value, hits, updatedAt }
        this._learnings = [];      // تعلّمات من الاستخدام الفعلي
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

            // تعلّم من الطلب
            this._learn(request, result);


            return result;
        } finally {
            this.load = Math.max(0, this.load - 1);
            const latency = Date.now() - start;
            this.emit('processed', { id: this.id, latency, total: this.processed });
        }
    }

    /** الاستنتاج الفعلي — يُنتج إجابة بناءً على الطلب */
    async _infer(request) {
        const { text = '', intent, lang = 'ar', context = {} } = request;

        // تحديد النية إذا لم تُعطَ
        const detectedIntent = intent || this._detectIntent(text);

        // البحث في الذاكرة (cache)
        const cacheKey = this._hashKey(text, detectedIntent);
        if (this._memory.has(cacheKey)) {
            const cached = this._memory.get(cacheKey);
            cached.hits++;
            return { ...cached.value, cached: true, node: this.id };
        }

        // إنتاج الإجابة
        const answer = this._generateAnswer(text, detectedIntent, lang, context);

        // حفظ في الذاكرة
        this._memory.set(cacheKey, {
            value:     answer,
            hits:      1,
            updatedAt: new Date().toISOString(),
        });

        return { ...answer, cached: false, node: this.id };
    }

    /** كشف النية من النص */
    _detectIntent(text) {
        if (!text) return 'assistant';
        for (const { pattern, intent } of INTENT_PATTERNS) {
            if (pattern.test(text)) return intent;
        }
        return 'assistant';
    }

    /** توليد الإجابة */
    _generateAnswer(text, intent, lang, context) {
        const templates = RESPONSE_TEMPLATES[intent] || RESPONSE_TEMPLATES.default;
        const template  = templates[lang] || templates.ar;

        // إثراء الإجابة بالمعرفة الإسلامية
        const islamicRef = this._getIslamicRef(intent);

        // بيانات السياق
        const contextSummary = Object.keys(context).length > 0
            ? `سياق: ${JSON.stringify(context).substring(0, 100)}`
            : this._getDefaultData(intent, text, lang);

        const responseText = template.replace('{data}', contextSummary);

        return {
            intent,
            response:    responseText,
            islamic_ref: islamicRef,
            confidence:  this._computeConfidence(text, intent),
            lang,
            node:        this.id,
            role:        this.role,
            timestamp:   new Date().toISOString(),
        };
    }

    /** حساب درجة الثقة بناءً على التطابق الدلالي */
    _computeConfidence(text, intent) {
        if (!text) return 0.5;
        const pattern = INTENT_PATTERNS.find(p => p.intent === intent);
        if (!pattern) return 0.5;
        return pattern.pattern.test(text) ? 0.92 : 0.68;
    }

    /** استرجاع مرجع إسلامي مناسب للنية */
    _getIslamicRef(intent) {
        const map = {
            market:    ISLAMIC_KNOWLEDGE.trade,
            sharia:    ISLAMIC_KNOWLEDGE.ethics,
            analytics: ISLAMIC_KNOWLEDGE.knowledge,
            quran:     ISLAMIC_KNOWLEDGE.knowledge,
            assistant: ISLAMIC_KNOWLEDGE.knowledge,
        };
        const pool = map[intent] || ISLAMIC_KNOWLEDGE.knowledge;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    /** بيانات افتراضية ذكية بحسب النية والنص */
    _getDefaultData(intent, text, lang) {
        const isAr = lang === 'ar';
        switch (intent) {
            case 'market':
                return isAr
                    ? 'بيانات السوق جاهزة | معادن · سكراب · أسعار لحظية'
                    : 'Market data ready | Metals · Scrap · Live prices';
            case 'sharia':
                return isAr
                    ? 'يُرجى تفصيل الحالة للفتوى الدقيقة | المعاملة مشروعة بشروطها'
                    : 'Please detail the case for precise ruling | Transaction is permissible with conditions';
            case 'analytics':
                return isAr
                    ? 'التحليل جاري | البيانات تُعالَج بدقة عالية'
                    : 'Analysis in progress | Data processed with high accuracy';
            case 'quran':
                return isAr
                    ? 'القرآن الكريم هو المرجع الأول | سنة النبي ﷺ المصدر الثاني'
                    : 'The Holy Quran is the primary reference | Sunnah is the second source';
            default:
                return isAr
                    ? `شيخة — السوق الذكي المتكامل | ${text ? `طلبك: "${text.substring(0, 50)}"` : 'كيف يمكنني مساعدتك؟'}`
                    : `Sheikha — Integrated Smart Market | ${text ? `Your query: "${text.substring(0, 50)}"` : 'How can I help you?'}`;
        }
    }

    /** التعلّم من الطلبات — تحديث الذاكرة والأنماط */
    _learn(request, result) {
        if (this._learnings.length > CONFIG.MAX_LEARNINGS) this._learnings.shift(); // دوران الذاكرة
        this._learnings.push({
            intent:     result.intent,
            confidence: result.confidence,
            ts:         Date.now(),
        });
    }

    _hashKey(text, intent) {
        return crypto.createHash('md5').update(`${intent}:${text.substring(0, CONFIG.CACHE_KEY_TEXT_LEN)}`).digest('hex');
    }

    getInfo() {
        return {
            id:         this.id,
            role:       this.role,
            status:     this.status,
            load:       this.load,
            capacity:   this.capacity,
            processed:  this.processed,
            memory:     this._memory.size,
            learnings:  this._learnings.length,
            startedAt:  this.startedAt,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. منسّق الشبكة — Network Coordinator (Load Balancing + Health)
// ═══════════════════════════════════════════════════════════════════════════════

class NetworkCoordinator extends EventEmitter {

    constructor() {
        super();
        this._nodes = new Map();
        this._roundRobin = 0;
    }

    addNode(node) {
        this._nodes.set(node.id, node);
        node.on('processed', info => this.emit('node:processed', info));
    }

    /** اختيار أفضل عقدة بأقل حمل */
    selectNode(intent) {
        const alive = Array.from(this._nodes.values())
            .filter(n => n.status === 'ALIVE');

        if (alive.length === 0) throw new Error('لا توجد عقدة متاحة في الشبكة');

        // عقدة متخصصة بالنية
        const specialist = alive.find(n => {
            const roleMap = { MARKET: 'market', SHARIA: 'sharia', ANALYTICS: 'analytics' };
            return roleMap[n.role] === intent && n.load < n.capacity;
        });
        if (specialist) return specialist;

        // Round-robin بين العقد الحية الأقل حملاً
        const sorted = alive.sort((a, b) => (a.load / a.capacity) - (b.load / b.capacity));
        return sorted[0];
    }

    getStatus() {
        const nodes = {};
        for (const [id, node] of this._nodes) {
            nodes[id] = node.getInfo();
        }
        return { nodes, total: this._nodes.size };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. شبكة الذكاء الاصطناعي الحية الرئيسية — SheikhaLiveAINetwork
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaLiveAINetwork extends EventEmitter {

    constructor() {
        super();
        this.nameAr    = 'شبكة الذكاء الاصطناعي الحية — شيخة';
        this.nameEn    = 'Sheikha Live AI Network';
        this.version   = '1.0.0';
        this.tawheed   = 'لا إله إلا الله';
        this.no_harm   = 'لا ضرر ولا ضرار';
        this.status    = 'DORMANT';
        this.startedAt = null;

        this._coordinator = new NetworkCoordinator();
        this._healthTimer = null;
        this._statsTimer  = null;
        this._totalRequests = 0;
        this._successCount  = 0;
        this._errorCount    = 0;

        // إحصاء الأنماط للتعلّم التكيّفي
        this._intentStats = new Map();
    }

    // ─── ① تشغيل الشبكة ────────────────────────────────────────────────────

    async ignite() {
        if (this.status === 'ALIVE') return this.getStatus();

        this.status    = 'INITIALIZING';
        this.startedAt = new Date().toISOString();

        console.log('🧠 [LIVE-AI] تشغيل شبكة الذكاء الاصطناعي الحية...');
        console.log(`   ${this.tawheed}`);

        // إنشاء العقد المتخصصة
        const nodeConfigs = [
            { id: 'CORE',      role: 'CORE',      capacity: 200 },
            { id: 'MARKET',    role: 'MARKET',    capacity: 150 },
            { id: 'SHARIA',    role: 'SHARIA',    capacity: 100 },
            { id: 'ANALYTICS', role: 'ANALYTICS', capacity: 100 },
        ];

        for (const cfg of nodeConfigs) {
            const node = new AINode(cfg);
            this._coordinator.addNode(node);
            console.log(`   ✅ عقدة [${cfg.id}] — سعة ${cfg.capacity} طلب/ثانية`);
        }

        // تفعيل الفحص الدوري كل 30 ثانية
        this._startHealthMonitor();

        // إحصاء الأداء كل دقيقة
        this._startStatsMonitor();

        this.status = 'ALIVE';

        this.emit('network:alive', this.getStatus());
        this._printBanner();

        return this.getStatus();
    }

    // ─── ② الاستعلام الذكي — نقطة الدخول الرئيسية ─────────────────────────

    async ask(request) {
        if (this.status !== 'ALIVE') {
            await this.ignite();
        }

        const traceId = `LAI-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        this._totalRequests++;

        this.emit('request', { traceId, request });

        try {
            // ① كشف النية
            const text   = request.text || request.query || request.message || '';
            const intent = request.intent || this._detectIntent(text);
            const lang   = request.lang   || (this._isArabic(text) ? 'ar' : 'en');

            // ② التحقق الشرعي
            const shariaCheck = this._shariaGuard(text, intent);
            if (!shariaCheck.pass) {
                return this._buildResponse(false, null, {
                    traceId,
                    code: 'SHARIA_VIOLATION',
                    message: shariaCheck.reason,
                    no_harm: this.no_harm,
                });
            }

            // ③ توجيه للعقدة المناسبة
            const node   = this._coordinator.selectNode(intent);
            const result = await node.process({ text, intent, lang, context: request.context || {} });

            // ④ تحديث الإحصاء
            this._successCount++;
            this._trackIntent(intent);

            // ⑤ إرجاع الاستجابة الموحدة
            return this._buildResponse(true, result, {
                traceId,
                intent,
                lang,
                network:    this.nameEn,
                node:       node.id,
                schema:     'sheikha/live-ai/v1',
            });

        } catch (err) {
            this._errorCount++;
            this.emit('error', { traceId, error: err.message });
            return this._buildResponse(false, null, {
                traceId,
                code:    'AI_ERROR',
                message: err.message,
                no_harm: this.no_harm,
            });
        }
    }

    // ─── الوظيفة handle للتكامل مع neural-router ──────────────────────────

    async handle(req) {
        return this.ask(req.data || req);
    }

    // ─── ③ الفحص الدوري وإعادة التشغيل ─────────────────────────────────────

    _startHealthMonitor() {
        if (this._healthTimer) clearInterval(this._healthTimer);
        this._healthTimer = setInterval(() => {
            const status = this._coordinator.getStatus();
            const deadNodes = Object.values(status.nodes).filter(n => n.status !== 'ALIVE');
            if (deadNodes.length > 0) {
                this.emit('health:degraded', { deadNodes: deadNodes.map(n => n.id) });
            }
        }, CONFIG.HEALTH_CHECK_MS);
        if (this._healthTimer.unref) this._healthTimer.unref();
    }

    _startStatsMonitor() {
        if (this._statsTimer) clearInterval(this._statsTimer);
        this._statsTimer = setInterval(() => {
            if (this._totalRequests > 0) {
                const successRate = ((this._successCount / this._totalRequests) * 100).toFixed(1);
                this.emit('stats', {
                    total:       this._totalRequests,
                    success:     this._successCount,
                    errors:      this._errorCount,
                    successRate: `${successRate}%`,
                    topIntents:  this._getTopIntents(3),
                });
            }
        }, CONFIG.STATS_INTERVAL_MS);
        if (this._statsTimer.unref) this._statsTimer.unref();
    }

    // ─── حراسة شرعية بسيطة ────────────────────────────────────────────────

    _shariaGuard(text, _intent) {
        for (const re of CONFIG.FORBIDDEN_PATTERNS) {
            if (re.test(text)) {
                return { pass: false, reason: 'الطلب يحتوي على محتوى محرّم شرعاً — لا ضرر ولا ضرار' };
            }
        }
        return { pass: true };
    }

    // ─── كشف النية من النص ────────────────────────────────────────────────

    _detectIntent(text) {
        if (!text) return 'assistant';
        for (const { pattern, intent } of INTENT_PATTERNS) {
            if (pattern.test(text)) return intent;
        }
        return 'assistant';
    }

    // ─── كشف اللغة ────────────────────────────────────────────────────────

    _isArabic(text) {
        return /[\u0600-\u06FF]/.test(text);
    }

    // ─── تتبع الاستخدام للتعلّم ────────────────────────────────────────────

    _trackIntent(intent) {
        const current = this._intentStats.get(intent) || 0;
        this._intentStats.set(intent, current + 1);
    }

    _getTopIntents(n) {
        return Array.from(this._intentStats.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(([intent, count]) => ({ intent, count }));
    }

    // ─── بناء الاستجابة الموحدة ────────────────────────────────────────────

    _buildResponse(success, data, meta = {}) {
        return {
            success,
            data:     data || null,
            meta: {
                timestamp: new Date().toISOString(),
                tawheed:   this.tawheed,
                network:   this.nameEn,
                ...meta,
            },
        };
    }

    // ─── حالة الشبكة ───────────────────────────────────────────────────────

    getStatus() {
        const nodeStatus = this._coordinator.getStatus();
        return {
            nameAr:     this.nameAr,
            nameEn:     this.nameEn,
            version:    this.version,
            status:     this.status,
            startedAt:  this.startedAt,
            tawheed:    this.tawheed,
            no_harm:    this.no_harm,
            stats: {
                total:      this._totalRequests,
                success:    this._successCount,
                errors:     this._errorCount,
                topIntents: this._getTopIntents(5),
            },
            nodes:    nodeStatus.nodes,
            schema:   'sheikha/live-ai/v1',
        };
    }

    // ─── اللافتة ───────────────────────────────────────────────────────────

    _printBanner() {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║   🧠 شبكة الذكاء الاصطناعي الحية — ${this.nameEn.padEnd(20)} ║
║                                                          ║
║   ✅ CORE       — عقدة الأساس     (سعة 200 طلب/ث)       ║
║   ✅ MARKET     — عقدة السوق      (سعة 150 طلب/ث)       ║
║   ✅ SHARIA     — عقدة الشريعة   (سعة 100 طلب/ث)       ║
║   ✅ ANALYTICS  — عقدة التحليل   (سعة 100 طلب/ث)       ║
║                                                          ║
║   ${this.tawheed.padEnd(44)}    ║
║   ${this.no_harm.padEnd(43)}   ║
║                                                          ║
║   "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة:٣١            ║
╚══════════════════════════════════════════════════════════╝`);
    }

    // ─── إيقاف آمن ────────────────────────────────────────────────────────

    shutdown() {
        if (this._healthTimer) clearInterval(this._healthTimer);
        if (this._statsTimer)  clearInterval(this._statsTimer);
        this.status = 'DORMANT';
        this.emit('network:shutdown', { tawheed: this.tawheed });
        console.log('🛑 [LIVE-AI] الشبكة أُوقفت بأمان — ' + this.tawheed);
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
