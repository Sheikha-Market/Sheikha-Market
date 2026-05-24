/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * محرك لوحات التحكم الشامل — Sheikha Dashboards Engine v1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * «التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ»
 *
 * منظومة لوحات تحكم لـ:
 *   1. الإدارة العليا (Admin)
 *   2. الدولة والحكومة
 *   3. الجهات الحكومية والمشاريع الحكومية
 *   4. الشركات الحكومية وشبه الحكومية
 *   5. التجار: شركات | مؤسسات | وساطة/سمسرة | رواد أعمال
 *   6. النطاق: السعودية | جزيرة العرب | العالم
 *
 * الملكية الفكرية: سلمان أحمد بن سلمان الراجح — © 2026
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

module.exports = function(app, ctx) {
const { USERS, TRADERS, LISTINGS, ORDERS, CONTAINERS } = ctx;

// ═══════════════════════════════════════════════════════════════════════════════
// تعريف أدوار لوحات التحكم
// ═══════════════════════════════════════════════════════════════════════════════

const DASHBOARD_ROLES = {
    // ═══ ١. الإدارة العليا ═══
    admin: {
        id: 'admin',
        ar: 'لوحة تحكم الإدارة العليا',
        en: 'Super Admin Dashboard',
        icon: '🔐',
        access_level: 100,
        description: 'تحكم كامل في المنظومة — جميع الصلاحيات',
        sections: [
            { id:'overview',       ar:'نظرة عامة شاملة',     icon:'📊', widgets:['totalUsers','totalTraders','totalListings','totalOrders','totalRevenue','activeContracts','systemHealth','aiAgents'] },
            { id:'users',          ar:'إدارة المستخدمين',     icon:'👥', widgets:['usersList','userRoles','userActivity','registrationTrend','geoDistribution'] },
            { id:'market',         ar:'إدارة السوق',         icon:'🏪', widgets:['listings','priceIndex','supplyDemand','categories','topProducts','tradingVolume'] },
            { id:'finance',        ar:'المالية والمحاسبة',    icon:'💰', widgets:['revenue','expenses','profit','transactions','zakatCalculation','financialStatements'] },
            { id:'supply_chain',   ar:'سلاسل الإمداد',       icon:'🔗', widgets:['chainMap','stageDistribution','bottlenecks','throughput','iotSensors'] },
            { id:'logistics',      ar:'اللوجستيات',          icon:'🚛', widgets:['shipments','fleet','ports','customs','deliveryRate','costs'] },
            { id:'quality',        ar:'الجودة والتقييم',      icon:'⭐', widgets:['merchantRatings','productQuality','complaints','disputes','trustScores'] },
            { id:'marketing',      ar:'التسويق',            icon:'📢', widgets:['campaigns','leads','funnel','channelPerf','content','roi'] },
            { id:'ai_agents',      ar:'وكلاء الذكاء',        icon:'🤖', widgets:['agentStatus','predictions','automations','insights','alerts'] },
            { id:'blockchain',     ar:'سلسلة الكتلة',        icon:'⛓', widgets:['chains','blocks','transactions','verification','audit'] },
            { id:'green',          ar:'الاقتصاد الدائري',     icon:'♻️', widgets:['carbonFootprint','recyclingRate','greenContracts','sustainability'] },
            { id:'security',       ar:'الأمن والامتثال',      icon:'🛡', widgets:['securityAlerts','accessLogs','shariaCompliance','riskMatrix'] },
            { id:'reports',        ar:'التقارير',            icon:'📈', widgets:['dailyReport','weeklyReport','monthlyReport','customReport','exportData'] },
            { id:'settings',       ar:'إعدادات المنظومة',     icon:'⚙️', widgets:['systemConfig','apiKeys','integrations','maintenance','backups'] },
        ],
    },

    // ═══ ٢. لوحة تحكم الدولة ═══
    state: {
        id: 'state',
        ar: 'لوحة تحكم الدولة',
        en: 'State/National Dashboard',
        icon: '🏛',
        access_level: 90,
        description: 'رؤية شاملة لقطاع المعادن على المستوى الوطني',
        sections: [
            { id:'national_overview', ar:'المؤشرات الوطنية',       icon:'🇸🇦', widgets:['gdpContribution','employmentRate','importExport','mineralReserves','miningLicenses','productionVolume'] },
            { id:'vision2030',        ar:'رؤية 2030',             icon:'🎯', widgets:['miningTargets','localization','saudiContent','privatization','exports','sustainability'] },
            { id:'regulatory',        ar:'التنظيم والرقابة',       icon:'⚖️', widgets:['licenses','inspections','violations','standards','compliance','penalties'] },
            { id:'infrastructure',    ar:'البنية التحتية',         icon:'🏗', widgets:['ports','railways','roads','industrialCities','miningZones','logistics'] },
            { id:'investment',        ar:'الاستثمار',              icon:'💎', widgets:['fdi','localInvestment','projectPipeline','roi','incentives','zones'] },
            { id:'trade_balance',     ar:'الميزان التجاري',        icon:'⚖️', widgets:['exports','imports','balance','partners','treaties','tariffs'] },
            { id:'environment',       ar:'البيئة والاستدامة',      icon:'🌿', widgets:['emissions','recycling','waterUsage','wasteManagement','esg','greenProjects'] },
            { id:'workforce',         ar:'القوى العاملة',         icon:'👷', widgets:['totalWorkers','saudization','training','safety','accidents','productivity'] },
            { id:'intelligence',      ar:'الاستخبارات السوقية',    icon:'🧠', widgets:['globalTrends','priceForecasts','supplyRisks','geopolitical','technology','competition'] },
        ],
    },

    // ═══ ٣. لوحة تحكم الجهات الحكومية ═══
    gov_entity: {
        id: 'gov_entity',
        ar: 'لوحة تحكم الجهة الحكومية',
        en: 'Government Entity Dashboard',
        icon: '🏢',
        access_level: 80,
        description: 'إدارة مشتريات ومشاريع الجهة الحكومية',
        entities: [
            { id:'mim',   ar:'وزارة الصناعة والثروة المعدنية', focus:'تراخيص، تعدين، مصانع' },
            { id:'momra', ar:'وزارة الشؤون البلدية',          focus:'هدم، سكراب بناء، نظافة' },
            { id:'mod',   ar:'وزارة الدفاع',                 focus:'سكراب عسكري، معادن دفاعية' },
            { id:'moe',   ar:'وزارة الطاقة',                 focus:'معادن الطاقة، بطاريات، ليثيوم' },
            { id:'rcjy',  ar:'الهيئة الملكية للجبيل وينبع',    focus:'مدن صناعية، صناعات تحويلية' },
            { id:'modon', ar:'هيئة المدن الصناعية (موقي)',     focus:'مصانع، بنية تحتية صناعية' },
            { id:'sgs',   ar:'هيئة المساحة الجيولوجية',       focus:'تنقيب، خرائط جيولوجية' },
            { id:'nidlp', ar:'برنامج تطوير الصناعة واللوجستيات', focus:'لوجستيات، صناعة، محتوى محلي' },
        ],
        sections: [
            { id:'entity_overview',  ar:'نظرة عامة',             icon:'📊', widgets:['budget','spending','projects','contracts','suppliers','compliance'] },
            { id:'procurement',      ar:'المشتريات',             icon:'🛒', widgets:['activeRfqs','pendingOrders','approvals','suppliers','priceComparison','budgetUtilization'] },
            { id:'projects',         ar:'المشاريع',              icon:'📋', widgets:['activeProjects','timeline','milestones','budget','contractors','progress'] },
            { id:'tenders',          ar:'المناقصات',             icon:'📢', widgets:['openTenders','bids','evaluation','awards','contracts','performance'] },
            { id:'suppliers',        ar:'الموردون',              icon:'🏭', widgets:['approvedSuppliers','evaluation','blacklist','newRegistrations','categories'] },
            { id:'quality',          ar:'الجودة والمواصفات',      icon:'✅', widgets:['inspections','certifications','nonConformance','corrective','audit'] },
            { id:'contracts',        ar:'العقود',                icon:'📜', widgets:['activeContracts','expiring','amendments','disputes','payments'] },
            { id:'reports',          ar:'التقارير',              icon:'📈', widgets:['monthlyReport','quarterlyReport','annualReport','audit','kpis'] },
        ],
    },

    // ═══ ٤. لوحة تحكم الشركات الحكومية وشبه الحكومية ═══
    gov_company: {
        id: 'gov_company',
        ar: 'لوحة تحكم الشركة الحكومية',
        en: 'Government Company Dashboard',
        icon: '🏛',
        access_level: 75,
        description: 'إدارة شركة حكومية أو شبه حكومية',
        companies: [
            { id:'maaden',     ar:'شركة التعدين العربية السعودية (معادن)',   type:'حكومي',      sector:'تعدين' },
            { id:'sabic',      ar:'سابك',                                   type:'شبه حكومي',  sector:'بتروكيماويات' },
            { id:'aramco',     ar:'أرامكو السعودية',                         type:'حكومي',      sector:'نفط وغاز' },
            { id:'pif',        ar:'صندوق الاستثمارات العامة',                 type:'حكومي',      sector:'استثمار' },
            { id:'rcdc',       ar:'الهيئة الملكية',                          type:'حكومي',      sector:'مدن صناعية' },
            { id:'nwc',        ar:'شركة المياه الوطنية',                     type:'حكومي',      sector:'مياه' },
            { id:'sec',        ar:'الشركة السعودية للكهرباء',                type:'شبه حكومي',  sector:'كهرباء' },
            { id:'saudia',     ar:'الخطوط السعودية',                         type:'حكومي',      sector:'طيران' },
            { id:'sar',        ar:'سار (الخطوط الحديدية)',                   type:'حكومي',      sector:'نقل' },
            { id:'rsgt',       ar:'بوابة البحر الأحمر',                      type:'شبه حكومي',  sector:'موانئ' },
        ],
        sections: [
            { id:'company_overview', ar:'نظرة عامة',          icon:'📊', widgets:['revenue','profit','production','employees','projects','marketShare'] },
            { id:'operations',       ar:'العمليات',            icon:'🏭', widgets:['productionRate','efficiency','downtime','quality','safety','utilization'] },
            { id:'procurement',      ar:'المشتريات والتوريد',  icon:'🛒', widgets:['purchaseOrders','suppliers','inventory','costs','leadTime','localContent'] },
            { id:'sales',            ar:'المبيعات والتصدير',   icon:'💰', widgets:['salesVolume','customers','exports','pricing','contracts','forecast'] },
            { id:'supply_chain',     ar:'سلسلة الإمداد',       icon:'🔗', widgets:['supplyMap','inventory','logistics','tracking','partners','risks'] },
            { id:'finance',          ar:'المالية',             icon:'💵', widgets:['cashFlow','budget','expenses','receivables','payables','ratios'] },
            { id:'hr',               ar:'الموارد البشرية',     icon:'👥', widgets:['headcount','saudization','training','performance','retention'] },
            { id:'compliance',       ar:'الحوكمة والامتثال',    icon:'⚖️', widgets:['governance','audit','risk','regulatory','esg','ethics'] },
        ],
    },

    // ═══ ٥. لوحة تحكم التاجر — شركة ═══
    trader_company: {
        id: 'trader_company',
        ar: 'لوحة تحكم الشركة',
        en: 'Company Dashboard',
        icon: '🏢',
        access_level: 50,
        description: 'لوحة تحكم شركة تجارية خاصة',
        sections: [
            { id:'company_overview', ar:'نظرة عامة',         icon:'📊', widgets:['sales','purchases','profit','listings','trustScore','orders'] },
            { id:'products',         ar:'المنتجات',           icon:'📦', widgets:['myListings','addProduct','inventory','pricing','categories','quality'] },
            { id:'sales',            ar:'المبيعات',           icon:'💰', widgets:['salesDashboard','orders','invoices','customers','receivables'] },
            { id:'procurement',      ar:'المشتريات',          icon:'🛒', widgets:['purchaseOrders','rfqs','suppliers','comparisons','payables'] },
            { id:'contracts',        ar:'العقود',             icon:'📜', widgets:['activeContracts','draft','expiring','templates','disputes'] },
            { id:'logistics',        ar:'اللوجستيات',         icon:'🚛', widgets:['shipments','tracking','fleet','containers','costs'] },
            { id:'finance',          ar:'المالية',            icon:'💵', widgets:['cashFlow','profitLoss','balance','zakat','taxReport'] },
            { id:'marketing',        ar:'التسويق',            icon:'📢', widgets:['campaigns','analytics','competitors','leads','social'] },
            { id:'hr',               ar:'الفريق',             icon:'👥', widgets:['employees','roles','permissions','attendance'] },
            { id:'trust',            ar:'الثقة والتقييم',      icon:'⭐', widgets:['trustScore','reviews','complaints','badges','history'] },
        ],
    },

    // ═══ ٦. لوحة تحكم التاجر — مؤسسة ═══
    trader_establishment: {
        id: 'trader_establishment',
        ar: 'لوحة تحكم المؤسسة',
        en: 'Establishment Dashboard',
        icon: '🏬',
        access_level: 40,
        description: 'لوحة تحكم مؤسسة فردية',
        sections: [
            { id:'overview',    ar:'نظرة عامة',     icon:'📊', widgets:['sales','purchases','profit','listings','trustScore'] },
            { id:'products',    ar:'المنتجات',       icon:'📦', widgets:['myListings','addProduct','pricing','quality'] },
            { id:'sales',       ar:'المبيعات',       icon:'💰', widgets:['orders','invoices','customers'] },
            { id:'buy',         ar:'الشراء',         icon:'🛒', widgets:['rfqs','purchases','suppliers'] },
            { id:'contracts',   ar:'العقود',         icon:'📜', widgets:['activeContracts','templates'] },
            { id:'logistics',   ar:'الشحن والنقل',    icon:'🚛', widgets:['shipments','tracking','costs'] },
            { id:'finance',     ar:'المالية',        icon:'💵', widgets:['cashFlow','profitLoss','zakat'] },
            { id:'trust',       ar:'التقييم',        icon:'⭐', widgets:['trustScore','reviews','badges'] },
        ],
    },

    // ═══ ٧. لوحة تحكم التاجر — وساطة/سمسرة ═══
    trader_broker: {
        id: 'trader_broker',
        ar: 'لوحة تحكم الوسيط',
        en: 'Broker Dashboard',
        icon: '🤝',
        access_level: 40,
        description: 'لوحة تحكم وسيط/سمسار معادن',
        sections: [
            { id:'overview',    ar:'نظرة عامة',       icon:'📊', widgets:['deals','commission','activeBuyers','activeSellers','trustScore'] },
            { id:'deals',       ar:'الصفقات',         icon:'🤝', widgets:['pendingDeals','closedDeals','pipeline','matchmaking'] },
            { id:'buyers',      ar:'المشترون',        icon:'🛒', widgets:['buyersList','buyerNeeds','rfqs','matching'] },
            { id:'sellers',     ar:'البائعون',        icon:'💰', widgets:['sellersList','inventory','offers','matching'] },
            { id:'market',      ar:'معلومات السوق',    icon:'📈', widgets:['prices','trends','opportunities','alerts'] },
            { id:'contracts',   ar:'العقود',           icon:'📜', widgets:['brokerageContracts','commissions','disputes'] },
            { id:'network',     ar:'شبكة العلاقات',    icon:'🌐', widgets:['contacts','referrals','partnerships'] },
            { id:'trust',       ar:'الثقة والسمعة',    icon:'⭐', widgets:['trustScore','reviews','dealHistory','badges'] },
        ],
    },

    // ═══ ٨. لوحة تحكم رائد الأعمال ═══
    entrepreneur: {
        id: 'entrepreneur',
        ar: 'لوحة تحكم رائد الأعمال',
        en: 'Entrepreneur Dashboard',
        icon: '🚀',
        access_level: 35,
        description: 'لوحة تحكم لرواد الأعمال والمبتدئين في قطاع المعادن',
        sections: [
            { id:'overview',      ar:'نظرة عامة',         icon:'📊', widgets:['progress','opportunities','learning','trustScore'] },
            { id:'opportunities', ar:'الفرص',              icon:'💡', widgets:['gapAnalysis','trending','lowCompetition','govTenders'] },
            { id:'learning',      ar:'التعلم',             icon:'📚', widgets:['courses','guides','mentors','community'] },
            { id:'business_plan', ar:'خطة العمل',          icon:'📋', widgets:['canvas','feasibility','financial','swot'] },
            { id:'products',      ar:'منتجاتي',           icon:'📦', widgets:['myListings','addProduct','pricing'] },
            { id:'funding',       ar:'التمويل',            icon:'💰', widgets:['islamicFinance','grants','investors','crowdfunding'] },
            { id:'network',       ar:'الشبكة',             icon:'🌐', widgets:['mentors','partners','community','events'] },
            { id:'tools',         ar:'الأدوات',            icon:'🛠', widgets:['marketing','accounting','legal','design'] },
        ],
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// النطاقات الجغرافية
// ═══════════════════════════════════════════════════════════════════════════════

const GEO_SCOPES = {
    saudi: {
        ar: 'المملكة العربية السعودية',
        regions: [
            { id:'riyadh',   ar:'الرياض',     cities:['الرياض','الخرج','الدوادمي'] },
            { id:'makkah',   ar:'مكة المكرمة', cities:['جدة','مكة','الطائف'] },
            { id:'madinah',  ar:'المدينة',     cities:['المدينة','ينبع'] },
            { id:'eastern',  ar:'الشرقية',     cities:['الدمام','الجبيل','الأحساء','رأس الخير'] },
            { id:'qassim',   ar:'القصيم',      cities:['بريدة','عنيزة'] },
            { id:'asir',     ar:'عسير',        cities:['أبها','خميس مشيط'] },
            { id:'tabuk',    ar:'تبوك',        cities:['تبوك','نيوم'] },
            { id:'hail',     ar:'حائل',        cities:['حائل'] },
            { id:'jazan',    ar:'جازان',       cities:['جازان'] },
            { id:'najran',   ar:'نجران',       cities:['نجران'] },
            { id:'baha',     ar:'الباحة',      cities:['الباحة'] },
            { id:'jouf',     ar:'الجوف',       cities:['سكاكا'] },
            { id:'borders',  ar:'الحدود الشمالية', cities:['عرعر'] },
        ],
    },
    arabian_peninsula: {
        ar: 'جزيرة العرب',
        countries: [
            { id:'sa', ar:'السعودية',    flag:'🇸🇦', metals_focus:'تعدين، ألمنيوم، فوسفات، ذهب' },
            { id:'ae', ar:'الإمارات',    flag:'🇦🇪', metals_focus:'ألمنيوم، صلب، إعادة تدوير' },
            { id:'om', ar:'عُمان',       flag:'🇴🇲', metals_focus:'نحاس، كروم، تعدين' },
            { id:'kw', ar:'الكويت',      flag:'🇰🇼', metals_focus:'سكراب، صلب، ألمنيوم' },
            { id:'bh', ar:'البحرين',     flag:'🇧🇭', metals_focus:'ألمنيوم (ألبا)، سكراب' },
            { id:'qa', ar:'قطر',         flag:'🇶🇦', metals_focus:'صلب، ألمنيوم، بناء' },
            { id:'ye', ar:'اليمن',       flag:'🇾🇪', metals_focus:'خامات، تعدين تقليدي' },
        ],
    },
    international: {
        ar: 'العالم',
        regions: [
            { id:'asia',     ar:'آسيا',       key_countries:['الصين','الهند','اليابان','كوريا','تركيا'], focus:'أكبر مستهلك ومنتج' },
            { id:'europe',   ar:'أوروبا',     key_countries:['ألمانيا','بريطانيا','إيطاليا','فرنسا'],    focus:'تكنولوجيا وإعادة تدوير' },
            { id:'americas', ar:'الأمريكتان',  key_countries:['أمريكا','كندا','البرازيل','تشيلي'],       focus:'تعدين ونحاس وليثيوم' },
            { id:'africa',   ar:'أفريقيا',     key_countries:['جنوب أفريقيا','غانا','الكونغو'],         focus:'ذهب، بلاتين، كوبالت' },
            { id:'oceania',  ar:'أوقيانوسيا',  key_countries:['أستراليا','نيوزيلندا'],                  focus:'حديد خام، بوكسيت' },
        ],
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// الجهات الحكومية السعودية المرتبطة بالمعادن
// ═══════════════════════════════════════════════════════════════════════════════

const GOV_ENTITIES_SA = [
    { id:'mim',     ar:'وزارة الصناعة والثروة المعدنية',       url:'https://mim.gov.sa',     role:'تنظيم وترخيص التعدين والصناعة' },
    { id:'modon',   ar:'هيئة المدن الصناعية (موقي)',            url:'https://modon.gov.sa',   role:'المدن والمناطق الصناعية' },
    { id:'rcjy',    ar:'الهيئة الملكية للجبيل وينبع',           url:'https://rcjy.gov.sa',    role:'مدن صناعية متخصصة' },
    { id:'sgs',     ar:'هيئة المساحة الجيولوجية',               url:'https://sgs.gov.sa',     role:'المسح الجيولوجي والتنقيب' },
    { id:'nidlp',   ar:'برنامج تطوير الصناعة واللوجستيات',       url:'https://nidlp.gov.sa',   role:'استراتيجية الصناعة واللوجستيات' },
    { id:'etimad',  ar:'منصة اعتماد',                          url:'https://etimad.sa',      role:'المشتريات والمناقصات الحكومية' },
    { id:'zatca',   ar:'هيئة الزكاة والضريبة والجمارك',         url:'https://zatca.gov.sa',   role:'الجمارك والتعريفة والتصنيف' },
    { id:'gea',     ar:'الهيئة العامة للترفيه',                  url:'https://gea.gov.sa',     role:'فعاليات ومعارض' },
    { id:'tga',     ar:'الهيئة العامة للنقل',                    url:'https://tga.gov.sa',     role:'تنظيم النقل واللوجستيات' },
    { id:'mhrsd',   ar:'وزارة الموارد البشرية',                  url:'https://hrsd.gov.sa',    role:'التوظيف والسعودة' },
    { id:'mci',     ar:'وزارة التجارة',                         url:'https://mc.gov.sa',      role:'السجل التجاري والتنظيم' },
    { id:'cma',     ar:'هيئة السوق المالية',                     url:'https://cma.org.sa',     role:'الأسواق المالية والاستثمار' },
    { id:'pif',     ar:'صندوق الاستثمارات العامة',               url:'https://pif.gov.sa',     role:'الاستثمار الاستراتيجي' },
    { id:'neom',    ar:'نيوم',                                  url:'https://neom.com',       role:'مشاريع مستقبلية — معادن ومواد متقدمة' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// واجهات API
// ═══════════════════════════════════════════════════════════════════════════════

// ─── قائمة جميع أنواع لوحات التحكم ───
app.get('/api/dashboards/roles', (req, res) => {
    const roles = Object.values(DASHBOARD_ROLES).map(r => ({
        id: r.id, ar: r.ar, en: r.en, icon: r.icon, access_level: r.access_level,
        description: r.description,
        sectionCount: r.sections.length,
    }));
    res.json({
        success: true,
        roles,
        totalRoles: roles.length,
        geoScopes: {
            saudi: GEO_SCOPES.saudi.ar + ' — ' + GEO_SCOPES.saudi.regions.length + ' منطقة',
            peninsula: GEO_SCOPES.arabian_peninsula.ar + ' — ' + GEO_SCOPES.arabian_peninsula.countries.length + ' دولة',
            international: GEO_SCOPES.international.ar + ' — ' + GEO_SCOPES.international.regions.length + ' قارة',
        },
    });
});

// ─── لوحة تحكم حسب الدور ───
app.get('/api/dashboards/:roleId', (req, res) => {
    const role = DASHBOARD_ROLES[req.params.roleId];
    if (!role) return res.status(404).json({ success: false, message: 'نوع لوحة التحكم غير موجود', available: Object.keys(DASHBOARD_ROLES) });

    const activeListings = LISTINGS.filter(l => l.status !== 'deleted');
    const liveStats = {
        totalUsers: USERS.length,
        totalTraders: TRADERS.length,
        totalListings: activeListings.length,
        totalOrders: (ORDERS || []).length,
        totalContainers: (CONTAINERS || []).length,
    };

    res.json({
        success: true,
        dashboard: {
            ...role,
            liveStats,
            entities: role.entities || undefined,
            companies: role.companies || undefined,
        },
    });
});

// ─── النطاقات الجغرافية ───
app.get('/api/dashboards/geo/saudi', (req, res) => {
    const activeListings = LISTINGS.filter(l => l.status !== 'deleted');
    const byRegion = {};
    activeListings.forEach(l => {
        const r = l.storeRegion || 'غير محدد';
        byRegion[r] = (byRegion[r] || 0) + 1;
    });
    res.json({ success: true, saudi: GEO_SCOPES.saudi, listingsByRegion: byRegion });
});

app.get('/api/dashboards/geo/peninsula', (req, res) => {
    res.json({ success: true, peninsula: GEO_SCOPES.arabian_peninsula });
});

app.get('/api/dashboards/geo/international', (req, res) => {
    res.json({ success: true, international: GEO_SCOPES.international });
});

// ─── الجهات الحكومية ───
app.get('/api/dashboards/gov/entities', (req, res) => {
    res.json({ success: true, entities: GOV_ENTITIES_SA, totalEntities: GOV_ENTITIES_SA.length });
});

// ─── الشركات الحكومية وشبه الحكومية ───
app.get('/api/dashboards/gov/companies', (req, res) => {
    res.json({ success: true, companies: DASHBOARD_ROLES.gov_company.companies });
});

// ─── لوحة الإدارة الشاملة مع بيانات حية ───
app.get('/api/dashboards/admin/live', (req, res) => {
    const activeListings = LISTINGS.filter(l => l.status !== 'deleted');
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const todayListings = activeListings.filter(l => l.createdAt && l.createdAt.startsWith(today));
    const todayUsers = USERS.filter(u => u.createdAt && u.createdAt.startsWith(today));

    // توزيع حسب الفئة
    const byCategory = {};
    activeListings.forEach(l => {
        const cat = l.categoryName || l.category || 'أخرى';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    // توزيع حسب المنطقة
    const byRegion = {};
    activeListings.forEach(l => {
        const r = l.storeRegion || 'غير محدد';
        byRegion[r] = (byRegion[r] || 0) + 1;
    });

    // توزيع التجار حسب التخصص
    const tradersBySpec = {};
    TRADERS.forEach(t => {
        const s = t.specialty || 'عام';
        tradersBySpec[s] = (tradersBySpec[s] || 0) + 1;
    });

    // حجم التداول
    const totalValue = activeListings.reduce((s, l) => s + ((Number(l.price) || 0) * (Number(l.quantity) || 1)), 0);

    res.json({
        success: true,
        adminDashboard: {
            overview: {
                totalUsers: USERS.length,
                totalTraders: TRADERS.length,
                totalListings: activeListings.length,
                totalOrders: (ORDERS || []).length,
                totalContainers: (CONTAINERS || []).length,
                totalValue: Math.round(totalValue),
                todayNewListings: todayListings.length,
                todayNewUsers: todayUsers.length,
            },
            distributions: { byCategory, byRegion, tradersBySpec },
            systemModules: {
                engines: 130,
                apis: '200+',
                aiAgents: 10,
                blockchainChains: 5,
                ports: 6,
                studyTypes: 7,
                loyaltyTiers: 5,
            },
            dashboardRoles: Object.keys(DASHBOARD_ROLES).length,
            govEntities: GOV_ENTITIES_SA.length,
            geoScopes: {
                saudiRegions: GEO_SCOPES.saudi.regions.length,
                peninsulaCountries: GEO_SCOPES.arabian_peninsula.countries.length,
                internationalRegions: GEO_SCOPES.international.regions.length,
            },
            timestamp: now.toISOString(),
        },
        quran: '﴿ إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا ﴾ — النساء: ٥٨',
    });
});

console.log('✅ [Dashboards] محرك لوحات التحكم الشامل — مفعّل');
console.log('   📊 أنواع اللوحات: ' + Object.keys(DASHBOARD_ROLES).length + ' لوحة');
console.log('   🏛  الجهات الحكومية: ' + GOV_ENTITIES_SA.length + ' جهة');
console.log('   🗺  النطاقات: السعودية (' + GEO_SCOPES.saudi.regions.length + ' منطقة) | جزيرة العرب (' + GEO_SCOPES.arabian_peninsula.countries.length + ' دولة) | العالم (' + GEO_SCOPES.international.regions.length + ' قارة)');
console.log('   📡 APIs: /api/dashboards/roles, /api/dashboards/:roleId, /api/dashboards/geo/*, /api/dashboards/gov/*, /api/dashboards/admin/live');

};
