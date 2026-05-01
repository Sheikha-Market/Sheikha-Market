/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  MASTER NEURAL CELL NETWORK — مسارات شبكة الخلايا العصبية الكبرى
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  GET  /api/master-ncn/health     — صحة الشبكة
 *  GET  /api/master-ncn/status     — حالة الشبكة الكاملة
 *  POST /api/master-ncn/infer      — استدلال نصي
 *  POST /api/master-ncn/process    — معالجة أمر
 *  POST /api/master-ncn/compare    — مقارنة نصين
 *  GET  /api/master-ncn/topology   — هيكل الشبكة
 *  GET  /api/master-ncn/search     — بحث في الخلايا
 */
'use strict';

const express = require('express');
const router  = express.Router();

let NCN = null;
try {
  NCN = require('../lib/sheikha-master-neural-cell-network');
} catch (e) {
  NCN = null;
}

function ok(data, message = 'ok') {
  return { success: true, data, message, timestamp: new Date().toISOString() };
}

// ─── GET /api/master-ncn/health ──────────────────────────────────────────────
router.get('/health', (_req, res) => {
  const status = NCN ? NCN.status() : null;
  res.json(ok({
    service:      'sheikha-master-neural-cell-network',
    version:      NCN ? NCN.VERSION : 'n/a',
    engineLoaded: !!NCN,
    status:       NCN ? 'operational' : 'fallback',
    cells:        status ? status.cells : 100,
    layers:       status ? status.layers : 6,
    domains:      status ? status.domains : 7,
  }, 'شبكة الخلايا العصبية الكبرى تعمل'));
});

// ─── GET /api/master-ncn/status ──────────────────────────────────────────────
router.get('/status', (_req, res) => {
  if (NCN) return res.json(ok(NCN.status(), 'حالة الشبكة العصبية'));
  res.json(ok({ fallback: true, cells: 100, layers: 6, domains: 7 }, 'fallback status'));
});

// ─── POST /api/master-ncn/infer ──────────────────────────────────────────────
router.post('/infer', (req, res) => {
  const text = req.body?.text || req.body?.command || '';
  if (!text.trim()) return res.status(400).json({ success: false, message: 'النص مطلوب — text is required' });
  if (NCN) return res.json(ok(NCN.infer(text), 'تم الاستدلال'));
  res.json(ok({ fallback: true, text, domain: 'unknown', confidence: 0 }, 'fallback infer'));
});

// ─── POST /api/master-ncn/process ────────────────────────────────────────────
router.post('/process', (req, res) => {
  const text = req.body?.text || req.body?.command || '';
  if (!text.trim()) return res.status(400).json({ success: false, message: 'النص مطلوب — text is required' });
  if (NCN) return res.json(ok(NCN.process(text), 'تمت المعالجة'));
  res.json(ok({ fallback: true, text }, 'fallback process'));
});

// ─── POST /api/master-ncn/compare ────────────────────────────────────────────
router.post('/compare', (req, res) => {
  const a = req.body?.a || req.body?.textA || '';
  const b = req.body?.b || req.body?.textB || '';
  if (!a.trim() || !b.trim()) return res.status(400).json({ success: false, message: 'كلا النصين مطلوبان — both a and b are required' });
  if (NCN) return res.json(ok(NCN.compare(a, b), 'تمت المقارنة'));
  res.json(ok({ fallback: true, similarity: 0, a, b }, 'fallback compare'));
});

// ─── GET /api/master-ncn/topology ────────────────────────────────────────────
router.get('/topology', (_req, res) => {
  if (NCN) return res.json(ok(NCN.topology(), 'هيكل الشبكة'));
  res.json(ok({ fallback: true, layers: 6, cells: 100, embedDim: 64 }, 'fallback topology'));
});

// ─── GET /api/master-ncn/search ──────────────────────────────────────────────
router.get('/search', (req, res) => {
  const q = req.query.q || '';
  if (NCN) return res.json(ok(NCN.searchCells(q), 'نتائج البحث'));
  res.json(ok({ fallback: true, query: q, results: [] }, 'fallback search'));
});

module.exports = router;
