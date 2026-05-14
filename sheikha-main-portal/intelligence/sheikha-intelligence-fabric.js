/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║    SHEIKHA Operational Intelligence Fabric — طبقة الذكاء التشغيلي           ║
 * ║      SHEIKHA Sovereign Cognitive Infrastructure                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * هذه الطبقة مسؤولة عن:
 *   - runtime analysis      — تحليل بيانات التشغيل
 *   - predictive maintenance — الصيانة التنبؤية
 *   - orchestration optim.  — تحسين التنسيق
 *   - infrastructure aware. — وعي البنية التحتية
 *   - workload balancing    — توزيع الأحمال
 *   - adaptive scaling      — التوسع التكيّفي
 *   - operational observ.   — المراقبة التشغيلية
 *   - anomaly detection     — كشف الحالات الشاذة
 *
 * @module intelligence/sheikha-intelligence-fabric
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

const EventEmitter = require('events');

// ─── Identity ────────────────────────────────────────────────────────────────

const INTELLIGENCE_IDENTITY = {
    name: 'SHEIKHA Operational Intelligence Fabric',
    layer: 'Intelligence Layer',
    version: '1.0.0',
    startedAt: null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(64);

// ─── Metrics Aggregator ───────────────────────────────────────────────────────

/**
 * نافذة البيانات للتحليل (آخر N نقطة).
 * @type {Map<string, number[]>}
 */
const _windows = new Map();

const WINDOW_SIZE = 60; // آخر 60 نقطة

/**
 * إضافة نقطة بيانات لنافذة التحليل.
 * @param {string} metric
 * @param {number} value
 */
function pushDataPoint(metric, value) {
    if (!_windows.has(metric)) _windows.set(metric, []);
    const win = _windows.get(metric);
    win.push(value);
    if (win.length > WINDOW_SIZE) win.shift();
}

// ─── Statistical Analysis ─────────────────────────────────────────────────────

/**
 * حساب المتوسط.
 * @param {number[]} values
 * @returns {number}
 */
function _mean(values) {
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * حساب الانحراف المعياري.
 * @param {number[]} values
 * @returns {number}
 */
function _stdDev(values) {
    if (values.length < 2) return 0;
    const avg = _mean(values);
    const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
    return Math.sqrt(variance);
}

/**
 * تحليل مقياس معيّن.
 * @param {string} metric
 * @returns {object|null}
 */
function analyzeMetric(metric) {
    const win = _windows.get(metric);
    if (!win || win.length < 2) return null;

    const mean    = _mean(win);
    const stdDev  = _stdDev(win);
    const min     = Math.min(...win);
    const max     = Math.max(...win);
    const last    = win[win.length - 1];
    const trend   = win.length >= 2 ? (win[win.length - 1] - win[0]) / win.length : 0;

    return { metric, mean, stdDev, min, max, last, trend, samples: win.length };
}

// ─── Anomaly Detection ────────────────────────────────────────────────────────

/**
 * كشف الشذوذات في مقياس ما (Z-score method).
 * @param {string} metric
 * @param {number} [zThreshold=2.5]
 * @returns {{anomaly: boolean, score: number, detail: string}}
 */
function detectAnomaly(metric, zThreshold = 2.5) {
    const analysis = analyzeMetric(metric);
    if (!analysis) return { anomaly: false, score: 0, detail: 'insufficient data' };

    const { mean, stdDev, last } = analysis;
    if (stdDev === 0) return { anomaly: false, score: 0, detail: 'no variance' };

    const zScore = Math.abs((last - mean) / stdDev);
    const anomaly = zScore > zThreshold;

    if (anomaly) {
        _bus.emit('anomaly:detected', { metric, zScore, last, mean, stdDev });
        _log('warn', `شذوذ مكتشف في "${metric}": Z=${zScore.toFixed(2)}, آخر قيمة=${last}`);
    }

    return {
        anomaly,
        score: zScore,
        detail: anomaly ? `value ${last} deviates ${zScore.toFixed(2)}σ from mean ${mean.toFixed(2)}` : 'normal',
    };
}

// ─── Workload Balancing ───────────────────────────────────────────────────────

/**
 * خوارزميات توزيع الأحمال المدعومة.
 */
const BALANCING_STRATEGIES = {
    ROUND_ROBIN:    'round-robin',
    LEAST_LOADED:   'least-loaded',
    WEIGHTED:       'weighted',
    ADAPTIVE:       'adaptive',
};

/**
 * حالة موزّع الأحمال.
 */
const _balancerState = {
    strategy: BALANCING_STRATEGIES.ADAPTIVE,
    counters: new Map(), // workerId → request count
};

/**
 * اختيار عامل لمعالجة طلب (توزيع ذكي).
 * @param {string[]} workers
 * @param {object} [context={}] — سياق الطلب (حجم، أولوية، إلخ)
 * @returns {string|null}
 */
function selectWorker(workers, context = {}) {
    if (!workers.length) return null;

    // إعداد العدادات للعمال الجدد
    for (const w of workers) {
        if (!_balancerState.counters.has(w)) _balancerState.counters.set(w, 0);
    }

    let selected;

    if (_balancerState.strategy === BALANCING_STRATEGIES.LEAST_LOADED ||
        _balancerState.strategy === BALANCING_STRATEGIES.ADAPTIVE) {
        // اختيار العامل الأقل حملاً
        selected = workers.reduce((best, w) => {
            return _balancerState.counters.get(w) < _balancerState.counters.get(best) ? w : best;
        });
    } else {
        // Round Robin افتراضي
        const counts = workers.map(w => _balancerState.counters.get(w) || 0);
        const minIdx = counts.indexOf(Math.min(...counts));
        selected = workers[minIdx];
    }

    _balancerState.counters.set(selected, (_balancerState.counters.get(selected) || 0) + 1);
    _bus.emit('workload:assigned', { worker: selected, strategy: _balancerState.strategy });
    return selected;
}

/**
 * تعيين استراتيجية التوزيع.
 * @param {string} strategy
 */
function setBalancingStrategy(strategy) {
    if (!Object.values(BALANCING_STRATEGIES).includes(strategy)) {
        _log('warn', `استراتيجية غير معروفة: ${strategy}`);
        return;
    }
    _balancerState.strategy = strategy;
    _bus.emit('balancer:strategy', { strategy });
}

// ─── Adaptive Scaling ─────────────────────────────────────────────────────────

/**
 * قرار التوسع التكيّفي بناءً على مقاييس النظام.
 * @param {object} metrics
 * @param {{minInstances?: number, maxInstances?: number, targetUtilization?: number}} [policy={}]
 * @returns {{action: 'scale-up'|'scale-down'|'maintain', reason: string}}
 */
function adaptiveScalingDecision(metrics, policy = {}) {
    const {
        minInstances = 1,
        maxInstances = 10,
        targetUtilization = 0.7,
    } = policy;

    const cpuUtil = metrics.cpuUtilization || 0;
    const memUtil = metrics.memoryUtilization || 0;
    const avgUtil = (cpuUtil + memUtil) / 2;

    let action, reason;

    if (avgUtil > targetUtilization * 1.2) {
        action = 'scale-up';
        reason = `utilization ${(avgUtil * 100).toFixed(1)}% exceeds target ${(targetUtilization * 120).toFixed(0)}%`;
    } else if (avgUtil < targetUtilization * 0.5) {
        action = 'scale-down';
        reason = `utilization ${(avgUtil * 100).toFixed(1)}% well below target`;
    } else {
        action = 'maintain';
        reason = `utilization ${(avgUtil * 100).toFixed(1)}% within target range`;
    }

    const decision = { action, reason, metrics, policy: { minInstances, maxInstances, targetUtilization } };
    _bus.emit('scaling:decision', decision);
    return decision;
}

// ─── Infrastructure Awareness ─────────────────────────────────────────────────

/**
 * تقييم جاهزية البنية التحتية.
 * @returns {object}
 */
function infrastructureAwareness() {
    const mem = process.memoryUsage();
    const heapUtilization = mem.heapUsed / mem.heapTotal;
    const uptime = process.uptime();

    const awareness = {
        runtime: {
            uptime,
            heapUtilization: parseFloat(heapUtilization.toFixed(4)),
            heapUsedMB: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(2)),
            heapTotalMB: parseFloat((mem.heapTotal / 1024 / 1024).toFixed(2)),
            rssMB: parseFloat((mem.rss / 1024 / 1024).toFixed(2)),
        },
        anomalies: {},
        health: heapUtilization < 0.8 ? 'healthy' : 'under-pressure',
        assessedAt: new Date().toISOString(),
    };

    // تحديث نافذة البيانات
    pushDataPoint('system.heapUtilization', heapUtilization);
    const heapAnomaly = detectAnomaly('system.heapUtilization');
    awareness.anomalies['heap'] = heapAnomaly;

    _bus.emit('infrastructure:awareness', awareness);
    return awareness;
}

// ─── Predictive Maintenance ───────────────────────────────────────────────────

/**
 * تقييم خطر الفشل للعقد التشغيلية.
 * @param {string} nodeId
 * @param {object} signals — إشارات الحالة (error rate, latency, etc.)
 * @returns {{riskLevel: 'low'|'medium'|'high'|'critical', recommendation: string}}
 */
function predictMaintenanceRisk(nodeId, signals) {
    const { errorRate = 0, latencyMs = 0, restartCount = 0, memLeakScore = 0 } = signals;

    let score = 0;
    if (errorRate > 0.05) score += 3;      // > 5% error rate
    else if (errorRate > 0.01) score += 1;
    if (latencyMs > 2000) score += 3;      // > 2s latency
    else if (latencyMs > 500) score += 1;
    if (restartCount > 5) score += 4;
    else if (restartCount > 1) score += 2;
    if (memLeakScore > 0.5) score += 3;

    let riskLevel, recommendation;
    if (score >= 8) {
        riskLevel = 'critical';
        recommendation = 'إيقاف فوري وإعادة تشغيل مع تحليل الجذر';
    } else if (score >= 5) {
        riskLevel = 'high';
        recommendation = 'جدولة صيانة خلال الساعة القادمة';
    } else if (score >= 2) {
        riskLevel = 'medium';
        recommendation = 'مراقبة مكثفة وجدولة صيانة وقائية';
    } else {
        riskLevel = 'low';
        recommendation = 'في حالة جيدة — مراقبة دورية';
    }

    const result = { nodeId, riskLevel, score, recommendation, signals };
    _bus.emit('maintenance:prediction', result);
    if (riskLevel === 'critical' || riskLevel === 'high') {
        _log('warn', `⚠️ خطر صيانة ${riskLevel}: ${nodeId}`);
    }
    return result;
}

// ─── Optimization Reports ─────────────────────────────────────────────────────

/**
 * تقرير تحسين التنسيق.
 * @returns {object}
 */
function orchestrationOptimizationReport() {
    const balancerStats = [..._balancerState.counters.entries()].map(([w, c]) => ({
        worker: w, requests: c,
    }));

    const report = {
        identity: INTELLIGENCE_IDENTITY.name,
        strategy: _balancerState.strategy,
        workers: balancerStats,
        metricsTracked: _windows.size,
        infrastructure: infrastructureAwareness(),
        generatedAt: new Date().toISOString(),
    };

    _bus.emit('optimization:report', report);
    return report;
}

// ─── Status ───────────────────────────────────────────────────────────────────

function status() {
    return {
        ...INTELLIGENCE_IDENTITY,
        metricsTracked: _windows.size,
        balancingStrategy: _balancerState.strategy,
        workersTracked: _balancerState.counters.size,
    };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

function start() {
    INTELLIGENCE_IDENTITY.startedAt = new Date().toISOString();
    _log('info', `SHEIKHA Operational Intelligence Fabric جاهزة | ${INTELLIGENCE_IDENTITY.startedAt}`);
    _bus.emit('intelligence:ready', { identity: INTELLIGENCE_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }
function emit(event, payload = {}) {
    _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() });
}

// ─── Internal Logging ─────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-INTELLIGENCE]';
    if (level === 'warn')  console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    start,
    pushDataPoint,
    analyzeMetric,
    detectAnomaly,
    selectWorker,
    setBalancingStrategy,
    adaptiveScalingDecision,
    infrastructureAwareness,
    predictMaintenanceRisk,
    orchestrationOptimizationReport,
    status,
    on,
    emit,
    INTELLIGENCE_IDENTITY,
    BALANCING_STRATEGIES,
};
