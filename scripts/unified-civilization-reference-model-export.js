'use strict';

const fs = require('fs');
const path = require('path');

const {
  SheikhaUnifiedCivilizationReferenceModel
} = require('../runtime/prophetic-vision/v1/sheikha-unified-civilization-reference-model.js');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toMarkdown(status) {
  return [
    '# Sheikha Unified Civilization Reference Model',
    '',
    `- Foundation: ${status.foundation}`,
    `- Engines: ${status.engines}`,
    `- Elevated architecture layers: ${status.architecture_layers}`,
    `- Apex architecture active: ${status.apex_architecture_active}`,
    `- Inspector recovery integration active: ${status.inspector_recovery_integration_active}`,
    `- Pillars: ${status.pillars}`,
    `- Governance flow valid: ${status.governance_flow_valid}`,
    `- Claim boundaries valid: ${status.claim_boundaries_valid}`,
    `- Production ready all layers: ${status.production_ready_all_layers}`,
    ''
  ].join('\n');
}

function main() {
  const model = new SheikhaUnifiedCivilizationReferenceModel();

  const company = model.registerEntity('COMPANY', { name: 'Sheikha Industries' });
  const product = model.registerEntity('PRODUCT', { name: 'Copper Cable' });
  model.linkEntities(company.id, 'PRODUCES', product.id);
  model.recordTemporalSnapshot(product.id, 'PRESENT', 'Operational and governed');
  model.registerGeographicModel('CITY', 'Al Khobar');

  const need = model.registerNeed('Reliable industrial supply', 'HIGH');
  model.registerSolution(need.id, 'Verified partner network', ['requires governance audits']);

  model.activateProductionForAllEngines();

  const status = model.getStatus();

  const outputDir = path.join(__dirname, '..', 'reports', 'final');
  ensureDir(outputDir);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(outputDir, `sheikha-unified-civilization-reference-model-${stamp}.json`);
  const mdPath = path.join(outputDir, `sheikha-unified-civilization-reference-model-${stamp}.md`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdPath, `${toMarkdown(status)}\n`, 'utf8');

  console.log('UNIFIED_CIVILIZATION_REFERENCE_MODEL_COMPLETED');
  console.log(`JSON: ${jsonPath}`);
  console.log(`MARKDOWN: ${mdPath}`);
  console.log(`PRODUCTION_READY: ${status.production_ready_all_layers}`);
}

main();
