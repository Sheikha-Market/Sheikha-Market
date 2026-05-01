/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  مسارات شبكة شيخة العصبية — Neural Network Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  «وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا» — البقرة ٣١
 *  «وَوَضَعَ الْمِيزَانَ أَلَّا تَطْغَوْا فِي الْمِيزَانِ» — الرحمن ٧-٨
 *
 *  يُعرّض هذا الملف الشبكة العصبية لشيخة عبر REST API:
 *  - GET  /api/neural/status        — حالة الشبكة العصبية
 *  - GET  /api/neural/servers       — حالة خوادم SDK / IDE / MCP
 *  - POST /api/neural/predict       — تنبؤ بسيط عبر الشبكة العصبية
 *  - GET  /api/neural/activate      — تفعيل الشبكة العصبية
 *
 *  ── نظام القياس الاحترافي FIO ─────────────────────────────────────────────
 *  - GET  /api/neural/fio/status    — حالة محرك FIO والشبكة
 *  - POST /api/neural/fio/benchmark — تشغيل جلسة قياس كاملة
 *  - GET  /api/neural/fio/speed     — قياس سرعة الاستدلال
 *  - GET  /api/neural/fio/layers    — قياس كمون الطبقات
 *  - GET  /api/neural/fio/throughput — قياس إنتاجية I/O
 *  - GET  /api/neural/fio/accuracy  — قياس دقة الشبكة
 *  - GET  /api/neural/fio/density   — قياس كثافة الشبكة
 *  - GET  /api/neural/fio/history   — تاريخ جلسات القياس
 */

'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.join(__dirname, '..');

// ─── تحميل محرك الشبكة العصبية ─────────────────────────────────────────────
let neuralCore = null;
let neuralCoreStatus = 'not-loaded';

function loadNeuralCore() {
    if (neuralCore) return neuralCore;
    try {
        const NeuralCore = require('../lib/sheikha-neural-core.js');
        // المحرك قد يكون class أو module عادي
        if (typeof NeuralCore === 'function') {
            neuralCore = new NeuralCore();
        } else {
            neuralCore = NeuralCore;
        }
        neuralCoreStatus = 'active';
        console.log('✅ [NEURAL ROUTE] sheikha-neural-core.js — مُحمَّل بنجاح');
    } catch (e) {
        neuralCoreStatus = 'error';
        console.log('⚠️ [NEURAL ROUTE] sheikha-neural-core.js — خطأ:', e.message);
    }
    return neuralCore;
}

// ─── فحص خوادم SDK/IDE عبر HTTP ─────────────────────────────────────────────
function pingServer(url, timeout = 3000) {
    return new Promise((resolve) => {
        const req = http.get(url, { timeout }, (res) => {
            let body = '';
            res.on('data', (c) => { body += c; });
            res.on('end', () => {
                try { resolve({ reachable: true, status: res.statusCode, data: JSON.parse(body) }); }
                catch (_) { resolve({ reachable: true, status: res.statusCode }); }
            });
        });
        req.on('error', () => resolve({ reachable: false }));
        req.on('timeout', () => { req.destroy(); resolve({ reachable: false, reason: 'timeout' }); });
    });
}

// ─── GET /api/neural/status ──────────────────────────────────────────────────
router.get('/status', (req, res) => {
    loadNeuralCore();

    const neuralFile = path.join(ROOT, 'lib', 'sheikha-neural-core.js');
    const portNetFile = path.join(ROOT, 'core', 'ports', 'neural-network.js');
    const mcpFile = path.join(ROOT, 'mcp-servers', 'sheikha-mcp-server.js');
    const sdkFile = path.join(ROOT, 'mcp-servers', 'sheikha-sdk-server.js');
    const ideFile = path.join(ROOT, 'mcp-servers', 'sheikha-ide-server.js');

    res.json({
        success: true,
        neural: {
            status: neuralCoreStatus,
            core: { file: 'lib/sheikha-neural-core.js', exists: fs.existsSync(neuralFile) },
            portNetwork: { file: 'core/ports/neural-network.js', exists: fs.existsSync(portNetFile) }
        },
        servers: {
            mcp: { file: 'mcp-servers/sheikha-mcp-server.js', exists: fs.existsSync(mcpFile), type: 'stdio' },
            sdk: { file: 'mcp-servers/sheikha-sdk-server.js', exists: fs.existsSync(sdkFile), port: 3001, startCmd: 'npm run start:sdk' },
            ide: { file: 'mcp-servers/sheikha-ide-server.js', exists: fs.existsSync(ideFile), port: 3002, startCmd: 'npm run start:ide' }
        },
        quran: { ref: 'البقرة:٣١', text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا' },
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/neural/activate ────────────────────────────────────────────────
router.get('/activate', (req, res) => {
    const before = neuralCoreStatus;
    const core = loadNeuralCore();
    const after = neuralCoreStatus;

    res.json({
        success: after === 'active',
        message: after === 'active'
            ? '✅ شبكة شيخة العصبية مُفعَّلة — بسم الله الرحمن الرحيم'
            : '⚠️ تعذّر تفعيل الشبكة العصبية — راجع السجلات',
        before,
        after,
        coreMethods: core ? (
            typeof core === 'object' && core.constructor !== Object
                ? Object.getOwnPropertyNames(Object.getPrototypeOf(core)).filter((m) => m !== 'constructor')
                : Object.getOwnPropertyNames(core).filter((m) => typeof core[m] === 'function')
        ) : [],
        timestamp: new Date().toISOString(),
        quran: { ref: 'البقرة:٣١', text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا' }
    });
});

// ─── GET /api/neural/servers ─────────────────────────────────────────────────
router.get('/servers', async (req, res) => {
    const [sdkPing, idePing] = await Promise.all([
        pingServer('http://localhost:3001/sdk/health'),
        pingServer('http://localhost:3002/ide/health')
    ]);

    res.json({
        success: true,
        servers: {
            main:  { port: parseInt(process.env.PORT || '8080', 10), status: 'running', type: 'main' },
            mcp:   { type: 'stdio', transport: 'stdio', startCmd: 'npm --prefix mcp-servers run start:sheikha', note: 'خادم MCP — يعمل عبر stdio مع Cursor/Claude' },
            sdk:   { port: 3001, reachable: sdkPing.reachable, status: sdkPing.reachable ? 'running' : 'stopped', startCmd: 'npm --prefix mcp-servers run start:sdk', docs: 'http://localhost:3001/sdk/docs' },
            ide:   { port: 3002, reachable: idePing.reachable, status: idePing.reachable ? 'running' : 'stopped', startCmd: 'npm --prefix mcp-servers run start:ide', docs: 'http://localhost:3002/ide/docs' }
        },
        startAll: 'npm --prefix mcp-servers run start:all',
        timestamp: new Date().toISOString()
    });
});

// ─── POST /api/neural/predict ────────────────────────────────────────────────
router.post('/predict', (req, res) => {
    const { input, type = 'text' } = req.body || {};

    if (!input) {
        return res.status(400).json({ success: false, error: 'الحقل "input" مطلوب' });
    }

    const core = loadNeuralCore();

    // تنبؤ مبسط — إذا كان المحرك لديه دالة predict نستخدمها، وإلا نُعيد نتيجة مُعالجة
    let prediction;
    try {
        if (core && typeof core.predict === 'function') {
            prediction = core.predict(input);
        } else if (core && typeof core.process === 'function') {
            prediction = core.process(input);
        } else {
            // معالجة محلية بسيطة
            const tokens = String(input).trim().split(/\s+/);
            prediction = {
                tokens,
                length: tokens.length,
                arabic: /[\u0600-\u06FF]/.test(String(input)),
                confidence: 0.75,
                note: 'تنبؤ مبسط — المحرك العصبي الكامل يحتاج تدريباً'
            };
        }
    } catch (e) {
        prediction = { error: e.message, fallback: true };
    }

    res.json({
        success: true,
        input: String(input).substring(0, 500),
        type,
        prediction,
        neuralStatus: neuralCoreStatus,
        timestamp: new Date().toISOString()
    });
});

// ─── تحميل محرك FIO ──────────────────────────────────────────────────────────
let fioEngine = null;

function loadFIOEngine() {
    if (fioEngine) return fioEngine;
    try {
        const { getFIOEngine } = require('../lib/sheikha-neural-fio-engine.js');
        fioEngine = getFIOEngine();
        console.log('✅ [NEURAL ROUTE] sheikha-neural-fio-engine.js — مُحمَّل بنجاح');
    } catch (e) {
        console.log('⚠️ [NEURAL ROUTE] sheikha-neural-fio-engine.js — خطأ:', e.message);
    }
    return fioEngine;
}

// ─── GET /api/neural/fio/status ──────────────────────────────────────────────
router.get('/fio/status', (req, res) => {
    const engine = loadFIOEngine();
    res.json({
        success: true,
        fio: {
            loaded:  Boolean(engine),
            version: engine ? engine.version : null,
            schema:  engine ? engine.schema  : null,
            tawheed: engine ? engine.tawheed : null,
            hasNetwork: engine ? Boolean(engine._network) : false,
        },
        quran:     { ref: 'الرحمن:٧-٨', text: 'وَوَضَعَ الْمِيزَانَ أَلَّا تَطْغَوْا فِي الْمِيزَانِ' },
        timestamp: new Date().toISOString(),
    });
});

// ─── POST /api/neural/fio/benchmark ──────────────────────────────────────────
router.post('/fio/benchmark', async (req, res) => {
    const engine = loadFIOEngine();
    if (!engine) {
        return res.status(503).json({ success: false, error: 'محرك FIO غير محمَّل' });
    }
    if (!engine._network) {
        return res.status(503).json({ success: false, error: 'الشبكة العصبية غير مضبوطة في محرك FIO' });
    }

    try {
        const options = req.body || {};
        const report  = await engine.runFullBenchmark(options);
        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── GET /api/neural/fio/speed ───────────────────────────────────────────────
router.get('/fio/speed', (req, res) => {
    const engine = loadFIOEngine();
    if (!engine || !engine._network) {
        return res.status(503).json({ success: false, error: 'محرك FIO أو الشبكة غير مضبوطة' });
    }
    try {
        const runs   = parseInt(req.query.runs, 10) || 100;
        const result = engine.measureInferenceSpeed(runs);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── GET /api/neural/fio/layers ──────────────────────────────────────────────
router.get('/fio/layers', (req, res) => {
    const engine = loadFIOEngine();
    if (!engine || !engine._network) {
        return res.status(503).json({ success: false, error: 'محرك FIO أو الشبكة غير مضبوطة' });
    }
    try {
        const runs   = parseInt(req.query.runs, 10) || 50;
        const result = engine.measureLayerLatency(runs);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── GET /api/neural/fio/throughput ──────────────────────────────────────────
router.get('/fio/throughput', (req, res) => {
    const engine = loadFIOEngine();
    if (!engine || !engine._network) {
        return res.status(503).json({ success: false, error: 'محرك FIO أو الشبكة غير مضبوطة' });
    }
    try {
        const ms     = parseInt(req.query.ms, 10) || 2000;
        const result = engine.measureIOThroughput(ms);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── GET /api/neural/fio/accuracy ────────────────────────────────────────────
router.get('/fio/accuracy', (req, res) => {
    const engine = loadFIOEngine();
    if (!engine || !engine._network) {
        return res.status(503).json({ success: false, error: 'محرك FIO أو الشبكة غير مضبوطة' });
    }
    try {
        const result = engine.measureAccuracy();
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── GET /api/neural/fio/density ─────────────────────────────────────────────
router.get('/fio/density', (req, res) => {
    const engine = loadFIOEngine();
    if (!engine || !engine._network) {
        return res.status(503).json({ success: false, error: 'محرك FIO أو الشبكة غير مضبوطة' });
    }
    try {
        const runs   = parseInt(req.query.runs, 10) || 50;
        const result = engine.measureNetworkDensity(runs);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── GET /api/neural/fio/history ─────────────────────────────────────────────
router.get('/fio/history', (req, res) => {
    const engine = loadFIOEngine();
    if (!engine) {
        return res.status(503).json({ success: false, error: 'محرك FIO غير محمَّل' });
    }
    res.json({ success: true, history: engine.getHistory() });
});

module.exports = router;
