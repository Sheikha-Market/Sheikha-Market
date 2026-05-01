/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  PROTOCOL EVENTS — مسارات أحداث بروتوكول شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  GET  /api/protocol-events/health   — صحة حافلة الأحداث
 *  GET  /api/protocol-events/status   — حالة البروتوكول
 *  GET  /api/protocol-events/recent   — آخر الأحداث المُصدَرة
 */
'use strict';

const express = require('express');
const router  = express.Router();

let Protocol = null;
try {
  Protocol = require('../lib/sheikha-protocol');
} catch (e) {
  Protocol = null;
}

function ok(data, message = 'ok') {
  return { success: true, data, message, timestamp: new Date().toISOString() };
}

// ─── GET /api/protocol-events/health ─────────────────────────────────────────
router.get('/health', (_req, res) => {
  let busStatus = null;
  try {
    if (Protocol) busStatus = Protocol.bus().status();
  } catch (_) {}
  res.json(ok({
    service:       'sheikha-protocol-events',
    protocolLoaded: !!Protocol,
    status:         busStatus ? 'operational' : 'fallback',
    bus:            busStatus || { emitted: 0, listeners: 0 },
  }, 'حافلة أحداث البروتوكول تعمل'));
});

// ─── GET /api/protocol-events/status ─────────────────────────────────────────
router.get('/status', (_req, res) => {
  if (Protocol) {
    try {
      return res.json(ok(Protocol.status(), 'حالة البروتوكول'));
    } catch (e) {
      return res.json(ok({ error: e.message }, 'protocol error'));
    }
  }
  res.json(ok({ fallback: true, version: '2.0.0' }, 'fallback status'));
});

// ─── GET /api/protocol-events/recent ─────────────────────────────────────────
router.get('/recent', (_req, res) => {
  let history = [];
  try {
    if (Protocol) {
      const bus = Protocol.bus();
      // Use public getHistory() if available, otherwise return empty
      if (bus && typeof bus.getHistory === 'function') {
        history = bus.getHistory(20);
      }
    }
  } catch (_) {}
  res.json(ok({ count: history.length, events: history }, 'آخر الأحداث'));
});

module.exports = router;
