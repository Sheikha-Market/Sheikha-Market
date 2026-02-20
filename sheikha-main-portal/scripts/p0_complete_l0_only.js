#!/usr/bin/env node
// بسم الله الرحمن الرحيم
// P0-1 Complete - تعطيل جميع requires غير L0 بالتعليق الكامل

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const serverPath = path.join(ROOT, 'server.js');
const outPath = path.join(ROOT, 'server.js.p0_l0_only.new');
const jawamiFinalPath = path.join(ROOT, 'config', 'engines-jawami-final.json');

const server = fs.readFileSync(serverPath, 'utf8');
const jawamiFinal = JSON.parse(fs.readFileSync(jawamiFinalPath, 'utf8'));

const l0 = new Set(jawamiFinal.tiers.l0_critical.engines);
const blocked = new Set(jawamiFinal.tiers.blocked.engines);
const l1 = new Set(jawamiFinal.tiers.l1_important.engines);
const l2 = new Set(jawamiFinal.tiers.l2_advanced.engines);

// استخراج جميع requires
const requireRe = /^([ \t]*)(const|let|var)?\s*(\{[^}]+\}|\w+)\s*=\s*require\(['"]\.\/lib\/([^'"]+)['"]\);?/gm;

let out = server;
let changes = 0;
let l0Count = 0;
let lazyCount = 0;
let blockedCount = 0;

// نستبدل كل require بناءً على التصنيف
out = server.replace(requireRe, (match, indent, keyword, varName, engineFile) => {
  
  if (blocked.has(engineFile)) {
    blockedCount++;
    changes++;
    return `${indent}// P0-1: BLOCKED (ملف مفقود) - ${engineFile}\n${indent}/* ${match} */`;
  }
  
  if (l0.has(engineFile)) {
    l0Count++;
    return match; // L0 يبقى كما هو
  }
  
  // L1/L2 - تعليق كامل
  const tier = l1.has(engineFile) ? 'L1' : l2.has(engineFile) ? 'L2' : 'UNKNOWN';
  lazyCount++;
  changes++;
  return `${indent}// P0-1: LAZY (${tier}) - ${engineFile}\n${indent}/* ${match} */\n${indent}console.log('⏸️ [LAZY] ${engineFile} — سيُحمّل عند الطلب');`;
});

fs.writeFileSync(outPath, out, 'utf8');

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ P0-1 Complete Result');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`L0 kept:      ${l0Count}`);
console.log(`Lazy (L1/L2): ${lazyCount}`);
console.log(`Blocked:      ${blockedCount}`);
console.log(`Total changes: ${changes}`);
console.log('');
console.log(`✅ Output: ${outPath}`);
console.log('═══════════════════════════════════════════════════════════════');
