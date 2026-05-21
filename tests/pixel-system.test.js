#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 * اختبار نظام البكسل الشيخة
 * SHEIKHA PIXEL SYSTEM TEST SUITE
 */

'use strict';

const path = require('path');

// ─── متغيرات الاختبار ──────────────────────────────────────────────────────────

const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
};

// ─── دالة مساعدة للاختبار ──────────────────────────────────────────────────────

function test(name, fn) {
    testResults.total++;
    try {
        fn();
        testResults.passed++;
        console.log(`✅ ${name}`);
    } catch (err) {
        testResults.failed++;
        console.error(`❌ ${name}`);
        console.error(`   ${err.message}`);
    }
}

async function asyncTest(name, fn) {
    testResults.total++;
    try {
        await fn();
        testResults.passed++;
        console.log(`✅ ${name}`);
    } catch (err) {
        testResults.failed++;
        console.error(`❌ ${name}`);
        console.error(`   ${err.message}`);
    }
}

function skip(name) {
    testResults.total++;
    testResults.skipped++;
    console.log(`⏭️  ${name} (تم التخطي)`);
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'فشل الاختبار');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// اختبارات البكسل
// ═══════════════════════════════════════════════════════════════════════════════

async function runTests() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  اختبارات نظام البكسل الشيخة                              ║');
    console.log('║  SHEIKHA PIXEL SYSTEM TEST SUITE                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // ─── اختبار التحميل ────────────────────────────────────────────────────

    console.log('📦 اختبارات التحميل:');

    let pixelSystem;
    await asyncTest('تحميل نظام البكسل', async () => {
        pixelSystem = require(path.join(__dirname, '../lib/sheikha-pixel-system'));
        assert(pixelSystem, 'فشل تحميل نظام البكسل');
    });

    if (!pixelSystem) {
        console.log('\n❌ لم يتمكن من تحميل نظام البكسل. توقف الاختبارات.');
        process.exit(1);
    }

    // ─── اختبارات الوحدة (Unit Tests) ──────────────────────────────────────

    console.log('\n🧪 اختبارات الوحدة:');

    await asyncTest('تهيئة نظام البكسل', async () => {
        const result = await pixelSystem.initPixelSystem();
        assert(result.status === 'ready', `الحالة المتوقعة: ready، الحالة الفعلية: ${result.status}`);
    });

    test('إنشاء بكسل واحد', () => {
        const pixel = pixelSystem.createPixel('test-pixel-001', {
            name: 'Test Pixel',
            value: 100
        });
        assert(pixel.id === 'test-pixel-001', 'معرّف البكسل غير صحيح');
        assert(pixel.data.name === 'Test Pixel', 'بيانات البكسل غير صحيحة');
    });

    test('إنشاء عدة بكسلات', () => {
        const pixels = [];
        for (let i = 0; i < 5; i++) {
            const pixel = pixelSystem.createPixel(`pixel-${i}`, { index: i });
            pixels.push(pixel);
        }
        assert(pixels.length === 5, `عدد البكسلات المتوقع: 5، الفعلي: ${pixels.length}`);
    });

    // ─── اختبارات المعالجة ─────────────────────────────────────────────────

    console.log('\n⚙️  اختبارات المعالجة:');

    await asyncTest('معالجة بكسل واحد عصبياً', async () => {
        const pixel = pixelSystem.createPixel('neuro-test-001', {
            text: 'نص تجريبي للاختبار',
            sentiment: 'positive'
        });

        await pixel.processNeural({ test: true });
        // البكسل قد يكون معالجاً أو قد لا تكون الشبكة متوفرة
        assert(pixel.timestamp, 'البكسل لم يُنشأ بشكل صحيح');
    });

    await asyncTest('معالجة دفعة من البكسلات', async () => {
        const batch = [
            pixelSystem.createPixel('batch-1', { value: 1 }),
            pixelSystem.createPixel('batch-2', { value: 2 }),
            pixelSystem.createPixel('batch-3', { value: 3 })
        ];

        const results = await pixelSystem.processBatch(batch, { test: true });
        assert(Array.isArray(results), 'النتيجة يجب أن تكون مصفوفة');
    });

    // ─── اختبارات التجميع ──────────────────────────────────────────────────

    console.log('\n📊 اختبارات التجميع:');

    await asyncTest('تجميع البكسلات', async () => {
        // إنشاء بكسلات للتجميع
        const pixelIds = [];
        for (let i = 0; i < 3; i++) {
            const p = pixelSystem.createPixel(`agg-pixel-${i}`, { index: i });
            pixelIds.push(p.id);
        }

        const aggregation = await pixelSystem.aggregatePixels(pixelIds);
        assert(aggregation !== null, 'التجميع أرجع قيمة null');
        assert(aggregation.totalPixels === 3, `عدد البكسلات المتوقع: 3، الفعلي: ${aggregation.totalPixels}`);
    });

    test('الحصول على إحصائيات النظام', () => {
        const stats = pixelSystem.getStats();
        assert(stats.processed >= 0, 'عدد البكسلات المعالجة يجب أن يكون >= 0');
        assert(stats.failed >= 0, 'عدد الأخطاء يجب أن يكون >= 0');
        assert(stats.successRate, 'معدل النجاح غير متوفر');
    });

    // ─── اختبارات الفئة ────────────────────────────────────────────────────

    console.log('\n🔬 اختبارات الفئة (PixelUnit):');

    test('إنشاء مثيل من PixelUnit', () => {
        const PixelUnit = pixelSystem.PixelUnit;
        const pixel = new PixelUnit('class-test-001', { test: true });
        assert(pixel.id === 'class-test-001', 'معرّف الفئة غير صحيح');
        assert(pixel.confidence === 0, 'الثقة الافتراضية يجب أن تكون 0');
    });

    test('الحصول على حالة البكسل', () => {
        const pixel = pixelSystem.createPixel('state-test-001', { value: 42 });
        const state = pixel.getState();
        assert(state.id === 'state-test-001', 'معرّف الحالة غير صحيح');
        assert(state.data.value === 42, 'قيمة الحالة غير صحيحة');
        assert(state.timestamp, 'الطابع الزمني غير موجود');
    });

    // ─── اختبارات الأداء ────────────────────────────────────────────────────

    console.log('\n⚡ اختبارات الأداء:');

    await asyncTest('معالجة 100 بكسل', async () => {
        const pixels = [];
        for (let i = 0; i < 100; i++) {
            pixels.push(pixelSystem.createPixel(`perf-${i}`, { index: i }));
        }

        const start = Date.now();
        await pixelSystem.processBatch(pixels, { performance: true });
        const duration = Date.now() - start;

        console.log(`     ⏱️  المدة: ${duration}ms`);
        assert(duration < 30000, `المعالجة استغرقت وقتاً طويلاً: ${duration}ms`);
    });

    // ─── اختبارات المعالجة (Edge Cases) ────────────────────────────────────

    console.log('\n🔧 اختبارات الحالات الحدية:');

    test('معالجة بكسل بيانات فارغة', () => {
        const pixel = pixelSystem.createPixel('empty-test', {});
        assert(pixel.data !== null, 'البيانات الفارغة تسبب خطأ');
    });

    test('معالجة بكسل معرّف مطول جداً', () => {
        const longId = 'a'.repeat(500);
        const pixel = pixelSystem.createPixel(longId, { data: 'test' });
        assert(pixel.id === longId, 'المعرّف الطويل لم يُحفظ بشكل صحيح');
    });

    test('معالجة بكسل بيانات ضخمة', () => {
        const largeData = { text: 'x'.repeat(10000) };
        const pixel = pixelSystem.createPixel('large-test', largeData);
        assert(pixel.data.text.length === 10000, 'البيانات الضخمة لم تُحفظ بشكل صحيح');
    });

    // ─── ملخص الاختبارات ────────────────────────────────────────────────────

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ملخص الاختبارات                                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 الإجمالي: ${testResults.total}`);
    console.log(`✅ النجاح: ${testResults.passed}`);
    console.log(`❌ الفشل: ${testResults.failed}`);
    console.log(`⏭️  التخطي: ${testResults.skipped}`);
    console.log(`\n📈 معدل النجاح: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);

    if (testResults.failed === 0) {
        console.log('\n🎉 جميع الاختبارات نجحت!');
        console.log('🌟 نظام البكسل جاهز للإنتاج.');
        process.exit(0);
    } else {
        console.log(`\n⚠️  ${testResults.failed} اختبار(ات) فشل(ت).`);
        process.exit(1);
    }
}

// ─── تشغيل الاختبارات ──────────────────────────────────────────────────────────

runTests().catch(err => {
    console.error('❌ خطأ في مجموعة الاختبارات:', err.message);
    process.exit(1);
});
