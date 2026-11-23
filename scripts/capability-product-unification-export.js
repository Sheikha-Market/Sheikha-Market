'use strict';

const fs = require('fs');
const path = require('path');

const {
  SheikhaCapabilityProductUnification
} = require('../runtime/prophetic-vision/v1/sheikha-capability-product-unification.js');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toMarkdown(status) {
  return [
    '# Sheikha Capability and Product Unified Model',
    '',
    `- Foundation: ${status.foundation}`,
    `- Quran Sunnah digitalization: ${status.quran_sunnah_digitalization}`,
    `- Unified readiness: ${status.unified_readiness}`,
    `- Commercial energy: ${status.energy_metrics.commercial_energy_score}`,
    `- Non-commercial energy: ${status.energy_metrics.non_commercial_energy_score}`,
    `- Unified energy: ${status.energy_metrics.unified_energy_score}`,
    `- Continuous improvement active: ${status.continuous_improvement_active}`,
    ''
  ].join('\n');
}

function main() {
  const engine = new SheikhaCapabilityProductUnification();
  engine.runContinuousImprovementCycle();
  const status = engine.getStatus();

  const outputDir = path.join(__dirname, '..', 'reports', 'final');
  ensureDir(outputDir);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(outputDir, `sheikha-capability-product-unification-${stamp}.json`);
  const mdPath = path.join(outputDir, `sheikha-capability-product-unification-${stamp}.md`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdPath, `${toMarkdown(status)}\n`, 'utf8');

  console.log('CAPABILITY_PRODUCT_UNIFICATION_COMPLETED');
  console.log(`JSON: ${jsonPath}`);
  console.log(`MARKDOWN: ${mdPath}`);
  console.log(`UNIFIED_READY: ${status.unified_readiness}`);
  console.log(`UNIFIED_ENERGY_SCORE: ${status.energy_metrics.unified_energy_score}`);
}

main();
