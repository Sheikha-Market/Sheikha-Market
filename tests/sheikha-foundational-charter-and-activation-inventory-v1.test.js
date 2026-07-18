'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const charterPath = path.join(root, 'docs/governance/SHEIKHA-FOUNDATIONAL-CHARTER-V1.md');
const contractPath = path.join(
  root,
  'runtime/governance/foundational-charter/v1/sheikha-foundational-charter-v1.json'
);
const legacyPolicyPath = path.join(
  root,
  'runtime/governance/foundational-charter/v1/legacy-claim-policy-v1.json'
);
const inventoryPath = path.join(
  root,
  'runtime/governance/foundational-charter/v1/evidence/sheikha-activation-inventory-v1.json'
);

const charter = fs.readFileSync(charterPath, 'utf8');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const legacyPolicy = JSON.parse(fs.readFileSync(legacyPolicyPath, 'utf8'));
const moduleUnderTest = require('../core/governance/sheikha-foundational-charter-v1');

test('charter module self verification passes', () => {
  const result = moduleUnderTest.selfVerify();
  assert.equal(result.passed, true);
  assert.deepEqual(result.failedChecks, []);
});

test('software is not assigned faith, consciousness, or authority', () => {
  assert.equal(contract.systemNature.softwareHasReligion, false);
  assert.equal(contract.systemNature.conscious, false);
  assert.equal(contract.systemNature.issuesFatwa, false);
  assert.equal(contract.systemNature.religiousAuthority, false);
  assert.equal(contract.systemNature.governmentAuthority, false);
});

test('identity is affiliation and benefit intent, not official representation', () => {
  assert.equal(contract.owner.officialRepresentationClaimed, false);
  assert.equal(contract.systemNature.officialGroupRepresentative, false);
  assert.equal(contract.identityBoundary.affiliationIsNotOfficialRepresentation, true);
  assert.equal(contract.owner.genealogyVerificationClaimed, false);
  assert.equal(contract.owner.propheticLineageVerificationClaimed, false);
});

test('continual improvement remains human governed and reversible', () => {
  assert.equal(contract.continualImprovement.enabled, true);
  assert.equal(contract.continualImprovement.selfAmendmentAllowed, false);
  assert.equal(contract.continualImprovement.humanReviewRequired, true);
  assert.equal(contract.continualImprovement.rollbackRequired, true);
  assert.equal(contract.continualImprovement.mayLowerSafety, false);
});

test('ijtihad does not excuse harm or negligence', () => {
  assert.equal(contract.ijtihadAndError.qualifiedHumanRequired, true);
  assert.equal(contract.ijtihadAndError.blanketErrorExcuse, false);
  assert.equal(contract.ijtihadAndError.harmAuthorization, false);
  assert.equal(contract.ijtihadAndError.correctionRequired, true);
  assert.equal(contract.ijtihadAndError.rightsRestorationRequired, true);
});

test('material or deferred transactions require written governance records', () => {
  assert.equal(
    contract.contracts.writtenByDefaultForMaterialOrDeferredTransactions,
    true
  );
  assert.equal(contract.contracts.humanApprovalRequired, true);
  assert.equal(contract.contracts.auditTrailRequired, true);
});

test('website is the primary product surface and editors are optional tools', () => {
  assert.equal(contract.architecture.websiteRole, 'PRIMARY_PRODUCT_SURFACE');
  assert.equal(contract.architecture.systemBuilderRole, 'ARCHITECTURAL_FOUNDATION');
  assert.equal(contract.architecture.editorsRole, 'OPTIONAL_DEVELOPMENT_TOOLS');
});

test('charter uses help and benefit wording instead of the rejected standalone verb', () => {
  const rejectedStandaloneVerb =
    /(^|[\s،؛:])تخدم(?=$|[\s،؛:.])/m;
  assert.equal(rejectedStandaloneVerb.test(charter), false);
  assert.match(charter, /عون|نفع|إعانة|تعين/);
});

test('legacy claim policy preserves evidence and requires human review', () => {
  assert.equal(legacyPolicy.automaticDeletionAllowed, false);
  assert.equal(legacyPolicy.humanReviewRequired, true);
  assert.equal(legacyPolicy.preserveHistoricalEvidence, true);
});

test('activation inventory is generated with controlled classifications', () => {
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  assert.equal(inventory.system, 'SHEIKHA_ACTIVATION_INVENTORY_V1');
  assert.equal(inventory.finalHumanApprovalRequired, true);
  assert.ok(inventory.systemCount > 0);
  for (const key of ['VERIFIED', 'IMPLEMENTED', 'DECLARED', 'LEGACY', 'BLOCKED']) {
    assert.equal(typeof inventory.summary[key], 'number');
  }
});

test('charter explicitly rejects unauthorized representation and tribal partisanship', () => {
  assert.match(charter, /لا يدعي الميثاق أن المالك ممثل رسمي/);
  assert.equal(contract.identityBoundary.tribalPartisanshipRejected, true);
  assert.equal(contract.identityBoundary.honorCriterion, 'التقوى والعمل الصالح لا العصبية');
});

test('learning aspiration is recorded as prayer and intent, not a self-issued credential', () => {
  const aspiration = contract.owner.knowledgeAspiration;
  assert.equal(aspiration.statementType, 'OWNER_PRAYER_AND_LEARNING_INTENT');
  assert.equal(aspiration.seeksBeneficialKnowledge, true);
  assert.equal(aspiration.continuousLearningDeclared, true);
  assert.equal(aspiration.scholarStatusClaimed, false);
  assert.equal(aspiration.divineRewardGuaranteed, false);
  assert.equal(aspiration.religiousRankClaimed, false);
});

test('owned systems may carry verified learning evidence without creating religious rank', () => {
  const policy = contract.ownershipAndAttribution;
  assert.equal(policy.ownerAttributedLearningProfileAllowed, true);
  assert.equal(policy.portableLearningEvidenceAllowed, true);
  assert.equal(policy.automaticScholarTitleAllowed, false);
  assert.equal(policy.divineRewardMayBeRecordedAsAsset, false);
  assert.equal(policy.systemOwnershipCreatesReligiousRank, false);
  assert.equal(policy.thirdPartyRightsRetained, true);
});
