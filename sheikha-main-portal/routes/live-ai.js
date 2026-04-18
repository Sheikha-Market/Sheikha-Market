/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   مسارات شبكة الذكاء الاصطناعي الحية — Live AI Network Routes               ║
 * ║   POST /api/ai/live/ask      — استعلام ذكي                                  ║
 * ║   GET  /api/ai/live/status   — حالة الشبكة                                  ║
 * ║   POST /api/ai/live/analyze  — تحليل السوق والبيانات                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ"
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── تحميل الشبكة ────────────────────────────────────────────────────────────

let liveAINetwork = null;

try {
    ({ liveAINetwork } = require('../lib/sheikha-live-ai-network'));
} catch (e) {
    console.error('❌ [LIVE-AI ROUTES] فشل تحميل الشبكة:', e.message);
}

// تشغيل الشبكة عند أول طلب (lazy ignition)
async function ensureNetwork() {
    if (!liveAINetwork) throw new Error('شبكة الذكاء الاصطناعي غير متاحة');
    if (liveAINetwork.status !== 'ALIVE') {
        await liveAINetwork.ignite();
    }
    return liveAINetwork;
}

// ─── GET /api/ai/live/status ─────────────────────────────────────────────────

router.get('/status', async (req, res) => {
    try {
        const net = await ensureNetwork();
        return res.json({
            success: true,
            data:    net.getStatus(),
            meta:    { timestamp: new Date().toISOString() },
        });
    } catch (err) {
        return res.status(503).json({ success: false, error: err.message });
    }
});

// ─── POST /api/ai/live/ask ───────────────────────────────────────────────────

router.post('/ask', async (req, res) => {
    try {
        const net = await ensureNetwork();

        const { text, query, message, intent, lang, context } = req.body || {};
        const inputText = text || query || message || '';

        if (!inputText && !intent) {
            return res.status(400).json({
                success: false,
                error:   'يجب تقديم نص أو نية | Provide text or intent',
            });
        }

        const result = await net.ask({ text: inputText, intent, lang, context });

        return res.json(result);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── POST /api/ai/live/analyze ───────────────────────────────────────────────

router.post('/analyze', async (req, res) => {
    try {
        const net = await ensureNetwork();

        const { data, type = 'market', lang = 'ar' } = req.body || {};

        const text = typeof data === 'string'
            ? data
            : `تحليل ${type}: ${JSON.stringify(data || {}).substring(0, 200)}`;

        const result = await net.ask({ text, intent: type === 'market' ? 'market' : 'analytics', lang });

        return res.json(result);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── POST /api/ai/live/sharia ────────────────────────────────────────────────

router.post('/sharia', async (req, res) => {
    try {
        const net = await ensureNetwork();

        const { question, lang = 'ar' } = req.body || {};

        if (!question) {
            return res.status(400).json({ success: false, error: 'يجب تقديم سؤال شرعي' });
        }

        const result = await net.ask({ text: question, intent: 'sharia', lang });

        return res.json(result);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── GET /api/ai/live ────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
    try {
        const net = await ensureNetwork();
        const status = net.getStatus();

        return res.json({
            success:  true,
            nameAr:   status.nameAr,
            nameEn:   status.nameEn,
            version:  status.version,
            status:   status.status,
            tawheed:  status.tawheed,
            endpoints: [
                'POST /api/ai/live/ask      — استعلام ذكي عام',
                'POST /api/ai/live/analyze  — تحليل بيانات',
                'POST /api/ai/live/sharia   — استفسار شرعي',
                'GET  /api/ai/live/status   — حالة الشبكة',
            ],
            verse: '"وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة:٣١',
        });
    } catch (err) {
        return res.status(503).json({ success: false, error: err.message });
    }
});

module.exports = router;
