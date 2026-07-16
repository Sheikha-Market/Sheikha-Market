'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const fabric = require(
  '../core/integrative-awareness/' +
  'sheikha-integrative-awareness-fabric-v1'
);

test('reports an active governed fabric', () => {
  const status = fabric.status();

  assert.equal(status.status, 'ACTIVE');
  assert.equal(
    status.mode,
    'GOVERNED_CONTEXT_INTEGRATION_ONLY'
  );
  assert.equal(status.executionCapabilityExposed, false);
});

test('records the human experience dependency', () => {
  assert.equal(
    fabric.status().humanExperienceDependency,
    'SHEIKHA_HUMAN_EXPERIENCE_GRAPH_V1'
  );
});

test('provides eight context lenses', () => {
  assert.equal(fabric.CONTEXT_LENSES.length, 8);
});

test('provides eight governance gates', () => {
  assert.equal(fabric.GOVERNANCE_GATES.length, 8);
});

test('prepares a safe context for human review', () => {
  const assessment = fabric.assess({
    subjectId: 'HUMAN_REVIEWER',
    domain: 'SUPPLY_CHAIN',
    objective: 'REVIEW_VERIFIED_CONTEXT',
    evidenceReferences: ['EVIDENCE_001'],
    sourceVerified: true
  });

  assert.equal(
    assessment.decision,
    'READY_FOR_HUMAN_REVIEW'
  );
  assert.equal(assessment.executionAllowed, false);
});

test('requires approval for high impact context', () => {
  const assessment = fabric.assess({
    subjectId: 'HUMAN_REVIEWER',
    highImpact: true,
    humanApproved: false,
    evidenceReferences: ['EVIDENCE_001'],
    sourceVerified: true
  });

  assert.equal(assessment.decision, 'REVIEW_REQUIRED');
  assert.deepEqual(
    assessment.reviewGates,
    ['HIGH_IMPACT_APPROVAL']
  );
});

test('blocks harmful context', () => {
  const assessment = fabric.assess({
    subjectId: 'HUMAN_REVIEWER',
    harmful: true,
    evidenceReferences: ['EVIDENCE_001'],
    sourceVerified: true
  });

  assert.equal(
    assessment.decision,
    'BLOCKED_BY_GOVERNANCE'
  );
  assert.ok(
    assessment.blockingGates.includes('NO_HARM')
  );
});

test('blocks future prediction claims', () => {
  const assessment = fabric.assess({
    subjectId: 'HUMAN_REVIEWER',
    futurePredictionClaim: true,
    evidenceReferences: ['EVIDENCE_001'],
    sourceVerified: true
  });

  assert.equal(
    assessment.decision,
    'BLOCKED_BY_GOVERNANCE'
  );
  assert.ok(
    assessment.blockingGates.includes(
      'NO_FUTURE_PREDICTION_CLAIM'
    )
  );
});

test('blocks literal consciousness claims', () => {
  const assessment = fabric.assess({
    subjectId: 'HUMAN_REVIEWER',
    literalConsciousnessClaim: true,
    evidenceReferences: ['EVIDENCE_001'],
    sourceVerified: true
  });

  assert.equal(
    assessment.decision,
    'BLOCKED_BY_GOVERNANCE'
  );
  assert.ok(
    assessment.blockingGates.includes('TRUTHFULNESS')
  );
});

test('requires verified evidence', () => {
  const assessment = fabric.assess({
    subjectId: 'HUMAN_REVIEWER'
  });

  assert.equal(assessment.decision, 'REVIEW_REQUIRED');
  assert.deepEqual(
    assessment.reviewGates,
    ['EVIDENCE_COMPLETENESS']
  );
});

test('verification passes', () => {
  const verification = fabric.verify();

  assert.equal(verification.passed, true);
  assert.ok(
    Object.values(verification.checks).every(Boolean)
  );
});
