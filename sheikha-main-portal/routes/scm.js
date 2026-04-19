// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌍 SGSC-OS API ROUTES
 * مسارات API لنظام تشغيل سلاسل الإمداد العالمي
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const express = require('express');
const router = express.Router();

// تحميل المحركات
let sgscOS, globalMarkets, plStack, erpHub, aiSCM, neuralSCM;
try { sgscOS = require('../lib/sheikha-global-scm-os'); } catch (e) { console.warn('sgscOS load error:', e.message); }
try { globalMarkets = require('../lib/sheikha-global-markets-engine'); } catch (e) { console.warn('globalMarkets load error:', e.message); }
try { plStack = require('../lib/sheikha-pl-stack-engine'); } catch (e) { console.warn('plStack load error:', e.message); }
try { erpHub = require('../lib/sheikha-erp-integration-hub'); } catch (e) { console.warn('erpHub load error:', e.message); }
try { aiSCM = require('../lib/sheikha-ai-scm-intelligence'); } catch (e) { console.warn('aiSCM load error:', e.message); }
try { ({ neuralSCM } = require('../lib/sheikha-neural-scm-engine')); } catch (e) { console.warn('neuralSCM load error:', e.message); }

// ─────────────────────────────────────────────────────────────────────────────
// System Status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/scm/status
 * حالة نظام SGSC-OS الكاملة
 */
router.get('/status', (req, res) => {
    try {
        const status = sgscOS ? sgscOS.getSystemStatus() : { status: 'loading', message: 'النظام يُحمَّل...' };
        res.json({ success: true, data: status });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Markets — الأسواق العالمية
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/scm/markets
 * جميع الأسواق العالمية
 */
router.get('/markets', (req, res) => {
    try {
        if (!globalMarkets) return res.status(503).json({ success: false, error: 'محرك الأسواق غير متوفر' });
        const markets = globalMarkets.getAllMarkets();
        res.json({ success: true, count: markets.length, data: markets });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/markets/:marketId
 * تفاصيل سوق محدد
 */
router.get('/markets/:marketId', (req, res) => {
    try {
        if (!globalMarkets) return res.status(503).json({ success: false, error: 'محرك الأسواق غير متوفر' });
        const market = globalMarkets.getMarket(req.params.marketId);
        if (!market) return res.status(404).json({ success: false, error: 'السوق غير موجود' });
        res.json({ success: true, data: market });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/markets/:marketId/products/:productId
 * تفاصيل منتج محدد
 */
router.get('/markets/:marketId/products/:productId', (req, res) => {
    try {
        if (!globalMarkets) return res.status(503).json({ success: false, error: 'محرك الأسواق غير متوفر' });
        const product = globalMarkets.getProduct(req.params.marketId, req.params.productId);
        if (!product) return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
        res.json({ success: true, data: product });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/markets/:marketId/analyze/:productId
 * تحليل سوق ومنتج محدد
 */
router.get('/markets/:marketId/analyze/:productId', (req, res) => {
    try {
        if (!globalMarkets) return res.status(503).json({ success: false, error: 'محرك الأسواق غير متوفر' });
        const analysis = globalMarkets.analyzeMarket(req.params.marketId, req.params.productId, req.query);
        res.json({ success: true, data: analysis });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// HS Codes — الرموز الجمركية
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/scm/hs-codes/search?code=7404
 * البحث بكود HS
 */
router.get('/hs-codes/search', (req, res) => {
    try {
        if (!globalMarkets) return res.status(503).json({ success: false, error: 'محرك الأسواق غير متوفر' });
        const { code, q } = req.query;
        if (code) {
            const result = globalMarkets.searchByHSCode(code);
            return res.json({ success: true, data: result });
        }
        if (q) {
            const result = globalMarkets.searchByText(q);
            return res.json({ success: true, data: result });
        }
        res.status(400).json({ success: false, error: 'يجب توفير code أو q' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/markets/:marketId/trade-flow/:productId
 * خريطة التجارة العالمية لمنتج
 */
router.get('/markets/:marketId/trade-flow/:productId', (req, res) => {
    try {
        if (!globalMarkets) return res.status(503).json({ success: false, error: 'محرك الأسواق غير متوفر' });
        const tradeFlow = globalMarkets.getTradeFlowMap(req.params.marketId, req.params.productId);
        if (!tradeFlow) return res.status(404).json({ success: false, error: 'لا توجد بيانات' });
        res.json({ success: true, data: tradeFlow });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/markets/trade-cost
 * تقدير التكلفة التجارية
 */
router.post('/markets/trade-cost', (req, res) => {
    try {
        if (!globalMarkets) return res.status(503).json({ success: false, error: 'محرك الأسواق غير متوفر' });
        const cost = globalMarkets.estimateTradeCost(req.body);
        res.json({ success: true, data: cost });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Logistics PL Stack
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/scm/logistics/pl-types
 * جميع أنواع PL المتاحة
 */
router.get('/logistics/pl-types', (req, res) => {
    try {
        if (!plStack) return res.status(503).json({ success: false, error: 'محرك اللوجستيات غير متوفر' });
        const types = plStack.getAllPLTypes();
        res.json({ success: true, count: types.length, data: types });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/logistics/pl-types/:plType
 * تفاصيل نوع PL محدد
 */
router.get('/logistics/pl-types/:plType', (req, res) => {
    try {
        if (!plStack) return res.status(503).json({ success: false, error: 'محرك اللوجستيات غير متوفر' });
        const def = plStack.getPLDefinition(req.params.plType);
        if (!def) return res.status(404).json({ success: false, error: 'نوع PL غير موجود' });
        res.json({ success: true, data: def });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/logistics/recommend-pl
 * اقتراح مستوى PL المناسب
 */
router.post('/logistics/recommend-pl', (req, res) => {
    try {
        if (!plStack) return res.status(503).json({ success: false, error: 'محرك اللوجستيات غير متوفر' });
        const recommendation = plStack.recommendPLLevel(req.body);
        res.json({ success: true, data: recommendation });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/logistics/shipments
 * إنشاء طلب شحن جديد
 */
router.post('/logistics/shipments', (req, res) => {
    try {
        if (!plStack) return res.status(503).json({ success: false, error: 'محرك اللوجستيات غير متوفر' });
        const shipment = plStack.createShipmentRequest(req.body);
        res.status(201).json({ success: true, data: shipment });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/logistics/estimate-cost
 * تقدير تكلفة الشحن
 */
router.post('/logistics/estimate-cost', (req, res) => {
    try {
        if (!plStack) return res.status(503).json({ success: false, error: 'محرك اللوجستيات غير متوفر' });
        const estimate = plStack.estimateShipmentCost(req.body);
        res.json({ success: true, data: estimate });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/logistics/specialized/:marketType
 * لوجستيات متخصصة لنوع سوق
 */
router.get('/logistics/specialized/:marketType', (req, res) => {
    try {
        if (!plStack) return res.status(503).json({ success: false, error: 'محرك اللوجستيات غير متوفر' });
        const spec = plStack.getSpecializedLogistics(req.params.marketType);
        if (!spec) return res.status(404).json({ success: false, error: 'لا توجد بيانات لهذا النوع' });
        res.json({ success: true, data: spec });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// ERP Integration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/scm/integrations/connectors
 * جميع موصلات ERP المتاحة
 */
router.get('/integrations/connectors', (req, res) => {
    try {
        if (!erpHub) return res.status(503).json({ success: false, error: 'مركز التكامل غير متوفر' });
        const connectors = erpHub.getAllConnectors();
        res.json({ success: true, count: connectors.length, data: connectors });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/integrations/connectors/:connectorId
 * تفاصيل موصل ERP محدد
 */
router.get('/integrations/connectors/:connectorId', (req, res) => {
    try {
        if (!erpHub) return res.status(503).json({ success: false, error: 'مركز التكامل غير متوفر' });
        const connector = erpHub.getConnector(req.params.connectorId);
        if (!connector) return res.status(404).json({ success: false, error: 'الموصل غير موجود' });
        res.json({ success: true, data: connector });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/integrations/connections
 * تسجيل اتصال ERP جديد
 */
router.post('/integrations/connections', (req, res) => {
    try {
        if (!erpHub) return res.status(503).json({ success: false, error: 'مركز التكامل غير متوفر' });
        const { tenantId, erpType, config } = req.body;
        if (!tenantId || !erpType) return res.status(400).json({ success: false, error: 'tenantId و erpType مطلوبان' });
        const result = erpHub.registerERPConnection(tenantId, erpType, config || {});
        res.status(201).json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/integrations/webhooks
 * تسجيل Webhook
 */
router.post('/integrations/webhooks', (req, res) => {
    try {
        if (!erpHub) return res.status(503).json({ success: false, error: 'مركز التكامل غير متوفر' });
        const { tenantId, config } = req.body;
        if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId مطلوب' });
        const result = erpHub.registerWebhook(tenantId, config || {});
        res.status(201).json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/integrations/stats/:tenantId
 * إحصائيات التكامل لمستأجر
 */
router.get('/integrations/stats/:tenantId', (req, res) => {
    try {
        if (!erpHub) return res.status(503).json({ success: false, error: 'مركز التكامل غير متوفر' });
        const stats = erpHub.getIntegrationStats(req.params.tenantId);
        res.json({ success: true, data: stats });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/integrations/audit-log
 * سجل التدقيق
 */
router.get('/integrations/audit-log', (req, res) => {
    try {
        if (!erpHub) return res.status(503).json({ success: false, error: 'مركز التكامل غير متوفر' });
        const log = erpHub.getAuditLog(req.query);
        res.json({ success: true, count: log.length, data: log });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// AI Intelligence
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/scm/ai/models
 * نماذج AI المتاحة
 */
router.get('/ai/models', (req, res) => {
    try {
        if (!aiSCM) return res.status(503).json({ success: false, error: 'محرك الذكاء الاصطناعي غير متوفر' });
        const models = aiSCM.getAvailableModels();
        res.json({ success: true, count: models.length, data: models });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/ai/recommend-supplier
 * توصية المورد
 */
router.post('/ai/recommend-supplier', (req, res) => {
    try {
        if (!aiSCM) return res.status(503).json({ success: false, error: 'محرك الذكاء الاصطناعي غير متوفر' });
        const result = aiSCM.recommendSuppliers(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/ai/optimize-route
 * تحسين مسار النقل
 */
router.post('/ai/optimize-route', (req, res) => {
    try {
        if (!aiSCM) return res.status(503).json({ success: false, error: 'محرك الذكاء الاصطناعي غير متوفر' });
        const result = aiSCM.optimizeRoute(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/ai/assess-risk
 * تقييم مخاطر سلسلة الإمداد
 */
router.post('/ai/assess-risk', (req, res) => {
    try {
        if (!aiSCM) return res.status(503).json({ success: false, error: 'محرك الذكاء الاصطناعي غير متوفر' });
        const result = aiSCM.assessRisk(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/ai/forecast-demand
 * توقع الطلب
 */
router.post('/ai/forecast-demand', (req, res) => {
    try {
        if (!aiSCM) return res.status(503).json({ success: false, error: 'محرك الذكاء الاصطناعي غير متوفر' });
        const result = aiSCM.forecastDemand(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/ai/classify-scrap
 * تصنيف السكراب تلقائياً
 */
router.post('/ai/classify-scrap', (req, res) => {
    try {
        if (!aiSCM) return res.status(503).json({ success: false, error: 'محرك الذكاء الاصطناعي غير متوفر' });
        const result = aiSCM.classifyScrap(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/ai/analyze-prices
 * تحليل الأسعار
 */
router.post('/ai/analyze-prices', (req, res) => {
    try {
        if (!aiSCM) return res.status(503).json({ success: false, error: 'محرك الذكاء الاصطناعي غير متوفر' });
        const result = aiSCM.analyzePrices(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/ai/monitor-sla
 * مراقبة SLA
 */
router.post('/ai/monitor-sla', (req, res) => {
    try {
        if (!aiSCM) return res.status(503).json({ success: false, error: 'محرك الذكاء الاصطناعي غير متوفر' });
        const result = aiSCM.monitorSLAs(req.body.shipments || [], req.body.slaTargets || {});
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/ai/executive-summary
 * توليد تلخيص تنفيذي
 */
router.post('/ai/executive-summary', (req, res) => {
    try {
        if (!aiSCM) return res.status(503).json({ success: false, error: 'محرك الذكاء الاصطناعي غير متوفر' });
        const result = aiSCM.generateExecutiveSummary(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Tenants & Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/scm/tenants
 * تسجيل مستأجر جديد (عميل مؤسسي)
 */
router.post('/tenants', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const result = sgscOS.registerTenant(req.body);
        res.status(201).json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/tenants/:tenantId
 */
router.get('/tenants/:tenantId', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const tenant = sgscOS.getTenant(req.params.tenantId);
        if (!tenant) return res.status(404).json({ success: false, error: 'المستأجر غير موجود' });
        res.json({ success: true, data: tenant });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/rfq
 * إنشاء RFQ جديد
 */
router.post('/rfq', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const rfq = sgscOS.createRFQ(req.body);
        res.status(201).json({ success: true, data: rfq });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/rfq/:rfqId/respond
 * الرد على RFQ
 */
router.post('/rfq/:rfqId/respond', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const result = sgscOS.respondToRFQ(req.params.rfqId, req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/orders
 * إنشاء طلب شراء / بيع
 */
router.post('/orders', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const order = sgscOS.createOrder(req.body);
        res.status(201).json({ success: true, data: order });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/orders/:orderId
 */
router.get('/orders/:orderId', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const order = sgscOS.getOrder(req.params.orderId);
        if (!order) return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
        res.json({ success: true, data: order });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * PATCH /api/scm/orders/:orderId/status
 * تحديث حالة الطلب
 */
router.patch('/orders/:orderId/status', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const { status, actorId, note } = req.body;
        const order = sgscOS.updateOrderStatus(req.params.orderId, status, actorId, note);
        res.json({ success: true, data: order });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/shipments
 * إنشاء شحنة جديدة
 */
router.post('/shipments', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const shipment = sgscOS.createShipment(req.body);
        res.status(201).json({ success: true, data: shipment });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * PATCH /api/scm/shipments/:shipmentId/milestone
 * تحديث مرحلة الشحنة
 */
router.patch('/shipments/:shipmentId/milestone', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const { milestone, location, note } = req.body;
        const shipment = sgscOS.updateShipmentMilestone(req.params.shipmentId, milestone, location, note);
        res.json({ success: true, data: shipment });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Control Tower
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/scm/control-tower
 * لوحة بيانات برج التحكم
 */
router.get('/control-tower', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const dashboard = sgscOS.getControlTowerDashboard(req.query.tenantId || null);
        res.json({ success: true, data: dashboard });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/portals
 * قائمة البوابات المتخصصة
 */
router.get('/portals', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const portals = sgscOS.getPortals();
        res.json({ success: true, count: portals.length, data: portals });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/regions
 * المناطق الجغرافية والشبكة العالمية
 */
router.get('/regions', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const regions = sgscOS.getRegions();
        res.json({ success: true, data: regions });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/roles
 * أدوار المستخدمين
 */
router.get('/roles', (req, res) => {
    try {
        if (!sgscOS) return res.status(503).json({ success: false, error: 'النظام الأساسي غير متوفر' });
        const roles = sgscOS.getTenantRoles();
        res.json({ success: true, data: roles });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// شبكة شيخة العصبية لسلاسل المداد والتوريد — Neural SCM Engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/scm/neural/status
 * حالة الشبكة العصبية لسلاسل المداد
 */
router.get('/neural/status', (req, res) => {
    try {
        if (!neuralSCM) return res.status(503).json({ success: false, error: 'الشبكة العصبية غير متوفرة' });
        res.json({ success: true, data: neuralSCM.status() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/neural/analyze
 * تحليل شامل لسلسلة المداد عبر الشبكة العصبية
 *
 * Body: {
 *   demandLevel, priceIndex, supplierScore, leadTimeDays, qualityRate,
 *   inventoryLevel, logisticsCostPct, riskFactor, geoRisk,
 *   complianceScore, marketVolatility, shariaCompliant,
 *   historicalDemand[], demandFactors{}, supplier{}, inventoryParams{}, riskParams{}
 * }
 */
router.post('/neural/analyze', (req, res) => {
    try {
        if (!neuralSCM) return res.status(503).json({ success: false, error: 'الشبكة العصبية غير متوفرة' });
        const result = neuralSCM.analyze(req.body);
        const status = result.success ? 200 : 422;
        res.status(status).json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/neural/forecast-demand
 * توقع الطلب بالشبكة العصبية (EWM + عوامل خارجية)
 *
 * Body: { historicalDemand: number[], factors: { seasonal, growth, risk } }
 */
router.post('/neural/forecast-demand', (req, res) => {
    try {
        if (!neuralSCM) return res.status(503).json({ success: false, error: 'الشبكة العصبية غير متوفرة' });
        const { historicalDemand, factors } = req.body;
        if (!Array.isArray(historicalDemand) || historicalDemand.length === 0) {
            return res.status(400).json({ success: false, error: 'historicalDemand مطلوب كمصفوفة غير فارغة' });
        }
        const result = neuralSCM.forecastDemand(historicalDemand, factors || {});
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/neural/score-supplier
 * تسجيل مورد بمعايير متعددة
 *
 * Body: { id, qualityRate, otdRate, priceIndex, complianceScore, shariaCompliant }
 */
router.post('/neural/score-supplier', (req, res) => {
    try {
        if (!neuralSCM) return res.status(503).json({ success: false, error: 'الشبكة العصبية غير متوفرة' });
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, error: 'بيانات المورد مطلوبة' });
        }
        const result = neuralSCM.scoreSupplier(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/neural/optimize-inventory
 * تحسين المخزون بنموذج EOQ
 *
 * Body: { annualDemand, orderCost, holdingCostPct, unitPrice, leadTimeDays, demandStdDev, serviceLevelZ }
 */
router.post('/neural/optimize-inventory', (req, res) => {
    try {
        if (!neuralSCM) return res.status(503).json({ success: false, error: 'الشبكة العصبية غير متوفرة' });
        const result = neuralSCM.optimizeInventory(req.body || {});
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/neural/assess-risk
 * تقدير مخاطر سلسلة المداد
 *
 * Body: { supplierConcentration, geoPoliticalRisk, leadTimeVariability,
 *         demandVolatility, qualityFailureRate, supplierFinancialHealth, complianceScore }
 */
router.post('/neural/assess-risk', (req, res) => {
    try {
        if (!neuralSCM) return res.status(503).json({ success: false, error: 'الشبكة العصبية غير متوفرة' });
        const result = neuralSCM.assessRisk(req.body || {});
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/neural/sharia-check
 * فحص الامتثال الشرعي لمعاملة سلسلة مداد
 *
 * Body: { interestRate, riba, unknownQuantity, unknownPrice, consent,
 *         prohibitedGoods, delayedGoldSilver, speculativeContract }
 */
router.post('/neural/sharia-check', (req, res) => {
    try {
        if (!neuralSCM) return res.status(503).json({ success: false, error: 'الشبكة العصبية غير متوفرة' });
        const result = neuralSCM.shariaFilter(req.body || {});
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/scm/neural/weights/export
 * تصدير أوزان الشبكة العصبية
 */
router.get('/neural/weights/export', (req, res) => {
    try {
        if (!neuralSCM) return res.status(503).json({ success: false, error: 'الشبكة العصبية غير متوفرة' });
        const weights = neuralSCM.exportWeights();
        res.json({ success: true, data: weights });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/scm/neural/weights/import
 * استيراد أوزان الشبكة العصبية
 */
router.post('/neural/weights/import', (req, res) => {
    try {
        if (!neuralSCM) return res.status(503).json({ success: false, error: 'الشبكة العصبية غير متوفرة' });
        neuralSCM.importWeights(req.body);
        res.json({ success: true, message: 'تم استيراد الأوزان بنجاح' });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

module.exports = router;
