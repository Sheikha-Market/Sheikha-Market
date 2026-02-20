#!/usr/bin/env node
// بسم الله الرحمن الرحيم
// P0-1 Complete V2 - تعطيل جميع requires غير L0 (مع تجاهل التعليقات)

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const serverPath = path.join(ROOT, 'server.js');
const outPath = path.join(ROOT, 'server.js.p0_l0_only_v2.new');
const jawamiFinalPath = path.join(ROOT, 'config', 'engines-jawami-final.json');

const server = fs.readFileSync(serverPath, 'utf8');
const jawamiFinal = JSON.parse(fs.readFileSync(jawamiFinalPath, 'utf8'));

const l0 = new Set(jawamiFinal.tiers.l0_critical.engines);
const blocked = new Set(jawamiFinal.tiers.blocked.engines);
const l1 = new Set(jawamiFinal.tiers.l1_important.engines);
const l2 = new Set(jawamiFinal.tiers.l2_advanced.engines);

// دالة للتحقق من أن السطر ليس داخل تعليق
function isInsideComment(text, index) {
  const beforeText = text.substring(0, index);
  
  // تحقق من /* ... */
  const lastBlockStart = beforeText.lastIndexOf('/*');
  const lastBlockEnd = beforeText.lastIndexOf('*/');
  if (lastBlockStart > lastBlockEnd) return true;
  
  // تحقق من // في نفس السطر
  const lastNewline = beforeText.lastIndexOf('\n');
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
  const lineBeforeMatch = beforeText.substring(lineStart);
  if (lineBeforeMatch.includes('//')) return true;
  
  return false;
}

// استخراج جميع requires (غير المعلقة فقط)
const requireRe = /^([ \t]*)(const|let|var)?\s*(\{[^}]+\}|\w+)\s*=\s*require\(['"]\.\/lib\/([^'"]+)['"]\);?/gm;

let out = server;
let changes = 0;
let l0Count = 0;
let lazyCount = 0;
let blockedCount = 0;
let skipped = 0;

let matches = [];
let match;
while ((match = requireRe.exec(server)) !== null) {
  // تجاهل إذا كان داخل تعليق
  if (isInsideComment(server, match.index)) {
    skipped++;
    continue;
  }
  
  // تجاهل إذا كان داخل دالة loadEngineOnDemand
  const contextBefore = server.substring(Math.max(0, match.index - 200), match.index);
  if (contextBefore.includes('function loadEngineOnDemand')) {
    skipped++;
    continue;
  }
  
  matches.push({
    fullMatch: match[0],
    indent: match[1] || '',
    keyword: match[2] || 'const',
    varName: match[3],
    engineFile: match[4],
    index: match.index
  });
}

// استبدال من الأخير للأول (لتجنب تغيير الـindices)
matches.reverse();

for (const m of matches) {
  const { fullMatch, indent, engineFile, index } = m;
  
  let replacement;
  
  if (blocked.has(engineFile)) {
    blockedCount++;
    changes++;
    replacement = `${indent}// P0-1: BLOCKED (ملف مفقود) - ${engineFile}\n${indent}/* ${fullMatch} */`;
  } else if (l0.has(engineFile)) {
    l0Count++;
    continue; // L0 يبقى كما هو
  } else {
    // L1/L2 - تعليق كامل
    const tier = l1.has(engineFile) ? 'L1' : l2.has(engineFile) ? 'L2' : 'UNKNOWN';
    lazyCount++;
    changes++;
    replacement = `${indent}// P0-1: LAZY (${tier}) - ${engineFile}\n${indent}/* ${fullMatch} */\n${indent}console.log('⏸️ [LAZY] ${engineFile} — سيُحمّل عند الطلب');`;
  }
  
  // استبدال في النص
  out = out.substring(0, index) + replacement + out.substring(index + fullMatch.length);
}

fs.writeFileSync(outPath, out, 'utf8');

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ P0-1 Complete V2 Result');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`L0 kept:      ${l0Count}`);
console.log(`Lazy (L1/L2): ${lazyCount}`);
console.log(`Blocked:      ${blockedCount}`);
console.log(`Skipped (داخل تعليقات): ${skipped}`);
console.log(`Total changes: ${changes}`);
console.log('');
console.log(`✅ Output: ${outPath}`);
console.log('═══════════════════════════════════════════════════════════════');
