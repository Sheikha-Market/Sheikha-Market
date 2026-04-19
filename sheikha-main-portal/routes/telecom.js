/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📡 مسارات منظومة شيخة للاتصالات والشبكات الكونية
 *  Sheikha Telecom & Universal Networks — API Routes
 *
 *  المرجع: SHEIKHA-TELECOM-NETWORK.md
 *  الميثاق: SHEIKHA-TELECOM-CHARTER.md
 *  ﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال: 60
 *
 *  المسارات الأساسية:
 *   GET  /api/telecom                        — لوحة القيادة الكونية
 *   GET  /api/telecom/network-status         — حالة الشبكة الكونية
 *   GET  /api/telecom/ai-nodes               — عقد الذكاء الاصطناعي
 *   POST /api/telecom/connect                — ربط المستخدمين والتجار
 *   POST /api/telecom/secure-channel         — قناة اتصال آمنة شرعياً
 *   GET  /api/telecom/knowledge-base         — قاعدة المعرفة الموحدة
 *
 *  مسارات الشبكة العصبية للاتصالات:
 *   GET  /api/telecom/neural                 — طوبولوجيا الشبكة العصبية الكاملة
 *   GET  /api/telecom/neural/cell/:id        — خلية عصبية محددة
 *   GET  /api/telecom/neural/domain/:domain  — خلايا نطاق معين
 *   POST /api/telecom/neural/signal          — إطلاق إشارة عصبية
 *   GET  /api/telecom/neural/signal          — إطلاق إشارة (GET)
 *
 *  مسارات منظمة الاتصالات:
 *   GET  /api/telecom/terrestrial            — الشبكات الأرضية
 *   GET  /api/telecom/satellite              — الأقمار الصناعية
 *   GET  /api/telecom/logistics              — الشبكات اللوجستية
 *   GET  /api/telecom/communities            — مجتمعات الاتصالات
 *   GET  /api/telecom/integration            — جسور التكامل
 *   GET  /api/telecom/search                 — البحث الشامل
 *   GET  /api/telecom/path                   — مسار الاتصال بين نقطتين
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ── تحميل الوحدات الأساسية ────────────────────────────────────────────────────

const { getNetworkStatus }        = require('../telecom/network-core/index');
const { getAINodes }              = require('../telecom/ai-network/index');
const { connectToCommerceNetwork} = require('../telecom/commerce-network/index');
const { getKnowledgeBase }        = require('../telecom/knowledge-network/index');
const { createSecureChannel, getGatewaySummary } = require('../telecom/universal-gateway/index');

// ── تحميل محرك منظمة الاتصالات (الشبكة العصبية) ─────────────────────────────

let telecomOrg = null;
try {
    telecomOrg = require('../core/comms/telecom-org').telecomOrg;
} catch (_) {
    // يعمل بدون المحرك العصبي إذا لم يكن متاحاً
}

// ── مساعد الاستجابة ──────────────────────────────────────────────────────────

function ok(res, data) {
    return res.json({ success: true, ...data, _telecom: 'Sheikha Universal Telecom v2.0' });
}

function fail(res, status, error, messageAr) {
    return res.status(status).json({ success: false, error, messageAr });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/telecom/network-status
// حالة الشبكة الكونية — الطبقات 1 و 2
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/network-status', (req, res) => {
    try {
        const status = getNetworkStatus();
        ok(res, { data: status });
    } catch (e) {
        fail(res, 500, 'network_status_error', 'حدث خطأ أثناء جلب حالة الشبكة');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/telecom/ai-nodes
// عقد الذكاء الاصطناعي — Sheikha Neural Engine — الطبقة 3
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/ai-nodes', (req, res) => {
    try {
        const nodes = getAINodes();
        ok(res, { data: nodes });
    } catch (e) {
        fail(res, 500, 'ai_nodes_error', 'حدث خطأ أثناء جلب عقد الذكاء الاصطناعي');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/telecom/connect
// ربط المستخدمين والتجار بالشبكة التجارية — الطبقة 4
// Body: { userId, type?, region? }
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/connect', (req, res) => {
    try {
        const { userId, type, region } = req.body || {};

        if (!userId) {
            return fail(res, 400, 'user_id_required', 'يرجى إرسال معرّف المستخدم (userId)');
        }

        const result = connectToCommerceNetwork({ userId, type, region });

        if (!result.success) {
            return fail(res, 400, result.error, result.messageAr);
        }

        ok(res, { data: result });
    } catch (e) {
        fail(res, 500, 'connect_error', 'حدث خطأ أثناء الاتصال بالشبكة التجارية');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/telecom/secure-channel
// إنشاء قناة اتصال آمنة شرعياً — البوابة الكونية
// Body: { fromId, toId, purpose?, encrypted? }
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/secure-channel', (req, res) => {
    try {
        const { fromId, toId, purpose, encrypted } = req.body || {};

        if (!fromId || !toId) {
            return fail(res, 400, 'missing_ids', 'يرجى إرسال معرّف المُرسِل (fromId) والمُستقبِل (toId)');
        }

        const channel = createSecureChannel({ fromId, toId, purpose, encrypted });

        if (!channel.success) {
            return fail(res, 400, channel.error, channel.messageAr);
        }

        ok(res, { data: channel });
    } catch (e) {
        fail(res, 500, 'secure_channel_error', 'حدث خطأ أثناء إنشاء القناة الآمنة');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/telecom/knowledge-base
// قاعدة المعرفة الموحدة — الطبقة 5
// Query: ?category=quran|hadith|fiqh|science|heritage|research
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/knowledge-base', (req, res) => {
    try {
        const { category } = req.query;
        const knowledge = getKnowledgeBase(category || null);
        ok(res, { data: knowledge });
    } catch (e) {
        fail(res, 500, 'knowledge_base_error', 'حدث خطأ أثناء جلب قاعدة المعرفة');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/telecom  (لوحة القيادة الكونية)
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/', (req, res) => {
    try {
        const gateway = getGatewaySummary();
        if (telecomOrg) {
            const dashboard = telecomOrg.getDashboard();
            return ok(res, { data: { gateway, org: dashboard } });
        }
        ok(res, { data: gateway });
    } catch (e) {
        fail(res, 500, 'gateway_error', 'حدث خطأ أثناء جلب لوحة القيادة الكونية');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🗺️ الشبكات الأرضية
// GET /api/telecom/terrestrial?id=<techId>
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/terrestrial', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك منظمة الاتصالات غير متاح');
    try {
        res.json(telecomOrg.getTerrestrial(req.query.id || null));
    } catch (e) {
        fail(res, 500, 'terrestrial_error', 'حدث خطأ أثناء جلب الشبكات الأرضية');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🛰️ الأقمار الصناعية
// GET /api/telecom/satellite?id=<id>&type=orbit|sector
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/satellite', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك منظمة الاتصالات غير متاح');
    try {
        res.json(telecomOrg.getSatellite(req.query.id || null, req.query.type || 'sector'));
    } catch (e) {
        fail(res, 500, 'satellite_error', 'حدث خطأ أثناء جلب بيانات الأقمار الصناعية');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 الشبكات اللوجستية
// GET /api/telecom/logistics?section=aviation|maritime|land
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/logistics', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك منظمة الاتصالات غير متاح');
    try {
        res.json(telecomOrg.getLogistics(req.query.section || null));
    } catch (e) {
        fail(res, 500, 'logistics_error', 'حدث خطأ أثناء جلب الشبكات اللوجستية');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 👥 مجتمعات الاتصالات
// GET /api/telecom/communities?id=<id>
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/communities', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك منظمة الاتصالات غير متاح');
    try {
        res.json(telecomOrg.getCommunities(req.query.id || null));
    } catch (e) {
        fail(res, 500, 'communities_error', 'حدث خطأ أثناء جلب مجتمعات الاتصالات');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 جسور التكامل
// GET /api/telecom/integration?id=<id>
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/integration', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك منظمة الاتصالات غير متاح');
    try {
        res.json(telecomOrg.getIntegrations(req.query.id || null));
    } catch (e) {
        fail(res, 500, 'integration_error', 'حدث خطأ أثناء جلب جسور التكامل');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 البحث الشامل
// GET /api/telecom/search?q=<كلمة>
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/search', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك منظمة الاتصالات غير متاح');
    try {
        const q = req.query.q || req.query.query || '';
        if (!q) return fail(res, 400, 'query_required', 'مطلوب: ?q=كلمة البحث');
        res.json(telecomOrg.search(q));
    } catch (e) {
        fail(res, 500, 'search_error', 'حدث خطأ أثناء البحث');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🛤️ مسار الاتصال بين نقطتين
// GET /api/telecom/path?from=<A>&to=<B>
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/path', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك منظمة الاتصالات غير متاح');
    try {
        const { from, to } = req.query;
        if (!from || !to) return fail(res, 400, 'params_required', 'مطلوب: ?from=TERRESTRIAL&to=SATELLITE');
        res.json(telecomOrg.getPath(from, to));
    } catch (e) {
        fail(res, 500, 'path_error', 'حدث خطأ أثناء حساب مسار الاتصال');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 الشبكة العصبية للاتصالات — Neural Cell Networks
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/telecom/neural — طوبولوجيا الشبكة العصبية الكاملة
router.get('/neural', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك الشبكة العصبية غير متاح');
    try {
        res.json(telecomOrg.getNeuralTopology());
    } catch (e) {
        fail(res, 500, 'neural_topology_error', 'حدث خطأ أثناء جلب طوبولوجيا الشبكة العصبية');
    }
});

// GET /api/telecom/neural/signal?from=<CELL_ID>&type=<type>&depth=<n>
router.get('/neural/signal', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك الشبكة العصبية غير متاح');
    try {
        const { from, type, depth } = req.query;
        if (!from) return fail(res, 400, 'from_required', 'مطلوب: ?from=CELL_FIBER&type=DATA&depth=3');
        res.json(telecomOrg.fireSignal(from, { type: type || 'ACTIVATION' }, depth));
    } catch (e) {
        fail(res, 500, 'neural_signal_error', 'حدث خطأ أثناء إطلاق الإشارة العصبية');
    }
});

// GET /api/telecom/neural/cell/:id — خلية عصبية محددة
router.get('/neural/cell/:id', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك الشبكة العصبية غير متاح');
    try {
        const cell = telecomOrg.getNeuralCell(req.params.id);
        if (!cell) return fail(res, 404, 'cell_not_found', `خلية غير موجودة: ${req.params.id}`);
        res.json(cell);
    } catch (e) {
        fail(res, 500, 'neural_cell_error', 'حدث خطأ أثناء جلب بيانات الخلية العصبية');
    }
});

// GET /api/telecom/neural/domain/:domain — خلايا نطاق معين
router.get('/neural/domain/:domain', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك الشبكة العصبية غير متاح');
    try {
        const cells = telecomOrg.getNeuralDomain(req.params.domain);
        res.json({ domain: req.params.domain, cells });
    } catch (e) {
        fail(res, 500, 'neural_domain_error', 'حدث خطأ أثناء جلب خلايا النطاق');
    }
});

// POST /api/telecom/neural/signal — إطلاق إشارة عصبية
// Body: { from, signal, depth }
router.post('/neural/signal', (req, res) => {
    if (!telecomOrg) return fail(res, 503, 'engine_unavailable', 'محرك الشبكة العصبية غير متاح');
    try {
        const { from, signal, depth } = req.body || {};
        if (!from) return fail(res, 400, 'from_required', 'مطلوب: { from: "CELL_FIBER", signal: {...}, depth: 3 }');
        res.json(telecomOrg.fireSignal(from, signal, depth));
    } catch (e) {
        fail(res, 500, 'neural_signal_error', 'حدث خطأ أثناء إطلاق الإشارة العصبية');
    }
});

module.exports = router;
