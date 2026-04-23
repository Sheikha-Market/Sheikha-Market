// ═══════════════════════════════════════════════════════════════════════════════
// 📦 CDN Cache Middleware — ترويسات الكاش للأصول الثابتة + Edge Caching
// ═══════════════════════════════════════════════════════════════════════════════
// يُضيف ترويسات Cache-Control الصحيحة حسب نوع الملف:
//   • الأصول الثابتة (CSS, JS, صور, أيقونات): كاش طويل + immutable
//   • صفحات HTML: no-cache (يُعيد التحقق دائماً)
//   • APIs: no-store (لا تخزين نهائي)
//   • Service Worker: no-cache دائماً
// ═══════════════════════════════════════════════════════════════════════════════

'use strict';

const path = require('path');

// أنواع الملفات وسياسات كاشها
const CACHE_POLICIES = {
    // أصول ثابتة لا تتغير — كاش طويل جداً
    immutable: {
        extensions:   ['.woff', '.woff2', '.ttf', '.otf', '.eot'],
        cacheControl: 'public, max-age=31536000, immutable',  // سنة
        cdnHeader:    'public, max-age=31536000',
    },
    // صور وأيقونات — كاش متوسط
    images: {
        extensions:   ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.ico', '.gif'],
        cacheControl: 'public, max-age=604800, stale-while-revalidate=86400',  // أسبوع
        cdnHeader:    'public, max-age=604800',
    },
    // ملفات JS/CSS — كاش متوسط + stale-while-revalidate
    assets: {
        extensions:   ['.js', '.css', '.mjs'],
        cacheControl: 'public, max-age=86400, stale-while-revalidate=3600',   // يوم
        cdnHeader:    'public, max-age=86400',
    },
    // JSON/بيانات ثابتة
    data: {
        extensions:   ['.json', '.xml', '.txt'],
        cacheControl: 'public, max-age=300, stale-while-revalidate=60',        // 5 دقائق
        cdnHeader:    'public, max-age=300',
    },
    // صفحات HTML
    html: {
        extensions:   ['.html', '.htm'],
        cacheControl: 'no-cache',
        cdnHeader:    'no-cache',
    },
};

// بناء خريطة سريعة: امتداد → سياسة
const EXT_MAP = new Map();
for (const [policyName, policy] of Object.entries(CACHE_POLICIES)) {
    for (const ext of policy.extensions) {
        EXT_MAP.set(ext, { ...policy, name: policyName });
    }
}

// مسارات خاصة دائماً بدون كاش
const NO_CACHE_PATTERNS = [
    /^\/sw\.js$/,
    /^\/api\//,
    /^\/auth\//,
    /^\/health/,
];

/**
 * cdnCacheMiddleware
 * يُضيف ترويسات Cache-Control + Surrogate-Control (CDN) المناسبة
 */
function cdnCacheMiddleware(req, res, next) {
    const urlPath = req.path || '/';

    // الـ APIs والمسارات الحساسة: لا كاش
    if (NO_CACHE_PATTERNS.some(pat => pat.test(urlPath))) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.set('Pragma', 'no-cache');
        return next();
    }

    // sw.js دائماً بلا كاش (حتى يحصل المتصفح على آخر نسخة)
    if (urlPath === '/sw.js') {
        res.set('Cache-Control', 'no-cache, no-store');
        res.set('Service-Worker-Allowed', '/');
        return next();
    }

    const ext    = path.extname(urlPath).toLowerCase();
    const policy = EXT_MAP.get(ext);

    if (policy) {
        res.set('Cache-Control', policy.cacheControl);
        // Surrogate-Control للـ CDN (Cloudflare, Azure CDN, Fastly)
        if (policy.cdnHeader) {
            res.set('Surrogate-Control', policy.cdnHeader);
        }
        // Vary للأصول التي تختلف بحسب Encoding
        if (['.js', '.css', '.html', '.json'].includes(ext)) {
            res.set('Vary', 'Accept-Encoding');
        }
    }

    next();
}

/**
 * staticAssetsMiddleware
 * يُضاف على مسارات express.static لضمان التطبيق الصحيح
 */
function staticAssetsMiddleware(options = {}) {
    const immutableAge = options.immutableAge ?? 31536000;
    return function (req, res, next) {
        cdnCacheMiddleware(req, res, next);
    };
}

module.exports = { cdnCacheMiddleware, staticAssetsMiddleware };
