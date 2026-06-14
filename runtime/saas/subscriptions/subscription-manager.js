'use strict';

const subscriptionState = Object.freeze({
  system: 'SHEIKHA_SUBSCRIPTION_MANAGER_V1',
  status: 'ACTIVE',
  model: 'MULTI_TENANT_SAAS',
  objects: ['organizations', 'workspaces', 'seats', 'licenses', 'usage', 'billing'],
  tiers: ['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE', 'GOVERNMENT'],
  governance: {
    noLicenseWithoutContract: true,
    noBillingWithoutApproval: true,
    noFalseCustomerClaim: true,
    humanApprovalForHighRisk: true
  }
});

function status() {
  return subscriptionState;
}

function listLicenses() {
  return {
    registry: 'SHEIKHA_LICENSE_REGISTRY_V1',
    status: 'ACTIVE',
    licenses: []
  };
}

function listSeats() {
  return {
    registry: 'SHEIKHA_SEAT_REGISTRY_V1',
    status: 'ACTIVE',
    seats: []
  };
}

function usageStatus() {
  return {
    registry: 'SHEIKHA_USAGE_METER_V1',
    status: 'ACTIVE',
    metering: ['requests', 'tokens', 'runtime-calls', 'extension-calls', 'mcp-calls']
  };
}

module.exports = {
  status,
  listLicenses,
  listSeats,
  usageStatus
};
