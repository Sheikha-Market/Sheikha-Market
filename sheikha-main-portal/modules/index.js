/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           SHEIKHA Modules Registry — سجل الوحدات القابلة للتركيب            ║
 * ║         SHEIKHA Sovereign Cognitive Infrastructure                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * الغرض:
 *   أي إضافة جديدة تدخل كـ Module بدل تخريب النظام الأساسي.
 *   كل وحدة تمر عبر بوابة الاعتماد:
 *     - Scope
 *     - Owner
 *     - Value Hypothesis
 *     - Success Metrics
 *     - Architectural Fit
 *
 * @module modules/index
 * @version 1.0.0
 */

'use strict';

const EventEmitter = require('events');

// ─── Identity ────────────────────────────────────────────────────────────────

const MODULES_IDENTITY = {
    name: 'SHEIKHA Modules Registry',
    layer: 'Modules Layer',
    version: '1.0.0',
    startedAt: null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(64);

// ─── Module Registry ──────────────────────────────────────────────────────────

/**
 * سجل الوحدات.
 * @type {Map<string, {
 *   scope: string,
 *   owner: string,
 *   valueHypothesis: string,
 *   successMetrics: string[],
 *   architecturalFit: string,
 *   type: 'Module'|'Engine'|'RuntimeService'|'Domain',
 *   status: 'registered'|'active'|'disabled',
 *   module: object|null,
 *   registeredAt: string
 * }>}
 */
const _registry = new Map();

/**
 * تسجيل وحدة جديدة عبر بوابة الاعتماد.
 * @param {string} id           — المعرّف الفريد
 * @param {object} manifest     — بيانات الوحدة
 * @param {object} [impl=null]  — التنفيذ الفعلي
 */
function register(id, manifest, impl = null) {
    const required = ['scope', 'owner', 'valueHypothesis', 'successMetrics', 'architecturalFit'];
    for (const field of required) {
        if (!manifest[field]) {
            _log('error', `تسجيل الوحدة "${id}" رُفض: حقل ناقص "${field}"`);
            _bus.emit('module:rejected', { id, reason: `missing field: ${field}` });
            throw new Error(`Module manifest missing required field: ${field}`);
        }
    }

    _registry.set(id, {
        ...manifest,
        type: manifest.type || 'Module',
        status: 'registered',
        module: impl,
        registeredAt: new Date().toISOString(),
    });

    _log('info', `📦 وحدة مسجّلة: ${id} [${manifest.type || 'Module'}] — ${manifest.scope}`);
    _bus.emit('module:registered', { id, manifest });
    return true;
}

/**
 * تفعيل وحدة مسجّلة.
 * @param {string} id
 */
function activate(id) {
    if (!_registry.has(id)) {
        _log('warn', `الوحدة "${id}" غير موجودة`);
        return false;
    }
    _registry.get(id).status = 'active';
    _log('info', `▶️  وحدة مُفعَّلة: ${id}`);
    _bus.emit('module:activated', { id });
    return true;
}

/**
 * تعطيل وحدة.
 * @param {string} id
 */
function disable(id) {
    if (!_registry.has(id)) return false;
    _registry.get(id).status = 'disabled';
    _bus.emit('module:disabled', { id });
    return true;
}

/**
 * الحصول على تنفيذ وحدة نشطة.
 * @param {string} id
 * @returns {object|null}
 */
function get(id) {
    const mod = _registry.get(id);
    if (!mod) return null;
    if (mod.status !== 'active') {
        _log('warn', `الوحدة "${id}" غير نشطة [${mod.status}]`);
        return null;
    }
    return mod.module;
}

/**
 * قائمة الوحدات حسب النوع أو الحالة.
 * @param {{type?: string, status?: string}} [filter={}]
 * @returns {object[]}
 */
function list(filter = {}) {
    let entries = [..._registry.entries()].map(([id, mod]) => ({ id, ...mod }));
    if (filter.type) entries = entries.filter(m => m.type === filter.type);
    if (filter.status) entries = entries.filter(m => m.status === filter.status);
    return entries;
}

// ─── Status ───────────────────────────────────────────────────────────────────

function status() {
    const active = [..._registry.values()].filter(m => m.status === 'active').length;
    return {
        ...MODULES_IDENTITY,
        total: _registry.size,
        active,
        disabled: _registry.size - active,
    };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

function start() {
    MODULES_IDENTITY.startedAt = new Date().toISOString();
    _log('info', `SHEIKHA Modules Registry جاهز | ${MODULES_IDENTITY.startedAt}`);
    _bus.emit('modules:ready', { identity: MODULES_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }
function emit(event, payload = {}) { _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() }); }

// ─── Internal Logging ─────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-MODULES]';
    if (level === 'warn') console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    start,
    register,
    activate,
    disable,
    get,
    list,
    status,
    on,
    emit,
    MODULES_IDENTITY,
};
