'use strict';

const {
  CULTIVATION_STAGES,
  buildIntegratedHabitatBlueprint,
  buildHabitatResourceBalance,
  buildHabitatPhases,
  buildWorldlyCosmicScope,
  buildWorldlyEngineeringPlan,
  evaluatePlot,
  buildCultivationSystem
} = require(
  '../core/gardens-dialogue/sheikha-pastures-orchards-cultivation-runtime-v1'
);

describe('Sheikha pastures and orchards cultivation runtime V1', () => {
  test('defines a complete cultivation lifecycle', () => {
    expect(CULTIVATION_STAGES).toHaveLength(8);
    expect(CULTIVATION_STAGES[0]).toBe('SOIL_PREPARATION');
    expect(CULTIVATION_STAGES.at(-1)).toBe('CONTROLLED_PROPAGATION');
  });

  test('blocks unknown rights before entering the nursery', () => {
    const plot = evaluatePlot({
      id: 'UNKNOWN_SEED',
      owner: 'OWNER',
      path: 'LICENSED_TRANSPLANT',
      harmReviewPassed: true,
      successMetric: 'MEASURED_VALUE'
    });

    expect(plot.nursery.ready).toBe(false);
    expect(plot.nursery.blockers).toContain('RIGHTS_AND_LICENSE_REQUIRED');
    expect(plot.nursery.blockers).toContain('PROVENANCE_REQUIRED');
  });

  test('allows experimentation but not harvest without evidence', () => {
    const plot = evaluatePlot({
      id: 'VALID_SEED',
      owner: 'OWNER',
      path: 'SEED_FROM_SCRATCH',
      rightsVerified: true,
      provenanceVerified: true,
      harmReviewPassed: true,
      successMetric: 'MEASURED_VALUE'
    });

    expect(plot.nursery.ready).toBe(true);
    expect(plot.harvest.ready).toBe(false);
    expect(plot.propagation.allowed).toBe(false);
  });

  test('allows controlled propagation only after every gate', () => {
    const system = buildCultivationSystem([{
      id: 'PROVEN_FRUIT',
      owner: 'OWNER',
      path: 'GOVERNED_GRAFT',
      rightsVerified: true,
      provenanceVerified: true,
      harmReviewPassed: true,
      successMetric: 'MEASURED_VALUE',
      qualityEvidence: true,
      deliveryEvidence: true,
      commercial: true,
      commercialApproval: true,
      reproducible: true,
      unitEconomicsVerified: true
    }]);

    expect(system.status).toBe('DIVERSIFIED_CULTIVATION_ACTIVE');
    expect(system.metrics).toEqual({
      totalPlots: 1,
      activePlots: 1,
      harvestReadyPlots: 1,
      propagationReadyPlots: 1
    });
    expect(system.plots[0].propagation.allowed).toBe(true);
  });

  test('keeps eligible plots active while another plot is held', () => {
    const system = buildCultivationSystem([
      {
        id: 'ACTIVE',
        owner: 'OWNER',
        path: 'SEED_FROM_SCRATCH',
        rightsVerified: true,
        provenanceVerified: true,
        harmReviewPassed: true,
        successMetric: 'VALUE'
      },
      { id: 'HELD', path: 'LICENSED_TRANSPLANT' }
    ]);

    expect(system.metrics.activePlots).toBe(1);
    expect(system.continuityPolicy.noGlobalStopForSinglePlot).toBe(true);
    expect(system.continuityPolicy.blockedPlotMayConsumePaidResources).toBe(false);
  });

  test('models a complete worldly habitat without claiming construction', () => {
    const habitat = buildIntegratedHabitatBlueprint();

    expect(habitat.domains).toHaveLength(7);
    expect(habitat.status).toBe('CONCEPT_ONLY_SITE_INPUTS_REQUIRED');
    expect(habitat.boundary.actualJannahClaim).toBe(false);
    expect(habitat.boundary.physicalConstructionExecuted).toBe(false);
    expect(habitat.waterSeparation.potable).not.toBe(
      habitat.waterSeparation.irrigation
    );
    expect(habitat.missingInputs).toContain('WATER_STUDY_REQUIRED');
  });

  test('advances a fully specified habitat to discipline design only', () => {
    const habitat = buildIntegratedHabitatBlueprint({
      siteAreaM2: 100000,
      location: 'DECLARED_SITE',
      populationTarget: 500,
      waterStudy: 'APPROVED_STUDY_REFERENCE',
      soilStudy: 'APPROVED_STUDY_REFERENCE',
      budgetEnvelope: 'APPROVED_ENVELOPE_REFERENCE',
      landRightsVerified: true
    });

    expect(habitat.status).toBe('CONCEPT_READY_FOR_DISCIPLINE_DESIGN');
    expect(habitat.missingInputs).toEqual([]);
    expect(habitat.automaticConstructionAuthorized).toBe(false);
  });

  test('calculates a transparent resource planning scenario', () => {
    const balance = buildHabitatResourceBalance({
      populationTarget: 500,
      siteAreaM2: 100000,
      livestockHeads: 50
    });

    expect(balance.status).toBe('PLANNING_SCENARIO_BALANCED_FOR_AREA_ONLY');
    expect(balance.areasM2.foodOrchardsAndCrops).toBe(25000);
    expect(balance.dailyDemand.domesticWaterLiters).toBe(50000);
    expect(balance.dailyDemand.irrigationWaterLiters).toBe(100000);
    expect(balance.dailyDemand.livestockWaterLiters).toBe(1750);
    expect(balance.dailyDemand.totalWaterWithReserveLiters).toBe(182100);
    expect(balance.engineeringApproved).toBe(false);
  });

  test('rejects an incomplete land balance', () => {
    const balance = buildHabitatResourceBalance({
      populationTarget: 10,
      siteAreaM2: 1000,
      assumptions: {
        landAllocation: { housingAndServices: 0.9 }
      }
    });

    expect(balance.status).toBe('INVALID_PLANNING_INPUT');
    expect(balance.errors).toContain('LAND_ALLOCATION_MUST_EQUAL_ONE');
  });

  test('defines phased construction with independent gates', () => {
    const phases = buildHabitatPhases();

    expect(phases).toHaveLength(7);
    expect(phases[0].id).toBe('H0_BASELINE');
    expect(phases.at(-1).id).toBe('H6_REGENERATIVE_EXPANSION');
    for (const phase of phases) expect(phase.exitGate).toBeTruthy();
  });

  test('separates worldly cosmic planning from the sacred unseen', () => {
    const scope = buildWorldlyCosmicScope();

    expect(scope.status).toBe(
      'TAXONOMY_ONLY_NOT_UNIVERSAL_OPERATIONAL_COVERAGE'
    );
    expect(scope.scopes).toHaveLength(5);
    expect(scope.sacredBoundary.actualJannahSimulationAllowed).toBe(false);
    expect(scope.sacredBoundary.unseenGeometryOrPhysicsInferred).toBe(false);
    expect(scope.sacredBoundary.automatedTafsirOrFatwa).toBe(false);
    expect(scope.sacredBoundary.qualifiedScholarReviewRequired).toBe(true);
    expect(scope.sacredBoundary.references.length).toBeGreaterThan(5);
  });

  test('builds engineering work packages while isolating unseen text', () => {
    const plan = buildWorldlyEngineeringPlan({
      siteAreaM2: 100000,
      location: 'DECLARED_SITE',
      populationTarget: 500,
      livestockHeads: 50
    });

    expect(plan.disciplines).toHaveLength(8);
    expect(plan.stageGates).toHaveLength(6);
    expect(plan.sacredLanguageIsolation.afterlifeTextMayGenerateGeometry)
      .toBe(false);
    expect(plan.sacredLanguageIsolation.afterlifeTextMayGenerateQuantities)
      .toBe(false);
    expect(plan.issuedForConstruction).toBe(false);
    expect(plan.blockers).toContain('WATER_STUDY_REQUIRED');
  });

  test('reaches discipline work only with complete site evidence', () => {
    const plan = buildWorldlyEngineeringPlan({
      siteAreaM2: 100000,
      location: 'DECLARED_SITE',
      populationTarget: 500,
      livestockHeads: 50,
      waterStudy: 'APPROVED_REFERENCE',
      soilStudy: 'APPROVED_REFERENCE',
      budgetEnvelope: 'APPROVED_REFERENCE',
      landRightsVerified: true,
      topographicSurvey: 'APPROVED_REFERENCE',
      hazardStudy: 'APPROVED_REFERENCE',
      authorityHavingJurisdiction: 'DECLARED_AUTHORITY',
      evidenceIndependentlyVerified: true
    });

    expect(plan.status).toBe('ENGINEERING_BASIS_READY_FOR_DISCIPLINE_WORK');
    expect(plan.blockers).toEqual([]);
    expect(plan.physicalExecutionAuthorized).toBe(false);
  });
});
