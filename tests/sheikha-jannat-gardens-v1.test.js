'use strict';

const {
  buildPublicModel,
  buildReport
} = require('../tools/activation/activate-sheikha-jannat-gardens-v1');

describe('Sheikha Jannat Gardens V1', () => {
  test('defines Sheikha gardens as worldly metaphor only', () => {
    const report = buildReport();

    expect(report.worldlyBeautyBoundary.worldlyMetaphorOnly).toBe(true);
    expect(report.worldlyBeautyBoundary.actualJannahClaim).toBe(false);
    expect(report.worldlyBeautyBoundary.unseenRepresentationClaim).toBe(false);
    expect(report.worldlyBeautyBoundary.sacredSimulationClaim).toBe(false);
    expect(report.worldlyBeautyBoundary.equivalentToHereafterJannah).toBe(false);
  });

  test('keeps the Quran Sunnah apex contractless and outside garden graph execution', () => {
    const report = buildReport();

    expect(report.governingApexPolicy.apexContracts).toBe(0);
    expect(report.governingApexPolicy.apexBindings).toBe(0);
    expect(report.governingApexPolicy.apexRuntimeLinks).toBe(0);
    expect(report.gardenGraph.edges.every((edge) => edge.apexEdge === false)).toBe(true);
  });

  test('builds integrated gardens with trees rivers and fruits', () => {
    const report = buildReport();

    expect(report.status).toBe('ACTIVE_WITH_WORLDLY_SHEIKHA_GARDENS');
    expect(report.score).toBe(100);
    expect(report.metrics.gardens).toBeGreaterThanOrEqual(9);
    expect(report.metrics.trees).toBeGreaterThanOrEqual(27);
    expect(report.metrics.rivers).toBeGreaterThanOrEqual(16);
    expect(report.metrics.fruits).toBeGreaterThanOrEqual(24);
    expect(report.gardens.every((garden) => (
      garden.trees.length >= 3 && garden.rivers.length >= 1 && garden.fruits.length >= 3
    ))).toBe(true);
  });

  test('keeps lower garden flows governed by Sheikha language and Sharia contracts', () => {
    const report = buildReport();

    expect(report.rootCovenant.sheikhaLanguageAsRoot).toBe(true);
    expect(report.rootCovenant.governedAiIntegrated).toBe(true);
    expect(report.rootCovenant.islamicGovernance).toBe(true);
    expect(report.gardenGraph.edges.every((edge) => (
      edge.shariaContractRequired && edge.writtenInSheikhaLanguage && edge.metaphoricalRiver
    ))).toBe(true);
  });

  test('publishes a safe public model for UI rendering', () => {
    const report = buildReport();
    const publicModel = buildPublicModel(report);

    expect(publicModel.title).toBe('جنات شيخة');
    expect(publicModel.boundary.actualJannahClaim).toBe(false);
    expect(publicModel.metrics.gardens).toBe(report.metrics.gardens);
    expect(publicModel.gardens.length).toBe(report.gardens.length);
    expect(report.interfaceReadiness.publicModelPath).toBe('public/sheikha-jannat-gardens/sheikha-jannat-gardens-v1.json');
  });
});
