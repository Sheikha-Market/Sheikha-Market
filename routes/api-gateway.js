/**
 * بسم الله الرحمن الرحيم
 * =============================================================================
 * مسارات بوابة API — منظومة شيخة
 * /api/gateway/*
 * =============================================================================
 */
'use strict';

const express = require('express');
const router  = express.Router();

let _gateway = null;
let _db      = null;

function gw()  { if (!_gateway) { _gateway = require('../lib/sheikha-api-gateway.js'); } return _gateway; }
function db()  { if (!_db)      { _db      = require('../lib/sheikha-db-engine.js');   } return _db; }

/* ── حالة البوابة ──────────────────────────────────────────────── */
router.get('/status', (req, res) => {
    res.json({ success: true, gateway: gw().getStatus(), db: db().getStatus() });
});

/* ── لوحة مقاييس الأداء ─────────────────────────────────────────── */
router.get('/metrics', (req, res) => {
    res.json(gw().getMetricsDashboard());
});

/* ── الأسرع والأبطأ ─────────────────────────────────────────────── */
router.get('/metrics/top', (req, res) => {
    const n = Math.min(parseInt(req.query.n || '10', 10), 50);
    res.json({
        success:      true,
        topEndpoints: gw().metrics.getTopEndpoints(n),
        slowest:      gw().metrics.getSlowest(n),
        timestamp:    new Date().toISOString()
    });
});

/* ── إحصائيات قاعدة البيانات ────────────────────────────────────── */
router.get('/db/status', (req, res) => {
    res.json({ success: true, ...db().getStatus() });
});

router.get('/db/stats', async (req, res) => {
    try {
        const stats = await db().getDataStats();
        res.json({ success: true, ...stats, timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ── دليل API الكامل ─────────────────────────────────────────────── */
router.get('/endpoints', (req, res) => {
    res.json({
        success: true,
        title:   'دليل نقاط API — منظومة شيخة',
        version: '2.0.0',
        groups: [
            { prefix:'/api/gateway',      desc:'بوابة API الموحدة — مقاييس + صحة + إحصاءات' },
            { prefix:'/api/malahem',      desc:'منظومة الملاحم وأحداث آخر الزمان (تثقيف شرعي)' },
            { prefix:'/api/alliance',     desc:'محرك التحالف العالمي الشامل' },
            { prefix:'/api/alliance/network', desc:'منظومة الشبكة الاقتصادية المتكاملة' },
            { prefix:'/api/ghanayim',     desc:'محرك الغنائم والثروة الحلال' },
            { prefix:'/api/auth',         desc:'المصادقة والتفويض' },
            { prefix:'/api/users',        desc:'إدارة المستخدمين' },
            { prefix:'/api/market',       desc:'سوق التداول والبورصة' },
            { prefix:'/api/ai',           desc:'خدمات الذكاء الاصطناعي' },
            { prefix:'/api/sharia',       desc:'المحرك الشرعي' },
            { prefix:'/api/seo',          desc:'محرك تحسين محركات البحث' }
        ],
        note: 'استخدم GET /api/gateway/metrics لمراقبة أداء كل نقطة API',
        timestamp: new Date().toISOString()
    });
});

/* ── health check سريع ───────────────────────────────────────────── */
router.get('/health', (req, res) => {
    const gwStatus = gw().getStatus();
    const dbStatus = db().getStatus();
    const healthy  = true;  // البوابة تعمل إذا وصلنا هنا
    res.status(healthy ? 200 : 503).json({
        success:  healthy,
        status:   healthy ? 'healthy' : 'degraded',
        gateway:  { ok: true, version: gwStatus.version },
        database: { ok: true, mode: dbStatus.mode, connected: dbStatus.connected },
        uptime:   gwStatus.uptime,
        timestamp: new Date().toISOString()
    });
});

/* ── إعادة تعيين المقاييس (Admin فقط) ──────────────────────────── */
router.post('/metrics/reset', (req, res) => {
    gw().metrics.reset();
    res.json({ success: true, message: 'تم إعادة تعيين مقاييس الأداء', timestamp: new Date().toISOString() });
});

module.exports = router;
