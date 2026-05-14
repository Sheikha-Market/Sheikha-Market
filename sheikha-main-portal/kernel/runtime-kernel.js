/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║             SHEIKHA Runtime Kernel — النواة التشغيلية الحقيقية               ║
 * ║         طبقة Kernel المستقلة — بنية التشغيل السيادية                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * هذه الطبقة أعلى من runtime/ — إنها النواة الأم التي:
 *   - تُشغّل تسلسل الإقلاع (Boot Sequence)
 *   - تُدير آلة الحالة (State Machine)
 *   - تُحكم إيقاف التشغيل بسلاسة (Graceful Shutdown)
 *   - تُحمّل المحركات حسب الرسم البياني للتبعية (Dependency Graph)
 *   - تُوفر نقطة التحكم المركزية للنواة
 *
 * تسلسل الإقلاع الرسمي:
 *   1. Load Config
 *   2. Initialize Security
 *   3. Initialize Observability
 *   4. Initialize Runtime Fabric
 *   5. Initialize Engines
 *   6. Initialize Services
 *   7. Initialize APIs
 *   8. Start Runtime
 *   9. Start Monitoring
 *
 * @module kernel/runtime-kernel
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');

// ─── Kernel State Machine ─────────────────────────────────────────────────────

/**
 * حالات دورة حياة النواة.
 */
const KERNEL_STATES = {
    UNINITIALIZED: 'UNINITIALIZED',
    BOOTING:       'BOOTING',
    READY:         'READY',
    DEGRADED:      'DEGRADED',
    SHUTTING_DOWN: 'SHUTTING_DOWN',
    HALTED:        'HALTED',
};

/**
 * انتقالات الحالة المسموحة.
 */
const VALID_TRANSITIONS = {
    [KERNEL_STATES.UNINITIALIZED]: [KERNEL_STATES.BOOTING],
    [KERNEL_STATES.BOOTING]:       [KERNEL_STATES.READY, KERNEL_STATES.DEGRADED, KERNEL_STATES.HALTED],
    [KERNEL_STATES.READY]:         [KERNEL_STATES.DEGRADED, KERNEL_STATES.SHUTTING_DOWN],
    [KERNEL_STATES.DEGRADED]:      [KERNEL_STATES.READY, KERNEL_STATES.SHUTTING_DOWN],
    [KERNEL_STATES.SHUTTING_DOWN]: [KERNEL_STATES.HALTED],
    [KERNEL_STATES.HALTED]:        [],
};

// ─── Kernel Identity ─────────────────────────────────────────────────────────

const KERNEL_IDENTITY = {
    name:      'SHEIKHA Runtime Kernel',
    sovereign: 'SHEIKHA Sovereign Cognitive Infrastructure',
    runtime:   'SHEIKHA Global Runtime Fabric',
    mode:      'operational',
    arch:      'distributed-modular-runtime',
    version:   '1.0.0',
};

// ─── Boot Step Registry ───────────────────────────────────────────────────────

/**
 * تسلسل خطوات الإقلاع المعتمد.
 * @type {Array<{id: string, name: string, critical: boolean, fn: Function|null}>}
 */
const _bootSteps = [
    { id: 'load-config',              name: 'Load Config',               critical: true,  fn: null },
    { id: 'init-security',            name: 'Initialize Security',        critical: true,  fn: null },
    { id: 'init-observability',       name: 'Initialize Observability',   critical: true,  fn: null },
    { id: 'init-runtime-fabric',      name: 'Initialize Runtime Fabric',  critical: true,  fn: null },
    { id: 'init-engines',             name: 'Initialize Engines',         critical: false, fn: null },
    { id: 'init-services',            name: 'Initialize Services',        critical: false, fn: null },
    { id: 'init-apis',                name: 'Initialize APIs',            critical: false, fn: null },
    { id: 'start-runtime',            name: 'Start Runtime',              critical: true,  fn: null },
    { id: 'start-monitoring',         name: 'Start Monitoring',           critical: false, fn: null },
];

const _bootResults = new Map(); // stepId → { status, duration, error }

// ─── Kernel Core ──────────────────────────────────────────────────────────────

let _state = KERNEL_STATES.UNINITIALIZED;
let _bootTime = null;
let _shutdownTime = null;

const _bus = new EventEmitter();
_bus.setMaxListeners(128);

// Engine registry (dependency-ordered)
const _engines = new Map();          // name → { module, deps, status, loadedAt }
const _engineDeps = new Map();       // name → string[] (dependency names)

// ─── State Machine ────────────────────────────────────────────────────────────

/**
 * الانتقال إلى حالة جديدة.
 * @param {string} newState
 */
function _transition(newState) {
    const allowed = VALID_TRANSITIONS[_state] || [];
    if (!allowed.includes(newState)) {
        throw new Error(`[KERNEL] انتقال غير مسموح: ${_state} → ${newState}`);
    }
    const prev = _state;
    _state = newState;
    _log('info', `حالة النواة: ${prev} → ${newState}`);
    _bus.emit('kernel:state', { from: prev, to: newState, at: new Date().toISOString() });
}

/**
 * الحالة الحالية للنواة.
 * @returns {string}
 */
function getState() { return _state; }

// ─── Boot Step Registration ───────────────────────────────────────────────────

/**
 * ربط دالة تنفيذ بخطوة إقلاع.
 * @param {string} stepId
 * @param {Function} fn   — دالة غير متزامنة
 */
function registerBootStep(stepId, fn) {
    const step = _bootSteps.find(s => s.id === stepId);
    if (!step) throw new Error(`[KERNEL] خطوة إقلاع غير معروفة: ${stepId}`);
    step.fn = fn;
}

// ─── Engine Dependency Graph ──────────────────────────────────────────────────

/**
 * تسجيل محرك مع قائمة التبعيات.
 * @param {string} name
 * @param {object} engineModule
 * @param {string[]} [deps=[]]
 */
function registerEngine(name, engineModule, deps = []) {
    _engines.set(name, { module: engineModule, deps, status: 'registered', loadedAt: null });
    _engineDeps.set(name, deps);
}

/**
 * تحليل ترتيب تحميل المحركات حسب التبعية (Topological Sort).
 * @returns {string[]}
 */
function resolveLoadOrder() {
    const visited = new Set();
    const order = [];

    function visit(name) {
        if (visited.has(name)) return;
        visited.add(name);
        const deps = _engineDeps.get(name) || [];
        for (const dep of deps) visit(dep);
        order.push(name);
    }

    for (const name of _engines.keys()) visit(name);
    return order;
}

/**
 * تحميل محرك.
 * @param {string} name
 */
function loadEngine(name) {
    const eng = _engines.get(name);
    if (!eng) {
        _log('warn', `المحرك "${name}" غير مسجّل`);
        return false;
    }
    eng.status = 'loaded';
    eng.loadedAt = new Date().toISOString();
    _bus.emit('engine:loaded', { name, loadedAt: eng.loadedAt });
    return true;
}

/**
 * تحميل جميع المحركات بالترتيب الصحيح.
 */
function loadAllEngines() {
    const order = resolveLoadOrder();
    _log('info', `تحميل ${order.length} محرك بالترتيب…`);
    for (const name of order) {
        loadEngine(name);
        _log('info', `  ⚙️  ${name}`);
    }
}

/**
 * الحصول على محرك.
 * @param {string} name
 * @returns {object|null}
 */
function getEngine(name) {
    return _engines.has(name) ? _engines.get(name).module : null;
}

// ─── Boot Sequence ────────────────────────────────────────────────────────────

/**
 * تنفيذ تسلسل الإقلاع الكامل.
 * @returns {Promise<{success: boolean, steps: object[]}>}
 */
async function boot() {
    if (_state !== KERNEL_STATES.UNINITIALIZED) {
        _log('warn', 'النواة مُشغَّلة بالفعل');
        return { success: false, reason: 'already booted' };
    }

    _bootTime = new Date().toISOString();
    _transition(KERNEL_STATES.BOOTING);
    _banner();

    const results = [];
    let hasCriticalFailure = false;

    for (const step of _bootSteps) {
        const stepStart = Date.now();
        _log('info', `  ▶ ${step.name}…`);

        try {
            if (typeof step.fn === 'function') {
                await step.fn();
            }
            const duration = Date.now() - stepStart;
            _bootResults.set(step.id, { status: 'done', duration });
            results.push({ id: step.id, name: step.name, status: 'done', duration });
            _log('info', `  ✅ ${step.name} (${duration}ms)`);
            _bus.emit('boot:step:done', { step: step.id, duration });
        } catch (err) {
            const duration = Date.now() - stepStart;
            _bootResults.set(step.id, { status: 'failed', duration, error: err.message });
            results.push({ id: step.id, name: step.name, status: 'failed', error: err.message });
            _bus.emit('boot:step:failed', { step: step.id, error: err.message });
            _log('error', `  ❌ ${step.name}: ${err.message}`);
            if (step.critical) {
                hasCriticalFailure = true;
                break;
            }
        }
    }

    if (hasCriticalFailure) {
        _transition(KERNEL_STATES.HALTED);
        return { success: false, steps: results };
    }

    _transition(KERNEL_STATES.READY);
    _log('info', `النواة جاهزة | boot: ${_bootTime}`);
    _bus.emit('kernel:ready', { identity: KERNEL_IDENTITY, bootTime: _bootTime });
    return { success: true, steps: results };
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

/**
 * إيقاف تشغيل النواة بسلاسة.
 * @param {string} [reason='manual']
 */
async function shutdown(reason = 'manual') {
    if (_state === KERNEL_STATES.HALTED || _state === KERNEL_STATES.SHUTTING_DOWN) return;

    _transition(KERNEL_STATES.SHUTTING_DOWN);
    _shutdownTime = new Date().toISOString();
    _log('info', `إيقاف التشغيل | السبب: ${reason}`);
    _bus.emit('kernel:shutdown', { reason, at: _shutdownTime });

    // إعطاء فرصة للمستمعين للتنظيف
    await new Promise(resolve => setTimeout(resolve, 50));

    _engines.clear();
    _transition(KERNEL_STATES.HALTED);
    _log('info', 'النواة متوقفة');
}

// ─── Health Check ─────────────────────────────────────────────────────────────

/**
 * تقرير صحة النواة.
 * @returns {object}
 */
function health() {
    const engineStatuses = [..._engines.entries()].map(([name, e]) => ({
        name,
        status: e.status,
        loadedAt: e.loadedAt,
    }));

    return {
        kernel: KERNEL_IDENTITY.name,
        state: _state,
        bootTime: _bootTime,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        engines: engineStatuses,
        bootSteps: [..._bootResults.entries()].map(([id, r]) => ({ id, ...r })),
        checkedAt: new Date().toISOString(),
    };
}

// ─── Kernel Status ────────────────────────────────────────────────────────────

/**
 * حالة النواة الكاملة.
 * @returns {object}
 */
function status() {
    return {
        ...KERNEL_IDENTITY,
        state: _state,
        bootTime: _bootTime,
        enginesRegistered: _engines.size,
    };
}

// ─── Runtime Identity ─────────────────────────────────────────────────────────

/**
 * قراءة أو كتابة runtime.identity.json.
 * @param {object|null} [override=null]
 * @returns {object}
 */
function runtimeIdentity(override = null) {
    const identityPath = path.join(__dirname, '..', 'runtime', 'runtime.identity.json');
    if (override) {
        fs.writeFileSync(identityPath, JSON.stringify(override, null, 2), 'utf8');
        return override;
    }
    if (fs.existsSync(identityPath)) {
        return JSON.parse(fs.readFileSync(identityPath, 'utf8'));
    }
    return KERNEL_IDENTITY;
}

// ─── Event Bus ────────────────────────────────────────────────────────────────

function on(event, handler) { _bus.on(event, handler); }
function once(event, handler) { _bus.once(event, handler); }
function emit(event, payload = {}) {
    _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() });
}

// ─── Banner ───────────────────────────────────────────────────────────────────

function _banner() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  SHEIKHA Runtime Kernel — نواة التشغيل السيادية                   ║');
    console.log('║  SHEIKHA Sovereign Cognitive Infrastructure                       ║');
    console.log('║  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ                                      ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║  تسلسل الإقلاع:                                                  ║');
    for (const step of _bootSteps) {
        console.log(`║    ${step.critical ? '●' : '○'} ${step.name.padEnd(40)}║`);
    }
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');
}

function _log(level, msg) {
    const tag = '[SHEIKHA-KERNEL]';
    if (level === 'warn')  console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    boot,
    shutdown,
    getState,
    registerBootStep,
    registerEngine,
    loadAllEngines,
    loadEngine,
    resolveLoadOrder,
    getEngine,
    health,
    status,
    runtimeIdentity,
    on,
    once,
    emit,
    KERNEL_STATES,
    KERNEL_IDENTITY,
};
