#!/usr/bin/env node
// بسم الله الرحمن الرحيم
// P0 Classify Jawami - تصنيف دقيق حسب جوامع الكلم

const fs = require('fs');
const path = require('path');

const loadedPath = path.join(process.cwd(), 'tmp', 'loaded_engines.txt');
const loaded = fs.readFileSync(loadedPath, 'utf8').trim().split('\n').filter(Boolean);

function guessJami(engineFile) {
  const n = engineFile.toLowerCase();
  
  // 1️⃣ جامع التوحيد والنية
  if (/taqwa|quran|hadith|sunnah|anbiya|dhikr|ihsan/.test(n)) {
    return 'tawheed_niyyah';
  }
  
  // 2️⃣ جامع الشريعة والضبط
  if (/sharia|musharri|legal|souq-madinah|fiqh/.test(n)) {
    return 'sharia_dhabt';
  }
  
  // 3️⃣ جامع العدل والحقوق
  if (/contract|bank|trade(?!-engine)|accounting|fund|capital/.test(n)) {
    return 'adl_huquq';
  }
  
  // 4️⃣ جامع الأمان والأمن
  if (/security|admin|access|auth|self-heal/.test(n)) {
    return 'aman_amn';
  }
  
  // 5️⃣ جامع السوق والمعاملة
  if (/market|metals|supply|logistics|segment|salvage|customs|circular/.test(n)) {
    return 'souq_muamalah';
  }
  
  // 6️⃣ جامع الإدارة والإتقان
  if (/dashboard|pilot|experience|ops|devops|kaizen|itqan|dim|excellence|quality|improvement|integration/.test(n)) {
    return 'idarah_itqan';
  }
  
  // 7️⃣ جامع البيان والتوثيق
  if (/history|brand|archive|calendar|document|bayan/.test(n)) {
    return 'bayan_tawthiq';
  }
  
  return 'unknown';
}

const stats = {
  tawheed_niyyah: [],
  sharia_dhabt: [],
  adl_huquq: [],
  aman_amn: [],
  souq_muamalah: [],
  idarah_itqan: [],
  bayan_tawthiq: [],
  unknown: []
};

for (const e of loaded) {
  const jami = guessJami(e);
  stats[jami].push(e);
}

const out = {
  meta: {
    bismillah: "بسم الله الرحمن الرحيم",
    rule: "تصنيف مقترح - يحتاج مراجعة بشرية ثم اعتماد",
    charter: "SHEIKHA-CHARTER-TAWHEED-GOVERNANCE.md",
    version: "0.1",
    generated: new Date().toISOString(),
    total_engines: loaded.length
  },
  jawami: stats
};

const outPath = path.join(process.cwd(), 'config', 'engines-jawami.suggested.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 تصنيف المحركات حسب جوامع الكلم');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('1️⃣  التوحيد والنية:', stats.tawheed_niyyah.length);
console.log('2️⃣  الشريعة والضبط:', stats.sharia_dhabt.length);
console.log('3️⃣  العدل والحقوق:', stats.adl_huquq.length);
console.log('4️⃣  الأمان والأمن:', stats.aman_amn.length);
console.log('5️⃣  السوق والمعاملة:', stats.souq_muamalah.length);
console.log('6️⃣  الإدارة والإتقان:', stats.idarah_itqan.length);
console.log('7️⃣  البيان والتوثيق:', stats.bayan_tawthiq.length);
console.log('');
console.log('❓ Unknown (يُوقف → يُراجع → يُصحّح):', stats.unknown.length);
if (stats.unknown.length > 0) {
  console.log('   أمثلة:', stats.unknown.slice(0, 5).join(', '));
}
console.log('');
console.log('✅ حُفظ في: config/engines-jawami.suggested.json');
console.log('═══════════════════════════════════════════════════════════════');
