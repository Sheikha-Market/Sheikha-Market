/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                     SHEIKHA CONTROL PLANE                                   ║
 * ║           طبقة التحكم الموحدة — الأحداث والأوامر والهوية                    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الوظائف:
 *  - توحيد الأوامر
 *  - توحيد الأحداث (Event Bus)
 *  - توحيد الهوية
 *  - إعلان الحالة
 *  - تنفيذ الإجراءات
 */

'use strict';

const EventEmitter = require('events');

// ─── Event Bus ────────────────────────────────────────────────────────────────

class SheikhaEventBus extends EventEmitter {}
const eventBus = new SheikhaEventBus();
eventBus.setMaxListeners(50);

/**
 * نشر حدث في المنظومة
 * @param {string} event
 * @param {*} payload
 */
function publish(event, payload) {
    console.log(`[CONTROL-PLANE] 📡 حدث: ${event}`);
    eventBus.emit(event, payload);
    eventBus.emit('*', { event, payload }); // wildcard listener
}

/**
 * الاشتراك في حدث
 * @param {string} event
 * @param {Function} listener
 */
function subscribe(event, listener) {
    eventBus.on(event, listener);
}

/**
 * الاشتراك لمرة واحدة
 * @param {string} event
 * @param {Function} listener
 */
function once(event, listener) {
    eventBus.once(event, listener);
}

// ─── Command Registry ─────────────────────────────────────────────────────────

const _commands = new Map(); // command → { handler, description, layer }

/**
 * تسجيل أمر موحّد
 * @param {string} command
 * @param {Function} handler
 * @param {object} meta  — { description, layer }
 */
function registerCommand(command, handler, meta = {}) {
    _commands.set(command, { handler, ...meta });
    console.log(`[CONTROL-PLANE] 📌 أمر مسجّل: ${command} (${meta.layer || 'unknown'})`);
}

/**
 * تنفيذ أمر موحّد
 * @param {string} command
 * @param {*} payload
 */
async function dispatch(command, payload) {
    const entry = _commands.get(command);
    if (!entry) {
        const err = `أمر غير معروف: ${command}`;
        publish('command:error', { command, error: err });
        return { ok: false, error: err };
    }
    publish('command:before', { command, payload });
    try {
        const result = await entry.handler(payload);
        publish('command:after', { command, result });
        return { ok: true, result };
    } catch (err) {
        publish('command:error', { command, error: err.message });
        return { ok: false, error: err.message };
    }
}

/**
 * قائمة الأوامر المسجّلة
 */
function listCommands() {
    return Array.from(_commands.entries()).map(([cmd, meta]) => ({
        command: cmd,
        description: meta.description || '',
        layer: meta.layer || '',
    }));
}

// ─── Identity Store ───────────────────────────────────────────────────────────

const _identities = new Map(); // id → identity object

/**
 * تسجيل هوية في المنظومة (مستخدم / خدمة / نظام)
 * @param {string} id
 * @param {object} identity
 */
function registerIdentity(id, identity) {
    _identities.set(id, { ...identity, registeredAt: new Date().toISOString() });
}

/**
 * الحصول على هوية
 * @param {string} id
 */
function getIdentity(id) {
    return _identities.get(id) || null;
}

// ─── State Announcer ──────────────────────────────────────────────────────────

let _state = {
    phase:  'booting',
    health: 'unknown',
    lastAnnounced: null,
};

/**
 * الإعلان عن حالة المنظومة
 * @param {object} newState
 */
function announceState(newState) {
    _state = { ..._state, ...newState, lastAnnounced: new Date().toISOString() };
    publish('state:changed', _state);
    console.log(`[CONTROL-PLANE] 📢 الحالة: phase=${_state.phase} | health=${_state.health}`);
}

/**
 * الحالة الحالية
 */
function getState() {
    return { ..._state };
}

// ─── Action Executor ──────────────────────────────────────────────────────────

const _actions = [];

/**
 * تسجيل إجراء في سجل التدقيق
 * @param {string} actor
 * @param {string} action
 * @param {object} context
 */
function logAction(actor, action, context = {}) {
    const entry = {
        actor,
        action,
        context,
        timestamp: new Date().toISOString(),
    };
    _actions.push(entry);
    if (_actions.length > 1000) _actions.shift(); // نافذة متحركة
    publish('action:logged', entry);
}

/**
 * سجل الإجراءات
 * @param {number} limit
 */
function getActionLog(limit = 50) {
    return _actions.slice(-limit);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    console.log('[CONTROL-PLANE] ⚙️  تهيئة طبقة التحكم...');
    announceState({ phase: 'initializing', health: 'starting' });

    // أوامر مدمجة
    registerCommand('system:status', () => getState(), {
        description: 'حالة المنظومة',
        layer: 'control-plane',
    });
    registerCommand('system:commands', () => listCommands(), {
        description: 'قائمة الأوامر',
        layer: 'control-plane',
    });

    announceState({ phase: 'ready', health: 'ok' });
    console.log('[CONTROL-PLANE] ✅ طبقة التحكم جاهزة');
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    eventBus,
    publish,
    subscribe,
    once,
    registerCommand,
    dispatch,
    listCommands,
    registerIdentity,
    getIdentity,
    announceState,
    getState,
    logAction,
    getActionLog,
    init,
};
