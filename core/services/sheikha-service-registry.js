'use strict';

/**
 * SHEIKHA SERVICE REGISTRY
 * منظومة شيخة — مزود الخدمة العالمي الموحد
 * B2B | B2C | B2G
 *
 * بسم الله الرحمن الرحيم
 * "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — البقرة 275
 * "لَا ضَرَرَ وَلَا ضِرَارَ" — الحديث الشريف
 */

const SHEIKHA_IDENTITY = Object.freeze({
    name:        'SHEIKHA',
    fullName:    'SHEIKHA UGIT-RP',
    nameAr:      'منظومة وسوق شيخة',
    description: 'منصة تشغيلية عالمية موحدة للصناعة والتجارة وسلاسل الإمداد والتدوير والمدن الذكية',
    descriptionEn: 'Unified Global Industrial & Trade Runtime Platform',
    domain:      'sheikha.top',
    email:       'market@sheikha.top',
    governance:  'quran_sunnah',
    principle:   'الإتقان والعدل والنفع لأمة محمد ﷺ وكل البشر',
    mission:     'تزويد الأفضل في الكون من أنظمة وذكاءات وخدمات بأعلى قيمة وأحسن إتقان',
    activatedAt: '2025-10-18T20:53:25+03:00'
});

// ─── B2B — تجارة المنظومات والشركات ─────────────────────────────────────────
const B2B_TIER = Object.freeze({
    id:          'b2b',
    nameAr:      'خدمة الشركات والمنظومات',
    nameEn:      'Business-to-Business',
    enabled:     process.env.SHEIKHA_B2B_ENABLED !== 'false',
    tier:        process.env.SHEIKHA_B2B_TIER || 'enterprise',
    audience:    ['factories', 'traders', 'suppliers', 'exporters', 'importers', 'industrial_companies'],
    capabilities: [
        'bulk_rfq',              // طلبات الأسعار الجماعية
        'supply_chain_ops',      // عمليات سلاسل الإمداد
        'erp_integration',       // ربط مع أنظمة ERP
        'api_access',            // وصول API مباشر
        'contract_management',   // إدارة العقود
        'trade_intelligence',    // ذكاء التجارة والمعادن
        'hs_code_classification',// تصنيف HS Code
        'price_index',           // مؤشر أسعار شيخة
        'customs_compliance',    // الامتثال الجمركي
        'b2b_network',           // شبكة موردين وعملاء
        'white_label_portal',    // بوابة بالعلامة التجارية
        'sla_support',           // دعم مستوى الخدمة SLA
        'multi_currency',        // متعدد العملات
        'halal_certification_check' // التحقق من الشهادات الحلال
    ],
    pricing: 'subscription_or_per_transaction',
    minOrderValue: null,
    maxOrderValue: null
});

// ─── B2C — خدمة الأفراد والمستهلكين ─────────────────────────────────────────
const B2C_TIER = Object.freeze({
    id:          'b2c',
    nameAr:      'خدمة الأفراد والمستهلكين',
    nameEn:      'Business-to-Consumer',
    enabled:     process.env.SHEIKHA_B2C_ENABLED !== 'false',
    tier:        process.env.SHEIKHA_B2C_TIER || 'premium',
    audience:    ['individuals', 'small_traders', 'craftsmen', 'recyclers', 'startups'],
    capabilities: [
        'marketplace_access',    // الوصول للسوق
        'price_discovery',       // اكتشاف الأسعار
        'buy_sell_listings',     // قوائم البيع والشراء
        'chat_ai_assistant',     // مساعد الذكاء الاصطناعي
        'sharia_guidance',       // توجيه شرعي
        'zakat_calculator',      // حاسبة الزكاة
        'mobile_pwa',            // تطبيق موبايل PWA
        'arabic_first',          // عربي أولاً
        'free_registration',     // تسجيل مجاني
        'rfq_submission',        // إرسال طلبات أسعار
        'rating_reviews',        // التقييمات والمراجعات
        'community_forum',       // منتدى المجتمع
        'learning_center',       // مركز التعلم
        'halal_trade_only'       // تجارة حلال فقط
    ],
    pricing: 'freemium',
    minOrderValue: null,
    maxOrderValue: null
});

// ─── D2C — بيع مباشر من المصنع/المنتج للمستهلك ─────────────────────────────
const D2C_TIER = Object.freeze({
    id:          'd2c',
    nameAr:      'بيع مباشر من المنتج للمستهلك',
    nameEn:      'Direct-to-Consumer',
    enabled:     process.env.SHEIKHA_D2C_ENABLED !== 'false',
    tier:        process.env.SHEIKHA_D2C_TIER || 'direct',
    audience:    ['manufacturers', 'producers', 'artisans', 'farms', 'workshops', 'factories_selling_direct'],
    capabilities: [
        'direct_storefront',     // واجهة بيع مباشرة للمنتج
        'brand_identity',        // هوية علامة تجارية مستقلة
        'product_catalog',       // كتالوج منتجات كامل
        'direct_shipping',       // شحن مباشر للمستهلك
        'factory_price',         // سعر المصنع بدون وسطاء
        'custom_orders',         // طلبات مخصصة مباشرة
        'sample_requests',       // طلب عينات
        'origin_certification',  // شهادة المنشأ
        'halal_certified_badge', // شارة منتج حلال معتمد
        'digital_showroom',      // معرض رقمي للمنتج
        'loyalty_program',       // برنامج ولاء المستهلك
        'subscription_boxes',    // اشتراكات دورية
        'bulk_direct_discount',  // خصم الكميات المباشرة
        'traceability_qr'        // تتبع المنتج عبر QR
    ],
    pricing: 'commission_or_subscription',
    minOrderValue: null,
    maxOrderValue: null
});

// ─── B2G — خدمة الجهات الحكومية ──────────────────────────────────────────────
const B2G_TIER = Object.freeze({
    id:          'b2g',
    nameAr:      'خدمة الجهات الحكومية والرسمية',
    nameEn:      'Business-to-Government',
    enabled:     process.env.SHEIKHA_B2G_ENABLED !== 'false',
    tier:        process.env.SHEIKHA_B2G_TIER || 'sovereign',
    audience:    ['ministries', 'municipalities', 'state_enterprises', 'development_authorities', 'sovereign_funds'],
    capabilities: [
        'etimad_integration',    // منصة اعتماد (مناقصات)
        'wathq_integration',     // منصة واثق (تحقق السجلات)
        'national_address',      // العنوان الوطني
        'nafath_sso',            // دخول بنفاذ
        'government_rfp',        // مناقصات حكومية
        'compliance_reporting',  // تقارير الامتثال
        'data_sovereignty',      // سيادة البيانات
        'audit_trail',           // سجل مراجعة كامل
        'vision_2030_alignment', // توافق رؤية 2030
        'circular_economy',      // الاقتصاد الدائري
        'smart_city_data',       // بيانات المدن الذكية
        'secure_api_gateway',    // بوابة API آمنة
        'mou_framework',         // إطار مذكرات التفاهم
        'strategic_reporting'    // تقارير استراتيجية
    ],
    pricing: 'government_contract',
    minOrderValue: null,
    maxOrderValue: null
});

// ─── القيمة المقدمة لكل الشرائح ──────────────────────────────────────────────
const VALUE_PROPOSITION = Object.freeze({
    principle:     'best_in_universe_halal_first',
    principleAr:   'الأفضل في الكون — حلال أولاً — قيمة حقيقية لكل البشر',
    quality:       'highest_possible_by_evidence',
    value:         'maximum_utility_minimum_waste',
    ethics:        'no_riba_no_fraud_no_monopoly',
    target:        'all_humanity_ummah_first',
    blessing:      'مَن أَحْسَنَ عَمَلاً — الكهف 7',
    loved_by:      'كل البشر وأمة محمد ﷺ بإذن الله',
    divineSupport: 'اللهم يسّر وبارك وأعنّا على إتقان ما ينفع ويُرضيك يا رب'
});

// ─── الأنظمة والذكاءات المُزوَّدة ────────────────────────────────────────────
const AI_SYSTEMS_PROVIDED = Object.freeze({
    sheikhaCore:      { name: 'Sheikha-Core',       purpose: 'local-governed-ai',           tier: 'b2b+b2c+b2g' },
    tradeIntelligence:{ name: 'Trade Intelligence', purpose: 'metals-scrap-pricing',         tier: 'b2b+b2g' },
    shariaEngine:     { name: 'Sharia Engine',      purpose: 'halal-compliance-analysis',    tier: 'b2b+b2c+b2g' },
    marketStructure:  { name: 'Market Structure',   purpose: 'supply-demand-analytics',      tier: 'b2b+b2g' },
    logisticsEngine:  { name: 'Logistics Engine',   purpose: 'supply-chain-optimization',    tier: 'b2b+b2g' },
    hsCodeEngine:     { name: 'HS Code Engine',     purpose: 'customs-classification',        tier: 'b2b+b2g' },
    arabicNLP:        { name: 'Arabic NLP',         purpose: 'arabic-first-communication',    tier: 'b2b+b2c+b2g' },
    historicalEngine: { name: 'Historical Engine',  purpose: 'market-history-analysis',      tier: 'b2b+b2g' },
    bankingEngine:    { name: 'Banking Engine',     purpose: 'halal-finance-analysis',        tier: 'b2b+b2g' },
    experienceEngine: { name: 'Experience Engine',  purpose: 'personalization',               tier: 'b2c' }
});

// ─── الدالة الرئيسية — حالة السجل ────────────────────────────────────────────
function getServiceRegistryStatus() {
    const activeTiers = [B2B_TIER, B2C_TIER, B2G_TIER, D2C_TIER].filter((t) => t.enabled);

    return {
        success: true,
        identity: SHEIKHA_IDENTITY,
        serviceTiers: {
            b2b: B2B_TIER,
            b2c: B2C_TIER,
            b2g: B2G_TIER,
            d2c: D2C_TIER
        },
        activeTiers: activeTiers.map((t) => t.id),
        aiSystems: AI_SYSTEMS_PROVIDED,
        valueProposition: VALUE_PROPOSITION,
        scope:   process.env.SHEIKHA_MARKET_SCOPE || 'global',
        mode:    (process.env.SHEIKHA_SERVICE_MODE || 'b2b,b2c,b2g,d2c').split(',').map((s) => s.trim()),
        timestamp: new Date().toISOString()
    };
}

// ─── helper: هل المستخدم ضمن شريحة معينة؟ ────────────────────────────────────
function canServe(tierName) {
    const tier = { b2b: B2B_TIER, b2c: B2C_TIER, b2g: B2G_TIER, d2c: D2C_TIER }[tierName?.toLowerCase()];
    return Boolean(tier?.enabled);
}

module.exports = {
    SHEIKHA_IDENTITY,
    B2B_TIER,
    B2C_TIER,
    B2G_TIER,
    D2C_TIER,
    VALUE_PROPOSITION,
    AI_SYSTEMS_PROVIDED,
    getServiceRegistryStatus,
    canServe
};
