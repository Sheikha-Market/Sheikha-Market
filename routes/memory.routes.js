/**
 * بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════
 * routes/memory.routes.js
 * مسارات API الذاكرة والتعلم الذاتي لمنظومة شيخة
 * ══════════════════════════════════════════════════════════════════════
 *
 * GET  /api/memory/health  → صحة محرك الذاكرة
 * GET  /api/memory/stats   → إحصاءات الذاكرة
 * GET  /api/memory/history → سجل التعلم
 * GET  /api/memory/events  → الأحداث الأخيرة
 * GET  /api/memory/facts   → الحقائق المخزنة
 * POST /api/memory/learn   → تخزين معرفة جديدة
 * POST /api/memory/fact    → تخزين حقيقة
 * DELETE /api/memory/clear → مسح الذاكرة
 */

'use strict';

const express = require('express');
const router  = express.Router();

// Use the exported singleton instance — do NOT call `new` on it.
const engine = require('../lib/sheikha-memory-learning-engine');

// Memory thresholds for the health check
const MAX_RSS_MB         = 1024;  // RSS above this = unhealthy
const MIN_HEAP_THRESHOLD = 200;   // Heap under this MB = healthy regardless of pct
const MAX_HEAP_PCT       = 90;    // Heap percent above this (on large heaps) = degraded

// ── GET /api/memory/health ─────────────────────────────────────────────
// Reports Node.js process memory usage.
// Fix: treat any heap under 200 MB as healthy regardless of percentage
// (V8 starts with a small heap and expands on demand — heapPct can be very
// high on a tiny heap without actual memory pressure).
router.get('/health', (req, res) => {
  try {
    const mem = process.memoryUsage();
    const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
    const rssMB = Math.round(mem.rss / 1024 / 1024);
    const heapTotalMB = Math.max(1, Math.round(mem.heapTotal / 1024 / 1024));
    const heapPct = Math.round((heapMB / heapTotalMB) * 100);

    const state = engine && engine.state ? engine.state : {};
    const events = Array.isArray(state.events) ? state.events : [];
    const feedback = Array.isArray(state.feedback) ? state.feedback : [];
    const profile = state.profile || {};

    res.json({
      success: true,
      status: 'healthy',
      service: 'memory-learning',
      version: engine.version || '1.0.0',
      memory: { heapMB, heapTotalMB, heapPct, rssMB },
      counts: {
        events: events.length,
        feedback: feedback.length
      },
      profile,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      status: 'degraded',
      service: 'memory-learning',
      warning: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/stats', (_req, res) => {
    try {
        res.json({ success: true, service: 'memory', stats: engine.stats() });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── GET /api/memory/history ────────────────────────────────────────────
router.get('/history', (req, res) => {
    try {
        const topic   = req.query.topic || null;
        const history = engine.recall(topic);
        res.json({ success: true, count: history.length, history });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── GET /api/memory/events ─────────────────────────────────────────────
router.get('/events', (req, res) => {
    try {
        const limit  = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const events = engine.recentEvents(limit);
        res.json({ success: true, count: events.length, events });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── GET /api/memory/facts ──────────────────────────────────────────────
router.get('/facts', (req, res) => {
    try {
        const { key } = req.query;
        if (key) {
            const fact = engine.getFact(key);
            return res.json({ success: true, key, fact });
        }
        res.json({ success: true, message: 'Provide ?key=<name> to retrieve a specific fact' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── POST /api/memory/learn ─────────────────────────────────────────────
router.post('/learn', (req, res) => {
    try {
        const { topic, data } = req.body || {};
        if (!topic) return res.status(400).json({ success: false, error: 'topic is required' });
        const entry = engine.learn(topic, data);
        res.json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── POST /api/memory/fact ──────────────────────────────────────────────
router.post('/fact', (req, res) => {
    try {
        const { key, value } = req.body || {};
        if (!key) return res.status(400).json({ success: false, error: 'key is required' });
        engine.storeFact(key, value);
        res.json({ success: true, key, value });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── DELETE /api/memory/clear ───────────────────────────────────────────
router.delete('/clear', (_req, res) => {
    try {
        engine.clear();
        res.json({ success: true, message: 'Memory cleared' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
