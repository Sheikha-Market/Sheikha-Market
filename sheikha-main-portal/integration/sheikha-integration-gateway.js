/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║       SHEIKHA Global Integration Gateway — بوابة التكاملات العالمية          ║
 * ║         SHEIKHA Sovereign Cognitive Infrastructure                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * المسؤوليات:
 *   - تسجيل الموصّلات الخارجية (connectors)
 *   - توحيد واجهات التكامل
 *   - إدارة حالة الاتصال
 *   - تحويل الرسائل بين الأنظمة
 *   - دعم التكاملات: GitHub, Azure, Google, Meta, PM2, Stripe, ERP, SCM
 *
 * @module integration/sheikha-integration-gateway
 * @version 1.0.0
 */

'use strict';

const EventEmitter = require('events');

// ─── Identity ────────────────────────────────────────────────────────────────

const INTEGRATION_IDENTITY = {
    name: 'SHEIKHA Global Integration Gateway',
    layer: 'Integration Layer',
    version: '1.0.0',
    startedAt: null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(64);

// ─── Connector Registry ───────────────────────────────────────────────────────

/**
 * سجل الموصّلات.
 * @type {Map<string, {
 *   type: string,
 *   status: 'registered'|'connected'|'disconnected'|'error',
 *   adapter: object|null,
 *   registeredAt: string,
 *   connectedAt: string|null
 * }>}
 */
const _connectors = new Map();

/**
 * الموصّلات العالمية المعتمدة.
 */
const KNOWN_INTEGRATIONS = [
    'github', 'azure', 'google', 'meta', 'stripe',
    'pm2', 'erp', 'scm', 'vps', 'copilot',
    'saudi-eservices', 'zatca', 'stc-pay', 'sadad',
];

/**
 * تسجيل موصّل تكامل.
 * @param {string} name
 * @param {string} type
 * @param {object} [adapter=null] — واجهة التنفيذ الفعلية
 */
function registerConnector(name, type, adapter = null) {
    _connectors.set(name, {
        type,
        status: 'registered',
        adapter,
        registeredAt: new Date().toISOString(),
        connectedAt: null,
    });
    _log('info', `🔌 موصّل مسجّل: ${name} [${type}]`);
    _bus.emit('connector:registered', { name, type });
}

/**
 * تفعيل اتصال موصّل.
 * @param {string} name
 * @returns {boolean}
 */
function connect(name) {
    if (!_connectors.has(name)) {
        _log('warn', `الموصّل "${name}" غير مسجّل`);
        return false;
    }
    const conn = _connectors.get(name);
    conn.status = 'connected';
    conn.connectedAt = new Date().toISOString();
    _log('info', `✅ تم الاتصال بـ: ${name}`);
    _bus.emit('connector:connected', { name });
    return true;
}

/**
 * قطع اتصال موصّل.
 * @param {string} name
 */
function disconnect(name) {
    if (!_connectors.has(name)) return;
    _connectors.get(name).status = 'disconnected';
    _bus.emit('connector:disconnected', { name });
    _log('info', `⏹ تم قطع الاتصال بـ: ${name}`);
}

/**
 * الحصول على محوّل موصّل للاستخدام المباشر.
 * @param {string} name
 * @returns {object|null}
 */
function getAdapter(name) {
    const conn = _connectors.get(name);
    if (!conn) return null;
    if (conn.status !== 'connected') {
        _log('warn', `الموصّل "${name}" غير متصل`);
        return null;
    }
    return conn.adapter;
}

// ─── Message Routing ──────────────────────────────────────────────────────────

/**
 * إرسال رسالة عبر موصّل محدد.
 * @param {string} connectorName
 * @param {object} message
 * @returns {object}
 */
function send(connectorName, message) {
    const adapter = getAdapter(connectorName);
    if (!adapter) {
        return { success: false, error: `connector "${connectorName}" not available` };
    }

    const envelope = {
        to: connectorName,
        payload: message,
        sentAt: new Date().toISOString(),
        messageId: `msg-${Date.now()}`,
    };

    _bus.emit('message:sent', envelope);

    if (typeof adapter.send === 'function') {
        try {
            adapter.send(envelope);
        } catch (err) {
            _bus.emit('message:error', { connectorName, error: err.message });
            return { success: false, error: err.message };
        }
    }

    return { success: true, messageId: envelope.messageId };
}

// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * حالة بوابة التكامل.
 * @returns {object}
 */
function status() {
    const connected = [..._connectors.values()].filter(c => c.status === 'connected').length;
    return {
        ...INTEGRATION_IDENTITY,
        connectors: {
            total: _connectors.size,
            connected,
            disconnected: _connectors.size - connected,
        },
    };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * تشغيل بوابة التكاملات وتسجيل الموصّلات المعتمدة.
 */
function start() {
    INTEGRATION_IDENTITY.startedAt = new Date().toISOString();

    // تسجيل تلقائي للموصّلات المعتمدة (بدون اتصال حتى يتم التهيئة)
    for (const name of KNOWN_INTEGRATIONS) {
        if (!_connectors.has(name)) {
            registerConnector(name, 'external', null);
        }
    }

    _log('info', `SHEIKHA Global Integration Gateway جاهزة | ${_connectors.size} موصّل`);
    _bus.emit('integration:ready', { identity: INTEGRATION_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }
function emit(event, payload = {}) { _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() }); }

// ─── Internal Logging ─────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-INTEGRATION]';
    if (level === 'warn') console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    start,
    registerConnector,
    connect,
    disconnect,
    getAdapter,
    send,
    status,
    on,
    emit,
    INTEGRATION_IDENTITY,
    KNOWN_INTEGRATIONS,
};
