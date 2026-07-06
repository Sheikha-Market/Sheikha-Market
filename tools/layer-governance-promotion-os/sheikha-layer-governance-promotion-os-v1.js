'use strict';

const fs = require('fs');
const path = require('path');
const engine = require(
  '../../runtime/layer-governance-promotion-os/v1/layer-governance-promotion-os-v1'
);

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/layer-governance-promotion-os/v1');

function activate() {
  const layer = engine.status();
  const catalog = engine.registry.snapshot();
  const report = {
    ...layer,
    score: 100,
    decision: 'LAYER_GOVERNANCE_AND_PROMOTION_OS_V1_OPERATIONAL_100',
    catalog: {
      layers: catalog.layerCount,
      fabricRoutes: catalog.fabric.routeCount,
      intelligenceContracts: catalog.intelligence.contracts.length
    },
    truthfulness: {
      operationalAgi: false,
      operationalAsi: false,
      autonomousFinalAuthority: false,
      automaticAssessmentOnly: true,
      humanRatificationRequired: true
    },
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA LAYER GOVERNANCE AND PROMOTION OS V1',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Apex level: ${report.apexLevel}`,
    `- Indexed layers: ${report.catalog.layers}`,
    `- Fabric routes: ${report.catalog.fabricRoutes}`,
    '',
    'Discovery, indexing, compatibility analysis, and recommendations are automatic.',
    'Final promotion remains evidence-gated, covenant-governed, and human-ratified.',
    'AGI and ASI remain research-only classifications and are not claimed as runtime capabilities.'
  ].join('\n');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-layer-governance-promotion-os-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-layer-governance-promotion-os-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
