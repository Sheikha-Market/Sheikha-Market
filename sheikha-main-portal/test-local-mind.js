/**
 * بسم الله الرحمن الرحيم
 * اختبار وتقييم النموذج اللغوي المحلي — SheikhaLocalMind
 */
const { SheikhaLocalMind } = require('./lib/sheikha-local-mind');

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   بسم الله الرحمن الرحيم');
    console.log('   اختبار وتقييم عقل شيخة المحلي — SheikhaLocalMind v1.0');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. التهيئة والتدريب
    const mind = new SheikhaLocalMind();
    await mind.initialize();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   اختبار الردود');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 2. اختبار الردود
    const tests = [
        // ─── اختبار السلام ───
        { msg: 'السلام عليكم ورحمة الله وبركاته', label: '✅ مسلم يسلم' },
        { msg: 'السلام عليكم', label: '✅ مسلم يسلم (قصير)' },
        { msg: 'hello', label: '🔹 غير مسلم يسلم' },
        { msg: 'hi there', label: '🔹 غير مسلم يسلم (2)' },
        { msg: 'مرحبا', label: '👋 تحية عامة' },

        // ─── اختبار المعادن ───
        { msg: 'كم سعر النحاس اليوم', label: '💰 سعر معدن' },
        { msg: 'ما هو الحديد', label: '🔧 معلومات معدن' },
        { msg: 'أريد سكراب ألمنيوم', label: '♻️ سكراب' },

        // ─── اختبار التجارة ───
        { msg: 'أريد شراء 500 طن حديد', label: '🛒 شراء' },
        { msg: 'عندي للبيع نحاس', label: '📤 بيع' },
        { msg: 'أريد شحن بحري من جدة', label: '🚢 شحن' },

        // ─── اختبار شرعي ───
        { msg: 'كم زكاة 100 غرام ذهب', label: '💰 زكاة' },
        { msg: 'هل يجوز بيع المعادن بالتقسيط', label: '⚖️ حكم شرعي' },

        // ─── اختبار عام ───
        { msg: 'ما هي شيخة', label: 'ℹ️ عن شيخة' },
        { msg: 'مساعدة', label: '🆘 مساعدة' },
        { msg: 'جزاك الله خيرا', label: '🙏 شكر' },
        { msg: 'في أمان الله', label: '👋 وداع' },
        { msg: 'تحليل السوق', label: '📈 تحليل' },
    ];

    for (const test of tests) {
        const result = mind.respond(test.msg);
        console.log(`── ${test.label} ──────────────────────────────────`);
        console.log(`   📝 الرسالة: "${test.msg}"`);
        console.log(`   🎯 النية: ${result.intent} (ثقة: ${(result.confidence * 100).toFixed(0)}% | طريقة: ${result.response ? 'ok' : 'fail'})`);
        console.log(`   📊 كيانات: ${result.entities.length > 0 ? result.entities.map(e => `${e.type}:${e.value}`).join(', ') : 'لا يوجد'}`);
        console.log(`   💬 الرد: ${result.response.substring(0, 120)}...`);
        console.log(`   ⚡ زمن الرد: ${result.latencyMs}ms`);
        console.log('');
    }

    // 3. التقييم الشامل
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   التقييم الشامل');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const evaluation = mind.evaluate();

    console.log(`📊 النتيجة الإجمالية: ${evaluation.overallScore}/100\n`);

    for (const [key, comp] of Object.entries(evaluation.components)) {
        console.log(`   ${comp.name}: ${comp.score}/100`);
        console.log(`      ${comp.details}\n`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   المقارنة الصادقة مع GPT / Claude');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`   📖 ${evaluation.comparison.quran}\n`);

    console.log('   💪 نقاط قوة شيخة:');
    for (const s of evaluation.comparison.sheikhaLocalMind.strengths) {
        console.log(`      ✅ ${s}`);
    }

    console.log('\n   ⚠️ نقاط ضعف شيخة:');
    for (const w of evaluation.comparison.sheikhaLocalMind.weaknesses) {
        console.log(`      ❌ ${w}`);
    }

    console.log('\n   📋 الحكم الصادق:');
    console.log(`      ${evaluation.comparison.verdict.honest}`);
    console.log(`      ${evaluation.comparison.verdict.recommendation}`);
    console.log(`\n      📜 ${evaluation.comparison.verdict.islamicPerspective}`);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   ✅ اكتمل الاختبار والتقييم');
    console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(console.error);
