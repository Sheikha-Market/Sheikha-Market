/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                   scripts/test-sheikha-root.js                              ║
 * ║              اختبار جذر المنظومة — Sheikha Root Test Suite                  ║
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
    console.log('  اختبار: Sheikha Root');
    console.log('══════════════════════════════════════════');

    const root = require(path.join(ROOT, 'core/sheikha-root'));

    await test('SHEIKHA_ROOT له اسم صحيح', () => {
        assert(root.SHEIKHA_ROOT.name === 'Sheikha', 'الاسم غير صحيح');
    });

    await test('SHEIKHA_ROOT يحتوي على 14 طبقة', () => {
        assert(root.SHEIKHA_ROOT.layers.length === 14, `عدد الطبقات: ${root.SHEIKHA_ROOT.layers.length}`);
    });

    await test('registerLayer تعمل بشكل صحيح', () => {
        root.registerLayer('test-layer', { name: 'test' });
        const layer = root.getLayer('test-layer');
        assert(layer !== null, 'لم يُعثر على الطبقة');
        assert(layer.name === 'test', 'اسم الطبقة خاطئ');
    });

    await test('listLayers تُرجع مصفوفة', () => {
        const layers = root.listLayers();
        assert(Array.isArray(layers), 'يجب أن تكون مصفوفة');
        assert(layers.includes('test-layer'), 'الطبقة غير موجودة في القائمة');
    });

    await test('status تُرجع كائن صحيح', () => {
        const s = root.status();
        assert(typeof s === 'object', 'يجب أن يكون كائنًا');
        assert(typeof s.healthy === 'boolean', 'healthy يجب أن يكون boolean');
        assert(Array.isArray(s.activeLayers), 'activeLayers يجب أن يكون مصفوفة');
    });

    await test('boot() تعمل دون أخطاء', async () => {
        const result = await root.boot();
        assert(typeof result === 'object', 'boot يجب أن يُرجع كائنًا');
    });

    // ─── Sheikha OS Tests ─────────────────────────────────────────────────────

    console.log('');
    console.log('══════════════════════════════════════════');
    console.log('  اختبار: Sheikha OS');
    console.log('══════════════════════════════════════════');

    const os = require(path.join(ROOT, 'core/sheikha-os'));

    await test('OS_ID يحتوي على platform', () => {
        assert(typeof os.OS_ID.platform === 'string', 'platform غير موجود');
    });

    await test('registerService و startService تعملان', () => {
        os.registerService('test-svc', { port: 9999 });
        const result = os.startService('test-svc');
        assert(result === true, 'startService يجب أن يُرجع true');
        const status = os.serviceStatus('test-svc');
        assert(status.status === 'running', 'الحالة يجب أن تكون running');
    });

    await test('systemMetrics تُرجع بيانات CPU و Memory', () => {
        const m = os.systemMetrics();
        assert(typeof m.cpu.cores === 'number', 'cores يجب أن يكون رقمًا');
        assert(typeof m.memory.total === 'number', 'total memory يجب أن يكون رقمًا');
    });

    await test('healthCheck تعمل', () => {
        const h = os.healthCheck();
        assert(typeof h.healthy === 'boolean', 'healthy يجب أن يكون boolean');
        assert(Array.isArray(h.warnings), 'warnings يجب أن يكون مصفوفة');
    });

    // ─── Control Plane Tests ──────────────────────────────────────────────────

    console.log('');
    console.log('══════════════════════════════════════════');
    console.log('  اختبار: Control Plane');
    console.log('══════════════════════════════════════════');

    const cp = require(path.join(ROOT, 'core/sheikha-control-plane'));

    await test('init() تعمل', async () => {
        await cp.init();
    });

    await test('registerCommand و dispatch يعملان', async () => {
        cp.registerCommand('test:ping', () => 'pong', { layer: 'test' });
        const r = await cp.dispatch('test:ping', {});
        assert(r.ok === true, 'dispatch يجب أن يُرجع ok: true');
        assert(r.result === 'pong', 'النتيجة خاطئة');
    });

    await test('dispatch يُرجع خطأ للأمر المجهول', async () => {
        const r = await cp.dispatch('nonexistent:command', {});
        assert(r.ok === false, 'يجب أن يُرجع ok: false');
    });

    await test('publish و subscribe يعملان', async () => {
        let received = false;
        cp.subscribe('test:event', () => { received = true; });
        cp.publish('test:event', { data: 1 });
        assert(received === true, 'لم يُستقبل الحدث');
    });

    await test('logAction و getActionLog يعملان', () => {
        cp.logAction('tester', 'test-action', { note: 'unit-test' });
        const log = cp.getActionLog(5);
        assert(Array.isArray(log), 'السجل يجب أن يكون مصفوفة');
        assert(log.length > 0, 'السجل فارغ');
    });

    // ─── Summary ─────────────────────────────────────────────────────────────

    console.log('');
    console.log('══════════════════════════════════════════');
    console.log(`  النتائج: ${passed} نجح | ${failed} فشل`);
    console.log('══════════════════════════════════════════');
    console.log('');

    if (failed > 0) process.exit(1);
}

runTests().catch(err => {
    console.error('خطأ غير متوقع:', err);
    process.exit(1);
});
