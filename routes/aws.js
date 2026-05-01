'use strict';

/**
 * Sheikha AWS — API Routes
 * شيخة AWS — جميع الخدمات
 *
 * Mounted at /api/aws in server.js
 *
 * GET  /                        — لوحة القيادة الكاملة
 * GET  /health                  — فحص الصحة
 * GET  /catalogue               — كتالوج كامل 100+ خدمة
 * GET  /catalogue/:category     — خدمات فئة معينة
 * GET  /service/:id             — خدمة محددة
 * GET  /search?q=               — بحث في الخدمات
 * GET  /credentials             — حالة المفاتيح
 * GET  /background              — حالة العامل الخلفي
 * POST /background/start        — تشغيل العامل الخلفي
 * POST /background/stop         — إيقاف العامل الخلفي
 *
 * S3 (Sheikha Object Store):
 * GET  /s3                      — قائمة الكائنات
 * POST /s3/put                  — رفع كائن
 * GET  /s3/get/:key(*)          — جلب كائن
 * DELETE /s3/:key(*)            — حذف كائن
 *
 * DynamoDB (Sheikha NoSQL):
 * POST /dynamodb/put            — حفظ سجل
 * GET  /dynamodb/get/:table/:pk — جلب سجل
 * GET  /dynamodb/scan/:table    — استعراض جدول
 *
 * SQS (Sheikha Queue):
 * POST /sqs/send                — إرسال رسالة
 * GET  /sqs/receive/:queue      — استقبال رسائل
 *
 * SNS (Sheikha Notify):
 * POST /sns/publish             — نشر إشعار
 * GET  /sns/topics              — قائمة المواضيع
 *
 * Lambda (Sheikha Functions):
 * POST /lambda/invoke           — استدعاء دالة
 *
 * Usage & Logs:
 * GET  /usage                   — إحصائيات الاستخدام
 * GET  /log                     — سجل العمليات
 */

const express = require('express');
const aws     = require('../lib/sheikha-aws-engine.js');

const router = express.Router();

function ok(res, data, message) {
    return res.json({ success: true, data, message: message || 'تم بنجاح', timestamp: new Date().toISOString() });
}

function fail(res, code, message, detail) {
    return res.status(code).json({ success: false, message, detail: detail || null, timestamp: new Date().toISOString() });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
    try {
        const d = aws.getDashboard();
        return ok(res, d, `${d.engine.nameAr} — ${d.engine.motto}`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب لوحة القيادة', e.message);
    }
});

// ── Health ────────────────────────────────────────────────────────────────────

router.get('/health', (req, res) => {
    try {
        const h = aws.getHealthStatus();
        return res.json({ success: true, data: h, timestamp: new Date().toISOString() });
    } catch (e) {
        return fail(res, 500, 'فشل فحص الصحة', e.message);
    }
});

// ── Credentials ───────────────────────────────────────────────────────────────

router.get('/credentials', (req, res) => {
    try {
        return ok(res, aws.getCredentialStatus(), 'حالة مفاتيح AWS');
    } catch (e) {
        return fail(res, 500, 'فشل جلب حالة المفاتيح', e.message);
    }
});

// ── Catalogue ─────────────────────────────────────────────────────────────────

router.get('/catalogue', (req, res) => {
    try {
        const cat = aws.getCatalogue();
        const total = cat.reduce((s, c) => s + c.count, 0);
        return ok(res, { categories: cat.length, totalServices: total, catalogue: cat },
            `كتالوج شيخة AWS — ${cat.length} فئة | ${total} خدمة`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب الكتالوج', e.message);
    }
});

router.get('/catalogue/:category', (req, res) => {
    try {
        const cat = aws.getCategory(req.params.category);
        if (!cat) return fail(res, 404, `الفئة "${req.params.category}" غير موجودة`);
        return ok(res, cat, `${cat.nameAr} — ${cat.services.length} خدمة`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب الفئة', e.message);
    }
});

router.get('/service/:id', (req, res) => {
    try {
        const svc = aws.getService(req.params.id);
        if (!svc) return fail(res, 404, `الخدمة "${req.params.id}" غير موجودة`);
        return ok(res, svc, svc.name);
    } catch (e) {
        return fail(res, 500, 'فشل جلب الخدمة', e.message);
    }
});

router.get('/search', (req, res) => {
    try {
        const q = String(req.query.q || '').trim();
        if (!q) return fail(res, 400, 'معامل البحث q مطلوب');
        const results = aws.searchServices(q);
        return ok(res, { query: q, count: results.length, results },
            `${results.length} نتيجة لـ "${q}"`);
    } catch (e) {
        return fail(res, 500, 'فشل البحث', e.message);
    }
});

// ── Background Worker ─────────────────────────────────────────────────────────

router.get('/background', (req, res) => {
    try {
        return ok(res, aws.getBackgroundStatus(), 'حالة العامل الخلفي');
    } catch (e) {
        return fail(res, 500, 'فشل جلب حالة العامل', e.message);
    }
});

router.post('/background/start', (req, res) => {
    try {
        return ok(res, aws.startBackgroundWorker(), 'تم تشغيل العامل الخلفي');
    } catch (e) {
        return fail(res, 500, 'فشل تشغيل العامل الخلفي', e.message);
    }
});

router.post('/background/stop', (req, res) => {
    try {
        return ok(res, aws.stopBackgroundWorker(), 'تم إيقاف العامل الخلفي');
    } catch (e) {
        return fail(res, 500, 'فشل إيقاف العامل الخلفي', e.message);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// S3 — Sheikha Object Store
// ══════════════════════════════════════════════════════════════════════════════

router.get('/s3', (req, res) => {
    try {
        const prefix  = req.query.prefix || '';
        const objects = aws.s3List(prefix);
        return ok(res, { prefix: prefix || '*', count: objects.length, objects },
            `${objects.length} كائن في Sheikha Object Store`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب قائمة S3', e.message);
    }
});

router.post('/s3/put', express.json({ limit: '10mb' }), async (req, res) => {
    try {
        const { key, data, mime } = req.body || {};
        if (!key) return fail(res, 400, 'الحقل key مطلوب');
        if (data === undefined || data === null) return fail(res, 400, 'الحقل data مطلوب');
        const result = await aws.s3Put(key, data, { mime });
        return ok(res, result, `تم رفع "${key}" — ${result.size} بايت`);
    } catch (e) {
        return fail(res, 500, 'فشل رفع الكائن', e.message);
    }
});

router.get('/s3/get/:key(*)', async (req, res) => {
    try {
        const result = await aws.s3Get(req.params.key);
        if (!result.content) return fail(res, 404, `الكائن "${req.params.key}" غير موجود`);
        return ok(res, result, 'تم جلب الكائن');
    } catch (e) {
        return fail(res, 500, 'فشل جلب الكائن', e.message);
    }
});

router.delete('/s3/:key(*)', async (req, res) => {
    try {
        const result = await aws.s3Delete(req.params.key);
        return ok(res, result, result.deleted ? `تم حذف "${req.params.key}"` : 'الكائن غير موجود');
    } catch (e) {
        return fail(res, 500, 'فشل حذف الكائن', e.message);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// DynamoDB — Sheikha NoSQL
// ══════════════════════════════════════════════════════════════════════════════

router.post('/dynamodb/put', express.json(), (req, res) => {
    try {
        const { table, item } = req.body || {};
        if (!table) return fail(res, 400, 'الحقل table مطلوب');
        if (!item)  return fail(res, 400, 'الحقل item مطلوب');
        return ok(res, aws.ddbPut(table, item), `تم حفظ السجل في جدول "${table}"`);
    } catch (e) {
        return fail(res, 500, 'فشل حفظ السجل', e.message);
    }
});

router.get('/dynamodb/get/:table/:pk', (req, res) => {
    try {
        const result = aws.ddbGet(req.params.table, req.params.pk);
        if (!result.found) return fail(res, 404, `السجل "${req.params.pk}" غير موجود في "${req.params.table}"`);
        return ok(res, result, 'تم جلب السجل');
    } catch (e) {
        return fail(res, 500, 'فشل جلب السجل', e.message);
    }
});

router.get('/dynamodb/scan/:table', (req, res) => {
    try {
        return ok(res, aws.ddbScan(req.params.table), `استعراض جدول "${req.params.table}"`);
    } catch (e) {
        return fail(res, 500, 'فشل استعراض الجدول', e.message);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// SQS — Sheikha Queue
// ══════════════════════════════════════════════════════════════════════════════

router.post('/sqs/send', express.json(), (req, res) => {
    try {
        const { queue, body } = req.body || {};
        if (!queue) return fail(res, 400, 'الحقل queue مطلوب');
        if (!body)  return fail(res, 400, 'الحقل body مطلوب');
        return ok(res, aws.sqsSend(queue, body), `تم إرسال الرسالة إلى قائمة "${queue}"`);
    } catch (e) {
        return fail(res, 500, 'فشل إرسال الرسالة', e.message);
    }
});

router.get('/sqs/receive/:queue', (req, res) => {
    try {
        const max = parseInt(req.query.max) || 1;
        return ok(res, aws.sqsReceive(req.params.queue, max), `تم استقبال رسائل من "${req.params.queue}"`);
    } catch (e) {
        return fail(res, 500, 'فشل استقبال الرسائل', e.message);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// SNS — Sheikha Notify
// ══════════════════════════════════════════════════════════════════════════════

router.post('/sns/publish', express.json(), (req, res) => {
    try {
        const { topic, message, subject } = req.body || {};
        if (!topic)   return fail(res, 400, 'الحقل topic مطلوب');
        if (!message) return fail(res, 400, 'الحقل message مطلوب');
        return ok(res, aws.snsPublish(topic, message, subject), `تم نشر الإشعار على "${topic}"`);
    } catch (e) {
        return fail(res, 500, 'فشل نشر الإشعار', e.message);
    }
});

router.get('/sns/topics', (req, res) => {
    try {
        const topics = aws.snsListTopics();
        return ok(res, { count: topics.length, topics }, `${topics.length} موضوع SNS`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب المواضيع', e.message);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// Lambda — Sheikha Functions
// ══════════════════════════════════════════════════════════════════════════════

router.post('/lambda/invoke', express.json(), (req, res) => {
    try {
        const { functionName, payload } = req.body || {};
        if (!functionName) return fail(res, 400, 'الحقل functionName مطلوب');
        return ok(res, aws.lambdaInvoke(functionName, payload || {}),
            `تم استدعاء الدالة "${functionName}"`);
    } catch (e) {
        return fail(res, 500, 'فشل استدعاء الدالة', e.message);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// Usage & Log
// ══════════════════════════════════════════════════════════════════════════════

router.get('/usage', (req, res) => {
    try {
        return ok(res, aws.getDashboard().usage, 'إحصائيات استخدام Sheikha AWS');
    } catch (e) {
        return fail(res, 500, 'فشل جلب الإحصائيات', e.message);
    }
});

router.get('/log', (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const log   = aws.getOpsLog(limit);
        return ok(res, { count: log.length, log }, `آخر ${log.length} عملية`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب السجل', e.message);
    }
});

module.exports = router;
