'use strict';

const fs = require('fs');
const path = require('path');
const {
  CIVILIZATIONAL_ARCHITECTURE,
  CIVILIZATIONAL_DOMAINS,
  CIVILIZATIONAL_LIFECYCLE,
  CIVILIZATIONAL_PRINCIPLES,
  buildCivilizationalOperatingPlatform,
  validateCivilizationalOperatingPlatform
} = require('../core/civilizational-operating-platform/sheikha-civilizational-operating-platform-v1');

describe('Sheikha Civilizational Operating Platform V1', () => {
  test('activates above human stewardship and human development layers', () => {
    const report = buildCivilizationalOperatingPlatform();

    expect(report.system).toBe('SHEIKHA_CIVILIZATIONAL_OPERATING_PLATFORM_V1');
    expect(report.status).toBe('ACTIVE');
    expect(report.mode).toBe('HUMAN_CENTERED_CIVILIZATIONAL_OPERATING_PLATFORM');
    expect(report.linkedLayers.humanConsciousnessStewardship.status).toBe('ACTIVE');
    expect(report.linkedLayers.humanDevelopmentFramework.status).toBe('ACTIVE');
    expect(report.readiness.overall).toBe('CIVILIZATIONAL_OPERATING_PLATFORM_READY');
  });

  test('keeps scientific and engineering boundaries for consciousness and AGI claims', () => {
    const report = buildCivilizationalOperatingPlatform();

    expect(report.claims.systemConsciousnessClaimed).toBe(false);
    expect(report.claims.machineConsciousnessClaimed).toBe(false);
    expect(report.claims.humanConsciousnessCreatedInsideSystem).toBe(false);
    expect(report.claims.agiClaimed).toBe(false);
    expect(report.claims.asiClaimed).toBe(false);
    expect(report.governance.noAutomaticReligiousRuling).toBe(true);
    expect(report.governance.humanApprovalRequiredForHighImpact).toBe(true);
  });

  test('defines the full civilizational architecture and lifecycle', () => {
    const report = buildCivilizationalOperatingPlatform();
    const validation = validateCivilizationalOperatingPlatform(report);

    expect(validation.status).toBe('PASSED');
    expect(report.architecture).toHaveLength(CIVILIZATIONAL_ARCHITECTURE.length);
    expect(report.domainMap).toHaveLength(CIVILIZATIONAL_DOMAINS.length);
    expect(report.lifecycle).toEqual(CIVILIZATIONAL_LIFECYCLE);
    expect(report.principles).toEqual(CIVILIZATIONAL_PRINCIPLES);
    expect(report.domainMap.map((item) => item.domain)).toContain('islamic-sciences-and-governance');
    expect(report.domainMap.map((item) => item.domain)).toContain('cybersecurity');
    expect(report.relations).toHaveLength(CIVILIZATIONAL_ARCHITECTURE.length - 1);
  });

  test('exposes activation scripts in package.json', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );

    expect(packageJson.scripts['ops:human-development-framework:v1'])
      .toBe('node tools/activation/activate-sheikha-human-development-framework-v1.js');
    expect(packageJson.scripts['ops:civilizational-operating-platform:v1'])
      .toBe('node tools/activation/activate-sheikha-civilizational-operating-platform-v1.js');
  });
});
