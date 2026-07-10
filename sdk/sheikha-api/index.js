'use strict';

function createSheikhaApiClient({
  baseUrl = 'http://localhost:8080',
  token = null,
  apiKey = null,
  actorId = null,
  role = null,
  tenantId = null,
  humanApproved = false,
  fetchImpl = globalThis.fetch
} = {}) {
  const normalizedBase = String(baseUrl).replace(/\/$/, '');

  function headers(extra = {}) {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(apiKey ? { Authorization: `Sheikha ${apiKey}` } : {}),
      ...(actorId ? { 'x-sheikha-actor-id': actorId } : {}),
      ...(role ? { 'x-sheikha-role': role } : {}),
      ...(tenantId ? { 'x-sheikha-tenant-id': tenantId } : {}),
      ...(humanApproved ? { 'x-sheikha-human-approved': 'true' } : {}),
      ...extra
    };
  }

  async function request(path, method = 'GET', body = null, options = {}) {
    if (typeof fetchImpl !== 'function') {
      throw new Error('A Fetch API implementation is required.');
    }
    const response = await fetchImpl(`${normalizedBase}${path}`, {
      method,
      headers: headers(options.headers),
      ...(body === null ? {} : { body: JSON.stringify(body) })
    });
    const payload = await response.json();
    if (!response.ok || payload.success === false) {
      const error = new Error(payload.message || `Sheikha API request failed with ${response.status}.`);
      error.code = payload.error || 'SHEIKHA_API_ERROR';
      error.statusCode = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  const client = {
    name: 'SHEIKHA_API_SDK',
    version: '2.0.0',
    baseUrl: normalizedBase,
    hasToken: Boolean(token),
    hasApiKey: Boolean(apiKey),
    endpoints: [
      '/api/health',
      '/api/runtime/introspection/routes',
      '/api/devops/ai-lab/status',
      '/api/saas/v2/status',
      '/api/tenancy/snapshot',
      '/api/subscriptions/usage',
      '/api/security/api-keys/status',
      '/api/sheikha/runtime-fabric/v5/status',
      '/api/sheikha/runtime-fabric/v5/issues',
      '/api/sheikha/civilization-command/v1/status',
      '/api/sheikha/civilization-command/v1/dashboard',
      '/api/sheikha/civilization-stewardship/v1/status',
      '/api/sheikha/civilization-stewardship/v1/dashboard',
      '/api/sheikha/covenant-governance/v1/status',
      '/api/sheikha/covenant-governance/v1/policies',
      '/api/sheikha/layer-governance/v1/status',
      '/api/sheikha/layer-governance/v1/catalog',
      '/api/sheikha/extension-experience/v1/status',
      '/api/sheikha/vital-chat-apex/v1/status',
      '/api/sheikha/debugging-apex/v1/status',
      '/api/sheikha/chat-interface-apex/v1/status',
      '/api/sheikha/ide-apex/v1/status',
      '/api/sheikha/technical-capability-apex/v1/status',
      '/api/sheikha/streaming-chat-apex/v1/status',
      '/api/sheikha/streaming-chat-apex/v1/stream',
      '/api/sheikha/extension-streaming-artifact-apex/v1/status',
      '/api/sheikha/cloud-production-deployment-apex/v1/status',
      '/api/sheikha/cloud-production-deployment-apex/v1/plan',
      '/api/sheikha/distribution-apex/v1/status',
      '/api/sheikha/distribution-apex/v1/matrix',
      '/api/sheikha/distribution-apex/v1/release-index',
      '/api/sheikha/enterprise-management-os/status'
    ],
    requestDescriptor(path, method = 'GET') {
      return {
        method,
        url: `${normalizedBase}${path}`,
        auth: apiKey ? 'Scoped Sheikha API key configured' : token ? 'Bearer token configured' : 'none',
        tenantId
      };
    },
    request
  };

  client.saas = {
    status: () => request('/api/saas/v2/status'),
    tenantSnapshot: () => request('/api/tenancy/snapshot'),
    createOrganization: input => request('/api/tenancy/organizations', 'POST', input),
    createWorkspace: input => request('/api/tenancy/workspaces', 'POST', input),
    createProject: input => request('/api/tenancy/projects', 'POST', input),
    addUser: input => request('/api/tenancy/users', 'POST', input),
    createSubscription: input => request('/api/subscriptions', 'POST', input),
    addSeat: input => request('/api/subscriptions/seats', 'POST', input),
    issueProductEntitlement: input => request('/api/subscriptions/product-entitlements', 'POST', input),
    recordUsage: input => request('/api/subscriptions/usage', 'POST', input),
    usage: () => request('/api/subscriptions/usage'),
    billingPreview: () => request('/api/subscriptions/billing-preview'),
    apiKeys: () => request('/api/security/api-keys'),
    issueApiKey: input => request('/api/security/api-keys', 'POST', input),
    rotateApiKey: (keyId, input = {}) => request(`/api/security/api-keys/${keyId}/rotate`, 'POST', input),
    revokeApiKey: keyId => request(`/api/security/api-keys/${keyId}/revoke`, 'POST', {}),
    audit: (limit = 100) => request(`/api/saas/v2/audit?limit=${encodeURIComponent(limit)}`)
  };

  client.runtimeFabric = {
    status: () => request('/api/sheikha/runtime-fabric/v5/status'),
    services: () => request('/api/sheikha/runtime-fabric/v5/services'),
    events: (limit = 100) => request(
      `/api/sheikha/runtime-fabric/v5/events?limit=${encodeURIComponent(limit)}`
    ),
    queue: (status = '', limit = 100) => request(
      `/api/sheikha/runtime-fabric/v5/queue?status=${encodeURIComponent(status)}` +
      `&limit=${encodeURIComponent(limit)}`
    ),
    schedules: () => request('/api/sheikha/runtime-fabric/v5/schedules'),
    metrics: () => request('/api/sheikha/runtime-fabric/v5/metrics'),
    cluster: () => request('/api/sheikha/runtime-fabric/v5/cluster'),
    audit: (limit = 100) => request(
      `/api/sheikha/runtime-fabric/v5/audit?limit=${encodeURIComponent(limit)}`
    ),
    submitIssue: input => request('/api/sheikha/runtime-fabric/v5/issues', 'POST', input),
    drain: (input = {}) => request('/api/sheikha/runtime-fabric/v5/workers/drain', 'POST', input),
    createSchedule: input => request('/api/sheikha/runtime-fabric/v5/schedules', 'POST', input),
    tick: () => request('/api/sheikha/runtime-fabric/v5/scheduler/tick', 'POST', {})
  };

  client.civilizationCommand = {
    status: () => request('/api/sheikha/civilization-command/v1/status'),
    references: () => request('/api/sheikha/civilization-command/v1/references'),
    dashboard: () => request('/api/sheikha/civilization-command/v1/dashboard'),
    registry: () => request('/api/sheikha/civilization-command/v1/registry'),
    audit: (limit = 100) => request(
      `/api/sheikha/civilization-command/v1/audit?limit=${encodeURIComponent(limit)}`
    ),
    createPlan: input => request('/api/sheikha/civilization-command/v1/plans', 'POST', input),
    registerRisk: input => request('/api/sheikha/civilization-command/v1/risks', 'POST', input),
    evaluatePlan: planId => request(
      `/api/sheikha/civilization-command/v1/plans/${encodeURIComponent(planId)}/evaluate`,
      'POST',
      {}
    ),
    registerTwin: input => request('/api/sheikha/civilization-command/v1/twins', 'POST', input),
    recordImpact: input => request('/api/sheikha/civilization-command/v1/impacts', 'POST', input),
    dispatchPlan: planId => request(
      `/api/sheikha/civilization-command/v1/plans/${encodeURIComponent(planId)}/dispatch`,
      'POST',
      {}
    )
  };

  client.civilizationStewardship = {
    status: () => request('/api/sheikha/civilization-stewardship/v1/status'),
    dashboard: () => request('/api/sheikha/civilization-stewardship/v1/dashboard'),
    registry: () => request('/api/sheikha/civilization-stewardship/v1/registry'),
    audit: (limit = 100) => request(
      `/api/sheikha/civilization-stewardship/v1/audit?limit=${encodeURIComponent(limit)}`
    ),
    registerMandate: input => request(
      '/api/sheikha/civilization-stewardship/v1/mandates',
      'POST',
      input
    ),
    attachEvidence: (mandateId, input) => request(
      `/api/sheikha/civilization-stewardship/v1/mandates/` +
      `${encodeURIComponent(mandateId)}/evidence`,
      'POST',
      input
    ),
    reviewMandate: mandateId => request(
      `/api/sheikha/civilization-stewardship/v1/mandates/` +
      `${encodeURIComponent(mandateId)}/review`,
      'POST',
      {}
    ),
    ratifyMandate: (mandateId, input = { decision: 'APPROVE' }) => request(
      `/api/sheikha/civilization-stewardship/v1/mandates/` +
      `${encodeURIComponent(mandateId)}/ratify`,
      'POST',
      input
    )
  };

  client.covenantGovernance = {
    status: () => request('/api/sheikha/covenant-governance/v1/status'),
    policies: () => request('/api/sheikha/covenant-governance/v1/policies'),
    registry: () => request('/api/sheikha/covenant-governance/v1/registry'),
    audit: (limit = 100) => request(
      `/api/sheikha/covenant-governance/v1/audit?limit=${encodeURIComponent(limit)}`
    ),
    evaluate: input => request('/api/sheikha/covenant-governance/v1/evaluate', 'POST', input),
    promoteLayer: input => request(
      '/api/sheikha/covenant-governance/v1/promotions',
      'POST',
      input
    )
  };

  client.layerGovernance = {
    status: () => request('/api/sheikha/layer-governance/v1/status'),
    catalog: () => request('/api/sheikha/layer-governance/v1/catalog'),
    registry: () => request('/api/sheikha/layer-governance/v1/registry'),
    audit: (limit = 100) => request(
      `/api/sheikha/layer-governance/v1/audit?limit=${encodeURIComponent(limit)}`
    ),
    assess: input => request('/api/sheikha/layer-governance/v1/assess', 'POST', input),
    propose: input => request('/api/sheikha/layer-governance/v1/proposals', 'POST', input),
    ratify: proposalId => request(
      `/api/sheikha/layer-governance/v1/proposals/${encodeURIComponent(proposalId)}/ratify`,
      'POST',
      {}
    )
  };

  client.extensionExperience = {
    status: () => request('/api/sheikha/extension-experience/v1/status'),
    vitalChatApex: () => request('/api/sheikha/vital-chat-apex/v1/status'),
    debuggingApex: () => request('/api/sheikha/debugging-apex/v1/status'),
    chatInterfaceApex: () => request('/api/sheikha/chat-interface-apex/v1/status'),
    ideApex: () => request('/api/sheikha/ide-apex/v1/status'),
    technicalCapabilityApex: () => request('/api/sheikha/technical-capability-apex/v1/status'),
    computingCognitiveApex: () => request('/api/intelligence/execution-loop/apex/status'),
    streamingChatApex: () => request('/api/sheikha/streaming-chat-apex/v1/status'),
    streamingChat: input => request('/api/sheikha/streaming-chat-apex/v1/chat', 'POST', input),
    extensionStreamingArtifactApex: () => request(
      '/api/sheikha/extension-streaming-artifact-apex/v1/status'
    ),
    cloudProductionDeploymentApex: () => request(
      '/api/sheikha/cloud-production-deployment-apex/v1/status'
    ),
    cloudProductionDeploymentPlan: () => request(
      '/api/sheikha/cloud-production-deployment-apex/v1/plan'
    ),
    enterpriseManagement: () => request('/api/sheikha/enterprise-management-os/status')
  };

  client.distribution = {
    status: () => request('/api/sheikha/distribution-apex/v1/status'),
    matrix: () => request('/api/sheikha/distribution-apex/v1/matrix'),
    releaseIndex: () => request('/api/sheikha/distribution-apex/v1/release-index')
  };

  return client;
}

module.exports = { createSheikhaApiClient };
