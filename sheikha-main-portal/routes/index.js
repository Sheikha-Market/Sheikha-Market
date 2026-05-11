/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🛤️ فهرس المسارات الرئيسية
 *  Routes Index
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();

// استيراد المسارات الفرعية
const apiRoutes              = require('./api');
const authRoutes             = require('./auth');
const marketRoutes           = require('./market');
const arabicRoutes           = require('./arabic');
const shariaRoutes           = require('./sharia');
const aiRoutes               = require('./ai');
const organizationsRoutes    = require('./organizations');
const marketsOfMarketsRoutes = require('./markets-of-markets');
const governanceRoutes       = require('./governance');
const ipRoutes               = require('./intellectual-property');
const logicsRoutes           = require('./logics');
const pipelineRoutes         = require('./pipeline.routes');
// ─── نواة السوق MVP ──────────────────────────────────────────────────────────
const productsRoutes         = require('./products');
const ordersRoutes           = require('./orders');
const suppliersRoutes        = require('./suppliers');
const analyticsRoutes        = require('./analytics');
const dashboardRoutes        = require('./dashboard');

// ─── المسارات الرئيسية ────────────────────────────────────────────────────────

// API الرئيسية
router.use('/api', apiRoutes);

// المصادقة
router.use('/api/auth', authRoutes);

// السوق (القديم — المعادن والسكراب)
router.use('/api/market', marketRoutes);

// اللغة العربية
router.use('/api/arabic', arabicRoutes);

// الشريعة
router.use('/api/sharia', shariaRoutes);

// الذكاء الاصطناعي
router.use('/api/ai', aiRoutes);

// ─── منظومة المنظمات والأسواق ───────────────────────────────────────────────

// منظمة شيخة للمنظمات (org-of-orgs)
router.use('/api/organizations', organizationsRoutes);

// سوق شيخة للأسواق (market-of-markets) — حقيقي + إلكتروني + رقمي
router.use('/api/markets-of-markets', marketsOfMarketsRoutes);

// ─── الحوكمة والملكية الفكرية ────────────────────────────────────────────────

// الحوكمة الشرعية — الكتاب والسنة والخلفاء الراشدون
router.use('/api/governance', governanceRoutes);

// الملكية الفكرية الكاملة لسوق شيخة ©️
router.use('/api/ip', ipRoutes);

// ─── المنطق الجامع (21 منطقاً: 7 أصلية + 13 موسّعة + المنطق الأعلى) ──────────
router.use('/api/logics', logicsRoutes);

// ─── محرك شيخة الموحّد: Pipeline + Factory + Neural Network ──────────────────
router.use('/api/engine', pipelineRoutes);

// ─── نواة السوق MVP — كتالوج / طلبات / موردون / تحليلات / لوحة تحكم ──────────

// كتالوج المنتجات الكامل (النظام الجديد المتكامل)
// GET /api/catalog          — قائمة المنتجات (بحث + فلاتر + صفحات)
// GET /api/catalog/categories — التصنيفات
// GET /api/catalog/search   — بحث نصي
// GET /api/catalog/:id      — تفاصيل منتج
// POST /api/catalog         — إضافة منتج (مورد)
// PUT /api/catalog/:id      — تعديل منتج
// DELETE /api/catalog/:id   — حذف منتج
// GET /api/catalog/supplier/my — منتجاتي
router.use('/api/catalog', productsRoutes);

// إدارة الطلبات التجارية الكاملة (النظام الجديد)
// GET /api/market-orders            — قائمة الطلبات (حسب الدور)
// POST /api/market-orders           — إنشاء طلب
// GET /api/market-orders/:id        — تفاصيل طلب
// PUT /api/market-orders/:id/status — تحديث الحالة
// PUT /api/market-orders/:id/cancel — إلغاء الطلب
// GET /api/market-orders/buyer/my   — طلباتي كمشتري
// GET /api/market-orders/supplier/my — طلباتي كمورد
router.use('/api/market-orders', ordersRoutes);

// إدارة الموردين
// GET /api/suppliers         — قائمة الموردين
// GET /api/suppliers/me      — ملفي كمورد
// POST /api/suppliers/register — تسجيل كمورد
// GET /api/suppliers/:id     — ملف مورد عام
// PUT /api/suppliers/me      — تعديل ملفي
// POST /api/suppliers/:id/rate — تقييم مورد
// PUT /api/suppliers/:id/verify — تحقق (مشرف)
router.use('/api/suppliers', suppliersRoutes);

// التحليلات ومؤشرات الأداء الحقيقية
// GET /api/market-analytics/overview — نظرة شاملة (مشرف)
// GET /api/market-analytics/supplier — تحليلات المورد
// GET /api/market-analytics/buyer   — تحليلات المشتري
// GET /api/market-analytics/market  — مؤشرات السوق العامة
router.use('/api/market-analytics', analyticsRoutes);

// لوحة التحكم المركزية
router.use('/api/dashboard', dashboardRoutes);

// ─── مسار الحالة ──────────────────────────────────────────────────────────────

router.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0'
    });
});

module.exports = router;
