/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA Agent Continuity Watchdog — وكيل المراقبة والاستمرارية            ║
 * ║   مراقبة دورية + سجل أخطاء + دورة تشغيل تلقائية للوكلاء والشبكة          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿إِنَّ اللَّهَ لَا يَغْفُلُ عَمَّا تَعْمَلُونَ﴾ — البقرة: ٨٥
 * «أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ» — البخاري
 *
 * يُوفِّر هذا الوكيل:
 *   ① مراقبة دورية لحالة جميع الوكلاء والشبكة العصبية
 *   ② سجل أخطاء منظَّم مع مستويات الخطورة
 *   ③ قياسات سلامة وأداء
 *   ④ دورة تشغيل تلقائية تضمن بقاء الوكلاء نشطين
 *   ⑤ تنبيهات فورية عند الانحراف عن معايير الجاهزية
 *
 * @module lib/sheikha-agent-continuity-watchdog
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

const EventEmitter = require('events');

// ─── ثوابت ──────────────────────────────────────────────────────────────────

const WATCHDOG_VERSION = '1.0.0';
const WATCHDOG_ID      = 'SHEIKHA-AGENT-CONTINUITY-WATCHDOG';

/** @enum {string} */
const SEVERITY = Object.freeze({
    INFO:     'info',
    WARN:     'warn',
    ERROR:    'error',
    CRITICAL: 'critical',
});

/** معايير الجاهزية الافتراضية */
const DEFAULT_THRESHOLDS = Object.freeze({
    minReadyAgentPct:  0.80,   // 80% من الوكلاء يجب أن تكون Ready
    minNeuralCells:    19,     // الحد الأدنى للخلايا العصبية النشطة
    maxErrorsPerCycle: 5,      // الحد الأقصى للأخطاء قبل الإنذار
    maxLogEntries:     1000,   // الحد الأقصى لسجل الأخطاء (تدوير)
    defaultIntervalMs: 60000,  // فترة المراقبة الافتراضية (60 ثانية)
    minIntervalMs:     5000,   // الحد الأدنى لفترة المراقبة (5 ثوانٍ)
});

// ─── حالة الـ Watchdog ───────────────────────────────────────────────────────

const _bus     = new EventEmitter();
_bus.setMaxListeners(64);

const _log     = [];           // سجل الأحداث الداخلي
let _timer     = null;         // المؤقت الدوري
let _running   = false;
let _startedAt = null;
let _cycleCount = 0;
let _lastCycleAt = null;
let _thresholds = { ...DEFAULT_THRESHOLDS };

// مقاييس التشغيل المتراكمة
const _metrics = {
    totalChecks:    0,
    totalErrors:    0,
    totalWarnings:  0,
    totalRecoveries:0,
    criticalAlerts: 0,
};

// ─── وحدات الوكلاء المُراقَبة ───────────────────────────────────────────────

let _agentLayer   = null;
let _neuralRoot   = null;

function _loadDependencies() {
    // تحميل طبقة الوكلاء
    if (!_agentLayer) {
        try {
            _agentLayer = require('./sheikha-operational-agents-layer');
        } catch (e) {
            _entry(SEVERITY.WARN, 'watchdog-load', `فشل تحميل طبقة الوكلاء: ${e.message}`);
        }
    }

    // تحميل المُفعِّل المركزي للشبكة العصبية
    if (!_neuralRoot) {
        try {
            _neuralRoot = require('../intelligence/sheikha-neural-root-activator');
        } catch (e) {
            _entry(SEVERITY.WARN, 'watchdog-load', `فشل تحميل الشبكة العصبية: ${e.message}`);
        }
    }
}

// ─── إدخالات السجل ──────────────────────────────────────────────────────────

/**
 * إضافة إدخال لسجل المراقبة.
 * @param {string} severity — من SEVERITY
 * @param {string} source   — مصدر الحدث
 * @param {string} message  — الرسالة
 * @param {object} [data]   — بيانات إضافية
 */
function _entry(severity, source, message, data = {}) {
    const entry = {
        id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        severity,
        source,
        message,
        data,
        timestamp: new Date().toISOString(),
    };

    _log.push(entry);

    // تدوير السجل عند الامتلاء
    if (_log.length > _thresholds.maxLogEntries) {
        _log.splice(0, _log.length - _thresholds.maxLogEntries);
    }

    // تحديث المقاييس
    if (severity === SEVERITY.ERROR || severity === SEVERITY.CRITICAL) _metrics.totalErrors++;
    if (severity === SEVERITY.WARN)   _metrics.totalWarnings++;
    if (severity === SEVERITY.CRITICAL) _metrics.criticalAlerts++;

    // إصدار حدث
    _bus.emit(`watchdog:${severity}`, entry);

    // الطباعة للـ console حسب الخطورة
    const tag = `[SHEIKHA-WATCHDOG]`;
    if (severity === SEVERITY.CRITICAL) console.error(`${tag} 🚨 ${message}`);
    else if (severity === SEVERITY.ERROR)  console.error(`${tag} ❌ ${message}`);
    else if (severity === SEVERITY.WARN)   console.warn(`${tag}  ⚠️  ${message}`);
    else if (severity === SEVERITY.INFO)   console.log(`${tag}  ℹ️  ${message}`);
}

// ─── دورة المراقبة ──────────────────────────────────────────────────────────

/**
 * تشغيل دورة مراقبة واحدة.
 * @returns {object} — نتيجة الدورة
 */
function runCycle() {
    _cycleCount++;
    _lastCycleAt = new Date().toISOString();
    _metrics.totalChecks++;

    const cycleResult = {
        cycleId:        _cycleCount,
        timestamp:      _lastCycleAt,
        checks:         {},
        alerts:         [],
        healthy:        true,
    };

    _loadDependencies();

    // ─── فحص ① طبقة الوكلاء ─────────────────────────────────────────────
    if (_agentLayer) {
        try {
            const board = _agentLayer.readinessBoard();
            const readyPct = board.counts['Ready'] / Math.max(board.agents.length, 1);
            const healthy  = readyPct >= _thresholds.minReadyAgentPct;

            cycleResult.checks.agentLayer = {
                ok: healthy,
                readyAgents:  board.counts['Ready']    || 0,
                degraded:     board.counts['Degraded'] || 0,
                standby:      board.counts['Standby']  || 0,
                down:         board.counts['Down']     || 0,
                readinessPct: Number((readyPct * 100).toFixed(1)),
                overallReadiness: board.overallReadiness,
            };

            if (!healthy) {
                const alert = {
                    type:    'agent-layer-degraded',
                    message: `طبقة الوكلاء: فقط ${(readyPct * 100).toFixed(1)}% جاهزة (الحد الأدنى: ${_thresholds.minReadyAgentPct * 100}%)`,
                    severity: SEVERITY.WARN,
                };
                cycleResult.alerts.push(alert);
                cycleResult.healthy = false;
                _entry(SEVERITY.WARN, 'agent-layer', alert.message, cycleResult.checks.agentLayer);
            }
        } catch (e) {
            cycleResult.checks.agentLayer = { ok: false, error: e.message };
            cycleResult.healthy = false;
            _entry(SEVERITY.ERROR, 'agent-layer', `فشل فحص طبقة الوكلاء: ${e.message}`);
        }
    } else {
        cycleResult.checks.agentLayer = { ok: false, available: false };
        _entry(SEVERITY.WARN, 'agent-layer', 'طبقة الوكلاء غير متاحة للفحص');
    }

    // ─── فحص ② الشبكة العصبية الجذرية ───────────────────────────────────
    if (_neuralRoot) {
        try {
            const h = _neuralRoot.health();
            const cellsOk = h.totalCells >= _thresholds.minNeuralCells;
            const readyOk = h.ready === true;

            cycleResult.checks.neuralRoot = {
                ok:              cellsOk && readyOk,
                ready:           h.ready,
                totalCells:      h.totalCells,
                networksActive:  h.networksActive,
                startedAt:       h.startedAt,
            };

            if (!readyOk) {
                const alert = { type: 'neural-root-not-ready', message: 'الشبكة العصبية الجذرية غير جاهزة', severity: SEVERITY.CRITICAL };
                cycleResult.alerts.push(alert);
                cycleResult.healthy = false;
                _entry(SEVERITY.CRITICAL, 'neural-root', alert.message);
            } else if (!cellsOk) {
                const alert = { type: 'neural-cells-low', message: `خلايا عصبية منخفضة: ${h.totalCells} < ${_thresholds.minNeuralCells}`, severity: SEVERITY.WARN };
                cycleResult.alerts.push(alert);
                _entry(SEVERITY.WARN, 'neural-root', alert.message, { totalCells: h.totalCells });
            }
        } catch (e) {
            cycleResult.checks.neuralRoot = { ok: false, error: e.message };
            cycleResult.healthy = false;
            _entry(SEVERITY.ERROR, 'neural-root', `فشل فحص الشبكة العصبية: ${e.message}`);
        }
    } else {
        cycleResult.checks.neuralRoot = { ok: false, available: false };
        _entry(SEVERITY.WARN, 'neural-root', 'الشبكة العصبية الجذرية غير متاحة للفحص');
    }

    // ─── فحص ③ ذاكرة العملية ─────────────────────────────────────────────
    try {
        const mem = process.memoryUsage();
        const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
        const heapPct = heapUsedMB / Math.max(heapTotalMB, 1);

        cycleResult.checks.memory = {
            ok:           heapPct < 0.90,
            heapUsedMB,
            heapTotalMB,
            rssМB:        Math.round(mem.rss / 1024 / 1024),
            usagePct:     Number((heapPct * 100).toFixed(1)),
        };

        if (heapPct >= 0.90) {
            const alert = { type: 'high-memory', message: `استهلاك ذاكرة مرتفع: ${(heapPct * 100).toFixed(1)}%`, severity: SEVERITY.WARN };
            cycleResult.alerts.push(alert);
            _entry(SEVERITY.WARN, 'memory', alert.message, cycleResult.checks.memory);
        }
    } catch (e) {
        cycleResult.checks.memory = { ok: true }; // غير حاسم
    }

    // ─── فحص ④ uptime ─────────────────────────────────────────────────────
    try {
        const uptimeSec = Math.round(process.uptime());
        cycleResult.checks.uptime = {
            ok:        true,
            uptimeSec,
            uptimeMin: Math.round(uptimeSec / 60),
            uptimeHr:  Number((uptimeSec / 3600).toFixed(2)),
        };
    } catch (e) {
        cycleResult.checks.uptime = { ok: true };
    }

    // ─── تقييم نهائي للدورة ─────────────────────────────────────────────
    if (cycleResult.alerts.length > _thresholds.maxErrorsPerCycle) {
        _entry(SEVERITY.CRITICAL, 'cycle', `تجاوز حد الأخطاء في الدورة: ${cycleResult.alerts.length} تنبيه`);
        cycleResult.healthy = false;
    }

    _bus.emit('watchdog:cycle', cycleResult);
    return cycleResult;
}

// ─── التشغيل الدوري ─────────────────────────────────────────────────────────

/**
 * بدء دورة المراقبة الدورية.
 * @param {object} [options]
 * @param {number} [options.intervalMs] — الفترة بالميلي ثانية (افتراضي: 60000)
 * @param {object} [options.thresholds] — معايير مخصصة
 * @returns {{ success: boolean, intervalMs: number }}
 */
function start(options = {}) {
    if (_running) {
        _entry(SEVERITY.INFO, 'watchdog', 'الـ Watchdog يعمل بالفعل');
        return { success: true, intervalMs: _thresholds.defaultIntervalMs, alreadyRunning: true };
    }

    const intervalMs = Math.max(
        options.intervalMs || _thresholds.defaultIntervalMs,
        _thresholds.minIntervalMs
    );

    if (options.thresholds) {
        Object.assign(_thresholds, options.thresholds);
    }

    _startedAt = new Date().toISOString();
    _running   = true;

    _entry(SEVERITY.INFO, 'watchdog', `بدء المراقبة الدورية — كل ${intervalMs / 1000}s`);

    // دورة فورية عند البدء
    try { runCycle(); } catch (e) {
        _entry(SEVERITY.WARN, 'watchdog', `فشل الدورة الأولى: ${e.message}`);
    }

    // ضبط المؤقت الدوري
    _timer = setInterval(() => {
        try {
            runCycle();
        } catch (e) {
            _entry(SEVERITY.ERROR, 'watchdog-timer', `خطأ في الدورة الدورية: ${e.message}`);
        }
    }, intervalMs);

    // تجنّب منع إغلاق العملية إذا لم تكن هناك أنشطة أخرى
    if (_timer.unref) _timer.unref();

    _bus.emit('watchdog:started', { intervalMs, startedAt: _startedAt });
    return { success: true, intervalMs };
}

/**
 * إيقاف المراقبة الدورية.
 */
function stop() {
    if (!_running) return { success: false, message: 'الـ Watchdog غير مُشغَّل' };

    if (_timer) {
        clearInterval(_timer);
        _timer = null;
    }
    _running = false;
    _entry(SEVERITY.INFO, 'watchdog', `إيقاف المراقبة — ${_cycleCount} دورة منجزة`);
    _bus.emit('watchdog:stopped', { cycleCount: _cycleCount });
    return { success: true };
}

// ─── حالة الـ Watchdog ───────────────────────────────────────────────────────

/**
 * حالة الـ Watchdog الكاملة.
 */
function status() {
    return {
        id:             WATCHDOG_ID,
        version:        WATCHDOG_VERSION,
        running:        _running,
        startedAt:      _startedAt,
        cycleCount:     _cycleCount,
        lastCycleAt:    _lastCycleAt,
        thresholds:     { ..._thresholds },
        metrics:        { ..._metrics },
        recentLogs:     _log.slice(-20),
        statusAt:       new Date().toISOString(),
    };
}

/**
 * آخر N إدخالات في السجل.
 * @param {number} [n=50]
 */
function getLogs(n = 50) {
    return _log.slice(-Math.min(n, _log.length));
}

/**
 * سجل الأخطاء والإنذارات فقط.
 * @param {number} [n=20]
 */
function getAlerts(n = 20) {
    return _log
        .filter(e => e.severity === SEVERITY.WARN || e.severity === SEVERITY.ERROR || e.severity === SEVERITY.CRITICAL)
        .slice(-Math.min(n, 100));
}

/**
 * مسح السجل (للاختبار والإدارة).
 */
function clearLogs() {
    _log.length = 0;
    return { cleared: true, timestamp: new Date().toISOString() };
}

// ─── Event Bus ───────────────────────────────────────────────────────────────

function on(event, handler) { _bus.on(event, handler); }
function off(event, handler) { _bus.off(event, handler); }

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
    WATCHDOG_VERSION,
    WATCHDOG_ID,
    SEVERITY,
    DEFAULT_THRESHOLDS,
    start,
    stop,
    runCycle,
    status,
    getLogs,
    getAlerts,
    clearLogs,
    on,
    off,
};
