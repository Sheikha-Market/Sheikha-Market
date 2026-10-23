'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createAssetDigitization, SOURCE_DEFINITIONS, LIMITS } = require('../core/ownership/sheikha-asset-digitization-v1.cjs');
const { buildAssetExecutionPlan } = require('../core/ownership/sheikha-asset-execution-plan-v1.cjs');
const { digest } = require('../core/ownership/sheikha-owned-asset-registry.cjs');

function fixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-asset-plan-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const service = createAssetDigitization({ sourcePaths: Object.fromEntries(SOURCE_DEFINITIONS.map(([id]) => [id, path.join(temp, id)])),
    now: () => 1792548000000, root: path.join(temp, 'reports') });
  const report = service.inspect();
  const observed = structuredClone(report);
  for (const source of observed.sources) Object.assign(source, { status: 'READ', sha256: 'a'.repeat(64), matchesRecordedDigest: source.recordedDigest ? true : null });
  Object.assign(observed.packageAudit, { structureValid: true, declaredHashesMatch: true, declaredHold: true });
  return { temp, service, report, observed };
}

test('plan covers each capability and gate with stable IDs, acceptance criteria and evidence requirements', t => {
  const { observed } = fixture(t), before = structuredClone(observed), plan = buildAssetExecutionPlan(observed);
  assert.deepEqual(plan.summary, { assets: 6, capabilities: 11, requirements: 66, localChecksPassed: 7,
    localChecksFailed: 0, acceptanceNotTested: 11, reviewsRequired: 48 });
  assert.equal(new Set(plan.requirements.map(r => r.id)).size, 66);
  for (const asset of observed.assets) {
    assert.deepEqual(plan.capabilities.filter(c => c.assetId === asset.id).map(c => c.name), asset.capabilities);
    for (const gate of observed.governance.gates) assert.equal(plan.requirements.filter(r => r.assetId === asset.id && r.gateId === gate.id && r.type === 'GOVERNANCE_REVIEW').length, 1);
  }
  for (const requirement of plan.requirements) {
    assert.ok(requirement.acceptanceCriteria.length); assert.ok(requirement.requiredEvidence.length); assert.equal(requirement.assignedPerson, null);
    assert.ok(observed.governance.gates.some(g => g.id === requirement.gateId));
    assert.ok(requirement.evidenceRefs.every(ref => observed.assets.find(a => a.id === requirement.assetId).evidenceIds.includes(ref.sourceId)));
  }
  for (const capability of plan.capabilities) for (const id of capability.requirementIds) {
    const requirement = plan.requirements.find(r => r.id === id);
    assert.equal(requirement.assetId, capability.assetId); assert.ok(requirement.capabilityIds.includes(capability.id));
  }
  assert.deepEqual(observed, before); assert.deepEqual(buildAssetExecutionPlan(observed), plan);
  plan.requirements[0].status = 'APPROVED'; assert.equal(buildAssetExecutionPlan(observed).requirements[0].status, 'LOCAL_PASS');
});

test('proposed requirement graph is acyclic, resolves every dependency, and retains all authorization gates', t => {
  const { observed } = fixture(t), plan = buildAssetExecutionPlan(observed), completed = new Set(), active = new Set();
  const visit = id => {
    assert.equal(active.has(id), false, `cycle ${id}`); if (completed.has(id)) return;
    const r = plan.requirements.find(r => r.id === id); assert.ok(r, id); active.add(id);
    for (const parent of r.dependsOn) visit(parent); active.delete(id); completed.add(id);
  };
  plan.requirements.forEach(r => visit(r.id)); assert.equal(completed.size, 66);
  for (const asset of observed.assets) {
    const auth = plan.requirements.find(r => r.id === `${asset.id}--authorization`);
    assert.equal(auth.dependsOn.length, 7); assert.ok(auth.dependsOn.includes(`${asset.id}--rights`));
    const next = plan.nextActions.find(n => n.assetId === asset.id);
    assert.equal(next.requirementId, `${asset.id}--scope`); assert.equal(next.executionAuthorized, false);
    assert.deepEqual(next.relatedAssetIds, asset.dependsOn);
  }
});

test('missing, refused, malformed, unhashable or changed sources fail only their local checks without granting readiness', t => {
  const { observed } = fixture(t);
  for (const change of [{ status: 'MISSING' }, { status: 'UNREADABLE' }, { status: 'INVALID_JSON' }, { sha256: null }, { matchesRecordedDigest: false }]) {
    const report = structuredClone(observed); Object.assign(report.sources.find(s => s.id === 'host-source'), change);
    const plan = buildAssetExecutionPlan(report);
    assert.equal(plan.requirements.find(r => r.id === 'host-governance-source--observation').status, 'LOCAL_FAIL');
    assert.equal(plan.nextActions.find(n => n.assetId === 'host-governance-source').requirementId, 'host-governance-source--observation');
    assert.equal(plan.summary.localChecksFailed, 1); assert.equal(plan.summary.reviewsRequired, 48);
    assert.equal(plan.productionEnabled, false);
  }
});

test('package inconsistency takes priority over ordinary next steps and no manifest claim satisfies acceptance', t => {
  const { observed } = fixture(t);
  for (const field of ['structureValid', 'declaredHashesMatch', 'declaredHold']) {
    const report = structuredClone(observed); report.packageAudit[field] = false;
    const plan = buildAssetExecutionPlan(report);
    assert.equal(plan.nextActions.find(n => n.assetId === 'supplier-package').requirementId, 'supplier-package--package-consistency');
    assert.equal(plan.summary.acceptanceNotTested, 11); assert.equal(plan.approvalsRecorded, false);
  }
  Object.assign(observed.packageAudit, { executionTested: true, decision: 'ACTIVE', unimplementedContracts: 0 });
  observed.policy.productionEnabled = true;
  for (const asset of observed.assets) { asset.productionEnabled = true; asset.ownershipVerified = true; asset.gates.forEach(g => { g.status = 'APPROVED'; }); }
  const plan = buildAssetExecutionPlan(observed);
  for (const field of ['productionEnabled', 'approvalsRecorded', 'acceptanceTestsExecuted', 'certificationGranted']) assert.equal(plan[field], false);
  assert.equal(plan.status, 'DRAFT_NOT_AUTHORIZED'); assert.equal(plan.summary.reviewsRequired, 48); assert.equal(plan.summary.acceptanceNotTested, 11);
});

test('catalog drift fails closed rather than silently omitting a new asset capability', t => {
  const { observed } = fixture(t); observed.assets[0].capabilities.push('unmapped');
  assert.throws(() => buildAssetExecutionPlan(observed), /ASSET_PLAN_CATALOG_MISMATCH/);
  observed.assets[0].capabilities.pop(); observed.assets[0].capabilities.reverse();
  assert.throws(() => buildAssetExecutionPlan(observed), /ASSET_PLAN_CATALOG_MISMATCH/);
});

test('dossier hashes and private snapshots include the plan while preserving historical snapshots', t => {
  const { service, report, temp } = fixture(t), { integrity, ...body } = report;
  assert.equal(digest(body), integrity.digest); assert.equal(report.executionPlan.summary.localChecksFailed, 7);
  assert.ok(Buffer.byteLength(JSON.stringify(report)) < LIMITS.bytes); assert.deepEqual(fs.readdirSync(temp), []);
  const saved = service.snapshot(), file = path.join(temp, 'reports', saved.id + '.json');
  assert.equal(fs.statSync(file).mode & 0o777, 0o600); assert.deepEqual(service.snapshot(), saved);
  const historical = { ...body }; delete historical.executionPlan;
  const oldId = digest(historical), oldReport = { ...historical, integrity: { algorithm: 'SHA-256_CANONICAL_JSON', digest: oldId, signature: false } };
  const oldFile = path.join(temp, 'reports', oldId + '.json'); fs.writeFileSync(oldFile, JSON.stringify(oldReport), { mode: 0o600 });
  const oldBytes = fs.readFileSync(oldFile); service.snapshot(); assert.deepEqual(fs.readFileSync(oldFile), oldBytes);
  assert.equal(fs.readdirSync(path.join(temp, 'reports')).length, 2);
});
