/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  مسارات شبكة شيخة العصبية — Neural Network Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  «وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا» — البقرة ٣١
 *
 *  يُعرّض هذا الملف الشبكة العصبية لشيخة عبر REST API:
 *  - GET  /api/neural/status     — حالة الشبكة العصبية
 *  - GET  /api/neural/servers    — حالة خوادم SDK / IDE / MCP
 *  - POST /api/neural/predict    — تنبؤ بسيط عبر الشبكة العصبية
 *  - GET  /api/neural/activate   — تفعيل الشبكة العصبية
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

module.exports = router;
