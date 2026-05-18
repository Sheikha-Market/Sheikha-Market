/**
 * بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════
 * routes/governance.routes.js
 * مسارات API الحوكمة التشغيلية لمنظومة شيخة
 * ══════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();
const gov = require('../lib/sheikha-governance-protocol');
const controlPlane = require('../lib/sheikha-unified-control-plane');
const connectionAudit = require('../lib/sheikha-connection-audit');

controlPlane.start();

router.use((req, res, next) => {
  const correlationId = String(req.headers['x-correlation-id'] || '').trim() || `corr-${Date.now()}`;
  req.correlationId = correlationId;
  req.connectionReport = connectionAudit.begin(req, `${req.method} ${req.originalUrl}`, correlationId);
  connectionAudit.during(req.connectionReport, { phase: 'routing', note: 'entered governance router' });
  res.on('finish', () => {
    try {
      connectionAudit.end(
        req.connectionReport,
        { statusCode: res.statusCode, success: res.statusCode < 400 },
        { effect: res.statusCode < 400 ? 'operation-applied' : 'negative-impact-possible' }
      );
    } catch (_) {}
  });
  next();
});

// ── GET /api/governance/health ────────────────────────────────────────
router.get('/health', (req, res) => {
  try {
    const health = gov.getHealthStatus();
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success: true,
      correlationId: req.correlationId,
      data: health,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/governance/status ────────────────────────────────────────
router.get('/status', (req, res) => {
  try {
    const summary = gov.getMetricsSummary();
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success: true,
      protocol: 'Sheikha Governance Protocol v1',
      protocolRules: gov.PROTOCOL_RULES,
      correlationId: req.correlationId,
      unifiedOperationalFabric: controlPlane.status(),
      data: summary,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/governance/decision ─────────────────────────────────────
router.post('/decision', (req, res) => {
  try {
    const { type, mode, result, role, meta, action, category, target, context = {}, approvedBy } = req.body || {};
    if (!mode || !result) {
      return res.status(400).json({ success: false, error: 'الحقول المطلوبة: mode, result' });
    }
    const entry = gov.logDecision({ type, mode, result, role, meta });
    connectionAudit.during(req.connectionReport, { phase: 'decision-evaluation', action, mode, role });
    const controlPlaneDecision = controlPlane.evaluateDecision({
      actor: role || 'system',
      action: action || `governance.${mode}`,
      category: category || 'operations',
      target: target || 'runtime',
      correlationId: req.correlationId,
      context: { ...context, approvedBy },
    });
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success: true,
      message: 'تم تسجيل القرار',
      correlationId: req.correlationId,
      data: entry,
      controlPlaneDecision,
      connection: {
        ip: req.connectionReport.ip,
        operation: req.connectionReport.operation,
        beforeDuringAfter: req.connectionReport.stages,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/governance/activate ─────────────────────────────────────
router.post('/activate', (req, res) => {
  try {
    const { mode = 'auto', role = 'system' } = req.body || {};
    const validModes = ['stable', 'power', 'auto'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        error: `وضع غير صالح: ${mode}. الأوضاع المتاحة: ${validModes.join(', ')}`,
      });
    }
    const perm = gov.checkPermission(role, 'activate');
    if (!perm.allowed) {
      return res.status(403).json({
        success: false,
        error: `الدور "${role}" لا يملك صلاحية التفعيل`,
      });
    }
    const entry = gov.logDecision({
      type: 'activation-request',
      mode,
      result: 'requested',
      role,
      meta: { source: 'api', ip: req.ip },
    });
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success: true,
      message: `طلب التفعيل بالوضع "${mode}" مسجّل`,
      command: `bash scripts/sheikha-control.sh ${mode}`,
      correlationId: req.correlationId,
      data: entry,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/governance/authorize ─────────────────────────────────────
router.post('/authorize', (req, res) => {
  try {
    const { actor = 'operator', action, category = 'operations', target = 'runtime', context = {} } = req.body || {};
    if (!action) return res.status(400).json({ success: false, error: 'action is required' });
    connectionAudit.during(req.connectionReport, { phase: 'authorize', actor, action, target });
    const decision = controlPlane.evaluateDecision({
      actor,
      action,
      category,
      target,
      correlationId: req.correlationId,
      context,
    });
    res.status(decision.allowed ? 200 : 403).json({
      success: decision.allowed,
      correlationId: req.correlationId,
      decision,
      connection: {
        ip: req.connectionReport.ip,
        operation: req.connectionReport.operation,
        beforeDuringAfter: req.connectionReport.stages,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/governance/service/authorize ─────────────────────────────
router.post('/service/authorize', (req, res) => {
  try {
    const { source, target, action = 'call', actor = 'system' } = req.body || {};
    if (!source || !target) return res.status(400).json({ success: false, error: 'source and target are required' });
    const decision = controlPlane.authorizeServiceCall({
      source,
      target,
      action,
      actor,
      correlationId: req.correlationId,
    });
    res.status(decision.allowed ? 200 : 403).json({ success: decision.allowed, correlationId: req.correlationId, decision });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/governance/service/contracts ─────────────────────────────
router.post('/service/contracts', (req, res) => {
  try {
    const contract = controlPlane.registerServiceContract(req.body || {});
    res.json({ success: true, correlationId: req.correlationId, contract });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── POST /api/governance/policy/exception ───────────────────────────────
router.post('/policy/exception', (req, res) => {
  try {
    const entry = controlPlane.registerPolicyException(req.body || {});
    res.json({ success: true, correlationId: req.correlationId, exception: entry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── GET /api/governance/metrics ───────────────────────────────────────
router.get('/metrics', (req, res) => {
  try {
    const metrics = gov.collectMetrics();
    const summary = gov.getMetricsSummary();
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success: true,
      correlationId: req.correlationId,
      data: {
        system: metrics,
        operations: {
          totalRuns: summary.totalRuns,
          successRate: summary.successRate,
          byMode: summary.byMode,
          lastRun: summary.lastRun,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/governance/report ────────────────────────────────────────
router.get('/report', (req, res) => {
  try {
    const { report, filePath } = gov.generateReport();
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success: true,
      message: 'تم توليد التقرير',
      correlationId: req.correlationId,
      filePath,
      data: report,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/governance/audit ─────────────────────────────────────────
router.get('/audit', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const summary = gov.getMetricsSummary();
    const recent = summary.recentEvents.slice(-limit);
    res.json({
      بسم_الله: 'بسم الله الرحمن الرحيم',
      success: true,
      protocolRules: gov.PROTOCOL_RULES,
      roles: gov.ADMIN_LAYER,
      correlationId: req.correlationId,
      data: {
        events: recent,
        totalRuns: summary.totalRuns,
        successRate: summary.successRate,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/governance/control-plane/status ───────────────────────────
router.get('/control-plane/status', (req, res) => {
  try {
    res.json({ success: true, correlationId: req.correlationId, data: controlPlane.status() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/governance/control-plane/timeline ─────────────────────────
router.get('/control-plane/timeline', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    res.json({ success: true, correlationId: req.correlationId, timeline: controlPlane.timeline(limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
