#!/usr/bin/env node
'use strict';

/**
 * SHEIKHA Integrated Laboratory Management System
 *
 * يدير ويشغل جميع المختبرات المتخصصة ويجمع نتائجها
 */

const fs = require('fs');
const path = require('path');

// قائمة المختبرات المتخصصة
const LABS = {
  botanical: {
    name: 'مختبر النبات',
    icon: '🌱',
    metrics: ['معدل النمو', 'عمق التجذير', 'جودة التغذية', 'معدل الإثمار', 'المقاومة للجفاف'],
  },
  biology: {
    name: 'مختبر الأحياء',
    icon: '🧬',
    metrics: ['تفاعل الخلايا', 'معدل الانقسام', 'المناعة', 'التواصل', 'الحيوية'],
  },
  soil: {
    name: 'مختبر التربة والأساس',
    icon: '🌍',
    metrics: ['جودة التربة', 'الاستقرار الهيكلي', 'القدرة على التحمل', 'التوازن', 'الخصوبة'],
  },
  water: {
    name: 'مختبر الماء والتدفقات',
    icon: '💧',
    metrics: ['معدل التدفق', 'النقاء', 'الضغط', 'التوازن المائي', 'الري'],
  },
  chemistry: {
    name: 'مختبر الكيمياء',
    icon: '🧪',
    metrics: ['سرعة التفاعل', 'الكفاءة', 'التوازن', 'الاستقرار', 'الإنتاجية'],
  },
  physics: {
    name: 'مختبر الفيزياء والطاقة',
    icon: '🔬',
    metrics: ['الطاقة الإجمالية', 'القوة', 'السرعة', 'التسارع', 'الاحتكاك'],
  },
  statistics: {
    name: 'مختبر الإحصاء والقياس',
    icon: '📊',
    metrics: ['التوزيع', 'الانحراف', 'الاتجاه', 'الارتباط', 'الموثوقية'],
  },
  intelligence: {
    name: 'مختبر الذكاء والتعلم',
    icon: '🧠',
    metrics: ['معدل التعلم', 'الذاكرة', 'الاستنتاج', 'التنبؤ', 'الأداء التكيفي'],
  },
  security: {
    name: 'مختبر الأمان والحماية',
    icon: '🛡️',
    metrics: ['التشفير', 'مقاومة الهجمات', 'الكشف المبكر', 'الاستجابة', 'الامتثال'],
  },
  governance: {
    name: 'مختبر الحوكمة والعدل',
    icon: '⚖️',
    metrics: ['العدل', 'الشفافية', 'الأمانة', 'الامتثال الشرعي', 'سجل الأثر'],
  },
};

/**
 * محاكاة تشغيل مختبر واحد
 */
function runLab(labKey, data = {}) {
  const lab = LABS[labKey];
  if (!lab) {
    throw new Error(`المختبر غير موجود: ${labKey}`);
  }

  // توليد نتائج عشوائية (في الواقع ستأتي من قياسات حقيقية)
  const results = {};
  lab.metrics.forEach((metric) => {
    results[metric] = Math.floor(Math.random() * 40) + 60; // نتائج بين 60-100
  });

  const avgScore = Object.values(results).reduce((a, b) => a + b, 0) / lab.metrics.length;

  return {
    lab: labKey,
    labName: lab.name,
    icon: lab.icon,
    timestamp: new Date().toISOString(),
    metrics: results,
    averageScore: Number(avgScore.toFixed(2)),
    status: avgScore >= 80 ? '✅' : avgScore >= 60 ? '⚠️' : '❌',
  };
}

/**
 * تشغيل جميع المختبرات
 */
function runAllLabs() {
  const results = {};
  let totalScore = 0;
  let count = 0;

  console.log('\n🔬 تشغيل جميع المختبرات...\n');

  for (const labKey of Object.keys(LABS)) {
    try {
      const result = runLab(labKey);
      results[labKey] = result;
      totalScore += result.averageScore;
      count++;

      console.log(`${result.icon} ${result.labName}: ${result.status} ${result.averageScore}/100`);
    } catch (error) {
      console.error(`❌ خطأ في ${labKey}: ${error.message}`);
    }
  }

  const overallScore = count > 0 ? (totalScore / count).toFixed(2) : 0;

  console.log(
    '\n' +
      `📊 الدرجة الإجمالية: ${overallScore}/100\n`
  );

  return {
    timestamp: new Date().toISOString(),
    labs: results,
    overallScore: Number(overallScore),
    labCount: count,
    status: overallScore >= 80 ? 'ممتاز' : overallScore >= 60 ? 'جيد' : 'يحتاج تحسين',
  };
}

/**
 * طباعة تقرير شامل
 */
function printReport(data) {
  console.log('\n' + '═'.repeat(70));
  console.log('📋 تقرير المختبرات الشامل');
  console.log('═'.repeat(70));
  console.log(`\n⏰ الوقت: ${new Date(data.timestamp).toLocaleString('ar-SA')}`);
  console.log(`🏆 الحالة العامة: ${data.status}`);
  console.log(`📊 الدرجة الإجمالية: ${data.overallScore}/100`);
  console.log(`🔬 عدد المختبرات: ${data.labCount}`);

  console.log('\n📈 التفاصيل بالمختبر:');
  for (const [labKey, result] of Object.entries(data.labs)) {
    console.log(`\n  ${result.icon} ${result.labName}`);
    console.log(`     الدرجة: ${result.averageScore}/100 ${result.status}`);
    console.log('     المؤشرات:');
    for (const [metric, score] of Object.entries(result.metrics)) {
      const bar = '█'.repeat(Math.round(score / 5)) + '░'.repeat(20 - Math.round(score / 5));
      console.log(`       • ${metric}: ${bar} ${score}/100`);
    }
  }

  console.log('\n' + '═'.repeat(70) + '\n');
}

/**
 * حفظ النتائج في ملف JSON
 */
function saveResults(data, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 تم حفظ النتائج في: ${outputPath}\n`);
}

/**
 * الدالة الرئيسية
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  try {
    if (command === 'all') {
      const results = runAllLabs();
      printReport(results);

      // حفظ النتائج
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      saveResults(results, `./docs/labs/results/labs-report-${timestamp}.json`);

      // إخراج JSON
      console.log(JSON.stringify(results, null, 2));
    } else if (command.startsWith('--lab=')) {
      const labKey = command.substring(6);
      const result = runLab(labKey);
      console.log(JSON.stringify(result, null, 2));
    } else if (command === '--list') {
      console.log('\n🔬 المختبرات المتاحة:\n');
      for (const [key, lab] of Object.entries(LABS)) {
        console.log(`  ${lab.icon} ${key}: ${lab.name}`);
      }
      console.log('');
    } else {
      console.error(`❌ أمر غير معروف: ${command}`);
      console.log('\nالأوامر المتاحة:');
      console.log('  all       — تشغيل جميع المختبرات');
      console.log('  --lab=KEY — تشغيل مختبر محدد');
      console.log('  --list    — عرض قائمة المختبرات');
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ خطأ: ${error.message}`);
    process.exit(1);
  }
}

// تشغيل
if (require.main === module) {
  main();
}

module.exports = { runLab, runAllLabs, LABS };
