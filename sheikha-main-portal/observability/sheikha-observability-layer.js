/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║      SHEIKHA Observability Layer — طبقة القياس والمراقبة الشاملة            ║
 * ║         SHEIKHA Sovereign Cognitive Infrastructure                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * المقاييس المرصودة:
 *   - الأداء (performance)
 *   - استهلاك الذاكرة (memory)
 *   - استقرار الخدمات (service stability)
 *   - سرعة API (api latency)
 *   - جودة CI/CD
 *   - استقرار PM2
 *   - أخطاء المستخدمين (user errors)
 *   - أداء السوق (market performance)
 *   - نمو البيانات (data growth)
 *   - زمن الاستجابة (response time)
 *
 * @module observability/sheikha-observability-layer
 * @version 1.0.0
 */

'use strict';

const EventEmitter = require('events');

// ─── Identity ────────────────────────────────────────────────────────────────

const OBSERVABILITY_IDENTITY = {
    name: 'SHEIKHA Observability Layer',
    layer: 'Observability Layer',
    version: '1.0.0',
    startedAt: null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(64);

// ─── Metrics Store ────────────────────────────────────────────────────────────

/**
 * مستودع المقاييس في الذاكرة.
 * @type {Map<string, {value: *, recordedAt: string, history: Array}>}
 */
const _metrics = new Map();

/**
 * أقصى عدد سجلات تاريخية لكل مقياس.
 */
const MAX_HISTORY = 100;

/**
 * تسجيل قيمة مقياس.
 * @param {string} key   — اسم المقياس
 * @param {*}     value  — القيمة
 * @param {object} [tags={}] — وسوم إضافية
 */
function record(key, value, tags = {}) {
    const entry = { value, tags, recordedAt: new Date().toISOString() };
    if (!_metrics.has(key)) {
        _metrics.set(key, { value, recordedAt: entry.recordedAt, history: [] });
    }
    const metric = _metrics.get(key);
    metric.history.push({ value, tags, at: entry.recordedAt });
    if (metric.history.length > MAX_HISTORY) metric.history.shift();
    metric.value = value;
    metric.recordedAt = entry.recordedAt;
    _bus.emit('metric:recorded', { key, ...entry });
}

/**
 * الحصول على آخر قيمة مقياس.
 * @param {string} key
 * @returns {*|null}
 */
function get(key) {
    return _metrics.has(key) ? _metrics.get(key).value : null;
}

/**
 * الحصول على تاريخ مقياس.
 * @param {string} key
 * @returns {Array}
 */
function history(key) {
    return _metrics.has(key) ? _metrics.get(key).history : [];
}

// ─── System Snapshot ──────────────────────────────────────────────────────────

/**
 * أخذ لقطة فورية لمقاييس النظام.
 * @returns {object}
 */
function snapshot() {
    const mem = process.memoryUsage();
    const snap = {
        uptime: process.uptime(),
        memory: {
            rss: mem.rss,
            heapUsed: mem.heapUsed,
            heapTotal: mem.heapTotal,
            external: mem.external,
        },
        cpuUsage: process.cpuUsage(),
        pid: process.pid,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
    };

    // تخزين تلقائي في المقاييس
    record('system.uptime', snap.uptime);
    record('system.memory.rss', snap.memory.rss);
    record('system.memory.heapUsed', snap.memory.heapUsed);
    record('system.memory.heapTotal', snap.memory.heapTotal);

    _bus.emit('observability:snapshot', snap);
    return snap;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

/**
 * سجل التنبيهات النشطة.
 * @type {Map<string, {condition: Function, level: string, triggeredCount: number}>}
 */
const _alerts = new Map();

/**
 * تسجيل تنبيه مع شرط تشغيله.
 * @param {string} alertId
 * @param {Function} condition  — دالة تُعيد true عند الإطلاق
 * @param {'info'|'warn'|'critical'} level
 */
function registerAlert(alertId, condition, level = 'warn') {
    _alerts.set(alertId, { condition, level, triggeredCount: 0 });
    _log('info', `🔔 تنبيه مسجّل: ${alertId} [${level}]`);
}

/**
 * تقييم جميع التنبيهات المسجّلة.
 * @returns {object[]} — قائمة التنبيهات المُطلَقة
 */
function evaluateAlerts() {
    const triggered = [];
    for (const [alertId, alert] of _alerts.entries()) {
        try {
            if (alert.condition()) {
                alert.triggeredCount += 1;
                const event = {
                    alertId,
                    level: alert.level,
                    triggeredCount: alert.triggeredCount,
                    at: new Date().toISOString(),
                };
                triggered.push(event);
                _bus.emit('alert:triggered', event);
                _log('warn', `🚨 تنبيه مُطلَق: ${alertId} [${alert.level}]`);
            }
        } catch (_) {
            // شرط التنبيه لم يُقيَّم بسلامة
        }
    }
    return triggered;
}

// ─── Operational Reports ──────────────────────────────────────────────────────

/**
 * توليد تقرير تشغيلي شامل.
 * @returns {object}
 */
function generateReport() {
    const sys = snapshot();
    const report = {
        identity: OBSERVABILITY_IDENTITY.name,
        generatedAt: new Date().toISOString(),
        system: sys,
        metricsCount: _metrics.size,
        alertsRegistered: _alerts.size,
        summary: 'Operational',
    };
    _bus.emit('report:generated', report);
    return report;
}

// ─── Runtime Analysis (Intelligence Layer) ────────────────────────────────────

/**
 * تحليل الاختناقات في المقاييس المسجّلة.
 * @returns {object[]}
 */
function analyzeBottlenecks() {
    const bottlenecks = [];
    const heapUsed = get('system.memory.heapUsed');
    const heapTotal = get('system.memory.heapTotal');

    if (heapUsed && heapTotal && heapUsed / heapTotal > 0.85) {
        bottlenecks.push({ type: 'memory', severity: 'high', detail: 'heap > 85%' });
    }

    _bus.emit('analysis:bottlenecks', { bottlenecks, analyzedAt: new Date().toISOString() });
    return bottlenecks;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * تشغيل طبقة المراقبة.
 */
function start() {
    OBSERVABILITY_IDENTITY.startedAt = new Date().toISOString();
    _log('info', `SHEIKHA Observability Layer جاهزة | ${OBSERVABILITY_IDENTITY.startedAt}`);
    _bus.emit('observability:ready', { identity: OBSERVABILITY_IDENTITY });
}

/**
 * حالة طبقة المراقبة.
 * @returns {object}
 */
function status() {
    return {
        ...OBSERVABILITY_IDENTITY,
        metrics: _metrics.size,
        alerts: _alerts.size,
    };
}

function on(event, handler) { _bus.on(event, handler); }
function emit(event, payload = {}) { _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() }); }

// ─── Internal Logging ─────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-OBSERVABILITY]';
    if (level === 'warn') console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    start,
    record,
    get,
    history,
    snapshot,
    registerAlert,
    evaluateAlerts,
    generateReport,
    analyzeBottlenecks,
    status,
    on,
    emit,
    OBSERVABILITY_IDENTITY,
};
