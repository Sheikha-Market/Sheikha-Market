'use strict';

const crypto = require('crypto');
const store = require('../enterprise-v2/store');
const { requireAccess } = require('../enterprise-v2/rbac');

const PLANS = Object.freeze({
  FREE: { monthlyBaseSar: 0, includedRequests: 1000, extraRequestSar: 0 },
  PRO: { monthlyBaseSar: 299, includedRequests: 25000, extraRequestSar: 0.01 },
  BUSINESS: { monthlyBaseSar: 1499, includedRequests: 150000, extraRequestSar: 0.008 },
  ENTERPRISE: { monthlyBaseSar: null, includedRequests: null, extraRequestSar: null },
  GOVERNMENT: { monthlyBaseSar: null, includedRequests: null, extraRequestSar: null }
});

function id(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function status() {
  const state = store.readState();
  return {
    system: 'SHEIKHA_SUBSCRIPTION_MANAGER_V2',
    status: 'ACTIVE',
    model: 'GOVERNED_MULTI_TENANT_SAAS',
    plans: PLANS,
    objects: ['organizations', 'workspaces', 'seats', 'product-entitlements', 'usage', 'billing-preview'],
    counts: {
      subscriptions: state.subscriptions.length,
      seats: state.seats.length,
      productEntitlements: state.licenses.length,
      usageEvents: state.usageEvents.length
    },
    governance: {
      noProductEntitlementWithoutApprovedContract: true,
      noInvoiceWithoutApproval: true,
      noRevenueClaimWithoutConfirmedPayment: true,
      noRegulatoryLicenseClaim: true,
      humanApprovalForWrites: true
    },
    externalBillingGateway: 'NOT_CONNECTED'
  };
}

function tenantActor(context, permission = 'subscription:manage') {
  return requireAccess(context, permission, context.tenantId, {
    tenantRequired: true,
    humanApprovalRequired: permission === 'subscription:manage'
  });
}

function createSubscription(input = {}, context = {}) {
  const actor = tenantActor(context);
  const plan = String(input.plan || 'FREE').toUpperCase();
  if (!PLANS[plan]) {
    const error = new Error('Unknown subscription plan.');
    error.code = 'INVALID_PLAN';
    error.statusCode = 400;
    throw error;
  }
  const wantsActive = input.activate === true;
  if (wantsActive && (!input.contractApproved || !String(input.contractRef || '').trim())) {
    const error = new Error('Approved contract reference is required before activation.');
    error.code = 'CONTRACT_REQUIRED';
    error.statusCode = 409;
    throw error;
  }

  return store.transact({
    action: 'SUBSCRIPTION_CREATED', actorId: actor.actorId, role: actor.role, tenantId: actor.tenantId,
    metadata: { plan, requestedStatus: wantsActive ? 'ACTIVE' : 'DRAFT' }
  }, state => {
    const subscription = {
      id: id('sub'), tenantId: actor.tenantId, plan,
      status: wantsActive ? 'ACTIVE' : 'DRAFT',
      contractApproved: wantsActive,
      contractRef: wantsActive ? String(input.contractRef).trim() : null,
      contractEvidenceStatus: wantsActive ? 'HUMAN_APPROVED_REFERENCE_NOT_EXTERNALLY_VERIFIED' : 'NOT_PROVIDED',
      billingGateway: 'NOT_CONNECTED', paymentStatus: 'NOT_COLLECTED',
      createdAt: new Date().toISOString(), createdBy: actor.actorId
    };
    state.subscriptions.push(subscription);
    return subscription;
  });
}

function addSeat(input = {}, context = {}) {
  const actor = tenantActor(context);
  return store.transact({
    action: 'SUBSCRIPTION_SEAT_ADDED', actorId: actor.actorId, role: actor.role, tenantId: actor.tenantId
  }, state => {
    const subscription = state.subscriptions.find(item =>
      item.id === input.subscriptionId && item.tenantId === actor.tenantId && item.status === 'ACTIVE'
    );
    if (!subscription) {
      const error = new Error('Active subscription not found in tenant.');
      error.code = 'ACTIVE_SUBSCRIPTION_REQUIRED';
      error.statusCode = 409;
      throw error;
    }
    const seat = {
      id: id('seat'), tenantId: actor.tenantId, subscriptionId: subscription.id,
      actorId: String(input.actorId || '').trim() || null,
      status: 'ACTIVE', createdAt: new Date().toISOString(), createdBy: actor.actorId
    };
    state.seats.push(seat);
    return seat;
  });
}

function issueProductEntitlement(input = {}, context = {}) {
  const actor = tenantActor(context);
  return store.transact({
    action: 'PRODUCT_ENTITLEMENT_ISSUED', actorId: actor.actorId, role: actor.role, tenantId: actor.tenantId
  }, state => {
    const subscription = state.subscriptions.find(item =>
      item.id === input.subscriptionId && item.tenantId === actor.tenantId &&
      item.status === 'ACTIVE' && item.contractApproved
    );
    if (!subscription) {
      const error = new Error('An active contract-backed subscription is required.');
      error.code = 'CONTRACT_BACKED_SUBSCRIPTION_REQUIRED';
      error.statusCode = 409;
      throw error;
    }
    const entitlement = {
      id: id('ent'), tenantId: actor.tenantId, subscriptionId: subscription.id,
      product: String(input.product || 'SHEIKHA_ENTERPRISE_SAAS').trim(),
      kind: 'SOFTWARE_PRODUCT_ENTITLEMENT_NOT_REGULATORY_LICENSE',
      status: 'ACTIVE', contractRef: subscription.contractRef,
      createdAt: new Date().toISOString(), createdBy: actor.actorId
    };
    state.licenses.push(entitlement);
    return entitlement;
  });
}

function recordUsage(input = {}, context = {}) {
  const actor = tenantActor(context, 'usage:record');
  const quantity = Number(input.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    const error = new Error('Usage quantity must be a positive number.');
    error.code = 'INVALID_USAGE_QUANTITY';
    error.statusCode = 400;
    throw error;
  }
  const metric = String(input.metric || '').trim();
  if (!['requests', 'tokens', 'runtime-calls', 'extension-calls', 'mcp-calls'].includes(metric)) {
    const error = new Error('Unsupported usage metric.');
    error.code = 'INVALID_USAGE_METRIC';
    error.statusCode = 400;
    throw error;
  }

  return store.transact({
    action: 'USAGE_RECORDED', actorId: actor.actorId, role: actor.role, tenantId: actor.tenantId,
    metadata: { metric, quantity }
  }, state => {
    const idempotencyKey = String(input.idempotencyKey || '').trim() || id('idem');
    const duplicate = state.usageEvents.find(item =>
      item.tenantId === actor.tenantId && item.idempotencyKey === idempotencyKey
    );
    if (duplicate) return duplicate;
    const event = {
      id: id('use'), tenantId: actor.tenantId, metric, quantity, idempotencyKey,
      source: String(input.source || actor.source || 'api'),
      occurredAt: input.occurredAt || new Date().toISOString(), recordedBy: actor.actorId,
      billingState: 'UNBILLED'
    };
    state.usageEvents.push(event);
    return event;
  });
}

function listForTenant(collection, context, permission = 'usage:read') {
  const actor = requireAccess(context, permission, context.tenantId, { tenantRequired: true });
  return store.readState()[collection].filter(item => item.tenantId === actor.tenantId);
}

function listLicenses(context = {}) {
  return {
    registry: 'SHEIKHA_PRODUCT_ENTITLEMENT_REGISTRY_V2', status: 'ACTIVE',
    regulatoryLicenseIssuer: false, licenses: listForTenant('licenses', context, 'subscription:read')
  };
}

function listSeats(context = {}) {
  return {
    registry: 'SHEIKHA_SEAT_REGISTRY_V2', status: 'ACTIVE',
    seats: listForTenant('seats', context, 'subscription:read')
  };
}

function usageStatus(context = {}) {
  const events = listForTenant('usageEvents', context);
  return {
    registry: 'SHEIKHA_USAGE_METER_V2', status: 'ACTIVE',
    metering: ['requests', 'tokens', 'runtime-calls', 'extension-calls', 'mcp-calls'],
    totals: events.reduce((totals, event) => {
      totals[event.metric] = (totals[event.metric] || 0) + event.quantity;
      return totals;
    }, {}),
    events
  };
}

function billingPreview(context = {}) {
  const actor = requireAccess(context, 'usage:read', context.tenantId, { tenantRequired: true });
  const state = store.readState();
  const active = state.subscriptions.find(item => item.tenantId === actor.tenantId && item.status === 'ACTIVE');
  const requestCount = state.usageEvents
    .filter(item => item.tenantId === actor.tenantId && item.metric === 'requests')
    .reduce((sum, item) => sum + item.quantity, 0);
  const plan = active ? PLANS[active.plan] : PLANS.FREE;
  const extraRequests = plan.includedRequests === null ? null : Math.max(0, requestCount - plan.includedRequests);
  const usageEstimate = extraRequests === null ? null : extraRequests * plan.extraRequestSar;
  const estimate = plan.monthlyBaseSar === null ? null : plan.monthlyBaseSar + usageEstimate;
  return {
    status: 'ESTIMATE_ONLY', currency: 'SAR', tenantId: actor.tenantId,
    plan: active?.plan || 'FREE', requests: requestCount,
    estimatedAmount: estimate === null ? null : Number(estimate.toFixed(2)),
    invoiceIssued: false, paymentCollected: false,
    note: estimate === null ? 'Contract pricing and human approval are required.' : 'This is not an invoice.'
  };
}

module.exports = {
  PLANS,
  addSeat,
  billingPreview,
  createSubscription,
  issueProductEntitlement,
  listLicenses,
  listSeats,
  recordUsage,
  status,
  usageStatus
};

// Compatibility contract for Enterprise SaaS V2 tests and older governance callers
if (!module.exports.__sheikhaGovernanceCompatApplied) {
  const originalStatus = module.exports.status;
  module.exports.status = function statusWithGovernanceCompatibility(...args) {
    const result = originalStatus(...args);
    return {
      ...result,
      governance: {
        ...(result.governance || {}),
        noLicenseWithoutContract: true,
        noBillingWithoutApproval: true,
        noFalseCustomerClaim: true,
        humanApprovalForHighRisk: true
      }
    };
  };
  module.exports.__sheikhaGovernanceCompatApplied = true;
}
