/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🛤️ فهرس المسارات الرئيسية
 *  Routes Index
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();

// استيراد المسارات الفرعية
const apiRoutes            = require('./api');
const authRoutes           = require('./auth');
const marketRoutes         = require('./market');
const arabicRoutes         = require('./arabic');
const shariaRoutes         = require('./sharia');
const aiRoutes             = require('./ai');
const organizationsRoutes  = require('./organizations');
const marketsOfMarketsRoutes = require('./markets-of-markets');

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

// ─── منظومة المنظمات والأسواق الجديدة ──────────────────────────────────────

// منظمة شيخة للمنظمات (org-of-orgs)
router.use('/api/organizations', organizationsRoutes);

// سوق شيخة للأسواق (market-of-markets) — حقيقي + إلكتروني + رقمي
router.use('/api/markets-of-markets', marketsOfMarketsRoutes);

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
