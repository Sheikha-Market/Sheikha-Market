#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA COPILOT SERVER — خادم GitHub Copilot الخلفي المستقل                ║
 * ║  يعمل دائماً في الخلفية عبر PM2 كجسر MCP بين Copilot والسيرفرات            ║
 * ║                                                                              ║
 * ║  المنفذ الافتراضي: 3091                                                      ║
 * ║  البروتوكول: MCP (Model Context Protocol) + HTTP REST                       ║
 * ║  «وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى» — المائدة ٢                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * التشغيل المباشر: node scripts/sheikha-copilot-server.js
 * عبر PM2:         pm2 start ecosystem.config.js --only sheikha-copilot
 * إيقاف:           pm2 stop sheikha-copilot
 * السجلات:         pm2 logs sheikha-copilot
 */

'use strict';

const http  = require('http');
const https = require('https');

// ─── الإعدادات ────────────────────────────────────────────────────────────────
const PORT        = parseInt(process.env.COPILOT_SERVER_PORT || '3091', 10);
const HOST        = process.env.COPILOT_SERVER_HOST || '0.0.0.0';
const MAIN_SERVER = process.env.SHEIKHA_SERVER_URL  || 'http://127.0.0.1:8080';
const MAIN_PORT   = parseInt(process.env.PORT        || '8080', 10);
const NODE_ENV    = process.env.NODE_ENV             || 'development';
const SCHEMA      = 'sheikha-copilot/v1';
const TAWHEED     = 'لا إله إلا الله';
const NO_HARM     = 'لا ضرر ولا ضرار';
const START_TIME  = Date.now();

// ─── سجل الطلبات (ring buffer بسيط) ──────────────────────────────────────────
const REQUEST_LOG_SIZE = 200;
const requestLog       = [];   // { ts, method, path, status, ms }

function logRequest(entry) {
    requestLog.push(entry);
    if (requestLog.length > REQUEST_LOG_SIZE) requestLog.shift();
}

// ─── رؤوس HTTP الثابتة ───────────────────────────────────────────────────────
// ملاحظة: HTTP headers تقبل ASCII فقط — القيم العربية تذهب في الـ body
const CORS_HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sheikha-Copilot, X-MCP-Version',
    'Access-Control-Max-Age':       '86400',
    'X-Powered-By':                 'Sheikha Copilot Server',
    'X-Schema':                     SCHEMA,
};

const SECURITY_HEADERS = {
    'X-Content-Type-Options':  'nosniff',
    'X-Frame-Options':         'SAMEORIGIN',
    'X-XSS-Protection':        '1; mode=block',
    'Referrer-Policy':         'strict-origin-when-cross-origin',
};

// ─── أدوات مساعدة ─────────────────────────────────────────────────────────────

function now() { return new Date().toISOString(); }

function send(res, status, obj, extraHeaders = {}) {
    const body = JSON.stringify({ ...obj, timestamp: now(), schema: SCHEMA });
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        ...extraHeaders,
    };
    res.writeHead(status, headers);
    res.end(body);
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (c) => { data += c; if (data.length > 1_000_000) req.destroy(); });
        req.on('end',  () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } });
        req.on('error', reject);
    });
}

/** إعادة توجيه طلب إلى الخادم الرئيسي */
function proxyToMain(targetPath, method, body, callback) {
    const parsed   = new URL(MAIN_SERVER);
    const isHttps  = parsed.protocol === 'https:';
    const lib      = isHttps ? https : http;
    const bodyStr  = body ? JSON.stringify(body) : null;

    const options = {
        hostname: parsed.hostname,
        port:     parsed.port || (isHttps ? 443 : MAIN_PORT),
        path:     targetPath,
        method:   method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Copilot-Bridge': 'sheikha-copilot-server',
            ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        },
        timeout: 8000,
    };

    const req = lib.request(options, (proxyRes) => {
        let raw = '';
        proxyRes.on('data', (c) => { raw += c; });
        proxyRes.on('end',  () => {
            try { callback(null, JSON.parse(raw), proxyRes.statusCode); }
            catch { callback(null, { raw }, proxyRes.statusCode); }
        });
    });

    req.on('error',   (e) => callback(e));
    req.on('timeout', ()  => { req.destroy(); callback(new Error('timeout')); });

    if (bodyStr) req.write(bodyStr);
    req.end();
}

// ═══════════════════════════════════════════════════════════════════════════════
// تعريف مسارات MCP / REST
// ═══════════════════════════════════════════════════════════════════════════════

const ROUTES = {

    // ── صحة الخادم ─────────────────────────────────────────────────────────────
    'GET /health': (req, res) => {
        const uptime = Math.floor((Date.now() - START_TIME) / 1000);
        send(res, 200, {
            success: true,
            service: 'sheikha-copilot-server',
            port:    PORT,
            uptime,
            nodeEnv: NODE_ENV,
            mainServer: MAIN_SERVER,
            requests: requestLog.length,
            message: 'Sheikha Copilot Server — يعمل بخير',
        });
    },

    // ── حالة الـ Copilot (يستعلم الخادم الرئيسي) ─────────────────────────────
    'GET /copilot/status': (req, res) => {
        proxyToMain('/api/sheikha/copilot/status', 'GET', null, (err, data, status) => {
            if (err) return send(res, 502, { success: false, error: err.message, service: 'sheikha-copilot-server' });
            send(res, status || 200, { ...data, bridgedBy: 'sheikha-copilot-server', port: PORT });
        });
    },

    // ── النماذج المتاحة ───────────────────────────────────────────────────────
    'GET /copilot/models': (req, res) => {
        proxyToMain('/api/sheikha/copilot/models', 'GET', null, (err, data, status) => {
            if (err) return send(res, 502, { success: false, error: err.message });
            send(res, status || 200, data);
        });
    },

    // ── اللغات المدعومة ───────────────────────────────────────────────────────
    'GET /copilot/languages': (req, res) => {
        proxyToMain('/api/sheikha/copilot/languages', 'GET', null, (err, data, status) => {
            if (err) return send(res, 502, { success: false, error: err.message });
            send(res, status || 200, data);
        });
    },

    // ── اقتراحات الكود ────────────────────────────────────────────────────────
    'POST /copilot/completions': async (req, res) => {
        const body = await parseBody(req);
        proxyToMain('/api/sheikha/copilot/completions', 'POST', body, (err, data, status) => {
            if (err) return send(res, 502, { success: false, error: err.message });
            send(res, status || 200, data);
        });
    },

    // ── محادثة Copilot Chat ───────────────────────────────────────────────────
    'POST /copilot/chat': async (req, res) => {
        const body = await parseBody(req);
        proxyToMain('/api/sheikha/copilot/chat', 'POST', body, (err, data, status) => {
            if (err) return send(res, 502, { success: false, error: err.message });
            send(res, status || 200, data);
        });
    },

    // ── جسر VS Code ──────────────────────────────────────────────────────────
    'GET /copilot/vscode-bridge': (req, res) => {
        proxyToMain('/api/sheikha/copilot/vscode-bridge', 'GET', null, (err, data, status) => {
            if (err) return send(res, 502, { success: false, error: err.message });
            send(res, status || 200, { ...data, bridgePort: PORT });
        });
    },

    // ── MCP: manifest (يقرؤه GitHub Copilot لاكتشاف قدرات الخادم) ───────────
    'GET /.well-known/mcp.json': (req, res) => {
        send(res, 200, {
            success: true,
            mcp: {
                version: '1.0',
                name: 'sheikha-copilot',
                displayName: 'Sheikha Copilot',
                description: 'خادم MCP لسوق شيخة — تكامل GitHub Copilot مع المنظومة الاقتصادية الإسلامية',
                baseUrl: `http://localhost:${PORT}`,
                tools: [
                    { name: 'completions',   path: '/copilot/completions',   method: 'POST', description: 'اقتراحات الكود الذكية' },
                    { name: 'chat',          path: '/copilot/chat',          method: 'POST', description: 'محادثة Copilot Chat' },
                    { name: 'vscode-bridge', path: '/copilot/vscode-bridge', method: 'GET',  description: 'جسر VS Code' },
                    { name: 'status',        path: '/copilot/status',        method: 'GET',  description: 'حالة النظام' },
                    { name: 'models',        path: '/copilot/models',        method: 'GET',  description: 'النماذج المتاحة' },
                ],
                shariaGuardrails: true,
                tawheed: TAWHEED,
                noHarm: NO_HARM,
            },
        });
    },

    // ── MCP: اكتشاف أدوات الخادم (مسار قياسي لـ MCP) ─────────────────────────
    'GET /mcp/tools': (req, res) => {
        send(res, 200, {
            success: true,
            tools: [
                { name: 'sheikha_completions', description: 'توليد اقتراحات كود شرعية-آمنة',    inputSchema: { type: 'object', properties: { code: { type: 'string' }, language: { type: 'string' } }, required: ['code'] } },
                { name: 'sheikha_chat',        description: 'محادثة ذكية مع Sheikha Copilot',    inputSchema: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] } },
                { name: 'sheikha_status',      description: 'حالة سيرفرات المنظومة',              inputSchema: { type: 'object', properties: {} } },
                { name: 'sheikha_market_data', description: 'بيانات سوق المعادن والسكراب',        inputSchema: { type: 'object', properties: { metal: { type: 'string' } } } },
            ],
        });
    },

    // ── MCP: تنفيذ أداة ──────────────────────────────────────────────────────
    'POST /mcp/tools/call': async (req, res) => {
        const body = await parseBody(req);
        const toolName = body.name || '';

        const toolMap = {
            sheikha_completions:  '/api/sheikha/copilot/completions',
            sheikha_chat:         '/api/sheikha/copilot/chat',
            sheikha_status:       '/api/sheikha/status',
            sheikha_market_data:  '/api/sheikha/metals/prices',
        };

        const targetPath = toolMap[toolName];
        if (!targetPath) {
            return send(res, 404, { success: false, error: `أداة غير معروفة: ${toolName}` });
        }

        proxyToMain(targetPath, 'POST', body.arguments || {}, (err, data, status) => {
            if (err) return send(res, 502, { success: false, error: err.message });
            send(res, status || 200, { success: true, tool: toolName, result: data });
        });
    },

    // ── سجل الطلبات الأخيرة (للتصحيح) ──────────────────────────────────────
    'GET /debug/requests': (req, res) => {
        if (NODE_ENV === 'production') return send(res, 403, { success: false, error: 'ممنوع في الإنتاج' });
        send(res, 200, { success: true, count: requestLog.length, requests: requestLog.slice(-50) });
    },

};

// ═══════════════════════════════════════════════════════════════════════════════
// الخادم الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

const server = http.createServer(async (req, res) => {
    const t0      = Date.now();
    let pathname;
    try {
        // استخدام WHATWG URL بدلاً من url.parse() القديمة
        pathname = new URL(req.url || '/', `http://localhost:${PORT}`).pathname;
    } catch {
        pathname = '/';
    }
    const path    = pathname.replace(/\/+$/, '') || '/';
    const method  = req.method.toUpperCase();

    // CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, { ...CORS_HEADERS, ...SECURITY_HEADERS });
        res.end();
        return;
    }

    const key     = `${method} ${path}`;
    const handler = ROUTES[key];

    try {
        if (handler) {
            await handler(req, res);
        } else if (path === '/' || path === '') {
            send(res, 200, {
                success: true,
                service: 'Sheikha Copilot Server',
                version: '1.0.0',
                port:    PORT,
                routes:  Object.keys(ROUTES),
                docs:    `http://localhost:${PORT}/copilot/status`,
                mcp:     `http://localhost:${PORT}/.well-known/mcp.json`,
                message: 'شيخة كوبايلوت — خادم MCP الخلفي يعمل',
            });
        } else {
            send(res, 404, { success: false, error: `المسار غير موجود: ${path}` });
        }
    } catch (err) {
        console.error(`[copilot-server] خطأ في ${key}:`, err.message);
        send(res, 500, { success: false, error: err.message });
    }

    const ms = Date.now() - t0;
    logRequest({ ts: now(), method, path, status: res.statusCode, ms });
    console.log(`[${now()}] ${method} ${path} → ${res.statusCode} (${ms}ms)`);
});

// ─── معالجة أخطاء الخادم ─────────────────────────────────────────────────────
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ المنفذ ${PORT} مشغول. جرّب: COPILOT_SERVER_PORT=3092 node scripts/sheikha-copilot-server.js`);
    } else {
        console.error('❌ خطأ في خادم Copilot:', err.message);
    }
    process.exit(1);
});

// ─── بدء الاستماع ────────────────────────────────────────────────────────────
server.listen(PORT, HOST, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                بسم الله الرحمن الرحيم                                        ║
║  🤖  Sheikha Copilot Server — خادم MCP الخلفي                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  🌐 MCP Server:    http://localhost:${PORT}                                  ║
║  📋 Manifest:      http://localhost:${PORT}/.well-known/mcp.json              ║
║  🔗 VS Code Bridge:http://localhost:${PORT}/copilot/vscode-bridge             ║
║  💬 Copilot Chat:  http://localhost:${PORT}/copilot/chat                      ║
║  ✅ الاقتراحات:     http://localhost:${PORT}/copilot/completions              ║
║  🔄 Main Server:   ${MAIN_SERVER}                                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  📌 إضافة لـ VS Code settings.json:                                          ║
║     "github.copilot.advanced": {                                             ║
║       "debug.useElectronFetcher": false,                                     ║
║       "debug.overrideProxyUrl": "http://localhost:${PORT}"                   ║
║     }                                                                        ║
║  📌 أو عبر MCP settings:                                                     ║
║     { "mcp": { "servers": { "sheikha": {                                    ║
║       "url": "http://localhost:${PORT}/.well-known/mcp.json" } } } }         ║
╚══════════════════════════════════════════════════════════════════════════════╝
  ${TAWHEED} · ${NO_HARM}
`);
});

// ─── إيقاف نظيف ─────────────────────────────────────────────────────────────
process.on('SIGTERM', () => { console.log('\n[copilot-server] SIGTERM — إيقاف نظيف...'); server.close(() => process.exit(0)); });
process.on('SIGINT',  () => { console.log('\n[copilot-server] SIGINT — إيقاف...'); server.close(() => process.exit(0)); });
