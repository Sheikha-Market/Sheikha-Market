/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║            SHEIKHA Runtime Kernel — النواة التشغيلية العليا                 ║
 * ║       SHEIKHA Sovereign Cognitive Infrastructure — طبقة النواة               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * المسؤوليات:
 *   - orchestration        — تنسيق التدفقات
 *   - runtime lifecycle    — دورة حياة التشغيل
 *   - engine loading       — تحميل المحركات
 *   - health monitoring    — مراقبة الصحة
 *   - distributed coord.   — التنسيق الموزع
 *   - sync                 — المزامنة
 *   - observability        — الرقابة والقياس
 *   - autonomous ops       — العمليات الذاتية
 *
 * @module runtime/sheikha-runtime-kernel
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

const EventEmitter = require('events');

// ─── Kernel Identity ─────────────────────────────────────────────────────────

const KERNEL_IDENTITY = {
    name: 'SHEIKHA Runtime Kernel',
    identity: 'SHEIKHA Sovereign Cognitive Infrastructure',
    executive: 'Unified Global Operational Intelligence Infrastructure',
    version: '1.0.0',
    phase: 'Phase-1-Modular-Monolith',
    bootTime: null,
    instanceId: `kernel-${Date.now()}`,
};

// ─── Engine Registry ─────────────────────────────────────────────────────────

/**
 * سجل المحركات المحمّلة في بيئة التشغيل.
 * @type {Map<string, {module: object, loadedAt: string, status: string}>}
 */
const _engines = new Map();

/**
 * سجل الخدمات النشطة في دورة الحياة.
 * @type {Map<string, {status: string, startedAt: string|null, meta: object}>}
 */
const _services = new Map();

/**
 * حافلة الأحداث التشغيلية الداخلية.
 */
const _bus = new EventEmitter();
_bus.setMaxListeners(64);

// ─── Lifecycle ───────────────────────────────────────────────────────────────

/**
 * تهيئة النواة وبدء دورة الحياة التشغيلية.
 */
function boot() {
    if (KERNEL_IDENTITY.bootTime) {
        _log('warn', 'النواة مُشغَّلة بالفعل — تم تجاهل boot() الثانية');
        return;
    }
    KERNEL_IDENTITY.bootTime = new Date().toISOString();
    _log('info', `نواة التشغيل بدأت | ${KERNEL_IDENTITY.version} | ${KERNEL_IDENTITY.bootTime}`);
    _bus.emit('kernel:boot', { identity: KERNEL_IDENTITY });
}

/**
 * إيقاف تشغيل النواة بأمان.
 */
function shutdown() {
    _log('info', 'إيقاف التشغيل المنظّم للنواة…');
    _bus.emit('kernel:shutdown', { at: new Date().toISOString() });
    _engines.clear();
    _services.clear();
}

// ─── Engine Loading ──────────────────────────────────────────────────────────

/**
 * تحميل محرك في النواة.
 * @param {string} name
 * @param {object} engineModule
 */
function loadEngine(name, engineModule) {
    if (_engines.has(name)) {
        _log('warn', `المحرك "${name}" محمّل مسبقًا — سيُعاد تحميله`);
    }
    _engines.set(name, {
        module: engineModule,
        loadedAt: new Date().toISOString(),
        status: 'loaded',
    });
    _log('info', `✅ محرك محمّل: ${name}`);
    _bus.emit('engine:loaded', { name });
}

/**
 * الحصول على محرك محمّل.
 * @param {string} name
 * @returns {object|null}
 */
function getEngine(name) {
    return _engines.has(name) ? _engines.get(name).module : null;
}

// ─── Service Lifecycle ───────────────────────────────────────────────────────

/**
 * تسجيل خدمة في دورة حياة النواة.
 * @param {string} name
 * @param {object} [meta={}]
 */
function registerService(name, meta = {}) {
    _services.set(name, { status: 'registered', startedAt: null, meta });
    _log('info', `📋 خدمة مسجّلة: ${name}`);
}

/**
 * تشغيل خدمة مسجّلة.
 * @param {string} name
 */
function startService(name) {
    if (!_services.has(name)) {
        _log('warn', `الخدمة "${name}" غير مسجّلة`);
        return false;
    }
    const svc = _services.get(name);
    svc.status = 'running';
    svc.startedAt = new Date().toISOString();
    _log('info', `▶️  خدمة مُشغَّلة: ${name}`);
    _bus.emit('service:started', { name });
    return true;
}

/**
 * إيقاف خدمة.
 * @param {string} name
 */
function stopService(name) {
    if (!_services.has(name)) return false;
    const svc = _services.get(name);
    svc.status = 'stopped';
    _log('info', `⏹  خدمة متوقفة: ${name}`);
    _bus.emit('service:stopped', { name });
    return true;
}

// ─── Distributed Coordination ─────────────────────────────────────────────────

/**
 * مزامنة الحالة التشغيلية مع عقدة موزعة.
 * @param {string} nodeId
 * @param {object} state
 */
function syncNode(nodeId, state) {
    _log('info', `🔄 مزامنة عقدة: ${nodeId}`);
    _bus.emit('node:sync', { nodeId, state, syncedAt: new Date().toISOString() });
}

// ─── Health Monitoring ───────────────────────────────────────────────────────

/**
 * فحص صحة النواة وإرجاع تقرير مفصّل.
 * @returns {object}
 */
function healthCheck() {
    const runningServices = [..._services.entries()]
        .filter(([, v]) => v.status === 'running')
        .map(([k]) => k);

    const report = {
        status: 'operational',
        identity: KERNEL_IDENTITY.name,
        version: KERNEL_IDENTITY.version,
        bootTime: KERNEL_IDENTITY.bootTime,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        engines: _engines.size,
        services: {
            total: _services.size,
            running: runningServices.length,
            list: runningServices,
        },
        checkedAt: new Date().toISOString(),
    };

    _bus.emit('kernel:health', report);
    return report;
}

// ─── Observability ───────────────────────────────────────────────────────────

/**
 * تسجيل مستمع لأحداث النواة.
 * @param {string} event
 * @param {Function} handler
 */
function on(event, handler) {
    _bus.on(event, handler);
}

/**
 * إصدار حدث تشغيلي.
 * @param {string} event
 * @param {object} [payload={}]
 */
function emit(event, payload = {}) {
    _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() });
}

// ─── Kernel Status ───────────────────────────────────────────────────────────

/**
 * إرجاع هوية وحالة النواة.
 * @returns {object}
 */
function status() {
    return {
        ...KERNEL_IDENTITY,
        enginesLoaded: _engines.size,
        servicesRegistered: _services.size,
    };
}

// ─── Internal Logging ────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-RUNTIME-KERNEL]';
    if (level === 'warn') console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
    boot,
    shutdown,
    loadEngine,
    getEngine,
    registerService,
    startService,
    stopService,
    syncNode,
    healthCheck,
    status,
    on,
    emit,
    KERNEL_IDENTITY,
};
