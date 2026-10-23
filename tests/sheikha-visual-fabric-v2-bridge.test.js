'use strict';

const {
  buildDrawingMotionV2BridgeStatus,
  buildPossibilityPlan,
} = require('../runtime/sheikha-studio/core/sheikha-visual-fabric-v2-bridge');

describe('Sheikha Visual Fabric V2 Apex bridge', () => {
  test('integrates the V2 source and executes deterministic self-tests', () => {
    const status = buildDrawingMotionV2BridgeStatus();
    expect(status).toMatchObject({
      status: 'SOURCE_INTEGRATED_LOCAL_RUNTIME_AVAILABLE',
      sourceComplete: true,
      selfTestPassed: true,
      dimensions: ['2D', '3D', '4D', '5D'],
      integrations: {
        apex: true,
        sheikhaLanguage: true,
        gardensFarmsPastures: true,
        localSvgAndPngRenderer: true,
      },
      claims: { alive: false, conscious: false, universalRarityProven: false },
    });
    expect(status.selfTest.square.area).toBe(16);
    expect(status.selfTest.house.baseArea).toBe(80);
    expect(status.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test('turns a concrete beneficial goal into a bounded measurable plan', () => {
    const plan = buildPossibilityPlan({
      goal: 'إنشاء مخطط منزل ميسر الحركة',
      beneficiary: 'مستخدم كرسي متحرك',
      measurableOutcome: 'مسار خال من العوائق بعرض 120 سم',
      constraints: 'مساحة 160 متر مربع',
    });
    expect(plan.status).toBe('BOUNDED_PLAN_READY');
    expect(plan.stages).toContain('TEST_WITH_INTENDED_BENEFICIARY');
    expect(plan.execution.performed).toBe(false);
  });

  test('does not promise outcomes for an undefined dream', () => {
    expect(buildPossibilityPlan({ goal: 'حقق كل شيء' })).toMatchObject({
      status: 'REQUIRE_CONCRETE_GOAL_BENEFICIARY_AND_MEASURE',
      stages: [],
    });
  });
});
