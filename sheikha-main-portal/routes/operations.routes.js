'use strict';
/**
 * 🔧 Sheikha Operational Routes
 * مسارات التشغيل المتقدمة
 * - /api/operations/persistence/* — إدارة الأحداث المحفوظة
 * - /api/operations/encoding/* — إدارة ترميز الوسائط
 * - /api/operations/queue/* — إدارة قائمة المعالجة
 */

const express = require('express');
const router = express.Router();
const { RealtimePersistence } = require('../lib/sheikha-realtime-persistence');
const { SheikhaEncodingHub } = require('../lib/sheikha-encoding-hub');
const { sheikhaRealtimeHub } = require('../lib/sheikha-realtime-hub');

// استخدم نفس instance الخاصة بالـ realtime hub حتى تظهر الأحداث مباشرة.
const persistence = sheikhaRealtimeHub.persistence || new RealtimePersistence();
const encodingHub = new SheikhaEncodingHub();

const ok = (res, data, message = 'نجح', code = 200) =>
    res.status(code).json({ success: true, data, message, timestamp: new Date().toISOString() });

const err = (res, message, code = 400) =>
    res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });

// ═══════════════════════════════════════════════════════════════════════
// PERSISTENCE — إدارة الأحداث المحفوظة
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/operations/persistence/events
 * قائمة الأحداث المحفوظة مع الفلاتر
 */
router.get('/persistence/events', (req, res) => {
    const filters = {
        channel: req.query.channel,
        severity: req.query.severity,
        since: req.query.since,
        until: req.query.until,
        limit: Number(req.query.limit || 100)
    };

    const events = persistence.query(filters);

    ok(res, {
        events,
        count: events.length,
        filters
    }, 'قائمة الأحداث المحفوظة');
});

/**
 * GET /api/operations/persistence/stats
 * إحصائيات الأحداث المحفوظة
 */
router.get('/persistence/stats', (req, res) => {
    const stats = persistence.getStats();
    ok(res, stats, 'إحصائيات الأحداث المحفوظة');
});

/**
 * GET /api/operations/persistence/search
 * بحث متقدم في الأحداث
 * ?channel=sheikha.command.* &severity=CRITICAL,IMPORTANT &limit=50
 */
router.get('/persistence/search', (req, res) => {
    const { channel, severity, limit } = req.query;

    let results = [...persistence.events];

    if (channel) {
        const pattern = new RegExp(channel.replace(/\*/g, '.*'));
        results = results.filter(e => pattern.test(e.channel));
    }

    if (severity) {
        const severities = severity.split(',');
        results = results.filter(e => severities.includes(e.severity));
    }

    results = results.reverse().slice(0, limit || 100);

    ok(res, {
        results,
        count: results.length
    }, 'نتائج البحث');
});

/**
 * POST /api/operations/persistence/clear
 * حذف الأحداث القديمة
 * { beforeDays: 30 }
 */
router.post('/persistence/clear', (req, res) => {
    const { beforeDays = 30 } = req.body;
    const result = persistence.clear(beforeDays);
    ok(res, result, 'تم حذف الأحداث القديمة');
});

// ═══════════════════════════════════════════════════════════════════════
// ENCODING — إدارة ترميز الوسائط
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/operations/encoding/status
 * حالة نظام الترميز
 */
router.get('/encoding/status', (req, res) => {
    const stats = encodingHub.getStats();
    ok(res, stats, 'حالة نظام الترميز');
});

/**
 * POST /api/operations/encoding/image
 * إرسال وظيفة ترميز صورة
 * {
 *   inputPath: "/path/to/image.jpg",
 *   format: "webp",
 *   quality: "high",
 *   priority: "HIGH"
 * }
 */
router.post('/encoding/image', async (req, res) => {
    try {
        const { inputPath, format, quality, priority } = req.body;

        if (!inputPath) {
            return err(res, 'مسار الملف مطلوب');
        }

        const job = await encodingHub.submitImageJob(inputPath, {
            format,
            quality,
            priority
        });

        ok(res, job, 'تم إرسال وظيفة ترميز الصورة', 202);
    } catch (error) {
        err(res, error.message, 500);
    }
});

/**
 * POST /api/operations/encoding/video
 * إرسال وظيفة ترميز فيديو
 * {
 *   inputPath: "/path/to/video.mov",
 *   format: "mp4",
 *   quality: "high",
 *   duration: 60
 * }
 */
router.post('/encoding/video', async (req, res) => {
    try {
        const { inputPath, format, quality, duration, priority } = req.body;

        if (!inputPath) {
            return err(res, 'مسار الملف مطلوب');
        }

        const job = await encodingHub.submitVideoJob(inputPath, {
            format,
            quality,
            duration,
            priority
        });

        ok(res, job, 'تم إرسال وظيفة ترميز الفيديو', 202);
    } catch (error) {
        err(res, error.message, 500);
    }
});

/**
 * GET /api/operations/encoding/jobs
 * قائمة وظائف الترميز الحديثة
 */
router.get('/encoding/jobs', (req, res) => {
    const { type, limit } = req.query;
    const jobs = encodingHub.getRecentJobs(limit || 20, type);
    ok(res, { jobs, count: jobs.length }, 'قائمة وظائف الترميز');
});

/**
 * GET /api/operations/encoding/job/:jobId
 * تفاصيل وظيفة ترميز محددة
 */
router.get('/encoding/job/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = encodingHub.getStatus(jobId);

    if (!job) {
        return err(res, 'الوظيفة غير موجودة', 404);
    }

    ok(res, job, 'تفاصيل الوظيفة');
});

// ═══════════════════════════════════════════════════════════════════════
// QUEUE — إدارة قائمة المعالجة
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/operations/queue/stats
 * إحصائيات قائمة المعالجة
 */
router.get('/queue/stats', (req, res) => {
    const stats = encodingHub.queue.getStats();
    ok(res, stats, 'إحصائيات قائمة المعالجة');
});

/**
 * GET /api/operations/queue/jobs
 * قائمة جميع الوظائف في الطابور
 */
router.get('/queue/jobs', (req, res) => {
    const { status, limit } = req.query;
    let jobs = encodingHub.queue.jobs;

    if (status) {
        jobs = jobs.filter(j => j.status === status);
    }

    jobs = jobs.slice(0, limit || 100);

    ok(res, {
        jobs,
        count: jobs.length
    }, 'قائمة وظائف الطابور');
});

/**
 * POST /api/operations/queue/clear-completed
 * حذف الوظائف المكتملة والفاشلة
 */
router.post('/queue/clear-completed', (req, res) => {
    const result = encodingHub.queue.clearCompleted();
    ok(res, result, 'تم تنظيف الوظائف المكتملة');
});

// ═══════════════════════════════════════════════════════════════════════
// UNIFIED OPERATIONS REPORT
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/operations/report
 * تقرير عملياتي موحد
 */
router.get('/report', (req, res) => {
    const persistenceStats = persistence.getStats();
    const encodingStats = encodingHub.getStats();
    const queueStats = encodingHub.queue.getStats();

    ok(res, {
        persistence: persistenceStats,
        encoding: encodingStats,
        queue: queueStats,
        reportTime: new Date().toISOString()
    }, 'التقرير العملياتي الموحد');
});

module.exports = router;
