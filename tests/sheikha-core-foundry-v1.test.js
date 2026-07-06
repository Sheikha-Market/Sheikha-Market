'use strict';

const {
  SheikhaCoreFoundry,
  SEED_TYPES,
  FOUNDRY_STAGES,
  FOUNDATIONAL_RULES
} = require('../runtime/sheikha-core/foundry/sheikha-core-foundry');

test('activates Sheikha core foundry for governed seeds', () => {
  const foundry = new SheikhaCoreFoundry();
  const status = foundry.getStatus();

  expect(status.status).toBe('ACTIVE_SHEIKHA_CORE_FOUNDRY');
  expect(status.layerRank).toBe('ABOVE_PROJECTS_CORE_FOR_SUSTAINABLE_EXPANSION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.seedTypes).toEqual(SEED_TYPES);
  expect(status.foundryStages).toEqual(FOUNDRY_STAGES);
  expect(status.foundationalRules).toEqual(FOUNDATIONAL_RULES);

  expect(status.sampleSeed.status).toBe('SEED_DESIGNED');
  expect(status.sampleValidation.status).toBe('SEED_VALIDATED_FOR_PROTOTYPE');
  expect(status.samplePrototype.status).toBe('SEED_PROTOTYPE_GENERATED');

  expect(status.boundaries.noDuplicateCoreCreation).toBe(true);
  expect(status.boundaries.noHarmNoDamage).toBe(true);
});

test('designs a governed core seed', () => {
  const foundry = new SheikhaCoreFoundry();

  const seed = foundry.designSeed({
    id: 'operations-optimization-seed',
    name: 'Operations Optimization Seed',
    seedType: 'core-seed',
    purpose: 'Improve operations only after measurement and governance review.',
    responsibilities: ['measure', 'optimize'],
    dependencies: ['operations-core']
  });

  expect(seed.status).toBe('SEED_DESIGNED');
  expect(seed.seedType).toBe('core-seed');
  expect(seed.boundaries.complexityMustBeJustified).toBe(true);
  expect(seed.boundaries.promotionRequiresVerification).toBe(true);
});

test('validates and generates prototype without production promotion', () => {
  const foundry = new SheikhaCoreFoundry();

  const seed = foundry.designSeed({
    id: 'domain-pack-seed',
    name: 'Domain Pack Seed',
    seedType: 'domain-seed',
    purpose: 'Create a reusable domain pack template.',
    responsibilities: ['template', 'measure', 'verify']
  });

  const validation = foundry.validateSeed(seed);
  const prototype = foundry.generatePrototype(seed);

  expect(validation.status).toBe('SEED_VALIDATED_FOR_PROTOTYPE');
  expect(validation.decision).toBe('PROTOTYPE_ALLOWED_NOT_PRODUCTION');
  expect(prototype.status).toBe('SEED_PROTOTYPE_GENERATED');
  expect(prototype.boundaries.noProductionClaimWithoutVerification).toBe(true);
});

test('rejects invalid seeds', () => {
  const foundry = new SheikhaCoreFoundry();

  expect(() => foundry.designSeed({ id: 'x', name: 'bad' }))
    .toThrow('Sheikha core foundry seed requires id, name, and purpose');

  expect(() => foundry.designSeed({
    id: 'x',
    name: 'bad',
    purpose: 'bad',
    seedType: 'unknown-seed'
  })).toThrow('Unsupported Sheikha seed type');

  expect(() => foundry.validateSeed({ status: 'BAD' }))
    .toThrow('Sheikha core foundry validation requires designed seed');
});
