'use strict';

const express = require('express');
const subscriptions = require('../runtime/saas/subscriptions/subscription-manager');
const tenancy = require('../runtime/tenancy/tenant-isolation');
const apiKeys = require('../runtime/security/api-keys/api-key-manager');
const store = require('../runtime/saas/enterprise-v2/store');
const { SaaSAccessError } = require('../runtime/saas/enterprise-v2/rbac');
const { governGovernance } = require('../runtime/governance/sheikha-governance-of-governance-v1');
const { orchestrate } = require('../runtime/orchestrator/orchestrator-fabric');

const router = express.Router();
router.use(express.json({ limit: '256kb' }));

function booleanHeader(req, name) {
  return String(req.get(name) || '').toLowerCase() === 'true';
}

function contextFromRequest(req) {
  const humanApproved = booleanHeader(req, 'x-sheikha-human-approved');
  if (req.user?.id && req.user?.role) {
    return {
      actorId: String(req.user.id),
      role: req.user.role,
      tenantId: req.user.tenantId || req.get('x-sheikha-tenant-id') || null,
      trusted: true,
      humanApproved,
      source: 'authenticated-user'
    };
  }

  const authorization = String(req.get('authorization') || '');
  const secret = authorization.match(/^(?:Sheikha|Bearer)\s+(skh_v2_\S+)$/i)?.[1];
  if (secret) {
    const authenticated = apiKeys.authenticate(secret);
    if (authenticated) return authenticated;
  }

  const devHeadersAllowed = process.env.NODE_ENV !== 'production' ||
    process.env.SHEIKHA_ALLOW_DEV_IDENTITY_HEADERS === 'true';
  if (devHeadersAllowed && req.get('x-sheikha-actor-id') && req.get('x-sheikha-role')) {
    return {
      actorId: req.get('x-sheikha-actor-id'),
      role: req.get('x-sheikha-role'),
      tenantId: req.get('x-sheikha-tenant-id') || null,
      trusted: true,
      humanApproved,
      source: 'development-identity-headers'
    };
  }

  throw new SaaSAccessError(
    'AUTHENTICATED_IDENTITY_REQUIRED',
    'Use an authenticated upstream identity or a scoped Sheikha API key.',
    401
  );
}

function governanceFor(req, action, options = {}) {
  const context = contextFromRequest(req);
  const governance = governGovernance({
    actor: context.actorId,
    channel: 'enterprise-saas-v2',
    action,
    message: action
  });
  governance.humanApproved = context.humanApproved;
  if (options.preApprovedPolicy) governance.preApprovedPolicy = options.preApprovedPolicy;
  const orchestration = orchestrate({
    action,
    mutationRequested: true,
    mutationClass: options.mutationClass || 'GOVERNED_WRITE'
  }, governance);
  if (!orchestration.mutationAuthorized) {
    throw new SaaSAccessError(
      'ORCHESTRATOR_MUTATION_DENIED',
      'Orchestrator Fabric denied the write because approval or policy admission is missing.',
      403
    );
  }
  return { context, orchestration };
}

function result(res, data, orchestration = null, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data,
    ...(orchestration ? {
      orchestration: {
        fabric: orchestration.fabric,
        status: orchestration.status,
        apexLevel: orchestration.apexLevel,
        mutationAuthorized: orchestration.mutationAuthorized
      }
    } : {})
  });
}

function route(handler) {
  return (req, res) => {
    try {
      handler(req, res);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.code || 'ENTERPRISE_SAAS_V2_ERROR',
        message: error.message
      });
    }
  };
}

router.get('/api/saas/v2/status', route((_req, res) => result(res, {
  system: 'SHEIKHA_ENTERPRISE_SAAS_V2',
  status: 'ACTIVE',
  controlPlane: 'GOVERNED_MULTI_TENANT_CONTROL_PLANE',
  orchestrator: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2_L11',
  subscriptions: subscriptions.status(),
  tenancy: tenancy.status(),
  apiKeys: apiKeys.status(),
  storage: store.status(),
  externalServices: {
    identityProvider: 'NOT_CONNECTED',
    billingGateway: 'NOT_CONNECTED',
    productionDatabase: 'NOT_CONNECTED'
  }
})));

router.get('/api/subscriptions/status', route((_req, res) => result(res, subscriptions.status())));
router.get('/api/tenancy/status', route((_req, res) => result(res, tenancy.status())));
router.get('/api/security/api-keys/status', route((_req, res) => result(res, apiKeys.status())));

router.get('/api/tenancy/organizations', route((req, res) =>
  result(res, tenancy.organizations(contextFromRequest(req)))));
router.get('/api/tenancy/workspaces', route((req, res) =>
  result(res, tenancy.workspaces(contextFromRequest(req)))));
router.get('/api/tenancy/snapshot', route((req, res) =>
  result(res, tenancy.tenantSnapshot(contextFromRequest(req)))));
router.get('/api/subscriptions/licenses', route((req, res) =>
  result(res, subscriptions.listLicenses(contextFromRequest(req)))));
router.get('/api/subscriptions/seats', route((req, res) =>
  result(res, subscriptions.listSeats(contextFromRequest(req)))));
router.get('/api/subscriptions/usage', route((req, res) =>
  result(res, subscriptions.usageStatus(contextFromRequest(req)))));
router.get('/api/subscriptions/billing-preview', route((req, res) =>
  result(res, subscriptions.billingPreview(contextFromRequest(req)))));
router.get('/api/security/api-keys', route((req, res) =>
  result(res, apiKeys.registry(contextFromRequest(req)))));
router.get('/api/saas/v2/audit', route((req, res) => {
  const context = contextFromRequest(req);
  const { requireAccess } = require('../runtime/saas/enterprise-v2/rbac');
  requireAccess(context, 'audit:read', context.tenantId, { tenantRequired: true });
  result(res, store.readAudit({ tenantId: context.tenantId, limit: req.query.limit }));
}));

router.post('/api/tenancy/organizations', route((req, res) => {
  const admitted = governanceFor(req, 'tenant_organization_create');
  result(res, tenancy.createOrganization(req.body, admitted.context), admitted.orchestration, 201);
}));
router.post('/api/tenancy/workspaces', route((req, res) => {
  const admitted = governanceFor(req, 'tenant_workspace_create');
  result(res, tenancy.createWorkspace(req.body, admitted.context), admitted.orchestration, 201);
}));
router.post('/api/tenancy/projects', route((req, res) => {
  const admitted = governanceFor(req, 'tenant_project_create');
  result(res, tenancy.createProject(req.body, admitted.context), admitted.orchestration, 201);
}));
router.post('/api/tenancy/users', route((req, res) => {
  const admitted = governanceFor(req, 'tenant_user_add');
  result(res, tenancy.addUser(req.body, admitted.context), admitted.orchestration, 201);
}));
router.post('/api/subscriptions', route((req, res) => {
  const admitted = governanceFor(req, 'subscription_create');
  result(res, subscriptions.createSubscription(req.body, admitted.context), admitted.orchestration, 201);
}));
router.post('/api/subscriptions/seats', route((req, res) => {
  const admitted = governanceFor(req, 'subscription_seat_add');
  result(res, subscriptions.addSeat(req.body, admitted.context), admitted.orchestration, 201);
}));
router.post('/api/subscriptions/product-entitlements', route((req, res) => {
  const admitted = governanceFor(req, 'product_entitlement_issue');
  result(res, subscriptions.issueProductEntitlement(req.body, admitted.context), admitted.orchestration, 201);
}));
router.post('/api/subscriptions/usage', route((req, res) => {
  const admitted = governanceFor(req, 'usage_meter_append', {
    mutationClass: 'APPEND_ONLY_TELEMETRY',
    preApprovedPolicy: 'USAGE_METER_APPEND_ONLY'
  });
  result(res, subscriptions.recordUsage(req.body, admitted.context), admitted.orchestration, 201);
}));
router.post('/api/security/api-keys', route((req, res) => {
  const admitted = governanceFor(req, 'api_key_issue');
  result(res, apiKeys.issue(req.body, admitted.context), admitted.orchestration, 201);
}));
router.post('/api/security/api-keys/:keyId/rotate', route((req, res) => {
  const admitted = governanceFor(req, 'api_key_rotate');
  result(res, apiKeys.rotate(req.params.keyId, req.body, admitted.context), admitted.orchestration);
}));
router.post('/api/security/api-keys/:keyId/revoke', route((req, res) => {
  const admitted = governanceFor(req, 'api_key_revoke');
  result(res, apiKeys.revoke(req.params.keyId, admitted.context), admitted.orchestration);
}));

module.exports = router;
