'use strict';

const {
  buildRealityTwin,
  buildSheikha360Status,
} = require('../runtime/sheikha-studio/core/sheikha-360-reality-bridge-v1');

describe('Sheikha 360 reality bridge', () => {
  test('builds an evidence-bound plan without claiming physical execution', () => {
    const result = buildRealityTwin({
      name: 'مزرعة شيخة التجريبية',
      environment: 'AGRICULTURAL',
      expectedObservationCount: 2,
      observations: [{
        metric: 'soil_moisture', value: 31.2, unit: '%', source: 'sensor-7',
        observedAt: '2026-09-02T08:00:00Z', uncertainty: 0.4, calibrated: true,
      }],
    });
    expect(result.status).toBe('REALITY_TWIN_PLAN_READY_NOT_CONNECTED');
    expect(result.executionAllowed).toBe(false);
    expect(result.plan.observations).toHaveLength(1);
    expect(result.boundaries.modelIsNotReality).toBe(true);
    expect(result.plan.fidelity).toMatchObject({
      score: 85,
      level: 'SUBSTANTIAL_MEASURED_MODEL',
      claim: 'MEASURED_MODEL_FIDELITY_NOT_ABSOLUTE_TRUTH',
    });
  });

  test('fails closed on missing evidence and unseen or creation claims', () => {
    expect(buildRealityTwin({ name: 'site', environment: 'BUILT' }).status).toBe('EVIDENCE_REQUIRED');
    expect(buildRealityTwin({ name: 'محاكاة الغيب', environment: 'ASTRONOMICAL_OBSERVED' }).status).toBe('SCOPE_DENIED');
  });

  test('publishes an explicit engineering boundary', () => {
    const status = buildSheikha360Status();
    expect(status.supportedEnvironments).toContain('ASTRONOMICAL_OBSERVED');
    expect(status.principle).toBe('OBSERVE_MODEL_CALCULATE_VERIFY_WITHOUT_CREATION_OR_UNSEEN_CLAIMS');
    expect(status.creationStatement).toContain('ALLAH_IS_THE_CREATOR');
    expect(status.aqtarDefinition).toBe('DECLARED_MEASURABLE_PHYSICAL_DOMAINS_ONLY');
  });
});
