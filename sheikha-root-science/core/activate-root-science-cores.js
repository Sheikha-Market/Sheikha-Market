#!/usr/bin/env node
'use strict';

/**
 * activate-root-science-cores.js
 * محرك تفعيل الخلايا العصبية الجذرية لأساسيات الحاسب والعلوم والذكاء الاصطناعي
 * Sheikha Root Science Neural Cells Activation Engine
 */

const fs = require('fs');
const path = require('path');

const CORES_DIR = path.join(__dirname);

const DOMAINS = {
  computing: 'computing-root-neural-cells.json',
  sciences: 'sciences-root-neural-cells.json',
  ai: 'ai-root-neural-cells.json',
};

function loadCore(domainKey) {
  const filePath = path.join(CORES_DIR, DOMAINS[domainKey]);
  if (!fs.existsSync(filePath)) {
    throw new Error(`[MISSING] ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function printDomainReport(domainKey, data) {
  const totalCells = data.totalCells || data.summary?.total || 0;
  const layerCount = Object.keys(data.layers || {}).length;

  console.log(`\n${'═'.repeat(65)}`);
  console.log(`  ✅ [${domainKey.toUpperCase()}] ${data.domain}`);
  console.log(`${'═'.repeat(65)}`);
  console.log(`  الأساس     : ${data.foundation}`);
  console.log(`  الحالة     : ${data.status}`);
  console.log(`  الخلايا    : ${totalCells} خلية عصبية جذرية`);
  console.log(`  الطبقات    : ${layerCount} طبقة`);

  if (data.islamicAlignment) {
    console.log(`  التوافق    : ${data.islamicAlignment.principle}`);
  }

  console.log(`\n  [ الطبقات ]`);
  for (const [layerKey, layer] of Object.entries(data.layers || {})) {
    const cellCount = Array.isArray(layer.cells) ? layer.cells.length : 0;
    console.log(`    • ${layerKey.padEnd(12)} — ${layer.name} (${cellCount} خلايا)`);
  }

  if (data.summary) {
    const { total, ...rest } = data.summary;
    const layerSummary = Object.entries(rest)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
    console.log(`\n  [ ملخص ] ${layerSummary}`);
    console.log(`  [ المجموع ] ${total} خلية`);
  }
}

function printStatus(domains) {
  console.log(`\n${'━'.repeat(65)}`);
  console.log('  🧬 حالة الخلايا العصبية الجذرية — Root Neural Cells Status');
  console.log(`${'━'.repeat(65)}`);
  let totalAll = 0;
  for (const [key, filename] of Object.entries(DOMAINS)) {
    const filePath = path.join(CORES_DIR, filename);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const total = data.totalCells || data.summary?.total || 0;
      totalAll += total;
      console.log(`  ✅  ${key.padEnd(12)} | ${total} خلية | ${data.status || 'ACTIVE'}`);
    } else {
      console.log(`  ❌  ${key.padEnd(12)} | غير موجود`);
    }
  }
  console.log(`${'━'.repeat(65)}`);
  console.log(`  📊 إجمالي الخلايا العصبية الجذرية: ${totalAll}`);
  console.log(`${'━'.repeat(65)}\n`);
}

function main() {
  const args = process.argv.slice(2);
  const domainArg = args.find(a => a.startsWith('--domain='));
  const domain = domainArg ? domainArg.split('=')[1] : null;
  const isStatus = args.includes('--status');

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   🧬 شيخة — تفعيل الخلايا العصبية الجذرية للعلوم الأساسية  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  الوقت: ${new Date().toISOString()}`);

  if (isStatus) {
    printStatus(DOMAINS);
    return;
  }

  const toActivate = domain === 'all' || !domain
    ? Object.keys(DOMAINS)
    : [domain];

  for (const key of toActivate) {
    if (!DOMAINS[key]) {
      console.error(`\n  ❌ نطاق غير معروف: ${key}`);
      console.error(`  المتاح: ${Object.keys(DOMAINS).join(', ')}, all`);
      process.exit(1);
    }
    const data = loadCore(key);
    printDomainReport(key, data);
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ SHEIKHA_ROOT_SCIENCE_NEURAL_CELLS=ACTIVATED              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  process.exit(0);
}

main();
