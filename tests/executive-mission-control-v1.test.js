'use strict';

const mission = require('../runtime/executive-mission-control/executive-mission-control-v1');

describe('Sheikha Executive Mission Control V1', () => {
  test('mission control is active above civilization governance', () => {
    const result = mission.status();
    expect(result.system).toBe('SHEIKHA_EXECUTIVE_MISSION_CONTROL_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.above).toBe('SHEIKHA_CIVILIZATION_GOVERNANCE_V2');
    expect(result.boundaries.governanceBeforeCommand).toBe(true);
  });

  test('scorecard produces executive readiness', () => {
    const result = mission.scorecard({ governanceScore: 99, executionScore: 97 });
    expect(result.engine).toBe('SHEIKHA_EXECUTIVE_SCORECARD_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.scores.executiveReadinessScore).toBeGreaterThanOrEqual(90);
  });

  test('evidence fabric is active', () => {
    const result = mission.evidence();
    expect(result.registry).toBe('SHEIKHA_UNIFIED_EVIDENCE_FABRIC_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.evidenceTypes).toContain('audit-events');
  });

  test('portfolio intelligence is active', () => {
    const result = mission.portfolio();
    expect(result.registry).toBe('SHEIKHA_STRATEGIC_PORTFOLIO_INTELLIGENCE_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.portfolioObjects).toContain('initiatives');
  });
});
