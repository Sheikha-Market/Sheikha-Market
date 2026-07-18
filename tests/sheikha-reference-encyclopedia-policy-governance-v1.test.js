'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  loadContract,
  verifyContract
} = require('../core/governance/sheikha-reference-encyclopedia-policy-governance-v1');

const ROOT = path.resolve(__dirname, '..');
const DOC = path.join(
  ROOT,
  'docs',
  'governance',
  'SHEIKHA-REFERENCE-ENCYCLOPEDIA-POLICY-GOVERNANCE-V1.md'
);

test('reference and encyclopedia governance contract verifies', () => {
  assert.equal(verifyContract().verified, true);
});

test('Sheikha is an internal reference and evidence-based encyclopedia', () => {
  const contract = loadContract();
  assert.equal(contract.roles.internalReference, true);
  assert.equal(contract.roles.evidenceBasedEncyclopedia, true);
});

test('policy and internal regulation drafting remain draft roles', () => {
  const contract = loadContract();
  assert.equal(contract.roles.internalPolicyDraftingEngine, true);
  assert.equal(contract.roles.internalRegulationDraftingEngine, true);
  assert.equal(contract.highImpactPolicy.automaticApprovalAllowed, false);
  assert.equal(contract.highImpactPolicy.writtenHumanApprovalRequired, true);
});

test('religious legislative and fatwa authority are not assigned to software', () => {
  const boundaries = loadContract().authorityBoundaries;
  assert.equal(boundaries.religiousLegislativeAuthority, false);
  assert.equal(boundaries.fatwaAuthority, false);
  assert.equal(boundaries.independentHumanIjtihadClaimed, false);
});

test('government, judicial, arbitration, and official representation are rejected', () => {
  const boundaries = loadContract().authorityBoundaries;
  assert.equal(boundaries.governmentRegulatoryAuthority, false);
  assert.equal(boundaries.judicialAuthority, false);
  assert.equal(boundaries.officialArbitrationAuthority, false);
  assert.equal(boundaries.officialRepresentation, false);
});

test('software is not assigned faith, consciousness, unseen knowledge, or future guarantees', () => {
  const boundaries = loadContract().authorityBoundaries;
  assert.equal(boundaries.softwareFaithClaimed, false);
  assert.equal(boundaries.softwareConsciousnessClaimed, false);
  assert.equal(boundaries.unseenKnowledgeClaimed, false);
  assert.equal(boundaries.futureGuaranteeClaimed, false);
});

test('reference layers distinguish binding sources from non-binding analysis', () => {
  const contract = loadContract();
  const last = contract.referenceLayers.at(-1);
  assert.equal(last.id, 'NON_BINDING_ANALYSIS_AND_PROPOSALS');
  assert.equal(last.mustBeLabeledNonBinding, true);
});

test('knowledge records require provenance, versioning, review, and change history', () => {
  const requirements = new Set(loadContract().knowledgeRecordRequirements);
  for (const field of [
    'source',
    'version',
    'references',
    'humanReviewer',
    'changeHistory'
  ]) {
    assert.equal(requirements.has(field), true);
  }
});

test('website remains the primary product surface without GitHub runtime dependency', () => {
  const architecture = loadContract().productArchitecture;
  assert.equal(architecture.websitePrimaryProductSurface, true);
  assert.equal(architecture.editorsOptionalDevelopmentTools, true);
  assert.equal(architecture.githubRuntimeDependencyRequired, false);
});

test('governance document preserves human authority and non-official boundaries', () => {
  const text = fs.readFileSync(DOC, 'utf8');
  assert.match(text, /سلطة بشرية/);
  assert.match(text, /ليست.*جهة حكومية/s);
  assert.match(text, /مسودة غير نافذة/);
  assert.match(text, /عرض التحليل كحقيقة ملزمة/);
});
