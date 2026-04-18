/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                     lib/meta/index.js                                       ║
 * ║              محول Meta — CAPI / Pixel / WhatsApp Adapter                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * كل نظام خارجي ليس حاكمًا، بل شريك يتصل عبر adapter ويخضع لطبقة شيخة.
 */

'use strict';

const https = require('https');

// ─── Meta Config ─────────────────────────────────────────────────────────────

const META_CONFIG = {
    graphVersion:  process.env.META_GRAPH_VERSION  || 'v21.0',
    pixelId:       process.env.META_PIXEL_ID        || '',
    accessToken:   process.env.META_ACCESS_TOKEN    || '',
    whatsappToken: process.env.META_WHATSAPP_TOKEN  || '',
    waPhoneId:     process.env.META_WA_PHONE_ID     || '',
};

// ─── CAPI Helper ─────────────────────────────────────────────────────────────

/**
 * إرسال حدث CAPI إلى Meta
 * @param {string} eventName
 * @param {object} eventData
 */
async function sendCapiEvent(eventName, eventData = {}) {
    if (!META_CONFIG.pixelId || !META_CONFIG.accessToken) {
        return { ok: false, error: 'META_PIXEL_ID أو META_ACCESS_TOKEN غير مُعرَّف' };
    }

    const payload = {
        data: [{
            event_name:  eventName,
            event_time:  Math.floor(Date.now() / 1000),
            action_source: 'website',
            ...eventData,
        }],
    };

    const postData = JSON.stringify(payload);
    const options  = {
        hostname: 'graph.facebook.com',
        path:     `/${META_CONFIG.graphVersion}/${META_CONFIG.pixelId}/events?access_token=${META_CONFIG.accessToken}`,
        method:   'POST',
        headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                try {
                    resolve({ ok: res.statusCode < 400, statusCode: res.statusCode, body: JSON.parse(body) });
                } catch (_) {
                    resolve({ ok: false, statusCode: res.statusCode, body });
                }
            });
        });
        req.on('error', err => resolve({ ok: false, error: err.message }));
        req.write(postData);
        req.end();
    });
}

/**
 * إرسال رسالة WhatsApp
 * @param {string} to   — رقم الهاتف بصيغة دولية
 * @param {string} text
 */
async function sendWhatsApp(to, text) {
    if (!META_CONFIG.whatsappToken || !META_CONFIG.waPhoneId) {
        return { ok: false, error: 'META_WHATSAPP_TOKEN أو META_WA_PHONE_ID غير مُعرَّف' };
    }

    const payload  = { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } };
    const postData = JSON.stringify(payload);
    const options  = {
        hostname: 'graph.facebook.com',
        path:     `/${META_CONFIG.graphVersion}/${META_CONFIG.waPhoneId}/messages`,
        method:   'POST',
        headers:  {
            'Content-Type':  'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Authorization': `Bearer ${META_CONFIG.whatsappToken}`,
        },
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                try {
                    resolve({ ok: res.statusCode < 400, statusCode: res.statusCode, body: JSON.parse(body) });
                } catch (_) {
                    resolve({ ok: false, statusCode: res.statusCode, body });
                }
            });
        });
        req.on('error', err => resolve({ ok: false, error: err.message }));
        req.write(postData);
        req.end();
    });
}

// ─── Status ───────────────────────────────────────────────────────────────────

function status() {
    return {
        name:            'meta-adapter',
        pixelConfigured: !!META_CONFIG.pixelId,
        waConfigured:    !!META_CONFIG.whatsappToken,
        graphVersion:    META_CONFIG.graphVersion,
    };
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    META_CONFIG,
    sendCapiEvent,
    sendWhatsApp,
    status,
};
