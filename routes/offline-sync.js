// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 Offline Sync Routes — مزامنة العمليات المعلقة + حالة الاتصال
// ═══════════════════════════════════════════════════════════════════════════════
// GET  /api/offline/status        — حالة الاتصال الكاملة
// POST /api/offline/sync          — استقبال عمليات معلقة من المتصفح
// GET  /api/offline/queue         — قائمة العمليات المعلقة (للمدير)
// POST /api/offline/queue/:id/ack — تأكيد معالجة عملية
// DELETE /api/offline/queue/:id   — حذف عملية من القائمة
// ═══════════════════════════════════════════════════════════════════════════════

'use strict';

const express = require('express');
const router  = express.Router();

const {
    connectivity,
    homeGuard,
    syncQueue,
    responseCache,
    status: offlineStatus,
} = require('../lib/sheikha-offline-mode');

// ─── GET /api/offline/status ──────────────────────────────────────────────────
// حالة الاتصال الشاملة — يعمل دائماً حتى offline
router.get('/status', (req, res) => {
    res.json({
        success:   true,
        nameAr:    'حالة الاتصال والشبكة',
        timestamp: new Date().toISOString(),
        ...offlineStatus(),
        serverInfo: {
            uptime:     Math.round(process.uptime()),
            pid:        process.pid,
            nodeVersion: process.version,
        },
    });
});

// ─── POST /api/offline/sync ───────────────────────────────────────────────────
// يستقبل عمليات معلقة أرسلها المتصفح (Background Sync / manual)
router.post('/sync', (req, res) => {
    const operations = Array.isArray(req.body)
        ? req.body
        : req.body && req.body.operations
            ? req.body.operations
            : req.body
                ? [req.body]
                : [];

    if (!operations.length) {
        return res.status(400).json({
            success: false,
            messageAr: 'لا توجد عمليات للمزامنة',
        });
    }

    const results = [];
    for (const op of operations) {
        if (!op || typeof op !== 'object') continue;
        const id = syncQueue.enqueue({
            type:      op.type      || 'unknown',
            method:    op.method    || 'POST',
            path:      op.path      || '/',
            payload:   op.payload   || {},
            clientId:  op.clientId  || null,
            createdAt: op.createdAt || new Date().toISOString(),
        });
        results.push({ id, status: 'queued' });
    }

    res.json({
        success:   true,
        queued:    results.length,
        totalPending: syncQueue.size(),
        results,
        messageAr: `✅ ${results.length} عملية في قائمة المزامنة`,
    });
});

// ─── GET /api/offline/queue ───────────────────────────────────────────────────
// قائمة العمليات المعلقة (للمراقبة)
router.get('/queue', (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    res.json({
        success: true,
        total:   syncQueue.size(),
        items:   syncQueue.peek(limit),
    });
});

// ─── POST /api/offline/queue/:id/ack ─────────────────────────────────────────
// تأكيد معالجة ناجحة لعملية معلقة
router.post('/queue/:id/ack', (req, res) => {
    syncQueue.remove(req.params.id);
    res.json({
        success:  true,
        removed:  req.params.id,
        remaining: syncQueue.size(),
    });
});

// ─── DELETE /api/offline/queue/:id ───────────────────────────────────────────
router.delete('/queue/:id', (req, res) => {
    syncQueue.remove(req.params.id);
    res.json({ success: true, removed: req.params.id });
});

// ─── GET /api/offline/cache/stats ────────────────────────────────────────────
router.get('/cache/stats', (req, res) => {
    res.json({
        success: true,
        entries: responseCache.size(),
    });
});

module.exports = router;
