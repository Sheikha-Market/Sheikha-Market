/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                   scripts/test-sheikha-os.js                                ║
 * ║              اختبار طبقة نظام التشغيل — Sheikha OS Test Suite               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const path = require('path');
const ROOT = path.join(__dirname, '..');

// ─── Test Runner ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function test(name, fn) {
    try {
        await fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ❌ ${name}`);
        console.error(`     → ${err.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function runTests() {
    console.log('');
    console.log('══════════════════════════════════════════');
    console.log('  اختبار: Sheikha OS — الاختبار الشامل');
    console.log('══════════════════════════════════════════');

    const osModule = require(path.join(ROOT, 'core/sheikha-os'));

    // Boot
    await test('init() يعمل بدون استثناء', async () => {
        await osModule.init();
    });

    // OS_ID
    await test('OS_ID.name === "Sheikha OS"', () => {
        assert(osModule.OS_ID.name === 'Sheikha OS', `الاسم: ${osModule.OS_ID.name}`);
    });

    await test('OS_ID.pid رقم صحيح موجب', () => {
        assert(typeof osModule.OS_ID.pid === 'number' && osModule.OS_ID.pid > 0, 'pid غير صحيح');
    });

    // Services
    await test('registerService تسجّل خدمة جديدة', () => {
        osModule.registerService('api-server', { port: 8080 });
        const s = osModule.serviceStatus('api-server');
        assert(s !== null, 'الخدمة غير موجودة');
        assert(s.status === 'registered', `الحالة: ${s.status}`);
    });

    await test('startService تغيّر الحالة إلى running', () => {
        osModule.startService('api-server');
        const s = osModule.serviceStatus('api-server');
        assert(s.status === 'running', `الحالة: ${s.status}`);
        assert(s.startedAt !== null, 'startedAt لا يجب أن يكون null');
    });

    await test('stopService تغيّر الحالة إلى stopped', () => {
        osModule.stopService('api-server');
        const s = osModule.serviceStatus('api-server');
        assert(s.status === 'stopped', `الحالة: ${s.status}`);
    });

    await test('startService لخدمة غير مسجّلة يُرجع false', () => {
        const result = osModule.startService('nonexistent-service');
        assert(result === false, 'يجب أن يُرجع false');
    });

    // System Metrics
    await test('systemMetrics تُرجع بيانات المعالج', () => {
        const m = osModule.systemMetrics();
        assert(m.cpu.cores >= 1, `cores: ${m.cpu.cores}`);
        assert(typeof m.cpu.loadAvg['1m'] === 'number', 'loadAvg[1m] غير رقم');
    });

    await test('systemMetrics تُرجع بيانات الذاكرة', () => {
        const m = osModule.systemMetrics();
        assert(m.memory.total > 0, 'total يجب أن يكون أكبر من 0');
        assert(m.memory.free >= 0, 'free يجب أن يكون >= 0');
        assert(m.memory.usedPct.endsWith('%'), 'usedPct يجب أن ينتهي بـ %');
    });

    await test('systemMetrics تُرجع hostname', () => {
        const m = osModule.systemMetrics();
        assert(typeof m.hostname === 'string' && m.hostname.length > 0, 'hostname غير صالح');
    });

    // Health Check
    await test('healthCheck تُرجع كائنًا صحيحًا', () => {
        const h = osModule.healthCheck();
        assert(typeof h.healthy === 'boolean', 'healthy يجب أن يكون boolean');
        assert(Array.isArray(h.warnings), 'warnings يجب أن يكون مصفوفة');
        assert(typeof h.checkedAt === 'string', 'checkedAt يجب أن يكون string');
    });

    await test('healthCheck تُرجع services', () => {
        const h = osModule.healthCheck();
        assert(typeof h.services === 'object', 'services يجب أن يكون object');
    });

    // Command Bus
    await test('onCommand و executeCommand يعملان', async () => {
        osModule.onCommand('echo', (payload) => payload);
        const r = await osModule.executeCommand('echo', { msg: 'hello' });
        assert(r.ok === true, 'ok يجب أن يكون true');
        assert(r.result.msg === 'hello', 'النتيجة خاطئة');
    });

    await test('executeCommand يُرجع خطأ للأمر المجهول', async () => {
        const r = await osModule.executeCommand('unknown:cmd', {});
        assert(r.ok === false, 'يجب أن يُرجع ok: false');
        assert(typeof r.error === 'string', 'error يجب أن يكون string');
    });

    await test('executeCommand يُعالج استثناء handler', async () => {
        osModule.onCommand('fail', () => { throw new Error('مقصود'); });
        const r = await osModule.executeCommand('fail', {});
        assert(r.ok === false, 'يجب أن يُرجع ok: false');
        assert(r.error === 'مقصود', `الخطأ: ${r.error}`);
    });

    // ─── Data Layer Tests ────────────────────────────────────────────────────

    console.log('');
    console.log('══════════════════════════════════════════');
    console.log('  اختبار: Data Layer');
    console.log('══════════════════════════════════════════');

    const { DataStore, DataQueue, DataCache, validate, generateId } = require(path.join(ROOT, 'lib/data'));

    await test('DataStore: set و get يعملان', () => {
        const store = new DataStore('test');
        store.set('k1', { name: 'test' });
        const val = store.get('k1');
        assert(val !== null, 'القيمة null');
        assert(val.name === 'test', 'القيمة خاطئة');
    });

    await test('DataStore: delete يعمل', () => {
        const store = new DataStore('test2');
        store.set('k1', { x: 1 });
        store.delete('k1');
        assert(!store.has('k1'), 'السجل لا يزال موجودًا بعد الحذف');
    });

    await test('DataStore: findBy يعمل بعد buildIndex', () => {
        const store = new DataStore('products');
        store.set('p1', { category: 'metals', name: 'ذهب' });
        store.set('p2', { category: 'metals', name: 'فضة' });
        store.set('p3', { category: 'scrap', name: 'نحاس' });
        store.buildIndex('category');
        const metals = store.findBy('category', 'metals');
        assert(metals.length === 2, `العدد: ${metals.length}`);
    });

    await test('DataStore: TTL يُنهي السجل تلقائيًا', async () => {
        const store = new DataStore('ttl-test');
        store.set('expiring', { v: 1 }, 50); // 50ms
        assert(store.has('expiring'), 'السجل يجب أن يكون موجودًا');
        await new Promise(r => setTimeout(r, 100));
        assert(!store.has('expiring'), 'السجل يجب أن ينتهي صلاحيته');
    });

    await test('DataQueue: enqueue و dequeue يعملان', () => {
        const q = new DataQueue('test-q');
        q.enqueue({ task: 'process' });
        q.enqueue({ task: 'send' });
        assert(q.size() === 2, `الحجم: ${q.size()}`);
        const item = q.dequeue();
        assert(item.task === 'process', 'الترتيب FIFO خاطئ');
        assert(q.size() === 1, `الحجم بعد dequeue: ${q.size()}`);
    });

    await test('DataCache: set و get مع TTL يعملان', async () => {
        const cache = new DataCache('test-cache', 50);
        cache.set('k', 'val');
        assert(cache.get('k') === 'val', 'قيمة غير صحيحة');
        await new Promise(r => setTimeout(r, 100));
        assert(cache.get('k') === null, 'يجب أن تنتهي صلاحية الـ cache');
    });

    await test('validate يكتشف الحقول الناقصة', () => {
        const r = validate({ name: 'test' }, { name: 'required', price: 'required' });
        assert(r.valid === false, 'يجب أن يكون غير صالح');
        assert(r.errors.length > 0, 'يجب أن تكون هناك أخطاء');
    });

    await test('validate يقبل البيانات الصحيحة', () => {
        const r = validate({ name: 'test', price: 100 }, { name: 'string', price: 'number' });
        assert(r.valid === true, 'يجب أن يكون صالحًا');
    });

    await test('generateId يُنتج معرّفات فريدة', () => {
        const id1 = generateId('prod');
        const id2 = generateId('prod');
        assert(id1 !== id2, 'المعرّفات يجب أن تكون فريدة');
        assert(id1.startsWith('prod_'), `المعرّف: ${id1}`);
    });

    // ─── Impact Engine Tests ─────────────────────────────────────────────────

    console.log('');
    console.log('══════════════════════════════════════════');
    console.log('  اختبار: Impact Engine');
    console.log('══════════════════════════════════════════');

    const impact = require(path.join(ROOT, 'core/sheikha-impact-engine'));
    await impact.init();

    await test('increment و getCounter يعملان', () => {
        impact.increment('test:counter', 5);
        assert(impact.getCounter('test:counter') === 5, `القيمة: ${impact.getCounter('test:counter')}`);
        impact.increment('test:counter', 3);
        assert(impact.getCounter('test:counter') === 8, `القيمة: ${impact.getCounter('test:counter')}`);
    });

    await test('setGauge و getGauge يعملان', () => {
        impact.setGauge('latency_ms', 42);
        assert(impact.getGauge('latency_ms') === 42, 'gauge خاطئ');
    });

    await test('observe و histogramStats يعملان', () => {
        [10, 20, 30, 40, 50].forEach(v => impact.observe('req_time', v));
        const stats = impact.histogramStats('req_time');
        assert(stats !== null, 'stats يجب أن تكون موجودة');
        assert(stats.min === 10, `min: ${stats.min}`);
        assert(stats.max === 50, `max: ${stats.max}`);
        assert(parseFloat(stats.avg) === 30, `avg: ${stats.avg}`);
    });

    await test('trackEvent و getEvents يعملان', () => {
        impact.trackEvent('purchase', { amount: 100 });
        const events = impact.getEvents('purchase', 5);
        assert(events.length >= 1, 'يجب وجود حدث واحد على الأقل');
    });

    await test('kpiSnapshot تُرجع كائنًا صحيحًا', () => {
        const snap = impact.kpiSnapshot();
        assert(typeof snap.snapshot === 'object', 'snapshot يجب أن يكون object');
        assert(typeof snap.capturedAt === 'string', 'capturedAt يجب أن يكون string');
    });

    await test('impactReport يُرجع تقريرًا كاملًا', () => {
        const report = impact.impactReport();
        assert(typeof report.title === 'string', 'title مفقود');
        assert(typeof report.histograms === 'object', 'histograms مفقود');
    });

    // ─── Summary ─────────────────────────────────────────────────────────────

    console.log('');
    console.log('══════════════════════════════════════════');
    console.log(`  النتائج النهائية: ${passed} نجح | ${failed} فشل`);
    console.log('══════════════════════════════════════════');
    console.log('');

    if (failed > 0) process.exit(1);
    console.log('🎉 جميع الاختبارات نجحت!');
}

runTests().catch(err => {
    console.error('خطأ غير متوقع:', err);
    process.exit(1);
});
