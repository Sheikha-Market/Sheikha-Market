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
// /api/engine/status        — حالة المحرك
// /api/engine/process       — تشغيل خط أنابيب
// /api/engine/create        — إنشاء كيان
// /api/engine/pipelines     — قائمة الأنابيب
// /api/engine/factory/*     — المصانع
// /api/engine/neural/*      — الشبكة العصبية
// /api/engine/signal        — إشارة عبر الشبكة
// /api/engine/learn         — دورة تعلم
router.use('/api/engine', pipelineRoutes);

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
