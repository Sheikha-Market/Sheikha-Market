#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  buildCultivationSystem,
  buildHabitatResourceBalance
} = require('../../core/gardens-dialogue/sheikha-pastures-orchards-cultivation-runtime-v1');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT = path.join(
  ROOT,
  'runtime/jannat-gardens/v4/sheikha-pastures-orchards-cultivation-v1.json'
);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

const commercial = readJson(
  'runtime/commercial-sales/v1/sheikha-beneficial-product-portfolio-v1.json'
);
const model = readJson(
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-cidar-v1-promotion-decision.json'
);
const system = readJson(
  'runtime/bare-metal/v2/sheikha-system-kernel-integration-roadmap-v1.json'
);

const report = buildCultivationSystem([
  {
    id: 'COMMERCIAL_PRODUCTS_ORCHARD',
    nameAr: 'جنة المنتجات النافعة',
    owner: 'SHEIKHA_COMMERCIAL_OWNER',
    path: 'SEED_FROM_SCRATCH',
    rightsVerified: true,
    provenanceVerified: true,
    harmReviewPassed: true,
    successMetric: 'SIGNED_PAID_CUSTOMER_AND_VERIFIED_DELIVERY',
    qualityEvidence: true,
    deliveryEvidence: false,
    commercial: true,
    commercialApproval: true,
    reproducible: false,
    unitEconomicsVerified:
      commercial.planningEconomics.diagnosticOnlyBreakEvenUnits === 6
  },
  {
    id: 'ARABIC_MODEL_ORCHARD',
    nameAr: 'جنة النموذج العربي',
    owner: 'SHEIKHA_AI_GOVERNOR',
    path: 'GOVERNED_GRAFT',
    rightsVerified: true,
    provenanceVerified: true,
    harmReviewPassed: true,
    successMetric: 'ARABIC_QUALITY_SAFETY_LATENCY_AND_LICENSE_GATES',
    qualityEvidence: model.status === 'PROMOTION_APPROVED',
    deliveryEvidence: false,
    commercial: true,
    commercialApproval: false,
    reproducible: true,
    unitEconomicsVerified: false
  },
  {
    id: 'SYSTEM_KERNEL_ORCHARD',
    nameAr: 'جنة النظام والنواة',
    owner: 'SHEIKHA_SYSTEM_ENGINEERING',
    path: 'SEED_FROM_SCRATCH',
    rightsVerified: true,
    provenanceVerified: true,
    harmReviewPassed: true,
    successMetric: 'PHYSICAL_BOOT_SAFETY_STRESS_AND_DRIVER_GATES',
    qualityEvidence: system.verified.qemuBoot === true,
    deliveryEvidence: system.notVerified.physicalBoot === false,
    commercial: false,
    reproducible: system.verified.deterministicImage === true,
    unitEconomicsVerified: false
  },
  {
    id: 'LICENSED_KNOWLEDGE_PASTURE',
    nameAr: 'مرعى المعرفة المرخصة',
    owner: 'SHEIKHA_DATA_GOVERNANCE',
    path: 'LICENSED_TRANSPLANT',
    rightsVerified: false,
    provenanceVerified: false,
    harmReviewPassed: true,
    successMetric: 'RIGHTS_PROVENANCE_COVERAGE_AND_RETRIEVAL_QUALITY',
    qualityEvidence: false,
    deliveryEvidence: false,
    commercial: false,
    reproducible: false,
    unitEconomicsVerified: false
  }
]);

report.integratedHabitat.planningExample = buildHabitatResourceBalance({
  populationTarget: 500,
  siteAreaM2: 100000,
  livestockHeads: 50
});

const canonical = `${JSON.stringify(report, null, 2)}\n`;
report.evidence = {
  generatedAt: new Date().toISOString(),
  sourceSha256: crypto.createHash('sha256').update(canonical).digest('hex'),
  sourceStatuses: {
    commercial: commercial.status,
    arabicModel: model.status,
    systemKernel: system.status
  }
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`${OUTPUT}\n`);
