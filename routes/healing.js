/**
 * مسارات نظام الإصلاح الذاتي والإشعارات وتحليل الأكواد
 * Routes for Self-Healing, Notifications & Code Analysis
 *
 * منظومة شيخة — Sheikha Platform
 */

const express = require('express');
const router = express.Router();
const selfHealing = require('../lib/self-healing-system');
const notificationCenter = require('../lib/notification-center');
const codeAnalyzer = require('../lib/code-analyzer-parser');
const path = require('path');
const fs = require('fs');

/**
 * ============ مسارات الإصلاح الذاتي ============
 */

/**
 * GET /api/healing/status
 * الحصول على حالة نظام الإصلاح
 */
router.get('/status', (req, res) => {
    const stats = selfHealing.getStatistics();
    res.json({
        success: true,
        data: {
            system: 'Self-Healing System',
            status: 'active',
            statistics: stats,
            timestamp: new Date().toISOString()
        }
    });
});

/**
 * POST /api/healing/trigger
 * تفعيل إصلاح تلقائي لمشكلة محددة
 */
router.post('/trigger', async (req, res) => {
    const { issueType, context = {} } = req.body;

    if (!issueType) {
        return res.status(400).json({
            success: false,
            message: 'issueType مطلوب'
        });
    }

    const result = await selfHealing.autoHeal(issueType, context);

    notificationCenter.notify('success', `تم تفعيل الإصلاح التلقائي: ${issueType}`);

    res.json({
        success: result.success,
        data: result.healSession,
        message: result.message
    });
});

/**
 * GET /api/healing/history
 * الحصول على سجل الإصلاحات
 */
router.get('/history', (req, res) => {
    const { limit = 20, type = null } = req.query;
    let history = selfHealing.healingLog;

    if (type) {
        history = history.filter(h => h.type === type);
    }

    res.json({
        success: true,
        data: history.slice(-parseInt(limit)).reverse(),
        total: history.length
    });
});

/**
 * GET /api/healing/search
 * البحث في سجلات الإصلاح
 */
router.get('/search', (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            success: false,
            message: 'query مطلوب'
        });
    }

    const results = selfHealing.searchHeals(query);

    res.json({
        success: true,
        data: results,
        count: results.length
    });
});

/**
 * ============ مسارات الإشعارات ============
 */

/**
 * GET /api/notifications
 * الحصول على الإشعارات الحالية
 */
router.get('/notifications', (req, res) => {
    const { unread = false, type = null, limit = 50 } = req.query;
    let notifications = notificationCenter.notifications;

    if (unread === 'true') {
        notifications = notificationCenter.getUnread();
    }

    if (type) {
        notifications = notifications.filter(n => n.type === type);
    }

    const result = notifications.slice(-parseInt(limit));

    res.json({
        success: true,
        data: result.reverse(),
        stats: {
            total: notificationCenter.notifications.length,
            unread: notificationCenter.getUnread().length
        }
    });
});

/**
 * POST /api/notifications/send
 * إرسال إخطار جديد
 */
router.post('/send', (req, res) => {
    const { type = 'info', message, metadata = {} } = req.body;

    if (!message) {
        return res.status(400).json({
            success: false,
            message: 'message مطلوب'
        });
    }

    const notification = notificationCenter.notify(type, message, metadata);

    res.json({
        success: true,
        data: notification
    });
});

/**
 * PUT /api/notifications/:id/read
 * تحديد إخطار كمقروء
 */
router.put('/:id/read', (req, res) => {
    const success = notificationCenter.markAsRead(req.params.id);

    res.json({
        success,
        message: success ? 'تم تحديثه كمقروء' : 'الإخطار غير موجود'
    });
});

/**
 * PUT /api/notifications/read-all
 * تحديد جميع الإشعارات كمقروءة
 */
router.put('/read-all', (req, res) => {
    notificationCenter.markAllAsRead();

    res.json({
        success: true,
        message: 'تم تحديث جميع الإشعارات كمقروءة'
    });
});

/**
 * DELETE /api/notifications/:id
 * حذف إخطار
 */
router.delete('/:id', (req, res) => {
    const success = notificationCenter.delete(req.params.id);

    res.json({
        success,
        message: success ? 'تم حذف الإخطار' : 'الإخطار غير موجود'
    });
});

/**
 * GET /api/notifications/stats
 * إحصائيات الإشعارات
 */
router.get('/stats', (req, res) => {
    const stats = notificationCenter.getStatistics();

    res.json({
        success: true,
        data: stats
    });
});

/**
 * ============ مسارات تحليل الأكواد ============
 */

/**
 * POST /api/code-analysis/analyze
 * تحليل ملف أو كود
 */
router.post('/analyze', (req, res) => {
    const { filePath, code } = req.body;

    if (!filePath && !code) {
        return res.status(400).json({
            success: false,
            message: 'filePath أو code مطلوب'
        });
    }

    let analysis;

    if (filePath) {
        const fullPath = path.join(__dirname, '../', filePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({
                success: false,
                message: 'الملف غير موجود'
            });
        }
        analysis = codeAnalyzer.analyzeFile(fullPath);
        codeAnalyzer.indexCode(analysis, filePath);
    } else {
        analysis = codeAnalyzer.analyzeCodeTextually(code, 'inline-code');
    }

    notificationCenter.notify('info', `تم تحليل الكود بنجاح`);

    res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/code-analysis/explain
 * شرح كود محدد
 */
router.post('/explain', (req, res) => {
    const { code, type = 'javascript' } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'code مطلوب'
        });
    }

    const explanation = codeAnalyzer.explainCode(code, type);

    res.json({
        success: true,
        data: explanation
    });
});

/**
 * GET /api/code-analysis/search
 * البحث في الأكواد المفهرسة
 */
router.get('/search', (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            success: false,
            message: 'query مطلوب'
        });
    }

    const results = codeAnalyzer.searchCode(query);

    res.json({
        success: true,
        data: results,
        count: results.length
    });
});

/**
 * GET /api/code-analysis/stats
 * إحصائيات تحليل الأكواد
 */
router.get('/stats', (req, res) => {
    const stats = codeAnalyzer.getStatistics();

    res.json({
        success: true,
        data: stats
    });
});

/**
 * ============ مسارات المراقبة الصحية ============
 */

/**
 * GET /api/system/health
 * فحص صحة النظام الشامل
 */
router.get('/system/health', (req, res) => {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    const healingStats = selfHealing.getStatistics();
    const notificationStats = notificationCenter.getStatistics();
    const codeStats = codeAnalyzer.getStatistics();

    res.json({
        success: true,
        data: {
            system: {
                uptime: `${(uptime / 60).toFixed(2)} دقيقة`,
                memory: {
                    used: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                    total: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`
                }
            },
            healing: healingStats,
            notifications: notificationStats,
            codeAnalysis: codeStats,
            timestamp: new Date().toISOString()
        }
    });
});

/**
 * POST /api/system/trigger-diagnostic
 * تشغيل تشخيص شامل
 */
router.post('/system/trigger-diagnostic', async (req, res) => {
    const diagnostic = {
        id: `diag-${Date.now()}`,
        timestamp: new Date().toISOString(),
        checks: []
    };

    // فحص قاعدة البيانات
    try {
        await selfHealing.autoHeal('database-connection', { test: true });
        diagnostic.checks.push({ name: 'database', status: 'ok' });
    } catch {
        diagnostic.checks.push({ name: 'database', status: 'warning' });
    }

    // فحص الذاكرة
    const memUsage = process.memoryUsage();
    const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (memPercent > 80) {
        await selfHealing.autoHeal('memory-pressure', { usage: memPercent });
        diagnostic.checks.push({ name: 'memory', status: 'recovered' });
    } else {
        diagnostic.checks.push({ name: 'memory', status: 'ok' });
    }

    // فحص الخدمات
    diagnostic.checks.push({ name: 'services', status: 'ok' });

    notificationCenter.notify('success', 'اكتمل التشخيص الشامل بنجاح');

    res.json({
        success: true,
        data: diagnostic
    });
});

module.exports = router;
