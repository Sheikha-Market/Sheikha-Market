#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  SHEIKHA SDK SERVER — خادم SDK شيخة المستقل
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  «وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى» — المائدة ٢
 *  «إنَّ اللَّهَ يُحبُّ إذا عَمِلَ أحَدُكُم عَمَلًا أن يُتقِنَه» — البيهقي
 *
 *  الأهداف:
 *  ١. تعريض SDK شيخة عبر HTTP REST API
 *  ٢. تمكين المطورين من التكامل مع منظومة شيخة
 *  ٣. فحص صحة المكتبات والمحركات المتاحة
 *  ٤. توثيق تلقائي لكل endpoint
 *
 *  المنفذ الافتراضي: 3001
 *  المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const SDK_PORT = parseInt(process.env.SHEIKHA_SDK_PORT || '3001', 10);
const MAIN_API = process.env.SHEIKHA_MAIN_URL || 'http://localhost:8080';
const ROOT = path.join(__dirname, '..');

// ─── مسارات ──────────────────────────────────────────────────────────────────
const LIB_DIR = path.join(ROOT, 'lib');
const DATA_DIR = path.join(ROOT, 'data');
const MCP_DIR = __dirname;

// ─── دوال مساعدة ─────────────────────────────────────────────────────────────

function sendJSON(res, status, data) {
    const body = JSON.stringify(data, null, 2);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Sheikha-SDK': 'v1.0.0',
        'X-Server': 'Sheikha-SDK-Server'
    });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
            try { resolve(JSON.parse(body || '{}')); }
            catch (_) { resolve({}); }
        });
        req.on('error', () => resolve({}));
    });
}

function callMainAPI(apiPath, timeout = 8000) {
    return new Promise((resolve) => {
        const url = `${MAIN_API}${apiPath}`;
        const mod = url.startsWith('https') ? require('https') : http;
        const req = mod.get(url, { timeout }, (res) => {
            let data = '';
            res.on('data', (c) => { data += c; });
            res.on('end', () => {
                try { resolve({ ok: true, data: JSON.parse(data) }); }
                catch (_) { resolve({ ok: true, data: { raw: data } }); }
            });
        });
        req.on('error', (e) => resolve({ ok: false, error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    });
}

// ─── قوائم المكتبات والبيانات ─────────────────────────────────────────────────

function listEngines(filter) {
    try {
        let files = fs.readdirSync(LIB_DIR).filter((f) => f.endsWith('.js') && !f.includes('.backup'));
        if (filter) files = files.filter((f) => f.toLowerCase().includes(filter.toLowerCase()));
        return files.map((f) => {
            const fullPath = path.join(LIB_DIR, f);
            const stat = fs.statSync(fullPath);
            return {
                file: f,
                name: f.replace('sheikha-', '').replace('-engine.js', '').replace('.js', ''),
                sizeKB: Math.round(stat.size / 1024),
                modifiedAt: stat.mtime.toISOString()
            };
        });
    } catch (_) { return []; }
}

function listDataFiles(filter) {
    try {
        let files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
        if (filter) files = files.filter((f) => f.toLowerCase().includes(filter.toLowerCase()));
        return files.map((f) => {
            const stat = fs.statSync(path.join(DATA_DIR, f));
            return { file: f, sizeKB: Math.round(stat.size / 1024), modifiedAt: stat.mtime.toISOString() };
        });
    } catch (_) { return []; }
}

function sdkHealthCheck() {
    const checks = {
        libDir: fs.existsSync(LIB_DIR),
        dataDir: fs.existsSync(DATA_DIR),
        mcpServer: fs.existsSync(path.join(MCP_DIR, 'sheikha-mcp-server.js')),
        visionMcp: fs.existsSync(path.join(MCP_DIR, 'sheikha-vision-mcp.js')),
        ideServer: fs.existsSync(path.join(MCP_DIR, 'sheikha-ide-server.js')),
        mcpSdk: fs.existsSync(path.join(MCP_DIR, 'node_modules', '@modelcontextprotocol', 'sdk'))
    };
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    return {
        healthy: passed === total,
        score: Math.round((passed / total) * 100),
        checks,
        engines: listEngines().length,
        dataFiles: listDataFiles().length
    };
}

// ─── SDK API Routes ────────────────────────────────────────────────────────────

const ROUTES = {

    // ── GET /sdk/health ──────────────────────────────────────────────────────
    'GET /sdk/health': async (_req, res) => {
        const health = sdkHealthCheck();
        sendJSON(res, health.healthy ? 200 : 207, {
            success: true,
            server: 'Sheikha SDK Server',
            version: '1.0.0',
            port: SDK_PORT,
            timestamp: new Date().toISOString(),
            health
        });
    },

    // ── GET /sdk/engines ─────────────────────────────────────────────────────
    'GET /sdk/engines': async (req, res) => {
        const url = new URL(req.url, `http://localhost`);
        const filter = url.searchParams.get('filter') || '';
        const engines = listEngines(filter);
        sendJSON(res, 200, {
            success: true,
            count: engines.length,
            filter: filter || null,
            engines,
            timestamp: new Date().toISOString()
        });
    },

    // ── GET /sdk/data ────────────────────────────────────────────────────────
    'GET /sdk/data': async (req, res) => {
        const url = new URL(req.url, `http://localhost`);
        const filter = url.searchParams.get('filter') || '';
        const files = listDataFiles(filter);
        sendJSON(res, 200, {
            success: true,
            count: files.length,
            filter: filter || null,
            files,
            timestamp: new Date().toISOString()
        });
    },

    // ── GET /sdk/status ──────────────────────────────────────────────────────
    'GET /sdk/status': async (_req, res) => {
        const mainStatus = await callMainAPI('/api/health');
        const health = sdkHealthCheck();
        sendJSON(res, 200, {
            success: true,
            sdkServer: { status: 'running', port: SDK_PORT, version: '1.0.0' },
            mainServer: mainStatus.ok ? mainStatus.data : { status: 'unreachable', error: mainStatus.error },
            health,
            timestamp: new Date().toISOString(),
            quran: { ref: 'آل عمران:١٥٩', text: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ' }
        });
    },

    // ── POST /sdk/sharia-check ───────────────────────────────────────────────
    'POST /sdk/sharia-check': async (req, res) => {
        const body = await readBody(req);
        const { code, context } = body;
        if (!code) {
            return sendJSON(res, 400, { success: false, error: 'الحقل "code" مطلوب' });
        }
        // فحص مبسط — يُفوَّض للخادم الرئيسي إن كان متاحاً
        const result = await callMainAPI(`/api/sharia/check`);
        const localCheck = {
            input: { code: code.substring(0, 200), context: context || 'general' },
            patterns: {
                riba: /ربا|riba|interest|فائدة/.test(code.toLowerCase()),
                gharar: /غرر|gharar|gambling|قمار/.test(code.toLowerCase()),
                haram: /حرام|haram|alcohol|خمر|pork|خنزير/.test(code.toLowerCase())
            },
            verdict: 'يحتاج مراجعة من عالم شرعي متخصص',
            note: 'هذا فحص أولي آلي — لا يُغني عن الفتوى الشرعية المعتمدة'
        };
        localCheck.flagged = Object.values(localCheck.patterns).some(Boolean);
        sendJSON(res, 200, {
            success: true,
            shariaCheck: localCheck,
            mainApiResponse: result.ok ? result.data : null,
            timestamp: new Date().toISOString()
        });
    },

    // ── GET /sdk/neural ──────────────────────────────────────────────────────
    'GET /sdk/neural': async (_req, res) => {
        const neuralFile = path.join(ROOT, 'lib', 'sheikha-neural-core.js');
        const exists = fs.existsSync(neuralFile);
        let info = { file: 'sheikha-neural-core.js', exists };
        if (exists) {
            const stat = fs.statSync(neuralFile);
            info.sizeKB = Math.round(stat.size / 1024);
            info.modifiedAt = stat.mtime.toISOString();
        }
        const portNetFile = path.join(ROOT, 'core', 'ports', 'neural-network.js');
        const portNetExists = fs.existsSync(portNetFile);
        sendJSON(res, 200, {
            success: true,
            neuralNetwork: {
                core: info,
                portNetwork: { file: 'core/ports/neural-network.js', exists: portNetExists },
                status: exists ? 'available' : 'missing',
                activation: exists ? 'ready' : 'requires-install'
            },
            timestamp: new Date().toISOString(),
            quran: { ref: 'البقرة:٣١', text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا' }
        });
    },

    // ── GET /sdk/docs ────────────────────────────────────────────────────────
    'GET /sdk/docs': async (_req, res) => {
        sendJSON(res, 200, {
            success: true,
            server: 'Sheikha SDK Server v1.0.0',
            description: 'خادم SDK شيخة — واجهة برمجية للمطورين',
            baseUrl: `http://localhost:${SDK_PORT}`,
            endpoints: [
                { method: 'GET',  path: '/sdk/health',       desc: 'فحص صحة SDK والمكونات' },
                { method: 'GET',  path: '/sdk/status',        desc: 'حالة الخادم الرئيسي وSDK' },
                { method: 'GET',  path: '/sdk/engines',       desc: 'قائمة محركات شيخة (query: ?filter=)' },
                { method: 'GET',  path: '/sdk/data',          desc: 'قائمة ملفات البيانات (query: ?filter=)' },
                { method: 'GET',  path: '/sdk/neural',        desc: 'معلومات الشبكة العصبية' },
                { method: 'POST', path: '/sdk/sharia-check',  desc: 'فحص شرعي مبدئي (body: {code, context})' },
                { method: 'GET',  path: '/sdk/docs',          desc: 'توثيق الـ endpoints (هذه الصفحة)' }
            ],
            relatedServers: {
                main:  `http://localhost:8080`,
                ide:   `http://localhost:3002`,
                sdk:   `http://localhost:${SDK_PORT}`
            },
            timestamp: new Date().toISOString()
        });
    }
};

// ─── HTTP Server ───────────────────────────────────────────────────────────────

const httpServer = http.createServer(async (req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        return res.end();
    }

    const urlPath = (req.url || '/').split('?')[0].replace(/\/$/, '') || '/';
    const routeKey = `${req.method} ${urlPath}`;

    // مطابقة مسار بسيط (تجاهل query string)
    const handler = ROUTES[routeKey];

    if (handler) {
        try {
            await handler(req, res);
        } catch (err) {
            sendJSON(res, 500, { success: false, error: err.message, timestamp: new Date().toISOString() });
        }
        return;
    }

    // جذر — أرسل docs
    if (urlPath === '' || urlPath === '/') {
        return ROUTES['GET /sdk/docs'](req, res);
    }

    sendJSON(res, 404, {
        success: false,
        error: `المسار غير موجود: ${urlPath}`,
        hint: `جرّب GET /sdk/docs لقائمة كاملة`,
        timestamp: new Date().toISOString()
    });
});

httpServer.listen(SDK_PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🔧 SHEIKHA SDK SERVER — خادم SDK شيخة                      ║
║  «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»               ║
╠══════════════════════════════════════════════════════════════╣
║  🌐 الرابط:  http://localhost:${SDK_PORT}                       ║
║  📚 توثيق:   http://localhost:${SDK_PORT}/sdk/docs             ║
║  ❤️  الصحة:   http://localhost:${SDK_PORT}/sdk/health          ║
║  ⚡ الحالة:  http://localhost:${SDK_PORT}/sdk/status           ║
║  🧠 العصبي:  http://localhost:${SDK_PORT}/sdk/neural           ║
╠══════════════════════════════════════════════════════════════╣
║  الخادم الرئيسي (مطلوب): http://localhost:8080               ║
╚══════════════════════════════════════════════════════════════╝
`);
});

httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`⛔ المنفذ ${SDK_PORT} مشغول — جرّب: SHEIKHA_SDK_PORT=3011 node sheikha-sdk-server.js`);
    } else {
        console.error('❌ خطأ في SDK Server:', err.message);
    }
    process.exit(1);
});

module.exports = { httpServer };
