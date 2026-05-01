#!/usr/bin/env node
// بسم الله الرحمن الرحيم
// P0 Wrap Blocks Non-L0 - لفّ كتل المحركات غير L0 + تعطيل blocked
// الهدف: تقليل require('./lib/') في server.js إلى L0 فقط

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const serverPath = path.join(ROOT, 'server.js');
const outPath = path.join(ROOT, 'server.js.p0_l0_only.new');

const jawamiFinalPath = path.join(ROOT, 'config', 'engines-jawami-final.json');
const criticalPath = path.join(ROOT, 'config', 'critical-engines.json');

if (!fs.existsSync(serverPath)) {
  console.error('❌ server.js غير موجود');
  process.exit(1);
}
if (!fs.existsSync(jawamiFinalPath)) {
  console.error('❌ config/engines-jawami-final.json غير موجود');
  process.exit(1);
}
if (!fs.existsSync(criticalPath)) {
  console.error('❌ config/critical-engines.json غير موجود');
  process.exit(1);
}

const server = fs.readFileSync(serverPath, 'utf8');
const jawamiFinal = JSON.parse(fs.readFileSync(jawamiFinalPath, 'utf8'));
const critical = JSON.parse(fs.readFileSync(criticalPath, 'utf8'));

const l0 = new Set(
  (critical.critical_engines_l0 || critical.L0 || critical.engines || []).map(String)
);

const blocked = new Set(
  (jawamiFinal?.tiers?.blocked?.engines || []).map(String)
);

// --- Helpers
function detectEngineFile(blockText) {
  // يلتقط أول require('./lib/<file>')
  const m = blockText.match(/require\(\s*['"]\.\/lib\/([^'"]+)['"]\s*\)/);
  return m ? m[1] : null;
}

function wrapBlock(blockText, engineFile, mode) {
  // mode: 'blocked' | 'lazy'
  const header = `\n/* ====== P0-1 AUTO (${mode.toUpperCase()}) ======\nEngine: ${engineFile || 'UNKNOWN'}\nميثاق شيخة: ${mode === 'blocked' ? 'ملف مفقود - يُحذف' : 'L1/L2 - تحميل عند الطلب'}\n====== */`;

  if (mode === 'blocked') {
    // تعليق كامل للكتلة
    return header + '\n/*\n' + blockText + '\n*/\n';
  }

  // lazy: منع تشغيل الكتلة عند STARTUP_L0_ONLY
  // نترك marker واضح
  return (
    header + '\n' +
    `if (!STARTUP_L0_ONLY) {\n` +
    blockText
      .split('\n')
      .map(line => '  ' + line)
      .join('\n') + '\n' +
    `} else {\n` +
    `  console.log("⏸️ [LAZY] ${engineFile} — سيُحمّل عند الطلب");\n` +
    `}\n`
  );
}

// --- Strategy:
// تقسيم server.js إلى كتل تبدأ بسطر فيه "✅" و "Engine —"
const markerRe = /^.*(✅|⏸️|⚠️).*Engine\s*(—|:).*$/gm;

let markers = [];
let match;
while ((match = markerRe.exec(server)) !== null) {
  markers.push({ index: match.index, line: match[0] });
}

if (markers.length < 5) {
  console.error('❌ لم أجد علامات كتل المحركات (✅ ... Engine —).');
  console.error('   عدد العلامات:', markers.length);
  process.exit(1);
}

console.log(`📊 وجدت ${markers.length} علامة محرك في server.js\n`);

markers.push({ index: server.length }); // sentinel

let out = server.slice(0, markers[0].index); // كل ما قبل أول محرك
let changed = 0;
let blockedCount = 0;
let lazyCount = 0;
let l0Count = 0;
let skipped = 0;

for (let i = 0; i < markers.length - 1; i++) {
  const start = markers[i].index;
  const end = markers[i + 1].index;

  const block = server.slice(start, end);
  const engineFile = detectEngineFile(block);

  // لو ما في require داخل الكتلة، اتركها كما هي
  if (!engineFile) {
    out += block;
    skipped++;
    continue;
  }

  if (blocked.has(engineFile)) {
    out += wrapBlock(block, engineFile, 'blocked');
    changed++;
    blockedCount++;
    continue;
  }

  if (l0.has(engineFile)) {
    out += block;
    l0Count++;
    continue;
  }

  // non-L0 -> lazy
  out += wrapBlock(block, engineFile, 'lazy');
  changed++;
  lazyCount++;
}

fs.writeFileSync(outPath, out, 'utf8');

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ P0-1 Wrap Result (Block-based)');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`L0 kept:      ${l0Count}`);
console.log(`Lazy wrapped: ${lazyCount}`);
console.log(`Blocked off:  ${blockedCount}`);
console.log(`Skipped:      ${skipped}`);
console.log(`Changed:      ${changed}`);
console.log('');
console.log(`✅ Output: ${outPath}`);
console.log('═══════════════════════════════════════════════════════════════');
