'use strict';
// ═══════════════════════════════════════════════════════════════════════════════
// 🌟 محرك ريادة الأعمال الإسلامي الرقمي — Sheikha Entrepreneurship Engine
// بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
// ﴿وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾ — المطففين: 26
// ═══════════════════════════════════════════════════════════════════════════════

const EventEmitter = require('events');

class SheikhaEntrepreneurshipEngine extends EventEmitter {
    constructor() {
        super();
        this.version = '2.0.0';
        this.isRunning = false;
        this.cycle = 0;
        this.startedAt = null;
        this._interval = null;

        // ═══ قاعدة بيانات المنهجيات ═══
        this.methodologies = this._buildMethodologies();
        this.productStages = this._buildProductStages();
        this.innovationTools = this._buildInnovationTools();
        this.marketEntryStrategies = this._buildMarketEntry();
        this.acceleratorProgram = this._buildAccelerator();
        this.pilotFramework = this._buildPilotFramework();
        this.ipFramework = this._buildIPFramework();
        this.mentorSystem = this._buildMentorSystem();
        this.valueFramework = this._buildValueFramework();

        // ═══ حالة الأفكار والمشاريع الحية ═══
        this.liveIdeas = [];
        this.activePilots = [];
        this.marketSignals = [];
        this.innovationScore = 0;

        // ═══ متتبع الأداء ═══
        this.kpis = {
            ideasGenerated: 0,
            pilotsLaunched: 0,
            productsLaunched: 0,
            mentorsActivated: 0,
            marketValidations: 0,
            innovationCycles: 0
        };
    }

    // ─────────────────────────────────────────────────────────────
    // بدء المحرك الخلفي
    // ─────────────────────────────────────────────────────────────
    start() {
        if (this.isRunning) return this;
        this.isRunning = true;
        this.startedAt = new Date().toISOString();
        this._runCycle();
        // دورة كل 60 ثانية: تحليل السوق + توليد رؤى
        this._interval = setInterval(() => this._runCycle(), 60_000);
        console.log('🚀 [Entrepreneurship Engine] بدأ — الابتكار المستمر فعّال');
        return this;
    }

    stop() {
        if (this._interval) clearInterval(this._interval);
        this.isRunning = false;
        console.log('⏸️ [Entrepreneurship Engine] متوقف');
    }

    _runCycle() {
        this.cycle++;
        this.kpis.innovationCycles++;
        // توليد إشارات السوق
        this._generateMarketSignal();
        // حساب نقاط الابتكار
        this.innovationScore = Math.min(100,
            this.kpis.ideasGenerated * 2 +
            this.kpis.pilotsLaunched * 10 +
            this.kpis.productsLaunched * 20 +
            this.kpis.marketValidations * 5
        );
        if (this.cycle % 10 === 0) {
            this.emit('cycle', { cycle: this.cycle, score: this.innovationScore, kpis: this.kpis });
            console.log(`💡 [Entrepreneurship] دورة ${this.cycle} — نقاط الابتكار: ${this.innovationScore}`);
        }
    }

    _generateMarketSignal() {
        const signals = [
            'طلب متزايد على حلول ذكاء اصطناعي للمعادن',
            'فرصة في سوق إعادة التدوير الخليجي',
            'نمو 35% في التجارة الإلكترونية للمعادن B2B',
            'فجوة في التسعير الآني للسكراب الصناعي',
            'طلب على منصات مطابقة المشترين والبائعين',
            'حاجة لحلول الامتثال الشرعي في التمويل',
            'نمو قطاع الاقتصاد الدائري في السعودية',
            'فرص في مشاريع رؤية 2030 للتصنيع',
        ];
        const signal = {
            id: Date.now(),
            signal: signals[Math.floor(Math.random() * signals.length)],
            strength: Math.floor(Math.random() * 40) + 60,
            timestamp: new Date().toISOString()
        };
        this.marketSignals.unshift(signal);
        if (this.marketSignals.length > 20) this.marketSignals.pop();
    }

    // ─────────────────────────────────────────────────────────────
    // توليد أفكار بالذكاء الاصطناعي
    // ─────────────────────────────────────────────────────────────
    generateIdeas(context = {}) {
        const { sector = 'معادن', problem = '', targetMarket = '' } = context;
        const ideaTemplates = [
            {
                title: `منصة ${sector} الذكية`,
                type: 'B2B SaaS',
                problem: `صعوبة التواصل بين ${targetMarket || 'المشترين والبائعين'} في قطاع ${sector}`,
                solution: `منصة رقمية ذكية تربط العرض بالطلب فورياً مع تسعير آني قائم على AI`,
                valueProposition: 'توفير 30% من وقت البحث عن الموردين + تسعير عادل شفاف',
                businessModel: 'عمولة + اشتراك شهري (Marketplace + SaaS)',
                islamicCompliance: 'بيع مشروع — تراضٍ — لا غرر — أسعار شفافة'
            },
            {
                title: `تطبيق ${sector} الميداني`,
                type: 'Mobile App',
                problem: `غياب أداة ميدانية لتقييم وتسعير ${sector} في الموقع`,
                solution: `تطبيق يستخدم كاميرا الجوال + AI لتقييم النوع والوزن التقريبي والسعر فورياً`,
                valueProposition: 'تقييم فوري في الميدان — بلا خبير مكلف',
                businessModel: 'اشتراك (Freemium → Pro)',
                islamicCompliance: 'دقة الميزان — صدق الوصف — لا غش في التقييم'
            },
            {
                title: `مجتمع ${sector} الإسلامي`,
                type: 'Community Platform',
                problem: `عدم وجود مجتمع رقمي موثوق لتجار ${sector} المسلمين`,
                solution: `منصة مجتمعية تجمع التجار وتتيح الشراكات الحلال والتمويل الجماعي الإسلامي`,
                valueProposition: 'ثقة + شبكة + تمويل حلال في مكان واحد',
                businessModel: 'عضوية + وكالة صفقات (Wakalah fee)',
                islamicCompliance: 'تعاون على البر — مضاربة — مشاركة'
            },
            {
                title: `نظام ERP ${sector} الذكي`,
                type: 'Enterprise Software',
                problem: `عدم وجود نظام إدارة متكامل يفهم خصوصيات قطاع ${sector}`,
                solution: `نظام ERP مبني خصيصاً لـ ${sector} مع تتبع المخزون والطلبات والفواتير والتقارير`,
                valueProposition: 'تحكم كامل في العمليات — نمو مرئي — قرارات مبنية على بيانات',
                businessModel: 'ترخيص سنوي (SaaS Enterprise)',
                islamicCompliance: 'أمانة في المحاسبة — شفافية الأرباح — وفاء بالعقود'
            }
        ];

        const generated = ideaTemplates.map((t, i) => ({
            id: `IDEA-${Date.now()}-${i}`,
            ...t,
            sector: sector,
            trlLevel: 1,
            stage: 'فكرة',
            generatedAt: new Date().toISOString(),
            nextStep: this.productStages[0].name,
            estimatedTime: '3-6 أشهر للـ MVP',
            estimatedCost: '15,000 - 80,000 ريال للـ MVP'
        }));

        this.liveIdeas = [...generated, ...this.liveIdeas].slice(0, 50);
        this.kpis.ideasGenerated += generated.length;
        return generated;
    }

    // ─────────────────────────────────────────────────────────────
    // تقييم فكرة (Design Thinking + Lean + Islamic)
    // ─────────────────────────────────────────────────────────────
    evaluateIdea(idea) {
        const text = String(idea.description || idea.title || '').toLowerCase();

        // فحص شرعي
        const haramWords = ['ربا', 'فائدة بنكية', 'خمر', 'قمار', 'تدليس', 'غش', 'احتكار'];
        const haramFound = haramWords.filter(w => text.includes(w));

        // نقاط التقييم متعددة الأبعاد
        const scores = {
            shariahScore: haramFound.length === 0 ? 90 : Math.max(10, 90 - haramFound.length * 30),
            marketScore: idea.targetMarket ? 75 : 55,
            innovationScore: 70,
            feasibilityScore: 65,
            impactScore: 80,
            digitalScore: 72
        };
        scores.overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);

        // اقتراح نموذج العمل
        const riyadaModel = this._suggestModel(idea);
        const nextActions = [
            '1. جلسة Design Thinking (5 ساعات) لتعمق فهم المشكلة',
            '2. مقابلة 10 عملاء محتملين (Customer Discovery)',
            '3. بناء Lean Canvas إسلامي',
            '4. Prototype ورقي خلال أسبوع',
            '5. اختبار Pilot مع 5 عملاء حقيقيين'
        ];

        return {
            scores,
            shariahStatus: haramFound.length === 0
                ? '✅ مبدئياً مقبول — يستلزم مراجعة مختص شرعي'
                : `⚠️ يحتاج مراجعة: ${haramFound.join(', ')}`,
            recommendedModel: riyadaModel,
            trlRoadmap: this.productStages.map(s => ({ stage: s.id, name: s.name, duration: s.duration })),
            nextActions,
            pilotPlan: this._generatePilotPlan(idea),
            financialProjection: this._generateFinancialProjection(idea)
        };
    }

    _suggestModel(idea) {
        const text = String(idea.description || idea.title || '').toLowerCase();
        if (text.includes('منصة') || text.includes('سوق')) return 'Marketplace (مضاربة رقمية)';
        if (text.includes('اشتراك') || text.includes('خدمة')) return 'SaaS (إجارة رقمية)';
        if (text.includes('تمويل') || text.includes('استثمار')) return 'مشاركة / مضاربة';
        return 'Marketplace + SaaS (مضاربة + إجارة)';
    }

    _generatePilotPlan(idea) {
        return {
            name: `Pilot: ${idea.title || 'المشروع'}`,
            duration: '30 يوم',
            targetUsers: 20,
            successMetrics: [
                'معدل الاستخدام اليومي > 40%',
                'رضا العملاء > 7/10',
                'إكمال المهمة الأساسية > 80%',
                'قبول 3 عملاء على الأقل للدفع'
            ],
            testingAreas: ['سهولة الاستخدام (UX)', 'ملاءمة المنتج للسوق (PMF)', 'التسعير', 'قنوات التوزيع'],
            tools: ['Google Forms للاستطلاعات', 'Hotjar لتتبع السلوك', 'WhatsApp للتواصل المباشر', 'جداول بيانات لتتبع النتائج'],
            phases: [
                { week: 1, action: 'اختيار 20 مستخدم — إعداد البيئة — شرح الهدف' },
                { week: 2, action: 'تشغيل النموذج الأولي — متابعة يومية — تسجيل الملاحظات' },
                { week: 3, action: 'تحليل البيانات الأولى — تعديل سريع — اختبار التعديل' },
                { week: 4, action: 'قرار النهائي: Pivot أو Continue — تقرير الـ Pilot' }
            ]
        };
    }

    _generateFinancialProjection(idea) {
        return {
            model: 'Halal Revenue Model',
            year1: { revenue: '120,000 ريال', cost: '80,000 ريال', profit: '40,000 ريال', margin: '33%' },
            year2: { revenue: '450,000 ريال', cost: '200,000 ريال', profit: '250,000 ريال', margin: '55%' },
            year3: { revenue: '1,200,000 ريال', cost: '450,000 ريال', profit: '750,000 ريال', margin: '62%' },
            revenueStreams: ['عمولة (5-10%)', 'اشتراك Pro شهري', 'خدمات مضافة', 'إعلانات موجَّهة حلال'],
            breakeven: 'الشهر 8',
            note: 'أرقام تقديرية — تحتاج نموذج مالي مفصّل مع خبير'
        };
    }

    // ─────────────────────────────────────────────────────────────
    // بناء البيانات الثابتة للمنهجيات
    // ─────────────────────────────────────────────────────────────
    _buildMethodologies() {
        return [
            {
                id: 'design-thinking',
                name: 'التفكير التصميمي',
                nameEn: 'Design Thinking',
                origin: 'IDEO / Stanford d.school',
                icon: '🎨',
                phases: ['Empathize — تعاطف', 'Define — حدّد', 'Ideate — ابتكر', 'Prototype — نمّذج', 'Test — اختبر'],
                whenToUse: 'عندما تريد حل مشكلة إنسانية — فهم عميق للمستخدم أولاً قبل البناء',
                islamicLink: '﴿لَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ﴾ — تعاطف حقيقي مع احتياجات الناس',
                tools: ['خريطة التعاطف (Empathy Map)', 'خريطة رحلة العميل', 'نقاط الألم (Pain Points)', 'How Might We', 'Brain Dump', 'Crazy 8s', 'Storyboard', 'User Testing'],
                timeframe: '1-5 أيام للجلسة الكاملة',
                output: 'فهم عميق للمستخدم + أفكار مُختبرة + نموذج أولي'
            },
            {
                id: 'lean-startup',
                name: 'المشروع الخفيف',
                nameEn: 'Lean Startup',
                origin: 'Eric Ries',
                icon: '⚡',
                phases: ['Build — ابنِ', 'Measure — قِس', 'Learn — تعلّم', 'Pivot or Persist — تكيّف أو استمر'],
                whenToUse: 'عندما تريد اختبار فرضيات بأقل تكلفة وأسرع وقت',
                islamicLink: '«ما أكل أحد طعاماً قط خيراً من أن يأكل من عمل يده» — القيمة الحقيقية من الإنتاج الفعلي',
                tools: ['MVP (المنتج الأولي)', 'A/B Testing', 'Customer Discovery', 'Validated Learning', 'Pivot Framework', 'Innovation Accounting'],
                timeframe: '2-4 أسابيع لأول دورة',
                output: 'MVP مُختبر + فرضيات مُتحقق منها + قرار واضح'
            },
            {
                id: 'jobs-to-be-done',
                name: 'الوظيفة المطلوبة',
                nameEn: 'Jobs to Be Done (JTBD)',
                origin: 'Clayton Christensen',
                icon: '🔧',
                phases: ['اكتشف الوظيفة الحقيقية', 'افهم السياق', 'قيّم الحلول البديلة', 'صمّم الحل الأفضل'],
                whenToUse: 'عندما تريد فهم لماذا يشتري الناس المنتج — الدافع الحقيقي لا الوصف السطحي',
                islamicLink: '«خير الناس أنفعهم للناس» — النفع الحقيقي للوظيفة التي يحتاجها الناس',
                tools: ['مقابلات الوظيفة', 'خريطة الوظائف', 'Forces of Progress', 'Outcome-Driven Innovation'],
                timeframe: '1-2 أسبوع للبحث',
                output: 'بيان الوظيفة + فرص غير مشبعة + ميزة تنافسية'
            },
            {
                id: 'blue-ocean',
                name: 'المحيط الأزرق',
                nameEn: 'Blue Ocean Strategy',
                origin: 'Kim & Mauborgne',
                icon: '🌊',
                phases: ['تحليل الصناعة الحالية (المحيط الأحمر)', 'رسم خريطة الاستراتيجية', 'تطبيق ERRC Grid', 'إنشاء فضاء سوقي جديد'],
                whenToUse: 'عندما تريد الخروج من المنافسة الشرسة وإنشاء سوق جديد',
                islamicLink: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ﴾ — الريادة في فتح أسواق جديدة حلال',
                tools: ['Strategy Canvas', 'ERRC Grid (Eliminate/Reduce/Raise/Create)', 'Six Path Framework', 'Buyer Utility Map', 'Price Corridor', 'Business Model Guide'],
                timeframe: '2-4 أسابيع للتحليل',
                output: 'استراتيجية المحيط الأزرق + خريطة القيمة الجديدة'
            },
            {
                id: 'agile-scrum',
                name: 'أجايل / سكرم',
                nameEn: 'Agile / Scrum',
                origin: 'Agile Manifesto 2001',
                icon: '🔄',
                phases: ['Sprint Planning', 'Daily Standup', 'Sprint Review', 'Sprint Retrospective'],
                whenToUse: 'بناء المنتج الرقمي — التطوير السريع — التعديل المستمر',
                islamicLink: 'الشورى المستمرة — التكيف مع الواقع — تحسين مستمر',
                tools: ['Product Backlog', 'Sprint Backlog', 'Kanban Board', 'Velocity Chart', 'Burndown Chart', 'User Stories'],
                timeframe: 'Sprint كل 2 أسبوع',
                output: 'منتج يعمل — تسليم مستمر — تحسين مستمر'
            },
            {
                id: 'triz',
                name: 'TRIZ — ابتكار منهجي',
                nameEn: 'TRIZ (Theory of Inventive Problem Solving)',
                origin: 'Altshuller — USSR 1946',
                icon: '🧠',
                phases: ['تعريف التناقض (Contradiction)', 'تطبيق المبادئ الابتكارية الـ 40', 'حل التناقض الجذري', 'نموذج المثالية'],
                whenToUse: 'عندما تواجه تناقضات تقنية — ابتكار هندسي منهجي',
                islamicLink: 'الإتقان — حل المشكلات بطريقة جذرية — التفكير خارج الحدود',
                tools: ['40 Inventive Principles', 'Contradiction Matrix', 'ARIZ Algorithm', 'Substance-Field Model', 'Ideal Final Result'],
                timeframe: 'أيام إلى أسابيع حسب التعقيد',
                output: 'حل إبداعي لتناقض تقني + براءة اختراع محتملة'
            },
            {
                id: 'platform-thinking',
                name: 'تفكير المنصات',
                nameEn: 'Platform Thinking',
                origin: 'Sangeet Paul Choudary',
                icon: '🔗',
                phases: ['تحديد المشاركين (Producers & Consumers)', 'تصميم التفاعل الجوهري', 'إطلاق وكسر دجاجة برغة (Cold Start)', 'تضخيم التأثير الشبكي'],
                whenToUse: 'عند بناء منصة تربط طرفين أو أكثر',
                islamicLink: 'سوق المدينة المنورة — تسهيل التجارة بين الناس',
                tools: ['Platform Canvas', 'Network Effect Map', 'Core Interaction Design', 'Anti-Network Effect Analysis'],
                timeframe: '3-6 أشهر لإطلاق منصة قابلة للحياة',
                output: 'منصة ذات تأثير شبكي + نمو عضوي'
            }
        ];
    }

    _buildProductStages() {
        return [
            { id: 1, name: 'الفكرة (Idea)', trl: '1', icon: '💡', duration: 'أيام',
              activities: ['Brain dump', 'مقابلة 5 أشخاص من السوق', 'تحقق من وجود المشكلة', 'بحث المنافسين'],
              output: 'وثيقة الفكرة المُختبرة', gate: 'هل المشكلة حقيقية ومؤلمة بما يكفي؟' },
            { id: 2, name: 'الاكتشاف (Discovery)', trl: '2', icon: '🔍', duration: '1-2 أسبوع',
              activities: ['Customer Discovery 10 مقابلات', 'Value Proposition Canvas', 'تحديد شريحة العملاء الأولى', 'فحص شرعي أولي'],
              output: 'Value Proposition واضح + شريحة عملاء محددة', gate: 'هل هناك 10 أشخاص يريدون الدفع؟' },
            { id: 3, name: 'النموذج الورقي (Paper Prototype)', trl: '3', icon: '📝', duration: '2-3 أيام',
              activities: ['رسم Wireframes ورقية', 'User Flow Mapping', 'اختبار مع 5 مستخدمين', 'تسجيل الملاحظات'],
              output: 'Prototype ورقي مُختبر', gate: 'هل المستخدم يفهم كيفية الاستخدام؟' },
            { id: 4, name: 'النموذج الرقمي (Digital Prototype)', trl: '4', icon: '🖥️', duration: '1-2 أسبوع',
              activities: ['Figma/Adobe XD Mockup', 'Click-through Prototype', 'Usability Testing', 'تحليل المسار'],
              output: 'Prototype رقمي قابل للنقر', gate: 'هل معدل إكمال المهمة > 70%؟' },
            { id: 5, name: 'MVP (الحد الأدنى من المنتج)', trl: '5-6', icon: '⚡', duration: '4-8 أسابيع',
              activities: ['تطوير MVP يحل المشكلة الأساسية فقط', 'CI/CD Pipeline', 'مؤشرات أداء أساسية', 'Soft Launch لـ beta users'],
              output: 'MVP يعمل + أولى البيانات الحقيقية', gate: 'هل هناك مستخدمون نشطون يعودون؟' },
            { id: 6, name: 'Pilot (التجريب الميداني)', trl: '6-7', icon: '🧪', duration: '30-90 يوم',
              activities: ['20-100 مستخدم حقيقي', 'A/B Testing', 'Cohort Analysis', 'قياس PMF (Product Market Fit)', 'اختبار التسعير'],
              output: 'PMF Score + بيانات للقرار', gate: 'هل PMF > 40%؟ (40% يقولون "محبط جداً" بدون المنتج)' },
            { id: 7, name: 'إطلاق تجاري (Commercial Launch)', trl: '7-8', icon: '🚀', duration: '1-3 أشهر',
              activities: ['Go-to-Market Strategy', 'Marketing Funnel', 'Sales Process', 'Customer Onboarding', 'Support System'],
              output: 'عملاء حقيقيون يدفعون + إيرادات أولى', gate: 'هل CAC < LTV × 3؟' },
            { id: 8, name: 'النمو (Growth)', trl: '9', icon: '📈', duration: 'مستمر',
              activities: ['Growth Hacking', 'Channel Optimization', 'Product-Led Growth', 'Retention Programs', 'Referral System'],
              output: 'نمو مستدام + تأثير شبكي', gate: 'هل NPS > 50؟ هل MoM Growth > 15%؟' },
            { id: 9, name: 'التوسع (Scale)', trl: '9+', icon: '🌍', duration: 'مستمر',
              activities: ['Geographic Expansion', 'New Segments', 'Partnership & API', 'Fundraising Halal', 'International Markets'],
              output: 'منصة في أسواق متعددة', gate: 'هل Unit Economics قوية؟ هل الفريق جاهز؟' }
        ];
    }

    _buildInnovationTools() {
        return {
            ideaGeneration: [
                { name: 'Brain Dump', desc: 'كتابة كل الأفكار بلا حكم في 10 دقائق', time: '10 دقائق', participants: '1+' },
                { name: 'SCAMPER', desc: 'Substitute / Combine / Adapt / Modify / Put to other uses / Eliminate / Reverse', time: '30 دقيقة', participants: '2-8' },
                { name: 'Mind Mapping', desc: 'خريطة ذهنية تنطلق من الفكرة المحورية', time: '20-60 دقيقة', participants: '1-5' },
                { name: 'Random Word Technique', desc: 'ربط كلمة عشوائية بالمشكلة لإيجاد حلول غير تقليدية', time: '20 دقيقة', participants: '2-6' },
                { name: 'How Might We (HMW)', desc: 'إعادة صياغة المشكلة كفرصة: كيف يمكننا أن...؟', time: '30 دقيقة', participants: '2-10' },
                { name: 'Crazy 8s', desc: '8 أفكار مختلفة في 8 دقائق — السرعة تكسر حواجز الحكم المسبق', time: '8 دقائق', participants: '1+' }
            ],
            validation: [
                { name: 'Customer Discovery', desc: '10+ مقابلات مع عملاء محتملين — استمع لا تبع', time: 'أسبوع', participants: 'مؤسس واحد' },
                { name: 'Smoke Test', desc: 'صفحة هبوط Landing Page قبل بناء المنتج — قس الاهتمام الحقيقي', time: 'يوم واحد', participants: '1-2' },
                { name: 'Concierge MVP', desc: 'قدّم الخدمة يدوياً لأول 10 عملاء — افهم الاحتياج الحقيقي', time: '1-2 أسبوع', participants: '1-3' },
                { name: 'Wizard of Oz', desc: 'محاكاة الأتمتة يدوياً — العميل يظن أنه آلي وأنت تعمل خلف الكواليس', time: 'أسابيع', participants: '2-5' },
                { name: 'Pre-Sale', desc: 'بع قبل أن تبني — أفضل اختبار للطلب الحقيقي', time: 'أيام', participants: '1-2' }
            ],
            testing: [
                { name: 'A/B Testing', desc: 'اختبر نسختين مختلفتين من نفس الميزة — دع البيانات تقرر', metric: 'Conversion Rate' },
                { name: 'Cohort Analysis', desc: 'تتبع مجموعة مستخدمين معاً عبر الزمن — اكتشف الধرابة', metric: 'Retention Rate' },
                { name: 'NPS Survey', desc: 'Net Promoter Score — هل توصي بالمنتج؟ (-100 إلى +100)', metric: 'NPS Score > 50 = ممتاز' },
                { name: 'Usability Testing', desc: 'راقب 5 مستخدمين يستخدمون المنتج — ستفاجأ بما تراه', metric: 'Task Completion Rate' },
                { name: 'PMF Survey', desc: 'هل ستكون محبطاً جداً إذا لم تتمكن من استخدام هذا المنتج؟ > 40% = PMF', metric: 'PMF Score' }
            ],
            analysis: [
                { name: 'Value Proposition Canvas', desc: 'مطابقة Jobs/Pains/Gains العميل مع المنتج/المسكّنات/المحفّزات' },
                { name: 'Business Model Canvas', desc: '9 بنود في صفحة واحدة — شاهد نموذج عملك دفعة واحدة' },
                { name: 'Lean Canvas', desc: 'نسخة Lean Startup من الـ BMC — تركيز على المشكلة والحل' },
                { name: 'SWOT Analysis', desc: 'Strengths / Weaknesses / Opportunities / Threats — رؤية 360°' },
                { name: 'Porter 5 Forces', desc: 'قياس قوى المنافسة في الصناعة — احتمال الربحية' },
                { name: 'Jobs to Be Done Canvas', desc: 'ما الوظيفة الحقيقية التي يوظّف العميل منتجك لإنجازها؟' }
            ]
        };
    }

    _buildMarketEntry() {
        return [
            {
                id: 'direct-sales',
                name: 'المبيعات المباشرة',
                desc: 'فريق مبيعات يتواصل مع العملاء مباشرة — فعّال للـ B2B',
                cost: 'متوسط-مرتفع',
                speed: 'متوسط',
                best_for: 'منتجات B2B، قيمة عقد > 5,000 ريال',
                islamic: 'صدق في العرض — لا ضغط مبالغ — بيع عن تراضٍ'
            },
            {
                id: 'content-marketing',
                name: 'التسويق بالمحتوى',
                desc: 'محتوى قيّم يجذب العملاء عضوياً — بناء الثقة والسلطة',
                cost: 'منخفض',
                speed: 'بطيء (3-12 شهر)',
                best_for: 'SaaS، منتجات تعليمية، خدمات مهنية',
                islamic: 'قيمة حقيقية لا إغراء — صدق في المحتوى'
            },
            {
                id: 'partnerships',
                name: 'الشراكات الاستراتيجية',
                desc: 'ربط مع شركاء لديهم العملاء + تقديم قيمة مشتركة',
                cost: 'منخفض-متوسط',
                speed: 'متوسط-سريع',
                best_for: 'منتجات تكميلية — شراكات B2B',
                islamic: 'تعاون على البر — وكالة مشروعة — مشاركة الأرباح بعدل'
            },
            {
                id: 'community-led',
                name: 'النمو المجتمعي',
                desc: 'بناء مجتمع حول المنتج — المستخدمون يجلبون مستخدمين',
                cost: 'منخفض',
                speed: 'متوسط',
                best_for: 'منصات، ادوات للمطورين، منتجات تشاركية',
                islamic: 'التعاون — المنفعة المشتركة — الأمر بالمعروف'
            },
            {
                id: 'freemium',
                name: 'نموذج المجاني-المميز',
                desc: 'نسخة مجانية تجذب المستخدمين + نسخة مدفوعة للميزات المتقدمة',
                cost: 'متوسط',
                speed: 'سريع للاستحواذ',
                best_for: 'SaaS، تطبيقات، أدوات إنتاجية',
                islamic: 'منفعة مجانية للجميع + خدمة مميزة بثمن عادل معلن'
            },
            {
                id: 'pilot-then-launch',
                name: 'Pilot ثم إطلاق كامل',
                desc: 'اختبار محدود مع مجموعة أولى — تحسين — إطلاق واسع',
                cost: 'منخفض',
                speed: 'متحكم به',
                best_for: 'أي منتج جديد — لا تعرف رد فعل السوق',
                islamic: 'حكمة في الدخول — لا تبذير — تعلّم قبل التوسع'
            }
        ];
    }

    _buildAccelerator() {
        return {
            name: 'مسرعة شيخة للأعمال الرقمية',
            tagline: 'من الصفر إلى الإيراد في 90 يوم',
            duration: '3 أشهر (12 أسبوع)',
            tracks: [
                {
                    week: '1-2', phase: 'Foundation', name: 'الأساس',
                    focus: 'فهم المشكلة + التحقق من الفكرة',
                    activities: ['Customer Discovery (20 مقابلة)', 'Value Proposition Canvas', 'Competitive Analysis', 'فحص شرعي'],
                    deliverable: 'وثيقة المشكلة + Value Proposition مُختبر'
                },
                {
                    week: '3-4', phase: 'Prototype', name: 'النمذجة',
                    focus: 'بناء نموذج أولي سريع واختباره',
                    activities: ['Paper Prototype', 'Digital Mockup', 'Usability Testing', 'تكرار سريع'],
                    deliverable: 'Prototype رقمي مُختبر مع 10 مستخدمين'
                },
                {
                    week: '5-8', phase: 'MVP', name: 'المنتج الأدنى',
                    focus: 'بناء MVP يعمل + Pilot أولي',
                    activities: ['Agile Development', 'Pilot مع 20 مستخدم', 'PMF Measurement', 'Pivot إذا لزم'],
                    deliverable: 'MVP يعمل + أولى البيانات الحقيقية'
                },
                {
                    week: '9-11', phase: 'Revenue', name: 'الإيراد',
                    focus: 'أول 10 عملاء يدفعون',
                    activities: ['Sales Process', 'Pricing Validation', 'Customer Onboarding', 'Revenue Metrics'],
                    deliverable: 'أولى الإيرادات الحلال + Unit Economics'
                },
                {
                    week: '12', phase: 'Demo Day', name: 'يوم العرض',
                    focus: 'عرض أمام المستثمرين والشركاء',
                    activities: ['Pitch Deck', 'Demo Live', 'Q&A Session', 'Networking'],
                    deliverable: 'Pitch Deck + Demo + فرص تمويل حلال'
                }
            ],
            services: [
                'إرشاد أسبوعي من رواد أعمال ناجحين',
                'ورش عمل عملية (Design Thinking, Lean, Agile)',
                'شبكة اتصالات (Investors, Partners, Customers)',
                'دعم قانوني وشرعي',
                'خدمات تقنية (Cloud, AI, APIs)',
                'تمويل بذري حلال (مضاربة/مشاركة)'
            ]
        };
    }

    _buildPilotFramework() {
        return {
            definition: 'Pilot هو تجربة محكومة للمنتج مع مجموعة صغيرة من المستخدمين الحقيقيين بهدف التحقق من الفرضيات قبل الإطلاق الكامل',
            phases: [
                {
                    phase: 'Pre-Pilot', name: 'الإعداد',
                    steps: ['تحديد الهدف من الـ Pilot', 'اختيار 20-50 مستخدم مستهدف', 'تحديد مقاييس النجاح (Success Metrics)', 'إعداد أدوات التتبع', 'فحص شرعي للبيانات']
                },
                {
                    phase: 'Launch', name: 'الإطلاق',
                    steps: ['Onboarding المستخدمين', 'متابعة يومية للأداء', 'جمع Feedback فوري', 'حل المشكلات في اليوم نفسه']
                },
                {
                    phase: 'Measure', name: 'القياس',
                    steps: ['تتبع الـ KPIs يومياً', 'Cohort Analysis', 'Churn Analysis', 'Revenue per User (إذا مدفوع)', 'NPS Survey']
                },
                {
                    phase: 'Learn & Decide', name: 'التعلم والقرار',
                    steps: ['تحليل البيانات المجمّعة', 'مقارنة مع Success Metrics', 'قرار: Continue / Pivot / Stop', 'توثيق الدروس المستفادة']
                }
            ],
            successMetrics: {
                usage: 'DAU/MAU > 30%',
                retention: 'Retention Week 1 > 50%, Week 4 > 25%',
                pmf: 'PMF Score > 40%',
                nps: 'NPS > 30',
                revenue: 'Willingness to Pay > 20% من المستخدمين'
            },
            tools: ['Mixpanel / Amplitude للتتبع', 'Hotjar لخرائط الحرارة', 'Typeform للاستطلاعات', 'Notion لإدارة التجربة']
        };
    }

    _buildIPFramework() {
        return {
            title: 'توثيق الملكية الفكرية (IP Documentation)',
            types: [
                {
                    type: 'براءة الاختراع',
                    nameEn: 'Patent',
                    when: 'اختراع تقني جديد وغير واضح وقابل للتطبيق الصناعي',
                    steps: ['توثيق الاختراع بتاريخ محدد (Invention Disclosure)', 'بحث عن براءات مشابهة (Prior Art)', 'تقديم طلب مبدئي (Provisional)', 'تقديم طلب كامل خلال 12 شهر'],
                    authority: 'هيئة الملكية الفكرية السعودية (SAIP)',
                    islamicNote: 'الاختراع حق للمخترع — توثيقه حماية للحق'
                },
                {
                    type: 'العلامة التجارية',
                    nameEn: 'Trademark',
                    when: 'الاسم التجاري + الشعار + أي علامة مميزة للمنتج',
                    steps: ['بحث عن تعارض مع علامات قائمة', 'تسجيل في SAIP', 'تجديد كل 10 سنوات', 'مراقبة التعدي'],
                    authority: 'هيئة الملكية الفكرية السعودية',
                    islamicNote: 'الاسم التجاري أمانة — لا يُنسب لغيرك'
                },
                {
                    type: 'حقوق النشر',
                    nameEn: 'Copyright',
                    when: 'الكود البرمجي، المحتوى، التصاميم، الكتابات',
                    steps: ['توثيق الإبداع بتاريخ محدد', 'إضافة © على المواد', 'تسجيل رسمي للأعمال المهمة', 'عقود ملكية مع الفريق (Work for Hire)'],
                    authority: 'ينشأ تلقائياً لكن التسجيل يقوّي الحماية',
                    islamicNote: 'الجهد الإبداعي حق صاحبه — لا سرقة أدبية'
                },
                {
                    type: 'الأسرار التجارية',
                    nameEn: 'Trade Secrets',
                    when: 'الخوارزميات السرية، قائمة العملاء، الصيغ الخاصة',
                    steps: ['توثيق ما هو سري', 'عقود سرية مع الفريق (NDA)', 'قيود الوصول التقني', 'سياسة أمن المعلومات'],
                    authority: 'الحماية تعتمد على الإجراءات الداخلية',
                    islamicNote: 'حفظ الأسرار أمانة — لا خيانة للعقود'
                }
            ],
            islamicIP: {
                title: 'الملكية الفكرية في الفقه الإسلامي',
                scholars: 'كثير من العلماء المعاصرين يقرّون بحماية الملكية الفكرية كحق مكتسب',
                principle: 'الجهد الإبداعي مالٌ له قيمة — وأكل ثمره بغير إذن صاحبه ظلم',
                reference: 'مجمع الفقه الإسلامي — قرار رقم 43 بشأن حقوق التأليف'
            }
        };
    }

    _buildMentorSystem() {
        return {
            title: 'نظام المرشدين (Mentor Network)',
            concept: 'رائد الأعمال الناجح يُرشد المبتدئين — سلسلة المعلمية الإسلامية',
            hadith: '«من سن في الإسلام سنة حسنة فله أجرها وأجر من عمل بها»',
            tracks: [
                { track: 'تقني', mentors: 'مطورون + CTO من شركات ناجحة', focus: 'البناء، التقنية، Architecture' },
                { track: 'تجاري', mentors: 'رواد أعمال + مديرو مبيعات ناجحون', focus: 'Go-to-Market، المبيعات، النمو' },
                { track: 'شرعي', mentors: 'علماء متخصصون في المعاملات', focus: 'فحص شرعي الأعمال، عقود حلال' },
                { track: 'مالي', mentors: 'خبراء تمويل حلال + مستثمرون', focus: 'نماذج مالية، جمع تمويل حلال' },
                { track: 'تسويقي', mentors: 'مديرو تسويق + Growth Hackers', focus: 'Strategy، Branding، Growth' }
            ],
            process: [
                'تقديم طلب إرشاد مع وصف المشروع',
                'مطابقة مع المرشد المناسب',
                'جلسة تعارف أولى (30 دقيقة)',
                'برنامج إرشاد شهري (4 جلسات/شهر)',
                'تقييم دوري ومتابعة التقدم',
                'رائد الأعمال الناجح يصبح مرشداً بدوره'
            ]
        };
    }

    _buildValueFramework() {
        return {
            title: 'منظومة القيمة المضافة الإسلامية الرقمية',
            islamicValue: '«خير الناس أنفعهم للناس»',
            dimensions: [
                { dimension: 'القيمة الوظيفية', desc: 'ما المهمة الجوهرية التي ينجزها المنتج؟', measure: 'Task Completion Rate' },
                { dimension: 'القيمة الاقتصادية', desc: 'كيف يوفّر المال أو يولّد الإيراد؟', measure: 'ROI / Cost Savings' },
                { dimension: 'القيمة الاجتماعية', desc: 'كيف يُحسّن حياة المجتمع؟', measure: 'Social Impact Score' },
                { dimension: 'القيمة الرقمية', desc: 'كيف يُرقمن ويُبسّط ويُوحّد؟', measure: 'Digital Efficiency Gain' },
                { dimension: 'القيمة الإسلامية', desc: 'كيف يُعلي موازين الحلال؟', measure: 'Shariah Compliance Score' },
                { dimension: 'القيمة المستدامة', desc: 'كيف يُراعي البيئة والأجيال القادمة؟', measure: 'Sustainability Index' }
            ],
            valueCanvas: {
                customerJobs: ['ما الذي يحاول العميل إنجازه؟', 'ما الوظائف الوظيفية والاجتماعية والعاطفية؟'],
                pains: ['ما الذي يُزعج العميل؟', 'ما المخاطر؟ ما الحواجز؟'],
                gains: ['ما الذي يريد العميل تحقيقه؟', 'ما الفوائد المتوقعة والمفاجئة؟'],
                products: ['ما المنتجات والخدمات المقدَّمة؟'],
                painRelievers: ['كيف يُخفّف المنتج آلام العميل؟'],
                gainCreators: ['كيف يخلق المنتج مكاسب للعميل؟']
            }
        };
    }

    // ─────────────────────────────────────────────────────────────
    // واجهة للـ API
    // ─────────────────────────────────────────────────────────────
    getStatus() {
        return {
            isRunning: this.isRunning,
            version: this.version,
            cycle: this.cycle,
            startedAt: this.startedAt,
            innovationScore: this.innovationScore,
            kpis: this.kpis,
            liveIdeasCount: this.liveIdeas.length,
            activePilotsCount: this.activePilots.length,
            latestMarketSignals: this.marketSignals.slice(0, 5)
        };
    }

    getSummary() {
        return {
            methodologies: this.methodologies.length,
            productStages: this.productStages.length,
            innovationToolCategories: Object.keys(this.innovationTools).length,
            marketEntryStrategies: this.marketEntryStrategies.length,
            acceleratorWeeks: this.acceleratorProgram.tracks.length,
            pilotPhases: this.pilotFramework.phases.length,
            ipTypes: this.ipFramework.types.length,
            mentorTracks: this.mentorSystem.tracks.length,
            valueDimensions: this.valueFramework.dimensions.length
        };
    }
}

// Singleton
const engine = new SheikhaEntrepreneurshipEngine();
module.exports = engine;
