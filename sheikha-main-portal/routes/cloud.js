'use strict';

/**
 * Sheikha Cosmic Cloud — API Routes
 * أفضل سحابة كونية — نقاط API الكاملة
 *
 * Prefixed at /api/cloud/cosmic by server.js
 *
 * GET  /                   — dashboard كامل
 * GET  /health             — فحص الصحة الفوري
 * GET  /providers          — قائمة مزودي السحابة + حالة التهيئة
 * GET  /platforms          — قائمة منصات شيخة
 * GET  /regions            — التغطية الجغرافية
 * GET  /cdn                — إعدادات CDN
 * GET  /compute            — الحوسبة والـ Serverless
 * GET  /ai                 — قدرات الذكاء الاصطناعي السحابي
 * POST /route              — توجيه ذكي لحِمل معين
 * GET  /storage            — قائمة الكائنات المخزنة
 * POST /storage/upload     — رفع كائن
 * GET  /storage/:key       — تنزيل كائن
 * POST /cdn/purge          — تنظيف الكاش
 * GET  /usage              — إحصائيات الاستخدام
 * GET  /log                — سجل العمليات
 */

const express = require('express');
const cloud   = require('../lib/sheikha-cloud-engine.js');

const router = express.Router();

function ok(res, data, message) {
    return res.json({ success: true, data, message: message || 'تم بنجاح', timestamp: new Date().toISOString() });
}

function fail(res, code, message, detail) {
    return res.status(code).json({ success: false, message, detail: detail || null, timestamp: new Date().toISOString() });
}

// ── GET / — full dashboard ────────────────────────────────────────────────────

router.get('/', (req, res) => {
    try {
        const dashboard = cloud.getDashboard();
        return ok(res, dashboard, `${dashboard.engine.nameAr} — ${dashboard.engine.motto}`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب لوحة السحابة', e.message);
    }
});

// ── GET /health ───────────────────────────────────────────────────────────────

router.get('/health', (req, res) => {
    try {
        const health = cloud.getHealthStatus();
        const code   = health.overall === 'healthy' ? 200 : 503;
        return res.status(code).json({ success: health.overall === 'healthy', data: health, timestamp: new Date().toISOString() });
    } catch (e) {
        return fail(res, 500, 'فشل فحص الصحة', e.message);
    }
});

// ── GET /providers ────────────────────────────────────────────────────────────

router.get('/providers', (req, res) => {
    try {
        const providers = cloud.getProviderStatus();
        const active    = providers.filter(p => p.configured);
        return ok(res, {
            total:      providers.length,
            configured: active.length,
            providers
        }, `${active.length} من ${providers.length} مزود سحابي مُهيَّأ`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب مزودي السحابة', e.message);
    }
});

// ── GET /platforms ────────────────────────────────────────────────────────────

router.get('/platforms', (req, res) => {
    try {
        return ok(res, {
            total:     cloud.constructor.PLATFORMS?.length || require('../lib/sheikha-cloud-engine.js').PLATFORMS.length,
            platforms: require('../lib/sheikha-cloud-engine.js').PLATFORMS
        }, 'منصات شيخة الكونية');
    } catch (e) {
        return fail(res, 500, 'فشل جلب المنصات', e.message);
    }
});

// ── GET /regions ──────────────────────────────────────────────────────────────

router.get('/regions', (req, res) => {
    try {
        const regions = require('../lib/sheikha-cloud-engine.js').GEO_REGIONS;
        return ok(res, { total: regions.length, regions }, 'التغطية الجغرافية الكونية');
    } catch (e) {
        return fail(res, 500, 'فشل جلب المناطق', e.message);
    }
});

// ── GET /cdn ──────────────────────────────────────────────────────────────────

router.get('/cdn', (req, res) => {
    try {
        return ok(res, cloud.getCDNConfig(), 'إعدادات شبكة توصيل المحتوى CDN');
    } catch (e) {
        return fail(res, 500, 'فشل جلب إعدادات CDN', e.message);
    }
});

// ── POST /cdn/purge ───────────────────────────────────────────────────────────

router.post('/cdn/purge', express.json(), (req, res) => {
    try {
        const paths  = req.body?.paths || ['/*'];
        const result = cloud.purgeCDNCache(paths);
        return ok(res, result, 'تم إرسال طلب تنظيف الكاش');
    } catch (e) {
        return fail(res, 500, 'فشل تنظيف الكاش', e.message);
    }
});

// ── GET /compute ──────────────────────────────────────────────────────────────

router.get('/compute', (req, res) => {
    try {
        return ok(res, cloud.getComputeStatus(), 'حالة الحوسبة والـ Serverless');
    } catch (e) {
        return fail(res, 500, 'فشل جلب حالة الحوسبة', e.message);
    }
});

// ── GET /ai ───────────────────────────────────────────────────────────────────

router.get('/ai', (req, res) => {
    try {
        const ai = cloud.getAICapabilities();
        const configured = ai.models.filter(m => m.configured).length;
        return ok(res, { ...ai, configured, total: ai.models.length },
            `${configured} نموذج ذكاء اصطناعي مُهيَّأ من أصل ${ai.models.length}`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب قدرات الذكاء الاصطناعي', e.message);
    }
});

// ── POST /route ───────────────────────────────────────────────────────────────

router.post('/route', express.json(), (req, res) => {
    try {
        const { workload, region } = req.body || {};
        if (!workload) return fail(res, 400, 'الحقل workload مطلوب — ai | storage | edge | compute | cdn | email | enterprise | serverless');
        const result = cloud.routeWorkload(workload, region);
        return ok(res, result, `تم توجيه الحِمل "${workload}" إلى "${result.provider}"`);
    } catch (e) {
        return fail(res, 500, 'فشل التوجيه الذكي', e.message);
    }
});

// ── GET /storage ──────────────────────────────────────────────────────────────

router.get('/storage', (req, res) => {
    try {
        const prefix  = req.query.prefix || '';
        const objects = cloud.listObjects(prefix);
        return ok(res, { total: objects.length, prefix: prefix || '*', objects },
            `${objects.length} كائن في التخزين`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب قائمة التخزين', e.message);
    }
});

// ── POST /storage/upload ──────────────────────────────────────────────────────

router.post('/storage/upload', express.json({ limit: '10mb' }), async (req, res) => {
    try {
        const { key, data, mimeType } = req.body || {};
        if (!key) return fail(res, 400, 'الحقل key مطلوب');
        if (data === undefined || data === null) return fail(res, 400, 'الحقل data مطلوب');
        const result = await cloud.uploadObject(key, data, { mimeType });
        return ok(res, result, `تم رفع "${key}" بنجاح — ${result.size} بايت`);
    } catch (e) {
        return fail(res, 500, 'فشل رفع الكائن', e.message);
    }
});

// ── GET /storage/:key ─────────────────────────────────────────────────────────

router.get('/storage/:key(*)', async (req, res) => {
    try {
        const key    = req.params.key;
        const result = await cloud.downloadObject(key);
        if (!result.content) return fail(res, 404, `الكائن "${key}" غير موجود`);
        return ok(res, result, `تم جلب "${key}" بنجاح`);
    } catch (e) {
        return fail(res, 500, 'فشل تنزيل الكائن', e.message);
    }
});

// ── GET /usage ────────────────────────────────────────────────────────────────

router.get('/usage', (req, res) => {
    try {
        const dashboard = cloud.getDashboard();
        return ok(res, dashboard.usage, 'إحصائيات استخدام السحابة');
    } catch (e) {
        return fail(res, 500, 'فشل جلب الإحصائيات', e.message);
    }
});

// ── GET /log ──────────────────────────────────────────────────────────────────

router.get('/log', (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const log   = cloud.getOpsLog(limit);
        return ok(res, { total: log.length, log }, `آخر ${log.length} عملية سحابية`);
    } catch (e) {
        return fail(res, 500, 'فشل جلب السجل', e.message);
    }
});

module.exports = router;
