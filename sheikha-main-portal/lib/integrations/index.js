/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                  lib/integrations/index.js                                  ║
 * ║          طبقة التكاملات — محولات الأنظمة الخارجية                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * القاعدة الحاكمة:
 *  كل نظام خارجي → ليس حاكمًا → بل شريك → يتصل عبر adapter → يخضع لطبقة شيخة
 *
 * التكاملات الأساسية:
 *  GitHub | GitLab | OpenAI | Google | Meta | NVIDIA | ERP | SCM
 *  SaaS | Analytics | Payments | Email | Messaging
 */

'use strict';

const https = require('https');

// ─── Adapter Registry ────────────────────────────────────────────────────────

const _adapters = new Map();

/**
 * تسجيل محوّل (adapter) لنظام خارجي
 * @param {string} systemName
 * @param {object} adapter  — { connect, disconnect, call, status }
 */
function registerAdapter(systemName, adapter) {
    _adapters.set(systemName, {
        ...adapter,
        registeredAt: new Date().toISOString(),
        connected:    false,
    });
    console.log(`[INTEGRATIONS] 🔌 محوّل مسجّل: ${systemName}`);
}

/**
 * الحصول على محوّل
 * @param {string} systemName
 */
function getAdapter(systemName) {
    return _adapters.get(systemName) || null;
}

/**
 * قائمة المحوّلات
 */
function listAdapters() {
    return Array.from(_adapters.entries()).map(([name, a]) => ({
        name,
        connected:    a.connected,
        registeredAt: a.registeredAt,
    }));
}

// ─── Generic HTTP Caller ─────────────────────────────────────────────────────

/**
 * طلب HTTP عام (لاستخدامه داخل المحوّلات)
 * @param {object} options — { method, hostname, path, headers, body }
 */
function httpRequest(options) {
    const postData = options.body ? JSON.stringify(options.body) : null;
    const reqOptions = {
        hostname: options.hostname,
        path:     options.path,
        method:   options.method || 'GET',
        headers:  {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        },
    };

    return new Promise((resolve) => {
        const req = https.request(reqOptions, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                try {
                    resolve({ ok: res.statusCode < 400, statusCode: res.statusCode, data: JSON.parse(body) });
                } catch (_) {
                    resolve({ ok: res.statusCode < 400, statusCode: res.statusCode, data: body });
                }
            });
        });
        req.on('error', err => resolve({ ok: false, error: err.message }));
        if (postData) req.write(postData);
        req.end();
    });
}

// ─── Built-in Adapters ────────────────────────────────────────────────────────

// GitHub
registerAdapter('github', {
    connect: async () => {
        const token = process.env.GITHUB_TOKEN;
        return token ? { ok: true } : { ok: false, error: 'GITHUB_TOKEN غير موجود' };
    },
    call: async (endpoint, options = {}) => httpRequest({
        hostname: 'api.github.com',
        path:     endpoint,
        method:   options.method || 'GET',
        headers:  {
            Authorization:  `Bearer ${process.env.GITHUB_TOKEN || ''}`,
            'User-Agent':   'Sheikha-Market/1.0',
            Accept:         'application/vnd.github.v3+json',
        },
        body: options.body,
    }),
    status: () => ({ name: 'github', configured: !!process.env.GITHUB_TOKEN }),
});

// OpenAI
registerAdapter('openai', {
    connect: async () => {
        const key = process.env.OPENAI_API_KEY;
        return key ? { ok: true } : { ok: false, error: 'OPENAI_API_KEY غير موجود' };
    },
    call: async (endpoint, options = {}) => httpRequest({
        hostname: 'api.openai.com',
        path:     endpoint,
        method:   options.method || 'POST',
        headers:  {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY || ''}`,
        },
        body: options.body,
    }),
    status: () => ({ name: 'openai', configured: !!process.env.OPENAI_API_KEY }),
});

// Webhook (generic outbound)
registerAdapter('webhook', {
    connect: async () => ({ ok: true }),
    call: async (url, options = {}) => {
        try {
            const urlObj = new URL(url);
            return httpRequest({
                hostname: urlObj.hostname,
                path:     urlObj.pathname + urlObj.search,
                method:   options.method || 'POST',
                headers:  options.headers || {},
                body:     options.body,
            });
        } catch (err) {
            return { ok: false, error: err.message };
        }
    },
    status: () => ({ name: 'webhook', configured: true }),
});

// ─── Integration Status ───────────────────────────────────────────────────────

function status() {
    const adapters = listAdapters();
    const statuses = {};
    _adapters.forEach((adapter, name) => {
        statuses[name] = typeof adapter.status === 'function' ? adapter.status() : {};
    });
    return {
        name:     'integrations',
        total:    _adapters.size,
        adapters,
        statuses,
    };
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    registerAdapter,
    getAdapter,
    listAdapters,
    httpRequest,
    status,
};
