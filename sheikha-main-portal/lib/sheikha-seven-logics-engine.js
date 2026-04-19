/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA COMPREHENSIVE LOGICS ENGINE — محرك المنطق الشامل (20 منطق)        ║
 * ║                                                                              ║
 * ║  المجموعة الأولى (7): التنظيمي · التشريعي · التجاري                        ║
 * ║                        العلمي · البحثي · التقني · التكنولوجي                ║
 * ║                                                                              ║
 * ║  المجموعة الثانية (13): المنهجي · تنهيج المناهج · الجودة                   ║
 * ║                          الإداري · الهيكلي · التخطيطي · الشبكي             ║
 * ║                          التنفيذي · التطويري · التحسيني                     ║
 * ║                          التكيفي · البيئي                                   ║
 * ║                                                                              ║
 * ║  مفعّل في: شيخة | منظمة شيخة | سوق شيخة                                   ║
 * ║  «وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ» — يوسف ٧٦                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

// ─── ثوابت النظام ─────────────────────────────────────────────────────────────
const ENGINE_VERSION   = '1.0.0';
const ENGINE_NAME      = 'Sheikha Seven Logics Engine';
const ENGINE_NAME_AR   = 'محرك المنطق السباعي لشيخة';
const GOVERNOR         = 'Sheikha';
const ACTIVE_IN        = ['sheikha', 'sheikha-org', 'sheikha-market'];

// ═══════════════════════════════════════════════════════════════════════════════
// 1. المنطق التنظيمي — Organizational Logic
// ═══════════════════════════════════════════════════════════════════════════════
const ORGANIZATIONAL_LOGIC = {
    id:          'organizational',
    nameAr:      'المنطق التنظيمي',
    nameEn:      'Organizational Logic',
    description: 'يحكم هيكل شيخة التنظيمي، الأدوار، الصلاحيات، الحوكمة، والتسلسل الهرمي',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'org-1', ar: 'الشورى والمشاركة',           en: 'Consultation & Participation',   weight: 10 },
        { id: 'org-2', ar: 'وضوح الأدوار والمسؤوليات',  en: 'Clear Roles & Responsibilities', weight: 10 },
        { id: 'org-3', ar: 'الشفافية في القرارات',       en: 'Decision Transparency',          weight: 9  },
        { id: 'org-4', ar: 'المساءلة والمحاسبة',         en: 'Accountability',                 weight: 10 },
        { id: 'org-5', ar: 'المرونة الهيكلية',           en: 'Structural Flexibility',         weight: 8  },
        { id: 'org-6', ar: 'التكامل بين الوحدات',        en: 'Inter-unit Integration',         weight: 9  },
        { id: 'org-7', ar: 'استمرارية التحسين',          en: 'Continuous Improvement',         weight: 8  },
    ],
    hierarchy: {
        level1: { name: 'القيادة العليا', role: 'رسم الاستراتيجية والرؤية', authority: 'full' },
        level2: { name: 'المجلس التنفيذي', role: 'تحويل الاستراتيجية إلى خطط', authority: 'strategic' },
        level3: { name: 'الإدارات الوظيفية', role: 'التشغيل والتنفيذ', authority: 'operational' },
        level4: { name: 'الفرق التقنية', role: 'التطوير والبناء', authority: 'technical' },
        level5: { name: 'الخدمات الفرعية', role: 'التنفيذ المتخصص', authority: 'service' },
    },
    governance: {
        decisionModel:  'شورى + بيانات + خبرة',
        reviewCycle:    'ربع سنوي',
        auditFrequency: 'سنوي',
        escalationPath: 'خدمة فرعية → إدارة → مجلس تنفيذي → قيادة',
    },
    orgUnits: [
        { unit: 'sheikha-core',    nameAr: 'نواة شيخة',          type: 'core',   parent: null },
        { unit: 'sheikha-org',     nameAr: 'منظمة شيخة',         type: 'org',    parent: 'sheikha-core' },
        { unit: 'sheikha-market',  nameAr: 'سوق شيخة',           type: 'market', parent: 'sheikha-core' },
        { unit: 'sheikha-copilot', nameAr: 'خادم شيخة كوبايلوت', type: 'service',parent: 'sheikha-core' },
        { unit: 'sheikha-research',nameAr: 'مركز البحث والتطوير', type: 'r&d',    parent: 'sheikha-org'  },
        { unit: 'sheikha-tech',    nameAr: 'وحدة التقنية',        type: 'tech',   parent: 'sheikha-org'  },
        { unit: 'sheikha-legal',   nameAr: 'الشؤون التشريعية',    type: 'legal',  parent: 'sheikha-org'  },
        { unit: 'sheikha-trade',   nameAr: 'وحدة التجارة',        type: 'trade',  parent: 'sheikha-market'},
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. المنطق التشريعي — Legislative Logic
// ═══════════════════════════════════════════════════════════════════════════════
const LEGISLATIVE_LOGIC = {
    id:          'legislative',
    nameAr:      'المنطق التشريعي',
    nameEn:      'Legislative Logic',
    description: 'يحكم الأنظمة، اللوائح، الامتثال، السياسات، والإطار القانوني لشيخة',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'leg-1', ar: 'الشريعة الإسلامية أساس التشريع',  en: 'Islamic Sharia as legislative basis', weight: 10 },
        { id: 'leg-2', ar: 'الامتثال للأنظمة السعودية',       en: 'Saudi regulatory compliance',        weight: 10 },
        { id: 'leg-3', ar: 'حماية حقوق الأطراف',             en: 'Protection of stakeholder rights',    weight: 9  },
        { id: 'leg-4', ar: 'الوضوح والشفافية التشريعية',      en: 'Legislative clarity & transparency', weight: 9  },
        { id: 'leg-5', ar: 'مبدأ لا ضرر ولا ضرار',           en: 'No Harm Principle',                  weight: 10 },
        { id: 'leg-6', ar: 'قابلية التطبيق والتنفيذ',         en: 'Enforceability',                     weight: 8  },
        { id: 'leg-7', ar: 'مواكبة التشريعات الدولية',         en: 'International legal alignment',      weight: 7  },
    ],
    frameworks: {
        local: [
            { name: 'نظام التجارة الإلكترونية',        authority: 'وزارة التجارة السعودية',    status: 'active' },
            { name: 'نظام حماية البيانات الشخصية',     authority: 'هيئة البيانات والذكاء الاصطناعي', status: 'active' },
            { name: 'نظام مكافحة الجرائم المعلوماتية', authority: 'هيئة الاتصالات',             status: 'active' },
            { name: 'نظام الملكية الفكرية',            authority: 'هيئة الملكية الفكرية',       status: 'active' },
            { name: 'نظام مكافحة غسل الأموال',         authority: 'مؤسسة النقد العربي السعودي', status: 'active' },
        ],
        international: [
            { name: 'GDPR',      scope: 'حماية البيانات الأوروبية', applicability: 'cross-border' },
            { name: 'ISO 27001', scope: 'أمن المعلومات',             applicability: 'global'       },
            { name: 'UNCITRAL',  scope: 'التجارة الإلكترونية الدولية',applicability: 'trade'       },
        ],
        sharia: [
            { rule: 'تحريم الربا',         domain: 'مالي',       enforcement: 'strict' },
            { rule: 'تحريم الغرر',         domain: 'تجاري',      enforcement: 'strict' },
            { rule: 'الوفاء بالعقود',       domain: 'قانوني',     enforcement: 'strict' },
            { rule: 'المسؤولية والأمانة',   domain: 'عام',        enforcement: 'strict' },
        ],
    },
    policyEngine: {
        privacyPolicy:       { version: '2.0', lastUpdated: '2025-01-01', mandatory: true },
        termsOfService:      { version: '2.0', lastUpdated: '2025-01-01', mandatory: true },
        dataRetention:       { period: '5 years', regulation: 'PDPL', mandatory: true   },
        disputeResolution:   { mechanism: 'التحكيم التجاري + القضاء السعودي',            },
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. المنطق التجاري — Commercial Logic
// ═══════════════════════════════════════════════════════════════════════════════
const COMMERCIAL_LOGIC = {
    id:          'commercial',
    nameAr:      'المنطق التجاري',
    nameEn:      'Commercial Logic',
    description: 'يحكم عمليات التجارة، التسعير، العقود، إدارة الأسواق، وعلاقات الشركاء في سوق شيخة',
    scope:       ['sheikha', 'sheikha-market'],
    principles: [
        { id: 'com-1', ar: 'الأمانة والصدق في المعاملات',    en: 'Honesty & Integrity in Trade',    weight: 10 },
        { id: 'com-2', ar: 'العدالة في التسعير',              en: 'Fair Pricing',                    weight: 9  },
        { id: 'com-3', ar: 'الوضوح في الشروط والعقود',       en: 'Clear Terms & Contracts',         weight: 9  },
        { id: 'com-4', ar: 'حماية المستهلك',                  en: 'Consumer Protection',             weight: 10 },
        { id: 'com-5', ar: 'الكفاءة في سلاسل التوريد',       en: 'Supply Chain Efficiency',         weight: 8  },
        { id: 'com-6', ar: 'الابتكار في النماذج التجارية',   en: 'Business Model Innovation',       weight: 8  },
        { id: 'com-7', ar: 'الاستدامة التجارية',              en: 'Commercial Sustainability',       weight: 7  },
    ],
    marketStructure: {
        type:        'سوق رقمي متعدد الأطراف',
        participants: ['موردون', 'مشترون', 'وسطاء', 'مزودو خدمات'],
        model:        'B2B + B2C + C2C',
        currency:     ['SAR', 'USD', 'AED', 'KWD'],
        paymentMethods: ['تحويل بنكي', 'بطاقات ائتمانية', 'محافظ رقمية', 'BNPL'],
    },
    pricingEngine: {
        models: [
            { name: 'التسعير الديناميكي',  algorithm: 'supply-demand-AI',    scope: 'سوق السلع'     },
            { name: 'التسعير الثابت',       algorithm: 'catalog-based',       scope: 'الخدمات الثابتة'},
            { name: 'المزاد الإلكتروني',   algorithm: 'auction-ascending',   scope: 'السلع النادرة'  },
            { name: 'تسعير القيمة',         algorithm: 'value-based',         scope: 'الاستشارات'     },
        ],
        transparency: 'جميع الرسوم والعمولات معلنة ومحددة مسبقاً',
        fairness:     'سقف عمولة 3% للمعاملات الصغيرة، 1.5% للكبيرة',
    },
    contractEngine: {
        types: ['عقد بيع', 'عقد خدمة', 'عقد شراكة', 'عقد توريد', 'اتفاقية مستوى الخدمة'],
        execution:  'ذكي — Smart Contract مدعوم بالتوقيع الرقمي',
        dispute:    'نظام تقييم + وساطة + تحكيم',
        sla:        { responseTime: '24h', resolutionTime: '5 business days' },
    },
    performanceKPIs: [
        { kpi: 'معدل إتمام الصفقات',      target: '≥95%',   measure: 'monthly'   },
        { kpi: 'رضا المشتري',             target: '≥4.5/5', measure: 'per-deal'  },
        { kpi: 'وقت إتمام الدفع',         target: '≤2 days',measure: 'average'   },
        { kpi: 'معدل النزاعات',           target: '≤1%',    measure: 'monthly'   },
        { kpi: 'نمو حجم التداول',         target: '≥15% QoQ',measure: 'quarterly'},
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. المنطق العلمي — Scientific Logic
// ═══════════════════════════════════════════════════════════════════════════════
const SCIENTIFIC_LOGIC = {
    id:          'scientific',
    nameAr:      'المنطق العلمي',
    nameEn:      'Scientific Logic',
    description: 'يحكم منهجية المعرفة، التحقق من البيانات، التحليل العلمي، والقرارات المبنية على الدليل',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'sci-1', ar: 'الموضوعية والحياد',              en: 'Objectivity & Neutrality',    weight: 10 },
        { id: 'sci-2', ar: 'التحقق من البيانات',             en: 'Data Verification',           weight: 10 },
        { id: 'sci-3', ar: 'قابلية التكرار والتحقق',         en: 'Reproducibility',             weight: 9  },
        { id: 'sci-4', ar: 'التفكير النقدي والاستدلالي',     en: 'Critical & Inferential Thinking',weight: 9},
        { id: 'sci-5', ar: 'دمج العلم والحكمة الإسلامية',   en: 'Science-Wisdom Integration',  weight: 10 },
        { id: 'sci-6', ar: 'قياس الأثر والنتائج',            en: 'Impact Measurement',          weight: 8  },
        { id: 'sci-7', ar: 'الشفافية المنهجية',              en: 'Methodological Transparency', weight: 8  },
    ],
    methodology: {
        dataCollection:  ['استطلاعات', 'بيانات المعاملات', 'مستشعرات IoT', 'API مفتوحة', 'تقارير موثوقة'],
        analysis:        ['إحصاء وصفي', 'تحليل الانحدار', 'تعلم آلي', 'معالجة اللغة الطبيعية'],
        validation:      ['مراجعة الأقران', 'اختبار A/B', 'التحقق التقاطعي', 'مقارنة المرجعية'],
        visualization:   ['رسوم بيانية تفاعلية', 'لوحات معلومات', 'تقارير PDF', 'خرائط حرارية'],
    },
    knowledgeDomains: [
        { domain: 'علوم البيانات والذكاء الاصطناعي', maturityLevel: 'متقدم',    priority: 1 },
        { domain: 'اقتصاد السوق والتجارة',           maturityLevel: 'متقدم',    priority: 1 },
        { domain: 'العلوم الإسلامية والفقه',          maturityLevel: 'متقدم',    priority: 1 },
        { domain: 'الهندسة والتقنية',                maturityLevel: 'متقدم',    priority: 2 },
        { domain: 'علوم الاستدامة',                  maturityLevel: 'متوسط',    priority: 2 },
        { domain: 'الطب والصحة الرقمية',             maturityLevel: 'أساسي',    priority: 3 },
        { domain: 'علوم الفضاء والمعادن',            maturityLevel: 'متخصص',    priority: 2 },
    ],
    qualityStandards: {
        dataAccuracy:    '≥99%',
        modelConfidence: '≥95%',
        reviewProcess:   'ثنائي الأعمى عند الطرح',
        updateFrequency: 'كل 3 أشهر كحد أقصى',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. المنطق البحثي — Research Logic
// ═══════════════════════════════════════════════════════════════════════════════
const RESEARCH_LOGIC = {
    id:          'research',
    nameAr:      'المنطق البحثي',
    nameEn:      'Research Logic',
    description: 'يحكم عمليات البحث والتطوير، الابتكار، توثيق المعرفة، واستشراف المستقبل في شيخة',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'res-1', ar: 'البحث لخدمة الإنسان والمجتمع',   en: 'Research for Human Benefit',      weight: 10 },
        { id: 'res-2', ar: 'الأصالة والجدة في البحث',         en: 'Research Originality',             weight: 9  },
        { id: 'res-3', ar: 'توثيق المنهجية والنتائج',         en: 'Methodology & Findings Documentation',weight: 9},
        { id: 'res-4', ar: 'مشاركة المعرفة وانتشارها',        en: 'Knowledge Sharing & Dissemination',weight: 8 },
        { id: 'res-5', ar: 'الربط بين البحث والتطبيق',        en: 'Research-to-Application Bridge',   weight: 9  },
        { id: 'res-6', ar: 'الاستشراف وتوقع الاتجاهات',      en: 'Foresight & Trend Anticipation',   weight: 8  },
        { id: 'res-7', ar: 'أخلاقيات البحث العلمي',          en: 'Research Ethics',                  weight: 10 },
    ],
    researchAreas: [
        { area: 'ذكاء اصطناعي وتعلم آلي',       priority: 'P0', budget: '30%',  outputType: 'منتج + ورقة بحثية' },
        { area: 'تقنية سلاسل التوريد',           priority: 'P0', budget: '20%',  outputType: 'حلول تطبيقية'     },
        { area: 'الاقتصاد الإسلامي الرقمي',     priority: 'P1', budget: '15%',  outputType: 'إطار معرفي'        },
        { area: 'أمن المعلومات والسيبرانية',     priority: 'P0', budget: '15%',  outputType: 'بروتوكولات + أدوات'},
        { area: 'استدامة بيئية واجتماعية',       priority: 'P1', budget: '10%',  outputType: 'تقارير + توصيات'  },
        { area: 'الحوكمة الرقمية والتشريع',      priority: 'P1', budget: '10%',  outputType: 'سياسات + مقترحات' },
    ],
    innovationPipeline: {
        stages: [
            { stage: 'الاستكشاف',    duration: '1-3 أشهر',    gate: 'جدوى أولية'     },
            { stage: 'البحث',        duration: '3-6 أشهر',    gate: 'دليل المفهوم'   },
            { stage: 'التطوير',      duration: '6-12 شهر',    gate: 'نموذج أولي'     },
            { stage: 'التجريب',      duration: '3-6 أشهر',    gate: 'نتائج قابلة للقياس'},
            { stage: 'الانتشار',     duration: '3-6 أشهر',    gate: 'اعتماد تشغيلي' },
        ],
        ipManagement: 'حماية الملكية الفكرية عبر هيئة الملكية الفكرية السعودية',
        openResearch:  'نشر 40% من البحوث مفتوحة المصدر',
    },
    researchMetrics: [
        { metric: 'عدد الأبحاث المنشورة',        target: '≥12/year',  unit: 'ورقة بحثية' },
        { metric: 'معدل تحويل البحث لمنتج',      target: '≥30%',      unit: 'نسبة مئوية' },
        { metric: 'شراكات بحثية',               target: '≥5/year',   unit: 'شراكة'       },
        { metric: 'براءات اختراع مقدمة',         target: '≥2/year',   unit: 'براءة'       },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. المنطق التقني — Technical Logic
// ═══════════════════════════════════════════════════════════════════════════════
const TECHNICAL_LOGIC = {
    id:          'technical',
    nameAr:      'المنطق التقني',
    nameEn:      'Technical Logic',
    description: 'يحكم الهندسة المعمارية، البنية التحتية، معايير الكود، الأداء، والموثوقية في شيخة',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'tec-1', ar: 'البساطة والقابلية للصيانة',      en: 'Simplicity & Maintainability',    weight: 9  },
        { id: 'tec-2', ar: 'الموثوقية والتوافر العالي',       en: 'Reliability & High Availability', weight: 10 },
        { id: 'tec-3', ar: 'الأمان في التصميم',               en: 'Security by Design',             weight: 10 },
        { id: 'tec-4', ar: 'قابلية التوسع والمرونة',          en: 'Scalability & Elasticity',       weight: 9  },
        { id: 'tec-5', ar: 'الأداء والكفاءة',                 en: 'Performance & Efficiency',       weight: 9  },
        { id: 'tec-6', ar: 'التوثيق الشامل',                  en: 'Comprehensive Documentation',    weight: 8  },
        { id: 'tec-7', ar: 'الاختبار المستمر والجودة',        en: 'Continuous Testing & Quality',   weight: 9  },
    ],
    architecture: {
        pattern:      'Microservices + Event-Driven',
        language:     ['Node.js', 'Python', 'Go'],
        database:     ['PostgreSQL', 'MongoDB', 'Redis'],
        messaging:    ['WebSocket', 'MCP', 'REST + GraphQL'],
        deployment:   'Docker + Kubernetes on Cloud',
        monitoring:   ['Prometheus', 'Grafana', 'ELK Stack'],
        cicd:         'GitHub Actions + automated testing',
    },
    standards: {
        api:       'RESTful + OpenAPI 3.1',
        security:  'OWASP Top 10 + ISO 27001',
        code:      'ESLint + Prettier + SonarQube',
        testing:   'Unit ≥80% coverage + Integration + E2E',
        sla: {
            uptime:          '99.9%',
            responseTimeP50: '≤100ms',
            responseTimeP99: '≤500ms',
            rto:             '≤1h',
            rpo:             '≤15min',
        },
    },
    infrastructure: {
        hosting:   'سحابي هجين (AWS + خوادم محلية)',
        cdn:       'Cloudflare',
        backup:    'نسخ احتياطي يومي تشفيري مع توزيع جغرافي',
        security:  'WAF + DDoS Protection + Zero-Trust Network',
        compliance:'ISO 27001 + SAMA Cybersecurity Framework',
    },
    techDebt: {
        policy:        'لا تراكم: تُعالَج الديون التقنية ضمن كل sprint',
        refactorCycle: 'ربع سنوي للمراجعة المعمارية',
        legacyPolicy:  'ترحيل الأنظمة القديمة خلال 18 شهراً',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. المنطق التكنولوجي — Technological Logic
// ═══════════════════════════════════════════════════════════════════════════════
const TECHNOLOGICAL_LOGIC = {
    id:          'technological',
    nameAr:      'المنطق التكنولوجي',
    nameEn:      'Technological Logic',
    description: 'يحكم اعتماد التقنيات الناشئة، الذكاء الاصطناعي، التحول الرقمي، والابتكار التكنولوجي في شيخة',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'tno-1', ar: 'التكنولوجيا في خدمة الإنسان',    en: 'Technology at Human Service',     weight: 10 },
        { id: 'tno-2', ar: 'الاعتماد المدروس للتقنيات',       en: 'Responsible Technology Adoption', weight: 9  },
        { id: 'tno-3', ar: 'الذكاء الاصطناعي الأخلاقي',      en: 'Ethical AI',                      weight: 10 },
        { id: 'tno-4', ar: 'الاستدامة التكنولوجية',           en: 'Technological Sustainability',    weight: 8  },
        { id: 'tno-5', ar: 'التكامل والتشغيل البيني',         en: 'Integration & Interoperability',  weight: 9  },
        { id: 'tno-6', ar: 'ديمقراطية الوصول للتقنية',       en: 'Technology Accessibility',        weight: 8  },
        { id: 'tno-7', ar: 'الأمان والخصوصية بالتصميم',      en: 'Privacy & Security by Design',    weight: 10 },
    ],
    aiStrategy: {
        coreModels: [
            { model: 'ChatGPT / Codex',       use: 'توليد الكود + المحادثات الذكية',    status: 'active'  },
            { model: 'Gemini',                use: 'التحليل متعدد الوسائط',             status: 'active'  },
            { model: 'Sheikha Codex Neural',  use: 'المحرك العصبي المحلي لشيخة',       status: 'active'  },
            { model: 'Arabic NLP Engine',     use: 'معالجة اللغة العربية',              status: 'active'  },
            { model: 'Matching Engine',       use: 'مطابقة الموردين والمشترين',         status: 'active'  },
        ],
        ethicsFramework: {
            transparency:  'إخبار المستخدم دائماً أنه يتفاعل مع ذكاء اصطناعي',
            fairness:      'نماذج غير متحيزة، مُختبرة على بيانات متنوعة',
            accountability:'آلية طعن واضحة لكل قرار ذكاء اصطناعي',
            noHarm:        'فلتر محتوى صارم — لا ضرر ولا ضرار',
        },
    },
    emergingTech: [
        { tech: 'Blockchain / Smart Contracts', maturity: 'في التطبيق',    priority: 'P1', useCase: 'العقود الذكية + التتبع'   },
        { tech: 'IoT',                          maturity: 'مخطط له',       priority: 'P2', useCase: 'إدارة المستودعات والأصول' },
        { tech: 'Digital Twins',                maturity: 'بحثي',          priority: 'P2', useCase: 'نمذجة سلاسل التوريد'      },
        { tech: 'Quantum Computing',            maturity: 'رصد واستعداد', priority: 'P3', useCase: 'تحسين الخوارزميات المعقدة' },
        { tech: 'AR/VR',                        maturity: 'في التطبيق',    priority: 'P2', useCase: 'معارض المنتجات الرقمية'    },
        { tech: 'Edge Computing',               maturity: 'مخطط له',       priority: 'P2', useCase: 'تحليل البيانات في الموقع' },
    ],
    digitalTransformation: {
        vision:   'شيخة — أول منظومة تجارية رقمية عربية متكاملة بالذكاء الاصطناعي',
        roadmap: [
            { phase: 1, name: 'الرقمنة الأساسية',        timeline: '2024',      status: 'مكتمل'    },
            { phase: 2, name: 'الذكاء الاصطناعي الأول',  timeline: '2025',      status: 'جارٍ'     },
            { phase: 3, name: 'التكامل الكامل',           timeline: '2026',      status: 'مخطط'     },
            { phase: 4, name: 'الذكاء التنبؤي',           timeline: '2027',      status: 'مستقبلي'  },
            { phase: 5, name: 'القيادة الإقليمية الرقمية',timeline: '2028-2030', status: 'مستقبلي'  },
        ],
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 8. المنطق المنهجي — Methodological Logic
// ═══════════════════════════════════════════════════════════════════════════════
const METHODOLOGICAL_LOGIC = {
    id:          'methodological',
    nameAr:      'المنطق المنهجي',
    nameEn:      'Methodological Logic',
    description: 'يحكم المنهجية الشاملة لشيخة: كيف تُصاغ الإجراءات، تُوثَّق المناهج، وتُطبَّق أساليب العمل بدقة واتساق',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'mth-1', ar: 'وضوح المنهج وقابلية التكرار',     en: 'Clear & Reproducible Methodology',   weight: 10 },
        { id: 'mth-2', ar: 'التكامل بين المناهج المختلفة',     en: 'Cross-Methodology Integration',      weight: 9  },
        { id: 'mth-3', ar: 'التوثيق الدقيق للإجراءات',        en: 'Precise Procedure Documentation',    weight: 9  },
        { id: 'mth-4', ar: 'المرونة المنهجية والتكيف',         en: 'Methodological Flexibility',         weight: 8  },
        { id: 'mth-5', ar: 'استناد المنهج للأدلة والبيانات',  en: 'Evidence-Based Methodology',         weight: 10 },
        { id: 'mth-6', ar: 'قياس فاعلية المنهج وتقييمه',      en: 'Methodology Effectiveness Metrics',  weight: 8  },
        { id: 'mth-7', ar: 'الترابط المنهجي عبر الوحدات',     en: 'Methodological Coherence Across Units',weight: 9},
    ],
    frameworks: [
        { name: 'Agile / Scrum',           domain: 'تطوير البرمجيات',     applicability: 'فرق التقنية'    },
        { name: 'PDCA (Plan-Do-Check-Act)',domain: 'الجودة والتحسين',      applicability: 'جميع الوحدات'  },
        { name: 'Design Thinking',         domain: 'الابتكار وحل المشكلات', applicability: 'البحث والمنتج' },
        { name: 'Six Sigma',               domain: 'تقليل الأخطاء',        applicability: 'العمليات'      },
        { name: 'Balanced Scorecard',      domain: 'قياس الأداء',           applicability: 'الإدارة العليا'},
        { name: 'Systems Thinking',        domain: 'تحليل الأنظمة المعقدة', applicability: 'القيادة'       },
    ],
    procedureLibrary: {
        onboarding:     { steps: 7,  owner: 'HR',       documented: true },
        productRelease: { steps: 12, owner: 'Engineering', documented: true },
        incidentResponse:{steps: 9,  owner: 'DevOps',   documented: true },
        auditProcess:   { steps: 8,  owner: 'Compliance', documented: true },
        riskAssessment: { steps: 6,  owner: 'Strategy', documented: true },
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 9. منطق تنهيج المناهج — Curriculum & Methodology Design Logic
// ═══════════════════════════════════════════════════════════════════════════════
const CURRICULUM_LOGIC = {
    id:          'curriculum',
    nameAr:      'منطق تنهيج المناهج',
    nameEn:      'Curriculum & Methodology Design Logic',
    description: 'يحكم تصميم وتطوير مناهج التدريب، التأهيل، ونقل المعرفة داخل شيخة ومع شركائها',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'cur-1', ar: 'تصميم المناهج وفق الأهداف التعلمية', en: 'Outcome-Based Curriculum Design',   weight: 10 },
        { id: 'cur-2', ar: 'التدرج والتسلسل في المحتوى',          en: 'Progressive Content Sequencing',    weight: 9  },
        { id: 'cur-3', ar: 'التنوع في أساليب التعلم',             en: 'Diverse Learning Modalities',       weight: 8  },
        { id: 'cur-4', ar: 'قياس الأثر التعلمي والتطوري',         en: 'Learning Impact Measurement',       weight: 9  },
        { id: 'cur-5', ar: 'ربط المناهج بالتطبيق العملي',         en: 'Theory-Practice Integration',       weight: 10 },
        { id: 'cur-6', ar: 'التحديث المستمر للمحتوى',             en: 'Continuous Content Refresh',        weight: 8  },
        { id: 'cur-7', ar: 'التخصيص وفق مستوى المتعلم',          en: 'Adaptive Personalized Learning',    weight: 9  },
    ],
    curriculumTracks: [
        { track: 'التجارة الرقمية والتصدير',   level: 'مبتدئ → متقدم', duration: '40 ساعة', format: 'هجين'   },
        { track: 'الذكاء الاصطناعي التطبيقي',  level: 'متوسط → متقدم', duration: '60 ساعة', format: 'رقمي'   },
        { track: 'الفقه الرقمي والاقتصاد الإسلامي', level: 'عام → متخصص', duration: '30 ساعة', format: 'هجين'},
        { track: 'قيادة الفرق وإدارة المشاريع',level: 'متوسط',          duration: '24 ساعة', format: 'حضوري' },
        { track: 'أمن المعلومات والسيبرانية', level: 'تقني',             duration: '48 ساعة', format: 'هجين'  },
        { track: 'ريادة الأعمال والابتكار',   level: 'عام',              duration: '20 ساعة', format: 'رقمي'  },
    ],
    certificationFramework: {
        provider:   'شيخة للتدريب والتطوير',
        accreditation: 'معتمدة من هيئة تقويم التعليم والتدريب (ETEC)',
        levels:     ['شهادة مشاركة', 'شهادة إتقان', 'شهادة احتراف', 'شهادة خبرة متقدمة'],
        validity:   '3 سنوات مع تحديث دوري',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 10. منطق الجودة — Quality Logic
// ═══════════════════════════════════════════════════════════════════════════════
const QUALITY_LOGIC = {
    id:          'quality',
    nameAr:      'منطق الجودة',
    nameEn:      'Quality Logic',
    description: 'يحكم معايير الجودة الشاملة في جميع منتجات وخدمات وعمليات شيخة',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'qlt-1', ar: 'الجودة من المصدر وليس الفحص اللاحق', en: 'Quality at Source',               weight: 10 },
        { id: 'qlt-2', ar: 'الصفر عيوب كهدف',                    en: 'Zero Defects Target',             weight: 9  },
        { id: 'qlt-3', ar: 'صوت العميل في تعريف الجودة',          en: 'Voice of Customer in Quality',    weight: 10 },
        { id: 'qlt-4', ar: 'القياس المستمر ومؤشرات الجودة',       en: 'Continuous Quality Measurement',  weight: 9  },
        { id: 'qlt-5', ar: 'التحسين المستمر للعمليات',            en: 'Continuous Process Improvement',  weight: 9  },
        { id: 'qlt-6', ar: 'توثيق معايير الجودة ومراجعتها',       en: 'Quality Standards Documentation', weight: 8  },
        { id: 'qlt-7', ar: 'ثقافة الجودة في المؤسسة كلها',        en: 'Organization-Wide Quality Culture',weight: 9 },
    ],
    standards: [
        { standard: 'ISO 9001:2015',  domain: 'إدارة الجودة الشاملة',  status: 'مستهدف' },
        { standard: 'ISO 27001',      domain: 'جودة أمن المعلومات',    status: 'مستهدف' },
        { standard: 'CMMI Level 3',   domain: 'جودة البرمجيات',        status: 'مخطط'   },
        { standard: 'Six Sigma Green',domain: 'تقليل العيوب',          status: 'مفعّل'  },
    ],
    kpis: [
        { kpi: 'معدل رضا العملاء',         target: '≥4.7/5',     frequency: 'شهري'    },
        { kpi: 'معدل العيوب في التطوير',    target: '≤0.5%',      frequency: 'لكل إصدار'},
        { kpi: 'وقت الاستجابة للشكاوى',    target: '≤4 ساعات',   frequency: 'فوري'    },
        { kpi: 'معدل حل المشكلات من أول مرة', target: '≥90%',    frequency: 'أسبوعي'  },
        { kpi: 'معدل إعادة العمل',          target: '≤2%',        frequency: 'شهري'    },
    ],
    qaProcess: {
        codeReview:      'مراجعة ثنائية لكل كود قبل الدمج',
        testCoverage:    '≥80% وحدات + تكامل + E2E',
        stagingPolicy:   'بيئة تجريبية كاملة قبل الإنتاج',
        rollbackPolicy:  'استرجاع خلال 15 دقيقة عند اكتشاف عطل',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 11. المنطق الإداري — Administrative Logic
// ═══════════════════════════════════════════════════════════════════════════════
const ADMINISTRATIVE_LOGIC = {
    id:          'administrative',
    nameAr:      'المنطق الإداري',
    nameEn:      'Administrative Logic',
    description: 'يحكم الإدارة اليومية لشيخة: الموارد البشرية، المالية، اللوجستيات، وإدارة العمليات',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'adm-1', ar: 'الكفاءة والفاعلية الإدارية',          en: 'Administrative Efficiency',        weight: 9  },
        { id: 'adm-2', ar: 'الشفافية في القرارات الإدارية',        en: 'Administrative Transparency',      weight: 10 },
        { id: 'adm-3', ar: 'توزيع الصلاحيات والتفويض الفعّال',    en: 'Effective Delegation',             weight: 9  },
        { id: 'adm-4', ar: 'إدارة الموارد باحترافية',              en: 'Professional Resource Management', weight: 9  },
        { id: 'adm-5', ar: 'الامتثال الإداري واللوائح الداخلية',   en: 'Internal Regulatory Compliance',   weight: 9  },
        { id: 'adm-6', ar: 'الرقابة والتقييم المستمر',             en: 'Continuous Monitoring & Evaluation',weight: 8},
        { id: 'adm-7', ar: 'تنمية الكفاءات البشرية',               en: 'Human Capacity Development',       weight: 9  },
    ],
    functions: {
        hr: {
            recruitment:   'منصة توظيف ذكية + مقابلات هيكلية',
            performance:   'تقييم ربع سنوي + OKR فردية وجماعية',
            training:      'خطة تطوير سنوية لكل موظف',
            compensation:  'سلم رواتب موضوعي + حوافز أداء',
        },
        finance: {
            budgeting:     'تخطيط سنوي + مراجعة ربع سنوية',
            reporting:     'تقارير شهرية + سنوية معتمدة',
            audit:         'مراجعة خارجية سنوية',
            treasury:      'إدارة نقدية يومية + توقعات 13 أسبوع',
        },
        operations: {
            sla:           'اتفاقيات مستوى خدمة داخلية موثقة',
            reporting:     'لوحة معلومات تشغيلية يومية',
            escalation:    'مصفوفة تصعيد واضحة لكل قسم',
        },
    },
    adminKPIs: [
        { kpi: 'وقت إنجاز الطلبات الإدارية',  target: '≤2 أيام عمل', frequency: 'أسبوعي' },
        { kpi: 'معدل دوران الموظفين',         target: '≤10% سنوياً', frequency: 'ربع سنوي'},
        { kpi: 'دقة التقارير المالية',         target: '100%',          frequency: 'شهري'  },
        { kpi: 'رضا الموظفين',               target: '≥4.2/5',        frequency: 'نصف سنوي'},
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 12. المنطق الهيكلي — Structural Logic
// ═══════════════════════════════════════════════════════════════════════════════
const STRUCTURAL_LOGIC = {
    id:          'structural',
    nameAr:      'المنطق الهيكلي',
    nameEn:      'Structural Logic',
    description: 'يحكم تصميم وبناء الهياكل التنظيمية والتقنية والمعلوماتية لشيخة بما يضمن المتانة والتكامل',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'str-1', ar: 'وضوح الهيكل وبساطته',                en: 'Structural Clarity & Simplicity',  weight: 9  },
        { id: 'str-2', ar: 'الفصل بين المخاوف (Separation of Concerns)', en: 'Separation of Concerns',   weight: 10 },
        { id: 'str-3', ar: 'التماسك الداخلي والاقتران المنخفض',  en: 'High Cohesion, Low Coupling',      weight: 10 },
        { id: 'str-4', ar: 'قابلية التوسع الهيكلي',              en: 'Structural Scalability',           weight: 9  },
        { id: 'str-5', ar: 'المرونة في التغيير الهيكلي',          en: 'Structural Flexibility',           weight: 8  },
        { id: 'str-6', ar: 'التوثيق الهيكلي الشامل',             en: 'Comprehensive Structural Documentation',weight: 8},
        { id: 'str-7', ar: 'التناسق بين الهياكل المختلفة',       en: 'Cross-Structure Alignment',        weight: 9  },
    ],
    structuralLayers: {
        business: [
            { name: 'طبقة القيادة الاستراتيجية',   components: ['رؤية','رسالة','قيم','أهداف']           },
            { name: 'طبقة الحوكمة',               components: ['مجلس إدارة','لجان','سياسات']            },
            { name: 'طبقة العمليات',               components: ['بيزنس بروسيس','KPIs','SLAs']            },
        ],
        technical: [
            { name: 'طبقة الواجهة (Presentation)', components: ['Web UI','Mobile App','API Gateway']     },
            { name: 'طبقة التطبيق (Application)',  components: ['Microservices','Business Logic','AI']   },
            { name: 'طبقة البيانات (Data)',         components: ['PostgreSQL','MongoDB','Redis','S3']     },
            { name: 'طبقة البنية التحتية (Infra)', components: ['Cloud','CDN','Load Balancer','Firewall']},
        ],
        information: [
            { name: 'طبقة البيانات التشغيلية',   components: ['معاملات','سجلات','سجلات تدقيق'] },
            { name: 'طبقة التحليل',              components: ['مستودع البيانات','BI','تقارير']  },
            { name: 'طبقة الذكاء',               components: ['نماذج AI','توقعات','توصيات']    },
        ],
    },
    designPatterns: ['Repository','Factory','Observer','Strategy','CQRS','Event Sourcing','Saga'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 13. المنطق التخطيطي — Planning Logic
// ═══════════════════════════════════════════════════════════════════════════════
const PLANNING_LOGIC = {
    id:          'planning',
    nameAr:      'المنطق التخطيطي',
    nameEn:      'Planning Logic',
    description: 'يحكم التخطيط الاستراتيجي والتشغيلي لشيخة: رسم الخرائط الزمنية، تحديد الأولويات، إدارة المخاطر',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'pln-1', ar: 'الوضوح في الأهداف والمخرجات',        en: 'Clear Goals & Deliverables',        weight: 10 },
        { id: 'pln-2', ar: 'الواقعية في التقدير والجدولة',        en: 'Realistic Estimation & Scheduling', weight: 9  },
        { id: 'pln-3', ar: 'إدارة المخاطر والسيناريوهات',         en: 'Risk & Scenario Management',        weight: 9  },
        { id: 'pln-4', ar: 'مرونة الخطة وقابلية التكيف',          en: 'Plan Flexibility & Adaptability',   weight: 8  },
        { id: 'pln-5', ar: 'ترتيب الأولويات بمنهجية',            en: 'Systematic Prioritization',         weight: 9  },
        { id: 'pln-6', ar: 'تتبع التقدم والانحراف',               en: 'Progress Tracking & Variance',      weight: 9  },
        { id: 'pln-7', ar: 'التخطيط التشاركي مع الأطراف المعنية', en: 'Participatory Planning',            weight: 8  },
    ],
    planningHorizons: {
        strategic:   { horizon: '3-5 سنوات', frequency: 'سنوي',         tool: 'Balanced Scorecard + OKR' },
        tactical:    { horizon: '1 سنة',     frequency: 'ربع سنوي',     tool: 'خارطة طريق + Gantt'      },
        operational: { horizon: '3 أشهر',    frequency: 'شهري',          tool: 'Sprint Planning + Kanban' },
        daily:       { horizon: '2 أسابيع',  frequency: 'أسبوعي',        tool: 'Stand-up + Task Board'   },
    },
    riskManagement: {
        categories: ['مخاطر تقنية','مخاطر تجارية','مخاطر تشريعية','مخاطر سيبرانية','مخاطر تشغيلية'],
        matrix:     'احتمال × أثر = درجة المخاطرة',
        response:   ['تجنب','تخفيف','نقل','قبول'],
        reviewCycle:'شهري للمخاطر العالية، ربع سنوي للمتوسطة',
    },
    prioritizationFramework: {
        method: 'RICE Score (Reach × Impact × Confidence ÷ Effort)',
        tieBreaker: 'أولوية الشريعة والأثر الاجتماعي',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 14. المنطق الشبكي — Network Logic
// ═══════════════════════════════════════════════════════════════════════════════
const NETWORK_LOGIC = {
    id:          'network',
    nameAr:      'المنطق الشبكي',
    nameEn:      'Network Logic',
    description: 'يحكم بناء وإدارة الشبكات: شبكات الشركاء، التقنية، المعلومات، والعلاقات في منظومة شيخة',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'net-1', ar: 'قوة الشبكة من تنوع عقدها',            en: 'Network Strength from Node Diversity', weight: 9  },
        { id: 'net-2', ar: 'اللامركزية والمرونة الشبكية',           en: 'Decentralization & Network Resilience', weight: 9 },
        { id: 'net-3', ar: 'الثقة والشفافية في العلاقات الشبكية',  en: 'Trust & Transparency in Network',    weight: 10 },
        { id: 'net-4', ar: 'تدفق المعلومات بلا احتكار',            en: 'Free Information Flow',              weight: 8  },
        { id: 'net-5', ar: 'بروتوكولات تواصل موحدة',               en: 'Unified Communication Protocols',    weight: 9  },
        { id: 'net-6', ar: 'حماية الشبكة وأمانها',                 en: 'Network Security & Protection',      weight: 10 },
        { id: 'net-7', ar: 'قياس صحة الشبكة وأدائها',              en: 'Network Health Monitoring',          weight: 8  },
    ],
    networkTypes: {
        partner: {
            description: 'شبكة الموردين والمشترين والشركاء',
            nodes:       ['موردون', 'مشترون', 'لوجستيون', 'بنوك', 'جهات حكومية'],
            connectivity:'API + بوابة B2B + شبكة ثقة موثقة',
        },
        technical: {
            description: 'الشبكة التقنية والبنية التحتية',
            topology:    'Mesh + Hub-and-Spoke هجين',
            protocols:   ['HTTP/2','WebSocket','gRPC','AMQP'],
            security:    'Zero Trust + mTLS + VPN',
        },
        knowledge: {
            description: 'شبكة المعرفة وتبادل المعلومات',
            platform:    'مركز معرفة + API المعرفة + نشرة أسبوعية',
            contributors:['باحثون','خبراء','شركاء أكاديميون'],
        },
        social: {
            description: 'شبكة المجتمع والتواصل الاجتماعي',
            channels:    ['منصات التواصل الاجتماعي','برامج الإحالة','مجتمع شيخة'],
        },
    },
    networkKPIs: [
        { kpi: 'عدد الشركاء النشطين',       target: '≥500 شريك',    frequency: 'ربع سنوي' },
        { kpi: 'معدل النمو الشبكي',          target: '≥20% سنوياً', frequency: 'ربع سنوي' },
        { kpi: 'وقت استجابة الشبكة التقنية',target: '≤50ms P95',    frequency: 'يومي'      },
        { kpi: 'معدل توفر الشبكة',           target: '≥99.95%',      frequency: 'يومي'      },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 15. المنطق التنفيذي — Executive & Implementation Logic
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// 15. المنطق التنفيذي — Executive & Implementation Logic  ★ الأفضل عالمياً ★
// ═══════════════════════════════════════════════════════════════════════════════
const EXECUTIVE_LOGIC = {
    id:          'executive',
    nameAr:      'المنطق التنفيذي',
    nameEn:      'Executive & Implementation Logic',
    description: 'النظام التنفيذي الأفضل عالمياً لشيخة: يحوّل القرارات إلى أثر ملموس بأعلى كفاءة وأدق منهجية — من الفكرة إلى التسليم إلى الأثر الحضاري',
    scope:       ACTIVE_IN,
    tier:        'WORLD_CLASS',

    // ── المبادئ العشرة للتنفيذ المثالي ────────────────────────────────────────
    principles: [
        { id: 'exc-1',  ar: 'التنفيذ الدقيق للخطط المعتمدة',          en: 'Precise Approved-Plan Execution',       weight: 10 },
        { id: 'exc-2',  ar: 'السرعة مع الجودة — لا مساومة',           en: 'Speed with Zero Quality Compromise',    weight: 10 },
        { id: 'exc-3',  ar: 'وضوح المسؤولية والملكية التنفيذية',       en: 'Crystal-Clear Ownership (RACI+)',        weight: 10 },
        { id: 'exc-4',  ar: 'قياس التنفيذ بمؤشرات حية ودقيقة',        en: 'Real-Time Execution KPIs',              weight: 10 },
        { id: 'exc-5',  ar: 'التصعيد الفوري وحل العقبات في 24 ساعة',  en: 'Immediate Escalation & 24h Resolution', weight: 10 },
        { id: 'exc-6',  ar: 'التعلم المستمر من كل دورة تنفيذية',      en: 'Execution Learning Loop',               weight: 9  },
        { id: 'exc-7',  ar: 'المرونة التكيفية في وجه المتغيرات',       en: 'Adaptive Execution Flexibility',        weight: 9  },
        { id: 'exc-8',  ar: 'الشفافية الكاملة مع جميع الأطراف',       en: 'Full Stakeholder Transparency',         weight: 9  },
        { id: 'exc-9',  ar: 'الربط الوثيق بين التنفيذ والاستراتيجية', en: 'Strategy-Execution Tight Coupling',      weight: 10 },
        { id: 'exc-10', ar: 'الإنجاز المبني على القيم الإسلامية',     en: 'Values-Driven Execution',               weight: 10 },
    ],

    // ── نموذج التنفيذ الشامل (من القرار إلى الأثر) ───────────────────────────
    executionModel: {
        name:        'نموذج شيخة التنفيذي الشامل (IDEA²)',
        stages: [
            {
                code:    'I',
                nameAr:  'الاستيعاب',
                nameEn:  'Intake & Understand',
                purpose: 'استيعاب القرار أو المهمة بعمق قبل أي خطوة',
                actions: ['قراءة ووثيقة القرار كاملاً','تحديد المخرجات المطلوبة بدقة','تحديد الأطراف المعنية','رصد القيود والافتراضات'],
                gate:    'وضوح 100% في المخرجات',
                maxTime: '4 ساعات',
            },
            {
                code:    'D',
                nameAr:  'التصميم التنفيذي',
                nameEn:  'Design the Execution',
                purpose: 'تحويل المهمة إلى خطة تنفيذية مفصّلة قابلة للقياس',
                actions: ['تفكيك المهمة إلى مهام صغيرة (WBS)','تعيين مالك واضح لكل مهمة','تحديد المواعيد النهائية','تحديد الموارد والميزانية','بناء مصفوفة RACI+'],
                gate:    'خطة موافق عليها من صاحب الصلاحية',
                maxTime: '1 يوم عمل للمشاريع الصغيرة / 3 أيام للكبيرة',
            },
            {
                code:    'E',
                nameAr:  'التنفيذ',
                nameEn:  'Execute with Discipline',
                purpose: 'تنفيذ الخطة بانضباط ودقة مع متابعة مستمرة',
                actions: ['stand-up يومي 15 دقيقة','تحديث حالة المهام كل نهاية يوم','رفع العقبات فوراً','الالتزام بتعريف الإنجاز المتفق عليه'],
                gate:    'إنجاز ≥85% من المخطط في الوقت المحدد',
                maxTime: 'حسب خطة المشروع',
            },
            {
                code:    'E²',
                nameAr:  'التقييم والتحسين',
                nameEn:  'Evaluate & Evolve',
                purpose: 'قياس الأثر، استخلاص الدروس، وتحسين النموذج التنفيذي',
                actions: ['قياس KPIs المتفق عليها','جلسة retrospective منظمة','توثيق دروس التنفيذ','تحديث الإجراءات بناءً على التعلم','مشاركة الدروس مع المؤسسة'],
                gate:    'تقرير مكتمل + دروس موثقة + تحسينات مسجلة',
                maxTime: '2 يوم بعد الإغلاق',
            },
            {
                code:    'A',
                nameAr:  'تعزيز الأثر',
                nameEn:  'Amplify the Impact',
                purpose: 'ضمان أن التنفيذ يترك أثراً مستداماً ويُبنى عليه',
                actions: ['ربط النتائج بالأهداف الاستراتيجية','نشر النجاحات لتحفيز الفرق','ترسيخ التحسينات في الإجراءات الرسمية','تحديد فرص التوسع'],
                gate:    'أثر قابل للقياس + إجراء رسمي محدّث',
                maxTime: 'مستمر',
            },
        ],
    },

    // ── إطار RACI+ المحسّن ────────────────────────────────────────────────────
    ownershipModel: {
        name:   'RACI+ Framework',
        roles: {
            R: { name: 'Responsible',  ar: 'المنفذ',     desc: 'من ينفذ المهمة فعلياً',              rule: 'شخص واحد دائماً'          },
            A: { name: 'Accountable',  ar: 'المسؤول',    desc: 'من يتحمل المسؤولية النهائية',         rule: 'شخص واحد حصراً'           },
            C: { name: 'Consulted',    ar: 'المستشار',   desc: 'من يُستشار قبل وأثناء التنفيذ',       rule: 'محدود ومحدد'              },
            I: { name: 'Informed',     ar: 'المُبلَّغ',  desc: 'من يُبلَّغ بالتقدم والنتائج',         rule: 'فعال لا غارق'             },
            S: { name: 'Support',      ar: 'الداعم',     desc: 'من يقدم دعماً تشغيلياً (زيادة RACI+)',rule: 'موارد جاهزة عند الطلب'    },
            V: { name: 'Verify',       ar: 'المُتحقق',   desc: 'من يتحقق من جودة المخرج (زيادة RACI+)',rule: 'مستقل عن المنفذ'          },
        },
        rule: 'كل مهمة لها R واحد وA واحد — تعدد الـ R يُلغي المسؤولية',
    },

    // ── إدارة الأولويات بنظام ICE المحسّن ───────────────────────────────────
    prioritizationEngine: {
        method: 'ICE-S Score',
        formula: '(Impact × Confidence × Ease × Strategic_Alignment) / Effort',
        scales: {
            Impact:             { min: 1, max: 10, desc: 'أثر المهمة على الأهداف الاستراتيجية'  },
            Confidence:         { min: 1, max: 10, desc: 'مستوى اليقين من تحقيق الأثر'          },
            Ease:               { min: 1, max: 10, desc: '10 = سهل جداً، 1 = صعب جداً'         },
            Strategic_Alignment:{ min: 1, max: 10, desc: 'التوافق مع رؤية شيخة وأهدافها الكبرى'},
            Effort:             { min: 1, max: 10, desc: 'الجهد المطلوب (10 = جهد ضخم)'         },
        },
        tiers: [
            { name: 'P0 — حرجة',   score: '≥70', action: 'تنفيذ فوري — لا تأجيل'             },
            { name: 'P1 — عالية',  score: '50-69',action: 'ضمن Sprint القادم'                  },
            { name: 'P2 — متوسطة', score: '30-49',action: 'في الخارطة الزمنية الربع سنوية'    },
            { name: 'P3 — منخفضة', score: '<30',  action: 'Backlog — إعادة تقييم ربع سنوي'   },
        ],
        overrides: ['أمر قيادة عليا','أزمة أو حادثة','متطلب تشريعي عاجل','ضرر وشيك بالعملاء'],
    },

    // ── نظام الإيقاع التنفيذي (Execution Cadence) ───────────────────────────
    executionCadence: {
        daily: {
            name:      'Stand-up اليومي',
            duration:  '15 دقيقة كحد أقصى',
            format:    'ماذا أنجزت؟ ماذا سأنجز؟ ما العقبات؟',
            rule:      'لا انحراف عن الـ 3 أسئلة — المناقشات تُرفع لاحقاً',
            tool:      'Kanban Board مرئي + تقرير نصي موجز',
        },
        weekly: {
            name:      'مراجعة أسبوعية',
            duration:  '60 دقيقة',
            agenda:    ['مراجعة KPIs','تقييم تقدم Sprint','حل العقبات المستمرة','تعديل الخطة إن لزم'],
            output:    'تقرير حالة أسبوعي + قرارات مسجلة',
        },
        biweekly: {
            name:      'Sprint Review + Retrospective',
            duration:  '120 دقيقة',
            agenda:    ['عرض المنجزات للأطراف المعنية','تقييم ما نجح وما لم ينجح','خطة Sprint القادم'],
            output:    'Demo مُسجّل + دروس موثقة + Sprint Backlog محدّث',
        },
        monthly: {
            name:      'مراجعة الأداء الشاملة',
            duration:  '180 دقيقة',
            agenda:    ['KPIs الشهرية','مراجعة المخاطر','مراجعة الميزانية التنفيذية','توافق مع OKRs'],
            output:    'تقرير شهري تنفيذي + توصيات + قرارات تصحيحية',
        },
        quarterly: {
            name:      'مراجعة OKR وتخطيط الربع',
            duration:  'يوم كامل',
            agenda:    ['قياس OKRs المنتهية','تحليل الفجوات','وضع OKRs الجديدة','مراجعة استراتيجية مصغّرة'],
            output:    'OKR Sheet جديد + خارطة طريق محدّثة + موازنة معدّلة',
        },
    },

    // ── بروتوكول العقبات وإدارة المخاطر التنفيذية ────────────────────────────
    blockerProtocol: {
        definition: 'أي عائق يمنع التقدم أو يهدد تسليم P0/P1 في موعده',
        levels: [
            {
                level: 'L1 — طارئ',
                condition: 'يوقف تسليماً حرجاً أو يؤثر على عملاء',
                responseTime: '≤2 ساعة',
                escalateTo:   'المدير التنفيذي مباشرة',
                channel:      'اتصال هاتفي + رسالة فورية',
            },
            {
                level: 'L2 — عالٍ',
                condition: 'يؤخر Sprint أو يؤثر على SLA داخلي',
                responseTime: '≤8 ساعات',
                escalateTo:   'مدير القسم',
                channel:      'قناة تواصل مخصصة + تذكرة رسمية',
            },
            {
                level: 'L3 — متوسط',
                condition: 'تأخير ≤2 يوم دون أثر على العميل',
                responseTime: '≤24 ساعة',
                escalateTo:   'قائد الفريق',
                channel:      'Stand-up + تذكرة محدّثة',
            },
            {
                level: 'L4 — منخفض',
                condition: 'عائق لا يؤثر على الموعد النهائي',
                responseTime: '≤72 ساعة',
                escalateTo:   'الفريق ذاتياً',
                channel:      'Kanban Board',
            },
        ],
        resolutionLoop: ['رصد العقبة','تصنيفها','تصعيدها','حل مؤقت خلال 4h','حل جذري خلال 48h','توثيق الدرس'],
    },

    // ── تعريف الإنجاز (Definition of Done) ──────────────────────────────────
    definitionOfDone: {
        software: [
            'الكود يعمل في بيئة staging بلا أخطاء',
            'تغطية اختبارات ≥80%',
            'مراجعة كود من شخصين',
            'توثيق API/README محدّث',
            'فحص أمني (OWASP) اجتاز',
            'مراجعة أداء: response ≤200ms',
            'لا warnings في ESLint/SonarQube',
        ],
        businessFeature: [
            'تم قبول معايير الإنجاز (Acceptance Criteria) كلها',
            'تم اختباره من مستخدم حقيقي أو ممثل العميل',
            'التوثيق التشغيلي مكتمل',
            'التدريب على الميزة منجز (إن لزم)',
            'KPIs القياس محددة ومُفعّلة',
        ],
        process: [
            'التقرير التنفيذي النهائي مكتوب',
            'دروس التنفيذ موثقة',
            'الإجراءات المحدّثة مُعتمدة',
            'إغلاق رسمي مع الأطراف المعنية',
        ],
    },

    // ── نظام OKR المتكامل ─────────────────────────────────────────────────────
    okrSystem: {
        philosophy: 'الأهداف تُلهم، النتائج الرئيسية تقيس — المحصلة تُغيّر الواقع',
        structure: {
            levels:    ['شيخة (مؤسسي)','منظمة شيخة','سوق شيخة','الفريق','الفرد'],
            cascade:   'من أعلى لأسفل + مساهمة صاعدة من الفرق',
            alignment: 'كل OKR فردي يدعم OKR مستوى أعلى',
        },
        scoring: {
            scale:   '0.0 – 1.0',
            targets: { stretch: '0.7', good: '0.8', excellent: '1.0' },
            rule:    '1.0 دائماً يعني الهدف كان سهلاً — stretch goals الهدف',
        },
        cadence: {
            set:     'أول أسبوع من الربع',
            midCheck:'منتصف الربع — تعديل إن لزم',
            review:  'آخر أسبوع من الربع',
            reset:   'OKRs تُغلق ولا تُرحّل — كل ربع قصة جديدة',
        },
    },

    // ── مؤشرات الأداء التنفيذي الشامل ───────────────────────────────────────
    deliveryMetrics: [
        // أداء التسليم
        { metric: 'معدل إنجاز Sprint',               target: '≥90%',           frequency: 'لكل sprint',   tier: 'core'     },
        { metric: 'وقت التسليم لـ MVP',               target: '≤4 أسابيع',      frequency: 'لكل منتج',    tier: 'core'     },
        { metric: 'دقة التقدير',                      target: '±15%',           frequency: 'لكل sprint',   tier: 'core'     },
        { metric: 'معدل العقبات المحلولة في 24h',     target: '≥95%',           frequency: 'أسبوعي',       tier: 'core'     },
        // جودة التنفيذ
        { metric: 'معدل العيوب ما بعد التسليم',       target: '≤1%',            frequency: 'شهري',         tier: 'quality'  },
        { metric: 'معدل الرجوع لإعادة العمل',         target: '≤3%',            frequency: 'لكل sprint',   tier: 'quality'  },
        { metric: 'نسبة المهام المنجزة في موعدها',    target: '≥88%',           frequency: 'أسبوعي',       tier: 'quality'  },
        // رضا الأطراف
        { metric: 'رضا العملاء عن التسليم',            target: '≥4.6/5',         frequency: 'لكل تسليم',    tier: 'customer' },
        { metric: 'رضا الفريق التنفيذي',              target: '≥4.3/5',         frequency: 'ربع سنوي',     tier: 'team'     },
        // الكفاءة
        { metric: 'الوقت الضائع في الاجتماعات',       target: '≤20% من وقت الفريق',frequency: 'أسبوعي',   tier: 'efficiency'},
        { metric: 'معدل إعادة استخدام المكونات',       target: '≥40%',           frequency: 'لكل sprint',   tier: 'efficiency'},
        // الاستراتيجي
        { metric: 'نسبة OKRs المنجزة',                target: '≥70% بدرجة ≥0.7',frequency: 'ربع سنوي',    tier: 'strategic' },
        { metric: 'توافق التنفيذ مع الاستراتيجية',    target: '≥90%',           frequency: 'شهري',         tier: 'strategic' },
    ],

    // ── أدوات التنفيذ الموصى بها ─────────────────────────────────────────────
    toolStack: {
        projectManagement: ['Jira / Linear (تتبع المهام)', 'Confluence (توثيق)', 'Miro (رسم الخرائط)'],
        communication:     ['Slack / Teams (تواصل فوري)', 'Email (رسمي)', 'Video (مراجعات عميقة)'],
        monitoring:        ['Grafana (أداء تقني)', 'Datadog (مراقبة)', 'لوحة KPIs مباشرة (شيخة)'],
        delivery:          ['GitHub Actions (CI/CD)', 'Docker + K8s (نشر)', 'Feature Flags (تحكم)'],
        analytics:         ['Power BI / Metabase (تقارير)', 'Mixpanel (سلوك المستخدم)', 'BigQuery (بيانات)'],
    },

    // ── قواعد التنفيذ الذهبية العشر ──────────────────────────────────────────
    goldenRules: [
        { rule: 1,  ar: 'لا تبدأ مهمة بدون مالك واحد واضح',                         en: 'No task without a single clear owner'           },
        { rule: 2,  ar: 'الخطة الجيدة اليوم أفضل من الخطة المثالية غداً',             en: 'Good plan today beats perfect plan tomorrow'    },
        { rule: 3,  ar: 'العقبة المخفية كارثة — أبلغ فوراً',                         en: 'Hidden blocker is a disaster — report instantly' },
        { rule: 4,  ar: 'القياس يسبق الحكم دائماً',                                  en: 'Measure before you judge — always'              },
        { rule: 5,  ar: 'الاجتماع بدون قرارات مسجّلة وقت مهدر',                      en: 'Meeting without logged decisions is wasted time' },
        { rule: 6,  ar: 'لا تقل "تقريباً جاهز" — الـ 90% ليست إنجازاً',             en: '"Almost done" is not done — 90% is 0%'          },
        { rule: 7,  ar: 'تعلّم من الفشل، لا تعاقب عليه',                             en: 'Learn from failure, never punish it'            },
        { rule: 8,  ar: 'الشفافية مع الجهة العليا تحمي الجميع',                       en: 'Upward transparency protects everyone'          },
        { rule: 9,  ar: 'التنفيذ خدمة لصاحب المصلحة، لا إثبات للذات',               en: 'Execution serves the stakeholder, not the ego'  },
        { rule: 10, ar: 'كل دورة تنفيذ يجب أن تترك النظام أفضل مما وجدته',           en: 'Leave the system better than you found it'      },
    ],

    // ── قاموس التنفيذ ─────────────────────────────────────────────────────────
    glossary: {
        MVP:       'الحد الأدنى من المنتج القابل للتحقق — أسرع طريق للتعلم الحقيقي',
        Sprint:    'دورة تنفيذ قصيرة (2 أسبوع) بهدف محدد ومخرج قابل للقياس',
        Blocker:   'عائق يمنع التقدم يجب رفعه فوراً',
        WBS:       'تفكيك هيكل العمل — تحليل المهمة الكبيرة لمكونات صغيرة قابلة للتنفيذ والقياس',
        OKR:       'هدف + نتيجة رئيسية قابلة للقياس',
        RACI:      'مصفوفة المسؤوليات: Responsible · Accountable · Consulted · Informed',
        KPI:       'مؤشر أداء رئيسي — رقم يقيس تحقيق الهدف',
        Retrospective: 'جلسة تأمل بعد كل Sprint لتحسين طريقة العمل',
        SLA:       'اتفاقية مستوى الخدمة — التزام موثق بالجودة والسرعة',
        'Definition of Done': 'معايير واضحة يجب استيفاؤها قبل اعتبار أي مهمة منجزة',
    },

    // ── نظام الحوافز التنفيذية ───────────────────────────────────────────────
    incentiveSystem: {
        recognition: [
            { award: 'نجم التنفيذ الشهري',  criteria: 'أعلى جودة تسليم + أسرع وقت + أقل عقبات', frequency: 'شهري'   },
            { award: 'فريق ربع السنة',      criteria: 'أعلى OKR score + رضا العميل',             frequency: 'ربع سنوي'},
            { award: 'مبتكر التنفيذ',        criteria: 'أفضل تحسين على إجراء قائم',               frequency: 'نصف سنوي'},
        ],
        monetary: {
            bonusLinkedTo: 'OKR Score + KPIs التنفيذية',
            formula:       'مكافأة = نسبة OKR × ضريب الكفاءة × الراتب الأساسي',
        },
        growth: {
            fastTrack:   'المنفذون بـ OKR ≥0.85 لثلاثة أرباع متتالية مرشحون للترقية المسرّعة',
            mentorship:  'أفضل المنفذين يُعيَّنون مرشدين للمنضمين الجدد',
        },
    },

    // ── منظومة القرارات التنفيذية ────────────────────────────────────────────
    decisionEngine: {
        levels: [
            { level: 'D1', name: 'قرار فوري',        authority: 'الفرد المنفذ',       threshold: 'أثر ≤ يوم عمل'     },
            { level: 'D2', name: 'قرار فريق',        authority: 'قائد الفريق',        threshold: 'أثر ≤ Sprint'      },
            { level: 'D3', name: 'قرار تشغيلي',      authority: 'مدير القسم',         threshold: 'أثر ≤ ربع سنة'    },
            { level: 'D4', name: 'قرار استراتيجي',   authority: 'المجلس التنفيذي',    threshold: 'أثر > ربع سنة أو ميزانية > X'},
        ],
        principle: 'القرار يُتخذ على أدنى مستوى ممكن — التصعيد استثناء لا أصل',
        timeout:   'إذا لم يُتخذ القرار خلال SLA — يُصعَّد تلقائياً للمستوى الأعلى',
        documentation: 'كل قرار D3+ يُسجَّل: السياق، البدائل، المبررات، المسؤول، الأثر المتوقع',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 16. المنطق التطويري — Development Logic
// ═══════════════════════════════════════════════════════════════════════════════
const DEVELOPMENT_LOGIC = {
    id:          'development',
    nameAr:      'المنطق التطويري',
    nameEn:      'Development Logic',
    description: 'يحكم تطوير المنتجات والخدمات والكفاءات في شيخة بمنهجية مستدامة وقابلة للتوسع',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'dev-1', ar: 'التطوير المستمر والمتكرر',             en: 'Iterative & Continuous Development', weight: 10 },
        { id: 'dev-2', ar: 'التركيز على قيمة المستخدم أولاً',      en: 'User Value First',                   weight: 10 },
        { id: 'dev-3', ar: 'الكود النظيف والقابل للصيانة',         en: 'Clean & Maintainable Code',          weight: 9  },
        { id: 'dev-4', ar: 'التكامل المستمر والنشر المستمر',        en: 'CI/CD Best Practices',               weight: 9  },
        { id: 'dev-5', ar: 'التطوير المدفوع بالاختبار',            en: 'Test-Driven Development',            weight: 8  },
        { id: 'dev-6', ar: 'الاستثمار في رفع كفاءة الفريق',        en: 'Team Capability Investment',         weight: 9  },
        { id: 'dev-7', ar: 'الشفافية في عمليات التطوير',           en: 'Development Transparency',           weight: 8  },
    ],
    sdlc: {
        model:     'Agile Scrum مع بوابات جودة صارمة',
        phases:    ['استكشاف','تصميم','تطوير','اختبار','نشر','مراقبة'],
        branching: 'Git Flow: main ← develop ← feature/fix',
        review:    'PR مراجعة ثنائية إلزامية',
        pipeline:  'GitHub Actions: lint → test → build → security scan → deploy',
    },
    devKPIs: [
        { kpi: 'تغطية الاختبارات',           target: '≥80%',          frequency: 'لكل PR'      },
        { kpi: 'وقت دورة التطوير',           target: '≤5 أيام/feature', frequency: 'أسبوعي'    },
        { kpi: 'معدل فشل النشر',             target: '≤2%',            frequency: 'لكل نشر'    },
        { kpi: 'وقت استرجاع النشر الفاشل',   target: '≤30 دقيقة',      frequency: 'عند الحدوث' },
        { kpi: 'معدل الديون التقنية',         target: '≤5% من كود قاعدة',frequency: 'شهري'      },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 17. المنطق التحسيني — Improvement Logic
// ═══════════════════════════════════════════════════════════════════════════════
const IMPROVEMENT_LOGIC = {
    id:          'improvement',
    nameAr:      'المنطق التحسيني',
    nameEn:      'Improvement Logic',
    description: 'يحكم دورة التحسين المستمر في شيخة: قياس، تحليل، تحسين، ومراجعة دائمة',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'imp-1', ar: 'التحسين لا يتوقف أبداً',               en: 'Improvement Never Stops',           weight: 10 },
        { id: 'imp-2', ar: 'المقيس يمكن تحسينه',                   en: 'What Gets Measured Gets Improved',  weight: 10 },
        { id: 'imp-3', ar: 'المشاركة الجماعية في التحسين',          en: 'Collective Improvement Engagement', weight: 9  },
        { id: 'imp-4', ar: 'الأولوية للتحسينات ذات الأثر الأكبر',  en: 'High-Impact Improvement Priority',  weight: 9  },
        { id: 'imp-5', ar: 'التحسين المبني على البيانات',           en: 'Data-Driven Improvement',           weight: 10 },
        { id: 'imp-6', ar: 'تثبيت التحسينات ومنع التراجع',         en: 'Improvement Sustainability',        weight: 8  },
        { id: 'imp-7', ar: 'الاستفادة من أفضل الممارسات العالمية', en: 'Best Practice Benchmarking',        weight: 8  },
    ],
    improvementCycles: {
        daily:     { mechanism: 'Daily Retrospective',     focus: 'عقبات ومشكلات يومية'           },
        weekly:    { mechanism: 'Weekly Review',           focus: 'أداء Sprint ومؤشرات أسبوعية'   },
        monthly:   { mechanism: 'Monthly KPI Review',     focus: 'مؤشرات الأداء الشاملة'          },
        quarterly: { mechanism: 'OKR Review & Planning',  focus: 'الأهداف الفصلية والتعلم المؤسسي'},
        annually:  { mechanism: 'Strategy Review',        focus: 'المسار الاستراتيجي والرؤية'     },
    },
    tools: ['PDCA','A3 Problem Solving','5 Whys','Fishbone Diagram','Pareto Analysis','Kaizen Blitz'],
    cultureElements: [
        'تشجيع رفع المشكلات بلا عقاب',
        'مكافأة التحسينات المقترحة',
        'تشارك التعلم من الإخفاقات',
        'الشفافية في نشر نتائج التحسين',
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 18. المنطق التكيفي — Adaptive Logic
// ═══════════════════════════════════════════════════════════════════════════════
const ADAPTIVE_LOGIC = {
    id:          'adaptive',
    nameAr:      'المنطق التكيفي',
    nameEn:      'Adaptive Logic',
    description: 'يحكم قدرة شيخة على التكيف مع التغيرات: السوق، التقنية، التشريعات، والبيئة الخارجية',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'adp-1', ar: 'الاستجابة السريعة للتغيير',            en: 'Rapid Change Response',             weight: 10 },
        { id: 'adp-2', ar: 'الرصد المبكر للإشارات والاتجاهات',     en: 'Early Signal Detection',            weight: 9  },
        { id: 'adp-3', ar: 'المرونة الهيكلية والتشغيلية',          en: 'Structural & Operational Flexibility',weight: 9},
        { id: 'adp-4', ar: 'الذاكرة المؤسسية للتعلم من التكيف',    en: 'Institutional Adaptive Memory',     weight: 8  },
        { id: 'adp-5', ar: 'التوازن بين الاستقرار والتكيف',        en: 'Stability-Adaptability Balance',    weight: 9  },
        { id: 'adp-6', ar: 'التخطيط بالسيناريوهات المستقبلية',     en: 'Scenario-Based Planning',           weight: 8  },
        { id: 'adp-7', ar: 'ثقافة الاستعداد للتغيير',              en: 'Change-Ready Culture',              weight: 9  },
    ],
    adaptationTriggers: [
        { trigger: 'تغير تشريعي',          responseTime: '≤2 أسابيع',   mechanism: 'فريق امتثال سريع'         },
        { trigger: 'تهديد سيبراني',         responseTime: '≤4 ساعات',    mechanism: 'خطة استجابة للحوادث'      },
        { trigger: 'تحول في السوق',         responseTime: '≤4 أسابيع',   mechanism: 'جلسة استراتيجية طارئة'    },
        { trigger: 'تقنية ناشئة تؤثر',      responseTime: '≤8 أسابيع',   mechanism: 'فريق استكشاف تقني'        },
        { trigger: 'فرصة تجارية مفاجئة',   responseTime: '≤1 أسبوع',    mechanism: 'صلاحيات قرار سريع معتمدة' },
        { trigger: 'اضطراب في سلسلة توريد',responseTime: '≤72 ساعة',    mechanism: 'خطة بديلة جاهزة'          },
    ],
    adaptiveCapabilities: {
        sensing:      'رصد بيانات السوق + تنبيهات تشريعية + مراقبة منافسين',
        interpreting: 'تحليل ذكاء اصطناعي + جلسات خبرة + استشارات خارجية',
        deciding:     'لجنة قرار سريع + صلاحيات مفوضة للمدراء',
        acting:       'خطط تكيف جاهزة + فرق متعددة الوظائف',
        learning:     'توثيق دروس التكيف + نشرها في المؤسسة',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 19. المنطق البيئي — Environmental Logic
// ═══════════════════════════════════════════════════════════════════════════════
const ENVIRONMENTAL_LOGIC = {
    id:          'environmental',
    nameAr:      'المنطق البيئي',
    nameEn:      'Environmental Logic',
    description: 'يحكم مسؤولية شيخة البيئية: الاستدامة، البصمة الكربونية، الاقتصاد الأخضر، وحماية الموارد الطبيعية',
    scope:       ACTIVE_IN,
    principles: [
        { id: 'env-1', ar: 'الاستخلاف وحفظ البيئة فريضة',         en: 'Environmental Stewardship as Duty', weight: 10 },
        { id: 'env-2', ar: 'تقليص البصمة الكربونية الرقمية',       en: 'Digital Carbon Footprint Reduction',weight: 9  },
        { id: 'env-3', ar: 'الاقتصاد الدائري في العمليات',         en: 'Circular Economy Operations',       weight: 8  },
        { id: 'env-4', ar: 'قياس الأثر البيئي والإفصاح عنه',       en: 'Environmental Impact Measurement',  weight: 9  },
        { id: 'env-5', ar: 'ترجيح الشركاء البيئيين المسؤولين',     en: 'ESG Partner Preference',            weight: 8  },
        { id: 'env-6', ar: 'الكفاءة في استهلاك الطاقة',            en: 'Energy Efficiency',                 weight: 9  },
        { id: 'env-7', ar: 'دعم أهداف التنمية المستدامة SDGs',     en: 'UN SDGs Alignment',                 weight: 9  },
    ],
    sustainabilityTargets: [
        { goal: 'خفض استهلاك الطاقة',          target: '-30% بحلول 2027',    measure: 'kWh/معاملة'             },
        { goal: 'بصمة كربونية صافية صفرية',    target: 'حياد كربوني 2030',   measure: 'CO₂ equivalent'          },
        { goal: 'الخوادم بالطاقة المتجددة',    target: '100% بحلول 2026',    measure: 'نسبة مئوية'              },
        { goal: 'تقليل النفايات الإلكترونية',   target: '-50% بحلول 2027',    measure: 'كجم/موظف/سنة'            },
    ],
    esgFramework: {
        environmental: { rating: 'نشط',  initiatives: ['طاقة شمسية','تعويض كربوني','سيرفرات خضراء'] },
        social:        { rating: 'نشط',  initiatives: ['توظيف محلي','تدريب المجتمع','دعم الشباب']    },
        governance:    { rating: 'نشط',  initiatives: ['شفافية','مكافحة فساد','تنوع القيادة']         },
    },
    sdgAlignment: [
        { sdg: 'SDG 7',  title: 'طاقة نظيفة وبأسعار معقولة',  relevance: 'عالية' },
        { sdg: 'SDG 8',  title: 'العمل اللائق والنمو الاقتصادي',relevance: 'عالية'},
        { sdg: 'SDG 9',  title: 'الصناعة والابتكار والبنية التحتية',relevance: 'عالية'},
        { sdg: 'SDG 12', title: 'الإنتاج والاستهلاك المسؤول',  relevance: 'متوسطة'},
        { sdg: 'SDG 13', title: 'العمل المناخي',               relevance: 'متوسطة'},
        { sdg: 'SDG 17', title: 'الشراكات لتحقيق الأهداف',     relevance: 'عالية' },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// المحرك الرئيسي — SevenLogicsEngine (موسَّع إلى 20 منطق)
// ═══════════════════════════════════════════════════════════════════════════════

class SevenLogicsEngine {

    constructor() {
        this.version    = ENGINE_VERSION;
        this.nameAr     = 'محرك المنطق الشامل لشيخة (20 منطق)';
        this.nameEn     = 'Sheikha Comprehensive Logics Engine (20 Logics)';
        this.governor   = GOVERNOR;
        this.activeIn   = ACTIVE_IN;
        this.activatedAt= new Date().toISOString();

        // ── المنطق السباعي الأصلي + 13 منطقاً جديداً = 20 منطقاً شاملاً ──────
        this._logics = new Map([
            // المجموعة الأولى: الأصلية (7)
            ['organizational',  ORGANIZATIONAL_LOGIC ],
            ['legislative',     LEGISLATIVE_LOGIC    ],
            ['commercial',      COMMERCIAL_LOGIC     ],
            ['scientific',      SCIENTIFIC_LOGIC     ],
            ['research',        RESEARCH_LOGIC       ],
            ['technical',       TECHNICAL_LOGIC      ],
            ['technological',   TECHNOLOGICAL_LOGIC  ],
            // المجموعة الثانية: الجديدة (13)
            ['methodological',  METHODOLOGICAL_LOGIC ],
            ['curriculum',      CURRICULUM_LOGIC     ],
            ['quality',         QUALITY_LOGIC        ],
            ['administrative',  ADMINISTRATIVE_LOGIC ],
            ['structural',      STRUCTURAL_LOGIC     ],
            ['planning',        PLANNING_LOGIC       ],
            ['network',         NETWORK_LOGIC        ],
            ['executive',       EXECUTIVE_LOGIC      ],
            ['development',     DEVELOPMENT_LOGIC    ],
            ['improvement',     IMPROVEMENT_LOGIC    ],
            ['adaptive',        ADAPTIVE_LOGIC       ],
            ['environmental',   ENVIRONMENTAL_LOGIC  ],
        ]);

        // مجموعات المنطق لسهولة الاستعلام
        this._groups = {
            governance:    ['organizational','legislative','administrative','structural'],
            knowledge:     ['scientific','research','methodological','curriculum'],
            commerce:      ['commercial','network','executive'],
            engineering:   ['technical','technological','development'],
            excellence:    ['quality','planning','improvement','adaptive'],
            sustainability:['environmental'],
        };
    }

    // ── قائمة المنطق السباعي ──────────────────────────────────────────────────
    listLogics() {
        const logics = [];
        for (const [key, logic] of this._logics) {
            logics.push({
                id:          key,
                nameAr:      logic.nameAr,
                nameEn:      logic.nameEn,
                description: logic.description,
                scope:       logic.scope,
                principleCount: logic.principles.length,
                avgWeight:   +(logic.principles.reduce((s, p) => s + p.weight, 0) / logic.principles.length).toFixed(1),
                status:      'active',
            });
        }
        return logics;
    }

    // ── الحصول على منطق بعينه ─────────────────────────────────────────────────
    getLogic(id) {
        return this._logics.get(id) || null;
    }

    // ── تقييم استعلام ضد منطق معين ───────────────────────────────────────────
    evaluate(logicId, query) {
        const logic = this._logics.get(logicId);
        if (!logic) return { success: false, message: `المنطق "${logicId}" غير موجود` };

        const q = (query || '').trim().toLowerCase();

        // تقييم بسيط: إيجاد المبادئ ذات الصلة
        const relevant = logic.principles.filter(p =>
            q.length === 0 || p.ar.includes(query) || p.en.toLowerCase().includes(q)
        );

        const score = relevant.length > 0
            ? +(relevant.reduce((s, p) => s + p.weight, 0) / relevant.length).toFixed(1)
            : +(logic.principles.reduce((s, p) => s + p.weight, 0) / logic.principles.length).toFixed(1);

        return {
            success:        true,
            logicId,
            nameAr:         logic.nameAr,
            query:          query || '(عام)',
            relevantPrinciples: relevant.length > 0 ? relevant : logic.principles,
            alignmentScore: score,
            maxScore:       10,
            alignmentLevel: score >= 9 ? 'ممتاز' : score >= 7 ? 'جيد جداً' : score >= 5 ? 'جيد' : 'يحتاج مراجعة',
            recommendation: score >= 8 ? 'متوافق مع منطق شيخة' : 'يُوصى بمراجعة المبادئ المعنية',
        };
    }

    // ── ملخص الوضع الكامل للمحرك ─────────────────────────────────────────────
    getDashboard() {
        const logics = this.listLogics();
        return {
            engine:      this.nameAr,
            version:     this.version,
            governor:    this.governor,
            activeIn:    this.activeIn,
            activatedAt: this.activatedAt,
            totalLogics: logics.length,
            totalPrinciples: logics.reduce((s, l) => s + l.principleCount, 0),
            logics,
            hierarchy: {
                level0: { name: 'شيخة (الحاكم)',       systems: ['المنطق السباعي الكامل'] },
                level1: { name: 'منظمة شيخة',         systems: ['تنظيمي','تشريعي','علمي','بحثي','تقني','تكنولوجي'] },
                level2: { name: 'سوق شيخة',           systems: ['تجاري','تقني','تكنولوجي'] },
                level3: { name: 'شيخة كوبايلوت',      systems: ['تقني','تكنولوجي'], parent: 'شيخة' },
            },
            message: 'محرك المنطق السباعي مفعّل — شيخة الحاكم | «وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ»',
        };
    }

    // ── تقييم متعدد المنطق (cross-logic) ─────────────────────────────────────
    crossEvaluate(query) {
        const results = [];
        for (const [id] of this._logics) {
            results.push(this.evaluate(id, query));
        }
        const avg = +(results.reduce((s, r) => s + r.alignmentScore, 0) / results.length).toFixed(1);
        return {
            success:         true,
            query:           query || '(عام)',
            overallAlignment: avg,
            overallLevel:    avg >= 9 ? 'ممتاز' : avg >= 7 ? 'جيد جداً' : avg >= 5 ? 'جيد' : 'يحتاج مراجعة',
            perLogic:        results,
            timestamp:       new Date().toISOString(),
        };
    }

    // ── الحصول على المنطق التنفيذي بكامل تفاصيله ─────────────────────────────
    getExecutiveLogicFull() {
        const logic = this._logics.get('executive');
        if (!logic) return null;
        return {
            success:   true,
            tier:      'WORLD_CLASS',
            logic,
            summary: {
                principleCount: logic.principles.length,
                avgWeight:      +(logic.principles.reduce((s, p) => s + p.weight, 0) / logic.principles.length).toFixed(2),
                modelStages:    logic.executionModel.stages.length,
                goldenRules:    logic.goldenRules.length,
                kpiCount:       logic.deliveryMetrics.length,
                blockerLevels:  logic.blockerProtocol.levels.length,
                cadenceItems:   Object.keys(logic.executionCadence).length,
                toolCategories: Object.keys(logic.toolStack).length,
            },
            message: 'المنطق التنفيذي — الأفضل عالمياً | نظام شيخة للتنفيذ المتكامل',
            timestamp: new Date().toISOString(),
        };
    }

    // ── تقييم مهمة بالمنطق التنفيذي ──────────────────────────────────────────
    evaluateTask(taskObj) {
        const logic = this._logics.get('executive');
        const task  = taskObj || {};
        const issues   = [];
        const strengths= [];

        if (!task.owner)       issues.push('⚠️ لا يوجد مالك واضح للمهمة (يخالف القاعدة الذهبية #1)');
        else                   strengths.push(`✅ المالك محدد: ${task.owner}`);

        if (!task.deadline)    issues.push('⚠️ لا يوجد موعد نهائي محدد');
        else                   strengths.push(`✅ الموعد النهائي محدد: ${task.deadline}`);

        if (!task.successCriteria && !task.kpis)
            issues.push('⚠️ لا توجد معايير نجاح أو KPIs — القياس يسبق الحكم دائماً');
        else
            strengths.push('✅ معايير النجاح محددة');

        const priorityScore = task.priorityScore || 0;
        const priorityTier  = logic.prioritizationEngine.tiers.find(t => {
            const [min, max] = t.score.replace('≥','').replace('<','').split('-').map(Number);
            return isNaN(max) ? priorityScore >= min : (priorityScore >= min && priorityScore <= max);
        });

        const doneChecks = task.type === 'software'
            ? logic.definitionOfDone.software
            : logic.definitionOfDone.businessFeature;

        return {
            success:        true,
            task,
            readinessScore: Math.max(0, 10 - issues.length * 2),
            issues,
            strengths,
            recommendedPriority: priorityTier ? priorityTier.name : 'قيّم الأولوية باستخدام ICE-S',
            suggestedBlockerLevel: issues.length >= 3 ? 'L2 — عالٍ' : issues.length >= 1 ? 'L3 — متوسط' : 'لا عقبات',
            definitionOfDoneChecklist: doneChecks,
            applicableGoldenRules: logic.goldenRules.filter((_, i) => i < 5),
            message: issues.length === 0
                ? '✅ المهمة جاهزة للتنفيذ وفق المنطق التنفيذي الأفضل'
                : `⚠️ ${issues.length} ملاحظة يجب معالجتها قبل التنفيذ`,
            timestamp: new Date().toISOString(),
        };
    }
}

module.exports = SevenLogicsEngine;
