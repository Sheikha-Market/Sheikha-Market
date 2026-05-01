/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                     SHEIKHA IMPACT ENGINE                                   ║
 * ║            محرك القياس والأثر — مؤشرات الأداء والتتبع والتقارير              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ما يُقاس:
 *  - الأداء (Performance)
 *  - التحويل (Conversions)
 *  - صحة الخدمات (Health)
 *  - نجاح الأحداث (Events)
 *  - أثر الأدوات والتعديلات
 *
 * مؤشرات شيخة:
 *  Health | Speed | Conversions | Leads | Purchases
 *  User completion | Operational stability | Integration success
 */

'use strict';

// ─── Metric Types ────────────────────────────────────────────────────────────

const METRIC_TYPES = {
    COUNTER:   'counter',
    GAUGE:     'gauge',
    HISTOGRAM: 'histogram',
    RATE:      'rate',
};

// ─── Metric Store ─────────────────────────────────────────────────────────────

const _counters   = new Map(); // name → number
const _gauges     = new Map(); // name → number
const _histograms = new Map(); // name → number[]
const _events     = [];        // event log

// ─── Core KPIs ────────────────────────────────────────────────────────────────

const KPI_KEYS = [
    'health_score',
    'response_time_ms',
    'conversions',
    'leads',
    'purchases',
    'user_completion_rate',
    'operational_stability',
    'integration_success_rate',
    'active_users',
    'deals_closed',
];

// ─── Counter API ──────────────────────────────────────────────────────────────

/**
 * زيادة عدّاد
 * @param {string} name
 * @param {number} by
 */
function increment(name, by = 1) {
    _counters.set(name, (_counters.get(name) || 0) + by);
}

/**
 * قراءة عدّاد
 * @param {string} name
 */
function getCounter(name) {
    return _counters.get(name) || 0;
}

// ─── Gauge API ────────────────────────────────────────────────────────────────

/**
 * تحديث مقياس فوري
 * @param {string} name
 * @param {number} value
 */
function setGauge(name, value) {
    _gauges.set(name, value);
}

/**
 * قراءة مقياس
 * @param {string} name
 */
function getGauge(name) {
    return _gauges.get(name) ?? null;
}

// ─── Histogram API ────────────────────────────────────────────────────────────

/**
 * تسجيل قيمة في histogram
 * @param {string} name
 * @param {number} value
 */
function observe(name, value) {
    if (!_histograms.has(name)) _histograms.set(name, []);
    const arr = _histograms.get(name);
    arr.push(value);
    if (arr.length > 1000) arr.shift(); // نافذة متحركة
}

/**
 * إحصاءات histogram
 * @param {string} name
 */
function histogramStats(name) {
    const arr = _histograms.get(name) || [];
    if (!arr.length) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const sum    = arr.reduce((s, v) => s + v, 0);
    return {
        count: arr.length,
        min:   sorted[0],
        max:   sorted[sorted.length - 1],
        avg:   (sum / arr.length).toFixed(2),
        p50:   sorted[Math.floor(arr.length * 0.5)],
        p95:   sorted[Math.floor(arr.length * 0.95)],
        p99:   sorted[Math.floor(arr.length * 0.99)],
    };
}

// ─── Event Tracker ────────────────────────────────────────────────────────────

/**
 * تسجيل حدث قابل للقياس
 * @param {string} name
 * @param {object} props
 */
function trackEvent(name, props = {}) {
    const event = {
        name,
        props,
        timestamp: new Date().toISOString(),
    };
    _events.push(event);
    if (_events.length > 2000) _events.shift();
    increment(`event:${name}`);
}

/**
 * أحداث مصفّاة
 * @param {string} name
 * @param {number} limit
 */
function getEvents(name, limit = 50) {
    const filtered = name ? _events.filter(e => e.name === name) : _events;
    return filtered.slice(-limit);
}

// ─── Performance Timer ────────────────────────────────────────────────────────

/**
 * قياس زمن تنفيذ دالة async
 * @param {string} label
 * @param {Function} fn
 */
async function time(label, fn) {
    const start = Date.now();
    try {
        const result = await fn();
        const ms = Date.now() - start;
        observe(label, ms);
        return result;
    } catch (err) {
        const ms = Date.now() - start;
        observe(`${label}:error`, ms);
        throw err;
    }
}

// ─── KPI Snapshot ─────────────────────────────────────────────────────────────

/**
 * لقطة المؤشرات الرئيسية
 */
function kpiSnapshot() {
    const snap = {};
    KPI_KEYS.forEach(k => {
        snap[k] = _gauges.get(k) ?? _counters.get(k) ?? 0;
    });
    return {
        snapshot:   snap,
        counters:   Object.fromEntries(_counters.entries()),
        gauges:     Object.fromEntries(_gauges.entries()),
        eventCount: _events.length,
        capturedAt: new Date().toISOString(),
    };
}

// ─── Impact Report ────────────────────────────────────────────────────────────

/**
 * تقرير الأثر الشامل
 */
function impactReport() {
    const kpis = kpiSnapshot();
    const report = {
        title: 'Sheikha Impact Report',
        ...kpis,
        histograms: {},
        recentEvents: getEvents(null, 20),
    };
    _histograms.forEach((_, name) => {
        report.histograms[name] = histogramStats(name);
    });
    return report;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    console.log('[IMPACT-ENGINE] 📊 تشغيل محرك القياس...');

    // مؤشرات أولية
    setGauge('health_score', 100);
    setGauge('operational_stability', 100);
    setGauge('integration_success_rate', 100);

    trackEvent('system:boot', { timestamp: new Date().toISOString() });
    console.log('[IMPACT-ENGINE] ✅ جاهز');
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    METRIC_TYPES,
    KPI_KEYS,
    init,
    increment,
    getCounter,
    setGauge,
    getGauge,
    observe,
    histogramStats,
    trackEvent,
    getEvents,
    time,
    kpiSnapshot,
    impactReport,
};
