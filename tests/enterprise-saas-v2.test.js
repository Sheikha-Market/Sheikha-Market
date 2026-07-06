'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const subscriptions = require('../runtime/saas/subscriptions/subscription-manager');
const tenancy = require('../runtime/tenancy/tenant-isolation');
const apiKeys = require('../runtime/security/api-keys/api-key-manager');
const store = require('../runtime/saas/enterprise-v2/store');
const { requireAccess } = require('../runtime/saas/enterprise-v2/rbac');
const { createSheikhaApiClient } = require('../sdk/sheikha-api');

const root = path.join(__dirname, '..');
let temporaryData;
let organization;
let owner;

describe('Sheikha Enterprise SaaS V2 control plane', () => {
  beforeAll(() => {
    temporaryData = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-saas-v2-'));
    process.env.SHEIKHA_SAAS_V2_DATA_DIR = temporaryData;
    owner = {
      actorId: 'founder-owner', role: 'OWNER', trusted: true,
      humanApproved: true, source: 'jest'
    };
    organization = tenancy.createOrganization({
      name: 'Sheikha Test Organization', slug: 'sheikha-test', ownerEmail: 'owner@example.test'
    }, owner);
    owner = { ...owner, tenantId: organization.id };
  });

  afterAll(() => {
    delete process.env.SHEIKHA_SAAS_V2_DATA_DIR;
    fs.rmSync(temporaryData, { recursive: true, force: true });
  });

  test('activates enforced tenant isolation and role boundaries', () => {
    const workspace = tenancy.createWorkspace({ name: 'Operations' }, owner);
    const project = tenancy.createProject({ name: 'Supply Chain', workspaceId: workspace.id }, owner);
    const user = tenancy.addUser({
      actorId: 'operator-1', displayName: 'Operator One', role: 'OPERATOR'
    }, owner);
    const snapshot = tenancy.tenantSnapshot(owner);

    expect(tenancy.status()).toMatchObject({
      system: 'SHEIKHA_TENANT_ISOLATION_V2', status: 'ACTIVE',
      boundaries: { crossTenantAccessDenied: true }
    });
    expect(snapshot.organization.id).toBe(organization.id);
    expect(snapshot.workspaces).toContainEqual(expect.objectContaining({ id: workspace.id }));
    expect(snapshot.projects).toContainEqual(expect.objectContaining({ id: project.id }));
    expect(snapshot.users).toContainEqual(expect.objectContaining({ id: user.id, role: 'OPERATOR' }));
    expect(() => requireAccess(owner, 'tenant:read', 'another-tenant')).toThrow('Cross-tenant');

    const admin = {
      actorId: 'admin-1', role: 'ADMIN', tenantId: organization.id,
      trusted: true, humanApproved: true, source: 'jest'
    };
    expect(() => tenancy.addUser({
      actorId: 'owner-escalation', displayName: 'Escalation', role: 'OWNER'
    }, admin)).toThrow('Only an OWNER');
    expect(() => tenancy.createOrganization({ name: 'Second', slug: 'second' }, owner))
      .toThrow('without an existing tenant');
  });

  test('requires a contract before active subscription and product entitlement', () => {
    expect(() => subscriptions.createSubscription({ plan: 'BUSINESS', activate: true }, owner))
      .toThrow('contract');

    const subscription = subscriptions.createSubscription({
      plan: 'BUSINESS', activate: true, contractApproved: true, contractRef: 'TEST-CONTRACT-001'
    }, owner);
    const seat = subscriptions.addSeat({ subscriptionId: subscription.id, actorId: 'operator-1' }, owner);
    const entitlement = subscriptions.issueProductEntitlement({
      subscriptionId: subscription.id, product: 'SHEIKHA_GOVERNANCE_PLATFORM'
    }, owner);

    expect(subscription.status).toBe('ACTIVE');
    expect(subscription.contractEvidenceStatus).toBe('HUMAN_APPROVED_REFERENCE_NOT_EXTERNALLY_VERIFIED');
    expect(seat.subscriptionId).toBe(subscription.id);
    expect(entitlement.kind).toBe('SOFTWARE_PRODUCT_ENTITLEMENT_NOT_REGULATORY_LICENSE');
    expect(subscriptions.listLicenses(owner).regulatoryLicenseIssuer).toBe(false);
  });

  test('meters usage idempotently and returns an estimate rather than an invoice', () => {
    const operator = {
      actorId: 'operator-1', role: 'OPERATOR', tenantId: organization.id,
      trusted: true, humanApproved: false, source: 'jest'
    };
    const first = subscriptions.recordUsage({
      metric: 'requests', quantity: 1000, idempotencyKey: 'usage-001'
    }, operator);
    const duplicate = subscriptions.recordUsage({
      metric: 'requests', quantity: 1000, idempotencyKey: 'usage-001'
    }, operator);
    const usage = subscriptions.usageStatus(operator);
    const preview = subscriptions.billingPreview(operator);

    expect(duplicate.id).toBe(first.id);
    expect(usage.totals.requests).toBe(1000);
    expect(preview.status).toBe('ESTIMATE_ONLY');
    expect(preview.invoiceIssued).toBe(false);
    expect(preview.paymentCollected).toBe(false);
  });

  test('issues a secret once, stores only a digest, rotates, revokes, and audits', () => {
    const issued = apiKeys.issue({
      name: 'Metering key', purpose: 'Record usage from SDK', role: 'OPERATOR',
      scopes: ['tenant:read', 'usage:record', 'usage:read']
    }, owner);
    const rawState = store.readState();
    const stored = rawState.apiKeys.find(item => item.id === issued.key.id);

    expect(issued.secret).toMatch(/^skh_v2_/);
    expect(stored.secret).toBeUndefined();
    expect(stored.secretHash).toHaveLength(64);
    expect(apiKeys.registry(owner).keys[0].secretHash).toBeUndefined();

    const authenticated = apiKeys.authenticate(issued.secret, 'usage:record');
    expect(authenticated).toMatchObject({ tenantId: organization.id, trusted: true });

    const rotated = apiKeys.rotate(issued.key.id, {}, owner);
    expect(apiKeys.authenticate(issued.secret)).toBeNull();
    expect(apiKeys.authenticate(rotated.secret)).not.toBeNull();
    apiKeys.revoke(rotated.key.id, owner);
    expect(apiKeys.authenticate(rotated.secret)).toBeNull();

    const auditText = fs.readFileSync(path.join(temporaryData, 'audit.jsonl'), 'utf8');
    expect(auditText).toContain('API_KEY_ISSUED');
    expect(auditText).not.toContain(issued.secret);
    expect(auditText).not.toContain(stored.secretHash);
  });

  test('exposes governed runtime routes, SDKs, CLI, and truthful readiness', async () => {
    const routeSource = fs.readFileSync(path.join(root, 'routes/enterprise-saas-v2-routes.js'), 'utf8');
    const serverSource = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const readiness = JSON.parse(fs.readFileSync(
      path.join(root, 'runtime/saas/enterprise-ready/saas-enterprise-readiness.json'), 'utf8'
    ));
    const requests = [];
    const client = createSheikhaApiClient({
      baseUrl: 'https://example.test', tenantId: organization.id,
      fetchImpl: async (url, options) => {
        requests.push({ url, options });
        return { ok: true, status: 200, json: async () => ({ success: true, data: { status: 'ACTIVE' } }) };
      }
    });

    await client.saas.status();
    expect(requests[0].url).toBe('https://example.test/api/saas/v2/status');
    expect(routeSource).toContain("'/api/subscriptions/product-entitlements'");
    expect(routeSource).toContain("'/api/saas/v2/audit'");
    expect(serverSource).toContain("app.use(require('./routes/enterprise-saas-v2-routes'));");
    expect(readiness.layers.tenantIsolation).toBe('ACTIVE_ENFORCED');
    expect(readiness.layers.billing).toBe('ESTIMATE_ONLY_GATEWAY_NOT_CONNECTED');
    expect(fs.existsSync(path.join(root, 'sdk/sheikha-python/sheikha_saas.py'))).toBe(true);
    expect(fs.readFileSync(path.join(root, 'bin/sheikha'), 'utf8')).toContain("'saas-v2'");
  });
});
