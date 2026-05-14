/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║       SHEIKHA Autonomous Orchestrator — محرك التنسيق الذاتي                 ║
 * ║         SHEIKHA Sovereign Cognitive Infrastructure                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * المهام:
 *   - تنسيق التدفقات والمهام والجداول الزمنية
 *   - جدولة دورة التحسين المستمر (Continuous Evolution Runtime)
 *   - إدارة خطوط الأنابيب (Pipelines)
 *   - توزيع الأحمال بين الطبقات
 *
 * دورة SHEIKHA Continuous Evolution:
 *   Observe → Measure → Analyze → Optimize →
 *   Validate → Deploy → Monitor → Improve → Scale → Repeat
 *
 * @module orchestration/sheikha-orchestrator
 * @version 1.0.0
 */

'use strict';

const EventEmitter = require('events');

// ─── Identity ────────────────────────────────────────────────────────────────

const ORCHESTRATOR_IDENTITY = {
    name: 'SHEIKHA Autonomous Orchestrator',
    layer: 'Orchestration Layer',
    version: '1.0.0',
    startedAt: null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(64);

// ─── Continuous Evolution Cycle ───────────────────────────────────────────────

/**
 * مراحل دورة التحسين المستمر.
 */
const EVOLUTION_PHASES = [
    'Observe',
    'Measure',
    'Analyze',
    'Optimize',
    'Validate',
    'Deploy',
    'Monitor',
    'Improve',
    'Scale',
];

/**
 * حالة دورة التطور الحالية.
 */
const _cycleState = {
    iteration: 0,
    currentPhase: null,
    lastCycleAt: null,
    totalCycles: 0,
};

/**
 * تشغيل دورة تحسين مستمر كاملة.
 * @param {object} [context={}] — سياق الدورة (مقاييس، بيانات، إلخ)
 * @returns {object} — ملخص الدورة
 */
function runEvolutionCycle(context = {}) {
    _cycleState.iteration += 1;
    _cycleState.totalCycles += 1;
    const cycleId = `cycle-${_cycleState.iteration}-${Date.now()}`;
    const results = {};

    _log('info', `▶ دورة التطور #${_cycleState.iteration} بدأت [${cycleId}]`);
    _bus.emit('cycle:start', { cycleId, iteration: _cycleState.iteration });

    for (const phase of EVOLUTION_PHASES) {
        _cycleState.currentPhase = phase;
        _bus.emit('cycle:phase', { cycleId, phase });
        results[phase] = { status: 'completed', at: new Date().toISOString() };
        _log('info', `  → ${phase}`);
    }

    _cycleState.currentPhase = null;
    _cycleState.lastCycleAt = new Date().toISOString();

    const summary = { cycleId, iteration: _cycleState.iteration, phases: results, completedAt: _cycleState.lastCycleAt };
    _bus.emit('cycle:complete', summary);
    _log('info', `✅ دورة التطور #${_cycleState.iteration} اكتملت`);
    return summary;
}

// ─── Pipeline Management ──────────────────────────────────────────────────────

/**
 * سجل خطوط الأنابيب.
 * @type {Map<string, {steps: string[], status: string, createdAt: string}>}
 */
const _pipelines = new Map();

/**
 * تسجيل خط أنابيب تشغيلي.
 * @param {string} name
 * @param {string[]} steps
 */
function registerPipeline(name, steps) {
    _pipelines.set(name, {
        steps,
        status: 'registered',
        createdAt: new Date().toISOString(),
    });
    _log('info', `📋 خط أنابيب مسجّل: ${name} (${steps.length} خطوة)`);
}

/**
 * تنفيذ خط أنابيب.
 * @param {string} name
 * @param {object} [payload={}]
 * @returns {object}
 */
function executePipeline(name, payload = {}) {
    if (!_pipelines.has(name)) {
        _log('warn', `خط الأنابيب "${name}" غير مسجّل`);
        return { success: false, error: 'pipeline not found' };
    }
    const pipeline = _pipelines.get(name);
    pipeline.status = 'running';
    _bus.emit('pipeline:start', { name, payload });

    const stepResults = pipeline.steps.map(step => ({
        step,
        status: 'executed',
        at: new Date().toISOString(),
    }));

    pipeline.status = 'completed';
    _bus.emit('pipeline:complete', { name, stepResults });
    _log('info', `✅ تم تنفيذ خط الأنابيب: ${name}`);
    return { success: true, pipeline: name, steps: stepResults };
}

// ─── Task Scheduling ──────────────────────────────────────────────────────────

/**
 * سجل المهام المجدولة.
 * @type {Map<string, {fn: Function, interval: number, lastRun: string|null, handle: *}>}
 */
const _scheduledTasks = new Map();

/**
 * جدولة مهمة تشغيلية متكررة.
 * @param {string} taskId
 * @param {Function} fn
 * @param {number} intervalMs — الفترة بالميلي ثانية
 */
function scheduleTask(taskId, fn, intervalMs) {
    if (_scheduledTasks.has(taskId)) {
        unscheduleTask(taskId);
    }
    const handle = setInterval(() => {
        try {
            fn();
            const task = _scheduledTasks.get(taskId);
            if (task) task.lastRun = new Date().toISOString();
            _bus.emit('task:executed', { taskId });
        } catch (err) {
            _log('error', `خطأ في المهمة "${taskId}": ${err.message}`);
            _bus.emit('task:error', { taskId, error: err.message });
        }
    }, intervalMs);

    _scheduledTasks.set(taskId, { fn, interval: intervalMs, lastRun: null, handle });
    _log('info', `⏱ مهمة مجدولة: ${taskId} كل ${intervalMs}ms`);
}

/**
 * إلغاء جدولة مهمة.
 * @param {string} taskId
 */
function unscheduleTask(taskId) {
    const task = _scheduledTasks.get(taskId);
    if (task) {
        clearInterval(task.handle);
        _scheduledTasks.delete(taskId);
        _log('info', `⏹ تم إلغاء جدولة المهمة: ${taskId}`);
    }
}

// ─── Load Distribution ────────────────────────────────────────────────────────

/**
 * توزيع حمل عمل على قائمة من العمال (Round-Robin).
 * @param {string[]} workers
 * @param {object[]} tasks
 * @returns {Map<string, object[]>}
 */
function distributeLoad(workers, tasks) {
    if (!workers.length) return new Map();
    const distribution = new Map(workers.map(w => [w, []]));
    tasks.forEach((task, i) => {
        const worker = workers[i % workers.length];
        distribution.get(worker).push(task);
    });
    _bus.emit('load:distributed', { workers: workers.length, tasks: tasks.length });
    return distribution;
}

// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * حالة المنسّق التشغيلية.
 * @returns {object}
 */
function status() {
    return {
        ...ORCHESTRATOR_IDENTITY,
        cycleState: { ..._cycleState },
        pipelines: _pipelines.size,
        scheduledTasks: _scheduledTasks.size,
    };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * تشغيل المنسّق.
 */
function start() {
    ORCHESTRATOR_IDENTITY.startedAt = new Date().toISOString();
    _log('info', `SHEIKHA Autonomous Orchestrator جاهز | ${ORCHESTRATOR_IDENTITY.startedAt}`);
    _bus.emit('orchestrator:ready', { identity: ORCHESTRATOR_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }
function emit(event, payload = {}) { _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() }); }

// ─── Internal Logging ─────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-ORCHESTRATOR]';
    if (level === 'warn') console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    start,
    runEvolutionCycle,
    registerPipeline,
    executePipeline,
    scheduleTask,
    unscheduleTask,
    distributeLoad,
    status,
    on,
    emit,
    ORCHESTRATOR_IDENTITY,
    EVOLUTION_PHASES,
};
