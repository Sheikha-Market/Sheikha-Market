/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA PORT REGISTRY — سجل المنافذ الرقمية الآمنة الموحّدة               ║
 * ║   كل منفذ له دور محدد وأمان كامل وتوجيه إسلامي                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ" — الأنفال:٦٠
 * "لا ضرر ولا ضرار" — ابن ماجه:٢٣٤٠
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// ① تعريف المنافذ
// ═══════════════════════════════════════════════════════════════
const PORTS = {

    // ─── المنفذ الرئيسي: الخادم والواجهة البرمجية ─────────────
    MAIN: {
        number:   8080,
        name:     'الخادم الرئيسي',
        nameEn:   'Sheikha Main Server',
        role:     'CORE',
        bind:     '127.0.0.1',          // داخلي فقط بدون عرض مباشر
        public:   false,
        description: 'الخادم الأساسي — API كاملة + لوحة الإدارة + محركات شيخة',
        capabilities: [
            'API الاستشارات والرؤى',
            'إدارة المستخدمين والهوية الرقمية',
            'محركات الذكاء الاصطناعي',
            'المدفوعات والزكاة',
            'لوحة الإدارة الشاملة',
            'WebSocket للبيانات المباشرة',
        ],
        security: {
            helmet:     true,
            cors:       'restricted',
            rateLimit:  { windowMs: 900000, max: 500 },
            authRequired: ['/api/admin', '/api/user', '/api/payments'],
            inputSanitize: true,
            https:      false,          // يُمكّن عبر Nginx في الإنتاج
        },
        allowed_origins: [
            'https://sheikha.top',
            'https://www.sheikha.top',
            'https://public.sheikha.top',
            'http://localhost:8080',
            'http://localhost:8081',
            'http://localhost:8082',
            'http://localhost:23000',
        ],
        health_endpoint: '/api/health',
        quranic_ref: { ref: 'النحل:٩٠', text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ' },
    },

    // ─── منفذ السوق الجامع: سوق الأسواق المتعددة ──────────────
    MARKETPLACE: {
        number:   8081,
        name:     'سوق الأسواق الجامع',
        nameEn:   'Sheikha Multi-Marketplace Gateway',
        role:     'MARKETPLACE',
        bind:     '0.0.0.0',            // مفتوح للشبكة (محمي بـ Nginx + جدار حماية)
        public:   true,
        description: 'البوابة الجامعة لكل الأسواق — محلية، دولية، قارية، كونية',
        capabilities: [
            'سوق المعادن والخامات',
            'سوق التقنية والبرمجيات',
            'سوق العلوم والبحث',
            'سوق الاستشارات',
            'سوق الخدمات اللوجستية',
            'سوق التمويل الإسلامي',
            'سوق الوقف والصدقات',
            'سوق منظمات الأعمال الدولية',
        ],
        security: {
            helmet:     true,
            cors:       'open_with_auth',
            rateLimit:  { windowMs: 900000, max: 1000 },
            authRequired: ['/marketplace/checkout', '/marketplace/seller', '/marketplace/admin'],
            inputSanitize: true,
            xss_protection: true,
            csrf_protection: true,
        },
        allowed_origins: ['*'],         // مفتوح بمصادقة JWT
        health_endpoint: '/marketplace/health',
        quranic_ref: { ref: 'النساء:٢٩', text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ' },
    },
};

// ═══════════════════════════════════════════════════════════════
// ② قواعد الأمان لكل منفذ
// ═══════════════════════════════════════════════════════════════
const SECURITY_RULES = {
    // قواعد مشتركة لكل المنافذ
    GLOBAL: {
        blocked_methods: ['TRACE', 'TRACK'],
        max_body_size:   '10mb',
        request_timeout: 30000,         // 30 ثانية
        no_harm:         'لا ضرر ولا ضرار',
        sharia_filter:   true,
        hadith_ref: { ref: 'ابن ماجه:٢٣٤٠', text: 'لا ضرر ولا ضرار' },
    },

    // قواعد المنفذ 8080
    PORT_8080: {
        bind:        '127.0.0.1',
        csp:         "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' wss: ws:",
        allowed_ips: ['127.0.0.1', '::1'],   // في الإنتاج يمر عبر Nginx
        hide_server_header: true,
    },

    // قواعد المنفذ 8081
    PORT_8081: {
        bind:            '0.0.0.0',
        csp:             "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' wss: ws: https:",
        ddos_protection: true,
        geo_filter:      false,          // يُفعَّل عبر Cloudflare
        jwt_required:    ['/marketplace/checkout', '/marketplace/seller'],
        marketplace_sharia_check: true,  // التحقق الشرعي من كل معاملة تجارية
    },
};

// ═══════════════════════════════════════════════════════════════
// ③ خريطة توجيه الأسواق على منفذ 8081
// ═══════════════════════════════════════════════════════════════
const MARKETPLACE_ROUTING_MAP = {
    // ─ الأسواق الأساسية ─────────────────────────────────────
    '/marketplace/metals':        { target: 'http://127.0.0.1:8080/api/market/metals',      nameAr: 'سوق المعادن والخامات',       maqsad: 'MAL' },
    '/marketplace/scrap':         { target: 'http://127.0.0.1:8080/api/market/scrap',       nameAr: 'سوق السكراب وإعادة التدوير', maqsad: 'ARD' },
    '/marketplace/tech':          { target: 'http://127.0.0.1:8080/api/market/tech',        nameAr: 'سوق التقنية والبرمجيات',     maqsad: 'AQL' },
    '/marketplace/science':       { target: 'http://127.0.0.1:8080/api/market/science',     nameAr: 'سوق العلوم والبحث',          maqsad: 'AQL' },
    '/marketplace/consulting':    { target: 'http://127.0.0.1:8080/api/consulting',         nameAr: 'سوق الاستشارات الدولية',     maqsad: 'ARD' },
    '/marketplace/logistics':     { target: 'http://127.0.0.1:8080/api/logistics',          nameAr: 'سوق اللوجستيات والنقل',      maqsad: 'MAL' },
    '/marketplace/finance':       { target: 'http://127.0.0.1:8080/api/finance',            nameAr: 'سوق التمويل الإسلامي',       maqsad: 'MAL' },
    '/marketplace/waqf':          { target: 'http://127.0.0.1:8080/api/zakat',              nameAr: 'سوق الوقف والزكاة والصدقات', maqsad: 'MAL' },
    '/marketplace/education':     { target: 'http://127.0.0.1:8080/api/education',          nameAr: 'سوق التعليم والتدريب',        maqsad: 'AQL' },
    '/marketplace/health':        { target: 'http://127.0.0.1:8080/api/health-market',      nameAr: 'سوق الصحة والطب',            maqsad: 'NAFS' },
    '/marketplace/energy':        { target: 'http://127.0.0.1:8080/api/energy',             nameAr: 'سوق الطاقة والبيئة',         maqsad: 'ARD' },
    '/marketplace/real-estate':   { target: 'http://127.0.0.1:8080/api/real-estate',        nameAr: 'سوق العقارات',               maqsad: 'MAL' },

    // ─ الأسواق المؤسسية ──────────────────────────────────────
    '/marketplace/organizations': { target: 'http://127.0.0.1:8080/api/orgs',               nameAr: 'سوق المنظمات الدولية',        maqsad: 'ARD' },
    '/marketplace/government':    { target: 'http://127.0.0.1:8080/api/gov-market',          nameAr: 'السوق الحكومي والمشتريات',   maqsad: 'ARD' },
    '/marketplace/standards':     { target: 'http://127.0.0.1:8080/api/standards',           nameAr: 'سوق المعايير والشهادات',      maqsad: 'DEEN' },

    // ─ API العامة ─────────────────────────────────────────────
    '/marketplace/api':           { target: 'http://127.0.0.1:8080/api',                     nameAr: 'واجهة API العامة للسوق',      maqsad: 'MAL' },
    '/marketplace/health':        { target: null,                                             nameAr: 'فحص صحة السوق',              internal: true },
};

// ═══════════════════════════════════════════════════════════════
// ④ تشكيل معلومات المنفذ الكاملة للطلب الأول
// ═══════════════════════════════════════════════════════════════
function getPortInfo(portNumber) {
    const portKey = Object.keys(PORTS).find((k) => PORTS[k].number === portNumber);
    if (!portKey) return null;
    return {
        ...PORTS[portKey],
        security_rules: SECURITY_RULES[`PORT_${portNumber}`] || {},
        global_rules:   SECURITY_RULES.GLOBAL,
    };
}

function getAllPorts() {
    return Object.values(PORTS).map((p) => ({
        number:      p.number,
        name:        p.name,
        nameEn:      p.nameEn,
        role:        p.role,
        public:      p.public,
        description: p.description,
        capabilities_count: p.capabilities.length,
        quranic_ref: p.quranic_ref,
    }));
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    PORTS,
    SECURITY_RULES,
    MARKETPLACE_ROUTING_MAP,
    getPortInfo,
    getAllPorts,
};
