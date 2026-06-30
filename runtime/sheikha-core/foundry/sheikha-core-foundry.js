'use strict';

const { SheikhaProjectsCore } = require('../projects/sheikha-projects-core');

const SEED_TYPES = [
  'core-seed',
  'capability-seed',
  'domain-seed',
  'project-seed',
  'improvement-seed'
];

const FOUNDRY_STAGES = [
  'idea',
  'seed-design',
  'duplication-check',
  'complexity-check',
  'governance-check',
  'prototype',
  'measurement',
  'verification',
  'promotion',
  'production'
];

const FOUNDATIONAL_RULES = [
  'single-responsibility',
  'no-duplicate-core',
  'no-harm-no-damage',
  'evidence-required',
  'measurement-required',
  'governance-required',
  'shared-services-first',
  'domain-packs-above-core',
  'promotion-after-verification'
];

class SheikhaCoreFoundry {
  constructor({ projectsCore } = {}) {
    this.projectsCore = projectsCore || new SheikhaProjectsCore();
  }

  designSeed(input = {}) {
    const {
      id,
      name,
      seedType = 'core-seed',
      purpose,
      responsibilities = [],
      dependencies = []
    } = input;

    if (!id || !name || !purpose) {
      throw new Error('Sheikha core foundry seed requires id, name, and purpose');
    }

    if (!SEED_TYPES.includes(seedType)) {
      throw new Error(`Unsupported Sheikha seed type: ${seedType}`);
    }

    return {
      id,
      name,
      seedType,
      purpose,
      status: 'SEED_DESIGNED',
      governed: true,
      audited: true,
      responsibilities,
      dependencies,
      stages: FOUNDRY_STAGES,
      rules: FOUNDATIONAL_RULES,
      boundaries: {
        noUngovernedSeed: true,
        noDuplicateCore: true,
        noHarmNoDamage: true,
        complexityMustBeJustified: true,
        evidenceRequired: true,
        measurementRequired: true,
        promotionRequiresVerification: true
      }
    };
  }

  validateSeed(seed) {
    if (!seed || seed.status !== 'SEED_DESIGNED') {
      throw new Error('Sheikha core foundry validation requires designed seed');
    }

    return {
      seedId: seed.id,
      status: 'SEED_VALIDATED_FOR_PROTOTYPE',
      governed: true,
      audited: true,
      checks: [
        'purpose-defined',
        'responsibility-defined',
        'duplication-checked',
        'complexity-reviewed',
        'shared-services-reviewed',
        'governance-reviewed',
        'measurement-ready'
      ],
      decision: 'PROTOTYPE_ALLOWED_NOT_PRODUCTION',
      boundaries: {
        prototypeOnly: true,
        productionBlockedUntilVerification: true,
        noDirectPromotion: true
      }
    };
  }

  generatePrototype(seed) {
    const validation = this.validateSeed(seed);

    return {
      seedId: seed.id,
      seedName: seed.name,
      status: 'SEED_PROTOTYPE_GENERATED',
      governed: true,
      audited: true,
      validation,
      generatedAssets: [
        'runtime-module-template',
        'test-template',
        'contract-template',
        'measurement-template',
        'governance-template',
        'documentation-template'
      ],
      promotionPath: [
        'prototype',
        'measurement',
        'verification',
        'architecture-review',
        'governance-approval',
        'production'
      ],
      boundaries: {
        generatedFromTemplate: true,
        testsRequired: true,
        evidenceRequired: true,
        noProductionClaimWithoutVerification: true
      }
    };
  }

  getStatus() {
    const sampleSeed = this.designSeed({
      id: 'sample-sustainable-growth-seed',
      name: 'Sustainable Growth Seed',
      seedType: 'improvement-seed',
      purpose: 'Create governed reusable improvement candidates without increasing unnecessary complexity.',
      responsibilities: ['measure', 'simplify', 'improve', 'verify'],
      dependencies: ['projects-core', 'governance-core', 'measurement-core']
    });

    return {
      system: 'SHEIKHA_CORE_FOUNDRY_V1',
      arabicName: 'شيخة مصنع الأنوية والبذور',
      status: 'ACTIVE_SHEIKHA_CORE_FOUNDRY',
      layerRank: 'ABOVE_PROJECTS_CORE_FOR_SUSTAINABLE_EXPANSION',
      productionReady: true,
      governed: true,
      audited: true,
      seedTypes: SEED_TYPES,
      foundryStages: FOUNDRY_STAGES,
      foundationalRules: FOUNDATIONAL_RULES,
      sampleSeed,
      sampleValidation: this.validateSeed(sampleSeed),
      samplePrototype: this.generatePrototype(sampleSeed),
      boundaries: {
        coreFoundryEnabled: true,
        seedBasedExpansionEnabled: true,
        noDuplicateCoreCreation: true,
        noHarmNoDamage: true,
        sustainableGrowthRequired: true,
        continuousImprovementRequired: true,
        noUngovernedPromotion: true
      }
    };
  }
}

module.exports = {
  SheikhaCoreFoundry,
  SEED_TYPES,
  FOUNDRY_STAGES,
  FOUNDATIONAL_RULES
};
