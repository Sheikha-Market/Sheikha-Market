#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA OLLAMA COPILOT — خادم Ollama Copilot الخلفي المستقل                ║
 * ║  يعمل دائماً في الخلفية عبر PM2 كجسر ذكاء اصطناعي محلي                   ║
 * ║                                                                              ║
 * ║  المنفذ الافتراضي: 3092                                                      ║
 * ║  الخلفية: Ollama (http://127.0.0.1:11434) — نماذج محلية بلا سحابة          ║
 * ║  «وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى» — المائدة ٢                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * التشغيل المباشر: node scripts/sheikha-ollama-copilot.js
 * عبر PM2:         pm2 start ecosystem.config.js --only sheikha-ollama-copilot
 * إيقاف:           pm2 stop sheikha-ollama-copilot
 * السجلات:         pm2 logs sheikha-ollama-copilot
 */

'use strict';

const http  = require('http');
const https = require('https');

// ─── الإعدادات ────────────────────────────────────────────────────────────────
const PORT         = parseInt(process.env.OLLAMA_COPILOT_PORT  || '3092', 10);
const HOST         = process.env.OLLAMA_COPILOT_HOST            || '0.0.0.0';
const OLLAMA_HOST  = process.env.OLLAMA_HOST                    || 'http://127.0.0.1:11434';
const MAIN_SERVER  = process.env.SHEIKHA_SERVER_URL             || 'http://127.0.0.1:8080';
const MAIN_PORT    = parseInt(process.env.PORT                  || '8080', 10);
const NODE_ENV     = process.env.NODE_ENV                       || 'development';
const SCHEMA       = 'sheikha-ollama-copilot/v1';
const TAWHEED      = 'لا إله إلا الله';
const NO_HARM      = 'لا ضرر ولا ضرار';
const START_TIME   = Date.now();

// ─── اختيار النموذج الافتراضي ────────────────────────────────────────────────
// يمكن تجاوزه عبر متغير البيئة OLLAMA_BEST_MODEL
let ACTIVE_MODEL = process.env.OLLAMA_BEST_MODEL || '';

/** تحميل المنسِّق وتحديد أفضل نموذج متاح */
function resolveActiveModel() {
    try {
        const SheikhaOllamaOrchestrator = require('../lib/sheikha-ollama-orchestrator');
        const orch = new SheikhaOllamaOrchestrator();
        const resources  = orch.detectResources();
        const installed  = orch.listInstalledModels();
        const { bestModel } = orch.recommendedModels(resources, installed);
        ACTIVE_MODEL = bestModel;
        console.log(`[ollama-copilot] 🧠 النموذج النشط: ${ACTIVE_MODEL} (من المنسِّق)`);
    } catch (e) {
        if (!ACTIVE_MODEL) ACTIVE_MODEL = 'llama3.1:8b';
        console.warn(`[ollama-copilot] ⚠️ تعذّر تحميل المنسِّق — النموذج الاحتياطي: ${ACTIVE_MODEL} — ${e.message}`);
    }
}

// ─── هوية الخدمة — تحت شيخة ──────────────────────────────────────────────────
const SERVICE_IDENTITY = {
    serviceKey: 'sheikha-ollama-copilot',
    name:       'Sheikha Ollama Copilot',
    nameAr:     'خادم شيخة أولامي كوبايلوت',
    version:    '1.0.0',
    port:       PORT,
    baseUrl:    `http://localhost:${PORT}`,
    protocol:   'HTTP REST + Ollama',
    authority:  'sheikha-api',
    parent:     'Sheikha',
    meta: {
        ollamaHost:  OLLAMA_HOST,
        mcpManifest: `http://localhost:${PORT}/.well-known/mcp.json`,
    },
};

// ─── سجل الطلبات (ring buffer بسيط) ──────────────────────────────────────────
const REQUEST_LOG_SIZE = 200;
const requestLog       = [];

function logRequest(entry) {
    requestLog.push(entry);
    if (requestLog.length > REQUEST_LOG_SIZE) requestLog.shift();
}

// ─── رؤوس HTTP الثابتة ───────────────────────────────────────────────────────
const CORS_HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sheikha-Ollama, X-MCP-Version',
    'Access-Control-Max-Age':       '86400',
    'X-Powered-By':                 'Sheikha Ollama Copilot',
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

function send(res, status, obj, extraHeaders) {
    const body = JSON.stringify({ ...obj, timestamp: now(), schema: SCHEMA });
    res.writeHead(status, {
        'Content-Type':   'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        ...(extraHeaders || {}),
    });
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

/** إرسال طلب إلى Ollama */
function callOllama(path, method, bodyObj, callback) {
    const parsed  = new URL(OLLAMA_HOST);
    const isHttps = parsed.protocol === 'https:';
    const lib     = isHttps ? https : http;
    const bodyStr = bodyObj ? JSON.stringify(bodyObj) : null;

    const options = {
        hostname: parsed.hostname,
        port:     parsed.port || (isHttps ? 443 : 11434),
        path,
        method:   method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        },
        timeout: 120_000,
    };

    const req = lib.request(options, (ollamaRes) => {
        let raw = '';
        ollamaRes.on('data', (c) => { raw += c; });
        ollamaRes.on('end',  () => {
            try { callback(null, JSON.parse(raw), ollamaRes.statusCode); }
            catch { callback(null, { raw }, ollamaRes.statusCode); }
        });
    });

    req.on('error',   (e) => callback(e));
    req.on('timeout', ()  => { req.destroy(); callback(new Error('Ollama timeout')); });

    if (bodyStr) req.write(bodyStr);
    req.end();
}

/** إعادة توجيه طلب إلى الخادم الرئيسي */
function proxyToMain(targetPath, method, bodyObj, callback) {
    const parsed  = new URL(MAIN_SERVER);
    const isHttps = parsed.protocol === 'https:';
    const lib     = isHttps ? https : http;
    const bodyStr = bodyObj ? JSON.stringify(bodyObj) : null;

    const options = {
        hostname: parsed.hostname,
        port:     parsed.port || (isHttps ? 443 : MAIN_PORT),
        path:     targetPath,
        method:   method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Ollama-Bridge': 'sheikha-ollama-copilot',
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
// التسجيل تحت شيخة — Sheikha Sub-Service Registration
// ═══════════════════════════════════════════════════════════════════════════════

let _registrationOk = false;

function registerWithSheikha(attempt) {
    attempt = attempt || 1;
    const payload = { ...SERVICE_IDENTITY, activeModel: ACTIVE_MODEL };
    proxyToMain('/api/sheikha/services/register', 'POST', payload, (err, data) => {
        if (err || !data || !data.success) {
            const msg = err ? err.message : (data && data.message) || 'فشل';
            console.warn(`[ollama-copilot] ⚠️ تسجيل تحت شيخة — محاولة ${attempt} فشلت: ${msg}`);
            const delay = attempt <= 5 ? 10_000 : 60_000;
            setTimeout(() => registerWithSheikha(attempt + 1), delay);
        } else {
            _registrationOk = true;
            console.log(`[ollama-copilot] ✅ تم التسجيل تحت شيخة — authority: ${data.data && data.data.authority}`);
        }
    });
}

function heartbeatToSheikha() {
    if (!_registrationOk) return;
    const payload = {
        serviceKey: SERVICE_IDENTITY.serviceKey,
        meta: {
            uptime:      Math.floor((Date.now() - START_TIME) / 1000),
            requests:    requestLog.length,
            activeModel: ACTIVE_MODEL,
        },
    };
    proxyToMain('/api/sheikha/services/heartbeat', 'POST', payload, (err, data) => {
        if (err || !data || !data.success) {
            console.warn('[ollama-copilot] ⚠️ نبضة فشلت — سيُعاد التسجيل');
            _registrationOk = false;
            registerWithSheikha(1);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// مسارات HTTP
// ═══════════════════════════════════════════════════════════════════════════════

const ROUTES = {

    // ── صحة الخادم ─────────────────────────────────────────────────────────────
    'GET /health': (req, res) => {
        send(res, 200, {
            success:   true,
            service:   'sheikha-ollama-copilot',
            authority: 'sheikha-api',
            parent:    'Sheikha',
            registeredWithSheikha: _registrationOk,
            port:        PORT,
            uptime:      Math.floor((Date.now() - START_TIME) / 1000),
            activeModel: ACTIVE_MODEL,
            ollamaHost:  OLLAMA_HOST,
            nodeEnv:     NODE_ENV,
            message:     'Sheikha Ollama Copilot — يعمل في الخلفية تحت شيخة',
        });
    },

    // ── هوية الخادم ────────────────────────────────────────────────────────────
    'GET /identity': (req, res) => {
        send(res, 200, {
            success:   true,
            identity:  { ...SERVICE_IDENTITY, activeModel: ACTIVE_MODEL },
            governor:  'Sheikha',
            hierarchy: 'sheikha-api → sheikha-ollama-copilot',
            registeredWithSheikha: _registrationOk,
        });
    },

    // ── النماذج المتاحة في Ollama ─────────────────────────────────────────────
    'GET /ollama/models': (req, res) => {
        callOllama('/api/tags', 'GET', null, (err, data, status) => {
            if (err) return send(res, 502, { success: false, error: err.message, hint: 'تأكد أن Ollama يعمل على ' + OLLAMA_HOST });
            send(res, status || 200, {
                success:     true,
                activeModel: ACTIVE_MODEL,
                ollamaHost:  OLLAMA_HOST,
                models:      data && data.models ? data.models : data,
            });
        });
    },

    // ── اقتراحات الكود عبر Ollama ─────────────────────────────────────────────
    'POST /ollama/completions': async (req, res) => {
        const body  = await parseBody(req);
        const model = body.model || ACTIVE_MODEL;
        const prompt = body.prompt || body.code || '';

        if (!prompt) return send(res, 400, { success: false, error: 'يلزم حقل prompt أو code' });

        const ollamaPayload = {
            model,
            prompt,
            stream: false,
            options: {
                temperature: body.temperature != null ? body.temperature : 0.2,
                num_predict: body.max_tokens   != null ? body.max_tokens  : 256,
            },
        };

        callOllama('/api/generate', 'POST', ollamaPayload, (err, data, status) => {
            if (err) return send(res, 502, { success: false, error: err.message });
            send(res, status || 200, {
                success:    true,
                model,
                completion: data && data.response ? data.response : data,
                done:       data && data.done,
                raw:        data,
            });
        });
    },

    // ── محادثة Chat عبر Ollama ────────────────────────────────────────────────
    'POST /ollama/chat': async (req, res) => {
        const body     = await parseBody(req);
        const model    = body.model || ACTIVE_MODEL;
        const messages = body.messages;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return send(res, 400, { success: false, error: 'يلزم حقل messages (مصفوفة)' });
        }

        const ollamaPayload = { model, messages, stream: false };

        callOllama('/api/chat', 'POST', ollamaPayload, (err, data, status) => {
            if (err) return send(res, 502, { success: false, error: err.message });
            send(res, status || 200, {
                success: true,
                model,
                message: data && data.message ? data.message : data,
                done:    data && data.done,
                raw:     data,
            });
        });
    },

    // ── تغيير النموذج النشط ───────────────────────────────────────────────────
    'POST /ollama/set-model': async (req, res) => {
        const body = await parseBody(req);
        if (!body.model) return send(res, 400, { success: false, error: 'يلزم حقل model' });
        const prev = ACTIVE_MODEL;
        ACTIVE_MODEL = body.model;
        console.log(`[ollama-copilot] 🔄 تغيير النموذج: ${prev} → ${ACTIVE_MODEL}`);
        send(res, 200, { success: true, previousModel: prev, activeModel: ACTIVE_MODEL });
    },

    // ── إعادة تحميل أفضل نموذج من المنسِّق ──────────────────────────────────
    'POST /ollama/reload-model': (req, res) => {
        resolveActiveModel();
        send(res, 200, { success: true, activeModel: ACTIVE_MODEL });
    },

    // ── حالة Ollama ────────────────────────────────────────────────────────────
    'GET /ollama/status': (req, res) => {
        callOllama('/api/tags', 'GET', null, (err, data) => {
            const ollamaOnline = !err && data && !data.error;
            send(res, 200, {
                success:     true,
                ollamaOnline,
                ollamaHost:  OLLAMA_HOST,
                activeModel: ACTIVE_MODEL,
                modelCount:  ollamaOnline && data.models ? data.models.length : 0,
                error:       err ? err.message : null,
            });
        });
    },

    // ── MCP manifest ──────────────────────────────────────────────────────────
    'GET /.well-known/mcp.json': (req, res) => {
        send(res, 200, {
            success: true,
            mcp: {
                version:     '1.0',
                name:        'sheikha-ollama-copilot',
                displayName: 'Sheikha Ollama Copilot',
                description: 'خادم MCP للذكاء الاصطناعي المحلي — يوصل Ollama بمنظومة شيخة',
                baseUrl:     `http://localhost:${PORT}`,
                activeModel: ACTIVE_MODEL,
                ollamaHost:  OLLAMA_HOST,
                tools: [
                    { name: 'ollama_completions', path: '/ollama/completions', method: 'POST', description: 'توليد كود عبر Ollama' },
                    { name: 'ollama_chat',         path: '/ollama/chat',         method: 'POST', description: 'محادثة ذكاء اصطناعي محلي' },
                    { name: 'ollama_models',        path: '/ollama/models',        method: 'GET',  description: 'النماذج المثبّتة' },
                    { name: 'ollama_status',        path: '/ollama/status',        method: 'GET',  description: 'حالة Ollama' },
                ],
                shariaGuardrails: true,
                tawheed: TAWHEED,
                noHarm:  NO_HARM,
            },
        });
    },

    // ── MCP tools list ─────────────────────────────────────────────────────────
    'GET /mcp/tools': (req, res) => {
        send(res, 200, {
            success: true,
            tools: [
                { name: 'ollama_completions', description: 'توليد اقتراحات كود عبر نموذج Ollama المحلي', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, model: { type: 'string' }, max_tokens: { type: 'number' } }, required: ['prompt'] } },
                { name: 'ollama_chat',         description: 'محادثة مع نموذج Ollama المحلي',              inputSchema: { type: 'object', properties: { messages: { type: 'array' }, model: { type: 'string' } }, required: ['messages'] } },
                { name: 'ollama_status',        description: 'حالة خادم Ollama والنموذج النشط',            inputSchema: { type: 'object', properties: {} } },
            ],
        });
    },

    // ── MCP tool call ──────────────────────────────────────────────────────────
    'POST /mcp/tools/call': async (req, res) => {
        const body     = await parseBody(req);
        const toolName = body.name || '';
        const args     = body.arguments || {};

        if (toolName === 'ollama_completions') {
            const prompt = args.prompt || '';
            if (!prompt) return send(res, 400, { success: false, error: 'يلزم حقل prompt' });
            const payload = { model: args.model || ACTIVE_MODEL, prompt, stream: false, options: { num_predict: args.max_tokens || 256 } };
            callOllama('/api/generate', 'POST', payload, (err, data, status) => {
                if (err) return send(res, 502, { success: false, error: err.message });
                send(res, status || 200, { success: true, tool: toolName, result: { completion: data && data.response, model: args.model || ACTIVE_MODEL } });
            });
        } else if (toolName === 'ollama_chat') {
            const messages = args.messages;
            if (!messages) return send(res, 400, { success: false, error: 'يلزم حقل messages' });
            const payload = { model: args.model || ACTIVE_MODEL, messages, stream: false };
            callOllama('/api/chat', 'POST', payload, (err, data, status) => {
                if (err) return send(res, 502, { success: false, error: err.message });
                send(res, status || 200, { success: true, tool: toolName, result: { message: data && data.message, model: args.model || ACTIVE_MODEL } });
            });
        } else if (toolName === 'ollama_status') {
            callOllama('/api/tags', 'GET', null, (err, data) => {
                send(res, 200, { success: true, tool: toolName, result: { ollamaOnline: !err, activeModel: ACTIVE_MODEL, ollamaHost: OLLAMA_HOST } });
            });
        } else {
            send(res, 404, { success: false, error: `أداة غير معروفة: ${toolName}` });
        }
    },

    // ── سجل الطلبات (للتصحيح) ─────────────────────────────────────────────────
    'GET /debug/requests': (req, res) => {
        if (NODE_ENV === 'production') return send(res, 403, { success: false, error: 'ممنوع في الإنتاج' });
        send(res, 200, { success: true, count: requestLog.length, requests: requestLog.slice(-50) });
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// الخادم الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

const server = http.createServer(async (req, res) => {
    const t0 = Date.now();
    let pathname;
    try {
        pathname = new URL(req.url || '/', `http://localhost:${PORT}`).pathname;
    } catch {
        pathname = '/';
    }
    const path   = pathname.replace(/\/+$/, '') || '/';
    const method = req.method.toUpperCase();

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
                success:     true,
                service:     'Sheikha Ollama Copilot',
                version:     '1.0.0',
                port:        PORT,
                activeModel: ACTIVE_MODEL,
                ollamaHost:  OLLAMA_HOST,
                routes:      Object.keys(ROUTES),
                docs:        `http://localhost:${PORT}/ollama/status`,
                mcp:         `http://localhost:${PORT}/.well-known/mcp.json`,
                message:     'شيخة أولامي كوبايلوت — خادم الذكاء الاصطناعي المحلي يعمل في الخلفية',
            });
        } else {
            send(res, 404, { success: false, error: `المسار غير موجود: ${path}` });
        }
    } catch (err) {
        console.error(`[ollama-copilot] خطأ في ${key}:`, err.message);
        send(res, 500, { success: false, error: err.message });
    }

    const ms = Date.now() - t0;
    logRequest({ ts: now(), method, path, status: res.statusCode, ms });
    console.log(`[${now()}] ${method} ${path} → ${res.statusCode} (${ms}ms)`);
});

// ─── معالجة أخطاء الخادم ─────────────────────────────────────────────────────
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ المنفذ ${PORT} مشغول. جرّب: OLLAMA_COPILOT_PORT=3093 node scripts/sheikha-ollama-copilot.js`);
    } else {
        console.error('[ollama-copilot] ❌ خطأ في الخادم:', err.message);
    }
    process.exit(1);
});

// ─── بدء الاستماع ────────────────────────────────────────────────────────────
resolveActiveModel();

server.listen(PORT, HOST, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                بسم الله الرحمن الرحيم                                        ║
║  🤖  Sheikha Ollama Copilot — خادم الذكاء الاصطناعي المحلي الخلفي            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  🌐 الخادم:        http://localhost:${PORT}
║  📋 Manifest:      http://localhost:${PORT}/.well-known/mcp.json
║  💬 Chat:          http://localhost:${PORT}/ollama/chat
║  ✅ Completions:   http://localhost:${PORT}/ollama/completions
║  📦 Models:        http://localhost:${PORT}/ollama/models
║  🔗 Ollama:        ${OLLAMA_HOST}
║  🧠 النموذج النشط: ${ACTIVE_MODEL}
╠══════════════════════════════════════════════════════════════════════════════╣
║  📌 إضافة لـ VS Code settings.json (MCP):                                    ║
║     { "mcp": { "servers": { "sheikha-ollama": {                             ║
║       "url": "http://localhost:${PORT}/.well-known/mcp.json" } } } }
╠══════════════════════════════════════════════════════════════════════════════╣
║  👑 الحاكم: Sheikha API (${MAIN_SERVER})
║  🔗 الهرمية: sheikha-api → sheikha-ollama-copilot
╚══════════════════════════════════════════════════════════════════════════════╝
  ${TAWHEED} · ${NO_HARM}
`);
    // التسجيل تحت شيخة بعد 3 ثوان من الإقلاع
    setTimeout(() => registerWithSheikha(1), 3_000);
    // نبضة دورية كل 30 ثانية
    setInterval(heartbeatToSheikha, 30_000);
    // إعادة تحديد النموذج كل 6 ساعات
    setInterval(resolveActiveModel, 6 * 60 * 60 * 1000);
});

// ─── إيقاف نظيف ─────────────────────────────────────────────────────────────
process.on('SIGTERM', () => { console.log('\n[ollama-copilot] SIGTERM — إيقاف نظيف...'); server.close(() => process.exit(0)); });
process.on('SIGINT',  () => { console.log('\n[ollama-copilot] SIGINT — إيقاف...'); server.close(() => process.exit(0)); });
