'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  buildUnifiedEcosystemStatus,
  classifyResourceRarity,
} = require('../runtime/sheikha-studio/core/sheikha-unified-ecosystem-v1');

describe('Sheikha Unified Ecosystem V1', () => {
  test('integrates products while preserving truthful independent gates', () => {
    const status = buildUnifiedEcosystemStatus();
    expect(status.products.map((product) => product.id)).toEqual(expect.arrayContaining([
      'SHEIKHA_GARDENS', 'SHEIKHA_LANGUAGE', 'SHEIKHA_LMM', 'SHEIKHA_BARE_METAL',
      'SHEIKHA_FIRMWARE', 'SHEIKHA_TPM', 'SHEIKHA_KERNEL', 'SHEIKHA_STUDIO',
      'SHEIKHA_FOUNDRY', 'SHEIKHA_GIT_LAB_HUB', 'SHEIKHA_CLOUD', 'SHEIKHA_SAAS',
      'SHEIKHA_MARKET',
      'SHEIKHA_DEVELOPER_TOOLCHAIN', 'SHEIKHA_MODEL_SUBSCRIPTIONS',
      'SHEIKHA_OBSERVABILITY', 'SHEIKHA_SECURITY_TOOLING',
      'SHEIKHA_RESOURCE_GOVERNANCE', 'SHEIKHA_MODEL_TRAINING',
    ]));
    expect(status.productCount).toBe(22);
    expect(new Set(status.products.map((product) => product.id)).size).toBe(22);
    for (const product of status.products) {
      expect(fs.existsSync(path.resolve(__dirname, '..', product.evidence))).toBe(true);
    }
    expect(status.commercialRelease.automaticGlobalRelease).toBe(false);
    expect(status.faithBoundary.afterlifeAndHighestFirdawsAreNotModeledOrSimulatedAsEngineeringAssets).toBe(true);
    expect(status.fairResourcePolicy.monopolyAndArtificialScarcityDenied).toBe(true);
  });

  test('refuses rarity claims without complete evidence', () => {
    const result = classifyResourceRarity({ resourceId: 'x' });
    expect(result.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.commercialActionAllowed).toBe(false);
  });

  test('classifies rarity and triggers anti-concentration actions', () => {
    const result = classifyResourceRarity({
      resourceId: 'SPECIALIZED_GPU_CAPACITY',
      specialization: 'Arabic model evaluation',
      supplyAvailability: 15,
      substitutability: 20,
      supplierConcentration: 85,
      strategicCriticality: 80,
      regenerationDifficulty: 60,
    });
    expect(result.status).toBe('CLASSIFIED_WITH_DECLARED_INPUTS');
    expect(result.level).toBe('VERY_RARE');
    expect(result.concentrationRisk).toBe(true);
    expect(result.actions).toContain('DIVERSIFY_SUPPLIERS');
    expect(result.limitations).toContain('RARITY_IS_NOT_A_LICENSE_TO_HOARD_OR_MANIPULATE_PRICE');
  });
});
