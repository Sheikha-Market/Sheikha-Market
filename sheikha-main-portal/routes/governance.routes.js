/**
 * بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════
 * routes/governance.routes.js
 * مسارات API الحوكمة التشغيلية لمنظومة شيخة
 * ══════════════════════════════════════════════════════════════════════
 *
 * GET  /api/governance/health   → حالة بروتوكول الحوكمة
 * GET  /api/governance/status   → حالة النظام الكاملة
 * POST /api/governance/decision → تسجيل قرار تشغيلي
 * POST /api/governance/activate → تفعيل عبر الحاكم (قيد البيئة)
 * GET  /api/governance/metrics  → مقاييس الأداء والموارد
 * GET  /api/governance/report   → توليد تقرير إحصائي
 * GET  /api/governance/audit    → سجل المراجعة
 */

'use strict';

const express  = require('express');
const router   = express.Router();
const gov      = require('../lib/sheikha-governance-protocol');

// ── GET /api/governance/health ────────────────────────────────────────
router.get('/governance/health', (req, res) => {
  try {
    const health = gov.getHealthStatus();
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success:  true,
      data:     health,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/governance/status ────────────────────────────────────────
router.get('/governance/status', (req, res) => {
  try {
    const summary = gov.getMetricsSummary();
    res.json({
      بسم_الله:     'بسم الله الرحمن الرحيم',
      success:       true,
      protocol:      'Sheikha Governance Protocol v1',
      protocolRules: gov.PROTOCOL_RULES,
      data:          summary,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/governance/decision ─────────────────────────────────────
router.post('/governance/decision', (req, res) => {
  try {
    const { type, mode, result, role, meta } = req.body || {};
    if (!mode || !result) {
      return res.status(400).json({
        success: false,
        error:   'الحقول المطلوبة: mode, result',
      });
    }
    const entry = gov.logDecision({ type, mode, result, role, meta });
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success:   true,
      message:   'تم تسجيل القرار',
      data:      entry,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/governance/activate ─────────────────────────────────────
// ملاحظة: هذا المسار يسجّل طلب التفعيل فقط — التفعيل الفعلي عبر sheikha-control
router.post('/governance/activate', (req, res) => {
  try {
    const { mode = 'auto', role = 'system' } = req.body || {};
    const validModes = ['stable', 'power', 'auto'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        error:   `وضع غير صالح: ${mode}. الأوضاع المتاحة: ${validModes.join(', ')}`,
      });
    }

    const perm = gov.checkPermission(role, 'activate');
    if (!perm.allowed) {
      return res.status(403).json({
        success: false,
        error:   `الدور "${role}" لا يملك صلاحية التفعيل`,
      });
    }

    // تسجيل طلب التفعيل
    const entry = gov.logDecision({
      type:   'activation-request',
      mode,
      result: 'requested',
      role,
      meta:   { source: 'api', ip: req.ip },
    });

    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success:   true,
      message:   `طلب التفعيل بالوضع "${mode}" مسجّل`,
      command:   `bash scripts/sheikha-control.sh ${mode}`,
      data:      entry,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/governance/metrics ───────────────────────────────────────
router.get('/governance/metrics', (req, res) => {
  try {
    const metrics = gov.collectMetrics();
    const summary = gov.getMetricsSummary();
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success:   true,
      data: {
        system:     metrics,
        operations: {
          totalRuns:   summary.totalRuns,
          successRate: summary.successRate,
          byMode:      summary.byMode,
          lastRun:     summary.lastRun,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/governance/report ────────────────────────────────────────
router.get('/governance/report', (req, res) => {
  try {
    const { report, filePath } = gov.generateReport();
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success:   true,
      message:   'تم توليد التقرير',
      filePath,
      data:      report,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/governance/audit ─────────────────────────────────────────
router.get('/governance/audit', (req, res) => {
  try {
    const limit   = Math.min(parseInt(req.query.limit) || 50, 200);
    const summary = gov.getMetricsSummary();
    const recent  = summary.recentEvents.slice(-limit);
    res.json({
      بسم_الله:     'بسم الله الرحمن الرحيم',
      success:       true,
      protocolRules: gov.PROTOCOL_RULES,
      roles:         gov.ADMIN_LAYER,
      data: {
        events:     recent,
        totalRuns:  summary.totalRuns,
        successRate: summary.successRate,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
