/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ☪️  بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * SHEIKHA — محرك ذكاء Ollama المعدني المتخصص
 * "5 نماذج AI متخصصة بالمعادن والسكراب — تعمل محلياً بلا شبكة"
 *
 * ﴿عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق:5
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة:31
 * «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — الذكاء الاصطناعي المتقن
 *
 * الهيكل:
 *   §1  OLLAMA_MODELS           — 5 نماذج متخصصة بالمعادن
 *   §2  METALS_AI_PROMPTS       — قوالب المطالبات لكل نموذج
 *   §3  OllamaMetalsClient      — عميل Ollama / fallback ذكي
 *   §4  MetalsAIModel           — نموذج AI متخصص بمعدن/مهمة
 *   §5  MetalsAIOrchestrator    — موزع المهام على النماذج
 *   §6  LocalAIFallback         — ذكاء محلي بدون Ollama
 *   §7  SheikhaOllamaMetalsAI  — المحرك الرئيسي
 *   §8  التصدير
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * الإصدار: 1.0.0
 * ══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');
const http         = require('http');
const https        = require('https');

// ══════════════════════════════════════════════════════════════════════════════
// §1 — OLLAMA_MODELS
// ══════════════════════════════════════════════════════════════════════════════

const OLLAMA_MODELS = [
    {
        id:          'metals-analyst',
        name:        'محلل المعادن',
        model:       'llama3.2:3b',  // أساسي — خفيف
        fallback:    'phi3:mini',
        specialty:   'تحليل أسعار المعادن والتوقعات الفنية',
        domain:      ['Cu', 'Fe', 'Al', 'Zn', 'Pb', 'Ni'],
        temp:        0.3,
        maxTokens:   512,
        systemPrompt:`أنت محلل معادن متخصص في شركة شيخة للمعادن الإسلامية.
مهمتك: تحليل بيانات المعادن وتقديم توصيات مهنية.
المبدأ: «لا غرر ولا غش» — الصدق في التحليل واجب.
الأسلوب: عربي واضح، أرقام دقيقة، لا توصيات استثمارية ملزمة.`,
    },
    {
        id:          'scrap-expert',
        name:        'خبير السكراب',
        model:       'llama3.2:3b',
        fallback:    'phi3:mini',
        specialty:   'تثمين وتصنيف السكراب (ISRI) وتوجيه الإجراءات',
        domain:      ['HMS1', 'HMS2', 'Birch', 'Candy', 'Twitch', 'Zorba', 'PCB'],
        temp:        0.2,
        maxTokens:   512,
        systemPrompt:`أنت خبير سكراب معتمد لدى شيخة للمعادن.
تخصصك: تصنيف السكراب حسب ISRI، تثمينه، توجيه إجراءات الاستلام والشحن.
المبدأ: «التاجر الصدوق مع النبيين والصديقين» — الأمانة في الوزن والتصنيف.`,
    },
    {
        id:          'sharia-checker',
        name:        'مراجع الشريعة',
        model:       'llama3.2:3b',
        fallback:    'phi3:mini',
        specialty:   'مراجعة العقود والمعاملات وفق الشريعة الإسلامية',
        domain:      ['murabaha', 'salam', 'istisna', 'riba-check', 'gharar-check'],
        temp:        0.1,
        maxTokens:   700,
        systemPrompt:`أنت مراجع شرعي متخصص في تجارة المعادن الإسلامية.
مهمتك: فحص العقود والمعاملات ومطابقتها مع الكتاب والسنة.
الضوابط: لا ربا — لا غرر — لا غش — لا احتكار — لا نجش.
التنبيه: اقتراح ومراجعة فقط — ليس فتوى ملزمة.`,
    },
    {
        id:          'supply-optimizer',
        name:        'محسّن سلاسل الإمداد',
        model:       'mistral:7b',
        fallback:    'llama3.2:3b',
        specialty:   'تحسين مسارات النقل وعقد الصفقات وتخطيط الإمداد',
        domain:      ['logistics', 'transport', 'route-optimization', 'cost-analysis'],
        temp:        0.3,
        maxTokens:   600,
        systemPrompt:`أنت خبير لوجستيات في شيخة للمعادن.
مهمتك: تحسين تكاليف النقل واختيار أفضل المسارات للمعادن والسكراب.
المعيار: أقل تكلفة + أعلى أمان + أسرع وصول.
المبدأ: «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه».`,
    },
    {
        id:          'market-translator',
        name:        'مترجم السوق',
        model:       'llama3.2:3b',
        fallback:    'phi3:mini',
        specialty:   'ترجمة بيانات السوق وشرح المصطلحات التقنية بالعربية',
        domain:      ['terminology', 'report-generation', 'arabic-translation', 'explanation'],
        temp:        0.4,
        maxTokens:   400,
        systemPrompt:`أنت مترجم ومشرح متخصص في أسواق المعادن لدى شيخة.
مهمتك: شرح البيانات الفنية بلغة عربية مبسطة للتجار والمسؤولين.
الأسلوب: واضح، مختصر، بأمثلة عملية من السوق السعودي والخليجي.`,
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// §2 — METALS_AI_PROMPTS
//      قوالب مطالبات جاهزة لكل نوع من أنواع التحليل
// ══════════════════════════════════════════════════════════════════════════════

const METALS_AI_PROMPTS = {
    priceAnalysis: (metal, price, ohlc) =>
        `حلّل السعر الحالي لـ${metal}: ${price} | O:${ohlc?.open} H:${ohlc?.high} L:${ohlc?.low} C:${ohlc?.close} | التغير: ${ohlc?.changePct}%. قدّم توقعك الفني بناء على هذه البيانات في 3 نقاط.`,

    scrapGrading: (type, weight, condition, description) =>
        `صنّف هذه الشحنة من السكراب وقدّر سعرها:
النوع: ${type}
الوزن: ${weight} طن
الحالة: ${condition}
الوصف: ${description}
قدّم: التصنيف ISRI + نسبة النقاء المتوقعة + نطاق السعر بالريال.`,

    contractCheck: (contractType, parties, conditions) =>
        `راجع هذه المعاملة شرعياً:
نوع العقد: ${contractType}
الأطراف: ${parties}
الشروط: ${conditions}
المطلوب: هل المعاملة مطابقة للشريعة؟ وهل يوجد غرر أو ربا؟`,

    routeOptimize: (origin, destination, weight, material) =>
        `اقترح أفضل مسار شحن:
المعدن: ${material} — الوزن: ${weight} طن
من: ${origin} — إلى: ${destination}
قارن: الشحن البري vs البحري vs الجوي من حيث التكلفة والسرعة والمخاطر.`,

    marketExplain: (term, context) =>
        `اشرح مصطلح «${term}» في سياق: ${context}. الشرح باللغة العربية بمثال عملي من السوق السعودي.`,
};

// ══════════════════════════════════════════════════════════════════════════════
// §3 — OllamaMetalsClient
//      عميل HTTP لـ Ollama — مع fallback تلقائي عند عدم التوفر
// ══════════════════════════════════════════════════════════════════════════════

class OllamaMetalsClient {
    constructor(baseUrl = 'http://localhost:11434') {
        this.baseUrl     = baseUrl;
        this.available   = false;
        this.lastCheck   = 0;
        this.checkEvery  = 60000; // فحص كل دقيقة
        this.requestCount = 0;
        this.successCount = 0;
    }

    async checkAvailability() {
        if (Date.now() - this.lastCheck < this.checkEvery) return this.available;
        return new Promise((resolve) => {
            const req = http.get(`${this.baseUrl}/api/tags`, { timeout: 3000 }, (res) => {
                this.available = res.statusCode === 200;
                this.lastCheck = Date.now();
                resolve(this.available);
            });
            req.on('error', () => {
                this.available = false;
                this.lastCheck = Date.now();
                resolve(false);
            });
            req.on('timeout', () => {
                req.destroy();
                this.available = false;
                this.lastCheck = Date.now();
                resolve(false);
            });
        });
    }

    async chat(model, messages, options = {}) {
        this.requestCount++;
        const available = await this.checkAvailability();
        if (!available) return null;

        return new Promise((resolve) => {
            const body = JSON.stringify({
                model,
                messages,
                stream: false,
                options: { temperature: options.temperature || 0.3, num_predict: options.maxTokens || 512 },
            });
            const req = http.request({
                hostname: 'localhost',
                port:     11434,
                path:     '/api/chat',
                method:   'POST',
                headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
                timeout:  30000,
            }, (res) => {
                let data = '';
                res.on('data', chunk => { data += chunk; });
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        this.successCount++;
                        resolve(json?.message?.content || null);
                    } catch { resolve(null); }
                });
            });
            req.on('error', () => resolve(null));
            req.on('timeout', () => { req.destroy(); resolve(null); });
            req.write(body);
            req.end();
        });
    }

    getStats() {
        return { available: this.available, requests: this.requestCount, success: this.successCount };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §4 — LocalAIFallback
//      ذكاء محلي بدون Ollama — يعمل دائماً
// ══════════════════════════════════════════════════════════════════════════════

class LocalAIFallback {
    constructor() {
        // قاعدة معرفة معدنية محلية
        this.knowledgeBase = {
            Cu: {
                analysis: 'النحاس: حساس لقرارات الفيدرالي الأمريكي وإنتاج تشيلي. الطلب يرتفع مع التوسع في الطاقة المتجددة والسيارات الكهربائية.',
                signals: { bullish: 'طلب EV متصاعد + إنتاج تشيلي متراجع', bearish: 'تباطؤ الاقتصاد الصيني + مخزون LME مرتفع' },
            },
            Fe: {
                analysis: 'الحديد/الصلب: يرتبط بالبناء والبنية التحتية. السوق السعودي نشط بسبب مشاريع رؤية 2030.',
                signals: { bullish: 'مشاريع البنية التحتية الخليجية', bearish: 'فائض الإنتاج الصيني' },
            },
            Al: {
                analysis: 'الألومنيوم: تكلفة الطاقة العامل الأكبر. قرارات OPEC+ تؤثر على تكاليف الطهر.',
                signals: { bullish: 'ارتفاع تكاليف الطاقة + طلب التعبئة', bearish: 'تباطؤ الطلب الصناعي' },
            },
            Au: {
                analysis: 'الذهب: ملاذ آمن إسلامي أصيل. يرتفع مع التوترات الجيوسياسية وانخفاض الدولار.',
                signals: { bullish: 'تراجع الثقة بالعملات + شراء المركزي', bearish: 'ارتفاع عوائد السندات الأمريكية' },
            },
            HMS1: {
                analysis: 'حديد ثقيل #1: سعره يتبع أسعار الصلب في الأسواق الإقليمية. المصافق التركية والهندية أكبر المشترين.',
                signals: { bullish: 'ارتفاع الطلب الخليجي + تراجع المعروض', bearish: 'ضعف الطلب التركي' },
            },
        };
    }

    // تحليل سعري محلي
    analyzeMetal(metalId, price, ohlc) {
        const kb = this.knowledgeBase[metalId];
        const trend = ohlc?.changePct > 1 ? 'صاعد ▲' : ohlc?.changePct < -1 ? 'هابط ▼' : 'متوازن ─';
        let analysis = kb ? kb.analysis : `${metalId}: معدن مهم في منظومة شيخة.`;
        const signal = kb?.signals;
        return {
            model:   'Local-AI-Fallback',
            metal:   metalId,
            trend,
            price,
            analysis,
            bullish: signal?.bullish || 'مراقبة السوق',
            bearish: signal?.bearish || 'تحليل دوري',
            islamicNote: '«لا غرر» — هذا تحليل إرشادي. استشر أهل الخبرة للقرارات الكبيرة.',
            disclaimer: '⚠️ للمعلومة فقط — ليس توصية استثمارية',
        };
    }

    // تصنيف السكراب محلياً
    gradeScrap(type, weight) {
        const grades = {
            HMS1: { purity: 98, price: { lo: 400, hi: 600 }, isri: '201', unit: 'SAR/ton' },
            HMS2: { purity: 95, price: { lo: 330, hi: 500 }, isri: '202', unit: 'SAR/ton' },
            BIRCH:{ purity: 99, price: { lo: 24,  hi: 36  }, isri: '102', unit: 'SAR/kg'  },
            CANDY:{ purity: 99, price: { lo: 23,  hi: 35  }, isri: '105', unit: 'SAR/kg'  },
            TWITCH:{purity:88, price: { lo: 3.2,  hi: 5.0 }, isri: '406', unit: 'SAR/kg'  },
            ZORBA:{ purity: 70, price: { lo: 1400, hi:2200 }, isri: '240', unit: 'SAR/ton' },
        };
        const g = grades[type?.toUpperCase()];
        if (!g) return { error: `التصنيف ${type} غير معروف` };
        const midPrice = (g.price.lo + g.price.hi) / 2;
        return {
            model:       'Local-AI-Fallback',
            type,
            isri:        g.isri,
            purityPct:   g.purity,
            weight,
            unit:        g.unit,
            priceRange:  `${g.price.lo} — ${g.price.hi} ${g.unit}`,
            totalEstimate: g.unit.includes('kg') ? `${Math.round(midPrice * weight * 1000)} SAR` : `${Math.round(midPrice * weight)} SAR`,
            islamicNote: '«دقة الوزن وصدق المكيال» — قس بالميزان المعتمد',
        };
    }

    // فحص شرعي محلي
    checkSharia(contractType) {
        const checks = {
            murabaha: { halal: true, note: 'مرابحة: حلال بشروط — السلعة موجودة + هامش معلوم + لا فسخ بلا سبب' },
            salam:    { halal: true, note: 'سلم: حلال بشروط — الثمن عاجل + المبيع موصوف + أجل معلوم' },
            istisna:  { halal: true, note: 'استصناع: حلال — توصيف دقيق + آجل + تسليم محدد' },
            spot:     { halal: true, note: 'بيع فوري: حلال إذا تمت الحيازة الفعلية قبل إعادة البيع' },
            futures:  { halal: false, note: '⚠️ عقود الآجل المعيارية: مشتبه بها — تشبه بيع ما لا تملك', risk: 'غرر' },
            options:  { halal: false, note: '❌ الخيارات: محرمة — غرر وميسر وبيع ما لا تملك', risk: 'ربا+غرر' },
            interest: { halal: false, note: '❌ الفائدة: ربا محرم ﴿وَحَرَّمَ الرِّبَا﴾', risk: 'ربا' },
        };
        const result = checks[contractType?.toLowerCase()] || { halal: null, note: 'يحتاج مراجعة شرعية متخصصة' };
        return {
            model:        'Local-AI-Fallback-Sharia',
            contractType,
            ...result,
            disclaimer:   '⚠️ اقتراح ومراجعة فقط — ليس فتوى ملزمة — استشر عالم شريعة معتمد',
            ayah:         '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ﴾',
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §5 — MetalsAIModel
//      نموذج AI متخصص — يحاول Ollama أولاً ثم ينتقل للـ fallback
// ══════════════════════════════════════════════════════════════════════════════

class MetalsAIModel {
    constructor(config, ollamaClient, fallback) {
        this.config       = config;
        this.ollama       = ollamaClient;
        this.fallback     = fallback;
        this.requests     = 0;
        this.ollamaHits   = 0;
        this.fallbackHits = 0;
    }

    async ask(userMessage, taskType = 'general') {
        this.requests++;
        const available = await this.ollama.checkAvailability();

        if (available) {
            const response = await this.ollama.chat(
                this.config.model,
                [
                    { role: 'system', content: this.config.systemPrompt },
                    { role: 'user',   content: userMessage },
                ],
                { temperature: this.config.temp, maxTokens: this.config.maxTokens }
            );
            if (response) {
                this.ollamaHits++;
                return { source: 'ollama', model: this.config.model, response, taskType };
            }
        }

        // fallback محلي
        this.fallbackHits++;
        let response;
        if (taskType === 'priceAnalysis' && this.config.id === 'metals-analyst') {
            response = this.fallback.analyzeMetal(userMessage.split(':')[0]?.trim(), 0, {});
        } else if (taskType === 'scrapGrading') {
            response = this.fallback.gradeScrap(userMessage.split(' ')[0], 1);
        } else if (taskType === 'contractCheck') {
            response = this.fallback.checkSharia(userMessage.split('نوع:')[1]?.trim() || 'spot');
        } else {
            response = {
                model: 'Local-AI-Fallback',
                note:  `[${this.config.name}] الذكاء المحلي: قيد المعالجة — Ollama غير متوفر حالياً`,
                prompt: userMessage.slice(0, 100),
            };
        }
        return { source: 'local-fallback', model: this.config.id, response, taskType };
    }

    status() {
        return {
            id:           this.config.id,
            name:         this.config.name,
            model:        this.config.model,
            specialty:    this.config.specialty,
            requests:     this.requests,
            ollamaHits:   this.ollamaHits,
            fallbackHits: this.fallbackHits,
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §6 — MetalsAIOrchestrator
//      يوزع المهام على النموذج الصحيح تلقائياً
// ══════════════════════════════════════════════════════════════════════════════

class MetalsAIOrchestrator {
    constructor(models) {
        this.models = new Map(models.map(m => [m.config.id, m]));
    }

    // تحديد النموذج الأنسب للمهمة
    _route(taskType) {
        const routes = {
            priceAnalysis:  'metals-analyst',
            scrapGrading:   'scrap-expert',
            contractCheck:  'sharia-checker',
            routeOptimize:  'supply-optimizer',
            marketExplain:  'market-translator',
            default:        'metals-analyst',
        };
        return this.models.get(routes[taskType] || routes.default);
    }

    // تحليل سعر معدن
    async analyzePriceData(metalId, price, ohlc) {
        const model  = this._route('priceAnalysis');
        const prompt = METALS_AI_PROMPTS.priceAnalysis(metalId, price, ohlc);
        return await model.ask(prompt, 'priceAnalysis');
    }

    // تصنيف سكراب
    async gradeScrapShipment(type, weight, condition, description) {
        const model  = this._route('scrapGrading');
        const prompt = METALS_AI_PROMPTS.scrapGrading(type, weight, condition, description);
        return await model.ask(prompt, 'scrapGrading');
    }

    // مراجعة عقد شرعياً
    async reviewContract(contractType, parties, conditions) {
        const model  = this._route('contractCheck');
        const prompt = METALS_AI_PROMPTS.contractCheck(contractType, parties, conditions);
        return await model.ask(prompt, 'contractCheck');
    }

    // تحسين مسار الشحن
    async optimizeRoute(origin, destination, weight, material) {
        const model  = this._route('routeOptimize');
        const prompt = METALS_AI_PROMPTS.routeOptimize(origin, destination, weight, material);
        return await model.ask(prompt, 'routeOptimize');
    }

    // شرح مصطلح
    async explainTerm(term, context) {
        const model  = this._route('marketExplain');
        const prompt = METALS_AI_PROMPTS.marketExplain(term, context);
        return await model.ask(prompt, 'marketExplain');
    }

    // طلب عام موجّه
    async ask(modelId, message) {
        const model = this.models.get(modelId) || this._route('default');
        return await model.ask(message, 'general');
    }

    statusAll() {
        return [...this.models.values()].map(m => m.status());
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §7 — SheikhaOllamaMetalsAI
//      المحرك الرئيسي
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaOllamaMetalsAI extends EventEmitter {
    constructor() {
        super();
        this.version      = '1.0.0';
        this.bism         = 'بسم الله الرحمن الرحيم';
        this.ollamaClient = new OllamaMetalsClient();
        this.localFallback= new LocalAIFallback();
        this.models       = OLLAMA_MODELS.map(cfg =>
            new MetalsAIModel(cfg, this.ollamaClient, this.localFallback)
        );
        this.orchestrator = new MetalsAIOrchestrator(this.models);
        this.isInitialized= false;
        this.cache        = new Map(); // ذاكرة تخزين مؤقت
        this.totalRequests= 0;
    }

    async initialize() {
        const ollamaAvail = await this.ollamaClient.checkAvailability();
        this.isInitialized = true;
        this.emit('initialized', {
            ollama:    ollamaAvail,
            models:    this.models.length,
            fallback:  Object.keys(this.localFallback.knowledgeBase).length,
        });
        console.log(`✅ [ACTIVE] sheikha-ollama-metals-ai.js — ${this.models.length} نماذج AI معدنية | Ollama: ${ollamaAvail ? '🟢' : '🔴 (fallback محلي)'}`);
        return this;
    }

    // التخزين المؤقت — نفس الطلب خلال 5 دقائق يُعيد الكاش
    _cacheKey(type, ...args) { return `${type}:${args.join(':')}`.slice(0, 200); }
    _cached(key)  { const c = this.cache.get(key); if (c && Date.now() - c.ts < 300000) return c.data; return null; }
    _setCache(key, data) { this.cache.set(key, { data, ts: Date.now() }); if (this.cache.size > 200) { const first = this.cache.keys().next().value; this.cache.delete(first); } }

    async analyzePriceData(metalId, price, ohlc) {
        this.totalRequests++;
        const key    = this._cacheKey('price', metalId, price);
        const cached = this._cached(key);
        if (cached) return { ...cached, fromCache: true };
        const result = await this.orchestrator.analyzePriceData(metalId, price, ohlc);
        this._setCache(key, result);
        return result;
    }

    async gradeScrap(type, weight, condition = 'جيد', description = '') {
        this.totalRequests++;
        const key    = this._cacheKey('scrap', type, weight, condition);
        const cached = this._cached(key);
        if (cached) return { ...cached, fromCache: true };
        const result = await this.orchestrator.gradeScrapShipment(type, weight, condition, description);
        this._setCache(key, result);
        return result;
    }

    async reviewContract(contractType, parties = 'بائع ومشترٍ', conditions = '') {
        this.totalRequests++;
        return await this.orchestrator.reviewContract(contractType, parties, conditions);
    }

    async optimizeRoute(origin, destination, weight, material) {
        this.totalRequests++;
        const key    = this._cacheKey('route', origin, destination, material);
        const cached = this._cached(key);
        if (cached) return { ...cached, fromCache: true };
        const result = await this.orchestrator.optimizeRoute(origin, destination, weight, material);
        this._setCache(key, result);
        return result;
    }

    async explainTerm(term, context = 'تجارة المعادن') {
        this.totalRequests++;
        const key    = this._cacheKey('term', term);
        const cached = this._cached(key);
        if (cached) return { ...cached, fromCache: true };
        const result = await this.orchestrator.explainTerm(term, context);
        this._setCache(key, result);
        return result;
    }

    async askModel(modelId, message) {
        this.totalRequests++;
        return await this.orchestrator.ask(modelId, message);
    }

    getStatus() {
        return {
            system:        'SHEIKHA Ollama Metals AI',
            version:       this.version,
            bism:          this.bism,
            isInitialized: this.isInitialized,
            ollama:        this.ollamaClient.getStats(),
            models:        this.orchestrator.statusAll(),
            totalRequests: this.totalRequests,
            cacheSize:     this.cache.size,
            totalModels:   this.models.length,
            localKnowledge:Object.keys(this.localFallback.knowledgeBase).length,
            islamicPrinciple: '﴿عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾',
            timestamp:     new Date().toISOString(),
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §8 — التصدير
// ══════════════════════════════════════════════════════════════════════════════

const engineInstance = new SheikhaOllamaMetalsAI();

module.exports = {
    SheikhaOllamaMetalsAI,
    MetalsAIModel,
    MetalsAIOrchestrator,
    OllamaMetalsClient,
    LocalAIFallback,
    OLLAMA_MODELS,
    METALS_AI_PROMPTS,
    engine:       engineInstance,
    async init()  { return await engineInstance.initialize(); },
    getStatus()   { return engineInstance.getStatus(); },
    version:      '1.0.0',
    bism:         'بسم الله الرحمن الرحيم',
};
