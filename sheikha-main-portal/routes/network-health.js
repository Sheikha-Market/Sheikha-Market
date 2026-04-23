// ═══════════════════════════════════════════════════════════════════════════════
// 🏥 Network Health — نقاط فحص صحة الاتصال لـ Azure Container Apps
// ═══════════════════════════════════════════════════════════════════════════════
// GET  /api/network/health   — فحص شامل (liveness + readiness)
// GET  /api/network/live     — liveness probe (بسيط — هل السيرفر حي؟)
// GET  /api/network/ready    — readiness probe (هل جاهز لخدمة الطلبات؟)
// GET  /api/network/status   — حالة تفصيلية لكل مكونات الشبكة
// ═══════════════════════════════════════════════════════════════════════════════

'use strict';

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();

// الوحدات الاختيارية — لا تُفشل السيرفر إن غابت
let offlineMode = null;
try { offlineMode = require('../lib/sheikha-offline-mode'); } catch (_) {}

let circuitBreaker = null;
try { circuitBreaker = require('../lib/sheikha-circuit-breaker'); } catch (_) {}

let realtimeHub = null;
try { realtimeHub = require('../lib/sheikha-realtime-hub'); } catch (_) {}

const DATA_DIR    = path.join(__dirname, '..', 'data');
const START_TIME  = Date.now();

// ─── مساعد: فحص القرص ────────────────────────────────────────────────────────
function checkDisk() {
    try {
        return fs.existsSync(DATA_DIR);
    } catch (_) {
        return false;
    }
}

// ─── مساعد: استهلاك الذاكرة ──────────────────────────────────────────────────
function memCheck() {
    const m      = process.memoryUsage();
    const heapMB = Math.round(m.heapUsed  / 1024 / 1024);
    const rssMB  = Math.round(m.rss       / 1024 / 1024);
    const pct    = Math.round((m.heapUsed / m.heapTotal) * 100);
    const ok     = rssMB < 512 && pct < 90;
    return { ok, heapMB, rssMB, pct };
}

// ─── GET /api/network/live ────────────────────────────────────────────────────
// Azure Container Apps — liveness probe
// يجب أن يرجع 200 دائماً ما دام السيرفر يعمل
router.get('/live', (_req, res) => {
    res.status(200).json({ status: 'alive', uptime: Math.round(process.uptime()) });
});

// ─── GET /api/network/ready ───────────────────────────────────────────────────
// Azure Container Apps — readiness probe
// يرجع 200 إذا الخادم جاهز، 503 إذا لم يكن جاهزاً
router.get('/ready', (_req, res) => {
    const disk = checkDisk();
    const mem  = memCheck();
    const ready = disk && mem.ok;

    res.status(ready ? 200 : 503).json({
        status:  ready ? 'ready' : 'not_ready',
        disk,
        memory:  mem,
    });
});

// ─── GET /api/network/health ─────────────────────────────────────────────────
// فحص صحة شامل لكل مكونات النظام
router.get('/health', (_req, res) => {
    const disk    = checkDisk();
    const mem     = memCheck();
    const uptime  = Math.round(process.uptime());

    // الاتصال والشبكة
    const netStatus = offlineMode
        ? offlineMode.status()
        : { connectivity: { isOnline: null }, homeNetwork: { isHomeUp: null } };

    // القواطع الدائرية
    const breakers = circuitBreaker ? circuitBreaker.allStatus() : [];

    // Realtime Hub
    const rtStatus = realtimeHub ? realtimeHub.status() : null;

    const healthy = disk;  // الحد الأدنى للعمل: وجود مجلد البيانات
    const degraded = !mem.ok || !netStatus.connectivity.isOnline;

    const httpStatus = healthy ? (degraded ? 200 : 200) : 503;

    res.status(httpStatus).json({
        success:   healthy,
        status:    healthy ? (degraded ? 'degraded' : 'healthy') : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime,
        pid:       process.pid,
        node:      process.version,
        checks: {
            server:  true,
            disk,
            memory:  mem,
        },
        network:     netStatus,
        circuitBreakers: breakers,
        realtime:    rtStatus ? {
            channels:     rtStatus.channels?.length,
            historyCount: rtStatus.historyCount,
        } : null,
        _offlineReady: true,  // ✅ النظام يعمل حتى offline
        _homeIndependent: true, // ✅ مستقل عن نظام المنزل الذكي
    });
});

// ─── GET /api/network/status ──────────────────────────────────────────────────
// حالة تفصيلية لمكونات الشبكة
router.get('/status', (_req, res) => {
    const netStatus = offlineMode ? offlineMode.status() : {};

    res.json({
        success:   true,
        timestamp: new Date().toISOString(),
        uptime:    Math.round(process.uptime()),
        ...netStatus,
        capabilities: {
            offlineMode:      true,
            syncQueue:        true,
            circuitBreaker:   !!circuitBreaker,
            resilientFetch:   true,
            realtimeHub:      !!realtimeHub,
            serviceWorker:    true, // من جانب المتصفح (sw.js v8)
            indexedDB:        true, // من جانب المتصفح
        },
    });
});

module.exports = router;
