#!/usr/bin/env node
// بسم الله الرحمن الرحيم
// P0 Profile Unknown - توصيف ذكي للمحركات Unknown

const fs = require('fs');
const path = require('path');

const suggestedPath = path.join(process.cwd(), 'config', 'engines-jawami.suggested.json');
const suggested = JSON.parse(fs.readFileSync(suggestedPath, 'utf8'));

const unknown = suggested.unknown || [];
const libDir = path.join(process.cwd(), 'lib');

function scoreRisk(src) {
  const s = src.toLowerCase();
  const hits = [];
  const rules = [
    ['child_process', /child_process|spawn\(|exec\(|fork\(/],
    ['fs_write', /writefile|appendfile|unlink|rmdir|rm\(|rename/],
    ['network', /http\.|https\.|axios|fetch\(|socket|ws/],
    ['db', /mongodb|mongoose|postgres|mysql|sqlite|sequelize/],
    ['eval', /\beval\(|new function\(/],
    ['auth', /jwt|bcrypt|passport|oauth|token/],
    ['heavy_compute', /python|tensorflow|torch|ml|neural|train/],
  ];
  
  for (const [name, re] of rules) {
    if (re.test(s)) hits.push(name);
  }

  let risk = 'low';
  if (hits.includes('eval') || hits.includes('child_process')) risk = 'high';
  else if (hits.includes('fs_write') || hits.includes('auth') || hits.includes('db') || hits.includes('heavy_compute')) risk = 'medium';

  return { risk, hits };
}

function guessJamiFromSource(engineFile, src) {
  const n = engineFile.toLowerCase();
  const s = src.toLowerCase();

  // جوامع الكلم (تحليل ذكي من المحتوى)
  if (/(quran|hadith|taqwa|sunnah|anbiya|dhikr|ihsan|barakah)/.test(n + s)) return 'tawheed_niyyah';
  if (/(sharia|musharri|halal|haram|riba|fatwa|fiqh|legal|souq.*madinah)/.test(n + s)) return 'sharia_dhabt';
  if (/(contract|claim|dispute|rights|bank|invoice|payment|trade|accounting|fund)/.test(n + s)) return 'adl_huquq';
  if (/(security|auth|access|admin|permission|role|rbac|firewall|encrypt)/.test(n + s)) return 'aman_amn';
  if (/(market|metals|supply|logistics|warehouse|shipping|customs|salvage|scrap|segment)/.test(n + s)) return 'souq_muamalah';
  if (/(dashboard|pilot|experience|ops|devops|kaizen|itqan|quality|improvement|excellence|monitor)/.test(n + s)) return 'idarah_itqan';
  if (/(history|archive|document|calendar|brand|report|log|audit|trace)/.test(n + s)) return 'bayan_tawthiq';
  
  return 'unknown';
}

function hasRoutes(src) {
  return /app\.(get|post|put|delete|patch)|router\.(get|post|put|delete|patch)|\.route\(/.test(src);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 توصيف المحركات Unknown (71 محرك)');
console.log('═══════════════════════════════════════════════════════════════\n');

const profiles = [];
let processed = 0;
let missing = 0;

for (const engineFile of unknown) {
  const filePath = path.join(libDir, engineFile);
  
  if (!fs.existsSync(filePath)) {
    missing++;
    console.log(`⚠️  ${engineFile} - ملف غير موجود`);
    profiles.push({
      file: engineFile,
      exists: false,
      jami_suggested: 'blocked',
      reason: 'ملف غير موجود'
    });
    continue;
  }

  try {
    const src = fs.readFileSync(filePath, 'utf8');
    const size = src.length;
    const lines = src.split('\n').length;
    const riskAnalysis = scoreRisk(src);
    const routes = hasRoutes(src);
    const jamiSuggested = guessJamiFromSource(engineFile, src);
    
    profiles.push({
      file: engineFile,
      exists: true,
      size,
      lines,
      risk: riskAnalysis.risk,
      risk_factors: riskAnalysis.hits,
      has_routes: routes,
      jami_suggested: jamiSuggested,
      reason: riskAnalysis.hits.length > 0 ? riskAnalysis.hits.join(', ') : 'basic'
    });
    
    processed++;
    
    // عرض موجز
    const riskIcon = riskAnalysis.risk === 'high' ? '🔴' : riskAnalysis.risk === 'medium' ? '🟡' : '🟢';
    const jamiIcon = jamiSuggested !== 'unknown' ? '✅' : '❓';
    console.log(`${riskIcon} ${jamiIcon} ${engineFile} → ${jamiSuggested} (${Math.round(size/1024)}KB)`);
    
  } catch (e) {
    profiles.push({
      file: engineFile,
      exists: true,
      error: e.message,
      jami_suggested: 'unknown',
      reason: 'خطأ في القراءة'
    });
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📊 الإحصائيات:');
console.log(`✅ تم معالجة: ${processed}`);
console.log(`⚠️  ملفات مفقودة: ${missing}`);

// تصنيف حسب الجوامع المقترحة
const byJami = {};
for (const p of profiles) {
  const j = p.jami_suggested || 'unknown';
  if (!byJami[j]) byJami[j] = [];
  byJami[j].push(p);
}

console.log('\n📊 توزيع التصنيف المقترح:');
Object.keys(byJami).sort().forEach(jami => {
  console.log(`   ${jami}: ${byJami[jami].length}`);
});

// حفظ النتائج
const outPath = path.join(process.cwd(), 'config', 'engines-unknown-profiles.json');
fs.writeFileSync(outPath, JSON.stringify({ profiles, summary: byJami }, null, 2), 'utf8');

console.log('\n✅ حُفظت البطاقات في: config/engines-unknown-profiles.json');
console.log('═══════════════════════════════════════════════════════════════');
