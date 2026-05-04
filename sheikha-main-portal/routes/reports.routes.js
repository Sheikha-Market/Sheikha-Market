/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📝 مسارات التقارير — Reports Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ ﴾
 * — التوبة: 105
 *
 * المسارات:
 *   POST /api/reports/write             — كتابة تقرير من أي سيرفر
 *   GET  /api/reports/read/:serverId    — قراءة تقارير سيرفر محدد
 *   GET  /api/reports/report/:serverId/:reportId — تقرير واحد كامل
 *   GET  /api/reports/all               — كل التقارير من كل السيرفرات
 *   POST /api/reports/sync              — مزامنة التقارير بين السيرفرات
 *   GET  /api/reports/development       — تقارير التطوير فقط
 *   POST /api/reports/publish           — نشر على قناة التبادل
 *   GET  /api/reports/subscribe         — جلب رسائل القناة
 *   DELETE /api/reports/:serverId/:reportId — حذف تقرير
 *   GET  /api/reports/stats             — إحصائيات التقارير
 *   GET  /api/reports/status            — حالة النظام
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();

// ─── تحميل الوحدات ───────────────────────────────────────────────────────────
let reportWriter, reportBus;

try {
    reportWriter = require('../lib/sheikha-report-writer.js');
    console.log('✅ [REPORTS-ROUTES] كاتب التقارير محمّل');
} catch (e) {
    console.log('⚠️ [REPORTS-ROUTES] فشل تحميل كاتب التقارير:', e.message);
    reportWriter = null;
}

try {
    reportBus = require('../lib/sheikha-report-bus.js');
    console.log('✅ [REPORTS-ROUTES] قناة التبادل محمّلة');
} catch (e) {
    console.log('⚠️ [REPORTS-ROUTES] فشل تحميل قناة التبادل:', e.message);
    reportBus = null;
}

// ─── مساعد التحقق ────────────────────────────────────────────────────────────
function moduleCheck(res) {
    if (!reportWriter) {
        res.status(503).json({
            success: false,
            message: 'نظام التقارير غير متاح',
            timestamp: new Date().toISOString()
        });
        return false;
    }
    return true;
}

// ─── GET /status ─────────────────────────────────────────────────────────────
/**
 * حالة نظام التقارير
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        writer: reportWriter ? reportWriter.getStatus() : null,
        bus: reportBus ? reportBus.getStatus() : null,
        timestamp: new Date().toISOString()
    });
});

// ─── GET /stats ──────────────────────────────────────────────────────────────
/**
 * إحصائيات التقارير الكاملة
 */
router.get('/stats', (req, res) => {
    if (!moduleCheck(res)) return;
    try {
        res.json({ success: true, stats: reportWriter.getStats(), timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /write ─────────────────────────────────────────────────────────────
/**
 * كتابة تقرير من أي سيرفر
 * Body: { type, data, serverId? }
 */
router.post('/write', (req, res) => {
    if (!moduleCheck(res)) return;
    try {
        const { type = 'general', data = {}, serverId = 'default' } = req.body || {};
        const result = reportWriter.writeReport(type, data, serverId);
        res.json({ success: true, result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /read/:serverId ──────────────────────────────────────────────────────
/**
 * قراءة تقارير سيرفر محدد
 * Query: ?type=vision&limit=20
 */
router.get('/read/:serverId', (req, res) => {
    if (!moduleCheck(res)) return;
    try {
        const { serverId } = req.params;
        const { type, limit } = req.query;
        let reports = reportWriter.listReports(serverId, type || null);
        if (limit) reports = reports.slice(0, parseInt(limit, 10));
        res.json({ success: true, serverId, total: reports.length, reports, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /report/:serverId/:reportId ─────────────────────────────────────────
/**
 * قراءة تقرير واحد كامل
 */
router.get('/report/:serverId/:reportId', (req, res) => {
    if (!moduleCheck(res)) return;
    try {
        const { serverId, reportId } = req.params;
        const report = reportWriter.readReport(serverId, reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: 'التقرير غير موجود', timestamp: new Date().toISOString() });
        }
        res.json({ success: true, report, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /all ─────────────────────────────────────────────────────────────────
/**
 * كل التقارير من كل السيرفرات
 * Query: ?type=neural&limit=50
 */
router.get('/all', (req, res) => {
    if (!moduleCheck(res)) return;
    try {
        const { type, limit } = req.query;
        let reports = reportWriter.listAllReports(type || null);
        if (limit) reports = reports.slice(0, parseInt(limit, 10));
        res.json({ success: true, total: reports.length, reports, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /development ────────────────────────────────────────────────────────
/**
 * تقارير التطوير فقط من كل السيرفرات
 */
router.get('/development', (req, res) => {
    if (!moduleCheck(res)) return;
    try {
        const { limit } = req.query;
        let reports = reportWriter.listAllReports('development');
        if (limit) reports = reports.slice(0, parseInt(limit, 10));
        res.json({
            success: true,
            type: 'development',
            typeAr: 'تقارير التطوير',
            quranRef: '﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ ﴾ — التوبة: 105',
            total: reports.length,
            reports,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /publish ────────────────────────────────────────────────────────────
/**
 * نشر تقرير على قناة التبادل
 * Body: { serverId, type, data }
 */
router.post('/publish', (req, res) => {
    if (!moduleCheck(res)) return;
    try {
        const { serverId = 'default', type = 'general', data = {} } = req.body || {};
        const result = reportBus
            ? reportBus.publish(serverId, type, data)
            : reportWriter.writeReport(type, data, serverId);
        res.json({ success: true, result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /subscribe ───────────────────────────────────────────────────────────
/**
 * جلب رسائل القناة (HTTP polling)
 * Query: ?server=X&type=Y&limit=20
 */
router.get('/subscribe', (req, res) => {
    try {
        const { server = '*', type = '*', limit = 20 } = req.query;
        if (!reportBus) {
            return res.json({ success: true, messages: [], total: 0, timestamp: new Date().toISOString() });
        }
        const messages = reportBus.getMessages(server, type, parseInt(limit, 10));
        res.json({ success: true, server, type, total: messages.length, messages, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /sync ───────────────────────────────────────────────────────────────
/**
 * مزامنة التقارير بين السيرفرات
 * Body: { sourceServerId, targetServerId }
 */
router.post('/sync', (req, res) => {
    if (!moduleCheck(res)) return;
    try {
        const { sourceServerId = 'default', targetServerId } = req.body || {};
        if (!targetServerId) {
            return res.status(400).json({ success: false, message: 'targetServerId مطلوب', timestamp: new Date().toISOString() });
        }
        const result = reportBus
            ? reportBus.sync(sourceServerId, targetServerId)
            : { synced: false, message: 'قناة التبادل غير متاحة' };
        res.json({ success: true, result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── DELETE /:serverId/:reportId ─────────────────────────────────────────────
/**
 * حذف تقرير
 */
router.delete('/:serverId/:reportId', (req, res) => {
    if (!moduleCheck(res)) return;
    try {
        const { serverId, reportId } = req.params;
        const result = reportWriter.deleteReport(serverId, reportId);
        res.json({ success: true, result, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

module.exports = router;
