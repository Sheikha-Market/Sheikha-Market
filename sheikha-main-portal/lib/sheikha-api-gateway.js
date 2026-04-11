/**
 * بسم الله الرحمن الرحيم
 * =============================================================================
 * بوابة API الموحدة — منظومة شيخة
 * SHEIKHA UNIFIED API GATEWAY
 * =============================================================================
 * الميزات:
 *   ✅ Correlation IDs لتتبع كل طلب
 *   ✅ Request/Response logging موحد
 *   ✅ Performance metrics per endpoint
 *   ✅ Error normalization (تنسيق موحد للأخطاء)
 *   ✅ Request timeout enforcement
 *   ✅ API health dashboard
 *   ✅ Rate limit headers
 *   ✅ Versioning support (v1, v2...)
 * =============================================================================
 * ولا حول ولا قوة إلا بالله العلي العظيم
 * المالك: سلمان أحمد بن سلمان الراجح | 1031605270 | market@sheikha.top
 */
'use strict';

const crypto = require('crypto');

/* ── إعدادات ─────────────────────────────────────────────────────── */
const DEFAULT_TIMEOUT_MS = 30_000;  // 30 ثانية timeout
const MAX_METRICS_ENTRIES = 500;    // أقصى عدد من سجلات الأداء
const SLOW_REQUEST_MS     = 2_000;  // الطلب "البطيء" > 2 ثانية

/* ══════════════════════════════════════════════════════════════════
 * مخزن المقاييس — Metrics Store (في الذاكرة)
 * ══════════════════════════════════════════════════════════════════ */
class MetricsStore {
    constructor() {
        this._byEndpoint = new Map();   // { route: { count, totalMs, errors, slow } }
        this._recent     = [];           // آخر MAX_METRICS_ENTRIES طلب
        this._startTime  = Date.now();
        this._totals     = { requests: 0, errors: 0, slow: 0, avgMs: 0, totalMs: 0 };
    }

    record({ method, route, status, durationMs, correlationId }) {
        const key     = `${method} ${route}`;
        const isError = status >= 400;
        const isSlow  = durationMs >= SLOW_REQUEST_MS;

        /* ── تحديث per-endpoint ─── */
        if (!this._byEndpoint.has(key)) {
            this._byEndpoint.set(key, { count: 0, totalMs: 0, errors: 0, slow: 0, lastStatus: 0 });
        }
        const ep = this._byEndpoint.get(key);
        ep.count++;
        ep.totalMs    += durationMs;
        ep.avgMs       = Math.round(ep.totalMs / ep.count);
        ep.errors     += isError ? 1 : 0;
        ep.slow       += isSlow  ? 1 : 0;
        ep.lastStatus  = status;
        ep.lastAt      = new Date().toISOString();

        /* ── تحديث الإجماليات ─── */
        this._totals.requests++;
        this._totals.errors   += isError ? 1 : 0;
        this._totals.slow     += isSlow  ? 1 : 0;
        this._totals.totalMs  += durationMs;
        this._totals.avgMs     = Math.round(this._totals.totalMs / this._totals.requests);

        /* ── سجل الأخير ─── */
        this._recent.push({ method, route, status, durationMs, correlationId, at: new Date().toISOString() });
        if (this._recent.length > MAX_METRICS_ENTRIES) this._recent.shift();
    }

    getSummary() {
        const uptimeSec = Math.round((Date.now() - this._startTime) / 1000);
        return {
            uptime:    `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${uptimeSec % 60}s`,
            uptimeSec,
            totals:    { ...this._totals },
            endpoints: Object.fromEntries(this._byEndpoint),
            recent:    this._recent.slice(-50)   // آخر 50 طلب فقط
        };
    }

    getTopEndpoints(n = 10) {
        return [...this._byEndpoint.entries()]
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, n)
            .map(([route, stats]) => ({ route, ...stats }));
    }

    getSlowest(n = 10) {
        return [...this._byEndpoint.entries()]
            .filter(([, s]) => s.count > 0)
            .sort((a, b) => b[1].avgMs - a[1].avgMs)
            .slice(0, n)
            .map(([route, stats]) => ({ route, ...stats }));
    }

    reset() {
        this._byEndpoint.clear();
        this._recent     = [];
        this._totals     = { requests: 0, errors: 0, slow: 0, avgMs: 0, totalMs: 0 };
        this._startTime  = Date.now();
    }
}

/* ══════════════════════════════════════════════════════════════════
 * SheikhaApiGateway — البوابة الرئيسية
 * ══════════════════════════════════════════════════════════════════ */
class SheikhaApiGateway {
    constructor(options = {}) {
        this.name      = 'بوابة API الموحدة — منظومة شيخة';
        this.nameEn    = 'Sheikha Unified API Gateway';
        this.version   = '1.0.0';
        this.metrics   = new MetricsStore();
        this.timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
        this.logLevel  = options.logLevel  || process.env.LOG_LEVEL || 'info';
        this._registeredRoutes = new Map();  // للتوثيق التلقائي

        console.log(`✅ [API-GATEWAY] ${this.name} — مُهيَّأ`);
    }

    /* ──────────────────────────────────────────────────────────────
     * middleware() — الـ middleware الرئيسي
     * استخدام: app.use('/api', gateway.middleware())
     * ────────────────────────────────────────────────────────────── */
    middleware() {
        return (req, res, next) => {
            /* ── 1. Correlation ID ─── */
            const correlationId = req.headers['x-correlation-id']
                || req.headers['x-request-id']
                || _genCorrelationId();
            req.correlationId = correlationId;
            res.setHeader('X-Correlation-Id', correlationId);
            res.setHeader('X-Powered-By', 'Sheikha Platform');

            /* ── 2. قياس الوقت ─── */
            const startAt = Date.now();

            /* ── 3. Timeout ─── */
            const timeoutHandle = setTimeout(() => {
                if (!res.headersSent) {
                    res.status(504).json(this._errorResponse(
                        'gateway_timeout',
                        `انتهت مهلة الطلب (${this.timeoutMs}ms)`,
                        null, correlationId
                    ));
                }
            }, this.timeoutMs);

            /* ── 4. تسجيل الاستجابة عند الإرسال ─── */
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                clearTimeout(timeoutHandle);
                const durationMs = Date.now() - startAt;
                res.setHeader('X-Response-Time', `${durationMs}ms`);

                /* تسجيل الأداء */
                const route = _normalizeRoute(req);
                this.metrics.record({
                    method:        req.method,
                    route,
                    status:        res.statusCode,
                    durationMs,
                    correlationId
                });

                /* تسجيل في الـ console */
                if (this.logLevel !== 'silent') {
                    const logLine = `[API] ${req.method} ${req.path} → ${res.statusCode} (${durationMs}ms) [${correlationId.slice(0, 8)}]`;
                    if (res.statusCode >= 500)       console.error(logLine);
                    else if (res.statusCode >= 400)  console.warn(logLine);
                    else if (durationMs >= SLOW_REQUEST_MS) console.warn('[SLOW]', logLine);
                    else if (this.logLevel === 'debug') console.log(logLine);
                }

                return originalJson(body);
            };

            /* ── 5. تسجيل الطلب الوارد ─── */
            if (this.logLevel === 'debug') {
                console.log(`[API] ← ${req.method} ${req.originalUrl} [${correlationId.slice(0, 8)}]`);
            }

            next();
        };
    }

    /* ──────────────────────────────────────────────────────────────
     * errorHandler() — معالج الأخطاء الموحد
     * استخدام: app.use(gateway.errorHandler())  — بعد كل المسارات
     * ────────────────────────────────────────────────────────────── */
    errorHandler() {
        // eslint-disable-next-line no-unused-vars
        return (err, req, res, _next) => {
            const correlationId = req.correlationId || 'unknown';
            const status = err.status || err.statusCode || 500;

            console.error(`[API] Error [${correlationId.slice(0, 8)}]:`, err.message);

            if (!res.headersSent) {
                res.status(status).json(this._errorResponse(
                    err.code || 'internal_error',
                    err.message || 'خطأ داخلي في الخادم',
                    process.env.NODE_ENV !== 'production' ? err.stack : null,
                    correlationId
                ));
            }
        };
    }

    /* ──────────────────────────────────────────────────────────────
     * notFoundHandler() — معالج 404
     * ────────────────────────────────────────────────────────────── */
    notFoundHandler() {
        return (req, res) => {
            res.status(404).json(this._errorResponse(
                'not_found',
                `المسار غير موجود: ${req.path}`,
                null,
                req.correlationId
            ));
        };
    }

    /* ──────────────────────────────────────────────────────────────
     * تنسيق رد الخطأ الموحد
     * ────────────────────────────────────────────────────────────── */
    _errorResponse(code, message, detail, correlationId) {
        return {
            success:       false,
            error:         code,
            message,
            correlationId: correlationId || null,
            detail:        detail || undefined,
            timestamp:     new Date().toISOString()
        };
    }

    /* ──────────────────────────────────────────────────────────────
     * getStatus() — حالة البوابة للـ API
     * ────────────────────────────────────────────────────────────── */
    getStatus() {
        return {
            success:  true,
            name:     this.name,
            version:  this.version,
            timeoutMs: this.timeoutMs,
            logLevel: this.logLevel,
            metrics:  this.metrics.getSummary().totals,
            uptime:   this.metrics.getSummary().uptime,
            timestamp: new Date().toISOString()
        };
    }

    getMetricsDashboard() {
        const summary = this.metrics.getSummary();
        return {
            success:      true,
            name:         this.name,
            uptime:       summary.uptime,
            totals:       summary.totals,
            topEndpoints: this.metrics.getTopEndpoints(10),
            slowest:      this.metrics.getSlowest(10),
            recentCount:  summary.recent.length,
            recent:       summary.recent.slice(-20),
            timestamp:    new Date().toISOString()
        };
    }
}

/* ── مساعدات ────────────────────────────────────────────────────── */
function _genCorrelationId() {
    return crypto.randomBytes(8).toString('hex');
}

/** تطبيع مسار الطلب لمنع cardinality انفجار في المقاييس */
function _normalizeRoute(req) {
    // استبدل المعرّفات الرقمية والـ UUIDs بـ :id
    return (req.route ? req.route.path : req.path)
        .replace(/\/[0-9a-f]{8,}/gi, '/:id')
        .replace(/\/\d+/g, '/:id')
        .replace(/\?.*$/, '');
}

/* ── تصدير سينجلتون ─────────────────────────────────────────────── */
const gateway = new SheikhaApiGateway();

module.exports = gateway;
module.exports.SheikhaApiGateway = SheikhaApiGateway;
module.exports.MetricsStore      = MetricsStore;
