#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  SHEIKHA IDE SERVER — خادم بيئة التطوير المتكاملة
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  «اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ» — العلق ١
 *  «إنَّ اللَّهَ يُحبُّ إذا عَمِلَ أحَدُكُم عَمَلًا أن يُتقِنَه» — البيهقي
 *
 *  الأهداف:
 *  ١. خادم IDE ذكي — تحليل الكود وإكمال تلقائي واقتراحات
 *  ٢. إدارة الملفات عبر API (قراءة، بحث، تصفح)
 *  ٣. تشغيل فحص المشاريع وتشخيص الأخطاء
 *  ٤. دعم تكامل VS Code / Cursor عبر HTTP
 *
 *  المنفذ الافتراضي: 3002
 *  المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const IDE_PORT = parseInt(process.env.SHEIKHA_IDE_PORT || '3002', 10);
const MAIN_API = process.env.SHEIKHA_MAIN_URL || 'http://localhost:8080';
const ROOT = path.join(__dirname, '..');

// ─── دوال مساعدة ─────────────────────────────────────────────────────────────

function sendJSON(res, status, data) {
    const body = JSON.stringify(data, null, 2);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Sheikha-IDE': 'v1.0.0',
        'X-Server': 'Sheikha-IDE-Server'
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

// ─── نظام الملفات ─────────────────────────────────────────────────────────────

const ALLOWED_ROOTS = [
    path.join(ROOT, 'lib'),
    path.join(ROOT, 'routes'),
    path.join(ROOT, 'core'),
    path.join(ROOT, 'public'),
    path.join(__dirname)   // mcp-servers
];

function isSafePath(target) {
    const resolved = path.resolve(target);
    return ALLOWED_ROOTS.some((r) => resolved.startsWith(r));
}

function treeDir(dir, depth = 0, maxDepth = 2) {
    if (depth > maxDepth || !fs.existsSync(dir)) return [];
    try {
        return fs.readdirSync(dir)
            .filter((f) => !f.startsWith('.') && !f.includes('.backup'))
            .map((f) => {
                const full = path.join(dir, f);
                const stat = fs.statSync(full);
                const entry = { name: f, type: stat.isDirectory() ? 'dir' : 'file', sizeKB: Math.round(stat.size / 1024) };
                if (stat.isDirectory() && depth < maxDepth) {
                    entry.children = treeDir(full, depth + 1, maxDepth);
                }
                return entry;
            });
    } catch (_) { return []; }
}

function searchFiles(dir, pattern, results = [], limit = 50) {
    if (!fs.existsSync(dir) || results.length >= limit) return results;
    try {
        for (const f of fs.readdirSync(dir)) {
            if (results.length >= limit) break;
            if (f.startsWith('.') || f.includes('.backup')) continue;
            const full = path.join(dir, f);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                searchFiles(full, pattern, results, limit);
            } else if (f.toLowerCase().includes(pattern.toLowerCase())) {
                results.push({ file: f, path: path.relative(ROOT, full), sizeKB: Math.round(stat.size / 1024) });
            }
        }
    } catch (_) {}
    return results;
}

function syntaxCheck(filePath) {
    if (!fs.existsSync(filePath)) return { ok: false, reason: 'file-not-found' };
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.js') {
        const res = spawnSync(process.execPath, ['-c', filePath], { encoding: 'utf8', timeout: 5000 });
        return { ok: res.status === 0, reason: res.status === 0 ? 'ok' : (res.stderr || 'syntax-error') };
    }
    if (ext === '.json') {
        try { JSON.parse(fs.readFileSync(filePath, 'utf8')); return { ok: true, reason: 'ok' }; }
        catch (e) { return { ok: false, reason: e.message }; }
    }
    return { ok: true, reason: 'not-checked' };
}

// ─── محلل الكود البسيط ────────────────────────────────────────────────────────

function analyzeCode(code, language = 'javascript') {
    const lines = code.split('\n');
    const analysis = {
        language,
        lines: lines.length,
        chars: code.length,
        functions: (code.match(/function\s+\w+|=>\s*\{|async\s+\w+/g) || []).length,
        classes: (code.match(/class\s+\w+/g) || []).length,
        imports: (code.match(/require\s*\(|import\s+/g) || []).length,
        comments: (code.match(/\/\/|\/\*|\*\//g) || []).length,
        todos: (code.match(/TODO|FIXME|HACK|XXX/gi) || []).length,
        arabicPresent: /[\u0600-\u06FF]/.test(code),
        issues: []
    };

    // فحوصات بسيطة
    if (lines.some((l) => l.length > 200)) {
        analysis.issues.push({ type: 'style', msg: 'بعض الأسطر طويلة جداً (>200 حرف)' });
    }
    if (/console\.log/.test(code)) {
        analysis.issues.push({ type: 'warn', msg: 'console.log موجود — قد يحتاج إزالة في الإنتاج' });
    }
    if (/eval\s*\(/.test(code)) {
        analysis.issues.push({ type: 'security', msg: 'استخدام eval() — خطر أمني محتمل' });
    }
    if (/password|secret|token/.test(code.toLowerCase()) && /=\s*['"]/.test(code)) {
        analysis.issues.push({ type: 'security', msg: 'قد تكون هناك بيانات حساسة مكتوبة مباشرة' });
    }

    analysis.score = Math.max(0, 100 - analysis.issues.length * 10 - analysis.todos * 5);
    return analysis;
}

// ─── اقتراحات الإكمال التلقائي ───────────────────────────────────────────────

const SHEIKHA_SNIPPETS = [
    { trigger: 'sheikha-engine', label: 'Sheikha Engine Class', detail: 'قالب محرك شيخة',
      insert: "class SheikhaEngine {\n    constructor() {\n        this.name = '';\n        this.version = '1.0.0';\n    }\n\n    getDashboard() {\n        return { name: this.name, version: this.version, status: 'active' };\n    }\n}\n\nmodule.exports = SheikhaEngine;" },
    { trigger: 'sheikha-api', label: 'Sheikha API Route', detail: 'قالب مسار API',
      insert: "app.get('/api/endpoint', async (req, res) => {\n    try {\n        res.json({ success: true, data: {}, timestamp: new Date().toISOString() });\n    } catch (err) {\n        res.status(500).json({ success: false, error: err.message });\n    }\n});" },
    { trigger: 'bismillah', label: 'Bismillah Header', detail: 'رأس بسم الله الرحمن الرحيم',
      insert: "/**\n * بسم الله الرحمن الرحيم\n * ═══════════════════════════════════════════════════════\n * «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»\n * ═══════════════════════════════════════════════════════\n */" },
    { trigger: 'sheikha-send-json', label: 'sendJSON helper', detail: 'دالة إرسال JSON',
      insert: "function sendJSON(res, status, data) {\n    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });\n    res.end(JSON.stringify(data, null, 2));\n}" }
];

function getCompletions(prefix) {
    if (!prefix) return SHEIKHA_SNIPPETS.slice(0, 5);
    return SHEIKHA_SNIPPETS.filter(
        (s) => s.trigger.startsWith(prefix) || s.label.toLowerCase().includes(prefix.toLowerCase())
    );
}

// ─── IDE API Routes ────────────────────────────────────────────────────────────

const ROUTES = {

    // ── GET /ide/health ──────────────────────────────────────────────────────
    'GET /ide/health': async (_req, res) => {
        sendJSON(res, 200, {
            success: true,
            server: 'Sheikha IDE Server',
            version: '1.0.0',
            port: IDE_PORT,
            status: 'running',
            capabilities: ['file-tree', 'code-analysis', 'autocomplete', 'syntax-check', 'search'],
            timestamp: new Date().toISOString(),
            quran: { ref: 'العلق:١', text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ' }
        });
    },

    // ── GET /ide/tree ────────────────────────────────────────────────────────
    'GET /ide/tree': async (req, res) => {
        const url = new URL(req.url, `http://localhost`);
        const section = url.searchParams.get('section') || 'lib';
        const sectionMap = {
            lib: path.join(ROOT, 'lib'),
            routes: path.join(ROOT, 'routes'),
            core: path.join(ROOT, 'core'),
            mcp: __dirname,
            public: path.join(ROOT, 'public')
        };
        const dir = sectionMap[section] || sectionMap.lib;
        const tree = treeDir(dir, 0, 2);
        sendJSON(res, 200, {
            success: true,
            section,
            path: path.relative(ROOT, dir),
            tree,
            count: tree.length,
            timestamp: new Date().toISOString()
        });
    },

    // ── GET /ide/search ──────────────────────────────────────────────────────
    'GET /ide/search': async (req, res) => {
        const url = new URL(req.url, `http://localhost`);
        const q = url.searchParams.get('q') || '';
        if (!q) {
            return sendJSON(res, 400, { success: false, error: 'الحقل "q" مطلوب — مثال: ?q=neural' });
        }
        const results = searchFiles(ROOT, q, [], 30);
        sendJSON(res, 200, {
            success: true,
            query: q,
            count: results.length,
            results,
            timestamp: new Date().toISOString()
        });
    },

    // ── POST /ide/analyze ────────────────────────────────────────────────────
    'POST /ide/analyze': async (req, res) => {
        const body = await readBody(req);
        const { code, language } = body;
        if (!code) {
            return sendJSON(res, 400, { success: false, error: 'الحقل "code" مطلوب' });
        }
        if (code.length > 100000) {
            return sendJSON(res, 413, { success: false, error: 'الكود كبير جداً (الحد الأقصى 100KB)' });
        }
        const analysis = analyzeCode(code, language || 'javascript');
        sendJSON(res, 200, {
            success: true,
            analysis,
            timestamp: new Date().toISOString()
        });
    },

    // ── POST /ide/syntax-check ───────────────────────────────────────────────
    'POST /ide/syntax-check': async (req, res) => {
        const body = await readBody(req);
        const { filePath } = body;
        if (!filePath) {
            return sendJSON(res, 400, { success: false, error: 'الحقل "filePath" مطلوب' });
        }
        const full = path.resolve(ROOT, filePath);
        if (!isSafePath(full)) {
            return sendJSON(res, 403, { success: false, error: 'الوصول مرفوض — المسار خارج النطاق المسموح' });
        }
        const result = syntaxCheck(full);
        sendJSON(res, 200, {
            success: true,
            file: filePath,
            syntaxCheck: result,
            timestamp: new Date().toISOString()
        });
    },

    // ── GET /ide/completions ─────────────────────────────────────────────────
    'GET /ide/completions': async (req, res) => {
        const url = new URL(req.url, `http://localhost`);
        const prefix = url.searchParams.get('prefix') || '';
        const completions = getCompletions(prefix);
        sendJSON(res, 200, {
            success: true,
            prefix,
            count: completions.length,
            completions,
            timestamp: new Date().toISOString()
        });
    },

    // ── POST /ide/read-file ──────────────────────────────────────────────────
    'POST /ide/read-file': async (req, res) => {
        const body = await readBody(req);
        const { filePath } = body;
        if (!filePath) {
            return sendJSON(res, 400, { success: false, error: 'الحقل "filePath" مطلوب' });
        }
        const full = path.resolve(ROOT, filePath);
        if (!isSafePath(full)) {
            return sendJSON(res, 403, { success: false, error: 'الوصول مرفوض — المسار خارج النطاق المسموح' });
        }
        if (!fs.existsSync(full)) {
            return sendJSON(res, 404, { success: false, error: 'الملف غير موجود' });
        }
        const stat = fs.statSync(full);
        if (stat.size > 500 * 1024) {
            return sendJSON(res, 413, { success: false, error: 'الملف كبير جداً (الحد 500KB)' });
        }
        const content = fs.readFileSync(full, 'utf8');
        sendJSON(res, 200, {
            success: true,
            file: filePath,
            content,
            lines: content.split('\n').length,
            sizeKB: Math.round(stat.size / 1024),
            timestamp: new Date().toISOString()
        });
    },

    // ── GET /ide/docs ────────────────────────────────────────────────────────
    'GET /ide/docs': async (_req, res) => {
        sendJSON(res, 200, {
            success: true,
            server: 'Sheikha IDE Server v1.0.0',
            description: 'خادم بيئة التطوير المتكاملة — Sheikha IDE Server',
            baseUrl: `http://localhost:${IDE_PORT}`,
            endpoints: [
                { method: 'GET',  path: '/ide/health',       desc: 'فحص صحة خادم IDE' },
                { method: 'GET',  path: '/ide/tree',          desc: 'شجرة الملفات (query: ?section=lib|routes|core|mcp|public)' },
                { method: 'GET',  path: '/ide/search',        desc: 'بحث في الملفات (query: ?q=نمط)' },
                { method: 'POST', path: '/ide/analyze',       desc: 'تحليل الكود (body: {code, language})' },
                { method: 'POST', path: '/ide/syntax-check',  desc: 'فحص صحة ملف (body: {filePath})' },
                { method: 'GET',  path: '/ide/completions',   desc: 'اقتراحات إكمال (query: ?prefix=sheikha)' },
                { method: 'POST', path: '/ide/read-file',     desc: 'قراءة ملف (body: {filePath}) — مسارات آمنة فقط' },
                { method: 'GET',  path: '/ide/docs',          desc: 'توثيق IDE (هذه الصفحة)' }
            ],
            relatedServers: {
                main: `http://localhost:8080`,
                sdk:  `http://localhost:3001`,
                ide:  `http://localhost:${IDE_PORT}`
            },
            propheticPrinciples: {
                itqan: 'إتقان العمل — «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',
                sidq:  'الصدق في القول والفعل',
                amanah:'الأمانة في الأداء'
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
    const handler = ROUTES[routeKey];

    if (handler) {
        try {
            await handler(req, res);
        } catch (err) {
            sendJSON(res, 500, { success: false, error: err.message, timestamp: new Date().toISOString() });
        }
        return;
    }

    // جذر → توثيق
    if (urlPath === '' || urlPath === '/') {
        return ROUTES['GET /ide/docs'](req, res);
    }

    sendJSON(res, 404, {
        success: false,
        error: `المسار غير موجود: ${urlPath}`,
        hint: 'جرّب GET /ide/docs لقائمة كاملة',
        timestamp: new Date().toISOString()
    });
});

httpServer.listen(IDE_PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🖥️  SHEIKHA IDE SERVER — خادم بيئة التطوير                 ║
║  «اقرأ باسم ربك الذي خلق»                                   ║
╠══════════════════════════════════════════════════════════════╣
║  🌐 الرابط:      http://localhost:${IDE_PORT}                   ║
║  📚 توثيق:       http://localhost:${IDE_PORT}/ide/docs         ║
║  ❤️  الصحة:      http://localhost:${IDE_PORT}/ide/health       ║
║  🌳 الملفات:     http://localhost:${IDE_PORT}/ide/tree         ║
║  🔍 البحث:       http://localhost:${IDE_PORT}/ide/search?q=    ║
║  ✅ مدقق الكود:  POST /ide/analyze  |  /ide/syntax-check     ║
╠══════════════════════════════════════════════════════════════╣
║  SDK Server:  http://localhost:3001                          ║
║  Main Server: http://localhost:8080                          ║
╚══════════════════════════════════════════════════════════════╝
`);
});

httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`⛔ المنفذ ${IDE_PORT} مشغول — جرّب: SHEIKHA_IDE_PORT=3012 node sheikha-ide-server.js`);
    } else {
        console.error('❌ خطأ في IDE Server:', err.message);
    }
    process.exit(1);
});

module.exports = { httpServer };
