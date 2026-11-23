'use strict';

const { validatePlan } = require('./sheikha-hybrid-domain-plan-v1.cjs');
const assert = (ok, code) => { if (!ok) throw new Error(code); };
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
function keys(value, allowed) {
  assert(plain(value) && Object.keys(value).every(key => allowed.includes(key)), 'INVALID_FIELDS');
}
const regions = ['europe-west1', 'asia-southeast1', 'us-east1'];

function validateTopology(topology, hybrid) {
  validatePlan(hybrid);
  keys(topology, ['schema', 'status', 'primaryRegion', 'dnsAuthority', 'productionHold', 'zeroNewSpend',
    'primary', 'privateData', 'internationalCandidates', 'hostinger', 'saudiDisasterRecovery']);
  assert(topology.schema === 'SHEIKHA_REGIONAL_TOPOLOGY_V1' && topology.status === 'PLANNED_NOT_DEPLOYED', 'INVALID_TOPOLOGY');
  assert(topology.primaryRegion === hybrid.targetRegion && topology.dnsAuthority === hybrid.dnsAuthority, 'HYBRID_PLAN_CONFLICT');
  assert(topology.productionHold === true && topology.zeroNewSpend === true, 'GOVERNANCE_REQUIRED');
  const primary = topology.primary;
  keys(primary, ['country', 'service', 'minInstances', 'maxInstances', 'state', 'modelMount']);
  assert(primary.country === 'SA' && primary.service === 'sheikha-main-portal', 'INVALID_PRIMARY');
  assert(primary.minInstances === 0 && Number.isInteger(primary.maxInstances)
    && primary.maxInstances >= 1 && primary.maxInstances <= 3, 'INSTANCE_LIMIT_REQUIRED');
  assert(primary.state === 'EXTERNAL_SAUDI_STORE_REQUIRED'
    && primary.modelMount === 'DISABLED_UNTIL_VERIFIED_READ_ONLY', 'STORAGE_REVIEW_REQUIRED');
  const data = topology.privateData;
  keys(data, ['allowedRegions', 'internationalReplication', 'regionalFailover', 'logsBackupsSecrets']);
  assert(Array.isArray(data.allowedRegions) && data.allowedRegions.length === 1
    && data.allowedRegions[0] === topology.primaryRegion && data.internationalReplication === false
    && data.regionalFailover === 'FAIL_CLOSED'
    && data.logsBackupsSecrets === 'SAUDI_LOCATION_VERIFICATION_REQUIRED', 'PRIVATE_DATA_BOUNDARY_REQUIRED');
  assert(Array.isArray(topology.internationalCandidates) && topology.internationalCandidates.length === regions.length, 'INVALID_EDGE_CANDIDATES');
  const seen = new Set();
  for (const row of topology.internationalCandidates) {
    keys(row, ['region', 'role', 'enabled']);
    assert(regions.includes(row.region) && !seen.has(row.region)
      && row.role === 'REVIEWED_PUBLIC_ASSETS_ONLY' && row.enabled === false, 'INVALID_EDGE_CANDIDATE');
    seen.add(row.region);
  }
  keys(topology.hostinger, ['role', 'location', 'privateDataAllowed']);
  assert(topology.hostinger.role === 'DNS_AND_OPTIONAL_PUBLIC_EDGE'
    && topology.hostinger.location === 'UNVERIFIED' && topology.hostinger.privateDataAllowed === false, 'HOSTINGER_LOCATION_UNVERIFIED');
  keys(topology.saudiDisasterRecovery, ['provider', 'location', 'status']);
  assert(topology.saudiDisasterRecovery.provider === null && topology.saudiDisasterRecovery.location === null
    && topology.saudiDisasterRecovery.status === 'INDEPENDENT_SAUDI_SITE_REQUIRED', 'DR_NOT_VERIFIED');
  return topology;
}

function regionalPlan(topology, hybrid) {
  validateTopology(topology, hybrid);
  return {
    schema: topology.schema, status: topology.status, primaryRegion: topology.primaryRegion,
    productionHold: true, eligibleForDeployment: false, liveInfrastructureVerified: false,
    primary: { ...topology.primary },
    domains: hybrid.domains.map(row => ({ ...row, region: topology.primaryRegion, activated: false })),
    internationalCandidates: topology.internationalCandidates.map(row => ({ ...row })),
    privateData: { ...topology.privateData, allowedRegions: [...topology.privateData.allowedRegions] },
    hostinger: { ...topology.hostinger }, saudiDisasterRecovery: { ...topology.saudiDisasterRecovery },
    requiredChecks: ['DAMMAM_ACCOUNT_ACCESS', 'REGIONAL_BUILD_STORAGE_REGISTRY_AND_SECRETS',
      'MODEL_MOUNT_DEPENDENCIES', 'EXTERNAL_STATE_AND_DISTRIBUTED_LOCKS', 'SINGLE_SCHEDULER',
      'PRIVATE_API_INGRESS_AND_AUTHENTICATION', 'PUBLIC_EXPORT_MANIFEST',
      'FAILOVER_AND_RESTORE_TESTS', 'BUDGET_AND_RELEASE_REVIEW'],
    effects: { deployments: 0, networkRequests: 0, dnsChanges: 0, iamChanges: 0, newSpend: 0 }
  };
}

// This consumes a sanitized snapshot, never live credentials or deployment approval.
function assessSnapshot(snapshot, topology, hybrid) {
  const plan = regionalPlan(topology, hybrid);
  keys(snapshot, ['schema', 'observedOn', 'project', 'service', 'region', 'targetRegionAccess', 'revision', 'bucketChecks', 'iam']);
  assert(snapshot.schema === 'SHEIKHA_CLOUD_RUN_SNAPSHOT_V1'
    && snapshot.project === 'sheikha-marketplace' && snapshot.service === topology.primary.service, 'INVALID_SNAPSHOT_SCOPE');
  assert(typeof snapshot.observedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(snapshot.observedOn), 'INVALID_OBSERVATION_DATE');
  assert(typeof snapshot.region === 'string' && /^[a-z]+(?:-[a-z]+)+\d$/.test(snapshot.region), 'INVALID_REGION');
  assert(['ACCESSIBLE', 'DENIED_LOCATION_POLICY', 'UNVERIFIED'].includes(snapshot.targetRegionAccess), 'INVALID_REGION_ACCESS');
  const findings = [];
  const add = code => { if (!findings.includes(code)) findings.push(code); };
  if (snapshot.targetRegionAccess !== 'ACCESSIBLE') add(snapshot.targetRegionAccess === 'DENIED_LOCATION_POLICY'
    ? 'DAMMAM_LOCATION_POLICY_VIOLATED' : 'DAMMAM_ACCESS_UNVERIFIED');
  if (snapshot.region !== topology.primaryRegion) add('PRIMARY_REGION_MISMATCH');
  const revision = snapshot.revision;
  assert(plain(revision) && plain(revision.spec) && plain(revision.status), 'INVALID_REVISION');
  const conditions = revision.status.conditions;
  assert(Array.isArray(conditions) && conditions.length <= 32 && conditions.every(plain), 'INVALID_CONDITIONS');
  const ready = conditions.filter(row => row.type === 'Ready');
  if (ready.length !== 1 || ready[0].status !== 'True') add('REVISION_NOT_READY');
  const image = revision.status.imageDigest;
  if (typeof image !== 'string' || !/@sha256:[a-f0-9]{64}$/.test(image)) add('IMMUTABLE_IMAGE_DIGEST_UNVERIFIED');
  if (typeof image !== 'string' || !image.startsWith('me-central2-docker.pkg.dev/sheikha-marketplace/')) add('PRIMARY_REGISTRY_REGION_MISMATCH');

  const containers = revision.spec.containers;
  const volumes = revision.spec.volumes ?? [];
  assert(Array.isArray(containers) && containers.length > 0 && containers.length <= 8
    && containers.every(plain) && Array.isArray(volumes) && volumes.length <= 16 && volumes.every(plain), 'INVALID_REVISION_SPEC');
  if (!containers.some(container => Array.isArray(container.ports)
    && container.ports.some(port => plain(port) && port.containerPort === 8080))) add('EXPECTED_PORT_NOT_CONFIGURED');
  const volumeMap = new Map();
  for (const volume of volumes) {
    assert(typeof volume.name === 'string' && /^[a-z][a-z0-9-]{0,62}$/.test(volume.name)
      && !volumeMap.has(volume.name), 'INVALID_OR_DUPLICATE_VOLUME');
    volumeMap.set(volume.name, volume);
  }
  const mounts = [];
  for (const container of containers) {
    const rows = container.volumeMounts ?? [];
    assert(Array.isArray(rows) && rows.length <= 16 && rows.every(plain), 'INVALID_VOLUME_MOUNTS');
    for (const mount of rows) {
      if (!volumeMap.has(mount.name)) add('MOUNT_WITHOUT_VOLUME');
      mounts.push(mount);
    }
  }
  assert(Array.isArray(snapshot.bucketChecks) && snapshot.bucketChecks.length <= 16, 'INVALID_BUCKET_CHECKS');
  const bucketMap = new Map();
  for (const bucket of snapshot.bucketChecks) {
    keys(bucket, ['name', 'status', 'location']);
    assert(typeof bucket.name === 'string' && /^[a-z0-9][a-z0-9._-]{1,220}[a-z0-9]$/.test(bucket.name)
      && !bucketMap.has(bucket.name), 'INVALID_OR_DUPLICATE_BUCKET');
    assert(['READABLE_METADATA', 'NOT_FOUND_AT_STARTUP', 'FORBIDDEN', 'TIMEOUT', 'NOT_CHECKED'].includes(bucket.status), 'INVALID_BUCKET_STATUS');
    assert(bucket.location === null || (typeof bucket.location === 'string' && /^[A-Za-z0-9-]{2,40}$/.test(bucket.location)), 'INVALID_BUCKET_LOCATION');
    bucketMap.set(bucket.name, bucket);
  }
  const storageChecks = [];
  for (const volume of volumes) {
    if (!plain(volume.csi) || volume.csi.driver !== 'gcsfuse.run.googleapis.com') {
      add('VOLUME_TYPE_REVIEW_REQUIRED');
      continue;
    }
    const name = volume.csi.volumeAttributes?.bucketName;
    assert(typeof name === 'string' && /^[a-z0-9][a-z0-9._-]{1,220}[a-z0-9]$/.test(name), 'INVALID_GCS_BUCKET');
    const bucket = bucketMap.get(name);
    const status = bucket?.status ?? 'NOT_CHECKED';
    if (status === 'NOT_FOUND_AT_STARTUP') add('GCS_BUCKET_MISSING_AT_STARTUP');
    else if (status !== 'READABLE_METADATA') add('GCS_BUCKET_ACCESS_UNVERIFIED');
    if (bucket?.location?.toLowerCase() !== topology.primaryRegion) add('GCS_BUCKET_LOCATION_UNVERIFIED_OR_MISMATCH');
    const attached = mounts.filter(mount => mount.name === volume.name);
    const readOnly = volume.csi.readOnly === true && attached.length > 0;
    if (!readOnly) add('GCS_READ_ONLY_MOUNT_REQUIRED');
    storageChecks.push({ volume: volume.name, bucket: name, status, readOnly });
  }
  let unauthenticatedInvocation = 'UNVERIFIED';
  if (snapshot.iam !== undefined) {
    keys(snapshot.iam, ['bindings']);
    assert(Array.isArray(snapshot.iam.bindings) && snapshot.iam.bindings.length <= 128, 'INVALID_IAM_SNAPSHOT');
    let publicBinding = false, conditionalPublicBinding = false;
    for (const binding of snapshot.iam.bindings) {
      assert(plain(binding) && Array.isArray(binding.members) && binding.members.length <= 512, 'INVALID_IAM_BINDING');
      if (binding.role === 'roles/run.invoker' && binding.members.includes('allUsers')) {
        if (binding.condition) conditionalPublicBinding = true;
        else publicBinding = true;
      }
    }
    unauthenticatedInvocation = publicBinding ? 'PUBLIC_SERVICE_BINDING_OBSERVED'
      : conditionalPublicBinding ? 'CONDITIONAL_PUBLIC_BINDING_REQUIRES_REVIEW' : 'NO_PUBLIC_SERVICE_BINDING_OBSERVED';
    if (publicBinding || conditionalPublicBinding) add('PRIVATE_CORE_PUBLIC_ACCESS_REVIEW_REQUIRED');
  }
  return {
    schema: 'SHEIKHA_REGIONAL_PREFLIGHT_V1', observedOn: snapshot.observedOn,
    observationTrust: 'SUPPLIED_SNAPSHOT_NOT_LIVE_OR_INDEPENDENTLY_VERIFIED',
    status: findings.length ? 'BLOCKED' : 'LIMITED_CHECKS_PASSED_NOT_DEPLOYED',
    sourceRegion: snapshot.region, targetRegion: topology.primaryRegion,
    findings, storageChecks, unauthenticatedInvocation,
    productionHold: true, eligibleForDeployment: false, effects: plan.effects,
    unverified: ['RUNTIME_SERVICE_ACCOUNT_BUCKET_ACCESS', 'SECRET_LOCATIONS', 'STATE_STORE_AND_SCHEDULER',
      'EFFECTIVE_IAM_AND_INGRESS', 'PUBLIC_EDGE_ISOLATION', 'BUDGET', 'LIVE_HEALTH_AND_FAILOVER']
  };
}

module.exports = { validateTopology, regionalPlan, assessSnapshot };
