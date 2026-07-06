'use strict';

const fs = require('fs');
const path = require('path');
const {
  EXPERIENCE_TYPES,
  GOVERNANCE_CONTROLS,
  IMPACT_METRICS,
  buildHumanExperienceGraph,
  validateHumanExperienceGraph
} = require('../core/human-experience-graph/sheikha-human-experience-graph-v1');

describe('Sheikha Human Experience Graph V1', () => {
  test('activates a governed graph of human experiences', () => {
    const report = buildHumanExperienceGraph();

    expect(report.system).toBe('SHEIKHA_HUMAN_EXPERIENCE_GRAPH_V1');
    expect(report.status).toBe('ACTIVE');
    expect(report.mode).toBe('GOVERNED_HUMAN_EXPERIENCE_GRAPH');
    expect(report.decision).toBe('ACTIVE_EXPERIENCE_TO_DOMAIN_GOVERNANCE_IMPACT_GRAPH');
    expect(report.readiness.overall).toBe('HUMAN_EXPERIENCE_GRAPH_READY');
  });

  test('links experiences to domains, governance, and impact metrics', () => {
    const report = buildHumanExperienceGraph();
    const validation = validateHumanExperienceGraph(report);

    expect(validation.status).toBe('PASSED');
    expect(validation.experienceNodes).toBe(EXPERIENCE_TYPES.length);
    expect(validation.governanceNodes).toBe(GOVERNANCE_CONTROLS.length);
    expect(validation.impactNodes).toBe(IMPACT_METRICS.length);
    expect(validation.relationTypes).toContain('CLASSIFIED_AS');
    expect(validation.relationTypes).toContain('GOVERNED_BY');
    expect(validation.relationTypes).toContain('MEASURED_BY');
    expect(validation.edges).toBeGreaterThan(validation.nodes);
  });

  test('keeps human authority and no consciousness claims', () => {
    const report = buildHumanExperienceGraph();

    expect(report.claims.machineConsciousnessClaimed).toBe(false);
    expect(report.claims.selfAwarenessClaimed).toBe(false);
    expect(report.claims.agiClaimed).toBe(false);
    expect(report.claims.asiClaimed).toBe(false);
    expect(report.governance.humanProvidedExperience).toBe(true);
    expect(report.governance.humanApprovalRequiredForHighImpact).toBe(true);
    expect(report.governance.noMachineConsciousnessClaim).toBe(true);
    expect(report.governance.noHarm).toBe(true);
  });

  test('links to the human development and civilization platform layers', () => {
    const report = buildHumanExperienceGraph();

    expect(report.linkedLayers.humanDevelopmentFramework.status).toBe('ACTIVE');
    expect(report.linkedLayers.humanCenteredKnowledgeCivilizationPlatform.status)
      .toBe('ACTIVE');
    expect(report.linkedLayers.humanCenteredKnowledgeCivilizationPlatform.validation)
      .toBe('PASSED');
  });

  test('exposes activation script in package.json', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );

    expect(packageJson.scripts['ops:human-experience-graph:v1'])
      .toBe('node tools/activation/activate-sheikha-human-experience-graph-v1.js');
  });
});
