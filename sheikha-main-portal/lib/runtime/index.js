/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                     lib/runtime/index.js                                    ║
 * ║              طبقة التشغيل — دورة حياة التطبيق والإشارات والجداول            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الوظائف:
 *  - إدارة دورة حياة العملية
 *  - جدولة المهام (Cron-like)
 *  - معالجة الإشارات (SIGTERM, SIGINT)
 *  - تسجيل الأخطاء غير المُعالَجة
 *  - Graceful Shutdown
 */

'use strict';

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────

const _hooks = {
    startup:  [],
    shutdown: [],
    error:    [],
};

/**
 * تسجيل خطّاف عند البدء
 * @param {Function} fn  async fn()
 */
function onStartup(fn) {
    _hooks.startup.push(fn);
}

/**
 * تسجيل خطّاف عند الإيقاف
 * @param {Function} fn  async fn()
 */
function onShutdown(fn) {
    _hooks.shutdown.push(fn);
}

/**
 * تسجيل معالج خطأ عام
 * @param {Function} fn  (err) => {}
 */
function onError(fn) {
    _hooks.error.push(fn);
}

// ─── Startup ──────────────────────────────────────────────────────────────────

async function runStartup() {
    console.log('[RUNTIME] ▶️  تنفيذ خطّافات البدء...');
    for (const fn of _hooks.startup) {
        try {
            await fn();
        } catch (err) {
            console.error('[RUNTIME] ❌ خطأ في خطّاف البدء:', err.message);
        }
    }
    console.log('[RUNTIME] ✅ خطّافات البدء اكتملت');
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

let _shuttingDown = false;

async function shutdown(signal = 'unknown') {
    if (_shuttingDown) return;
    _shuttingDown = true;
    console.log(`[RUNTIME] ⏹  إيقاف تدريجي — الإشارة: ${signal}`);

    for (const fn of _hooks.shutdown) {
        try {
            await fn();
        } catch (err) {
            console.error('[RUNTIME] ⚠️  خطأ في خطّاف الإيقاف:', err.message);
        }
    }

    console.log('[RUNTIME] 👋 تمّ الإيقاف');
    process.exit(0);
}

// ─── Signal Handlers ──────────────────────────────────────────────────────────

/**
 * تسجيل معالجات الإشارات (يُستدعى مرة واحدة عند بدء التطبيق)
 */
function registerSignalHandlers() {
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    process.on('uncaughtException', (err) => {
        console.error('[RUNTIME] ❌ خطأ غير مُعالَج:', err.message);
        _hooks.error.forEach(fn => { try { fn(err); } catch (_) {} });
    });

    process.on('unhandledRejection', (reason) => {
        const err = reason instanceof Error ? reason : new Error(String(reason));
        console.error('[RUNTIME] ❌ وعد مرفوض غير مُعالَج:', err.message);
        _hooks.error.forEach(fn => { try { fn(err); } catch (_) {} });
    });

    console.log('[RUNTIME] 🛡  معالجات الإشارات مسجّلة');
}

// ─── Task Scheduler ───────────────────────────────────────────────────────────

const _tasks = new Map();
const _intervals = new Map();

/**
 * جدولة مهمة دورية
 * @param {string} name
 * @param {number} intervalMs
 * @param {Function} fn
 */
function scheduleTask(name, intervalMs, fn) {
    if (_intervals.has(name)) clearInterval(_intervals.get(name));
    const id = setInterval(async () => {
        try {
            await fn();
        } catch (err) {
            console.error(`[RUNTIME] ⚠️  خطأ في المهمة "${name}":`, err.message);
        }
    }, intervalMs);
    _intervals.set(name, id);
    _tasks.set(name, { name, intervalMs, createdAt: new Date().toISOString() });
    console.log(`[RUNTIME] ⏱  مهمة مجدوَلة: ${name} (كل ${intervalMs}ms)`);
    return id;
}

/**
 * إلغاء مهمة
 * @param {string} name
 */
function cancelTask(name) {
    const id = _intervals.get(name);
    if (id) {
        clearInterval(id);
        _intervals.delete(name);
        _tasks.delete(name);
        console.log(`[RUNTIME] ❌ مهمة مُلغاة: ${name}`);
    }
}

/**
 * قائمة المهام المجدوَلة
 */
function listTasks() {
    return Array.from(_tasks.values());
}

// ─── Runtime Status ───────────────────────────────────────────────────────────

function status() {
    return {
        name:        'runtime',
        pid:         process.pid,
        uptime:      process.uptime(),
        memoryMB:    (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1),
        tasks:       listTasks(),
        shuttingDown: _shuttingDown,
    };
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    console.log('[RUNTIME] ⚙️  تهيئة طبقة التشغيل...');
    registerSignalHandlers();
    await runStartup();
    console.log('[RUNTIME] ✅ جاهز');
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    onStartup,
    onShutdown,
    onError,
    runStartup,
    shutdown,
    registerSignalHandlers,
    scheduleTask,
    cancelTask,
    listTasks,
    status,
    init,
};
