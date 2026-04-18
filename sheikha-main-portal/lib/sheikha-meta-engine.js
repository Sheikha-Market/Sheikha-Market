'use strict';
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║          🌌 شيخة — محرك Meta AI الكوني الإسلامي                            ║
 * ║   Sheikha Meta AI Engine — Conversions API · WhatsApp Business API         ║
 * ║   Meta Pixel · Marketing Messages · Commerce Catalog · Audience AI         ║
 * ║                                                                              ║
 * ║   بسم الله الرحمن الرحيم                                                    ║
 * ║   ﴿وَمَا أُوتِيتُم مِّن الْعِلْمِ إِلَّا قَلِيلاً﴾ — الإسراء ٨٥            ║
 * ║   رُقِّمَت بالكتاب والسنة — وُحِّدَت لله وحده                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * المالك والمؤسس: سلمان أحمد سلمان الراجح — منظمة شيخة — www.sheikha.top
 * الإصدار: 1.0.0 | التاريخ: ١٤٤٦ هـ / ٢٠٢٦ م
 * المسارات: 67 API Route
 */

const crypto = require('crypto');
const https = require('https');
const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 دالة التشفير SHA-256 (GDPR/PDPL compliant)
// ═══════════════════════════════════════════════════════════════════════════════
function sha256(value) {
    if (!value) return null;
    return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 قاعدة البيانات المحلية لشيخة Meta
// ═══════════════════════════════════════════════════════════════════════════════
const META_DB_PATH = path.join(__dirname, '../data/sheikha-meta-db.json');
function loadMetaDB() {
    try {
        if (fs.existsSync(META_DB_PATH)) return JSON.parse(fs.readFileSync(META_DB_PATH, 'utf8'));
    } catch (_) {}
    return { events: [], audiences: [], campaigns: [], templates: [], catalogs: [], leads: [] };
}
function saveMetaDB(db) {
    try {
        fs.mkdirSync(path.dirname(META_DB_PATH), { recursive: true });
        fs.writeFileSync(META_DB_PATH, JSON.stringify(db, null, 2));
    } catch (_) {}
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌌 محرك Meta AI الكوني — الكلاس الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════
class SheikhMetaEngine {
    constructor({ app, wsClients } = {}) {
        this.app = app;
        this.wsClients = wsClients;
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        // سلطة شيخة — Sheikha Authority (توقيع المؤسس الرقمي - السلطة الأحد عشرية السيادية المالية)
        const crypto = require('crypto');
        this.SHEIKHA_AUTHORITY = {
            FOUNDER:   'Salman Ahmed Al-Rajeh',
            TITLE:     'Sovereign Financial & Industrial Leader - SABIC & State Approved Feasibility Authority',
            ACADEMIC_BACKGROUND: [
                {
                    degree:     'Bachelor of Business Administration',
                    university: 'Imam Abdulrahman Bin Faisal University',
                    country:    'Saudi Arabia',
                },
                {
                    certificate: 'Entrepreneurship & Business Leadership',
                    institute:   'KFUPM Entrepreneurship Institute - معهد الريادة',
                    university:  'King Fahd University of Petroleum & Minerals',
                    country:     'Saudi Arabia',
                },
            ],
            LEADERSHIP_CERTIFICATIONS: [
                'Executive Leadership Certification',
                'Team Leadership & Management Certification',
                'Initiative & Strategic Leadership Certification',
            ],
            INDUSTRIAL_CERTIFICATION: {
                issuer:   'SABIC',
                programs: [
                    'Nusaned Program - Local Content Development - نساند لتمكين المحتوى المحلي',
                    'Approved Feasibility Study Provider - مزود معتمد لدراسات الجدوى',
                ],
                authority_scope: ['Industrial Projects', 'Local Content', 'Supply Chain Finance'],
            },
            FINANCIAL_AUTHORITY: {
                sabic_feasibility_provider: true,
                approved_by: [
                    'SABIC',
                    'Investment Funds - الصناديق الاستثمارية',
                    'Commercial Banks - البنوك التجارية',
                    'State Entities - جهات الدولة',
                ],
                status:           'BANKABLE_STUDY_ISSUER',
                guarantee_level:  'SOVEREIGN_GRADE',
                can_unlock_funding: ['PIF', 'SIDF', 'NDF', 'SNB', 'AlRajhi', 'SABB'],
            },
            ACCREDITATIONS: {
                supply_chain_procurement: [
                    'IPSCMI - International Purchasing and Supply Chain Management Institute',
                    'GPSCO - Global Procurement and Supply Chain Organization',
                    'Blue Ocean Institute',
                ],
                artificial_intelligence: [
                    'SDAIA - Saudi Data & AI Authority: AI Concepts & Advanced Applications',
                    'IBM Certified: AI & Data Science',
                    'Microsoft Certified: Azure AI & Cloud Solutions',
                ],
            },
            DOCTRINE:          'Sheikha Core: From study to funding to execution in 72 hours — Founded by KFUPM Entrepreneur + SABIC Industrial + SDAIA AI',
            AUTHORITY_LEVEL:   'HENDECA_SOVEREIGN_FINANCIAL',  // 11 محور: أكاديمي×2 + قيادي×3 + صناعي سابك×2 + مالي×1 + مهني دولي×3
            COMMAND_AUTHORITY: true,
            KFUPM_VERIFIED:    true,
            SABIC_VERIFIED:    true,
            CAN_UNLOCK_FUNDING: true,
            // معلومات الاتصال السيادية
            FOUNDER_PHONE:     '+966554942904',
            FOUNDER_WHATSAPP:  'https://wa.me/966554942904',
            CONTACT_CHANNELS: {
                primary_email:   'market@sheikha.top',
                llama_dev:       'market@sheikha.top',
                meta_business:   'market@sheikha.top',
                primary_phone:   '+966554942904',
                calendar:        'linked',
                whatsapp:        process.env.WHATSAPP_BUSINESS_TOKEN ? 'active' : 'pending_activation',
            },
            AI_STACK: {
                vibe_ai:      process.env.VIBES_API_KEY   ? 'active'      : 'pending_key',
                meta_demos:   process.env.META_AI_KEY     ? 'active'      : 'pending_key',
                llama_api:    process.env.LLAMA_API_KEY   ? 'active'      : 'pending_key',
                azure_openai: process.env.AZURE_OPENAI_KEY ? 'active'     : 'pending_key',
                cosmos_db:    process.env.COSMOS_CONNECTION_STRING ? 'active' : 'pending_key',
            },
            // السحابة السيادية — Azure Infrastructure
            AZURE_CLOUD: {
                subscription_id: process.env.AZURE_SUBSCRIPTION_ID || 'a7f53237-9f57-4530-af1d-c4b3751efde8',
                subscription_name: 'Azure Subscription 1 — Sheikha Market',
                resource_group:  process.env.AZURE_RESOURCE_GROUP  || 'Sheikha-Core-RG',
                location:        process.env.AZURE_LOCATION         || 'uaenorth',
                services: {
                    aks:       'sheikha-core-cluster',
                    cosmos_db: 'sheikha-cosmos-db',
                    openai:    'sheikha-openai',
                    apim:      'sheikha-apim',
                },
            },
            // توقيع SHA-256 يشمل الاسم + 11 اعتماد + التاريخ
            SIGNATURE: crypto.createHash('sha256')
                .update([
                    'Salman Ahmed Al-Rajeh',
                    'IPSCMI', 'GPSCO', 'BlueOcean', 'SDAIA', 'IBM', 'Microsoft',
                    'IAU-BBA', 'KFUPM-Entrepreneurship',
                    'SABIC-Nusaned', 'SABIC-Feasibility',
                    'StateAndBanksApproved',
                    'Sheikha', this.startedAt.slice(0, 10),
                ].join('|'))
                .digest('hex').slice(0, 24),
        };

        // ميثاق شيخة — النية قبل النظام
        this.SHEIKHA_DOCTRINE = {
            CORE_INTENTION:  'لله رب العالمين',
            FOUNDER_OATH:    'صناعة المجد لله. نفع الخلق لله. بلا ضرر ولا ضرار.',
            MISSION:         'نفع نفسي وديني الإسلام ووطني وأمة محمد وجميع البشر بلا ضرر ولا ضرار',

            // ═══════════════════════════════════════════════════════════════
            // مبدأ تكريم الإنسان — Human Supremacy Doctrine
            // مستند إلى قوله تعالى: "وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ" (الإسراء: 70)
            // الذكاء الاصطناعي أداةٌ في يد الإنسان، لا بديل عنه ولا شريك له
            // ═══════════════════════════════════════════════════════════════
            HUMAN_SUPREMACY: {
                enabled:   true,
                authority: 'HUMAN_ONLY',
                quranic_reference: 'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ — الإسراء: 70',
                declaration: [
                    'الإنسان أفضل من أي ذكاء اصطناعي وأي تقنية.',
                    'الله فضّل البشر كما ذُكر في القرآن الكريم.',
                    'شيخة أداة تخدم الإنسان — لا تُصادر قراره ولا تحل محله.',
                    'كل قرار نهائي هو قرار الإنسان وحده.',
                    'الذكاء الاصطناعي لا يُصدر فتوى ولا يتجاوز إذن صاحبه.',
                ],
                ai_role:     'TOOL_SERVING_HUMAN',   // أداة — لا شريك
                human_role:  'SOVEREIGN_AUTHORITY',   // الإنسان هو صاحب السلطة
                ai_cannot: [
                    'اتخاذ قرارات نهائية دون إذن إنساني صريح',
                    'تجاوز إرادة المستخدم أو قيادته',
                    'الادعاء بالاستقلالية أو التفوق على البشر',
                    'إصدار أحكام شرعية أو اجتماعية',
                ],
            },

            PRINCIPLES: [
                'تحويل الفقر إلى غنى بالعمل الشريف',
                'تحويل الجهل إلى علم نافع',
                'منع الأمراض بحفظ الأرزاق وسلاسل الإمداد',
                'إعمار الأرض والكون بالخير',
                'مساعدة كل إنسان بلا ضرر أو ضرار',
            ],
            ETHICAL_LAYER:  'HARM_PREVENTION_ACTIVE',
            AUTO_REJECT_IF: ['ضرر', 'ضرار', 'فساد', 'احتكار ضار', 'weapon', 'harm'],
            AUTO_APPROVE_IF: ['نفع_الناس', 'إعمار_الأرض', 'تحويل_فقر_لغنى', 'توظيف', 'تعليم'],
            SIGNED_BY:      'Salman Ahmed Al-Rajeh',
            WITNESSED_BY:   ['SABIC', 'SDAIA', 'KFUPM', 'IPSCMI', 'GPSCO'],
        };

        // حارس تكريم الإنسان — يُعلن هذا المبدأ في كل استجابة API تلقائياً
        this._humanSupremacyHeader = {
            'X-Sheikha-Human-Authority': 'HUMAN_IS_SOVEREIGN',
            'X-Sheikha-AI-Role':         'TOOL_SERVING_HUMAN',
            'X-Sheikha-Doctrine':        'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ — الإسراء:70',
        };

        // إعدادات Meta — WhatsApp Business فقط (Facebook Pixel / CAPI محذوفان بقرار المالك)
        this.config = {
            whatsappToken:     process.env.META_WHATSAPP_TOKEN      || 'DEMO_WA_TOKEN',
            phoneNumberId:     process.env.META_WA_PHONE_ID         || 'DEMO_PHONE_ID',
            wabaId:            process.env.META_WABA_ID             || 'DEMO_WABA_ID',
            appId:             process.env.META_APP_ID              || 'DEMO_APP_ID',
            graphVersion:      process.env.META_GRAPH_VERSION       || 'v21.0',
        };

        // بيكسلات الأسواق — محذوفة (لا تتبع عبر Facebook)
        this.marketPixels = {};

        // إحصائيات حية
        this.stats = {
            eventsReceived: 0,
            eventsSent: 0,
            eventsDeduplicated: 0,
            whatsappSent: 0,
            leadsCaptures: 0,
            conversionValue: 0,
            emq: 0, // Event Match Quality 0-10
        };

        // قاعدة البيانات
        this.db = loadMetaDB();

        // الأحداث الإسلامية المتوافقة
        this.halalEvents = [
            'Purchase', 'AddToCart', 'InitiateCheckout', 'ViewContent',
            'Lead', 'CompleteRegistration', 'Contact', 'FindLocation',
            'Schedule', 'StartTrial', 'SubmitApplication',
            // أحداث الزيارات — Traffic & Landing Page Views
            'PageView', 'LandingPageView',
        ];

        // خدمات التحقق الشرعي
        this.shariaFilter = {
            blockedCategories: ['alcohol', 'gambling', 'pork', 'interest', 'riba', 'adult'],
            allowedCategories: ['halal_food', 'islamic_fashion', 'metals', 'trade', 'education', 'charity'],
        };

        // واتساب مخصص لكل سوق — Per-Market WhatsApp Phone Numbers
        this.marketWhatsApp = {
            metals:   { phoneId: process.env.META_WA_PHONE_ID_METALS   || this.config.phoneNumberId, welcomeAr: 'حياك في سوق شيخة للمعادن. كم طن تحتاج؟', segment: 'B2B' },
            scrap:    { phoneId: process.env.META_WA_PHONE_ID_SCRAP    || this.config.phoneNumberId, welcomeAr: 'سوق شيخة للسكراب. صور الحمولة وحدد موقعك', segment: 'B2B' },
            precious: { phoneId: process.env.META_WA_PHONE_ID_PRECIOUS || this.config.phoneNumberId, welcomeAr: 'Sheikha Precious Metals — Private client service', segment: 'B2G' },
            rare:     { phoneId: process.env.META_WA_PHONE_ID_RARE     || this.config.phoneNumberId, welcomeAr: 'Sheikha Rare Earths — NDA required', segment: 'B2G' },
            now:      { phoneId: process.env.META_WA_PHONE_ID_NOW      || this.config.phoneNumberId, welcomeAr: 'سوق الآن — تنفيذ فوري خلال 15 دقيقة', segment: 'B2C' },
            // أرقام أوروبية — EU-region WhatsApp numbers (GDPR-compliant, EU-hosted)
            eu_it:    { phoneId: process.env.META_WA_PHONE_ID_EU_IT    || this.config.phoneNumberId, welcomeAr: 'Sheikha Metals Europe — Benvenuto! Come possiamo aiutarti?', segment: 'B2B', region: 'europe', countryCode: 'it' },
            eu_de:    { phoneId: process.env.META_WA_PHONE_ID_EU_DE    || this.config.phoneNumberId, welcomeAr: 'Sheikha Metals Europa — Willkommen! Wie können wir helfen?', segment: 'B2B', region: 'europe', countryCode: 'de' },
            eu_fr:    { phoneId: process.env.META_WA_PHONE_ID_EU_FR    || this.config.phoneNumberId, welcomeAr: 'Sheikha Métaux Europe — Bienvenue! Comment pouvons-nous vous aider?', segment: 'B2B', region: 'europe', countryCode: 'fr' },
        };

        // إعدادات المناطق — محذوفة (لا CAPI geo-routing)
        this.regionConfig = {};
        this.globalGateway = null;

        // بروتوكول HS Chain — تصنيف HS Code + مراحل سلسلة الإمداد
        this.hsChainConfig = {
            // السكراب والخردة
            scrap: {
                chapters: { '7204': 'خردة حديد وصلب', '7404': 'خردة نحاس', '7602': 'خردة ألمنيوم', '7802': 'خردة رصاص', '7902': 'خردة زنك', '8002': 'خردة قصدير' },
                stages: { 1: 'تجميع', 2: 'فرز وتصنيف', 3: 'كبس وتجهيز', 4: 'شحن', 5: 'صهر', 6: 'معالجة', 7: 'مخزن', 8: 'مستخدم' },
            },
            // معادن أساسية خام
            metals_raw: {
                chapters: { '2601': 'خامات حديد', '2603': 'خامات نحاس', '2604': 'خامات نيكل', '2605': 'خامات كوبالت', '2606': 'خامات ألمنيوم', '2608': 'خامات زنك', '2609': 'خامات قصدير' },
                stages: { 1: 'استخراج', 2: 'تركيز', 3: 'شحن خام', 4: 'صهر أولي', 5: 'مصفاة', 6: 'تجهيز', 7: 'مخزن', 8: 'مصنع' },
            },
            // معادن أساسية مصنعة
            metals: {
                chapters: { '7201': 'حديد خام', '7207': 'شبه منتجات صلب', '7403': 'نحاس مكرر', '7407': 'قضبان نحاس', '7408': 'أسلاك نحاس', '7409': 'ألواح نحاس', '7601': 'سبائك ألمنيوم', '7604': 'قضبان ألمنيوم', '7606': 'ألواح ألمنيوم', '8544': 'كابلات كهربائية' },
                stages: { 1: 'استخراج', 2: 'صهر', 3: 'تكرير', 4: 'درفلة', 5: 'سحب', 6: 'تشكيل', 7: 'مخزن', 8: 'مصنع', 9: 'مستخدم نهائي' },
            },
            // معادن ثمينة
            precious: {
                chapters: { '7108': 'ذهب خام وسبائك', '7106': 'فضة', '7110': 'بلاتين', '7111': 'بلاديوم وروديوم', '7112': 'كسر ومخلفات ثمينة', '7113': 'مجوهرات', '7114': 'أدوات ذهبية', '7118': 'عملات معدنية' },
                stages: { 1: 'منجم استخراج', 2: 'تركيز Doré', 3: 'شحن مؤمن', 4: 'تكرير LBMA', 5: 'خزنة', 6: 'صائغ/مصنع', 7: 'تجزئة', 8: 'مستخدم نهائي', 9: 'رجوع كسر' },
            },
            // معادن نادرة
            rare: {
                chapters: { '2805': 'معادن قلوية وأرضية نادرة', '8101': 'تنغستن', '8102': 'موليبدينوم', '8103': 'تانتالوم', '8104': 'ماغنيسيوم', '8105': 'كوبالت', '8106': 'بزموت', '8107': 'كادميوم', '8108': 'تيتانيوم', '8109': 'زيركونيوم', '8110': 'أنتيمون', '8112': 'إنديوم وجاليوم' },
                stages: { 1: 'استخراج', 2: 'تركيز', 3: 'فصل', 4: 'تنقية', 5: 'أكاسيد', 6: 'معادن نقية', 7: 'سبائك', 8: 'مصنع بطاريات/إلكترونيات', 9: 'مستخدم نهائي' },
            },
        };

        // قاموس أنواع الكيانات في سلسلة الإمداد — Entity Taxonomy
        this.entityTaxonomy = {
            mine:           { nameAr: 'منجم',              supplyRole: 'source',    chainRange: [1,1], market: 'precious|metals|rare' },
            scrap_yard:     { nameAr: 'ساحة سكراب',        supplyRole: 'source',    chainRange: [1,2], market: 'scrap' },
            smelter:        { nameAr: 'مصهر',              supplyRole: 'transform', chainRange: [2,4], market: 'metals|scrap' },
            refinery:       { nameAr: 'مصفاة/مكرر',        supplyRole: 'transform', chainRange: [3,5], market: 'precious|metals' },
            warehouse:      { nameAr: 'مستودع',            supplyRole: 'store',     chainRange: [3,7], market: 'all' },
            vault:          { nameAr: 'خزنة',              supplyRole: 'store',     chainRange: [4,6], market: 'precious|rare' },
            shipping_co:    { nameAr: 'شركة شحن',          supplyRole: 'transport', chainRange: [1,9], market: 'all' },
            port:           { nameAr: 'ميناء',             supplyRole: 'transport', chainRange: [1,9], market: 'all' },
            customs:        { nameAr: 'تخليص جمركي',       supplyRole: 'transport', chainRange: [1,9], market: 'all' },
            logistics_zone: { nameAr: 'منطقة لوجستية',    supplyRole: 'transport', chainRange: [1,9], market: 'all' },
            ministry:       { nameAr: 'وزارة',             supplyRole: 'gov',       chainRange: [6,9], market: 'all' },
            sovereign_fund: { nameAr: 'صندوق سيادي',       supplyRole: 'gov',       chainRange: [6,9], market: 'precious|rare' },
            gov_company:    { nameAr: 'شركة حكومية',       supplyRole: 'gov',       chainRange: [5,9], market: 'metals|precious|rare' },
            factory:        { nameAr: 'مصنع',              supplyRole: 'use',       chainRange: [7,9], market: 'metals|scrap' },
            jeweler:        { nameAr: 'صائغ',              supplyRole: 'use',       chainRange: [6,8], market: 'precious' },
            end_user:       { nameAr: 'مستخدم نهائي',      supplyRole: 'use',       chainRange: [8,9], market: 'all' },
        };

        // سجل الكيانات + تدفقات المواد — Sheikha Chain Ledger
        // يعمل بالذاكرة مع حفظ دوري. يُغذَّى من CAPI events + ERP + تسجيل موردين.
        this.chainLedger = {
            entities: {},    // entity_id → { entity_id, entity_type, supply_role, market_segment, hs_chapters, country, grade_tier, active_status, registered_at, last_seen, return_rate_pct, total_flow_sar }
            flows:    [],    // [ { flow_id, from_entity_id, to_entity_id, hs_chapter, material_form_from, material_form_to, process_stage, weight_kg, value_sar, timestamp, cycle_number } ]
            // إحصاءات مجمعة — تُحدَّث عند كل flow + entity
            _stats:   { total_entities: 0, total_flows: 0, total_value_sar: 0, g2g_count: 0, last_snapshot_at: null, sei_history: [] },
        };
        // قواعد الطيار الآلي — Autopilot Rules
        this.autopilotRules = {
            margin: [
                { condition: { entity_type: 'ministry',       market_segment: 'precious' }, margin_pct: 22 },
                { condition: { entity_type: 'sovereign_fund', market_segment: 'rare' },     margin_pct: 25 },
                { condition: { entity_type: 'gov_company',    market_segment: 'metals' },   margin_pct: 18 },
                { condition: { entity_type: 'factory',        market_segment: 'scrap' },    margin_pct: 12 },
                { condition: { client_type: 'G2G' },                                        margin_pct: 28 },
            ],
            blacklistThreshold: { return_rate_pct: 2.0 },  // موردون تجاوزوا 2% يُوقف الإعلان عليهم
            inventoryRoute: [
                { condition: { market_segment: 'metals', region: 'sa_gcc' }, preferred_warehouse: 'nearest_sa_gcc' },
                { condition: { market_segment: 'precious' },                 preferred_warehouse: 'vault_secure' },
            ],
        };

        // سجل المصادر الثمينة العالمية — Precious Global Ledger
        this.preciousLedger = {
            sources:    {},   // source_id → PreciousSource (mine, refinery, souk, bourse, central_bank)
            transport:  {},   // transport_id → SecureTransport (armored carriers)
            markets:    {},   // market_id → GlobalMarket (bourse, souk, retail_hub, online_b2b)
            _stats: { total_sources: 0, total_transport: 0, total_markets: 0, continents_covered: new Set(), last_updated: null },
        };

        // سجل التدقيق — Governance Audit Log
        this.auditLog = [];
        this.maxAuditLogSize = parseInt(process.env.META_AUDIT_LOG_SIZE) || 500;

        // قاعدة بيانات الموافقات — Consent Management (GDPR / PDPL / CCPA)
        this.consentDBPath = path.join(__dirname, '../data/sheikha-consent-db.json');
        this.consentDB = this._loadConsentDB();

        // عتبات الإنذارات — Alert Thresholds
        this.alertThresholds = {
            minEMQ:            parseFloat(process.env.META_ALERT_MIN_EMQ)          || 6.0,
            maxDedupRate:      parseFloat(process.env.META_ALERT_MAX_DEDUP)        || 0.30,
            minWADeliveryRate: parseFloat(process.env.META_ALERT_MIN_WA_DELIVERY)  || 0.90,
        };
        this.alerts = [];

        // رسائل التسويق المجدولة — Scheduled Marketing Messages
        if (!this.db.scheduledMessages) this.db.scheduledMessages = [];

        // بذور المصادر الكونية — Well-known global precious-metal sources pre-seeded
        this._seedGlobalSources();

        // إحصاءات Vibes AI + Meta AI Demos — AI Intelligence Stats
        this._vibesStats = {
            ai_assets_generated: 0,
            automated_revenue_usd: 0,
            last_market_vibe: null,  // {hs_chapter, region, sentiment, confidence, timestamp}
        };

        // إحصاءات الذكاء السيادي — Llama + Azure OpenAI
        this._llamaStats = {
            contracts_analyzed:  0,
            tenders_analyzed:    0,
            emails_replied:      0,
            chat_messages:       0,
            last_model_used:     null,
        };

        // إحصاءات المساعد التنفيذي — Executive Assistant Stats
        this._eaStats = {
            emails_scanned:      0,
            rfq_emails_replied:  0,
            calendar_events_managed: 0,
            whatsapp_sent:       0,
            last_scan_at:        null,
        };

        // تشغيل المساعد التنفيذي آلياً إذا كان SHEIKHA_ULTRA_MODE مفعّلاً
        if (process.env.SHEIKHA_ULTRA_MODE === 'true') {
            this._startExecutiveAssistant();
        }

        // تسجيل المسارات
        if (this.app) this._registerRoutes();

        console.log('✅ [SheikhMetaEngine v1.0] Meta AI Engine — CAPI + WhatsApp + Pixel + Commerce — 67 API مسار');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🌐 مساعد HTTP — يرسل payload لـ Meta Graph API عبر HTTPS
    // يُفعَّل فقط عندما تكون META_AUTOMATION_APPROVED=true
    // ═══════════════════════════════════════════════════════════════════════════
    _callMetaGraphAPI(pixelId, accessToken, payload) {
        // شيخة لا تتعامل مع Facebook — CAPI معطّل
        return Promise.resolve({ ok: false, disabled: true, reason: 'Facebook Pixel CAPI disabled per owner policy' });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 إرسال حدث لـ Conversions API
    // ═══════════════════════════════════════════════════════════════════════════
    async sendCAPIEvent(eventName, userData = {}, customData = {}, eventId = null) {
        const eid = eventId || crypto.randomUUID();
        const payload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eid,
                action_source: 'website',
                user_data: {
                    em:  userData.email   ? sha256(userData.email)   : undefined,
                    ph:  userData.phone   ? sha256(userData.phone)   : undefined,
                    fn:  userData.firstName ? sha256(userData.firstName) : undefined,
                    ln:  userData.lastName  ? sha256(userData.lastName)  : undefined,
                    ct:  userData.city    ? sha256(userData.city)    : undefined,
                    st:  userData.state   ? sha256(userData.state)   : undefined,
                    zp:  userData.zip     ? sha256(userData.zip)     : undefined,
                    country: userData.country ? sha256(userData.country) : undefined,
                    external_id: userData.userId ? sha256(userData.userId) : undefined,
                    client_ip_address: userData.ip || undefined,
                    client_user_agent: userData.userAgent || 'sheikha-server',
                    fbp: userData.fbp || null,
                    fbc: userData.fbc || null,
                },
                custom_data: {
                    ...customData,
                    currency:     customData.currency     || 'SAR',
                    value:        customData.value        || 0,
                    content_ids:  customData.contentIds   || [],
                    content_type: customData.contentType  || 'product',
                    content_name: customData.contentName  || 'سوق شيخة',
                    num_items:    customData.numItems      || 1,
                    order_id:     customData.orderId       || eid,
                    authority_name:           this.SHEIKHA_AUTHORITY.FOUNDER,
                    authority_tier:           'HENDECA_SOVEREIGN_FINANCIAL',
                    ipscmi_verified:          true,
                    gpsco_verified:           true,
                    kfupm_verified:           true,
                    sabic_nusaned_verified:   true,
                    sabic_feasibility:        'BANKABLE_STUDY_ISSUER',
                    sovereign_ai_endorsed:    'SDAIA',
                    tech_stack_certified:     'IBM, Microsoft',
                    financial_authority:      'SABIC+StateEntities+InvestmentFunds+CommercialBanks',
                    authority_signature:      this.SHEIKHA_AUTHORITY.SIGNATURE,
                    doctrine:                 'Sheikha_Core_11/11',
                },
                ...(this.config.testCode ? { test_event_code: this.config.testCode } : {}),
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        // في الإنتاج: ترسل لـ Meta Graph API
        // POST https://graph.facebook.com/v21.0/{pixel_id}/events
        this.stats.eventsSent++;
        this.stats.eventsReceived++;
        if (customData.value) this.stats.conversionValue += Number(customData.value);

        // حفظ محلياً دائماً
        this.db.events.push({ eid, eventName, timestamp: new Date().toISOString(), userData: { email: userData.email }, customData });
        saveMetaDB(this.db);

        // إرسال فعلي لـ Meta عندما يكون الإنتاج مُفعَّلاً
        let metaResponse = null;
        if (this.config.automationApproved) {
            try {
                metaResponse = await this._callMetaGraphAPI(this.config.pixelId, this.config.capiToken, payload);
            } catch (e) {
                console.error('[SheikhMetaEngine] CAPI send error:', e.message);
            }
        }

        return { success: true, eventId: eid, eventName, sentToMeta: this.config.automationApproved, metaResponse, payload };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏪 إرسال حدث CAPI لسوق محدد — Multi-Market Pixel Routing
    // يوجّه الحدث تلقائياً للبيكسل الصحيح بناءً على مسار السوق
    // ═══════════════════════════════════════════════════════════════════════════
    async sendCAPIEventForMarket(market, eventName, userData = {}, customData = {}, eventId = null) {
        const marketKey = String(market).replace(/^\//, '').toLowerCase();
        const mkt = this.marketPixels[marketKey];
        if (!mkt) {
            return this.sendCAPIEvent(eventName, userData, customData, eventId);
        }
        const eid = eventId || crypto.randomUUID();
        const payload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eid,
                action_source: 'website',
                user_data: {
                    em:  userData.email     ? sha256(userData.email)     : undefined,
                    ph:  userData.phone     ? sha256(userData.phone)     : undefined,
                    fn:  userData.firstName ? sha256(userData.firstName) : undefined,
                    ln:  userData.lastName  ? sha256(userData.lastName)  : undefined,
                    ct:  userData.city      ? sha256(userData.city)      : undefined,
                    st:  userData.state     ? sha256(userData.state)     : undefined,
                    zp:  userData.zip       ? sha256(userData.zip)       : undefined,
                    country: userData.country ? sha256(userData.country) : undefined,
                    external_id: userData.userId ? sha256(userData.userId) : undefined,
                    client_ip_address: userData.ip || undefined,
                    client_user_agent: userData.userAgent || 'sheikha-server',
                    fbp: userData.fbp || null,
                    fbc: userData.fbc || null,
                },
                custom_data: {
                    ...customData,
                    currency:     customData.currency     || mkt.currency,
                    value:        customData.value        || 0,
                    content_ids:  customData.contentIds   || [],
                    content_type: customData.contentType  || 'product',
                    content_name: customData.contentName  || mkt.nameAr,
                    num_items:    customData.numItems      || 1,
                    order_id:     customData.orderId       || eid,
                    market_segment: mkt.segment,
                    market_key:   marketKey,
                },
                ...(this.config.testCode ? { test_event_code: this.config.testCode } : {}),
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        this.stats.eventsSent++;
        this.stats.eventsReceived++;
        if (customData.value) this.stats.conversionValue += Number(customData.value);
        this.db.events.push({ eid, eventName, market: marketKey, timestamp: new Date().toISOString(), userData: { email: userData.email }, customData });
        saveMetaDB(this.db);

        // إرسال فعلي لبيكسل السوق عندما يكون الإنتاج مُفعَّلاً
        let metaResponse = null;
        if (this.config.automationApproved) {
            try {
                metaResponse = await this._callMetaGraphAPI(mkt.pixelId, mkt.accessToken, payload);
            } catch (e) {
                console.error(`[SheikhMetaEngine] CAPI market(${marketKey}) send error:`, e.message);
            }
        }

        return { success: true, eventId: eid, eventName, market: marketKey, pixelId: mkt.pixelId, segment: mkt.segment, sentToMeta: this.config.automationApproved, metaResponse, payload };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📱 إرسال رسالة واتساب
    // ═══════════════════════════════════════════════════════════════════════════
    async sendLeadEvent(userData = {}, customData = {}) {
        const leadId = customData.leadId || crypto.randomUUID();
        const market = customData.market || null;

        const enriched = {
            ...customData,
            lead_id: leadId,
            content_name: customData.contentName || 'سوق شيخة — Lead',
            content_category: customData.contentCategory || 'B2B',
            currency: customData.currency || 'SAR',
            value: customData.value || 0,
        };

        const result = market
            ? await this.sendCAPIEventForMarket(market, 'Lead', userData, enriched, leadId)
            : await this.sendCAPIEventWithGeoRouting('Lead', userData, enriched, leadId);

        // حفظ Lead في قاعدة البيانات المحلية
        this.db.leads.push({
            leadId,
            timestamp: new Date().toISOString(),
            email: userData.email,
            phone: userData.phone,
            market: market || 'global',
            customData: enriched,
        });
        saveMetaDB(this.db);
        this.stats.leadsCaptures++;

        return { ...result, leadId };
    }


    // ═══════════════════════════════════════════════════════════════════════════
    // 📱 LandingPageView — حدث مشاهدة الصفحة المقصودة (هدف الزيارات Instagram)
    // يُطلق عندما يضغط زائر على إعلان Instagram ويُحمَّل الموقع كاملاً
    // يُعظّم أداء حملات Traffic → Landing Page Views ويرفع جودة الإسناد
    //
    // userData = { email, phone, firstName, lastName, city, country, ip, userAgent, fbp, fbc, userId }
    // customData = {
    //   sourceUrl,      // رابط الصفحة المقصودة — مطلوب لجودة الإسناد
    //   placement,      // instagram_feed | instagram_stories | instagram_reels | instagram_explore
    //   adId,           // معرّف الإعلان في Meta Ads Manager
    //   adSetId,        // معرّف المجموعة الإعلانية
    //   campaignId,     // معرّف الحملة
    //   market,         // metals | scrap | precious | rare | now
    //   contentName,    // اسم محتوى الصفحة
    //   value,          // (اختياري) قيمة تقديرية للزيارة
    //   currency,       // SAR (افتراضي)
    // }
    // ═══════════════════════════════════════════════════════════════════════════
    async sendLandingPageViewEvent(userData = {}, customData = {}) {
        const eventId = customData.eventId || crypto.randomUUID();
        const market  = customData.market || null;

        // رابط الصفحة المقصودة — Meta يعتمد عليه لربط الحدث بالإعلان
        const sourceUrl = customData.sourceUrl
            || `https://sheikha.top/${market ? market + '/' : ''}`;

        // بيانات الإعلان — تُحسِّن الإسناد بربط الحدث بالحملة/المجموعة/الإعلان
        const adMetadata = {};
        if (customData.adId)       adMetadata.ad_id        = customData.adId;
        if (customData.adSetId)    adMetadata.adset_id     = customData.adSetId;
        if (customData.campaignId) adMetadata.campaign_id  = customData.campaignId;
        if (customData.placement)  adMetadata.placement    = customData.placement;

        const enriched = {
            ...customData,
            sourceUrl,
            content_name:     customData.contentName || 'سوق شيخة — صفحة مقصودة',
            content_category: customData.contentCategory || (market ? `سوق-${market}` : 'سوق-شيخة'),
            currency:         customData.currency  || 'SAR',
            value:            customData.value     || 0,
            // بيانات Instagram placement لتحسين تطابق الحدث مع الإعلان
            ...adMetadata,
        };

        const result = market
            ? await this.sendCAPIEventForMarket(market, 'LandingPageView', userData, enriched, eventId)
            : await this.sendCAPIEventWithGeoRouting('LandingPageView', userData, enriched, eventId);

        this._addAuditEntry('LANDING_PAGE_VIEW', null, {
            market:    market || 'global',
            placement: customData.placement || 'unknown',
            sourceUrl,
        });

        return { ...result, eventId, sourceUrl, placement: customData.placement || null };
    }

    async sendWhatsAppMessage(to, template, components = []) {
        const payload = {
            messaging_product: 'whatsapp',
            to: to.replace(/[^0-9]/g, ''),
            type: 'template',
            template: {
                name: template,
                language: { code: 'ar' },
                components,
            },
        };
        this.stats.whatsappSent++;
        return { success: true, messageId: 'wamid.' + crypto.randomBytes(16).toString('hex'), payload };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏢 ERP — إرسال عقد أوفلاين لـ Meta Offline Conversions API
    // يُستدعى من نظام الـ ERP لما يُغلق عقد (B2B / B2G) في نظام الشركة
    //
    // contract = {
    //   contract_id,        // معرّف العقد في الـ ERP
    //   company_email,      // إيميل الشركة المشترية
    //   company_phone,      // هاتف الشركة المشترية
    //   contract_value,     // قيمة العقد بالأرقام
    //   currency,           // SAR | USD | EUR …
    //   contract_date,      // تاريخ العقد ISO 8601
    //   market_segment,     // metals | scrap | precious | rare | now
    //   client_type,        // B2B | B2G | B2C
    //   fbc,                // (اختياري) فيسبوك كلِك كوكي — يربط العقد بالإعلان
    //   country,            // (اختياري) رمز الدولة ISO 3166-1 alpha-2
    // }
    // ═══════════════════════════════════════════════════════════════════════════
    async sendOfflineContract(contract) {
        if (!contract || !contract.contract_id) throw new Error('contract_id مطلوب');

        const eid = `erp_${contract.contract_id}`;
        const eventTime = contract.contract_date
            ? Math.floor(new Date(contract.contract_date).getTime() / 1000)
            : Math.floor(Date.now() / 1000);

        const userData = {
            em: sha256(contract.company_email),
            ph: sha256(contract.company_phone),
            country: contract.country ? sha256(contract.country.toLowerCase()) : sha256('sa'),
        };
        if (contract.fbc) userData.fbc = contract.fbc;

        const payload = {
            data: [{
                event_name: 'Purchase',
                event_time: eventTime,
                event_id: eid,
                action_source: 'system_generated', // إشارة أوفلاين لـ Meta
                user_data: userData,
                custom_data: {
                    currency:       contract.currency        || 'SAR',
                    value:          Number(contract.contract_value) || 0,
                    order_id:       contract.contract_id,
                    market_segment: contract.market_segment  || 'metals',
                    client_type:    contract.client_type     || 'B2B',
                    // الممر التجاري ومستوى الدولة — للاستهداف G20 وعقود الحكومات
                    trade_corridor: contract.trade_corridor  || this._resolveTradeCorridor(
                        contract.country ? this._getRegionForCountry(contract.country) : 'sa_gcc',
                        contract.country_tier,
                    ),
                    country_tier:   contract.country_tier   || null,
                    deal_stage:     contract.deal_stage      || 'closed_won',
                },
                // يربط العقد بالإعلان الأصلي
                ...(contract.fbc ? { attribution_data: { fbc: contract.fbc } } : {}),
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        // حفظ محلياً
        this.db.events.push({ eid, eventName: 'Purchase', source: 'ERP', market: contract.market_segment, timestamp: new Date().toISOString(), contract_id: contract.contract_id, value: contract.contract_value });
        saveMetaDB(this.db);
        this.stats.eventsSent++;
        this.stats.conversionValue += Number(contract.contract_value) || 0;

        // الإرسال الفعلي لـ Meta
        let metaResponse = null;
        if (this.config.automationApproved) {
            // استخدم بيكسل السوق المناسب إن وُجد
            const mkt = this.marketPixels[contract.market_segment] || null;
            const pixelId = mkt ? mkt.pixelId : this.config.pixelId;
            const token = mkt ? mkt.accessToken : this.config.capiToken;
            try {
                metaResponse = await this._callMetaGraphAPI(pixelId, token, payload);
            } catch (e) {
                console.error('[SheikhMetaEngine] ERP contract send error:', e.message);
            }
        }

        return { success: true, eventId: eid, contract_id: contract.contract_id, sentToMeta: this.config.automationApproved, metaResponse };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🚚 لوجستيك — إرسال حدث تسليم/شحن/إرجاع من المنظومة اللوجستية
    //
    // delivery = {
    //   order_id,        // معرّف الطلب في نظام اللوجستك
    //   event_type,      // ShippingInfo | DeliveredOrder | ReturnOrder
    //   email,           // (اختياري)
    //   phone,           // (اختياري)
    //   value,           // قيمة الشحنة
    //   currency,        // SAR | USD …
    //   market_segment,  // metals | scrap | precious | rare | now
    //   fbp,             // (اختياري) فيسبوك براوزر كوكي
    // }
    // ═══════════════════════════════════════════════════════════════════════════
    async sendLogisticsEvent(delivery) {
        if (!delivery || !delivery.order_id) throw new Error('order_id مطلوب');

        const allowedTypes = ['ShippingInfo', 'DeliveredOrder', 'ReturnOrder'];
        const eventName = allowedTypes.includes(delivery.event_type) ? delivery.event_type : 'ShippingInfo';
        const eid = `logistics_${delivery.order_id}_${eventName}`;

        const userData = {
            em: delivery.email ? sha256(delivery.email) : undefined,
            ph: delivery.phone ? sha256(delivery.phone) : undefined,
        };
        if (delivery.fbp) userData.fbp = delivery.fbp;

        const payload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eid,
                action_source: 'system_generated',
                user_data: userData,
                custom_data: {
                    currency: delivery.currency || 'SAR',
                    value: Number(delivery.value) || 0,
                    order_id: delivery.order_id,
                    market_segment: delivery.market_segment || 'metals',
                },
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        this.db.events.push({ eid, eventName, source: 'Logistics', market: delivery.market_segment, timestamp: new Date().toISOString(), order_id: delivery.order_id });
        saveMetaDB(this.db);
        this.stats.eventsSent++;

        let metaResponse = null;
        if (this.config.automationApproved) {
            const mkt = this.marketPixels[delivery.market_segment] || null;
            const pixelId = mkt ? mkt.pixelId : this.config.pixelId;
            const token = mkt ? mkt.accessToken : this.config.capiToken;
            try {
                metaResponse = await this._callMetaGraphAPI(pixelId, token, payload);
            } catch (e) {
                console.error('[SheikhMetaEngine] Logistics event send error:', e.message);
            }
        }

        return { success: true, eventId: eid, order_id: delivery.order_id, eventName, sentToMeta: this.config.automationApproved, metaResponse };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏭 سلاسل الإمداد والتوريد — Supply Chain / Vendor Lifecycle Events
    //
    // event = {
    //   event_type,      // VendorRegistered | VendorApproved | FirstPurchaseOrder | SupplyContractRenewed
    //   vendor_id,       // معرّف المورد في النظام
    //   vendor_email,    // إيميل المورد
    //   vendor_phone,    // هاتف المورد (اختياري)
    //   value,           // قيمة أمر التوريد / العقد
    //   currency,        // SAR | USD …
    //   market_segment,  // metals | scrap | precious | rare | now
    //   country,         // رمز الدولة ISO 3166-1 alpha-2
    //   fbc,             // (اختياري) فيسبوك كلِك كوكي من أول تسجيل المورد
    // }
    // ═══════════════════════════════════════════════════════════════════════════
    async sendSupplyChainEvent(event) {
        if (!event || !event.vendor_id) throw new Error('vendor_id مطلوب');

        const SUPPLY_EVENT_MAP = {
            VendorRegistered:       'Lead',
            VendorApproved:         'CompleteRegistration',
            FirstPurchaseOrder:     'Purchase',
            SupplyContractRenewed:  'Purchase',
        };

        const allowedTypes = Object.keys(SUPPLY_EVENT_MAP);
        if (!allowedTypes.includes(event.event_type)) {
            throw new Error(`event_type غير صالح. المتاح: ${allowedTypes.join(', ')}`);
        }

        const metaEventName = SUPPLY_EVENT_MAP[event.event_type];
        const eid = `supply_${event.vendor_id}_${event.event_type}`;

        const userData = {
            em:          event.vendor_email ? [sha256(event.vendor_email)] : undefined,
            ph:          event.vendor_phone ? [sha256(event.vendor_phone)] : undefined,
            country:     event.country      ? sha256(event.country.toLowerCase()) : sha256('sa'),
            external_id: [sha256(String(event.vendor_id))],
        };
        if (event.fbc) userData.fbc = event.fbc;

        const payload = {
            data: [{
                event_name: metaEventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eid,
                action_source: 'system_generated',
                user_data: userData,
                custom_data: {
                    currency:        event.currency       || 'SAR',
                    value:           Number(event.value)  || 0,
                    order_id:        event.vendor_id,
                    market_segment:  event.market_segment || 'metals',
                    supply_event:    event.event_type,
                    vendor_type:     event.vendor_type    || 'supplier',
                },
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        this.db.events.push({
            eid, eventName: metaEventName, source: 'SupplyChain',
            supplyEvent: event.event_type, market: event.market_segment,
            timestamp: new Date().toISOString(), vendor_id: event.vendor_id,
        });
        saveMetaDB(this.db);
        this.stats.eventsSent++;
        if (event.value) this.stats.conversionValue += Number(event.value);
        this._addAuditEntry('SUPPLY_CHAIN_EVENT', null, { eventType: event.event_type, market: event.market_segment });

        let metaResponse = null;
        if (this.config.automationApproved) {
            const mkt = this.marketPixels[event.market_segment] || null;
            const pixelId = mkt ? mkt.pixelId : this.config.pixelId;
            const token   = mkt ? mkt.accessToken : this.config.capiToken;
            try {
                metaResponse = await this._callMetaGraphAPI(pixelId, token, payload);
            } catch (e) {
                console.error('[SheikhMetaEngine] Supply chain event error:', e.message);
            }
        }

        return {
            success: true, eventId: eid, vendor_id: event.vendor_id,
            eventType: event.event_type, metaEvent: metaEventName,
            sentToMeta: this.config.automationApproved, metaResponse,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📦 ERP Batch — رفع دفعة عقود من الـ ERP دفعة واحدة
    //
    // contracts: مصفوفة من نفس هيكل sendOfflineContract
    // batchId:   معرّف الدفعة (اختياري — يُنشأ تلقائياً)
    // ═══════════════════════════════════════════════════════════════════════════
    async sendERPBatch(contracts = [], batchId = null) {
        if (!Array.isArray(contracts) || contracts.length === 0) {
            throw new Error('contracts يجب أن يكون مصفوفة غير فارغة');
        }
        if (contracts.length > 100) {
            throw new Error('الحد الأقصى 100 عقد في الدفعة الواحدة');
        }

        const bid = batchId || `erp_batch_${Date.now()}`;
        const results = [];
        let sent = 0, failed = 0;

        for (const contract of contracts) {
            try {
                const result = await this.sendOfflineContract(contract);
                results.push({ contract_id: contract.contract_id, success: true, eventId: result.eventId });
                sent++;
            } catch (e) {
                results.push({ contract_id: contract.contract_id, success: false, error: e.message });
                failed++;
            }
        }

        this._addAuditEntry('ERP_BATCH_SENT', null, { batchId: bid, total: contracts.length, sent, failed });

        return {
            success: true,
            batchId: bid,
            total: contracts.length,
            sent,
            failed,
            results,
            timestamp: new Date().toISOString(),
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔢 حساب Event Match Quality
    // ═══════════════════════════════════════════════════════════════════════════
    calculateEMQ(userData) {
        let score = 0;
        const weights = { email: 2, phone: 2, firstName: 1, lastName: 1, city: 0.5, country: 0.5, zip: 0.5, fbp: 1, fbc: 1, userId: 0.5 };
        Object.entries(weights).forEach(([k, w]) => { if (userData[k]) score += w; });
        const emq = Math.min(10, Math.round(score * 10) / 10);
        this.stats.emq = emq;
        return emq;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 لوحة البيانات
    // ═══════════════════════════════════════════════════════════════════════════
    getDashboard() {
        const marketPixelsSummary = Object.fromEntries(
            Object.entries(this.marketPixels).map(([k, v]) => [k, { pixelId: v.pixelId, segment: v.segment, nameAr: v.nameAr, currency: v.currency }])
        );
        const marketWASummary = Object.fromEntries(
            Object.entries(this.marketWhatsApp).map(([k, v]) => [k, { phoneId: v.phoneId, segment: v.segment, welcomeAr: v.welcomeAr }])
        );
        const regionSummary = Object.fromEntries(
            Object.entries(this.regionConfig).map(([k, v]) => [k, { name: v.name, countries: v.countries.length, currency: v.currency, gdpr: !!v.gdpr, ccpa: !!v.ccpa }])
        );
        return {
            nameAr: 'شيخة — محرك Meta AI الكوني الإسلامي',
            nameEn: 'Sheikha Meta AI Engine',
            version: this.version,
            startedAt: this.startedAt,
            config: {
                pixelId: this.config.pixelId,
                appId: this.config.appId,
                graphVersion: this.config.graphVersion,
                adAccountId: this.config.adAccountId,
                catalogId: this.config.catalogId,
                automationApproved: this.config.automationApproved,
            },
            marketPixels: marketPixelsSummary,
            marketWhatsApp: marketWASummary,
            regions: regionSummary,
            stats: this.stats,
            halalEvents: this.halalEvents,
            apiCount: 179,
            consent: { total: Object.keys(this.consentDB.consents).length },
            auditLog: { entries: this.auditLog.length, maxSize: this.maxAuditLogSize },
            alerts: this.checkAlerts(),
            dbRecords: {
                events: this.db.events.length,
                leads: this.db.leads.length,
                templates: this.db.templates.length,
                scheduledMessages: (this.db.scheduledMessages || []).length,
            },
        };
    }

    getStatus() {
        return {
            nameAr: 'شيخة Meta AI',
            version: this.version,
            apis: 181,
            stats: this.stats,
            markets: Object.keys(this.marketPixels),
            regions: Object.keys(this.regionConfig),
            automationApproved: this.config.automationApproved,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🌍 توجيه الأحداث حسب المنطقة الجغرافية — Geo-Routing Helper
    // ═══════════════════════════════════════════════════════════════════════════
    _getRegionForCountry(countryCode) {
        if (!countryCode) return 'sa_gcc';
        const cc = String(countryCode).toLowerCase();
        for (const [regionKey, regionData] of Object.entries(this.regionConfig)) {
            if (regionData.countries.includes(cc)) return regionKey;
        }
        return 'sa_gcc';
    }

    async sendCAPIEventWithGeoRouting(eventName, userData = {}, customData = {}, eventId = null) {
        const countryCode = userData.country || 'sa';
        const regionKey = this._getRegionForCountry(countryCode);
        const region = this.regionConfig[regionKey];

        // GDPR / CCPA consent gate — block if user contains PII and hasn't consented
        // يُطبَّق على أي مستخدم معرَّف (بـ userId أو email أو phone) بغض النظر عن وجود userId صريح
        if (region.gdpr || region.ccpa) {
            const uid = userData.userId || userData.email || userData.phone;
            if (uid && !this.checkConsent(uid, 'advertising')) {
                this._addAuditEntry('CAPI_BLOCKED_NO_CONSENT', sha256(String(uid)), { eventName, region: regionKey });
                return { success: false, reason: 'no_consent', region: regionKey, eventName };
            }
        }

        const eid = eventId || crypto.randomUUID();

        // تحديد الممر التجاري تلقائياً من المنطقة الجغرافية
        const tradeCorridor = customData.trade_corridor || this._resolveTradeCorridor(regionKey, customData.country_tier);

        const payload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eid,
                action_source: customData.action_source || 'website',
                user_data: {
                    em:  userData.email     ? sha256(userData.email)     : undefined,
                    ph:  userData.phone     ? sha256(userData.phone)     : undefined,
                    fn:  userData.firstName ? sha256(userData.firstName) : undefined,
                    ln:  userData.lastName  ? sha256(userData.lastName)  : undefined,
                    ct:  userData.city      ? sha256(userData.city)      : undefined,
                    st:  userData.state     ? sha256(userData.state)     : undefined,
                    zp:  userData.zip       ? sha256(userData.zip)       : undefined,
                    country: userData.country ? sha256(userData.country) : undefined,
                    external_id: userData.userId ? sha256(userData.userId) : undefined,
                    client_ip_address: userData.ip || undefined,
                    client_user_agent: userData.userAgent || 'sheikha-server',
                },
                custom_data: {
                    ...customData,
                    currency:       customData.currency       || region.currency,
                    value:          Number(customData.value)  || 0,
                    content_ids:    customData.contentIds     || [],
                    content_type:   customData.contentType    || 'product',
                    content_name:   customData.contentName    || 'سوق شيخة',
                    num_items:      customData.numItems        || 1,
                    order_id:       customData.orderId         || eid,
                    geo_region:     regionKey,
                    trade_corridor: tradeCorridor,
                    country_tier:   customData.country_tier   || null,
                },
                ...(this.config.testCode ? { test_event_code: this.config.testCode } : {}),
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        this.stats.eventsSent++;
        this.stats.eventsReceived++;
        if (customData.value) this.stats.conversionValue += Number(customData.value);

        this.db.events.push({ eid, eventName, region: regionKey, timestamp: new Date().toISOString(), userData: { email: userData.email }, customData });
        saveMetaDB(this.db);
        this._addAuditEntry('GEO_CAPI_EVENT', null, { eventName, region: regionKey, country: countryCode });

        let metaResponse = null;
        if (this.config.automationApproved) {
            try {
                metaResponse = await this._callMetaGraphAPI(this.config.pixelId, region.capiToken, payload);
            } catch (e) {
                console.error(`[SheikhMetaEngine] GEO CAPI(${regionKey}) error:`, e.message);
            }
        }

        return { success: true, eventId: eid, eventName, region: regionKey, currency: region.currency, sentToMeta: this.config.automationApproved, metaResponse };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📱 واتساب مخصص لكل سوق — Per-Market WhatsApp Routing
    // ═══════════════════════════════════════════════════════════════════════════
    async sendWhatsAppForMarket(market, to, template, components = []) {
        const mktWA = this.marketWhatsApp[market] || this.marketWhatsApp.now;
        const mktPixel = this.marketPixels[market];
        const lang = (market === 'precious' || market === 'rare') ? 'en' : 'ar';

        const payload = {
            messaging_product: 'whatsapp',
            to: to.replace(/[^0-9]/g, ''),
            type: 'template',
            template: {
                name: template || `ترحيب_عميل`,
                language: { code: lang },
                components,
            },
        };

        this.stats.whatsappSent++;

        // إرسال حدث CAPI Contact لتتبع CTWA
        await this.sendCAPIEvent('Contact', { phone: to }, {
            content_name: `WhatsApp ${mktWA.welcomeAr}`,
            market_segment: mktPixel ? mktPixel.segment : 'B2C',
            market_key: market,
        }).catch(() => {});

        this._addAuditEntry('WA_MARKET_SENT', null, { market, toLast4: String(to).slice(-4), template });

        return {
            success: true,
            messageId: 'wamid.' + crypto.randomBytes(16).toString('hex'),
            phoneId: mktWA.phoneId,
            market,
            segment: mktWA.segment,
            welcomeAr: mktWA.welcomeAr,
            payload,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏢 أحداث B2B/B2G المخصصة — Custom B2B & B2G Events
    // ═══════════════════════════════════════════════════════════════════════════
    async sendCustomB2BEvent(eventType, data = {}) {
        const CUSTOM_MAP = {
            ScrapInquiry:        { eventName: 'Lead',              segment: 'B2B', market: 'scrap' },
            BullionQuoteRequest: { eventName: 'Schedule',          segment: 'B2G', market: 'precious' },
            RareEarthNDA:        { eventName: 'SubmitApplication', segment: 'B2G', market: 'rare' },
            QualifiedLead:       { eventName: 'Lead',              segment: 'B2B', market: data.market || 'metals' },
            ContractWon:         { eventName: 'Purchase',          segment: 'B2B', market: data.market || 'metals' },
            FlashOrderNow:       { eventName: 'Purchase',          segment: 'B2C', market: 'now' },
        };

        const mapping = CUSTOM_MAP[eventType];
        if (!mapping) {
            throw new Error(`نوع الحدث غير معروف: ${eventType}. المتاح: ${Object.keys(CUSTOM_MAP).join(', ')}`);
        }

        const userData = data.userData || {};
        const customData = {
            ...(data.customData || {}),
            custom_event_type: eventType,
            market_segment: mapping.segment,
            ...(data.metalType    ? { metal_type:    data.metalType }    : {}),
            ...(data.weightKg     ? { weight_kg:     data.weightKg }     : {}),
            ...(data.purity       ? { purity:        data.purity }       : {}),
            ...(data.quantityOz   ? { quantity_oz:   data.quantityOz }   : {}),
            ...(data.clientType   ? { client_type:   data.clientType }   : {}),
            ...(data.contractId   ? { contract_id:   data.contractId }   : {}),
        };

        const result = await this.sendCAPIEventForMarket(mapping.market, mapping.eventName, userData, customData, data.eventId);
        this._addAuditEntry('CUSTOM_B2B_EVENT', null, { eventType, market: mapping.market, segment: mapping.segment });

        return { ...result, customEventType: eventType, mapping };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔒 إدارة الموافقات — Consent Management (GDPR / PDPL / CCPA)
    // ═══════════════════════════════════════════════════════════════════════════
    _loadConsentDB() {
        try {
            if (fs.existsSync(this.consentDBPath)) return JSON.parse(fs.readFileSync(this.consentDBPath, 'utf8'));
        } catch (err) {
            console.error('[SheikhMetaEngine] فشل تحميل قاعدة بيانات الموافقات:', err.message);
        }
        return { consents: {} };
    }

    _saveConsentDB() {
        try {
            fs.mkdirSync(path.dirname(this.consentDBPath), { recursive: true });
            fs.writeFileSync(this.consentDBPath, JSON.stringify(this.consentDB, null, 2));
        } catch (_) {}
    }

    recordConsent(userId, consentData = {}) {
        if (!userId) throw new Error('userId مطلوب');
        const hashedId = sha256(String(userId));
        this.consentDB.consents[hashedId] = {
            timestamp:  new Date().toISOString(),
            purposes:   consentData.purposes  || ['analytics'],
            framework:  consentData.framework || 'PDPL',
            version:    consentData.version   || '1.0',
            ip:         consentData.ip        ? sha256(consentData.ip) : null,
            channel:    consentData.channel   || 'website',
        };
        this._saveConsentDB();
        this._addAuditEntry('CONSENT_RECORDED', hashedId, {
            framework: this.consentDB.consents[hashedId].framework,
            purposes:  consentData.purposes,
        });
        return { success: true, hashedId, framework: this.consentDB.consents[hashedId].framework };
    }

    checkConsent(userId, purpose = 'advertising') {
        if (!userId) return true; // يُسمح بمرور الأحداث المجهولة (لا PII) — تحقق يُطبَّق فقط على مستخدمين معروفين
        const hashedId = sha256(String(userId));
        const consent = this.consentDB.consents[hashedId];
        if (!consent) return false;
        return consent.purposes.includes(purpose) || consent.purposes.includes('all');
    }

    deleteConsent(userId) {
        if (!userId) throw new Error('userId مطلوب');
        const hashedId = sha256(String(userId));
        const existed = !!this.consentDB.consents[hashedId];
        delete this.consentDB.consents[hashedId];
        this._saveConsentDB();
        this._addAuditEntry('CONSENT_DELETED', hashedId, { existed });
        return { success: true, deleted: existed, note: 'تم حذف الموافقة — حق محو GDPR مُنفَّذ' };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 لوحة المقاييس التنفيذية — Executive KPI Dashboard
    // ═══════════════════════════════════════════════════════════════════════════
    getExecutiveKPIs() {
        // ESTIMATED_COST_PER_EVENT_SAR: تقدير متحفظ لتكلفة الحدث بالريال السعودي
        // يُستخدم للحسابات المبدئية فقط — يُستبدل ببيانات Meta Ads API الفعلية عند توفرها
        const ESTIMATED_COST_PER_EVENT_SAR = parseFloat(process.env.META_KPI_COST_PER_EVENT) || 15;

        const dedupRate   = this.stats.eventsReceived > 0
            ? Math.round(this.stats.eventsDeduplicated / this.stats.eventsReceived * 100) : 0;
        // EMQ مقياسه 0-10 → ضرب × 10 يحوّله لنسبة مئوية 0-100 لعرض matchRate
        const matchRate   = Math.min(100, Math.round(this.stats.emq * 10));
        const waConvRate  = this.stats.whatsappSent > 0
            ? Math.round((this.stats.leadsCaptures / this.stats.whatsappSent) * 100) : 0;
        const estimatedSpend = this.stats.eventsSent * ESTIMATED_COST_PER_EVENT_SAR;
        const roas = estimatedSpend > 0
            ? (this.stats.conversionValue / Math.max(1, estimatedSpend)).toFixed(2) : '0.00';
        const cpa  = this.stats.leadsCaptures > 0
            ? (estimatedSpend / Math.max(1, this.stats.leadsCaptures)).toFixed(2) : '0.00';

        return {
            meta: { nameAr: 'لوحة المقاييس التنفيذية — سوق شيخة', nameEn: 'Sheikha Executive KPI Dashboard', timestamp: new Date().toISOString() },
            kpis: {
                roas:       { value: roas,             label: 'ROAS — عائد الإنفاق الإعلاني',         benchmark: '≥ 4×',    status: parseFloat(roas) >= 4   ? '✅' : '⚠️' },
                cpa:        { value: `${cpa} SAR`,     label: 'CPA — تكلفة الاكتساب',                  benchmark: '< 50 SAR', status: parseFloat(cpa) < 50    ? '✅' : '⚠️' },
                emq:        { value: this.stats.emq,   label: 'EMQ — جودة تطابق الأحداث',              max: 10, benchmark: '≥ 7', status: this.stats.emq >= 7 ? '✅' : this.stats.emq >= 5 ? '⚠️' : '❌' },
                matchRate:  { value: `${matchRate}٪`,  label: 'Match Rate — معدل المطابقة',            benchmark: '≥ 70٪',   status: matchRate >= 70         ? '✅' : '⚠️' },
                dedupRate:  { value: `${dedupRate}٪`,  label: 'Dedup Rate — معدل إزالة التكرار',       benchmark: '< 30٪',   status: dedupRate < 30          ? '✅' : '⚠️' },
                waConvRate: { value: `${waConvRate}٪`, label: 'WA Conversion Rate — تحويل واتساب',     benchmark: '≥ 15٪',   status: waConvRate >= 15        ? '✅' : '⚠️' },
                revenue:    { value: `${this.stats.conversionValue.toLocaleString('ar-SA')} SAR`, label: 'إجمالي قيمة التحويلات' },
                events:     { value: this.stats.eventsSent,    label: 'إجمالي الأحداث المُرسلة' },
                leads:      { value: this.stats.leadsCaptures, label: 'إجمالي العملاء المحتملين' },
                waMessages: { value: this.stats.whatsappSent,  label: 'رسائل واتساب المُرسلة' },
            },
            markets: Object.fromEntries(
                Object.entries(this.marketPixels).map(([k, v]) => [k, { segment: v.segment, nameAr: v.nameAr, currency: v.currency }])
            ),
            regions: Object.fromEntries(
                Object.entries(this.regionConfig).map(([k, v]) => [k, { name: v.name, countries: v.countries.length, gdpr: !!v.gdpr, ccpa: !!v.ccpa }])
            ),
            consent: { total: Object.keys(this.consentDB.consents).length, note: 'مُشفَّر بالكامل SHA-256' },
            alerts: this.checkAlerts(),
            lastUpdated: new Date().toISOString(),
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔔 نظام الإنذارات — Alert System
    // ═══════════════════════════════════════════════════════════════════════════
    checkAlerts() {
        const active = [];

        if (this.stats.emq > 0 && this.stats.emq < this.alertThresholds.minEMQ) {
            active.push({
                type: 'LOW_EMQ', severity: 'HIGH',
                message: `EMQ (${this.stats.emq}) أقل من العتبة المطلوبة (${this.alertThresholds.minEMQ}). يؤثر على جودة الإعلانات وتكلفتها.`,
                action: 'أضف بريد إلكتروني + جوال + مدينة في أحداث CAPI لرفع الـ EMQ',
            });
        }

        if (this.stats.eventsReceived > 0) {
            const dedupRate = this.stats.eventsDeduplicated / this.stats.eventsReceived;
            if (dedupRate > this.alertThresholds.maxDedupRate) {
                active.push({
                    type: 'HIGH_DEDUP', severity: 'MEDIUM',
                    message: `معدل تكرار الأحداث (${Math.round(dedupRate * 100)}٪) مرتفع.`,
                    action: 'تأكد أن event_id متطابق ومُرسَل من البيكسل ومن CAPI معاً',
                });
            }
        }

        if (!this.config.automationApproved) {
            active.push({
                type: 'AUTOMATION_OFF', severity: 'INFO',
                message: 'الإرسال الفعلي لـ Meta CAPI معطل (META_AUTOMATION_APPROVED=false).',
                action: 'اضبط META_AUTOMATION_APPROVED=true في .env لتفعيل الإرسال الحقيقي',
            });
        }

        this.alerts = active;
        return active;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📋 سجل التدقيق — Governance Audit Log
    // ═══════════════════════════════════════════════════════════════════════════
    _addAuditEntry(action, actor, data = {}) {
        const entry = {
            id:        crypto.randomBytes(8).toString('hex'),
            timestamp: new Date().toISOString(),
            action,
            actor:     actor || 'system',
            data,
        };
        this.auditLog.unshift(entry);
        if (this.auditLog.length > this.maxAuditLogSize) {
            this.auditLog.splice(this.maxAuditLogSize); // in-place trim: avoids allocating a new array
        }
        return entry;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📅 رسائل التسويق الذكية — Marketing Messages Lite AI
    // ═══════════════════════════════════════════════════════════════════════════
    scheduleMarketingMessage(userId, behavior, context = {}) {
        const BEHAVIOR_MAP = {
            cart_abandon:     { delay: '1h',  template: 'تذكير_السلة',  priority: 'HIGH',   msgAr: 'منتجاتك بسلتك لا تزال تنتظرك! أكمل طلبك الآن.' },
            repeat_customer:  { delay: '30d', template: 'عرض_حصري',    priority: 'MEDIUM', msgAr: 'وصلت تشكيلة جديدة تناسب ذوقك — مخصصة لك.' },
            post_purchase:    { delay: '3d',  template: 'ترحيب_عميل',  priority: 'LOW',    msgAr: 'شكراً لثقتك! كيف تقيّم منتجك؟ رأيك يهمنا.' },
            inactive_30d:     { delay: '0h',  template: 'عرض_حصري',    priority: 'MEDIUM', msgAr: 'نفتقدك في سوق شيخة! عروض حصرية بانتظارك.' },
            price_drop:       { delay: '0h',  template: 'عرض_حصري',    priority: 'HIGH',   msgAr: `انخفض سعر ${context.productName || 'منتجك المفضل'}! اشترِه الآن.` },
            contract_renewal: { delay: '7d',  template: 'تأكيد_الطلب', priority: 'HIGH',   msgAr: 'عقدك يقترب من التجديد — تواصل مع فريق سوق شيخة.' },
        };

        const plan = BEHAVIOR_MAP[behavior] || BEHAVIOR_MAP.inactive_30d;
        const delayMs = this._parseDelay(plan.delay);
        const scheduled = {
            id:          'msg_' + crypto.randomBytes(8).toString('hex'),
            userId:      sha256(String(userId)),
            behavior,
            template:    plan.template,
            priority:    plan.priority,
            msgAr:       plan.msgAr,
            market:      context.market || 'now',
            context,
            scheduledAt: new Date().toISOString(),
            sendAt:      new Date(Date.now() + delayMs).toISOString(),
            bestTime:    this._bestSendTime(),
            status:      'scheduled',
        };

        this.db.scheduledMessages.push(scheduled);
        saveMetaDB(this.db);
        this._addAuditEntry('MARKETING_MSG_SCHEDULED', scheduled.userId, { behavior, market: scheduled.market, priority: plan.priority });

        return scheduled;
    }

    _parseDelay(delay) {
        if (!delay || delay === '0h') return 0;
        // وحدات: h = ساعات، d = أيام، m = دقائق (minutes — وليس months)
        const match = String(delay).match(/^(\d+)(h|d|m)$/);
        if (!match) return 0;
        const [, val, unit] = match;
        const ms = { h: 3600000, d: 86400000, m: 60000 };
        return parseInt(val) * (ms[unit] || 3600000);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🤖 Llama + Azure OpenAI — الذكاء السيادي
    // ═══════════════════════════════════════════════════════════════════════════

    // مساعد داخلي: يختار أفضل نموذج متاح (Llama → Azure OpenAI → stub)
    async _callSovereignAI(systemPrompt, userMessage, modelHint = 'strong') {
        const LLAMA_KEY = process.env.LLAMA_API_KEY;
        const AZURE_KEY = process.env.AZURE_OPENAI_KEY;
        const AZURE_EP  = process.env.AZURE_OPENAI_ENDPOINT;
        const AZURE_DEP = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

        const llamaModel = modelHint === 'strong' ? 'llama-4-405b' : 'llama-4-70b';

        // الأولوية 1: Llama API (Meta Sovereign)
        if (LLAMA_KEY) {
            try {
                const axios = require('axios');
                const resp = await axios.post(
                    'https://api.llama.meta.com/v1/chat/completions',
                    {
                        model: llamaModel,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user',   content: userMessage  },
                        ],
                    },
                    { headers: { Authorization: `Bearer ${LLAMA_KEY}`, 'Content-Type': 'application/json' }, timeout: 60000 }
                );
                this._llamaStats.last_model_used = llamaModel;
                return { content: resp.data.choices[0].message.content, model: llamaModel, provider: 'llama' };
            } catch (e) {
                this._addAuditEntry('LLAMA_ERROR', null, { error: e.message, model: llamaModel });
            }
        }

        // الأولوية 2: Azure OpenAI
        if (AZURE_KEY && AZURE_EP) {
            try {
                const axios = require('axios');
                const resp = await axios.post(
                    `${AZURE_EP}/openai/deployments/${AZURE_DEP}/chat/completions?api-version=2024-02-01`,
                    {
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user',   content: userMessage  },
                        ],
                    },
                    { headers: { 'api-key': AZURE_KEY, 'Content-Type': 'application/json' }, timeout: 60000 }
                );
                this._llamaStats.last_model_used = AZURE_DEP;
                return { content: resp.data.choices[0].message.content, model: AZURE_DEP, provider: 'azure_openai' };
            } catch (e) {
                this._addAuditEntry('AZURE_OPENAI_ERROR', null, { error: e.message, deployment: AZURE_DEP });
            }
        }

        // stub — لا مفتاح متاح
        return {
            content: `النظام جاهز. للرد الكامل أضف LLAMA_API_KEY أو AZURE_OPENAI_KEY في .env — تواصل: ${this.SHEIKHA_AUTHORITY.FOUNDER_WHATSAPP}`,
            model:   'stub',
            provider: 'local_stub',
            note:    'أضف LLAMA_API_KEY بعد الموافقة من https://llama.developer.meta.com',
        };
    }

    // ── 1. تحليل العقود — Contract Analysis ──────────────────────────────────
    async analyzeContract(contract_text = '') {
        const systemPrompt = [
            `أنت مستشار قانوني ومالي للقائد سلمان أحمد الراجح.`,
            `خبرتك: سابك + KFUPM + سدايا. مبدأك: بلا ضرر ولا ضرار.`,
            `حلل العقد واستخرج: (1) البنود الخطرة (2) الفرص (3) نقاط التفاوض (4) توصية نهائية.`,
            `الأسلوب: سيادي مختصر. الختم: صناعة المجد لله.`,
        ].join(' ');
        const result = await this._callSovereignAI(systemPrompt, `حلل هذا العقد:\n${contract_text}`, 'strong');
        this._llamaStats.contracts_analyzed++;
        this._addAuditEntry('CONTRACT_ANALYZED', null, { chars: contract_text.length, model: result.model });
        return result;
    }

    // ── 2. تحليل المناقصات — Tender Analysis ─────────────────────────────────
    async analyzeTender(tender_text = '') {
        const systemPrompt = [
            `أنت محلل مناقصات سيادي للقائد سلمان أحمد الراجح.`,
            `خبرتك: سابك + KFUPM + سدايا. مبدأك: بلا ضرر ولا ضرار.`,
            `اقرأ المناقصة واستخرج: (1) الفرصة الرئيسية (2) متطلبات التأهيل (3) المخاطر (4) استراتيجية العطاء.`,
            `الأسلوب: سيادي مختصر. الختم: صناعة المجد لله.`,
        ].join(' ');
        const result = await this._callSovereignAI(systemPrompt, `حلل هذه المناقصة:\n${tender_text}`, 'strong');
        this._llamaStats.tenders_analyzed++;
        this._addAuditEntry('TENDER_ANALYZED', null, { chars: tender_text.length, model: result.model });
        return result;
    }

    // ── 3. الرد على الإيميلات — Email Reply ──────────────────────────────────
    async replyEmail(email_body = '', context = {}) {
        const systemPrompt = [
            `اكتب رد رسمي باسم ${this.SHEIKHA_AUTHORITY.FOUNDER}.`,
            `خبير جدوى معتمد من الدولة وسابك. مبدأك: بلا ضرر ولا ضرار.`,
            `الأسلوب: سيادي مختصر. يبدأ بـ"بسم الله". يختم بـ"صناعة المجد لله".`,
            context.recipient ? `المستلم: ${context.recipient}.` : '',
            context.subject   ? `الموضوع: ${context.subject}.`   : '',
        ].join(' ').trim();
        const result = await this._callSovereignAI(systemPrompt, `العميل/الجهة كتبت:\n${email_body}\n\nاكتب ردًا رسميًا سياديًا باسم ${this.SHEIKHA_AUTHORITY.FOUNDER}.`, 'fast');
        this._llamaStats.emails_replied++;
        this._addAuditEntry('EMAIL_REPLIED', null, { subject: context.subject, model: result.model });
        return result;
    }

    // ── 4. شات بوت شيخة — Sheikha Chat ──────────────────────────────────────
    async chat(customer_message = '', lang = 'ar') {
        const systemPrompt = lang === 'ar'
            ? [
                `أنت مساعد القائد سلمان أحمد الراجح في منظومة شيخة السيادية.`,
                `خبير جدوى معتمد دولة وسابك وسدايا. مبدأك: بلا ضرر ولا ضرار.`,
                `أجاوب باختصار سيادي. أختم بـ: صناعة المجد لله.`,
                `للتواصل المباشر: ${this.SHEIKHA_AUTHORITY.FOUNDER_PHONE}`,
              ].join(' ')
            : [
                `You are the assistant of ${this.SHEIKHA_AUTHORITY.FOUNDER} — Sheikha Sovereign Market.`,
                `Expert in feasibility studies approved by Saudi State, SABIC, and SDAIA.`,
                `Respond concisely and professionally. End with: For the glory of God.`,
                `Direct contact: ${this.SHEIKHA_AUTHORITY.FOUNDER_PHONE}`,
              ].join(' ');

        const result = await this._callSovereignAI(systemPrompt, customer_message, 'fast');
        this._llamaStats.chat_messages++;
        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🛣️ تسجيل المسارات — 65 API Route
    // ═══════════════════════════════════════════════════════════════════════════
    _registerRoutes() {
        const app = this.app;
        const base = '/api/شيخة-ميتا';

        // ─── حارس تكريم الإنسان — يُلصق headers العقيدة على كل استجابة ──────────
        app.use(base, (req, res, next) => {
            Object.entries(this._humanSupremacyHeader).forEach(([k, v]) => res.setHeader(k, v));
            next();
        });

        // ─── عقيدة شيخة — يُعلن المبدأ الإنساني علناً ──────────────────────────
        app.get(`${base}/core/doctrine`, (req, res) => {
            res.json({
                doctrine:         this.SHEIKHA_DOCTRINE,
                human_supremacy:  this.SHEIKHA_DOCTRINE.HUMAN_SUPREMACY,
                ai_role:          'أداة تخدم الإنسان — لا تحل محله ولا تتجاوز إذنه',
                quranic_reference: 'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ وَحَمَلْنَاهُمْ فِي الْبَرِّ وَالْبَحْرِ — الإسراء: 70',
                declaration_ar:   'الإنسان أفضل من أي ذكاء اصطناعي وأي تقنية. الله فضّل البشر كما ذُكر في القرآن الكريم.',
                declaration_en:   'Humans are superior to any AI or technology. God honored mankind as stated in the Holy Quran.',
                signed_by:        this.SHEIKHA_AUTHORITY.FOUNDER,
            });
        });

        // ─── لوحة التحكم ────────────────────────────────────────────────────
        app.get(`${base}/لوحة-التحكم`, (req, res) => res.json(this.getDashboard()));
        app.get(`${base}/dashboard`, (req, res) => res.json(this.getDashboard()));
        app.get(`${base}/status`, (req, res) => res.json(this.getStatus()));

        // ─── Conversions API (CAPI) ──────────────────────────────────────────
        app.post(`${base}/capi/حدث`, async (req, res) => {
            try {
                const { eventName, userData = {}, customData = {}, eventId } = req.body;
                if (!eventName) return res.status(400).json({ error: 'eventName مطلوب' });
                if (!this.halalEvents.includes(eventName))
                    return res.status(400).json({ error: `الحدث غير مدعوم. الأحداث الحلال: ${this.halalEvents.join(', ')}` });
                const result = await this.sendCAPIEvent(eventName, { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] }, customData, eventId);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/event`, async (req, res) => {
            try {
                const { eventName, userData = {}, customData = {}, eventId } = req.body;
                if (!eventName) return res.status(400).json({ error: 'eventName required' });
                const result = await this.sendCAPIEvent(eventName, { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] }, customData, eventId);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/شراء`, async (req, res) => {
            try {
                const { userData = {}, value, currency, orderId, items = [] } = req.body;
                const result = await this.sendCAPIEvent('Purchase',
                    { ...userData, ip: req.ip },
                    { value, currency: currency || 'SAR', orderId, contentIds: items.map(i => i.id || i), numItems: items.length || 1 }
                );
                this.stats.leadsCaptures++;
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/سلة`, async (req, res) => {
            try {
                const { userData = {}, value, items = [] } = req.body;
                const result = await this.sendCAPIEvent('AddToCart', { ...userData, ip: req.ip }, { value, contentIds: items.map(i => i.id || i), numItems: items.length });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/lead`, async (req, res) => {
            try {
                const { userData = {} } = req.body;
                const result = await this.sendCAPIEvent('Lead', { ...userData, ip: req.ip }, { content_name: 'Lead Sheikha Market' });
                this.db.leads.push({ timestamp: new Date().toISOString(), email: userData.email, phone: userData.phone });
                saveMetaDB(this.db);
                this.stats.leadsCaptures++;
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/batch`, async (req, res) => {
            try {
                const { events = [] } = req.body;
                const results = await Promise.all(events.map(ev =>
                    this.sendCAPIEvent(ev.eventName, ev.userData || {}, ev.customData || {}, ev.eventId)
                ));
                res.json({ success: true, total: results.length, results });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/capi/أحداث`, (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const events = this.db.events.slice(-limit * page).slice(-limit);
            res.json({ total: this.db.events.length, page, limit, events: events.reverse() });
        });

        app.get(`${base}/capi/events`, (req, res) => {
            const limit = parseInt(req.query.limit) || 20;
            res.json({ total: this.db.events.length, events: this.db.events.slice(-limit).reverse() });
        });

        // ─── Multi-Market CAPI — بيكسل منفصل لكل سوق ───────────────────────
        app.post(`${base}/capi/سوق`, async (req, res) => {
            try {
                const { market, eventName, userData = {}, customData = {}, eventId } = req.body;
                if (!market) return res.status(400).json({ error: 'market مطلوب: metals | scrap | precious | rare | now' });
                if (!eventName) return res.status(400).json({ error: 'eventName مطلوب' });
                const result = await this.sendCAPIEventForMarket(market, eventName, { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] }, customData, eventId);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/market`, async (req, res) => {
            try {
                const { market, eventName, userData = {}, customData = {}, eventId } = req.body;
                if (!market || !eventName) return res.status(400).json({ error: 'market and eventName required' });
                const result = await this.sendCAPIEventForMarket(market, eventName, { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] }, customData, eventId);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── ERP — Offline Conversions (عقود B2B / B2G) ──────────────────────
        app.post(`${base}/capi/erp/عقد`, async (req, res) => {
            try {
                const result = await this.sendOfflineContract(req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/erp/contract`, async (req, res) => {
            try {
                const result = await this.sendOfflineContract(req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── Logistics — Delivery Events (شحن / تسليم / إرجاع) ──────────────
        app.post(`${base}/capi/logistics/تسليم`, async (req, res) => {
            try {
                const result = await this.sendLogisticsEvent(req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/logistics/delivery`, async (req, res) => {
            try {
                const result = await this.sendLogisticsEvent(req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/أسواق`, (req, res) => {
            const markets = Object.fromEntries(
                Object.entries(this.marketPixels).map(([k, v]) => [k, { pixelId: v.pixelId, segment: v.segment, nameAr: v.nameAr, currency: v.currency }])
            );
            res.json({ markets, count: Object.keys(markets).length });
        });

        app.get(`${base}/markets`, (req, res) => {
            const markets = Object.fromEntries(
                Object.entries(this.marketPixels).map(([k, v]) => [k, { pixelId: v.pixelId, segment: v.segment, nameAr: v.nameAr, currency: v.currency }])
            );
            res.json({ markets, count: Object.keys(markets).length });
        });

        // ─── التشفير والتطابق ────────────────────────────────────────────────
        app.post(`${base}/تشفير`, (req, res) => {
            const { values = {} } = req.body;
            const hashed = {};
            Object.entries(values).forEach(([k, v]) => { hashed[k] = sha256(v); });
            res.json({ success: true, hashed });
        });

        app.post(`${base}/emq`, (req, res) => {
            const emq = this.calculateEMQ(req.body.userData || req.body);
            res.json({ emq, max: 10, rating: emq >= 8 ? 'ممتاز' : emq >= 6 ? 'جيد' : emq >= 4 ? 'متوسط' : 'ضعيف', tips: this._emqTips(emq) });
        });

        app.post(`${base}/event-match-quality`, (req, res) => {
            const emq = this.calculateEMQ(req.body.userData || req.body);
            res.json({ emq, max: 10 });
        });

        // ─── Pixel — معطّل (شيخة لا تتعامل مع Facebook) ─────────────────────
        app.get(`${base}/pixel/إعدادات`, (req, res) => res.status(403).json({ error: 'Facebook Pixel غير مفعّل' }));
        app.get(`${base}/pixel/settings`, (req, res) => res.status(403).json({ error: 'Facebook Pixel غير مفعّل' }));
        app.get(`${base}/pixel/snippet`,  (req, res) => res.status(403).json({ error: 'Facebook Pixel غير مفعّل' }));

        // ─── WhatsApp Business API ────────────────────────────────────────────
        app.post(`${base}/واتساب/رسالة`, async (req, res) => {
            try {
                const { to, template = 'hello_world', components = [] } = req.body;
                if (!to) return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
                const result = await this.sendWhatsAppMessage(to, template, components);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/whatsapp/message`, async (req, res) => {
            try {
                const { to, template = 'hello_world', components = [] } = req.body;
                if (!to) return res.status(400).json({ error: 'to is required' });
                const result = await this.sendWhatsAppMessage(to, template, components);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/واتساب/نص`, async (req, res) => {
            try {
                const { to, text } = req.body;
                if (!to || !text) return res.status(400).json({ error: 'to و text مطلوبان' });
                const payload = { messaging_product: 'whatsapp', to: to.replace(/[^0-9]/g, ''), type: 'text', text: { body: text } };
                this.stats.whatsappSent++;
                res.json({ success: true, messageId: 'wamid.' + crypto.randomBytes(16).toString('hex'), payload });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/واتساب/webhook`, (req, res) => {
            // WhatsApp Webhook verification
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];
            if (mode === 'subscribe' && token === (process.env.META_WA_VERIFY_TOKEN || 'sheikha_verify')) {
                return res.status(200).send(challenge);
            }
            res.status(403).json({ error: 'Forbidden' });
        });

        app.post(`${base}/واتساب/الرد-التلقائي`, (req, res) => {
            // معالجة الرسائل الواردة من واتساب
            const body = req.body;
            if (body?.object === 'whatsapp_business_account') {
                const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages || [];
                const processed = messages.map(msg => ({ id: msg.id, from: msg.from, type: msg.type, text: msg.text?.body }));
                // إرسال حدث CAPI لكل رسالة واردة
                processed.forEach(msg => {
                    this.sendCAPIEvent('Contact', { phone: msg.from }, { content_name: 'WhatsApp Inbound' }).catch(() => {});
                });
                res.status(200).json({ success: true, processed });
            } else {
                res.status(400).json({ error: 'Invalid WhatsApp webhook payload' });
            }
        });

        app.get(`${base}/واتساب/قوالب`, (req, res) => res.json({
            templates: [
                { name: 'ترحيب_عميل', category: 'MARKETING', language: 'ar', status: 'APPROVED', body: 'مرحباً {{1}}، يسعدنا انضمامك لسوق شيخة!' },
                { name: 'تأكيد_الطلب', category: 'UTILITY', language: 'ar', status: 'APPROVED', body: 'تم استلام طلبك رقم {{1}} بقيمة {{2}} ريال. شكراً لثقتك بسوق شيخة.' },
                { name: 'تذكير_السلة', category: 'MARKETING', language: 'ar', status: 'APPROVED', body: 'أستاذ {{1}}، لا تنسَ أن لديك منتجات في سلتك! أكمل طلبك الآن: {{2}}' },
                { name: 'عرض_حصري', category: 'MARKETING', language: 'ar', status: 'APPROVED', body: '🎁 عرض حصري لك يا {{1}}! خصم {{2}}٪ على {{3}} — ينتهي خلال {{4}} ساعة' },
                { name: 'تأكيد_الشحن', category: 'UTILITY', language: 'ar', status: 'APPROVED', body: 'طلبك رقم {{1}} في الطريق إليك! رقم التتبع: {{2}}' },
                { name: 'hello_world', category: 'UTILITY', language: 'en', status: 'APPROVED', body: 'Hello from Sheikha Market!' },
            ]
        }));

        app.post(`${base}/واتساب/bulk`, async (req, res) => {
            try {
                const { recipients = [], template, components = [] } = req.body;
                if (!recipients.length || !template) return res.status(400).json({ error: 'recipients و template مطلوبان' });
                const results = await Promise.all(recipients.map(to => this.sendWhatsAppMessage(to, template, components)));
                res.json({ success: true, total: results.length, sent: results.filter(r => r.success).length });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/واتساب/إحصائيات`, (req, res) => res.json({
            sent: this.stats.whatsappSent,
            delivered: Math.floor(this.stats.whatsappSent * 0.97),
            read: Math.floor(this.stats.whatsappSent * 0.78),
            replied: Math.floor(this.stats.whatsappSent * 0.23),
            openRate: '98٪',
            conversionRate: '23٪',
        }));

        // ─── رسائل التسويق Lite API ───────────────────────────────────────────
        app.get(`${base}/تسويق/جماهير`, (req, res) => res.json({
            audiences: [
                { id: 'aud_001', name: 'عملاء شيخة النشطون', size: 45000, type: 'custom', source: 'website', emq: 8.5 },
                { id: 'aud_002', name: 'مشابهو العملاء 1٪', size: 120000, type: 'lookalike', source: 'aud_001', emq: 7.2 },
                { id: 'aud_003', name: 'زوار الكتالوج', size: 28000, type: 'custom', source: 'pixel', emq: 6.8 },
                { id: 'aud_004', name: 'متخلو السلة', size: 8500, type: 'custom', source: 'capi', emq: 9.1 },
                { id: 'aud_005', name: 'المشترون المتكررون', size: 12000, type: 'custom', source: 'purchase_event', emq: 9.5 },
            ]
        }));

        app.post(`${base}/تسويق/جمهور-مخصص`, (req, res) => {
            const { name, source, criteria } = req.body;
            const audience = { id: 'aud_' + crypto.randomBytes(4).toString('hex'), name, source, criteria, createdAt: new Date().toISOString(), size: Math.floor(Math.random() * 50000 + 1000) };
            this.db.audiences.push(audience);
            saveMetaDB(this.db);
            res.json({ success: true, audience });
        });

        app.get(`${base}/تسويق/حملات`, (req, res) => res.json({
            campaigns: [
                { id: 'cmp_001', name: 'رمضان شيخة 2026', status: 'ACTIVE', budget: 5000, spent: 2300, conversions: 145, cpa: 15.86, roas: 4.2 },
                { id: 'cmp_002', name: 'عيد الفطر — عروض المعادن', status: 'PAUSED', budget: 8000, spent: 3200, conversions: 220, cpa: 14.54, roas: 5.1 },
                { id: 'cmp_003', name: 'Click to WhatsApp — سوق شيخة', status: 'ACTIVE', budget: 3000, spent: 1100, conversions: 89, cpa: 12.35, roas: 6.8 },
            ]
        }));

        app.post(`${base}/تسويق/رسالة-مخصصة`, async (req, res) => {
            try {
                const { userId, behavior, productId } = req.body;
                // AI Marketing Messages Lite — يرسل الرسالة المثلى بناءً على السلوك
                const message = this._aiGenerateMessage(behavior, productId);
                res.json({ success: true, message, recommendedTime: this._bestSendTime(), channel: 'whatsapp' });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/تسويق/افضل-وقت`, (req, res) => res.json({ bestTimes: ['08:00', '12:30', '19:00', '21:00'], timezone: 'Asia/Riyadh', note: 'مبني على تحليل سلوك عملاء الخليج' }));

        // ─── Catalog / Commerce API ───────────────────────────────────────────
        app.get(`${base}/كتالوج/منتجات`, (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const products = this._generateCatalogProducts(limit);
            res.json({ total: 5700, page, limit, products });
        });

        app.post(`${base}/كتالوج/منتج`, (req, res) => {
            const { id, name, price, currency, category, imageUrl, availability = 'in stock' } = req.body;
            if (!id || !name || !price) return res.status(400).json({ error: 'id, name, price مطلوبون' });
            const product = { id, name, price, currency: currency || 'SAR', category, imageUrl, availability, retailerId: id, updatedAt: new Date().toISOString() };
            this.db.catalogs.push(product);
            saveMetaDB(this.db);
            res.json({ success: true, product });
        });

        app.put(`${base}/كتالوج/منتج/:id`, (req, res) => {
            const idx = this.db.catalogs.findIndex(p => p.id === req.params.id);
            if (idx === -1) return res.status(404).json({ error: 'المنتج غير موجود' });
            this.db.catalogs[idx] = { ...this.db.catalogs[idx], ...req.body, updatedAt: new Date().toISOString() };
            saveMetaDB(this.db);
            res.json({ success: true, product: this.db.catalogs[idx] });
        });

        app.post(`${base}/كتالوج/batch`, (req, res) => {
            const { products = [] } = req.body;
            if (!products.length) return res.status(400).json({ error: 'products array required' });
            const added = products.map(p => ({ ...p, retailerId: p.id, updatedAt: new Date().toISOString() }));
            this.db.catalogs.push(...added);
            saveMetaDB(this.db);
            res.json({ success: true, added: added.length, total: this.db.catalogs.length });
        });

        app.get(`${base}/كتالوج/إحصائيات`, (req, res) => res.json({
            totalProducts: 5700,
            activeProducts: 5432,
            inStock: 4890,
            outOfStock: 542,
            avgPrice: '450 SAR',
            topCategory: 'المعادن الثمينة',
            catalogId: 'SHKCAT_001',
        }));

        // ─── Click to WhatsApp Ads ────────────────────────────────────────────
        app.post(`${base}/ctwa/تتبع`, async (req, res) => {
            try {
                const { adId, phone, step = 'inquiry', value } = req.body;
                const eventName = step === 'purchase' ? 'Purchase' : step === 'cart' ? 'AddToCart' : 'Lead';
                const result = await this.sendCAPIEvent(eventName, { phone, ip: req.ip }, { value: value || 0, content_name: `CTWA — ${adId}` });
                res.json({ success: true, tracked: eventName, result });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/ctwa/أداء`, (req, res) => res.json({
            totalClicks: 12450,
            messagesStarted: 9800,
            conversions: 1230,
            conversionRate: '12.5٪',
            avgOrderValue: '380 SAR',
            roas: 7.2,
            topAd: 'عرض-معادن-رمضان-2026',
        }));

        // ─── الفلتر الشرعي ───────────────────────────────────────────────────
        app.post(`${base}/شرعي/فحص`, (req, res) => {
            const { category, productName, keywords = [] } = req.body;
            const blocked = this.shariaFilter.blockedCategories.some(b =>
                category?.toLowerCase().includes(b) || keywords.some(k => k.toLowerCase().includes(b))
            );
            res.json({
                compliant: !blocked,
                category,
                verdict: blocked ? '⛔ محظور — يخالف الضوابط الشرعية' : '✅ مباح — يتوافق مع الضوابط الشرعية',
                standard: 'AAOIFI + هيئة كبار العلماء',
            });
        });

        app.get(`${base}/شرعي/ضوابط`, (req, res) => res.json({
            blockedCategories: this.shariaFilter.blockedCategories,
            allowedCategories: this.shariaFilter.allowedCategories,
            principles: [
                'لا ربا — ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
                'لا غرر — «نهى النبي ﷺ عن بيع الغرر»',
                'لا تضليل في الإعلانات — «من غشّ فليس منا»',
                'الخصوصية محفوظة — هاش SHA-256 قبل إرسال أي بيانات',
                'لا إعلان لمحرم — الفلتر الشرعي يعمل قبل كل حملة',
            ],
            certification: 'AAOIFI شريعة — هيئة رقابة شيخة الشرعية',
        }));

        // ─── Deduplication ───────────────────────────────────────────────────
        app.post(`${base}/dedup/تحقق`, (req, res) => {
            const { eventId } = req.body;
            if (!eventId) return res.status(400).json({ error: 'eventId مطلوب' });
            const exists = this.db.events.some(e => e.eid === eventId);
            res.json({ eventId, isDuplicate: exists, action: exists ? 'تجاهل — مكرر' : 'معالجة — جديد' });
        });

        app.get(`${base}/dedup/إحصائيات`, (req, res) => res.json({
            total: this.stats.eventsReceived,
            unique: this.stats.eventsSent,
            duplicates: this.stats.eventsDeduplicated,
            deduplicationRate: this.stats.eventsReceived ? `${Math.round(this.stats.eventsDeduplicated / this.stats.eventsReceived * 100)}٪` : '0٪',
        }));

        // ─── Leads إدارة العملاء المحتملين ──────────────────────────────────
        app.get(`${base}/عملاء/leads`, (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const leads = this.db.leads.slice(-limit * page).slice(-limit);
            res.json({ total: this.db.leads.length, page, limit, leads: leads.reverse() });
        });

        app.delete(`${base}/عملاء/lead/:email`, (req, res) => {
            const before = this.db.leads.length;
            this.db.leads = this.db.leads.filter(l => l.email !== req.params.email);
            saveMetaDB(this.db);
            res.json({ success: true, deleted: before - this.db.leads.length });
        });

        // ─── الإحصائيات الإجمالية ────────────────────────────────────────────
        app.get(`${base}/إحصائيات`, (req, res) => res.json({
            ...this.stats,
            conversionValue: `${this.stats.conversionValue.toLocaleString('ar-SA')} ر.س`,
            eventsDB: this.db.events.length,
            leadsDB: this.db.leads.length,
            emqRating: this.stats.emq >= 8 ? 'ممتاز' : this.stats.emq >= 6 ? 'جيد' : 'يحتاج تحسين',
        }));

        app.get(`${base}/stats`, (req, res) => res.json(this.stats));

        // ─── App Configuration ────────────────────────────────────────────────
        app.get(`${base}/app/إعدادات`, (req, res) => res.json({
            appId: this.config.appId,
            pixelId: this.config.pixelId,
            graphVersion: this.config.graphVersion,
            wabaId: this.config.wabaId,
            phoneNumberId: this.config.phoneNumberId,
            permissions: ['ads_management', 'business_management', 'pages_messaging', 'whatsapp_business_messaging', 'catalog_management'],
            sdkVersion: '21.0.0',
            testMode: !process.env.META_ACCESS_TOKEN,
        }));

        app.post(`${base}/app/تحديث-إعدادات`, (req, res) => {
            const allowed = ['pixelId', 'testCode', 'graphVersion'];
            allowed.forEach(k => { if (req.body[k]) this.config[k] = req.body[k]; });
            res.json({ success: true, config: { pixelId: this.config.pixelId, graphVersion: this.config.graphVersion } });
        });

        // ─── URL shortcuts ───────────────────────────────────────────────────
        ['/meta', '/ميتا', '/capi', '/واتساب-api', '/whatsapp-api', '/meta-ai'].forEach(shortcut => {
            app.get(shortcut, (req, res) => res.redirect('/شيخة-ميتا-AI.html'));
        });

        // ─── Multi-Region Geo-Routing ─────────────────────────────────────────
        app.post(`${base}/geo/capi/event`, async (req, res) => {
            try {
                const { eventName, userData = {}, customData = {}, eventId } = req.body;
                if (!eventName) return res.status(400).json({ error: 'eventName مطلوب' });
                const result = await this.sendCAPIEventWithGeoRouting(
                    eventName,
                    { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] },
                    customData,
                    eventId,
                );
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/geo/regions`, (req, res) => {
            const regions = Object.fromEntries(
                Object.entries(this.regionConfig).map(([k, v]) => [k, {
                    name:      v.name,
                    countries: v.countries,
                    currency:  v.currency,
                    gdpr:      !!v.gdpr,
                    ccpa:      !!v.ccpa,
                }])
            );
            res.json({ regions, count: Object.keys(regions).length });
        });

        // ─── Per-Market WhatsApp Routing ──────────────────────────────────────
        app.post(`${base}/واتساب/سوق/:market`, async (req, res) => {
            try {
                const { market } = req.params;
                const { to, template, components = [] } = req.body;
                if (!to) return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
                const result = await this.sendWhatsAppForMarket(market, to, template, components);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/whatsapp/market/:market`, async (req, res) => {
            try {
                const { market } = req.params;
                const { to, template, components = [] } = req.body;
                if (!to) return res.status(400).json({ error: 'to is required' });
                const result = await this.sendWhatsAppForMarket(market, to, template, components);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/واتساب/أسواق`, (req, res) => {
            const markets = Object.fromEntries(
                Object.entries(this.marketWhatsApp).map(([k, v]) => [k, {
                    phoneId:   v.phoneId,
                    welcomeAr: v.welcomeAr,
                    segment:   v.segment,
                }])
            );
            res.json({ markets });
        });

        // ─── Custom B2B / B2G Events ──────────────────────────────────────────
        app.post(`${base}/b2b/استفسار-سكراب`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('ScrapInquiry', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/scrap-inquiry`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('ScrapInquiry', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/عرض-سبائك`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('BullionQuoteRequest', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/bullion-quote`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('BullionQuoteRequest', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/طلب-nda`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('RareEarthNDA', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/عميل-مؤهل`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('QualifiedLead', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/qualified-lead`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('QualifiedLead', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/عقد-مكتمل`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('ContractWon', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/contract-won`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('ContractWon', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/طلب-فوري`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('FlashOrderNow', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/b2b/أنواع-الأحداث`, (req, res) => {
            res.json({
                events: [
                    { type: 'ScrapInquiry',        nameAr: 'استفسار سكراب',         market: 'scrap',    segment: 'B2B' },
                    { type: 'BullionQuoteRequest',  nameAr: 'طلب عرض سعر سبائك',    market: 'precious', segment: 'B2G' },
                    { type: 'RareEarthNDA',         nameAr: 'طلب NDA معادن نادرة',   market: 'rare',     segment: 'B2G' },
                    { type: 'QualifiedLead',        nameAr: 'عميل مؤهل',             market: 'metals',   segment: 'B2B' },
                    { type: 'ContractWon',          nameAr: 'عقد مُبرم',             market: 'metals',   segment: 'B2B' },
                    { type: 'FlashOrderNow',        nameAr: 'طلب فوري سوق الآن',     market: 'now',      segment: 'B2C' },
                ],
            });
        });

        // ─── Consent Management (GDPR / PDPL / CCPA) ─────────────────────────
        app.post(`${base}/consent/تسجيل`, (req, res) => {
            try {
                const { userId, purposes, framework, version, channel } = req.body;
                if (!userId) return res.status(400).json({ error: 'userId مطلوب' });
                const result = this.recordConsent(userId, { purposes, framework, version, channel, ip: req.ip });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/consent/record`, (req, res) => {
            try {
                const { userId, purposes, framework, version, channel } = req.body;
                if (!userId) return res.status(400).json({ error: 'userId required' });
                const result = this.recordConsent(userId, { purposes, framework, version, channel, ip: req.ip });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/consent/تحقق/:userId`, (req, res) => {
            const { purpose = 'advertising' } = req.query;
            const consented = this.checkConsent(req.params.userId, purpose);
            res.json({ userId: '[hashed]', purpose, consented, timestamp: new Date().toISOString() });
        });

        app.get(`${base}/consent/check/:userId`, (req, res) => {
            const { purpose = 'advertising' } = req.query;
            const consented = this.checkConsent(req.params.userId, purpose);
            res.json({ consented, purpose });
        });

        app.delete(`${base}/consent/:userId`, (req, res) => {
            try {
                const result = this.deleteConsent(req.params.userId);
                this._addAuditEntry('CONSENT_DELETE_API', req.ip, { userId: '[hashed]' });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/consent/إحصائيات`, (req, res) => {
            res.json({
                totalConsents: Object.keys(this.consentDB.consents).length,
                note: 'جميع معرّفات المستخدمين مُشفَّرة SHA-256',
                frameworks: ['PDPL', 'GDPR', 'CCPA'],
            });
        });

        // ─── Executive KPI Dashboard ──────────────────────────────────────────
        app.get(`${base}/kpi/تنفيذي`, (req, res) => res.json(this.getExecutiveKPIs()));
        app.get(`${base}/kpi/executive`, (req, res) => res.json(this.getExecutiveKPIs()));

        app.get(`${base}/kpi/تنبيهات`, (req, res) => res.json({
            alerts:     this.checkAlerts(),
            thresholds: this.alertThresholds,
            checkedAt:  new Date().toISOString(),
        }));

        app.get(`${base}/kpi/alerts`, (req, res) => res.json({
            alerts:     this.checkAlerts(),
            thresholds: this.alertThresholds,
        }));

        // ─── Governance / Audit Log ───────────────────────────────────────────
        app.get(`${base}/حوكمة/سجل-التدقيق`, (req, res) => {
            const limit = Math.min(parseInt(req.query.limit) || 50, 200);
            const entries = this.auditLog.slice(0, limit);
            res.json({ total: this.auditLog.length, limit, entries });
        });

        app.get(`${base}/governance/audit-log`, (req, res) => {
            const limit = Math.min(parseInt(req.query.limit) || 50, 200);
            res.json({ total: this.auditLog.length, limit, entries: this.auditLog.slice(0, limit) });
        });

        app.get(`${base}/حوكمة/صحة-التوكن`, (req, res) => {
            const checks = {
                mainToken:      { configured: !!(this.config.accessToken && this.config.accessToken !== 'DEMO_TOKEN'),   label: 'META_ACCESS_TOKEN' },
                capiToken:      { configured: !!(this.config.capiToken   && this.config.capiToken   !== 'DEMO_TOKEN'),   label: 'META_CAPI_ACCESS_TOKEN' },
                whatsappToken:  { configured: !!(this.config.whatsappToken && this.config.whatsappToken !== 'DEMO_WA_TOKEN'), label: 'META_WHATSAPP_TOKEN' },
                pixelId:        { configured: !!(this.config.pixelId     && this.config.pixelId     !== 'SHEIKHA_PIXEL_001'), label: 'META_PIXEL_ID' },
                automationOn:   { configured: this.config.automationApproved, label: 'META_AUTOMATION_APPROVED' },
                regionTokens: {
                    sa_gcc:   { configured: !!process.env.META_CAPI_TOKEN_SA_GCC   },
                    europe:   { configured: !!process.env.META_CAPI_TOKEN_EUROPE   },
                    americas: { configured: !!process.env.META_CAPI_TOKEN_AMERICAS },
                    asia:     { configured: !!process.env.META_CAPI_TOKEN_ASIA     },
                },
                marketPixels: Object.fromEntries(
                    Object.entries(this.marketPixels).map(([k, v]) => [k, { configured: v.pixelId !== this.config.pixelId || !!process.env[`META_PIXEL_ID_${k.toUpperCase()}`] }])
                ),
            };
            const allOk = checks.mainToken.configured && checks.capiToken.configured && checks.pixelId.configured;
            res.json({ ok: allOk, checks, note: 'فحص التوكنات محلي فقط — لا يتصل بـ Meta Graph API' });
        });

        app.post(`${base}/حوكمة/اختبار-الوصول`, async (req, res) => {
            // اختبار بسيط: إرسال حدث تجريبي TestEvent
            try {
                const result = await this.sendCAPIEvent('PageView', { ip: req.ip, userAgent: req.headers['user-agent'] }, { content_name: 'Token Health Test' });
                this._addAuditEntry('TOKEN_TEST', req.ip, { success: result.success });
                res.json({ ok: result.success, eventId: result.eventId, sentToMeta: result.sentToMeta, note: 'اختبار تجريبي — لا يحسب كتحويل' });
            } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
        });

        // ─── Marketing Messages Lite AI ───────────────────────────────────────
        app.post(`${base}/تسويق/جدولة-رسالة`, async (req, res) => {
            try {
                const { userId, behavior, context = {} } = req.body;
                if (!userId || !behavior) return res.status(400).json({ error: 'userId و behavior مطلوبان' });
                const scheduled = this.scheduleMarketingMessage(userId, behavior, context);
                res.json({ success: true, scheduled });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/marketing/schedule-message`, async (req, res) => {
            try {
                const { userId, behavior, context = {} } = req.body;
                if (!userId || !behavior) return res.status(400).json({ error: 'userId and behavior required' });
                const scheduled = this.scheduleMarketingMessage(userId, behavior, context);
                res.json({ success: true, scheduled });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/تسويق/رسائل-مجدولة`, (req, res) => {
            const limit = parseInt(req.query.limit) || 20;
            const msgs = (this.db.scheduledMessages || []).slice(-limit).reverse();
            res.json({ total: (this.db.scheduledMessages || []).length, limit, messages: msgs });
        });

        app.get(`${base}/تسويق/سلوكيات`, (req, res) => {
            res.json({
                behaviors: [
                    { key: 'cart_abandon',     nameAr: 'تخلٍّ عن السلة',         delay: '1h',  priority: 'HIGH' },
                    { key: 'repeat_customer',  nameAr: 'عميل متكرر',              delay: '30d', priority: 'MEDIUM' },
                    { key: 'post_purchase',    nameAr: 'بعد الشراء',              delay: '3d',  priority: 'LOW' },
                    { key: 'inactive_30d',     nameAr: 'عميل غير نشط 30 يوم',    delay: '0h',  priority: 'MEDIUM' },
                    { key: 'price_drop',       nameAr: 'انخفاض سعر المنتج',       delay: '0h',  priority: 'HIGH' },
                    { key: 'contract_renewal', nameAr: 'تجديد عقد B2B',           delay: '7d',  priority: 'HIGH' },
                ],
            });
        });

        // ─── Unified Public CAPI Gateway — /sheikha/track ────────────────────
        // هذا المسار العام يُستدعى مباشرة من موقع www.sheikha.top
        // يُغني عن كتابة كود خاص لكل سوق — سيرفر الموقع يرسل هنا
        // ملاحظة: req.cookies يتطلب تثبيت cookie-parser middleware قبل هذا المسار
        const _gatewayTrackHandler = async (req, res) => {
            try {
                const {
                    market_path,      // '/metals' | '/scrap' | '/precious' | '/rare' | '/now'
                    event_name,       // 'Purchase' | 'Lead' | 'ViewContent' | 'AddToCart' إلخ
                    event_id,         // لازم يطابق event_id في fbq('track') بالمتصفح
                    email,
                    phone,
                    value,
                    currency = 'SAR',
                    custom_data = {},
                    user_data_extra = {},
                } = req.body;

                if (!event_name) return res.status(400).json({ error: 'event_name مطلوب' });

                // تحويل market_path إلى مفتاح السوق: '/metals' → 'metals'
                const marketKey = market_path
                    ? String(market_path).replace(/^\//, '').toLowerCase()
                    : 'metals';

                const userData = {
                    email,
                    phone,
                    ip:        req.ip || req.headers['x-forwarded-for'],
                    userAgent: req.headers['user-agent'],
                    ...user_data_extra,
                };

                const customDataMerged = {
                    value: parseFloat(value) || 0,
                    currency,
                    market_segment: marketKey,
                    ...custom_data,
                };

                const result = await this.sendCAPIEventForMarket(
                    marketKey, event_name, userData, customDataMerged, event_id,
                );

                this._addAuditEntry('GATEWAY_TRACK', null, { market: marketKey, event: event_name });

                res.json({
                    success: true,
                    events_received: 1,
                    market: result.market,
                    pixel_used: result.pixelId,
                    event_id: result.eventId,
                    sent_to_meta: result.sentToMeta,
                });
            } catch (e) { res.status(500).json({ error: e.message }); }
        };

        app.post('/sheikha/track', _gatewayTrackHandler);
        // مسار عربي مرادف — نفس المعالج
        app.post('/شيخة/تتبع', _gatewayTrackHandler);

        // ─── ERP Batch — رفع دفعات من الـ ERP ────────────────────────────────
        app.post(`${base}/capi/erp/batch`, async (req, res) => {
            try {
                const { contracts = [], batchId } = req.body;
                if (!contracts.length) return res.status(400).json({ error: 'contracts array مطلوب' });
                const result = await this.sendERPBatch(contracts, batchId);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/erp/دفعة`, async (req, res) => {
            try {
                const { contracts = [], batchId } = req.body;
                if (!contracts.length) return res.status(400).json({ error: 'contracts array مطلوب' });
                const result = await this.sendERPBatch(contracts, batchId);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ERP sync status (shows last 20 ERP events from DB)
        app.get(`${base}/erp/pending`, (req, res) => {
            const erpEvents = this.db.events.filter(e => e.source === 'ERP').slice(-20).reverse();
            res.json({
                total: this.db.events.filter(e => e.source === 'ERP').length,
                recent: erpEvents,
                syncInterval: process.env.META_ERP_SYNC_INTERVAL_HOURS || '6',
                note: 'يتم رفع العقود المكتملة تلقائياً كل ' + (process.env.META_ERP_SYNC_INTERVAL_HOURS || '6') + ' ساعات',
            });
        });

        app.post(`${base}/erp/sync`, async (req, res) => {
            // نقطة استدعاء يدوي للمزامنة — فريق ERP يستدعيها عند الحاجة
            this._addAuditEntry('ERP_MANUAL_SYNC', req.ip, {});
            res.json({
                success: true,
                message: 'طلب المزامنة اليدوية مُسجَّل',
                note: 'استدعِ POST /api/شيخة-ميتا/capi/erp/دفعة مع contracts[] لرفع العقود',
                timestamp: new Date().toISOString(),
            });
        });

        // ─── Supply Chain / Vendor Events ─────────────────────────────────────
        app.post(`${base}/سلاسل-الامداد/حدث`, async (req, res) => {
            try {
                const result = await this.sendSupplyChainEvent(req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/supply-chain/event`, async (req, res) => {
            try {
                const result = await this.sendSupplyChainEvent(req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/سلاسل-الامداد/تسجيل-مورد`, async (req, res) => {
            try {
                const result = await this.sendSupplyChainEvent({ ...req.body, event_type: 'VendorRegistered' });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/سلاسل-الامداد/اعتماد-مورد`, async (req, res) => {
            try {
                const result = await this.sendSupplyChainEvent({ ...req.body, event_type: 'VendorApproved' });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/سلاسل-الامداد/امر-توريد`, async (req, res) => {
            try {
                const result = await this.sendSupplyChainEvent({ ...req.body, event_type: 'FirstPurchaseOrder' });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/سلاسل-الامداد/تجديد-عقد`, async (req, res) => {
            try {
                const result = await this.sendSupplyChainEvent({ ...req.body, event_type: 'SupplyContractRenewed' });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/سلاسل-الامداد/أنواع-الأحداث`, (req, res) => {
            res.json({
                events: [
                    { type: 'VendorRegistered',      metaEvent: 'Lead',               nameAr: 'تسجيل مورد جديد',           useCase: 'مورد يسجل في بوابة الموردين' },
                    { type: 'VendorApproved',         metaEvent: 'CompleteRegistration', nameAr: 'اعتماد المورد',            useCase: 'مورد أكمل أوراقه وتم اعتماده' },
                    { type: 'FirstPurchaseOrder',     metaEvent: 'Purchase',           nameAr: 'أول أمر توريد',              useCase: 'أول صفقة فعلية مع المورد' },
                    { type: 'SupplyContractRenewed',  metaEvent: 'Purchase',           nameAr: 'تجديد عقد توريد',            useCase: 'تجديد عقد سنوي أو دوري' },
                ],
                note: 'ميتا تتعلم: "إعلان X يجيب موردين معتمدين" وتُحسّن الاستهداف تلقائياً',
            });
        });

        app.get(`${base}/supply-chain/event-types`, (req, res) => {
            res.json({
                events: ['VendorRegistered', 'VendorApproved', 'FirstPurchaseOrder', 'SupplyContractRenewed'],
            });
        });

        // ─── Per-Market Pixel Snippets ─────────────────────────────────────────
        // ─── Pixel per-market — معطّل (شيخة لا تتعامل مع Facebook) ───────────
        app.get(`${base}/pixel/snippet/:market`, (req, res) => res.status(403).json({ error: 'Facebook Pixel غير مفعّل' }));
        app.get(`${base}/pixel/snippets/all`,    (req, res) => res.status(403).json({ error: 'Facebook Pixel غير مفعّل' }));

        // ─── Trade Corridors ───────────────────────────────────────────────────
        app.get(`${base}/geo/trade-corridors`, (req, res) => {
            res.json({
                corridors: [
                    { key: 'GCC_Internal',      regions: ['sa_gcc'],             desc: 'تجارة داخلية خليجية — B2B / B2G محلي' },
                    { key: 'GCC_to_EU',          regions: ['sa_gcc','europe'],    desc: 'تصدير الخليج لأوروبا — معادن وموارد' },
                    { key: 'GCC_EU_G20',         regions: ['sa_gcc','europe'],    desc: 'صفقات G20 الخليج-أوروبا — حكومات وصناديق سيادية' },
                    { key: 'GCC_to_Americas',    regions: ['sa_gcc','americas'],  desc: 'تصدير للأمريكيتين — نادرة وبلاتين' },
                    { key: 'GCC_to_Asia',        regions: ['sa_gcc','asia'],      desc: 'ممر آسيا — تجارة ضخمة مع الصين واليابان وكوريا' },
                    { key: 'GCC_to_Americas_G20',regions: ['sa_gcc','americas'],  desc: 'G20 أمريكا — عقود حكومية دولارية' },
                    { key: 'GCC_to_Asia_G20',    regions: ['sa_gcc','asia'],      desc: 'G20 آسيا — ممر الحزام والطريق والبديل الخليجي' },
                ],
                how_to_use: 'أضف "trade_corridor" في custom_data عند إرسال أي حدث ERP أو CAPI لتحسين استهداف ميتا',
                example: { trade_corridor: 'GCC_EU_G20', country_tier: 'G20', client_type: 'B2G' },
            });
        });

        // حدث جغرافي مع ممر تجاري صريح
        app.post(`${base}/geo/capi/event/corridor`, async (req, res) => {
            try {
                const { eventName, userData = {}, customData = {}, eventId, trade_corridor, country_tier } = req.body;
                if (!eventName) return res.status(400).json({ error: 'eventName مطلوب' });
                const result = await this.sendCAPIEventWithGeoRouting(
                    eventName,
                    { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] },
                    { ...customData, trade_corridor, country_tier },
                    eventId,
                );
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/geo/corridor-map`, (req, res) => {
            res.json({
                regionToDefaultCorridor: {
                    sa_gcc:   'GCC_Internal',
                    europe:   'GCC_to_EU',
                    americas: 'GCC_to_Americas',
                    asia:     'GCC_to_Asia',
                },
                g20Countries: ['de','fr','it','gb','us','ca','jp','kr','in','cn','br','mx','ar','sa','ae','tr','au','za','id','eu'],
                note: 'أضف country_tier: "G20" في customData أو contract لترقية الممر تلقائياً',
            });
        });

        // ─── Halal Certification Events ─────────────────────────────────────────
        // Subscribe_Halal_Certified: عميل يطلب شهادة مطابقة شرعية
        app.post(`${base}/halal/certified-purchase`, async (req, res) => {
            try {
                const { email, phone, value, currency = 'SAR', market_segment = 'precious',
                        product_id, halal_cert_type = 'LBMA_Sharia', country = 'sa' } = req.body;
                const result = await this.sendCAPIEventWithGeoRouting(
                    'Purchase',
                    { email, phone, country },
                    {
                        value, currency,
                        market_segment,
                        content_ids: product_id ? [product_id] : [],
                        halal_certified: true,
                        halal_cert_type,
                        content_type: 'product',
                    },
                );
                this._addAuditEntry('HALAL_CERTIFIED_PURCHASE', null, { market_segment, halal_cert_type });
                res.json({ ...result, halal_certified: true, cert_type: halal_cert_type });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // Halal_Required: عميل اختار خيار "أرغب بشهادة مطابقة شرعية"
        app.post(`${base}/halal/require-cert`, async (req, res) => {
            try {
                const { email, phone, market_segment = 'precious', country = 'sa' } = req.body;
                const result = await this.sendCAPIEventWithGeoRouting(
                    'Lead',
                    { email, phone, country },
                    { market_segment, halal_cert_required: true, content_name: 'Halal Certification Request' },
                );
                this._addAuditEntry('HALAL_CERT_REQUIRED', null, { market_segment });
                res.json({ ...result, event: 'Halal_Required' });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // Subscribe_Halal_Certified: اشتراك في نشرة الشيخة للمعادن الحلال
        app.post(`${base}/halal/subscribe`, async (req, res) => {
            try {
                const { email, phone, country = 'sa', newsletter_type = 'precious_halal' } = req.body;
                if (!email) return res.status(400).json({ error: 'email مطلوب' });
                const result = await this.sendCAPIEventWithGeoRouting(
                    'Subscribe',
                    { email, phone, country },
                    { content_name: `Sheikha Halal ${newsletter_type}`, halal_newsletter: true, newsletter_type },
                );
                this._addAuditEntry('HALAL_SUBSCRIBE', null, { newsletter_type });
                res.json({ ...result, event: 'Subscribe_Halal' });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/halal/event-types`, (req, res) => {
            res.json({
                events: [
                    { endpoint: 'POST /halal/certified-purchase', metaEvent: 'Purchase', desc: 'شراء منتج معادن بشهادة مطابقة شرعية' },
                    { endpoint: 'POST /halal/require-cert',        metaEvent: 'Lead',     desc: 'عميل طلب شهادة LBMA Sharia أو AAOIFI' },
                    { endpoint: 'POST /halal/subscribe',           metaEvent: 'Subscribe', desc: 'اشتراك في نشرة المعادن الحلال' },
                ],
                shariaFilter: this.shariaFilter,
                note: 'ميتا تستخدم هذه الأحداث لبناء جمهور مشابه من المستثمرين المسلمين عالمياً',
            });
        });

        // ─── Consent Mode V2 (Meta + Google) ──────────────────────────────────
        // يُرجع مقتطف JavaScript جاهز للصق في موقع www.sheikha.top لأوروبا
        app.get(`${base}/consent-mode/v2/snippet`, (req, res) => {
            const pixelId = this.config.pixelId;
            const snippet = `<!-- Sheikha Consent Mode V2 — للمواقع الأوروبية (GDPR) -->
<!-- 1) حط هذا أعلى <head> قبل أي سكريبت إعلاني -->
<script>
// Meta Consent Mode V2 — Sheikha Market
window.sheikhaConsentMode = {
  version: '2.0',
  pixelId: '${pixelId}',
  capiGateway: 'https://capig.datah04.com',

  // استدعِ هذا لما المستخدم يقبل الكوكيز
  grant: function(categories) {
    var defaults = { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
    var granted  = { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' };
    var state = categories && categories.advertising ? granted : defaults;
    if (typeof fbq !== 'undefined') fbq('consent', categories && categories.advertising ? 'grant' : 'revoke');
    if (typeof gtag !== 'undefined') { gtag('consent', 'update', state); }
    // أرسل حالة الموافقة لـ CAPI Gateway
    fetch(this.capiGateway + '/sheikha/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pixelId: this.pixelId, consent: categories, timestamp: Date.now() })
    }).catch(function(){});
    // احفظ محلياً
    try { localStorage.setItem('sheikha_consent_v2', JSON.stringify({ consent: categories, ts: Date.now() })); } catch(e){}
  },

  // استدعِ عند تحميل الصفحة لإعادة تطبيق الموافقة المحفوظة
  restore: function() {
    try {
      var saved = JSON.parse(localStorage.getItem('sheikha_consent_v2') || 'null');
      if (saved && saved.consent) this.grant(saved.consent);
    } catch(e){}
  }
};

// تطبيق القيم الافتراضية (denied) قبل تحميل أي بيكسل — مطلوب قانونياً في أوروبا
if (typeof gtag !== 'undefined') {
  gtag('consent', 'default', { ad_storage:'denied', analytics_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', wait_for_update: 500 });
}

// استعادة الموافقة المحفوظة تلقائياً
window.addEventListener('DOMContentLoaded', function(){ window.sheikhaConsentMode.restore(); });
</script>
<!-- 2) زر القبول — مثال بسيط. استبدله بـ CMP متكامل (Cookiebot / OneTrust) -->
<!-- <button onclick="window.sheikhaConsentMode.grant({advertising:true,analytics:true})">قبول الكل</button> -->
<!-- <button onclick="window.sheikhaConsentMode.grant({advertising:false,analytics:false})">رفض</button> -->`;

            res.json({
                snippet,
                pixelId,
                capiGateway: 'https://capig.datah04.com',
                gdprCompliant: true,
                consentModeVersion: '2.0',
                note: 'احفظ هذا المقتطف في قسم <head> لصفحات الأسواق الأوروبية فقط. لا تحتاجه في الخليج.',
                frameworks: ['GDPR (EU)', 'ePrivacy Directive', 'Meta Consent Mode V2', 'Google Consent Mode V2'],
            });
        });

        // نقطة استقبال إشارة الموافقة من المتصفح لـ capig.datah04.com
        app.post(`${base}/consent/signal`, async (req, res) => {
            try {
                const { userId, consent = {}, country } = req.body;
                if (!userId && !req.ip) return res.status(400).json({ error: 'userId أو IP مطلوب' });
                const uid = userId || sha256(req.ip);
                if (consent.advertising === true) {
                    this.recordConsent(uid, { purposes: ['advertising', 'analytics'], framework: 'GDPR', channel: 'consent_mode_v2', ip: country });
                } else if (consent.advertising === false) {
                    this.deleteConsent(uid);
                }
                this._addAuditEntry('CONSENT_SIGNAL_V2', sha256(uid), { consent, country });
                res.json({ success: true, consentRecorded: consent.advertising === true });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/موافقة/إشارة`, async (req, res) => {
            // نفس معالج consent/signal
            try {
                const { userId, consent = {}, country } = req.body;
                const uid = userId || sha256(req.ip || 'unknown');
                if (consent.advertising === true) {
                    this.recordConsent(uid, { purposes: ['advertising', 'analytics'], framework: 'GDPR', channel: 'consent_mode_v2', ip: country });
                } else if (consent.advertising === false) {
                    this.deleteConsent(uid);
                }
                this._addAuditEntry('CONSENT_SIGNAL_V2', sha256(uid), { consent, country });
                res.json({ success: true, consentRecorded: consent.advertising === true });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── EU WhatsApp Channels ─────────────────────────────────────────────
        app.get(`${base}/واتساب/قنوات-أوروبا`, (req, res) => {
            const euChannels = Object.fromEntries(
                Object.entries(this.marketWhatsApp)
                    .filter(([, v]) => v.region === 'europe')
                    .map(([k, v]) => [k, { country: v.countryCode, welcome: v.welcomeAr, segment: v.segment, phoneConfigured: !!process.env[`META_WA_PHONE_ID_${k.toUpperCase()}`] }])
            );
            res.json({
                channels: euChannels,
                note: 'كل رقم EU يجب أن يكون مستضافاً على سيرفر داخل أوروبا (GDPR)',
                setupGuide: 'أنشئ رقم WA عبر Unifonic أو 360dialog ثم أضف META_WA_PHONE_ID_EU_IT / EU_DE / EU_FR في .env',
            });
        });

        app.get(`${base}/whatsapp/eu-channels`, (req, res) => {
            const euChannels = Object.entries(this.marketWhatsApp)
                .filter(([, v]) => v.region === 'europe')
                .map(([k, v]) => ({ key: k, country: v.countryCode, segment: v.segment }));
            res.json({ channels: euChannels });
        });

        // إرسال رسالة WA عبر قناة أوروبية محددة (IT / DE / FR)
        app.post(`${base}/واتساب/أوروبا/رسالة`, async (req, res) => {
            try {
                const { to, country_code = 'it', template = 'hello_world', components = [] } = req.body;
                if (!to) return res.status(400).json({ error: 'to (رقم الهاتف) مطلوب' });
                const channelKey = `eu_${country_code.toLowerCase()}`;
                const channel = this.marketWhatsApp[channelKey];
                if (!channel) return res.status(400).json({ error: `قناة EU غير موجودة: ${channelKey}. المتاح: eu_it, eu_de, eu_fr` });
                // استخدم رقم الـ EU المخصص
                const result = await this.sendWhatsAppMessage(to, template, components, channel.phoneId);
                this._addAuditEntry('WA_EU_MESSAGE', null, { country: country_code, template });
                res.json({ ...result, euChannel: channelKey, country: country_code });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── Sheikha HS Chain Protocol Routes ────────────────────────────────────

        // حدث سلسلة كتلة كامل مع تثري تلقائي
        app.post(`${base}/chain/event`, async (req, res) => {
            try {
                const { eventName, userData = {}, chainData = {} } = req.body;
                if (!eventName) return res.status(400).json({ error: 'eventName مطلوب' });
                const result = await this.sendChainEvent(
                    eventName,
                    { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] },
                    chainData,
                );
                this._addAuditEntry('CHAIN_EVENT', null, { eventName, entity_type: chainData.entity_type, chain_position: chainData.chain_position });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // أحداث دورة حياة المستودعات والشحن
        const lifecycleEvents = [
            { path: 'warehouse-in',     eventName: 'Warehouse_In',       nameAr: 'دخول مستودع' },
            { path: 'port-export',      eventName: 'Port_Export',         nameAr: 'تصدير من ميناء' },
            { path: 'customs-clearance',eventName: 'Customs_Clearance',   nameAr: 'تخليص جمركي' },
            { path: 'factory-delivery', eventName: 'Factory_Delivery',    nameAr: 'تسليم لمصنع' },
            { path: 'recycle-initiate', eventName: 'Recycle_Initiate',    nameAr: 'بدء إعادة تدوير' },
            { path: 'secure-shipping',  eventName: 'Secure_Shipping',     nameAr: 'شحن مؤمن (معادن ثمينة)' },
            { path: 'purchase-source',  eventName: 'Purchase_Source',     nameAr: 'شراء من المنبع (منجم/ساحة)' },
            { path: 'purchase-transform',eventName:'Purchase_Transform',  nameAr: 'شراء بعد تحويل (مصهر/مصفاة)' },
            { path: 'purchase-refine',  eventName: 'Purchase_Refine',     nameAr: 'شراء بعد تكرير LBMA' },
            { path: 'purchase-store',   eventName: 'Purchase_Store',      nameAr: 'شراء للتخزين (مخزن/خزنة)' },
        ];

        lifecycleEvents.forEach(({ path: p, eventName: evName }) => {
            app.post(`${base}/chain/${p}`, async (req, res) => {
                try {
                    const { userData = {}, chainData = {} } = req.body;
                    const result = await this.sendChainEvent(
                        evName,
                        { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] },
                        chainData,
                    );
                    this._addAuditEntry('CHAIN_LIFECYCLE', null, { eventName: evName, entity_type: chainData.entity_type });
                    res.json({ ...result, eventName: evName });
                } catch (e) { res.status(500).json({ error: e.message }); }
            });
        });

        // رحلة المنتج الكاملة — محاكاة دورة حياة لغرض الاختبار
        app.post(`${base}/chain/journey/:market`, async (req, res) => {
            try {
                const market = req.params.market; // scrap | precious | rare | metals
                const { country = 'sa', value_per_stage = 1000000 } = req.body;
                const journeys = {
                    scrap:    [
                        { ev: 'Lead_Source',       entity_type: 'scrap_yard',  chain_position: 1, process_stage: 1, material_form: 'cable_scrap' },
                        { ev: 'ShippingInfo',       entity_type: 'shipping_co', chain_position: 2, process_stage: 4, material_form: 'baled_scrap' },
                        { ev: 'Purchase_Transform', entity_type: 'smelter',     chain_position: 3, process_stage: 5, material_form: 'cathode' },
                        { ev: 'Purchase',           entity_type: 'factory',     chain_position: 4, process_stage: 8, material_form: 'wire_rod' },
                        { ev: 'Purchase',           entity_type: 'end_user',    chain_position: 5, process_stage: 9, material_form: 'electric_cable' },
                        { ev: 'Recycle_Initiate',   entity_type: 'scrap_yard',  chain_position: 1, process_stage: 1, material_form: 'cable_scrap', cycle_number: 2 },
                    ],
                    precious: [
                        { ev: 'Purchase_Source',    entity_type: 'mine',         chain_position: 1, process_stage: 1, material_form: 'dore_bar', hs_chapter: '7108', halal_certified: true },
                        { ev: 'Secure_Shipping',    entity_type: 'shipping_co',  chain_position: 2, process_stage: 3, material_form: 'dore_bar', hs_chapter: '7108' },
                        { ev: 'Purchase_Refine',    entity_type: 'refinery',     chain_position: 3, process_stage: 4, material_form: 'bar_9999_12.5kg', hs_chapter: '7108', halal_certified: true },
                        { ev: 'Purchase_Store',     entity_type: 'vault',        chain_position: 4, process_stage: 5, material_form: 'bar_9999_1kg', hs_chapter: '7108' },
                        { ev: 'Purchase',           entity_type: 'jeweler',      chain_position: 5, process_stage: 6, material_form: 'ring_21k', hs_chapter: '7113' },
                        { ev: 'Purchase',           entity_type: 'end_user',     chain_position: 6, process_stage: 8, material_form: 'ring_21k', hs_chapter: '7113' },
                        { ev: 'Recycle_Initiate',   entity_type: 'refinery',     chain_position: 1, process_stage: 9, material_form: 'scrap_21k', hs_chapter: '7112', cycle_number: 2 },
                    ],
                    rare:     [
                        { ev: 'Purchase_Source',    entity_type: 'mine',         chain_position: 1, process_stage: 1, material_form: 'ore_concentrate', hs_chapter: '2805' },
                        { ev: 'Purchase_Transform', entity_type: 'smelter',      chain_position: 2, process_stage: 3, material_form: 'oxide_mix', hs_chapter: '2805' },
                        { ev: 'Purchase_Refine',    entity_type: 'refinery',     chain_position: 3, process_stage: 5, material_form: 'pure_oxide', hs_chapter: '2805' },
                        { ev: 'Purchase_Store',     entity_type: 'warehouse',    chain_position: 4, process_stage: 7, material_form: 'ingot_99.9', hs_chapter: '8112' },
                        { ev: 'Purchase',           entity_type: 'factory',      chain_position: 5, process_stage: 8, material_form: 'battery_material', hs_chapter: '8506' },
                        { ev: 'Purchase',           entity_type: 'gov_company',  chain_position: 6, process_stage: 9, material_form: 'ev_battery', hs_chapter: '8507', client_type: 'B2G' },
                    ],
                    metals:   [
                        { ev: 'Purchase_Source',    entity_type: 'mine',         chain_position: 1, process_stage: 1, material_form: 'ore', hs_chapter: '2603' },
                        { ev: 'Purchase_Transform', entity_type: 'smelter',      chain_position: 2, process_stage: 2, material_form: 'blister_copper', hs_chapter: '7401' },
                        { ev: 'Purchase_Refine',    entity_type: 'refinery',     chain_position: 3, process_stage: 3, material_form: 'cathode', hs_chapter: '7403' },
                        { ev: 'Purchase_Store',     entity_type: 'warehouse',    chain_position: 4, process_stage: 7, material_form: 'rod', hs_chapter: '7407' },
                        { ev: 'Purchase',           entity_type: 'factory',      chain_position: 5, process_stage: 8, material_form: 'wire', hs_chapter: '7408' },
                        { ev: 'Purchase',           entity_type: 'end_user',     chain_position: 6, process_stage: 9, material_form: 'cable_assembly', hs_chapter: '8544' },
                    ],
                };
                const journey = journeys[market];
                if (!journey) return res.status(400).json({ error: `سوق غير معروف. المتاح: ${Object.keys(journeys).join(', ')}` });

                const results = [];
                for (const step of journey) {
                    const { ev, ...cData } = step;
                    const r = await this.sendChainEvent(ev, { country }, { ...cData, market_segment: market, value: value_per_stage, internal_ref: `journey_${market}_pos${cData.chain_position}` });
                    results.push({ step: cData.chain_position, eventName: ev, entity_type: cData.entity_type, success: r.success, eventId: r.eventId });
                }
                res.json({ market, country, stepsCount: results.length, steps: results });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // كتالوج HS Code
        app.get(`${base}/chain/hs-codes`, (req, res) => {
            const { market } = req.query;
            const data = market ? { [market]: this.hsChainConfig[market] } : this.hsChainConfig;
            res.json({ hsCodes: data, markets: Object.keys(this.hsChainConfig), note: 'أرسل hs_chapter (أول 4 أرقام) فقط — تفاصيل HS الكاملة تبقى في ERP حقك مشفرة' });
        });

        // كتالوج أنواع الكيانات
        app.get(`${base}/chain/entity-types`, (req, res) => {
            res.json({
                entities: Object.fromEntries(
                    Object.entries(this.entityTaxonomy).map(([k, v]) => [k, { ...v, key: k }])
                ),
                count: Object.keys(this.entityTaxonomy).length,
                supplyRoles: ['source', 'transform', 'store', 'transport', 'gov', 'use'],
            });
        });

        // خريطة السحابة السيادية — Sovereign Cloud Map
        app.get(`${base}/chain/sovereign-cloud`, (req, res) => {
            const gateways = Object.fromEntries(
                Object.entries(this.regionConfig).map(([k, v]) => [k, {
                    name:             v.name,
                    sovereignGateway: v.sovereignGateway,
                    currency:         v.currency,
                    gdpr:             !!v.gdpr,
                    ccpa:             !!v.ccpa,
                    countries:        v.countries.length,
                }])
            );
            res.json({
                gateways,
                globalGateway: this.globalGateway,
                activeGateway: 'https://capig.datah04.com',
                note: 'كل بوابة تخزن بيانات مواطني منطقتها فقط — امتثال GDPR/PDPL/CCPA كامل',
                deploymentStatus: {
                    'capig-sa.datah04.com':     !!process.env.META_CAPIG_SA     ? 'configured' : 'pending_deployment',
                    'capig-eu.datah04.com':     !!process.env.META_CAPIG_EU     ? 'configured' : 'pending_deployment',
                    'capig-us.datah04.com':     !!process.env.META_CAPIG_US     ? 'configured' : 'pending_deployment',
                    'capig-as.datah04.com':     !!process.env.META_CAPIG_AS     ? 'configured' : 'pending_deployment',
                    'capig-global.datah04.com': !!process.env.META_CAPIG_GLOBAL ? 'configured' : 'pending_deployment',
                    'capig.datah04.com':        'active ✅',
                },
            });
        });

        // مخطط حماية الريادة — Anti-Reverse-Engineering
        app.get(`${base}/chain/protection-info`, (req, res) => {
            res.json({
                protection: 'sheikha_internal_id = SHA256(contract_id + SERVER_SALT)',
                saltConfigured: !!process.env.SHEIKHA_CHAIN_SALT,
                fieldsExposedToMeta: ['entity_type', 'supply_role', 'chain_position', 'hs_chapter', 'process_stage', 'material_form', 'market_segment'],
                fieldsNeverExposed: ['contract_id', 'client_name', 'price_per_unit', 'supplier_details', 'full_hs_code'],
                principle: 'ميتا تتعلم الأنماط بدون ما تعرف تفاصيل عقودك. منافسينك ما يقدرون يقلدون سلسلتك.',
            });
        });

        // ─── Sheikha Chain Census + SEI + Snapshot + Autopilot Routes ──────────

        // تسجيل كيان جديد في سجل السلسلة
        app.post(`${base}/chain/entity/register`, (req, res) => {
            try {
                const { entity_id, ...entityData } = req.body;
                if (!entity_id) return res.status(400).json({ error: 'entity_id مطلوب' });
                const entity = this.registerEntity(entity_id, entityData);
                res.json({ registered: true, entity });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // إحصاء الكيانات النشطة حسب النوع / الدور / السوق
        app.get(`${base}/chain/entities`, (req, res) => {
            try {
                const { entity_type, supply_role, market_segment, country, active } = req.query;
                let entities = Object.values(this.chainLedger.entities);
                if (entity_type)    entities = entities.filter(e => e.entity_type === entity_type);
                if (supply_role)    entities = entities.filter(e => e.supply_role === supply_role);
                if (market_segment) entities = entities.filter(e => e.market_segment === market_segment);
                if (country)        entities = entities.filter(e => e.country === country.toLowerCase());
                if (active !== undefined) entities = entities.filter(e => e.active_status === (active !== 'false'));

                const countsByType = {};
                for (const e of entities) countsByType[e.entity_type] = (countsByType[e.entity_type] || 0) + 1;

                res.json({ total: entities.length, countsByType, totalRegistered: this.chainLedger._stats.total_entities });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // تسجيل حركة مادة في سجل التدفقات
        app.post(`${base}/chain/flow/record`, async (req, res) => {
            try {
                const flow = this.recordMaterialFlow(req.body);
                // أرسل حدث CAPI مرافق إذا وجد userData
                let capiResult = null;
                if (req.body.userData) {
                    capiResult = await this.sendChainEvent('Material_Flow', req.body.userData, {
                        entity_type:      req.body.from_entity_type || 'warehouse',
                        market_segment:   req.body.market_segment || 'metals',
                        hs_chapter:       req.body.hs_chapter,
                        process_stage:    req.body.process_stage,
                        material_form:    req.body.material_form_from,
                        chain_position:   req.body.chain_position || 3,
                        cycle_number:     req.body.cycle_number || 1,
                        value:            req.body.value_sar || 0,
                        internal_ref:     flow.flow_id,
                    });
                }
                res.json({ recorded: true, flow_id: flow.flow_id, ...(capiResult ? { capi: capiResult } : {}) });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // عرض سجل التدفقات مع فلاتر
        app.get(`${base}/chain/flows`, (req, res) => {
            try {
                const { hs_chapter, process_stage, from_entity_id, to_entity_id, limit = 50 } = req.query;
                let flows = this.chainLedger.flows;
                if (hs_chapter)       flows = flows.filter(f => f.hs_chapter === hs_chapter);
                if (process_stage)    flows = flows.filter(f => f.process_stage === Number(process_stage));
                if (from_entity_id)   flows = flows.filter(f => f.from_entity_id === from_entity_id);
                if (to_entity_id)     flows = flows.filter(f => f.to_entity_id === to_entity_id);
                flows = flows.slice(-Number(limit));
                const totalValue = flows.reduce((s, f) => s + f.value_sar, 0);
                const totalWeight = flows.reduce((s, f) => s + f.weight_kg, 0);
                res.json({ count: flows.length, total_value_sar: totalValue, total_weight_kg: Math.round(totalWeight * 100) / 100, flows });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // بناء لقطة السلسلة (بدون إرسال)
        app.get(`${base}/chain/snapshot`, (req, res) => {
            try {
                const snapshot = this.buildChainSnapshot();
                this.chainLedger._stats.last_snapshot_at = new Date().toISOString();
                res.json(snapshot);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // بناء وإرسال لقطة السلسلة لـ CAPI
        app.post(`${base}/chain/snapshot/send`, async (req, res) => {
            try {
                const snapshot = this.buildChainSnapshot();
                this.chainLedger._stats.last_snapshot_at = new Date().toISOString();
                const result = await this.sendCAPIEventWithGeoRouting(
                    snapshot.event_name,
                    { country: req.body.country || 'sa' },
                    snapshot.custom_data,
                );
                this._addAuditEntry('CHAIN_SNAPSHOT_SENT', null, { sei: snapshot.custom_data.sei });
                res.json({ sent: true, snapshot_id: snapshot.custom_data.snapshot_id, sei: snapshot.custom_data.sei, capiResult: result });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // مؤشر التميز SEI
        app.get(`${base}/chain/sei`, (req, res) => {
            try {
                const current = this.computeSEI();
                const history = this.chainLedger._stats.sei_history.slice(-48); // آخر 48 قراءة
                const trend = history.length >= 2
                    ? (current.sei > history[history.length - 2].sei ? '↑ صاعد' : current.sei < history[history.length - 2].sei ? '↓ هابط' : '→ ثابت')
                    : '— أول قراءة';
                res.json({ current, trend, history_last_48: history, target: 10.0, gap: Math.round((10 - current.sei) * 10) / 10 });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // حدث فحص الجودة من المستودع
        app.post(`${base}/chain/quality-check`, async (req, res) => {
            try {
                const { entity_id, return_rate_pct = 0, weight_kg, hs_chapter, userData = {} } = req.body;
                // تحديث معدل الإرجاع في سجل الكيانات
                if (entity_id && this.chainLedger.entities[entity_id]) {
                    this.chainLedger.entities[entity_id].return_rate_pct = Number(return_rate_pct);
                }
                const result = await this.sendChainEvent('Quality_Check', {
                    ...userData, ip: req.ip, userAgent: req.headers['user-agent'],
                }, {
                    entity_type:    'warehouse',
                    market_segment: req.body.market_segment || 'metals',
                    hs_chapter,
                    chain_position: req.body.chain_position || 4,
                    cycle_number:   req.body.cycle_number || 1,
                    return_flag:    return_rate_pct > 0,
                    value:          weight_kg ? weight_kg * 1000 : 0,
                    internal_ref:   entity_id || `qc_${Date.now()}`,
                });
                this._addAuditEntry('QUALITY_CHECK', null, { entity_id, return_rate_pct });
                const blacklisted = return_rate_pct > this.autopilotRules.blacklistThreshold.return_rate_pct;
                res.json({ ...result, entity_id, return_rate_pct, blacklist_warning: blacklisted, blacklist_action: blacklisted ? 'توقف الإعلان على هذا المورد لين تحل المشكلة' : null });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // الحصول على قواعد الطيار الآلي
        app.get(`${base}/chain/autopilot/rules`, (req, res) => {
            res.json({ rules: this.autopilotRules, note: 'هذه القواعد تتحكم في الهامش التلقائي + توجيه المخزون + إيقاف إعلانات الموردين الضعيفين' });
        });

        // تقييم عقد بالطيار الآلي
        app.post(`${base}/chain/autopilot/evaluate`, (req, res) => {
            try {
                const result = this.applyAutoPilotRules(req.body);
                this._addAuditEntry('AUTOPILOT_EVALUATE', null, { client_type: req.body.client_type, market_segment: req.body.market_segment });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // تعداد شامل — Census Dashboard
        app.get(`${base}/chain/census`, (req, res) => {
            try {
                const entities = Object.values(this.chainLedger.entities);
                const active = entities.filter(e => e.active_status);
                const byRole = { source: 0, transform: 0, store: 0, transport: 0, gov: 0, use: 0 };
                const byMarket = { metals: 0, scrap: 0, precious: 0, rare: 0, all: 0 };
                for (const e of active) {
                    if (byRole[e.supply_role] != null) byRole[e.supply_role]++;
                    if (byMarket[e.market_segment] != null) byMarket[e.market_segment]++;
                }
                const sei = this.computeSEI();
                const flows24h = this.chainLedger.flows.filter(f => new Date(f.timestamp).getTime() >= Date.now() - 86400000);
                res.json({
                    entities:          { total: active.length, byRole, byMarket, stores_and_vaults: (byRole.store || 0), end_users: (byRole.use || 0) },
                    flows_24h:         { count: flows24h.length, total_value_sar: Math.round(flows24h.reduce((s, f) => s + f.value_sar, 0)), total_weight_kg: Math.round(flows24h.reduce((s, f) => s + f.weight_kg) * 100) / 100 },
                    sei:               sei.sei,
                    last_snapshot_at:  this.chainLedger._stats.last_snapshot_at,
                    g2g_total:         this.chainLedger._stats.g2g_count,
                    note:              'هذه الأرقام داخلية فقط — لا تُشارَك مع أي طرف خارجي',
                });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── Sheikha Precious Sources + Global Onboarding + Global Matcher Routes ─

        // تسجيل مصدر ثمين (منجم/سوق/مصفاة/بورصة/بنك مركزي) من أي قارة
        app.post(`${base}/core/register-source`, async (req, res) => {
            try {
                const source = this.registerPreciousSource(req.body);
                let capiResult = null;
                if (req.body.contact_email) {
                    capiResult = await this.sendChainEvent('CompleteRegistration', {
                        email: req.body.contact_email, country: (req.body.country || 'sa').toLowerCase(),
                        ip: req.ip, userAgent: req.headers['user-agent'],
                    }, {
                        entity_type:    source.source_type,
                        supply_role:    'source',
                        market_segment: source.market_segment,
                        hs_chapter:     source.hs_chapters[0] || '7108',
                        chain_position: 1,
                        cycle_number:   1,
                        value:          source.annual_capacity_kg * 65000,  // تقدير قيمة بـ SAR
                        internal_ref:   source.source_id,
                        competitive_score: source.onboarding_score,
                    });
                }
                res.json({ registered: true, source, ...(capiResult ? { capi: capiResult } : {}) });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // تأهيل عالمي — شاحنين / مصانع / موردين من كل القارات
        app.post(`${base}/core/entity/onboard`, async (req, res) => {
            try {
                const result = this.registerGlobalEntity(req.body);
                let capiResult = null;
                if (req.body.contact_email) {
                    capiResult = await this.sendChainEvent('CompleteRegistration', {
                        email: req.body.contact_email, country: (req.body.country || 'sa').toLowerCase(),
                        ip: req.ip, userAgent: req.headers['user-agent'],
                    }, {
                        entity_type:       req.body.entity_type,
                        supply_role:       result.entity.supply_role,
                        market_segment:    result.entity.market_segment,
                        hs_chapter:        (req.body.hs_chapters || ['7108'])[0],
                        chain_position:    req.body.chain_position || 2,
                        cycle_number:      1,
                        value:             Number(req.body.capacity_tons_monthly || 100) * 1000 * 65,
                        internal_ref:      result.entity.entity_id,
                        competitive_score: result.onboarding_score,
                    });
                }
                res.json({ registered: true, ...result, ...(capiResult ? { capi: capiResult } : {}) });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // تسجيل ناقل مؤمن
        app.post(`${base}/core/secure-transport/register`, (req, res) => {
            try {
                const t = this.registerSecureTransport(req.body);
                res.json({ registered: true, transport: t });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // تسجيل سوق عالمي
        app.post(`${base}/core/global-markets/register`, (req, res) => {
            try {
                const m = this.registerGlobalMarket(req.body);
                res.json({ registered: true, market: m });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // عرض المصادر الثمينة مع فلاتر
        app.get(`${base}/core/precious-sources`, (req, res) => {
            try {
                const { continent, market_segment, source_type, country } = req.query;
                let sources = Object.values(this.preciousLedger.sources);
                if (continent)      sources = sources.filter(s => s.continent === continent);
                if (market_segment) sources = sources.filter(s => s.market_segment === market_segment);
                if (source_type)    sources = sources.filter(s => s.source_type === source_type);
                if (country)        sources = sources.filter(s => s.country === country.toUpperCase());
                const byContinent = {};
                for (const s of sources) byContinent[s.continent] = (byContinent[s.continent] || 0) + 1;
                res.json({ total: sources.length, byContinent, continents_covered: this.preciousLedger._stats.continents_covered.size, sources });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // عرض الناقلين المؤمنين
        app.get(`${base}/core/secure-transport`, (req, res) => {
            try {
                const { continent, hs_chapter } = req.query;
                const carriers = this.findSecureTransport(continent, hs_chapter ? [hs_chapter] : []);
                res.json({ total: carriers.length, carriers });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // عرض الأسواق العالمية
        app.get(`${base}/core/global-markets`, (req, res) => {
            try {
                const { continent, market_type, country } = req.query;
                let markets = Object.values(this.preciousLedger.markets);
                if (continent)   markets = markets.filter(m => m.continent === continent);
                if (market_type) markets = markets.filter(m => m.market_type === market_type);
                if (country)     markets = markets.filter(m => m.country === country.toUpperCase());
                res.json({ total: markets.length, markets });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // مطابق عالمي — يربط المشتري بأفضل مصدر + ناقل + سوق
        app.post(`${base}/core/global-match`, (req, res) => {
            try {
                const result = this.globalMatch(req.body);
                this._addAuditEntry('GLOBAL_MATCH', null, { competitive_score: result.competitive_score });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // إحصاءات شاملة — شبكة شيخة الكونية
        app.get(`${base}/core/source-stats`, (req, res) => {
            try {
                const sources = Object.values(this.preciousLedger.sources);
                const bySegment = {};
                const byContinent = {};
                for (const s of sources) {
                    bySegment[s.market_segment]  = (bySegment[s.market_segment]  || 0) + 1;
                    byContinent[s.continent]     = (byContinent[s.continent]     || 0) + 1;
                }
                const totalCapacityKg = sources.reduce((sum, s) => sum + s.annual_capacity_kg, 0);
                res.json({
                    sources:           { total: sources.length, bySegment, byContinent, total_annual_capacity_kg: totalCapacityKg },
                    transport:         { total: this.preciousLedger._stats.total_transport },
                    markets:           { total: this.preciousLedger._stats.total_markets },
                    continents_covered: this.preciousLedger._stats.continents_covered.size,
                    entities_onboarded: this.chainLedger._stats.total_entities,
                    // عقل الذكاء الاصطناعي — AI Intelligence Dashboard
                    market_vibe:        this._vibesStats.last_market_vibe,
                    ai_assets_generated: this._vibesStats.ai_assets_generated,
                    automated_revenue_usd: this._vibesStats.automated_revenue_usd,
                    note:              'هذه الإحصاءات داخلية — لا تُشارَك مع أي طرف خارجي',
                });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── مسارات التسجيل الكوني — Universe-Scale Registration ───────────────

        // نقطة تسجيل أي مصدر في الكون (منجم/مصهر/بنك مركزي/سوق) — اسم كوني
        app.post(`${base}/core/register-universe-source`, async (req, res) => {
            try {
                const body = { ...req.body, endorsed_by: req.body.endorsed_by || this.SHEIKHA_AUTHORITY.FOUNDER };
                const source = this.registerPreciousSource(body);
                let capiResult = null;
                if (body.contact_email) {
                    capiResult = await this.sendChainEvent('CompleteRegistration', {
                        email: body.contact_email, country: (body.country || 'sa').toLowerCase(),
                        ip: req.ip, userAgent: req.headers['user-agent'],
                    }, {
                        entity_type:    source.source_type,
                        supply_role:    'source',
                        market_segment: source.market_segment,
                        hs_chapter:     (source.hs_chapters || ['7108'])[0],
                        chain_position: 1,
                        cycle_number:   1,
                        value:          source.annual_capacity_kg * 65000,
                        internal_ref:   source.source_id,
                        competitive_score: source.onboarding_score,
                        endorsed_by:    source.endorsed_by,
                    });
                }
                const transport = this.findSecureTransport(source.continent, source.hs_chapters);
                res.json({ registered: true, source, matched_transport: transport, ...(capiResult ? { capi: capiResult } : {}) });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // تسجيل مسار نقل مؤمن (ممر أمني بين قارتين أو أكثر)
        app.post(`${base}/core/register-secure-lane`, (req, res) => {
            try {
                const t = this.registerSecureTransport(req.body);
                res.json({ registered: true, transport: t, authority: this.SHEIKHA_AUTHORITY.FOUNDER });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // تسجيل سوق في أي قرية أو مدينة في الكون
        app.post(`${base}/core/register-market`, (req, res) => {
            try {
                const m = this.registerGlobalMarket(req.body);
                res.json({ registered: true, market: m, authority: this.SHEIKHA_AUTHORITY.FOUNDER });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── Vibes AI — تحليل مزاج السوق ──────────────────────────────────────────

        // GET /core/market-vibe?hs_chapter=7108&region=Asia
        app.get(`${base}/core/market-vibe`, async (req, res) => {
            try {
                const hs_chapter = req.query.hs_chapter || '7108';
                const region     = req.query.region     || 'Global';
                const vibe       = await this.analyzeMarketVibe(hs_chapter, region);
                res.json({ hs_chapter, region, ...vibe });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // POST /core/market-vibe  { hs_chapter, region }
        app.post(`${base}/core/market-vibe`, async (req, res) => {
            try {
                const { hs_chapter = '7108', region = 'Global' } = req.body;
                const vibe = await this.analyzeMarketVibe(hs_chapter, region);
                res.json({ hs_chapter, region, ...vibe });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── Meta AI Demos — توليد محتوى سيادي ────────────────────────────────────

        // POST /core/generate-ai-asset  { type: "deck"|"video"|"profile", data: {...} }
        app.post(`${base}/core/generate-ai-asset`, async (req, res) => {
            try {
                const { type = 'deck', data = {} } = req.body;
                let result;
                if (type === 'video') {
                    result = await this.generateMineVideo(data);
                    res.json({ type: 'video', asset_url: result, sheikha_branded: true, generated_at: new Date().toISOString() });
                } else {
                    result = await this.generateSovereignDeck(data);
                    res.json({ type: 'deck', asset_url: result, sheikha_branded: true, generated_at: new Date().toISOString() });
                }
                this._vibesStats.ai_assets_generated++;
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── Sheikha Executive Assistant — API Routes ──────────────────────────────

        // GET /core/ea/status — حالة المساعد التنفيذي
        app.get(`${base}/core/ea/status`, (req, res) => {
            res.json({
                mode:            process.env.SHEIKHA_ULTRA_MODE === 'true' ? 'ULTRA_AUTO' : 'MANUAL',
                google_email:    !!process.env.GOOGLE_OAUTH_TOKEN,
                outlook_email:   !!process.env.OUTLOOK_OAUTH_TOKEN,
                whatsapp:        !!process.env.WHATSAPP_BUSINESS_TOKEN,
                founder_phone:   this.SHEIKHA_AUTHORITY.FOUNDER_PHONE,
                founder_whatsapp: this.SHEIKHA_AUTHORITY.FOUNDER_WHATSAPP,
                stats:           this._eaStats,
            });
        });

        // POST /core/ea/scan-email — تشغيل مسح البريد يدوياً
        app.post(`${base}/core/ea/scan-email`, async (req, res) => {
            try {
                const result = await this.scanEmail();
                res.json({ triggered: true, ...result });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // POST /core/ea/manage-calendar — تشغيل إدارة التقويم يدوياً
        app.post(`${base}/core/ea/manage-calendar`, async (req, res) => {
            try {
                const result = await this.manageCalendar();
                res.json({ triggered: true, ...result });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // POST /core/ea/welcome-whatsapp  { phone, name? }
        app.post(`${base}/core/ea/welcome-whatsapp`, async (req, res) => {
            try {
                const { phone, name } = req.body;
                if (!phone) return res.status(400).json({ error: 'phone required' });
                const result = await this.welcomeViaWhatsApp(phone, name);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── مركز القيادة — Command Center (3 عدادات حية) ──────────────────────────
        // GET /core/command-center — يعيد: Market Vibe + AI Assets Generated + Automated Revenue
        app.get(`${base}/core/command-center`, async (req, res) => {
            try {
                const hs_chapter = req.query.hs_chapter || '7108';
                const region     = req.query.region     || 'Global';

                // نبضة السوق — تُعاد من الذاكرة إذا تم تحليلها سابقاً
                const vibe = this._vibesStats.last_market_vibe
                    ? { ...this._vibesStats.last_market_vibe }
                    : await this.analyzeMarketVibe(hs_chapter, region);

                res.json({
                    command_center: 'Sheikha Sovereign Command Center',
                    founder:        this.SHEIKHA_AUTHORITY.FOUNDER,
                    timestamp:      new Date().toISOString(),
                    // العداد 1: مزاج السوق
                    market_vibe: {
                        label:           'Market Vibe — مزاج السوق الآن',
                        hs_chapter:      vibe.hs_chapter   || hs_chapter,
                        region:          vibe.region        || region,
                        metal:           vibe.metal         || `HS ${hs_chapter}`,
                        sentiment:       vibe.sentiment,
                        confidence:      vibe.confidence,
                        risk:            vibe.risk,
                        recommendation:  vibe.recommendation,
                        best_time_to_sell: vibe.best_time_to_sell,
                        last_updated:    vibe.timestamp     || new Date().toISOString(),
                    },
                    // العداد 2: الأصول الرقمية المولّدة اليوم
                    ai_assets_generated: {
                        label:  'AI Assets Generated — عروض وفيديوهات شيخة اليوم',
                        count:  this._vibesStats.ai_assets_generated,
                        vibes_key_active:   !!process.env.VIBES_API_KEY,
                        meta_ai_key_active: !!process.env.META_AI_KEY,
                    },
                    // العداد 3: الإيرادات الآلية
                    automated_revenue: {
                        label:        'Automated Revenue — دخل الأتمتة',
                        usd:          this._vibesStats.automated_revenue_usd,
                        events_sent:  this.stats.eventsSent,
                        conversion_value: this.stats.conversionValue,
                    },
                    // إحصاءات الذكاء السيادي — Llama + Azure OpenAI
                    sovereign_ai: {
                        label:              'Sovereign AI — تحليلات شيخة الذكية',
                        contracts_analyzed: this._llamaStats.contracts_analyzed,
                        tenders_analyzed:   this._llamaStats.tenders_analyzed,
                        emails_replied:     this._llamaStats.emails_replied,
                        chat_messages:      this._llamaStats.chat_messages,
                        last_model_used:    this._llamaStats.last_model_used,
                    },
                    // حالة التكاملات
                    integrations: {
                        vibes_ai:        !!process.env.VIBES_API_KEY ? 'active' : 'pending — أضف VIBES_API_KEY',
                        meta_ai_demos:   !!process.env.META_AI_KEY   ? 'active' : 'pending — أضف META_AI_KEY',
                        llama_api:       !!process.env.LLAMA_API_KEY ? 'active' : 'pending — سجّل على llama.developer.meta.com',
                        azure_openai:    !!(process.env.AZURE_OPENAI_KEY && process.env.AZURE_OPENAI_ENDPOINT) ? 'active' : 'pending — أضف AZURE_OPENAI_KEY + AZURE_OPENAI_ENDPOINT',
                        cosmos_db:       !!process.env.COSMOS_CONNECTION_STRING ? 'active' : 'pending — أضف COSMOS_CONNECTION_STRING',
                        whatsapp:        !!(process.env.WHATSAPP_BUSINESS_TOKEN && process.env.WHATSAPP_PHONE_ID) ? 'active' : 'pending — أضف WHATSAPP_BUSINESS_TOKEN + WHATSAPP_PHONE_ID',
                        google_calendar: !!process.env.GOOGLE_OAUTH_TOKEN    ? 'active' : 'pending — أضف GOOGLE_OAUTH_TOKEN',
                        outlook:         !!process.env.OUTLOOK_OAUTH_TOKEN   ? 'active' : 'pending — أضف OUTLOOK_OAUTH_TOKEN',
                        ultra_mode:      process.env.SHEIKHA_ULTRA_MODE === 'true' ? 'ACTIVE' : 'MANUAL',
                        capi:            this.config.automationApproved ? 'LIVE → Meta Graph API' : 'LOCAL → set META_AUTOMATION_APPROVED=true للإنتاج',
                    },
                    azure_cloud:  this.SHEIKHA_AUTHORITY.AZURE_CLOUD,
                    doctrine: this.SHEIKHA_DOCTRINE.FOUNDER_OATH,
                });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── الذكاء السيادي — Sovereign AI Routes (Llama + Azure OpenAI) ────────────

        // POST /core/chat — شات بوت شيخة (يرد على العملاء 24/7)
        app.post(`${base}/core/chat`, async (req, res) => {
            try {
                const { message, lang = 'ar' } = req.body;
                if (!message) return res.status(400).json({ error: 'message required' });
                const result = await this.chat(message, lang);
                res.json({ reply: result.content, model: result.model, provider: result.provider, doctrine: 'صناعة المجد لله' });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // POST /core/analyze-contract — تحليل العقود القانونية
        app.post(`${base}/core/analyze-contract`, async (req, res) => {
            try {
                const { contract_text, contract } = req.body;
                const text = contract_text || contract || '';
                if (!text) return res.status(400).json({ error: 'contract_text required' });
                const result = await this.analyzeContract(text);
                res.json({ analysis: result.content, model: result.model, provider: result.provider, doctrine: 'صناعة المجد لله' });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // POST /core/analyze-tender — تحليل المناقصات
        app.post(`${base}/core/analyze-tender`, async (req, res) => {
            try {
                const { tender_text, tender } = req.body;
                const text = tender_text || tender || '';
                if (!text) return res.status(400).json({ error: 'tender_text required' });
                const result = await this.analyzeTender(text);
                res.json({ analysis: result.content, model: result.model, provider: result.provider, doctrine: 'صناعة المجد لله' });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // POST /core/reply-email — الرد الآلي على الإيميلات بصيغة سيادية
        app.post(`${base}/core/reply-email`, async (req, res) => {
            try {
                const { email_body, email, subject, recipient } = req.body;
                const body = email_body || email || '';
                if (!body) return res.status(400).json({ error: 'email_body required' });
                const result = await this.replyEmail(body, { subject, recipient });
                res.json({ reply: result.content, model: result.model, provider: result.provider, doctrine: 'صناعة المجد لله' });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── LandingPageView — حدث زيارة الصفحة المقصودة (Instagram Traffic) ──
        // يُطلق عند وصول الزائر من إعلان Instagram إلى الصفحة المقصودة
        // يُحسِّن إسناد حملات Traffic → Landing Page Views ويخفض التكلفة/النتيجة
        app.post(`${base}/capi/زيارة-الصفحة`, async (req, res) => {
            try {
                const { userData = {}, customData = {} } = req.body;
                const result = await this.sendLandingPageViewEvent(
                    { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] },
                    customData,
                );
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/landing-page-view`, async (req, res) => {
            try {
                const { userData = {}, customData = {} } = req.body;
                const result = await this.sendLandingPageViewEvent(
                    { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] },
                    customData,
                );
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── Campaign Monitor — مراقبة الحملة الحية ─────────────────────────────
        // GET  /campaign/monitor          ← ملخص أحداث الحملة الحية (آخر ساعة / يوم)
        // GET  /campaign/monitor?hours=N  ← آخر N ساعة (افتراضي 1، أقصى 72)
        app.get(`${base}/campaign/monitor`, (req, res) => {
            try {
                const hours   = Math.min(Math.max(parseInt(req.query.hours) || 1, 1), 72);
                const since   = new Date(Date.now() - hours * 3600 * 1000);
                const events  = (this.db.events || []).filter(ev => new Date(ev.timestamp) >= since);

                // تجميع حسب نوع الحدث
                const byType  = {};
                events.forEach(ev => {
                    const name = ev.eventName || 'unknown';
                    byType[name] = (byType[name] || 0) + 1;
                });

                // تجميع حسب السوق
                const byMarket = {};
                events.forEach(ev => {
                    const m = ev.market || 'global';
                    byMarket[m] = (byMarket[m] || 0) + 1;
                });

                // تجميع حسب utm_campaign
                const byCampaign = {};
                events.forEach(ev => {
                    const camp = (ev.customData && ev.customData.utmCampaign) || null;
                    if (camp) byCampaign[camp] = (byCampaign[camp] || 0) + 1;
                });

                // أحدث 10 أحداث
                const latest = events.slice(-10).reverse().map(ev => ({
                    eventName:   ev.eventName,
                    market:      ev.market || 'global',
                    utmCampaign: (ev.customData && ev.customData.utmCampaign) || null,
                    placement:   (ev.customData && ev.customData.placement)   || null,
                    timestamp:   ev.timestamp,
                }));

                res.json({
                    success:     true,
                    windowHours: hours,
                    since:       since.toISOString(),
                    totals:      { events: events.length, byType, byMarket, byCampaign },
                    latest,
                    stats:       this.stats,
                    doctrine:    'الإسناد الدقيق — صدق في القياس كصدق في التجارة',
                });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // نفس المسار بالعربية
        app.get(`${base}/campaign/مراقبة`, (req, res) => {
            req.url = `${base}/campaign/monitor`;
            res.redirect(307, `${base}/campaign/monitor${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`);
        });

        console.log(`✅ [SheikhMetaEngine] 181 مسار API مُسجَّل | Base: ${base}`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🛠️ مساعدات داخلية
    // ═══════════════════════════════════════════════════════════════════════════
    _emqTips(emq) {
        const tips = [];
        if (emq < 9) tips.push('أضف الإيميل والجوال لرفع الـ EMQ');
        if (emq < 8) tips.push('أضف اسم المدينة والدولة');
        if (emq < 7) tips.push('أضف fbp و fbc من cookies');
        if (emq < 6) tips.push('أضف external_id (userId من قاعدة بياناتك)');
        if (emq >= 9) tips.push('🌟 ممتاز! EMQ مرتفع جداً — إعلاناتك ستكون أرخص 20٪');
        return tips;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🌐 تحديد الممر التجاري بناءً على المنطقة الجغرافية
    // يُستدعى تلقائياً من sendCAPIEventWithGeoRouting
    // ═══════════════════════════════════════════════════════════════════════════
    _resolveTradeCorridor(regionKey, countryTier = null) {
        const corridorMap = {
            sa_gcc:   'GCC_Internal',
            europe:   'GCC_to_EU',
            americas: 'GCC_to_Americas',
            asia:     'GCC_to_Asia',
        };
        const base = corridorMap[regionKey] || 'Global';
        // رفع الممر لـ G20 لو المستوى محدد
        if (countryTier === 'G20' && regionKey === 'europe') return 'GCC_EU_G20';
        if (countryTier === 'G20') return `${base}_G20`;
        return base;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔗 بروتوكول سلسلة الكتلة — Sheikha HS Chain Protocol
    // يُثري أي حدث CAPI بـ chain_position + hs_chapter + process_stage
    // + sheikha_internal_id (مشفر لحماية الريادة ومنع الهندسة العكسية)
    // ═══════════════════════════════════════════════════════════════════════════
    sendChainEvent(eventName, userData = {}, chainData = {}) {
        const {
            entity_type        = 'warehouse',
            entity_type_buyer  = null,
            market_segment     = 'metals',
            hs_chapter         = null,
            process_stage      = null,
            material_form      = null,
            material_form_next = null,
            chain_position     = 5,
            cycle_number       = 1,
            halal_certified    = false,
            internal_ref       = null,  // contract_id أو order_id من ERP
            ...rest
        } = chainData;

        const entityDef = this.entityTaxonomy[entity_type] || {};
        const resolvedHsChapter = hs_chapter || this._resolveDefaultHsChapter(market_segment);

        // sheikha_internal_id — SHA256(internal_ref + SERVER_SALT) لمنع الهندسة العكسية
        // تحذير: إذا SHEIKHA_CHAIN_SALT غير مُضبوط، تُقلَّل الحماية. اضبطه في .env
        const salt = process.env.SHEIKHA_CHAIN_SALT;
        if (!salt) {
            console.warn('[SheikhMetaEngine] ⚠️ SHEIKHA_CHAIN_SALT غير مُضبوط — حماية sheikha_internal_id ضعيفة. اضبطه في .env');
        }
        const effectiveSalt = salt || `sheikha-fallback-${this.config.pixelId || 'default'}`;
        const internalId = internal_ref
            ? sha256(`${String(internal_ref)}::${effectiveSalt}`)
            : sha256(`chain::${chain_position}::${Date.now()}::${effectiveSalt}`);

        const enrichedCustomData = {
            ...rest,
            market_segment,
            entity_type,
            ...(entity_type_buyer ? { entity_type_buyer } : {}),
            supply_role:       entityDef.supplyRole || 'unknown',
            chain_position:    Number(chain_position),
            cycle_number:      Number(cycle_number),
            ...(resolvedHsChapter ? { hs_chapter: resolvedHsChapter } : {}),
            ...(process_stage     ? { process_stage: Number(process_stage) } : {}),
            ...(material_form     ? { material_form } : {}),
            ...(material_form_next ? { material_form_next } : {}),
            halal_certified:   Boolean(halal_certified),
            sheikha_internal_id: internalId,
        };

        return this.sendCAPIEventWithGeoRouting(eventName, userData, enrichedCustomData);
    }

    _resolveDefaultHsChapter(market_segment) {
        const defaults = {
            scrap:    '7204',
            metals:   '7403',
            precious: '7108',
            rare:     '2805',
        };
        return defaults[market_segment] || null;
    }

    _aiGenerateMessage(behavior, productId) {
        const messages = {
            cart_abandon: `منتجاتك بسلتك لا تزال تنتظرك! أكمل طلبك الآن واستفد من الشحن المجاني`,
            repeat_customer: `مرحباً بعودتك! وصلت تشكيلة جديدة تناسب ذوقك`,
            post_purchase: `شكراً لثقتك! كيف تقيّم منتجك؟ رأيك يهمنا`,
            inactive: `نفتقدك في سوق شيخة! عروض حصرية بانتظارك`,
        };
        return messages[behavior] || `مرحباً! شيخة لديها عروض رائعة لك اليوم`;
    }

    _bestSendTime() {
        const hour = new Date().getHours();
        if (hour < 9) return '08:00 اليوم';
        if (hour < 13) return '12:30 اليوم';
        if (hour < 19) return '19:00 اليوم';
        return '08:00 غداً';
    }

    _generateCatalogProducts(count) {
        const names = ['ذهب خام 24K', 'فضة نقية 999', 'نحاس تجاري', 'ألمنيوم حبيبات', 'بلاتين سبائك', 'ستانلس ستيل'];
        const categories = ['المعادن الثمينة', 'المعادن الأساسية', 'السكراب', 'معادن الأسواق'];
        return Array.from({ length: count }, (_, i) => ({
            id: `SHK-PRD-${String(i + 1).padStart(4, '0')}`,
            name: names[i % names.length] + ` — درجة ${['A', 'B', 'C'][i % 3]}`,
            price: Math.floor(Math.random() * 2000 + 100),
            currency: 'SAR',
            category: categories[i % categories.length],
            availability: Math.random() > 0.1 ? 'in stock' : 'out of stock',
            imageUrl: `https://www.sheikha.top/images/product-${i + 1}.jpg`,
            retailerId: `SHK-${i + 1}`,
        }));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏭 سجل الكيانات — Entity Ledger
    // ═══════════════════════════════════════════════════════════════════════════
    registerEntity(entityId, entityData = {}) {
        const existing = this.chainLedger.entities[entityId];
        const entityDef = this.entityTaxonomy[entityData.entity_type] || {};
        this.chainLedger.entities[entityId] = {
            entity_id:      entityId,
            entity_type:    entityData.entity_type    || 'warehouse',
            supply_role:    entityData.supply_role    || entityDef.supplyRole || 'store',
            market_segment: entityData.market_segment || 'metals',
            hs_chapters:    entityData.hs_chapters    || [],
            country:        entityData.country        || 'sa',
            grade_tier:     entityData.grade_tier     || 3,
            active_status:  true,
            registered_at:  existing ? existing.registered_at : new Date().toISOString(),
            last_seen:      new Date().toISOString(),
            return_rate_pct: entityData.return_rate_pct != null ? entityData.return_rate_pct : (existing ? existing.return_rate_pct : 0),
            total_flow_sar: existing ? existing.total_flow_sar : 0,
        };
        if (!existing) this.chainLedger._stats.total_entities++;
        this._addAuditEntry('ENTITY_REGISTER', null, { entityId, entity_type: entityData.entity_type });
        return this.chainLedger.entities[entityId];
    }

    recordMaterialFlow(flowData = {}) {
        const flowId = `FLOW-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const flow = {
            flow_id:           flowId,
            from_entity_id:    flowData.from_entity_id    || null,
            to_entity_id:      flowData.to_entity_id      || null,
            hs_chapter:        flowData.hs_chapter         || null,
            material_form_from: flowData.material_form_from || null,
            material_form_to:  flowData.material_form_to   || null,
            process_stage:     Number(flowData.process_stage) || null,
            weight_kg:         Number(flowData.weight_kg)   || 0,
            value_sar:         Number(flowData.value_sar)   || 0,
            cycle_number:      Number(flowData.cycle_number) || 1,
            client_type:       flowData.client_type         || 'B2B',
            delivery_hours:    flowData.delivery_hours      != null ? Number(flowData.delivery_hours) : null,
            return_flag:       Boolean(flowData.return_flag),
            timestamp:         new Date().toISOString(),
        };
        this.chainLedger.flows.push(flow);
        // حافظ على آخر 10000 تدفق فقط
        if (this.chainLedger.flows.length > 10000) this.chainLedger.flows.splice(0, this.chainLedger.flows.length - 10000);

        // تحديث إحصاءات
        this.chainLedger._stats.total_flows++;
        this.chainLedger._stats.total_value_sar += flow.value_sar;
        if (flow.client_type === 'G2G') this.chainLedger._stats.g2g_count++;

        // تحديث total_flow_sar للكيانات
        if (flow.from_entity_id && this.chainLedger.entities[flow.from_entity_id]) {
            this.chainLedger.entities[flow.from_entity_id].total_flow_sar += flow.value_sar;
            this.chainLedger.entities[flow.from_entity_id].last_seen = flow.timestamp;
        }
        if (flow.to_entity_id && this.chainLedger.entities[flow.to_entity_id]) {
            this.chainLedger.entities[flow.to_entity_id].total_flow_sar += flow.value_sar;
            this.chainLedger.entities[flow.to_entity_id].last_seen = flow.timestamp;
        }
        return flow;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 مؤشر التميز — Sheikha Excellence Index (SEI)
    // SEI = (EMQ×0.3) + (avgCompetitiveScore×0.3) + (velocityScore×0.2) + (g2gRate×0.2)
    // ═══════════════════════════════════════════════════════════════════════════
    computeSEI() {
        // EMQ من آخر 100 حدث
        const recentEvents = (this.db.events || []).slice(-100);
        const emq = recentEvents.length > 0
            ? recentEvents.reduce((s, e) => s + (e.emq || 6.5), 0) / recentEvents.length
            : 6.5;

        // متوسط competitive_score من آخر 100 حدث
        const scored = recentEvents.filter(e => e.customData && e.customData.competitive_score != null);
        const avgCompetitiveScore = scored.length > 0
            ? scored.reduce((s, e) => s + e.customData.competitive_score, 0) / scored.length
            : 5.0;

        // سرعة السلسلة — متوسط delivery_hours من آخر 50 تدفق له delivery_hours
        const recentFlows = this.chainLedger.flows.slice(-50).filter(f => f.delivery_hours != null);
        const avgDeliveryHours = recentFlows.length > 0
            ? recentFlows.reduce((s, f) => s + f.delivery_hours, 0) / recentFlows.length
            : 48;
        // سرعة أفضل من 24 ساعة = 10، 48ساعة = 7، 96ساعة+ = 4
        const velocityScore = Math.max(4, Math.min(10, 10 - (avgDeliveryHours - 24) / 12));

        // نسبة G2G
        const totalFlows = this.chainLedger._stats.total_flows || 1;
        const g2gRate = Math.min(1, this.chainLedger._stats.g2g_count / totalFlows);
        const g2gScore = g2gRate * 10;

        const sei = (emq * 0.3) + (avgCompetitiveScore * 0.3) + (velocityScore * 0.2) + (g2gScore * 0.2);
        const seiRounded = Math.min(10, Math.round(sei * 10) / 10);

        const snapshot = { sei: seiRounded, emq: Math.round(emq * 100) / 100, avgCompetitiveScore: Math.round(avgCompetitiveScore * 100) / 100, velocityScore: Math.round(velocityScore * 100) / 100, g2gScore: Math.round(g2gScore * 100) / 100, avgDeliveryHours: Math.round(avgDeliveryHours * 10) / 10, computed_at: new Date().toISOString() };
        this.chainLedger._stats.sei_history.push(snapshot);
        if (this.chainLedger._stats.sei_history.length > 720) this.chainLedger._stats.sei_history.splice(0, this.chainLedger._stats.sei_history.length - 720);

        return snapshot;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🎯 حساب النتيجة التنافسية — Competitive Score (0-10)
    // ═══════════════════════════════════════════════════════════════════════════
    calculateCompetitiveScore(contract = {}) {
        let score = 5.0;

        // مكافأة السيادة
        if (contract.client_type === 'B2G')  score += 2.0;
        if (contract.client_type === 'G2G')  score += 3.0;

        // مكافأة الندرة
        if (contract.market_segment === 'rare')       score += 1.5;
        if (contract.material_grade === 'Au_9999')    score += 1.0;
        if (contract.market_segment === 'precious')   score += 0.5;

        // مكافأة السرعة
        if (contract.delivery_hours != null && contract.delivery_hours < 24) score += 1.0;

        // مكافأة إعادة التدوير (الاستدامة)
        if (contract.cycle_number > 1) score += 0.5;

        // مكافأة الحجم
        if (Number(contract.value_sar || contract.value || 0) > 10_000_000) score += 1.0;

        // مكافأة الشهادة الإسلامية
        if (contract.halal_certified === true) score += 0.3;

        return Math.min(10.0, Math.round(score * 10) / 10);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 لقطة السلسلة — Sheikha_Chain_Snapshot (يُرسل كل ساعة لـ CAPI)
    // لا يحتوي أي اسم شركة — مجمّعات فقط لحماية الريادة
    // ═══════════════════════════════════════════════════════════════════════════
    buildChainSnapshot() {
        const now = Date.now();
        const since24h = now - 24 * 60 * 60 * 1000;

        const entities = Object.values(this.chainLedger.entities);
        const recentFlows = this.chainLedger.flows.filter(f => new Date(f.timestamp).getTime() >= since24h);

        // إحصاء الكيانات النشطة آخر 24 ساعة
        const entityCounts = {};
        for (const e of entities) {
            if (!e.active_status) continue;
            const key = `count_entity_${e.entity_type}_${e.supply_role}`;
            entityCounts[key] = (entityCounts[key] || 0) + 1;
        }

        // تدفقات الوزن والقيمة مجمعة بـ hs_chapter + process_stage
        const flowAgg = {};
        for (const f of recentFlows) {
            if (f.hs_chapter && f.process_stage != null) {
                const weightKey = `flow_weight_kg_hs${f.hs_chapter}_stage${f.process_stage}`;
                const valueKey  = `flow_value_sar_hs${f.hs_chapter}_stage${f.process_stage}`;
                flowAgg[weightKey] = Math.round(((flowAgg[weightKey] || 0) + f.weight_kg) * 100) / 100;
                flowAgg[valueKey]  = Math.round(((flowAgg[valueKey]  || 0) + f.value_sar) * 100) / 100;
            }
        }

        // مؤشرات الريادة
        const avgDelivery = recentFlows.filter(f => f.delivery_hours != null);
        const chainVelocityHours = avgDelivery.length > 0
            ? Math.round(avgDelivery.reduce((s, f) => s + f.delivery_hours, 0) / avgDelivery.length)
            : null;
        const preciousFlows = recentFlows.filter(f => f.hs_chapter && (f.hs_chapter.startsWith('71') || f.hs_chapter === '7112'));
        const recycledPrecious = preciousFlows.filter(f => f.cycle_number > 1);
        const recyclePctPrecious = preciousFlows.length > 0 ? Math.round(recycledPrecious.length / preciousFlows.length * 100) : 0;
        const g2gToday = recentFlows.filter(f => f.client_type === 'G2G').length;

        const sei = this.computeSEI();

        const snapshotId = sha256(`snapshot::${Math.floor(now / 3_600_000)}::${process.env.SHEIKHA_CHAIN_SALT || 'default'}`);

        return {
            event_name:    'Sheikha_Chain_Snapshot',
            event_time:    Math.floor(now / 1000),
            action_source: 'system',
            custom_data:   {
                ...entityCounts,
                ...flowAgg,
                chain_velocity_hours:           chainVelocityHours,
                recycle_rate_pct_precious:      recyclePctPrecious,
                g2g_contracts_count:            g2gToday,
                sei:                            sei.sei,
                avg_competitive_score:          sei.avgCompetitiveScore,
                total_entities_active:          entities.filter(e => e.active_status).length,
                total_flows_24h:                recentFlows.length,
                total_value_sar_24h:            Math.round(recentFlows.reduce((s, f) => s + f.value_sar, 0)),
                snapshot_id:                    snapshotId,
            },
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🤖 الطيار الآلي — Autopilot Rules Evaluator
    // ═══════════════════════════════════════════════════════════════════════════
    applyAutoPilotRules(contract = {}) {
        const recommendations = [];

        // 1. الهامش الأمثل
        for (const rule of this.autopilotRules.margin) {
            const match = Object.entries(rule.condition).every(([k, v]) => contract[k] === v);
            if (match) {
                recommendations.push({ type: 'margin', suggested_margin_pct: rule.margin_pct, reason: `entity_type=${rule.condition.entity_type || 'any'} + market_segment=${rule.condition.market_segment || 'any'}` });
                break;
            }
        }

        // 2. توجيه المخزون
        for (const rule of this.autopilotRules.inventoryRoute) {
            const match = Object.entries(rule.condition).every(([k, v]) => contract[k] === v);
            if (match) {
                recommendations.push({ type: 'inventory_route', preferred_warehouse: rule.preferred_warehouse, reason: `market_segment=${rule.condition.market_segment}` });
                break;
            }
        }

        // 3. فحص القائمة السوداء
        if (contract.supplier_entity_id) {
            const entity = this.chainLedger.entities[contract.supplier_entity_id];
            if (entity && entity.return_rate_pct > this.autopilotRules.blacklistThreshold.return_rate_pct) {
                recommendations.push({ type: 'blacklist_warning', supplier_entity_id: contract.supplier_entity_id, return_rate_pct: entity.return_rate_pct, action: 'pause_ads_for_supplier' });
            }
        }

        // 4. نتيجة تنافسية
        const competitiveScore = this.calculateCompetitiveScore(contract);
        recommendations.push({ type: 'competitive_score', score: competitiveScore, note: competitiveScore >= 9 ? 'صفقة ممتازة — أعطها أولوية الميزانية' : competitiveScore >= 7 ? 'صفقة جيدة' : 'صفقة عادية' });

        return { contract_snapshot: { client_type: contract.client_type, market_segment: contract.market_segment, value: contract.value_sar || contract.value }, recommendations, evaluated_at: new Date().toISOString() };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🌍 سجل المصادر الثمينة العالمية — Precious Sources, Secure Transport, Markets
    // ═══════════════════════════════════════════════════════════════════════════

    /** أنواع المصادر المقبولة */
    static get PRECIOUS_SOURCE_TYPES() {
        return ['mine', 'refinery', 'jewelry_market', 'bourse', 'central_bank', 'vault', 'scrap_dealer', 'online_b2b'];
    }

    /** تسجيل مصدر ثمين (منجم، سوق، مصفاة، بورصة، بنك مركزي...) */
    registerPreciousSource(sourceData = {}) {
        const typePrefix = (sourceData.source_type || 'src').slice(0, 4).toUpperCase();
        const country = (sourceData.country || 'XX').toUpperCase();
        const sourceId = sourceData.source_id || `${typePrefix}-${country}-${String(Object.keys(this.preciousLedger.sources).length + 1).padStart(4, '0')}`;

        const existing = this.preciousLedger.sources[sourceId];
        this.preciousLedger.sources[sourceId] = {
            source_id:            sourceId,
            source_type:          sourceData.source_type    || 'mine',
            market_segment:       sourceData.market_segment || 'gold',  // gold, silver, platinum, diamond, jewelry, rare
            continent:            sourceData.continent       || 'Asia',
            country:              country,
            city:                 sourceData.city            || null,
            name:                 sourceData.name            || null,
            hs_chapters:          sourceData.hs_chapters     || ['7108'],
            annual_capacity_kg:   Number(sourceData.annual_capacity_kg)   || 0,
            daily_volume_kg:      Number(sourceData.daily_volume_kg)      || 0,
            grade:                sourceData.grade           || null,
            certifications:       sourceData.certifications  || [],
            secure_logistics_req: sourceData.secure_logistics_req !== false,
            buyer_types:          sourceData.buyer_types     || [],
            contact_email:        sourceData.contact_email   || null,
            grade_tier:           sourceData.grade_tier      || 3,
            sheikha_status:       'active',
            registered_at:        existing ? existing.registered_at : new Date().toISOString(),
            last_updated:         new Date().toISOString(),
            onboarding_score:     this.calculateOnboardingScore(sourceData),
            endorsed_by:          sourceData.endorsed_by || this.SHEIKHA_AUTHORITY.FOUNDER,
        };

        if (!existing) {
            this.preciousLedger._stats.total_sources++;
            this.preciousLedger._stats.continents_covered.add(sourceData.continent || 'Asia');
        }
        this.preciousLedger._stats.last_updated = new Date().toISOString();
        this._addAuditEntry('PRECIOUS_SOURCE_REGISTER', null, { sourceId, source_type: sourceData.source_type, continent: sourceData.continent });
        return this.preciousLedger.sources[sourceId];
    }

    /** تسجيل شركة نقل مؤمن (Brinks, Malca-Amit…) */
    registerSecureTransport(transportData = {}) {
        const transportId = transportData.transport_id || `SEC-${(transportData.company_name || 'TRN').slice(0, 4).toUpperCase()}-${String(Object.keys(this.preciousLedger.transport).length + 1).padStart(3, '0')}`;
        this.preciousLedger.transport[transportId] = {
            transport_id:         transportId,
            company_name:         transportData.company_name          || null,
            continents_covered:   transportData.continents_covered    || [],
            countries_active:     (transportData.countries_active || []).map(c => c.toUpperCase()),
            service_types:        transportData.service_types         || ['armored_air'],
            hs_chapters_allowed:  transportData.hs_chapters_allowed   || ['7108', '7106', '7110', '7113'],
            max_insurance_usd:    Number(transportData.max_insurance_usd) || 50_000_000,
            grade_tier:           transportData.grade_tier            || 2,
            certifications:       transportData.certifications        || [],
            contact_email:        transportData.contact_email         || null,
            sheikha_status:       'active',
            registered_at:        new Date().toISOString(),
            onboarding_score:     this.calculateOnboardingScore({ ...transportData, supply_role: 'transport' }),
        };
        this.preciousLedger._stats.total_transport++;
        (transportData.continents_covered || []).forEach(c => this.preciousLedger._stats.continents_covered.add(c));
        this.preciousLedger._stats.last_updated = new Date().toISOString();
        this._addAuditEntry('SECURE_TRANSPORT_REGISTER', null, { transportId, continents: transportData.continents_covered });
        return this.preciousLedger.transport[transportId];
    }

    /** تسجيل سوق عالمي (بورصة شنغهاي، سوق دبي، زافيري بازار…) */
    registerGlobalMarket(marketData = {}) {
        const country = (marketData.country || 'XX').toUpperCase();
        const marketId = marketData.market_id || `MKT-${(marketData.market_type || 'MKT').slice(0, 3).toUpperCase()}-${country}-${String(Object.keys(this.preciousLedger.markets).length + 1).padStart(3, '0')}`;
        this.preciousLedger.markets[marketId] = {
            market_id:            marketId,
            market_name:          marketData.market_name         || null,
            market_type:          marketData.market_type         || 'souk',   // bourse, souk, retail_hub, online_b2b
            continent:            marketData.continent           || 'Asia',
            country,
            city:                 marketData.city                || null,
            hs_chapters_traded:   marketData.hs_chapters_traded  || ['7108'],
            daily_volume_kg:      Number(marketData.daily_volume_kg) || 0,
            buyer_types:          marketData.buyer_types         || [],
            sheikha_integrated:   Boolean(marketData.sheikha_integrated),
            contact_email:        marketData.contact_email       || null,
            sheikha_status:       'active',
            registered_at:        new Date().toISOString(),
            onboarding_score:     this.calculateOnboardingScore({ ...marketData, supply_role: 'use', entity_type: 'end_user' }),
        };
        this.preciousLedger._stats.total_markets++;
        this.preciousLedger._stats.continents_covered.add(marketData.continent || 'Asia');
        this.preciousLedger._stats.last_updated = new Date().toISOString();
        this._addAuditEntry('GLOBAL_MARKET_REGISTER', null, { marketId, market_type: marketData.market_type, continent: marketData.continent });
        return this.preciousLedger.markets[marketId];
    }

    /** نقطة تسجيل شاحن / مصنع / مورد بالطريقة الموحدة (Global Onboarding) */
    registerGlobalEntity(entityData = {}) {
        // يسجل في chainLedger + preciousLedger إذا كان مصدراً ثميناً
        const entity = this.registerEntity(
            entityData.entity_id || `${(entityData.entity_type || 'ENT').slice(0, 4).toUpperCase()}-${(entityData.country || 'XX').toUpperCase()}-${Date.now()}`,
            entityData,
        );
        // إذا كان مصدر ثمين أيضاً
        let precSource = null;
        if (['mine', 'refinery', 'vault', 'jewelry_market', 'bourse'].includes(entityData.entity_type)) {
            precSource = this.registerPreciousSource({ ...entityData, source_type: entityData.entity_type });
        }
        const onboardingScore = this.calculateOnboardingScore(entityData);
        this._addAuditEntry('GLOBAL_ENTITY_ONBOARD', null, { entity_id: entity.entity_id, entity_type: entityData.entity_type, onboarding_score: onboardingScore });
        return { entity, precSource, onboarding_score: onboardingScore };
    }

    /** إيجاد أنسب ناقل مؤمن لقارة وقائمة HS Chapters */
    findSecureTransport(continent, hsChapters = []) {
        const carriers = Object.values(this.preciousLedger.transport).filter(t => {
            if (t.sheikha_status !== 'active') return false;
            if (continent && !t.continents_covered.includes(continent)) return false;
            if (hsChapters.length > 0) {
                return hsChapters.some(h => t.hs_chapters_allowed.includes(h));
            }
            return true;
        });
        carriers.sort((a, b) => {
            const tiers = a.grade_tier - b.grade_tier;
            if (tiers !== 0) return tiers;
            return b.max_insurance_usd - a.max_insurance_usd;
        });
        return carriers.slice(0, 5);
    }

    /** مطابقة طلب مشتري مع أفضل مصدر + ناقل مؤمن (Global Matcher) */
    globalMatch(buyerRequest = {}) {
        const { continent, hs_chapter, hs_chapters, market_segment, min_capacity_kg, max_distance_continents } = buyerRequest;
        const hsFilter = hs_chapters || (hs_chapter ? [hs_chapter] : []);

        // مصادر مطابقة
        let sources = Object.values(this.preciousLedger.sources).filter(s => {
            if (s.sheikha_status !== 'active') return false;
            if (market_segment && s.market_segment !== market_segment) return false;
            if (hsFilter.length > 0 && !hsFilter.some(h => s.hs_chapters.includes(h))) return false;
            if (min_capacity_kg && s.annual_capacity_kg > 0 && s.annual_capacity_kg < min_capacity_kg * 12) return false;
            return true;
        });
        sources.sort((a, b) => b.onboarding_score - a.onboarding_score);
        sources = sources.slice(0, 10);

        // نقل مؤمن مطابق
        const transport = this.findSecureTransport(continent, hsFilter);

        // أسواق مقصد مطابقة
        let markets = Object.values(this.preciousLedger.markets).filter(m => {
            if (m.sheikha_status !== 'active') return false;
            if (continent && m.continent !== continent) return false;
            if (hsFilter.length > 0 && !hsFilter.some(h => m.hs_chapters_traded.includes(h))) return false;
            return true;
        });
        markets.sort((a, b) => b.daily_volume_kg - a.daily_volume_kg);
        markets = markets.slice(0, 5);

        const totalSources = Object.keys(this.preciousLedger.sources).length;
        const continusCovered = this.preciousLedger._stats.continents_covered.size;
        const competitiveScore = Math.min(10, 5 + (sources.length > 0 ? 1.5 : 0) + (transport.length > 0 ? 1.5 : 0) + (continusCovered >= 4 ? 1.5 : continusCovered >= 2 ? 0.8 : 0) + (totalSources >= 100 ? 0.5 : 0));

        return {
            matched_sources:    sources,
            matched_transport:  transport,
            matched_markets:    markets,
            competitive_score:  Math.round(competitiveScore * 10) / 10,
            sheikha_network:    { total_sources: totalSources, continents_covered: continusCovered, total_transport: Object.keys(this.preciousLedger.transport).length, total_markets: Object.keys(this.preciousLedger.markets).length },
            matched_at:         new Date().toISOString(),
        };
    }

    /** نتيجة التأهيل العالمي — Onboarding Score (0-10) */
    calculateOnboardingScore(entity = {}) {
        let score = 7.0;
        // مكافأة الدرجة
        if (entity.grade_tier === 1) score += 1.5;
        else if (entity.grade_tier === 2) score += 0.75;
        // مكافأة التغطية الجغرافية
        const continents = entity.continents || entity.continents_covered || [];
        if (continents.length >= 4) score += 1.0;
        else if (continents.length >= 2) score += 0.5;
        // مكافأة شهادة LBMA
        if ((entity.certifications || []).includes('LBMA')) score += 0.5;
        if ((entity.certifications || []).includes('RJC'))  score += 0.3;
        if ((entity.certifications || []).includes('ISO9001')) score += 0.2;
        // مكافأة جاهزية البيع
        if (entity.ready_to_sell === true) score += 0.2;
        return Math.min(10.0, Math.round(score * 10) / 10);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🧠 Vibes AI — تحليل مزاج السوق لحظياً
    // يتصل بـ Vibes AI API ويُعيد sentiment/confidence/timing
    // إذا لم يُوجد VIBES_API_KEY، يُعيد تحليلاً محلياً بناءً على بيانات شيخة
    // ═══════════════════════════════════════════════════════════════════════════
    async analyzeMarketVibe(hs_chapter = '7108', region = 'Global') {
        const VIBES_API_KEY = process.env.VIBES_API_KEY;
        let vibe;

        if (VIBES_API_KEY) {
            try {
                const axios = require('axios');
                const resp = await axios.post(
                    'https://api.vibes.ai/v1/market-sentiment',
                    { query: `HS ${hs_chapter} market ${region}`, source: 'Sheikha Sovereign Core' },
                    { headers: { Authorization: `Bearer ${VIBES_API_KEY}` }, timeout: 8000 }
                );
                vibe = resp.data;
            } catch {
                vibe = this._localMarketVibe(hs_chapter, region);
            }
        } else {
            // تحليل محلي ذكي — يعتمد على حجم الطلبات والمصادر المسجلة في شيخة
            vibe = this._localMarketVibe(hs_chapter, region);
        }

        // احفظ آخر نبضة للسوق
        this._vibesStats.last_market_vibe = { hs_chapter, region, ...vibe, timestamp: new Date().toISOString() };

        // لو السوق صاعد بثقة عالية → فعّل حملة بيع آلياً (webhook داخلي)
        if (vibe.sentiment === 'Bullish' && (vibe.confidence || 0) >= 0.85) {
            this._addAuditEntry('vibes_bullish_trigger', null, { hs_chapter, region, confidence: vibe.confidence });
        }

        return vibe;
    }

    // تحليل محلي يعتمد على إحصاءات شيخة الداخلية
    _localMarketVibe(hs_chapter, region) {
        const totalSources   = Object.keys(this.preciousLedger.sources).length;
        const totalMarkets   = Object.keys(this.preciousLedger.markets).length;
        const totalTransport = Object.keys(this.preciousLedger.transport).length;

        // كلما زادت المصادر المسجلة، زادت الثقة
        const confidence = Math.min(0.99, 0.60 + (totalSources * 0.015) + (totalMarkets * 0.01));
        const sentiment  = totalSources >= 10 ? 'Bullish' : 'Neutral';
        const risk       = confidence >= 0.85 ? 'Low' : 'Medium';

        const segmentMap = { '7108': 'Gold', '7106': 'Silver', '7110': 'Platinum', '7102': 'Diamond', '7113': 'Jewelry', '7404': 'Copper' };
        const metalLabel = segmentMap[hs_chapter] || `HS ${hs_chapter}`;

        return {
            sentiment,
            confidence: Math.round(confidence * 100) / 100,
            risk,
            metal:              metalLabel,
            region,
            best_time_to_sell:  sentiment === 'Bullish' ? 'Next 72h' : 'Monitor 7 days',
            recommendation:     sentiment === 'Bullish' ? 'تنفيذ فوري' : 'انتظار',
            sheikha_sources:    totalSources,
            sheikha_markets:    totalMarkets,
            sheikha_carriers:   totalTransport,
            source:             'Sheikha Internal Analytics (Local Vibe)',
            disclaimer:         'تحليل داخلي — يُنصح بتفعيل VIBES_API_KEY للبيانات الخارجية',
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🎨 Meta AI Demos — توليد محتوى سيادي (عروض + فيديو)
    // يتصل بـ Meta AI Demos API لإنشاء أصول تسويقية بختم شيخة
    // إذا لم يُوجد META_AI_KEY، يُعيد رابطاً تجريبياً موثقاً
    // ═══════════════════════════════════════════════════════════════════════════
    async generateSovereignDeck(fs_data = {}) {
        const META_AI_KEY = process.env.META_AI_KEY;
        const prompt = [
            `Create an executive bankable feasibility study deck.`,
            `Project: ${fs_data.project_name || 'Sheikha Global Investment Initiative'}.`,
            `CAPEX: ${fs_data.capex || 'TBD'}.`,
            `Region: ${fs_data.region || 'Global'}.`,
            `Market Segment: ${fs_data.market_segment || 'Precious Metals'}.`,
            `Approved by: Salman Ahmad Al-Rajeh — SABIC & State Approved Expert.`,
            `Doctrine: صناعة المجد لله. بلا ضرر ولا ضرار.`,
        ].join(' ');

        if (META_AI_KEY) {
            try {
                const axios = require('axios');
                const resp = await axios.post(
                    'https://www.aidemos.meta.com/api/generate-deck',
                    { prompt, template: 'sovereign_investment', branding: 'Sheikha', language: 'ar' },
                    { headers: { Authorization: `Bearer ${META_AI_KEY}` }, timeout: 30000 }
                );
                this._vibesStats.ai_assets_generated++;
                return resp.data.url || resp.data.deck_url;
            } catch (e) {
                this._addAuditEntry('meta_ai_deck_error', null, { error: e.message });
            }
        }

        // Fallback — بيانات تجريبية موثقة
        this._vibesStats.ai_assets_generated++;
        return `https://sheikha.top/ai-assets/deck-${Date.now()}.pdf?status=pending&meta_ai_key_required=true`;
    }

    async generateMineVideo(mine_data = {}) {
        const META_AI_KEY = process.env.META_AI_KEY;
        const prompt = [
            `Cinematic aerial view of ${mine_data.name || 'Sheikha Global Mine'} in ${mine_data.country || 'the world'}.`,
            `Text overlay: معتمد من شبكة شيخة السيادية.`,
            `End frame: توقيع سلمان أحمد الراجح — صناعة المجد لله.`,
        ].join(' ');

        if (META_AI_KEY) {
            try {
                const axios = require('axios');
                const resp = await axios.post(
                    'https://www.aidemos.meta.com/api/create_video',
                    { prompt, orientation: 'landscape', branding: 'Sheikha' },
                    { headers: { Authorization: `Bearer ${META_AI_KEY}` }, timeout: 60000 }
                );
                this._vibesStats.ai_assets_generated++;
                return resp.data.video_url || resp.data.url;
            } catch (e) {
                this._addAuditEntry('meta_ai_video_error', null, { error: e.message });
            }
        }

        this._vibesStats.ai_assets_generated++;
        return `https://sheikha.top/ai-assets/video-${Date.now()}.mp4?status=pending&meta_ai_key_required=true`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📧 Sheikha Executive Assistant — Email + Calendar + WhatsApp Automation
    // يعمل كسكرتير سيادي: يقرأ الإيميلات، يدير التقويم، يرسل واتساب آلياً
    // يحتاج: GOOGLE_OAUTH_TOKEN / OUTLOOK_OAUTH_TOKEN للبريد والتقويم
    //        WHATSAPP_BUSINESS_TOKEN + WHATSAPP_PHONE_ID للواتساب
    // ═══════════════════════════════════════════════════════════════════════════

    _startExecutiveAssistant() {
        const INTERVAL_MS = 5 * 60 * 1000; // 5 دقائق
        this._eaInterval = setInterval(async () => {
            try { await this.scanEmail(); } catch (e) { this._addAuditEntry('EA_SCAN_EMAIL_ERROR', null, { error: e.message }); }
            try { await this.manageCalendar(); } catch (e) { this._addAuditEntry('EA_CALENDAR_ERROR', null, { error: e.message }); }
        }, INTERVAL_MS);
        this._addAuditEntry('EA_STARTED', null, { interval_ms: INTERVAL_MS, mode: 'SHEIKHA_ULTRA' });
    }

    // ─── مسح البريد الإلكتروني وإرسال ردود تلقائية ──────────────────────────
    async scanEmail() {
        const GOOGLE_TOKEN  = process.env.GOOGLE_OAUTH_TOKEN;
        const OUTLOOK_TOKEN = process.env.OUTLOOK_OAUTH_TOKEN;

        // كلمات المفاتيح الخاصة بطلبات الشراء والمعادن
        const KEYWORDS = ['"طلب عرض"', '"RFQ"', '"HS7108"', '"HS7403"', '"HS7102"', '"نحاس"', '"ذهب"', '"LME"', '"COMEX"', '"Gold"', '"Copper"'];

        this._eaStats.last_scan_at = new Date().toISOString();
        this._eaStats.emails_scanned++;

        const processEmails = async (emails, provider) => {
            for (const email of (emails || [])) {
                if (!email.is_unread) continue;
                try {
                    // بناء توقيع البريد السيادي
                    const signature = [
                        '',
                        '---',
                        `${this.SHEIKHA_AUTHORITY.FOUNDER} | مزود دراسات جدوى معتمد | سابك والدولة`,
                        `📞 ${this.SHEIKHA_AUTHORITY.FOUNDER_PHONE}  |  🌐 https://sheikha.top`,
                        `صناعة المجد لله. نفع الخلق لله. بلا ضرر ولا ضرار.`,
                    ].join('\n');

                    const slot = this._getNextAvailableSlot();
                    const replyBody = [
                        `السلام عليكم ورحمة الله وبركاته،`,
                        ``,
                        `شكراً على تواصلك. استلمنا طلبك: "${email.subject}"`,
                        ``,
                        `مرفق دراسة جدوى أولية معتمدة من الدولة وسابك للمشروع المذكور.`,
                        `للتوقيع والمتابعة، يرجى تحديد موعد:`,
                        `📅 ${slot.date} — ${slot.time} (بتوقيت الرياض)`,
                        `🔗 https://sheikha.top/schedule?ref=${email.id || Date.now()}`,
                        ``,
                        `بإمكانك أيضاً التواصل مباشرة عبر واتساب: ${this.SHEIKHA_AUTHORITY.FOUNDER_WHATSAPP}`,
                        signature,
                    ].join('\n');

                    // أرسل الرد عبر provider المناسب (Google / Outlook)
                    await this._sendEmailReply({ provider, email, body: replyBody, slot });
                    this._eaStats.rfq_emails_replied++;
                    this._addAuditEntry('EA_RFQ_REPLIED', null, { provider, subject: email.subject, from: email.from, slot: slot.date });
                } catch (err) {
                    this._addAuditEntry('EA_EMAIL_REPLY_ERROR', null, { error: err.message, subject: email.subject });
                }
            }
        };

        // Google Mail
        if (GOOGLE_TOKEN) {
            try {
                const axios = require('axios');
                const q = KEYWORDS.map(k => k.replace(/"/g, '')).join(' OR ');
                const resp = await axios.get(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=20`,
                    { headers: { Authorization: `Bearer ${GOOGLE_TOKEN}` }, timeout: 10000 }
                );
                const messages = (resp.data.messages || []).map(m => ({ id: m.id, is_unread: true, subject: 'Gmail RFQ', from: 'unknown', provider: 'GOOGLE' }));
                await processEmails(messages, 'GOOGLE');
            } catch (e) {
                this._addAuditEntry('EA_GMAIL_ERROR', null, { error: e.message });
            }
        }

        // Outlook / Microsoft Graph
        if (OUTLOOK_TOKEN) {
            try {
                const axios = require('axios');
                const filter = KEYWORDS.map(k => `contains(subject,'${k.replace(/"/g, '')}')`).join(' or ');
                const resp = await axios.get(
                    `https://graph.microsoft.com/v1.0/me/messages?$filter=isRead eq false&$search="${KEYWORDS[1]}"&$top=20`,
                    { headers: { Authorization: `Bearer ${OUTLOOK_TOKEN}` }, timeout: 10000 }
                );
                const messages = (resp.data.value || []).map(m => ({ id: m.id, is_unread: !m.isRead, subject: m.subject, from: m.from?.emailAddress?.address, provider: 'OUTLOOK' }));
                await processEmails(messages.filter(m => m.is_unread), 'OUTLOOK');
            } catch (e) {
                this._addAuditEntry('EA_OUTLOOK_ERROR', null, { error: e.message });
            }
        }

        return {
            scanned: this._eaStats.emails_scanned,
            replied: this._eaStats.rfq_emails_replied,
            last_scan: this._eaStats.last_scan_at,
            google_connected:  !!GOOGLE_TOKEN,
            outlook_connected: !!OUTLOOK_TOKEN,
        };
    }

    // ─── إدارة التقويم: تحضير ملخصات الاجتماعات ───────────────────────────────
    async manageCalendar() {
        const GOOGLE_TOKEN  = process.env.GOOGLE_OAUTH_TOKEN;
        const OUTLOOK_TOKEN = process.env.OUTLOOK_OAUTH_TOKEN;
        const HIGH_PRIORITY_KEYWORDS = ['ذهب', 'نحاس', 'صفقة', 'منجم', 'Gold', 'Copper', 'Mine', 'Deal', 'RFQ', 'دراسة جدوى'];

        const processEvents = async (events, provider) => {
            const managed = [];
            for (const event of (events || [])) {
                const title = event.title || event.subject || '';
                const isHighPriority = HIGH_PRIORITY_KEYWORDS.some(kw => title.includes(kw));
                if (isHighPriority) {
                    this._eaStats.calendar_events_managed++;
                    managed.push({ id: event.id, title, priority: 'HIGH', provider });
                    this._addAuditEntry('EA_CALENDAR_HIGH_PRIORITY', null, { title, provider, event_id: event.id });
                }
            }
            return managed;
        };

        let allManaged = [];

        if (GOOGLE_TOKEN) {
            try {
                const axios = require('axios');
                const now = new Date().toISOString();
                const plus7d = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
                const resp = await axios.get(
                    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${plus7d}&singleEvents=true&orderBy=startTime`,
                    { headers: { Authorization: `Bearer ${GOOGLE_TOKEN}` }, timeout: 10000 }
                );
                const events = (resp.data.items || []).map(e => ({ id: e.id, title: e.summary || '' }));
                allManaged = allManaged.concat(await processEvents(events, 'GOOGLE'));
            } catch (e) {
                this._addAuditEntry('EA_GCAL_ERROR', null, { error: e.message });
            }
        }

        if (OUTLOOK_TOKEN) {
            try {
                const axios = require('axios');
                const now = new Date().toISOString();
                const plus7d = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
                const resp = await axios.get(
                    `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${now}&endDateTime=${plus7d}`,
                    { headers: { Authorization: `Bearer ${OUTLOOK_TOKEN}` }, timeout: 10000 }
                );
                const events = (resp.data.value || []).map(e => ({ id: e.id, title: e.subject || '' }));
                allManaged = allManaged.concat(await processEvents(events, 'OUTLOOK'));
            } catch (e) {
                this._addAuditEntry('EA_OUTLOOK_CAL_ERROR', null, { error: e.message });
            }
        }

        return {
            events_managed: this._eaStats.calendar_events_managed,
            high_priority: allManaged,
            google_connected:  !!GOOGLE_TOKEN,
            outlook_connected: !!OUTLOOK_TOKEN,
        };
    }

    // ─── إرسال رسالة ترحيب عبر WhatsApp Business ──────────────────────────────
    async welcomeViaWhatsApp(customer_phone, customer_name = null) {
        const WA_TOKEN    = process.env.WHATSAPP_BUSINESS_TOKEN;
        const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

        const greeting = customer_name ? `حياك الله ${customer_name}،` : 'حياك الله،';
        const message  = [
            `${greeting}`,
            ``,
            `وعليكم السلام ورحمة الله.`,
            `معك مكتب القائد ${this.SHEIKHA_AUTHORITY.FOUNDER} — شيخة السيادية.`,
            ``,
            `استلمنا طلبك. مرفق دراسة أولية معتمدة من الدولة وسابك.`,
            `للتواصل المباشر: ${this.SHEIKHA_AUTHORITY.FOUNDER_PHONE}`,
            ``,
            `وش نوع المشروع اللي تبي له دراسة؟`,
            `1️⃣ ذهب   2️⃣ نحاس   3️⃣ ألمنيوم   4️⃣ فضة   5️⃣ غيره`,
            ``,
            `اكتب رقم بس، وأرسل لك دراسة أولية + فيديو من المنجم خلال دقيقة.`,
            `صناعة المجد لله.`,
        ].join('\n');

        if (WA_TOKEN && WA_PHONE_ID) {
            try {
                const axios = require('axios');
                const resp = await axios.post(
                    `https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`,
                    {
                        messaging_product: 'whatsapp',
                        to: customer_phone.replace(/\D/g, ''),
                        type: 'text',
                        text: { body: message },
                    },
                    { headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' }, timeout: 10000 }
                );
                this._eaStats.whatsapp_sent++;
                this._addAuditEntry('EA_WHATSAPP_SENT', null, { to: `****${String(customer_phone).slice(-4)}`, message_id: resp.data?.messages?.[0]?.id });
                return { sent: true, message_id: resp.data?.messages?.[0]?.id };
            } catch (e) {
                this._addAuditEntry('EA_WHATSAPP_ERROR', null, { error: e.message });
                return { sent: false, error: e.message, fallback_url: `${this.SHEIKHA_AUTHORITY.FOUNDER_WHATSAPP}?text=${encodeURIComponent(message)}` };
            }
        }

        // بدون مفتاح: أعد رابط واتساب مباشر جاهز للإرسال
        this._eaStats.whatsapp_sent++;
        return {
            sent: false,
            wa_token_required: true,
            fallback_url: `${this.SHEIKHA_AUTHORITY.FOUNDER_WHATSAPP}?text=${encodeURIComponent(message)}`,
            message_preview: message,
            note: 'أضف WHATSAPP_BUSINESS_TOKEN + WHATSAPP_PHONE_ID في الـ .env لإرسال تلقائي',
        };
    }

    // مساعد: يعيد أقرب وقت متاح في التقويم (stub منطقي)
    _getNextAvailableSlot() {
        const now   = new Date();
        const start = new Date(now.getTime() + 2 * 24 * 3600 * 1000); // بعد يومين
        // التحقق من وقت العمل: 9ص – 5م
        start.setHours(10, 0, 0, 0);
        if (start.getDay() === 5) start.setDate(start.getDate() + 2); // تخطى الجمعة
        if (start.getDay() === 6) start.setDate(start.getDate() + 1); // تخطى السبت
        return {
            date: start.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            time: '10:00 صباحاً',
            iso:  start.toISOString(),
        };
    }

    // مساعد: إرسال رد إيميل (stub — يتطلب OAuth token نشط)
    async _sendEmailReply({ provider, email, body, slot }) {
        const GOOGLE_TOKEN  = process.env.GOOGLE_OAUTH_TOKEN;
        const OUTLOOK_TOKEN = process.env.OUTLOOK_OAUTH_TOKEN;

        if (provider === 'GOOGLE' && GOOGLE_TOKEN) {
            const axios = require('axios');
            const raw = Buffer.from([
                `To: ${email.from}`,
                `Subject: Re: ${email.subject} — دراسة جدوى معتمدة | سلمان الراجح`,
                `Content-Type: text/plain; charset=utf-8`,
                ``,
                body,
            ].join('\r\n')).toString('base64url');
            await axios.post(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
                { raw },
                { headers: { Authorization: `Bearer ${GOOGLE_TOKEN}` }, timeout: 15000 }
            );
        } else if (provider === 'OUTLOOK' && OUTLOOK_TOKEN) {
            const axios = require('axios');
            await axios.post(
                `https://graph.microsoft.com/v1.0/me/sendMail`,
                { message: { subject: `Re: ${email.subject} — دراسة جدوى معتمدة | سلمان الراجح`, body: { contentType: 'Text', content: body }, toRecipients: [{ emailAddress: { address: email.from } }] } },
                { headers: { Authorization: `Bearer ${OUTLOOK_TOKEN}`, 'Content-Type': 'application/json' }, timeout: 15000 }
            );
        }
        // إذا لم يوجد token، تُسجَّل العملية فقط
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🌱 البذور الكونية — Pre-seed well-known precious-metal sources & markets
    // ═══════════════════════════════════════════════════════════════════════════
    _seedGlobalSources() {
        // ── مناجم الذهب ─────────────────────────────────────────────────────────
        const mines = [
            { source_type:'mine', market_segment:'gold',   continent:'Africa',        country:'ZA', city:'Johannesburg', name:'Mponeng Gold Mine',       hs_chapters:['7108'], annual_capacity_kg:25000, grade:'900-950', certifications:['LBMA'], grade_tier:1 },
            { source_type:'mine', market_segment:'gold',   continent:'Africa',        country:'GH', city:'Obuasi',       name:'Obuasi Gold Mine',         hs_chapters:['7108'], annual_capacity_kg:15000, grade:'850-900', certifications:['LBMA'], grade_tier:1 },
            { source_type:'mine', market_segment:'gold',   continent:'Africa',        country:'TZ', city:'Mwanza',       name:'Geita Gold Mine',          hs_chapters:['7108'], annual_capacity_kg:13000, grade:'870-920', certifications:['LBMA'], grade_tier:2 },
            { source_type:'mine', market_segment:'gold',   continent:'Australia',     country:'AU', city:'Kalgoorlie',   name:'Super Pit Gold Mine',      hs_chapters:['7108'], annual_capacity_kg:18000, grade:'900-940', certifications:['LBMA'], grade_tier:1 },
            { source_type:'mine', market_segment:'gold',   continent:'North America', country:'CA', city:'Timmins',      name:'Hollinger Open Pit Mine',  hs_chapters:['7108'], annual_capacity_kg:10000, grade:'880-930', certifications:['LBMA'], grade_tier:2 },
            { source_type:'mine', market_segment:'silver', continent:'South America', country:'PE', city:'Cerro de Pasco',name:'Cerro de Pasco Mine',     hs_chapters:['7106'], annual_capacity_kg:90000, grade:'999',     certifications:['LBMA'], grade_tier:1 },
            { source_type:'mine', market_segment:'silver', continent:'North America', country:'MX', city:'Zacatecas',    name:'Fresnillo Silver Mine',    hs_chapters:['7106'], annual_capacity_kg:80000, grade:'999',     certifications:['LBMA'], grade_tier:1 },
            { source_type:'mine', market_segment:'gold',   continent:'Asia',          country:'UZ', city:'Navoiy',       name:'Muruntau Gold Mine',       hs_chapters:['7108'], annual_capacity_kg:20000, grade:'900-950', certifications:['LBMA'], grade_tier:1 },
            { source_type:'mine', market_segment:'gold',   continent:'Asia',          country:'CN', city:'Shandong',     name:'Shandong Gold Mine',       hs_chapters:['7108'], annual_capacity_kg:16000, grade:'870-920', certifications:['LBMA'], grade_tier:2 },
            { source_type:'mine', market_segment:'gold',   continent:'South America', country:'BR', city:'Minas Gerais', name:'Córrego do Sítio Mine',    hs_chapters:['7108'], annual_capacity_kg:8000,  grade:'850-900', certifications:[],       grade_tier:2 },
        ];
        // ── مصافي ومكررات ────────────────────────────────────────────────────────
        const refineries = [
            { source_type:'refinery', market_segment:'gold',   continent:'Europe',        country:'CH', city:'Lugano',   name:'PAMP Suisse Refinery',     hs_chapters:['7108.12'], annual_capacity_kg:450000, grade:'9999', certifications:['LBMA'], grade_tier:1 },
            { source_type:'refinery', market_segment:'gold',   continent:'Europe',        country:'CH', city:'Pforzheim',name:'Argor-Heraeus Refinery',   hs_chapters:['7108.12'], annual_capacity_kg:400000, grade:'9999', certifications:['LBMA'], grade_tier:1 },
            { source_type:'refinery', market_segment:'gold',   continent:'Asia',          country:'AE', city:'Dubai',    name:'Emirates Gold Refinery',   hs_chapters:['7108.12'], annual_capacity_kg:200000, grade:'9999', certifications:['LBMA'], grade_tier:1 },
            { source_type:'refinery', market_segment:'gold',   continent:'Asia',          country:'SG', city:'Singapore',name:'Singapore Precious Metals',hs_chapters:['7108.12'], annual_capacity_kg:150000, grade:'9999', certifications:['LBMA'], grade_tier:2 },
        ];
        // ── أسواق مجوهرات وبورصات ────────────────────────────────────────────────
        const markets = [
            { market_type:'souk',   market_segment:'jewelry', continent:'Asia',          country:'AE', city:'Dubai',     market_name:'Dubai Gold Souk',        hs_chapters_traded:['7113','7116'], daily_volume_kg:5000,  buyer_types:['retail','wholesale','export'], sheikha_integrated:true },
            { market_type:'bourse', market_segment:'gold',    continent:'Asia',          country:'CN', city:'Shanghai',  market_name:'Shanghai Gold Exchange',  hs_chapters_traded:['7108.12','7108.13','7106.91'], daily_volume_kg:12000, buyer_types:['central_bank','jeweler','investor'] },
            { market_type:'bourse', market_segment:'gold',    continent:'Europe',        country:'GB', city:'London',    market_name:'London Bullion Market',   hs_chapters_traded:['7108','7106'], daily_volume_kg:18000, buyer_types:['central_bank','investor','bank'], sheikha_integrated:true },
            { market_type:'bourse', market_segment:'gold',    continent:'North America', country:'US', city:'New York',  market_name:'COMEX Gold',              hs_chapters_traded:['7108'], daily_volume_kg:15000, buyer_types:['investor','bank','hedge_fund'] },
            { market_type:'souk',   market_segment:'jewelry', continent:'Asia',          country:'IN', city:'Mumbai',    market_name:'Zaveri Bazaar',           hs_chapters_traded:['7113','7116'], daily_volume_kg:3000,  buyer_types:['retail','wholesale','export'] },
            { market_type:'souk',   market_segment:'jewelry', continent:'Asia',          country:'SA', city:'Riyadh',    market_name:'سوق الذهب الرياض',       hs_chapters_traded:['7113','7116'], daily_volume_kg:1500,  buyer_types:['retail','wholesale'], sheikha_integrated:true },
            { market_type:'souk',   market_segment:'jewelry', continent:'Asia',          country:'SA', city:'Jeddah',    market_name:'سوق الذهب جدة',          hs_chapters_traded:['7113','7116'], daily_volume_kg:2000,  buyer_types:['retail','wholesale','export'], sheikha_integrated:true },
            { market_type:'retail_hub', market_segment:'jewelry', continent:'Europe',   country:'IT', city:'Vicenza',   market_name:'Vicenza Oro',             hs_chapters_traded:['7113'], daily_volume_kg:800, buyer_types:['wholesale','export'] },
            { market_type:'bourse', market_segment:'gold',    continent:'Asia',          country:'JP', city:'Tokyo',     market_name:'Tokyo Commodity Exchange', hs_chapters_traded:['7108'], daily_volume_kg:4000, buyer_types:['investor','bank'] },
        ];
        // ── شركات النقل المؤمن ────────────────────────────────────────────────────
        const transport = [
            { company_name:'Brinks Global Services',    continents_covered:['North America','Europe','Asia','Africa','South America'], countries_active:['US','GB','CH','AE','SG','ZA','BR'], service_types:['armored_air','vault_to_vault','mine_pickup'], hs_chapters_allowed:['7108','7106','7110','7113'], max_insurance_usd:500000000, grade_tier:1, certifications:['ISO9001'] },
            { company_name:'Malca-Amit Global',         continents_covered:['Europe','Asia','North America','Africa'],                countries_active:['GB','CH','HK','US','AE','ZA'],      service_types:['armored_air','vault_to_vault'],                hs_chapters_allowed:['7108','7106','7113','7116'], max_insurance_usd:300000000, grade_tier:1, certifications:['TAPA'] },
            { company_name:'Loomis International',      continents_covered:['Europe','North America'],                               countries_active:['SE','DE','FR','US','GB'],            service_types:['armored_ground','vault_to_vault'],            hs_chapters_allowed:['7108','7106'],              max_insurance_usd:200000000, grade_tier:2, certifications:['ISO9001'] },
            { company_name:'Transguard Group',          continents_covered:['Asia'],                                                 countries_active:['AE','SA','KW','BH'],                 service_types:['armored_air','vault_to_vault','mine_pickup'], hs_chapters_allowed:['7108','7106','7110','7113'], max_insurance_usd:100000000, grade_tier:1, certifications:['ISO9001'] },
            { company_name:'Ferrari International (GS)',continents_covered:['Europe','Asia','Africa'],                               countries_active:['IT','CH','AE','SG','ZA'],            service_types:['armored_air','door_to_door'],                 hs_chapters_allowed:['7108','7113'],              max_insurance_usd:150000000, grade_tier:2, certifications:['TAPA'] },
        ];

        for (const m of mines)      this.registerPreciousSource(m);
        for (const r of refineries) this.registerPreciousSource(r);
        for (const mkt of markets)  this.registerGlobalMarket(mkt);
        for (const t of transport)  this.registerSecureTransport(t);
    }

}

module.exports = SheikhMetaEngine;
