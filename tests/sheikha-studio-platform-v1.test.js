'use strict';

const {
  SheikhaStudioPlatform,
  STUDIO_SURFACES,
  LANGUAGE_PLATFORM_FEATURES,
  SUPPORTED_LSP_LANGUAGES,
  PROJECT_TEMPLATES,
  STUDIO_VISUAL_DESIGNERS,
  DEPLOYMENT_TARGETS
} = require('../runtime/sheikha-studio/platform/sheikha-studio-platform');

test('activates Sheikha Studio platform above full IDE layer', () => {
  const studio = new SheikhaStudioPlatform();
  const status = studio.getStatus();

  expect(status.status).toBe('ACTIVE_SHEIKHA_STUDIO_PLATFORM');
  expect(status.layerRank).toBe('ABOVE_FULL_IDE_OPERATING_LAYER');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.surfaces).toHaveLength(STUDIO_SURFACES.length);
  expect(status.languageFeatures).toHaveLength(LANGUAGE_PLATFORM_FEATURES.length);
  expect(status.lspLanguages).toHaveLength(SUPPORTED_LSP_LANGUAGES.length);
  expect(status.projectTemplates).toHaveLength(PROJECT_TEMPLATES.length);
  expect(status.visualDesigners).toHaveLength(STUDIO_VISUAL_DESIGNERS.length);
  expect(status.deploymentTargets).toHaveLength(DEPLOYMENT_TARGETS.length);

  expect(status.marketplace.status).toBe('STUDIO_MARKETPLACE_READY');
  expect(status.boundaries.allLspLanguagesReady).toBe(true);
  expect(status.boundaries.allDesignersNoLivingBeingImages).toBe(true);
});

test('creates governed project templates and deployment targets', () => {
  const studio = new SheikhaStudioPlatform();

  const template = studio.createProjectTemplate('marketplace');
  const deployment = studio.activateDeploymentTarget('vps');

  expect(template.status).toBe('PROJECT_TEMPLATE_READY');
  expect(template.includes).toContain('integration-contracts');
  expect(template.includes).toContain('initial-tests');

  expect(deployment.status).toBe('DEPLOYMENT_TARGET_READY');
  expect(deployment.checks).toContain('health');
  expect(deployment.checks).toContain('rollback');
  expect(deployment.boundaries.noLiveClaimWithoutEvidence).toBe(true);
});

test('activates language and LSP support', () => {
  const studio = new SheikhaStudioPlatform();

  const parser = studio.activateLanguageFeature('parser');
  const sheikha = studio.activateLspLanguage('sheikha');
  const python = studio.activateLspLanguage('python');

  expect(parser.status).toBe('LANGUAGE_PLATFORM_FEATURE_READY');
  expect(parser.supportsSheikhaLanguage).toBe(true);

  expect(sheikha.status).toBe('LSP_LANGUAGE_READY');
  expect(python.capabilities).toContain('completion');
});

test('rejects unsupported studio elements', () => {
  const studio = new SheikhaStudioPlatform();

  expect(() => studio.activateSurface('unknown-surface'))
    .toThrow('Unsupported Sheikha Studio surface');

  expect(() => studio.activateLanguageFeature('unknown-feature'))
    .toThrow('Unsupported Sheikha language platform feature');

  expect(() => studio.activateLspLanguage('unknown-language'))
    .toThrow('Unsupported Sheikha LSP language');

  expect(() => studio.createProjectTemplate('unknown-template'))
    .toThrow('Unsupported Sheikha project template');

  expect(() => studio.activateDesigner('unknown-designer'))
    .toThrow('Unsupported Sheikha Studio designer');

  expect(() => studio.activateDeploymentTarget('unknown-target'))
    .toThrow('Unsupported Sheikha deployment target');
});
