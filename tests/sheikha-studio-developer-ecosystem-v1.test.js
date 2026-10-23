'use strict';

const {
  buildDeveloperEcosystemStatus,
  buildLanguageCatalog,
} = require('../runtime/sheikha-studio/core/sheikha-studio-developer-ecosystem-v1');

describe('Sheikha Studio Developer Ecosystem V1', () => {
  test('integrates IDE, LMM, Git-Lab Hub, SDK, CLI, MCP, and PHP without a production claim', () => {
    const status = buildDeveloperEcosystemStatus();
    const ids = status.surfaces.map((surface) => surface.id);
    expect(ids).toEqual(expect.arrayContaining([
      'SHEIKHA_IDE', 'SHEIKHA_LMM', 'SHEIKHA_GIT_LAB_HUB',
      'SHEIKHA_SDK', 'SHEIKHA_CLI', 'SHEIKHA_MCP', 'SHEIKHA_PHP_TOOLCHAIN',
      'SHEIKHA_VISUAL', 'SHEIKHA_NODE', 'SHEIKHA_DOCKER',
    ]));
    expect(status.productionReady).toBe(false);
    expect(status.highImpactActionsRequireApproval).toBe(true);
  });

  test('credentials presence never asserts an external Git connection', () => {
    const previous = process.env.GITHUB_TOKEN;
    try {
      process.env.GITHUB_TOKEN = 'test-only-placeholder';
      const status = buildDeveloperEcosystemStatus();
      expect(status.externalGitProviderCredentialsPresent).toBe(true);
      expect(status.externalGitProviderLiveConnected).toBe(false);
    } finally {
      if (previous === undefined) delete process.env.GITHUB_TOKEN;
      else process.env.GITHUB_TOKEN = previous;
    }
  });

  test('catalogs languages with explainable rarity and filtering', () => {
    const catalog = buildLanguageCatalog({});
    expect(catalog.totalRegistered).toBeGreaterThanOrEqual(60);
    expect(catalog.methodology.rarityIsQualityRanking).toBe(false);
    expect(catalog.languages).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'PHP' }),
      expect.objectContaining({ name: 'Sheikha', rarity: { tier: 'VERY_RARE', score: 95 } }),
    ]));
    const rare = buildLanguageCatalog({ rarity: 'RARE' });
    expect(rare.languages.every((language) => language.rarity.tier === 'RARE')).toBe(true);
    const php = buildLanguageCatalog({ search: 'php' });
    expect(php.languages.map((language) => language.name)).toEqual(['PHP']);
  });
});
