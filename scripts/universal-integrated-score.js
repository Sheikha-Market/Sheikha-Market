#!/usr/bin/env node

/**
 * SHEIKHA Universal Integrated Score Calculator
 * 
 * يحسب الأفضلية الشاملة لأي خدمة أو مجال:
 * UniversalScore = 0.30H + 0.25P + 0.20X + 0.15V + 0.10I
 * 
 * حيث:
 * H = Human (البشري) — دقة القرار والاستجابة
 * P = Plant (النباتي) — النمو والاستدامة
 * X = Hybrid (الهجين) — التكامل والمرونة
 * V = Viability (الجدوى) — معادلة الجدوى الشاملة
 * I = Islamic (الإسلامي) — الامتثال الشرعي
 */

const fs = require('fs');
const path = require('path');

// ألوان للإخراج
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function c(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

/**
 * حساب الأفضلية الشاملة
 */
function calculateUniversalScore(input) {
  // التحقق من المدخلات
  if (!input || typeof input !== 'object') {
    throw new Error('المدخل يجب أن يكون كائن JSON');
  }

  const {
    service_name = 'Unknown Service',
    human_score = 70,
    plant_score = 70,
    hybrid_score = 70,
    technical = 70,
    financial = 70,
    social = 70,
    islamic_compliance = 70,
  } = input;

  // حساب درجة الجدوى الشاملة
  const viability = (technical + financial + social + islamic_compliance) / 4;

  // حساب الأفضلية الشاملة
  const universal_score =
    0.30 * human_score +
    0.25 * plant_score +
    0.20 * hybrid_score +
    0.15 * viability +
    0.10 * islamic_compliance;

  // تحديد الحالة
  let status = '';
  let statusColor = '';
  
  if (universal_score >= 95) {
    status = '🌟 الأفضل في الكون';
    statusColor = 'green';
  } else if (universal_score >= 85) {
    status = '🏆 متفوق جدًا';
    statusColor = 'green';
  } else if (universal_score >= 75) {
    status = '🟢 جيد جدًا';
    statusColor = 'cyan';
  } else if (universal_score >= 65) {
    status = '🟡 مقبول';
    statusColor = 'yellow';
  } else {
    status = '🔴 غير مقبول';
    statusColor = 'red';
  }

  return {
    service_name,
    metrics: {
      human: human_score,
      plant: plant_score,
      hybrid: hybrid_score,
      viability: Number(viability.toFixed(2)),
      islamic: islamic_compliance,
    },
    score: Number(universal_score.toFixed(2)),
    status,
    statusColor,
    readiness: universal_score >= 75,
    recommendations: generateRecommendations(
      human_score,
      plant_score,
      hybrid_score,
      viability,
      islamic_compliance,
      universal_score
    ),
  };
}

/**
 * توليد التوصيات بناءً على النتائج
 */
function generateRecommendations(human, plant, hybrid, viability, islamic, universal) {
  const recs = [];
  const threshold = 75;

  if (human < threshold) {
    recs.push({
      area: 'البشري (Human)',
      issue: `درجة منخفضة: ${human}`,
      action: 'تحسين دقة القرارات والاستجابة والأداء',
    });
  }

  if (plant < threshold) {
    recs.push({
      area: 'النباتي (Plant)',
      issue: `درجة منخفضة: ${plant}`,
      action: 'تحسين النمو والاستدامة والتجذير',
    });
  }

  if (hybrid < threshold) {
    recs.push({
      area: 'الهجين (Hybrid)',
      issue: `درجة منخفضة: ${hybrid}`,
      action: 'تحسين التكامل والمرونة والقابلية للتوسع',
    });
  }

  if (viability < threshold) {
    recs.push({
      area: 'الجدوى (Viability)',
      issue: `درجة منخفضة: ${viability.toFixed(2)}`,
      action: 'تحسين الجدوى التقنية والمالية والاجتماعية والشرعية',
    });
  }

  if (islamic < threshold) {
    recs.push({
      area: 'الامتثال الشرعي (Islamic)',
      issue: `درجة منخفضة: ${islamic}`,
      action: 'تحسين الامتثال الشرعي والقيم والحوكمة',
    });
  }

  if (recs.length === 0 && universal >= 85) {
    recs.push({
      area: 'العام',
      issue: 'جميع المؤشرات قوية',
      action: 'جاهز للإطلاق الفوري والتوسع',
    });
  }

  return recs;
}

/**
 * طباعة النتيجة بشكل منسق
 */
function printResult(result) {
  console.log('\n' + c('═'.repeat(70), 'bright'));
  console.log(c('📊 حاسبة الأفضلية الشاملة — SHEIKHA Universal Score', 'bright'));
  console.log(c('═'.repeat(70), 'bright'));

  console.log(`\n${c('الخدمة:', 'bright')} ${result.service_name}`);
  console.log(`${c('الحالة:', 'bright')} ${c(result.status, result.statusColor)}`);
  console.log(`${c('الدرجة النهائية:', 'bright')} ${c(result.score.toFixed(2) + '/100', result.statusColor)}`);

  console.log(`\n${c('المؤشرات الفرعية:', 'bright')}`);
  console.log(`  • ${c('البشري (H)', 'cyan')}: ${result.metrics.human.toFixed(2)}`);
  console.log(`  • ${c('النباتي (P)', 'cyan')}: ${result.metrics.plant.toFixed(2)}`);
  console.log(`  • ${c('الهجين (X)', 'cyan')}: ${result.metrics.hybrid.toFixed(2)}`);
  console.log(`  • ${c('الجدوى (V)', 'cyan')}: ${result.metrics.viability.toFixed(2)}`);
  console.log(`  • ${c('الشرعي (I)', 'cyan')}: ${result.metrics.islamic.toFixed(2)}`);

  if (result.recommendations.length > 0) {
    console.log(`\n${c('التوصيات والإجراءات:', 'bright')}`);
    result.recommendations.forEach((rec, idx) => {
      console.log(`\n  ${idx + 1}. ${c(rec.area, 'magenta')}`);
      console.log(`     المشكلة: ${rec.issue}`);
      console.log(`     الإجراء: ${rec.action}`);
    });
  }

  console.log(`\n${c('الجاهزية:', 'bright')} ${result.readiness ? c('✅ جاهز', 'green') : c('❌ غير جاهز بعد', 'red')}`);
  console.log(c('═'.repeat(70), 'bright') + '\n');

  return result;
}

/**
 * مثال جاهز للاختبار
 */
function getExampleInput() {
  return {
    service_name: 'خدمة المطابقة والعروض (Scrap Matching Core)',
    human_score: 88,
    plant_score: 85,
    hybrid_score: 82,
    technical: 90,
    financial: 80,
    social: 85,
    islamic_compliance: 92,
  };
}

/**
 * الدالة الرئيسية
 */
async function main() {
  try {
    let input;
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--example') {
      // مثال جاهز
      input = getExampleInput();
      console.log(c('\n📝 تشغيل بمثال جاهز...\n', 'cyan'));
    } else {
      // قراءة من ملف
      const filePath = args[0];
      if (!fs.existsSync(filePath)) {
        throw new Error(`الملف غير موجود: ${filePath}`);
      }
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      input = JSON.parse(fileContent);
    }

    const result = calculateUniversalScore(input);
    const printed = printResult(result);

    // إخراج JSON للاستخدام في scripts
    console.log(JSON.stringify(printed, null, 2));

    // خروج بحالة مناسبة
    process.exit(printed.readiness ? 0 : 1);
  } catch (error) {
    console.error(c(`❌ خطأ: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// تشغيل
if (require.main === module) {
  main();
}

module.exports = { calculateUniversalScore, getExampleInput };
