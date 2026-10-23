'use strict';

const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const request = require('supertest');
const vm = require('node:vm');
const { validateTopology, loadTopology, checkHybridAlignment, getStatus, resolvePlannedHostname } = require(
  '../core/site-registry/sheikha-master-architecture-topology-v1.cjs'
);
const { createTopologyRoutes } = require('../routes/site-registry/sheikha-master-architecture-topology-routes-v1.cjs');
const v3Routes = require('../routes/site-registry/sheikha-engine-domain-routes-v3');
const hybridSource = require('../config/cloud/sheikha-hybrid-domain-plan-v1.json');
const base = '/api/site-registry/v3/architecture';
const app = express();
app.use('/api/site-registry/v3', v3Routes);
const expectedServices = {
  'sheikha.top': 'sheikha-main-portal', 'sheikha.dev': 'sheikha-portal-core',
  'sheikha.cloud': 'sheikha-ops-reports', 'sheikha.digital': 'sheikha_lc_governance',
  'sheikha.shop': 'sheikha-main-portal', 'sheikha.market': 'sheikha-portal-core',
  'sheikha.capital': 'sheikha-portal-core', 'sheikha.app': 'sheikha-main-portal'
};
const expectedRedirects = {
  'sheikha.money': 'https://sheikha.capital', 'sheikha.me': 'https://sheikha.top/profile',
  'sheikha.site': 'https://sheikha.top', 'sheikha.click': 'https://sheikha.shop'
};
const context = {
  integrations: { repositories: [{ id: 'sheikha-main-portal', root: '.' }] },
  policy: { primaryRoutes: { '/': 'public/index.html' }, aliases: {} },
  registry: { canonicalRoutes: [{ route: '/' }], aliasRoutes: [] }
};

describe('Master architecture topology V1', () => {
  test.each([true, false])('CLI fails on alignment conflict without changing files: aligned=%s', aligned => {
    const status = { hybridArchitecture: { alignmentValid: aligned } };
    const stdout = [], stderr = [];
    const processStub = { stdout: { write: value => stdout.push(value) }, stderr: { write: value => stderr.push(value) } };
    const code = fs.readFileSync(path.join(__dirname, '../tools/site/sheikha-master-architecture-check.cjs'), 'utf8');
    vm.runInNewContext(code, { process: processStub, require: () => ({ getStatus: () => status }) });
    expect(JSON.parse(stdout.join(''))).toEqual(status);
    expect(stderr).toEqual([]);
    expect(processStub.exitCode).toBe(aligned ? undefined : 1);
  });

  test('matches the hybrid Dammam/Hostinger plan without mutation or deployment authority', () => {
    const topology = loadTopology();
    const hybrid = structuredClone(hybridSource);
    const before = JSON.stringify({ topology, hybrid });
    hybrid.domains.reverse();
    const reordered = JSON.stringify(hybrid);
    expect(checkHybridAlignment(topology, hybrid)).toEqual({ valid: true, errors: [] });
    expect(JSON.stringify(topology)).toBe(JSON.stringify(JSON.parse(before).topology));
    expect(JSON.stringify(hybrid)).toBe(reordered);
    const result = getStatus(topology, { ...context, hybridPlan: hybrid });
    expect(result.hybridArchitecture).toMatchObject({ alignmentValid: true, conflicts: [],
      targetRegion: 'me-central2', dnsAuthority: 'HOSTINGER', hostingMode: 'HYBRID',
      productionHold: true, deployment: 'NOT_VERIFIED' });
    expect(result.execution.productionReady).toBe(false);
  });

  test.each([
    ['repository', t => { t.domains[0].repository = 'sheikha-portal-core'; }, 'DOMAIN_REPOSITORY_CONFLICT'],
    ['redirect', t => { t.domains[7].target = 'https://sheikha.top'; }, 'REDIRECT_TARGET_CONFLICT'],
    ['missing host', t => { t.domains = t.domains.filter(row => row.hostname !== 'sheikha.dev'); }, 'DOMAIN_MISSING_FROM_TOPOLOGY'],
    ['extra host', t => { t.domains.push({ ...t.domains[0], hostname: 'extra.sheikha.top' }); }, 'DOMAIN_MISSING_FROM_HYBRID_PLAN'],
    ['extra repository', t => { t.repositories.push('unassigned-repository'); }, 'REPOSITORY_SET_CONFLICT'],
    ['kind', t => { t.domains[7] = { hostname: 'sheikha.money', group: 'fintech-capital', kind: 'service',
      repository: 'sheikha-portal-core', roleAr: 'fixture' }; }, 'DOMAIN_KIND_CONFLICT']
  ])('reports cross-plan %s drift even when both schemas remain valid', (_name, mutate, code) => {
    const topology = loadTopology(); mutate(topology);
    expect(validateTopology(topology).valid).toBe(true);
    const result = getStatus(topology, { ...context, hybridPlan: hybridSource });
    expect(result.status).toBe('LOCAL_PLAN_CONFLICT_DEPLOYMENT_NOT_VERIFIED');
    expect(result.hybridArchitecture.alignmentValid).toBe(false);
    expect(result.findings.map(item => item.code)).toContain(code);
    expect(result.execution.productionReady).toBe(false);
  });

  test.each([
    ['region', p => { p.targetRegion = 'us-central1'; }],
    ['DNS authority', p => { p.dnsAuthority = 'OTHER'; }],
    ['hold', p => { p.productionHold = false; }],
    ['canary conflation', p => { p.canary.domain = 'sheikha.dev'; }]
  ])('does not report valid alignment with invalid hybrid %s', (_name, mutate) => {
    const hybrid = structuredClone(hybridSource); mutate(hybrid);
    const result = getStatus(loadTopology(), { ...context, hybridPlan: hybrid });
    expect(result.hybridArchitecture).toMatchObject({ alignmentValid: false, targetRegion: null,
      conflicts: [{ code: 'HYBRID_PLAN_INVALID' }], productionHold: true });
  });

  test('malformed plan objects are rejected without reflecting private fields', () => {
    expect(checkHybridAlignment(null, hybridSource)).toEqual({ valid: false, errors: [{ code: 'TOPOLOGY_INVALID' }] });
    for (const hybrid of [null, [], { privateValue: 'private-fixture' }]) {
      const result = checkHybridAlignment(loadTopology(), hybrid);
      expect(result).toEqual({ valid: false, errors: [{ code: 'HYBRID_PLAN_INVALID' }] });
      expect(JSON.stringify(result)).not.toContain('private-fixture');
    }
  });

  test('matches the latest request exactly rather than old attachment redirects', () => {
    const topology = loadTopology();
    expect(validateTopology(topology)).toEqual({ valid: true, errors: [] });
    expect(Object.fromEntries(topology.domains.filter(d => d.kind === 'service').map(d => [d.hostname, d.repository])))
      .toEqual(expectedServices);
    expect(Object.fromEntries(topology.domains.filter(d => d.kind === 'redirect').map(d => [d.hostname, d.target])))
      .toEqual(expectedRedirects);
    expect(getStatus(topology, context).counts).toEqual({ domains: 12, groups: 4, repositories: 4, services: 8, redirects: 4 });
  });

  test.each([
    ['duplicate domain', p => p.domains.push(p.domains[0]), 'DUPLICATE_HOSTNAME'],
    ['unknown group', p => { p.domains[0].group = 'missing'; }, 'UNKNOWN_GROUP'],
    ['unknown repository', p => { p.domains[0].repository = 'missing'; }, 'UNKNOWN_REPOSITORY'],
    ['invalid host', p => { p.domains[0].hostname = 'https://sheikha.top'; }, 'INVALID_HOSTNAME'],
    ['missing group id', p => { delete p.groups[0].id; }, 'INVALID_GROUP'],
    ['duplicate repo', p => p.repositories.push(p.repositories[0]), 'DUPLICATE_REPOSITORY'],
    ['duplicate group', p => p.groups.push(p.groups[0]), 'DUPLICATE_GROUP'],
    ['invalid kind', p => { p.domains[0].kind = 'execute'; }, 'INVALID_DOMAIN_KIND'],
    ['unexpected activation', p => { p.productionReady = true; }, 'UNEXPECTED_TOPOLOGY_FIELD'],
    ['service ambiguity', p => { p.domains[0].target = 'https://sheikha.shop'; }, 'AMBIGUOUS_SERVICE_REDIRECT'],
    ['redirect ambiguity', p => { p.domains[7].repository = 'sheikha-main-portal'; }, 'AMBIGUOUS_REDIRECT_REPOSITORY'],
    ['redirect method', p => { p.domains[7].methods.push('POST'); }, 'INVALID_REDIRECT_POLICY'],
    ['redirect code', p => { p.domains[7].statusCode = 302; }, 'INVALID_REDIRECT_POLICY'],
    ['null domains', p => { p.domains = null; }, 'INVALID_DOMAINS'],
    ['null domain', p => { p.domains[0] = null; }, 'INVALID_HOSTNAME']
  ])('rejects %s', (_name, mutate, code) => {
    const topology = loadTopology();
    mutate(topology);
    const result = validateTopology(topology);
    expect(result.valid).toBe(false);
    expect(result.errors.map(error => error.code)).toContain(code);
  });

  test.each(['http://sheikha.top', '//sheikha.top', 'https://sheikha.top@evil.example',
    'https://sheikha.top:443', 'https://sheikha.top?token=fixture', 'https://sheikha.top/#private',
    'https://sheikha.top/%0d%0aLocation:evil', 'https://sheikha.top/../profile'])('rejects unsafe target %s', target => {
    const topology = loadTopology();
    topology.domains[7].target = target;
    expect(validateTopology(topology).errors.map(error => error.code)).toContain('INVALID_REDIRECT_TARGET');
  });

  test('rejects external targets, redirect chains, and cycles', () => {
    const topology = loadTopology();
    topology.domains[7].target = 'https://external.example';
    expect(validateTopology(topology).errors.map(e => e.code)).toContain('UNREGISTERED_REDIRECT_TARGET');
    topology.domains[7].target = 'https://sheikha.site';
    topology.domains[10].target = 'https://sheikha.money';
    const codes = validateTopology(topology).errors.map(e => e.code);
    expect(codes).toContain('REDIRECT_TARGET_MUST_BE_SERVICE');
    expect(codes).toContain('REDIRECT_CYCLE');
  });

  test('fails closed on malformed or empty configuration', () => {
    for (const value of [null, {}, [], { schemaVersion: 2 }]) {
      expect(validateTopology(value).valid).toBe(false);
      expect(() => getStatus(value, context)).toThrow('MASTER_ARCHITECTURE_TOPOLOGY_INVALID');
    }
  });

  test('reports local gaps without claiming external absence or deployment', () => {
    const status = getStatus(loadTopology(), context);
    expect(status.findings).toHaveLength(4);
    expect(status.findings).toContainEqual({ code: 'TARGET_ROUTE_NOT_DECLARED_LOCALLY', hostname: 'sheikha.me', target: 'https://sheikha.top/profile' });
    expect(status.repositories.filter(r => r.localIntegrationRegistry === 'NOT_REGISTERED')).toHaveLength(3);
    expect(status.evidence).toEqual({ ownership: 'NOT_VERIFIED', dns: 'NOT_CHECKED', tls: 'NOT_CHECKED', deployment: 'NOT_VERIFIED' });
    expect(status.execution.productionReady).toBe(false);
    expect(status.execution.financialOperationsAuthorized).toBe(false);
    expect(status.execution.performsExternalActions).toBe(false);
  });

  test('local declarations can remove local gaps but never authorize production', () => {
    const supplied = structuredClone(context);
    supplied.integrations.repositories = loadTopology().repositories.map(id => ({ id }));
    supplied.registry.canonicalRoutes.push({ route: '/profile' });
    const status = getStatus(loadTopology(), supplied);
    expect(status.findings).toEqual([]);
    expect(status.execution.productionReady).toBe(false);
    expect(status.evidence.deployment).toBe('NOT_VERIFIED');
  });

  test('resolves only declared hostnames without treating a URL or subdomain as authority', () => {
    expect(resolvePlannedHostname('SHEIKHA.MONEY')).toMatchObject({ found: true, applied: false, entry: { target: 'https://sheikha.capital' } });
    expect(resolvePlannedHostname('dev.sheikha.top').reason).toBe('HOSTNAME_NOT_IN_TOPOLOGY');
    expect(resolvePlannedHostname('www.sheikha.top').found).toBe(false);
    for (const value of ['https://sheikha.top', 'sheikha.top:443', 'sheikha.top\r\n', 'sheikha.top\n',
      'sheikha.top.', ' sheikha.top', 'sheikha.top ', ['sheikha.top'], {}, null]) {
      expect(resolvePlannedHostname(value).reason).toBe('INVALID_HOSTNAME');
    }
  });

  test('does not alter the existing route policy, integration registry, or topology', () => {
    const files = ['config/sheikha-site-route-policy-v2.json', 'config/sheikha-repository-integrations-v1.json',
      'config/sheikha-master-architecture-topology-v1.json', 'config/cloud/sheikha-hybrid-domain-plan-v1.json'];
    const read = () => files.map(file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
    const before = read();
    getStatus();
    resolvePlannedHostname('sheikha.me');
    expect(read()).toEqual(before);
  });

  test('V3 exposes the architecture as JSON without installing a redirect', async () => {
    const topology = await request(app).get(`${base}/topology`).set('Host', 'sheikha.money');
    expect(topology.status).toBe(200);
    expect(topology.headers.location).toBeUndefined();
    expect(topology.headers['cache-control']).toBe('no-store');
    expect(topology.body.mode).toBe('PLAN_ONLY');
    expect(topology.body.data.domains).toHaveLength(12);
    const status = await request(app).get(`${base}/status`);
    expect(status.status).toBe(200);
    expect(status.body.data.execution.productionReady).toBe(false);
    expect(status.body.data.hybridArchitecture.alignmentValid).toBe(true);
    for (const [hostname, target] of Object.entries(expectedRedirects)) {
      const result = await request(app).get(`${base}/resolve`).query({ hostname });
      expect(result.status).toBe(200);
      expect(result.body.data.entry).toMatchObject({ target, statusCode: 301 });
      expect(result.body.data.applied).toBe(false);
      expect(result.headers.location).toBeUndefined();
    }
  });

  test('HTTP rejects unknown hosts, injection-shaped input, extra fields, and mutation requests', async () => {
    await request(app).get(`${base}/resolve`).query({ hostname: 'other.example' }).expect(404);
    await request(app).get(`${base}/resolve`).query({ hostname: 'https://sheikha.top' }).expect(400);
    await request(app).get(`${base}/resolve?hostname=sheikha.top&hostname=sheikha.shop`).expect(400);
    await request(app).get(`${base}/resolve`).query({ hostname: 'sheikha.top', apply: 'true' }).expect(400);
    await request(app).get(`${base}/resolve`).expect(400);
    for (const route of ['status', 'topology', 'resolve']) {
      await request(app).post(`${base}/${route}`).send({ activate: true }).expect(404);
    }
  });

  test('coexists with the existing production alias middleware without activating planned redirects', async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const composed = express();
      composed.use('/', require('../routes/site-registry/sheikha-public-route-aliases-v2'));
      composed.use('/api/site-registry/v3', v3Routes);
      for (const hostname of Object.keys(expectedRedirects)) {
        const result = await request(composed).get(`${base}/topology`).set('Host', hostname);
        expect(result.status).toBe(200);
        expect(result.headers.location).toBeUndefined();
        const unmapped = await request(composed).get('/unmapped-topology-probe').set('Host', hostname);
        expect(unmapped.status).toBe(404);
        expect(unmapped.headers.location).toBeUndefined();
      }
      const canonical = await request(composed).get(`${base}/topology`).set('Host', 'www.sheikha.top');
      expect(canonical.status).toBe(308);
      expect(canonical.headers.location).toBe(`https://sheikha.top${base}/topology`);
      const market = await request(composed).get('/market').set('Host', 'sheikha.top');
      expect(market.status).toBe(308);
      expect(market.headers.location).toBe('/market/');
    } finally {
      if (previous === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previous;
    }
  });

  test('HEAD remains read-only and status dependency failure is sanitized', async () => {
    await request(app).head(`${base}/status`).expect(200).expect('Cache-Control', 'no-store');
    const broken = express();
    broken.use(createTopologyRoutes({ status: () => { throw new Error('private-status-fixture'); } }));
    const result = await request(broken).get('/status');
    expect(result.status).toBe(503);
    expect(result.body).toEqual({ ok: false, error: 'TOPOLOGY_UNAVAILABLE' });
    expect(result.headers['cache-control']).toBe('no-store');
    expect(result.text).not.toContain('private-status-fixture');
  });

  test('read failure or malformed plan produces a sanitized 503', async () => {
    for (const load of [() => { throw new Error('private-file-fixture'); }, () => ({})]) {
      const broken = express();
      broken.use(createTopologyRoutes({ load }));
      for (const endpoint of ['/topology', '/status', '/resolve?hostname=sheikha.top']) {
        const result = await request(broken).get(endpoint);
        expect(result.status).toBe(503);
        expect(result.body).toEqual({ ok: false, error: 'TOPOLOGY_UNAVAILABLE' });
        expect(result.text).not.toContain('private-file-fixture');
      }
    }
  });
});
