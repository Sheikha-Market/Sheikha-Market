/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📊 مسارات SRE — Site Reliability Engineering Routes
 *  توفر نقاط API لمراقبة صحة النظام والامتثال لـ SLO وإدارة Error Budget
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();
const sreMonitor = require('../middleware/sre-monitor');

// ─── GET /api/sre/status — ملخص شامل لحالة SRE ──────────────────────────────
router.get('/status', (req, res) => {
    try {
        const status = sreMonitor.getStatus();
        const httpStatus = status.health === 'unhealthy' ? 503 : 200;

        res.status(httpStatus).json({
            success: status.health !== 'unhealthy',
            data: status,
            message: status.health === 'healthy'
                ? 'النظام يعمل بكفاءة — جميع SLOs محققة'
                : status.health === 'degraded'
                    ? 'النظام يعمل مع تحذيرات — بعض SLOs تحتاج مراجعة'
                    : 'النظام يحتاج تدخلاً — SLOs غير محققة',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'خطأ في حساب حالة SRE',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ─── GET /api/sre/slos — تفاصيل امتثال SLO لكل نافذة زمنية ─────────────────
router.get('/slos', (req, res) => {
    try {
        const windows = sreMonitor.WINDOWS;
        const results = {};

        for (const [label, ms] of Object.entries(windows)) {
            results[label] = sreMonitor.computeSLOCompliance(ms, label);
        }

        const overallCompliant = Object.values(results).every(r => r.compliant);

        res.json({
            success: true,
            data: {
                targets: sreMonitor.SLO_TARGETS,
                windows: results,
                overallCompliant,
                summary: {
                    '1h': results['1h']?.compliant,
                    '24h': results['24h']?.compliant,
                    '7d': results['7d']?.compliant
                }
            },
            message: overallCompliant
                ? 'جميع أهداف مستوى الخدمة محققة'
                : 'بعض أهداف مستوى الخدمة تحتاج مراجعة',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'خطأ في حساب امتثال SLO',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ─── GET /api/sre/error-budget — تقرير ميزانية الأخطاء ──────────────────────
router.get('/error-budget', (req, res) => {
    try {
        const budgets = {};
        for (const label of Object.keys(sreMonitor.WINDOWS)) {
            budgets[label] = sreMonitor.computeErrorBudget(label);
        }

        // أسوأ حالة عبر النوافذ الزمنية
        const allBudgets = Object.values(budgets);
        if (!allBudgets.length) {
            return res.json({ success: true, data: { windows: budgets, overall: { status: 'healthy', lowestAvailabilityBudgetPct: 100, lowestErrorRateBudgetPct: 100 } }, message: 'لا توجد بيانات كافية بعد', timestamp: new Date().toISOString() });
        }
        const worstAvailability = Math.min(...allBudgets.map(b => b.availability.budgetRemainingPct));
        const worstErrorRate = Math.min(...allBudgets.map(b => b.errorRate.budgetRemainingPct));

        const overallStatus = (worstAvailability < 0 || worstErrorRate < 0)
            ? 'exhausted'
            : (worstAvailability < 10 || worstErrorRate < 10)
                ? 'warning'
                : 'healthy';

        res.json({
            success: true,
            data: {
                windows: budgets,
                overall: {
                    status: overallStatus,
                    lowestAvailabilityBudgetPct: parseFloat(worstAvailability.toFixed(2)),
                    lowestErrorRateBudgetPct: parseFloat(worstErrorRate.toFixed(2))
                },
                explanation: {
                    ar: 'ميزانية الأخطاء = (1 - هدف SLO) — كلما كانت أعلى كان النظام أكثر موثوقية',
                    en: 'Error Budget = (1 - SLO target) — higher remaining budget means more reliable service'
                }
            },
            message: overallStatus === 'healthy'
                ? 'ميزانية الأخطاء في الوضع الطبيعي'
                : overallStatus === 'warning'
                    ? 'ميزانية الأخطاء منخفضة — يُنصح بمراجعة الأسباب'
                    : 'ميزانية الأخطاء استُنفذت — يجب التوقف عن الإطلاق والتركيز على الاستقرار',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'خطأ في حساب ميزانية الأخطاء',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ─── GET /api/sre/alerts — التنبيهات النشطة ─────────────────────────────────
router.get('/alerts', (req, res) => {
    try {
        const alerts = sreMonitor.getActiveAlerts();
        const critical = alerts.filter(a => a.severity === 'critical');
        const warnings = alerts.filter(a => a.severity === 'warning');

        res.json({
            success: true,
            data: {
                total: alerts.length,
                critical: critical.length,
                warnings: warnings.length,
                alerts,
                status: critical.length > 0 ? 'firing' : (warnings.length > 0 ? 'warning' : 'ok')
            },
            message: alerts.length === 0
                ? 'لا توجد تنبيهات نشطة — النظام يعمل بشكل سليم'
                : `${alerts.length} تنبيه نشط (${critical.length} حرج، ${warnings.length} تحذير)`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'خطأ في استرجاع التنبيهات',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ─── GET /api/sre/metrics — مقاييس SLI التفصيلية لكل النوافذ الزمنية ────────
router.get('/metrics', (req, res) => {
    try {
        const windows = sreMonitor.WINDOWS;
        const sliData = {};

        for (const [label, ms] of Object.entries(windows)) {
            sliData[label] = sreMonitor.computeSLI(ms);
        }

        res.json({
            success: true,
            data: {
                sloTargets: sreMonitor.SLO_TARGETS,
                sli: sliData,
                totals: {
                    requests: sreMonitor.metrics.totalRequests,
                    errors: sreMonitor.metrics.totalErrors,
                    uptimeMs: Date.now() - sreMonitor.metrics.startTime,
                    recordsInMemory: sreMonitor.metrics.requests.length
                }
            },
            message: 'مقاييس SLI محسوبة بنجاح',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'خطأ في حساب مقاييس SLI',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
