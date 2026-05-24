/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA NETWORK MAP — خريطة شبكة الاتصالات                                 ║
 * ║                                                                              ║
 * ║  المنافذ المحلية → الإقليمية → الدولية → العالمية                           ║
 * ║  حركة المعلومات الصادرة والواردة لكل مستوى                                  ║
 * ║  توثيق الاتصالات بالكتاب والسنة                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا" — الحجرات:١٣
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// خريطة مستويات الشبكة
// ═══════════════════════════════════════════════════════════════
const NETWORK_LEVELS = {

    // ─── المستوى ١: الشبكة المحلية ───────────────────────────
    LOCAL: {
        level:    1,
        nameAr:   'الشبكة المحلية',
        nameEn:   'Local Network',
        icon:     '🏠',
        scope:    'المنزل / المكتب / الشبكة الداخلية',
        cidrs:    ['127.0.0.0/8', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '::1'],
        ports: {
            listen:  [8080, 8081],
            outgoing: [3306, 5432, 6379, 27017],   // DB + Redis
        },
        traffic: {
            inbound_sources:  ['127.0.0.1', 'localhost', 'LAN devices'],
            outbound_targets: ['database servers', 'cache servers'],
            encryption:       'optional (trusted network)',
        },
        trust_level: 'HIGH',
        auth_required: false,
        quranic_ref: { ref: 'النور:٢٧', text: 'حَتَّىٰ تَسْتَأْنِسُوا وَتُسَلِّمُوا' },
    },

    // ─── المستوى ٢: الشبكة الوطنية / الإقليمية ───────────────
    NATIONAL: {
        level:    2,
        nameAr:   'الشبكة الوطنية',
        nameEn:   'National Network',
        icon:     '🇸🇦',
        scope:    'المملكة العربية السعودية + دول الخليج',
        cidrs:    [],   // تُعبأ من GeoIP
        ports: {
            listen:  [443, 80],         // عبر Nginx في الإنتاج
            outgoing: [443, 8080, 8081],
        },
        traffic: {
            inbound_sources:  ['Saudi Arabia', 'UAE', 'Kuwait', 'Bahrain', 'Qatar', 'Oman'],
            outbound_targets: ['CDN', 'payment gateways', 'government APIs', 'SADAD', 'MADA'],
            encryption:       'required — TLS 1.2+',
        },
        trust_level: 'MEDIUM',
        auth_required: true,
        regulatory: {
            body: 'CITC — هيئة الاتصالات وتقنية المعلومات',
            compliance: ['NCA', 'PDPL', 'SAMA'],
        },
        quranic_ref: { ref: 'النساء:٢٩', text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ' },
    },

    // ─── المستوى ٣: الشبكة الدولية ───────────────────────────
    INTERNATIONAL: {
        level:    3,
        nameAr:   'الشبكة الدولية',
        nameEn:   'International Network',
        icon:     '🌍',
        scope:    'الدول العربية + منظمة التعاون الإسلامي',
        cidrs:    [],
        ports: {
            listen:  [443],
            outgoing: [443, 25, 587],   // HTTPS + SMTP
        },
        traffic: {
            inbound_sources:  ['OIC member states', 'Arab League countries', 'ASEAN'],
            outbound_targets: ['international payment', 'SWIFT Islamic', 'WTO APIs', 'UN data'],
            encryption:       'required — TLS 1.3',
        },
        trust_level: 'MEDIUM-LOW',
        auth_required: true,
        geo_filter: true,
        regulatory: {
            body: 'OECD + FATF',
            compliance: ['GDPR', 'ISO 27001', 'AAOIFI'],
        },
        quranic_ref: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
    },

    // ─── المستوى ٤: الشبكة العالمية ──────────────────────────
    GLOBAL: {
        level:    4,
        nameAr:   'الشبكة العالمية',
        nameEn:   'Global Network',
        icon:     '🌐',
        scope:    'العالم بأسره',
        cidrs:    ['0.0.0.0/0'],
        ports: {
            listen:  [443],
            outgoing: [443],
        },
        traffic: {
            inbound_sources:  ['All countries'],
            outbound_targets: ['Global CDN', 'AI APIs', 'Blockchain nodes', 'IPFS'],
            encryption:       'required — TLS 1.3 + Certificate Pinning',
        },
        trust_level: 'LOW',
        auth_required: true,
        geo_filter: true,
        rate_limit: { requests: 100, windowMs: 900000 },
        sharia_filter: true,   // الفلتر الشرعي الصارم على المحتوى الوارد
        regulatory: {
            body: 'ITU + ICANN + UN',
            compliance: ['ISO 27001', 'SOC2', 'NIST CSF'],
        },
        quranic_ref: { ref: 'الحجرات:١٣', text: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا' },
    },
};

// ═══════════════════════════════════════════════════════════════
// مصفوفة الاتصالات الموثّقة — من/إلى/ماذا/كيف
// ═══════════════════════════════════════════════════════════════
const COMMUNICATION_MATRIX = [

    // ─── اتصالات واردة مسموح بها ─────────────────────────────
    {
        id:         'BROWSER_TO_SERVER',
        nameAr:     'المتصفح → الخادم',
        dir:        'INBOUND',
        from:       'User Browser (any)',
        to:         'Sheikha Server :8080',
        protocol:   'HTTPS',
        port:       443,
        auth:       'JWT optional',
        allowed:    true,
        encrypted:  true,
        use_case:   'تصفح الموقع والأسواق',
    },
    {
        id:         'GATEWAY_TO_MAIN',
        nameAr:     'بوابة السوق → الخادم الرئيسي',
        dir:        'INBOUND',
        from:       'Marketplace Gateway :8081',
        to:         'Main Server :8080',
        protocol:   'HTTP (internal)',
        port:       8080,
        auth:       'X-Sheikha-Gateway header',
        allowed:    true,
        encrypted:  false,       // داخلي — موثوق
        local_only: true,
        use_case:   'وكيل الطلبات من بوابة السوق',
    },
    {
        id:         'MOBILE_TO_SERVER',
        nameAr:     'التطبيق المحمول → API',
        dir:        'INBOUND',
        from:       'Mobile App',
        to:         'Sheikha API :443/api',
        protocol:   'HTTPS',
        port:       443,
        auth:       'JWT required',
        allowed:    true,
        encrypted:  true,
        use_case:   'الوصول عبر التطبيق',
    },
    {
        id:         'ORGS_TO_API',
        nameAr:     'المنظمات والشركاء → API',
        dir:        'INBOUND',
        from:       'Partner Organizations (API Key)',
        to:         'Sheikha B2B API :443',
        protocol:   'HTTPS',
        port:       443,
        auth:       'API Key + JWT',
        allowed:    true,
        encrypted:  true,
        use_case:   'تكامل المنظمات الدولية',
    },

    // ─── اتصالات صادرة مسموح بها ─────────────────────────────
    {
        id:         'SERVER_TO_DB',
        nameAr:     'الخادم → قاعدة البيانات',
        dir:        'OUTBOUND',
        from:       'Sheikha Server',
        to:         'Database (local)',
        protocol:   'TCP',
        port:       5432,
        auth:       'DB credentials',
        allowed:    true,
        encrypted:  false,       // شبكة داخلية
        local_only: true,
        use_case:   'قراءة/كتابة البيانات',
    },
    {
        id:         'SERVER_TO_AI',
        nameAr:     'الخادم → خدمات الذكاء الاصطناعي',
        dir:        'OUTBOUND',
        from:       'Sheikha Server',
        to:         'OpenAI / Anthropic API',
        protocol:   'HTTPS',
        port:       443,
        auth:       'API Key',
        allowed:    true,
        encrypted:  true,
        use_case:   'محركات الذكاء الاصطناعي',
    },
    {
        id:         'SERVER_TO_PAYMENT',
        nameAr:     'الخادم → بوابات الدفع',
        dir:        'OUTBOUND',
        from:       'Sheikha Server',
        to:         'MADA / SADAD / Stripe / Moyasar',
        protocol:   'HTTPS',
        port:       443,
        auth:       'API Key + HMAC',
        allowed:    true,
        encrypted:  true,
        use_case:   'معالجة المدفوعات',
    },
    {
        id:         'SERVER_TO_CDN',
        nameAr:     'الخادم → CDN',
        dir:        'OUTBOUND',
        from:       'Sheikha Server',
        to:         'Cloudflare / CloudFront',
        protocol:   'HTTPS',
        port:       443,
        auth:       'Origin Auth',
        allowed:    true,
        encrypted:  true,
        use_case:   'توزيع المحتوى العالمي',
    },

    // ─── اتصالات محظورة ──────────────────────────────────────
    {
        id:         'BLOCK_DIRECT_DB',
        nameAr:     'الإنترنت مباشرة → قاعدة البيانات',
        dir:        'INBOUND',
        from:       'External Internet',
        to:         'Database Port :5432',
        protocol:   'TCP',
        port:       5432,
        allowed:    false,
        reason:     'قاعدة البيانات لا تُكشف للخارج أبداً',
    },
    {
        id:         'BLOCK_DIRECT_INTERNAL',
        nameAr:     'الإنترنت مباشرة → المنفذ الداخلي',
        dir:        'INBOUND',
        from:       'External Internet',
        to:         'Internal :8080 directly',
        protocol:   'HTTP',
        port:       8080,
        allowed:    false,
        reason:     'يمر عبر Nginx فقط في الإنتاج',
    },
];

// ═══════════════════════════════════════════════════════════════
// توليد خريطة الشبكة الكاملة
// ═══════════════════════════════════════════════════════════════
function getNetworkMap() {
    return {
        schema:   'sheikha/v2',
        tawheed:  'لا إله إلا الله',
        no_harm:  'لا ضرر ولا ضرار',
        levels:   Object.values(NETWORK_LEVELS),
        matrix:   COMMUNICATION_MATRIX,
        summary: {
            total_connections:  COMMUNICATION_MATRIX.length,
            allowed:            COMMUNICATION_MATRIX.filter((c) => c.allowed).length,
            blocked:            COMMUNICATION_MATRIX.filter((c) => !c.allowed).length,
            inbound:            COMMUNICATION_MATRIX.filter((c) => c.dir === 'INBOUND').length,
            outbound:           COMMUNICATION_MATRIX.filter((c) => c.dir === 'OUTBOUND').length,
            encrypted:          COMMUNICATION_MATRIX.filter((c) => c.encrypted).length,
        },
        verse: { ref: 'الحجرات:١٣', text: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا' },
    };
}

function getLevelInfo(levelKey) {
    return NETWORK_LEVELS[levelKey.toUpperCase()] || null;
}

function getAllowedConnections() {
    return COMMUNICATION_MATRIX.filter((c) => c.allowed);
}

function getBlockedConnections() {
    return COMMUNICATION_MATRIX.filter((c) => !c.allowed);
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    NETWORK_LEVELS,
    COMMUNICATION_MATRIX,
    getNetworkMap,
    getLevelInfo,
    getAllowedConnections,
    getBlockedConnections,
};
