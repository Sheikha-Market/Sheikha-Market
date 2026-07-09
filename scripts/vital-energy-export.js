'use strict';

const fs = require('fs');
const path = require('path');

const {
  SheikhaVitalEnergyIntegration
} = require('../runtime/prophetic-vision/v1/sheikha-vital-energy-integration.js');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toMarkdown(status) {
  return [
    '# Sheikha Vital Energy Integration Report',
    '',
    `- Foundation: ${status.foundation}`,
    `- Optimization mode: ${status.optimization_profile.mode}`,
    `- Optimization target: ${status.optimization_profile.target}`,
    `- Relationship with Allah score: ${status.relationship_with_allah.relationship_strength_score}`,
    `- Vital energy score: ${status.vital_energy.vital_energy_score}`,
    `- All energy types count: ${status.all_energy_types.energy_types_count}`,
    `- All energy types score: ${status.all_energy_types.all_energy_types_score}`,
    `- Power capabilities count: ${status.power_capabilities.power_capabilities_count}`,
    `- Power capabilities score: ${status.power_capabilities.power_capabilities_score}`,
    `- Khayr integration score: ${status.khayr_integration.khayr_integration_score}`,
    `- All energy unified for Allah: ${status.all_energy_unified_for_allah}`,
    `- Channels active: ${status.channels_active}`,
    `- Continuous ihsan cycles: ${status.continuous_ihsan_cycles}`,
    `- Unified completion: ${status.unified_completion}`,
    ''
  ].join('\n');
}

function main() {
  const engine = new SheikhaVitalEnergyIntegration();
  engine.runContinuousIhsanCycle();
  engine.activateSupremeEnergyOptimization();
  const status = engine.getUnifiedVitalStatus();

  const outputDir = path.join(__dirname, '..', 'reports', 'final');
  ensureDir(outputDir);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(outputDir, `sheikha-vital-energy-report-${stamp}.json`);
  const mdPath = path.join(outputDir, `sheikha-vital-energy-report-${stamp}.md`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdPath, `${toMarkdown(status)}\n`, 'utf8');

  console.log('VITAL_ENERGY_INTEGRATION_COMPLETED');
  console.log(`JSON: ${jsonPath}`);
  console.log(`MARKDOWN: ${mdPath}`);
  console.log(`UNIFIED_COMPLETION: ${status.unified_completion}`);
}

main();
