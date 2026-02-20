#!/usr/bin/env node
// بسم الله الرحمن الرحيم
// P0 Finalize Classification - إنتاج التصنيف النهائي

const fs = require('fs');
const path = require('path');

// قراءة الملفات
const suggestedPath = path.join(process.cwd(), 'config', 'engines-jawami.suggested.json');
const profilesPath = path.join(process.cwd(), 'config', 'engines-unknown-profiles.json');
const criticalPath = path.join(process.cwd(), 'config', 'critical-engines.json');

const suggested = JSON.parse(fs.readFileSync(suggestedPath, 'utf8'));
const profilesData = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
const critical = JSON.parse(fs.readFileSync(criticalPath, 'utf8'));

// دمج التصنيفات
const finalJawami = suggested.jawami;
const profiles = profilesData.profiles;

// إضافة Unknown المُصنّفة
for (const profile of profiles) {
  const jami = profile.jami_suggested;
  
  if (jami === 'blocked' || jami === 'unknown') {
    continue; // لا نضيفها
  }
  
  if (finalJawami[jami]) {
    // تأكد من عدم التكرار
    if (!finalJawami[jami].includes(profile.file)) {
      finalJawami[jami].push(profile.file);
    }
  }
}

// L0 Critical
const l0Engines = critical.critical_engines_l0 || critical.L0 || critical.engines || [];

// L1 & L2 - كل ما ليس L0 ولا blocked
const allClassified = Object.values(finalJawami).flat();
const l1Engines = [];
const l2Engines = [];

// تصنيف L1/L2 بناءً على المخاطر
for (const profile of profiles) {
  if (profile.jami_suggested === 'blocked' || profile.jami_suggested === 'unknown') continue;
  if (l0Engines.includes(profile.file)) continue;
  
  if (profile.risk === 'high' || profile.risk === 'medium') {
    l1Engines.push(profile.file);
  } else {
    l2Engines.push(profile.file);
  }
}

// الملفات المحظورة
const blockedEngines = profiles.filter(p => p.jami_suggested === 'blocked').map(p => p.file);

const finalClassification = {
  meta: {
    bismillah: "بسم الله الرحمن الرحيم",
    charter: "SHEIKHA-CHARTER-TAWHEED-GOVERNANCE.md",
    rule: "لا يُسمح بوجود أي محرك لا ينتمي صراحةً إلى أحد الجوامع",
    version: "1.0.0",
    finalized: new Date().toISOString()
  },
  
  jawami: {
    tawheed_niyyah: {
      name_ar: "جامع التوحيد والنية",
      purpose: "الإخلاص + مراقبة الله + الأمانة + محاسبة النفس",
      engines: finalJawami.tawheed_niyyah.sort()
    },
    sharia_dhabt: {
      name_ar: "جامع الشريعة والضبط",
      purpose: "الحلال والحرام + سد الذرائع + ترك المشتبهات + منع الضرر",
      engines: finalJawami.sharia_dhabt.sort()
    },
    adl_huquq: {
      name_ar: "جامع العدل والحقوق",
      purpose: "العدل + حفظ المال + إثبات الحقوق + الشروط والبينات",
      engines: finalJawami.adl_huquq.sort()
    },
    aman_amn: {
      name_ar: "جامع الأمان والأمن",
      purpose: "أقل صلاحية + منع التسريب + منع العبث + التتبع والمساءلة",
      engines: finalJawami.aman_amn.sort()
    },
    souq_muamalah: {
      name_ar: "جامع السوق والمعاملة",
      purpose: "أركان البيع والشراء + التسعير العادل + التسليم + الوفاء بالعقود",
      engines: finalJawami.souq_muamalah.sort()
    },
    idarah_itqan: {
      name_ar: "جامع الإدارة والإتقان",
      purpose: "الشورى + الإتقان + الجودة + التحسين المستمر",
      engines: finalJawami.idarah_itqan.sort()
    },
    bayan_tawthiq: {
      name_ar: "جامع البيان والتوثيق والهوية",
      purpose: "الشفافية المنضبطة + التوثيق + الهوية + التاريخ",
      engines: finalJawami.bayan_tawthiq.sort()
    }
  },
  
  tiers: {
    l0_critical: {
      description: "المحركات الحرجة - تُحمّل عند startup فقط",
      count: l0Engines.length,
      engines: l0Engines.sort()
    },
    l1_important: {
      description: "محركات مهمة - تُحمّل عند الطلب (medium/high risk)",
      count: l1Engines.length,
      engines: l1Engines.sort()
    },
    l2_advanced: {
      description: "محركات متقدمة - تُحمّل عند الطلب (low risk)",
      count: l2Engines.length,
      engines: l2Engines.sort()
    },
    blocked: {
      description: "محركات محظورة - ملفات مفقودة (يُوقف → يُحذف)",
      count: blockedEngines.length,
      engines: blockedEngines.sort()
    }
  },
  
  summary: {
    total_engines: 117,
    classified: allClassified.length,
    l0: l0Engines.length,
    l1: l1Engines.length,
    l2: l2Engines.length,
    blocked: blockedEngines.length
  }
};

// حفظ
const outPath = path.join(process.cwd(), 'config', 'engines-jawami-final.json');
fs.writeFileSync(outPath, JSON.stringify(finalClassification, null, 2), 'utf8');

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ التصنيف النهائي بجوامع الكلم');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📊 الجوامع السبعة:');
Object.keys(finalClassification.jawami).forEach(jami => {
  const count = finalClassification.jawami[jami].engines.length;
  console.log(`   ${jami}: ${count}`);
});

console.log('\n📊 الطبقات (Tiers):');
console.log(`   L0 Critical: ${finalClassification.tiers.l0_critical.count}`);
console.log(`   L1 Important: ${finalClassification.tiers.l1_important.count}`);
console.log(`   L2 Advanced: ${finalClassification.tiers.l2_advanced.count}`);
console.log(`   🔴 Blocked: ${finalClassification.tiers.blocked.count} (مفقودة)`);

console.log('\n✅ حُفظ في: config/engines-jawami-final.json');
console.log('═══════════════════════════════════════════════════════════════');
