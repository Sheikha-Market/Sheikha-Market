'use strict';

// Pure planning only: supplied observations are claims, never deployment authority.
const PORTAL = ['sheikha.top', 'sheikha.shop', 'sheikha.app'];
const CORE = ['sheikha.dev', 'sheikha.market', 'sheikha.capital'];
const REDIRECTS = Object.freeze({
  'sheikha.money': 'https://sheikha.capital', 'sheikha.me': 'https://sheikha.top/profile',
  'sheikha.site': 'https://sheikha.top', 'sheikha.click': 'https://sheikha.shop'
});
const SERVICES = Object.freeze({ 'sheikha-main-portal': 'sheikha-main-portal', 'sheikha-portal-core': 'sheikha-portal-core', 'sheikha-ops-reports': 'sheikha-ops-reports', 'sheikha-lc-governance': 'sheikha_lc_governance' });
const DOMAINS = [...PORTAL, ...CORE, 'sheikha.cloud', 'sheikha.digital', ...Object.keys(REDIRECTS)];
const check = (condition, code) => { if (!condition) throw new Error(code); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function keys(value, allowed) {
  check(object(value) && Object.keys(value).every(key => allowed.includes(key)), 'UNKNOWN_OR_INVALID_FIELDS');
}

function validatePlan(plan) {
  keys(plan, ['schema', 'status', 'verification', 'targetRegion', 'targetLocation', 'dnsAuthority', 'hostingMode', 'productionHold', 'constraints', 'canary', 'domains']);
  check(plan.schema === 'SHEIKHA_HYBRID_DOMAIN_PLAN_V1' && plan.status === 'PLANNED' && plan.verification === 'UNVERIFIED', 'PLAN_MUST_REMAIN_UNVERIFIED');
  check(plan.targetRegion === 'me-central2' && plan.targetLocation === 'Dammam', 'DAMMAM_REGION_REQUIRED');
  check(plan.dnsAuthority === 'HOSTINGER' && plan.hostingMode === 'HYBRID', 'HYBRID_DNS_AUTHORITY_REQUIRED');
  check(plan.productionHold === true, 'PRODUCTION_HOLD_REQUIRED');
  keys(plan.constraints, ['zeroNewSpend', 'noDelete', 'noPull', 'noModelLoads']);
  check(['zeroNewSpend', 'noDelete', 'noPull', 'noModelLoads'].every(key => plan.constraints[key] === true), 'CONSTRAINTS_REQUIRED');
  keys(plan.canary, ['domain', 'reportedService', 'reportedRegion', 'verification', 'migrationPolicy']);
  check(plan.canary.domain === 'dev.sheikha.top' && plan.canary.reportedService === 'sheikha-dev-service' && plan.canary.reportedRegion === 'us-central1' && plan.canary.verification === 'UNVERIFIED' && plan.canary.migrationPolicy === 'VERIFY_SEPARATELY_DO_NOT_MIGRATE_AUTOMATICALLY', 'SEPARATE_CANARY_REQUIRED');
  check(Array.isArray(plan.domains) && plan.domains.length === 12, 'TWELVE_DOMAINS_REQUIRED');
  const byDomain = new Map();
  for (const row of plan.domains) {
    keys(row, ['domain', 'kind', 'repository', 'service', 'fallbackCandidate', 'target']);
    check(DOMAINS.includes(row.domain) && !byDomain.has(row.domain), 'UNKNOWN_OR_DUPLICATE_DOMAIN');
    check(row.kind === (Object.hasOwn(REDIRECTS, row.domain) ? 'redirect' : 'service'), 'DOMAIN_KIND_MISMATCH');
    byDomain.set(row.domain, row);
    if (row.kind === 'redirect') {
      let url;
      try { url = new URL(row.target); } catch { throw new Error('INVALID_REDIRECT'); }
      check(url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.search && !url.hash && row.target === REDIRECTS[row.domain], 'REDIRECT_NOT_ALLOWLISTED');
      check(row.service === undefined && row.repository === undefined && row.fallbackCandidate === undefined, 'REDIRECT_HAS_SERVICE_FIELDS');
    } else {
      const service = PORTAL.includes(row.domain) ? 'sheikha-main-portal' : CORE.includes(row.domain) ? 'sheikha-portal-core' : row.domain === 'sheikha.cloud' ? 'sheikha-ops-reports' : 'sheikha-lc-governance';
      check(row.kind === 'service' && row.service === service && row.repository === SERVICES[service] && row.target === undefined, 'SERVICE_BINDING_MISMATCH');
      check(row.fallbackCandidate === (CORE.includes(row.domain) ? 'sheikha-main-portal' : undefined), 'INVALID_FALLBACK_CANDIDATE');
    }
  }
  for (const row of plan.domains.filter(item => item.kind === 'redirect')) {
    const seen = new Set([row.domain]);
    let next = row;
    while (next.kind === 'redirect') {
      const host = new URL(next.target).hostname;
      check(!seen.has(host) && byDomain.has(host), 'REDIRECT_LOOP_OR_UNKNOWN_TARGET');
      seen.add(host); next = byDomain.get(host);
    }
  }
  return plan;
}

function validateObservations(observations) {
  keys(observations, ['services', 'domains', 'canary']);
  for (const [group, allowed] of [['services', Object.keys(SERVICES)], ['domains', DOMAINS]]) {
    if (observations[group] === undefined) continue;
    keys(observations[group], allowed);
    for (const record of Object.values(observations[group])) validateRecord(record);
  }
  if (observations.canary !== undefined) validateRecord(observations.canary);
}
function validateRecord(record) {
  keys(record, ['verification', 'region', 'runnableSourceVerified', 'dependenciesReady', 'healthVerified', 'tlsVerified', 'httpVerified', 'evidenceId']);
  check(['VERIFIED', 'UNVERIFIED'].includes(record.verification), 'INVALID_OBSERVATION_STATUS');
  check(record.region === undefined || typeof record.region === 'string', 'INVALID_OBSERVATION_REGION');
  for (const key of ['runnableSourceVerified', 'dependenciesReady', 'healthVerified', 'tlsVerified', 'httpVerified']) check(record[key] === undefined || typeof record[key] === 'boolean', 'INVALID_OBSERVATION_CHECK');
  check(record.evidenceId === undefined || (typeof record.evidenceId === 'string' && record.evidenceId.length > 0 && record.evidenceId.length <= 200), 'INVALID_EVIDENCE_ID');
}
const observed = record => record?.verification === 'VERIFIED' && Boolean(record.evidenceId);

function evaluatePlan(plan, observations = {}) {
  validatePlan(plan); validateObservations(observations);
  const requiredSteps = [
    'VERIFY_EXISTING_CANARY_AND_REGION_WITHOUT_AUTOMATIC_MIGRATION',
    'VERIFY_RUNNABLE_SOURCE_SERVICE_DEPENDENCIES_HEALTH_AND_ME_CENTRAL2_REGION',
    'REVIEW_CANARY_BEFORE_ANY_ROOT_DNS_OR_DOMAIN_MAPPING',
    'VERIFY_REDIRECT_TARGET_HTTPS_HTTP_AND_REGION_BEFORE_REDIRECT',
    'KEEP_PRODUCTION_HOLD_AND_REQUEST_SEPARATE_CHANGE_AUTHORIZATION'
  ];
  const canary = observations.canary;
  const canaryReady = observed(canary) && canary.region === plan.targetRegion && canary.dependenciesReady === true && canary.healthVerified === true && canary.tlsVerified === true && canary.httpVerified === true;
  const rows = plan.domains.map(row => {
    const blockers = [];
    const targetDomain = row.kind === 'redirect' ? new URL(row.target).hostname : row.domain;
    const binding = plan.domains.find(item => item.domain === targetDomain);
    const service = observations.services?.[binding.service];
    if (!observed(service)) blockers.push('SERVICE_UNVERIFIED');
    if (service?.runnableSourceVerified !== true) blockers.push('RUNNABLE_SOURCE_UNVERIFIED');
    if (service?.region !== plan.targetRegion) blockers.push('SERVICE_REGION_UNVERIFIED_OR_MISMATCH');
    if (service?.dependenciesReady !== true || service?.healthVerified !== true) blockers.push('SERVICE_DEPENDENCIES_OR_HEALTH_UNVERIFIED');
    if (!canaryReady) blockers.push('CANARY_REQUIRED_FIRST');
    if (row.kind === 'redirect') {
      const target = observations.domains?.[targetDomain];
      if (!observed(target) || target.region !== plan.targetRegion || target.tlsVerified !== true || target.httpVerified !== true) blockers.push('REDIRECT_TARGET_UNVERIFIED');
    }
    return { ...row, status: 'PLANNED', verification: 'UNVERIFIED', prerequisitesSatisfied: blockers.length === 0,
      fallbackActivated: false, eligibleForDeployment: false, blockedReasons: ['PRODUCTION_HOLD', ...blockers] };
  });
  return { schema: plan.schema, status: 'PLANNED', verification: 'UNVERIFIED', targetRegion: plan.targetRegion,
    dnsAuthority: plan.dnsAuthority, hostingMode: plan.hostingMode, productionHold: true,
    observationTrust: 'CALLER_SUPPLIED_NOT_INDEPENDENTLY_VERIFIED', canary: { ...plan.canary, prerequisitesSatisfied: canaryReady },
    eligibleForDeployment: false, requiredSteps, domains: rows,
    blockedReasons: [...new Set(rows.flatMap(row => row.blockedReasons))],
    effects: { networkRequests: 0, dnsChanges: 0, domainMappings: 0, deployments: 0, deletions: 0, modelLoads: 0, newSpend: 0 } };
}

module.exports = { validatePlan, evaluatePlan };
