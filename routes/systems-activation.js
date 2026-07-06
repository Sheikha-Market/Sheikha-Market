/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌐 مسارات API لتفعيل الأنظمة - Systems Activation Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * الوظيفة: توفير endpoints API لتفعيل وإدارة الأنظمة
 * الإصدار: 1.0
 * التاريخ: 17 مايو 2026
 */

const express = require('express');
const router = express.Router();
const { SystemsActivationEngine, SYSTEMS_REGISTRY, listSystems, getSystemDetails, getSystemsByType } = require('../lib/systems-activation-engine');

// إنشاء محرك التفعيل الموحد
const engine = new SystemsActivationEngine();

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 نقاط النهاية العامة (General Endpoints)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/systems/list
 * قائمة جميع الأنظمة المتاحة
 */
router.get('/list', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    systems: listSystems(),
    total: Object.keys(SYSTEMS_REGISTRY).length
  });
});

/**
 * GET /api/systems/status
 * حالة جميع الأنظمة
 */
router.get('/status', (req, res) => {
  const status = engine.getSystemsStatus();
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: status
  });
});

/**
 * GET /api/systems/info/:systemId
 * معلومات نظام محدد
 */
router.get('/info/:systemId', (req, res) => {
  const system = getSystemDetails(req.params.systemId);

  if (!system) {
    return res.status(404).json({
      success: false,
      error: 'النظام غير موجود',
      systemId: req.params.systemId
    });
  }

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    system: system,
    state: engine.systemStates[req.params.systemId] || { status: 'inactive' }
  });
});

/**
 * GET /api/systems/properties/:systemId
 * خواص نظام محدد
 */
router.get('/properties/:systemId', (req, res) => {
  const system = getSystemDetails(req.params.systemId);

  if (!system) {
    return res.status(404).json({
      success: false,
      error: 'النظام غير موجود'
    });
  }

  res.json({
    success: true,
    systemId: req.params.systemId,
    properties: {
      name: system.name,
      type: system.type,
      criticality: system.criticality,
      maturityLevel: system.maturityLevel,
      performance: system.performance,
      constraints: system.constraints,
      features: system.features,
      description: system.description
    }
  });
});

/**
 * GET /api/systems/by-type/:type
 * أنظمة حسب النوع (core أو advanced)
 */
router.get('/by-type/:type', (req, res) => {
  const systems = getSystemsByType(req.params.type);

  if (systems.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'لا توجد أنظمة من هذا النوع',
      type: req.params.type
    });
  }

  res.json({
    success: true,
    type: req.params.type,
    count: systems.length,
    systems: systems.map(s => ({ id: s.id, name: s.name, maturityLevel: s.maturityLevel }))
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ نقاط النهاية التشغيلية (Operational Endpoints)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/systems/activate/:systemId
 * تفعيل نظام معين
 */
router.post('/activate/:systemId', async (req, res) => {
  const result = await engine.activateSystem(req.params.systemId);

  const statusCode = result.success ? 200 : 400;
  res.status(statusCode).json({
    success: result.success,
    timestamp: new Date().toISOString(),
    systemId: req.params.systemId,
    ...result
  });
});

/**
 * POST /api/systems/activate-all
 * تفعيل جميع الأنظمة
 */
router.post('/activate-all', async (req, res) => {
  const result = await engine.activateAllSystems();

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    summary: result
  });
});

/**
 * POST /api/systems/check-readiness/:systemId
 * فحص جاهزية نظام معين
 */
router.post('/check-readiness/:systemId', (req, res) => {
  const readiness = engine.checkReadiness(req.params.systemId);

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    readiness: readiness
  });
});

/**
 * POST /api/systems/sign-contract/:systemId
 * توقيع عقد جاهزية للنظام
 */
router.post('/sign-contract/:systemId', (req, res) => {
  const contract = engine.signReadinessContract(req.params.systemId);

  const statusCode = contract.success ? 200 : 400;
  res.status(statusCode).json({
    success: contract.success,
    timestamp: new Date().toISOString(),
    ...contract
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 نقاط النهاية التحليلية (Analytics Endpoints)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/systems/activation-log
 * سجل التفعيل
 */
router.get('/activation-log', (req, res) => {
  const log = engine.getActivationLog();

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    log: log
  });
});

/**
 * GET /api/systems/timeline
 * الجدول الزمني للتفعيل
 */
router.get('/timeline', (req, res) => {
  const timeline = engine.getActivationTimeline();

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    timeline: timeline
  });
});

/**
 * GET /api/systems/performance
 * الأداء الكلي
 */
router.get('/performance', (req, res) => {
  const perf = engine.calculatePerformance();

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    performance: perf
  });
});

/**
 * GET /api/systems/report
 * التقرير الشامل
 */
router.get('/report', (req, res) => {
  const report = engine.generateReport();

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    report: report
  });
});

/**
 * GET /api/systems/innovation-report
 * تقرير الابتكار والتحسينات
 */
router.get('/innovation-report', (req, res) => {
  const status = engine.getSystemsStatus();
  const perf = engine.calculatePerformance();

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    innovation: {
      currentPerformance: perf,
      improvementAreas: status.systems
        .filter(s => s.performance < 95)
        .map(s => ({ system: s.name, currentPerf: s.performance, target: 95 })),
      nextSteps: [
        'رفع مستوى النضج إلى L4',
        'تحسين الأداء إلى 99%',
        'توسيع الابتكار',
        'بناء أنظمة جديدة'
      ]
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 نقاط النهاية الإدارية (Admin Endpoints)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/systems/admin/contracts
 * جميع عقود الجاهزية (للمسؤولين فقط)
 */
router.get('/admin/contracts', (req, res) => {
  // يجب التحقق من الصلاحيات
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    contracts: engine.readinessContracts,
    total: Object.keys(engine.readinessContracts).length
  });
});

/**
 * POST /api/systems/admin/reset
 * إعادة تعيين جميع الأنظمة (للطوارئ فقط)
 */
router.post('/admin/reset', (req, res) => {
  // يجب التحقق من الصلاحيات والكود السري
  engine.activationLog = [];
  engine.systemStates = {};
  engine.readinessContracts = {};
  engine.activationTimeline = [];

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: 'تم إعادة تعيين جميع الأنظمة'
  });
});

/**
 * POST /api/systems/admin/health-check
 * فحص صحة شامل (للمسؤولين فقط)
 */
router.post('/admin/health-check', (req, res) => {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    systems: {},
    overall: 'good'
  };

  Object.entries(SYSTEMS_REGISTRY).forEach(([id, system]) => {
    const readiness = engine.checkReadiness(id);
    healthCheck.systems[id] = {
      name: system.name,
      ready: readiness.ready,
      performance: system.performance
    };
  });

  res.json({
    success: true,
    healthCheck: healthCheck
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 📚 نقاط النهاية التوثيقية (Documentation Endpoints)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/systems/documentation
 * وثائق الأنظمة
 */
router.get('/documentation', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    documentation: {
      overview: 'نظام إدارة وتفعيل الأنظمة الموحد في منظومة شيخة',
      version: '1.0',
      date: '17 مايو 2026',
      endpoints: [
        { method: 'GET', path: '/api/systems/list', description: 'قائمة الأنظمة' },
        { method: 'GET', path: '/api/systems/status', description: 'حالة الأنظمة' },
        { method: 'POST', path: '/api/systems/activate/:systemId', description: 'تفعيل نظام' },
        { method: 'POST', path: '/api/systems/activate-all', description: 'تفعيل جميع الأنظمة' },
        { method: 'GET', path: '/api/systems/report', description: 'التقرير الشامل' },
        { method: 'GET', path: '/api/systems/performance', description: 'الأداء الكلي' }
      ]
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 التصدير
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = router;
