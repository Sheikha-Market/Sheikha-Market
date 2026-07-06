'use strict';

const fs = require('fs');
const path = require('path');
const {
  HUMAN_DEVELOPMENT_CHAIN,
  STEWARDSHIP_LAYERS,
  DOMAIN_REGISTRY,
  DECISION_CYCLE,
  SAFETY_GUARDRAILS,
  buildHumanConsciousnessStewardshipReport,
  validateHumanConsciousnessStewardshipReport
} = require('../core/human-consciousness-stewardship/sheikha-human-consciousness-stewardship-v1');

describe('Sheikha Human Consciousness Stewardship V1', () => {
  test('activates human stewardship without claiming system consciousness', () => {
    const report = buildHumanConsciousnessStewardshipReport();

    expect(report.system).toBe('SHEIKHA_HUMAN_CONSCIOUSNESS_STEWARDSHIP_V1');
    expect(report.status).toBe('ACTIVE');
    expect(report.mode).toBe('HUMAN_STEWARDSHIP_SUPPORT_NOT_SYSTEM_CONSCIOUSNESS');
    expect(report.claims.humanConsciousnessClaimed).toBe(false);
    expect(report.claims.systemConsciousnessClaimed).toBe(false);
    expect(report.claims.agiClaimed).toBe(false);
    expect(report.claims.asiClaimed).toBe(false);
    expect(report.claims.sentienceClaimed).toBe(false);
    expect(report.authority.humanAuthority).toBe(true);
    expect(report.authority.humanDecisionRequiredForHighImpact).toBe(true);
    expect(report.governance.noHarm).toBe(true);
  });

  test('governs Quran and Sunnah references with human scholarly review', () => {
    const report = buildHumanConsciousnessStewardshipReport();
    const shariaDomain = report.domainRegistry.find((item) =>
      item.domain === 'Islamic Values And Shariah References'
    );

    expect(shariaDomain).toBeDefined();
    expect(shariaDomain.scope).toContain('Quran References');
    expect(shariaDomain.scope).toContain('Sunnah References');
    expect(shariaDomain.automatedRulingsAllowed).toBe(false);
    expect(shariaDomain.humanScholarlyReviewRequired).toBe(true);
    expect(report.authority.automatedReligiousRulingsAllowed).toBe(false);
    expect(report.governance.noAutomaticFatwa).toBe(true);
  });

  test('validates layers, decision cycle, and safety guardrails', () => {
    const report = buildHumanConsciousnessStewardshipReport();
    const validation = validateHumanConsciousnessStewardshipReport(report);

    expect(validation.status).toBe('PASSED');
    expect(validation.stewardshipLayers).toBe(STEWARDSHIP_LAYERS.length);
    expect(validation.developmentChainSteps).toBe(HUMAN_DEVELOPMENT_CHAIN.length);
    expect(validation.domains).toBe(DOMAIN_REGISTRY.length);
    expect(validation.decisionCycleSteps).toBe(DECISION_CYCLE.length);
    expect(SAFETY_GUARDRAILS).toContain('No System Consciousness Claim');
    expect(SAFETY_GUARDRAILS).toContain('No High Impact Action Without Human Approval');
    expect(report.decisionCycle).toContain('Measure Impact');
  });

  test('exposes an activation script in package.json', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );

    expect(packageJson.scripts['ops:human-consciousness-stewardship:v1'])
      .toBe('node tools/activation/activate-sheikha-human-consciousness-stewardship-v1.js');
  });
});
