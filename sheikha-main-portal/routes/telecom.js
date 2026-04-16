/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📡 مسارات منظومة شيخة للاتصالات والشبكات الكونية
 *  Sheikha Telecom & Universal Networks — API Routes
 *
 *  المرجع: SHEIKHA-TELECOM-NETWORK.md
 *  الميثاق: SHEIKHA-TELECOM-CHARTER.md
 *  ﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال: 60
 *
 *  المسارات:
 *   GET  /api/telecom/network-status   — حالة الشبكة الكونية
 *   GET  /api/telecom/ai-nodes         — عقد الذكاء الاصطناعي
 *   POST /api/telecom/connect          — ربط المستخدمين والتجار
 *   POST /api/telecom/secure-channel   — قناة اتصال آمنة شرعياً
 *   GET  /api/telecom/knowledge-base   — قاعدة المعرفة الموحدة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ── تحميل الوحدات ─────────────────────────────────────────────────────────────

const { getNetworkStatus }        = require('../telecom/network-core/index');
const { getAINodes }              = require('../telecom/ai-network/index');
const { connectToCommerceNetwork} = require('../telecom/commerce-network/index');
const { getKnowledgeBase }        = require('../telecom/knowledge-network/index');
const { createSecureChannel, getGatewaySummary } = require('../telecom/universal-gateway/index');

// ── مساعد الاستجابة ──────────────────────────────────────────────────────────

function ok(res, data) {
    return res.json({ success: true, ...data, _telecom: 'Sheikha Universal Telecom v1.0' });
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
// GET /api/telecom  (ملخص البوابة الكونية)
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/', (req, res) => {
    try {
        const summary = getGatewaySummary();
        ok(res, { data: summary });
    } catch (e) {
        fail(res, 500, 'gateway_error', 'حدث خطأ أثناء جلب ملخص البوابة الكونية');
    }
});

module.exports = router;
