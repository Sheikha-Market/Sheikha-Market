/**
 * شيخة — محرك بزنس كوتش + أكشن كوتش الإسلامي الرقمي
 * Business Coach + Action Coach Engine powered by Quran & Sunnah
 * بسم الله الرحمن الرحيم
 */

'use strict';

const EventEmitter = require('events');

class SheikhaBusinessCoachEngine extends EventEmitter {
    constructor() {
        super();
        this.version = '1.0.0';
        this.name = 'شيخة — بزنس كوتش إسلامي رقمي';
        this.started = false;
        this.cycleCount = 0;
        this.kpis = {
            sessionsCompleted: 0,
            goalsSet: 0,
            actionsGenerated: 0,
            businessesDiagnosed: 0,
            okrsCrated: 0,
            financialPlansBuilt: 0
        };
        this._buildData();
    }

    start() {
        if (this.started) return this;
        this.started = true;
        this._interval = setInterval(() => {
            this.cycleCount++;
            this.emit('cycle', { cycle: this.cycleCount, ts: Date.now() });
        }, 60_000);
        this.emit('started', { ts: Date.now() });
        return this;
    }

    stop() {
        if (this._interval) clearInterval(this._interval);
        this.started = false;
        return this;
    }

    getStatus() {
        return {
            running: this.started,
            version: this.version,
            cycles: this.cycleCount,
            kpis: this.kpis,
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════
    // أساس المحرك — بناء البيانات
    // ═══════════════════════════════════════════════════════════
    _buildData() {
        this.islamicFoundation = this._buildIslamicFoundation();
        this.actionCoach6Steps = this._buildActionCoach6Steps();
        this.digitalTools = this._buildDigitalTools();
        this.coachingModels = this._buildCoachingModels();
        this.okrTemplates = this._buildOKRTemplates();
        this.kpiLibrary = this._buildKPILibrary();
        this.salesTools = this._buildSalesTools();
        this.financialTools = this._buildFinancialTools();
        this.marketingTools = this._buildMarketingTools();
        this.leadershipTools = this._buildLeadershipTools();
        this.productivityTools = this._buildProductivityTools();
    }

    // ═══ الأساس القرآني والسني للكوتشينج ═══
    _buildIslamicFoundation() {
        return {
            title: 'أساس الكوتشينج الإسلامي',
            quranicBasis: [
                {
                    concept: 'الإتقان',
                    ayah: '﴿إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ﴾',
                    source: 'حديث شريف',
                    coachingLesson: 'التميز في كل جانب من جوانب العمل — Quality First',
                    digitalApply: 'معيار التميز في كل خطوة من مسيرة الأعمال'
                },
                {
                    concept: 'التخطيط',
                    ayah: '﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾',
                    source: 'الأنفال: 60',
                    coachingLesson: 'التحضير والتخطيط الاستراتيجي المسبق',
                    digitalApply: 'Strategic Planning + Resource Allocation'
                },
                {
                    concept: 'الشورى',
                    ayah: '﴿وَشَاوِرْهُمْ فِي الْأَمْرِ﴾',
                    source: 'آل عمران: 159',
                    coachingLesson: 'القيادة التشاركية وبناء الفريق',
                    digitalApply: 'Team Coaching + Collaborative Decision Making'
                },
                {
                    concept: 'الاستخلاف',
                    ayah: '﴿وَهُوَ الَّذِي جَعَلَكُمْ خَلَائِفَ الْأَرْضِ﴾',
                    source: 'الأنعام: 165',
                    coachingLesson: 'المسؤولية والحوكمة الراشدة في الأعمال',
                    digitalApply: 'Stewardship Leadership + Accountability System'
                },
                {
                    concept: 'التوكل مع العمل',
                    ayah: '﴿فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ﴾',
                    source: 'آل عمران: 159',
                    coachingLesson: 'التوازن بين الجهد البشري والتوكل على الله',
                    digitalApply: 'Balanced Effort + Tawakkul Model — خطط وتوكل'
                },
                {
                    concept: 'رأس المال البشري',
                    ayah: '﴿وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ﴾',
                    source: 'يوسف: 76',
                    coachingLesson: 'التعلم المستمر وتطوير الكفاءات',
                    digitalApply: 'Continuous Learning Engine + Skills Development'
                }
            ],
            coachingPrinciple: 'الكوتشينج الإسلامي الرقمي: تحقيق أعلى أداء مع الامتثال الكامل للشريعة',
            disclaimer: 'الكوتشينج أداة تطوير أداء — لا يُغني عن العلم الشرعي في المسائل الفقهية'
        };
    }

    // ═══ ActionCOACH — 6 خطوات للنجاح ═══
    _buildActionCoach6Steps() {
        return {
            name: 'نموذج أكشن كوتش — 6 خطوات للنجاح',
            nameEn: 'ActionCOACH 6 Steps to Business Success',
            origin: 'ActionCOACH International — معدّل إسلامياً بمنهج شيخة',
            islamicTag: 'أساسه: "اعقلها وتوكل" — جهد + توكل + إتقان',
            steps: [
                {
                    id: 1,
                    number: '01',
                    name: 'الإتقان',
                    nameEn: 'Mastery',
                    icon: '⚙️',
                    color: '#ef4444',
                    desc: 'إتقان الأساسيات — التدفق النقدي، الوقت، التسليم، الرؤية',
                    islamicRef: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',
                    areas: [
                        { name: 'إتقان الوقت', nameEn: 'Time Mastery', tools: ['Time Audit', 'Eisenhower Matrix', 'Pomodoro Halal', 'Energy Map'], islamicLink: '«نعمتان مغبون فيهما كثير من الناس: الصحة والفراغ»' },
                        { name: 'إتقان المال', nameEn: 'Money Mastery', tools: ['Cash Flow Dashboard', 'Break-Even Calculator', 'Budget Builder', 'Halal Profit Model'], islamicLink: '«المال فيه سعة لكم في الدنيا والآخرة»' },
                        { name: 'إتقان التسليم', nameEn: 'Delivery Mastery', tools: ['SOP Builder', 'Quality Checklist', 'Customer Journey Map', 'Service Blueprint'], islamicLink: '«أدّ الأمانة إلى من ائتمنك»' },
                        { name: 'إتقان الرؤية', nameEn: 'Destiny/Vision', tools: ['Vision Statement Builder', 'Mission Canvas', 'Values Clarifier', 'Purpose Map'], islamicLink: '«وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَى»' }
                    ],
                    diagnosticQuestions: [
                        'هل تعرف مصادر إيراداتك الشهرية بدقة؟',
                        'هل لديك نظام تتبع للوقت؟',
                        'هل لديك عمليات موثقة لتسليم خدمتك؟',
                        'هل رؤيتك لعملك واضحة محددة مكتوبة؟'
                    ]
                },
                {
                    id: 2,
                    number: '02',
                    name: 'المنطقة',
                    nameEn: 'Niche',
                    icon: '🎯',
                    color: '#f97316',
                    desc: 'استهداف العميل المثالي — USP — الضمان — التسويق',
                    islamicRef: '«لا يُكلَّف نفس إلا وسعها» — التخصص رحمة',
                    areas: [
                        { name: 'العميل المثالي', nameEn: 'Dream Client', tools: ['Customer Avatar Builder', 'Persona Canvas', 'Empathy Map', 'ICP Profiler'], islamicLink: 'صدق التعامل مع كل عميل كأمانة' },
                        { name: 'العرض الفريد', nameEn: 'USP', tools: ['USP Builder', 'Value Ladder', 'Differentiation Matrix', 'Blue Ocean Canvas'], islamicLink: '«فبشّر عبادي الذين يستمعون القول فيتبعون أحسنه»' },
                        { name: 'الضمان والثقة', nameEn: 'Guarantee', tools: ['Guarantee Builder', 'Trust Signals', 'Social Proof System', 'Halal Promise'], islamicLink: 'الوفاء بالعقود: «أوفوا بالعقود»' },
                        { name: 'التسويق المستهدف', nameEn: 'Targeted Marketing', tools: ['Marketing Funnel Builder', 'Content Calendar', 'Lead Magnet Lab', 'A/B Test Tracker'], islamicLink: 'التبيين: «البيّعان بالخيار ما لم يتفرقا»' }
                    ],
                    diagnosticQuestions: [
                        'هل تعرف عميلك المثالي بدقة (العمر، الاحتياج، الألم، الرغبة)؟',
                        'ما الذي يميزك عن منافسيك بكلمة واحدة؟',
                        'هل لديك ضمان واضح لعملائك؟',
                        'هل نظامك التسويقي يعمل بدونك؟'
                    ]
                },
                {
                    id: 3,
                    number: '03',
                    name: 'الرافعة',
                    nameEn: 'Leverage',
                    icon: '⚡',
                    color: '#eab308',
                    desc: 'الأنظمة والتقنية والتسويق بالرافعة',
                    islamicRef: '«فأما الزبد فيذهب جُفاءً وأما ما ينفع الناس فيمكث»',
                    areas: [
                        { name: 'أنظمة العمل', nameEn: 'Systems', tools: ['Workflow Builder', 'SOP Library', 'Process Map', 'Automation Planner'], islamicLink: 'النظام من الإيمان — ترتيب الأمور' },
                        { name: 'رافعة التقنية', nameEn: 'Technology Leverage', tools: ['Tech Stack Audit', 'Automation Mapper', 'AI Tools Selector', 'Digital Workflow'], islamicLink: '«من دلّ على خير فله مثل أجر فاعله»' },
                        { name: 'رافعة التسويق', nameEn: 'Marketing Leverage', tools: ['Content Repurpose Tool', 'Referral System Builder', 'Affiliate Halal', 'SEO Planner'], islamicLink: 'نشر الخير والنفع هو الرافعة الحقيقية' },
                        { name: 'رافعة المعرفة', nameEn: 'Knowledge Leverage', tools: ['IP Asset Mapper', 'Training System Builder', 'Knowledge Base', 'Course Launcher'], islamicLink: '«وفوق كل ذي علم عليم» — كثّر علمك وانفع به' }
                    ],
                    diagnosticQuestions: [
                        'هل عملك يعمل بدونك لساعات يومياً؟',
                        'هل لديك أنظمة موثقة لكل وظيفة رئيسية؟',
                        'هل تستخدم الأتمتة والذكاء الاصطناعي لتوفير الوقت؟',
                        'هل عملاؤك يحيلون إليك عملاء جدداً تلقائياً؟'
                    ]
                },
                {
                    id: 4,
                    number: '04',
                    name: 'الفريق',
                    nameEn: 'Team',
                    icon: '👥',
                    color: '#22c55e',
                    desc: 'بناء الفريق والثقافة والقيم',
                    islamicRef: '﴿وَشَاوِرْهُمْ فِي الْأَمْرِ﴾ — القيادة الشورية',
                    areas: [
                        { name: 'توظيف الأفضل', nameEn: 'Hiring', tools: ['Job Description Builder', 'Interview Scorecard', 'Culture Fit Test', 'Onboarding Checklist'], islamicLink: '«إذا وُسِّد الأمر لغير أهله فانتظر الساعة» — الكفاءة أمانة' },
                        { name: 'ثقافة العمل', nameEn: 'Culture', tools: ['Culture Canvas', 'Values Alignment', 'Team Agreement', 'Recognition System'], islamicLink: 'الأخوة في العمل: «المؤمن للمؤمن كالبنيان يشد بعضه بعضاً»' },
                        { name: 'قياس الأداء', nameEn: 'Performance', tools: ['KPI Scoreboard', 'Performance Review', '1-on-1 Template', 'Feedback Culture'], islamicLink: 'الحساب والمراجعة: «حاسبوا أنفسكم قبل أن تحاسَبوا»' },
                        { name: 'تطوير القادة', nameEn: 'Leadership', tools: ['Leadership 360', 'Coaching Framework', 'Succession Plan', 'Mentorship Map'], islamicLink: 'النبوة في القيادة: الصدق والأمانة والتبليغ والفطنة' }
                    ],
                    diagnosticQuestions: [
                        'هل لديك وصف وظيفي واضح لكل موظف؟',
                        'هل ثقافة شركتك مكتوبة ومعاشة؟',
                        'هل تعقد اجتماعات 1-on-1 منتظمة مع كل فرد في الفريق؟',
                        'هل لديك خطة لتطوير قادة من الداخل؟'
                    ]
                },
                {
                    id: 5,
                    number: '05',
                    name: 'التكامل',
                    nameEn: 'Synergy',
                    icon: '🔗',
                    color: '#3b82f6',
                    desc: 'التكامل المالي — KPIs — لوحة القيادة',
                    islamicRef: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — الإتقان المالي',
                    areas: [
                        { name: 'اللوحة المالية', nameEn: 'Financial Dashboard', tools: ['P&L Builder', 'Cash Flow Forecast', 'Balance Sheet', 'Financial KPIs'], islamicLink: 'الصدق في الحساب: «ويل للمطففين»' },
                        { name: 'نقطة التعادل', nameEn: 'Break-Even', tools: ['Break-Even Calculator', 'Pricing Optimizer', 'Margin Analyzer', 'Revenue Targets'], islamicLink: 'العدل في التسعير والربح الحلال' },
                        { name: 'مؤشرات الأداء', nameEn: 'KPIs & Metrics', tools: ['KPI Library', 'Scorecard Builder', 'Weekly Review', 'Trend Analyzer'], islamicLink: 'المراجعة: «قل اعملوا فسيرى الله عملكم»' },
                        { name: 'شراكات النمو', nameEn: 'Growth Partnerships', tools: ['Partnership Evaluator', 'Joint Venture Template', 'Halal Contract Builder', 'Alliance Map'], islamicLink: 'المضاربة والمشاركة — شراكة الخير' }
                    ],
                    diagnosticQuestions: [
                        'هل تراجع أرقامك المالية أسبوعياً؟',
                        'هل تعرف هامش ربحك لكل منتج/خدمة؟',
                        'هل لديك لوحة KPIs يومية/أسبوعية؟',
                        'هل لديك شراكات استراتيجية تضاعف نموك؟'
                    ]
                },
                {
                    id: 6,
                    number: '06',
                    name: 'النتائج',
                    nameEn: 'Results',
                    icon: '🏆',
                    color: '#a855f7',
                    desc: 'استراتيجية الخروج — الاستثمار — الإرث',
                    islamicRef: '﴿وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَى﴾ — العمل وأثره',
                    areas: [
                        { name: 'استراتيجية الخروج', nameEn: 'Exit Strategy', tools: ['Business Valuation', 'Exit Options Map', 'Succession Plan', 'Legacy Builder'], islamicLink: 'إرث العمل الصالح: «إذا مات الإنسان انقطع عنه عمله إلا من ثلاثة»' },
                        { name: 'التوسع والنمو', nameEn: 'Scale & Growth', tools: ['Scale Readiness Check', 'Franchise Model', 'International Expansion', 'Digital Scale Plan'], islamicLink: 'النفع الأوسع: «خير الناس أنفعهم للناس»' },
                        { name: 'الاستثمار الحلال', nameEn: 'Halal Investment', tools: ['Investment Calculator', 'Halal Portfolio', 'Zakat Optimizer', 'Endowment Model'], islamicLink: 'المال الحلال والزكاة والوقف — الاستدامة الإسلامية' },
                        { name: 'الإرث والأثر', nameEn: 'Legacy & Impact', tools: ['Impact Scorecard', 'Community Value Map', 'Sadaqah Jariya Plan', 'Legacy Statement'], islamicLink: '«الصدقة الجارية»: أثر يبقى بعدك' }
                    ],
                    diagnosticQuestions: [
                        'هل لديك استراتيجية خروج واضحة من عمليات العمل اليومية؟',
                        'هل عملك يمكن بيعه أو توريثه أو التوسع به؟',
                        'هل دفعت زكاة مالك التجاري هذا العام؟',
                        'ما الأثر الذي ستتركه لمجتمعك وأمتك؟'
                    ]
                }
            ]
        };
    }

    // ═══ الأدوات الرقمية لكل نموذج ═══
    _buildDigitalTools() {
        return {
            businessHealthCheck: {
                name: '🩺 تشخيص صحة العمل الشامل',
                nameEn: 'Business Health Check — 360°',
                desc: 'تقييم شامل لكل جوانب عملك في 6 أبعاد — بناءً على ActionCOACH + منهج إسلامي',
                dimensions: [
                    { id: 'mastery', name: 'الإتقان', desc: 'المال، الوقت، التسليم، الرؤية', weight: 0.20 },
                    { id: 'niche', name: 'السوق', desc: 'العميل، USP، التسويق', weight: 0.20 },
                    { id: 'leverage', name: 'الرافعة', desc: 'الأنظمة، التقنية، الأتمتة', weight: 0.15 },
                    { id: 'team', name: 'الفريق', desc: 'التوظيف، الثقافة، الأداء', weight: 0.15 },
                    { id: 'synergy', name: 'التكامل', desc: 'KPIs، المالية، الشراكات', weight: 0.15 },
                    { id: 'results', name: 'النتائج', desc: 'النمو، الاستدامة، الأثر', weight: 0.15 }
                ],
                scoringGuide: {
                    '91-100': { label: 'ممتاز', color: '#22c55e', action: 'أنت في قمة الأداء — ركّز على التوسع والإرث' },
                    '71-90': { label: 'جيد جداً', color: '#3b82f6', action: 'أداء قوي — حدّد 2-3 مناطق للتحسين الفوري' },
                    '51-70': { label: 'متوسط', color: '#eab308', action: 'هناك فرص كبيرة — ابدأ بالأساسيات أولاً' },
                    '31-50': { label: 'يحتاج عمل', color: '#f97316', action: 'ركّز على الإتقان أولاً — الأساسيات قبل كل شيء' },
                    '0-30': { label: 'حرج', color: '#ef4444', action: 'أولوية قصوى — اعمل مع مرشد متخصص فوراً' }
                }
            },
            timeAudit: {
                name: '⏱️ تدقيق الوقت الإسلامي',
                desc: 'اكتشف كيف تقضي وقتك — وأعد توزيعه بحسب الأولويات الإلهية',
                categories: [
                    { name: 'العبادة', pct: 20, priority: 1, islamicRef: 'الصلاة والقرآن وذكر الله' },
                    { name: 'الأسرة', pct: 20, priority: 2, islamicRef: 'حق الزوج/الزوجة والأبناء' },
                    { name: 'النمو والتعلم', pct: 15, priority: 3, islamicRef: 'طلب العلم فريضة' },
                    { name: 'العمل الاستراتيجي', pct: 30, priority: 4, islamicRef: 'العمل الذي يبني المستقبل' },
                    { name: 'العمل التشغيلي', pct: 10, priority: 5, islamicRef: 'ما يمكن تفويضه أو أتمتته' },
                    { name: 'الراحة والصحة', pct: 5, priority: 6, islamicRef: 'لنفسك عليك حق' }
                ]
            },
            breakEvenCalculator: {
                name: '📊 حاسبة التعادل والربحية',
                desc: 'احسب نقطة التعادل، هامش الربح، وأهداف الإيراد للنمو الحلال',
                fields: [
                    { id: 'fixedCosts', label: 'التكاليف الثابتة الشهرية (ريال)', type: 'number', example: 15000 },
                    { id: 'variableCostPct', label: 'نسبة التكلفة المتغيرة %', type: 'number', example: 35 },
                    { id: 'avgPrice', label: 'متوسط سعر البيع (ريال)', type: 'number', example: 500 },
                    { id: 'targetProfit', label: 'الربح المستهدف شهرياً (ريال)', type: 'number', example: 20000 }
                ]
            }
        };
    }

    // ═══ نماذج الكوتشينج ═══
    _buildCoachingModels() {
        return [
            {
                id: 'grow',
                name: 'نموذج GROW الإسلامي',
                nameEn: 'GROW Model',
                icon: '🌱',
                steps: [
                    { letter: 'G', nameAr: 'الهدف', nameEn: 'Goal', desc: 'ما الذي تريد تحقيقه؟', islamicQ: 'هل هدفك يرضي الله ويخدم الناس؟', tools: ['SMART Goal Builder', 'Vision Board', 'Goal Contract'] },
                    { letter: 'R', nameAr: 'الواقع', nameEn: 'Reality', desc: 'أين أنت الآن؟', islamicQ: 'محاسبة النفس: «حاسبوا أنفسكم»', tools: ['360 Assessment', 'Gap Analysis', 'SWOT Islamic'] },
                    { letter: 'O', nameAr: 'الخيارات', nameEn: 'Options', desc: 'ما الخيارات المتاحة؟', islamicQ: 'الشورى: «وشاورهم في الأمر»', tools: ['Options Matrix', 'Decision Tree', 'Brainstorm Canvas'] },
                    { letter: 'W', nameAr: 'الإرادة/التنفيذ', nameEn: 'Will/Way Forward', desc: 'ما الذي ستفعله؟', islamicQ: '«ثم عزمت فتوكل على الله»', tools: ['Action Plan', '90-Day Roadmap', 'Accountability Partner'] }
                ]
            },
            {
                id: 'smart-islamic',
                name: 'أهداف SMART الإسلامية',
                nameEn: 'SMART Goals + Islamic Twist',
                icon: '🎯',
                steps: [
                    { letter: 'S', nameAr: 'محدد', nameEn: 'Specific', islamicAdd: 'محدد بنية لله', example: 'زيادة المبيعات لخدمة أكثر عملاء وتحقيق رزق حلال' },
                    { letter: 'M', nameAr: 'قابل للقياس', nameEn: 'Measurable', islamicAdd: 'العدل في الحساب', example: 'زيادة المبيعات 20% في 90 يوماً' },
                    { letter: 'A', nameAr: 'تصاعدي ممكن', nameEn: 'Achievable', islamicAdd: 'لا يكلف الله نفساً', example: 'مبني على بياناتك الفعلية وقدراتك' },
                    { letter: 'R', nameAr: 'ذو صلة', nameEn: 'Relevant', islamicAdd: 'الأولويات الربانية', example: 'يخدم رؤيتك ورسالتك وقيمك الإسلامية' },
                    { letter: 'T', nameAr: 'محدد بوقت', nameEn: 'Time-bound', islamicAdd: 'قيمة الوقت في الإسلام', example: 'بنهاية شهر رمضان / الربع الأول' }
                ]
            },
            {
                id: 'okr',
                name: 'OKR الإسلامي',
                nameEn: 'Objectives & Key Results',
                icon: '📊',
                desc: 'نظام OKR المعدّل — الغايات والنتائج المفتاحية بالمنهج الإسلامي',
                islamicBase: 'الهدف الكبير لله ثم للأمة ثم للمجتمع ثم للعمل',
                levels: ['الحضارة والأمة', 'المجتمع والقطاع', 'الشركة', 'الفريق', 'الفرد']
            },
            {
                id: 'icf',
                name: 'إطار ICF الإسلامي',
                nameEn: 'Islamic Coaching Framework',
                icon: '✨',
                coreComp: [
                    'الاستماع العميق بنية خدمة الله',
                    'الأسئلة القوية المفتوحة',
                    'الوعي الذاتي من منظور شرعي',
                    'تصميم الخطوات بتوازن دنيا وآخرة'
                ]
            }
        ];
    }

    // ═══ OKR Templates ═══
    _buildOKRTemplates() {
        return [
            {
                level: 'الشركة',
                period: 'ربع سنوي',
                template: {
                    objective: 'مضاعفة الأثر الإيجابي والإيراد الحلال',
                    keyResults: [
                        { kr: 'زيادة الإيراد الشهري', target: '+30%', measure: 'الإيراد الفعلي' },
                        { kr: 'رضا العملاء', target: 'NPS ≥ 70', measure: 'استبيان شهري' },
                        { kr: 'تطوير المنتج', target: 'إطلاق ميزة جديدة', measure: 'إطلاق فعلي' }
                    ],
                    islamicOKR: {
                        objective: 'نفع الناس وخدمتهم بما يرضي الله',
                        keyResults: [
                            { kr: 'عدد العملاء المستفيدين', target: '+100 عميل', measure: 'قاعدة بيانات' },
                            { kr: 'تبرع من الأرباح', target: '2.5% زكاة + 2% صدقة', measure: 'تقرير مالي' },
                            { kr: 'رضا العملاء', target: '90% رضا أو أكثر', measure: 'استبيان' }
                        ]
                    }
                }
            },
            {
                level: 'فريق التسويق',
                period: 'شهري',
                template: {
                    objective: 'بناء ثقة العلامة التجارية والجذب الحلال',
                    keyResults: [
                        { kr: 'محتوى منشور', target: '20 مقطع', measure: 'تقرير المحتوى' },
                        { kr: 'عملاء محتملون', target: '50 lead', measure: 'CRM' },
                        { kr: 'ثقة المجتمع', target: '1000 متابع حقيقي', measure: 'analytics' }
                    ]
                }
            },
            {
                level: 'قسم المبيعات',
                period: 'أسبوعي',
                template: {
                    objective: 'خدمة العملاء والإغلاق بأمانة وصدق',
                    keyResults: [
                        { kr: 'مكالمات متابعة', target: '30 مكالمة', measure: 'CRM log' },
                        { kr: 'عروض مرسلة', target: '10 عرض', measure: 'شفافية العرض' },
                        { kr: 'تعاقدات جديدة', target: '3 عقود', measure: 'نسخة موقعة' }
                    ]
                }
            }
        ];
    }

    // ═══ مكتبة KPIs ═══
    _buildKPILibrary() {
        return {
            financial: [
                { name: 'الإيراد الشهري', formula: 'مجموع المبيعات / الشهر', unit: 'ريال', frequency: 'يومي', islamicNote: 'تتبع الحلال وتجنب الشبهات' },
                { name: 'هامش الربح الإجمالي', formula: '(الإيراد - تكلفة البضاعة) / الإيراد × 100', unit: '%', frequency: 'شهري', islamicNote: 'الربح العادل' },
                { name: 'نقطة التعادل', formula: 'التكاليف الثابتة / هامش المساهمة', unit: 'وحدة / ريال', frequency: 'ربعي', islamicNote: 'الإدارة الحكيمة للموارد' },
                { name: 'التدفق النقدي الحر', formula: 'التدفق التشغيلي - الاستثمارات', unit: 'ريال', frequency: 'شهري', islamicNote: 'السيولة = الحرية والاستقلال' },
                { name: 'نسبة الزكاة', formula: 'صافي الأصول التجارية × 2.5%', unit: '%', frequency: 'سنوي', islamicNote: 'فريضة شرعية — ركن من أركان الإسلام' }
            ],
            sales: [
                { name: 'معدل التحويل', formula: 'Closed / Leads × 100', unit: '%', frequency: 'أسبوعي' },
                { name: 'متوسط قيمة الصفقة', formula: 'الإيراد الكلي / عدد الصفقات', unit: 'ريال', frequency: 'شهري' },
                { name: 'دورة المبيعات', formula: 'إجمالي أيام الإغلاق / عدد الصفقات', unit: 'يوم', frequency: 'شهري' },
                { name: 'قيمة العميل مدى الحياة (LTV)', formula: 'متوسط الشراء × التكرار × سنوات الاحتفاظ', unit: 'ريال', frequency: 'ربعي' }
            ],
            marketing: [
                { name: 'تكلفة اكتساب العميل (CAC)', formula: 'إنفاق التسويق / عملاء جدد', unit: 'ريال', frequency: 'شهري' },
                { name: 'عائد الإنفاق التسويقي (ROAS)', formula: 'الإيراد / الإنفاق التسويقي', unit: 'مضاعف', frequency: 'أسبوعي' },
                { name: 'مؤشر رضا العملاء (NPS)', formula: 'المرتفعون% - المنتقدون%', unit: 'نقطة', frequency: 'ربعي' }
            ],
            operations: [
                { name: 'معدل التسليم في الموعد', formula: 'المُسلَّم بالوقت / الكلي × 100', unit: '%', frequency: 'أسبوعي', islamicNote: 'الوفاء بالعهود أمانة' },
                { name: 'جودة المنتج/الخدمة', formula: 'الوحدات بلا شكاوى / الكلي × 100', unit: '%', frequency: 'يومي', islamicNote: 'الإتقان من الإيمان' },
                { name: 'إنتاجية الفريق', formula: 'الناتج / ساعات العمل', unit: 'وحدة/ساعة', frequency: 'أسبوعي' }
            ]
        };
    }

    // ═══ أدوات المبيعات ═══
    _buildSalesTools() {
        return {
            title: '💰 منظومة المبيعات الإسلامية الرقمية',
            islamicPrinciple: '«البيّعان بالخيار ما لم يتفرقا — فإن صدقا وبيّنا بُورك لهما»',
            tools: [
                { name: 'قمع المبيعات الإسلامي', desc: 'Awareness → Interest → Trust → Decision → Close — مع الصدق في كل مرحلة', stages: ['الوعي (نشر النفع)', 'الاهتمام (إثبات القيمة)', 'الثقة (الشفافية والأمانة)', 'القرار (الاختيار الحر)', 'الإغلاق (الرضا المتبادل)'] },
                { name: 'Value Ladder Method', desc: 'سلّم القيمة من المجاني إلى Premium — كل خطوة تزيد النفع', levels: ['محتوى مجاني (بناء الثقة)', 'منتج مدخل منخفض', 'المنتج الأساسي', 'Premium/VIP', 'Corporate/B2B'] },
                { name: 'الاتصال البارد الإسلامي', desc: 'Cold Call بالصدق — لا تدليس ولا ضغط', scripts: ['الموافقة الأولي: "هل أنت المسؤول عن..."', 'الفائدة الفورية: "نساعد شركات مثلكم على..."', 'السؤال المفتوح: "ما أكبر تحدٍّ تواجهونه في..."', 'الحل بأمانة: صف الحل بصدق كامل'] },
                { name: 'تقنية التعامل مع الاعتراضات', desc: 'معالجة الاعتراضات بالصدق والشفافية', method: ['الاستماع الكامل (لا مقاطعة)', 'التعاطف والتفهم', 'السؤال لفهم الجذر', 'الإجابة الصادقة', 'تأكيد الاتفاق أو القبول بالرفض بإحسان'] }
            ]
        };
    }

    // ═══ الأدوات المالية ═══
    _buildFinancialTools() {
        return {
            title: '💎 المنظومة المالية الإسلامية الرقمية',
            islamicPrinciple: '«ويل للمطففين» — الدقة المالية فريضة',
            tools: [
                { name: 'قائمة الأرباح والخسائر الحلال', desc: 'P&L مع مراعاة الزكاة والصدقات ضمن التخطيط المالي', categories: ['الإيرادات الحلال', 'تكاليف البضاعة', 'المصاريف التشغيلية', 'الإهلاك', 'الزكاة المحتسبة', 'صافي الربح بعد الزكاة'] },
                { name: 'التدفق النقدي 13 أسبوعاً', desc: 'تخطيط نقدي لـ 13 أسبوع مقدماً — الإدارة الحكيمة للموارد', weeks: 13 },
                { name: 'حاسبة زكاة المال التجاري', desc: 'احسب زكاة أموالك التجارية بدقة فقهية', categories: ['نقد وبنوك', 'بضاعة بالتكلفة', 'مدينون مرجو تحصيلهم', 'دائنون (يخصم)', 'قروض قصيرة المدى (يخصم)'] },
                { name: 'مخطط الميزانية الإسلامي', desc: 'توزيع الإيراد: عمليات / نمو / زكاة / صدقة / احتياطي طارئ', allocation: { operations: 60, growth: 20, zakat_sadaqah: 5, emergency: 10, investment: 5 } }
            ]
        };
    }

    // ═══ أدوات التسويق ═══
    _buildMarketingTools() {
        return {
            title: '📢 منظومة التسويق الإسلامي الرقمي',
            islamicPrinciple: '«البيّن يكون» — الوضوح والصدق في التسويق قبل الإغلاق',
            tools: [
                { name: 'صرح العميل المثالي (Persona)', desc: 'بناء صورة تفصيلية للعميل المثالي من 8 أبعاد', dimensions: ['الديموغرافيا', 'السيكوغرافيا', 'الأهداف', 'الآلام', 'القنوات المفضلة', 'اعتراضات الشراء', 'قيمته مدى الحياة', 'القيم الدينية'] },
                { name: 'مصفوفة المحتوى الإسلامي', desc: 'محتوى يبني الثقة ويخدم قبل أن يبيع', types: ['تعليمي (علّم واشرح)', 'تحفيزي (ألهم من القرآن والسنة)', 'ترفيهي حلال (ابتسامة وفائدة)', 'إثباتي (قصص نجاح حقيقية)', 'بيعي بأمانة (عرض صادق واضح)'] },
                { name: 'محرك الإحالات والتوصيات', desc: 'أقوى تسويق: عميل راضٍ يُحيل — بناءً على سنة التبشير الحسن', mechanism: ['قدّم قيمة أكثر مما وعدت', 'اسأل العميل الراضي التوصية', 'قدّم حافزاً حلالاً للإحالة', 'وثّق قصص النجاح بإذن العميل'] }
            ]
        };
    }

    // ═══ أدوات القيادة ═══
    _buildLeadershipTools() {
        return {
            title: '👑 قيادة الأعمال بالمنهج النبوي',
            islamicPrinciple: '«كلكم راعٍ وكلكم مسؤول عن رعيته»',
            propheticModel: {
                qualities: ['الصدق — Truth in all dealings', 'الأمانة — Trustworthiness', 'التبليغ — Clear Communication', 'الفطنة/الذكاء — Intelligence & Wisdom'],
                leadership_styles: ['القيادة بالقدوة — Lead by Example', 'القيادة الخادمة — Servant Leadership', 'القيادة الشورية — Consultative Leadership', 'القيادة البنائية — Transformational Leadership']
            },
            tools: [
                { name: 'نموذج القيادة الشورية', desc: 'اتخاذ القرار بالشورى في 4 خطوات: تحديد القضية — جمع الآراء — التداول — القرار والتوكل', framework: 'CDDA: Clarify, Deliberate, Decide, Act with Tawakkul' },
                { name: '360° نبوي', desc: 'تقييم القيادة من 4 اتجاهات: من فوقك، من تحتك، زملاؤك، عملاؤك', islamic: 'ميزان العدل في التقييم' },
                { name: 'أسلوب الكوتشينج 1-on-1', desc: 'جلسة الكوتشينج الفردية الأسبوعية — ربع ساعة تغيّر حياة شخص', template: ['الافتتاح بسم الله والدعاء', 'مراجعة أهداف الأسبوع السابق', 'إنجازات وتحديات', 'هدف الأسبوع القادم', 'ختام بالدعاء لبعض'] }
            ]
        };
    }

    // ═══ أدوات الإنتاجية ═══
    _buildProductivityTools() {
        return {
            title: '⚡ الإنتاجية الإسلامية الرقمية',
            islamicPrinciple: '«نعمتان مغبون فيهما: الصحة والفراغ»',
            tools: [
                { name: 'مصفوفة إيزنهاور الإسلامية', desc: 'ترتيب الأولويات: عاجل+مهم / مهم+غير عاجل / عاجل+غير مهم / لا عاجل ولا مهم', islamicAdd: 'الفريضة دائماً أولاً — ثم الواجب ثم السنة ثم المستحب', quadrants: ['🔴 افعل الآن (عاجل + مهم)', '🟡 خطط له (مهم + ليس عاجل)', '🟠 فوّض (عاجل + ليس مهم)', '⚪️ احذف (ليس عاجلاً ولا مهماً)'] },
                { name: 'Deep Work بالمنهج الإسلامي', desc: 'أوقات التركيز العميق بعد الصلوات', blocks: ['بعد الفجر: أفضل وقت للتفكير الاستراتيجي', 'قبل الظهر: المهام المعقدة', 'بعد العصر: الإنجاز والتنفيذ', 'بعد المغرب: مراجعة وتخطيط اليوم التالي'] },
                { name: 'نظام البركة في الإنتاجية', desc: 'ابحث عن البركة من الله أولاً — فإن البركة تضاعف الإنجاز', habits: ['صلاة الفجر أول الإنتاجية', 'آية قرآنية لكل مهمة مرتبطة بها', 'دعاء قبل العمل الصعب', 'شكر الله عند الإنجاز', 'حساب النفس آخر اليوم'] }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════
    // الأدوات الذكية
    // ═══════════════════════════════════════════════════════════

    /**
     * تشخيص صحة الأعمال الشامل
     */
    diagnoseBusinessHealth(answers) {
        this.kpis.businessesDiagnosed++;
        // answers: { mastery: 0-100, niche: 0-100, leverage: 0-100, team: 0-100, synergy: 0-100, results: 0-100, businessName, sector }
        const weights = { mastery: 0.20, niche: 0.20, leverage: 0.15, team: 0.15, synergy: 0.15, results: 0.15 };
        let overall = 0;
        const scores = {};
        const weaknesses = [];
        const strengths = [];

        for (const [dim, weight] of Object.entries(weights)) {
            const score = Math.min(100, Math.max(0, parseInt(answers[dim] || 50)));
            scores[dim] = score;
            overall += score * weight;
            if (score < 50) weaknesses.push(dim);
            if (score >= 80) strengths.push(dim);
        }

        overall = Math.round(overall);
        const step = this.actionCoach6Steps.steps;
        const priorityActions = weaknesses.slice(0, 3).map(dim => {
            const stepData = step.find(s => s.nameEn.toLowerCase() === dim || s.id === Object.keys(weights).indexOf(dim) + 1);
            return {
                dimension: dim,
                score: scores[dim],
                action: `ركّز على ${dim} — ابدأ بالأدوات الرقمية فوراً`,
                tools: stepData ? stepData.areas[0].tools.slice(0, 2) : []
            };
        });

        const isGrowth = answers.sector === 'معادن' || answers.sector === 'تجارة إلكترونية';
        return {
            businessName: answers.businessName || 'شركتك',
            sector: answers.sector || 'غير محدد',
            scores,
            overall,
            grade: overall >= 91 ? 'ممتاز' : overall >= 71 ? 'جيد جداً' : overall >= 51 ? 'متوسط' : overall >= 31 ? 'يحتاج عمل' : 'حرج',
            strengths,
            weaknesses,
            priorityActions,
            nextCoachingSession: `ركّز جلستك القادمة على: ${weaknesses[0] || 'صياغة خطة النمو'}`,
            islamicGuidance: overall >= 70
                ? '«إن مع العسر يسراً» — أنت في مسار النجاح، داوم واشكر'
                : '«فإن مع العسر يسراً» — الفرص أمامك كثيرة، الإتقان يبدأ من الآن',
            estimatedImprovementIf90Days: `إذا ركّزت 90 يوماً على نقاط الضعف، توقّع وصول نقاطك إلى ${Math.min(100, overall + 20)}%`
        };
    }

    /**
     * توليد خطة أكشن من OKR
     */
    generateActionPlan(opts) {
        this.kpis.actionsGenerated++;
        const { objective, keyResults = [], sector, horizon = '90 يوم', teamSize = 1 } = opts;
        const weeks = horizon.includes('30') ? 4 : horizon.includes('90') ? 12 : 8;
        const phases = [
            { phase: 1, name: 'التأسيس والتشخيص', weeks: `1-${Math.round(weeks * 0.25)}`, focus: 'تشخيص الوضع الراهن + تحديد الموارد' },
            { phase: 2, name: 'البناء والتجريب', weeks: `${Math.round(weeks * 0.25) + 1}-${Math.round(weeks * 0.6)}`, focus: 'بناء الأنظمة + تطبيق pilot' },
            { phase: 3, name: 'التنفيذ والتوسع', weeks: `${Math.round(weeks * 0.6) + 1}-${weeks}`, focus: 'تنفيذ كامل + قياس النتائج' }
        ];
        return {
            objective,
            keyResults: keyResults.map((kr, i) => ({
                kr,
                owner: `عضو الفريق ${i + 1}`,
                deadline: `نهاية الأسبوع ${Math.round(weeks * (0.4 + i * 0.2))}`,
                metric: 'قابل للقياس الأسبوعي'
            })),
            phases,
            weeklyRhythm: ['الأحد: مراجعة OKR الأسبوعية (30 دقيقة)', 'الاثنين: 1-on-1 مع كل عضو فريق', 'الأربعاء: حل العوائق والقرارات السريعة', 'الجمعة: مراجعة الإنجاز + تخطيط الأسبوع القادم وشكر الله'],
            islamicRhythm: 'ابن إيقاعك على الصلوات الخمس — كل صلاة مراجعة صغيرة للتقدم',
            dailyActions: [`أولوية #1: ${keyResults[0] || 'هدفك الرئيسي'}`, 'حد أقصى 3 مهام A-level يومياً', 'التخلص من كل ما يمكن تفويضه أو أتمتته'],
            tools: ['Trello / ClickUp / Notion', 'تقويم Google بلون لكل أولوية', 'يومية عمل يدوية إذا تفضلت'],
            islamicGuidance: `«وقل اعملوا» — ابدأ اليوم لا غداً. ${objective} — هدف جليل يستحق التضحية`,
            disclaimer: 'الخطة أداة تنظيمية — النجاح بتوفيق الله أولاً ثم الجهد الصادق'
        };
    }

    /**
     * حساسبة التعادل والربحية
     */
    calculateFinancials(data) {
        this.kpis.financialPlansBuilt++;
        const { fixedCosts = 0, variableCostPct = 0, avgPrice = 0, targetProfit = 0 } = data;
        const contribution = avgPrice * (1 - variableCostPct / 100);
        const breakEvenUnits = contribution > 0 ? Math.ceil(fixedCosts / contribution) : 0;
        const breakEvenRevenue = breakEvenUnits * avgPrice;
        const targetUnits = contribution > 0 ? Math.ceil((fixedCosts + targetProfit) / contribution) : 0;
        const targetRevenue = targetUnits * avgPrice;
        const zakatBase = (targetRevenue - fixedCosts - avgPrice * targetUnits * variableCostPct / 100) * 0.025;

        return {
            breakEven: { units: breakEvenUnits, revenue: breakEvenRevenue },
            toHitTarget: { units: targetUnits, revenue: targetRevenue, profit: targetProfit },
            margins: { grossMarginPct: Math.round((1 - variableCostPct / 100) * 100), contributionPerUnit: Math.round(contribution) },
            zakat: { estimated: Math.round(zakatBase), rate: '2.5%', note: 'تقديري — راجع أهل الاختصاص الشرعي' },
            advice: breakEvenUnits === 0
                ? 'بيانات غير كافية — راجع الأرقام'
                : targetUnits > breakEvenUnits * 3
                ? 'الهدف طموح — راجع هيكل التكاليف أو رفع متوسط سعر البيع'
                : 'الهدف واقعي ومحقق — ابدأ التنفيذ',
            islamicNote: 'الربح الحلال بركة والزكاة تطهير وتنمية — «وما أنفقتم من شيء فهو يخلفه»'
        };
    }

    /**
     * جلسة كوتشينج AI
     */
    generateCoachingResponse(question, context = {}) {
        this.kpis.sessionsCompleted++;
        const templates = [
            {
                trigger: ['هدف', 'أهداف', 'رؤية', 'رسالة'],
                response: `سؤال قوي. دعنا نطبّق GROW: أولاً Goal — ما الهدف الذي تريده بدقة؟ ثم Reality — أين أنت الآن من هذا الهدف؟ ثم Options — ما 3 خيارات لتحقيقه؟ وأخيراً Will/Way — ما الخطوة الأولى التي ستفعلها اليوم؟ «ثم إذا عزمت فتوكل على الله»`,
                tools: ['GROW Model', 'SMART Goals Builder', 'Vision Statement']
            },
            {
                trigger: ['فريق', 'موظف', 'توظيف', 'ثقافة'],
                response: `بناء الفريق من أهم قرارات رائد الأعمال. «إذا وُسِّد الأمر لغير أهله فانتظر الساعة» — التوظيف الصحيح أمانة. أنصح بـ: 1) وصف وظيفي واضح كالمياه 2) مقابلة تقيس القيم قبل المهارة 3) فترة تجريبية بمعايير واضحة. هل تريد قالب الوصف الوظيفي؟`,
                tools: ['Job Description Builder', 'Culture Fit Test', 'Onboarding Checklist']
            },
            {
                trigger: ['مبيعات', 'عملاء', 'إيراد', 'ربح'],
                response: `المبيعات في الإسلام عبادة عندما تكون بصدق وأمانة. «البيّعان بالخيار ما لم يتفرقا — فإن صدقا وبيّنا بُورك لهما». حدثني: 1) ما معدل تحويلك الحالي Leads → Customers؟ 2) ما الاعتراض الأكثر شيوعاً من عملائك؟ 3) هل لديك نظام CRM لتتبع العملاء؟`,
                tools: ['Sales Funnel Tracker', 'CRM Template', 'Objection Handling Script']
            },
            {
                trigger: ['تسويق', 'محتوى', 'سوشال', 'متابعين'],
                response: `التسويق الإسلامي الرقمي يبني أولاً ثم يبيع. «البيّن يكون» — وضوح العرض واجب. اسألك: 1) من عميلك المثالي بالتحديد؟ 2) ما المشكلة التي تحلها بكلمة واحدة؟ 3) أي قناة تسويق تحقق أفضل عائد الآن؟ المحتوى الجيد: 80% خدمة ونفع + 20% بيع.`,
                tools: ['Customer Avatar', 'Content Matrix', 'Marketing Funnel Builder']
            },
            {
                trigger: ['وقت', 'إنتاجية', 'تنظيم', 'جدول'],
                response: `«نعمتان مغبون فيهما: الصحة والفراغ» — الوقت أثمن أصولك. جرّب: 1) تدقيق الوقت لأسبوع واحد — سجّل كل ساعة 2) قسّم مهامك: A (لا يصح أن يعمله غيرك) / B (تفويض مع متابعة) / C (أتمتة أو إلغاء) 3) بنِ أوقات Deep Work بعد الصلوات، خاصة بعد الفجر.`,
                tools: ['Time Audit Tool', 'Eisenhower Matrix', 'Deep Work Scheduler']
            }
        ];

        const lq = question.toLowerCase();
        const match = templates.find(t => t.trigger.some(kw => lq.includes(kw)));
        if (match) {
            return {
                response: match.response,
                suggestedTools: match.tools,
                followUp: 'ما الذي يمنعك من تطبيق هذا الآن؟',
                islamicClosing: 'وفّقك الله وبارك في عملك',
                type: 'targeted'
            };
        }

        return {
            response: `سؤال رائد. في الكوتشينج الإسلامي الرقمي نسأل دائماً: ما الهدف من هذا السؤال؟ ما الوضع الحالي؟ ما الموارد المتاحة؟ وما الخطوة الصغيرة الأولى؟ «وما توفيقي إلا بالله». حدثني بمزيد من التفاصيل لأتمكن من مساعدتك بشكل أدق.`,
            suggestedTools: ['Business Health Check', 'Goal Setting Canvas', 'Action Plan Builder'],
            followUp: 'ما أكبر تحدٍّ يواجهك في عملك الآن؟',
            islamicClosing: 'اللهم اهدنا وسدّدنا',
            type: 'general'
        };
    }

    /**
     * إنشاء OKR كامل
     */
    generateOKR(opts) {
        this.kpis.okrsCrated++;
        const { businessType, sector, currentRevenue, targetRevenue, period = 'ربع سنوي' } = opts;
        const growth = targetRevenue && currentRevenue ? Math.round((targetRevenue / currentRevenue - 1) * 100) : 30;

        return {
            period,
            objective: `تحقيق ${growth}% نمو في الإيراد مع الحفاظ على الالتزام الشرعي والأثر الإيجابي`,
            keyResults: [
                { number: 1, kr: `رفع الإيراد الشهري من ${currentRevenue || '—'} إلى ${targetRevenue || '+' + growth + '%'}`, metric: 'الإيراد المالي', frequency: 'شهري' },
                { number: 2, kr: `تحقيق معدل رضا عملاء NPS ≥ 70`, metric: 'استبيان ربعي', frequency: 'ربعي' },
                { number: 3, kr: `بناء نظام مبيعات يعمل 80% بدون المؤسس`, metric: 'ساعات المؤسس في المبيعات', frequency: 'أسبوعي' },
                { number: 4, kr: `أداء الزكاة وتخصيص 2% للصدقة من الأرباح`, metric: 'سجل مالي', frequency: 'سنوي' }
            ],
            islamicOKR: {
                objective: `نفع الناس وتنمية الأمة بالبيع الحلال الطيب`,
                keyResults: [
                    { kr: `خدمة +${Math.round(growth * 2)} عميل جديد بصدق وإتقان`, metric: 'قاعدة العملاء' },
                    { kr: `تطوير الفريق بتدريب شهري`, metric: 'ساعات تدريب' },
                    { kr: `نشر محتوى نافع أسبوعياً`, metric: 'المنشورات' }
                ]
            },
            weeklyCheckIn: ['أين أنا من OKR هذا الأسبوع؟ (1-10)', 'ما أكبر عائق؟', 'ما الذي سأفعله الأسبوع القادم بإذن الله؟'],
            islamicGuidance: '«اللهم بارك لنا في أعمالنا» — استهدف البركة قبل الأرقام'
        };
    }

    getFullData() {
        return {
            status: this.getStatus(),
            islamicFoundation: this.islamicFoundation,
            actionCoach6Steps: this.actionCoach6Steps,
            digitalTools: this.digitalTools,
            coachingModels: this.coachingModels,
            okrTemplates: this.okrTemplates,
            kpiLibrary: this.kpiLibrary,
            salesTools: this.salesTools,
            financialTools: this.financialTools,
            marketingTools: this.marketingTools,
            leadershipTools: this.leadershipTools,
            productivityTools: this.productivityTools
        };
    }
}

// Singleton
const engine = new SheikhaBusinessCoachEngine();
module.exports = engine;
