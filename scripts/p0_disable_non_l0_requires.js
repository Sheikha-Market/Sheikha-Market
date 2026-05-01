#!/usr/bin/env node
// بسم الله الرحمن الرحيم
// P0-1 Disable Non-L0 Requires (Comment-out) — تنفيذ L0-only عند Startup
// المرجع: SHEIKHA-TAWHEED-OPERATING-MODEL-ROOT.md + config/engines-jawami-final.json

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const serverPath = path.join(ROOT, 'server.js');
const outPath = path.join(ROOT, 'server.js.p0_l0_only.new');
const jawamiFinalPath = path.join(ROOT, 'config', 'engines-jawami-final.json');

function mustRead(p) {
  if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`);
  return fs.readFileSync(p, 'utf8');
}

const server = mustRead(serverPath);
const jawamiFinal = JSON.parse(mustRead(jawamiFinalPath));

const l0 = new Set(jawamiFinal?.tiers?.l0_critical?.engines || []);
const blocked = new Set(jawamiFinal?.tiers?.blocked?.engines || []);
const l1 = new Set(jawamiFinal?.tiers?.l1_important?.engines || []);
const l2 = new Set(jawamiFinal?.tiers?.l2_advanced?.engines || []);

// Regex يلتقط 3 أنماط:
// 1) const X = require('./lib/file.js');
// 2) const {a} = require('./lib/file.js');
// 3) require('./lib/file.js');
const REQUIRE_RE =
  /^([ \t]*)(?:(const|let|var)[ \t]+([^=;]+?)[ \t]*=[ \t]*)?require\(['"]\.\/lib\/([^'"]+)['"]\)[ \t]*;?[ \t]*$/gm;

// عدّادات
let l0Kept = 0;
let lazyDisabled = 0;
let blockedDisabled = 0;
let unknownDisabled = 0;

const out = server.replace(REQUIRE_RE, (full, indent, declKw, lhs, engineFile) => {
  const rawLine = full.trim();

  // blocked
  if (blocked.has(engineFile)) {
    blockedDisabled++;
    return (
      `${indent}// P0-1: BLOCKED (ملف مفقود/محظور) - ${engineFile}\n` +
      `${indent}// ${rawLine}`
    );
  }

  // L0 keep
  if (l0.has(engineFile)) {
    l0Kept++;
    return full; // يبقى كما هو
  }

  // L1/L2/Unknown -> تعليق كامل
  const tier = l1.has(engineFile) ? 'L1' : l2.has(engineFile) ? 'L2' : 'UNKNOWN';
  if (tier === 'UNKNOWN') unknownDisabled++;
  else lazyDisabled++;

  return (
    `${indent}// P0-1: LAZY-DISABLED (${tier}) - ${engineFile}\n` +
    `${indent}// ${rawLine}\n` +
    `${indent}console.log('⏸️ [LAZY] ${engineFile} — سيُحمّل عند الطلب');`
  );
});

fs.writeFileSync(outPath, out, 'utf8');

// قياسات سريعة "بالمنطق الصحيح":
// - requires الفعّالة = أسطر require غير المعلّقة
function countActiveRequires(text) {
  const lines = text.split('\n');
  let c = 0;
  let inBlock = false;
  for (const line of lines) {
    const s = line.trim();
    if (s.includes('/*')) inBlock = true;
    if (!inBlock) {
      if (/^\s*require\(['"]\.\/lib\//.test(line) || /=\s*require\(['"]\.\/lib\//.test(line)) c++;
    }
    if (s.includes('*/')) inBlock = false;
  }
  return c;
}

const activeRequires = countActiveRequires(out);
const lazyMarkers = (out.match(/\[LAZY\]/g) || []).length;
const blockedMarkers = (out.match(/P0-1:\s*BLOCKED/g) || []).length;

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ P0-1 RESULT (server.js -> server.js.p0_l0_only.new)');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`Active requires (approx): ${activeRequires}`);
console.log(`L0 kept:                 ${l0Kept}`);
console.log(`LAZY disabled (L1/L2):   ${lazyDisabled}`);
console.log(`UNKNOWN disabled:        ${unknownDisabled}`);
console.log(`BLOCKED disabled:        ${blockedDisabled}`);
console.log(`LAZY markers:            ${lazyMarkers}`);
console.log(`BLOCKED markers:         ${blockedMarkers}`);
console.log('───────────────────────────────────────────────────────────────');
console.log(`✅ Output file: ${outPath}`);
console.log('═══════════════════════════════════════════════════════════════');
