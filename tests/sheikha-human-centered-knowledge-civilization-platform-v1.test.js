'use strict';

const fs = require('fs');
const path = require('path');
const {
  PLATFORM_PILLARS,
  PLATFORM_SEQUENCE,
  GOVERNED_RECOMMENDATION_FLOW,
  EXECUTION_INTEGRATIONS,
  buildHumanCenteredKnowledgeCivilizationPlatform,
  validateHumanCenteredKnowledgeCivilizationPlatform
} = require('../core/human-centered-knowledge-civilization-platform/sheikha-human-centered-knowledge-civilization-platform-v1');

describe('Sheikha Human Centered Knowledge Civilization Platform V1', () => {
  test('activates the requested human-centered knowledge and civilization platform', () => {
    const report = buildHumanCenteredKnowledgeCivilizationPlatform();

    expect(report.system).toBe('SHEIKHA_HUMAN_CENTERED_KNOWLEDGE_CIVILIZATION_PLATFORM_V1');
    expect(report.status).toBe('ACTIVE');
    expect(report.mode).toBe('HUMAN_CENTERED_KNOWLEDGE_CIVILIZATION_PLATFORM');
    expect(report.decision).toBe('ACTIVE_GOVERNED_HUMAN_KNOWLEDGE_CIVILIZATION_INTEGRATION');
    expect(report.readiness.overall)
      .toBe('HUMAN_CENTERED_KNOWLEDGE_CIVILIZATION_PLATFORM_READY');
  });

  test('links the three supporting human and civilization layers', () => {
    const report = buildHumanCenteredKnowledgeCivilizationPlatform();

    expect(report.linkedLayers.humanDevelopmentFramework.status).toBe('ACTIVE');
    expect(report.linkedLayers.humanConsciousnessStewardship.status).toBe('ACTIVE');
    expect(report.linkedLayers.civilizationalOperatingPlatform.status).toBe('ACTIVE');
    expect(report.linkedLayers.civilizationalOperatingPlatform.validation).toBe('PASSED');
  });

  test('keeps the system a governed tool with human responsibility', () => {
    const report = buildHumanCenteredKnowledgeCivilizationPlatform();

    expect(report.claims.machineConsciousnessClaimed).toBe(false);
    expect(report.claims.selfAwarenessClaimed).toBe(false);
    expect(report.claims.agiClaimed).toBe(false);
    expect(report.claims.asiClaimed).toBe(false);
    expect(report.governance.systemRole).toBe('tool');
    expect(report.governance.humanConsciousnessOwner).toBe('human');
    expect(report.governance.humanApprovalRequiredForHighImpact).toBe(true);
    expect(report.governance.noAutomaticReligiousRuling).toBe(true);
  });

  test('validates pillars, operating sequence, recommendation flow, and integrations', () => {
    const report = buildHumanCenteredKnowledgeCivilizationPlatform();
    const validation = validateHumanCenteredKnowledgeCivilizationPlatform(report);

    expect(validation.status).toBe('PASSED');
    expect(report.pillars).toHaveLength(PLATFORM_PILLARS.length);
    expect(report.platformSequence).toEqual(PLATFORM_SEQUENCE);
    expect(report.governedRecommendationFlow).toEqual(GOVERNED_RECOMMENDATION_FLOW);
    expect(report.executionIntegrations.map((item) => item.integration))
      .toEqual(EXECUTION_INTEGRATIONS);
  });

  test('exposes activation script in package.json', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );

    expect(packageJson.scripts['ops:human-centered-knowledge-civilization-platform:v1'])
      .toBe(
        'node tools/activation/activate-sheikha-human-centered-knowledge-civilization-platform-v1.js'
      );
  });
});
