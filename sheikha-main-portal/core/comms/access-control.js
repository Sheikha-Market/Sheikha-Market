/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA ACCESS CONTROL — سياسة من يُسمع له                                 ║
 * ║                                                                              ║
 * ║  الجواب الكامل لـ "لمن تسمع؟"                                               ║
 * ║  • قائمة السماح (Allowlist) — بالهوية والمنطقة والدور                       ║
 * ║  • قائمة الحجب (Blocklist)  — بالعنوان أو النمط أو الجغرافيا                ║
 * ║  • مستويات الوصول: عام | موثّق | مميّز | مسؤول | نظام                       ║
 * ║  • الضابط الشرعي: "لا يضر إلا نفسه" — كل وصول غير مأذون مردود             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَدْخُلُوا بُيُوتًا غَيْرَ بُيُوتِكُمْ
 *  حَتَّىٰ تَسْتَأْنِسُوا وَتُسَلِّمُوا عَلَىٰ أَهْلِهَا" — النور:٢٧
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// ① مستويات الوصول
// ═══════════════════════════════════════════════════════════════
const ACCESS_LEVELS = {
    PUBLIC:        { level: 0, nameAr: 'عام',           nameEn: 'Public',         auth: false },
    AUTHENTICATED: { level: 1, nameAr: 'موثّق',          nameEn: 'Authenticated',  auth: true  },
    PRIVILEGED:    { level: 2, nameAr: 'مميّز',          nameEn: 'Privileged',     auth: true  },
    ADMIN:         { level: 3, nameAr: 'مسؤول',          nameEn: 'Admin',          auth: true  },
    SYSTEM:        { level: 4, nameAr: 'نظام داخلي',    nameEn: 'System',         auth: true  },
};

// ═══════════════════════════════════════════════════════════════
// ② قواعد المسارات الافتراضية
// ═══════════════════════════════════════════════════════════════
const DEFAULT_PATH_RULES = [

    // ─── عام — لا مصادقة ──────────────────────────────────────
    { pattern: /^\/$|^\/health|^\/api\/health|^\/api\/ports|^\/marketplace$|^\/marketplace\/sectors/,
      level: 'PUBLIC',   methods: ['GET'],                          desc: 'صفحات عامة + فحص الصحة' },

    { pattern: /^\/marketplace\/(metals|scrap|tech|science|consulting|logistics|waqf|organizations)/,
      level: 'PUBLIC',   methods: ['GET'],                          desc: 'تصفح الأسواق — عام' },

    { pattern: /^\/api\/market\/|^\/api\/prices|^\/api\/metals/,
      level: 'PUBLIC',   methods: ['GET'],                          desc: 'أسعار وأسواق — عام' },

    { pattern: /^\/api\/auth\/login|^\/api\/auth\/register|^\/api\/auth\/refresh/,
      level: 'PUBLIC',   methods: ['POST'],                         desc: 'تسجيل الدخول والتسجيل' },

    { pattern: /^\/api\/sharia|^\/api\/zakat|^\/marketplace\/waqf/,
      level: 'PUBLIC',   methods: ['GET', 'POST'],                  desc: 'خدمات دينية — مجانية للجميع' },

    // ─── موثّق — يحتاج JWT ────────────────────────────────────
    { pattern: /^\/api\/user\//,
      level: 'AUTHENTICATED', methods: ['GET','POST','PUT','PATCH'],desc: 'بيانات المستخدم' },

    { pattern: /^\/marketplace\/checkout|^\/api\/order|^\/api\/cart/,
      level: 'AUTHENTICATED', methods: ['GET','POST','PUT','DELETE'],desc: 'سلة الشراء والطلبات' },

    { pattern: /^\/marketplace\/seller|^\/api\/seller/,
      level: 'AUTHENTICATED', methods: ['GET','POST','PUT','PATCH','DELETE'], desc: 'لوحة البائع' },

    // ─── مميّز ─────────────────────────────────────────────────
    { pattern: /^\/api\/consulting\/session|^\/api\/vision/,
      level: 'PRIVILEGED', methods: ['GET','POST'],                 desc: 'جلسات استشارية' },

    { pattern: /^\/marketplace\/finance|^\/api\/payment/,
      level: 'PRIVILEGED', methods: ['GET','POST'],                 desc: 'معاملات مالية' },

    // ─── مسؤول ────────────────────────────────────────────────
    { pattern: /^\/api\/admin|^\/admin|^\/dashboard/,
      level: 'ADMIN',    methods: ['GET','POST','PUT','DELETE','PATCH'], desc: 'لوحة الإدارة' },

    { pattern: /^\/api\/ports\/|^\/api\/marketplace\/|^\/api\/comms\//,
      level: 'ADMIN',    methods: ['GET'],                           desc: 'لوحة الشبكة والاتصالات' },

    // ─── نظام داخلي (محلي فقط) ───────────────────────────────
    { pattern: /^\/internal\//,
      level: 'SYSTEM',   methods: ['GET','POST'],  localOnly: true,  desc: 'API داخلية النظام' },
];

// ═══════════════════════════════════════════════════════════════
// ③ قواعد الحجب الثابتة
// ═══════════════════════════════════════════════════════════════
const PERMANENT_BLOCKLIST = {
    // أنماط مسارات مشبوهة (محاولات اختراق شائعة)
    malicious_patterns: [
        /\.\.\//,                       // Path traversal
        /<script/i,                     // XSS
        /union.*select/i,              // SQL injection
        /exec\s*\(/i,                  // Code injection
        /etc\/passwd/i,                // Unix secrets
        /wp-admin|wp-login/i,          // WordPress scanning
        /\.php$/i,                     // PHP probing على خادم Node
        /\.asp(x)?$/i,                 // ASP probing
        /xmlrpc\.php/i,                // WordPress XML-RPC
        /\/\.\w+/,                     // Hidden file access
    ],
    // منهجيات محظورة دائماً
    blocked_methods: ['TRACE', 'TRACK', 'CONNECT'],
    // رؤوس محظورة
    blocked_headers: ['x-forwarded-host'],  // Host header injection
};

// ═══════════════════════════════════════════════════════════════
// ④ مُقيّم الوصول — AccessController
// ═══════════════════════════════════════════════════════════════
class AccessController {

    constructor(pathRules = DEFAULT_PATH_RULES) {
        this._rules    = pathRules;
        this._blockedIPs = new Set();   // قائمة IP محجوبة ديناميكياً
    }

    /**
     * تقييم طلب وإرجاع قرار الوصول
     * @param {object} ctx  — { ip, method, path, headers, user }
     * @returns {{ allowed: boolean, level: string, reason: string }}
     */
    evaluate(ctx) {
        const { ip = '', method = 'GET', path = '/', headers = {}, user = null } = ctx;

        // ─── فحص الحجب الديناميكي ──────────────────────────────
        if (this._blockedIPs.has(ip)) {
            return { allowed: false, level: 'BLOCKED', reason: 'IP محجوب مؤقتاً' };
        }

        // ─── فحص المنهجيات المحظورة ────────────────────────────
        if (PERMANENT_BLOCKLIST.blocked_methods.includes(method.toUpperCase())) {
            return { allowed: false, level: 'BLOCKED', reason: `المنهجية ${method} محظورة` };
        }

        // ─── فحص أنماط المسارات الخبيثة ──────────────────────
        for (const pat of PERMANENT_BLOCKLIST.malicious_patterns) {
            if (pat.test(path)) {
                return { allowed: false, level: 'BLOCKED', reason: 'نمط مسار مشبوه' };
            }
        }

        // ─── فحص الرؤوس المحظورة ──────────────────────────────
        for (const h of PERMANENT_BLOCKLIST.blocked_headers) {
            if (headers[h]) {
                return { allowed: false, level: 'BLOCKED', reason: `رأس محظور: ${h}` };
            }
        }

        // ─── تطابق قواعد المسارات ─────────────────────────────
        const rule = this._matchRule(path, method);
        if (!rule) {
            // لا قاعدة صريحة → مسموح عام
            return { allowed: true, level: 'PUBLIC', reason: 'لا قاعدة — سماح عام' };
        }

        // ─── فحص المحلي فقط ────────────────────────────────────
        if (rule.localOnly && !this._isLocal(ip)) {
            return { allowed: false, level: 'BLOCKED', reason: 'مسار للاستخدام الداخلي فقط' };
        }

        // ─── فحص مستوى المصادقة ────────────────────────────────
        const required = ACCESS_LEVELS[rule.level];
        if (required.auth && !user) {
            return { allowed: false, level: rule.level, reason: `يجب تسجيل الدخول — المستوى المطلوب: ${required.nameAr}`, needsAuth: true };
        }

        if (user && required.level > ACCESS_LEVELS.AUTHENTICATED.level) {
            const userLevel = ACCESS_LEVELS[user.role] || ACCESS_LEVELS.AUTHENTICATED;
            if (userLevel.level < required.level) {
                return { allowed: false, level: rule.level, reason: `صلاحيات غير كافية — مطلوب: ${required.nameAr}` };
            }
        }

        return {
            allowed:   true,
            level:     rule.level,
            reason:    rule.desc,
            rule_desc: rule.desc,
        };
    }

    /**
     * middleware Express
     */
    middleware() {
        return (req, res, next) => {
            const ip      = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
            const user    = req.user || null;
            const result  = this.evaluate({ ip, method: req.method, path: req.path, headers: req.headers, user });

            if (!result.allowed) {
                const status = result.needsAuth ? 401 : 403;
                return res.status(status).json({
                    success: false,
                    message: result.reason,
                    no_harm: 'لا ضرر ولا ضرار',
                    verse:   { ref: 'النور:٢٧', text: 'حَتَّىٰ تَسْتَأْنِسُوا وَتُسَلِّمُوا عَلَىٰ أَهْلِهَا' },
                });
            }

            req._accessLevel = result.level;
            next();
        };
    }

    // ─── إدارة ديناميكية ─────────────────────────────────────────────────────

    blockIP(ip, durationMs = 3600000) {
        this._blockedIPs.add(ip);
        setTimeout(() => this._blockedIPs.delete(ip), durationMs);
    }

    unblockIP(ip) {
        this._blockedIPs.delete(ip);
    }

    getBlockedIPs() {
        return Array.from(this._blockedIPs);
    }

    // ─── مساعدات ──────────────────────────────────────────────────────────────

    _matchRule(path, method) {
        for (const rule of this._rules) {
            if (rule.pattern.test(path)) {
                if (!rule.methods || rule.methods.includes(method.toUpperCase())) {
                    return rule;
                }
            }
        }
        return null;
    }

    _isLocal(ip) {
        return ip === '127.0.0.1' || ip === '::1' ||
               ip.startsWith('10.') || ip.startsWith('192.168.') ||
               ip.match(/^172\.(1[6-9]|2\d|3[01])\./);
    }
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    AccessController,
    ACCESS_LEVELS,
    DEFAULT_PATH_RULES,
    PERMANENT_BLOCKLIST,
};
