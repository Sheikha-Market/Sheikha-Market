'use strict';

const {
  SheikhaUserJourneyFederation,
  JOURNEY_ENGINES,
  JOURNEY_METRICS,
  JOURNEY_STAGES
} = require('../runtime/sheikha-experience-os/user-journey/sheikha-user-journey-federation');

test('activates Sheikha user journey federation above living UX', () => {
  const federation = new SheikhaUserJourneyFederation();
  const status = federation.getStatus();

  expect(status.status).toBe('ACTIVE_USER_JOURNEY_FEDERATION');
  expect(status.layerRank).toBe('ABOVE_LIVING_USER_EXPERIENCE');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.engines).toEqual(JOURNEY_ENGINES);
  expect(status.metrics).toEqual(JOURNEY_METRICS);
  expect(status.stages).toEqual(JOURNEY_STAGES);

  expect(status.sampleJourney.status).toBe('USER_JOURNEY_MAPPED');
  expect(status.sampleEvolution.status).toBe('EXPERIENCE_EVOLUTION_READY');
  expect(status.sampleEvolution.nextIteration.requiresVerification).toBe(true);

  expect(status.boundaries.contextPreservationRequired).toBe(true);
  expect(status.boundaries.evidenceRequiredForImprovement).toBe(true);
});

test('maps governed context-bound user journey', () => {
  const federation = new SheikhaUserJourneyFederation();

  const journey = federation.mapJourney({
    userId: 'user-1',
    goal: 'build-plugin',
    workspace: 'sheikha-ide'
  });

  expect(journey.status).toBe('USER_JOURNEY_MAPPED');
  expect(journey.goal).toBe('build-plugin');
  expect(journey.workspace).toBe('sheikha-ide');
  expect(journey.stages).toHaveLength(JOURNEY_STAGES.length);
  expect(journey.boundaries.noContextEscape).toBe(true);
});

test('detects friction and records safe experience memory', () => {
  const federation = new SheikhaUserJourneyFederation();

  const journey = federation.mapJourney({
    goal: 'complete-marketplace-task',
    workspace: 'marketplace'
  });

  const friction = federation.detectFriction(journey);
  const memory = federation.rememberSuccessfulExperience(journey);

  expect(friction.status).toBe('FRICTION_ANALYSIS_READY');
  expect(friction.measurable).toBe(true);
  expect(memory.status).toBe('EXPERIENCE_MEMORY_RECORDED');
  expect(memory.rememberOnlySuccessfulPatterns).toBe(true);
});

test('rejects incomplete journey definition', () => {
  const federation = new SheikhaUserJourneyFederation();

  expect(() => federation.mapJourney({ goal: 'missing-workspace' }))
    .toThrow('Sheikha user journey requires goal and workspace');
});
