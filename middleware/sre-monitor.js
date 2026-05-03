/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📊 وسيط مراقبة SRE — Site Reliability Engineering Monitor
 *  يتتبع مؤشرات مستوى الخدمة (SLI) ويحسب الامتثال لأهداف مستوى الخدمة (SLO)
 *  ويدير ميزانية الأخطاء (Error Budget)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── تعريف SLOs (أهداف مستوى الخدمة) ───────────────────────────────────────
const SLO_TARGETS = {
    availability: 0.999,      // 99.9% إتاحة
    p95LatencyMs: 500,         // زمن استجابة p95 < 500ms
    p99LatencyMs: 2000,        // زمن استجابة p99 < 2000ms
    errorRateMax: 0.01         // معدل خطأ < 1%
};

// ─── نوافذ زمنية للتتبع (بالمللي ثانية) ────────────────────────────────────
const WINDOWS = {
    '1h':  60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d':  7  * 24 * 60 * 60 * 1000
};

// ─── حجم أقصى للسجلات في الذاكرة لكل نافذة ─────────────────────────────────
const MAX_RECORDS = 50000;

// ─── مخزن المقاييس في الذاكرة ───────────────────────────────────────────────
const metrics = {
    // كل سجل: { ts: timestamp, latencyMs, statusCode, path }
    requests: [],
    startTime: Date.now(),

    // عدادات تراكمية
    totalRequests: 0,
    totalErrors: 0,
    totalLatencyMs: 0
};

// ─── تنظيف السجلات القديمة (أبعد من 7 أيام) ────────────────────────────────
function pruneOldRecords() {
    const cutoff = Date.now() - WINDOWS['7d'];
    const before = metrics.requests.length;
    metrics.requests = metrics.requests.filter(r => r.ts >= cutoff);
    if (metrics.requests.length > MAX_RECORDS) {
        metrics.requests = metrics.requests.slice(-MAX_RECORDS);
    }
    return before - metrics.requests.length;
}

// ─── حساب Percentile ────────────────────────────────────────────────────────
function percentile(sortedArr, p) {
    if (!sortedArr.length) return 0;
    const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
    return sortedArr[Math.max(0, Math.min(idx, sortedArr.length - 1))];
}

// ─── حساب SLI للنافذة الزمنية المحددة ──────────────────────────────────────
function computeSLI(windowMs) {
    const cutoff = Date.now() - windowMs;
    const window = metrics.requests.filter(r => r.ts >= cutoff);

    if (!window.length) {
        return {
            requestCount: 0,
            errorCount: 0,
            availability: 1.0,
            errorRate: 0,
            avgLatencyMs: 0,
            p95LatencyMs: 0,
            p99LatencyMs: 0
        };
    }

    const errors = window.filter(r => r.statusCode >= 500);
    // طلبات 4xx و 5xx تُحسب كأخطاء في معدل الخطأ لكن 4xx لا تؤثر على الإتاحة
    const serverErrors = errors.length;
    const availability = 1 - (serverErrors / window.length);
    const errorRate = serverErrors / window.length;

    const latencies = window.map(r => r.latencyMs).sort((a, b) => a - b);
    const avgLatency = Math.round(latencies.reduce((s, v) => s + v, 0) / latencies.length);

    return {
        requestCount: window.length,
        errorCount: serverErrors,
        availability: parseFloat(availability.toFixed(6)),
        errorRate: parseFloat(errorRate.toFixed(6)),
        avgLatencyMs: avgLatency,
        p95LatencyMs: percentile(latencies, 95),
        p99LatencyMs: percentile(latencies, 99)
    };
}

// ─── حساب Error Budget ──────────────────────────────────────────────────────
function computeErrorBudget(windowLabel) {
    const windowMs = WINDOWS[windowLabel] || WINDOWS['24h'];
    const sli = computeSLI(windowMs);

    // Error Budget المسموح به = 1 - SLO Target
    const availabilityBudgetTotal = 1 - SLO_TARGETS.availability;   // 0.001 = 0.1%
    const availabilityBudgetUsed = 1 - sli.availability;
    const availabilityBudgetRemaining = availabilityBudgetTotal - availabilityBudgetUsed;
    const availabilityBudgetPct = availabilityBudgetTotal > 0
        ? Math.max(0, (availabilityBudgetRemaining / availabilityBudgetTotal) * 100)
        : 100;

    const errorRateBudgetTotal = SLO_TARGETS.errorRateMax;            // 1%
    const errorRateBudgetUsed = sli.errorRate;
    const errorRateBudgetRemaining = errorRateBudgetTotal - errorRateBudgetUsed;
    const errorRateBudgetPct = errorRateBudgetTotal > 0
        ? Math.max(0, (errorRateBudgetRemaining / errorRateBudgetTotal) * 100)
        : 100;

    return {
        window: windowLabel,
        availability: {
            target: SLO_TARGETS.availability,
            current: sli.availability,
            budgetTotalPct: parseFloat((availabilityBudgetTotal * 100).toFixed(4)),
            budgetUsedPct: parseFloat((availabilityBudgetUsed * 100).toFixed(4)),
            budgetRemainingPct: parseFloat(availabilityBudgetPct.toFixed(2)),
            status: availabilityBudgetPct >= 10 ? 'healthy' : (availabilityBudgetPct >= 0 ? 'warning' : 'exhausted')
        },
        errorRate: {
            target: SLO_TARGETS.errorRateMax,
            current: sli.errorRate,
            budgetTotalPct: parseFloat((errorRateBudgetTotal * 100).toFixed(4)),
            budgetUsedPct: parseFloat((errorRateBudgetUsed * 100).toFixed(4)),
            budgetRemainingPct: parseFloat(errorRateBudgetPct.toFixed(2)),
            status: errorRateBudgetPct >= 10 ? 'healthy' : (errorRateBudgetPct >= 0 ? 'warning' : 'exhausted')
        }
    };
}

// ─── فحص امتثال SLO ─────────────────────────────────────────────────────────
function computeSLOCompliance(windowMs, windowLabel) {
    const sli = computeSLI(windowMs);
    const checks = {
        availability: {
            target: SLO_TARGETS.availability,
            current: sli.availability,
            met: sli.availability >= SLO_TARGETS.availability,
            label: 'الإتاحة'
        },
        p95Latency: {
            targetMs: SLO_TARGETS.p95LatencyMs,
            currentMs: sli.p95LatencyMs,
            met: sli.p95LatencyMs <= SLO_TARGETS.p95LatencyMs || sli.requestCount === 0,
            label: 'زمن الاستجابة p95'
        },
        p99Latency: {
            targetMs: SLO_TARGETS.p99LatencyMs,
            currentMs: sli.p99LatencyMs,
            met: sli.p99LatencyMs <= SLO_TARGETS.p99LatencyMs || sli.requestCount === 0,
            label: 'زمن الاستجابة p99'
        },
        errorRate: {
            targetMax: SLO_TARGETS.errorRateMax,
            current: sli.errorRate,
            met: sli.errorRate <= SLO_TARGETS.errorRateMax,
            label: 'معدل الخطأ'
        }
    };

    const allMet = Object.values(checks).every(c => c.met);
    const metCount = Object.values(checks).filter(c => c.met).length;
    const totalCount = Object.keys(checks).length;

    return {
        window: windowLabel,
        sli,
        slo: checks,
        compliant: allMet,
        compliance: `${metCount}/${totalCount}`,
        compliancePct: Math.round((metCount / totalCount) * 100)
    };
}

// ─── رصد التنبيهات النشطة ────────────────────────────────────────────────────
function getActiveAlerts() {
    const alerts = [];
    const now = Date.now();

    // تحقق من كل نافذة زمنية
    for (const [label, windowMs] of Object.entries(WINDOWS)) {
        const sli = computeSLI(windowMs);
        if (sli.requestCount === 0) continue;

        if (sli.availability < SLO_TARGETS.availability) {
            alerts.push({
                id: `availability-${label}`,
                severity: sli.availability < 0.99 ? 'critical' : 'warning',
                type: 'availability',
                window: label,
                message: `الإتاحة ${(sli.availability * 100).toFixed(3)}% أقل من هدف ${(SLO_TARGETS.availability * 100).toFixed(1)}%`,
                messageEn: `Availability ${(sli.availability * 100).toFixed(3)}% below target ${(SLO_TARGETS.availability * 100).toFixed(1)}%`,
                current: sli.availability,
                target: SLO_TARGETS.availability,
                ts: new Date(now).toISOString()
            });
        }

        if (sli.errorRate > SLO_TARGETS.errorRateMax) {
            alerts.push({
                id: `error-rate-${label}`,
                severity: sli.errorRate > 0.05 ? 'critical' : 'warning',
                type: 'error_rate',
                window: label,
                message: `معدل الخطأ ${(sli.errorRate * 100).toFixed(2)}% يتجاوز الحد ${(SLO_TARGETS.errorRateMax * 100).toFixed(1)}%`,
                messageEn: `Error rate ${(sli.errorRate * 100).toFixed(2)}% exceeds limit ${(SLO_TARGETS.errorRateMax * 100).toFixed(1)}%`,
                current: sli.errorRate,
                target: SLO_TARGETS.errorRateMax,
                ts: new Date(now).toISOString()
            });
        }

        if (sli.p95LatencyMs > SLO_TARGETS.p95LatencyMs) {
            alerts.push({
                id: `latency-p95-${label}`,
                severity: sli.p95LatencyMs > 2000 ? 'critical' : 'warning',
                type: 'latency_p95',
                window: label,
                message: `زمن الاستجابة p95 = ${sli.p95LatencyMs}ms يتجاوز الهدف ${SLO_TARGETS.p95LatencyMs}ms`,
                messageEn: `p95 latency ${sli.p95LatencyMs}ms exceeds target ${SLO_TARGETS.p95LatencyMs}ms`,
                current: sli.p95LatencyMs,
                target: SLO_TARGETS.p95LatencyMs,
                ts: new Date(now).toISOString()
            });
        }
    }

    return alerts;
}

// ─── وسيط Express: تسجيل كل طلب ────────────────────────────────────────────
function sreMiddleware(req, res, next) {
    const startTs = Date.now();

    res.on('finish', () => {
        const latencyMs = Date.now() - startTs;
        const record = {
            ts: startTs,
            latencyMs,
            statusCode: res.statusCode,
            path: req.path || '/'
        };

        metrics.requests.push(record);
        metrics.totalRequests++;
        metrics.totalLatencyMs += latencyMs;
        if (res.statusCode >= 500) metrics.totalErrors++;

        // تنظيف دوري — كل 5000 طلب
        if (metrics.totalRequests % 5000 === 0) {
            pruneOldRecords();
        }
    });

    next();
}

// ─── دوال مساعدة للاستخدام الخارجي ─────────────────────────────────────────
function getStatus() {
    const uptimeMs = Date.now() - metrics.startTime;
    const sli1h = computeSLI(WINDOWS['1h']);
    const slo1h = computeSLOCompliance(WINDOWS['1h'], '1h');
    const alerts = getActiveAlerts();
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const warnings = alerts.filter(a => a.severity === 'warning').length;

    return {
        health: critical > 0 ? 'unhealthy' : (warnings > 0 ? 'degraded' : 'healthy'),
        uptime: {
            ms: uptimeMs,
            seconds: Math.floor(uptimeMs / 1000),
            formatted: formatUptime(uptimeMs)
        },
        sloTargets: SLO_TARGETS,
        currentWindow: '1h',
        sli: sli1h,
        sloCompliant: slo1h.compliant,
        sloCompliance: slo1h.compliance,
        alertsCount: { critical, warnings, total: alerts.length },
        totalRequests: metrics.totalRequests,
        totalErrors: metrics.totalErrors,
        timestamp: new Date().toISOString()
    };
}

function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    return `${m}m ${sec}s`;
}

// تشغيل التنظيف التلقائي كل ساعة
setInterval(pruneOldRecords, 60 * 60 * 1000);

module.exports = {
    sreMiddleware,
    getStatus,
    computeSLI,
    computeSLOCompliance,
    computeErrorBudget,
    getActiveAlerts,
    SLO_TARGETS,
    WINDOWS,
    metrics
};
