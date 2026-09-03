'use strict';

const assert = require('node:assert/strict');
const { ugoSchema, createGovernedObject, validateGovernedObject } = require('./universal-governed-object-v1');
const { governanceScope } = require('./universal-governance-scope-v1');
const { eventFabric } = require('./governance-event-fabric-v1');
const { universalLifecycle } = require('./universal-lifecycle-engine-v1');
const { productCatalog } = require('./product-catalog-v1');
const { releaseGates } = require('./release-gates-v1');
const { eightStageProgram } = require('./eight-stage-execution-program-v1');
const { sourceCatalog, sourceCatalogSummary } = require('./quran-sunnah-source-catalog-v1');
const { semanticIntegrationContract } = require('./semantic-integration-contract-v1');
const { mappingReviewSchema } = require('./sharia-policy-mapping-review-v1');
const { validateShariaBindings } = require('./sharia-source-validator-v1');
const { govern } = require('./living-governance-kernel-v1');
const { routes } = require('./server');

assert.equal(ugoSchema.fieldCount, 40);
assert.equal(governanceScope.count, 40);
assert.equal(eventFabric.count, 28);
assert.equal(universalLifecycle.count, 13);
assert.equal(productCatalog.count, 36);
assert.equal(releaseGates.count, 15);
assert.equal(eightStageProgram.count, 8);
assert.equal(sourceCatalogSummary.recordCount, 17);
assert.equal(sourceCatalogSummary.quranRecordCount, 13);
assert.equal(sourceCatalogSummary.sunnahRecordCount, 4);
assert.equal(semanticIntegrationContract.kernelRequiredDependencies.length, 11);
assert.equal(semanticIntegrationContract.kernelFlow.length, 12);
assert.equal(mappingReviewSchema.fieldCount, 18);
assert.equal(routes.length, 37);

const quran = sourceCatalog.filter((record) => record.sourceType === 'QURAN');
const sunnah = sourceCatalog.filter((record) => record.sourceType === 'AUTHENTIC_SUNNAH');

assert.equal(quran.length, 13);
assert.equal(quran.every((record) => record.referenceEligible === true), true);
assert.equal(quran.every((record) => record.enforcementEligible === false), true);
assert.equal(quran.every((record) => record.policyMappingReviewRequired === true), true);
assert.equal(quran.every((record) => record.policyMappingReviewed === false), true);

assert.equal(sunnah.length, 4);
assert.equal(sunnah.every((record) => record.referenceEligible === false), true);
assert.equal(sunnah.every((record) => record.enforcementEligible === false), true);

const policy = {
  id: 'POLICY_TEST_BALANCE',
  version: '1',
  shariaApplies: true,
  shariaBindings: [{
    sourceId: 'QURAN_55_7_9',
    mappingReview: {
      mappingId: 'MAP_TEST_001',
      policyId: 'POLICY_TEST_BALANCE',
      policyVersion: '1',
      sourceId: 'QURAN_55_7_9',
      sourceType: 'QURAN',
      mappingStatementHash: 'test-hash-not-production-evidence',
      status: 'APPROVED',
      reviewedBy: 'TEST_REVIEWER',
      reviewedAt: '2026-09-03T00:00:00Z',
      reviewEvidence: 'TEST_EVIDENCE_ONLY',
      reviewAuthorityClass: 'DOCUMENTED_HUMAN_REVIEW',
    },
  }],
};

assert.equal(
  validateShariaBindings({
    ...policy,
    shariaBindings: [{
      sourceId: 'QURAN_55_7_9',
      mappingReview: { status: 'PENDING' },
    }],
  }).ok,
  false,
);

assert.equal(validateShariaBindings(policy).ok, true);

assert.equal(
  validateShariaBindings({
    ...policy,
    shariaBindings: [{
      ...policy.shariaBindings[0],
      sourceId: 'HADITH_NO_HARM',
      mappingReview: {
        ...policy.shariaBindings[0].mappingReview,
        sourceId: 'HADITH_NO_HARM',
        sourceType: 'AUTHENTIC_SUNNAH',
      },
    }],
  }).ok,
  false,
);

assert.equal(
  validateShariaBindings({
    id: 'LEGACY',
    version: '1',
    shariaApplies: true,
    sourceIds: ['QURAN_55_7_9'],
  }).ok,
  false,
);

const candidate = createGovernedObject({
  id: 'example',
  type: 'RESOURCE',
  owner: 'OWNER',
  rights: 'OWNED',
  source: 'PRIMARY',
  provenance: 'EVIDENCE',
});
assert.equal(validateGovernedObject(candidate).ok, true);

const deniedForMissingEvidence = govern({
  object: candidate,
  policy: { shariaApplies: false },
  context: { evidenceVerified: true, requiresRightsValidation: true },
});
assert.equal(deniedForMissingEvidence.allowed, false);
assert.equal(deniedForMissingEvidence.reason, 'DECISION_EVIDENCE_REQUIRED');

process.stdout.write('SHEIKHA_FOUNDATION_V4_QURAN_POLICY_MAPPING_GATE_REPAIR_STATIC_TEST_TARGET_READY=true\n');
