/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🌐 مسارات شبكة شيخة المتكاملة — Sheikha Network API Routes
 *
 *  تغطي:
 *   • Sheikha DBUS      — ناقل الرسائل بين الخدمات
 *   • Sheikha DNS       — نظام أسماء النطاقات الداخلي
 *   • Sheikha Waterline — طبقة الأمان وخطوط الحماية
 *   • Sheikha Neural    — الشبكة العصبية لسوق شيخة
 *   • Sheikha Layers    — طبقات شبكة شيخة (PAN→SHTTP/HTTPS)
 *
 *  ─────────────────── DBUS ───────────────────────────────────────────────────
 *   GET  /api/network/dbus/status          — حالة ناقل الرسائل
 *   GET  /api/network/dbus/channels        — قائمة القنوات
 *   GET  /api/network/dbus/history/:ch     — سجل رسائل قناة
 *   POST /api/network/dbus/publish         — نشر رسالة
 *   POST /api/network/dbus/subscribe       — الاشتراك في قناة
 *   POST /api/network/dbus/unsubscribe     — إلغاء اشتراك
 *
 *  ─────────────────── DNS ────────────────────────────────────────────────────
 *   GET  /api/network/dns/status           — حالة DNS
 *   GET  /api/network/dns/resolve/:name    — حل اسم خدمة
 *   GET  /api/network/dns/list             — كل السجلات
 *   GET  /api/network/dns/search           — بحث ?q=...
 *   POST /api/network/dns/register         — تسجيل خدمة
 *   DELETE /api/network/dns/:name          — حذف سجل
 *   PATCH  /api/network/dns/:name/health   — تحديث حالة الصحة
 *
 *  ─────────────────── WATERLINE ──────────────────────────────────────────────
 *   GET  /api/network/waterline/status     — حالة طبقة الأمان
 *   GET  /api/network/waterline/layers     — طبقات شبكة شيخة
 *   GET  /api/network/waterline/incidents  — سجل الحوادث الأمنية
 *   POST /api/network/waterline/check      — فحص طلب Zero-Trust
 *   POST /api/network/waterline/token      — إصدار رمز وصول
 *   POST /api/network/waterline/verify     — التحقق من رمز
 *   POST /api/network/waterline/encrypt    — تشفير AES-256
 *   POST /api/network/waterline/decrypt    — فك التشفير
 *   POST /api/network/waterline/block-ip   — حظر IP
 *   DELETE /api/network/waterline/block-ip — إلغاء حظر IP
 *
 *  ─────────────────── NEURAL ─────────────────────────────────────────────────
 *   GET  /api/network/neural/status        — حالة الشبكة العصبية
 *   GET  /api/network/neural/topology      — طوبولوجيا الشبكة الكاملة
 *   POST /api/network/neural/infer         — استدلال عام
 *   POST /api/network/neural/recommend/product — توصيات منتج
 *   POST /api/network/neural/recommend/user    — توصيات مستخدم
 *   POST /api/network/neural/satellite     — تحليل بيانات الأقمار الصناعية
 *
 *  ─────────────────── LAYERS ─────────────────────────────────────────────────
 *   GET  /api/network/layers               — كل طبقات شبكة شيخة
 *   GET  /api/network/layers/:id           — طبقة محددة
 *   GET  /api/network/dashboard            — لوحة القيادة الموحدة
 *
 *  ﴿ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ﴾ — الحجرات: 13
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ── تحميل الوحدات ─────────────────────────────────────────────────────────────

const { dbus, BUILT_IN_CHANNELS }                         = require('../core/comms/sheikha-dbus');
const { sheikha_dns }                                     = require('../core/comms/sheikha-dns');
const { waterline, NETWORK_LAYERS, THREAT_LEVELS }        = require('../core/comms/sheikha-waterline');
const { neuralNet }                                       = require('../core/engines/sheikha-market-neural');

// ── مساعد الاستجابة ───────────────────────────────────────────────────────────

function ok(res, data) {
    return res.json({
        success: true,
        ...data,
        _powered_by: 'Sheikha Neural Network Architecture v1.0',
    });
}

function fail(res, status, error, messageAr) {
    return res.status(status).json({ success: false, error, messageAr });
}

// ══════════════════════════════════════════════════════════════════════════════
//  🚌 SHEIKHA DBUS — ناقل الرسائل
// ══════════════════════════════════════════════════════════════════════════════

/** GET /api/network/dbus/status */
router.get('/dbus/status', (_req, res) => {
    try { ok(res, { data: dbus.getStatus() }); }
    catch (e) { fail(res, 500, 'dbus_status_error', 'خطأ في جلب حالة DBUS'); }
});

/** GET /api/network/dbus/channels */
router.get('/dbus/channels', (_req, res) => {
    try { ok(res, { data: dbus.getChannels() }); }
    catch (e) { fail(res, 500, 'dbus_channels_error', 'خطأ في جلب قنوات DBUS'); }
});

/** GET /api/network/dbus/history/:channel */
router.get('/dbus/history/:channel', (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 20;
        const data  = dbus.getHistory(req.params.channel, limit);
        ok(res, { channel: req.params.channel, data, count: data.length });
    } catch (e) { fail(res, 500, 'dbus_history_error', 'خطأ في جلب سجل الرسائل'); }
});

/** POST /api/network/dbus/publish — Body: { channel, payload, priority?, publishedBy? } */
router.post('/dbus/publish', (req, res) => {
    try {
        const { channel, payload, priority, publishedBy } = req.body || {};
        if (!channel) return fail(res, 400, 'channel_required', 'اسم القناة مطلوب (channel)');
        const result = dbus.publish(channel, payload, { priority, publishedBy });
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'dbus_publish_error', e.message || 'خطأ في نشر الرسالة'); }
});

/** POST /api/network/dbus/subscribe — Body: { channel, subscribedBy? } */
router.post('/dbus/subscribe', (req, res) => {
    try {
        const { channel, subscribedBy } = req.body || {};
        if (!channel) return fail(res, 400, 'channel_required', 'اسم القناة مطلوب');
        // في REST API نسجّل اشتراكاً وهمياً فقط — المكتبة الداخلية للاستخدام البرمجي
        const sub = dbus.subscribe(channel, () => {}, { subscribedBy });
        ok(res, { data: { subscriptionId: sub.subscriptionId, channel }, messageAr: 'تم الاشتراك في القناة' });
    } catch (e) { fail(res, 500, 'dbus_subscribe_error', 'خطأ في الاشتراك'); }
});

/** POST /api/network/dbus/unsubscribe — Body: { subscriptionId } */
router.post('/dbus/unsubscribe', (req, res) => {
    try {
        const { subscriptionId } = req.body || {};
        if (!subscriptionId) return fail(res, 400, 'subscription_id_required', 'معرّف الاشتراك مطلوب');
        const result = dbus.unsubscribe(subscriptionId);
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'dbus_unsub_error', 'خطأ في إلغاء الاشتراك'); }
});

// ══════════════════════════════════════════════════════════════════════════════
//  🌐 SHEIKHA DNS — نظام أسماء النطاقات
// ══════════════════════════════════════════════════════════════════════════════

/** GET /api/network/dns/status */
router.get('/dns/status', (_req, res) => {
    try { ok(res, { data: sheikha_dns.getStatus() }); }
    catch (e) { fail(res, 500, 'dns_status_error', 'خطأ في جلب حالة DNS'); }
});

/** GET /api/network/dns/resolve/:name?type=SRV */
router.get('/dns/resolve/:name', (req, res) => {
    try {
        const record = sheikha_dns.resolve(req.params.name, req.query.type || null);
        if (!record) return fail(res, 404, 'dns_not_found', `لا يوجد سجل للخدمة: ${req.params.name}`);
        ok(res, { name: req.params.name, data: record });
    } catch (e) { fail(res, 500, 'dns_resolve_error', 'خطأ في حل الاسم'); }
});

/** GET /api/network/dns/list?tag=core */
router.get('/dns/list', (req, res) => {
    try { ok(res, { data: sheikha_dns.listAll(req.query.tag || null) }); }
    catch (e) { fail(res, 500, 'dns_list_error', 'خطأ في جلب قائمة السجلات'); }
});

/** GET /api/network/dns/search?q=market */
router.get('/dns/search', (req, res) => {
    try {
        const q = req.query.q || req.query.query || '';
        if (!q) return fail(res, 400, 'query_required', 'مطلوب: ?q=اسم الخدمة');
        ok(res, { data: sheikha_dns.search(q) });
    } catch (e) { fail(res, 500, 'dns_search_error', 'خطأ في البحث'); }
});

/** POST /api/network/dns/register — Body: { name, host, port, protocol, path, tags? } */
router.post('/dns/register', (req, res) => {
    try {
        const { name, ...recordData } = req.body || {};
        if (!name) return fail(res, 400, 'name_required', 'اسم الخدمة مطلوب');
        const result = sheikha_dns.register(name, recordData);
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'dns_register_error', e.message || 'خطأ في التسجيل'); }
});

/** DELETE /api/network/dns/:name */
router.delete('/dns/:name', (req, res) => {
    try {
        const result = sheikha_dns.unregister(req.params.name);
        if (!result.success) return fail(res, result.error === 'not_found' ? 404 : 403, result.error, result.messageAr || 'خطأ في الحذف');
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'dns_delete_error', 'خطأ في حذف السجل'); }
});

/** PATCH /api/network/dns/:name/health — Body: { healthy: true|false } */
router.patch('/dns/:name/health', (req, res) => {
    try {
        const { healthy } = req.body || {};
        if (typeof healthy !== 'boolean') return fail(res, 400, 'healthy_required', 'القيمة healthy (boolean) مطلوبة');
        const result = sheikha_dns.setHealth(req.params.name, healthy);
        if (!result.success) return fail(res, 404, result.error, 'الخدمة غير موجودة');
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'dns_health_error', 'خطأ في تحديث الصحة'); }
});

// ══════════════════════════════════════════════════════════════════════════════
//  🛡️ SHEIKHA WATERLINE — خط الأمان
// ══════════════════════════════════════════════════════════════════════════════

/** GET /api/network/waterline/status */
router.get('/waterline/status', (_req, res) => {
    try { ok(res, { data: waterline.getStatus() }); }
    catch (e) { fail(res, 500, 'waterline_status_error', 'خطأ في جلب حالة Waterline'); }
});

/** GET /api/network/waterline/layers — طبقات شبكة شيخة */
router.get('/waterline/layers', (_req, res) => {
    try { ok(res, { data: waterline.getNetworkLayers() }); }
    catch (e) { fail(res, 500, 'waterline_layers_error', 'خطأ في جلب الطبقات'); }
});

/** GET /api/network/waterline/incidents?level=HIGH&limit=20 */
router.get('/waterline/incidents', (req, res) => {
    try {
        const level = req.query.level || null;
        const limit = parseInt(req.query.limit, 10) || 20;
        ok(res, { data: waterline.getIncidents(level, limit) });
    } catch (e) { fail(res, 500, 'waterline_incidents_error', 'خطأ في جلب الحوادث'); }
});

/** POST /api/network/waterline/check — Body: { layer? } */
router.post('/waterline/check', (req, res) => {
    try {
        const result = waterline.checkRequest(req, { layer: req.body?.layer });
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'waterline_check_error', 'خطأ في فحص الطلب'); }
});

/** POST /api/network/waterline/token — Body: { userId, scopes?, expiryMs? } */
router.post('/waterline/token', (req, res) => {
    try {
        const { userId, scopes, expiryMs } = req.body || {};
        if (!userId) return fail(res, 400, 'user_id_required', 'معرّف المستخدم مطلوب');
        const result = waterline.issueToken(userId, scopes, expiryMs);
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'waterline_token_error', 'خطأ في إصدار الرمز'); }
});

/** POST /api/network/waterline/verify — Body: { token } */
router.post('/waterline/verify', (req, res) => {
    try {
        const { token } = req.body || {};
        if (!token) return fail(res, 400, 'token_required', 'الرمز مطلوب');
        const result = waterline.verifyToken(token);
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'waterline_verify_error', 'خطأ في التحقق من الرمز'); }
});

/** POST /api/network/waterline/encrypt — Body: { data } */
router.post('/waterline/encrypt', (req, res) => {
    try {
        const { data } = req.body || {};
        if (data === undefined || data === null) return fail(res, 400, 'data_required', 'البيانات مطلوبة للتشفير');
        const result = waterline.encrypt(data);
        ok(res, { data: result, messageAr: 'تم التشفير بـ AES-256-GCM' });
    } catch (e) { fail(res, 500, 'waterline_encrypt_error', 'خطأ في التشفير'); }
});

/** POST /api/network/waterline/decrypt — Body: { iv, authTag, encrypted } */
router.post('/waterline/decrypt', (req, res) => {
    try {
        const { iv, authTag, encrypted } = req.body || {};
        if (!iv || !authTag || !encrypted) return fail(res, 400, 'enc_fields_required', 'مطلوب: iv, authTag, encrypted');
        const result = waterline.decrypt({ iv, authTag, encrypted });
        ok(res, { data: { decrypted: result }, messageAr: 'تم فك التشفير بنجاح' });
    } catch (e) { fail(res, 500, 'waterline_decrypt_error', 'خطأ في فك التشفير'); }
});

/** POST /api/network/waterline/block-ip — Body: { ip, reason? } */
router.post('/waterline/block-ip', (req, res) => {
    try {
        const { ip, reason } = req.body || {};
        if (!ip) return fail(res, 400, 'ip_required', 'عنوان IP مطلوب');
        ok(res, { data: waterline.blockIP(ip, reason) });
    } catch (e) { fail(res, 500, 'waterline_block_error', 'خطأ في حظر IP'); }
});

/** DELETE /api/network/waterline/block-ip — Body: { ip } */
router.delete('/waterline/block-ip', (req, res) => {
    try {
        const { ip } = req.body || {};
        if (!ip) return fail(res, 400, 'ip_required', 'عنوان IP مطلوب');
        ok(res, { data: waterline.unblockIP(ip) });
    } catch (e) { fail(res, 500, 'waterline_unblock_error', 'خطأ في إلغاء الحظر'); }
});

// ══════════════════════════════════════════════════════════════════════════════
//  🧠 SHEIKHA NEURAL — الشبكة العصبية لسوق شيخة
// ══════════════════════════════════════════════════════════════════════════════

/** GET /api/network/neural/status */
router.get('/neural/status', (_req, res) => {
    try { ok(res, { data: neuralNet.getStatus() }); }
    catch (e) { fail(res, 500, 'neural_status_error', 'خطأ في جلب حالة الشبكة العصبية'); }
});

/** GET /api/network/neural/topology */
router.get('/neural/topology', (_req, res) => {
    try { ok(res, { data: neuralNet.getTopology() }); }
    catch (e) { fail(res, 500, 'neural_topology_error', 'خطأ في جلب طوبولوجيا الشبكة العصبية'); }
});

/**
 * POST /api/network/neural/infer
 * Body: { marketData?, product?, user?, prices?, satelliteData? }
 */
router.post('/neural/infer', (req, res) => {
    try {
        const result = neuralNet.infer(req.body || {});
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'neural_infer_error', 'خطأ في الاستدلال العصبي'); }
});

/**
 * POST /api/network/neural/recommend/product
 * Body: { id?, name?, price?, category?, ... }
 */
router.post('/neural/recommend/product', (req, res) => {
    try {
        const result = neuralNet.recommendProduct(req.body || {});
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'neural_rec_product_error', 'خطأ في توصيات المنتج'); }
});

/**
 * POST /api/network/neural/recommend/user
 * Body: { id?, purchase_history?, preferences?, ... }
 */
router.post('/neural/recommend/user', (req, res) => {
    try {
        const result = neuralNet.recommendForUser(req.body || {});
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'neural_rec_user_error', 'خطأ في توصيات المستخدم'); }
});

/**
 * POST /api/network/neural/satellite
 * Body: { gps?, weather?, agricultural?, logistics? }
 */
router.post('/neural/satellite', (req, res) => {
    try {
        const result = neuralNet.analyseSatelliteData(req.body || {});
        ok(res, { data: result });
    } catch (e) { fail(res, 500, 'neural_satellite_error', 'خطأ في تحليل بيانات الأقمار الصناعية'); }
});

// ══════════════════════════════════════════════════════════════════════════════
//  📶 طبقات شبكة شيخة — Sheikha Network Layers
// ══════════════════════════════════════════════════════════════════════════════

/** GET /api/network/layers — كل الطبقات */
router.get('/layers', (_req, res) => {
    try { ok(res, { data: waterline.getNetworkLayers() }); }
    catch (e) { fail(res, 500, 'layers_error', 'خطأ في جلب الطبقات'); }
});

/** GET /api/network/layers/:id — طبقة محددة (مثال: Sheikha%20LAN) */
router.get('/layers/:id', (req, res) => {
    try {
        const id    = decodeURIComponent(req.params.id);
        // دعم الصيغتين: 'LAN' أو 'Sheikha LAN'
        const key   = NETWORK_LAYERS[id] ? id : `Sheikha ${id}`;
        const layer = NETWORK_LAYERS[key];
        if (!layer) return fail(res, 404, 'layer_not_found', `الطبقة غير موجودة: ${id}`);
        ok(res, { data: { id: key, ...layer } });
    } catch (e) { fail(res, 500, 'layer_detail_error', 'خطأ في جلب تفاصيل الطبقة'); }
});

// ══════════════════════════════════════════════════════════════════════════════
//  🗺️ لوحة القيادة الموحدة
// ══════════════════════════════════════════════════════════════════════════════

/** GET /api/network/dashboard */
router.get('/dashboard', (_req, res) => {
    try {
        ok(res, {
            data: {
                nameAr:   'لوحة قيادة شبكة شيخة المتكاملة',
                nameEn:   'Sheikha Integrated Network Dashboard',
                tawheed:  'لا إله إلا الله',
                timestamp: new Date().toISOString(),
                components: {
                    dbus:      dbus.getStatus(),
                    dns:       sheikha_dns.getStatus(),
                    waterline: waterline.getStatus(),
                    neural:    neuralNet.getStatus(),
                },
                layers:  waterline.getNetworkLayers(),
                verse:   '﴿ وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ ﴾ — الذاريات: 22',
                hadith:  '«إن الله يحب إذا عمل أحدكم عملاً أن يُتقنه» — البيهقي',
            },
        });
    } catch (e) { fail(res, 500, 'dashboard_error', 'خطأ في لوحة القيادة'); }
});

/** GET /api/network — نقطة دخول عامة */
router.get('/', (_req, res) => {
    ok(res, {
        data: {
            nameAr:  'منظومة شبكة شيخة المتكاملة',
            nameEn:  'Sheikha Integrated Network System',
            version: '1.0.0',
            endpoints: [
                { path: '/api/network/dashboard',            method: 'GET',    descAr: 'لوحة القيادة الموحدة' },
                { path: '/api/network/layers',               method: 'GET',    descAr: 'طبقات شبكة شيخة' },
                { path: '/api/network/layers/:id',           method: 'GET',    descAr: 'طبقة محددة' },
                { path: '/api/network/dbus/status',          method: 'GET',    descAr: 'حالة ناقل الرسائل' },
                { path: '/api/network/dbus/channels',        method: 'GET',    descAr: 'قنوات DBUS' },
                { path: '/api/network/dbus/publish',         method: 'POST',   descAr: 'نشر رسالة' },
                { path: '/api/network/dns/status',           method: 'GET',    descAr: 'حالة DNS' },
                { path: '/api/network/dns/resolve/:name',    method: 'GET',    descAr: 'حل اسم خدمة' },
                { path: '/api/network/dns/list',             method: 'GET',    descAr: 'كل السجلات' },
                { path: '/api/network/dns/register',         method: 'POST',   descAr: 'تسجيل خدمة' },
                { path: '/api/network/waterline/status',     method: 'GET',    descAr: 'حالة Waterline' },
                { path: '/api/network/waterline/layers',     method: 'GET',    descAr: 'طبقات الأمان' },
                { path: '/api/network/waterline/check',      method: 'POST',   descAr: 'فحص Zero-Trust' },
                { path: '/api/network/waterline/token',      method: 'POST',   descAr: 'إصدار رمز وصول' },
                { path: '/api/network/waterline/encrypt',    method: 'POST',   descAr: 'تشفير AES-256' },
                { path: '/api/network/neural/status',        method: 'GET',    descAr: 'حالة الشبكة العصبية' },
                { path: '/api/network/neural/topology',      method: 'GET',    descAr: 'طوبولوجيا العصبية' },
                { path: '/api/network/neural/infer',         method: 'POST',   descAr: 'استدلال عصبي' },
                { path: '/api/network/neural/recommend/product', method: 'POST', descAr: 'توصيات منتج' },
                { path: '/api/network/neural/recommend/user',    method: 'POST', descAr: 'توصيات مستخدم' },
                { path: '/api/network/neural/satellite',     method: 'POST',   descAr: 'تحليل الأقمار الصناعية' },
            ],
            verse: '﴿ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ﴾ — الحجرات: 13',
        },
    });
});

module.exports = router;
