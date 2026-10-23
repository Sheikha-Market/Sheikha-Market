'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { getPolicy, getRegistry } = require('./sheikha-site-registry-v2');
const { validatePlan } = require('../cloud-fabric/sheikha-hybrid-domain-plan-v1.cjs');
const ROOT = path.resolve(__dirname, '../..');
const CONFIG = 'config/sheikha-master-architecture-topology-v1.json';
const HYBRID_CONFIG = 'config/cloud/sheikha-hybrid-domain-plan-v1.json';
const HOST = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const ID = /^[a-z][a-z0-9_-]{0,80}$/;
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasOnlyKeys = (value, keys) => Object.keys(value).every(key => keys.includes(key));

function validateTopology(topology) {
  const errors = [];
  const fail = (code, index) => errors.push(index === undefined ? { code } : { code, index });
  if (!isObject(topology) || topology.schemaVersion !== 1 ||
      topology.system !== 'SHEIKHA_MASTER_ARCHITECTURE_TOPOLOGY_V1' ||
      topology.status !== 'DESIRED_LOCAL_ARCHITECTURE' || topology.source !== 'CURRENT_USER_REQUEST') {
    return { valid: false, errors: [{ code: 'INVALID_TOPOLOGY_HEADER' }] };
  }
  if (!hasOnlyKeys(topology, ['system', 'schemaVersion', 'status', 'source', 'groups', 'repositories', 'domains'])) {
    fail('UNEXPECTED_TOPOLOGY_FIELD');
  }
  for (const key of ['groups', 'repositories', 'domains']) {
    if (!Array.isArray(topology[key]) || topology[key].length === 0 || topology[key].length > 256) {
      fail('INVALID_' + key.toUpperCase());
    }
  }
  if (errors.length) return { valid: false, errors };

  const groups = new Set();
  topology.groups.forEach((group, index) => {
    if (!isObject(group) || typeof group.id !== 'string' || !ID.test(group.id) ||
        typeof group.labelAr !== 'string' || !group.labelAr.trim() || !hasOnlyKeys(group, ['id', 'labelAr'])) {
      fail('INVALID_GROUP', index);
    } else if (groups.has(group.id)) fail('DUPLICATE_GROUP', index);
    else groups.add(group.id);
  });
  const repositories = new Set();
  topology.repositories.forEach((repository, index) => {
    if (typeof repository !== 'string' || !ID.test(repository)) fail('INVALID_REPOSITORY', index);
    else if (repositories.has(repository)) fail('DUPLICATE_REPOSITORY', index);
    else repositories.add(repository);
  });

  const domains = new Map();
  topology.domains.forEach((domain, index) => {
    if (!isObject(domain) || typeof domain.hostname !== 'string' ||
        domain.hostname.length > 253 || !HOST.test(domain.hostname)) {
      fail('INVALID_HOSTNAME', index);
      return;
    }
    if (domains.has(domain.hostname)) fail('DUPLICATE_HOSTNAME', index);
    domains.set(domain.hostname, domain);
    if (!groups.has(domain.group)) fail('UNKNOWN_GROUP', index);
    if (domain.kind === 'service') {
      if (!hasOnlyKeys(domain, ['hostname', 'group', 'kind', 'repository', 'roleAr'])) fail('UNEXPECTED_SERVICE_FIELD', index);
      if (!repositories.has(domain.repository)) fail('UNKNOWN_REPOSITORY', index);
      if (typeof domain.roleAr !== 'string' || !domain.roleAr.trim()) fail('MISSING_SERVICE_ROLE', index);
      if ('target' in domain || 'statusCode' in domain) fail('AMBIGUOUS_SERVICE_REDIRECT', index);
    } else if (domain.kind === 'redirect') {
      if (!hasOnlyKeys(domain, ['hostname', 'group', 'kind', 'target', 'statusCode', 'pathPolicy', 'queryPolicy', 'methods'])) {
        fail('UNEXPECTED_REDIRECT_FIELD', index);
      }
      if ('repository' in domain) fail('AMBIGUOUS_REDIRECT_REPOSITORY', index);
      if (domain.statusCode !== 301 || domain.pathPolicy !== 'fixed-target' ||
          domain.queryPolicy !== 'drop' || JSON.stringify(domain.methods) !== '["GET","HEAD"]') {
        fail('INVALID_REDIRECT_POLICY', index);
      }
    } else fail('INVALID_DOMAIN_KIND', index);
  });

  const edges = new Map();
  topology.domains.forEach((domain, index) => {
    if (!isObject(domain) || domain.kind !== 'redirect') return;
    try {
      if (typeof domain.target !== 'string' || domain.target.length > 2048 ||
          !/^https:\/\/[a-z0-9.-]+(?:\/[a-zA-Z0-9/_-]*)?$/.test(domain.target)) {
        throw new Error('Invalid target');
      }
      const target = new URL(domain.target);
      if (target.username || target.password || target.port || target.search || target.hash) throw new Error('Invalid target');
      edges.set(domain.hostname, target.hostname);
      if (!domains.has(target.hostname)) fail('UNREGISTERED_REDIRECT_TARGET', index);
      else if (domains.get(target.hostname).kind !== 'service') fail('REDIRECT_TARGET_MUST_BE_SERVICE', index);
    } catch {
      fail('INVALID_REDIRECT_TARGET', index);
    }
  });
  for (const origin of edges.keys()) {
    const visited = new Set();
    let current = origin;
    while (edges.has(current)) {
      if (visited.has(current)) { fail('REDIRECT_CYCLE'); break; }
      visited.add(current);
      current = edges.get(current);
    }
  }
  return { valid: errors.length === 0, errors };
}

function assertTopology(topology) {
  const result = validateTopology(topology);
  if (!result.valid) {
    const error = new Error('MASTER_ARCHITECTURE_TOPOLOGY_INVALID');
    error.code = 'MASTER_ARCHITECTURE_TOPOLOGY_INVALID';
    error.validation = result;
    throw error;
  }
  return topology;
}

function loadTopology() {
  return assertTopology(JSON.parse(fs.readFileSync(path.join(ROOT, CONFIG), 'utf8')));
}

function checkHybridAlignment(topology, hybridPlan) {
  if (!validateTopology(topology).valid) return { valid: false, errors: [{ code: 'TOPOLOGY_INVALID' }] };
  try { validatePlan(hybridPlan); }
  catch { return { valid: false, errors: [{ code: 'HYBRID_PLAN_INVALID' }] }; }
  const errors = [];
  const planned = new Map(hybridPlan.domains.map(row => [row.domain, row]));
  const hosts = new Set(topology.domains.map(row => row.hostname));
  for (const row of topology.domains) {
    const other = planned.get(row.hostname);
    let code;
    if (!other) code = 'DOMAIN_MISSING_FROM_HYBRID_PLAN';
    else if (row.kind !== other.kind) code = 'DOMAIN_KIND_CONFLICT';
    else if (row.kind === 'service' && row.repository !== other.repository) code = 'DOMAIN_REPOSITORY_CONFLICT';
    else if (row.kind === 'redirect' && row.target !== other.target) code = 'REDIRECT_TARGET_CONFLICT';
    if (code) errors.push({ code, hostname: row.hostname });
  }
  for (const row of hybridPlan.domains) {
    if (!hosts.has(row.domain)) errors.push({ code: 'DOMAIN_MISSING_FROM_TOPOLOGY', hostname: row.domain });
  }
  const repositories = [...new Set(hybridPlan.domains.filter(row => row.kind === 'service').map(row => row.repository))].sort();
  if (JSON.stringify([...topology.repositories].sort()) !== JSON.stringify(repositories)) {
    errors.push({ code: 'REPOSITORY_SET_CONFLICT' });
  }
  return { valid: errors.length === 0, errors };
}

function getStatus(topology = loadTopology(), context = {}) {
  assertTopology(topology);
  const hybridPlan = Object.hasOwn(context, 'hybridPlan') ? context.hybridPlan : JSON.parse(
    fs.readFileSync(path.join(ROOT, HYBRID_CONFIG), 'utf8')
  );
  const alignment = checkHybridAlignment(topology, hybridPlan);
  const integrations = context.integrations || JSON.parse(fs.readFileSync(
    path.join(ROOT, 'config/sheikha-repository-integrations-v1.json'), 'utf8'
  ));
  const policy = context.policy || getPolicy();
  const registry = context.registry || getRegistry();
  const registered = new Set(integrations.repositories.map(repository => repository.id));
  const declaredRoutes = new Set([
    ...Object.keys(policy.primaryRoutes), ...Object.keys(policy.aliases),
    ...registry.canonicalRoutes.map(route => route.route),
    ...registry.aliasRoutes.map(route => route.route)
  ]);
  const repositories = topology.repositories.map(id => ({
    id, localIntegrationRegistry: registered.has(id) ? 'REGISTERED' : 'NOT_REGISTERED',
    remoteAccess: 'NOT_CHECKED', deployment: 'NOT_VERIFIED'
  }));
  const findings = repositories.filter(repository => repository.localIntegrationRegistry === 'NOT_REGISTERED')
    .map(repository => ({ code: 'REPOSITORY_NOT_REGISTERED_LOCALLY', repository: repository.id }));
  findings.push(...alignment.errors);
  for (const domain of topology.domains.filter(domain => domain.kind === 'redirect')) {
    const target = new URL(domain.target);
    const owner = topology.domains.find(entry => entry.hostname === target.hostname);
    // Only this repository's route declarations are available for local checks.
    if (owner.repository === 'sheikha-main-portal' && !declaredRoutes.has(target.pathname)) {
      findings.push({ code: 'TARGET_ROUTE_NOT_DECLARED_LOCALLY', hostname: domain.hostname, target: domain.target });
    }
  }
  return {
    system: topology.system,
    status: alignment.valid ? 'LOCAL_PLAN_VALID_DEPLOYMENT_NOT_VERIFIED' : 'LOCAL_PLAN_CONFLICT_DEPLOYMENT_NOT_VERIFIED',
    schemaValid: true,
    hybridArchitecture: {
      config: HYBRID_CONFIG, alignmentValid: alignment.valid, conflicts: alignment.errors,
      targetRegion: alignment.valid ? hybridPlan.targetRegion : null,
      dnsAuthority: alignment.valid ? hybridPlan.dnsAuthority : null,
      hostingMode: alignment.valid ? hybridPlan.hostingMode : null,
      productionHold: true, deployment: 'NOT_VERIFIED'
    },
    topologySha256: crypto.createHash('sha256').update(JSON.stringify(topology)).digest('hex'),
    counts: {
      domains: topology.domains.length, groups: topology.groups.length,
      repositories: repositories.length,
      services: topology.domains.filter(domain => domain.kind === 'service').length,
      redirects: topology.domains.filter(domain => domain.kind === 'redirect').length
    },
    repositories,
    findings,
    evidence: { ownership: 'NOT_VERIFIED', dns: 'NOT_CHECKED', tls: 'NOT_CHECKED', deployment: 'NOT_VERIFIED' },
    releaseGates: ['DOMAIN_OWNERSHIP', 'REPOSITORY_ACCESS', 'SERVICE_HOST_ROUTING', 'TARGET_ROUTE_AUTHENTICATION',
      'DNS_AND_MAIL_RECORD_REVIEW', 'TLS', 'STAGING_HTTP_CHECKS', 'HUMAN_DEPLOYMENT_APPROVAL'],
    execution: { mode: 'READ_ONLY_PLAN', performsExternalActions: false, redirectsInstalledByThisModule: false,
      productionReady: false, financialOperationsAuthorized: false }
  };
}

function resolvePlannedHostname(hostname, topology = loadTopology()) {
  assertTopology(topology);
  if (typeof hostname !== 'string' || hostname.length > 253 || !HOST.test(hostname.toLowerCase())) {
    return { found: false, reason: 'INVALID_HOSTNAME' };
  }
  const entry = topology.domains.find(domain => domain.hostname === hostname.toLowerCase());
  return entry ? { found: true, mode: 'PLAN_ONLY', applied: false, entry: structuredClone(entry) }
    : { found: false, reason: 'HOSTNAME_NOT_IN_TOPOLOGY' };
}

module.exports = { validateTopology, loadTopology, checkHybridAlignment, getStatus, resolvePlannedHostname };
