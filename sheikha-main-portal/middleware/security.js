/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🛡️ وسيط الأمان
 *  Security Middleware
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const config = require('../config/config');

// تخزين الطلبات للحد من المعدل
const requestCounts = new Map();

/**
 * الحد من معدل الطلبات
 */
function rateLimit(options = {}) {
    const windowMs = options.windowMs || config.security.rateLimit.windowMs;
    const max = options.max || config.security.rateLimit.max;

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        // تنظيف الطلبات القديمة
        const windowStart = now - windowMs;
        
        if (!requestCounts.has(key)) {
            requestCounts.set(key, []);
        }

        const requests = requestCounts.get(key).filter(time => time > windowStart);
        requests.push(now);
        requestCounts.set(key, requests);

        if (requests.length > max) {
            return res.status(429).json({
                success: false,
                message: 'تم تجاوز الحد المسموح من الطلبات. حاول لاحقاً.',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }

        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - requests.length);
        res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

        next();
    };
}

/**
 * رؤوس الأمان
 */
function securityHeaders(req, res, next) {
    // منع clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // منع sniffing لنوع المحتوى
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // حماية XSS
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // سياسة الإحالة
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // سياسة أمان المحتوى
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;");
    
    // HSTS (فقط في الإنتاج)
    if (config.isProduction()) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
}

/**
 * تنظيف المدخلات
 */
function sanitizeInput(req, res, next) {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            // إزالة الأكواد الضارة
            return obj
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = sanitize(value);
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);

    next();
}

/**
 * التحقق من CORS
 */
function corsHandler(req, res, next) {
    const origin = req.headers.origin;
    const allowedOrigin = config.security.cors.origin;

    if (allowedOrigin === '*' || !origin || origin === allowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    next();
}

/**
 * حماية من SQL Injection (للاستعلامات النصية)
 */
function preventInjection(req, res, next) {
    const sqlPatterns = [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,
        /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/gi,
        /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,
        /((\%27)|(\'))union/gi
    ];

    const checkValue = (value) => {
        if (typeof value === 'string') {
            for (const pattern of sqlPatterns) {
                if (pattern.test(value)) {
                    return true;
                }
            }
        }
        return false;
    };

    const checkObject = (obj) => {
        if (!obj) return false;
        for (const value of Object.values(obj)) {
            if (typeof value === 'object') {
                if (checkObject(value)) return true;
            } else if (checkValue(value)) {
                return true;
            }
        }
        return false;
    };

    if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
        return res.status(400).json({
            success: false,
            message: 'تم اكتشاف محتوى مشبوه',
            code: 'SECURITY_INJECTION_DETECTED'
        });
    }

    next();
}

/**
 * التسجيل الأمني
 */
function securityLogger(req, res, next) {
    const logData = {
        timestamp: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress,
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent'],
        userId: req.user?.id || 'anonymous'
    };

    // تسجيل المحاولات المشبوهة
    if (req.path.includes('..') || req.path.includes('%')) {
        console.warn('⚠️ محاولة وصول مشبوهة:', logData);
    }

    next();
}

module.exports = {
    rateLimit,
    securityHeaders,
    sanitizeInput,
    corsHandler,
    preventInjection,
    securityLogger
};
