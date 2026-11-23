'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const topology = require('../config/cloud/sheikha-regional-topology-v1.json');
const hybrid = require('../config/cloud/sheikha-hybrid-domain-plan-v1.json');
const { validateTopology, regionalPlan, assessSnapshot } = require('../core/cloud-fabric/sheikha-regional-preflight-v1.cjs');
const snapshot = () => ({
  schema: 'SHEIKHA_CLOUD_RUN_SNAPSHOT_V1', observedOn: '2026-10-24', project: 'sheikha-marketplace',
  service: 'sheikha-main-portal', region: 'me-central2', targetRegionAccess: 'ACCESSIBLE',
  revision: {
    spec: { containers: [{ ports: [{ containerPort: 8080 }], volumeMounts: [{ name: 'llama-models', mountPath: '/app/models' }] }],
      volumes: [{ name: 'llama-models', csi: { driver: 'gcsfuse.run.googleapis.com', readOnly: true,
        volumeAttributes: { bucketName: 'test-models-bucket' } } }] },
    status: { conditions: [{ type: 'Ready', status: 'True' }],
      imageDigest: 'me-central2-docker.pkg.dev/sheikha-marketplace/sheikha-apps/sheikha-main-portal@sha256:' + 'a'.repeat(64) }
  }, bucketChecks: [{ name: 'test-models-bucket', status: 'READABLE_METADATA', location: 'ME-CENTRAL2' }],
  iam: { bindings: [{ role: 'roles/run.invoker', members: ['serviceAccount:test@example.invalid'] }] }
});
const assess = value => assessSnapshot(value, topology, hybrid);

test('regional plan reuses all twelve domains and isolates public edge candidates', () => {
  const before = JSON.stringify([topology, hybrid]), result = regionalPlan(topology, hybrid);
  assert.equal(result.domains.length, 12);
  assert.deepEqual(result.domains.map(({ region, activated, ...row }) => row), hybrid.domains);
  assert.ok(result.domains.every(row => row.region === 'me-central2' && row.activated === false));
  assert.equal(result.internationalCandidates.length, 3);
  assert.ok(result.internationalCandidates.every(row => !row.enabled && row.role === 'REVIEWED_PUBLIC_ASSETS_ONLY'));
  assert.equal(result.eligibleForDeployment, false);
  assert.equal(result.liveInfrastructureVerified, false);
  assert.ok(Object.values(result.effects).every(value => value === 0));
  result.privateData.allowedRegions.push('us-central1');
  assert.equal(JSON.stringify([topology, hybrid]), before);
});
test('regional configuration fails closed on weakened boundaries or conflicting maps', () => {
  for (const mutate of [p => { p.primaryRegion = 'us-central1'; }, p => { p.productionHold = false; },
    p => { p.zeroNewSpend = false; }, p => { p.primary.maxInstances = Infinity; },
    p => { p.privateData.internationalReplication = true; }, p => { p.privateData.allowedRegions.push('us-east1'); },
    p => { p.internationalCandidates[0].enabled = true; }, p => { p.internationalCandidates[1].region = 'europe-west1'; },
    p => { p.hostinger.privateDataAllowed = true; }, p => { p.saudiDisasterRecovery.provider = 'imaginary-live-server'; }]) {
    const copy = structuredClone(topology); mutate(copy); assert.throws(() => validateTopology(copy, hybrid));
  }
});
test('positive supplied checks are not deployment authority or live proof', () => {
  const input = snapshot(), before = JSON.stringify(input), result = assess(input);
  assert.equal(result.status, 'LIMITED_CHECKS_PASSED_NOT_DEPLOYED');
  assert.deepEqual(result.findings, []); assert.equal(result.productionHold, true);
  assert.equal(result.eligibleForDeployment, false);
  assert.ok(result.unverified.includes('RUNTIME_SERVICE_ACCOUNT_BUCKET_ACCESS'));
  assert.equal(JSON.stringify(input), before);
});
test('reported failed revision separates Dammam policy, mount failure and IAM', () => {
  const input = snapshot(); input.region = 'us-central1'; input.targetRegionAccess = 'DENIED_LOCATION_POLICY';
  input.revision.status.conditions[0].status = 'False';
  input.revision.status.imageDigest = input.revision.status.imageDigest.replace('me-central2', 'us-central1');
  input.revision.spec.volumes[0].csi.readOnly = false;
  input.bucketChecks[0].status = 'NOT_FOUND_AT_STARTUP'; input.bucketChecks[0].location = null;
  const result = assess(input);
  for (const code of ['DAMMAM_LOCATION_POLICY_VIOLATED', 'PRIMARY_REGION_MISMATCH', 'REVISION_NOT_READY',
    'GCS_BUCKET_MISSING_AT_STARTUP', 'GCS_BUCKET_LOCATION_UNVERIFIED_OR_MISMATCH', 'GCS_READ_ONLY_MOUNT_REQUIRED']) {
    assert.ok(result.findings.includes(code), code);
  }
  assert.equal(result.unauthenticatedInvocation, 'NO_PUBLIC_SERVICE_BINDING_OBSERVED');
  assert.ok(!result.findings.includes('EXPECTED_PORT_NOT_CONFIGURED'));
});
test('unknown, inaccessible and foreign buckets cannot satisfy mount checks', () => {
  for (const status of ['TIMEOUT', 'FORBIDDEN', 'NOT_CHECKED']) {
    const input = snapshot(); input.bucketChecks[0].status = status;
    const result = assess(input);
    assert.ok(result.findings.includes('GCS_BUCKET_ACCESS_UNVERIFIED'));
    assert.ok(!result.findings.includes('GCS_BUCKET_MISSING_AT_STARTUP'));
  }
  const input = snapshot(); input.bucketChecks[0].location = 'US';
  assert.ok(assess(input).findings.includes('GCS_BUCKET_LOCATION_UNVERIFIED_OR_MISMATCH'));
  input.bucketChecks = [];
  assert.ok(assess(input).findings.includes('GCS_BUCKET_ACCESS_UNVERIFIED'));
});
test('no model mount is valid; a dangling mount is not', () => {
  const input = snapshot(); input.revision.spec.volumes = []; input.revision.spec.containers[0].volumeMounts = [];
  input.bucketChecks = [];
  assert.deepEqual(assess(input).storageChecks, []); assert.deepEqual(assess(input).findings, []);
  input.revision.spec.containers[0].volumeMounts.push({ name: 'missing', mountPath: '/app/models' });
  assert.ok(assess(input).findings.includes('MOUNT_WITHOUT_VOLUME'));
});
test('duplicate volumes or bucket observations are rejected, not overwritten', () => {
  const input = snapshot(); input.revision.spec.volumes.push(input.revision.spec.volumes[0]);
  assert.throws(() => assess(input), /DUPLICATE_VOLUME/);
  const other = snapshot(); other.bucketChecks.push(other.bucketChecks[0]);
  assert.throws(() => assess(other), /DUPLICATE_BUCKET/);
});
test('unsupported mount types and missing readiness cannot pass', () => {
  const input = snapshot(); input.revision.spec.volumes[0] = { name: 'llama-models', emptyDir: {} };
  input.revision.status.conditions = [];
  const result = assess(input);
  assert.ok(result.findings.includes('VOLUME_TYPE_REVIEW_REQUIRED'));
  assert.ok(result.findings.includes('REVISION_NOT_READY'));
});
test('public IAM and conditional public bindings require review without modifying policy', () => {
  const input = snapshot(); input.iam.bindings[0].members = ['allUsers'];
  assert.equal(assess(input).unauthenticatedInvocation, 'PUBLIC_SERVICE_BINDING_OBSERVED');
  input.iam.bindings[0].condition = { expression: 'false' };
  assert.equal(assess(input).unauthenticatedInvocation, 'CONDITIONAL_PUBLIC_BINDING_REQUIRES_REVIEW');
  input.iam.bindings[0].members = ['allAuthenticatedUsers'];
  assert.equal(assess(input).unauthenticatedInvocation, 'NO_PUBLIC_SERVICE_BINDING_OBSERVED');
  delete input.iam;
  assert.equal(assess(input).unauthenticatedInvocation, 'UNVERIFIED');
});
test('output never echoes env values, IAM member identities or arbitrary log text', () => {
  const input = snapshot(), sentinel = 'private-content-do-not-echo';
  input.revision.spec.containers[0].env = [{ name: 'TEST_VALUE', value: sentinel }];
  input.revision.status.conditions[0].message = sentinel;
  input.iam.bindings[0].members = [sentinel];
  assert.ok(!JSON.stringify(assess(input)).includes(sentinel));
});
test('malformed scope, injected authority and invalid structures are rejected', () => {
  for (const mutate of [s => { s.project = 'other-project'; }, s => { s.approved = true; },
    s => { s.region = 'me-central2; execute'; }, s => { s.targetRegionAccess = 'true'; },
    s => { s.bucketChecks[0].status = 'ACTIVE'; }, s => { s.revision.spec.containers = []; }]) {
    const input = snapshot(); mutate(input); assert.throws(() => assess(input));
  }
});
