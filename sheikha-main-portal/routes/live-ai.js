/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  مسارات شبكة الذكاء الاصطناعي الحية v2 — الأقوى · الأفضل · الأتقى          ║
 * ║                                                                              ║
 * ║  POST /api/ai/live/ask           — استعلام ذكي عام                          ║
 * ║  POST /api/ai/live/batch         — طلبات متعددة متوازية                     ║
 * ║  POST /api/ai/live/analyze       — تحليل بيانات                             ║
 * ║  POST /api/ai/live/sharia        — استفسار شرعي                             ║
 * ║  POST /api/ai/live/similarity    — تشابه دلالي بين نصين                     ║
 * ║  POST /api/ai/live/embed         — متجه تضمين نص                            ║
 * ║  POST /api/ai/live/deep-analyze  — تحليل عصبي عميق                          ║
 * ║  GET  /api/ai/live/status        — حالة الشبكة الكاملة                      ║
 * ║  GET  /api/ai/live/knowledge     — قاعدة المعرفة الإسلامية                  ║
 * ║  GET  /api/ai/live/neural/status — حالة الشبكة العصبية                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ"
 * "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ"
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── تحميل الشبكة ────────────────────────────────────────────────────────────

let liveAINetwork = null;

try {
    ({ liveAINetwork } = require('../lib/sheikha-live-ai-network'));
} catch (e) {
    console.error('❌ [LIVE-AI v2 ROUTES] فشل تحميل الشبكة:', e.message);
}

async function ensureNetwork() {
    if (!liveAINetwork) throw new Error('شبكة الذكاء الاصطناعي غير متاحة');
    if (liveAINetwork.status !== 'ALIVE') await liveAINetwork.ignite();
    return liveAINetwork;
}

// ─── GET /api/ai/live — فهرس المسارات ──────────────────────────────────────

router.get('/', async (req, res) => {
    try {
        const net    = await ensureNetwork();
        const status = net.getStatus();
        return res.json({
            success:  true,
            nameAr:   status.nameAr,
            nameEn:   status.nameEn,
            version:  status.version,
            status:   status.status,
            tawheed:  status.tawheed,
            itqan:    status.itqan,
            neural:   status.neural,
            endpoints: [
                'POST /api/ai/live/ask           — استعلام ذكي عام',
                'POST /api/ai/live/batch         — طلبات متعددة متوازية',
                'POST /api/ai/live/analyze       — تحليل بيانات',
                'POST /api/ai/live/sharia        — استفسار شرعي',
                'POST /api/ai/live/similarity    — تشابه دلالي بين نصين',
                'POST /api/ai/live/embed         — متجه تضمين نص',
                'POST /api/ai/live/deep-analyze  — تحليل عصبي عميق',
                'GET  /api/ai/live/status        — حالة الشبكة',
                'GET  /api/ai/live/knowledge     — قاعدة المعرفة الإسلامية',
                'GET  /api/ai/live/neural/status — حالة الشبكة العصبية',
            ],
            verses: [
                '"وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة:٣١',
                '"وَقُل رَّبِّ زِدْنِي عِلْمًا" — طه:١١٤',
            ],
        });
    } catch (err) {
        return res.status(503).json({ success: false, error: err.message });
    }
});

// ─── GET /api/ai/live/status ─────────────────────────────────────────────────

router.get('/status', async (req, res) => {
    try {
        const net = await ensureNetwork();
        return res.json({ success: true, data: net.getStatus(), meta: { timestamp: new Date().toISOString() } });
    } catch (err) {
        return res.status(503).json({ success: false, error: err.message });
    }
});

// ─── GET /api/ai/live/neural/status ─────────────────────────────────────────

router.get('/neural/status', async (req, res) => {
    try {
        const net    = await ensureNetwork();
        const status = net.getStatus();
        return res.json({
            success: true,
            neural:  status.neural,
            nodes:   Object.entries(status.nodes).map(([id, n]) => ({
                id,
                role:         n.role,
                neuralReady:  n.neuralReady,
                neuralVocab:  n.neuralVocab,
                processed:    n.processed,
                topIntents:   n.topIntents,
            })),
            meta: { timestamp: new Date().toISOString(), version: status.version },
        });
    } catch (err) {
        return res.status(503).json({ success: false, error: err.message });
    }
});

// ─── GET /api/ai/live/knowledge ──────────────────────────────────────────────

router.get('/knowledge', async (req, res) => {
    try {
        const net    = await ensureNetwork();
        const domain = req.query.domain;
        return res.json(net.getKnowledge(domain));
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
                error: 'يجب تقديم نص أو نية | Provide text or intent',
            });
        }

        const result = await net.ask({ text: inputText, intent, lang, context });
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── POST /api/ai/live/batch ─────────────────────────────────────────────────

router.post('/batch', async (req, res) => {
    try {
        const net = await ensureNetwork();
        const { requests } = req.body || {};

        if (!Array.isArray(requests) || requests.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'يجب تقديم مصفوفة requests | Provide an array of requests',
            });
        }
        if (requests.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'الحد الأقصى 100 طلب في batch واحد',
            });
        }

        const result = await net.batch(requests);
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

        const intent = ['market', 'analytics', 'trade'].includes(type) ? type : 'analytics';
        const result = await net.ask({ text, intent, lang });
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

// ─── POST /api/ai/live/similarity ────────────────────────────────────────────

router.post('/similarity', async (req, res) => {
    try {
        const net = await ensureNetwork();
        const { text1, text2 } = req.body || {};

        if (!text1 || !text2) {
            return res.status(400).json({
                success: false,
                error: 'يجب تقديم text1 و text2 | Provide text1 and text2',
            });
        }

        const result = await net.similarity(text1, text2);
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── POST /api/ai/live/embed ─────────────────────────────────────────────────

router.post('/embed', async (req, res) => {
    try {
        const net = await ensureNetwork();
        const { text } = req.body || {};

        if (!text) {
            return res.status(400).json({ success: false, error: 'يجب تقديم نص | Provide text' });
        }

        const result = await net.embed(text);
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── POST /api/ai/live/deep-analyze ─────────────────────────────────────────

router.post('/deep-analyze', async (req, res) => {
    try {
        const net = await ensureNetwork();
        const { text } = req.body || {};

        if (!text) {
            return res.status(400).json({ success: false, error: 'يجب تقديم نص | Provide text' });
        }

        const result = await net.analyzeDeep(text);
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
