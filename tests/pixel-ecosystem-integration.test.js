/**
 * بسم الله الرحمن الرحيم
 * اختبارات المنظومة المتكاملة — Comprehensive Integration Tests
 */

'use strict';

const path = require('path');
const ecosystemModule = require(path.join(__dirname, '../lib/sheikha-pixel-ai-ecosystem'));
const pixelSystem = require(path.join(__dirname, '../lib/sheikha-pixel-system'));
const pixelUtilities = require(path.join(__dirname, '../lib/sheikha-pixel-utilities'));

// ═══════════════════════════════════════════════════════════════════════════════
// أدوات الاختبار الأساسية
// ═══════════════════════════════════════════════════════════════════════════════

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (!condition) {
        throw new Error(`❌ فشل: ${message}`);
    }
}

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
        testsPassed++;
    } catch (err) {
        console.error(`  ❌ ${name}`);
        console.error(`     ${err.message}`);
        testsFailed++;
    }
}

async function asyncTest(name, fn) {
    try {
        await fn();
        console.log(`  ✅ ${name}`);
        testsPassed++;
    } catch (err) {
        console.error(`  ❌ ${name}`);
        console.error(`     ${err.message}`);
        testsFailed++;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// مجموعة الاختبارات 1: محرك الذكاء الاصطناعي
// ═══════════════════════════════════════════════════════════════════════════════

function testAIEngine() {
    console.log('\n🧠 اختبارات محرك الذكاء الاصطناعي:\n');

    const ecosystem = ecosystemModule.createEcosystem();

    test('إنشاء محرك AI', () => {
        assert(ecosystem.aiEngine !== undefined, 'محرك AI غير موجود');
        assert(ecosystem.aiEngine.models instanceof Map, 'النماذج ليست Map');
    });

    asyncTest('تدريب نموذج على بيانات', async () => {
        const trainingData = [
            { value: 100, label: 'high' },
            { value: 50, label: 'medium' },
            { value: 10, label: 'low' }
        ];

        const model = await ecosystem.aiEngine.trainModel(trainingData, 'test-model');

        assert(model !== undefined, 'النموذج لم يُرجع');
        assert(model.accuracy > 0, 'دقة النموذج سالبة');
        assert(model.accuracy <= 1, 'دقة النموذج أكبر من 1');
    });

    test('استخراج الأنماط من البيانات', () => {
        const data = { type: 'gold', weight: 100 };
        const pattern = ecosystem.aiEngine.extractPattern(data);

        assert(pattern !== undefined, 'النمط لم يُرجع');
        assert(pattern.features !== undefined, 'المميزات مفقودة');
        assert(pattern.hash !== undefined, 'البصمة مفقودة');
    });

    test('تصنيف البيانات', () => {
        const data1 = { value: 100 };
        const data2 = [1, 2, 3, 4, 5];
        const data3 = 'نص عادي';

        const class1 = ecosystem.aiEngine.classifyData(data1);
        const class2 = ecosystem.aiEngine.classifyData(data2);
        const class3 = ecosystem.aiEngine.classifyData(data3);

        assert(class1 === 'object', 'تصنيف خاطئ للـ object');
        assert(class2 === 'array', 'تصنيف خاطئ للـ array');
        assert(class3 === 'string', 'تصنيف خاطئ للـ string');
    });

    test('التنبؤ بقيمة بناءً على نموذج', async () => {
        const trainingData = [
            { x: 1, y: 2 },
            { x: 2, y: 4 },
            { x: 3, y: 6 }
        ];

        await ecosystem.aiEngine.trainModel(trainingData, 'predict-test');
        const prediction = ecosystem.aiEngine.predict({ x: 4 }, 'predict-test');

        assert(prediction !== undefined, 'التنبؤ فارغ');
        assert(prediction.confidence > 0, 'الثقة سالبة');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// مجموعة الاختبارات 2: جسر اللغة الكبيرة
// ═══════════════════════════════════════════════════════════════════════════════

function testLLMBridge() {
    console.log('\n💬 اختبارات جسر LLM:\n');

    const ecosystem = ecosystemModule.createEcosystem();

    test('إنشاء جسر LLM', () => {
        assert(ecosystem.llmBridge !== undefined, 'جسر LLM غير موجود');
        assert(ecosystem.llmBridge.prompts instanceof Map, 'الأوامر ليست Map');
    });

    test('توليد أوامر ذكية من البيانات', () => {
        const pixel = {
            id: 'pixel-001',
            data: { type: 'product', name: 'ذهب خالص' }
        };

        const prompt = ecosystem.llmBridge.generatePrompt(pixel);

        assert(prompt !== undefined, 'الأمر فارغ');
        assert(typeof prompt === 'string' || typeof prompt === 'object', 'نوع الأمر خاطئ');
    });

    test('اختيار القالب المناسب', () => {
        const pixel1 = { id: 'p1', data: { name: 'منتج' } };
        const pixel2 = { id: 'p2', data: { name: 'معاملة', amount: 1000 } };

        const template1 = ecosystem.llmBridge.selectTemplate(pixel1);
        const template2 = ecosystem.llmBridge.selectTemplate(pixel2);

        assert(template1 !== undefined, 'القالب الأول فارغ');
        assert(template2 !== undefined, 'القالب الثاني فارغ');
    });

    test('معالجة استجابة LLM', () => {
        const prompt = { id: 'prompt-1', text: 'ما هو الذهب؟' };
        const response = 'الذهب معدن نفيس';

        const processed = ecosystem.llmBridge.processLLMResponse(prompt, response);

        assert(processed !== undefined, 'المعالجة فارغة');
        assert(processed.analysis !== undefined, 'التحليل مفقود');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// مجموعة الاختبارات 3: محرك التوليد
// ═══════════════════════════════════════════════════════════════════════════════

function testGenerationEngine() {
    console.log('\n🔄 اختبارات محرك التوليد:\n');

    const ecosystem = ecosystemModule.createEcosystem();

    test('إنشاء محرك التوليد', () => {
        assert(ecosystem.generationEngine !== undefined, 'محرك التوليد غير موجود');
        assert(ecosystem.generationEngine.templates instanceof Map, 'القوالب ليست Map');
    });

    asyncTest('توليد بكسلات من قالب', async () => {
        const generated = await ecosystem.generationEngine.generatePixels('product', 5);

        assert(Array.isArray(generated), 'النتيجة ليست مصفوفة');
        assert(generated.length === 5, 'عدد البكسلات غير صحيح');
        assert(generated[0].id !== undefined, 'معرّف البكسل مفقود');
    });

    test('الحصول على إحصائيات التوليد', () => {
        const stats = ecosystem.generationEngine.getGenerationStats();

        assert(stats !== undefined, 'الإحصائيات فارغة');
        assert(stats.totalGenerated !== undefined, 'الإجمالي مفقود');
        assert(typeof stats.totalGenerated === 'number', 'الإجمالي ليس رقماً');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// مجموعة الاختبارات 4: مدير الأدوات
// ═══════════════════════════════════════════════════════════════════════════════

function testToolsManager() {
    console.log('\n🛠️ اختبارات مدير الأدوات:\n');

    const ecosystem = ecosystemModule.createEcosystem();

    test('إنشاء مدير الأدوات', () => {
        assert(ecosystem.toolsManager !== undefined, 'مدير الأدوات غير موجود');
        assert(ecosystem.toolsManager.tools instanceof Map, 'الأدوات ليست Map');
    });

    test('الأدوات الافتراضية موجودة', () => {
        const tools = ecosystem.toolsManager.tools;

        assert(tools.has('analyze'), 'أداة analyze غير موجودة');
        assert(tools.has('optimize'), 'أداة optimize غير موجودة');
        assert(tools.has('compare'), 'أداة compare غير موجودة');
        assert(tools.has('cluster'), 'أداة cluster غير موجودة');
    });

    test('تنفيذ أداة analyze', () => {
        const pixel = pixelSystem.createPixel('test-pixel', { value: 100 });
        const result = ecosystem.toolsManager.executeTool('analyze', pixel);

        assert(result !== undefined, 'النتيجة فارغة');
        assert(result.complexity !== undefined, 'التعقيد مفقود');
    });

    test('تسجيل أداة مخصصة', () => {
        const customTool = (data) => ({ custom: true, data });
        ecosystem.toolsManager.registerTool('custom-tool', customTool);

        assert(ecosystem.toolsManager.tools.has('custom-tool'), 'الأداة المخصصة لم تُسجل');
    });

    test('تنفيذ الأداة المخصصة', () => {
        const result = ecosystem.toolsManager.executeTool('custom-tool', { test: 'data' });

        assert(result.custom === true, 'تنفيذ الأداة خاطئ');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// مجموعة الاختبارات 5: الأدوات المساعدة
// ═══════════════════════════════════════════════════════════════════════════════

function testUtilities() {
    console.log('\n🔧 اختبارات الأدوات المساعدة:\n');

    test('تحديث البيانات', () => {
        const data = { name: 'منتج', value: 100 };
        const normalized = pixelUtilities.normalizePixelData(data);

        assert(normalized.normalized === true, 'التحديث فشل');
        assert(normalized.stringLength > 0, 'الحجم سالب');
    });

    test('التحقق من صحة البكسل', () => {
        const pixel = pixelSystem.createPixel('valid-pixel', { test: 'data' });
        const validation = pixelUtilities.validatePixel(pixel);

        assert(validation.valid === true, 'التحقق فشل');
        assert(Array.isArray(validation.errors), 'الأخطاء ليست مصفوفة');
    });

    test('حساب بصمة البكسل', () => {
        const pixel = pixelSystem.createPixel('fp-pixel', { data: 'test' });
        const fp = pixelUtilities.generatePixelFingerprint(pixel);

        assert(fp.fingerprint !== undefined, 'البصمة مفقودة');
        assert(typeof fp.fingerprint === 'string', 'نوع البصمة خاطئ');
    });

    test('مقارنة البكسلات', () => {
        const p1 = pixelSystem.createPixel('p1', { value: 100 });
        const p2 = pixelSystem.createPixel('p2', { value: 200 });

        const comparison = pixelUtilities.advancedCompare(p1, p2);

        assert(comparison.similarity !== undefined, 'التشابه مفقود');
        assert(comparison.similarity >= 0 && comparison.similarity <= 1, 'التشابه خارج النطاق');
    });

    test('تقرير تحليل البكسلات', () => {
        const pixels = [
            pixelSystem.createPixel('r1', { value: 100 }),
            pixelSystem.createPixel('r2', { value: 200 })
        ];

        const report = pixelUtilities.generateReport(pixels);

        assert(report.totalPixels === 2, 'عدد البكسلات خاطئ');
        assert(report.statistics !== undefined, 'الإحصائيات مفقودة');
    });

    test('تصدير إلى CSV', () => {
        const pixels = [pixelSystem.createPixel('csv-p', { test: 'data' })];
        const csv = pixelUtilities.exportToCSV(pixels);

        assert(csv.includes('ID'), 'رأس CSV مفقود');
        assert(csv.length > 0, 'CSV فارغ');
    });

    test('تصدير واستيراد JSON', () => {
        const pixels = [pixelSystem.createPixel('json-p', { test: 'data' })];
        const json = pixelUtilities.exportToJSON(pixels);

        const imported = pixelUtilities.importFromJSON(json);

        assert(imported.success === true, 'الاستيراد فشل');
        assert(imported.count > 0, 'لا توجد بكسلات مستوردة');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// مجموعة الاختبارات 6: التكامل الشامل
// ═══════════════════════════════════════════════════════════════════════════════

async function testIntegration() {
    console.log('\n🔗 اختبارات التكامل الشامل:\n');

    const ecosystem = ecosystemModule.createEcosystem();

    asyncTest('دورة كاملة: تدريب + توليد + تحليل', async () => {
        // تدريب
        const trainingData = [
            { type: 'gold', value: 1000, label: 'halal' },
            { type: 'silver', value: 500, label: 'halal' }
        ];
        const model = await ecosystem.aiEngine.trainModel(trainingData, 'integration-model');
        assert(model !== undefined, 'التدريب فشل');

        // توليد
        const generated = await ecosystem.generationEngine.generatePixels('product', 3);
        assert(generated.length === 3, 'التوليد فشل');

        // تحليل
        for (const pixel of generated) {
            const analysis = ecosystem.toolsManager.executeTool('analyze', pixel);
            assert(analysis !== undefined, 'التحليل فشل');
        }
    });

    test('حالة المنظومة الكاملة', () => {
        const status = ecosystem.getEcosystemStatus();

        assert(status !== undefined, 'الحالة فارغة');
        assert(status.aiEngine !== undefined, 'حالة AI مفقودة');
        assert(status.llmBridge !== undefined, 'حالة LLM مفقودة');
        assert(status.generationEngine !== undefined, 'حالة التوليد مفقودة');
        assert(status.toolsManager !== undefined, 'حالة الأدوات مفقودة');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// تشغيل جميع الاختبارات
// ═══════════════════════════════════════════════════════════════════════════════

async function runAllTests() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  اختبارات المنظومة المتكاملة                               ║');
    console.log('║  Sheikha Integrated Ecosystem Tests                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    testAIEngine();
    testLLMBridge();
    testGenerationEngine();
    testToolsManager();
    testUtilities();

    await testIntegration();

    // النتائج النهائية
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log(`║  النتائج النهائية                                           ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`✅ نجح: ${testsPassed}`);
    console.log(`❌ فشل: ${testsFailed}`);

    const total = testsPassed + testsFailed;
    const percentage = ((testsPassed / total) * 100).toFixed(2);

    console.log(`\n📊 النسبة: ${percentage}% (${testsPassed}/${total})\n`);

    if (testsFailed === 0) {
        console.log('🎉 جميع الاختبارات نجحت!\n');
        process.exit(0);
    } else {
        console.log('⚠️  بعض الاختبارات فشلت\n');
        process.exit(1);
    }
}

// تشغيل البرنامج
if (require.main === module) {
    runAllTests().catch(err => {
        console.error('❌ خطأ في الاختبارات:', err.message);
        process.exit(1);
    });
}

module.exports = {
    test,
    asyncTest,
    testAIEngine,
    testLLMBridge,
    testGenerationEngine,
    testToolsManager,
    testUtilities,
    testIntegration,
    runAllTests
};
