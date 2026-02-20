/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🛤️ فهرس المسارات الرئيسية
 *  Routes Index
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();

// استيراد المسارات الفرعية
const apiRoutes = require('./api');
const authRoutes = require('./auth');
const marketRoutes = require('./market');
const arabicRoutes = require('./arabic');
const shariaRoutes = require('./sharia');
const aiRoutes = require('./ai');

// ─── المسارات الرئيسية ────────────────────────────────────────────────────────

// API الرئيسية
router.use('/api', apiRoutes);

// المصادقة
router.use('/api/auth', authRoutes);

// السوق
router.use('/api/market', marketRoutes);

// اللغة العربية
router.use('/api/arabic', arabicRoutes);

// الشريعة
router.use('/api/sharia', shariaRoutes);

// الذكاء الاصطناعي
router.use('/api/ai', aiRoutes);

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
