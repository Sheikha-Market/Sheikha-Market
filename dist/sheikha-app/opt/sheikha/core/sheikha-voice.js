/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                        SHEIKHA VOICE                                        ║
 * ║              طبقة الصوت والتواصل — الرسائل والإشعارات والتقارير             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الوظائف:
 *  - إرسال رسائل داخلية بين الطبقات
 *  - تنسيق الإشعارات (Webhook / Log / Console)
 *  - توليد تقارير منسّقة
 *  - قناة صوتية موحّدة للمنظومة
 */

'use strict';

// ─── Voice Channels ───────────────────────────────────────────────────────────

const CHANNELS = {
    CONSOLE:  'console',
    LOG:      'log',
    WEBHOOK:  'webhook',
    INTERNAL: 'internal',
};

// ─── Message Queue ────────────────────────────────────────────────────────────

const _messages = [];

// ─── Channel Handlers ─────────────────────────────────────────────────────────

const _channelHandlers = {
    [CHANNELS.CONSOLE]: (msg) => {
        const prefix = _levelPrefix(msg.level);
        console.log(`${prefix} [SHEIKHA-VOICE] [${msg.source}] ${msg.text}`);
    },
    [CHANNELS.LOG]: (msg) => {
        _messages.push(msg);
        if (_messages.length > 500) _messages.shift();
    },
    [CHANNELS.INTERNAL]: (msg) => {
        _messages.push(msg);
    },
};

const _webhookListeners = [];

/**
 * تسجيل مستمع webhook
 * @param {Function} handler  async (msg) => {}
 */
function onWebhook(handler) {
    _webhookListeners.push(handler);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _levelPrefix(level) {
    const map = {
        info:    'ℹ️ ',
        success: '✅',
        warning: '⚠️ ',
        error:   '❌',
        debug:   '🔍',
    };
    return map[level] || '📢';
}

function _buildMessage(text, options = {}) {
    return {
        id:        `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        text,
        source:    options.source  || 'sheikha',
        level:     options.level   || 'info',
        channel:   options.channel || CHANNELS.CONSOLE,
        tags:      options.tags    || [],
        timestamp: new Date().toISOString(),
    };
}

// ─── Core API ─────────────────────────────────────────────────────────────────

/**
 * إرسال رسالة عبر قناة
 * @param {string} text
 * @param {object} options
 */
async function send(text, options = {}) {
    const msg = _buildMessage(text, options);

    // console handler always active
    _channelHandlers[CHANNELS.CONSOLE](msg);

    // log handler
    _channelHandlers[CHANNELS.LOG](msg);

    // webhook
    if (msg.channel === CHANNELS.WEBHOOK || options.webhook) {
        for (const handler of _webhookListeners) {
            try {
                await handler(msg);
            } catch (_) { /* بصمت */ }
        }
    }

    return msg;
}

/**
 * رسالة معلوماتية
 */
function info(text, options = {}) {
    return send(text, { ...options, level: 'info' });
}

/**
 * رسالة نجاح
 */
function success(text, options = {}) {
    return send(text, { ...options, level: 'success' });
}

/**
 * رسالة تحذير
 */
function warning(text, options = {}) {
    return send(text, { ...options, level: 'warning' });
}

/**
 * رسالة خطأ
 */
function error(text, options = {}) {
    return send(text, { ...options, level: 'error' });
}

/**
 * تقرير منسّق
 * @param {string} title
 * @param {object} data
 */
function report(title, data) {
    console.log('');
    console.log(`📊 ════ ${title} ════`);
    Object.entries(data).forEach(([k, v]) => {
        const val = typeof v === 'object' ? JSON.stringify(v) : v;
        console.log(`   ${k}: ${val}`);
    });
    console.log('');
    _messages.push(_buildMessage(`[REPORT] ${title}`, { level: 'info', source: 'voice' }));
}

/**
 * سجل الرسائل
 * @param {number} limit
 */
function getLog(limit = 50) {
    return _messages.slice(-limit);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    console.log('[SHEIKHA-VOICE] 🗣  تشغيل طبقة الصوت...');
    console.log('[SHEIKHA-VOICE] ✅ جاهز');
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    CHANNELS,
    send,
    info,
    success,
    warning,
    error,
    report,
    getLog,
    onWebhook,
    init,
};
